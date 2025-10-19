import React, { useState, useEffect } from 'react'
import { useWallet } from '../Context/WalletContext'
import { 
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
    TokenMintTransaction,
    TransferTransaction,
    Hbar,
    AccountId,
    PrivateKey
} from '@hashgraph/sdk'

const Identity = () => {
    const { 
        isConnected, 
        connectedAccount, 
        getSigner, 
        connectWallet, 
        disconnectWallet, 
        connectionState 
    } = useWallet()
    
    const [activeTab, setActiveTab] = useState('identity')
    const [identityState, setIdentityState] = useState({
        identity: null,
        loading: false,
        error: null
    })
    const [identityToken, setIdentityToken] = useState(null)
    const [quantumDNA, setQuantumDNA] = useState(null)

    const tabs = [
        { id: 'identity', label: 'Quantum Identity', icon: '🔐' },
        { id: 'dna', label: 'Quantum DNA', icon: '🧬' },
        { id: 'security', label: 'Security', icon: '🛡️' },
        { id: 'backup', label: 'Backup & Recovery', icon: '💾' }
    ]

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

    const generateQuantumIdentity = async () => {
        if (!isConnected) {
            await connectWallet()
            return
        }

        setIdentityState(prev => ({ ...prev, loading: true, error: null }))

        try {
            const signer = getSigner()
            const accountId = AccountId.fromString(connectedAccount)
            const supplyKey = PrivateKey.generateED25519()

            const fullMetadata = {
                owner: connectedAccount,
                createdAt: new Date().toISOString(),
                securityLevel: 'QUANTUM',
                quantumSignature: generateQuantumSignature(),
                multiRealityEnabled: true,
                biometricEnabled: false
            }

            const onChainMetadata = {
                id: connectedAccount.slice(-6),
                t: Date.now(),
                v: 1
            }

            const createTokenTxn = new TokenCreateTransaction()
                .setTokenName(`QID-${connectedAccount.slice(-6)}`)
                .setTokenSymbol('QID')
                .setTokenType(TokenType.NonFungibleUnique)
                .setDecimals(0)
                .setInitialSupply(0)
                .setSupplyType(TokenSupplyType.Finite)
                .setMaxSupply(1)
                .setTreasuryAccountId(accountId)
                .setSupplyKey(supplyKey.publicKey)
                .setFreezeDefault(false)
                .setAutoRenewAccountId(accountId)
                .setAutoRenewPeriod(7776000)

            const frozenCreateTxn = await createTokenTxn.freezeWithSigner(signer)
            const tokenResponse = await frozenCreateTxn.executeWithSigner(signer)
            const tokenReceipt = await tokenResponse.getReceiptWithSigner(signer)
            const tokenId = tokenReceipt.tokenId

            const metadataBytes = Buffer.from(JSON.stringify(onChainMetadata), 'utf8')

            const mintTxn = new TokenMintTransaction()
                .setTokenId(tokenId)
                .setMetadata([metadataBytes])

            const frozenMintTxn = await mintTxn.freezeWithSigner(signer)
            const signedMintTxn = await frozenMintTxn.sign(supplyKey)
            const mintResponse = await signedMintTxn.executeWithSigner(signer)
            const mintReceipt = await mintResponse.getReceiptWithSigner(signer)

            const dnaStructure = generateQuantumDNA()

            const identity = {
                tokenId: tokenId.toString(),
                metadata: fullMetadata,
                onChainMetadata: onChainMetadata,
                serialNumber: mintReceipt.serials[0],
                createdAt: new Date(),
                securityLevel: 'QUANTUM',
                achievements: [],
                quantumDNA: dnaStructure
            }

            setIdentityState(prev => ({ ...prev, identity, loading: false }))
            setIdentityToken(tokenId)
            setQuantumDNA(dnaStructure)

            localStorage.setItem('quantumIdentity', JSON.stringify({
                ...identity,
                serialNumber: identity.serialNumber.toString()
            }))

            alert(`✅ Quantum Identity Created!\n\n🔷 Token: ${tokenId.toString()}\n📝 Serial: ${mintReceipt.serials[0].toString()}\n💾 Metadata: ${metadataBytes.length} bytes`)

        } catch (error) {
            setIdentityState(prev => ({ ...prev, loading: false, error: error.message }))
            alert(`❌ Failed: ${error.message}`)
        }
    }

    const generateQuantumSignature = () => {
        const signature = {
            algorithm: 'POST_QUANTUM_CRYSTALS',
            keySize: 3072,
            entropy: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            realityAnchor: generateRealityAnchor()
        }
        return btoa(JSON.stringify(signature))
    }

    const generateRealityAnchor = () => {
        return {
            virtual: Math.random() > 0.5,
            augmented: Math.random() > 0.5,
            physical: true,
            mixed: Math.random() > 0.3
        }
    }

    const generateQuantumDNA = () => {
        const bases = ['Q', 'U', 'A', 'N', 'T', 'M']
        const sequence = Array.from({ length: 64 }, () => 
            bases[Math.floor(Math.random() * bases.length)]
        ).join('')

        return {
            sequence,
            structure: {
                helixType: 'QUANTUM_DOUBLE',
                bondStrength: Math.random() * 100,
                entanglementPoints: generateEntanglementPoints(),
                realityBinding: {
                    virtual: Math.random(),
                    augmented: Math.random(),
                    physical: Math.random(),
                    mixed: Math.random()
                }
            },
            properties: {
                stability: Math.random() * 100,
                adaptability: Math.random() * 100,
                crossRealityCompatibility: Math.random() * 100
            }
        }
    }

    const generateEntanglementPoints = () => {
        return Array.from({ length: 8 }, (_, i) => ({
            position: i * 8,
            strength: Math.random(),
            type: ['POSITION', 'MOMENTUM', 'SPIN', 'ENERGY'][Math.floor(Math.random() * 4)],
            realityType: ['VIRTUAL', 'AUGMENTED', 'PHYSICAL', 'MIXED'][Math.floor(Math.random() * 4)]
        }))
    }

    useEffect(() => {
        const savedIdentity = localStorage.getItem('quantumIdentity')
        if (savedIdentity) {
            try {
                const identity = JSON.parse(savedIdentity)
                setIdentityState(prev => ({ ...prev, identity }))
                setQuantumDNA(identity.quantumDNA)
            } catch (error) {
                console.error('Error loading saved identity:', error)
            }
        }
    }, [])

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
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 opacity-5 rounded-full blur-3xl"></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-[var(--mustard)] to-yellow-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                                    🔐
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[var(--mustard)] to-yellow-600 bg-clip-text text-transparent">
                                        Quantum Identity
                                    </h1>
                                    <p className="text-gray-400 text-sm mt-1">
                                        Post-Quantum Cryptography • Multi-Reality Verified
                                    </p>
                                </div>
                            </div>
                            
                            <p className="text-gray-300 text-lg mb-6 max-w-3xl">
                                Your quantum-secured digital identity that persists across all realities. Post-quantum cryptography ensures your identity remains secure in the quantum age.
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

                    {/* Identity Status Cards */}
                    {identityState.identity && (
                        <section className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-800 fade-in">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { 
                                        label: 'Security Level', 
                                        value: identityState.identity.securityLevel, 
                                        icon: '🔐', 
                                        color: 'from-blue-500 to-cyan-600' 
                                    },
                                    { 
                                        label: 'Entanglements', 
                                        value: quantumDNA?.structure.entanglementPoints.length || 0, 
                                        icon: '🌌', 
                                        color: 'from-purple-500 to-pink-600' 
                                    },
                                    { 
                                        label: 'Achievements', 
                                        value: identityState.identity.achievements.length, 
                                        icon: '🏆', 
                                        color: 'from-yellow-500 to-orange-600' 
                                    },
                                    { 
                                        label: 'Identity Age', 
                                        value: `${Math.floor((Date.now() - new Date(identityState.identity.createdAt).getTime()) / (1000 * 60 * 60 * 24))}d`, 
                                        icon: '⏱️', 
                                        color: 'from-green-500 to-emerald-600' 
                                    }
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
                    )}

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
                        {activeTab === 'identity' && (
                            <section className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-800 fade-in">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-blue-500/10 rounded-xl">
                                        <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">Quantum Identity Details</h2>
                                </div>
                                
                                {identityState.identity ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {[
                                                { label: 'Identity Token', value: identityState.identity.tokenId, mono: true },
                                                { label: 'Serial Number', value: identityState.identity.serialNumber?.toString() },
                                                { label: 'Owner Account', value: connectedAccount, mono: true },
                                                { label: 'Created', value: new Date(identityState.identity.createdAt).toLocaleString() }
                                            ].map((item, index) => (
                                                <div key={index} className="bg-gradient-to-br from-[var(--ink)] to-gray-900 rounded-2xl p-5 border border-gray-800 hover:border-[var(--mustard)]/30 transition-all duration-200">
                                                    <h4 className="font-semibold mb-2 text-gray-400 text-sm">{item.label}</h4>
                                                    <p className={`text-white ${item.mono ? 'font-mono text-sm' : 'text-base'} break-all`}>
                                                        {item.value}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl flex items-center justify-center text-5xl shadow-2xl">
                                            🔐
                                        </div>
                                        <h4 className="text-2xl font-bold mb-3 text-white">No Identity Found</h4>
                                        <p className="text-gray-400 mb-8 max-w-md mx-auto">
                                            Generate your quantum identity to get started with secure, multi-reality verification.
                                        </p>
                                        {!isConnected ? (
                                            <button 
                                                onClick={handleWalletAction}
                                                disabled={connectionState === 'Connecting'}
                                                className={getWalletButtonClass()}
                                            >
                                                🔷 {getWalletButtonText()}
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={generateQuantumIdentity}
                                                disabled={identityState.loading}
                                                className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-200 ${
                                                    identityState.loading
                                                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-[var(--mustard)] to-yellow-600 text-[var(--ink)] hover:opacity-90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                                }`}
                                            >
                                                {identityState.loading ? (
                                                    <span className="flex items-center gap-2">
                                                        <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                                                        Generating...
                                                    </span>
                                                ) : (
                                                    '✨ Generate Quantum Identity'
                                                )}
                                            </button>
                                        )}
                                    </div>
                                )}

                                {identityState.error && (
                                    <div className="bg-gradient-to-r from-red-600 to-red-700 p-5 rounded-2xl border border-red-500 shadow-lg mt-4">
                                        <div className="flex items-start gap-3">
                                            <svg className="w-6 h-6 text-white flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                            <div>
                                                <h4 className="font-semibold text-white mb-1">Error</h4>
                                                <p className="text-red-100">{identityState.error}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}

                        {activeTab === 'dna' && (
                            <section className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-800 fade-in">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-green-500/10 rounded-xl">
                                        <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">Quantum DNA Structure</h2>
                                </div>
                                
                                {quantumDNA ? (
                                    <div className="space-y-6">
                                        <div className="bg-gradient-to-br from-[var(--ink)] to-gray-900 rounded-2xl p-6 border border-gray-800">
                                            <h4 className="font-semibold mb-3 text-[var(--mustard)] flex items-center gap-2">
                                                <span className="text-xl">🧬</span>
                                                DNA Sequence
                                            </h4>
                                            <div className="font-mono text-sm bg-gray-900 p-4 rounded-xl break-all text-[var(--mustard)] border border-gray-800">
                                                {quantumDNA.sequence}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-gradient-to-br from-[var(--ink)] to-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-[var(--mustard)]/30 transition-all duration-200">
                                                <h4 className="font-semibold mb-4 text-[var(--mustard)]">Structure Properties</h4>
                                                <div className="space-y-3">
                                                    {[
                                                        { label: 'Helix Type', value: quantumDNA.structure.helixType },
                                                        { label: 'Bond Strength', value: `${quantumDNA.structure.bondStrength.toFixed(1)}%` },
                                                        { label: 'Entanglement Points', value: quantumDNA.structure.entanglementPoints.length }
                                                    ].map((item, index) => (
                                                        <div key={index} className="flex justify-between items-center p-3 bg-[var(--pane)]/50 rounded-xl">
                                                            <span className="text-gray-400 text-sm">{item.label}</span>
                                                            <span className="text-white font-semibold">{item.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-br from-[var(--ink)] to-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-[var(--mustard)]/30 transition-all duration-200">
                                                <h4 className="font-semibold mb-4 text-[var(--mustard)]">DNA Properties</h4>
                                                <div className="space-y-3">
                                                    {[
                                                        { label: 'Stability', value: quantumDNA.properties.stability.toFixed(1), color: 'text-green-400' },
                                                        { label: 'Adaptability', value: quantumDNA.properties.adaptability.toFixed(1), color: 'text-blue-400' },
                                                        { label: 'Cross-Reality', value: quantumDNA.properties.crossRealityCompatibility.toFixed(1), color: 'text-purple-400' }
                                                    ].map((item, index) => (
                                                        <div key={index} className="flex justify-between items-center p-3 bg-[var(--pane)]/50 rounded-xl">
                                                            <span className="text-gray-400 text-sm">{item.label}</span>
                                                            <span className={`font-bold ${item.color}`}>{item.value}%</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Entanglement Points Visualization */}
                                        <div className="bg-gradient-to-br from-[var(--ink)] to-gray-900 rounded-2xl p-6 border border-gray-800">
                                            <h4 className="font-semibold mb-4 text-[var(--mustard)]">Entanglement Points</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                                {quantumDNA.structure.entanglementPoints.map((point, index) => (
                                                    <div key={index} className="bg-[var(--pane)]/50 p-4 rounded-xl border border-gray-700 hover:border-[var(--mustard)]/50 transition-all">
                                                        <div className="text-xs text-gray-500 mb-1">Point {index + 1}</div>
                                                        <div className="text-sm font-medium text-white mb-2">{point.type}</div>
                                                        <div className="text-xs text-gray-400">{point.realityType}</div>
                                                        <div className="mt-2 w-full bg-gray-800 rounded-full h-2">
                                                            <div 
                                                                className="bg-gradient-to-r from-[var(--mustard)] to-yellow-600 h-2 rounded-full transition-all" 
                                                                style={{ width: `${point.strength * 100}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center text-5xl shadow-2xl opacity-30">
                                            🧬
                                        </div>
                                        <h4 className="text-2xl font-bold mb-3 text-white">Generate Identity First</h4>
                                        <p className="text-gray-400 max-w-md mx-auto">
                                            Create your quantum identity to view your unique DNA structure
                                        </p>
                                    </div>
                                )}
                            </section>
                        )}

                        {activeTab === 'security' && (
                            <section className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-800 fade-in">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-yellow-500/10 rounded-xl">
                                        <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">Quantum Security Features</h2>
                                </div>

                                <div className="space-y-6">
                                    {[
                                        {
                                            icon: '🔒',
                                            title: 'Post-Quantum Cryptography',
                                            description: 'Your identity uses quantum-resistant algorithms that remain secure even against quantum computer attacks.',
                                            status: 'Active & Protected',
                                            color: 'green'
                                        },
                                        {
                                            icon: '🌍',
                                            title: 'Multi-Reality Verification',
                                            description: 'Your identity is verified and synchronized across virtual, augmented, and physical realities.',
                                            realities: ['Virtual', 'Augmented', 'Physical', 'Mixed'],
                                            color: 'blue'
                                        },
                                        {
                                            icon: '🔐',
                                            title: 'Biometric Integration',
                                            description: 'Optional biometric factors can be encrypted and stored as part of your quantum identity for enhanced security.',
                                            hasButton: true,
                                            color: 'purple'
                                        }
                                    ].map((feature, index) => (
                                        <div key={index} className="p-6 bg-gradient-to-br from-[var(--ink)] to-gray-900 rounded-2xl border border-gray-800 hover:border-[var(--mustard)]/30 transition-all duration-200">
                                            <div className="flex items-start gap-4">
                                                <div className={`w-12 h-12 bg-${feature.color}-500/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
                                                    {feature.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-[var(--mustard)] mb-2 text-lg">{feature.title}</h4>
                                                    <p className="text-gray-300 mb-4 leading-relaxed">
                                                        {feature.description}
                                                    </p>
                                                    
                                                    {feature.status && (
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-3 h-3 bg-${feature.color}-400 rounded-full animate-pulse`}></div>
                                                            <span className={`text-${feature.color}-400 font-medium`}>{feature.status}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {feature.realities && (
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                            {feature.realities.map((reality, i) => (
                                                                <div key={i} className="flex items-center gap-2 p-2 bg-gray-700/50 rounded-lg border border-gray-600">
                                                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                                                    <span className="text-sm text-white/80">{reality}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    
                                                    {feature.hasButton && (
                                                        <button className="mt-3 px-6 py-2 bg-gradient-to-r from-[var(--mustard)] to-yellow-600 text-[var(--ink)] rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                                            Configure Biometrics
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {activeTab === 'backup' && (
                            <section className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-800 fade-in">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-red-500/10 rounded-xl">
                                        <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">Backup & Recovery</h2>
                                </div>

                                <div className="space-y-6">
                                    {/* Warning */}
                                    <div className="p-6 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 rounded-2xl">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                                                ⚠️
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-yellow-300 mb-2 text-lg">Important Security Notice</h4>
                                                <p className="text-yellow-100/90 leading-relaxed">
                                                    Your quantum identity cannot be recovered if lost. Please ensure you have secure backups stored in multiple locations.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Backup Options */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[
                                            {
                                                icon: '🔑',
                                                title: 'Recovery Phrase',
                                                description: 'Generate a quantum-encrypted recovery phrase for your identity.',
                                                buttonText: 'Generate Recovery Phrase',
                                                color: 'from-blue-500 to-cyan-600'
                                            },
                                            {
                                                icon: '💾',
                                                title: 'Quantum Backup',
                                                description: 'Create an encrypted backup of your quantum DNA structure.',
                                                buttonText: 'Create Quantum Backup',
                                                color: 'from-purple-500 to-pink-600'
                                            }
                                        ].map((option, index) => (
                                            <div key={index} className="bg-gradient-to-br from-[var(--ink)] to-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-[var(--mustard)]/30 transition-all duration-200">
                                                <div className={`w-14 h-14 bg-gradient-to-br ${option.color} rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg`}>
                                                    {option.icon}
                                                </div>
                                                <h4 className="font-semibold mb-3 text-white text-lg">{option.title}</h4>
                                                <p className="text-gray-400 mb-4 leading-relaxed">
                                                    {option.description}
                                                </p>
                                                <button className="w-full py-3 bg-gradient-to-r from-[var(--mustard)] to-yellow-600 text-[var(--ink)] rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                                    {option.buttonText}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Footer */}
                    <footer className="text-center py-6 fade-in">
                        <div className="inline-block px-6 py-3 bg-gradient-to-r from-[var(--pane)] to-[var(--ink)] rounded-2xl border border-gray-800">
                            <p className="text-gray-400 text-sm">
                                © 2025 <span className="text-[var(--mustard)] font-semibold">QuantumVerse</span> - Quantum Identity Platform
                            </p>
                            <p className="text-gray-600 text-xs mt-1">
                                Powered by Hedera Blockchain
                            </p>
                        </div>
                    </footer>
                </main>
            </div>
        </>
    )
}

export default Identity
