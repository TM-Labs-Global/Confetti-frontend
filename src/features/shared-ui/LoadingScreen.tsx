export default function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-canvas">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-8 h-8 rounded-[9px] animate-pulse"
          style={{ background: 'linear-gradient(135deg, #00C4CC 0%, #39E75F 100%)' }}
        />
        <p className="text-[13px] text-ink-3 font-medium">Loading…</p>
      </div>
    </div>
  )
}
