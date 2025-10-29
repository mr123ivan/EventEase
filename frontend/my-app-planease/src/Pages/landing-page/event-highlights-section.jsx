"use client"

import { Link } from "react-router-dom"
import { ChevronRight, Facebook } from "lucide-react"
import { motion } from "framer-motion"

const EventCard = ({ title, image, date, views }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="bg-white rounded-lg overflow-hidden shadow-md"
    >
      <div className="relative">
        <img src={image || "/placeholder.svg"} alt={title} className="w-full h-[200px] object-cover" />
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-2">{title}</h3>
        {date && views && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-amber-500">{date}</span>
            <span className="text-gray-500">{views} views</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function EventHighlightsSection() {
  const events = [
    {
      title: "The Wedding of Richard and Eve",
      image: "/wedding1.png", // Update this path to match your public directory structure
      date: "09 January 2022",
      views: "11K views",
    },
    {
      title: "18th Birthday of Gwyneth Tayam",
      image: "/bday.png", // Update this path to match your public directory structure
      date: "",
      views: "",
    },
    {
      title: "Mark and Roxane's Wedding",
      image: "/wedding2.png", // Update this path to match your public directory structure
      date: "",
      views: "",
    },
  ]

  return (
    <section className="min-h-screen flex items-center py-16 bg-gray-900 text-white relative overflow-hidden">
      {/* Background circles */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-gray-800 -translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-gray-800 translate-x-1/3 translate-y-1/3"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-amber-500 uppercase tracking-wider font-medium text-sm mb-2"
            >
              A GLIMPSE OF OUR WORK
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-white"
            >
              Event Highlights
            </motion.h2>
          </div>

          {/* <Link to="#" className="w-10 h-10 rounded-full border border-white flex items-center justify-center">
            <Facebook className="h-5 w-5" />
          </Link> */}
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <EventCard key={index} title={event.title} image={event.image} date={event.date} views={event.views} />
            ))}
          </div>

          {/* <button className="absolute top-1/2 -right-4 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg z-10">
            <ChevronRight className="h-5 w-5 text-gray-900" />
          </button> */}
        </div>
      </div>
    </section>
  )
}
