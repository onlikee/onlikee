import type { FunctionalComponent, VNodeChild } from 'vue'
const RenderContent: FunctionalComponent<{ value: VNodeChild }> = ({ value }) => value
RenderContent.props = ['value']
export default RenderContent
