import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Target, BookOpen, Plus, X, Check, Trash2, ChevronRight, Star,
  Briefcase, TrendingUp, Heart, Users, Sparkles, Compass,
  BookMarked, CheckCircle2, List, Lightbulb, Edit3, ChevronDown,
} from 'lucide-react';
import { Meta, MetaAcao, MetaCategoria, MetaStatus, Livro, LivroStatus } from '../types';

// ─── Category config ──────────────────────────────────────────────────────────
const CAT_CONFIG: Record<MetaCategoria, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  profissional: { label: 'Profissional', icon: Briefcase,   color: 'text-brand-blue',   bg: 'bg-brand-blue/10' },
  financeiro:   { label: 'Financeiro',   icon: TrendingUp,  color: 'text-emerald-600',  bg: 'bg-emerald-500/10' },
  saude:        { label: 'Saúde',        icon: Heart,       color: 'text-rose-500',     bg: 'bg-rose-500/10' },
  familia:      { label: 'Família',      icon: Users,       color: 'text-orange-500',   bg: 'bg-orange-500/10' },
  pessoal:      { label: 'Pessoal',      icon: Sparkles,    color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
  espiritual:   { label: 'Espiritual',   icon: Compass,     color: 'text-amber-500',    bg: 'bg-amber-500/10' },
};

const STATUS_CONFIG: Record<LivroStatus, { label: string; icon: React.ElementType; color: string }> = {
  lendo:    { label: 'Lendo',     icon: BookOpen,     color: 'text-brand-blue' },
  concluido:{ label: 'Concluído', icon: CheckCircle2, color: 'text-emerald-600' },
  lista:    { label: 'Na fila',   icon: BookMarked,   color: 'text-text-sec' },
};

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface VisaoViewProps {
  metas: Meta[];
  livros: Livro[];
  onAddMeta: (meta: Omit<Meta, 'id' | 'criadaEm'>) => void;
  onUpdateMeta: (id: string, changes: Partial<Meta>) => void;
  onDeleteMeta: (id: string) => void;
  onToggleMetaAcao: (metaId: string, acaoId: string) => void;
  onAddLivro: (livro: Omit<Livro, 'id'>) => void;
  onUpdateLivro: (id: string, changes: Partial<Livro>) => void;
  onDeleteLivro: (id: string) => void;
  onAddInsight: (livroId: string, insight: string) => void;
  onRemoveInsight: (livroId: string, idx: number) => void;
}

// ─── Meta form types ──────────────────────────────────────────────────────────
type MetaForm = {
  titulo: string; categoria: MetaCategoria; prazo: string;
  descricao: string; visao: string;
  acoes: string[];
};

const emptyMetaForm = (): MetaForm => ({
  titulo: '', categoria: 'pessoal', prazo: '', descricao: '', visao: '', acoes: ['', '', ''],
});

type LivroForm = {
  titulo: string; autor: string; status: LivroStatus;
  totalPaginas: string; paginaAtual: string; dataInicio: string;
};

const emptyLivroForm = (): LivroForm => ({
  titulo: '', autor: '', status: 'lendo', totalPaginas: '', paginaAtual: '', dataInicio: new Date().toISOString().slice(0, 10),
});

