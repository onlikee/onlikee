<template>
  <div class="index-page">
    <div class="background-root">
      <div class="background-0" aria-hidden="true" />
      <div class="background-1" aria-hidden="true" />
      <div class="background-2" aria-hidden="true" />
      <div class="hero-stage">
        <div class="background-3" aria-hidden="true" />
        <div class="background-4" aria-hidden="true" />
        <div class="background-5 animate-stretch-vertical-loop" aria-hidden="true" />
        <div class="background-6 animate-stretch-horizontal-loop" aria-hidden="true" />
        <div class="background-7" aria-hidden="true" />
        <div class="background-8 animate-stretch-vertical-loop" aria-hidden="true" />
        <div class="background-9 animate-stretch-horizontal-loop" aria-hidden="true" />
        <div class="background-10" aria-hidden="true" />
        <div class="background-11" aria-hidden="true" />
        <div class="background-12" aria-hidden="true" />
      </div>
    </div>
    <div class="title">onlikee</div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.index-page {
  position: relative;
  height: calc(100svh - var(--header-height));
  min-height: calc(100svh - var(--header-height));
  overflow: hidden;
  clip-path: inset(
    0 0 0 0
  ); /* Create a clipping context to contain fixed children to this section */
}

.hero-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.background-root {
  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  transform-origin: 0% 0%;
  --bg-offset: 48px;
  will-change: transform;
  animation: parallax-background linear both;
  animation-timeline: scroll(root);
  animation-range: 0 calc(100svh - var(--header-height));
}

@keyframes parallax-background {
  from {
    transform: translateY(0) translateZ(0);
  }
  to {
    transform: translateY(50svh) translateZ(0);
  }
}

.background-0,
.background-1,
.background-2,
.background-3 {
  position: absolute;
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.hero-stage {
  position: relative;
  margin: 0 auto;
  height: 100%;
  width: 100%;
  max-width: 1440px;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.background-0 {
  z-index: 0;
  background-image: url('../assests/background-0.svg');
}

.background-1 {
  z-index: 1;
  background-image: url('../assests/background-1.svg');
}

.background-2 {
  z-index: 3;
  background-image: url('../assests/background-2.svg');
}
.background-3 {
  z-index: 2;
  background-image: url('../assests/background-3.svg');
}

.background-4 {
  position: absolute;
  left: calc(-1 * min(8.255vw, 7.4295rem));
  top: calc(-1 * min(2.95vw, 2.655rem) + var(--bg-offset));
  width: min(125vw, 112.5rem);
  max-width: 125vw;
  aspect-ratio: 2427 / 1503;
  background-image: url('../assests/background-4.svg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  z-index: 4;
}

.background-5 {
  position: absolute;
  right: min(30.05vw, 27.045rem);
  top: calc(min(1.5vw, 1.35rem) + var(--bg-offset));
  width: min(0.5vw, 0.45rem);
  aspect-ratio: 10 / 537;
  background-image: url('../assests/background-5.svg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  z-index: 5;
}

.background-6 {
  position: absolute;
  right: min(20vw, 18rem);
  top: calc(min(13.7vw, 12.33rem) + var(--bg-offset));
  width: min(20vw, 18rem);
  aspect-ratio: 355 / 10;
  background-image: url('../assests/background-6.svg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  z-index: 6;
}

.background-7 {
  position: absolute;
  right: min(29.76vw, 26.784rem);
  top: calc(min(13.35vw, 12.015rem) + var(--bg-offset));
  height: min(1.1vw, 0.99rem);
  width: min(1.1vw, 0.99rem);
  background-image: url('../assests/background-7.svg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  z-index: 7;
}

.background-8 {
  position: absolute;
  right: min(34.82vw, 31.338rem);
  top: calc(min(7.2vw, 6.48rem) + var(--bg-offset));
  width: min(0.55vw, 0.495rem);
  aspect-ratio: 11 / 135;
  background-image: url('../assests/background-8.svg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  animation-delay: 500ms;
  z-index: 8;
}

.background-9 {
  position: absolute;
  right: min(29.3vw, 26.37rem);
  top: calc(min(10.3vw, 9.27rem) + var(--bg-offset));
  width: min(11.5vw, 10.35rem);
  aspect-ratio: 246 / 11;
  background-image: url('../assests/background-9.svg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  animation-delay: 500ms;
  z-index: 9;
}

.background-10 {
  position: absolute;
  right: min(34.5vw, 31.05rem);
  top: calc(min(9.925vw, 8.9325rem) + var(--bg-offset));
  height: min(1.2vw, 1.08rem);
  width: min(1.2vw, 1.08rem);
  background-image: url('../assests/background-10.svg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  z-index: 10;
}

.background-11 {
  position: absolute;
  right: calc(min(29.76vw, 26.784rem) + (min(1.1vw, 0.99rem) - min(4.2vw, 70px)) / 2);
  top: calc(
    min(13.35vw, 12.015rem) + var(--bg-offset) + (min(1.1vw, 0.99rem) - min(4.2vw, 70px)) / 2
  );
  width: min(4.2vw, 70px);
  aspect-ratio: 1 / 1;
  background-image: url('../assests/background-11.svg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  z-index: 4;
}

.background-12 {
  position: absolute;
  right: calc(min(34.5vw, 31.05rem) + (min(1.2vw, 1.08rem) - min(3.6vw, 52px)) / 2);
  top: calc(
    min(9.925vw, 8.9325rem) + var(--bg-offset) + (min(1.2vw, 1.08rem) - min(3.6vw, 52px)) / 2
  );
  width: min(3.6vw, 52px);
  aspect-ratio: 1 / 1;
  background-image: url('../assests/background-12.svg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  z-index: 4;
}

.title {
  font-family: 'Arial Black', sans-serif;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 6rem;
  color: var(--fgColor-onEmphasis);
  text-shadow: 2px 2px 4px
    color-mix(in srgb, var(--fgColor-default) 70%, var(--bgColor-transparent));
  pointer-events: none;
  z-index: 2;
  font-weight: bold;
}
@keyframes stretch-vertical {
  0% {
    transform: scaleY(0);
  }
  100% {
    transform: scaleY(1);
  }
}

@keyframes stretch-horizontal {
  0% {
    transform: scaleX(0);
  }
  100% {
    transform: scaleX(1);
  }
}

@keyframes pulse-vertical {
  0%,
  100% {
    transform: scaleY(0.8);
  }
  50% {
    transform: scaleY(1);
  }
}

@keyframes pulse-horizontal {
  0%,
  100% {
    transform: scaleX(0.8);
  }
  50% {
    transform: scaleX(1);
  }
}

.animate-stretch-vertical {
  transform-origin: top;
  animation: stretch-vertical 1.2s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.animate-stretch-vertical-loop {
  transform-origin: center;
  animation: pulse-vertical 1.6s ease-in-out infinite;
}

.animate-stretch-horizontal {
  transform-origin: left;
  animation: stretch-horizontal 1.2s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.animate-stretch-horizontal-loop {
  transform-origin: center;
  animation: pulse-horizontal 1.6s ease-in-out infinite;
}

@media (max-width: 768px) {
  .index-page {
    min-height: 100svh;
  }

  .title {
    font-size: 3.5rem;
  }
}

@media (min-width: 640px) {
  .hero-stage {
    padding-left: 2.5rem;
    padding-right: 2.5rem;
  }
}

@media (min-width: 1024px) {
  .hero-stage {
    padding-left: 4rem;
    padding-right: 4rem;
  }
}
</style>
