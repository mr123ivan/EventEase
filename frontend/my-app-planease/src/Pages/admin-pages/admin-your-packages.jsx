"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import AdminSideBar from "../../Components/admin-sidebar.jsx"
import { Dialog } from "@headlessui/react"
import Navbar from "../../Components/Navbar"
import { Snackbar, Alert, IconButton, Drawer } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AdminPackages = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [packages, setPackages] = useState([])
  const [allSubcontractors, setAllSubcontractors] = useState([])
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showServicesModal, setShowServicesModal] = useState(false)
  const [selectedServices, setSelectedServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formData, setFormData] = useState({
    packageName: "",
    packagePrice: "",
    packageDescription: "",
  })

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
    fetchPackages()
    fetchSubcontractors()
  }, [])

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await axios.get(`${API_BASE_URL}/package/getall`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Group packages by packageName to avoid duplicates
      const uniquePackages = response.data.reduce((acc, current) => {
        const existing = acc.find((item) => item.packageName === current.packageName)
        if (!existing) {
          acc.push(current)
        }
        return acc
      }, [])
      setPackages(uniquePackages)
    } catch (error) {
      console.error("Error fetching packages:", error)
      setSnackbar({
        open: true,
        message: "Error fetching packages",
        severity: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchSubcontractors = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(`${API_BASE_URL}/subcontractor/getall`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      console.log("Subcontractors data:", response.data)
      setAllSubcontractors(response.data)
    } catch (error) {
      console.error("Error fetching subcontractors:", error)
      setSnackbar({
        open: true,
        message: "Error fetching subcontractors",
        severity: "error",
      })
    }
  }

  const fetchPackageServices = async (packageName) => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(`${API_BASE_URL}/package/getServices/${packageName}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setSelectedServices(response.data)
    } catch (error) {
      console.error("Error fetching package services:", error)
      setSnackbar({
        open: true,
        message: "Error fetching package services",
        severity: "error",
      })
    }
  }

  const handleAddPackage = () => {
    setFormData({
      packageName: "",
      packagePrice: "",
      packageDescription: "",
    })
    setSelectedServices([])
    setImageFile(null)
    setImagePreview(null)
    setIsEditing(false)
    setShowModal(true)
  }

  const handleEditPackage = (pkg) => {
    setFormData({
      packageId: pkg.packageId,
      packageName: pkg.packageName,
      packagePrice: pkg.packagePrice,
      packageDescription: pkg.packageDescription,
    })
    setSelectedPackage(pkg)
    setImageFile(null)
    setImagePreview(pkg.packageImage || null)
    setIsEditing(true)
    fetchPackageServices(pkg.packageName)
    setShowModal(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadPackageImage = async (packageId) => {
    if (!imageFile) return null

    try {
      setUploadingImage(true)
      const token = localStorage.getItem("token")
      const imageFormData = new FormData()
      imageFormData.append("file", imageFile)

      const response = await axios.post(`${API_BASE_URL}/package/upload/image/${packageId}`, imageFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      return response.data
    } catch (error) {
      console.error("Error uploading image:", error)
      setSnackbar({
        open: true,
        message: "Error uploading package image",
        severity: "error",
      })
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  const handleServiceToggle = (subcontractor) => {
    setSelectedServices((prev) => {
      const exists = prev.find((service) => service.subcontractor_Id === subcontractor.subcontractor_Id)
      if (exists) {
        return prev.filter((service) => service.subcontractor_Id !== subcontractor.subcontractor_Id)
      } else {
        return [...prev, subcontractor]
      }
    })
  }

  // Helper function to get the correct email from subcontractor object
  const getSubcontractorEmail = (subcontractor) => {
    // Try different possible email field paths
    const possibleEmails = [
      subcontractor.userId?.email,
      subcontractor.user?.email,
      subcontractor.user?.user_email,
      subcontractor.subcontractor_email,
      subcontractor.email,
      subcontractor.userEmail,
    ]

    const email = possibleEmails.find((email) => email && email.trim() !== "")
    console.log("Subcontractor object:", subcontractor)
    console.log("Found email:", email)
    return email
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      let savedPackage

      if (isEditing) {
        // Update package
        const response = await axios.put(`${API_BASE_URL}/package/update`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        savedPackage = response.data
      } else {
        // Create package
        const response = await axios.post(`${API_BASE_URL}/package/create`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        savedPackage = response.data
      }

      // Upload image if selected
      if (imageFile) {
        const imageUploadResult = await uploadPackageImage(savedPackage.packageId)
        if (imageUploadResult) {
          savedPackage = imageUploadResult
        }
      }

      // Add package services if any are selected
      if (selectedServices.length > 0) {
        console.log("Adding services to package:", savedPackage.packageId)
        console.log("Selected services:", selectedServices)

        for (const service of selectedServices) {
          try {
            const email = getSubcontractorEmail(service)

            if (!email) {
              console.error("No email found for subcontractor:", service)
              setSnackbar({
                open: true,
                message: `No email found for service: ${service.subcontractor_serviceName}`,
                severity: "warning",
              })
              continue
            }

            console.log("Adding service with email:", email)

            const addServiceResponse = await axios.post(
              `${API_BASE_URL}/package/addService`,
              {
                packageId: savedPackage.packageId.toString(),
                subcontractorEmail: email,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            )

            console.log("Service added successfully:", addServiceResponse.data)
          } catch (serviceError) {
            console.error("Error adding service:", serviceError)
            console.error("Service error response:", serviceError.response?.data)
            setSnackbar({
              open: true,
              message: `Failed to add service: ${service.subcontractor_serviceName}`,
              severity: "error",
            })
          }
        }
      }

      fetchPackages()
      setShowModal(false)
      setSelectedPackage(null)
      setImageFile(null)
      setImagePreview(null)
      setSnackbar({
        open: true,
        message: isEditing ? "Package updated successfully" : "Package created successfully",
        severity: "success",
      })
    } catch (error) {
      console.error("Error saving package:", error)
      setSnackbar({
        open: true,
        message: "Error saving package",
        severity: "error",
      })
    }
  }

  const handleDeletePackage = async () => {
    if (window.confirm("Are you sure you want to delete this package?")) {
      try {
        const token = localStorage.getItem("token")
        await axios.delete(`${API_BASE_URL}/package/delete/${selectedPackage.packageId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        fetchPackages()
        setShowModal(false)
        setSelectedPackage(null)
        setSnackbar({
          open: true,
          message: "Package deleted successfully",
          severity: "success",
        })
      } catch (error) {
        console.error("Error deleting package:", error)
        setSnackbar({
          open: true,
          message: "Error deleting package",
          severity: "error",
        })
      }
    }
  }

  const handleManageServices = (pkg) => {
    setSelectedPackage(pkg)
    fetchPackageServices(pkg.packageName)
    setShowServicesModal(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading packages...</div>
      </div>
    )
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
            <h2 className="text-xl sm:text-2xl font-bold">Your Packages</h2>
            <button
              onClick={handleAddPackage}
              className="bg-[#FFB22C] hover:bg-[#e6a028] text-white px-4 py-2 rounded-lg font-medium"
            >
              Add Package
            </button>
          </div>

          <div className="bg-white shadow rounded-lg overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#F1F1FB] text-gray-700">
                <tr>
                  <th className="p-3 sm:p-4 whitespace-nowrap">Image</th>
                  <th className="p-3 sm:p-4 whitespace-nowrap">Package Name</th>
                  <th className="p-3 sm:p-4 whitespace-nowrap">Description</th>
                  <th className="p-3 sm:p-4 whitespace-nowrap">Price</th>
                  <th className="p-3 sm:p-4 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {packages?.length > 0 ? (
                  packages.map((pkg) => (
                    <tr key={pkg.packageId} className="hover:bg-gray-100">
                      <td className="p-3 sm:p-4 whitespace-nowrap">
                        {pkg.packageImage ? (
                          <img
                            src={pkg.packageImage || "/placeholder.svg"}
                            alt={pkg.packageName}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-xs text-gray-500">No Image</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3 sm:p-4 whitespace-nowrap text-[#667085] font-medium">{pkg.packageName}</td>
                      <td className="p-3 sm:p-4 text-[#667085] max-w-xs truncate">{pkg.packageDescription}</td>
                      <td className="p-3 sm:p-4 whitespace-nowrap text-[#667085]">
                        ₱{pkg.packagePrice?.toLocaleString()}
                      </td>
                      <td className="p-3 sm:p-4 whitespace-nowrap space-x-2">
                        <button
                          onClick={() => handleEditPackage(pkg)}
                          className="text-[#FFB22C] hover:text-[#e6a028] font-medium"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">
                      No packages found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Add/Edit Package Modal */}
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        className="fixed z-1150 shadow-md inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-white w-full max-w-4xl rounded-lg shadow-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2 mb-6">
              <h3 className="text-xl font-semibold">{isEditing ? "Edit Package" : "Add New Package"}</h3>
              <button onClick={() => setShowModal(false)} className="text-xl hover:cursor-pointer">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Package Name</label>
                  <input
                    type="text"
                    name="packageName"
                    value={formData.packageName}
                    onChange={handleInputChange}
                    className="border p-2 rounded w-full"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Price</label>
                  <input
                    type="number"
                    name="packagePrice"
                    value={formData.packagePrice}
                    onChange={handleInputChange}
                    className="border p-2 rounded w-full"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Package Description</label>
                <textarea
                  name="packageDescription"
                  value={formData.packageDescription}
                  onChange={handleInputChange}
                  className="border p-2 rounded w-full h-24"
                  required
                />
              </div>

              {/* Image Upload Section */}
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">Package Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="package-image-upload"
                  />
                  <label
                    htmlFor="package-image-upload"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Package preview"
                          className="w-32 h-32 object-cover rounded-lg mb-2"
                        />
                        <div className="text-sm text-gray-600">Click to change image</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                          <span className="text-2xl text-gray-400">📷</span>
                        </div>
                        <div className="text-sm text-gray-600">Click to upload package image</div>
                        <div className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</div>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Services Selection */}
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">Select Services</label>
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {allSubcontractors.map((subcontractor) => {
                      const email = getSubcontractorEmail(subcontractor)
                      return (
                        <div key={subcontractor.subcontractor_Id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`service-${subcontractor.subcontractor_Id}`}
                            checked={selectedServices.some(
                              (service) => service.subcontractor_Id === subcontractor.subcontractor_Id,
                            )}
                            onChange={() => handleServiceToggle(subcontractor)}
                            className="rounded"
                            disabled={!email}
                          />
                          <label
                            htmlFor={`service-${subcontractor.subcontractor_Id}`}
                            className={`text-sm cursor-pointer ${!email ? "text-gray-400" : "text-gray-700"}`}
                          >
                            {subcontractor.subcontractor_serviceName} - {subcontractor.subcontractor_serviceCategory}
                            <span className="text-gray-500 ml-1">
                              (₱{subcontractor.subcontractor_service_price?.toLocaleString()})
                            </span>
                            {!email && <span className="text-red-500 ml-1">(No Email)</span>}
                          </label>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleDeletePackage}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded w-full sm:w-auto"
                  >
                    Delete Package
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
                  disabled={uploadingImage}
                  className="bg-[#FFB22C] hover:bg-[#e6a028] text-white px-4 py-2 rounded w-full sm:w-auto disabled:opacity-50"
                >
                  {uploadingImage ? "Uploading..." : isEditing ? "Update Package" : "Create Package"}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Services Management Modal */}
      <Dialog
        open={showServicesModal}
        onClose={() => setShowServicesModal(false)}
        className="fixed z-1150 shadow-md inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex justify-between items-center border-b pb-2 mb-6">
              <h3 className="text-xl font-semibold">Services for {selectedPackage?.packageName}</h3>
              <button onClick={() => setShowServicesModal(false)} className="text-xl hover:cursor-pointer">
                ×
              </button>
            </div>

            <div className="space-y-3">
              {selectedServices?.length > 0 ? (
                selectedServices.map((service, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{service.subcontractorServiceName}</span>
                      <span className="text-gray-500 ml-2">- {service.subcontractorServiceCategory}</span>
                    </div>
                    <span className="text-gray-700">₱{service.subcontractorServicePrice?.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No services assigned to this package</p>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowServicesModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

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

export default AdminPackages
