
import { ethers } from 'ethers'
import { getHederaClient } from './client'
import { type ConsensusMessage } from '../../types/ethereum'

// Contract ABI for EventMessaging contract
const EVENT_MESSAGING_ABI = [
  "function createTopic(string memory memo) external returns (uint256)",
  "function submitMessage(uint256 topicId, string memory message) external",
  "function getTopicInfo(uint256 topicId) external view returns (string memory memo, uint256 messageCount, address creator)",
  "event TopicCreated(uint256 indexed topicId, address indexed creator, string memo)",
  "event MessageSubmitted(uint256 indexed topicId, address indexed sender, string message, uint256 timestamp)"
]

export class HCSService { // Keep name for frontend compatibility
  private subscriptions: Map<string, any> = new Map()
  private contract: ethers.Contract | null = null
  private contractAddress: string

  constructor(contractAddress?: string) {
    this.contractAddress = contractAddress || import.meta.env.VITE_EVENT_MESSAGING_CONTRACT_ADDRESS
    this.initializeContract()
  }

  private initializeContract(): void {
    try {
      const client = getHederaClient()
      const signer = client.getSigner()

      if (this.contractAddress) {
        this.contract = new ethers.Contract(this.contractAddress, EVENT_MESSAGING_ABI, signer)
      }
    } catch (error) {
      console.error('Failed to initialize EventMessaging contract:', error)
    }
  }

  /**
   * Create a new consensus topic for quantum entanglement synchronization
   */
  public async createTopic(memo: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized')

    try {
      const tx = await this.contract.createTopic(memo)
      const receipt = await tx.wait()

      // Get topic ID from event logs
      const topicCreatedEvent = receipt.logs.find((log: any) =>
        log.fragment?.name === 'TopicCreated'
      )

      const topicId = topicCreatedEvent?.args?.[0]?.toString() || '0'

      console.log(`✅ Created consensus topic: ${topicId}`)
      return topicId
    } catch (error) {
      console.error('Failed to create topic:', error)
      throw new Error('Topic creation failed')
    }
  }

  /**
   * Submit a message to a consensus topic
   */
  public async submitMessage(topicId: string, message: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized')

    try {
      const tx = await this.contract.submitMessage(topicId, message)
      const receipt = await tx.wait()

      console.log(`✅ Submitted message to topic ${topicId}`)
      return tx.hash
    } catch (error) {
      console.error('Failed to submit message:', error)
      throw new Error('Message submission failed')
    }
  }

  /**
   * Submit quantum entanglement synchronization data
   */
  public async submitEntanglementSync(
    topicId: string,
    entanglementId: string,
    assetId: string,
    newState: any
  ): Promise<string> {
    const syncData = {
      type: 'ENTANGLEMENT_SYNC',
      entanglementId,
      assetId,
      newState,
      timestamp: new Date().toISOString()
    }

    return this.submitMessage(topicId, JSON.stringify(syncData))
  }

  /**
   * Submit AI entity decision
   */
  public async submitAIDecision(
    topicId: string,
    entityId: string,
    decision: any
  ): Promise<string> {
    const decisionData = {
      type: 'AI_DECISION',
      entityId,
      decision,
      timestamp: new Date().toISOString()
    }

    return this.submitMessage(topicId, JSON.stringify(decisionData))
  }

  /**
   * Submit carbon reward calculation
   */
  public async submitCarbonReward(
    topicId: string,
    accountId: string,
    action: string,
    carbonSaved: number
  ): Promise<string> {
    const rewardData = {
      type: 'CARBON_REWARD',
      accountId,
      action,
      carbonSaved,
      timestamp: new Date().toISOString()
    }

    return this.submitMessage(topicId, JSON.stringify(rewardData))
  }

  /**
   * Subscribe to topic messages using event listeners
   */
  public async subscribeToTopic(
    topicId: string,
    callback: (message: ConsensusMessage) => void
  ): Promise<void> {
    if (!this.contract) throw new Error('Contract not initialized')

    try {
      // Create filter for MessageSubmitted events for specific topic
      const filter = this.contract.filters.MessageSubmitted(topicId)

      // Listen for new messages
      const eventHandler = (topicIdEvent: string, sender: string, message: string, timestamp: bigint, event: any) => {
        const consensusMessage: ConsensusMessage = {
          topicId: topicIdEvent,
          message: message,
          timestamp: new Date(Number(timestamp) * 1000),
          sequenceNumber: event.blockNumber,
          runningHash: event.transactionHash
        }

        callback(consensusMessage)
      }

      this.contract.on(filter, eventHandler)

      // Store subscription for cleanup
      this.subscriptions.set(topicId, { filter, handler: eventHandler, active: true })

      console.log(`📡 Subscribed to topic ${topicId} messages`)

      // Get historical messages
      const historicalEvents = await this.contract.queryFilter(filter, -1000) // Last 1000 blocks
      for (const event of historicalEvents) {
  if ('args' in event && event.args) {
    eventHandler(event.args[0], event.args[1], event.args[2], event.args[3], event)
  }
}


    } catch (error) {
      console.error('Failed to subscribe to topic:', error)
      throw new Error('Topic subscription failed')
    }
  }

  /**
   * Unsubscribe from topic messages
   */
  public unsubscribeFromTopic(topicId: string): void {
    const subscription = this.subscriptions.get(topicId)
    if (subscription && this.contract) {
      this.contract.off(subscription.filter, subscription.handler)
      this.subscriptions.delete(topicId)
      console.log(`🔌 Unsubscribed from topic ${topicId}`)
    }
  }

  /**
   * Get topic information
   */
  public async getTopicInfo(topicId: string) {
    if (!this.contract) throw new Error('Contract not initialized')

    try {
      const [memo, messageCount, creator] = await this.contract.getTopicInfo(topicId)

      return {
        topicId,
        memo,
        messageCount: messageCount.toString(),
        creator,
        // Mock values for compatibility
        runningHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        sequenceNumber: messageCount.toString(),
        expirationTime: null,
        adminKey: null,
        submitKey: null,
        autoRenewAccountId: null,
        autoRenewPeriod: null
      }
    } catch (error) {
      console.error('Failed to get topic info:', error)
      throw new Error('Failed to retrieve topic information')
    }
  }

  /**
   * Clean up all subscriptions
   */
  public cleanup(): void {
    if (this.contract) {
      this.subscriptions.forEach((subscription, topicId) => {
        this.contract!.off(subscription.filter, subscription.handler)
      })
    }
    this.subscriptions.clear()
    console.log('🧹 Cleaned up all event subscriptions')
  }
}

// Singleton instance
let hcsInstance: HCSService | null = null

export function getHCSService(): HCSService {
  if (!hcsInstance) {
    hcsInstance = new HCSService()
  }
  return hcsInstance
}
