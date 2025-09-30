import React from 'react'
import { motion } from 'framer-motion'
import { useBlockchain } from '@contexts/BlockchainContext'
import { useWallet } from '@hooks/useWallet'
import LoadingSpinner from '@components/common/LoadingSpinner'
import Button from '@components/common/Button'

interface ConnectionStatusProps {
  className?: string
  showDetails?: boolean
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  className = '',
  showDetails = false
}) => {
  const { state: blockchainState, refreshConnection } = useBlockchain()
  const { connect, disconnect, isConnected } = useWallet()

  if (blockchainState.isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <LoadingSpinner size="sm" />
        <span className="text-sm text-gray-400">Connecting...</span>
      </div>
    )
  }

  if (blockchainState.error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center gap-2 ${className}`}
      >
        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
        <span className="text-sm text-red-400">Connection Error</span>
        {showDetails && (
          <Button
            variant="secondary"
            size="sm"
            onClick={refreshConnection}
            className="ml-2"
          >
            Retry
          </Button>
        )}
      </motion.div>
    )
  }

  if (!isConnected) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        <span className="text-sm text-gray-400">Not Connected</span>
        {showDetails && (
          <Button
            variant="quantum"
            size="sm"
            onClick={() => connect()}
            className="ml-2"
          >
            Connect
          </Button>
        )}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-2 ${className}`}
    >
      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      <span className="text-sm text-green-400">Connected</span>

      {showDetails && blockchainState.account && (
        <div className="flex items-center gap-2 ml-2">
          <span className="text-xs text-gray-400">
            {blockchainState.account.substring(0, 8)}...
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={disconnect}
          >
            Disconnect
          </Button>
        </div>
      )}
    </motion.div>
  )
}

export default ConnectionStatus