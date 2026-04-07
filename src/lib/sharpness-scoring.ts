// Sharpness Test scoring utilities

import { DualTaskResponseEntry, ChoiceRTResponseEntry, CategorySwitchResponseEntry } from '@/contexts/SharpnessContext';

export function computeDualTaskScore(
  blockALog: DualTaskResponseEntry[],
  blockBLog: DualTaskResponseEntry[],
  blockCLog: DualTaskResponseEntry[],
) {
  // Block A — visual baseline
  const aVisual = blockALog.filter(r => r.channel === 'visual');
  const aTargets = aVisual.filter(r => r.is_target);
  const aHits = aTargets.filter(r => r.response_type === 'hit').length;
  const vba = aTargets.length > 0 ? aHits / aTargets.length : 0;
  const aRTs = aVisual.filter(r => r.response_type === 'hit' && r.response_time_ms != null).map(r => r.response_time_ms!);
  const aMeanRT = aRTs.length > 0 ? Math.round(aRTs.reduce((a, b) => a + b, 0) / aRTs.length) : 0;

  // Block B — auditory baseline
  const bAuditory = blockBLog.filter(r => r.channel === 'auditory');
  const bTargets = bAuditory.filter(r => r.is_target);
  const bHits = bTargets.filter(r => r.response_type === 'hit').length;
  const aba = bTargets.length > 0 ? bHits / bTargets.length : 0;
  const bRTs = bAuditory.filter(r => r.response_type === 'hit' && r.response_time_ms != null).map(r => r.response_time_ms!);
  const bMeanRT = bRTs.length > 0 ? Math.round(bRTs.reduce((a, b) => a + b, 0) / bRTs.length) : 0;

  // Block C — dual task
  const cVisual = blockCLog.filter(r => r.channel === 'visual');
  const cVisualTargets = cVisual.filter(r => r.is_target);
  const cVisualHits = cVisualTargets.filter(r => r.response_type === 'hit').length;
  const vda = cVisualTargets.length > 0 ? cVisualHits / cVisualTargets.length : 0;
  const cVisualRTs = cVisual.filter(r => r.response_type === 'hit' && r.response_time_ms != null).map(r => r.response_time_ms!);
  const cVisualMeanRT = cVisualRTs.length > 0 ? Math.round(cVisualRTs.reduce((a, b) => a + b, 0) / cVisualRTs.length) : 0;

  const cAuditory = blockCLog.filter(r => r.channel === 'auditory');
  const cAuditoryTargets = cAuditory.filter(r => r.is_target);
  const cAuditoryHits = cAuditoryTargets.filter(r => r.response_type === 'hit').length;
  const ada = cAuditoryTargets.length > 0 ? cAuditoryHits / cAuditoryTargets.length : 0;
  const cAuditoryRTs = cAuditory.filter(r => r.response_type === 'hit' && r.response_time_ms != null).map(r => r.response_time_ms!);
  const cAuditoryMeanRT = cAuditoryRTs.length > 0 ? Math.round(cAuditoryRTs.reduce((a, b) => a + b, 0) / cAuditoryRTs.length) : 0;

  const vdc = Math.max(0, vba - vda);
  const adc = Math.max(0, aba - ada);
  const dualTaskScore = Math.round(Math.min(100, Math.max(0, 100 - (((vdc + adc) / 2) * 100))));

  return {
    blockA: { totalStimuli: aVisual.length, evenStimuli: aTargets.length, correctTaps: aHits, baselineAccuracy: Math.round(vba * 1000) / 1000, meanRT: aMeanRT },
    blockB: { totalTones: bAuditory.length, highTones: bTargets.length, correctTaps: bHits, baselineAccuracy: Math.round(aba * 1000) / 1000, meanRT: bMeanRT },
    blockC: {
      visualEvenStimuli: cVisualTargets.length, visualCorrectTaps: cVisualHits, visualDualAccuracy: Math.round(vda * 1000) / 1000, visualMeanRT: cVisualMeanRT,
      auditoryHighTones: cAuditoryTargets.length, auditoryCorrectTaps: cAuditoryHits, auditoryDualAccuracy: Math.round(ada * 1000) / 1000, auditoryMeanRT: cAuditoryMeanRT,
    },
    visualDualTaskCost: Math.round(vdc * 1000) / 1000,
    auditoryDualTaskCost: Math.round(adc * 1000) / 1000,
    dualTaskScore,
  };
}

