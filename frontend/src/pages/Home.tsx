// Home.tsx (Updated)
"use client";

import React, { useState } from "react";
import Navbar from "@/components/home/Navbar";
import HeroSection from "@/components/home/HeroSection";
import LightRays from "@/components/ui/LightRays";
import HowItWorks from "@/components/home/HowItWorks";
import TechStackShowcase from "@/components/home/TechStackShowcase";
import Footer from "@/components/home/Footer";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleStartChat = () => {
    navigate('/chat');
  };

  // const handleBackToHome = () => {
  //   navigate('/');
  // };

  return (
    <div className="home-container relative w-full min-h-screen overflow-hidden">
      {/* Background LightRays */}
      <div className="fixed inset-0 z-0">
        <LightRays 
          raysColor="#00f5ff" 
          raysOrigin="top-center"
          raysSpeed={1.2}
          lightSpread={1.5}
          rayLength={2.5}
          fadeDistance={1.2}
        />
      </div>
      
      {/* Foreground content */}
      <div className="relative z-20 flex flex-col min-h-screen">
        <Navbar />
        
        {/* Updated HeroSection with chat handler */}
        <div className="relative z-20">
          <HeroSection onStartChat={handleStartChat} />
        </div>
        
        <div className="relative z-20">
          <HowItWorks/>
        </div>
        
        <div className="relative z-20">
          <TechStackShowcase/>
        </div>
        
        <div className="relative z-20">
          <Footer/>
        </div>
      </div>
    </div>
  );
};

export default Home;