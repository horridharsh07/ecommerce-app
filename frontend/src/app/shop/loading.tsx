export default function Loading() {
  return (
    <div className="min-h-screen px-8 py-12 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
           <div>
             <div className="w-80 h-16 bg-secondary/50 animate-pulse mb-4" />
             <div className="w-64 h-4 bg-secondary/50 animate-pulse" />
           </div>
           
           <div className="flex flex-col items-end gap-3 w-full md:w-1/3">
             <div className="flex gap-4 w-full justify-end">
               <div className="w-16 h-6 bg-secondary/50 animate-pulse" />
               <div className="w-16 h-6 bg-secondary/50 animate-pulse" />
               <div className="w-16 h-6 bg-secondary/50 animate-pulse" />
               <div className="w-16 h-6 bg-secondary/50 animate-pulse" />
             </div>
             <div className="w-32 h-4 bg-secondary/50 animate-pulse mt-2" />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 justify-items-center">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col gap-4 w-full items-center">
              <div className="w-full aspect-[4/5] bg-secondary/50 animate-pulse" />
              <div className="w-3/4 h-4 bg-secondary/50 animate-pulse" />
              <div className="w-1/2 h-4 bg-secondary/50 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
