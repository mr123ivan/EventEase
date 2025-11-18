"use client"

import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"

const EventDetails = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { event_name } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")

    axios
      .get(`${API_BASE_URL}/api/events/event-details/${event_name}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setEvent(response.data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching event details:", error)
        setLoading(false)
      })
  }, [event_name])

  const handleBookNow = () => {
    // Store event information for the booking flow
    sessionStorage.setItem("currentEventName", event.event_name)
    sessionStorage.setItem("currentEventId", event.event_Id)

    // Navigate to booking with event name parameter
    navigate(`/book/${encodeURIComponent(event.event_name)}/inputdetails`)
  }

  if (loading) return <p className="p-10">Loading...</p>
  if (!event) return <p className="p-10">Event not found</p>

  return (
    <div className="p-6 md:p-10 mb-20">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <span className="cursor-pointer hover:underline" onClick={() => navigate("/home")}>
          Home /
        </span>
        <span className="text-gray-500"> {event_name}</span>
      </nav>

      {/* Event content */}
      <div className="flex flex-col md:flex-row gap-8">
        <img
          src={event.event_image || "https://talentclick.com/wp-content/uploads/2021/08/placeholder-image.png"}
          alt={event.event_name || "Event Image"}
          className="rounded-xl object-cover w-full md:w-1/2 h-64 md:h-auto"
        />

        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold mb-4 break-words">{event.event_name || "Untitled Event"}</h1>
          <p className="text-gray-600 mb-6 break-words whitespace-normal overflow-wrap-anywhere leading-relaxed">
            {event.event_description || "No description available."}
          </p>
          {/* <p className="text-xl font-semibold mb-4 text-green-600">
            {event.event_price != null ? `₱${event.event_price.toLocaleString()}` : "Price not available"}
          </p> */}

          {!event.event_isAvailable ? (
            <button className="bg-gray-400 text-white px-6 py-2 rounded-md cursor-not-allowed" disabled>
              Unavailable
            </button>
          ) : (
            <button
              className="bg-gray-800 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition"
              onClick={handleBookNow}
            >
              Book Now
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventDetails
