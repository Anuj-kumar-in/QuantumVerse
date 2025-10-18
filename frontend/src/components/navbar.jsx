
import React from 'react'
import { useWallet } from '../Context/WalletContext'

export default function Navbar() {
    const { isConnected, connectedAccount, connectWallet, disconnectWallet, connectionState } = useWallet()

    const btnText = connectionState === 'Connecting'
        ? 'Connecting…' 
        : isConnected
        ? `Disconnect (${connectedAccount.slice(0,8)}…${connectedAccount.slice(-4)})`
        : 'Connect Hedera Wallet'

    const btnClass = connectionState === 'Connecting'
        ? 'bg-yellow-500 text-white cursor-not-allowed'
        : isConnected
        ? 'bg-green-500 text-white hover:bg-green-600'
        : 'bg-[var(--mustard)] text-[var(--ink)] hover:opacity-80'

    const onClick = () => {
        if (isConnected) disconnectWallet()
        else connectWallet()
    }

    return (
        <header className="flex justify-between items-center p-4 bg-[var(--pane)] text-[var(--mustard)] rounded-lg shadow sticky top-4">
        <h1 className="text-xl font-bold">QuantumVerse</h1>
        <button
            onClick={onClick}
            disabled={connectionState === 'Connecting'}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${btnClass}`}
        >
            🔷 {btnText}
        </button>
        </header>
    )
}
