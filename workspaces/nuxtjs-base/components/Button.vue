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
    },
    size: {
      type: String,
      default: 'md',
    },
    color: {
      type: String,
      default: 'zinc',
    }
  },

  computed: {
    css() {
      return {
        'button--loading': this.loading,
        ['button--' + this.variant]: true,
        ['button--' + this.size]: true,
        ['button--' + this.color]: true,
      }
    }
  }
})
</script>

<style lang="scss" scoped>
$colors: "primary", "warning", "danger", "success", "orange", "pink", "blue", "gray", "cyan", "green", "zinc";

.button {
  @apply relative inline-flex items-center flex-shrink-0;
  @apply rounded-md font-medium;
  @apply text-left break-all;

  &:focus {
    @apply outline-none;
  }

  &[disabled] {
    @apply opacity-75 cursor-not-allowed;
  }

  // Sizes

  &.button--xs {
    @apply text-xs px-2.5 py-1.5 gap-x-1.5;
  }

  &.button--sm {
    @apply text-sm px-2.5 py-1.5 gap-x-1.5;
  }

  &.button--md {
    @apply text-sm px-3 py-2 gap-x-2;
  }

  &.button--lg {
    @apply text-sm px-3.5 py-2.5 gap-x-2.5;
  }

  &.button--xl {
    @apply text-base px-3.5 py-2.5 gap-x-2.5;
  }

  // Variants

  &.button--solid {
    @apply shadow-sm text-gray-900;

    @each $color in $colors {
      &.button--#{$color} {
        --button-text-color: theme('colors.gray.900');
        @apply bg-#{$color}-light;

        &:not([disabled]):hover {
          @apply bg-#{$color};
        }
      }
    }

    &.button--zinc {
      @apply ring-1 ring-inset ring-gray-700 text-gray-200 bg-gray-800;

      &:not([disabled]):hover {
        @apply bg-gray-700;
      }
    }
  }

  &.button--outline {
    @apply ring-1 ring-inset;

    @each $color in $colors {
      &.button--#{$color} {
        --button-text-color: theme('colors.#{$color}.light');
        @apply text-#{$color}-light ring-#{$color}-light;

        &:not([disabled]):hover {
          @apply bg-#{$color}-darken;
        }

        &[disabled] {
          @apply bg-transparent;
        }

        &:focus {
          @apply ring-2;
        }
      }
    }

    &.button--zinc {
      &:not([disabled]):hover {
        @apply bg-black;
      }
    }
  }

  &.button--ghost {
    @each $color in $colors {
      &.button--#{$color} {
        --button-text-color: theme('colors.#{$color}.light');
        @apply text-#{$color}-light;

        &:not([disabled]):hover {
          @apply bg-#{$color}-darken;
        }

        &[disabled] {
          @apply bg-transparent;
        }
      }
    }

    &.button--zinc {
      &:not([disabled]):hover {
        @apply bg-gray-800;
      }
    }
  }

  &.button--soft {
    @each $color in $colors {
      &.button--#{$color} {
        --button-text-color: theme('colors.#{$color}.light');
        @apply text-#{$color}-light bg-#{$color}-darken;

        &:not([disabled]):hover {
          @apply bg-#{$color}-dark;
        }
      }
    }

    &.button--zinc {
      @apply bg-gray-800;
    }
  }

  &.button--loading {
    @apply text-transparent pointer-events-none #{!important};

    &::after {
      @apply absolute rounded-full block border-2;
      @apply animate-spin;
      border-color: var(--button-text-color);
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
