import type { RouteRecordRaw } from 'vue-router'

export const componentRoutes: Array<RouteRecordRaw> = [
    {
        path: '/component',
        name: 'Component',
        component: () => import('../views/components.vue')
    },
    {
        path: '/component',
        component: () => import('../layout/ComponentLayout.vue'),
        children: [
            {
                path: 'guide',
                name: 'Guide',
                component: () => import('../views/components/guide.vue')
            },
            {
                path: 'overview',
                name: 'Overview',
                component: () => import('../views/components/overview.vue')
            },
            {
                path: 'color',
                name: 'Color',
                component: () => import('../views/components/color.vue')
            },
            // Icon
            {
                path: 'octicons-vue3',
                name: 'OcticonsVue3',
                component: () => import('../views/components/octicons-vue3.vue')
            },
            // Blocks
            {
                path: 'action-bar',
                name: 'ActionBar',
                component: () => import('../views/components/action-bar.vue')
            },
            {
                path: 'action-panel',
                name: 'ActionPanel',
                component: () => import('../views/components/action-panel.vue')
            },
            {
                path: 'user-menu',
                name: 'UserMenu',
                component: () => import('../views/components/user-menu.vue')
            },
            // Basic
            {
                path: 'container',
                name: 'Container',
                component: () => import('../views/components/container.vue')
            },
            {
                path: 'button',
                name: 'Button',
                component: () => import('../views/components/button.vue')
            },
            {
                path: 'copy-button',
                name: 'CopyButton',
                component: () => import('../views/components/copy-button.vue')
            },
            {
                path: 'link',
                name: 'Link',
                component: () => import('../views/components/link.vue')
            },
            {
                path: 'divider',
                name: 'Divider',
                component: () => import('../views/components/divider.vue')
            },
            {
                path: 'avatar',
                name: 'Avatar',
                component: () => import('../views/components/avatar.vue')
            },
            {
                path: 'dropdown',
                name: 'Dropdown',
                component: () => import('../views/components/dropdown.vue')
            },
            {
                path: 'action-list',
                name: 'ActionList',
                component: () => import('../views/components/action-list.vue')
            },
            {
                path: 'tag',
                name: 'Tag',
                component: () => import('../views/components/tag.vue')
            },
            // Form
            {
                path: 'form-control',
                name: 'FormControl',
                component: () => import('../views/components/form-control.vue')
            },
            {
                path: 'input',
                name: 'Input',
                component: () => import('../views/components/input.vue')
            },
            {
                path: 'textarea',
                name: 'Textarea',
                component: () => import('../views/components/textarea.vue')
            },
            {
                path: 'select',
                name: 'Select',
                component: () => import('../views/components/select.vue')
            },
            {
                path: 'upload',
                name: 'Upload',
                component: () => import('../views/components/upload.vue')
            },
            {
                path: 'image-upload',
                name: 'ImageUpload',
                component: () => import('../views/components/image-upload.vue')
            },
            // Data
            {
                path: 'table',
                name: 'Table',
                component: () => import('../views/components/table.vue')
            },
            {
                path: 'timeline',
                name: 'Timeline',
                component: () => import('../views/components/timeline.vue')
            },
            // Navigation
            {
                path: 'steps',
                name: 'Steps',
                component: () => import('../views/components/steps.vue')
            },
            // Feedback 反馈组件
            {
                path: 'progress-bar',
                name: 'ProgressBar',
                component: () => import('../views/components/progress-bar.vue')
            },
            {
                path: 'admonition',
                name: 'Admonition',
                component: () => import('../views/components/admonition.vue')
            },
            {
                path: 'blankslate',
                name: 'Blankslate',
                component: () => import('../views/components/blankslate.vue')
            },
            {
                path: 'dialog',
                name: 'Dialog',
                component: () => import('../views/components/dialog.vue')
            },
            {
                path: 'banner',
                name: 'Banner',
                component: () => import('../views/components/banner.vue')
            },
            {
                path: 'tooltip',
                name: 'Tooltip',
                component: () => import('../views/components/tooltip.vue')
            }
        ]
    }
]
