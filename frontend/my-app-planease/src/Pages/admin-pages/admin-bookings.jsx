"use client"

// AdminPanel.jsx
import { useEffect, useState } from "react"
import AdminSideBar from "../../Components/admin-sidebar.jsx"
import { Dialog } from "@headlessui/react"
import Navbar from "../../Components/Navbar"
import axios from "axios"
import MapViewModal from "../../Components/MapViewModal.jsx"
import MapIcon from '@mui/icons-material/Map';
import IconButton from '@mui/material/IconButton';
import MenuIcon from "@mui/icons-material/Menu"
import Drawer from "@mui/material/Drawer"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AdminBookings = () => {
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [viewServicesModal, setViewServicesModal] = useState(false)
  const [viewPaymentModal, setViewPaymentModal] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [viewReasonModal, setViewReasonModal] = useState(false)
  const [viewMapModal, setViewMapModal] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  
  // Cancel confirmation modal states
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelConfirmText, setCancelConfirmText] = useState('')
  
  // Complete confirmation modal states
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [completeConfirmText, setCompleteConfirmText] = useState('')
  const [showCompleteSuccess, setShowCompleteSuccess] = useState(false)

  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('')
  const [eventTypeFilter, setEventTypeFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [eventTypes, setEventTypes] = useState([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Debug logging for selectedRequest data
  useEffect(() => {
    if (selectedRequest) {
      console.log("Selected request data:", selectedRequest);
      console.log("Celebrant name:", selectedRequest.celebrantName);
      console.log("Additional celebrants:", selectedRequest.additionalCelebrants);
      console.log("Projected attendees:", selectedRequest.projectedAttendees);
      console.log("Budget:", selectedRequest.budget);
    }
  }, [selectedRequest]);
  
  // Apply filters when transactions or filter values change
  useEffect(() => {
    applyFilters()
  }, [transactions, statusFilter, eventTypeFilter, dateFilter, searchQuery])
  
  const applyFilters = () => {
    let result = [...transactions]
    
    // Apply status filter
    if (statusFilter) {
      result = result.filter(item => item.transactionStatus === statusFilter)
    }
    
    // Apply event type filter
    if (eventTypeFilter) {
      result = result.filter(item => {
        if (eventTypeFilter === 'Wedding') {
          return item.eventName === null || item.eventName === 'Wedding'
        } else {
          return item.eventName === eventTypeFilter
        }
      })
    }
    
    // Apply date filter
    if (dateFilter) {
      result = result.filter(item => {
        const transactionDate = item.transactionDate.split(' - ')[0]
        return transactionDate === dateFilter
      })
    }
    
    // Apply search query for name
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(item => {
        return item.userName.toLowerCase().includes(query)
      })
    }
    
    setFilteredTransactions(result)
  }

  const fetchEventTypes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/events/getEvents`)
      
      // Extract unique event names from the response
      if (response.data && response.data.length > 0) {
        const uniqueEventTypes = response.data.map(event => event.event_name)
        // Add Wedding as an option if not already included (for backward compatibility)
        if (!uniqueEventTypes.includes('Wedding')) {
          uniqueEventTypes.unshift('Wedding')
        }
        setEventTypes(uniqueEventTypes)
        console.log('Available event types:', uniqueEventTypes)
      }
    } catch (error) {
      console.error('Error fetching event types:', error)
      // Fallback to default event types if fetch fails
      setEventTypes(['Wedding', 'Birthday', 'Corporate', 'Anniversary'])
    }
  }

  useEffect(() => {
    fetchData()
    fetchEventTypes()
  }, [])

  const fetchData = async () => {
    axios
      .get(`${API_BASE_URL}/api/transactions/getAllTransactions`)
      .then((res) => {
        // Filter out transactions with PENDING status
        const nonPendingTransactions = res.data.filter(transaction => transaction.transactionStatus !== "PENDING")
        setTransactions(nonPendingTransactions)
        setFilteredTransactions(nonPendingTransactions)
        console.log('All transactions:', res.data)
        console.log('Non-pending transactions:', nonPendingTransactions)
        
        // Extract unique event types for filter dropdown
        const eventTypes = new Set()
        res.data.forEach(item => {
          if (item.eventName) {
            eventTypes.add(item.eventName)
          } else {
            eventTypes.add('Wedding')
          }
        })
      })
      .catch((err) => {
        if (err.response) {
          console.log(`[ERROR] Status: ${err.response.status}, Message: ${err.response.data?.message || "No message"}`)
        } else if (err.request) {
          console.log("[ERROR] No response from server")
        } else {
          console.log(`[ERROR] ${err.message}`)
        }
      })
  }

  const handleCancelClick = () => {
    setShowCancelModal(true)
    setCancelConfirmText('')
  }

  const handleCloseCancelModal = () => {
    setShowCancelModal(false)
    setCancelConfirmText('')
  }

  const handleSubmitCancel = () => {
    if (cancelConfirmText.trim() === 'Cancel') {
      ValidateTransaction('CANCELLED')
      setShowCancelModal(false)
    }
  }
  
  const handleCompleteClick = () => {
    setShowCompleteModal(true)
    setCompleteConfirmText('')
  }
  
  const handleCloseCompleteModal = () => {
    setShowCompleteModal(false)
    setCompleteConfirmText('')
  }
  
  const handleCloseSuccessModal = () => {
    setShowCompleteSuccess(false)
  }

  const handleDeleteClick = () => {
    setShowDeleteModal(true)
    setDeleteConfirmText('')
  }

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setDeleteConfirmText('')
  }

  const handleSubmitDelete = async () => {
    if (deleteConfirmText.trim().toLowerCase() === 'delete') {
      setIsValidating(true)
      try {
        await axios.delete(`http://localhost:8080/api/transactions/${selectedRequest?.transaction_Id}`)
        await fetchData()
        setShowDeleteModal(false)
        setSelectedRequest(null)
      } catch (error) {
        console.error('Error deleting booking:', error.response?.data || error.message)
        // Optionally show an error message here
      } finally {
        setIsValidating(false)
      }
    }
  }
  
  const handleSubmitComplete = () => {
    if (completeConfirmText.trim().toLowerCase() === 'success') {
      ValidateTransaction('COMPLETED')
      setShowCompleteModal(false)
      setShowCompleteSuccess(true)
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setShowCompleteSuccess(false)
      }, 3000)
    }
  }

  const ValidateTransaction = async (validate) => {
    setIsValidating(true)

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/transactions/validateTransaction?transactionId=${selectedRequest?.transaction_Id}&status=${validate}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
      console.log(response.data)
      await fetchData()
    } catch (error) {
      console.error(error.response?.data || error.message)
      // Optionally show an error message here
    } finally {
      setIsValidating(false)
      setSelectedRequest(null)
      setViewServicesModal(false)
      setViewPaymentModal(false)
    }
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
          <h2 className="text-xl sm:text-2xl font-bold mb-4">APPROVED BOOKINGS</h2>
          
          {/* Filter Section */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="text-lg font-medium mb-3">Filters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Status</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="DECLINED">Declined</option>
                  {/* PENDING status removed as those bookings are shown in admin-pendingrequest.jsx */}
                </select>
              </div>
              
              {/* Event Type Filter */}
              <div>
                <label htmlFor="eventTypeFilter" className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                <select
                  id="eventTypeFilter"
                  value={eventTypeFilter}
                  onChange={(e) => setEventTypeFilter(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Event Types</option>
                  {eventTypes.map(eventType => (
                    <option key={eventType} value={eventType}>{eventType}</option>
                  ))}
                </select>
              </div>
              
              {/* Date Filter */}
              <div>
                <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                <input
                  type="date"
                  id="dateFilter"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              {/* Search by Name */}
              <div>
                <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700 mb-1">Search by Name</label>
                <input
                  type="text"
                  id="searchQuery"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter customer name"
                  className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setStatusFilter('')
                  setEventTypeFilter('')
                  setDateFilter('')
                  setSearchQuery('')
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
              >
                Clear Filters
              </button>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#F1F1FB] text-gray-700">
                <tr>
                  <th className="p-3 sm:p-4 whitespace-nowrap">Name</th>
                  <th className="p-3 sm:p-4 whitespace-nowrap">Event Date</th>
                  <th className="p-3 sm:p-4 whitespace-nowrap">Event Type</th>
                  <th className="p-3 sm:p-4 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-gray-500">
                      No bookings match your filters
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((req) => (
                    <tr
                      key={req.transaction_Id}
                      className="hover:bg-gray-100 cursor-pointer"
                      onClick={() => setSelectedRequest(req)}
                    >
                      <td className="p-3 sm:p-4 whitespace-nowrap text-[#667085]">{req.userName}</td>
                      <td className="p-3 sm:p-4 whitespace-nowrap text-[#667085]">
                        {req.transactionDate.split(" - ")[0]}
                      </td>
                      {req.eventName != null ? (
                        <td className="p-3 sm:p-4 whitespace-nowrap text-[#667085]">{req.eventName}</td>
                      ) : (
                        <td className="p-3 sm:p-4 whitespace-nowrap text-[#667085]">{"Wedding"}</td>
                      )}
                      <td className="p-3 sm:p-4 whitespace-nowrap text-[#667085]">
                        <div
                          className={`inline-block px-4 py-1 rounded-full font-semibold text-sm text-center
                                              ${
                                                req.transactionStatus === "CANCELLED"
                                                  ? "bg-[#FFB8B2] text-[#912018]"
                                                  : req.transactionStatus === "ONGOING"
                                                    ? "bg-[#63A6FF] text-[#FFFFFF]"
                                                    : req.transactionStatus === "COMPLETED"
                                                      ? "bg-[#AFFAD2] text-[#05603A]"
                                                      : "bg-gray-100 text-gray-600"
                                              }`}
                        >
                          {req.transactionStatus}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      <Dialog
        open={!!selectedRequest && !viewServicesModal && !viewPaymentModal}
        onClose={() => setSelectedRequest(null)}
        className="fixed z-1150 shadow-md inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-4 sm:p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xl font-semibold">Booking Details</h3>
              <button onClick={() => setSelectedRequest(null)} className="text-xl hover:cursor-pointer">
                ×
              </button>
            </div>

            {selectedRequest && (
              <>
                <div>
                  <h4 className="font-semibold mb-2 text-[#FFB22C]">Personal Detail</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2 w-auto">
                      <div>
                        <label className="text-sm font-medium text-gray-500 block mb-1">Name</label>
                        <input
                          type="text"
                          className="border p-2 rounded w-full"
                          value={selectedRequest.userName}
                          readOnly
                        />
                      </div>
                      <div className="col-span-1 sm:col-span-2">
                        <label className="text-sm font-medium text-gray-500 block mb-1">Contact</label>
                        <input
                          type="text"
                          className="border p-2 rounded w-auto"
                          value={selectedRequest.phoneNumber}
                          readOnly
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">Email</label>
                      <input
                        type="text"
                        className="border p-2 rounded w-full"
                        value={selectedRequest.userEmail}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mt-6 mb-2 text-[#FFB22C]">Event Detail</h4>
                  <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-2 w-auto">
                    <div className="flex flex-col gap-2 w-auto">
                      {selectedRequest.packages != null ? (
                        <>
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-1">Event Type</label>
                            <input type="text" className="border p-2 rounded w-full" value={"Wedding"} readOnly />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-1">Package Type</label>
                            <input
                              type="text"
                              className="border p-2 rounded w-full"
                              value={selectedRequest.packages}
                              readOnly
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-1">Event Type</label>
                            <input
                              type="text"
                              className="border p-2 rounded w-full"
                              value={selectedRequest.eventName}
                              readOnly
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-1">Package Type</label>
                            <input type="text" className="border p-2 rounded w-full" value={"N/A"} readOnly />
                          </div>
                        </>
                      )}
                      <div>
                        <label className="text-sm font-medium text-gray-500 block mb-1">Name of Celebrant(s)</label>
                        <input type="text" className="border p-2 rounded w-full" 
                               value={selectedRequest.celebrantName || "Not provided"} readOnly />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 block mb-1">Additional Celebrant(s)</label>
                        <input type="text" className="border p-2 rounded w-full" 
                               value={selectedRequest.additionalCelebrants || "None"} readOnly />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 w-auto">
                      <div>
                        <label className="text-sm font-medium text-gray-500 block mb-1">Location</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            className="border p-2 rounded flex-1"
                            value={selectedRequest.transactionVenue}
                            readOnly
                          />
                          <IconButton
                            onClick={() => setViewMapModal(true)}
                            sx={{ color: '#FFB22C', '&:hover': { backgroundColor: '#f0f0f0' } }}
                          >
                            <MapIcon />
                          </IconButton>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 block mb-1">Date</label>
                        <input
                          type="text"
                          className="border p-2 rounded w-full"
                          value={selectedRequest.transactionDate}
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 block mb-1">Projected Attendees</label>
                        <input type="text" className="border p-2 rounded w-full" 
                               value={selectedRequest.projectedAttendees || "Not specified"} readOnly />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 block mb-1">Budget</label>
                        <input type="text" className="border p-2 rounded w-full" 
                               value={selectedRequest.budget ? `₱${selectedRequest.budget.toLocaleString()}` : "Not specified"} readOnly />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col mt-2">
                  <div className="flex text-sm gap-2">
                    <div>
                      <label className="text-sm font-medium align-text-bottom text-gray-500 block mb-1">Note</label>
                    </div>
                    <div className="flex ml-auto gap-2">
                      <button className="text-[#FFB22C] hover:underline" onClick={() => setViewPaymentModal(true)}>
                        View Payment
                      </button>
                      <button className="text-[#FFB22C] hover:underline" onClick={() => setViewServicesModal(true)}>
                        View Chosen Services
                      </button>
                      {selectedRequest?.rejectedNote && (
                        <button className="text-[#FFB22C] hover:underline" onClick={() => setViewReasonModal(true)}>
                          View Reason
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <textarea
                      readOnly
                      className="w-full border p-3 rounded text-sm text-gray-600"
                      value={selectedRequest.transactionNote}
                    ></textarea>
                  </div>
                </div>
                {selectedRequest && selectedRequest.transactionStatus === "ONGOING" && (
                    <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        onClick={handleCancelClick}
                        disabled={isValidating}
                      >
                        {isValidating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            CANCELLING...
                          </>
                        ) : (
                          "CANCEL BOOKING"
                        )}
                      </button>
                      <button
                        className="bg-green-500 text-white px-4 py-2 rounded w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        onClick={handleCompleteClick}
                        disabled={isValidating}
                      >
                        {isValidating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            COMPLETING...
                          </>
                        ) : (
                          "COMPLETE"
                        )}
                      </button>
                    </div>
                  )}
                {selectedRequest && (selectedRequest.transactionStatus === "COMPLETED" || selectedRequest.transactionStatus === "DECLINED") && (
                    <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                      <button
                        className="bg-red-600 text-white px-4 py-2 rounded w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        onClick={handleDeleteClick}
                        disabled={isValidating}
                      >
                        {isValidating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            DELETING...
                          </>
                        ) : (
                          "DELETE BOOKING"
                        )}
                      </button>
                    </div>
                  )}
              </>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>

      <Dialog
        open={!!selectedRequest && viewServicesModal}
        onClose={() => setViewServicesModal(false)}
        className="fixed z-1150 shadow-md inset-0 overflow-y-auto hover:cursor-pointer"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xl font-semibold">Booking Details</h3>
              <button onClick={() => setViewServicesModal(false)} className="text-xl">
                ×
              </button>
            </div>
            <div className="mt-6">
              <h4 className="text-[#F79009] font-semibold mb-4">Chosen Services</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto text-sm text-left">
                  <thead className="bg-indigo-50">
                    <tr>
                      <th className="p-3 text-[#667085] font-semibold">Service Type</th>
                      <th className="p-3 text-[#667085] font-semibold">Subcontractor</th>
                      <th className="p-3 text-[#667085] font-semibold">Representative</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRequest?.subcontractors?.map((service, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-3 text-[#667085]">{service.serviceCategory}</td>
                        <td className="p-3 text-[#667085]">{service.serviceName}</td>
                        <td className="p-3 text-[#667085]">{service.subcontractorName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-end pt-6">
              <button
                onClick={() => setViewServicesModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      <Dialog
        open={!!selectedRequest && viewPaymentModal}
        onClose={() => setViewPaymentModal(false)}
        className="fixed z-1150 shadow-md inset-0 overflow-y-auto hover:cursor-pointer"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xl font-semibold">Booking Details</h3>
              <button onClick={() => setViewPaymentModal(false)} className="text-xl">
                ×
              </button>
            </div>
            <div className="mt-6">
              <h4 className="text-[#F79009] font-semibold mb-4">Payment Details</h4>
              <div className="flex justify-center items-center bg-gray-100 p-4 rounded">
                <img
                  src={selectedRequest?.payment?.paymentReceipt || "/placeholder.svg"}
                  alt="Payment Proof"
                  className="max-h-[500px] rounded"
                />
              </div>
            </div>
            <div className="flex justify-end pt-6">
              <button
                onClick={() => setViewPaymentModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      <Dialog
        open={!!selectedRequest && viewReasonModal}
        onClose={() => setViewReasonModal(false)}
        className="fixed z-1150 shadow-md inset-0 overflow-y-auto hover:cursor-pointer"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xl font-semibold">Rejection Reason</h3>
              <button onClick={() => setViewReasonModal(false)} className="text-xl">
                ×
              </button>
            </div>
            <div className="mt-6 space-y-4">
              <div>
                <h4 className="text-[#F79009] font-semibold mb-2">Reason</h4>
                <p className="text-gray-700 text-base">{selectedRequest?.rejectedNote?.rejectionNote}</p>
              </div>
              {selectedRequest?.rejectedNote?.imageUrl && (
                <div>
                  <h4 className="text-[#F79009] font-semibold mb-2">Image</h4>
                  <div className="flex justify-center items-center bg-gray-100 p-4 rounded">
                    <img
                      src={selectedRequest.rejectedNote.imageUrl || "/placeholder.svg"}
                      alt="Rejection Proof"
                      className="max-h-[300px] rounded"
                    />
                  </div>
                </div>
              )}
              <div>
                <h4 className="text-[#F79009] font-semibold mb-2">Date</h4>
                <p className="text-gray-700 text-base">{selectedRequest?.rejectedNote?.rejectedDate}</p>
              </div>
            </div>
            <div className="flex justify-end pt-6">
              <button
                onClick={() => setViewReasonModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
      
      {/* Cancel Confirmation Modal */}
      <Dialog
        open={showCancelModal}
        onClose={handleCloseCancelModal}
        className="fixed z-1200 shadow-md inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-xl font-semibold text-red-600">Cancel Booking</h3>
              <button onClick={handleCloseCancelModal} className="text-gray-500 hover:text-gray-700 text-xl">
                ×
              </button>
            </div>

            <div className="py-6">
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-red-700">
                  Are you sure you want to cancel this ongoing event? This action cannot be undone after the cancellation.
                  <span className="font-bold block mt-2">!!Think carefully — if you cancel this event now, you won't be able to bring it back!!</span>
                </p>
              </div>
              
              <div className="mt-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Type 'Cancel' to confirm:
                </label>
                <input
                  type="text"
                  value={cancelConfirmText}
                  onChange={(e) => setCancelConfirmText(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Type 'Cancel' here"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseCancelModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Go Back
              </button>
              <button
                onClick={handleSubmitCancel}
                className={`px-4 py-2 bg-red-600 text-white rounded ${cancelConfirmText.trim() === 'Cancel' ? 'hover:bg-red-700' : 'opacity-50 cursor-not-allowed'}`}
                disabled={cancelConfirmText.trim() !== 'Cancel'}
              >
                Confirm Cancellation
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
      
      {/* Complete Confirmation Modal */}
      <Dialog
        open={showCompleteModal}
        onClose={handleCloseCompleteModal}
        className="fixed z-1200 shadow-md inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-xl font-semibold text-green-600">Complete Booking</h3>
              <button onClick={handleCloseCompleteModal} className="text-gray-500 hover:text-gray-700 text-xl">
                ×
              </button>
            </div>

            <div className="py-6">
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                <p className="text-green-700">
                  Is the event already done and successful? Type success to confirm.
                </p>
              </div>
              
              <div className="mt-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Type 'Success' to confirm:
                </label>
                <input
                  type="text"
                  value={completeConfirmText}
                  onChange={(e) => setCompleteConfirmText(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Type 'Success' here"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseCompleteModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Go Back
              </button>
              <button
                onClick={handleSubmitComplete}
                className={`px-4 py-2 bg-green-600 text-white rounded ${completeConfirmText.trim().toLowerCase() === 'success' ? 'hover:bg-green-700' : 'opacity-50 cursor-not-allowed'}`}
                disabled={completeConfirmText.trim().toLowerCase() !== 'success'}
              >
                Confirm Completion
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
      
      {/* Success Message Modal */}
      <Dialog
        open={showCompleteSuccess}
        onClose={handleCloseSuccessModal}
        className="fixed z-1200 shadow-md inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-white w-full max-w-sm rounded-lg shadow-lg p-6 text-center">
            <div className="py-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Event Completed Successfully!</h3>
              <p className="text-gray-500">The event has been marked as completed.</p>
            </div>
            <div className="mt-4">
              <button
                onClick={handleCloseSuccessModal}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={showDeleteModal}
        onClose={handleCloseDeleteModal}
        className="fixed z-1200 shadow-md inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-xl font-semibold text-red-600">Delete Booking</h3>
              <button onClick={handleCloseDeleteModal} className="text-gray-500 hover:text-gray-700 text-xl">
                ×
              </button>
            </div>

            <div className="py-6">
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-red-700">
                  Are you sure you want to delete this booking? This action cannot be undone and all associated data will be permanently removed.
                  <span className="font-bold block mt-2">!!This action is irreversible!!</span>
                </p>
              </div>

              <div className="mt-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Type 'delete' to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Type 'delete' here"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseDeleteModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Go Back
              </button>
              <button
                onClick={handleSubmitDelete}
                className={`px-4 py-2 bg-red-600 text-white rounded ${deleteConfirmText.trim().toLowerCase() === 'delete' ? 'hover:bg-red-700' : 'opacity-50 cursor-not-allowed'}`}
                disabled={deleteConfirmText.trim().toLowerCase() !== 'delete'}
              >
                Confirm Delete
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Map View Modal */}
      <MapViewModal
        open={viewMapModal}
        onClose={() => setViewMapModal(false)}
        location={selectedRequest?.transactionVenue}
      />

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

export default AdminBookings