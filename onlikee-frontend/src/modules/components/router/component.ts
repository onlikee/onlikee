import type { RouteRecordRaw } from 'vue-router'

export const componentRoutes: Array<RouteRecordRaw> = [
  {
    path: '/component',
    name: 'Component',
    component: () => import('../views/Components.vue'),
  },
  {
    path: '/component',
    component: () => import('../layout/ComponentLayout.vue'),
    children: [
      {
        path: 'guide',
        name: 'Guide',
        component: () => import('../views/components/Guide.vue'),
      },
      {
        path: 'overview',
        name: 'Overview',
        component: () => import('../views/components/Overview.vue'),
      },
      {
        path: 'color',
        name: 'Color',
        component: () => import('../views/components/Color.vue'),
      },
      // Icon
      {
        path: 'octicons-vue',
        name: 'OcticonsVue',
        component: () => import('../views/components/OcticonsVue.vue'),
      },
      // Basic
      {
        path: 'details',
        name: 'Details',
        component: () => import('../views/components/Details.vue'),
      },
      {
        path: 'popover',
        name: 'Popover',
        component: () => import('../views/components/Popover.vue'),
      },
      {
        path: 'portal',
        name: 'Portal',
        component: () => import('../views/components/Portal.vue'),
      },
      {
        path: 'overlay',
        name: 'Overlay',
        component: () => import('../views/components/Overlay.vue'),
      },
      {
        path: 'anchored-overlay',
        name: 'AnchoredOverlay',
        component: () => import('../views/components/AnchoredOverlay.vue'),
      },
      {
        path: 'action-menu',
        name: 'ActionMenu',
        component: () => import('../views/components/ActionMenu.vue'),
      },
      {
        path: 'action-bar',
        name: 'ActionBar',
        component: () => import('../views/components/ActionBar.vue'),
      },
      {
        path: 'stack',
        name: 'Stack',
        component: () => import('../views/components/Stack.vue'),
      },
      {
        path: 'split-page-layout',
        name: 'SplitPageLayout',
        component: () => import('../views/components/SplitPageLayout.vue'),
      },
      {
        path: 'state-label',
        name: 'StateLabel',
        component: () => import('../views/components/StateLabel.vue'),
      },
      {
        path: 'sub-nav',
        name: 'SubNav',
        component: () => import('../views/components/SubNav.vue'),
      },
      {
        path: 'hidden',
        name: 'Hidden',
        component: () => import('../views/components/Hidden.vue'),
      },
      {
        path: 'scrollable-region',
        name: 'ScrollableRegion',
        component: () => import('../views/components/ScrollableRegion.vue'),
      },
      {
        path: 'container',
        name: 'Container',
        component: () => import('../views/components/Container.vue'),
      },
      {
        path: 'button',
        name: 'Button',
        component: () => import('../views/components/Button.vue'),
      },
      {
        path: 'button-group',
        name: 'ButtonGroup',
        component: () => import('../views/components/ButtonGroup.vue'),
      },
      {
        path: 'branch-name',
        name: 'BranchName',
        component: () => import('../views/components/BranchName.vue'),
      },
      {
        path: 'counter-label',
        name: 'CounterLabel',
        component: () => import('../views/components/CounterLabel.vue'),
      },
      {
        path: 'link',
        name: 'Link',
        component: () => import('../views/components/Link.vue'),
      },
      {
        path: 'truncate',
        name: 'Truncate',
        component: () => import('../views/components/Truncate.vue'),
      },
      {
        path: 'label',
        name: 'Label',
        component: () => import('../views/components/Label.vue'),
      },
      {
        path: 'label-group',
        name: 'LabelGroup',
        component: () => import('../views/components/LabelGroup.vue'),
      },
      {
        path: 'relative-time',
        name: 'RelativeTime',
        component: () => import('../views/components/RelativeTime.vue'),
      },
      {
        path: 'header',
        name: 'Header',
        component: () => import('../views/components/Header.vue'),
      },
      {
        path: 'pagehead',
        name: 'Pagehead',
        component: () => import('../views/components/Pagehead.vue'),
      },
      {
        path: 'page-header',
        name: 'PageHeader',
        component: () => import('../views/components/PageHeader.vue'),
      },
      {
        path: 'page-layout',
        name: 'PageLayout',
        component: () => import('../views/components/PageLayout.vue'),
      },
      {
        path: 'pagination',
        name: 'Pagination',
        component: () => import('../views/components/Pagination.vue'),
      },
      {
        path: 'heading',
        name: 'Heading',
        component: () => import('../views/components/Heading.vue'),
      },
      {
        path: 'text',
        name: 'Text',
        component: () => import('../views/components/Text.vue'),
      },
      {
        path: 'divider',
        name: 'Divider',
        component: () => import('../views/components/Divider.vue'),
      },
      {
        path: 'avatar',
        name: 'Avatar',
        component: () => import('../views/components/Avatar.vue'),
      },
      {
        path: 'avatar-stack',
        name: 'AvatarStack',
        component: () => import('../views/components/AvatarStack.vue'),
      },
      {
        path: 'circle-badge',
        name: 'CircleBadge',
        component: () => import('../views/components/CircleBadge.vue'),
      },
      {
        path: 'action-list',
        name: 'ActionList',
        component: () => import('../views/components/ActionList.vue'),
      },
      {
        path: 'tree-view',
        name: 'TreeView',
        component: () => import('../views/components/TreeView.vue'),
      },
      {
        path: 'topic-tag',
        name: 'TopicTag',
        component: () => import('../views/components/TopicTag.vue'),
      },
      {
        path: 'token',
        name: 'Token',
        component: () => import('../views/components/Token.vue'),
      },
      // Form
      {
        path: 'form-control',
        name: 'FormControl',
        component: () => import('../views/components/FormControl.vue'),
      },
      {
        path: 'input',
        redirect: '/component/text-input',
      },
      {
        path: 'text-input',
        name: 'TextInput',
        component: () => import('../views/components/TextInput.vue'),
      },
      {
        path: 'textarea',
        name: 'Textarea',
        component: () => import('../views/components/Textarea.vue'),
      },
      {
        path: 'select',
        name: 'Select',
        component: () => import('../views/components/Select.vue'),
      },
      {
        path: 'checkbox',
        name: 'Checkbox',
        component: () => import('../views/components/Checkbox.vue'),
      },
      {
        path: 'autocomplete',
        name: 'Autocomplete',
        component: () => import('../views/components/Autocomplete.vue'),
      },
      {
        path: 'text-input-with-tokens',
        name: 'TextInputWithTokens',
        component: () => import('../views/components/TextInputWithTokens.vue'),
      },
      {
        path: 'select-panel',
        name: 'SelectPanel',
        component: () => import('../views/components/SelectPanel.vue'),
      },
      {
        path: 'radio',
        name: 'Radio',
        component: () => import('../views/components/Radio.vue'),
      },
      {
        path: 'radio-group',
        name: 'RadioGroup',
        component: () => import('../views/components/RadioGroup.vue'),
      },
      {
        path: 'upload',
        name: 'Upload',
        component: () => import('../views/components/Upload.vue'),
      },
      {
        path: 'image-upload',
        name: 'ImageUpload',
        component: () => import('../views/components/ImageUpload.vue'),
      },
      // Data
      {
        path: 'card',
        name: 'Card',
        component: () => import('../views/components/Card.vue'),
      },
      {
        path: 'data-table',
        alias: 'table',
        name: 'DataTable',
        component: () => import('../views/components/DataTable.vue'),
      },
      {
        path: 'timeline',
        name: 'Timeline',
        component: () => import('../views/components/Timeline.vue'),
      },
      {
        path: 'toggle-switch',
        name: 'ToggleSwitch',
        component: () => import('../views/components/ToggleSwitch.vue'),
      },
      {
        path: 'segmented-control',
        name: 'SegmentedControl',
        component: () => import('../views/components/SegmentedControl.vue'),
      },
      // Navigation
      {
        path: 'nav-list',
        name: 'NavList',
        component: () => import('../views/components/NavList.vue'),
      },
      {
        path: 'breadcrumbs',
        name: 'Breadcrumbs',
        component: () => import('../views/components/Breadcrumbs.vue'),
      },
      {
        path: 'steps',
        name: 'Steps',
        component: () => import('../views/components/Steps.vue'),
      },
      {
        path: 'underline-nav',
        name: 'UnderlineNav',
        component: () => import('../views/components/UnderlineNav.vue'),
      },
      {
        path: 'underline-panels',
        name: 'UnderlinePanels',
        component: () => import('../views/components/UnderlinePanels.vue'),
      },
      // Feedback 反馈组件
      {
        path: 'inline-message',
        name: 'InlineMessage',
        component: () => import('../views/components/InlineMessage.vue'),
      },
      {
        path: 'progress-bar',
        name: 'ProgressBar',
        component: () => import('../views/components/ProgressBar.vue'),
      },
      {
        path: 'skeleton',
        name: 'Skeleton',
        component: () => import('../views/components/Skeleton.vue'),
      },
      {
        path: 'skeleton-avatar',
        name: 'SkeletonAvatar',
        component: () => import('../views/components/SkeletonAvatar.vue'),
      },
      {
        path: 'skeleton-text',
        name: 'SkeletonText',
        component: () => import('../views/components/SkeletonText.vue'),
      },
      {
        path: 'spinner',
        name: 'Spinner',
        component: () => import('../views/components/Spinner.vue'),
      },
      {
        path: 'admonition',
        name: 'Admonition',
        component: () => import('../views/components/Admonition.vue'),
      },
      {
        path: 'blankslate',
        name: 'Blankslate',
        component: () => import('../views/components/Blankslate.vue'),
      },
      {
        path: 'dialog',
        name: 'Dialog',
        component: () => import('../views/components/Dialog.vue'),
      },
      {
        path: 'confirmation-dialog',
        name: 'ConfirmationDialog',
        component: () => import('../views/components/ConfirmationDialog.vue'),
      },
      {
        path: 'banner',
        name: 'Banner',
        component: () => import('../views/components/Banner.vue'),
      },
      {
        path: 'tooltip',
        name: 'Tooltip',
        component: () => import('../views/components/Tooltip.vue'),
      },
    ],
  },
]
