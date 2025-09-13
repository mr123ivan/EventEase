"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation, useParams } from "react-router-dom"
import axios from "axios"

import "./styles/previewbooking-page.css"
import Navbar from "../../Components/Navbar"
import Footer from "../../Components/Footer"
import BookingSidePanel from "../../Components/Booking-sidepanel"
import { getCompleteBookingData, getSelectedServices, getSelectedPackage, PACKAGES, clearBookingData } from "./utils/booking-storage"

const PreviewBookingPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { eventName } = useParams()

  // Load data using the bookingStorage utility
  const [bookingData, setBookingData] = useState(getCompleteBookingData)
  const [sections, setSections] = useState([])
  const [serviceMap, setServiceMap] = useState({})
  const [packageMap, setPackageMap] = useState({})

  useEffect(() => {
    setBookingData(getCompleteBookingData())
  }, [])
  
  // Get event name from URL params or session storage
  const currentEventName = eventName || sessionStorage.getItem("currentEventName") || "Event"

  // Fetch event details to get event_sections
  useEffect(() => {
    const fetchEventSections = async () => {
      if (!currentEventName) return
      try {
        const res = await axios.get(`http://localhost:8080/api/events/event-details/${encodeURIComponent(currentEventName)}`)
        const ev = res?.data
        const raw = ev?.event_sections
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
        const arr = Array.isArray(parsed) ? parsed : []
        setSections(arr)
      } catch (err) {
        console.warn('Unable to load event sections for', currentEventName, err)
        setSections([])
      }
    }
    fetchEventSections()
  }, [currentEventName])

  // Fetch all subcontractor services once to build id -> meta map
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const resp = await axios.get('http://localhost:8080/subcontractor/getall')
        const arr = Array.isArray(resp.data) ? resp.data : []
        const map = {}
        arr.forEach(sc => {
          ;(sc.services || []).forEach(svc => {
            const sid = Number(svc.id ?? svc.serviceId ?? svc.service_id)
            if (Number.isFinite(sid)) {
              map[sid] = { 
                name: svc.name ?? svc.service_name ?? `Service ${sid}`, 
                price: Number(svc.price ?? svc.service_price ?? 0) 
              }
            }
          })
        })
        setServiceMap(map)
      } catch (e) {
        console.warn('Unable to fetch subcontractor services for mapping', e)
        setServiceMap({})
      }
    }
    fetchServices()
  }, [])

  // Fetch all packages once to build id -> meta map
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const resp = await axios.get('http://localhost:8080/package/getall')
        const arr = Array.isArray(resp.data) ? resp.data : []
        const map = {}
        arr.forEach(pkg => {
          const pid = Number(pkg.id ?? pkg.packageId ?? pkg.package_id)
          if (Number.isFinite(pid)) {
            map[pid] = { 
              name: pkg.name ?? pkg.package_name ?? `Package ${pid}`, 
              price: Number(pkg.price ?? pkg.package_price ?? 0) 
            }
          }
        })
        setPackageMap(map)
      } catch (e) {
        console.warn('Unable to fetch packages for mapping', e)
        setPackageMap({})
      }
    }
    fetchPackages()
  }, [])

  // Check if using event sections from database
  const usingEventSections = Array.isArray(sections) && sections.length > 0
  
  // Build dynamic sections from event sections if available
  const dynamicSections = (() => {
    if (!usingEventSections) return []
    return sections.map((sec, idx) => {
      const options = (sec.services || []).map((s, sIdx) => {
        const rawId = s?.id ?? s?.serviceId ?? s?.service_id ?? `${idx}_${sIdx}`
        const idStr = String(rawId)
        const idNum = Number(rawId)
        const meta = Number.isFinite(idNum) ? serviceMap[idNum] : undefined
        const label = meta?.name ?? s?.name ?? s?.service_name ?? s?.label ?? `Option ${sIdx + 1}`
        const price = Number(meta?.price ?? s?.price ?? s?.service_price ?? 0)
        return { id: idStr, label, price }
      })
      return {
        key: `section_${idx}`,
        label: sec?.title || `Section ${idx + 1}`,
        required: !!sec?.required,
        multi: !!sec?.multi,
        options,
      }
    })
  })()

  // New service definitions mirroring selectservice-page.jsx
  const RADIO_GROUPS = {
    bridalGown: {
      label: "Bridal gown",
      options: [
        { id: "gown_owned_5k", label: "Owned", price: 5000 },
        { id: "gown_rental_2k", label: "Rental", price: 2000 },
        { id: "gown_none", label: "No gown", price: 0 },
      ],
    },
    groomSuit: {
      label: "Groom suit",
      options: [
        { id: "suit_owned_4k", label: "Owned", price: 4000 },
        { id: "suit_rental_1_5k", label: "Rental", price: 1500 },
        { id: "suit_none", label: "No suit", price: 0 },
      ],
    },
    photoVideo: {
      label: "Photography/Videography",
      options: [
        { id: "photo_video_25k", label: "Photo + Video (prenup & wedding day)", price: 25000 },
        { id: "photo_6k", label: "Photography (prenup & wedding day)", price: 6000 },
        { id: "video_4k", label: "Videography (wedding day only)", price: 4000 },
        { id: "none_photo_video", label: "None of the above", price: 0 },
      ],
    },
    weddingCake: {
      label: "Wedding cake",
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

  // Build a lookup for all selectable items (custom only)
  const allOptionsMap = (() => {
    const m = {}
    if (usingEventSections && dynamicSections.length > 0) {
      dynamicSections.forEach((sec) => {
        sec.options.forEach((opt) => { 
          m[opt.id] = { label: `${sec.label}: ${opt.label}`, price: opt.price } 
        })
      })
    } else {
      Object.entries(RADIO_GROUPS).forEach(([k, g]) => {
        g.options.forEach((opt) => { m[opt.id] = { label: `${g.label}: ${opt.label}`, price: opt.price } })
      })
      OTHER_SERVICES.forEach((s) => { m[s.id] = { label: s.label, price: s.price } })
      ADD_ONS.forEach((s) => { m[s.id] = { label: s.label, price: s.price } })
    }
    return m
  })()

  // Build available packages from event sections
  const getAvailablePackages = () => {
    if (!usingEventSections) return PACKAGES
    
    const byId = new Map()
    ;(sections || []).forEach((sec) => {
      // New/expanded shape: packages: [{ id, name?, price? } | { packageId, packageName?, packagePrice? } | number]
      ;(sec.packages || []).forEach((p) => {
        const raw = typeof p === 'number' || typeof p === 'string' ? p : (p?.id ?? p?.packageId ?? p?.package_id)
        const idNum = Number(raw)
        if (!Number.isFinite(idNum)) return
        const inlineName = (typeof p === 'object' && p) ? (p.name ?? p.packageName ?? p.package_name) : undefined
        const inlinePrice = (typeof p === 'object' && p) ? (p.price ?? p.packagePrice ?? p.package_price) : undefined
        const meta = packageMap[idNum] || {}
        const name = inlineName ?? meta.name ?? `Package ${idNum}`
        const price = Number(inlinePrice ?? meta.price ?? 0)
        byId.set(idNum, { id: idNum, name, price, icon: "📦" })
      })
      // Legacy shape: packageIds: [id, id]
      ;(sec.packageIds || []).forEach((rawId) => {
        const idNum = Number(rawId)
        if (!Number.isFinite(idNum)) return
        const meta = packageMap[idNum] || {}
        if (!byId.has(idNum)) byId.set(idNum, { 
          id: idNum, 
          name: meta.name || `Package ${idNum}`, 
          price: Number(meta.price || 0),
          icon: "📦"
        })
      })
    })
    return Array.from(byId.values())
  }

  const availablePackages = getAvailablePackages()

  const getSelectedItems = () => {
    const { servicesData } = bookingData
    const items = []
    if (!servicesData) return items
    
    const { selectedServices = {}, selectedPackage } = servicesData
    
    // Handle package selection
    if (selectedPackage) {
      // First try to find in available packages
      const pkgIdNum = Number(selectedPackage)
      if (Number.isFinite(pkgIdNum)) {
        const pkg = availablePackages.find(p => Number(p.id) === pkgIdNum)
        if (pkg) {
          items.push({ 
            id: pkg.id, 
            label: pkg.name, 
            price: pkg.price, 
            isPackage: true, 
            icon: pkg.icon || "📦" 
          })
          return items
        }
      }
      
      // Fallback to static packages
      const pkg = PACKAGES.find(p => p.id === selectedPackage)
      if (pkg) {
        items.push({ 
          id: pkg.id, 
          label: pkg.name, 
          price: pkg.price, 
          isPackage: true, 
          icon: pkg.icon || "📦" 
        })
        return items
      }
    }
    
    // Handle custom service selections
    if (usingEventSections && dynamicSections.length > 0) {
      // Process dynamic sections
      dynamicSections.forEach((sec) => {
        if (sec.multi) {
          // For multi-select sections, check each option
          sec.options.forEach((opt) => {
            if (selectedServices[opt.id]) {
              items.push({ 
                id: opt.id, 
                label: `${sec.label}: ${opt.label}`, 
                price: opt.price 
              })
            }
          })
        } else {
          // For single-select sections, get the selected option
          const sel = selectedServices[sec.key]
          if (sel) {
            // Find the selected option
            const option = sec.options.find(o => o.id === sel)
            if (option) {
              items.push({ 
                id: sel, 
                label: `${sec.label}: ${option.label}`, 
                price: option.price 
              })
            }
          }
        }
      })
    } else {
      // Process static service groups
      Object.keys(RADIO_GROUPS).forEach((groupKey) => {
        const optId = selectedServices[groupKey]
        if (optId) {
          const group = RADIO_GROUPS[groupKey]
          const option = group.options.find(o => o.id === optId)
          if (option) {
            items.push({ 
              id: optId, 
              label: `${group.label}: ${option.label}`, 
              price: option.price 
            })
          }
        }
      })
      
      // Process checkbox services
      ;[...OTHER_SERVICES, ...ADD_ONS].forEach((s) => {
        if (selectedServices[s.id]) {
          items.push({ id: s.id, label: s.label, price: s.price })
        }
      })
    }
    
    return items
  }

  const selectedItems = getSelectedItems()
  const subtotal = selectedItems.reduce((sum, it) => sum + (Number(it.price) || 0), 0)
  const downpayment = subtotal * 0.1 // 10% downpayment
  const remainingBalance = subtotal - downpayment

  // Format number as Philippine Peso
  const formatAsPeso = (amount) => {
    return "₱" + amount.toLocaleString()
  }

  // Handle navigation to previous page
  const handlePrevious = () => {
    if (eventName) {
      navigate(`/book/${encodeURIComponent(eventName)}/services`)
    } else {
      navigate("/book/services")
    }
  }

  // Handle navigation to payment page
  const handlePayment = () => {
    if (eventName) {
      navigate(`/book/${encodeURIComponent(eventName)}/payment`)
    } else {
      navigate("/book/payment")
    }
  }

  // Budget parsing and overbudget check
  const parseBudget = (raw) => {
    const cleaned = String(raw ?? "0").replace(/[^0-9.]/g, "")
    const n = Number(cleaned)
    return Number.isFinite(n) ? n : 0
  }
  const budgetValue = parseBudget(bookingData?.eventDetails?.budget)
  const overBudget = subtotal > budgetValue

  return (
    <>
      <Navbar />
      <div className="booking-container">
        {/* Breadcrumb Navigation */}
        <div className="breadcrumb">
          <Link to="/events-dashboard" onClick={() => clearBookingData()}>Home</Link> /
          <Link to={`/event/${encodeURIComponent(currentEventName)}`}>{currentEventName}</Link> /<span>Book Now</span>
        </div>

        <div className="booking-content">
          {/* Side Panel */}
          <BookingSidePanel activeStep="preview" />

          {/* Main Content */}
          <div className="main-form-content">
            {/* Step Indicator */}
            <div className="step-indicator">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-label">Enter Details</div>
              </div>
              <div className="step-line"></div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-label">Services</div>
              </div>
              <div className="step-line"></div>
              <div className="step active">
                <div className="step-number">3</div>
                <div className="step-label">Preview</div>
              </div>
              <div className="step-line"></div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-label">Payment</div>
              </div>
            </div>

            {/* Preview Content */}
            <div className="preview-content">
              <h2 className="section-title">Preview Booking for {currentEventName}</h2>

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

                  <div className="info-row">
                    <div className="info-group">
                      <label>Name of Celebrant/s</label>
                      <div className="info-value">{bookingData.eventDetails.celebrantName || "Not provided"}</div>
                    </div>
                    <div className="info-group">
                      <label>Additional Celebrant/s</label>
                      <div className="info-value">{bookingData.eventDetails.celebrantNameOptional || "None"}</div>
                    </div>
                  </div>

                  <div className="info-row">
                    <div className="info-group">
                      <label>Projected Attendees</label>
                      <div className="info-value">{bookingData.eventDetails.projectedAttendees || "Not provided"}</div>
                    </div>
                    <div className="info-group">
                      <label>Budget</label>
                      <div className="info-value">₱{budgetValue.toLocaleString()}</div>
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

              {/* Services */}
              <div className="preview-section">
                <h3>Selected Services</h3>
                <div className="services-preview">
                  {selectedItems.length > 0 ? (
                    <>
                      {bookingData.servicesData?.selectedPackage ? (
                        <div className="package-preview">
                          <p className="selection-type">Package Selection:</p>
                          {selectedItems.map((it) => (
                            <div key={it.id} className="preview-service">
                              <div className="service-icon">{it.icon || "📦"}</div>
                              <div className="service-name">{it.label}</div>
                              <div className="service-price">{formatAsPeso(it.price)}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="custom-services-preview">
                          <p className="selection-type">Custom Services Selection:</p>
                          {selectedItems.map((it) => (
                            <div key={it.id} className="preview-service">
                              <div className="service-info">
                                <div className="service-name">{it.label}</div>
                              </div>
                              <div className="service-price">{formatAsPeso(it.price)}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="no-services">
                      <p>No services selected. Please go back and select services.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Price Calculation */}
              {selectedItems.length > 0 && (
                <div className="price-calculation">
                  <div className="calculation-row">
                    <div className="calculation-label">Subtotal</div>
                    <div className="calculation-value">{formatAsPeso(subtotal)}</div>
                  </div>
                  <div className="calculation-row">
                    <div className="calculation-label">Budget</div>
                    <div className="calculation-value">{formatAsPeso(budgetValue)}</div>
                  </div>
                  {overBudget && (
                    <div className="calculation-row">
                      <div className="calculation-label over-budget">Over Budget</div>
                      <div className="calculation-value over-budget">+{formatAsPeso(subtotal - budgetValue)}</div>
                    </div>
                  )}
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
                      The subtotal is subject to change depending on the final agreement between both parties. Customers
                      are required to pay 10% of the partial (not final) subtotal to confirm the booking.
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
                  className={`payment-button ${selectedItems.length === 0 ? "disabled" : ""}`}
                  onClick={handlePayment}
                  disabled={selectedItems.length === 0}
                >
                  {selectedItems.length === 0 ? "Select Services First" : "Proceed to Payment"}
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

export default PreviewBookingPage
