<template>
  <UForm :state="state" :schema="schema" @submit.prevent="saveSettings">
    <UFormField label="Transaction View" class="mb-4 min-w-4/5 items-center" help="Choose how you would like to view transactions">
      <USelect v-model="state.transactionView" :items="transactionViewOptions" class="w-full" size="xl" variant="subtle" />
    </UFormField>
    <UButton type="submit" color="info" variant="solid" label="Save Changes" :loading="pending"  />
  </UForm>
</template>

<script setup>
import { z } from 'zod'
import {transactionViewOptions} from  '~/constants' 

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { toastSuccess, toastError } = useAppToast()
const pending = ref(false)
const state = ref({
  transactionView: user.value.user_metadata?.transaction_view ?? transactionViewOptions[1]
})
const schema = z.object({
  transactionView: z.enum(transactionViewOptions)
})

const saveSettings = async () => {
  pending.value = true

  try {
    const { error } = await supabase.auth.updateUser({
      data: {transaction_view: state.value.transactionView}
    })
    if (error) throw error
    
    await supabase.auth.refreshSession()

    const { data: refreshed } = await supabase.auth.getUser()
    if (refreshed?.user) {
      user.value = refreshed.user  
    }
    

    toastSuccess({
      title: 'Settings updated',
    })
  } catch (error) {
    toastError({
      title: 'Error updating settings',
      description: error.message,
    })
  } finally {
    pending.value = false
  }
}

</script>








