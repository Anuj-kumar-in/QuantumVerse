// import React, { useState, useEffect } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { usePhysics } from '@hooks/usePhysics'
// import Card from '@components/common/Card'
// import Button from '@components/common/Button'

// interface TimePreset {
//   name: string
//   factor: number
//   description: string
//   icon: string
// }

// export const TimeDialation: React.FC = () => {
//   const { state } = usePhysics()
//   const [timeFactor, setTimeFactor] = useState(1.0) // Normal time
//   const [isActive, setIsActive] = useState(false)
//   const [selectedPreset, setSelectedPreset] = useState('Normal')
//   const [customTime, setCustomTime] = useState(1.0)
//   const [currentTime, setCurrentTime] = useState(new Date())

//   const timePresets: TimePreset[] = [
//     { name: 'Bullet Time', factor: 0.1, description: 'Ultra slow motion', icon: '🐌' },
//     { name: 'Half Speed', factor: 0.5, description: 'Slow motion', icon: '🐢' },
//     { name: 'Normal', factor: 1.0, description: 'Real-time flow', icon: '⏰' },
//     { name: 'Fast Forward', factor: 2.0, description: 'Double speed', icon: '🏃' },
//     { name: 'Time Warp', factor: 5.0, description: 'Very fast', icon: '⚡' },
//     { name: 'Light Speed', factor: 10.0, description: 'Extreme speed', icon: '🌟' }
//   ]

//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (isActive) {
//         setCurrentTime(prev => new Date(prev.getTime() + (1000 * timeFactor)))
//       } else {
//         setCurrentTime(new Date())
//       }
//     }, 1000)

//     return () => clearInterval(interval)
//   }, [isActive, timeFactor])

//   useEffect(() => {
//     const preset = timePresets.find(p => p.name === selectedPreset)
//     if (preset) {
//       setTimeFactor(preset.factor)
//     } else if (selectedPreset === 'Custom') {
//       setTimeFactor(customTime)
//     }
//   }, [selectedPreset, customTime])

//   const handleActivate = () => {
//     setIsActive(!isActive)
//     console.log(`Time dilation ${isActive ? 'deactivated' : 'activated'} at ${timeFactor}x speed`)
//   }

//   const getTimeDescription = (factor: number) => {
//     if (factor < 0.5) return 'Slow Motion - Enhanced perception'
//     if (factor < 1) return 'Reduced Speed - Careful observation'
//     if (factor === 1) return 'Normal Flow - Real-time experience'
//     if (factor < 3) return 'Accelerated - Quick actions'
//     if (factor < 6) return 'Fast Forward - Rapid progression'
//     return 'Time Warp - Extreme acceleration'
//   }

//   const getTimeColor = (factor: number) => {
//     if (factor < 0.5) return 'text-blue-400'
//     if (factor < 1) return 'text-cyan-400'
//     if (factor === 1) return 'text-green-400'
//     if (factor < 3) return 'text-yellow-400'
//     if (factor < 6) return 'text-orange-400'
//     return 'text-red-400'
//   }

//   const formatTime = (date: Date) => {
//     return date.toLocaleTimeString('en-US', {
//       hour12: false,
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit'
//     })
//   }

//   return (
//     <Card variant="physics" gradient className="relative overflow-hidden">
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex items-center gap-4">
//           <motion.div
//             animate={isActive ? {
//               rotate: timeFactor > 1 ? [0, 360] : [360, 0],
//               scale: [1, 1.1, 1]
//             } : {}}
//             transition={{
//               duration: timeFactor > 1 ? 2 / timeFactor : 2 * timeFactor,
//               repeat: isActive ? Infinity : 0,
//               ease: "linear"
//             }}
//             className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center"
//           >
//             <span className="text-2xl">⏰</span>
//           </motion.div>

//           <div>
//             <h3 className="text-xl font-bold font-quantum">Time Dilation Control</h3>
//             <p className="text-gray-400">
//               Manipulate the flow of time in your reality zone
//             </p>
//           </div>
//         </div>

//         {/* Status Display */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="p-4 bg-gray-800/50 rounded-lg">
//             <p className="text-sm text-gray-400">Time Factor</p>
//             <p className={clsx('text-2xl font-bold', getTimeColor(timeFactor))}>
//               {timeFactor.toFixed(1)}x
//             </p>
//             <p className="text-sm text-gray-400">
//               {getTimeDescription(timeFactor)}
//             </p>
//           </div>

//           <div className="p-4 bg-gray-800/50 rounded-lg">
//             <p className="text-sm text-gray-400">Current Time</p>
//             <p className="text-xl font-mono text-physics-400">
//               {formatTime(currentTime)}
//             </p>
//             <p className="text-sm text-gray-400">
//               {isActive ? 'Dilated' : 'Real-time'}
//             </p>
//           </div>

//           <div className="p-4 bg-gray-800/50 rounded-lg">
//             <p className="text-sm text-gray-400">Status</p>
//             <div className="flex items-center gap-2">
//               <div className={clsx(
//                 'w-3 h-3 rounded-full',
//                 isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-600'
//               )} />
//               <p className="text-lg font-semibold">
//                 {isActive ? 'Active' : 'Inactive'}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Time Presets */}
//         <div>
//           <h4 className="font-semibold mb-3">Time Flow Presets</h4>
//           <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//             {timePresets.map((preset) => (
//               <Button
//                 key={preset.name}
//                 variant={selectedPreset === preset.name ? 'physics' : 'secondary'}
//                 size="sm"
//                 onClick={() => setSelectedPreset(preset.name)}
//                 className="text-xs h-auto py-2"
//               >
//                 <div className="text-center">
//                   <div className="text-lg mb-1">{preset.icon}</div>
//                   <div className="font-medium">{preset.name}</div>
//                   <div className="text-xs opacity-70">{preset.factor}x</div>
//                 </div>
//               </Button>
//             ))}

