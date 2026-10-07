import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Home from './pages/Home/Home.jsx'
import About from './pages/About/About.jsx'
import HeritageAbout from './pages/About/HeritageAbout.jsx'
import Gallery from './pages/Gallery/Gallery.jsx'
import Contact from './pages/Contact/Contact.jsx'
import Events from './pages/Even/Events.jsx'
import Tickets from './pages/Tickets/Tickets.jsx'
import AdminLogin from './pages/Admin/AdminLogin.jsx'
import AdminLayout from './pages/Admin/AdminLayout.jsx'
import Overview from './pages/Admin/Overview.jsx'
import Bookings from './pages/Admin/Bookings.jsx'
import Schedule from './pages/Admin/Schedule.jsx'
import { RouterProvider, Route, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public website (with Nav + Footer) */}
      <Route path='/' element={<App />}>
        <Route path='' element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/Gallery' element={<Gallery />} />
        <Route path='/Events' element={<Events />} />
        <Route path='/Contact' element={<Contact />} />
        {/* <Route path='/heritage-about' element={<HeritageAbout />} /> */}
        <Route path='/tickets' element={<Tickets />} />
      </Route>

      {/* Admin (no Nav/Footer) */}
      <Route path='/admin/login' element={<AdminLogin />} />
      <Route path='/admin' element={<AdminLayout />}>
        <Route index element={<Overview />} />
        <Route path='bookings' element={<Bookings />} />
        <Route path='schedule' element={<Schedule />} />
      </Route>
    </>
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)