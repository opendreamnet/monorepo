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
    }
  },

  computed: {
    css() {
      return { 'button--loading': this.loading }
    }
  }
})
</script>

<style lang="scss" scoped>
@keyframes spinAround{
  from{transform:rotate(0)}
  to{transform:rotate(359deg)}
}

.button {
  @apply inline-flex items-center justify-center relative transition-all rounded;
  @apply px-6 text-sm font-semibold uppercase tracking-wide;
  @apply outline-none #{!important};
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
  --button-color: var(--theme-button);
  --button-bg-color: var(--button-color);
  --button-text-color: var(--theme-origin-lighten);
  --button-hover-bg-color: var(--theme-button-light);
  --button-hover-text-color: var(--button-text-color);
  --button-focus-bg-color: var(--theme-button-light);
  --button-focus-text-color: var(--button-text-color);

  color: var(--button-text-color);
  background-color: var(--button-bg-color);

  &:hover,
  &:active {
    @apply shadow-lg;
    background-color: var(--button-hover-bg-color);
    color: var(--button-hover-text-color);
  }

  &:focus {
    background-color: var(--button-focus-bg-color);
    color: var(--button-focus-text-color);
  }

  /* Primary */

  &.button--primary {
    --button-color: var(--theme-primary);
    --button-text-color: var(--theme-night-darken);
    --button-hover-bg-color: var(--theme-primary-light);
    --button-focus-bg-color: var(--theme-primary-dark);
  }

  &.button--warning {
    --button-color: var(--theme-warning);
    --button-text-color: var(--theme-night-darken);
    --button-hover-bg-color: var(--theme-warning-light);
    --button-focus-bg-color: var(--theme-warning-dark);
  }

  &.button--danger {
    --button-color: var(--theme-danger);
    --button-text-color: var(--theme-night-darken);
    --button-hover-bg-color: var(--theme-danger-light);
    --button-focus-bg-color: var(--theme-danger-dark);
  }

  &.button--success {
    --button-color: var(--theme-success);
    --button-text-color: var(--theme-night-darken);
    --button-hover-bg-color: var(--theme-success-light);
    --button-focus-bg-color: var(--theme-success-dark);
  }

  &.button--orange {
    --button-color: var(--theme-orange);
    --button-text-color: var(--theme-night-darken);
    --button-hover-bg-color: var(--theme-orange-light);
    --button-focus-bg-color: var(--theme-orange-dark);
  }

  &.button--pink {
    --button-color: var(--theme-pink);
    --button-text-color: var(--theme-night-darken);
    --button-hover-bg-color: var(--theme-pink-light);
    --button-focus-bg-color: var(--theme-pink-dark);
  }

  &.button--info {
    --button-color: var(--theme-blue);
    --button-text-color: var(--theme-night-darken);
    --button-hover-bg-color: var(--theme-blue-light);
    --button-focus-bg-color: var(--theme-blue-dark);
  }

  &.button--gray {
    --button-color: var(--theme-gray);
    --button-text-color: var(--theme-night-darken);
    --button-hover-bg-color: var(--theme-gray-light);
    --button-focus-bg-color: var(--theme-gray-dark);
  }

  &.button--cyan {
    --button-color: var(--theme-cyan);
    --button-text-color: var(--theme-night-darken);
    --button-hover-bg-color: var(--theme-cyan-light);
    --button-focus-bg-color: var(--theme-cyan-dark);
  }

  &.button--green {
    --button-color: var(--theme-green);
    --button-text-color: var(--theme-night-darken);
    --button-hover-bg-color: var(--theme-green-light);
    --button-focus-bg-color: var(--theme-green-dark);
  }

  &.button--glass {
    @apply bg-transparent shadow-none;
    --button-text-color: var(--button-color);
    --button-hover-text-color: var(--button-hover-bg-color);
    --button-focus-text-color: var(--button-focus-bg-color);
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
