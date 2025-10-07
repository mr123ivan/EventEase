"use client"

import { useState, useEffect } from "react"
import Navbar from "../Components/Navbar"
import { Bell, Info } from "lucide-react"
import moment from "moment"
import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [resultsPerPage, setResultsPerPage] = useState(5)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterType, setFilterType] = useState("all")

  // Fetch notifications from the backend
  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setLoading(false)
        return
      }

      // Get user info from the token or from a user context
      const userResponse = await axios.get(`${API_BASE_URL}/user/getuser`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const userEmail = userResponse.data.email
      const userRole = userResponse.data.role

      // Fetch notifications based on filter
      let endpoint = `/api/notifications`
      if (filterType === "unread") {
        endpoint = `/api/notifications/unread`
      } else if (filterType !== "all") {
        endpoint = `/api/notifications/type/${filterType}`
      }

      const response = await axios.get(`${API_BASE_URL}${endpoint}?userEmail=${userEmail}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      console.log("Notifications:",  response.data)
      setNotifications(response.data)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      await axios.put(
        `${API_BASE_URL}/api/notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      // Update the local state
      setNotifications(
        notifications.map((notification) =>
          notification.notificationId === notificationId ? { ...notification, isRead: true } : notification,
        ),
      )
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const userResponse = await axios.get(`${API_BASE_URL}/user/getuser`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const userEmail = userResponse.data.email

      await axios.put(
        `${API_BASE_URL}/api/notifications/read-all?userEmail=${userEmail}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      // Update the local state
      setNotifications(notifications.map((notification) => ({ ...notification, isRead: true })))
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
    }
  }

  // Load notifications when component mounts or filter changes
  useEffect(() => {
    fetchNotifications()
  }, [filterType])

  // Format time relative to now (e.g., "16 mins ago")
  const formatTime = (timestamp) => {
    return moment(timestamp).fromNow()
  }

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "booking-approved":
      case "booking-rejected":
        return <Bell className="text-blue-500" size={24} />
      case "welcome":
        return <Info className="text-blue-500" size={24} />
      default:
        return <Bell className="text-blue-500" size={24} />
    }
  }

  // Apply filter
  const applyFilter = (type) => {
    setFilterType(type)
    setFilterOpen(false)
    setCurrentPage(1) // Reset to first page when changing filter
  }

  // Calculate pagination
  const totalPages = Math.ceil(notifications.length / resultsPerPage)
  const startIndex = (currentPage - 1) * resultsPerPage
  const endIndex = startIndex + resultsPerPage
  const currentNotifications = notifications.slice(startIndex, endIndex)

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // Handle results per page change
  const handleResultsPerPageChange = (e) => {
    setResultsPerPage(Number(e.target.value))
    setCurrentPage(1) // Reset to first page when changing results per page
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem("token")
                  if (!token) {
                    window.location.href = "/"
                    return
                  }
                  const userResponse = await axios.get(`${API_BASE_URL}/user/getuser`, {
                    headers: { Authorization: `Bearer ${token}` },
                  })
                  const role = userResponse.data.role
                  if (role === "User") {
                    window.location.href = "/home"
                  } else if (role === "SubContractor") {
                    window.location.href = "/subcontractor/dashboard"
                  } else if (role === "Admin") {
                    window.location.href = "/admin/pendings"
                  } else {
                    window.location.href = "/"
                  }
                } catch (error) {
                  console.error("Failed to get user role:", error)
                  window.location.href = "/"
                }
              }}
              className="hover:underline"
            >
              Home
            </button>
            <span>/</span>
            <h1 className="text-2xl font-semibold">Notifications</h1>
          </div>

          <div className="flex items-center space-x-2">
            <button onClick={markAllAsRead} className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800">
              Mark all as read
            </button>

            <div className="relative">
              <button
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm flex items-center gap-1"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                Filter
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-1"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {filterOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                  <button
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    onClick={() => applyFilter("all")}
                  >
                    All Notifications
                  </button>
                  <button
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    onClick={() => applyFilter("unread")}
                  >
                    Unread Only
                  </button>
                  <button
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    onClick={() => applyFilter("booking-approved")}
                  >
                    Booking Approvals
                  </button>
                  <button
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    onClick={() => applyFilter("booking-rejected")}
                  >
                    Booking Rejections
                  </button>
                  {/* <button
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    onClick={() => applyFilter("welcome")}
                  >
                    System
                  </button> */}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="py-16 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
              <p className="mt-2 text-gray-500">Loading notifications...</p>
            </div>
          ) : currentNotifications.length > 0 ? (
            <div>
              {currentNotifications.map((notification) => (
                <div
                  key={notification.notificationId}
                  className={`border-b border-gray-100 last:border-b-0 ${!notification.read ? "bg-blue-50" : ""}`}
                  onClick={() => !notification.read && markAsRead(notification.notificationId)}
                >
                  <div className="flex p-4">
                    <div className="mr-4 flex-shrink-0">{getNotificationIcon(notification.notificationType)}</div>
                    <div className="flex-grow">
                      <p className="text-gray-800 mb-1">{notification.notificationMessage}</p>
                      <p className="text-sm text-gray-500">{formatTime(notification.notificationDate)}</p>
                    </div>
                    {!notification.read && (
                      <div className="ml-2 flex-shrink-0">
                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-gray-500">No notifications found</div>
          )}

          {notifications.length > resultsPerPage && (
            <div className="flex justify-between items-center p-4 border-t border-gray-200">
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">Show result:</span>
                <div className="relative">
                  <select
                    value={resultsPerPage}
                    onChange={handleResultsPerPageChange}
                    className="appearance-none border border-gray-300 rounded-md py-1 pl-3 pr-8 text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 border border-gray-300 rounded-l-md ${
                    currentPage === 1 ? "text-gray-400" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-3 py-1 border-t border-b border-r border-gray-300 ${
                      currentPage === i + 1 ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 border-t border-b border-r border-gray-300 rounded-r-md ${
                    currentPage === totalPages ? "text-gray-400" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {notifications.length > 0 && currentNotifications.length < notifications.length && (
            <div className="text-center py-6 text-gray-500 text-sm">No more results</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationsPage
