<script setup lang="ts">
import { defineComponent, h, shallowRef } from 'vue'
import { RouterLink } from 'vue-router'
import {
  PageHeader,
  PageHeaderParentLink,
  type ChildrenPropTypes,
  type TitleAreaProps,
  type TitleProps,
  type NavigationProps,
  type ParentLinkProps,
  type PageHeaderProps,
  type PageHeaderInstance,
  type TitleAreaInstance,
  type ParentLinkInstance,
} from './index'

const CustomRoot = defineComponent({
  props: { label: { type: String, required: true } },
  setup: (props) => () => h('header', { 'aria-label': props.label }),
})
const root = shallowRef<PageHeaderInstance | null>(null)
const titleArea = shallowRef<TitleAreaInstance | null>(null)
const link = shallowRef<ParentLinkInstance | null>(null)
void root.value
void titleArea.value
void link.value
const rootProps: PageHeaderProps = { hasBorder: true, role: 'banner', 'aria-label': 'Page' }
const titleProps: TitleProps = { as: 'h1', hidden: { narrow: true } }
const areaProps: TitleAreaProps = { variant: { narrow: 'medium', regular: 'large' } }
const navigationProps: NavigationProps = { as: 'nav', 'aria-labelledby': 'page-title' }
const routerProps: ParentLinkProps<typeof RouterLink> = {
  as: RouterLink,
  to: '/component/page-header',
}
// @ts-expect-error hidden accepts booleans rather than strings.
const invalidHidden: ChildrenPropTypes = { hidden: 'true' }
// @ts-expect-error Responsive hidden only supports narrow, regular and wide.
const invalidBreakpoint: ChildrenPropTypes = { hidden: { small: true } }
// @ts-expect-error TitleArea only supports source title sizes.
const invalidVariant: TitleAreaProps = { variant: 'small' }
// @ts-expect-error Navigation only supports nav and div.
const invalidNavigation: NavigationProps = { as: 'section' }
// @ts-expect-error Custom roots require their own required props.
const missingRootProp: PageHeaderProps<typeof CustomRoot> = { as: CustomRoot }
// @ts-expect-error RouterLink requires to.
const missingTarget: ParentLinkProps<typeof RouterLink> = { as: RouterLink }
void invalidHidden
void invalidBreakpoint
void invalidVariant
void invalidNavigation
void missingRootProp
void missingTarget
</script>

<template>
  <PageHeader ref="root" v-bind="rootProps">
    <PageHeader.TitleArea ref="titleArea" v-bind="areaProps">
      <PageHeader.Title v-bind="titleProps">Page</PageHeader.Title>
    </PageHeader.TitleArea>
    <PageHeader.ContextArea :hidden="{ narrow: false, regular: true, wide: true }">
      <PageHeader.ParentLink ref="link" href="/parent">Parent</PageHeader.ParentLink>
    </PageHeader.ContextArea>
    <PageHeader.Actions><button type="button">Action</button></PageHeader.Actions>
    <PageHeader.Navigation v-bind="navigationProps" />
  </PageHeader>
  <PageHeader :as="CustomRoot" label="Custom" />
  <PageHeaderParentLink v-bind="routerProps">Parent</PageHeaderParentLink>
  <PageHeader.ParentLink :as="RouterLink" :to="{ path: '/component/page-header' }"
    >Parent</PageHeader.ParentLink
  >
  <!-- @vue-expect-error Custom roots require their own required props. -->
  <PageHeader :as="CustomRoot" />
  <!-- @vue-expect-error Unknown native tags are rejected. -->
  <PageHeader as="something" />
  <!-- @vue-expect-error hidden accepts booleans. -->
  <PageHeader.ContextArea hidden="true" />
  <!-- @vue-expect-error Responsive hidden only supports source breakpoints. -->
  <PageHeader.Actions :hidden="{ small: true }" />
  <!-- @vue-expect-error TitleArea only supports source title sizes. -->
  <PageHeader.TitleArea variant="small" />
  <!-- @vue-expect-error Title must be a heading. -->
  <PageHeader.Title as="span" />
  <!-- @vue-expect-error Navigation only supports nav or div. -->
  <PageHeader.Navigation as="section" />
  <!-- @vue-expect-error RouterLink requires to. -->
  <PageHeader.ParentLink :as="RouterLink" />
</template>
