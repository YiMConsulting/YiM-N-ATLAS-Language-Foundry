"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type SystemHealth = {
  controlPlane: "online" | "offline";
  inferenceWorker: "online" | "standby";
  isLoading: boolean;
};

export function SystemStatus() {
  const [health, setHealth] = useState<SystemHealth>({
    controlPlane: "online",
    inferenceWorker: "standby",
    isLoading: true,
  });

  useEffect(() => {
    let mounted = true;
    async function checkHealth() {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

      try {
        const [healthRes, infRes] = await Promise.allSettled([
          axios.get(`${baseUrl}/health`, { timeout: 4000 }),
          axios.get(`${baseUrl}/inference/status`, { timeout: 4000 }),
        ]);

        if (!mounted) return;

        const cpStatus =
          healthRes.status === "fulfilled" && healthRes.value.status === 200
            ? "online"
            : "offline";

        let infStatus: "online" | "standby" = "standby";
        if (infRes.status === "fulfilled" && infRes.value.data) {
          infStatus = infRes.value.data.available && infRes.value.data.model_loaded
            ? "online"
            : "standby";
        }

        setHealth({
          controlPlane: cpStatus,
          inferenceWorker: infStatus,
          isLoading: false,
        });
      } catch {
        if (mounted) {
          setHealth({
            controlPlane: "offline",
            inferenceWorker: "standby",
            isLoading: false,
          });
        }
      }
    }

    checkHealth();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div
      className="flex items-center gap-2 text-xs text-foreground-secondary select-none"
      title={`Control Plane: ${health.controlPlane} · Inference: ${health.inferenceWorker}`}
    >
      <span className="flex items-center gap-1.5 font-medium">
        <span
          className={`h-2 w-2 rounded-full transition-colors ${
            health.controlPlane === "online" ? "bg-accent" : "bg-error"
          }`}
        />
        <span className="hidden sm:inline">
          {health.controlPlane === "online" ? "Foundry Active" : "API Offline"}
        </span>
      </span>
      {health.inferenceWorker === "standby" && (
        <span className="hidden lg:inline text-[11px] text-foreground-muted">
          (GPU Lazy)
        </span>
      )}
    </div>
  );
}
