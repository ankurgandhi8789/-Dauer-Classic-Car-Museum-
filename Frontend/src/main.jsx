import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Home from './pages/Home/Home.jsx'
import About from './pages/About/About.jsx'
import HeritageAbout from './pages/About/HeritageAbout.jsx'
import Gallery from './pages/Gallery/Gallery.jsx'
import Contact from './pages/Contact/Contact.jsx'
import Events from './pages/Even/Events.jsx'
import Tickets from './pages/Tickets/Tickets.jsx'
import { RouterProvider, Route, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      <Route path='' element={<Home />} />
      <Route path='/about' element={<About />} />
      <Route path='/Gallery' element={<Gallery />} />
      <Route path='/Events' element={<Events />} />
      <Route path='/Contact' element={<Contact />} />
      <Route path='/heritage-about' element={<HeritageAbout />} />
      <Route path='/tickets' element={<Tickets />} />
    </Route>
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
