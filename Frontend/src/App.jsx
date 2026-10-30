import AppRoutes from './routes/AppRoutes'
import { UserProvider } from './context/user.context'

export default function App() {
  return (
    <UserProvider>
      <AppRoutes />
    </UserProvider>
  )
}
