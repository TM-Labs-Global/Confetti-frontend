'use client'
import { useMemo, useState } from 'react'
import { BadgeCheck, Send, X } from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plan } from '../types/plan.types'
import { BrowseVendor } from '../types/marketplace.types'
import { matchingCategories } from '../utils/vendorMatch'
import type { ShortlistZone } from '../hooks/useEventShortlist'

const ZONE_ACTIVE = 'zone:active'
const ZONE_SETASIDE = 'zone:setAside'

// Inline SVGs so we don't depend on icon names that may vary across the pinned
// lucide build. The codebase already mixes lucide icons with inline SVGs.
function GripIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="9" cy="6" r="1.6" /><circle cx="15" cy="6" r="1.6" />
      <circle cx="9" cy="12" r="1.6" /><circle cx="15" cy="12" r="1.6" />
      <circle cx="9" cy="18" r="1.6" /><circle cx="15" cy="18" r="1.6" />
    </svg>
  )
}
function ArrowIcon({ dir }: { dir: 'up' | 'down' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden
      style={{ transform: dir === 'down' ? 'rotate(180deg)' : undefined }}>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  )
}

export interface VendorShortlistProps {
  plan: Plan
  vendorsById: Map<string, BrowseVendor>
  order: string[]
  setAside: string[]
  moveTo: (id: string, zone: ShortlistZone, index: number) => void
  onRemove: (id: string) => void
  onInvite: (vendor: BrowseVendor) => void
}

