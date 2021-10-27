import React from 'react'
import Navbar from './Navbar'
import {ReactNode} from 'react'


function Default({children}) {
  return (
    <div>
      <Navbar/>
      <div>{children}</div>    
    </div>
  )
}

export default Default
