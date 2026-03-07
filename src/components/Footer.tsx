

export default function Footer() {
  return (
    <footer className="bg-migusto-tierra-oscuro border-t border-white/5 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center space-y-6">

          <div className="text-center space-y-2">
            <p className="text-xs uppercase tracking-widest text-migusto-crema/40 font-bold">
              Golden Tickets Mi Gusto Lovers · {new Date().getFullYear()}
            </p>
            <p className="text-[10px] text-migusto-crema/20">
              Promoción exclusiva · La calidad no se negocia
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
