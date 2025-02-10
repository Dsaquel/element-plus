import { withInstall, withNoopInstall } from '@element-plus/utils'
import Split from './src/split.vue'
import SplitPane from './src/split-pane.vue'
import type { SFCWithInstall } from '@element-plus/utils'

export const ElSplit: SFCWithInstall<typeof Split> & {
  SplitPane: typeof SplitPane
} = withInstall(Split, {
  SplitPane,
})

export default ElSplit

export const ElSplitPane: SFCWithInstall<typeof SplitPane> =
  withNoopInstall(SplitPane)
