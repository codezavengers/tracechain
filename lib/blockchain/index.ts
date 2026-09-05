import type { Chain } from "@/lib/types"
import type { BlockchainProvider } from "./provider"
import { DemoProvider } from "./demo-provider"
import { LiveProvider, isLiveConfigured } from "./live-provider"

export type ProviderMode = "AUTO" | "LIVE" | "DEMO"

// Factory that returns the right provider for a chain based on the requested
// mode and what is actually configured in the environment.
export function getProvider(chain: Chain, mode: ProviderMode = "AUTO"): BlockchainProvider {
  if (mode === "DEMO") return new DemoProvider(chain)
  if (mode === "LIVE") return new LiveProvider(chain)
  // AUTO: use live only if configured, else demo.
  return isLiveConfigured(chain) ? new LiveProvider(chain) : new DemoProvider(chain)
}

export function activeMode(chain: Chain, requested: ProviderMode = "AUTO"): "LIVE" | "DEMO" {
  if (requested === "DEMO") return "DEMO"
  if (requested === "LIVE") return "LIVE"
  return isLiveConfigured(chain) ? "LIVE" : "DEMO"
}

export * from "./provider"
export * from "./address-utils"
