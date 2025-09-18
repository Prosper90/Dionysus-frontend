import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  PlusIcon,
  XMarkIcon,
  ArrowUpRightIcon,
  EyeIcon,
  CalendarDaysIcon,
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
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
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
  isLifetime?: boolean;
  lifetimeFeatures?: string[];
  maxRedemptions?: number;
  currentRedemptions?: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [lifetimeCoupons, setLifetimeCoupons] = useState<CouponData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showLifetimeCouponModal, setShowLifetimeCouponModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    amount: "",
    expiresAt: "",
    description: "",
  });
  const [newLifetimeCoupon, setNewLifetimeCoupon] = useState({
    description: "",
    expiresAt: "",
    maxRedemptions: "",
    customCode: "",
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("dashboard-token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("dashboard-token");
      const headers = { Authorization: `Bearer ${token}` };

      const [analyticsRes, groupsRes, couponsRes, lifetimeCouponsRes] = await Promise.all([
        fetch(`${ApiHead}/api/analytics/owner`, { headers }),
        fetch(`${ApiHead}/api/groups/active`, { headers }),
        fetch(`${ApiHead}/api/coupons`, { headers }),
        fetch(`${ApiHead}/api/lifetime-coupons`, { headers }),
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
      if (lifetimeCouponsRes.ok) {
        const lifetimeData = await lifetimeCouponsRes.json();
        setLifetimeCoupons(lifetimeData.coupons || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("dashboard-token");
    router.push("/login");
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
        fetchData();
      }
    } catch (error) {
      console.error("Failed to generate coupon:", error);
    }
  };

  const generateLifetimeCoupon = async () => {
    try {
      const token = localStorage.getItem("dashboard-token");
      const response = await fetch(`${ApiHead}/api/lifetime-coupons/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: newLifetimeCoupon.description || "Lifetime Premium Access",
          expiresAt: newLifetimeCoupon.expiresAt || undefined,
          maxRedemptions: newLifetimeCoupon.maxRedemptions ? parseInt(newLifetimeCoupon.maxRedemptions) : undefined,
          customCode: newLifetimeCoupon.customCode || undefined,
        }),
      });

      if (response.ok) {
        setShowLifetimeCouponModal(false);
        setNewLifetimeCoupon({ description: "", expiresAt: "", maxRedemptions: "", customCode: "" });
        fetchData();
      }
    } catch (error) {
      console.error("Failed to generate lifetime coupon:", error);
    }
  };

  const expireCoupon = async (couponId: string) => {
    try {
      const token = localStorage.getItem("dashboard-token");
      await fetch(`${ApiHead}/api/coupons/${couponId}/expire`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (error) {
      console.error("Failed to expire coupon:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Process monthly data for better chart display
  const processedMonthlyData = analytics?.monthlyBreakdown.reduce((acc: any[], item) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const [year, month] = item.month.split('-');
    const monthName = monthNames[parseInt(month) - 1];
    const displayMonth = `${monthName} ${year}`;
    
    const existing = acc.find(d => d.month === displayMonth);
    if (existing) {
      existing[item.source === 'game_fees' ? 'gameFees' : 'subscriptions'] = item.amount;
      existing.total = (existing.gameFees || 0) + (existing.subscriptions || 0);
    } else {
      acc.push({
        month: displayMonth,
        gameFees: item.source === 'game_fees' ? item.amount : 0,
        subscriptions: item.source === 'subscriptions' ? item.amount : 0,
        total: item.amount,
      });
    }
    return acc;
  }, []).slice(-12) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EngagementBot Dashboard
              </h1>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Owner Panel
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/admin")}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowUpRightIcon className="w-4 h-4 mr-2" />
                Admin Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8 bg-white rounded-lg shadow-sm">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "overview", name: "Overview", icon: ChartBarIcon },
              { id: "groups", name: "Active Groups", icon: UsersIcon },
              { id: "coupons", name: "Coupons", icon: CurrencyDollarIcon },
              { id: "lifetime-coupons", name: "Lifetime Coupons", icon: CalendarDaysIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center rounded-t-lg transition-all duration-200`}
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
            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {formatCurrency(analytics.totalRevenue)}
                    </p>
                    <div className="flex items-center mt-2">
                      <ArrowUpRightIcon className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">Your earnings</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-green-100">
                    <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Game Fees</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {formatCurrency(analytics.gameFeesRevenue)}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className="text-sm text-blue-600">20% of game fees</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-100">
                    <ChartBarIcon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Subscriptions</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {formatCurrency(analytics.subscriptionRevenue)}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className="text-sm text-purple-600">Premium plans</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-100">
                    <BuildingOfficeIcon className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Revenue Trend */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Revenue Trend</h3>
                  <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={processedMonthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        formatter={(value: any) => [formatCurrency(Number(value)), 'Revenue']}
                      />
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        fill="url(#colorRevenue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Revenue Breakdown */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Revenue Sources</h3>
                  <EyeIcon className="w-5 h-5 text-gray-400" />
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={processedMonthlyData.slice(-6)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        formatter={(value: any) => [formatCurrency(Number(value))]}
                      />
                      <Bar 
                        dataKey="gameFees" 
                        name="Game Fees"
                        fill="#3B82F6" 
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        dataKey="subscriptions" 
                        name="Subscriptions"
                        fill="#10B981" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Revenue</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Game Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.recentTransactions.slice(0, 8).map((transaction, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-3 ${
                              transaction.source === 'game_fees' ? 'bg-blue-500' : 'bg-green-500'
                            }`}></div>
                            <span className="text-sm font-medium text-gray-900 capitalize">
                              {transaction.source.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.gameType || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Groups Tab */}
        {activeTab === "groups" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Active Groups</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {groups.map((group) => (
                <div key={group._id} className="px-6 py-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                        <UsersIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-900">{group.title}</p>
                        <p className="text-sm text-gray-500">Owner: {group.ownerTelegramId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(group.accumulatedFees || 0)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {group.totalRaffles} raffles • {group.totalMemeBattles} battles
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coupons Tab */}
        {activeTab === "coupons" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Coupons Management</h2>
              <button
                onClick={() => setShowCouponModal(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Generate Coupon
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <div key={coupon._id} className="px-6 py-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <p className="text-lg font-bold text-gray-900 font-mono bg-gray-100 px-3 py-1 rounded-lg">
                            {coupon.code}
                          </p>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
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
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">{coupon.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">
                            {formatCurrency(coupon.amount)}
                          </p>
                        </div>
                        {!coupon.isUsed && new Date(coupon.expiresAt) > new Date() && (
                          <button
                            onClick={() => expireCoupon(coupon._id)}
                            className="px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                          >
                            Expire
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Lifetime Coupons Tab */}
        {activeTab === "lifetime-coupons" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Lifetime Coupons Management</h2>
              <button
                onClick={() => setShowLifetimeCouponModal(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
              >
                <CalendarDaysIcon className="h-4 w-4 mr-2" />
                Create Lifetime Coupon
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="divide-y divide-gray-200">
                {lifetimeCoupons.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No lifetime coupons</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Create your first lifetime coupon to get started.
                    </p>
                  </div>
                ) : (
                  lifetimeCoupons.map((coupon) => (
                    <div key={coupon._id} className="px-6 py-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <p className="text-lg font-bold text-gray-900 font-mono bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 rounded-lg border-2 border-purple-200">
                              {coupon.code}
                            </p>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                              ♾️ Lifetime
                            </span>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                new Date(coupon.expiresAt) > new Date()
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {new Date(coupon.expiresAt) > new Date() ? "Active" : "Expired"}
                            </span>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">{coupon.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <p className="text-xs text-gray-500">
                                Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                Redemptions: {coupon.currentRedemptions || 0}
                                {coupon.maxRedemptions ? `/${coupon.maxRedemptions}` : '/∞'}
                              </p>
                            </div>
                            {coupon.lifetimeFeatures && coupon.lifetimeFeatures.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-gray-700">Features:</p>
                                <p className="text-xs text-gray-500">
                                  {coupon.lifetimeFeatures.slice(0, 3).join(', ')}
                                  {coupon.lifetimeFeatures.length > 3 && '...'}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                              LIFETIME
                            </p>
                            <p className="text-sm text-gray-500">No expiry</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Coupon Generation Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Generate New Coupon</h3>
              <button
                onClick={() => setShowCouponModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Code</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                  placeholder="BONUS100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount ($)</label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newCoupon.amount}
                  onChange={(e) => setNewCoupon({ ...newCoupon, amount: e.target.value })}
                  placeholder="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Expires At</label>
                <input
                  type="datetime-local"
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newCoupon.expiresAt}
                  onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newCoupon.description}
                  onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                  placeholder="Welcome bonus for new users"
                />
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowCouponModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={generateCoupon}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lifetime Coupon Generation Modal */}
      {showLifetimeCouponModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                Create Lifetime Coupon
              </h3>
              <button
                onClick={() => setShowLifetimeCouponModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Custom Code (Optional)</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  value={newLifetimeCoupon.customCode}
                  onChange={(e) => setNewLifetimeCoupon({ ...newLifetimeCoupon, customCode: e.target.value })}
                  placeholder="LIFETIME2024 (leave empty for auto-generation)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  value={newLifetimeCoupon.description}
                  onChange={(e) => setNewLifetimeCoupon({ ...newLifetimeCoupon, description: e.target.value })}
                  placeholder="Lifetime Premium Access"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Redemptions (Optional)</label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  value={newLifetimeCoupon.maxRedemptions}
                  onChange={(e) => setNewLifetimeCoupon({ ...newLifetimeCoupon, maxRedemptions: e.target.value })}
                  placeholder="Leave empty for unlimited"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Expires At (Optional)</label>
                <input
                  type="datetime-local"
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  value={newLifetimeCoupon.expiresAt}
                  onChange={(e) => setNewLifetimeCoupon({ ...newLifetimeCoupon, expiresAt: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for 1 year from now</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-purple-900 mb-2">✨ Lifetime Features Included:</h4>
                <ul className="text-xs text-purple-800 space-y-1">
                  <li>♾️ Lifetime access to all features</li>
                  <li>🎰 Unlimited stake raffles</li>
                  <li>🎭 Meme battles with voting</li>
                  <li>🏆 Advanced leaderboards</li>
                  <li>📊 Detailed analytics</li>
                  <li>⚙️ Custom group settings</li>
                  <li>🔮 Early access to new features</li>
                </ul>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowLifetimeCouponModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={generateLifetimeCoupon}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700"
              >
                Create Lifetime Coupon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}