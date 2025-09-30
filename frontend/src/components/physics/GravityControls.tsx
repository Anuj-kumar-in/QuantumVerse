// import React, { useState, useEffect } from 'react'
// import { motion } from 'framer-motion'
// import { usePhysics } from '@hooks/usePhysics'
// import Card from '@components/common/Card'
// import Button from '@components/common/Button'

// export const GravityControls: React.FC = () => {
//   const { state } = usePhysics()
//   const [gravityLevel, setGravityLevel] = useState(9.81) // Earth gravity
//   const [isActive, setIsActive] = useState(false)
//   const [selectedPlanet, setSelectedPlanet] = useState('Earth')
//   const [customGravity, setCustomGravity] = useState(9.81)

//   const planetGravities = {
//     'Mercury': 3.7,
//     'Venus': 8.87,
//     'Earth': 9.81,
//     'Mars': 3.71,
//     'Jupiter': 24.79,
//     'Saturn': 10.44,
//     'Uranus': 8.69,
//     'Neptune': 11.15,
//     'Moon': 1.62,
//     'Sun': 274.0
//   }

//   useEffect(() => {
//     if (selectedPlanet !== 'Custom') {
//       setGravityLevel(planetGravities[selectedPlanet as keyof typeof planetGravities])
//     } else {
//       setGravityLevel(customGravity)
//     }
//   }, [selectedPlanet, customGravity])

//   const handleActivate = () => {
//     setIsActive(!isActive)
//     // In a real implementation, this would communicate with the physics engine
//     console.log(`Gravity ${isActive ? 'deactivated' : 'activated'} at ${gravityLevel} m/s²`)
//   }

//   const getGravityDescription = (gravity: number) => {
//     if (gravity < 2) return 'Ultra Low - Objects float freely'
//     if (gravity < 5) return 'Low - Easy jumping, slow falling'
//     if (gravity < 10) return 'Earth-like - Normal physics'
//     if (gravity < 15) return 'High - Heavy movement, fast falling'
//     return 'Extreme - Crushing gravitational force'
//   }

//   const getGravityColor = (gravity: number) => {
//     if (gravity < 2) return 'text-blue-400'
//     if (gravity < 5) return 'text-green-400'
//     if (gravity < 10) return 'text-yellow-400'
//     if (gravity < 15) return 'text-orange-400'
//     return 'text-red-400'
//   }

//   return (
//     <Card variant="physics" gradient className="relative overflow-hidden">
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex items-center gap-4">
//           <motion.div
//             animate={isActive ? {
//               rotate: [0, 360],
//               scale: [1, 1.2, 1]
//             } : {}}
//             transition={{
//               duration: 2,
//               repeat: isActive ? Infinity : 0,
//               ease: "easeInOut"
//             }}
//             className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center"
//           >
//             <span className="text-2xl">🌍</span>
//           </motion.div>

//           <div>
//             <h3 className="text-xl font-bold font-quantum">Gravity Control System</h3>
//             <p className="text-gray-400">
//               Manipulate gravitational force in your reality zone
//             </p>
//           </div>
//         </div>

//         {/* Status */}
//         <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
//           <div>
//             <p className="text-sm text-gray-400">Current Gravity</p>
//             <p className={clsx('text-2xl font-bold', getGravityColor(gravityLevel))}>
//               {gravityLevel.toFixed(2)} m/s²
//             </p>
//             <p className="text-sm text-gray-400">
//               {getGravityDescription(gravityLevel)}
//             </p>
//           </div>

//           <div className="text-right">
//             <div className={clsx(
//               'w-4 h-4 rounded-full mb-2',
//               isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-600'
//             )} />
//             <p className="text-sm">
//               {isActive ? 'Active' : 'Inactive'}
//             </p>
//           </div>
//         </div>

