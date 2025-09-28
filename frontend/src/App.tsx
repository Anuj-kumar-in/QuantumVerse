import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/common/Layout'
import React, { useState, useEffect } from 'react';
import { useHedera } from './hooks/useHedera'
import { initializeHederaClient } from './services/hedera/client'
// Pages
import Home from './pages/Home'
// import Dashboard from './pages/Dashboard'
// import Marketplace from '@pages/Marketplace'
// import Identity from '@pages/Identity'
// import AIEntities from '@pages/AIEntities'
// import Entanglement from '@pages/Entanglement'
// import Carbon from '@pages/Carbon'
// import Portal from '@pages/Portal'
initializeHederaClient()
function App() {
  const { isInitialized: isHederaInitialized } = useHedera();  // Track the hook’s state
  const [isInitializedByApp, setIsInitializedByApp] = useState(false); // Your own state for initialization control

  // Initialize Hedera inside your App component’s useEffect
  useEffect(() => {
    async function initialize() {
      await initializeHederaClient();
      setIsInitializedByApp(true);
    }
    initialize();
  }, []);
  const readyToShowApp = isInitializedByApp; // or: isHederaInitialized || isInitializedByApp

  if (!readyToShowApp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-quantum-400 mx-auto mb-4"></div>
          <h2 className="text-xl font-quantum text-quantum-300">
            Initializing QuantumVerse...
          </h2>
          <p className="text-gray-400 mt-2">
            Connecting to Hedera Hashgraph
          </p>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        {/* <Route path="/marketplace" element={<Marketplace />} /> */}
        {/* <Route path="/identity" element={<Identity />} />
        <Route path="/ai-entities" element={<AIEntities />} />
        <Route path="/entanglement" element={<Entanglement />} />
        <Route path="/carbon" element={<Carbon />} />
        <Route path="/portal" element={<Portal />} /> */}
      </Routes>
    </Layout>
  )
}

export default App