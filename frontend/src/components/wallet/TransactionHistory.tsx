// import React, { useState, useEffect } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { useAccount } from '@hooks/useHedera'
// import { HederaTransaction, TransactionType, TransactionStatus } from '@types/hedera'
// import Card from '@components/common/Card'
// import Button from '@components/common/Button'
// import Loader from '@components/common/Loader'
// import { formatHbar, formatDate } from '@utils/formatters'

// export const TransactionHistory: React.FC = () => {
//   const account = useAccount()
//   const [transactions, setTransactions] = useState<HederaTransaction[]>([])
//   const [loading, setLoading] = useState(true)
//   const [filter, setFilter] = useState<TransactionType | 'ALL'>('ALL')
//   const [page, setPage] = useState(1)
//   const itemsPerPage = 10

//   useEffect(() => {
//     loadTransactions()
//   }, [account])

//   const loadTransactions = async () => {
//     if (!account) return

//     setLoading(true)
//     try {
//       // In a real implementation, this would fetch from Mirror Node API
//       const mockTransactions: HederaTransaction[] = [
//         {
//           transactionId: '0.0.123456@1234567890.123456789',
//           timestamp: new Date(Date.now() - 1000 * 60 * 30),
//           type: TransactionType.TOKEN_MINT,
//           status: TransactionStatus.SUCCESS,
//           amount: '0',
//           tokenId: '0.0.789012',
//           memo: 'Minted Physics NFT: Gravity Manipulator',
//           consensusTimestamp: '1234567890.123456789'
//         },
//         {
//           transactionId: '0.0.123456@1234567880.123456789',
//           timestamp: new Date(Date.now() - 1000 * 60 * 60),
//           type: TransactionType.TRANSFER,
//           status: TransactionStatus.SUCCESS,
//           amount: '50.0',
//           memo: 'Purchased QUANTUM tokens',
//           consensusTimestamp: '1234567880.123456789'
//         },
//         {
//           transactionId: '0.0.123456@1234567870.123456789',
//           timestamp: new Date(Date.now() - 1000 * 60 * 90),
//           type: TransactionType.CONSENSUS_SUBMIT_MESSAGE,
//           status: TransactionStatus.SUCCESS,
//           amount: '0.001',
//           memo: 'Quantum entanglement sync',
//           consensusTimestamp: '1234567870.123456789'
//         },
//         {
//           transactionId: '0.0.123456@1234567860.123456789',
//           timestamp: new Date(Date.now() - 1000 * 60 * 120),
//           type: TransactionType.TOKEN_ASSOCIATE,
//           status: TransactionStatus.SUCCESS,
//           amount: '0',
//           tokenId: '0.0.345678',
//           memo: 'Associated CARBON token',
//           consensusTimestamp: '1234567860.123456789'
//         },
//         {
//           transactionId: '0.0.123456@1234567850.123456789',
//           timestamp: new Date(Date.now() - 1000 * 60 * 180),
//           type: TransactionType.SMART_CONTRACT_CALL,
//           status: TransactionStatus.SUCCESS,
//           amount: '1.0',
//           memo: 'AI Entity creation',
//           consensusTimestamp: '1234567850.123456789'
//         }
//       ]

//       setTransactions(mockTransactions)
//     } catch (error) {
//       console.error('Failed to load transactions:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const getTypeIcon = (type: TransactionType) => {
//     switch (type) {
//       case TransactionType.TRANSFER: return '💸'
//       case TransactionType.TOKEN_MINT: return '⚡'
//       case TransactionType.TOKEN_BURN: return '🔥'
//       case TransactionType.TOKEN_ASSOCIATE: return '🔗'
//       case TransactionType.TOKEN_DISSOCIATE: return '🔓'
//       case TransactionType.SMART_CONTRACT_CALL: return '📋'
//       case TransactionType.CONSENSUS_SUBMIT_MESSAGE: return '📡'
//       default: return '📄'
//     }
//   }

