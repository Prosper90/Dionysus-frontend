import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
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
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import { ApiHead } from "@/utils/helpers";

interface AdminAnalytics {
  totalRevenue: number;
  gameFeesRevenue: number;
  subscriptionRevenue: number;
  systemMetrics: {
    totalSystemBalance: number;
    totalDeposited: number;
    totalWithdrawn: number;
    systemLiquidity: number;
    totalSubscriptionRevenue: number;
    activeGroups: number;
    totalGroups: number;
    totalUsers: number;
    activeUsers: number;
  };
  recentTransactions: any[];
  monthlyStats: any[];
  monthlyBreakdown: any[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("dashboard-token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchAnalytics();
  }, [router, timeRange]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("dashboard-token");
      const response = await fetch(`${ApiHead}/api/analytics/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else if (response.status === 401) {
        localStorage.removeItem("dashboard-token");
        router.push("/login");
      }
    } catch (error) {
      console.error("Failed to fetch admin analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("dashboard-token");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading admin analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-red-600">Failed to load analytics</p>
          <button 
            onClick={fetchAnalytics}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const keyMetrics = [
    {
      title: "Total System Balance",
      value: formatCurrency(analytics.systemMetrics.totalSystemBalance),
      icon: BanknotesIcon,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Total money in the system",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(analytics.totalRevenue),
      icon: CurrencyDollarIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Owner's total earnings",
    },
    {
      title: "System Liquidity",
      value: formatCurrency(analytics.systemMetrics.systemLiquidity),
      icon: ArrowTrendingUpIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: "Deposits minus withdrawals",
    },
    {
      title: "Subscription Revenue",
      value: formatCurrency(analytics.systemMetrics.totalSubscriptionRevenue),
      icon: ChartBarIcon,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      description: "Total subscription payments",
    },
  ];

  const systemStats = [
    {
      title: "Active Users",
      value: analytics.systemMetrics.activeUsers.toLocaleString(),
      total: analytics.systemMetrics.totalUsers.toLocaleString(),
      icon: UsersIcon,
      color: "text-blue-600",
    },
    {
      title: "Active Groups",
      value: analytics.systemMetrics.activeGroups.toLocaleString(),
      total: analytics.systemMetrics.totalGroups.toLocaleString(),
      icon: BuildingOfficeIcon,
      color: "text-green-600",
    },
    {
      title: "Total Deposited",
      value: formatCurrency(analytics.systemMetrics.totalDeposited),
      icon: ArrowTrendingUpIcon,
      color: "text-emerald-600",
    },
    {
      title: "Total Withdrawn",
      value: formatCurrency(analytics.systemMetrics.totalWithdrawn),
      icon: ArrowTrendingDownIcon,
      color: "text-red-600",
    },
  ];

  // Process monthly data for charts
  const monthlyChartData = analytics.monthlyBreakdown.reduce((acc: any[], item) => {
    const existing = acc.find(d => d.month === item.month);
    if (existing) {
      existing[item.source] = item.amount;
    } else {
      acc.push({
        month: item.month,
        [item.source]: item.amount,
        game_fees: item.source === 'game_fees' ? item.amount : 0,
        subscriptions: item.source === 'subscriptions' ? item.amount : 0,
      });
    }
    return acc;
  }, []).slice(0, 12);

  // Revenue breakdown for pie chart
  const revenueBreakdown = [
    { name: 'Game Fees', value: analytics.gameFeesRevenue, color: COLORS[0] },
    { name: 'Subscriptions', value: analytics.subscriptionRevenue, color: COLORS[1] },
  ].filter(item => item.value > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                Super Admin
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Regular Dashboard
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
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {keyMetrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                </div>
                <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* System Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {systemStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {stat.value}
                    {stat.total && (
                      <span className="text-sm text-gray-500 font-normal"> / {stat.total}</span>
                    )}
                  </p>
                </div>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Trends */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Area 
                    type="monotone" 
                    dataKey="game_fees" 
                    stackId="1"
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.6}
                    name="Game Fees"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="subscriptions" 
                    stackId="1"
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.6}
                    name="Subscriptions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueBreakdown}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  >
                    {revenueBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.recentTransactions.slice(0, 10).map((tx, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          tx.type === 'deposit' ? 'bg-green-500' :
                          tx.type === 'withdrawal' ? 'bg-red-500' :
                          tx.type === 'subscription' ? 'bg-blue-500' : 'bg-gray-500'
                        }`}></div>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {tx.type.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tx.chain || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        tx.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}