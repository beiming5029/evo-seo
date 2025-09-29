"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/button";
import {
  Edit,
  Ban,
  Shield,
  User,
  MoreVertical,
  CreditCard,
  Mail,
  Calendar,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Package
} from "lucide-react";
import { updateUserRole, banUser, updateUserCredits } from "@/features/admin/actions/user-actions";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  credits: number;
  role: string;
  banned: boolean;
  banReason: string | null;
  banExpires: Date | null;
  planKey: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface UsersTableProps {
  users: User[];
}

export function UsersTable({ users: initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPage, setUserPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const t = useTranslations("Admin.users");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const usersPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage));
  const startIndex = (userPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);
  const pageNumbers = useMemo(() => {
    const maxButtons = 5;
    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const halfWindow = Math.floor(maxButtons / 2);
    let start = Math.max(1, userPage - halfWindow);
    let end = start + maxButtons - 1;

    if (end > totalPages) {
      end = totalPages;
      start = end - maxButtons + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [userPage, totalPages]);

  useEffect(() => {
    setUserPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (userPage > totalPages) {
      setUserPage(totalPages);
    }
  }, [userPage, totalPages]);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success(t("roleUpdated"));
    } catch (error) {
      toast.error(t("roleUpdateFailed"));
    }
  };

  const handleBanUser = async (userId: string, banned: boolean, reason?: string) => {
    try {
      await banUser(userId, banned, reason);
      setUsers(users.map(u => u.id === userId ? { ...u, banned, banReason: reason || null } : u));
      toast.success(banned ? t("userBanned") : t("userUnbanned"));
    } catch (error) {
      toast.error(t("banFailed"));
    }
  };

  const handleUpdateCredits = async (userId: string, credits: number) => {
    try {
      await updateUserCredits(userId, credits);
      setUsers(users.map(u => u.id === userId ? { ...u, credits } : u));
      toast.success(t("creditsUpdated"));
    } catch (error) {
      toast.error(t("creditsUpdateFailed"));
    }
  };

  return (
    <div className="space-y-4">
      {/* 搜索栏 */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-400"
          />
        </div>
      </div>

      {/* 用户表格 */}
      <div className="bg-white dark:bg-black rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  {t("user")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  {t("role")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  {t("subscription")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  {t("credits")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  {t("status")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  {t("joined")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-6">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                          <User className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-black dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                      className="px-3 py-1 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-black dark:text-white"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-neutral-400" />
                      <span className="text-sm text-black dark:text-white">
                        {user.planKey || "free"}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setIsSubscriptionModalOpen(true);
                        }}
                        className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white text-xs"
                      >
                        {t("manage")}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-neutral-400" />
                      <span className="text-sm text-black dark:text-white">
                        {user.credits}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setIsCreditsModalOpen(true);
                        }}
                        className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white text-xs"
                      >
                        {t("adjust")}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.banned ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                        {t("banned")}
                      </span>
                    ) : user.emailVerified ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        {t("active")}
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                        {t("unverified")}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
                      <Calendar className="h-3 w-3" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (user.banned) {
                            handleBanUser(user.id, false);
                          } else {
                            const reason = prompt(t("banReason"));
                            if (reason) {
                              handleBanUser(user.id, true, reason);
                            }
                          }
                        }}
                        className={`p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 ${
                          user.banned 
                            ? "text-green-600 dark:text-green-400" 
                            : "text-red-600 dark:text-red-400"
                        }`}
                        title={user.banned ? t("unban") : t("ban")}
                      >
                        <Ban className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setIsEditModalOpen(true);
                        }}
                        className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-600 dark:text-neutral-400"
                        title={t("viewDetails")}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length > 0 && (
          <nav
            className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900"
            aria-label={t("pagination.page", { current: userPage, total: totalPages })}
          >
            <button
              type="button"
              onClick={() => setUserPage((page) => Math.max(1, page - 1))}
              disabled={userPage === 1}
              className="px-3 py-1.5 text-sm font-medium rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t("pagination.previous")}
            </button>

            <div className="flex items-center gap-2">
              {pageNumbers[0] > 1 && (
                <button
                  type="button"
                  onClick={() => setUserPage(1)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 ${userPage === 1 ? "bg-black text-white dark:bg-white dark:text-black" : ""}`}
                >
                  1
                </button>
              )}
              {pageNumbers[0] > 2 && <span className="text-sm text-neutral-400">...</span>}

              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setUserPage(pageNumber)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                    userPage === pageNumber ? "bg-black text-white dark:bg-white dark:text-black" : ""
                  }`}
                  aria-current={userPage === pageNumber ? "page" : undefined}
                >
                  {pageNumber}
                </button>
              ))}

              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <span className="text-sm text-neutral-400">...</span>
              )}
              {pageNumbers[pageNumbers.length - 1] < totalPages && (
                <button
                  type="button"
                  onClick={() => setUserPage(totalPages)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 ${userPage === totalPages ? "bg-black text-white dark:bg-white dark:text-black" : ""}`}
                >
                  {totalPages}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setUserPage((page) => Math.min(totalPages, page + 1))}
              disabled={userPage === totalPages}
              className="px-3 py-1.5 text-sm font-medium rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t("pagination.next")}
            </button>
          </nav>
        )}
      </div>

      {/* 用户详情模态框 */}
      {isEditModalOpen && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          onUpdate={(updatedUser) => {
            setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
          }}
        />
      )}

      {/* 积分管理模态框 */}
      {isCreditsModalOpen && selectedUser && (
        <CreditsManagementModal
          user={selectedUser}
          onClose={() => {
            setIsCreditsModalOpen(false);
            setSelectedUser(null);
          }}
          onUpdate={(userId, newCredits) => {
            setUsers(users.map(u => u.id === userId ? { ...u, credits: newCredits } : u));
          }}
        />
      )}

      {/* 订阅管理模态框 */}
      {isSubscriptionModalOpen && selectedUser && (
        <SubscriptionManagementModal
          user={selectedUser}
          onClose={() => {
            setIsSubscriptionModalOpen(false);
            setSelectedUser(null);
          }}
          onUpdate={(userId, newPlan) => {
            setUsers(users.map(u => u.id === userId ? { ...u, planKey: newPlan } : u));
          }}
        />
      )}
    </div>
  );
}

// 积分管理模态框
function CreditsManagementModal({
  user,
  onClose,
  onUpdate
}: {
  user: User;
  onClose: () => void;
  onUpdate: (userId: string, credits: number) => void;
}) {
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState("adjustment");
  const t = useTranslations("Admin.users");

  const handleAdjustCredits = async () => {
    if (amount === 0) return;
    
    try {
      const response = await fetch(`/api/admin/users/${user.id}/credits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, reason })
      });
      
      if (response.ok) {
        const data = await response.json();
        onUpdate(user.id, data.credits);
        toast.success(t("creditsUpdated"));
        onClose();
      } else {
        toast.error(t("creditsUpdateFailed"));
      }
    } catch (error) {
      toast.error(t("creditsUpdateFailed"));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-black rounded-lg p-6 max-w-md w-full mx-4 border border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl font-bold text-black dark:text-white mb-4">
          {t("adjustCredits")}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t("currentCredits")}
            </label>
            <p className="text-2xl font-bold text-black dark:text-white">{user.credits}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t("adjustment")}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setAmount(amount - 10)}
                className="p-2 rounded bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-black dark:text-white border border-neutral-200 dark:border-neutral-800"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                className="flex-1 px-3 py-2 rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-black dark:text-white"
              />
              <button
                onClick={() => setAmount(amount + 10)}
                className="p-2 rounded bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-black dark:text-white border border-neutral-200 dark:border-neutral-800"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {amount !== 0 && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {t("newBalance")}: {user.credits + amount}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t("reason")}
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-black dark:text-white"
            >
              <option value="adjustment">{t("manualAdjustment")}</option>
              <option value="refund">{t("refund")}</option>
              <option value="bonus">{t("bonus")}</option>
              <option value="compensation">{t("compensation")}</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button 
            onClick={handleAdjustCredits} 
            disabled={amount === 0}
            className="bg-black dark:bg-white text-white dark:text-black"
          >
            {amount > 0 ? t("addCredits") : t("deductCredits")}
          </Button>
        </div>
      </div>
    </div>
  );
}

