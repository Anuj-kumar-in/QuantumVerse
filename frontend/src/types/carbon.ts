export interface CarbonMetrics {
  totalOffset: number; // tons CO2
  monthlyReduction: number;
  treesPlanted: number;
  renewableHours: number;
  totalRewards: number; // total CARBON tokens earned
  ecoAchievements: EcoAchievement[];
  carbonRank: CarbonRank;
  impactScore: number;
}

export interface EcoAchievement {
  id: string;
  name: string;
  description: string;
  category: EcoCategory;
  points: number;
  unlockedAt: Date;
  icon: string;
}

export type EcoCategory = 'ENERGY' | 'TRANSPORTATION' | 'CONSUMPTION' | 'REFORESTATION' | 'EDUCATION' | 'COMMUNITY';

export type CarbonRank = 'CARBON_ROOKIE' | 'ECO_WARRIOR' | 'GREEN_GUARDIAN' | 'CLIMATE_CHAMPION' | 'QUANTUM_GUARDIAN';

export interface CarbonReward {
  id: string;
  type: CarbonRewardType;
  amount: string;
  reason: string;
  timestamp: Date;
  verified: boolean;
}

export type CarbonRewardType = 'OFFSET_REWARD' | 'RENEWABLE_BONUS' | 'TREE_PLANTING' | 'EDUCATION_BONUS' | 'COMMUNITY_IMPACT';

export interface SustainabilityAction {
  id: string;
  name: string;
  description: string;
  category: EcoCategory;
  carbonSaved: number; // kg CO2
  difficulty: ActionDifficulty;
  rewards: CarbonReward[];
  requirements: ActionRequirement[];
}

export type ActionDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';

export type RequirementType = 'DOCUMENTATION' | 'PHOTO' | 'VERIFICATION' | 'MEASUREMENT';

export interface ActionRequirement {
  type: RequirementType;
  value: number;
  description: string;
}

export interface CarbonProject {
  id: string;
  name: string;
  description: string;
  location: ProjectLocation;
  type: ProjectType;
  totalFunding: string;
  currentFunding: string;
  carbonGoal: number; // tons CO2
  carbonAchieved: number;
  timeline: ProjectTimeline;
  participants: number;
  updates: ProjectUpdate[];
}

export interface ProjectLocation {
  country: string;
  region: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export type ProjectType = 'REFORESTATION' | 'RENEWABLE_ENERGY' | 'CARBON_CAPTURE' | 'OCEAN_CLEANUP' | 'SUSTAINABLE_AGRICULTURE';

export interface ProjectTimeline {
  startDate: Date;
  endDate: Date;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  targetDate: Date;
  completed: boolean;
  completedDate?: Date;
}

export interface ProjectUpdate {
  id: string;
  title: string;
  content: string;
  images: string[];
  timestamp: Date;
  author: string;
  metrics: UpdateMetrics;
}

export interface UpdateMetrics {
  carbonSaved: number;
  treesPlanted?: number;
  energyGenerated?: number;
  wasteReduced?: number;
  biodiversityImproved?: number;
}

export interface CarbonMarket {
  carbonPrice: number; // USD per ton
  totalVolume: number;
  activeProjects: number;
  availableCredits: number;
  topProjects: CarbonProject[];
  priceHistory: PricePoint[];
}

export interface PricePoint {
  timestamp: Date;
  price: number;
  volume: number;
}