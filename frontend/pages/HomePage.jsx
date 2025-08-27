import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import Stats from '../components/home/Stats';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

function HomePage() {
  return (
    <div>
      <Navbar/>
      <Hero />
      <Features />
      <Stats />
      
      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Join our recycling ecosystem in just a few simple steps
            </p>
          </div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-green-200"></div>
            
            {/* Steps */}
            <div className="space-y-12 relative">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row items-center">
                <div className="flex-1 md:text-right md:pr-12 pb-4 md:pb-0">
                  <h3 className="text-2xl font-bold text-green-600">Step 1: Register</h3>
                  <p className="mt-2 text-lg text-gray-600">
                    Create your free EcoRecycle account to start tracking your recycling efforts and earning points.
                  </p>
                </div>
                <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 z-10 bg-green-600 rounded-full h-12 w-12 flex items-center justify-center text-white font-bold border-4 border-white">
                  1
                </div>
                <div className="flex-1 md:pl-12 pt-4 md:pt-0">
                  <img 
                    src="https://images.unsplash.com/photo-1520333789090-1afc82db536a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHNpZ24lMjB1cHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60" 
                    alt="Registration" 
                    className="rounded-lg shadow-md w-full h-48 object-cover"
                  />
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:order-last flex-1 md:text-left md:pl-12 pb-4 md:pb-0">
                  <h3 className="text-2xl font-bold text-green-600">Step 2: Find Smart Bins</h3>
                  <p className="mt-2 text-lg text-gray-600">
                    Locate smart recycling bins near you using our app or website map.
                  </p>
                </div>
                <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 z-10 bg-green-600 rounded-full h-12 w-12 flex items-center justify-center text-white font-bold border-4 border-white">
                  2
                </div>
                <div className="md:order-first flex-1 md:pr-12 pt-4 md:pt-0">
                  <img 
                    src="https://images.unsplash.com/photo-1621955964441-c173e01c135b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cmVjeWNsZSUyMGJpbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60" 
                    alt="Smart Bins" 
                    className="rounded-lg shadow-md w-full h-48 object-cover"
                  />
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="flex flex-col md:flex-row items-center">
                <div className="flex-1 md:text-right md:pr-12 pb-4 md:pb-0">
                  <h3 className="text-2xl font-bold text-green-600">Step 3: Deposit Bottles</h3>
                  <p className="mt-2 text-lg text-gray-600">
                    Scan the QR code on the bin with our app, then insert your plastic bottles.
                  </p>
                </div>
                <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 z-10 bg-green-600 rounded-full h-12 w-12 flex items-center justify-center text-white font-bold border-4 border-white">
                  3
                </div>
                <div className="flex-1 md:pl-12 pt-4 md:pt-0">
                  <img 
                    src="https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVjeWNsZSUyMHBsYXN0aWN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60" 
                    alt="Depositing Bottles" 
                    className="rounded-lg shadow-md w-full h-48 object-cover"
                  />
                </div>
              </div>
              
              {/* Step 4 */}
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:order-last flex-1 md:text-left md:pl-12 pb-4 md:pb-0">
                  <h3 className="text-2xl font-bold text-green-600">Step 4: Earn & Redeem</h3>
                  <p className="mt-2 text-lg text-gray-600">
                    Earn points for each bottle recycled and redeem them for eco-friendly products.
                  </p>
                </div>
                <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 z-10 bg-green-600 rounded-full h-12 w-12 flex items-center justify-center text-white font-bold border-4 border-white">
                  4
                </div>
                <div className="md:order-first flex-1 md:pr-12 pt-4 md:pt-0">
                  <img 
                    src="https://images.unsplash.com/photo-1604689598793-b8bf1dc445a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8b25saW5lJTIwc2hvcHBpbmd8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60" 
                    alt="Redeeming Points" 
                    className="rounded-lg shadow-md w-full h-48 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <a
              href="/register"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Join Now & Start Recycling
            </a>
          </div>
        </div>
      </section>
      
      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Featured Recycled Products
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Discover what we create from your recycled plastic
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Product 1 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md transition-shadow duration-300 hover:shadow-xl">
              <div className="h-60 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1581783898377-1c85bf937427?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cmVjeWNsZWQlMjBwcm9kdWN0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60" 
                  alt="Recycled Tote Bag" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">Recycled Tote Bag</h3>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">80% Recycled</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">Made from recycled plastic bottles, this durable tote is perfect for shopping.</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-700">$24.99</span>
                  <span className="text-sm text-gray-500">or 250 points</span>
                </div>
              </div>
            </div>
            
            {/* Product 2 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md transition-shadow duration-300 hover:shadow-xl">
              <div className="h-60 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHJlY3ljbGVkJTIwcHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60" 
                  alt="Recycled Water Bottle" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">Recycled Water Bottle</h3>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">95% Recycled</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">Insulated water bottle made from recycled plastic. Keeps drinks cold for 24 hours.</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-700">$18.99</span>
                  <span className="text-sm text-gray-500">or 180 points</span>
                </div>
              </div>
            </div>
            
            {/* Product 3 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md transition-shadow duration-300 hover:shadow-xl">
              <div className="h-60 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1584589167171-541ce45f1eea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVjeWNsZWQlMjBwcm9kdWN0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60" 
                  alt="Recycled Notebook Set" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">Recycled Notebook Set</h3>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">100% Recycled</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">Set of 3 notebooks made from recycled paper and plastic covers.</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-700">$12.99</span>
                  <span className="text-sm text-gray-500">or 120 points</span>
                </div>
              </div>
            </div>
          </div>

          {/* Plastic Decomposition Facts Section */}
<section className="py-16 bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-12">
      <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
        Plastic Decomposition Facts
      </h2>
      <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
        Learn how long it takes for common plastic items to break down in the environment.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Fact 1 */}
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h3 className="text-xl font-semibold text-green-600 mb-2">Plastic Bottle</h3>
        <p className="text-gray-600 text-lg">Takes <span className="font-bold">450 years</span> to decompose</p>
      </div>

      {/* Fact 2 */}
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h3 className="text-xl font-semibold text-green-600 mb-2">Plastic Bag</h3>
        <p className="text-gray-600 text-lg">Takes <span className="font-bold">20 years</span> to decompose</p>
      </div>

      {/* Fact 3 */}
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h3 className="text-xl font-semibold text-green-600 mb-2">Plastic Straw</h3>
        <p className="text-gray-600 text-lg">Takes <span className="font-bold">200 years</span> to decompose</p>
      </div>
    </div>
  </div>
</section>

          
          <div className="mt-10 text-center">
            <a
              href="/products"
              className="inline-flex items-center px-6 py-3 border border-green-600 text-base font-medium rounded-md text-green-600 bg-white hover:bg-green-50"
            >
              Browse All Products
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
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