// ================================================================
// Core Data Types
// ================================================================

export type AnalyzeMode = 'free-basic' | 'full-pro';
export type LoadingContext = 'analysis' | 'sample' | 'care-guide' | null;

export type RiskLevel = 'Healthy' | 'Moderate' | 'High' | 'Critical' | 'Dead' | 'N/A';

// ================================================================
// Scan / Analysis Types
// ================================================================

export interface ScanBilling {
  channel?: 'free-basic' | 'scan-point';
  usedFreeScan?: boolean;
  usedScanPoint?: boolean;
  actor?: 'guest' | 'user';
  dailyLimit?: number;
  dailyScansUsed?: number;
  remainingFreeScans?: number;
  lastScanDate?: string;
  scanPointsRemaining?: number;
  recordedScan?: boolean;
  plantsScanned?: number;
  alreadyUnlocked?: boolean;
  proUnlocked?: boolean;
  fullProDiagnosis?: boolean;
  resultId?: string | null;
}

export interface BasicDiagnosis {
  species: string;
  coreName: string | null;
  risk: RiskLevel;
  isPlantOrAnimal: boolean;
  killerTitle: string;
  summary: string;
  mainIssue: string;
  warning: string;
  basicCareRule: string;
  actionPlan?: string[];
  recommendedProducts?: RecommendedProduct[];
}

export interface ProDiagnosis {
  deepDive: string;
  stepByStepPlan: string[];
  recoverySchedule: RecoveryDay[];
  environmentalAdjustments: EnvironmentalAdjustments;
  mistakesToAvoid: string[];
  recommendedProducts?: RecommendedProduct[];
}

export interface ProPreview {
  teaserSummary: string;
  lockedSections: string[];
  killerTitle?: string;
}

export interface RecoveryDay {
  day: string;
  action: string;
  whatToWatch: string;
}

export interface EnvironmentalAdjustments {
  light: string;
  water: string;
  soil: string;
  humidity: string;
}

export interface RecommendedProduct {
  name: string;
  reason: string;
  searchKeyword: string;
}

export interface ScanResult {
  basic?: BasicDiagnosis;
  pro?: ProDiagnosis;
  proPreview?: ProPreview;
  billing?: ScanBilling;
  actionPlan?: string[];
  recommendedProducts?: RecommendedProduct[];
  species?: string;
  coreName?: string;
  risk?: string;
  summary?: string;
  killerTitle?: string;
}

export interface SavedScan {
  id: string;
  userId: string;
  species: string;
  coreName: string | null;
  risk: string;
  summary: string;
  killerTitle: string | null;
  basic: BasicDiagnosis | null;
  proPreview: ProPreview | null;
  pro: ProDiagnosis | null;
  billing: ScanBilling | null;
  scanBillingChannel: string | null;
  usedFreeScan: boolean;
  usedScanPoint: boolean;
  scanPointCost: number;
  fullProDiagnosis: boolean;
  imageData: string | null;
  imageType: string | null;
  originalImageData: string | null;
  originalImageType: string | null;
  createdAt: { seconds: number; nanoseconds: number } | string;
}

// ================================================================
// User Types
// ================================================================

export interface UserProfile {
  email: string;
  role: 'user' | 'admin' | 'premium';
  plantsScanned: number;
  plantsSaved: number;
  dailyScans: number;
  lastScanDate: string;
  scanPoints: number;
  createdAt?: any;
  name?: string;
  photoUrl?: string;
}

// ================================================================
// Error Types
// ================================================================

export interface AnalysisErrorCopy {
  title: string;
  message: string;
  help?: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

// ================================================================
// UI / Component Types
// ================================================================

export interface ScanAccessInfo {
  label: string;
  detail: string;
  tone: 'ready' | 'muted' | 'paid' | 'loading';
}

export interface PhotoStatusInfo {
  label: string;
  detail: string;
  tone: 'ready' | 'loading';
}
