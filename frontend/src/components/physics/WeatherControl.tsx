// import React, { useState, useEffect } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { usePhysics } from '@hooks/usePhysics'
// import Card from '@components/common/Card'
// import Button from '@components/common/Button'

// interface WeatherPreset {
//   name: string
//   temperature: number
//   humidity: number
//   windSpeed: number
//   precipitation: number
//   icon: string
//   description: string
// }

// export const WeatherControl: React.FC = () => {
//   const { state } = usePhysics()
//   const [isActive, setIsActive] = useState(false)
//   const [currentWeather, setCurrentWeather] = useState({
//     temperature: 22, // Celsius
//     humidity: 50, // Percentage
//     windSpeed: 5, // km/h
//     precipitation: 0, // mm/h
//     pressure: 1013 // hPa
//   })
//   const [selectedPreset, setSelectedPreset] = useState('Clear')

//   const weatherPresets: WeatherPreset[] = [
//     {
//       name: 'Clear',
//       temperature: 22,
//       humidity: 45,
//       windSpeed: 5,
//       precipitation: 0,
//       icon: '☀️',
//       description: 'Perfect sunny day'
//     },
//     {
//       name: 'Cloudy',
//       temperature: 18,
//       humidity: 65,
//       windSpeed: 8,
//       precipitation: 0,
//       icon: '☁️',
//       description: 'Overcast skies'
//     },
//     {
//       name: 'Rain',
//       temperature: 15,
//       humidity: 85,
//       windSpeed: 12,
//       precipitation: 5,
//       icon: '🌧️',
//       description: 'Light to moderate rain'
//     },
//     {
//       name: 'Storm',
//       temperature: 12,
//       humidity: 90,
//       windSpeed: 25,
//       precipitation: 15,
//       icon: '⛈️',
//       description: 'Thunderstorm conditions'
//     },
//     {
//       name: 'Snow',
//       temperature: -2,
//       humidity: 80,
//       windSpeed: 10,
//       precipitation: 8,
//       icon: '❄️',
//       description: 'Snowing conditions'
//     },
//     {
//       name: 'Blizzard',
//       temperature: -10,
//       humidity: 95,
//       windSpeed: 40,
//       precipitation: 20,
//       icon: '🌨️',
//       description: 'Extreme winter weather'
//     },
//     {
//       name: 'Fog',
//       temperature: 8,
//       humidity: 95,
//       windSpeed: 2,
//       precipitation: 0,
//       icon: '🌫️',
//       description: 'Dense fog conditions'
//     },
//     {
//       name: 'Hot',
//       temperature: 38,
//       humidity: 30,
//       windSpeed: 3,
//       precipitation: 0,
//       icon: '🔥',
//       description: 'Extreme heat'
//     }
//   ]

//   useEffect(() => {
//     const preset = weatherPresets.find(p => p.name === selectedPreset)
//     if (preset) {
//       setCurrentWeather({
//         temperature: preset.temperature,
//         humidity: preset.humidity,
//         windSpeed: preset.windSpeed,
//         precipitation: preset.precipitation,
//         pressure: 1013 - (preset.windSpeed * 2) + (Math.random() - 0.5) * 20
//       })
//     }
//   }, [selectedPreset])

//   const handleActivate = () => {
//     setIsActive(!isActive)
//     console.log(`Weather control ${isActive ? 'deactivated' : 'activated'}`, currentWeather)
//   }

//   const getTemperatureColor = (temp: number) => {
//     if (temp < 0) return 'text-blue-300'
//     if (temp < 10) return 'text-blue-400'
//     if (temp < 20) return 'text-cyan-400'
//     if (temp < 30) return 'text-green-400'
//     if (temp < 35) return 'text-yellow-400'
//     return 'text-red-400'
//   }

//   const getWindDescription = (speed: number) => {
//     if (speed < 5) return 'Calm'
//     if (speed < 15) return 'Light breeze'
//     if (speed < 25) return 'Moderate wind'
//     if (speed < 40) return 'Strong wind'
//     return 'Extreme wind'
//   }

//   const getWeatherEffects = (weather: typeof currentWeather) => {
//     const effects = []

//     if (weather.temperature > 30) effects.push('Heat distortion')
//     if (weather.temperature < 0) effects.push('Ice formation')
//     if (weather.precipitation > 10) effects.push('Reduced visibility')
//     if (weather.windSpeed > 20) effects.push('Debris movement')
//     if (weather.humidity > 80) effects.push('Water condensation')

//     return effects
//   }

