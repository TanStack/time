import { describe, expect, it } from 'vitest'
import {
  analyzeOverlaps,
  cascadeStrategy,
  columnsStrategy,
  expandStrategy,
  layoutDaySegments,
  toLayoutStyle,
  type EventLayout,
  type LayoutInputEvent,
  type LayoutOrientation,
  type LayoutStrategyFn,
  type LayoutStyle,
} from '../layout'

const seg = (id: string, start: string, end: string): LayoutInputEvent => ({
  id,
  start: `2025-06-03T${start}:00`,
  end: `2025-06-03T${end}:00`,
})

const byId = (layouts: Array<EventLayout>) => new Map(layouts.map((l) => [l.id, l]))

const layoutFixture = (overrides: Partial<EventLayout> = {}): EventLayout => ({
  id: 'a',
  index: 0,
  startFraction: 0.25,
  endFraction: 0.5,
  durationFraction: 0.25,
  overlapping: [],
  concurrency: 1,
  depth: 0,
  cluster: 0,
  clusterSize: 1,
  clusterDepth: 0,
  clusterConcurrency: 1,
  column: 0,
  columnCount: 1,
  columnSpan: 1,
  crossStart: 0,
  crossSize: 1,
  ...overrides,
})

describe('layoutDaySegments', () => {
  it('returns fractions of the day for a single event', () => {
    const [layout] = layoutDaySegments([seg('a', '06:00', '12:00')])

    expect(layout).toEqual(layoutFixture())
  })

  it('preserves input order', () => {
    const layouts = layoutDaySegments([
      seg('late', '15:00', '16:00'),
      seg('early', '09:00', '10:00'),
    ])

    expect(layouts.map((l) => l.id)).toEqual(['late', 'early'])
  })

  it('keeps non-overlapping events in one column', () => {
    const layouts = layoutDaySegments([seg('a', '09:00', '10:00'), seg('b', '10:00', '11:00')])

    expect(layouts.map((l) => [l.column, l.columnCount])).toEqual([
      [0, 1],
      [0, 1],
    ])
  })

  it('splits two overlapping events into two columns', () => {
    const layouts = byId(
      layoutDaySegments([seg('a', '09:00', '11:00'), seg('b', '10:00', '12:00')]),
    )

    expect(layouts.get('a')).toMatchObject({ column: 0, columnCount: 2 })
    expect(layouts.get('b')).toMatchObject({ column: 1, columnCount: 2 })
  })

  it('colors a chained overlap by cluster, not by pairwise count', () => {
    const layouts = byId(
      layoutDaySegments([
        seg('a', '09:00', '10:30'),
        seg('b', '10:00', '11:30'),
        seg('c', '11:00', '12:30'),
      ]),
    )

    expect(layouts.get('a')).toMatchObject({ column: 0, columnCount: 2 })
    expect(layouts.get('b')).toMatchObject({ column: 1, columnCount: 2 })
    expect(layouts.get('c')).toMatchObject({ column: 0, columnCount: 2 })
  })

  it('reuses a freed column when an event ends', () => {
    const layouts = byId(
      layoutDaySegments([
        seg('long', '09:00', '17:00'),
        seg('first', '09:00', '10:00'),
        seg('second', '10:00', '11:00'),
      ]),
    )

    expect(layouts.get('long')).toMatchObject({ column: 0, columnCount: 2 })
    expect(layouts.get('first')).toMatchObject({ column: 1, columnCount: 2 })
    expect(layouts.get('second')).toMatchObject({ column: 1, columnCount: 2 })
  })

  it('scopes columnCount to the cluster, so a lone event stays full width', () => {
    const layouts = byId(
      layoutDaySegments([
        seg('x', '09:00', '10:00'),
        seg('y', '09:30', '10:30'),
        seg('alone', '15:00', '16:00'),
      ]),
    )

    expect(layouts.get('x')?.columnCount).toBe(2)
    expect(layouts.get('y')?.columnCount).toBe(2)
    expect(layouts.get('alone')).toMatchObject({ column: 0, columnCount: 1 })
  })

  it('treats a segment ending at midnight as the end of the day', () => {
    const [layout] = layoutDaySegments([
      { id: 'a', start: '2025-06-03T22:00:00', end: '2025-06-04T00:00:00' },
    ])

    expect(layout?.startFraction).toBeCloseTo(22 / 24)
    expect(layout?.endFraction).toBe(1)
  })

  it('returns nothing for an empty day', () => {
    expect(layoutDaySegments([])).toEqual([])
  })
})

