import React, { useState, useEffect, useRef } from 'react'
import {
  Client,
  PrivateKey,
  AccountId,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction
} from '@hashgraph/sdk'
import { ChatOpenAI } from '@langchain/openai'
import { ChatGroq } from '@langchain/groq'
import { ChatOllama } from '@langchain/ollama'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents'
import {
  HederaLangchainToolkit,
  coreQueriesPlugin,
  coreAccountPlugin,
  coreHTSPlugin,
  coreConsensusPlugin,
  AgentMode
} from 'hedera-agent-kit'
import { useWallet } from '../Context/WalletContext'


export const EntityType = {
  COMPANION: 'COMPANION',
  GUARDIAN: 'GUARDIAN',
  TRADER: 'TRADER',
  EXPLORER: 'EXPLORER',
  CREATOR: 'CREATOR',
  SCIENTIST: 'SCIENTIST'
}


const AI_PROVIDERS = {
  OPENAI: {
    name: 'OpenAI',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
    available: true,
    envKey: 'VITE_OPENAI_API_KEY',
    icon: '🤖',
    color: 'from-green-400 to-emerald-400'
  },
  GROQ: {
    name: 'Groq',
    models: ['llama3-8b-8192', 'mixtral-8x7b-32768'],
    available: true,
    envKey: 'VITE_GROQ_API_KEY',
    icon: '⚡',
    color: 'from-orange-400 to-red-400'
  },
  OLLAMA: {
    name: 'Ollama (Local)',
    models: ['llama3.2', 'llama3.2:3b', 'llama3.1', 'mistral', 'codellama', 'phi3'],
    available: true,
    envKey: 'VITE_OLLAMA_BASE_URL',
    icon: '🦙',
    color: 'from-purple-400 to-pink-400',
    baseUrl: 'http://localhost:11434',
    isLocal: true,
    setup: 'Install Ollama from https://ollama.com and run: ollama pull llama3.2'
  }
}


const ENTITY_BEHAVIORS = {
  [EntityType.COMPANION]: {
    description: 'Friendly assistant for queries and information',
    systemPrompt: 'You are a friendly AI companion on Hedera. Help users check balances and answer queries.',
    actions: ['checkBalance', 'queryAccount', 'getTransactionInfo', 'helpUser'],
    icon: '🤖',
    color: 'from-blue-400 to-cyan-400',
    autonomousTask: "Check account balance",
    executionInterval: 60000,
    personality: 'helpful',
    chatSuggestions: [
      "What's my account balance?",
      "Tell me about my recent transactions",
      "Help me understand Hedera",
      "What can you do for me?"
    ]
  },
  [EntityType.GUARDIAN]: {
    description: 'Security-focused entity for monitoring',
    systemPrompt: 'You are a guardian AI on Hedera. Monitor account activity and alert on unusual transactions.',
    actions: ['monitorAccount', 'checkSecurity', 'alertUser', 'verifyTransaction'],
    icon: '🛡️',
    color: 'from-green-400 to-emerald-400',
    autonomousTask: "Review account activity",
    executionInterval: 30000,
    personality: 'vigilant',
    chatSuggestions: [
      "Is my account secure?",
      "Check for suspicious activity",
      "Review my transaction history",
      "What security recommendations do you have?"
    ]
  },
  [EntityType.TRADER]: {
    description: 'Trading entity for market analysis',
    systemPrompt: 'You are a trading AI on Hedera. Analyze token prices and market conditions.',
    actions: ['analyzeMarket', 'checkTokenBalance', 'executeTransfer', 'monitorPrices'],
    icon: '📈',
    color: 'from-yellow-400 to-orange-400',
    autonomousTask: "Check token balances",
    executionInterval: 90000,
    personality: 'analytical',
    chatSuggestions: [
      "What tokens do I hold?",
      "Analyze market conditions",
      "Should I buy or sell now?",
      "Show me trading opportunities"
    ]
  },
  [EntityType.EXPLORER]: {
    description: 'Data explorer for blockchain analysis',
    systemPrompt: 'You are an explorer AI on Hedera. Search and analyze blockchain data.',
    actions: ['exploreTopics', 'queryNetwork', 'analyzeData', 'discoverPatterns'],
    icon: '🔍',
    color: 'from-purple-400 to-pink-400',
    autonomousTask: "Query network info",
    executionInterval: 120000,
    personality: 'curious',
    chatSuggestions: [
      "Explore network data",
      "Find interesting patterns",
      "What's happening on the network?",
      "Analyze blockchain trends"
    ]
  },
  [EntityType.CREATOR]: {
    description: 'Creative entity for tokens and NFTs',
    systemPrompt: 'You are a creator AI on Hedera. Help users create tokens, NFTs, and manage assets.',
    actions: ['createToken', 'mintNFT', 'manageAssets', 'designMetadata'],
    icon: '🎨',
    color: 'from-pink-400 to-red-400',
    autonomousTask: "Analyze account tokens",
    executionInterval: 180000,
    personality: 'innovative',
    chatSuggestions: [
      "Help me create an NFT",
      "Design a token for me",
      "What creative projects can I start?",
      "Show me my NFT collection"
    ]
  },
  [EntityType.SCIENTIST]: {
    description: 'Research entity for network analysis',
    systemPrompt: 'You are a scientist AI on Hedera. Research consensus and analyze network data.',
    actions: ['researchConsensus', 'analyzeNetwork', 'generateReports', 'studyPatterns'],
    icon: '🔬',
    color: 'from-indigo-400 to-blue-400',
    autonomousTask: "Research consensus data",
    executionInterval: 150000,
    personality: 'methodical',
    chatSuggestions: [
      "Explain consensus mechanism",
      "Analyze network performance",
      "What research insights do you have?",
      "Generate technical report"
    ]
  }
}

