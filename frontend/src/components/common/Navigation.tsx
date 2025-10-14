import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { clsx } from 'clsx'
import { useWallet } from '../../hooks/useWallet'
import Button from './Button'

interface NavigationItem {
  name: string
  path: string
  icon: string
  badge?: number
  quantum?: boolean
}

export const Navigation: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { isConnected, account } = useWallet()
  const location = useLocation()

  const navigationItems: NavigationItem[] = [
    { name: 'Home', path: '/', icon: '🏠' },
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Identity', path: '/identity', icon: '🔐', quantum: true },
    { name: 'Physics NFTs', path: '/marketplace', icon: '⚡', badge: 3 },
    { name: 'AI Entities', path: '/ai-entities', icon: '🤖', badge: 5 },
    { name: 'Entanglement', path: '/entanglement', icon: '🌌', quantum: true },
    { name: 'Carbon Rewards', path: '/carbon', icon: '🌱', badge: 12 },
    { name: 'Reality Portal', path: '/portal', icon: '🌍' }
  ]

  return (
    <motion.nav
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className={clsx(
        'fixed left-0 top-0 h-screen bg-gray-900 border-r border-gray-700 transition-all duration-300 z-40',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-quantum-500 to-physics-500 flex items-center justify-center">
                  <span className="text-lg">⚛️</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-quantum">QuantumVerse</h2>
                  <p className="text-xs text-gray-400">Multi-Reality Gaming</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto"
          >
            {isCollapsed ? '→' : '←'}
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <div className="p-4 border-b border-gray-700">
        <div className={clsx(
          'flex items-center gap-3 p-3 rounded-lg',
          isConnected ? 'bg-green-900/30 border border-green-500/30' : 'bg-red-900/30 border border-red-500/30'
        )}>
          <div className={clsx(
            'w-2 h-2 rounded-full',
            isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
          )} />

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className={clsx(
                  'text-xs font-medium',
                  isConnected ? 'text-green-300' : 'text-red-300'
                )}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </p>
                {isConnected && account && (
                  <p className="text-xs text-gray-400 truncate">
                    {account.accountId}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path

          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={clsx(
                  'flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group relative',
                  isActive 
                    ? 'bg-quantum-600/20 border border-quantum-500/30 text-quantum-300'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                )}
              >
                <span className="text-lg">{item.icon}</span>

                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex-1 flex items-center justify-between"
                    >
                      <span className="font-medium">{item.name}</span>

                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <span className="px-2 py-1 text-xs bg-quantum-500 text-white rounded-full">
                            {item.badge}
                          </span>
                        )}

                        {item.quantum && (
                          <span className="text-quantum-400 animate-pulse">⚛️</span>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-quantum-400 rounded-r"
                  />
                )}

                {/* Quantum glow effect */}
                {item.quantum && (
                  <div className="absolute inset-0 rounded-lg bg-quantum-400/5 group-hover:bg-quantum-400/10 transition-colors duration-300" />
                )}
              </motion.div>
            </Link>
          )
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <p className="text-xs text-gray-500">Powered by Hedera</p>
              <div className="mt-2 flex justify-center gap-2">
                <div className="w-2 h-2 bg-quantum-400 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-physics-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-carbon-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}

export default Navigation