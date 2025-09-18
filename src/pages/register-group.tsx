import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  TagIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";
import { ApiHead } from "@/utils/helpers";

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: any;
  ready: () => void;
  close: () => void;
  MainButton: {
    setText: (text: string) => void;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    color: string;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

interface GroupRegistrationData {
  telegramChatId: number;
  title: string;
  type: 'group' | 'supergroup' | 'channel';
  description: string;
  category: 'DeFi' | 'Gaming' | 'NFT' | 'Community' | 'Trading' | 'Other';
  publicJoinLink: string;
  isDiscoverable: boolean;
  tags: string[];
}

export default function RegisterGroup() {
  const router = useRouter();
  const [token, setToken] = useState<string>("");
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const [formData, setFormData] = useState<GroupRegistrationData>({
    telegramChatId: 0,
    title: "",
    type: "supergroup",
    description: "",
    category: "Community",
    publicJoinLink: "",
    isDiscoverable: true,
    tags: []
  });

  const [tagInput, setTagInput] = useState("");

  const categories = [
    { id: 'DeFi', name: 'DeFi', icon: '💰', description: 'Decentralized Finance' },
    { id: 'Gaming', name: 'Gaming', icon: '🎮', description: 'Gaming & GameFi' },
    { id: 'NFT', name: 'NFT', icon: '🖼️', description: 'NFT & Digital Art' },
    { id: 'Community', name: 'Community', icon: '👥', description: 'General Community' },
    { id: 'Trading', name: 'Trading', icon: '📈', description: 'Trading & Analysis' },
    { id: 'Other', name: 'Other', icon: '🔧', description: 'Other Topics' }
  ];

  useEffect(() => {
    // Initialize Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      webApp.ready();
      
      // Configure main button
      webApp.MainButton.color = '#3B82F6';
      webApp.MainButton.setText('Complete Registration');
      webApp.MainButton.onClick(handleSubmit);
    }

    // Get token from URL parameters
    const urlToken = router.query.token as string;
    if (urlToken) {
      setToken(urlToken);
      validateToken(urlToken);
    } else if (router.isReady) {
      setError("Registration token is missing from URL");
      setLoading(false);
    }
  }, [router.query.token, router.isReady]);

  const validateToken = async (token: string) => {
    try {
      const response = await fetch(`${ApiHead}/api/registration/validate-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await response.json();
      
      if (data.success && data.validation.isValid) {
        setLoading(false);
      } else {
        setError(`Invalid registration token: ${data.validation.reason || 'Unknown error'}`);
        setLoading(false);
      }
    } catch (error) {
      console.error('Token validation error:', error);
      setError('Failed to validate registration token');
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof GroupRegistrationData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError("");
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async () => {
    if (!token) {
      setError("Registration token is missing");
      return;
    }

    // Validation
    if (!formData.telegramChatId || formData.telegramChatId >= 0) {
      setError("Please enter a valid Telegram group ID (negative number)");
      return;
    }

    if (!formData.title.trim()) {
      setError("Group title is required");
      return;
    }

    if (!formData.description.trim()) {
      setError("Group description is required");
      return;
    }

    if (formData.isDiscoverable && !formData.publicJoinLink.trim()) {
      setError("Public join link is required for discoverable groups");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${ApiHead}/api/registration/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          registrationData: formData
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        
        // Show success in Telegram WebApp
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.MainButton.hide();
          
          // Close WebApp after 3 seconds
          setTimeout(() => {
            window.Telegram?.WebApp?.close();
          }, 3000);
        }
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Failed to complete registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Validating registration token...</p>
        </div>
      </div>
    );
  }

  if (error && !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-4">Registration Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">Please contact support or try again with a valid registration link.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
          <p className="text-gray-600 mb-6">{success}</p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Next steps:</strong>
              <br />1. Add the bot to your group
              <br />2. Make the bot an admin
              <br />3. Your subscription will activate automatically
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-4">This window will close automatically...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto p-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-4">
            <BuildingOfficeIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Register Your Group</h1>
          <p className="text-gray-600">Secure group registration for premium features</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Registration Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          
          {/* Step 1: Group Information */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 text-blue-600" />
              Group Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telegram Group ID *
                </label>
                <input
                  type="number"
                  value={formData.telegramChatId || ""}
                  onChange={(e) => handleInputChange('telegramChatId', parseInt(e.target.value) || 0)}
                  placeholder="-1001234567890"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Find your group ID by using /showgroupid command in your group
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="My Awesome Community"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="supergroup">Supergroup</option>
                  <option value="group">Group</option>
                  <option value="channel">Channel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Tell people what your group is about..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Category & Discovery */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TagIcon className="w-5 h-5 mr-2 text-purple-600" />
              Category & Discovery
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Category *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleInputChange('category', category.id)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        formData.category === category.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{category.icon}</span>
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-xs text-gray-500">{category.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={formData.isDiscoverable}
                    onChange={(e) => handleInputChange('isDiscoverable', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Make group discoverable</div>
                    <div className="text-sm text-gray-500">Allow users to find your group in our discovery system</div>
                  </div>
                </label>
              </div>

              {formData.isDiscoverable && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Public Join Link *
                  </label>
                  <input
                    type="url"
                    value={formData.publicJoinLink}
                    onChange={(e) => handleInputChange('publicJoinLink', e.target.value)}
                    placeholder="https://t.me/your_group"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (Optional)
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add tags..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Section */}
          <div className="p-6 bg-gray-50">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing Registration...
                </>
              ) : (
                <>
                  Complete Registration
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your group will be registered in our system</li>
                <li>• Add our bot to your group as an admin</li>
                <li>• Your premium subscription will activate automatically</li>
                <li>• Start using advanced engagement features!</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Secure registration powered by Telegram WebApp
          </p>
        </div>
      </div>
    </div>
  );
}