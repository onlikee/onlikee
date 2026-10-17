# React → Vue parity map

Reference: the read-only checkout at `C:/Users/25336/Desktop/project/react`,
commit `8c0b708fc`, under `packages/react/src`. Reference source, tests, CSS
modules and `DataTable.accessibility.md` define the behavior; Stories define the
composition examples. This is a direct API migration, without a legacy table adapter.

## Runtime call chain

```text
DataTable → useTable → column / row / sorting / layout / ObjectPaths
         → Table → ScrollableRegion → ResizeObserver
                 → Text / VisuallyHidden / reset buttons / sort icons
         → Table.Group → group context → Table.Cell headers
Table.Skeleton → column layout / SkeletonText → SkeletonBox
Table.Pagination → pagination model / VisuallyHidden / AriaStatus
Table.ErrorDialog → ConfirmationDialog → Dialog → Button / Portal / focus management
Row actions → ActionMenu → ActionList / AnchoredOverlay → Overlay / Portal
            → IconButton → Tooltip / KeybindingHint / Spinner / CounterLabel
Rich cells → Label / LabelGroup → AnchoredOverlay / Button / IconButton
           → RelativeTime / Link / Text
Empty results → Blankslate → Button / Link
```

Imports through a barrel are resolved to the symbols actually used. In particular,
`Pagination/model.tsx` does not require porting the standalone Pagination component.
The source's internal Overlay maps to `internal/components/Overlay.vue`; its
TooltipV2 maps to the existing public Vue Tooltip. React-specific hooks are
translated to Vue composables and lifecycle cleanup, rather than exported as a
second React-like runtime.

## Implementation and verification

Paths in the middle column are relative to `src/components/primer-vue`.

| Reference area                                   | Vue implementation                                             | Behavioral evidence                                                                                                                                                 |
| ------------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DataTable, column, row, useTable, sorting, utils | `DataTable/` models and generic SFC                            | `DataTable.test.ts`, `sorting.test.ts`, `utils.types.test.ts`, `DataTable.types.test.vue`                                                                           |
| Table primitives and TableGroup                  | `DataTable/Table.ts`, `TableGroup.ts`, shared CSS              | Table composition and grouped/mixed-body tests in `DataTable.test.ts`; native `scope`, spanning headers, row/column/group references, nested isolation              |
| Group ID generation                              | Vue `useId` and scoped injection                               | `DataTable.ssr.test.ts`, `DataTable.hydration.test.ts`; multiple instances and reference graphs                                                                     |
| Table Skeleton                                   | `DataTable/TableSkeleton.vue`                                  | Table skeleton tests; shared column-width model                                                                                                                     |
| Pagination and pagination model                  | `DataTable/Pagination.vue`, `paginationModel.ts`               | `Pagination.test.ts`; default-index changes, boundary controls, truncation, responsive markers and one callback per change                                          |
| ErrorDialog                                      | `DataTable/ErrorDialog.vue`                                    | `ErrorDialog.test.ts`; retry/dismiss/escape paths through the real ConfirmationDialog                                                                               |
| ScrollableRegion                                 | `ScrollableRegion/`                                            | Its tests cover overflow-only landmark/focusability, resize updates, native attributes and observer cleanup                                                         |
| SkeletonBox, SkeletonText                        | `Skeleton/`, `SkeletonText/`                                   | Delay/unmount, line/size/width, style forwarding and server-rendering tests                                                                                         |
| Heading, Label                                   | `Heading/`, `Label/`                                           | Native element/attribute/ref and source variant/default tests                                                                                                       |
| LabelGroup                                       | `LabelGroup/`                                                  | Numeric/automatic truncation, inline/overlay expansion, focus restoration, cleanup and SSR tests                                                                    |
| RelativeTime                                     | `RelativeTime/`                                                | Browser wrapper and SSR tests; upstream `@github/relative-time-element` 5.x supplies relative-time formatting/update behavior                                       |
| ActionMenu                                       | existing `ActionMenu/`                                         | `ActionMenu.test.ts`, `ActionMenu.ssr.test.ts`; controlled state, nested menus, trigger wrappers, keyboard selection and focus return                               |
| ActionList                                       | existing `ActionList/`                                         | `ActionList.test.ts`, `ActionList.contract.test.ts`; selection roles, disabled/loading/inactive items, visuals, descriptions, groups and trailing actions           |
| AnchoredOverlay and internal Overlay             | existing `AnchoredOverlay/`, `internal/components/Overlay.vue` | AnchoredOverlay behavior/type tests and internal Overlay tests; anchor placement, dismissal, focus, responsive variants and portals                                 |
| Button, ButtonBase, IconButton, LinkButton       | existing `Button/`                                             | Button behavior, SSR and type tests; render targets, loading/inactive/disabled, visuals, counters and tooltip integration                                           |
| ConfirmationDialog, Dialog                       | existing `ConfirmationDialog/`, `Dialog/`                      | Existing behavior/type tests plus Table.ErrorDialog tests; close gestures, footer focus, loading buttons and nested focus handling                                  |
| Portal and FeatureFlags                          | existing `Portal/`, `FeatureFlags/`                            | Existing tests; scoped context, registered roots, container updates, SSR and feature overrides                                                                      |
| Tooltip                                          | existing `Tooltip/`                                            | Behavior, SSR and CSS tests; trigger refs, ARIA associations, display/dismiss timing, wrapping and reduced motion                                                   |
| Blankslate                                       | existing `Blankslate/`                                         | Behavior/type tests; sizes, labels, attributes, primary/secondary actions and source composition                                                                    |
| CounterLabel                                     | existing `CounterLabel/`                                       | Behavior/type tests; visual count, spoken count, default variant and attribute forwarding                                                                           |
| KeybindingHint                                   | existing `KeybindingHint/`                                     | Existing keyboard-hint coverage; source names, sequences, platform rendering and hidden spoken text                                                                 |
| Spinner                                          | existing `Spinner/`                                            | Added `Spinner.test.ts` and `Spinner.ssr.test.ts`; delays, cleanup, labeling, styling and SSR safety                                                                |
| Text, Link, both VisuallyHidden variants         | existing implementations                                       | Added `internal/components/PresentationContracts.test.ts` plus existing Link coverage; native attributes/events/refs, polymorphic elements and visibility overrides |

