<template>
    <UForm :state="state" :schema="schema" @submit.prevent="saveProfile" >
         <UFormField
          label="Full name"
          :required="true"
          name="name"
          class="min-w-4/5 mb-4"
        >
          <UInput
            placeholder="Full name"
            class="w-full"
            size="xl"
            variant="subtle"
            
            v-model="state.name"
          />
        </UFormField>

         <UFormField
          label="Email"
          :required="true"
          name="email"
          class="min-w-4/5 mb-4"
          help="You will receive emails on new and old emails"
        >
          <UInput
            placeholder="Email"
            class="w-full"
            size="xl"
            variant="subtle"
            v-model="state.email"
          />
        </UFormField>
        <UButton type="submit" color="info" label="Save Changes" :loading="pending"> 

        </UButton>
    </UForm>

</template>

<script setup> 
import { z } from 'zod'  

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const {toastSuccess , toastError} = useAppToast()
const pending = ref(false)

const state = ref({
    name: user.value.user_metadata?.full_name,
    email: user.value.email
})
const schema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email()
})

const saveProfile = async()=>{
    pending.value = true


    try {
        const data = {
            data:{
                full_name:state.value.name
            }
        }

        if(state.value.email !== user.value.email){
            data.email = state.value.email
        }

        console.log(data)
        const {error} = await supabase.auth.updateUser({
            data:{
                full_name : state.value.name
            }
        })
    if(error) throw error
    toastSuccess({
        title:'Profile updated',
        description:'Your profile has been Updated'
    })

    } catch (error) {
        toastError({
            title: 'Error updating profile',
            description: error.message
        })
    }finally{
        pending.value = false
    }

}
</script>