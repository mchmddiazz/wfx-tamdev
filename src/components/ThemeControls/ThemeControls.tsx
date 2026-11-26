import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function ThemeControls() {
  const { saveDraft, publishTheme, theme } = useTheme();

  const handleSave = () => {
    // Example draft payload; could be extended later
    saveDraft({ foo: 'bar' });
  };

  const handlePublish = () => {
    publishTheme();
  };

  return (
    <div className="flex gap-2">
      <button data-testid="save-draft" onClick={handleSave} className="px-3 py-1 bg-blue-500 text-white rounded">
        Save Draft
      </button>
      <button data-testid="publish-theme" onClick={handlePublish} className="px-3 py-1 bg-green-500 text-white rounded">
        Publish Theme
      </button>
    </div>
  );
}
