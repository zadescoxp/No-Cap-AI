import { redirect } from "next/navigation";
import { auth, googleProvider } from "../config";
import { signInWithPopup } from "firebase/auth";

const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const idToken = await user.getIdToken();

  if (idToken) {
    redirect("/mode");
  }

  console.log("User Info:", user);
  console.log("ID Token:", idToken);
  // etc.
};

export { loginWithGoogle };
