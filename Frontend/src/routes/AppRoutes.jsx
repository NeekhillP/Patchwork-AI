import { useState } from 'react'
import { Route, Routes, BrowserRouter, Navigate } from 'react-router-dom'
import Login from '../screens/Login'
import Register from '../screens/Register'
import Home from '../screens/Home'

const AppRoutes = () => {
  // The API returns a bearer token. Keep it in memory rather than browser storage.
  const [session, setSession] = useState(null)
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={session ? <Navigate to="/" replace /> : <Login onAuthenticated={setSession} />} />
        <Route path="/register" element={session ? <Navigate to="/" replace /> : <Register onAuthenticated={setSession} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>  
    )
}

export default AppRoutes
