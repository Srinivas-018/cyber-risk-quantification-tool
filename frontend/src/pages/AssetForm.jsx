import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const AssetForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState('Server');
  const [description, setDescription] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (isEditMode) {
      const fetchAsset = async () => {
        try {
          setFetching(true);
          const response = await api.get(`/assets/${id}`);
          const asset = response.data;
          setAssetName(asset.assetName);
          setAssetType(asset.assetType);
          setDescription(asset.description || '');
        } catch (err) {
          setError('Failed to fetch asset details for editing');
        } finally {
          setFetching(false);
        }
      };
      fetchAsset();
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (!assetName.trim()) {
      setError('Asset Name is required');
      return;
    }
    if (!description.trim()) {
      setError('Asset description is required to perform risk quantification');
      return;
    }
    if (description.length < 15) {
      setError('Asset description must be at least 15 characters to allow accurate threat modeling');
      return;
    }

    setLoading(true);
    try {
      const payload = { assetName, assetType, description };
      if (isEditMode) {
        await api.put(`/assets/${id}`, payload);
      } else {
        await api.post('/assets', payload);
      }
      navigate('/assets');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save asset. Please verify AI service is online.');
    } finally {
      setLoading(false);
    }
  };



  if (fetching) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

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
            <Link to="/assets" className="text-sm font-medium text-slate-600 hover:text-slate-900">Assets Inventory</Link>
            <Link to="/assets/new" className="rounded-lg bg-primary-500 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-600 transition-colors touch-target flex items-center justify-center">
              + New Asset
            </Link>
          </nav>
          <div className="flex items-center gap-4 border-l border-slate-200 pl-4">
            <span className="text-sm text-slate-600">Hi, <strong className="text-slate-900">{user?.username}</strong> ({user?.role})</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/assets" className="text-sm font-medium text-primary-500 hover:text-primary-600 flex items-center gap-1">
            &larr; Back to Assets Inventory
          </Link>
          <h2 className="mt-3 text-2xl font-bold text-slate-900">
            {isEditMode ? 'Edit Security Asset' : 'Register New Security Asset'}
          </h2>
          <p className="text-sm text-slate-500">
            {isEditMode ? 'Modify details to re-run risk calculations.' : 'Input asset details. The AI service will automatically trigger threat quantification on save.'}
          </p>
        </div>

        <div className="premium-card p-8">
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Asset Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700">Asset Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full touch-target rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-800 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder="e.g. Core Database Server"
              />
            </div>

            {/* Asset Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700">Asset Type</label>
              <select
                className="mt-1 block w-full touch-target rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                value={assetType}
                onChange={(e) => setAssetType(e.target.value)}
              >
                <option value="Server">Server</option>
                <option value="Database">Database</option>
                <option value="Application">Application</option>
                <option value="Network">Network</option>
                <option value="Endpoint">Endpoint</option>
                <option value="Cloud Service">Cloud Service</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700">Asset Description (Factual & Detailed)</label>
              <p className="text-xs text-slate-400 mb-1">Outline operating systems, firewall postures, credentials status, and network segments to guide the AI.</p>
              <textarea
                required
                rows={4}
                className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-800 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Public-facing web server running outdated Ubuntu 20.04. Port 80, 443 are open with no web application firewall configured..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 border-t border-slate-100 pt-6">
              <Link to="/assets" className="text-sm font-medium text-slate-500 hover:text-slate-700">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex touch-target items-center justify-center gap-2 rounded-lg bg-primary-500 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Quantifying Risk...
                  </>
                ) : (
                  isEditMode ? 'Update & Re-Quantify' : 'Quantify & Save Asset'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AssetForm;
