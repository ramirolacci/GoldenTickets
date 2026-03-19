import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import Home from './pages/Home';
import Validator from './pages/Validator';
import Register from './pages/Register';
import Validation from './pages/Validation';
import Faq from './pages/Faq';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/validator" element={<Validator />} />
        <Route path="/register" element={<Register />} />
        <Route path="/validacion" element={<Validation />} />
        <Route path="/faq" element={<Faq />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter basename="/tickets">
      <Layout>
        <AnimatedRoutes />
      </Layout>
    </BrowserRouter>
  );
}

export default App;
