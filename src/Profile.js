import { useAuthValue } from './AuthContext'
import { signOut } from 'firebase/auth'
import { auth, upload, db } from './firebase'
import { useEffect, useState } from 'react'
import { collection, doc, setDoc, getDoc, Timestamp, query, onSnapshot } from 'firebase/firestore'

function Profile() {
  const { currentUser } = useAuthValue()
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(false)
  const [size, setSize] = useState(0)
  const [queuenum, setQueuenum] = useState(null)
  const [photoURL, setPhotoURL] = useState(
    'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'
  )
  const current = new Date()
  const date = `${current.getDate()}-${current.getMonth() + 1}-${current.getFullYear()}`

  var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }

  function handleChange(e) {
    if (e.target.files[0]) {
      setPhoto(e.target.files[0])
    }
  }

  function handleClick() {
    upload(photo, currentUser, setLoading)
  }

  useEffect(() => {
    if (currentUser?.photoURL) {
      setPhotoURL(currentUser.photoURL)
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

  return (
    <div className='center'>
      <div class='ticket-visual_visual'>
        <div class='ticket-visual-wrapper'>
          <div class='ticket-visual_ticket-number-wrapper'>
            <br />
            <br />
            <div class='ticket-visual_ticket-number'>Ticket</div>
            <br />
            <br />
          </div>
          <div class='ticket-visual_profile'>
            <div class='ticket-profile_profile'>
              {currentUser && (
                <>
                  {photoURL ===
                    'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png' && (
                    <div className='fields'>
                      <input type='file' onChange={handleChange} />
                      <button disabled={loading || !photo} onClick={handleClick}>
                        Upload
                      </button>
                    </div>
                  )}
                  <img
                    width='100%'
                    src={photoURL}
                    alt='Card Picture'
                    className='ticket-profile_image'
                  />
                </>
              )}
              <br />
              <br />
              <div class='ticket-profile_text'>{current.toLocaleDateString('en-US', options)}</div>
            </div>
          </div>
          <br />
          <br />
          <div class='ticket-visual_ticket-number-wrapper'>
            {queuenum ? (
              <div class='ticket-visual_ticket-number'>№ {`${queuenum}`}</div>
            ) : (
              <span class='btn' onClick={() => handleSubmit()}>
                Get Queue Number
              </span>
            )}
          </div>
          <br />
          <br />
          <span className='link' onClick={() => signOut(auth)}>
            Sign Out
          </span>
        </div>
      </div>
    </div>
  )
}

export default Profile
