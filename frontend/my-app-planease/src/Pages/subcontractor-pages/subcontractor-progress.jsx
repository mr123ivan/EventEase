"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Navbar from '../../Components/Navbar';
import NavPanel from "../../Components/subcon-navpanel";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
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
  CircularProgress,
  IconButton,
  Drawer,
  Divider,
} from "@mui/material"
import { Edit as EditIcon, Refresh as RefreshIcon, Work as WorkIcon, Menu as MenuIcon } from "@mui/icons-material"
import MapViewModal from "../../Components/MapViewModal.jsx"

const SubcontractorProgress = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [updateData, setUpdateData] = useState({
    images: [],
    description: "",
  })
  const [selectedFiles, setSelectedFiles] = useState([])
  const [existingImageUrl, setExistingImageUrl] = useState(null)
  const [userEmail, setUserEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [viewMapModal, setViewMapModal] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        // Decode token to get email (assuming JWT structure)
        const payload = JSON.parse(atob(token.split(".")[1]))
        setUserEmail(payload.email || payload.sub)
        fetchSubcontractorProgress(payload.email || payload.sub)
      } catch (error) {
      }
    }
  }, [])

  const fetchSubcontractorProgress = async (email) => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(`${API_BASE_URL}/api/transactions/subcontractor-progress-by-email/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const progressData = response.data.map((progress) => {
        return {
          id: progress.subcontractorProgressId ? progress.subcontractorProgressId.toString() : progress.transaction_Id.toString(), // Use unique subcontractorProgressId as key, fallback to transaction_Id
          transactionId: progress.transactionId ? progress.transactionId.toString() : progress.transaction_Id.toString(), // Keep transactionId for API calls, fallback to transaction_Id
          eventName: progress.eventName || progress.eventName || ("Event " + (progress.transactionId || progress.transaction_Id)), // Use eventName if available
          clientName: progress.userName || progress.clientName || "N/A", // Prefer userName from transaction data, fallback to clientName from DTO
          subcontractorName: progress.subcontractorName || "N/A", // Add subcontractor name for modal display
          location: progress.transactionVenue || "Location TBD", // Use transactionVenue if available
          eventDate: progress.transactionDate || progress.transactionDate || "",
          transactionStatus: progress.transactionStatus ? progress.transactionStatus.toLowerCase() : "in-progress", // Use actual status if available
          myProgress: {
            progressPercentage: progress.progressPercentage || 0,
            checkInStatus: progress.checkInStatus ? progress.checkInStatus.toLowerCase() : "pending",
            notes: progress.progressNotes || "",
            adminComment: progress.comment || "",
            serviceCategory: progress.subcontractorRole || progress.serviceName || "General Service",
            serviceName: progress.serviceName || progress.serviceName || "General Service",
            subcontractorProgressId: progress.subcontractorProgressId || null,
            imageUrl: progress.progressImageUrl || null,
          },
          totalSubcontractors: 1, // Since this is per subcontractor
          lastUpdate: progress.updatedAt || new Date().toLocaleString(),
        }
      })
      setTransactions(progressData)
    } catch (error) {
    }
  }

  const handleUpdateProgress = (transaction) => {
    setSelectedTransaction(transaction)
    setUpdateData({
      images: [],
      description: transaction.myProgress.notes || "",
    })
    setSelectedFiles([])
    setShowUpdateModal(true)
  }

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files)
    const newFiles = files.filter(file =>
      !selectedFiles.some(existingFile => existingFile.name === file.name && existingFile.size === file.size)
    )
    setSelectedFiles(prev => [...prev, ...newFiles])
    setUpdateData(prev => ({
      ...prev,
      images: [...prev.images, ...newFiles]
    }))
  }

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setUpdateData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmitUpdate = async () => {
    if (selectedTransaction && updateData.description.trim()) {
      setIsSubmitting(true)
      try {
        const token = localStorage.getItem("token")

        if (updateData.images && updateData.images.length > 0) {
          // Use the image upload endpoint for multiple images
          const formData = new FormData()
          updateData.images.forEach((image, index) => {
            formData.append("images", image)
          })
          formData.append("progressPercentage", (selectedTransaction.myProgress.progressPercentage || 0).toString())
          formData.append("checkInStatus", "SUBMITTED_FOR_REVIEW")
          formData.append("notes", updateData.description)
          formData.append("comment", updateData.description) // Add comment parameter for backend compatibility

          await axios.post(
            `${API_BASE_URL}/api/transactions/subcontractor-progress/id/${selectedTransaction.id}/upload-image`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            },
          )
        } else {
          // Use the regular update endpoint without image
          await axios.put(
            `${API_BASE_URL}/api/transactions/subcontractor-progress/id/${selectedTransaction.id}`,
            null,
            {
              params: {
                progressPercentage: selectedTransaction.myProgress.progressPercentage,
                checkInStatus: "SUBMITTED_FOR_REVIEW",
                notes: updateData.description,
                imageUrl: selectedTransaction.myProgress.imageUrl || null,
              },
              headers: {
                Authorization: `Bearer ${token}`,
              },
              withCredentials: true,
            },
          )
        }

        // Refresh data to get updated images
        await fetchSubcontractorProgress(userEmail)

        setShowUpdateModal(false)
        setSelectedTransaction(null)
        setUpdateData({ images: [], description: "" })
        setSelectedFiles([])
      } catch (error) {
      } finally {
        setIsSubmitting(false)
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
      case "submitted for review":
        return "info"
      case "approved":
        return "success"
      case "rejected":
        return "error"
      default:
        return "default"
    }
  }

  return (
    <div className="h-screen grid grid-rows-[auto_1fr]">
      <Navbar />
      {/* Hamburger menu for mobile */}
      <IconButton
        onClick={() => setIsSidebarOpen(true)}
        sx={{
          display: { xs: 'block', md: 'none' },
          position: 'fixed',
          top: 80,
          left: 16,
          zIndex: 50,
          bgcolor: 'white',
          boxShadow: 2
        }}
      >
        <MenuIcon />
      </IconButton>
      <div className="grid lg:grid-cols-[1fr_3fr]">
        <div className="shadow hidden lg:block p-5">
          <NavPanel />
        </div>
        <div className="flex flex-col rounded-lg gap-4 bg-gray-100 md:px-10 md:py-10">
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <WorkIcon sx={{ color: "#FFB22C", fontSize: { xs: 28, md: 32 } }} />
                <div>
                  <Typography variant="h5" component="h1" className="font-bold text-lg md:text-2xl">
                    My Progress Dashboard
                  </Typography>
                  <Typography variant="body2" color="text.secondary" className="text-xs md:text-sm">
                    Track your event assignments and update progress
                  </Typography>
                </div>
              </div>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                sx={{
                  backgroundColor: "#FFB22C",
                  color: "#1a1a1a",
                  width: { xs: '100%', md: 'auto' },
                  "&:hover": { backgroundColor: "#e6a028", color: "#1a1a1a" },
                }}
                onClick={() => fetchSubcontractorProgress(userEmail)}
              >
                Refresh
              </Button>
            </div>

            <Grid container spacing={3} className="mb-6">
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Total Assignments
                    </Typography>
                    <Typography variant="h4" component="p" className="font-bold">
                      {transactions.length}
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
                      {transactions.filter((t) => t.transactionStatus === "in-progress").length}
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
                      {transactions.filter((t) => t.myProgress.checkInStatus === "pending").length}
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
                      {transactions.filter((t) => t.transactionStatus === "completed").length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Desktop Table View - Hidden on mobile */}
            <TableContainer component={Paper} className="shadow rounded-lg" sx={{ display: { xs: 'none', md: 'block' } }}>
              <Table>
                <TableHead sx={{ backgroundColor: "#F1F1FB" }}>
                  <TableRow>
                    <TableCell>Event Details</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Service</TableCell>
                    <TableCell>My Progress</TableCell>
                    <TableCell>Check-in Status</TableCell>
                    <TableCell>Event Status</TableCell>
                    <TableCell>Last Update</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id} hover>
                      <TableCell>
                        <div>
                          <Typography variant="body2" className="font-medium">
                            {transaction.eventName}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              cursor: 'pointer',
                              '&:hover': {
                                color: '#FFB22C',
                                textDecoration: 'underline',
                              },
                            }}
                            onClick={() => {
                              setSelectedLocation(transaction.location);
                              setViewMapModal(true);
                            }}
                          >
                            {transaction.location}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {transaction.eventDate}
                          </Typography>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" className="text-[#667085]">
                          {transaction.clientName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.myProgress.serviceName || transaction.myProgress.serviceCategory}
                          size="small"
                          sx={{ backgroundColor: "#FFB22C", color: "white" }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box className="flex items-center gap-2">
                          <LinearProgress
                            variant="determinate"
                            value={transaction.myProgress.progressPercentage}
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
                            {transaction.myProgress.progressPercentage}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.myProgress.checkInStatus}
                          color={getCheckInColor(transaction.myProgress.checkInStatus)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.transactionStatus.replace("-", " ")}
                          color={getStatusColor(transaction.transactionStatus)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" className="text-[#667085]">
                          {transaction.lastUpdate}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {transaction.myProgress.checkInStatus !== "approved" && (
                          <Button
                            onClick={() => handleUpdateProgress(transaction)}
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
                            {transaction.myProgress.checkInStatus === "pending" ? "Check-in" : "Edit"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Mobile Card View - Shown only on mobile */}
            <Box sx={{ display: { xs: 'block', md: 'none' } }} className="space-y-4">
              {transactions.map((transaction) => (
                <Card key={transaction.id} className="shadow-md">
                  <CardContent>
                    {/* Event Details */}
                    <Typography variant="h6" className="font-medium mb-2">
                      {transaction.eventName}
                    </Typography>

                    {/* Location & Date */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      className="mb-1 cursor-pointer hover:text-amber-500"
                      onClick={() => {
                        setSelectedLocation(transaction.location);
                        setViewMapModal(true);
                      }}
                    >
                      📍 {transaction.location}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" className="block mb-3">
                      📅 {transaction.eventDate}
                    </Typography>

                    <Divider className="my-3" />

                    {/* Client & Service */}
                    <Box className="grid grid-cols-2 gap-2 mb-3">
                      <Box>
                        <Typography variant="caption" color="text.secondary">Client</Typography>
                        <Typography variant="body2" className="font-medium">{transaction.clientName}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" className="block mb-1">Service</Typography>
                        <Chip
                          label={transaction.myProgress.serviceName || transaction.myProgress.serviceCategory}
                          size="small"
                          sx={{ backgroundColor: "#FFB22C", color: "white" }}
                        />
                      </Box>
                    </Box>

                    {/* Progress Bar */}
                    <Box className="mb-3">
                      <Box className="flex justify-between items-center mb-1">
                        <Typography variant="caption" color="text.secondary">
                          My Progress
                        </Typography>
                        <Typography variant="caption" className="font-medium">
                          {transaction.myProgress.progressPercentage}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={transaction.myProgress.progressPercentage}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          "& .MuiLinearProgress-bar": {
                            backgroundColor: "#FFB22C",
                          },
                        }}
                      />
                    </Box>

                    {/* Status Chips */}
                    <Box className="grid grid-cols-2 gap-2 mb-3">
                      <Box>
                        <Typography variant="caption" color="text.secondary" className="block mb-1">
                          Check-in
                        </Typography>
                        <Chip
                          label={transaction.myProgress.checkInStatus}
                          color={getCheckInColor(transaction.myProgress.checkInStatus)}
                          size="small"
                          sx={{ width: '100%' }}
                        />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" className="block mb-1">
                          Status
                        </Typography>
                        <Chip
                          label={transaction.transactionStatus.replace("-", " ")}
                          color={getStatusColor(transaction.transactionStatus)}
                          size="small"
                          sx={{ width: '100%' }}
                        />
                      </Box>
                    </Box>

                    {/* Last Update */}
                    <Typography variant="caption" color="text.secondary" className="block mb-3">
                      Last Update: {transaction.lastUpdate}
                    </Typography>

                    {/* Action Button */}
                    {transaction.myProgress.checkInStatus !== "approved" && (
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => handleUpdateProgress(transaction)}
                        startIcon={<EditIcon />}
                        sx={{
                          backgroundColor: "#FFB22C",
                          color: "#1a1a1a",
                          "&:hover": {
                            backgroundColor: "#e6a028",
                            color: "#1a1a1a"
                          },
                        }}
                      >
                        {transaction.myProgress.checkInStatus === "pending"
                          ? "Check-in"
                          : "Edit Submission"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          </div>
        </div>
      </div>

      <Dialog open={showUpdateModal} onClose={() => setShowUpdateModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTransaction?.myProgress.checkInStatus === "pending" ? "Check-in Progress" : "Edit Submission"}
        </DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Box className="space-y-4 pt-4">
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Business Name
                  </Typography>
                  <Typography variant="body2" className="mt-1">
                    {selectedTransaction.subcontractorName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Service Name
                  </Typography>
                  <Typography variant="body2" className="mt-1">
                    {selectedTransaction.myProgress.serviceName}
                  </Typography>
                </Grid>
              </Grid>

              <TextField
                fullWidth
                type="file"
                label="Upload Images"
                InputLabelProps={{ shrink: true }}
                inputProps={{ accept: "image/*", multiple: true }}
                onChange={handleFileSelect}
                helperText="Upload one or more images of your work progress"
              />

              {selectedFiles.length > 0 && (
                <Box className="mt-4">
                  <Typography variant="body2" color="text.secondary" className="mb-2">
                    Selected Images ({selectedFiles.length}):
                  </Typography>
                  <Box className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedFiles.map((file, index) => (
                      <Box key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Selected ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid #e0e0e0'
                          }}
                        />
                        <Button
                          size="small"
                          onClick={() => removeFile(index)}
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            minWidth: '24px',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 0, 0, 0.8)',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 0, 0, 1)',
                            },
                          }}
                        >
                          ×
                        </Button>
                        <Typography variant="caption" className="block mt-1 text-center">
                          {file.name}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {selectedTransaction?.myProgress.imageUrl && (
                <Box className="mt-4">
                  <Typography variant="body2" color="text.secondary" className="mb-2">
                    Current Images:
                  </Typography>
                  <Box className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {(() => {
                      try {
                        const imageUrls = JSON.parse(selectedTransaction.myProgress.imageUrl);
                        return Array.isArray(imageUrls) ? imageUrls.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Progress image ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '120px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '1px solid #e0e0e0'
                            }}
                          />
                        )) : (
                          <img
                            src={selectedTransaction.myProgress.imageUrl}
                            alt="Current progress"
                            style={{
                              width: '100%',
                              height: '120px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '1px solid #e0e0e0'
                            }}
                          />
                        );
                      } catch (error) {
                        // Fallback for single image URL (backward compatibility)
                        return (
                          <img
                            src={selectedTransaction.myProgress.imageUrl}
                            alt="Current progress"
                            style={{
                              width: '100%',
                              height: '120px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '1px solid #e0e0e0'
                            }}
                          />
                        );
                      }
                    })()}
                  </Box>
                </Box>
              )}

              <Box className="mb-3">
                <Typography variant="body2" color="text.secondary" className="mb-1">
                  Admin Comment
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={selectedTransaction?.myProgress.adminComment || "No comment from admin yet"}
                  InputProps={{ readOnly: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f5f5f5',
                    }
                  }}
                />
              </Box>

              <Box className="mb-3">
                <Typography variant="body2" color="text.secondary" className="mb-1">
                  Your Description {selectedTransaction?.myProgress.checkInStatus !== "approved" && <EditIcon sx={{ fontSize: 16, ml: 1, color: "#FFB22C" }} />}
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Description"
                  value={updateData.description}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, description: e.target.value }))}
                  InputProps={{ readOnly: selectedTransaction?.myProgress.checkInStatus === "approved" }}
                  placeholder="Describe your current progress and any updates..."
                  required
                />
              </Box>

              <Box className="flex justify-end gap-4 pt-4">
                <Button variant="outlined" onClick={() => setShowUpdateModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmitUpdate}
                  disabled={isSubmitting}
                  sx={{
                    backgroundColor: "#FFB22C",
                    color: "#1a1a1a",
                    "&:hover": { backgroundColor: "#e6a028", color: "#1a1a1a" },
                  }}
                >
                  {isSubmitting ? <CircularProgress size={20} /> : (selectedTransaction.myProgress.checkInStatus === "pending" ? "Submit Check-in" : "Update Submission")}
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <MapViewModal
        open={viewMapModal}
        onClose={() => setViewMapModal(false)}
        location={selectedLocation}
      />

      <Drawer
        anchor="left"
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            backgroundColor: '#f8f9fa',
            borderRight: '1px solid #e0e0e0'
          }
        }}
      >
        <div className="p-5">
          <NavPanel />
        </div>
      </Drawer>
    </div>
  )
}

export default SubcontractorProgress
