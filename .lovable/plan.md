

## Plan: Session History, Completion Tracking, and Per-Session Scoring

### Problem
1. After a returning participant logs in, there's no session history showing which sessions are complete/incomplete
2. No option to continue an incomplete session vs start a new one
3. The TestHub doesn't show which of the 3 tests are done in the current session
4. The Scoring tab only shows one set of scores — no per-session breakdown

### Current Data Architecture
- `PillarScores` in localStorage is keyed by `participant_id` only (no session number), so scores overwrite each session
- `SessionRecord` only stores Recall test data — Lock-In and Sharpness save to separate localStorage keys without session number tagging
- `participant.session_count` increments on each test save (Recall increments it; Lock-In and Sharpness may also increment it), causing double/triple counting

### Changes

#### 1. Refactor PillarScores to be per-session
**File: `src/lib/storage.ts`**
- Change `PillarScores` key from `participant_id` to `participant_id:session_number`
- Add `session_number` field to the `PillarScores` interface
- Add `getAllPillarScoresForParticipant(participantId)` that returns an array of all sessions' scores
- Update `savePillarScore` and `getPillarScores` to accept session number
- Add helper `getCurrentSessionPillarScores(participantId, sessionNumber)` to check which tests are done

#### 2. Add Session History screen for returning participants
**File: `src/components/shared/SessionSetup.tsx`**
- After looking up a returning participant, show a session history list:
  - Each row: "Session 1 — Completed" (all 3 pillar scores present) or "Session 2 — Incomplete" (some missing)
  - Show which tests are done per session (Recall ✓, Lock-In ✗, Sharpness ✗)
- Two action buttons:
  - **Continue Session X** (if the latest session is incomplete) — resumes with the same session number
  - **Start New Session** — increments session count, starts fresh

#### 3. Add `currentSessionNumber` to SessionContext
**File: `src/contexts/SessionContext.tsx`**
- Add `currentSessionNumber: number` to the context
- Set it in `setParticipant` based on whether continuing or starting new
- Expose it so all test components can tag scores with the correct session number

#### 4. Show test completion status in TestHub
**File: `src/components/shared/TestHub.tsx`**
- Read `getCurrentSessionPillarScores(participantId, currentSessionNumber)` 
- For each test module card, show:
  - Green "Done" badge if that pillar's raw score exists for this session
  - Default "Ready" badge if not yet done

#### 5. Update test save handlers to use session number
**Files: `SessionComplete.tsx`, `LockInScoreOutput.tsx`, `SharpnessScoreOutput.tsx`**
- Pass `currentSessionNumber` when calling `savePillarScore`
- Only increment `participant.session_count` once (when starting a new session via SessionSetup, not on each test save)

#### 6. Per-session scoring display in BFS Scoring tab
**File: `src/components/scoring/BFSScoring.tsx`**
- Add a session selector dropdown at the top showing all sessions
- Default to the current/latest session
- Load pillar scores for the selected session number
- Show a history table below: Session 1 scores, Session 2 scores, etc. with BFS composite per session

### Files to Create/Edit
- `src/lib/storage.ts` — per-session pillar scores
- `src/contexts/SessionContext.tsx` — add `currentSessionNumber`
- `src/components/shared/SessionSetup.tsx` — session history + continue/new
- `src/components/shared/TestHub.tsx` — done/ready badges per test
- `src/components/recall/SessionComplete.tsx` — use session number, stop incrementing session_count
- `src/components/lockin/LockInScoreOutput.tsx` — same
- `src/components/sharpness/SharpnessScoreOutput.tsx` — same
- `src/components/scoring/BFSScoring.tsx` — per-session view + session selector

