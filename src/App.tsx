import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import CustomCursor from "./components/CustomCursor";
import PageLoader from "./components/PageLoader";
import Gallery from "./pages/Gallery";
import Home from "./pages/Home";
import Job from "./pages/Job";
import MobileHome from "./pages/MobileHome";
import MobileNest from "./pages/MobileNest";
import Nest from "./pages/Nest";
import { caseStudyBySlug } from "./site/caseStudies";
import { FrameZoom } from "./site/frameZoom";
import { useIsMobile } from "./site/useIsMobile";

// The brief pages are gone: old links go straight to the case study, or home
// if it isn't ready yet.
function BriefRedirect() {
  const { slug } = useParams();
  return <Navigate replace to={caseStudyBySlug(slug)?.caseStudyPath ?? "/"} />;
}

// Phones get the mobile home page.
function HomeRoute() {
  return useIsMobile() ? <MobileHome /> : <Home />;
}

// ...and the mobile nest case study.
function NestRoute() {
  return useIsMobile() ? <MobileNest /> : <Nest />;
}

export default function App() {
  return (
    <BrowserRouter>
      <CustomCursor />
      <FrameZoom />
      <Routes>
        <Route element={<HomeRoute />} path="/" />
        <Route element={<Gallery />} path="/gallery" />
        <Route element={<BriefRedirect />} path="/brief/:slug" />
        <Route element={<Job />} path="/work/:brand" />
        <Route element={<NestRoute />} path="/nest" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
      <PageLoader />
      <Analytics />
    </BrowserRouter>
  );
}
