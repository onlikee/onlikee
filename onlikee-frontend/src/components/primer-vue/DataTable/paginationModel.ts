export interface Page {
  type: 'PREV' | 'NEXT' | 'NUM' | 'BREAK'
  num: number
  disabled?: boolean
  selected?: boolean
  precedesBreak?: boolean
}

/** The shared Primer pagination window, copied independently of its anchor-based component. */
export function buildPaginationModel(
  pageCount: number,
  currentPage: number,
  showPages: boolean,
  marginPageCount = 1,
  surroundingPageCount = 2,
): Page[] {
  const prev: Page = { type: 'PREV', num: currentPage - 1, disabled: currentPage === 1 }
  const next: Page = { type: 'NEXT', num: currentPage + 1, disabled: currentPage === pageCount }
  if (!showPages) return [prev, next]
  if (pageCount <= 0) return [prev, { ...next, disabled: true }]
  const pages: Page[] = []
  const standardGap = surroundingPageCount + marginPageCount
  const maxVisiblePages = standardGap * 2 + 3
  function addPages(start: number, end: number, precedesBreak = false) {
    for (let num = start; num <= end; num++)
      pages.push({
        type: 'NUM',
        num,
        selected: num === currentPage,
        precedesBreak: num === end && precedesBreak,
      })
  }
  if (pageCount <= maxVisiblePages) {
    addPages(1, pageCount)
    return [prev, ...pages, next]
  }
  let startGap = 0
  let startOffset = 0
  if (currentPage - standardGap - 1 <= 1) startOffset = currentPage - standardGap - 2
  else startGap = currentPage - standardGap - 1
  let endGap = 0
  let endOffset = 0
  if (pageCount - currentPage - standardGap <= 1)
    endOffset = pageCount - currentPage - standardGap - 1
  else endGap = pageCount - currentPage - standardGap
  const hasStart = startGap > 0
  const hasEnd = endGap > 0
  addPages(1, marginPageCount, hasStart)
  if (hasStart) pages.push({ type: 'BREAK', num: marginPageCount + 1 })
  addPages(
    marginPageCount + startGap + endOffset + 1,
    pageCount - startOffset - endGap - marginPageCount,
    hasEnd,
  )
  if (hasEnd)
    pages.push({ type: 'BREAK', num: pageCount - startOffset - endGap - marginPageCount + 1 })
  addPages(pageCount - marginPageCount + 1, pageCount)
  return [prev, ...pages, next]
}
