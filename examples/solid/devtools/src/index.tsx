import { render } from 'solid-js/web'
import { TimeDevtools } from '@tanstack/solid-time-devtools'

function App() {
  return (
    <div style={{ padding: '20px', 'font-family': 'sans-serif' }}>
      <h1>TanStack Time - Solid Devtools Example</h1>
      <h2>Devtools:</h2>
      <TimeDevtools />
    </div>
  )
}

render(() => <App />, document.getElementById('root')!)
