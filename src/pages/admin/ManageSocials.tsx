import { useEffect, useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { SocialLink } from '../../types/cms';
import { LEGACY_SOCIALS } from '../../data/LegacySocials';

const DEFAULT_CONTACT_TITLE = "Let's\nConnect";
const DEFAULT_CONTACT_SUBTITLE =
  'Available for collaborations, opportunities, or just a friendly chat.';

export default function ManageSocials() {
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  // Section header states
  const [contactTitle, setContactTitle] = useState(DEFAULT_CONTACT_TITLE);
  const [contactSubtitle, setContactSubtitle] = useState(DEFAULT_CONTACT_SUBTITLE);
  const [isHeaderModalOpen, setIsHeaderModalOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftSubtitle, setDraftSubtitle] = useState('');

  // Social link modal & editing states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Social link form states
  const [platform, setPlatform] = useState('GitHub');
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [sortOrder, setSortOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const fetchData = async () => {
    setLoading(true);

    const [socialsRes, profileRes] = await Promise.all([
      supabase
        .from('social_links')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true }),
      supabase
        .from('site_profile')
        .select('contact_title, contact_subtitle')
        .eq('id', 1)
        .single(),
    ]);

    if (!socialsRes.error && socialsRes.data) {
      setSocials(socialsRes.data);
    }

    if (!profileRes.error && profileRes.data) {
      if (profileRes.data.contact_title) setContactTitle(profileRes.data.contact_title);
      if (profileRes.data.contact_subtitle)
        setContactSubtitle(profileRes.data.contact_subtitle);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Close either modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) {
        if (isModalOpen) setIsModalOpen(false);
        if (isHeaderModalOpen) setIsHeaderModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, isHeaderModalOpen, saving]);

  // Section Header Modal Handlers
  const openHeaderModal = () => {
    setDraftTitle(contactTitle);
    setDraftSubtitle(contactSubtitle);
    setIsHeaderModalOpen(true);
  };

  const handleSaveHeader = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('site_profile')
        .update({
          contact_title: draftTitle,
          contact_subtitle: draftSubtitle,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1);

      if (error) throw error;

      setContactTitle(draftTitle);
      setContactSubtitle(draftSubtitle);
      setIsHeaderModalOpen(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update section title');
    } finally {
      setSaving(false);
    }
  };

  // Social Link Modal Handlers
  const openAddModal = () => {
    setEditingId(null);
    setPlatform('GitHub');
    setLabel('');
    setUrl('');
    setSortOrder(socials.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: SocialLink) => {
    setEditingId(item.id);
    setPlatform(item.platform);
    setLabel(item.label);
    setUrl(item.url);
    setSortOrder(item.sort_order);
    setIsActive(item.is_active);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        platform,
        label: label.trim() || platform,
        url: url.trim(),
        sort_order: Number(sortOrder),
        is_active: isActive,
      };

      if (editingId) {
        const { error } = await supabase
          .from('social_links')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('social_links').insert([payload]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      setEditingId(null);
      await fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to save social link');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this social link permanently?')) return;
    const { error } = await supabase.from('social_links').delete().eq('id', id);
    if (!error) fetchData();
  };

  const handleImportLegacy = async () => {
    if (!confirm('Import your 4 existing social/contact links into Supabase?')) return;
    setImporting(true);

    try {
      const existingUrls = new Set(socials.map((s) => s.url.toLowerCase()));
      const toInsert = LEGACY_SOCIALS.filter(
        (item) => !existingUrls.has(item.url.toLowerCase())
      ).map((item) => ({
        platform: item.platform,
        label: item.label,
        url: item.url,
        sort_order: item.sort_order,
        is_active: true,
      }));

      if (toInsert.length > 0) {
        const { error } = await supabase.from('social_links').insert(toInsert);
        if (error) throw error;
      }

      await fetchData();
      alert('Existing social links imported successfully!');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to import social links');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Heading Card */}
      <div className="bg-neutral-900/70 border border-neutral-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-neutral-300">Section Heading</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">
              Contact Intro
            </span>
          </div>
          <p className="text-lg font-bold text-orange-500 whitespace-pre-line leading-snug">
            {contactTitle}
          </p>
          <p className="text-xs font-mono text-neutral-400">{contactSubtitle}</p>
        </div>

        <button
          type="button"
          onClick={openHeaderModal}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-800 text-white border border-neutral-700 hover:bg-neutral-700 transition self-start shrink-0"
        >
          Edit Section Title
        </button>
      </div>

      {/* Top Action Header for Links */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/60 border border-neutral-800 p-5 rounded-xl">
        <div>
          <h1 className="text-xl font-bold">
            Social Media & Contact Links ({socials.length})
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage your GitHub, LinkedIn, Instagram, Email, or WhatsApp links.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          {socials.length < LEGACY_SOCIALS.length && (
            <button
              type="button"
              onClick={handleImportLegacy}
              disabled={importing}
              className="px-3 py-2 text-xs font-medium rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-neutral-700 disabled:opacity-50"
            >
              {importing ? 'Importing...' : 'Import Existing'}
            </button>
          )}
          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition"
          >
            + Add Social Link
          </button>
        </div>
      </div>

      {/* Social Links List */}
      {loading ? (
        <p className="text-sm text-neutral-400">Loading social links...</p>
      ) : socials.length === 0 ? (
        <div className="text-center py-12 bg-neutral-900/40 border border-dashed border-neutral-800 rounded-xl">
          <p className="text-sm text-neutral-400 mb-3">No social links configured yet.</p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleImportLegacy}
              disabled={importing}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-800 text-white border border-neutral-700 hover:bg-neutral-700 disabled:opacity-50"
            >
              {importing ? 'Importing...' : 'Import 4 Existing Links'}
            </button>
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-orange-600 text-white hover:bg-orange-700"
            >
              + Add Custom Link
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {socials.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/70 border border-neutral-800 p-4 rounded-xl hover:border-neutral-700 transition"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-800 text-orange-400">
                    {item.platform}
                  </span>
                  <h3 className="font-semibold text-sm">{item.label}</h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      item.is_active
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                    }`}
                  >
                    {item.is_active ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1 break-all">
                  {item.url} • Order: {item.sort_order}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => openEditModal(item)}
                  className="px-3 py-1.5 text-xs rounded bg-neutral-800 hover:bg-neutral-700 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-3 py-1.5 text-xs rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: EDIT SECTION TITLE & SUBTITLE */}
      <AnimatePresence>
        {isHeaderModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
            onClick={() => !saving && setIsHeaderModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-5">
              <div>
                <h2 className="text-lg font-bold">Edit Contact Section Title</h2>
                <p className="text-xs text-neutral-400">
                  Press Enter in Heading for multi-line display (e.g. Let's / Connect).
                </p>
              </div>
              <button
                type="button"
                onClick={() => !saving && setIsHeaderModalOpen(false)}
                disabled={saving}
                className="text-neutral-400 hover:text-white text-xl leading-none px-2"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveHeader} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">
                  Section Title *
                </label>
                <textarea
                  required
                  rows={2}
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder={"Let's\nConnect"}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">
                  Subtitle / Description *
                </label>
                <textarea
                  required
                  rows={2}
                  value={draftSubtitle}
                  onChange={(e) => setDraftSubtitle(e.target.value)}
                  placeholder="Available for collaborations, opportunities, or just a friendly chat."
                  className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm font-mono focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-neutral-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsHeaderModalOpen(false)}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-neutral-800 text-sm text-neutral-300 hover:bg-neutral-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Heading'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

      {/* MODAL 2: ADD / EDIT SOCIAL LINK */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-5">
              <h2 className="text-lg font-bold">
                {editingId ? 'Edit Social Link' : 'Add Social Link'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="text-neutral-400 hover:text-white text-xl leading-none px-2"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Platform *</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm focus:outline-none focus:border-orange-500"
                  >
                    <option value="GitHub">GitHub</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Instagram">Instagram</option>
                    <option value="X / Twitter">X / Twitter</option>
                    <option value="Email">Email</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Telegram">Telegram</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Display Label *</label>
                  <input
                    type="text"
                    required
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. @mchmddiazz or Email Me"
                    className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">
                  URL (or mailto:you@domain.com) *
                </label>
                <input
                  type="text"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://github.com/mchmddiazz"
                  className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-24 px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm mt-5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded bg-neutral-800 border-neutral-700 accent-orange-600"
                  />
                  Active on site
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-neutral-800 pt-4 mt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-neutral-800 text-sm text-neutral-300 hover:bg-neutral-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Link'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </div>
  );
}