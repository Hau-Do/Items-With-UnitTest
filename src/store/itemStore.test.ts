import { renderHook, act } from '@testing-library/react';
import { useItemStore } from './itemStore';

describe('ItemStore', () => {
  beforeAll(() => {
    localStorage.clear();
  });
  
  beforeEach(() => {
    localStorage.clear();
    const { result } = renderHook(() => useItemStore());
    act(() => {
      result.current.resetStore();
    });
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should sort items correctly when changing sort order', () => {
    const { result } = renderHook(() => useItemStore());

    // Create items with distinctly different dates, one day apart
    const item1 = {
      id: '1',
      text: 'First Item',
      createdDate: new Date('2024-01-01T10:00:00.000Z')
    };

    const item2 = {
      id: '2',
      text: 'Second Item',
      createdDate: new Date('2024-01-02T10:00:00.000Z')
    };

    // Add items in order
    act(() => {
      result.current.addItem(item1);
      result.current.addItem(item2);
    });

    // Verify initial descending order (default)
    let items = result.current.getAllItems();
    // console.log('Initial sort (desc):', items.map(i => ({ id: i.id, date: i.createdDate })));
    expect(items[0].id).toBe('2'); // newer item should be first
    expect(items[1].id).toBe('1'); // older item should be second

    // Change to ascending order
    act(() => {
      result.current.setSortOrder('asc');
    });

    // Verify ascending order
    items = result.current.getAllItems();
    // console.log('After asc sort:', items.map(i => ({ id: i.id, date: i.createdDate })));
    expect(items[0].id).toBe('1'); // older item should be first
    expect(items[1].id).toBe('2'); // newer item should be second
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useItemStore());
    
    expect(result.current.items).toEqual([]);
    expect(result.current.sortOrder).toBe('desc');
    expect(result.current.hasInitiallyLoaded).toBe(false);
  });

  it('should add items and maintain sort order', () => {
    const { result } = renderHook(() => useItemStore());

    const item1 = {
      id: '1',
      text: 'Test 1',
      createdDate: new Date('2024-01-01T10:00:00.000Z')
    };

    const item2 = {
      id: '2',
      text: 'Test 2',
      createdDate: new Date('2024-01-02T10:00:00.000Z')
    };

    act(() => {
      result.current.addItem(item1);
      result.current.addItem(item2);
    });

    const items = result.current.getAllItems();
    expect(items[0].id).toBe('2'); // newest first
    expect(items[1].id).toBe('1'); // oldest second
  });

  it('should persist single item to localStorage', async () => {
    const { result } = renderHook(() => useItemStore());

    act(() => {
      result.current.resetStore();
    });

    const testItem = {
      id: '1',
      text: 'Test 1',
      createdDate: new Date('2024-01-01T10:00:00.000Z')
    };

    act(() => {
      result.current.addItem(testItem);
    });

    // Force any pending promises to resolve
    await new Promise(resolve => setTimeout(resolve, 0));

    const storageData = localStorage.getItem('item-storage');
    const storedData = JSON.parse(storageData || '{}');

    expect(storedData.state.items).toHaveLength(1);
    expect(storedData.state.items[0].id).toBe('1');
  });

  it('should handle hasInitiallyLoaded state', () => {
    const { result } = renderHook(() => useItemStore());

    expect(result.current.hasInitiallyLoaded).toBe(false);

    act(() => {
      result.current.setHasInitiallyLoaded(true);
    });

    expect(result.current.hasInitiallyLoaded).toBe(true);
  });
});