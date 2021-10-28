import React, { useEffect, useState } from 'react'
import Spinner from '@components/primitives/Spinner';
function Home() {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(()=>{
      setLoading(false)
    }, 1000)
  },[])

  if (loading) return <Spinner/>

  if (!items) return <h1>No items for sale</h1>
  
  return (
    <div>
      <div>

      </div>
    </div>
  )
}

export default Home
