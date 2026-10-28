/** Match the source accessible-name lookup used for typeahead and announcements. */
export function getAccessibleName(element: Element): string {
  const label = element.getAttribute('aria-label')
  const labelledby = element.getAttribute('aria-labelledby')
  if (label) return label
  if (labelledby) return document.getElementById(labelledby)?.textContent ?? ''
  return element.textContent ?? ''
}
