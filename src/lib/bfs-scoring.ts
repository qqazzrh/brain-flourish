import { AgeBand, DemandProfile } from './types';

export interface NormBenchmarks {
  recall: number;
  lockin: number;
  sharpness: number;
}

const NORM_TABLE: Record<string, NormBenchmarks> = {
  'HIGH_18-24':     { recall: 78, lockin: 82, sharpness: 80 },
  'HIGH_25-29':     { recall: 80, lockin: 84, sharpness: 82 },
  'HIGH_30-34':     { recall: 79, lockin: 82, sharpness: 81 },
  'HIGH_35-44':     { recall: 76, lockin: 78, sharpness: 77 },
  'HIGH_45-54':     { recall: 72, lockin: 73, sharpness: 71 },
  'MODERATE_18-24': { recall: 71, lockin: 75, sharpness: 73 },
  'MODERATE_25-29': { recall: 73, lockin: 77, sharpness: 75 },
  'MODERATE_30-34': { recall: 72, lockin: 76, sharpness: 74 },
  'MODERATE_35-44': { recall: 69, lockin: 72, sharpness: 70 },
  'MODERATE_45-54': { recall: 65, lockin: 67, sharpness: 65 },
  'LOWER_18-24':    { recall: 64, lockin: 68, sharpness: 66 },
  'LOWER_25-29':    { recall: 66, lockin: 70, sharpness: 68 },
  'LOWER_30-34':    { recall: 65, lockin: 69, sharpness: 67 },
  'LOWER_35-44':    { recall: 62, lockin: 65, sharpness: 63 },
  'LOWER_45-54':    { recall: 58, lockin: 60, sharpness: 58 },
};

export function getProfileCell(demandProfile: DemandProfile, ageBand: AgeBand): string {
  return `${demandProfile}_${ageBand}`;
}

export function getBenchmarks(profileCell: string): NormBenchmarks | null {
  return NORM_TABLE[profileCell] || null;
}

export function estimatePercentile(rawScore: number, benchmark: number): number {
  return (rawScore / benchmark) * 80;
}

export function computeBFSComponent(rawScore: number, benchmark: number): number {
  const percentile = estimatePercentile(rawScore, benchmark);
  let component: number;
  if (percentile < 80) {
    // Zone 1: Below 80th percentile
    component = (percentile / 80) * 75;
  } else {
    // Zone 2: At or above 80th percentile
    component = 75 + ((percentile - 80) / (100 - 80)) * 25;
  }
  return Math.round(Math.min(100, Math.max(0, component)));
}

export interface BFSResult {
  profileCell: string;
  benchmarks: NormBenchmarks;
  // Percentile estimates
  recallPercentile: number;
  lockinPercentile: number;
  sharpnessPercentile: number;
  // BFS components
  recallBFS: number;
  lockinBFS: number;
  sharpnessBFS: number;
  // Composite
  bfsComposite: number;
  bfsTarget: number;
  bfsGap: number;
  bfsStatus: 'below_target' | 'at_target' | 'above_target';
}

export function computeBFS(
  recallRaw: number,
  lockinRaw: number,
  sharpnessRaw: number,
  demandProfile: DemandProfile,
  ageBand: AgeBand,
): BFSResult | null {
  const profileCell = getProfileCell(demandProfile, ageBand);
  const benchmarks = getBenchmarks(profileCell);
  if (!benchmarks) return null;

  const recallPercentile = estimatePercentile(recallRaw, benchmarks.recall);
  const lockinPercentile = estimatePercentile(lockinRaw, benchmarks.lockin);
  const sharpnessPercentile = estimatePercentile(sharpnessRaw, benchmarks.sharpness);

  const recallBFS = computeBFSComponent(recallRaw, benchmarks.recall);
  const lockinBFS = computeBFSComponent(lockinRaw, benchmarks.lockin);
  const sharpnessBFS = computeBFSComponent(sharpnessRaw, benchmarks.sharpness);

  const bfsComposite = Math.round(
    recallBFS * 0.35 + lockinBFS * 0.35 + sharpnessBFS * 0.30
  );
  const bfsTarget = 75;
  const bfsGap = bfsComposite - bfsTarget;

  let bfsStatus: BFSResult['bfsStatus'];
  if (bfsComposite < 75) bfsStatus = 'below_target';
  else if (bfsComposite < 85) bfsStatus = 'at_target';
  else bfsStatus = 'above_target';

  return {
    profileCell,
    benchmarks,
    recallPercentile,
    lockinPercentile,
    sharpnessPercentile,
    recallBFS,
    lockinBFS,
    sharpnessBFS,
    bfsComposite,
    bfsTarget,
    bfsGap,
    bfsStatus,
  };
}

export function getBFSMessage(bfsStatus: BFSResult['bfsStatus']): string {
  switch (bfsStatus) {
    case 'below_target':
      return 'Your brain is performing below the minimum expected for your profile. That is why you are here. This is the gap we will close.';
    case 'at_target':
      return 'Your brain is performing at the minimum expected for your profile. Keep training to build your cognitive reserve further.';
    case 'above_target':
      return 'Your brain is performing above the minimum for your profile. You are building exceptional cognitive reserve.';
  }
}

export function getFacilitatorScript(bfsComposite: number, bfsGap: number): string {
  if (bfsGap < 0) {
    return `"Your Brain Fitness Score today is ${bfsComposite}. The minimum your brain should be performing at for someone with your profile is 75. That ${Math.abs(bfsGap)}-point gap is real — and it's exactly why you're here."`;
  } else if (bfsGap === 0) {
    return `"Your Brain Fitness Score today is ${bfsComposite}. You're right at the minimum expected for your profile. Let's keep pushing."`;
  } else {
    return `"Your Brain Fitness Score today is ${bfsComposite}. You're ${bfsGap} points above the minimum — strong cognitive reserve. Let's keep building."`;
  }
}
