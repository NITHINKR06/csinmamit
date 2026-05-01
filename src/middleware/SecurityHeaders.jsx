/**
 * Security Headers Component
 * Adds security measures to protect against common attacks
 */

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SecurityHeaders = ({ children }) => {
  const location = useLocation()

  useEffect(() => {
    // Load admin settings if present
    let adminSettings = {}
    try {
      const saved = localStorage.getItem('adminSettings')
      adminSettings = saved ? JSON.parse(saved) : {}
    } catch { }

    // Prevent clickjacking
    if (window.self !== window.top) {
      window.top.location = window.self.location
    }

    // Disable right-click on payment pages (optional)
    const handleContextMenu = (e) => {
      if (
        (location.pathname === '/recruit' || location.pathname === '/profile') &&
        adminSettings.blockRightClickOnSensitive !== false &&
        adminSettings.hardenRecruitProtections !== false
      ) {
        e.preventDefault()
        return false
      }
    }

    // Prevent text selection on sensitive pages (optional)
    const handleSelectStart = (e) => {
      if (
        location.pathname === '/recruit' &&
        adminSettings.blockSelectOnSensitive !== false &&
        adminSettings.hardenRecruitProtections !== false &&
        e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault()
        return false
      }
    }

    // Prevent print screen on payment pages (limited effectiveness)
    const handleKeyDown = (e) => {
      if (location.pathname === '/recruit' && adminSettings.blockDevtoolsKeysOnSensitive !== false && adminSettings.hardenRecruitProtections !== false) {
        // Prevent PrintScreen (limited browser support)
        if (e.keyCode === 44) {
          e.preventDefault()
        }
        // Prevent F12 (DevTools)
        if (e.keyCode === 123) {
          e.preventDefault()
        }
        // Prevent Ctrl+Shift+I (DevTools)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
          e.preventDefault()
        }
        // Prevent Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
          e.preventDefault()
        }
        // Prevent Ctrl+U (View Source)
        if (e.ctrlKey && e.keyCode === 85) {
          e.preventDefault()
        }
      }
    }

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('selectstart', handleSelectStart)
    document.addEventListener('keydown', handleKeyDown)

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('selectstart', handleSelectStart)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [location])

  // Security headers are set via Vercel HTTP headers (vercel.json)
  // CSP, X-Frame-Options, etc. are handled server-side for reliability

  return children
}

export default SecurityHeaders
