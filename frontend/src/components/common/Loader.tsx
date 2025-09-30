import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'quantum' | 'physics' | 'carbon' | 'ai'
  text?: string
  fullScreen?: boolean
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  variant = 'default',
  text,
  fullScreen = false
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const colors = {
    default: 'border-gray-300',
    quantum: 'border-quantum-400',
    physics: 'border-physics-400',
    carbon: 'border-carbon-400',
    ai: 'border-ai-400'
  }

  const QuantumLoader = () => (
    <div className="relative">
      {/* Outer ring */}
      <motion.div
        className={clsx(sizes[size], 'border-2 border-transparent rounded-full')}
        style={{
          borderTopColor: variant === 'quantum' ? '#38bdf8' : '#6366f1',
          borderRightColor: variant === 'quantum' ? '#e879f9' : '#8b5cf6',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />

      {/* Inner particles */}
      <div className="absolute inset-2">
        {[0, 120, 240].map((rotation, index) => (
          <motion.div
            key={index}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              top: '50%',
              left: '50%',
              originX: 0.5,
              originY: 0.5,
            }}
            animate={{
              rotate: [rotation, rotation + 360],
              scale: [1, 0.5, 1],
              opacity: [1, 0.3, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.2
            }}
          />
        ))}
      </div>
    </div>
  )

  const StandardLoader = () => (
    <div
      className={clsx(
        sizes[size],
        colors[variant],
        'border-2 border-t-transparent rounded-full animate-spin'
      )}
    />
  )

  const content = (
    <div className="flex flex-col items-center gap-4">
      {variant === 'quantum' || variant === 'physics' ? (
        <QuantumLoader />
      ) : (
        <StandardLoader />
      )}

      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-400 font-quantum"
        >
          {text}
        </motion.p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    )
  }

  return content
}

export default Loader