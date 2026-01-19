import React from 'react'
import ReactDOM from 'react-dom/client'

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>TanStack Time - React Basic Example</h1>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
