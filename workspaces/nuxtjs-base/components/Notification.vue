<template>
  <div class="w-full relative overflow-hidden rounded-lg p-4 text-gray-900 text-sm" :class="css">
    <slot />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    color: {
      type: String,
      default: 'zinc',
    }
  },

  computed: {
    css() {
      return {
        ['notification--' + this.color]: true,
      }
    }
  }
})
</script>

<style lang="scss" scoped>
$colors: "primary", "warning", "danger", "success", "orange", "pink", "blue", "cyan", "green";

@each $color in $colors {
  .notification--#{$color} {
    @apply bg-#{$color}-light;
  }
}

.notification--zinc {
  @apply bg-gray-900 text-white ring-2 ring-gray-800;
}

.notification {
  @apply mb-6 p-4 rounded;
  @apply bg-night-light text-white;

  &.notification--warning {
    @apply bg-warning-light text-black;
  }

  &.notification--danger {
    @apply bg-danger-light text-black;
  }

  &.notification--success {
    @apply bg-success-light text-black;
  }

  &.notification--info {
    @apply bg-blue-light text-black;
  }

  .headline {
    @apply block font-bold mb-2;
  }

  a {
    @apply underline;
  }

  .icon {
    @apply mr-1;
  }

  pre {
    @apply mt-2 text-xs overflow-auto bg-black p-2 text-white break-words whitespace-pre-wrap;
    max-height: 100px;
  }
}
</style>
