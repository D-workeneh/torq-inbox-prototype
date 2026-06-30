import type { Phase1Tab } from './types';

export const PHASE1_INBOX_TAB_STORAGE_KEY = 'torq-phase1-inbox-tab';

export function loadPhase1InboxTab(): Phase1Tab {
  if (typeof window === 'undefined') return 'all';
  try {
    const stored = window.localStorage.getItem(PHASE1_INBOX_TAB_STORAGE_KEY);
    if (stored === 'all' || stored === 'unread') return stored;
  } catch {
    /* ignore */
  }
  return 'all';
}

export function savePhase1InboxTab(tab: Phase1Tab) {
  try {
    window.localStorage.setItem(PHASE1_INBOX_TAB_STORAGE_KEY, tab);
  } catch {
    /* ignore */
  }
}
