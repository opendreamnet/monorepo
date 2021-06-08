<template>
  <span v-tooltip="content" class="tooltip icon">
    <FontAwesomeIcon :icon="icon" />
  </span>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    icon: {
      type: [String, Object],
      default: 'question-circle'
    },
    content: {
      type: [String, Object],
      required: true
    }
  }
})
</script>

<style lang="scss" scoped>
.tooltip {
  cursor: help;
}
</style>
