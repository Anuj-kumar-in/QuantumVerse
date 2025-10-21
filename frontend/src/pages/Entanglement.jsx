import React, { useState, useEffect } from 'react'
import { useWallet } from '../Context/WalletContext'
import { 
    TokenCreateTransaction,
    TokenType,
    TransferTransaction,
    AccountId,
    TokenId,
    TopicCreateTransaction,
    TopicMessageSubmitTransaction,
} from '@hashgraph/sdk'

const Entanglement = () => {
    const { 
        isConnected, 
        connectedAccount, 
        getSigner, 
        connectWallet, 
        disconnectWallet, 
        connectionState 
    } = useWallet()
    
    const [activeTab, setActiveTab] = useState('lab')
    const [entanglementState, setEntanglementState] = useState({
        entanglements: [],
        loading: false,
        error: null
    })
    
    const [quantumTokenId, setQuantumTokenId] = useState(null)
    const [entanglementTopic, setEntanglementTopic] = useState(null)
    const [userNFTs, setUserNFTs] = useState([])
    const [selectedNFT_A, setSelectedNFT_A] = useState(null)
    const [selectedNFT_B, setSelectedNFT_B] = useState(null)
    const [partnerAccount, setPartnerAccount] = useState('')
    const [assetStates, setAssetStates] = useState({})
    const [entanglementPairs, setEntanglementPairs] = useState({})

    function imageUrl(){
        const randomImageNum= Math.floor(Math.random() * 10) + 1
        const Url = `/image/${randomImageNum}.jpg`;
        return Url
    }

    const tabs = [
        { id: 'lab', label: 'Entanglement Lab', icon: '🔬' },
        { id: 'monitor', label: 'Monitor', icon: '📊' },
        { id: 'mynfts', label: 'My NFTs', icon: '🎨' },
        { id: 'theory', label: 'Quantum Theory', icon: '📚' }
    ]

    const activeEntanglements = entanglementState.entanglements.filter(e => e.isActive)
    const totalStrength = activeEntanglements.reduce((sum, e) => sum + e.entanglementStrength, 0)

    const ENTANGLEMENT_COST = 50
    const MIN_STRENGTH = 10
    const MAX_STRENGTH = 100

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
        const baseClass = "px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5";

        if (connectionState === 'Connecting') {
            return `${baseClass} bg-yellow-500 text-white cursor-not-allowed`;
        }

        if (isConnected) {
            return `${baseClass} bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700`;
        }

        return `${baseClass} bg-gradient-to-r from-[var(--mustard)] to-yellow-600 text-[var(--ink)] hover:opacity-90`;
    };

    const fetchUserNFTs = async () => {
        if (!isConnected) return

        try {
            const resp = await fetch(
                `https://testnet.mirrornode.hedera.com/api/v1/accounts/${connectedAccount}/nfts`
            )
            const data = await resp.json()
            const nftBalances = data.nfts
            const nfts = nftBalances.map((nft) => {
                let metadata = {}
                if (nft.metadata) {
                    try {
                        const json = Buffer.from(nft.metadata, 'base64').toString()
                        metadata = JSON.parse(json)
                    } catch {}
                }
                return {
                    tokenId: nft.token_id,
                    serial: nft.serial_number,
                    name: metadata.name || `${nft.token_id} #${nft.serial_number}`,
                    image: metadata.image || `https://via.placeholder.com/150?text=NFT+${nft.serial_number}`,
                    realityType: metadata.realityType || 'VIRTUAL'
                }
            })
            setUserNFTs(nfts)
            console.log('Fetched NFTs via Mirror Node:', nfts)
        } catch (error) {
            console.error('Error fetching user NFTs via Mirror Node:', error)
        }
    }

    const createQuantumToken = async () => {
        if (!isConnected) {
            await connectWallet()
            return
        }

        try {
            const signer = getSigner()
            if (!connectedAccount || typeof connectedAccount !== 'string') {
                throw new Error('Invalid connected account')
            }
            
            const accountId = AccountId.fromString(connectedAccount)

            const tokenCreateTxn = new TokenCreateTransaction()
                .setTokenName("Quantum Token")
                .setTokenSymbol("QUANTUM")
                .setTokenType(TokenType.FungibleCommon)
                .setDecimals(8)
                .setInitialSupply(10000 * 100000000)
                .setTreasuryAccountId(accountId)
                .setAutoRenewAccountId(accountId)
                .setAutoRenewPeriod(7890000)

            const frozenTx = await tokenCreateTxn.freezeWithSigner(signer)
            const txResponse = await frozenTx.executeWithSigner(signer)
            const receipt = await txResponse.getReceiptWithSigner(signer)

            const tokenIdObj = receipt.tokenId
            const tokenIdStr = tokenIdObj.toString()
            
            setQuantumTokenId(tokenIdStr)
            localStorage.setItem('quantumTokenId', tokenIdStr)
            console.log('QUANTUM Token created:', tokenIdStr)

            return tokenIdStr
        } catch (error) {
            console.error('Error creating QUANTUM token:', error)
            throw error
        }
    }

    const createEntanglementTopic = async () => {
        if (!isConnected) {
            await connectWallet()
            return
        }

        try {
            const signer = getSigner()
            
            const topicCreateTxn = new TopicCreateTransaction()
                .setTopicMemo("QuantumVerse Entanglement Registry")
                .setAutoRenewAccountId(AccountId.fromString(connectedAccount))
                .setAutoRenewPeriod(7890000)

            const frozenTx = await topicCreateTxn.freezeWithSigner(signer)
            const txResponse = await frozenTx.executeWithSigner(signer)
            const receipt = await txResponse.getReceiptWithSigner(signer)
            
            const topicIdStr = receipt.topicId.toString()
            setEntanglementTopic(topicIdStr)
            localStorage.setItem('entanglementTopic', topicIdStr)
            
            console.log('Entanglement Topic created:', topicIdStr)
            return topicIdStr
        } catch (error) {
            console.error('Error creating entanglement topic:', error)
            throw new Error(error.message || 'Failed to create entanglement topic')
        }
    }

    const calculateInitialStrength = (realityTypeA, realityTypeB, tokenIdA, serialA, tokenIdB, serialB) => {
        let baseStrength = 50

        if (realityTypeA === realityTypeB) {
            baseStrength += 20
        }

        const realityMap = { 'VIRTUAL': 0, 'AUGMENTED': 1, 'PHYSICAL': 2, 'MIXED': 3 }
        const typeA = realityMap[realityTypeA] || 0
        const typeB = realityMap[realityTypeB] || 0
        
        if (typeA === 3 || typeB === 3) {
            baseStrength += 15
        }

        const hash = `${tokenIdA}${serialA}${tokenIdB}${serialB}${Date.now()}`
        const randomFactor = parseInt(hash.slice(-2), 16) % 21
        baseStrength += randomFactor

        if (baseStrength < MIN_STRENGTH) baseStrength = MIN_STRENGTH
        if (baseStrength > MAX_STRENGTH) baseStrength = MAX_STRENGTH

        return baseStrength
    }

    const calculateEntangledState = (sourceState, strength) => {
        const entangledState = {
            health: sourceState.health * (200 - strength) / 100,
            experience: sourceState.experience * strength / 100,
            positionX: sourceState.positionX + (strength * 10),
            positionY: sourceState.positionY - (strength * 10),
            positionZ: sourceState.positionZ,
            timestamp: Date.now()
        }

        const stateString = JSON.stringify([
            entangledState.health,
            entangledState.experience,
            entangledState.positionX,
            entangledState.positionY,
            entangledState.positionZ,
            entangledState.timestamp
        ])
        
        entangledState.stateHash = hashString(stateString)

        return entangledState
    }

    const createQuantumEntanglement = async () => {
        if (!isConnected) {
            await connectWallet()
            return
        }

        if (!selectedNFT_A || !selectedNFT_B) {
            alert('Please select two NFTs to entangle')
            return
        }

        if (!partnerAccount) {
            alert('Please enter partner account ID')
            return
        }

        if (partnerAccount === connectedAccount) {
            alert("Cannot entangle with yourself")
            return
        }

        const nftKey_A = `${selectedNFT_A.tokenId}.${selectedNFT_A.serial}`
        const nftKey_B = `${selectedNFT_B.tokenId}.${selectedNFT_B.serial}`
        const pairKey1 = `${nftKey_A}-${nftKey_B}`
        const pairKey2 = `${nftKey_B}-${nftKey_A}`

        if (entanglementPairs[pairKey1] || entanglementPairs[pairKey2]) {
            alert("NFTs already entangled")
            return
        }

        setEntanglementState(prev => ({ ...prev, loading: true, error: null }))

        try {
            const signer = getSigner()
            const accountId = AccountId.fromString(connectedAccount)

            let tokenIdString = quantumTokenId
            if (!tokenIdString) {
                tokenIdString = await createQuantumToken()
            }

            let topicIdString = entanglementTopic
            if (!topicIdString) {
                topicIdString = await createEntanglementTopic()
            }

            const tokenIdObj = TokenId.fromString(tokenIdString)

            const transferTxn = new TransferTransaction()
                .addTokenTransfer(tokenIdObj, accountId, -ENTANGLEMENT_COST * 100000000)
                .addTokenTransfer(tokenIdObj, accountId, ENTANGLEMENT_COST * 100000000)
                .setTransactionMemo(`Entanglement: ${nftKey_A} <-> ${nftKey_B}`)

            const frozenTransfer = await transferTxn.freezeWithSigner(signer)
            await frozenTransfer.executeWithSigner(signer)

            const strength = calculateInitialStrength(
                selectedNFT_A.realityType,
                selectedNFT_B.realityType,
                selectedNFT_A.tokenId,
                selectedNFT_A.serial,
                selectedNFT_B.tokenId,
                selectedNFT_B.serial
            )

            const entanglementId = `ENT_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`

            const entanglementData = {
                id: entanglementId,
                userA: connectedAccount,
                userB: partnerAccount,
                nftA: {
                    tokenId: selectedNFT_A.tokenId,
                    serial: selectedNFT_A.serial,
                    name: selectedNFT_A.name,
                    realityType: selectedNFT_A.realityType
                },
                nftB: {
                    tokenId: selectedNFT_B.tokenId,
                    serial: selectedNFT_B.serial,
                    name: selectedNFT_B.name,
                    realityType: selectedNFT_B.realityType
                },
                entanglementStrength: strength,
                createdAt: Date.now(),
                lastSync: Date.now(),
                isActive: true,
                metadataHash: `ipfs://${entanglementId}`
            }

            const message = JSON.stringify({
                action: 'CREATE_ENTANGLEMENT',
                data: entanglementData,
                timestamp: Date.now()
            })

            const submitTxn = new TopicMessageSubmitTransaction()
                .setTopicId(topicIdString)
                .setMessage(message)

            const frozenSubmit = await submitTxn.freezeWithSigner(signer)
            await frozenSubmit.executeWithSigner(signer)

            setEntanglementPairs(prev => ({
                ...prev,
                [pairKey1]: true,
                [pairKey2]: true
            }))

            setEntanglementState(prev => ({
                ...prev,
                entanglements: [...prev.entanglements, entanglementData],
                loading: false
            }))

            const savedEntanglements = JSON.parse(localStorage.getItem('quantumEntanglements') || '[]')
            savedEntanglements.push(entanglementData)
            localStorage.setItem('quantumEntanglements', JSON.stringify(savedEntanglements))

            setSelectedNFT_A(null)
            setSelectedNFT_B(null)
            setPartnerAccount('')

            alert(`✅ Entanglement created successfully!\nID: ${entanglementId}\nStrength: ${strength}%`)
            console.log('Entanglement created:', entanglementId)

        } catch (error) {
            console.error('Error creating quantum entanglement:', error)
            setEntanglementState(prev => ({ 
                ...prev, 
                loading: false, 
                error: error.message 
            }))
            alert(`Error: ${error.message}`)
        }
    }

    const synchronizeAssetState = async (entanglementId, nftKey, newState) => {
        const entanglement = entanglementState.entanglements.find(e => e.id === entanglementId)
        
        if (!entanglement || !entanglement.isActive) {
            throw new Error("Invalid or inactive entanglement")
        }

        const nftKeyA = `${entanglement.nftA.tokenId}.${entanglement.nftA.serial}`
        const nftKeyB = `${entanglement.nftB.tokenId}.${entanglement.nftB.serial}`

        const isUserA = connectedAccount === entanglement.userA && nftKey === nftKeyA
        const isUserB = connectedAccount === entanglement.userB && nftKey === nftKeyB
        
        if (!isUserA && !isUserB) {
            throw new Error("Not authorized to update this NFT")
        }

        try {
            const signer = getSigner()

            const stateString = JSON.stringify([
                newState.health,
                newState.experience,
                newState.positionX,
                newState.positionY,
                newState.positionZ,
                Date.now()
            ])
            
            const stateHash = hashString(stateString)
            newState.stateHash = stateHash
            newState.timestamp = Date.now()

            setAssetStates(prev => ({
                ...prev,
                [nftKey]: newState
            }))

            const pairedNftKey = (nftKey === nftKeyA) ? nftKeyB : nftKeyA
            const entangledState = calculateEntangledState(newState, entanglement.entanglementStrength)

            setAssetStates(prev => ({
                ...prev,
                [pairedNftKey]: entangledState
            }))

            setEntanglementState(prev => ({
                ...prev,
                entanglements: prev.entanglements.map(e => 
                    e.id === entanglementId 
                        ? { ...e, lastSync: Date.now() }
                        : e
                )
            }))

            const syncMessage = JSON.stringify({
                action: 'QUANTUM_SYNC',
                entanglementId: entanglementId,
                nftKey: nftKey,
                stateHash: stateHash,
                timestamp: Date.now()
            })

            const submitTxn = new TopicMessageSubmitTransaction()
                .setTopicId(entanglementTopic)
                .setMessage(syncMessage)

            const frozenSubmit = await submitTxn.freezeWithSigner(signer)
            await frozenSubmit.executeWithSigner(signer)

            console.log('NFTs synchronized:', entanglementId)
            alert('✅ NFT states synchronized successfully!')

        } catch (error) {
            console.error('Error synchronizing NFTs:', error)
            throw error
        }
    }

    const strengthenEntanglement = async (entanglementId) => {
        const entanglement = entanglementState.entanglements.find(e => e.id === entanglementId)
        
        if (!entanglement || !entanglement.isActive) {
            throw new Error("Invalid entanglement")
        }

        const isAuthorized = connectedAccount === entanglement.userA || 
                            connectedAccount === entanglement.userB
        if (!isAuthorized) {
            throw new Error("Not authorized")
        }

        try {
            const signer = getSigner()
            const accountId = AccountId.fromString(connectedAccount)

            const strengtheningCost = ENTANGLEMENT_COST / 2

            const tokenIdObj = TokenId.fromString(quantumTokenId)

            const transferTxn = new TransferTransaction()
                .addTokenTransfer(tokenIdObj, accountId, -strengtheningCost * 100000000)
                .addTokenTransfer(tokenIdObj, accountId, strengtheningCost * 100000000)
                .setTransactionMemo(`Strengthen: ${entanglementId}`)

            const frozenTransfer = await transferTxn.freezeWithSigner(signer)
            await frozenTransfer.executeWithSigner(signer)

            const hash = `${Date.now()}${entanglementId}`
            const increase = 5 + (parseInt(hash.slice(-2), 16) % 11)
            const newStrength = Math.min(entanglement.entanglementStrength + increase, MAX_STRENGTH)

            setEntanglementState(prev => ({
                ...prev,
                entanglements: prev.entanglements.map(e => 
                    e.id === entanglementId 
                        ? { ...e, entanglementStrength: newStrength }
                        : e
                )
            }))

            const message = JSON.stringify({
                action: 'STRENGTH_CHANGED',
                entanglementId: entanglementId,
                newStrength: newStrength,
                timestamp: Date.now()
            })

            const submitTxn = new TopicMessageSubmitTransaction()
                .setTopicId(entanglementTopic)
                .setMessage(message)

            const frozenSubmit = await submitTxn.freezeWithSigner(signer)
            await frozenSubmit.executeWithSigner(signer)

            alert(`✅ Entanglement strengthened!\nNew strength: ${newStrength}% (+${increase}%)`)
            console.log('Entanglement strengthened:', entanglementId)

        } catch (error) {
            console.error('Error strengthening entanglement:', error)
            alert(`Error: ${error.message}`)
        }
    }

    const breakEntanglement = async (entanglementId) => {
        const entanglement = entanglementState.entanglements.find(e => e.id === entanglementId)
        
        if (!entanglement || !entanglement.isActive) {
            throw new Error("Invalid entanglement")
        }

        const isAuthorized = connectedAccount === entanglement.userA || 
                            connectedAccount === entanglement.userB
        if (!isAuthorized) {
            throw new Error("Not authorized")
        }

        if (!window.confirm('Are you sure you want to break this entanglement? This action cannot be undone.')) {
            return
        }

        try {
            const signer = getSigner()

            setEntanglementState(prev => ({
                ...prev,
                entanglements: prev.entanglements.map(e => 
                    e.id === entanglementId 
                        ? { ...e, isActive: false }
                        : e
                )
            }))

            const nftKeyA = `${entanglement.nftA.tokenId}.${entanglement.nftA.serial}`
            const nftKeyB = `${entanglement.nftB.tokenId}.${entanglement.nftB.serial}`
            const pairKey1 = `${nftKeyA}-${nftKeyB}`
            const pairKey2 = `${nftKeyB}-${nftKeyA}`
            
            setEntanglementPairs(prev => {
                const newPairs = { ...prev }
                delete newPairs[pairKey1]
                delete newPairs[pairKey2]
                return newPairs
            })

            const message = JSON.stringify({
                action: 'ENTANGLEMENT_BROKEN',
                entanglementId: entanglementId,
                breaker: connectedAccount,
                timestamp: Date.now()
            })

            const submitTxn = new TopicMessageSubmitTransaction()
                .setTopicId(entanglementTopic)
                .setMessage(message)

            const frozenSubmit = await submitTxn.freezeWithSigner(signer)
            await frozenSubmit.executeWithSigner(signer)

            alert('💔 Entanglement broken successfully')
            console.log('Entanglement broken:', entanglementId)

        } catch (error) {
            console.error('Error breaking entanglement:', error)
            alert(`Error: ${error.message}`)
        }
    }

    const hashString = (str) => {
        let hash = 0
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i)
            hash = ((hash << 5) - hash) + char
            hash = hash & hash
        }
        return hash.toString(16)
    }

    useEffect(() => {
        const savedEntanglements = localStorage.getItem('quantumEntanglements')
        const savedTokenId = localStorage.getItem('quantumTokenId')
        const savedTopicId = localStorage.getItem('entanglementTopic')
        
        if (savedEntanglements) {
            try {
                const entanglements = JSON.parse(savedEntanglements)
                setEntanglementState(prev => ({ ...prev, entanglements }))
            } catch (error) {
                console.error('Error loading saved entanglements:', error)
            }
        }
        
        if (savedTokenId) {
            setQuantumTokenId(savedTokenId)
        }
        
        if (savedTopicId) {
            setEntanglementTopic(savedTopicId)
        }
    }, [])

    useEffect(() => {
        if (isConnected) {
            fetchUserNFTs()
        }
    }, [isConnected])

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
                
                .fade-in {
                    animation: fadeIn 0.4s ease-out;
                }
                
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
            
            <div className="min-h-screen bg-gradient-to-br from-[var(--ink)] via-gray-900 to-[var(--ink)] text-white">
                <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-6">
                    
                    {/* Hero Banner */}
                    <section className="relative bg-gradient-to-br from-[var(--pane)] via-[var(--ink)] to-[var(--pane)] rounded-3xl p-8 md:p-10 shadow-2xl border border-gray-800 overflow-hidden fade-in">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--mustard)] opacity-5 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 opacity-5 rounded-full blur-3xl"></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-[var(--mustard)] to-yellow-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                                    🌌
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[var(--mustard)] to-yellow-600 bg-clip-text text-transparent">
                                        QuantumVerse Entanglement
                                    </h1>
                                    <p className="text-gray-400 text-sm mt-1">
                                        Powered by Hedera Blockchain & Quantum Correlation
                                    </p>
                                </div>
                            </div>
                            
                            <p className="text-gray-300 text-lg mb-6 max-w-3xl">
                                Entangle Hedera NFTs across realities using quantum correlation technology. Link your digital assets for synchronized state management.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {isConnected ? (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="text-green-400 text-sm font-medium">
                                                Connected: {formatAccountId(connectedAccount)}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full">
                                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                            <span className="text-red-400 text-sm font-medium">
                                                Wallet Disconnected
                                            </span>
                                        </div>
                                    )}
                                </div>
                                
                                <button 
                                    onClick={handleWalletAction}
                                    disabled={connectionState === 'Connecting'}
                                    className={getWalletButtonClass()}
                                >
                                    🔷 {getWalletButtonText()}
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Stats Cards */}
                    <section className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-800 fade-in">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Active Entanglements', value: activeEntanglements.length, icon: '🌌', color: 'from-purple-500 to-pink-600' },
                                { label: 'Your NFTs', value: userNFTs.length, icon: '🎨', color: 'from-blue-500 to-cyan-600' },
                                { label: 'Total Strength', value: totalStrength.toFixed(1), icon: '⚡', color: 'from-yellow-500 to-orange-600' },
                                { label: 'Avg Strength', value: `${Math.round(totalStrength / Math.max(activeEntanglements.length, 1))}%`, icon: '🎯', color: 'from-green-500 to-emerald-600' }
                            ].map((stat, index) => (
                                <div key={index} className="bg-gradient-to-br from-[var(--ink)] to-gray-900 p-5 rounded-2xl border border-gray-800 hover:border-[var(--mustard)]/50 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-400 text-sm font-medium">{stat.label}</span>
                                        <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                                            <span className="text-xl">{stat.icon}</span>
                                        </div>
                                    </div>
                                    <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Navigation Tabs */}
                    <nav className="bg-gradient-to-r from-[var(--pane)] to-[var(--ink)] rounded-2xl p-2 shadow-2xl border border-gray-800 fade-in">
                        <ul className="flex flex-wrap justify-center gap-2">
                            {tabs.map((tab) => (
                                <li key={tab.id}>
                                    <button 
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                                            activeTab === tab.id 
                                                ? 'bg-gradient-to-r from-[var(--mustard)] to-yellow-600 text-[var(--ink)] shadow-lg' 
                                                : 'text-gray-400 hover:text-[var(--mustard)] hover:bg-[var(--ink)]/50'
                                        }`}
                                    >
                                        <span className="mr-1">{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Tab Content */}
                    <div className="space-y-6">
                      {activeTab === 'lab' && (
                        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in">
                          {/* Select NFTs */}
                          <div className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] p-6 rounded-2xl shadow-xl border border-gray-800">
                            <h3 className="text-lg font-semibold text-[var(--mustard)] mb-4">Select Two NFTs</h3>
                            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                              {userNFTs.map((nft) => (
                                <div
                                  key={`${nft.tokenId}.${nft.serial}`}
                                  onClick={() => {
                                    const key = `${nft.tokenId}.${nft.serial}`;
                                    if (!selectedNFT_A) setSelectedNFT_A(nft)
                                    else if (!selectedNFT_B && key !== `${selectedNFT_A.tokenId}.${selectedNFT_A.serial}`) setSelectedNFT_B(nft)
                                  }}
                                  className={`
                                    flex items-center gap-4 p-3 rounded-xl border transition-colors cursor-pointer
                                    ${selectedNFT_A && `${nft.tokenId}.${nft.serial}` === `${selectedNFT_A.tokenId}.${selectedNFT_A.serial}` ? 'border-blue-400' : ''}
                                    ${selectedNFT_B && `${nft.tokenId}.${nft.serial}` === `${selectedNFT_B.tokenId}.${selectedNFT_B.serial}` ? 'border-purple-400' : ''}
                                    hover:border-[var(--mustard)]/50
                                  `}
                                >
                                  <img src={imageUrl()} alt={nft.name} className="w-12 h-12 rounded-lg object-cover" />
                                  <div>
                                    <p className="font-medium">{nft.name}</p>
                                    <p className="text-xs text-gray-400">{nft.realityType}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          {/* Partner & Actions */}
                          <div className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] p-6 rounded-2xl shadow-xl border border-gray-800 flex flex-col justify-between">
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm text-gray-400 mb-1">Partner Account</label>
                                <input
                                  value={partnerAccount}
                                  onChange={(e) => setPartnerAccount(e.target.value)}
                                  placeholder="0.0.xxxx"
                                  className="w-full bg-[var(--ink)] text-white border border-gray-700 rounded-xl p-3 focus:border-[var(--mustard)] transition-colors"
                                />
                              </div>
                              {entanglementState.error && (
                                <div className="bg-red-600/30 p-3 rounded-lg text-red-300">
                                  {entanglementState.error}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={createQuantumEntanglement}
                              disabled={
                                !selectedNFT_A || !selectedNFT_B ||
                                !partnerAccount || entanglementState.loading
                              }
                              className={`mt-4 w-full py-3 rounded-2xl font-bold text-lg transition-all duration-200
                                ${entanglementState.loading
                                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-[var(--mustard)] to-yellow-600 text-[var(--ink)] hover:opacity-90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                }
                              `}
                            >
                              {entanglementState.loading ? 'Creating...' : 'Entangle NFTs'}
                            </button>
                          </div>
                        </section>
                      )}

                      {activeTab === 'monitor' && (
                        <section className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] p-6 rounded-2xl shadow-xl border border-gray-800 custom-scrollbar max-h-[500px] overflow-y-auto fade-in">
                          <h3 className="text-lg font-semibold text-[var(--mustard)] mb-4">Active Entanglements</h3>
                          {entanglementState.entanglements.length === 0 ? (
                            <p className="text-gray-400">No entanglements yet.</p>
                          ) : (
                            entanglementState.entanglements.map((e) => (
                              <div key={e.id} className="bg-[var(--ink)] p-4 rounded-xl mb-3">
                                <div className="flex justify-between mb-2">
                                  <span className="font-medium">{e.id}</span>
                                  <span className="text-sm text-gray-400">{new Date(e.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span>Strength:</span>
                                  <span className="font-bold text-[var(--mustard)]">{e.entanglementStrength}%</span>
                                </div>
                              </div>
                            ))
                          )}
                        </section>
                      )}

                      {activeTab === 'mynfts' && (
                        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 fade-in">
                          {userNFTs.length === 0 ? (
                            <p className="text-gray-400">No NFTs found.</p>
                          ) : (
                            userNFTs.map((nft) => (
                              <div key={`${nft.tokenId}.${nft.serial}`} className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] p-4 rounded-2xl shadow-xl border border-gray-800 hover:border-[var(--mustard)]/50 transition-all">
                                <img src={imageUrl()} alt={nft.name} className="w-full h-40 object-cover rounded-lg mb-3" />
                                <h4 className="font-medium text-white">{nft.name}</h4>
                                <p className="text-xs text-gray-400">{nft.serial}</p>
                              </div>
                            ))
                          )}
                        </section>
                      )}

                      {activeTab === 'theory' && (
                        <section className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] p-6 rounded-2xl shadow-xl border border-gray-800 fade-in">
                          <h3 className="text-lg font-semibold text-[var(--mustard)] mb-4">Quantum Entanglement Theory</h3>
                          <p className="text-gray-300 leading-relaxed">
                            Quantum entanglement is a physical phenomenon where pairs or groups of particles interact 
                            such that the state of each particle cannot be described independently of the state of the others. 
                            In our platform, this concept is applied to Hedera NFTs to create synchronized asset states 
                            across different users and realities.
                          </p>
                          <ul className="list-disc list-inside text-gray-400 mt-4 space-y-2">
                            <li>Non-local correlations between entangled NFTs</li>
                            <li>Secure messaging via Hedera Topics</li>
                            <li>Asset state synchronization algorithms</li>
                            <li>Strength metrics based on metadata and reality types</li>
                          </ul>
                        </section>
                      )}
                    </div>

                    {/* Footer */}
                    <footer className="text-center py-6 fade-in">
                      <p className="text-gray-500 text-sm">
                        © 2025 QuantumVerse – Powered by Hedera Blockchain
                      </p>
                    </footer>
                </main>
            </div>
        </>
    )
}

export default Entanglement