Auditing existing components does not imply rewriting implementations that already
match the reference. Discovered corrections include Spinner's SSR-unsafe delay,
SVG `className`/style forwarding, and the internal hidden-text `className` prop.
Public VisuallyHidden and Spinner prop types are now exported.

## Framework adaptations

- React children/render props become default slots or callbacks returning Vue
  `VNodeChild`; no JSX transform is required for consumers.
- Compound names (`Table.Container`, etc.) are component properties; individual
  exports are also available. The low-level Table is distinct from DataTable.
- `toggle-sort(columnId, direction)` and pagination `change({pageIndex})` are Vue
  emitted events. Source-style `onToggleSort`/`onChange` listeners work through
  Vue's event system and are not invoked a second time manually.
- Native hyphenated ARIA props are accepted; Vue camel-cased prop declarations
  account for runtime prop normalization.
- Pagination remains consumer-owned. It does not slice DataTable data or move
  rows across group boundaries. The supplied page determines each group count.
- Initial sort props describe already-ordered input. The table does not perform
  an extra initial sort that the reference does not perform.
- RelativeTime registers its custom element after mounting, retaining the
  reference's deterministic English/UTC date fallback in server markup.
- CSS Modules use the project's existing design tokens and preserve the source
  table grid, density, logical alignment, grouping and responsive pagination rules.
- A missing intermediate object in a nested field path resolves to `undefined`,
  so optional nested data follows the blank-cell/sort behavior instead of throwing
  the reference implementation's raw property-access error.

## Documentation and verification commands

The DataTable documentation reproduces the source combinations with deterministic
data and locally controlled loading/error transitions. Other component API tables
use the canonical `Column<Data>` interface and stable row IDs. The route remains
`/component/data-table`, with `/component/table` as a compatibility URL alias.

```text
npm run build
npm run typecheck:test
npm run test:run -- --reporter=dot
```

Focused tests and formatting/lint checks should also be run for modified files.
Actual viewport, theme and assistive-technology checks are separate from jsdom
and SSR tests: test success alone does not establish browser layout or screen
reader navigation parity. Record unavailable checks explicitly when handing off.

Implementation verification: 79 test files / 877 tests passed; application build,
test type checking and ESLint across all 114 changed TypeScript/Vue files passed.
The reference React checkout remains unchanged. No browser connection was
available for screenshot comparisons or native keyboard-activation checks;
those checks, along with manual assistive-technology navigation, remain unverified.
