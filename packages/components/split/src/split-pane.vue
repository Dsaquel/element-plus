<template>
  <div
    ref="paneRef"
    :class="[
      ns.b(),
      { 'is-vertical': splitContext?.props.direction === 'vertical' },
    ]"
    :style="paneStyle"
  >
    <div class="PANE CONTENT">
      <slot />
    </div>
    <div
      class="SPLITTER"
      :style="lineStyle"
      @mousedown.prevent="(e) => splitContext.dragStart(e, index)"
    />
  </div>
</template>

<script lang="ts" setup>
import {
  computed,
  getCurrentInstance,
  inject,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  shallowRef,
  watch,
  watchEffect,
} from 'vue'
import { useNamespace } from '@element-plus/hooks'
import { throwError } from '@element-plus/utils'
import { splitContextKey } from './types'

import type { CSSProperties } from 'vue'

export interface SplitPaneState {
  uid: number
  element: HTMLDivElement
  size: number
  setIndex: (val: number) => void
}

const COMPONENT_NAME = 'ElSplitPane'
defineOptions({
  name: COMPONENT_NAME,
})

const ns = useNamespace('split-pane')
const index = ref(-1)
const size = ref(0)
const lineStyle = ref<CSSProperties>({})
const currentInstance = getCurrentInstance()
const splitContext = inject(splitContextKey, undefined)
if (!splitContext) throwError(COMPONENT_NAME, 'can not inject split context')

onMounted(() => {
  watch(splitContext.panes, calcSplitter, { immediate: true })
})

onBeforeUnmount(() => {
  splitContext.removePane(splitPaneState.uid)
})

const paneRef = shallowRef<HTMLDivElement>()

const setIndex = (val: number) => {
  index.value = val
}

const paneStyle = computed<CSSProperties>(() => {
  if (!splitContext.containerRef.value) return {}
  return {
    [splitContext.props.direction === 'vertical'
      ? 'height'
      : 'width']: `${size.value}px`,
  }
})

const fixToPrecision = (value: number) => Number.parseFloat(value.toFixed(6))
const calcSplitter = () => {
  const style: CSSProperties = {
    backgroundColor: 'black',
    cursor:
      splitContext.props.direction === 'vertical' ? 'ns-resize' : 'ew-resize',
    width: splitContext.panes.value.length > index.value + 1 ? '3px' : 0,
  }

  size.value =
    splitContext.containerRef.value!.offsetWidth *
    fixToPrecision(1 / splitContext.panes.value.length)
  lineStyle.value = style
}

const splitPaneState = reactive({
  element: computed(() => paneRef.value!),
  uid: currentInstance!.uid,
  setIndex,
  size,
})

splitContext.addPane(splitPaneState)

watchEffect(() => {
  size.value = splitPaneState.size
})
</script>
