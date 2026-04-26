import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
  act,
} from "@testing-library/react";
import { PlansView } from "./PlansView";
import { MemoryRouter } from "react-router-dom";

// 1. Define a modifiable mock store
const mockStore = {
  plans: [
    { id: "p1", title: "Summer Trip", created_at: new Date().toISOString() },
    { id: "p2", title: "Winter Trip", created_at: new Date().toISOString() },
  ],
  currentPlanId: "p1",
  setCurrentPlanId: vi.fn(),
  addPlan: vi.fn(),
  deletePlan: vi.fn(),
  renamePlan: vi.fn(),
  initialLoading: false,
  loading: false,
  activePlan: null as any,
  persons: [],
  categories: [],
  setCategories: vi.fn(),
  exportData: vi.fn(),
  importData: vi.fn(),
  moveItem: vi.fn(),
  sortAllItems: vi.fn(),
  addItem: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
  addPerson: vi.fn(),
  removePerson: vi.fn(),
  addCategory: vi.fn(),
  deleteCategory: vi.fn(),
  copyCategoryToClipboard: vi.fn(),
};

// 2. Mock the store
vi.mock("../store/AppContext", () => ({
  useAppStore: vi.fn(() => mockStore),
}));

// 3. Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("PlansView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store defaults
    mockStore.initialLoading = false;
    mockStore.loading = false;
    mockStore.plans = [
      { id: "p1", title: "Summer Trip", created_at: new Date().toISOString() },
      { id: "p2", title: "Winter Trip", created_at: new Date().toISOString() },
    ];
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

  it("shows loader when initialLoading is true", () => {
    mockStore.initialLoading = true;
    const { container } = render(
      <MemoryRouter>
        <PlansView />
      </MemoryRouter>,
    );

    // Check for the animate-spin class which is on our loader
    const loader = container.querySelector(".animate-spin");
    expect(loader).toBeInTheDocument();

    // Ensure "My Plans" title is NOT visible (since we return early in PlansView)
    expect(screen.queryByText("My Plans")).not.toBeInTheDocument();
  });

  it("handles plan deletion confirmation", async () => {
    render(
      <MemoryRouter>
        <PlansView />
      </MemoryRouter>,
    );

    const winterTrip = await screen.findByText("Winter Trip");
    const card = winterTrip.closest("div.group")!;
    const deleteBtn = within(card as HTMLElement)
      .getByText("delete")
      .closest("button")!;

    fireEvent.click(deleteBtn);

    // Wait for AlertDialog to appear
    const dialogTitle = await screen.findByText("Delete this entire plan?");
    expect(dialogTitle).toBeInTheDocument();

    // Click the confirm button in the dialog
    const confirmBtn = screen.getByRole("button", { name: /^Delete$/ });
    fireEvent.click(confirmBtn);

    expect(mockStore.deletePlan).toHaveBeenCalledWith("p2");
  });

  it("handles creating a new plan", async () => {
    mockStore.addPlan.mockResolvedValue({ id: "p3", title: "New Trip" });

    render(
      <MemoryRouter>
        <PlansView />
      </MemoryRouter>,
    );

    const newPlanBtn = screen.getByRole("button", { name: /New Plan/i });
    fireEvent.click(newPlanBtn);

    const input = screen.getByPlaceholderText(/Summer Villa/i);
    fireEvent.change(input, { target: { value: "New Trip" } });

    const checkBtn = screen
      .getAllByRole("button")
      .find((b) => b.innerHTML.includes("check"));
    fireEvent.click(checkBtn!);

    expect(mockStore.addPlan).toHaveBeenCalledWith("New Trip");
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/p/p3");
    });
  });

  it("handles creating a new plan with Enter key", async () => {
    mockStore.addPlan.mockResolvedValue({ id: "p3", title: "New Trip" });

    render(
      <MemoryRouter>
        <PlansView />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /New Plan/i }));
    const input = screen.getByPlaceholderText(/Summer Villa/i);
    fireEvent.change(input, { target: { value: "New Trip" } });
    await act(async () => {
      fireEvent.keyDown(input, { key: "Enter" });
    });

    expect(mockStore.addPlan).toHaveBeenCalledWith("New Trip");
  });

  it("cancels creating a new plan", () => {
    render(
      <MemoryRouter>
        <PlansView />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /New Plan/i }));
    const closeBtn = screen
      .getAllByRole("button")
      .find((b) => b.innerHTML.includes("close"));
    fireEvent.click(closeBtn!);

    expect(
      screen.queryByPlaceholderText(/Summer Villa/i),
    ).not.toBeInTheDocument();
  });

  it("handles selecting a plan", async () => {
    render(
      <MemoryRouter>
        <PlansView />
      </MemoryRouter>,
    );

    const summerTrip = await screen.findByText("Summer Trip");
    const card = summerTrip.closest("div.group")!;
    fireEvent.click(card);

    expect(mockStore.setCurrentPlanId).toHaveBeenCalledWith("p1");
    expect(mockNavigate).toHaveBeenCalledWith("/p/p1");
  });

  it("handles renaming a plan", async () => {
    render(
      <MemoryRouter>
        <PlansView />
      </MemoryRouter>,
    );

    const summerTrip = await screen.findByText("Summer Trip");
    const card = summerTrip.closest("div.group")!;
    const editBtn = within(card as HTMLElement).getByTitle("Rename Plan");

    fireEvent.click(editBtn);

    const input = screen.getByDisplayValue("Summer Trip");
    fireEvent.change(input, { target: { value: "Summer Trip 2024" } });

    fireEvent.keyDown(input, { key: "Enter" });

    expect(mockStore.renamePlan).toHaveBeenCalledWith("p1", "Summer Trip 2024");
  });

  it("cancels renaming a plan on Escape", async () => {
    render(
      <MemoryRouter>
        <PlansView />
      </MemoryRouter>,
    );

    const summerTrip = await screen.findByText("Summer Trip");
    const card = summerTrip.closest("div.group")!;
    const editBtn = within(card as HTMLElement).getByTitle("Rename Plan");

    fireEvent.click(editBtn);

    const input = screen.getByDisplayValue("Summer Trip");
    fireEvent.keyDown(input, { key: "Escape" });

    expect(screen.queryByDisplayValue("Summer Trip")).not.toBeInTheDocument();
    expect(screen.getByText("Summer Trip")).toBeInTheDocument();
  });

  it("saves renamed plan on blur", async () => {
    render(
      <MemoryRouter>
        <PlansView />
      </MemoryRouter>,
    );

    const summerTrip = await screen.findByText("Summer Trip");
    const card = summerTrip.closest("div.group")!;
    const editBtn = within(card as HTMLElement).getByTitle("Rename Plan");

    fireEvent.click(editBtn);

    const input = screen.getByDisplayValue("Summer Trip");
    fireEvent.change(input, { target: { value: "Summer Trip 2024" } });

    fireEvent.blur(input);

    expect(mockStore.renamePlan).toHaveBeenCalledWith("p1", "Summer Trip 2024");
  });

  it("renders empty state and allows creating first plan", () => {
    mockStore.plans = [];
    render(
      <MemoryRouter>
        <PlansView />
      </MemoryRouter>,
    );
    expect(screen.getByText("No plans yet")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Create Plan/i }));
    expect(screen.getByPlaceholderText(/Summer Villa/i)).toBeInTheDocument();
  });

  it('stops propagation on rename input and actions', async () => {
    const onParentClick = vi.fn();
    render(
      <MemoryRouter>
        <div onClick={onParentClick}>
          <PlansView />
        </div>
      </MemoryRouter>
    );

    const summerTrip = await screen.findByText("Summer Trip");
    // Click the rename button for the first plan
    const renameBtns = screen.getAllByTitle("Rename Plan");
    fireEvent.click(renameBtns[0]);

    // The input should now be visible with the plan title
    const input = screen.getByDisplayValue("Summer Trip");
    fireEvent.click(input);
    // Parent click should not fire because of stopPropagation on the wrapper div
    expect(onParentClick).not.toHaveBeenCalled();
  });
});
