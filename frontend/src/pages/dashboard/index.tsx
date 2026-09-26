import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { ImpactCounter } from "@/components/ImpactCounter";
import { analyticsService } from "@/services/api";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    total_meals_saved: 0,
    total_carbon_offset_kg: 0,
    total_transit_km: 0,
    today_food_posted: 0,
    today_food_received: 0,
    today_remaining_food: 0,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await analyticsService.getSummary();
        setMetrics(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Institutional ESG Impact & Analytics</h2>
        <ImpactCounter
          meals={metrics.total_meals_saved}
          carbonOffsetKg={metrics.total_carbon_offset_kg}
          transitKm={metrics.total_transit_km}
          donatedToday={metrics.today_food_posted}
          receivedToday={metrics.today_food_received}
          remainingFood={metrics.today_remaining_food}
        />
      </div>
    </div>
  );
}