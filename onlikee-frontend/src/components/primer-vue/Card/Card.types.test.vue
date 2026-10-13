<script setup lang="ts">
import { shallowRef } from 'vue'
import {
  Card,
  CardHeading,
  type CardProps,
  type CardImageProps,
  type CardIconProps,
  type CardHeadingProps,
  type CardInstance,
} from './index'
import { RepoIcon } from '@onlikee/octicons-vue'

const root: CardProps = {
  as: 'section',
  padding: 'condensed',
  borderRadius: 'medium',
  layout: 'compact',
  'aria-label': 'Card',
}
const image: CardImageProps = { src: '/image.png', alt: 'Image', loading: 'lazy', width: 100 }
const icon: CardIconProps = { icon: RepoIcon, 'aria-label': 'Repository' }
const title: CardHeadingProps = { as: 'h2', id: 'heading', title: 'Title' }
const card = shallowRef<CardInstance | null>(null)
const inferredCard = shallowRef<InstanceType<typeof Card> | null>(null)
// @ts-expect-error Card only supports div and section.
const invalidRoot: CardProps = { as: 'article' }
// @ts-expect-error Image source is required.
const invalidImage: CardImageProps = { alt: 'Image' }
// @ts-expect-error Icon component is required.
const invalidIcon: CardIconProps = { className: 'icon' }
// @ts-expect-error Heading does not support h1.
const invalidHeading: CardHeadingProps = { as: 'h1' }
void [invalidRoot, invalidImage, invalidIcon, invalidHeading]
</script>

<template>
  <Card ref="card" v-bind="root" @click="card?.element?.focus()">
    <Card.Icon v-bind="icon" />
    <Card.Image v-bind="image" />
    <CardHeading v-bind="title">Heading</CardHeading>
    <Card.Description>Description</Card.Description>
    <Card.Metadata>Metadata</Card.Metadata>
    <Card.Action><button type="button">Options</button></Card.Action>
  </Card>
  <Card ref="inferredCard" @click="inferredCard?.element?.focus()">Custom content</Card>
  <!-- @vue-expect-error Only div and section are supported. -->
  <Card as="article" />
  <!-- @vue-expect-error Unsupported layout. -->
  <Card layout="horizontal" />
  <!-- @vue-expect-error Unsupported heading level. -->
  <Card.Heading as="h1" />
  <!-- @vue-expect-error Image source is required. -->
  <Card.Image alt="Image" />
  <!-- @vue-expect-error Icon component is required. -->
  <Card.Icon />
</template>
