import type { SplitProps } from './split'
import type { SplitPaneState } from './split-pane.vue'
import type { InjectionKey, Ref, ShallowRef } from 'vue'

export type SplitContext = {
  containerRef: ShallowRef<HTMLDivElement | undefined>
  dragging: Ref<boolean>
  props: SplitProps
  panes: ShallowRef<SplitPaneState[]>
  addPane: (item: SplitPaneState) => void
  removePane: (uid: number) => void
  dragStart: (e: MouseEvent, index: number) => void
}

export const splitContextKey: InjectionKey<SplitContext> =
  Symbol('splitContextKey')
