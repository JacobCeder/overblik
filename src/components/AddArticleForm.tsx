'use client';

import { useState } from 'react';
import { useOverviewActions } from '@/context/OverviewContext';
import RichTextEditor from './RichTextEditor';

interface AddArticleFormProps {
  onClose: () => void;
}

export default function AddArticleForm({ onClose }: AddArticleFormProps) {
  const { addArticle } = useOverviewActions();
  const [formData, setFormData] = useState({
    heading: '',
    subheading: '',
    author: '',
    body: '',
    mediaName: '',
    mediaUrl: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const articleData = {
      heading: formData.heading.trim(),
      subheading: formData.subheading.trim(),
      author: formData.author.trim(),
      body: formData.body.trim(),
      mediaName: formData.mediaName.trim() || undefined,
      mediaUrl: formData.mediaUrl.trim() || undefined,
      date: new Date(formData.date)
    };

    addArticle(articleData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded border border-gray-200 w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-medium text-gray-900">Add New Article</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heading
            </label>
            <input
              type="text"
              name="heading"
              value={formData.heading}
              onChange={handleChange}
              className="input w-full"
              placeholder="Enter article heading"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subheading
            </label>
            <input
              type="text"
              name="subheading"
              value={formData.subheading}
              onChange={handleChange}
              className="input w-full"
              placeholder="Enter article subheading"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Author
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="input w-full"
                placeholder="Author name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input w-full"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source (optional)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                name="mediaName"
                value={formData.mediaName}
                onChange={handleChange}
                className="input w-full"
                placeholder="e.g., CNN, BBC News, Reuters"
              />
              <input
                type="url"
                name="mediaUrl"
                value={formData.mediaUrl}
                onChange={handleChange}
                className="input w-full"
                placeholder="e.g., https://cnn.com/2024/climate-summit"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <RichTextEditor
              content={formData.body}
              onChange={(html) => setFormData(prev => ({ ...prev, body: html }))}
              placeholder="Write your article content here..."
            />
          </div>
        </form>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="btn"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-article-form"
            onClick={handleSubmit}
            className="btn btn-primary"
          >
            Add Article
          </button>
        </div>
      </div>
    </div>
  );
}