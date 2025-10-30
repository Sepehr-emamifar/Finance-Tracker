<template>
  <section class="flex items-center justify-between mb-10">
    <h1 class="text-4xl font-extrabold">summary</h1>
    <div>
      <USelect class="min-w-25" v-model="selectedView" :items="transactionViewOptions" />
    </div>
  </section>

  <section
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 sm:gap-16 mb-20"
  >
    <Trend
      color="green"
      title="Income"
      :amount="incomeTotal"
      :last-amount="prevIncomeTotal"
      :loading="pending"
    />
    <Trend
      color="red"
      title="Expense"
      :amount="expenseTotal"
      :last-amount="prevExpenseTotal"
      :loading="pending"
    />
    <Trend
      color="green"
      title="Investments"
      :amount="investmentsTotal"
      :last-amount="3000"
      :loading="pending"
    />
    <Trend
      color="red"
      title="Saving"
      :amount="savingTotal"
      :last-amount="4100"
      :loading="pending"
    />
  </section>

  <section class="flex justify-between mb-10">
    <div>
      <h2 class="font-extrabold text-2xl">Transactions</h2>
      <div class="text-gray-500 dark:text-gray-400">
        You have {{ incomeCount }} incomes and {{ expenseCount }} expense in
        this period
      </div>
    </div>
    <div>
      <TransactionModal
        v-model="isOpen"
        @click="isOpen = true"
        @saved="refresh()"
      >
       <UButton
          label="Add"
          color="neutral"
          variant="outline"
          icon="i-heroicons-plus-circle"
        />
    </TransactionModal>
    </div>
  </section>

  <section v-if="!pending">
    <div v-for="(transactionOnDay, date) in byDate" :key="date" class="mb-10">
      <DailyTransactionSummary :date="date" :transactions="transactionOnDay" />
      <Transactions
        v-for="transaction in transactionOnDay"
        :key="transaction.id"
        :transaction="transaction"
        @deleted="handleDelete & refresh()"
        @edited = 'refresh()'
      />
    </div>
  </section>
  <section v-else>
    <USkeleton
      class="h-10 w-full mb-2"
      v-for="i in transactionLength || 4"
      :key="i"
    />
  </section>
</template>

<script setup>
import { transactionViewOptions } from "~/constants";

const user = useSupabaseUser()

const selectedView = ref(user.value.user_metadata?.transaction_view ?? transactionViewOptions[1]);
const isOpen = ref(false);

const {previous, current} = useSelectedTimePeriod(selectedView)

const {
  pending,
  refresh,
  transactions: {
    incomeCount,
    expenseCount,
    incomeTotal,
    expenseTotal,
    investmentsTotal,
    savingTotal,
    grouped: { byDate },
    handleDelete,
    transactionLength,
  },
} = useFetchTransactions(current);
await refresh();

const {
  refresh:refreshPrevious,
  transactions:{
    incomeTotal:prevIncomeTotal ,
     expenseTotal: prevExpenseTotal} 
} = useFetchTransactions(previous)
await refreshPrevious()
</script>