describe('analyzeOverlaps', () => {
  it("reports how many events share each event's time", () => {
    const infos = new Map(
      analyzeOverlaps([
        seg('a', '09:00', '12:00'),
        seg('b', '10:00', '11:00'),
        seg('c', '10:30', '13:00'),
        seg('alone', '15:00', '16:00'),
      ]).map((info) => [info.id, info]),
    )

    expect(infos.get('a')).toMatchObject({
      concurrency: 3,
      overlapping: ['b', 'c'],
      depth: 0,
    })
    expect(infos.get('b')).toMatchObject({ concurrency: 3, depth: 1 })
    expect(infos.get('c')).toMatchObject({ concurrency: 3, depth: 2 })
    expect(infos.get('alone')).toMatchObject({
      concurrency: 1,
      overlapping: [],
      depth: 0,
    })
  })

  it('counts only true time overlap, not cluster membership', () => {
    const infos = new Map(
      analyzeOverlaps([
        seg('early', '09:00', '10:30'),
        seg('middle', '10:00', '11:30'),
        seg('late', '11:00', '12:30'),
      ]).map((info) => [info.id, info]),
    )

    expect(infos.get('early')).toMatchObject({
      concurrency: 2,
      overlapping: ['middle'],
      clusterSize: 3,
      clusterConcurrency: 3,
    })
    expect(infos.get('middle')).toMatchObject({
      concurrency: 3,
      overlapping: ['early', 'late'],
    })
    expect(infos.get('late')).toMatchObject({
      concurrency: 2,
      overlapping: ['middle'],
    })
  })

  it('groups events into clusters and indexes them', () => {
    const infos = analyzeOverlaps([
      seg('morning-a', '09:00', '10:00'),
      seg('morning-b', '09:30', '10:30'),
      seg('evening', '18:00', '19:00'),
    ])

    expect(infos.map((i) => [i.id, i.cluster, i.clusterSize])).toEqual([
      ['morning-a', 0, 2],
      ['morning-b', 0, 2],
      ['evening', 1, 1],
    ])
  })

  it('reports the free columns each event could absorb', () => {
    const infos = new Map(
      analyzeOverlaps([
        seg('short', '09:00', '10:00'),
        seg('long', '09:00', '14:00'),
        seg('later', '11:00', '12:00'),
      ]).map((info) => [info.id, info]),
    )

    expect(infos.get('long')).toMatchObject({
      column: 0,
      columnCount: 2,
      columnSpan: 1,
    })
    expect(infos.get('short')).toMatchObject({ column: 1, columnSpan: 1 })
    expect(infos.get('later')).toMatchObject({ column: 1, columnSpan: 1 })
  })

  it('keeps results aligned with the input array', () => {
    const infos = analyzeOverlaps([seg('late', '15:00', '16:00'), seg('early', '09:00', '10:00')])

    expect(infos.map((i) => [i.id, i.index])).toEqual([
      ['late', 0],
      ['early', 1],
    ])
  })
})

describe('custom layout strategies', () => {
  it('accepts a function of the overlap facts', () => {
    const half: LayoutStrategyFn = (info) => ({
      crossStart: 0,
      crossSize: 1 / info.concurrency,
      zIndex: info.depth,
    })

    const layouts = byId(
      layoutDaySegments(
        [seg('a', '09:00', '12:00'), seg('b', '10:00', '11:00'), seg('solo', '15:00', '16:00')],
        { strategy: half },
      ),
    )

    expect(layouts.get('a')).toMatchObject({ crossSize: 1 / 2, zIndex: 0 })
    expect(layouts.get('b')).toMatchObject({ crossSize: 1 / 2, zIndex: 1 })
    expect(layouts.get('solo')).toMatchObject({ crossSize: 1, zIndex: 0 })
  })

  it('leaves stacking to CSS when a strategy omits zIndex', () => {
    const [layout] = layoutDaySegments([seg('a', '09:00', '10:00')], {
      strategy: () => ({ crossStart: 0.1, crossSize: 0.8 }),
    })

    expect(layout).toMatchObject({ crossStart: 0.1, crossSize: 0.8 })
    expect(layout!.zIndex).toBeUndefined()
    expect(toLayoutStyle(layout!)).not.toHaveProperty('zIndex')
  })

  it('emits zIndex for every event an overlaying strategy places, bottom one included', () => {
    const styles = layoutDaySegments(
      [seg('first', '12:00', '13:00'), seg('second', '12:30', '14:00')],
      { strategy: 'cascade' },
    ).map((layout) => toLayoutStyle(layout))

    expect(styles[0]).toMatchObject({ left: '0%', width: '100%', zIndex: 0 })
    expect(styles[1]).toMatchObject({ left: '20%', width: '80%', zIndex: 1 })
  })

  it('exposes the built-ins as plain functions', () => {
    const [info] = analyzeOverlaps([seg('a', '09:00', '11:00'), seg('b', '10:00', '12:00')])

    expect(columnsStrategy(info!)).toEqual({ crossStart: 0, crossSize: 0.5 })
    expect(expandStrategy(info!)).toEqual({ crossStart: 0, crossSize: 0.5 })
    expect(cascadeStrategy({ cascadeOffset: 0.25 })(info!)).toEqual({
      crossStart: 0,
      crossSize: 1,
      zIndex: 0,
    })
  })
})

