"use client"

import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export default function HeaderHeroSection() {
  return (
    <section className="relative h-screen flex flex-col">
      <div className="absolute inset-0 w-full h-full">
        <img
          src="/sunsetweddingbackground.jpg"
          alt="Wedding couple at sunset"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold">
            <span className="text-white">Event</span>
            <span className="text-amber-400">Ease</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <Link to="#" className="text-white hover:text-amber-400 text-sm font-medium uppercase">
            Home
          </Link>
          <Link to="#" className="text-white hover:text-amber-400 text-sm font-medium uppercase">
            About Us
          </Link>
          <Link to="#" className="text-white hover:text-amber-400 text-sm font-medium uppercase">
            Contact
          </Link>
        </nav>

        <Link
          to="/login"
          className="bg-amber-400 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-amber-500 transition-colors"
        >
          Login
        </Link>
      </header>

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="container mx-auto px-4 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-white text-sm md:text-base uppercase tracking-wider mb-4"
          >
            Event Planning Made Simple
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
          >
            <span className="text-white">SEAMLESS EVENT &</span>
            <br />
            <span className="text-amber-400">SERVICE BOOKING</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white text-sm md:text-base mb-8 max-w-2xl mx-auto"
          >
            From weddings, birthdays, or any services, EventEase connects you with top event organizers. Easily
            book, choose and customize your event with trusted contractors.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link
              to="/register"
              className="bg-amber-400 hover:bg-amber-500 text-white rounded-md px-6 py-3 inline-flex items-center text-sm font-medium transition-colors"
            >
              GET STARTED <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
