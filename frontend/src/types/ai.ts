import { RealityType } from './quantum'

export interface AIEntity {
  id: string;
  name: string;
  type: EntityType;
  creator: string;
  personality: AIPersonality;
  capabilities: AICapability[];
  assets: EntityAsset[];
  behavior: BehaviorState;
  earnings: EarningsHistory;
  evolution: EvolutionTracker;
  territories: Territory[];
}

export enum EntityType {
  COMPANION = 0,
  GUARDIAN = 1,
  TRADER = 2,
  EXPLORER = 3,
  CREATOR = 4,
  SCIENTIST = 5
}


export interface AIPersonality {
  traits: PersonalityTrait[];
  goals: Goal[];
  preferences: Record<string, number>;
  relationships: Relationship[];
  emotionalState: EmotionalState;
}

export interface PersonalityTrait {
  name: string;
  value: number; // 0-100
  stability: number; // how much it changes over time
}

export interface Goal {
  id: string;
  description: string;
  priority: number;
  progress: number;
  deadline?: Date;
  rewards: Reward[];
}

export interface Reward {
  type: RewardType;
  amount: string;
  tokenId?: string;
}

export enum RewardType {
  HBAR = 'HBAR',
  TOKEN = 'TOKEN',
  NFT = 'NFT',
  EXPERIENCE = 'EXPERIENCE',
  REPUTATION = 'REPUTATION'
}

export interface Relationship {
  entityId: string;
  entityType: 'AI' | 'HUMAN';
  relationshipType: RelationshipType;
  strength: number;
  interactions: number;
  lastInteraction: Date;
}

export enum RelationshipType {
  ALLY = 'ALLY',
  RIVAL = 'RIVAL',
  NEUTRAL = 'NEUTRAL',
  MENTOR = 'MENTOR',
  STUDENT = 'STUDENT',
  TRADE_PARTNER = 'TRADE_PARTNER'
}

export interface EmotionalState {
  happiness: number;
  anger: number;
  fear: number;
  curiosity: number;
  confidence: number;
  lastUpdate: Date;
}

export interface AICapability {
  name: string;
  level: number;
  experience: number;
  category: CapabilityCategory;
  unlocked: boolean;
}

export enum CapabilityCategory {
  COMBAT = 'COMBAT',
  TRADING = 'TRADING',
  CRAFTING = 'CRAFTING',
  EXPLORATION = 'EXPLORATION',
  SOCIAL = 'SOCIAL',
  RESEARCH = 'RESEARCH'
}

export interface EntityAsset {
  id: string;
  type: AssetType;
  value: string;
  acquired: Date;
  currentUse: AssetUse;
}

export enum AssetType {
  HBAR = 'HBAR',
  TOKEN = 'TOKEN',
  NFT = 'NFT',
  REAL_ESTATE = 'REAL_ESTATE',
  VEHICLE = 'VEHICLE'
}

export enum AssetUse {
  ACTIVE = 'ACTIVE',
  STAKED = 'STAKED',
  TRADING = 'TRADING',
  LENDING = 'LENDING',
  STORAGE = 'STORAGE'
}

export interface BehaviorState {
  currentAction: Action;
  actionQueue: Action[];
  decisionTree: DecisionNode[];
  learningRate: number;
  adaptability: number;
}

export interface Action {
  id: string;
  type: ActionType;
  parameters: Record<string, any>;
  startTime: Date;
  estimatedDuration: number;
  status: ActionStatus;
}

export enum ActionType {
  TRADE = 'TRADE',
  EXPLORE = 'EXPLORE',
  CRAFT = 'CRAFT',
  SOCIALIZE = 'SOCIALIZE',
  LEARN = 'LEARN',
  REST = 'REST',
  COMPETE = 'COMPETE'
}

export enum ActionStatus {
  PLANNING = 'PLANNING',
  EXECUTING = 'EXECUTING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface DecisionNode {
  id: string;
  condition: string;
  action: ActionType;
  weight: number;
  successRate: number;
  lastUsed: Date;
}

export interface EarningsHistory {
  totalEarned: string;
  dailyAverage: string;
  bestDay: EarningsRecord;
  recentEarnings: EarningsRecord[];
  sources: EarningsSource[];
}

export interface EarningsRecord {
  date: Date;
  amount: string;
  source: string;
  transaction: string;
}

export interface EarningsSource {
  name: string;
  totalEarned: string;
  frequency: number;
  reliability: number;
}

export interface EvolutionTracker {
  level: number;
  experience: number;
  nextLevelAt: number;
  evolutionPoints: number;
  unlockedFeatures: string[];
  potentialEvolutions: Evolution[];
}

export interface Evolution {
  id: string;
  name: string;
  requirements: EvolutionRequirement[];
  benefits: EvolutionBenefit[];
  cost: number; // evolution points
}

export interface EvolutionRequirement {
  type: RequirementType;
  value: number;
  current: number;
}

export enum RequirementType {
  EXPERIENCE = 'EXPERIENCE',
  EARNINGS = 'EARNINGS',
  RELATIONSHIPS = 'RELATIONSHIPS',
  ACTIONS_COMPLETED = 'ACTIONS_COMPLETED',
  TIME_ACTIVE = 'TIME_ACTIVE'
}

export interface EvolutionBenefit {
  type: BenefitType;
  value: number;
  description: string;
}

export enum BenefitType {
  CAPABILITY_BOOST = 'CAPABILITY_BOOST',
  EARNING_MULTIPLIER = 'EARNING_MULTIPLIER',
  NEW_ACTION = 'NEW_ACTION',
  EFFICIENCY_BOOST = 'EFFICIENCY_BOOST',
  SOCIAL_BOOST = 'SOCIAL_BOOST'
}

export interface Territory {
  id: string;
  name: string;
  coordinates: Coordinates;
  size: number; // square meters
  type: TerritoryType;
  resources: TerritoryResource[];
  buildings: Building[];
  value: string;
}

export interface Coordinates {
  x: number;
  y: number;
  z: number;
  reality: RealityType;
}

export enum TerritoryType {
  RESIDENTIAL = 'RESIDENTIAL',
  COMMERCIAL = 'COMMERCIAL',
  INDUSTRIAL = 'INDUSTRIAL',
  NATURAL = 'NATURAL',
  SPECIAL = 'SPECIAL'
}

export interface TerritoryResource {
  type: ResourceType;
  amount: number;
  renewalRate: number;
  quality: number;
}

export enum ResourceType {
  ENERGY = 'ENERGY',
  MATERIALS = 'MATERIALS',
  INFORMATION = 'INFORMATION',
  BEAUTY = 'BEAUTY',
  RARITY = 'RARITY'
}

export interface Building {
  id: string;
  type: BuildingType;
  level: number;
  functionality: string[];
  maintenance: number;
  income: number;
}

export enum BuildingType {
  WORKSHOP = 'WORKSHOP',
  TRADING_POST = 'TRADING_POST',
  RESEARCH_LAB = 'RESEARCH_LAB',
  SOCIAL_HUB = 'SOCIAL_HUB',
  STORAGE = 'STORAGE'
}