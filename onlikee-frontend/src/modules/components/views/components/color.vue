<template>
  <ComponentDocsPage>
    <ComponentDocsHeader title="Color 颜色设计">
      <template #description>
        为了避免视觉传达差异，使用一套特定的调色板来规定颜色，为组件们提供一致的外观视觉感受。
        感谢
        <Link
          href="https://primer.style/brand/primitives/color/"
          link-text="primer style primitives"
          variant="primary"
        />
        设计师们提供的宝贵资源。
      </template>
    </ComponentDocsHeader>

    <ComponentDocsSection title="主题">
      <div class="themePickerGrid">
        <label class="themeCard">
          <div
            class="themePreview"
            style="background-color: #FFFFFF;"
          >
            <div
              class="colorDot"
              style="background-color: #96A199;"
            />
            <div
              class="colorDot"
              style="background-color: #0377FF;"
            />
            <div
              class="colorDot"
              style="background-color: #0FBF3E;"
            />
            <div
              class="colorDot"
              style="background-color: #B85B06;"
            />
            <div
              class="colorDot"
              style="background-color: #CF2230;"
            />
            <div
              class="colorDot"
              style="background-color: #8534F3;"
            />
            <div
              class="colorDot"
              style="background-color: #EF2AA4;"
            />
          </div>
          <div class="themeCardContent">
            <input
              v-model="selectedTheme"
              type="radio"
              name="color-theme"
              :value="0"
            >
            <span>Light</span>
          </div>
        </label>
        <label class="themeCard">
          <div
            class="themePreview"
            style="background-color: #000000;"
          >
            <div
              class="colorDot"
              style="background-color: #353D37;"
            />
            <div
              class="colorDot"
              style="background-color: #0A50DB;"
            />
            <div
              class="colorDot"
              style="background-color: #08872B;"
            />
            <div
              class="colorDot"
              style="background-color: #B35101;"
            />
            <div
              class="colorDot"
              style="background-color: #D31231;"
            />
            <div
              class="colorDot"
              style="background-color: #6619E1;"
            />
            <div
              class="colorDot"
              style="background-color: #CA2186;"
            />
          </div>
          <div class="themeCardContent">
            <input
              v-model="selectedTheme"
              type="radio"
              name="color-theme"
              :value="1"
            >
            <span>Dark</span>
          </div>
        </label>
      </div>
    </ComponentDocsSection>

    <ComponentDocsSection title="配色">
      <div
        class="scalesGrid"
        :style="{ backgroundColor: selectedTheme === 0 ? '#ffffff' : '#0D1117' }"
      >
        <div
          v-for="colorScale in ColorScales"
          :key="colorScale.color"
        >
          <div
            v-for="(color, index) in colorScale.scale"
            :key="index"
            :style="{ backgroundColor: color[selectedTheme] }"
            class="colorSwatch"
          >
            <span
              class="colorScalesInfo"
              :style="{ color: getReadableTextColor(color[selectedTheme]) }"
            >
              {{ colorScale.color + '.' + index }}
            </span>
            <span
              class="colorScalesInfo"
              :style="{ color: getReadableTextColor(color[selectedTheme]) }"
            >
              {{ color[selectedTheme] }}
            </span>
          </div>
        </div>
      </div>

      <div
        class="baseColorsGrid"
        :style="{ backgroundColor: selectedTheme === 0 ? '#ffffff' : '#0D1117' }"
      >
        <div class="colorSwatch baseColorBlack">
          <span>black.0</span><span>#000000</span>
        </div>
        <div class="colorSwatch baseColorWhite">
          <span>white.0</span><span>#FFFFFF</span>
        </div>
      </div>
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { Link } from '@/components/primer-vue/Link'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const selectedTheme = ref<0 | 1>(0)

