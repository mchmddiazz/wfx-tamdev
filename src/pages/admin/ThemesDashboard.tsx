import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ExternalLink, Paintbrush, Plus, Trash2, CheckCircle2, CodeXml, Pencil, Check, X, MoreHorizontal, Eye, Copy, Download, Info, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SiteTheme } from '../../types/cms';
import { DEFAULT_SECTIONS } from '../../lib/sectionRegistry';
import { parseAndValidateThemeJson } from '../../lib/themeUtils';

const FALLBACK_LIVE_THEME: SiteTheme = {
  id: 'default-live',
  name: 'Tamdev Portfolio (Main)',
  is_live: true,
  sections: DEFAULT_SECTIONS,
  updated_at: new Date().toISOString(),
};

function formatDate(iso?: string) {
  if (!iso) return 'Just now';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ThemesDashboard() {
  const navigate = useNavigate();
  const [themes, setThemes] = useState<SiteTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableMissing, setTableMissing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newDraftName, setNewDraftName] = useState('');
  const [showNewDraftInput, setShowNewDraftInput] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    const handleClose = () => setOpenMenuId(null);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenuId(null);
    };
    window.addEventListener('click', handleClose);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('click', handleClose);
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  const fetchThemes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_themes')
      .select('*')
      .order('is_live', { ascending: false })
      .order('updated_at', { ascending: false });

    if (error) {
      setTableMissing(true);
      setThemes([FALLBACK_LIVE_THEME]);
    } else if (data && data.length > 0) {
      setTableMissing(false);
      setThemes(data as SiteTheme[]);
    } else {
      setTableMissing(false);
      setThemes([FALLBACK_LIVE_THEME]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const liveTheme = themes.find((t) => t.is_live) || themes[0] || FALLBACK_LIVE_THEME;
  const draftThemes = themes.filter((t) => !t.is_live);
  const currentHost =
    typeof window !== 'undefined' ? window.location.host : 'tamdev.biz.id';

  const handleCreateDraft = async () => {
    if (tableMissing) {
      alert('Please run supabase/migrations/20261125_create_site_themes.sql in Supabase first.');
      return;
    }
    const name = newDraftName.trim() || `Draft Theme (${draftThemes.length + 1})`;
    setCreating(true);

    const { data, error } = await supabase
      .from('site_themes')
      .insert([
        {
          name,
          is_live: false,
          sections: liveTheme.sections || DEFAULT_SECTIONS,
        },
      ])
      .select()
      .single();

    setCreating(false);
    if (error) {
      alert('Failed to create draft: ' + error.message);
      return;
    }

    setNewDraftName('');
    setShowNewDraftInput(false);
    if (data) {
      navigate(`/admin/customize/editor?themeId=${data.id}`);
    } else {
      fetchThemes();
    }
  };

  const handlePublishDraft = async (theme: SiteTheme) => {
    if (!confirm(`Publish "${theme.name}" as your live site theme?`)) return;
    setBusyId(theme.id);

    // Unset current live theme(s), then set this theme live
    await supabase.from('site_themes').update({ is_live: false }).neq('id', theme.id);
    const { error } = await supabase
      .from('site_themes')
      .update({ is_live: true, updated_at: new Date().toISOString() })
      .eq('id', theme.id);

    setBusyId(null);
    if (error) {
      alert('Failed to publish theme: ' + error.message);
      return;
    }
    await fetchThemes();
  };

  const handleDeleteDraft = async (theme: SiteTheme) => {
    if (!confirm(`Delete draft "${theme.name}" permanently?`)) return;
    setBusyId(theme.id);
    const { error } = await supabase.from('site_themes').delete().eq('id', theme.id);
    setBusyId(null);
    if (!error) fetchThemes();
  };

  const startRename = (theme: SiteTheme) => {
    if (tableMissing || theme.id === 'default-live') {
      alert('Please run supabase/migrations/20261125_create_site_themes.sql in Supabase first.');
      return;
    }
    setEditingThemeId(theme.id);
    setRenameValue(theme.name);
  };

  const cancelRename = () => {
    setEditingThemeId(null);
    setRenameValue('');
  };

  const saveRename = async (theme: SiteTheme) => {
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === theme.name) {
      cancelRename();
      return;
    }
    setBusyId(theme.id);
    const { error } = await supabase
      .from('site_themes')
      .update({ name: trimmed, updated_at: new Date().toISOString() })
      .eq('id', theme.id);
    setBusyId(null);

    if (error) {
      alert('Failed to rename theme: ' + error.message);
      return;
    }
    cancelRename();
    await fetchThemes();
  };

  const handleDuplicateTheme = async (theme: SiteTheme) => {
    setOpenMenuId(null);
    if (tableMissing || theme.id === 'default-live') {
      alert('Please run supabase/migrations/20261125_create_site_themes.sql in Supabase first.');
      return;
    }
    setBusyId(theme.id);
    const { error } = await supabase.from('site_themes').insert([
      {
        name: `Copy of ${theme.name}`,
        is_live: false,
        sections: theme.sections || DEFAULT_SECTIONS,
      },
    ]);
    setBusyId(null);
    if (error) {
      alert('Failed to duplicate theme: ' + error.message);
      return;
    }
    await fetchThemes();
  };

  const handleDownloadTheme = (theme: SiteTheme) => {
    setOpenMenuId(null);
    const payload = JSON.stringify(
      { name: theme.name, exportedAt: new Date().toISOString(), sections: theme.sections },
      null,
      2
    );
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${theme.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportThemeFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (tableMissing) {
      setImportError('Please run supabase/migrations/20261125_create_site_themes.sql in Supabase first.');
      e.target.value = '';
      return;
    }

    setImporting(true);
    setImportError(null);

    try {
      const rawText = await file.text();
      const fallbackName = file.name.replace(/\.json$/i, '') || 'Imported Theme';
      const parsed = parseAndValidateThemeJson(rawText, fallbackName);

      const hasDuplicateName = themes.some(
        (t) => t.name.toLowerCase() === parsed.name.toLowerCase()
      );
      const uniqueName = hasDuplicateName ? `${parsed.name} (Imported)` : parsed.name;

      const { error } = await supabase.from('site_themes').insert([
        {
          name: uniqueName,
          is_live: false,
          sections: parsed.sections,
        },
      ]);

      if (error) {
        throw new Error(error.message);
      }

      await fetchThemes();
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to import theme JSON.');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const renderThemeMenu = (theme: SiteTheme) => {
    const isOpen = openMenuId === theme.id;
    const previewHref =
      theme.is_live || theme.id === 'default-live' ? '/' : `/?previewThemeId=${theme.id}`;

    return (
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => setOpenMenuId(isOpen ? null : theme.id)}
          aria-label="Theme actions"
          className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition"
        >
          <MoreHorizontal size={15} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl py-1.5 z-40 text-xs">
            <a
              href={previewHref}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpenMenuId(null)}
              className="flex items-center gap-2.5 px-3.5 py-2 text-neutral-200 hover:bg-neutral-800 transition"
            >
              <Eye size={14} className="text-neutral-400" />
              <span>Preview</span>
            </a>

            <button
              type="button"
              onClick={() => {
                setOpenMenuId(null);
                startRename(theme);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-neutral-200 hover:bg-neutral-800 transition text-left"
            >
              <Pencil size={14} className="text-neutral-400" />
              <span>Rename</span>
            </button>

            <div className="my-1 border-t border-neutral-800" />

            <button
              type="button"
              onClick={() => handleDuplicateTheme(theme)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-neutral-200 hover:bg-neutral-800 transition text-left"
            >
              <Copy size={14} className="text-neutral-400" />
              <span>Duplicate</span>
            </button>

            <button
              type="button"
              onClick={() => handleDownloadTheme(theme)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-neutral-200 hover:bg-neutral-800 transition text-left"
            >
              <Download size={14} className="text-neutral-400" />
              <span>Download theme file</span>
            </button>

            {!theme.is_live && (
              <>
                <div className="my-1 border-t border-neutral-800" />
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenuId(null);
                    handleDeleteDraft(theme);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-red-400 hover:bg-red-500/10 transition text-left"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </>
            )}

            <div className="my-1 border-t border-neutral-800" />
            <div className="flex items-center gap-2 px-3.5 py-1.5 text-[11px] text-neutral-500">
              <Info size={13} />
              <span>v1.0 · {theme.sections?.length ?? 0} sections</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-orange-500">
            <Paintbrush size={18} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Themes</h1>
            <p className="text-xs text-neutral-400">
              Manage your live portfolio theme and work on draft layouts.
            </p>
          </div>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-200 hover:bg-neutral-800 transition self-start sm:self-auto"
        >
          <span>Preview site</span>
          <ExternalLink size={13} />
        </a>
      </div>

      {tableMissing && (
        <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-3 rounded-xl text-xs text-amber-300">
          Database table <code className="font-mono">site_themes</code> not found yet — showing default live theme. Run{' '}
          <code className="font-mono">supabase/migrations/20261125_create_site_themes.sql</code> in Supabase to create and manage draft themes.
        </div>
      )}

      {importError && (
        <div className="flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl text-xs text-red-300">
          <span>{importError}</span>
          <button
            type="button"
            onClick={() => setImportError(null)}
            aria-label="Dismiss import error"
            className="text-red-300 hover:text-white transition"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Current Live Theme Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl relative">
        {/* Scaled Live Preview Banner */}
        <div className="relative h-[400px] sm:h-80 bg-black overflow-hidden rounded-2xl sm:rounded-b-none sm:rounded-t-2xl sm:border-b sm:border-neutral-800">
          <iframe
            src="/"
            title="Current Live Theme Preview"
            className="w-[125%] h-[125%] scale-[0.8] sm:w-[200%] sm:h-[200%] sm:scale-50 origin-top-left border-0 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 sm:from-neutral-950/90 sm:via-neutral-950/20 to-transparent pointer-events-none" />
        </div>

        {/* Bottom Info & Actions Bar (overlaid on mobile like Shopify card, static bar on desktop; outside overflow-hidden so dropdown is never clipped) */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:static sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold text-white">{currentHost}</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 size={11} /> Live theme
              </span>
            </div>
            {editingThemeId === liveTheme.id ? (
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveRename(liveTheme);
                    if (e.key === 'Escape') cancelRename();
                  }}
                  autoFocus
                  className="px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-white focus:outline-none focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={() => saveRename(liveTheme)}
                  disabled={busyId === liveTheme.id}
                  className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50"
                  title="Save name"
                >
                  <Check size={12} />
                </button>
                <button
                  type="button"
                  onClick={cancelRename}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                  title="Cancel"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-neutral-300 sm:text-neutral-400">
                <span>
                  {liveTheme.name} · Last saved: {formatDate(liveTheme.updated_at)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <Link
              to={
                liveTheme.id === 'default-live'
                  ? '/admin/customize/editor'
                  : `/admin/customize/editor?themeId=${liveTheme.id}`
              }
              className="px-4 py-2 text-xs font-semibold rounded-full sm:rounded-lg bg-white text-neutral-950 hover:bg-neutral-200 sm:bg-orange-600 sm:hover:bg-orange-700 sm:text-white transition"
            >
              Edit theme
            </Link>
            {renderThemeMenu(liveTheme)}
          </div>
        </div>
      </div>

      {/* Draft Themes Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white">
              Draft themes ({loading ? '…' : draftThemes.length})
            </h2>
            <p className="text-xs text-neutral-400">
              Duplicate your live layout to experiment with new sections before publishing.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportThemeFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 transition disabled:opacity-50"
            >
              <Upload size={14} />
              <span>{importing ? 'Importing...' : 'Import JSON'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowNewDraftInput((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 transition"
            >
              <Plus size={14} />
              <span>New draft</span>
            </button>
          </div>
        </div>

        {/* Inline New Draft Form */}
        {showNewDraftInput && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-4 rounded-xl bg-neutral-900 border border-neutral-800">
            <input
              type="text"
              value={newDraftName}
              onChange={(e) => setNewDraftName(e.target.value)}
              placeholder="e.g. Network Engineer Focus v2"
              className="flex-1 px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-white focus:outline-none focus:border-orange-500"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowNewDraftInput(false)}
                className="px-3 py-2 text-xs rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateDraft}
                disabled={creating}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create & Edit'}
              </button>
            </div>
          </div>
        )}

        {/* Drafts List */}
        {loading ? (
          <p className="text-xs text-neutral-400">Loading themes...</p>
        ) : draftThemes.length === 0 ? (
          <div className="text-center py-10 bg-neutral-900/40 border border-dashed border-neutral-800 rounded-xl">
            <p className="text-xs text-neutral-400 mb-3">No draft themes yet.</p>
            <button
              type="button"
              onClick={() => setShowNewDraftInput(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white text-black hover:bg-neutral-200 transition"
            >
              Create Your First Draft
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {draftThemes.map((theme) => (
              <div
                key={theme.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/70 border border-neutral-800 p-4 rounded-xl hover:border-neutral-700 transition"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-16 h-11 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-orange-400 shrink-0">
                    <CodeXml size={18} />
                  </div>
                  <div className="min-w-0">
                    {editingThemeId === theme.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveRename(theme);
                            if (e.key === 'Escape') cancelRename();
                          }}
                          autoFocus
                          className="px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-white focus:outline-none focus:border-orange-500"
                        />
                        <button
                          type="button"
                          onClick={() => saveRename(theme)}
                          disabled={busyId === theme.id}
                          className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50"
                          title="Save name"
                        >
                          <Check size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={cancelRename}
                          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                          title="Cancel"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm text-white truncate">
                          {theme.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => startRename(theme)}
                          className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                          title="Rename theme"
                        >
                          <Pencil size={12} />
                        </button>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Draft
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Updated: {formatDate(theme.updated_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handlePublishDraft(theme)}
                    disabled={busyId === theme.id}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-emerald-600 text-neutral-200 hover:text-white border border-neutral-700 transition disabled:opacity-50"
                  >
                    Publish
                  </button>
                  <Link
                    to={`/admin/customize/editor?themeId=${theme.id}`}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition"
                  >
                    Edit theme
                  </Link>
                  {renderThemeMenu(theme)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
