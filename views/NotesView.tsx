import React, { useState, useRef, useEffect } from 'react';
import { BoardData, Note } from '../types';
import { useLanguage } from '../utils/i18n';
import { Palette, Trash2, X, Plus, Bold, Italic, Underline, List, ListOrdered, Heading1, Heading2, Heading3, AlertCircle, RefreshCw } from 'lucide-react';
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
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
           // Clear after success
           setIsCreating(false);
           setNewTitle('');
           setNewContent('');
           setNewColor(NOTE_COLORS[0].bg);
       } catch (e: any) {
           setError(e.message);
           // Keep isCreating true so the user doesn't lose their text
       }
    } else {
        setIsCreating(false);
    }
  };

  const confirmDelete = async () => {
      if (!noteToDelete) return;
      setIsDeleting(true);
      setError(null);
      try {
          await DataService.deleteNote(noteToDelete);
          onUpdate();
          setNoteToDelete(null);
      } catch (e: any) {
          setError(e.message);
      } finally {
          setIsDeleting(false);
      }
  };

  const handleUpdate = async (note: Note, updates: Partial<Note>) => {
      setError(null);
      try {
          await DataService.updateNote({ ...note, ...updates });
          onUpdate();
      } catch (e: any) {
          setError(e.message);
      }
  };

  return (
    <div className="container mx-auto max-w-7xl p-4 md:p-8 animate-in fade-in duration-300">
      
      {/* Error Message */}
      {error && (
        <div className="max-w-xl mx-auto mb-6 bg-red-50 border border-red-200 p-4 rounded-xl text-red-700 flex flex-col gap-2 relative shadow-sm">
            <div className="flex items-start gap-3">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <div className="text-sm font-medium whitespace-pre-line">{error}</div>
            </div>
            <button 
                onClick={() => setError(null)}
                className="absolute top-2 right-2 text-red-400 hover:text-red-600"
            >
                <X size={16} />
            </button>
        </div>
      )}

      {/* Create Input Area */}
      <div className="flex justify-center mb-8">
        <div 
            ref={containerRef}
            className={`w-full max-w-xl bg-white rounded-lg shadow-sm border transition-all duration-200 relative ${isCreating ? 'shadow-md ring-1 ring-slate-200' : 'cursor-text hover:shadow-md'}`}
            style={{ backgroundColor: isCreating ? newColor : '#ffffff' }}
        >
            {!isCreating ? (
                <div 
                    onClick={() => setIsCreating(true)}
                    className="p-4 text-slate-500 font-medium flex items-center justify-between"
                >
                    <span>{t('takeANote')}</span>
                    <Plus size={20} />
                </div>
            ) : (
                <div className="flex flex-col">
                    <input 
                        type="text" 
                        placeholder={t('noteTitle')}
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full bg-transparent px-4 pt-4 pb-2 outline-none font-semibold text-slate-800 placeholder-slate-500 text-lg border-b border-transparent focus:border-black/5"
                        autoFocus
                    />
                    <div className="relative min-h-[100px] px-4 py-2">
                        <RichTextEditor 
                           content={newContent} 
                           onChange={setNewContent} 
                           placeholder={t('noteContent')}
                        />
                    </div>
                    <div className="flex justify-between items-center px-2 py-2 border-t border-black/5">
                        <div className="flex gap-1">
                            <div className="relative">
                                <button 
                                    onClick={() => setShowColorPicker(!showColorPicker)}
                                    className="p-2 hover:bg-black/5 rounded-full text-slate-600 transition-colors"
                                >
                                    <Palette size={18} />
                                </button>
                                {showColorPicker && (
                                    <div className="absolute top-full left-0 mt-2 bg-white p-2 rounded-xl shadow-xl border border-slate-100 grid grid-cols-4 gap-2 z-10 w-48">
                                        {NOTE_COLORS.map(c => (
                                            <button
                                                key={c.id}
                                                onClick={() => { setNewColor(c.bg); setShowColorPicker(false); }}
                                                className={`w-8 h-8 rounded-full border hover:scale-110 transition-transform ${newColor === c.bg ? 'ring-2 ring-indigo-400' : ''}`}
                                                style={{ backgroundColor: c.bg, borderColor: c.border }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setIsCreating(false)} className="px-3 py-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium">Cancelar</button>
                            <button 
                                onClick={handleSaveNew}
                                className="px-4 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 font-medium rounded text-sm transition-colors shadow-sm"
                            >
                                {t('save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {data.notes.map(note => (
              <NoteCard key={note.id} note={note} onDelete={(id) => setNoteToDelete(id)} onUpdate={handleUpdate} t={t} />
          ))}
      </div>
      
      <ConfirmationModal 
         isOpen={!!noteToDelete}
         onClose={() => setNoteToDelete(null)}
         onConfirm={confirmDelete}
         title="Excluir Nota"
         message={t('deleteNoteConfirm')}
      />
    </div>
  );
};

// --- Rich Text Editor ---
const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, placeholder }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (editorRef.current && content !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = content;
        }
    }, [content]);

    const handleInput = () => {
        if (editorRef.current) onChange(editorRef.current.innerHTML);
    };

    const execCommand = (e: React.MouseEvent, command: string, value: string | undefined = undefined) => {
        e.preventDefault();
        document.execCommand(command, false, value);
        handleInput();
    };

    return (
        <div className="flex flex-col">
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onFocus={() => setIsFocused(true)}
                className={RICH_TEXT_STYLES}
                data-placeholder={placeholder}
                suppressContentEditableWarning={true}
            />
            {(isFocused || content) && (
                <div className="flex flex-wrap items-center gap-1 pt-2 mt-2 border-t border-black/5 animate-in fade-in duration-200">
                    <ToolbarBtn icon={Bold} onClick={(e) => execCommand(e, 'bold')} />
                    <ToolbarBtn icon={Italic} onClick={(e) => execCommand(e, 'italic')} />
                    <ToolbarBtn icon={Underline} onClick={(e) => execCommand(e, 'underline')} />
                    <div className="w-px h-4 bg-black/10 mx-1"></div>
                    <ToolbarBtn icon={Heading1} onClick={(e) => execCommand(e, 'formatBlock', 'H1')} />
                    <ToolbarBtn icon={Heading2} onClick={(e) => execCommand(e, 'formatBlock', 'H2')} />
                    <div className="w-px h-4 bg-black/10 mx-1"></div>
                    <ToolbarBtn icon={List} onClick={(e) => execCommand(e, 'insertUnorderedList')} />
                    <ToolbarBtn icon={ListOrdered} onClick={(e) => execCommand(e, 'insertOrderedList')} />
                </div>
            )}
        </div>
    );
};

const ToolbarBtn = ({ icon: Icon, onClick }: { icon: any, onClick: (e: any) => void }) => (
    <button onMouseDown={onClick} className="p-1.5 hover:bg-black/10 rounded text-slate-600 transition-colors">
        <Icon size={16} />
    </button>
);

const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete, onUpdate, t }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content);
    const [showColors, setShowColors] = useState(false);

    const handleBlur = () => {
        if (title !== note.title || content !== note.content) {
            onUpdate(note, { title, content });
        }
    };
    
    return (
        <div 
            className="break-inside-avoid rounded-lg border shadow-sm hover:shadow-md transition-all group relative mb-4 overflow-hidden"
            style={{ backgroundColor: note.color, borderColor: NOTE_COLORS.find(c => c.bg === note.color)?.border || '#e2e8f0' }}
        >
            <div className="p-4" onClick={() => !isEditing && setIsEditing(true)}>
                 {isEditing ? (
                     <div className="flex flex-col gap-2">
                        <input value={title} onChange={e => setTitle(e.target.value)} onBlur={handleBlur} className="bg-transparent font-semibold text-slate-800 outline-none w-full border-b border-transparent focus:border-black/5" placeholder={t('noteTitle')} />
                        <RichTextEditor content={content} onChange={setContent} placeholder={t('noteContent')} />
                     </div>
                 ) : (
                     <>
                        {note.title && <h3 className="font-semibold text-slate-800 mb-2">{note.title}</h3>}
                        <div className={`text-slate-700 text-sm whitespace-pre-wrap ${RICH_TEXT_STYLES}`} dangerouslySetInnerHTML={{ __html: note.content }} />
                     </>
                 )}
            </div>
            <div className={`flex items-center justify-between px-2 py-2 opacity-0 group-hover:opacity-100 transition-opacity ${isEditing ? 'opacity-100' : ''}`}>
                 <div className="relative">
                    <button onClick={(e) => { e.stopPropagation(); setShowColors(!showColors); }} className="p-2 hover:bg-black/10 rounded-full text-slate-600"><Palette size={16} /></button>
                    {showColors && (
                        <div className="absolute bottom-full left-0 mb-2 bg-white p-2 rounded-xl shadow-xl border border-slate-100 grid grid-cols-4 gap-2 z-20 w-48">
                            {NOTE_COLORS.map(c => (
                                <button key={c.id} onClick={(e) => { e.stopPropagation(); onUpdate(note, { color: c.bg }); setShowColors(false); }} className="w-6 h-6 rounded-full border hover:scale-110" style={{ backgroundColor: c.bg, borderColor: c.border }} />
                            ))}
                        </div>
                    )}
                 </div>
                 {isEditing ? (
                     <button onClick={(e) => { e.stopPropagation(); setIsEditing(false); handleBlur(); }} className="text-xs font-semibold px-3 py-1 bg-black/10 hover:bg-black/20 rounded-md text-slate-700">Fechar</button>
                 ) : (
                    <button onClick={(e) => { e.stopPropagation(); onDelete(note.id); }} className="p-2 hover:bg-black/10 rounded-full text-slate-600 hover:text-red-600"><Trash2 size={16} /></button>
                 )}
            </div>
        </div>
    );
};

interface RichTextEditorProps { content: string; onChange: (html: string) => void; placeholder: string; }
interface NoteCardProps { note: Note; onDelete: (id: string) => void; onUpdate: (n: Note, u: Partial<Note>) => void; t: any; }