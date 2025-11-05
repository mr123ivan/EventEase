import React, { useState, useEffect, useContext } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Navbar from '../../Components/Navbar';
import NavPanel from "../../Components/subcon-navpanel";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, TextField, IconButton, Drawer } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { AuthContext } from '../../Components/AuthProvider';
import axios from 'axios';
import '../../index.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const localizer = momentLocalizer(moment);

const SubcontractorCalendar = () => {
  const { token } = useContext(AuthContext);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [savedStatus, setSavedStatus] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reason, setReason] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    date: null
  });
  const [removeDialog, setRemoveDialog] = useState({
    open: false,
    date: null,
    id: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load unavailable dates from backend on component mount
  useEffect(() => {
    const fetchUnavailableDates = async () => {
      try {
        setLoading(true);
        
        // Get the token from localStorage (similar to subcontractor-bookings.jsx)
        const token = localStorage.getItem('token');
        
        // First get the current user's email
        const userResponse = await axios.get(`${API_BASE_URL}/user/getcurrentuser`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const email = userResponse.data.email; // The API returns email as "schoolId"
        
        if (!email) {
          setError('User email not found');
          setLoading(false);
          return;
        }
        
        // Then fetch the unavailable dates using the email
        const response = await axios.get(`${API_BASE_URL}/api/subcontractor/unavailable-dates`, {
          params: { email: email },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        // console.log(response.data); // COMMENTED OUT - Exposes calendar/schedule API response data

        // Transform dates from the backend into the format needed by the calendar
        const formattedDates = response.data.map(item => ({
          start: new Date(item.date),
          end: new Date(item.date),
          title: item.reason || 'Unavailable',
          allDay: true,
          id: item.unavailableDate_id,
          reason: item.reason
        }));

        setUnavailableDates(formattedDates);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching unavailable dates:', error);
        setError('Failed to load unavailable dates');
        setLoading(false);
      }
    };

    fetchUnavailableDates();
  }, []);  // Removed token dependency since we now get it from localStorage

  // Function to handle date selection
  const handleDateSelect = ({ start }) => {
    // Convert to start of day to ensure consistent date comparison
    const selectedDate = new Date(start);
    selectedDate.setHours(0, 0, 0, 0);
    
    // Check if the date is already in the unavailable dates
    const dateExists = unavailableDates.some(date => {
      const existingDate = new Date(date.start);
      existingDate.setHours(0, 0, 0, 0);
      return existingDate.getTime() === selectedDate.getTime();
    });

    if (dateExists) {
      // Show remove dialog to confirm removal
      const dateToRemove = unavailableDates.find(date => {
        const existingDate = new Date(date.start);
        existingDate.setHours(0, 0, 0, 0);
        return existingDate.getTime() === selectedDate.getTime();
      });
      
      setRemoveDialog({
        open: true,
        date: selectedDate,
        id: dateToRemove.id
      });
    } else {
      // Reset reason field and show confirmation dialog before adding the date
      setReason('');
      setConfirmDialog({
        open: true,
        date: selectedDate
      });
    }
  };
  
  // Function to handle navigation between months/years
  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);
  };
  
  // Function to save unavailability to backend
  const saveUnavailabilityToServer = async (date, reason) => {
    try {
      // Get the token from localStorage (similar to subcontractor-bookings.jsx)
      const token = localStorage.getItem('token');
      
      // First get the current user's email
      const userResponse = await axios.get(`${API_BASE_URL}/user/getcurrentuser`, {
        headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${token}`
        }
      });
      
      const email = userResponse.data.email;

      if (!email) {
        throw new Error('User email not found');
      }

      const formattedDate = moment(date).format('YYYY-MM-DD');
      
      // Save the unavailable date
      const response = await axios.post(`${API_BASE_URL}/api/subcontractor/unavailable-dates`, 
        {
          email: email,
          date: formattedDate,
          reason: reason
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error saving unavailable date:', error);
      throw error;
    }
  };

  // Function to confirm unavailability
  const handleConfirmUnavailability = async () => {
    const selectedDate = confirmDialog.date;

    // console.log(selectedDate); // COMMENTED OUT - Exposes selected date information

    try {
      // First, directly store it in the local state to give immediate feedback
      const tempDate = {
        start: selectedDate,
        end: selectedDate,
        title: reason || 'Unavailable',
        reason: reason,
        allDay: true,
        // We'll add a temporary ID that will be replaced once server responds
        id: `temp-${Date.now()}`
      };
      
      // Add to local state first for immediate feedback
      setUnavailableDates([
        ...unavailableDates,
        tempDate
      ]);
      
      // Try to save to backend
      const savedDate = await saveUnavailabilityToServer(selectedDate, reason);
      
      // Update the temporary date with the proper ID from server
      setUnavailableDates(prev => 
        prev.map(date => 
          date.id === tempDate.id ? {
            ...date,
            id: savedDate.unavailableDate_id
          } : date
        )
      );
      
      setSavedStatus('Date saved successfully');
    } catch (error) {
      console.error('Failed to save date:', error);
      if (error.message && error.message.includes('User email not found')) {
        setSavedStatus('Error: Your account information could not be retrieved. Please log out and log in again.');
      } else {
        setSavedStatus('Error saving date. Please try again.');
      }
    }
    
    // Close the dialog
    setConfirmDialog({
      open: false,
      date: null
    });
  };
  
  // Function to handle reason change
  const handleReasonChange = (event) => {
    setReason(event.target.value);
  };
  
  // Function to confirm removal of unavailable date
  const handleConfirmRemoval = async () => {
    const { id, date } = removeDialog;
    
    if (id) {
      // If the date has an ID, it's in the backend and needs to be deleted
      try {
        const response = await fetch(`${API_BASE_URL}/api/subcontractor/unavailable-dates/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete unavailable date');
        }
        
        // Remove from local state after successful deletion
        setUnavailableDates(unavailableDates.filter(date => date.id !== id));
        setSavedStatus('Date removed successfully');
      } catch (error) {
        console.error('Error deleting date:', error);
        setSavedStatus('Error removing date. Please try again.');
      }
    } else {
      // If the date doesn't have an ID, just remove it from local state
      setUnavailableDates(unavailableDates.filter(item => {
        const existingDate = new Date(item.start);
        existingDate.setHours(0, 0, 0, 0);
        return existingDate.getTime() !== date.getTime();
      }));
    }
    
    // Close the dialog
    setRemoveDialog({
      open: false,
      date: null,
      id: null
    });
  };
  
  // Function to cancel unavailability
  const handleCancelUnavailability = () => {
    setConfirmDialog({
      open: false,
      date: null
    });
    setReason('');
  };
  
  // Function to cancel removal
  const handleCancelRemoval = () => {
    setRemoveDialog({
      open: false,
      date: null,
      id: null
    });
  };

  // Custom event styling to make unavailable dates red
  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: '#FF5252',
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        textAlign: 'center'
      }
    };
  };

  // Function to save unavailable dates to backend
  const saveUnavailableDates = async () => {
    try {
      setSavedStatus('Saving...');
      const email = localStorage.getItem('email');
      
      if (!email) {
        setSavedStatus('Error: User email not found');
        return;
      }
      
      // Filter only new dates (those without an ID)
      const newDates = unavailableDates.filter(date => !date.id);
      
      if (newDates.length === 0) {
        setSavedStatus('No new dates to save.');
        return;
      }
      
      // Send dates one by one
      const savePromises = newDates.map(dateObj => {
        const requestBody = {
          email: email,
          date: moment(dateObj.start).format('YYYY-MM-DD'),
          reason: dateObj.reason || 'Unavailable'
        };
        
        return fetch(`${API_BASE_URL}/api/subcontractor/unavailable-dates`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestBody),
          credentials: 'include'
        }).then(res => {
          if (!res.ok) throw new Error('Failed to save date');
          return res.json();
        });
      });
      
      const savedDates = await Promise.all(savePromises);
      
      // Update local state with saved dates (now with IDs)
      const updatedDates = [
        // Keep existing dates that have IDs
        ...unavailableDates.filter(date => date.id),
        // Add newly saved dates with their IDs
        ...savedDates.map(item => ({
          start: new Date(item.date),
          end: new Date(item.date),
          title: item.reason || 'Unavailable',
          allDay: true,
          id: item.unavailableDate_id,
          reason: item.reason
        }))
      ];
      
      setUnavailableDates(updatedDates);
      setSavedStatus('Unavailable dates saved successfully!');
    } catch (error) {
      console.error('Error saving dates:', error);
      setSavedStatus('Error saving dates. Please try again.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="h-screen grid grid-rows-[auto_1fr]">
        {/* Hamburger menu for mobile */}
        <IconButton
          onClick={() => setIsSidebarOpen(true)}
          sx={{
            display: { xs: 'block', md: 'none' },
            position: 'fixed',
            top: 80,
            left: 16,
            zIndex: 50,
            bgcolor: 'white',
            boxShadow: 2
          }}
        >
          <MenuIcon />
        </IconButton>
        <div className="grid lg:grid-cols-[1fr_3fr]">
          <div className="shadow hidden lg:block p-5">
            <NavPanel />
          </div>
          <div className="flex flex-col rounded-lg gap-4 bg-gray-100 md:px-10 md:py-10">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">Availability Calendar</h1>
              <p className="text-gray-600 mb-4">
                Click on dates when you are <span className="font-semibold text-red-500">not available</span> to work. 
                Click again to remove the selection.
              </p>
              
              {savedStatus && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                  {savedStatus}
                </div>
              )}
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}
              
              {loading ? (
                <div className="mb-6 flex justify-center items-center" style={{ height: 600 }}>
                  <p>Loading calendar...</p>
                </div>
              ) : (
              <div className="mb-6" style={{ height: 600 }}>
                <Calendar
                  localizer={localizer}
                  events={unavailableDates}
                  startAccessor="start"
                  endAccessor="end"
                  selectable
                  onSelectSlot={handleDateSelect}
                  onNavigate={handleNavigate}
                  eventPropGetter={eventStyleGetter}
                  views={[Views.MONTH]}
                  view={Views.MONTH}
                  date={currentDate}
                  style={{ height: '100%' }}
                />
              </div>
              )}
              
              
              {/* Confirmation Dialog for Adding Unavailable Date */}
              <Dialog
                open={confirmDialog.open}
                onClose={handleCancelUnavailability}
                aria-labelledby="add-dialog-title"
                aria-describedby="add-dialog-description"
              >
                <DialogTitle id="add-dialog-title">
                  Confirm Unavailability
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="add-dialog-description" className="mb-4">
                    Are you sure you're not available on this date {confirmDialog.date ? moment(confirmDialog.date).format('MMMM D, YYYY') : ''}?
                  </DialogContentText>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="reason"
                    label="Reason for Unavailability"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={reason}
                    onChange={handleReasonChange}
                    placeholder="E.g., Vacation, Personal Event, etc."
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCancelUnavailability} color="primary">
                    Cancel
                  </Button>
                  <Button onClick={handleConfirmUnavailability} color="primary" autoFocus>
                    Confirm
                  </Button>
                </DialogActions>
              </Dialog>
              
              {/* Confirmation Dialog for Removing Unavailable Date */}
              <Dialog
                open={removeDialog.open}
                onClose={handleCancelRemoval}
                aria-labelledby="remove-dialog-title"
                aria-describedby="remove-dialog-description"
              >
                <DialogTitle id="remove-dialog-title">
                  Remove Unavailable Date
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="remove-dialog-description">
                    Are you sure you want to remove this unavailable date {removeDialog.date ? moment(removeDialog.date).format('MMMM D, YYYY') : ''}?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCancelRemoval} color="primary">
                    Cancel
                  </Button>
                  <Button onClick={handleConfirmRemoval} color="error" autoFocus>
                    Remove
                  </Button>
                </DialogActions>
              </Dialog>
              
              {/* <div className="flex justify-end">
                <button 
                  onClick={saveUnavailableDates}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md transition duration-300"
                >
                  Save Unavailable Dates
                </button>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      <Drawer
        anchor="left"
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      >
        <NavPanel />
      </Drawer>
    </>
  );
};

export default SubcontractorCalendar;