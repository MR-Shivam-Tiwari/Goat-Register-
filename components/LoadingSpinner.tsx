export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full ">
      <div className="relative w-16 h-16">
        {/* Outer Ring */}
        <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
        {/* Spinning Ring */}
        <div className="absolute inset-0 border-4 border-[#491907] border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-[#491907] font-bold text-xs uppercase tracking-widest animate-pulse">
        Loading Data...
      </p>
    </div>
  );
}