import AuthForm from '../components/AuthForm'

export default function Register({ onAuthenticated }) {
  return <AuthForm mode="register" onAuthenticated={onAuthenticated} />
}
