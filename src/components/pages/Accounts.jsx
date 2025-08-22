import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { accountService } from "@/services/api/accountService";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Modal from "@/components/atoms/Modal";
import SearchBar from "@/components/molecules/SearchBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import AccountForm from "@/components/organisms/AccountForm";
import AccountCard from "@/components/organisms/AccountCard";

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editAccount, setEditAccount] = useState(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    let filtered = accounts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(account =>
        account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.bankName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(account => account.type === filterType);
    }

    setFilteredAccounts(filtered);
  }, [accounts, searchTerm, filterType]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await accountService.getAll();
      setAccounts(data);
    } catch (err) {
      setError("Failed to load accounts");
      toast.error("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleAccountAdded = () => {
    setIsFormModalOpen(false);
    setEditAccount(null);
    loadAccounts();
    toast.success("Account added successfully!");
  };

  const handleAccountUpdated = () => {
    setIsFormModalOpen(false);
    setEditAccount(null);
    loadAccounts();
    toast.success("Account updated successfully!");
  };

  const handleEdit = (account) => {
    setEditAccount(account);
    setIsFormModalOpen(true);
  };

  const handleDelete = async (accountId) => {
    if (!window.confirm("Are you sure you want to delete this account?")) return;

    try {
      await accountService.delete(accountId);
      setAccounts(prev => prev.filter(a => a.Id !== accountId));
      toast.success("Account deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete account");
    }
  };

  const totalBalance = accounts.reduce((sum, account) => {
    return account.type === "credit" ? sum + account.balance : sum + account.balance;
  }, 0);

  const accountTypes = [
    { value: "all", label: "All Types" },
    { value: "checking", label: "Checking" },
    { value: "savings", label: "Savings" },
    { value: "credit", label: "Credit" },
    { value: "cash", label: "Cash" },
    { value: "investment", label: "Investment" }
  ];

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadAccounts} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
          Accounts
        </h1>
        <p className="text-gray-600">
          Manage your bank accounts, credit cards, and cash balances
        </p>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-br from-primary/10 to-blue-600/10 rounded-xl p-6 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Total Balance</h3>
            <p className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-gradient-to-br from-primary to-blue-600 p-3 rounded-full">
            <ApperIcon name="Wallet" size={24} className="text-white" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search accounts..."
            className="flex-1"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary"
          >
            {accountTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <Button
          onClick={() => setIsFormModalOpen(true)}
          variant="primary"
          className="flex items-center gap-2"
        >
          <ApperIcon name="Plus" size={16} />
          Add Account
        </Button>
      </div>

      {/* Accounts Grid */}
      {filteredAccounts.length === 0 ? (
        <Empty
          title="No accounts found"
          description={searchTerm || filterType !== "all" 
            ? "No accounts match your current filters" 
            : "Add your first account to start tracking your finances"
          }
          icon="CreditCard"
          actionLabel="Add Account"
          onAction={() => setIsFormModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.map((account) => (
            <AccountCard
              key={account.Id}
              account={account}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Account Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditAccount(null);
        }}
        size="lg"
      >
        <AccountForm
          account={editAccount}
          onAccountAdded={handleAccountAdded}
          onAccountUpdated={handleAccountUpdated}
          onCancel={() => {
            setIsFormModalOpen(false);
            setEditAccount(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default Accounts;