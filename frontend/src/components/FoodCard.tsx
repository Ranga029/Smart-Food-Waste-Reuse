import React, { useEffect, useState } from "react";

interface FoodCardProps {
  id: number;
  foodName: string;
  servings: number;
  expiryTime: string;
  onClaim?: (id: number, requestedServings: number) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ id, foodName, servings, expiryTime, onClaim }) => {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [requestedServings, setRequestedServings] = useState(String(servings));
  const claimCount = Number(requestedServings);
  const validClaimCount = Number.isInteger(claimCount) && claimCount > 0 && claimCount <= servings;

  useEffect(() => {
    const updateCountdown = () => {
      // --- YOUR CODE GOES RIGHT HERE ---
      let dateStr = expiryTime;
      if (!dateStr.endsWith("Z") && !dateStr.includes("+")) {
        dateStr = dateStr.replace(" ", "T") + "Z";
      }
      const expiry = new Date(dateStr).getTime();
      const now = new Date().getTime();
      const diff = expiry - now;
      // ---------------------------------

      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}h ${minutes}m remaining`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 10000);
    return () => clearInterval(interval);
  }, [expiryTime]);

  return (
    <div className="border border-slate-200 rounded-lg p-5 bg-white shadow-sm hover:shadow transition">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-lg text-slate-800">{foodName}</h4>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          {servings} Plates Available
        </span>
      </div>
      <p className="text-xs text-amber-700 font-medium bg-amber-50 rounded px-2 py-1 inline-block mb-4">
        ⏱ {timeLeft}
      </p>
      {onClaim && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700" htmlFor={`claim-count-${id}`}>
            Plates to claim
          </label>
          <input
            id={`claim-count-${id}`}
            type="number"
            min={1}
            max={servings}
            step={1}
            value={requestedServings}
            onChange={(event) => setRequestedServings(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
          <button
            onClick={() => onClaim(id, claimCount)}
            disabled={!validClaimCount}
            className="w-full rounded-md bg-emerald-600 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Claim {validClaimCount ? claimCount : "Plates"}
          </button>
        </div>
      )}
    </div>
  );
};