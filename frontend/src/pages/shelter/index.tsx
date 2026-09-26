import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { FoodCard } from "@/components/FoodCard";
import { donorService, shelterService } from "@/services/api";

export default function ShelterPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  const [claimError, setClaimError] = useState(false);

  const fetchListings = async () => {
    try {
      const res = await donorService.getActiveListings();
      setListings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleClaim = async (donationId: number, requestedServings: number) => {
    try {
      const res = await shelterService.claimFood(donationId, { shelter_id: 2, requested_servings: requestedServings });
      const claimData = res.data;
      setClaimError(false);
      setMsg(`Claimed ${requestedServings} plates. ${claimData.remaining_servings} plates remain available.`);
      fetchListings();
    } catch (err: any) {
      setClaimError(true);
      setMsg(err.response?.data?.detail || `Claim failed: ${err.message}`);
      fetchListings();
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Available Surplus Food Matches</h2>
        {msg && (
          <div className={`mb-4 rounded p-3 text-sm font-medium ${claimError ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
            {msg}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {listings.map((item) => (
            <FoodCard
              key={item.id}
              id={item.id}
              foodName={item.food_name}
              servings={item.servings}
              expiryTime={item.expiry_time}
              onClaim={handleClaim}
            />
          ))}
          {listings.length === 0 && (
            <p className="text-sm text-slate-500">No active surplus food broadcasts available.</p>
          )}
        </div>
      </div>
    </div>
  );
}