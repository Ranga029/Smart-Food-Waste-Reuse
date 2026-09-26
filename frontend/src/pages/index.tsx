import { Navbar } from "@/components/Navbar";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-6">
          Hyperlocal Food Rescue & Volunteer Redistribution
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
          Connecting institutional campus messes and banquet surplus with local shelters in real-time, bridging logistical gaps with student volunteer networks.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <Link href="/doners" className="p-6 bg-white border border-slate-200 rounded-xl hover:shadow-lg transition">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 mb-2">Dashboard 1</p>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Donor Portal</h3>
            <p className="text-sm text-slate-500">List prepared batch surplus, provide safe shelf-life windows, and upload dispatch proof.</p>
          </Link>
          <Link href="/receiver" className="p-6 bg-white border border-slate-200 rounded-xl hover:shadow-lg transition">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 mb-2">Dashboard 2</p>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Receiver Portal</h3>
            <p className="text-sm text-slate-500">Discover active surplus matches vetted by time-to-decay algorithms and claim required portions.</p>
          </Link>
          <Link href="/volunteer" className="p-6 bg-white border border-slate-200 rounded-xl hover:shadow-lg transition">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 mb-2">Dashboard 3</p>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Volunteer Portal</h3>
            <p className="text-sm text-slate-500">Accept open routes, execute OTP handoffs, and earn incentive points for university rewards.</p>
          </Link>
        </div>
      </main>
    </div>
  );
}