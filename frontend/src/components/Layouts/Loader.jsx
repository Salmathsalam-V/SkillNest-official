// src/components/common/Loader.jsx
import { Loader2 } from "lucide-react";
export const Loader =({ text = "Loading...", fullScreen = true })=> {
  return (
    <div
      className={`flex flex-col items-center justify-center ${
        fullScreen ? "min-h-screen" : "py-10"
      }`}
    >
      <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      <p className="mt-3 text-gray-500">{text}</p>
    </div>
  );
}
