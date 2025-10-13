import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Box, Modal, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapViewModal = ({ open, onClose, location }) => {
  const [mapCenter, setMapCenter] = useState([10.3157, 123.8854]); // Default to Cebu [lat, lng]
  const [zoom, setZoom] = useState(12);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [map, setMap] = useState(null);

  // Geocode the location when it changes
  useEffect(() => {
    if (location && location.trim()) {
      geocodeLocation(location);
    }
  }, [location]);

  // Auto-zoom to the location when marker position changes
  useEffect(() => {
    if (map && markerPosition) {
      map.flyTo(markerPosition, 16, {
        duration: 2,
        easeLinearity: 0.25,
      });
    }
  }, [map, markerPosition]);

  const geocodeLocation = async (locationString) => {
    try {
      // Use Nominatim API for geocoding (free OpenStreetMap service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationString)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        setMapCenter([lat, lng]);
        setMarkerPosition([lat, lng]);
        setZoom(15);

        // Set a clean location name
        setLocationName(result.display_name.split(', ').slice(0, 3).join(', '));
      } else {
        // If geocoding fails, show the original location string
        setLocationName(locationString);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setLocationName(locationString);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95%', sm: '90%', md: '800px' },
          height: { xs: '80%', sm: '70%', md: '500px' },
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 3,
          outline: 'none',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            bgcolor: 'black',
            color: 'white',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOnIcon />
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
              Event Location
            </Typography>
          </Box>
          <IconButton onClick={handleClose} sx={{ color: 'inherit' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Location Info */}
        {locationName && (
          <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {locationName}
            </Typography>
          </Box>
        )}

        {/* Map Container */}
        <Box sx={{ height: 'calc(100% - 120px)', width: '100%' }}>
          <MapContainer
            center={mapCenter}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            whenReady={(mapInstance) => {
              setMap(mapInstance.target);
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markerPosition && (
              <Marker position={markerPosition}>
                <Popup>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {locationName || location}
                  </Typography>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </Box>
      </Box>
    </Modal>
  );
};

export default MapViewModal;
