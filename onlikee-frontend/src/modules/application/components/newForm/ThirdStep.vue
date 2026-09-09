<template>
  <form
    class="app-info-form"
    @submit.prevent
  >
    <FormControl required>
      <FormControl.Label>
        应用名称
      </FormControl.Label>
      <Input
        :model-value="appName"
        placeholder="请输入应用名称"
        maxlength="100"
        @update:model-value="value => emit('update:app-name', value)"
      />
      <FormControl.Validation
        v-if="appNameError"
        variant="error"
      >
        {{ appNameError }}
      </FormControl.Validation>
    </FormControl>

    <FormControl required>
      <FormControl.Label>
        应用地址
      </FormControl.Label>
      <Input
        :model-value="appSubDomain"
        placeholder="请输入应用地址"
        leading-text="https://"
        trailing-text=".onlikee.com"
        minlength="1"
        maxlength="63"
        @update:model-value="value => emit('update:app-sub-domain', value)"
      />
      <FormControl.Validation
        v-if="appSubDomainError"
        variant="error"
      >
        {{ appSubDomainError }}
      </FormControl.Validation>
      <FormControl.Caption v-if="appSubDomain.trim()">
        应用地址：https://{{ appSubDomain }}.onlikee.com/
      </FormControl.Caption>
    </FormControl>

    <section class="visibility-panel">
      <div class="visibility-text">
        <h4 class="visibility-title">
          选择可见性 *
        </h4>
        <p class="visibility-caption">
          选择你的应用公开的还是私有的。
        </p>
      </div>

      <div class="visibility-select-wrap">
        <Dropdown ref="visibilityDropdownRef">
          <Dropdown.trigger>
            <Button>
              <Button.leadingVisual>
                <component
                  :is="selectedVisibilityOption.icon"
                  color="var(--fgColor-muted)"
                />
              </Button.leadingVisual>
              {{ label }}
              <Button.trailingVisual>
                <TriangleDownIcon color="var(--fgColor-muted)" />
              </Button.trailingVisual>
            </Button>
          </Dropdown.trigger>
          <Dropdown.content
            width="medium"
          >
            <ActionList selection-variant="single">
              <ActionList.Item
                v-for="item in visibilityOptions"
                :key="item.value"
                :selected="visibility === item.value"
                @select="selectVisibility(item.value)"
              >
                <ActionList.LeadingVisual>
                  <component :is="item.icon" />
                </ActionList.LeadingVisual>
                {{ item.value }}
                <ActionList.Description variant="block">
                  {{ item.description }}
                </ActionList.Description>
              </ActionList.Item>
            </ActionList>
          </Dropdown.content>
        </Dropdown>
      </div>
    </section>

    <FormControl required>
      <FormControl.Label>
        应用描述
      </FormControl.Label>
      <Textarea
        :model-value="appDescription"
        placeholder="请输入应用描述"
        maxlength="1000"
        rows="7"
        @update:model-value="value => emit('update:app-description', value)"
      />
      <FormControl.Validation
        v-if="appDescriptionError"
        variant="error"
      >
        {{ appDescriptionError }}
      </FormControl.Validation>
      <FormControl.Caption>
        {{ `${appDescription.length} / 1000` }}
      </FormControl.Caption>
    </FormControl>
  </form>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { FormControl } from '@/components/primer-vue/FormControl'
import { Input } from '@/components/primer-vue/Input'
import { Textarea } from '@/components/primer-vue/Textarea'
import { Button } from '@/components/primer-vue/Button'
import { Dropdown } from '@/components/primer-vue/Dropdown'
import { ActionList } from '@/components/primer-vue/ActionList'
import RepoIcon from '@/components/octicons-vue3/icons/repo.vue'
import TriangleDownIcon from '@/components/octicons-vue3/icons/triangle-down.vue'
import LockIcon from '@/components/octicons-vue3/icons/lock.vue'

interface VisibilityOption {
  value: string
  description: string
  icon: typeof RepoIcon
}

interface Props {
  appName: string
  appSubDomain: string
  visibility: string
  appDescription: string
  appNameError?: string
  appSubDomainError?: string
  appDescriptionError?: string
}

const props = withDefaults(defineProps<Props>(), {
  appNameError: '',
  appSubDomainError: '',
  appDescriptionError: ''
})

const emit = defineEmits<{
  'update:app-name': [value: string]
  'update:app-sub-domain': [value: string]
  'update:visibility': [value: string]
  'update:app-description': [value: string]
}>()

const visibilityOptions: VisibilityOption[] = [
  {
    value: '公开的',
    description: '你的应用被公开，所有人都能够在应用广场上看见它。',
    icon: RepoIcon
  },
  {
    value: '私有的',
    description: '你可以在个人应用中查看和管理它。当然别人也可以通过URL进行访问。',
    icon: LockIcon
  }
]

const visibilityDropdownRef = ref<InstanceType<typeof Dropdown>>()

const selectedVisibilityOption = computed(() => {
  return visibilityOptions.find(item => item.value === props.visibility) ?? visibilityOptions[0]
})

const label = computed(() => selectedVisibilityOption.value.value)

function selectVisibility(value: string) {
  emit('update:visibility', value)
  visibilityDropdownRef.value?.close()
}
</script>

<style scoped>
.app-info-form {
  display: grid;
  gap: 12px;
}

.visibility-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--borderColor-muted);
  border-radius: 6px;
  background: var(--bgColor-default);
}

.visibility-text {
  min-width: 0;
}

.visibility-title {
  margin: 0;
  color: var(--fgColor-default);
  font-size: 14px;
  font-weight: 600;
}

.visibility-caption {
  margin: 2px 0 0;
  color: var(--fgColor-muted);
  font-size: 12px;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .visibility-panel {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
