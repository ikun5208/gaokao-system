import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GaokaoCategory } from './types';
import { getRankFromScore, totalCandidates } from './data/gaokaoData';
import ScoreQuery from './components/ScoreQuery';
import ScoreCharts from './components/ScoreCharts';
import VolunteerSimulator from './components/VolunteerSimulator';
import Guidebook from './components/Guidebook';
import { 
  Award, 
  Compass, 
  BarChart2, 
  BookOpen, 
  Clock, 
  Grid, 
  Users,
  Activity,
  Sparkles,
  Info
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'query' | 'simulator' | 'charts' | 'guide'>('query');
  const [currentScore, setCurrentScore] = useState<number>(600);
  const [currentCategory, setCurrentCategory] = useState<GaokaoCategory>('physical');

  const currentRank = getRankFromScore(currentScore, currentCategory);
  const totalCount = totalCandidates[currentCategory];
  const currentPercentile = (((totalCount - currentRank) / totalCount) * 100).toFixed(2);

  const handleQueryUpdate = (score: number, category: GaokaoCategory) => {
    setCurrentScore(score);
    setCurrentCategory(category);
  };

  const tabs = [
    { id: 'query', label: '排位双向互查', icon: Award, desc: '分数排位精细化换算' },
    { id: 'simulator', label: '志愿智能模拟', icon: Compass, desc: '冲稳保梯队规划' },
    { id: 'charts', label: '高考宏观大屏', icon: BarChart2, desc: '省录取线及分布可视化' },
    { id: 'guide', label: '新高考政策指南', icon: BookOpen, desc: '3+1+2填报核心解惑' },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans antialiased">
      
      {/* Decorative Top Accent Light Bars */}
      <div className="w-full h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 shrink-0" />

      {/* Main Navigation + Header */}
      <header className="bg-white border-b border-gray-100 py-5 px-6 shrink-0 relative z-10 shadow-sm shadow-gray-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          
          {/* Logo / Title Area */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 shrink-0">
              <Grid className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight font-sans">
                  广东省高考智能分析与志愿模拟系统
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  2026 最新版
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                新高考“3+1+2”模式平行志愿辅助服务平台 (一分一段精细对标版)
              </p>
            </div>
          </div>

          {/* Sync status / Active profile pill */}
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-2xl text-xs">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-gray-600 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-600" />
                正在同步评估档案:
              </span>
              <span className="font-mono font-bold text-gray-900">
                {currentCategory === 'physical' ? '物理类' : '历史类'} ➜ {currentScore}分 (前全省 {currentPercentile}%)
              </span>
            </div>
          </div>

        </div>
      </header>

      {/* Dashboard Center Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8">
        
        {/* Navigation Tabs Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 focus:outline-none cursor-pointer group ${
                  isActive
                    ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                    : 'bg-white border-gray-100 text-gray-600 hover:border-indigo-100 hover:bg-indigo-50/10'
                }`}
              >
                <div className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow shadow-indigo-500/30'
                    : 'bg-gray-50 text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className={`text-sm font-bold tracking-tight ${isActive ? 'text-white' : 'text-gray-800'}`}>
                    {tab.label}
                  </span>
                  <span className={`text-[11px] ${isActive ? 'text-slate-400' : 'text-gray-400'}`}>
                    {tab.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Panel Canvas */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'query' && (
                <ScoreQuery 
                  onQueryComplete={handleQueryUpdate}
                  initialScore={currentScore}
                  initialCategory={currentCategory}
                />
              )}
              {activeTab === 'simulator' && (
                <VolunteerSimulator 
                  currentScore={currentScore}
                  currentCategory={currentCategory}
                />
              )}
              {activeTab === 'charts' && (
                <ScoreCharts 
                  currentCategory={currentCategory}
                  currentScore={currentScore}
                />
              )}
              {activeTab === 'guide' && (
                <Guidebook />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </main>

      {/* Footer Area */}
      <footer className="bg-white border-t border-gray-100 py-6 px-6 text-center text-xs text-gray-400 shrink-0 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>实时统计数据底本截止至 2026年7月5日 18:32 （广东省教育考试院授权一分一段表修正版）</span>
          </div>
          <div className="text-gray-400">
            仅作志愿规划决策参考，正式填报请以广东省教育考试院官方志愿填报系统（gdksy.gdedu.gov.cn）为准。
          </div>
        </div>
      </footer>

    </div>
  );
}
