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
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SiteSection, SectionType } from '../../types/cms';
import { SECTION_REGISTRY, DEFAULT_SECTIONS } from '../../lib/sectionRegistry';

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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    document.title = 'Customize Site | Tamdev CMS';
    fetchSections();
  }, []);

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
      setSections(
        Array.isArray(themeData.sections) && themeData.sections.length > 0
          ? themeData.sections
          : DEFAULT_SECTIONS
      );
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
      setSections(DEFAULT_SECTIONS);
    } else if (data && data.length > 0) {
      setTableMissing(false);
      setSections(data);
    } else {
      setTableMissing(false);
      setSections(DEFAULT_SECTIONS);
    }
    setLoading(false);
  };

  const selectedSection = sections.find((s) => s.id === selectedId) || null;
  const hasDraftChanges = sections.some((s) => s.has_unpublished_changes);

  const showToast = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 2500);
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    const reordered = next.map((s, i) => ({
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

    setSections((prev) => [...prev, newSection]);
    setSelectedId(newSection.id);
    setSidebarView('inspect');
  };

  const handleRemoveSection = (id: string) => {
    setSections((prev) =>
      prev
        .filter((s) => s.id !== id)
        .map((s, i) => ({ ...s, sort_order: i }))
    );
    setSelectedId(null);
    setSidebarView('list');
  };

  const updateSelected = (patch: Partial<SiteSection>) => {
    if (!selectedId) return;
    setSections((prev) =>
      prev.map((s) =>
        s.id === selectedId ? { ...s, ...patch, has_unpublished_changes: true } : s
      )
    );
  };

  const updateSelectedSetting = (key: string, value: string | boolean) => {
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

  const persistSections = async (publish: boolean) => {
    if (tableMissing) {
      alert('Please run supabase/migrations/20261125_create_site_themes.sql in Supabase first.');
      return;
    }

    publish ? setPublishing(true) : setSaving(true);

    try {
      const normalized = sections.map((s, i) => ({
        ...s,
        sort_order: i,
        published_settings: publish ? s.draft_settings : s.published_settings,
        has_unpublished_changes: publish ? false : true,
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

  const portfolioDefs = Object.values(SECTION_REGISTRY).filter((d) => d.category === 'portfolio');
  const customDefs = Object.values(SECTION_REGISTRY).filter((d) => d.category === 'custom');

  return (
    <div className="h-screen flex flex-col bg-neutral-950 text-neutral-100 overflow-hidden">
      {/* Top Shopify-style Customizer Bar */}
      <header className="h-14 shrink-0 border-b border-neutral-800 bg-neutral-900 px-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/customize"
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition"
          >
            <ArrowLeft size={14} />
            <span>Back to Themes</span>
          </Link>
          <span className="font-bold text-sm text-orange-500 tracking-tight hidden sm:inline truncate max-w-[200px]">
            {themeName}
          </span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border ${
              !isThemeLive || hasDraftChanges
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}
          >
            {isThemeLive ? (hasDraftChanges ? 'Unsaved' : 'Live') : 'Draft'}
          </span>
          {statusMsg && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <Check size={13} /> {statusMsg}
            </span>
          )}
        </div>

        {/* Center: Viewport Switcher */}
        <div className="hidden md:flex items-center bg-neutral-800 rounded-lg p-1 border border-neutral-700">
          <button
            type="button"
            onClick={() => setPreviewMode('desktop')}
            className={`p-1.5 rounded transition ${
              previewMode === 'desktop'
                ? 'bg-neutral-700 text-white'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Desktop Preview"
          >
            <Monitor size={15} />
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode('mobile')}
            className={`p-1.5 rounded transition ${
              previewMode === 'mobile'
                ? 'bg-neutral-700 text-white'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Mobile Preview"
          >
            <Smartphone size={15} />
          </button>
        </div>

        {/* Right: Save Draft & Publish */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => persistSections(false)}
            disabled={saving || publishing}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 disabled:opacity-50 transition"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            type="button"
            onClick={() => persistSections(true)}
            disabled={saving || publishing}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 transition"
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
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-80 shrink-0 border-r border-neutral-800 bg-neutral-900 flex flex-col overflow-y-auto">
          {sidebarView === 'list' && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Page Sections ({sections.length})
                </span>
              </div>

              {loading ? (
                <p className="text-xs text-neutral-500">Loading sections...</p>
              ) : (
                <div className="space-y-1.5">
                  {sections.map((sec, idx) => {
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
                          className="flex items-center gap-1 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleMove(idx, -1)}
                            disabled={idx === 0}
                            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-700 disabled:opacity-30"
                            title="Move Up"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(idx, 1)}
                            disabled={idx === sections.length - 1}
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
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                onClick={() => setSidebarView('add')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-neutral-700 hover:border-orange-500 text-xs font-semibold text-orange-400 hover:text-orange-300 hover:bg-orange-500/5 transition"
              >
                <Plus size={14} />
                Add Section
              </button>
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

          {sidebarView === 'inspect' && selectedSection && (
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
                  {SECTION_REGISTRY[selectedSection.type]?.name}
                </span>
              </div>

              {/* Menu & Visibility */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Menu & Visibility
                </h4>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Nav Menu Label</label>
                  <input
                    type="text"
                    value={selectedSection.nav_label}
                    onChange={(e) => updateSelected({ nav_label: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Anchor ID</label>
                  <input
                    type="text"
                    value={selectedSection.anchor_id}
                    onChange={(e) =>
                      updateSelected({
                        anchor_id: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSection.show_in_nav}
                    onChange={(e) => updateSelected({ show_in_nav: e.target.checked })}
                    className="rounded accent-orange-600"
                  />
                  Show in Navigation Menu
                </label>

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

              {/* Schema-driven Content Fields */}
              {SECTION_REGISTRY[selectedSection.type]?.fields.length > 0 && (
                <div className="space-y-3 border-t border-neutral-800 pt-4">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Section Settings
                  </h4>

                  {SECTION_REGISTRY[selectedSection.type].fields.map((field) => {
                    const val =
                      selectedSection.draft_settings[field.key] ??
                      SECTION_REGISTRY[selectedSection.type].defaultSettings[field.key] ??
                      '';

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
            </div>
          )}
        </aside>

        {/* Right Live Preview Canvas (iframe for authentic responsive breakpoints) */}
        <main className="flex-1 bg-neutral-950 p-4 md:p-6 overflow-hidden flex justify-center items-stretch">
          <div
            className={`h-full rounded-xl border border-neutral-800 shadow-2xl overflow-hidden bg-black transition-all duration-300 ${
              previewMode === 'mobile' ? 'w-[390px] max-w-full' : 'w-full'
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
