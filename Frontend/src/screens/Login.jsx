import { useState } from 'react'
import AuthForm from '../components/AuthForm'
import axios from '../config/axios'
import { useUser } from '../context/useUser'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { signIn } = useUser()

  const submitHandler = async (credentials) => {
    try {
      const { data } = await axios.post('/users/login', credentials)
      if (!data.token || !data.user?.email) {
        throw new Error('The server returned an incomplete response. Please try again.')
      }
      return { token: data.token, user: { id: data.user.id || data.user._id, email: data.user.email } }
    } catch (error) {
      if (!error.isAxiosError) throw error
      if (!error.response) {
        throw new Error('Could not reach the server. Check your connection and try again.', { cause: error })
      }
      throw new Error([400, 401, 404].includes(error.response.status)
        ? 'Email or password is incorrect. Check both and try again.'
        : 'Something went wrong. Please try again in a moment.', { cause: error })
    }
  }

  return (
    <AuthForm
      mode="login"
      values={{ email, password }}
      onEmailChange={(event) => setEmail(event.target.value)}
      onPasswordChange={(event) => setPassword(event.target.value)}
      onSubmit={submitHandler}
      onAuthenticated={signIn}
    />
  )
}
