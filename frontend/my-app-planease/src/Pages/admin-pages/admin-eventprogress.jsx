"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import AdminSideBar from "../../Components/admin-sidebar.jsx"
import Navbar from "../../Components/Navbar"
import {
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  AvatarGroup,
  Tooltip,
} from "@mui/material"
import {
  Edit as EditIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Group as GroupIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Undo as UndoIcon,
} from "@mui/icons-material"

const EventTrackingAdmin = () => {
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [eventNameFilter, setEventNameFilter] = useState("")
  const [ownerFilter, setOwnerFilter] = useState("")
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedSubcontractor, setSelectedSubcontractor] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showSubcontractorModal, setShowSubcontractorModal] = useState(false)
  const [showIndividualUpdateModal, setShowIndividualUpdateModal] = useState(false)
  const [showSubcontractorSelectionModal, setShowSubcontractorSelectionModal] = useState(false)
  const [actionDropdownOpen, setActionDropdownOpen] = useState(false)
  const [loadingMarkComplete, setLoadingMarkComplete] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [images, setImages] = useState([])
  const [updateData, setUpdateData] = useState({
    status: "",
    checkInStatus: "",
    notes: "",
    comment: "",
    progressPercentage: 0,
  })

  useEffect(() => {
    fetchEventsProgress()
  }, [])
  
  // Apply filters to events whenever filter criteria or events data changes
  useEffect(() => {
    if (!events.length) {
      setFilteredEvents([])
      return
    }
    
    let result = [...events]
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(event => event.currentStatus === statusFilter)
    }
    
    // Apply event name filter
    if (eventNameFilter) {
      result = result.filter(event => 
        event.eventName.toLowerCase().includes(eventNameFilter.toLowerCase())
      )
    }
    
    // Apply owner filter
    if (ownerFilter) {
      result = result.filter(event => 
        (event.userName && event.userName.toLowerCase().includes(ownerFilter.toLowerCase())) ||
        (event.userEmail && event.userEmail.toLowerCase().includes(ownerFilter.toLowerCase()))
      )
    }
    
    setFilteredEvents(result)
  }, [events, statusFilter, eventNameFilter, ownerFilter])

  const fetchEventsProgress = async () => {
    try {
      const token = localStorage.getItem("token")
      // Fetch all transactions for admin (no email filter)
      const response = await axios.get("https://api.eventsease.app/api/transactions/getAllTransactions", {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Fetch subcontractor progress data for each transaction
      const eventsData = await Promise.all(
        response.data.map(async (transaction) => {
          try {
            // Fetch event progress including status from backend
            const eventProgressResponse = await axios.get(
              `https://api.eventsease.app/api/transactions/event-progress/${transaction.transaction_Id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            )
            const eventProgressData = eventProgressResponse.data
            console.log(`DEBUG: Event progress data for transaction ${transaction.transaction_Id}:`, eventProgressData)

            // Fetch subcontractor progress data for each transaction
            const subcontractorProgressResponse = await axios.get(
              `https://api.eventsease.app/api/transactions/subcontractor-progress/${transaction.transaction_Id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            )
            const subcontractorProgressData = subcontractorProgressResponse.data
            console.log(`DEBUG: Subcontractor progress data for transaction ${transaction.transaction_Id}:`, subcontractorProgressData)

            // Merge subcontractor data with progress data
            const subcontractors = transaction.subcontractors.map((sub) => {
                const progressData = subcontractorProgressData.find(
                  (progress) => progress.userId === parseInt(sub.subcontractorUserId) &&
                               progress.eventServiceId === sub.eventServiceId
                )
                console.log(`DEBUG: For subcontractor ${sub.subcontractorUserId} (${sub.subcontractorName}), service ${sub.serviceName}, eventServiceId ${sub.eventServiceId}, progressData found:`, progressData)

                return {
                  id: sub.subcontractorUserId.toString(),
                  subcontractorEntityId: sub.subcontractorEntityId || sub.subcontractorUserId, // Add subcontractorEntityId for API calls
                  progressId: progressData?.subcontractorProgressId, // Store the subcontractor progress ID for individual endpoint
                  name: progressData?.subcontractorName || sub.subcontractorName,
                  serviceName: progressData?.subcontractorRole || sub.serviceName,
                  progressPercentage: progressData?.progressPercentage ?? sub.progressPercentage ?? 0,
                  checkInStatus: progressData?.checkInStatus?.toLowerCase() || sub.checkInStatus || "pending",
                  notes: progressData?.progressNotes || sub.notes || "",
                  progressImageUrl: progressData?.progressImageUrl || "",
                  lastUpdate: progressData?.updatedAt || sub.lastUpdate || "",
                  avatar: progressData?.subcontractorAvatar && progressData.subcontractorAvatar.trim() !== ""
                    ? (progressData.subcontractorAvatar.startsWith('http')
                        ? progressData.subcontractorAvatar
                        : `https://api.eventsease.app/uploads/${progressData.subcontractorAvatar}`)
                    : "/placeholder.svg?key=" + sub.subcontractorUserId, // Use avatar from progress data if available
                }
              })

            return {
              id: transaction.transaction_Id.toString(),
              eventName: transaction.eventName || transaction.packages || "N/A",
              userName: transaction.userName || "N/A",
              userEmail: transaction.userEmail || "",
              phoneNumber: transaction.phoneNumber || "",
              subcontractors: subcontractors,
              currentStatus: eventProgressData.currentStatus,
              location: transaction.transactionVenue || "N/A",
              startDate: transaction.transactionDate || "",
              lastUpdate: transaction.lastUpdate || "",
              checkInStatus: eventProgressData.checkInStatus,
              notes: transaction.transactionNote || "",
              progressPercentage: eventProgressData.progressPercentage,
            }
          } catch (error) {
            console.error(`Failed to fetch progress for transaction ${transaction.transaction_Id}:`, error)
            // Fallback to original data if progress fetch fails
            return {
              id: transaction.transaction_Id.toString(),
              eventName: transaction.eventName || transaction.packages || "N/A",
              userName: transaction.userName || "N/A",
              userEmail: transaction.userEmail || "",
              phoneNumber: transaction.phoneNumber || "",
              subcontractors: transaction.subcontractors.map((sub) => ({
                id: sub.subcontractorUserId.toString(),
                subcontractorEntityId: sub.subcontractorEntityId || sub.subcontractorUserId, // Add subcontractorEntityId for API calls
                name: sub.subcontractorName,
                serviceName: sub.serviceName,
                progressPercentage: sub.progressPercentage || 0,
                checkInStatus: sub.checkInStatus || "pending",
                notes: sub.notes || "",
                progressImageUrl: "",
                lastUpdate: sub.lastUpdate || "",
                avatar: "/placeholder.svg?key=" + sub.subcontractorUserId, // Placeholder avatar, replace with actual if available
              })),
              currentStatus: transaction.transactionStatus.toLowerCase(),
              location: transaction.transactionVenue || "N/A",
              startDate: transaction.transactionDate || "",
              lastUpdate: transaction.lastUpdate || "",
              checkInStatus: getOverallCheckInStatus(transaction.subcontractors),
              notes: transaction.transactionNote || "",
              progressPercentage: calculateOverallProgress(transaction.subcontractors),
            }
          }
        })
      )

      setEvents(eventsData)
      setFilteredEvents(eventsData) // Initialize filteredEvents with all events
    } catch (error) {
      console.error("Failed to fetch all transactions for admin:", error)
    }
  }

  const calculateOverallProgress = (subcontractors) => {
    if (subcontractors.length === 1) return subcontractors[0].progressPercentage
    const totalProgress = subcontractors.reduce((sum, sub) => sum + sub.progressPercentage, 0)
    return Math.round(totalProgress / subcontractors.length)
  }

  const getOverallCheckInStatus = (subcontractors) => {
    if (subcontractors.length === 1) return subcontractors[0].checkInStatus
    const allApproved = subcontractors.every((sub) => sub.checkInStatus === "approved")

    if (allApproved) return "completed"
    return "pending"
  }

  const groupSubcontractorsByName = (subcontractors) => {
    const grouped = subcontractors.reduce((acc, sub) => {
      const key = sub.name
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(sub)
      return acc
    }, {})

    return Object.entries(grouped).map(([name, subs]) => ({
      name,
      serviceName: subs[0].serviceName,
      avatar: subs[0].avatar,
      count: subs.length,
      subcontractors: subs
    }))
  }

  const handleUpdateEvent = (event) => {
    setSelectedEvent(event)
    setUpdateData({
      status: event.currentStatus,
      checkInStatus: event.checkInStatus,
      notes: event.notes,
      progressPercentage: event.progressPercentage,
    })
    setShowModal(true)
  }

  const handleViewSubcontractors = (event) => {
    setSelectedEvent(event)
    setShowSubcontractorSelectionModal(true)
  }

  const handleSubmitUpdate = async () => {
    if (selectedEvent) {
      try {
        const token = localStorage.getItem("token")
        await axios.put(
          `https://api.eventsease.app/api/transactions/updateProgress/${selectedEvent.id}`,
          null,
          {
            params: {
              progressPercentage: updateData.progressPercentage,
              message: updateData.notes,
            },
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        // Refetch the events data to get the updated status from backend
        await fetchEventsProgress()
        setShowModal(false)
        setSelectedEvent(null)
      } catch (error) {
        console.error("Failed to update event progress:", error)
      }
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning"
      case "in-progress":
        return "info"
      case "review":
        return "secondary"
      case "completed":
        return "success"
      default:
        return "default"
    }
  }

  const getCheckInColor = (status) => {
    switch (status) {
      case "pending":
        return "warning"
      case "approved":
        return "success"
      case "rejected":
        return "error"
      case "completed":
        return "success"
      default:
        return "default"
    }
  }

  const renderSubcontractorProfiles = (subcontractors) => {
    if (subcontractors.length === 1) {
      return (
        <Box className="flex items-center gap-2">
          <Avatar src={subcontractors[0].avatar} alt={subcontractors[0].name} sx={{ width: 32, height: 32 }} />
          <Typography variant="body2" className="text-[#667085]">
            {subcontractors[0].name}
          </Typography>
        </Box>
      )
    }

    if (subcontractors.length <= 3) {
      return (
        <Tooltip
          title={
            <Box>
              {subcontractors.map((sub) => (
                <Box key={sub.id} className="flex items-center gap-2 py-1">
                  <Avatar src={sub.avatar} alt={sub.name} sx={{ width: 24, height: 24 }} />
                  <Typography variant="body2">{sub.name}</Typography>
                </Box>
              ))}
            </Box>
          }
          arrow
        >
          <Box className="flex items-center">
            <AvatarGroup max={3} sx={{ "& .MuiAvatar-root": { width: 32, height: 32 } }}>
              {subcontractors.map((sub) => (
                <Avatar key={sub.id} src={sub.avatar} alt={sub.name} />
              ))}
            </AvatarGroup>
          </Box>
        </Tooltip>
      )
    }

    return (
      <Tooltip
        title={
          <Box>
            {subcontractors.map((sub) => (
              <Box key={sub.id} className="flex items-center gap-2 py-1">
                <Avatar src={sub.avatar} alt={sub.name} sx={{ width: 24, height: 24 }} />
                <Typography variant="body2">{sub.name}</Typography>
              </Box>
            ))}
          </Box>
        }
        arrow
      >
        <Box className="flex items-center">
          <AvatarGroup max={2} sx={{ "& .MuiAvatar-root": { width: 32, height: 32 } }}>
            {subcontractors.slice(0, 2).map((sub) => (
              <Avatar key={sub.id} src={sub.avatar} alt={sub.name} />
            ))}
            <Avatar sx={{ bgcolor: "#FFB22C", width: 32, height: 32, fontSize: "0.75rem" }}>
              +{subcontractors.length - 2}
            </Avatar>
          </AvatarGroup>
        </Box>
      </Tooltip>
    )
  }

  const handleUpdateSubcontractor = async (event, subcontractor) => {
    setSelectedEvent(event)
    setSelectedSubcontractor(subcontractor)
    setUpdateData({
      status: event.currentStatus,
      checkInStatus: subcontractor.checkInStatus,
      notes: subcontractor.notes,
      comment: "",
      progressPercentage: subcontractor.progressPercentage,
    })

    // Fetch detailed progress data using the individual endpoint
    try {
      const token = localStorage.getItem("token")
      console.log("DEBUG: Calling API with progressId:", subcontractor.progressId)
      const progressResponse = await axios.get(
        `https://api.eventsease.app/api/transactions/subcontractor-progress/id/${subcontractor.progressId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      console.log("DEBUG: Detailed subcontractor progress data fetched:", progressResponse.data)

      // Update subcontractor with fresh data from individual endpoint
      const detailedProgress = progressResponse.data
      setSelectedSubcontractor({
        ...subcontractor,
        name: detailedProgress.subcontractorName,
        serviceName: detailedProgress.subcontractorRole,
        progressPercentage: detailedProgress.progressPercentage,
        checkInStatus: detailedProgress.checkInStatus?.toLowerCase(),
        notes: detailedProgress.progressNotes,
        progressImageUrl: detailedProgress.progressImageUrl,
        lastUpdate: detailedProgress.updatedAt,
        avatar: detailedProgress.subcontractorAvatar,
      })

      // Set images array for carousel
      if (detailedProgress.progressImageUrl) {
        try {
          // First try to parse as JSON (for multiple images)
          const parsedUrls = JSON.parse(detailedProgress.progressImageUrl);
          const imageUrls = Array.isArray(parsedUrls) ? parsedUrls : [detailedProgress.progressImageUrl];

          // Filter out empty/null URLs and ensure they are valid
          const validImageUrls = imageUrls.filter(url => url && url.trim() !== '')

          console.log("DEBUG: Setting images for carousel:", validImageUrls)
          setImages(validImageUrls)
          setCurrentImageIndex(0) // Reset to first image
        } catch (error) {
          // Fallback for single image URL (backward compatibility)
          const imageUrls = [detailedProgress.progressImageUrl].filter(url => url && url.trim() !== '')
          console.log("DEBUG: Setting single image for carousel:", imageUrls)
          setImages(imageUrls)
          setCurrentImageIndex(0)
        }
      } else {
        console.log("DEBUG: No progress image URL found")
        setImages([])
        setCurrentImageIndex(0)
      }
    } catch (error) {
      console.error("Failed to fetch detailed subcontractor progress:", error)
      // Fall back to existing data if individual endpoint fails
    }

    setShowIndividualUpdateModal(true)
  }

  const handleMarkComplete = async (event, subcontractor) => {
    console.log("DEBUG: handleMarkComplete called with:", { event: event.id, subcontractor: subcontractor.name, progressId: subcontractor.progressId, subcontractorEntityId: subcontractor.subcontractorEntityId, subcontractorEmail: subcontractor.subcontractorEmail })

    setLoadingMarkComplete(true)

    try {
      const token = localStorage.getItem("token")

      // Use progressId endpoint if available, otherwise fallback to entity ID or email
      let apiUrl
      if (subcontractor.progressId) {
        apiUrl = `https://api.eventsease.app/api/transactions/subcontractor-progress/id/${subcontractor.progressId}`
      } else if (subcontractor.subcontractorEntityId) {
        apiUrl = `https://api.eventsease.app/api/transactions/subcontractor-progress/${event.id}/${subcontractor.subcontractorEntityId}`
      } else {
        apiUrl = `https://api.eventsease.app/api/transactions/subcontractor-progress/${event.id}/email/${subcontractor.subcontractorEmail}`
      }

      console.log("DEBUG: API URL:", apiUrl)

      const response = await axios.put(
        apiUrl,
        null,
        {
          params: {
            progressPercentage: 100,
            checkInStatus: "approved",
            notes: "Approved by admin - Work completed successfully",
            comment: updateData.comment,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      console.log("DEBUG: API Response:", response)

      if (response.status === 200) {
        console.log("DEBUG: Updating state locally after subcontractor update")
        // Update the state locally to reflect the change immediately
        setEvents((prevEvents) =>
          prevEvents.map((e) =>
            e.id === event.id
              ? {
                  ...e,
                  subcontractors: e.subcontractors.map((sub) =>
                    sub.id === subcontractor.id
                      ? {
                          ...sub,
                          checkInStatus: "approved",
                          progressPercentage: 100,
                          lastUpdate: new Date().toLocaleString(),
                        }
                      : sub
                  ),
                  checkInStatus: getOverallCheckInStatus(
                    e.subcontractors.map((sub) =>
                      sub.id === subcontractor.id
                        ? { ...sub, checkInStatus: "approved" }
                        : sub
                    )
                  ),
                  lastUpdate: new Date().toLocaleString(),
                }
              : e
          )
        )
        console.log("DEBUG: State updated locally")

        // Refetch the events data to get the updated status from backend
        await fetchEventsProgress()
        console.log("DEBUG: Events data refetched successfully")

        // Close the modal after successful completion
        setShowIndividualUpdateModal(false)
        setSelectedEvent(null)
        setSelectedSubcontractor(null)
      } else {
        console.error("Failed to mark subcontractor as complete: Unexpected response status", response.status)
      }
    } catch (error) {
      console.error("Failed to mark subcontractor as complete:", error)
      if (error.response) {
        console.error("Error response:", error.response.data)
        console.error("Error status:", error.response.status)
      }
    } finally {
      setLoadingMarkComplete(false)
    }
  }

  const handleMarkIncomplete = async (event, subcontractor) => {
    console.log("DEBUG: handleMarkIncomplete called with:", { event: event.id, subcontractor: subcontractor.name, progressId: subcontractor.progressId, subcontractorEntityId: subcontractor.subcontractorEntityId, subcontractorEmail: subcontractor.subcontractorEmail })

    setLoadingMarkComplete(true)

    try {
      const token = localStorage.getItem("token")

      // Use progressId endpoint if available, otherwise fallback to entity ID or email
      let apiUrl
      if (subcontractor.progressId) {
        apiUrl = `https://api.eventsease.app/api/transactions/subcontractor-progress/id/${subcontractor.progressId}`
      } else if (subcontractor.subcontractorEntityId) {
        apiUrl = `https://api.eventsease.app/api/transactions/subcontractor-progress/${event.id}/${subcontractor.subcontractorEntityId}`
      } else {
        apiUrl = `https://api.eventsease.app/api/transactions/subcontractor-progress/${event.id}/email/${subcontractor.subcontractorEmail}`
      }

      console.log("DEBUG: API URL:", apiUrl)

      const newProgress = Math.min(selectedSubcontractor.progressPercentage + 20, 100)

      const response = await axios.put(
        apiUrl,
        null,
        {
          params: {
            progressPercentage: newProgress,
            checkInStatus: "pending",
            notes: "Marked as incomplete by admin - Work pending",
            comment: updateData.comment,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      console.log("DEBUG: API Response:", response)

      if (response.status === 200) {
        console.log("DEBUG: Updating state locally after subcontractor marked incomplete")
        // Update the state locally to reflect the change immediately
        setEvents((prevEvents) =>
          prevEvents.map((e) =>
            e.id === event.id
              ? {
                  ...e,
                  subcontractors: e.subcontractors.map((sub) =>
                    sub.id === subcontractor.id
                      ? {
                          ...sub,
                          checkInStatus: "pending",
                          progressPercentage: newProgress,
                          lastUpdate: new Date().toLocaleString(),
                        }
                      : sub
                  ),
                  checkInStatus: getOverallCheckInStatus(
                    e.subcontractors.map((sub) =>
                      sub.id === subcontractor.id
                        ? { ...sub, checkInStatus: "pending" }
                        : sub
                    )
                  ),
                  lastUpdate: new Date().toLocaleString(),
                }
              : e
          )
        )
        console.log("DEBUG: State updated locally after marking incomplete")

        // Refetch the events data to get the updated status from backend
        await fetchEventsProgress()
        console.log("DEBUG: Events data refetched successfully after marking incomplete")

        // Close the modal after successful completion
        setShowIndividualUpdateModal(false)
        setSelectedEvent(null)
        setSelectedSubcontractor(null)
      } else {
        console.error("Failed to mark subcontractor as incomplete: Unexpected response status", response.status)
      }
    } catch (error) {
      console.error("Failed to mark subcontractor as incomplete:", error)
      if (error.response) {
        console.error("Error response:", error.response.data)
        console.error("Error status:", error.response.status)
      }
    } finally {
      setLoadingMarkComplete(false)
    }
  }

  const handleSubmitSubcontractorUpdate = async () => {
    if (selectedEvent && selectedSubcontractor) {
      try {
        const token = localStorage.getItem("token")

        // Use email endpoint if subcontractorEntityId is undefined, otherwise use entity ID endpoint
        const apiUrl = selectedSubcontractor.subcontractorEntityId
          ? `https://api.eventsease.app/api/transactions/subcontractor-progress/${selectedEvent.id}/${selectedSubcontractor.subcontractorEntityId}`
          : `https://api.eventsease.app/api/transactions/subcontractor-progress/${selectedEvent.id}/email/${selectedSubcontractor.subcontractorEmail}`

        await axios.put(
          apiUrl,
          null,
          {
            params: {
              progressPercentage: updateData.progressPercentage,
              checkInStatus: updateData.checkInStatus,
              notes: updateData.notes,
            },
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        // Refetch the events data to get the updated status from backend
        await fetchEventsProgress()
        setShowIndividualUpdateModal(false)
        setSelectedEvent(null)
        setSelectedSubcontractor(null)
      } catch (error) {
        console.error("Failed to update subcontractor progress:", error)
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden md:block w-64 border-r bg-white">
          <AdminSideBar />
        </aside>

        <main className="flex-1 p-4 sm:p-6 md:p-10 bg-gray-50 overflow-auto">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <div>
              <Typography variant="h4" component="h2" className="font-bold">
                Event Tracking Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-1">
                Monitor events in progress and manage subcontractor updates
              </Typography>
            </div>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              sx={{
                backgroundColor: "#FFB22C",
                "&:hover": { backgroundColor: "#e6a028" },
              }}
              onClick={fetchEventsProgress}
            >
              Refresh Status
            </Button>
          </div>

          <Grid container spacing={3} className="mb-6">
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Total Events
                  </Typography>
                  <Typography variant="h4" component="p" className="font-bold">
                    {events.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    In Progress
                  </Typography>
                  <Typography variant="h4" component="p" className="font-bold text-blue-600">
                    {events.filter((e) => e.currentStatus === "in-progress").length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Pending Check-ins
                  </Typography>
                  <Typography variant="h4" component="p" className="font-bold text-orange-600">
                    {events.filter((e) => e.checkInStatus === "pending").length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                  <Typography variant="h4" component="p" className="font-bold text-green-600">
                    {events.filter((e) => e.currentStatus === "completed").length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Filter Controls */}
          <Box className="mb-6 p-4 bg-white rounded-lg shadow-sm">
            <Typography variant="h6" className="mb-4">Filters</Typography>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={4} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status Filter</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status Filter"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in-progress">In Progress</MenuItem>
                    <MenuItem value="review">Under Review</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search by Event Name"
                  variant="outlined"
                  value={eventNameFilter}
                  onChange={(e) => setEventNameFilter(e.target.value)}
                  placeholder="Type to search..."
                />
              </Grid>
              <Grid item xs={12} sm={4} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search by Owner"
                  variant="outlined"
                  value={ownerFilter}
                  onChange={(e) => setOwnerFilter(e.target.value)}
                  placeholder="Name or email..."
                />
              </Grid>
              <Grid item xs={12} sm={12} md={3}>
                <Box display="flex" justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setStatusFilter("all");
                      setEventNameFilter("");
                      setOwnerFilter("");
                    }}
                    sx={{ marginRight: 1 }}
                  >
                    Clear Filters
                  </Button>
                  <Typography variant="subtitle2" className="ml-4 pt-2">
                    Showing {filteredEvents.length} of {events.length} events
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <TableContainer component={Paper} className="shadow rounded-lg">
            <Table>
              <TableHead sx={{ backgroundColor: "#F1F1FB" }}>
                <TableRow>
                  <TableCell>Event Name</TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell>Subcontractor(s)</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Check-in</TableCell>
                  <TableCell>Last Update</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEvents.length > 0 ? filteredEvents.map((event) => (
                  <TableRow key={event.id} hover>
                    <TableCell>
                      <Typography variant="body2" className="font-medium text-[#667085]">
                        {event.eventName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className="text-[#667085]">
                        {event.userName || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
          <Box className="flex items-center gap-2">
            {renderSubcontractorProfiles(groupSubcontractorsByName(event.subcontractors))}
            {groupSubcontractorsByName(event.subcontractors).length > 1 && (
              <Button
                size="small"
                onClick={() => handleViewSubcontractors(event)}
                sx={{
                  color: "#FFB22C",
                  textTransform: "none",
                  fontSize: "0.75rem",
                  "&:hover": {
                    backgroundColor: "rgba(255, 178, 44, 0.1)",
                  },
                }}
              >
                View All ({groupSubcontractorsByName(event.subcontractors).length})
              </Button>
            )}
          </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className="text-[#667085]" noWrap>
                        {event.location}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box className="flex items-center gap-2">
                        <LinearProgress
                          variant="determinate"
                          value={calculateOverallProgress(event.subcontractors)}
                          sx={{
                            width: 64,
                            height: 8,
                            borderRadius: 4,
                            "& .MuiLinearProgress-bar": {
                              backgroundColor: "#FFB22C",
                            },
                          }}
                        />
                        <Typography variant="caption" className="text-gray-600">
                          {calculateOverallProgress(event.subcontractors)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={event.currentStatus.replace("-", " ")}
                        color={getStatusColor(event.currentStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={event.checkInStatus}
                        color={getCheckInColor(event.checkInStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" className="text-[#667085]">
                        {event.lastUpdate}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleViewSubcontractors(event)}
                        size="small"
                        startIcon={<EditIcon />}
                        sx={{
                          color: "#FFB22C",
                          "&:hover": {
                            backgroundColor: "rgba(255, 178, 44, 0.1)",
                            color: "#e6a028",
                          },
                        }}
                      >
                        View Details ({event.subcontractors.length})
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center" className="py-8">
                      <Typography variant="subtitle1" color="text.secondary">
                        No events match your filter criteria
                      </Typography>
                      <Button 
                        variant="text" 
                        color="primary"
                        onClick={() => {
                          setStatusFilter("all");
                          setEventNameFilter("");
                          setOwnerFilter("");
                        }}
                        sx={{ mt: 1 }}
                      >
                        Clear Filters
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </main>
      </div>

      <Dialog open={showSubcontractorSelectionModal} onClose={() => setShowSubcontractorSelectionModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Select Subcontractor to Review</DialogTitle>
        <DialogContent>
          {selectedEvent && selectedEvent.subcontractors.map((sub) => (
            <Box
              key={sub.id}
              className="flex items-center justify-between p-3 border-b cursor-pointer hover:bg-gray-50"
              onClick={() => {
                handleUpdateSubcontractor(selectedEvent, sub);
                setShowSubcontractorSelectionModal(false);
              }}
            >
              <Box className="flex items-center gap-3">
                <Avatar src={sub.avatar} alt={sub.name} sx={{ width: 32, height: 32 }} />
                <Box>
                  <Typography variant="body1" className="font-medium">{sub.name} ({sub.serviceName})</Typography>
                </Box>
              </Box>
              <Box className="flex items-center gap-2">
                <LinearProgress variant="determinate" value={sub.progressPercentage} sx={{ width: 60, height: 6 }} />
                <Typography variant="caption">{sub.progressPercentage}%</Typography>
                <Chip label={sub.checkInStatus} color={getCheckInColor(sub.checkInStatus)} size="small" />
              </Box>
            </Box>
          ))}
        </DialogContent>
      </Dialog>

      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Update Event Progress</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box className="space-y-4 pt-4">
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Event Name
                  </Typography>
                  <Typography variant="body2" className="mt-1">
                    {selectedEvent.eventName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Subcontractor
                  </Typography>
                  <Typography variant="body2" className="mt-1">
                    {selectedEvent.subcontractors[0].name}
                  </Typography>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Event Status</InputLabel>
                    <Select
                      value={updateData.status}
                      label="Event Status"
                      onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="in-progress">In Progress</MenuItem>
                      <MenuItem value="review">Under Review</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Check-in Status</InputLabel>
                    <Select
                      value={updateData.checkInStatus}
                      label="Check-in Status"
                      onChange={(e) => setUpdateData({ ...updateData, checkInStatus: e.target.value })}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <TextField
                fullWidth
                type="number"
                label="Progress Percentage"
                inputProps={{ min: 0, max: 100 }}
                value={updateData.progressPercentage}
                onChange={(e) =>
                  setUpdateData({ ...updateData, progressPercentage: Number.parseInt(e.target.value) || 0 })
                }
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Update Notes"
                value={updateData.notes}
                onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                placeholder="Add notes about the current progress..."
              />

              <Box className="flex justify-end gap-4 pt-4">
                <Button variant="outlined" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmitUpdate}
                  sx={{
                    backgroundColor: "#FFB22C",
                    "&:hover": { backgroundColor: "#e6a028" },
                  }}
                >
                  Update Progress
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={showIndividualUpdateModal}
        onClose={() => setShowIndividualUpdateModal(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box className="flex items-center justify-between">
            <Typography variant="h6">Review Subcontractor Submission</Typography>
            <Chip
              label={selectedSubcontractor?.checkInStatus || "pending"}
              color={getCheckInColor(selectedSubcontractor?.checkInStatus || "pending")}
              size="small"
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedSubcontractor && selectedEvent && (
            <Box className="space-y-6 pt-4">
              {/* Header Info */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" className="mb-1">
                    Event
                  </Typography>
                  <Typography variant="h6" className="font-medium">
                    {selectedEvent.eventName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedEvent.location}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" className="mb-1">
                    Subcontractor
                  </Typography>
                  <Box className="flex items-center gap-3">
                    <Avatar
                      src={selectedSubcontractor.avatar}
                      alt={selectedSubcontractor.name}
                      sx={{ width: 40, height: 40 }}
                    />
                    <Box>
                      <Typography variant="h6" className="font-medium">
                        {selectedSubcontractor.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedSubcontractor.serviceName}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {/* Submission Content */}
              <Box className="bg-gray-50 rounded-lg p-6">
                <Typography variant="h6" className="mb-4 font-medium">
                  Submission Details
                </Typography>

                {selectedSubcontractor.progressImageUrl ? (
                  <Box className="mb-6">
                    <Typography variant="body2" color="text.secondary" className="mb-3">
                      Progress Images
                    </Typography>
                    <Box className="flex justify-center items-center gap-4">
                      <Button
                        variant="outlined"
                        onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                        disabled={images.length <= 1}
                      >
                        ‹
                      </Button>
                      <img
                        src={images[currentImageIndex]}
                        alt={`Subcontractor progress submission ${currentImageIndex + 1}`}
                        style={{
                          maxWidth: '80%',
                          maxHeight: '400px',
                          objectFit: 'contain',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        onError={(e) => {
                          console.error("Failed to load image:", images[currentImageIndex])
                          e.target.src = "/placeholder.svg?key=image-error" // Fallback placeholder
                          e.target.alt = "Image failed to load"
                        }}
                      />
                      <Button
                        variant="outlined"
                        onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                        disabled={images.length <= 1}
                      >
                        ›
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box className="mb-6 text-center py-8">
                    <Typography variant="body1" color="text.secondary">
                      No image submitted
                    </Typography>
                  </Box>
                )}

                <Box className="mb-4">
                  <Typography variant="body2" color="text.secondary" className="mb-2">
                    Description
                  </Typography>
                  <Box className="bg-white p-4 rounded-lg border">
                    <Typography variant="body1">
                      {selectedSubcontractor.notes || "No description provided"}
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Progress
                    </Typography>
                    <Box className="flex items-center gap-2 mt-1">
                      <LinearProgress
                        variant="determinate"
                        value={selectedSubcontractor.progressPercentage}
                        sx={{
                          flex: 1,
                          height: 8,
                          borderRadius: 4,
                          "& .MuiLinearProgress-bar": {
                            backgroundColor: "#FFB22C",
                          },
                        }}
                      />
                      <Typography variant="body2" className="font-medium min-w-[40px]">
                        {selectedSubcontractor.progressPercentage}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body2" className="mt-1">
                      {selectedSubcontractor.lastUpdate || "Not available"}
                    </Typography>
                  </Grid>
                </Grid>

                <Box className="mt-4">
                  <Typography variant="body2" color="text.secondary" className="mb-2">
                    Comment
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Add a comment about this submission..."
                    value={updateData.comment}
                    onChange={(e) => setUpdateData({ ...updateData, comment: e.target.value })}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                      }
                    }}
                  />
                </Box>
              </Box>

              {/* Review Actions */}
              {/* Removed Review Actions section as per user request */}

              {/* Action Buttons */}
              <Box className="flex justify-between items-center pt-4">
                <Button
                  variant="outlined"
                  onClick={() => setShowIndividualUpdateModal(false)}
                >
                  Close Review
                </Button>

                {selectedSubcontractor.checkInStatus === "submitted_for_review" && (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleMarkComplete(selectedEvent, selectedSubcontractor)}
                      disabled={loadingMarkComplete}
                      sx={{
                        backgroundColor: "#4CAF50",
                        color: "white",
                        "&:hover": {
                          backgroundColor: "#45a049",
                        },
                        "&:disabled": {
                          backgroundColor: "#cccccc",
                          color: "#666666",
                        },
                      }}
                    >
                      {loadingMarkComplete ? "Marking Complete..." : "Mark as Complete"}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<UndoIcon />}
                      onClick={() => handleMarkIncomplete(selectedEvent, selectedSubcontractor)}
                      disabled={loadingMarkComplete}
                      sx={{
                        borderColor: "#FFB22C",
                        color: "#FFB22C",
                        "&:hover": {
                          backgroundColor: "rgba(255, 178, 44, 0.1)",
                          borderColor: "#e6a028",
                        },
                        "&:disabled": {
                          borderColor: "#cccccc",
                          color: "#666666",
                        },
                      }}
                    >
                      Mark as Incomplete
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showSubcontractorModal} onClose={() => setShowSubcontractorModal(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box className="flex items-center gap-2">
            <GroupIcon sx={{ color: "#FFB22C" }} />
            Subcontractor Progress Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box className="space-y-4 pt-4">
              <Typography variant="h6" className="mb-4">
                {selectedEvent.eventName} - {selectedEvent.location}
              </Typography>

              {selectedEvent.subcontractors.map((subcontractor, index) => (
                <Accordion key={subcontractor.id} defaultExpanded={index === 0}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box className="flex items-center justify-between w-full mr-4">
                      <Box className="flex items-center gap-3">
                        <Avatar src={subcontractor.avatar} alt={subcontractor.name} sx={{ width: 32, height: 32 }} />
                        <Typography variant="subtitle1" className="font-medium">
                          {subcontractor.name}
                        </Typography>
                        <Chip
                          label={subcontractor.serviceName}
                          size="small"
                          sx={{ backgroundColor: "#FFB22C", color: "white" }}
                        />
                      </Box>
                      <Box className="flex items-center gap-3">
                        <LinearProgress
                          variant="determinate"
                          value={subcontractor.progressPercentage}
                          sx={{
                            width: 80,
                            height: 6,
                            borderRadius: 3,
                            "& .MuiLinearProgress-bar": {
                              backgroundColor: "#FFB22C",
                            },
                          }}
                        />
                        <Typography variant="body2" className="min-w-[40px]">
                          {subcontractor.progressPercentage}%
                        </Typography>
                        <Chip
                          label={subcontractor.checkInStatus}
                          color={getCheckInColor(subcontractor.checkInStatus)}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary" className="mb-1">
                          Last Update
                        </Typography>
                        <Typography variant="body2">{subcontractor.lastUpdate}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary" className="mb-1">
                          Check-in Status
                        </Typography>
                        <Chip
                          label={subcontractor.checkInStatus}
                          color={getCheckInColor(subcontractor.checkInStatus)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        {subcontractor.progressImageUrl && (
                          <Box className="mb-4">
                            <Typography variant="body2" color="text.secondary" className="mb-2">
                              Submission Image
                            </Typography>
                            {(() => {
                              const urlString = subcontractor.progressImageUrl;
                              if (!urlString) return null;

                              let imageUrls = [];

                              // Check if it looks like a JSON array
                              if (urlString.startsWith('[') && urlString.endsWith(']')) {
                                try {
                                  const parsed = JSON.parse(urlString);
                                  if (Array.isArray(parsed)) {
                                    imageUrls = parsed;
                                  } else {
                                    imageUrls = [urlString];
                                  }
                                } catch (error) {
                                  // Manual parsing for malformed JSON
                                  const content = urlString.slice(1, -1); // Remove brackets
                                  const urls = content.split('","').map(url => url.replace(/^"|"$/g, '')); // Split by "," and remove quotes
                                  imageUrls = urls.filter(url => url && url.trim());
                                }
                              } else {
                                // Single URL
                                imageUrls = [urlString];
                              }

                              return imageUrls.map((url, index) => (
                                <img
                                  key={index}
                                  src={url}
                                  alt={`Subcontractor submission ${index + 1}`}
                                  style={{ width: '100%', maxWidth: 300, height: 200, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                                  onError={(e) => {
                                    console.error("Failed to load image:", url);
                                    e.target.src = "/placeholder.svg?key=image-error";
                                    e.target.alt = "Image failed to load";
                                  }}
                                />
                              ));
                            })()}
                          </Box>
                        )}
                        <Typography variant="body2" color="text.secondary" className="mb-1">
                          Progress Notes
                        </Typography>
                        <Typography variant="body2" className="bg-gray-50 p-3 rounded">
                          {subcontractor.notes}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Box className="flex justify-end gap-2">
                          <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => handleUpdateSubcontractor(selectedEvent, subcontractor)}
                            sx={{
                              color: "#FFB22C",
                              borderColor: "#FFB22C",
                              "&:hover": {
                                backgroundColor: "rgba(255, 178, 44, 0.1)",
                                borderColor: "#e6a028",
                              },
                            }}
                          >
                            Update This Subcontractor
                          </Button>
                          {subcontractor.checkInStatus === "submitted_for_review" && (
                            <Button
                              variant="contained"
                              color="success"
                              onClick={() => handleMarkComplete(selectedEvent, subcontractor)}
                              disabled={loadingMarkComplete}
                              sx={{
                                backgroundColor: "#4caf50",
                                "&:hover": {
                                  backgroundColor: "#388e3c",
                                },
                                "&:disabled": {
                                  backgroundColor: "#cccccc",
                                  color: "#666666",
                                },
                              }}
                            >
                              {loadingMarkComplete ? "Marking Complete..." : "Mark as Complete"}
                            </Button>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}

              <Box className="flex justify-end pt-4">
                <Button variant="outlined" onClick={() => setShowSubcontractorModal(false)}>
                  Close
                </Button>
              </Box>
            </Box>  
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EventTrackingAdmin