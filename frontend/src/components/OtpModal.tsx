import React, { useState } from "react";

interface OtpModalProps {
  isOpen: boolean;
  step: "pickup" | "drop";
  onSubmit: (otp: string) => void;
  onClose: () => void;
}

export const OtpModal: React.FC<OtpModalProps> = ({ isOpen, step, onSubmit, onClose }) => {
  const [code, setCode] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 4) {
      onSubmit(code);
      setCode("");
    }
  };

  return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h3 className="text-lg font-bold text-slate-800 capitalize mb-2">Verify {step} Token</h3>
        <p className="text-xs text-slate-500 mb-4">Enter the 4-digit code provided by the coordinator</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            maxLength={4}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full text-center tracking-widest text-2xl font-mono py-2 border rounded-md focus:ring-2 focus:ring-emerald-500"
            placeholder="0000"
            required
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2 text-sm bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 py-2 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 font-medium"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};