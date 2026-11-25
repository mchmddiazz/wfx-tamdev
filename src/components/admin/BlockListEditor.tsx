import { useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import { uploadPortfolioFile } from '../../lib/storage';
import {
  CertificateBlockItem,
  ProjectBlockItem,
  WorkExperienceBlockItem,
} from '../../types/cms';

type BlockType = 'projects' | 'experience' | 'certificates';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createDefaultItem(blockType: BlockType): any {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  if (blockType === 'projects') {
    const item: ProjectBlockItem = {
      id: `proj-${suffix}`,
      title: 'New Project',
      category: 'Web Development',
      description: '',
      thumbnail_url: '',
      live_url: null,
      repo_url: null,
      tech_stack: [],
      is_published: true,
    };
    return item;
  }
  if (blockType === 'experience') {
    const item: WorkExperienceBlockItem = {
      id: `exp-${suffix}`,
      company: 'New Company',
      role: 'Role Title',
      period: '2026 - Present',
      city: '',
      description: '',
      is_active: true,
    };
    return item;
  }
  const item: CertificateBlockItem = {
    id: `cert-${suffix}`,
    title: 'New Certificate',
    issuer: 'Issuer',
    date: '2026',
    credential_url: '',
    image_url: '',
    is_active: true,
  };
  return item;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getItemTitle(blockType: BlockType, item: any, index: number): string {
  if (blockType === 'projects') return item.title || `Project ${index + 1}`;
  if (blockType === 'experience') {
    return item.company
      ? `${item.company}${item.role ? ` — ${item.role}` : ''}`
      : `Experience ${index + 1}`;
  }
  return item.title || `Certificate ${index + 1}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isItemActive(blockType: BlockType, item: any): boolean {
  if (blockType === 'projects') return item.is_published !== false;
  return item.is_active !== false;
}

export function BlockListEditor({
  blockType,
  items,
  onChange,
}: {
  blockType: BlockType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (next: any[]) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [techInputs, setTechInputs] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const safeItems = Array.isArray(items) ? items : [];

  const handleMove = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= safeItems.length) return;
    const next = [...safeItems];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    onChange(next);
  };

  const handleToggleActive = (index: number) => {
    const activeKey = blockType === 'projects' ? 'is_published' : 'is_active';
    const next = safeItems.map((item, idx) =>
      idx === index ? { ...item, [activeKey]: !isItemActive(blockType, item) } : item
    );
    onChange(next);
  };

  const handleDelete = (index: number) => {
    const removed = safeItems[index];
    if (removed?.id && expandedId === removed.id) {
      setExpandedId(null);
    }
    onChange(safeItems.filter((_, idx) => idx !== index));
  };

  const handleUpdateField = (
    index: number,
    key: string,
    value: string | boolean | string[] | null
  ) => {
    const next = safeItems.map((item, idx) =>
      idx === index ? { ...item, [key]: value } : item
    );
    onChange(next);
  };

  const handleAddItem = () => {
    const newItem = createDefaultItem(blockType);
    onChange([...safeItems, newItem]);
    setExpandedId(newItem.id);
  };

  const handleImageUpload = async (
    index: number,
    itemId: string,
    file: File | undefined
  ) => {
    if (!file) return;
    setUploadingId(itemId);
    try {
      const folder = blockType === 'projects' ? 'projects' : 'certificates';
      const fieldKey = blockType === 'projects' ? 'thumbnail_url' : 'image_url';
      const url = await uploadPortfolioFile(file, folder);
      handleUpdateField(index, fieldKey, url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload image';
      alert(msg);
    } finally {
      setUploadingId(null);
    }
  };

  const inputClass =
    'w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-orange-500';
  const labelClass = 'block text-[11px] text-neutral-400 mb-1';

  return (
    <div className="space-y-2">
      {safeItems.length === 0 ? (
        <p className="text-[11px] text-neutral-500 italic py-2">
          No items yet. Add one below or seed from existing CMS data.
        </p>
      ) : (
        <div className="space-y-1.5">
          {safeItems.map((item, idx) => {
            const itemId = item.id || `item-${idx}`;
            const isExpanded = expandedId === itemId;
            const active = isItemActive(blockType, item);

            return (
              <div
                key={itemId}
                className={`rounded-lg border transition ${
                  active
                    ? 'bg-neutral-800/60 border-neutral-700/80'
                    : 'bg-neutral-900/50 border-neutral-800 opacity-65'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5 px-2.5 py-2">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : itemId)}
                    className="flex items-center gap-1.5 min-w-0 flex-1 text-left"
                  >
                    {isExpanded ? (
                      <ChevronDown size={13} className="shrink-0 text-neutral-400" />
                    ) : (
                      <ChevronRight size={13} className="shrink-0 text-neutral-400" />
                    )}
                    <span className="text-xs font-medium text-white truncate">
                      {getItemTitle(blockType, item, idx)}
                    </span>
                  </button>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMove(idx, -1)}
                      disabled={idx === 0}
                      className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-700 disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 1)}
                      disabled={idx === safeItems.length - 1}
                      className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-700 disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(idx)}
                      className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-700"
                      title={active ? 'Set Inactive' : 'Set Active'}
                    >
                      {active ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(idx)}
                      className="p-1 rounded text-neutral-400 hover:text-red-400 hover:bg-neutral-700"
                      title="Delete Item"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-2.5 pb-3 pt-2 border-t border-neutral-700/60 space-y-2.5">
                    {blockType === 'projects' && (
                      <>
                        <div>
                          <label className={labelClass}>Title</label>
                          <input
                            type="text"
                            value={item.title || ''}
                            onChange={(e) => handleUpdateField(idx, 'title', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Category</label>
                          <input
                            type="text"
                            value={item.category || ''}
                            onChange={(e) => handleUpdateField(idx, 'category', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Description</label>
                          <textarea
                            rows={3}
                            value={item.description || ''}
                            onChange={(e) =>
                              handleUpdateField(idx, 'description', e.target.value)
                            }
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Thumbnail URL</label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={item.thumbnail_url || ''}
                              placeholder="https://..."
                              onChange={(e) =>
                                handleUpdateField(idx, 'thumbnail_url', e.target.value)
                              }
                              className={inputClass}
                            />
                            <input
                              ref={(el) => {
                                fileInputRefs.current[itemId] = el;
                              }}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                handleImageUpload(idx, itemId, e.target.files?.[0]);
                                e.target.value = '';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRefs.current[itemId]?.click()}
                              disabled={uploadingId === itemId}
                              className="px-2.5 py-1.5 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white text-[11px] shrink-0 flex items-center gap-1 disabled:opacity-50"
                              title="Upload Thumbnail"
                            >
                              <Upload size={11} />
                              {uploadingId === itemId ? '...' : 'Upload'}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Tech Stack (comma-separated)</label>
                          <input
                            type="text"
                            value={
                              techInputs[itemId] ??
                              (Array.isArray(item.tech_stack)
                                ? item.tech_stack.join(', ')
                                : '')
                            }
                            placeholder="React, TypeScript, Tailwind"
                            onChange={(e) => {
                              const raw = e.target.value;
                              setTechInputs((prev) => ({ ...prev, [itemId]: raw }));
                              const parsed = raw
                                .split(',')
                                .map((s) => s.trim())
                                .filter(Boolean);
                              handleUpdateField(idx, 'tech_stack', parsed);
                            }}
                            onBlur={() => {
                              setTechInputs((prev) => {
                                const copy = { ...prev };
                                delete copy[itemId];
                                return copy;
                              });
                            }}
                            className={inputClass}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className={labelClass}>Live URL</label>
                            <input
                              type="text"
                              value={item.live_url || ''}
                              placeholder="https://..."
                              onChange={(e) =>
                                handleUpdateField(
                                  idx,
                                  'live_url',
                                  e.target.value.trim() ? e.target.value : null
                                )
                              }
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Repo URL</label>
                            <input
                              type="text"
                              value={item.repo_url || ''}
                              placeholder="https://..."
                              onChange={(e) =>
                                handleUpdateField(
                                  idx,
                                  'repo_url',
                                  e.target.value.trim() ? e.target.value : null
                                )
                              }
                              className={inputClass}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {blockType === 'experience' && (
                      <>
                        <div>
                          <label className={labelClass}>Company</label>
                          <input
                            type="text"
                            value={item.company || ''}
                            onChange={(e) => handleUpdateField(idx, 'company', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Role</label>
                          <input
                            type="text"
                            value={item.role || ''}
                            onChange={(e) => handleUpdateField(idx, 'role', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className={labelClass}>Period</label>
                            <input
                              type="text"
                              value={item.period || ''}
                              placeholder="Sep 2024 - Present"
                              onChange={(e) => handleUpdateField(idx, 'period', e.target.value)}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>City (optional)</label>
                            <input
                              type="text"
                              value={item.city || ''}
                              placeholder="Bandung, Indonesia"
                              onChange={(e) => handleUpdateField(idx, 'city', e.target.value)}
                              className={inputClass}
                            />
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Description</label>
                          <textarea
                            rows={3}
                            value={item.description || ''}
                            onChange={(e) =>
                              handleUpdateField(idx, 'description', e.target.value)
                            }
                            className={inputClass}
                          />
                        </div>
                      </>
                    )}

                    {blockType === 'certificates' && (
                      <>
                        <div>
                          <label className={labelClass}>Certificate Title</label>
                          <input
                            type="text"
                            value={item.title || ''}
                            onChange={(e) => handleUpdateField(idx, 'title', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className={labelClass}>Issuer</label>
                            <input
                              type="text"
                              value={item.issuer || ''}
                              onChange={(e) => handleUpdateField(idx, 'issuer', e.target.value)}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Date</label>
                            <input
                              type="text"
                              value={item.date || ''}
                              placeholder="2026"
                              onChange={(e) => handleUpdateField(idx, 'date', e.target.value)}
                              className={inputClass}
                            />
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Credential URL (optional)</label>
                          <input
                            type="text"
                            value={item.credential_url || ''}
                            placeholder="https://..."
                            onChange={(e) =>
                              handleUpdateField(idx, 'credential_url', e.target.value)
                            }
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Certificate Image URL</label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={item.image_url || ''}
                              placeholder="https://..."
                              onChange={(e) =>
                                handleUpdateField(idx, 'image_url', e.target.value)
                              }
                              className={inputClass}
                            />
                            <input
                              ref={(el) => {
                                fileInputRefs.current[itemId] = el;
                              }}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                handleImageUpload(idx, itemId, e.target.files?.[0]);
                                e.target.value = '';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRefs.current[itemId]?.click()}
                              disabled={uploadingId === itemId}
                              className="px-2.5 py-1.5 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white text-[11px] shrink-0 flex items-center gap-1 disabled:opacity-50"
                              title="Upload Certificate Image"
                            >
                              <Upload size={11} />
                              {uploadingId === itemId ? '...' : 'Upload'}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={handleAddItem}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-neutral-700 hover:border-orange-500 text-[11px] font-semibold text-orange-400 hover:text-orange-300 hover:bg-orange-500/5 transition"
      >
        <Plus size={12} />
        Add Item
      </button>
    </div>
  );
}
