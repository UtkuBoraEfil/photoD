"use client";
import { useRouter } from "next/navigation";
export default function Dashboard() {
  const router = useRouter();
  async function handleClick() {
    await fetch("http://localhost:3030/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    router.push("/auth/login");
  }
  return (
    <div>
      <button onClick={handleClick}>Logout</button>
    </div>
  );
}
