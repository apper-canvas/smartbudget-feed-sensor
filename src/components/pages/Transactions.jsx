import React, { useState } from "react";
import TransactionForm from "@/components/organisms/TransactionForm";
import TransactionList from "@/components/organisms/TransactionList";

const Transactions = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editTransaction, setEditTransaction] = useState(null);

  const handleTransactionAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEdit = (transaction) => {
    setEditTransaction(transaction);
    document.getElementById('add-transaction')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEditComplete = () => {
    setEditTransaction(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
          Transactions
        </h1>
        <p className="text-gray-600">
          Track your income and expenses to stay on top of your finances
        </p>
      </div>

      <div id="add-transaction">
        <TransactionForm 
          onTransactionAdded={handleTransactionAdded}
          editTransaction={editTransaction}
          onEditComplete={handleEditComplete}
        />
      </div>

      <TransactionList 
        refresh={refreshTrigger}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default Transactions;