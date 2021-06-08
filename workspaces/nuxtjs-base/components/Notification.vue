<template>
  <div class="notification">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.notification {
  @apply mb-6 py-3 pl-3 pr-6 rounded;
  @apply bg-night-light text-white text-sm;
  @include transition('background-color, color, box-shadow');

  &:hover {
    @apply shadow;
  }

  h5 {
    @apply font-bold;
    margin-bottom: 6px;
  }

  a {
    @apply underline;
  }

  .icon {
    @apply mr-1;
  }

  pre {
    @apply text-xs overflow-auto bg-black p-2 text-white break-words whitespace-pre-wrap;
    max-height: 100px;
  }
}
</style>
