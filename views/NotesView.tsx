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
  { id: 'white', bg: '#ffffff', border: '#e2e8f0' },
  { id: 'red', bg: '#fee2e2', border: '#fecaca' },
  { id: 'orange', bg: '#ffedd5', border: '#fed7aa' },
  { id: 'yellow', bg: '#fef9c3', border: '#fde047' },
  { id: 'green', bg: '#dcfce7', border: '#bbf7d0' },
  { id: 'teal', bg: '#ccfbf1', border: '#99f6e4' },
  { id: 'blue', bg: '#dbeafe', border: '#bfdbfe' },
  { id: 'darkblue', bg: '#e0e7ff', border: '#c7d2fe' },
  { id: 'purple', bg: '#f3e8ff', border: '#e9d5ff' },
  { id: 'pink', bg: '#fce7f3', border: '#fbcfe8' },
  { id: 'brown', bg: '#f5f5f4', border: '#e7e5e4' },
  { id: 'gray', bg: '#f1f5f9', border: '#cbd5e1' },
];

const RICH_TEXT_STYLES = "outline-none min-h-[60px] text-slate-800 whitespace-pre-wrap break-words [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-2 [&_h1]:mt-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-2 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_li]:mb-0.5 empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400";

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (isCreating) handleSaveNew();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCreating, newTitle, newContent, newColor]);

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
       } catch (e: any) { setError(e.message); }
    } else { setIsCreating(false); }
  };

  const handleUpdate = async (note: Note, updates: Partial<Note>) => {
      setError(null);
      try {
          await DataService.updateNote({ ...note, ...updates });
          onUpdate();
      } catch (e: any) { setError(e.message); }
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
          <button onClick={() => setLayoutMode('grid')} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${layoutMode === 'grid' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            <LayoutGrid size={14} /> {t('grid')}
          </button>
          <button onClick={() => setLayoutMode('list')} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${layoutMode === 'list' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            <Rows3 size={14} /> {t('list')}
          </button>
        </div>

        <div ref={containerRef} className={`w-full max-w-xl bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all duration-300 relative ${isCreating ? 'shadow-2xl ring-4 ring-indigo-500/10' : 'cursor-text hover:shadow-md'}`} style={{ backgroundColor: isCreating ? newColor : undefined }}>
            {!isCreating ? (
                <div onClick={() => setIsCreating(true)} className="p-4 px-6 text-slate-500 dark:text-slate-400 font-bold flex items-center justify-between">
                    <span className="text-sm uppercase tracking-widest">{t('takeANote')}</span>
                    <Plus size={20} className="text-indigo-500" />
                </div>
            ) : (
                <div className="flex flex-col">
                    <input type="text" placeholder={t('noteTitle')} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-transparent px-6 pt-5 pb-2 outline-none font-black text-slate-900 placeholder-slate-400 text-xl" autoFocus />
                    <div className="relative min-h-[100px] px-6 py-2">
                        <RichTextEditor content={newContent} onChange={setNewContent} placeholder={t('noteContent')} />
                    </div>
                    <div className="flex justify-between items-center px-4 py-3 border-t border-black/5">
                        <div className="relative">
                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowColorPicker(!showColorPicker); }} className="p-2.5 hover:bg-black/5 rounded-xl text-slate-600 transition-colors">
                                <Palette size={20} />
                            </button>
                            {showColorPicker && (
                                <div className="absolute bottom-full left-0 mb-3 bg-white p-3 rounded-2xl shadow-2xl border border-slate-100 grid grid-cols-4 gap-2.5 z-[100] w-56 animate-in zoom-in-95 duration-150">
                                    {NOTE_COLORS.map(c => (
                                        <button key={c.id} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setNewColor(c.bg); setShowColorPicker(false); }} className={`w-10 h-10 rounded-xl border-2 hover:scale-110 transition-all ${newColor === c.bg ? 'border-indigo-500 shadow-lg' : 'border-transparent'}`} style={{ backgroundColor: c.bg }} />
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setIsCreating(false)} className="px-5 py-2 text-slate-600 hover:text-slate-900 text-sm font-black uppercase tracking-widest">{t('cancel')}</button>
                            <button onClick={handleSaveNew} className="px-8 py-2 bg-indigo-600 text-white hover:bg-indigo-700 font-black rounded-xl text-sm transition-all shadow-xl shadow-indigo-100 active:scale-95 glow-effect">{t('save')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        <div className="w-[120px] hidden md:block"></div>
      </div>

      {error && (
        <div className="max-w-xl mx-auto mb-8 bg-red-50 border border-red-200 p-5 rounded-2xl text-red-700 flex flex-col gap-2 relative shadow-lg">
            <div className="flex items-start gap-4">
                <AlertCircle size={24} className="shrink-0 mt-0.5" />
                <div className="text-sm font-bold whitespace-pre-line leading-relaxed">{error}</div>
            </div>
            <button onClick={() => setError(null)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 p-1"><X size={20} /></button>
        </div>
      )}

      {layoutMode === 'grid' ? (
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
              {data.notes.map(note => ( <NoteCard key={note.id} note={note} onDelete={(id) => setNoteToDelete(id)} onUpdate={handleUpdate} t={t} isList={false} /> ))}
          </div>
      ) : (
          <div className="flex flex-col gap-6 max-w-4xl mx-auto">
              {data.notes.map(note => ( <NoteCard key={note.id} note={note} onDelete={(id) => setNoteToDelete(id)} onUpdate={handleUpdate} t={t} isList={true} /> ))}
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
        <div className="flex flex-col">
            <div ref={editorRef} contentEditable onInput={handleInput} onBlur={handleInput} className={RICH_TEXT_STYLES} data-placeholder={placeholder} suppressContentEditableWarning={true} />
            <div className="flex flex-wrap items-center gap-1.5 pt-4 mt-4 border-t border-black/5">
                <ToolbarBtn icon={Bold} onClick={(e) => execCommand(e, 'bold')} />
                <ToolbarBtn icon={Italic} onClick={(e) => execCommand(e, 'italic')} />
                <ToolbarBtn icon={Underline} onClick={(e) => execCommand(e, 'underline')} />
                <div className="w-px h-5 bg-black/10 mx-2"></div>
                <ToolbarBtn icon={Type} onClick={(e) => execCommand(e, 'formatBlock', 'P')} title="Texto Normal" />
                <ToolbarBtn icon={Heading1} onClick={(e) => execCommand(e, 'formatBlock', 'H1')} title="Título 1" />
                <ToolbarBtn icon={Heading2} onClick={(e) => execCommand(e, 'formatBlock', 'H2')} title="Título 2" />
                <div className="w-px h-5 bg-black/10 mx-2"></div>
                <ToolbarBtn icon={ListIcon} onClick={(e) => execCommand(e, 'insertUnorderedList')} />
                <ToolbarBtn icon={ListOrdered} onClick={(e) => execCommand(e, 'insertOrderedList')} />
            </div>
        </div>
    );
};

const ToolbarBtn = ({ icon: Icon, onClick, title }: { icon: any, onClick: (e: any) => void, title?: string }) => (
    <button onMouseDown={onClick} title={title} className="p-2 hover:bg-black/10 rounded-lg text-slate-700 transition-colors">
        <Icon size={18} />
    </button>
);

const NoteCard: React.FC<{ note: Note; onDelete: (id: string) => void; onUpdate: (n: Note, u: Partial<Note>) => void; t: any; isList: boolean; }> = ({ note, onDelete, onUpdate, t, isList }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content);
    const [showColors, setShowColors] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!isEditing) return;
        if (title === note.title && content === note.content) return;
        const timer = setTimeout(async () => {
            setIsSaving(true);
            await onUpdate(note, { title, content });
            setIsSaving(false);
        }, 800);
        return () => clearTimeout(timer);
    }, [title, content, isEditing, note, onUpdate]);

    const handleColorUpdate = async (color: string) => { 
        setShowColors(false);
        await onUpdate(note, { color }); 
    };
    
    return (
        <div className={`rounded-[2rem] border shadow-sm hover:shadow-xl transition-all group relative overflow-hidden ${isList ? 'w-full' : 'break-inside-avoid mb-6'}`} style={{ backgroundColor: note.color, borderColor: NOTE_COLORS.find(c => c.bg === note.color)?.border || '#e2e8f0' }}>
            {isSaving && (
                <div className="absolute top-4 right-4 z-10 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/50 backdrop-blur-sm rounded-full text-[10px] font-black text-slate-600 uppercase tracking-widest border border-white">
                        <RefreshCw size={12} className="animate-spin" /> Salvando
                    </div>
                </div>
            )}
            <div className="p-8" onClick={() => !isEditing && setIsEditing(true)}>
                 {isEditing ? (
                     <div className="flex flex-col gap-4">
                        <input value={title} onChange={e => setTitle(e.target.value)} className="bg-transparent font-black text-slate-900 outline-none w-full border-b border-black/10 pb-2 mb-2 text-xl placeholder-slate-400" placeholder={t('noteTitle')} />
                        <RichTextEditor content={content} onChange={setContent} placeholder={t('noteContent')} />
                     </div>
                 ) : (
                     <div className="note-content-fix">
                        {note.title && <h3 className="font-black text-slate-900 mb-4 text-xl leading-tight tracking-tight">{note.title}</h3>}
                        <div className={`text-slate-800 text-sm whitespace-pre-wrap leading-relaxed ${RICH_TEXT_STYLES} !text-slate-800`} dangerouslySetInnerHTML={{ __html: note.content }} />
                     </div>
                 )}
            </div>
            <div className={`flex items-center justify-between px-6 py-4 opacity-0 group-hover:opacity-100 transition-opacity border-t border-black/5 bg-black/5 ${isEditing ? 'opacity-100' : ''}`}>
                 <div className="flex items-center gap-2">
                    <div className="relative">
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowColors(!showColors); }} className="p-2.5 hover:bg-black/10 rounded-xl text-slate-700 transition-all">
                            <Palette size={18} />
                        </button>
                        {showColors && (
                            <div className="absolute bottom-full left-0 mb-3 bg-white p-3 rounded-2xl shadow-2xl border border-slate-100 grid grid-cols-4 gap-2.5 z-[110] w-56 animate-in zoom-in-95 duration-150">
                                {NOTE_COLORS.map(c => ( 
                                    <button key={c.id} onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleColorUpdate(c.bg); }} className="w-10 h-10 rounded-xl border-2 hover:scale-110 transition-all border-transparent" style={{ backgroundColor: c.bg }} /> 
                                ))}
                            </div>
                        )}
                    </div>
                    {!isEditing && <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(note.id); }} className="p-2.5 hover:bg-black/10 rounded-xl text-slate-700 hover:text-red-600 transition-all"><Trash2 size={18} /></button>}
                 </div>
                 {isEditing ? (
                     <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(false); onUpdate(note, { title, content }); }} className="text-[10px] font-black uppercase tracking-widest px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white transition-all shadow-xl shadow-indigo-100 active:scale-95">
                         Concluído
                     </button>
                 ) : ( <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-50">{new Date(note.createdAt).toLocaleDateString()}</span> )}
            </div>
        </div>
    );
};