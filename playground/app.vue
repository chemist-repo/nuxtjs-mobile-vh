<template>
  <div style="width: 100%;">
    vh: <ClientOnly>{{ String(vh) }}</ClientOnly>
  </div>
</template>

<script setup lang="ts">
const vh = inject<Ref<number>>('vh', ref(0))
</script>

<style>
body {
  margin: 0;
}
</style>
