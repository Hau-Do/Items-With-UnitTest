import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from './Pagination';

describe('Pagination', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    itemsPerPage: 10,
    totalItems: 45,
    onPageChange: jest.fn(),
    onItemsPerPageChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders pagination controls', () => {
    render(<Pagination {...defaultProps} />);
    
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('disables Previous button on first page', () => {
    render(<Pagination {...defaultProps} currentPage={1} />);
    
    const prevButton = screen.getByText('Previous');
    expect(prevButton).toBeDisabled();
  });

  it('disables Next button on last page', () => {
    render(<Pagination {...defaultProps} currentPage={5} />);
    
    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
  });

  it('calls onPageChange when clicking page numbers', () => {
    render(<Pagination {...defaultProps} />);
    
    fireEvent.click(screen.getByText('2'));
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
  });

  it('shows correct items per page options', () => {
    render(<Pagination {...defaultProps} />);
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('10');
    
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(4); // [5, 10, 15, 20]
  });

  it('calls onItemsPerPageChange when changing items per page', () => {
    render(<Pagination {...defaultProps} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '20' } });
    
    expect(defaultProps.onItemsPerPageChange).toHaveBeenCalledWith(20);
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(1);
  });

  it('shows correct page range information', () => {
    render(<Pagination {...defaultProps} currentPage={2} itemsPerPage={10} totalItems={45} />);
    
    expect(screen.getByText('Showing 11 - 20 of 45 items')).toBeInTheDocument();
  });

  it('handles ellipsis correctly for many pages', () => {
    render(<Pagination {...defaultProps} totalPages={10} currentPage={5} />);
    
    expect(screen.getByText('...')).toBeInTheDocument();
  });
});