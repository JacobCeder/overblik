'use client';

import { OverviewProvider } from '@/context/OverviewContext';
import NewsOverviewApp from '@/components/NewsOverviewApp';

export default function Home() {
  return (
    <OverviewProvider>
      <NewsOverviewApp />
    </OverviewProvider>
  );
}
