'use client';

import { useOverview } from '@/context/OverviewContext';
import { exportToWord } from '@/utils/wordExport';

export default function Header() {
  const { state } = useOverview();

  const handleNewOverview = () => {
    if (confirm('Are you sure you want to create a new overview? This will clear the current one.')) {
      // Reset to welcome screen
      window.location.reload();
    }
  };

  const handleExportToWord = async () => {
    if (!state.currentOverview) return;
    
    try {
      await exportToWord(state.currentOverview);
    } catch {
      alert('Failed to export to Word document. Please try again.');
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-gray-900">
            {state.currentOverview?.title}
          </h1>
          {state.currentOverview?.description && (
            <p className="text-sm text-gray-500 mt-1">
              {state.currentOverview.description}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs text-gray-400">
            {state.currentOverview?.articles.length} articles
          </span>
          <button
            onClick={handleExportToWord}
            className="btn btn-small"
          >
            Export to Word
          </button>
          <button
            onClick={handleNewOverview}
            className="btn btn-small"
          >
            New Overview
          </button>
        </div>
      </div>
    </header>
  );
}