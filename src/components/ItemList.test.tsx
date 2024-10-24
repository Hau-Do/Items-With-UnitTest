import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ItemList from './ItemList';
import { useItemStore } from './store/itemStore';

jest.mock('./store/itemStore');

const mockUseItemStore = useItemStore as jest.MockedFunction<typeof useItemStore>;

describe('ItemList', () => {
  const mockStore = {
    items: [],
    sortOrder: 'desc' as const,
    hasInitiallyLoaded: false,
    addItem: jest.fn(),
    getAllItems: jest.fn(() => []),
    setSortOrder: jest.fn(),
    setHasInitiallyLoaded: jest.fn()
  };

  beforeEach(() => {
    mockUseItemStore.mockReturnValue(mockStore);
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

    fireEvent.change(input, { target: { value: 'New Item' } });
    fireEvent.click(submitButton);

    expect(mockStore.addItem).toHaveBeenCalled();
    expect(input).toHaveValue('');
  });

  it('handles sorting when sort button is clicked', () => {
    renderWithRouter(<ItemList />);
    
    const sortButton = screen.getByText(/Newest First/);
    fireEvent.click(sortButton);

    expect(mockStore.setSortOrder).toHaveBeenCalledWith('asc');
  });

  it('displays items with correct pagination', () => {
    const mockItems = Array.from({ length: 15 }, (_, i) => ({
      id: `${i}`,
      text: `Item ${i}`,
      createdDate: new Date()
    }));

    mockStore.getAllItems.mockReturnValue(mockItems);
    
    renderWithRouter(<ItemList />);
    
    expect(screen.getAllByText(/Item \d/).length).toBeLessThanOrEqual(5);
  });

  it('updates items per page when changed', () => {
    const mockItems = Array.from({ length: 15 }, (_, i) => ({
      id: `${i}`,
      text: `Item ${i}`,
      createdDate: new Date()
    }));

    mockStore.getAllItems.mockReturnValue(mockItems);
    
    renderWithRouter(<ItemList />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '10' } });

    expect(screen.getAllByText(/Item \d/).length).toBeLessThanOrEqual(10);
  });

  it('loads items when component mounts', () => {
    renderWithRouter(<ItemList />);
    
    expect(mockStore.getAllItems).toHaveBeenCalled();
    expect(mockStore.setHasInitiallyLoaded).toHaveBeenCalledWith(true);
  });
});