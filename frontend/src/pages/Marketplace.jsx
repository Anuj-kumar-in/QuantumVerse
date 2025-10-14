import React, { useState, useEffect, useCallback } from 'react'
import { 
    TokenAssociateTransaction,
    TokenMintTransaction,
    TransferTransaction,
    TokenId,
    AccountId,
    Hbar
    } from '@hashgraph/sdk'
    import { useWallet } from '../hooks/useWallet'

    
    
    const PHYSICS_PROPERTIES = [
    { name: 'Mass', unit: 'kg', min: 0.1, max: 100 },
    { name: 'Velocity', unit: 'm/s', min: 1, max: 50 },
    { name: 'Energy', unit: 'J', min: 10, max: 1000 },
    { name: 'Momentum', unit: 'kg⋅m/s', min: 5, max: 500 },
    { name: 'Temperature', unit: 'K', min: 273, max: 2000 }
    ]

    
    const AUTHORIZED_MINTERS = [
    '0.0.6896538', // example admin account
    ]

    
    const PHYSICS_NFT_TOKEN_ID = import.meta.env.VITE_PHYSICS_NFT_TOKEN_ID || '0.0.1000001'
    const TREASURY_ID = import.meta.env.VITE_TREASURY_ID || '0.0.123456'

    
    const generatePhysicsNFT = (id) => {
    const properties = {}
    PHYSICS_PROPERTIES.forEach(prop => {
        properties[prop.name.toLowerCase()] = {
        value: (Math.random() * (prop.max - prop.min) + prop.min).toFixed(2),
        unit: prop.unit
        }
    })
    return {
        id: `0.0.${1000000 + id}`,
        serialNumber: id,
        name: `Physics Object #${id}`,
        description: `A unique physics-based NFT with quantum properties`,
        image: `https://via.placeholder.com/300x300/4F46E5/FFFFFF?text=PX${id}`,
        price: (Math.random() * 50 + 10).toFixed(2),
        properties,
        rarity: ['Common', 'Rare', 'Epic', 'Legendary'][Math.floor(Math.random() * 4)],
        owner: `0.0.${Math.floor(Math.random() * 1000000) + 100000}`,
        isForSale: Math.random() > 0.3,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }
    }

    
    const Card = ({ children, className = '', variant = 'default', gradient = false }) => {
    const baseClasses = 'rounded-lg border p-6 transition-all duration-300'
    const variantClasses = {
        default: 'bg-gray-900 border-gray-700',
        physics: 'bg-blue-900/20 border-blue-500/30',
        quantum: 'bg-purple-900/20 border-purple-500/30',
        ai: 'bg-green-900/20 border-green-500/30',
        carbon: 'bg-emerald-900/20 border-emerald-500/30'
    }
    const gradientClass = gradient ? 'bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20' : ''
    return (
        <div className={`${baseClasses} ${variantClasses[variant]} ${gradientClass} ${className}`}>
        {children}
        </div>
    )
    }

    const Button = ({ children, onClick, variant = 'default', size = 'md', disabled = false, className = '' }) => {
    const baseClasses = 'font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2'
    const sizeClasses = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-base', lg: 'px-6 py-3 text-lg' }
    const variantClasses = {
        default: 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500',
        physics: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        quantum: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500',
        ai: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
        carbon: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500',
        secondary: 'bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800 focus:ring-gray-500'
    }
    return (
        <button onClick={onClick} disabled={disabled} className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}>
        {children}
        </button>
    )
    }

    const Loader = ({ size = 'md' }) => {
    const sizeClasses = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
    return <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-blue-300 border-t-blue-600`}></div>
    }

    const NFTCard = ({ nft, onBuy, onView, isOwned, isConnected, loading }) => {
    const rarityColors = { Common: 'text-gray-400', Rare: 'text-blue-400', Epic: 'text-purple-400', Legendary: 'text-yellow-400' }
    return (
        <Card variant="physics" className="hover:shadow-xl transition-shadow duration-300">
        <div className="aspect-square mb-4 overflow-hidden rounded-lg bg-gray-800">
            <img src={nft.image} alt={nft.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="space-y-3">
            <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-white truncate">{nft.name}</h3>
            <span className={`text-sm font-medium ${rarityColors[nft.rarity]}`}>{nft.rarity}</span>
            </div>
            <p className="text-gray-400 text-sm line-clamp-2">{nft.description}</p>
            <div className="space-y-1">
            <h4 className="text-sm font-medium text-blue-300">Properties:</h4>
            <div className="grid grid-cols-2 gap-1 text-xs">
                {Object.entries(nft.properties).slice(0, 4).map(([key, prop]) => (
                <div key={key} className="text-gray-400"><span className="capitalize">{key}:</span> {prop.value} {prop.unit}</div>
                ))}
            </div>
            </div>
            <div className="pt-3 border-t border-gray-700">
            <div className="flex justify-between items-center">
                <div>
                <div className="text-lg font-bold text-white">{nft.price} HBAR</div>
                <div className="text-xs text-gray-400">Serial #{nft.serialNumber}</div>
                </div>
                <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => onView(nft)}>View</Button>
                {!isOwned && nft.isForSale && (
                    <Button variant="physics" size="sm" onClick={() => onBuy(nft)} disabled={!isConnected || loading}>
                    {loading ? <Loader size="sm" /> : 'Buy'}
                    </Button>
                )}
                {isOwned && (<Button variant="quantum" size="sm" disabled>Owned</Button>)}
                </div>
            </div>
            </div>
        </div>
        </Card>
    )
    }

    const FilterPanel = ({ filters, onFilterChange, nftCount }) => (
    <Card variant="default" className="mb-6">
        <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Filters ({nftCount} items)</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Price Range (HBAR)</label>
            <div className="flex gap-2">
                <input type="number" placeholder="Min" value={filters.priceMin} onChange={(e) => onFilterChange({ priceMin: e.target.value })} className="w-full px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm" />
                <input type="number" placeholder="Max" value={filters.priceMax} onChange={(e) => onFilterChange({ priceMax: e.target.value })} className="w-full px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm" />
            </div>
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Rarity</label>
            <select value={filters.rarity} onChange={(e) => onFilterChange({ rarity: e.target.value })} className="w-full px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm">
                <option value="">All</option>
                <option value="Common">Common</option>
                <option value="Rare">Rare</option>
                <option value="Epic">Epic</option>
                <option value="Legendary">Legendary</option>
            </select>
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Availability</label>
            <select value={filters.availability} onChange={(e) => onFilterChange({ availability: e.target.value })} className="w-full px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm">
                <option value="">All</option>
                <option value="forSale">For Sale</option>
                <option value="owned">Owned</option>
            </select>
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
            <select value={filters.sortBy} onChange={(e) => onFilterChange({ sortBy: e.target.value })} className="w-full px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="rarity">Rarity</option>
            </select>
            </div>
        </div>
        <div>
            <input type="text" placeholder="Search NFTs..." value={filters.search} onChange={(e) => onFilterChange({ search: e.target.value })} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white" />
        </div>
        </div>
    </Card>
    )

    
    const Dashboard = ({ isConnected, connectedAccount, nfts, userNFTs, onGoTo }) => {
    const stats = {
        total: nfts.length,
        forSale: nfts.filter(n => n.isForSale).length,
        owned: userNFTs.length,
        floor: nfts.filter(n => n.isForSale).reduce((m, n) => Math.min(m, parseFloat(n.price)), Infinity)
    }
    return (
        <div className="space-y-6">
        <Card variant="physics" gradient className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">QuantumVerse Dashboard</h2>
            <p className="text-gray-300">{isConnected ? `Connected: ${connectedAccount}` : 'Connect wallet to see personalized stats'}</p>
        </Card>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card variant="physics" className="text-center"><div className="text-2xl font-bold text-blue-400">{stats.total}</div><div className="text-sm text-gray-400">Total NFTs</div></Card>
            <Card variant="quantum" className="text-center"><div className="text-2xl font-bold text-purple-400">{stats.forSale}</div><div className="text-sm text-gray-400">For Sale</div></Card>
            <Card variant="ai" className="text-center"><div className="text-2xl font-bold text-green-400">{stats.owned}</div><div className="text-sm text-gray-400">Owned</div></Card>
            <Card variant="default" className="text-center"><div className="text-2xl font-bold text-white">{stats.floor === Infinity ? '-' : stats.floor}</div><div className="text-sm text-gray-400">Floor (HBAR)</div></Card>
        </div>
        <div className="flex gap-3">
            <Button variant="physics" onClick={() => onGoTo('shop')}>Go to Shop</Button>
            <Button variant="quantum" onClick={() => onGoTo('mint')}>Mint NFT</Button>
            <Button variant="secondary" onClick={() => onGoTo('owned')}>Owned NFTs</Button>
        </div>
        </div>
    )
    }

    const MintNFT = ({ connectedAccount, isConnected, onMinted }) => {
    const authorized = isConnected && AUTHORIZED_MINTERS.includes(connectedAccount)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [isMinting, setIsMinting] = useState(false)

    const costHBAR = 10 

    const createMetadata = () => {
        
        const meta = {
        name,
        description,
        createdAt: new Date().toISOString(),
        creator: connectedAccount
        }
        return Buffer.from(JSON.stringify(meta))
    }

    const handleMint = async () => {
        if (!authorized) return alert('Not authorized to mint')
        if (!name || !description) return alert('Name and description required')

        setIsMinting(true)
        try {
        
        const receiptPay = await sendHbarOnChain(connectedAccount, TREASURY_ID, costHBAR)
        if (receiptPay.status && receiptPay.status._code !== 22) {
            
            throw new Error('Payment failed')
        }

        
        const signer = getSignerOnChain(connectedAccount)
        const mintTx = await new TokenMintTransaction()
            .setTokenId(TokenId.fromString(PHYSICS_NFT_TOKEN_ID))
            .setMetadata([createMetadata()])
            .freezeWithSigner(signer)
        const mintRes = await mintTx.executeWithSigner(signer)
        const mintRcpt = await mintRes.getReceiptWithSigner(signer)

        onMinted && onMinted({ serial: mintRcpt.serials?.[0]?.toString?.() || '1', name })
        alert('Mint success! Serial: ' + (mintRcpt.serials?.[0] || '1'))

        } catch (e) {
        console.error(e)
        alert('Mint failed: ' + (e.message || e))
        } finally {
        setIsMinting(false)
        }
    }

    
    const { sendHbar: sendHbarHook, getSigner } = useWallet()
    const sendHbarOnChain = async (fromId, toId, amount) => {
        
        return await sendHbarHook(toId, amount)
    }
    const getSignerOnChain = () => getSigner()

    if (!isConnected) return <Card variant="default" className="text-center py-10">Connect wallet to mint.</Card>
    if (!authorized) return <Card variant="default" className="text-center py-10">You are not authorized to mint.</Card>

    return (
        <Card variant="default" className="space-y-4">
        <h3 className="text-xl font-bold text-white">Mint Physics NFT (10 HBAR)</h3>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="NFT Name" className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white" />
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" rows={3} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white" />
        <div className="flex items-center justify-between">
            <div className="text-gray-300">Cost: <span className="text-blue-400 font-bold">{costHBAR} HBAR</span></div>
            <Button variant="physics" onClick={handleMint} disabled={isMinting || !name || !description}>{isMinting ? 'Minting...' : 'Mint NFT'}</Button>
        </div>
        </Card>
    )
    }

    const OwnedNFTs = ({ nfts, connectedAccount }) => {
    const owned = nfts.filter(n => n.owner === connectedAccount)
    return (
        <div className="space-y-4">
        <h3 className="text-2xl font-bold">Owned Physics NFTs</h3>
        {owned.length === 0 ? (
            <Card variant="default">No owned NFTs yet.</Card>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {owned.map(n => <NFTCard key={n.id} nft={n} onBuy={() => {}} onView={() => {}} isOwned={true} isConnected={true} loading={false} />)}
            </div>
        )}
        </div>
    )}

    
    export const Marketplace = () => {
    const { isConnected, connectedAccount, getSigner, connectWallet, sendHbar } = useWallet()

    const [section, setSection] = useState('shop') 
    const [isLoading, setIsLoading] = useState(true)
    const [nfts, setNfts] = useState([])
    const [userNFTs, setUserNFTs] = useState([])
    const [error, setError] = useState(null)
    const [txLoading, setTxLoading] = useState(false)
    const [selectedNFT, setSelectedNFT] = useState(null)
    const [showModal, setShowModal] = useState(false)

    const [filters, setFilters] = useState({ priceMin: '', priceMax: '', rarity: '', availability: '', sortBy: 'newest', search: '' })

    useEffect(() => {
        const load = async () => {
        setIsLoading(true)
        try {
            await new Promise(r => setTimeout(r, 800))
            const mock = Array.from({ length: 24 }, (_, i) => generatePhysicsNFT(i + 1))
            setNfts(mock)
            if (isConnected && connectedAccount) {
            const owned = mock.filter(() => Math.random() > 0.8).slice(0, 3)
            setUserNFTs(owned.map(n => n.id))
            }
        } catch (e) {
            console.error(e)
            setError('Failed to load marketplace. Please try again.')
        } finally {
            setIsLoading(false)
        }
        }
        load()
    }, [isConnected, connectedAccount])

    const filteredNFTs = useCallback(() => {
        let filtered = [...nfts]
        if (filters.priceMin) filtered = filtered.filter(n => parseFloat(n.price) >= parseFloat(filters.priceMin))
        if (filters.priceMax) filtered = filtered.filter(n => parseFloat(n.price) <= parseFloat(filters.priceMax))
        if (filters.rarity) filtered = filtered.filter(n => n.rarity === filters.rarity)
        if (filters.availability === 'forSale') filtered = filtered.filter(n => n.isForSale && !userNFTs.includes(n.id))
        if (filters.availability === 'owned') filtered = filtered.filter(n => userNFTs.includes(n.id))
        if (filters.search) filtered = filtered.filter(n => n.name.toLowerCase().includes(filters.search.toLowerCase()) || n.description.toLowerCase().includes(filters.search.toLowerCase()))
        switch (filters.sortBy) {
        case 'priceHigh': filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price)); break
        case 'priceLow': filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price)); break
        case 'oldest': filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break
        case 'rarity': {
            const order = { Legendary: 4, Epic: 3, Rare: 2, Common: 1 }
            filtered.sort((a, b) => order[b.rarity] - order[a.rarity])
            break
        }
        default: filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        }
        return filtered
    }, [nfts, filters, userNFTs])

    const handleFilterChange = (nf) => setFilters(prev => ({ ...prev, ...nf }))

    const buyNFT = async (nft) => {
        if (!isConnected) { await connectWallet(); return }
        setTxLoading(true)
        try {
        await sendHbar(nft.owner, parseFloat(nft.price))
        setUserNFTs(prev => [...prev, nft.id])
        setNfts(prev => prev.map(n => n.id === nft.id ? { ...n, isForSale: false, owner: connectedAccount } : n))
        alert(`Purchased ${nft.name} for ${nft.price} HBAR`)
        } catch (e) {
        console.error(e); alert(`Purchase failed: ${e.message}`)
        } finally { setTxLoading(false) }
    }

    const viewNFT = (nft) => { setSelectedNFT(nft); setShowModal(true) }

    const onMinted = ({ serial, name }) => {
        
        const fresh = generatePhysicsNFT(nfts.length + 1)
        fresh.name = name || fresh.name
        fresh.owner = connectedAccount
        fresh.isForSale = false
        setNfts(prev => [fresh, ...prev])
    }

    const stats = {
        totalNFTs: nfts.length,
        forSale: nfts.filter(n => n.isForSale).length,
        owned: userNFTs.length,
        totalValue: nfts.reduce((s, n) => s + parseFloat(n.price), 0).toFixed(1),
        floorPrice: nfts.filter(n => n.isForSale).reduce((m, n) => Math.min(m, parseFloat(n.price)), Infinity).toFixed(1)
    }

    const displayedNFTs = filteredNFTs()

    if (isLoading) return (
        <div className="min-h-screen bg-gray-950 text-white p-8 flex items-center justify-center">
        <div className="text-center"><Loader size="lg" /><p className="mt-4 text-gray-400">Loading QuantumVerse Marketplace...</p></div>
        </div>
    )

    if (error) return (
        <div className="min-h-screen bg-gray-950 text-white p-8 flex items-center justify-center">
        <Card variant="quantum" className="text-center p-8">
            <div className="text-red-400 text-lg mb-4">⚠️ Error</div>
            <p className="text-gray-300 mb-4">{error}</p>
            <Button variant="physics" onClick={() => window.location.reload()}>Retry</Button>
        </Card>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-950 text-white">
        {}
        <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 p-8">
            <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-5xl font-bold mb-4">QuantumVerse <span className="text-blue-400">Marketplace</span></h1>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">Trade physics properties and quantum assets on Hedera Hashgraph</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mb-6">
                <Button variant={section==='dashboard'?'physics':'secondary'} onClick={()=>setSection('dashboard')}>Dashboard</Button>
                <Button variant={section==='shop'?'physics':'secondary'} onClick={()=>setSection('shop')}>Shop</Button>
                <Button variant={section==='owned'?'physics':'secondary'} onClick={()=>setSection('owned')}>Owned</Button>
                <Button variant={section==='mint'?'quantum':'secondary'} onClick={()=>setSection('mint')}>Mint NFT</Button>
            </div>
            <div className="flex justify-center mb-2">
                {isConnected ? (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg px-4 py-2">
                    <span className="text-green-400">Connected: {connectedAccount?.slice(0,8)}...{connectedAccount?.slice(-4)}</span>
                </div>
                ) : (
                <Button variant="physics" size="lg" onClick={connectWallet}>Connect Wallet</Button>
                )}
            </div>
            {}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card variant="physics" className="text-center"><div className="text-2xl font-bold text-blue-400">{stats.totalNFTs}</div><div className="text-sm text-gray-400">Total NFTs</div></Card>
                <Card variant="quantum" className="text-center"><div className="text-2xl font-bold text-purple-400">{stats.forSale}</div><div className="text-sm text-gray-400">For Sale</div></Card>
                <Card variant="ai" className="text-center"><div className="text-2xl font-bold text-green-400">{stats.owned}</div><div className="text-sm text-gray-400">Owned</div></Card>
                <Card variant="carbon" className="text-center"><div className="text-2xl font-bold text-emerald-400">{stats.totalValue}</div><div className="text-sm text-gray-400">Total Value (HBAR)</div></Card>
                <Card variant="default" className="text-center"><div className="text-2xl font-bold text-white">{stats.floorPrice}</div><div className="text-sm text-gray-400">Floor Price (HBAR)</div></Card>
            </div>
            </div>
        </div>

        {}
        <div className="max-w-7xl mx-auto p-8">
            {section === 'dashboard' && (
            <Dashboard isConnected={isConnected} connectedAccount={connectedAccount} nfts={nfts} userNFTs={userNFTs} onGoTo={setSection} />
            )}

            {section === 'mint' && (
            <MintNFT isConnected={isConnected} connectedAccount={connectedAccount} onMinted={onMinted} />
            )}

            {section === 'owned' && (
            <OwnedNFTs nfts={nfts} connectedAccount={connectedAccount} />
            )}

            {section === 'shop' && (
            <>
                <FilterPanel filters={filters} onFilterChange={handleFilterChange} nftCount={displayedNFTs.length} />
                {displayedNFTs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayedNFTs.map((nft) => (
                    <NFTCard key={nft.id} nft={nft} onBuy={buyNFT} onView={viewNFT} isOwned={userNFTs.includes(nft.id)} isConnected={isConnected} loading={txLoading} />
                    ))}
                </div>
                ) : (
                <Card variant="default" className="text-center py-12">
                    <div className="text-gray-400 text-lg">No NFTs found matching your criteria</div>
                    <Button variant="secondary" className="mt-4" onClick={() => setFilters({ priceMin: '', priceMax: '', rarity: '', availability: '', sortBy: 'newest', search: '' })}>Clear Filters</Button>
                </Card>
                )}
            </>
            )}
        </div>

        {}
        {showModal && selectedNFT && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <Card variant="physics" className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-white">{selectedNFT.name}</h2>
                <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>✕</Button>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                <div><img src={selectedNFT.image} alt={selectedNFT.name} className="w-full rounded-lg" /></div>
                <div className="space-y-4">
                    <div>
                    <h3 className="text-lg font-semibold text-blue-300 mb-2">Details</h3>
                    <div className="space-y-2 text-sm">
                        <div><span className="text-gray-400">Token ID:</span> {selectedNFT.id}</div>
                        <div><span className="text-gray-400">Serial:</span> #{selectedNFT.serialNumber}</div>
                        <div><span className="text-gray-400">Rarity:</span> {selectedNFT.rarity}</div>
                        <div><span className="text-gray-400">Owner:</span> {selectedNFT.owner}</div>
                        <div><span className="text-gray-400">Price:</span> {selectedNFT.price} HBAR</div>
                    </div>
                    </div>
                    <div>
                    <h3 className="text-lg font-semibold text-blue-300 mb-2">Physics Properties</h3>
                    <div className="space-y-2 text-sm">
                        {Object.entries(selectedNFT.properties).map(([key, prop]) => (
                        <div key={key} className="flex justify-between"><span className="text-gray-400 capitalize">{key}:</span><span className="text-white">{prop.value} {prop.unit}</span></div>
                        ))}
                    </div>
                    </div>
                    <div className="pt-4">
                    {userNFTs.includes(selectedNFT.id) ? (
                        <Button variant="quantum" className="w-full" disabled>Owned</Button>
                    ) : selectedNFT.isForSale ? (
                        <Button variant="physics" className="w-full" onClick={() => { setShowModal(false); buyNFT(selectedNFT) }} disabled={!isConnected || txLoading}>{txLoading ? <Loader size="sm" /> : `Buy for ${selectedNFT.price} HBAR`}</Button>
                    ) : (
                        <Button variant="secondary" className="w-full" disabled>Not For Sale</Button>
                    )}
                    </div>
                </div>
                </div>
            </Card>
            </div>
        )}
        </div>
    )
}

export default Marketplace