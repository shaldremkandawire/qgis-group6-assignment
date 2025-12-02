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

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'HIGH': return '#ef4444';
      case 'MEDIUM': return '#f59e0b';
      case 'LOW': return '#10b981';
      default: return '#6b7280';
    }
  };

  // Custom CSS markers - no image files needed!
  const getSettlementIcon = (isHighRisk) => {
    return L.divIcon({
      html: `<div style="
        width: 30px;
        height: 30px;
        background-color: ${isHighRisk ? '#ef4444' : '#10b981'};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
        ${isHighRisk ? 'animation: pulse 1.5s infinite;' : ''}
      ">
        ${isHighRisk ? '⚠️' : '✓'}
        <style>
          @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 2px 8px rgba(239, 68, 68, 0.5); }
            50% { transform: scale(1.1); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.7); }
            100% { transform: scale(1); box-shadow: 0 2px 8px rgba(239, 68, 68, 0.5); }
          }
        </style>
      </div>`,
      className: 'custom-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    });
  };

  // For special high-risk markers with more emphasis
  const getHighRiskIcon = () => {
    return L.divIcon({
      html: `<div style="
        width: 36px;
        height: 36px;
        background: radial-gradient(circle, #ef4444 0%, #b91c1c 100%);
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 16px;
        position: relative;
        animation: alarm 1s infinite alternate;
      ">
        ⚠️
        <div style="
          position: absolute;
          top: -6px;
          right: -6px;
          width: 12px;
          height: 12px;
          background-color: #fbbf24;
          border-radius: 50%;
          border: 2px solid white;
        "></div>
        <style>
          @keyframes alarm {
            0% { transform: scale(1); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.6); }
            100% { transform: scale(1.1); box-shadow: 0 6px 16px rgba(239, 68, 68, 0.8); }
          }
        </style>
      </div>`,
      className: 'high-risk-marker',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18]
    });
  };

  // Default marker for reference points
  const getDefaultIcon = () => {
    return L.divIcon({
      html: `<div style="
        width: 25px;
        height: 41px;
        background: linear-gradient(145deg, #3b82f6, #1d4ed8);
        clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: 6px;
          left: 6px;
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
        <div style="
          position: absolute;
          bottom: -8px;
          left: 8px;
          width: 10px;
          height: 5px;
          background: rgba(0,0,0,0.2);
          border-radius: 50%;
          filter: blur(2px);
        "></div>
      </div>`,
      className: 'default-marker',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [0, -41]
    });
  };

  // Custom control icons
  const getControlIcon = (color, symbol) => {
    return L.divIcon({
      html: `<div style="
        width: 20px;
        height: 20px;
        background-color: ${color};
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 10px;
      ">
        ${symbol}
      </div>`,
      className: 'control-marker',
      iconSize: [20, 20]
    });
  };

  return (
    <MapContainer
      center={[-13.9, 33.7]}
      zoom={7}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
      className="leaflet-container"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <ScaleControl position="bottomleft" />
      
      <LayersControl position="topright">
        <LayersControl.Overlay checked name="Flood Zones">
          <GeoJSON
            data={{
              type: "FeatureCollection",
              features: floodZones
                .filter(zone => riskFilter === 'ALL' || zone.risk_level === riskFilter)
                .map(zone => {
                  try {
                    return {
                      type: "Feature",
                      geometry: typeof zone.geometry === 'string' ? JSON.parse(zone.geometry) : zone.geometry,
                      properties: {
                        name: zone.zone_name,
                        risk: zone.risk_level,
                        description: zone.description || `Flood risk zone`
                      }
                    };
                  } catch (e) {
                    console.error('Error parsing zone geometry:', zone);
                    return null;
                  }
                }).filter(Boolean)
            }}
            style={(feature) => ({
              fillColor: getRiskColor(feature?.properties.risk),
              weight: 2,
              opacity: 0.8,
              color: getRiskColor(feature?.properties.risk),
              fillOpacity: feature?.properties.risk === 'HIGH' ? 0.3 : 0.2,
              dashArray: feature?.properties.risk === 'HIGH' ? '5, 5' : null
            })}
            onEachFeature={(feature, layer) => {
              if (feature.properties) {
                layer.bindPopup(`
                  <div class="p-3 min-w-[200px]">
                    <h3 class="font-bold text-lg mb-2">${feature.properties.name}</h3>
                    <div class="mb-3">
                      <span class="inline-block px-3 py-1 rounded-full text-sm font-bold 
                                   ${feature.properties.risk === 'HIGH' ? 'bg-red-100 text-red-800' : 
                                     feature.properties.risk === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 
                                     'bg-green-100 text-green-800'}">
                        ${feature.properties.risk} RISK
                      </span>
                    </div>
                    <p class="text-sm text-gray-600">${feature.properties.description}</p>
                  </div>
                `);
              }
            }}
          />
        </LayersControl.Overlay>

        <LayersControl.Overlay checked name="Settlements">
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
                  key={index}
                  position={[coordinates[1], coordinates[0]]}
                  icon={isHighRisk ? getHighRiskIcon() : getSettlementIcon(false)}
                >
                  <Popup>
                    <div className="p-3 min-w-[250px]">
                      <h3 className="font-bold text-lg mb-2">{settlement.name}</h3>
                      <div className="space-y-1 mb-3">
                        <p className="text-sm">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium ml-2">{settlement.type || 'Settlement'}</span>
                        </p>
                        <p className="text-sm">
                          <span className="text-gray-600">Population:</span>
                          <span className="font-medium ml-2">{settlement.population || 'N/A'}</span>
                        </p>
                        <p className="text-sm">
                          <span className="text-gray-600">Elevation:</span>
                          <span className="font-medium ml-2">{settlement.elevation || 'N/A'}m</span>
                        </p>
                      </div>
                      <div className={`mt-3 p-2 rounded border ${isHighRisk ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                        <p className={`text-sm font-semibold ${isHighRisk ? 'text-red-700' : 'text-green-700'}`}>
                          {isHighRisk ? '⚠️ IN HIGH RISK FLOOD ZONE' : '✅ SAFE FROM FLOODING'}
                        </p>
                        {isHighRisk && (
                          <p className="text-xs text-red-600 mt-1">Immediate attention recommended</p>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            } catch (error) {
              console.error('Error rendering settlement:', settlement, error);
              return null;
            }
          }).filter(Boolean)}
        </LayersControl.Overlay>
      </LayersControl>
    </MapContainer>
  );
}