export function computeChoiceRTScore(log: ChoiceRTResponseEntry[]) {
  const compatible = log.filter(r => r.rule === 'compatible');
  const incompatible = log.filter(r => r.rule === 'incompatible');
  const correctTotal = log.filter(r => r.correct).length;
  const overallAccuracy = log.length > 0 ? correctTotal / log.length : 0;

  const compRTs = compatible.filter(r => r.correct && r.response_time_ms != null).map(r => r.response_time_ms!);
  const incompRTs = incompatible.filter(r => r.correct && r.response_time_ms != null).map(r => r.response_time_ms!);

  const cmr = compRTs.length > 0 ? Math.round(compRTs.reduce((a, b) => a + b, 0) / compRTs.length) : 0;
  const imr = incompRTs.length > 0 ? Math.round(incompRTs.reduce((a, b) => a + b, 0) / incompRTs.length) : 0;
  const simonEffect = imr - cmr;
  const overrideSpeedScore = Math.max(0, ((500 - Math.max(0, simonEffect)) / 500) * 100);
  const choiceRTScore = Math.round(Math.min(100, Math.max(0, (overallAccuracy * 60) + (overrideSpeedScore * 0.4))));

  return {
    totalTrials: log.length,
    compatibleTrials: compatible.length,
    incompatibleTrials: incompatible.length,
    correctResponses: correctTotal,
    overallAccuracy: Math.round(overallAccuracy * 1000) / 1000,
    compatibleMeanRT: cmr,
    incompatibleMeanRT: imr,
    simonEffect,
    overrideSpeedScore: Math.round(overrideSpeedScore * 10) / 10,
    choiceRTScore,
  };
}

export function computeCategorySwitchScore(log: CategorySwitchResponseEntry[]) {
  const switchTrials = log.filter(r => r.is_switch_trial);
  const stayTrials = log.filter(r => !r.is_switch_trial);
  const correctTotal = log.filter(r => r.correct).length;
  const overallAccuracy = log.length > 0 ? correctTotal / log.length : 0;

  const switchCorrect = switchTrials.filter(r => r.correct).length;
  const stayCorrect = stayTrials.filter(r => r.correct).length;
  const switchAccuracy = switchTrials.length > 0 ? switchCorrect / switchTrials.length : 0;
  const stayAccuracy = stayTrials.length > 0 ? stayCorrect / stayTrials.length : 0;
  const accuracySwitchCost = Math.max(0, stayAccuracy - switchAccuracy);

  const switchRTs = switchTrials.filter(r => r.correct && r.response_time_ms != null).map(r => r.response_time_ms!);
  const stayRTs = stayTrials.filter(r => r.correct && r.response_time_ms != null).map(r => r.response_time_ms!);
  const switchMeanRT = switchRTs.length > 0 ? Math.round(switchRTs.reduce((a, b) => a + b, 0) / switchRTs.length) : 0;
  const stayMeanRT = stayRTs.length > 0 ? Math.round(stayRTs.reduce((a, b) => a + b, 0) / stayRTs.length) : 0;
  const rtSwitchCost = Math.max(0, switchMeanRT - stayMeanRT);

  const accuracyComponent = overallAccuracy * 100;
  const switchCostPenalty = Math.min(40, (accuracySwitchCost * 50) + (rtSwitchCost / 10));
  const categorySwitchingScore = Math.round(Math.min(100, Math.max(0, accuracyComponent - switchCostPenalty)));

  return {
    totalTrials: log.length,
    switchTrials: switchTrials.length,
    stayTrials: stayTrials.length,
    correctResponses: correctTotal,
    overallAccuracy: Math.round(overallAccuracy * 1000) / 1000,
    switchCorrect,
    stayCorrect,
    switchAccuracy: Math.round(switchAccuracy * 1000) / 1000,
    stayAccuracy: Math.round(stayAccuracy * 1000) / 1000,
    accuracySwitchCost: Math.round(accuracySwitchCost * 1000) / 1000,
    switchMeanRT,
    stayMeanRT,
    rtSwitchCost,
    categorySwitchingScore,
  };
}

export function computeSharpnessPillarScore(dualTask: number, choiceRT: number, categorySwitch: number): number {
  return Math.round(dualTask * 0.40 + choiceRT * 0.35 + categorySwitch * 0.25);
}
