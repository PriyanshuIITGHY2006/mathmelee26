// app/admin/login/page.tsx
"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

// 1. The loading spinner extracted to prevent SWC parser confusion
function LoadingFallback() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
    </main>
  );
}

// 2. The main login logic
function LoginContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/admin/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return <LoadingFallback />;
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-sm font-medium tracking-tight text-slate-900">
            Competition<span className="text-slate-400 font-normal">2025</span>
          </span>
          <h1 className="text-xl font-medium text-slate-900 mt-6 mb-1">
            Admin access
          </h1>
          <p className="text-sm text-slate-500">
            Sign in with your authorised Google account.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-md text-center">
              {error === "AccessDenied"
                ? "Access Denied: You are not authorized to access the admin area."
                : "An error occurred during sign in. Please try again."}
            </div>
          )}

          <button
            onClick={() => signIn("google", { callbackUrl: "/admin/dashboard" })}
            className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="text-xs text-slate-400 text-center mt-4">
            Only authorised accounts can access this area.
          </p>
        </div>

        <p className="text-xs text-slate-400 text-center mt-6">
          <a href="/" className="hover:text-slate-700 transition-colors">
            Back to public site
          </a>
        </p>
      </div>
    </main>
  );
}

// 3. The exported page wrapped securely in Suspense
export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginContent />
    </Suspense>
  );
}

// 4. The SVG element (added standard xmlns attribute to ensure valid JSX)
function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}