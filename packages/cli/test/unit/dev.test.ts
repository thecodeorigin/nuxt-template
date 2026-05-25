import { describe, expect, it } from 'vitest'
import { splitChunk } from '../../src/commands/dev'

describe('splitChunk', () => {
  it('splits complete lines and carries the trailing partial', () => {
    const { lines, carry } = splitChunk('', 'a\nb\nc')
    expect(lines).toEqual(['a', 'b'])
    expect(carry).toBe('c')
  })

  it('prepends the previous carry to the next chunk', () => {
    const first = splitChunk('', 'hel')
    expect(first.lines).toEqual([])
    expect(first.carry).toBe('hel')
    const second = splitChunk(first.carry, 'lo\nworld')
    expect(second.lines).toEqual(['hello'])
    expect(second.carry).toBe('world')
  })

  it('emits an empty carry when the chunk ends on a newline', () => {
    const { lines, carry } = splitChunk('', 'done\n')
    expect(lines).toEqual(['done'])
    expect(carry).toBe('')
  })
})
