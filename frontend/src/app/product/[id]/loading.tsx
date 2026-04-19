export default function ProductLoading() {
  return (
    <div className="min-h-screen px-8 py-12 lg:py-24 animate-fade-in">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16">
        <div className="w-full md:w-1/2">
          <div className="aspect-[4/5] skeleton-pulse" />
          <div className="flex gap-2 mt-3">
            <div className="w-20 h-24 skeleton-pulse" />
            <div className="w-20 h-24 skeleton-pulse" />
            <div className="w-20 h-24 skeleton-pulse" />
          </div>
        </div>
        <div className="w-full md:w-1/2 flex flex-col justify-center gap-4">
          <div className="w-24 h-3 skeleton" />
          <div className="w-3/4 h-12 skeleton" />
          <div className="w-1/3 h-6 skeleton mt-2" />
          <div className="w-full h-3 skeleton mt-6" />
          <div className="w-full h-3 skeleton" />
          <div className="w-2/3 h-3 skeleton" />
          <div className="w-full h-px bg-foreground/10 my-6" />
          <div className="w-1/2 h-3 skeleton" />
          <div className="w-2/3 h-3 skeleton" />
          <div className="w-full h-16 skeleton-pulse mt-8" />
        </div>
      </div>
    </div>
  );
}
