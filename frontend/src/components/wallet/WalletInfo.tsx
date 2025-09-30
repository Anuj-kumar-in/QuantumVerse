// import React, { useState, useEffect } from 'react'
// import { motion } from 'framer-motion'
// import { useWallet } from '@hooks/useWallet'
// import { useAccount } from '@hooks/useHedera'
// import Card from '@components/common/Card'
// import Button from '@components/common/Button'
// import Modal from '@components/common/Modal'
// import { formatHbar, formatTokenAmount, formatAccountId } from '@utils/formatters'

// export const WalletInfo: React.FC = () => {
//   const { connectionState, disconnect } = useWallet()
//   const account = useAccount()
//   const [showDetails, setShowDetails] = useState(false)
//   const [copied, setCopied] = useState(false)

//   useEffect(() => {
//     if (copied) {
//       const timer = setTimeout(() => setCopied(false), 2000)
//       return () => clearTimeout(timer)
//     }
//   }, [copied])

//   const copyAccountId = () => {
//     if (account?.accountId) {
//       navigator.clipboard.writeText(account.accountId)
//       setCopied(true)
//     }
//   }

//   if (!connectionState.isConnected || !account) {
//     return (
//       <Card variant="default" className="text-center">
//         <p className="text-gray-400">No wallet connected</p>
//       </Card>
//     )
//   }

//   return (
//     <>
//       <Card variant="quantum" gradient glow>
//         <div className="space-y-4">
//           {/* Header */}
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="w-12 h-12 rounded-full bg-quantum-500/20 flex items-center justify-center">
//                 <span className="text-xl">👤</span>
//               </div>
//               <div>
//                 <h3 className="font-semibold font-quantum">Quantum Identity</h3>
//                 <p className="text-sm text-gray-400">
//                   {connectionState.provider} Wallet
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center gap-2">
//               <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
//               <span className="text-sm text-green-400">Active</span>
//             </div>
//           </div>

//           {/* Account Info */}
//           <div className="space-y-3">
//             <div className="flex items-center justify-between">
//               <span className="text-gray-400">Account ID</span>
//               <div className="flex items-center gap-2">
//                 <span className="font-mono text-sm">
//                   {formatAccountId(account.accountId)}
//                 </span>
//                 <Button
//                   variant="secondary"
//                   size="sm"
//                   onClick={copyAccountId}
//                   className="text-xs"
//                 >
//                   {copied ? '✓' : '📋'}
//                 </Button>
//               </div>
//             </div>

//             <div className="flex items-center justify-between">
//               <span className="text-gray-400">HBAR Balance</span>
//               <span className="font-mono text-quantum-400">
//                 {formatHbar(account.balance)} ℏ
//               </span>
//             </div>

//             <div className="flex items-center justify-between">
//               <span className="text-gray-400">Network</span>
//               <span className="text-quantum-400 capitalize">
//                 {connectionState.network}
//               </span>
//             </div>

//             {account.tokens.length > 0 && (
//               <div className="flex items-center justify-between">
//                 <span className="text-gray-400">Tokens</span>
//                 <span className="text-quantum-400">
//                   {account.tokens.length} types
//                 </span>
//               </div>
//             )}
//           </div>

//           {/* Actions */}
//           <div className="flex gap-2">
//             <Button
//               variant="quantum"
//               size="sm"
//               onClick={() => setShowDetails(true)}
//               className="flex-1"
//             >
//               View Details
//             </Button>
//             <Button
//               variant="secondary"
//               size="sm"
//               onClick={disconnect}
//             >
//               Disconnect
//             </Button>
//           </div>
//         </div>
//       </Card>

//       {/* Detailed Info Modal */}
//       <Modal
//         isOpen={showDetails}
//         onClose={() => setShowDetails(false)}
//         title="Wallet Details"
//         variant="quantum"
//         size="lg"
//       >
//         <div className="space-y-6">
//           {/* Account Information */}
//           <div>
//             <h4 className="font-semibold mb-3">Account Information</h4>
//             <div className="space-y-2">
//               <div className="flex justify-between p-3 bg-gray-800 rounded-lg">
//                 <span className="text-gray-400">Account ID:</span>
//                 <span className="font-mono">{account.accountId}</span>
//               </div>
//               <div className="flex justify-between p-3 bg-gray-800 rounded-lg">
//                 <span className="text-gray-400">Public Key:</span>
//                 <span className="font-mono text-xs">
//                   {account.publicKey.slice(0, 20)}...{account.publicKey.slice(-20)}
//                 </span>
//               </div>
//               <div className="flex justify-between p-3 bg-gray-800 rounded-lg">
//                 <span className="text-gray-400">HBAR Balance:</span>
//                 <span className="font-mono text-quantum-400">
//                   {formatHbar(account.balance)} ℏ
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Token Balances */}
//           {account.tokens.length > 0 && (
//             <div>
//               <h4 className="font-semibold mb-3">Token Holdings</h4>
//               <div className="space-y-2">
//                 {account.tokens.map((token) => (
//                   <div
//                     key={token.tokenId}
//                     className="flex justify-between items-center p-3 bg-gray-800 rounded-lg"
//                   >
//                     <div>
//                       <span className="font-medium">{token.symbol}</span>
//                       <p className="text-xs text-gray-400 font-mono">
//                         {token.tokenId}
//                       </p>
//                     </div>
//                     <span className="font-mono">
//                       {formatTokenAmount(token.balance, token.decimals)}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Security Status */}
//           <div>
//             <h4 className="font-semibold mb-3">Security Status</h4>
//             <div className="space-y-2">
//               <div className="flex items-center justify-between p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
//                 <div className="flex items-center gap-2">
//                   <span className="text-green-400">🔐</span>
//                   <span>Quantum Resistant</span>
//                 </div>
//                 <span className="text-green-400">Active</span>
//               </div>

//               <div className="flex items-center justify-between p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
//                 <div className="flex items-center gap-2">
//                   <span className="text-blue-400">🌌</span>
//                   <span>Multi-Reality Sync</span>
//                 </div>
//                 <span className="text-blue-400">Enabled</span>
//               </div>

//               <div className="flex items-center justify-between p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
//                 <div className="flex items-center gap-2">
//                   <span className="text-purple-400">⚛️</span>
//                   <span>Quantum Entanglement</span>
//                 </div>
//                 <span className="text-purple-400">Ready</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </Modal>
//     </>
//   )
// }

// export default WalletInfo