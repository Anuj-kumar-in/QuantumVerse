import React, { useState, useEffect } from 'react'
import { 
    TokenMintTransaction,
    TransferTransaction,
    TokenId,
    AccountId,
    Hbar,
    Client,
    PrivateKey
} from '@hashgraph/sdk'
import { useWallet } from '../Context/WalletContext'


const PHYSICS_NFT_TOKEN_ID = import.meta.env.VITE_PHYSICS_TOKEN_ID || '0.0.7043803'
const TREASURY_ID = import.meta.env.VITE_TREASURY_ID || '0.0.7043802'
const SUPPLY_PRIVATE_KEY = import.meta.env.VITE_SUPPLY_PRIVATE_KEY || '3030020100300706052b8104000a04220420c7d06017ac53d4092eb48c5434fa832284239639d13b7806c1ad0c6bb1b74a5d'
const SUPPLY_ID = import.meta.env.VITE_SUPPLY_ID || '0.0.7043801'


const PINATA_JWT = import.meta.env.REACT_APP_PINATA_JWT || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI2OTY2MmE1MS0wOWM5LTRlZDQtYjU0My0zNzkzZTNhZWE5ZmIiLCJlbWFpbCI6ImFrMjMwNTQ5M0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYTFlZmMwNDdiZTA2YmM0ODJkODUiLCJzY29wZWRLZXlTZWNyZXQiOiIyOGViNTdkMjAwMDRlZTk4NDc2ZGQyMDY1ODAwYjViOGQ2ZmU0ZTg2NWU4MzdjMGFkMTY1OTU4MDE3YjhkOTE2IiwiZXhwIjoxNzkyMzUzNzIzfQ.ESr1PMpjaXRhdgONqJhiKhsWdi_zZrt6cUG_8riyb2k'

const AUTHORIZED_MINTERS = [
    '0.0.6896538',
    '0.0.6962607'
]

export const PhysicsType = {
  GRAVITY: 0,
  TIME: 1,
  WEATHER: 2,
  MATTER: 3,
  ENERGY: 4,
  SPACE: 5,
  QUANTUM_FIELD: 6
}

export const Rarity = {
  COMMON: 0,
  UNCOMMON: 1,
  RARE: 2,
  EPIC: 3,
  LEGENDARY: 4,
  MYTHIC: 5
}

const PHYSICS_TYPE_NAMES = {
  [PhysicsType.GRAVITY]: 'Gravity',
  [PhysicsType.TIME]: 'Time',
  [PhysicsType.WEATHER]: 'Weather',
  [PhysicsType.MATTER]: 'Matter',
  [PhysicsType.ENERGY]: 'Energy',
  [PhysicsType.SPACE]: 'Space',
  [PhysicsType.QUANTUM_FIELD]: 'Quantum Field'
}

const RARITY_NAMES = {
  [Rarity.COMMON]: 'Common',
  [Rarity.UNCOMMON]: 'Uncommon',
  [Rarity.RARE]: 'Rare',
  [Rarity.EPIC]: 'Epic',
  [Rarity.LEGENDARY]: 'Legendary',
  [Rarity.MYTHIC]: 'Mythic'
}

const RARITY_COLORS = {
  [Rarity.COMMON]: 'text-gray-400',
  [Rarity.UNCOMMON]: 'text-green-400',
  [Rarity.RARE]: 'text-blue-400',
  [Rarity.EPIC]: 'text-purple-400',
  [Rarity.LEGENDARY]: 'text-yellow-400',
  [Rarity.MYTHIC]: 'text-red-400'
}


function imageUrl() {
    const randomImageNum = Math.floor(Math.random() * 10) + 1
    return `/image/${randomImageNum}.jpg`
}


