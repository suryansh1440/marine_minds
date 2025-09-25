import {createBrowserRouter} from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import Admin from "../pages/Admin";
import Chat from "../pages/Chat";
import Map from "@/pages/Map";





const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "admin", element: <Admin /> },
      {path: "chat", element: <Chat />},
      {path: "map", element: <Map />}
    ]
  }
])

export default router;
