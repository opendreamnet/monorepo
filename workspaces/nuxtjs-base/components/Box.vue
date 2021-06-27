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

  .box__header {
    @apply px-6 py-3 bg-menus-dark rounded-tr rounded-tl;

    .title {
      @apply font-semibold text-snow-lighter space-x-2;
    }

    .subtitle {
      @apply text-sm font-light;
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
    @apply flex-1 p-6 leading-relaxed;
  }

  .box__footer {
    @apply px-6 py-3;
    @apply border-t border-menus-light;
  }

  .box__buttons {

  }
}
</style>
