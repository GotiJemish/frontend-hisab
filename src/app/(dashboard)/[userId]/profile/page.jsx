"use client";

import { useState, useEffect } from "react";
import { 
  User as UserIcon, 
  Mail, 
  KeyRound, 
  ShieldCheck, 
  Lock, 
  Building2, 
  Save, 
  CheckCircle2, 
  XCircle,
  Eye,
  EyeOff,
  Camera,
  Trash2
} from "lucide-react";
import { Btn, Card, InputField } from "@/components/ui";
import apiClient from "@/utilities/apiClients";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";

// Modules match the PERMISSION_MODULES in PermissionMatrix
const PERMISSION_MODULES = [
  { id: "users", label: "Users & Roles" },
  { id: "invoices", label: "Invoices & Billing" },
  { id: "taxes", label: "Taxes (GST)" },
  { id: "items", label: "Items & Inventory" },
  { id: "contacts", label: "Contacts & Customers" },
  { id: "accounts", label: "Accounts & Cash Flow" },
];

const ACTIONS = ["create", "read", "update", "delete"];

export default function MyProfilePage() {
  const { user, refreshProfile } = useAuth();
  const toast = useToast();
  const { loading, setLoading } = useLoading();

  // Profile Details Form State
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
  });
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  // Password Change Form State
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  // Fetch current user details from profile endpoint
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/profile/");
      if (data.success) {
        setProfileForm({
          first_name: data.data.first_name || "",
          last_name: data.data.last_name || "",
        });
        setProfileImageUrl(data.data.profile_image_url || null);
      }
    } catch (err) {
      toast.error("Failed to fetch profile details");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (5MB max)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return toast.error("File size exceeds the 5MB limit.");
    }

    // Validate format
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return toast.error("Unsupported file format. Allowed formats: JPG, JPEG, PNG, WEBP.");
    }

    const formData = new FormData();
    formData.append("profile_image", file);

    setLoading(true);
    try {
      const { data } = await apiClient.post("/profile/image/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.success) {
        toast.success("Profile image updated successfully");
        setProfileImageUrl(data.data.profile_image_url || null);
        await refreshProfile();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const handleImageRemove = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.delete("/profile/image/");
      if (data.success) {
        toast.success("Profile image removed successfully");
        setProfileImageUrl(null);
        await refreshProfile();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove image");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.first_name.trim()) {
      return toast.error("First name is required");
    }

    setLoading(true);
    try {
      const { data } = await apiClient.patch("/profile/", {
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
      });

      if (data.success) {
        toast.success("Personal details updated successfully");
        await refreshProfile();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const { old_password, new_password, confirm_password } = passwordForm;

    if (!old_password || !new_password || !confirm_password) {
      return toast.error("All password fields are required");
    }

    if (new_password.length < 6) {
      return toast.error("New password must be at least 6 characters long");
    }

    if (new_password !== confirm_password) {
      return toast.error("Confirm password does not match new password");
    }

    setLoading(true);
    try {
      const { data } = await apiClient.post("/profile/change-password/", {
        old_password,
        new_password,
      });

      if (data.success) {
        toast.success("Password changed successfully!");
        setPasswordForm({
          old_password: "",
          new_password: "",
          confirm_password: "",
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Determine permissions display
  const userPermissions = user?.permissions || {};
  const isCompanyAdmin = user?.role === "COMPANY_ADMIN";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400">
          <UserIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="text-sm text-gray-500">Manage your personal settings, password, and view account permissions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Left Column: Avatar & Summary Info ── */}
        <div className="space-y-6">
          <Card className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-[#0F172A]">
            <div className="relative mb-4 group cursor-pointer">
              <input
                type="file"
                id="profile-image-input"
                className="hidden"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleImageUpload}
                disabled={loading}
              />
              
              <label htmlFor="profile-image-input" className="cursor-pointer block relative">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={`${profileForm.first_name} ${profileForm.last_name}`}
                    className="h-24 w-24 rounded-full object-cover ring-4 ring-white dark:ring-gray-800 shadow-xl transition-all duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-3xl shadow-xl border-4 border-white dark:border-gray-800 transition-all duration-300 group-hover:scale-105 select-none">
                    {profileForm.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                    {profileForm.last_name?.[0]?.toUpperCase() || ""}
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Camera className="h-6 w-6 mb-1" />
                  <span className="text-[10px] font-semibold tracking-wide">Change Photo</span>
                </div>
              </label>

              <span className="absolute bottom-0 right-0 p-1 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" title="Active Account"></span>
            </div>
            
            {profileImageUrl && (
              <button
                type="button"
                onClick={handleImageRemove}
                disabled={loading}
                className="mb-4 inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove Photo
              </button>
            )}
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {profileForm.first_name} {profileForm.last_name || ""}
            </h2>
            <p className="text-sm text-gray-500 flex items-center justify-center gap-1.5 mt-0.5">
              <Mail className="h-3.5 w-3.5" />
              {user?.email}
            </p>

            <div className="w-full border-t border-gray-100 dark:border-gray-800/80 my-5"></div>

            <div className="w-full space-y-3.5 text-left">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">System Role:</span>
                <span className="font-semibold px-2.5 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">
                  {isCompanyAdmin ? "Company Admin" : "Staff User"}
                </span>
              </div>
              
              {user?.company && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Organization:</span>
                  <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-gray-400" />
                    {user.company.name}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* ── Security Quick Tip Card ── */}
          <Card className="p-5 bg-gradient-to-br from-blue-50/50 to-indigo-50/20 dark:from-blue-950/20 dark:to-indigo-950/10 border-blue-100 dark:border-blue-900/30">
            <h3 className="font-bold text-blue-900 dark:text-blue-300 text-sm flex items-center gap-1.5 mb-2">
              <ShieldCheck className="h-4 w-4" />
              Security Reminder
            </h3>
            <p className="text-xs text-blue-700 dark:text-blue-400/90 leading-relaxed">
              Use a strong password combining numbers, symbols, and uppercase letters. Never share your password or API keys. Update your credentials periodically to protect your financial logs.
            </p>
          </Card>
        </div>

        {/* ── Middle/Right Columns: Forms & Permissions ── */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Personal Settings Form */}
          <Card header={
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Personal Information</h2>
              <p className="text-xs text-gray-500">Update your name and profile details.</p>
            </div>
          }>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="First Name"
                  id="firstName"
                  value={profileForm.first_name}
                  onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                  required
                  placeholder="John"
                  leftIcon={<UserIcon className="h-4 w-4" />}
                />
                <InputField
                  label="Last Name"
                  id="lastName"
                  value={profileForm.last_name}
                  onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                  placeholder="Doe"
                  leftIcon={<UserIcon className="h-4 w-4" />}
                />
              </div>

              <InputField
                label="Email Address"
                id="emailAddress"
                type="email"
                value={user?.email || ""}
                disabled
                helperText="Email address cannot be changed. Please contact your organization administrator."
                leftIcon={<Mail className="h-4 w-4" />}
              />

              <div className="flex justify-end pt-2">
                <Btn variant="primary" type="submit" leftIcon={<Save className="h-4 w-4" />} disabled={loading}>
                  Save Changes
                </Btn>
              </div>
            </form>
          </Card>

          {/* Change Password Form */}
          <Card header={
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Change Password</h2>
              <p className="text-xs text-gray-500">Secure your account by updating your credentials.</p>
            </div>
          }>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <InputField
                label="Current Password"
                id="old_password"
                type={showPasswords.old ? "text" : "password"}
                value={passwordForm.old_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                required
                placeholder="••••••••"
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button type="button" onClick={() => togglePasswordVisibility("old")} className="focus:outline-none text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    {showPasswords.old ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="New Password"
                  id="new_password"
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  required
                  placeholder="Min 6 characters"
                  leftIcon={<KeyRound className="h-4 w-4" />}
                  rightIcon={
                    <button type="button" onClick={() => togglePasswordVisibility("new")} className="focus:outline-none text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />
                <InputField
                  label="Confirm New Password"
                  id="confirm_password"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  required
                  placeholder="Repeat new password"
                  leftIcon={<KeyRound className="h-4 w-4" />}
                  rightIcon={
                    <button type="button" onClick={() => togglePasswordVisibility("confirm")} className="focus:outline-none text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />
              </div>

              <div className="flex justify-end pt-2">
                <Btn variant="primary" type="submit" leftIcon={<KeyRound className="h-4 w-4" />} disabled={loading}>
                  Change Password
                </Btn>
              </div>
            </form>
          </Card>

          {/* User Active Permissions */}
          <Card header={
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Active Permissions Matrix</h2>
                <p className="text-xs text-gray-500">Your assigned resource access privileges on this organization.</p>
              </div>
              {isCompanyAdmin && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Full Root Access
                </span>
              )}
            </div>
          }>
            <div className="overflow-x-auto border rounded-xl dark:border-gray-800 border-gray-100">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/40 border-b dark:border-gray-800 border-gray-100">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Modules</th>
                    {ACTIONS.map(action => (
                      <th key={action} className="px-4 py-3 text-center capitalize font-semibold text-gray-700 dark:text-gray-300">
                        {action}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-800 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/20">
                  {PERMISSION_MODULES.map(module => (
                    <tr key={module.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-all duration-100">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                        {module.label}
                      </td>
                      {ACTIONS.map(action => {
                        const hasPerm = isCompanyAdmin || !!userPermissions[module.id]?.[action];
                        return (
                          <td key={action} className="px-4 py-3 text-center align-middle">
                            <div className="flex justify-center">
                              {hasPerm ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 rounded-full" />
                              ) : (
                                <XCircle className="h-5 w-5 text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/20 rounded-full" />
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
