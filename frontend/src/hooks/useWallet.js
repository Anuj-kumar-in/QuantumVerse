// hooks/useWallet.js
import { useState, useEffect, useCallback } from 'react';
import { HashConnect, HashConnectConnectionState } from 'hashconnect';
import { LedgerId, TransferTransaction, AccountId, Hbar } from '@hashgraph/sdk';


const appMetadata = {
    name: "QuantumVerse",
    description: "AR/VR game",
    icons: [""],
    url: "https://localhost:3000"
    };

    let hashconnectInstance = null;
    const walletConnectId = "9df5a32fda8222e3671eb5a93be8b4d8"

    export const useWallet = () => {
    const [state, setState] = useState(HashConnectConnectionState.Disconnected);
    const [pairingData, setPairingData] = useState(null);
    const [connectedAccount, setConnectedAccount] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize HashConnect
    const initializeHashConnect = useCallback(async () => {
        if (hashconnectInstance || isInitialized) return hashconnectInstance;

        try {
        // Create HashConnect instance
        hashconnectInstance = new HashConnect(
            LedgerId.TESTNET,
            walletConnectId,
            appMetadata,
            true
        );

        // Set up event listeners
        hashconnectInstance.pairingEvent.on((newPairing) => {
            console.log("Paired with wallet:", newPairing);
            setPairingData(newPairing);
            setConnectedAccount(newPairing.accountIds[0]);
        });

        hashconnectInstance.disconnectionEvent.on((data) => {
            console.log("Wallet disconnected:", data);
            setPairingData(null);
            setConnectedAccount(null);
        });

        hashconnectInstance.connectionStatusChangeEvent.on((connectionStatus) => {
            console.log("Connection status changed:", connectionStatus);
            setState(connectionStatus);
        });

        // Initialize HashConnect
        await hashconnectInstance.init();
        setIsInitialized(true);

        console.log("HashConnect initialized successfully");
        return hashconnectInstance;
        } catch (error) {
        console.error("Failed to initialize HashConnect:", error);
        throw error;
        }
    }, [isInitialized]);

    // Connect wallet function
    const connectWallet = useCallback(async () => {
        try {
        if (!hashconnectInstance) {
            await initializeHashConnect();
        }

        // Check if already connected
        if (state === HashConnectConnectionState.Paired && connectedAccount) {
            console.log("Wallet already connected:", connectedAccount);
            return connectedAccount;
        }

        // Open pairing modal
        hashconnectInstance.openPairingModal();
        
        return new Promise((resolve, reject) => {
            // Listen for successful pairing
            const handlePairing = (pairingData) => {
            resolve(pairingData.accountIds[0]);
            hashconnectInstance.pairingEvent.off(handlePairing);
            };

            hashconnectInstance.pairingEvent.on(handlePairing);

            // Timeout after 30 seconds
            setTimeout(() => {
            hashconnectInstance.pairingEvent.off(handlePairing);
            reject(new Error("Connection timeout"));
            }, 30000);
        });
        } catch (error) {
        console.error("Failed to connect wallet:", error);
        throw error;
        }
    }, [state, connectedAccount, initializeHashConnect]);

    // Disconnect wallet function
    const disconnectWallet = useCallback(() => {
        if (hashconnectInstance) {
        hashconnectInstance.disconnect();
        }
    }, []);

    // Send HBAR transaction
    const sendHbar = useCallback(async (toAccountId, amount) => {
        if (!hashconnectInstance || !connectedAccount) {
        throw new Error("Wallet not connected");
        }

        try {
        const fromAccount = AccountId.fromString(connectedAccount);
        const toAccount = AccountId.fromString(toAccountId);
        const signer = hashconnectInstance.getSigner(fromAccount);

        const transaction = await new TransferTransaction()
            .addHbarTransfer(fromAccount, new Hbar(-amount))
            .addHbarTransfer(toAccount, new Hbar(amount))
            .freezeWithSigner(signer);

        const response = await transaction.executeWithSigner(signer);
        const receipt = await response.getReceiptWithSigner(signer);
        
        return receipt;
        } catch (error) {
        console.error("Transaction failed:", error);
        throw error;
        }
    }, [connectedAccount]);

    // Get signer for transactions
    const getSigner = useCallback(() => {
        if (!hashconnectInstance || !connectedAccount) {
        throw new Error("Wallet not connected");
        }
        return hashconnectInstance.getSigner(AccountId.fromString(connectedAccount));
    }, [connectedAccount]);

    // Initialize on mount
    useEffect(() => {
        initializeHashConnect();
    }, [initializeHashConnect]);

    return {
        // State
        isConnected: state === HashConnectConnectionState.Paired && !!connectedAccount,
        connectedAccount,
        connectionState: state,
        pairingData,
        isInitialized,
        
        // Methods
        connectWallet,
        disconnectWallet,
        sendHbar,
        getSigner,
        hashconnect: hashconnectInstance
    };
    };

    // Export individual functions for backward compatibility
    export const connectWallet = async () => {
    // This is a simplified version for your existing component
    const { connectWallet: connect } = useWallet();
    return connect();
};
