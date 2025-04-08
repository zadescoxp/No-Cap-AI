"use client";
import { useState, useRef } from "react";
import { auth } from "@/firebase/config";
import Image from "next/image";
import AuthMiddleware from "../../../../utils/middleware";

export default function ImagePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    human: number;
    machine: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = auth.currentUser;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setError(null);
      setResult(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraClick = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], "camera-photo.jpg", {
                type: "image/jpeg",
              });
              setSelectedFile(file);
              setPreviewUrl(URL.createObjectURL(blob));
            }
          }, "image/jpeg");
        }
        stream.getTracks().forEach((track) => track.stop());
      };
    } catch (error) {
      console.error("Error accessing camera:", error);
      setError("Failed to access camera. Please check permissions.");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile || !user) return;

    setIsLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      const reader = new FileReader();
      const base64String = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(selectedFile);
      });

      const idToken = await user.getIdToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/mode/image_mode`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: base64String,
            filename: selectedFile.name,
          }),
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();
      setResult(data);

      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthMiddleware>
      <div className="w-screen min-h-screen flex items-center justify-center font-sans">
        <div className="w-1/2 h-auto flex flex-col items-start justify-center gap-5 p-8 rounded-lg shadow-lg">
          <h1 className="text-4xl font-semibold">
            Yo anything up with the images ?
          </h1>
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
              >
                Upload Image
              </button>
              <button
                type="button"
                onClick={handleCameraClick}
                className="px-5 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
              >
                Take Photo
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {previewUrl && (
              <div className="mt-4 w-full max-w-xs">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={300}
                  height={300}
                  className="rounded-lg shadow-md"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={!selectedFile || isLoading}
              className={`w-full px-5 py-3 ${
                selectedFile && !isLoading
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-blue-400 cursor-not-allowed"
              } text-white rounded-lg transition-all`}
            >
              {isLoading ? "Analyzing..." : "Analyze Image"}
            </button>
            {uploadProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md w-full">
              {error}
            </div>
          )}

          {result && (
            <div className="rounded-lg shadow-md w-full">
              <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
              <p>
                <span className="font-medium">Human Score:</span>{" "}
                {(result.human * 100).toFixed(2)}%
              </p>
              <p>
                <span className="font-medium">Machine Score:</span>{" "}
                {(result.machine * 100).toFixed(2)}%
              </p>
              <p>
                {result.human > result.machine
                  ? "This image is more likely to be human-generated."
                  : "This image is more likely to be machine-generated."}
              </p>
            </div>
          )}
        </div>
      </div>
    </AuthMiddleware>
  );
}
