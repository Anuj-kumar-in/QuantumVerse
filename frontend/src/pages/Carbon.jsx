import React, { useState, useEffect } from 'react'
import { useWallet } from '../Context/WalletContext'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { TransferTransaction, AccountId, Hbar } from '@hashgraph/sdk'

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
console.log('AI API Key loaded:', geminiApiKey ? 'Key found' : 'Key missing');

const genAI = new GoogleGenerativeAI(geminiApiKey || '');

export const Carbon = () => {
  const {
    isConnected,
    connectedAccount,
    connectWallet,
    disconnectWallet,
    getSigner,
    sendHbar,
    connectionState
  } = useWallet()

  const [activeTab, setActiveTab] = useState('dashboard')
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionForm, setActionForm] = useState({
    type: 'recycle',
    amount: '',
    description: ''
  })

  const [uploadedImage, setUploadedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [aiVerificationResult, setAiVerificationResult] = useState(null)
  const [isVerifyingWithAI, setIsVerifyingWithAI] = useState(false)
  const [isSubmittingToHedera, setIsSubmittingToHedera] = useState(false)
  const [showAITips, setShowAITips] = useState(false)
  const [verificationHistory, setVerificationHistory] = useState([])
  const [submittedActions, setSubmittedActions] = useState([])

  const [metrics, setMetrics] = useState({
    totalActions: 0,
    acceptedCount: 0,
    rejectedCount: 0,
    totalOffset: 0,
    totalRewards: 0,
    verifiedActions: 0
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadStoredData = () => {
      try {
        const storedActions = localStorage.getItem('submittedActions')
        const storedMetrics = localStorage.getItem('metrics')
        const storedVerificationHistory = localStorage.getItem('verificationHistory')

        if (storedActions) {
          setSubmittedActions(JSON.parse(storedActions))
        }
        if (storedMetrics) {
          setMetrics(JSON.parse(storedMetrics))
        }
        if (storedVerificationHistory) {
          setVerificationHistory(JSON.parse(storedVerificationHistory))
        }
      } catch (error) {
        console.error('Failed to load stored data:', error)
      }
    }

    loadStoredData()
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('submittedActions', JSON.stringify(submittedActions))
      localStorage.setItem('metrics', JSON.stringify(metrics))
      localStorage.setItem('verificationHistory', JSON.stringify(verificationHistory))
    } catch (error) {
      console.error('Failed to save data:', error)
    }
  }, [submittedActions, metrics, verificationHistory])

  const handleWalletAction = async () => {
    try {
      if (isConnected) {
        disconnectWallet();
      } else {
        await connectWallet();
      }
    } catch (error) {
      console.error("Wallet action failed:", error);
      alert("Failed to connect wallet. Please try again.");
    }
  };

  const formatAccountId = (accountId) => {
    if (!accountId) return '';
    return `${accountId.slice(0, 8)}...${accountId.slice(-4)}`;
  };

  const getWalletButtonText = () => {
    if (connectionState === 'Connecting') return 'Connecting...';
    if (isConnected) return `Disconnect (${formatAccountId(connectedAccount)})`;
    return 'Connect Hedera Wallet';
  };

  const getWalletButtonClass = () => {
    const baseClass = "px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5";

    if (connectionState === 'Connecting') {
      return `${baseClass} bg-yellow-500 text-white cursor-not-allowed`;
    }

    if (isConnected) {
      return `${baseClass} bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700`;
    }

    return `${baseClass} bg-gradient-to-r from-[var(--mustard)] to-yellow-600 text-[var(--ink)] hover:opacity-90`;
  };

  const actionTypes = [
    { 
      value: 'recycle', 
      label: '♻️ Recycle', 
      multiplier: '1.0x', 
      color: 'from-green-500 to-emerald-600',
      aiTip: 'Show properly sorted recyclables at recycling centers or bins. Materials should be clean and properly separated by type.' 
    },
    { 
      value: 'transit', 
      label: '🚌 Public Transit', 
      multiplier: '1.2x', 
      color: 'from-blue-500 to-cyan-600',
      aiTip: 'Show yourself using public transportation - bus, train, metro with tickets or passes visible.' 
    },
    { 
      value: 'energy', 
      label: '💡 Energy Saving', 
      multiplier: '1.1x', 
      color: 'from-yellow-500 to-orange-600',
      aiTip: 'Show LED bulbs, smart thermostats, energy-efficient appliances, or energy monitoring devices with visible readings.' 
    },
    { 
      value: 'cleanup', 
      label: '🧹 Cleanup', 
      multiplier: '1.3x', 
      color: 'from-purple-500 to-pink-600',
      aiTip: 'Show before/after photos of cleanup activities in parks, beaches, or community areas with visible trash bags.' 
    },
    { 
      value: 'plant', 
      label: '🌱 Planting', 
      multiplier: '2.0x', 
      color: 'from-green-600 to-teal-600',
      aiTip: 'Show yourself actively planting trees or plants with tools (shovel, watering can). Include freshly planted vegetation in appropriate outdoor settings.' 
    },
    { 
      value: 'donate', 
      label: '💝 Donate Credits', 
      multiplier: '1.5x', 
      color: 'from-red-500 to-rose-600',
      aiTip: 'Show carbon credit donation receipts, certificates, or verified environmental project documentation.' 
    }
  ]

  const [challenges, setChallenges] = useState([
    {
      id: 1,
      title: "7-Day No Single-Use Plastic",
      description: "Avoid plastic bottles, bags, and utensils all week.",
      reward: 70,
      progress: 45,
      timeLeft: "4 days",
      participants: 234,
      difficulty: "Medium",
      type: "recycle"
    },
    {
      id: 2,
      title: "Neighborhood Cleanup",
      description: "Join a local cleanup for at least 1 hour.",
      reward: 150,
      progress: 78,
      timeLeft: "2 days",
      participants: 156,
      difficulty: "Easy",
      type: "cleanup"
    },
    {
      id: 3,
      title: "Transit Swap",
      description: "Replace 3 car trips with public transit.",
      reward: 50,
      progress: 33,
      timeLeft: "6 days",
      participants: 89,
      difficulty: "Easy",
      type: "transit"
    },
    {
      id: 4,
      title: "Energy Saver",
      description: "Reduce home electricity use for 1 week.",
      reward: 90,
      progress: 67,
      timeLeft: "5 days",
      participants: 112,
      difficulty: "Hard",
      type: "energy"
    }
  ])

  const [marketplaceItems, setMarketplaceItems] = useState([
    {
      id: 1,
      title: "Carbon Credit Pack",
      description: "100 g CO₂ (verified offset)",
      price: 25,
      category: "credits",
      available: true,
      icon: "🌿"
    },
    {
      id: 2,
      title: "Carbon Credit Pack",
      description: "250 g CO₂ (verified offset)",
      price: 60,
      category: "credits",
      available: true,
      icon: "🌳"
    },
    {
      id: 3,
      title: "Carbon Credit Pack",
      description: "500 g CO₂ (verified offset)",
      price: 115,
      category: "credits",
      available: true,
      icon: "🌲"
    }
  ])

  const [globalImpact, setGlobalImpact] = useState({
    co2Reduced: 2340,
    actionsLogged: 15678,
    activeUsers: 4567,
    recentActions: [
      { country: "USA", action: "Solar installation", amount: 2300, time: "2 mins ago", flag: "🇺🇸" },
      { country: "Germany", action: "Tree planting", amount: 1500, time: "5 mins ago", flag: "🇩🇪" },
      { country: "Japan", action: "EV charging", amount: 800, time: "8 mins ago", flag: "🇯🇵" },
      { country: "Brazil", action: "Recycling", amount: 450, time: "12 mins ago", flag: "🇧🇷" },
      { country: "India", action: "Energy efficiency", amount: 1200, time: "15 mins ago", flag: "🇮🇳" }
    ]
  })

  const imageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64String = reader.result
        const base64Data = base64String.split(',')[1]
        resolve(base64Data)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const verifyWithAI = async (imageFile, actionType, description, carbonSaved) => {
    setIsVerifyingWithAI(true)
    
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

      const prompt = `
        You are an expert environmental action verifier. Analyze this image to determine if it represents a valid "${actionType}" environmental action.

        USER CLAIMS:
        - Action Type: ${actionType}
        - Description: ${description}
        - Carbon Saved: ${carbonSaved} grams

        VERIFICATION CRITERIA FOR ${actionType.toUpperCase()}:
        ${getVerificationCriteria(actionType)}

        RESPONSE FORMAT (JSON ONLY):
        {
          "isValid": boolean,
          "confidence": number (0-100),
          "reasoning": "detailed explanation of what you see and why it validates or invalidates the claim",
          "suggestedReward": number (percentage of claimed amount: 0-200),
          "detectedElements": ["list", "of", "key", "elements", "seen"],
          "redFlags": ["any", "suspicious", "elements"],
          "recommendations": ["suggestions", "for", "improvement"],
          "carbonSavedAssessment": "assessment of claimed carbon savings accuracy"
        }

        Be thorough but fair. Look for genuine environmental action, not stock photos or staged scenes.
      `

      const base64Image = await imageToBase64(imageFile)

      const result = await model.generateContent([
        {
          inlineData: {
            data: base64Image,
            mimeType: imageFile.type
          }
        },
        { text: prompt }
      ])

      const responseText = result.response.text()
      console.log('🤖 Raw AI Response:', responseText)

      let aiAnalysis
      try {
        const jsonMatch = responseText.match(/``````/) || 
                        responseText.match(/``````/)
        
        const jsonText = jsonMatch ? jsonMatch[1] : responseText
        aiAnalysis = JSON.parse(jsonText.trim())
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError)
        throw new Error(`AI returned invalid JSON: ${parseError.message}`)
      }

      const verificationResult = {
        ...aiAnalysis,
        timestamp: Date.now(),
        actionType,
        userClaims: { actionType, description, carbonSaved }
      }

      setAiVerificationResult(verificationResult)
      setVerificationHistory(prev => [verificationResult, ...prev.slice(0, 9)])

      console.log('✅ AI Verification Complete:', verificationResult)
      return verificationResult

    } catch (error) {
      console.error('❌ AI Verification failed:', error)
      const errorResult = {
        isValid: false,
        confidence: 0,
        reasoning: 'AI verification failed due to technical error. Manual review required.',
        suggestedReward: 0,
        detectedElements: [],
        redFlags: ['AI verification error'],
        recommendations: ['Please try uploading again or contact support'],
        timestamp: Date.now(),
        actionType,
        error: error.message
      }
      setAiVerificationResult(errorResult)
      return errorResult
    } finally {
      setIsVerifyingWithAI(false)
    }
  }

  const getVerificationCriteria = (actionType) => {
    const criteria = {
      'recycle': `
        ✅ VALID: Properly sorted recyclables, recycling bins/centers, clean separated materials (plastic, glass, paper, metal)
        ❌ INVALID: Regular trash, contaminated materials, mixed unsorted waste, non-recyclable items
        🔍 LOOK FOR: Proper sorting, clean materials, recycling symbols, appropriate recycling infrastructure
      `,
      'transit': `
        ✅ VALID: Person using public transportation, bus/train/metro tickets or passes, transit stations, public vehicles
        ❌ INVALID: Private vehicles, taxis, ride-sharing cars, fake tickets, stock photos
        🔍 LOOK FOR: Public transit signage, tickets/passes, metro/bus stations, multiple passengers
      `,
      'energy': `
        ✅ VALID: LED bulbs being installed, smart thermostats, energy-efficient appliances with ratings, energy monitoring devices
        ❌ INVALID: Incandescent bulbs, old equipment, fake labels, stock photos of products
        🔍 LOOK FOR: Energy Star labels, installation process, modern efficient equipment, actual improvements, visible energy readings
      `,
      'cleanup': `
        ✅ VALID: Before/after cleanup photos, trash bags filled with collected waste, cleaning in progress, outdoor cleanup areas
        ❌ INVALID: Clean areas without evidence of cleanup, staged photos, indoor cleaning, personal trash removal
        🔍 LOOK FOR: Visible trash collection, outdoor public areas, before/after comparison, community cleanup activity
      `,
      'plant': `
        ✅ VALID: Person actively planting trees/plants, freshly planted vegetation, gardening tools in use, appropriate outdoor settings
        ❌ INVALID: Indoor plants, mature plants not recently planted, fake plants, decorative arrangements, stock photos
        🔍 LOOK FOR: Dirt on hands/tools, appropriate outdoor location, young plants/saplings, planting activity in progress
      `,
      'donate': `
        ✅ VALID: Carbon credit donation receipts, verified certificates, environmental project documentation, official donation confirmations
        ❌ INVALID: Fake certificates, unverified claims, generic environmental images, personal donations unrelated to carbon
        🔍 LOOK FOR: Official receipts, verified project documentation, recognized carbon credit providers, donation confirmations
      `
    }
    return criteria[actionType] || 'Analyze for general environmental benefit and authenticity'
  }

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('❌ Please select an image file (JPG, PNG, GIF, etc.)')
        return
      }
      
      if (file.size > 10 * 1024 * 1024) {
        alert('❌ Please select an image smaller than 10MB')
        return
      }

      setUploadedImage(file)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result)
      }
      reader.readAsDataURL(file)

      setAiVerificationResult(null)
    }
  }

  const submitToHedera = async (actionData) => {
    if (!isConnected || !connectedAccount) {
      throw new Error('Wallet not connected')
    }

    setIsSubmittingToHedera(true)
    
    try {
      const signer = getSigner()
      
      const blockchainData = {
        accountId: connectedAccount,
        actionType: actionData.type,
        description: actionData.description,
        amount: actionData.amount,
        timestamp: Date.now(),
        aiVerified: actionData.aiVerified,
        aiApproved: actionData.aiApproved,
        aiConfidence: actionData.aiConfidence
      }

      const memo = `CARBON-ACTION:${actionData.type}:${actionData.amount}g:AI-${actionData.aiApproved ? 'APPROVED' : 'REJECTED'}:${actionData.aiConfidence}%`
      
      const transaction = new TransferTransaction()
        .addHbarTransfer(AccountId.fromString(connectedAccount), new Hbar(-0.001))
        .addHbarTransfer(AccountId.fromString("0.0.34"), new Hbar(0.001))
        .setTransactionMemo(memo)

      const frozenTx = await transaction.freezeWithSigner(signer)
      const response = await frozenTx.executeWithSigner(signer)
      const receipt = await response.getReceiptWithSigner(signer)
      
      console.log('✅ Hedera transaction successful:', receipt.transactionId?.toString())
      
      return {
        success: true,
        transactionId: receipt.transactionId?.toString(),
        data: blockchainData
      }

    } catch (error) {
      console.error('❌ Hedera transaction failed:', error)
      throw error
    } finally {
      setIsSubmittingToHedera(false)
    }
  }

  const handleSubmitAction = async () => {
    if (!actionForm.amount || !actionForm.description) {
      alert('❌ Please fill in all required fields')
      return
    }

    if (!uploadedImage) {
      alert('❌ Please upload an image for AI verification')
      return
    }

    if (!isConnected) {
      alert('❌ Please connect your Hedera wallet first')
      return
    }

    setIsLoading(true)

    try {
      console.log('🤖 Starting AI verification...')
      const aiResult = await verifyWithAI(
        uploadedImage, 
        actionForm.type, 
        actionForm.description, 
        parseInt(actionForm.amount) || 100
      )

      console.log('🔗 Submitting to Hedera blockchain...')
      const hederaResult = await submitToHedera({
        type: actionForm.type,
        amount: parseInt(actionForm.amount) || 100,
        description: actionForm.description,
        aiVerified: true,
        aiApproved: aiResult.isValid,
        aiConfidence: aiResult.confidence
      })

      if (hederaResult.success) {
        const newAction = {
          ...hederaResult.data,
          transactionId: hederaResult.transactionId,
          aiResult: aiResult,
          rewardAmount: aiResult.isValid ? (parseInt(actionForm.amount || 100) * (aiResult.suggestedReward / 100)) : 0
        }
        
        setSubmittedActions(prev => [newAction, ...prev])
        
        setMetrics(prev => ({
          totalActions: prev.totalActions + 1,
          acceptedCount: prev.acceptedCount + (aiResult.isValid ? 1 : 0),
          rejectedCount: prev.rejectedCount + (aiResult.isValid ? 0 : 1),
          totalOffset: prev.totalOffset + (parseInt(actionForm.amount || 100) / 1000),
          totalRewards: prev.totalRewards + (newAction.rewardAmount || 0),
          verifiedActions: prev.verifiedActions + (aiResult.isValid ? 1 : 0)
        }))

        setShowActionModal(false)
        setActionForm({
          type: 'recycle',
          amount: '',
          description: ''
        })
        setUploadedImage(null)
        setImagePreview('')
        setAiVerificationResult(null)
        
        const status = aiResult.isValid ? "APPROVED" : "REJECTED"
        const message = `🎉 Action submitted successfully to Hedera!

🔗 Transaction ID: ${hederaResult.transactionId}
🤖 AI ${status} (${aiResult.confidence}% confidence)
💰 Reward: ${newAction.rewardAmount} CARBON

${aiResult.reasoning}`
        
        alert(message)
      }
    } catch (error) {
      console.error('❌ Submission failed:', error)
      alert(`❌ Submission failed: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const getVerificationStatus = (action) => {
    if (action.aiResult?.isValid) {
      return { 
        status: 'ai-approved', 
        icon: '🤖', 
        text: `AI Approved (${action.aiResult.confidence}%)`, 
        color: 'text-green-400' 
      }
    } else if (action.aiResult) {
      return { 
        status: 'ai-rejected', 
        icon: '❌', 
        text: `AI Rejected (${action.aiResult.confidence}%)`, 
        color: 'text-red-400' 
      }
    } else {
      return { status: 'pending', icon: '⏳', text: 'Pending Verification', color: 'text-yellow-400' }
    }
  }

  const handleNavigation = (tabId) => {
    setActiveTab(tabId)
    const element = document.getElementById(tabId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  }

  return (
    <>
      <style>{`
        :root {
          --ink: #0a0a0f;
          --pane: #1a1a2e;
          --mustard: #ffd700;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--mustard);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d4a942;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-[var(--ink)] via-gray-900 to-[var(--ink)] text-white">
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-6">
          
          {/* Hero Banner */}
          <section className="relative bg-gradient-to-br from-[var(--pane)] via-[var(--ink)] to-[var(--pane)] rounded-3xl p-8 md:p-10 shadow-2xl border border-gray-800 overflow-hidden fade-in">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--mustard)] opacity-5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500 opacity-5 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--mustard)] to-yellow-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                  🌍
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[var(--mustard)] to-yellow-600 bg-clip-text text-transparent">
                    QuantumVerse Carbon Rewards
                  </h1>
                  <p className="text-gray-400 text-sm mt-1">
                    Powered by AI & Hedera Blockchain
                  </p>
                </div>
              </div>
              
              <p className="text-gray-300 text-lg mb-6 max-w-3xl">
                Earn tokens for real-world positive actions — recycling, transit, energy savings, and verified missions with instant AI verification and Hedera blockchain integration.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-3">
                  {isConnected ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm font-medium">
                        Connected: {formatAccountId(connectedAccount)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-red-400 text-sm font-medium">
                        Wallet Disconnected
                      </span>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={handleWalletAction}
                  disabled={connectionState === 'Connecting'}
                  className={getWalletButtonClass()}
                >
                  🔷 {getWalletButtonText()}
                </button>
              </div>
            </div>
          </section>

          {/* Navigation Tabs */}
          <nav className="bg-gradient-to-r from-[var(--pane)] to-[var(--ink)] rounded-2xl p-2 shadow-2xl border border-gray-800 fade-in">
            <ul className="flex flex-wrap justify-center gap-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                { id: 'submit', label: 'Submit Action', icon: '📤' },
                { id: 'verification', label: 'AI Verification', icon: '🤖' },
                { id: 'marketplace', label: 'Marketplace', icon: '🛒' },
                { id: 'challenges', label: 'Challenges', icon: '🏆' },
                { id: 'impact', label: 'Global Impact', icon: '🌍' }
              ].map((tab) => (
                <li key={tab.id}>
                  <button 
                    onClick={() => handleNavigation(tab.id)}
                    className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                      activeTab === tab.id 
                        ? 'bg-gradient-to-r from-[var(--mustard)] to-yellow-600 text-[var(--ink)] shadow-lg' 
                        : 'text-gray-400 hover:text-[var(--mustard)] hover:bg-[var(--ink)]/50'
                    }`}
                  >
                    <span className="mr-1">{tab.icon}</span>
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Dashboard Section */}
          <section id="dashboard" className="space-y-6 fade-in">
            <div className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h2>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {[
                  { label: 'Total Actions', value: metrics.totalActions, icon: '📋', color: 'from-blue-500 to-cyan-600' },
                  { label: 'Accepted', value: metrics.acceptedCount, icon: '✅', color: 'from-green-500 to-emerald-600' },
                  { label: 'Rejected', value: metrics.rejectedCount, icon: '❌', color: 'from-red-500 to-rose-600' },
                  { label: 'Total Offset', value: `${metrics.totalOffset.toFixed(2)} kg`, icon: '🌱', color: 'from-emerald-500 to-teal-600' },
                  { label: 'Total Rewards', value: `${metrics.totalRewards.toFixed(0)}`, icon: '💰', color: 'from-yellow-500 to-orange-600' },
                  { label: 'Verified Actions', value: metrics.verifiedActions, icon: '🤖', color: 'from-purple-500 to-pink-600' }
                ].map((metric, index) => (
                  <div key={index} className="bg-gradient-to-br from-[var(--ink)] to-gray-900 p-5 rounded-2xl border border-gray-800 hover:border-[var(--mustard)]/50 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm font-medium">{metric.label}</span>
                      <div className={`w-10 h-10 bg-gradient-to-br ${metric.color} rounded-xl flex items-center justify-center shadow-lg`}>
                        <span className="text-xl">{metric.icon}</span>
                      </div>
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-white">{metric.value}</div>
                  </div>
                ))}
              </div>

              {/* AI Analysis & Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Latest AI Analysis */}
                <div className="bg-gradient-to-br from-[var(--ink)] to-gray-900 rounded-2xl p-6 border border-gray-800">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🧠</span>
                    </div>
                    <h4 className="font-semibold text-lg text-[var(--mustard)]">Latest AI Analysis</h4>
                  </div>
                  
                  {aiVerificationResult ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-[var(--pane)]/50 rounded-xl">
                        <span className="text-gray-400">Status:</span>
                        <span className={`font-semibold ${aiVerificationResult.isValid ? 'text-green-400' : 'text-red-400'}`}>
                          {aiVerificationResult.isValid ? '✅ Valid' : '❌ Invalid'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-[var(--pane)]/50 rounded-xl">
                        <span className="text-gray-400">Confidence:</span>
                        <span className="text-[var(--mustard)] font-bold">{aiVerificationResult.confidence}%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-[var(--pane)]/50 rounded-xl">
                        <span className="text-gray-400">Action:</span>
                        <span className="text-white font-medium capitalize">{aiVerificationResult.actionType}</span>
                      </div>
                      <div className="p-4 bg-[var(--pane)]/70 rounded-xl border border-gray-700">
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {aiVerificationResult.reasoning}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-5xl mb-3 opacity-30">🤖</div>
                      <p className="text-gray-500">No AI analysis yet. Submit an action with photo to see results.</p>
                    </div>
                  )}
                </div>

                {/* Verification Stats */}
                <div className="bg-gradient-to-br from-[var(--ink)] to-gray-900 rounded-2xl p-6 border border-gray-800">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <span className="text-lg">📊</span>
                    </div>
                    <h4 className="font-semibold text-lg text-[var(--mustard)]">Verification Stats</h4>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { label: 'Total Analyses', value: verificationHistory.length, color: 'text-[var(--mustard)]' },
                      { label: 'Approved', value: verificationHistory.filter(v => v.isValid).length, color: 'text-green-400' },
                      { label: 'Success Rate', value: `${verificationHistory.length ? Math.round((verificationHistory.filter(v => v.isValid).length / verificationHistory.length) * 100) : 0}%`, color: 'text-[var(--mustard)]' },
                      { label: 'Avg Confidence', value: `${verificationHistory.length ? Math.round(verificationHistory.reduce((acc, v) => acc + v.confidence, 0) / verificationHistory.length) : 0}%`, color: 'text-[var(--mustard)]' }
                    ].map((stat, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-[var(--pane)]/50 rounded-xl">
                        <span className="text-gray-400">{stat.label}:</span>
                        <span className={`font-bold text-lg ${stat.color}`}>{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Actions */}
              <div className="bg-gradient-to-br from-[var(--ink)] to-gray-900 rounded-2xl p-6 border border-gray-800">
                <h4 className="font-semibold text-lg text-[var(--mustard)] mb-4 flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  Recent Actions
                </h4>
                
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {submittedActions.length > 0 ? submittedActions.map((action, index) => {
                    const verification = getVerificationStatus(action)
                    const actionType = actionTypes.find(t => t.value === action.actionType)
                    
                    return (
                      <div 
                        key={index} 
                        className="group bg-[var(--pane)]/30 rounded-2xl p-5 border border-gray-800 hover:border-[var(--mustard)]/50 transition-all duration-300 hover:shadow-lg"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-14 h-14 bg-gradient-to-br ${actionType?.color || 'from-gray-500 to-gray-600'} rounded-xl flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
                            {actionType?.label.split(' ')[0] || '🌱'}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div>
                                <h5 className="font-bold text-lg text-white capitalize group-hover:text-[var(--mustard)] transition-colors">
                                  {action.actionType.replace('-', ' ')}
                                </h5>
                                <p className="text-sm text-gray-400 mt-1">
                                  {action.amount}g CO₂ • {new Date(action.timestamp).toLocaleDateString()}
                                </p>
                              </div>
                              
                              <div className="text-right">
                                <div className={`text-sm font-semibold mb-1 ${verification.color}`}>
                                  {verification.icon} {verification.text}
                                </div>
                                <div className="text-[var(--mustard)] font-bold text-lg">
                                  {action.rewardAmount ? `${action.rewardAmount.toFixed(0)} CARBON` : 'Pending'}
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                              {action.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-2">
                              <span className="text-xs bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30 font-medium">
                                🔷 {action.transactionId?.substring(0, 12)}...
                              </span>
                              <span className="text-xs bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30 font-medium">
                                🤖 AI Verified
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  }) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4 opacity-20">📋</div>
                      <p className="text-gray-500">No actions submitted yet.</p>
                      <p className="text-gray-600 text-sm mt-2">Start by submitting your first environmental action!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Submit Action Section */}
          <section id="submit" className="fade-in">
            <div className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-500/10 rounded-xl">
                  <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">Submit Action</h2>
              </div>

              {!isConnected ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl flex items-center justify-center text-5xl shadow-2xl">
                    🔷
                  </div>
                  <h4 className="text-2xl font-bold mb-3 text-white">Connect Your Hedera Wallet</h4>
                  <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    Connect your Hedera wallet to submit environmental actions to the blockchain and earn rewards.
                  </p>
                  <button 
                    onClick={handleWalletAction}
                    disabled={connectionState === 'Connecting'}
                    className={getWalletButtonClass()}
                  >
                    🔷 {getWalletButtonText()}
                  </button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleSubmitAction(); }} className="space-y-6">
                  {/* Action Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Action Type</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {actionTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => {
                            setActionForm(prev => ({ ...prev, type: type.value }))
                            setShowAITips(true)
                          }}
                          className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                            actionForm.type === type.value
                              ? `bg-gradient-to-br ${type.color} border-transparent shadow-lg transform scale-105`
                              : 'bg-[var(--ink)] border-gray-700 hover:border-[var(--mustard)]/50'
                          }`}
                        >
                          <div className="text-3xl mb-2">{type.label.split(' ')[0]}</div>
                          <div className="text-sm font-semibold text-white">{type.label.split(' ').slice(1).join(' ')}</div>
                          <div className="text-xs text-gray-400 mt-1">{type.multiplier}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI Tips */}
                  {showAITips && (
                    <div className="p-5 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-2xl">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-xl">🤖</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-300 mb-2">AI Verification Tips:</h4>
                          <p className="text-sm text-gray-300 leading-relaxed">
                            {actionTypes.find(t => t.value === actionForm.type)?.aiTip}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Carbon Amount */}
                  <div>
                    <label htmlFor="carbonAmount" className="block text-sm font-medium text-gray-300 mb-2">
                      Carbon Saved (grams)
                    </label>
                    <input 
                      id="carbonAmount"
                      type="number"
                      value={actionForm.amount}
                      onChange={(e) => setActionForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="Enter amount of CO₂ saved (optional)"
                      className="w-full bg-[var(--ink)] text-white border-2 border-gray-700 focus:border-[var(--mustard)] rounded-xl p-4 transition-colors outline-none"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea 
                      id="description" 
                      rows="4" 
                      value={actionForm.description}
                      onChange={(e) => setActionForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="What did you do? Where/when? Be specific for better AI verification..."
                      className="w-full bg-[var(--ink)] text-white border-2 border-gray-700 focus:border-[var(--mustard)] rounded-xl p-4 transition-colors outline-none resize-none"
                    ></textarea>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label htmlFor="evidenceFile" className="block text-sm font-medium text-gray-300 mb-2">
                      📸 Evidence File (Required for AI Verification)
                    </label>
                    <div className="relative">
                      <input 
                        id="evidenceFile" 
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="w-full text-sm file:mr-4 file:px-6 file:py-3 file:rounded-xl file:bg-gradient-to-r file:from-[var(--mustard)] file:to-yellow-600 file:text-[var(--ink)] file:border-0 file:font-semibold file:shadow-lg hover:file:opacity-90 file:transition-all cursor-pointer bg-[var(--ink)] border-2 border-dashed border-gray-700 rounded-xl p-4" 
                      />
                    </div>
                    
                    {imagePreview && (
                      <div className="mt-4 space-y-3">
                        <div className="relative group">
                          <img 
                            src={imagePreview} 
                            alt="Proof preview" 
                            className="w-full max-w-md h-64 object-cover rounded-2xl border-2 border-[var(--mustard)] shadow-xl"
                          />
                          <div className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            <span className="text-xs font-semibold text-white">Ready for AI</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {isVerifyingWithAI && (
                      <div className="mt-4 p-4 bg-blue-900/30 border border-blue-500/30 rounded-xl flex items-center gap-3">
                        <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        <div>
                          <p className="text-blue-300 font-semibold">AI analyzing image...</p>
                          <p className="text-blue-400/70 text-sm">This may take a few seconds</p>
                        </div>
                      </div>
                    )}

                    {isSubmittingToHedera && (
                      <div className="mt-4 p-4 bg-purple-900/30 border border-purple-500/30 rounded-xl flex items-center gap-3">
                        <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                        <div>
                          <p className="text-purple-300 font-semibold">Submitting to Hedera blockchain...</p>
                          <p className="text-purple-400/70 text-sm">Confirming transaction</p>
                        </div>
                      </div>
                    )}

                    {aiVerificationResult && (
                      <div className="mt-4 p-5 bg-gradient-to-br from-[var(--ink)] to-gray-900 rounded-2xl border-2 border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                            aiVerificationResult.isValid ? 'bg-green-500/20' : 'bg-red-500/20'
                          }`}>
                            {aiVerificationResult.isValid ? '✅' : '❌'}
                          </div>
                          <div>
                            <h5 className="font-bold text-lg text-white flex items-center gap-2">
                              🤖 AI Verification Result:
                              <span className={aiVerificationResult.isValid ? 'text-green-400' : 'text-red-400'}>
                                {aiVerificationResult.isValid ? 'APPROVED' : 'REJECTED'}
                              </span>
                            </h5>
                            <p className="text-blue-400 text-sm">Confidence: {aiVerificationResult.confidence}%</p>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-[var(--pane)]/50 rounded-xl mb-3">
                          <p className="text-sm text-gray-300 leading-relaxed">
                            {aiVerificationResult.reasoning}
                          </p>
                        </div>
                        
                        {aiVerificationResult.detectedElements?.length > 0 && (
                          <div className="mb-2">
                            <span className="text-xs font-semibold text-green-300">Detected: </span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {aiVerificationResult.detectedElements.map((element, i) => (
                                <span key={i} className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-lg border border-green-500/30">
                                  {element}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {aiVerificationResult.redFlags?.length > 0 && (
                          <div>
                            <span className="text-xs font-semibold text-red-300">Red flags: </span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {aiVerificationResult.redFlags.map((flag, i) => (
                                <span key={i} className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-lg border border-red-500/30">
                                  {flag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit"
                    disabled={!actionForm.description || !uploadedImage || isVerifyingWithAI || isSubmittingToHedera || !isConnected}
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 ${
                      (!actionForm.description || !uploadedImage || isVerifyingWithAI || isSubmittingToHedera || !isConnected) 
                        ? 'opacity-50 cursor-not-allowed bg-gray-700 text-gray-500' 
                        : 'bg-gradient-to-r from-[var(--mustard)] to-yellow-600 text-[var(--ink)] hover:opacity-90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
                  >
                    {isVerifyingWithAI ? '🤖 AI Analyzing...' : 
                     isSubmittingToHedera ? '🔷 Submitting to Hedera...' : 
                     isLoading ? '⏳ Processing...' :
                     '🚀 Submit with AI Verification + Hedera'}
                  </button>
                </form>
              )}
            </div>
          </section>

          {/* AI Verification History Section */}
          <section id="verification" className="fade-in">
            <div className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-500/10 rounded-xl">
                  <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">AI Verification History</h2>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {verificationHistory.length > 0 ? verificationHistory.map((verification, index) => (
                  <div key={index} className="bg-gradient-to-r from-[var(--ink)] to-gray-900 rounded-2xl p-5 border border-gray-800 hover:border-[var(--mustard)]/50 transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                          verification.isValid ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}>
                          {verification.isValid ? '✅' : '❌'}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-bold text-white capitalize text-lg">
                            {verification.actionType?.replace('-', ' ')}
                          </h5>
                          <p className="text-sm text-gray-400 mt-1">
                            {new Date(verification.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className={`text-sm font-semibold ${verification.isValid ? 'text-green-400' : 'text-red-400'}`}>
                            {verification.isValid ? 'Approved' : 'Rejected'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {verification.confidence}% confidence
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {verification.reasoning && (
                      <div className="mt-3 p-3 bg-[var(--pane)]/50 rounded-xl">
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {verification.reasoning}
                        </p>
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4 opacity-20">🤖</div>
                    <p className="text-gray-500">No verifications yet.</p>
                    <p className="text-gray-600 text-sm mt-2">Submit actions with images to see AI verification results</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Marketplace Section */}
          <section id="marketplace" className="fade-in">
            <div className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-500/10 rounded-xl">
                  <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">Marketplace</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {marketplaceItems.map((item, index) => (
                  <div key={item.id} className="group bg-gradient-to-br from-[var(--ink)] to-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-[var(--mustard)]/50 transition-all duration-300 hover:shadow-xl">
                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {item.icon}
                    </div>
                    <h3 className="font-bold text-xl text-white mb-2">{item.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{item.description}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                      <div className="text-[var(--mustard)] font-bold text-2xl">
                        {item.price}
                        <span className="text-sm ml-1">CARBON</span>
                      </div>
                      <button 
                        className="px-5 py-2 bg-gradient-to-r from-[var(--mustard)] to-yellow-600 text-[var(--ink)] rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5" 
                        disabled={!item.available}
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Challenges Section */}
          <section id="challenges" className="fade-in">
            <div className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-500/10 rounded-xl">
                  <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">Challenges</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {challenges.map((challenge, index) => (
                  <div key={challenge.id} className="group bg-gradient-to-br from-[var(--ink)] to-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-[var(--mustard)]/50 transition-all duration-300 hover:shadow-xl">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-white group-hover:text-[var(--mustard)] transition-colors mb-2">
                          {challenge.title}
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          {challenge.description}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(challenge.difficulty)}`}>
                        {challenge.difficulty}
                      </div>
                    </div>
                    
                    <div className="mb-4 p-3 bg-[var(--pane)]/50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Reward</span>
                        <span className="text-[var(--mustard)] font-bold text-lg">{challenge.reward} pts</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-[var(--mustard)] font-semibold">{challenge.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-[var(--mustard)] to-yellow-600 h-3 rounded-full transition-all duration-500 shadow-lg"
                          style={{ width: `${challenge.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-3">
                        <span className="flex items-center gap-1">
                          ⏰ {challenge.timeLeft}
                        </span>
                        <span className="flex items-center gap-1">
                          👥 {challenge.participants} participants
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Global Impact Section */}
          <section id="impact" className="fade-in">
            <div className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-500/10 rounded-xl">
                  <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">Global Impact</h2>
              </div>
              
              {/* Global Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  { label: 'CO₂ Reduced', value: `${globalImpact.co2Reduced} tons`, icon: '🌿', color: 'from-green-500 to-emerald-600' },
                  { label: 'Actions Logged', value: globalImpact.actionsLogged.toLocaleString(), icon: '📊', color: 'from-blue-500 to-cyan-600' },
                  { label: 'Active Users', value: globalImpact.activeUsers.toLocaleString(), icon: '👥', color: 'from-purple-500 to-pink-600' }
                ].map((stat, index) => (
                  <div key={index} className="bg-gradient-to-br from-[var(--ink)] to-gray-900 p-6 rounded-2xl border border-gray-800 hover:border-[var(--mustard)]/50 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-400 text-sm font-medium">{stat.label}</span>
                      <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                        <span className="text-2xl">{stat.icon}</span>
                      </div>
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Recent Global Actions */}
              <div className="bg-gradient-to-br from-[var(--ink)] to-gray-900 rounded-2xl p-6 border border-gray-800">
                <h4 className="font-semibold text-lg text-[var(--mustard)] mb-4 flex items-center gap-2">
                  <span className="text-2xl">🌍</span>
                  Recent Global Actions
                </h4>
                
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {globalImpact.recentActions.map((action, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-4 bg-[var(--pane)]/30 rounded-xl border border-gray-800 hover:border-[var(--mustard)]/30 transition-all duration-200"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{action.flag}</div>
                        <div>
                          <div className="font-semibold text-white text-lg">{action.country}</div>
                          <div className="text-sm text-gray-400 mt-1">{action.action}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[var(--mustard)] font-bold text-lg">
                          {action.amount}g CO₂
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{action.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="mt-6 bg-gradient-to-br from-[var(--ink)] to-gray-900 rounded-2xl p-12 border-2 border-dashed border-gray-700 text-center">
                <div className="text-7xl mb-6 opacity-30">🗺️</div>
                <h4 className="text-2xl font-bold text-white mb-3">Global Impact Visualization</h4>
                <p className="text-gray-400">Real-time environmental action tracking worldwide</p>
                <p className="text-gray-600 text-sm mt-2">Coming soon: Interactive world map with live action updates</p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="text-center py-8 fade-in">
            <div className="inline-block px-6 py-3 bg-gradient-to-r from-[var(--pane)] to-[var(--ink)] rounded-2xl border border-gray-800">
              <p className="text-gray-400 text-sm">
                © 2025 <span className="text-[var(--mustard)] font-semibold">QuantumVerse</span> - Carbon Rewards Platform
              </p>
              <p className="text-gray-600 text-xs mt-1">
                Powered by AI + Hedera Blockchain
              </p>
            </div>
          </footer>
        </main>
      </div>
    </>
  )
}

export default Carbon
