"use client"

import React, { useEffect, useState, useCallback } from "react"
import axios from "axios"
import AdminSideBar from "../../Components/admin-sidebar.jsx"
import Navbar from "../../Components/Navbar"
import { Eye, Loader2, Menu, X } from "lucide-react"
import AdminCustomerModal from "../../Components/AdminCustomerModal.jsx"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [selectedUser, setSelectedUser] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    setErrorMessage("")
    try {
      const response = await axios.get(`${API_BASE_URL}/user/getCustomers`)
      const users = Array.isArray(response.data) ? response.data : []
      setCustomers(users)
    } catch (err) {
      console.error("[AdminCustomers] Failed to load customers", err)
      setErrorMessage("Failed to load customers. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const openDetails = (user) => {
    setSelectedUser(user)
    setIsDetailsOpen(true)
  }

  const addressOf = (u) => [u?.region, u?.province, u?.cityAndMul, u?.barangay].filter(Boolean).join(", ")

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex relative">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-64 shrink-0">
          <AdminSideBar />
        </aside>

        {/* Mobile hamburger */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open sidebar"
          className="md:hidden fixed left-4 top-20 z-40 inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 shadow-sm"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile drawer */}
        {isSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/40" onClick={() => setIsSidebarOpen(false)} aria-hidden="true" />
            <div className="relative z-10 h-full w-64 bg-white border-r border-gray-200">
              <div className="flex items-center justify-between border-b px-3 py-3">
                <span className="text-sm font-medium text-gray-700">Menu</span>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  aria-label="Close sidebar"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <AdminSideBar />
            </div>
          </div>
        )}

        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Customers</h1>
                <p className="text-xs sm:text-sm text-gray-500">Manage your platform users</p>
              </div>
            </div>

            <div className="rounded-lg bg-white border border-gray-200">
              <div className="border-b px-4 py-3 sm:px-6">
                <h2 className="text-base font-medium text-gray-700">All Users</h2>
              </div>

              {loading ? (
                <div className="flex items-center justify-center px-4 py-16">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  <span className="ml-2 text-sm text-gray-500">Loading customers…</span>
                </div>
              ) : errorMessage ? (
                <div className="px-4 py-8 text-center text-sm text-red-600">{errorMessage}</div>
              ) : customers.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500">No Customers</div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200" role="table" aria-label="Customers">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Address
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Contact-Number
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {customers.map((u) => (
                        <tr key={(u.userId ?? u.id)}>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800">
                            {u.firstname || ""} {u.lastname || ""}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{addressOf(u)}</td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{u.phoneNumber || "—"}</td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center justify-end">
                              <button
                                onClick={() => openDetails(u)}
                                aria-label={`View details for ${u.firstname || ""} ${u.lastname || ""}`}
                                className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-400"
                              >
                                <Eye className="h-4 w-4 text-sky-500" />
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3 p-4">
                  {customers.map((u) => (
                    <div key={(u.userId ?? u.id)} className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="mb-3">
                        <h3 className="font-medium text-gray-900 text-base">
                          {u.firstname || ""} {u.lastname || ""}
                        </h3>
                      </div>
                      
                      {addressOf(u) && (
                        <div className="mb-2 flex items-start gap-2">
                          <span className="text-xs font-medium text-gray-500 min-w-[80px]">Address:</span>
                          <span className="text-sm text-gray-700">{addressOf(u)}</span>
                        </div>
                      )}
                      
                      <div className="mb-3 flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 min-w-[80px]">Contact:</span>
                        <span className="text-sm text-gray-700">{u.phoneNumber || "—"}</span>
                      </div>
                      
                      <button
                        onClick={() => openDetails(u)}
                        aria-label={`View details for ${u.firstname || ""} ${u.lastname || ""}`}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-400"
                      >
                        <Eye className="h-4 w-4 text-sky-500" />
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </>
              )}
            </div>
          </div>
          </main>
        </div>

      <AdminCustomerModal
        open={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        user={selectedUser}
      />
    </div>
  )
}

export default AdminCustomers
