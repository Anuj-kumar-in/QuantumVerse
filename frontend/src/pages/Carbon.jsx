import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '../hooks/useWallet'
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
    const baseClass = "px-4 py-2 rounded-lg font-semibold transition-colors";

    if (connectionState === 'Connecting') {
      return `${baseClass} bg-yellow-500 text-white cursor-not-allowed`;
    }

    if (isConnected) {
      return `${baseClass} bg-green-500 text-white hover:bg-green-600`;
    }

    return `${baseClass} bg-[var(--mustard)] text-[var(--ink)] hover:opacity-80`;
  };

  const actionTypes = [
    { 
      value: 'recycle', 
      label: '♻️ Recycle', 
      multiplier: '1.0x', 
      aiTip: 'Show properly sorted recyclables at recycling centers or bins. Materials should be clean and properly separated by type.' 
    },
    { 
      value: 'transit', 
      label: '🚌 Public Transit', 
      multiplier: '1.2x', 
      aiTip: 'Show yourself using public transportation - bus, train, metro with tickets or passes visible.' 
    },
    { 
      value: 'energy', 
      label: '💡 Energy Saving', 
      multiplier: '1.1x', 
      aiTip: 'Show LED bulbs, smart thermostats, energy-efficient appliances, or energy monitoring devices with visible readings.' 
    },
    { 
      value: 'cleanup', 
      label: '🧹 Cleanup', 
      multiplier: '1.3x', 
      aiTip: 'Show before/after photos of cleanup activities in parks, beaches, or community areas with visible trash bags.' 
    },
    { 
      value: 'plant', 
      label: '🌱 Planting', 
      multiplier: '2.0x', 
      aiTip: 'Show yourself actively planting trees or plants with tools (shovel, watering can). Include freshly planted vegetation in appropriate outdoor settings.' 
    },
    { 
      value: 'donate', 
      label: '💝 Donate Credits', 
      multiplier: '1.5x', 
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
      available: true
    },
    {
      id: 2,
      title: "Carbon Credit Pack",
      description: "250 g CO₂ (verified offset)",
      price: 60,
      category: "credits",
      available: true
    },
    {
      id: 3,
      title: "Carbon Credit Pack",
      description: "500 g CO₂ (verified offset)",
      price: 115,
      category: "credits",
      available: true
    }
  ])

  
  const [globalImpact, setGlobalImpact] = useState({
    co2Reduced: 2340,
    actionsLogged: 15678,
    activeUsers: 4567,
    recentActions: [
      { country: "USA", action: "Solar installation", amount: 2300, time: "2 mins ago" },
      { country: "Germany", action: "Tree planting", amount: 1500, time: "5 mins ago" },
      { country: "Japan", action: "EV charging", amount: 800, time: "8 mins ago" },
      { country: "Brazil", action: "Recycling", amount: 450, time: "12 mins ago" },
      { country: "India", action: "Energy efficiency", amount: 1200, time: "15 mins ago" }
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

  return (
    <>
      <style>{`
        :root {
          --ink: #3b2f2f;     /* dark brown */
          --pane: #5c4033;    /* mid brown */
          --mustard: #eec329; /* accent */
        }

        @keyframes fade {
          from { opacity:.3; transform: translateY(4px); }
          to   { opacity:1;  transform: translateY(0); }
        }
        .fade-in { animation: fade .25s ease; }
      `}</style>
      
      <div className="min-h-screen bg-[var(--ink)] text-white">
        <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
          
          {/* Top banner showing the carbon rewards */}
          <section className="bg-[var(--mustard)] text-[var(--ink)] rounded-2xl p-6 shadow-lg fade-in">
            <h1 className="text-xl font-bold mb-2">QuantumVerse - Carbon Rewards</h1>
            <p className="text-sm">
              Earn tokens for real-world positive actions — recycling, transit, energy savings,
              and verified missions with instant AI verification and Hedera blockchain integration.
            </p>
            
            {/* Wallet Connection Status */}
            <div className="mt-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <div className="flex items-center gap-2 text-green-700">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    <span className="text-xs font-medium">Connected: {formatAccountId(connectedAccount)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-700">
                    <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                    <span className="text-xs font-medium">Wallet Disconnected</span>
                  </div>
                )}
              </div>
              
              <button 
                onClick={handleWalletAction}
                disabled={connectionState === 'Connecting'}
                className={`text-sm ${getWalletButtonClass()}`}
              >
                🔷 {getWalletButtonText()}
              </button>
            </div>
          </section>

          {/* Navigation */}
          <nav className="bg-[var(--pane)] text-[var(--mustard)] rounded-2xl p-4 shadow-xl fade-in">
            <ul className="flex flex-wrap justify-center gap-3 text-sm font-medium">
              <li>
                <button 
                  onClick={() => handleNavigation('dashboard')}
                  className={`px-3 py-2 hover:underline ${activeTab === 'dashboard' ? 'underline font-bold' : ''}`}
                >
                  Dashboard
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('submit')}
                  className={`px-3 py-2 hover:underline ${activeTab === 'submit' ? 'underline font-bold' : ''}`}
                >
                  Submit Action
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('verification')}
                  className={`px-3 py-2 hover:underline ${activeTab === 'verification' ? 'underline font-bold' : ''}`}
                >
                  AI Verification
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('marketplace')}
                  className={`px-3 py-2 hover:underline ${activeTab === 'marketplace' ? 'underline font-bold' : ''}`}
                >
                  Marketplace
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('challenges')}
                  className={`px-3 py-2 hover:underline ${activeTab === 'challenges' ? 'underline font-bold' : ''}`}
                >
                  Challenges
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('impact')}
                  className={`px-3 py-2 hover:underline ${activeTab === 'impact' ? 'underline font-bold' : ''}`}
                >
                  Global Impact
                </button>
              </li>
            </ul>
          </nav>

          {/* Dashboard section */}
          <section id="dashboard" className="bg-[var(--pane)] text-[var(--mustard)] rounded-2xl p-6 shadow-xl space-y-6 fade-in">
            <h2 className="text-xl font-semibold">Dashboard</h2>

            {/* Counters */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-[var(--ink)] rounded-xl p-4 border border-[color:rgba(244,211,94,0.2)]">
                <div className="text-sm text-white/70">Total Actions</div>
                <div id="total-actions" className="text-2xl font-bold mt-1">{metrics.totalActions}</div>
              </div>
              <div className="bg-[var(--ink)] rounded-xl p-4 border border-[color:rgba(244,211,94,0.2)]">
                <div className="text-sm text-white/70">Accepted</div>
                <div id="accepted-count" className="text-2xl font-bold mt-1">{metrics.acceptedCount}</div>
              </div>
              <div className="bg-[var(--ink)] rounded-xl p-4 border border-[color:rgba(244,211,94,0.2)]">
                <div className="text-sm text-white/70">Rejected</div>
                <div id="rejected-count" className="text-2xl font-bold mt-1">{metrics.rejectedCount}</div>
              </div>
            </div>

            {/* AI Verification Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[var(--ink)] rounded-xl p-4 border border-[color:rgba(244,211,94,0.2)]">
                <h4 className="font-semibold text-[var(--mustard)] mb-4">🧠 Latest AI Analysis</h4>
                {aiVerificationResult ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/70">Status:</span>
                      <span className={aiVerificationResult.isValid ? 'text-green-400' : 'text-red-400'}>
                        {aiVerificationResult.isValid ? '✅ Valid' : '❌ Invalid'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Confidence:</span>
                      <span className="text-[var(--mustard)]">{aiVerificationResult.confidence}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Action:</span>
                      <span className="text-white/80 capitalize">{aiVerificationResult.actionType}</span>
                    </div>
                    <p className="text-sm text-white/60 mt-4 p-3 bg-[var(--pane)]/50 rounded">
                      {aiVerificationResult.reasoning}
                    </p>
                  </div>
                ) : (
                  <p className="text-white/60">No AI analysis yet. Submit an action with photo to see results.</p>
                )}
              </div>

              <div className="bg-[var(--ink)] rounded-xl p-4 border border-[color:rgba(244,211,94,0.2)]">
                <h4 className="font-semibold text-[var(--mustard)] mb-4">📊 Verification Stats</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/70">Total Analyses:</span>
                    <span className="text-[var(--mustard)]">{verificationHistory.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Approved:</span>
                    <span className="text-green-400">
                      {verificationHistory.filter(v => v.isValid).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Success Rate:</span>
                    <span className="text-[var(--mustard)]">
                      {verificationHistory.length ? 
                        Math.round((verificationHistory.filter(v => v.isValid).length / verificationHistory.length) * 100) 
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Avg Confidence:</span>
                    <span className="text-[var(--mustard)]">
                      {verificationHistory.length ?
                        Math.round(verificationHistory.reduce((acc, v) => acc + v.confidence, 0) / verificationHistory.length)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent actions */}
            <div className="bg-[var(--ink)] rounded-xl p-4 border border-[color:rgba(244,211,94,0.2)]">
              <div className="text-sm font-semibold mb-3">Recent Actions</div>
              <ul id="actions-list" className="space-y-2 text-white/80">
                {submittedActions.length > 0 ? submittedActions.map((action, index) => {
                  const verification = getVerificationStatus(action)
                  return (
                    <li key={index} className="flex items-center justify-between p-3 bg-[var(--pane)]/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {actionTypes.find(t => t.value === action.actionType)?.label.split(' ')[0] || '🌱'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold capitalize text-[var(--mustard)]">
                            {action.actionType.replace('-', ' ')}
                          </h4>
                          <p className="text-sm text-white/60">
                            {action.amount}g CO₂ • {new Date(action.timestamp).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-white/40 mt-1">
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
                        <div className="text-[var(--mustard)] font-bold">
                          {action.rewardAmount ? `${action.rewardAmount.toFixed(0)} CARBON` : 'Pending'}
                        </div>
                      </div>
                    </li>
                  )
                }) : (
                  <li className="text-sm text-white/60">No actions submitted yet.</li>
                )}
              </ul>
            </div>
          </section>

          {/* Submit Action section */}
          <section id="submit" className="bg-[var(--pane)] text-[var(--mustard)] rounded-2xl p-6 shadow-xl space-y-6 fade-in">
            <h2 className="text-xl font-semibold">Submit Action</h2>

            {!isConnected ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🔷</div>
                <h4 className="text-xl font-semibold mb-2">Connect Your Hedera Wallet</h4>
                <p className="text-white/70 mb-6">
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
              <form id="action-form" className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSubmitAction(); }}>
                <div>
                  <label htmlFor="actionType" className="block text-sm mb-1 text-white/80">Action Type</label>
                  <select 
                    id="actionType" 
                    value={actionForm.type}
                    onChange={(e) => {
                      setActionForm(prev => ({ ...prev, type: e.target.value }))
                      setShowAITips(true)
                    }}
                    className="w-full bg-[var(--ink)] text-white border border-[color:rgba(244,211,94,0.3)] rounded-lg p-2"
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
                    <p className="text-sm text-white/80">
                      {actionTypes.find(t => t.value === actionForm.type)?.aiTip}
                    </p>
                  </div>
                )}

                <div>
                  <label htmlFor="carbonAmount" className="block text-sm mb-1 text-white/80">Carbon Saved (grams)</label>
                  <input 
                    id="carbonAmount"
                    type="number"
                    value={actionForm.amount}
                    onChange={(e) => setActionForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="Enter amount of CO₂ saved (optional)"
                    className="w-full bg-[var(--ink)] text-white border border-[color:rgba(244,211,94,0.3)] rounded-lg p-2"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm mb-1 text-white/80">Description</label>
                  <textarea 
                    id="description" 
                    rows="3" 
                    value={actionForm.description}
                    onChange={(e) => setActionForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="What did you do? Where/when?"
                    className="w-full bg-[var(--ink)] text-white border border-[color:rgba(244,211,94,0.3)] rounded-lg p-2"
                  ></textarea>
                </div>

                <div>
                  <label htmlFor="evidenceFile" className="block text-sm mb-1 text-white/80">📸 Evidence File (Required for AI Verification)</label>
                  <input 
                    id="evidenceFile" 
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="w-full text-xs file:mr-3 file:px-3 file:py-2 file:rounded-lg file:bg-[var(--mustard)] file:text-[var(--ink)] file:border-0 file:font-semibold" 
                  />
                  
                  {imagePreview && (
                    <div className="mt-4 space-y-3">
                      <img 
                        src={imagePreview} 
                        alt="Proof preview" 
                        className="w-full max-w-xs h-48 object-cover rounded-lg border border-[color:rgba(244,211,94,0.3)]"
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
                    <div className="mt-4 p-4 bg-[var(--ink)]/50 rounded-lg">
                      <h5 className="font-semibold mb-2 flex items-center gap-2">
                        🤖 AI Verification Result:
                        <span className={aiVerificationResult.isValid ? 'text-green-400' : 'text-red-400'}>
                          {aiVerificationResult.isValid ? '✅ APPROVED' : '❌ REJECTED'}
                        </span>
                        <span className="text-blue-400">({aiVerificationResult.confidence}%)</span>
                      </h5>
                      <p className="text-sm text-white/80 mb-3">
                        {aiVerificationResult.reasoning}
                      </p>
                      {aiVerificationResult.detectedElements.length > 0 && (
                        <div className="mb-2">
                          <span className="text-xs text-green-300">Detected: </span>
                          <span className="text-xs text-white/60">
                            {aiVerificationResult.detectedElements.join(', ')}
                          </span>
                        </div>
                      )}
                      {aiVerificationResult.redFlags.length > 0 && (
                        <div>
                          <span className="text-xs text-red-300">Red flags: </span>
                          <span className="text-xs text-white/60">
                            {aiVerificationResult.redFlags.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={!actionForm.description || !uploadedImage || isVerifyingWithAI || isSubmittingToHedera || !isConnected}
                  className={`px-4 py-2 rounded-lg font-semibold w-full ${
                    (!actionForm.description || !uploadedImage || isVerifyingWithAI || isSubmittingToHedera || !isConnected) 
                      ? 'opacity-70 cursor-not-allowed bg-gray-600 text-gray-400' 
                      : 'bg-[var(--mustard)] text-[var(--ink)] hover:opacity-80'
                  }`}
                >
                  {isVerifyingWithAI ? '🤖 AI Analyzing...' : 
                   isSubmittingToHedera ? '🔷 Submitting to Hedera...' : 
                   isLoading ? '⏳ Processing...' :
                   '🚀 Submit with AI Verification + Hedera'}
                </button>
              </form>
            )}
          </section>

          {/* AI Verification section */}
          <section id="verification" className="bg-[var(--pane)] text-[var(--mustard)] rounded-2xl p-6 shadow-xl space-y-4 fade-in">
            <h2 className="text-xl font-semibold">AI Verification</h2>

            {/* Header row for AI */}
            <div className="hidden sm:grid grid-cols-4 gap-4 text-xs uppercase tracking-wide text-white/60">
              <div>Action</div><div>Status</div><div>Reason</div><div>Timestamp</div>
            </div>

            {/* Verification Results */}
            <ul id="verify-list" className="space-y-2 text-white/80">
              {verificationHistory.length > 0 ? verificationHistory.map((verification, index) => (
                <li key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-[var(--ink)] rounded-xl border border-[color:rgba(244,211,94,0.2)]">
                  <div className="font-medium capitalize">{verification.actionType?.replace('-', ' ')}</div>
                  <div className={verification.isValid ? 'text-green-400' : 'text-red-400'}>
                    {verification.isValid ? '✅ Approved' : '❌ Rejected'} ({verification.confidence}%)
                  </div>
                  <div className="text-sm text-white/60 col-span-1 sm:col-span-1 truncate">{verification.reasoning}</div>
                  <div className="text-sm text-white/60">{new Date(verification.timestamp).toLocaleString()}</div>
                </li>
              )) : (
                <li className="text-sm text-white/60">No verifications yet.</li>
              )}
            </ul>
          </section>

          {/* Marketplace section */}
          <section id="marketplace" className="bg-[var(--pane)] text-[var(--mustard)] rounded-2xl p-6 shadow-xl space-y-4 fade-in">
            <h2 className="text-xl font-semibold">Marketplace</h2>

            <div className="grid sm:grid-cols-3 gap-4">
              {marketplaceItems.map((item) => (
                <article key={item.id} className="bg-[var(--ink)] rounded-xl p-4 border border-[color:rgba(244,211,94,0.2)]">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-white/70 text-sm mt-1">{item.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-[var(--mustard)] font-bold">{item.price} CARBON</div>
                    <button 
                      className="text-[var(--ink)] bg-[var(--mustard)] px-3 py-1.5 rounded-lg font-semibold hover:opacity-80" 
                      disabled={!item.available}
                    >
                      Buy
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Challenges section */}
          <section id="challenges" className="bg-[var(--pane)] text-[var(--mustard)] rounded-2xl p-6 shadow-xl space-y-4 fade-in">
            <h2 className="text-xl font-semibold">Challenges</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              {challenges.map((challenge) => (
                <article key={challenge.id} className="bg-[var(--ink)] rounded-xl p-4 border border-[color:rgba(244,211,94,0.2)]">
                  <h3 className="font-semibold">{challenge.title}</h3>
                  <p className="text-white/70 text-sm mt-1">{challenge.description}</p>
                  <div className="text-sm mt-2">
                    <span className="font-semibold">Reward:</span> {challenge.reward} pts
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{challenge.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-[var(--mustard)] h-2 rounded-full transition-all"
                        style={{ width: `${challenge.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-white/60 mt-2">
                      <span>⏰ {challenge.timeLeft}</span>
                      <span>👥 {challenge.participants}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Global impact section */}
          <section id="impact" className="bg-[var(--pane)] text-[var(--mustard)] rounded-2xl p-6 shadow-xl space-y-6 fade-in">
            <h2 className="text-xl font-semibold">Global Impact</h2>
            
            {/* Global Stats */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-[var(--ink)] rounded-xl p-4 border border-[color:rgba(244,211,94,0.2)]">
                <div className="text-sm text-white/70">CO₂ Reduced</div>
                <div className="text-2xl font-bold mt-1">{globalImpact.co2Reduced} tons</div>
              </div>
              <div className="bg-[var(--ink)] rounded-xl p-4 border border-[color:rgba(244,211,94,0.2)]">
                <div className="text-sm text-white/70">Actions Logged</div>
                <div className="text-2xl font-bold mt-1">{globalImpact.actionsLogged.toLocaleString()}</div>
              </div>
              <div className="bg-[var(--ink)] rounded-xl p-4 border border-[color:rgba(244,211,94,0.2)]">
                <div className="text-sm text-white/70">Active Users</div>
                <div className="text-2xl font-bold mt-1">{globalImpact.activeUsers.toLocaleString()}</div>
              </div>
            </div>

            {/* Recent Global Actions */}
            <div>
              <h4 className="font-semibold mb-4">Recent Global Actions</h4>
              <div className="space-y-3">
                {globalImpact.recentActions.map((action, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[var(--ink)] rounded-xl border border-[color:rgba(244,211,94,0.2)]">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🌍</div>
                      <div>
                        <div className="font-semibold">{action.country}</div>
                        <div className="text-sm text-white/70">{action.action}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[var(--mustard)] font-semibold">{action.amount}g CO₂</div>
                      <div className="text-xs text-white/60">{action.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map/graph placeholder */}
            <div className="bg-[var(--ink)] rounded-xl p-10 border border-[color:rgba(244,211,94,0.2)] text-center text-white/60">
              <div className="text-4xl mb-4">🗺️</div>
              <div>Global Impact Visualization</div>
              <div className="text-sm mt-2">Real-time environmental action tracking worldwide</div>
            </div>
          </section>

          {/* Footer */}
          <footer className="text-center text-sm text-white/60 pt-8 fade-in">
            © 2025 QuantumVerse - Carbon Rewards Platform powered by AI + Hedera
          </footer>
        </main>
      </div>
    </>
  )
}

export default Carbon