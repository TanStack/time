import { render } from 'solid-js/web'

function App() {
  return (
    <div style={{ padding: '20px', 'font-family': 'sans-serif' }}>
      <h1>TanStack Time - Solid Basic Example</h1>
    </div>
  )
}

render(() => <App />, document.getElementById('root')!)
