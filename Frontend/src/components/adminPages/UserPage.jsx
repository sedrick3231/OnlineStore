import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import axios from "axios";
import { Calendar, Mail, ShoppingBag, Users, Search } from "lucide-react";
import { useEffect, useState } from "react";
import "./admin.css";

const url = import.meta.env.VITE_BACKEND_URL;

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [UsersCount, setUsersCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${url}/user/api/v1/getusers`, {
          withCredentials: true,
        });
        if (!res.data.success) {
          alert("Error fetching data!");
          return;
        }
        setUsers(res.data.users);
        setUsersCount(res.data.count);
      } catch (error) {
        console.error("Error fetching users:", error);
        alert("Something went wrong while fetching users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const GetDate = (registrationDate) => {
    const date = new Date(registrationDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const totalOrders = users.reduce((sum, user) => sum + (user.Orders || 0), 0);
  const avgOrdersPerUser = users.length > 0 ? (totalOrders / users.length).toFixed(1) : 0;
  const recentUsers = users.filter((user) => {
    const created = new Date(user.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return created >= thirtyDaysAgo;
  }).length;

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Users Management</h1>
          <p className="admin-page-subtitle">Manage and monitor your customers</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
            <Users size={24} style={{ color: 'var(--accent)' }} />
          </div>
          <div className="admin-stat-content">
            <p className="admin-stat-label">Total Users</p>
            <p className="admin-stat-value">{UsersCount}</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
            <ShoppingBag size={24} style={{ color: '#22c55e' }} />
          </div>
          <div className="admin-stat-content">
            <p className="admin-stat-label">Total Orders</p>
            <p className="admin-stat-value">{totalOrders}</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(249, 115, 22, 0.1)' }}>
            <Calendar size={24} style={{ color: '#f97316' }} />
          </div>
          <div className="admin-stat-content">
            <p className="admin-stat-label">New Users (30d)</p>
            <p className="admin-stat-value">{recentUsers}</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(168, 85, 247, 0.1)' }}>
            <Mail size={24} style={{ color: '#a855f7' }} />
          </div>
          <div className="admin-stat-content">
            <p className="admin-stat-label">Avg Orders/User</p>
            <p className="admin-stat-value">{avgOrdersPerUser}</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="admin-search-bar">
        <Search size={20} className="admin-search-icon" />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-search-input"
        />
      </div>

      {/* Users Table */}
      <div className="admin-table-container">
        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Registered</th>
                <th>Orders</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td data-label="User">
                    <div className="admin-table-user">
                      <Avatar>
                        <AvatarImage
                          src={user.image?.url}
                          className="admin-avatar-img"
                        />
                        <AvatarFallback className="admin-avatar-fallback">
                          {user.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="admin-user-name">{user.name}</span>
                    </div>
                  </td>
                  <td data-label="Email" className="admin-table-email">{user.email}</td>
                  <td data-label="Registered" className="admin-table-date">{GetDate(user.createdAt)}</td>
                  <td data-label="Orders">
                    <span className="admin-badge admin-badge-orders">
                      {user.Orders || 0}
                    </span>
                  </td>
                  <td data-label="Status">
                    <span className="admin-badge admin-badge-active">
                      Active
                    </span>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="admin-table-empty">
                    {searchTerm ? "No users found matching your search." : "No users found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
