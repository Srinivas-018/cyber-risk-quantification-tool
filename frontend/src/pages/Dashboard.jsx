import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6']; // Critical, High, Medium, Low colors
const PIE_COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (err) {
        setError('Failed to fetch dashboard metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  // Prep Chart Data
  const riskData = stats ? [
    { name: 'Critical', count: stats.riskDistribution['Critical'] || 0 },
    { name: 'High', count: stats.riskDistribution['High'] || 0 },
    { name: 'Medium', count: stats.riskDistribution['Medium'] || 0 },
    { name: 'Low', count: stats.riskDistribution['Low'] || 0 },
  ] : [];

  const typeData = stats ? Object.keys(stats.typeDistribution).map((key) => ({
    name: key,
    value: stats.typeDistribution[key]
  })) : [];

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Top Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500 text-white">
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">QuantifyRisk</h1>
          </div>
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-sm font-semibold text-primary-500">Dashboard</Link>
            <Link to="/assets" className="text-sm font-medium text-slate-600 hover:text-slate-900">Assets Inventory</Link>
            <Link to="/assets/new" className="rounded-lg bg-primary-500 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-primary-600 transition-colors touch-target flex items-center justify-center">
              + New Asset
            </Link>
          </nav>
          <div className="flex items-center gap-4 border-l border-slate-200 pl-4">
            <span className="text-sm text-slate-600">Hi, <strong className="text-slate-900">{user?.username}</strong> ({user?.role})</span>
            <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:text-red-500 transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Cyber Risk Dashboard</h2>
            <p className="text-sm text-slate-500">Real-time quantification of organization cyber assets risk profile.</p>
          </div>
          <div className="text-sm text-slate-500 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
            Status: <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Database & AI Connected</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* KPI Cards Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Assets */}
          <div className="premium-card p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Total Quantified Assets</span>
              <span className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </span>
            </div>
            <div className="mt-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900">{stats?.totalAssets}</span>
            </div>
          </div>

          {/* Average Risk Score */}
          <div className="premium-card p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Average Risk Score</span>
              <span className={`rounded-lg p-2 ${stats?.averageRiskScore >= 7.0 ? 'bg-red-50 text-red-600' : stats?.averageRiskScore >= 4.0 ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'}`}>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900">{stats?.averageRiskScore}</span>
              <span className="text-sm font-semibold text-slate-500">/10</span>
            </div>
          </div>

          {/* Critical Assets */}
          <div className="premium-card p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Critical Threat Assets</span>
              <span className="rounded-lg bg-red-50 p-2 text-red-600 animate-pulse">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
            </div>
            <div className="mt-2">
              <span className="text-3xl font-bold tracking-tight text-red-600">{stats?.criticalCount}</span>
            </div>
          </div>

          {/* High Assets */}
          <div className="premium-card p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">High Threat Assets</span>
              <span className="rounded-lg bg-orange-50 p-2 text-orange-600">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.952 11.952 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
                </svg>
              </span>
            </div>
            <div className="mt-2">
              <span className="text-3xl font-bold tracking-tight text-orange-600">{stats?.highCount}</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Risk Level Distribution Chart */}
          <div className="premium-card p-6 lg:col-span-2">
            <h3 className="mb-4 text-base font-bold text-slate-900">Risk Severity Level Distribution</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Asset Type Chart */}
          <div className="premium-card p-6">
            <h3 className="mb-4 text-base font-bold text-slate-900">Asset Type Breakdown</h3>
            <div className="h-72">
              {typeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">No assets seeded.</div>
              )}
            </div>
            {/* Legend for Pie */}
            <div className="mt-2 flex flex-wrap justify-center gap-4 text-xs font-semibold text-slate-600">
              {typeData.map((entry, idx) => (
                <span key={entry.name} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></span>
                  {entry.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Live Audit Log Section */}
        <div className="premium-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">System Security Audit Log Feed</h3>
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
              Active Security Guard
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Action Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Performed By</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white text-sm">
                {stats?.recentLogs && stats.recentLogs.length > 0 ? (
                  stats.recentLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          log.actionType === 'CREATE' ? 'bg-green-100 text-green-800' :
                          log.actionType === 'UPDATE' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {log.actionType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700">{log.actionDetails}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-slate-500 font-semibold">{log.performedBy}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No logs captured yet. Perform CRUD actions to see this populate.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
