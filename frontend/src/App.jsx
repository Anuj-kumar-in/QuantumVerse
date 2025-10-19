// src/App.js
import React, { useState } from 'react'
import { WalletProvider } from './Context/WalletContext'
import Navbar from './components/navbar'
import Sidebar from './components/sidebar'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import Carbon from './pages/Carbon'
import Marketplace from './pages/Marketplace'
import Identity from './pages/Identity'
import Entanglement from './pages/Entanglement'

function AppContent() {
  const [activePage, setActivePage] = useState('home')

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':   return <Dashboard />
      case 'home':        return <Home />
      case 'marketplace': return <Marketplace />
      case 'carbon':      return <Carbon />
      case 'identity':    return <Identity />
      case 'entanglement':return <Entanglement />
      default:            return <Home />
    }
  }

  return (
    <>
      <style>{`
        :root {
          --ink: #0a0a0f;
          --pane: #1a1a2e;
          --mustard: #ffd700;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 0.4s ease-out; }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--mustard);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d4a942;
        }
      `}</style>

      <div className="min-h-screen bg-[var(--ink)]">
        {/* Navbar - Sticky at top */}
        <div className="sticky top-0 z-50 px-4 pt-4">
          <Navbar />
        </div>

        {/* Main Content Area with Sidebar */}
        <div className="w-full px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            {/* Sidebar */}
            <Sidebar activePage={activePage} setActivePage={setActivePage} />
            
            {/* Main Content - Full width */}
            <main className="min-h-screen w-full">
              {renderPage()}
            </main>
          </div>
        </div>
      </div>
    </>
  )
}

export default function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  )
}
