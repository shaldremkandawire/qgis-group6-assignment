"use client";
import { useEffect, useState, Suspense } from 'react';
import { Layers, Filter, Download, AlertCircle } from 'lucide-react';

// Dynamically import the MapComponent with no SSR
import dynamic from 'next/dynamic';

const MapComponent = dynamic(
  () => import('./MapComponent'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading map...</p>
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
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flood-risk-analysis-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Flood Risk Analysis Map</h1>
              <p className="text-gray-600">Interactive visualization of settlements in flood-prone areas</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select 
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="ALL">All Risk Levels</option>
                  <option value="HIGH">High Risk Only</option>
                  <option value="MEDIUM">Medium Risk Only</option>
                  <option value="LOW">Low Risk Only</option>
                </select>
              </div>
              <button
                onClick={handleExportData}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Download className="w-4 h-4" />
                Export Data
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h2 className="text-lg font-bold text-gray-800">Risk Analysis</h2>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3">Legend</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500"></div>
                  <span className="text-sm">High Risk Flood Zone</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-500"></div>
                  <span className="text-sm">Medium Risk Flood Zone</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500"></div>
                  <span className="text-sm">Low Risk Flood Zone</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-600"></div>
                  <span className="text-sm">Settlement in High Risk Zone</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-600"></div>
                  <span className="text-sm">Safe Settlement</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3">Statistics</h3>
              <div className="space-y-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Total Flood Zones</p>
                  <p className="text-lg font-bold">{floodZones.length}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">High Risk Settlements</p>
                  <p className="text-lg font-bold">{highRisk.length}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Total Settlements</p>
                  <p className="text-lg font-bold">{settlements.length}</p>
                </div>
              </div>
            </div>

            {highRisk.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">High Risk Settlements</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {highRisk.map((settlement, index) => (
                    <div key={index} className="bg-red-50 p-3 rounded-lg border border-red-200">
                      <p className="font-medium text-red-700">{settlement.name}</p>
                      <p className="text-sm text-red-600">Population: {settlement.population}</p>
                      <p className="text-sm text-red-600">Risk: {settlement.risk_level}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <Suspense fallback={
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading spatial data...</p>
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
    </div>
  );
}