//   const getStatusColor = (status: TransactionStatus) => {
//     switch (status) {
//       case TransactionStatus.SUCCESS: return 'text-green-400'
//       case TransactionStatus.PENDING: return 'text-yellow-400'
//       case TransactionStatus.FAILED: return 'text-red-400'
//       default: return 'text-gray-400'
//     }
//   }

//   const filteredTransactions = transactions.filter(tx => 
//     filter === 'ALL' || tx.type === filter
//   )

//   const paginatedTransactions = filteredTransactions.slice(
//     (page - 1) * itemsPerPage,
//     page * itemsPerPage
//   )

//   const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)

//   if (!account) {
//     return (
//       <Card variant="default" className="text-center">
//         <p className="text-gray-400">Connect wallet to view transaction history</p>
//       </Card>
//     )
//   }

//   return (
//     <Card variant="quantum">
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h3 className="text-xl font-semibold font-quantum">Transaction History</h3>
//             <p className="text-gray-400">Recent activity on your account</p>
//           </div>

//           <Button
//             variant="secondary"
//             size="sm"
//             onClick={loadTransactions}
//             loading={loading}
//           >
//             🔄 Refresh
//           </Button>
//         </div>

//         {/* Filters */}
//         <div className="flex flex-wrap gap-2">
//           {['ALL', ...Object.values(TransactionType)].map((type) => (
//             <Button
//               key={type}
//               variant={filter === type ? 'quantum' : 'secondary'}
//               size="sm"
//               onClick={() => setFilter(type as any)}
//             >
//               {type.replace('_', ' ')}
//             </Button>
//           ))}
//         </div>

//         {/* Transaction List */}
//         {loading ? (
//           <div className="text-center py-8">
//             <Loader variant="quantum" text="Loading transactions..." />
//           </div>
//         ) : filteredTransactions.length === 0 ? (
//           <div className="text-center py-8">
//             <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
//               <span className="text-2xl">📄</span>
//             </div>
//             <p className="text-gray-400">No transactions found</p>
//           </div>
//         ) : (
//           <div className="space-y-3">
//             <AnimatePresence>
//               {paginatedTransactions.map((tx) => (
//                 <motion.div
//                   key={tx.transactionId}
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: 20 }}
//                   className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-quantum-400/50 transition-colors duration-300"
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
//                         <span className="text-lg">{getTypeIcon(tx.type)}</span>
//                       </div>

//                       <div>
//                         <div className="flex items-center gap-2">
//                           <span className="font-medium">
//                             {tx.type.replace('_', ' ')}
//                           </span>
//                           <span className={clsx('text-xs', getStatusColor(tx.status))}>
//                             {tx.status}
//                           </span>
//                         </div>

//                         <p className="text-sm text-gray-400">
//                           {tx.memo || 'No memo'}
//                         </p>

//                         <p className="text-xs text-gray-500 font-mono">
//                           {formatDate(tx.timestamp)}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="text-right">
//                       {tx.amount && parseFloat(tx.amount) > 0 && (
//                         <p className="font-mono text-quantum-400">
//                           {formatHbar(tx.amount)} ℏ
//                         </p>
//                       )}

//                       {tx.tokenId && (
//                         <p className="text-xs text-gray-400 font-mono">
//                           Token: {tx.tokenId}
//                         </p>
//                       )}

//                       <p className="text-xs text-gray-500">
//                         TX: {tx.transactionId.slice(0, 20)}...
//                       </p>
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//             </AnimatePresence>
//           </div>
//         )}

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="flex items-center justify-center gap-2">
//             <Button
//               variant="secondary"
//               size="sm"
//               onClick={() => setPage(Math.max(1, page - 1))}
//               disabled={page === 1}
//             >
//               ←
//             </Button>

//             <span className="text-sm text-gray-400">
//               Page {page} of {totalPages}
//             </span>

//             <Button
//               variant="secondary"
//               size="sm"
//               onClick={() => setPage(Math.min(totalPages, page + 1))}
//               disabled={page === totalPages}
//             >
//               →
//             </Button>
//           </div>
//         )}
//       </div>
//     </Card>
//   )
// }

// export default TransactionHistory