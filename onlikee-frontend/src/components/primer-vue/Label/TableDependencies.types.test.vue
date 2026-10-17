<script setup lang="ts">
import { Heading } from '../Heading'
import { Label } from './index'
import { LabelGroup } from '../LabelGroup'
import { RelativeTime } from '../RelativeTime'
import { ScrollableRegion } from '../ScrollableRegion'
import { SkeletonBox } from '../Skeleton'
import { SkeletonText } from '../SkeletonText'

const date = new Date('2024-03-07T00:30:00.000Z')
</script>

<template>
  <Heading id="heading" as="h3" variant="small" tabindex="0">Repositories</Heading>
  <Label id="label" variant="accent" size="large">Public</Label>
  <Label as="a" href="/labels" target="_blank">View labels</Label>
  <LabelGroup as="ol" visible-child-count="auto" overflow-style="inline" aria-label="Labels">
    <Label>Public</Label>
  </LabelGroup>
  <LabelGroup :visible-child-count="2" data-testid="labels" />
  <ScrollableRegion id="scroll" aria-label="Repositories" tabindex="0" />
  <ScrollableRegion aria-labelledby="heading" />
  <RelativeTime
    id="updated"
    :date="date"
    format="duration"
    format-style="narrow"
    precision="minute"
    tense="past"
    month="short"
    time-zone-name="short"
    time-zone="UTC"
    prefix=""
    no-title
    lang="en"
    :on-relative-time-updated="(event) => event.newText"
  />
  <RelativeTime datetime="2024-03-07T00:30:00.000Z" />
  <SkeletonBox id="loading" height="2rem" :width="100" delay="short" aria-hidden="true" />
  <SkeletonBox :delay="500" />
  <SkeletonText :lines="3" size="titleLarge" :max-width="250" aria-hidden="true" />

  <!-- @vue-expect-error Heading only accepts semantic h1-h6 elements. -->
  <Heading as="div" />
  <!-- @vue-expect-error Heading uses large/medium/small variants. -->
  <Heading variant="display" />
  <!-- @vue-expect-error Label uses the documented color variants. -->
  <Label variant="warning" />
  <!-- @vue-expect-error Label sizes are small or large. -->
  <Label size="medium" />
  <!-- @vue-expect-error LabelGroup overflow style is inline or overlay. -->
  <LabelGroup overflow-style="menu" />
  <!-- @vue-expect-error LabelGroup truncates to auto or a numeric count. -->
  <LabelGroup :visible-child-count="true" />
  <!-- @vue-expect-error ScrollableRegion requires an accessible name. -->
  <ScrollableRegion />
  <!-- @vue-expect-error ScrollableRegion uses one accessible naming strategy. -->
  <ScrollableRegion aria-label="Repositories" aria-labelledby="heading" />
  <!-- @vue-expect-error RelativeTime only supports its documented formats. -->
  <RelativeTime format="full" />
  <!-- @vue-expect-error RelativeTime formatStyle is long, short or narrow. -->
  <RelativeTime format-style="medium" />
  <!-- @vue-expect-error The date prop is a Date; strings use datetime. -->
  <RelativeTime date="2024-03-07" />
  <!-- @vue-expect-error RelativeTime precision uses named time units. -->
  <RelativeTime precision="millisecond" />
  <!-- @vue-expect-error RelativeTime tense is auto, past or future. -->
  <RelativeTime tense="present" />
  <!-- @vue-expect-error RelativeTime months follow Intl date formatting values. -->
  <RelativeTime month="medium" />
  <!-- @vue-expect-error noTitle is a boolean. -->
  <RelativeTime :no-title="'true'" />
  <!-- @vue-expect-error Skeleton delays use milliseconds, short or long. -->
  <SkeletonBox delay="medium" />
  <!-- @vue-expect-error Skeleton dimensions are CSS strings or numbers. -->
  <SkeletonBox :height="true" />
  <!-- @vue-expect-error SkeletonText sizes follow the typography token names. -->
  <SkeletonText size="large" />
  <!-- @vue-expect-error SkeletonText line count is numeric. -->
  <SkeletonText lines="3" />
  <!-- @vue-expect-error SkeletonText maxWidth is a CSS string or number. -->
  <SkeletonText :max-width="true" />
</template>
