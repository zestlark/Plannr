import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
    activePlan: { title: 'Summer Trip' },
    addCategory: vi.fn(),
    sortAllItems: vi.fn(),
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
});
