import { renderHook, act } from '@testing-library/react';
import { useItemStore } from './itemStore';

describe('ItemStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useItemStore());
    act(() => {
      result.current.setHasInitiallyLoaded(false);
      localStorage.clear();
    });
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
      createdDate: new Date('2024-01-01')
    };

    const item2 = {
      id: '2',
      text: 'Test 2',
      createdDate: new Date('2024-01-02')
    };

    act(() => {
      result.current.addItem(item1);
      result.current.addItem(item2);
    });

    // Should be in descending order by default
    expect(result.current.getAllItems()).toEqual([item2, item1]);
  });

  it('should change sort order and resort items', () => {
    const { result } = renderHook(() => useItemStore());

    const items = [
      {
        id: '1',
        text: 'Test 1',
        createdDate: new Date('2024-01-01')
      },
      {
        id: '2',
        text: 'Test 2',
        createdDate: new Date('2024-01-02')
      }
    ];

    act(() => {
      items.forEach(item => result.current.addItem(item));
      result.current.setSortOrder('asc');
    });

    const sortedItems = result.current.getAllItems();
    expect(sortedItems[0].id).toBe('1');
    expect(sortedItems[1].id).toBe('2');
  });

  it('should persist data to localStorage', () => {
    const { result } = renderHook(() => useItemStore());

    const item = {
      id: '1',
      text: 'Test 1',
      createdDate: new Date('2024-01-01')
    };

    act(() => {
      result.current.addItem(item);
    });

    const storedData = JSON.parse(localStorage.getItem('item-storage') || '{}');
    expect(storedData.state.items).toBeDefined();
    expect(storedData.state.items.length).toBe(1);
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