describe('layoutDaySegments strategies', () => {
  it('columns splits the track evenly', () => {
    const layouts = byId(
      layoutDaySegments(
        [seg('a', '09:00', '11:00'), seg('b', '09:30', '11:30'), seg('c', '10:00', '12:00')],
        { strategy: 'columns' },
      ),
    )

    expect(layouts.get('a')).toMatchObject({ crossStart: 0, crossSize: 1 / 3 })
    expect(layouts.get('b')).toMatchObject({
      crossStart: 1 / 3,
      crossSize: 1 / 3,
    })
    expect(layouts.get('c')).toMatchObject({
      crossStart: 2 / 3,
      crossSize: 1 / 3,
    })
  })

  it('expand lets an event absorb the free columns beside it', () => {
    const layouts = byId(
      layoutDaySegments(
        [
          seg('wide', '09:00', '10:00'),
          seg('pair-a', '11:00', '13:00'),
          seg('pair-b', '12:00', '14:00'),
        ],
        { strategy: 'expand' },
      ),
    )

    expect(layouts.get('wide')).toMatchObject({ crossStart: 0, crossSize: 1 })
    expect(layouts.get('pair-a')).toMatchObject({
      crossStart: 0,
      crossSize: 0.5,
    })
    expect(layouts.get('pair-b')).toMatchObject({
      crossStart: 0.5,
      crossSize: 0.5,
    })
  })

  it('expand keeps an event narrow when a later column is occupied', () => {
    const layouts = byId(
      layoutDaySegments([seg('a', '09:00', '10:00'), seg('b', '09:30', '10:30')], {
        strategy: 'expand',
      }),
    )

    expect(layouts.get('a')).toMatchObject({ crossStart: 0, crossSize: 0.5 })
    expect(layouts.get('b')).toMatchObject({ crossStart: 0.5, crossSize: 0.5 })
  })

  it('cascade insets and shrinks each concurrent event, stacking it on top', () => {
    const layouts = byId(
      layoutDaySegments(
        [
          seg('first', '09:00', '12:00'),
          seg('second', '09:30', '12:00'),
          seg('third', '10:00', '12:00'),
        ],
        { strategy: 'cascade', cascadeOffset: 0.2 },
      ),
    )

    expect(layouts.get('first')).toMatchObject({
      crossStart: 0,
      crossSize: 1,
      zIndex: 0,
    })
    expect(layouts.get('second')).toMatchObject({
      crossStart: 0.2,
      crossSize: 0.8,
      zIndex: 1,
    })
    expect(layouts.get('third')).toMatchObject({
      crossStart: 0.4,
      crossSize: 0.6,
      zIndex: 2,
    })
  })

  it('cascade never shrinks past minCrossSize', () => {
    const events = Array.from({ length: 6 }, (_, i) =>
      seg(`e${i}`, `09:${String(i * 5).padStart(2, '0')}`, '18:00'),
    )

    const layouts = layoutDaySegments(events, {
      strategy: 'cascade',
      cascadeOffset: 0.3,
      minCrossSize: 0.5,
    })

    expect(Math.min(...layouts.map((l) => l.crossSize))).toBe(0.5)
    expect(Math.max(...layouts.map((l) => l.crossStart))).toBe(0.5)
  })

  it('cascade leaves a lone event at full size', () => {
    const [layout] = layoutDaySegments([seg('alone', '09:00', '10:00')], {
      strategy: 'cascade',
    })

    expect(layout).toMatchObject({ crossStart: 0, crossSize: 1, zIndex: 0 })
  })
})

describe('toLayoutStyle', () => {
  it('maps the time axis to top/height when vertical', () => {
    const style: LayoutStyle = toLayoutStyle(
      layoutFixture({ columnCount: 2, crossStart: 0, crossSize: 0.5 }),
    )

    expect(style).toEqual({
      top: '25%',
      height: '25%',
      left: '0%',
      width: '50%',
    })
  })

  it('maps the time axis to left/width when horizontal', () => {
    const orientation: LayoutOrientation = 'horizontal'
    const style = toLayoutStyle(
      layoutFixture({
        column: 1,
        columnCount: 2,
        crossStart: 0.5,
        crossSize: 0.5,
        zIndex: 1,
      }),
      orientation,
    )

    expect(style).toEqual({
      left: '25%',
      width: '25%',
      top: '50%',
      height: '50%',
      zIndex: 1,
    })
  })
})
