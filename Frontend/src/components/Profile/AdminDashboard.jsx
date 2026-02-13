import axios from "axios";
import { useEffect, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./dashboard.css";

const url = import.meta.env.VITE_BACKEND_URL;

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    orders: 0,
    customers: 0,
    products: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("adminAccessToken");
        const adminHeaders = token 
          ? { Authorization: `Bearer ${token}` } 
          : {};

        const [usersRes, revenueRes, statsRes] = await Promise.all([
          axios.get(`${url}/user/api/v1/getusers`, { withCredentials: true }),
          axios.get(`${url}/admin/api/v1/stats/revenue`, { headers: adminHeaders, withCredentials: true }),
          axios.get(`${url}/admin/api/v1/stats/overview`, { headers: adminHeaders, withCredentials: true }),
        ]);

        if (usersRes.data.success) setUsers(usersRes.data.users);
        if (Array.isArray(revenueRes.data)) setChartData(revenueRes.data);
        if (statsRes.data.success) setStats(statsRes.data.stats);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        alert("Something went wrong loading the dashboard.");
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div style={{ marginBottom: "40px", animation: "fadeInUp 600ms ease" }}>
        <h1 className="dashboard-title">Admin Dashboard</h1>
      </div>

      {/* Stats Cards Grid */}
      <div className="stats-grid">
        {[
          { label: "Total Sales", value: `$${stats.totalSales.toFixed(2)}`, icon: "💰" },
          { label: "Orders", value: stats.orders, icon: "📦" },
          { label: "Customers", value: users.length - 1, icon: "👥" },
          { label: "Products", value: stats.products, icon: "🛍️" },
        ].map((item, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-icon">{item.icon}</div>
            <div className="stat-content">
              <p className="stat-label">{item.label}</p>
              <p className="stat-value">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="dashboard-card" style={{ marginTop: "40px" }}>
        <h2 className="dashboard-section-title">Revenue Overview</h2>
        <div style={{ marginTop: "24px", background: "rgba(99, 102, 241, 0.02)", borderRadius: "16px", padding: "20px" }}>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <XAxis 
                dataKey="month" 
                stroke="var(--muted)" 
                style={{ fontSize: "12px" }}
              />
              <YAxis 
                stroke="var(--muted)" 
                style={{ fontSize: "12px" }}
              />
              <Tooltip 
                contentStyle={{
                  background: "var(--surface)",
                  border: `1.5px solid var(--border-light)`,
                  borderRadius: "12px",
                  boxShadow: "var(--shadow-2)",
                }}
                labelStyle={{ color: "var(--text)" }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--accent)"
                strokeWidth={3}
                dot={{ fill: "var(--accent)", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}