import React from "react";
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const AboutUs = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-green-700 text-white py-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-extrabold mb-6">About EcoCycle</h1>
          <p className="text-xl md:text-2xl">
            Transforming plastic waste into valuable resources for a greener future.
          </p>
        </div>
      </section>

      {/* Who We Are */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1615391324816-2f5d8b8edc12?auto=format&fit=crop&w=800&q=80" 
              alt="Recycling Concept" 
              className="rounded-xl shadow-lg w-full"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-green-700 mb-4">Who We Are</h2>
            <p className="text-gray-700 mb-4">
              EcoCycle is a visionary plastic bottle recycling system dedicated to reducing
              environmental pollution. Our mission is to make recycling accessible, innovative, 
              and impactful for communities everywhere.
            </p>
            <p className="text-gray-700">
              By combining technology, sustainability practices, and community engagement, 
              we turn plastic waste into reusable materials, contributing to a cleaner planet.
            </p>
          </div>
        </div>
      </section>

      {/* Our Mission, Vision & Values */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-green-700 mb-12">Our Mission, Vision & Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-green-100 p-8 rounded-xl shadow hover:shadow-lg transition-transform transform hover:-translate-y-2">
              <h3 className="text-2xl font-semibold mb-4">Mission</h3>
              <p className="text-gray-700">
                Make plastic recycling easy and effective, turning waste into sustainable resources.
              </p>
            </div>
            <div className="bg-green-100 p-8 rounded-xl shadow hover:shadow-lg transition-transform transform hover:-translate-y-2">
              <h3 className="text-2xl font-semibold mb-4">Vision</h3>
              <p className="text-gray-700">
                A world where plastic waste no longer pollutes the environment, but creates value.
              </p>
            </div>
            <div className="bg-green-100 p-8 rounded-xl shadow hover:shadow-lg transition-transform transform hover:-translate-y-2">
              <h3 className="text-2xl font-semibold mb-4">Values</h3>
              <p className="text-gray-700">
                Sustainability, Innovation, Community Engagement, Transparency, and Responsibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-green-700 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Our Movement</h2>
          <p className="text-lg md:text-xl mb-8">
            Be a part of EcoCycle and help create a cleaner, greener future. Every bottle counts!
          </p>
          <a 
            href="/register" 
            className="inline-block bg-white text-green-700 font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          >
            Get Started
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};
//check connect

export default AboutUs;
