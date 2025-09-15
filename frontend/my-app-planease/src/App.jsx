import LoginPage from './Pages/login-page'
import RegisterPage from './Pages/register-page'
import HomePage from './Pages/home-page'
import LandingPage from './Pages/landing-page/landing-page'
import Navbar from './Components/Navbar'
import Footer from './Components/Footer'
import AuthProvider from './Components/AuthProvider'
import ProtectedRoute from './Components/ProtectedRoute'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SubcontractorBookings from './Pages/subcontractor-pages/subcontractor-bookings'
import SubcontractorDashboard from './Pages/subcontractor-pages/subcontractor-dashboard'
import SubcontractorLogin from './Pages/subcontractor-pages/subcontractor-login'
import SubcontractorCalendar from './Pages/subcontractor-pages/subcontractor-calendar'
import YourEvents from './Pages/admin-pages/admin-your-events.jsx'
import AdminProtectedRoute from './Components/AdminProtectedRoute'
import SubContractorProtectedRoute from './Components/SubContractorProtectedRoute'
import InputDetailsPage from './Pages/booking-pages/inputdetails-page.jsx'
import SelectServicePage from './Pages/booking-pages/selectservice-page.jsx'
import PreviewBookingPage from './Pages/booking-pages/previewbooking-page.jsx'
import PaymentProofPage from './Pages/booking-pages/paymentproof-page.jsx'
import EventPage from './Pages/events-dashboard/events-dashboard.jsx'
import EventDetails from './Pages/events-dashboard/event-details.jsx'
import NotificationsPage from './Pages/NotificationsPage.jsx'
import PackageDetails from './Pages/events-dashboard/package-details.jsx'
import AdminPendingRequest from './Pages/admin-pages/admin-pendingrequest.jsx'
import AdminBookings from "./Pages/admin-pages/admin-bookings.jsx";
import AdminSubContractors from './Pages/admin-pages/admin-subcontractors.jsx'
import UserReservations from './Pages/reservations-pages/user-reservations.jsx'
import InputDetailsPagePackage from './Pages/booking-pages/inputdetails-page-package.jsx'
// import PaymentProofPagePackage from './Pages/booking-pages/paymentproof-page-package.jsx'
// import PreviewBookingPagePackage from './Pages/booking-pages/previewbooking-page-package.jsx'
import AdminPackages from './Pages/admin-pages/admin-your-packages.jsx'
import UserBookingsPage from './Pages/user-bookings.jsx'
import EventTrackingAdmin from './Pages/admin-pages/admin-eventprogress.jsx'
import SubcontractorProgress from './Pages/subcontractor-pages/subcontractor-progress.jsx'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <>
              <LandingPage />
              <Footer/>
            </>
            } />

          <Route path="/login" element={<LoginPage />} />

          <Route path="/register" element={<RegisterPage />} />
          <Route path="/book/:eventName/inputdetails" element={<InputDetailsPage />} />
          <Route path="/book/:eventName/services" element={<SelectServicePage />} />
          <Route path="/book/:eventName/preview" element={<PreviewBookingPage />} />
          <Route path="/book/:eventName/payment" element={<PaymentProofPage />} />

          <Route path="/book/:packageName/package/inputdetails" element={<InputDetailsPagePackage />} />
          {/* <Route path="/book/:packageName/package/preview" element={<PreviewBookingPagePackage />} />
          <Route path="/book/:packageName/package/payment" element={<PaymentProofPagePackage />} /> */}

          <Route path="/notifications" element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
            } />

           <Route path="/user-reservations" element={
            <ProtectedRoute>
              <UserReservations />
            </ProtectedRoute>
            } />

          <Route path="/my-bookings" element={
            <ProtectedRoute>
              <Navbar />
              <UserBookingsPage />
            </ProtectedRoute>
          } />

          <Route path="/events-dashboard" element={
            <>
              <ProtectedRoute>
                <Navbar />
                <EventPage />
                <Footer />
              </ProtectedRoute>
            </>
          }
          />

            <Route path="/package/:package_id" element={
                <>
                    <ProtectedRoute>
                        <Navbar />
                        <PackageDetails />
                        <Footer />
                    </ProtectedRoute>
                </>
            }
            />

            <Route path="/event/:event_name" element={
                <>
                    <ProtectedRoute>
                        <Navbar />
                        <EventDetails />
                        <Footer />
                    </ProtectedRoute>
                </>
            }
            />
          <Route path="/subcontractor/dashboard" element={
             <SubContractorProtectedRoute>
                <SubcontractorDashboard />  
             </SubContractorProtectedRoute>
            } />
          <Route path="/subcontractor/transactions" element={
            <SubContractorProtectedRoute>
                <SubcontractorBookings />
             </SubContractorProtectedRoute>
            } />
          <Route path="/subcontractor/calendar" element={
            <SubContractorProtectedRoute>
                <SubcontractorCalendar />
            </SubContractorProtectedRoute>
            } />
            <Route path="/subcontractor/progress" element={
             <SubContractorProtectedRoute>
                <SubcontractorProgress />
             </SubContractorProtectedRoute>
            } />
          <Route path="/subcontractor/login" element={<SubcontractorLogin />} />


          <Route path="/admin/pendings" element={
             <AdminProtectedRoute>
                <AdminPendingRequest/>
             </AdminProtectedRoute>
            }/>

            <Route path="/admin/bookings" element={
                 <AdminProtectedRoute>
                <AdminBookings/>
                 </AdminProtectedRoute>
            }/>

            <Route path="/admin/events" element={
                 <AdminProtectedRoute>
                <YourEvents/>
                 </AdminProtectedRoute>
            }/>
            <Route path="/admin/subcontractors" element={
                 <AdminProtectedRoute>
                <AdminSubContractors/>
                 </AdminProtectedRoute>
            }/>
              <Route path="/admin/packages" element={
                 <AdminProtectedRoute>
                < AdminPackages/>
                 </AdminProtectedRoute>
            }/>
              <Route path="/admin/eventprogress" element={
                <AdminProtectedRoute>
                  < EventTrackingAdmin/>
                </AdminProtectedRoute>
            }/>
          
          <Route path="/home" element={
              <>
                <ProtectedRoute>
                  <Navbar />
                    <EventPage />
                  <Footer />
                </ProtectedRoute>
              </>
            }
          />
        </Routes>
    </BrowserRouter>
  </AuthProvider>
  )
}

export default App
