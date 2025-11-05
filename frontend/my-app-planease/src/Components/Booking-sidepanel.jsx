import React, {useEffect} from 'react';
import { Link, useParams } from 'react-router-dom';
import './styles/booking-sidepanel.css';
import {getEventDetails} from "../Pages/booking-pages/utils/booking-storage.js"

const BookingSidePanel = ({ activeStep }) => {
  const currentEventName = sessionStorage.getItem("currentEventName") || "Event"

  const eventDate = getEventDetails.eventDate;

  useEffect(() => {
    // console.log("event date: ", getEventDetails.eventDate); // COMMENTED OUT - Development debug info
    // console.log("current event name: ", currentEventName); // COMMENTED OUT - Development debug info may reveal session data
  }, []);


  // Define the booking steps
  const bookingSteps = [
    { id: 'enter-details', label: 'Enter Details', path: `/book/${currentEventName}/inputdetails` },
    { id: 'services', label: 'Services', path: `/book/${currentEventName}/services` },
    { id: 'preview', label: 'Preview', path: `/book/${currentEventName}/preview` }
  ];

  // Define payment steps
  const paymentSteps = [
    { id: 'upload-payment', label: 'Upload Payment Proof', path: `/book/${currentEventName}/payment` }
  ];

  return (
    <div className="side-panel">
      <div className="manage-booking-section">
        <h3>Manage Booking</h3>
        <ul>
        {bookingSteps
          .filter(step => !(currentEventName.toLowerCase().includes('package') && step.id === 'services'))
          .map(step => (
            <li
              key={step.id}
              className={activeStep === step.id ? 'active' : ''}
            >
              <Link
                to={step.path}
                onClick={(e) => {
                  e.preventDefault();
                }}
                  // keep visual feedback
              >
                {step.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="payment-method-section">
        <h3>Payment Method</h3>
        <ul>
          {paymentSteps.map(step => (
            <li
              key={step.id}
              className={activeStep === step.id ? 'active' : ''}
            >
              <Link
                to={step.path}
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                {step.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BookingSidePanel;
