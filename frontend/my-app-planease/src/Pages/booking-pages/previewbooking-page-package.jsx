"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import "./styles/previewbooking-page.css"
import Navbar from "../../Components/Navbar"
import Footer from "../../Components/Footer"
import BookingSidePanel from "../../Components/Booking-sidepanel"
import { getCompleteBookingData, PACKAGES, clearBookingData } from "./utils/booking-storage"

const PreviewBookingPagePackage = () => {
  const navigate = useNavigate()
  const { packageName } = useParams()

  // Load data using the bookingStorage utility
  const [bookingData, setBookingData] = useState(getCompleteBookingData)

  // At the top of the component, replace the currentPackageName logic with:
  const currentPackageName = packageName || sessionStorage.getItem("currentPackageName") || "Package"

  // Add this useEffect to ensure the package name is always stored
  useEffect(() => {
    if (packageName) {
      sessionStorage.setItem("currentPackageName", packageName)
    }
  }, [packageName])

  useEffect(() => {
    const refreshedData = getCompleteBookingData()
    setBookingData(refreshedData)
    console.log("Package booking data:", refreshedData) 

    // Validate that we have package data
    if (!refreshedData.servicesData.livePackageData && !refreshedData.servicesData.selectedPackage) {
      console.warn("No package data found, redirecting to input details")
      const validPackageName = packageName || currentPackageName
      navigate(`/book/${encodeURIComponent(validPackageName)}/package/inputdetails`)
    }
  }, [packageName, currentPackageName, navigate])

  // Get selected package details - UPDATED to handle live package data
  const getSelectedPackageDetails = () => {
    const { servicesData } = bookingData

    // First check if we have live package data
    if (servicesData.livePackageData) {
      return {
        id: servicesData.selectedPackage || `package-${servicesData.livePackageData.packageId}`,
        name: servicesData.livePackageData.packageName,
        price: servicesData.livePackageData.packagePrice,
        icon: "📦", // Default icon for live packages
        description: servicesData.livePackageData.packageDescription || "Custom package",
        packageId: servicesData.livePackageData.packageId,
        services: servicesData.livePackageData.services || [],
      }
    }

    // Fallback to static packages for backward compatibility
    if (servicesData.selectedPackage) {
      return PACKAGES.find((pkg) => pkg.id === servicesData.selectedPackage)
    }

    return null
  }

  const selectedPackage = getSelectedPackageDetails()

  // Calculate the total price based on selected package - UPDATED to handle live data
  const calculateSubtotal = () => {
    const { servicesData } = bookingData

    // First check if we have live package data
    if (servicesData.livePackageData) {
      return servicesData.livePackageData.packagePrice || 0
    }

    // Fallback to static packages
    if (selectedPackage) {
      return selectedPackage.price
    }

    return 0
  }

  // Calculate subtotal and related values
  const subtotal = calculateSubtotal()
  const downpayment = subtotal * 0.1 // 10% downpayment
  const remainingBalance = subtotal - downpayment

  // Format number as Philippine Peso
  const formatAsPeso = (amount) => {
    return "₱" + amount.toLocaleString()
  }

  // Update the handlePrevious function to use the resolved package name:
  const handlePrevious = () => {
    const validPackageName = packageName || currentPackageName
    navigate(`/book/${encodeURIComponent(validPackageName)}/package/inputdetails`)
  }

  // Update the handlePayment function to use the resolved package name:
  const handlePayment = () => {
    if (!selectedPackage) {
      alert("Package information is missing. Please go back and select a package.")
      return
    }

    // Ensure package ID is properly stored before proceeding
    const { servicesData } = bookingData
    if (servicesData.livePackageData) {
      console.log("Proceeding with package ID:", servicesData.livePackageData.packageId)
    }

    const validPackageName = packageName || currentPackageName
    navigate(`/book/${encodeURIComponent(validPackageName)}/package/payment`)
  }

  return (
    <>
      <Navbar />
      <div className="booking-container">
        {/* Breadcrumb Navigation */}
        <div className="breadcrumb">
          <Link to="/events-dashboard" onClick={() => clearBookingData()}>
            Home
          </Link>{" "}
          /<Link to={`/package/${encodeURIComponent(currentPackageName)}`}>{currentPackageName}</Link> /{" "}
          <span>Book Now</span>
        </div>

        <div className="booking-content">
          {/* Side Panel */}
          <BookingSidePanel activeStep="preview" />

          {/* Main Content */}
          <div className="main-form-content">
            {/* Step Indicator - Modified for package flow (3 steps instead of 4) */}
            <div className="step-indicator">
              <div className="step completed">
                <div className="step-number">1</div>
                <div className="step-label">Enter Details</div>
              </div>
              <div className="step-line completed"></div>
              <div className="step active">
                <div className="step-number">2</div>
                <div className="step-label">Preview</div>
              </div>
              <div className="step-line"></div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-label">Payment</div>
              </div>
            </div>

            {/* Preview Content */}
            <div className="preview-content">
              <h2 className="section-title">Preview Booking for {currentPackageName}</h2>

              {/* Debug Info */}
           

              {/* Personal Information */}
              <div className="preview-section">
                <h3>Personal Information</h3>
                <div className="personal-info">
                  <div className="info-row">
                    <div className="info-group">
                      <label>First Name</label>
                      <div className="info-value">{bookingData.personalInfo.firstName || "Not provided"}</div>
                    </div>
                    <div className="info-group">
                      <label>Last Name</label>
                      <div className="info-value">{bookingData.personalInfo.lastName || "Not provided"}</div>
                    </div>
                  </div>

                  <div className="info-row">
                    <div className="info-group">
                      <label>Email</label>
                      <div className="info-value">{bookingData.personalInfo.email || "Not provided"}</div>
                    </div>
                    <div className="info-group">
                      <label>Contact</label>
                      <div className="info-value">{bookingData.personalInfo.contact || "Not provided"}</div>
                    </div>
                  </div>

                  <div className="info-row">
                    <div className="info-group">
                      <label>Location</label>
                      <div className="info-value">{bookingData.eventDetails.location || "Not provided"}</div>
                    </div>
                    <div className="info-group">
                      <label>Event Date</label>
                      <div className="info-value">{bookingData.eventDetails.eventDate || "Not provided"}</div>
                    </div>
                  </div>

                  {bookingData.eventDetails.note && (
                    <div className="info-row">
                      <div className="info-group full-width">
                        <label>Additional Notes</label>
                        <div className="info-value note-value">{bookingData.eventDetails.note}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Services - Show selected package */}
              <div className="preview-section">
                <h3>Selected Package</h3>
                <div className="services-preview">
                  {selectedPackage ? (
                    <div className="package-preview">
                      <p className="selection-type">Package Selection:</p>
                      <div className="preview-service">
                        <div className="service-icon">{selectedPackage.icon}</div>
                        <div className="service-name">{selectedPackage.name}</div>
                        <div className="service-price">{formatAsPeso(selectedPackage.price)}</div>
                      </div>
                      <div className="package-description">
                        <p>{selectedPackage.description}</p>
                      </div>
                      {selectedPackage.packageId && (
                        <div className="package-id">
                          <small>Package ID: {selectedPackage.packageId}</small>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="no-services">
                      <p>No package selected. Please go back and select a package.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Price Calculation */}
              {selectedPackage && (
                <div className="price-calculation">
                  <div className="calculation-row">
                    <div className="calculation-label">Subtotal</div>
                    <div className="calculation-value">{formatAsPeso(subtotal)}</div>
                  </div>
                  <div className="calculation-row">
                    <div className="calculation-label">Downpayment (10%)</div>
                    <div className="calculation-value">{formatAsPeso(downpayment)}</div>
                  </div>
                  <div className="calculation-row">
                    <div className="calculation-label">Remaining Balance</div>
                    <div className="calculation-value">{formatAsPeso(remainingBalance)}</div>
                  </div>

                  <div className="payment-notice">
                    <p>
                      The package price is fixed as shown. You are required to pay 10% of the total package price to
                      confirm the booking.
                    </p>
                    <div className="to-pay">
                      <span>To pay:</span> <strong>{formatAsPeso(downpayment)}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="navigation-buttons">
                <button className="previous-button" onClick={handlePrevious}>
                  Previous
                </button>
                <button
                  className={`payment-button ${!selectedPackage ? "disabled" : ""}`}
                  onClick={handlePayment}
                  disabled={!selectedPackage}
                >
                  {!selectedPackage ? "Select Package First" : "Proceed to Payment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default PreviewBookingPagePackage
