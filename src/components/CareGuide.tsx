import { ArrowRight, Droplets, Sun, Bug, Thermometer } from 'lucide-react';

const commonProblems = [
  {
    id: 'yellow-leaves',
    icon: <Droplets className="w-6 h-6 text-amber-500" />,
    title: 'Yellowing Leaves',
    description: 'Often caused by overwatering or poor drainage. The roots are suffocating and cannot absorb nutrients.',
    solution: 'Allow the top 2 inches of soil to dry out completely before watering again. Ensure your pot has drainage holes.',
    productHint: 'Try our Moisture Meter to never overwater again.',
  },
  {
    id: 'brown-tips',
    icon: <Sun className="w-6 h-6 text-orange-500" />,
    title: 'Crispy Brown Tips',
    description: 'Usually a sign of low humidity, underwatering, or too much direct sunlight scorching the leaves.',
    solution: 'Increase ambient humidity with a pebble tray or humidifier. Move away from harsh direct afternoon sun.',
    productHint: 'Our Premium Plant Mist provides the perfect humidity boost.',
  },
  {
    id: 'pests',
    icon: <Bug className="w-6 h-6 text-red-500" />,
    title: 'Tiny Webs or Bugs',
    description: 'Spider mites, fungus gnats, or mealybugs have invaded your plant.',
    solution: 'Isolate the plant immediately. Wipe leaves with a damp cloth and apply a gentle insecticidal soap.',
    productHint: 'Get our Organic Neem Oil Spray for safe pest control.',
  },
  {
    id: 'drooping',
    icon: <Thermometer className="w-6 h-6 text-blue-500" />,
    title: 'Drooping or Wilting',
    description: 'Can be either severe underwatering or temperature shock (too cold or drafty).',
    solution: 'Check the soil. If bone dry, give it a thorough soak. If wet, check for cold drafts from windows or AC units.',
    productHint: 'Our Smart Soil Sensors alert you before wilting happens.',
  }
];

export default function CareGuide() {
  return (
    <div className="w-full max-w-4xl mx-auto text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-12 text-center">
        <h1 className="text-forest-deep tracking-tight text-4xl md:text-5xl font-light leading-tight mb-4">
          Plant Care <span className="font-semibold italic">Troubleshooting</span>
        </h1>
        <p className="text-stone-muted text-sm md:text-base font-medium uppercase tracking-[0.15em] max-w-xl mx-auto">
          Common problems, simple solutions, and the right tools for the job.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {commonProblems.map((problem) => (
          <div key={problem.id} className="bg-white/60 backdrop-blur-sm border border-forest-deep/10 rounded-3xl p-6 md:p-8 hover:shadow-xl hover:border-forest-deep/20 transition-all group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#f5f5f0] flex items-center justify-center border border-forest-deep/5 group-hover:scale-110 transition-transform">
                {problem.icon}
              </div>
              <h3 className="text-xl font-semibold text-forest-deep">{problem.title}</h3>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-forest-deep/60 mb-1">The Problem</h4>
                <p className="text-forest-deep/80 text-sm leading-relaxed">{problem.description}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-forest-deep/60 mb-1">The Fix</h4>
                <p className="text-forest-deep/80 text-sm leading-relaxed">{problem.solution}</p>
              </div>
              <div className="pt-4 mt-4 border-t border-forest-deep/10">
                <a href="#" className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors group/link">
                  {problem.productHint}
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-forest-deep text-[#f5f5f0] rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-light mb-4">Ready to upgrade your plant care?</h2>
          <p className="text-[#f5f5f0]/80 max-w-xl mx-auto mb-8">
            Explore our full range of professional-grade tools, organic fertilizers, and smart sensors designed to keep your urban jungle thriving.
          </p>
          <button className="bg-[#f5f5f0] text-forest-deep px-8 py-4 rounded-full font-medium uppercase tracking-wider text-sm hover:bg-white hover:scale-105 transition-all shadow-lg">
            Shop All Products
          </button>
        </div>
      </div>
    </div>
  );
}
