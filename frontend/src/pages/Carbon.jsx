import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '../hooks/useWallet'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
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
    type: 'renewable-energy',
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
    const baseClass = "px-4 py-2 rounded transition-colors font-medium";

    if (connectionState === 'Connecting') {
      return `${baseClass} bg-yellow-500 text-white cursor-not-allowed`;
    }

    if (isConnected) {
      return `${baseClass} bg-green-500 text-white hover:bg-green-600`;
    }

    return `${baseClass} bg-carbon-600 text-white hover:bg-carbon-700 border-2 border-carbon-400`;
  };

  const [challenges, setChallenges] = useState([
    {
      id: 1,
      title: "Plant 100 Trees Challenge",
      description: "Help reforest our planet by planting trees in your community",
      reward: 5000,
      progress: 67,
      timeLeft: "23 days",
      participants: 1234,
      difficulty: "Medium",
      type: "tree-planting"
    },
    {
      id: 2,
      title: "Solar Panel Installation Sprint",
      description: "Switch to renewable energy and earn massive rewards",
      reward: 8000,
      progress: 23,
      timeLeft: "45 days", 
      participants: 567,
      difficulty: "Hard",
      type: "renewable-energy"
    },
    {
      id: 3,
      title: "Zero Waste Week",
      description: "Go completely zero waste for 7 consecutive days",
      reward: 3000,
      progress: 89,
      timeLeft: "5 days",
      participants: 2341,
      difficulty: "Easy",
      type: "recycling"
    },
    {
      id: 4,
      title: "EV Road Trip Challenge",
      description: "Complete a 1000km journey using only electric vehicles",
      reward: 6500,
      progress: 45,
      timeLeft: "30 days",
      participants: 789,
      difficulty: "Hard",
      type: "electric-vehicle"
    }
  ])

  const [marketplaceItems, setMarketplaceItems] = useState([
    {
      id: 1,
      title: "Verified Solar Panel Credits",
      description: "1 ton CO₂ offset from certified solar installations",
      price: 250,
      seller: "SolarGreen Corp",
      rating: 4.8,
      image: "🔋",
      verified: true,
      category: "energy"
    },
    {
      id: 2,
      title: "Rainforest Protection Credits",
      description: "Support Amazon rainforest conservation projects",
      price: 180,
      seller: "Forest Guardian",
      rating: 4.9,
      image: "🌳",
      verified: true,
      category: "forestry"
    },
    {
      id: 3,
      title: "Ocean Cleanup Tokens",
      description: "Fund ocean plastic removal operations",
      price: 320,
      seller: "OceanSave",
      rating: 4.7,
      image: "🌊",
      verified: true,
      category: "ocean"
    },
    {
      id: 4,
      title: "Wind Energy Certificates",
      description: "2 tons CO₂ offset from wind farm operations",
      price: 450,
      seller: "WindPower Inc",
      rating: 4.6,
      image: "💨",
      verified: true,
      category: "energy"
    }
  ])

  const [globalImpact, setGlobalImpact] = useState({
    totalUsers: 45678,
    carbonOffset: 234567,
    treesPlanted: 123456,
    countriesActive: 78,
    recentActions: [
      { country: "USA", action: "Solar installation", amount: 2300, time: "2 mins ago" },
      { country: "Germany", action: "Tree planting", amount: 1500, time: "5 mins ago" },
      { country: "Japan", action: "EV charging", amount: 800, time: "8 mins ago" },
      { country: "Brazil", action: "Recycling", amount: 450, time: "12 mins ago" },
      { country: "India", action: "Energy efficiency", amount: 1200, time: "15 mins ago" }
    ]
  })

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'actions', label: 'Submit Action', icon: '🌱' },
    { id: 'ai-verification', label: 'AI Verification', icon: '🤖' },
    { id: 'marketplace', label: 'Marketplace', icon: '🏪' },
    { id: 'challenges', label: 'Challenges', icon: '🏆' },
    { id: 'impact', label: 'Global Impact', icon: '🌍' }
  ]

  const actionTypes = [
    { 
      value: 'renewable-energy', 
      label: '⚡ Renewable Energy', 
      multiplier: '1.2x', 
      aiTip: 'Show solar panels, wind turbines, or renewable energy systems actively generating power. Include inverters, meters, or grid connections.' 
    },
    { 
      value: 'tree-planting', 
      label: '🌳 Tree Planting', 
      multiplier: '2.0x', 
      aiTip: 'Show yourself actively planting trees with tools (shovel, watering can). Include freshly planted saplings in appropriate outdoor settings.' 
    },
    { 
      value: 'carbon-offset', 
      label: '💨 Carbon Offset', 
      multiplier: '1.5x', 
      aiTip: 'Show carbon offset certificates, environmental project documentation, or verified carbon credit purchases.' 
    },
    { 
      value: 'electric-vehicle', 
      label: '🚗 Electric Vehicle', 
      multiplier: '1.2x', 
      aiTip: 'Show electric vehicle at charging station with charging cable connected. Include EV badge or charging port visible.' 
    },
    { 
      value: 'energy-efficiency', 
      label: '💡 Energy Efficiency', 
      multiplier: '1.1x', 
      aiTip: 'Show LED bulbs, smart thermostats, energy-efficient appliances, or insulation improvements. Include energy rating labels.' 
    },
    { 
      value: 'recycling', 
      label: '♻️ Recycling', 
      multiplier: '1.0x', 
      aiTip: 'Show properly sorted recyclables at recycling centers or bins. Materials should be clean and properly separated by type.' 
    }
  ]

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
        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                      responseText.match(/```\s*([\s\S]*?)\s*```/)

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
      'renewable-energy': `
        ✅ VALID: Solar panels on roof/ground, wind turbines, renewable energy installations, power inverters, energy meters showing generation
        ❌ INVALID: Stock photos, toy models, posters, unconnected equipment, indoor displays
        🔍 LOOK FOR: Actual electrical connections, outdoor installations, functioning equipment, realistic scale
      `,
      'tree-planting': `
        ✅ VALID: Person actively planting trees, freshly planted saplings, gardening tools in use, outdoor natural settings
        ❌ INVALID: Indoor plants, fake plants, stock photos, mature trees (not recently planted), decorative plants
        🔍 LOOK FOR: Dirt on hands/tools, appropriate outdoor location, young trees/saplings, planting activity
      `,
      'recycling': `
        ✅ VALID: Properly sorted recyclables, recycling bins/centers, clean separated materials (plastic, glass, paper, metal)
        ❌ INVALID: Regular trash, contaminated materials, mixed unsorted waste, non-recyclable items
        🔍 LOOK FOR: Proper sorting, clean materials, recycling symbols, appropriate recycling infrastructure
      `,
      'electric-vehicle': `
        ✅ VALID: Electric vehicle connected to charging station, charging cable plugged in, EV charging port visible, charging infrastructure
        ❌ INVALID: Gas vehicles, toy cars, vehicles not charging, hybrid vehicles, charging without connection
        🔍 LOOK FOR: Charging cable connection, EV badge/labeling, charging station equipment, charging port
      `,
      'energy-efficiency': `
        ✅ VALID: LED bulbs being installed, smart thermostats, energy-efficient appliances with ratings, insulation work
        ❌ INVALID: Incandescent bulbs, old equipment, fake labels, stock photos of products
        🔍 LOOK FOR: Energy Star labels, installation process, modern efficient equipment, actual improvements
      `,
      'carbon-offset': `
        ✅ VALID: Carbon offset certificates, verified carbon credit documentation, environmental project participation
        ❌ INVALID: Fake certificates, generic environmental images, unverified claims
        🔍 LOOK FOR: Official certificates, project documentation, verified carbon credit providers
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
        data: {
          accountId: connectedAccount,
          actionType: actionData.type,
          description: actionData.description,
          amount: actionData.amount,
          timestamp: Date.now(),
          aiVerified: actionData.aiVerified,
          aiApproved: actionData.aiApproved,
          aiConfidence: actionData.aiConfidence
        }
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
        parseInt(actionForm.amount)
      )

      console.log('🔗 Submitting to Hedera blockchain...')
      const hederaResult = await submitToHedera({
        type: actionForm.type,
        amount: parseInt(actionForm.amount),
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
          rewardAmount: aiResult.isValid ? (parseInt(actionForm.amount) * (aiResult.suggestedReward / 100)) : 0
        }

        setSubmittedActions(prev => [newAction, ...prev])

        setMetrics(prev => ({
          totalOffset: prev.totalOffset + (parseInt(actionForm.amount) / 1000),
          totalRewards: prev.totalRewards + (newAction.rewardAmount || 0),
          verifiedActions: prev.verifiedActions + (aiResult.isValid ? 1 : 0)
        }))

        setShowActionModal(false)
        setActionForm({
          type: 'renewable-energy',
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

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card variant="carbon" gradient className="relative overflow-hidden">
        <div className="relative z-10 text-center py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold font-quantum mb-6">
              Carbon{' '}
              <span className="bg-gradient-to-r from-carbon-400 to-green-400 bg-clip-text text-transparent">
                Rewards
              </span>
              {' '}
              <div className="text-2xl md:text-3xl mt-2">
                <span className="text-blue-400">🤖 AI</span> + 
                <span className="text-purple-400 ml-2">🔷 Hedera</span>
              </div>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Upload proof images for instant AI verification and submit directly to Hedera blockchain. 
              Fast, secure, and decentralized environmental action verification.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isConnected ? (
                <button 
                  onClick={handleWalletAction}
                  disabled={connectionState === 'Connecting'}
                  className={getWalletButtonClass()}
                >
                  🔷 {getWalletButtonText()}
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <Button 
                    variant="carbon" 
                    size="lg" 
                    quantum 
                    glow
                    onClick={() => setShowActionModal(true)}
                  >
                    📸 Submit + AI Verify
                  </Button>
                  <button 
                    onClick={handleWalletAction}
                    disabled={connectionState === 'Connecting'}
                    className={`text-sm ${getWalletButtonClass()}`}
                  >
                    {getWalletButtonText()}
                  </button>
                </div>
              )}
              <Button variant="secondary" size="lg" onClick={() => setActiveTab('ai-verification')}>
                🤖 View AI Results
              </Button>
            </div>

            {connectionState !== 'Disconnected' && (
              <div className="mt-4 text-sm text-gray-400">
                Status: {connectionState} 
                {isConnected && ` • Connected: ${formatAccountId(connectedAccount)}`}
              </div>
            )}
          </motion.div>
        </div>
      </Card>

      {/* Enhanced Environmental Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card variant="carbon" className="text-center">
          <div className="text-3xl mb-2">🌱</div>
          <div className="text-2xl font-bold text-carbon-400">
            {metrics.totalOffset.toFixed(1)}
          </div>
          <div className="text-sm text-gray-400">Tons CO₂ Offset</div>
        </Card>

        <Card variant="quantum" className="text-center">
          <div className="text-3xl mb-2">🏆</div>
          <div className="text-2xl font-bold text-quantum-400">
            {metrics.totalRewards.toFixed(0)}
          </div>
          <div className="text-sm text-gray-400">CARBON Earned</div>
        </Card>

        <Card variant="physics" className="text-center">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-2xl font-bold text-physics-400">
            {metrics.verifiedActions}
          </div>
          <div className="text-sm text-gray-400">AI Verified</div>
        </Card>

        <Card variant="ai" className="text-center">
          <div className="text-3xl mb-2">🔷</div>
          <div className="text-2xl font-bold text-blue-400">
            {submittedActions.length}
          </div>
          <div className="text-sm text-gray-400">Hedera Txs</div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <Card variant="default">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'carbon' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2"
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Tab Content */}
      <div className="min-h-screen">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <Card variant="default">
              <h3 className="text-xl font-semibold mb-6">🤖 AI Verification Dashboard</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <h4 className="font-semibold text-blue-300 mb-4">🧠 Latest AI Analysis</h4>
                  {aiVerificationResult ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={aiVerificationResult.isValid ? 'text-green-400' : 'text-red-400'}>
                          {aiVerificationResult.isValid ? '✅ Valid' : '❌ Invalid'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Confidence:</span>
                        <span className="text-blue-400">{aiVerificationResult.confidence}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Action:</span>
                        <span className="text-gray-300">{aiVerificationResult.actionType}</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-4 p-3 bg-gray-800/50 rounded">
                        {aiVerificationResult.reasoning}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-400">No AI analysis yet. Submit an action with photo to see results.</p>
                  )}
                </div>

                <div className="p-6 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <h4 className="font-semibold text-green-300 mb-4">📊 Verification Stats</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Analyses:</span>
                      <span className="text-green-400">{verificationHistory.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Approved:</span>
                      <span className="text-green-400">
                        {verificationHistory.filter(v => v.isValid).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <span className="text-blue-400">
                        {verificationHistory.length ? 
                          Math.round((verificationHistory.filter(v => v.isValid).length / verificationHistory.length) * 100) 
                          : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Confidence:</span>
                      <span className="text-purple-400">
                        {verificationHistory.length ?
                          Math.round(verificationHistory.reduce((acc, v) => acc + v.confidence, 0) / verificationHistory.length)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card variant="default">
              <h3 className="text-xl font-semibold mb-6">Recent Actions</h3>
              <div className="space-y-4">
                {submittedActions.length > 0 ? submittedActions.map((action, index) => {
                  const verification = getVerificationStatus(action)
                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">
                          {actionTypes.find(t => t.value === action.actionType)?.label.split(' ')[0] || '🌱'}
                        </div>

                        <div className="flex-1">
                          <h4 className="font-semibold capitalize">
                            {action.actionType.replace('-', ' ')}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {action.amount}g CO₂ • {new Date(action.timestamp).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {action.description}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <span className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded">
                              🔷 Hedera: {action.transactionId?.substring(0, 10)}...
                            </span>
                            <span className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded">
                              🤖 AI Verified
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-sm font-semibold mb-1 ${verification.color}`}>
                          {verification.icon} {verification.text}
                        </div>
                        <div className="text-carbon-400 font-bold">
                          {action.rewardAmount ? `${action.rewardAmount.toFixed(0)} CARBON` : 'Pending'}
                        </div>
                      </div>
                    </div>
                  )
                }) : (
                  <div className="text-center py-8 text-gray-400">
                    <div className="text-4xl mb-4">🤖</div>
                    <p>No actions submitted yet.</p>
                    <p className="text-sm">Submit your first action with AI verification!</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Actions Tab */}
        {activeTab === 'actions' && (
          <Card variant="default">
            <h3 className="text-xl font-semibold mb-6">Submit Environmental Action with AI Verification</h3>

            {!isConnected ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🔷</div>
                <h4 className="text-xl font-semibold mb-2">Connect Your Hedera Wallet</h4>
                <p className="text-gray-400 mb-6">
                  Connect your Hedera wallet to submit environmental actions to the blockchain.
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Action Type
                    </label>
                    <select
                      value={actionForm.type}
                      onChange={(e) => {
                        setActionForm(prev => ({ ...prev, type: e.target.value }))
                        setShowAITips(true)
                      }}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-carbon-400 focus:outline-none"
                    >
                      {actionTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label} (Reward: {type.multiplier})
                        </option>
                      ))}
                    </select>
                  </div>

                  {showAITips && (
                    <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                      <h4 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
                        🤖 AI Verification Tips:
                      </h4>
                      <p className="text-sm text-gray-300">
                        {actionTypes.find(t => t.value === actionForm.type)?.aiTip}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Carbon Saved (grams)
                    </label>
                    <input
                      type="number"
                      value={actionForm.amount}
                      onChange={(e) => setActionForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="Enter amount of CO₂ saved"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-carbon-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Description
                    </label>
                    <textarea
                      value={actionForm.description}
                      onChange={(e) => setActionForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your environmental action..."
                      rows={4}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-carbon-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      📸 Proof Image (Required for AI Verification)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-carbon-400 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-carbon-600 file:text-white hover:file:bg-carbon-700"
                    />

                    {imagePreview && (
                      <div className="mt-4 space-y-3">
                        <img 
                          src={imagePreview} 
                          alt="Proof preview" 
                          className="w-full max-w-xs h-48 object-cover rounded-lg border border-gray-600"
                        />
                        <div className="flex gap-2">
                          <span className="text-green-400 text-sm bg-green-900/20 px-2 py-1 rounded">
                            ✅ Ready for AI analysis
                          </span>
                        </div>
                      </div>
                    )}

                    {isVerifyingWithAI && (
                      <div className="mt-4 text-blue-400 text-sm flex items-center gap-2">
                        <div className="animate-pulse w-4 h-4 bg-blue-400 rounded-full"></div>
                        AI analyzing image...
                      </div>
                    )}

                    {isSubmittingToHedera && (
                      <div className="mt-4 text-purple-400 text-sm flex items-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full"></div>
                        Submitting to Hedera blockchain...
                      </div>
                    )}

                    {aiVerificationResult && (
                      <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
                        <h5 className="font-semibold mb-2 flex items-center gap-2">
                          🤖 AI Verification Result:
                          <span className={aiVerificationResult.isValid ? 'text-green-400' : 'text-red-400'}>
                            {aiVerificationResult.isValid ? '✅ APPROVED' : '❌ REJECTED'}
                          </span>
                          <span className="text-blue-400">({aiVerificationResult.confidence}%)</span>
                        </h5>
                        <p className="text-sm text-gray-300 mb-3">
                          {aiVerificationResult.reasoning}
                        </p>
                        {aiVerificationResult.detectedElements.length > 0 && (
                          <div className="mb-2">
                            <span className="text-xs text-green-300">Detected: </span>
                            <span className="text-xs text-gray-400">
                              {aiVerificationResult.detectedElements.join(', ')}
                            </span>
                          </div>
                        )}
                        {aiVerificationResult.redFlags.length > 0 && (
                          <div>
                            <span className="text-xs text-red-300">Red flags: </span>
                            <span className="text-xs text-gray-400">
                              {aiVerificationResult.redFlags.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    variant="carbon"
                    onClick={handleSubmitAction}
                    disabled={!actionForm.amount || !actionForm.description || !uploadedImage || isVerifyingWithAI || isSubmittingToHedera || !isConnected}
                    className="w-full"
                    loading={isLoading || isVerifyingWithAI || isSubmittingToHedera}
                  >
                    {isVerifyingWithAI ? '🤖 AI Analyzing...' : 
                      isSubmittingToHedera ? '🔷 Submitting to Hedera...' : 
                      isLoading ? '⏳ Processing...' :
                      '🚀 Submit with AI Verification + Hedera'}
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg">
                    <h4 className="font-semibold text-blue-300 mb-4">🤖 AI + Hedera Benefits</h4>
                    <ul className="text-gray-300 space-y-2 text-sm">
                      <li>• <strong>Instant AI verification</strong> - Advanced AI analyzes in seconds</li>
                      <li>• <strong>Hedera blockchain</strong> - Fast, low-cost, enterprise-grade</li>
                      <li>• <strong>Fraud detection</strong> - AI spots fake/stock images</li>
                      <li>• <strong>Decentralized proof</strong> - Immutable blockchain records</li>
                      <li>• <strong>Transparent process</strong> - All verification data visible</li>
                    </ul>
                  </div>

                  <div className="p-6 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <h4 className="font-semibold text-green-300 mb-4">📸 Photo Best Practices</h4>
                    <ul className="text-gray-300 space-y-2 text-sm">
                      <li>• Take clear, well-lit photos</li>
                      <li>• Show the action in progress</li>
                      <li>• Include context and tools</li>
                      <li>• Avoid stock photos or screenshots</li>
                      <li>• Multiple angles improve verification</li>
                      <li>• Outdoor actions preferred for authenticity</li>
                    </ul>
                  </div>

                  <div className="p-6 bg-carbon-900/20 border border-carbon-500/30 rounded-lg">
                    <h4 className="font-semibold text-carbon-300 mb-4">🎯 Reward Multipliers</h4>
                    <div className="space-y-2">
                      {actionTypes.map(type => (
                        <div key={type.value} className="flex justify-between text-sm">
                          <span>{type.label.split(' ')[0]} {type.label.split(' ').slice(1).join(' ')}</span>
                          <span className="text-carbon-400 font-bold">{type.multiplier}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* 🔥 NEW: AI Verification Tab - Complete Implementation */}
        {activeTab === 'ai-verification' && (
          <Card variant="default">
            <h3 className="text-xl font-semibold mb-6">AI Verification History</h3>
            <div className="space-y-4">
              {verificationHistory.length > 0 ? (
                verificationHistory.map((verification, index) => (
                  <div key={index} className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold capitalize">{verification.actionType?.replace('-', ' ')}</span>
                        <p className="text-xs text-gray-400">{new Date(verification.timestamp).toLocaleString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded ${verification.isValid ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {verification.isValid ? '✓ Valid' : '✗ Invalid'} ({verification.confidence}%)
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mt-2">{verification.reasoning}</p>
                    {verification.detectedElements?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {verification.detectedElements.map((element, i) => (
                          <span key={i} className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded">
                            {element}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-4">🤖</div>
                  <p>No AI verifications yet</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* 🔥 NEW: Marketplace Tab - Complete Implementation */}
        {activeTab === 'marketplace' && (
          <div className="space-y-6">
            <Card variant="default">
              <h3 className="text-xl font-semibold mb-6">Carbon Credit Marketplace</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {marketplaceItems.map((item) => (
                  <Card key={item.id} variant="carbon" className="hover:scale-105 transition-transform">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold">{item.title}</h4>
                        {item.verified && (
                          <span className="text-green-400 text-sm">✓ Verified</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{item.description}</p>
                      <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                        <div>
                          <div className="text-2xl font-bold text-carbon-400">{item.price} CARBON</div>
                          <p className="text-xs text-gray-400">by {item.seller}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-yellow-400 text-sm">★ {item.rating}</div>
                          <span className="text-xs text-gray-500 capitalize">{item.category}</span>
                        </div>
                      </div>
                      <Button variant="carbon" className="w-full" size="sm">
                        Purchase Credits
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* 🔥 NEW: Challenges Tab - Complete Implementation */}
        {activeTab === 'challenges' && (
          <div className="space-y-6">
            <Card variant="default">
              <h3 className="text-xl font-semibold mb-6">Active Challenges</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {challenges.map((challenge) => (
                  <Card key={challenge.id} variant="quantum" className="hover:shadow-lg transition-shadow">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-2">{challenge.title}</h4>
                          <p className="text-sm text-gray-400">{challenge.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          challenge.difficulty === 'Easy' ? 'bg-green-600/20 text-green-400' :
                          challenge.difficulty === 'Medium' ? 'bg-yellow-600/20 text-yellow-400' :
                          'bg-red-600/20 text-red-400'
                        }`}>
                          {challenge.difficulty}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-quantum-400 font-semibold">{challenge.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-quantum-500 to-quantum-400 h-2 rounded-full transition-all"
                            style={{ width: `${challenge.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                        <div>
                          <div className="text-2xl font-bold text-quantum-400">{challenge.reward} CARBON</div>
                          <p className="text-xs text-gray-400">{challenge.participants.toLocaleString()} participants</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-300">⏱ {challenge.timeLeft}</div>
                          <span className="text-xs text-gray-500 capitalize">{challenge.type}</span>
                        </div>
                      </div>

                      <Button variant="quantum" className="w-full" size="sm">
                        Join Challenge
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* 🔥 NEW: Global Impact Tab - Complete Implementation */}
        {activeTab === 'impact' && (
          <div className="space-y-6">
            <Card variant="default">
              <h3 className="text-xl font-semibold mb-6">Global Environmental Impact</h3>

              {/* Impact Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-4 bg-green-600/20 border border-green-500/30 rounded-lg">
                  <div className="text-3xl mb-2">👥</div>
                  <div className="text-2xl font-bold text-green-400">{globalImpact.totalUsers.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Active Users</div>
                </div>
                <div className="text-center p-4 bg-blue-600/20 border border-blue-500/30 rounded-lg">
                  <div className="text-3xl mb-2">🌍</div>
                  <div className="text-2xl font-bold text-blue-400">{globalImpact.carbonOffset.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Tons CO₂ Offset</div>
                </div>
                <div className="text-center p-4 bg-emerald-600/20 border border-emerald-500/30 rounded-lg">
                  <div className="text-3xl mb-2">🌳</div>
                  <div className="text-2xl font-bold text-emerald-400">{globalImpact.treesPlanted.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Trees Planted</div>
                </div>
                <div className="text-center p-4 bg-purple-600/20 border border-purple-500/30 rounded-lg">
                  <div className="text-3xl mb-2">🌐</div>
                  <div className="text-2xl font-bold text-purple-400">{globalImpact.countriesActive}</div>
                  <div className="text-sm text-gray-400">Countries</div>
                </div>
              </div>

              {/* Recent Global Actions */}
              <div>
                <h4 className="font-semibold mb-4">Recent Global Actions</h4>
                <div className="space-y-3">
                  {globalImpact.recentActions.map((action, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">🌍</div>
                        <div>
                          <div className="font-semibold">{action.country}</div>
                          <div className="text-sm text-gray-400">{action.action}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-carbon-400 font-semibold">{action.amount}g CO₂</div>
                        <div className="text-xs text-gray-500">{action.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

      </div>

      {/* Enhanced Submit Action Modal */}
      <Modal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        title="🚀 Quick Action Submit with AI Verification"
        variant="carbon"
      >
        <div className="space-y-4">
          <p className="text-gray-400">
            📸 Upload a photo for instant AI verification and Hedera blockchain submission!
          </p>

          {!isConnected && (
            <div className="text-center p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-red-300 mb-3">⚠️ Wallet not connected</p>
              <button 
                onClick={handleWalletAction}
                disabled={connectionState === 'Connecting'}
                className={getWalletButtonClass()}
              >
                🔷 {getWalletButtonText()}
              </button>
            </div>
          )}

          <div>
            <select
              value={actionForm.type}
              onChange={(e) => setActionForm(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-carbon-400 focus:outline-none"
            >
              {actionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-carbon-600 file:text-white"
            />
          </div>

          {imagePreview && (
            <div className="text-center">
              <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg mx-auto mb-2" />
              <div className="flex justify-center gap-2">
                <span className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded">🤖 Ready</span>
                <span className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded">🔷 Hedera Ready</span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="carbon"
              onClick={() => {
                setShowActionModal(false)
                setActiveTab('actions')
              }}
              className="flex-1"
              disabled={!isConnected}
            >
              📝 Full Form
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowActionModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Carbon
