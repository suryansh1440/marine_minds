import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import socketService from "./services/socketService";
import ChatMap from "./components/home/ChatMap";

const App = () => {
  useEffect(() => {
    socketService.connect();
    return () => {
      socketService.disconnect();
    };
  }, []);
  return (
    <div>
      <Outlet/>
      <ChatMap/>
    </div>
  );
};

export default App;
