<template>
  <div class="notification">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
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
