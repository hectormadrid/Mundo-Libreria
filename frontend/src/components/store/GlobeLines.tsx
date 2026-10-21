/** Líneas de un globo terráqueo, como el del logo. */
export function GlobeLines({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.2" className={className} aria-hidden="true">
      <circle cx="100" cy="100" r="98" />
      {[30, 60, 85].map((rx) => (
        <ellipse key={rx} cx="100" cy="100" rx={rx} ry="98" />
      ))}
      <line x1="100" y1="2" x2="100" y2="198" />
      {[-70, -38, 0, 38, 70].map((y) => {
        const half = Math.sqrt(98 ** 2 - y ** 2);
        return <line key={y} x1={100 - half} y1={100 + y} x2={100 + half} y2={100 + y} />;
      })}
    </svg>
  );
}
