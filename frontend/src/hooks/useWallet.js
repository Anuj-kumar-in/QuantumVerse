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
    const walletConnectId = "e1001930ab636b816934c94b6767fec9"

    export const useWallet = () => {
    const [state, setState] = useState(HashConnectConnectionState.Disconnected);
    const [pairingData, setPairingData] = useState(null);
    const [connectedAccount, setConnectedAccount] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const initializeHashConnect = useCallback(async () => {
        if (hashconnectInstance || isInitialized) return hashconnectInstance;

        try {
        hashconnectInstance = new HashConnect(
            LedgerId.TESTNET,
            walletConnectId,
            appMetadata,
            true
        );

        hashconnectInstance.pairingEvent.on((newPairing) => {
            setPairingData(newPairing);
            setConnectedAccount(newPairing.accountIds[0]);
        });

        hashconnectInstance.disconnectionEvent.on((data) => {
            setPairingData(null);
            setConnectedAccount(null);
        });

        hashconnectInstance.connectionStatusChangeEvent.on((connectionStatus) => {
            setState(connectionStatus);
        });

        await hashconnectInstance.init();
        setIsInitialized(true);

        return hashconnectInstance;
        } catch (error) {
        throw error;
        }
    }, [isInitialized]);

    const connectWallet = useCallback(async () => {
        try {
        if (!hashconnectInstance) {
            await initializeHashConnect();
        }

        if (state === HashConnectConnectionState.Paired && connectedAccount) {
            return connectedAccount;
        }

        hashconnectInstance.openPairingModal();
        
        return new Promise((resolve, reject) => {
            const handlePairing = (pairingData) => {
            resolve(pairingData.accountIds[0]);
            hashconnectInstance.pairingEvent.off(handlePairing);
            };

            hashconnectInstance.pairingEvent.on(handlePairing);

            setTimeout(() => {
            hashconnectInstance.pairingEvent.off(handlePairing);
            reject(new Error("Connection timeout"));
            }, 30000);
        });
        } catch (error) {
        throw error;
        }
    }, [state, connectedAccount, initializeHashConnect]);

    const disconnectWallet = useCallback(() => {
        if (hashconnectInstance) {
        hashconnectInstance.disconnect();
        }
    }, []);

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
        throw error;
        }
    }, [connectedAccount]);

    const getSigner = useCallback(() => {
        if (!hashconnectInstance || !connectedAccount) {
        throw new Error("Wallet not connected");
        }
        return hashconnectInstance.getSigner(AccountId.fromString(connectedAccount));
    }, [connectedAccount]);

    useEffect(() => {
        initializeHashConnect();
    }, [initializeHashConnect]);

    return {
        isConnected: state === HashConnectConnectionState.Paired && !!connectedAccount,
        connectedAccount,
        connectionState: state,
        pairingData,
        isInitialized,
        connectWallet,
        disconnectWallet,
        sendHbar,
        getSigner,
        hashconnect: hashconnectInstance
    };
    };

    export const connectWallet = async () => {
    const { connectWallet: connect } = useWallet();
    return connect();
};