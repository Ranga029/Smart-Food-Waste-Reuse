import React, { useState } from "react";
import { useRouter } from "next/router";
import { authService } from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"donor" | "shelter" | "volunteer">("donor");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        name: name || `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
        phone,
        role,
        latitude: 12.9716,
        longitude: 79.1585,
      };

      try {
        const loginRes = await authService.login({ phone, role });
        localStorage.setItem("user", JSON.stringify(loginRes.data));
        router.push(role === "volunteer" ? "/volunteer" : role === "shelter" ? "/receiver" : "/doners");
        return;
      } catch (loginErr: any) {
        if (loginErr.response?.status !== 404) {
          throw loginErr;
        }
      }

      const registerRes = await authService.register(payload);
      localStorage.setItem("user", JSON.stringify(registerRes.data));
      router.push(role === "volunteer" ? "/volunteer" : role === "shelter" ? "/receiver" : "/doners");
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Food Rescue Login</h1>
          <p className="text-sm text-slate-500 mt-1">Use your registered mobile number to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="donor">Donor</option>
              <option value="shelter">Receiver</option>
              <option value="volunteer">Volunteer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              placeholder="+91 98765 43210"
              required
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 text-red-700 text-sm p-2 border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-md transition"
          >
            {loading ? "Please wait..." : "Login / Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
