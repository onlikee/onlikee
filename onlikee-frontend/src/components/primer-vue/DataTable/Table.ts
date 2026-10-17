/* eslint-disable vue/one-component-per-file -- The compound Table API shares small semantic primitives. */
import {
  defineComponent,
  h,
  inject,
  mergeProps,
  provide,
  type Component,
  type CSSProperties,
  type FunctionalComponent,
  type HTMLAttributes,
  type NativeElements,
  type PropType,
  type TableHTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from 'vue'
import { SortAscIcon, SortDescIcon } from '@onlikee/octicons-vue'
import { Text } from '../Text'
import { ScrollableRegion } from '../ScrollableRegion'
import type { CellAlignment } from './column'
import type { SortDirection } from './sorting'
import { tableGroupContext } from './context'
import classes from './Table.module.css'

export interface TableProps extends TableHTMLAttributes {
  gridTemplateColumns?: CSSProperties['gridTemplateColumns']
  cellPadding?: 'condensed' | 'normal' | 'spacious'
  className?: string
}
export interface TableInstance {
  element: HTMLTableElement | null
}
export type TableHeadProps = HTMLAttributes
export type TableBodyProps = HTMLAttributes
export type TableRowProps = HTMLAttributes
export interface TableHeaderProps extends Omit<ThHTMLAttributes, 'align'> {
  align?: CellAlignment
}
export interface TableSortHeaderProps extends TableHeaderProps {
  direction: SortDirection
  onToggleSort?: () => void
}
export interface TableCellProps extends Omit<TdHTMLAttributes, 'align'> {
  align?: CellAlignment
  scope?: 'row'
}
type ElementProps<As> = As extends keyof NativeElements
  ? NativeElements[As]
  : As extends new (...args: never[]) => { $props: infer Props }
    ? Props
    : As extends FunctionalComponent<infer Props>
      ? Props
      : HTMLAttributes
export type TableContainerProps<As extends string | Component = 'div'> = {
  as?: As
  className?: string
} & Omit<ElementProps<As>, 'as' | 'className'>
export interface TableTitleProps extends HTMLAttributes {
  as?: string | Component
  id: string
}
export type TableSubtitleProps = TableTitleProps
export type TableActionsProps = HTMLAttributes
const classNames = (name: string, className?: unknown) => [name, classes[name], className]

export const Table = defineComponent({
  name: 'PrimerTable',
  inheritAttrs: false,
  props: {
    cellPadding: { type: String as PropType<TableProps['cellPadding']>, default: 'normal' },
    gridTemplateColumns: {
      type: [String, Number] as PropType<TableProps['gridTemplateColumns']>,
      default: undefined,
    },
    className: { type: String, default: undefined },
  },
  setup(props, { attrs, slots, expose }) {
    provide(tableGroupContext, undefined)
    let element: HTMLTableElement | null = null
    expose({
      get element() {
        return element
      },
    })
    return () =>
      h(
        ScrollableRegion,
        // @ts-expect-error The reference Table also permits an unlabeled overflow region for compatibility.
        {
          'aria-labelledby': attrs['aria-labelledby'] as string | undefined,
          class: classNames('TableOverflowWrapper'),
        },
        {
          default: () =>
            h(
              'table',
              mergeProps(attrs, {
                ref: (value: unknown) => {
                  element = value as HTMLTableElement | null
                },
                class: classNames('Table', props.className),
                role: 'table',
                'data-cell-padding': props.cellPadding,
                'data-component': 'Table',
                style: { '--grid-template-columns': props.gridTemplateColumns } as CSSProperties,
              }),
              slots.default?.(),
            ),
        },
      )
  },
})
function structural(name: string, tag: string, role?: string) {
  return defineComponent({
    name,
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () =>
        h(
          tag,
          mergeProps(attrs, {
            class: classNames(name),
            role,
            'data-component': `Table.${name.slice(5)}`,
          }),
          slots.default?.(),
        )
    },
  })
}
export const TableHead = structural('TableHead', 'thead', 'rowgroup')
export const TableBody = structural('TableBody', 'tbody', 'rowgroup')
export const TableRow = structural('TableRow', 'tr', 'row')
export const TableActions = structural('TableActions', 'div')
export const TableDivider = structural('TableDivider', 'div', 'presentation')
export const TableHeader = defineComponent({
  name: 'TableHeader',
  inheritAttrs: false,
  props: { align: { type: String as PropType<CellAlignment>, default: undefined } },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        'th',
        mergeProps({ 'data-component': 'Table.Header' }, attrs, {
          class: classNames('TableHeader'),
          role: 'columnheader',
          scope: 'col',
          'data-cell-align': props.align,
        }),
        slots.default?.(),
      )
  },
})
export const TableSortHeader = defineComponent({
  name: 'TableSortHeader',
  inheritAttrs: false,
  props: {
    align: { type: String as PropType<CellAlignment>, default: undefined },
    direction: { type: String as PropType<SortDirection>, required: true },
  },
  emits: { 'toggle-sort': () => true },
  setup(props, { attrs, slots, emit }) {
    return () =>
      h(
        TableHeader,
        {
          ...attrs,
          align: props.align,
          'aria-sort':
            props.direction === 'DESC'
              ? 'descending'
              : props.direction === 'ASC'
                ? 'ascending'
                : undefined,
          'data-component': 'Table.SortHeader',
        },
        {
          default: () =>
            h(
              'button',
              {
                type: 'button',
                class: classNames('TableSortButton'),
                'data-component': 'Table.SortHeader.Button',
                'aria-description':
                  props.direction === 'ASC' ? 'Sort descending' : 'Sort ascending',
                onClick: () => emit('toggle-sort'),
              },
              [
                slots.default?.(),
                h(props.direction === 'DESC' ? SortDescIcon : SortAscIcon, {
                  'aria-hidden': 'true',
                  class: [
                    ...classNames('TableSortIcon'),
                    ...classNames(
                      props.direction === 'DESC'
                        ? 'TableSortIcon--descending'
                        : 'TableSortIcon--ascending',
                    ),
                  ],
                }),
              ],
            ),
        },
      )
  },
})
export const TableCell = defineComponent({
  name: 'TableCell',
  inheritAttrs: false,
  props: {
    align: { type: String as PropType<CellAlignment>, default: undefined },
    scope: { type: String as PropType<'row'>, default: undefined },
    headers: { type: String, default: undefined },
    className: { type: String, default: undefined },
  },
  setup(props, { attrs, slots }) {
    const group = inject(tableGroupContext, undefined)
    return () =>
      h(
        props.scope ? 'th' : 'td',
        mergeProps(attrs, {
          class: classNames('TableCell', props.className),
          scope: props.scope,
          role: props.scope ? 'rowheader' : 'cell',
          'data-cell-align': props.align,
          'data-component': 'Table.Cell',
          headers: [group?.headerId, props.headers].filter(Boolean).join(' ') || undefined,
        }),
        slots.default?.(),
      )
  },
})
export const TableCellPlaceholder = defineComponent({
  name: 'TableCellPlaceholder',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        Text,
        mergeProps(attrs, {
          class: classes.PlaceholderText,
          'data-component': 'Table.CellPlaceholder',
        }),
        slots,
      )
  },
})
export const TableContainer = defineComponent({
  name: 'TableContainer',
  inheritAttrs: false,
  props: {
    as: { type: [String, Object, Function] as PropType<string | Component>, default: 'div' },
    className: { type: String, default: undefined },
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        props.as,
        mergeProps(attrs, {
          class: [classes.TableContainer, props.className],
          'data-component': 'Table.Container',
        }),
        typeof props.as === 'string' ? slots.default?.() : slots,
      )
  },
})
function heading(name: string, defaultTag: string) {
  return defineComponent({
    name,
    inheritAttrs: false,
    props: {
      as: { type: [String, Object, Function] as PropType<string | Component>, default: defaultTag },
      id: { type: String, required: true },
    },
    setup(props, { attrs, slots }) {
      return () =>
        h(
          props.as,
          mergeProps(attrs, {
            class: classNames(name),
            id: props.id,
            'data-component': `Table.${name.slice(5)}`,
          }),
          typeof props.as === 'string' ? slots.default?.() : slots,
        )
    },
  })
}
export const TableTitle = heading('TableTitle', 'h2')
export const TableSubtitle = heading('TableSubtitle', 'div')
