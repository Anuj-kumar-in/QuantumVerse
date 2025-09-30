import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'quantum' | 'physics' | 'carbon' | 'ai'
  hover?: boolean
  glow?: boolean
  gradient?: boolean
  padding?: 'sm' | 'md' | 'lg' | 'xl'
  onClick?: () => void
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  hover = true,
  glow = false,
  gradient = false,
  padding = 'md',
  onClick
}) => {
  const baseClasses = 'bg-gray-800 border border-gray-700 rounded-lg transition-all duration-300'

  const variants = {
    default: 'hover:border-gray-600',
    quantum: 'border-quantum-500/30 hover:border-quantum-400/50 hover:bg-quantum-900/10',
    physics: 'border-physics-500/30 hover:border-physics-400/50 hover:bg-physics-900/10',
    carbon: 'border-carbon-500/30 hover:border-carbon-400/50 hover:bg-carbon-900/10',
    ai: 'border-ai-500/30 hover:border-ai-400/50 hover:bg-ai-900/10'
  }

  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  }

  const hoverClasses = hover ? 'hover:scale-[1.02] hover:shadow-lg' : ''
  const glowClasses = glow ? 'shadow-lg shadow-current/10' : ''
  const clickableClasses = onClick ? 'cursor-pointer' : ''

  const gradientOverlay = gradient && variant !== 'default' && (
    <div className={clsx(
      'absolute inset-0 rounded-lg opacity-5',
      variant === 'quantum' && 'bg-gradient-to-br from-quantum-400 to-physics-400',
      variant === 'physics' && 'bg-gradient-to-br from-physics-400 to-purple-400',
      variant === 'carbon' && 'bg-gradient-to-br from-carbon-400 to-green-400',
      variant === 'ai' && 'bg-gradient-to-br from-ai-400 to-yellow-400'
    )} />
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -4 } : {}}
      className={clsx(
        baseClasses,
        variants[variant],
        paddings[padding],
        hoverClasses,
        glowClasses,
        clickableClasses,
        'relative overflow-hidden',
        className
      )}
      onClick={onClick}
    >
      {gradientOverlay}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}

export default Card