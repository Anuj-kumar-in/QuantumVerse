
import React, { createContext, useContext } from 'react'
import { useWallet as useHashConnectWallet } from '../hooks/useWallet'

const WalletContext = createContext(null)

export function WalletProvider({ children }) {
    const wallet = useHashConnectWallet()
    return (
        <WalletContext.Provider value={wallet}>
        {children}
        </WalletContext.Provider>
    )
    }

    export function useWallet() {
    const ctx = useContext(WalletContext)
    if (!ctx) {
        throw new Error('useWallet must be used within WalletProvider')
    }
    return ctx
}
