"use client";
import { useEffect, useState, Suspense } from 'react';
import { Layers, Filter, Download, AlertCircle, ShieldAlert, ShieldCheck, Shield, RefreshCw } from 'lucide-react';

// Dynamically import the MapComponent with no SSR
import dynamic from 'next/dynamic';

const MapComponent = dynamic(
  () => import('./MapComponent'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-700 font-medium">Loading interactive map...</p>
          <p className="text-sm text-gray-500">Preparing risk visualization</p>
        </div>
      </div>
    )
  }
);

export default function MapPage() {
  const [floodZones, setFloodZones] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [highRisk, setHighRisk] = useState([]);
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadAllData();
  }, [riskFilter]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [zonesRes, settlementsRes, highRiskRes] = await Promise.all([
        fetch('/api/flood-zones'),
        fetch('/api/settlements'),
        fetch('/api/high-risk')
      ]);
      
      const zonesData = await zonesRes.json();
      const settlementsData = await settlementsRes.json();
      const highRiskData = await highRiskRes.json();
      
      setFloodZones(zonesData);
      setSettlements(settlementsData);
      setHighRisk(highRiskData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    const data = {
      floodZones,
      highRiskSettlements: highRisk,
      generatedAt: new Date().toISOString(),
      riskSummary: getRiskSummary()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flood-risk-analysis-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const getRiskSummary = () => {
    const highRiskCount = floodZones.filter(z => z.risk_level === 'HIGH').length;
    const mediumRiskCount = floodZones.filter(z => z.risk_level === 'MEDIUM').length;
    const lowRiskCount = floodZones.filter(z => z.risk_level === 'LOW').length;
    
    return {
      highRisk: highRiskCount,
      mediumRisk: mediumRiskCount,
      lowRisk: lowRiskCount,
      totalSettlements: settlements.length,
      atRiskSettlements: highRisk.length
    };
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'HIGH': return 'from-red-500 to-red-600';
      case 'MEDIUM': return 'from-orange-500 to-yellow-500';
      case 'LOW': return 'from-green-500 to-emerald-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRiskIcon = (risk) => {
    switch (risk) {
      case 'HIGH': return <ShieldAlert className="w-5 h-5 text-white" />;
      case 'MEDIUM': return <Shield className="w-5 h-5 text-white" />;
      case 'LOW': return <ShieldCheck className="w-5 h-5 text-white" />;
      default: return <Shield className="w-5 h-5 text-white" />;
    }
  };

  const riskSummary = getRiskSummary();

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping"></div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Flood Risk Analysis Dashboard</h1>
                <p className="text-blue-200">Interactive visualization of flood-prone areas with risk indicators</p>
                {lastUpdated && (
                  <p className="text-xs text-blue-300 mt-1">
                    Last updated: {lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-blue-800/50 backdrop-blur-sm rounded-lg px-4 py-2">
                <Filter className="w-5 h-5 text-blue-200" />
                <select 
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="bg-transparent text-white border-none focus:ring-0 focus:outline-none text-sm font-medium"
                >
                  <option value="ALL">All Risk Levels</option>
                  <option value="HIGH">🚨 High Risk Only</option>
                  <option value="MEDIUM">⚠️ Medium Risk Only</option>
                  <option value="LOW">✅ Low Risk Only</option>
                </select>
              </div>
              <button
                onClick={loadAllData}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={handleExportData}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg shadow-lg transition transform hover:scale-105"
              >
                <Download className="w-4 h-4" />
                Export Data
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Risk Summary Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="container mx-auto px-6 py-3">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-red-600 font-semibold uppercase">High Risk Zones</p>
                  <p className="text-2xl font-bold text-red-700">{riskSummary.highRisk}</p>
                </div>
                <div className="relative">
                  <ShieldAlert className="w-8 h-8 text-red-500" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-orange-600 font-semibold uppercase">Medium Risk</p>
                  <p className="text-2xl font-bold text-orange-700">{riskSummary.mediumRisk}</p>
                </div>
                <div className="relative">
                  <Shield className="w-8 h-8 text-orange-500" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-600/10 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 font-semibold uppercase">Low Risk Zones</p>
                  <p className="text-2xl font-bold text-green-700">{riskSummary.lowRisk}</p>
                </div>
                <ShieldCheck className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-500/10 to-indigo-600/10 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-semibold uppercase">At-Risk Settlements</p>
                  <p className="text-2xl font-bold text-blue-700">{riskSummary.atRiskSettlements}</p>
                </div>
                <div className="relative">
                  <AlertCircle className="w-8 h-8 text-blue-500" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto shadow-lg">
          <div className="p-6">
            {/* Risk Indicator Guide */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-5 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Risk Visualization Guide</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                      <ShieldAlert className="w-4 h-4 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <span className="font-bold text-red-700">High Risk Zone</span>
                    <p className="text-xs text-red-600">Immediate action required • Pulsing indicator</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center shadow-lg">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></div>
                  </div>
                  <div>
                    <span className="font-bold text-orange-700">Medium Risk Zone</span>
                    <p className="text-xs text-orange-600">Monitor regularly • Solid indicator</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-green-700">Low Risk Zone</span>
                    <p className="text-xs text-green-600">Minimal flooding risk • Stable indicator</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Risk Filter */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Active Risk Filter
              </h3>
              <div className="space-y-2">
                {['HIGH', 'MEDIUM', 'LOW', 'ALL'].map((risk) => (
                  <button
                    key={risk}
                    onClick={() => setRiskFilter(risk)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                      riskFilter === risk 
                        ? `bg-gradient-to-r ${getRiskColor(risk)} text-white shadow-lg transform scale-105` 
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getRiskIcon(risk)}
                      <span className="font-medium">
                        {risk === 'ALL' ? 'All Risk Levels' : `${risk} Risk`}
                      </span>
                    </div>
                    {riskFilter === risk && (
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* High Risk Settlements with Shining Indicators */}
            {highRisk.length > 0 && (
              <div className="bg-gradient-to-b from-red-50 to-pink-50 border border-red-200 rounded-xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-red-800 text-lg flex items-center gap-2">
                    <div className="relative">
                      <AlertCircle className="w-6 h-6" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                    </div>
                    High Risk Settlements
                  </h3>
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">
                    {highRisk.length} Critical
                  </span>
                </div>
                
                <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                  {highRisk.map((settlement, index) => (
                    <div 
                      key={index} 
                      className="bg-white p-4 rounded-lg border border-red-300 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse"></div>
                            <p className="font-bold text-red-700">{settlement.name}</p>
                          </div>
                          <p className="text-sm text-red-600">{settlement.district || 'Malawi'}</p>
                        </div>
                        <div className="relative">
                          <div className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full shadow">
                            🚨 HIGH RISK
                          </div>
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div className="bg-red-50 p-2 rounded">
                          <p className="text-xs text-red-500">Population</p>
                          <p className="font-semibold text-red-700">{settlement.population.toLocaleString()}</p>
                        </div>
                        <div className="bg-red-50 p-2 rounded">
                          <p className="text-xs text-red-500">Elevation</p>
                          <p className="font-semibold text-red-700">{settlement.elevation}m</p>
                        </div>
                      </div>
                      
                      {settlement.reason && (
                        <div className="mt-3 pt-3 border-t border-red-100">
                          <p className="text-xs text-red-600 italic">⚠️ {settlement.reason}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map Legend */}
            <div className="mt-6 bg-gradient-to-b from-gray-50 to-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-bold text-gray-800 mb-3">Map Legend</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-6 h-6 rounded bg-gradient-to-r from-red-500 to-red-600 shadow"></div>
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">High Risk Flood Zone</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-gradient-to-r from-orange-500 to-yellow-500 shadow"></div>
                  <span className="text-sm font-medium text-gray-700">Medium Risk Flood Zone</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-gradient-to-r from-green-500 to-emerald-600 shadow"></div>
                  <span className="text-sm font-medium text-gray-700">Low Risk Flood Zone</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-red-500 to-pink-600 shadow-lg"></div>
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Critical Settlement</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 shadow"></div>
                  <span className="text-sm font-medium text-gray-700">Safe Settlement</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="text-center">
                <div className="relative mx-auto w-20 h-20">
                  <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-4 border-4 border-red-200 rounded-full animate-pulse"></div>
                </div>
                <p className="mt-6 text-lg font-semibold text-gray-700">Loading Risk Analysis</p>
                <p className="text-sm text-gray-500">Visualizing flood zones and settlements...</p>
                <div className="mt-4 flex justify-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse delay-150"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-300"></div>
                </div>
              </div>
            </div>
          )}
          
          <Suspense fallback={
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white to-blue-50">
              <div className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="mt-4 text-gray-700 font-medium">Initializing Map Engine</p>
              </div>
            </div>
          }>
            <MapComponent 
              floodZones={floodZones}
              settlements={settlements}
              highRisk={highRisk}
              riskFilter={riskFilter}
              loading={loading}
            />
          </Suspense>
        </div>
      </div>

      {/* Footer Status Bar */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-2 px-6">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>High Risk Zone Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Data Loaded: {settlements.length} settlements</span>
            </div>
            {lastUpdated && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Last Updated: {lastUpdated.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-400">Map Status:</span>
            <span className="px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full text-xs font-bold">
              ACTIVE
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}