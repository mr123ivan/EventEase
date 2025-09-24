"use client"

import { useState, useEffect, useMemo } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import CustomInput from "../Components/CustomInput"
import CustomButton from "../Components/CustomButton"
import { FcGoogle } from "react-icons/fc" // Google icon
import axios from "axios" // Make sure axios is imported
import { motion, AnimatePresence } from "framer-motion" // Import framer-motion

import { useAuth } from "../Components/AuthProvider"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Tips rotation state - Slowed down to 8 seconds
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  const tips = [
    "Book your preferred service at least 2-3 weeks in advance to ensure availability!",
    "Create a detailed event brief to help vendors understand your vision better.",
    "Consider weather conditions when planning outdoor events.",
    "Always have a backup plan for critical aspects of your event.",
    "Communicate your budget clearly to avoid unexpected costs later.",
    "Take advantage of our vendor comparison feature to find the best match.",
    "Read reviews from other clients before making your final decision.",
  ]

  // Cycle through tips every 8 seconds (slowed down from 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % tips.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [tips.length])

  const clientGoogleId = "1018156473391-pqrb7r3gl54f7sqeqng31h9mctab3hhs.apps.googleusercontent.com"
  const clientFacebookId = "687472957271649"

  const navigate = useNavigate()
  const { loginAction } = useAuth()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please enter both email and password.")
      return
    }

    setIsLoading(true)

    try {
      const response = await loginAction({ email, password }, navigate)

      if (!response || response.error) {
        throw new Error(response?.error || "Invalid credentials. Please try again.")
      }
    } catch (error) {
      console.error("Login error:", error)

      // Improved error handling
      setError(error?.response?.data?.message || error?.message || "Login failed. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  const [googleApiReady, setGoogleApiReady] = useState(false)
  const [googleApiLoading, setGoogleApiLoading] = useState(true)
  const [facebookApiReady, setFacebookApiReady] = useState(false)
  const [facebookApiLoading, setFacebookApiLoading] = useState(true)

  // Load Google Identity Services script
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.onload = () => {
      setGoogleApiReady(true)
      setGoogleApiLoading(false)
    }
    script.onerror = () => {
      console.error("Google Identity Services script failed to load")
      setGoogleApiLoading(false)
      setError("Failed to load Google login service")
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  // Load Facebook SDK script
  useEffect(() => {
    if (document.getElementById("facebook-jssdk")) {
      setFacebookApiLoading(false)
      setFacebookApiReady(true)
      return
    }

    const script = document.createElement("script")
    script.id = "facebook-jssdk"
    script.src = "https://connect.facebook.net/en_US/sdk.js"
    script.async = true
    script.defer = true
    script.onload = () => {
      window.fbAsyncInit = () => {
        window.FB.init({
          appId: clientFacebookId,
          cookie: true,
          xfbml: true,
          version: "v18.0",
        })
        setFacebookApiReady(true)
        setFacebookApiLoading(false)
      }
    }
    script.onerror = () => {
      console.error("Facebook SDK failed to load")
      setFacebookApiLoading(false)
      setError("Failed to load Facebook login service")
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handleSocialLogin = async (provider) => {
    if (provider === "Google") {
      try {
        if (googleApiLoading) {
          setError("Google login is still loading, please wait")
          return
        }
        if (!googleApiReady || !window.google) {
          setError("Google login is not available right now")
          return
        }

        setError("")
        setIsLoading(true)

        // Initialize Google Identity Services
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientGoogleId,
          scope: "profile email",
          callback: async (response) => {
            if (response.error) {
              console.error("Google login error:", response.error)
              if (response.error === "popup_closed_by_user" || response.error === "access_denied") {
                setError("Google login was cancelled")
              } else {
                setError("Google login failed")
              }
              setIsLoading(false)
              return
            }

            try {
              // Get user profile using the access token
              const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: {
                  Authorization: `Bearer ${response.access_token}`,
                },
              })
              const profile = await profileResponse.json()
              // console.log(profile)

              // Check if user exists in the database
              const checkUserResponse = await axios.get("http://localhost:8080/user/check-user", {
                params: { email: profile.email },
              })

              if (checkUserResponse.data.exists) {
                const credentials = {
                  email: profile.email,
                  password: profile.sub, // Use Google ID as temporary password
                }
                await loginAction(credentials, navigate)
              } else {
                const registrationData = {
                  firstname: profile.given_name,
                  lastname: profile.family_name,
                  email: profile.email,
                  password: profile.sub,
                  phoneNumber: null,
                  region: null,
                  province: null,
                  cityAndMul: null,
                  barangay: null,
                  role: "User",
                  profilePicture: profile.picture,
                  isGoogle: true,
                  isFacebook: false,
                }
                const registerResponse = await axios.post("http://localhost:8080/user/register", registrationData)
                try {
                  await axios.post("http://localhost:8080/regularuser/create", { userId: registerResponse.data.userId })
                } catch (error) {
                  console.error("Regular user creation error:", error)
                }
                const loginCredentials = {
                  email: profile.email,
                  password: profile.sub,
                }
                await loginAction(loginCredentials, navigate)
              }
              window.dispatchEvent(new Event("storage"))
            } catch (err) {
              console.error("Login/registration error:", err)
              setError("An error occurred during login.")
            } finally {
              setIsLoading(false)
            }
          },
          error_callback: (error) => {
            console.error("Google OAuth error:", error)
            setError("Google login was cancelled or failed")
            setIsLoading(false)
          },
        })

        try {
          client.requestAccessToken()
        } catch (popupError) {
          console.error("Popup blocked or failed:", popupError)
          setError("Please allow popups for Google login to work")
          setIsLoading(false)
        }
      } catch (err) {
        console.error("Google login error:", err)
        setIsLoading(false)
        setError("An error occurred during login.")
      }
    }
    if (provider === "Facebook") {
      try {
        if (facebookApiLoading) {
          setError("Facebook login is still loading, please wait")
          return
        }
        if (!facebookApiReady || !window.FB) {
          setError("Facebook login is not available right now")
          return
        }

        setError("")
        setIsLoading(true)

        window.FB.login(
          (response) => {
            if (response.authResponse) {
              // Explicitly set redirect URI for development
              const redirectUri = window.location.origin
              console.log("Using redirect URI:", redirectUri)

              window.FB.api("/me", { fields: "id,name,email,picture" }, async (profile) => {
                try {
                  // Check if user exists in the database
                  const checkUserResponse = await axios.get("http://localhost:8080/user/check-user", {
                    params: { email: profile.email },
                  })

                  if (checkUserResponse.data.exists) {
                    const credentials = {
                      email: profile.email,
                      password: profile.id, // Use Facebook ID as temporary password
                    }
                    await loginAction(credentials, navigate)
                  } else {
                    const names = profile.name.split(" ")
                    const registrationData = {
                      firstname: names[0],
                      lastname: names.length > 1 ? names[1] : "",
                      email: profile.email,
                      password: profile.id,
                      phoneNumber: null,
                      region: null,
                      province: null,
                      cityAndMul: null,
                      barangay: null,
                      role: "User",
                      profilePicture: profile.picture?.data?.url || null,
                      isGoogle: false,
                      isFacebook: true,
                    }
                    const registerResponse = await axios.post("http://localhost:8080/user/register", registrationData)
                    try {
                      await axios.post("http://localhost:8080/regularuser/create", {
                        userId: registerResponse.data.userId,
                      })
                    } catch (error) {
                      console.error("Regular user creation error:", error)
                    }
                    const loginCredentials = {
                      email: profile.email,
                      password: profile.id,
                    }
                    await loginAction(loginCredentials, navigate)
                  }
                  window.dispatchEvent(new Event("storage"))
                } catch (err) {
                  console.error("Login/registration error:", err)
                  setError("An error occurred during login.")
                } finally {
                  setIsLoading(false)
                }
              })
            } else {
              console.error("User cancelled login or did not fully authorize.")
              setError("Facebook login was cancelled")
              setIsLoading(false)
            }
          },
          { scope: "email,public_profile" },
        )
      } catch (err) {
        console.error("Facebook login error:", err)
        setIsLoading(false)
        setError("An error occurred during login.")
      }
    }
  }

  // Generate confetti particles data with useMemo to ensure it doesn't regenerate on re-renders
  const confettiParticles = useMemo(() => {
    // Colors for the confetti particles
    const colors = [
      "rgba(255, 255, 255, 0.8)",
      "rgba(255, 223, 186, 0.8)",
      "rgba(255, 179, 186, 0.8)",
      "rgba(255, 255, 186, 0.8)",
      "rgba(186, 255, 201, 0.8)",
      "rgba(186, 225, 255, 0.8)",
    ]

    // Shapes for the confetti particles
    const shapes = ["circle", "square", "triangle"]

    return Array.from({ length: 30 }, () => {
      const shape = shapes[Math.floor(Math.random() * shapes.length)]
      const color = colors[Math.floor(Math.random() * colors.length)]
      const size = Math.random() * 15 + 5
      const zIndex = Math.floor(Math.random() * 10) - 5 // For 3D effect

      return {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size,
        color,
        shape,
        rotation: Math.random() * 360,
        zIndex,
        blur: Math.random() * 2,
        opacity: Math.random() * 0.5 + 0.3,
      }
    })
  }, []) // Empty dependency array ensures this only runs once

  return (
    <div className="flex h-screen w-full">
      {/* Left side - Background image section with overlay */}
      <div className="hidden md:flex md:w-1/2 flex-col relative overflow-hidden">
        {/* Background image with direct URL from public folder */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('/sunsetweddingbackground.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        ></div>

        {/* Semi-transparent overlay using rgba */}
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}></div>

        {/* 3D Confetti-like particles */}
        <div className="absolute inset-0" style={{ perspective: "1000px" }}>
          {confettiParticles.map((particle, i) => {
            // Render different shapes based on the particle type
            let shapeElement

            if (particle.shape === "circle") {
              shapeElement = (
                <div
                  className="absolute rounded-full"
                  style={{
                    left: particle.left,
                    top: particle.top,
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    backgroundColor: particle.color,
                    opacity: particle.opacity,
                    transform: `rotate(${particle.rotation}deg) translateZ(${particle.zIndex}px)`,
                    boxShadow: `0 ${particle.size / 5}px ${particle.size / 3}px rgba(0,0,0,0.1), 
                                inset 0 0 ${particle.size / 3}px rgba(255,255,255,0.6)`,
                    filter: `blur(${particle.blur}px)`,
                  }}
                />
              )
            } else if (particle.shape === "square") {
              shapeElement = (
                <div
                  className="absolute"
                  style={{
                    left: particle.left,
                    top: particle.top,
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    backgroundColor: particle.color,
                    opacity: particle.opacity,
                    transform: `rotate(${particle.rotation}deg) translateZ(${particle.zIndex}px)`,
                    boxShadow: `0 ${particle.size / 5}px ${particle.size / 3}px rgba(0,0,0,0.1), 
                                inset 0 0 ${particle.size / 3}px rgba(255,255,255,0.6)`,
                    filter: `blur(${particle.blur}px)`,
                  }}
                />
              )
            } else {
              // triangle
              const triangleSize = particle.size * 1.5
              shapeElement = (
                <div
                  className="absolute"
                  style={{
                    left: particle.left,
                    top: particle.top,
                    width: 0,
                    height: 0,
                    borderLeft: `${triangleSize / 2}px solid transparent`,
                    borderRight: `${triangleSize / 2}px solid transparent`,
                    borderBottom: `${triangleSize}px solid ${particle.color}`,
                    opacity: particle.opacity,
                    transform: `rotate(${particle.rotation}deg) translateZ(${particle.zIndex}px)`,
                    filter: `blur(${particle.blur}px)`,
                  }}
                />
              )
            }

            return (
              <motion.div
                key={i}
                className="absolute cursor-pointer"
                style={{
                  left: particle.left,
                  top: particle.top,
                  zIndex: particle.zIndex + 5,
                }}
                whileHover={{
                  scale: 1.5,
                  rotate: particle.rotation + 45,
                  z: particle.zIndex + 20,
                  filter: "brightness(1.2)",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
                  transition: { duration: 0.3 },
                }}
              >
                {shapeElement}
              </motion.div>
            )
          })}
        </div>

        {/* Content on top of background */}
        <div className="relative z-10 flex flex-col h-full p-10 justify-between text-white">
          <motion.div
            className="text-2xl font-medium text-center"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            Event
            <motion.span
              className="text-amber-400"
              animate={{
                scale: [1, 1.05, 1],
                textShadow: [
                  "0px 0px 0px rgba(251, 191, 36, 0)",
                  "0px 0px 8px rgba(251, 191, 36, 0.5)",
                  "0px 0px 0px rgba(251, 191, 36, 0)",
                ],
              }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }}
            >
              Ease
            </motion.span>
          </motion.div>

          <div className="flex flex-col items-start justify-center space-y-8">
            <div className="text-left space-y-4">
              <motion.h2
                className="text-5xl font-bold tracking-tight"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
              >
                YOUR <span className="text-amber-400">EVENT</span>
                <br />
                OUR <span className="text-amber-400">EXPERTISE</span>
              </motion.h2>
              <motion.p
                className="text-lg max-w-md opacity-90"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 0.9 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
              >
                We'll connect you with the right people to bring your event to life, stress-free.
              </motion.p>
            </div>
          </div>

          {/* Animated rotating tips - Fixed height and width */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.div
              className="p-2 rounded-full bg-amber-400 text-white flex-shrink-0"
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </motion.div>
            <div className="w-full max-w-xs">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentTipIndex}
                  className="text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }} // Slower fade transition
                  style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
                >
                  Tip: {tips[currentTipIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-gradient-to-br from-amber-50 to-white">
        <motion.div
          className="w-full max-w-md space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="text-center">
            <h1 className="text-2xl font-medium text-gray-800">
              Welcome to Event<span className="text-amber-500">Ease</span>!
            </h1>
            <p className="mt-2 text-gray-600">Please sign in to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Login Buttons Container */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Google Login Button (Styled) */}
              <motion.button
                type="button"
                onClick={() => handleSocialLogin("Google")}
                className="flex items-center justify-center w-full h-12 border rounded-lg shadow-sm hover:shadow-md transition text-gray-700 hover:bg-gray-50"
                whileHover={{ scale: 1.02, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                whileTap={{ scale: 0.98 }}
              >
                <FcGoogle size={24} className="mr-2" />
                <span className="hidden sm:inline">Login with Google</span>
                <span className="sm:hidden">Google</span>
              </motion.button>

              {/* Facebook Login Button (Styled) */}
              {/*<motion.button
                type="button"
                onClick={() => handleSocialLogin("Facebook")}
                className="flex items-center justify-center w-full h-12 border rounded-lg shadow-sm hover:shadow-md transition text-gray-700 hover:bg-gray-50"
                whileHover={{ scale: 1.02, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                whileTap={{ scale: 0.98 }}
              >
                <FaFacebook size={24} className="mr-2 text-blue-600" />
                <span className="hidden sm:inline">Login with Facebook</span>
                <span className="sm:hidden">Facebook</span>
              </motion.button>*/}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Email input */}
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <CustomInput
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                hint="planease@gmail.com"
                className="w-full"
                required
              />
            </div>

            {/* Password input */}
            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <CustomInput
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  hint="Enter your password"
                  className="w-full"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Forgot password link */}
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-gray-600 hover:text-amber-500">
                Forgot password?
              </Link>
            </div>

            {/* Error message - Moved to appear above the login button */}
            {error && (
              <motion.div
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
                role="alert"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <span className="block sm:inline">{error}</span>
              </motion.div>
            )}

            {/* Login button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <CustomButton
                type="submit"
                className="w-full h-12 bg-gray-800 hover:bg-gray-900 text-white"
                fontSize="text-sm"
                disabled={isLoading}
              >
                {isLoading ? "LOGGING IN..." : "LOGIN"}
              </CustomButton>
            </motion.div>

            {/* Sign up link */}
            <div className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-amber-500 hover:underline">
                Sign up
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
