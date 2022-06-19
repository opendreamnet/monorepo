<template>
  <div class="field">
    <div v-if="title" class="field__title" v-html="title" />
    <div v-if="description" class="field__description" v-html="description" />

    <div class="field__content">
      <slot />
    </div>

    <div v-if="hint" class="field__hint" v-html="hint" />
    <div v-if="error" class="field__error" v-html="error" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    title: {
      type: String,
      default: null
    },
    description: {
      type: String,
      default: null
    },
    hint: {
      type: String,
      default: null
    },
    error: {
      type: String,
      default: null
    }
  }
})
</script>

<style lang="scss" scoped>
.field--sm {
  .field__title,
  .field__description {
    @apply text-sm;
  }

  .field__hint,
  .field__error {
    @apply text-xs;
  }
}

.field--danger {
  .field__title {
    @apply text-danger;
  }
}

.field__title {
  @apply font-bold text-origin-lighten;

  &::v-deep {
    p {
      @apply m-0;
    }
  }
}

.field__description {
  @apply max-w-prose text-origin-dark;

  &::v-deep {
    p {
      @apply m-0;
    }

    strong {
      @apply font-bold text-white;
    }
  }
}

.field__content {
  @apply mt-4 mb-2;
}

.field__hint {
  @apply text-xs text-origin-darken;
}

.field__error {
  @apply text-sm font-semibold text-danger;
}
</style>
