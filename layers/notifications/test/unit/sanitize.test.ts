// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { vSanitize } from '#layers/notifications/app/utils/sanitize'

function applyMounted(html: string): string {
  const el = document.createElement('div')
  vSanitize.mounted!(el, { value: html } as any, null as any, null as any)
  return el.innerHTML
}

describe('vSanitize directive', () => {
  it('keeps safe markup', () => {
    expect(applyMounted('<strong>hi</strong> <em>there</em>')).toContain('<strong>hi</strong>')
  })
  it('strips <script> tags', () => {
    const out = applyMounted('<p>ok</p><script>alert(1)</script>')
    expect(out).not.toContain('<script>')
    expect(out).toContain('<p>ok</p>')
  })
  it('strips inline event handlers', () => {
    expect(applyMounted('<img src=x onerror="alert(1)">')).not.toContain('onerror')
  })
  it('adds rel=noopener to target=_blank links', () => {
    expect(applyMounted('<a href="https://x.com" target="_blank">x</a>'))
      .toContain('rel="noopener noreferrer"')
  })
  it('re-sanitizes on update', () => {
    const el = document.createElement('div')
    vSanitize.mounted!(el, { value: '<p>a</p>' } as any, null as any, null as any)
    vSanitize.updated!(el, { value: '<p>b</p><script>x</script>', oldValue: '<p>a</p>' } as any, null as any, null as any)
    expect(el.innerHTML).toContain('<p>b</p>')
    expect(el.innerHTML).not.toContain('<script>')
  })
})
