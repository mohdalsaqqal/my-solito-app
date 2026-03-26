import {
  blockRegistry as blockRegistryImpl,
  getBlockComponent as getBlockComponentImpl,
  getBlockRegistryKey as getBlockRegistryKeyImpl,
} from './block-registry.impl'

export const blockRegistry = blockRegistryImpl
export const getBlockRegistryKey = getBlockRegistryKeyImpl
export const getBlockComponent = getBlockComponentImpl
