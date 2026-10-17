import type { RouteRecordRaw } from 'vue-router'

export const componentRoutes: Array<RouteRecordRaw> = [
  {
    path: '/component',
    name: 'Component',
    component: () => import('../views/components.vue'),
  },
  {
    path: '/component',
    component: () => import('../layout/ComponentLayout.vue'),
    children: [
      {
        path: 'guide',
        name: 'Guide',
        component: () => import('../views/components/guide.vue'),
      },
      {
        path: 'overview',
        name: 'Overview',
        component: () => import('../views/components/overview.vue'),
      },
      {
        path: 'color',
        name: 'Color',
        component: () => import('../views/components/color.vue'),
      },
      // Icon
      {
        path: 'octicons-vue',
        name: 'OcticonsVue',
        component: () => import('../views/components/octicons-vue.vue'),
      },
      // Basic
      {
        path: 'anchored-overlay',
        name: 'AnchoredOverlay',
        component: () => import('../views/components/anchored-overlay.vue'),
      },
      {
        path: 'action-menu',
        name: 'ActionMenu',
        component: () => import('../views/components/action-menu.vue'),
      },
      {
        path: 'action-bar',
        name: 'ActionBar',
        component: () => import('../views/components/action-bar.vue'),
      },
      {
        path: 'stack',
        name: 'Stack',
        component: () => import('../views/components/stack.vue'),
      },
      {
        path: 'container',
        name: 'Container',
        component: () => import('../views/components/container.vue'),
      },
      {
        path: 'button',
        name: 'Button',
        component: () => import('../views/components/button.vue'),
      },
      {
        path: 'button-group',
        name: 'ButtonGroup',
        component: () => import('../views/components/button-group.vue'),
      },
      {
        path: 'branch-name',
        name: 'BranchName',
        component: () => import('../views/components/branch-name.vue'),
      },
      {
        path: 'counter-label',
        name: 'CounterLabel',
        component: () => import('../views/components/counter-label.vue'),
      },
      {
        path: 'link',
        name: 'Link',
        component: () => import('../views/components/link.vue'),
      },
      {
        path: 'truncate',
        name: 'Truncate',
        component: () => import('../views/components/truncate.vue'),
      },
      {
        path: 'label',
        name: 'Label',
        component: () => import('../views/components/label.vue'),
      },
      {
        path: 'label-group',
        name: 'LabelGroup',
        component: () => import('../views/components/label-group.vue'),
      },
      {
        path: 'relative-time',
        name: 'RelativeTime',
        component: () => import('../views/components/relative-time.vue'),
      },
      {
        path: 'heading',
        name: 'Heading',
        component: () => import('../views/components/heading.vue'),
      },
      {
        path: 'text',
        name: 'Text',
        component: () => import('../views/components/text.vue'),
      },
      {
        path: 'divider',
        name: 'Divider',
        component: () => import('../views/components/divider.vue'),
      },
      {
        path: 'avatar',
        name: 'Avatar',
        component: () => import('../views/components/avatar.vue'),
      },
      {
        path: 'avatar-stack',
        name: 'AvatarStack',
        component: () => import('../views/components/avatar-stack.vue'),
      },
      {
        path: 'circle-badge',
        name: 'CircleBadge',
        component: () => import('../views/components/circle-badge.vue'),
      },
      {
        path: 'action-list',
        name: 'ActionList',
        component: () => import('../views/components/action-list.vue'),
      },
      {
        path: 'tag',
        name: 'Tag',
        component: () => import('../views/components/tag.vue'),
      },
      // Form
      {
        path: 'form-control',
        name: 'FormControl',
        component: () => import('../views/components/form-control.vue'),
      },
      {
        path: 'input',
        redirect: '/component/text-input',
      },
      {
        path: 'text-input',
        name: 'TextInput',
        component: () => import('../views/components/text-input.vue'),
      },
      {
        path: 'textarea',
        name: 'Textarea',
        component: () => import('../views/components/textarea.vue'),
      },
      {
        path: 'select',
        name: 'Select',
        component: () => import('../views/components/select.vue'),
      },
      {
        path: 'checkbox',
        name: 'Checkbox',
        component: () => import('../views/components/checkbox.vue'),
      },
      {
        path: 'autocomplete',
        name: 'Autocomplete',
        component: () => import('../views/components/autocomplete.vue'),
      },
      {
        path: 'text-input-with-tokens',
        name: 'TextInputWithTokens',
        component: () => import('../views/components/text-input-with-tokens.vue'),
      },
      {
        path: 'select-panel',
        name: 'SelectPanel',
        component: () => import('../views/components/select-panel.vue'),
      },
      {
        path: 'radio',
        name: 'Radio',
        component: () => import('../views/components/radio.vue'),
      },
      {
        path: 'radio-group',
        name: 'RadioGroup',
        component: () => import('../views/components/radio-group.vue'),
      },
      {
        path: 'upload',
        name: 'Upload',
        component: () => import('../views/components/upload.vue'),
      },
      {
        path: 'image-upload',
        name: 'ImageUpload',
        component: () => import('../views/components/image-upload.vue'),
      },
      // Data
      {
        path: 'card',
        name: 'Card',
        component: () => import('../views/components/card.vue'),
      },
      {
        path: 'data-table',
        alias: 'table',
        name: 'DataTable',
        component: () => import('../views/components/data-table.vue'),
      },
      {
        path: 'timeline',
        name: 'Timeline',
        component: () => import('../views/components/timeline.vue'),
      },
      // Navigation
      {
        path: 'breadcrumbs',
        name: 'Breadcrumbs',
        component: () => import('../views/components/breadcrumbs.vue'),
      },
      {
        path: 'steps',
        name: 'Steps',
        component: () => import('../views/components/steps.vue'),
      },
      {
        path: 'underline-nav',
        name: 'UnderlineNav',
        component: () => import('../views/components/underline-nav.vue'),
      },
      {
        path: 'underline-panels',
        name: 'UnderlinePanels',
        component: () => import('../views/components/underline-panels.vue'),
      },
      // Feedback 反馈组件
      {
        path: 'progress-bar',
        name: 'ProgressBar',
        component: () => import('../views/components/progress-bar.vue'),
      },
      {
        path: 'skeleton',
        name: 'Skeleton',
        component: () => import('../views/components/skeleton.vue'),
      },
      {
        path: 'skeleton-text',
        name: 'SkeletonText',
        component: () => import('../views/components/skeleton-text.vue'),
      },
      {
        path: 'spinner',
        name: 'Spinner',
        component: () => import('../views/components/spinner.vue'),
      },
      {
        path: 'admonition',
        name: 'Admonition',
        component: () => import('../views/components/admonition.vue'),
      },
      {
        path: 'blankslate',
        name: 'Blankslate',
        component: () => import('../views/components/blankslate.vue'),
      },
      {
        path: 'dialog',
        name: 'Dialog',
        component: () => import('../views/components/dialog.vue'),
      },
      {
        path: 'confirmation-dialog',
        name: 'ConfirmationDialog',
        component: () => import('../views/components/confirmation-dialog.vue'),
      },
      {
        path: 'banner',
        name: 'Banner',
        component: () => import('../views/components/banner.vue'),
      },
      {
        path: 'tooltip',
        name: 'Tooltip',
        component: () => import('../views/components/tooltip.vue'),
      },
    ],
  },
]
