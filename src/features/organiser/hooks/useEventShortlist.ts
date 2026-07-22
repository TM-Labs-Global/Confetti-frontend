'use client'
import { useCallback, useEffect, useState } from 'react'

// A per-event vendor shortlist the organiser is curating on Find Vendors.
// `order` is the ranked active array; `setAside` is the pool of parked vendors.
// Both hold vendor userIds. This is a client-side working set (Phase 1) persisted
// to localStorage per event, mirroring the create-plan draft pattern.
export interface ShortlistState {
  order: string[]
  setAside: string[]
}

/** Where a vendor can live inside the shortlist. */
export type ShortlistZone = 'active' | 'setAside'

const EMPTY: ShortlistState = { order: [], setAside: [] }
const keyFor = (planId: string) => `confetti:shortlist:v1:${planId}`

const asIds = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []

function read(planId: string): ShortlistState {
  if (typeof window === 'undefined' || !planId) return EMPTY
  try {
    const raw = window.localStorage.getItem(keyFor(planId))
    if (!raw) return EMPTY
    const v = JSON.parse(raw)
    // A vendor must never be in both lists; active wins if a stale write did that.
    const order = asIds(v?.order)
    const setAside = asIds(v?.setAside).filter(id => !order.includes(id))
    return { order, setAside }
  } catch {
    return EMPTY
  }
}

export function useEventShortlist(planId: string | null) {
  const [state, setState] = useState<ShortlistState>(EMPTY)

  // Load the selected event's shortlist. Runs on the client only, so the empty
  // server render never mismatches hydration.
  useEffect(() => {
    setState(planId ? read(planId) : EMPTY)
  }, [planId])

  // Persist on every change (best effort: private mode / quota just no-ops).
  useEffect(() => {
    if (typeof window === 'undefined' || !planId) return
    try {
      window.localStorage.setItem(keyFor(planId), JSON.stringify(state))
    } catch {
      /* ignore */
    }
  }, [planId, state])

  const isShortlisted = useCallback(
    (id: string) => state.order.includes(id) || state.setAside.includes(id),
    [state],
  )

  /** Add a vendor to the bottom of the active array (no-op if already shortlisted). */
  const add = useCallback((id: string) => {
    setState(s =>
      s.order.includes(id) || s.setAside.includes(id)
        ? s
        : { ...s, order: [...s.order, id] },
    )
  }, [])

  /** Drop a vendor from the shortlist entirely (both lists). */
  const remove = useCallback((id: string) => {
    setState(s => ({
      order: s.order.filter(x => x !== id),
      setAside: s.setAside.filter(x => x !== id),
    }))
  }, [])

  /**
   * Move a vendor to a zone at a given index, pulling it out of wherever it was.
   * The one primitive behind reorder (active→active), set-aside (active→setAside),
   * and restore (setAside→active), so every path stays consistent.
   */
  const moveTo = useCallback((id: string, zone: ShortlistZone, index: number) => {
    setState(s => {
      const order = s.order.filter(x => x !== id)
      const setAside = s.setAside.filter(x => x !== id)
      const target = zone === 'active' ? order : setAside
      const at = Math.max(0, Math.min(index, target.length))
      target.splice(at, 0, id)
      return { order, setAside }
    })
  }, [])

  /** Drop stale ids that no longer resolve to a known vendor (e.g. suspended). */
  const prune = useCallback((validIds: Set<string>) => {
    setState(s => {
      const order = s.order.filter(x => validIds.has(x))
      const setAside = s.setAside.filter(x => validIds.has(x))
      return order.length === s.order.length && setAside.length === s.setAside.length
        ? s
        : { order, setAside }
    })
  }, [])

  return {
    order: state.order,
    setAside: state.setAside,
    isShortlisted,
    add,
    remove,
    moveTo,
    prune,
  }
}
