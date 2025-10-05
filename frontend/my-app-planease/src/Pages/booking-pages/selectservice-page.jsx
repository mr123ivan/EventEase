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
  clearBookingData,
} from "./utils/booking-storage"

const SelectServicePage = () => {
  const navigate = useNavigate()
  const { eventName } = useParams()

  // Get event name from params or sessionStorage as fallback
  const currentEventName = eventName || sessionStorage.getItem("currentEventName") || "Event"

  // Initialize empty to avoid showing stale storage selections on first paint
  const [selectedServices, setSelectedServices] = useState({})
  const [selectedPackage, setSelectedPackage] = useState(null)

  const [personalInfo, setPersonalInfo] = useState(getPersonalInfo)
  const [eventDetails, setEventDetails] = useState(getEventDetails)
  // Event-specific sections loaded from backend
  const [sections, setSections] = useState([])
  // Map of subcontractor service id -> { name, price }
  const [serviceMap, setServiceMap] = useState({})
  // Map of package id -> { name, price }
  const [packageMap, setPackageMap] = useState({})
  // UI mode: 'services' or 'packages'
  const [selectionMode, setSelectionMode] = useState('services')
  // Track if user interacted this session to avoid showing stale pre-selections from storage
  const [hasInteracted, setHasInteracted] = useState(false)

  // Fetch event details to get event_sections
  useEffect(() => {
    const fetchEventSections = async () => {
      if (!currentEventName) return
      try {
        const res = await axios.get(`https://api.eventsease.app/api/events/event-details/${encodeURIComponent(currentEventName)}`)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEventName])

  // When sections load and before any interaction, clear stale selections so nothing appears selected initially
  useEffect(() => {
    if (!hasInteracted) {
      if (Array.isArray(sections) && sections.length > 0) {
        const cleared = {}
        // For dynamic sections, ensure no defaults selected
        sections.forEach((sec, idx) => {
          const isMulti = !!sec?.multi
          if (isMulti) {
            (sec.services || []).forEach((s, sIdx) => {
              const rawId = s?.id ?? s?.serviceId ?? s?.service_id ?? `${idx}_${sIdx}`
              const idStr = String(rawId)
              cleared[idStr] = false
            })
          } else {
            const key = `section_${idx}`
            cleared[key] = undefined
          }
        })
        setSelectedServices(cleared)
      } else {
        // Fallback: clear defaults too
        const cleared = {}
        Object.keys(DEFAULT_RADIO_GROUPS).forEach((k) => { cleared[k] = undefined })
        ;[...DEFAULT_OTHER_SERVICES, ...DEFAULT_ADD_ONS].forEach((s) => { cleared[s.id] = false })
        setSelectedServices(cleared)
      }
    }
  }, [sections, hasInteracted])

  // Fetch all subcontractor services once to build id -> meta map
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const resp = await axios.get('https://api.eventsease.app/subcontractor/getall');
        const eventDate = getEventDetails().eventDate; // Get the selected event date
        const arr = Array.isArray(resp.data) ? resp.data : [];
        const map = {};
        
        arr.forEach(sc => {
          // Check if subcontractor is available on the event date
          const isUnavailable = (sc.unavailableDates || []).some(
            ud => ud.date === eventDate
          );
          
          // Only process services if subcontractor is available
          if (!isUnavailable) {
            (sc.services || []).forEach(svc => {
              const sid = Number(svc.id ?? svc.serviceId ?? svc.service_id);
              if (Number.isFinite(sid)) {
                map[sid] = { 
                  name: svc.name ?? svc.service_name ?? `Service ${sid}`, 
                  price: Number(svc.price ?? svc.service_price ?? 0),
                  subcontractorId: sc.subcontractor_Id, // Keep track of which subcontractor provides this service
                  subcontractorName: sc.businessName || `${sc.user?.firstname} ${sc.user?.lastname}`
                };
              }
            });
          }
        });
        
        setServiceMap(map);
      } catch (e) {
        console.warn('Unable to fetch subcontractor services for mapping', e);
        setServiceMap({});
      }
    };
    
    fetchServices();
  }, []);

  // Fetch all packages once to build id -> meta map
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const resp = await axios.get('https://api.eventsease.app/package/getall')
        const arr = Array.isArray(resp.data) ? resp.data : []
        const map = {}
        arr.forEach(pkg => {
          const pid = Number(pkg.id ?? pkg.packageId ?? pkg.package_id)
          if (Number.isFinite(pid)) {
            map[pid] = { name: pkg.name ?? pkg.package_name ?? `Package ${pid}`, price: Number(pkg.price ?? pkg.package_price ?? 0) }
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

  // Hardcoded service definitions (fallback when no event-specific sections)
  const DEFAULT_RADIO_GROUPS = {
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

  const DEFAULT_OTHER_SERVICES = [
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

  const DEFAULT_ADD_ONS = [
    { id: "led_wall_trusses_7k", label: "LED wall and trusses", price: 7000 },
    { id: "grazing_table_2k", label: "Grazing table", price: 2000 },
    { id: "kakanin_bar_1k", label: "Kakanin bar", price: 1000 },
    { id: "coffee_bar_1k", label: "Coffee bar", price: 1000 },
    { id: "cocktail_mobile_bar_1k", label: "Cocktail mobile bar", price: 1000 },
    { id: "caramel_beer_bar_1k", label: "Caramel beer bar", price: 1000 },
    { id: "desserts_bar_1k", label: "Desserts bar", price: 1000 },
  ]

  // Build dynamic sections from event sections if available
  const USING_EVENT_SECTIONS = Array.isArray(sections) && sections.length > 0
  const DYNAMIC_SECTIONS = (() => {
    if (!USING_EVENT_SECTIONS) return []
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

  const ADD_ONS = USING_EVENT_SECTIONS ? [] : DEFAULT_ADD_ONS

  // Build available packages from event sections (admin-configured). If none, none are shown.
  const AVAILABLE_PACKAGES = (() => {
    if (!USING_EVENT_SECTIONS) return []
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
        byId.set(idNum, { id: idNum, name, price })
      })
      // Legacy shape: packageIds: [id, id]
      ;(sec.packageIds || []).forEach((rawId) => {
        const idNum = Number(rawId)
        if (!Number.isFinite(idNum)) return
        const meta = packageMap[idNum] || {}
        if (!byId.has(idNum)) byId.set(idNum, { id: idNum, name: meta.name || `Package ${idNum}`, price: Number(meta.price || 0) })
      })
    })
    return Array.from(byId.values())
  })()

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
    if (USING_EVENT_SECTIONS) {
      DYNAMIC_SECTIONS.forEach((sec) => {
        sec.options.forEach((opt) => { m[opt.id] = { label: `${sec.label}: ${opt.label}`, price: opt.price } })
      })
    } else {
      Object.entries(DEFAULT_RADIO_GROUPS).forEach(([k, g]) => {
        g.options.forEach((opt) => { m[opt.id] = { label: `${g.label}: ${opt.label}`, price: opt.price } })
      })
      DEFAULT_OTHER_SERVICES.forEach((s) => { m[s.id] = { label: s.label, price: s.price } })
      DEFAULT_ADD_ONS.forEach((s) => { m[s.id] = { label: s.label, price: s.price } })
    }
    return m
  })()

  // Derive selected custom items and total
  const getSelectedCustomItems = () => {
    if (!hasInteracted) return []
    const items = []
    if (USING_EVENT_SECTIONS) {
      DYNAMIC_SECTIONS.forEach((sec) => {
        if (sec.multi) {
          sec.options.forEach((opt) => {
            if (selectedServices[opt.id]) items.push({ id: opt.id, label: `${sec.label}: ${opt.label}`, price: opt.price })
          })
        } else {
          const sel = selectedServices[sec.key]
          if (sel && ALL_OPTIONS_MAP[sel]) {
            const it = ALL_OPTIONS_MAP[sel]
            items.push({ id: sel, label: it.label, price: it.price })
          }
        }
      })
    } else {
      // radios
      Object.entries(DEFAULT_RADIO_GROUPS).forEach(([key, group]) => {
        const sel = selectedServices[key]
        if (sel && ALL_OPTIONS_MAP[sel]) {
          const it = ALL_OPTIONS_MAP[sel]
          items.push({ id: sel, label: it.label, price: it.price })
        }
      })
      // checkboxes
      ;[...DEFAULT_OTHER_SERVICES, ...DEFAULT_ADD_ONS].forEach((s) => {
        if (selectedServices[s.id]) items.push({ id: s.id, label: s.label, price: s.price })
      })
    }
    return items
  }

  const selectedCustomItems = getSelectedCustomItems()
  const customTotal = selectedCustomItems.reduce((sum, it) => sum + (Number(it.price) || 0), 0)

  const selectedPkg = AVAILABLE_PACKAGES.find((p) => Number(p.id) === Number(selectedPackage))
  const displayedTotal = selectedPkg ? selectedPkg.price : (hasInteracted ? customTotal : 0)

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
        selectedServices,
        selectedPackage
      })
    }

    try {
      await axios.post(`https://api.eventsease.app/form-draft/save`, body, {
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch (error) {
      console.error("Error fetching form progress:", error)
      throw error // rethrow so beforeNavigate can block navigation
    }
  }

  // Handlers
  const handleRadioChange = (groupKey, optionId) => {
    setHasInteracted(true)
    setSelectedServices((prev) => ({
      ...prev,
      [groupKey]: optionId,
    }))
    // Choosing custom invalidates selected package
    if (selectedPackage) setSelectedPackage(null)
    if (selectionMode !== 'services') setSelectionMode('services')
  }

  // Handle service checkbox change
  const handleServiceChange = (serviceId) => {
    setHasInteracted(true)
    setSelectedServices((prev) => ({
      ...prev,
      [serviceId]: !prev[serviceId],
    }))
    // Choosing custom invalidates selected package
    if (selectedPackage) setSelectedPackage(null)
    if (selectionMode !== 'services') setSelectionMode('services')
  }

  // Handle package selection
  const handlePackageSelect = (packageId) => {
    setHasInteracted(true)
    setSelectedPackage(packageId)
    // Clear custom selections
    const cleared = {}
    if (USING_EVENT_SECTIONS) {
      DYNAMIC_SECTIONS.forEach((sec) => {
        if (sec.multi) {
          sec.options.forEach((opt) => { cleared[opt.id] = false })
        } else {
          cleared[sec.key] = undefined
        }
      })
    } else {
      Object.keys(DEFAULT_RADIO_GROUPS).forEach((k) => { cleared[k] = undefined })
      const allOptionIds = [...DEFAULT_OTHER_SERVICES, ...DEFAULT_ADD_ONS]
      allOptionIds.forEach((s) => { cleared[s.id] = false })
    }
    setSelectedServices(cleared)
    if (selectionMode !== 'packages') setSelectionMode('packages')
  }

  // Check if user has made a valid selection
  const hasValidSelection = () => {
    if (selectedPackage) return true
    if (USING_EVENT_SECTIONS) {
      // For each required section, ensure selection
      return DYNAMIC_SECTIONS.every((sec) => {
        if (!sec.required) return true
        if (sec.multi) {
          return sec.options.some((opt) => !!selectedServices[opt.id])
        }
        return Boolean(selectedServices[sec.key])
      })
    }
    // Default behavior: all required default groups must be chosen
    return Object.entries(DEFAULT_RADIO_GROUPS).every(([key, group]) => {
      if (!group.required) return true
      return Boolean(selectedServices[key])
    })
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

            {/* Services/Packages Mode Toggle */}
            <div className="services-selection">
              <h2 className="section-title">Select Services</h2>
              <div className="tab-content">
                {selectionMode === 'services' && (
                <div className="custom-services">
                  {USING_EVENT_SECTIONS ? (
                    DYNAMIC_SECTIONS.map((sec) => (
                      <div key={sec.key} className="service-group">
                        <div className="group-title-container">
                          <h3 className="group-title">
                            {sec.label} {sec.required && <span className="required">(Required*)</span>}
                          </h3>
                          {!sec.required && (
                            <button
                              type="button"
                              className="clear-selection-btn"
                              onClick={() => {
                                setHasInteracted(true);
                                if (sec.multi) {
                                  // For multi-select, uncheck all checkboxes in this section
                                  const updatedSelections = {...selectedServices};
                                  sec.options.forEach(opt => {
                                    updatedSelections[opt.id] = false;
                                  });
                                  setSelectedServices(updatedSelections);
                                } else {
                                  // For single-select, clear the radio selection
                                  setSelectedServices(prev => ({
                                    ...prev,
                                    [sec.key]: undefined
                                  }));
                                }
                              }}
                            >
                              Clear Selection
                            </button>
                          )}
                        </div>
                        {(() => {
                          const availableOptions = sec.options.filter(opt => serviceMap[opt.id]);
                          
                          if (availableOptions.length === 0) {
                            return (
                              <div className="w-full p-4 text-center text-gray-500 italic">
                                No services available for the selected date
                              </div>
                            );
                          }
                          
                          return (
                            <div className="group-options">
                              {availableOptions.map((opt) => (
                                sec.multi ? (
                                  <label key={opt.id} className={`option-card ${selectedServices[opt.id] ? "selected" : ""}`}>
                                    <input
                                      type="checkbox"
                                      checked={!!selectedServices[opt.id]}
                                      onChange={() => handleServiceChange(opt.id)}
                                    />
                                    <span>{opt.label}</span>
                                    <span className="option-price">₱{opt.price.toLocaleString()}</span>
                                  </label>
                                ) : (
                                  <label key={opt.id} className={`option-card ${selectedServices[sec.key] === opt.id ? "selected" : ""}`}>
                                    <input
                                      type="radio"
                                      name={sec.key}
                                      checked={selectedServices[sec.key] === opt.id}
                                      onChange={() => handleRadioChange(sec.key, opt.id)}
                                    />
                                    <span>{opt.label}</span>
                                    <span className="option-price">₱{opt.price.toLocaleString()}</span>
                                  </label>
                                )
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    ))) 
                    : (
                    <>
                      {/* Default required radio groups */}
                      {/* {Object.entries(DEFAULT_RADIO_GROUPS).map(([groupKey, group]) => (
                        <div key={groupKey} className="service-group">
                          <div className="group-title-container">
                            <h3 className="group-title">{group.label} <span className="required">(Choose one only, required*)</span></h3>
                            {!group.required && (
                              <button
                                type="button"
                                className="clear-selection-btn"
                                onClick={() => {
                                  setHasInteracted(true);
                                  setSelectedServices(prev => ({
                                    ...prev,
                                    [groupKey]: undefined
                                  }));
                                }}
                              >
                                Clear Selection
                              </button>
                            )}
                          </div>
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

                      //  Optional checkbox groups
                      <div className="service-group">
                        <h3 className="group-title">choose other services you want to include:</h3>
                        <div className="group-options">
                          {DEFAULT_OTHER_SERVICES.map((svc) => (
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
                      </div> */}
                    </>
                  )}
                </div>
                )}

                {/* {selectionMode === 'packages' && (
                <div className="package-options">
                  {AVAILABLE_PACKAGES.length === 0 ? (
                    <div style={{ padding: 12, opacity: 0.7 }}>No packages available for this event.</div>
                  ) : (
                    AVAILABLE_PACKAGES.map((pkg) => (
                      <div
                        key={pkg.id}
                        className={`package-card ${selectedPackage === pkg.id ? "selected" : ""}`}
                        onClick={() => handlePackageSelect(pkg.id)}
                      >
                        <div className="package-icon-container">
                          <div className="package-icon">📦</div>
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
                    ))
                  )}
                </div>
                )} */}
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