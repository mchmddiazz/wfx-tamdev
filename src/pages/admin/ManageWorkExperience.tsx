import { useEffect, useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { WorkExperience } from '../../types/cms';
import { LEGACY_WORK_EXPERIENCES } from '../../data/LegacyWorkExperiences';

const ITEMS_PER_PAGE = 5;

export default function ManageWorkExperience() {
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [period, setPeriod] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('work_experiences')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (!error && data) {
      setExperiences(data);
      const maxPage = Math.max(1, Math.ceil(data.length / ITEMS_PER_PAGE));
      setCurrentPage((prev) => Math.min(prev, maxPage));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Escape key to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) {
        if (isModalOpen) closeModal();
        if (isDeleteModalOpen) setIsDeleteModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, isDeleteModalOpen, saving]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(experiences.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedExperiences = experiences.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const resetForm = () => {
    setCompany('');
    setRole('');
    setPeriod('');
    setCity('');
    setDescription('');
    setSortOrder(experiences.length);
    setIsActive(true);
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (exp: WorkExperience) => {
    setEditingId(exp.id);
    setCompany(exp.company);
    setRole(exp.role);
    setPeriod(exp.period);
    setCity(exp.city ?? '');
    setDescription(exp.description);
    setSortOrder(exp.sort_order);
    setIsActive(exp.is_active);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    resetForm();
  };

  const openDeleteModal = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      company: company.trim(),
      role: role.trim(),
      period: period.trim(),
      city: city.trim() || null,
      description: description.trim(),
      sort_order: Number(sortOrder),
      is_active: isActive,
    };

    if (editingId) {
      const { error } = await supabase
        .from('work_experiences')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', editingId);

      if (!error) {
        await fetchData();
        setIsModalOpen(false);
        resetForm();
      } else {
        alert('Error updating experience: ' + error.message);
      }
    } else {
      const { error } = await supabase.from('work_experiences').insert([payload]);

      if (!error) {
        await fetchData();
        setIsModalOpen(false);
        resetForm();
      } else {
        alert('Error adding experience: ' + error.message);
      }
    }

    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setSaving(true);
    const { error } = await supabase.from('work_experiences').delete().eq('id', deletingId);
    if (!error) {
      await fetchData();
    } else {
      alert('Error deleting experience: ' + error.message);
    }
    setSaving(false);
    setIsDeleteModalOpen(false);
    setDeletingId(null);
  };

  const handleImportLegacy = async () => {
    if (experiences.length > 0) {
      const confirmed = window.confirm(
        `You already have ${experiences.length} experience(s). Import will add the legacy entries alongside them. Continue?`
      );
      if (!confirmed) return;
    }
    setImporting(true);
    const { error } = await supabase.from('work_experiences').insert(LEGACY_WORK_EXPERIENCES);
    if (!error) {
      await fetchData();
    } else {
      alert('Error importing legacy experiences: ' + error.message);
    }
    setImporting(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/60 border border-neutral-800 p-5 rounded-xl">
        <div>
          <h1 className="text-xl font-bold">Work Experience ({experiences.length})</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage professional work history, ordering, and visibility.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {experiences.length < LEGACY_WORK_EXPERIENCES.length && (
            <button
              type="button"
              onClick={handleImportLegacy}
              disabled={importing}
              className="px-3 py-2 text-xs font-medium rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-neutral-700 disabled:opacity-50 transition"
            >
              {importing ? 'Importing...' : 'Import Legacy'}
            </button>
          )}
          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition"
          >
            + Add Experience
          </button>
        </div>
      </div>

      {/* Experiences List */}
      {loading ? (
        <p className="text-sm text-neutral-400">Loading work experiences...</p>
      ) : experiences.length === 0 ? (
        <div className="text-center py-12 bg-neutral-900/40 border border-dashed border-neutral-800 rounded-xl">
          <p className="text-sm text-neutral-400 mb-3">No work experiences in database yet.</p>
          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-white text-black hover:bg-neutral-200 transition"
          >
            Add Your First Experience
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3">
            {paginatedExperiences.map((exp) => (
              <div
                key={exp.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/70 border border-neutral-800 p-4 rounded-xl hover:border-neutral-700 transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm text-white">{exp.role}</h3>
                    <span className="text-xs text-neutral-500">at</span>
                    <span className="text-sm font-medium text-orange-400">{exp.company}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        exp.is_active
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {exp.is_active ? 'Visible' : 'Hidden'}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 mt-0.5">
                    {exp.period}
                    {exp.city ? ` • ${exp.city}` : ''} • Order: {exp.sort_order}
                  </p>

                  {exp.description && (
                    <p className="text-xs text-neutral-400 mt-1.5 line-clamp-2 max-w-2xl">
                      {exp.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditModal(exp)}
                    className="px-3 py-1.5 text-xs rounded bg-neutral-800 hover:bg-neutral-700 transition"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => openDeleteModal(exp.id)}
                    className="px-3 py-1.5 text-xs rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-neutral-400">
              <span>
                Showing <strong className="text-white">{startIndex + 1}</strong>–
                <strong className="text-white">
                  {Math.min(startIndex + ITEMS_PER_PAGE, experiences.length)}
                </strong>{' '}
                of <strong className="text-white">{experiences.length}</strong> experiences
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800 disabled:opacity-40 disabled:pointer-events-none transition"
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg font-medium transition ${
                      currentPage === page
                        ? 'bg-orange-600 text-white'
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-white'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800 disabled:opacity-40 disabled:pointer-events-none transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-5">
                <h2 className="text-lg font-bold">
                  {editingId ? 'Edit Experience' : 'Add New Experience'}
                </h2>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="text-neutral-400 hover:text-white text-xl leading-none px-2"
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Company *</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Digiserve by Telkom Indonesia"
                    className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Role / Title *</label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Intern Network Engineer"
                    className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Period *</label>
                  <input
                    type="text"
                    required
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    placeholder="e.g. Sep 2026 - Present"
                    className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">
                    City <span className="text-neutral-500">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bandung, Indonesia"
                    className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs text-neutral-400 mb-1">Description *</label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe your role and key responsibilities..."
                    className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-6">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Sort Order</label>
                    <input
                      type="number"
                      min={0}
                      value={sortOrder}
                      onChange={(e) => setSortOrder(Number(e.target.value))}
                      className="w-20 px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm mt-5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded bg-neutral-800 border-neutral-700 accent-orange-600"
                    />
                    Visible on public site
                  </label>
                </div>

                <div className="md:col-span-2 flex items-center justify-end gap-3 border-t border-neutral-800 pt-4 mt-2">
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
                    {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Experience'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
            onClick={() => !saving && setIsDeleteModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold text-white mb-2">Delete Experience</h2>
              <p className="text-neutral-400 text-sm mb-6">
                Are you sure? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-neutral-800 text-sm text-neutral-300 hover:bg-neutral-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                >
                  {saving ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
