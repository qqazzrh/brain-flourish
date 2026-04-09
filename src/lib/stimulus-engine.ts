// Lock-In Test stimulus sequence generator

export interface GeneratedSequence {
  seed: string;
  digits: number[];
  targetIndices: Set<number>;
  rules: 'single' | 'dual'; // single = 7→3 only, dual = 7→3 + 6→5
}

export interface TargetRule {
  trigger: number; // e.g. 7
  target: number;  // e.g. 3
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

/**
 * Generate a sequence for the Lock-In test.
 * 
 * For 'single' mode (Game 1): withhold on 7→3 only, but with extra 3s scattered throughout
 * For 'dual' mode (Game 2): withhold on both 7→3 AND 6→5
 */
export function generateSequence(
  totalStimuli: number = 182,
  targetFrequency: number = 0.10,
  segmentCount: number = 3,
  mode: 'single' | 'dual' = 'single',
): GeneratedSequence {
  const seed = generateSeed();
  const rng = seededRandom(seed);
  
  const rules: TargetRule[] = mode === 'dual'
    ? [{ trigger: 7, target: 3 }, { trigger: 6, target: 5 }]
    : [{ trigger: 7, target: 3 }];
  
  const stimuliPerSegment = Math.floor(totalStimuli / segmentCount);
  const targetTotal = Math.round(totalStimuli * targetFrequency);
  const minPerSegment = mode === 'dual' ? 3 : 4;
  
  // For dual mode, split targets between rules
  const targetsPerRule = mode === 'dual'
    ? Math.floor(targetTotal / 2)
    : targetTotal;
  
  // Distribute targets across segments for each rule
  function distributeTargets(total: number): number[] {
    const perSeg: number[] = [];
    let rem = total;
    for (let s = 0; s < segmentCount; s++) {
      if (s === segmentCount - 1) {
        perSeg.push(rem);
      } else {
        const t = Math.max(minPerSegment, Math.min(
          rem - minPerSegment * (segmentCount - s - 1),
          minPerSegment + Math.floor(rng() * 3)
        ));
        perSeg.push(t);
        rem -= t;
      }
    }
    return perSeg;
  }
  
  const digits: number[] = [];
  const targetIndices = new Set<number>();
  
  // For each rule, get per-segment distribution
  const ruleDistributions = rules.map(() => distributeTargets(targetsPerRule));
  
  for (let seg = 0; seg < segmentCount; seg++) {
    const segStart = seg * stimuliPerSegment;
    const segEnd = seg === segmentCount - 1 ? totalStimuli : (seg + 1) * stimuliPerSegment;
    const segLen = segEnd - segStart;
    
    // Collect all target positions for this segment across all rules
    interface TargetPlacement {
      position: number; // position of the TARGET digit (the one to withhold)
      ruleIndex: number;
    }
    
    const placements: TargetPlacement[] = [];
    
    for (let rIdx = 0; rIdx < rules.length; rIdx++) {
      const count = ruleDistributions[rIdx][seg];
      const availablePositions: number[] = [];
      for (let i = 1; i < segLen; i++) {
        availablePositions.push(i);
      }
      
      // Shuffle
      for (let i = availablePositions.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [availablePositions[i], availablePositions[j]] = [availablePositions[j], availablePositions[i]];
      }
      
      // Pick non-overlapping positions (at least 3 apart from any existing placement)
      let picked = 0;
      for (const pos of availablePositions) {
        if (picked >= count) break;
        const tooClose = placements.some(p => Math.abs(p.position - pos) < 3);
        if (!tooClose && pos >= 1) {
          placements.push({ position: pos, ruleIndex: rIdx });
          picked++;
        }
      }
    }
    
    // Build segment digits
    const segDigits: number[] = new Array(segLen).fill(-1);
    const localTargetPositions = new Map<number, number>(); // position → ruleIndex
    
    for (const p of placements) {
      localTargetPositions.set(p.position, p.ruleIndex);
    }
    
    // Place target sequences
    for (const [pos, rIdx] of localTargetPositions) {
      const rule = rules[rIdx];
      segDigits[pos] = rule.target;      // e.g. 3 or 5
      segDigits[pos - 1] = rule.trigger; // e.g. 7 or 6
      targetIndices.add(segStart + pos);
    }
    
    // Fill remaining positions
    // For single mode: deliberately add more standalone 3s to prevent "tap until 7" strategy
    const extraThreeRate = mode === 'single' ? 0.15 : 0.08; // 15% chance of 3 in Game 1
    
    for (let i = 0; i < segLen; i++) {
      if (segDigits[i] !== -1) continue;
      
      let d: number;
      do {
        // In single mode, bias toward more 3s
        if (mode === 'single' && rng() < extraThreeRate && i > 0 && segDigits[i - 1] !== 7) {
          d = 3;
        } else {
          d = Math.floor(rng() * 9) + 1;
        }
      } while (
        // Avoid creating accidental target sequences
        rules.some(rule => 
          (d === rule.target && i > 0 && segDigits[i - 1] === rule.trigger && !localTargetPositions.has(i)) ||
          (d === rule.trigger && localTargetPositions.has(i + 1))
        ) ||
        // No more than 3 consecutive same digits
        (i >= 3 && segDigits[i - 1] === d && segDigits[i - 2] === d && segDigits[i - 3] === d)
      );
      segDigits[i] = d;
    }
    
    digits.push(...segDigits);
  }
  
  return { seed, digits, targetIndices, rules: mode };
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

/**
 * Compute combined Lock-In score from both Game 1 and Game 2 logs.
 * Game 1 (single rule) weighted 40%, Game 2 (dual rule) weighted 60%.
 */
export function computeCombinedLockInScore(
  game1Log: Array<{
    is_target_sequence: boolean;
    response_time_ms: number | null;
    response_type: string;
  }>,
  game2Log: Array<{
    is_target_sequence: boolean;
    response_time_ms: number | null;
    response_type: string;
  }>,
) {
  const g1 = computeLockInScore(game1Log);
  const g2 = computeLockInScore(game2Log);
  
  const combinedPillarScore = Math.round(g1.pillarScore * 0.4 + g2.pillarScore * 0.6);
  
  return {
    game1: g1,
    game2: g2,
    combinedPillarScore,
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
