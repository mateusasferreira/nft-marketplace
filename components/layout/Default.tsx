import React from 'react'
import Navbar from './Navbar'


function Default({children}) {
  return (
    <div>
      <Navbar/>
      <div>{children}</div>    
    </div>
  )
}

export default Default
