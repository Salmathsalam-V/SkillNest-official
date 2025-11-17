import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="mb-6 text-lg">Oops! The page you're looking for doesn't exist.</p>

      <Link to="/" className="px-6 py-2 bg-blue-600 text-white rounded-lg">
        Go Home
      </Link>
    </div>
  );
}
