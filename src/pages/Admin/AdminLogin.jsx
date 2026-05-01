import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../contexts/AdminAuthContext'
import { motion } from 'framer-motion'
import {
  Shield,
  AlertCircle,
  RefreshCw,
  WifiOff,
  ShieldOff
} from 'lucide-react'
import firestoreFallback from '../../utils/firestoreFallback'

const AdminLogin = () => {
  const navigate = useNavigate()
  const { adminUser, authLoading, signInAdminWithGoogle } = useAdminAuth()

  const [checkingRedirect, setCheckingRedirect] = useState(true)
  const [blockingDetected, setBlockingDetected] = useState(false)
  const [showTroubleshooting, setShowTroubleshooting] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const isReturningFromAuth = urlParams.has('code') || urlParams.has('state') ||
                                window.location.hash.includes('access_token')
    const storedPending = sessionStorage.getItem('pendingAdmin')
    const authInitiated = sessionStorage.getItem('authRedirectInitiated')
    const waitTime = (isReturningFromAuth || storedPending || authInitiated) ? 3000 : 1500

    const timer = setTimeout(async () => {
      setCheckingRedirect(false)
      if (authInitiated && !isReturningFromAuth) {
        sessionStorage.removeItem('authRedirectInitiated')
      }
      sessionStorage.removeItem('pendingAdmin')
      const blockingInfo = await firestoreFallback.detectBlockingExtensions()
      if (blockingInfo.hasBlocker) {
        setBlockingDetected(true)
      }
    }, waitTime)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (adminUser) {
      navigate('/admin/dashboard')
    }
  }, [adminUser, navigate])

  const handleGoogleSignIn = async () => {
    await signInAdminWithGoogle()
  }

  if ((checkingRedirect || authLoading) && !adminUser) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-900 border border-[#ddd] dark:border-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="bg-[#417690] dark:bg-gray-800 text-white p-4">
              <h1 className="text-lg font-normal">CSI NMAMIT administration</h1>
            </div>
            <div className="p-6 flex flex-col items-center justify-center">
              <RefreshCw className="w-8 h-8 animate-spin text-[#417690] mb-4" />
              <p className="text-[#333] dark:text-gray-200 text-center">
                {authLoading ? 'Processing authentication...' : 'Checking authentication status...'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Please wait...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 border border-[#ddd] dark:border-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-[#417690] dark:bg-gray-800 text-white p-4">
            <h1 className="text-lg font-normal">CSI NMAMIT administration</h1>
          </div>

          <div className="p-6">
            <motion.div
              key="signin"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-xl font-normal text-[#333] dark:text-gray-200 mb-6">Admin Login</h2>

              <div className="mb-6 space-y-3">
                <div className="bg-[#d1ecf1] border border-[#bee5eb] dark:bg-cyan-900/30 dark:border-cyan-900 rounded p-3 text-sm text-[#0c5460] dark:text-cyan-200">
                  <AlertCircle className="inline w-4 h-4 mr-2" />
                  Only authorized administrators can access this area
                </div>

                {blockingDetected && (
                  <div className="bg-[#fff3cd] border border-[#ffeeba] dark:bg-amber-900/30 dark:border-amber-900 rounded p-3 text-sm text-[#856404] dark:text-amber-200">
                    <ShieldOff className="inline w-4 h-4 mr-2" />
                    <span className="font-medium">Ad blocker detected!</span>
                    <button
                      onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                      className="ml-2 text-[#0066cc] dark:text-blue-400 hover:underline"
                    >
                      {showTroubleshooting ? 'Hide' : 'Show'} troubleshooting
                    </button>
                  </div>
                )}

                {showTroubleshooting && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-[#f8f9fa] border border-[#dee2e6] dark:bg-gray-800 dark:border-gray-700 rounded p-3 text-sm"
                  >
                    <p className="font-medium mb-2">To fix authentication issues:</p>
                    <ol className="list-decimal list-inside space-y-1 text-[#495057] dark:text-gray-300">
                      <li>Disable ad blockers (AdBlock, uBlock, etc.) for this site</li>
                      <li>Add this site to your ad blocker's whitelist</li>
                      <li>Try using incognito/private mode</li>
                      <li>Disable VPN or proxy if using one</li>
                      <li>Clear browser cache and cookies</li>
                    </ol>
                  </motion.div>
                )}

                {!navigator.onLine && (
                  <div className="bg-[#f8d7da] border border-[#f5c6cb] dark:bg-rose-900/30 dark:border-rose-900 rounded p-3 text-sm text-[#721c24] dark:text-rose-200">
                    <WifiOff className="inline w-4 h-4 mr-2" />
                    No internet connection detected
                  </div>
                )}
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-white dark:bg-gray-900 border border-[#ddd] dark:border-gray-800 rounded hover:bg-[#f5f5f5] dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-[#417690]" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-[#333] dark:text-gray-200">Sign in with Google</span>
                  </>
                )}
              </button>
            </motion.div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Secure admin access via Google authentication</p>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
