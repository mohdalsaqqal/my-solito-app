export function ShopPageSkeleton() {
  return (
    <div style={{ padding: '40px 24px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ height: 32, width: 200, backgroundColor: '#e5e5e5', borderRadius: 8, marginBottom: 32 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ aspectRatio: '1', backgroundColor: '#e5e5e5', borderRadius: 12 }} />
            <div style={{ height: 16, width: '80%', backgroundColor: '#e5e5e5', borderRadius: 4 }} />
            <div style={{ height: 16, width: '50%', backgroundColor: '#e5e5e5', borderRadius: 4 }} />
            <div style={{ height: 20, width: '40%', backgroundColor: '#e5e5e5', borderRadius: 4 }} />
          </div>
        ))}
      </div>
    </div>
  )
}
