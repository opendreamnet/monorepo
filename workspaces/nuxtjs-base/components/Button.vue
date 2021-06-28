<template>
  <component
    :is="el" class="button" :class="css"
    v-bind="$attrs" v-on="$listeners">
    <slot />
  </component>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    el: {
      type: [String, Element],
      default: 'button'
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    css() {
      return { 'button--loading': this.loading === true }
    }
  }
})
</script>

<style lang="scss" scoped>
@keyframes spinAround{from{transform:rotate(0)}to{transform:rotate(359deg)}}

.button {
  @apply inline-flex items-center justify-center relative;
  @apply px-5 text-sm text-snow-lighter rounded-3xl font-semibold uppercase tracking-wide;
  @apply outline-none #{!important};
  @include transition('background-color, color, box-shadow');
  height: $input-height;

  &::v-deep {
    .icon {
      &:not(:last-child) {
        margin-right: 8px;
      }
    }
  }

  &[disabled],
  &.button--disabled {
    @apply opacity-50 cursor-not-allowed pointer-events-none;
  }

  &.button--active,
  &.nuxt-link-exact-active {
    @apply bg-primary;
  }

  &.button--loading {
    @apply text-transparent pointer-events-none #{!important};
    text-shadow: none !important;

    &::after {
      @apply absolute rounded-full block border-2 border-white;
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

  /* Sizes */

  &.button--xs {
    @apply text-xs;
    height: $input-xs-height;
  }

  &.button--sm {
    @apply text-sm;
    height: $input-sm-height;
  }

  &.button--lg {
    @apply text-lg;
    height: $input-lg-height;
  }

  &.button--xl {
    @apply text-xl;
    height: $input-xl-height;
  }

  /* Default theme */

  @apply bg-button;

  &:hover,
  &:active {
    @apply bg-button-light shadow-lg;
  }

  /*
  &:focus {
    @apply bg-black;
  }
  */

  /* Primary */

  &.button--primary {
    @apply text-black bg-primary;

    &:hover,
    &:active {
      @apply bg-primary-light;
    }

    &:focus {
      @apply bg-primary-dark;
    }
  }

  &.button--warning {
    @apply bg-warning text-night-darker shadow;

    &:hover,
    &:active {
      @apply bg-warning-light;
    }

    &:focus {
      @apply bg-warning-dark;
    }
  }

  &.button--danger {
    @apply bg-danger text-night-darker shadow;

    &:hover,
    &:active {
      @apply bg-danger-light;
    }

    &:focus {
      @apply bg-danger-dark;
    }
  }

  &.button--success {
    @apply bg-success text-night-darker shadow;

    &:hover,
    &:active {
      @apply bg-success-light;
    }

    &:focus {
      @apply bg-success-dark;
    }
  }

  &.button--info {
    @apply bg-blue text-night-darker shadow;

    &:hover,
    &:active {
      @apply bg-blue-light;
    }

    &:focus {
      @apply bg-blue-dark;
    }
  }

  /*
  &.button--glass {
    @apply bg-transparent;

    &:hover,
    &:active,
    &:focus {
      @apply bg-opacity-30;
    }
  }
  */
}
</style>

<style lang="scss">
.buttons {
  @apply flex flex-wrap;

  .button {
    @apply rounded-none;

    &:first-child {
      @apply rounded-l-full;
    }

    &:last-child {
      @apply rounded-r-full;
    }
  }
}
</style>
