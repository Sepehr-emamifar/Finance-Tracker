<template>
  <div>
    <div class="mb-4">
      <UFormField label="Current avatar" class="w-full" help="This would be blank by default">
        <UAvatar :src="url" size="3xl" />
      </UFormField>
    </div>

    <div class="mb-4">
      <UFormField label="New avatar" class="w-full" name="avatar"
        help="After choosing an image click Save to actually upload the new avatar">
        <UInput type="file" ref="fileInput" variant="subtle" @change="onFileChange" />
      </UFormField>
    </div>

    <UButton type="submit" color="info" variant="solid" label="Save Changes" :loading="uploading" @click="saveAvatar" />
  </div>
</template>

<script setup>
const {url} = useAvatarUrl()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { toastSuccess, toastError } = useAppToast()

const uploading = ref(false)
const fileInput = ref() 
const selectedFile = ref(null)
const fileExt = ref('')
const fileName = ref('')
const onFileChange = (e) => {
  selectedFile.value = e.target.files[0]
  fileExt.value = selectedFile.value.name.split('.').pop()
  fileName.value = `${Math.random()}.${fileExt.value}`
}

const saveAvatar = async () => {
  // 1. Get the uploaded file
  //    a) If no file uploaded, show toast error
  // 2. Generate the new filename
  console.log(fileExt.value)
    if (!selectedFile.value) {
    toastError({
      title: 'Select a file to upload',
    })
    return
  }

  try {
    uploading.value = true
    console.log('Uploading file:', selectedFile.value)

    // 1. Grab the current avatar URL
    const currentAvatarUrl = user.value.user_metadata?.avatar_url
    // 2. Upload the image to avatars bucket
    const {error} = await supabase.storage
    .from('avatars')
    .upload(fileName.value,selectedFile.value)

    if(error) throw error
    // 3. Update the user metadata with the avatar URL
    await supabase.auth.updateUser({
        data:{
            avatar_url : fileName.value
        }
    })
    await supabase.auth.refreshSession()

    const { data: refreshed } = await supabase.auth.getUser()
    if (refreshed?.user) {
      user.value = refreshed.user  
    }
    
    // 4. (OPTIONALLY) remove the old avatar file
    if(currentAvatarUrl){
        const {error} = await supabase.storage.from('avatars').remove([currentAvatarUrl])
        if(error) throw error
    }
    
    // 5. Reset the file input
    fileInput.value = null
    toastSuccess({
      title: 'Avatar uploaded',
     
    })
  } catch (error) {
    toastError({
      title: 'Error uploading avatar',
      description: error.message
    })
  } finally {
    uploading.value = false
    
  }
}
</script>