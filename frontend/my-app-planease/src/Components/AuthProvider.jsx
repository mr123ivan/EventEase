"use client"

import axios from "axios"
import { createContext, useContext, useState, useEffect } from "react"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("token") || "")
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common["Authorization"]
    }
  }, [token])

  useEffect(() => {
    const verifyToken = async () => {
      setIsLoading(true)
      const storedToken = localStorage.getItem("token")

      if (!storedToken) {
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      // If we have a token, consider the user authenticated initially
      // This prevents unnecessary logouts if the verification endpoint isn't ready
      setToken(storedToken)
      setIsAuthenticated(true)

      try {
        // Try to verify the token and fetch user data
        const response = await axios.get("http://localhost:8080/user/getuser", {
          headers: { Authorization: `Bearer ${storedToken}` },
        })

        // If we get here, the token is valid and we have user data
        console.log("Token verified successfully")
        
        // Set the user data
        setUser(response.data)
      } catch (error) {
        console.log("Token verification check:", error.response?.status)

        // Only log out if we get a clear 401/403 unauthorized response
        // This prevents logouts due to network issues or server errors
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          console.log("Token invalid, logging out")
          // Token is definitely invalid
          setIsAuthenticated(false)
          setToken("")
          setUser(null)
          localStorage.removeItem("token")
        } else {
          // For other errors (network, 500, etc.), keep the user logged in
          console.log("Error checking token, but keeping user logged in:", error.message)
        }
      } finally {
        setIsLoading(false)
      }
    }

    verifyToken()

    // Listen for storage events (logout from another tab)
    const handleStorageChange = () => {
      const currentToken = localStorage.getItem("token")
      if (!currentToken && token) {
        setToken("")
        setIsAuthenticated(false)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [token])

  const loginAction = async (data, navigate) => {
    try {
      const response = await axios.post("http://localhost:8080/user/login", data, {
        headers: { "Content-Type": "application/json" },
      })
      if (response.status === 200 || response.status === 201) {
        const { token, user, role } = response.data

        localStorage.setItem("token", token)
        setToken(token)
        setIsAuthenticated(true)

        // Redirect user based on role
        if (role === "User") {
          navigate("/home")
        } else if (role === "Admin") {
          navigate("/admin/pendings")
        } else if (role === "SubContractor") {
          navigate("/subcontractor/dashboard")
        }
        return
      }
      throw new Error(response.data.message)
    } catch (error) {
      console.log(error)
    }
  }

  const logout = async () => {
    const currentToken = localStorage.getItem("token")

    if (!currentToken) return // Prevent double execution if already logged out

    try {
      await axios.post(
        "http://localhost:8080/user/logout",
        {},
        {
          headers: { Authorization: `Bearer ${currentToken}` },
        },
      )
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      // Always clear local state regardless of API response
      setToken("")
      setIsAuthenticated(false)
      localStorage.removeItem("token")
      sessionStorage.clear()

      setTimeout(() => {
        window.dispatchEvent(new Event("storage"))
      }, 100)
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, loginAction, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
export const useAuth = () => {
  return useContext(AuthContext)
}
