import React from 'react'
import Nav from './components/Nav/Nav.jsx'
import Footer from './components/Footer/Footer.jsx'
import { Outlet } from 'react-router-dom'
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";

function App() {
  return (
    <div>
      <ScrollToTop />
      <Nav />
      <Outlet />
      <Footer />
    </div>
  )
}

export default App
