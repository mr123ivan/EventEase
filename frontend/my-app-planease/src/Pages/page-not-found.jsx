import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Home, Briefcase, MessageCircle, ArrowRight, Clock } from "lucide-react"

export default function NotFound() {
  const [countdown, setCountdown] = useState(10)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate("/")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 bg-amber-400/10 rounded-full blur-3xl"
          style={{ left: "10%", top: "20%" }}
        />
        <div
          className="absolute w-64 h-64 bg-amber-300/15 rounded-full blur-2xl"
          style={{ right: "15%", bottom: "25%" }}
        />
      </div>
      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center min-h-[calc(100vh-100px)]">
        <div className="container mx-auto px-4 text-center">
          {/* 404 Display */}
          <div className="mb-8">
            <div className="text-[8rem] md:text-[12rem] lg:text-[16rem] font-black leading-none select-none">
              <span className="text-transparent bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 bg-clip-text">
                404
              </span>
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h1 className="text-white text-2xl uppercase tracking-wider mb-4">Page Not Found</h1>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-white">OOPS! LOOKS LIKE YOU'RE</span>
              <br />
              <span className="text-amber-400">OFF THE BEATEN PATH</span>
            </h1>
            <p className="text-white text-sm md:text-base mb-8 max-w-2xl mx-auto">
              The page you're looking for doesn't exist, but don't worry - we'll help you get back to planning amazing
              events.
            </p>
          </div>

          {/* Countdown Timer */}
          <div className="mb-8">
            <div className="inline-block bg-white/10 backdrop-blur-sm border border-amber-400/30 rounded-lg">
              <div className="p-6">
                <div className="flex items-center gap-3 text-center">
                  <Clock className="w-6 h-6 text-amber-400" />
                  <div>
                    <p className="text-white text-sm mb-1">Redirecting to home in</p>
                    <div className="text-3xl font-bold text-amber-400">{countdown}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-16">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="bg-amber-400 hover:bg-amber-500 text-white rounded-md px-8 py-3 text-sm font-medium transition-colors inline-flex items-center"
              >
                TAKE ME HOME <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

              <Link
                to="/contact"
                className="border-2 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-white rounded-md px-8 py-3 text-sm font-medium transition-colors bg-transparent inline-flex items-center"
              >
                GET HELP <MessageCircle className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-white text-xl font-semibold mb-8 uppercase tracking-wider">Popular Sections</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link to="/" className="group">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-amber-400/50 transition-all duration-300 group-hover:bg-white/10 rounded-lg">
                  <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-amber-400/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-400/30 transition-colors">
                      <Home className="w-8 h-8 text-amber-400" />
                    </div>
                    <h4 className="text-white text-lg font-semibold mb-2">Home</h4>
                    <p className="text-gray-300 text-sm">Return to our main page</p>
                  </div>
                </div>
              </Link>

              <Link to="/services" className="group">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-amber-400/50 transition-all duration-300 group-hover:bg-white/10 rounded-lg">
                  <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-amber-400/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-400/30 transition-colors">
                      <Briefcase className="w-8 h-8 text-amber-400" />
                    </div>
                    <h4 className="text-white text-lg font-semibold mb-2">Services</h4>
                    <p className="text-gray-300 text-sm">Explore our event services</p>
                  </div>
                </div>
              </Link>

              <Link to="/contact" className="group">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-amber-400/50 transition-all duration-300 group-hover:bg-white/10 rounded-lg">
                  <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-amber-400/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-400/30 transition-colors">
                      <MessageCircle className="w-8 h-8 text-amber-400" />
                    </div>
                    <h4 className="text-white text-lg font-semibold mb-2">Contact</h4>
                    <p className="text-gray-300 text-sm">Get in touch with us</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
