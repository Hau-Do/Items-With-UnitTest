import React, { useState, useEffect } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { useItemStore, Item } from '../store/itemStore';
import { useLocation } from 'react-router-dom';
import Pagination from './Pagination';

type SortOrder = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

const ItemList: React.FC = () => {
    const location = useLocation();
    const [inputText, setInputText] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [localItems, setLocalItems] = useState<Item[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const { 
    getAllItems, 
    addItem, 
    hasInitiallyLoaded, 
    setHasInitiallyLoaded 
  } = useItemStore();

  // Load initial data when component mounts or on page refresh
  useEffect(() => {
    if (location.pathname === '/' || !hasInitiallyLoaded) {
      const storedItems = getAllItems();
      setLocalItems(storedItems);
      setHasInitiallyLoaded(true);
    }
  }, [location.pathname, hasInitiallyLoaded]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputText.trim() !== '') {
      const newItem: Item = {
        id: Date.now().toString(),
        text: inputText,
        createdDate: new Date(),
      };
      
      // Update local state immediately
      setLocalItems(prevItems => [newItem, ...prevItems]);
      
      // Update Zustand store asynchronously
      setTimeout(() => {
        addItem(newItem);
      }, 0);
      
      setInputText('');
      setCurrentPage(1); // Reset to first page
    }
  };

  const handleSort = () => {
    const newSortOrder: SortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newSortOrder);
    
    const sortedItems = [...localItems].sort((a, b) => {
      const dateA = new Date(a.createdDate).getTime();
      const dateB = new Date(b.createdDate).getTime();
      return newSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    setLocalItems(sortedItems);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    // When changing items per page, we'll need to adjust the current page
    // to ensure we're not showing an empty page
    const newTotalPages = Math.ceil(localItems.length / newItemsPerPage);
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(localItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = localItems.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of list when page changes
    const listBody = document.querySelector('.list-body');
    if (listBody) {
      listBody.scrollTop = 0;
    }
  };

  return (
    <div className="item-list">
      <h1 className="page-title">Item List</h1>
      <form onSubmit={handleSubmit} className="item-form">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter an item"
          className="item-input"
        />
        <button type="submit" className="add-button">Add Item</button>
      </form>
      
      <div className="list-container">
        <div className="list-header">
          <div className="header-item">Text</div>
          <div className="header-item">
            Created Date
            <button onClick={handleSort} className="sort-button">
              <ArrowUpDown size={16} />
              {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
            </button>
          </div>
        </div>
        
        <div className="list-body">
          <ul className="item-list-ul">
            {currentItems.map((item) => (
              <li key={item.id} className="list-item">
                <div className="item-text">{item.text}</div>
                <div className="item-date">
                  {new Date(item.createdDate).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        {localItems.length > 0 && (
        <div className="list-footer">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={localItems.length}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      )}
      </div>
    </div>
  );
};

export default ItemList;