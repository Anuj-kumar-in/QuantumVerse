export interface QuantumIdentity {
  id: string;
  quantumDNA: QuantumDNA;
  securityLevel: SecurityLevel;
  crossRealityFingerprint: string;
  createdAt: Date;
  lastVerified: Date;
  achievements: Achievement[];
}

export interface QuantumDNA {
  signature: string;
  entropy: number;
  quantumState: QuantumState;
  biometricHash: string;
  encryptionLevel: number;
}

export interface QuantumState {
  superposition: number;
  entanglement: number;
  coherence: number;
  measurement: Date;
}

export enum SecurityLevel {
  BASIC = 'BASIC',
  ENHANCED = 'ENHANCED', 
  QUANTUM = 'QUANTUM',
  POST_QUANTUM = 'POST_QUANTUM'
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: Rarity;
  timestamp: Date;
  realityType: RealityType;
  metadata: Record<string, any>;
}

export enum AchievementCategory {
  EXPLORATION = 'EXPLORATION',
  COMBAT = 'COMBAT',
  CRAFTING = 'CRAFTING',
  SOCIAL = 'SOCIAL',
  ENVIRONMENTAL = 'ENVIRONMENTAL',
  QUANTUM = 'QUANTUM'
}

export enum Rarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
  MYTHIC = 'MYTHIC'
}

export enum RealityType {
  VIRTUAL = 'VIRTUAL',
  AUGMENTED = 'AUGMENTED',
  PHYSICAL = 'PHYSICAL',
  MIXED = 'MIXED'
}

export interface QuantumEntanglement {
  id: string;
  pairA: EntangledAsset;
  pairB: EntangledAsset;
  entanglementStrength: number;
  synchronizationStatus: SyncStatus;
  lastSync: Date;
  properties: EntanglementProperty[];
}

export interface EntangledAsset {
  assetId: string;
  assetType: AssetType;
  realityType: RealityType;
  currentState: Record<string, any>;
  ownerId: string;
}

export enum AssetType {
  CHARACTER = 'CHARACTER',
  WEAPON = 'WEAPON',
  ITEM = 'ITEM',
  TERRITORY = 'TERRITORY',
  SKILL = 'SKILL'
}

export enum SyncStatus {
  SYNCHRONIZED = 'SYNCHRONIZED',
  SYNCING = 'SYNCING',
  DESYNCHRONIZED = 'DESYNCHRONIZED',
  ERROR = 'ERROR'
}

export interface EntanglementProperty {
  name: string;
  type: PropertyType;
  bidirectional: boolean;
  syncDelay: number; // milliseconds
}

export enum PropertyType {
  HEALTH = 'HEALTH',
  EXPERIENCE = 'EXPERIENCE',
  LEVEL = 'LEVEL',
  INVENTORY = 'INVENTORY',
  POSITION = 'POSITION',
  EMOTIONS = 'EMOTIONS',
  SKILLS = 'SKILLS'
}