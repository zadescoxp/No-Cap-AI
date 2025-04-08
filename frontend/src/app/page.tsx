import { redirect } from "next/navigation";
import { auth } from "@/firebase/config";

export default async function Home() {
  const user = auth.currentUser;
  const userId = user?.uid;
  if (userId) {
    redirect("/mode");
  } else {
    redirect("/login");
  }
}
