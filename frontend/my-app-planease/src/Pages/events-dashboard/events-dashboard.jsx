"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import FindTrustedProfessionals from "../../assets/FindTrustedProfessionals.jpg"

const EventPage = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  const [events, setEvents] = useState([])
  const [packages, setPackages] = useState([])

  useEffect(() => {
    const token = localStorage.getItem("token")

    // Fetch events
    axios
      .get(`${API_BASE_URL}/api/events/getEvents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setEvents(response.data)
      })
      .catch((error) => {
        console.error("Error fetching events:", error)
      })

    // Fetch packages
    axios
      .get(`${API_BASE_URL}/package/getall`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setPackages(response.data)
      })
      .catch((error) => {
        console.error("Error fetching packages:", error)
      })
  }, [])

  return (
    <div className="flex flex-col gap-6 md:gap-10 p-4 md:p-10">
      {/* Hero Section */}
      <section
        className="bg-cover bg-center h-48 sm:h-64 md:h-80 flex items-center justify-center md:justify-left text-white px-4 md:pl-10"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${FindTrustedProfessionals})`,
        }}
      >
        <div className="text-center md:text-left">
          <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">FIND TRUSTED PROFESSIONALS</div>
          <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl mt-2">For your events</div>
        </div>
      </section>

      {/* Services Section */}
      <section className="flex items-center justify-between mb-2 md:mb-5">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-700">
          Find the Best Service for your Needs
        </h2>
      </section>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
        {events.map((event) => (
          <div key={event.event_Id} className="shadow-lg rounded-lg overflow-hidden flex flex-col h-full">
            {/* Image section */}
            <div className="h-52 w-full bg-gray-200 flex items-center justify-center">
              {event.event_image ? (
                <img
                  src={event.event_image || "/placeholder.svg"}
                  alt={event.event_name || "Event Image"}
                  className="object-cover h-full w-full"
                />
              ) : (
                <span className="text-xl font-bold">No Image</span>
              )}
            </div>

            {/* Content */}
            <div className="p-4 md:p-5 flex flex-col flex-1 text-center">
              <h3 className="text-lg md:text-xl font-semibold mb-2">{event.event_name || "Untitled Event"}</h3>
              <p className="text-sm md:text-base text-gray-600 mb-2 flex-1 text-left break-words">
                {event.event_summary && event.event_summary.length > 200
                  ? `${event.event_summary.substring(0, 200)}...`
                  : event.event_summary || "No description available."}
              </p>

              {/* Button */}
              {!event.event_isAvailable ? (
                <button
                  className="bg-gray-400 text-white w-full px-4 py-2 rounded-lg cursor-not-allowed mt-auto text-sm md:text-base"
                  disabled
                >
                  Unavailable
                </button>
              ) : (
                <Link to={`/event/${event.event_name}`} className="mt-auto">
                  <button className="bg-gray-900 text-white w-full px-4 py-2 rounded-lg hover:bg-gray-800 text-sm md:text-base">
                    See more
                  </button>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Wedding Packages Section - Fixed to use packageId */}
    </div>
  )
}

export default EventPage
