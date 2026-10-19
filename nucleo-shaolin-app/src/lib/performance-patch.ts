'use client'

/**
 * Patch global para prevenir erro do Next.js dev server em medições de performance:
 * "Failed to execute 'measure' on 'Performance': '<ComponentName> [Prerender]' cannot have a negative time stamp."
 * Isso ocorre em desenvolvimento durante transições de Server Components ou navegações entre layouts.
 */
if (
  typeof window !== 'undefined' &&
  window.Performance &&
  !(window as unknown as { __nextPerfMeasurePatched?: boolean }).__nextPerfMeasurePatched
) {
  ;(window as unknown as { __nextPerfMeasurePatched?: boolean }).__nextPerfMeasurePatched = true
  const origMeasure = window.Performance.prototype.measure

  window.Performance.prototype.measure = function (
    this: Performance,
    metricName: string,
    startMarkOrOptions?: string | PerformanceMeasureOptions,
    endMark?: string
  ): PerformanceMeasure {
    try {
      if (startMarkOrOptions && typeof startMarkOrOptions === 'object') {
        const options = { ...startMarkOrOptions }
        if (typeof options.start === 'number' && options.start < 0) {
          options.start = 0
        }
        if (typeof options.end === 'number' && options.end < 0) {
          options.end = 0
        }
        return origMeasure.call(this, metricName, options, endMark)
      }
      return origMeasure.call(this, metricName, startMarkOrOptions, endMark)
    } catch (e: unknown) {
      const err = e as Error
      if (
        err?.message &&
        (err.message.includes('negative time stamp') ||
          err.message.includes('cannot have a negative') ||
          err.message.includes('measure'))
      ) {
        return {} as PerformanceMeasure
      }
      throw e
    }
  }
}
