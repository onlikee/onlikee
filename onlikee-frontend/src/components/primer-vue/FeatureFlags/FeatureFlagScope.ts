import { shallowReactive } from 'vue'
export type FeatureFlagValues = Record<string, boolean | undefined>

export class FeatureFlagScope {
  flags: Map<string, boolean>
  constructor(flags: FeatureFlagValues = {}) {
    this.flags = shallowReactive(new Map(Object.entries(flags).map(([key, value]) => [key, value ?? false])))
  }
  static create(flags?: FeatureFlagValues) { return new FeatureFlagScope(flags) }
  static merge(parent: FeatureFlagScope, child: FeatureFlagScope) {
    const scope = new FeatureFlagScope()
    scope.flags = shallowReactive(new Map([...parent.flags, ...child.flags]))
    return scope
  }
  enable(name: string) { this.flags.set(name, true) }
  disable(name: string) { this.flags.set(name, false) }
  enabled(name: string) { return this.flags.get(name) ?? false }
}
