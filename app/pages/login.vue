<template>
    <UCard v-if="!success" class="max-w-3xl mx-auto">
        <template #header>
            sign-in to Finance Tracker
        </template>

        <form @submit.prevent="handleLogin" class="w-4/5 mx-auto">
            <UFormField
            label="Email"
            name="email"    
            :required="true"
            class="mb-4 "
            help="You will receive an email with the confirmation link"
           
            >
            <UInput
                type="email"
                placeholder="Email"
                class="w-full"
                size="xl"
                variant="soft"
                v-model="email"
            />
        </UFormField>
        <UButton
            type="submit"
            color="neutral"
            variant="solid"
            size="xl"
            :loading="pending"
            :disabled="pending"
            
            >Sign-in</UButton
          >
        </form>
    </UCard>

    <UCard v-else>
        <template #header>
            email has been sent
        </template>

        <div class="text-center">
            <p>we have sent an email to <strong>{{email}}</strong> with a link to Sign-in.</p>
            <p>
                <strong>Important:</strong> The link will expire in 5 minutes. 
            </p>
        </div>
    </UCard>
</template>

<script setup>
const success = ref(false)
const email = ref('')
const pending = ref(false)
const {toastSuccess , toastError} = useAppToast();
const supabase = useSupabaseClient()
const redirectUrl = useRuntimeConfig().public.baseUrl
UseIsUserLogIn()


const handleLogin = async()=> {
    pending.value = true

    try{
        const {error} = await supabase.auth.signInWithOtp({
            email : email.value, 
            options:{
                emailRedirectTo: `${redirectUrl}/confirm`
            }
        })
        if(error){
            toastError({
                title:'Error authenticating',
                description:error.message
            })
        }else {
      success.value = true
      toastSuccess({
        title: 'Check your email',
        description: 'We sent you a login link 📧',
      })
    }
    }
    finally{
        pending.value = false
    }
}


</script>