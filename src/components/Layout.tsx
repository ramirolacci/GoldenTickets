import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import GoldenStars from './GoldenStars';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-migusto-tierra-oscuro flex flex-col relative overflow-hidden">
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-grain"></div>

      {/* Background Subtle Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-migusto-rojo/5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Animated Golden Stars */}
      <GoldenStars />

      <Navbar />
      <main className="flex-grow pt-24 relative z-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}
