import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [loggedInUser, setLoggedInUser] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // --- STATES FOR REPORT GENERATION ---
    const [reportDate, setReportDate] = useState('');
    const [reportLoading, setReportLoading] = useState(false);
    const [reportError, setReportError] = useState(null);
    const [stockReportDate, setStockReportDate] = useState('');
    const [stockReportLoading, setStockReportLoading] = useState(false);
    const [stockReportError, setStockReportError] = useState(null);

    useEffect(() => {
        // Fetch all users
        fetchUsers();

        // Get logged-in user and initialize report dates
        const user = localStorage.getItem('userId');
        if (user) setLoggedInUser(user);

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const formattedToday = `${year}-${month}-${day}`;

        setReportDate(formattedToday);
        setStockReportDate(formattedToday);
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/users');
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const addUser = async () => {
        if (userId.trim() && password.trim() && role.trim()) {
            try {
                const res = await fetch('http://localhost:5000/api/add-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, password, role }),
                });

                const data = await res.json();

                if (res.ok) {
                    alert('User added successfully!');
                    setUserId('');
                    setPassword('');
                    setRole('');
                    fetchUsers(); // Refresh the list of users
                } else {
                    alert(data.message || 'Failed to add user.');
                }
            } catch (err) {
                console.error('Error adding user:', err);
                alert('An error occurred while adding the user.');
            }
        } else {
            alert('Please fill all fields: User ID, Password, and Role.');
        }
    };

    const deleteUser = async (id) => {
        if (window.confirm(`Are you sure you want to delete user: ${id}?`)) {
            try {
                const res = await fetch(`http://localhost:5000/api/delete-user/${id}`, {
                    method: 'DELETE',
                });

                const data = await res.json();

                if (res.ok) {
                    alert('User deleted successfully!');
                    fetchUsers(); // Refresh the list of users
                } else {
                    alert(data.message || 'Failed to delete user.');
                }
            } catch (err) {
                console.error('Error deleting user:', err);
                alert('An error occurred while deleting the user.');
            }
        }
    };

    // --- Handle daily sales report generation ---
    const generateDailyReport = async () => {
        if (!reportDate) {
            setReportError('Please select a date for the sales report.');
            return;
        }

        setReportLoading(true);
        setReportError(null);

        try {
            const response = await fetch(`http://localhost:5000/api/sales/report-by-date?date=${reportDate}`);
            const data = await response.json();

            if (!response.ok) {
                console.warn(`[AdminDashboard] Failed to fetch sales report. Navigating with empty data if status allows.`);
                navigate('/report', { state: { reportDate, dailyReport: [], reportType: 'sales' } });
            } else {
                console.log('[AdminDashboard] Navigating to Sales Report with state:', { reportDate, dailyReport: data, reportType: 'sales' });
                navigate('/report', { state: { reportDate, dailyReport: data, reportType: 'sales' } });
            }
        } catch (err) {
            console.error('Error fetching daily sales report:', err);
            setReportError(`Error generating sales report: ${err.message}`);
        } finally {
            setReportLoading(false);
        }
    };

    // --- Handle daily stock report generation ---
    const generateDailyStockReport = async () => {
        if (!stockReportDate) {
            setStockReportError('Please select a date for the stock report.');
            return;
        }

        setStockReportLoading(true);
        setStockReportError(null);

        try {
            const response = await fetch(`http://localhost:5000/api/fertilizers/stock-report-by-date?date=${stockReportDate}`);
            const data = await response.json();

            if (!response.ok) {
                console.warn(`[AdminDashboard] Failed to fetch stock report. Navigating with empty data if status allows.`);
                navigate('/reportpage', { state: { reportDate: stockReportDate, dailyReport: [], reportType: 'stock' } });
            } else {
                console.log('[AdminDashboard] Navigating to Stock Report with state:', { reportDate: stockReportDate, dailyReport: data, reportType: 'stock' });
                navigate('/reportpage', { state: { reportDate: stockReportDate, dailyReport: data, reportType: 'stock' } });
            }
        } catch (err) {
            console.error('Error fetching daily stock report:', err);
            setStockReportError(`Error generating stock report: ${err.message}`);
        } finally {
            setStockReportLoading(false);
        }
    };


    return (
        <div className="admin-dashboard">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="logo">FertiStock</div>
                
                <ul className="nav-links">
                    <li><Link to="/dashboard">Dashboard</Link></li>
                    <li><Link to="/inventory">Inventory</Link></li>
                    <li><Link to="/sales">Sales</Link></li>
                    <li><Link to="/stock">Stock</Link></li>
                    <li><Link to="/notifications">Notifications</Link></li>
                    <li><Link to="/">Logout</Link></li>
                </ul>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <div className="top-bar">
                    <h2>Admin Dashboard</h2>
                </div>
                
                {/* User Management Title */}
                <div className="top-bar user-management-header">
                    <h3>Manage Users</h3>
                </div>

                {/* Add User Form */}
                <div className="add-user-form">
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="User ID"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group password-group"> 
                        <input
                            type={showPassword ? "text" : "password"} // Toggle type
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    <div className="form-group dropdown-wrapper">
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                        >
                            <option value="">Select Role</option>
                            <option value="admin">Admin</option>
                            <option value="worker">Worker</option>
                        </select>
                        <button onClick={addUser}>Add User</button>
                    </div>
                </div>

                {/* Users Table */}
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Role</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user._id || index}>
                                <td>{user.userId}</td>
                                <td>{user.role}</td>
                                <td>
                                    <button className="delete-button" onClick={() => deleteUser(user.userId)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <br></br>

                {/* --- Report Generation Section (MOVED TO BOTTOM) --- */}
                <div className="reports-container">
                    
                    {/* Daily Sales Report Section */}
                    <div className="daily-report-section chart-card">
                        <h3>Generate Daily Sales Report</h3>
                        <div className="report-controls">
                            <label htmlFor="reportDate">Select Date:</label>
                            <input
                                type="date"
                                id="reportDate"
                                value={reportDate}
                                onChange={(e) => setReportDate(e.target.value)}
                                className="report-date-input"
                            />
                            <button
                                onClick={generateDailyReport}
                                className="generate-report-button"
                                disabled={reportLoading}
                            >
                                {reportLoading ? 'Generating...' : 'Generate Sales Report'}
                            </button>
                        </div>
                        {reportError && <p className="error-message">{reportError}</p>}
                    </div>

                    {/* Daily Stock Report Section */}
                    <div className="daily-report-section chart-card">
                        <h3>Generate Daily Stock Report</h3>
                        <div className="report-controls">
                            <label htmlFor="stockReportDate">Select Date:</label>
                            <input
                                type="date"
                                id="stockReportDate"
                                value={stockReportDate}
                                onChange={(e) => setStockReportDate(e.target.value)}
                                className="report-date-input"
                            />
                            <button
                                onClick={generateDailyStockReport}
                                className="generate-report-button"
                                disabled={stockReportLoading}
                            >
                                {stockReportLoading ? 'Generating...' : 'Generate Stock Report'}
                            </button>
                        </div>
                        {stockReportError && <p className="error-message">{stockReportError}</p>}
                    </div>
                </div>
                {/* --- END Report Generation Section --- */}

            </div>
        </div>
    );
}

export default AdminDashboard;