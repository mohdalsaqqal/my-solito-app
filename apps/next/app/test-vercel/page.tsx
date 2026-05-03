import { connection } from 'next/server'

export default async function TestPage() {
  await connection()

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>Test Page</h1>
      <p>Time: {new Date().toISOString()}</p>
      <p>Dynamic page — no auth, CMS, or providers. Only connection().</p>
    </div>
  )
}
