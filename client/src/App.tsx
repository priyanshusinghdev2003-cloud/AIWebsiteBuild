import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Pricing from "./pages/Pricing";
import Projects from "./pages/Projects";
import View from "./pages/View";
import Community from "./pages/Community";
import Preview from "./pages/Preview";
import MyProject from "./pages/MyProject";
import Navbar from "./components/Navbar";
import { useLocation } from "react-router-dom";

function App() {
  const { pathname } = useLocation();
  const hideNavbar =
    (pathname.startsWith("/project/") && pathname != "/projects") ||
    pathname.startsWith("/view/") ||
    pathname.startsWith("/preview/");
  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/project/:projectId" element={<Projects />} />
        <Route path="/projects" element={<MyProject />} />
        <Route path="/view/:projectId" element={<View />} />
        <Route path="/community" element={<Community />} />
        <Route path="/preview/:projectId" element={<Preview />} />
        <Route path="/preview/:projectId/:versionId" element={<Preview />} />
      </Routes>
    </>
  );
}

export default App;
