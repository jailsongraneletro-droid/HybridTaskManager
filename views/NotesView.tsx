import React, { useState, useRef, useEffect } from 'react';
import { BoardData, Note } from '../types';
import { useLanguage } from '../utils/i18n';
import { 
  Palette, Trash2, X, Plus, Bold, Italic, Underline, List as ListIcon, 
  ListOrdered, Heading1, Heading2, AlertCircle, LayoutGrid, Rows3, RefreshCw, Type 
} from 'lucide-react';
import { DataService } from '../services/dataService';
import { ConfirmationModal } from '../components/Shared';

interface NotesViewProps {
  data: BoardData;
  onUpdate: () => void;
}

const NOTE_COLORS = [
  { id: 'white', bg: '#ffffff', darkBg: '#0f172a', border: '#e2e8f0', darkBorder: '#1e293b', accent: '#94a3b8' },
  { id: 'red', bg: '#fee2e2', darkBg: '#450a0a', border: '#fecaca', darkBorder: '#7f1d1d', accent: '#ef4444' },
  { id: 'orange', bg: '#ffedd5', darkBg: '#431407', border: '#fed7aa', darkBorder: '#7c2d12', accent: '#f97316' },
  { id: 'yellow', bg: '#fef9c3', darkBg: '#422006', border: '#fde047', darkBorder: '#713f12', accent: '#eab308' },
  { id: 'green', bg: '#dcfce7', darkBg: '#064e3b', border: '#bbf7d0', darkBorder: '#065f46', accent: '#22c55e' },
  { id: 'teal', bg: '#ccfbf1', darkBg: '#134e4a', border: '#99f6e4', darkBorder: '#115e59', accent: '#14b8a6' },
  { id: 'blue', bg: '#dbeafe', darkBg: '#172554', border: '#bfdbfe', darkBorder: '#1e3a8a', accent: '#3b82f6' },
  { id: 'darkblue', bg: '#e0e7ff', darkBg: '#1e1b4b', border: '#c7d2fe', darkBorder: '#312e81', accent: '#6366f1' },
  { id: 'purple', bg: '#f3e8ff', darkBg: '#2e1065', border: '#e9d5ff', darkBorder: '#4c1d95', accent: '#a855f7' },
  { id: 'pink', bg: '#fce7f3', darkBg: '#500724', border: '#fbcfe8', darkBorder: '#700733', accent: '#ec4899' },
  { id: 'brown', bg: '#f5f5f4', darkBg: '#1c1917', border: '#e7e5e4', darkBorder: '#292524', accent: '#78350f' },
  { id: 'gray', bg: '#f1f5f9', darkBg: '#020617', border: '#cbd5e1', darkBorder: '#0f172a', accent: '#64748b' },
];

const RICH_TEXT_STYLES = "outline-none min-h-[120px] text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words px-2 [&_h1]:text-2xl [&_h1]:font-black [&_h1]:mb-4 [&_h1]:mt-2 [&_h1]:text-slate-900 dark:[&_h1]:text-white [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-2 [&_h2]:text-slate-800 dark:[&_h2]:text-slate-100 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1 [&_p]:mb-3 [&_strong]:font-black empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 dark:empty:before:text-slate-600";

