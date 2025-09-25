import { createSlice, nanoid } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

type Graph = {
  type: string
  title: string
  description: string
  data: Array<Record<string, any>>
  xKey: string
  yKey: string | string[]
  colors?: string[]
}

type MapLabel = { lat: number; lng: number; text: string; color: string; size: number; altitude: number }
type MapHexbin = { lat: number; lng: number; weight: number }
type MapHeatmap = { lat: number; lng: number; weight: number }
type MapItem =
  | ({ type: 'labels'; title: string; description: string; data: MapLabel[] })
  | ({ type: 'hexbin'; title: string; description: string; data: MapHexbin[] })
  | ({ type: 'heatmap'; title: string; description: string; data: MapHeatmap[] })

type Report = { title: string; content: string }

type ChatAI = {
  id: string
  role: 'ai'
  report: Report | null
  graphs: Graph[]
  maps: MapItem[]
  thought: string | null
}

type ChatUser = {
  id: string
  role: 'user'
  message: string
  timestamp: string
}

type ChatItem = ChatAI | ChatUser

type ThoughtItem = { id: string; message: string; timestamp: string }

type ChatState = {
  chats: ChatItem[]
  thoughts: ThoughtItem[]
  queryType: string
  isConnected: boolean
  selectedMapData: any
  isResult: boolean
  isChatMapOpen: boolean
}

const initialState: ChatState = {
    // chats: [{
    //     id: nanoid(),
    //     role: 'user',
    //     message: 'Hello, how are you today?',
    //     timestamp: new Date().toISOString()
    // },
    // {
    //     id: nanoid(),
    //     role: 'ai',
    //     report: {
    //         title: 'Ocean Temperature Analysis',
    //         content: 'Based on the analysis of ocean temperature data from multiple stations, I found significant temperature variations across different regions. The Atlantic Ocean shows higher temperatures compared to the Pacific, with peak temperatures reaching 25.3°C in the Caribbean region.'
    //     },
    //     graphs: [{
    //         type: 'line',
    //         title: 'Temperature Trends by Station',
    //         description: 'Temperature variations across different ocean stations over time',
    //         data: [
    //             { station: 'Station A', temperature: 22.1 },
    //             { station: 'Station B', temperature: 24.5 },
    //             { station: 'Station C', temperature: 23.8 },
    //             { station: 'Station D', temperature: 25.3 },
    //             { station: 'Station E', temperature: 21.9 }
    //         ],
    //         xKey: 'station',
    //         yKey: 'temperature',
    //         colors: ['#3b82f6']
    //     }],
    //     maps: [{
    //         title: 'Ocean Temperature Heatmap',
    //         description: 'Temperature distribution across ocean regions',
    //         type: 'heatmap',
    //         data: [
    //             { lat: 25.7617, lng: -80.1918, weight: 0.8 }, // Miami - High temp
    //             { lat: 40.7128, lng: -74.0060, weight: 0.6 }, // New York - Medium temp
    //             { lat: 34.0522, lng: -118.2437, weight: 0.7 }, // Los Angeles - Medium-high temp
    //             { lat: 51.5074, lng: -0.1278, weight: 0.4 }, // London - Low temp
    //             { lat: 35.6762, lng: 139.6503, weight: 0.5 }, // Tokyo - Medium-low temp
    //             { lat: -33.8688, lng: 151.2093, weight: 0.6 }, // Sydney - Medium temp
    //             { lat: 19.4326, lng: -99.1332, weight: 0.9 }, // Mexico City - Very high temp
    //             { lat: -22.9068, lng: -43.1729, weight: 0.7 }  // Rio de Janeiro - Medium-high temp
    //         ]
    //     }],
    //     thought: 'Analyzed ocean temperature data from 8 different stations across various regions. Found that tropical regions show higher temperatures while temperate regions show lower values. The Caribbean and Gulf of Mexico regions exhibit the highest temperature readings.'
    // },
    // {
    //     id: nanoid(),
    //     role: 'user',
    //     message: 'Show me the correlation between depth and pressure in different ocean regions',
    //     timestamp: new Date().toISOString()
    // },
    // {
    //     id: nanoid(),
    //     role: 'ai',
    //     report: {
    //         title: 'Ocean Depth vs Pressure Correlation Analysis',
    //         content: 'Analysis of ocean depth and pressure measurements across various regions reveals a strong positive correlation. Deeper regions show significantly higher pressure readings, with the deepest measurements reaching pressures of 1,100+ decibars at depths exceeding 5,000 meters.'
    //     },
    //     graphs: [{
    //         type: 'scatter',
    //         title: 'Depth vs Pressure Correlation',
    //         description: 'Scatter plot showing the relationship between ocean depth and pressure measurements',
    //         data: [
    //             { depth: 100, pressure: 10.1 },
    //             { depth: 250, pressure: 25.2 },
    //             { depth: 500, pressure: 50.5 },
    //             { depth: 750, pressure: 75.8 },
    //             { depth: 1000, pressure: 101.3 },
    //             { depth: 1500, pressure: 152.1 },
    //             { depth: 2000, pressure: 203.2 },
    //             { depth: 3000, pressure: 305.8 },
    //             { depth: 4000, pressure: 408.7 },
    //             { depth: 5000, pressure: 512.1 },
    //             { depth: 6000, pressure: 615.9 },
    //             { depth: 7000, pressure: 720.3 }
    //         ],
    //         xKey: 'depth',
    //         yKey: 'pressure',
    //         colors: ['#ef4444']
    //     }],
    //     maps: [{
    //         title: 'Ocean Research Stations',
    //         description: 'Locations of ocean research stations with depth and pressure measurements',
    //         type: 'labels',
    //         data: [
    //             { lat: 25.7617, lng: -80.1918, text: 'Miami Station', color: '#3b82f6', size: 1.5, altitude: 0.01 },
    //             { lat: 40.7128, lng: -74.0060, text: 'New York Station', color: '#10b981', size: 1.5, altitude: 0.01 },
    //             { lat: 34.0522, lng: -118.2437, text: 'Los Angeles Station', color: '#f59e0b', size: 1.5, altitude: 0.01 },
    //             { lat: 51.5074, lng: -0.1278, text: 'London Station', color: '#8b5cf6', size: 1.5, altitude: 0.01 },
    //             { lat: 35.6762, lng: 139.6503, text: 'Tokyo Station', color: '#ef4444', size: 1.5, altitude: 0.01 },
    //             { lat: -33.8688, lng: 151.2093, text: 'Sydney Station', color: '#06b6d4', size: 1.5, altitude: 0.01 },
    //             { lat: 19.4326, lng: -99.1332, text: 'Mexico City Station', color: '#84cc16', size: 1.5, altitude: 0.01 },
    //             { lat: -22.9068, lng: -43.1729, text: 'Rio Station', color: '#f97316', size: 1.5, altitude: 0.01 },
    //             { lat: 55.7558, lng: 37.6176, text: 'Moscow Station', color: '#ec4899', size: 1.5, altitude: 0.01 },
    //             { lat: 48.8566, lng: 2.3522, text: 'Paris Station', color: '#6366f1', size: 1.5, altitude: 0.01 }
    //         ]
    //     }],
    //     thought: 'Analyzed depth and pressure measurements from 12 different ocean stations. Found a strong linear correlation (R² = 0.99) between depth and pressure, confirming the hydrostatic pressure principle. Deeper stations show higher pressure readings as expected.'
    // }],
    chats:[],
    thoughts: [],
    queryType: '',
    isConnected: false,
    selectedMapData: null,
    isResult:true,
  isChatMapOpen:false,

}

