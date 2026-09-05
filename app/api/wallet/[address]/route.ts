import { NextResponse } from "next/server"
import { ensureSeeded } from "@/lib/store"
import { requireUser } from "@/lib/api/session"
import { getProvider, activeMode } from "@/lib/blockchain"
import { validateAddress } from "@/lib/blockchain/address-utils"
import type { Chain } from "@/lib/types"

export async function GET(req: Request, { params }: { params: Promise<{ address: string }> }) {
  await ensureSeeded()
  const auth = await requireUser()
  if ("response" in auth) return auth.response
  const { address } = await params
  const url = new URL(req.url)
  const chainParam = url.searchParams.get("chain") as Chain | null

  const validation = validateAddress(address, chainParam ?? undefined)
  if (!validation.valid || !validation.chain) {
    return NextResponse.json({ error: validation.reason, validation }, { status: 400 })
  }
  const chain = (chainParam && validation.candidateChains.includes(chainParam) ? chainParam : validation.chain) as Chain
  const provider = getProvider(chain, "AUTO")
  const [metadata, transactions, balance] = await Promise.all([
    provider.getAddressMetadata(address),
    provider.getWalletTransactions(address),
    provider.getWalletBalance(address),
  ])

  return NextResponse.json({
    validation,
    mode: activeMode(chain),
    metadata,
    balance,
    transactions,
    provenance: activeMode(chain) === "LIVE" ? "LIVE_BLOCKCHAIN_DATA" : "DEMO_DATA",
  })
}
