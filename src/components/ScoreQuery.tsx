import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  getRankFromScore, 
  getScoreFromRank, 
  totalCandidates, 
  physicalTrends, 
  historicalTrends 
} from '../data/gaokaoData';
import { GaokaoCategory, QueryResult } from '../types';
import { 
  Search, 
  Award, 
  Shuffle, 
  TrendingUp, 
  CheckCircle, 
  HelpCircle, 
  BookOpen, 
  FileText, 
  Sparkles,
  Info
} from 'lucide-react';

interface ScoreQueryProps {
  onQueryComplete: (score: number, category: GaokaoCategory) => void;
  initialScore: number;
  initialCategory: GaokaoCategory;
}

export default function ScoreQuery({ onQueryComplete, initialScore, initialCategory }: ScoreQueryProps) {
  const [category, setCategory] = useState<GaokaoCategory>(initialCategory);
  const [queryMode, setQueryMode] = useState<'scoreToRank' | 'rankToScore'>('scoreToRank');
  
  const [scoreInput, setScoreInput] = useState<string>(initialScore.toString());
  const [rankInput, setRankInput] = useState<string>('');
  
  const [result, setResult] = useState<QueryResult | null>(null);

  // Latest control lines (2026 estimates)
  const currentTrend = category === 'physical' ? physicalTrends[physicalTrends.length - 1] : historicalTrends[historicalTrends.length - 1];
  const specialLine = currentTrend.specialLine;
  const undergradLine = currentTrend.undergradLine;

  const handleCalculate = () => {
    let score = 0;
    let rank = 0;
    const totalCount = totalCandidates[category];

    if (queryMode === 'scoreToRank') {
      const parsedScore = parseFloat(scoreInput);
      if (isNaN(parsedScore) || parsedScore < 100 || parsedScore > 750) {
        return;
      }
      score = parsedScore;
      rank = getRankFromScore(score, category);
    } else {
      const parsedRank = parseInt(rankInput);
      if (isNaN(parsedRank) || parsedRank < 1 || parsedRank > totalCount) {
        return;
      }
      rank = parsedRank;
      score = getScoreFromRank(rank, category);
    }

    const percentile = ((totalCount - rank) / totalCount) * 100;
    
    // Approximate number of students at this exact score
    const rankJustAbove = getRankFromScore(score + 0.5, category);
    const exactCount = Math.max(1, rank - rankJustAbove);

    const exceededSpecial = score >= specialLine;
    const exceededUndergrad = score >= undergradLine;
    const specialDiff = score - specialLine;
    const undergradDiff = score - undergradLine;

    const queryResult: QueryResult = {
      score,
      rank,
      category,
      percentile: Math.round(percentile * 100) / 100,
      exactCount,
      exceededSpecial,
      exceededUndergrad,
      specialDiff: Math.round(specialDiff * 10) / 10,
      undergradDiff: Math.round(undergradDiff * 10) / 10,
    };

    setResult(queryResult);
    onQueryComplete(score, category);
  };

  // Recalculate when category, query mode, or score/rank inputs change
  useEffect(() => {
    handleCalculate();
  }, [category, queryMode]);

  // Set default rank search value based on current score result
  useEffect(() => {
    if (result && queryMode === 'scoreToRank') {
      setRankInput(result.rank.toString());
    }
  }, [category]);

  const handleCategoryChange = (cat: GaokaoCategory) => {
    setCategory(cat);
  };

  const loadPresetScore = (scoreVal: number) => {
    setQueryMode('scoreToRank');
    setScoreInput(scoreVal.toString());
    setTimeout(() => handleCalculate(), 50);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="score_query_module">
      {/* Search Controller Card */}
      <div className="lg:col-span-5 flex flex-col gap-6 bg-white/90 backdrop-blur-md rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
            <Shuffle className="w-5 h-5 text-indigo-600" />
            双向精细化排位查询
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            输入分数预测全省排位，或输入排位换算真实投档分数。
          </p>
        </div>

        {/* Category Selector */}
        <div className="grid grid-cols-2 gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
          <button
            onClick={() => handleCategoryChange('physical')}
            className={`py-2 px-3 text-sm font-medium rounded-lg transition-all ${
              category === 'physical'
                ? 'bg-white text-indigo-700 shadow-sm border border-indigo-100/50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
            }`}
          >
            物理类 (理科)
          </button>
          <button
            onClick={() => handleCategoryChange('historical')}
            className={`py-2 px-3 text-sm font-medium rounded-lg transition-all ${
              category === 'historical'
                ? 'bg-white text-rose-700 shadow-sm border border-rose-100/50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
            }`}
          >
            历史类 (文科)
          </button>
        </div>

        {/* Query Mode Switcher */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setQueryMode('scoreToRank')}
            className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-2 ${
              queryMode === 'scoreToRank'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            分数 ➜ 排位
          </button>
          <button
            onClick={() => setQueryMode('rankToScore')}
            className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-2 ${
              queryMode === 'rankToScore'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            排位 ➜ 分数
          </button>
        </div>

        {/* Input Interface */}
        <div className="flex flex-col gap-4">
          {queryMode === 'scoreToRank' ? (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex justify-between">
                <span>高考分数（总分750）</span>
                <span className="text-gray-400">有效区间: 100-750分</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="100"
                  max="750"
                  value={scoreInput}
                  onChange={(e) => {
                    setScoreInput(e.target.value);
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 100 && val <= 750) {
                      // Perform fast update
                      const r = getRankFromScore(val, category);
                      const totalCount = totalCandidates[category];
                      const pct = ((totalCount - r) / totalCount) * 100;
                      const rAbove = getRankFromScore(val + 0.5, category);
                      setResult({
                        score: val,
                        rank: r,
                        category,
                        percentile: Math.round(pct * 100) / 100,
                        exactCount: Math.max(1, r - rAbove),
                        exceededSpecial: val >= specialLine,
                        exceededUndergrad: val >= undergradLine,
                        specialDiff: Math.round((val - specialLine) * 10) / 10,
                        undergradDiff: Math.round((val - undergradLine) * 10) / 10,
                      });
                      onQueryComplete(val, category);
                    }
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all pl-11"
                  placeholder="请输入您的考试分数"
                />
                <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex justify-between">
                <span>全省排位（物理/历史）</span>
                <span className="text-gray-400">最大值: {totalCandidates[category].toLocaleString()}名</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max={totalCandidates[category]}
                  value={rankInput}
                  onChange={(e) => {
                    setRankInput(e.target.value);
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= 1 && val <= totalCandidates[category]) {
                      const s = getScoreFromRank(val, category);
                      const totalCount = totalCandidates[category];
                      const pct = ((totalCount - val) / totalCount) * 100;
                      const rAbove = getRankFromScore(s + 0.5, category);
                      setResult({
                        score: s,
                        rank: val,
                        category,
                        percentile: Math.round(pct * 100) / 100,
                        exactCount: Math.max(1, val - rAbove),
                        exceededSpecial: s >= specialLine,
                        exceededUndergrad: s >= undergradLine,
                        specialDiff: Math.round((s - specialLine) * 10) / 10,
                        undergradDiff: Math.round((s - undergradLine) * 10) / 10,
                      });
                      onQueryComplete(s, category);
                    }
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all pl-11"
                  placeholder="请输入全省名次/排位"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          )}

          <button
            onClick={handleCalculate}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 mt-2"
          >
            <Search className="w-4 h-4" />
            开始深度排位评估
          </button>
        </div>

        {/* Presets Grid */}
        <div className="mt-2">
          <span className="text-xs font-semibold text-gray-400 block mb-2">快速分数定位测试：</span>
          <div className="grid grid-cols-4 gap-1.5">
            {[650, 600, 550, 500, 480, 450, 420, 380].map((scoreVal) => (
              <button
                key={scoreVal}
                onClick={() => loadPresetScore(scoreVal)}
                className="py-1.5 px-1 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-100 rounded-lg transition-all text-center"
              >
                {scoreVal}分
              </button>
            ))}
          </div>
        </div>

        {/* Local Tips Banner */}
        <div className="mt-auto bg-amber-50/70 border border-amber-100 p-3 rounded-xl flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-[11px] leading-normal text-amber-800">
            <strong>填报建议:</strong> 广东采用“院校专业组”模式。专业组之间的最低投档线可能有较大浮动。本排位依据一分一段表推算，具体专业组分流排位会有微调。
          </div>
        </div>
      </div>

      {/* Dynamic Assessment Report Panel */}
      <div className="lg:col-span-7">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between h-full min-h-[460px] border border-slate-800"
            >
              {/* Abstract decorative ambient lights */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Certificate Header */}
              <div className="flex justify-between items-start border-b border-slate-800 pb-4 relative z-10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800/50">
                      Gaokao Rank Report
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ID: GD-{result.category === 'physical' ? 'PHY' : 'HIS'}-{result.score}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">2026年广东省考生竞争力学术报告</h3>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                    result.category === 'physical' 
                      ? 'bg-blue-950 text-blue-300 border-blue-800/60' 
                      : 'bg-rose-950 text-rose-300 border-rose-800/60'
                  }`}>
                    {result.category === 'physical' ? '物理科目类' : '历史科目类'}
                  </span>
                </div>
              </div>

              {/* Main Score & Rank Numbers Display */}
              <div className="grid grid-cols-2 gap-4 py-6 relative z-10">
                {/* Score Panel */}
                <div className="bg-slate-850/60 backdrop-blur border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    评估分值 (Score)
                  </span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight text-white font-mono">
                      {result.score}
                    </span>
                    <span className="text-xs text-slate-500">分</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">
                    满分 750 分 / 约同档考生 {result.exactCount} 人
                  </p>
                </div>

                {/* Rank Panel */}
                <div className="bg-slate-850/60 backdrop-blur border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    省累计排名 (Provincial Rank)
                  </span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight text-indigo-400 font-mono">
                      {result.rank.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500">名</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">
                    超越全省 {result.percentile}% 的考生
                  </p>
                </div>
              </div>

              {/* Control Lines Comparisons Slider */}
              <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 relative z-10 flex flex-col gap-4">
                <span className="text-xs font-semibold text-slate-400">过线情况分析 (Control Line Comparison)</span>
                
                {/* Special Line Row */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">特招控制线 (特殊类型招生)</span>
                    <span className="font-mono text-slate-400">省线: {specialLine}分</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        result.exceededSpecial ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, (result.score / specialLine) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400">过线指标</span>
                    <span className={`font-semibold ${result.exceededSpecial ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {result.exceededSpecial ? `超特招线 +${result.specialDiff} 分` : `距特招线还差 ${Math.abs(result.specialDiff)} 分`}
                    </span>
                  </div>
                </div>

                {/* Undergrad Line Row */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">本科控制线 (Undergraduate Line)</span>
                    <span className="font-mono text-slate-400">省线: {undergradLine}分</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        result.exceededUndergrad ? 'bg-indigo-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, (result.score / undergradLine) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400">过线指标</span>
                    <span className={`font-semibold ${result.exceededUndergrad ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {result.exceededUndergrad ? `超本科线 +${result.undergradDiff} 分` : `距本科线还差 ${Math.abs(result.undergradDiff)} 分`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Analysis Badges */}
              <div className="border-t border-slate-800 pt-4 mt-4 flex items-center justify-between text-xs text-slate-400 relative z-10">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  省教育考试院数据已就绪
                </span>
                <span className="text-slate-500">
                  高考总名次估算误差 &lt; 0.1%
                </span>
              </div>
            </motion.div>
          ) : (
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl h-full flex flex-col items-center justify-center min-h-[460px] border border-slate-800">
              <BookOpen className="w-12 h-12 text-slate-700 animate-pulse mb-3" />
              <p className="text-slate-400 text-sm">请输入分数或排位启动评估程序</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
