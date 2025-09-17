// src/components/business/HelpCenter.jsx
import React, { useState } from "react";
import { 
  BookOpenIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  PhoneIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

const helpCategories = [
  {
    id: 1,
    title: "Getting Started",
    description: "Learn the basics of using EcoCycle",
    icon: <BookOpenIcon className="w-8 h-8" />,
    color: "bg-blue-100 text-blue-600",
    articles: [
      "Creating Your Account",
      "Setting Up Your Profile",
      "Understanding the Dashboard",
      "First Steps Guide"
    ]
  },
  {
    id: 2,
    title: "Collection Services",
    description: "Everything about waste collection",
    icon: <DocumentTextIcon className="w-8 h-8" />,
    color: "bg-green-100 text-green-600",
    articles: [
      "Scheduling Collections",
      "Collection Routes",
      "Material Preparation",
      "Tracking Your Collections"
    ]
  },
  {
    id: 3,
    title: "Rewards & Points",
    description: "Maximize your rewards",
    icon: <ChatBubbleLeftRightIcon className="w-8 h-8" />,
    color: "bg-purple-100 text-purple-600",
    articles: [
      "How Points Work",
      "Redeeming Rewards",
      "Membership Tiers",
      "Bonus Opportunities"
    ]
  },
  {
    id: 4,
    title: "Products & Orders",
    description: "Shopping and order management",
    icon: <QuestionMarkCircleIcon className="w-8 h-8" />,
    color: "bg-orange-100 text-orange-600",
    articles: [
      "Browse Products",
      "Placing Orders",
      "Payment Methods",
      "Order Tracking"
    ]
  }
];

const videoTutorials = [
  {
    id: 1,
    title: "EcoCycle Platform Overview",
    duration: "5:30",
    thumbnail: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400",
    description: "Get a complete overview of the EcoCycle platform and its features"
  },
  {
    id: 2,
    title: "Setting Up Collection Services",
    duration: "3:45",
    thumbnail: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400",
    description: "Learn how to schedule and manage your waste collection services"
  },
  {
    id: 3,
    title: "Maximizing Your Rewards",
    duration: "4:20",
    thumbnail: "https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=400",
    description: "Tips and tricks to earn more points and get better rewards"
  },
  {
    id: 4,
    title: "Shopping for Eco Products",
    duration: "6:15",
    thumbnail: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400",
    description: "Browse and purchase eco-friendly products made from recycled materials"
  }
];

const quickActions = [
  {
    title: "Contact Support",
    description: "Get help from our support team",
    icon: <PhoneIcon className="w-6 h-6" />,
    link: "/contact",
    color: "bg-blue-600"
  },
  {
    title: "Live Chat",
    description: "Chat with us in real-time",
    icon: <ChatBubbleLeftRightIcon className="w-6 h-6" />,
    link: "#",
    color: "bg-green-600"
  },
  {
    title: "FAQ",
    description: "Find quick answers",
    icon: <QuestionMarkCircleIcon className="w-6 h-6" />,
    link: "/faq",
    color: "bg-purple-600"
  },
  {
    title: "Video Tutorials",
    description: "Watch step-by-step guides",
    icon: <VideoCameraIcon className="w-6 h-6" />,
    link: "#tutorials",
    color: "bg-orange-600"
  }
];

const popularArticles = [
  "How to earn more points",
  "Setting up automatic collections",
  "Understanding membership tiers",
  "Troubleshooting common issues",
  "Payment and billing questions",
  "Product return policy"
];

export default function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
              <p className="text-gray-600 mt-1">Find guides, tutorials, and support resources</p>
            </div>
            <Link 
              to="/" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How can we help you?</h2>
          <div className="max-w-2xl mx-auto relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
            <input
              type="text"
              placeholder="Search for help articles, guides, or tutorials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group"
              >
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  {action.icon}
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h4>
                <p className="text-gray-600 text-sm">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Help Categories */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Browse by Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {helpCategories.map((category) => (
              <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start space-x-4">
                  <div className={`w-16 h-16 ${category.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">{category.title}</h4>
                    <p className="text-gray-600 mb-4">{category.description}</p>
                    <div className="space-y-2">
                      {category.articles.map((article, index) => (
                        <div key={index} className="flex items-center text-blue-600 hover:text-blue-700 cursor-pointer transition-colors duration-200">
                          <ArrowRightIcon className="w-4 h-4 mr-2" />
                          <span className="text-sm">{article}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Video Tutorials */}
        <div className="mb-12" id="tutorials">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Video Tutorials</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {videoTutorials.map((video) => (
              <div key={video.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group cursor-pointer">
                <div className="relative">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                      <PlayIcon className="w-8 h-8 text-blue-600 ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{video.title}</h4>
                  <p className="text-gray-600 text-sm">{video.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Articles */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Popular Articles</h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                {popularArticles.map((article, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 px-3 rounded-lg cursor-pointer transition-colors duration-200">
                    <span className="text-gray-900">{article}</span>
                    <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Need More Help?</h3>
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                <ChatBubbleLeftRightIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Live Chat Support</h4>
                <p className="text-gray-600 text-sm mb-4">Chat with our support team in real-time</p>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                  Start Chat
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                <PhoneIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Phone Support</h4>
                <p className="text-gray-600 text-sm mb-4">Speak directly with our team</p>
                <Link 
                  to="/contact"
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 block text-center"
                >
                  Contact Us
                </Link>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                <QuestionMarkCircleIcon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">FAQ</h4>
                <p className="text-gray-600 text-sm mb-4">Find answers to common questions</p>
                <Link 
                  to="/faq"
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200 block text-center"
                >
                  View FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Was this helpful?</h3>
          <p className="text-gray-600 mb-6">Help us improve our help center by providing feedback</p>
          <div className="flex justify-center space-x-4">
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200">
              👍 Yes, helpful
            </button>
            <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200">
              👎 Not helpful
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
