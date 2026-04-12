/**
 * Homepage Loading State
 * 
 * Displayed during:
 * - Initial server render (streaming)
 * - Navigation to homepage
 * - Suspense boundary fallback
 * 
 * Uses skeleton loaders matching content dimensions.
 */

export default function Loading() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'hsl(0 0% 97.6%)',
    }}>
      {/* Header Skeleton */}
      <div style={{
        height: '80px',
        backgroundColor: 'hsl(0 0% 100%)',
        borderBottom: '1px solid hsl(0 0% 90%)',
        marginBottom: '24px',
      }} />

      {/* Hero Skeleton */}
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '0 24px',
      }}>
        <div style={{
          minHeight: '320px',
          height: 'min(500px, 52vh)',
          backgroundColor: 'hsl(0 0% 92%)',
          borderRadius: '12px',
          marginBottom: '48px',
        }} />

        {/* Ticker Skeleton */}
        <div style={{
          height: '40px',
          backgroundColor: 'hsl(0 0% 95%)',
          borderRadius: '8px',
          marginBottom: '48px',
        }} />

        {/* Product Rail Skeleton */}
        <div style={{ marginBottom: '64px' }}>
          <div style={{
            height: '32px',
            width: 'min(280px, 72vw)',
            backgroundColor: 'hsl(0 0% 90%)',
            borderRadius: '6px',
            marginBottom: '24px',
          }} />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
            gap: '24px',
          }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: 'hsl(0 0% 100%)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid hsl(0 0% 90%)',
                }}
              >
                <div style={{
                  height: 'clamp(180px, 28vw, 280px)',
                  backgroundColor: 'hsl(0 0% 95%)',
                }} />
                <div style={{ padding: '16px' }}>
                  <div style={{
                    height: '16px',
                    width: '80%',
                    backgroundColor: 'hsl(0 0% 92%)',
                    borderRadius: '4px',
                    marginBottom: '8px',
                  }} />
                  <div style={{
                    height: '14px',
                    width: '60%',
                    backgroundColor: 'hsl(0 0% 90%)',
                    borderRadius: '4px',
                    marginBottom: '12px',
                  }} />
                  <div style={{
                    height: '24px',
                    width: '100%',
                    backgroundColor: 'hsl(0 0% 88%)',
                    borderRadius: '6px',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Brand Spotlight Skeleton */}
        <div style={{ marginBottom: '64px' }}>
          <div style={{
            height: '400px',
            backgroundColor: 'hsl(0 0% 95%)',
            borderRadius: '12px',
          }} />
        </div>

        {/* Categories Skeleton */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '16px',
          marginBottom: '64px',
        }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: '120px',
                backgroundColor: 'hsl(0 0% 95%)',
                borderRadius: '8px',
              }}
            />
          ))}
        </div>
      </div>

      {/* Footer Skeleton */}
      <div style={{
        height: '400px',
        backgroundColor: 'hsl(0 0% 100%)',
        borderTop: '1px solid hsl(0 0% 90%)',
        marginTop: '64px',
      }} />
    </div>
  )
}
