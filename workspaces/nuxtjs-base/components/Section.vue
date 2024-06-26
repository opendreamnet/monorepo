<template>
  <div class="relative w-full">
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between border-b border-gray-800 py-8">
      <div class="section__left">
        <div v-if="title" class="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          {{ title }}
        </div>

        <div v-if="subtitle" class="mt-4 text-lg text-gray-400">
          {{ subtitle }}
        </div>
      </div>

      <div v-if="$slots.header" class="section__right">
        <slot name="header" />
      </div>
    </div>

    <div class="py-8">
      <slot />
    </div>
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
    subtitle: {
      type: String,
      default: null
    }
  }
})
</script>

<style lang="scss" scoped>
.section {
  &:not(:last-of-type) {
    @apply border-b border-menus pb-12;
  }

  &:not(:first-of-type) {
    @apply pt-12;
  }
}

.section__header {
  @apply mb-14;
}

.section__title {
  @apply text-origin-lighten font-bold text-4xl;
}

.section__subtitle {
  @apply text-origin-darken;
}
</style>
