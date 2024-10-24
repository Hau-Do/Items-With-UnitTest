import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ItemList from './ItemList';
import { useItemStore } from '../store/itemStore';
import type { Item, SortOrder } from '../store/itemStore';

jest.mock('../store/itemStore');

type MockStore = {
  items: Item[];
  sortOrder: SortOrder;
  hasInitiallyLoaded: boolean;
  addItem: jest.Mock<void, [Item]>;
  getAllItems: jest.Mock<Item[], []>;
  setSortOrder: jest.Mock<void, [SortOrder]>;
  setHasInitiallyLoaded: jest.Mock<void, [boolean]>;
};

const mockUseItemStore = useItemStore as jest.MockedFunction<typeof useItemStore>;

describe('ItemList', () => {
  const user = userEvent.setup();
  
  const mockStore: MockStore = {
    items: [],
    sortOrder: 'desc' as const,
    hasInitiallyLoaded: false,
    addItem: jest.fn<void, [Item]>(),
    getAllItems: jest.fn<Item[], []>().mockReturnValue([]),
    setSortOrder: jest.fn<void, [SortOrder]>(),
    setHasInitiallyLoaded: jest.fn<void, [boolean]>()
  };

  beforeEach(() => {
    mockUseItemStore.mockReturnValue(mockStore);
    jest.clearAllMocks();
  });

  const renderWithRouter = (component: React.ReactNode) => {
    return render(
      <MemoryRouter>
        {component}
      </MemoryRouter>
    );
  };

  it('renders empty list initially', () => {
    renderWithRouter(<ItemList />);
    
    expect(screen.getByText('Item List')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter an item')).toBeInTheDocument();
  });

  it('adds new item when form is submitted', async () => {
    renderWithRouter(<ItemList />);
    
    const input = screen.getByPlaceholderText('Enter an item');
    const submitButton = screen.getByText('Add Item');

    await user.type(input, 'New Item');
    await user.click(submitButton);

    expect(mockStore.addItem).toHaveBeenCalled();
    expect(input).toHaveValue('');
  });

  it('handles sorting when sort button is clicked', async () => {
    renderWithRouter(<ItemList />);
    
    const sortButton = screen.getByText(/Newest First/);
    await user.click(sortButton);

    expect(mockStore.setSortOrder).toHaveBeenCalledWith('asc');
  });

  it('displays items with correct pagination', () => {
    const mockItems: Item[] = Array.from({ length: 15 }, (_, i) => ({
      id: `${i}`,
      text: `Item ${i}`,
      createdDate: new Date()
    }));

    mockStore.getAllItems.mockReturnValue(mockItems);
    
    renderWithRouter(<ItemList />);
    
    const items = screen.getAllByText(/Item \d/);
    expect(items.length).toBeLessThanOrEqual(5);
  });

  it('updates items per page when changed', async () => {
    const mockItems: Item[] = Array.from({ length: 15 }, (_, i) => ({
      id: `${i}`,
      text: `Item ${i}`,
      createdDate: new Date()
    }));

    mockStore.getAllItems.mockReturnValue(mockItems);
    
    renderWithRouter(<ItemList />);
    
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, '10');

    const items = screen.getAllByText(/Item \d/);
    expect(items.length).toBeLessThanOrEqual(10);
  });

  it('loads items when component mounts', () => {
    renderWithRouter(<ItemList />);
    
    expect(mockStore.getAllItems).toHaveBeenCalled();
    expect(mockStore.setHasInitiallyLoaded).toHaveBeenCalledWith(true);
  });
});