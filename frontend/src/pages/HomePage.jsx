import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import Stats from '../components/home/Stats';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

function HomePage() {
  return (
    <div className="bg-white text-gray-900">
      <Navbar />
      <Hero />
      <Features />
      <Stats />

      {/* How It Works Section - Professional Redesign */}
      <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] opacity-25"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Simple Process
            </div>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Transform your recycling habits with our intelligent ecosystem. 
              Four simple steps to make a lasting environmental impact.
            </p>
          </div>

          <div className="relative">
            {/* Enhanced Timeline */}
            <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-green-400 via-blue-500 to-green-600 rounded-full opacity-30"></div>
            
            <div className="space-y-24 relative">
              {/* Step 1 - Enhanced */}
              <div className="group">
                <div className="flex flex-col lg:flex-row items-center">
                  <div className="flex-1 lg:text-right lg:pr-16">
                    <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100">
                      <div className="flex items-center justify-center lg:justify-end mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-4">
                        Create Account
                      </h3>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        Join our community with a free account. Start tracking your environmental 
                        impact and unlock exclusive rewards for sustainable living.
                      </p>
                      <div className="mt-6 flex items-center justify-center lg:justify-end">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          Free Forever
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2 my-8 lg:my-0">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-2xl border-4 border-white group-hover:scale-110 transition-transform duration-300">
                      01
                    </div>
                  </div>
                  
                  <div className="flex-1 lg:pl-16">
                    <div className="relative overflow-hidden rounded-2xl shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                      <img
                        src="https://images.unsplash.com/photo-1520333789090-1afc82db536a"
                        alt="User Registration"
                        className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 - Enhanced */}
              <div className="group">
                <div className="flex flex-col lg:flex-row items-center">
                  <div className="lg:order-last flex-1 lg:pl-16">
                    <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100">
                      <div className="flex items-center justify-center lg:justify-start mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-4">
                        Locate Smart Bins
                      </h3>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        Use our intelligent mapping system to find the nearest smart recycling 
                        bins. Real-time availability and route optimization included.
                      </p>
                      <div className="mt-6 flex items-center justify-center lg:justify-start">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          GPS Enabled
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2 my-8 lg:my-0">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-2xl border-4 border-white group-hover:scale-110 transition-transform duration-300">
                      02
                    </div>
                  </div>
                  
                  <div className="lg:order-first flex-1 lg:pr-16">
                    <div className="relative overflow-hidden rounded-2xl shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                      <img
                        src="https://images.unsplash.com/photo-1621955964441-c173e01c135b"
                        alt="Smart Recycling Bins"
                        className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 - Enhanced */}
              <div className="group">
                <div className="flex flex-col lg:flex-row items-center">
                  <div className="flex-1 lg:text-right lg:pr-16">
                    <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100">
                      <div className="flex items-center justify-center lg:justify-end mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V4a1 1 0 00-1-1H5a1 1 0 00-1 1v3a1 1 0 001 1zm12 0h2a1 1 0 001-1V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v3a1 1 0 001 1zM5 20h2a1 1 0 001-1v-3a1 1 0 00-1-1H5a1 1 0 00-1 1v3a1 1 0 001 1z" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-4">
                        Scan & Deposit
                      </h3>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        Simply scan the QR code with our mobile app and deposit your bottles. 
                        Our AI technology automatically sorts and counts your contribution.
                      </p>
                      <div className="mt-6 flex items-center justify-center lg:justify-end">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                          AI Powered
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2 my-8 lg:my-0">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-2xl border-4 border-white group-hover:scale-110 transition-transform duration-300">
                      03
                    </div>
                  </div>
                  
                  <div className="flex-1 lg:pl-16">
                    <div className="relative overflow-hidden rounded-2xl shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                      <img
                        src="https://images.unsplash.com/photo-1611284446314-60a58ac0deb9"
                        alt="Bottle Deposit Process"
                        className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 - Enhanced */}
              <div className="group">
                <div className="flex flex-col lg:flex-row items-center">
                  <div className="lg:order-last flex-1 lg:pl-16">
                    <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100">
                      <div className="flex items-center justify-center lg:justify-start mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-4">
                        Earn Rewards
                      </h3>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        Earn points for every bottle recycled and redeem them for exclusive 
                        eco-friendly products, discounts, and sustainable lifestyle rewards.
                      </p>
                      <div className="mt-6 flex items-center justify-center lg:justify-start">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                          Instant Rewards
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2 my-8 lg:my-0">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-2xl border-4 border-white group-hover:scale-110 transition-transform duration-300">
                      04
                    </div>
                  </div>
                  
                  <div className="lg:order-first flex-1 lg:pr-16">
                    <div className="relative overflow-hidden rounded-2xl shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                      <img
                        src="https://images.unsplash.com/photo-1604689598793-b8bf1dc445a1"
                        alt="Reward System"
                        className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 text-center">
            <div className="inline-flex flex-col sm:flex-row gap-4">
              <a
                href="/register"
                className="group inline-flex items-center justify-center px-8 py-4 rounded-2xl text-white font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <span>Start Your Journey</span>
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <a
                href="/user-dashboard"
                className="inline-flex items-center justify-center px-8 py-4 rounded-2xl text-gray-700 font-semibold bg-white border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                View Dashboard Demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold sm:text-5xl text-gray-900">
              Featured Recycled Products
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Discover what we create from your recycled plastic
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Product Card */}
            {[
              {
                name: "Recycled Tote Bag",
                badge: "80% Recycled",
                desc: "Durable tote made from recycled plastic bottles, perfect for shopping.",
                price: "LKR 2,499",
                points: "250 points",
                img: "https://images.unsplash.com/photo-1581783898377-1c85bf937427",
              },
              {
                name: "Recycled Water Bottle",
                badge: "95% Recycled",
                desc: "Insulated water bottle made from recycled plastic. Keeps drinks cold for 24 hours.",
                price: "LKR 1,899",
                points: "180 points",
                img: "https://images.unsplash.com/photo-1602143407151-7111542de6e8",
              },
              {
                name: "Recycled Notebook Set",
                badge: "100% Recycled",
                desc: "Set of 3 notebooks made from recycled paper and plastic covers.",
                price: "LKR 1,299",
                points: "120 points",
                img: "https://images.unsplash.com/photo-1584589167171-541ce45f1eea",
              },
            ].map((p, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-md hover:shadow-xl overflow-hidden transition"
              >
                <div className="h-64 overflow-hidden">
                  <img
                    src={p.img}
                    alt={p.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-semibold">{p.name}</h3>
                    <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
                      {p.badge}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{p.desc}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-green-700">
                      {p.price}
                    </span>
                    <span className="text-sm text-gray-500">{p.points}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Plastic Decomposition Facts */}
          <section className="py-20 bg-gray-50 mt-20 rounded-xl shadow-inner">
            <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
              <h2 className="text-4xl font-bold text-gray-900">
                Plastic Decomposition Facts
              </h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Learn how long it takes for common plastic items to break down
                in the environment.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12">
                {[
                  { item: "Plastic Bottle", years: "450 years" },
                  { item: "Plastic Bag", years: "20 years" },
                  { item: "Plastic Straw", years: "200 years" },
                ].map((fact, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition"
                  >
                    <h3 className="text-xl font-semibold text-green-700 mb-3">
                      {fact.item}
                    </h3>
                    <p className="text-gray-600 text-lg">
                      Takes <span className="font-bold">{fact.years}</span> to
                      decompose
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="mt-12 text-center">
            <a
              href="/products"
              className="inline-flex items-center px-8 py-3 border border-green-600 text-green-600 bg-white font-medium rounded-lg hover:bg-green-50 transition"
            >
              Browse All Products
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="ml-2 h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default HomePage;
