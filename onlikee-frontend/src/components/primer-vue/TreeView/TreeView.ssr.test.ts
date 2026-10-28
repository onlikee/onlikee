import { expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { FileIcon } from '@onlikee/octicons-vue'
import { TreeView } from './index'
import { Link } from '../Link'

it('renders TreeView and its composition without browser globals or per-request state leaks', async () => {
  expect(typeof window).toBe('undefined')
  const render = () =>
    renderToString(
      createSSRApp({
        render: () =>
          h(TreeView, { 'aria-label': 'Files' }, () => [
            h(TreeView.Item, { id: 'src', defaultExpanded: true }, () => [
              h(TreeView.LeadingVisual, { label: 'Directory' }, () => h(TreeView.DirectoryIcon)),
              'src',
              h(TreeView.SubTree, {}, () =>
                h(TreeView.Item, { id: 'file', as: Link, href: '#file' }, () => 'File'),
              ),
            ]),
            h(TreeView.Item, { id: 'loading', defaultExpanded: true }, () => [
              'Async',
              h(TreeView.SubTree, { state: 'loading', count: 3 }),
            ]),
            h(
              TreeView.Item,
              {
                id: 'actions',
                secondaryActions: [{ label: 'Edit', icon: FileIcon, onClick: () => {} }],
              },
              () => 'Actions',
            ),
            h(TreeView.Item, { id: 'error', defaultExpanded: true }, () => [
              'Error directory',
              h(TreeView.SubTree, { state: 'error' }, () =>
                h(TreeView.ErrorDialog, {}, () => 'Failed'),
              ),
            ]),
          ]),
      }),
    )
  const first = await render()
  const second = await render()
  expect(first).toBe(second)
  expect(first).toContain('role="tree"')
  expect(first).toContain('<li role="none"><a')
  expect(first).toContain('href="#file"')
  expect(first).toContain('aria-level="2"')
  expect(first).toContain('data-loading="true"')
  expect(first).toContain('Loading 3 items')
  expect(first).toContain('for more actions.')
})
