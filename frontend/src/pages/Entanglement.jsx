import React, { useState, useEffect } from 'react'
import { useWallet } from '../hooks/useWallet'
import { 
    TokenCreateTransaction,
    TokenType,
    TransferTransaction,
    AccountId,
    TokenId,
    TopicCreateTransaction,
    TopicMessageSubmitTransaction,
} from '@hashgraph/sdk'
import 'dotenv'

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
        const baseClass = "px-4 py-2 rounded-lg font-semibold transition-colors";
        if (connectionState === 'Connecting') {
            return `${baseClass} bg-yellow-500 text-white cursor-not-allowed`;
        }
        if (isConnected) {
            return `${baseClass} bg-green-500 text-white hover:bg-green-600`;
        }
        return `${baseClass} bg-[var(--mustard)] text-[var(--ink)] hover:opacity-80`;
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
        // Ensure connectedAccount is a valid string
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
            // Explicitly set the auto-renew account to prevent SDK issues
            .setAutoRenewAccountId(accountId)
            .setAutoRenewPeriod(7890000) // ~3 months in seconds

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


// Create Entanglement Topic using Hedera Consensus Service
// Create Entanglement Topic using Hedera Consensus Service
const createEntanglementTopic = async () => {
    if (!isConnected) {
        await connectWallet()
        return
    }

    try {
        const signer = getSigner()
        
        // Create the topic transaction WITHOUT admin/submit keys
        // HashConnect signers don't support getAccountKey()
        const topicCreateTxn = new TopicCreateTransaction()
            .setTopicMemo("QuantumVerse Entanglement Registry")
            .setAutoRenewAccountId(AccountId.fromString(connectedAccount))
            .setAutoRenewPeriod(7890000) // 3 months in seconds

        // Freeze and execute via signer
        const frozenTx = await topicCreateTxn.freezeWithSigner(signer)
        const txResponse = await frozenTx.executeWithSigner(signer)
        const receipt = await txResponse.getReceiptWithSigner(signer)
        
        // Convert to string to avoid undefined property errors
        const topicIdStr = receipt.topicId.toString()
        setEntanglementTopic(topicIdStr)
        
        // Persist to localStorage for reloads
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

            // FIXED: Ensure tokenId is always a string
            let tokenIdString = quantumTokenId
            if (!tokenIdString) {
                tokenIdString = await createQuantumToken()
            }

            let topicIdString = entanglementTopic
            if (!topicIdString) {
                topicIdString = await createEntanglementTopic()
            }

            // FIXED: Convert string to TokenId object for transaction
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

            // FIXED: Convert tokenId string to TokenId object
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
        
        // FIXED: Store as string, not TokenId object
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
            
            <div className="min-h-screen bg-[var(--ink)] text-white">
                <main className="w-90vw mx-auto px-4 py-10 space-y-8">
                    
                    <section className="bg-[var(--mustard)] text-[var(--ink)] rounded-2xl p-6 shadow-lg fade-in">
                        <h1 className="text-xl font-bold mb-2">QuantumVerse - Quantum Entanglement via NFTs</h1>
                        <p className="text-sm">
                            Entangle Hedera NFTs across realities using quantum correlation and blockchain technology
                        </p>
                        
                        <div className="mt-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                            <div className="flex items-center gap-2">
                                {isConnected ? (
                                    <div className="flex items-center gap-2 text-green-700">
                                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                        <span className="text-xs font-medium">Connected: {formatAccountId(connectedAccount)}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-red-700">
                                        <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                                        <span className="text-xs font-medium">Wallet Disconnected</span>
                                    </div>
                                )}
                            </div>
                            
                            <button 
                                onClick={handleWalletAction}
                                disabled={connectionState === 'Connecting'}
                                className={`text-sm ${getWalletButtonClass()}`}
                            >
                                🔷 {getWalletButtonText()}
                            </button>
                        </div>
                    </section>

                    <section className="bg-[var(--pane)] text-[var(--mustard)] rounded-2xl p-6 shadow-xl fade-in">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="bg-[var(--ink)] rounded-xl p-4 border border-[color:rgba(244,211,94,0.2)] text-center">
                                <div className="text-3xl mb-2">🌌</div>
                                <div className="text-2xl font-bold text-[var(--mustard)]">
                                    {activeEntanglements.length}
                                </div>
                                <div className="text-sm text-white/70">Active Entanglements</div>
                            </div>

                            <div className="bg-[var(--ink)] rounded-xl p-4 border border-[color:rgba(244,211,94,0.2)] text-center">
                                <div className="text-3xl mb-2">🎨</div>
                                <div className="text-2xl font-bold text-[var(--mustard)]">
                                    {userNFTs.length}
                                </div>
                                <div className="text-sm text-white/70">Your NFTs</div>
                            </div>

                            <div className="bg-[var(--ink)] rounded-xl p-4 border border-[color:rgba(244,211,94,0.2)] text-center">
                                <div className="text-3xl mb-2">⚡</div>
                                <div className="text-2xl font-bold text-[var(--mustard)]">
                                    {totalStrength.toFixed(1)}
                                </div>
                                <div className="text-sm text-white/70">Total Strength</div>
                            </div>

                            <div className="bg-[var(--ink)] rounded-xl p-4 border border-[color:rgba(244,211,94,0.2)] text-center">
                                <div className="text-3xl mb-2">🎯</div>
                                <div className="text-2xl font-bold text-[var(--mustard)]">
                                    {Math.round(totalStrength / Math.max(activeEntanglements.length, 1))}%
                                </div>
                                <div className="text-sm text-white/70">Avg Strength</div>
                            </div>
                        </div>
                    </section>

                    <nav className="bg-[var(--pane)] text-[var(--mustard)] rounded-2xl p-4 shadow-xl fade-in">
                        <ul className="flex flex-wrap justify-center gap-[3vw] text-sm font-medium">
                            {tabs.map((tab) => (
                                <li key={tab.id}>
                                    <button
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-3 py-2 hover:underline ${
                                            activeTab === tab.id ? 'underline font-bold' : ''
                                        }`}
                                    >
                                        {tab.icon} {tab.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="min-h-[400px]">
                        {activeTab === 'lab' && (
                            <section className="bg-[var(--pane)] text-[var(--mustard)] rounded-2xl p-6 shadow-xl space-y-6 fade-in">
                                <h2 className="text-xl font-semibold">Entanglement Laboratory</h2>
                                
                                {!isConnected ? (
                                    <div className="text-center py-8">
                                        <div className="text-6xl mb-4">🔷</div>
                                        <h4 className="text-xl font-semibold mb-2">Connect Your Hedera Wallet</h4>
                                        <p className="text-white/70 mb-6">
                                            Connect your wallet to entangle your NFTs with quantum correlation
                                        </p>
                                        <button 
                                            onClick={handleWalletAction}
                                            disabled={connectionState === 'Connecting'}
                                            className={getWalletButtonClass()}
                                        >
                                            🔷 {getWalletButtonText()}
                                        </button>
                                    </div>
                                ) : userNFTs.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="text-6xl mb-4">🎨</div>
                                        <h4 className="text-xl font-semibold mb-2">No NFTs Found</h4>
                                        <p className="text-white/70 mb-6">
                                            You don't have any NFTs yet. Mint some NFTs first to create entanglements.
                                        </p>
                                        <button 
                                            onClick={fetchUserNFTs}
                                            className="bg-[var(--mustard)] text-[var(--ink)] hover:opacity-80 px-4 py-2 rounded-lg font-semibold"
                                        >
                                            🔄 Refresh NFTs
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="font-semibold mb-3 text-white/80">Select NFT A</h4>
                                                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                                                    {userNFTs.map((nft, idx) => (
                                                        <div 
                                                            key={idx}
                                                            onClick={() => setSelectedNFT_A(nft)}
                                                            className={`cursor-pointer p-3 rounded-xl border-2 transition-all ${
                                                                selectedNFT_A?.tokenId === nft.tokenId && selectedNFT_A?.serial === nft.serial
                                                                    ? 'border-purple-500 bg-purple-900/30'
                                                                    : 'border-[var(--mustard)]/20 bg-[var(--ink)] hover:border-purple-400'
                                                            }`}
                                                        >
                                                            <img src={nft.image} alt={nft.name} className="w-full h-20 object-cover rounded-lg mb-2" />
                                                            <h5 className="text-xs font-semibold text-white truncate">{nft.name}</h5>
                                                            <p className="text-xs text-white/60">#{nft.serial}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="font-semibold mb-3 text-white/80">Select NFT B</h4>
                                                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                                                    {userNFTs.map((nft, idx) => (
                                                        <div 
                                                            key={idx}
                                                            onClick={() => setSelectedNFT_B(nft)}
                                                            className={`cursor-pointer p-3 rounded-xl border-2 transition-all ${
                                                                selectedNFT_B?.tokenId === nft.tokenId && selectedNFT_B?.serial === nft.serial
                                                                    ? 'border-blue-500 bg-blue-900/30'
                                                                    : 'border-[var(--mustard)]/20 bg-[var(--ink)] hover:border-blue-400'
                                                            }`}
                                                        >
                                                            <img src={nft.image} alt={nft.name} className="w-full h-20 object-cover rounded-lg mb-2" />
                                                            <h5 className="text-xs font-semibold text-white truncate">{nft.name}</h5>
                                                            <p className="text-xs text-white/60">#{nft.serial}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {(selectedNFT_A || selectedNFT_B) && (
                                            <div className="bg-[var(--ink)] rounded-xl p-4 border border-[color:rgba(244,211,94,0.2)]">
                                                <h4 className="font-semibold mb-3">Selected NFTs</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="text-center">
                                                        {selectedNFT_A ? (
                                                            <>
                                                                <div className="text-2xl mb-2">🟣</div>
                                                                <p className="text-sm font-semibold">{selectedNFT_A.name}</p>
                                                                <p className="text-xs text-white/60">{selectedNFT_A.tokenId} #{selectedNFT_A.serial}</p>
                                                            </>
                                                        ) : (
                                                            <p className="text-white/40">No NFT selected</p>
                                                        )}
                                                    </div>
                                                    <div className="text-center">
                                                        {selectedNFT_B ? (
                                                            <>
                                                                <div className="text-2xl mb-2">🔵</div>
                                                                <p className="text-sm font-semibold">{selectedNFT_B.name}</p>
                                                                <p className="text-xs text-white/60">{selectedNFT_B.tokenId} #{selectedNFT_B.serial}</p>
                                                            </>
                                                        ) : (
                                                            <p className="text-white/40">No NFT selected</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-semibold mb-2 text-white/80">
                                                Partner Account ID
                                            </label>
                                            <input 
                                                type="text"
                                                value={partnerAccount}
                                                onChange={(e) => setPartnerAccount(e.target.value)}
                                                placeholder="0.0.123456"
                                                className="w-full bg-[var(--ink)] text-white border border-[var(--mustard)]/30 rounded-lg p-3"
                                            />
                                            <p className="text-xs text-white/50 mt-1">Enter the Hedera account ID to entangle with</p>
                                        </div>

                                        <button 
                                            onClick={createQuantumEntanglement}
                                            disabled={!selectedNFT_A || !selectedNFT_B || !partnerAccount || entanglementState.loading}
                                            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                                                (!selectedNFT_A || !selectedNFT_B || !partnerAccount || entanglementState.loading)
                                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                                    : 'bg-[var(--mustard)] text-[var(--ink)] hover:opacity-80'
                                            }`}
                                        >
                                            {entanglementState.loading ? '🌀 Creating Entanglement...' : `🌌 Create Entanglement (${ENTANGLEMENT_COST} QUANTUM)`}
                                        </button>

                                        {entanglementState.error && (
                                            <div className="bg-red-900/50 border border-red-500 p-3 rounded-lg text-sm">
                                                <p className="text-red-300">❌ {entanglementState.error}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </section>
                        )}

                        {activeTab === 'monitor' && (
                            <section className="bg-[var(--pane)] text-[var(--mustard)] rounded-2xl p-6 shadow-xl space-y-6 fade-in">
                                <h2 className="text-xl font-semibold">Entanglement Monitor</h2>
                                
                                {activeEntanglements.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">🌌</div>
                                        <h4 className="text-lg font-semibold mb-2 text-white">No Active Entanglements</h4>
                                        <p className="text-white/60">
                                            Create your first NFT entanglement in the lab
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {activeEntanglements.map((entanglement) => (
                                            <div 
                                                key={entanglement.id}
                                                className="p-4 bg-[var(--ink)] rounded-xl border border-[color:rgba(244,211,94,0.2)]"
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="font-semibold text-white">
                                                        {entanglement.id}
                                                    </h4>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                                        <span className="text-green-400 text-sm">Active</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div className="bg-[var(--pane)] rounded-lg p-3">
                                                        <p className="text-xs text-white/60 mb-1">NFT A</p>
                                                        <p className="text-sm font-semibold text-purple-400">{entanglement.nftA.name}</p>
                                                        <p className="text-xs text-white/60">{entanglement.nftA.tokenId} #{entanglement.nftA.serial}</p>
                                                        <p className="text-xs text-white/60">{entanglement.nftA.realityType}</p>
                                                    </div>

                                                    <div className="bg-[var(--pane)] rounded-lg p-3">
                                                        <p className="text-xs text-white/60 mb-1">NFT B</p>
                                                        <p className="text-sm font-semibold text-blue-400">{entanglement.nftB.name}</p>
                                                        <p className="text-xs text-white/60">{entanglement.nftB.tokenId} #{entanglement.nftB.serial}</p>
                                                        <p className="text-xs text-white/60">{entanglement.nftB.realityType}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-4 mb-4">
                                                    <div>
                                                        <p className="text-sm text-white/60">Strength</p>
                                                        <div className="text-lg font-bold text-[var(--mustard)]">
                                                            {entanglement.entanglementStrength}%
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <p className="text-sm text-white/60">Last Sync</p>
                                                        <div className="text-lg font-bold text-blue-400">
                                                            {Math.floor((Date.now() - entanglement.lastSync) / 1000)}s ago
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <p className="text-sm text-white/60">Age</p>
                                                        <div className="text-lg font-bold text-green-400">
                                                            {Math.floor((Date.now() - entanglement.createdAt) / (1000 * 60))}m
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => strengthenEntanglement(entanglement.id)}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                                                    >
                                                        ⚡ Strengthen (25 QUANTUM)
                                                    </button>
                                                    <button 
                                                        onClick={() => breakEntanglement(entanglement.id)}
                                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                                                    >
                                                        💔 Break
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {activeTab === 'mynfts' && (
                            <section className="bg-[var(--pane)] text-[var(--mustard)] rounded-2xl p-6 shadow-xl space-y-6 fade-in">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-semibold">My NFTs</h2>
                                    <button 
                                        onClick={fetchUserNFTs}
                                        className="bg-[var(--mustard)] text-[var(--ink)] hover:opacity-80 px-4 py-2 rounded-lg font-semibold text-sm"
                                    >
                                        🔄 Refresh
                                    </button>
                                </div>
                                
                                {!isConnected ? (
                                    <div className="text-center py-8">
                                        <p className="text-white/60">Connect wallet to view your NFTs</p>
                                    </div>
                                ) : userNFTs.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="text-6xl mb-4">🎨</div>
                                        <h4 className="text-lg font-semibold mb-2 text-white">No NFTs Found</h4>
                                        <p className="text-white/60">
                                            You don't have any NFTs in your wallet yet
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {userNFTs.map((nft, idx) => (
                                            <div 
                                                key={idx}
                                                className="bg-[var(--ink)] rounded-xl p-4 border border-[color:rgba(244,211,94,0.2)]"
                                            >
                                                <img src={nft.image} alt={nft.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                                                <h5 className="font-semibold text-white truncate">{nft.name}</h5>
                                                <p className="text-xs text-white/60 mb-1">Token: {nft.tokenId}</p>
                                                <p className="text-xs text-white/60 mb-1">Serial: #{nft.serial}</p>
                                                <p className="text-xs text-[var(--mustard)]">{nft.realityType}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {activeTab === 'theory' && (
                            <section className="bg-[var(--pane)] text-[var(--mustard)] rounded-2xl p-6 shadow-xl space-y-8 fade-in">
                                <h2 className="text-xl font-semibold">Quantum Entanglement Theory</h2>

                                <div className="space-y-6">
                                    <div className="p-6 bg-[var(--ink)] rounded-xl border border-[color:rgba(244,211,94,0.2)]">
                                        <h4 className="font-semibold text-[var(--mustard)] mb-4">🌌 NFT-Based Quantum Entanglement</h4>
                                        <p className="text-white/80 mb-4">
                                            In QuantumVerse, quantum entanglement is applied directly to Hedera NFTs. 
                                            When two NFTs are entangled, their quantum states become correlated - 
                                            changes to one NFT's properties instantly affect its entangled partner.
                                        </p>
                                        <p className="text-white/80">
                                            This creates truly connected digital assets that can exist across different 
                                            games, metaverses, and reality types while maintaining synchronized states.
                                        </p>
                                    </div>

                                    <div className="p-6 bg-[var(--ink)] rounded-xl border border-[color:rgba(244,211,94,0.2)]">
                                        <h4 className="font-semibold text-[var(--mustard)] mb-4">⚡ How It Works on Hedera</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 bg-[var(--mustard)] text-[var(--ink)] rounded-full flex items-center justify-center font-bold text-sm">1</div>
                                                <div>
                                                    <h5 className="font-semibold text-white">NFT Selection</h5>
                                                    <p className="text-white/70">Choose two Hedera NFTs from your wallet to entangle</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 bg-[var(--mustard)] text-[var(--ink)] rounded-full flex items-center justify-center font-bold text-sm">2</div>
                                                <div>
                                                    <h5 className="font-semibold text-white">Quantum Correlation</h5>
                                                    <p className="text-white/70">QUANTUM tokens are used to establish the entanglement link</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 bg-[var(--mustard)] text-[var(--ink)] rounded-full flex items-center justify-center font-bold text-sm">3</div>
                                                <div>
                                                    <h5 className="font-semibold text-white">HCS Registry</h5>
                                                    <p className="text-white/70">All entanglement operations are recorded on Hedera Consensus Service</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 bg-[var(--mustard)] text-[var(--ink)] rounded-full flex items-center justify-center font-bold text-sm">4</div>
                                                <div>
                                                    <h5 className="font-semibold text-white">State Synchronization</h5>
                                                    <p className="text-white/70">NFT properties synchronize automatically based on entanglement strength</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-[var(--ink)] rounded-xl border border-[color:rgba(244,211,94,0.2)]">
                                        <h4 className="font-semibold text-[var(--mustard)] mb-4">🎮 Use Cases</h4>
                                        <ul className="text-white/80 space-y-2">
                                            <li>• <strong>Cross-Game Items:</strong> Use the same weapon in multiple games simultaneously</li>
                                            <li>• <strong>Shared Progression:</strong> Character XP gained in one metaverse updates in all others</li>
                                            <li>• <strong>Split Ownership:</strong> Two players can co-own and co-control a single asset</li>
                                            <li>• <strong>Reality Bridging:</strong> Connect VR, AR, and physical NFTs together</li>
                                            <li>• <strong>Derivative Assets:</strong> Create derivative NFTs that inherit parent properties</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>

                    <footer className="text-center text-sm text-white/60 pt-8 fade-in">
                        © 2025 QuantumVerse - NFT Quantum Entanglement powered by Hedera
                    </footer>
                </main>
            </div>
        </>
    )
}

export default Entanglement
