import React from 'react'
import { useWallet } from '../Context/WalletContext'
import logo from '/image/logo.jpeg' 

export default function Navbar() {
    const { isConnected, connectedAccount, connectWallet, disconnectWallet, connectionState } = useWallet()

    const btnText = connectionState === 'Connecting'
        ? 'Connecting…'
        : isConnected
        ? `Disconnect (${connectedAccount.slice(0,8)}…${connectedAccount.slice(-4)})`
        : 'Connect Wallet'

    const btnClass = connectionState === 'Connecting'
        ? 'bg-yellow-500 text-white cursor-not-allowed'
        : isConnected
        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
        : 'bg-gradient-to-r from-[var(--mustard)] to-yellow-600 text-[var(--ink)] hover:opacity-90'

    return (
        <header className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 sm:p-6 bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] rounded-3xl shadow-2xl border border-gray-800">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
            <div className="relative">
            <img 
                src={logo} 
                alt="QuantumVerse Logo" 
                className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-full ring-2 ring-[var(--mustard)]/30 shadow-lg" 
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[var(--ink)] animate-pulse"></div>
            </div>
            <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-[var(--mustard)] via-yellow-500 to-[var(--mustard)] bg-clip-text text-transparent select-none tracking-wide drop-shadow-lg">
                QuantumVerse
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Multi-Reality Platform</p>
            </div>
        </div>

        {/* Connection Status and Button */}
        <div className="flex items-center gap-3">
            {isConnected && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-xs font-medium">
                {connectedAccount.slice(0,6)}...{connectedAccount.slice(-4)}
                </span>
            </div>
            )}

            <button
            onClick={isConnected ? disconnectWallet : connectWallet}
            disabled={connectionState === 'Connecting'}
            className={`px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${btnClass}`}
            >
            <span className="flex items-center gap-2">
                <span>🔷</span>
                <span className="hidden sm:inline">{btnText}</span>
                <span className="sm:hidden">
                {isConnected ? 'Disconnect' : 'Connect'}
                </span>
            </span>
            </button>
        </div>
        </header>
    )
}
