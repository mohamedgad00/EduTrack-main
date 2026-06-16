"use client";

import { useEffect, useRef, useState } from "react";
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Filler,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import api from "@/utils/api";
import { useLanguage } from "@/components/i18n/LanguageProvider";

Chart.register(
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
);

interface AdminChartsData {
  performanceByCourse: Array<{ label: string; score: number }>;
  userGrowth: Array<{ label: string; users: number }>;
}

export default function Charts() {
  const { t } = useLanguage();
  const performanceRef = useRef<HTMLCanvasElement>(null);
  const growthRef = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<AdminChartsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadCharts = async () => {
      try {
        const response = await api.get<AdminChartsData>("admin/dashboard");
        if (isMounted) setData(response.data);
      } catch {
        if (isMounted) setError("failed.chart.data");
      }
    };

    loadCharts();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!performanceRef.current || !growthRef.current || !data) return;

    const perfChart = new Chart(performanceRef.current, {
      type: "bar",
      data: {
        labels: data.performanceByCourse.map((item) => item.label),
        datasets: [
          {
            label: "Avg Score",
            data: data.performanceByCourse.map((item) => item.score),
            backgroundColor: "#3b82f6",
            borderRadius: 4,
            barThickness: 20,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, max: 100, grid: { color: "#f1f5f9" } },
          x: { grid: { display: false } },
        },
      },
    });

    const growthChart = new Chart(growthRef.current, {
      type: "line",
      data: {
        labels: data.userGrowth.map((item) => item.label),
        datasets: [
          {
            label: "New Users",
            data: data.userGrowth.map((item) => item.users),
            borderColor: "#8b5cf6",
            backgroundColor: "rgba(139,92,246,0.1)",
            tension: 0.4,
            fill: true,
            pointRadius: 3,
            pointBackgroundColor: "#fff",
            pointBorderColor: "#8b5cf6",
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: "#f1f5f9" } },
          x: { grid: { display: false } },
        },
      },
    });

    return () => {
      perfChart.destroy();
      growthChart.destroy();
    };
  }, [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-900 text-[15px]">{t("Student Performance Overview")}</h3>
          <span className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-500">{t("Courses")}</span>
        </div>
        {error ? <p className="mb-3 text-sm text-red-600">{t(error)}</p> : null}
        <div className="h-64 w-full">
          <canvas ref={performanceRef} />
          {!data && !error ? <p className="pt-24 text-center text-sm text-gray-500">{t("loading")}</p> : null}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-900 text-[15px]">{t("User Growth Over Time")}</h3>
          <span className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-500">{t("Last 6 months")}</span>
        </div>
        {error ? <p className="mb-3 text-sm text-red-600">{t(error)}</p> : null}
        <div className="h-64 w-full">
          <canvas ref={growthRef} />
          {!data && !error ? <p className="pt-24 text-center text-sm text-gray-500">{t("loading")}</p> : null}
        </div>
      </div>
    </div>
  );
}
