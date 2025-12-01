"use client";
import { useState, useEffect } from 'react';
import { Upload, Database, Plus, Trash2, RefreshCw, MapPin } from 'lucide-react';

export default function DataEntryPage() {
  const [settlements, setSettlements] = useState([]);
  const [floodZones, setFloodZones] = useState([]);
  const [newSettlement, setNewSettlement] = useState({
    name: '',
    type: 'Village',
    population: '',
    elevation: '',
    lat: '',
    lng: ''
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [settlementsRes, zonesRes] = await Promise.all([
      fetch('/api/settlements'),
      fetch('/api/flood-zones')
    ]);
    const settlementsData = await settlementsRes.json();
    const zonesData = await zonesRes.json();
    setSettlements(settlementsData);
    setFloodZones(zonesData);
  };

  const handleAddSettlement = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/settlements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettlement)
      });
      
      if (response.ok) {
        alert('Settlement added successfully!');
        setNewSettlement({
          name: '',
          type: 'Village',
          population: '',
          elevation: '',
          lat: '',
          lng: ''
        });
        fetchData();
      }
    } catch (error) {
      alert('Error adding settlement');
    }
  };

  const handleUploadGeoJSON = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const geoJson = JSON.parse(e.target.result);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, data: geoJson })
        });
        
        if (response.ok) {
          alert(`${type} data uploaded successfully!`);
          fetchData();
        }
      } catch (error) {
        alert('Error processing GeoJSON file');
      } finally {
        setUploading(false);
      }
    };
    
    reader.readAsText(file);
  };

  const handleDelete = async (id, type) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const response = await fetch(`/api/${type}/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('Item deleted successfully');
        fetchData();
      }
    } catch (error) {
      alert('Error deleting item');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Data Management</h1>
          <p className="text-gray-600">Manage settlements and flood zone data</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Add New Settlement */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Plus className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">Add New Settlement</h2>
            </div>
            
            <form onSubmit={handleAddSettlement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Settlement Name
                </label>
                <input
                  type="text"
                  value={newSettlement.name}
                  onChange={(e) => setNewSettlement({...newSettlement, name: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={newSettlement.type}
                    onChange={(e) => setNewSettlement({...newSettlement, type: e.target.value})}
                    className="w-full border rounded-lg px-4 py-2"
                  >
                    <option value="Village">Village</option>
                    <option value="Town">Town</option>
                    <option value="City">City</option>
                    <option value="Camp">Camp</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Population
                  </label>
                  <input
                    type="number"
                    value={newSettlement.population}
                    onChange={(e) => setNewSettlement({...newSettlement, population: e.target.value})}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newSettlement.lat}
                    onChange={(e) => setNewSettlement({...newSettlement, lat: e.target.value})}
                    className="w-full border rounded-lg px-4 py-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newSettlement.lng}
                    onChange={(e) => setNewSettlement({...newSettlement, lng: e.target.value})}
                    className="w-full border rounded-lg px-4 py-2"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Elevation (meters)
                </label>
                <input
                  type="number"
                  step="any"
                  value={newSettlement.elevation}
                  onChange={(e) => setNewSettlement({...newSettlement, elevation: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Add Settlement
              </button>
            </form>
            
            {/* GeoJSON Upload Section */}
            <div className="mt-8 pt-8 border-t">
              <div className="flex items-center gap-3 mb-4">
                <Upload className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800">Bulk Upload GeoJSON</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Settlements (GeoJSON)
                  </label>
                  <input
                    type="file"
                    accept=".json,.geojson"
                    onChange={(e) => handleUploadGeoJSON(e, 'settlements')}
                    className="w-full text-sm"
                    disabled={uploading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Flood Zones (GeoJSON)
                  </label>
                  <input
                    type="file"
                    accept=".json,.geojson"
                    onChange={(e) => handleUploadGeoJSON(e, 'flood_zones')}
                    className="w-full text-sm"
                    disabled={uploading}
                  />
                </div>
              </div>
              
              {uploading && (
                <div className="mt-4 text-center">
                  <RefreshCw className="w-5 h-5 animate-spin inline mr-2" />
                  <span className="text-sm text-gray-600">Uploading data...</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Data Tables */}
          <div className="space-y-8">
            {/* Settlements Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-800">Settlements</h2>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    {settlements.length} records
                  </span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Population</th>
                      <th className="px6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {settlements.map((settlement) => (
                      <tr key={settlement.id}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {settlement.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {settlement.type}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {settlement.population?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleDelete(settlement.id, 'settlements')}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Flood Zones Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-red-600" />
                    <h2 className="text-xl font-bold text-gray-800">Flood Zones</h2>
                  </div>
                  <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
                    {floodZones.length} records
                  </span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zone Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {floodZones.map((zone) => (
                      <tr key={zone.id}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {zone.zone_name}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            zone.risk_level === 'HIGH' ? 'bg-red-100 text-red-800' :
                            zone.risk_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {zone.risk_level}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleDelete(zone.id, 'flood-zones')}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}