"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import "./styles/inputdetails-page.css"
import Navbar from "../../Components/Navbar"
import BookingSidePanel from "../../Components/Booking-sidepanel"
import Footer from "../../Components/Footer"
import DatePickerWithRestriction from "../../Components/DatePickerWithRestriction"
import { getPersonalInfo, getEventDetails, savePersonalInfo, saveEventDetails, clearBookingData } from "./utils/booking-storage"
import axios from "axios"
import {
  getActiveTab,
  getSelectedServices,
  getSelectedPackage,
  saveServicesData,
  PACKAGES,
} from "../booking-pages/utils/booking-storage"

const InputDetailsPage = () => {
  const navigate = useNavigate()
  const { eventName } = useParams()

  // Get event name from params or sessionStorage as fallback
  const currentEventName = eventName || sessionStorage.getItem("currentEventName") || "Event"

  // Initialize form data from bookingStorage utility - separate personal and event data
  const [personalInfo, setPersonalInfo] = useState(getPersonalInfo)
  const [eventDetails, setEventDetails] = useState(getEventDetails)
  const [isLoadingUserData, setIsLoadingUserData] = useState(true)

  const [activeTab, setActiveTab] = useState(getActiveTab)
  const [selectedServices, setSelectedServices] = useState(saveServicesData)


  // Store current event name in sessionStorage
  useEffect(() => {
    if (currentEventName) {
      sessionStorage.setItem("currentEventName", currentEventName)
    }
  }, [currentEventName])


    const handleRemoveData = () => {
        clearBookingData();
    }

  // Auto-fill user data on component mount
  useEffect(() => {
    const fetchAndAutoFillUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsLoadingUserData(false);
          return;
        }
  
        const response = await axios.get("http://54.255.151.41:8080/user/getuser", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const userData = response.data;
  
        const currentPersonalInfo = getPersonalInfo();
        const shouldAutoFill =
          !currentPersonalInfo.firstName && !currentPersonalInfo.lastName && !currentPersonalInfo.email;
  
        if (shouldAutoFill && userData) {
          const autoFilledPersonalInfo = {
            firstName: userData.firstname || "",
            lastName: userData.lastname || "",
            email: userData.email || "",
            contact: userData.phoneNumber || "",
          };
  
          setPersonalInfo(autoFilledPersonalInfo);
          savePersonalInfo(autoFilledPersonalInfo);
  
          // 🔁 Wait until email is available, then call loadFormProgress
          await loadFormProgress(autoFilledPersonalInfo.email);
        } else {
          await loadFormProgress(currentPersonalInfo.email);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoadingUserData(false);
      }
    };
  
    fetchAndAutoFillUserData();
  }, []);
  

  const loadFormProgress = async (email) => {
    const token = localStorage.getItem("token");
  
    try {
      const response = await axios.get(`http://54.255.151.41:8080/form-draft/load`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          email: email,
          eventName: currentEventName
        }
      });
  
      const { personalInfo, eventDetails, selectedServices } = response.data;
      console.log(response.data)
      if (personalInfo) setPersonalInfo(personalInfo);
      if (eventDetails) setEventDetails(eventDetails);
      if (selectedServices) {
        let parsed = selectedServices;
      
        // If it's a string, parse it
        if (typeof selectedServices === "string") {
          try {
            parsed = JSON.parse(selectedServices);
          } catch (e) {
            console.error("Failed to parse selectedServices:", e);
          }
        }
      setSelectedServices(parsed);
      saveServicesData({ selectedServices: parsed });
      }
      
    } catch (error) {
      console.error("Error fetching form progress:", error);
    }
  };
  
  
  
  const submitFormProgress = () => {
    const token = localStorage.getItem("token")

    const body ={
      email: personalInfo.email,
      eventName: currentEventName,
      jsonData: JSON.stringify({
        personalInfo,
        eventDetails,
        selectedServices
      })
    }

    console.log(body)
    axios.post(`http://54.255.151.41:8080/form-draft/save`, body, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => {
      console.log(response.data)
    })
    .catch((error) => {
      console.error("Error fetching form progress:", error)
    })
  }

  // Handle personal info changes
  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target
    setPersonalInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  // Handle event details changes
  const handleEventDetailsChange = (e) => {
    const { name, value } = e.target
    setEventDetails((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  // Save personal info whenever it changes (but not during initial load)
  useEffect(() => {
    if (!isLoadingUserData) {
      savePersonalInfo(personalInfo)
    }
  }, [personalInfo, isLoadingUserData])

  // Save event details whenever it changes
  useEffect(() => {
    if (!isLoadingUserData) {
      saveEventDetails(eventDetails)
    }
  }, [eventDetails, isLoadingUserData])

  // Validate form data
  const isFormValid = () => {
    const attendeesVal = Number(eventDetails.projectedAttendees)
    const budgetVal = Number(eventDetails.budget)
    const hasValidAttendees =
      eventDetails.projectedAttendees !== undefined &&
      String(eventDetails.projectedAttendees).trim() !== "" &&
      !Number.isNaN(attendeesVal) &&
      attendeesVal > 0
    const hasValidBudget =
      eventDetails.budget !== undefined &&
      String(eventDetails.budget).trim() !== "" &&
      !Number.isNaN(budgetVal) &&
      budgetVal >= 0
    return (
      personalInfo.firstName.trim() &&
      personalInfo.lastName.trim() &&
      personalInfo.email.trim() &&
      personalInfo.contact.trim() &&
      // Event Details
      eventDetails.celebrantName && String(eventDetails.celebrantName).trim() &&
      hasValidAttendees &&
      hasValidBudget &&
      eventDetails.location.trim() &&
      eventDetails.eventDate.trim()
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    submitFormProgress()

    if (!isFormValid()) {
      alert("Please fill in all required fields.")
      return
    }

    // Save form data
    savePersonalInfo(personalInfo)
    saveEventDetails(eventDetails)

    console.log("Personal Info:", personalInfo)
    console.log("Event Details:", eventDetails)
    console.log("Event Name:", eventName.toLowerCase())
    // Navigate to services page with event name
    if (!eventName.toLowerCase().includes("package")) {
      navigate(`/book/${encodeURIComponent(eventName)}/services`)
    } else{
      navigate(`/book/${encodeURIComponent(eventName)}/preview`)
    }
  }

  // Show loading state while fetching user data
  if (isLoadingUserData) {
    return (
      <>
        <Navbar />
        <div className="booking-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your information...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="booking-container">
        {/* Breadcrumb Navigation */}
        <div className="breadcrumb">
          <Link to="/events-dashboard"
          onClick={()=> handleRemoveData()}
          >Home</Link> /
          <Link to={`/event/${encodeURIComponent(currentEventName)}`}>{currentEventName}</Link> / <span>Book Now</span>
        </div>

        <div className="booking-content">
          {/* Side Panel */}
          <BookingSidePanel activeStep="enter-details" />

          {/* Main Content */}
          <div className="main-form-content">
            {/* Step Indicator */}
            <div className="step-indicator">
              <div className="step active">
                <div className="step-number">1</div>
                <div className="step-label">Enter Details</div>
              </div>
              <div className="step-line"></div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-label">Services</div>
              </div>
              <div className="step-line"></div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-label">Preview</div>
              </div>
              <div className="step-line"></div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-label">Payment</div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Personal Details Section */}
              <div className="form-section">
                <h2 className="section-title">
                  Personal Details
                  {personalInfo.firstName && personalInfo.lastName && (
                    <span className="auto-filled-indicator"> (Auto-filled from your profile)</span>
                  )}
                </h2>
                <div className="input-row">
                  <div className="input-group">
                    <label htmlFor="firstName">First Name *</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={personalInfo.firstName}
                      onChange={handlePersonalInfoChange}
                      placeholder="Enter your first name"
                      required
                      className={personalInfo.firstName ? "auto-filled" : ""}
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="lastName">Last Name *</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={personalInfo.lastName}
                      onChange={handlePersonalInfoChange}
                      placeholder="Enter your last name"
                      required
                      className={personalInfo.lastName ? "auto-filled" : ""}
                    />
                  </div>
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={personalInfo.email}
                      onChange={handlePersonalInfoChange}
                      placeholder="Enter your email"
                      required
                      className={personalInfo.email ? "auto-filled" : ""}
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="contact">Contact *</label>
                    <input
                      type="tel"
                      id="contact"
                      name="contact"
                      value={personalInfo.contact}
                      onChange={handlePersonalInfoChange}
                      placeholder="Enter your contact number"
                      required
                      className={personalInfo.contact ? "auto-filled" : ""}
                    />
                  </div>
                </div>
              </div>

              {/* Event Details Section */}
              <div className="form-section">
                <h2 className="section-title">Event Details</h2>
                <div className="input-row">
                  <div className="input-group">
                    <label htmlFor="eventType">Event Type</label>
                    <input
                      type="text"
                      id="eventType"
                      name="eventType"
                      value={currentEventName}
                      readOnly
                      className="readonly-input"
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="location">Location *</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={eventDetails.location}
                      onChange={handleEventDetailsChange}
                      placeholder="Enter event location"
                      required
                    />
                  </div>
                </div>

                {/* Celebrant Names */}
                <div className="input-row">
                  <div className="input-group">
                    <label htmlFor="celebrantName">Name of Celebrant/s *</label>
                    <input
                      type="text"
                      id="celebrantName"
                      name="celebrantName"
                      value={eventDetails.celebrantName || ""}
                      onChange={handleEventDetailsChange}
                      placeholder="Enter celebrant name(s)"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="celebrantNameOptional">Name of Celebrant/s (optional)</label>
                    <input
                      type="text"
                      id="celebrantNameOptional"
                      name="celebrantNameOptional"
                      value={eventDetails.celebrantNameOptional || ""}
                      onChange={handleEventDetailsChange}
                      placeholder="Enter additional celebrant name(s) (optional)"
                    />
                  </div>
                </div>

                {/* Numbers: Attendees and Budget */}
                <div className="input-row">
                  <div className="input-group">
                    <label htmlFor="projectedAttendees">Projected Number of Attendees *</label>
                    <input
                      type="number"
                      id="projectedAttendees"
                      name="projectedAttendees"
                      value={eventDetails.projectedAttendees || ""}
                      onChange={handleEventDetailsChange}
                      placeholder="e.g., 150"
                      min="1"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="budget">Budget for the Event (₱) *</label>
                    <input
                      type="number"
                      id="budget"
                      name="budget"
                      value={eventDetails.budget || ""}
                      onChange={handleEventDetailsChange}
                      placeholder="e.g., 50000"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label htmlFor="eventDate">Event Date *</label>
                    <DatePickerWithRestriction
                      id="eventDate"
                      name="eventDate"
                      value={eventDetails.eventDate}
                      onChange={handleEventDetailsChange}
                    />
                  </div>
                  <div className="input-group">{/* Empty div to maintain grid layout */}</div>
                </div>

                <div className="input-row">
                  <div className="input-group full-width">
                    <label htmlFor="note">Additional Notes</label>
                    <textarea
                      id="note"
                      name="note"
                      value={eventDetails.note}
                      onChange={handleEventDetailsChange}
                      placeholder="Add any special requests or notes for your event (optional)"
                      rows="4"
                    />
                  </div>
                </div>
              </div>

              {/* Form Validation Notice */}
              {!isFormValid() && (
                <div className="validation-notice">
                  <p>* Please fill in all required fields to continue</p>
                </div>
              )}

              {/* Next Button */}
              <div className="form-actions">
                <button
                  type="submit"
                  className={`next-button ${!isFormValid() ? "disabled" : ""}`}
                  disabled={!isFormValid()}
                >
                  Next
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default InputDetailsPage