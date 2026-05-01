import { createContext, useContext, useState, useEffect } from 'react'
import { auth, googleProvider, isDemoMode, db } from '../config/firebase'
import {
  signInWithPopup as firebaseSignInWithPopup,
  signInWithRedirect as firebaseSignInWithRedirect,
  getRedirectResult as firebaseGetRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged
} from 'firebase/auth'
import {
  doc as firebaseDoc,
  setDoc as firebaseSetDoc,
  getDoc as firebaseGetDoc,
  serverTimestamp as firebaseServerTimestamp,
  collection as firebaseCollection
} from 'firebase/firestore'
import toast from 'react-hot-toast'
import firestoreFallback from '../utils/firestoreFallback'

const IS_DEV_MODE = (import.meta.env?.DEV === true) || (import.meta.env?.VITE_APP_ENV === 'development')

let signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged
let doc, setDoc, getDoc, serverTimestamp, collection

if (isDemoMode) {
  signInWithPopup = (auth, provider) => auth.signInWithPopup(provider)
  signOut = (auth) => auth.signOut()
  onAuthStateChanged = (auth, callback) => auth.onAuthStateChanged(callback)
  signInWithRedirect = (auth, provider) => auth.signInWithRedirect(provider)
  getRedirectResult = (auth) => auth.getRedirectResult()
  doc = (db, collectionName, id) => db.doc(`${collectionName}/${id}`)
  setDoc = (docRef, data, options) => docRef.set(data, options)
  getDoc = (docRef) => docRef.get()
  serverTimestamp = () => new Date()
  collection = (db, name) => db.collection(name)
} else {
  signInWithPopup = firebaseSignInWithPopup
  signInWithRedirect = firebaseSignInWithRedirect
  getRedirectResult = firebaseGetRedirectResult
  signOut = firebaseSignOut
  onAuthStateChanged = firebaseOnAuthStateChanged
  doc = firebaseDoc
  setDoc = firebaseSetDoc
  getDoc = firebaseGetDoc
  serverTimestamp = firebaseServerTimestamp
  collection = firebaseCollection
}

const AdminAuthContext = createContext({})
export const useAdminAuth = () => useContext(AdminAuthContext)

const ADMIN_WHITELIST = (import.meta.env.VITE_ADMIN_WHITELIST || "")
  .split(",")
  .map(email => email.trim().toLowerCase())
  .filter(Boolean)

const SESSION_DURATION = 60 * 60 * 1000

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [sessionExpiry, setSessionExpiry] = useState(null)

  const isWhitelistedAdmin = (email) => {
    if (ADMIN_WHITELIST.length === 0) return true
    return ADMIN_WHITELIST.includes(email.toLowerCase())
  }

  // Direct Google sign-in (no OTP step)
  const signInAdminWithGoogle = async () => {
    setAuthLoading(true)
    try {
      if (!auth || !googleProvider) return null

      let result
      try {
        result = await signInWithPopup(auth, googleProvider)
      } catch (popupError) {
        // Fallback to redirect
        sessionStorage.setItem('authRedirectInitiated', 'true')
        await signInWithRedirect(auth, googleProvider)
        return null
      }

      const user = result?.user
      if (!user) return null

      if (!isWhitelistedAdmin(user.email)) {
        await signOut(auth)
        toast.error('Unauthorized: You are not an admin')
        return null
      }

      await completeAdminLogin(user)
      return user
    } catch (error) {
      toast.error('Failed to sign in. Please try again.')
      return null
    } finally {
      setAuthLoading(false)
    }
  }

  const completeAdminLogin = async (user) => {
    const expiry = Date.now() + SESSION_DURATION
    const adminData = {
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL,
      role: 'admin',
      verified: true,
      lastLogin: new Date().toISOString()
    }

    // Save to Firestore — must succeed for admin access
    try {
      const adminRef = doc(db, 'admins', user.uid)
      await setDoc(adminRef, adminData, { merge: true })
    } catch (e) {
      toast.error('Failed to establish admin session. Contact support.')
      return
    }

    setAdminUser(adminData)
    setSessionExpiry(expiry)
    localStorage.setItem('adminSession', JSON.stringify({ uid: user.uid, expiry }))
    toast.success('Admin login successful!')
  }

  // Handle redirect result
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const isReturningFromAuth = urlParams.has('code') || urlParams.has('state') ||
                                    window.location.hash.includes('access_token')

        if (!isReturningFromAuth) {
          sessionStorage.removeItem('authRedirectInitiated')
          return
        }

        const result = await getRedirectResult(auth)
        const user = result?.user
        if (!user) return

        if (!isWhitelistedAdmin(user.email)) {
          await signOut(auth)
          toast.error('Unauthorized: You are not an admin')
          return
        }

        await completeAdminLogin(user)
        window.history.replaceState({}, document.title, window.location.pathname)
      } catch (e) {
        toast.error('Error handling sign-in redirect')
      }
    }

    handleRedirect()
  }, [])

  const logoutAdmin = async () => {
    setAuthLoading(true)
    try {
      await signOut(auth)
      setAdminUser(null)
      setSessionExpiry(null)
      localStorage.removeItem('adminSession')
      toast.success('Admin logged out successfully')
    } catch (error) {
      toast.error('Failed to logout')
    } finally {
      setAuthLoading(false)
    }
  }

  const checkAdminStatus = async (uid) => {
    try {
      const adminRef = doc(db, 'admins', uid)
      const adminDoc = await getDoc(adminRef)
      if (adminDoc.exists() && adminDoc.data().verified) {
        return adminDoc.data()
      }
      return null
    } catch (error) {
      return null
    }
  }

  // Session check
  useEffect(() => {
    if (sessionExpiry) {
      const checkSession = setInterval(() => {
        if (Date.now() > sessionExpiry) {
          toast.error('Admin session expired')
          logoutAdmin()
        }
      }, 60000)
      return () => clearInterval(checkSession)
    }
  }, [sessionExpiry])

  // Restore session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      const storedSession = localStorage.getItem('adminSession')
      if (storedSession) {
        const session = JSON.parse(storedSession)
        if (Date.now() < session.expiry) {
          try {
            const currentUser = auth.currentUser
            if (currentUser && currentUser.uid === session.uid) {
              await currentUser.getIdTokenResult(true)
              const adminData = await checkAdminStatus(session.uid)
              if (adminData) {
                setAdminUser(adminData)
                setSessionExpiry(session.expiry)
              } else {
                localStorage.removeItem('adminSession')
              }
            } else {
              localStorage.removeItem('adminSession')
            }
          } catch {
            localStorage.removeItem('adminSession')
          }
        } else {
          localStorage.removeItem('adminSession')
        }
      }
      setLoading(false)
    }

    checkExistingSession()
  }, [auth])

  const value = {
    adminUser,
    loading,
    authLoading,
    sessionExpiry,
    signInAdminWithGoogle,
    logoutAdmin,
    checkAdminStatus,
    isWhitelistedAdmin
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}
