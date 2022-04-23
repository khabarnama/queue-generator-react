import { useState } from 'react'
import { Link } from 'react-router-dom'
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { auth } from './firebase'
import { useNavigate } from 'react-router-dom'
import { useAuthValue } from './AuthContext'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { setTimeActive } = useAuthValue()
  const navigate = useNavigate()

  const login = (e) => {
    e.preventDefault()
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        if (!auth.currentUser.emailVerified) {
          sendEmailVerification(auth.currentUser)
            .then(() => {
              setTimeActive(true)
              navigate('/verify-email')
            })
            .catch((err) => alert(err.message))
        } else {
          navigate('/')
        }
      })
      .catch((err) => setError(err.message))
  }

  return (
    <div className='center'>
      <div className='ticket-visual_visual'>
        <div class='ticket-visual-wrapper'>
          <div class='ticket-visual_ticket-number-wrapper'>
            <br />
            <br />
            <div class='ticket-visual_ticket-number'>Log In</div>
            <br />
            <br />
          </div>
          {error && <div className='auth__error'>{error}</div>}
          <form onSubmit={login} className='login_form'>
            <div class='group'>
              <input
                type='email'
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
              <label for='name'>Email</label>
              <div class='bar'></div>
            </div>

            <div class='group'>
              <input
                type='password'
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
              <label for='name'>Password</label>
              <div class='bar'></div>
            </div>

            <br />
            <button class='btn' type='submit'>
              Login
            </button>
          </form>
          <p>
            Don't have and account? <br />
            <Link class='link' to='/register'>
              <small>Create one here</small>
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
