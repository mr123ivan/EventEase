"use client"

import { useState, useRef, useEffect } from "react"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import DialogContentText from "@mui/material/DialogContentText"
import Divider from "@mui/material/Divider"
import Navbar from "../../Components/Navbar"
import Typography from "@mui/material/Typography"
import AddIcon from "@mui/icons-material/Add"
import CloseIcon from "@mui/icons-material/Close"
import AdminSideBar from "../../Components/admin-sidebar.jsx"
import "../../index.css"
import {
  Box,
  IconButton,
  Modal,
  Stack,
  TextField,
  Button,
  Grid,
  Card,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  Select,
  MenuItem,
  InputAdornment,
  Chip,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import axios from "axios"
import { KeyboardArrowDown } from "@mui/icons-material"
import RestaurantIcon from "@mui/icons-material/Restaurant"
import CameraAltIcon from "@mui/icons-material/CameraAlt"
import VideocamIcon from "@mui/icons-material/Videocam"
import MusicNoteIcon from "@mui/icons-material/MusicNote"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar"
import LocalFloristIcon from "@mui/icons-material/LocalFlorist"
import SettingsIcon from "@mui/icons-material/Settings"
import EventIcon from "@mui/icons-material/Event"
import SecurityIcon from "@mui/icons-material/Security"
import CleaningServicesIcon from "@mui/icons-material/CleaningServices"
import GroupsIcon from "@mui/icons-material/Groups"
import DesignServicesIcon from "@mui/icons-material/DesignServices"
import MicIcon from "@mui/icons-material/Mic"

// API service functions
const API_BASE_URL = "http://localhost:8080"

// Note: PSGC API removed as location dropdowns are no longer used

// Service categories for the dropdown
const SERVICE_CATEGORIES = [
  "Food & Catering",
  "Photography & Videography",
  "Entertainment & Music",
  "Decoration & Styling",
  "Venue & Location",
  "Transportation",
  "Floral Arrangements",
  "Audio & Visual Equipment",
  "Event Planning & Coordination",
  "Security Services",
  "Cleaning Services",
  "Other Services",
]

const getAuthToken = () => {
  return localStorage.getItem("token") || ""
}

const AdminSubContractors = () => {
  const [activeGallery, setActiveGallery] = useState(null)
  const [isEditingAbout, setIsEditingAbout] = useState(false)
  const [aboutUsText, setAboutUsText] = useState(
    "Hi! We are passionate about bringing delicious food and memorable dining experience to your special events...",
  )
  const [open, setOpen] = useState(false)
  const [editMediaOpen, setEditMediaOpen] = useState(false)
  const [itemData, setItemData] = useState([])

  // State for subcontractors
  const [subcontractors, setSubcontractors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // State for category counts
  const [categoryCounts, setCategoryCounts] = useState(null)
  const [loadingCategoryCounts, setLoadingCategoryCounts] = useState(true)

  // Form fields for new subcontractor
  const [firstname, setFirstname] = useState("")
  const [lastname, setLastname] = useState("")
  const [email, setEmail] = useState("")

  // Phone number fields
  const [phoneNumber, setPhoneNumber] = useState("")
  const [selectedCountry, setSelectedCountry] = useState({
    code: "PH",
    dialCode: "+63",
    flag: "🇵🇭",
    name: "Philippines",
  })
  const [showCountryList, setShowCountryList] = useState(false)
  const [countries, setCountries] = useState([{ code: "PH", dialCode: "+63", flag: "🇵🇭", name: "Philippines" }])

  // Location fields removed

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State for notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  })

  const [openModal, setOpenModal] = useState(false)
  const [selectedSubcontractor, setSelectedSubcontractor] = useState(null)
  const [loadingSubcontractorDetails, setLoadingSubcontractorDetails] = useState(false)
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false)

  // New simplified subcontractor fields
  const [businessName, setBusinessName] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [serviceItems, setServiceItems] = useState([{ name: "", price: "" }])

  // Loading states for delete and view profile operations
  const [isDeletingSubcontractor, setIsDeletingSubcontractor] = useState(false)
  const [isViewingProfile, setIsViewingProfile] = useState(false)

  // Helpers for dynamic services list
  const handleServiceItemChange = (index, field, value) => {
    setServiceItems((prev) => {
      const next = [...prev]
      if (field === "price") {
        const numeric = value.replace(/[^0-9.]/g, "")
        const parts = numeric.split(".")
        if (parts.length > 2) return prev
        if (parts[1] && parts[1].length > 2) return prev
        next[index] = { ...next[index], price: numeric }
      } else {
        next[index] = { ...next[index], [field]: value }
      }
      return next
    })
  }

  const addServiceItem = () => setServiceItems((prev) => [...prev, { name: "", price: "" }])
  const removeServiceItem = (index) => setServiceItems((prev) => prev.filter((_, i) => i !== index))

  const formatPrice = (val) => {
    const num = Number(val)
    if (Number.isNaN(num)) return "0.00"
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // Generate random password function
  const generateRandomPassword = () => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const lowercase = "abcdefghijklmnopqrstuvwxyz"
    const numbers = "0123456789"
    const symbols = "!@#$%^&*"

    let password = ""

    // Ensure at least one character from each category
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += symbols[Math.floor(Math.random() * symbols.length)]

    // Fill remaining 4 characters randomly
    const allChars = uppercase + lowercase + numbers + symbols
    for (let i = 4; i < 8; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)]
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('')
  }

  // Reset form fields to initial state
  const resetForm = () => {
    setFirstname("")
    setLastname("")
    setEmail("")
    setPhoneNumber("")
    setSelectedCountry({ code: "PH", dialCode: "+63", flag: "🇵🇭", name: "Philippines" })

    setBusinessName("")
    setContactPerson("")
    setServiceItems([{ name: "", price: "" }])
  }

  // Check if email already exists in database
  const checkEmailExists = async (email) => {
    try {
      const token = getAuthToken()
      const response = await axios.get(`${API_BASE_URL}/subcontractor/check-email/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data.exists
    } catch (error) {
      console.error("Error checking email:", error)
      // If we can't check, assume it doesn't exist to allow the creation attempt
      return false
    }
  }

  // Create subcontractor with simplified model
  const handleAddSubcontractor = async () => {
    // Basic validation
    if (!businessName.trim() || !contactPerson.trim()) {
      setSnackbar({ open: true, message: "Please provide Business Name and Contact Person.", severity: "warning" })
      return
    }

    // Check if email already exists
    if (email.trim()) {
      const emailExists = await checkEmailExists(email.trim())
      if (emailExists) {
        setSnackbar({
          open: true,
          message: "An account with this email already exists. Please use a different email address.",
          severity: "error"
        })
        return
      }
    }
    const cleanedServices = serviceItems
      .map((s) => ({ name: s.name.trim(), price: s.price.toString().trim() }))
      .filter((s) => s.name && s.price !== "")

    if (cleanedServices.length === 0) {
      setSnackbar({ open: true, message: "Add at least one service with a name and price.", severity: "warning" })
      return
    }

    // Validate prices numeric with up to 2 decimals
    for (const svc of cleanedServices) {
      const num = Number(svc.price)
      if (Number.isNaN(num)) {
        setSnackbar({ open: true, message: `Invalid price for service: ${svc.name}`, severity: "error" })
        return
      }
      // Fix to 2 decimals when sending
      svc.price = Number(num.toFixed(2))
    }

    // Generate random password
    const randomPassword = generateRandomPassword()

    const payload = {
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      email: email.trim(),
      phoneNumber: selectedCountry.dialCode + phoneNumber.trim(),
      businessName: businessName.trim(),
      contactPerson: contactPerson.trim(),
      services: cleanedServices,
      password: randomPassword, // Add the generated password
    }

    try {
      setIsSubmitting(true)
      const token = getAuthToken()
      const response = await axios.post(`${API_BASE_URL}/subcontractor/create-basic`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Handle success response
      if (response.data.success) {
        // Send password via email after successful creation
        try {
          const emailResponse = await axios.post(`${API_BASE_URL}/email/send-password`, {
            email: email.trim(),
            password: randomPassword,
            firstname: firstname.trim(),
            lastname: lastname.trim(),
          })

          if (emailResponse.data.success) {
            setSnackbar({
              open: true,
              message: `${response.data.message || "Subcontractor created successfully."} Password has been sent to their email.`,
              severity: "success",
            })
          } else {
            setSnackbar({
              open: true,
              message: `${response.data.message || "Subcontractor created successfully."} However, failed to send password email.`,
              severity: "warning",
            })
          }
        } catch (emailError) {
          console.error("Error sending password email:", emailError)
          setSnackbar({
            open: true,
            message: `${response.data.message || "Subcontractor created successfully."} However, failed to send password email.`,
            severity: "warning",
          })
        }

        handleClose()
        await fetchSubcontractors()
      } else {
        // Handle backend validation errors
        setSnackbar({
          open: true,
          message: response.data.message || "Failed to create subcontractor.",
          severity: "error",
        })
      }
    } catch (error) {
      console.error("Error creating subcontractor:", error)
      const message = error?.response?.data?.message || "Failed to create subcontractor."
      setSnackbar({ open: true, message, severity: "error" })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete subcontractor by id
  const handleDeleteSubcontractor = async (subcontractorId) => {
    if (!subcontractorId) return

    setIsDeletingSubcontractor(true)

    try {
      const token = getAuthToken()
      await axios.delete(`${API_BASE_URL}/subcontractor/${subcontractorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSnackbar({ open: true, message: "Subcontractor deleted.", severity: "success" })
      await fetchSubcontractors()
    } catch (error) {
      console.error("Error deleting subcontractor:", error)
      const message = error?.response?.data?.message || "Failed to delete subcontractor."
      setSnackbar({ open: true, message, severity: "error" })
    } finally {
      setIsDeletingSubcontractor(false)
    }
  }

  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setOpen(false)
    resetForm()
  }

  const theme = useTheme()
  const countryListRef = useRef(null)

  // Fetch subcontractors on component mount
  useEffect(() => {
    fetchSubcontractors()
    fetchCategoryCounts()
    fetchCountries()
  }, [])

  // Close country dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (countryListRef.current && !countryListRef.current.contains(event.target)) {
        setShowCountryList(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const fetchSubcontractors = async () => {
    setLoading(true)
    try {
      const token = getAuthToken()
      // Use regular axios for backend API calls (with auth headers)
      const response = await axios.get(`${API_BASE_URL}/subcontractor/getall`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      console.log(response.data)
      setSubcontractors(response.data || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching subcontractors:", err)
      setError("Failed to fetch subcontractors. Please try again later.")
      setSubcontractors([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch category counts from backend
  const fetchCategoryCounts = async () => {
    setLoadingCategoryCounts(true)
    try {
      const token = getAuthToken()
      const response = await axios.get(`${API_BASE_URL}/subcontractor/category-counts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      console.log("Category counts:", response.data)
      setCategoryCounts(response.data || [])
    } catch (err) {
      console.error("Error fetching category counts:", err)
      // Fallback to client-side counting if API fails
      setCategoryCounts(null)
    } finally {
      setLoadingCategoryCounts(false)
    }
  }

  const fetchCountries = async () => {
    try {
      const response = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,idd,flag")
      const data = await response.json()

      const formattedCountries = data
        .filter((country) => country.idd && country.idd.root) // Only countries with dial codes
        .map((country) => ({
          code: country.cca2,
          dialCode: country.idd.root + (country.idd.suffixes?.[0] || ""),
          flag: country.flag,
          name: country.name.common,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))

      // Set Philippines as first in the list
      const philippines = formattedCountries.find((c) => c.code === "PH")
      const withoutPH = formattedCountries.filter((c) => c.code !== "PH")

      setCountries([philippines, ...withoutPH].filter(Boolean))
    } catch (error) {
      console.error("Error fetching countries:", error)
      // Keep the default Philippines entry if the API fails
    }
  }

  // Location-related code removed

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }))
  }

  // Image upload handlers removed

  // Group subcontractors by category for summary
  const getSubcontractorsByCategory = () => {
    // If we have category counts from the API, use those
    if (categoryCounts) {
      const categories = {}

      // Transform the API response to the format we need
      categoryCounts.forEach((item) => {
        const category = item.category || "Other"
        categories[category] = Number(item.count)
      })

      return categories
    }

    // Fallback to client-side counting if API data is not available
    const categories = {}

    // Initialize with total count
    categories["total"] = subcontractors.length

    // Count by service category
    subcontractors.forEach((subcontractor) => {
      const category = subcontractor.serviceCategory || "Other"
      if (!categories[category]) {
        categories[category] = 0
      }
      categories[category]++
    })

    return categories
  }

  const subcontractorCategories = getSubcontractorsByCategory()

  // Get icon for each category
  const getCategoryIcon = (category) => {
    // Convert to lowercase and handle plurals by removing trailing 's'
    const normalizedCategory = category.toLowerCase().replace(/s$/, "")

    switch (normalizedCategory) {
      case "food & catering":
      case "catering":
      case "food":
        return <RestaurantIcon fontSize="large" />
      case "photography":
      case "photo":
        return <CameraAltIcon fontSize="large" />
      case "videography":
      case "video":
        return <VideocamIcon fontSize="large" />
      case "decoration & styling":
      case "decoration":
      case "decorator":
      case "design":
        return <DesignServicesIcon fontSize="large" />
      case "transportation":
      case "car rental":
      case "car":
        return <DirectionsCarIcon fontSize="large" />
      case "venue & location":
      case "venue":
      case "location":
        return <LocationOnIcon fontSize="large" />
      case "entertainment & music":
      case "entertainment":
      case "music":
        return <MusicNoteIcon fontSize="large" />
      case "floral arrangements":
      case "floral":
      case "flower":
        return <LocalFloristIcon fontSize="large" />
      case "audio & visual equipment":
      case "audio":
      case "equipment":
        return <SettingsIcon fontSize="large" />
      case "event planning & coordination":
      case "event planning":
      case "event":
      case "planning":
        return <EventIcon fontSize="large" />
      case "security services":
      case "security":
        return <SecurityIcon fontSize="large" />
      case "cleaning services":
      case "cleaning":
        return <CleaningServicesIcon fontSize="large" />
      case "hosting":
      case "host":
        return <MicIcon fontSize="large" />
      case "total":
        return <GroupsIcon fontSize="large" />
      default:
        return <SettingsIcon fontSize="large" />
    }
  }

  // For pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  // Filter subcontractors based on search and category
  const filteredSubcontractors = subcontractors.filter((subcontractor) => {
    const query = searchQuery.toLowerCase()
    const legacyName = subcontractor.user
      ? `${subcontractor.user.firstname} ${subcontractor.user.lastname}`.toLowerCase()
      : ""
    const business = (subcontractor.businessName || "").toLowerCase()
    const contact = (subcontractor.contactPerson || "").toLowerCase()

    const nameMatch = legacyName.includes(query) || business.includes(query) || contact.includes(query)

    const categoryMatch = selectedCategory === "All Categories" || subcontractor.serviceCategory === selectedCategory

    return nameMatch && categoryMatch
  })

  // Get all unique categories for dropdown
  const allCategories = ["All Categories", ...new Set(subcontractors.map((s) => s.serviceCategory).filter(Boolean))]

  // Handle opening and closing the subcontractor details modal
  const handleOpenModal = async (subcontractorId) => {
    setIsViewingProfile(true)
    setLoadingSubcontractorDetails(true)
    setOpenModal(true)

    try {
      const response = await axios.get(`${API_BASE_URL}/subcontractor/${subcontractorId}`)
      setSelectedSubcontractor(response.data)
    } catch (error) {
      console.error("Error fetching subcontractor details:", error)
    } finally {
      setLoadingSubcontractorDetails(false)
      setIsViewingProfile(false)
    }
  }

  const handleCloseModal = () => {
    setOpenModal(false)
    setSelectedSubcontractor(null)
  }

  const handleOpenDeleteConfirmation = () => {
    setOpenDeleteConfirmation(true)
  }

  const handleCloseDeleteConfirmation = () => {
    setOpenDeleteConfirmation(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden md:block w-64 border-r bg-white">
          <AdminSideBar />
        </aside>

        <main className="flex-1 p-4 sm:p-6 md:p-10 bg-gray-50 overflow-auto">
          <h2 className="text-2xl font-bold mb-6">Create Account for Subcontractors</h2>

          {/* Manage Subcontractors Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-semibold">Manage Your Subcontractors</h3>
                <p className="text-sm text-gray-500">Register new vendors and manage existing ones.</p>
              </div>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  bgcolor: "#FFA500",
                  "&:hover": { bgcolor: "#FF8C00" },
                  borderRadius: "8px",
                  boxShadow: "none",
                  fontWeight: "bold",
                }}
                onClick={handleOpen}
              >
                Add Subcontractor
              </Button>
            </div>

            {/* Subcontractor Category Cards */}
            {loading || loadingCategoryCounts ? (
              <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3} sx={{ mt: 2 }}>
                {/* Total subcontractors card */}
                <Grid item xs={12} sm={6} md={4} lg={4}>
                  <Card
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      borderLeft: "6px solid #3498db",
                      height: "100%",
                    }}
                  >
                    <Box sx={{ p: 2, display: "flex", alignItems: "center", width: "100%" }}>
                      <Avatar sx={{ bgcolor: "#E3F2FD", color: "#3498db", width: 56, height: 56, mr: 2 }}>
                        {getCategoryIcon("total")}
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {subcontractorCategories["total"] || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total subcontractors
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>

                {/* Category cards - display top 5 categories */}
                {Object.entries(subcontractorCategories)
                  .filter(([category]) => category !== "total")
                  .sort(([, countA], [, countB]) => countB - countA)
                  .slice(0, 5)
                  .map(([category, count]) => (
                    <Grid item xs={12} sm={6} md={4} lg={4} key={category}>
                      <Card
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          borderLeft: "6px solid #FFA500",
                          height: "100%",
                        }}
                      >
                        <Box sx={{ p: 2, display: "flex", alignItems: "center", width: "100%" }}>
                          <Avatar sx={{ bgcolor: "#FFF3E0", color: "#FFA500", width: 56, height: 56, mr: 2 }}>
                            {getCategoryIcon(category)}
                          </Avatar>
                          <Box>
                            <Typography variant="h4" fontWeight="bold">
                              {count}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {category}
                            </Typography>
                          </Box>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
              </Grid>
            )}
          </div>

          {/* Subcontractors List Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">List of subcontractors</h3>

            {/* Search and Filter */}
            <Box display="flex" justifyContent="space-between" mb={3}>
              <TextField
                placeholder="Search..."
                variant="outlined"
                size="small"
                sx={{ width: 250 }}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(0)
                }}
                InputProps={{
                  sx: { borderRadius: "4px", bgcolor: "#f5f5f5" },
                }}
              />

              <FormControl size="small" sx={{ width: 180 }}>
                <Select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value)
                    setPage(0)
                  }}
                  displayEmpty
                  sx={{ borderRadius: "4px" }}
                >
                  {allCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Subcontractors Table */}
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                <Alert severity="error">{error}</Alert>
              </Box>
            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Business Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact Person
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredSubcontractors
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((subcontractor) => (
                          <tr key={subcontractor.subcontractor_Id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {subcontractor.businessName || "—"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {(subcontractor.services?.length || 0) > 0
                                  ? `${subcontractor.services.length} service(s)`
                                  : "No services"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{subcontractor.contactPerson || "—"}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Button
                                variant="outlined"
                                size="small"
                                color="primary"
                                onClick={() => handleOpenModal(subcontractor.subcontractor_Id)}
                                disabled={isViewingProfile}
                                startIcon={
                                  isViewingProfile ? (
                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                  ) : null
                                }
                              >
                                {isViewingProfile ? "Loading..." : "View Profile"}
                              </Button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                <Box display="flex" justifyContent="center" mt={3}>
                  <div className="flex items-center space-x-1">
                    <button
                      className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                      disabled={page === 0}
                      onClick={() => setPage(page - 1)}
                    >
                      &lt;
                    </button>
                    {[...Array(Math.ceil(filteredSubcontractors.length / rowsPerPage)).keys()].map((number) => (
                      <button
                        key={number}
                        className={`px-3 py-1 rounded-md ${page === number ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                        onClick={() => setPage(number)}
                      >
                        {number + 1}
                      </button>
                    ))}
                    <button
                      className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                      disabled={page >= Math.ceil(filteredSubcontractors.length / rowsPerPage) - 1}
                      onClick={() => setPage(page + 1)}
                    >
                      &gt;
                    </button>
                  </div>
                </Box>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Subcontractor Details Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#f5f5f5", pb: 1 }}>
          <Typography variant="h6" component="div" fontWeight="bold">
            Subcontractor Details
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {loadingSubcontractorDetails ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={4}>
              <CircularProgress />
            </Box>
          ) : selectedSubcontractor ? (
            <Box>
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar
                  src={selectedSubcontractor.user?.profilePicture || "/placeholder.svg"}
                  alt={
                    selectedSubcontractor.user
                      ? `${selectedSubcontractor.user.firstname} ${selectedSubcontractor.user.lastname}`
                      : "Subcontractor"
                  }
                  sx={{ width: 80, height: 80, mr: 2 }}
                />
                <Box>
                  <Typography variant="h6">
                    {selectedSubcontractor.user
                      ? `${selectedSubcontractor.user.firstname} ${selectedSubcontractor.user.lastname}`
                      : "No Name"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedSubcontractor.user?.email || "No email"}
                  </Typography>
                  <Chip
                    icon={getCategoryIcon(selectedSubcontractor.subcontractor_serviceCategory || "Other")}
                    label={selectedSubcontractor.subcontractor_serviceCategory || "Other"}
                    variant="outlined"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box mb={2}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Business Name
                </Typography>
                <Typography variant="body1">{selectedSubcontractor.businessName || "Not specified"}</Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Contact Person
                </Typography>
                <Typography variant="body1">{selectedSubcontractor.contactPerson || "Not specified"}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Services
                </Typography>
                {Array.isArray(selectedSubcontractor.services) && selectedSubcontractor.services.length > 0 ? (
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    {selectedSubcontractor.services.map((svc, idx) => (
                      <li key={idx} style={{ marginBottom: 6 }}>
                        <Typography variant="body2">
                          {svc.name || "Unnamed Service"} — ₱
                          {Number(svc.price || 0).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Typography>
                      </li>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No services listed
                  </Typography>
                )}
              </Box>
            </Box>
          ) : (
            <Typography variant="body1" color="error">
              Failed to load subcontractor details.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ display: "flex", justifyContent: "space-between", px: 3, pb: 2 }}>
          <Button
            variant="contained"
            color="error"
            onClick={handleOpenDeleteConfirmation}
            startIcon={
              isDeletingSubcontractor ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <CloseIcon />
              )
            }
            disabled={loadingSubcontractorDetails || !selectedSubcontractor || isDeletingSubcontractor}
          >
            {isDeletingSubcontractor ? "Deleting..." : "Delete Subcontractor"}
          </Button>
          <Button variant="outlined" onClick={handleCloseModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteConfirmation}
        onClose={handleCloseDeleteConfirmation}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title" sx={{ bgcolor: "#f5f5f5" }}>
          {"Confirm Delete"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this subcontractor? This action cannot be undone.
            {selectedSubcontractor && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2" color="error" sx={{ fontWeight: "bold" }}>
                  {selectedSubcontractor.user
                    ? `${selectedSubcontractor.user.firstname} ${selectedSubcontractor.user.lastname}`
                    : "This subcontractor"}{" "}
                  will be permanently removed as a subcontractor.
                </Typography>
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirmation} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (selectedSubcontractor) {
                handleDeleteSubcontractor(selectedSubcontractor.subcontractor_Id)
                handleCloseDeleteConfirmation()
                handleCloseModal()
              }
            }}
            color="error"
            variant="contained"
            autoFocus
            disabled={isDeletingSubcontractor}
            startIcon={
              isDeletingSubcontractor ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : null
            }
          >
            {isDeletingSubcontractor ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Subcontractor Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: "800px",
            maxHeight: "90vh",
            bgcolor: "#fff",
            borderRadius: "12px",
            boxShadow: 24,
            p: 4,
            overflowY: "auto",
          }}
        >
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight={600}>
              Add Subcontractor
            </Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Form Fields */}
          <Stack spacing={3}>
            {/* First Name and Last Name */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  fullWidth
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  placeholder="John"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  fullWidth
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  placeholder="Doe"
                  required
                />
              </Grid>
            </Grid>

            {/* Email */}
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
            />

            {/* Phone Number with country code */}
            <Box>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Phone Number
              </Typography>
              <Box display="flex">
                <Box position="relative" mr={1}>
                  <Button
                    variant="outlined"
                    onClick={() => setShowCountryList(!showCountryList)}
                    sx={{
                      height: "56px",
                      display: "flex",
                      alignItems: "center",
                      padding: "0 10px",
                      minWidth: "100px",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ marginRight: "8px", fontSize: "1.2rem" }}>{selectedCountry.flag}</span>
                    <span>{selectedCountry.dialCode}</span>
                    <KeyboardArrowDown />
                  </Button>

                  {showCountryList && (
                    <Box
                      ref={countryListRef}
                      sx={{
                        position: "absolute",
                        zIndex: 10,
                        mt: 1,
                        width: 250,
                        maxHeight: 300,
                        overflowY: "auto",
                        bgcolor: "background.paper",
                        boxShadow: 5,
                        borderRadius: 1,
                      }}
                    >
                      <TextField
                        placeholder="Search countries..."
                        fullWidth
                        size="small"
                        sx={{ p: 1, position: "sticky", top: 0, bgcolor: "white", zIndex: 1 }}
                      />
                      {countries.map((country) => (
                        <MenuItem
                          key={country.code}
                          onClick={() => {
                            setSelectedCountry(country)
                            setShowCountryList(false)
                          }}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            py: 1.5,
                          }}
                        >
                          <Box display="flex" alignItems="center">
                            <span style={{ marginRight: "8px", fontSize: "1.2rem" }}>{country.flag}</span>
                            <Typography variant="body2">{country.name}</Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {country.dialCode}
                          </Typography>
                        </MenuItem>
                      ))}
                    </Box>
                  )}
                </Box>

                <TextField
                  fullWidth
                  value={phoneNumber}
                  onChange={(e) => {
                    // Only allow numbers
                    const value = e.target.value.replace(/[^0-9]/g, "")
                    setPhoneNumber(value)
                  }}
                  placeholder="9123456789"
                  required
                  helperText="Enter your number without the country code"
                />
              </Box>
            </Box>

            {/* Simplified Subcontractor Details */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Business Name"
                  fullWidth
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Contact Person"
                  fullWidth
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  required
                />
              </Grid>
            </Grid>

            {/* Dynamic Services List */}
            <Box mt={2}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Services and Pricing
              </Typography>
              {serviceItems.map((item, idx) => (
                <Grid container spacing={2} alignItems="center" key={idx} sx={{ mb: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Service Name"
                      fullWidth
                      value={item.name}
                      onChange={(e) => handleServiceItemChange(idx, "name", e.target.value)}
                      placeholder="e.g., Wedding Catering, Portrait Photography"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Price"
                      fullWidth
                      value={item.price}
                      onChange={(e) => handleServiceItemChange(idx, "price", e.target.value)}
                      placeholder="0.00"
                      required
                      InputProps={{ startAdornment: <InputAdornment position="start">₱</InputAdornment> }}
                      helperText={item.price ? `Preview: ${formatPrice(item.price)}` : "Enter price in PHP"}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => removeServiceItem(idx)}
                      disabled={serviceItems.length === 1}
                      fullWidth
                    >
                      Remove
                    </Button>
                  </Grid>
                </Grid>
              ))}
              <Button variant="text" startIcon={<AddIcon />} onClick={addServiceItem} sx={{ mt: 1 }}>
                Add another service
              </Button>
            </Box>

            {/* Actions */}
            <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
              <Button variant="outlined" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleAddSubcontractor} disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Subcontractor"}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Modal>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default AdminSubContractors
