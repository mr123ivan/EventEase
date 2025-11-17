"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "./AuthProvider"

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  // Add console logs to help debug
  //console.log("Protected Route - isAuthenticated:", isAuthenticated)
  //console.log("Protected Route - isLoading:", isLoading)

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" />
  }

  // Render children if authenticated
  return children
}

export default ProtectedRoute
