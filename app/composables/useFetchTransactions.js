export const useFetchTransactions = (period) => {
  const supabase = useSupabaseClient();
  const transactions = ref([]);
  const pending = ref(false);
  const transactionLength = ref(transactions.value.length);


  const transactionLogic = (i) =>
    computed(() => transactions.value.filter((t) => t.type === i));
  const transactionCounter = (t) => computed(() => t.value.length);
  const transactionTotal = (t) =>
    computed(() => t.value.reduce((acc, cur) => acc + cur.amount, 0));

  const income = transactionLogic("income");
  const expense = transactionLogic("expense");
  const saving = transactionLogic("saving");
  const investments = transactionLogic("investments");

  const incomeCount = transactionCounter(income);
  const expenseCount = transactionCounter(expense);

  const incomeTotal = transactionTotal(income);
  const expenseTotal = transactionTotal(expense);
  const savingTotal = transactionTotal(saving);
  const investmentsTotal = transactionTotal(investments);

 const fetchTransactions = async () => {
  pending.value = true;
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select()
      .gte("created_at", period.value.from.toISOString())
      .lte("created_at", period.value.to.toISOString())
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Fetch error:", err);
    return [];
  } finally {
    pending.value = false;
  }
};
  const refresh = async () => {
    transactions.value = await fetchTransactions();
  };
watch(period,async()=>await refresh() ) 

  const handleDelete = (deletedId) => {
    transactions.value = transactions.value.filter((t) => t.id !== deletedId);
    pending.value = true;
    setTimeout(() => {
      pending.value = false;
    }, 800);
  };

  const transactionsGroupedByDate = computed(() => {
    let grouped = {};

    for (const transaction of transactions.value) {
      const date = transaction.created_at.split("T")[0];

      if (!grouped[date]) {
        grouped[date] = [];
      }

      grouped[date].push(transaction);
    }

    return grouped;
  });
  return {
    transactions: {
      all: transactions,
      grouped: {
        byDate: transactionsGroupedByDate,
      },
      incomeTotal,
      expenseTotal,
      savingTotal,
      investmentsTotal,
      incomeCount,
      expenseCount,
      transactionLength,
    },
    handleDelete,
    refresh,
    pending,
  };
};
