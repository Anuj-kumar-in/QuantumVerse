// hooks/useWallet.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { HashConnect, HashConnectConnectionState } from 'hashconnect';
import { LedgerId, TransferTransaction, AccountId, Hbar } from '@hashgraph/sdk';

const appMetadata = {
    name: "QuantumVerse",
    description: "AR/VR game with carbon credits",
    icons: ["https://yourdomain.com/logo.png"],
    url: window.location.origin
    };

    const walletConnectId = "9df5a32fda8222e3671eb5a93be8b4d8";

    export const useWallet = () => {
    const [state, setState] = useState(HashConnectConnectionState.Disconnected);
    const [pairingData, setPairingData] = useState(null);
    const [connectedAccount, setConnectedAccount] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    

    const hashconnectRef = useRef(null);


    useEffect(() => {
        let isMounted = true;

        const initializeHashConnect = async () => {

        if (hashconnectRef.current) {
            console.log('HashConnect already initialized');
            return;
        }

        try {
            console.log('🔷 Initializing HashConnect...');
            

            const hashconnect = new HashConnect(
            LedgerId.TESTNET,
            walletConnectId,
            appMetadata,
            true // debug mode
            );


            hashconnect.pairingEvent.on((newPairing) => {
            console.log('✅ Pairing successful:', newPairing);
            if (isMounted) {
                setPairingData(newPairing);
                if (newPairing?.accountIds?.length > 0) {
                setConnectedAccount(newPairing.accountIds[0]);
                }
            }
            });

            hashconnect.disconnectionEvent.on((data) => {
            console.log('🔌 Wallet disconnected:', data);
            if (isMounted) {
                setPairingData(null);
                setConnectedAccount(null);
            }
            });

            hashconnect.connectionStatusChangeEvent.on((connectionStatus) => {
            console.log('🔄 Connection status changed:', connectionStatus);
            if (isMounted) {
                setState(connectionStatus);
            }
            });

            // Now initialize
            await hashconnect.init();
            console.log('✅ HashConnect initialized successfully');

            if (isMounted) {
            hashconnectRef.current = hashconnect;
            setIsInitialized(true);
            }

        } catch (error) {
            console.error('❌ Failed to initialize HashConnect:', error);
            if (isMounted) {
            setState(HashConnectConnectionState.Disconnected);
            }
        }
        };

        initializeHashConnect();


        return () => {
        isMounted = false;
        if (hashconnectRef.current) {
            hashconnectRef.current.disconnect().catch(console.error);
        }
        };
    }, []);


    const connectWallet = useCallback(async () => {
        if (!isInitialized || !hashconnectRef.current) {
        throw new Error('HashConnect not initialized yet. Please wait a moment.');
        }

        if (state === HashConnectConnectionState.Paired && connectedAccount) {
        console.log('✅ Wallet already connected:', connectedAccount);
        return connectedAccount;
        }

        try {
        console.log('🔷 Opening pairing modal...');
        

        await hashconnectRef.current.openPairingModal();

        
        } catch (error) {
        console.error('❌ Failed to open pairing modal:', error);
        throw error;
        }
    }, [isInitialized, state, connectedAccount]);


    const disconnectWallet = useCallback(async () => {
        if (hashconnectRef.current) {
        try {
            console.log('🔌 Disconnecting wallet...');
            await hashconnectRef.current.disconnect();
            setPairingData(null);
            setConnectedAccount(null);
            setState(HashConnectConnectionState.Disconnected);
        } catch (error) {
            console.error('❌ Disconnect failed:', error);
        }
        }
    }, []);


    const sendHbar = useCallback(async (toAccountId, amount) => {
        if (!hashconnectRef.current || !connectedAccount) {
        throw new Error("Wallet not connected");
        }

        try {
        const fromAccount = AccountId.fromString(connectedAccount);
        const toAccount = AccountId.fromString(toAccountId);
        const signer = hashconnectRef.current.getSigner(fromAccount);

        const transaction = await new TransferTransaction()
            .addHbarTransfer(fromAccount, new Hbar(-amount))
            .addHbarTransfer(toAccount, new Hbar(amount))
            .freezeWithSigner(signer);

        const response = await transaction.executeWithSigner(signer);
        const receipt = await response.getReceiptWithSigner(signer);
        
        return receipt;
        } catch (error) {
        console.error("❌ Transaction failed:", error);
        throw error;
        }
    }, [connectedAccount]);


    const getSigner = useCallback(() => {
        if (!hashconnectRef.current || !connectedAccount) {
        throw new Error("Wallet not connected");
        }
        return hashconnectRef.current.getSigner(AccountId.fromString(connectedAccount));
    }, [connectedAccount]);

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
        hashconnect: hashconnectRef.current
    };
    };
