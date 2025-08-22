import React, { useState, useEffect } from "react";
import TransactionList from "@/components/organisms/TransactionList";

const Transactions = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editTransaction, setEditTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

// Listen for global transaction additions
  useEffect(() => {
    const handleGlobalTransactionAdded = () => {
      setRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener('transactionAdded', handleGlobalTransactionAdded);
    return () => window.removeEventListener('transactionAdded', handleGlobalTransactionAdded);
  }, []);

  const handleTransactionAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    setIsModalOpen(false);
  };

  const handleEdit = (transaction) => {
    setEditTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleEditComplete = () => {
    setEditTransaction(null);
    setIsModalOpen(false);
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


      <TransactionList 
        refresh={refreshTrigger}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default Transactions;