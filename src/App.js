import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Profile from './Profile'
import Register from './Register'
import Yahya from './yahya'
import List from './List'
import VerifyEmail from './VerifyEmail'
import Login from './Login'
import { useState, useEffect } from 'react'
import { AuthProvider } from './AuthContext'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import PrivateRoute from './PrivateRoute'
import { Navigate } from 'react-router-dom'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [timeActive, setTimeActive] = useState(false)

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
    })
  }, [])

  return (
    <Router>
      <AuthProvider value={{ currentUser, timeActive, setTimeActive }}>
        <Routes>
          <Route
            exact
            path='/'
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path='/login'
            element={!currentUser?.emailVerified ? <Login /> : <Navigate to='/' replace />}
          />
          <Route
            path='/register'
            element={!currentUser?.emailVerified ? <Register /> : <Navigate to='/' replace />}
          />
          <Route path='/verify-email' element={<VerifyEmail />} />
          <Route path='/list' element={<List />} />
          <Route path='/yahya' element={<Yahya />} />
        </Routes>
        {false && (
          <center className='text-center font-mplus'>
            <a rel='noreferrer' className='link' href='https://linktr.ee/mymakaim' target='_blank'>
              Developed by Yahya
            </a>
            {' | '}
            <a rel='noreferrer' className='link' href='https://wa.me/93749996550' target='_blank'>
              Contact
            </a>
          </center>
        )}
      </AuthProvider>
    </Router>
  )
}

export default App
