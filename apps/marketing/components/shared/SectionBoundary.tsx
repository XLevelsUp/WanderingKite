'use client';

import React from 'react';
import { logger } from '@/lib/logger';

type Props = { name: string; fallback: React.ReactNode; children: React.ReactNode };

/** Catches a render crash inside one section so the rest of the page keeps working (the route error.tsx would replace the whole page). */
export class SectionBoundary extends React.Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    logger.error(`[SectionBoundary:${this.props.name}]`, error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
