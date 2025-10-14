import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'quantum' | 'physics' | 'carbon' | 'ai' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  icon?: React.ReactNode
  gradient?: boolean
  glow?: boolean
  quantum?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  gradient = false,
  glow = false,
  quantum = false,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = 'relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-quantum-600 hover:bg-quantum-700 text-white focus:ring-quantum-500',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white focus:ring-gray-500',
    quantum: 'bg-gradient-to-r from-quantum-600 to-physics-600 hover:from-quantum-700 hover:to-physics-700 text-white focus:ring-quantum-500',
    physics: 'bg-gradient-to-r from-physics-600 to-purple-600 hover:from-physics-700 hover:to-purple-700 text-white focus:ring-physics-500',
    carbon: 'bg-gradient-to-r from-black-800 to-green-600 hover:from-carbon-700 hover:to-green-700 text-white focus:ring-carbon-500',
    ai: 'bg-gradient-to-r from-ai-600 to-yellow-600 hover:from-ai-700 hover:to-yellow-700 text-white focus:ring-ai-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
  }

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  }

  const glowClasses = glow ? 'shadow-lg shadow-current/25' : ''
  const quantumClasses = quantum ? 'animate-quantum-pulse' : ''

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className={clsx(
        baseClasses,
        variants[variant],
        sizes[size],
        glowClasses,
        quantumClasses,
        className
      )}
      disabled={disabled || loading}
      {...props as any}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className={clsx('flex items-center gap-2', loading && 'opacity-0')}>
        {icon && <span className="text-lg">{icon}</span>}
        {children}
      </div>

      {quantum && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-quantum-400 to-physics-400 opacity-0 hover:opacity-20 transition-opacity duration-300" />
      )}
    </motion.button>
  )
}

export default Button