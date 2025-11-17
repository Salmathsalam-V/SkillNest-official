export default function ServerError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-5xl font-bold mb-4">500 - Server Error</h1>
      <p className="mb-6">Our server encountered an issue. Try again later.</p>
      <a href="/" className="px-6 py-2 bg-blue-600 text-white rounded-lg">
        Home
      </a>
    </div>
  );
}
