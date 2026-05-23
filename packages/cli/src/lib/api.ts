const DEFAULT_BASE = process.env.HARNESS_DEV_URL || 'http://localhost:3002'

export async function callDevRoute<T>(path: string, body?: unknown, baseUrl = DEFAULT_BASE): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  }
  catch {
    throw new Error(`Cannot reach the dev server at ${baseUrl}. Start it with \`pnpm dev\` first.`)
  }
  if (!res.ok)
    throw new Error(`${path} → ${res.status} ${res.statusText}: ${await res.text()}`)
  return res.json() as Promise<T>
}
