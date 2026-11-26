import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Monitor,
  Smartphone,
  Plus,
  Trash2,
  Check,
  Sparkles,
  Upload,
  Database,
  Lock,
  PanelLeft,
  MoreHorizontal,
  Code2,
  BookOpen,
  Keyboard,
  HelpCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  ProjectBlockItem,
  SiteSection,
  SectionType,
  WorkExperienceBlockItem,
} from '../../types/cms';
import { SECTION_REGISTRY, DEFAULT_SECTIONS } from '../../lib/sectionRegistry';
import { normalizeThemeSections } from '../../lib/themeUtils';
import { StorageFolder, uploadPortfolioFile } from '../../lib/storage';
import { BlockListEditor } from '../../components/admin/BlockListEditor';
import { LEGACY_WORK_EXPERIENCES } from '../../data/LegacyWorkExperiences';
import { LEGACY_PROJECTS } from '../../data/LegacyProjects';

const DEFAULT_ABOUT_GREETING = "Hi, I'm Diaz";
const DEFAULT_ABOUT_BIO =
  'Network Engineer with a 5+ year background in Digital Marketing Agencies, managing Shopify platforms for major brands like Atmos Indonesia, Persebaya Store, Woodka Watch, and 15+ client projects. Now leveraging strong technical and problem-solving skills into enterprise network engineering. Hands-on experience at Digiserve by Telkom Indonesia delivering large-scale SD-WAN configurations for PT Indomarco Prismatama, including leading Phase 2 rollout across Greater Bandung, Sumedang, and Sukabumi. Bringing strong TCP/IP fundamentals and high field adaptability to ISP operations.';

type SidebarView = 'list' | 'add' | 'inspect';

