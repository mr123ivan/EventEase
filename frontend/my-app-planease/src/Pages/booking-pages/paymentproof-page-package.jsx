"use client"

import { useState, useRef, useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import "./styles/paymentproof-page.css"
import Navbar from "../../Components/Navbar"
import Footer from "../../Components/Footer"
import BookingSidePanel from "../../Components/Booking-sidepanel"
import { getCompleteBookingData, clearBookingData, PACKAGES } from "./utils/booking-storage"
import MessageModal from "../../Components/MessageModal"
import axios from "axios"


const PaymentProofPagePackage = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate()
  const { packageName } = useParams()
  const fileInputRef = useRef(null)

  // Get package name from params or sessionStorage as fallback
  const currentPackageName = packageName || sessionStorage.getItem("currentPackageName") || "Package"
  const storedInfo = sessionStorage.getItem("bookingPersonalInfo");
  const currentEmail = storedInfo ? JSON.parse(storedInfo).email : null;

  const [uploadedFile, setUploadedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [referenceNumber, setReferenceNumber] = useState("")

  // Get booking data for payment amount
  const [bookingData, setBookingData] = useState(getCompleteBookingData)

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [pendingNavigation, setPendingNavigation] = useState(false);

  const showModal = (message, navigateAfter = false) => {
    setModalMessage(message);
    setModalOpen(true);
    setPendingNavigation(navigateAfter);
  };

  // Refresh booking data when component mounts and validate package data
  useEffect(() => {
    const refreshedData = getCompleteBookingData()
    setBookingData(refreshedData)

    if (!refreshedData.servicesData.livePackageData && !refreshedData.servicesData.selectedPackage) {
      // console.warn("No package data found in payment page, redirecting to input details") // COMMENTED OUT - Exposes system routing behavior
      showModal("Package information is missing. Please start the booking process again.", true)
      return
    }

    // Log package information for debugging
    if (refreshedData.servicesData.livePackageData) {
      // console.log("Payment page - Package ID:", refreshedData.servicesData.livePackageData.packageId) // COMMENTED OUT - Exposes internal package ID
      // console.log("Payment page - Package Data:", refreshedData.servicesData.livePackageData) // COMMENTED OUT - Exposes complete package data structure
    }
  }, [packageName, currentPackageName, navigate])

  // Calculate payment amount (10% of package price) - UPDATED to handle live data
  const calculateSubtotal = () => {
    const { servicesData } = bookingData

    // First check if we have live package data
    if (servicesData.livePackageData) {
      return servicesData.livePackageData.packagePrice || 0
    }

    // Fallback to static packages
    if (servicesData.selectedPackage) {
      const selectedPkg = PACKAGES.find((pkg) => pkg.id === servicesData.selectedPackage)
      return selectedPkg ? selectedPkg.price : 0
    }

    return 0
  }

  const subtotal = calculateSubtotal()
  const paymentAmount = subtotal * 0.1 // 10% downpayment

  // Format number as Philippine Peso
  const formatAsPeso = (amount) => {
    return "₱" + amount.toLocaleString()
  }

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        showModal("Please upload an image file (JPG, PNG, etc.)");
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showModal("File size must be less than 5MB");
        return
      }

      setUploadedFile(file)

      // Generate preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle click on upload area
  const handleUploadClick = () => {
    fileInputRef.current.click()
  }

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        showModal("Please upload an image file (JPG, PNG, etc.)");
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showModal("File size must be less than 5MB");
        return
      }

      setUploadedFile(file)

      // Generate preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Prevent default behavior for drag events
  const handleDragOver = (e) => {
    e.preventDefault()
  }

  // Helper function to get package ID - UPDATED to handle live data with better error handling
  const getPackageId = () => {
    const { servicesData } = bookingData

    // If we have live package data, use the actual package ID
    if (servicesData.livePackageData && servicesData.livePackageData.packageId) {
      // Ensure packageId is a number (not a string)
      const packageId = Number.parseInt(servicesData.livePackageData.packageId, 10)
      // console.log("Using live package ID (numeric):", packageId) // COMMENTED OUT - Exposes internal package ID
      return isNaN(packageId) ? null : packageId
    }

    // Fallback to static mapping
    const packageMap = {
      "cherry-blossom": 1,
      tulip: 2,
      rose: 3,
    }

    const staticId = packageMap[servicesData.selectedPackage]
    // console.log("Using static package ID:", staticId, "for package:", servicesData.selectedPackage) // COMMENTED OUT - Exposes internal package mapping system
    return staticId || null
  }

  // Convert date string to SQL Date format
  const convertToSqlDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toISOString().split("T")[0] // Returns YYYY-MM-DD format
  }

  // Validate booking data before submission
  const validateBookingData = () => {
    const { personalInfo, eventDetails, servicesData } = bookingData

    // Check personal info
    if (!personalInfo.firstName || !personalInfo.lastName || !personalInfo.email || !personalInfo.contact) {
      showModal("Missing personal information. Please go back and complete all required fields.");
      return false
    }

    // Check event details
    if (!eventDetails.location || !eventDetails.eventDate) {
      showModal("Missing event details. Please go back and complete all required fields.");
      return false
    }

    // Check package selection (either static or live)
    if (!servicesData.selectedPackage && !servicesData.livePackageData) {
      showModal("No package selected. Please go back and select a package.");
      return false
    }

    // Validate package ID
    const packageId = getPackageId()
    if (!packageId) {
      showModal("Invalid package selection. Please go back and select a valid package.");
      return false
    }

    return true
  }

  const handleDeleteFormDraft =  async () => {
    const token = localStorage.getItem("token")
    try {
      const response = await axios.delete(`${API_BASE_URL}/form-draft/delete/${currentEmail}/${currentPackageName}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch (error) {
      console.error("Error fetching form progress:", error);
    }

  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!uploadedFile) {
      showModal("Please upload your payment proof before submitting");
      return
    }

    if (!referenceNumber.trim()) {
      showModal("Please enter your payment reference number");
      return
    }

    // Validate that reference number is numeric (since backend expects int)
    if (!/^\d+$/.test(referenceNumber.trim())) {
      showModal("Payment reference number must contain only numbers");
      return
    }

    if (!validateBookingData()) {
      return
    }

    if (paymentAmount <= 0) {
      showModal("Invalid payment amount. Please check your package selection.");
      return
    }

    setIsSubmitting(true)

    try {
      // Get user token and email
      const token = localStorage.getItem("token")
      if (!token) {
        showModal("Please log in to continue");
        setIsSubmitting(false)
        return
      }

      // Get user email from token
      const userResponse = await axios.get(`${API_BASE_URL}/user/getuser`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const userEmail = userResponse.data.email

      // console.log("User email:", userEmail) // COMMENTED OUT - Exposes personal email address
      // console.log("Package booking data:", bookingData) // COMMENTED OUT - Exposes sensitive booking and personal data

      // Get the package ID with validation
      const packageId = getPackageId()
      if (!packageId) {
        showModal("Error: Invalid package selection. Package ID is missing.");
        setIsSubmitting(false)
        return
      }

      // console.log("Final package ID for submission:", packageId) // COMMENTED OUT - Exposes internal package ID

      // Prepare booking transaction data for PACKAGE booking
      const transactionData = {
        // Personal Information
        firstName: bookingData.personalInfo.firstName,
        lastName: bookingData.personalInfo.lastName,
        email: bookingData.personalInfo.email,
        contact: bookingData.personalInfo.contact,

        // Event Details
        eventName: currentPackageName,
        eventId: null, // Set to null for package bookings - backend will handle this
        transactionVenue: bookingData.eventDetails.location,
        transactionDate: convertToSqlDate(bookingData.eventDetails.eventDate),
        transactionNote: bookingData.eventDetails.note || "",

        // Package Information
        packageId: packageId, // The actual package ID from your API

        // Payment Information
        paymentNote: `Payment for ${currentPackageName} package booking - Amount: ${formatAsPeso(paymentAmount)} - Ref: ${referenceNumber}`,
        paymentReferenceNumber: referenceNumber,

        // User
        userEmail: userEmail,
      }

      // Add this debug code right after creating transactionData
      // console.log("FINAL TRANSACTION DATA CHECK:", {
      //   packageId: transactionData.packageId,
      //   eventId: transactionData.eventId,
      //   typeOfPackageId: typeof transactionData.packageId,
      // }) // COMMENTED OUT - Exposes transaction data structure and internal IDs

      // If packageId is null or undefined, show an error and abort
      if (transactionData.packageId === null || transactionData.packageId === undefined) {
        showModal("Error: Package ID is missing. Please go back and select a package again.");
        setIsSubmitting(false)
        return
      }

      // console.log("=== PACKAGE TRANSACTION DATA DEBUG ===") // COMMENTED OUT - Debug section exposes sensitive data
      // console.log("Package ID:", transactionData.packageId) // COMMENTED OUT - Exposes internal package ID
      // console.log("Package Name:", currentPackageName) // COMMENTED OUT - Exposes package details
      // console.log("Payment Amount:", formatAsPeso(paymentAmount)) // COMMENTED OUT - Exposes payment amount
      // console.log("Transaction Date:", transactionData.transactionDate) // COMMENTED OUT - Exposes transaction timing
      // console.log("Complete transaction data:", transactionData) // COMMENTED OUT - Exposes complete sensitive transaction data

      // Create FormData for multipart request
      const formData = new FormData()
      formData.append("paymentProof", uploadedFile)
      formData.append("packageBookingData", JSON.stringify(transactionData))

      // console.log("FormData contents:") // COMMENTED OUT - Exposes form structure
      // console.log("- paymentProof file:", uploadedFile.name, uploadedFile.type, uploadedFile.size) // COMMENTED OUT - Exposes file details
      // console.log("- bookingData JSON:", JSON.stringify(transactionData)) // COMMENTED OUT - Exposes transaction data structure

      // Submit to the backend endpoint
      const response = await axios.post(`${API_BASE_URL}/api/transactions/createPackageBooking`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`, // Add token header
        },
      })

      // console.log("Response:", response.data) // COMMENTED OUT - API response may contain sensitive booking data

      if (response.data.success) {
        setSubmitSuccess(true)

        // Clear booking data from sessionStorage
        clearBookingData()

        // Send notification to admins
        await axios.post(
          `${API_BASE_URL}/api/notifications/notify-admins`,
          null,
          {
            params: { message: `New package booking submitted: ${currentPackageName}` },
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        handleDeleteFormDraft()
        // Show success message and redirect
        setTimeout(() => {
          showModal("Your package booking was submitted successfully!", true);
        }, 2000)
      }
    } catch (error) {
      console.error("Error submitting package booking:", error)
      console.error("Error response:", error.response?.data)
      console.error("Error status:", error.response?.status)

      // Show more specific error message
      const errorMessage =
        error.response?.data?.message || error.response?.data || "Failed to submit package booking. Please try again."
      showModal(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle previous button click
  const handlePrevious = () => {
    const validPackageName = packageName || currentPackageName
    navigate(`/book/${encodeURIComponent(validPackageName)}/package/preview`)
  }

  // Check if form is ready for submission
  const isFormReady = () => {
    return referenceNumber.trim() && uploadedFile && !isSubmitting && !submitSuccess && paymentAmount > 0
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
          <BookingSidePanel activeStep="upload-payment" />

          {/* Main Content */}
          <div className="main-form-content">
            {/* Step Indicator - Modified for package flow (3 steps instead of 4) */}
            <div className="step-indicator">
              <div className="step completed">
                <div className="step-number">1</div>
                <div className="step-label">Enter Details</div>
              </div>
              <div className="step-line completed"></div>
              <div className="step completed">
                <div className="step-number">2</div>
                <div className="step-label">Preview</div>
              </div>
              <div className="step-line completed"></div>
              <div className="step active">
                <div className="step-number">3</div>
                <div className="step-label">Payment</div>
              </div>
            </div>

            {/* Debug Info */}
            {bookingData.servicesData.livePackageData && (
              <div
                className="debug-info"
                style={{ background: "#e8f5e8", padding: "10px", margin: "10px 0", borderRadius: "5px" }}
              >
                <strong>Package ID: {bookingData.servicesData.livePackageData.packageId}</strong>
                <br />
                <small>Package Name: {bookingData.servicesData.livePackageData.packageName}</small>
              </div>
            )}

            {/* Payment Content */}
            <div className="payment-content">
              <h2 className="section-title">
                Payment for {currentPackageName} <span className="info-icon">ⓘ</span>
              </h2>

              {/* Payment Amount Summary */}
              <div className="payment-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>{formatAsPeso(subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Downpayment (10%):</span>
                  <span>{formatAsPeso(paymentAmount)}</span>
                </div>
                <div className="summary-row total">
                  <span>Amount to Pay:</span>
                  <strong>{formatAsPeso(paymentAmount)}</strong>
                </div>
              </div>

              {/* Payment QR Code Section */}
              <div className="payment-qr-section">
                <img src="/eventEase.jpg" alt="Payment QR Code" className="payment-qr" />
                <div className="payment-amount">
                  <span>Scan to pay:</span> <strong>{formatAsPeso(paymentAmount)}</strong>
                </div>
              </div>

              {/* Reference Number Section */}
              <h2 className="section-title">
                Payment Reference Number <span className="info-icon">ⓘ</span>
              </h2>

              <div className="reference-number-section">
                <p className="reference-instruction">
                  After making your payment, please enter the reference number from your transaction receipt below:
                </p>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="Enter payment reference number (e.g., 1234567890)"
                  className="reference-input"
                  required
                />
              </div>

              {/* Proof of Payment Section */}
              <h2 className="section-title">
                Proof of Payment <span className="info-icon">ⓘ</span>
              </h2>

              <form onSubmit={handleSubmit}>
                <div
                  className={`upload-area ${previewUrl ? "has-file" : ""} ${!referenceNumber ? "disabled" : ""}`}
                  onClick={referenceNumber ? handleUploadClick : null}
                  onDrop={referenceNumber ? handleDrop : null}
                  onDragOver={referenceNumber ? handleDragOver : null}
                >
                  {!referenceNumber ? (
                    <div className="upload-placeholder disabled">
                      <div className="upload-icon">⚠️</div>
                      <div>Please enter reference number first</div>
                    </div>
                  ) : previewUrl ? (
                    <div className="preview-container">
                      <img
                        src={previewUrl || "/placeholder.svg"}
                        alt="Payment Proof Preview"
                        className="file-preview"
                      />
                      <div className="file-info">
                        <div className="file-name">{uploadedFile.name}</div>
                        <div className="file-size">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                      <button
                        type="button"
                        className="change-file-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleUploadClick()
                        }}
                      >
                        Change File
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <div className="upload-icon">↑</div>
                      <div>Click here to upload or drop image here</div>
                      <div className="upload-hint">Supported: JPG, PNG (Max 5MB)</div>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: "none" }}
                    required
                    disabled={!referenceNumber}
                  />
                </div>

                {/* Validation Messages */}
                {paymentAmount <= 0 && (
                  <div className="validation-error">
                    <p>⚠️ Invalid payment amount. Please go back and select a package.</p>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="navigation-buttons">
                  <button type="button" className="previous-button" onClick={handlePrevious} disabled={isSubmitting}>
                    Previous
                  </button>
                  <button
                    type="submit"
                    className={`submit-button ${!isFormReady() ? "disabled" : ""}`}
                    disabled={!isFormReady()}
                  >
                    {isSubmitting ? "Submitting..." : submitSuccess ? "Submitted ✓" : "Submit Booking"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
      </div>
      <Footer />
      <MessageModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          if (pendingNavigation) {
            setPendingNavigation(false);
            navigate("/home")
          }
        }}
        message={modalMessage}
      />
    </>
  )
}

export default PaymentProofPagePackage
