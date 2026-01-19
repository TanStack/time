import ReactDOM from 'react-dom/client'
import { TimeDevtools } from '@tanstack/react-time-devtools'

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Devtools:</h2>
      <TimeDevtools />
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
