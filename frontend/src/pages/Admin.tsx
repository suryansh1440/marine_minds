import { DarkVeilBackground } from "@/components/ui/shadcn-io/dark-veil-background"
import { Upload, FileText, Database, Navigation, Waves, Thermometer, Clock, Trash2, MapPin, Droplets, Gauge } from "lucide-react"
import { useState } from "react"

const Admin = () => {
  const [recentFiles, setRecentFiles] = useState([
    { id: 1, name: "argo-profile-1234.nc", type: "profile", size: "2.4 MB", date: "2 hours ago" },
    { id: 2, name: "temperature-data.nc", type: "temperature", size: "1.8 MB", date: "5 hours ago" },
    { id: 3, name: "salinity-measurements.nc", type: "salinity", size: "4.2 MB", date: "Yesterday" },
    { id: 4, name: "pressure-readings.nc", type: "pressure", size: "3.1 MB", date: "2 days ago" },
    { id: 5, name: "ocean-currents.nc", type: "currents", size: "15.7 MB", date: "3 days ago" },
  ])
  
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{message: string, success: boolean} | null>(null)

  const getFileIcon = (type: string) => {
    switch (type) {
      case "profile": return <Waves className="h-5 w-5 text-blue-400" />
      case "temperature": return <Thermometer className="h-5 w-5 text-red-400" />
      case "salinity": return <Droplets className="h-5 w-5 text-cyan-400" />
      case "pressure": return <Gauge className="h-5 w-5 text-purple-400" />
      case "currents": return <Navigation className="h-5 w-5 text-green-400" />
      case "location": return <MapPin className="h-5 w-5 text-yellow-400" />
      default: return <Database className="h-5 w-5 text-gray-400" />
    }
  }

  const uploadFileToBackend = async (file: File) => {
    setIsUploading(true)
    setUploadStatus(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('http://localhost:9000/upload-netcdf/', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`)
      }
      
      const result = await response.json()
      setUploadStatus({ message: result.message || 'ARGO file uploaded successfully!', success: true })
      
      // Add to recent files
      const newFile = {
        id: recentFiles.length + 1,
        name: file.name,
        type: "profile", // Default type for new uploads
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        date: "Just now"
      }
      setRecentFiles([newFile, ...recentFiles])
      
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus({ 
        message: error instanceof Error ? error.message : 'Failed to upload ARGO file', 
        success: false 
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      uploadFileToBackend(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      uploadFileToBackend(files[0])
    }
  }

  return (
    <div className="relative w-full min-h-screen bg-black  overflow-hidden">
      <DarkVeilBackground 
        hueShift={45}
        scanlineIntensity={0.1}
        scanlineFrequency={2.0}
        noiseIntensity={0.05}
        warpAmount={1.0}
        speed={2.0}
        className="absolute inset-0 z-0"
      />
      
      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-black/70 backdrop-blur-md border-r border-gray-800 p-6 overflow-y-auto">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Recent ARGO Files
          </h2>
          
          <div className="space-y-4">
            {recentFiles.map((file) => (
              <div key={file.id} className="flex items-center p-3 bg-gray-900/50 rounded-lg hover:bg-gray-800/60 transition-colors">
                <div className="mr-3">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{file.name}</p>
                  <div className="flex text-xs text-gray-400">
                    <span>{file.size}</span>
                    <span className="mx-2">•</span>
                    <span>{file.date}</span>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-red-400 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 flex flex-col items-center justify-center">
          <div 
            className="bg-white/10 backdrop-blur-md rounded-2xl p-10 border border-white/20 shadow-2xl"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-6">
                {isUploading ? (
                  <div className="h-8 w-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Upload className="h-8 w-8 text-black" />
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-2">Upload ARGO NetCDF Files</h1>
              <p className="text-gray-300 mb-8 max-w-md">
                Drag and drop ARGO NetCDF files here or click the button below to browse your device
              </p>
              
              {uploadStatus && (
                <div className={`mb-4 p-3 rounded-md ${uploadStatus.success ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                  {uploadStatus.message}
                </div>
              )}
              
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="inline-flex items-center px-6 py-3 bg-white text-black font-semibold rounded-lg shadow-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     aria-disabled={isUploading}>
                  <Upload className="mr-2 h-5 w-5" />
                  {isUploading ? 'Uploading ARGO Data...' : 'Select ARGO NetCDF File'}
                </div>
                <input 
                  id="file-upload" 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileUpload}
                  accept=".nc,.netcdf"
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <Waves className="h-8 w-8 text-blue-400 mb-2" />
              <span className="text-sm text-white">Ocean Profiles</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <Thermometer className="h-8 w-8 text-red-400 mb-2" />
              <span className="text-sm text-white">Temperature</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <Droplets className="h-8 w-8 text-cyan-400 mb-2" />
              <span className="text-sm text-white">Salinity</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <Gauge className="h-8 w-8 text-purple-400 mb-2" />
              <span className="text-sm text-white">Pressure</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <Navigation className="h-8 w-8 text-green-400 mb-2" />
              <span className="text-sm text-white">Currents</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <MapPin className="h-8 w-8 text-yellow-400 mb-2" />
              <span className="text-sm text-white">Positions</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <Database className="h-8 w-8 text-orange-400 mb-2" />
              <span className="text-sm text-white">Metadata</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <FileText className="h-8 w-8 text-indigo-400 mb-2" />
              <span className="text-sm text-white">Quality Control</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin