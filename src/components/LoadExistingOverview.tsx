'use client';

import { useState, useRef, useEffect } from 'react';
import { useOverview } from '@/context/OverviewContext';
import { getStoredOverviews, importOverviewFromJson } from '@/utils/storage';
import { NewsOverview } from '@/types';

export default function LoadExistingOverview() {
  const { dispatch } = useOverview();
  const [showStoredOverviews, setShowStoredOverviews] = useState(false);
  const [storedOverviews, setStoredOverviews] = useState<NewsOverview[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showStoredOverviews && storedOverviews.length === 0) {
      loadStoredOverviews();
    }
  }, [showStoredOverviews, storedOverviews.length]);

  const loadStoredOverviews = async () => {
    setLoading(true);
    try {
      const overviews = await getStoredOverviews();
      setStoredOverviews(overviews);
    } catch (error) {
      console.error('Failed to load overviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadStored = (overview: NewsOverview) => {
    dispatch({ type: 'SET_OVERVIEW', payload: overview });
    setShowStoredOverviews(false);
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const overview = await importOverviewFromJson(file);
      dispatch({ type: 'SET_OVERVIEW', payload: overview });
    } catch {
      alert('Failed to import overview. Please check the file format.');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <button
        className="btn w-full"
        onClick={() => setShowStoredOverviews(!showStoredOverviews)}
      >
        Load Recent Overview
      </button>

      <button
        className="btn w-full"
        onClick={() => fileInputRef.current?.click()}
      >
        Import from File
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileImport}
        className="hidden"
      />

      {showStoredOverviews && (
        <div className="mt-4 border border-gray-200 rounded max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-500 text-sm">
              Loading overviews...
            </div>
          ) : storedOverviews.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">
              No saved overviews found
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {storedOverviews.map((overview) => (
                <button
                  key={overview.id}
                  onClick={() => handleLoadStored(overview)}
                  className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900 text-sm truncate">
                    {overview.title}
                  </div>
                  <div className="text-xs text-gray-500 truncate mt-1">
                    {overview.articles.length} articles • {overview.updatedAt.toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}