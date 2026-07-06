export type GaokaoCategory = 'physical' | 'historical';

export interface ScoreDistribution {
  score: number;
  count: number;       // Number of students at this exact score
  cumulative: number;  // Number of students at or above this score
}

export interface ControlLineTrend {
  year: number;
  specialLine: number;
  undergradLine: number;
}

export interface University {
  id: string;
  name: string;
  code: string;
  tags: string[]; // e.g. ["985", "211", "双一流", "公办"]
  location: string;
  physicalMinRank2025: number;
  physicalMinScore2025: number;
  historicalMinRank2025: number;
  historicalMinScore2025: number;
  recommendedMajors: string[];
  description: string;
}

export interface QueryResult {
  score: number;
  rank: number;
  category: GaokaoCategory;
  percentile: number;
  exactCount: number;
  exceededSpecial: boolean;
  exceededUndergrad: boolean;
  specialDiff: number;
  undergradDiff: number;
}
