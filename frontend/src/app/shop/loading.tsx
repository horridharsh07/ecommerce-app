export default function Loading() {
  return (
    <div className="min-h-screen px-8 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div>
            <div className="w-80 h-16 skeleton mb-4" />
            <div className="w-64 h-4 skeleton" />
          </div>
          <div className="flex flex-col items-end gap-3 w-full md:w-1/3">
            <div className="flex gap-4 w-full justify-end">
              <div className="w-12 h-5 skeleton" />
              <div className="w-16 h-5 skeleton" />
              <div className="w-16 h-5 skeleton" />
              <div className="w-16 h-5 skeleton" />
              <div className="w-16 h-5 skeleton" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 justify-items-center">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`flex flex-col gap-4 w-full items-center animate-fade-in stagger-${Math.min(i + 1, 8)}`}>
              <div className="w-full aspect-[4/5] skeleton-pulse" />
              <div className="w-3/4 h-3 skeleton" />
              <div className="w-1/3 h-3 skeleton" />
              <div className="w-2/3 h-3 skeleton" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
