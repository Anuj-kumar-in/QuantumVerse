// src/App.js
import React, { useState } from 'react'
import { WalletProvider } from './Context/WalletContext'
import Navbar from './components/navbar'
import Sidebar from './components/sidebar'
import Carbon from './pages/Carbon'
import Marketplace from './pages/Marketplace'
import Identity from './pages/Identity'
import Entanglement from './pages/Entanglement'
import SplashCursor from './UI/SplashCursor'

function AppContent() {
    const [activePage, setActivePage] = useState('marketplace')

    const renderPage = () => {
        switch (activePage) {
        case 'marketplace': return <Marketplace />
        case 'carbon':      return <Carbon />
        case 'identity':    return <Identity />
        case 'entanglement':return <Entanglement />
        default:            return <Marketplace />
        }
    }

    return (
        <>
        <style>{`
                            :root {
                --ink: #0a0a0f;           /* Very dark blue-black */
                --pane: #1a1a2e;         /* Dark blue-gray */
                --mustard: #ffd700;      /* Gold accent */
            }


                    @keyframes fade {
                        from { opacity:.3; transform: translateY(4px); }
                        to   { opacity:1;  transform: translateY(0); }
                    }
                    .fade-in { animation: fade .25s ease; }
                `}</style>
        <SplashCursor />
        <div className="min-h-screen bg-[var(--ink)]">
            <div className="w-90vw mx-auto px-4 py-6 space-y-6">
            <Navbar />
            <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
                <Sidebar activePage={activePage} setActivePage={setActivePage} />
                <main className="min-h-[80vh]">
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
