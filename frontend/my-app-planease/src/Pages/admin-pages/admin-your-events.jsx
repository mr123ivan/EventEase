"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import AdminSideBar from "../../Components/admin-sidebar.jsx"
import { Dialog } from "@headlessui/react"
import Navbar from "../../Components/Navbar"
import { Snackbar, Alert, CircularProgress, IconButton, Drawer } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const YourEvents = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteWarningMessage, setDeleteWarningMessage] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  // Basic event info (simplified)
  const [formData, setFormData] = useState({
    event_name: "",
    event_summary: "",
    event_description: "",
    event_isAvailable: true,
    event_image: "",
    imageFile: undefined,
  })

  // Services builder state
  const [allServices, setAllServices] = useState([]) // fetched and flattened from subcontractors
  const [serviceFilter, setServiceFilter] = useState("")
  // Separate builders
  const [serviceSections, setServiceSections] = useState([
    // { title: "", required: false, multi: false, serviceIds: [] }
  ])
  const [dragServiceId, setDragServiceId] = useState(null)

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  })

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return
    }
    setSnackbar((prev) => ({ ...prev, open: false }))
  }

  useEffect(() => {
    fetchEvents()
    fetchAllServices()
  }, [])

  // Lock body scroll when modals are open
  useEffect(() => {
    if (showModal || showDeleteModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showModal, showDeleteModal])

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/events/getEvents`)
      setEvents(response.data)
    } catch (error) {
      console.error("Error fetching events:", error)
    }
  }

  // Fetch and flatten all subcontractor services for DnD palette
  const fetchAllServices = async () => {
    try {
      const resp = await axios.get(`${API_BASE_URL}/subcontractor/getall`)
      const list = Array.isArray(resp.data) ? resp.data : []
      // Flatten to { id, name, price, subcontractorId, subcontractorName }
      const flattened = list.flatMap((sc) =>
        (sc.services || []).map((svc, idx) => ({
          id: `${sc.subcontractor_Id || sc.id || 'sc'}-${idx}`,
          // If backend provides service id, prefer it
          serviceId: svc.id ?? svc.serviceId ?? null,
          name: svc.name,
          price: svc.price,
          subcontractorId: sc.subcontractor_Id,
          subcontractorName: sc.businessName,
        }))
      )
      setAllServices(flattened)
    } catch (e) {
      console.error("Failed to fetch services palette:", e)
      setAllServices([])
    }
  }

  // Packages UI removed for now

  const handleAddEvent = () => {
    setFormData({
      event_name: "",
      event_summary: "",
      event_description: "",
      event_isAvailable: true,
      event_image: "",
      imageFile: undefined,
    })
    setServiceSections([])
    setSelectedEvent(null)
    setIsEditing(false)
    setShowModal(true)
  }

  const handleEditEvent = (event) => {
    setFormData({
      event_Id: event.event_Id,
      event_name: event.event_name,
      event_summary: event.event_summary,
      event_description: event.event_description || "",
      event_isAvailable: event.event_isAvailable,
      event_image: event.event_image || "",
      imageFile: undefined,
    })

    // If backend later provides persisted sections, hydrate them here
    try {
      const raw = event.event_sections
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
      const array = Array.isArray(parsed) ? parsed : []
      const svcSecs = array
        .filter((s) => Array.isArray(s?.services) && s.services.length > 0)
        .map((s) => ({
          title: s?.title || "",
          required: !!s?.required,
          multi: !!s?.multi,
          serviceIds: (Array.isArray(s?.services) ? s.services : [])
            .map((x) => x?.id ?? x?.serviceId ?? x?.service_id)
            .filter((v) => v !== null && v !== undefined),
        }))
      setServiceSections(svcSecs)
    } catch (e) {
      console.warn('Failed to parse event_sections; defaulting to []', e)
      setServiceSections([])
    }
    setSelectedEvent(event)
    setIsEditing(true)
    setShowModal(true)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  // Image upload handler
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // For editing existing event: upload immediately
      if (isEditing && selectedEvent) {
        setSnackbar({ open: true, message: "Uploading image...", severity: "info" })
        const uploadFormData = new FormData()
        uploadFormData.append("file", file)
        const response = await axios.post(
          `${API_BASE_URL}/api/events/upload/image/${selectedEvent.event_Id}`,
          uploadFormData,
          { headers: { "Content-Type": "multipart/form-data" } },
        )
        if (response.status === 200) {
          setFormData((prev) => ({ ...prev, event_image: response.data.event_image, imageFile: undefined }))
          setSnackbar({ open: true, message: "Image uploaded successfully", severity: "success" })
        }
        return
      }

      // For new events: store temp preview and the file to upload after create
      const tempUrl = URL.createObjectURL(file)
      setFormData((prev) => ({ ...prev, event_image: tempUrl, imageFile: file }))
      setSnackbar({ open: true, message: "Image selected. It will be uploaded when you save the event.", severity: "success" })
    } catch (error) {
      console.error("Failed to handle image upload:", error)
      setSnackbar({ open: true, message: "Failed to upload image.", severity: "error" })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      let savedEvent
      if (isEditing) {
        const { imageFile, event_image, ...rest } = formData
        // Build sections from services builder only
        const svcSectionsDto = (serviceSections || []).map((s) => ({
          title: s.title || "",
          required: !!s.required,
          multi: !!s.multi,
          services: (s.serviceIds || [])
            .filter((id) => id !== null && id !== undefined)
            .map((id) => ({ id })),
        }))
        const payload = { ...rest, event_sections: [...svcSectionsDto] }
        savedEvent = await axios.put(`${API_BASE_URL}/api/events`, payload)
      } else {
        // Create event with sections
        const { imageFile, event_image, ...rest } = formData
        const svcSectionsDto = (serviceSections || []).map((s) => ({
          title: s.title || "",
          required: !!s.required,
          multi: !!s.multi,
          services: (s.serviceIds || [])
            .filter((id) => id !== null && id !== undefined)
            .map((id) => ({ id })),
        }))
        const eventData = { ...rest, event_sections: [...svcSectionsDto] }
        const response = await axios.post(`${API_BASE_URL}/api/events/createEvent`, eventData)
        savedEvent = response.data

        // If there's an image file, upload it after creation
        if (imageFile && savedEvent?.event_Id) {
          const uploadFormData = new FormData()
          uploadFormData.append("file", imageFile)
          await axios.post(`${API_BASE_URL}/api/events/upload/image/${savedEvent.event_Id}`, uploadFormData, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        }
      }

      fetchEvents()
      setShowModal(false)
      setSelectedEvent(null)
      // Revoke temp URL if used
      if (formData.event_image && formData.event_image.startsWith("blob:")) {
        URL.revokeObjectURL(formData.event_image)
      }
    } catch (error) {
      console.error("Error saving event:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteEvent = () => {
    setShowDeleteModal(true)
    setDeleteWarningMessage("")
  }

  const confirmDeleteEvent = async () => {
    setIsDeleting(true)
    try {
      await axios.delete(`${API_BASE_URL}/api/events/${selectedEvent.event_Id}`)
      fetchEvents()
      setShowModal(false)
      setSelectedEvent(null)
      setShowDeleteModal(false)
    } catch (error) {
      console.error("Error deleting event:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const cancelDeleteEvent = () => {
    setShowDeleteModal(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
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
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden md:block w-64 border-r bg-white">
          <AdminSideBar />
        </aside>

        <main className="flex-1 p-4 sm:p-6 md:p-10 bg-gray-50 overflow-auto">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">Your Events</h2>
            <button
              onClick={handleAddEvent}
              className="bg-[#FFB22C] hover:bg-[#e6a028] text-white px-4 py-2 rounded-lg font-medium"
            >
              Add Event
            </button>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white shadow rounded-lg overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#F1F1FB] text-gray-700">
                <tr>
                  <th className="p-3 sm:p-4 whitespace-nowrap">Event Name</th>
                  <th className="p-3 sm:p-4 whitespace-nowrap">Summary</th>
                  <th className="p-3 sm:p-4 whitespace-nowrap">Status</th>
                  <th className="p-3 sm:p-4 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events?.map((event) => (
                  <tr key={event.event_Id} className="hover:bg-gray-100">
                    <td className="p-3 sm:p-4 whitespace-nowrap text-[#667085] font-medium">{event.event_name}</td>
                    <td className="p-3 sm:p-4 text-[#667085] max-w-xs truncate">{event.event_summary}</td>
                    <td className="p-3 sm:p-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${event.event_isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                      >
                        {event.event_isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4 whitespace-nowrap">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="text-[#FFB22C] hover:text-[#e6a028] font-medium"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {events?.map((event) => (
              <div key={event.event_Id} className="bg-white shadow rounded-lg p-4">
                <div className="mb-3">
                  <h3 className="font-medium text-base text-gray-900">{event.event_name}</h3>
                </div>
                
                <div className="mb-3">
                  <span className="text-xs font-medium text-gray-500">Summary:</span>
                  <p className="text-sm text-[#667085] mt-1">{event.event_summary}</p>
                </div>
                
                <div className="mb-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${event.event_isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                  >
                    {event.event_isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>
                
                <button
                  onClick={() => handleEditEvent(event)}
                  className="w-full bg-[#FFB22C] hover:bg-[#e6a028] text-white px-4 py-2 rounded-lg font-medium"
                >
                  Edit Event
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Add/Edit Event Modal */}
      <Dialog
        open={showModal}
        onClose={() => { }}
        className="fixed z-1150 shadow-md inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-white w-full max-w-5xl max-h-[90vh] flex flex-col rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex justify-between items-center border-b pb-2 mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold">{isEditing ? "Edit Event" : "Add New Event"}</h3>
              <button onClick={() => setShowModal(false)} className="text-xl hover:cursor-pointer">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 overflow-y-auto">
              {/* Two Column Layout: Left - Basic Info & Available Services, Right - Event Image & Service Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Basic Info & Available Services */}
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">Event Name</label>
                      <input
                        type="text"
                        name="event_name"
                        value={formData.event_name}
                        onChange={handleInputChange}
                        className="border p-2 rounded w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">Event Summary</label>
                      <input
                        type="text"
                        name="event_summary"
                        value={formData.event_summary}
                        onChange={handleInputChange}
                        className="border p-2 rounded w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">Event Description</label>
                      <textarea
                        name="event_description"
                        value={formData.event_description}
                        onChange={handleInputChange}
                        className="border p-2 rounded w-full resize-none h-32 overflow-y-auto"
                        placeholder="Enter detailed description of the event..."
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="event_isAvailable"
                        checked={!!formData.event_isAvailable}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium text-gray-500">Event is Available</label>
                    </div>
                  </div>

                  {/* Available Services */}
                  <div className="border rounded-lg p-3 bg-[#F9FAFB]">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">Available Services</h4>
                      <span className="text-xs text-gray-500">{allServices.length}</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Search services..."
                      className="w-full border p-2 rounded text-sm mb-2"
                      value={serviceFilter}
                      onChange={(e) => setServiceFilter(e.target.value)}
                    />
                    {(() => {
                      const assignedServiceIds = new Set(
                        serviceSections.flatMap((sec) => (sec.serviceIds || []).map((id) => String(id)))
                      )
                      const availableServices = allServices.filter((s) => {
                        const sid = s.serviceId ?? s.id
                        return !assignedServiceIds.has(String(sid))
                      })
                      return (
                        <div className="max-h-72 overflow-auto space-y-2 pr-1">
                          {availableServices
                            .filter((s) => (s.name || '').toLowerCase().includes(serviceFilter.toLowerCase()))
                            .map((svc) => (
                              <div
                                key={svc.id}
                                draggable
                                onDragStart={() => {
                                  setDragServiceId(svc.serviceId ?? svc.id)
                                }}
                                className="bg-white border rounded px-2 py-1 text-sm cursor-grab hover:bg-gray-50"
                                title={`${svc.subcontractorName || ''}`}
                              >
                                <div className="font-medium">{svc.name}</div>
                                <div className="text-xs text-gray-500">{svc.subcontractorName || 'Subcontractor'}</div>
                              </div>
                            ))}
                          {availableServices.length === 0 && (
                            <div className="text-xs text-gray-500">No services available.</div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                </div>

                {/* Right Column: Event Image & Service Sections */}
                <div className="space-y-6">
                  {/* Event Image */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-500 block mb-1">Event Image</label>
                    {(formData.event_image || selectedEvent?.event_image) && (
                      <div className="relative">
                        <img
                          src={formData.event_image || selectedEvent?.event_image}
                          alt="Event preview"
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setFormData((prev) => ({ ...prev, event_image: "", imageFile: undefined })); }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    )}

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        id="event-image-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      <label htmlFor="event-image-upload" className="cursor-pointer flex flex-col items-center">
                        <div className="text-gray-400 mb-2">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-600">Click to upload event image</span>
                        <span className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</span>
                      </label>
                    </div>
                  </div>

                  {/* Service Sections */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-sm">Service Sections (drag services into sections)</h4>
                      <button
                        type="button"
                        onClick={() => setServiceSections((prev) => [...prev, { title: "", required: false, multi: false, serviceIds: [] }])}
                        className="flex items-center gap-1 text-sm bg-[#FFB22C] hover:bg-[#e6a028] text-white px-4 py-2 rounded-md"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                        </svg>
                        Add Section
                      </button>
                    </div>
                    {serviceSections.length === 0 && (
                      <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
                        <div className="text-gray-400 mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0Z" />
                            <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5Zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2Z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">No sections defined yet</p>
                        <p className="text-xs text-gray-500">Click "Add Section" to create your first section</p>
                      </div>
                    )}
                    {serviceSections.map((sec, idx) => (
                      <div key={`svc-sec-${idx}`} className="border rounded-lg p-4 bg-white shadow-sm mb-4">
                        <div className="flex flex-col gap-3 mb-3">
                          {/* Section Title Input */}
                          <div className="w-full">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Section Title</label>
                            <input
                              type="text"
                              placeholder="Enter section title"
                              className="border border-gray-300 p-2 rounded-md w-full text-sm focus:border-[#FFB22C] focus:ring-1 focus:ring-[#FFB22C] focus:outline-none transition-colors"
                              value={sec.title}
                              onChange={(e) => {
                                const val = e.target.value
                                setServiceSections((prev) => prev.map((s, i) => (i === idx ? { ...s, title: val } : s)))
                              }}
                            />
                          </div>

                          {/* Options Row */}
                          <div className="flex flex-wrap justify-between items-center gap-2 border-b border-gray-100 pb-3">
                            <div className="flex flex-wrap gap-4">
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={!!sec.required}
                                  onChange={(e) =>
                                    setServiceSections((prev) => prev.map((s, i) => (i === idx ? { ...s, required: e.target.checked } : s)))
                                  }
                                  className="accent-[#FFB22C] h-4 w-4"
                                />
                                <span className="text-sm">Required</span>
                              </label>

                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={!!sec.multi}
                                  onChange={(e) =>
                                    setServiceSections((prev) => prev.map((s, i) => (i === idx ? { ...s, multi: e.target.checked } : s)))
                                  }
                                  className="accent-[#FFB22C] h-4 w-4"
                                />
                                <span className="text-sm">Multi-select</span>
                              </label>
                            </div>

                            <button
                              type="button"
                              onClick={() => setServiceSections((prev) => prev.filter((_, i) => i !== idx))}
                              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                              </svg>
                              Remove Section
                            </button>
                          </div>
                        </div>
                        <div
                          className="mt-3 min-h-[100px] border-2 border-dashed border-gray-300 rounded-md p-3 bg-gray-50"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault()
                            if (dragServiceId) {
                              setServiceSections((prev) =>
                                prev.map((s, i) =>
                                  i === idx ? { ...s, serviceIds: [...new Set([...(s.serviceIds || []), dragServiceId])] } : s,
                                ),
                              )
                            }
                            setDragServiceId(null)
                          }}
                        >
                          {(!sec.serviceIds || sec.serviceIds.length === 0) && (
                            <div className="text-center py-4 text-sm text-gray-400">Drop services here</div>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {(sec.serviceIds || []).map((sid, si) => {
                              const svc = allServices.find((x) => (x.serviceId ?? x.id) === sid)
                              return (
                                <div key={`${sid}-${si}`} className="flex items-center justify-between gap-2 text-sm bg-white border border-gray-200 px-3 py-1.5 rounded-md shadow-sm">
                                  <span>{svc?.name || 'Service'}</span>
                                  <button
                                    type="button"
                                    className="ml-2 text-red-500 hover:text-red-700"
                                    onClick={() =>
                                      setServiceSections((prev) =>
                                        prev.map((s, i) =>
                                          i === idx ? { ...s, serviceIds: s.serviceIds.filter((_, j) => j !== si) } : s,
                                        ),
                                      )
                                    }
                                  >
                                    ×
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-2">
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleDeleteEvent}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded w-full sm:w-auto"
                  >
                    Delete Event
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#FFB22C] hover:bg-[#e6a028] disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                  {isSubmitting ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Event" : "Create Event")}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Delete Event Modal */}
      <Dialog
        open={showDeleteModal}
        onClose={cancelDeleteEvent}
        className="fixed z-1200 shadow-md inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-white w-full max-w-md rounded-lg shadow-lg p-4 sm:p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Event</h3>
              <p className="text-sm text-gray-500 mb-6">
                {deleteWarningMessage
                  ? deleteWarningMessage
                  : "Are you sure you want to delete this event? This action cannot be undone."}
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={cancelDeleteEvent}
                  disabled={isDeleting}
                  className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 px-4 py-2 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteEvent}
                  disabled={isDeleting || (deleteWarningMessage && deleteWarningMessage.includes("cannot delete"))}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded font-medium flex items-center justify-center gap-2"
                >
                  {isDeleting ? <CircularProgress size={16} color="inherit" /> : null}
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{ zIndex: 9999 }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Drawer
        anchor="left"
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      >
        <AdminSideBar />
      </Drawer>
    </div>
  )
}

export default YourEvents
