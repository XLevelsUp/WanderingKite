'use client';

import { useContext } from 'react';
import { NotificationContext } from '@/components/ui/NotificationProvider';

export function useNotify() {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotify must be used within a NotificationProvider');
  }
  
  return context;
}
