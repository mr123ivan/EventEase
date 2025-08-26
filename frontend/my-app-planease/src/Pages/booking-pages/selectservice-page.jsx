"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import "./styles/selectservice-page.css"
import Navbar from "../../Components/Navbar"
import Footer from "../../Components/Footer"
import BookingSidePanel from "../../Components/Booking-sidepanel"
import {
  getSelectedServices,
  getSelectedPackage,
  getEventDetails,
  getPersonalInfo,
  saveServicesData,
  PACKAGES,
  clearBookingData,
} from "./utils/booking-storage"

const SelectServicePage = () => {
  const navigate = useNavigate()
  const { eventName } = useParams()

  // Get event name from params or sessionStorage as fallback
  const currentEventName = eventName || sessionStorage.getItem("currentEventName") || "Event"

  // Initialize from bookingStorage
  const [selectedServices, setSelectedServices] = useState(getSelectedServices)
  const [selectedPackage, setSelectedPackage] = useState(getSelectedPackage)

  const [personalInfo, setPersonalInfo] = useState(getPersonalInfo)
  const [eventDetails, setEventDetails] = useState(getEventDetails)

  // Hardcoded service definitions
  const RADIO_GROUPS = {
    bridalGown: {
      label: "Bridal gown",
      required: true,
      options: [
        { id: "gown_owned_5k", label: "Owned", price: 5000 },
        { id: "gown_rental_2k", label: "Rental", price: 2000 },
        { id: "gown_none", label: "No gown", price: 0 },
      ],
    },
    groomSuit: {
      label: "Groom suit",
      required: true,
      options: [
        { id: "suit_owned_4k", label: "Owned", price: 4000 },
        { id: "suit_rental_1_5k", label: "Rental", price: 1500 },
        { id: "suit_none", label: "No suit", price: 0 },
      ],
    },
    photoVideo: {
      label: "Photography/Videography",
      required: true,
      options: [
        { id: "photo_video_25k", label: "Photo + Video (prenup & wedding day)", price: 25000 },
        { id: "photo_6k", label: "Photography (prenup & wedding day)", price: 6000 },
        { id: "video_4k", label: "Videography (wedding day only)", price: 4000 },
        { id: "none_photo_video", label: "None of the above", price: 0 },
      ],
    },
    weddingCake: {
      label: "Wedding cake",
      required: true,
      options: [
        { id: "cake_4tier_10k", label: "4-tier cake + cupcakes", price: 10000 },
        { id: "cake_3tier_8k", label: "3-tier cake", price: 8000 },
        { id: "cake_2tier_5k", label: "2-tier cake", price: 5000 },
        { id: "cake_none", label: "No wedding cake", price: 0 },
      ],
    },
  }

  const OTHER_SERVICES = [
    { id: "photobooth_3k", label: "Photobooth", price: 3000 },
    { id: "invites_souvenirs_3k", label: "Invitations and souvenirs", price: 3000 },
    { id: "doves_1k", label: "Doves", price: 1000 },
    { id: "wedding_makeup_3k", label: "Wedding makeup", price: 3000 },
    { id: "same_day_edit_3k", label: "Same day edit video", price: 3000 },
    { id: "catering_20k", label: "Catering", price: 20000 },
    { id: "decorations_15k", label: "Decorations", price: 15000 },
    { id: "host_6k", label: "Host", price: 6000 },
    { id: "lechon_6k", label: "Lechon", price: 6000 },
    { id: "bridal_car_1k", label: "Bridal car", price: 1000 },
    { id: "van_service_2k", label: "Van service", price: 2000 },
    { id: "sounds_lights_7k", label: "Sounds and lights", price: 7000 },
    { id: "bridal_entourage_10k", label: "Bridal entourage gown, suit and flowers", price: 10000 },
    { id: "wine_toasting_1k", label: "Wine for toasting", price: 1000 },
    { id: "mobile_bar_5k", label: "Mobile bar", price: 5000 },
  ]

  const ADD_ONS = [
    { id: "led_wall_trusses_7k", label: "LED wall and trusses", price: 7000 },
    { id: "grazing_table_2k", label: "Grazing table", price: 2000 },
    { id: "kakanin_bar_1k", label: "Kakanin bar", price: 1000 },
    { id: "coffee_bar_1k", label: "Coffee bar", price: 1000 },
    { id: "cocktail_mobile_bar_1k", label: "Cocktail mobile bar", price: 1000 },
    { id: "caramel_beer_bar_1k", label: "Caramel beer bar", price: 1000 },
    { id: "desserts_bar_1k", label: "Desserts bar", price: 1000 },
  ]

  // Save data when it changes
  useEffect(() => {
    saveServicesData({
      selectedServices,
      selectedPackage,
    })
  }, [selectedServices, selectedPackage])

  // Build a lookup for all selectable items (custom only)
  const ALL_OPTIONS_MAP = (() => {
    const m = {}
    Object.entries(RADIO_GROUPS).forEach(([k, g]) => {
      g.options.forEach((opt) => { m[opt.id] = { label: `${g.label}: ${opt.label}`, price: opt.price } })
    })
    OTHER_SERVICES.forEach((s) => { m[s.id] = { label: s.label, price: s.price } })
    ADD_ONS.forEach((s) => { m[s.id] = { label: s.label, price: s.price } })
    return m
  })()

  // Derive selected custom items and total
  const getSelectedCustomItems = () => {
    const items = []
    // radios
    Object.entries(RADIO_GROUPS).forEach(([key, group]) => {
      const sel = selectedServices[key]
      if (sel && ALL_OPTIONS_MAP[sel]) {
        const it = ALL_OPTIONS_MAP[sel]
        items.push({ id: sel, label: it.label, price: it.price })
      }
    })
    // checkboxes
    ;[...OTHER_SERVICES, ...ADD_ONS].forEach((s) => {
      if (selectedServices[s.id]) items.push({ id: s.id, label: s.label, price: s.price })
    })
    return items
  }

  const selectedCustomItems = getSelectedCustomItems()
  const customTotal = selectedCustomItems.reduce((sum, it) => sum + (Number(it.price) || 0), 0)

  const selectedPkg = PACKAGES.find((p) => p.id === selectedPackage)
  const displayedTotal = selectedPkg ? selectedPkg.price : customTotal

  // Parse budget from event details (supports numbers or strings like "₱12,345")
  const budgetValue = (() => {
    const raw = eventDetails && eventDetails.budget != null ? String(eventDetails.budget) : "0"
    const cleaned = raw.replace(/[^0-9.]/g, "")
    const num = Number(cleaned)
    return Number.isFinite(num) ? num : 0
  })()
  const overBudget = displayedTotal > budgetValue

  const submitFormProgress = async () => {
    const token = localStorage.getItem("token")
    const body = {
      email: personalInfo.email,
      eventName: currentEventName,
      jsonData: JSON.stringify({
        personalInfo,
        eventDetails,
        selectedServices
      })
    }

    try {
      await axios.post(`http://localhost:8080/form-draft/save`, body, {
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch (error) {
      console.error("Error fetching form progress:", error)
      throw error // rethrow so beforeNavigate can block navigation
    }
  }

  // Handlers
  const handleRadioChange = (groupKey, optionId) => {
    setSelectedServices((prev) => ({
      ...prev,
      [groupKey]: optionId,
    }))
    // Choosing custom invalidates selected package
    if (selectedPackage) setSelectedPackage(null)
  }

  // Handle service checkbox change
  const handleServiceChange = (serviceId) => {
    setSelectedServices((prev) => ({
      ...prev,
      [serviceId]: !prev[serviceId],
    }))
    // Choosing custom invalidates selected package
    if (selectedPackage) setSelectedPackage(null)
  }

  // Handle package selection
  const handlePackageSelect = (packageId) => {
    setSelectedPackage(packageId)
    // Clear custom selections
    const cleared = {}
    Object.keys(RADIO_GROUPS).forEach((k) => { cleared[k] = undefined })
    const allOptionIds = [...OTHER_SERVICES, ...ADD_ONS]
    allOptionIds.forEach((s) => { cleared[s.id] = false })
    setSelectedServices(cleared)
  }

  // Check if user has made a valid selection
  const hasValidSelection = () => {
    if (selectedPackage) return true
    // All required radio groups must have a selection
    const allRequiredChosen = Object.entries(RADIO_GROUPS).every(([key, group]) => {
      if (!group.required) return true
      return Boolean(selectedServices[key])
    })
    return allRequiredChosen
  }

  // Handle next button click
  const handleNext = () => {
    if (!hasValidSelection()) {
      if (selectedPackage) {
        alert("Please select a package before proceeding.")
      } else {
        alert("Please select at least one service before proceeding.")
      }
      return
    }
    if (overBudget) {
      alert("Your total exceeds your budget. Please adjust your selections before proceeding.")
      return
    }

    // Save booking services data with all necessary information
    saveServicesData({
      selectedServices,
      selectedPackage,
    })

    submitFormProgress()

    // Navigate to preview page with event name
    if (eventName) {
      navigate(`/book/${encodeURIComponent(eventName)}/preview`)
    } else {
      navigate("/book/preview")
    }
  }

  // Handle previous button click
  const handlePrevious = () => {
    if (eventName) {
      submitFormProgress()
      navigate(`/book/${encodeURIComponent(eventName)}/inputdetails`)
    } else {
      navigate("/book/inputdetails")
    }
  }

  return (
    <>
      <Navbar />
      <div className="booking-container">
        {/* Breadcrumb Navigation */}
        <div className="breadcrumb">
          <Link to="/events-dashboard" onClick={() => clearBookingData()}>Home</Link> /{" "}
          <Link to={`/event/${encodeURIComponent(currentEventName)}`}>{currentEventName}</Link> / <span>Book Now</span>
        </div>

        <div className="booking-content">
          {/* Side Panel */}
          <BookingSidePanel
            activeStep="enter-details"
            beforeNavigate={async () => {
              try {
                // Submit progress
                await submitFormProgress()
                return true
              } catch (error) {
                console.error("Blocking navigation due to error:", error)
                return false
              }
            }}
          />

          {/* Main Content */}
          <div className="main-form-content">
            {/* Step Indicator */}
            <div className="step-indicator">
              <div className="step completed">
                <div className="step-number">1</div>
                <div className="step-label">Enter Details</div>
              </div>
              <div className="step-line completed"></div>
              <div className="step active">
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

            {/* Services Selection */}
            <div className="services-selection">
              <h2 className="section-title">Select Services</h2>
              <div className="tab-content">
                {/* Custom Service Options */}
                <div className="custom-services">
                  {/* Required radio groups */}
                  {Object.entries(RADIO_GROUPS).map(([groupKey, group]) => (
                    <div key={groupKey} className="service-group">
                      <h3 className="group-title">{group.label} <span className="required">(Choose one only, required*)</span></h3>
                      <div className="group-options">
                        {group.options.map((opt) => (
                          <label key={opt.id} className={`option-card ${selectedServices[groupKey] === opt.id ? "selected" : ""}`}>
                            <input
                              type="radio"
                              name={groupKey}
                              value={opt.id}
                              checked={selectedServices[groupKey] === opt.id}
                              onChange={() => handleRadioChange(groupKey, opt.id)}
                            />
                            <span>{opt.label}</span>
                            <span className="option-price">₱{opt.price.toLocaleString()}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Optional checkbox groups */}
                  <div className="service-group">
                    <h3 className="group-title">choose other services you want to include:</h3>
                    <div className="group-options">
                      {OTHER_SERVICES.map((svc) => (
                        <label key={svc.id} className={`option-card ${selectedServices[svc.id] ? "selected" : ""}`}>
                          <input
                            type="checkbox"
                            checked={!!selectedServices[svc.id]}
                            onChange={() => handleServiceChange(svc.id)}
                          />
                          <span>{svc.label}</span>
                          <span className="option-price">₱{svc.price.toLocaleString()}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="service-group">
                    <h3 className="group-title">ADD ONS (optional)</h3>
                    <div className="group-options">
                      {ADD_ONS.map((svc) => (
                        <label key={svc.id} className={`option-card ${selectedServices[svc.id] ? "selected" : ""}`}>
                          <input
                            type="checkbox"
                            checked={!!selectedServices[svc.id]}
                            onChange={() => handleServiceChange(svc.id)}
                          />
                          <span>{svc.label}</span>
                          <span className="option-price">₱{svc.price.toLocaleString()}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* OR separator */}
                <div className="or-separator">- - - OR - - -</div>

                {/* Fixed Packages */}
                <div className="package-options">
                  {PACKAGES.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`package-card ${selectedPackage === pkg.id ? "selected" : ""}`}
                      onClick={() => handlePackageSelect(pkg.id)}
                    >
                      <div className="package-icon-container">
                        <div className="package-icon">{pkg.icon}</div>
                      </div>
                      <div className="package-info">
                        <div className="package-name">{pkg.name}</div>
                        <div className="package-description">(view package)</div>
                        <div className="package-price">₱{pkg.price.toLocaleString()}</div>
                      </div>
                      <div className="package-checkbox-container">
                        <input
                          type="radio"
                          id={`package-${pkg.id}`}
                          name="selectedPackage"
                          checked={selectedPackage === pkg.id}
                          onChange={() => handlePackageSelect(pkg.id)}
                          className="package-radio"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Section */}
              <div className="summary-section">
                <div className="summary-card">
                  <div className="summary-header">Estimated total</div>
                  {selectedPkg ? (
                    <div className="summary-body">
                      <div className="summary-row">
                        <span className="summary-label">Package:</span>
                        <span className="summary-value">{selectedPkg.name}</span>
                      </div>
                      <div className="summary-row budget-row">
                        <span className="summary-label">Budget:</span>
                        <span className="summary-value">₱{budgetValue.toLocaleString()}</span>
                      </div>
                      {overBudget && (
                        <div className="budget-warning">
                          You have exceeded your budget by ₱{(displayedTotal - budgetValue).toLocaleString()}.
                        </div>
                      )}
                      <div className="summary-total">₱{displayedTotal.toLocaleString()}</div>
                    </div>
                  ) : (
                    <div className="summary-body">
                      {selectedCustomItems.length === 0 ? (
                        <div className="summary-empty">No custom services selected yet.</div>
                      ) : (
                        <ul className="summary-list">
                          {selectedCustomItems.map((it) => (
                            <li key={it.id} className="summary-item">
                              <span className="item-label">{it.label}</span>
                              <span className="item-price">₱{Number(it.price || 0).toLocaleString()}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="summary-row budget-row">
                        <span className="summary-label">Budget:</span>
                        <span className="summary-value">₱{budgetValue.toLocaleString()}</span>
                      </div>
                      {overBudget && (
                        <div className="budget-warning">
                          You have exceeded your budget by ₱{(displayedTotal - budgetValue).toLocaleString()}.
                        </div>
                      )}
                      <div className="summary-total">₱{displayedTotal.toLocaleString()}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="navigation-buttons">
                <button className="previous-button" onClick={handlePrevious}>
                  Previous
                </button>
                <button
                  className={`next-button ${!hasValidSelection() || overBudget ? "disabled" : ""}`}
                  onClick={handleNext}
                  disabled={!hasValidSelection() || overBudget}
                  title={overBudget ? "Total exceeds budget" : undefined}
                >
                  Next
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

export default SelectServicePage