//   return (
//     <Card variant="physics" gradient className="relative overflow-hidden">
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex items-center gap-4">
//           <motion.div
//             animate={isActive ? {
//               rotate: currentWeather.windSpeed > 15 ? [0, 360] : [0, 180, 0],
//               scale: [1, 1.1, 1]
//             } : {}}
//             transition={{
//               duration: Math.max(1, 5 - currentWeather.windSpeed / 10),
//               repeat: isActive ? Infinity : 0,
//               ease: "easeInOut"
//             }}
//             className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center"
//           >
//             <span className="text-2xl">
//               {weatherPresets.find(p => p.name === selectedPreset)?.icon || '🌤️'}
//             </span>
//           </motion.div>

//           <div>
//             <h3 className="text-xl font-bold font-quantum">Weather Control System</h3>
//             <p className="text-gray-400">
//               Manipulate atmospheric conditions in your zone
//             </p>
//           </div>
//         </div>

//         {/* Current Conditions */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <div className="p-3 bg-gray-800/50 rounded-lg text-center">
//             <div className={clsx('text-2xl font-bold', getTemperatureColor(currentWeather.temperature))}>
//               {currentWeather.temperature}°C
//             </div>
//             <div className="text-xs text-gray-400">Temperature</div>
//           </div>

//           <div className="p-3 bg-gray-800/50 rounded-lg text-center">
//             <div className="text-2xl font-bold text-cyan-400">
//               {currentWeather.humidity}%
//             </div>
//             <div className="text-xs text-gray-400">Humidity</div>
//           </div>

//           <div className="p-3 bg-gray-800/50 rounded-lg text-center">
//             <div className="text-2xl font-bold text-green-400">
//               {currentWeather.windSpeed}
//             </div>
//             <div className="text-xs text-gray-400">Wind km/h</div>
//           </div>

//           <div className="p-3 bg-gray-800/50 rounded-lg text-center">
//             <div className="text-2xl font-bold text-blue-400">
//               {currentWeather.precipitation}
//             </div>
//             <div className="text-xs text-gray-400">Rain mm/h</div>
//           </div>
//         </div>

//         {/* Weather Presets */}
//         <div>
//           <h4 className="font-semibold mb-3">Weather Presets</h4>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
//             {weatherPresets.map((preset) => (
//               <Button
//                 key={preset.name}
//                 variant={selectedPreset === preset.name ? 'physics' : 'secondary'}
//                 size="sm"
//                 onClick={() => setSelectedPreset(preset.name)}
//                 className="h-auto py-3"
//               >
//                 <div className="text-center">
//                   <div className="text-2xl mb-1">{preset.icon}</div>
//                   <div className="font-medium text-sm">{preset.name}</div>
//                   <div className="text-xs opacity-70">{preset.temperature}°C</div>
//                 </div>
//               </Button>
//             ))}
//           </div>
//         </div>

//         {/* Manual Controls */}
//         <div className="space-y-4">
//           <h4 className="font-semibold">Manual Adjustments</h4>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-400 mb-2">
//                 Temperature: {currentWeather.temperature}°C
//               </label>
//               <input
//                 type="range"
//                 min="-20"
//                 max="50"
//                 value={currentWeather.temperature}
//                 onChange={(e) => setCurrentWeather(prev => ({ ...prev, temperature: parseInt(e.target.value) }))}
//                 className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-400 mb-2">
//                 Humidity: {currentWeather.humidity}%
//               </label>
//               <input
//                 type="range"
//                 min="0"
//                 max="100"
//                 value={currentWeather.humidity}
//                 onChange={(e) => setCurrentWeather(prev => ({ ...prev, humidity: parseInt(e.target.value) }))}
//                 className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-400 mb-2">
//                 Wind Speed: {currentWeather.windSpeed} km/h
//               </label>
//               <input
//                 type="range"
//                 min="0"
//                 max="60"
//                 value={currentWeather.windSpeed}
//                 onChange={(e) => setCurrentWeather(prev => ({ ...prev, windSpeed: parseInt(e.target.value) }))}
//                 className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
//               />
//               <p className="text-xs text-gray-400 mt-1">
//                 {getWindDescription(currentWeather.windSpeed)}
//               </p>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-400 mb-2">
//                 Precipitation: {currentWeather.precipitation} mm/h
//               </label>
//               <input
//                 type="range"
//                 min="0"
//                 max="30"
//                 value={currentWeather.precipitation}
//                 onChange={(e) => setCurrentWeather(prev => ({ ...prev, precipitation: parseInt(e.target.value) }))}
//                 className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Weather Visualization */}
//         <div className="relative h-40 bg-gradient-to-b from-blue-900/30 to-gray-800/30 rounded-lg overflow-hidden">
//           {/* Sky background */}
//           <div className={clsx(
//             'absolute inset-0 transition-all duration-1000',
//             currentWeather.precipitation > 0 ? 'bg-gray-600/30' : 'bg-blue-500/20'
//           )} />

