'use client';

import { useOverview, useOverviewActions } from '@/context/OverviewContext';
import { useState, useRef, useEffect } from 'react';
import RichTextEditor from './RichTextEditor';

export default function ArticleViewer() {
  const { state } = useOverview();
  const { updateArticle } = useOverviewActions();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<Record<string, string>>({});

  const selectedArticle = state.currentOverview?.articles.find(
    article => article.id === state.selectedArticleId
  );

  const handleFieldEdit = (field: string, value: string) => {
    setEditingField(field);
    setTempValues({ ...tempValues, [field]: value });
  };

  const handleFieldSave = (field: string) => {
    if (!selectedArticle) return;
    
    const value = tempValues[field];
    if (value !== undefined) {
      const updatedArticle = { ...selectedArticle };
      
      switch (field) {
        case 'heading':
          updatedArticle.heading = value;
          break;
        case 'subheading':
          updatedArticle.subheading = value;
          break;
        case 'author':
          updatedArticle.author = value;
          break;
        case 'date':
          updatedArticle.date = new Date(value);
          break;
        case 'mediaName':
          updatedArticle.mediaName = value || undefined;
          break;
        case 'mediaUrl':
          updatedArticle.mediaUrl = value || undefined;
          break;
        case 'body':
          updatedArticle.body = value;
          break;
      }
      
      updateArticle(updatedArticle);
    }
    
    setEditingField(null);
    setTempValues({});
  };

  const handleFieldCancel = () => {
    setEditingField(null);
    setTempValues({});
  };

  const EditableField = ({ 
    field, 
    value, 
    component = 'input',
    className = '',
    placeholder = ''
  }: {
    field: string;
    value: string;
    component?: 'input' | 'textarea';
    className?: string;
    placeholder?: string;
  }) => {
    const isEditing = editingField === field;
    const currentValue = isEditing ? (tempValues[field] ?? value) : value;
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
        if (component === 'textarea') {
          const textarea = inputRef.current as HTMLTextAreaElement;
          textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        }
      }
    }, [isEditing, component]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (component === 'input' || e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleFieldSave(field);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleFieldCancel();
      }
    };

    if (isEditing) {
      if (component === 'textarea') {
        return (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={currentValue}
            onChange={(e) => setTempValues({ ...tempValues, [field]: e.target.value })}
            onBlur={() => handleFieldSave(field)}
            onKeyDown={handleKeyDown}
            className={`textarea ${className}`}
            placeholder={placeholder}
            rows={Math.max(3, currentValue.split('\n').length)}
          />
        );
      } else {
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={currentValue}
            onChange={(e) => setTempValues({ ...tempValues, [field]: e.target.value })}
            onBlur={() => handleFieldSave(field)}
            onKeyDown={handleKeyDown}
            className={className}
            placeholder={placeholder}
            type={field === 'date' ? 'date' : field === 'mediaUrl' ? 'url' : 'text'}
          />
        );
      }
    }

    return (
      <div
        className={`${className} border border-transparent rounded cursor-text hover:border-gray-200 hover:bg-gray-50 transition-colors p-2 min-h-[2.5rem] flex items-center`}
        onClick={() => handleFieldEdit(field, value)}
        title="Click to edit"
      >
        {value || <span className="text-gray-400">{placeholder}</span>}
      </div>
    );
  };

  if (!selectedArticle) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-base font-medium">Select an article to view</p>
          <p className="text-sm mt-1">Choose an article from the left panel to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-lg font-medium text-gray-900">Article Editor</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Heading */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heading
            </label>
            <EditableField
              field="heading"
              value={selectedArticle.heading}
              className="input w-full text-xl font-semibold"
              placeholder="e.g., Breaking: Major Climate Summit Announced"
            />
          </div>

          {/* Subheading */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subheading
            </label>
            <EditableField
              field="subheading"
              value={selectedArticle.subheading}
              className="input w-full text-lg"
              placeholder="e.g., World leaders to gather in Copenhagen next month"
            />
          </div>

          {/* Author and Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Author
              </label>
              <EditableField
                field="author"
                value={selectedArticle.author}
                className="input w-full"
                placeholder="e.g., Jane Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <EditableField
                field="date"
                value={selectedArticle.date.toISOString().split('T')[0]}
                className="input w-full"
                placeholder="Select date"
              />
            </div>
          </div>

          {/* Source */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Media Source
              </label>
              <EditableField
                field="mediaName"
                value={selectedArticle.mediaName || ''}
                className="input w-full"
                placeholder="e.g., CNN, BBC News, Reuters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article URL
              </label>
              <EditableField
                field="mediaUrl"
                value={selectedArticle.mediaUrl || ''}
                className="input w-full"
                placeholder="e.g., https://cnn.com/2024/climate-summit"
              />
            </div>
          </div>

          {/* Source Link Preview */}
          {(selectedArticle.mediaName || selectedArticle.mediaUrl) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source Information
              </label>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="text-sm">
                  {selectedArticle.mediaName && (
                    <div className="font-medium text-gray-900 mb-1">
                      Source: {selectedArticle.mediaName}
                    </div>
                  )}
                  {selectedArticle.mediaUrl && (
                    <div className="text-blue-600 hover:text-blue-800">
                      <a 
                        href={selectedArticle.mediaUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline break-all"
                      >
                        {selectedArticle.mediaUrl}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Article Content
            </label>
            {editingField === 'body' ? (
              <RichTextEditor
                content={tempValues.body ?? selectedArticle.body}
                onChange={(html) => setTempValues({ ...tempValues, body: html })}
                onBlur={() => handleFieldSave('body')}
                placeholder="Write your article content here. Use the toolbar above to format text, add links, and more..."
                className="min-h-[400px]"
              />
            ) : (
              <div
                className="editable-field border border-gray-200 rounded-lg p-4 min-h-[400px] cursor-text hover:border-gray-300 transition-colors"
                onClick={() => handleFieldEdit('body', selectedArticle.body)}
                title="Click to edit content"
              >
                {selectedArticle.body ? (
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedArticle.body }}
                  />
                ) : (
                  <p className="text-gray-400">Write your article content here. Click to start editing...</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}