import React from 'react'
import { useWallet } from '../hooks/useWallet'

const Navbar = () => {
    const { 
        isConnected, 
        connectedAccount, 
        connectWallet, 
        disconnectWallet, 
        connectionState 
    } = useWallet()

    const handleWalletAction = async () => {
        try {
            if (isConnected) {
                disconnectWallet();
            } else {
                await connectWallet();
            }
        } catch (error) {
            console.error("Wallet action failed:", error);
            alert("Failed to connect wallet. Please try again.");
        }
    };

    const formatAccountId = (accountId) => {
        if (!accountId) return '';
        return `${accountId.slice(0, 8)}...${accountId.slice(-4)}`;
    };

    const getWalletButtonText = () => {
        if (connectionState === 'Connecting') return 'Connecting...';
        if (isConnected) return `Disconnect (${formatAccountId(connectedAccount)})`;
        return 'Connect Hedera Wallet';
    };

    const getWalletButtonClass = () => {
        const baseClass = "px-4 py-2 rounded-lg font-semibold transition-colors text-sm";
        if (connectionState === 'Connecting') {
            return `${baseClass} bg-yellow-500 text-white cursor-not-allowed`;
        }
        if (isConnected) {
            return `${baseClass} bg-green-500 text-white hover:bg-green-600`;
        }
        return `${baseClass} bg-[var(--mustard)] text-[var(--ink)] hover:opacity-80`;
    };

    return (
        <nav className="bg-[var(--pane)] text-[var(--mustard)] rounded-2xl p-4 shadow-xl fade-in sticky top-2">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h1 className="text-xl font-bold">QuantumVerse</h1>

                <div className="flex items-center gap-4">
                    {/* Connection Status Indicator */}
                    <div className="flex items-center gap-2">
                        {isConnected ? (
                            <div className="flex items-center gap-2 text-green-400">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                <span className="text-xs font-medium hidden sm:inline">Connected: {formatAccountId(connectedAccount)}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-red-400">
                                <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                                <span className="text-xs font-medium hidden sm:inline">Wallet Disconnected</span>
                            </div>
                        )}
                    </div>

                    {/* Wallet Connection Button */}
                    <button 
                        onClick={handleWalletAction}
                        disabled={connectionState === 'Connecting'}
                        className={getWalletButtonClass()}
                    >
                        🔷 {getWalletButtonText()}
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
