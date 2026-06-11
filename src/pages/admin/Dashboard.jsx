import { useState, useEffect } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import { Loader2, AlertCircle, TrendingUp, BarChart3, PieChart as PieIcon, RefreshCw } from 'lucide-react';
import {
  getDailySales,
  getWeeklySales,
  getWeeklySalesByCategory,
  getCategoryShare
} from '../../services/api';

const CHART_COLORS = ['#005c97', '#36d1dc', '#ffb703', '#10b981', '#8b5cf6', '#f97316', '#ef4444', '#2c3e50'];

const LABEL_KEYS = ['label', 'day', 'date', 'name', 'period', 'category', 'categoryTitle', 'title', 'week', 'hour'];
const NON_METRIC_KEYS = ['id', 'categoryId', 'productId', 'order'];
const PIE_VALUE_PRIORITY = ['share', 'percentage', 'percent', 'total', 'totalSales', 'sales', 'amount', 'revenue', 'value', 'count'];
const METRIC_LABELS = {
  total: 'Total (€)',
  totalSales: 'Ventes (€)',
  totalPrice: 'Total (€)',
  sales: 'Ventes (€)',
  amount: 'Montant (€)',
  revenue: 'CA (€)',
  value: 'Valeur',
  count: 'Commandes',
  orders: 'Commandes',
  average: 'Panier moyen (€)',
  avg: 'Panier moyen (€)',
  averageBasket: 'Panier moyen (€)',
  share: 'Part (%)',
  percentage: 'Part (%)',
};

const metricLabel = (key) => METRIC_LABELS[key] || key;

const isNumeric = (v) =>
  typeof v === 'number' || (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v)));

const formatLabel = (value) => {
  const str = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const d = new Date(str);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
    }
  }
  return str;
};

const unwrapArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const nested = Object.values(data).find(Array.isArray);
    if (nested) return nested;
    return [data];
  }
  return [];
};

const toChartData = (raw) => unwrapArray(raw).map((row, i) => {
  if (row == null || typeof row !== 'object') {
    return { name: `#${i + 1}`, value: Number(row) || 0 };
  }
  const labelKey = LABEL_KEYS.find((k) => row[k] != null && typeof row[k] !== 'object');
  const out = { name: labelKey ? formatLabel(row[labelKey]) : `#${i + 1}` };
  Object.entries(row).forEach(([key, val]) => {
    if (key === labelKey || NON_METRIC_KEYS.includes(key)) return;
    if (isNumeric(val)) {
      out[key] = Number(val);
    } else if (val && typeof val === 'object' && !Array.isArray(val)) {
      
      Object.entries(val).forEach(([nk, nv]) => {
        if (isNumeric(nv)) out[nk] = Number(nv);
      });
    }
  });
  return out;
});

const seriesKeys = (data) => {
  const keys = new Set();
  data.forEach((row) => {
    Object.keys(row).forEach((k) => {
      if (k !== 'name' && typeof row[k] === 'number') keys.add(k);
    });
  });
  return [...keys];
};

const toPieData = (raw) => toChartData(raw)
  .map((row) => {
    const keys = Object.keys(row).filter((k) => k !== 'name' && typeof row[k] === 'number');
    const valueKey = PIE_VALUE_PRIORITY.find((k) => keys.includes(k)) || keys[0];
    return { name: row.name, value: valueKey ? row[valueKey] : 0 };
  })
  .filter((row) => row.value > 0);

const sumPrimaryMetric = (data) => {
  const keys = seriesKeys(data);
  const primary = PIE_VALUE_PRIORITY.find((k) => keys.includes(k)) || keys[0];
  if (!primary) return null;
  return data.reduce((acc, row) => acc + (row[primary] || 0), 0);
};

