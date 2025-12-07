"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
type FieldErrors = { [k: string]: string[] | undefined };

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    try {
      const res = await fetch("http://localhost:3030/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirmPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        // 400: show fieldErrors, 409: show message, others generic
        if (res.status === 400 && data?.fieldErrors) {
          setFieldErrors(data.fieldErrors);
        } else {
          setFormError(data?.message || "Something went wrong.");
        }
        return;
      }

      if (data.ok || data.signedUp) {
        router.push("/dashboard");
      } else {
        setFormError(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      return;
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-black">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Register
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              name="email"
              type="email"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
            {fieldErrors.email && (
              <p className="text-sm text-red-500 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
            {fieldErrors.password && (
              <>
                {fieldErrors.password.map((errMsg, idx) => (
                  <p key={idx} className="text-sm text-red-500 mt-1">
                    {errMsg}
                  </p>
                ))}
              </>
            )}
          </div>
          <div>
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
            {fieldErrors.confirmPassword && (
              <>
                {fieldErrors.confirmPassword.map((errMsg, idx) => (
                  <p key={idx} className="text-sm text-red-500 mt-1">
                    {errMsg}
                  </p>
                ))}
              </>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            Register
          </button>
        </form>
        {formError && (
          <p className="text-sm text-red-500 mt-4 text-center">{formError}</p>
        )}
      </div>
    </div>
  );
}