const ColorScales = [
  {
    color: 'gray',
    //第一个颜色是light主题下的颜色，第二个是dark
    scale: [
      ['#F2F5F3', '#D2D9D4'],
      ['#E4EBE6', '#C4CCC6'],
      ['#D2D9D4', '#A4AEA6'],
      ['#C4CCC6', '#7C8980'],
      ['#B6BFB8', '#58635B'],
      ['#96A199', '#353D37'],
      ['#77827A', '#262C28'],
      ['#58635B', '#191F1B'],
      ['#353D37', '#0F1511'],
      ['#191F1B', '#060907'],
    ]
  },
  {
    color: 'blue',
    scale: [
      ['#DDF4FF', '#C2EDFF'],
      ['#BCECFF', '#A2DAFF'],
      ['#8DD6FF', '#78BAFE'],
      ['#5FB9FF', '#3094FF'],
      ['#3094FF', '#0377FF'],
      ['#0377FF', '#0A50DB'],
      ['#0055D5', '#1530B7'],
      ['#0040A7', '#082A8F'],
      ['#002F7A', '#052063'],
      ['#001C4D', '#000839'],
    ]
  },
  {
    color: 'green',
    scale: [
      ['#EBF9F4', '#CDFCD9'],
      ['#BFFFD1', '#8CF2A6'],
      ['#8CF2A6', '#5FED83'],
      ['#5FED83', '#23EA57'],
      ['#23EA57', '#0FBF3E'],
      ['#0FBF3E', '#08872B'],
      ['#08872B', '#0D6731'],
      ['#0D6731', '#0E422C'],
      ['#0E4A2E', '#0D3024'],
      ['#0D3024', '#0A241B'],
    ]
  },
  {
    color: 'yellow',
    scale: [
      ['#FFF8C5', '#F8E3A1'],
      ['#FFE777', '#F7D162'],
      ['#FFD743', '#FABF21'],
      ['#FABF21', '#DB9D00'],
      ['#DB9D00', '#BE7D00'],
      ['#BE7D00', '#A06100'],
      ['#A06100', '#834800'],
      ['#824800', '#653200'],
      ['#653200', '#471F00'],
      ['#471F00', '#2A1000'],
    ]
  },
  {
    color: 'orange',
    scale: [
      ['#FFF1E5', '#FFE2CC'],
      ['#FCCEAB', '#FAB580'],
      ['#F4A876', '#F08A3A'],
      ['#F08A3A', '#EA7110'],
      ['#DA7210', '#D56101'],
      ['#B85B06', '#B35101'],
      ['#954502', '#924100'],
      ['#703100', '#703100'],
      ['#5C2300', '#572400'],
      ['#471700', '#3D1800'],
    ]
  },
  {
    color: 'red',
    scale: [
      ['#FFEBE9', '#FFD9D6'],
      ['#FFCECB', '#FEB2AE'],
      ['#FFABA8', '#FD8986'],
      ['#FF8182', '#FC5C5D'],
      ['#FA4549', '#FA383D'],
      ['#CF2230', '#D31231'],
      ['#AE0B29', '#AE0B29'],
      ['#860620', '#860620'],
      ['#730019', '#5E0217'],
      ['#420011', '#33000D'],
    ]
  },
  {
    color: 'purple',
    scale: [
      ['#F0E5FF', '#EADBFF'],
      ['#DBBFFD', '#D3B3FE'],
      ['#C898FD', '#C08BFC'],
      ['#B870FF', '#A665F9'],
      ['#9F51FA', '#8B40F5'],
      ['#8534F3', '#6619E1'],
      ['#6619E1', '#43179E'],
      ['#43179E', '#26115F'],
      ['#26115F', '#160048'],
      ['#160048', '#0E022C'],
    ]
  },
  {
    color: 'pink',
    scale: [
      ['#FFF0FC', '#FFDBF7'],
      ['#FFC9F2', '#FCABE7'],
      ['#F67ED2', '#F67ED2'],
      ['#FF80D2', '#ED55BA'],
      ['#FF4AC0', '#E22D9F'],
      ['#EF2AA4', '#CA2186'],
      ['#CA2186', '#961C66'],
      ['#952866', '#741550'],
      ['#651643', '#520E39'],
      ['#3D0A28', '#30081F'],
    ]
  },
  {
    color: 'coral',
    scale: [
      ['#FFF0EB', '#FFD5C7'],
      ['#FFCAB8', '#FDB7A1'],
      ['#FFA387', '#FA9072'],
      ['#FF7B56', '#F66945'],
      ['#FE4C25', '#EF4319'],
      ['#E13F1B', '#C53211'],
      ['#C53211', '#A22710'],
      ['#A22710', '#801E0F'],
      ['#801E0F', '#500A00'],
      ['#500A00', '#3C0000'],
    ]
  },
  {
    color: 'lemon',
    scale: [
      ['#FDF5B3', '#FCF2A5'],
      ['#F5E36B', '#F9E76A'],
      ['#F2DA3B', '#F4DA38'],
      ['#E1C50F', '#E4C411'],
      ['#C7A60B', '#C7A60B'],
      ['#A98906', '#A98906'],
      ['#806803', '#876A04'],
      ['#614D01', '#654D02'],
      ['#413200', '#423101'],
      ['#322400', '#241900'],
    ]
  },
  {
    color: 'lime',
    scale: [
      ['#F3FEC8', '#EDFFC9'],
      ['#E8FC97', '#DCFF96'],
      ['#DCFA67', '#CDF041'],
      ['#D1F441', '#B1E119'],
      ['#B2DE28', '#88B80F'],
      ['#92C219', '#608A10'],
      ['#698E17', '#3E5F0F'],
      ['#425E13', '#22360B'],
      ['#2C440B', '#142A08'],
      ['#182C01', '#091D05'],
    ]
  },
  {
    color: 'teal',
    scale: [
      ['#DAF9F5', '#CFF7F2'],
      ['#A4EFE8', '#99F1E8'],
      ['#6EE5DC', '#61EEE3'],
      ['#39DAD2', '#26EDE2'],
      ['#23B1AE', '#10DCD4'],
      ['#197B7B', '#0BBAB6'],
      ['#136061', '#079695'],
      ['#024B4D', '#047172'],
      ['#083D3D', '#024B4D'],
      ['#052B2C', '#052D2E'],
    ]
  },
  {
    color: 'indigo',
    scale: [
      ['#EFF2FF', '#DBE3FF'],
      ['#D4DBFF', '#B3C1FD'],
      ['#B3C1FD', '#8D9FF8'],
      ['#8E9DF7', '#6A7DF0'],
      ['#6B7BEF', '#4A5CE5'],
      ['#4956E5', '#2D3DD7'],
      ['#2D3DD7', '#232FB3'],
      ['#262DAE', '#212183'],
      ['#212183', '#161962'],
      ['#12144F', '#0D103F'],
    ]
  }
]

