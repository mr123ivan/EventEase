"use client"

// AdminPanel.jsx
import { useEffect, useState } from "react"
import AdminSideBar from "../../Components/admin-sidebar.jsx"
import { Dialog } from "@headlessui/react"
import Navbar from "../../Components/Navbar"
import axios from "axios"

const AdminBookings = () => {
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [viewServicesModal, setViewServicesModal] = useState(false)
  const [viewPaymentModal, setViewPaymentModal] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [viewReasonModal, setViewReasonModal] = useState(false)
  const [isValidating, setIsValidating] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    axios
      .get("http://localhost:8080/api/transactions/getAllTransactions")
      .then((res) => {
        setTransactions(res.data)
        console.log(res.data)
      })
      .catch((err) => {
        if (err.response) {
          console.log(`[ERROR] Status: ${err.response.status}, Message: ${err.response.data?.message || "No message"}`)
        } else if (err.request) {
          console.log("[ERROR] No response from server")
        } else {
          console.log(`[ERROR] ${err.message}`)
        }
      })
  }

  const ValidateTransaction = async (validate) => {
    setIsValidating(true)

    try {
      const response = await axios.put(
        `http://localhost:8080/api/transactions/validateTransaction?transactionId=${selectedRequest?.transaction_Id}&status=${validate}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
      console.log(response.data)
      await fetchData()
    } catch (error) {
      console.error(error.response?.data || error.message)
      // Optionally show an error message here
    } finally {
      setIsValidating(false)
      setSelectedRequest(null)
      setViewServicesModal(false)
      setViewPaymentModal(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden md:block w-64 border-r bg-white">
          <AdminSideBar />
        </aside>

        <main className="flex-1 p-4 sm:p-6 md:p-10 bg-gray-50 overflow-auto">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">BOOKINGS</h2>
          <div className="bg-white shadow rounded-lg overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#F1F1FB] text-gray-700">
                <tr>
                  <th className="p-3 sm:p-4 whitespace-nowrap">Name</th>
                  <th className="p-3 sm:p-4 whitespace-nowrap">Event Date</th>
                  <th className="p-3 sm:p-4 whitespace-nowrap">Event Type</th>
                  <th className="p-3 sm:p-4 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions?.map((req) => (
                  <tr
                    key={req.transaction_Id}
                    className="hover:bg-gray-100 cursor-pointer"
                    onClick={() => setSelectedRequest(req)}
                  >
                    <td className="p-3 sm:p-4 whitespace-nowrap text-[#667085]">{req.userName}</td>
                    <td className="p-3 sm:p-4 whitespace-nowrap text-[#667085]">
                      {req.transactionDate.split(" - ")[0]}
                    </td>
                    {req.eventName != null ? (
                      <td className="p-3 sm:p-4 whitespace-nowrap text-[#667085]">{req.eventName}</td>
                    ) : (
                      <td className="p-3 sm:p-4 whitespace-nowrap text-[#667085]">{"Wedding"}</td>
                    )}
                    <td className="p-3 sm:p-4 whitespace-nowrap text-[#667085]">
                      <div
                        className={`inline-block px-4 py-1 rounded-full font-semibold text-sm text-center
                                            ${
                                              req.transactionStatus === "CANCELLED"
                                                ? "bg-[#FFB8B2] text-[#912018]"
                                                : req.transactionStatus === "ONGOING"
                                                  ? "bg-[#63A6FF] text-[#FFFFFF]"
                                                  : req.transactionStatus === "COMPLETED"
                                                    ? "bg-[#AFFAD2] text-[#05603A]"
                                                    : "bg-gray-100 text-gray-600"
                                            }`}
                      >
                        {req.transactionStatus}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      <Dialog
        open={!!selectedRequest && !viewServicesModal && !viewPaymentModal}
        onClose={() => setSelectedRequest(null)}
        className="fixed z-1150 shadow-md inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-4 sm:p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xl font-semibold">Booking Details</h3>
              <button onClick={() => setSelectedRequest(null)} className="text-xl hover:cursor-pointer">
                ×
              </button>
            </div>

            {selectedRequest && (
              <>
                <div>
                  <h4 className="font-semibold mb-2 text-[#FFB22C]">Personal Detail</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2 w-auto">
                      <div>
                        <label className="text-sm font-medium text-gray-500 block mb-1">Name</label>
                        <input
                          type="text"
                          className="border p-2 rounded w-full"
                          value={selectedRequest.userName}
                          readOnly
                        />
                      </div>
                      <div className="col-span-1 sm:col-span-2">
                        <label className="text-sm font-medium text-gray-500 block mb-1">Contact</label>
                        <input
                          type="text"
                          className="border p-2 rounded w-auto"
                          value={selectedRequest.phoneNumber}
                          readOnly
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">Email</label>
                      <input
                        type="text"
                        className="border p-2 rounded w-full"
                        value={selectedRequest.userEmail}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mt-6 mb-2 text-[#FFB22C]">Event Detail</h4>
                  <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-2 w-auto">
                    <div className="flex flex-col gap-2 w-auto">
                      {selectedRequest.packages != null ? (
                        <>
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-1">Event Type</label>
                            <input type="text" className="border p-2 rounded w-full" value={"Wedding"} readOnly />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-1">Package Type</label>
                            <input
                              type="text"
                              className="border p-2 rounded w-full"
                              value={selectedRequest.packages}
                              readOnly
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-1">Event Type</label>
                            <input
                              type="text"
                              className="border p-2 rounded w-full"
                              value={selectedRequest.eventName}
                              readOnly
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-1">Package Type</label>
                            <input type="text" className="border p-2 rounded w-full" value={"N/A"} readOnly />
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 w-auto">
                      <div>
                        <label className="text-sm font-medium text-gray-500 block mb-1">Location</label>
                        <input
                          type="text"
                          className="border p-2 rounded w-full"
                          value={selectedRequest.transactionVenue}
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 block mb-1">Date</label>
                        <input
                          type="text"
                          className="border p-2 rounded w-full"
                          value={selectedRequest.transactionDate}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col mt-2">
                  <div className="flex text-sm gap-2">
                    <div>
                      <label className="text-sm font-medium align-text-bottom text-gray-500 block mb-1">Note</label>
                    </div>
                    <div className="flex ml-auto gap-2">
                      <button className="text-[#FFB22C] hover:underline" onClick={() => setViewPaymentModal(true)}>
                        View Payment
                      </button>
                      <button className="text-[#FFB22C] hover:underline" onClick={() => setViewServicesModal(true)}>
                        View Chosen Services
                      </button>
                      {selectedRequest?.rejectedNote && (
                        <button className="text-[#FFB22C] hover:underline" onClick={() => setViewReasonModal(true)}>
                          View Reason
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <textarea
                      readOnly
                      className="w-full border p-3 rounded text-sm text-gray-600"
                      value={selectedRequest.transactionNote}
                    ></textarea>
                  </div>
                </div>
                {selectedRequest &&
                  !["CANCELLED", "COMPLETED", "DECLINED"].includes(selectedRequest.transactionStatus) && (
                    <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        onClick={() => ValidateTransaction("CANCELLED")}
                        disabled={isValidating}
                      >
                        {isValidating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            CANCELLING...
                          </>
                        ) : (
                          "CANCEL"
                        )}
                      </button>
                      <button
                        className="bg-green-500 text-white px-4 py-2 rounded w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        onClick={() => ValidateTransaction("COMPLETED")}
                        disabled={isValidating}
                      >
                        {isValidating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            COMPLETING...
                          </>
                        ) : (
                          "COMPLETE"
                        )}
                      </button>
                    </div>
                  )}
              </>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>

      <Dialog
        open={!!selectedRequest && viewServicesModal}
        onClose={() => setViewServicesModal(false)}
        className="fixed z-1150 shadow-md inset-0 overflow-y-auto hover:cursor-pointer"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xl font-semibold">Booking Details</h3>
              <button onClick={() => setViewServicesModal(false)} className="text-xl">
                ×
              </button>
            </div>
            <div className="mt-6">
              <h4 className="text-[#F79009] font-semibold mb-4">Chosen Services</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto text-sm text-left">
                  <thead className="bg-indigo-50">
                    <tr>
                      <th className="p-3 text-[#667085] font-semibold">Service Type</th>
                      <th className="p-3 text-[#667085] font-semibold">Subcontractor</th>
                      <th className="p-3 text-[#667085] font-semibold">Representative</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRequest?.subcontractors?.map((service, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-3 text-[#667085]">{service.serviceCategory}</td>
                        <td className="p-3 text-[#667085]">{service.serviceName}</td>
                        <td className="p-3 text-[#667085]">{service.subcontractorName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-end pt-6">
              <button
                onClick={() => setViewServicesModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      <Dialog
        open={!!selectedRequest && viewPaymentModal}
        onClose={() => setViewPaymentModal(false)}
        className="fixed z-1150 shadow-md inset-0 overflow-y-auto hover:cursor-pointer"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xl font-semibold">Booking Details</h3>
              <button onClick={() => setViewPaymentModal(false)} className="text-xl">
                ×
              </button>
            </div>
            <div className="mt-6">
              <h4 className="text-[#F79009] font-semibold mb-4">Payment Details</h4>
              <div className="flex justify-center items-center bg-gray-100 p-4 rounded">
                <img
                  src={selectedRequest?.payment?.paymentReceipt || "/placeholder.svg"}
                  alt="Payment Proof"
                  className="max-h-[500px] rounded"
                />
              </div>
            </div>
            <div className="flex justify-end pt-6">
              <button
                onClick={() => setViewPaymentModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      <Dialog
        open={!!selectedRequest && viewReasonModal}
        onClose={() => setViewReasonModal(false)}
        className="fixed z-1150 shadow-md inset-0 overflow-y-auto hover:cursor-pointer"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xl font-semibold">Rejection Reason</h3>
              <button onClick={() => setViewReasonModal(false)} className="text-xl">
                ×
              </button>
            </div>
            <div className="mt-6 space-y-4">
              <div>
                <h4 className="text-[#F79009] font-semibold mb-2">Reason</h4>
                <p className="text-gray-700 text-base">{selectedRequest?.rejectedNote?.rejectionNote}</p>
              </div>
              {selectedRequest?.rejectedNote?.imageUrl && (
                <div>
                  <h4 className="text-[#F79009] font-semibold mb-2">Image</h4>
                  <div className="flex justify-center items-center bg-gray-100 p-4 rounded">
                    <img
                      src={selectedRequest.rejectedNote.imageUrl || "/placeholder.svg"}
                      alt="Rejection Proof"
                      className="max-h-[300px] rounded"
                    />
                  </div>
                </div>
              )}
              <div>
                <h4 className="text-[#F79009] font-semibold mb-2">Date</h4>
                <p className="text-gray-700 text-base">{selectedRequest?.rejectedNote?.rejectedDate}</p>
              </div>
            </div>
            <div className="flex justify-end pt-6">
              <button
                onClick={() => setViewReasonModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  )
}

export default AdminBookings
