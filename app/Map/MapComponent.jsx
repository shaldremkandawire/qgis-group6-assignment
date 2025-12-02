"use client";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, LayersControl, ScaleControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
    iconUrl: '/leaflet/images/marker-icon.png',
    shadowUrl: '/leaflet/images/marker-shadow.png',
  });
}

export default function MapComponent({ floodZones, settlements, highRisk, riskFilter, loading }) {
  // Don't render map on server
  if (typeof window === 'undefined') {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing map...</p>
        </div>
      </div>
    );
  }

  // Actual Malawi cities and towns with realistic risk levels
  const malawiPlaces = [
    // High Risk Areas (RED)
    {
      name: "Nsanje",
      type: "District Capital",
      coordinates: [35.2619, -16.9167],
      risk: "HIGH",
      population: 27180,
      elevation: 15,
      reason: "Located in Lower Shire Valley floodplain, prone to annual flooding"
    },
    {
      name: "Chikwawa",
      type: "District Capital",
      coordinates: [34.8000, -16.0333],
      risk: "HIGH",
      population: 24989,
      elevation: 105,
      reason: "Along Shire River, frequently flooded during rainy season"
    },
    {
      name: "Mwanza",
      type: "Border Town",
      coordinates: [34.5167, -15.6167],
      risk: "HIGH",
      population: 12500,
      elevation: 650,
      reason: "Hilly terrain with landslide risk during heavy rains"
    },
    
    // Medium Risk Areas (ORANGE)
    {
      name: "Mangochi",
      type: "Lakeside Town",
      coordinates: [35.2667, -14.4667],
      risk: "MEDIUM",
      population: 51429,
      elevation: 484,
      reason: "Lake Malawi shoreline, moderate flood risk"
    },
    {
      name: "Salima",
      type: "Lakeside District",
      coordinates: [34.4500, -13.7833],
      risk: "MEDIUM",
      population: 36600,
      elevation: 513,
      reason: "Coastal area with seasonal flooding"
    },
    {
      name: "Karonga",
      type: "Northern Town",
      coordinates: [33.9333, -9.9333],
      risk: "MEDIUM",
      population: 42755,
      elevation: 529,
      reason: "Northern floodplain area"
    },
    
    // Low Risk Areas (GREEN)
    {
      name: "Lilongwe",
      type: "Capital City",
      coordinates: [33.7741, -13.9626],
      risk: "LOW",
      population: 989318,
      elevation: 1050,
      reason: "High altitude, well-drained area"
    },
    {
      name: "Mzuzu",
      type: "Regional Capital",
      coordinates: [33.6000, -11.4583],
      risk: "LOW",
      population: 221272,
      elevation: 1254,
      reason: "Mountainous region, minimal flood risk"
    },
    {
      name: "Zomba",
      type: "Former Capital",
      coordinates: [35.3333, -15.3833],
      risk: "LOW",
      population: 101140,
      elevation: 915,
      reason: "Mountain slopes, good drainage"
    },
    {
      name: "Blantyre",
      type: "Commercial Capital",
      coordinates: [35.0086, -15.7861],
      risk: "LOW",
      population: 800264,
      elevation: 1039,
      reason: "Hilly terrain with good infrastructure"
    },
    {
      name: "Kasungu",
      type: "Agricultural Town",
      coordinates: [33.4833, -13.0333],
      risk: "LOW",
      population: 58653,
      elevation: 1034,
      reason: "Plateau region, minimal flooding"
    }
  ];

  // Major Malawi flood zones with realistic areas
  const malawiFloodZones = [
    // High Risk Zones (RED)
    {
      name: "Lower Shire Valley",
      risk: "HIGH",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [35.0, -17.0], [35.5, -17.0], [35.5, -16.5], [35.0, -16.5], [35.0, -17.0]
        ]]
      },
      description: "Annual flooding area affecting Nsanje and Chikwawa districts"
    },
    {
      name: "Lake Malawi Coastal Plain",
      risk: "HIGH",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [34.5, -14.5], [35.5, -14.5], [35.5, -14.0], [34.5, -14.0], [34.5, -14.5]
        ]]
      },
      description: "Flood-prone shoreline areas"
    },
    
    // Medium Risk Zones (ORANGE)
    {
      name: "Central Plain",
      risk: "MEDIUM",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [33.5, -14.0], [34.5, -14.0], [34.5, -13.5], [33.5, -13.5], [33.5, -14.0]
        ]]
      },
      description: "Moderate flood risk agricultural areas"
    },
    {
      name: "Northern Floodplains",
      risk: "MEDIUM",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [33.5, -10.5], [34.5, -10.5], [34.5, -9.5], [33.5, -9.5], [33.5, -10.5]
        ]]
      },
      description: "Seasonal flooding in northern districts"
    },
    
    // Low Risk Zones (GREEN)
    {
      name: "Highland Regions",
      risk: "LOW",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [33.0, -15.5], [34.0, -15.5], [34.0, -14.5], [33.0, -14.5], [33.0, -15.5]
        ]]
      },
      description: "Minimal flood risk due to elevation"
    },
    {
      name: "Mountainous Areas",
      risk: "LOW",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [33.5, -12.0], [34.5, -12.0], [34.5, -11.0], [33.5, -11.0], [33.5, -12.0]
        ]]
      },
      description: "Well-drained mountainous terrain"
    }
  ];

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'HIGH': return '#ef4444';
      case 'MEDIUM': return '#f59e0b';
      case 'LOW': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getRiskGradient = (risk) => {
    switch (risk) {
      case 'HIGH': return 'radial-gradient(circle, #ef4444 0%, #b91c1c 100%)';
      case 'MEDIUM': return 'radial-gradient(circle, #f59e0b 0%, #d97706 100%)';
      case 'LOW': return 'radial-gradient(circle, #10b981 0%, #059669 100%)';
      default: return '#6b7280';
    }
  };

  // Custom CSS markers for Malawi places
  const getPlaceIcon = (risk) => {
    const size = risk === 'HIGH' ? 36 : risk === 'MEDIUM' ? 32 : 28;
    const border = risk === 'HIGH' ? '3px solid white' : '2px solid white';
    
    return L.divIcon({
      html: `<div style="
        width: ${size}px;
        height: ${size}px;
        background: ${getRiskGradient(risk)};
        border-radius: 50%;
        border: ${border};
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${risk === 'HIGH' ? '16px' : '14px'};
        position: relative;
        ${risk === 'HIGH' ? 'animation: alarm 1s infinite alternate;' : ''}
        ${risk === 'MEDIUM' ? 'animation: pulse 2s infinite;' : ''}
      ">
        ${risk === 'HIGH' ? '🚨' : risk === 'MEDIUM' ? '⚠️' : '✅'}
        ${risk === 'HIGH' ? `
          <div style="
            position: absolute;
            top: -6px;
            right: -6px;
            width: 12px;
            height: 12px;
            background-color: #fbbf24;
            border-radius: 50%;
            border: 2px solid white;
            animation: ping 1s infinite;
          "></div>
        ` : ''}
        <style>
          @keyframes alarm {
            0% { transform: scale(1); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.6); }
            100% { transform: scale(1.1); box-shadow: 0 6px 16px rgba(239, 68, 68, 0.8); }
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          @keyframes ping {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(2); opacity: 0; }
          }
        </style>
      </div>`,
      className: `place-marker ${risk.toLowerCase()}-risk`,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
      popupAnchor: [0, -size/2]
    });
  };

  return (
    <MapContainer
      center={[-13.5, 34.5]} // Centered on Malawi
      zoom={7}
      minZoom={6}
      maxZoom={12}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
      className="leaflet-container"
      maxBounds={[
        [-17.5, 32.0], // Southwest bounds
        [-9.0, 36.0]   // Northeast bounds
      ]}
    >
      {/* Base Map Layer */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Alternative Topographic Layer */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
        attribution="Esri, HERE, Garmin, FAO, NOAA, USGS"
      />
      
      <ScaleControl position="bottomleft" imperial={false} />
      
      <LayersControl position="topright">
        {/* Malawi Flood Zones Layer */}
        <LayersControl.Overlay checked name="Malawi Flood Risk Zones">
          <GeoJSON
            data={{
              type: "FeatureCollection",
              features: malawiFloodZones
                .filter(zone => riskFilter === 'ALL' || zone.risk === riskFilter)
                .map(zone => ({
                  type: "Feature",
                  geometry: zone.geometry,
                  properties: {
                    name: zone.name,
                    risk: zone.risk,
                    description: zone.description
                  }
                }))
            }}
            style={(feature) => ({
              fillColor: getRiskColor(feature?.properties.risk),
              weight: 3,
              opacity: 0.9,
              color: getRiskColor(feature?.properties.risk),
              fillOpacity: feature?.properties.risk === 'HIGH' ? 0.4 : 
                          feature?.properties.risk === 'MEDIUM' ? 0.3 : 0.2,
              dashArray: feature?.properties.risk === 'HIGH' ? '10, 10' : 
                        feature?.properties.risk === 'MEDIUM' ? '5, 5' : null,
              className: `${feature?.properties.risk.toLowerCase()}-zone`
            })}
            onEachFeature={(feature, layer) => {
              if (feature.properties) {
                const riskColor = getRiskColor(feature.properties.risk);
                layer.bindPopup(`
                  <div class="p-4 min-w-[300px]">
                    <div class="flex items-center gap-3 mb-3">
                      <div class="w-8 h-8 rounded" style="background-color: ${riskColor};"></div>
                      <h3 class="font-bold text-xl">${feature.properties.name}</h3>
                    </div>
                    <div class="mb-4">
                      <span class="inline-block px-4 py-2 rounded-full text-sm font-bold 
                                   ${feature.properties.risk === 'HIGH' ? 'bg-red-100 text-red-800' : 
                                     feature.properties.risk === 'MEDIUM' ? 'bg-orange-100 text-orange-800' : 
                                     'bg-green-100 text-green-800'}">
                        ${feature.properties.risk} FLOOD RISK ZONE
                      </span>
                    </div>
                    <p class="text-gray-700 mb-4">${feature.properties.description}</p>
                    <div class="pt-3 border-t border-gray-200">
                      <p class="text-sm text-gray-600">
                        <span class="font-semibold">Affected Areas:</span> 
                        ${feature.properties.risk === 'HIGH' ? 'Nsanje, Chikwawa, Lower Shire Valley' : 
                          feature.properties.risk === 'MEDIUM' ? 'Coastal plains, agricultural areas' : 
                          'Highland regions, well-drained areas'}
                      </p>
                    </div>
                  </div>
                `);
              }
            }}
          />
        </LayersControl.Overlay>

        {/* Malawi Major Places Layer */}
        <LayersControl.Overlay checked name="Malawi Cities & Towns">
          {malawiPlaces
            .filter(place => riskFilter === 'ALL' || place.risk === riskFilter)
            .map((place, index) => (
              <Marker
                key={index}
                position={[place.coordinates[1], place.coordinates[0]]}
                icon={getPlaceIcon(place.risk)}
              >
                <Popup>
                  <div className="p-4 min-w-[300px]">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-xl">{place.name}</h3>
                        <p className="text-gray-600">{place.type}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                        place.risk === 'HIGH' ? 'bg-red-100 text-red-800' :
                        place.risk === 'MEDIUM' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {place.risk} RISK
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-xs text-gray-500">Population</p>
                          <p className="font-semibold">{place.population.toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-xs text-gray-500">Elevation</p>
                          <p className="font-semibold">{place.elevation}m</p>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-sm font-semibold text-blue-800 mb-1">Risk Assessment</p>
                        <p className="text-sm text-blue-700">{place.reason}</p>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Coordinates:</span> {place.coordinates[1].toFixed(4)}°S, {place.coordinates[0].toFixed(4)}°E
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
        </LayersControl.Overlay>

        {/* Original Data Layer (if available) */}
        {settlements.length > 0 && (
          <LayersControl.Overlay name="Database Settlements">
            {settlements.map((settlement, index) => {
              try {
                const isHighRisk = highRisk.some(hr => hr.id === settlement.id);
                const geometry = typeof settlement.geometry === 'string' 
                  ? JSON.parse(settlement.geometry) 
                  : settlement.geometry;
                
                let coordinates = [0, 0];
                if (geometry.type === 'Point') {
                  coordinates = geometry.coordinates;
                } else if (geometry.type === 'Feature') {
                  coordinates = geometry.geometry.coordinates;
                } else if (geometry.coordinates) {
                  coordinates = geometry.coordinates;
                }
                
                return (
                  <Marker
                    key={`db-${index}`}
                    position={[coordinates[1], coordinates[0]]}
                    icon={getPlaceIcon(isHighRisk ? 'HIGH' : 'LOW')}
                  >
                    <Popup>
                      <div className="p-3 min-w-[250px]">
                        <h3 className="font-bold text-lg mb-2">{settlement.name}</h3>
                        <p className={`text-sm font-semibold ${isHighRisk ? 'text-red-700' : 'text-green-700'}`}>
                          {isHighRisk ? '🚨 HIGH RISK AREA' : '✅ LOW RISK AREA'}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                );
              } catch (error) {
                return null;
              }
            }).filter(Boolean)}
          </LayersControl.Overlay>
        )}

        {/* Malawi Regions Legend */}
        <LayersControl.Overlay name="Regions Legend">
          <Marker position={[-16.0, 33.0]} icon={L.divIcon({
            html: `
              <div class="bg-white p-4 rounded-lg shadow-xl border border-gray-300" style="min-width: 200px;">
                <h4 class="font-bold text-lg mb-3 text-gray-800">Malawi Flood Risk Legend</h4>
                <div class="space-y-3">
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded bg-red-500"></div>
                    <span class="text-sm font-medium">High Risk Zone</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded bg-orange-500"></div>
                    <span class="text-sm font-medium">Medium Risk Zone</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded bg-green-500"></div>
                    <span class="text-sm font-medium">Low Risk Zone</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-red-600 animate-pulse"></div>
                    <span class="text-sm font-medium">High Risk City</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-5 h-5 rounded-full bg-orange-500"></div>
                    <span class="text-sm font-medium">Medium Risk Town</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded-full bg-green-600"></div>
                    <span class="text-sm font-medium">Low Risk Area</span>
                  </div>
                </div>
              </div>
            `,
            className: 'legend-marker',
            iconSize: [200, 150]
          })} />
        </LayersControl.Overlay>
      </LayersControl>

      {/* Water Bodies Highlight */}
      <GeoJSON
        data={{
          type: "FeatureCollection",
          features: [{
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [[
                [34.0, -14.5], [35.5, -14.5], [35.5, -9.5], [34.0, -9.5], [34.0, -14.5]
              ]]
            },
            properties: {
              name: "Lake Malawi",
              type: "Lake"
            }
          }]
        }}
        style={{
          fillColor: '#3b82f6',
          weight: 1,
          opacity: 0.3,
          color: '#1d4ed8',
          fillOpacity: 0.1,
          dashArray: '2, 5'
        }}
        onEachFeature={(feature, layer) => {
          layer.bindPopup(`
            <div class="p-3">
              <h3 class="font-bold text-lg">${feature.properties.name}</h3>
              <p class="text-sm text-blue-600">Major water body - Flood source</p>
            </div>
          `);
        }}
      />
    </MapContainer>
  );
}