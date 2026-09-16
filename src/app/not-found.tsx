import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white text-black text-center font-sans">
      <div className="w-12 h-12 border border-black bg-black text-white flex items-center justify-center font-bold text-lg mb-4">
        404
      </div>
      <h1 className="text-xl font-bold uppercase tracking-tight mb-2">Page Not Found</h1>
      <p className="text-sm text-neutral-600 max-w-md mb-6">
        The requested surface could not be located in the All About Pawz operating system.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-black text-white border border-black text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
