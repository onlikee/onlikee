import AutocompleteRoot from './Autocomplete.vue'
import Input from './AutocompleteInput.vue'
import Menu from './AutocompleteMenu.vue'
import Overlay from './AutocompleteOverlay.vue'
import { AutocompleteContext } from './context'

const Autocomplete = Object.assign(AutocompleteRoot, {
  Context: AutocompleteContext,
  Input,
  Menu,
  Overlay,
})
export default Autocomplete
export {
  Autocomplete,
  Input as AutocompleteInput,
  Menu as AutocompleteMenu,
  Overlay as AutocompleteOverlay,
}
export {
  AutocompleteContext,
  AutocompleteInputContext,
  AutocompleteDeferredInputContext,
  useAutocompleteContext,
} from './context'
export type {
  AutocompleteProps,
  AutocompleteInputProps,
  AutocompleteMenuProps,
  AutocompleteMenuInternalProps,
  AutocompleteMenuItem,
  AutocompleteOverlayProps,
} from './types'
