'use client';

import { useState } from 'react';
import { useOverview, useOverviewActions } from '@/context/OverviewContext';
import AddArticleForm from './AddArticleForm';

export default function ArticleList() {
  const { state } = useOverview();
  const { selectArticle, deleteArticle, reorderArticles } = useOverviewActions();
  const [showForm, setShowForm] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const articles = state.currentOverview?.articles || [];

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
    
    // Add visual feedback to the dragged element
    const target = e.target as HTMLElement;
    requestAnimationFrame(() => {
      target.classList.add('dragging');
    });
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    target.classList.remove('dragging');
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newArticles = [...articles];
    const draggedArticle = newArticles[draggedIndex];
    
    newArticles.splice(draggedIndex, 1);
    newArticles.splice(dropIndex, 0, draggedArticle);
    
    const reorderedArticles = newArticles.map((article, index) => ({
      ...article,
      order: index,
    }));

    reorderArticles(reorderedArticles);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDelete = (articleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this article?')) {
      deleteArticle(articleId);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-600">Articles</h2>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-small"
          >
            Add Article
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {articles.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            <div className="text-3xl mb-2">📄</div>
            <p className="text-sm">No articles yet</p>
            <p className="text-xs mt-1">Click &quot;Add Article&quot; to get started</p>
          </div>
        ) : (
          <div>
            {articles.map((article, index) => (
              <div key={article.id}>
                {/* Drop zone indicator */}
                {dragOverIndex === index && draggedIndex !== null && draggedIndex !== index && (
                  <div className="drop-zone active" />
                )}
                
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onClick={() => selectArticle(article.id)}
                  className={`article-item p-4 border-b border-gray-50 relative ${
                    state.selectedArticleId === article.id ? 'selected' : ''
                  } ${draggedIndex === index ? 'dragging' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Drag handle */}
                    <div 
                      className="drag-handle mt-1"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      ⋮⋮
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm truncate leading-snug">
                        {article.heading}
                      </h3>
                      <p className="text-xs text-gray-600 truncate mt-1 leading-relaxed">
                        {article.subheading}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-400">
                        <span>{article.author}</span>
                        <span className="mx-2">•</span>
                        <span>{article.date.toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => handleDelete(article.id, e)}
                      className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none p-1"
                      title="Delete article"
                    >
                      ×
                    </button>
                  </div>
                </div>
                
                {/* Drop zone at the end */}
                {index === articles.length - 1 && dragOverIndex === articles.length && (
                  <div className="drop-zone active" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <AddArticleForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}