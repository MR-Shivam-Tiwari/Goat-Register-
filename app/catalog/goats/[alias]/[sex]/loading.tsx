import LoadingSpinner from "@/components/LoadingSpinner";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}