// 订阅管理模态框
function SubscriptionManagementModal({
  user,
  onClose,
  onUpdate
}: {
  user: User;
  onClose: () => void;
  onUpdate: (userId: string, plan: string) => void;
}) {
  const [selectedPlan, setSelectedPlan] = useState(user.planKey || "free");
  const t = useTranslations("Admin.users");

  const handleUpdateSubscription = async () => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}/subscription`, {
        method: selectedPlan === "free" ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey: selectedPlan, status: "active" })
      });
      
      if (response.ok) {
        onUpdate(user.id, selectedPlan);
        toast.success(t("subscriptionUpdated"));
        onClose();
      } else {
        toast.error(t("subscriptionUpdateFailed"));
      }
    } catch (error) {
      toast.error(t("subscriptionUpdateFailed"));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-black rounded-lg p-6 max-w-md w-full mx-4 border border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl font-bold text-black dark:text-white mb-4">
          {t("manageSubscription")}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t("currentPlan")}
            </label>
            <p className="text-lg font-semibold text-black dark:text-white">
              {user.planKey || "free"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t("selectPlan")}
            </label>
            <div className="space-y-2">
              {["free", "starter_monthly", "starter_yearly", "professional_monthly", "professional_yearly", "enterprise"].map((plan) => (
                <label key={plan} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value={plan}
                    checked={selectedPlan === plan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="text-black dark:text-white"
                  />
                  <span className="text-sm text-black dark:text-white">
                    {plan.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button 
            onClick={handleUpdateSubscription}
            className="bg-black dark:bg-white text-white dark:text-black"
          >
            {t("updateSubscription")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function UserDetailModal({ 
  user, 
  onClose, 
  onUpdate 
}: { 
  user: User; 
  onClose: () => void;
  onUpdate: (user: User) => void;
}) {
  const t = useTranslations("Admin.users");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-black rounded-lg p-6 max-w-2xl w-full mx-4 border border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl font-bold text-black dark:text-white mb-4">
          {t("userDetails")}
        </h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t("name")}
              </label>
              <p className="mt-1 text-black dark:text-white">{user.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t("email")}
              </label>
              <p className="mt-1 text-black dark:text-white">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t("role")}
              </label>
              <p className="mt-1 text-black dark:text-white">{user.role}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t("credits")}
              </label>
              <p className="mt-1 text-black dark:text-white">{user.credits}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t("joined")}
              </label>
              <p className="mt-1 text-black dark:text-white">
                {new Date(user.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t("lastActive")}
              </label>
              <p className="mt-1 text-black dark:text-white">
                {new Date(user.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>

          {user.banned && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400">
                <strong>{t("banReason")}:</strong> {user.banReason}
              </p>
              {user.banExpires && (
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  <strong>{t("banExpires")}:</strong> {new Date(user.banExpires).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            {t("close")}
          </Button>
        </div>
      </div>
    </div>
  );
}
