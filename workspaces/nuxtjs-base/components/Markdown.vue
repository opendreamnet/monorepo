<template>
  <div class="markdown" v-html="$md.render($slots.default[0].text)" />
</template>

<style lang="scss" scoped>
.markdown {
  &::v-deep {
    h2 {
      @apply text-xl mb-3 font-semibold;

      &:not(:first-child) {
        @apply mt-6;
      }
    }

    h3 {
      @apply text-lg mb-3;

      &:not(:first-child) {
        @apply mt-4;
      }
    }

    p {
      @apply mb-3;
    }

    ul {
      @apply my-3 ml-6 list-disc text-snow-dark;

      li {
        @apply mb-1;
      }
    }

    a {
      @apply text-primary;

      &:hover {
        @apply underline;
      }
    }

    code {
      @apply bg-night-dark p-1 rounded text-sm font-mono;
    }
  }
}
</style>
