import { useEffect, useState, FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadPortfolioFile } from '../../lib/storage';
import { Project } from '../../types/cms';
import { LEGACY_PROJECTS } from '../../data/LegacyProjects';

const ITEMS_PER_PAGE = 5;

export default function ManageProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Modal & editing states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [description, setDescription] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isPublished, setIsPublished] = useState(true);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProjects(data);
      const maxPage = Math.max(1, Math.ceil(data.length / ITEMS_PER_PAGE));
      setCurrentPage((prev) => Math.min(prev, maxPage));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) closeModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(projects.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProjects = projects.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingId) setSlug(generateSlug(val));
  };

  const openAddModal = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setCategory('Web Development');
    setDescription('');
    setLiveUrl('');
    setRepoUrl('');
    setTechStackInput('');
    setSortOrder(projects.length + 1);
    setIsPublished(true);
    setThumbnailUrl('');
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingId(project.id);
    setTitle(project.title);
    setSlug(project.slug);
    setCategory(project.category);
    setDescription(project.description);
    setLiveUrl(project.live_url || '');
    setRepoUrl(project.repo_url || '');
    setTechStackInput(project.tech_stack.join(', '));
    setSortOrder(project.sort_order);
    setIsPublished(project.is_published);
    setThumbnailUrl(project.thumbnail_url);
    setImageFile(null);
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
      let finalThumbnailUrl = thumbnailUrl;

      if (imageFile) {
        finalThumbnailUrl = await uploadPortfolioFile(imageFile, 'projects');
      }

      if (!finalThumbnailUrl) {
        alert('Please upload a project thumbnail image.');
        setSaving(false);
        return;
      }

      const payload = {
        title,
        slug: slug || generateSlug(title),
        category,
        description,
        thumbnail_url: finalThumbnailUrl,
        live_url: liveUrl || null,
        repo_url: repoUrl || null,
        tech_stack: techStackInput
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        sort_order: Number(sortOrder),
        is_published: isPublished,
        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        const { error } = await supabase
          .from('projects')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('projects').insert([payload]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      setEditingId(null);
      await fetchProjects();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save project';
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project permanently?')) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (!error) fetchProjects();
  };

  const handleImportLegacy = async () => {
    if (!confirm('Import all 8 existing portfolio projects into Supabase?')) return;
    setImporting(true);

    try {
      const existingSlugs = new Set(projects.map((p) => p.slug));

      for (const item of LEGACY_PROJECTS) {
        if (existingSlugs.has(item.slug)) continue;

        const response = await fetch(item.image);
        const blob = await response.blob();
        const file = new File([blob], `${item.slug}.webp`, { type: 'image/webp' });
        const uploadedUrl = await uploadPortfolioFile(file, 'projects');

        const { error } = await supabase.from('projects').insert([
          {
            title: item.title,
            slug: item.slug,
            category: item.category,
            description: item.description,
            thumbnail_url: uploadedUrl,
            live_url: item.live_url,
            repo_url: item.repo_url,
            tech_stack: item.technologies,
            sort_order: item.sort_order,
            is_published: true,
          },
        ]);

        if (error) throw error;
      }

      await fetchProjects();
      alert('Existing projects imported successfully!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Import failed';
      alert(message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/60 border border-neutral-800 p-5 rounded-xl">
        <div>
          <h1 className="text-xl font-bold">Projects ({projects.length})</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage portfolio case studies, ordering, and visibility.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {projects.length < LEGACY_PROJECTS.length && (
            <button
              type="button"
              onClick={handleImportLegacy}
              disabled={importing}
              className="px-3 py-2 text-xs font-medium rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-neutral-700 disabled:opacity-50"
            >
              {importing ? 'Importing...' : 'Import Legacy'}
            </button>
          )}
          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition"
          >
            + Add Project
          </button>
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <p className="text-sm text-neutral-400">Loading projects...</p>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-neutral-900/40 border border-dashed border-neutral-800 rounded-xl">
          <p className="text-sm text-neutral-400 mb-3">No projects in database yet.</p>
          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-white text-black hover:bg-neutral-200"
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3">
            {paginatedProjects.map((project) => (
              <div
                key={project.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/70 border border-neutral-800 p-4 rounded-xl hover:border-neutral-700 transition"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={project.thumbnail_url}
                    alt={project.title}
                    className="w-20 h-14 object-cover rounded bg-neutral-800 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{project.title}</h3>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          project.is_published
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {project.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {project.category} • Order: {project.sort_order}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {project.tech_stack.map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] px-1.5 py-0.5 bg-neutral-800 text-neutral-300 rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => openEditModal(project)}
                    className="px-3 py-1.5 text-xs rounded bg-neutral-800 hover:bg-neutral-700 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
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
                  {Math.min(startIndex + ITEMS_PER_PAGE, projects.length)}
                </strong>{' '}
                of <strong className="text-white">{projects.length}</strong> projects
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

      {/* Pop-Up Modal Form */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-5">
              <h2 className="text-lg font-bold">
                {editingId ? 'Edit Project' : 'Add New Project'}
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
                <label className="block text-xs text-neutral-400 mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. WFX Tele Dashboard"
                  className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">Slug *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="wfx-tele-dashboard"
                  className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Shopify Development / Web App"
                  className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">
                  Tech Stack (comma separated)
                </label>
                <input
                  type="text"
                  value={techStackInput}
                  onChange={(e) => setTechStackInput(e.target.value)}
                  placeholder="Shopify, Liquid, JavaScript"
                  className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">Live URL</label>
                <input
                  type="url"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">Repository URL</label>
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs text-neutral-400 mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief overview of the project..."
                  className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">
                  Thumbnail Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-neutral-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-neutral-700 file:text-white hover:file:bg-neutral-600"
                />
                {thumbnailUrl && !imageFile && (
                  <img
                    src={thumbnailUrl}
                    alt="Current thumbnail"
                    className="mt-2 h-14 w-24 object-cover rounded border border-neutral-700"
                  />
                )}
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-20 px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm mt-5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="rounded bg-neutral-800 border-neutral-700 accent-orange-600"
                  />
                  Published
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
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}