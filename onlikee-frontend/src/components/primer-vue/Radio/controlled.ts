// Weak keys avoid retaining unmounted inputs. Read props at restoration time, after parent updates.
const controlledRadios = new WeakMap<HTMLInputElement, () => boolean | undefined>()

export function registerRadio(input: HTMLInputElement, getChecked: () => boolean | undefined) {
  controlledRadios.set(input, getChecked)
  return () => controlledRadios.delete(input)
}

export function restoreRadioGroup(input: HTMLInputElement) {
  const root = input.getRootNode() as Document | ShadowRoot | HTMLElement
  const group =
    input.name && 'querySelectorAll' in root
      ? Array.from(root.querySelectorAll<HTMLInputElement>('input[type="radio"]')).filter(
          (other) => other.name === input.name && other.form === input.form
        )
      : [input]
  if (!group.includes(input)) group.push(input)

  const states = group.map((radio) => ({ radio, checked: controlledRadios.get(radio)?.() }))
  // Clear rejected selections first, then restore the selected controlled sibling.
  for (const { radio, checked } of states) {
    if (checked === false) radio.checked = false
  }
  for (const { radio, checked } of states) {
    if (checked === true) radio.checked = true
  }
}
