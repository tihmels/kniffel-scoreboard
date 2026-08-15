import { describe, expect, it } from 'vitest'
import { shortLabels } from './labels'

describe('shortLabels', () => {
  it('uses two letters when that already separates everyone', () => {
    expect(shortLabels(['Ann', 'Bo', 'Cem'])).toEqual(['AN', 'BO', 'CE'])
  })

  it('widens every label until the clashing names come apart', () => {
    expect(shortLabels(['Marie', 'Martin', 'Bo'])).toEqual([
      'MARI',
      'MART',
      'BO',
    ])
  })

  it('numbers players who really do share a name', () => {
    expect(shortLabels(['Jan', 'Jan', 'Bo'])).toEqual(['JA1', 'JA2', 'BO'])
  })

  it('leaves distinguishable names unnumbered next to a duplicate pair', () => {
    expect(shortLabels(['Jan', 'Jan', 'Ute'])).toEqual(['JA1', 'JA2', 'UTE'])
  })

  it('holds up for a full table', () => {
    const labels = shortLabels([
      'Ann',
      'Bo',
      'Cem',
      'Dora',
      'Emil',
      'Frida',
      'Gus',
      'Hana',
    ])
    expect(new Set(labels).size).toBe(8)
  })
})
