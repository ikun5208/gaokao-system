import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, HelpCircle, ChevronDown, CheckCircle2, ChevronUp } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

export default function Guidebook() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: "什么是广东省新高考‘院校专业组’？",
      answer: (
        <div className="space-y-2">
          <p>“院校专业组”是新高考投档录取的基本单位。一所学校会将招生专业划分为一个或多个“专业组”，每个专业组有明确的首选科目和再选科目要求。</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>普通组：</strong>通常要求物理或历史不限。</li>
            <li><strong>特定组：</strong>如化学必选组、生物必选组，只有选考了对应科目的考生才能报考。</li>
            <li>考生在填报时，不仅要填院校，还要具体选择某一个专业组（例如：<em>“深圳大学03专业组”</em>）。</li>
          </ul>
        </div>
      )
    },
    {
      question: "45个平行志愿的录取规则是怎样的？",
      answer: (
        <div className="space-y-2">
          <p>广东省高考普通类本科实行<strong>“分数优先、遵循志愿”</strong>的平行志愿投档模式：</p>
          <ol className="list-decimal pl-4 space-y-1">
            <li><strong>分数优先：</strong>全省考生成绩按从高到低进行绝对排位检索，排位第一的考生检索完毕后，才检索下一排位的考生。</li>
            <li><strong>遵循志愿：</strong>当检索到某位考生时，系统会从该考生填报的第1个志愿开始依次匹配。一旦第1个志愿学校仍有剩余名额，即投档到该志愿，后续第2至第45个志愿直接失效。</li>
            <li>平行志愿实行<strong>“一次投档”</strong>，一旦考生的档案被某一志愿专业组提档，其在当批次中的检索即告结束。</li>
          </ol>
        </div>
      )
    },
    {
      question: "什么是‘滑档’和‘退档’？如何合理设计梯度避免？",
      answer: (
        <div className="space-y-2">
          <p>这是填报中家长最容易混淆的两个极高风险概念：</p>
          <ul className="list-disc pl-4 space-y-2">
            <li><strong>滑档：</strong>考生由于填报过高，全省排位未达到填报的所有45个专业组的最低投档线，导致档案<strong>未能投出</strong>。避免方法是志愿后段必须有充足的“保底”学校。</li>
            <li><strong>退档：</strong>考生的排位达到了某专业组最低线并成功被提档，但由于所选专业分数太高未能录取，且<strong>没有选择“专业服从调剂”</strong>，导致被高校<strong>退回档案</strong>。由于平行志愿一轮只投一次，一旦退档将直接落入下个批次或征集志愿，后果极其严重！</li>
            <li><strong>核心对策：</strong>建议考生一定要勾选“服从专业调剂”选项，且平行志愿列表后部保留 5-8 个稳妥兜底志愿。</li>
          </ul>
        </div>
      )
    },
    {
      question: "‘专业服从调剂’会把我调剂到其他学校吗？",
      answer: (
        <p>绝对不会。调剂仅在您所报考的<strong>同一个院校专业组内部</strong>进行。您绝对不会被调剂到该校的其他专业组，更不会被调剂到其他学校。因此，在填报特定专业组时，考生可以通过研究该组包含的所有专业，来判断自己是否能接受最冷门的专业，从而决定是否勾选调剂。</p>
      )
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-5" id="guidebook_module">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          广东省新高考政策指南
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          权威梳理广东“3+1+2”高考填报重点知识，为您的志愿决策保驾护航。
        </p>
      </div>

      {/* Policy highlights cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <span>首选科目约束</span>
          </div>
          <p className="text-xs text-gray-600 leading-normal">
            物理和历史属于首选，决定了投档排位体系。投档时物理类和历史类分别排队，名额互不交叉。
          </p>
        </div>
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <span>再选选考组合</span>
          </div>
          <p className="text-xs text-gray-600 leading-normal">
            化学、生物、政治、地理作为再选科目。高校针对专业组会有限定选考设置，如果不符则无法投档。
          </p>
        </div>
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <span>45个平行梯度</span>
          </div>
          <p className="text-xs text-gray-600 leading-normal">
            可填45个平行组。建议前15个冲刺（冲），中20个稳健稳扎（稳），后10个防守兜底（保）。
          </p>
        </div>
      </div>

      {/* FAQs list accordion */}
      <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 mb-2">
          <HelpCircle className="w-4.5 h-4.5 text-gray-500" />
          常见报考核心疑问
        </h3>
        
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div 
              key={idx} 
              className={`border border-gray-100 rounded-xl transition-all overflow-hidden ${
                isOpen ? 'bg-indigo-50/20 border-indigo-100/60' : 'bg-white hover:bg-gray-50/50'
              }`}
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full text-left px-5 py-4 flex justify-between items-center gap-4 focus:outline-none"
              >
                <span className="text-sm font-semibold text-gray-800">
                  {faq.question}
                </span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-indigo-600 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                )}
              </button>
              
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-5 pb-5 pt-1 text-xs text-gray-600 leading-relaxed border-t border-indigo-100/20">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