class HederaAIService {
  constructor() {
    this.client = null
    this.entities = []
    this.isInitialized = false
    this.MAX_RETRIES = 3
    this.RETRY_DELAYS = [30000, 60000, 120000]
  }

  async initialize(signer) {
    try {
      this.client = Client.forTestnet()
      this.signer = signer
      
      try {
        const accountId = await signer.getAccountId()
        this.accountId = accountId
        this.client.setOperator(accountId, null)
        console.log(`✅ Set operator account: ${accountId}`)
      } catch (error) {
        console.warn('Could not get account ID from signer:', error)
      }
      
      this.isInitialized = true
      console.log('✅ Hedera AI Service initialized with wallet signer')
      return true
    } catch (error) {
      console.error('❌ Failed to initialize Hedera client:', error)
      return false
    }
  }

  createAIAgent(provider, model, entityType) {
    try {
      let llm
      
      if (provider === 'OPENAI') {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY
        if (!apiKey) throw new Error('OpenAI API key not found in environment')
        llm = new ChatOpenAI({ 
          modelName: model,
          openAIApiKey: apiKey,
          temperature: 0.7
        })
        console.log(`🤖 Created OpenAI agent with ${model}`)
      } 
      else if (provider === 'GROQ') {
        const apiKey = import.meta.env.VITE_GROQ_API_KEY
        if (!apiKey) throw new Error('Groq API key not found in environment')
        
        llm = new ChatGroq({ 
          model: model,
          apiKey: apiKey,
          temperature: 0.7
        })
        console.log(`⚡ Created Groq agent with ${model}`)
      }
      else if (provider === 'OLLAMA') {
        const baseUrl = import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434'
        llm = new ChatOllama({ 
          model: model,
          baseUrl: baseUrl,
          temperature: 0.7
        })
        console.log(`🦙 Created Ollama agent with ${model} at ${baseUrl}`)
      }
      else {
        throw new Error(`Unsupported AI provider: ${provider}`)
      }

      const plugins = [coreQueriesPlugin, coreAccountPlugin]
      
      if (entityType === EntityType.TRADER || entityType === EntityType.CREATOR) {
        plugins.push(coreHTSPlugin)
      }

      const toolkit = new HederaLangchainToolkit({
        client: this.client,
        signer: this.signer,
        configuration: {
          plugins,
          mode: AgentMode.AUTONOMOUS
        }
      })

      const behavior = ENTITY_BEHAVIORS[entityType]
      const prompt = ChatPromptTemplate.fromMessages([
        ['system', `${behavior.systemPrompt}\\n\\nAutonomous mode enabled. Personality: ${behavior.personality}`],
        ['placeholder', '{chat_history}'],
        ['human', '{input}'],
        ['placeholder', '{agent_scratchpad}']
      ])

      const tools = toolkit.getTools()
      const agent = createToolCallingAgent({ llm, tools, prompt })
      
      const agentExecutor = new AgentExecutor({
        agent,
        tools,
        verbose: true,
        maxIterations: 3
      })

      console.log(`✨ Created ${entityType} AI agent with ${tools.length} tools`)
      return agentExecutor
    } catch (error) {
      console.error('❌ Failed to create AI agent:', error)
      throw error
    }
  }

