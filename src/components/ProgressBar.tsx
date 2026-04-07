export function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <div
        className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
