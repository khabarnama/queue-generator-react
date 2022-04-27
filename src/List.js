import { useAuthValue } from './AuthContext'
import { db } from './firebase'
import { useEffect, useState } from 'react'
import { collection, query, doc, deleteDoc, onSnapshot } from 'firebase/firestore'

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

  return (
    <div className='center'>
      <div className='ticket-visual_visual'>
        <div className='ticket-visual-wrapper py-30'>
          {items.length === 0 ? (
            <p>No Data</p>
          ) : (
            items.map((item, index) => {
              return (
                <div key={index} className='flex justify-between gap-2 p-2'>
                  <div className=''>№ {`${item.data.id}`}</div>
                  <small>|</small>
                  <div className=''>{`${item.email.split('@')[0]}`}</div>
                  <small>|</small>
                  <button className='btn' onClick={() => handleSubmit(item.email)}>
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default List
