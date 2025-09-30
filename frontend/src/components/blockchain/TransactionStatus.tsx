import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { blockchainService } from '@services/blockchain'
import LoadingSpinner from '@components/common/LoadingSpinner'
import Button from '@components/common/Button'
import Card from '@components/common/Card'

interface TransactionStatusProps {
  txHash: string | null
  onClose?: () => void
  description?: string
}

const TransactionStatus: React.FC<TransactionStatusProps> = ({
  txHash,
  onClose,
  description = 'Processing transaction'
}) => {
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'failed'>('pending')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!txHash) return

    const checkTransactionStatus = async () => {
      try {
        const receipt = await blockchainService.waitForTransaction(txHash)

        if (receipt.status === 1) {
          setStatus('confirmed')
        } else {
          setStatus('failed')
          setError('Transaction failed')
        }
      } catch (error) {
        console.error('Transaction failed:', error)
        setStatus('failed')
        setError((error as Error).message)
      }
    }

    checkTransactionStatus()
  }, [txHash])

  if (!txHash) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 right-4 z-50 max-w-sm w-full"
      >
        <Card variant="quantum" className="p-4">
          <div className="flex items-start gap-3">
            {status === 'pending' && (
              <LoadingSpinner size="sm" color="quantum" />
            )}

            {status === 'confirmed' && (
              <div className="text-green-400 text-xl">✅</div>
            )}

            {status === 'failed' && (
              <div className="text-red-400 text-xl">❌</div>
            )}

            <div className="flex-1">
              <h4 className="font-semibold mb-1">
                {status === 'pending' && 'Transaction Pending'}
                {status === 'confirmed' && 'Transaction Confirmed'}
                {status === 'failed' && 'Transaction Failed'}
              </h4>

              <p className="text-sm text-gray-400 mb-2">
                {description}
              </p>

              {error && (
                <p className="text-sm text-red-400 mb-2">
                  {error}
                </p>
              )}

              <div className="flex items-center gap-2">
                <a
                  href={`https://hashscan.io/testnet/transaction/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-quantum-400 hover:text-quantum-300"
                >
                  View on Explorer
                </a>

                {(status === 'confirmed' || status === 'failed') && onClose && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onClose}
                    className="text-xs"
                  >
                    Close
                  </Button>
                )}
              </div>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-lg"
              >
                ×
              </button>
            )}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

export default TransactionStatus