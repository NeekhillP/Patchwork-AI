import AuthForm from '../components/AuthForm'

export default function Login({ onAuthenticated }) {
  return <AuthForm mode="login" onAuthenticated={onAuthenticated} />
}
