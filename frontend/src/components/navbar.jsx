// components/Navbar.jsx
import React from 'react';
import { useWallet } from '../hooks/useWallet';

const Navbar = () => {
  const { 
    isConnected, 
    connectedAccount, 
    connectWallet, 
    disconnectWallet,
    connectionState 
  } = useWallet();

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

  const getButtonText = () => {
    if (connectionState === 'Connecting') return 'Connecting...';
    if (isConnected) return `Disconnect (${formatAccountId(connectedAccount)})`;
    return 'Connect Wallet';
  };

  const getButtonClass = () => {
    const baseClass = "px-4 py-2 rounded transition-colors font-medium";
    
    if (connectionState === 'Connecting') {
      return `${baseClass} bg-yellow-500 text-white cursor-not-allowed`;
    }
    
    if (isConnected) {
      return `${baseClass} bg-green-500 text-white hover:bg-green-600`;
    }
    
    return `${baseClass} border-2 border-white text-white hover:bg-white hover:text-blue-500`;
  };

  return (
    <nav className="bg-blue-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white font-bold text-xl">QuantumVerse</div>
        <ul className="flex space-x-4 items-center">
          <li><a href="#" className="text-white hover:text-gray-200">Home</a></li>
          <li><a href="#" className="text-white hover:text-gray-200">About</a></li>
          <li><a href="#" className="text-white hover:text-gray-200">Contact</a></li>
          
          {/* Connection Status Indicator */}
          {connectionState !== 'Disconnected' && (
            <li className="text-white text-sm">
              Status: {connectionState}
            </li>
          )}
          
          <button 
            onClick={handleWalletAction}
            disabled={connectionState === 'Connecting'}
            className={getButtonClass()}
          >
            {getButtonText()}
          </button>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
