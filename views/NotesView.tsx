import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BoardData, Note } from '../types';
import { useLanguage } from '../utils/i18n';
import { 
  Palette, Trash2, X, Plus, Bold, Italic, Underline, List as ListIcon, 
  ListOrdered, Heading1, Heading2, AlertCircle, LayoutGrid, Rows3, RefreshCw 
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

const RICH_TEXT_STYLES = "outline-none min-h-[60px] text-slate-700 whitespace-pre-wrap break-words [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-2 [&_h1]:mt-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-2 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_li]:mb-0.5 empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400";

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
    <div className="container mx-auto max-w-7xl p-4 md:p-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
          <button onClick={() => setLayoutMode('grid')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${layoutMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <LayoutGrid size={14} /> Grade
          </button>
          <button onClick={() => setLayoutMode('list')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${layoutMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <Rows3 size={14} /> Lista
          </button>
        </div>

        <div ref={containerRef} className={`w-full max-w-xl bg-white rounded-xl shadow-sm border transition-all duration-200 relative ${isCreating ? 'shadow-md ring-1 ring-slate-200' : 'cursor-text hover:shadow-md'}`} style={{ backgroundColor: isCreating ? newColor : '#ffffff' }}>
            {!isCreating ? (
                <div onClick={() => setIsCreating(true)} className="p-3 px-4 text-slate-500 font-medium flex items-center justify-between">
                    <span className="text-sm">{t('takeANote')}</span>
                    <Plus size={18} className="text-slate-400" />
                </div>
            ) : (
                <div className="flex flex-col">
                    <input type="text" placeholder={t('noteTitle')} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-transparent px-4 pt-4 pb-2 outline-none font-bold text-slate-800 placeholder-slate-400 text-lg" autoFocus />
                    <div className="relative min-h-[80px] px-4 py-2">
                        <RichTextEditor content={newContent} onChange={setNewContent} placeholder={t('noteContent')} />
                    </div>
                    <div className="flex justify-between items-center px-2 py-2 border-t border-black/5">
                        <button onClick={() => setShowColorPicker(!showColorPicker)} className="p-2 hover:bg-black/5 rounded-full text-slate-600 transition-colors">
                            <Palette size={18} />
                        </button>
                        {showColorPicker && (
                            <div className="absolute top-full left-0 mt-2 bg-white p-2 rounded-xl shadow-2xl border border-slate-100 grid grid-cols-4 gap-2 z-[100] w-48 animate-in zoom-in-95 duration-150">
                                {NOTE_COLORS.map(c => (
                                    <button key={c.id} onClick={() => { setNewColor(c.bg); setShowColorPicker(false); }} className={`w-8 h-8 rounded-full border hover:scale-110 transition-transform ${newColor === c.bg ? 'ring-2 ring-indigo-400' : ''}`} style={{ backgroundColor: c.bg, borderColor: c.border }} />
                                ))}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <button onClick={() => setIsCreating(false)} className="px-3 py-1.5 text-slate-500 hover:text-slate-800 text-sm font-bold">Cancelar</button>
                            <button onClick={handleSaveNew} className="px-5 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 font-bold rounded-lg text-sm transition-all shadow-sm active:scale-95">{t('save')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        <div className="w-[100px] hidden md:block"></div>
      </div>

      {error && (
        <div className="max-w-xl mx-auto mb-6 bg-red-50 border border-red-200 p-4 rounded-xl text-red-700 flex flex-col gap-2 relative shadow-sm">
            <div className="flex items-start gap-3">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <div className="text-sm font-medium whitespace-pre-line">{error}</div>
            </div>
            <button onClick={() => setError(null)} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><X size={16} /></button>
        </div>
      )}

      {layoutMode === 'grid' ? (
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
              {data.notes.map(note => ( <NoteCard key={note.id} note={note} onDelete={(id) => setNoteToDelete(id)} onUpdate={handleUpdate} t={t} isList={false} /> ))}
          </div>
      ) : (
          <div className="flex flex-col gap-4 max-w-4xl mx-auto">
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
        document.execCommand(command, false, value);
        handleInput();
    };
    return (
        <div className="flex flex-col">
            <div ref={editorRef} contentEditable onInput={handleInput} onBlur={handleInput} className={RICH_TEXT_STYLES} data-placeholder={placeholder} suppressContentEditableWarning={true} />
            <div className="flex flex-wrap items-center gap-1 pt-2 mt-2 border-t border-black/5">
                <ToolbarBtn icon={Bold} onClick={(e) => execCommand(e, 'bold')} />
                <ToolbarBtn icon={Italic} onClick={(e) => execCommand(e, 'italic')} />
                <ToolbarBtn icon={Underline} onClick={(e) => execCommand(e, 'underline')} />
                <div className="w-px h-4 bg-black/10 mx-1"></div>
                <ToolbarBtn icon={Heading1} onClick={(e) => execCommand(e, 'formatBlock', 'H1')} />
                <ToolbarBtn icon={Heading2} onClick={(e) => execCommand(e, 'formatBlock', 'H2')} />
                <div className="w-px h-4 bg-black/10 mx-1"></div>
                <ToolbarBtn icon={ListIcon} onClick={(e) => execCommand(e, 'insertUnorderedList')} />
                <ToolbarBtn icon={ListOrdered} onClick={(e) => execCommand(e, 'insertOrderedList')} />
            </div>
        </div>
    );
};

const ToolbarBtn = ({ icon: Icon, onClick }: { icon: any, onClick: (e: any) => void }) => (
    <button onMouseDown={onClick} className="p-1.5 hover:bg-black/10 rounded text-slate-600 transition-colors"><Icon size={16} /></button>
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
    }, [title, content, isEditing]);

    const handleColorUpdate = async (color: string) => { await onUpdate(note, { color }); setShowColors(false); };
    
    return (
        <div className={`rounded-xl border shadow-sm hover:shadow-md transition-all group relative overflow-hidden ${isList ? 'w-full' : 'break-inside-avoid mb-4'}`} style={{ backgroundColor: note.color, borderColor: NOTE_COLORS.find(c => c.bg === note.color)?.border || '#e2e8f0' }}>
            {isSaving && (
                <div className="absolute top-2 right-2 z-10 animate-in fade-in duration-200">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-black/5 rounded-full text-[10px] font-bold text-slate-500">
                        <RefreshCw size={10} className="animate-spin" /> Salvando...
                    </div>
                </div>
            )}
            <div className="p-4" onClick={() => !isEditing && setIsEditing(true)}>
                 {isEditing ? (
                     <div className="flex flex-col gap-2">
                        <input value={title} onChange={e => setTitle(e.target.value)} className="bg-transparent font-bold text-slate-800 outline-none w-full border-b border-black/5 pb-1 mb-1 text-lg" placeholder={t('noteTitle')} />
                        <RichTextEditor content={content} onChange={setContent} placeholder={t('noteContent')} />
                     </div>
                 ) : (
                     <>
                        {note.title && <h3 className="font-bold text-slate-800 mb-2 text-lg leading-tight">{note.title}</h3>}
                        <div className={`text-slate-700 text-sm whitespace-pre-wrap ${RICH_TEXT_STYLES}`} dangerouslySetInnerHTML={{ __html: note.content }} />
                     </>
                 )}
            </div>
            <div className={`flex items-center justify-between px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity border-t border-black/5 bg-black/5 ${isEditing ? 'opacity-100' : ''}`}>
                 <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setShowColors(!showColors); }} className="p-2 hover:bg-black/10 rounded-full text-slate-600"><Palette size={16} /></button>
                    {showColors && (
                        <div className="absolute bottom-full left-0 mb-2 bg-white p-2 rounded-xl shadow-2xl border border-slate-100 grid grid-cols-4 gap-2 z-[110] w-48 animate-in zoom-in-95 duration-150">
                            {NOTE_COLORS.map(c => ( <button key={c.id} onClick={(e) => { e.stopPropagation(); handleColorUpdate(c.bg); }} className="w-6 h-6 rounded-full border hover:scale-110 transition-transform" style={{ backgroundColor: c.bg, borderColor: c.border }} /> ))}
                        </div>
                    )}
                    {!isEditing && <button onClick={(e) => { e.stopPropagation(); onDelete(note.id); }} className="p-2 hover:bg-black/10 rounded-full text-slate-600 hover:text-red-600"><Trash2 size={16} /></button>}
                 </div>
                 {isEditing ? (
                     <button onClick={(e) => { e.stopPropagation(); setIsEditing(false); onUpdate(note, { title, content }); }} className="text-xs font-bold px-4 py-1.5 bg-black/10 hover:bg-black/20 rounded-lg text-slate-700 transition-colors">Fechar</button>
                 ) : ( <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{new Date(note.createdAt).toLocaleDateString()}</span> )}
            </div>
        </div>
    );
};