function getReadableTextColor(backgroundColor: string) {
  const hex = backgroundColor.replace('#', '')
  const normalized = hex.length === 3
    ? hex.split('').map(char => char + char).join('')
    : hex

  const r = Number.parseInt(normalized.slice(0, 2), 16) / 255
  const g = Number.parseInt(normalized.slice(2, 4), 16) / 255
  const b = Number.parseInt(normalized.slice(4, 6), 16) / 255

  const linearize = (value: number) => (
    value <= 0.03928
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4
  )

  const luminance = 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)

  return luminance > 0.179 ? '#000000' : '#ffffff'
}
</script>

<style scoped>
.scalesGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 286px));
  gap: 1rem;
  padding: 1rem;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .1);
  border-radius: 0.5rem;
  background-color: #ffffff;
  margin-bottom: 0.5rem;
}

.colorSwatch {
  padding: 0.5rem;
  display: flex;
  justify-content: space-between;
}

.colorScalesInfo {
  font-size: 14px;
  font-family: ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.baseColorsGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .1);
  border-radius: 0.5rem;
  background-color: #ffffff;
  margin-bottom: 0.5rem;
}

.baseColorBlack {
  background-color: #000000;
  color: #ffffff;
}

.baseColorWhite {
  background-color: #ffffff;
  color: #000000;
}

.themePickerGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 200px));
  gap: 1rem;
}

.themeCard {
  border: 1px solid var(--borderColor-neutral-emphasis);
  border-radius: 0.5rem;
  cursor: pointer;
  overflow: hidden;
}

.themePreview {
  display: flex;
  padding: 1rem;
  border-bottom: 1px solid var(--borderColor-muted);
}

.colorDot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.themeCardContent {
  padding: 0.5rem 0.8rem;
  display: flex;
  gap: 0.5rem;
}
</style>
