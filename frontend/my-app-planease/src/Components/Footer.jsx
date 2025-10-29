import { Link } from "react-router-dom"
import { Phone, Mail, MapPin } from "lucide-react"

const Footer = () => {
  return (
    <footer className="bg-[#1a2344] text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <h2 className="text-2xl font-medium">
              Event<span className="text-blue-500">Ease</span>
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              A comprehensive service platform designed to simplify and streamline all aspects of event planning and management. We provide a seamless, end-to-end solution for organizing everything from small corporate meetings to large public gatherings, ensuring your event is executed with efficiency, precision, and flair.
            </p>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b border-gray-600 pb-2 mb-2">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/services/catering" className="text-sm text-gray-300 hover:text-blue-400">
                  Catering Service
                </Link>
              </li>
              <li>
                <Link to="/services/videography" className="text-sm text-gray-300 hover:text-blue-400">
                  Videography
                </Link>
              </li>
              <li>
                <Link to="/services/photography" className="text-sm text-gray-300 hover:text-blue-400">
                  Photography
                </Link>
              </li>
              <li>
                <Link to="/services/wedding" className="text-sm text-gray-300 hover:text-blue-400">
                  Wedding Event
                </Link>
              </li>
            </ul>
          </div>

          {/* Useful Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b border-gray-600 pb-2 mb-2">Useful Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-300 hover:text-blue-400">
                  Home Page
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-sm text-gray-300 hover:text-blue-400">
                  Service Page
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-gray-300 hover:text-blue-400">
                  FAQ's Page
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-300 hover:text-blue-400">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b border-gray-600 pb-2 mb-2">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-sm text-gray-300">
                <Phone size={16} className="mr-2" />
                (+63) 900 000 0000
              </li>
              <li className="flex items-center text-sm text-gray-300">
                <Mail size={16} className="mr-2" />
                yahoo@gmail.com
              </li>
              <li className="flex items-center text-sm text-gray-300">
                <MapPin size={16} className="mr-2" />
                Cebu City
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-400">
          Copyright By EventEase @ 2025. All Rights Reserved
        </div>
      </div>
    </footer>
  )
}

export default Footer

