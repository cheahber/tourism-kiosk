import { useEffect, useState } from 'react';
import L from 'leaflet';

const PENANG_CENTER = [5.4141, 100.3288];
const INITIAL_ZOOM = 13;

const Map = () => {
  const [selectedAttraction, setSelectedAttraction] = useState(null);

  useEffect(() => {
    // Create map instance
    const map = L.map('map', {
      center: PENANG_CENTER,
      zoom: INITIAL_ZOOM,
      zoomControl: false,
      attributionControl: true,
      minZoom: 11,
      maxZoom: 18
    });

    // Add zoom control to top right
    L.control.zoom({
      position: 'topright'
    }).addTo(map);

    // More reliable OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
      minZoom: 11
    }).addTo(map);

    // Define Penang bounds
    const penangBounds = L.latLngBounds(
      [5.2847, 100.1892], // Southwest
      [5.4847, 100.3892]  // Northeast
    );

    // Set map bounds
    map.setMaxBounds(penangBounds);

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div id="map" className="h-full w-full" />
  );
};

export default Map;