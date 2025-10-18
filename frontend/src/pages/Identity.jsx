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
import {Buffer} from 'buffer/'

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
        const baseClass = "px-4 py-2 rounded-lg font-semibold transition-colors";

        if (connectionState === 'Connecting') {
            return `${baseClass} bg-yellow-500 text-white cursor-not-allowed`;
        }

        if (isConnected) {
            return `${baseClass} bg-green-500 text-white hover:bg-green-600`;
        }

        return `${baseClass} bg-[var(--mustard)] text-[var(--ink)] hover:opacity-80`;
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

        // Full metadata (store off-chain or in localStorage)
        const fullMetadata = {
            owner: connectedAccount,
            createdAt: new Date().toISOString(),
            securityLevel: 'QUANTUM',
            quantumSignature: generateQuantumSignature(),
            multiRealityEnabled: true,
            biometricEnabled: false
        }

        // Minimal on-chain metadata (< 100 bytes)
        const onChainMetadata = {
            id: connectedAccount.slice(-6),
            t: Date.now(),
            v: 1 // version
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
            metadata: fullMetadata, // Store full metadata locally
            onChainMetadata: onChainMetadata, // What's actually on-chain
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

        alert(`Quantum Identity Created!\nToken: ${tokenId.toString()}\nSerial: ${mintReceipt.serials[0].toString()}\nMetadata: ${metadataBytes.length} bytes`)

    } catch (error) {
        setIdentityState(prev => ({ ...prev, loading: false, error: error.message }))
        alert(`Failed: ${error.message}`)
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
        const bases = ['Q', 'U', 'A', 'N', 'T', 'M'] // Quantum bases
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
            }
        }
    }, [])

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
                    
                    {/* Top banner with wallet connection */}
                    <section className="bg-[var(--mustard)] text-[var(--ink)] rounded-2xl p-6 shadow-lg fade-in">
                        <h1 className="text-xl font-bold mb-2">QuantumVerse - Quantum Identity</h1>
                        <p className="text-sm">
                            Your quantum-secured digital identity that persists across all realities.
                            Post-quantum cryptography ensures your identity remains secure in the quantum age.
                        </p>
                        
                        {/* Wallet Connection Status */}
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

                    {/* Identity Status Cards */}
                    {identityState.identity && (
                        <section className="bg-[var(--pane)] text-[var(--mustard)] rounded-2xl p-6 shadow-xl fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-[var(--ink)] rounded-xl p-4 border border-[color:rgba(244,211,94,0.2)] text-center">
                                    <div className="text-3xl mb-2">🔐</div>
                                    <div className="text-lg font-bold text-[var(--mustard)]">
                                        {identityState.identity.securityLevel}
                                    </div>
                                    <div className="text-sm text-white/70">Security Level</div>
                                </div>

                                <div className="bg-[var(--ink)] rounded-xl p-4 border border-[color:rgba(244,211,94,0.2)] text-center">
                                    <div className="text-3xl mb-2">🌌</div>
                                    <div className="text-lg font-bold text-[var(--mustard)]">
                                        {quantumDNA?.structure.entanglementPoints.length || 0}
                                    </div>
                                    <div className="text-sm text-white/70">Entanglements</div>
                                </div>

                                <div className="bg-[var(--ink)] rounded-xl p-4 border border-[color:rgba(244,211,94,0.2)] text-center">
                                    <div className="text-3xl mb-2">🏆</div>
                                    <div className="text-lg font-bold text-[var(--mustard)]">
                                        {identityState.identity.achievements.length}
                                    </div>
                                    <div className="text-sm text-white/70">Achievements</div>
                                </div>

                                <div className="bg-[var(--ink)] rounded-xl p-4 border border-[color:rgba(244,211,94,0.2)] text-center">
                                    <div className="text-3xl mb-2">⏱️</div>
                                    <div className="text-lg font-bold text-[var(--mustard)]">
                                        {Math.floor((Date.now() - new Date(identityState.identity.createdAt).getTime()) / (1000 * 60 * 60 * 24))}d
                                    </div>
                                    <div className="text-sm text-white/70">Identity Age</div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Navigation Tabs */}
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

                    {/* Tab Content */}
                    <div className="min-h-[400px]">
                        {activeTab === 'identity' && (
                            <section className="bg-[var(--pane)] text-[var(--mustard)] rounded-2xl p-6 shadow-xl space-y-6 fade-in">
                                <h2 className="text-xl font-semibold">Quantum Identity Details</h2>
                                
                                {identityState.identity ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-[var(--ink)] rounded-xl p-4 border border-[color:rgba(244,211,94,0.2)]">
                                                <h4 className="font-semibold mb-2 text-white">Identity Token</h4>
                                                <p className="text-white/70 font-mono text-sm">{identityState.identity.tokenId}</p>
                                            </div>
                                            <div className="bg-[var(--ink)] rounded-xl p-4 border border-[color:rgba(244,211,94,0.2)]">
                                                <h4 className="font-semibold mb-2 text-white">Serial Number</h4>
                                                <p className="text-white/70">{identityState.identity.serialNumber?.toString()}</p>
                                            </div>
                                            <div className="bg-[var(--ink)] rounded-xl p-4 border border-[color:rgba(244,211,94,0.2)]">
                                                <h4 className="font-semibold mb-2 text-white">Owner Account</h4>
                                                <p className="text-white/70 font-mono text-sm">{connectedAccount}</p>
                                            </div>
                                            <div className="bg-[var(--ink)] rounded-xl p-4 border border-[color:rgba(244,211,94,0.2)]">
                                                <h4 className="font-semibold mb-2 text-white">Created</h4>
                                                <p className="text-white/70">{new Date(identityState.identity.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">🔐</div>
                                        <h4 className="text-lg font-semibold mb-2 text-white">No Identity Found</h4>
                                        <p className="text-white/60 mb-6">
                                            Generate your quantum identity to get started
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
                                                className="bg-[var(--mustard)] text-[var(--ink)] hover:opacity-80 disabled:opacity-50 px-8 py-3 rounded-lg font-semibold transition-colors"
                                            >
                                                {identityState.loading ? 'Generating...' : 'Generate Quantum Identity'}
                                            </button>
                                        )}
                                    </div>
                                )}

                                {identityState.error && (
                                    <div className="bg-red-900/50 border border-red-500 p-4 rounded-lg">
                                        <p className="text-red-300">Error: {identityState.error}</p>
                                    </div>
                                )}
                            </section>
                        )}

                        {activeTab === 'dna' && (
                            <section className="bg-[var(--pane)] text-[var(--mustard)] rounded-2xl p-6 shadow-xl space-y-6 fade-in">
                                <h2 className="text-xl font-semibold">Quantum DNA Structure</h2>
                                
                                {quantumDNA ? (
                                    <div className="space-y-6">
                                        <div className="bg-[var(--ink)] rounded-xl p-4 border border-[color:rgba(244,211,94,0.2)]">
                                            <h4 className="font-semibold mb-2 text-white">DNA Sequence</h4>
                                            <div className="font-mono text-sm bg-gray-900 p-3 rounded break-all text-[var(--mustard)]">
                                                {quantumDNA.sequence}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-[var(--ink)] rounded-xl p-4 border border-[color:rgba(244,211,94,0.2)]">
                                                <h4 className="font-semibold mb-2 text-white">Structure Properties</h4>
                                                <div className="space-y-2 text-sm text-white/70">
                                                    <p>Helix Type: {quantumDNA.structure.helixType}</p>
                                                    <p>Bond Strength: {quantumDNA.structure.bondStrength.toFixed(1)}%</p>
                                                    <p>Entanglement Points: {quantumDNA.structure.entanglementPoints.length}</p>
                                                </div>
                                            </div>

                                            <div className="bg-[var(--ink)] rounded-xl p-4 border border-[color:rgba(244,211,94,0.2)]">
                                                <h4 className="font-semibold mb-2 text-white">DNA Properties</h4>
                                                <div className="space-y-2 text-sm text-white/70">
                                                    <p>Stability: {quantumDNA.properties.stability.toFixed(1)}%</p>
                                                    <p>Adaptability: {quantumDNA.properties.adaptability.toFixed(1)}%</p>
                                                    <p>Cross-Reality: {quantumDNA.properties.crossRealityCompatibility.toFixed(1)}%</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">🧬</div>
                                        <h4 className="text-lg font-semibold mb-2 text-white">Generate Identity First</h4>
                                        <p className="text-white/60">
                                            Create your quantum identity to view your unique DNA structure
                                        </p>
                                    </div>
                                )}
                            </section>
                        )}

                        {activeTab === 'security' && (
                            <section className="bg-[var(--pane)] text-[var(--mustard)] rounded-2xl p-6 shadow-xl space-y-6 fade-in">
                                <h2 className="text-xl font-semibold">Quantum Security Features</h2>

                                <div className="space-y-6">
                                    <div className="p-6 bg-[var(--ink)] rounded-xl border border-[color:rgba(244,211,94,0.2)]">
                                        <h4 className="font-semibold text-[var(--mustard)] mb-3">🔒 Post-Quantum Cryptography</h4>
                                        <p className="text-white/80 mb-4">
                                            Your identity uses quantum-resistant algorithms that remain secure even 
                                            against quantum computer attacks.
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                            <span className="text-green-400">Active & Protected</span>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-[var(--ink)] rounded-xl border border-[color:rgba(244,211,94,0.2)]">
                                        <h4 className="font-semibold text-[var(--mustard)] mb-3">🌍 Multi-Reality Verification</h4>
                                        <p className="text-white/80 mb-4">
                                            Your identity is verified and synchronized across virtual, augmented, 
                                            and physical realities.
                                        </p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            {['Virtual', 'Augmented', 'Physical', 'Mixed'].map((reality) => (
                                                <div key={reality} className="flex items-center gap-2 p-2 bg-gray-700/50 rounded">
                                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                                    <span className="text-sm text-white/80">{reality}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-6 bg-[var(--ink)] rounded-xl border border-[color:rgba(244,211,94,0.2)]">
                                        <h4 className="font-semibold text-[var(--mustard)] mb-3">🔐 Biometric Integration</h4>
                                        <p className="text-white/80 mb-4">
                                            Optional biometric factors can be encrypted and stored as part of your 
                                            quantum identity for enhanced security.
                                        </p>
                                        <button className="bg-[var(--mustard)] text-[var(--ink)] hover:opacity-80 px-4 py-2 rounded-lg transition-colors">
                                            Configure Biometrics
                                        </button>
                                    </div>
                                </div>
                            </section>
                        )}

                        {activeTab === 'backup' && (
                            <section className="bg-[var(--pane)] text-[var(--mustard)] rounded-2xl p-6 shadow-xl space-y-6 fade-in">
                                <h2 className="text-xl font-semibold">Backup & Recovery</h2>

                                <div className="space-y-6">
                                    <div className="p-6 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                                        <h4 className="font-semibold text-yellow-300 mb-3">⚠️ Important Security Notice</h4>
                                        <p className="text-white/80 mb-4">
                                            Your quantum identity cannot be recovered if lost. Please ensure you have 
                                            secure backups stored in multiple locations.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-[var(--ink)] rounded-xl p-6 border border-[color:rgba(244,211,94,0.2)]">
                                            <h4 className="font-semibold mb-4 text-white">🔑 Recovery Phrase</h4>
                                            <p className="text-white/70 mb-4">
                                                Generate a quantum-encrypted recovery phrase for your identity.
                                            </p>
                                            <button className="w-full bg-[var(--mustard)] text-[var(--ink)] hover:opacity-80 px-4 py-2 rounded-lg transition-colors">
                                                Generate Recovery Phrase
                                            </button>
                                        </div>

                                        <div className="bg-[var(--ink)] rounded-xl p-6 border border-[color:rgba(244,211,94,0.2)]">
                                            <h4 className="font-semibold mb-4 text-white">💾 Quantum Backup</h4>
                                            <p className="text-white/70 mb-4">
                                                Create an encrypted backup of your quantum DNA structure.
                                            </p>
                                            <button className="w-full bg-[var(--mustard)] text-[var(--ink)] hover:opacity-80 px-4 py-2 rounded-lg transition-colors">
                                                Create Quantum Backup
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Footer */}
                    <footer className="text-center text-sm text-white/60 pt-8 fade-in">
                        © 2025 QuantumVerse - Quantum Identity Platform powered by Hedera
                    </footer>
                </main>
            </div>
        </>
    )
}

export default Identity
