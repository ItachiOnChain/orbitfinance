import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

return (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
    <div className="flex space-x-4 mb-6">
      <a href="https://vite.dev" target="_blank">
        <img src={viteLogo} className="h-16 w-16" alt="Vite logo" />
      </a>
      <a href="https://react.dev" target="_blank">
        <img src={reactLogo} className="h-16 w-16" alt="React logo" />
      </a>
    </div>
    <h1 className="text-3xl font-bold mb-4">Vite + React</h1>
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-4">
      <button
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white"
        onClick={() => setCount((c) => c + 1)}
      >
        count is {count}
      </button>
      <p className="mt-2">
        Edit <code>src/App.tsx</code> and save to test HMR
      </p>
    </div>
    <p className="text-sm text-gray-400">
      Click on the Vite and React logos to learn more
    </p>
  </div>
);
}

export default App
