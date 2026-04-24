import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Board } from './Board';
import { useAppStore } from '@/store/AppContext';

// Mock dnd-kit
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: any) => <div>{children}</div>,
  DragOverlay: ({ children }: any) => <div>{children}</div>,
  PointerSensor: vi.fn(),
  KeyboardSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(),
  closestCorners: vi.fn(),
  defaultDropAnimationSideEffects: vi.fn(),
}));

vi.mock('@dnd-kit/sortable', () => ({
  arrayMove: vi.fn(),
  sortableKeyboardCoordinates: vi.fn(),
  SortableContext: ({ children }: any) => <div>{children}</div>,
  verticalListSortingStrategy: {},
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
  }),
}));

vi.mock('./CategoryColumn', () => ({
  CategoryColumn: ({ category }: any) => <div data-testid="category-col">{category.title}</div>,
}));

vi.mock('@/store/AppContext', () => ({
  useAppStore: vi.fn(),
}));

describe('Board', () => {
  const categories = [
    { id: 'c1', title: 'Groceries', items: [{ id: 'i1', name: 'Milk' }] },
    { id: 'c2', title: 'Hardware', items: [] },
  ];

  const mockStore = {
    categories,
    setCategories: vi.fn(),
    moveItem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppStore as any).mockReturnValue(mockStore);
  });

  it('renders all categories', () => {
    render(<Board />);
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Hardware')).toBeInTheDocument();
  });

  it('filters by search query', () => {
    render(<Board searchQuery="Milk" />);
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    // Hardware should be filtered out because it has no items and searchQuery is not empty
    expect(screen.queryByText('Hardware')).not.toBeInTheDocument();
  });

  it('filters by person', () => {
    const categoriesWithPeople = [
      { id: 'c1', title: 'G', items: [{ id: 'i1', name: 'Milk', person: 'Alice' }] },
      { id: 'c2', title: 'H', items: [{ id: 'i2', name: 'Nails', person: 'Bob' }] },
    ];
    (useAppStore as any).mockReturnValue({ ...mockStore, categories: categoriesWithPeople });
    
    render(<Board peopleFilter={['Alice']} />);
    expect(screen.getByText('G')).toBeInTheDocument();
    expect(screen.queryByText('H')).not.toBeInTheDocument();
  });
});
