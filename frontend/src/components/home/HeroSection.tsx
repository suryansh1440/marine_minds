"use client";
import GlobeVisualization from "../home/GlobeVisualization"; // Adjust path

const HeroSection: React.FC = () => {
  return (
    <section className="relative flex items-center justify-center min-h-screen overflow-hidden py-12">
      {/* Background Large Text */}
      <h1 className="
        absolute top-[20%] left-1/2 transform -translate-x-1/2
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
          <div className="lg:w-1/4 space-y-6 text-left mt-44">
            <h2 className="text-2xl font-bold text-white">Ocean Data</h2>
            <p className="text-md leading-relaxed text-gray-300">
              Monitor real-time ocean conditions with AI-powered analysis.
            </p>

            {/* Example Progress Bars */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-300 mb-1">
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
            </div>
          </div>

          {/* Center Globe */}
          <div className="flex justify-center items-center lg:w-2/4">
            <div className="relative w-[20rem] h-[20rem] md:w-[28rem] md:h-[28rem]">
              <GlobeVisualization />
            </div>
          </div>

          {/* Right Section */}
          <div className="lg:w-1/4 space-y-8 text-right mt-44">
            <h2 className="text-3xl font-bold text-white">Our Rate</h2>
            <div>
              <div className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                98%
              </div>
              <p className="text-gray-300">Accuracy Increase</p>
            </div>
            <div>
              <div className="text-5xl font-extrabold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                300+
              </div>
              <p className="text-gray-300">Sensors Deployed</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;