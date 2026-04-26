import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { DashboardView } from './DashboardView';
import { useAppStore } from '../store/AppContext';

vi.mock('../store/AppContext', () => ({
  useAppStore: vi.fn(),
}));

describe('DashboardView', () => {
  const mockStore = {
    categories: [{ id: 'c1', title: 'Food', items: [] }],
    persons: ['Alice'],
    loading: false,
    initialLoading: false,
    activePlan: { id: 'p1', title: 'Summer Trip' },
    addCategory: vi.fn(),
    sortAllItems: vi.fn(),
    deletePlan: vi.fn(),
    addPerson: vi.fn(),
    removePerson: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppStore as any).mockReturnValue(mockStore);
  });

  it('renders active plan title', () => {
    render(<DashboardView searchQuery="" />);
    expect(screen.getByText('Summer Trip')).toBeInTheDocument();
  });

  it('shows syncing indicator when loading', () => {
    (useAppStore as any).mockReturnValue({ ...mockStore, loading: true });
    render(<DashboardView searchQuery="" />);
    expect(screen.getByText(/Syncing.../i)).toBeInTheDocument();
  });

  it('shows initial loading indicator', () => {
    (useAppStore as any).mockReturnValue({ ...mockStore, initialLoading: true });
    render(<DashboardView searchQuery="" />);
    expect(screen.getByText(/Syncing with database.../i)).toBeInTheDocument();
  });

  it('calls sortAllItems when sort button is clicked', () => {
    render(<DashboardView searchQuery="" />);
    const sortButton = screen.getByRole('button', { name: /Sort/i });
    fireEvent.click(sortButton);
    expect(mockStore.sortAllItems).toHaveBeenCalled();
  });

  it('handles adding a category', () => {
    render(<DashboardView searchQuery="" />);
    
    // Open add category input
    const addButton = screen.getByRole('button', { name: /Add Category/i });
    fireEvent.click(addButton);

    // Type new category name
    const input = screen.getByPlaceholderText('Category name...');
    fireEvent.change(input, { target: { value: 'Drinks' } });

    // Submit by clicking check button
    const checkButton = screen.getAllByRole('button').find(b => b.innerHTML.includes('check'));
    fireEvent.click(checkButton!);

    expect(mockStore.addCategory).toHaveBeenCalledWith('Drinks');
  });

  it('handles adding a category with Enter key', () => {
    render(<DashboardView searchQuery="" />);
    
    // Open add category input
    const addButton = screen.getByRole('button', { name: /Add Category/i });
    fireEvent.click(addButton);

    // Type new category name and press Enter
    const input = screen.getByPlaceholderText('Category name...');
    fireEvent.change(input, { target: { value: 'Drinks' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockStore.addCategory).toHaveBeenCalledWith('Drinks');
  });

  it('cancels adding a category with Escape key', () => {
    render(<DashboardView searchQuery="" />);
    
    // Open add category input
    const addButton = screen.getByRole('button', { name: /Add Category/i });
    fireEvent.click(addButton);

    // Press Escape
    const input = screen.getByPlaceholderText('Category name...');
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(screen.queryByPlaceholderText('Category name...')).not.toBeInTheDocument();
  });

  it('cancels adding a category with close button', () => {
    render(<DashboardView searchQuery="" />);
    
    // Open add category input
    const addButton = screen.getByRole('button', { name: /Add Category/i });
    fireEvent.click(addButton);

    // Click close button
    const closeButton = screen.getAllByRole('button').find(b => b.innerHTML.includes('close'));
    fireEvent.click(closeButton!);

    expect(screen.queryByPlaceholderText('Category name...')).not.toBeInTheDocument();
  });

  it('handles plan deletion', () => {
    render(<DashboardView searchQuery="" />);
    const deleteBtn = screen.getByTitle('Delete Plan');
    fireEvent.click(deleteBtn);
    
    expect(screen.getByText('Delete this entire plan?')).toBeInTheDocument();
    const confirmBtn = screen.getByRole('button', { name: /^Delete$/ });
    fireEvent.click(confirmBtn);
    
    expect(mockStore.deletePlan).toHaveBeenCalledWith('p1');
  });

  it('handles managing assignees', () => {
    render(<DashboardView searchQuery="" />);
    const addAssigneeBtn = screen.getByText(/Add Assignee/i);
    fireEvent.click(addAssigneeBtn);
    
    expect(screen.getByText('Manage Assignees')).toBeInTheDocument();
    
    const dialog = screen.getByRole('dialog');
    const input = within(dialog).getByPlaceholderText('Name...');
    fireEvent.change(input, { target: { value: 'Bob' } });
    fireEvent.click(within(dialog).getByText('Add'));
    
    expect(mockStore.addPerson).toHaveBeenCalledWith('Bob');
    
    // Test remove person
    // Test remove person
    const aliceText = within(dialog).getByText('Alice');
    const badge = aliceText.closest('[class*="Badge"]') || aliceText.parentElement;
    const xButton = within(badge as HTMLElement).getByRole('button');
    fireEvent.click(xButton);
    expect(mockStore.removePerson).toHaveBeenCalledWith('Alice');
  });

  it('handles adding person via Enter key', () => {
    render(<DashboardView searchQuery="" />);
    fireEvent.click(screen.getByText(/Add Assignee/i));
    const dialog = screen.getByRole('dialog');
    const input = within(dialog).getByPlaceholderText('Name...');
    fireEvent.change(input, { target: { value: 'Bob' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockStore.addPerson).toHaveBeenCalledWith('Bob');
  });

  it('renders correctly with no active plan', () => {
    (useAppStore as any).mockReturnValue({ ...mockStore, activePlan: null });
    render(<DashboardView searchQuery="" />);
    expect(screen.getByText('Kanban Board')).toBeInTheDocument();
  });

  it('renders correctly with many persons', () => {
    const manyPersons = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'];
    (useAppStore as any).mockReturnValue({ ...mockStore, persons: manyPersons });
    render(<DashboardView searchQuery="" />);
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('renders correctly with no persons', () => {
    (useAppStore as any).mockReturnValue({ ...mockStore, persons: [] });
    render(<DashboardView searchQuery="" />);
    fireEvent.click(screen.getByText(/Add Assignee/i));
    expect(screen.getByText('No assignees yet.')).toBeInTheDocument();
  });
});