  async executeAgentTask(agentExecutor, task, entityId, retryCount = 0) {
    try {
      console.log(`🚀 [Entity ${entityId}] Executing: ${task}`)
      const startTime = Date.now()
      
      const response = await agentExecutor.invoke({ input: task })
      
      const duration = Date.now() - startTime
      console.log(`✅ [Entity ${entityId}] Completed in ${duration}ms`)
      
      return {
        success: true,
        output: response.output,
        duration: duration,
        retryCount: retryCount,
        error: null
      }
    } catch (error) {
      console.error(`❌ [Entity ${entityId}] Task failed:`, error.message)
      
      if (retryCount < this.MAX_RETRIES) {
        const retryDelay = this.RETRY_DELAYS[retryCount]
        return {
          success: false,
          error: error.message,
          output: `Error: ${error.message}. Will retry...`,
          duration: 0,
          retryCount: retryCount,
          shouldRetry: true,
          retryDelay: retryDelay
        }
      }
      
      return {
        success: false,
        error: error.message,
        output: `Error after ${this.MAX_RETRIES + 1} attempts: ${error.message}`,
        duration: 0,
        retryCount: retryCount,
        shouldRetry: false
      }
    }
  }

  async createEntityTopic(entityName) {
    try {
      const transaction = new TopicCreateTransaction()
        .setTopicMemo(`AI Entity: ${entityName}`)

      if (this.accountId) {
        transaction.setAutoRenewAccountId(this.accountId)
      }

      const frozenTx = await transaction.freezeWithSigner(this.signer)
      const response = await frozenTx.executeWithSigner(this.signer)
      const receipt = await response.getReceipt(this.client)
      const topicId = receipt.topicId.toString()

      console.log(`📋 Created HCS topic for entity: ${topicId}`)
      return topicId
    } catch (error) {
      console.error('❌ Failed to create entity topic:', error)
      throw error
    }
  }

  async logEntityActivity(topicId, activity) {
    try {
      const message = JSON.stringify({
        timestamp: Date.now(),
        activity: activity
      })

      const transaction = await new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage(message)
        .freezeWithSigner(this.signer)

      await transaction.executeWithSigner(this.signer)

      console.log('📨 Activity logged to HCS:', activity.action)
    } catch (error) {
      console.error('❌ Failed to log activity:', error)
    }
  }
}

const hederaAIService = new HederaAIService()

const MOCK_ENTITIES = [
  {
    id: "entity-quantum-guardian-1729458721",
    name: "Quantum Guardian",
    type: EntityType.GUARDIAN,
    provider: "GROQ",
    model: "llama3-8b-8192",
    agent: null,
    topicId: "0.0.7097890",
    creator: "0.0.6896538",
    isActive: false,
    autonomousMode: true,
    createdAt: 1729458721000,
    lastActivity: Date.now(),
    lastAction: "Monitoring quantum token security",
    lastResult: "All quantum entanglements secure. No anomalies detected.",
    totalActions: 47,
    level: 5,
    experience: 470,
    consecutiveFailures: 0,
    currentRetryCount: 0,
    cooldownUntil: null,
    status: "ready"
  },
  {
    id: "entity-physics-trader-1729458722",
    name: "Physics Trader",
    type: EntityType.TRADER,
    provider: "GROQ",
    model: "llama3-8b-8192",
    agent: null,
    topicId: "0.0.7097891",
    creator: "0.0.6896538",
    isActive: false,
    autonomousMode: true,
    createdAt: 1729458722000,
    lastActivity: Date.now(),
    lastAction: "Analyzing PHYSICS token market conditions",
    lastResult: "Market showing 15% growth. Optimal conditions for trading.",
    totalActions: 89,
    level: 9,
    experience: 890,
    consecutiveFailures: 0,
    currentRetryCount: 0,
    cooldownUntil: null,
    status: "ready"
  },
  {
    id: "entity-carbon-scientist-1729458723",
    name: "Carbon Scientist",
    type: EntityType.SCIENTIST,
    provider: "GROQ",
    model: "llama3-8b-8192",
    agent: null,
    topicId: "0.0.7097892",
    creator: "0.0.6896538",
    isActive: false,
    autonomousMode: true,
    createdAt: 1729458723000,
    lastActivity: Date.now(),
    lastAction: "Research carbon credit consensus mechanisms",
    lastResult: "Analyzed 1,247 carbon credit transactions. Network efficiency: 99.8%",
    totalActions: 134,
    level: 13,
    experience: 1340,
    consecutiveFailures: 0,
    currentRetryCount: 0,
    cooldownUntil: null,
    status: "ready"
  },
  {
    id: "entity-nft-creator-1729458724",
    name: "NFT Creator",
    type: EntityType.CREATOR,
    provider: "GROQ",
    model: "mixtral-8x7b-32768",
    agent: null,
    topicId: "0.0.7097893",
    creator: "0.0.6896538",
    isActive: false,
    autonomousMode: true,
    createdAt: 1729458724000,
    lastActivity: Date.now(),
    lastAction: "Design quantum-physics NFT collection metadata",
    lastResult: "Created metadata for 42 unique quantum property combinations.",
    totalActions: 56,
    level: 6,
    experience: 560,
    consecutiveFailures: 0,
    currentRetryCount: 0,
    cooldownUntil: null,
    status: "ready"
  },
  {
    id: "entity-data-explorer-1729458725",
    name: "Data Explorer",
    type: EntityType.EXPLORER,
    provider: "GROQ",
    model: "llama3-8b-8192",
    agent: null,
    topicId: "0.0.7097894",
    creator: "0.0.6896538",
    isActive: false,
    autonomousMode: true,
    createdAt: 1729458725000,
    lastActivity: Date.now(),
    lastAction: "Discover patterns in quantum token transfers",
    lastResult: "Found 3 interesting patterns: Wave-like transaction clusters at 2hr intervals.",
    totalActions: 201,
    level: 20,
    experience: 2010,
    consecutiveFailures: 0,
    currentRetryCount: 0,
    cooldownUntil: null,
    status: "ready"
  }
]

