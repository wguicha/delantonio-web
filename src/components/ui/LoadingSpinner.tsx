export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div role="status" aria-label="Cargando">
      <div className={`${sizes[size]} border-2 border-rock-border border-t-rock-red rounded-full animate-spin`} />
    </div>
  );
}
