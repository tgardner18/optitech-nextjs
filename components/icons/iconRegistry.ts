/**
 * Canonical icon registry — single source of truth for all block icons.
 *
 * To add a new icon to the system:
 *   1. Add an import + entry here
 *   2. Add an entry in cms/display-templates/_shared/iconChoices.ts
 *   3. Push the updated display templates (config push or MCP)
 *
 * Keys are camelCase and match display template setting values exactly.
 */
import {
  // Data & Metrics
  Zap, TrendingUp, BarChart2, Users, Globe, Clock,
  // Trust & Achievement
  Shield, Award, CheckCircle, Sparkles, Star,
  // Actions & Navigation
  ArrowRight, ChevronRight, ExternalLink, ArrowUpRight, Rocket, Plus,
  // Media & Communication
  Play, Download, Send,
  // Structural & Technical
  Layers, Settings, Code, Package,
  type LucideIcon,
} from 'lucide-react'

export type { LucideIcon }
export type IconKey = keyof typeof ICON_REGISTRY

export const ICON_REGISTRY: Record<string, LucideIcon> = {
  // ── Data & Metrics ────────────────────────────────────────────────────────
  zap:          Zap,
  trendingUp:   TrendingUp,
  barChart:     BarChart2,
  users:        Users,
  globe:        Globe,
  clock:        Clock,
  // ── Trust & Achievement ───────────────────────────────────────────────────
  shield:       Shield,
  award:        Award,
  checkCircle:  CheckCircle,
  sparkles:     Sparkles,
  star:         Star,
  // ── Actions & Navigation ──────────────────────────────────────────────────
  arrowRight:   ArrowRight,
  chevronRight: ChevronRight,
  externalLink: ExternalLink,
  arrowUpRight: ArrowUpRight,
  rocket:       Rocket,
  plus:         Plus,
  // ── Media & Communication ─────────────────────────────────────────────────
  play:         Play,
  download:     Download,
  send:         Send,
  // ── Structural & Technical ────────────────────────────────────────────────
  layers:       Layers,
  settings:     Settings,
  code:         Code,
  package:      Package,
}
