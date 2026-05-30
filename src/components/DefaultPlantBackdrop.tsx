export const DefaultPlantBackdrop = () => (
  <picture>
    <source srcSet="/my-monstera.webp" type="image/webp" />
    <img
      src="/my-monstera.png"
      alt="A close-up of a plant leaf for AI diagnosis"
      className="absolute inset-0 w-full h-full object-cover opacity-85 blur-[1.5px] transition-opacity duration-700"
      referrerPolicy="no-referrer"
      decoding="async"
      fetchPriority="high"
    />
  </picture>
);
