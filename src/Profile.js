import { useAuthValue } from './AuthContext'
import { signOut } from 'firebase/auth'
import { auth, upload, db, deletePhoto } from './firebase'
import { useEffect, useState } from 'react'
import { collection, doc, setDoc, getDoc, Timestamp, query, onSnapshot } from 'firebase/firestore'

function Profile() {
  const { currentUser } = useAuthValue()
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(false)
  const [size, setSize] = useState(0)
  const [queuenum, setQueuenum] = useState(null)
  const [photoURL, setPhotoURL] = useState(null)
  const current = new Date()
  const date = `${current.getDate()}-${current.getMonth() + 1}-${current.getFullYear()}`

  var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }

  function handleChange(e) {
    if (e.target.files[0]) {
      setPhoto(e.target.files[0])
    }
  }

  function handleClick() {
    // console.log('PHOTO: ', photo)
    // console.log('CURRENT USER: ', currentUser)
    // console.log('LOADING: ', loading)
    upload(photo, currentUser, setLoading, setPhotoURL)
  }

  useEffect(() => {
    if (currentUser?.photoURL) {
      setPhotoURL(currentUser?.photoURL)
    }

    const getQueue = async () => {
      const docRef = doc(db, date.toString(), `${currentUser?.email}`)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        setQueuenum(docSnap.data().id)
      } else {
        // doc.data() will be undefined in this case
        console.log('No such document!')
      }
    }

    getQueue()

    /* function to get all tasks from firestore in realtime */
    const q = query(collection(db, date.toString()))
    onSnapshot(q, (querySnapshot) => {
      setSize(querySnapshot.size)
    })
  }, [currentUser, date, size])

  /* function to add new task to firestore */
  const handleSubmit = async () => {
    try {
      await setDoc(doc(db, date.toString(), `${currentUser?.email}`), {
        id: size + 1,
        created: Timestamp.now()
      }).then((doc) => {
        console.log('Document written with ID: ', doc)
      })
    } catch (err) {
      alert(err)
    }
  }

  console.log(
    'CURRENT > TIME ',
    new Date().getHours(),
    new Date().getHours() >= 12 && new Date().getHours() <= 13
  )

  const imageToDefault = ({ currentTarget }) => {
    console.log('ON ERROR TRIGGERED')
    currentTarget.onerror = null // prevents looping
    deletePhoto(currentUser, setPhotoURL)
  }

  const toChars = (n) =>
    `${n >= 26 ? toChars(Math.floor(n / 26) - 1) : ''}${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[n % 26]}`

  return (
    <div className='center'>
      <div className='ticket-visual_visual '>
        <div className='ticket-visual-wrapper py-30'>
          <div className='ticket-visual_ticket-number-wrapper'>
            <br />
            <div className='ticket-visual_ticket-number'>Ticket</div>
            <p>{currentUser?.email}</p>
            <br />
          </div>
          <div className='ticket-visual_profile'>
            <div className='ticket-profile_profile'>
              {currentUser && (
                <>
                  {photoURL === null && (
                    <div className='fields'>
                      <input className='custom-file-input' type='file' onChange={handleChange} />
                      <button
                        className='btn-upload'
                        disabled={loading || !photo}
                        onClick={handleClick}
                      >
                        Upload
                      </button>
                    </div>
                  )}
                  <img
                    width='100%'
                    src={photoURL ?? './card.png'}
                    onError={(currentTarget) => imageToDefault(currentTarget)}
                    alt='Card Illustration'
                    className='ticket-profile_image'
                  />
                </>
              )}
              <br />
              <div className='ticket-profile_text font-mplus'>
                {current.toLocaleDateString('en-US', options)}
                <span className='meta'>
                  {' '}
                  |{' #'}
                  {toChars(current.getHours()) +
                    toChars(current.getDate()) +
                    toChars(current.getMonth())}
                </span>
              </div>
            </div>
          </div>
          <br />
          <br />
          {new Date().getHours() >= 16 && new Date().getHours() <= 17 ? (
            <div className='ticket-visual_ticket-number-wrapper'>
              {queuenum ? (
                <div className='ticket-visual_ticket-number'>№ {`${queuenum}`}</div>
              ) : (
                <button className='btn' disabled={photoURL == null} onClick={() => handleSubmit()}>
                  {!photoURL ? 'Please upload your STUDENT ID!' : 'Get Queue Number'}
                </button>
              )}
            </div>
          ) : (
            <button className='btn' disabled>
              Please wait till 4 PM
            </button>
          )}
          <br />
          <br />
          <span className='link' onClick={() => signOut(auth)}>
            Log Out
          </span>
        </div>
      </div>
    </div>
  )
}

export default Profile
