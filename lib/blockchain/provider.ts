import type { Chain, Transaction, WalletMetadata, AddressValidation } from "@/lib/types"
import { validateAddress } from "./address-utils"

// Provider abstraction. Every concrete provider (demo, live REST, future
// indexer) implements this interface so engines never care about the source.
export interface BlockchainProvider {
  readonly chain: Chain
  readonly mode: "LIVE" | "DEMO"
  validateAddress(address: string): AddressValidation
  getWalletTransactions(address: string): Promise<Transaction[]>
  getTransaction(hash: string): Promise<Transaction | null>
  getWalletBalance(address: string): Promise<{ balance: number; asset: string; usdBalance: number }>
  getAddressMetadata(address: string): Promise<WalletMetadata | null>
}

// Base with shared validation logic.
export abstract class BaseProvider implements BlockchainProvider {
  abstract readonly chain: Chain
  abstract readonly mode: "LIVE" | "DEMO"
  validateAddress(address: string): AddressValidation {
    return validateAddress(address, this.chain)
  }
  abstract getWalletTransactions(address: string): Promise<Transaction[]>
  abstract getTransaction(hash: string): Promise<Transaction | null>
  abstract getWalletBalance(
    address: string,
  ): Promise<{ balance: number; asset: string; usdBalance: number }>
  abstract getAddressMetadata(address: string): Promise<WalletMetadata | null>
}

export const CHAIN_ASSET: Record<Chain, string> = {
  bitcoin: "BTC",
  ethereum: "ETH",
  polygon: "MATIC",
  bsc: "BNB",
  tron: "TRX",
}
