import { Ghost } from 'lucide-react';

type RiskBadgeProps = {
  risk?: string | null;
};

const normalizeRisk = (risk?: string | null) => risk?.trim().toUpperCase() || '';

export const RiskBadge = ({ risk }: RiskBadgeProps) => {
  const normalizedRisk = normalizeRisk(risk);
  const isHealthy = normalizedRisk === 'HEALTHY' || normalizedRisk === 'LOW' || normalizedRisk === 'NONE';
  const isUnknown = !normalizedRisk || normalizedRisk === 'N/A';

  const textColor =
    normalizedRisk === 'DEAD'
      ? 'text-slate-500'
      : normalizedRisk === 'N/A'
        ? 'text-slate-400'
        : 'text-forest-deep/50';
  const valueColor =
    normalizedRisk === 'HIGH'
      ? 'text-red-600'
      : normalizedRisk === 'MODERATE'
        ? 'text-amber-600'
        : isHealthy
          ? 'text-emerald-500'
          : normalizedRisk === 'DEAD'
            ? 'text-slate-800'
            : normalizedRisk === 'N/A'
              ? 'text-slate-400'
              : 'text-emerald-600';

  return (
    <div className="flex flex-col items-center gap-2 z-10 shrink-0 sm:pr-4">
      <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 -rotate-6 transform origin-bottom p-2 opacity-95 drop-shadow-md mb-1 flex items-center justify-center">
        {isHealthy && (
          <img src="/frog.webp" alt="Health" className="max-w-full max-h-full object-contain" loading="lazy" decoding="async" />
        )}
        {normalizedRisk === 'MODERATE' && (
          <img src="/chick.webp" alt="Moderate" className="max-w-full max-h-full object-contain" loading="lazy" decoding="async" />
        )}
        {normalizedRisk === 'HIGH' && (
          <img src="/squirrel.webp" alt="Severe" className="max-w-full max-h-full object-contain" loading="lazy" decoding="async" />
        )}
        {normalizedRisk === 'DEAD' && (
          <img src="/fox.webp" alt="Dead" className="max-w-full max-h-full object-contain" loading="lazy" decoding="async" />
        )}
        {isUnknown && <Ghost className="w-16 h-16 sm:w-20 sm:h-20 text-slate-300 mx-auto" />}
      </div>

      <div className="flex flex-col items-center leading-tight">
        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-1 ${textColor}`}>Risk Level</span>
        <span className={`text-2xl sm:text-3xl font-black uppercase tracking-wider ${valueColor}`}>
          {risk || 'Unknown'}
        </span>
      </div>
    </div>
  );
};
