"use client"

import * as React from "react"
import { Search, Wallet as WalletIcon, Eye, CheckCircle2, XCircle } from "lucide-react"
import { SectionHeading, ProvenanceBadge, CopyAddress, StatTile, KindBadge } from "@/components/intel/shared"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input, Select, Label } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import { Spinner, ErrorState, EmptyState } from "@/components/ui/feedback"
import { TransactionsTable } from "@/components/intel/transactions-table"
import { apiPost, useSession } from "@/lib/client/hooks"
import { PERMISSIONS } from "@/lib/auth"
import { CHAIN_LABEL, usd, dateTime } from "@/lib/client/format"
import type { Chain, WalletMetadata, Transaction, AddressValidation, DataProvenance } from "@/lib/types"

interface WalletLookup {
  validation: AddressValidation
  mode: "LIVE" | "DEMO"
  metadata: WalletMetadata
  balance: { balance: number; asset: string; usdBalance: number }
  transactions: Transaction[]
  provenance: DataProvenance
}

export default function WalletInvestigationPage() {
  const { user } = useSession()
  const canWatch = user ? PERMISSIONS.runInvestigation(user.role) : false
  const [address, setAddress] = React.useState("")
  const [chain, setChain] = React.useState<Chain | "">("")
  const [data, setData] = React.useState<WalletLookup | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [watchMsg, setWatchMsg] = React.useState<string | null>(null)

  async function lookup(e: React.FormEvent) {
    e.preventDefault()
    if (!address.trim()) return
    setLoading(true)
    setError(null)
    setData(null)
    setWatchMsg(null)
    try {
      const qs = chain ? `?chain=${chain}` : ""
      const res = await fetch(`/api/wallet/${encodeURIComponent(address.trim())}${qs}`, { credentials: "include" })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Lookup failed.")
      setData(json as WalletLookup)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lookup failed.")
    } finally {
      setLoading(false)
    }
  }

  async function addToWatch() {
    if (!data) return
    setWatchMsg(null)
    try {
      await apiPost("/api/watchlist", {
        address: data.metadata.address,
        chain: data.metadata.chain,
        label: "Watched from wallet investigation",
      })
      setWatchMsg("Added to Watchtower monitoring.")
    } catch (e) {
      setWatchMsg(e instanceof Error ? e.message : "Failed to add to watchlist.")
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <SectionHeading
        title="Wallet Investigation"
        description="Validate any address, identify its network, and pull balance, metadata and transaction history from the active provider."
      />

      <Card>
        <CardContent className="p-4">
          <form onSubmit={lookup} className="flex flex-wrap items-end gap-2">
            <div className="min-w-56 flex-1 space-y-1.5">
              <Label htmlFor="addr">Wallet address</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="addr"
                  className="pl-8 font-mono text-xs"
                  placeholder="bc1q… / 0x… / T…"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
            <div className="w-40 space-y-1.5">
              <Label htmlFor="wchain">Chain</Label>
              <Select id="wchain" value={chain} onChange={(e) => setChain(e.target.value as Chain)}>
                <option value="">Auto-detect</option>
                {(Object.keys(CHAIN_LABEL) as Chain[]).map((c) => (
                  <option key={c} value={c}>
                    {CHAIN_LABEL[c]}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit" disabled={loading || !address.trim()}>
              {loading ? <Spinner className="text-primary-foreground" /> : <Search className="size-4" />} Investigate
            </Button>
          </form>
        </CardContent>
      </Card>

      {error ? <ErrorState message={error} /> : null}

      {!data && !loading && !error ? (
        <EmptyState
          icon={WalletIcon}
          title="Investigate a wallet"
          description="Enter an address to validate its network and retrieve on-chain intelligence."
        />
      ) : null}

      {data ? (
        <div className="space-y-4">
          <Card>
            <CardHeader className="gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2">
                  {data.validation.valid ? (
                    <CheckCircle2 className="size-4 text-risk-low" />
                  ) : (
                    <XCircle className="size-4 text-destructive" />
                  )}
                  <CopyAddress address={data.metadata.address} full />
                </CardTitle>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline">{CHAIN_LABEL[data.metadata.chain]}</Badge>
                  <KindBadge kind={data.metadata.kind} />
                  <ProvenanceBadge provenance={data.provenance} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{data.validation.reason}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatTile label="Balance (USD)" value={usd(data.balance.usdBalance)} />
                <StatTile
                  label={`Balance (${data.balance.asset})`}
                  value={data.balance.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                />
                <StatTile label="Tx count" value={data.metadata.txCount} />
                <StatTile label="Provider mode" value={data.mode} accent={data.mode === "LIVE" ? "var(--risk-low)" : "var(--demo)"} />
              </div>
              <div className="grid gap-3 text-xs sm:grid-cols-2">
                <MetaRow label="First seen" value={dateTime(data.metadata.firstSeen)} />
                <MetaRow label="Last seen" value={dateTime(data.metadata.lastSeen)} />
                {data.metadata.label ? <MetaRow label="Label" value={data.metadata.label} /> : null}
                {data.metadata.attribution?.vasp ? (
                  <MetaRow
                    label="Attribution"
                    value={`${data.metadata.attribution.vasp.name} (${data.metadata.attribution.category})`}
                  />
                ) : null}
              </div>
              {canWatch ? (
                <div className="flex items-center gap-3">
                  <Button size="sm" variant="outline" onClick={addToWatch}>
                    <Eye className="size-3.5" /> Add to Watchtower
                  </Button>
                  {watchMsg ? <span className="text-xs text-muted-foreground">{watchMsg}</span> : null}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transaction history</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionsTable txs={data.transactions} root={data.metadata.address} />
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-background/40 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}
