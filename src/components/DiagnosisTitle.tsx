type DiagnosisTitleProps = {
  species?: string | null;
  hasScan: boolean;
};

export const DiagnosisTitle = ({ species, hasScan }: DiagnosisTitleProps) => {
  if (!species) {
    return <>{hasScan ? 'System Notice' : 'Unknown Plant'}</>;
  }

  if (!species.includes('(')) {
    return <div className="mb-1">{species}</div>;
  }

  const [commonName, scientificName] = species.split('(');

  return (
    <>
      <div className="mb-2">{commonName.trim()}</div>
      <div className="text-2xl sm:text-3xl opacity-50 font-medium font-serif italic mt-1">
        ({scientificName}
      </div>
    </>
  );
};
