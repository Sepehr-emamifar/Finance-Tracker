<template>
  <UModal v-model="isOpen">
   <slot></slot>
    <template #header>
       {{ isEditing ? 'Edit' : 'Add' }} Transaction 
      </template>
    <template #body>
      <UForm
        class="flex flex-col gap-5 items-center w-full"
        :state="state"
        :schema="schema"
        ref="form"
        @submit="save"
      >
        <UFormField
          :required="true"
          label="Transaction Type"
          name="type"
          class="min-w-4/5 items-center"
        >
          <USelect
            class="w-full"
            placeholder="Select the transaction type"
            :items="types"
            size="xl"
            variant="soft"
            v-model="state.type"
            :disabled="isEditing"
          />
        </UFormField>

        <UFormField
          label="Amount"
          :required="true"
          name="amount"
          class="min-w-4/5"
        >
          <UInput
            type="number"
            placeholder="Amount"
            class="w-full"
            size="xl"
            variant="soft"
            v-model.number="state.amount"
          />
        </UFormField>

        <UFormField
          label="Transaction date"
          :required="true"
          name="created_at"
          class="min-w-4/5"
        >
          <UInput
            icon="i-heroicons-calendar-days-20-solid"
            color="neutral"
            class="w-full"
            variant="soft"
            size="xl"
            v-model="state.created_at"
            type="date"
          />
        </UFormField>

        <UFormField label="Description" name="description" class="min-w-4/5">
          <UInput
            placeholder="Description"
            class="w-full"
            size="xl"
            variant="soft"
            v-model="state.description"
          />
        </UFormField>

        <UFormField
          :required="true"
          label="categories"
          name="categories"
          class="min-w-4/5"
          v-if="state.type === 'expense'"
        >
          <USelect
            placeholder="categories"
            :items="categories"
            class="w-full"
            size="xl"
            variant="soft"
            v-model="state.categories"
          />
        </UFormField>
        <div class="min-w-4/5 flex mt-5 gap-3">
          <UButton
            class="basis-1/2 justify-center"
            type="submit"
            color="neutral"
            variant="solid"
            size="xl"
            :loading="isLoading"
            
            >Save</UButton
          >
          <UButton
            class="basis-1/2 justify-center"
            type="button"
            color="neutral"
            variant="subtle"
            size="xl"
            :loading="isLoading"
            @click="resetForm();"
            >Clear</UButton
          >
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup>
import { categories, types } from "~/constants";
import * as z from "zod";
const props = defineProps({
  modelValue: Boolean,
  transaction:{
    type: Object,
    required:false,
  }
});



const emit = defineEmits(["update:modelValue", "saved"]);
const isEditing = computed(()=> !!props.transaction)

const initialState = {
  type: "income",
  amount: 0,
  created_at: undefined,
  description: undefined,
  categories: undefined,
};
const state = ref( 
  isEditing.value 
  ? {
  type: props.transaction.type,
  amount: props.transaction.amount,
  created_at: props.transaction.created_at.split('T')[0],
  description: props.transaction.description,
  categories: props.transaction.categories,
  }
  : {...initialState,}
);

const defaultSchema = z.object({
  created_at: z.string(),
  description: z.string().optional(),
  amount: z.number().positive("Amount needs to be more than 0"),
});
const incomeSchema = z.object({
  type: z.literal("income"),
});
const expenseSchema = z.object({
  type: z.literal("expense"),
  categories: z.enum(categories),
});
const investmentSchema = z.object({
  type: z.literal("investment"),
});
const savingSchema = z.object({
  type: z.literal("saving"),
});

const schema = z.intersection(
  z.discriminatedUnion("type", [
    incomeSchema,
    expenseSchema,
    investmentSchema,
    savingSchema,
  ]),
  defaultSchema
);

const form = ref();
const isLoading = ref(false);
const supabase = useSupabaseClient();
const {toastSuccess , toastError} = useAppToast();

const save = async () => {
  if (form.value.errors.length) return;
  try {
    const { error } = await supabase
      .from("transactions")
      .upsert({ ...state.value ,
        id: props.transaction?.id
      });

    if (!error) {
      toastSuccess({
        title: "Transaction Saved!",
        
      });
      isOpen.value = false;
      emit("saved");
      return;
    }
    throw error;
  } catch (e) {
    toastError({
      title: "transaction not saved",
      description: e.message,
      
    });
    console.log(e);
  } finally {
    isLoading.value = false;
  }
};

const resetForm = async () => {
  Object.assign(state.value, initialState);
  form.value.clear();
};

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => {
    if (!value) resetForm();
    emit("update:modelValue", value);
  },
});

</script>
