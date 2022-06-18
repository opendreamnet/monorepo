<template>
  <div class="box" v-on="$listeners">
    <!-- Header -->
    <div v-if="showHeader" class="box__header">
      <slot name="header">
        <div class="title">
          <Tooltip v-if="tooltip" :content="tooltip" />
          <span>{{ title }}</span>
        </div>

        <div v-if="subtitle" class="subtitle">
          {{ subtitle }}
        </div>
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
import { defineComponent } from 'vue'

export default defineComponent({
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
      return this.photo || this.$slots.photo
    },

    showHeader() {
      return this.title || this.$slots.header
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

  &.box--xs {
    .box__header {
      @apply px-2 py-2;
    }

    .box__body {
      @apply p-4;
    }
  }

  &.box--sm {
    .box__header {
      @apply px-4 py-2;
    }

    .box__body {
      @apply p-6;
    }
  }

  .box__header {
    @apply bg-menus-dark rounded-tr rounded-tl;
    @apply px-6 py-4;

    .title {
      @apply font-bold space-x-2 text-lg;
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
    @apply p-6;
  }

  .box__footer {
    @apply border-t border-button;
  }
}
</style>
