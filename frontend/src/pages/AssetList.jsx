import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const AssetList = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Debouncing search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAssets();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, riskFilter, page]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/assets', {
        params: {
          query: search,
          riskLevel: riskFilter,
          page: page,
          size: 8,
          sortBy: 'id',
          sortDir: 'desc'
        }
      });
      setAssets(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch (err) {
      setError('Failed to load assets inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This action is log-audited.`)) {
      try {
        await api.delete(`/assets/${id}`);
        fetchAssets(); // Refresh list
      } catch (err) {
        alert('Failed to delete asset');
      }
    }
  };

  const handleExport = () => {
    // Open direct download link in a new window or trigger browser download
    const token = localStorage.getItem('token');
    const exportUrl = `${window.location.origin}/api/assets/export?Authorization=Bearer ${token}`;
    
    // We can fetch it with axios or use anchor click with token config, but standard file trigger is:
    api.get('/assets/export', { responseType: 'blob' })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'cyber_risk_assets.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((error) => {
        alert('CSV Export failed');
      });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
            <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">Dashboard</Link>
            <Link to="/assets" className="text-sm font-semibold text-primary-500">Assets Inventory</Link>
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
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Assets Inventory</h2>
            <p className="text-sm text-slate-500">Manage, inspect, and export organization risk profiles.</p>
          </div>
          <button
            onClick={handleExport}
            className="inline-flex touch-target items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
          >
            <svg className="h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export to CSV
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Filters and search panel */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <input
              type="text"
              placeholder="Search by asset name, type, or description..."
              className="block w-full touch-target rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-800 placeholder-slate-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          </div>
          <div>
            <select
              className="block w-full touch-target rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              value={riskFilter}
              onChange={(e) => {
                setRiskFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="">All Risk Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Table Panel */}
        <div className="premium-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Asset Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Asset Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Risk Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Risk Score</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Vulnerabilities</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-500">
                      <div className="flex items-center justify-center gap-3">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
                        Querying inventory data...
                      </div>
                    </td>
                  </tr>
                ) : assets.length > 0 ? (
                  assets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-semibold text-slate-900">{asset.assetName}</td>
                      <td className="px-6 py-4 text-slate-500">{asset.assetType}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          asset.riskLevel === 'Critical' ? 'bg-red-100 text-red-800' :
                          asset.riskLevel === 'High' ? 'bg-orange-100 text-orange-800' :
                          asset.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {asset.riskLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-semibold">{asset.riskScore}/10</td>
                      <td className="px-6 py-4 text-slate-500 truncate max-w-xs">{asset.vulnerabilities}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-right font-medium">
                        <div className="flex justify-end gap-3">
                          <Link to={`/assets/${asset.id}`} className="text-primary-500 hover:text-primary-600">Details</Link>
                          <Link to={`/assets/${asset.id}/edit`} className="text-indigo-500 hover:text-indigo-600">Edit</Link>
                          {user?.role === 'ADMIN' && (
                            <button
                              onClick={() => handleDelete(asset.id, asset.assetName)}
                              className="text-red-500 hover:text-red-600"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-500">No assets found matching the search criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-700">
                    Showing page <span className="font-semibold">{page + 1}</span> of <span className="font-semibold">{totalPages}</span> (<span className="font-semibold">{totalElements}</span> total assets)
                  </p>
                </div>
                <div>
                  <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setPage(0)}
                      disabled={page === 0}
                      className="relative inline-flex items-center rounded-l-md border border-slate-300 bg-white px-2 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                    >
                      &laquo; First
                    </button>
                    <button
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="relative inline-flex items-center border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <span className="relative inline-flex items-center border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
                      {page + 1}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={page === totalPages - 1}
                      className="relative inline-flex items-center border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => setPage(totalPages - 1)}
                      disabled={page === totalPages - 1}
                      className="relative inline-flex items-center rounded-r-md border border-slate-300 bg-white px-2 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Last &raquo;
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AssetList;
