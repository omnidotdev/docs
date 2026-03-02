# AI Integration Plan: CLI, Beacon, Synapse & Agent Core

> Internal planning document for how CLI-stack, Beacon-stack, Synapse-stack, and agent-core integrate to deliver a unified AI experience
>
> Last updated: 2026-03-02

---

## Goals

1. **OpenClaw parity** for CLI and Beacon (node registry, browser automation, memory, daemon lifecycle, plugin system)
2. **Zero-friction onboarding** for normie users on Beacon (no API key setup, free credits or paid Synapse subscription)
3. **Synapse as the billing-integrated AI gateway** tied to Omni accounts (Gatekeeper + Aether)
4. **Skills/plugins marketplace** for extensible capabilities (browser automation, crypto wallets, prediction markets, etc.)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACES                                  │
│                                                                          │
│  ┌──────────────┐  ┌──────────────────┐  ┌────────────────────┐         │
│  │  Omni CLI    │  │  Beacon App      │  │  Third-party Apps  │         │
│  │  (dev power  │  │  (normie-first   │  │  (API consumers)   │         │
│  │   users)     │  │   web/desktop/   │  │                    │         │
│  │  Rust TUI    │  │   mobile)        │  │                    │         │
│  └──────┬───────┘  └──────┬───────────┘  └──────┬─────────────┘         │
│         │                 │                      │                       │
│         │ agent-core      │ agent-core           │ HTTP API              │
│         │ (Rust lib)      │ (Rust lib)           │                       │
│         └────────┬────────┴──────────────────────┘                       │
│                  │                                                       │
│  ┌───────────────▼───────────────────────────────────────────────┐       │
│  │                     SYNAPSE GATEWAY                            │       │
│  │                                                                │       │
│  │  ┌─────────────┐ ┌──────────────┐ ┌────────────────────┐     │       │
│  │  │ synapse-auth │ │synapse-billing│ │ synapse-routing    │     │       │
│  │  │             │ │              │ │                    │     │       │
│  │  │ JWT + API   │ │ Usage meter  │ │ Threshold/Cost/   │     │       │
│  │  │ key valid.  │ │ Credit check │ │ Cascade/Score     │     │       │
│  │  └──────┬──────┘ └──────┬───────┘ └────────┬───────────┘     │       │
│  │         │               │                   │                 │       │
│  │  ┌──────▼───────────────▼───────────────────▼───────────┐     │       │
│  │  │              LLM / STT / TTS / Embeddings            │     │       │
│  │  │  Anthropic · OpenAI · Google · Groq · Mistral ·      │     │       │
│  │  │  AWS Bedrock · ElevenLabs · Deepgram                 │     │       │
│  │  └──────────────────────────────────────────────────────┘     │       │
│  └───────────────────────────────────────────────────────────────┘       │
│                  │                         │                              │
│  ┌───────────────▼──────────┐  ┌───────────▼──────────────────┐         │
│  │  HIDRA (Identity)        │  │  AETHER (Billing)            │         │
│  │  Gatekeeper (AuthN)      │  │  Subscriptions               │         │
│  │  Warden (AuthZ)          │  │  Entitlements                │         │
│  │                          │  │  Usage meters                │         │
│  │  JWT with org claims     │  │  Stripe integration          │         │
│  └──────────────────────────┘  └──────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Synapse Billing Integration (Zero-Friction Onboarding)

### The Problem

Currently, CLI and Beacon require users to bring their own API keys for LLM providers. This is a barrier for normie users on Beacon.

### The Solution: Synapse as Managed AI Gateway

Synapse sits between user interfaces and LLM providers. Users authenticate via their Omni account (Gatekeeper JWT), and Synapse handles provider key management, routing, and billing.

### Access Tiers

| Tier | Access | Billing | Target |
|------|--------|---------|--------|
| **Free** | Limited credits on signup (e.g. 100 messages) | No payment required | Try-before-you-buy normies |
| **BYOK** | Unlimited, user's own provider keys | No Synapse charge | Power users, developers |
| **Synapse Pro** | Managed keys, smart routing, all providers | Subscription via Aether | Normie users who want "just works" |
| **Synapse Team** | Shared org billing, usage visibility | Org subscription via Aether | Teams/companies |

