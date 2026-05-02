import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import ScrollToTop from '../UI/ScrollToTop'

const Layout = () => {
  const location = useLocation()
  const validPaths = ['/', '/events', '/team', '/profile', '/recruit']
  const isNotFoundPage = !validPaths.some(path =>
    path === location.pathname || (path !== '/' && location.pathname.startsWith(path))
  )

  return (
    <div className="relative min-h-screen flex flex-col">
      {!isNotFoundPage && <Navbar />}
      <main className="flex-grow relative z-10">
        <Outlet />
      </main>
      {!isNotFoundPage && <Footer />}
      <ScrollToTop />
    </div>
  )
}

export default Layout
