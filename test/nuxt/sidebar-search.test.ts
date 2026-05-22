// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import DefaultLayout from '~/layouts/default.vue'

describe('sidebar search', () => {
  it('renders the search button', async () => {
    const wrapper = await mountSuspended(DefaultLayout)
    expect(wrapper.html()).toContain('Search')
  })
})
