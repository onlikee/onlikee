import { computed, inject, unref, type ComputedRef, type InjectionKey, type MaybeRef } from 'vue'
import { isMacOS } from '@primer/behaviors/utils'

/**
 * The platform categories that affect how keyboard shortcut keys are displayed.
 *
 * - `apple`: Apple platforms (macOS and iOS/iPadOS), which use the Command and Option keys.
 * - `windows`: Windows, which uses the Windows (Meta) key.
 * - `other`: Any other platform (e.g. Linux, Android), where the Meta key does not map to a
 *   consistent label.
 */
export type Platform = 'apple' | 'windows' | 'other'

/** SSR-unsafe detection of iOS/iPadOS (in addition to macOS, which is detected separately). */
const ssrUnsafeIsIOS = () => {
  if (typeof navigator === 'undefined') return false
  return (
    /iphone|ipad|ipod/i.test(navigator.platform) || /iphone|ipad|ipod/i.test(navigator.userAgent)
  )
}

/** SSR-unsafe detection of Windows. */
const ssrUnsafeIsWindows = () => {
  if (typeof navigator === 'undefined') return false
  return /^win/i.test(navigator.platform)
}

const getSnapshot = (): Platform => {
  if ((typeof window !== 'undefined' && isMacOS()) || ssrUnsafeIsIOS()) return 'apple'
  if (ssrUnsafeIsWindows()) return 'windows'
  return 'other'
}

// Safe default for SSR since we can't detect the platform on the server.
const getServerSnapshot = (): Platform => 'other'

/**
 * Allows overriding the detected platform. This is primarily intended for testing and
 * Storybook, where we want to preview how keyboard hints render on platforms other than the
 * one actually running. A `null` value (the default) means "use the detected platform".
 */
export const PLATFORM_OVERRIDE_KEY: InjectionKey<MaybeRef<Platform | null>> =
  Symbol('PlatformOverride')

export function usePlatformRef(): ComputedRef<Platform> {
  const override = inject(PLATFORM_OVERRIDE_KEY, null)
  const detected = typeof window === 'undefined' ? getServerSnapshot() : getSnapshot()
  return computed(() => unref(override) ?? detected)
}

export function usePlatform(): Platform {
  return usePlatformRef().value
}
