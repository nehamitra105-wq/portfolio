import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import CustomCursor from "./components/CustomCursor";
import PageLoader from "./components/PageLoader";
import Brief from "./pages/Brief";
import Gallery from "./pages/Gallery";
import Home from "./pages/Home";
import Job from "./pages/Job";
import Nest from "./pages/Nest";
import { DiscFlightProvider } from "./site/discFlight";
import { FrameZoom } from "./site/frameZoom";

export default function App() {
  return (
    <BrowserRouter>
      <DiscFlightProvider>
        <CustomCursor />
        <FrameZoom />
        <Routes>
          <Route element={<Home />} path="/" />
          <Route element={<Gallery />} path="/gallery" />
          <Route element={<Brief />} path="/brief/:slug" />
          <Route element={<Job />} path="/work/:brand" />
          <Route element={<Nest />} path="/nest" />
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
        <PageLoader />
      </DiscFlightProvider>
    </BrowserRouter>
  );
}
