function Hero() {
  return (
    <section className="relative bg-gradient-to-r from-green-600 to-green-800 text-white">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center md:text-left md:w-2/3">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Recycle Plastic, Earn Rewards, Save the Planet
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mb-8">
            Join our innovative recycling system where you can dispose of plastic bottles, earn points, and help create new recycled products. Make an environmental impact while being rewarded.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
            <a
              href="/bins"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-white hover:bg-gray-100 transition-colors"
            >
              Find Smart Bins
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
            <a
              href="/register"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-900 hover:bg-green-950 transition-colors"
            >
              Join Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;