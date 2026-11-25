import { useEffect, useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { WorkExperience } from '../../types/cms';
import { LEGACY_WORK_EXPERIENCES } from '../../data/LegacyWorkExperiences';

export default function ManageWorkExperience() {
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [period, setPeriod] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Import legacy
  const [importing, setImporting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('work_experiences')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (!error && data) {
      setExperiences(data);
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

  const resetForm = () => {
    setCompany('');
    setRole('');
    setPeriod('');
    setCity('');
    setDescription('');
    setSortOrder(experiences.length + 1);
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
      sort_order: sortOrder,
      is_active: isActive,
    };

    if (editingId) {
      const { error } = await supabase
        .from('work_experiences')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', editingId);

      if (!error) {
        await fetchData();
        closeModal();
      } else {
        alert('Error updating experience: ' + error.message);
      }
    } else {
      const { error } = await supabase.from('work_experiences').insert([payload]);

      if (!error) {
        await fetchData();
        closeModal();
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

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
  };

  const listItemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.25, ease: 'easeOut' },
    }),
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Work Experience</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Manage your professional work history shown on the site.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleImportLegacy}
            disabled={importing}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center gap-2"
          >
            {importing && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {importing ? 'Importing...' : '⬆ Import Legacy'}
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors duration-200"
          >
            + Add Experience
          </button>
        </div>
      </motion.div>
      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-zinc-500">Loading...</div>
      ) : experiences.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 text-zinc-500 border border-dashed border-zinc-700 rounded-xl"
        >
          <p className="text-lg mb-2">No work experiences yet.</p>
          <p className="text-sm">Click "Add Experience" to get started.</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.id}
              custom={i}
              variants={listItemVariants}
              initial="hidden"
              animate="visible"
              className={`flex items-start justify-between gap-4 p-5 rounded-xl border transition-colors duration-200 ${
                exp.is_active
                  ? 'bg-zinc-900 border-zinc-700 hover:border-zinc-600'
                  : 'bg-zinc-950 border-zinc-800 opacity-60'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-semibold">{exp.role}</span>
                  <span className="text-zinc-400 text-sm">at</span>
                  <span className="text-indigo-400 font-medium">{exp.company}</span>
                  {!exp.is_active && (
                    <span className="text-xs bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">
                      Hidden
                    </span>
                  )}
                </div>
                <div className="text-zinc-500 text-sm mt-1 flex items-center gap-2">
                  <span>{exp.period}</span>
                  {exp.city && (
                    <>
                      <span>·</span>
                      <span>{exp.city}</span>
                    </>
                  )}
                </div>
                {exp.description && (
                  <p className="text-zinc-400 text-sm mt-2 line-clamp-2">{exp.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEditModal(exp)}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors duration-150"
                >
                  Edit
                </button>
                <button
                  onClick={() => openDeleteModal(exp.id)}
                  className="px-3 py-1.5 text-xs font-medium text-red-400 bg-red-900/20 hover:bg-red-900/40 rounded-lg transition-colors duration-150"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              key="backdrop"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
              onClick={() => !saving && closeModal()}
            />
            <motion.div
              key="modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-white mb-5">
                    {editingId ? 'Edit Experience' : 'Add Experience'}
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Company */}
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1.5">
                        Company <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        required
                        placeholder="e.g. Google"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1.5">
                        Role / Title <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                        placeholder="e.g. Senior Frontend Engineer"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    {/* Period + City row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-zinc-400 mb-1.5">
                          Period <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={period}
                          onChange={(e) => setPeriod(e.target.value)}
                          required
                          placeholder="e.g. Jan 2022 – Present"
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-zinc-400 mb-1.5">
                          City <span className="text-zinc-600 text-xs">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Jakarta"
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1.5">
                        Description <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows={4}
                        placeholder="Briefly describe your role and key responsibilities..."
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                      />
                    </div>

                    {/* Sort Order + Active row */}
                    <div className="grid grid-cols-2 gap-3 items-center">
                      <div>
                        <label className="block text-sm text-zinc-400 mb-1.5">Sort Order</label>
                        <input
                          type="number"
                          value={sortOrder}
                          onChange={(e) => setSortOrder(Number(e.target.value))}
                          min={1}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div className="flex items-center gap-3 pt-5">
                        <button
                          type="button"
                          onClick={() => setIsActive(!isActive)}
                          className={`relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                            isActive ? 'bg-indigo-600' : 'bg-zinc-700'
                          }`}
                        >
                          <span
                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                              isActive ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className="text-sm text-zinc-400">
                          {isActive ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={closeModal}
                        disabled={saving}
                        className="px-4 py-2 text-sm text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {saving && (
                          <svg
                            className="animate-spin w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8z"
                            />
                          </svg>
                        )}
                        {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Experience'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <>
            <motion.div
              key="delete-backdrop"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
              onClick={() => !saving && setIsDeleteModalOpen(false)}
            />
            <motion.div
              key="delete-modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm shadow-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-2">Delete Experience</h2>
                <p className="text-zinc-400 text-sm mb-6">
                  Are you sure? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={saving}
                    className="px-4 py-2 text-sm text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={saving}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving && (
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                    )}
                    {saving ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
