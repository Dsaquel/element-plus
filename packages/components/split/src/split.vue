<template>
  <div
    ref="containerRef"
    :class="[ns.b()]"
    @mousemove="dragMove"
    @mouseup="dragEnd"
    @mouseleave="dragEnd"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { getCurrentInstance, provide, ref, shallowRef, watch } from 'vue'
import { useNamespace, useOrderedChildren } from '@element-plus/hooks'
import { splitContextKey } from './types'
import { splitProps } from './split'

import type { SplitPaneState } from './split-pane.vue'

defineOptions({
  name: 'ElSplit',
})
const props = defineProps(splitProps)

const ns = useNamespace('split')
const containerRef = shallowRef<HTMLDivElement>()
const {
  children: panes,
  addChild: addPane,
  removeChild: removePane,
} = useOrderedChildren<SplitPaneState>(getCurrentInstance()!, 'ElSplitPane')

const dragging = ref(false)

watch(panes, () => {
  panes.value.forEach((instance: SplitPaneState, index: number) => {
    instance.setIndex(index)
  })
})

let startPosition = 0
const startSplit = 0
const currentIndex = ref(-1)

function dragMove(e: MouseEvent) {
  if (containerRef.value && dragging.value) {
    const position = props.direction === 'vertical' ? e.pageY : e.pageX
    const totalSize =
      props.direction === 'vertical'
        ? containerRef.value.offsetHeight
        : containerRef.value.offsetWidth
    const dp = position - startPosition
    panes.value[currentIndex.value].size =
      startSplit + +((dp / totalSize) * 100).toFixed(2)
  }
}

function dragStart(e: MouseEvent, index: number) {
  currentIndex.value = index
  dragging.value = true
  startPosition = props.direction === 'vertical' ? e.pageY : e.pageX
  //startSplit = split.value
}

function dragEnd() {
  dragging.value = false
  currentIndex.value = -1
}

provide(splitContextKey, {
  containerRef,
  addPane,
  panes,
  props,
  removePane,
  dragging,
  dragStart,
})

defineExpose({
  //
})
</script>

<style lang="css" scoped>
.dragger {
  width: 10px;
  background-color: blue;
  cursor: ew-resize;
}
</style>
