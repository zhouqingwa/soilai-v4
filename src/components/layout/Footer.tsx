export const Footer = () => {
  return (
    <footer className="py-12 pb-40 md:pb-12 px-6 flex flex-col md:flex-row items-center justify-between text-forest-deep/50 text-[11px] tracking-wider border-t border-forest-deep/5 mx-6 relative z-10">
      <div className="flex flex-col items-center md:items-start gap-1.5 text-center md:text-left">
        <div className="font-medium text-forest-deep/60 uppercase tracking-widest">© {new Date().getFullYear()} SOIL AI STUDIO. ALL RIGHTS RESERVED.</div>
        <div className="text-[10px] sm:text-xs tracking-normal normal-case text-forest-deep/45 italic mt-1 font-serif">
          "No plants were harmed in the making of this AI. We can't say the same for yours."
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-6 md:gap-8 mt-6 md:mt-0 text-[10px] sm:text-[11px] uppercase tracking-widest">
        <span className="hover:text-forest-deep transition-colors cursor-not-allowed font-medium" title="Coming soon">Privacy</span>
        <span className="hover:text-forest-deep transition-colors cursor-not-allowed font-medium" title="Coming soon">Terms</span>
        <span className="hover:text-forest-deep transition-colors cursor-not-allowed font-medium" title="Coming soon">Instagram</span>
      </div>
    </footer>
  );
};