### How It Works

```
User signs up (Gatekeeper)
  │
  ├─► Personal org created automatically
  │
  ├─► Aether creates billing account (entity_type: "user")
  │
  ├─► Free tier entitlements provisioned:
  │     feature_key: "synapse.free_credits"
  │     value: "100"
  │     source: "default"
  │
  └─► User opens Beacon → authenticated via JWT → Synapse routes
      requests through free credits → no API key needed
```

### Synapse Auth Flow

```
┌──────────┐     ┌────────────┐     ┌───────────────┐     ┌──────────┐
│  Client   │────►│  Synapse   │────►│  Gatekeeper   │────►│  Aether  │
│ (CLI/     │     │  Gateway   │     │  (JWT verify) │     │ (check   │
│  Beacon)  │     │            │     │               │     │  credits/ │
│           │◄────│            │◄────│  user claims  │     │  entitle.)│
└──────────┘     └────────────┘     └───────────────┘     └──────────┘
```

1. Client sends request with Gatekeeper JWT (or Synapse API key)
2. `synapse-auth` validates JWT via JWKS (existing Aether pattern)
3. `synapse-billing` checks entitlements:
   - Has active subscription? → route request
   - Has remaining free credits? → route + decrement usage meter
   - Has BYOK keys configured? → use user's keys (no billing)
   - None? → return 402 with upgrade prompt
4. `synapse-routing` selects provider/model based on strategy
5. Response streamed back, usage metered to Aether

### Aether Entitlements for Synapse

```typescript
// Feature keys for Synapse product
"synapse.access"           // "free" | "pro" | "team" | "enterprise"
"synapse.free_credits"     // Number of free messages remaining
"synapse.models"           // Allowed models (e.g. "claude-*,gpt-4o")
"synapse.max_tokens"       // Max tokens per request
"synapse.rate_limit"       // Requests per minute
"synapse.stt"              // Speech-to-text access
"synapse.tts"              // Text-to-speech access
"synapse.image_gen"        // Image generation access
"synapse.embeddings"       // Embedding model access
```

### BYOK Flow

Users who prefer their own keys can configure them per-provider:

```
CLI:    ~/.config/omni/cli/config.toml → [providers.anthropic] api_key = "sk-..."
Beacon: Settings → Providers → Add API Key
```

When BYOK keys are present, requests bypass Synapse billing entirely. Synapse still provides routing and observability but doesn't charge.

### Subscription Page (Beacon)

Beacon should have a `/settings/subscription` page that:

1. Shows current tier and usage
2. Links to Aether checkout for upgrades (`createCheckoutWithWorkspace()`)
3. Displays BYOK key configuration
4. Shows usage history per provider/model

---

## 3. OpenClaw Parity: What to Port

### 3.1 Node Registry & Capability Dispatch

**What OpenClaw has**: Gateway tracks connected devices (phone, laptop, desktop) as "nodes." Each node declares capabilities (camera, location, screen record, system.run). The gateway dispatches tasks to the appropriate node.

**What Beacon needs**:

```
┌──────────────┐  WebSocket  ┌──────────────────┐  dispatch  ┌──────────┐
│ Beacon App   │◄───────────►│ beacon-gateway    │───────────►│ Phone    │
│ (desktop)    │             │                    │            │ (node)   │
│              │             │ ┌────────────────┐ │            │          │
│              │             │ │ Node Registry  │ │            │ caps:    │
│              │             │ │                │ │            │ camera   │
│              │             │ │ node_id → caps │ │            │ location │
│              │             │ │ node_id → cmds │ │            │ contacts │
│              │             │ └────────────────┘ │            └──────────┘
└──────────────┘             └──────────────────┘
```