export const NotesView: React.FC<NotesViewProps> = ({ data, onUpdate }) => {
  const { t } = useLanguage();
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newColor, setNewColor] = useState(NOTE_COLORS[0].bg);
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                setIsDarkMode(document.documentElement.classList.contains('dark'));
            }
        });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (isCreating && !newTitle.trim() && !newContent.replace(/<[^>]*>/g, '').trim()) {
           setIsCreating(false);
        }
      }
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCreating, newTitle, newContent]);

  const handleSaveNew = async () => {
    const strippedContent = newContent.replace(/<[^>]*>/g, '').trim();
    if (newTitle.trim() || strippedContent) {
       setError(null);
       try {
           await DataService.addNote({ title: newTitle, content: newContent, color: newColor });
           onUpdate();
           setIsCreating(false);
           setNewTitle('');
           setNewContent('');
           setNewColor(NOTE_COLORS[0].bg);
       } catch (e: any) { 
           console.error(e);
           setError(e.message || "Erro ao salvar nota."); 
       }
    } else { setIsCreating(false); }
  };

  const handleUpdate = async (note: Note, updates: Partial<Note>) => {
      setError(null);
      try {
          await DataService.updateNote({ ...note, ...updates });
          onUpdate();
      } catch (e: any) { setError(e.message); }
  };

  const getThemeColor = (colorBg: string) => {
      const colorObj = NOTE_COLORS.find(c => c.bg === colorBg) || NOTE_COLORS[0];
      return isDarkMode ? colorObj.darkBg : colorBg;
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6 px-2">
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner w-full md:w-auto">
          <button onClick={() => setLayoutMode('grid')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${layoutMode === 'grid' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-lg' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            <LayoutGrid size={15} /> {t('grid')}
          </button>
          <button onClick={() => setLayoutMode('list')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${layoutMode === 'list' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-lg' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            <Rows3 size={15} /> {t('list')}
          </button>
        </div>

        <div ref={containerRef} className={`w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 transition-all duration-500 relative overflow-hidden ${isCreating ? 'shadow-2xl ring-4 ring-indigo-500/10 z-50' : 'cursor-text hover:shadow-md'}`} style={{ backgroundColor: isCreating ? getThemeColor(newColor) : undefined }}>
            {!isCreating ? (
                <div onClick={() => setIsCreating(true)} className="p-5 px-8 text-slate-500 dark:text-slate-400 font-bold flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest font-black">{t('takeANote')}</span>
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-indigo-600"><Plus size={22} /></div>
                </div>
            ) : (
                <div className="flex flex-col">
                    <input type="text" placeholder={t('noteTitle')} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-transparent px-8 pt-8 pb-3 outline-none font-black text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-2xl" autoFocus />
                    <div className="relative px-6 py-3 overflow-hidden min-h-[160px]">
                        <RichTextEditor content={newContent} onChange={setNewContent} placeholder={t('noteContent')} />
                    </div>
                    <div className="flex justify-between items-center px-6 py-4 border-t border-black/5 dark:border-white/10 mt-4 bg-black/[0.02] dark:bg-white/[0.01]">
                        <div className="flex items-center gap-1.5 relative" ref={colorPickerRef}>
                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowColorPicker(!showColorPicker); }} className="p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl text-slate-700 dark:text-slate-300 transition-all">
                                <Palette size={22} />
                            </button>
                            {showColorPicker && (
                                <div className="absolute bottom-full left-0 mb-4 bg-white dark:bg-slate-900 p-3 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 grid grid-cols-4 gap-3 z-[110] w-64 animate-in zoom-in-95 slide-in-from-bottom-2 duration-200 ring-1 ring-black/5">
                                    {NOTE_COLORS.map(c => (
                                        <button 
                                          key={c.id} 
                                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setNewColor(c.bg); setShowColorPicker(false); }} 
                                          className={`w-11 h-11 rounded-xl border-2 hover:scale-110 transition-all ${newColor === c.bg ? 'border-indigo-600 shadow-xl' : 'border-transparent opacity-80 hover:opacity-100'}`} 
                                          style={{ backgroundColor: isDarkMode ? c.darkBg : c.bg, borderColor: newColor === c.bg ? undefined : 'transparent' }} 
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => { setIsCreating(false); setNewTitle(''); setNewContent(''); }} className="px-6 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-[11px] font-black uppercase tracking-widest transition-all">{t('cancel')}</button>
                            <button onClick={handleSaveNew} className="px-10 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 font-black rounded-2xl text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-200 dark:shadow-none active:scale-95 glow-effect">{t('save')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        <div className="w-[120px] hidden md:block"></div>
      </div>

      {error && (
        <div className="max-w-2xl mx-auto mb-10 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 p-5 rounded-[2rem] text-red-600 dark:text-red-400 flex flex-col gap-2 relative shadow-lg animate-in shake ring-1 ring-red-500/10">
            <div className="flex items-start gap-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl"><AlertCircle size={20} className="shrink-0" /></div>
                <div className="text-sm font-bold whitespace-pre-line leading-relaxed pt-1.5">{error}</div>
            </div>
            <button onClick={() => setError(null)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-100 transition-all"><X size={18} /></button>
        </div>
      )}

      {layoutMode === 'grid' ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 px-4 md:px-6">
              {data.notes.map(note => ( <NoteCard key={note.id} note={note} onDelete={(id) => setNoteToDelete(id)} onUpdate={handleUpdate} t={t} isList={false} isDarkMode={isDarkMode} /> ))}
          </div>
      ) : (
          <div className="flex flex-col gap-6 max-w-4xl mx-auto px-4 md:px-6">
              {data.notes.map(note => ( <NoteCard key={note.id} note={note} onDelete={(id) => setNoteToDelete(id)} onUpdate={handleUpdate} t={t} isList={true} isDarkMode={isDarkMode} /> ))}
          </div>
      )}
      
      <ConfirmationModal isOpen={!!noteToDelete} onClose={() => setNoteToDelete(null)} onConfirm={async () => { if (noteToDelete) { await DataService.deleteNote(noteToDelete); onUpdate(); setNoteToDelete(null); } }} title="Excluir Nota" message={t('deleteNoteConfirm')} />
    </div>
  );
};

const RichTextEditor: React.FC<{ content: string; onChange: (html: string) => void; placeholder: string; }> = ({ content, onChange, placeholder }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    useEffect(() => { if (editorRef.current && content !== editorRef.current.innerHTML) { editorRef.current.innerHTML = content; } }, [content]);
    const handleInput = () => { if (editorRef.current) onChange(editorRef.current.innerHTML); };
    const execCommand = (e: React.MouseEvent, command: string, value: string | undefined = undefined) => {
        e.preventDefault();
        e.stopPropagation();
        document.execCommand(command, false, value);
        handleInput();
    };
    return (
        <div className="flex flex-col h-full">
            <div ref={editorRef} contentEditable onInput={handleInput} onBlur={handleInput} className={RICH_TEXT_STYLES} data-placeholder={placeholder} suppressContentEditableWarning={true} />
            <div className="flex flex-wrap items-center gap-1.5 py-4 mt-auto border-t border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] rounded-b-3xl">
                <ToolbarBtn icon={Bold} onClick={(e) => execCommand(e, 'bold')} title="Negrito" />
                <ToolbarBtn icon={Italic} onClick={(e) => execCommand(e, 'italic')} title="Itálico" />
                <ToolbarBtn icon={Underline} onClick={(e) => execCommand(e, 'underline')} title="Sublinhado" />
                <div className="w-px h-5 bg-black/10 dark:bg-white/10 mx-2"></div>
                <ToolbarBtn icon={Type} onClick={(e) => execCommand(e, 'formatBlock', 'P')} title="Texto Normal" />
                <ToolbarBtn icon={Heading1} onClick={(e) => execCommand(e, 'formatBlock', 'H1')} title="Título 1" />
                <ToolbarBtn icon={Heading2} onClick={(e) => execCommand(e, 'formatBlock', 'H2')} title="Título 2" />
                <div className="w-px h-5 bg-black/10 dark:bg-white/10 mx-2"></div>
                <ToolbarBtn icon={ListIcon} onClick={(e) => execCommand(e, 'insertUnorderedList')} title="Lista" />
                <ToolbarBtn icon={ListOrdered} onClick={(e) => execCommand(e, 'insertOrderedList')} title="Lista Numerada" />
            </div>
        </div>
    );
};

const ToolbarBtn = ({ icon: Icon, onClick, title }: { icon: any, onClick: (e: any) => void, title?: string }) => (
    <button onMouseDown={onClick} title={title} className="p-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 rounded-xl text-slate-700 dark:text-slate-400 transition-all">
        <Icon size={16} />
    </button>
);

const NoteCard: React.FC<{ note: Note; onDelete: (id: string) => void; onUpdate: (n: Note, u: Partial<Note>) => void; t: any; isList: boolean; isDarkMode: boolean }> = ({ note, onDelete, onUpdate, t, isList, isDarkMode }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content);
    const [showColors, setShowColors] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const colorMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isEditing) return;
        if (title === note.title && content === note.content) return;
        const timer = setTimeout(async () => {
            setIsSaving(true);
            try { await onUpdate(note, { title, content }); } catch(e) {}
            setIsSaving(false);
        }, 1200);
        return () => clearTimeout(timer);
    }, [title, content, isEditing, note, onUpdate]);

    const handleColorUpdate = async (color: string) => { 
        setShowColors(false);
        await onUpdate(note, { color }); 
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (cardRef.current && !cardRef.current.contains(e.target as Node) && isEditing) {
                setIsEditing(false);
            }
            if (colorMenuRef.current && !colorMenuRef.current.contains(e.target as Node)) {
                setShowColors(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isEditing]);
    
    const colorObj = NOTE_COLORS.find(c => c.bg === note.color) || NOTE_COLORS[0];
    const cardStyles = {
        backgroundColor: isDarkMode ? colorObj.darkBg : colorObj.bg,
        borderColor: isDarkMode ? colorObj.darkBorder : colorObj.border,
        borderLeftWidth: '6px',
        borderLeftColor: colorObj.accent
    };

    return (
        <div ref={cardRef} className={`rounded-[2rem] border shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col h-fit ${isList ? 'w-full' : 'break-inside-avoid'} theme-transition`} style={cardStyles}>
            {isSaving && (
                <div className="absolute top-5 right-5 z-10 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-full text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest border border-slate-100 dark:border-slate-700 shadow-xl ring-1 ring-black/5">
                        <RefreshCw size={11} className="animate-spin text-indigo-500" /> {t('saving') || 'Sincronizando...'}
                    </div>
                </div>
            )}
            <div className="p-6 md:p-8 flex-1" onClick={() => !isEditing && setIsEditing(true)}>
                 {isEditing ? (
                     <div className="flex flex-col gap-6">
                        <input value={title} onChange={e => setTitle(e.target.value)} className="bg-transparent font-black text-slate-900 dark:text-white outline-none w-full border-b border-black/10 dark:border-white/10 pb-3 text-xl md:text-2xl placeholder-slate-300 dark:placeholder-slate-700" placeholder={t('noteTitle')} autoFocus />
                        <RichTextEditor content={content} onChange={setContent} placeholder={t('noteContent')} />
                     </div>
                 ) : (
                     <div className="note-content-rendered prose prose-slate dark:prose-invert max-w-none">
                        {note.title && <h3 className="font-black text-slate-900 dark:text-white mb-4 text-xl md:text-2xl leading-tight tracking-tight break-words">{note.title}</h3>}
                        <div className="text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed break-words [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-4 [&_strong]:font-black" dangerouslySetInnerHTML={{ __html: note.content }} />
                        {!note.title && !note.content.replace(/<[^>]*>/g, '').trim() && (
                            <span className="text-slate-300 dark:text-slate-700 italic text-sm font-medium tracking-wide">Sem conteúdo adicional...</span>
                        )}
                     </div>
                 )}
            </div>
            <div className={`flex items-center justify-between px-6 py-4 opacity-0 group-hover:opacity-100 transition-all border-t border-black/5 dark:border-white/5 bg-black/[0.03] dark:bg-white/[0.015] ${isEditing ? 'opacity-100' : ''}`}>
                 <div className="flex items-center gap-3">
                    <div className="relative" ref={colorMenuRef}>
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowColors(!showColors); }} className="p-2.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-2xl text-slate-700 dark:text-slate-400 transition-all">
                            <Palette size={19} />
                        </button>
                        {showColors && (
                            <div className="absolute bottom-full left-0 mb-4 bg-white dark:bg-slate-900 p-4 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 grid grid-cols-4 gap-3 z-[110] w-64 animate-in zoom-in-95 duration-200 slide-in-from-bottom-2 ring-1 ring-black/5">
                                {NOTE_COLORS.map(c => ( 
                                    <button 
                                      key={c.id} 
                                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleColorUpdate(c.bg); }} 
                                      className={`w-11 h-11 rounded-xl border-2 hover:scale-110 transition-all ${note.color === c.bg ? 'border-indigo-600 shadow-xl' : 'border-transparent opacity-80'}`} 
                                      style={{ backgroundColor: isDarkMode ? c.darkBg : c.bg, borderColor: note.color === c.bg ? undefined : 'transparent' }} 
                                    /> 
                                ))}
                            </div>
                        )}
                    </div>
                    {!isEditing && (
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(note.id); }} className="p-2.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-2xl text-slate-400 dark:text-slate-600 hover:text-red-600 dark:hover:text-red-400 transition-all">
                            <Trash2 size={19} />
                        </button>
                    )}
                 </div>
                 {isEditing ? (
                     <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(false); onUpdate(note, { title, content }); }} className="text-[11px] font-black uppercase tracking-widest px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-2xl text-white transition-all shadow-xl shadow-indigo-100 dark:shadow-none active:scale-95">
                         Concluir
                     </button>
                 ) : ( <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest opacity-60">{new Date(note.createdAt).toLocaleDateString()}</span> )}
            </div>
        </div>
    );
};