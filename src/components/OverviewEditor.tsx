'use client';

import { useOverview } from '@/context/OverviewContext';
import ArticleList from './ArticleList';
import ArticleViewer from './ArticleViewer';
import Header from './Header';

export default function OverviewEditor() {
  const { state } = useOverview();

  if (!state.currentOverview) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/3">
          <ArticleList />
        </div>
        <div className="w-2/3">
          <ArticleViewer />
        </div>
      </div>
    </div>
  );
}