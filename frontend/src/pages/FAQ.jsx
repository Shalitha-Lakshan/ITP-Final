import React, { useState } from 'react';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/Navbar';

const faqData = [
  {
    question: "How do I recycle my plastic bottles?",
    answer: "You can drop your plastic bottles at any of our smart bins located across the city. Make sure bottles are clean and empty before recycling."
  },
  {
    question: "What types of plastic do you accept?",
    answer: "We accept PET, HDPE, and other commonly recycled plastics. Please check the bin signage for accepted types."
  },
  {
    question: "How do I earn points for recycling?",
    answer: "Each bottle deposited in a smart bin earns you points. These points can be redeemed for rewards in our Shop."
  },
  {
    question: "Can businesses participate in recycling?",
    answer: "Yes! We have specialized solutions for manufacturers and large-scale recyclers. Contact us through our website for more info."
  },
  {
    question: "What happens to the recycled plastic?",
    answer: "Recycled plastics are processed and converted into reusable products, such as eco-friendly packaging and merchandise."
  }
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-green-700 mb-8 text-center">Frequently Asked Questions</h1>
        
        <div className="max-w-3xl mx-auto space-y-4">
          {faqData.map((faq, index) => (
            <div 
              key={index} 
              className="border border-green-300 rounded-lg overflow-hidden shadow-sm"
            >
              <button
                className="w-full text-left px-6 py-4 bg-green-100 hover:bg-green-200 transition-colors flex justify-between items-center"
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-medium">{faq.question}</span>
                <span className="ml-4 text-green-700">{openIndex === index ? "-" : "+"}</span>
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 bg-white text-gray-700">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default FAQ;
