<template>
  <div
    class="grid grid-cols-3 py-4 border-b border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100"
  >
    <div class="flex items-center justify-between space-x-4 col-span-2">
      <div class="flex items-center space-x-1.5 basis-8/12">
        <UIcon :name="icon" :class="[iconColor]" />
        <div>
          {{ transaction.description }}
        </div>
      </div>

      <div class="basis-3/12">
        <UBadge
          class="w-22 justify-center"
          color="neutral"
          variant="soft"
          v-if="transaction.categories"
        >
          {{ transaction.categories }}
        </UBadge>
      </div>
    </div>

    <div class="flex items-center justify-end space-x-2">
      <div>
        {{ currency }}
      </div>
      <div class="flex gap-2">
         <TransactionModal :transaction="transaction" @saved="emit('edited')">
              <UButton
              class="hover:cursor-pointer"
                @click=" isOpen = true " 
                icon = "i-heroicons-pencil-square-20-solid"
                color="neutral"
                variant="outline"
                />
          </TransactionModal>
          <UButton
          class="hover:cursor-pointer"
            icon="i-heroicons-trash-20-solid"
            color="neutral"
            variant="outline"
            @click="isLoading = true; deleteTransaction()"
            :loading="isLoading"
            :disabled="isLoading"
            />
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  transaction: Object,
});
const emit = defineEmits(["deleted", "deleting" , 'edited']);

const isIncome = computed(() => props.transaction.type === "income");
const icon = computed(() =>
  isIncome.value ? "i-heroicons-arrow-up-right" : "i-heroicons-arrow-down-left"
);
const iconColor = computed(() =>
  isIncome.value ? "text-green-600" : "text-red-600"
);

const { currency } = useCurrency(props.transaction.amount);

const isLoading = ref(false);
const {toastSuccess , toastError} = useAppToast();
const supabase = useSupabaseClient();

const isOpen = ref(false) 

const deleteTransaction = async () => {
  isLoading.value = true;
  emit("deleting", props.transaction.id);

  try {
    await supabase.from("transactions").delete().eq("id", props.transaction.id);
    toastSuccess({
      title: "Transaction deleted",
      icon: "i-heroicons-check-circle",
    });
    emit("deleted", props.transaction.id);
  } catch (error) {
    toastError({
      title: "Error deleting transaction",
      icon: "i-heroicons-exclamation-circle",
    });
  } finally {
    isLoading.value = false;
  }
};

</script>
