"use client";

import { useState } from "react";
import { auth } from "@/firebase/config";
import AuthMiddleware from "../../../../utils/middleware";

export default function TextMode() {
  const user = auth.currentUser;

  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [rag, setRag] = useState(false);
  const [website, setWebsite] = useState(false);

  const [label, setLabel] = useState("");
  const [score, setScore] = useState(0);
  const [ragResponse, setRagResponse] = useState(null);

  const handleRequest = async () => {
    setLoading(true);
    const idToken = await user?.getIdToken();

    if (website) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/mode/website`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            url: text,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setScore(data.score);

        if (data.label === "LABEL_1") {
          setLabel("Fax");
        }
        if (label === "LABEL_0") {
          setLabel("Cap");
        }

        if (response.ok) {
          setLoading(false);
        } else {
          console.log("Error:", data.error);
          setLoading(false);
        }
      }

      console.log("Response:", data);
    } else if (rag) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/mode/deep_dive`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            text: text,
          }),
        }
      );
      const data = await response.json();
      console.log("Response:", data);
      if (response.ok) {
        setRagResponse(data.response);
        setLoading(false);
      }
    } else {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/mode/text`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            text: text,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setScore(data.score);

        if (data.label === "LABEL_1") {
          setLabel("Fax");
        }
        if (label === "LABEL_0") {
          setLabel("Cap");
        }

        if (response.ok) {
          setLoading(false);
        } else {
          console.log("Error:", data.error);
          setLoading(false);
        }
      }

      console.log("Response:", data);
    }
  };
  return (
    <AuthMiddleware>
      <div className="w-screen min-h-screen flex items-center justify-center font-sans">
        <div className="w-1/2 h-1/2 flex flex-col items-start justify-center gap-5">
          <h1 className="text-4xl font-semibold">
            What are we yapping today ?
          </h1>
          <textarea
            className="w-full h-40 bg-[#222] p-5 rounded-lg resize-none outline-none text-white"
            placeholder="Enter to check fax or cap ..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>
          <span className="flex items-center justify-start gap-5 w-full text-sm font-regular">
            <button
              className={`px-5 py-3 ${
                rag
                  ? "bg-blue-100 text-blue-500 hover:bg-blue-100"
                  : "bg-[#555]"
              } rounded-full cursor-pointer hover:bg-[#333] transitio-all`}
              onClick={() => {
                setRag(!rag);
                setWebsite(false);
              }}
            >
              Deep Dive
            </button>
            <button
              className={`px-5 py-3 ${
                website
                  ? "bg-blue-100 text-blue-500 hover:bg-blue-100"
                  : "bg-[#555]"
              } rounded-full cursor-pointer hover:bg-[#333] transition-all`}
              onClick={() => {
                setWebsite(!website);
                setRag(false);
              }}
            >
              Website
            </button>
          </span>
          <button
            className={`${
              text
                ? "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                : "bg-blue-400 hover:bg-blue-400 cursor-not-allowed"
            } text-white px-5 py-3 rounded-lg w-full transition-all flex items-center justify-center gap-2`}
            onClick={() => {
              if (!text) {
                alert("Please enter some text to check.");
                return;
              }
              handleRequest();
            }}
          >
            {loading ? "Analyzing..." : "Check"}
          </button>

          <div className="text-lg font-medium">
            {label && <p>That&apos;s total {label} bro</p>}
            {score > 0 && (
              <p>I&apos;m {(score * 100).toFixed(2)}% sure about this one</p>
            )}
            {ragResponse && (
              <div className="mt-5 bg-[#333] p-5 rounded-lg w-full">
                <h2 className="text-xl font-semibold">Deep Dive Results</h2>
                <p>{ragResponse}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthMiddleware>
  );
}
