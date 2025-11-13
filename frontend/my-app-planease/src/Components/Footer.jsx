import { Link } from "react-router-dom"
import { Phone, Mail, MapPin } from "lucide-react"
import { useAuth } from "./AuthProvider"

// Import icons for social media (assuming you are using lucide-react or similar)
// Note: If you don't have Facebook/Instagram icons in lucide-react,
// you might need to use generic ones or import from a different library.
// For this fix, I'll use simple text links as before, but ensure they are correctly placed.

const Footer = () => {
  const { isAuthenticated, user } = useAuth()
  const currentYear = new Date().getFullYear()

  const getHomePath = () => {
    if (isAuthenticated && user) {
      if (user.role === "User") return "/home"
      if (user.role === "Admin") return "/admin/pendings"
      if (user.role === "SubContractor") return "/subcontractor/dashboard"
    }
    return "/"
  }

  return (
    <footer className="bg-[#1a2344] text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Company Info/Logo */}
          <div className="space-y-4 md:col-span-1">
            <h2 className="text-3xl font-bold">
              Event<span className="text-blue-500">Ease</span>
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              A comprehensive service platform designed to simplify and streamline all aspects of event planning and management.
            </p>
          </div>

          {/* Useful Links (NOW INCLUDES SOCIAL) */}
          <div className="space-y-4 md:col-span-1">
            <h3 className="text-lg font-semibold border-b border-gray-600 pb-2 mb-2">Useful Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to={getHomePath()} className="text-sm text-gray-300 hover:text-blue-400 transition-colors">
                  Home Page
                </Link>
              </li>
              
              {/* --- SOCIAL LINKS MOVED HERE --- */}
              <li>
                <a 
                  href="https://www.facebook.com/chan.abella.5" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-gray-300 hover:text-blue-400 transition-colors">
                  Facebook
                </a>
              </li>
              <li>
                <a 
                  href="https://www.instagram.com/richanabella" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-gray-300 hover:text-blue-400 transition-colors">
                  Instagram
                </a>
              </li>
              {/* -------------------------------- */}

            </ul>
          </div>

          {/* Contact (Removed Social Links) */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-semibold border-b border-gray-600 pb-2 mb-2">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-sm text-gray-300">
                <MapPin size={18} className="mr-3 text-blue-400 flex-shrink-0" />
                Masbate, Philippines
              </li>
              <li className="flex items-center text-sm text-gray-300">
                <Phone size={18} className="mr-3 text-blue-400 flex-shrink-0" />
                <a href="tel:09198133158" className="hover:text-blue-400 transition-colors">
                    +63 919 813 3158
                </a>
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