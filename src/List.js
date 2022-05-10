import { useAuthValue } from './AuthContext'
import { db } from './firebase'
import { useEffect, useState } from 'react'
import { collection, query, doc, deleteDoc, onSnapshot, FirebaseDatabase } from 'firebase/firestore'
import { md5 } from 'pure-md5'

function List() {
  const { currentUser } = useAuthValue()
  const [deleting, setDeleting] = useState(false)
  const [items, setItems] = useState([])
  const current = new Date()
  const date = `${current.getDate()}-${current.getMonth() + 1}-${current.getFullYear()}`
  const itemshere = []

  useEffect(() => {
    /* function to get all tasks from firestore in realtime */
    const q = query(collection(db, date.toString()))
    onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        itemshere.push({ email: doc.id, data: doc.data() })
        // console.log(`DOC.DATA(): ${doc.data()}`)
      })
      // console.log('Current cities in CA: ', itemshere.join(', '))
      setItems(itemshere)
    })
  }, [currentUser, date, itemshere])

  /* function to add new task to firestore */
  const handleSubmit = async (userEmail) => {
    setDeleting(true)
    try {
      await deleteDoc(doc(db, date.toString(), `${userEmail}`))
        .then(() => {
          console.log('Document successfully deleted!')
        })
        .catch((error) => {
          console.error('Error removing document: ', error)
        })
    } catch (err) {
      alert(err)
    }
    setDeleting(false)
  }

  const bulkDelete = async () => {
    setDeleting(true)
    items.forEach((item) => {
      handleSubmit(item.email)
    })
    setDeleting(false)
  }
  const cardImage = (email) => {
    // console.log(FirebaseDatabase.getReference('users').orderByKey().equalTo(yourUID))
    // return 'https://lh3.googleusercontent.com/a-/' + md5(email) + '=s' + 100
  }

  return (
    <div className='center'>
      <div className='ticket-visual_visual'>
        <div className='ticket-visual-wrapper py-30'>
          {items.length === 0 ? (
            <p>No Data</p>
          ) : (
            items.map((item, index) => {
              return (
                <div key={index}>
                  <br />
                  <div className='ticket-visual_ticket-number font-right'>
                    № {`${item.data.id}`}
                  </div>
                  <div className='ticket-profile_profile'>
                    <img
                      width='100%'
                      src={cardImage(item.email) ?? './card.png'}
                      alt='Card Illustration'
                      className='ticket-profile_image'
                    />
                    <br />
                    {currentUser?.email === 'ymakarim@gmail.com' && (
                      <button className='btn inline-block' onClick={() => handleSubmit(item.email)}>
                        {deleting ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                    <hr />
                  </div>
                </div>
              )
            })
          )}
          {currentUser?.email === 'ymakarim@gmail.com' && items.length > 0 && (
            <div className='fields'>
              <button className='btn' onClick={() => bulkDelete()}>
                {deleting ? 'Deleting...' : 'Delete All'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default List
