import { computed, inject, unref, type ComputedRef, type InjectionKey, type MaybeRef } from 'vue'
import { isMacOS } from '@primer/behaviors/utils'

// Primer React 8c0b708: KeybindingHint/platform.ts 直译。
// Vue 适配：useSyncExternalStore → 同步快照读取（平台在运行期不会变化，React 侧的
// subscribe 也是 no-op）；PlatformOverrideContext → provide/inject。
// override 的响应性等价于 React Context：以 ref 提供时，usePlatformRef 的消费者随其
// 变化重渲染（源 platform.ts:44-62 useContext 语义）；检测值仍只计算一次（源 no-op subscribe）。

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
  return /iphone|ipad|ipod/i.test(navigator.platform) || /iphone|ipad|ipod/i.test(navigator.userAgent)
}

/** SSR-unsafe detection of Windows. */
const ssrUnsafeIsWindows = () => {
  if (typeof navigator === 'undefined') return false
  return /^win/i.test(navigator.platform)
}

const getSnapshot = (): Platform => {
  // behaviors 的 isMacOS 直接引用 window —— SSR 下跳过（React 由 getServerSnapshot 承担）
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
export const PLATFORM_OVERRIDE_KEY: InjectionKey<MaybeRef<Platform | null>> = Symbol('PlatformOverride')

/**
 * 响应式平台类别（Vue 适配：等价于源 usePlatform 在 render 中读 Context ——
 * override 以 ref 提供且变化时，依赖它的计算属性/渲染随之更新）。
 * 检测值只在 setup 时计算一次：与源一致（源 platform.ts:14-16 subscribe 为 no-op，
 * "The platform never changes at runtime"）。
 */
export function usePlatformRef(): ComputedRef<Platform> {
  const override = inject(PLATFORM_OVERRIDE_KEY, null)
  const detected = typeof window === 'undefined' ? getServerSnapshot() : getSnapshot()
  return computed(() => unref(override) ?? detected)
}

/** Vue 适配：以 provide(PLATFORM_OVERRIDE_KEY, platform) 替代 React 的 PlatformOverrideProvider。
 *  同步快照版（保持既有签名，供 KeybindingHint 之外的既有调用方使用）；
 *  等价于在 React render 中读取一次 usePlatform() 的返回值。 */
export function usePlatform(): Platform {
  return usePlatformRef().value
}