export function VendorShortlist({
  plan, vendorsById, order, setAside, moveTo, onRemove, onInvite,
}: VendorShortlistProps) {
  const [dragId, setDragId] = useState<string | null>(null)

  // Only render ids that still resolve to a known vendor (the page prunes the
  // rest); guards against a shortlisted vendor that later got suspended.
  const activeIds  = useMemo(() => order.filter(id => vendorsById.has(id)), [order, vendorsById])
  const asideIds   = useMemo(() => setAside.filter(id => vendorsById.has(id)), [setAside, vendorsById])

  const sensors = useSensors(
    // 6px activation so tapping a button never starts a drag; scrolling on touch
    // is unaffected because drag is initiated from the handle only.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function onDragStart(e: DragStartEvent) { setDragId(String(e.active.id)) }
  function onDragCancel() { setDragId(null) }

  function onDragEnd(e: DragEndEvent) {
    setDragId(null)
    const id = String(e.active.id)
    const over = e.over
    if (!over) return
    const overId = String(over.id)
    if (overId === id) return

    let zone: ShortlistZone
    if (overId === ZONE_ACTIVE || overId === ZONE_SETASIDE) {
      zone = overId === ZONE_ACTIVE ? 'active' : 'setAside'
      const target = (zone === 'active' ? order : setAside).filter(x => x !== id)
      moveTo(id, zone, target.length)
      return
    }
    // Dropped over another row: land in its slot (index computed after removal).
    zone = order.includes(overId) ? 'active' : 'setAside'
    const target = (zone === 'active' ? order : setAside).filter(x => x !== id)
    const at = target.indexOf(overId)
    moveTo(id, zone, at === -1 ? target.length : at)
  }

  const dragVendor = dragId ? vendorsById.get(dragId) : null
  const empty = activeIds.length === 0 && asideIds.length === 0

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <div className="bg-white border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display font-semibold text-[16px] text-ink">Your shortlist</h2>
          {activeIds.length > 0 && (
            <span className="font-mono text-[11px] text-ink-3 tabular-nums">{activeIds.length} ranked</span>
          )}
        </div>
        <p className="text-[12px] text-ink-3 mb-4">
          Rank who bids on <span className="font-medium text-ink-2">{plan.name}</span>. Drag to reorder, or use the arrows. Set aside anyone you&apos;re unsure about.
        </p>

        {empty ? (
          <div className="rounded-xl border border-dashed border-border bg-canvas px-4 py-8 text-center">
            <p className="text-[24px] mb-2">📋</p>
            <p className="text-[13px] text-ink-2 font-medium">No vendors shortlisted yet</p>
            <p className="text-[12px] text-ink-3 mt-0.5">Add vendors from the list to start ranking who bids on this event.</p>
          </div>
        ) : (
          <>
            <SortableZone id={ZONE_ACTIVE} ids={activeIds}>
              <div className="space-y-2">
                {activeIds.map((id, i) => (
                  <ActiveRow
                    key={id}
                    vendor={vendorsById.get(id)!}
                    rank={i + 1}
                    plan={plan}
                    isFirst={i === 0}
                    isLast={i === activeIds.length - 1}
                    onUp={() => moveTo(id, 'active', i - 1)}
                    onDown={() => moveTo(id, 'active', i + 1)}
                    onSetAside={() => moveTo(id, 'setAside', 0)}
                    onInvite={() => onInvite(vendorsById.get(id)!)}
                  />
                ))}
                {activeIds.length === 0 && (
                  <p className="rounded-lg border border-dashed border-border px-3 py-3 text-center text-[12px] text-ink-3">
                    Drag a vendor here to rank them.
                  </p>
                )}
              </div>
            </SortableZone>

            {asideIds.length > 0 && (
              <div className="mt-5 pt-4 border-t border-border">
                <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-ink-3 mb-2.5">
                  Set aside · tap ↑ to bring back
                </p>
                <SortableZone id={ZONE_SETASIDE} ids={asideIds}>
                  <div className="space-y-2">
                    {asideIds.map(id => (
                      <AsideRow
                        key={id}
                        vendor={vendorsById.get(id)!}
                        onRestore={() => moveTo(id, 'active', order.filter(x => vendorsById.has(x)).length)}
                        onRemove={() => onRemove(id)}
                      />
                    ))}
                  </div>
                </SortableZone>
              </div>
            )}
          </>
        )}
      </div>

      <DragOverlay>
        {dragVendor ? (
          <div className="flex items-center gap-2 rounded-xl border border-primary/40 bg-white px-3 py-2.5 shadow-lg">
            <span className="text-ink-3"><GripIcon /></span>
            <span className="text-[13px] font-medium text-ink truncate">{dragVendor.businessName}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

// Wraps a list in a SortableContext and makes the whole zone a drop target, so a
// row can be dropped into empty space (e.g. an empty active list) too.
function SortableZone({ id, ids, children }: { id: string; ids: string[]; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id })
  return (
    <SortableContext items={ids} strategy={verticalListSortingStrategy}>
      <div ref={setNodeRef}>{children}</div>
    </SortableContext>
  )
}

function ActiveRow({
  vendor, rank, plan, isFirst, isLast, onUp, onDown, onSetAside, onInvite,
}: {
  vendor: BrowseVendor
  rank: number
  plan: Plan
  isFirst: boolean
  isLast: boolean
  onUp: () => void
  onDown: () => void
  onSetAside: () => void
  onInvite: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: vendor.userId })
  const matches = matchingCategories(plan, vendor)
  const totalCats = (plan.categories ?? []).length
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2.5 rounded-xl border border-border bg-white px-2.5 py-2.5 ${isDragging ? 'opacity-40' : ''}`}
    >
      <button
        {...attributes}
        {...listeners}
        aria-label={`Drag to reorder ${vendor.businessName}`}
        className="shrink-0 cursor-grab active:cursor-grabbing text-ink-3 hover:text-ink touch-none p-0.5"
      >
        <GripIcon />
      </button>

      <span className="shrink-0 grid place-items-center w-6 h-6 rounded-full bg-primary/10 text-primary font-mono text-[11px] font-semibold tabular-nums">
        {rank}
      </span>

      <div className="flex-1 min-w-0">
        <p className="flex items-center gap-1 text-[13px] font-medium text-ink leading-tight">
          <span className="truncate">{vendor.businessName}</span>
          <BadgeCheck size={13} className="text-success shrink-0" />
        </p>
        <p className="text-[11px] text-ink-3 mt-0.5">
          {matches.length > 0
            ? `Offers ${matches.length} of ${totalCats} service${totalCats !== 1 ? 's' : ''}`
            : 'No matching services for this event'}
        </p>
      </div>

      <div className="shrink-0 flex flex-col">
        <button onClick={onUp} disabled={isFirst} aria-label="Move up"
          className="text-ink-3 hover:text-ink disabled:opacity-25 disabled:pointer-events-none transition-colors leading-none p-0.5">
          <ArrowIcon dir="up" />
        </button>
        <button onClick={onDown} disabled={isLast} aria-label="Move down"
          className="text-ink-3 hover:text-ink disabled:opacity-25 disabled:pointer-events-none transition-colors leading-none p-0.5">
          <ArrowIcon dir="down" />
        </button>
      </div>

      <button onClick={onInvite} disabled={matches.length === 0}
        title={matches.length === 0 ? "This event doesn't need this vendor's services" : undefined}
        className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-primary/10 text-primary text-[11px] font-medium px-2.5 py-1.5 hover:bg-primary/20 disabled:opacity-40 disabled:pointer-events-none transition-colors">
        <Send size={12} /> Invite
      </button>

      <button onClick={onSetAside} aria-label={`Set aside ${vendor.businessName}`}
        className="shrink-0 text-ink-3 hover:text-red-500 transition-colors p-0.5">
        <X size={15} />
      </button>
    </div>
  )
}

function AsideRow({ vendor, onRestore, onRemove }: { vendor: BrowseVendor; onRestore: () => void; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: vendor.userId })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2.5 rounded-xl border border-border bg-canvas px-2.5 py-2 ${isDragging ? 'opacity-40' : ''}`}
    >
      <button
        {...attributes}
        {...listeners}
        aria-label={`Drag ${vendor.businessName} back to your shortlist`}
        className="shrink-0 cursor-grab active:cursor-grabbing text-ink-3 hover:text-ink touch-none p-0.5"
      >
        <GripIcon />
      </button>

      <p className="flex-1 min-w-0 truncate text-[13px] text-ink-2">{vendor.businessName}</p>

      <button onClick={onRestore}
        className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-border text-ink-2 text-[11px] font-medium px-2.5 py-1.5 hover:border-primary/40 hover:text-primary transition-colors">
        <ArrowIcon dir="up" /> Bring back
      </button>

      <button onClick={onRemove} aria-label={`Remove ${vendor.businessName} from shortlist`}
        className="shrink-0 text-ink-3 hover:text-red-500 transition-colors p-0.5">
        <X size={15} />
      </button>
    </div>
  )
}
