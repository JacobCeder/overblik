'use client';

import { useOverview } from '@/context/OverviewContext';
import WelcomeScreen from './WelcomeScreen';
import OverviewEditor from './OverviewEditor';

export default function NewsOverviewApp() {
  const { state } = useOverview();

  if (!state.currentOverview) {
    return <WelcomeScreen />;
  }

  return <OverviewEditor />;
}