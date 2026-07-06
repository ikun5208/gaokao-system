import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  getRecommendations, 
  getRankFromScore, 
  totalCandidates, 
  Recommendation
} from '../data/gaokaoData';
import { GaokaoCategory, University } from '../types';
import { 
  Compass, 
  SlidersHorizontal, 
  ChevronRight, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  MapPin, 
  Award, 
  BookOpen,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
  Info,
  X,
  Printer,
  Copy,
  Check,
  Download,
  Eye,
  Sparkles
} from 'lucide-react';

interface VolunteerSimulatorProps {
  currentScore: number;
  currentCategory: GaokaoCategory;
}

interface DraftItem {
  university: University;
  type: '冲' | '稳' | '保';
  majorGroup: string;
  selectedMajors?: string[];
  acceptAdjustment?: boolean;
}

function generateMajorGroups(uni: University, category: GaokaoCategory) {
  const majors = uni.recommendedMajors;
  const isPhysical = category === 'physical';
  
  return [
    {
      code: "01组",
      name: `${isPhysical ? '物理类' : '历史类'} - 顶尖优势学科实验班`,
      description: "汇聚学校在全国排名前列的王牌骨干学科，配备顶级导师和一流科研资源。",
      majors: majors.slice(0, 2),
    },
    {
      code: "02组",
      name: `${isPhysical ? '物理类' : '历史类'} - 前沿交叉与高新技术组`,
      description: "面向国家战略性新兴产业与智能制造领域，强化跨学科复合型人才培养，深造率极高。",
      majors: majors.slice(2, 4),
    },
    {
      code: "03组",
      name: `${isPhysical ? '物理类' : '历史类'} - 国际化与双语特色组`,
      description: "引进海外优质教学体系与行业实践资源，双语/全英授课，毕业后直接对接国际名校深造。",
      majors: majors.slice(4).length > 0 ? majors.slice(4) : [majors[0], "国际经济与贸易"],
    }
  ];
}

