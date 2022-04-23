import { initializeApp } from 'firebase/app'
import { getAuth, updateProfile } from 'firebase/auth'
import { getDownloadURL, getStorage, ref } from 'firebase/storage'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAmsIVYYFOnDeOZQnYdD7l95y4JGjbnfXw',
  authDomain: 'fir-user-auth-ec3e4.firebaseapp.com',
  projectId: 'fir-user-auth-ec3e4',
  storageBucket: 'fir-user-auth-ec3e4.appspot.com',
  messagingSenderId: '93243186143',
  appId: '1:93243186143:web:ec711c0764d97ebb16c26a'
}

// Initialize Firebase and Firebase Authentication
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const storage = getStorage()
const db = getFirestore(app)

// Storage
export async function upload(file, currentUser, setLoading) {
  const fileRef = ref(storage, currentUser.uid + '.png')

  setLoading(true)

  const photoURL = await getDownloadURL(fileRef)

  updateProfile(currentUser, { photoURL })

  setLoading(false)
  alert('Uploaded file!')
}

export { auth, db }
