import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import { PlansView } from "./PlansView";
import { MemoryRouter } from "react-router-dom";
import { useAppStore } from "../store/AppContext";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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
    useAppStore: vi.fn(() => store),
  };
});

describe("PlansView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it("handles creating a new plan", async () => {
    const mockAddPlan = vi.fn().mockResolvedValue({ id: "p3", title: "New Trip" });
    vi.mocked(useAppStore).mockReturnValue({
      ...vi.mocked(useAppStore)(),
      addPlan: mockAddPlan,
    });

    render(
      <MemoryRouter>
        <PlansView />
      </MemoryRouter>
    );

    const newPlanBtn = screen.getByRole('button', { name: /New Plan/i });
    fireEvent.click(newPlanBtn);

    const input = screen.getByPlaceholderText(/Summer Villa/i);
    fireEvent.change(input, { target: { value: 'New Trip' } });

    const checkBtn = screen.getAllByRole('button').find(b => b.innerHTML.includes('check'));
    fireEvent.click(checkBtn!);

    expect(mockAddPlan).toHaveBeenCalledWith('New Trip');
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/p/p3');
    });
  });

  it("handles creating a new plan with Enter key", async () => {
    const mockAddPlan = vi.fn().mockResolvedValue({ id: "p3", title: "New Trip" });
    vi.mocked(useAppStore).mockReturnValue({
      ...vi.mocked(useAppStore)(),
      addPlan: mockAddPlan,
    });

    render(
      <MemoryRouter>
        <PlansView />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /New Plan/i }));
    const input = screen.getByPlaceholderText(/Summer Villa/i);
    fireEvent.change(input, { target: { value: 'New Trip' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockAddPlan).toHaveBeenCalledWith('New Trip');
  });

  it("cancels creating a new plan", () => {
    render(
      <MemoryRouter>
        <PlansView />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /New Plan/i }));
    const closeBtn = screen.getAllByRole('button').find(b => b.innerHTML.includes('close'));
    fireEvent.click(closeBtn!);

    expect(screen.queryByPlaceholderText(/Summer Villa/i)).not.toBeInTheDocument();
  });

  it("handles selecting a plan", async () => {
    const mockSetCurrentPlanId = vi.fn();
    vi.mocked(useAppStore).mockReturnValue({
      ...vi.mocked(useAppStore)(),
      setCurrentPlanId: mockSetCurrentPlanId,
    });

    render(
      <MemoryRouter>
        <PlansView />
      </MemoryRouter>
    );

    const summerTrip = await screen.findByText("Summer Trip");
    const card = summerTrip.closest("div.group")!;
    fireEvent.click(card);

    expect(mockSetCurrentPlanId).toHaveBeenCalledWith("p1");
    expect(mockNavigate).toHaveBeenCalledWith('/p/p1');
  });

  it("handles renaming a plan", async () => {
    const mockRenamePlan = vi.fn();
    vi.mocked(useAppStore).mockReturnValue({
      ...vi.mocked(useAppStore)(),
      renamePlan: mockRenamePlan,
    });

    render(
      <MemoryRouter>
        <PlansView />
      </MemoryRouter>
    );

    const summerTrip = await screen.findByText("Summer Trip");
    const card = summerTrip.closest("div.group")!;
    const editBtn = within(card as HTMLElement).getByTitle("Rename Plan");
    
    // Stop propagation when clicking edit button
    fireEvent.click(editBtn);

    const input = screen.getByDisplayValue("Summer Trip");
    fireEvent.change(input, { target: { value: 'Summer Trip 2024' } });
    
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockRenamePlan).toHaveBeenCalledWith('p1', 'Summer Trip 2024');
  });

  it("cancels renaming a plan on Escape", async () => {
    render(
      <MemoryRouter>
        <PlansView />
      </MemoryRouter>
    );

    const summerTrip = await screen.findByText("Summer Trip");
    const card = summerTrip.closest("div.group")!;
    const editBtn = within(card as HTMLElement).getByTitle("Rename Plan");
    
    fireEvent.click(editBtn);

    const input = screen.getByDisplayValue("Summer Trip");
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(screen.queryByDisplayValue("Summer Trip")).not.toBeInTheDocument();
    expect(screen.getByText("Summer Trip")).toBeInTheDocument();
  });

  it("saves renamed plan on blur", async () => {
    const mockRenamePlan = vi.fn();
    vi.mocked(useAppStore).mockReturnValue({
      ...vi.mocked(useAppStore)(),
      renamePlan: mockRenamePlan,
    });

    render(
      <MemoryRouter>
        <PlansView />
      </MemoryRouter>
    );

    const summerTrip = await screen.findByText("Summer Trip");
    const card = summerTrip.closest("div.group")!;
    const editBtn = within(card as HTMLElement).getByTitle("Rename Plan");
    
    fireEvent.click(editBtn);

    const input = screen.getByDisplayValue("Summer Trip");
    fireEvent.change(input, { target: { value: 'Summer Trip 2024' } });
    
    fireEvent.blur(input);

    expect(mockRenamePlan).toHaveBeenCalledWith('p1', 'Summer Trip 2024');
  });
});
