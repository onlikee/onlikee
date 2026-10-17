/* eslint-disable vue/one-component-per-file -- The private body provider scopes the public Table.Group children. */
import { defineComponent, h, provide, useId, Fragment, type PropType } from 'vue'
import { VisuallyHidden } from '../VisuallyHidden'
import { TableRow } from './Table'
import { tableGroupContext } from './context'
import classes from './Table.module.css'
export interface TableGroupProps {
  className?: string
  id: string | number
  label: string
  rowCount: number
  colSpan: number
  'aria-label'?: string
}
const GroupBody = defineComponent({
  name: 'TableGroupBody',
  props: { headerId: { type: String, required: true } },
  setup(props, { slots }) {
    provide(tableGroupContext, { headerId: props.headerId })
    return () => slots.default?.()
  },
})
export const TableGroup = defineComponent({
  name: 'TableGroup',
  inheritAttrs: false,
  props: {
    id: { type: [String, Number] as PropType<string | number>, required: true },
    label: { type: String, required: true },
    rowCount: { type: Number, required: true },
    colSpan: { type: Number, required: true },
    className: { type: String, default: undefined },
  },
  setup(props, { attrs, slots }) {
    const headerId = useId()
    const css = (name: string) => [name, classes[name]]
    return () =>
      h(Fragment, [
        h(
          'tbody',
          {
            class: [css('TableGroupHeaderBody'), props.className, attrs.class],
            role: 'rowgroup',
            'data-component': 'Table.Group',
            'data-group-id': props.id,
          },
          [
            h(TableRow, null, {
              default: () =>
                h(
                  'th',
                  {
                    id: headerId,
                    class: css('TableGroupHeaderCell'),
                    scope: 'colgroup',
                    colspan: props.colSpan,
                    role: 'columnheader',
                    'aria-label': attrs['aria-label'],
                    'data-component': 'Table.Group.Header',
                  },
                  [
                    h('span', { class: css('TableGroupHeaderContent') }, [
                      h('span', { class: css('TableGroupHeaderLabel') }, [
                        props.label,
                        h(VisuallyHidden, null, { default: () => ',' }),
                      ]),
                      h('span', { class: css('TableGroupHeaderCount') }, [
                        props.rowCount,
                        h(VisuallyHidden, null, {
                          default: () => (props.rowCount === 1 ? ' row' : ' rows'),
                        }),
                      ]),
                    ]),
                  ],
                ),
            }),
          ],
        ),
        h(
          'tbody',
          {
            class: css('TableBody'),
            role: 'rowgroup',
            'data-component': 'Table.Group.Body',
            'data-group-id': props.id,
          },
          [h(GroupBody, { headerId }, slots)],
        ),
      ])
  },
})
