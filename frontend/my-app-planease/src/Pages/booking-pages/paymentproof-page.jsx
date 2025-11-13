"use client"

import { useState, useRef, useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import "./styles/paymentproof-page.css"
import Navbar from "../../Components/Navbar"
import Footer from "../../Components/Footer"
import BookingSidePanel from "../../Components/Booking-sidepanel"
import { getCompleteBookingData, clearBookingData, PACKAGES } from "./utils/booking-storage"
import axios from "axios"
import MessageModal from "../../Components/MessageModal"

// Create an axios instance with default configurations
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  }
});

// Add a request interceptor to always include auth token when available
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle common errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.log("Authentication error - You might need to log in again");
      // You could redirect to login here if needed
    }
    return Promise.reject(error);
  }
);

const PaymentProofPage = () => {
  const navigate = useNavigate()
  const { eventName } = useParams()
  const fileInputRef = useRef(null)

  // Get event name from params or sessionStorage as fallback
  const currentEventName = eventName || sessionStorage.getItem("currentEventName") || "Event"
  const storedInfo = sessionStorage.getItem("bookingPersonalInfo");
  const currentEmail = storedInfo ? JSON.parse(storedInfo).email : null;

  const [uploadedFile, setUploadedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [referenceNumber, setReferenceNumber] = useState("")

  // Get booking data for payment amount
  const [bookingData, setBookingData] = useState(getCompleteBookingData)
  const [sections, setSections] = useState([])
  const [serviceMap, setServiceMap] = useState({})
  const [packageMap, setPackageMap] = useState({})

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState("")
  const [pendingNavigation, setPendingNavigation] = useState(false)

  // Refresh booking data when component mounts
  useEffect(() => {
    setBookingData(getCompleteBookingData())
  }, [])
  
  // Fetch event details to get event_sections
  useEffect(() => {
    const fetchEventSections = async () => {
      if (!currentEventName) return
      try {
        const res = await api.get(`/api/events/event-details/${encodeURIComponent(currentEventName)}`)
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
        const resp = await api.get('/subcontractor/getall')
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
        const resp = await api.get('/package/getall')
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

  // Service definitions mirroring selectservice-page.jsx
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
        showModal("Please upload an image file (JPG, PNG, etc.)")
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showModal("File size must be less than 5MB")
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
        showModal("Please upload an image file (JPG, PNG, etc.)")
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showModal("File size must be less than 5MB")
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

  // Helper function to get selected service IDs (subcontractor IDs)
  // Extract numeric service IDs from selectedItems for backend submission
  const extractServiceIds = (items) => {
    if (!items || items.length === 0) return null;
    
    // Extract any numeric IDs from the selected items
    const numericIds = items
      .map(item => {
        // Try to extract a numeric ID from the item.id
        const numId = parseInt(item.id);
        return !isNaN(numId) ? numId : null;
      })
      .filter(id => id !== null);
    
    console.log("Extracted service IDs:", numericIds);
    return numericIds.length > 0 ? numericIds : null;
  }

  // Helper function to get package ID
  const getPackageId = (packageName) => {
    const packageMap = {
      "cherry-blossom": 1,
      tulip: 2,
      rose: 3,
    }
    return packageMap[packageName] || null
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

    if (!personalInfo.firstName || !personalInfo.lastName || !personalInfo.email || !personalInfo.contact) {
      showModal("Missing personal information. Please go back and complete all required fields.")
      return false
    }
    if (!eventDetails.location || !eventDetails.eventDate) {
      showModal("Missing event details. Please go back and complete all required fields.")
      return false
    }
    // Validate selection under new model
    const hasPackage = !!servicesData.selectedPackage
    const hasAnyItem = hasPackage || getSelectedItems().length > 0
    if (!hasAnyItem) {
      showModal("No selection found. Please go back and select services or a package.")
      return false
    }
    return true
  }

  const handleDeleteFormDraft = async () => {
    try {
      const response = await api.delete(`/form-draft/delete/${currentEmail}/${currentEventName}`)
    } catch (error) {
      console.error("Error deleting form draft:", error);
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!uploadedFile) {
      showModal("Please upload your payment proof before submitting")
      return
    }
    if (!referenceNumber.trim()) {
      showModal("Please enter your payment reference number")
      return
    }
    if (!/^\d+$/.test(referenceNumber.trim())) {
      showModal("Payment reference number must contain only numbers")
      return
    }
    if (!validateBookingData()) {
      return
    }
    if (paymentAmount <= 0) {
      showModal("Invalid payment amount. Please check your service selection.")
      return
    }
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        showModal("Please log in to continue")
        setIsSubmitting(false)
        return
      }

      // Get user email
      let userEmail;
      try {
        // Try to get user information from API
        const userResponse = await api.get("/user/getuser");
        userEmail = userResponse.data.email;
      } catch (userError) {
        console.error("Error fetching user from API:", userError);
        // Fall back to the email from booking data
        userEmail = bookingData.personalInfo.email;
        console.log("Using email from booking data:", userEmail);
      }

      console.log("User email for submission:", userEmail);
      console.log("Booking data:", bookingData);

      // Prepare booking transaction data matching the exact DTO structure
      const transactionData = {
        // Personal Information
        firstName: bookingData.personalInfo.firstName,
        lastName: bookingData.personalInfo.lastName,
        email: bookingData.personalInfo.email,
        contact: bookingData.personalInfo.contact,

        // Event Details
        eventName: currentEventName,
        eventId: Number.parseInt(sessionStorage.getItem("currentEventId")) || 1, // Use 1 as default instead of 0
        transactionVenue: bookingData.eventDetails.location,
        transactionDate: convertToSqlDate(bookingData.eventDetails.eventDate),
        transactionNote: bookingData.eventDetails.note || "",
        
        // Additional Event Details
        celebrantName: bookingData.eventDetails.celebrantName || "",
        additionalCelebrants: bookingData.eventDetails.celebrantNameOptional || "",
        projectedAttendees: Number(bookingData.eventDetails.projectedAttendees) || 0,
        budget: Number(bookingData.eventDetails.budget) || 0,

        // Services - Use serviceIds (subcontractor IDs) for custom services
        serviceType: bookingData.servicesData.selectedPackage ? "PACKAGE" : "CUSTOM",
        packageId: bookingData.servicesData.selectedPackage
          ? getPackageId(bookingData.servicesData.selectedPackage)
          : null,
        // Extract service IDs from the selected items if using CUSTOM type
        serviceIds: bookingData.servicesData.selectedPackage ? null : extractServiceIds(selectedItems),

        // Payment Information - matching DTO fields exactly
        paymentNote: `Payment for ${currentEventName} booking - Amount: ${formatAsPeso(paymentAmount)} - Ref: ${referenceNumber}`,
        paymentReferenceNumber: referenceNumber, // Keep as string for DTO, backend will convert
        // paymentReceipt will be set by backend after file upload

        // User
        userEmail: userEmail,
      }

      // console.log("=== TRANSACTION DATA DEBUG ===")
      // console.log("Service Type:", transactionData.serviceType)
      // console.log("Package ID:", transactionData.packageId)
      // console.log("Service IDs (subcontractor IDs):", transactionData.serviceIds)
      // console.log("Payment Amount:", formatAsPeso(paymentAmount))
      // console.log("Transaction Date:", transactionData.transactionDate)
      // console.log("Complete transaction data:", transactionData)

      // Validate selection presence based on new model
      if (transactionData.serviceType === "PACKAGE" && transactionData.packageId === null) {
        showModal("Error: Selected package is invalid. Please go back and select a valid package.")
        setIsSubmitting(false)
        return
      }
      
      if (transactionData.serviceType === "CUSTOM" && (!selectedItems || selectedItems.length === 0)) {
        showModal("Error: No services selected. Please go back and select at least one service.")
        setIsSubmitting(false)
        return
      }
      
      // If using custom services but couldn't extract any valid service IDs, use a fallback approach
      if (transactionData.serviceType === "CUSTOM" && transactionData.serviceIds === null) {
        // Create an array of service names as a fallback
        const serviceNames = selectedItems.map(item => item.label).join(", ");
        transactionData.transactionNote += ` | Selected services: ${serviceNames}`;
        console.log("Using service names as fallback in notes:", serviceNames);
      }

      // Create FormData for multipart request
      const formData = new FormData()
      formData.append("paymentProof", uploadedFile)
      formData.append("bookingData", JSON.stringify(transactionData))

      console.log("FormData contents:")
      console.log("- paymentProof file:", uploadedFile.name, uploadedFile.type, uploadedFile.size)
      console.log("- bookingData JSON:", JSON.stringify(transactionData))

      console.log("Submitting form data to backend...");
      
      // Create a new custom axios instance for multipart form data
      const formApi = axios.create({
        baseURL: API_BASE_URL,
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        }
      });
      
      // Submit to backend with modified headers for multipart data
      const response = await formApi.post("/api/transactions/createBookingTransaction", formData)

      console.log("Response:", response.data)

      if (response.data.success) {
        setSubmitSuccess(true)

        // Clear booking data from sessionStorage
        clearBookingData()

        // Send notification to admins using new endpoint
        try {
          await api.post(
            "/api/notifications/notify-admins",
            null,
            {
              params: { message: `New event booking submitted: ${currentEventName}` }
            }
          )
        } catch (notifyError) {
          console.log("Could not notify admins, but booking was successful:", notifyError.message)
          // Continue since this is optional
        }
        handleDeleteFormDraft()

        // Show success message and redirect
        setTimeout(() => {
          showModal("You successfully booked your request!", true)
        }, 2000)
      }
    } catch (error) {
      console.error("Error submitting booking:", error)
      
      // Enhanced error logging
      console.group('Booking Submission Error')
      console.error("Error object:", error)
      
      // Try to get detailed error info
      if (error.response) {
        console.error("Response status:", error.response.status)
        console.error("Response headers:", error.response.headers)
        console.error("Response data:", error.response.data)
        
        // Handle specific status codes
        let errorMessage = "";
        switch(error.response.status) {
          case 400:
            errorMessage = "The server couldn't process your submission. Please check the data and try again.";
            break;
          case 401:
            errorMessage = "Authentication error. Please log in again and retry.";
            break;
          case 404:
            errorMessage = "Booking endpoint not found. Please contact support.";
            break;
          case 500:
            errorMessage = "Server error while processing your booking. Please try again later.";
            break;
          default:
            // Extract message from response data if available
            errorMessage = error.response.data?.message || 
                         error.response.data?.error || 
                         JSON.stringify(error.response.data) || 
                         "Failed to submit booking. Please try again.";
        }
        showModal(`Error: ${errorMessage}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request)
        showModal("Error: Server did not respond. Please check your internet connection and try again.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error setting up request:", error.message)
        showModal(`Error: ${error.message || "Unknown error occurred"}`);
      }
      
      console.groupEnd()
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle previous button click
  const handlePrevious = () => {
    if (eventName) {
      navigate(`/book/${encodeURIComponent(eventName)}/preview`)
    } else {
      navigate("/book/preview")
    }
  }

  // Check if form is ready for submission
  const isFormReady = () => {
    return referenceNumber.trim() && uploadedFile && !isSubmitting && !submitSuccess && paymentAmount > 0
  }

  // Replace all alert() usages with modal
  const showModal = (message, navigateAfter = false) => {
    setModalMessage(message)
    setModalOpen(true)
    setPendingNavigation(navigateAfter)
  }

  return (
    <>
      <Navbar />
      <div className="booking-container">
        {/* Breadcrumb Navigation */}
        <div className="breadcrumb">
          <Link to="/home">Home</Link> /{" "}
          <Link to={`/event/${encodeURIComponent(currentEventName)}`}>{currentEventName}</Link> / <span>Book Now</span>
        </div>

        <div className="booking-content">
          {/* Side Panel */}
          <BookingSidePanel activeStep="upload-payment" />

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
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-label">Preview</div>
              </div>
              <div className="step-line"></div>
              <div className="step active">
                <div className="step-number">4</div>
                <div className="step-label">Payment</div>
              </div>
            </div>

            {/* Payment Content */}
            <div className="payment-content">
              <h2 className="section-title">
                Payment for {currentEventName} <span className="info-icon">ⓘ</span>
              </h2>

              {/* Payment Amount Summary */}
              <div className="payment-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>{formatAsPeso(subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Budget:</span>
                  <span>₱{String(bookingData?.eventDetails?.budget ?? 0).replace(/[^0-9.]/g, "").length > 0 ? Number(String(bookingData.eventDetails.budget).replace(/[^0-9.]/g, "")).toLocaleString() : "0"}</span>
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
                    <p>⚠️ Invalid payment amount. Please go back and select services.</p>
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
          setModalOpen(false)
          if (pendingNavigation) {
            setPendingNavigation(false)
            navigate("/home")
          }
        }}
        message={modalMessage}
      />
    </>
  )
}

export default PaymentProofPage