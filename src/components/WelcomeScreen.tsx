'use client';

import { useState } from 'react';
import { useOverviewActions } from '@/context/OverviewContext';
import LoadExistingOverview from './LoadExistingOverview';

export default function WelcomeScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { createNewOverview } = useOverviewActions();

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      createNewOverview(title.trim(), description.trim() || undefined);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">
            News Overview Manager
          </h1>
          <p className="text-sm text-gray-600">
            Create and manage collections of news articles
          </p>
        </div>
        
        <div className="space-y-6">
          <form onSubmit={handleCreateNew} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Create New Overview
              </label>
              <input
                type="text"
                placeholder="Enter overview title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input w-full"
                required
              />
            </div>
            <div>
              <textarea
                placeholder="Optional description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea w-full h-20"
              />
            </div>
            <button type="submit" className="btn btn-primary w-full">
              Create Overview
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-500">or</span>
            </div>
          </div>

          <LoadExistingOverview />
        </div>
      </div>
    </div>
  );
}