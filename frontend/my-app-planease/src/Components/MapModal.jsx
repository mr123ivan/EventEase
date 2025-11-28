import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { Box, Modal, Button, Typography, TextField, List, ListItem, ListItemButton, ListItemText, Paper, InputAdornment, Grid, Card, CardContent, Divider, Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import IconButton from '@mui/material/IconButton';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks
function LocationMarker({ onLocationSelect, selectedLocation }) {
  const [position, setPosition] = useState(selectedLocation);

  useMapEvents({
    click(e) {
      const newPos = e.latlng;
      setPosition(newPos);

      // Reverse geocode to get detailed location info
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPos.lat}&lon=${newPos.lng}&zoom=18&addressdetails=1`)
        .then(response => response.json())
        .then(data => {
          let locationString = `${newPos.lat.toFixed(6)}, ${newPos.lng.toFixed(6)}`;

          if (data && data.display_name) {
            // Extract meaningful location details
            const address = data.address || {};
            const parts = [];

            // Add place name if available (like school, hospital, etc.)
            if (address.amenity || address.building || address.place) {
              parts.push(address.amenity || address.building || address.place);
            }

            // Add street address
            if (address.road) {
              parts.push(address.road);
            }

            // Add suburb/city details
            if (address.suburb || address.city_district) {
              parts.push(address.suburb || address.city_district);
            }

            // Add city
            if (address.city) {
              parts.push(address.city);
            }

            // Add state/province
            if (address.state) {
              parts.push(address.state);
            }

            // Add country
            if (address.country) {
              parts.push(address.country);
            }

            if (parts.length > 0) {
              locationString = parts.join(', ');
            } else {
              // Fallback to display_name but shorten it
              locationString = data.display_name.split(', ').slice(0, 4).join(', ');
            }
          }

          onLocationSelect({
            lat: newPos.lat,
            lng: newPos.lng,
            address: locationString
          });
        })
        .catch(error => {
          console.error('Reverse geocoding error:', error);
          onLocationSelect({
            lat: newPos.lat,
            lng: newPos.lng,
            address: `${newPos.lat.toFixed(6)}, ${newPos.lng.toFixed(6)}`
          });
        });
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Selected Location: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}</Popup>
    </Marker>
  );
}

const MapModal = ({ open, onClose, onLocationSelect, initialLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([10.3157, 123.8854]); // Default to Cebu [lat, lng]
  const [zoom, setZoom] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Geocode the initial location to set map center
  useEffect(() => {
    if (initialLocation && initialLocation.trim()) {
      geocodeLocation(initialLocation);
    }
  }, [initialLocation]);

  const geocodeLocation = async (location) => {
    try {
      // Use Nominatim API for geocoding (free OpenStreetMap service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        setMapCenter([parseFloat(result.lat), parseFloat(result.lon)]);
        setZoom(15);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedLocation(null);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    onClose();
  };

  // Search functionality
  const handleSearchChange = async (event) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (query.length > 2) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
        );
        const data = await response.json();
        setSearchResults(data);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleSearchResultSelect = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    // Center map on selected location
    setMapCenter([lat, lng]);
    setZoom(16);

    // Set selected location
    const locationData = {
      lat,
      lng,
      address: result.display_name.split(', ').slice(0, 4).join(', ')
    };

    setSelectedLocation(locationData);
    setSearchQuery(result.display_name.split(', ')[0]); // Show main place name in search
    setShowResults(false);
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95%', sm: '90%', md: '1200px', lg: '1400px' },
          height: { xs: '90%', sm: '80%', md: '600px' },
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
            p: 3,
            bgcolor: 'black',
            color: 'white',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOnIcon />
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
              Select Event Location
            </Typography>
          </Box>
          <IconButton onClick={handleClose} sx={{ color: 'inherit' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Main Content - Responsive Layout */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          height: 'calc(100% - 80px)',
          overflow: 'hidden'
        }}>
          {/* Map Section - Shows first on mobile */}
          <Box sx={{
            width: { xs: '100%', md: '65%' },
            height: { xs: '300px', md: '100%' },
            order: { xs: 1, md: 2 },
            position: 'relative',
            flexShrink: 0
          }}>
            <Box
              sx={{
                height: '100%',
                width: '100%',
                borderRadius: 0,
                overflow: 'hidden',
                '& .leaflet-container': {
                  borderRadius: 0,
                  height: '100%',
                  width: '100%'
                },
              }}
            >
              <MapContainer
                center={mapCenter}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                key={`${mapCenter[0]}-${mapCenter[1]}-${zoom}`}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker
                  onLocationSelect={handleLocationSelect}
                  selectedLocation={selectedLocation}
                />
              </MapContainer>
            </Box>
          </Box>

          {/* Search and Details Section - Shows second on mobile */}
          <Box
            sx={{
              width: { xs: '100%', md: '35%' },
              height: { xs: 'auto', md: '100%' },
              maxHeight: { xs: 'calc(100% - 300px)', md: '100%' },
              order: { xs: 2, md: 1 },
              p: { xs: 2, md: 3 },
              borderRight: { xs: 'none', md: '1px solid #e0e0e0' },
              borderTop: { xs: '1px solid #e0e0e0', md: 'none' },
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              overflow: 'auto'
            }}
          >
            {/* Search Section */}
            <Box sx={{ position: 'relative', mb: 2 }}>
              <TextField
                fullWidth
                placeholder="Search for schools, hospitals, malls..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                size="small"
              />

              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <Paper
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    maxHeight: '200px',
                    overflow: 'auto',
                    boxShadow: 3,
                    mt: 0.5,
                  }}
                >
                  <List dense>
                    {searchResults.map((result, index) => (
                      <ListItem key={index} disablePadding>
                        <ListItemButton onClick={() => handleSearchResultSelect(result)} sx={{ py: 1.5 }}>
                          <ListItemText
                            primary={
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {result.display_name.split(', ')[0]}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary">
                                {result.display_name.split(', ').slice(1, 4).join(', ')}
                              </Typography>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Type at least 3 characters to search
            </Typography>

            {/* Selected Location Display */}
            {selectedLocation && (
              <Card sx={{ boxShadow: 2, bgcolor: 'goldenrod', color: 'black' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon fontSize="small" />
                    Selected Location
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                    {selectedLocation.address}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                    Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Spacer to push footer down on desktop */}
            <Box sx={{ flexGrow: { xs: 0, md: 1 } }} />

            {/* Footer Actions */}
            <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
              <Button
                onClick={handleClose}
                variant="outlined"
                fullWidth
                sx={{ py: 1.5, bgcolor: 'goldenrod', color: 'black', '&:hover': { bgcolor: '#daa520' } }}
              >
                CANCEL
              </Button>
              <Button
                onClick={handleConfirmLocation}
                variant="contained"
                fullWidth
                disabled={!selectedLocation}
                sx={{ py: 1.5, bgcolor: 'goldenrod', color: 'black', '&:hover': { bgcolor: '#daa520' } }}
              >
                CONFIRM LOCATION
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default MapModal;
