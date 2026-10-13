import CardRoot from './Card.vue'
import CardIcon from './CardIcon.vue'
import CardImage from './CardImage.vue'
import CardHeading from './CardHeading.vue'
import CardDescription from './CardDescription.vue'
import CardAction from './CardAction.vue'
import CardMetadata from './CardMetadata.vue'
import type { AllowedComponentProps, VNodeProps } from 'vue'
import type { CardInstance, CardProps } from './types'

type CardComponent = {
  new (): Omit<InstanceType<typeof CardRoot>, '$props'> &
    CardInstance & {
      $props: CardProps & AllowedComponentProps & VNodeProps
    }
}

export const Card = Object.assign(CardRoot as unknown as CardComponent, {
  Icon: CardIcon,
  Image: CardImage,
  Heading: CardHeading,
  Description: CardDescription,
  Action: CardAction,
  Metadata: CardMetadata,
})
export { CardIcon, CardImage, CardHeading, CardDescription, CardAction, CardMetadata }
export type {
  CardProps,
  CardIconProps,
  CardImageProps,
  CardHeadingProps,
  CardDescriptionProps,
  CardActionProps,
  CardMetadataProps,
  CardInstance,
} from './types'
export default Card