//           {/* Precipitation */}
//           {isActive && currentWeather.precipitation > 0 && (
//             <div className="absolute inset-0">
//               {Array.from({ length: Math.min(50, currentWeather.precipitation * 3) }, (_, i) => (
//                 <motion.div
//                   key={i}
//                   className={clsx(
//                     'absolute w-0.5 opacity-70',
//                     currentWeather.temperature < 0 ? 'bg-white h-1' : 'bg-blue-300 h-4'
//                   )}
//                   style={{
//                     left: `${Math.random() * 100}%`,
//                     top: '-10px'
//                   }}
//                   animate={{
//                     y: [0, 170],
//                     x: currentWeather.windSpeed > 10 ? [0, currentWeather.windSpeed] : 0
//                   }}
//                   transition={{
//                     duration: currentWeather.temperature < 0 ? 3 : 1,
//                     repeat: Infinity,
//                     delay: Math.random() * 2,
//                     ease: "linear"
//                   }}
//                 />
//               ))}
//             </div>
//           )}

//           {/* Wind particles */}
//           {isActive && currentWeather.windSpeed > 5 && (
//             <div className="absolute inset-0">
//               {Array.from({ length: Math.min(20, currentWeather.windSpeed) }, (_, i) => (
//                 <motion.div
//                   key={i}
//                   className="absolute w-2 h-0.5 bg-white/30"
//                   style={{
//                     left: '-10px',
//                     top: `${Math.random() * 100}%`
//                   }}
//                   animate={{
//                     x: [0, 300],
//                     opacity: [0, 0.7, 0]
//                   }}
//                   transition={{
//                     duration: Math.max(0.5, 3 - currentWeather.windSpeed / 20),
//                     repeat: Infinity,
//                     delay: Math.random() * 2,
//                     ease: "easeOut"
//                   }}
//                 />
//               ))}
//             </div>
//           )}

//           {/* Temperature effects */}
//           {isActive && currentWeather.temperature > 30 && (
//             <div className="absolute inset-0">
//               {Array.from({ length: 10 }, (_, i) => (
//                 <motion.div
//                   key={i}
//                   className="absolute w-6 h-6 rounded-full bg-yellow-400/20"
//                   style={{
//                     left: `${Math.random() * 90}%`,
//                     bottom: '0px'
//                   }}
//                   animate={{
//                     y: [0, -160],
//                     scale: [0.5, 1.5, 0],
//                     opacity: [0.3, 0.7, 0]
//                   }}
//                   transition={{
//                     duration: 3,
//                     repeat: Infinity,
//                     delay: i * 0.5,
//                     ease: "easeOut"
//                   }}
//                 />
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Weather Effects */}
//         <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
//           <h5 className="font-semibold text-blue-300 mb-2">🌪️ Active Effects</h5>
//           <div className="flex flex-wrap gap-2">
//             {getWeatherEffects(currentWeather).map((effect, index) => (
//               <span
//                 key={index}
//                 className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full"
//               >
//                 {effect}
//               </span>
//             ))}
//             {getWeatherEffects(currentWeather).length === 0 && (
//               <span className="text-sm text-blue-200">No special effects</span>
//             )}
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
//             {isActive ? 'Deactivate' : 'Activate'} Weather Control
//           </Button>

//           <Button
//             variant="secondary"
//             onClick={() => setSelectedPreset('Clear')}
//           >
//             Reset to Clear
//           </Button>
//         </div>

//         {/* Energy Cost */}
//         <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
//           <p className="text-sm text-yellow-300">
//             ⚡ Energy Cost: {Math.ceil(
//               Math.abs(currentWeather.temperature - 22) * 2 +
//               Math.abs(currentWeather.humidity - 50) * 0.5 +
//               currentWeather.windSpeed * 1.5 +
//               currentWeather.precipitation * 3
//             )} units/minute
//           </p>
//           <p className="text-xs text-yellow-200">
//             More extreme weather conditions require significantly more energy
//           </p>
//         </div>
//       </div>
//     </Card>
//   )
// }

// export default WeatherControl