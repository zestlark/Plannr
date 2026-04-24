import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { PlansView } from "./PlansView";
import { MemoryRouter } from "react-router-dom";

vi.mock("../store/AppContext", () => {
  const store = {
    plans: [
      { id: "p1", title: "Summer Trip", created_at: new Date().toISOString() },
      { id: "p2", title: "Winter Trip", created_at: new Date().toISOString() },
    ],
    currentPlanId: "p1",
    setCurrentPlanId: vi.fn(),
    addPlan: vi.fn(),
    deletePlan: vi.fn(),
    renamePlan: vi.fn(),
  };
  return {
    useAppStore: () => store,
  };
});

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("PlansView", () => {
  it("renders plans correctly", () => {
    render(
      <MemoryRouter>
        <PlansView />
      </MemoryRouter>,
    );
    expect(screen.getByText("Summer Trip")).toBeInTheDocument();
    expect(screen.getByText("Winter Trip")).toBeInTheDocument();
  });

  it("handles plan deletion confirmation", async () => {
    window.confirm = vi.fn().mockReturnValue(true);
    render(
      <MemoryRouter>
        <PlansView />
      </MemoryRouter>,
    );

    // Use findByText to wait for plans to render
    const winterTrip = await screen.findByText("Winter Trip");
    const card = winterTrip.closest("div.group")!;
    const deleteBtn = within(card as HTMLElement)
      .getByText("delete")
      .closest("button")!;

    fireEvent.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalledWith("Delete this entire plan?");
    expect(
      vi.mocked((await import("../store/AppContext")).useAppStore)().deletePlan,
    ).toHaveBeenCalledWith("p2");
  });
});
