"use client";

import React, { useRef, useEffect, useState } from "react";
import Globe from "react-globe.gl";
import type { GlobeMethods } from "react-globe.gl";
import * as THREE from 'three';

interface ArgoDevice {
  lat: number;
  lng: number;
  altitude: number;
}

interface ArcData {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  time: number;
  color: string[];
}

interface SatelliteData {
  lat: number;
  lng: number;
  altitude: number;
}

const GlobeVisualization: React.FC = () => {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [argoDevices, setArgoDevices] = useState<ArgoDevice[]>([]);
  const [arcsData, setArcsData] = useState<ArcData[]>([]);
  const [satelliteArcsData, setSatelliteArcsData] = useState<ArcData[]>([]);
  const [landPolygons, setLandPolygons] = useState<any[]>([]);
  const [satellite, setSatellite] = useState<SatelliteData>({ lat: 0, lng: 0, altitude: 0.5 });
  const animationRef = useRef<number | null>(null);

  // Arc configuration constants from the second code
  const min = 1000;
  const max = 4000;

  // Predefined ocean coordinates for Argo floats
  const oceanCoordinates = [
    // Atlantic Ocean
    { lat: 35.0, lng: -40.0 }, { lat: 25.0, lng: -50.0 }, { lat: 15.0, lng: -35.0 },
    { lat: 5.0, lng: -25.0 }, { lat: -10.0, lng: -30.0 }, { lat: -25.0, lng: -15.0 },
    { lat: -35.0, lng: -20.0 }, { lat: 45.0, lng: -30.0 }, { lat: 55.0, lng: -25.0 },

    // Pacific Ocean
    { lat: 35.0, lng: -150.0 }, { lat: 25.0, lng: -160.0 }, { lat: 15.0, lng: -140.0 },
    { lat: 5.0, lng: -170.0 }, { lat: -10.0, lng: -150.0 }, { lat: -25.0, lng: -160.0 },
    { lat: -35.0, lng: -140.0 }, { lat: 45.0, lng: -135.0 }, { lat: 0.0, lng: 170.0 },
    { lat: 20.0, lng: 160.0 }, { lat: -20.0, lng: 175.0 }, { lat: 10.0, lng: -120.0 },

    // Indian Ocean
    { lat: 10.0, lng: 75.0 }, { lat: 0.0, lng: 85.0 }, { lat: -10.0, lng: 80.0 },
    { lat: -20.0, lng: 90.0 }, { lat: -30.0, lng: 85.0 }, { lat: -40.0, lng: 75.0 },
    { lat: 20.0, lng: 65.0 }, { lat: -15.0, lng: 105.0 }, { lat: -25.0, lng: 110.0 },

    // Southern Ocean
    { lat: -55.0, lng: 0.0 }, { lat: -60.0, lng: 45.0 }, { lat: -58.0, lng: 90.0 },
    { lat: -62.0, lng: 135.0 }, { lat: -57.0, lng: 180.0 }, { lat: -59.0, lng: -135.0 },
    { lat: -61.0, lng: -90.0 }, { lat: -56.0, lng: -45.0 },

    // Arctic Ocean
    { lat: 75.0, lng: 0.0 }, { lat: 78.0, lng: 45.0 }, { lat: 80.0, lng: 90.0 },
    { lat: 77.0, lng: 135.0 }, { lat: 79.0, lng: 180.0 }, { lat: 76.0, lng: -135.0 },
    { lat: 81.0, lng: -90.0 }, { lat: 74.0, lng: -45.0 },
  ];

  // Load land polygons for borders
  useEffect(() => {
    fetch("https://unpkg.com/world-atlas@2/countries-110m.json")
      .then((res) => res.json())
      .then((worldData) => {
        // @ts-ignore
        import("topojson-client").then((topojson) => {
          const geoJson = topojson.feature(worldData, worldData.objects.countries).features;
          setLandPolygons(geoJson);
        });
      });
  }, []);

  // Generate floats using predefined ocean coordinates
  useEffect(() => {
    const floats: ArgoDevice[] = [];

    // Select 80 random ocean coordinates and add slight variations
    for (let i = 0; i < 80; i++) {
      const baseCoord = oceanCoordinates[Math.floor(Math.random() * oceanCoordinates.length)];
      const lat = baseCoord.lat + (Math.random() - 0.5) * 10; // ±5 degree variation
      const lng = baseCoord.lng + (Math.random() - 0.5) * 20; // ±10 degree variation

      floats.push({
        lat: Math.max(-85, Math.min(85, lat)), // Keep within valid range
        lng: lng,
        altitude: 0.01 + Math.random() * 0.02
      });
    }

    setArgoDevices(floats);

    // Create arcs between floats using the arc properties from the second code
    const arcs: ArcData[] = [];
    for (let i = 0; i < 40; i++) {
      const source = floats[Math.floor(Math.random() * floats.length)];
      const target = floats[Math.floor(Math.random() * floats.length)];
      const randTime = Math.floor(Math.random() * (max - min + 1) + min);
      
      if (source !== target) {
        arcs.push({
          startLat: source.lat,
          startLng: source.lng,
          endLat: target.lat,
          endLng: target.lng,
          time: randTime,
          color: ['#ffffff00', '#faf7e6', '#ffffff00'], // From second code
        });
      }
    }
    setArcsData(arcs);
  }, []);

  // Animate satellite orbit and create satellite-to-float connections
  useEffect(() => {
    let angle = 0;

    const animate = () => {
      angle += 0.01; // Satellite orbit speed

      // Satellite orbital position
      const satLat = Math.sin(angle * 0.3) * 30; // Varies between -30 and +30 degrees
      const satLng = angle * 10; // Continuous rotation

      setSatellite({
        lat: satLat,
        lng: satLng,
        altitude: 0.4 + Math.sin(angle * 0.5) * 0.1 // Varying altitude
      });

      // Create arcs from satellite to random Argo floats using the same arc properties
      if (argoDevices.length > 0) {
        const satelliteArcs: ArcData[] = [];
        for (let i = 0; i < 8; i++) { // Connect to 8 random floats
          const randomFloat = argoDevices[Math.floor(Math.random() * argoDevices.length)];
          const randTime = Math.floor(Math.random() * (max - min + 1) + min);
          
          satelliteArcs.push({
            startLat: satLat,
            startLng: satLng,
            endLat: randomFloat.lat,
            endLng: randomFloat.lng,
            time: randTime,
            color: ['#ffffff00', '#faf7e6', '#ffffff00'], // From second code
          });
        }
        setSatelliteArcsData(satelliteArcs);
      }

      // Rotate the globe
      if (globeRef.current) {
        const globe = globeRef.current;
        const currentRotation = globe.scene().rotation;
        currentRotation.y += 0.002; // Earth rotation speed
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [argoDevices]);

  // Set initial view and disable zoom
  useEffect(() => {
    if (globeRef.current) {
      // Set fixed view with no zoom capability
      globeRef.current.pointOfView({ lat: 0, lng: 0, altitude: 1.8 }, 0);
      
      // Disable zoom interactions
      const globeElement = globeRef.current as any;
      if (globeElement && globeElement.controls) {
        globeElement.controls.enableZoom = false;
      }
    }
  }, []);

  return (
    <div className="relative w-full h-full pointer-events-none flex items-center justify-center">
      <Globe
        ref={globeRef}
        // High-resolution realistic Earth texture
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
        // Realistic bump map for terrain
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        
        // Atmosphere effect - reduced for transparency
        atmosphereColor="rgba(100, 150, 255, 0.2)"
        atmosphereAltitude={0.15}
        
        // Land borders - more subtle and realistic
        polygonsData={landPolygons}
        polygonCapColor={() => "rgba(40, 40, 40, 0.05)"}
        polygonSideColor={() => "rgba(0, 0, 0, 0)"}
        polygonStrokeColor={() => "rgba(50, 100, 150, 0.2)"}
        polygonAltitude={0.001}

        // Argo floats - more subtle points
        pointsData={[...argoDevices, satellite]}
        pointLat={(d: any) => d.lat}
        pointLng={(d: any) => d.lng}
        pointAltitude={(d: any) => d.altitude}
        pointColor={(d: any) => d === satellite ? "#ff4444" : "#00a8ff"}
        pointRadius={(d: any) => d === satellite ? 0.2 : 0.08}
        pointResolution={24}
        arcsData={arcsData}
        arcColor="color" 
        arcAltitudeAutoScale={0.3} 
        arcStroke={0.5} 
        arcDashGap={2} 
        arcDashAnimateTime="time" 
        arcStroke={0.5}
        arcDashGap={2} 
        arcDashAnimateTime="time" 

        // Center the globe properly
        width={800}
        height={800}
        globeOffset={[0, 30]} // Centered position

        backgroundColor="rgba(0, 0, 0, 0)"
        enablePointerInteraction={false} // Disable all interactions

        // Lighting for more realistic appearance
        onGlobeReady={() => {
          if (globeRef.current) {
            const globe = globeRef.current;
            globe.scene().children.forEach(obj => {
              if (obj.type === 'Scene') {
                // Add ambient light for soft overall illumination
                const ambientLight = new THREE.AmbientLight(0x333333, 0.4);
                obj.add(ambientLight);

                // Add directional light for sun-like illumination
                const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
                directionalLight.position.set(100, 10, 50);
                obj.add(directionalLight);
              }
            });
          }
        }}

        // Disable zoom completely
        minZoom={1.8}
        maxZoom={1.8}
      />
    </div>
  );
};

export default GlobeVisualization;