// ─── Component ────────────────────────────────────────────────────────────────
export default function VisaoView({
  metas, livros,
  onAddMeta, onUpdateMeta, onDeleteMeta, onToggleMetaAcao,
  onAddLivro, onUpdateLivro, onDeleteLivro, onAddInsight, onRemoveInsight,
}: VisaoViewProps) {
  const [subTab, setSubTab] = useState<'metas' | 'leituras'>('metas');

  // Meta form
  const [showMetaForm, setShowMetaForm] = useState(false);
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null);
  const [metaForm, setMetaForm] = useState<MetaForm>(emptyMetaForm());

  // Livro form
  const [showLivroForm, setShowLivroForm] = useState(false);
  const [editingLivro, setEditingLivro] = useState<Livro | null>(null);
  const [livroForm, setLivroForm] = useState<LivroForm>(emptyLivroForm());

  // Insight input per book
  const [insightInputs, setInsightInputs] = useState<Record<string, string>>({});
  const [expandedLivro, setExpandedLivro] = useState<string | null>(null);

  // Meta detail expand
  const [expandedMeta, setExpandedMeta] = useState<string | null>(null);

  // ── Meta handlers ──────────────────────────────────────────────────────────
  const openAddMeta = () => { setEditingMeta(null); setMetaForm(emptyMetaForm()); setShowMetaForm(true); };
  const openEditMeta = (m: Meta) => {
    setEditingMeta(m);
    setMetaForm({
      titulo: m.titulo, categoria: m.categoria, prazo: m.prazo,
      descricao: m.descricao || '', visao: m.visao || '',
      acoes: [...m.acoes.map(a => a.texto), '', '', ''].slice(0, 3),
    });
    setShowMetaForm(true);
  };

  const handleSaveMeta = () => {
    if (!metaForm.titulo.trim() || !metaForm.prazo) return;
    const acoes: MetaAcao[] = metaForm.acoes
      .filter(t => t.trim())
      .map((t, i) => ({
        id: editingMeta ? (editingMeta.acoes[i]?.id || `acao_${Date.now()}_${i}`) : `acao_${Date.now()}_${i}`,
        texto: t.trim(),
        concluida: editingMeta ? (editingMeta.acoes[i]?.concluida || false) : false,
      }));

    if (editingMeta) {
      onUpdateMeta(editingMeta.id, { titulo: metaForm.titulo.trim(), categoria: metaForm.categoria, prazo: metaForm.prazo, descricao: metaForm.descricao || undefined, visao: metaForm.visao || undefined, acoes });
    } else {
      onAddMeta({ titulo: metaForm.titulo.trim(), categoria: metaForm.categoria, prazo: metaForm.prazo, descricao: metaForm.descricao || undefined, visao: metaForm.visao || undefined, acoes, status: 'ativa' });
    }
    setShowMetaForm(false);
  };

  // ── Livro handlers ─────────────────────────────────────────────────────────
  const openAddLivro = () => { setEditingLivro(null); setLivroForm(emptyLivroForm()); setShowLivroForm(true); };
  const openEditLivro = (l: Livro) => {
    setEditingLivro(l);
    setLivroForm({
      titulo: l.titulo, autor: l.autor, status: l.status,
      totalPaginas: l.totalPaginas?.toString() || '',
      paginaAtual: l.paginaAtual?.toString() || '',
      dataInicio: l.dataInicio || new Date().toISOString().slice(0, 10),
    });
    setShowLivroForm(true);
  };

  const handleSaveLivro = () => {
    if (!livroForm.titulo.trim() || !livroForm.autor.trim()) return;
    const data: Omit<Livro, 'id'> = {
      titulo: livroForm.titulo.trim(),
      autor: livroForm.autor.trim(),
      status: livroForm.status,
      totalPaginas: livroForm.totalPaginas ? parseInt(livroForm.totalPaginas) : undefined,
      paginaAtual: livroForm.paginaAtual ? parseInt(livroForm.paginaAtual) : undefined,
      dataInicio: livroForm.dataInicio || undefined,
      insights: editingLivro?.insights || [],
      avaliacao: editingLivro?.avaliacao,
    };
    if (editingLivro) { onUpdateLivro(editingLivro.id, data); }
    else { onAddLivro(data); }
    setShowLivroForm(false);
  };

  const handleAddInsight = (livroId: string) => {
    const text = (insightInputs[livroId] || '').trim();
    if (!text) return;
    onAddInsight(livroId, text);
    setInsightInputs(prev => ({ ...prev, [livroId]: '' }));
  };

  // ── Sorted data ────────────────────────────────────────────────────────────
  const metasAtivas = metas.filter(m => m.status === 'ativa').sort((a, b) => a.prazo.localeCompare(b.prazo));
  const metasConcluidas = metas.filter(m => m.status === 'concluida');
  const livrosLendo = livros.filter(l => l.status === 'lendo');
  const livrosConcluidos = livros.filter(l => l.status === 'concluido');
  const livrosLista = livros.filter(l => l.status === 'lista');

  return (
    <div className="space-y-5 pb-28 text-text-main font-sans">

      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-2xl font-display font-black text-text-main">Visão & Crescimento</h2>
          <p className="text-xs text-text-sec font-medium mt-0.5">{metasAtivas.length} meta{metasAtivas.length !== 1 ? 's' : ''} ativa{metasAtivas.length !== 1 ? 's' : ''} · {livrosLendo.length} lendo agora</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2">
        {(['metas', 'leituras'] as const).map(t => (
          <button
            key={t}
            onClick={() => setSubTab(t)}
            className={`flex-1 h-10 rounded-2xl text-sm font-bold transition-all ${
              subTab === t ? 'bg-brand-blue text-white shadow-md' : 'bg-white/40 border border-white/50 text-text-sec'
            }`}
          >
            {t === 'metas' ? (
              <span className="flex items-center justify-center gap-2"><Target className="w-4 h-4" />Metas</span>
            ) : (
              <span className="flex items-center justify-center gap-2"><BookOpen className="w-4 h-4" />Leituras</span>
            )}
          </button>
        ))}
      </div>

      {/* ── METAS ──────────────────────────────────────────────────────────── */}
      {subTab === 'metas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-text-sec uppercase tracking-widest">Metas Ativas</span>
            <button
              onClick={openAddMeta}
              className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-brand-blue text-white text-xs font-bold active:scale-95 transition-transform shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Nova Meta
            </button>
          </div>

          {metasAtivas.length === 0 && (
            <div className="glass-panel rounded-3xl p-8 text-center space-y-3">
              <Target className="w-10 h-10 text-text-sec mx-auto opacity-40" />
              <p className="text-sm font-bold text-text-sec">Nenhuma meta ativa ainda.</p>
              <p className="text-xs text-text-sec opacity-70">Onde você quer estar em 3, 6, 12 meses?</p>
              <button onClick={openAddMeta} className="mx-auto flex items-center gap-2 h-10 px-5 rounded-2xl bg-brand-blue text-white text-sm font-bold active:scale-95 transition-transform">
                <Plus className="w-4 h-4" /> Criar primeira meta
              </button>
            </div>
          )}

          <div className="space-y-3">
            {metasAtivas.map(meta => {
              const cat = CAT_CONFIG[meta.categoria];
              const CatIcon = cat.icon;
              const days = daysUntil(meta.prazo);
              const acoesFeitas = meta.acoes.filter(a => a.concluida).length;
              const isExpanded = expandedMeta === meta.id;
              return (
                <div key={meta.id} className="glass-panel rounded-3xl overflow-hidden">
                  <button
                    className="w-full p-5 text-left"
                    onClick={() => setExpandedMeta(isExpanded ? null : meta.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-2xl ${cat.bg} flex items-center justify-center shrink-0`}>
                        <CatIcon className={`w-5 h-5 ${cat.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-text-main leading-tight">{meta.titulo}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${cat.color}`}>{cat.label}</span>
                          <span className={`text-[10px] font-bold ${days < 30 ? 'text-rose-500' : days < 90 ? 'text-amber-500' : 'text-text-sec'}`}>
                            {days > 0 ? `${days} dias` : 'Vencida'}
                          </span>
                          <span className="text-[10px] text-text-sec">{formatDate(meta.prazo)}</span>
                        </div>
                        {meta.acoes.length > 0 && (
                          <div className="flex gap-1.5 mt-2">
                            {meta.acoes.map(a => (
                              <div key={a.id} className={`h-1.5 flex-1 rounded-full ${a.concluida ? 'bg-brand-blue' : 'bg-white/40 border border-white/50'}`} />
                            ))}
                          </div>
                        )}
                      </div>
                      <ChevronDown className={`w-4 h-4 text-text-sec shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 space-y-4 border-t border-white/20 pt-4">
                          {/* Visão (affirmation) */}
                          {meta.visao && (
                            <div className="bg-brand-blue/8 rounded-2xl p-4 border border-brand-blue/15">
                              <p className="text-[10px] font-bold text-brand-blue uppercase tracking-wider mb-1">Minha Visão</p>
                              <p className="text-sm font-bold text-text-main italic">"{meta.visao}"</p>
                            </div>
                          )}

                          {/* Description */}
                          {meta.descricao && (
                            <p className="text-sm text-text-sec font-medium leading-relaxed">{meta.descricao}</p>
                          )}

                          {/* BIG 3 Actions */}
                          {meta.acoes.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-[10px] font-bold text-text-sec uppercase tracking-wider">BIG 3 Ações</p>
                              {meta.acoes.map((acao, i) => (
                                <button
                                  key={acao.id}
                                  onClick={() => onToggleMetaAcao(meta.id, acao.id)}
                                  className="w-full flex items-center gap-3 p-3 bg-white/30 rounded-2xl border border-white/40 active:scale-[.98] transition-transform text-left"
                                >
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${acao.concluida ? 'bg-brand-blue border-brand-blue' : 'border-gray-300'}`}>
                                    {acao.concluida && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                                  </div>
                                  <span className={`text-sm font-semibold flex-1 ${acao.concluida ? 'line-through text-text-sec' : 'text-text-main'}`}>
                                    {i + 1}. {acao.texto}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => onUpdateMeta(meta.id, { status: 'concluida' })}
                              className="flex-1 h-10 rounded-2xl bg-emerald-500/15 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Concluída!
                            </button>
                            <button
                              onClick={() => openEditMeta(meta)}
                              className="h-10 px-4 rounded-2xl bg-white/40 border border-white/50 text-text-sec font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-transform"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Editar
                            </button>
                            <button
                              onClick={() => onDeleteMeta(meta.id)}
                              className="h-10 w-10 rounded-2xl bg-red-50 text-red-400 flex items-center justify-center active:scale-95 transition-transform"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Concluídas */}
          {metasConcluidas.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-text-sec uppercase tracking-widest px-1">Concluídas</p>
              {metasConcluidas.map(meta => {
                const cat = CAT_CONFIG[meta.categoria];
                const CatIcon = cat.icon;
                return (
                  <div key={meta.id} className="flex items-center gap-3 p-4 bg-white/20 border border-white/30 rounded-2xl opacity-60">
                    <div className={`w-8 h-8 rounded-xl ${cat.bg} flex items-center justify-center shrink-0`}>
                      <CatIcon className={`w-4 h-4 ${cat.color}`} />
                    </div>
                    <p className="text-sm font-bold text-text-sec line-through flex-1">{meta.titulo}</p>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── LEITURAS ───────────────────────────────────────────────────────── */}
      {subTab === 'leituras' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-text-sec uppercase tracking-widest">
              {livros.length} livro{livros.length !== 1 ? 's' : ''} · {livrosConcluidos.length} concluído{livrosConcluidos.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={openAddLivro}
              className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-brand-blue text-white text-xs font-bold active:scale-95 transition-transform shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar
            </button>
          </div>

          {/* Lendo agora */}
          {livrosLendo.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest px-1">Lendo agora</p>
              {livrosLendo.map(livro => <LivroCard key={livro.id} livro={livro} expanded={expandedLivro === livro.id} onToggle={() => setExpandedLivro(expandedLivro === livro.id ? null : livro.id)} onEdit={() => openEditLivro(livro)} onDelete={() => onDeleteLivro(livro.id)} insightInput={insightInputs[livro.id] || ''} onInsightChange={v => setInsightInputs(p => ({ ...p, [livro.id]: v }))} onAddInsight={() => handleAddInsight(livro.id)} onRemoveInsight={idx => onRemoveInsight(livro.id, idx)} onUpdateStatus={s => onUpdateLivro(livro.id, { status: s })} />)}
            </div>
          )}

          {/* Na fila */}
          {livrosLista.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-text-sec uppercase tracking-widest px-1">Na fila</p>
              {livrosLista.map(livro => <LivroCard key={livro.id} livro={livro} expanded={expandedLivro === livro.id} onToggle={() => setExpandedLivro(expandedLivro === livro.id ? null : livro.id)} onEdit={() => openEditLivro(livro)} onDelete={() => onDeleteLivro(livro.id)} insightInput={insightInputs[livro.id] || ''} onInsightChange={v => setInsightInputs(p => ({ ...p, [livro.id]: v }))} onAddInsight={() => handleAddInsight(livro.id)} onRemoveInsight={idx => onRemoveInsight(livro.id, idx)} onUpdateStatus={s => onUpdateLivro(livro.id, { status: s })} />)}
            </div>
          )}

          {/* Concluídos */}
          {livrosConcluidos.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-text-sec uppercase tracking-widest px-1">Concluídos</p>
              {livrosConcluidos.map(livro => <LivroCard key={livro.id} livro={livro} expanded={expandedLivro === livro.id} onToggle={() => setExpandedLivro(expandedLivro === livro.id ? null : livro.id)} onEdit={() => openEditLivro(livro)} onDelete={() => onDeleteLivro(livro.id)} insightInput={insightInputs[livro.id] || ''} onInsightChange={v => setInsightInputs(p => ({ ...p, [livro.id]: v }))} onAddInsight={() => handleAddInsight(livro.id)} onRemoveInsight={idx => onRemoveInsight(livro.id, idx)} onUpdateStatus={s => onUpdateLivro(livro.id, { status: s })} />)}
            </div>
          )}

          {livros.length === 0 && (
            <div className="glass-panel rounded-3xl p-8 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-text-sec mx-auto opacity-40" />
              <p className="text-sm font-bold text-text-sec">Nenhum livro ainda.</p>
              <button onClick={openAddLivro} className="mx-auto flex items-center gap-2 h-10 px-5 rounded-2xl bg-brand-blue text-white text-sm font-bold active:scale-95 transition-transform">
                <Plus className="w-4 h-4" /> Adicionar livro
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── META FORM MODAL ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showMetaForm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => { if (e.target === e.currentTarget) setShowMetaForm(false); }}
          >
            <motion.div
              className="w-full max-w-lg bg-white rounded-t-[32px] pb-8 shadow-2xl flex flex-col max-h-[92dvh]"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            >
              <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
                <h3 className="text-lg font-display font-black text-gray-900">{editingMeta ? 'Editar Meta' : 'Nova Meta'}</h3>
                <button onClick={() => setShowMetaForm(false)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:scale-90 transition-transform">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 px-6 space-y-4">
                <input type="text" placeholder="Qual é sua meta? *" value={metaForm.titulo} onChange={e => setMetaForm(f => ({ ...f, titulo: e.target.value }))}
                  className="w-full h-12 bg-gray-50 border border-gray-200 rounded-2xl px-4 text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue" autoFocus />

                {/* Category */}
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(CAT_CONFIG) as MetaCategoria[]).map(cat => {
                    const c = CAT_CONFIG[cat];
                    const Icon = c.icon;
                    return (
                      <button key={cat} onClick={() => setMetaForm(f => ({ ...f, categoria: cat }))}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl border text-xs font-bold transition-all ${metaForm.categoria === cat ? `${c.bg} ${c.color} border-current` : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                        <Icon className="w-4 h-4" />
                        {c.label}
                      </button>
                    );
                  })}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1 pl-1">Prazo *</label>
                  <input type="date" value={metaForm.prazo} onChange={e => setMetaForm(f => ({ ...f, prazo: e.target.value }))}
                    className="w-full h-12 bg-gray-50 border border-gray-200 rounded-2xl px-4 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue" />
                </div>

                <textarea placeholder='Visualização: "Eu sou / Eu vivo / Eu tenho..." — escreva como se já fosse realidade' value={metaForm.visao} onChange={e => setMetaForm(f => ({ ...f, visao: e.target.value }))} rows={2}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none" />

                <textarea placeholder="Descrição (opcional)" value={metaForm.descricao} onChange={e => setMetaForm(f => ({ ...f, descricao: e.target.value }))} rows={2}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none" />

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block pl-1">BIG 3 — as 3 ações que vão fazer essa meta acontecer</label>
                  {metaForm.acoes.map((a, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-brand-blue text-white text-[10px] font-black flex items-center justify-center shrink-0">{i + 1}</span>
                      <input type="text" placeholder={`Ação ${i + 1}${i === 0 ? ' *' : ' (opcional)'}`} value={a}
                        onChange={e => setMetaForm(f => ({ ...f, acoes: f.acoes.map((x, j) => j === i ? e.target.value : x) }))}
                        className="flex-1 h-11 bg-gray-50 border border-gray-200 rounded-xl px-3 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-6 pt-4 shrink-0">
                <button onClick={handleSaveMeta} disabled={!metaForm.titulo.trim() || !metaForm.prazo}
                  className="w-full h-12 rounded-2xl bg-brand-blue text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 shadow-md">
                  <Check className="w-4 h-4" strokeWidth={3} /> {editingMeta ? 'Salvar Meta' : 'Criar Meta'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LIVRO FORM MODAL ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {showLivroForm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => { if (e.target === e.currentTarget) setShowLivroForm(false); }}
          >
            <motion.div
              className="w-full max-w-lg bg-white rounded-t-[32px] pb-8 shadow-2xl flex flex-col max-h-[85dvh]"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            >
              <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
                <h3 className="text-lg font-display font-black text-gray-900">{editingLivro ? 'Editar Livro' : 'Adicionar Livro'}</h3>
                <button onClick={() => setShowLivroForm(false)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:scale-90 transition-transform">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 px-6 space-y-3">
                <input type="text" placeholder="Título do livro *" value={livroForm.titulo} onChange={e => setLivroForm(f => ({ ...f, titulo: e.target.value }))} autoFocus
                  className="w-full h-12 bg-gray-50 border border-gray-200 rounded-2xl px-4 text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue" />
                <input type="text" placeholder="Autor *" value={livroForm.autor} onChange={e => setLivroForm(f => ({ ...f, autor: e.target.value }))}
                  className="w-full h-12 bg-gray-50 border border-gray-200 rounded-2xl px-4 text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue" />

                <div className="flex gap-2">
                  {(['lendo', 'lista', 'concluido'] as LivroStatus[]).map(s => {
                    const sc = STATUS_CONFIG[s];
                    const Icon = sc.icon;
                    return (
                      <button key={s} onClick={() => setLivroForm(f => ({ ...f, status: s }))}
                        className={`flex-1 h-10 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${livroForm.status === s ? `bg-brand-blue text-white border-brand-blue` : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                        <Icon className="w-3.5 h-3.5" />{sc.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1 pl-1">Total de páginas</label>
                    <input type="number" placeholder="ex: 280" value={livroForm.totalPaginas} onChange={e => setLivroForm(f => ({ ...f, totalPaginas: e.target.value }))}
                      className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-3 text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue" />
                  </div>
                  {livroForm.status === 'lendo' && (
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1 pl-1">Página atual</label>
                      <input type="number" placeholder="ex: 120" value={livroForm.paginaAtual} onChange={e => setLivroForm(f => ({ ...f, paginaAtual: e.target.value }))}
                        className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-3 text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue" />
                    </div>
                  )}
                </div>

                {editingLivro && (
                  <button onClick={() => onDeleteLivro(editingLivro.id)} className="w-full h-10 rounded-2xl bg-red-50 text-red-500 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
                    <Trash2 className="w-4 h-4" /> Remover livro
                  </button>
                )}
              </div>

              <div className="px-6 pt-4 shrink-0">
                <button onClick={handleSaveLivro} disabled={!livroForm.titulo.trim() || !livroForm.autor.trim()}
                  className="w-full h-12 rounded-2xl bg-brand-blue text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 shadow-md">
                  <Check className="w-4 h-4" strokeWidth={3} /> {editingLivro ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Livro Card ───────────────────────────────────────────────────────────────
interface LivroCardProps {
  livro: Livro;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  insightInput: string;
  onInsightChange: (v: string) => void;
  onAddInsight: () => void;
  onRemoveInsight: (idx: number) => void;
  onUpdateStatus: (s: LivroStatus) => void;
}

function LivroCard({ livro, expanded, onToggle, onEdit, onDelete, insightInput, onInsightChange, onAddInsight, onRemoveInsight, onUpdateStatus }: LivroCardProps) {
  const sc = STATUS_CONFIG[livro.status];
  const StatusIcon = sc.icon;
  const progress = livro.totalPaginas && livro.paginaAtual ? Math.round((livro.paginaAtual / livro.totalPaginas) * 100) : null;

  return (
    <div className="glass-panel rounded-3xl overflow-hidden">
      <button className="w-full p-5 text-left" onClick={onToggle}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-2xl bg-white/50 border border-white/50 flex items-center justify-center shrink-0`}>
            <StatusIcon className={`w-5 h-5 ${sc.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-text-main leading-tight">{livro.titulo}</p>
            <p className="text-xs text-text-sec mt-0.5">{livro.autor}</p>
            {progress !== null && (
              <div className="mt-2 space-y-1">
                <div className="h-1.5 w-full bg-white/40 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-blue rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-[10px] text-text-sec font-bold">{livro.paginaAtual}/{livro.totalPaginas} páginas — {progress}%</p>
              </div>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 text-text-sec shrink-0 mt-1 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-white/20 pt-4">
              {/* Quick status change */}
              {livro.status === 'lista' && (
                <button onClick={() => onUpdateStatus('lendo')} className="w-full h-10 rounded-2xl bg-brand-blue/10 text-brand-blue font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform">
                  <BookOpen className="w-3.5 h-3.5" /> Comecei a ler
                </button>
              )}
              {livro.status === 'lendo' && (
                <button onClick={() => onUpdateStatus('concluido')} className="w-full h-10 rounded-2xl bg-emerald-500/10 text-emerald-700 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Terminei de ler!
                </button>
              )}

              {/* Insights */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-text-sec uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-3 h-3 text-amber-500" /> Insights ({livro.insights.length})
                </p>
                {livro.insights.map((ins, i) => (
                  <div key={i} className="flex items-start gap-2 bg-amber-500/8 border border-amber-500/20 rounded-xl p-3">
                    <p className="text-xs font-medium text-text-main flex-1 leading-relaxed">"{ins}"</p>
                    <button onClick={() => onRemoveInsight(i)} className="w-5 h-5 rounded-full flex items-center justify-center text-text-sec hover:text-red-400 shrink-0 active:scale-90 transition-transform mt-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text" placeholder="Adicionar insight..." value={insightInput}
                    onChange={e => onInsightChange(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && onAddInsight()}
                    className="flex-1 h-10 bg-white/40 border border-white/50 rounded-xl px-3 text-sm font-medium text-text-main placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-blue"
                  />
                  <button onClick={onAddInsight} disabled={!insightInput.trim()} className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40 shrink-0">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={onEdit} className="flex-1 h-9 rounded-xl bg-white/40 border border-white/50 text-text-sec font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform">
                  <Edit3 className="w-3.5 h-3.5" /> Editar
                </button>
                <button onClick={onDelete} className="h-9 w-9 rounded-xl bg-red-50 text-red-400 flex items-center justify-center active:scale-95 transition-transform">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
