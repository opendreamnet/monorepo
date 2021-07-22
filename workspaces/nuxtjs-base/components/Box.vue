<template>
  <div class="box" v-on="$listeners">
    <!-- Header -->
    <div v-if="showHeader" class="box__header">
      <slot name="header">
        <h2 class="title">
          <Tooltip v-if="tooltip" :content="tooltip" />
          <span>{{ title }}</span>
        </h2>

        <h3 v-if="subtitle" class="subtitle">
          {{ subtitle }}
        </h3>
      </slot>
    </div>

    <!-- Photo -->
    <div v-if="showPhoto" class="box__photo">
      <slot name="photo">
        <div class="box__photo__preview" :class="photo" />
      </slot>
    </div>

    <!-- Content -->
    <div v-if="content" class="box__body" v-html="prettyContent" />

    <div v-else class="box__body">
      <slot />
    </div>

    <!-- Footer -->
    <div v-if="$slots.footer" class="box__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { isNil } from 'lodash'

export default Vue.extend({
  props: {
    title: {
      type: String,
      default: null
    },
    subtitle: {
      type: String,
      default: null
    },
    photo: {
      type: [String, Array],
      default: null
    },
    tooltip: {
      type: [String, Object],
      default: null
    },
    content: {
      type: String,
      default: null
    }
  },

  computed: {
    showPhoto() {
      return !isNil(this.photo) || !isNil(this.$slots.photo)
    },

    showHeader() {
      return !isNil(this.title) || !isNil(this.$slots.header)
    },

    prettyContent() {
      return this.$md.render(this.content)
    }
  }
})
</script>

<style lang="scss" scoped>
.box {
  @apply flex flex-col;
  @apply bg-menus shadow-lg rounded;

  &:not(.box--header--p0) {
    .box__header {
      @apply px-7 py-4;
    }
  }

  &:not(.box--body--p0) {
    .box__body {
      @apply p-7;
    }
  }

  &:not(.box--footer--p0) {
    .box__footer {
      @apply px-7 py-4;
    }
  }

  &.box--xs {
    .box__header {
      @apply px-3 py-2;
    }

    .box__body {
      @apply p-3;
    }

    .box__footer {
      @apply px-3 py-2;
    }
  }

  &.box--sm {
    .box__header {
      @apply px-6 py-2;
    }

    .box__body {
      @apply p-6;
    }

    .box__footer {
      @apply px-6 py-2;
    }
  }

  .box__header {
    @apply bg-menus-dark rounded-tr rounded-tl;

    .title {
      @apply font-bold text-snow-lighter space-x-2;
    }

    .subtitle {
      @apply text-snow-dark text-sm;
    }
  }

  .box__photo {
    @apply relative bg-center bg-menus-dark;
    min-height: 130px;

    .box__photo__image {
      @apply absolute top-0 bottom-0 left-0 right-0 z-10;
      @apply bg-contain bg-no-repeat bg-center m-3;
    }
  }

  .box__body {
    @apply flex-1 relative;
  }

  .box__footer {
    @apply border-t border-menus-lighten;
  }
}
</style>
