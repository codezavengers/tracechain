// TRACECHAIN AI - Core domain types
// Shared across backend engines, API routes, and frontend.

export type Chain = "bitcoin" | "ethereum" | "polygon" | "bsc" | "tron"

export type DataProvenance =
  | "LIVE_BLOCKCHAIN_DATA"
  | "DEMO_DATA"
  | "KNOWN_ATTRIBUTION"
  | "PROBABLE_ATTRIBUTION"
  | "HEURISTIC_ANALYSIS"
  | "ML_PREDICTION"
  | "UNKNOWN"

export type AnalysisType =
  | "rule"
  | "graph"
  | "statistical"
  | "ml"
  | "heuristic"
  | "attribution"
  | "demo"

export type Role = "ADMIN" | "INVESTIGATOR" | "ANALYST" | "VIEWER"

export type RiskBand = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"

export type CaseStatus =
  | "NEW"
  | "ANALYZING"
  | "TRACING"
  | "VASP_IDENTIFIED"
  | "ACTION_REQUIRED"
  | "FREEZE_REVIEW"
  | "MONITORING"
  | "CLOSED"

export type FraudTypology =
  | "INVESTMENT_FRAUD"
  | "TASK_SCAM"
  | "RANSOMWARE"
  | "CROSS_CHAIN_LAUNDERING"
  | "ORGANIZED_FRAUD"
  | "RAPID_CASHOUT"
  | "PIG_BUTCHERING"
  | "UNKNOWN"

export type AttributionCategory = "KNOWN" | "PROBABLE" | "UNKNOWN"

export type WalletKind =
  | "VICTIM"
  | "SUSPICIOUS"
  | "BURNER"
  | "VASP"
  | "EXCHANGE"
  | "BRIDGE"
  | "MIXER"
  | "DEFI"
  | "FRAUD_CLUSTER"
  | "UNKNOWN"

export type EdgeKind =
  | "SENT_FUNDS"
  | "RECEIVED_FUNDS"
  | "BRIDGED"
  | "DEPOSITED"
  | "INTERACTED"
  | "CONNECTED_TO"

// A single AI/intelligence result envelope. Every engine returns this shape.
export interface IntelResult<T = unknown> {
  result: T
  confidence: number // 0..1
  explanation: string
  evidence: string[]
  recommendation: string
  analysisType: AnalysisType
  provenance: DataProvenance
  generatedAt: string
}

export interface AddressValidation {
  address: string
  valid: boolean
  chain: Chain | null
  candidateChains: Chain[]
  reason: string
}

export interface Transaction {
  hash: string
  chain: Chain
  from: string
  to: string
  amount: number // native units for BTC/ETH etc, or token units
  asset: string
  usdValue: number
  timestamp: string
  blockHeight: number
  direction?: "in" | "out"
  provenance: DataProvenance
}

export interface WalletMetadata {
  address: string
  chain: Chain
  kind: WalletKind
  label?: string
  balance: number
  asset: string
  usdBalance: number
  firstSeen: string
  lastSeen: string
  txCount: number
  provenance: DataProvenance
  attribution?: VaspAttribution | null
}

export interface VaspRecord {
  id: string
  name: string
  type: "EXCHANGE" | "BRIDGE" | "MIXER" | "DEFI" | "OTC"
  jurisdiction: string
  kycLevel: "HIGH" | "MEDIUM" | "LOW" | "NONE"
  cooperationLevel: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN"
  note: string
}

export interface VaspAttribution {
  category: AttributionCategory
  vasp?: VaspRecord
  confidence: number
  reason: string
  provenance: DataProvenance
}

export interface GraphNode {
  id: string // wallet address or synthetic id
  kind: WalletKind
  chain: Chain
  label?: string
  riskScore?: number
  usdValue?: number
  depth?: number
  attribution?: AttributionCategory
  provenance: DataProvenance
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  kind: EdgeKind
  amount: number
  asset: string
  usdValue: number
  timestamp: string
  txHash: string
}

export interface TransactionGraph {
  rootAddress: string
  chain: Chain
  depth: number
  nodes: GraphNode[]
  edges: GraphEdge[]
  provenance: DataProvenance
}

export interface JourneyStep {
  step: number
  title: string
  address: string
  kind: WalletKind
  usdValue: number
  timestamp: string
  description: string
  attribution?: AttributionCategory
}

export interface Alert {
  id: string
  caseId?: string
  walletAddress: string
  chain: Chain
  severity: RiskBand
  type: string
  message: string
  createdAt: string
  acknowledged: boolean
}

export interface WatchedWallet {
  id: string
  address: string
  chain: Chain
  label: string
  caseId?: string
  addedAt: string
  lastActivity: string
  status: "ACTIVE" | "DORMANT" | "TRIGGERED"
  balance: number
  usdBalance: number
}

export interface EvidenceRecord {
  id: string
  caseId: string
  type: string
  title: string
  contentHash: string // sha-256
  prevHash: string // chain link
  createdAt: string
  createdBy: string
  provenance: DataProvenance
  summary: string
}

export interface CaseNote {
  id: string
  author: string
  createdAt: string
  body: string
}

export interface CaseActivity {
  id: string
  actor: string
  action: string
  detail: string
  createdAt: string
}

export interface InvestigationCase {
  id: string
  complaintRef: string
  title: string
  reportedWallet: string
  chain: Chain
  complaintText: string
  extractedWallets: string[]
  typology: FraudTypology
  riskScore: number
  riskBand: RiskBand
  priorityScore: number
  status: CaseStatus
  investigator: string
  reportedLossUsd: number
  traceableUsd: number
  recoveryProbability: number
  connectedVictims: number
  createdAt: string
  updatedAt: string
  notes: CaseNote[]
  activity: CaseActivity[]
  provenance: DataProvenance
  demoScenario?: FraudTypology
}

export interface User {
  id: string
  email: string
  name: string
  role: Role
  passwordHash: string
}

export interface SessionUser {
  id: string
  email: string
  name: string
  role: Role
}