const uploadToIPFS = async (nftData) => {
    try {
        const blob = new Blob([JSON.stringify(nftData, null, 2)], { type: 'application/json' })
        const formData = new FormData()
        formData.append('file', blob, 'metadata.json')

        const pinataMetadata = JSON.stringify({
            name: `${nftData.name} - Metadata`,
        })
        formData.append('pinataMetadata', pinataMetadata)

        const pinataOptions = JSON.stringify({
            cidVersion: 0,
        })
        formData.append('pinataOptions', pinataOptions)

        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PINATA_JWT}`
            },
            body: formData
        })

        if (!response.ok) {
            let errorData
            try {
                errorData = await response.json()
            } catch (e) {
                errorData = { error: 'Unknown error, could not parse response', status: response.status }
            }
            console.error('IPFS upload error details', errorData)
            throw new Error(`IPFS upload failed: ${JSON.stringify(errorData)}`)
        }

        const result = await response.json()
        console.log('IPFS Upload Success:', result.IpfsHash)
        return result.IpfsHash
    } catch (error) {
        console.error('IPFS upload error:', error)
        throw new Error(`Failed to upload to IPFS: ${error.message}`)
    }
}

const generateDefaultProperties = (physicsType, rarity) => {
    const baseMultiplier = rarity + 1
    const typeMultipliers = {
        [PhysicsType.GRAVITY]: { magnitude: 1.2, duration: 0.8, range: 1.0, cooldown: 0.9, energyCost: 1.1 },
        [PhysicsType.TIME]: { magnitude: 0.9, duration: 1.5, range: 0.7, cooldown: 1.3, energyCost: 1.4 },
        [PhysicsType.WEATHER]: { magnitude: 1.1, duration: 1.0, range: 1.3, cooldown: 0.8, energyCost: 1.0 },
        [PhysicsType.MATTER]: { magnitude: 1.3, duration: 0.9, range: 0.8, cooldown: 1.0, energyCost: 1.2 },
        [PhysicsType.ENERGY]: { magnitude: 1.4, duration: 0.7, range: 0.9, cooldown: 1.1, energyCost: 0.8 },
        [PhysicsType.SPACE]: { magnitude: 1.0, duration: 1.2, range: 1.5, cooldown: 1.2, energyCost: 1.3 },
        [PhysicsType.QUANTUM_FIELD]: { magnitude: 1.5, duration: 1.1, range: 1.1, cooldown: 1.4, energyCost: 1.5 }
    }
    
    const multipliers = typeMultipliers[physicsType] || typeMultipliers[PhysicsType.GRAVITY]
    
    return {
        magnitude: Math.round((10 + Math.random() * 90) * baseMultiplier * multipliers.magnitude),
        duration: Math.round((5 + Math.random() * 45) * baseMultiplier * multipliers.duration),
        range: Math.round((8 + Math.random() * 72) * baseMultiplier * multipliers.range),
        cooldown: Math.round((3 + Math.random() * 27) * baseMultiplier * multipliers.cooldown),
        energyCost: Math.round((15 + Math.random() * 85) * baseMultiplier * multipliers.energyCost),
        compatibility: getCompatibility(physicsType)
    }
}

const getCompatibility = (physicsType) => {
    const compatibilityMap = {
        [PhysicsType.GRAVITY]: ['Matter', 'Space'],
        [PhysicsType.TIME]: ['Space', 'Quantum Field'],
        [PhysicsType.WEATHER]: ['Energy', 'Matter'],
        [PhysicsType.MATTER]: ['Gravity', 'Energy'],
        [PhysicsType.ENERGY]: ['Matter', 'Weather'],
        [PhysicsType.SPACE]: ['Gravity', 'Time'],
        [PhysicsType.QUANTUM_FIELD]: ['Time', 'Energy']
    }
    return compatibilityMap[physicsType] || []
}

const generatePhysicsNFT = (id) => {
    const physicsType = Math.floor(Math.random() * 7)
    const rarity = Math.floor(Math.random() * 6)
    const properties = generateDefaultProperties(physicsType, rarity)
    
    return {
        id: `0.0.${1000000 + id}`,
        serialNumber: id,
        owner: `0.0.${Math.floor(Math.random() * 1000000) + 100000}`,
        physicsType,
        rarity,
        energy: Math.floor(Math.random() * 100) + 50,
        isActive: Math.random() > 0.5,
        name: `${PHYSICS_TYPE_NAMES[physicsType]} Force #${id}`,
        description: `A ${RARITY_NAMES[rarity]} ${PHYSICS_TYPE_NAMES[physicsType]} NFT with quantum properties`,
        image: imageUrl(),
        price: (Math.random() * 50 + 10).toFixed(2),
        creator: `0.0.${Math.floor(Math.random() * 1000000) + 100000}`,
        createdAt: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        metadata: JSON.stringify({ physicsType, rarity, properties }),
        properties,
        isForSale: Math.random() > 0.3
    }
}

