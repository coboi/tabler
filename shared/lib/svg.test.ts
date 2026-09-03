import { describe, expect, it } from 'vitest'
import { iconSvg, iconSourceComment } from './svg'

describe('iconSvg', () => {
  it('returns the processed outline svg with a11y attributes and the given classes', () => {
    const svg = iconSvg('chevron-left', { classes: 'icon icon-sm' })
    expect(svg).toContain('<svg ')
    expect(svg).toContain('aria-hidden="true" focusable="false" class="icon icon-sm"')
  })

  it('strips the 24x24 filler path', () => {
    expect(iconSvg('chevron-left')).not.toContain('M0 0h24v24H0z')
  })

  it('defaults to the "icon" class', () => {
    expect(iconSvg('chevron-left')).toContain('class="icon"')
  })

  it('picks the filled variant when requested', () => {
    const outline = iconSvg('heart')
    const filled = iconSvg('heart', { filled: true })
    expect(filled).toBeTruthy()
    expect(filled).not.toBe(outline)
  })

  it('returns undefined for an unknown icon', () => {
    expect(iconSvg('definitely-not-an-icon')).toBeUndefined()
  })
})

describe('iconSourceComment', () => {
  it('links the tabler.io icon page', () => {
    expect(iconSourceComment('heart')).toBe('<!-- Download SVG icon from http://tabler.io/icons/icon/heart -->')
  })
})
