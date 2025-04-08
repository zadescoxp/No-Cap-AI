"use client";

import { useState } from "react";
import { auth } from "@/firebase/config";
import AuthMiddleware from "../../../../utils/middleware";

export default function DocsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [label, setLabel] = useState("");
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = auth.currentUser;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = await user.getIdToken();
      const response = await fetch("http://localhost:5000/mode/file", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();
      setScore(data.score);

      if (data.label === "LABEL_1") {
        setLabel("Fax");
      }
      if (data.label === "LABEL_0") {
        setLabel("Cap");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthMiddleware>
      <div className="w-screen min-h-screen flex items-center justify-center font-sans">
        <div className="w-1/2 h-auto flex flex-col items-start justify-center gap-5 p-8 rounded-lg shadow-lg">
          <h1 className="text-4xl font-semibold">
            Let&apos;s scan some fishy docs
          </h1>
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <input
              type="file"
              accept=".txt,.pdf"
              onChange={handleFileChange}
              className="w-full bg-gray-200 p-3 rounded-lg text-sm text-gray-700 outline-none"
            />
            <button
              type="submit"
              disabled={!file || loading}
              className={`w-full px-5 py-3 ${
                file && !loading
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-blue-400 cursor-not-allowed"
              } text-white rounded-lg transition-all`}
            >
              {loading ? "Analyzing..." : "Analyze Document"}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 text-red-700 rounded-md w-full">
              {error}
            </div>
          )}

          <div className="text-lg font-medium">
            {label && <p>That&apos;s total {label} bro</p>}
            {score > 0 && (
              <p>I&apos;m {(score * 100).toFixed(2)}% sure about this one</p>
            )}
          </div>
        </div>
      </div>
    </AuthMiddleware>
  );
}
