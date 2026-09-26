import React from "react";

interface ImpactCounterProps {
  meals: number;
  carbonOffsetKg: number;
  transitKm: number;
  donatedToday?: number;
  receivedToday?: number;
  remainingFood?: number;
}

export const ImpactCounter: React.FC<ImpactCounterProps> = ({
  meals,
  carbonOffsetKg,
  transitKm,
  donatedToday = 0,
  receivedToday = 0,
  remainingFood = 0,
}) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <span className="text-4xl mb-2">🍲</span>
          <h3 className="text-3xl font-extrabold text-emerald-600">{meals}</h3>
          <p className="text-sm font-medium text-slate-500 mt-1">Surplus Meals Rescued</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <span className="text-4xl mb-2">🌱</span>
          <h3 className="text-3xl font-extrabold text-teal-600">{carbonOffsetKg} kg</h3>
          <p className="text-sm font-medium text-slate-500 mt-1">CO2 Emissions Abated</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <span className="text-4xl mb-2">🏍️</span>
          <h3 className="text-3xl font-extrabold text-cyan-600">{transitKm} km</h3>
          <p className="text-sm font-medium text-slate-500 mt-1">Eco-Friendly Distance Run</p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Daily Food Flow</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-emerald-50 rounded-xl shadow-sm border border-emerald-100 flex flex-col items-center justify-center">
            <span className="text-4xl mb-2">📦</span>
            <h3 className="text-3xl font-extrabold text-emerald-700">{donatedToday}</h3>
            <p className="text-sm font-medium text-slate-600 mt-1">Donor Food Uploaded Today</p>
          </div>
          <div className="p-6 bg-sky-50 rounded-xl shadow-sm border border-sky-100 flex flex-col items-center justify-center">
            <span className="text-4xl mb-2">🥡</span>
            <h3 className="text-3xl font-extrabold text-sky-700">{receivedToday}</h3>
            <p className="text-sm font-medium text-slate-600 mt-1">Food Taken by Receivers</p>
          </div>
          <div className="p-6 bg-amber-50 rounded-xl shadow-sm border border-amber-100 flex flex-col items-center justify-center">
            <span className="text-4xl mb-2">📉</span>
            <h3 className="text-3xl font-extrabold text-amber-700">{remainingFood}</h3>
            <p className="text-sm font-medium text-slate-600 mt-1">Remaining Food Left</p>
          </div>
        </div>
      </div>
    </div>
  );
};