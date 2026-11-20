import { useEffect, useState, FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadPortfolioFile } from '../../lib/storage';
import { SiteProfile } from '../../types/cms';
import defaultProfileImg from '../../assets/img/profile.webp';

type ActiveModal = 'hero' | 'about' | 'cv' | null;

export default function ManageProfile() {
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [saving, setSaving] = useState(false);

  // Saved database values (displayed on summary cards)
  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [bio, setBio] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [resumePdfUrl, setResumePdfUrl] = useState<string | null>(null);

  // Modal draft states (so cancelling doesn't mutate preview cards)
  const [draftHeadline, setDraftHeadline] = useState('');
  const [draftSubheadline, setDraftSubheadline] = useState('');
  const [draftBio, setDraftBio] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_profile')
        .select('*')
        .eq('id', 1)
        .single();

      if (!error && data) {
        const profile = data as SiteProfile;
        setHeadline(profile.headline);
        setSubheadline(profile.subheadline);
        setBio(profile.bio);
        setProfileImageUrl(profile.profile_image_url);
        setResumePdfUrl(profile.resume_pdf_url);
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModal && !saving) {
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, saving]);

  const openHeroModal = () => {
    setDraftHeadline(headline);
    setActiveModal('hero');
  };

  const openAboutModal = () => {
    setDraftSubheadline(subheadline);
    setDraftBio(bio);
    setImageFile(null);
    setActiveModal('about');
  };

  const openCvModal = () => {
    setResumeFile(null);
    setActiveModal('cv');
  };

  const closeModal = () => {
    if (saving) return;
    setActiveModal(null);
  };

  // 1. Save Hero Section
  const handleSaveHero = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('site_profile')
        .update({
          headline: draftHeadline,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1);

      if (error) throw error;

      setHeadline(draftHeadline);
      setActiveModal(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to save Hero');
    } finally {
      setSaving(false);
    }
  };

  // 2. Save About Section
  const handleSaveAbout = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let finalImageUrl = profileImageUrl;

      if (imageFile) {
        finalImageUrl = await uploadPortfolioFile(imageFile, 'profile');
      }

      const { error } = await supabase
        .from('site_profile')
        .update({
          subheadline: draftSubheadline,
          bio: draftBio,
          profile_image_url: finalImageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1);

      if (error) throw error;

      setSubheadline(draftSubheadline);
      setBio(draftBio);
      setProfileImageUrl(finalImageUrl);
      setImageFile(null);
      setActiveModal(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to save About');
    } finally {
      setSaving(false);
    }
  };

  // 3. Save Resume / CV
  const handleSaveCv = async (e: FormEvent) => {
    e.preventDefault();

    if (!resumeFile) {
      alert('Please select a PDF file first.');
      return;
    }

    setSaving(true);

    try {
      const finalResumeUrl = await uploadPortfolioFile(resumeFile, 'resume');

      const { error } = await supabase
        .from('site_profile')
        .update({
          resume_pdf_url: finalResumeUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1);

      if (error) throw error;

      setResumePdfUrl(finalResumeUrl);
      setResumeFile(null);
      setActiveModal(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to upload CV');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-neutral-400">Loading profile settings...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-neutral-900/60 border border-neutral-800 p-5 rounded-xl">
        <h1 className="text-xl font-bold">Profile & Resume</h1>
        <p className="text-xs text-neutral-400 mt-0.5">
          Manage your Hero headline, About details, and downloadable CV independently.
        </p>
      </div>

      {/* SECTION 1 CARD: HERO */}
      <div className="bg-neutral-900/70 border border-neutral-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2 w-full max-w-2xl">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold">Hero Section</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">
              Headline
            </span>
          </div>
          <pre className="text-xs font-mono text-neutral-300 whitespace-pre-wrap bg-neutral-950/60 border border-neutral-800/80 rounded-lg p-3 max-w-xl">
            {headline || 'No headline set'}
          </pre>
        </div>

        <button
          type="button"
          onClick={openHeroModal}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition self-start shrink-0"
        >
          Edit Hero
        </button>
      </div>

      {/* SECTION 2 CARD: ABOUT */}
      <div className="bg-neutral-900/70 border border-neutral-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <h2 className="text-base font-semibold">About Section</h2>
            <p className="text-sm font-medium text-orange-400">{subheadline}</p>
            <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3">
              {bio}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openAboutModal}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition self-start shrink-0"
        >
          Edit About
        </button>
      </div>

      {/* SECTION 3 CARD: CV / RESUME */}
      <div className="bg-neutral-900/70 border border-neutral-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-semibold">Resume / CV (PDF)</h2>
          {resumePdfUrl ? (
            <a
              href={resumePdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs text-orange-400 hover:underline"
            >
              View Current Uploaded Resume PDF ↗
            </a>
          ) : (
            <p className="text-xs text-neutral-400">
              Using default bundled resume.pdf
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={openCvModal}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition self-start sm:self-center shrink-0"
        >
          Update CV
        </button>
      </div>

      {/* MODAL 1: EDIT HERO */}
      {activeModal === 'hero' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-5">
              <div>
                <h2 className="text-lg font-bold">Edit Hero Section</h2>
                <p className="text-xs text-neutral-400">
                  Press Enter for line breaks; periods "." turn orange automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="text-neutral-400 hover:text-white text-xl leading-none px-2"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveHero} className="space-y-4">
              <textarea
                required
                rows={7}
                value={draftHeadline}
                onChange={(e) => setDraftHeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm font-mono focus:outline-none focus:border-orange-500"
              />

              <div className="flex justify-end gap-3 border-t border-neutral-800 pt-4">
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
                  {saving ? 'Saving...' : 'Save Hero'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT ABOUT */}
      {activeModal === 'about' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-5">
              <h2 className="text-lg font-bold">Edit About Section</h2>
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="text-neutral-400 hover:text-white text-xl leading-none px-2"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveAbout} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">
                  About Greeting Heading *
                </label>
                <input
                  type="text"
                  required
                  value={draftSubheadline}
                  onChange={(e) => setDraftSubheadline(e.target.value)}
                  placeholder="Hi, I'm Diaz"
                  className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">About Bio *</label>
                <textarea
                  required
                  rows={5}
                  value={draftBio}
                  onChange={(e) => setDraftBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm leading-relaxed focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-2">
                  Profile Photo (WebP / JPG / PNG)
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={
                      imageFile
                        ? URL.createObjectURL(imageFile)
                        : profileImageUrl || defaultProfileImg
                    }
                    alt="Profile preview"
                    className="w-16 h-16 rounded-lg object-cover border border-neutral-700 bg-neutral-800 shrink-0"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-neutral-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-neutral-700 file:text-white hover:file:bg-neutral-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-neutral-800 pt-4">
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
                  {saving ? 'Saving...' : 'Save About'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: UPDATE CV */}
      {activeModal === 'cv' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-5">
              <h2 className="text-lg font-bold">Update Resume / CV</h2>
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="text-neutral-400 hover:text-white text-xl leading-none px-2"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveCv} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-2">
                  Select New PDF File *
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  required
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-neutral-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-neutral-700 file:text-white hover:file:bg-neutral-600"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-neutral-800 pt-4">
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
                  disabled={saving || !resumeFile}
                  className="px-5 py-2 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 disabled:opacity-50"
                >
                  {saving ? 'Uploading...' : 'Upload & Save CV'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}