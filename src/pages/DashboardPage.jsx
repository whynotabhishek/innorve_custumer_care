import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, RefreshCw, Database, TrendingUp, AlertTriangle, CheckCircle2, Clock, Users, BarChart3 } from 'lucide-react';
import { getCases, getAnalytics, seedCases } from '../lib/api';
import CasesTable from '../components/dashboard/CasesTable';
import CaseDetail from '../components/dashboard/CaseDetail';
import AnalyticsPanel from '../components/dashboard/AnalyticsPanel';

export default function DashboardPage() {

  const [cases, setCases] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [casesData, analyticsData] = await Promise.all([
        getCases(),
        getAnalytics(),
      ]);
      setCases(Array.isArray(casesData) ? casesData : casesData?.cases || []);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedCases();
      await fetchData();
    } catch (err) {
      console.error('Seed error:', err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: '#030303' }}>
      {/* Header */}
      <header
        className="shrink-0 flex items-center justify-between px-6 h-14"
        style={{
          background: 'rgba(3,3,3,0.7)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.location.reload()}
            className="p-2 rounded-lg cursor-pointer transition-colors duration-150"
            style={{ color: '#888', background: 'transparent', border: 'none' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.color = '#E8E8E8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#888';
            }}
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-semibold" style={{ color: '#E8E8E8' }}>Staff Dashboard</h1>
            <p className="text-[10px]" style={{ color: '#555' }}>CreditAssist AI — Case Management</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors duration-150"
            style={{
              color: '#888',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors duration-150"
            style={{
              color: '#4F7CFF',
              background: 'rgba(79,124,255,0.08)',
              border: '1px solid rgba(79,124,255,0.15)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(79,124,255,0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(79,124,255,0.08)'}
          >
            <Database className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
            {seeding ? 'Seeding...' : 'Seed Demo Data'}
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Cases Table — 60% */}
        <div className="flex-1 lg:w-[60%] overflow-y-auto p-6">
          {error ? (
            <div className="flex flex-col items-center justify-center py-16">
              <AlertTriangle className="w-10 h-10 mb-3" style={{ color: '#FF4757' }} />
              <p className="text-sm" style={{ color: '#888' }}>{error}</p>
              <button
                onClick={fetchData}
                className="mt-4 px-4 py-2 rounded-lg text-xs cursor-pointer"
                style={{
                  background: 'rgba(79,124,255,0.1)',
                  color: '#4F7CFF',
                  border: '1px solid rgba(79,124,255,0.2)',
                }}
              >
                Retry
              </button>
            </div>
          ) : (
            <CasesTable
              cases={cases}
              loading={loading}
              onSelectCase={setSelectedCase}
            />
          )}
        </div>

        {/* Analytics — 40% */}
        <div
          className="lg:w-[40%] overflow-y-auto p-6"
          style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}
        >
          <AnalyticsPanel analytics={analytics} loading={loading} />
        </div>
      </div>

      {/* Case Detail Modal */}
      <AnimatePresence>
        {selectedCase && (
          <CaseDetail caseData={selectedCase} onClose={() => setSelectedCase(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
