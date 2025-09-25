import ChatInterface from '@/components/home/ChatInterface'
import LightRays from '@/components/ui/LightRays'

const Chat = () => {
  return (
    <div className="home-container relative w-full h-screen overflow-hidden">
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
        <div className="relative z-20 h-full">
          <ChatInterface/>
        </div>
      </div>
  )
}

export default Chat
