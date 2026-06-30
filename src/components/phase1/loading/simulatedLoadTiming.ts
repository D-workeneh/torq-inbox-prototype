export type SimulatedLoadProfile = 'default' | 'workspace-switch' | 'cases';

const CROSS_WORKSPACE_LOAD_MIN_MS = 5000;
const CROSS_WORKSPACE_LOAD_MAX_MS = 8000;

/** Random loader duration when opening another workspace (notification center spec: ~5–8s) */
export function getCrossWorkspaceOverlayLoadMs(): number {
  const span = CROSS_WORKSPACE_LOAD_MAX_MS - CROSS_WORKSPACE_LOAD_MIN_MS + 1;
  return CROSS_WORKSPACE_LOAD_MIN_MS + Math.floor(Math.random() * span);
}

/** Total simulated load ~10s (platform range 1.5–15s, prototype centers on 10s) */
export function getSimulatedLoadDurations(profile: SimulatedLoadProfile = 'default') {
  if (profile === 'workspace-switch') {
    const totalMs = 900 + Math.floor(Math.random() * 400);
    const spinnerMs = Math.round(totalMs * 0.5);
    return {
      totalMs,
      spinnerMs,
      skeletonMs: totalMs - spinnerMs,
    };
  }
  if (profile === 'cases') {
    const totalMs = 4500 + Math.floor(Math.random() * 1000);
    const spinnerShare = 0.28 + Math.random() * 0.12;
    const spinnerMs = Math.round(totalMs * spinnerShare);
    return {
      totalMs,
      spinnerMs,
      skeletonMs: totalMs - spinnerMs,
    };
  }
  const totalMs = 9000 + Math.floor(Math.random() * 2000);
  const spinnerShare = 0.28 + Math.random() * 0.12;
  const spinnerMs = Math.round(totalMs * spinnerShare);
  return {
    totalMs,
    spinnerMs,
    skeletonMs: totalMs - spinnerMs,
  };
}
