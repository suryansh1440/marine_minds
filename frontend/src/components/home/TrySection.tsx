"use client";
import React from 'react';

const TrySection: React.FC = () => {
  const handleTryDemo = () => {
    // Add your demo click handler here
    console.log('Try Demo clicked');
  };

  return (
    <section className="w-full px-8 py-24">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-20">
        {/* Left side - Text content */}
        <div className="flex-1 p-8 lg:text-left text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-8 leading-tight">
            FloatChat: AI-Powered Ocean Data
          </h1>
          <p className="text-md text-gray-300 mb-8 leading-relaxed font-light">
            FloatChat democratizes access to ARGO oceanographic data through AI conversations.
            Transform complex NetCDF files into intuitive insights with our multi-agent system.
            Ask natural questions and get interactive maps, depth profiles, and time-series visualizations.
          </p>
          <button 
            className="bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white px-8 py-4 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold text-md" 
            onClick={handleTryDemo} 
            type="button"
          >
            Try Demo
          </button>
        </div>
        
        {/* Right side - MacBook with chatbot interface */}
        <div className="flex-1 flex justify-center items-center">
          <div className="relative">
            {/* MacBook Frame */}
            <div className="relative w-[600px] h-[400px]">
              {/* MacBook top bar */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-t-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-gray-700 rounded-full"></div>
              </div>
              
              {/* MacBook screen */}
              <div className="w-full h-full bg-gray-900 rounded-lg border-8 border-gray-900 shadow-2xl">
                {/* Screen content */}
                <div className="w-full h-full bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 rounded overflow-hidden">
                  {/* Chatbot interface mockup */}
                  <div className="h-full flex flex-col">
                  </div>
                </div>
              </div>
              
              {/* MacBook base */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-96 h-8 bg-gray-800 rounded-b-lg shadow-lg"></div>
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-64 h-1 bg-gray-900 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrySection;