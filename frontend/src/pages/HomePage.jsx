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

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Join our recycling ecosystem in just a few simple steps
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-green-100 rounded"></div>

            <div className="space-y-20 relative">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row items-center">
                <div className="flex-1 md:text-right md:pr-12">
                  <h3 className="text-2xl font-semibold text-green-700">
                    Step 1: Register
                  </h3>
                  <p className="mt-3 text-gray-600 text-lg">
                    Create your free EcoRecycle account to start tracking your
                    recycling efforts and earning points.
                  </p>
                </div>
                <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 bg-green-600 rounded-full h-14 w-14 flex items-center justify-center text-white font-bold shadow-lg border-4 border-white">
                  1
                </div>
                <div className="flex-1 md:pl-12 mt-6 md:mt-0">
                  <img
                    src="https://images.unsplash.com/photo-1520333789090-1afc82db536a"
                    alt="Registration"
                    className="rounded-xl shadow-lg w-full h-56 object-cover hover:scale-105 transition-transform"
                  />
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:order-last flex-1 md:pl-12">
                  <h3 className="text-2xl font-semibold text-green-700">
                    Step 2: Find Smart Bins
                  </h3>
                  <p className="mt-3 text-gray-600 text-lg">
                    Locate smart recycling bins near you using our app or
                    website map.
                  </p>
                </div>
                <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 bg-green-600 rounded-full h-14 w-14 flex items-center justify-center text-white font-bold shadow-lg border-4 border-white">
                  2
                </div>
                <div className="md:order-first flex-1 md:pr-12 mt-6 md:mt-0">
                  <img
                    src="https://images.unsplash.com/photo-1621955964441-c173e01c135b"
                    alt="Smart Bins"
                    className="rounded-xl shadow-lg w-full h-56 object-cover hover:scale-105 transition-transform"
                  />
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col md:flex-row items-center">
                <div className="flex-1 md:text-right md:pr-12">
                  <h3 className="text-2xl font-semibold text-green-700">
                    Step 3: Deposit Bottles
                  </h3>
                  <p className="mt-3 text-gray-600 text-lg">
                    Scan the QR code on the bin with our app, then insert your
                    plastic bottles.
                  </p>
                </div>
                <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 bg-green-600 rounded-full h-14 w-14 flex items-center justify-center text-white font-bold shadow-lg border-4 border-white">
                  3
                </div>
                <div className="flex-1 md:pl-12 mt-6 md:mt-0">
                  <img
                    src="https://images.unsplash.com/photo-1611284446314-60a58ac0deb9"
                    alt="Depositing Bottles"
                    className="rounded-xl shadow-lg w-full h-56 object-cover hover:scale-105 transition-transform"
                  />
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:order-last flex-1 md:pl-12">
                  <h3 className="text-2xl font-semibold text-green-700">
                    Step 4: Earn & Redeem
                  </h3>
                  <p className="mt-3 text-gray-600 text-lg">
                    Earn points for each bottle recycled and redeem them for
                    eco-friendly products.
                  </p>
                </div>
                <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 bg-green-600 rounded-full h-14 w-14 flex items-center justify-center text-white font-bold shadow-lg border-4 border-white">
                  4
                </div>
                <div className="md:order-first flex-1 md:pr-12 mt-6 md:mt-0">
                  <img
                    src="https://images.unsplash.com/photo-1604689598793-b8bf1dc445a1"
                    alt="Redeeming Points"
                    className="rounded-xl shadow-lg w-full h-56 object-cover hover:scale-105 transition-transform"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <a
              href="/register"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg text-white font-medium bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition"
            >
              Join Now & Start Recycling
            </a>
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
                price: "$24.99",
                points: "250 points",
                img: "https://images.unsplash.com/photo-1581783898377-1c85bf937427",
              },
              {
                name: "Recycled Water Bottle",
                badge: "95% Recycled",
                desc: "Insulated water bottle made from recycled plastic. Keeps drinks cold for 24 hours.",
                price: "$18.99",
                points: "180 points",
                img: "https://images.unsplash.com/photo-1602143407151-7111542de6e8",
              },
              {
                name: "Recycled Notebook Set",
                badge: "100% Recycled",
                desc: "Set of 3 notebooks made from recycled paper and plastic covers.",
                price: "$12.99",
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
