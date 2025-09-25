import React, { useRef, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setIsChatMapOpen } from '@/slices/chatSlice'
import Globe from 'react-globe.gl';
import globeImage from '@/assets/earth-dark.jpg';
import {X} from 'lucide-react'
import * as THREE from 'three'

const ChatMap = () => {
  const isChatMapOpen = useSelector((state: any) => state.chat.isChatMapOpen)
  const selectedMapData = useSelector((state: any) => state.chat.selectedMapData)
  const dispatch = useDispatch()

  const [mapType, setMapType] = useState<'Label'|'HexBin'|'Heatmap'>('Label')
  const [mapData, setMapData] = useState<any>(null)

  const globeRef = useRef<any>(null)

  const printfnc = (e: any) => {
    console.log(e);
  }

  // Update map data and type when selectedMapData changes
  useEffect(() => {
    if (selectedMapData && selectedMapData.mapData) {
      const data = selectedMapData.mapData
      setMapData(data)
      
      // Set map type based on data
      if (data.type === 'labels') {
        setMapType('Label')
      } else if (data.type === 'hexbin') {
        setMapType('HexBin')
      } else if (data.type === 'heatmap') {
        setMapType('Heatmap')
      }
    }
  }, [selectedMapData])

  const globeReady = () => {
      if (globeRef.current) {
        globeRef.current.controls().autoRotate = true;  //rotating
        globeRef.current.controls().enableZoom = false;
  
        globeRef.current.pointOfView({
          lat: 22.680114270049245,
          lng: 72.9587054670363,
          altitude: 1.8,
        });
      }
    };
    
    if(!isChatMapOpen || !mapData){
      return null
    }

    // Get data based on map type from slice
    let labelsData: any[] = []
    let hexBinPointsData: any[] = []
    let heatmapsData: any[] = []

    if (mapData.type === 'labels') {
      labelsData = Array.isArray(mapData.data)
        ? mapData.data.map((pt: any) => ({ ...pt })) // deep-clone items so they're extensible
        : []
    } else if (mapData.type === 'hexbin') {
      hexBinPointsData = Array.isArray(mapData.data)
        ? mapData.data.map((pt: any) => ({ ...pt }))
        : []
    } else if (mapData.type === 'heatmap') {
      heatmapsData = Array.isArray(mapData.data)
        ? mapData.data.map((pt: any) => ({ ...pt }))
        : []
    }

    
  
  return (

    <div className="absolute z-100 transition-all duration-300 h-full w-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black overflow-hidden">
      {/* top bar  */}
      <div className="absolute z-20 h-[10vh] px-6 w-full top-0 left-0 bg-gray-800/30 flex flex-col justify-center text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{mapData.title || 'Interactive Globe View'}</h1>
            <h5 className="text-sm opacity-80">{mapData.description || 'Map Data Visualization'}</h5>
          </div>
          <div className="flex items-center gap-4">
            <X onClick={(e) => {
              e.stopPropagation()
              dispatch(setIsChatMapOpen(false))
            }} className="text-white w-8 h-8 cursor-pointer hover:bg-gray-600 rounded-full p-1"/>
          </div>
        </div>
      </div>

       {/* modals   */}
       {mapType=="Label" && labelsData.length > 0 && (
      <Globe
      globeImageUrl={globeImage}
      backgroundColor='#08070e'
      ref={globeRef}
      onGlobeReady={globeReady}
      globeOffset={[0,0]}
      animateIn={true}    //rotating entry
      showAtmosphere={true}
      onGlobeClick={printfnc}

        labelsData= {labelsData}
        labelText= "text"
        labelLat= "lat"
        labelLng= "lng"
        labelColor= "color"
        labelSize= "size"
        labelAltitude= "altitude"
        labelIncludeDot={true}
        labelDotRadius={2}
        labelDotOrientation= "bottom"
        labelResolution={10}

      // atmosphere particle
      customLayerData={[...Array(500).keys()].map(() => ({
        lat: (Math.random() - 1) * 360,
        lng: (Math.random() - 1) * 360,
        altitude: Math.random() * 2,
        size: Math.random() * 0.4,
        color: '#faadfd',
      }))}
      customThreeObject={(sliceData: any) => {
        const { size, color } = sliceData;
        return new THREE.Mesh(new THREE.SphereGeometry(size), new THREE.MeshBasicMaterial({ color }));
      }}
      customThreeObjectUpdate={(obj: any, sliceData: any) => {
        const { lat, lng, altitude } = sliceData;
        return Object.assign(obj.position, globeRef.current?.getCoords(lat, lng, altitude));
      }}

      />
    )}

    {mapType=="HexBin" && hexBinPointsData.length > 0 && (
      <Globe
      globeImageUrl={globeImage}
      backgroundColor='#08070e'
      ref={globeRef}
      onGlobeReady={globeReady}
      globeOffset={[0,0]}
      animateIn={true}    //rotating entry
      showAtmosphere={true}
      onGlobeClick={printfnc}
      
      // Hex Bin Layer
      hexBinPointsData={hexBinPointsData}
      hexBinPointLat="lat"
      hexBinPointLng="lng"
      hexBinPointWeight="weight"
      hexBinResolution={4}
      hexMargin={0.1}
      hexAltitude={({ sumWeight }) => sumWeight * 0.02}
      hexTopCurvatureResolution={6}
      hexTopColor={({ sumWeight }) => {
        if (sumWeight > 30) return '#ff4444'; // High density - Red
        if (sumWeight > 20) return '#ff8844'; // Medium-high - Orange
        if (sumWeight > 10) return '#ffaa44'; // Medium - Yellow-orange
        if (sumWeight > 5) return '#44ff44';  // Low-medium - Green
        return '#4444ff'; // Low - Blue
      }}
      hexSideColor={({ sumWeight }) => {
        if (sumWeight > 30) return '#cc2222'; // High density - Dark red
        if (sumWeight > 20) return '#cc6622'; // Medium-high - Dark orange
        if (sumWeight > 10) return '#cc8822'; // Medium - Dark yellow-orange
        if (sumWeight > 5) return '#22cc22';  // Low-medium - Dark green
        return '#2222cc'; // Low - Dark blue
      }}
      hexBinMerge={false}
      hexTransitionDuration={1200}
      hexLabel={({ points, sumWeight, center }) => 
        `<div style="padding: 8px; background: rgba(0,0,0,0.8); color: white; border-radius: 4px;">
          <strong>Hex Bin Data</strong><br/>
          Points: ${points ? points.length : 0}<br/>
          Total Weight: ${sumWeight || 0}<br/>
          Center: ${center && center.lat && center.lng ? `${center.lat.toFixed(2)}, ${center.lng.toFixed(2)}` : 'N/A'}
        </div>`
      }
      onHexClick={(hex, event, coords) => {
        console.log('Hex clicked:', hex, coords);
      }}

      // atmosphere particle
      customLayerData={[...Array(500).keys()].map(() => ({
        lat: (Math.random() - 1) * 360,
        lng: (Math.random() - 1) * 360,
        altitude: Math.random() * 2,
        size: Math.random() * 0.4,
        color: '#faadfd',
      }))}
      customThreeObject={(sliceData: any) => {
        const { size, color } = sliceData;
        return new THREE.Mesh(new THREE.SphereGeometry(size), new THREE.MeshBasicMaterial({ color }));
      }}
      customThreeObjectUpdate={(obj: any, sliceData: any) => {
        const { lat, lng, altitude } = sliceData;
        return Object.assign(obj.position, globeRef.current?.getCoords(lat, lng, altitude));
      }}

      />

    )}

    {mapType=="Heatmap" && heatmapsData.length > 0 && (
      <Globe
      globeImageUrl={globeImage}
      backgroundColor='#08070e'
      ref={globeRef}
      onGlobeReady={globeReady}
      globeOffset={[0,0]}
      animateIn={true}    //rotating entry
      showAtmosphere={true}
      onGlobeClick={printfnc}      

      // Heatmap Layer
      heatmapsData={[heatmapsData]}
      heatmapPointLat="lat"
      heatmapPointLng="lng"
      heatmapPointWeight="weight"
      heatmapTopAltitude={0.2}
      heatmapsTransitionDuration={3000}
      enablePointerInteraction={false}



      // atmosphere particle
      customLayerData={[...Array(500).keys()].map(() => ({
        lat: (Math.random() - 1) * 360,
        lng: (Math.random() - 1) * 360,
        altitude: Math.random() * 2,
        size: Math.random() * 0.4,
        color: '#faadfd',
      }))}
      customThreeObject={(sliceData: any) => {
        const { size, color } = sliceData;
        return new THREE.Mesh(new THREE.SphereGeometry(size), new THREE.MeshBasicMaterial({ color }));
      }}
      customThreeObjectUpdate={(obj: any, sliceData: any) => {
        const { lat, lng, altitude } = sliceData;
        return Object.assign(obj.position, globeRef.current?.getCoords(lat, lng, altitude));
      }}

      />
    )}
        </div>



      
    
    
  )
}

export default ChatMap
