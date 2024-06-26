<template>
  <div
    class="rounded-lg divide-y divide-gray-800 ring-1 ring-gray-800 shadow bg-gray-900 w-full"
    v-on="$listeners"
  >
    <!-- Header -->
    <div
      v-if="showHeader"
      class="px-4 py-5 sm:px-6"
    >
      <slot name="header">
        <div class="font-bold leading-6 text-gray-100">
          {{ title }}
        </div>

        <div v-if="subtitle" class="mt-1 text-sm text-gray-400">
          {{ subtitle }}
        </div>
      </slot>
    </div>

    <!-- Content -->
    <div class="px-4 py-5 sm:p-6">
      <slot />
    </div>

    <!-- Footer -->
    <div v-if="$slots.footer" class="px-4 py-4 sm:px-6">
      <slot name="footer" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { isNil } from 'lodash'

export default Vue.extend({
  props: {
    title: {
      type: String,
      default: null
    },
    subtitle: {
      type: String,
      default: null
    }
  },

  computed: {
    showHeader() {
      return this.title !== null || this.$slots.header !== undefined
    },
  }
})
</script>