export default function VolunteerSimulator({ currentScore, currentCategory }: VolunteerSimulatorProps) {
  // Query state
  const [onlyGuangdong, setOnlyGuangdong] = useState<boolean>(true);
  const [showAllColleges, setShowAllColleges] = useState<boolean>(false);
  const [tier, setTier] = useState<'all' | '985_211' | 'double_first' | 'regular'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Results
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  
  // Custom Draft/Selected sheet (up to 45 choices)
  const [draftSheet, setDraftSheet] = useState<DraftItem[]>([]);
  
  // Modal states
  const [selectedUniForModal, setSelectedUniForModal] = useState<{ university: University; type: '冲' | '稳' | '保' } | null>(null);
  const [selectedGroupCode, setSelectedGroupCode] = useState<string>('01组');
  const [selectedMajors, setSelectedMajors] = useState<string[]>([]);
  const [acceptAdjustment, setAcceptAdjustment] = useState<boolean>(true);
  
  // Export & Diagnosis Modal states
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showDeepDiagnosisModal, setShowDeepDiagnosisModal] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  
  // Diagnose messages
  const [diagnostics, setDiagnostics] = useState<{ status: 'success' | 'warning' | 'info'; message: string; details: string }>({
    status: 'info',
    message: '志愿夹为空',
    details: '请从推荐列表中选择心仪的高校加入右侧的模拟平行志愿表进行合理性梯度评估。'
  });

  const runRecommender = () => {
    const list = getRecommendations(currentScore, currentCategory, {
      onlyGuangdong,
      tier,
      searchQuery,
      showAllColleges,
    });
    setRecommendations(list);
  };

  useEffect(() => {
    runRecommender();
  }, [currentScore, currentCategory, onlyGuangdong, tier, searchQuery, showAllColleges]);

  // Run audit diagnosis on draft sheet changes
  useEffect(() => {
    if (draftSheet.length === 0) {
      setDiagnostics({
        status: 'info',
        message: '暂无平行志愿数据',
        details: '请添加院校专业组。广东新高考志愿表支持填报多达45个院校专业组，合理的配置策略是：1/3冲刺，1/2稳妥，1/6保底。'
      });
      return;
    }

    // Checking for sorting errors (e.g. putting a Safety university before a Reach university)
    let hasOrderAnomaly = false;
    let anomalyIndex = -1;
    
    for (let i = 0; i < draftSheet.length - 1; i++) {
      const currentType = draftSheet[i].type;
      const nextType = draftSheet[i + 1].type;
      
      // Anomaly: putting '保' (Safety) before '冲' (Reach) or '稳' (Target)
      if (currentType === '保' && (nextType === '冲' || nextType === '稳')) {
        hasOrderAnomaly = true;
        anomalyIndex = i;
        break;
      }
      if (currentType === '稳' && nextType === '冲') {
        hasOrderAnomaly = true;
        anomalyIndex = i;
        break;
      }
    }

    const counts = {
      冲: draftSheet.filter(d => d.type === '冲').length,
      稳: draftSheet.filter(d => d.type === '稳').length,
      保: draftSheet.filter(d => d.type === '保').length,
    };

    if (hasOrderAnomaly) {
      setDiagnostics({
        status: 'warning',
        message: '志愿排序存在倒挂风险！',
        details: `在第 ${anomalyIndex + 1} 位后，您放置了录取机率较低的学校，而高机率（稳/保）的学校排在前面。平行志愿遵循“分数优先、遵循志愿”原则，前序保底学校一旦录取，后序冲刺名校将直接作废，建议调整排序！`
      });
    } else if (counts.保 === 0 && draftSheet.length >= 5) {
      setDiagnostics({
        status: 'warning',
        message: '严重缺陷：缺乏保底院校！',
        details: '您的志愿列表中全是“冲”和“稳”的学校，缺少“保”底的高校。如果当年分数线意外上涨，极易导致“滑档”（无一录取）。请至少加入1-2所能够稳妥录取的学校。'
      });
    } else {
      setDiagnostics({
        status: 'success',
        message: '志愿排列梯度健康！',
        details: `当前已填报 ${draftSheet.length} 个志愿。梯度结构为：冲 [${counts.冲}所] ➔ 稳 [${counts.稳}所] ➔ 保 [${counts.保}所]。符合“冲、稳、保”黄金填报梯度法则。`
      });
    }
  }, [draftSheet]);

  const openFillModal = (uni: University, type: '冲' | '稳' | '保') => {
    const existing = draftSheet.find(d => d.university.id === uni.id);
    setSelectedUniForModal({ university: uni, type });
    
    const groups = generateMajorGroups(uni, currentCategory);
    
    if (existing) {
      const matchedGroup = groups.find(g => existing.majorGroup.includes(g.code)) || groups[0];
      setSelectedGroupCode(matchedGroup.code);
      setSelectedMajors(existing.selectedMajors || matchedGroup.majors);
      setAcceptAdjustment(existing.acceptAdjustment !== undefined ? existing.acceptAdjustment : true);
    } else {
      setSelectedGroupCode(groups[0].code);
      setSelectedMajors(groups[0].majors);
      setAcceptAdjustment(true);
    }
  };

  const handleGroupChange = (groupCode: string, groups: any[]) => {
    setSelectedGroupCode(groupCode);
    const grp = groups.find(g => g.code === groupCode);
    if (grp) {
      setSelectedMajors(grp.majors);
    }
  };

  const handleConfirmFill = () => {
    if (!selectedUniForModal) return;
    const { university, type } = selectedUniForModal;
    const groups = generateMajorGroups(university, currentCategory);
    const grp = groups.find(g => g.code === selectedGroupCode);
    const groupName = grp ? `[${grp.code}] ${grp.name}` : `${selectedGroupCode}专业组`;
    
    const existingIndex = draftSheet.findIndex(d => d.university.id === university.id);
    if (existingIndex !== -1) {
      const updated = [...draftSheet];
      updated[existingIndex] = {
        university,
        type,
        majorGroup: groupName,
        selectedMajors,
        acceptAdjustment
      };
      setDraftSheet(updated);
    } else {
      if (draftSheet.length >= 45) {
        alert("对不起，您的平行志愿表已满！广东省平行志愿填报限制为最多 45 个院校专业组。");
        return;
      }
      setDraftSheet([...draftSheet, {
        university,
        type,
        majorGroup: groupName,
        selectedMajors,
        acceptAdjustment
      }]);
    }
    setSelectedUniForModal(null);
  };

  const addToDraft = (uni: University, type: '冲' | '稳' | '保') => {
    openFillModal(uni, type);
  };

  const removeFromDraft = (index: number) => {
    const updated = [...draftSheet];
    updated.splice(index, 1);
    setDraftSheet(updated);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === draftSheet.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...draftSheet];
    
    // Swap
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setDraftSheet(updated);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8" id="volunteer_simulator_module">
      
      {/* Left side: Recommendation Explorer (7 Cols) */}
      <div className="xl:col-span-7 flex flex-col gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-600 animate-spin-slow" />
                智能 “冲 稳 保” 志愿推荐
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                根据您设定的分数 <strong className="text-indigo-600 font-mono text-sm">{currentScore}分</strong> （全省排名：<span className="font-mono text-sm font-bold text-gray-800">{getRankFromScore(currentScore, currentCategory).toLocaleString()}名</span>）筛选出的精准推荐。
              </p>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-gray-50/80 p-4 rounded-xl border border-gray-100 text-xs">
            {/* Search Input */}
            <div className="sm:col-span-5">
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">搜索校名 / 地区 / 专业</label>
              <input
                type="text"
                placeholder="例如: 华南理工、深圳、会计学..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-gray-800"
              />
            </div>

            {/* Region & Custom Filter */}
            <div className="sm:col-span-3 flex flex-col justify-end gap-1.5 pb-0.5">
              <label className="flex items-center gap-1.5 font-semibold text-gray-600 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyGuangdong}
                  onChange={(e) => setOnlyGuangdong(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                />
                仅看广东省内高校
              </label>
              <label className="flex items-center gap-1.5 font-semibold text-gray-600 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAllColleges}
                  onChange={(e) => setShowAllColleges(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                />
                显示全库(不限分)
              </label>
            </div>

            {/* University Tier Select */}
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">院校办学层次</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as any)}
                className="w-full px-2 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="all">不限办学档次</option>
                <option value="985_211">仅看 985 / 211 院校</option>
                <option value="double_first">仅看 “双一流” 建设高校</option>
                <option value="regular">普通本科院校</option>
              </select>
            </div>
          </div>

          {/* Recommended Universities List */}
          <div className="flex flex-col gap-3.5 max-h-[580px] overflow-y-auto pr-1">
            {recommendations.length > 0 ? (
              recommendations.map((rec) => {
                const isAdded = draftSheet.some(d => d.university.id === rec.university.id);
                return (
                  <motion.div
                    key={rec.university.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.18 }}
                    className={`p-5 border rounded-xl bg-white transition-all flex flex-col sm:flex-row justify-between items-start gap-4 relative overflow-hidden group border-gray-100 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50/30 cursor-pointer ${
                      isAdded ? 'ring-1 ring-indigo-100 bg-indigo-50/5' : ''
                    }`}
                    onClick={() => openFillModal(rec.university, rec.type)}
                  >
                    {/* Left category decorative edge indicator */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                      rec.type === '冲' ? 'bg-amber-400' : rec.type === '稳' ? 'bg-indigo-500' : 'bg-emerald-500'
                    }`} />

                    <div className="flex-1 flex flex-col gap-2 pl-2 w-full min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {rec.university.name}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100/60">
                          代码: {rec.university.code}
                        </span>
                        <span className="text-[10px] text-gray-500 flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100/60">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {rec.university.location}
                        </span>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-1 flex-wrap">
                        {rec.university.tags.map(tag => (
                          <span 
                            key={tag} 
                            className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-50 text-slate-600 border border-slate-100"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Detail description */}
                      <p className="text-[11px] text-gray-500 leading-relaxed text-left">
                        {rec.university.description}
                      </p>

                      {/* Recommend Majors */}
                      <div className="text-[10px] text-gray-400 flex items-center gap-1.5 flex-wrap mt-0.5">
                        <span className="font-semibold text-gray-500">王牌专业:</span>
                        {rec.university.recommendedMajors.map((major) => (
                          <span key={major} className="text-gray-600 bg-indigo-50/30 px-1.5 py-0.5 rounded text-[9px] border border-indigo-100/30">
                            {major}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right side: Ranks & recommendation badge */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3.5 w-full sm:w-[170px] shrink-0 border-t sm:border-t-0 border-gray-100 pt-3.5 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <div className="text-[10px] text-gray-400 font-medium">
                          2025最低投档
                        </div>
                        <div className="font-mono text-xs font-bold text-gray-700 mt-0.5">
                          {rec.minScore2025}分 / 排位 {rec.minRank2025.toLocaleString()}名
                        </div>
                        <div className={`text-[10px] font-semibold mt-0.5 ${
                          rec.scoreDiff >= 0 ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          {rec.scoreDiff >= 0 ? `高设定分 +${rec.scoreDiff}分` : `低于设定分 ${Math.abs(rec.scoreDiff)}分`}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md flex items-center gap-1 shadow-xs border ${
                          rec.type === '冲' 
                            ? 'bg-amber-50 text-amber-700 border-amber-100' 
                            : rec.type === '稳' 
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-100' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        }`}>
                          {rec.type === '冲' ? '🎯 冲刺' : rec.type === '稳' ? '⚖️ 稳妥' : '🛡️ 保底'}
                        </span>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openFillModal(rec.university, rec.type);
                          }}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                            isAdded
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
                              : 'bg-indigo-600 border-indigo-600 hover:bg-indigo-700 text-white'
                          }`}
                          title={isAdded ? "查看/修改填报意向" : "填报加入志愿草稿"}
                        >
                          {isAdded ? <CheckCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="py-12 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400">
                <BookOpen className="w-10 h-10 mb-2 stroke-1" />
                <p className="text-xs">暂无匹配推荐，您可以清除部分筛选条件或修改分数重试。</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right side: 45 College-Major Group Sheet Simulation (5 Cols) */}
      <div className="xl:col-span-5 flex flex-col gap-6">
        
        {/* Diagnosis Card */}
        <div className={`p-5 rounded-2xl border flex items-start gap-3.5 shadow-sm transition-all duration-300 ${
          diagnostics.status === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-900' 
            : diagnostics.status === 'warning' 
            ? 'bg-amber-50 border-amber-100 text-amber-900' 
            : 'bg-blue-50 border-blue-100 text-blue-900'
        }`}>
          {diagnostics.status === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : diagnostics.status === 'warning' ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-bounce-slow" />
          ) : (
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          )}
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-bold tracking-tight">
              {diagnostics.message}
            </h4>
            <p className="text-[11px] leading-relaxed opacity-90">
              {diagnostics.details}
            </p>
          </div>
        </div>

        {/* Selected Sheet Simulator */}
        <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 shadow-md flex flex-col gap-4 relative overflow-hidden">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                粤平行志愿模拟志愿表 (草稿)
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                广东志愿上限45个院校专业组 / 点击项可重新配置专业
              </p>
            </div>
            <span className="font-mono text-xs text-indigo-400 bg-indigo-950 px-2 py-1 rounded border border-indigo-900">
              {draftSheet.length} / 45
            </span>
          </div>

          {/* Draft List Scroll Area */}
          <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1">
            {draftSheet.length > 0 ? (
              draftSheet.map((item, index) => (
                <div 
                  key={item.university.id} 
                  onClick={() => openFillModal(item.university, item.type)}
                  className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl flex flex-col gap-2 cursor-pointer hover:border-slate-700 transition-all text-xs group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-[70%]">
                      {/* Index Badge */}
                      <span className="font-mono font-bold text-slate-500 w-5 text-center">
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                      
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-white text-xs group-hover:text-indigo-400 transition-colors">{item.university.name}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                            item.type === '冲' 
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-900/40' 
                              : item.type === '稳' 
                              ? 'bg-blue-950/80 text-blue-300 border border-blue-900/40' 
                              : 'bg-emerald-950/80 text-emerald-300 border border-emerald-900/40'
                          }`}>
                            {item.type === '冲' ? '🎯 冲' : item.type === '稳' ? '⚖️ 稳' : '🛡️ 保'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {item.majorGroup}
                        </span>
                      </div>
                    </div>

                    {/* Move & Actions */}
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => moveItem(index, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-20 disabled:hover:text-slate-400 cursor-pointer"
                        title="上移"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => moveItem(index, 'down')}
                        disabled={index === draftSheet.length - 1}
                        className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-20 disabled:hover:text-slate-400 cursor-pointer"
                        title="下移"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => removeFromDraft(index)}
                        className="p-1 rounded bg-rose-950/50 border border-rose-900/30 text-rose-300 hover:bg-rose-900 hover:text-white transition-all ml-1 cursor-pointer"
                        title="删除"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Configured Majors and Adjustment Details */}
                  <div className="pl-7 pr-2 py-1.5 bg-slate-900/50 rounded-lg border border-slate-900/40 flex flex-col gap-1.5">
                    <div className="text-[10px] text-slate-400 flex flex-col gap-1">
                      <span className="font-semibold text-slate-500">拟报专业及顺序：</span>
                      {item.selectedMajors && item.selectedMajors.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {item.selectedMajors.map((major, mIdx) => (
                            <div key={major} className="flex items-center justify-between text-[10px] text-slate-300">
                              <span className="truncate">
                                <span className="font-mono text-slate-500 mr-1">{mIdx + 1}.</span> {major}
                              </span>
                              <span className="text-[8px] text-indigo-400 bg-indigo-950/50 px-1 rounded">高热度</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-600 italic">暂无选择，请点击本栏进行配置</span>
                      )}
                    </div>

                    <div className="border-t border-slate-850/60 pt-1 mt-0.5 flex justify-between items-center text-[9px]">
                      <span className="text-slate-500">专业服从分配调剂：</span>
                      <span className={`font-bold px-1 rounded ${
                        item.acceptAdjustment !== false
                          ? 'text-emerald-400 bg-emerald-950/30'
                          : 'text-rose-400 bg-rose-950/30'
                      }`}>
                        {item.acceptAdjustment !== false ? '✅ 服从' : '❌ 不服从'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center border-2 border-dashed border-slate-850 rounded-xl flex flex-col items-center justify-center text-slate-600">
                <Compass className="w-8 h-8 mb-2 opacity-30 animate-pulse" />
                <p className="text-[10px]">志愿表为空。请点击左侧推荐列表的 “+”</p>
                <p className="text-[9px] text-slate-700 mt-1">模拟加入并生成平行梯度诊断</p>
              </div>
            )}
          </div>

          {/* Action Footer */}
          {draftSheet.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-850">
              <button
                onClick={() => setShowDeepDiagnosisModal(true)}
                className="py-2 px-3 bg-indigo-950 border border-indigo-900 text-indigo-300 rounded-xl font-bold text-xs hover:bg-indigo-900 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                深度梯度诊断
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="py-2 px-3 bg-slate-800 border border-slate-750 text-slate-200 rounded-xl font-bold text-xs hover:bg-slate-750 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                导出志愿草稿
              </button>
            </div>
          )}

          {/* Quick tips */}
          <div className="border-t border-slate-850 pt-3 mt-1 flex items-center justify-between text-[10px] text-slate-500">
            <span>遵循志愿：分数优先，一次投档</span>
            <span className="text-indigo-400 font-mono font-bold">建议梯度: 冲(15) 稳(20) 保(10)</span>
          </div>
        </div>
      </div>

      {/* --- ALL INTERACTIVE MODALS AND DIALOGS --- */}

      {/* 1. College-Major Group Filling Modal */}
      <AnimatePresence>
        {selectedUniForModal && (() => {
          const uni = selectedUniForModal.university;
          const type = selectedUniForModal.type;
          const groups = generateMajorGroups(uni, currentCategory);
          const currentGroup = groups.find(g => g.code === selectedGroupCode) || groups[0];
          
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]"
              >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      模拟填报与专业配置
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">{uni.name} ({uni.location})</p>
                  </div>
                  <button 
                    onClick={() => setSelectedUniForModal(null)}
                    className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex flex-col gap-5 text-left text-xs">
                  {/* Step 1: Type selection */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">1. 填报梯度意向</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['冲', '稳', '保'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSelectedUniForModal({ university: uni, type: t })}
                          className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            type === t
                              ? t === '冲'
                                ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-xs'
                                : t === '稳'
                                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs'
                                : 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs'
                              : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                          }`}
                        >
                          {t === '冲' ? '🎯 冲刺' : t === '稳' ? '⚖️ 稳妥' : '🛡️ 保底'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Major Group Selection */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">2. 选择院校专业组 (粤新高考模式)</label>
                    <div className="flex flex-col gap-2">
                      {groups.map((group) => (
                        <label 
                          key={group.code}
                          className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                            selectedGroupCode === group.code
                              ? 'border-indigo-600 bg-indigo-50/20 shadow-xs'
                              : 'border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name="major_group"
                            checked={selectedGroupCode === group.code}
                            onChange={() => handleGroupChange(group.code, groups)}
                            className="mt-0.5 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 shrink-0"
                          />
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-gray-900">
                              [{group.code}] {group.name}
                            </span>
                            <span className="text-[10px] text-gray-500 leading-normal">
                              {group.description}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Step 3: Majors Selection */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">3. 拟报专业及填报顺序 (多选)</label>
                      <span className="text-[10px] text-indigo-600 font-medium">已选择 {selectedMajors.length} 个专业</span>
                    </div>
                    
                    <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-xl flex flex-col gap-2">
                      {currentGroup.majors.map((major) => {
                        const isChecked = selectedMajors.includes(major);
                        return (
                          <label 
                            key={major}
                            className={`flex items-center gap-2.5 p-2 rounded-lg bg-white border border-gray-100/80 cursor-pointer select-none transition-all hover:bg-indigo-50/10 ${
                              isChecked ? 'border-indigo-200 ring-1 ring-indigo-50' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedMajors([...selectedMajors, major]);
                                } else {
                                  setSelectedMajors(selectedMajors.filter(m => m !== major));
                                }
                              }}
                              className="text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 rounded"
                            />
                            <div className="flex-1 flex items-center justify-between">
                              <span className="font-medium text-gray-800">{major}</span>
                              <span className="text-[9px] text-indigo-500 bg-indigo-50/80 px-1.5 py-0.5 rounded-md font-medium">重点推荐</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 4: Accept Adjustment */}
                  <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-100 rounded-xl">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-gray-800">专业服从分配调剂</span>
                      <span className="text-[10px] text-gray-500">
                        强烈建议勾选。若所填专业皆未录满，可调剂至本专业组其他专业，避免被高校退档。
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={acceptAdjustment} 
                        onChange={(e) => setAcceptAdjustment(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedUniForModal(null)}
                    className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmFill}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all hover:shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    确认填报
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* 2. Advanced / Deep Diagnosis Modal */}
      <AnimatePresence>
        {showDeepDiagnosisModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-xl w-full overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      AI 志愿平行梯度深度审计报告
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">多维度合理性诊断 & 退档风险核查</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDeepDiagnosisModal(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto flex flex-col gap-6 text-left text-xs">
                {/* 1. Score Summary */}
                <div className="grid grid-cols-3 gap-3 bg-indigo-50/40 p-4 rounded-xl border border-indigo-100/30">
                  <div className="text-center">
                    <span className="text-gray-500 block mb-1">设定成绩</span>
                    <strong className="text-indigo-600 text-lg font-mono">{currentScore}分</strong>
                  </div>
                  <div className="text-center border-x border-indigo-100/30">
                    <span className="text-gray-500 block mb-1">物理/历史类</span>
                    <strong className="text-gray-800 text-sm">{currentCategory === 'physical' ? '⚡ 物理类' : '📖 历史类'}</strong>
                  </div>
                  <div className="text-center">
                    <span className="text-gray-500 block mb-1">已选志愿数</span>
                    <strong className="text-gray-800 text-lg font-mono">{draftSheet.length}个组</strong>
                  </div>
                </div>

                {/* 2. Gradient Distribution Analysis */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-2.5 flex items-center gap-1.5 text-sm">
                    <Compass className="w-4 h-4 text-indigo-600" />
                    “冲稳保”结构分布图
                  </h4>
                  {(() => {
                    const counts = {
                      冲: draftSheet.filter(d => d.type === '冲').length,
                      稳: draftSheet.filter(d => d.type === '稳').length,
                      保: draftSheet.filter(d => d.type === '保').length,
                    };
                    const total = draftSheet.length;
                    const percent = {
                      冲: total ? Math.round((counts.冲 / total) * 100) : 0,
                      稳: total ? Math.round((counts.稳 / total) * 100) : 0,
                      保: total ? Math.round((counts.保 / total) * 100) : 0,
                    };
                    
                    return (
                      <div className="flex flex-col gap-3">
                        <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex">
                          <div style={{ width: `${percent.冲}%` }} className="bg-amber-400 h-full" title={`冲: ${percent.冲}%`} />
                          <div style={{ width: `${percent.稳}%` }} className="bg-indigo-500 h-full" title={`稳: ${percent.稳}%`} />
                          <div style={{ width: `${percent.保}%` }} className="bg-emerald-500 h-full" title={`保: ${percent.保}%`} />
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2.5 bg-amber-50/50 rounded-lg border border-amber-100/60">
                            <span className="font-bold text-amber-700 block text-xs">🚀 冲刺 [ {counts.冲} 个 ]</span>
                            <span className="text-[10px] text-gray-400 mt-0.5 block">占比 {percent.冲}% (建议 ~30%)</span>
                          </div>
                          <div className="p-2.5 bg-indigo-50/50 rounded-lg border border-indigo-100/60">
                            <span className="font-bold text-indigo-700 block text-xs">⚖️ 稳妥 [ {counts.稳} 个 ]</span>
                            <span className="text-[10px] text-gray-400 mt-0.5 block">占比 {percent.稳}% (建议 ~40%)</span>
                          </div>
                          <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100/60">
                            <span className="font-bold text-emerald-700 block text-xs">🛡️ 保底 [ {counts.保} 个 ]</span>
                            <span className="text-[10px] text-gray-400 mt-0.5 block">占比 {percent.保}% (建议 ~30%)</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* 3. Potential Risks Audit */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-2.5 flex items-center gap-1.5 text-sm">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    高危填报漏洞检查
                  </h4>
                  <div className="flex flex-col gap-2.5">
                    {/* Check 1: No adjustment */}
                    {draftSheet.some(d => d.acceptAdjustment === false) ? (
                      <div className="p-3 bg-red-50 border border-red-100 text-red-900 rounded-xl flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold">高危预警：存在 “不服从调剂” 的志愿！</span>
                          <span className="text-[11px] leading-relaxed opacity-90">
                            您的草稿表里，有高校专业配置设置了【不服从调剂】。在新高考平行志愿模式下，若考生成绩被投档进校但由于高热度专业分不够且不服从调剂，将面临直接【退档】！一旦退档，该批次后续其他志愿全部失效，直接掉入专科或下一批次。
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-900 rounded-xl flex items-start gap-2.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold">安全项：全部志愿均服从专业调剂</span>
                          <span className="text-[11px] leading-relaxed opacity-90">
                            非常好，所有已选专业组均设置了服从分配调剂，有效杜绝了因专业分不达标而产生的退档滑档风险。
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Check 2: Too few list items */}
                    {draftSheet.length < 10 ? (
                      <div className="p-3 bg-amber-50 border border-amber-100 text-amber-900 rounded-xl flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold">漏洞提醒：已报专业组过少 ({draftSheet.length}/45)</span>
                          <span className="text-[11px] leading-relaxed opacity-90">
                            当前填报志愿少于 10 个，浪费了宝贵的录取志愿资源。广东省志愿表提供了多达 45 个平行专业组的机会，在可能的情况下，建议尽量报满或者报到 20 个以上，增强兜底概率。
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-900 rounded-xl flex items-start gap-2.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold">优势项：已饱满填报 ({draftSheet.length} 个志愿组)</span>
                          <span className="text-[11px] leading-relaxed opacity-90">
                            志愿数量合理充沛，这为您提供了多层次的交叉保护，极大地降低了错失录取的几率。
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Expert advice */}
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                  <h5 className="font-bold text-gray-800 mb-1">🎓 广东省报考专家特供建议：</h5>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    在广东新高考平行志愿录取中，采取的是“分数优先，遵循志愿”的原则。先排定考生成绩顺序，再对第1名、第2名等以此往后检索。
                    如果您的前序志愿未满额，就会进行投档。此时一旦被投档，您在系统中的后续44个志愿将立即失效。所以【最重要的法则】是：<strong>必须把最喜欢的、最好的学校放在最前列。</strong>
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowDeepDiagnosisModal(false)}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all cursor-pointer"
                >
                  已阅，返回修改
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Export Draft Modal */}
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div className="flex items-center gap-2">
                  <Printer className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      导出广东省高考平行志愿草稿表
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">生成符合广东省教育考试院填报要求的文本/清单</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowExportModal(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto flex flex-col gap-4 text-left text-xs">
                <p className="text-gray-600">
                  您可以直接复制下方标准的填报文案，也可一键打印，或复制在填报系统上辅助比对填报。
                </p>

                {/* Printable Format Content Box */}
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl font-mono text-[11px] text-gray-800 max-h-[280px] overflow-y-auto select-all leading-relaxed whitespace-pre-wrap">
{`【广东省2026年高考模拟平行志愿草稿表】
--------------------------------------------------
高考分数：${currentScore} 分  |  科类：${currentCategory === 'physical' ? '物理类' : '历史类'}
总志愿数：${draftSheet.length} / 45 个院校专业组
生成日期：${new Date().toLocaleDateString()}
--------------------------------------------------

` + draftSheet.map((item, index) => {
  const majorsStr = item.selectedMajors && item.selectedMajors.length > 0 
    ? item.selectedMajors.map((m, i) => `  (${i + 1}) ${m}`).join('\n')
    : '  (未设置具体专业组细项，服从调剂)';
  return `[顺序 ${String(index + 1).padStart(2, '0')}] ${item.type === '冲' ? '[冲刺]' : item.type === '稳' ? '[稳妥]' : '[保底]'}
学校：${item.university.name} (代码: ${item.university.code})
专业组：${item.majorGroup}
专业细项：\n${majorsStr}
调剂政策：${item.acceptAdjustment !== false ? '服从专业组内调剂' : '不服从调剂 (有退档高危风险)'}
--------------------------------------------------`;
}).join('\n\n')}
                </div>

                {/* Control buttons */}
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <button
                    onClick={() => {
                      const text = `【广东省2026年高考模拟平行志愿草稿表】\n高考分数：${currentScore}分\n科类：${currentCategory === 'physical' ? '物理类' : '历史类'}\n` + 
                        draftSheet.map((item, index) => `第${index + 1}志愿: ${item.university.name} - ${item.majorGroup} (服从调剂: ${item.acceptAdjustment !== false ? '是' : '否'})`).join('\n');
                      navigator.clipboard.writeText(text);
                      setCopySuccess(true);
                      setTimeout(() => setCopySuccess(false), 2000);
                    }}
                    className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copySuccess ? '复制成功！' : '复制志愿草稿文本'}
                  </button>

                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    调起系统打印 / 存为PDF
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold transition-all cursor-pointer"
                >
                  关闭
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