export default function CustomizeSite() {
  const [searchParams] = useSearchParams();
  const themeId = searchParams.get('themeId');

  const [themeName, setThemeName] = useState('Tamdev Portfolio');
  const [isThemeLive, setIsThemeLive] = useState(true);
  const [sections, setSections] = useState<SiteSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [tableMissing, setTableMissing] = useState(false);

  const [sidebarView, setSidebarView] = useState<SidebarView>('list');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    document.title = 'Customize Site | Tamdev CMS';
    fetchSections();
  }, []);

  useEffect(() => {
    if (!moreMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [moreMenuOpen]);

  // Sync sections & selection to preview iframe
  const postPreviewUpdate = (nextSections: SiteSection[], nextSelectedId: string | null) => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: 'TAMDEV_PREVIEW_UPDATE',
        sections: nextSections,
        selectedId: nextSelectedId,
      },
      window.location.origin
    );
  };

  useEffect(() => {
    postPreviewUpdate(sections, selectedId);
  }, [sections, selectedId]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'TAMDEV_PREVIEW_READY') {
        postPreviewUpdate(sections, selectedId);
      } else if (event.data?.type === 'TAMDEV_PREVIEW_SELECT' && event.data.id) {
        setSelectedId(event.data.id);
        setSidebarView('inspect');
        setSidebarOpen(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [sections, selectedId]);

  const fetchSections = async () => {
    setLoading(true);

    // 1. Try loading from site_themes first
    const themeQuery = themeId
      ? supabase.from('site_themes').select('*').eq('id', themeId).single()
      : supabase.from('site_themes').select('*').eq('is_live', true).single();

    const { data: themeData, error: themeError } = await themeQuery;

    if (!themeError && themeData) {
      setTableMissing(false);
      setThemeName(themeData.name);
      setIsThemeLive(themeData.is_live);
      const rawSections =
        Array.isArray(themeData.sections) && themeData.sections.length > 0
          ? themeData.sections
          : DEFAULT_SECTIONS;
      setSections(normalizeThemeSections(rawSections));
      setLoading(false);
      return;
    }

    // 2. Fallback to site_sections or DEFAULT_SECTIONS
    const { data, error } = await supabase
      .from('site_sections')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      setTableMissing(true);
      setSections(normalizeThemeSections(DEFAULT_SECTIONS));
    } else if (data && data.length > 0) {
      setTableMissing(false);
      setSections(normalizeThemeSections(data));
    } else {
      setTableMissing(false);
      setSections(normalizeThemeSections(DEFAULT_SECTIONS));
    }
    setLoading(false);
  };

  const selectedSection = sections.find((s) => s.id === selectedId) || null;
  const hasDraftChanges = sections.some((s) => s.has_unpublished_changes);

  const showToast = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 2500);
  };

  const handleMove = (id: string, direction: -1 | 1) => {
    const header = sections.find((s) => s.type === 'header');
    const copyright = sections.find((s) => s.type === 'copyright');
    const middle = sections.filter((s) => s.type !== 'header' && s.type !== 'copyright');
    const index = middle.findIndex((s) => s.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= middle.length) return;

    const nextMiddle = [...middle];
    const [moved] = nextMiddle.splice(index, 1);
    nextMiddle.splice(target, 0, moved);

    const reordered = [
      ...(header ? [header] : []),
      ...nextMiddle,
      ...(copyright ? [copyright] : []),
    ].map((s, i) => ({
      ...s,
      sort_order: i,
      has_unpublished_changes: true,
    }));
    setSections(reordered);
  };

  const handleToggleVisibility = (id: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, is_visible: !s.is_visible, has_unpublished_changes: true }
          : s
      )
    );
  };

  const handleAddSection = (type: SectionType) => {
    const def = SECTION_REGISTRY[type];
    if (def.isStatic) return;
    const uniqueSuffix = Math.floor(Math.random() * 1000);
    const newSection: SiteSection = {
      id: `temp-${Date.now()}-${uniqueSuffix}`,
      type,
      nav_label: def.defaultNavLabel,
      anchor_id:
        sections.some((s) => s.anchor_id === def.defaultAnchorId)
          ? `${def.defaultAnchorId}-${uniqueSuffix}`
          : def.defaultAnchorId,
      show_in_nav: true,
      is_visible: true,
      sort_order: sections.length,
      draft_settings: { ...def.defaultSettings },
      published_settings: { ...def.defaultSettings },
      has_unpublished_changes: true,
    };

    setSections((prev) => normalizeThemeSections([...prev, newSection]));
    setSelectedId(newSection.id);
    setSidebarView('inspect');
  };

  const handleRemoveSection = (id: string) => {
    const target = sections.find((s) => s.id === id);
    if (target && SECTION_REGISTRY[target.type]?.isStatic) return;
    setSections((prev) =>
      prev
        .filter((s) => s.id !== id)
        .map((s, i) => ({ ...s, sort_order: i, has_unpublished_changes: true }))
    );
    if (selectedId === id) {
      setSelectedId(null);
      setSidebarView('list');
    }
  };

  const updateSelected = (patch: Partial<SiteSection>) => {
    if (!selectedId) return;
    setSections((prev) =>
      prev.map((s) =>
        s.id === selectedId ? { ...s, ...patch, has_unpublished_changes: true } : s
      )
    );
  };

  const updateSelectedSetting = (key: string, value: unknown) => {
    if (!selectedId) return;
    setSections((prev) =>
      prev.map((s) =>
        s.id === selectedId
          ? {
              ...s,
              draft_settings: { ...s.draft_settings, [key]: value },
              has_unpublished_changes: true,
            }
          : s
      )
    );
  };

  const handleUploadFieldFile = async (
    fieldKey: string,
    folder: StorageFolder,
    file: File | undefined
  ) => {
    if (!file) return;
    setUploadingField(fieldKey);
    try {
      const url = await uploadPortfolioFile(file, folder);
      updateSelectedSetting(fieldKey, url);
      showToast('File uploaded!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload file';
      alert(msg);
    } finally {
      setUploadingField(null);
    }
  };

  const handleSeedFromCms = async () => {
    if (!selectedSection) return;
    setSeeding(true);
    try {
      const sectionType = selectedSection.type;
      let nextDraftPatch: Record<string, unknown> = {};

      if (sectionType === 'header') {
        const { data } = await supabase
          .from('site_profile')
          .select('resume_pdf_url')
          .eq('id', 1)
          .single();
        if (data?.resume_pdf_url) {
          nextDraftPatch = { resumePdfUrl: data.resume_pdf_url };
        } else {
          showToast('No legacy resume URL found in Profile.');
          setSeeding(false);
          return;
        }
      } else if (sectionType === 'about') {
        const { data } = await supabase
          .from('site_profile')
          .select('subheadline, bio, profile_image_url')
          .eq('id', 1)
          .single();
        nextDraftPatch = {
          subheadline: data?.subheadline || DEFAULT_ABOUT_GREETING,
          bio: data?.bio || DEFAULT_ABOUT_BIO,
          profileImageUrl: data?.profile_image_url || '',
        };
      } else if (sectionType === 'background') {
        const { data, error } = await supabase
          .from('work_experiences')
          .select('*')
          .order('sort_order', { ascending: true });

        const rows = !error && data && data.length > 0 ? data : LEGACY_WORK_EXPERIENCES;
        const mapped: WorkExperienceBlockItem[] = rows.map((row, idx) => ({
          id: 'id' in row && typeof row.id === 'string' ? row.id : `exp-seed-${Date.now()}-${idx}`,
          company: row.company,
          role: row.role,
          period: row.period,
          city: row.city || '',
          description: row.description,
          is_active: row.is_active ?? true,
        }));
        nextDraftPatch = { items: mapped };
      } else if (sectionType === 'work') {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('sort_order', { ascending: true });

        let mapped: ProjectBlockItem[];
        if (!error && data && data.length > 0) {
          mapped = data.map((row, idx) => ({
            id: typeof row.id === 'string' ? row.id : `proj-seed-${Date.now()}-${idx}`,
            title: row.title || '',
            category: row.category || '',
            description: row.description || '',
            thumbnail_url: row.thumbnail_url || '',
            live_url: row.live_url ?? null,
            repo_url: row.repo_url ?? null,
            tech_stack: Array.isArray(row.tech_stack) ? row.tech_stack : [],
            is_published: row.is_published ?? true,
          }));
        } else {
          mapped = LEGACY_PROJECTS.map((row, idx) => ({
            id: `proj-legacy-${Date.now()}-${idx}`,
            title: row.title,
            category: row.category,
            description: row.description,
            thumbnail_url: row.image,
            live_url: row.live_url,
            repo_url: row.repo_url,
            tech_stack: row.technologies,
            is_published: true,
          }));
        }
        nextDraftPatch = { items: mapped };
      }

      setSections((prev) =>
        prev.map((s) =>
          s.id === selectedSection.id
            ? {
                ...s,
                draft_settings: { ...s.draft_settings, ...nextDraftPatch },
                has_unpublished_changes: true,
              }
            : s
        )
      );
      showToast('Seeded from existing CMS data!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to seed CMS data';
      alert(msg);
    } finally {
      setSeeding(false);
    }
  };

  const persistSections = async (publish: boolean) => {
    if (tableMissing) {
      alert('Please run supabase/migrations/20261125_create_site_themes.sql in Supabase first.');
      return;
    }

    publish ? setPublishing(true) : setSaving(true);

    try {
      const normalized = normalizeThemeSections(sections).map((s, i) => ({
        ...s,
        sort_order: i,
        published_settings: publish ? s.draft_settings : s.published_settings,
        has_unpublished_changes: publish ? false : s.has_unpublished_changes,
      }));

      // Save to site_themes if themeId is present (or live theme exists)
      if (themeId) {
        if (publish) {
          await supabase.from('site_themes').update({ is_live: false }).neq('id', themeId);
        }
        const { error } = await supabase
          .from('site_themes')
          .update({
            sections: normalized,
            ...(publish ? { is_live: true } : {}),
            updated_at: new Date().toISOString(),
          })
          .eq('id', themeId);

        if (error) throw error;
        if (publish) setIsThemeLive(true);
      } else {
        // Fallback: save to site_sections
        const { data: existingRows } = await supabase.from('site_sections').select('id');
        const existingIds = new Set((existingRows || []).map((r: { id: string }) => r.id));
        const currentIds = new Set(normalized.map((s) => s.id));

        for (const id of existingIds) {
          if (!currentIds.has(id)) {
            await supabase.from('site_sections').delete().eq('id', id);
          }
        }

        for (let i = 0; i < normalized.length; i++) {
          const s = normalized[i];
          const isTemp = s.id.startsWith('temp-') || s.id.startsWith('default-');
          const payload = {
            type: s.type,
            nav_label: s.nav_label,
            anchor_id: s.anchor_id,
            show_in_nav: s.show_in_nav,
            is_visible: s.is_visible,
            sort_order: i,
            draft_settings: s.draft_settings,
            published_settings: s.published_settings,
            has_unpublished_changes: s.has_unpublished_changes,
            updated_at: new Date().toISOString(),
          };

          if (isTemp) {
            const { error } = await supabase.from('site_sections').insert([payload]);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('site_sections')
              .update(payload)
              .eq('id', s.id);
            if (error) throw error;
          }
        }
      }

      await fetchSections();
      showToast(publish ? 'Published to live site!' : 'Changes saved!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save changes';
      alert(msg);
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  const portfolioDefs = Object.values(SECTION_REGISTRY).filter(
    (d) => !d.isStatic && d.category === 'portfolio'
  );
  const customDefs = Object.values(SECTION_REGISTRY).filter(
    (d) => !d.isStatic && d.category === 'custom'
  );

  const headerSection = sections.find((s) => s.type === 'header');
  const copyrightSection = sections.find((s) => s.type === 'copyright');
  const middleSections = sections.filter(
    (s) => s.type !== 'header' && s.type !== 'copyright'
  );

  return (
    <div className="h-screen flex flex-col bg-neutral-950 text-neutral-100 overflow-hidden">
      {/* Top Shopify-style Customizer Bar */}
      <header className="h-14 shrink-0 border-b border-neutral-800 bg-neutral-900 px-3 md:px-4 flex items-center justify-between gap-2 md:gap-4">
        {/* Left: Back to Themes + Sidebar Toggle + (Mobile) 2-line Theme Name & Status */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              to="/admin/customize"
              title="Back to Themes"
              aria-label="Back to Themes"
              className="h-8 w-8 md:w-auto md:px-3 inline-flex items-center justify-center gap-1.5 text-xs text-neutral-300 hover:text-white rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 transition"
            >
              <ArrowLeft size={15} />
              <span className="hidden md:inline">Back to Themes</span>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label={sidebarOpen ? 'Hide section sidebar' : 'Show section sidebar'}
              aria-pressed={sidebarOpen}
              title={sidebarOpen ? 'Hide section sidebar' : 'Show section sidebar'}
              className={`h-8 w-8 inline-flex items-center justify-center rounded-lg border transition ${
                sidebarOpen
                  ? 'bg-orange-500/15 text-orange-400 border-orange-500/30 hover:bg-orange-500/25'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white hover:bg-neutral-700'
              }`}
            >
              <PanelLeft size={15} />
            </button>
          </div>

          {/* Mobile 2-line theme name + status */}
          <div className="flex md:hidden flex-col justify-center min-w-0 leading-tight">
            <span className="font-semibold text-xs text-orange-500 tracking-tight truncate max-w-[135px]">
              {themeName}
            </span>
            <span
              className={`mt-0.5 w-fit text-[10px] leading-none px-1.5 py-0.5 rounded-full border ${
                !isThemeLive || hasDraftChanges
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}
            >
              {isThemeLive ? (hasDraftChanges ? 'Unsaved' : 'Live') : 'Draft'}
            </span>
          </div>
        </div>

        {/* Center (Desktop): Active Theme Name + Status */}
        <div className="hidden md:flex items-center justify-center gap-2.5 min-w-0">
          <span className="font-bold text-sm text-orange-500 tracking-tight truncate max-w-[220px]">
            {themeName}
          </span>
          <span
            className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border ${
              !isThemeLive || hasDraftChanges
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}
          >
            {isThemeLive ? (hasDraftChanges ? 'Unsaved' : 'Live') : 'Draft'}
          </span>
          {statusMsg && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 shrink-0">
              <Check size={13} /> {statusMsg}
            </span>
          )}
        </div>

        {/* Right: (Desktop) Viewport Switcher + Save Draft, (All) Theme Options + Publish */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:inline-flex h-8 items-center bg-neutral-800 rounded-lg p-0.5 border border-neutral-700 shrink-0">
            <button
              type="button"
              onClick={() => setPreviewMode('desktop')}
              className={`h-7 w-7 inline-flex items-center justify-center rounded-md transition ${
                previewMode === 'desktop'
                  ? 'bg-neutral-700 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Desktop Preview"
              aria-label="Desktop Preview"
            >
              <Monitor size={14} />
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('mobile')}
              className={`h-7 w-7 inline-flex items-center justify-center rounded-md transition ${
                previewMode === 'mobile'
                  ? 'bg-neutral-700 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Mobile Preview"
              aria-label="Mobile Preview"
            >
              <Smartphone size={14} />
            </button>
          </div>

          {/* <button
            type="button"
            onClick={() => persistSections(false)}
            disabled={saving || publishing}
            className="hidden md:inline-flex h-8 px-3 items-center justify-center text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 disabled:opacity-50 transition"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button> */}
            {/* Theme Options Dropdown */}
            <div className="relative" ref={moreMenuRef}>
              <button
                type="button"
                onClick={() => setMoreMenuOpen((prev) => !prev)}
                aria-label="Theme options"
                aria-expanded={moreMenuOpen}
                title="Theme options"
                className={`h-8 w-8 inline-flex items-center justify-center rounded-lg border transition ${
                  moreMenuOpen
                    ? 'bg-neutral-700 text-white border-neutral-600'
                    : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white hover:bg-neutral-700'
                }`}
              >
                <MoreHorizontal size={15} />
              </button>

              {moreMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-60 rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl py-1.5 z-50 text-xs text-neutral-200"
                >
                  <button
                    type="button"
                    role="menuitem"
                    disabled={saving || publishing}
                    onClick={() => {
                      setMoreMenuOpen(false);
                      persistSections(false);
                    }}
                    className="md:hidden w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-neutral-800 disabled:opacity-50 transition text-left text-orange-400 font-medium"
                  >
                    <Check size={14} className="shrink-0" />
                    <span>{saving ? 'Saving...' : 'Save Draft'}</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      setSidebarOpen(true);
                      setSidebarView('list');
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-neutral-800 transition text-left"
                  >
                    <Code2 size={14} className="text-neutral-400 shrink-0" />
                    <span>Edit sections</span>
                  </button>
                  <Link
                    to="/admin/socials"
                    role="menuitem"
                    onClick={() => setMoreMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-neutral-800 transition text-left"
                  >
                    <Database size={14} className="text-neutral-400 shrink-0" />
                    <span>Edit default theme content</span>
                  </Link>
                  <a
                    href={themeId ? `/?previewThemeId=${themeId}` : '/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                    onClick={() => setMoreMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-neutral-800 transition text-left"
                  >
                    <Eye size={14} className="text-neutral-400 shrink-0" />
                    <span>View</span>
                  </a>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      setStatusMsg('Shortcuts: Esc closes menus');
                      setTimeout(() => setStatusMsg(null), 3000);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-neutral-800 transition text-left"
                  >
                    <Keyboard size={14} className="text-neutral-400 shrink-0" />
                    <span>Keyboard shortcuts</span>
                  </button>
                  <Link
                    to="/admin/customize"
                    role="menuitem"
                    onClick={() => setMoreMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-neutral-800 transition text-left"
                  >
                    <BookOpen size={14} className="text-neutral-400 shrink-0" />
                    <span>Manage themes</span>
                  </Link>
                  <a
                    href="mailto:diaz@tamdev.id?subject=Tamdev%20CMS%20Support"
                    role="menuitem"
                    onClick={() => setMoreMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-neutral-800 transition text-left"
                  >
                    <HelpCircle size={14} className="text-neutral-400 shrink-0" />
                    <span>Get support</span>
                  </a>

                  <div className="mt-1.5 pt-2 px-3.5 pb-1 border-t border-neutral-800">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-semibold text-white truncate">{themeName}</span>
                      <span className="text-[11px] text-neutral-500">v1.2</span>
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      Developed by Tamdev
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => persistSections(true)}
              disabled={saving || publishing}
              className="h-8 px-3 md:px-4 inline-flex items-center justify-center text-xs font-semibold rounded-lg bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 transition"
            >
              {publishing ? 'Publishing...' : 'Publish'}
            </button>
        </div>
      </header>

      {tableMissing && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-300">
          Database table <code className="font-mono">site_sections</code> not found yet — previewing defaults. Run{' '}
          <code className="font-mono">supabase/migrations/20261125_create_site_sections.sql</code> to enable saving.
        </div>
      )}

      {/* Main Split-Screen Body */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Mobile backdrop when sidebar open */}
        <div
          className={`absolute inset-0 bg-black/50 z-20 md:hidden transition-opacity duration-300 ease-out ${
            sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />

        {/* Left Sidebar */}
        <aside
          aria-hidden={!sidebarOpen}
          className={`absolute inset-y-0 left-0 z-30 md:static md:z-auto shrink-0 bg-neutral-900 overflow-hidden transition-all duration-300 ease-out ${
            sidebarOpen
              ? 'w-80 max-w-[85vw] translate-x-0 opacity-100 border-r border-neutral-800 md:w-80'
              : 'w-80 max-w-[85vw] -translate-x-full opacity-0 pointer-events-none border-r-0 md:w-0 md:translate-x-0'
          }`}
        >
          <div className="w-80 max-w-[85vw] h-full flex flex-col overflow-y-auto">
          {sidebarView === 'list' && (
            <div className="p-4 space-y-5">
              {loading ? (
                <p className="text-xs text-neutral-500">Loading sections...</p>
              ) : (
                <>
                  {/* Top Pinned Static Header */}
                  {headerSection && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                        Static Header
                      </span>
                      <div
                        onClick={() => {
                          setSelectedId(headerSection.id);
                          setSidebarView('inspect');
                        }}
                        className="group flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border bg-neutral-800/40 border-neutral-800 hover:border-orange-500/60 transition cursor-pointer"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                            <Lock size={11} className="text-orange-400 shrink-0" />
                            <span>{SECTION_REGISTRY.header.name}</span>
                          </div>
                          <div className="text-[10px] text-neutral-400 truncate">
                            Pinned top navigation bar
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Middle Reorderable Sections */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                        Sections ({middleSections.length})
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {middleSections.map((sec, idx) => {
                        const def = SECTION_REGISTRY[sec.type];
                        return (
                          <div
                            key={sec.id}
                            className={`group flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border transition cursor-pointer ${
                              sec.is_visible
                                ? 'bg-neutral-800/60 border-neutral-800 hover:border-neutral-700'
                                : 'bg-neutral-900/40 border-neutral-800/60 opacity-55'
                            }`}
                            onClick={() => {
                              setSelectedId(sec.id);
                              setSidebarView('inspect');
                            }}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-white truncate">
                                {sec.nav_label || def?.name}
                              </div>
                              <div className="text-[10px] text-neutral-400 truncate">
                                {def?.name} · #{sec.anchor_id}
                              </div>
                            </div>

                            <div
                              className="flex items-center gap-0.5 shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => handleMove(sec.id, -1)}
                                disabled={idx === 0}
                                className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-700 disabled:opacity-30"
                                title="Move Up"
                              >
                                <ArrowUp size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMove(sec.id, 1)}
                                disabled={idx === middleSections.length - 1}
                                className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-700 disabled:opacity-30"
                                title="Move Down"
                              >
                                <ArrowDown size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleVisibility(sec.id)}
                                className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-700"
                                title={sec.is_visible ? 'Hide section' : 'Show section'}
                              >
                                {sec.is_visible ? <Eye size={13} /> : <EyeOff size={13} />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveSection(sec.id)}
                                className="p-1 rounded text-neutral-400 hover:text-red-400 hover:bg-neutral-700"
                                title="Delete section"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSidebarView('add')}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-neutral-700 hover:border-orange-500 text-xs font-semibold text-orange-400 hover:text-orange-300 hover:bg-orange-500/5 transition"
                    >
                      <Plus size={14} />
                      Add Section
                    </button>
                  </div>

                  {/* Bottom Pinned Static Copyright */}
                  {copyrightSection && (
                    <div className="space-y-1.5 pt-2 border-t border-neutral-800/80">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                        Static Copyright
                      </span>
                      <div
                        onClick={() => {
                          setSelectedId(copyrightSection.id);
                          setSidebarView('inspect');
                        }}
                        className={`group flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border transition cursor-pointer ${
                          copyrightSection.is_visible
                            ? 'bg-neutral-800/40 border-neutral-800 hover:border-orange-500/60'
                            : 'bg-neutral-900/40 border-neutral-800/60 opacity-55'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                            <Lock size={11} className="text-orange-400 shrink-0" />
                            <span>{SECTION_REGISTRY.copyright.name}</span>
                          </div>
                          <div className="text-[10px] text-neutral-400 truncate">
                            Pinned bottom footer
                          </div>
                        </div>

                        <div
                          className="flex items-center gap-1 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleVisibility(copyrightSection.id)}
                            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-700"
                            title={copyrightSection.is_visible ? 'Hide footer' : 'Show footer'}
                          >
                            {copyrightSection.is_visible ? (
                              <Eye size={13} />
                            ) : (
                              <EyeOff size={13} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {sidebarView === 'add' && (
            <div className="p-4 space-y-5">
              <button
                type="button"
                onClick={() => setSidebarView('list')}
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white"
              >
                <ArrowLeft size={13} /> Back to Sections
              </button>

              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                  Custom Blocks
                </h3>
                <div className="space-y-2">
                  {customDefs.map((def) => (
                    <button
                      key={def.type}
                      type="button"
                      onClick={() => handleAddSection(def.type)}
                      className="w-full text-left p-3 rounded-xl bg-neutral-800/70 border border-neutral-700/70 hover:border-orange-500 transition"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                        <Sparkles size={12} className="text-orange-400" />
                        {def.name}
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1">{def.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                  Portfolio Sections
                </h3>
                <div className="space-y-2">
                  {portfolioDefs.map((def) => (
                    <button
                      key={def.type}
                      type="button"
                      onClick={() => handleAddSection(def.type)}
                      className="w-full text-left p-3 rounded-xl bg-neutral-800/50 border border-neutral-800 hover:border-orange-500 transition"
                    >
                      <div className="text-xs font-semibold text-white">{def.name}</div>
                      <p className="text-[11px] text-neutral-400 mt-1">{def.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {sidebarView === 'inspect' && selectedSection && (() => {
            const selectedDef = SECTION_REGISTRY[selectedSection.type];
            const isStatic = Boolean(selectedDef?.isStatic);
            const canSeedFromCms = ['about', 'background', 'work', 'header'].includes(
              selectedSection.type
            );

            return (
              <div className="p-4 space-y-5">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <button
                    type="button"
                    onClick={() => setSidebarView('list')}
                    className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white"
                  >
                    <ArrowLeft size={13} /> Sections
                  </button>
                  <span className="text-xs font-semibold text-orange-400">
                    {selectedDef?.name}
                  </span>
                </div>

                {/* Seed from existing CMS data */}
                {canSeedFromCms && (
                  <div className="rounded-lg border border-neutral-800 bg-neutral-800/40 p-3 space-y-2">
                    <p className="text-[11px] text-neutral-400">
                      Populate this section from existing CMS tables or legacy defaults.
                    </p>
                    <button
                      type="button"
                      onClick={handleSeedFromCms}
                      disabled={seeding}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-medium text-orange-300 disabled:opacity-50 transition"
                    >
                      <Database size={13} />
                      {seeding ? 'Seeding...' : 'Seed from existing CMS data'}
                    </button>
                  </div>
                )}

                {/* Menu & Visibility */}
                {(!isStatic || selectedSection.type === 'copyright' || selectedSection.type === 'header') && (
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                      {isStatic ? 'Visibility' : 'Menu & Visibility'}
                    </h4>

                    {!isStatic && (
                      <>
                        <div>
                          <label className="block text-xs text-neutral-400 mb-1">
                            Nav Menu Label
                          </label>
                          <input
                            type="text"
                            value={selectedSection.nav_label}
                            onChange={(e) => updateSelected({ nav_label: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-white focus:outline-none focus:border-orange-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-neutral-400 mb-1">
                            Anchor ID
                          </label>
                          <input
                            type="text"
                            value={selectedSection.anchor_id}
                            onChange={(e) =>
                              updateSelected({
                                anchor_id: e.target.value
                                  .toLowerCase()
                                  .replace(/[^a-z0-9-_]/g, ''),
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                          />
                        </div>

                        <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedSection.show_in_nav}
                            onChange={(e) =>
                              updateSelected({ show_in_nav: e.target.checked })
                            }
                            className="rounded accent-orange-600"
                          />
                          Show in Navigation Menu
                        </label>
                      </>
                    )}

                    <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSection.is_visible}
                        onChange={(e) => updateSelected({ is_visible: e.target.checked })}
                        className="rounded accent-orange-600"
                      />
                      Visible on Page
                    </label>
                  </div>
                )}

                {/* Schema-driven Content Fields */}
                {selectedDef?.fields.length > 0 && (
                  <div className="space-y-3 border-t border-neutral-800 pt-4">
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                      Section Settings
                    </h4>

                    {selectedDef.fields.map((field) => {
                      const val =
                        selectedSection.draft_settings[field.key] ??
                        selectedDef.defaultSettings[field.key] ??
                        (field.type === 'block_list' ? [] : '');

                      if (field.type === 'toggle') {
                        return (
                          <label
                            key={field.key}
                            className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={Boolean(val)}
                              onChange={(e) =>
                                updateSelectedSetting(field.key, e.target.checked)
                              }
                              className="rounded accent-orange-600"
                            />
                            {field.label}
                          </label>
                        );
                      }

                      if (field.type === 'select') {
                        return (
                          <div key={field.key}>
                            <label className="block text-xs text-neutral-400 mb-1">
                              {field.label}
                            </label>
                            <select
                              value={String(val)}
                              onChange={(e) =>
                                updateSelectedSetting(field.key, e.target.value)
                              }
                              className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-white focus:outline-none focus:border-orange-500"
                            >
                              {(field.options || []).map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      }

                      if (field.type === 'range') {
                        const min = field.min ?? 16;
                        const max = field.max ?? 64;
                        const step = field.step ?? 2;
                        const numVal = Number(val) || min;
                        return (
                          <div key={field.key} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs text-neutral-400">
                                {field.label}
                              </label>
                              <span className="text-xs font-mono text-orange-400">
                                {numVal}
                                {field.unit || ''}
                              </span>
                            </div>
                            <input
                              type="range"
                              min={min}
                              max={max}
                              step={step}
                              value={numVal}
                              onChange={(e) =>
                                updateSelectedSetting(field.key, Number(e.target.value))
                              }
                              className="w-full accent-orange-600 cursor-pointer"
                            />
                          </div>
                        );
                      }

                      if (field.type === 'image' || field.type === 'file') {
                        const isPdf = field.type === 'file';
                        const folder: StorageFolder =
                          field.uploadFolder || (isPdf ? 'resume' : 'logos');
                        const accept = isPdf ? 'application/pdf,.pdf' : 'image/*';
                        return (
                          <div key={field.key} className="space-y-1.5">
                            <label className="block text-xs text-neutral-400">
                              {field.label}
                            </label>
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                value={String(val)}
                                placeholder={field.placeholder}
                                onChange={(e) =>
                                  updateSelectedSetting(field.key, e.target.value)
                                }
                                className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-white focus:outline-none focus:border-orange-500"
                              />
                              <input
                                ref={(el) => {
                                  fileInputRefs.current[field.key] = el;
                                }}
                                type="file"
                                accept={accept}
                                className="hidden"
                                onChange={(e) => {
                                  handleUploadFieldFile(
                                    field.key,
                                    folder,
                                    e.target.files?.[0]
                                  );
                                  e.target.value = '';
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => fileInputRefs.current[field.key]?.click()}
                                disabled={uploadingField === field.key}
                                className="px-2.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs text-white shrink-0 flex items-center gap-1 disabled:opacity-50"
                                title={isPdf ? 'Upload PDF' : 'Upload Image'}
                              >
                                <Upload size={12} />
                                {uploadingField === field.key ? '...' : 'Upload'}
                              </button>
                            </div>
                            {field.type === 'image' && typeof val === 'string' && val && (
                              <img
                                src={val}
                                alt={field.label}
                                className="h-12 w-auto rounded border border-neutral-800 object-contain bg-neutral-950 p-1"
                              />
                            )}
                          </div>
                        );
                      }

                      if (field.type === 'block_list' && field.blockType) {
                        return (
                          <div key={field.key} className="space-y-1.5">
                            <label className="block text-xs text-neutral-400">
                              {field.label}
                            </label>
                            <BlockListEditor
                              blockType={field.blockType}
                              items={Array.isArray(val) ? val : []}
                              onChange={(next) => updateSelectedSetting(field.key, next)}
                            />
                          </div>
                        );
                      }

                      if (field.type === 'textarea') {
                        return (
                          <div key={field.key}>
                            <label className="block text-xs text-neutral-400 mb-1">
                              {field.label}
                            </label>
                            <textarea
                              rows={4}
                              value={String(val)}
                              placeholder={field.placeholder}
                              onChange={(e) =>
                                updateSelectedSetting(field.key, e.target.value)
                              }
                              className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-white focus:outline-none focus:border-orange-500"
                            />
                          </div>
                        );
                      }

                      return (
                        <div key={field.key}>
                          <label className="block text-xs text-neutral-400 mb-1">
                            {field.label}
                          </label>
                          <input
                            type="text"
                            value={String(val)}
                            placeholder={field.placeholder}
                            onChange={(e) =>
                              updateSelectedSetting(field.key, e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-white focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Remove Section */}
                {!isStatic && (
                  <div className="border-t border-neutral-800 pt-4">
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(selectedSection.id)}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition"
                    >
                      <Trash2 size={13} />
                      Remove Section
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
          </div>
        </aside>

        {/* Right Live Preview Canvas (iframe for authentic responsive breakpoints) */}
        <main className="flex-1 bg-neutral-950 p-4 md:p-6 overflow-hidden flex justify-center items-stretch">
          <div
            className={`h-full rounded-xl border border-neutral-800 shadow-2xl overflow-hidden bg-black transition-all duration-300 w-[390px] max-w-full ${
              previewMode === 'mobile' ? 'md:w-[390px]' : 'md:w-full'
            }`}
          >
            <iframe
              ref={iframeRef}
              src="/admin/preview"
              title="Portfolio Live Preview"
              className="w-full h-full border-0"
            />
          </div>
        </main>
      </div>
    </div>
  );
}
