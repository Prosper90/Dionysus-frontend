import { useState } from "react";
import { useRouter } from "next/router";
import {
  PlayIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  SparklesIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: PlayIcon,
      title: "Interactive Games",
      description:
        "Engage your community with stake raffles, jackpot pools, meme battles, and team competitions.",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: CurrencyDollarIcon,
      title: "Multi-Chain Payments",
      description:
        "Support for BSC, BASE, and Solana networks with real-time USD conversion.",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: UserGroupIcon,
      title: "Group Management",
      description:
        "Premium subscription tiers with advanced group features and leaderboards.",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      icon: ChartBarIcon,
      title: "Analytics Dashboard",
      description:
        "Comprehensive analytics and revenue tracking for group performance.",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      icon: ShieldCheckIcon,
      title: "Secure & Reliable",
      description:
        "Enterprise-grade security with automated transaction processing.",
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      icon: SparklesIcon,
      title: "Easy Integration",
      description: "Simple setup with comprehensive documentation and support.",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
  ];

  const games = [
    {
      name: "Stake Raffles",
      description:
        "Users can join raffles with customizable entry fees and prizes",
      icon: "🎰",
    },
    {
      name: "Jackpot Pool",
      description: "Community-driven jackpot games with progressive pools",
      icon: "💰",
    },
    {
      name: "Meme Battles",
      description: "Photo submission contests with community voting",
      icon: "🎭",
    },
    {
      name: "Red vs Blue",
      description: "Team-based competitions with real-time scoring",
      icon: "⚔️",
    },
    {
      name: "Caption This",
      description: "Creative caption contests for engagement",
      icon: "📸",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="relative bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <RocketLaunchIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dionysus EngagementBot
              </h1>
            </div>
            {/* <button
              onClick={() => router.push("/login")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Admin Dashboard
            </button> */}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-blue-100 rounded-full px-4 py-2 mb-8">
              <SparklesIcon className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-blue-800 font-medium">
                Next-Gen Telegram Engagement
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Transform Your Telegram
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Community Engagement
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
              The ultimate Telegram bot for community engagement with
              interactive games, multi-chain payments, and comprehensive
              analytics. Boost participation and generate revenue with premium
              gaming features.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() =>
                  window.open("https://t.me/your_bot_username", "_blank")
                }
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-lg"
              >
                🚀 Start Bot
              </button>
              <button
                onClick={() => window.open("https://t.me/your_owner_username", "_blank")}
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold text-lg"
              >
                Contact Owner
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Communities
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to create engaging experiences and monetize
              your Telegram groups
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 group"
              >
                <div
                  className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200`}
                >
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Games Showcase */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <TrophyIcon className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Interactive Gaming Suite
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Engage your community with our comprehensive collection of
              interactive games and competitions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100"
              >
                <div className="text-4xl mb-4">{game.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {game.name}
                </h3>
                <p className="text-gray-600 text-sm">{game.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                Multi-Chain
              </div>
              <p className="text-gray-600">Payment Support</p>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                Real-Time
              </div>
              <p className="text-gray-600">USD Conversion</p>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-green-600 mb-2">
                Advanced
              </div>
              <p className="text-gray-600">Analytics</p>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                24/7
              </div>
              <p className="text-gray-600">Automated System</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Community?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of communities already using Dionysus EngagementBot
            to boost engagement and generate revenue.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() =>
                window.open("https://t.me/Dionysus_Engagement_bot", "_blank")
              }
              className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg font-semibold text-lg"
            >
              Get Started Now
            </button>
            <button
              onClick={() => window.open("https://t.me/your_owner_username", "_blank")}
              className="border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-200 font-semibold text-lg"
            >
              Contact Owner
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <RocketLaunchIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Dionysus EngagementBot</span>
            </div>
            <p className="text-gray-400">
              © 2025 Dionysus EngagementBot. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
