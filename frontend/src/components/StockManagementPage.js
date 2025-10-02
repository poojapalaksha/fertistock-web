import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './StockManagementPage.css';

function StockManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [stockHistory, setStockHistory] = useState([]);
  const [filteredStock, setFilteredStock] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const API_BASE_URL = 'http://localhost:5000/api/fertilizers';

  // Fetch fertilizer stock from backend
  const fetchStock = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/all`);

      if (!response.ok) {
        throw new Error('Failed to fetch fertilizers');
      }
      const data = await response.json();
      // Ensure the stock history and filtered stock only show items with quantity > 0 initially
      const currentStock = data.filter(item => item.quantityReceived > 0);
      setStockHistory(data); // Store ALL history for filtering
      setFilteredStock(currentStock); // Display only current stock
    } catch (error) {
      console.error('Error fetching fertilizers:', error);
    }
  };

  // --- Deletion Handler ---
  const handleDelete = async (itemId, itemName) => {
    if (!window.confirm(`Are you sure you want to delete the stock entry for "${itemName}"? This action cannot be undone.`)) {
      return; // Stop if the user cancels
    }

    try {
      // NOTE: You must ensure your backend has a DELETE endpoint set up at /api/fertilizers/:id
      const response = await fetch(`${API_BASE_URL}/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        // Attempt to get a more specific error message from the response body
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete stock entry');
      }

      // Refresh the stock list after successful deletion
      console.log(`Stock entry with ID ${itemId} deleted successfully.`);
      fetchStock(); 
    } catch (error) {
      console.error('Error deleting stock entry:', error);
      alert(`Error: ${error.message}`);
    }
  };
  // -------------------------

  // Fetch stock on mount
  useEffect(() => {
    fetchStock();
  }, []);

  // Refresh data when navigated back after update
  useEffect(() => {
    if (location.state?.updated) {
      navigate(location.pathname, { replace: true, state: {} });
      fetchStock();
    }
  }, [location.state, navigate, location.pathname]);

  // Filter whenever search, date or stock changes
  useEffect(() => {
    handleSearch();
  }, [searchTerm, invoiceDate, stockHistory]);

  // Filter stock based on search term, date, and quantity > 0
  const handleSearch = () => {
    const filtered = stockHistory.filter(item => {
      const matchesProduct =
        searchTerm === '' ||
        item.fertilizerName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDate =
        invoiceDate === '' ||
        (item.purchaseDate && item.purchaseDate.startsWith(invoiceDate));

      // **Important:** This ensures that the main stock view only shows current stock
      const hasQuantity = item.quantityReceived > 0; 

      return matchesProduct && matchesDate && hasQuantity;
    });
    setFilteredStock(filtered);
  };

  // Navigate to Add Stock Entry page
  const handleAddStockClick = () => {
    navigate('/stock/entry');
  };

  // Reset filters and show full stock
  const handleReset = () => {
    setSearchTerm('');
    setInvoiceDate('');
    // Filter the full stock history to show only items with quantity > 0
    setFilteredStock(stockHistory.filter(item => item.quantityReceived > 0)); 
  };
  
  // Helper function to check if a product is expired
  const isExpired = (expiryDateString) => {
    if (!expiryDateString) return false;
    const expiryDate = new Date(expiryDateString);
    // Only compare date parts, set time to midnight for accurate comparison
    expiryDate.setHours(0, 0, 0, 0); 
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return expiryDate < today;
  };
  

  return (
    <div className="stock-management-container">
      <div className="sidebar">
        <div className="logo">FertiStock</div>
        <ul className="nav-links">
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/inventory">Inventory</Link></li>
          <li><Link to="/sales">Sales</Link></li>
          <li className="active"><Link to="/stock">Stock</Link></li>
          <li><Link to="/notifications">Notifications</Link></li>
          <li><Link to="/">Logout</Link></li>
        </ul>
      </div>

      <div className="main-content">
        <header>
          <h2>Stock Management</h2>
          <div className="stock-actions">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search fertilizer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="date-filter">
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
            <button className="reset-button" onClick={handleReset}>
              Reset
            </button>
            <button className="add-stock-button" onClick={handleAddStockClick}>
              + Add Stock
            </button>
          </div>
        </header>

        <div className="stock-history">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Purchase Date</th>
                <th>Expiry Date</th>
                <th>Invoice No</th>
                <th>Action</th> {/* Added Action column */}
              </tr>
            </thead>
            <tbody>
              {filteredStock.length > 0 ? (
                filteredStock.map((item) => (
                  // Apply a class to expired rows for visual emphasis (you'll need to define this in CSS)
                  <tr 
                    key={item._id || item.invoiceNumber}
                    className={isExpired(item.expiryDate) ? 'expired-row' : ''}
                  > 
                    <td>{item.fertilizerName}</td>
                    <td>{item.quantityReceived}</td>
                    <td>{item.purchaseDate?.split('T')[0]}</td>
                    <td>{item.expiryDate?.split('T')[0]}</td>
                    <td>{item.invoiceNumber}</td>
                    <td>
                      {/* Delete Button */}
                      {isExpired(item.expiryDate) && (
                        <button 
                          className="delete-button" 
                          onClick={() => handleDelete(item._id, item.fertilizerName)}
                          title="Delete this expired stock entry"
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}> {/* Updated colspan to 6 */}
                    No matching stock entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StockManagementPage;