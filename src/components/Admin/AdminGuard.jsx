import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '../../contexts/AdminAuthContext'
import { Shield } from 'lucide-react'

const AdminGuard = ({ children }) => {
  const { adminUser, loading } = useAdminAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#417690] border-t-transparent"></div>
          <p className="mt-4 text-[#666]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!adminUser) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

export default AdminGuard
