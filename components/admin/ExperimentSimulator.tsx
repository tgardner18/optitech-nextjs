'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlaskConical, Play, Square, RotateCcw, ChevronDown, AlertTriangle } from 'lucide-react'
import {
  runExperimentSimulation,
  expectedOutcomes,
  type ExperimentBlueprint,
  type FunnelStep,
  type ExpSimProgress,
  type ExpSimResult,
  type ExpSimLogEntry,
} from '@/lib/demo/experimentSimulator'

interface ProjectSummary { id: string; name: string; accountId: string }
interface ExperimentSummary { id: string; name: string; status: string }

const VISITOR_OPTIONS = [100, 500, 1000, 2500, 5000, 10000, 25000]
const MAX_LOG = 500

const inputCls = [
  'w-full appearance-none border border-fg/[0.12] bg-canvas px-md pr-[36px] py-[9px]',
  'text-[0.875rem] font-medium text-fg',
  'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20',
  'transition-[border-color,box-shadow] duration-150 rounded-input',
  'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ')

/** Sensible default per-step rate: baseline (index 0) ~0.6, later variations lifted. */
function defaultRate(variationIndex: number): number {
  return Math.min(0.95, 0.6 * (1 + 0.15 * variationIndex))
}

function fmtPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`
}

// ─── Funnel editor ──────────────────────────────────────────────────────────

function FunnelEditor({
  blueprint,
  funnel,
  onChange,
  disabled,
}: {
  blueprint: ExperimentBlueprint
  funnel: FunnelStep[]
  onChange: (next: FunnelStep[]) => void
  disabled: boolean
}) {
  if (funnel.length === 0) {
    return (
      <p className="text-[0.8125rem] text-fg-muted/70 border border-fg/[0.08] px-md py-sm">
        This experiment has no mapped metric events, so there is no funnel to configure.
        Every visitor will still record a decision (impression).
      </p>
    )
  }

  const setRate = (stepIdx: number, variationId: string, pct: number) => {
    const clamped = Math.max(0, Math.min(100, pct)) / 100
    onChange(
      funnel.map((s, i) =>
        i === stepIdx ? { ...s, rates: { ...s.rates, [variationId]: clamped } } : s,
      ),
    )
  }

  return (
    <div className="border border-fg/[0.08] overflow-x-auto">
      <table className="w-full border-collapse text-[0.8125rem]">
        <thead>
          <tr className="bg-fg/2 border-b border-fg/6">
            <th className="text-left px-md py-2 text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-fg-muted/70">
              Funnel step (per-variation continuation rate %)
            </th>
            {blueprint.variations.map((v) => (
              <th
                key={v.id}
                className="text-right px-md py-2 text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-fg-muted/70 whitespace-nowrap"
              >
                {v.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {funnel.map((step, i) => (
            <tr key={step.entityId} className="border-b border-fg/6 last:border-none">
              <td className="px-md py-2">
                <span className="text-[0.4rem] font-mono text-fg-muted/40 mr-1">{i + 1}</span>
                <span className="font-medium text-fg">{step.name}</span>
                <span className="text-fg-muted/50 font-mono ml-2 text-[0.75rem]">{step.key}</span>
              </td>
              {blueprint.variations.map((v) => (
                <td key={v.id} className="px-md py-1.5 text-right">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    disabled={disabled}
                    value={Math.round((step.rates[v.id] ?? 0) * 100)}
                    onChange={(e) => setRate(i, v.id, Number(e.target.value))}
                    className="w-16 text-right border border-fg/[0.12] bg-canvas px-2 py-1 text-[0.8125rem] font-medium text-fg tabular-nums focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 rounded-input disabled:opacity-50"
                    aria-label={`${step.name} continuation rate for ${v.name}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ExperimentSimulator() {
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null)
  const [projectsError, setProjectsError] = useState<string | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState('')

  const [experiments, setExperiments] = useState<ExperimentSummary[] | null>(null)
  const [experimentsLoading, setExperimentsLoading] = useState(false)
  const [selectedExperimentId, setSelectedExperimentId] = useState('')

  const [blueprint, setBlueprint] = useState<ExperimentBlueprint | null>(null)
  const [blueprintLoading, setBlueprintLoading] = useState(false)
  const [blueprintError, setBlueprintError] = useState<string | null>(null)

  const [funnel, setFunnel] = useState<FunnelStep[]>([])
  const [totalUsers, setTotalUsers] = useState(1000)

  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState<ExpSimProgress | null>(null)
  const [result, setResult] = useState<ExpSimResult | null>(null)
  const [log, setLog] = useState<ExpSimLogEntry[]>([])

  const abortRef = useRef(false)
  const logEl = useRef<HTMLDivElement | null>(null)

  // Auto-scroll log to bottom on new entries.
  useEffect(() => {
    if (logEl.current) logEl.current.scrollTop = logEl.current.scrollHeight
  }, [log])

  // Load projects on mount.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/opti-admin/experiments/projects')
        const data = await res.json()
        if (cancelled) return
        if (!res.ok) { setProjectsError(data.error ?? 'Failed to load projects.'); return }
        setProjects(data.projects)
      } catch {
        if (!cancelled) setProjectsError('Could not reach the server.')
      }
    })()
    return () => { cancelled = true }
  }, [])

  // Load experiments when a project is chosen.
  const handleSelectProject = useCallback(async (projectId: string) => {
    setSelectedProjectId(projectId)
    setExperiments(null)
    setSelectedExperimentId('')
    setBlueprint(null)
    setBlueprintError(null)
    setFunnel([])
    if (!projectId) return
    setExperimentsLoading(true)
    try {
      const res = await fetch(`/api/opti-admin/experiments?project_id=${encodeURIComponent(projectId)}`)
      const data = await res.json()
      if (!res.ok) { setBlueprintError(data.error ?? 'Failed to load experiments.'); return }
      setExperiments(data.experiments)
    } catch {
      setBlueprintError('Could not reach the server.')
    } finally {
      setExperimentsLoading(false)
    }
  }, [])

  // Load blueprint when an experiment is chosen, and seed the funnel.
  const handleSelectExperiment = useCallback(async (experimentId: string) => {
    setSelectedExperimentId(experimentId)
    setBlueprint(null)
    setBlueprintError(null)
    setFunnel([])
    setResult(null)
    setProgress(null)
    if (!experimentId) return
    setBlueprintLoading(true)
    try {
      const res = await fetch(`/api/opti-admin/experiments/${encodeURIComponent(experimentId)}`)
      const data = await res.json()
      if (!res.ok) { setBlueprintError(data.error ?? 'Failed to load experiment.'); return }
      const bp = data.blueprint as ExperimentBlueprint
      setBlueprint(bp)
      setFunnel(
        bp.events.map((ev) => ({
          entityId: ev.entityId,
          key: ev.key,
          name: ev.name,
          rates: Object.fromEntries(bp.variations.map((v, vi) => [v.id, defaultRate(vi)])),
        })),
      )
    } catch {
      setBlueprintError('Could not reach the server.')
    } finally {
      setBlueprintLoading(false)
    }
  }, [])

  const preview = useMemo(() => {
    if (!blueprint) return null
    return expectedOutcomes({ blueprint, funnel, totalUsers })
  }, [blueprint, funnel, totalUsers])

  const appendLog = useCallback((entry: ExpSimLogEntry) => {
    setLog((prev) => {
      const next = [...prev, entry]
      return next.length > MAX_LOG ? next.slice(-MAX_LOG) : next
    })
  }, [])

  const handleStart = useCallback(async () => {
    if (!blueprint) return
    abortRef.current = false
    setIsRunning(true)
    setResult(null)
    setProgress(null)
    setLog([])
    try {
      const res = await runExperimentSimulation({
        blueprint,
        funnel,
        totalUsers,
        onProgress: setProgress,
        onLog: appendLog,
        shouldAbort: () => abortRef.current,
      })
      setResult(res)
    } catch (err) {
      appendLog({ type: 'error', message: err instanceof Error ? err.message : String(err) })
    } finally {
      setIsRunning(false)
    }
  }, [blueprint, funnel, totalUsers, appendLog])

  const handleAbort = useCallback(() => { abortRef.current = true }, [])
  const handleReset = useCallback(() => { setProgress(null); setResult(null); setLog([]) }, [])

  const logColor: Record<ExpSimLogEntry['type'], string> = {
    info: 'text-fg-muted',
    success: 'text-accent',
    warn: 'text-brand',
    error: 'text-red-600',
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-sm mb-md">
        <div className="w-9 h-9 bg-brand/[0.08] flex items-center justify-center shrink-0">
          <FlaskConical size={17} strokeWidth={1.75} className="text-brand" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-[1.125rem] font-semibold text-fg leading-tight">Experiment Simulator</h2>
          <p className="text-[0.8125rem] text-fg-muted mt-[3px] leading-relaxed max-w-[60ch]">
            Send synthetic decision + conversion events to the Optimizely Event API for any of
            your Web Experimentation A/B tests. Pick a project and experiment, shape the funnel,
            then run.
          </p>
        </div>
      </div>

      {projectsError && (
        <p role="alert" className="flex items-center gap-xs text-[0.8125rem] text-fg border border-fg/[0.08] px-md py-sm mb-md">
          <AlertTriangle size={14} className="text-brand shrink-0" aria-hidden="true" />
          {projectsError}
        </p>
      )}

      {/* Project + experiment pickers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-md mb-md">
        <div className="flex flex-col gap-xs">
          <label htmlFor="exp-project" className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-fg-muted">
            Project (Web Experimentation)
          </label>
          <div className="relative">
            <select
              id="exp-project"
              value={selectedProjectId}
              disabled={isRunning || !projects}
              onChange={(e) => handleSelectProject(e.target.value)}
              className={inputCls}
            >
              <option value="">{projects ? 'Select a project…' : 'Loading projects…'}</option>
              {projects?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown size={14} strokeWidth={1.75} className="absolute right-[12px] top-1/2 -translate-y-1/2 text-fg-muted/50 pointer-events-none" aria-hidden="true" />
          </div>
        </div>

        <div className="flex flex-col gap-xs">
          <label htmlFor="exp-experiment" className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-fg-muted">
            Experiment
          </label>
          <div className="relative">
            <select
              id="exp-experiment"
              value={selectedExperimentId}
              disabled={isRunning || !experiments || experimentsLoading}
              onChange={(e) => handleSelectExperiment(e.target.value)}
              className={inputCls}
            >
              <option value="">
                {experimentsLoading ? 'Loading experiments…' : experiments ? 'Select an experiment…' : '—'}
              </option>
              {experiments?.map((e) => (
                <option key={e.id} value={e.id}>{e.name} · {e.status}</option>
              ))}
            </select>
            <ChevronDown size={14} strokeWidth={1.75} className="absolute right-[12px] top-1/2 -translate-y-1/2 text-fg-muted/50 pointer-events-none" aria-hidden="true" />
          </div>
        </div>
      </div>

      {blueprintError && (
        <p role="alert" className="flex items-center gap-xs text-[0.8125rem] text-fg border border-fg/[0.08] px-md py-sm mb-md">
          <AlertTriangle size={14} className="text-brand shrink-0" aria-hidden="true" />
          {blueprintError}
        </p>
      )}
      {blueprintLoading && (
        <p className="text-[0.8125rem] text-fg-muted mb-md">Loading experiment definition…</p>
      )}

      {/* Funnel editor + config + run */}
      {blueprint && (
        <>
          <div className="mb-md">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-fg-muted/70 mb-xs">
              Funnel
            </p>
            <FunnelEditor blueprint={blueprint} funnel={funnel} onChange={setFunnel} disabled={isRunning} />
          </div>

          <div className="flex flex-wrap items-end gap-md mb-md">
            <div className="flex flex-col gap-xs">
              <label htmlFor="exp-visitors" className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-fg-muted">
                Target visitors
              </label>
              <div className="relative">
                <select
                  id="exp-visitors"
                  value={totalUsers}
                  disabled={isRunning}
                  onChange={(e) => setTotalUsers(Number(e.target.value))}
                  className={`${inputCls} min-w-[140px]`}
                >
                  {VISITOR_OPTIONS.map((n) => (
                    <option key={n} value={n}>{n.toLocaleString()}</option>
                  ))}
                </select>
                <ChevronDown size={14} strokeWidth={1.75} className="absolute right-[12px] top-1/2 -translate-y-1/2 text-fg-muted/50 pointer-events-none" aria-hidden="true" />
              </div>
            </div>

            {preview && (
              <p className="text-[0.75rem] text-fg-muted/70 leading-relaxed">
                ≈ {preview.jitterRange[0].toLocaleString()}–{preview.jitterRange[1].toLocaleString()} visitors
                {preview.liftRatio > 0 && <> · projected lift {preview.liftRatio.toFixed(2)}×</>}
                {' · ~'}{preview.estimatedDurationSec}s
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-sm mb-md">
            <button
              type="button"
              onClick={handleStart}
              disabled={isRunning}
              className="flex items-center gap-sm px-lg py-[9px] bg-brand text-fg-on-brand text-[0.8125rem] font-semibold uppercase tracking-[0.06em] hover:bg-brand-hover transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={14} strokeWidth={2} aria-hidden="true" />
              {isRunning ? `Running… ${progress?.percent ?? 0}%` : 'Start Simulation'}
            </button>
            {isRunning && (
              <button
                type="button"
                onClick={handleAbort}
                className="flex items-center gap-sm px-lg py-[9px] border border-fg/[0.12] text-[0.8125rem] font-semibold uppercase tracking-[0.06em] text-fg-muted hover:text-fg hover:border-fg/25 transition-colors duration-150"
              >
                <Square size={13} strokeWidth={2} aria-hidden="true" /> Abort
              </button>
            )}
            {!isRunning && (result || log.length > 0) && (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-sm px-lg py-[9px] border border-fg/[0.12] text-[0.8125rem] font-semibold uppercase tracking-[0.06em] text-fg-muted hover:text-fg hover:border-fg/25 transition-colors duration-150"
              >
                <RotateCcw size={13} strokeWidth={2} aria-hidden="true" /> Reset
              </button>
            )}
          </div>

          {/* Progress bar */}
          {progress && (
            <div className="mb-md">
              <div className="h-1.5 w-full bg-fg/[0.08] overflow-hidden">
                <div
                  className="h-full bg-brand transition-[width] duration-200"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-lg mt-sm">
                <Stat label="Sent" value={progress.completed.toLocaleString()} />
                {blueprint.variations.map((v) => (
                  <Stat key={v.id} label={v.name} value={(progress.variationCounts[v.id] ?? 0).toLocaleString()} />
                ))}
                <Stat label="Errors" value={progress.errors.toLocaleString()} bad={progress.errors > 0} />
              </div>
            </div>
          )}

          {/* Event log */}
          {log.length > 0 && (
            <div
              ref={logEl}
              className="mb-md h-[180px] overflow-y-auto border border-fg/[0.08] bg-fg/[0.02] px-md py-sm font-mono text-[0.75rem] leading-relaxed"
            >
              {log.map((entry, i) => (
                <div key={i} className={logColor[entry.type]}>
                  {entry.message}
                </div>
              ))}
            </div>
          )}

          {/* Results */}
          {result && (
            <div className={`border px-md py-md ${result.aborted ? 'border-brand/30' : 'border-accent/30'}`}>
              <p className="text-[0.9375rem] font-semibold text-fg mb-sm">
                {result.aborted ? '⚠ Simulation aborted' : '✓ Experiment data delivered'}
                <span className="font-normal text-fg-muted"> · {(result.durationMs / 1000).toFixed(1)}s · {result.liftRatio.toFixed(2)}× lift</span>
              </p>
              <div className="border border-fg/[0.08]">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-md px-md py-2 bg-fg/2 border-b border-fg/6 text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-fg-muted/70">
                  <span>Variation</span><span className="text-right">Assigned</span><span className="text-right">Converted</span><span className="text-right">Rate</span>
                </div>
                {result.variations.map((v) => (
                  <div key={v.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-md px-md py-1.5 border-b border-fg/6 last:border-none text-[0.8125rem]">
                    <span className="font-medium text-fg truncate">{v.name}</span>
                    <span className="text-right tabular-nums text-fg-muted">{v.assigned.toLocaleString()}</span>
                    <span className="text-right tabular-nums text-fg-muted">{v.converted.toLocaleString()}</span>
                    <span className="text-right tabular-nums font-semibold text-fg">{fmtPct(v.conversionRate)}</span>
                  </div>
                ))}
              </div>
              {result.errors > 0 && (
                <p className="text-[0.75rem] text-red-600 mt-sm">{result.errors} events failed to send.</p>
              )}
              <p className="text-[0.75rem] text-fg-muted/60 mt-sm">
                Web Experimentation results can take 1–2 minutes to reflect these impressions.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Stat({ label, value, bad }: { label: string; value: string; bad?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className={`text-[1.125rem] font-semibold tabular-nums leading-none ${bad ? 'text-red-600' : 'text-fg'}`}>{value}</span>
      <span className="text-[0.6875rem] uppercase tracking-[0.06em] text-fg-muted/60 mt-[3px]">{label}</span>
    </div>
  )
}
