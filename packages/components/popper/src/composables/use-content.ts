import {
  computed,
  inject,
  onMounted,
  ref,
  unref,
  watch,
  watchEffect,
} from 'vue'
import { isUndefined } from 'lodash-unified'
import { usePopper } from '@element-plus/hooks'
import { POPPER_INJECTION_KEY } from '../constants'
import { buildPopperOptions, unwrapMeasurableEl } from '../utils'

import type {} from '@floating-ui/dom'
import type { PopperContentProps } from '../content'

const DEFAULT_ARROW_OFFSET = 0

export const usePopperContent = async (props: PopperContentProps) => {
  const { popperInstanceRef, contentRef, triggerRef, role } = inject(
    POPPER_INJECTION_KEY,
    undefined
  )!

  const arrowRef = ref<HTMLElement>()
  const arrowOffset = computed(() => props.arrowOffset)

  const eventListenerModifier = computed(() => {
    return {
      name: 'eventListeners',
      enabled: !!props.visible,
    }
  })

  const arrowModifier = computed(() => {
    const arrowEl = unref(arrowRef)
    const offset = unref(arrowOffset) ?? DEFAULT_ARROW_OFFSET
    // Seems like the `phase` and `fn` is required by Modifier type
    // But on its documentation they didn't specify that.
    // Refer to https://popper.js.org/docs/v2/modifiers/arrow/
    return {
      name: 'arrow',
      enabled: !isUndefined(arrowEl),
      options: {
        element: arrowEl,
        padding: offset,
      },
    } as any
  })

  // const options = computed<PartialOptions>(() => {
  //   return {
  //     onFirstUpdate: () => {
  //       update()
  //     },
  //     ...buildPopperOptions(props, [
  //       unref(arrowModifier),
  //       unref(eventListenerModifier),
  //     ]),
  //   }
  // })

  const computedReference = computed(
    () => unwrapMeasurableEl(props.referenceEl) || unref(triggerRef)
  )

  const styles = ref<Partial<CSSStyleDeclaration>>({})

  watchEffect(async () => {
    if (!computedReference.value || !contentRef.value)
      return console.log('here!')
    styles.value = await usePopper(computedReference, contentRef)
    console.log(styles.value)
  })

  // watch(instanceRef, (instance) => (popperInstanceRef.value = instance), {
  //   flush: 'sync',
  // })

  // onMounted(() => {
  //   watch(
  //     () => unref(computedReference)?.getBoundingClientRect(),
  //     () => {
  //       update()
  //     }
  //   )
  // })

  return {
    arrowRef,
    contentRef,
    styles,
    role,
  }
}

export type UsePopperContentReturn = ReturnType<typeof usePopperContent>
