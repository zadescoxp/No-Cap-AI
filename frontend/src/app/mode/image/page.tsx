"use client";
import { useState, useRef } from "react";
import { auth } from "@/firebase/config";
import Image from "next/image";

export default function ImagePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ human: number; machine: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = auth.currentUser;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setError(null);
      setResult(null);
      
      // Create preview URL
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
      const video = document.createElement('video');
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
              setSelectedFile(file);
              setPreviewUrl(URL.createObjectURL(blob));
            }
          }, 'image/jpeg');
        }
        stream.getTracks().forEach(track => track.stop());
      };
    } catch (error) {
      console.error('Error accessing camera:', error);
      setError('Failed to access camera. Please check permissions.');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile || !user) return;
    
    setIsLoading(true);
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Convert image to base64
      const reader = new FileReader();
      const base64String = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(selectedFile);
      });

      const idToken = await user.getIdToken();
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/mode/image_mode`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: base64String,
            filename: selectedFile.name
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
      
      // Reset progress after a second
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);

    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setIsUploading(false);
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-8">Image Analysis</h1>
      
      {isUploading && (
        <div className="fixed top-0 left-0 w-full z-50">
          <div className="h-2 bg-gray-200">
            <div 
              className="h-full bg-green-500 transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <div className="text-center text-sm text-gray-600 py-1">
            {uploadProgress < 100 ? 'Uploading and analyzing image...' : 'Analysis complete!'}
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <div className="flex flex-col items-center">
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Upload Image
            </button>
            <button
              type="button"
              onClick={handleCameraClick}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
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
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Analyzing..." : "Analyze Image"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-4">Analysis Results</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Human Score:</span> {result.human}</p>
            <p><span className="font-medium">Machine Score:</span> {result.machine}</p>
          </div>
        </div>
      )}
    </div>
  );
}
