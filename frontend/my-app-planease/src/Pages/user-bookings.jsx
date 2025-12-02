import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../Components/AuthProvider";
import { AlertCircle, CheckCircle, Clock, Calendar, ChevronLeft, Loader2, MapPin, User, Package, BarChart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Dialog } from "@headlessui/react"
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const UserBookingsPage = () => {
  const [bookings, setBookings] = useState({
    pending: [],
    ongoing: [],
    completed: [],
    cancelled: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // all, pending, ongoing, completed
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [progressData, setProgressData] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState(null);

  // Function to handle booking selection and load additional details if needed
  const handleBookingSelect = async (booking) => {
    setSelectedBooking(booking);
    setLoadingDetails(true);
    setProgressData(null); // Reset progress data

    try {
      // If the booking has a transaction ID, fetch complete details
      if (booking.transaction_Id) {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_BASE_URL}/api/transactions/getTransactionById/${booking.transaction_Id}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );

        // Merge the details with existing booking data
        // This ensures we don't lose any data that might only exist in one place
        setSelectedBooking({ ...booking, ...response.data });

        // After getting booking details, fetch progress data
        fetchEventProgress(booking.transaction_Id, token);
      }
    } catch (error) {
      console.error("Failed to fetch booking details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Function to fetch event progress data
  const fetchEventProgress = async (transactionId, token) => {
    setLoadingProgress(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/transactions/event-progress/${transactionId}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      setProgressData(response.data);
    } catch (error) {
      console.error("Failed to fetch event progress:", error);
    } finally {
      setLoadingProgress(false);
    }
  };


  // Check for authentication and redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated && isAuthenticated !== undefined) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Get user email from auth context only
  useEffect(() => {
    if (user?.email) {
      setUserEmail(user.email);
    } else {
      // If no user in context but we're authenticated, try to get email from local storage token
      if (isAuthenticated && localStorage.getItem('token')) {
        const token = localStorage.getItem('token') || localStorage.getItem("token");
        // Use a fallback if you can access the token directly

        // Make a direct API call to get user info
        axios.get(`${API_BASE_URL}/user/getuser`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(response => {
            if (response.data?.email) {
              setUserEmail(response.data.email);
            }
          })
          .catch(error => {
          });
      } else {
      }
    }
  }, [user, isAuthenticated]);

  // Fetch bookings once we have the email
  useEffect(() => {
    if (userEmail) {
      const token = localStorage.getItem("token") || localStorage.getItem("token");
      fetchUserBookings(token, userEmail);
    }
  }, [userEmail]);

  const fetchUserBookings = async (token, email) => {
    setLoading(true);
    try {
      const apiUrl = `${API_BASE_URL}/api/transactions/getAllUserTransactionsByEmail/${email}`;

      // Ensure headers are properly set for the request
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Use the correct API endpoint for fetching user transactions
      const response = await axios.get(apiUrl, { headers });

      // Categorize bookings by status
      const transactions = response.data || [];

      // The backend is filtering out PENDING, CANCELLED, and DECLINED statuses already
      // So we need to categorize what we get, which is only ONGOING and COMPLETED bookings

      // Try both casing variations for status field and both field names (status or transactionStatus)
      const ongoingBookings = transactions.filter(transaction => {
        const status = (
          transaction.status?.toUpperCase() ||
          transaction.Status?.toUpperCase() ||
          transaction.transactionStatus?.toUpperCase()
        );
        return status === "ONGOING" || status === "CONFIRMED" || status === "IN_PROGRESS" || status === "PROCESSING";
      });

      const completedBookings = transactions.filter(transaction => {
        const status = (
          transaction.status?.toUpperCase() ||
          transaction.Status?.toUpperCase() ||
          transaction.transactionStatus?.toUpperCase()
        );
        return status === "COMPLETED";
      });

      // Now we also get PENDING status bookings
      const pendingBookings = transactions.filter(transaction => {
        const status = (
          transaction.status?.toUpperCase() ||
          transaction.Status?.toUpperCase() ||
          transaction.transactionStatus?.toUpperCase()
        );
        return status === "PENDING";
      });

      // Get CANCELLED and DECLINED status bookings to show in cancelled tab
      const cancelledBookings = transactions.filter(transaction => {
        const status = (
          transaction.status?.toUpperCase() ||
          transaction.Status?.toUpperCase() ||
          transaction.transactionStatus?.toUpperCase()
        );
        return status === "CANCELLED" || status === "DECLINED";
      });

      // Log a sample booking to see its structure
      if (transactions.length > 0) {
        // Find the exact status field name used in the backend response
        const statusField = transactions[0].status ? "status" :
          transactions[0].Status ? "Status" :
            transactions[0].transactionStatus ? "transactionStatus" : "unknown";
      } else {
      }

      setBookings({
        pending: pendingBookings,
        ongoing: ongoingBookings,
        completed: completedBookings,
        cancelled: cancelledBookings
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const getDisplayedBookings = () => {
    switch (activeTab) {
      case "pending":
        return bookings.pending;
      case "ongoing":
        return bookings.ongoing;
      case "completed":
        return bookings.completed;
      case "cancelled":
        return bookings.cancelled;
      case "all":
      default:
        return [...bookings.pending, ...bookings.ongoing, ...bookings.completed, ...bookings.cancelled];
    }
  };

  const displayedBookings = getDisplayedBookings();

  // Helper to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString || Date.now());
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      // hour: '2-digit',
      // minute: '2-digit'
    }).format(date);
  };

  // Helper to get status badge styles
  const getStatusBadge = (booking) => {
    const status = (
      booking.status?.toUpperCase() ||
      booking.Status?.toUpperCase() ||
      booking.transactionStatus?.toUpperCase() ||
      ""
    );

    if (status === "PENDING" || status === "PENDING_PAYMENT") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-600">
          <AlertCircle size={12} />
          {status === "PENDING_PAYMENT" ? "Payment Pending" : "Pending"}
        </span>
      );
    } else if (status === "CONFIRMED" || status === "IN_PROGRESS" || status === "PROCESSING" || status === "ONGOING") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600">
          <Clock size={12} />
          {status === "CONFIRMED" ? "Confirmed" : status === "IN_PROGRESS" ? "In Progress" : status === "ONGOING" ? "Ongoing" : "Processing"}
        </span>
      );
    } else if (status === "COMPLETED") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-600">
          <CheckCircle size={12} />
          Completed
        </span>
      );
    } else if (status === "CANCELLED" || status === "DECLINED") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-600">
          <AlertCircle size={12} />
          {status === "DECLINED" ? "Declined" : "Cancelled"}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-600">
          {status || "Unknown"}
        </span>
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
      <div className="mb-4 md:mb-6 flex items-center">
        <Link to="/home" className="text-gray-600 hover:text-blue-600 mr-3 md:mr-4">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-xl md:text-2xl font-bold flex items-center">
          <Calendar className="mr-2" size={20} /> My Bookings
        </h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4 md:mb-6">
        {/* Desktop Tabs */}
        <nav className="hidden md:flex -mb-px space-x-8">
          <button
            onClick={() => setActiveTab("all")}
            className={`py-4 px-1 ${activeTab === "all"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } font-medium flex items-center`}
          >
            All Bookings ({bookings.pending.length + bookings.ongoing.length + bookings.completed.length + bookings.cancelled.length})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`py-4 px-1 ${activeTab === "pending"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } font-medium flex items-center`}
          >
            Pending ({bookings.pending.length})
          </button>
          <button
            onClick={() => setActiveTab("ongoing")}
            className={`py-4 px-1 ${activeTab === "ongoing"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } font-medium flex items-center`}
          >
            <Clock size={16} className="mr-2" /> Ongoing ({bookings.ongoing.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`py-4 px-1 ${activeTab === "completed"
              ? "border-b-2 border-green-500 text-green-600"
              : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } font-medium flex items-center`}
          >
            <CheckCircle size={16} className="mr-2" /> Completed ({bookings.completed.length})
          </button>
          <button
            onClick={() => setActiveTab("cancelled")}
            className={`py-4 px-1 ${activeTab === "cancelled"
              ? "border-b-2 border-red-500 text-red-600"
              : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } font-medium flex items-center`}
          >
            <AlertCircle size={16} className="mr-2" /> Cancelled ({bookings.cancelled.length})
          </button>
        </nav>

        {/* Mobile Scrollable Tabs */}
        <nav className="flex md:hidden -mb-px space-x-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button
            onClick={() => setActiveTab("all")}
            className={`py-4 px-3 whitespace-nowrap ${activeTab === "all"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
              } font-medium text-sm`}
          >
            All ({bookings.pending.length + bookings.ongoing.length + bookings.completed.length + bookings.cancelled.length})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`py-4 px-3 whitespace-nowrap ${activeTab === "pending"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
              } font-medium text-sm`}
          >
            Pending ({bookings.pending.length})
          </button>
          <button
            onClick={() => setActiveTab("ongoing")}
            className={`py-4 px-3 whitespace-nowrap flex items-center ${activeTab === "ongoing"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
              } font-medium text-sm`}
          >
            <Clock size={14} className="mr-1" /> Ongoing ({bookings.ongoing.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`py-4 px-3 whitespace-nowrap flex items-center ${activeTab === "completed"
              ? "border-b-2 border-green-500 text-green-600"
              : "text-gray-500"
              } font-medium text-sm`}
          >
            <CheckCircle size={14} className="mr-1" /> Completed ({bookings.completed.length})
          </button>
          <button
            onClick={() => setActiveTab("cancelled")}
            className={`py-4 px-3 whitespace-nowrap flex items-center ${activeTab === "cancelled"
              ? "border-b-2 border-red-500 text-red-600"
              : "text-gray-500"
              } font-medium text-sm`}
          >
            <AlertCircle size={14} className="mr-1" /> Cancelled ({bookings.cancelled.length})
          </button>
        </nav>
      </div>

      {/* Bookings Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
          <span className="ml-2 text-gray-600">Loading your bookings...</span>
        </div>
      ) : displayedBookings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No bookings found</h3>
          <p className="mt-1 text-gray-500">
            {activeTab === "all"
              ? "You don't have any active bookings yet. Note: Pending bookings are not shown here until approved."
              : `You don't have any ${activeTab} bookings.`}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {userEmail ? `Searched for email: ${userEmail}` : "Email not available"}
          </p>
          <div className="mt-6">
            <Link to="/events-dashboard"
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              Browse Events
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View - Hidden on mobile */}
          <div className="hidden md:block overflow-hidden bg-white shadow sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Event Details
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>

                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleBookingSelect(booking)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                          <Calendar size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.packages || booking.eventName || 'Unnnaamed'}
                          </div>
                          <div className="text-sm text-gray-500">

                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(booking.transactionDate || booking.date)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.time || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(booking)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View - Shown only on mobile */}
          <div className="md:hidden space-y-3">
            {displayedBookings.map((booking) => (
              <div
                key={booking.id}
                onClick={() => handleBookingSelect(booking)}
                className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                {/* Event Details */}
                <div className="flex items-start mb-3">
                  <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 mr-3">
                    <Calendar size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-gray-900">
                      {booking.packages || booking.eventName || 'Unnamed Event'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(booking.transactionDate || booking.date)}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex justify-end">
                  {getStatusBadge(booking)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <Dialog
        open={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        className="fixed z-50 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-4 md:p-6 space-y-4 md:space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xl font-semibold">Booking Details</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-xl hover:cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Body */}
            {loadingDetails ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                <span className="ml-2 text-gray-600">Loading event details...</span>
              </div>
            ) : selectedBooking && (
              <>
                {/* Personal Details */}
                <div>
                  <h4 className="font-semibold mb-2 text-[#FFB22C]">Personal Details</h4>
                  <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">Name</label>
                      <div className="flex items-center border p-2 rounded bg-gray-50">
                        <User size={16} className="text-gray-500 mr-2" />
                        <span>{selectedBooking.userName || "N/A"}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">Email</label>
                      <div className="flex items-center border p-2 rounded bg-gray-50">
                        <span>{selectedBooking.userEmail || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event Info */}
                <div>
                  <h4 className="font-semibold mb-2 text-[#FFB22C]">Event Details</h4>
                  <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">Event Type</label>
                      <div className="flex items-center border p-2 rounded bg-gray-50">
                        <Calendar size={16} className="text-gray-500 mr-2" />
                        <span>{selectedBooking.eventName || "Wedding"}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">Package</label>
                      <div className="flex items-center border p-2 rounded bg-gray-50">
                        <Package size={16} className="text-gray-500 mr-2" />
                        <span>{selectedBooking.packages || selectedBooking.packageName || "N/A"}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">Venue</label>
                      <div className="flex items-center border p-2 rounded bg-gray-50">
                        <MapPin size={16} className="text-gray-500 mr-2" />
                        <span>{selectedBooking.transactionVenue || "N/A"}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">Date</label>
                      <div className="flex items-center border p-2 rounded bg-gray-50">
                        <Calendar size={16} className="text-gray-500 mr-2" />
                        <span>{selectedBooking.transactionDate || "N/A"}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">Celebrant Name</label>
                      <div className="flex items-center border p-2 rounded bg-gray-50">
                        <User size={16} className="text-gray-500 mr-2" />
                        <span>{selectedBooking.celebrantName || "Not provided"}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">Additional Celebrants</label>
                      <div className="flex items-center border p-2 rounded bg-gray-50">
                        <span>{selectedBooking.additionalCelebrants || "None"}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">Projected Attendees</label>
                      <div className="flex items-center border p-2 rounded bg-gray-50">
                        <span>{selectedBooking.projectedAttendees || "Not specified"}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">Budget</label>
                      <div className="flex items-center border p-2 rounded bg-gray-50">
                        <span>{selectedBooking.budget ? `₱${selectedBooking.budget.toLocaleString()}` : "Not specified"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Info - If available */}
                {selectedBooking?.payment?.paymentReferenceNumber && (
                  <div>
                    <h4 className="font-semibold mb-2 text-[#FFB22C]">Payment Details</h4>
                    <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 block mb-1">Reference Number</label>
                        <div className="flex items-center border p-2 rounded bg-gray-50">
                          <span>{selectedBooking?.payment?.paymentReferenceNumber || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Services/Subcontractors - If available */}
                {selectedBooking.subcontractors && selectedBooking.subcontractors.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-[#FFB22C]">Chosen Services</h4>
                    <div className="overflow-x-auto border rounded">
                      <table className="min-w-full table-auto text-sm text-left">
                        <thead className="bg-indigo-50">
                          <tr>
                            <th className="p-3 text-gray-700 font-semibold">Service</th>
                            <th className="p-3 text-gray-700 font-semibold">Provider</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedBooking.subcontractors.map((service, index) => (
                            <tr key={index} className="border-t">
                              <td className="p-3 text-gray-700">{service.serviceName}</td>
                              <td className="p-3 text-gray-700">{service.subcontractorName}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Progress Information */}
                <div>
                  <h4 className="font-semibold mb-2 text-[#FFB22C]">Event Progress</h4>
                  {loadingProgress ? (
                    <div className="flex justify-center items-center py-4">
                      <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
                      <span className="ml-2 text-gray-600">Loading progress data...</span>
                    </div>
                  ) : progressData ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <BarChart size={18} className="text-blue-500 mr-2" />
                          <span className="font-medium">Overall Progress:</span>
                        </div>
                        <span className="font-medium text-blue-600">{progressData.progressPercentage}%</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${progressData.progressPercentage}%` }}
                        ></div>
                      </div>

                      {/* Status Information */}
                      <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500 block mb-1">Current Status</label>
                          <div className="flex items-center border p-2 rounded bg-gray-50">
                            <span className="capitalize">{progressData.currentStatus || "Not available"}</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 block mb-1">Last Updated</label>
                          <div className="flex items-center border p-2 rounded bg-gray-50">
                            <span>{progressData.lastUpdate ? new Date(progressData.lastUpdate).toLocaleString() : "Not available"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Service Providers Progress */}
                      {progressData.subcontractors && progressData.subcontractors.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Service Providers Progress</h5>
                          <div className="overflow-x-auto border rounded">
                            <table className="min-w-full table-auto text-sm text-left">
                              <thead className="bg-indigo-50">
                                <tr>
                                  <th className="p-2 text-gray-700 font-semibold">Provider</th>
                                  <th className="p-2 text-gray-700 font-semibold">Service</th>
                                  <th className="p-2 text-gray-700 font-semibold">Progress</th>
                                  <th className="p-2 text-gray-700 font-semibold">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {progressData.subcontractors.map((sub, index) => (
                                  <tr key={index} className="border-t">
                                    <td className="p-2 text-gray-700">{sub.subcontractorName}</td>
                                    <td className="p-2 text-gray-700">{sub.subcontractorRole}</td>
                                    <td className="p-2 text-gray-700">
                                      <div className="flex items-center">
                                        <div className="w-24 bg-gray-200 rounded-full h-1.5 mr-2">
                                          <div
                                            className="bg-blue-600 h-1.5 rounded-full"
                                            style={{ width: `${sub.progressPercentage}%` }}
                                          ></div>
                                        </div>
                                        <span className="text-xs">{sub.progressPercentage}%</span>
                                      </div>
                                    </td>
                                    <td className="p-2 text-gray-700">
                                      <span className="capitalize text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                                        {sub.checkInStatus?.toLowerCase() || "pending"}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No progress data available for this event yet.</p>
                    </div>
                  )}
                </div>

                {/* Notes - If available */}
                {selectedBooking.transactionNote && (
                  <div>
                    <h4 className="font-semibold mb-2 text-[#FFB22C]">Notes</h4>
                    <div className="border p-3 rounded bg-gray-50 text-gray-700">
                      {selectedBooking.transactionNote}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Footer */}
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setSelectedBooking(null)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

    </div>


  );

};




export default UserBookingsPage;


