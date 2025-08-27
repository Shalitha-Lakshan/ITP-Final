function Stats() {
  const stats = [
    { label: "Bottles Recycled", value: "5.2M+" },
    { label: "Points Awarded", value: "10.8M+" },
    { label: "Smart Bins Deployed", value: "350+" },
    { label: "CO₂ Reduced (tons)", value: "780+" }
  ];

  return (
    <section className="bg-green-700 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Our Impact So Far</h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-green-100">
            Together, we're making a measurable difference for our planet
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold text-white">{stat.value}</div>
              <div className="mt-2 text-green-200">{stat.label}</div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <a 
            href="/impact" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-white hover:bg-gray-100"
          >
            View Detailed Impact Report
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

export default Stats;