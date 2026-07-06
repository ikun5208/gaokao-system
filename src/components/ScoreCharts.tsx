import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  physicalTrends, 
  historicalTrends, 
  getChartDistributionData, 
  totalCandidates 
} from '../data/gaokaoData';
import { GaokaoCategory } from '../types';
import { TrendingUp, BarChart2, Info, Users } from 'lucide-react';

interface ScoreChartsProps {
  currentCategory: GaokaoCategory;
  currentScore?: number;
}

export default function ScoreCharts({ currentCategory, currentScore }: ScoreChartsProps) {
  const [activeTab, setActiveTab] = useState<'trends' | 'distribution'>('trends');
  const [chartCategory, setChartCategory] = useState<GaokaoCategory>(currentCategory);

  // Sync with main category selection
  React.useEffect(() => {
    setChartCategory(currentCategory);
  }, [currentCategory]);

  const trendsData = chartCategory === 'physical' ? physicalTrends : historicalTrends;
  const distributionData = getChartDistributionData(chartCategory);

  // Custom tooltips
  const CustomTrendTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 text-white p-3 rounded-xl shadow-lg text-xs font-sans">
          <p className="font-bold mb-1.5 text-slate-300">{label}年 广东省录取线</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="flex justify-between gap-4 py-0.5" style={{ color: entry.color }}>
              <span>{entry.name}:</span>
              <span className="font-mono font-bold">{entry.value}分</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomDistTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const score = payload[0].payload.score;
      const count = payload[0].payload.count;
      const cumulative = payload[0].payload.cumulative;
      return (
        <div className="bg-slate-900 border border-slate-800 text-white p-3 rounded-xl shadow-lg text-xs font-sans">
          <p className="font-bold text-slate-300 border-b border-slate-800 pb-1 mb-1.5">分数点评估: {score}分</p>
          <p className="text-emerald-400 flex justify-between gap-4">
            <span>该分段人数:</span>
            <span className="font-mono font-bold">~{count.toLocaleString()} 人</span>
          </p>
          <p className="text-indigo-400 flex justify-between gap-4">
            <span>累计省排位:</span>
            <span className="font-mono font-bold">{cumulative.toLocaleString()} 名</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-6" id="score_charts_module">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-600" />
            高考数据分析可视化大屏
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            动态分析广东省招生控制线演变规律及考生分数密集度曲线。
          </p>
        </div>

        {/* Charts tab toggle */}
        <div className="flex gap-1.5 bg-gray-50 border border-gray-100 p-1 rounded-xl shrink-0 self-stretch sm:self-auto text-center">
          <button
            onClick={() => setActiveTab('trends')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'trends'
                ? 'bg-white text-gray-950 shadow-sm border border-gray-200/50'
                : 'text-gray-500 hover:text-gray-950'
            }`}
          >
            控制线历史演变
          </button>
          <button
            onClick={() => setActiveTab('distribution')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'distribution'
                ? 'bg-white text-gray-950 shadow-sm border border-gray-200/50'
                : 'text-gray-500 hover:text-gray-950'
            }`}
          >
            考生分布曲线 (一分一段)
          </button>
        </div>
      </div>

      {/* Internal Track Filter */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
        <div className="flex gap-3">
          <button
            onClick={() => setChartCategory('physical')}
            className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-all ${
              chartCategory === 'physical'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            物理类图表
          </button>
          <button
            onClick={() => setChartCategory('historical')}
            className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-all ${
              chartCategory === 'historical'
                ? 'bg-rose-50 text-rose-700 border border-rose-100'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            历史类图表
          </button>
        </div>

        <div className="text-xs text-gray-400 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          <span>全省招生基数: {totalCandidates[chartCategory].toLocaleString()}人</span>
        </div>
      </div>

      {/* Main Chart Canvas Container */}
      <div className="h-72 w-full mt-2 select-none relative">
        {activeTab === 'trends' ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trendsData}
              margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="year" 
                stroke="#94a3b8" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                domain={[380, 580]} 
                stroke="#94a3b8" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => `${val}分`}
              />
              <Tooltip content={<CustomTrendTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }}
              />
              <Line 
                name="特招线 (特殊类型控制线)" 
                type="monotone" 
                dataKey="specialLine" 
                stroke={chartCategory === 'physical' ? '#4f46e5' : '#e11d48'} 
                strokeWidth={3}
                activeDot={{ r: 6 }}
                dot={{ r: 4 }}
              />
              <Line 
                name="本科批次录取控制线" 
                type="monotone" 
                dataKey="undergradLine" 
                stroke="#0284c7" 
                strokeWidth={2}
                strokeDasharray="4 4"
                activeDot={{ r: 5 }}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={distributionData}
              margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop 
                    offset="5%" 
                    stopColor={chartCategory === 'physical' ? '#4f46e5' : '#e11d48'} 
                    stopOpacity={0.2}
                  />
                  <stop 
                    offset="95%" 
                    stopColor={chartCategory === 'physical' ? '#4f46e5' : '#e11d48'} 
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="score" 
                stroke="#94a3b8" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
                reversed
                tickFormatter={(val) => `${val}分`}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomDistTooltip />} />
              <Area 
                name="该分段人数" 
                type="monotone" 
                dataKey="count" 
                stroke={chartCategory === 'physical' ? '#4f46e5' : '#e11d48'} 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorCount)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Insights / Footnotes card */}
      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
        <div className="text-xs text-gray-600 leading-relaxed">
          {activeTab === 'trends' ? (
            <p>
              <strong>趋势洞察:</strong> 2021-2026年，广东省强基/特招控制线整体围绕 <strong>528 - 548分</strong> 波动，而普通本科控制线稳定在 <strong>428 - 445分</strong>。这显示出新高考改革后试卷难度结构及招生名额结构基本保持了良性的宏观均衡，波动主要受当年语数外三科命题难易程度影响。
            </p>
          ) : (
            <p>
              <strong>分布洞察:</strong> 一分一段密集分布区集中在 <strong>450分 - 580分</strong>。在此区间内，分数极具竞争性，“一分差百人”甚至“一分差千人”现象严重。建议在此分数区间的考生，填报志愿时充分拉开专业组和院校的梯度，切勿盲目扎堆热门专业组。
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
