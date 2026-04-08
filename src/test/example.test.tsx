import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { SessionProvider, useSession } from "@/contexts/SessionContext";

function SessionProbe() {
  const { facilitator, participant, currentSessionNumber, assignedForm, location } = useSession();

  return (
    <div>
      <span data-testid="facilitator">{facilitator?.id ?? ""}</span>
      <span data-testid="participant">{participant?.participant_id ?? ""}</span>
      <span data-testid="session-number">{currentSessionNumber}</span>
      <span data-testid="form">{assignedForm}</span>
      <span data-testid="location">{location}</span>
    </div>
  );
}

describe("SessionProvider persistence", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("restores the active session from localStorage after reload", () => {
    window.localStorage.setItem(
      "bfs-active-session",
      JSON.stringify({
        facilitator: { id: "FAC-001", name: "Sarah Johnson" },
        location: "Chicago",
        participant: {
          participant_id: "RYB-2026-0001",
          created_at: new Date().toISOString(),
          created_by_facilitator: "FAC-001",
          created_at_location: "Chicago",
          session_count: 0,
          last_session_date: null,
          last_recall_raw_score: null,
          sessions: [],
        },
        participantType: "returning",
        assignedForm: "C",
        isPractice: false,
        sessionStartTime: new Date().toISOString(),
        currentSessionNumber: 1,
      }),
    );

    render(
      <SessionProvider>
        <SessionProbe />
      </SessionProvider>,
    );

    expect(screen.getByTestId("facilitator")).toHaveTextContent("FAC-001");
    expect(screen.getByTestId("participant")).toHaveTextContent("RYB-2026-0001");
    expect(screen.getByTestId("session-number")).toHaveTextContent("1");
    expect(screen.getByTestId("form")).toHaveTextContent("C");
    expect(screen.getByTestId("location")).toHaveTextContent("Chicago");
  });
});