**Implementation approach**:
- Add `NodeRegistry` to beacon-gateway (Rust, similar to existing channel/device management)
- Beacon-app mobile (Tauri) registers as a node with device capabilities
- Gateway tools (`browser`, `web_search`, etc.) already exist; add `node.invoke` tool for dispatching to remote nodes
- Command allowlisting per platform (reuse OpenClaw's safety model)

**Priority**: P1 (enables mobile camera/location/contacts use cases)

### 3.2 Voice → Tool Pipeline

**Current gap**: Voice path and channel handlers send `tools: None` to LLM.

**Fix**: Wire tool definitions and tool execution loop into `daemon.rs` voice handler and all channel handlers, using the WebSocket handler (`api/websocket.rs`) as reference.

**Priority**: P0 (blocking for "hey Orin, pull up CoinGecko" use case)

### 3.3 Browser Automation in CLI

**What Beacon has**: `chromiumoxide` CDP-based browser automation (navigate, screenshot, JS execution, DOM interaction, video recording).

**What CLI needs**: Same capability via agent-core. Two approaches:
1. **Share chromiumoxide code** from beacon-gateway into agent-core as a feature-gated module
2. **CLI calls Beacon's browser tool** via HTTP API when a gateway is available (lighter, avoids headless browser in terminal context)

**Recommendation**: Option 2 for CLI (delegate to Beacon gateway), option 1 already works for Beacon.

**Priority**: P1

### 3.4 Memory System Upgrade

**Current state** (CLI): JSON files, keyword search, no embeddings, no session indexing.

**Target state** (matching OpenClaw):

| Feature | Implementation |
|---------|---------------|
| Storage backend | SQLite + sqlite-vec (Beacon already has this) |
| Vector search | Hybrid: 70% vector + 30% FTS |
| Embeddings | Via Synapse embeddings endpoint |
| Session indexing | JSONL transcript → indexed on `/new` |
| Auto-flush | Compress context near limit |
| Cross-device sync | Via Gatekeeper life.json assistants slice |

**Priority**: P2 (functional without, but competitive gap)

### 3.7 Knowledge Retrieval Pipeline (agent-core)

**Shipped 2026-03-02**. Production-grade RAG pipeline in `agent-core/src/knowledge/` consumed by both CLI and Beacon.

| Component | File | Description |
|-----------|------|-------------|
| Embedding cache | `embedder.rs` | mini-moka in-process cache (256 entries, 1hr TTL) for OpenAI embeddings |
| Query condensing | `condenser.rs` | LLM rewrites multi-turn conversation into standalone retrieval query |
| Contextual embeddings | `embedder.rs` | Prepends pack/topic context to chunks before embedding (Anthropic's pattern) |
| BM25 scorer | `bm25.rs` | Okapi BM25 (k1=1.2, b=0.75) term-frequency scoring |
| Hybrid search | `selection.rs` | BM25 + cosine similarity fused via Reciprocal Rank Fusion (k=60) |
| Cross-encoder reranking | `reranker.rs` | Over-fetches 3x, reranks with Cohere rerank-v3.5, trims to budget |

All components are optional with graceful fallbacks — BM25 alone works with no API keys. See `/docs/content/knowledge-pipeline.mdx` for full architecture.

**Next steps**: Intelligent chunking, query routing, eval/feedback, metadata filtering, lazy indexing. See `/plans/2026-03-02-rag-pipeline-next-steps.md`.

**Priority**: P1 (shipped)

### 3.5 Daemon Lifecycle Management

**What OpenClaw has**: `openclaw onboard --install-daemon` generates launchd plist (macOS), systemd unit (Linux), or Task Scheduler entry (Windows).

**What Beacon needs**: `beacon install` command that:
1. Detects platform (launchd/systemd/schtasks)
2. Generates service config with correct paths and env vars
3. Enables auto-start on login
4. Provides `beacon status`, `beacon restart`, `beacon logs`

**Priority**: P2 (manual start works, but polish for normie users)

### 3.6 Remote Access

**What OpenClaw has**: Tailscale Serve/Funnel, SSH tunnels, Fly.io deployment.

**What Beacon needs**:
- Tailscale auto-detection (binary discovery, tailnet DNS resolution)
- SSH tunnel helper for accessing home gateway from outside
- Cloud-hosted gateway option at `beacon.omni.dev` (for users without a home server)

**Priority**: P3 (mDNS covers local, cloud gateway is the bigger solve)

---

## 4. Skills & Plugins Marketplace

### Why a Marketplace

The example use cases (CoinGecko lookup, Polymarket gambling, agent wallets) are domain-specific capabilities that don't belong in the core. A plugin/skills marketplace lets the community build and share these.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     SKILLS / PLUGINS ECOSYSTEM                    │
│                                                                   │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐ │
│  │ Built-in Tools │  │ Skills (MD)    │  │ Plugins (code)     │ │
│  │                │  │                │  │                    │ │
│  │ • bash         │  │ • Project-local│  │ • NPM/Cargo pkgs  │ │
│  │ • edit/write   │  │   .omni/skill/ │  │ • MCP servers      │ │
│  │ • web_search   │  │ • Global       │  │ • WASM (Extism)    │ │
│  │ • browser      │  │   ~/.config/   │  │                    │ │
│  │ • memory       │  │   omni/skill/  │  │ Registry:          │ │
│  │                │  │                │  │ marketplace.omni.  │ │
│  │                │  │ • Marketplace  │  │ dev                │ │
│  │                │  │   (downloaded) │  │                    │ │
│  └────────────────┘  └────────────────┘  └────────────────────┘ │
│                                                                   │
│  Plugin Manifest: omni.plugin.json                               │
│  ─────────────────────────────────                               │
│  {                                                                │
│    "id": "omni-plugin-coingecko",                                │
│    "version": "1.0.0",                                           │
│    "kind": "tool",                                               │
│    "tools": [{ "name": "crypto_price", ... }],                   │
│    "permissions": ["web_fetch"],                                 │
│    "config_schema": { "api_key": { "type": "string" } }         │
│  }                                                                │
│                                                                   │
│  Plugin Types:                                                    │
│  ─────────────                                                    │
│  • tool      → Adds agent tools (crypto_price, place_bet, etc.) │
│  • channel   → Adds messaging channels (new chat platforms)      │
│  • provider  → Adds LLM/TTS/STT providers                       │
│  • skill     → Adds markdown instruction sets                    │
│  • hook      → Adds lifecycle hooks (session save, etc.)         │
│  • service   → Adds long-lived background services               │
└─────────────────────────────────────────────────────────────────┘
```

### Example Plugins for Target Use Cases

| Use Case | Plugin | Tools Provided |
|----------|--------|----------------|
| CoinGecko crypto lookup | `omni-plugin-coingecko` | `crypto_price`, `crypto_chart`, `crypto_trending` |
| Polymarket betting | `omni-plugin-polymarket` | `market_search`, `market_place_bet`, `market_positions` |
| Agent wallets | `omni-plugin-wallet` | `wallet_balance`, `wallet_send`, `wallet_sign` |
| Browser automation | Built-in (beacon-gateway) | `browser_navigate`, `browser_screenshot`, `browser_click` |
| DeFi operations | `omni-plugin-defi` | `swap_tokens`, `check_pool`, `bridge_tokens` |
| Social trading | `omni-plugin-social-trade` | `copy_trade`, `portfolio_track` |

### MCP Integration

MCP (Model Context Protocol) servers are already supported in CLI. The marketplace should:
1. List MCP servers as a plugin type
2. Provide one-click install that configures the MCP server in CLI/Beacon config
3. Handle auth (API keys stored in Horcrux or user config)

### Plugin Discovery & Install

```
# CLI
omni plugin search coingecko
omni plugin install omni-plugin-coingecko
omni plugin list

# Beacon App
Settings → Plugins → Browse Marketplace → Install
```

### Plugin Security Model

- Plugins declare required permissions in manifest (`web_fetch`, `bash`, `file_write`, etc.)
- User approves permissions on install
- Sandboxed execution (WASM via Extism for untrusted plugins)
- Code-signed plugins from verified publishers skip sandbox
- Tool policy engine (already in Beacon) enforces per-profile access control

### Marketplace Service

Part of Launchpad stack. Features:
- Plugin registry with versioning
- Publisher accounts (tied to Omni org)
- Reviews/ratings
- Download counts
- Automated security scanning
- Revenue sharing for paid plugins (via Crystal)

---

## 5. Agent Wallets & Crypto Integration

### Architecture

Agent wallets should be a plugin, not core infrastructure. This keeps the core clean and avoids regulatory complexity.

```
┌────────────────────────────────────────────────┐
│          omni-plugin-wallet                     │
│                                                 │
│  ┌──────────────┐  ┌────────────────────────┐  │
│  │ Key Storage  │  │ Chain Adapters          │  │
│  │              │  │                         │  │
│  │ • Horcrux    │  │ • EVM (ethers.js)       │  │
│  │   (sharded)  │  │ • Solana (web3.js)      │  │
│  │ • Local      │  │ • Bitcoin (bitcoinjs)   │  │
│  │   keystore   │  │                         │  │
│  │ • Hardware   │  │ Transaction builder     │  │
│  │   wallet     │  │ + signature flow        │  │
│  └──────────────┘  └────────────────────────┘  │
│                                                 │
│  Tools:                                         │
│  • wallet_create    → Generate new wallet       │
│  • wallet_balance   → Check balances            │
│  • wallet_send      → Send transaction          │
│  • wallet_sign      → Sign message/tx           │
│  • wallet_history   → Transaction history       │
│  • wallet_connect   → Connect external wallet   │
│                                                 │
│  Safety:                                        │
│  • Confirmation required for all sends          │
│  • Spending limits configurable                 │
│  • Allowlisted addresses                        │
│  • Audit log of all operations                  │
└────────────────────────────────────────────────┘
```

### Permission Model

Wallet operations are high-risk. The permission system should:
- Default to `Ask` for all wallet operations
- Require explicit user confirmation for sends (amount, recipient, chain)
- Support spending limits (per-transaction and daily)
- Allow address allowlisting (only send to known addresses)
- Keep full audit log

---

## 6. Normie User Journey (Beacon)

```
1. User visits beacon.omni.dev or downloads Beacon app
   │
2. "Sign up with Google/GitHub/Email" → Gatekeeper OIDC
   │
3. Personal org + billing account auto-created
   │  Free tier entitlements provisioned
   │
4. Chat interface loads immediately
   │  No API key prompts, no configuration
   │  Synapse routes through free credits
   │
5. After ~100 messages: "You've used your free credits"
   │
   ├─► "Upgrade to Synapse Pro" → Aether checkout → Stripe
   │   $X/month for managed AI with smart routing
   │
   ├─► "Bring Your Own Key" → Settings → paste API key
   │   Free, unlimited, user manages their own keys
   │
   └─► "Try Synapse" → natural upsell since it's already
       the integrated option and "just works"
```

### Why This Drives Synapse Adoption

1. **Path of least resistance**: Synapse is already working when they sign up (free credits). Upgrading is one click.
2. **BYOK is escape hatch, not default**: Users CAN bring keys, but Synapse is easier.
3. **Dogfooding**: Every Beacon user is a Synapse user by default.
4. **Smart routing value-add**: Synapse routes to the best model for the query (cheap for simple, powerful for complex). Users get better results for less money than raw API access.

---

## 7. Implementation Priority

### Phase 1: Foundation (Enable the core flow)

| Task | Stack | Priority | Status |
|------|-------|----------|--------|
| Wire tools into voice/channel handlers | beacon-stack | P0 | **Done** (multi-turn tool loop in daemon.rs) |
| Synapse JWT auth via Gatekeeper JWKS | synapse-stack | P0 | **Already implemented** (synapse-server/src/auth.rs, billing_identity.rs) |
| Synapse usage metering to Aether | synapse-stack | P0 | **Already implemented** (synapse-billing/src/recorder.rs, client.rs) |
| Synapse entitlement gate | synapse-stack | P0 | **Already implemented** (synapse-server/src/entitlement.rs) |
| Free credits entitlement on signup | aether-stack | P0 | **Done** (seedApps.ts + seedTierLimits.ts with synapse tiers) |
| synapse-client integration in agent-core | agent-core | P0 | **Already implemented** (synapse-client agent_provider.rs with LlmProvider trait) |
| Beacon subscription/settings page | beacon-stack | P1 | **Done** (SubscriptionSettings component, useBilling hooks, AetherBillingProvider integration) |

### Phase 2: Parity (Match OpenClaw capabilities)

| Task | Stack | Priority | Status |
|------|-------|----------|--------|
| Synapse as first-class provider in agent-core | agent-core | P0 | **Done** |
| Node registry in beacon-gateway | beacon-stack | P1 | **Done** (types, policy, registry, WS + REST API) |
| Tauri mobile node registration | beacon-stack | P1 | **Done** (Tauri plugins, NodeRegistrationService, command handlers, gateway client wiring) |
| Browser automation HTTP API in Beacon | beacon-stack | P1 | **Done** |
| Browser automation in CLI (via gateway) | cli-stack | P1 | **Done** |
| Plugin manifest + loader | beacon-stack | P1 | **Done** (manifest, discovery, loader, REST API) |
| Knowledge RAG pipeline (BM25+embedding hybrid, reranking) | agent-core | P1 | **Done** (embedder cache, condenser, BM25, RRF fusion, cross-encoder reranker) |
| Knowledge pipeline wiring in CLI | cli-stack | P1 | **Done** (optional condenser + reranker fields on Agent) |
| Knowledge pipeline wiring in Beacon | beacon-stack | P1 | **Done** (condenser + reranker in ApiState, WebSocket handler) |
| Memory hybrid search | beacon-stack | P2 | **Done** (text + vector dedup) |
| Daemon lifecycle management | beacon-stack | P2 | **Done** (launchd, systemd, CLI commands) |
| Synapse entitlement webhook | synapse-stack | P1 | **Done** (cache invalidation on entitlement change) |

### Phase 3: Ecosystem (Marketplace + advanced)

| Task | Stack | Priority | Status |
|------|-------|----------|--------|
| Plugin execution runtime in gateway | beacon-stack | P1 | **Done** (ToolExecutor plugin dispatch, subprocess runtime detection, SharedPluginManager threading) |
| Plugin marketplace (Launchpad) | launchpad-stack | P2 | **Done** (Elysia + Bun SQLite registry API, search/publish/download endpoints) |
| Wallet plugin | plugins/omni-plugin-wallet | P2 | **Done** (viem-based, EVM multi-chain balance/history/gas tools) |
| CoinGecko plugin | plugins/omni-plugin-coingecko | P3 | **Done** (crypto_price, crypto_trending tools via CoinGecko API) |
| DeFi plugin | plugins/omni-plugin-defi | P3 | **Done** (token_price, protocol_tvl, chain_tvl tools via DeFi Llama) |
| Polymarket plugin | plugins/omni-plugin-polymarket | P3 | **Done** (market_search, market_detail tools via Gamma API) |
| Skills marketplace UI in Beacon | beacon-stack | P2 | **Done** (Browse tab with search, install/uninstall in skills.tsx) |
| Tailscale/SSH remote access | beacon-stack | P3 | **Done** (RelayManager with Tailscale Serve/Funnel + SSH tunnel modes) |
| Cloud-hosted gateway (beacon.omni.dev) | beacon-stack + mosaic | P3 | **Done** (BEACON_CLOUD_MODE flag, required JWT, rate limiting, Synapse default, Railway env vars) |

---

## 8. Open Questions

1. **Synapse pricing**: What's the monthly price? Per-token? Flat rate with limits? Tiered?
2. **Free credit amount**: How many messages/tokens for free tier? Enough to hook, not enough to avoid paying.
3. **Cloud gateway hosting**: Run beacon-gateway as a cloud service, or require users to self-host? Cloud is better for normies but adds infra cost.
4. **Plugin revenue sharing**: Should paid plugins use Crystal for payouts? What's the platform cut?
5. **Wallet custody**: Non-custodial (user holds keys) vs managed (Horcrux sharded)? Regulatory implications.
6. **Mobile strategy**: Finish Tauri mobile builds vs native Swift/Kotlin apps? Tauri is faster, native is better UX for device capabilities.
