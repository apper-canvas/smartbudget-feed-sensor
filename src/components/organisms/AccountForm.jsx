import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { accountService } from "@/services/api/accountService";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";

const AccountForm = ({ account, onAccountAdded, onAccountUpdated, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "checking",
    balance: "",
    accountNumber: "",
    bankName: "",
    isLinked: false
  });
  const [loading, setLoading] = useState(false);
  const [linkingMode, setLinkingMode] = useState(false);
  const [linkData, setLinkData] = useState({
    bankName: "",
    accountNumber: "",
    routingNumber: ""
  });

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name || "",
        type: account.type || "checking",
        balance: account.balance?.toString() || "",
        accountNumber: account.accountNumber || "",
        bankName: account.bankName || "",
        isLinked: account.isLinked || false
      });
    }
  }, [account]);

  const accountTypes = [
    { value: "checking", label: "Checking", icon: "Landmark", color: "#2563EB" },
    { value: "savings", label: "Savings", icon: "PiggyBank", color: "#10B981" },
    { value: "credit", label: "Credit Card", icon: "CreditCard", color: "#EF4444" },
    { value: "cash", label: "Cash", icon: "Wallet", color: "#F59E0B" },
    { value: "investment", label: "Investment", icon: "TrendingUp", color: "#7C3AED" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedType = accountTypes.find(t => t.value === formData.type);
      const accountData = {
        ...formData,
        balance: parseFloat(formData.balance) || 0,
        color: selectedType.color,
        icon: selectedType.icon
      };

      if (account) {
        await accountService.update(account.Id, accountData);
        onAccountUpdated();
      } else {
        await accountService.create(accountData);
        onAccountAdded();
      }
    } catch (err) {
      toast.error(`Failed to ${account ? "update" : "create"} account`);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkAccount = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await accountService.linkAccount(
        linkData.bankName,
        linkData.accountNumber,
        linkData.routingNumber
      );
      toast.success("Account linked successfully!");
      onAccountAdded();
    } catch (err) {
      toast.error("Failed to link account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {account ? "Edit Account" : "Add Account"}
          </h2>
          <p className="text-gray-600">
            {account ? "Update account information" : "Add a new account or link an existing one"}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ApperIcon name="X" size={20} className="text-gray-500" />
        </button>
      </div>

      {!account && (
        <div className="flex gap-2 mb-6">
          <Button
            variant={!linkingMode ? "primary" : "outline"}
            onClick={() => setLinkingMode(false)}
            size="sm"
          >
            Manual Entry
          </Button>
          <Button
            variant={linkingMode ? "primary" : "outline"}
            onClick={() => setLinkingMode(true)}
            size="sm"
          >
            Link Bank Account
          </Button>
        </div>
      )}

      {linkingMode && !account ? (
        <form onSubmit={handleLinkAccount} className="space-y-4">
          <Input
            label="Bank Name"
            value={linkData.bankName}
            onChange={(e) => setLinkData(prev => ({ ...prev, bankName: e.target.value }))}
            placeholder="e.g., Chase, Bank of America"
            required
          />
          <Input
            label="Account Number"
            value={linkData.accountNumber}
            onChange={(e) => setLinkData(prev => ({ ...prev, accountNumber: e.target.value }))}
            placeholder="Enter full account number"
            required
          />
          <Input
            label="Routing Number"
            value={linkData.routingNumber}
            onChange={(e) => setLinkData(prev => ({ ...prev, routingNumber: e.target.value }))}
            placeholder="9-digit routing number"
            required
          />
          
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Linking..." : "Link Account"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Account Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Chase Checking, Main Savings"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {accountTypes.map(type => (
                <label
                  key={type.value}
                  className={`
                    relative flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-all
                    ${formData.type === type.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-300 hover:border-gray-400'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="type"
                    value={type.value}
                    checked={formData.type === type.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="sr-only"
                  />
                  <ApperIcon name={type.icon} size={20} className="mb-1" />
                  <span className="text-sm font-medium">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          <Input
            label="Current Balance"
            type="number"
            step="0.01"
            value={formData.balance}
            onChange={(e) => setFormData(prev => ({ ...prev, balance: e.target.value }))}
            placeholder="0.00"
            required
          />

          {formData.isLinked && (
            <>
              <Input
                label="Bank Name"
                value={formData.bankName}
                onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                placeholder="e.g., Chase Bank"
              />
              <Input
                label="Account Number (Last 4 digits)"
                value={formData.accountNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                placeholder="****1234"
              />
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Saving..." : (account ? "Update Account" : "Add Account")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AccountForm;