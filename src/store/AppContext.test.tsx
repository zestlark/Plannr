import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, act } from '@testing-library/react';
import { AppProvider, useAppStore } from './AppContext';
import { supabase } from '@/lib/supabase';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/supabase', () => {
  return {
    supabase: {
      from: vi.fn(),
      channel: vi.fn(),
      removeChannel: vi.fn(),
    }
  };
});

const mockSupabase = supabase as any;

const TestComponent = ({ onStore }: { onStore?: (store: any) => void }) => {
  const store = useAppStore();
  if (onStore) onStore(store);
  return null;
};

describe('AppContext Full Stack', () => {
  const mockPlans = [{ id: '1', title: 'Plan 1' }];
  const mockPersons = [{ name: 'Alice' }];
  const mockCategories = [
    { id: 'c1', title: 'Cat 1', items: [{ id: 'i1', name: 'Item 1', person: 'Alice', qty: 1, unit: 'pcs' }] }
  ];

  const createMockBuilder = (data: any = null, error: any = null) => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    then: (resolve: any) => resolve({ data, error }),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'plans') return createMockBuilder(mockPlans);
      if (table === 'persons') return createMockBuilder(mockPersons);
      if (table === 'categories') return createMockBuilder(mockCategories);
      return createMockBuilder([]);
    });
    mockSupabase.channel.mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    });
  });

  it('handles sortAllItems and clipboard functionality with mixed persons', async () => {
    let store: any;
    const mixedCategories = [
      { 
        id: 'c1', 
        title: 'Cat 1', 
        items: [
          { id: 'i1', name: 'Zebra', person: 'Alice' },
          { id: 'i2', name: 'Apple', person: '' }, // Unassigned
          { id: 'i3', name: 'Banana', person: 'Alice' }
        ] 
      }
    ];

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'categories') return createMockBuilder(mixedCategories);
      return createMockBuilder([]);
    });

    render(<AppProvider><TestComponent onStore={(s) => store = s} /></AppProvider>);
    await waitFor(() => expect(store).toBeDefined());
    await act(async () => { store.setCurrentPlanId('1'); });
    await waitFor(() => expect(store.categories.length).toBeGreaterThan(0));
    
    act(() => store.sortAllItems());
    
    Object.assign(navigator, { clipboard: { writeText: vi.fn() } });
    act(() => store.copyCategoryToClipboard('c1'));
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it('covers all major functionality', async () => {
    let store: any;
    render(<AppProvider><TestComponent onStore={(s) => store = s} /></AppProvider>);
    await waitFor(() => expect(store).toBeDefined());

    // Plan CRUD
    await act(async () => { await store.addPlan('New'); });
    await act(async () => { await store.renamePlan('1', 'Renamed'); });
    await act(async () => { await store.deletePlan('1'); });

    // State after setting plan
    await act(async () => { store.setCurrentPlanId('1'); });
    await waitFor(() => expect(store.persons).toContain('Alice'));

    // Person CRUD
    await act(async () => { await store.addPerson('Bob'); });
    await act(async () => { await store.removePerson('Alice'); });

    // Category CRUD
    await act(async () => { await store.addCategory('New Cat'); });
    // Item CRUD
    await act(async () => { await store.addItem('c1', 'Item'); });
    await act(async () => { await store.updateItem('c1', 'i1', { qty: 2 }); });
    expect(store.categories[0].items[0].qty).toBe(2);
    await act(async () => { await store.moveItem('i1', 'c2'); });
    await act(async () => { await store.deleteItem('c1', 'i1'); });
    expect(store.categories[0].items.length).toBe(0);

    // Category deletion (do this after item tests)
    await act(async () => { await store.deleteCategory('c1'); });

    // Import/Export
    store.exportData();
    await act(async () => { await store.importData(JSON.stringify({ persons: ['X'], categories: [] })); });
    await act(async () => { await store.importData('invalid'); });

    // Extras
    act(() => store.sortAllItems());
    Object.assign(navigator, { clipboard: { writeText: vi.fn() } });
    act(() => store.copyCategoryToClipboard('c1'));
  });

  it('covers remaining branches', async () => {
    let store: any;
    render(<AppProvider><TestComponent onStore={(s) => store = s} /></AppProvider>);
    await waitFor(() => expect(store).toBeDefined());

    // Mock failures for coverage of error branches
    mockSupabase.from.mockImplementation(() => createMockBuilder(null, { message: 'err' }));
    
    await act(async () => { await store.addPlan('X'); });
    await act(async () => { await store.renamePlan('1', 'X'); });
    await act(async () => { await store.deletePlan('1'); });
    await act(async () => { store.setCurrentPlanId('1'); });
    await act(async () => { await store.addPerson('X'); });
    await act(async () => { await store.removePerson('X'); });
    await act(async () => { await store.renameCategory('c1', 'X'); });
    await act(async () => { await store.deleteCategory('c1'); });
    await act(async () => { await store.deleteItem('c1', 'i1'); });
    await act(async () => { await store.updateItem('c1', 'i1', {}); });
    await act(async () => { await store.moveItem('i1', 'c2'); });
  });

  it('covers remaining branches including delete active plan and import edge cases', async () => {
    let store: any;
    render(<AppProvider><TestComponent onStore={(s) => store = s} /></AppProvider>);
    await waitFor(() => expect(store).toBeDefined());

    // 1. Delete active plan
    await act(async () => { store.setCurrentPlanId('1'); });
    await act(async () => { await store.deletePlan('1'); });
    expect(store.currentPlanId).toBeNull();

    // 2. Import with 'people' key and empty categories
    await act(async () => { store.setCurrentPlanId('2'); });
    const importData = { people: ['Bob', ''], categories: [] };
    await act(async () => { await store.importData(JSON.stringify(importData)); });
    
    // 3. Import with catError
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'categories') return createMockBuilder(null, { message: 'cat err' });
      return createMockBuilder([]);
    });
    const importData2 = { categories: [{ id: 'c1', title: 'X', items: [] }] };
    await act(async () => { await store.importData(JSON.stringify(importData2)); });

    // 4. Import with itemsError
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'categories') return createMockBuilder([{ id: 'c1' }]);
      if (table === 'items') return createMockBuilder(null, { message: 'item err' });
      return createMockBuilder([]);
    });
    const importData3 = { categories: [{ id: 'c1', title: 'X', items: [{ id: 'i1', name: 'I' }] }] };
    await act(async () => { await store.importData(JSON.stringify(importData3)); });
  });

  it('covers cleanup and other missing lines', async () => {
     const { unmount } = render(<AppProvider><TestComponent /></AppProvider>);
     unmount();
     expect(mockSupabase.removeChannel).toHaveBeenCalled();
  });
});
