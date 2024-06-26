<template>
  <div>
    <div
      v-if="title"
      class="block font-medium text-gray-200"
      v-html="title" />

    <div
      v-if="description"
      class="text-gray-400 text-sm"
      v-html="description" />

    <div class="mt-1 relative">
      <slot />
    </div>

    <div
      v-if="hint"
      class="mt-2 text-gray-400 text-sm"
      v-html="hint" />

    <div
      v-if="error"
      class="mt-2 text-red-400 text-sm"
      v-html="error" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    title: {
      type: String,
      default: null
    },
    description: {
      type: String,
      default: null
    },
    hint: {
      type: String,
      default: null
    },
    error: {
      type: String,
      default: null
    }
  }
})
</script>
