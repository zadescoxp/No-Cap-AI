"use client";

import { loginWithGoogle } from "@/firebase/auth/signin";
import Image from "next/image";

export default function Login() {
  return (
    <div className="h-screen w-screen flex items-center justify-center font-sans gradient-bg">
      <div className="w-1/2 h-[70%] rounded-2xl flex items-center justify-center relative overflow-hidden">
        <div className="h-full w-1/2 flex items-center justify-center bg-white text-black flex-col">
          <h2 className="text-4xl font-semibold">Get Started</h2>
          <p className="text-sm font-medium mb-5">No Cap, Only Fax</p>

          <button
            onClick={loginWithGoogle}
            className="bg-black text-white rounded-lg px-7 py-3 flex items-center justify-center gap-4 cursor-pointer hover:bg-gray-800 transition-all"
          >
            <Image
              src={"/google-light.svg"}
              height={17}
              width={17}
              alt="Google"
            />
            Continue with Google
          </button>
        </div>
        <div className="h-full w-1/2 relative bg-[#222]">
          <Image src={"/login.png"} fill alt="" />
        </div>
      </div>
    </div>
  );
}
