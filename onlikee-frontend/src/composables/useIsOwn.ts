import { computed, type Ref } from 'vue'
import { useUserStore } from '@/stores/user'
import type { UserProfile } from '@/modules/user/api/user'

type UserProfileRef = Readonly<Ref<UserProfile | null | undefined>>

export const useIsOwn = (profile: UserProfileRef) => {
  const userStore = useUserStore()

  return computed(() => {
    return Boolean(
      profile.value?.uuid &&
      userStore.userInfo?.uuid &&
      profile.value.uuid === userStore.userInfo.uuid,
    )
  })
}