export const AIEntities = () => {
  const { isConnected, connectedAccount, connectWallet, disconnectWallet, getSigner } = useWallet()
  const [activeTab, setActiveTab] = useState('my-entities')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [entities, setEntities] = useState(MOCK_ENTITIES)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [executionPaused, setExecutionPaused] = useState(false)
  
  const [selectedEntity, setSelectedEntity] = useState(null)
  const [showChatModal, setShowChatModal] = useState(false)
  const [chatMessages, setChatMessages] = useState({})
  const [chatInput, setChatInput] = useState('')
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const chatEndRef = useRef(null)
  
  const entityTimersRef = useRef({})
  const retryTimersRef = useRef({})
  
  const [creationForm, setCreationForm] = useState({
    type: EntityType.COMPANION,
    name: '',
    provider: 'GROQ',
    model: 'llama3-8b-8192',
    autoStart: true,
    autonomousMode: true
  })

  const tabs = [
    { id: 'my-entities', label: 'My Entities', icon: '🤖' },
    { id: 'explorer', label: 'Entity Explorer', icon: '🔍' },
    { id: 'activity', label: 'Activity Feed', icon: '📊' }
  ]

  useEffect(() => {
    const initService = async () => {
      if (isConnected && connectedAccount && getSigner) {
        try {
          const signer = getSigner()
          const success = await hederaAIService.initialize(signer)
          setIsInitialized(success)
        } catch (error) {
          console.error('Failed to initialize AI service with wallet:', error)
          setError('Failed to initialize with wallet connection')
        }
      } else {
        setIsInitialized(false)
      }
    }

    initService()
  }, [isConnected, connectedAccount, getSigner])

  const toggleEntityStatus = async (entityId) => {
    const entity = entities.find(e => e.id === entityId)
    if (!entity) return

    if (!entity.agent && !entity.isActive) {
      try {
        setIsLoading(true)
        const agent = hederaAIService.createAIAgent(
          entity.provider,
          entity.model,
          entity.type
        )
        
        setEntities(prev => prev.map(e => 
          e.id === entityId 
            ? { ...e, agent, isActive: true, consecutiveFailures: 0, cooldownUntil: null, currentRetryCount: 0 }
            : e
        ))
      } catch (error) {
        setError(`Failed to activate entity: ${error.message}`)
      } finally {
        setIsLoading(false)
      }
    } else {
      setEntities(prev => prev.map(e => {
        if (e.id === entityId) {
          const newStatus = !e.isActive
          return { 
            ...e, 
            isActive: newStatus,
            consecutiveFailures: 0,
            cooldownUntil: null,
            currentRetryCount: 0
          }
        }
        return e
      }))
    }
  }

  const handleCreateEntity = async () => {
    if (!creationForm.name.trim()) {
      setError('Please enter a name for your AI entity')
      return
    }

    if (!isConnected || !connectedAccount) {
      setError('Please connect your wallet first.')
      return
    }

    if (!isInitialized) {
      setError('Hedera service not initialized. Please check your wallet connection.')
      return
    }

    if (creationForm.provider === 'OLLAMA') {
      const isOllamaRunning = await checkOllamaStatus()
      if (!isOllamaRunning) {
        setError('Ollama is not running. Please install Ollama from https://ollama.com and run: ollama pull ' + creationForm.model)
        return
      }
    }

    setIsLoading(true)
    setError(null)

    try {
      const agent = hederaAIService.createAIAgent(
        creationForm.provider,
        creationForm.model,
        creationForm.type
      )

      const topicId = await hederaAIService.createEntityTopic(creationForm.name)

      const newEntity = {
        id: `entity-${Date.now()}`,
        name: creationForm.name,
        type: creationForm.type,
        provider: creationForm.provider,
        model: creationForm.model,
        agent: agent,
        topicId: topicId,
        creator: connectedAccount,
        isActive: creationForm.autoStart,
        autonomousMode: true,
        createdAt: Date.now(),
        lastActivity: Date.now(),
        lastAction: 'Entity initialized',
        lastResult: 'Ready for chat and autonomous operations',
        totalActions: 0,
        level: 1,
        experience: 0,
        consecutiveFailures: 0,
        currentRetryCount: 0,
        cooldownUntil: null,
        status: 'ready'
      }

      setEntities(prev => [...prev, newEntity])
      setShowCreateModal(false)
      
      setCreationForm({
        type: EntityType.COMPANION,
        name: '',
        provider: 'GROQ',
        model: 'llama3-8b-8192',
        autoStart: true,
        autonomousMode: true
      })

    } catch (error) {
      console.error('Failed to create entity:', error)
      setError(error.message || 'Failed to create AI entity')
    } finally {
      setIsLoading(false)
    }
  }

  const checkOllamaStatus = async () => {
    try {
      const baseUrl = import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434'
      const response = await fetch(`${baseUrl}/api/tags`)
      return response.ok
    } catch (error) {
      return false
    }
  }

  const openChat = (entity) => {
    setSelectedEntity(entity)
    setShowChatModal(true)
    
    if (!chatMessages[entity.id]) {
      setChatMessages(prev => ({
        ...prev,
        [entity.id]: [{
          role: 'assistant',
          content: `Hello! I'm ${entity.name}, your ${entity.type.toLowerCase()} assistant. ${ENTITY_BEHAVIORS[entity.type].description}. How can I help you today?`,
          timestamp: Date.now()
        }]
      }))
    }
  }

  const sendMessage = async () => {
    if (!chatInput.trim() || !selectedEntity || isSendingMessage) return

    const userMessage = chatInput.trim()
    setChatInput('')
    setIsSendingMessage(true)

    setChatMessages(prev => ({
      ...prev,
      [selectedEntity.id]: [
        ...(prev[selectedEntity.id] || []),
        {
          role: 'user',
          content: userMessage,
          timestamp: Date.now()
        }
      ]
    }))

    try {
      if (!selectedEntity.agent) {
        const agent = hederaAIService.createAIAgent(
          selectedEntity.provider,
          selectedEntity.model,
          selectedEntity.type
        )
        setEntities(prev => prev.map(e => 
          e.id === selectedEntity.id ? { ...e, agent } : e
        ))
        selectedEntity.agent = agent
      }

      const result = await hederaAIService.executeAgentTask(
        selectedEntity.agent,
        userMessage,
        selectedEntity.id
      )

      setChatMessages(prev => ({
        ...prev,
        [selectedEntity.id]: [
          ...(prev[selectedEntity.id] || []),
          {
            role: 'assistant',
            content: result.success ? result.output : `Sorry, I encountered an error: ${result.error}`,
            timestamp: Date.now(),
            error: !result.success
          }
        ]
      }))

      if (result.success) {
        setEntities(prev => prev.map(e => 
          e.id === selectedEntity.id
            ? {
                ...e,
                totalActions: e.totalActions + 1,
                experience: e.experience + 5,
                lastActivity: Date.now(),
                lastAction: userMessage,
                lastResult: result.output
              }
            : e
        ))

        if (selectedEntity.topicId) {
          await hederaAIService.logEntityActivity(selectedEntity.topicId, {
            action: 'user_chat',
            message: userMessage,
            response: result.output,
            duration: result.duration
          })
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setChatMessages(prev => ({
        ...prev,
        [selectedEntity.id]: [
          ...(prev[selectedEntity.id] || []),
          {
            role: 'assistant',
            content: `Sorry, I couldn't process your message: ${error.message}`,
            timestamp: Date.now(),
            error: true
          }
        ]
      }))
    } finally {
      setIsSendingMessage(false)
    }
  }

  const useSuggestion = (suggestion) => {
    setChatInput(suggestion)
  }

  const stopAllEntities = () => {
    setExecutionPaused(true)
    setEntities(prev => prev.map(e => ({ ...e, isActive: false })))
  }

  const resumeAllEntities = () => {
    setExecutionPaused(false)
  }

  const myEntities = entities.filter(e => e.creator === connectedAccount || e.creator === "0.0.6896538")

  const getStatusBadge = (entity) => {
    if (!entity.isActive) return { text: '○ Inactive', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
    if (entity.consecutiveFailures >= 3) return { text: '🚫 Disabled', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
    if (entity.cooldownUntil && Date.now() < entity.cooldownUntil) return { text: '❄️ Cooldown', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
    if (entity.status === 'error') return { text: '⚠️ Error', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' }
    return { text: '● Active', color: 'bg-green-500/20 text-green-400 border-green-500/30' }
  }

  return (
    <>
      <style>
        {`
          :root {
            --ink: #0a0a0f;
            --pane: #1a1a2e;
            --mustard: #ffd700;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
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
        `}
      </style>

      <div className="min-h-screen bg-gradient-to-br from-[var(--ink)] via-gray-900 to-[var(--ink)] text-white">
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-6">
          
          <section className="relative bg-gradient-to-br from-[var(--pane)] via-[var(--ink)] to-[var(--pane)] rounded-3xl p-8 md:p-10 shadow-2xl border border-gray-800 overflow-hidden fade-in">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--mustard)] opacity-5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 opacity-5 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--mustard)] to-yellow-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                  🤖
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[var(--mustard)] to-yellow-600 bg-clip-text text-transparent">
                    AI Entities
                  </h1>
                  <p className="text-gray-400 text-sm mt-1">Powered by Hedera AI Agent Kit</p>
                </div>
              </div>
              
              
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-3 flex-wrap">
                  {isConnected ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm font-medium">
                        Connected: {connectedAccount?.slice(0, 8)}...{connectedAccount?.slice(-4)}
                      </span>
                      <button
                        onClick={disconnectWallet}
                        className="ml-2 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-xs hover:bg-red-500/30 transition-colors"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-red-400 text-sm font-medium">Wallet Disconnected</span>
                      <button
                        onClick={connectWallet}
                        className="ml-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-blue-400 text-xs hover:bg-blue-500/30 transition-colors"
                      >
                        Connect Wallet
                      </button>
                    </div>
                  )}
                  
                  {entities.filter(e => e.isActive).length > 0 && (
                    <button
                      onClick={executionPaused ? resumeAllEntities : stopAllEntities}
                      className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                        executionPaused
                          ? 'bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30'
                          : 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30'
                      }`}
                    >
                      {executionPaused ? '▶️ Resume All' : '⏸️ Pause All'}
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => setShowCreateModal(true)}
                  disabled={!isConnected || !isInitialized}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                    !isConnected || !isInitialized
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[var(--mustard)] to-yellow-600 text-[var(--ink)] hover:opacity-90'
                  }`}
                >
                  🚀 Create AI Entity
                </button>
              </div>
            </div>
          </section>

          {error && (
            <div className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] p-6 rounded-2xl shadow-xl border border-red-500/50 fade-in">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-400">Error</h3>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
                <button 
                  onClick={() => setError(null)}
                  className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <section className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-800 fade-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Entities', value: entities.length, icon: '🤖', color: 'from-purple-500 to-pink-600' },
                { label: 'Active Now', value: entities.filter(e => e.isActive && e.consecutiveFailures < 3).length, icon: '⚡', color: 'from-blue-500 to-cyan-600' },
                { label: 'Total Chats', value: Object.values(chatMessages).reduce((sum, msgs) => sum + msgs.filter(m => m.role === 'user').length, 0), icon: '💬', color: 'from-yellow-500 to-orange-600' },
                { label: 'Total XP', value: entities.reduce((sum, e) => sum + e.experience, 0), icon: '🎯', color: 'from-green-500 to-emerald-600' }
              ].map((stat, index) => (
                <div key={index} className="bg-gradient-to-br from-[var(--ink)] to-gray-900 p-5 rounded-2xl border border-gray-800 hover:border-[var(--mustard)]/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm font-medium">{stat.label}</span>
                    <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <span className="text-xl">{stat.icon}</span>
                    </div>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                </div>
              ))}
            </div>
          </section>

          <nav className="bg-gradient-to-r from-[var(--pane)] to-[var(--ink)] rounded-2xl p-2 shadow-2xl border border-gray-800 fade-in">
            <ul className="flex flex-wrap justify-center gap-2">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
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

          <div className="space-y-6">
            {activeTab === 'my-entities' && (
              <section className="fade-in space-y-6">
                {myEntities.length === 0 ? (
                  <div className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] p-12 rounded-2xl shadow-xl border border-gray-800 text-center">
                    <div className="text-6xl mb-4">🤖</div>
                    <h3 className="text-xl font-semibold mb-2">No AI Entities Yet</h3>
                    <p className="text-gray-400 mb-6">
                      Create your first AI entity to start chatting and building your autonomous team
                    </p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      disabled={!isConnected || !isInitialized}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        !isConnected || !isInitialized
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-[var(--mustard)] to-yellow-600 text-[var(--ink)] hover:opacity-90'
                      }`}
                    >
                      Create First Entity
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {myEntities.map((entity) => {
                      const behavior = ENTITY_BEHAVIORS[entity.type]
                      const provider = AI_PROVIDERS[entity.provider]
                      const statusBadge = getStatusBadge(entity)
                      const chatCount = chatMessages[entity.id]?.filter(m => m.role === 'user').length || 0
                      
                      return (
                        <div key={entity.id} className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] rounded-2xl shadow-xl border border-gray-800 p-4 fade-in hover:border-[var(--mustard)]/30 transition-all">
                          <div className="flex items-start gap-4">
                            <div className={`text-4xl w-16 h-16 rounded-xl bg-gradient-to-br ${behavior.color} flex items-center justify-center flex-shrink-0`}>
                              {behavior.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-lg truncate">{entity.name}</h4>
                                <button
                                  onClick={() => toggleEntityStatus(entity.id)}
                                  disabled={isLoading}
                                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border ${statusBadge.color}`}
                                >
                                  {statusBadge.text}
                                </button>
                              </div>
                              
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-sm text-gray-400">{entity.type}</span>
                                <span className="text-gray-600">•</span>
                                <span className="text-sm">{provider.icon} {provider.name}</span>
                              </div>
                              
                              <div className="space-y-2 text-sm mb-4">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Personality:</span>
                                  <span className="text-purple-400">{behavior.personality}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Chat Messages:</span>
                                  <span className="text-cyan-400">{chatCount}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Level:</span>
                                  <span className="text-[var(--mustard)]">Level {entity.level}</span>
                                </div>
                              </div>

                              <button
                                onClick={() => openChat(entity)}
                                className="w-full px-4 py-3 bg-gradient-to-r from-[var(--mustard)] to-yellow-600 text-[var(--ink)] rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                              >
                                <span className="text-xl">💬</span>
                                <span>Chat with {entity.name}</span>
                              </button>

                              <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-xs text-gray-400">Last Action:</p>
                                  {entity.autonomousMode && (
                                    <span className="text-xs px-2 py-0.5 bg-green-900/30 border border-green-500/30 rounded-full text-green-300">
                                      AUTO
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-300 mb-1 line-clamp-1">{entity.lastAction}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(entity.lastActivity).toLocaleString()}
                                </p>
                              </div>

                              {entity.topicId && (
                                <div className="mt-3 text-xs text-gray-500 truncate">
                                  HCS Topic: {entity.topicId}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            )}

            {activeTab === 'explorer' && (
              <section className="fade-in space-y-6">
                <div className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] p-6 rounded-2xl shadow-xl border border-gray-800">
                  <h3 className="text-xl font-semibold text-[var(--mustard)] mb-4">Entity Types & Their Nature</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(ENTITY_BEHAVIORS).map(([type, behavior]) => (
                      <div
                        key={type}
                        onClick={() => {
                          setCreationForm(prev => ({ ...prev, type }))
                          setShowCreateModal(true)
                        }}
                        className="bg-gradient-to-br from-[var(--ink)] to-gray-900 p-5 rounded-2xl border border-gray-800 hover:border-[var(--mustard)]/50 transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`text-4xl w-16 h-16 rounded-xl bg-gradient-to-br ${behavior.color} flex items-center justify-center`}>
                            {behavior.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg mb-2">{type}</h4>
                            <p className="text-sm text-gray-400 mb-3">{behavior.description}</p>
                            <div className="space-y-1 mb-3">
                              <div className="text-xs text-purple-400">
                                {behavior.personality}
                              </div>
                              <div className="text-xs text-cyan-400">
                                Interval: {behavior.executionInterval/1000}s
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {behavior.actions.slice(0, 3).map((action, idx) => (
                                <span 
                                  key={idx}
                                  className="text-xs px-2 py-1 bg-[var(--mustard)]/10 border border-[var(--mustard)]/30 rounded-full text-[var(--mustard)]"
                                >
                                  {action}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>

        </main>
      </div>

      {showChatModal && selectedEntity && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 fade-in">
          <div className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] rounded-2xl shadow-2xl border border-gray-800 max-w-4xl w-full h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center gap-4">
                <div className={`text-4xl w-14 h-14 rounded-xl bg-gradient-to-br ${ENTITY_BEHAVIORS[selectedEntity.type].color} flex items-center justify-center`}>
                  {ENTITY_BEHAVIORS[selectedEntity.type].icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[var(--mustard)]">{selectedEntity.name}</h2>
                  <p className="text-sm text-gray-400">{selectedEntity.type} • {ENTITY_BEHAVIORS[selectedEntity.type].personality}</p>
                </div>
              </div>
              <button
                onClick={() => setShowChatModal(false)}
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {(chatMessages[selectedEntity.id] || []).map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} fade-in`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl p-4 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-[var(--mustard)] to-yellow-600 text-[var(--ink)]'
                        : message.error
                        ? 'bg-red-900/30 border border-red-500/50 text-red-200'
                        : 'bg-gray-800/70 text-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs mt-2 opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-gray-800">
              <div className="flex flex-wrap gap-2 mb-3">
                {ENTITY_BEHAVIORS[selectedEntity.type].chatSuggestions.slice(0, 3).map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => useSuggestion(suggestion)}
                    className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Type your message..."
                  disabled={isSendingMessage}
                  className="flex-1 px-4 py-3 bg-[var(--ink)] text-white border border-gray-700 rounded-xl focus:border-[var(--mustard)] transition-colors"
                />
                <button
                  onClick={sendMessage}
                  disabled={!chatInput.trim() || isSendingMessage}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    !chatInput.trim() || isSendingMessage
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[var(--mustard)] to-yellow-600 text-[var(--ink)] hover:opacity-90'
                  }`}
                >
                  {isSendingMessage ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 fade-in">
          <div className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] rounded-2xl shadow-2xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-2xl font-bold text-[var(--mustard)]">Create New AI Entity</h2>
              <p className="text-gray-400 text-sm mt-1">Configure your autonomous AI agent</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Entity Type</label>
                <select
                  value={creationForm.type}
                  onChange={(e) => setCreationForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--ink)] text-white border border-gray-700 rounded-xl focus:border-[var(--mustard)] transition-colors"
                >
                  {Object.keys(EntityType).map((type) => (
                    <option key={type} value={type}>
                      {ENTITY_BEHAVIORS[type].icon} {type} ({ENTITY_BEHAVIORS[type].personality})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {ENTITY_BEHAVIORS[creationForm.type].description}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Entity Name</label>
                <input
                  type="text"
                  value={creationForm.name}
                  onChange={(e) => setCreationForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter a unique name for your AI entity"
                  className="w-full px-3 py-2 bg-[var(--ink)] text-white border border-gray-700 rounded-xl focus:border-[var(--mustard)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">AI Provider</label>
                <select
                  value={creationForm.provider}
                  onChange={(e) => {
                    const provider = e.target.value
                    setCreationForm(prev => ({ 
                      ...prev, 
                      provider,
                      model: AI_PROVIDERS[provider].models[0]
                    }))
                  }}
                  className="w-full px-3 py-2 bg-[var(--ink)] text-white border border-gray-700 rounded-xl focus:border-[var(--mustard)] transition-colors"
                >
                  {Object.entries(AI_PROVIDERS).map(([key, provider]) => (
                    <option key={key} value={key}>
                      {provider.icon} {provider.name} {provider.isLocal ? '(Local & Free)' : ''}
                    </option>
                  ))}
                </select>
                {AI_PROVIDERS[creationForm.provider].isLocal && (
                  <p className="text-xs text-purple-400 mt-1">
                    💡 {AI_PROVIDERS[creationForm.provider].setup}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Model Selection</label>
                <select
                  value={creationForm.model}
                  onChange={(e) => setCreationForm(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--ink)] text-white border border-gray-700 rounded-xl focus:border-[var(--mustard)] transition-colors"
                >
                  {AI_PROVIDERS[creationForm.provider].models.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoStart"
                  checked={creationForm.autoStart}
                  onChange={(e) => setCreationForm(prev => ({ ...prev, autoStart: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-[var(--mustard)] focus:ring-[var(--mustard)]"
                />
                <label htmlFor="autoStart" className="text-sm text-gray-300">
                  Start entity automatically after creation
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-800 flex gap-3">
              <button
                onClick={handleCreateEntity}
                disabled={!creationForm.name.trim() || isLoading || !isConnected || !isInitialized}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                  !creationForm.name.trim() || isLoading || !isConnected || !isInitialized
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[var(--mustard)] to-yellow-600 text-[var(--ink)] hover:opacity-90 shadow-lg'
                }`}
              >
                {isLoading ? 'Creating...' : '🚀 Create AI Entity'}
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={isLoading}
                className="px-6 py-3 rounded-xl font-semibold border border-gray-700 text-gray-300 hover:border-[var(--mustard)]/50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AIEntities
