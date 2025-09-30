import React from 'react'
import { useAccount } from '../../hooks/useHedera'
import Card from '../../components/common/Card'

export const TokenBalances: React.FC = () => {
  const account = useAccount()

  const mockTokens = [
    { symbol: 'QUANTUM', balance: '1,250.50', value: '$312.63', change: '+8.2%' },
    { symbol: 'PHYSICS', balance: '850.25', value: '$204.06', change: '+12.1%' },
    { symbol: 'CARBON', balance: '2,150.75', value: '$107.54', change: '+3.8%' },
    { symbol: 'REALITY', balance: '650.00', value: '$65.00', change: '+5.5%' }
  ]

  return (
    <Card variant="default">
      <h3 className="text-lg font-semibold mb-4">Token Holdings</h3>

      <div className="space-y-3">
        {mockTokens.map((token) => (
          <div
            key={token.symbol}
            className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
          >
            <div>
              <div className="font-medium">{token.symbol}</div>
              <div className="text-sm text-gray-400">{token.balance}</div>
            </div>

            <div className="text-right">
              <div className="font-medium">{token.value}</div>
              <div className="text-sm text-green-400">{token.change}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default TokenBalances