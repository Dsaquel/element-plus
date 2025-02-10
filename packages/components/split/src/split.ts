import { buildProps, definePropType } from '@element-plus/utils'

import type { ExtractPropTypes } from 'vue'
import type Split from './split.vue'

export const splitProps = buildProps({
  /**
   * @description Set Split direction
   */
  direction: {
    type: definePropType<'vertical' | 'horizontal'>(String),
    default: 'horizontal',
  },
} as const)

export type SplitProps = ExtractPropTypes<typeof splitProps>

export const splitEmits = {}
export type SplitEmits = typeof splitEmits
export type SplitInstance = InstanceType<typeof Split>