export const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        addMessage: (state, action: PayloadAction<Omit<ChatUser, 'id'>>) => {
            state.chats.push({ ...action.payload, id: nanoid() })
        },
        
        setConnectionStatus: (state, action: PayloadAction<boolean>) => {
            state.isConnected = action.payload
        },
        
        setQueryType: (state, action: PayloadAction<string>) => {
            state.queryType = action.payload
        },
        
        addThought: (state, action: PayloadAction<{ message: string }>) => {
            state.thoughts.push({
                id: nanoid(),
                message: action.payload.message,
                timestamp: new Date().toISOString()
            })
        },
        
        addResult: (state, action: PayloadAction<any>) => {
            console.log(action.payload)
            state.isResult = true
            state.chats.push({
                id: nanoid(),
                role: 'ai',
                report: action.payload.report || null,
                graphs: action.payload.graphs || [],
                maps: action.payload.maps || [],
                thought: action.payload.thought || null
            })
        },
        
        addError: (state, action: PayloadAction<string>) => {
            console.log(action.payload)
            state.isResult = true
            state.chats.push({
                id: nanoid(),
                role: 'ai',
                report: { title: 'Error', content: action.payload },
                graphs: [],
                maps: [],
                thought: null
            })
        },
        
        clearThoughts: (state) => {
            state.thoughts = []
            state.queryType = ''
        },
        
        setSelectedMapData: (state, action: PayloadAction<{ chatId: string }>) => {
            const { chatId } = action.payload
            const chat = state.chats.find(chat => chat.id === chatId) as ChatAI | undefined
            if (chat && 'maps' in chat && chat.maps && chat.maps.length > 0) {
                state.selectedMapData = {
                    chatId,
                    mapData: chat.maps[0] 
                }
            }
        },
        setIsChatMapOpen:(state,action: PayloadAction<boolean>)=>{
            state.isChatMapOpen = action.payload
        },
        setIsResult: (state, action: PayloadAction<boolean>) => {
            state.isResult = action.payload
        }
    }
})

export const { 
    addMessage, 
    setConnectionStatus, 
    setQueryType, 
    addThought, 
    addResult, 
    addError, 
    clearThoughts, 
    setSelectedMapData,
    setIsChatMapOpen,
    setIsResult
} = chatSlice.actions

export default chatSlice.reducer