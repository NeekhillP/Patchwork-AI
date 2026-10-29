import { useState } from 'react'
import AuthForm from '../components/AuthForm'
import axios from '../config/axios'

export default function Register({ onAuthenticated }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submitHandler = async (credentials) => {
    try {
      const { data } = await axios.post('/users/register', credentials)
      if (!data.token || !data.user?.email) {
        throw new Error('The server returned an incomplete response. Please try again.')
      }
      return { token: data.token, user: { id: data.user.id || data.user._id, email: data.user.email } }
    } catch (error) {
      if (!error.isAxiosError) throw error
      if (!error.response) {
        throw new Error('Could not reach the server. Check your connection and try again.', { cause: error })
      }
      const { status, data } = error.response
      if (status === 409 || /E11000|duplicate key/i.test(data?.message || '')) {
        throw new Error('An account with this email already exists. Sign in instead.', { cause: error })
      }
      throw new Error(status === 400
        ? 'Check your email and password, then try again.'
        : 'Something went wrong. Please try again in a moment.', { cause: error })
    }
  }

  return (
    <AuthForm
      mode="register"
      values={{ email, password }}
      onEmailChange={(event) => setEmail(event.target.value)}
      onPasswordChange={(event) => setPassword(event.target.value)}
      onSubmit={submitHandler}
      onAuthenticated={onAuthenticated}
    />
  )
}
