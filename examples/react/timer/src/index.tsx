import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { useTimer } from '@tanstack/react-time'
import { useState } from 'react'
import './index.css'

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export default function App() {
  const [customTime, setCustomTime] = useState('60')

  const timer = useTimer({
    initialTime: 60,
  })

  const { currentTime, initialTime, progress, state, reset, toggle, setTime } =
    timer
  const remainingTime = currentTime

  const isRunning = state === 'running'

  const handleSetTime = () => {
    const time = parseInt(customTime, 10)
    if (!isNaN(time) && time > 0) {
      setTime(time)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">
          TanStack Time Timer Example
        </h1>
        <p className="text-gray-600 text-center mb-8">
          A countdown timer built with TanStack Time
        </p>
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div
                className="text-7xl font-bold text-gray-800 mb-4 transition-all duration-300"
                style={{
                  color:
                    remainingTime.seconds <= 10 && state === 'running'
                      ? '#ef4444'
                      : '#1f2937',
                }}
              >
                {formatTime(remainingTime.seconds)}
              </div>
              {state === 'finished' && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-green-600 font-semibold animate-pulse">
                  Timer finished! 🎉
                </div>
              )}
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex gap-4 justify-center mb-6">
            <button
              onClick={toggle}
              disabled={remainingTime.seconds === 0}
              className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              style={{
                backgroundColor: isRunning ? '#ef4444' : '#10b981',
              }}
            >
              {isRunning ? '⏸ Pause' : '▶ Start'}
            </button>
            <button
              onClick={() => reset()}
              disabled={isRunning}
              className="px-6 py-3 rounded-lg font-semibold bg-gray-600 text-white hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              ↻ Reset
            </button>
          </div>

          <div className="border-t pt-6 mt-6">
            <div className="flex gap-4 items-center justify-center">
              <label
                htmlFor="custom-time"
                className="text-gray-700 font-medium"
              >
                Set Timer (seconds):
              </label>
              <input
                id="custom-time"
                type="number"
                min="1"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSetTime()
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed w-32"
              />
              <button
                onClick={handleSetTime}
                className="px-4 py-2 rounded-lg font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                Set
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Quick Presets
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[15, 30, 60, 120, 300, 600].map((seconds) => (
              <button
                key={seconds}
                onClick={() => {
                  setCustomTime(seconds.toString())
                  setTime(seconds)
                }}
                disabled={isRunning}
                className="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formatTime(seconds)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Timer State</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span
                className={`font-semibold ${
                  isRunning ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                {isRunning ? 'Running' : 'Stopped'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Remaining Time:</span>
              <span className="font-semibold text-gray-800">
                {remainingTime.seconds}s
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Initial Time:</span>
              <span className="font-semibold text-gray-800">
                {initialTime}s
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Progress:</span>
              <span className="font-semibold text-gray-800">
                {progress.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const rootElement = document.getElementById('root')!

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
