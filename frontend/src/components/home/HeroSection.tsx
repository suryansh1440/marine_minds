"use client";
import GlobeVisualization from "../home/GlobeVisualization"; // Adjust path
import { useNavigate } from "react-router-dom";

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  return (
    <section className="relative flex items-center justify-center min-h-screen overflow-hidden py-12">
      {/* Background Large Text */}
      <h1 className="
        absolute top-[10%] left-1/2 transform -translate-x-1/2
        text-white/60 font-black tracking-wide 
        text-[clamp(2rem,10vw,18rem)] leading-none 
        select-none pointer-events-none z-0 px-12
      ">
        OCEANOGRAPHY
      </h1>

      {/* Foreground Content */}
      <div className="container relative z-10 mx-auto px-6">
        <div className="flex flex-col items-center justify-between lg:flex-row gap-10 w-full min-h-screen">

          {/* Left Section */}
          <div className="lg:w-1/4 mr-6 space-y-6 text-left mt-24">
            <h2 className="text-lg font-bold text-white">Ocean Data</h2>
            <p className="text-sm leading-relaxed text-gray-300">
              Monitor real-time ocean conditions with AI-powered analysis.
            </p>

            {/* Example Progress Bars */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-gray-300 mb-1">
                  <span>Temperature</span>
                  <span className="text-cyan-400">24.5°C</span>
                </div>
                <div className="h-2 bg-gray-700/40 rounded-full">
                  <div className="h-2 bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full w-[82%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm text-gray-300 mb-1">
                  <span>Salinity</span>
                  <span className="text-green-400">35.2 PSU</span>
                </div>
                <div className="h-2 bg-gray-700/40 rounded-full">
                  <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full w-[68%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm text-gray-300 mb-1">
                  <span>Pressure</span>
                  <span className="text-purple-400">1013 hPa</span>
                </div>
                <div className="h-2 bg-gray-700/40 rounded-full">
                  <div className="h-2 bg-gradient-to-r from-purple-500 to-violet-400 rounded-full w-[75%]" />
                </div>
              </div>
              <div className="mt-20">
                <button
                  className="group bg-background cursor:pointer  border-[#3265e7] border-[0.25px] text-sm px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 transform hover:border-[#3265e7] hover:border-[1px] hover:shadow-[0_0_15px_rgba(50,101,231,0.3)]"
                  onClick={() => {
                    console.log('Navigating to AL Conversational Interface');
                    navigate('/chat');

                  }}
                >
                  <span className="flex items-center justify-center">
                    Get started with AI Interface
                    <svg
                      className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200 animate-pulse group-hover:animate-none"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Center Globe - Updated container */}
          <div className="flex justify-center items-center lg:w-2/4">
            <div className="relative w-full h-96 md:h-[500px] flex items-center justify-center">
              <GlobeVisualization />
            </div>
          </div>

          {/* Right Section */}
          <div className="lg:w-1/4 space-y-8 text-right mt-44">
            <h2 className="text-xl font-bold text-white">FloatChat Impact</h2>
            <div>
              <div className="text-xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                99.7%
              </div>
              <p className="text-gray-300">Data Accuracy</p>
            </div>
            <div>
              <div className="text-xl font-extrabold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                4,000+
              </div>
              <p className="text-gray-300">ARGO Flows Monitored</p>
            </div>
            <div>
              <div className="text-xl font-extrabold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                24/7
              </div>
              <p className="text-gray-300">Ocean Data Access</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;