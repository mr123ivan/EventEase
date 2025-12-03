"use client"

import React, { useEffect, useState } from "react"
import { X } from "lucide-react"

// Accessible modal component to view a customer's credentials/details
// Props:
// - open: boolean
// - onClose: function
// - user: { firstname, lastname, email, phoneNumber, region, province, cityAndMul, barangay }
const AdminCustomerModal = ({ open, onClose, user }) => {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phoneNumber: "",
    region: "",
    province: "",
    cityAndMul: "",
    barangay: "",
  })

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (open && user) {
      setForm({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        region: user.region || "",
        province: user.province || "",
        cityAndMul: user.cityAndMul || "",
        barangay: user.barangay || "",
      })
    }
  }, [open, user])

  if (!open) return null

  const handleChange = (e) => {
    // Inputs are read-only for admins, but keep handler to avoid React warnings if value changes
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-xl max-h-[90vh] flex flex-col rounded-lg bg-white border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 sm:px-6 py-3 sm:py-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">Customer Details</h2>
          <button
            onClick={onClose}
            aria-label="Close details"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstname" className="block text-sm text-gray-600">First name</label>
              <input
                id="firstname"
                name="firstname"
                type="text"
                value={form.firstname}
                onChange={handleChange}
                disabled
                className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <div>
              <label htmlFor="lastname" className="block text-sm text-gray-600">Last name</label>
              <input
                id="lastname"
                name="lastname"
                type="text"
                value={form.lastname}
                onChange={handleChange}
                disabled
                className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm text-gray-600">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                disabled
                className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm text-gray-600">Phone number</label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="text"
                value={form.phoneNumber}
                onChange={handleChange}
                disabled
                className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="region" className="block text-sm text-gray-600">Region</label>
              <input
                id="region"
                name="region"
                type="text"
                value={form.region}
                onChange={handleChange}
                disabled
                className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <div>
              <label htmlFor="province" className="block text-sm text-gray-600">Province</label>
              <input
                id="province"
                name="province"
                type="text"
                value={form.province}
                onChange={handleChange}
                disabled
                className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <div>
              <label htmlFor="cityAndMul" className="block text-sm text-gray-600">City/Municipality</label>
              <input
                id="cityAndMul"
                name="cityAndMul"
                type="text"
                value={form.cityAndMul}
                onChange={handleChange}
                disabled
                className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <div>
              <label htmlFor="barangay" className="block text-sm text-gray-600">Barangay</label>
              <input
                id="barangay"
                name="barangay"
                type="text"
                value={form.barangay}
                onChange={handleChange}
                disabled
                className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end border-t px-4 sm:px-6 py-3 sm:py-4">
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminCustomerModal
