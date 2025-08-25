import React, { useState, useEffect } from "react";
import TransactionList from "@/components/organisms/TransactionList";
import TransactionForm from "@/components/organisms/TransactionForm";
import Modal from "@/components/atoms/Modal";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const RecurringTransactions = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editTransaction, setEditTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Recurring Transactions
          </h1>
          <p className="text-gray-600">
            Manage your recurring income and expenses like bills, subscriptions, and regular payments
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2"
        >
          <ApperIcon name="Plus" size={16} />
          <span className="hidden sm:inline">Add Transaction</span>
        </Button>
      </div>

      {/* Use TransactionList with recurring filter pre-applied */}
      <div className="recurring-transactions-container">
        <TransactionList 
          refresh={refreshTrigger}
          onEdit={handleEdit}
          initialFilter="recurring"
        />
      </div>

      {/* Add Transaction Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <TransactionForm
          onTransactionAdded={handleTransactionAdded}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Edit Transaction Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <TransactionForm
          editTransaction={editTransaction}
          onTransactionAdded={handleTransactionAdded}
          onEditComplete={handleEditComplete}
        />
      </Modal>
    </div>
  );
};

export default RecurringTransactions;