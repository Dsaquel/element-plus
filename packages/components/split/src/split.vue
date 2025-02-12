<template>
  <div
    ref="containerRef"
    :class="[ns.b(), { 'is-vertical': direction === 'vertical' }]"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { getCurrentInstance, provide, ref, shallowRef, watch } from 'vue'
import { clamp } from 'lodash-unified'
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
const dragState = ref({})

watch(panes, () => {
  panes.value.forEach((instance: SplitPaneState, index: number) => {
    instance.setIndex(index)
  })
})

const startPosition = 0
const currentIndex = ref(-1)

const fixToPrecision = (value: number) => Number.parseFloat(value.toFixed(6))
const MIN = 30
const MAX = 1
const BASE_SHIFT = 6

const onMousemove = (e: MouseEvent) => {
  const currIndex = currentIndex.value
  if (containerRef.value && dragging.value && currIndex >= 0) {
    const position = props.direction === 'vertical' ? e.pageY : e.pageX
    const isIncrease = position > startPosition
    const totalSize =
      props.direction === 'vertical'
        ? containerRef.value.offsetHeight
        : containerRef.value.offsetWidth
    if (position === startPosition || !position) return

    const sizeLeft = panes.value
      .slice(0, currIndex)
      .reduce((prev, curr) => prev + curr.size, BASE_SHIFT / totalSize)

    const incr = fixToPrecision(position / totalSize - sizeLeft)

    const prevVal = panes.value[currIndex].size
    const currVal = clamp(incr, MIN, MAX)

    let ratioToDispatch = prevVal - incr
    if (!ratioToDispatch) return
    //console.log('first', ratioToDispatch)
    let needToPush = currVal === MIN
    let idx = currIndex
    const doLayout = () => {
      const currPanel = panes.value[idx]
      const sum = fixToPrecision(currPanel.size + ratioToDispatch)
      const clampedValue = clamp(sum, MIN, MAX)
      currPanel.size = clampedValue
      const rest = sum - clampedValue
      const clamped = clampedValue === MIN
      return { rest, clamped }
    }

    if (!needToPush) {
      console.log(' ???? ??', currVal)
      panes.value[currIndex].size = currVal
      idx += 1
      const { clamped } = doLayout()
      if (isIncrease && clamped) {
        needToPush = true
      }
    }

    if (needToPush && ratioToDispatch) {
      //console.log('huh ?', ratioToDispatch)
      if (!isIncrease) {
        idx = currentIndex.value
      }

      while (
        idx > 0 &&
        idx < panes.value.length &&
        (needToPush || ratioToDispatch !== 0)
      ) {
        if (isIncrease) {
          ratioToDispatch = -Math.abs(ratioToDispatch)
          idx++
          console.log('passe la', idx)
        } else {
          console.log('ici ?')
          ratioToDispatch = -Math.abs(ratioToDispatch)
          idx--
        }
        //console.log('looping')
        //console.log(idx)
        const { rest, clamped } = doLayout()
        needToPush = clamped
        ratioToDispatch = rest
      }
    }
  }
}

/* eslint-disable @typescript-eslint/no-unused-vars */
const onMouseup = () => {
  dragging.value = false
  currentIndex.value = -1
  //startPosition = 0
  window.removeEventListener('mousemove', onMousemove)
  window.removeEventListener('mouseup', onMouseup)
  window.removeEventListener('mouseleave', onMouseup)
}
/* eslint-enable @typescript-eslint/no-unused-vars */
const onMousedown = (e: MouseEvent, index: number) => {
  dragging.value = true
  const paneState = panes.value[index]
  const elementRect = paneState.element.getBoundingClientRect()
  const containerRect = containerRef.value!.getBoundingClientRect()
  dragState.value = {
    startMouseLeft: e.clientX,
    startLeft: elementRect.right - containerRect.left,
    startPaneLeft: elementRect.left - containerRect.left,
    containerLeft: containerRect.left,
  }
  console.log(dragState.value)
  const handleMouseMove = (e: MouseEvent) => {
    const deltaLeft = e.clientX - (dragState.value as any).startMouseLeft
    const newSize =
      (dragState.value as any).startLeft +
      deltaLeft -
      (dragState.value as any).startPaneLeft
    const incr = newSize - paneState.size
    //console.log('newSize', newSize)
    const rawLeft = paneState.size + incr
    const rawRight = panes.value[index + 1].size - incr
    if (incr === 0) return

    const isIncrease = incr > 0
    const leftSize = Math.max(MIN, rawLeft)
    const rightSize = Math.max(MIN, rawRight)
    const getShift = () => {
      if (isIncrease) {
        if (rawLeft === MIN) {
          console.log('huh ????')
          return incr
        }
        const resizeRest = rightSize - rawRight
        return resizeRest
      } else {
        if (rawLeft === MIN) {
          console.log('decreasqe')
          return incr
        }
        const resizeRest = leftSize - rawLeft
        return resizeRest
      }
    }
    const shift = getShift()

    paneState.size = leftSize
    panes.value[index + 1].size = rightSize

    if (shift !== 0) doPushPanes(isIncrease, shift)
  }
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  const doPushPanes = (isIncrease: boolean, shift: number) => {
    console.log('enter in do push panes with shift=  ', shift)
    let idx = isIncrease ? index + 1 : index

    while (idx > 0 && idx < panes.value.length - 1 && shift !== 0) {
      if (isIncrease) {
        //console.log('increase')
        idx++
        shift = Math.abs(shift)
      } else {
        //console.log('decrease')
        idx--
        shift = Math.abs(shift)
      }
      const currPaneState = panes.value[idx]
      const rawSize = currPaneState.size - shift
      const paneSize = Math.max(MIN, rawSize)
      //console.log('newSize', rawSize)
      currPaneState.size = paneSize
      shift = paneSize - rawSize
    }
  }
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

//window.onmousemove = (ev) => {
//  console.log(ev.clientX)
//}

provide(splitContextKey, {
  containerRef,
  addPane,
  panes,
  props,
  removePane,
  dragging,
  dragStart: onMousedown,
})

defineExpose({
  //
})
</script>
