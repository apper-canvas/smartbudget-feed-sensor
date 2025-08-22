import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { userService } from "@/services/api/userService";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";

const Settings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    currency: "USD",
    timeZone: "America/New_York"
  });

  const currencies = [
    { value: "USD", label: "USD - US Dollar" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
    { value: "CAD", label: "CAD - Canadian Dollar" },
    { value: "AUD", label: "AUD - Australian Dollar" },
    { value: "JPY", label: "JPY - Japanese Yen" },
    { value: "CHF", label: "CHF - Swiss Franc" },
    { value: "CNY", label: "CNY - Chinese Yuan" }
  ];

  const timeZones = [
    { value: "America/New_York", label: "Eastern Time (UTC-5/-4)" },
    { value: "America/Chicago", label: "Central Time (UTC-6/-5)" },
    { value: "America/Denver", label: "Mountain Time (UTC-7/-6)" },
    { value: "America/Los_Angeles", label: "Pacific Time (UTC-8/-7)" },
    { value: "Europe/London", label: "London Time (UTC+0/+1)" },
    { value: "Europe/Paris", label: "Central European Time (UTC+1/+2)" },
    { value: "Asia/Tokyo", label: "Japan Time (UTC+9)" },
    { value: "Asia/Shanghai", label: "China Time (UTC+8)" },
    { value: "Australia/Sydney", label: "Australian Eastern Time (UTC+10/+11)" }
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Assuming user ID 1 for demo purposes
      const userData = await userService.getById(1);
      setUser(userData);
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        currency: userData.currency || "USD",
        timeZone: userData.timeZone || "America/New_York"
      });
    } catch (err) {
      setError("Failed to load user settings");
      console.error("Settings load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validate required fields
      if (!formData.name.trim()) {
        toast.error("Name is required");
        return;
      }
      
      if (!formData.email.trim()) {
        toast.error("Email is required");
        return;
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Please enter a valid email address");
        return;
      }

      const updatedUser = await userService.update(user.Id, formData);
      setUser(updatedUser);
      toast.success("Settings saved successfully!");
      
    } catch (err) {
      toast.error("Failed to save settings");
      console.error("Settings save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        currency: user.currency || "USD",
        timeZone: user.timeZone || "America/New_York"
      });
      toast.info("Settings reset to saved values");
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadUserData} />;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-gray-600 mt-2">Manage your profile and application preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-br from-primary/10 to-blue-600/10 p-3 rounded-xl border border-primary/20">
                <ApperIcon name="User" size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                <p className="text-gray-600">Update your personal details</p>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter your full name"
              />

              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your email address"
              />

              <Input
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter your phone number (optional)"
              />
            </div>
          </Card>

          {/* Preferences */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-br from-secondary/10 to-purple-600/10 p-3 rounded-xl border border-secondary/20">
                <ApperIcon name="Settings2" size={24} className="text-secondary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Preferences</h2>
                <p className="text-gray-600">Customize your application settings</p>
              </div>
            </div>

            <div className="space-y-4">
              <Select
                label="Preferred Currency"
                value={formData.currency}
                onChange={(e) => handleInputChange("currency", e.target.value)}
                options={currencies}
              />

              <Select
                label="Time Zone"
                value={formData.timeZone}
                onChange={(e) => handleInputChange("timeZone", e.target.value)}
                options={timeZones}
              />
            </div>
          </Card>
        </div>

        {/* Actions & Summary */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-br from-success/10 to-green-600/10 p-3 rounded-xl border border-success/20">
                <ApperIcon name="Check" size={24} className="text-success" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Actions</h3>
                <p className="text-gray-600 text-sm">Save or reset your changes</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full"
                variant="primary"
              >
                {saving ? (
                  <>
                    <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <ApperIcon name="Save" size={16} className="mr-2" />
                    Save Settings
                  </>
                )}
              </Button>

              <Button
                onClick={handleReset}
                disabled={saving}
                className="w-full"
                variant="outline"
              >
                <ApperIcon name="RotateCcw" size={16} className="mr-2" />
                Reset Changes
              </Button>
            </div>
          </Card>

          {/* Current Settings Summary */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-br from-accent/10 to-emerald-600/10 p-2 rounded-lg border border-accent/20">
                <ApperIcon name="Info" size={20} className="text-accent" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Current Settings</h3>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Currency:</span>
                <span className="font-medium text-gray-900">{formData.currency}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Time Zone:</span>
                <span className="font-medium text-gray-900 text-xs">
                  {timeZones.find(tz => tz.value === formData.timeZone)?.label.split(" ")[0] || formData.timeZone}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Profile:</span>
                <span className="font-medium text-gray-900">
                  {formData.name ? "Complete" : "Incomplete"}
                </span>
              </div>
            </div>
          </Card>

          {/* Help & Support */}
          <Card className="p-6 bg-gradient-to-br from-gray-50/50 to-white">
            <div className="text-center">
              <div className="bg-gradient-to-br from-info/10 to-blue-600/10 p-3 rounded-xl border border-info/20 inline-block mb-4">
                <ApperIcon name="HelpCircle" size={24} className="text-info" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-600 text-sm mb-4">
                Contact support if you need assistance with your settings.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toast.info("Support feature coming soon!")}
              >
                <ApperIcon name="Mail" size={16} className="mr-2" />
                Contact Support
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;