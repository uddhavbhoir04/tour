// Shared loading / error / empty states so pages never fall back to mock data
export const LoadingGrid = ({ count = 3 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="h-96 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
    ))}
  </div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div className="max-w-md mx-auto text-center p-8 rounded-2xl bg-red-50 border border-red-100">
    <p className="text-sm font-semibold text-red-700">{message || "Something went wrong."}</p>
    {onRetry && (
      <button onClick={onRetry} className="mt-4 px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700">
        Try again
      </button>
    )}
  </div>
);

export const EmptyState = ({ message = "Nothing here yet.", children }) => (
  <div className="max-w-md mx-auto text-center p-8 rounded-2xl bg-slate-50 border border-slate-200">
    <p className="text-sm text-slate-600">{message}</p>
    {children}
  </div>
);
