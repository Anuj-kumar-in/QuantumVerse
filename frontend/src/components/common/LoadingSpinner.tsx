import React from 'react'
import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'quantum' | 'physics' | 'ai' | 'carbon'
  text?: string
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'quantum',
  text,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  }

  const colorClasses = {
    quantum: 'border-quantum-400',
    physics: 'border-physics-400',
    ai: 'border-ai-400',
    carbon: 'border-carbon-400'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        className={`
          ${sizeClasses[size]} 
          border-2 
          ${colorClasses[color]}
          border-t-transparent 
          rounded-full
        `}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-sm text-gray-400"
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}

export default LoadingSpinner