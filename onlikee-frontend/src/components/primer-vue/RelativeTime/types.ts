import type { HTMLAttributes } from 'vue'
import type { RelativeTimeElement } from '@github/relative-time-element'

export interface RelativeTimeOptions {
  date?: Date | null
  datetime?: string
  format?: 'datetime' | 'relative' | 'duration' | 'auto' | 'micro' | 'elapsed'
  tense?: 'auto' | 'past' | 'future'
  precision?: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'
  threshold?: string
  prefix?: string
  formatStyle?: 'long' | 'short' | 'narrow'
  second?: Intl.DateTimeFormatOptions['second']
  minute?: Intl.DateTimeFormatOptions['minute']
  hour?: Intl.DateTimeFormatOptions['hour']
  weekday?: Intl.DateTimeFormatOptions['weekday']
  day?: Intl.DateTimeFormatOptions['day']
  month?: Intl.DateTimeFormatOptions['month']
  year?: Intl.DateTimeFormatOptions['year']
  timeZoneName?: Intl.DateTimeFormatOptions['timeZoneName']
  timeZone?: string
  noTitle?: boolean
  className?: string
  onRelativeTimeUpdated?: RelativeTimeElement['onRelativeTimeUpdated']
}
type NativeAttributes = {
  [Key in keyof HTMLAttributes as string extends Key ? never : Key]: HTMLAttributes[Key]
} & { [Name in `data-${string}`]?: string | number | boolean }

export type RelativeTimeProps = RelativeTimeOptions & NativeAttributes
export interface RelativeTimeInstance {
  element: RelativeTimeElement | null
  update: () => ReturnType<RelativeTimeElement['update']> | undefined
}
