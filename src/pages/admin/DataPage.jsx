import { useEffect, useMemo, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { getSalesCategoryShare, getSalesDaily, getSalesWeeklyByCategory } from '../../services/adminApi';

ChartJS.register(ArcElement, BarElement, CategoryScale, Legend, LinearScale, Tooltip);

const palette = ['#2563eb', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6'];

const DataPage = () => {
  const [daily, setDaily] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [share, setShare] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [dailyData, weeklyData, shareData] = await Promise.all([
        getSalesDaily(),
        getSalesWeeklyByCategory(),
        getSalesCategoryShare(),
      ]);
      setDaily(Array.isArray(dailyData) ? dailyData : dailyData?.items ?? dailyData?.data ?? []);
      setWeekly(Array.isArray(weeklyData) ? weeklyData : weeklyData?.items ?? weeklyData?.data ?? []);
      setShare(Array.isArray(shareData) ? shareData : shareData?.items ?? shareData?.data ?? []);
    };
    load();
  }, []);

  const dailyChart = useMemo(() => ({
    labels: daily.map((item) => item.label ?? item.date ?? item.day),
    datasets: [{
      label: 'Ventes',
      data: daily.map((item) => item.total ?? item.value ?? 0),
      backgroundColor: '#2563eb',
    }],
  }), [daily]);

  const weeklyCategories = useMemo(() => {
    const labels = weekly.map((item) => item.label ?? item.week ?? item.date);
    const allCategories = [...new Set(weekly.flatMap((item) => Object.keys(item.byCategory ?? item.categories ?? {})))];
    const datasets = allCategories.map((category, index) => ({
      label: category,
      data: weekly.map((item) => (item.byCategory ?? item.categories ?? {})[category] ?? 0),
      backgroundColor: palette[index % palette.length],
    }));
    return { labels, datasets };
  }, [weekly]);

  const pieData = useMemo(() => ({
    labels: share.map((item) => item.label ?? item.category ?? item.name),
    datasets: [{
      data: share.map((item) => item.total ?? item.value ?? item.count ?? 0),
      backgroundColor: share.map((_, index) => palette[index % palette.length]),
    }],
  }), [share]);

  return (
    <div className="data-page">
      <div className="admin-header">
        <div>
          <h1>Data</h1>
          <p>Statistiques basées sur les commandes payées.</p>
        </div>
      </div>

      <section className="chart-card">
        <h2>Ventes par jour</h2>
        <Bar data={dailyChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </section>

      <section className="chart-card">
        <h2>Ventes par semaine et par catégorie</h2>
        <Bar data={weeklyCategories} options={{ responsive: true, plugins: { legend: { position: 'bottom' } }, scales: { x: { stacked: true }, y: { stacked: true } } }} />
      </section>

      <section className="chart-card">
        <h2>Répartition des ventes par catégorie</h2>
        <Doughnut data={pieData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
      </section>

      <style>{`
        .data-page { display:flex; flex-direction:column; gap:1.25rem; }
        .chart-card { background:white; border-radius:16px; padding:1.5rem; box-shadow:0 10px 30px rgba(15,23,42,0.08); }
      `}</style>
    </div>
  );
};

export default DataPage;
