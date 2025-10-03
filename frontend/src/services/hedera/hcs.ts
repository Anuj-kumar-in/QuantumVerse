import {
  Client,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicInfoQuery,
  TopicId,
  PrivateKey,
  AccountId
} from '@hashgraph/sdk'
import { getHederaClient } from './client'
import { type ConsensusMessage } from '../../types/hedera'

export class HCSService {
  private subscriptions: Map<string, any> = new Map()

  private getClient(): Client {
    return getHederaClient().getClient()
  }

  /**
   * Create a new consensus topic for quantum entanglement synchronization
   */
  public async createTopic(
    memo: string,
    adminKey?: PrivateKey,
    submitKey?: PrivateKey
  ): Promise<string> {
    try {
      const topicCreateTx = new TopicCreateTransaction()
        .setTopicMemo(memo)

      if (adminKey) {
        topicCreateTx.setAdminKey(adminKey)
      }

      if (submitKey) {
        topicCreateTx.setSubmitKey(submitKey)
      }

      const client = this.getClient()
      const topicCreateSubmit = await topicCreateTx.freezeWith(client).execute(client)
      const topicCreateReceipt = await topicCreateSubmit.getReceipt(client)
      const topicId = topicCreateReceipt.topicId!

      console.log(`✅ Created consensus topic: ${topicId}`)
      return topicId.toString()
    } catch (error) {
      console.error('Failed to create topic:', error)
      throw new Error('Topic creation failed')
    }
  }

  /**
   * Submit a message to a consensus topic
   */
  public async submitMessage(
    topicId: string,
    message: string,
    submitKey?: PrivateKey
  ): Promise<string> {
    try {
      const messageSubmitTx = new TopicMessageSubmitTransaction()
        .setTopicId(TopicId.fromString(topicId))
        .setMessage(message)

      if (submitKey) {
        const client = this.getClient()
        messageSubmitTx.freezeWith(client)
        const messageSubmitTxSigned = await messageSubmitTx.sign(submitKey)
        const messageSubmitSubmit = await messageSubmitTxSigned.execute(client)
        const messageSubmitReceipt = await messageSubmitSubmit.getReceipt(client)

        console.log(`✅ Submitted message to topic ${topicId}`)
        return messageSubmitSubmit.transactionId.toString()
      } else {
        const client = this.getClient()
        const messageSubmitSubmit = await messageSubmitTx.freezeWith(client).execute(client)
        const messageSubmitReceipt = await messageSubmitSubmit.getReceipt(client)

        console.log(`✅ Submitted message to topic ${topicId}`)
        return messageSubmitSubmit.transactionId.toString()
      }
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
    newState: any,
    submitKey?: PrivateKey
  ): Promise<string> {
    const syncData = {
      type: 'ENTANGLEMENT_SYNC',
      entanglementId,
      assetId,
      newState,
      timestamp: new Date().toISOString()
    }

    return this.submitMessage(topicId, JSON.stringify(syncData), submitKey)
  }

  /**
   * Submit AI entity decision
   */
  public async submitAIDecision(
    topicId: string,
    entityId: string,
    decision: any,
    submitKey?: PrivateKey
  ): Promise<string> {
    const decisionData = {
      type: 'AI_DECISION',
      entityId,
      decision,
      timestamp: new Date().toISOString()
    }

    return this.submitMessage(topicId, JSON.stringify(decisionData), submitKey)
  }

  /**
   * Submit carbon reward calculation
   */
  public async submitCarbonReward(
    topicId: string,
    accountId: string,
    action: string,
    carbonSaved: number,
    submitKey?: PrivateKey
  ): Promise<string> {
    const rewardData = {
      type: 'CARBON_REWARD',
      accountId,
      action,
      carbonSaved,
      timestamp: new Date().toISOString()
    }

    return this.submitMessage(topicId, JSON.stringify(rewardData), submitKey)
  }

  /**
   * Subscribe to topic messages (Mirror Node required)
   */
  public async subscribeToTopic(
    topicId: string,
    callback: (message: ConsensusMessage) => void,
    startTime?: Date
  ): Promise<void> {
    try {
      const mirrorNodeUrl = import.meta.env.VITE_MIRROR_NODE_URL
      if (!mirrorNodeUrl) {
        throw new Error('Mirror node URL not configured')
      }

      // This is a simplified implementation
      // In a real app, you'd use the Mirror Node REST API or streaming API
      console.log(`📡 Subscribing to topic ${topicId} messages`)

      // Store subscription for later cleanup
      this.subscriptions.set(topicId, { callback, active: true })

      // Simulate periodic message checking (in real implementation, use WebSocket or SSE)
      const checkMessages = async () => {
        const subscription = this.subscriptions.get(topicId)
        if (!subscription || !subscription.active) return

        try {
          // Fetch messages from Mirror Node REST API
          const response = await fetch(
            `${mirrorNodeUrl}/api/v1/topics/${topicId}/messages?limit=10&order=desc`
          )

          if (response.ok) {
            const data = await response.json()

            // Process new messages
            data.messages?.forEach((msg: any) => {
              const consensusMessage: ConsensusMessage = {
                topicId,
                message: Buffer.from(msg.message, 'base64').toString(),
                timestamp: new Date(msg.consensus_timestamp * 1000),
                sequenceNumber: msg.sequence_number,
                runningHash: msg.running_hash
              }

              callback(consensusMessage)
            })
          }
        } catch (error) {
          console.error('Error fetching topic messages:', error)
        }

        // Schedule next check
        setTimeout(checkMessages, 5000) // Check every 5 seconds
      }

      // Start checking
      checkMessages()
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
    if (subscription) {
      subscription.active = false
      this.subscriptions.delete(topicId)
      console.log(`🔌 Unsubscribed from topic ${topicId}`)
    }
  }

  /**
   * Get topic information
   */
  public async getTopicInfo(topicId: string) {
    try {
      const client = this.getClient()
      const topicInfo = await new TopicInfoQuery()
        .setTopicId(TopicId.fromString(topicId))
        .execute(client)

      return {
        topicId: topicInfo.topicId.toString(),
        memo: topicInfo.topicMemo,
        runningHash: topicInfo.runningHash,
        sequenceNumber: topicInfo.sequenceNumber.toString(),
        expirationTime: topicInfo.expirationTime,
        adminKey: topicInfo.adminKey?.toString(),
        submitKey: topicInfo.submitKey?.toString(),
        autoRenewAccountId: topicInfo.autoRenewAccountId?.toString(),
        autoRenewPeriod: topicInfo.autoRenewPeriod?.seconds.toString()
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
    this.subscriptions.forEach((subscription, topicId) => {
      subscription.active = false
    })
    this.subscriptions.clear()
    console.log('🧹 Cleaned up all HCS subscriptions')
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