const formatAmount = (n) =>
  n == null ? '—' : Number(n).toLocaleString('fr-FR', { maximumFractionDigits: 2 });

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [daily, setDaily] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [weeklyByCategory, setWeeklyByCategory] = useState([]);
  const [categoryShare, setCategoryShare] = useState([]);
  const [salesView, setSalesView] = useState('weekly');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      const results = await Promise.allSettled([
        getDailySales(),
        getWeeklySales(),
        getWeeklySalesByCategory(),
        getCategoryShare(),
      ]);
      if (cancelled) return;

      const [dailyRes, weeklyRes, byCatRes, shareRes] = results;
      if (dailyRes.status === 'fulfilled') setDaily(toChartData(dailyRes.value.data));
      if (weeklyRes.status === 'fulfilled') setWeekly(toChartData(weeklyRes.value.data));
      if (byCatRes.status === 'fulfilled') setWeeklyByCategory(toChartData(byCatRes.value.data));
      if (shareRes.status === 'fulfilled') setCategoryShare(toPieData(shareRes.value.data));

      const failures = results.filter((r) => r.status === 'rejected');
      if (failures.length > 0) {
        console.error('Dashboard fetch errors:', failures.map((f) => f.reason));
        setError(failures.length === results.length
          ? 'Impossible de charger les statistiques. Vérifiez votre connexion et vos droits admin.'
          : 'Certaines statistiques n\'ont pas pu être chargées.');
      }
      setLoading(false);
    };
    fetchAll();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const salesData = salesView === 'daily' ? daily : weekly;
  const salesKeys = seriesKeys(salesData);
  const byCategoryKeys = seriesKeys(weeklyByCategory);

  const dailyTotal = sumPrimaryMetric(daily);
  const weeklyTotal = sumPrimaryMetric(weekly);

  if (loading) {
    return (
      <div className="adm-loading">
        <Loader2 size={32} className="adm-spin" />
        <p>Chargement des statistiques...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="adm-page-head">
        <div>
          <h1 className="adm-title">Dashboard</h1>
          <p className="adm-sub">Vue d'ensemble des ventes Althea Systems</p>
        </div>
        <button className="adm-btn" onClick={() => setRefreshKey((k) => k + 1)}>
          <RefreshCw size={16} /> Actualiser
        </button>
      </header>

      {error && (
        <div className="adm-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="dash-stats">
        <div className="dash-stat-card">
          <div className="dash-stat-icon"><TrendingUp size={20} /></div>
          <div>
            <span className="dash-stat-label">Ventes du jour</span>
            <strong className="dash-stat-value">{formatAmount(dailyTotal)}</strong>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon"><BarChart3 size={20} /></div>
          <div>
            <span className="dash-stat-label">Ventes de la semaine</span>
            <strong className="dash-stat-value">{formatAmount(weeklyTotal)}</strong>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon"><PieIcon size={20} /></div>
          <div>
            <span className="dash-stat-label">Catégories actives</span>
            <strong className="dash-stat-value">{categoryShare.length}</strong>
          </div>
        </div>
      </div>

      <div className="adm-card dash-chart-card">
        <div className="dash-chart-head">
          <h2>Ventes</h2>
          <div className="adm-lang-tabs">
            <button
              type="button"
              className={`adm-lang-tab ${salesView === 'daily' ? 'active' : ''}`}
              onClick={() => setSalesView('daily')}
            >
              Jour
            </button>
            <button
              type="button"
              className={`adm-lang-tab ${salesView === 'weekly' ? 'active' : ''}`}
              onClick={() => setSalesView('weekly')}
            >
              Semaine
            </button>
          </div>
        </div>
        {salesData.length === 0 || salesKeys.length === 0 ? (
          <div className="adm-empty"><p>Aucune donnée de vente disponible.</p></div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12, fontWeight: 600 }} stroke="#94a3b8" />
              <Tooltip formatter={(value, key) => [formatAmount(value), metricLabel(key)]} />
              <Legend formatter={metricLabel} />
              {salesKeys.map((key, i) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={CHART_COLORS[i % CHART_COLORS.length]}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="dash-grid">
        <div className="adm-card dash-chart-card">
          <div className="dash-chart-head">
            <h2>Paniers par catégorie (semaine)</h2>
          </div>
          {weeklyByCategory.length === 0 || byCategoryKeys.length === 0 ? (
            <div className="adm-empty"><p>Aucune donnée disponible.</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12, fontWeight: 600 }} stroke="#94a3b8" />
                <Tooltip formatter={(value, key) => [formatAmount(value), metricLabel(key)]} />
                <Legend formatter={metricLabel} />
                {byCategoryKeys.map((key, i) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    stackId={byCategoryKeys.length > 1 ? 'stack' : undefined}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                    radius={i === byCategoryKeys.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                    maxBarSize={48}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="adm-card dash-chart-card">
          <div className="dash-chart-head">
            <h2>Part des ventes par catégorie</h2>
          </div>
          {categoryShare.length === 0 ? (
            <div className="adm-empty"><p>Aucune donnée disponible.</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryShare}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryShare.map((entry, i) => (
                    <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatAmount(value)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <style>{`
        .dash-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-bottom: 1.5rem; }
        .dash-stat-card {
          background: white; border: 1px solid var(--border); border-radius: 18px;
          padding: 1.25rem 1.5rem; display: flex; align-items: center; gap: 1rem;
        }
        .dash-stat-icon {
          width: 46px; height: 46px; border-radius: 12px; flex-shrink: 0;
          background: #f0f4f8; color: var(--primary);
          display: flex; align-items: center; justify-content: center;
        }
        .dash-stat-label { display: block; font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; }
        .dash-stat-value { font-size: 1.5rem; font-weight: 900; color: #012a4a; }

        .dash-chart-card { margin-bottom: 1.5rem; }
        .dash-chart-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; }
        .dash-chart-head h2 { font-size: 1.05rem; font-weight: 850; color: #012a4a; }

        .dash-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .dash-grid .dash-chart-card { margin-bottom: 0; }

        @media (max-width: 1200px) {
          .dash-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .dash-stats { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
