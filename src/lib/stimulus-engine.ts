// Lock-In Test stimulus sequence generator

export interface GeneratedSequence {
  seed: string;
  digits: number[];
  targetIndices: Set<number>;
}

function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  }
  return function() {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    return h / 0x7fffffff;
  };
}

export function generateSeed(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function generateSequence(
  totalStimuli: number = 182,
  targetFrequency: number = 0.10,
  segmentCount: number = 3,
): GeneratedSequence {
  const seed = generateSeed();
  const rng = seededRandom(seed);
  
  const stimuliPerSegment = Math.floor(totalStimuli / segmentCount);
  const targetTotal = Math.round(totalStimuli * targetFrequency);
  const minPerSegment = 4;
  
  // Distribute targets across segments
  const targetsPerSegment: number[] = [];
  let remaining = targetTotal;
  for (let s = 0; s < segmentCount; s++) {
    if (s === segmentCount - 1) {
      targetsPerSegment.push(remaining);
    } else {
      const t = Math.max(minPerSegment, Math.min(remaining - minPerSegment * (segmentCount - s - 1), 
        minPerSegment + Math.floor(rng() * 3)));
      targetsPerSegment.push(t);
      remaining -= t;
    }
  }
  
  const digits: number[] = [];
  const targetIndices = new Set<number>();
  
  for (let seg = 0; seg < segmentCount; seg++) {
    const segStart = seg * stimuliPerSegment;
    const segEnd = seg === segmentCount - 1 ? totalStimuli : (seg + 1) * stimuliPerSegment;
    const segLen = segEnd - segStart;
    
    // Pick positions for 7→3 targets within this segment
    // Target is the index of the "3" (the digit after "7")
    const targetPositions: number[] = [];
    const availablePositions: number[] = [];
    for (let i = 1; i < segLen; i++) {
      availablePositions.push(i);
    }
    
    // Shuffle and pick
    for (let i = availablePositions.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [availablePositions[i], availablePositions[j]] = [availablePositions[j], availablePositions[i]];
    }
    
    // Pick non-adjacent positions
    const sorted: number[] = [];
    for (const pos of availablePositions) {
      if (sorted.length >= targetsPerSegment[seg]) break;
      // Ensure no two targets are adjacent (need at least 2 apart)
      if (sorted.every(p => Math.abs(p - pos) >= 3)) {
        sorted.push(pos);
      }
    }
    sorted.sort((a, b) => a - b);
    
    // Generate digits for this segment
    const segDigits: number[] = [];
    const localTargetPositions = new Set(sorted);
    
    for (let i = 0; i < segLen; i++) {
      if (localTargetPositions.has(i)) {
        // This position is the "3" in a 7→3 sequence
        // Previous position must be 7
        segDigits[i] = 3;
        segDigits[i - 1] = 7;
        targetIndices.add(segStart + i);
      } else if (localTargetPositions.has(i + 1)) {
        // Next is a target "3", so this must be 7 (handled above)
        continue;
      } else if (segDigits[i] === undefined) {
        // Random digit 1-9, avoiding unwanted 7→3 patterns
        let d: number;
        do {
          d = Math.floor(rng() * 9) + 1;
        } while (
          // Avoid creating accidental 7→3
          (d === 3 && i > 0 && segDigits[i - 1] === 7 && !localTargetPositions.has(i)) ||
          (d === 7 && localTargetPositions.has(i + 1)) ||
          // No more than 3 consecutive same digits
          (i >= 3 && segDigits[i - 1] === d && segDigits[i - 2] === d && segDigits[i - 3] === d)
        );
        segDigits[i] = d;
      }
    }
    
    digits.push(...segDigits);
  }
  
  return { seed, digits, targetIndices };
}

export function computeLockInScore(
  responseLog: Array<{
    is_target_sequence: boolean;
    response_time_ms: number | null;
    response_type: string;
  }>,
) {
  const nonTargets = responseLog.filter(r => !r.is_target_sequence);
  const targets = responseLog.filter(r => r.is_target_sequence);
  
  const hits = nonTargets.filter(r => r.response_type === 'hit').length;
  const misses = nonTargets.filter(r => r.response_type === 'miss').length;
  const falseAlarms = targets.filter(r => r.response_type === 'false_alarm').length;
  
  const hitRate = nonTargets.length > 0 ? hits / nonTargets.length : 0;
  const faRate = targets.length > 0 ? falseAlarms / targets.length : 0;
  
  const hitRTs = nonTargets
    .filter(r => r.response_type === 'hit' && r.response_time_ms != null)
    .map(r => r.response_time_ms!);
  
  const meanRT = hitRTs.length > 0 ? hitRTs.reduce((a, b) => a + b, 0) / hitRTs.length : 0;
  const rtStdDev = hitRTs.length > 1
    ? Math.sqrt(hitRTs.reduce((sum, rt) => sum + (rt - meanRT) ** 2, 0) / (hitRTs.length - 1))
    : 0;
  
  // Sub-scores
  const accuracySubScore = hitRate * 100;
  const inhibitionSubScore = (1 - faRate) * 100;
  const consistencyRaw = Math.max(0, 200 - rtStdDev);
  const consistencySubScore = (consistencyRaw / 200) * 100;
  
  const pillarScore = Math.round(
    accuracySubScore * 0.45 + inhibitionSubScore * 0.35 + consistencySubScore * 0.20
  );
  
  return {
    hits, misses, falseAlarms,
    totalNonTargets: nonTargets.length,
    totalTargets: targets.length,
    hitRate, faRate,
    meanRT: Math.round(meanRT),
    rtStdDev: Math.round(rtStdDev),
    minRT: hitRTs.length > 0 ? Math.min(...hitRTs) : 0,
    maxRT: hitRTs.length > 0 ? Math.max(...hitRTs) : 0,
    accuracySubScore: Math.round(accuracySubScore * 10) / 10,
    inhibitionSubScore: Math.round(inhibitionSubScore * 10) / 10,
    consistencySubScore: Math.round(consistencySubScore * 10) / 10,
    pillarScore,
  };
}

export function computeSegments(
  responseLog: Array<{
    stimulus_index: number;
    is_target_sequence: boolean;
    response_time_ms: number | null;
    response_type: string;
  }>,
  totalStimuli: number = 182,
  segmentCount: number = 3,
) {
  const stimuliPerSegment = Math.floor(totalStimuli / segmentCount);
  const segments = [];
  
  for (let seg = 0; seg < segmentCount; seg++) {
    const start = seg * stimuliPerSegment;
    const end = seg === segmentCount - 1 ? totalStimuli : (seg + 1) * stimuliPerSegment;
    const segEntries = responseLog.filter(r => r.stimulus_index >= start && r.stimulus_index < end);
    const nonTargets = segEntries.filter(r => !r.is_target_sequence);
    const targets = segEntries.filter(r => r.is_target_sequence);
    
    const hits = nonTargets.filter(r => r.response_type === 'hit').length;
    const misses = nonTargets.filter(r => r.response_type === 'miss').length;
    const falseAlarms = targets.filter(r => r.response_type === 'false_alarm').length;
    const accuracy = nonTargets.length > 0 ? hits / nonTargets.length : 0;
    
    const hitRTs = nonTargets
      .filter(r => r.response_type === 'hit' && r.response_time_ms != null)
      .map(r => r.response_time_ms!);
    const meanRT = hitRTs.length > 0 ? Math.round(hitRTs.reduce((a, b) => a + b, 0) / hitRTs.length) : 0;
    
    segments.push({
      range_stimuli: [start, end - 1] as [number, number],
      range_seconds: [seg * 70, (seg + 1) * 70] as [number, number],
      hits, misses, false_alarms: falseAlarms,
      accuracy: Math.round(accuracy * 1000) / 1000,
      mean_rt_ms: meanRT,
    });
  }
  
  return segments;
}
