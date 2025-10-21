import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../Context/WalletContext';

const RealityType = {
  VIRTUAL: 'Virtual',
  AUGMENTED: 'Augmented',
  PHYSICAL: 'Physical',
  MIXED: 'Mixed'
};

const Portal = () => {
  const {
    isConnected,
    connectedAccount,
    connectWallet,
    disconnectWallet,
    connectionState
  } = useWallet();

  const [currentReality, setCurrentReality] = useState(RealityType.VIRTUAL);
  const [selectedPortal, setSelectedPortal] = useState(null);
  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);


  const entanglementCount = 8;

  const portals = [
    {
      id: 'virtual-metaverse',
      name: 'QuantumVerse Metaverse',
      type: RealityType.VIRTUAL,
      description: 'Immersive virtual worlds with full physics simulation',
      isActive: true,
      connectedUsers: 2847,
      features: ['Full-body avatars', 'Physics manipulation', 'AI companions', 'Virtual economies'],
      icon: '🌐',
      gradient: 'from-purple-500 to-blue-500'
    },
    {
      id: 'ar-overlay',
      name: 'Reality Augmentation',
      type: RealityType.AUGMENTED,
      description: 'Overlay digital assets onto the physical world',
      isActive: true,
      connectedUsers: 1523,
      features: ['Spatial anchoring', 'Object recognition', 'Gesture control', 'Social AR'],
      icon: '👓',
      gradient: 'from-cyan-500 to-teal-500'
    },
    {
      id: 'physical-integration',
      name: 'Physical Integration',
      type: RealityType.PHYSICAL,
      description: 'Connect IoT devices and real-world sensors',
      isActive: true,
      connectedUsers: 894,
      features: ['IoT connectivity', 'Sensor fusion', 'Real-world physics', 'Smart contracts'],
      icon: '🏠',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 'mixed-reality',
      name: 'Quantum Mixed Reality',
      type: RealityType.MIXED,
      description: 'Seamlessly blend all reality types with quantum entanglement',
      isActive: true,
      connectedUsers: 567,
      features: ['Reality bridging', 'Quantum sync', 'Cross-platform', 'Unified experience'],
      icon: '🌌',
      gradient: 'from-pink-500 to-purple-500'
    }
  ];

  const handleWalletAction = async () => {
    try {
      if (isConnected) {
        disconnectWallet();
      } else {
        await connectWallet();
      }
    } catch (error) {
      alert('Wallet connection error');
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
    const baseClass = 'px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5';
    if (connectionState === 'Connecting') return `${baseClass} bg-yellow-500 text-white cursor-not-allowed`;
    if (isConnected) return `${baseClass} bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700`;
    return `${baseClass} bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:opacity-90`;
  };

  const handlePortalTransition = (portal) => {
    setSelectedPortal(portal);
    setShowTransitionModal(true);
  };

  const executeTransition = async () => {
    if (!selectedPortal) return;
    setIsTransitioning(true);
    await new Promise(res => setTimeout(res, 3000));
    setCurrentReality(selectedPortal.type);
    setIsTransitioning(false);
    setShowTransitionModal(false);
    setSelectedPortal(null);
  };

  const getRealityColor = (reality) => {
    switch (reality) {
      case RealityType.VIRTUAL: return 'text-purple-400';
      case RealityType.AUGMENTED: return 'text-cyan-400';
      case RealityType.PHYSICAL: return 'text-green-400';
      case RealityType.MIXED: return 'text-pink-400';
      default: return 'text-gray-400';
    }
  };

  const getCurrentPortal = () => portals.find(p => p.type === currentReality);

  return (
    <div className="space-y-6">
      {/* Status Header and Wallet */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-xl bg-gradient-to-br from-gray-900 to-black border border-gray-700 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="text-4xl">{getCurrentPortal()?.icon}</div>
          <div>
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Reality Portal</div>
            <div className="text-lg text-gray-400">{getCurrentPortal()?.name}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
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
          <button
            onClick={handleWalletAction}
            disabled={connectionState === 'Connecting'}
            className={getWalletButtonClass()}
          >
            {getWalletButtonText()}
          </button>
        </div>
      </div>

      {/* Portal Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="text-center bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-2xl shadow border border-purple-800">
          <div className="text-3xl mb-2">🌐</div>
          <div className="text-2xl font-bold text-yellow-300">
            {portals.filter(p => p.isActive).length}
          </div>
          <div className="text-sm text-gray-400">Active Portals</div>
        </div>
        <div className="text-center bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl shadow border border-blue-800">
          <div className="text-3xl mb-2">👥</div>
          <div className="text-2xl font-bold text-blue-300">
            {portals.reduce((sum, p) => sum + p.connectedUsers, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">Connected Users</div>
        </div>
        <div className="text-center bg-gradient-to-br from-pink-600 to-pink-900 p-6 rounded-2xl shadow border border-pink-800">
          <div className="text-3xl mb-2">🌌</div>
          <div className="text-2xl font-bold text-pink-200">{entanglementCount}</div>
          <div className="text-sm text-gray-400">Entanglements</div>
        </div>
        <div className="text-center bg-gradient-to-br from-green-600 to-green-900 p-6 rounded-2xl shadow border border-green-800">
          <div className="text-3xl mb-2">⚡</div>
          <div className="text-2xl font-bold text-green-300">99.9%</div>
          <div className="text-sm text-gray-400">Sync Reliability</div>
        </div>
      </div>

      {/* Portal Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {portals.map((portal) => (
          <motion.div
            key={portal.id}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className={`relative overflow-hidden cursor-pointer transition-all duration-300 
              ${currentReality === portal.type ? 'ring-2 ring-purple-400' : ''}`}
            onClick={() => handlePortalTransition(portal)}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${portal.gradient} opacity-10`} />
            {currentReality === portal.type && (
              <div className="absolute top-4 right-4 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            )}
            <div className="relative z-10 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl">{portal.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{portal.name}</h3>
                  <p className={`font-semibold ${getRealityColor(portal.type)}`}>
                    {portal.type} Reality
                  </p>
                </div>
              </div>
              <p className="text-gray-400 mb-6">{portal.description}</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Connected Users:</span>
                  <span className="font-semibold">{portal.connectedUsers.toLocaleString()}</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {portal.features.map((feature, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-gray-700 rounded-full">{feature}</span>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-700">
                  <button
                    className={`w-full rounded-xl px-4 py-2 font-semibold
                      ${currentReality === portal.type
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-400 to-blue-400 text-white hover:from-blue-400 hover:to-purple-400'
                      }`}
                    disabled={currentReality === portal.type}
                  >
                    {currentReality === portal.type ? 'Current Reality' : 'Enter Portal'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Transition Modal */}
      <AnimatePresence>
        {showTransitionModal && selectedPortal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-10 shadow-xl w-full max-w-lg"
              initial={{ scale: 0.95, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 40 }}
            >
              {!isTransitioning ? (
                <>
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">{selectedPortal.icon}</div>
                    <h3 className="text-2xl font-bold mb-2">{selectedPortal.name}</h3>
                    <p className={`font-semibold mb-4 ${getRealityColor(selectedPortal.type)}`}>
                      {selectedPortal.type} Reality
                    </p>
                    <p className="text-gray-400">{selectedPortal.description}</p>
                  </div>
                  <div className="p-4 bg-gray-800/70 border border-purple-500/30 rounded-lg mb-6">
                    <h4 className="font-semibold text-purple-300 mb-3">🔄 Transition Process</h4>
                    <ul className="text-gray-300 space-y-1 text-left list-disc pl-5">
                      <li>Synchronizing quantum states across realities</li>
                      <li>Preserving asset integrity and ownership</li>
                      <li>Establishing secure connection protocols</li>
                      <li>Activating reality-specific features</li>
                    </ul>
                  </div>
                  <div className="flex gap-3">
                    <button
                      className="flex-1 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90"
                      onClick={executeTransition}
                    >
                      Begin Transition
                    </button>
                    <button
                      className="flex-1 px-6 py-3 rounded-xl font-bold border border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200"
                      onClick={() => setShowTransitionModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 mx-auto border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-2xl">
                      {selectedPortal.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Transitioning to {selectedPortal.type} Reality</h3>
                  <p className="text-gray-400 mb-6">
                    Quantum entanglement in progress... Your assets are being synchronized.
                  </p>
                  <div className="space-y-2">
                    <div className="text-sm text-purple-400">Synchronizing quantum states...</div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        className="bg-purple-400 h-2 rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 3, ease: 'easeInOut' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Portal;
