import { useEffect, useRef, useState } from 'react';
import { GOOGLE_MAPS_API_KEY } from '../../utils/constants';

const Map = ({ 
  pharmacies = [], 
  userLocation = null, 
  center = null, 
  zoom = 12, 
  onMarkerClick = null 
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load Google Maps Script
  useEffect(() => {
    if (window.google && window.google.maps) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!scriptLoaded || !mapRef.current) return;

    let defaultCenter = { lat: 19.0760, lng: 72.8777 }; // Mumbai default

    if (center) {
      defaultCenter = center;
    } else if (userLocation) {
      defaultCenter = { lat: userLocation.latitude, lng: userLocation.longitude };
    } else if (pharmacies.length > 0) {
      defaultCenter = { 
        lat: pharmacies[0].location.coordinates[1], 
        lng: pharmacies[0].location.coordinates[0] 
      };
    }

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: zoom,
      styles: [
        // Custom subtle dark map styling for better UI integration
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
          featureType: "administrative.locality",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi.park",
          elementType: "geometry",
          stylers: [{ color: "#263c3f" }],
        },
        {
          featureType: "poi.park",
          elementType: "labels.text.fill",
          stylers: [{ color: "#6b9a76" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#38414e" }],
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#212a37" }],
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9ca5b3" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry",
          stylers: [{ color: "#746855" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry.stroke",
          stylers: [{ color: "#1f2835" }],
        },
        {
          featureType: "road.highway",
          elementType: "labels.text.fill",
          stylers: [{ color: "#f3d19c" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#17263c" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.fill",
          stylers: [{ color: "#515c6d" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.stroke",
          stylers: [{ color: "#17263c" }],
        },
      ],
      disableDefaultUI: false,
      mapTypeControl: false,
    });

    setMap(mapInstance);
  }, [scriptLoaded, center, userLocation, zoom]);

  // Update Markers
  useEffect(() => {
    if (!map || !window.google) return;

    // Clear old markers
    markers.forEach(marker => marker.setMap(null));
    
    const newMarkers = [];
    const bounds = new window.google.maps.LatLngBounds();

    // Add user location marker
    if (userLocation) {
      const userPos = { lat: userLocation.latitude, lng: userLocation.longitude };
      const userMarker = new window.google.maps.Marker({
        position: userPos,
        map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        title: 'Your Location',
      });
      newMarkers.push(userMarker);
      bounds.extend(userPos);
    }

    // Add pharmacy markers
    pharmacies.forEach((pharmacy) => {
      if (pharmacy.location && pharmacy.location.coordinates) {
        const pos = { 
          lat: pharmacy.location.coordinates[1], 
          lng: pharmacy.location.coordinates[0] 
        };
        
        const marker = new window.google.maps.Marker({
          position: pos,
          map,
          title: pharmacy.name,
          icon: {
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
            fillColor: '#10b981',
            fillOpacity: 1,
            strokeWeight: 0,
            scale: 1.5,
            anchor: new window.google.maps.Point(12, 24),
          }
        });

        if (onMarkerClick) {
          marker.addListener('click', () => onMarkerClick(pharmacy));
        }

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="font-weight: bold; margin-bottom: 4px; color: #1f2937;">${pharmacy.name}</h3>
              <p style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">${pharmacy.address?.street || ''}</p>
              <a href="/pharmacies/${pharmacy._id}" style="color: #10b981; font-size: 12px; font-weight: 500; text-decoration: none;">View Details →</a>
            </div>
          `
        });

        marker.addListener('mouseover', () => infoWindow.open(map, marker));
        marker.addListener('mouseout', () => infoWindow.close());

        newMarkers.push(marker);
        bounds.extend(pos);
      }
    });

    setMarkers(newMarkers);

    // Fit bounds if there are multiple markers and no specific center is provided
    if (newMarkers.length > 1 && !center && !userLocation) {
      map.fitBounds(bounds);
    }
  }, [map, pharmacies, userLocation]);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-glass relative">
      {!scriptLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-100 dark:bg-surface-800">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full min-h-[300px]"></div>
    </div>
  );
};

export default Map;
