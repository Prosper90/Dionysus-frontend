import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { ApiHead } from "@/utils/helpers";

interface AnalyticsData {
  totalRevenue: number;
  gameFeesRevenue: number;
  subscriptionRevenue: number;
  recentTransactions: any[];
  monthlyBreakdown: any[];
}

interface GroupData {
  _id: string;
  title: string;
  ownerTelegramId: number;
  accumulatedFees: number;
  totalRaffles: number;
  totalMemeBattles: number;
}

interface CouponData {
  _id: string;
  code: string;
  amount: number;
  isUsed: boolean;
  expiresAt: string;
  description: string;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    amount: "",
    expiresAt: "",
    description: "",
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("dashboard-token");
    if (!token) {
      router.push("/");
      return;
    }

    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("dashboard-token");
      const headers = { Authorization: `Bearer ${token}` };

      const [analyticsRes, groupsRes, couponsRes] = await Promise.all([
        fetch(`${ApiHead}/api/analytics/owner`, { headers }),
        fetch(`${ApiHead}/api/groups/active`, { headers }),
        fetch(`${ApiHead}/api/coupons`, { headers }),
      ]);

      if (analyticsRes.ok) {
        setAnalytics(await analyticsRes.json());
      }
      if (groupsRes.ok) {
        setGroups(await groupsRes.json());
      }
      if (couponsRes.ok) {
        setCoupons(await couponsRes.json());
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("dashboard-token");
    router.push("/");
  };

  const generateCoupon = async () => {
    try {
      const token = localStorage.getItem("dashboard-token");
      const response = await fetch(`${ApiHead}/api/coupons/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newCoupon,
          amount: parseFloat(newCoupon.amount),
          expiresAt: new Date(newCoupon.expiresAt),
        }),
      });

      if (response.ok) {
        setShowCouponModal(false);
        setNewCoupon({ code: "", amount: "", expiresAt: "", description: "" });
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error("Failed to generate coupon:", error);
    }
  };

  const expireCoupon = async (couponId: string) => {
    try {
      const token = localStorage.getItem("dashboard-token");
      await fetch(`${ApiHead}/api/coupons/${couponId}/expire`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Failed to expire coupon:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">EngagementBot Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "overview", name: "Overview", icon: ChartBarIcon },
              { id: "groups", name: "Active Groups", icon: UsersIcon },
              { id: "coupons", name: "Coupons", icon: CurrencyDollarIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && analytics && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Revenue
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${analytics.totalRevenue.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Game Fees
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${analytics.gameFeesRevenue.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Subscriptions
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${analytics.subscriptionRevenue.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Revenue Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Monthly Revenue</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.monthlyBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Groups Tab */}
        {activeTab === "groups" && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {groups.map((group) => (
                <li key={group._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {group.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          Owner: {group.ownerTelegramId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ${group.accumulatedFees?.toFixed(2) || "0.00"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {group.totalRaffles} raffles, {group.totalMemeBattles}{" "}
                        battles
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Coupons Tab */}
        {activeTab === "coupons" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Coupons</h2>
              <button
                onClick={() => setShowCouponModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Generate Coupon
              </button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <li key={coupon._id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {coupon.code}
                        </p>
                        <p className="text-sm text-gray-500">
                          ${coupon.amount} - {coupon.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          Expires:{" "}
                          {new Date(coupon.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            coupon.isUsed
                              ? "bg-gray-100 text-gray-800"
                              : new Date(coupon.expiresAt) > new Date()
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {coupon.isUsed
                            ? "Used"
                            : new Date(coupon.expiresAt) > new Date()
                            ? "Active"
                            : "Expired"}
                        </span>
                        {!coupon.isUsed &&
                          new Date(coupon.expiresAt) > new Date() && (
                            <button
                              onClick={() => expireCoupon(coupon._id)}
                              className="text-red-600 hover:text-red-900 text-sm"
                            >
                              Expire
                            </button>
                          )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Coupon Generation Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Generate New Coupon</h3>
                  <button
                    onClick={() => setShowCouponModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Code
                    </label>
                    <input
                      type="text"
                      value={newCoupon.code}
                      onChange={(e) =>
                        setNewCoupon({
                          ...newCoupon,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                      placeholder="BONUS100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Amount ($)
                    </label>
                    <input
                      type="number"
                      value={newCoupon.amount}
                      onChange={(e) =>
                        setNewCoupon({ ...newCoupon, amount: e.target.value })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                      placeholder="25.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Expires At
                    </label>
                    <input
                      type="date"
                      value={newCoupon.expiresAt}
                      onChange={(e) =>
                        setNewCoupon({
                          ...newCoupon,
                          expiresAt: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <input
                      type="text"
                      value={newCoupon.description}
                      onChange={(e) =>
                        setNewCoupon({
                          ...newCoupon,
                          description: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                      placeholder="Holiday bonus"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={generateCoupon}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Generate
                </button>
                <button
                  onClick={() => setShowCouponModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
