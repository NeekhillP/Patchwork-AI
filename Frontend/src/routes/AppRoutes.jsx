import { Route, Routes, BrowserRouter, Navigate } from 'react-router-dom'
import Login from '../screens/Login'
import Register from '../screens/Register'
import Home from '../screens/Home'
import { useUser } from '../context/useUser'

const AppRoutes = () => {
  const { user, loading } = useUser()
  if (loading) return <p role="status" className="p-6 text-muted">Restoring your session…</p>
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>  
    )
}

export default AppRoutes
