import { useAuthValue } from './AuthContext'
import { signOut } from 'firebase/auth'
import { auth, upload, db, deletePhoto } from './firebase'
import { useEffect, useState } from 'react'
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  Timestamp,
  query,
  onSnapshot
} from 'firebase/firestore'
import { Link } from 'react-router-dom'

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

  var colors = [
    '#fb8500',
    '#ffb703',
    '#ae2012',
    '#48cae4',
    '#0077b6',
    '#023e8a',
    '#03045e',
    '#f72585',
    '#b5179e',
    '#480ca8',
    '#0081a7',
    '#00afb9',
    '#7b2cbf',
    '#2b2d42',
    '#8d99ae',
    '#ef233c',
    '#5f0f40',
    '#ffd500',
    '#99582a',
    '#432818',
    '#9381ff',
    '#7371fc',
    '#9D34DA',
    '#DFE0E2',
    '#c9ada7',
    '#ddbdfc',
    '#662e9b',
    '#31263e',
    '#44355b',
    '#d62246',
    '#16697a',
    '#489fb5',
    '#6a994e',
    '#bc4749',
    '#0ead69',
    '#6f4518'
  ]

  const number_of_colors = colors.length // 36 in your example
  const number_of_days_per_year = 365 // for brevity of the example

  const day = current.getDate()

  // some 'lower school math' magic :)
  const index = Math.round((day * number_of_colors) / number_of_days_per_year)

  // the color of the day is .....
  // console.log('COLOR OF THE DAY: ', colors[index])

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

    // const getQueue = async () => {
    //   const docRef = doc(db, date.toString(), `${currentUser?.email}`)
    //   const docSnap = await getDoc(docRef)

    //   if (docSnap.exists()) {
    //     setQueuenum(docSnap.data().id)
    //   } else {
    //     // doc.data() will be undefined in this case
    //     console.log('No such document!')
    //   }
    // }

    // getQueue()

    /* function to get all tasks from firestore in realtime */
    const q = query(collection(db, date.toString()))
    onSnapshot(q, (querySnapshot) => {
      setSize(querySnapshot.size)
    })
  }, [currentUser, date, queuenum])

  /* function to add new task to firestore */
  const handleSubmit = async () => {
    try {
      await setDoc(doc(db, date.toString(), `${currentUser?.email}`), {
        photoURL: currentUser?.photoURL,
        created: Timestamp.now()
      }).then((doc) => {
        console.log('Document written with ID: ', doc)
        const docs = []
        const getQueue = async () => {
          const querySnapshot = await getDocs(collection(db, date.toString()))
          querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, ' => ', doc.data())
            docs.push(doc.id)
          })
        }

        getQueue().then(() => {
          const index = docs.findIndex((item) => item === currentUser?.email)
          console.log('QUEUE NUM: ', queuenum)
          console.log('INDEX: ', index)
          setQueuenum(index + 1)
          console.log('NEW QUEU NUM: ', queuenum)
        })
      })
    } catch (err) {
      alert(err)
    }
  }

  // console.log(
  //   'CURRENT > TIME ',
  //   new Date().getHours(),
  //   new Date().getHours() >= 12 && new Date().getHours() <= 13
  // )

  const imageToDefault = ({ currentTarget }) => {
    console.log('ON ERROR TRIGGERED')
    currentTarget.onerror = null // prevents looping
    deletePhoto(currentUser, setPhotoURL)
  }
  const toChars = (n) =>
    `${n >= 26 ? toChars(Math.floor(n / 26) - 1) : ''}${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[n % 26]}`

  function checkTime(i) {
    if (i < 100) {
      i = '0' + i
    } // add zero in front of numbers < 10
    if (i < 10) {
      i = '0' + i
    } // add zero in front of numbers < 10
    return i
  }

  return (
    <div className='center'>
      <div className='ticket-visual_visual'>
        <div className='ticket-visual-wrapper py-30'>
          <div className='ticket-visual_ticket-number-wrapper'>
            <br />
            <div className='ticket-visual_ticket-number font-right'>Ticket</div>
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
                      {photo && (
                        <button
                          className='btn-upload'
                          disabled={loading || !photo}
                          onClick={handleClick}
                        >
                          {loading ? 'Uploading...' : 'Upload'}
                        </button>
                      )}
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
                {current.toLocaleDateString('en-US', options) + ' | '}
                <span className='meta' style={{ color: colors[index] }}>
                  {colors[index].substring(0, 3) +
                    toChars(current.getHours()) +
                    toChars(current.getDate()) +
                    toChars(current.getMonth())}
                </span>
              </div>
            </div>
          </div>
          <br />
          <br />
          <div className='ticket-visual_ticket-number-wrapper fields justify-center'>
            {queuenum ? (
              <div className='ticket-visual_ticket-number bold'>#000{`${checkTime(queuenum)}`}</div>
            ) : (
              <button className='btn' disabled={photoURL == null} onClick={() => handleSubmit()}>
                {!photoURL ? 'Please upload your STUDENT ID!' : 'Get Queue Number'}
              </button>
            )}
          </div>
          <br />
          <div className='flex justify-center gap-2'>
            <Link className='link' to='/list'>
              <small className='link'>See List</small>
            </Link>
            <small>|</small>
            <small>
              <a rel='noreferrer' className='link' href='https://wa.me/93749996550' target='_blank'>
                Ask for help
              </a>
            </small>
            <small>|</small>
            <small className='link' onClick={() => signOut(auth)}>
              Log Out
            </small>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
