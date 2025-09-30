import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface QuantumParticlesProps {
  count?: number
  size?: 'sm' | 'md' | 'lg'
  color?: 'quantum' | 'physics' | 'carbon' | 'ai'
  speed?: number
  interactive?: boolean
}

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
  phase: number
  entangled?: boolean
}

export const QuantumParticles: React.FC<QuantumParticlesProps> = ({
  count = 50,
  size = 'md',
  color = 'quantum',
  speed = 1,
  interactive = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number >(0)
  const mouseRef = useRef({ x: 0, y: 0 })

  const sizeMap = {
    sm: { min: 1, max: 3 },
    md: { min: 2, max: 5 },
    lg: { min: 3, max: 8 }
  }

  const colorMap = {
    quantum: ['#38bdf8', '#6366f1', '#8b5cf6'],
    physics: ['#e879f9', '#f59e0b', '#ef4444'],
    carbon: ['#22c55e', '#10b981', '#059669'],
    ai: ['#f97316', '#eab308', '#f59e0b']
  }

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const rect = container.getBoundingClientRect()

    // Initialize particles
    particlesRef.current = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      vx: (Math.random() - 0.5) * 2 * speed,
      vy: (Math.random() - 0.5) * 2 * speed,
      size: Math.random() * (sizeMap[size].max - sizeMap[size].min) + sizeMap[size].min,
      opacity: Math.random() * 0.8 + 0.2,
      color: colorMap[color][Math.floor(Math.random() * colorMap[color].length)],
      phase: Math.random() * Math.PI * 2,
      entangled: Math.random() < 0.3 // 30% chance of entanglement
    }))

    const animate = () => {
      if (!container) return

      const rect = container.getBoundingClientRect()
      const particles = particlesRef.current

      // Update particle positions
      particles.forEach((particle, index) => {
        // Basic movement
        particle.x += particle.vx
        particle.y += particle.vy

        // Quantum tunneling effect - occasionally teleport
        if (Math.random() < 0.001) {
          particle.x = Math.random() * rect.width
          particle.y = Math.random() * rect.height
        }

        // Boundary conditions with quantum uncertainty
        if (particle.x < 0 || particle.x > rect.width) {
          particle.vx *= -1
          particle.x = Math.max(0, Math.min(rect.width, particle.x))
        }
        if (particle.y < 0 || particle.y > rect.height) {
          particle.vy *= -1
          particle.y = Math.max(0, Math.min(rect.height, particle.y))
        }

        // Wave-like motion
        particle.phase += 0.02
        particle.opacity = 0.3 + 0.5 * Math.sin(particle.phase)

        // Mouse interaction
        if (interactive) {
          const dx = mouseRef.current.x - particle.x
          const dy = mouseRef.current.y - particle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            const force = (100 - distance) / 100
            particle.vx += (dx / distance) * force * 0.01
            particle.vy += (dy / distance) * force * 0.01
          }
        }

        // Entanglement effects
        if (particle.entangled) {
          const entangledIndex = (index + Math.floor(count / 2)) % count
          const entangled = particles[entangledIndex]

          if (entangled && entangled.entangled) {
            // Synchronized behavior
            const sync = Math.sin(Date.now() * 0.001) * 0.1
            particle.vx += sync
            entangled.vx -= sync

            // Quantum correlation - similar opacity
            const avgOpacity = (particle.opacity + entangled.opacity) / 2
            particle.opacity = avgOpacity * 0.8 + particle.opacity * 0.2
            entangled.opacity = avgOpacity * 0.8 + entangled.opacity * 0.2
          }
        }

        // Velocity damping
        particle.vx *= 0.999
        particle.vy *= 0.999
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [count, size, color, speed, interactive])

  useEffect(() => {
    if (!interactive) return

    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        mouseRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        }
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [interactive])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
    >
      {particlesRef.current.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            transform: 'translate(-50%, -50%)'
          }}
          animate={{
            scale: particle.entangled ? [1, 1.2, 1] : [1, 1.1, 1],
            rotate: particle.entangled ? [0, 180, 360] : [0, 90, 180]
          }}
          transition={{
            duration: particle.entangled ? 2 : 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.id * 0.1
          }}
        />
      ))}

      {/* Entanglement connections */}
      <svg className="absolute inset-0 w-full h-full">
        {particlesRef.current
          .filter(p => p.entangled)
          .map((particle, index) => {
            const entangledIndex = (particlesRef.current.indexOf(particle) + Math.floor(count / 2)) % count
            const entangled = particlesRef.current[entangledIndex]

            if (!entangled || !entangled.entangled) return null

            return (
              <motion.line
                key={`connection-${particle.id}`}
                x1={particle.x}
                y1={particle.y}
                x2={entangled.x}
                y2={entangled.y}
                stroke={particle.color}
                strokeWidth="0.5"
                strokeDasharray="2,4"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: 1, 
                  opacity: [0, 0.3, 0],
                  strokeDashoffset: [0, -10]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )
          })}
      </svg>
    </div>
  )
}

export default QuantumParticles