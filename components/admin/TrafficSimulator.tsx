'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Reorder, useDragControls } from 'framer-motion'
import {
  Activity, Play, Square, RotateCcw, ChevronDown, GripVertical, X, Plus, AlertTriangle, Search,
} from 'lucide-react'
import {
  runSimulation,
  expectedOutcomes,
  type TrafficFunnelStep,
  type SimProgress,
  type SimResult,
  type SimLogEntry,
} from '@/lib/demo/simulator'

interface ProjectSummary { id: string; name: string; accountId: string }
interface EventSummary { id: string; key: string; name: string }
interface FunnelStepState { stepId: string; eventKey: string; name: string; rate: number } // rate 0..1

const MAX_STEPS = 5
const MAX_LOG = 500
const VISITOR_OPTIONS = [10, 100, 500, 1000, 5000, 10000]
const DEFAULT_RATE = 0.5
const DND_MIME = 'application/x-opti-event'

const selectCls = [
  'w-full appearance-none border border-fg/[0.12] bg-canvas px-md pr-[36px] py-[9px]',
  'text-[0.875rem] font-medium text-fg',
  'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20',
  'transition-[border-color,box-shadow] duration-150 rounded-input',
  'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ')

function stepId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `step-${Math.random().toString(36).slice(2)}`
}

function fmtPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`
}

function Stat({ label, value, good, bad }: { label: string; value: string; good?: boolean; bad?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className={`text-[1.125rem] font-semibold tabular-nums leading-none ${bad ? 'text-red-600' : good ? 'text-accent' : 'text-fg'}`}>
        {value}
      </span>
      <span className="text-[0.6875rem] uppercase tracking-[0.06em] text-fg-muted/60 mt-[3px]">{label}</span>
    </div>
  )
}

// ─── A single reorderable funnel step ───────────────────────────────────────

function StepRow({
  step,
  index,
  disabled,
  onRate,
  onRemove,
}: {
  step: FunnelStepState
  index: number
  disabled: boolean
  onRate: (stepId: string, pct: number) => void
  onRemove: (stepId: string) => void
}) {
  const controls = useDragControls()

  return (
    <Reorder.Item
      value={step}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-sm bg-canvas border border-fg/[0.1] px-sm py-2 select-none"
    >
      <button
        type="button"
        aria-label={`Reorder ${step.name}`}
        disabled={disabled}
        onPointerDown={(e) => !disabled && controls.start(e)}
        className="cursor-grab active:cursor-grabbing text-fg-muted/40 hover:text-fg-muted disabled:cursor-not-allowed touch-none"
      >
        <GripVertical size={15} strokeWidth={1.75} aria-hidden="true" />
      </button>

      <span className="w-5 shrink-0 text-[0.75rem] font-semibold tabular-nums text-brand">{index + 1}</span>

      <div className="flex-1 min-w-0">
        <p className="text-[0.875rem] font-medium text-fg truncate leading-tight">{step.name}</p>
        <p className="text-[0.6875rem] font-mono text-fg-muted/50 truncate">{step.eventKey}</p>
      </div>

      {index === 0 ? (
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-fg-muted/70 shrink-0">
          Entry · 100%
        </span>
      ) : (
        <label className="flex items-center gap-1 shrink-0">
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            disabled={disabled}
            value={Math.round(step.rate * 100)}
            onChange={(e) => onRate(step.stepId, Number(e.target.value))}
            className="w-14 text-right border border-fg/[0.12] bg-canvas px-2 py-1 text-[0.8125rem] font-medium text-fg tabular-nums focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 rounded-input disabled:opacity-50"
            aria-label={`${step.name} continuation rate`}
          />
          <span className="text-[0.75rem] text-fg-muted/60">%</span>
        </label>
      )}

      <button
        type="button"
        aria-label={`Remove ${step.name}`}
        disabled={disabled}
        onClick={() => onRemove(step.stepId)}
        className="text-fg-muted/40 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
      >
        <X size={15} strokeWidth={2} aria-hidden="true" />
      </button>
    </Reorder.Item>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function TrafficSimulator() {
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null)
  const [projectsError, setProjectsError] = useState<string | null>(null)
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([])

  const [events, setEvents] = useState<EventSummary[] | null>(null)
  const [eventsLoading, setEventsLoading] = useState(false)
  const [eventsError, setEventsError] = useState<string | null>(null)

  const [funnel, setFunnel] = useState<FunnelStepState[]>([])
  const [eventSearch, setEventSearch] = useState('')
  const [totalUsers, setTotalUsers] = useState(1000)
  const [syncToBigQuery, setSyncToBigQuery] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState<SimProgress | null>(null)
  const [result, setResult] = useState<SimResult | null>(null)
  const [log, setLog] = useState<SimLogEntry[]>([])

  const abortRef = useRef(false)
  const logEl = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (logEl.current) logEl.current.scrollTop = logEl.current.scrollHeight
  }, [log])

  // Load projects on mount, defaulting to ALL projects selected.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/opti-admin/experiments/projects')
        const data = await res.json()
        if (cancelled) return
        if (!res.ok) { setProjectsError(data.error ?? 'Failed to load projects.'); return }
        setProjects(data.projects)
        setSelectedProjectIds((data.projects as ProjectSummary[]).map((p) => p.id))
      } catch {
        if (!cancelled) setProjectsError('Could not reach the server.')
      }
    })()
    return () => { cancelled = true }
  }, [])

  // (Re)fetch the event union whenever the selected project set changes.
  // All state updates happen after an await so they don't cascade synchronously
  // within the effect.
  useEffect(() => {
    if (!projects) return
    const ids = selectedProjectIds
    let cancelled = false
    ;(async () => {
      // Yield past the synchronous effect phase before touching state.
      await Promise.resolve()
      if (cancelled) return
      if (ids.length === 0) { setEvents([]); setEventsError(null); return }
      setEventsLoading(true)
      setEventsError(null)
      try {
        const qs = ids.map((id) => `project_id=${encodeURIComponent(id)}`).join('&')
        const res = await fetch(`/api/opti-admin/events?${qs}`)
        const data = await res.json()
        if (cancelled) return
        if (!res.ok) { setEventsError(data.error ?? 'Failed to load events.'); setEvents(null); return }
        setEvents(data.events)
      } catch {
        if (!cancelled) setEventsError('Could not reach the server.')
      } finally {
        if (!cancelled) setEventsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [projects, selectedProjectIds])

  const toggleProject = useCallback((id: string) => {
    setSelectedProjectIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }, [])

  const toggleAllProjects = useCallback(() => {
    setSelectedProjectIds((prev) => {
      const all = projects?.map((p) => p.id) ?? []
      return prev.length === all.length ? [] : all
    })
  }, [projects])

  const funnelKeys = useMemo(() => new Set(funnel.map((s) => s.eventKey)), [funnel])

  const addEvent = useCallback((ev: EventSummary) => {
    setFunnel((prev) => {
      if (prev.length >= MAX_STEPS || prev.some((s) => s.eventKey === ev.key)) return prev
      return [...prev, { stepId: stepId(), eventKey: ev.key, name: ev.name || ev.key, rate: DEFAULT_RATE }]
    })
  }, [])

  const removeStep = useCallback((id: string) => {
    setFunnel((prev) => prev.filter((s) => s.stepId !== id))
  }, [])

  const setRate = useCallback((id: string, pct: number) => {
    const rate = Math.max(0, Math.min(100, pct)) / 100
    setFunnel((prev) => prev.map((s) => (s.stepId === id ? { ...s, rate } : s)))
  }, [])

  // Native drag from the palette onto the funnel drop zone.
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const raw = e.dataTransfer.getData(DND_MIME) || e.dataTransfer.getData('text/plain')
    if (!raw) return
    try {
      const ev = JSON.parse(raw) as EventSummary
      addEvent(ev)
    } catch { /* ignore malformed drops */ }
  }, [addEvent])

  const preview = useMemo(() => {
    const steps: TrafficFunnelStep[] = funnel.map((s, i) => ({
      eventKey: s.eventKey,
      name: s.name,
      rate: i === 0 ? 1 : s.rate,
    }))
    return expectedOutcomes({ funnel: steps, totalUsers })
  }, [funnel, totalUsers])

  const appendLog = useCallback((entry: SimLogEntry) => {
    setLog((prev) => {
      const next = [...prev, entry]
      return next.length > MAX_LOG ? next.slice(-MAX_LOG) : next
    })
  }, [])

  const handleStart = useCallback(async () => {
    if (funnel.length === 0) return
    abortRef.current = false
    setIsRunning(true)
    setResult(null)
    setProgress(null)
    setLog([])
    try {
      const steps: TrafficFunnelStep[] = funnel.map((s, i) => ({
        eventKey: s.eventKey,
        name: s.name,
        rate: i === 0 ? 1 : s.rate,
      }))
      const res = await runSimulation({
        funnel: steps,
        totalUsers,
        syncToBigQuery,
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
  }, [funnel, totalUsers, syncToBigQuery, appendLog])

  const handleAbort = useCallback(() => { abortRef.current = true }, [])
  const handleReset = useCallback(() => { setProgress(null); setResult(null); setLog([]) }, [])

  const logColor: Record<SimLogEntry['type'], string> = {
    info: 'text-fg-muted',
    success: 'text-accent',
    warn: 'text-brand',
    error: 'text-red-600',
  }

  const query = eventSearch.trim().toLowerCase()
  const availableEvents = (events ?? [])
    .filter((e) => !funnelKeys.has(e.key))
    .filter(
      (e) =>
        query === '' ||
        e.name.toLowerCase().includes(query) ||
        e.key.toLowerCase().includes(query),
    )

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-sm mb-md">
        <div className="w-9 h-9 bg-brand/[0.08] flex items-center justify-center shrink-0">
          <Activity size={17} strokeWidth={1.75} className="text-brand" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-[1.125rem] font-semibold text-fg leading-tight">Traffic Simulator</h2>
          <p className="text-[0.8125rem] text-fg-muted mt-[3px] leading-relaxed max-w-[62ch]">
            Build a funnel by dragging events from a connected project into a logical order (1–5
            steps), then fire synthetic ODP traffic through it. Step 1 fires for every visitor;
            each later step keeps a percentage of the previous step.
          </p>
        </div>
      </div>

      {projectsError && (
        <p role="alert" className="flex items-center gap-xs text-[0.8125rem] text-fg border border-fg/[0.08] px-md py-sm mb-md">
          <AlertTriangle size={14} className="text-brand shrink-0" aria-hidden="true" />
          {projectsError}
        </p>
      )}

      {/* Project multi-select — events are merged across selected projects */}
      <div className="mb-md">
        <div className="flex items-center justify-between mb-xs">
          <label className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-fg-muted">
            Projects <span className="font-normal normal-case tracking-normal text-fg-muted/40">(events merged across selected)</span>
          </label>
          {projects && projects.length > 0 && (
            <button
              type="button"
              onClick={toggleAllProjects}
              disabled={isRunning}
              className="text-[0.75rem] font-medium text-brand/70 hover:text-brand disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedProjectIds.length === projects.length ? 'Clear all' : 'Select all'}
            </button>
          )}
        </div>
        {!projects ? (
          <p className="text-[0.8125rem] text-fg-muted/60">Loading projects…</p>
        ) : projects.length === 0 ? (
          <p className="text-[0.8125rem] text-fg-muted/60">No Web Experimentation projects found.</p>
        ) : (
          <div className="flex flex-wrap gap-xs">
            {projects.map((p) => {
              const on = selectedProjectIds.includes(p.id)
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleProject(p.id)}
                  disabled={isRunning}
                  aria-pressed={on}
                  className={[
                    'px-sm py-[5px] text-[0.8125rem] font-medium border transition-colors duration-100 disabled:opacity-50 disabled:cursor-not-allowed',
                    on
                      ? 'bg-brand/[0.08] border-brand/30 text-brand'
                      : 'border-fg/[0.12] text-fg-muted hover:text-fg hover:border-fg/25',
                  ].join(' ')}
                >
                  {p.name}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {eventsError && (
        <p role="alert" className="flex items-center gap-xs text-[0.8125rem] text-fg border border-fg/[0.08] px-md py-sm mb-md">
          <AlertTriangle size={14} className="text-brand shrink-0" aria-hidden="true" />
          {eventsError}
        </p>
      )}

      {projects && projects.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md mb-md">
          {/* Palette */}
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-fg-muted/70 mb-xs">
              Available events{' '}
              <span className="font-normal normal-case tracking-normal text-fg-muted/40">({availableEvents.length})</span>
              {eventsLoading && <span className="font-normal normal-case tracking-normal"> · loading…</span>}
            </p>
            <div className="relative mb-xs">
              <Search size={13} strokeWidth={1.75} className="absolute left-[10px] top-1/2 -translate-y-1/2 text-fg-muted/50 pointer-events-none" aria-hidden="true" />
              <input
                type="search"
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                placeholder="Search events by name or key…"
                aria-label="Search events"
                className="w-full border border-fg/[0.12] bg-canvas pl-[30px] pr-md py-[7px] text-[0.8125rem] text-fg placeholder:text-fg-muted/50 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-[border-color,box-shadow] duration-150 rounded-input"
              />
            </div>
            <div className="border border-fg/[0.08] p-sm min-h-[120px] max-h-[280px] overflow-y-auto flex flex-wrap gap-xs content-start">
              {availableEvents.length === 0 && !eventsLoading && (
                <p className="text-[0.8125rem] text-fg-muted/60 px-1 py-1">
                  {selectedProjectIds.length === 0
                    ? 'Select at least one project above.'
                    : !events || events.length === 0
                      ? 'No events found in the selected projects.'
                      : query !== ''
                        ? `No events match "${eventSearch.trim()}".`
                        : 'All events added to the funnel.'}
                </p>
              )}
              {availableEvents.map((ev) => {
                const full = funnel.length >= MAX_STEPS
                return (
                  <button
                    key={ev.id}
                    type="button"
                    draggable={!full && !isRunning}
                    onDragStart={(e) => {
                      e.dataTransfer.setData(DND_MIME, JSON.stringify(ev))
                      e.dataTransfer.setData('text/plain', JSON.stringify(ev))
                      e.dataTransfer.effectAllowed = 'copy'
                    }}
                    onClick={() => !full && !isRunning && addEvent(ev)}
                    disabled={full || isRunning}
                    title={full ? 'Funnel is full (max 5 steps)' : `Add ${ev.name}`}
                    className="group flex items-center gap-1.5 border border-fg/[0.12] bg-canvas px-2.5 py-1.5 text-[0.8125rem] font-medium text-fg cursor-grab active:cursor-grabbing hover:border-brand/30 hover:bg-brand/[0.03] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-100"
                  >
                    <Plus size={12} strokeWidth={2} className="text-fg-muted/40 group-hover:text-brand" aria-hidden="true" />
                    {ev.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Funnel builder / drop zone */}
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-fg-muted/70 mb-xs">
              Funnel <span className="font-normal normal-case tracking-normal text-fg-muted/40">({funnel.length}/{MAX_STEPS})</span>
            </p>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`border min-h-[120px] p-sm transition-colors duration-100 ${
                dragOver ? 'border-brand bg-brand/[0.04]' : 'border-fg/[0.08] border-dashed'
              }`}
            >
              {funnel.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-1 py-md text-center">
                  <p className="text-[0.8125rem] text-fg-muted/70">Drag events here (or click one)</p>
                  <p className="text-[0.75rem] text-fg-muted/50">to build a 1–5 step funnel in order.</p>
                </div>
              ) : (
                <Reorder.Group axis="y" values={funnel} onReorder={setFunnel} className="flex flex-col gap-1.5">
                  {funnel.map((step, i) => (
                    <StepRow
                      key={step.stepId}
                      step={step}
                      index={i}
                      disabled={isRunning}
                      onRate={setRate}
                      onRemove={removeStep}
                    />
                  ))}
                </Reorder.Group>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Config + preview + actions (only once a funnel exists) */}
      {funnel.length > 0 && (
        <>
          <div className="flex flex-wrap items-end gap-md mb-md">
            <div className="flex flex-col gap-xs">
              <label htmlFor="traffic-visitors" className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-fg-muted">
                Total visitors
              </label>
              <div className="relative">
                <select
                  id="traffic-visitors"
                  value={totalUsers}
                  disabled={isRunning}
                  onChange={(e) => setTotalUsers(Number(e.target.value))}
                  className={`${selectCls} min-w-[140px]`}
                >
                  {VISITOR_OPTIONS.map((n) => <option key={n} value={n}>{n.toLocaleString()}</option>)}
                </select>
                <ChevronDown size={14} strokeWidth={1.75} className="absolute right-[12px] top-1/2 -translate-y-1/2 text-fg-muted/50 pointer-events-none" aria-hidden="true" />
              </div>
            </div>

            <label className="flex items-center gap-xs text-[0.8125rem] text-fg-muted select-none cursor-pointer pb-[10px]">
              <input
                type="checkbox"
                checked={syncToBigQuery}
                disabled={isRunning}
                onChange={(e) => setSyncToBigQuery(e.target.checked)}
                className="accent-brand w-4 h-4 disabled:opacity-50"
              />
              Also write each visitor to BigQuery
            </label>
          </div>

          <p className="text-[0.75rem] text-fg-muted/70 leading-relaxed mb-md">
            Projected: {preview.perStep.map((s) => `${s.name} ${s.approx.toLocaleString()}`).join(' → ')}
            {' · '}end conversion {fmtPct(preview.conversionRate)} · ~{preview.estimatedDurationSec}s
          </p>

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

          {/* Progress */}
          {progress && (
            <div className="mb-md">
              <div className="h-1.5 w-full bg-fg/[0.08] overflow-hidden">
                <div className="h-full bg-brand transition-[width] duration-200" style={{ width: `${progress.percent}%` }} />
              </div>
              <div className="flex flex-wrap gap-lg mt-sm">
                <Stat label="Done" value={progress.completed.toLocaleString()} />
                {funnel.map((s, i) => (
                  <Stat
                    key={s.stepId}
                    label={s.name}
                    value={(progress.stepCounts[i] ?? 0).toLocaleString()}
                    good={i === funnel.length - 1}
                  />
                ))}
                <Stat label="Errors" value={progress.errors.toLocaleString()} bad={progress.errors > 0} />
              </div>
            </div>
          )}

          {/* Log */}
          {log.length > 0 && (
            <div
              ref={logEl}
              className="mb-md h-[180px] overflow-y-auto border border-fg/[0.08] bg-fg/[0.02] px-md py-sm font-mono text-[0.75rem] leading-relaxed"
            >
              {log.map((entry, i) => (
                <div key={i} className={logColor[entry.type]}>{entry.message}</div>
              ))}
            </div>
          )}

          {/* Results */}
          {result && (
            <div className={`border px-md py-md ${result.aborted ? 'border-brand/30' : 'border-accent/30'}`}>
              <p className="text-[0.9375rem] font-semibold text-fg mb-sm">
                {result.aborted ? '⚠ Simulation aborted' : '✓ Traffic delivered'}
                <span className="font-normal text-fg-muted"> · {(result.durationMs / 1000).toFixed(1)}s · end conversion {fmtPct(result.conversionRate)}</span>
              </p>
              <div className="flex flex-wrap gap-lg">
                <Stat label="Simulated" value={result.totalSimulated.toLocaleString()} />
                {funnel.map((s, i) => (
                  <Stat key={s.stepId} label={s.name} value={(result.stepCounts[i] ?? 0).toLocaleString()} good={i === funnel.length - 1} />
                ))}
                {result.errors > 0 && <Stat label="Errors" value={result.errors.toLocaleString()} bad />}
              </div>
              <p className="text-[0.75rem] text-fg-muted/60 mt-sm">
                ODP Analytics can take a few minutes to reflect these events.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
