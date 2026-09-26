import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { OtpModal } from "@/components/OtpModal";
import { volunteerService } from "@/services/api";
import dynamic from "next/dynamic";

const DynamicMap = dynamic(
  () => import("@/components/LiveMap").then((mod) => mod.LiveMap),
  { ssr: false }
);

const pickupAliases = [
  "Sunrise Community Kitchen",
  "Greenfield Food Hub",
  "Hope Street Meal Center",
  "Neighborhood Kitchen",
];

export default function VolunteerPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [otpStep, setOtpStep] = useState<"pickup" | "drop" | null>(null);
  const [revealedOtp, setRevealedOtp] = useState<"pickup" | "drop" | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [routeStarted, setRouteStarted] = useState(false);
  const [routeFinished, setRouteFinished] = useState(false);
  const [volunteerLocation, setVolunteerLocation] = useState<[number, number] | null>(null);
  const [alert, setAlert] = useState("");
  const pickupAlias = activeTask
    ? pickupAliases[(Math.max(1, activeTask.delivery_id) - 1) % pickupAliases.length]
    : "Community Food Pickup";

  const loadTasks = async () => {
    try {
      const [tasksRes, activeTaskRes] = await Promise.all([
        volunteerService.getAvailableTasks(),
        volunteerService.getActiveTask(3),
      ]);
      setTasks(tasksRes.data);
      setActiveTask(activeTaskRes.data);
      const taskStatus = activeTaskRes.data?.status;
      setShowMap(taskStatus === "Picked Up" || taskStatus === "Delivered");
      setRouteStarted((started) => taskStatus === "Delivered" || (taskStatus === "Picked Up" && started));
      setRouteFinished(taskStatus === "Delivered");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleAccept = async (deliveryId: number) => {
    try {
      const res = await volunteerService.acceptTask({ volunteer_id: 3, delivery_id: deliveryId });
      const task = tasks.find((t) => t.delivery_id === deliveryId);
      setActiveTask({ ...task, pickup_otp: res.data.pickup_otp, drop_otp: res.data.drop_otp });
      setRevealedOtp(null);
      setShowMap(false);
      setRouteStarted(false);
      setRouteFinished(false);
      setTasks((currentTasks) => currentTasks.filter((t) => t.delivery_id !== deliveryId));
      setAlert("Task accepted. Pickup and drop OTPs are available on the active route.");
    } catch (err: any) {
      if (err.response?.status === 400) {
        setTasks((currentTasks) => currentTasks.filter((t) => t.delivery_id !== deliveryId));
        setAlert("This route is already active for a volunteer.");
        loadTasks();
      } else {
        setAlert("Failed: " + (err.response?.data?.detail || err.message));
      }
    }
  };

  const handleOtpVerify = async (otp: string) => {
    if (!activeTask || !otpStep) return;
    try {
      const res = await volunteerService.verifyOtp({
        delivery_id: activeTask.delivery_id,
        otp,
        step: otpStep,
      });

      if (otpStep === "pickup") {
        setShowMap(true);
        setRouteStarted(false);
        setRouteFinished(false);
        setAlert("Pickup verified. Review the route, then select Start Route when you are ready to ride.");
        setOtpStep(null);
      } else {
        setAlert(`Delivery complete! Earned ${res.data.points_earned} points and ${res.data.carbon_saved_kg} kg carbon saving.`);
        setRouteFinished(true);
        setRouteStarted(true);
        setShowMap(true);
        setActiveTask({ ...activeTask, status: "Delivered" });
        setOtpStep(null);
        setRevealedOtp(null);
        volunteerService.getAvailableTasks().then((tasksRes) => setTasks(tasksRes.data));
      }
    } catch (err: any) {
      setAlert("OTP validation error: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Volunteer Dispatch Portal</h2>
        {alert && <div className="mb-4 text-sm font-medium text-emerald-700 bg-emerald-50 p-3 rounded">{alert}</div>}

        {activeTask && (
          <div className="mb-8 p-6 bg-white border border-emerald-300 rounded-xl shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-slate-800">Active Delivery Route</h3>
            <div className="text-sm text-slate-600">
              <p>Pickup: {volunteerLocation ? "Your location" : `${pickupAlias} (${activeTask.pickup_phone || "No contact"})`}</p>
              <p>Receiver: {activeTask.drop_name} ({activeTask.drop_phone || "No contact"})</p>
              {!volunteerLocation && (
                <>
                  <p>Direct distance: {activeTask.distance_km} km</p>
                  <p>Approximate ETA: {Math.max(10, Math.ceil(activeTask.distance_km / 18 * 60))} minutes</p>
                </>
              )}
            </div>
            {showMap && (
              <div className="space-y-2">
                <DynamicMap
                  pickup={[activeTask.pickup_lat, activeTask.pickup_lon]}
                  drop={[activeTask.drop_lat, activeTask.drop_lon]}
                  pickupName={volunteerLocation ? "Your location" : pickupAlias}
                  dropName={activeTask.drop_name}
                  distanceKm={activeTask.distance_km}
                  routeStarted={routeStarted}
                  routeFinished={routeFinished}
                  onLocationFound={setVolunteerLocation}
                />
              </div>
            )}
            {showMap && !routeStarted && !routeFinished && (
              <button
                onClick={() => {
                  setRouteStarted(true);
                  setAlert("Route started. The motorbike is moving along the road route to the receiver.");
                }}
                className="rounded bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Start Route
              </button>
            )}
            {routeFinished && (
              <p className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
                Delivery complete. Pickup and drop-off locations remain marked on the map.
              </p>
            )}
            {!routeFinished && <div className="flex gap-4">
              <button
                onClick={() => setRevealedOtp(revealedOtp === "pickup" ? null : "pickup")}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded text-sm font-medium"
              >
                {revealedOtp === "pickup" ? "Hide Pickup OTP" : "Show Pickup OTP"}
              </button>
              <button
                onClick={() => setRevealedOtp(revealedOtp === "drop" ? null : "drop")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-sm font-medium"
              >
                {revealedOtp === "drop" ? "Hide Drop OTP" : "Show Drop OTP"}
              </button>
            </div>}
            {!routeFinished && revealedOtp && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  {revealedOtp === "pickup" ? "Pickup OTP" : "Drop OTP"}
                </p>
                <p className="font-mono text-2xl font-bold tracking-widest text-slate-800">
                  {revealedOtp === "pickup" ? activeTask.pickup_otp : activeTask.drop_otp}
                </p>
              </div>
            )}
            {!routeFinished && <div className="flex gap-4">
              {!showMap && <button
                onClick={() => {
                  setOtpStep("pickup");
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded text-sm font-medium"
              >
                Verify Pickup OTP
              </button>}
              {showMap && routeStarted && <button
                onClick={() => {
                  setOtpStep("drop");
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-sm font-medium"
              >
                Verify Delivery OTP
              </button>}
            </div>}
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-bold text-lg text-slate-800">Open Dispatch Tasks</h3>
          {tasks.map((task) => (
            <div key={task.delivery_id} className="p-4 bg-white border rounded-lg flex justify-between items-center shadow-sm">
              <div>
                <p className="font-semibold text-slate-800">{task.claimed_servings} Portions</p>
                <p className="text-xs text-slate-500">Route: {task.pickup_name} ➔ {task.drop_name} ({task.distance_km} km)</p>
                <p className="text-xs text-emerald-700 font-medium">ETA: {task.eta_minutes || 20} minutes</p>
              </div>
              <button
                onClick={() => handleAccept(task.delivery_id)}
                className="bg-emerald-600 text-white text-sm px-4 py-2 rounded hover:bg-emerald-700 transition"
              >
                Accept Route
              </button>
            </div>
          ))}
          {tasks.length === 0 && !activeTask && (
            <p className="text-sm text-slate-500">No active dispatch orders waiting for fulfillment.</p>
          )}
        </div>
      </div>

      <OtpModal
        isOpen={otpStep !== null}
        step={otpStep || "pickup"}
        onSubmit={handleOtpVerify}
        onClose={() => setOtpStep(null)}
      />
    </div>
  );
}