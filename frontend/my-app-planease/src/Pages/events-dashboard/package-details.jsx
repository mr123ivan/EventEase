"use client"

import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import { saveServicesData, clearBookingData } from "../booking-pages/utils/booking-storage"

const PackageDetails = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { package_id } = useParams()
  const [packageData, setPackageData] = useState(null)
  const [packageServices, setPackageServices] = useState([])
  const [allPackages, setAllPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchPackageData = async () => {
      try {
        const token = localStorage.getItem("token")
        setLoading(true)

        // Validate package_id is a number
        if (!package_id || isNaN(Number(package_id))) {
          setError("Invalid package ID")
          setLoading(false)
          return
        }

        // Fetch specific package using the package ID
        const packageResponse = await axios.get(`${API_BASE_URL}/package/get/${package_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!packageResponse.data) {
          setError("Package not found")
          setLoading(false)
          return
        }
      
        setPackageData(packageResponse.data)

        // Always use the serviceAttachments endpoint for detailed service information
        try {
          const serviceAttachmentsResponse = await axios.get(`${API_BASE_URL}/package/service/${package_id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          // console.log("serviceAttachmentsResponse", serviceAttachmentsResponse.data) // COMMENTED OUT - Exposes API response data with service details
          setPackageServices(serviceAttachmentsResponse.data || [])
        } catch (attachmentError) {
          console.error("Error fetching service attachments:", attachmentError)

          // If serviceAttachments fails, create basic service info from packageServices
          if (packageResponse.data.packageServices && packageResponse.data.packageServices.length > 0) {
            const basicServices = packageResponse.data.packageServices.map((service, index) => ({
              packageServiceId: service.package_service_id,
              subcontractorServiceName: `Service ${service.package_service_id}`,
              packageId: Number(package_id),
              packageName: packageResponse.data.packageName,
            }))
            setPackageServices(basicServices)
          } else {
            setPackageServices([])
          }
        }

        // Fetch all packages for the "other packages" section
        const allPackagesResponse = await axios.get(`${API_BASE_URL}/package/getall`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setAllPackages(allPackagesResponse.data || [])

        setLoading(false)
      } catch (error) {
        console.error("Error fetching package data:", error)
        if (error.response?.status === 404) {
          setError("Package not found")
        } else {
          setError("Failed to load package data")
        }
        setLoading(false)
      }
    }

    if (package_id) {
      fetchPackageData()
    } else {
      setError("No package ID provided")
      setLoading(false)
    }
  }, [package_id])

  const handlePackageNavigation = (packageId) => {
    navigate(`/package/${packageId}`)
  }

  // Function to map package data to booking storage format
  const mapPackageToBookingFormat = (packageData) => {
    // Create a mapping based on package name or ID
    const packageName = packageData.packageName?.toLowerCase()

    if (packageName?.includes("tulip")) {
      return "tulip"
    } else if (packageName?.includes("cherry") || packageName?.includes("blossom")) {
      return "cherry-blossom"
    } else if (packageName?.includes("rose")) {
      return "rose"
    }

    // Fallback: create a dynamic package object
    return {
      id: `package-${packageData.packageId}`,
      name: packageData.packageName,
      price: packageData.packagePrice,
      icon: "📦", // Default icon
      description: packageData.packageDescription || "Custom package",
      packageId: packageData.packageId,
      services: packageServices,
    }
  }

  // Handle booking button click
  const handleBookNow = () => {
    if (!packageData) {
      alert("Package data not available. Please try again.")
      return
    }

    try {
      // Clear any existing booking data
      clearBookingData()

      // Map the live package data to the booking format
      const mappedPackage = mapPackageToBookingFormat(packageData)

      // Store the live package data in booking storage
      saveServicesData({
        activeTab: "package",
        selectedServices: {},
        selectedPackage: typeof mappedPackage === "string" ? mappedPackage : mappedPackage.id,
        availableServices: [],
        livePackageData: {
          packageId: packageData.packageId,
          packageName: packageData.packageName,
          packagePrice: packageData.packagePrice,
          packageDescription: packageData.packageDescription,
          packageImage: packageData.packageImage,
          services: packageServices,
        },
      })

      // Store additional data in sessionStorage for the booking flow
      sessionStorage.setItem("currentPackageName", packageData.packageName)
      sessionStorage.setItem("currentPackageId", packageData.packageId.toString())
      sessionStorage.setItem("currentEventId", packageData.packageId.toString())
      sessionStorage.setItem("currentEventName", packageData.packageName)

      // console.log("Stored package data for booking:", {
      //   packageId: packageData.packageId,
      //   packageName: packageData.packageName,
      //   packagePrice: packageData.packagePrice,
      //   mappedPackage: mappedPackage,
      // }) // COMMENTED OUT - Exposes sensitive package data structure and IDs

      // Navigate to the booking flow with the package name
      navigate(`/book/${encodeURIComponent(packageData.packageName)}/package/inputdetails`)
    } catch (error) {
      console.error("Error preparing booking data:", error)
      alert("Error preparing booking. Please try again.")
    }
  }

  // Additional services arrays for each package (updated based on green arrows)
  const cherryBlossomAdditionalServices = [
    { name: "Bridal Gown (Rental)" },
    { name: "Groom Suit (Rental)" },
    { name: "Bridal Entourage gown, suit and flowers." },
    { name: "Wine for toasting" },
  ]
  const tulipAdditionalServices = [
    { name: "Bridal Gown (Owned)" },
    { name: "Groom Suit (Owned)" },
    { name: "Bridal Entourage gown, suit and flowers." },
    { name: "Wine for toasting" },
    { name: "Doves" },
    { name: "1 Lechon" },
  ]
  const roseAdditionalServices = [
    { name: "Bridal Gown (1st Use)" },
    { name: "Groom Suit (1st Use)" },
    { name: "Bridal Entourage gown, suit and flowers." },
    { name: "Wine for toasting" },
    { name: "Doves" },
  ]

  // Determine which additional services to use based on package name
  let additionalServices = []
  const packageName = packageData?.packageName?.toLowerCase() || ""
  if (packageName.includes("cherry")) additionalServices = cherryBlossomAdditionalServices
  else if (packageName.includes("tulip")) additionalServices = tulipAdditionalServices
  else if (packageName.includes("rose")) additionalServices = roseAdditionalServices

  // Combine additional services and backend services for display
  const allServicesToDisplay = [
    ...additionalServices,
    ...packageServices.map((s) => ({ name: s.subcontractorServiceCategory || `Service` })),
  ]

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 font-sans p-20">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading package details...</div>
        </div>
      </div>
    )
  }

  if (error || !packageData) {
    return (
      <div className="p-6 bg-gray-100 font-sans p-20">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-600">{error || "Package not found"}</div>
        </div>
      </div>
    )
  }

  // Filter out the current package from the list of other packages
  const otherPackages = allPackages.filter((pkg) => pkg.packageId !== Number.parseInt(package_id))

  return (
    <div className="p-6 bg-gray-100 font-sans p-20">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <span className="cursor-pointer" onClick={() => navigate("/home")}>
          Home /
        </span>
        <span className="text-gray-500">&nbsp; {packageData.packageName}</span>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <div className="d-flex flex-col gap-4">
          {/* Main Package Image */}
          <div className="bg-gray-200 rounded-lg flex justify-center items-center p-4 h-[240px] md:h-[320px] lg:h-[400px]">
            {packageData.packageImage ? (
              <img
                src={packageData.packageImage || "/placeholder.svg"}
                alt={packageData.packageName}
                className="w-full max-w-sm rounded-xl object-cover h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full text-gray-500">
                <span>No Image Available</span>
              </div>
            )}
          </div>

          {/* Other Packages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            {otherPackages.map((pkg) => (
              <div
                key={pkg.packageId}
                className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4 hover:cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handlePackageNavigation(pkg.packageId)}
              >
                {pkg.packageImage ? (
                  <img
                    src={pkg.packageImage || "/placeholder.svg"}
                    alt={pkg.packageName}
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-500">No Img</span>
                  </div>
                )}
                <span className="text-sm font-medium">{pkg.packageName}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Package Details */}
        <div className="bg-white shadow-sm rounded-xl p-10 flex-1">
          <h3 className="text-lg text-gray-600 mb-1">200 Pax</h3>
          <h1 className="text-2xl font-bold text-gray-900">{packageData.packageName?.toUpperCase()}</h1>
          <p className="text-xl text-gray-700 my-4 font-semibold">₱{packageData.packagePrice?.toLocaleString()}</p>

          {/* Package Description */}
          {packageData.packageDescription && (
            <div className="mb-4">
              <p className="text-gray-600">{packageData.packageDescription}</p>
            </div>
          )}

          {/* Services Section */}
          <p className="font-semibold mb-2">What's Included</p>
          <div className="flex flex-wrap gap-2">
            {allServicesToDisplay.length > 0 ? (
              allServicesToDisplay.map((service, index) => (
                <span
                  key={index}
                  className="bg-[#FFE1AC] text-sm px-3 py-1 rounded-full hover:cursor-pointer"
                >
                  {service.name}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm">No services available for this package</span>
            )}
          </div>

          <button
            className="mt-6 w-full lg:w-auto bg-black text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-gray-800 transition hover:cursor-pointer"
            onClick={handleBookNow}
          >
            BOOK A WEDDING
          </button>
        </div>
      </div>

      {/* Footer Icons */}
      <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col sm:flex-row justify-around text-center gap-6">
        <div>
          <div className="text-2xl mb-1">🛠️</div>
          <p className="text-sm font-medium">Trusted Professionals</p>
        </div>
        <div>
          <div className="text-2xl mb-1">✅</div>
          <p className="text-sm font-medium">Secure & Easy</p>
        </div>
        <div>
          <div className="text-2xl mb-1">📦</div>
          <p className="text-sm font-medium">Event-Ready Options</p>
        </div>
      </div>
    </div>
  )
}

export default PackageDetails
