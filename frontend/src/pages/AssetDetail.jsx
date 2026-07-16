import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const AssetDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [asset, setAsset] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [report, setReport] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssetDetails();
  }, [id]);

  const fetchAssetDetails = async () => {
    try {
      setLoading(true);
      const assetResponse = await api.get(`/assets/${id}`);
      setAsset(assetResponse.data);
      
      // Fetch recommendations
      fetchRecommendations();
    } catch (err) {
      setError('Failed to load asset risk profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      setLoadingRecs(true);
      const recsResponse = await api.get(`/assets/${id}/recommendations`);
      setRecommendations(recsResponse.data);
    } catch (err) {
      console.error('Failed to load recommendations');
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setLoadingReport(true);
      const reportResponse = await api.get(`/assets/${id}/report`);
      setReport(reportResponse.data);
    } catch (err) {
      alert('Failed to generate executive report');
    } finally {
      setLoadingReport(false);
    }
  };



  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-bold text-red-600">Error</h2>
          <p className="mt-2 text-sm text-slate-600">{error || 'Asset not found'}</p>
          <Link to="/assets" className="mt-4 inline-block text-sm font-medium text-primary-500 hover:text-primary-600">
            &larr; Back to Inventory
          </Link>
        </div>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 9) return 'bg-red-500 text-white';
    if (score >= 7) return 'bg-orange-500 text-white';
    if (score >= 4) return 'bg-yellow-500 text-slate-900';
    return 'bg-green-500 text-white';
  };

  const getLevelColor = (level) => {
    if (level === 'Critical') return 'bg-red-100 text-red-800 border-red-200';
    if (level === 'High') return 'bg-orange-100 text-orange-800 border-orange-200';
    if (level === 'Medium') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
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
            <Link to="/assets" className="text-sm font-medium text-slate-600 hover:text-slate-900">Assets Inventory</Link>
            <Link to="/assets/new" className="rounded-lg bg-primary-500 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-primary-600 transition-colors touch-target flex items-center justify-center">
              + New Asset
            </Link>
          </nav>
          <div className="flex items-center gap-4 border-l border-slate-200 pl-4">
            <span className="text-sm text-slate-600">Hi, <strong className="text-slate-900">{user?.username}</strong> ({user?.role})</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <Link to="/assets" className="text-sm font-medium text-primary-500 hover:text-primary-600 flex items-center gap-1">
            &larr; Back to Assets Inventory
          </Link>
          <Link to={`/assets/${asset.id}/edit`} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-all touch-target flex items-center justify-center">
            Edit Asset
          </Link>
        </div>

        {/* Asset Header Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="premium-card p-8 lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1 rounded">
                  {asset.assetType}
                </span>
                <span className="text-xs text-slate-400">
                  Registered: {new Date(asset.createdDate).toLocaleDateString()}
                </span>
              </div>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{asset.assetName}</h2>
              <h4 className="mt-4 text-sm font-bold uppercase text-slate-500">Infrastructure Description</h4>
              <p className="mt-1 text-slate-700 leading-relaxed text-sm bg-slate-50 p-4 rounded-lg border border-slate-200/60 font-mono">
                {asset.description}
              </p>
            </div>
          </div>

          {/* Risk Level Card */}
          <div className="premium-card p-8 flex flex-col items-center justify-center text-center">
            <h3 className="text-base font-bold text-slate-800 uppercase tracking-wide">Threat Risk Rating</h3>
            
            <div className={`mt-6 flex h-28 w-28 items-center justify-center rounded-full text-3xl font-black shadow-lg ${getScoreColor(asset.riskScore)}`}>
              {asset.riskScore}
              <span className="text-sm font-normal">/10</span>
            </div>

            <div className={`mt-6 inline-flex items-center rounded-full border px-4 py-1 text-sm font-bold ${getLevelColor(asset.riskLevel)}`}>
              {asset.riskLevel} Severity
            </div>
          </div>
        </div>

        {/* Dynamic Details: Vulnerabilities & Recommendations */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Vulnerabilities */}
          <div className="premium-card p-6">
            <h3 className="mb-4 text-lg font-bold text-slate-900 flex items-center gap-2">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              AI Identified Vulnerability Vector
            </h3>
            
            {asset.vulnerabilities ? (
              <div className="space-y-3">
                {asset.vulnerabilities.split(', ').map((vuln, i) => (
                  <div key={i} className="flex items-start gap-3 bg-red-50/40 p-3 rounded-lg border border-red-100">
                    <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{i+1}</span>
                    <span className="text-slate-800 text-sm font-medium">{vuln}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500">No vulnerabilities logged.</div>
            )}

            <h4 className="mt-6 text-sm font-bold uppercase text-slate-500">Business Impact Analysis</h4>
            <div className="mt-2 bg-slate-50 p-4 rounded-lg border border-slate-200/60 text-sm text-slate-700 leading-relaxed font-semibold">
              {asset.impact || 'Under analysis'}
            </div>
          </div>

          {/* Recommendations */}
          <div className="premium-card p-6">
            <h3 className="mb-4 text-lg font-bold text-slate-900 flex items-center gap-2">
              <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.952 11.952 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              AI Actionable Security Recommendations
            </h3>

            {loadingRecs ? (
              <div className="py-12 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
                Querying AI models...
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((rec, i) => (
                  <div key={i} className="flex flex-col gap-2 bg-slate-50 p-4 rounded-lg border border-slate-200/60 shadow-sm hover:border-slate-300 transition-all">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                        rec.action_type === 'configure' ? 'bg-blue-100 text-blue-800' :
                        rec.action_type === 'patch' ? 'bg-orange-100 text-orange-800' :
                        rec.action_type === 'upgrade' ? 'bg-purple-100 text-purple-800' :
                        rec.action_type === 'monitor' ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {rec.action_type}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        rec.priority === 'High' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {rec.priority} Priority
                      </span>
                    </div>
                    <p className="text-slate-700 text-sm">{rec.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500 text-center py-12">No recommendations retrieved from AI.</div>
            )}
          </div>
        </div>

        {/* Executive Report Panel */}
        <div className="premium-card p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Executive Cyber Risk Report Console</h3>
              <p className="text-xs text-slate-500">Consolidates threat models, vulnerabilities, and action plans into a single briefing report.</p>
            </div>
            {!report && (
              <button
                onClick={handleGenerateReport}
                disabled={loadingReport}
                className="inline-flex touch-target items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {loadingReport ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Synthesizing...
                  </>
                ) : 'Generate Executive Report'}
              </button>
            )}
          </div>

          {report && (
            <div className="border-t border-slate-200 pt-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm font-sans max-w-4xl mx-auto">
                <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-end">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{report.title}</h2>
                    <span className="text-xs text-slate-400">Class: Internal Executive Briefing</span>
                  </div>
                  {report.is_fallback && (
                    <span className="rounded bg-yellow-100 border border-yellow-200 text-yellow-800 text-[10px] font-bold px-2 py-0.5">
                      Fallback Static Report
                    </span>
                  )}
                </div>
                
                <h4 className="text-sm font-bold uppercase text-slate-800">1. Executive Summary</h4>
                <p className="mt-2 text-slate-600 text-sm leading-relaxed mb-6 italic">{report.summary}</p>
                
                <h4 className="text-sm font-bold uppercase text-slate-800">2. Environmental Overview</h4>
                <p className="mt-2 text-slate-600 text-sm leading-relaxed mb-6">{report.overview}</p>
                
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-bold uppercase text-slate-800 mb-2">3. Primary Risk Findings</h4>
                    <ul className="list-disc list-inside space-y-1.5 text-slate-600 text-sm">
                      {report.key_items && report.key_items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase text-slate-800 mb-2">4. Actionable Mitigation Roadmap</h4>
                    <ul className="list-decimal list-inside space-y-1.5 text-slate-600 text-sm font-medium">
                      {report.recommendations && report.recommendations.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AssetDetail;
