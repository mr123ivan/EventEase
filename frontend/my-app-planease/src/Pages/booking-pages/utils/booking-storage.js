// Booking storage utility functions

// Storage keys
const STORAGE_KEYS = {
  PERSONAL_INFO: "bookingPersonalInfo",
  EVENT_DETAILS: "bookingEventDetails",
  SERVICES_DATA: "bookingServicesData",
  AVAILABLE_SERVICES: "availableServices",
}

// Personal Info functions
export const savePersonalInfo = (data) => {
  sessionStorage.setItem(STORAGE_KEYS.PERSONAL_INFO, JSON.stringify(data))
}

export const getPersonalInfo = () => {
  const stored = sessionStorage.getItem(STORAGE_KEYS.PERSONAL_INFO)
  return stored
    ? JSON.parse(stored)
    : {
        firstName: "",
        lastName: "",
        email: "",
        contact: "",
      }
}

// Event Details functions
export const saveEventDetails = (data) => {
  sessionStorage.setItem(STORAGE_KEYS.EVENT_DETAILS, JSON.stringify(data))
}

export const getEventDetails = () => {
  const stored = sessionStorage.getItem(STORAGE_KEYS.EVENT_DETAILS)
  return stored
    ? JSON.parse(stored)
    : {
        location: "",
        eventDate: "",
        // Newly added fields for event details
        celebrantName: "", // required
        celebrantNameOptional: "", // optional
        projectedAttendees: "", // required (number)
        budget: "", // required (currency/number)
        note: "",
      }
}

// Services Data functions
export const saveServicesData = (data) => {
  const existing = getServicesData()
  let updated = null;
  if(existing)
    updated = { ...existing, ...data }
  else 
    updated = {...data}
  sessionStorage.setItem(STORAGE_KEYS.SERVICES_DATA, JSON.stringify(updated))
}

export const getServicesData = () => {
  const stored = sessionStorage.getItem(STORAGE_KEYS.SERVICES_DATA)
  return stored
    ? JSON.parse(stored)
    : {
        activeTab: "custom",
        selectedServices: {},
        selectedPackage: null,
        availableServices: [],
        livePackageData: null, // Added for live package data
      }
}

// Individual getters for backward compatibility
export const getActiveTab = () => {
  return getServicesData().activeTab
}

export const getSelectedServices = () => {
  return getServicesData().selectedServices
}

export const getSelectedPackage = () => {
  return getServicesData().selectedPackage
}

// Get live package data
export const getLivePackageData = () => {
  return getServicesData().livePackageData
}

// Available Services functions
export const saveAvailableServices = (services) => {
  sessionStorage.setItem(STORAGE_KEYS.AVAILABLE_SERVICES, JSON.stringify(services))
  // Also update in services data
  const servicesData = getServicesData()
  servicesData.availableServices = services
  sessionStorage.setItem(STORAGE_KEYS.SERVICES_DATA, JSON.stringify(servicesData))
}

export const getAvailableServices = () => {
  const stored = sessionStorage.getItem(STORAGE_KEYS.AVAILABLE_SERVICES)
  return stored ? JSON.parse(stored) : []
}

// Complete booking data
export const getCompleteBookingData = () => {
  return {
    personalInfo: getPersonalInfo(),
    eventDetails: getEventDetails(),
    servicesData: getServicesData(),
  }
}

// Clear all booking data
export const clearBookingData = () => {
  Object.values(STORAGE_KEYS).forEach((key) => {
    sessionStorage.removeItem(key)
  })
}

// Enhanced package definitions with dynamic support
export const PACKAGES = [
  {
    id: "cherry-blossom",
    name: "Cherry Blossom Package",
    price: 300000,
    icon: "🌸",
    description: "Includes catering, venue, and basic photography.",
  },
  {
    id: "tulip",
    name: "Tulip Package",
    price: 450000,
    icon: "🌷",
    description: "Includes premium catering, venue, photography, and band.",
  },
  {
    id: "rose",
    name: "Rose Package",
    price: 350000,
    icon: "🌹",
    description: "Includes catering, venue, photography, and hosting.",
  },
]

// Function to get package details (supports both static and live data)
export const getPackageDetails = (packageId) => {
  // First check if we have live package data
  const liveData = getLivePackageData()
  if (liveData && (liveData.packageId === packageId || liveData.packageName === packageId)) {
    return {
      id: `package-${liveData.packageId}`,
      name: liveData.packageName,
      price: liveData.packagePrice,
      icon: "📦",
      description: liveData.packageDescription || "Custom package",
      packageId: liveData.packageId,
      services: liveData.services || [],
    }
  }

  // Fallback to static packages
  return PACKAGES.find((pkg) => pkg.id === packageId)
}
