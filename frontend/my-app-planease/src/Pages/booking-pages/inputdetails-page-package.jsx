"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import "./styles/inputdetails-page.css"
import Navbar from "../../Components/Navbar"
import BookingSidePanel from "../../Components/Booking-sidepanel"
import Footer from "../../Components/Footer"
import DatePickerWithRestriction from "../../Components/DatePickerWithRestriction"
import {
  getPersonalInfo,
  getEventDetails,
  savePersonalInfo,
  saveEventDetails,
  clearBookingData,
  saveServicesData,
  getServicesData,
} from "./utils/booking-storage"
import axios from "axios"

const InputDetailsPagePackage = () => {
  const navigate = useNavigate()
  const { packageName } = useParams()

  // Get package name from params or sessionStorage as fallback
  const currentPackageName = packageName || sessionStorage.getItem("currentPackageName") || "Package"

  // Initialize form data from bookingStorage utility - separate personal and event data
  const [personalInfo, setPersonalInfo] = useState(getPersonalInfo)
  const [eventDetails, setEventDetails] = useState(getEventDetails)
  const [isLoadingUserData, setIsLoadingUserData] = useState(true)
  const [packageData, setPackageData] = useState(null)

  // Store current package name in sessionStorage
  useEffect(() => {
    if (currentPackageName) {
      sessionStorage.setItem("currentPackageName", currentPackageName)
      sessionStorage.setItem("currentEventName", currentPackageName)
    }
  }, [currentPackageName])

  // Fetch package data from API and set up package selection
  useEffect(() => {
    const fetchPackageData = async () => {
      try {
        // Check if we already have live package data
        const existingServicesData = getServicesData()

        if (existingServicesData.livePackageData) {
          console.log("Using existing live package data:", existingServicesData.livePackageData)
          setPackageData(existingServicesData.livePackageData)
          return
        }

        // Fetch package data from API
        const response = await axios.get("http://localhost:8080/api/packages")
        const packages = response.data

        // Find the matching package by name
        const matchingPackage = packages.find(
          (pkg) =>
            pkg.packageName.toLowerCase().includes(currentPackageName.toLowerCase()) ||
            currentPackageName.toLowerCase().includes(pkg.packageName.toLowerCase()),
        )

        if (matchingPackage) {
          // Store the complete package data - ensure packageId is a number
          const packageId = Number.parseInt(matchingPackage.packageId, 10)

          const livePackageData = {
            packageId: isNaN(packageId) ? null : packageId, // Ensure it's a valid number
            packageName: matchingPackage.packageName,
            packagePrice: matchingPackage.packagePrice,
            packageDescription: matchingPackage.packageDescription,
            services: matchingPackage.services || [],
          }

          console.log("Package ID type:", typeof livePackageData.packageId)
          console.log("Package ID value:", livePackageData.packageId)

          setPackageData(livePackageData)
          

          // Save to booking storage
          saveServicesData({
            activeTab: "package",
            selectedServices: {},
            selectedPackage: `package-${livePackageData.packageId}`,
            availableServices: [],
            livePackageData: livePackageData,
          })

          console.log("Fetched and saved package data:", livePackageData)
        } else {
          // Fallback to static package mapping
          let packageId = null
          if (currentPackageName.toLowerCase().includes("tulip")) {
            packageId = "tulip"
          } else if (currentPackageName.toLowerCase().includes("cherry")) {
            packageId = "cherry-blossom"
          } else if (currentPackageName.toLowerCase().includes("rose")) {
            packageId = "rose"
          }

          if (packageId) {
            saveServicesData({
              activeTab: "package",
              selectedServices: {},
              selectedPackage: packageId,
              availableServices: [],
            })
          }
        }
      } catch (error) {
        console.error("Error fetching package data:", error)

        // Fallback to static package mapping
        let packageId = null
        if (currentPackageName.toLowerCase().includes("tulip")) {
          packageId = "tulip"
        } else if (currentPackageName.toLowerCase().includes("cherry")) {
          packageId = "cherry-blossom"
        } else if (currentPackageName.toLowerCase().includes("rose")) {
          packageId = "rose"
        }

        if (packageId) {
          saveServicesData({
            activeTab: "package",
            selectedServices: {},
            selectedPackage: packageId,
            availableServices: [],
          })
        }
      }
    }

    fetchPackageData()
  }, [currentPackageName])

  const handleRemoveData = () => {
    clearBookingData()
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
  
        const response = await axios.get("http://localhost:8080/user/getuser", {
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

    fetchAndAutoFillUserData()
  }, [])

  const loadFormProgress = async (email) => {
    const token = localStorage.getItem("token");
  
    try {
      const response = await axios.get(`http://localhost:8080/form-draft/load`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          email: email,
          eventName: currentPackageName
        }
      });
  
      const { personalInfo, eventDetails } = response.data;
      console.log(response.data)
      if (personalInfo) setPersonalInfo(personalInfo);
      if (eventDetails) setEventDetails(eventDetails);
      
    } catch (error) {
      console.error("Error fetching form progress:", error);
    }
  };

  const submitFormProgress = () => {
    const token = localStorage.getItem("token")

    const body ={
      email: personalInfo.email,
      eventName: currentPackageName,
      jsonData: JSON.stringify({
        personalInfo,
        eventDetails,
      })
    }

    console.log(body)
    axios.post(`http://localhost:8080/form-draft/save`, body, {
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
    return (
      personalInfo.firstName.trim() &&
      personalInfo.lastName.trim() &&
      personalInfo.email.trim() &&
      personalInfo.contact.trim() &&
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

    // Verify package data is available
    const servicesData = getServicesData()
    if (!servicesData.livePackageData && !servicesData.selectedPackage) {
      alert("Package information is missing. Please try again.")
      return
    }

    // Save form data
    savePersonalInfo(personalInfo)
    saveEventDetails(eventDetails)

    console.log("Personal Info:", personalInfo)
    console.log("Event Details:", eventDetails)
    console.log("Package Data:", servicesData)

    // Ensure we have a valid package name for navigation
    const validPackageName = packageName || currentPackageName || sessionStorage.getItem("currentPackageName")

    if (!validPackageName) {
      alert("Package information is missing. Please try again.")
      return
    }

    // Store the package name to ensure it persists
    sessionStorage.setItem("currentPackageName", validPackageName)

    // Navigate directly to preview page for packages (skip services)
    navigate(`/book/${encodeURIComponent(validPackageName)}/package/preview`)
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
          <Link to="/events-dashboard" onClick={() => handleRemoveData()}>
            Home
          </Link>{" "}
          /<Link to={`/package/${encodeURIComponent(currentPackageName)}`}>{currentPackageName}</Link> /{" "}
          <span>Book Now</span>
        </div>

        <div className="booking-content">
          {/* Side Panel */}
          <BookingSidePanel activeStep="enter-details" />

          {/* Main Content */}
          <div className="main-form-content">
            {/* Step Indicator - Modified for package flow (3 steps instead of 4) */}
            <div className="step-indicator">
              <div className="step active">
                <div className="step-number">1</div>
                <div className="step-label">Enter Details</div>
              </div>
              <div className="step-line"></div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-label">Preview</div>
              </div>
              <div className="step-line"></div>
              <div className="step">
                <div className="step-number">3</div>
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
                      value="Wedding"
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


                  <div className="input-group">
                    <label htmlFor="location">Location *</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={eventDetails.location}
                      onChange={handleEventDetailsChange}
                      placeholder="Enter event locations"
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

export default InputDetailsPagePackage