const NFTCard = ({ nft, onBuy, onView, isOwned, isConnected, loading }) => {
    const rarityColor = RARITY_COLORS[nft.rarity] || 'text-gray-400'
    const physicsTypeName = PHYSICS_TYPE_NAMES[nft.physicsType] || 'Unknown'
    const rarityName = RARITY_NAMES[nft.rarity] || 'Unknown'
    
    return (
        <div className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] rounded-2xl shadow-xl border border-gray-800 hover:border-[var(--mustard)]/50 transition-all duration-300 p-4 fade-in">
            <div className="aspect-square mb-4 overflow-hidden rounded-lg">
                <img 
                    src={nft.image} 
                    alt={nft.name} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                />
            </div>
            <div className="space-y-3">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-[var(--mustard)] truncate">{nft.name}</h3>
                    <span className={`text-sm font-medium ${rarityColor}`}>{rarityName}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{physicsTypeName}</span>
                    <span className="text-[var(--mustard)]">⚡ {nft.energy}</span>
                </div>
                <p className="text-gray-400 text-sm line-clamp-2">{nft.description}</p>
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-[var(--mustard)]">Properties:</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                        <div>Magnitude: <span className="text-white">{nft.properties.magnitude}</span></div>
                        <div>Duration: <span className="text-white">{nft.properties.duration}s</span></div>
                        <div>Range: <span className="text-white">{nft.properties.range}m</span></div>
                        <div>Cooldown: <span className="text-white">{nft.properties.cooldown}s</span></div>
                    </div>
                </div>
                <div className="pt-3 border-t border-gray-800">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="text-lg font-bold text-[var(--mustard)]">{nft.price} HBAR</div>
                            <div className="text-xs text-gray-500">Serial #{nft.serialNumber}</div>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => onView(nft)}
                                className="px-3 py-2 rounded-xl text-sm font-medium bg-[var(--ink)] border border-gray-700 text-gray-300 hover:border-[var(--mustard)]/50 transition-all"
                            >
                                View
                            </button>
                            {!isOwned && nft.isForSale && (
                                <button 
                                    onClick={() => onBuy(nft)} 
                                    disabled={!isConnected || loading}
                                    className="px-3 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-[var(--mustard)] to-yellow-600 text-[var(--ink)] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? '...' : 'Buy'}
                                </button>
                            )}
                            {isOwned && (
                                <button 
                                    disabled
                                    className="px-3 py-2 rounded-xl text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed"
                                >
                                    Owned
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const Marketplace = () => {
    const { 
        isConnected, 
        connectedAccount, 
        getSigner, 
        connectWallet, 
        disconnectWallet,
        connectionState,
        sendHbar 
    } = useWallet()

    const [activeTab, setActiveTab] = useState('dashboard')
    const [nfts, setNfts] = useState([])
    const [userNFTs, setUserNFTs] = useState([])
    const [txLoading, setTxLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [selectedNFT, setSelectedNFT] = useState(null)
    
    const [filters, setFilters] = useState({
        priceMin: '',
        priceMax: '',
        rarity: '',
        physicsType: '',
        availability: '',
        sortBy: 'newest',
        search: ''
    })

    // Mint state
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [physicsType, setPhysicsType] = useState(PhysicsType.GRAVITY)
    const [rarity, setRarity] = useState(Rarity.COMMON)
    const [customProperties, setCustomProperties] = useState({
        magnitude: '',
        duration: '',
        range: '',
        cooldown: '',
        energyCost: ''
    })
    const [isMinting, setIsMinting] = useState(false)
    const [mintStatus, setMintStatus] = useState('')

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'shop', label: 'Shop', icon: '🛒' },
        { id: 'owned', label: 'My NFTs', icon: '🎨' },
        { id: 'mint', label: 'Mint NFT', icon: '⚡' }
    ]

    useEffect(() => {
        const generated = Array.from({ length: 20 }, (_, i) => generatePhysicsNFT(i + 1))
        setNfts(generated)
    }, [])

    useEffect(() => {
        if (isConnected && connectedAccount) {
            const owned = nfts.filter(n => n.owner === connectedAccount).map(n => n.id)
            setUserNFTs(owned)
        }
    }, [isConnected, connectedAccount, nfts])

    const handleWalletAction = async () => {
        try {
            if (isConnected) {
                disconnectWallet()
            } else {
                await connectWallet()
            }
        } catch (error) {
            console.error("Wallet action failed:", error)
            alert("Failed to connect wallet. Please try again.")
        }
    }

    const formatAccountId = (accountId) => {
        if (!accountId) return ''
        return `${accountId.slice(0, 8)}...${accountId.slice(-4)}`
    }

    const getWalletButtonText = () => {
        if (connectionState === 'Connecting') return 'Connecting...'
        if (isConnected) return `Disconnect (${formatAccountId(connectedAccount)})`
        return 'Connect Hedera Wallet'
    }

    const getWalletButtonClass = () => {
        const baseClass = "px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"

        if (connectionState === 'Connecting') {
            return `${baseClass} bg-yellow-500 text-white cursor-not-allowed`
        }

        if (isConnected) {
            return `${baseClass} bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700`
        }

        return `${baseClass} bg-gradient-to-r from-[var(--mustard)] to-yellow-600 text-[var(--ink)] hover:opacity-90`
    }

    const handleFilterChange = (updates) => {
        setFilters(prev => ({ ...prev, ...updates }))
    }

    const buyNFT = async (nft) => {
        if (!isConnected) {
            alert('Please connect your wallet')
            return
        }
        
        setTxLoading(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            setUserNFTs(prev => [...prev, nft.id])
            setNfts(prev => prev.map(n => 
                n.id === nft.id ? { ...n, owner: connectedAccount, isForSale: false } : n
            ))
            
            alert(`Successfully purchased ${nft.name} for ${nft.price} HBAR!`)
        } catch (error) {
            console.error('Purchase failed:', error)
            alert('Purchase failed: ' + error.message)
        } finally {
            setTxLoading(false)
        }
    }

    const viewNFT = (nft) => {
        setSelectedNFT(nft)
        setShowModal(true)
    }

    const createMetadata = async (physicsType, rarity, customProperties) => {
        setMintStatus('Generating properties...')
        
        const defaultProperties = generateDefaultProperties(physicsType, rarity)
        const finalProperties = {
            magnitude: customProperties.magnitude ? parseInt(customProperties.magnitude) : defaultProperties.magnitude,
            duration: customProperties.duration ? parseInt(customProperties.duration) : defaultProperties.duration,
            range: customProperties.range ? parseInt(customProperties.range) : defaultProperties.range,
            cooldown: customProperties.cooldown ? parseInt(customProperties.cooldown) : defaultProperties.cooldown,
            energyCost: customProperties.energyCost ? parseInt(customProperties.energyCost) : defaultProperties.energyCost,
            compatibility: defaultProperties.compatibility
        }
        
        const nftData = {
            name,
            description,
            image: imageUrl(),
            type: "image/png",
            format: "HIP412@2.0.0",
            properties: {
                creator: connectedAccount,
                createdAt: Date.now(),
                energy: Math.floor(Math.random() * 100) + 50,
                isActive: true
            },
            attributes: [
                { trait_type: "Physics Type", value: PHYSICS_TYPE_NAMES[physicsType] },
                { trait_type: "Rarity", value: RARITY_NAMES[rarity] },
                { trait_type: "Magnitude", value: finalProperties.magnitude, display_type: "number" },
                { trait_type: "Duration", value: finalProperties.duration, display_type: "number", max_value: 100 },
                { trait_type: "Range", value: finalProperties.range, display_type: "number", max_value: 200 },
                { trait_type: "Cooldown", value: finalProperties.cooldown, display_type: "number" },
                { trait_type: "Energy Cost", value: finalProperties.energyCost, display_type: "number" },
                { trait_type: "Compatibility", value: finalProperties.compatibility.join(', ') }
            ],
            localization: {
                uri: "",
                default: "en",
                locales: ["en"]
            }
        }
        
        setMintStatus('Uploading to IPFS...')
        const ipfsCID = await uploadToIPFS(nftData)
        const metadataURI = `ipfs://${ipfsCID}`
        
        console.log('Metadata URI:', metadataURI)
        setMintStatus('IPFS upload complete!')
        
        return Buffer.from(metadataURI)
    }

    const handleMint = async () => {
        const authorized = isConnected && AUTHORIZED_MINTERS.includes(connectedAccount)
        
        if (!authorized) return alert('Not authorized to mint')
        if (!name || !description) return alert('Name and description required')
        
        setIsMinting(true)
        setMintStatus('Starting mint process...')
        
        try {
            setMintStatus('Processing payment...')
            const receiptPay = await sendHbar(TREASURY_ID, 10)
            if (receiptPay.status && receiptPay.status._code !== 22) {
                throw new Error('Payment failed')
            }
            setMintStatus('Payment confirmed!')

            const metadata = await createMetadata(physicsType, rarity, customProperties)

            setMintStatus('Minting NFT on Hedera...')
            const client = Client.forTestnet()
            const supplyKey = PrivateKey.fromStringDer(SUPPLY_PRIVATE_KEY)
            client.setOperator(SUPPLY_ID, supplyKey)

            const mintTx = await new TokenMintTransaction()
                .setTokenId(TokenId.fromString(PHYSICS_NFT_TOKEN_ID))
                .setMetadata([metadata])
                .execute(client)
            
            const mintRcpt = await mintTx.getReceipt(client)
            const serialNumber = mintRcpt.serials[0].toString()
            setMintStatus(`NFT Minted! Serial: ${serialNumber}`)

            setMintStatus('Transferring NFT to your wallet...')
            await new TransferTransaction()
                .addNftTransfer(
                    TokenId.fromString(PHYSICS_NFT_TOKEN_ID),
                    serialNumber,
                    AccountId.fromString(TREASURY_ID),
                    AccountId.fromString(connectedAccount)
                )
                .execute(client)

            setMintStatus('Transfer complete!')
            alert(`✅ Mint Success! Serial: ${serialNumber}\\nCheck your wallet for the NFT!`)
            
            // Reset form
            setName('')
            setDescription('')
            setPhysicsType(PhysicsType.GRAVITY)
            setRarity(Rarity.COMMON)
            setCustomProperties({
                magnitude: '',
                duration: '',
                range: '',
                cooldown: '',
                energyCost: ''
            })

        } catch (e) {
            console.error('Mint Error:', e)
            setMintStatus('Mint failed!')
            alert('Mint failed: ' + (e.message || e))
        } finally {
            setIsMinting(false)
            setTimeout(() => setMintStatus(''), 3000)
        }
    }

    let displayedNFTs = [...nfts]

    if (filters.search) {
        displayedNFTs = displayedNFTs.filter(nft => 
            nft.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            nft.description.toLowerCase().includes(filters.search.toLowerCase())
        )
    }

    if (filters.priceMin) {
        displayedNFTs = displayedNFTs.filter(nft => parseFloat(nft.price) >= parseFloat(filters.priceMin))
    }

    if (filters.priceMax) {
        displayedNFTs = displayedNFTs.filter(nft => parseFloat(nft.price) <= parseFloat(filters.priceMax))
    }

    if (filters.physicsType) {
        displayedNFTs = displayedNFTs.filter(nft => nft.physicsType === parseInt(filters.physicsType))
    }

    if (filters.rarity) {
        displayedNFTs = displayedNFTs.filter(nft => nft.rarity === parseInt(filters.rarity))
    }

    if (filters.availability === 'forSale') {
        displayedNFTs = displayedNFTs.filter(nft => nft.isForSale)
    } else if (filters.availability === 'owned') {
        displayedNFTs = displayedNFTs.filter(nft => userNFTs.includes(nft.id))
    }

    // Sort
    switch (filters.sortBy) {
        case 'newest':
            displayedNFTs.sort((a, b) => b.createdAt - a.createdAt)
            break
        case 'oldest':
            displayedNFTs.sort((a, b) => a.createdAt - b.createdAt)
            break
        case 'priceHigh':
            displayedNFTs.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
            break
        case 'priceLow':
            displayedNFTs.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
            break
        case 'rarity':
            displayedNFTs.sort((a, b) => b.rarity - a.rarity)
            break
        case 'energy':
            displayedNFTs.sort((a, b) => b.energy - a.energy)
            break
    }

    const stats = {
        totalNFTs: nfts.length,
        forSale: nfts.filter(n => n.isForSale).length,
        owned: userNFTs.length,
        floorPrice: nfts.filter(n => n.isForSale).reduce((m, n) => Math.min(m, parseFloat(n.price)), Infinity)
    }

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
                                    ⚛️
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[var(--mustard)] to-yellow-600 bg-clip-text text-transparent">
                                        Physics NFT Marketplace
                                    </h1>
                                    <p className="text-gray-400 text-sm mt-1">
                                        Powered by Hedera Blockchain & Quantum Properties
                                    </p>
                                </div>
                            </div>
                            
                            <p className="text-gray-300 text-lg mb-6 max-w-3xl">
                                Trade physics properties and quantum assets. Discover unique NFTs with real quantum mechanics and physics attributes.
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
                                { label: 'Total NFTs', value: stats.totalNFTs, icon: '🎨', color: 'from-purple-500 to-pink-600' },
                                { label: 'For Sale', value: stats.forSale, icon: '🛒', color: 'from-blue-500 to-cyan-600' },
                                { label: 'Your NFTs', value: stats.owned, icon: '💎', color: 'from-yellow-500 to-orange-600' },
                                { label: 'Floor Price', value: stats.floorPrice === Infinity ? '-' : stats.floorPrice.toFixed(1), icon: '💰', color: 'from-green-500 to-emerald-600' }
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
                        {activeTab === 'dashboard' && (
                            <section className="fade-in space-y-6">
                                <div className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] p-8 rounded-2xl shadow-xl border border-gray-800">
                                    <h2 className="text-2xl font-bold text-[var(--mustard)] mb-4">Welcome to Physics NFT Marketplace</h2>
                                    <p className="text-gray-300 mb-6">
                                        Discover, trade, and collect unique Physics NFTs with quantum properties. Each NFT represents a unique physics force with customizable attributes.
                                    </p>
                                    <div className="flex gap-3 flex-wrap">
                                        <button 
                                            onClick={() => setActiveTab('shop')}
                                            className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-[var(--mustard)] to-yellow-600 text-[var(--ink)] hover:opacity-90 transition-all shadow-lg"
                                        >
                                            Browse Shop
                                        </button>
                                        <button 
                                            onClick={() => setActiveTab('mint')}
                                            className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:opacity-90 transition-all shadow-lg"
                                        >
                                            Mint New NFT
                                        </button>
                                        <button 
                                            onClick={() => setActiveTab('owned')}
                                            className="px-6 py-3 rounded-xl font-semibold border border-gray-700 text-gray-300 hover:border-[var(--mustard)]/50 transition-all"
                                        >
                                            View Collection
                                        </button>
                                    </div>
                                </div>
                            </section>
                        )}

                        {activeTab === 'shop' && (
                            <section className="fade-in space-y-6">
                                {/* Filters */}
                                <div className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] p-6 rounded-2xl shadow-xl border border-gray-800">
                                    <h3 className="text-lg font-semibold text-[var(--mustard)] mb-4">Filters ({displayedNFTs.length} items)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Min Price (HBAR)</label>
                                            <input
                                                type="number"
                                                value={filters.priceMin}
                                                onChange={(e) => handleFilterChange({ priceMin: e.target.value })}
                                                placeholder="Min"
                                                className="w-full bg-[var(--ink)] text-white border border-gray-700 rounded-xl p-2 focus:border-[var(--mustard)] transition-colors text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Max Price (HBAR)</label>
                                            <input
                                                type="number"
                                                value={filters.priceMax}
                                                onChange={(e) => handleFilterChange({ priceMax: e.target.value })}
                                                placeholder="Max"
                                                className="w-full bg-[var(--ink)] text-white border border-gray-700 rounded-xl p-2 focus:border-[var(--mustard)] transition-colors text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Physics Type</label>
                                            <select
                                                value={filters.physicsType || ''}
                                                onChange={(e) => handleFilterChange({ physicsType: e.target.value })}
                                                className="w-full bg-[var(--ink)] text-white border border-gray-700 rounded-xl p-2 focus:border-[var(--mustard)] transition-colors text-sm"
                                            >
                                                <option value="">All Types</option>
                                                {Object.entries(PHYSICS_TYPE_NAMES).map(([key, name]) => (
                                                    <option key={key} value={key}>{name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Rarity</label>
                                            <select
                                                value={filters.rarity || ''}
                                                onChange={(e) => handleFilterChange({ rarity: e.target.value })}
                                                className="w-full bg-[var(--ink)] text-white border border-gray-700 rounded-xl p-2 focus:border-[var(--mustard)] transition-colors text-sm"
                                            >
                                                <option value="">All Rarities</option>
                                                {Object.entries(RARITY_NAMES).map(([key, name]) => (
                                                    <option key={key} value={key}>{name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Sort By</label>
                                            <select
                                                value={filters.sortBy}
                                                onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                                                className="w-full bg-[var(--ink)] text-white border border-gray-700 rounded-xl p-2 focus:border-[var(--mustard)] transition-colors text-sm"
                                            >
                                                <option value="newest">Newest</option>
                                                <option value="oldest">Oldest</option>
                                                <option value="priceHigh">Price: High to Low</option>
                                                <option value="priceLow">Price: Low to High</option>
                                                <option value="rarity">Rarity</option>
                                                <option value="energy">Energy</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <input
                                            type="text"
                                            placeholder="Search NFTs..."
                                            value={filters.search}
                                            onChange={(e) => handleFilterChange({ search: e.target.value })}
                                            className="w-full bg-[var(--ink)] text-white border border-gray-700 rounded-xl p-3 focus:border-[var(--mustard)] transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* NFT Grid */}
                                {displayedNFTs.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {displayedNFTs.map((nft) => (
                                            <NFTCard
                                                key={nft.id}
                                                nft={nft}
                                                onBuy={buyNFT}
                                                onView={viewNFT}
                                                isOwned={userNFTs.includes(nft.id)}
                                                isConnected={isConnected}
                                                loading={txLoading}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] p-12 rounded-2xl shadow-xl border border-gray-800 text-center">
                                        <p className="text-gray-400 text-lg mb-4">No NFTs found matching your criteria</p>
                                        <button
                                            onClick={() => setFilters({
                                                priceMin: '',
                                                priceMax: '',
                                                rarity: '',
                                                physicsType: '',
                                                availability: '',
                                                sortBy: 'newest',
                                                search: ''
                                            })}
                                            className="px-6 py-2 rounded-xl font-medium border border-gray-700 text-gray-300 hover:border-[var(--mustard)]/50 transition-all"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                )}
                            </section>
                        )}

                        {activeTab === 'owned' && (
                            <section className="fade-in">
                                <div className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] p-6 rounded-2xl shadow-xl border border-gray-800 mb-6">
                                    <h3 className="text-2xl font-bold text-[var(--mustard)] mb-2">Your Physics NFTs</h3>
                                    <p className="text-gray-400">Manage and view your collection of Physics NFTs</p>
                                </div>
                                
                                {userNFTs.length === 0 ? (
                                    <div className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] p-12 rounded-2xl shadow-xl border border-gray-800 text-center">
                                        <p className="text-gray-400 text-lg mb-4">No owned NFTs yet</p>
                                        <p className="text-gray-500 text-sm mb-6">Mint or buy your first Physics NFT to get started!</p>
                                        <div className="flex gap-3 justify-center">
                                            <button
                                                onClick={() => setActiveTab('shop')}
                                                className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-[var(--mustard)] to-yellow-600 text-[var(--ink)] hover:opacity-90 transition-all shadow-lg"
                                            >
                                                Browse Shop
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('mint')}
                                                className="px-6 py-3 rounded-xl font-semibold border border-gray-700 text-gray-300 hover:border-[var(--mustard)]/50 transition-all"
                                            >
                                                Mint NFT
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {nfts.filter(n => userNFTs.includes(n.id)).map(n => (
                                            <NFTCard
                                                key={n.id}
                                                nft={n}
                                                onBuy={() => {}}
                                                onView={viewNFT}
                                                isOwned={true}
                                                isConnected={isConnected}
                                                loading={false}
                                            />
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {activeTab === 'mint' && (
                            <section className="fade-in">
                                {!isConnected ? (
                                    <div className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] p-12 rounded-2xl shadow-xl border border-gray-800 text-center">
                                        <h3 className="text-2xl font-bold text-[var(--mustard)] mb-4">Connect Wallet to Mint</h3>
                                        <p className="text-gray-400 mb-6">You need to connect your Hedera wallet to mint Physics NFTs</p>
                                        <button 
                                            onClick={handleWalletAction}
                                            className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-[var(--mustard)] to-yellow-600 text-[var(--ink)] hover:opacity-90 transition-all shadow-lg"
                                        >
                                            Connect Wallet
                                        </button>
                                    </div>
                                ) : !AUTHORIZED_MINTERS.includes(connectedAccount) ? (
                                    <div className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] p-12 rounded-2xl shadow-xl border border-gray-800 text-center">
                                        <h3 className="text-2xl font-bold text-red-400 mb-4">Not Authorized</h3>
                                        <p className="text-gray-400 mb-2">You are not authorized to mint NFTs</p>
                                        <p className="text-gray-500 text-sm">Authorized accounts: {AUTHORIZED_MINTERS.join(', ')}</p>
                                    </div>
                                ) : (
                                    <div className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] p-6 rounded-2xl shadow-xl border border-gray-800">
                                        <h3 className="text-xl font-bold text-[var(--mustard)] mb-6">Mint Physics NFT (10 HBAR)</h3>
                                        
                                        {mintStatus && (
                                            <div className="bg-[var(--mustard)]/10 border border-[var(--mustard)]/30 rounded-lg p-3 text-center mb-6">
                                                <p className="text-[var(--mustard)] text-sm font-medium">{mintStatus}</p>
                                            </div>
                                        )}
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2">Name *</label>
                                                <input
                                                    value={name}
                                                    onChange={e => setName(e.target.value)}
                                                    placeholder="NFT Name"
                                                    className="w-full bg-[var(--ink)] text-white border border-gray-700 rounded-xl p-3 focus:border-[var(--mustard)] transition-colors"
                                                    disabled={isMinting}
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2">Physics Type</label>
                                                <select
                                                    value={physicsType}
                                                    onChange={e => setPhysicsType(parseInt(e.target.value))}
                                                    className="w-full bg-[var(--ink)] text-white border border-gray-700 rounded-xl p-3 focus:border-[var(--mustard)] transition-colors"
                                                    disabled={isMinting}
                                                >
                                                    {Object.entries(PHYSICS_TYPE_NAMES).map(([key, name]) => (
                                                        <option key={key} value={key}>{name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2">Rarity</label>
                                                <select
                                                    value={rarity}
                                                    onChange={e => setRarity(parseInt(e.target.value))}
                                                    className="w-full bg-[var(--ink)] text-white border border-gray-700 rounded-xl p-3 focus:border-[var(--mustard)] transition-colors"
                                                    disabled={isMinting}
                                                >
                                                    {Object.entries(RARITY_NAMES).map(([key, name]) => (
                                                        <option key={key} value={key}>{name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-sm text-gray-400 mb-2">Description *</label>
                                            <textarea
                                                value={description}
                                                onChange={e => setDescription(e.target.value)}
                                                placeholder="Description"
                                                rows={3}
                                                className="w-full bg-[var(--ink)] text-white border border-gray-700 rounded-xl p-3 focus:border-[var(--mustard)] transition-colors"
                                                disabled={isMinting}
                                            />
                                        </div>

                                        <div className="mb-6">
                                            <h4 className="text-lg font-medium text-[var(--mustard)] mb-3">Custom Physics Properties (Optional)</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm text-gray-400 mb-1">Magnitude</label>
                                                    <input
                                                        type="number"
                                                        value={customProperties.magnitude}
                                                        onChange={e => setCustomProperties(prev => ({...prev, magnitude: e.target.value}))}
                                                        placeholder="Auto-generated"
                                                        className="w-full bg-[var(--ink)] text-white border border-gray-700 rounded-xl p-2 focus:border-[var(--mustard)] transition-colors text-sm"
                                                        disabled={isMinting}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-400 mb-1">Duration (s)</label>
                                                    <input
                                                        type="number"
                                                        value={customProperties.duration}
                                                        onChange={e => setCustomProperties(prev => ({...prev, duration: e.target.value}))}
                                                        placeholder="Auto-generated"
                                                        className="w-full bg-[var(--ink)] text-white border border-gray-700 rounded-xl p-2 focus:border-[var(--mustard)] transition-colors text-sm"
                                                        disabled={isMinting}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-400 mb-1">Range (m)</label>
                                                    <input
                                                        type="number"
                                                        value={customProperties.range}
                                                        onChange={e => setCustomProperties(prev => ({...prev, range: e.target.value}))}
                                                        placeholder="Auto-generated"
                                                        className="w-full bg-[var(--ink)] text-white border border-gray-700 rounded-xl p-2 focus:border-[var(--mustard)] transition-colors text-sm"
                                                        disabled={isMinting}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-400 mb-1">Cooldown (s)</label>
                                                    <input
                                                        type="number"
                                                        value={customProperties.cooldown}
                                                        onChange={e => setCustomProperties(prev => ({...prev, cooldown: e.target.value}))}
                                                        placeholder="Auto-generated"
                                                        className="w-full bg-[var(--ink)] text-white border border-gray-700 rounded-xl p-2 focus:border-[var(--mustard)] transition-colors text-sm"
                                                        disabled={isMinting}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-400 mb-1">Energy Cost</label>
                                                    <input
                                                        type="number"
                                                        value={customProperties.energyCost}
                                                        onChange={e => setCustomProperties(prev => ({...prev, energyCost: e.target.value}))}
                                                        placeholder="Auto-generated"
                                                        className="w-full bg-[var(--ink)] text-white border border-gray-700 rounded-xl p-2 focus:border-[var(--mustard)] transition-colors text-sm"
                                                        disabled={isMinting}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                                            <div className="text-gray-300">Cost: <span className="text-[var(--mustard)] font-bold">10 HBAR</span></div>
                                            <button
                                                onClick={handleMint}
                                                disabled={isMinting || !name || !description}
                                                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                                                    isMinting || !name || !description
                                                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-[var(--mustard)] to-yellow-600 text-[var(--ink)] hover:opacity-90 shadow-lg'
                                                }`}
                                            >
                                                {isMinting ? 'Minting...' : 'Mint NFT'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}
                    </div>

                    {/* Footer */}
                    <footer className="text-center py-6 fade-in">
                        <p className="text-gray-500 text-sm">
                            © 2025 Physics NFT Marketplace – Powered by Hedera Blockchain
                        </p>
                    </footer>
                </main>
            </div>

            {/* Modal */}
            {showModal && selectedNFT && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 fade-in">
                    <div className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] rounded-2xl shadow-2xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-2xl font-bold text-[var(--mustard)]">{selectedNFT.name}</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all flex items-center justify-center"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <img src={selectedNFT.image} alt={selectedNFT.name} className="w-full rounded-lg" />
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-[var(--mustard)] mb-2">Details</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Token ID:</span>
                                            <span className="text-white">{selectedNFT.id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Serial:</span>
                                            <span className="text-white">#{selectedNFT.serialNumber}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Physics Type:</span>
                                            <span className="text-white">{PHYSICS_TYPE_NAMES[selectedNFT.physicsType]}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Rarity:</span>
                                            <span className={RARITY_COLORS[selectedNFT.rarity]}>{RARITY_NAMES[selectedNFT.rarity]}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Energy:</span>
                                            <span className="text-[var(--mustard)]">{selectedNFT.energy}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Price:</span>
                                            <span className="text-[var(--mustard)] font-bold">{selectedNFT.price} HBAR</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-[var(--mustard)] mb-2">Physics Properties</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Magnitude:</span>
                                            <span className="text-white">{selectedNFT.properties.magnitude}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Duration:</span>
                                            <span className="text-white">{selectedNFT.properties.duration}s</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Range:</span>
                                            <span className="text-white">{selectedNFT.properties.range}m</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Cooldown:</span>
                                            <span className="text-white">{selectedNFT.properties.cooldown}s</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Energy Cost:</span>
                                            <span className="text-white">{selectedNFT.properties.energyCost}</span>
                                        </div>
                                        <div className="mt-2">
                                            <span className="text-gray-400 block mb-1">Compatible with:</span>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedNFT.properties.compatibility.map((comp, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-[var(--mustard)]/20 rounded text-xs text-[var(--mustard)]">{comp}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4">
                                    {userNFTs.includes(selectedNFT.id) ? (
                                        <button
                                            disabled
                                            className="w-full px-6 py-3 rounded-xl font-semibold bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed"
                                        >
                                            Owned
                                        </button>
                                    ) : selectedNFT.isForSale ? (
                                        <button
                                            onClick={() => { setShowModal(false); buyNFT(selectedNFT) }}
                                            disabled={!isConnected || txLoading}
                                            className="w-full px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-[var(--mustard)] to-yellow-600 text-[var(--ink)] hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {txLoading ? 'Processing...' : `Buy for ${selectedNFT.price} HBAR`}
                                        </button>
                                    ) : (
                                        <button
                                            disabled
                                            className="w-full px-6 py-3 rounded-xl font-semibold border border-gray-700 text-gray-500 cursor-not-allowed"
                                        >
                                            Not For Sale
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Marketplace
