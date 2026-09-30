import React from 'react'

const Emotion = (props) => {
  return (
        <div className="emotion">{props.emotion} <span style={{color:props.color}}>{props.val}</span></div>
  )
}

export default Emotion