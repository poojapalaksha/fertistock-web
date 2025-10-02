// components/DashboardPage.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Removed useNavigate since report generation is gone
import './DashboardPage.css';

function DashboardPage() {
    // Removed useNavigate since it's only needed for reports
    // const navigate = useNavigate(); 

    const [totalInventoryQuantity, setTotalInventoryQuantity] = useState(0);
    const [totalFertilizerTypes, setTotalFertilizerTypes] = useState(0);
    const [todaysSales, setTodaysSales] = useState(0);
    const [weeklySalesData, setWeeklySalesData] = useState([]);
    const [inventoryByTypeData, setInventoryByTypeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [username, setUsername] = useState("Guest");

    // REMOVED: Report generation states

    const barColors = [
        '#B0E0E6', '#FFC0CB', '#DDA0DD', '#FFDAB9', '#ADD8E6',
        '#F0E68C', '#E6E6FA', '#FFEBCD', '#AFEEEE', '#F5DEB3',
    ];

    const getBarColor = (index) => {
        return barColors[index % barColors.length];
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // You would fetch the actual username from your authentication system here
                setUsername("Worker User"); // Example

                const inventoryRes = await fetch('http://localhost:5000/api/fertilizers/summary');
                if (!inventoryRes.ok) throw new Error('Failed to fetch inventory summary');
                const inventoryData = await inventoryRes.json();
                setTotalInventoryQuantity(inventoryData.totalQuantity || 0);
                setTotalFertilizerTypes(inventoryData.totalTypes || 0);

                const salesTodayRes = await fetch('http://localhost:5000/api/sales/today');
                if (!salesTodayRes.ok) throw new Error('Failed to fetch today\'s sales');
                const salesTodayData = await salesTodayRes.json();
                setTodaysSales(salesTodayData.totalSales || 0);

                const weeklySalesRes = await fetch('http://localhost:5000/api/sales/weekly');
                if (!weeklySalesRes.ok) throw new Error('Failed to fetch weekly sales');
                const weeklySalesDataRaw = await weeklySalesRes.json();

                const chartDataMap = new Map();
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Normalize to start of day

                for (let i = 6; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(today.getDate() - i);
                    const formattedDate = date.toISOString().split('T')[0];
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    chartDataMap.set(formattedDate, { date: formattedDate, name: dayName, sales: 0 });
                }

                weeklySalesDataRaw.forEach(item => {
                    if (chartDataMap.has(item._id)) {
                        const existing = chartDataMap.get(item._id);
                        chartDataMap.set(item._id, { ...existing, sales: item.totalSales });
                    }
                });

                const sortedSalesData = Array.from(chartDataMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
                setWeeklySalesData(sortedSalesData);

                const inventoryByTypeRes = await fetch('http://localhost:5000/api/fertilizers/inventory-by-type');
                if (!inventoryByTypeRes.ok) throw new Error('Failed to fetch inventory by type');
                const inventoryByTypeDataRaw = await inventoryByTypeRes.json();
                setInventoryByTypeData(inventoryByTypeDataRaw);

            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // REMOVED: Report date initialization

    }, []);

    // REMOVED: generateDailyReport and generateDailyStockReport functions

    const currentMaxSales = Math.max(...weeklySalesData.map(d => d.sales), 0);
    const displayMaxSales = Math.max(currentMaxSales * 1.1, 1);
    const midSales = displayMaxSales * 0.5;

    const currentMaxQuantity = Math.max(...inventoryByTypeData.map(d => d.quantity), 0);
    const displayMaxQuantity = Math.max(currentMaxQuantity * 1.1, 1);
    const midQuantity = displayMaxQuantity * 0.5;

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="sidebar">
                    <div className="logo">FertiStock</div>
                    <ul className="nav-links">
                        <li className="active"><Link to="/dashboard">Dashboard</Link></li>
                        <li><Link to="/inventory">Inventory</Link></li>
                        <li><Link to="/sales">Sales</Link></li>
                        <li><Link to="/stock">Stock</Link></li>
                        <li><Link to="/notifications">Notifications</Link></li>
                        <li><Link to="/">Logout</Link></li>
                    </ul>
                </div>
                <div className="main-content">
                    <header><h2>Dashboard Overview</h2></header>
                    <p>Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container">
                <div className="sidebar">
                    <div className="logo">FertiStock</div>
                    <ul className="nav-links">
                        <li className="active"><Link to="/dashboard">Dashboard</Link></li>
                        <li><Link to="/inventory">Inventory</Link></li>
                        <li><Link to="/sales">Sales</Link></li>
                        <li><Link to="/stock">Stock</Link></li>
                        <li><Link to="/notifications">Notifications</Link></li>
                        <li><Link to="/">Logout</Link></li>
                    </ul>
                </div>
                <div className="main-content">
                    <header><h2>Dashboard Overview</h2></header>
                    <p className="error-message">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="logo">FertiStock</div>
                <ul className="nav-links">
                    <li className="active"><Link to="/dashboard">Dashboard</Link></li>
                    <li><Link to="/inventory">Inventory</Link></li>
                    <li><Link to="/sales">Sales</Link></li>
                    <li><Link to="/stock">Stock</Link></li>
                    <li><Link to="/notifications">Notifications</Link></li>
                    <li><Link to="/">Logout</Link></li>
                </ul>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <header>
                    <h2>Dashboard Overview</h2>
                    {/* <p className="welcome-message">Welcome, {username}!</p> */}
                </header>
                <div className="overview-cards">
                    {/* Inventory Level Card */}
                    <div className="card">
                        <div className="card-header">Total Inventory</div>
                        <div className="card-body">
                            <span className="value">{totalInventoryQuantity.toLocaleString()}</span>
                        </div>
                        <div className="card-footer">
                            <small>{totalFertilizerTypes} fertilizer types</small>
                        </div>
                    </div>

                    {/* Today's Sales Card */}
                    <div className="card">
                        <div className="card-header">Today's Sales</div>
                        <div className="card-body">
                            <span className="value">₹ {todaysSales.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="card-footer">
                            <small>Total revenue generated today</small>
                        </div>
                    </div>
                </div>

                {/* Sales Over Last 7 Days Custom Bar Chart */}
                <div className="sales-chart chart-card">
                    <h3>Sales Over Last 7 Days</h3>
                    <div className="bar-chart-container">
                        <div className="y-axis">
                            <div className="y-label">{displayMaxSales > 0 ? `₹${displayMaxSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : ''}</div>
                            <div className="y-label middle">{midSales > 0 ? `₹${midSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : ''}</div>
                            <div className="y-label bottom">₹0</div>
                        </div>
                        <div className="bars-and-x-axis">
                            <div className="bars">
                                {weeklySalesData.map((dataPoint, index) => (
                                    <div key={index} className="bar-wrapper">
                                        <div
                                            className="bar"
                                            style={{
                                                height: `${(dataPoint.sales / displayMaxSales) * 100}%`,
                                                minHeight: dataPoint.sales > 0 ? '1px' : '0',
                                                backgroundColor: getBarColor(index)
                                            }}
                                            title={`Sales: ₹${dataPoint.sales.toLocaleString(undefined, { maximumFractionDigits: 0 })} on ${dataPoint.name}`}
                                        >
                                            {dataPoint.sales > 0 && (
                                                <span className="bar-value">
                                                    ₹{dataPoint.sales.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                </span>
                                            )}
                                        </div>
                                        <div className="bar-label">{dataPoint.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inventory Level by Fertilizer Type Chart */}
                <div className="inventory-chart chart-card">
                    <h3>Inventory Level by Fertilizer Type</h3>
                    <div className="bar-chart-container">
                        <div className="y-axis">
                            <div className="y-label">{displayMaxQuantity > 0 ? `${displayMaxQuantity.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : ''}</div>
                            <div className="y-label middle">{midQuantity > 0 ? `${midQuantity.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : ''}</div>
                            <div className="y-label bottom">0</div>
                        </div>
                        <div className="bars-and-x-axis">
                            <div className="bars">
                                {inventoryByTypeData.map((dataPoint, index) => (
                                    <div key={index} className="bar-wrapper">
                                        <div
                                            className="bar"
                                            style={{
                                                height: `${(dataPoint.quantity / displayMaxQuantity) * 100}%`,
                                                minHeight: dataPoint.quantity > 0 ? '1px' : '0',
                                                backgroundColor: getBarColor(index)
                                            }}
                                            title={`Quantity: ${dataPoint.quantity.toLocaleString(undefined, { maximumFractionDigits: 0 })} units of ${dataPoint.name}`}
                                        >
                                            {dataPoint.quantity > 0 && (
                                                <span className="bar-value">
                                                    {dataPoint.quantity.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                </span>
                                            )}
                                        </div>
                                        <div className="bar-label">{dataPoint.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* REMOVED: Daily Sales Report Section */}

                {/* REMOVED: Daily Stock Report Section */}

            </div>
        </div>
    );
}

export default DashboardPage;