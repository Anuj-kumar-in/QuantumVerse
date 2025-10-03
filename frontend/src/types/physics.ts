// src/types/physics.ts - Complete physics types

// Reality types (THIS WAS MISSING!)
export enum RealityType {
  VIRTUAL = 'VIRTUAL',
  AUGMENTED = 'AUGMENTED', 
  PHYSICAL = 'PHYSICAL',
  MIXED = 'MIXED'
}

// Rarity enum for NFTs
export enum Rarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
  MYTHIC = 'MYTHIC'
}

// Physics types
export enum PhysicsType {
  GRAVITY = 'GRAVITY',
  TIME = 'TIME',
  WEATHER = 'WEATHER',
  MATTER = 'MATTER',
  ENERGY = 'ENERGY',
  SPACE = 'SPACE',
  QUANTUM_FIELD = 'QUANTUM_FIELD'
}

// Effect types for visual effects
export enum EffectType {
  PARTICLE = 'PARTICLE',
  FIELD = 'FIELD',
  DISTORTION = 'DISTORTION',
  LIGHTING = 'LIGHTING',
  SHADER = 'SHADER'
}

// Proposal status for governance
export enum ProposalStatus {
  ACTIVE = 'ACTIVE',
  PASSED = 'PASSED',
  REJECTED = 'REJECTED',
  EXECUTED = 'EXECUTED',
  EXPIRED = 'EXPIRED'
}

// ... rest of your interfaces (PhysicsProperties, etc.)
export interface PhysicsProperties {
  magnitude: number;
  duration: number; // seconds
  range: number; // meters
  cooldown: number; // seconds
  energyCost: number;
  compatibility: PhysicsType[];
}

export interface PhysicsEffect {
  name: string;
  description: string;
  formula: string;
  variables: Record<string, number>;
  visualEffect: VisualEffect;
}

export interface VisualEffect {
  type: EffectType;
  intensity: number;
  color: string;
  animation: string;
  duration: number;
}

export interface NFTMetadata {
  image: string;
  animationUrl?: string;
  attributes: NFTAttribute[];
  creator: string;
  createdAt: Date;
  ipfsHash: string;
}

export interface NFTAttribute {
  traitType: string;
  value: string | number;
  displayType?: string;
  maxValue?: number;
}

export interface PhysicsNFT {
  tokenId: string;
  name: string;
  description: string;
  physicsType: PhysicsType;
  properties: PhysicsProperties;
  rarity: Rarity;
  price: string;
  owner: string;
  metadata: NFTMetadata;
  effects: PhysicsEffect[];
}

export interface PhysicsLaw {
  id: string;
  name: string;
  description: string;
  formula: string;
  constants: Record<string, number>;
  applicableRealities: RealityType[]; // Now RealityType is defined!
  governanceTokens: number;
}

export interface PhysicsModification {
  lawId: string;
  proposalId: string;
  modifier: string;
  newValue: number;
  votes: number;
  status: ProposalStatus;
  expiresAt: Date;
}

export interface PhysicsState {
  gravity: number;
  timeFlow: number;
  energy: number;
  temperature: number;
  pressure: number;
  electromagnetics: number;
}

export interface PhysicsEngine {
  laws: PhysicsLaw[];
  activeModifications: PhysicsModification[];
  currentConstants: Record<string, number>;
  realityStates: Record<RealityType, PhysicsState>; // Now works!
}

// Constants for validation
export const PHYSICS_CONSTANTS = {
  MIN_MAGNITUDE: 0.1,
  MAX_MAGNITUDE: 5.0,
  MIN_DURATION: 10,
  MAX_DURATION: 300,
  MIN_RANGE: 1,
  MAX_RANGE: 100,
  EARTH_GRAVITY: 9.81,
  NORMAL_TIME_FLOW: 1.0
} as const;