//         {/* Planet Presets */}
//         <div>
//           <h4 className="font-semibold mb-3">Planetary Presets</h4>
//           <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//             {Object.entries(planetGravities).map(([planet, gravity]) => (
//               <Button
//                 key={planet}
//                 variant={selectedPlanet === planet ? 'physics' : 'secondary'}
//                 size="sm"
//                 onClick={() => setSelectedPlanet(planet)}
//                 className="text-xs"
//               >
//                 {planet}
//                 <br />
//                 <span className="text-xs opacity-70">{gravity} m/s²</span>
//               </Button>
//             ))}

//             <Button
//               variant={selectedPlanet === 'Custom' ? 'physics' : 'secondary'}
//               size="sm"
//               onClick={() => setSelectedPlanet('Custom')}
//               className="text-xs"
//             >
//               Custom
//               <br />
//               <span className="text-xs opacity-70">Set Value</span>
//             </Button>
//           </div>
//         </div>

//         {/* Custom Gravity Input */}
//         {selectedPlanet === 'Custom' && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: 'auto' }}
//             exit={{ opacity: 0, height: 0 }}
//             className="space-y-3"
//           >
//             <h4 className="font-semibold">Custom Gravity</h4>
//             <div className="flex items-center gap-4">
//               <input
//                 type="range"
//                 min="0.1"
//                 max="50"
//                 step="0.1"
//                 value={customGravity}
//                 onChange={(e) => setCustomGravity(parseFloat(e.target.value))}
//                 className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
//               />
//               <input
//                 type="number"
//                 min="0.1"
//                 max="50"
//                 step="0.1"
//                 value={customGravity}
//                 onChange={(e) => setCustomGravity(parseFloat(e.target.value))}
//                 className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:border-physics-400 focus:outline-none"
//               />
//             </div>
//           </motion.div>
//         )}

//         {/* Visual Gravity Indicator */}
//         <div className="relative h-32 bg-gray-800/30 rounded-lg overflow-hidden">
//           <div className="absolute inset-0 flex items-end justify-center">
//             {/* Falling objects animation */}
//             {Array.from({ length: 5 }, (_, i) => (
//               <motion.div
//                 key={i}
//                 className="w-4 h-4 bg-physics-400 rounded-full absolute"
//                 style={{ left: `${20 + i * 15}%` }}
//                 animate={isActive ? {
//                   y: [0, 100],
//                   opacity: [1, 0]
//                 } : {}}
//                 transition={{
//                   duration: Math.max(0.5, 3 / Math.sqrt(gravityLevel)),
//                   repeat: isActive ? Infinity : 0,
//                   delay: i * 0.2,
//                   ease: "easeIn"
//                 }}
//               />
//             ))}

//             {/* Ground line */}
//             <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-physics-400 to-purple-400" />
//           </div>

//           {/* Gravity field visualization */}
//           {isActive && (
//             <div className="absolute inset-0">
//               {Array.from({ length: 10 }, (_, i) => (
//                 <motion.div
//                   key={i}
//                   className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-physics-400/30 to-transparent"
//                   style={{ top: `${i * 10}%` }}
//                   animate={{
//                     opacity: [0.3, 0.7, 0.3],
//                     scaleX: [0.8, 1.2, 0.8]
//                   }}
//                   transition={{
//                     duration: 2,
//                     repeat: Infinity,
//                     delay: i * 0.1,
//                     ease: "easeInOut"
//                   }}
//                 />
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Controls */}
//         <div className="flex gap-3">
//           <Button
//             variant={isActive ? 'secondary' : 'physics'}
//             onClick={handleActivate}
//             className="flex-1"
//             glow={!isActive}
//           >
//             {isActive ? 'Deactivate' : 'Activate'} Gravity Control
//           </Button>

//           <Button variant="secondary">
//             Save Preset
//           </Button>
//         </div>

//         {/* Energy Cost */}
//         <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
//           <p className="text-sm text-yellow-300">
//             ⚡ Energy Cost: {Math.ceil(Math.abs(gravityLevel - 9.81) * 10)} units/minute
//           </p>
//           <p className="text-xs text-yellow-200">
//             More extreme gravity settings require more energy to maintain
//           </p>
//         </div>
//       </div>
//     </Card>
//   )
// }

// export default GravityControls