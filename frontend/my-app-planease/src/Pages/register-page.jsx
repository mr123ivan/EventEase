"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Eye, EyeOff, ChevronDown, X } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import CustomInput from "../Components/CustomInput"
import CustomButton from "../Components/CustomButton"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [firstname, setFirstname] = useState("")
  const [lastname, setLastname] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordErrors, setPasswordErrors] = useState([])
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordsMatch, setPasswordsMatch] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const navigate = useNavigate()

  // OTP Modal states
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [otpValue, setOtpValue] = useState("")
  const [otpError, setOtpError] = useState("")
  const [otpTimer, setOtpTimer] = useState(300)
  const [isResendingOTP, setIsResendingOTP] = useState(false)
  const [isSendingOTP, setIsSendingOTP] = useState(false)
  const [pendingRegistrationData, setPendingRegistrationData] = useState(null)
  const otpTimerRef = useRef(null)

  // Location state
  const [regions, setRegions] = useState([])
  const [provinces, setProvinces] = useState([])
  const [citiesMunicipalities, setCitiesMunicipalities] = useState([])
  const [barangays, setBarangays] = useState([])

  const [selectedRegion, setSelectedRegion] = useState("")
  const [selectedProvince, setSelectedProvince] = useState("")
  const [selectedCityMunicipality, setSelectedCityMunicipality] = useState("")
  const [selectedBarangay, setSelectedBarangay] = useState("")

  // Add these state variables to track the names
  const [selectedRegionName, setSelectedRegionName] = useState("")
  const [selectedProvinceName, setSelectedProvinceName] = useState("")
  const [selectedCityMunicipalityName, setSelectedCityMunicipalityName] = useState("")
  const [selectedBarangayName, setSelectedBarangayName] = useState("")

  // Add this after the existing location state variables
  const [isOutsideMasbate, setIsOutsideMasbate] = useState(false)

  const [phoneNumber, setPhoneNumber] = useState("")
  const [selectedCountry, setSelectedCountry] = useState({ code: "PH", dialCode: "+63", flag: "🇵🇭" })
  const [showCountryList, setShowCountryList] = useState(false)
  const countryListRef = useRef(null)

  // Tips rotation state
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  const tips = [
    "Create a detailed profile to help vendors understand your needs better.",
    "Compare multiple vendors before making your final decision.",
    "Book early to secure your preferred date and time.",
    "Read reviews from other clients to find the best service providers.",
    "Use our messaging system to communicate directly with vendors.",
    "Save your favorite vendors to revisit them later.",
    "Complete your location details to find services near you.",
  ]

  // Cycle through tips every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % tips.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [tips.length])

  // Countries data with flags and dial codes
  const [countries, setCountries] = useState([
    { code: "PH", dialCode: "+63", flag: "🇵🇭", name: "Philippines" }, // Default while loading
  ])

  // Format seconds to MM:SS display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Generate confetti particles data with useMemo to ensure it doesn't regenerate on re-renders
  const confettiParticles = useMemo(() => {
    // Colors for the confetti particles - using amber tones to match the login page
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

  // Add this useEffect to fetch countries
  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name,cca2,idd,flag")
      .then((response) => response.json())
      .then((data) => {
        const formattedCountries = data
          .filter((country) => country.idd.root) // Only countries with dial codes
          .map((country) => ({
            code: country.cca2,
            dialCode: country.idd.root + (country.idd.suffixes?.[0] || ""),
            flag: country.flag,
            name: country.name.common,
          }))
          .sort((a, b) => a.name.localeCompare(b.name))

        // Set Philippines as first in the list
        const philippines = formattedCountries.find((c) => c.code === "PH")
        const withoutPH = formattedCountries.filter((c) => c.code !== "PH")

        setCountries([philippines, ...withoutPH].filter(Boolean))
      })
      .catch((error) => {
        console.error("Error fetching countries:", error)
        // Fallback to the hardcoded list if API fails
      })
  }, [])

  // Replace the existing useEffect for fetching regions
  useEffect(() => {
    const fetchRegionsAndSetDefaults = async () => {
      try {
        const regionsResponse = await axios.get("https://psgc.gitlab.io/api/regions/")
        setRegions(regionsResponse.data)

        // Find Masbate region (Region V - Bicol Region)
        const masbateRegion = regionsResponse.data.find(
          (region) => region.name.includes("Bicol") || region.code === "050000000",
        )

        if (masbateRegion) {
          setSelectedRegion(masbateRegion.code)
          setSelectedRegionName(masbateRegion.name)

          // Fetch provinces for Bicol region
          const provincesResponse = await axios.get(
            `https://psgc.gitlab.io/api/regions/${masbateRegion.code}/provinces/`,
          )
          setProvinces(provincesResponse.data)

          // Find Masbate province
          const masbateProvince = provincesResponse.data.find((province) => province.name.includes("Masbate"))

          if (masbateProvince) {
            setSelectedProvince(masbateProvince.code)
            setSelectedProvinceName(masbateProvince.name)

            // Fetch cities/municipalities for Masbate
            const citiesResponse = await axios.get(
              `https://psgc.gitlab.io/api/provinces/${masbateProvince.code}/cities-municipalities/`,
            )
            setCitiesMunicipalities(citiesResponse.data)
          }
        }
      } catch (err) {
        console.error("Error setting up default location:", err)
      }
    }

    fetchRegionsAndSetDefaults()
  }, [])

  // Reset OTP input and error when modal opens
  useEffect(() => {
    if (showOTPModal) {
      setOtpValue("")
      setOtpError("")
      if (otpTimerRef.current) clearInterval(otpTimerRef.current)
    }
  }, [showOTPModal])

  // Start timer only when modal is open and isSendingOTP becomes false
  useEffect(() => {
    if (showOTPModal && !isSendingOTP) {
      setOtpTimer(300)
      if (otpTimerRef.current) clearInterval(otpTimerRef.current)
      otpTimerRef.current = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            clearInterval(otpTimerRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(otpTimerRef.current)
    }
    // If modal closes or loading starts, clear timer
    return () => {
      if (otpTimerRef.current) clearInterval(otpTimerRef.current)
    }
  }, [showOTPModal, isSendingOTP])

  // Update the handleRegionChange function
  const handleRegionChange = async (e) => {
    const regionCode = e.target.value
    const regionName = e.target.options[e.target.selectedIndex].text

    setSelectedRegion(regionCode)
    setSelectedRegionName(regionName)

    setSelectedProvince("")
    setSelectedProvinceName("")
    setSelectedCityMunicipality("")
    setSelectedCityMunicipalityName("")
    setSelectedBarangay("")
    setSelectedBarangayName("")

    setProvinces([])
    setCitiesMunicipalities([])
    setBarangays([])

    if (regionCode) {
      const { data } = await axios.get(`https://psgc.gitlab.io/api/regions/${regionCode}/provinces/`)
      setProvinces(data)
    }
  }

  // Update the handleProvinceChange function
  const handleProvinceChange = async (e) => {
    const provinceCode = e.target.value
    const provinceName = e.target.options[e.target.selectedIndex].text

    setSelectedProvince(provinceCode)
    setSelectedProvinceName(provinceName)

    setSelectedCityMunicipality("")
    setSelectedCityMunicipalityName("")
    setSelectedBarangay("")
    setSelectedBarangayName("")

    setCitiesMunicipalities([])
    setBarangays([])

    if (provinceCode) {
      const { data } = await axios.get(`https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities/`)
      setCitiesMunicipalities(data)
    }
  }

  // Update the handleCityMunicipalityChange function
  const handleCityMunicipalityChange = async (e) => {
    const cityCode = e.target.value
    const cityName = e.target.options[e.target.selectedIndex].text

    setSelectedCityMunicipality(cityCode)
    setSelectedCityMunicipalityName(cityName)

    setSelectedBarangay("")
    setSelectedBarangayName("")

    setBarangays([])

    if (cityCode) {
      const { data } = await axios.get(`https://psgc.gitlab.io/api/cities-municipalities/${cityCode}/barangays/`)
      setBarangays(data)
    }
  }

  // Add a handler for barangay selection
  const handleBarangayChange = (e) => {
    const barangayCode = e.target.value
    const barangayName = e.target.options[e.target.selectedIndex].text

    setSelectedBarangay(barangayCode)
    setSelectedBarangayName(barangayName)
  }

  // Add this handler after the existing location handlers
  const handleOutsideMasbateChange = async (e) => {
    const isChecked = e.target.checked
    setIsOutsideMasbate(isChecked)

    if (!isChecked) {
      // Reset to Masbate defaults
      const masbateRegion = regions.find((region) => region.name.includes("Bicol") || region.code === "050000000")

      if (masbateRegion) {
        setSelectedRegion(masbateRegion.code)
        setSelectedRegionName(masbateRegion.name)

        try {
          const provincesResponse = await axios.get(
            `https://psgc.gitlab.io/api/regions/${masbateRegion.code}/provinces/`,
          )
          setProvinces(provincesResponse.data)

          const masbateProvince = provincesResponse.data.find((province) => province.name.includes("Masbate"))

          if (masbateProvince) {
            setSelectedProvince(masbateProvince.code)
            setSelectedProvinceName(masbateProvince.name)

            const citiesResponse = await axios.get(
              `https://psgc.gitlab.io/api/provinces/${masbateProvince.code}/cities-municipalities/`,
            )
            setCitiesMunicipalities(citiesResponse.data)
          }
        } catch (err) {
          console.error("Error resetting to Masbate:", err)
        }
      }

      // Clear city and barangay selections
      setSelectedCityMunicipality("")
      setSelectedCityMunicipalityName("")
      setSelectedBarangay("")
      setSelectedBarangayName("")
      setBarangays([])
    } else {
      // Clear all selections when enabling outside Masbate
      setSelectedRegion("")
      setSelectedRegionName("")
      setSelectedProvince("")
      setSelectedProvinceName("")
      setSelectedCityMunicipality("")
      setSelectedCityMunicipalityName("")
      setSelectedBarangay("")
      setSelectedBarangayName("")
      setProvinces([])
      setCitiesMunicipalities([])
      setBarangays([])
    }
  }

  // Close country dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (countryListRef.current && !countryListRef.current.contains(event.target)) {
        setShowCountryList(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const validatePassword = (password) => {
    const errors = []
    let strength = 0

    // Check if it contains a capital letter
    if (/[A-Z]/.test(password)) {
      strength += 1
    } else {
      errors.push("Must have a capital letter")
    }

    // Check if it contains a number
    if (/\d/.test(password)) {
      strength += 1
    } else if (!errors.includes("Must have a capital letter")) {
      errors.push("Must have a number")
    }

    // Check if it contains a unique character
    if (/[^A-Za-z0-9]/.test(password)) {
      strength += 1
    } else if (!errors.includes("Must have a capital letter") && !errors.includes("Must have a number")) {
      errors.push("Must have a unique character")
    }

    setPasswordStrength(strength)
    setPasswordErrors(errors)
  }

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    validatePassword(newPassword)
  }

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value
    setConfirmPassword(value)
    setPasswordsMatch(value === password)
  }

  // Modified handleRegister function to show OTP modal instead of registering immediately
  const handleRegister = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage("")

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.")
      setIsSubmitting(false)
      return
    }

    // Prepare registration data
    const registrationData = {
      firstname,
      lastname,
      email,
      password,
      phoneNumber: selectedCountry.dialCode + phoneNumber,
      region: selectedRegionName,
      province: selectedProvinceName,
      cityAndMul: selectedCityMunicipalityName,
      barangay: selectedBarangayName,
      role: "User",
      profilePicture: null,
      isGoogle: false,
      isFacebook: false,
    }

    // Store registration data for later use
    setPendingRegistrationData(registrationData)

    // Show OTP modal and send OTP
    setShowOTPModal(true)
    setIsSendingOTP(true)

    try {
      const response = await axios.get(`http://localhost:8080/email/send-email/${email}`)
      if (response && response.data) {
        console.log("OTP email response:", response.data)
      }
    } catch (err) {
      console.error("Failed to send OTP:", err)
      setOtpError("Failed to send OTP. Please try again.")
    } finally {
      setIsSendingOTP(false)
      setIsSubmitting(false)
    }
  }

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
                CREATE YOUR <span className="text-amber-400">ACCOUNT</span>
                <br />
                START <span className="text-amber-400">PLANNING</span>
              </motion.h2>
              <motion.p
                className="text-lg max-w-md opacity-90"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 0.9 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
              >
                Join our community of event planners and service providers to make your next event a success.
              </motion.p>
            </div>
          </div>

          {/* Animated rotating tips */}
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
                  transition={{ duration: 1 }}
                  style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
                >
                  Tip: {tips[currentTipIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Sign Up form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-gradient-to-br from-amber-50 to-white overflow-y-auto">
        <motion.div
          className="w-full max-w-md space-y-6 py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="text-center">
            <h1 className="text-2xl font-medium text-gray-800">
              Welcome to Event<span className="text-amber-500">Ease</span>!
            </h1>
            <p className="mt-2 text-gray-600">Create your account to get started</p>
          </div>

          {/* Error message */}
          {errorMessage && (
            <motion.div
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
              role="alert"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="block sm:inline">{errorMessage}</span>
            </motion.div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Firstname and Lastname in the same row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Firstname */}
              <div className="space-y-1">
                <label htmlFor="firstname" className="text-sm font-medium text-gray-700">
                  First Name
                </label>
                <CustomInput
                  id="firstname"
                  type="text"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  hint="John"
                  className="w-full"
                  required
                />
              </div>

              {/* Lastname */}
              <div className="space-y-1">
                <label htmlFor="lastname" className="text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <CustomInput
                  id="lastname"
                  type="text"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  hint="Doe"
                  className="w-full"
                  required
                />
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

            {/* Phone Number input with country code */}
            <div className="space-y-1">
              <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="flex">
                <div className="relative">
                  <motion.button
                    type="button"
                    className="flex items-center justify-between h-10 px-3 bg-white border-b border-gray-300 focus:border-amber-500 transition-colors rounded-l"
                    onClick={() => setShowCountryList(!showCountryList)}
                    aria-label="Select country code"
                    whileHover={{ backgroundColor: "rgba(251, 191, 36, 0.1)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="mr-2 text-lg">{selectedCountry.flag}</span>
                    <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
                    <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
                  </motion.button>

                  {/* Country dropdown */}
                  {showCountryList && (
                    <div
                      ref={countryListRef}
                      className="absolute z-10 mt-1 w-64 max-h-60 overflow-y-auto bg-white border rounded-md shadow-lg"
                    >
                      <div className="sticky top-0 bg-white border-b">
                        <input
                          type="text"
                          placeholder="Search countries..."
                          className="w-full p-2 text-sm border-none focus:outline-none"
                          onChange={(e) => {
                            const searchTerm = e.target.value.toLowerCase()
                            const filteredCountries = countries.filter(
                              (country) =>
                                country.name.toLowerCase().includes(searchTerm) ||
                                country.dialCode.includes(searchTerm),
                            )
                            // You would need to add state for filtered countries
                            // setFilteredCountries(filteredCountries);
                          }}
                        />
                      </div>
                      {countries.map((country) => (
                        <motion.button
                          key={country.code}
                          type="button"
                          className="flex items-center w-full px-4 py-2 text-left hover:bg-amber-50 transition-colors"
                          onClick={() => {
                            setSelectedCountry(country)
                            setShowCountryList(false)
                          }}
                          whileHover={{ backgroundColor: "rgba(251, 191, 36, 0.1)" }}
                        >
                          <span className="mr-2 text-lg">{country.flag}</span>
                          <span className="text-sm">{country.name}</span>
                          <span className="ml-auto text-sm text-gray-500">{country.dialCode}</span>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>

                <CustomInput
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    // Only allow numbers
                    const value = e.target.value.replace(/[^0-9]/g, "")
                    setPhoneNumber(value)
                  }}
                  hint="9123456789"
                  className="w-full rounded-r"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter your number without the country code</p>
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
                  onChange={handlePasswordChange}
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

            {/* Show password strength and errors with smooth animation */}
            <div
              className="space-y-3 overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                maxHeight: password ? "200px" : "0",
                opacity: password ? 1 : 0,
                margin: password ? "1rem 0" : "0",
              }}
            >
              {/* Password Strength */}
              <div
                className="space-y-1 transition-all duration-400 ease-in-out"
                style={{
                  transform: password ? "translateY(0)" : "translateY(10px)",
                  opacity: password ? 1 : 0,
                  transitionDelay: "100ms",
                }}
              >
                <div className="text-sm font-medium text-gray-700">Password Strength</div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      passwordStrength === 3 ? "bg-green-500" : passwordStrength === 2 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                    style={{
                      width: `${(passwordStrength / 3) * 100}%`,
                      transitionDelay: "200ms",
                    }}
                  ></div>
                </div>
              </div>

              {/* Password requirements */}
              {passwordErrors.length > 0 && (
                <div
                  className="space-y-1 text-sm text-red-500 transition-all duration-400 ease-in-out"
                  style={{
                    transform: password ? "translateY(0)" : "translateY(10px)",
                    opacity: password ? 1 : 0,
                    transitionDelay: "250ms",
                  }}
                >
                  {passwordErrors.map((error, index) => (
                    <div
                      key={index}
                      className="transition-all duration-300"
                      style={{
                        transitionDelay: `${300 + index * 50}ms`,
                      }}
                    >
                      {error}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password input */}
            {passwordStrength === 3 && (
              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <CustomInput
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    hint="Enter your password"
                    className="w-full"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {!passwordsMatch && <div className="text-sm text-red-500">Passwords do not match</div>}
              </div>
            )}

            {/* Location Section with Masbate Default */}
            <div className="space-y-4">
              {/* Checkbox for outside Masbate */}
              <div className="inline-flex items-center mb-4">
                <input
                  type="checkbox"
                  id="outsideMasbate"
                  checked={isOutsideMasbate}
                  onChange={handleOutsideMasbateChange}
                  className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-0"
                />
                <label htmlFor="outsideMasbate" className="ml-2 text-sm text-gray-700 whitespace-nowrap">
                  I'm outside the region of Masbate
                </label>
              </div>

              {/* Conditionally show Region and Province if outside Masbate */}
              {isOutsideMasbate && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Region */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Region</label>
                    <select
                      className="w-full p-2 border rounded focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 transition-all"
                      onChange={handleRegionChange}
                      value={selectedRegion}
                      required
                    >
                      <option value="">Select Region</option>
                      {regions.map((region) => (
                        <option key={region.code} value={region.code}>
                          {region.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Province */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Province</label>
                    <select
                      className="w-full p-2 border rounded focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 transition-all"
                      onChange={handleProvinceChange}
                      disabled={!selectedRegion}
                      value={selectedProvince}
                      required
                    >
                      <option value="">Select Province</option>
                      {provinces.map((province) => (
                        <option key={province.code} value={province.code}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Always show City/Municipality and Barangay */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* City/Municipality */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    City/Municipality {!isOutsideMasbate && <span className="text-gray-500">(Masbate)</span>}
                  </label>
                  <select
                    className="w-full p-2 border rounded focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 transition-all"
                    onChange={handleCityMunicipalityChange}
                    disabled={isOutsideMasbate ? !selectedProvince : false}
                    value={selectedCityMunicipality}
                    required
                  >
                    <option value="">Select City/Municipality</option>
                    {citiesMunicipalities.map((city) => (
                      <option key={city.code} value={city.code}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Barangay */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Barangay</label>
                  <select
                    className="w-full p-2 border rounded focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 transition-all"
                    onChange={handleBarangayChange}
                    disabled={!selectedCityMunicipality}
                    value={selectedBarangay}
                    required
                  >
                    <option value="">Select Barangay</option>
                    {barangays.map((barangay) => (
                      <option key={barangay.code} value={barangay.code}>
                        {barangay.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Sign Up button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <CustomButton
                type="submit"
                className="w-full h-12 bg-gray-800 hover:bg-gray-900 text-white"
                fontSize="text-sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? "SENDING OTP..." : "SIGN UP"}
              </CustomButton>
            </motion.div>

            {/* Link to Login */}
            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-amber-500 hover:underline">
                Log in
              </Link>
            </div>
          </form>
        </motion.div>
      </div>

      {/* OTP Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className="bg-white rounded-md shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300 relative"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="bg-slate-900 h-12 relative flex items-center justify-between px-4">
              <div className="text-white font-medium">Verify Your Email</div>
              <button
                onClick={() => {
                  setShowOTPModal(false)
                  setOtpError("Please enter a valid email")
                  setErrorMessage("Please enter a valid email")
                }}
                className="text-white hover:text-gray-300"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal content */}
            <div className="p-6 min-h-[200px] flex flex-col justify-center">
              {isSendingOTP ? (
                <div className="flex flex-col items-center justify-center h-full py-8">
                  <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <div className="text-gray-700 text-center font-medium">
                    We are sending you an OTP to your email...
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-4">
                    Please enter the 6-digit OTP sent to your email <span className="font-semibold">{email}</span>.
                  </p>
                  {otpError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">{otpError}</div>
                  )}
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault()
                      setOtpError("")
                      if (!otpValue || otpValue.length !== 6) {
                        setOtpError("Please enter the 6-digit OTP.")
                        return
                      }
                      try {
                        const response = await axios.get(`http://localhost:8080/email/validate-otp`, {
                          params: { email: email, OTP: otpValue },
                        })
                        if (response.data === true) {
                          // OTP is valid, proceed with registration
                          try {
                            const registerResponse = await axios.post(
                              "http://localhost:8080/user/register",
                              pendingRegistrationData,
                            )

                            if (registerResponse.status === 201 || registerResponse.status === 200) {
                              // After successful user registration, also create regular user entity
                              try {
                                await axios.post("http://localhost:8080/regularuser/create", registerResponse.data)
                              } catch (error) {
                                console.error("Regular user creation error:", error)
                                // Optionally handle error, but do not block navigation
                              }
                              setShowOTPModal(false)
                              navigate("/login")
                            }
                          } catch (error) {
                            console.error("Registration Error:", error)
                            setOtpError("Registration failed. Please try again.")
                          }
                        } else {
                          setOtpError("Invalid OTP. Please try again.")
                        }
                      } catch (err) {
                        setOtpError("Failed to validate OTP. Please try again.")
                      }
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <label htmlFor="otp" className="text-sm font-medium text-gray-700">
                        OTP
                      </label>
                      <input
                        id="otp"
                        type="text"
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                        className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-center tracking-widest text-lg"
                        placeholder="------"
                        maxLength={6}
                        autoFocus
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-sm text-gray-500">
                        {otpTimer > 0 ? (
                          <>
                            Resend OTP in <span className="font-semibold">{formatTime(otpTimer)}</span>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={async () => {
                              setIsResendingOTP(true)
                              setIsSendingOTP(true)
                              setOtpError("")
                              setOtpValue("")
                              try {
                                const response = await axios.get(`http://localhost:8080/email/send-email/${email}`)
                                if (response && response.data) {
                                  console.log("OTP email response:", response.data)
                                }
                              } catch (err) {
                                setOtpError("Failed to resend OTP. Please try again.")
                              }
                              setIsResendingOTP(false)
                              setIsSendingOTP(false)
                              setOtpTimer(300)
                              if (otpTimerRef.current) clearInterval(otpTimerRef.current)
                              otpTimerRef.current = setInterval(() => {
                                setOtpTimer((prev) => {
                                  if (prev <= 1) {
                                    clearInterval(otpTimerRef.current)
                                    return 0
                                  }
                                  return prev - 1
                                })
                              }, 1000)
                            }}
                            disabled={isResendingOTP}
                            className="text-amber-600 hover:underline disabled:opacity-60"
                          >
                            {isResendingOTP ? "Resending..." : "Resend OTP"}
                          </button>
                        )}
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-70"
                        disabled={otpValue.length !== 6}
                      >
                        Verify & Register
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
