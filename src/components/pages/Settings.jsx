import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { backupService } from "@/services/api/backupService";
import { userService } from "@/services/api/userService";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";

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
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('');

  const currencies = [
    { value: "USD", label: "USD - US Dollar" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
    { value: "CAD", label: "CAD - Canadian Dollar" },
  ];

  const timeZones = [
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
    { value: "Europe/Paris", label: "Central European Time (CET)" },
    { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
  ];

  useEffect(() => {
    loadUserData();
  }, []);


  const handleExportData = async (format) => {
    try {
      setIsExporting(true);
      setExportFormat(format);
      toast.info(`Preparing ${format.toUpperCase()} export...`);

      let result;
      if (format === 'json') {
        result = await backupService.exportToJSON();
      } else if (format === 'csv') {
        result = await backupService.exportToCSV();
      }

      toast.success(`Successfully exported data as ${result.filename}`);
    } catch (error) {
      toast.error(`Failed to export data: ${error.message}`);
    } finally {
      setIsExporting(false);
      setExportFormat('');
    }
  };

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

const updatedUser = await userService.update(user.id, formData);
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

          {/* Action Buttons */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-br from-success/10 to-green-600/10 p-3 rounded-xl border border-success/20">
                <ApperIcon name="Save" size={24} className="text-success" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Save Changes</h2>
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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
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

      {/* Data Backup & Export */}
      <Card>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-br from-primary/10 to-blue-600/10 p-3 rounded-xl border border-primary/20">
              <ApperIcon name="Download" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Data Backup & Export</h2>
              <p className="text-sm text-gray-600">
                Download your financial data for backup or migration purposes
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* JSON Export */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <ApperIcon name="FileText" size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">JSON Format</h3>
                  <p className="text-sm text-gray-600">Complete data with structure</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Export all your data in JSON format, perfect for backup and data migration. 
                Includes transactions, budgets, goals, accounts, and categories.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => handleExportData('json')}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-2"
              >
                {isExporting && exportFormat === 'json' ? (
                  <>
                    <ApperIcon name="Loader2" size={16} className="animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <ApperIcon name="Download" size={16} />
                    Export JSON
                  </>
                )}
              </Button>
            </div>

            {/* CSV Export */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-green-100 p-2 rounded-lg">
                  <ApperIcon name="Table" size={20} className="text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">CSV Format</h3>
                  <p className="text-sm text-gray-600">Spreadsheet compatible</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Export your data in CSV format for analysis in Excel, Google Sheets, or other 
                spreadsheet applications. Separate sheets for each data type.
              </p>
              <Button
                variant="secondary"
                size="md"
                onClick={() => handleExportData('csv')}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-2"
              >
                {isExporting && exportFormat === 'csv' ? (
                  <>
                    <ApperIcon name="Loader2" size={16} className="animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <ApperIcon name="Download" size={16} />
                    Export CSV
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-1 rounded-full mt-0.5">
                <ApperIcon name="Info" size={16} className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Export Information</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Files are downloaded directly to your device</li>
                  <li>• JSON format preserves all data relationships and metadata</li>
                  <li>• CSV format is optimized for spreadsheet analysis</li>
                  <li>• Export includes timestamp for easy identification</li>
                  <li>• No data is sent to external servers during export</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
export default Settings;