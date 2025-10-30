<template>
  <div class="grid grid-cols-6 gap-8">
    <UNavigationMenu 
      :items="items" 
      orientation="vertical" 
      class="col-span-2" 
      color="info"
    />
    <div class="col-span-4">
        
      <NuxtPage />
    </div>
  </div>
</template>

<script setup>

const items = [
  {
    label: 'Profile',
    to: '/settings/profile'
  },
  {
    label: 'Avatar',
    to: '/settings/avatar'
  },
  {
    label: 'Settings',
    to: '/settings/settings'
  }
]
</script>