//             <Button
//               variant={selectedPreset === 'Custom' ? 'physics' : 'secondary'}
//               size="sm"
//               onClick={() => setSelectedPreset('Custom')}
//               className="text-xs h-auto py-2"
//             >
//               <div className="text-center">
//                 <div className="text-lg mb-1">⚙️</div>
//                 <div className="font-medium">Custom</div>
//                 <div className="text-xs opacity-70">Set Value</div>
//               </div>
//             </Button>
//           </div>
//         </div>

//         {/* Custom Time Input */}
//         <AnimatePresence>
//           {selectedPreset === 'Custom' && (
//             <motion.div
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: 'auto' }}
//               exit={{ opacity: 0, height: 0 }}
//               className="space-y-3"
//             >
//               <h4 className="font-semibold">Custom Time Factor</h4>
//               <div className="flex items-center gap-4">
//                 <input
//                   type="range"
//                   min="0.1"
//                   max="20"
//                   step="0.1"
//                   value={customTime}
//                   onChange={(e) => setCustomTime(parseFloat(e.target.value))}
//                   className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
//                 />
//                 <input
//                   type="number"
//                   min="0.1"
//                   max="20"
//                   step="0.1"
//                   value={customTime}
//                   onChange={(e) => setCustomTime(parseFloat(e.target.value))}
//                   className="w-24 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:border-physics-400 focus:outline-none"
//                 />
//                 <span className="text-sm text-gray-400">x</span>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Time Flow Visualization */}
//         <div className="relative h-32 bg-gray-800/30 rounded-lg overflow-hidden">
//           <div className="absolute inset-0">
//             {/* Clock face background */}
//             <div className="absolute inset-4 border-2 border-physics-400/30 rounded-full" />

//             {/* Moving clock hands */}
//             {isActive && (
//               <>
//                 {/* Hour hand */}
//                 <motion.div
//                   className="absolute w-0.5 bg-physics-400 origin-bottom"
//                   style={{
//                     height: '25%',
//                     left: '50%',
//                     bottom: '50%',
//                     transformOrigin: 'bottom center'
//                   }}
//                   animate={{
//                     rotate: [0, 360]
//                   }}
//                   transition={{
//                     duration: 12 / timeFactor,
//                     repeat: Infinity,
//                     ease: "linear"
//                   }}
//                 />

//                 {/* Minute hand */}
//                 <motion.div
//                   className="absolute w-0.5 bg-purple-400 origin-bottom"
//                   style={{
//                     height: '35%',
//                     left: '50%',
//                     bottom: '50%',
//                     transformOrigin: 'bottom center'
//                   }}
//                   animate={{
//                     rotate: [0, 360]
//                   }}
//                   transition={{
//                     duration: 1 / timeFactor,
//                     repeat: Infinity,
//                     ease: "linear"
//                   }}
//                 />
//               </>
//             )}

//             {/* Center dot */}
//             <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />

//             {/* Time particles */}
//             {isActive && Array.from({ length: 8 }, (_, i) => (
//               <motion.div
//                 key={i}
//                 className="absolute w-2 h-2 bg-physics-400 rounded-full"
//                 style={{
//                   left: `${20 + Math.random() * 60}%`,
//                   top: `${20 + Math.random() * 60}%`
//                 }}
//                 animate={{
//                   scale: [0, 1, 0],
//                   opacity: [0, 1, 0],
//                   x: timeFactor > 1 ? [0, 50] : [0, -20],
//                   y: timeFactor < 1 ? [0, 20] : [0, -10]
//                 }}
//                 transition={{
//                   duration: timeFactor > 1 ? 1 / timeFactor : 2 * timeFactor,
//                   repeat: Infinity,
//                   delay: i * 0.2,
//                   ease: "easeOut"
//                 }}
//               />
//             ))}
//           </div>
//         </div>

//         {/* Controls */}
//         <div className="flex gap-3">
//           <Button
//             variant={isActive ? 'secondary' : 'physics'}
//             onClick={handleActivate}
//             className="flex-1"
//             glow={!isActive}
//           >
//             {isActive ? 'Deactivate' : 'Activate'} Time Dilation
//           </Button>

//           <Button variant="secondary">
//             Reset to Normal
//           </Button>
//         </div>

//         {/* Energy & Effects Info */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
//             <p className="text-sm text-yellow-300 font-semibold mb-1">
//               ⚡ Energy Cost
//             </p>
//             <p className="text-xs text-yellow-200">
//               {Math.ceil(Math.abs(timeFactor - 1) * 15)} units/minute
//             </p>
//           </div>

//           <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
//             <p className="text-sm text-blue-300 font-semibold mb-1">
//               🌀 Side Effects
//             </p>
//             <p className="text-xs text-blue-200">
//               {timeFactor < 1 ? 'Enhanced reflexes, clearer thinking' : 
//                timeFactor > 2 ? 'Increased fatigue, blurred vision' : 
//                'No side effects'}
//             </p>
//           </div>
//         </div>
//       </div>
//     </Card>
//   )
// }

// export default TimeDialation