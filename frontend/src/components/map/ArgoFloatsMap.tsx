import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';

// Type definitions
interface ArgoFloat {
  platform_number: string;
  latitude: number | null;
  longitude: number | null;
  last_profile_date: string | null;
  platform_type: string | null;
  project_name: string | null;
  data_centre: string | null;
}

interface ArgoPositionsResponse {
  argo_floats: ArgoFloat[];
}

// Fix for default markers in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const ArgoFloatsMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [argoFloats, setArgoFloats] = useState<ArgoFloat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  // Fetch ARGO positions from API
  const fetchArgoPositions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/argo-positions');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ARGO data: ${response.status}`);
      }
      
      const data: ArgoPositionsResponse = await response.json();
      setArgoFloats(data.argo_floats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error loading ARGO data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([20, 0], 2);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    // Create layer group for markers
    markersRef.current = L.layerGroup().addTo(map);

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when ARGO data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersRef.current) return;

    // Clear existing markers
    markersRef.current.clearLayers();

    // Add new markers for each ARGO float with valid coordinates
    argoFloats.forEach((float) => {
      if (float.latitude && float.longitude) {
        const marker = L.circleMarker([float.latitude, float.longitude], {
          color: '#0066cc',
          fillColor: '#0066cc',
          fillOpacity: 0.7,
          radius: 6,
          weight: 2,
        });

        // Create popup content
        const popupContent = `
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 10px 0; color: #0066cc;">ARGO Float ${float.platform_number}</h3>
            <p><strong>Platform Type:</strong> ${float.platform_type || 'N/A'}</p>
            <p><strong>Project:</strong> ${float.project_name || 'N/A'}</p>
            <p><strong>Data Centre:</strong> ${float.data_centre || 'N/A'}</p>
            <p><strong>Last Profile:</strong> ${float.last_profile_date ? new Date(float.last_profile_date).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Position:</strong> ${float.latitude.toFixed(2)}°, ${float.longitude.toFixed(2)}°</p>
          </div>
        `;

        marker.bindPopup(popupContent);
        markersRef.current?.addLayer(marker);
      }
    });

    // Fit map to show all markers if there are any valid positions
    const validFloats = argoFloats.filter(f => f.latitude && f.longitude);
    if (validFloats.length > 0) {
      const group = new L.FeatureGroup(
        validFloats.map(f => L.circleMarker([f.latitude!, f.longitude!]))
      );
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }

  }, [argoFloats]);

  // Load data on component mount
  useEffect(() => {
    fetchArgoPositions();
  }, []);

  // Refresh data handler
  const handleRefresh = () => {
    fetchArgoPositions();
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f5f5f5', 
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, color: '#0066cc' }}>ARGO Floats Global Positions</h1>
        <div>
          <button 
            onClick={handleRefresh}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Loading...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '10px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          border: '1px solid #ffcdd2',
          margin: '10px',
          borderRadius: '4px'
        }}>
          Error: {error}
          <button 
            onClick={handleRefresh}
            style={{ marginLeft: '10px', padding: '4px 8px' }}
          >
            Retry
          </button>
        </div>
      )}

      <div 
        ref={mapRef} 
        style={{ 
          height: 'calc(100vh - 120px)', 
          width: '100%',
          position: 'relative'
        }}
      >
        {loading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              color: '#0066cc'
            }}>
              <div className="spinner"></div>
              <span>Loading ARGO float positions...</span>
            </div>
          </div>
        )}
      </div>

      <div style={{ 
        padding: '10px 20px', 
        backgroundColor: '#f5f5f5',
        borderTop: '1px solid #ddd',
        fontSize: '14px',
        color: '#666'
      }}>
        <strong>Total Floats:</strong> {argoFloats.length} | 
        <strong> Valid Positions:</strong> {argoFloats.filter(f => f.latitude && f.longitude).length} |
        <strong> Last Updated:</strong> {new Date().toLocaleString()}
      </div>

    </div>
  );
};

export default ArgoFloatsMap;