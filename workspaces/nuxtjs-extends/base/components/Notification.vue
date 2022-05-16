<template>
  <div class="notification">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.notification {
  @apply mb-6 p-5 rounded;
  @apply bg-night-light text-white text-sm;

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
