<template>
  <div class="loading" />
</template>

<style lang="scss" scoped>
.loading {
  @apply relative transform;
  height: 1em;
  width: 1em;

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
</style>
