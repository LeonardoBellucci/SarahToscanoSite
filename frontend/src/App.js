import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Lenis from "lenis";
import { Toaster } from "sonner";
import { ContentProvider } from "./lib/content";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Musica from "./pages/Musica";
import Shop from "./pages/Shop";
import Traguardi from "./pages/Traguardi";
import Novita from "./pages/Novita";
import Tour from "./pages/Tour";
import Admin from "./pages/Admin";

function App() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    let raf;
    const loop = (t) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <BrowserRouter>
      <ContentProvider>
        <Toaster theme="dark" position="top-center" richColors />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/musica" element={<Musica />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/traguardi" element={<Traguardi />} />
            <Route path="/novita" element={<Novita />} />
            <Route path="/tour" element={<Tour />} />
          </Route>
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </ContentProvider>
    </BrowserRouter>
  );
}

export default App;
