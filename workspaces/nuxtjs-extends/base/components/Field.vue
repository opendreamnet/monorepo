<template>
  <div class="field">
    <div v-if="title" class="field__title" v-html="$md.render(title)" />
    <div v-if="description" class="field__description" v-html="$md.render(description)" />

    <div class="field__content">
      <slot />
    </div>

    <div v-if="hint" class="field__hint" v-html="$md.render(hint)" />
    <div v-if="error" class="field__error" v-html="$md.render(error)" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
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
  .field__title {
    @apply text-sm;
  }

  .field__description {
    @apply text-sm;
  }

  .field__hint {
    @apply text-xs;
  }
}

.field--danger {
  .field__title {
    @apply text-danger;
  }
}

.field__title {
  @apply font-semibold text-white;

  &::v-deep {
    p {
      @apply m-0;
    }
  }
}

.field__description {
  @apply max-w-prose text-snow-dark;

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
  @apply mt-3 mb-1;
}

.field__hint {
  @apply text-sm text-snow-darker;
}

.field__error {
  @apply text-sm font-semibold text-danger;
}
</style>
