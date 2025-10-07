"use client"
import { useState, useEffect } from "react"
import { ChevronDown, Filter, MoreVertical, Eye, X, Receipt } from "lucide-react"
import Navbar from "../../Components/Navbar"
import Footer from "../../Components/Footer"
import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthToken = () => {
  return localStorage.getItem("token") || ""
}

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "approved":
    case "confirmed":
      return "bg-green-100 text-green-800 border-green-200"
    case "rejected":
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200"
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "completed":
      return "bg-blue-100 text-blue-800 border-blue-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

const UserReservations = () => {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [showActionMenu, setShowActionMenu] = useState(null)
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const itemsPerPage = 10

  useEffect(() => {
    fetchUserReservations()
  }, [page, statusFilter])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".dropdown-container") &&
        !event.target.closest(".action-button")
      ) {
        setShowActionMenu(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchUserReservations = async () => {
    setLoading(true)
    try {
      const token = getAuthToken()
      const response = await axios.get(`${API_BASE_URL}/api/transactions/getCurrentUserReservations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const allReservations = Array.isArray(response.data) ? response.data : []
      const filteredReservations =
        statusFilter !== "all"
          ? allReservations.filter((r) => r.status?.toLowerCase() === statusFilter.toLowerCase())
          : allReservations

      const startIndex = (page - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const paginatedData = filteredReservations.slice(startIndex, endIndex)

      setReservations(paginatedData)
      setTotalPages(Math.ceil(filteredReservations.length / itemsPerPage))
      setError(null)
    } catch (err) {
      console.error("Error fetching reservations:", err)
      setError("Failed to fetch your reservations. Please try again later.")
      setReservations([])
    } finally {
      setLoading(false)
    }
  }

  const handleFilterSelect = (filter) => {
    setStatusFilter(filter)
    setPage(1)
    setShowFilterMenu(false)
  }

  const handleViewReservation = (reservation) => {
    setShowActionMenu(null)
    setSelectedReservation(reservation)
    setShowViewDialog(true)
  }

  const handleCancelReservation = async (reservation) => {
    if (!reservation) return

    const confirmCancel = window.confirm("Are you sure you want to cancel this booking?")
    if (!confirmCancel) return

    try {
      const token = getAuthToken()
      await axios.put(
        `${API_BASE_URL}/api/transactions/updateStatus/${reservation.transactionId}`,
        { status: "cancelled" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      fetchUserReservations()
      setShowActionMenu(null)
      alert("Booking cancelled successfully!")
    } catch (err) {
      console.error("Error cancelling reservation:", err)
      alert("Failed to cancel reservation. Please try again.")
    }
  }

  const calculateTotalAmount = (reservation) => {
    return reservation.amount || reservation.totalAmount || 420000
  }

  const generatePageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    return pages
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">My Reservations</h1>
              <p className="text-gray-600 mt-1">Manage your event bookings and reservations</p>
            </div>
            <div className="relative dropdown-container">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:bg-gray-50 transition-colors"
              >
                <Filter size={16} />
                Filter
                <ChevronDown size={16} />
              </button>
              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    {["all", "pending", "approved", "rejected", "completed", "cancelled"].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleFilterSelect(status)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 capitalize"
                      >
                        {status === "all" ? "All Reservations" : status}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                  {error}
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reservations.map((reservation) => {
                        const id = reservation.transactionId || reservation.id
                        const isMenuOpen = showActionMenu === id
                        return (
                          <tr key={id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {reservation.eventName || "Event"}
                              </div>
                              <div className="text-xs text-gray-500">{reservation.transactionVenue}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {formatDate(reservation.transactionDate || reservation.eventDate)}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {formatCurrency(calculateTotalAmount(reservation))}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                                  reservation.status
                                )}`}
                              >
                                {reservation.status || "Pending"}
                              </span>
                            </td>
                            {/* Action menu */}
                            <td className="px-6 py-4 relative">
                              <button
                                className="p-1 text-gray-400 hover:text-gray-600 action-button"
                                onClick={() => setShowActionMenu(isMenuOpen ? null : id)}
                              >
                                <MoreVertical size={16} />
                              </button>
                              {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                  <div className="py-1">
                                    <button
                                      onClick={() => handleViewReservation(reservation)}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <Eye size={14} />
                                      View Details
                                    </button>
                                    <button
                                      onClick={() => alert("Receipt download coming soon!")}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <Receipt size={14} />
                                      Download Receipt
                                    </button>
                                    {reservation.status?.toLowerCase() === "pending" && (
                                      <button
                                        onClick={() => handleCancelReservation(reservation)}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                      >
                                        <X size={14} />
                                        Cancel Booking
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center py-6 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-400"
                      >
                        ← Previous
                      </button>
                      {generatePageNumbers().map((num) => (
                        <button
                          key={num}
                          onClick={() => setPage(num)}
                          className={`px-3 py-1 text-sm rounded ${
                            page === num
                              ? "bg-blue-600 text-white"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-400"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal outside scroll area */}
      {showViewDialog && selectedReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button
              onClick={() => {
                setShowViewDialog(false)
                setSelectedReservation(null)
              }}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-semibold mb-4">Edit Reservation</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                // Implement save logic here
                alert("Save functionality not implemented yet.")
                setShowViewDialog(false)
                setSelectedReservation(null)
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">Event Name</label>
                <input
                  type="text"
                  defaultValue={selectedReservation.eventName || ""}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  name="eventName"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Venue</label>
                <input
                  type="text"
                  defaultValue={selectedReservation.transactionVenue || ""}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  name="transactionVenue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  defaultValue={
                    new Date(
                      selectedReservation.transactionDate || selectedReservation.eventDate
                    ).toISOString().split("T")[0]
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  name="transactionDate"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  defaultValue={calculateTotalAmount(selectedReservation)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  name="amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  defaultValue={selectedReservation.status || "pending"}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  name="status"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowViewDialog(false)
                    setSelectedReservation(null)
                  }}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}

export default UserReservations