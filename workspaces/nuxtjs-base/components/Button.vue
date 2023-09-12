<template>
  <component
    :is="el"
    class="button"
    :class="css"
    v-bind="$attrs"
    v-on="$listeners">
    <slot />
  </component>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    el: {
      type: String,
      default: 'button'
    },
    loading: {
      type: Boolean,
      default: false
    },
    variant: {
      type: String,
      default: 'solid',
      required: true
    }
  },

  computed: {
    css() {
      return {
        'button--loading': this.loading,
        ['button--' + this.variant]: true
      }
    }
  }
})
</script>

<style lang="scss" scoped>
$colors: "primary", "warning", "danger", "success", "orange", "pink", "blue", "gray", "cyan", "green";

.button {
  @apply relative inline-flex items-center flex-shrink-0 gap-x-2;
  @apply rounded-md shadow-sm font-medium;
  @apply px-3 py-2;

  &:focus {
    @apply outline-none;
  }

  &:focus-visible {
    @apply ring-2 ring-inset ring-primary;
  }

  &[disabled] {
    @apply opacity-60 cursor-not-allowed;
  }

  // Sizes

  &.button--xs {
    @apply text-xs px-2.5 py-1.5 gap-x-1.5;
  }

  &.button--sm {
    @apply text-sm px-2.5 py-1.5 gap-x-1.5;
  }

  &.button--lg {
    @apply text-lg px-3.5 py-2.5 gap-x-2.5;
  }

  &.button--xl {
    @apply text-xl px-3.5 py-2.5 gap-x-2.5;
  }

  // Variants

  &.button--ghost {
    @apply text-origin;

    &:not([disabled]):hover {
      @apply bg-origin-darken;
      @apply bg-opacity-30 #{!important};
    }

    @each $color in $colors {
      &.button--#{$color} {
        @apply text-#{$color};

        &:not([disabled]):hover {
          @apply bg-#{$color}-darken;
        }
      }
    }
  }

  &.button--solid {
    @apply text-black bg-origin;

    &:not([disabled]):hover {
      @apply bg-origin-darken;
    }

    &.button--loading::after {
      @apply border-black;
    }

    @each $color in $colors {
      &.button--#{$color} {
        @apply bg-#{$color};

        &:not([disabled]):hover {
          @apply bg-#{$color}-darken;
        }
      }
    }
  }

  &.button--outline {
    @apply text-origin;
    @apply ring-1 ring-inset ring-current;

    &:not([disabled]):hover {
      @apply bg-origin-darken;
      @apply bg-opacity-30 #{!important};
    }

    @each $color in $colors {
      &.button--#{$color} {
        @apply text-#{$color};

        &:not([disabled]):hover {
          @apply bg-#{$color}-darken;
        }
      }
    }
  }

  &.button--soft {
    @apply text-origin-light bg-origin-darken;
    @apply bg-opacity-20 #{!important};

    &:not([disabled]):hover {
      @apply bg-origin-dark;
    }

    @each $color in $colors {
      &.button--#{$color} {
        @apply text-#{$color} bg-#{$color}-darken;

        &:not([disabled]):hover {
          @apply bg-opacity-50 #{!important};
        }
      }
    }
  }

  &.button--loading {
    @apply text-transparent pointer-events-none #{!important};
    text-shadow: none !important;

    &::after {
      @apply absolute rounded-full block border-2 border-origin;
      @apply animate-spin;
      left: calc(50% - (1em / 2));
      top: calc(50% - (1em / 2));
      border-right-color: transparent;
      border-top-color: transparent;
      content: " ";
      height: 1em;
      width: 1em;
    }
  }
}
</style>

<style lang="scss">
.buttons {
  @apply flex flex-wrap;

  .button {
    @apply rounded-none;

    &:first-child {
      @apply rounded-tl rounded-bl;
    }

    &:last-child {
      @apply rounded-tr rounded-br;
    }
  }
}
</style>
