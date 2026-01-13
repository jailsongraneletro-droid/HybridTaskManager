import React, { useState, useRef, useEffect } from 'react';
import { BoardData, Note } from '../types';
import { useLanguage } from '../utils/i18n';
import { 
  Palette, Trash2, X, Plus, Bold, Italic, Underline, List as ListIcon, 
  ListOrdered, Heading1, Heading2, AlertCircle, LayoutGrid, Rows3, RefreshCw, Type, GripVertical
} from 'lucide-react';
import { DataService } from '../services/dataService';
import { ConfirmationModal, Modal } from '../components/Shared';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface NotesViewProps {
  data: BoardData;
  onUpdate: () => void;
}

const NOTE_COLORS = [
  { id: 'white', bg: '#ffffff', darkBg: '#0a0a0a', border: '#e2e8f0', darkBorder: '#262626', accent: '#a3a3a3' },
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
  { id: 'gray', bg: '#f1f5f9', darkBg: '#171717', border: '#cbd5e1', darkBorder: '#262626', accent: '#737373' },
];

const RICH_TEXT_STYLES = "outline-none min-h-[60px] text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words px-1 text-[11px] leading-relaxed [&_h1]:text-sm [&_h1]:font-black [&_h2]:text-xs [&_h2]:font-bold [&_ul]:list-disc [&_ul]:pl-3 [&_ol]:list-decimal [&_ol]:pl-3 [&_p]:mb-1 empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400";

export const NotesView: React.FC<NotesViewProps> = ({ data, onUpdate }) => {
  const { t } = useLanguage();
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newColor, setNewColor] = useState(NOTE_COLORS[0].bg);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [localNotes, setLocalNotes] = useState<Note[]>(data.notes);

  useEffect(() => { setLocalNotes(data.notes); }, [data.notes]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(localNotes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setLocalNotes(items);
    // Nota: Em um app Keep real, você salvaria a 'position' no DB aqui.
  };

  const handleSaveNew = async () => {
    if (newTitle.trim() || newContent.trim()) {
      await DataService.addNote({ title: newTitle, content: newContent, color: newColor });
      onUpdate();
      setIsCreating(false); setNewTitle(''); setNewContent(''); setNewColor(NOTE_COLORS[0].bg);
    } else { setIsCreating(false); }
  };

  const handleUpdate = async (note: Note) => {
    await DataService.updateNote(note);
    onUpdate();
    setEditingNote(null);
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-center mb-8">
        <div className={`w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow border dark:border-slate-800 transition-all ${isCreating ? 'shadow-xl' : 'cursor-text'}`}>
          {!isCreating ? (
            <div onClick={() => setIsCreating(true)} className="p-2.5 px-5 text-slate-400 text-xs font-bold flex items-center justify-between">
              <span>{t('takeANote')}</span>
              <Plus size={14} className="text-indigo-600" />
            </div>
          ) : (
            <div className="p-3">
              <input type="text" placeholder="Título" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-transparent outline-none font-bold text-xs mb-2 dark:text-white" autoFocus />
              <RichTextEditor content={newContent} onChange={setNewContent} placeholder="Anotação..." />
              <div className="flex justify-between items-center mt-3 pt-2 border-t dark:border-slate-800">
                <button onClick={() => setShowColorPicker(!showColorPicker)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"><Palette size={14} /></button>
                <div className="flex gap-2">
                  <button onClick={() => setIsCreating(false)} className="text-[10px] font-bold text-slate-400 px-3">Fechar</button>
                  <button onClick={handleSaveNew} className="bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-lg">Criar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="notes" direction="vertical">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="notes-grid columns-2 md:columns-3 lg:columns-4 xl:columns-6 gap-3">
              {localNotes.map((note, index) => (
                <Draggable key={note.id} draggableId={note.id} index={index}>
                  {(dragProvided) => (
                    <div 
                      ref={dragProvided.innerRef} 
                      {...dragProvided.draggableProps} 
                      className="note-item group"
                      onClick={() => setEditingNote(note)}
                    >
                      <div 
                        className="rounded-lg border shadow-sm hover:shadow-md transition-all p-3 relative" 
                        style={{ backgroundColor: document.documentElement.classList.contains('dark') ? NOTE_COLORS.find(c => c.bg === note.color)?.darkBg : note.color, borderColor: NOTE_COLORS.find(c => c.bg === note.color)?.border }}
                      >
                        <div {...dragProvided.dragHandleProps} className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-40 text-slate-500"><GripVertical size={12} /></div>
                        {note.title && <h3 className="font-black text-[11px] mb-1.5 dark:text-white line-clamp-1">{note.title}</h3>}
                        <div className="text-[10px] leading-snug text-slate-600 dark:text-slate-400 line-clamp-[12]" dangerouslySetInnerHTML={{ __html: note.content }} />
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Editor Expandido (Modal focado) */}
      <Modal isOpen={!!editingNote} onClose={() => setEditingNote(null)} title="Editar Nota">
        {editingNote && (
          <NoteEditorExpandido 
            note={editingNote} 
            onSave={handleUpdate} 
            onDelete={(id) => { setNoteToDelete(id); setEditingNote(null); }} 
          />
        )}
      </Modal>

      <ConfirmationModal isOpen={!!noteToDelete} onClose={() => setNoteToDelete(null)} onConfirm={async () => { if (noteToDelete) { await DataService.deleteNote(noteToDelete); onUpdate(); setNoteToDelete(null); } }} title="Excluir Nota" message={t('deleteNoteConfirm')} />
    </div>
  );
};

const NoteEditorExpandido = ({ note, onSave, onDelete }: any) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [color, setColor] = useState(note.color);
  const [showColors, setShowColors] = useState(false);

  return (
    <div className="space-y-3">
      <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-transparent font-black text-sm outline-none dark:text-white" placeholder="Título" />
      <RichTextEditor content={content} onChange={setContent} placeholder="Anotação..." autoFocus />
      <div className="flex items-center justify-between pt-3 border-t dark:border-slate-800">
        <div className="flex gap-2 relative">
          <button onClick={() => setShowColors(!showColors)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"><Palette size={14} /></button>
          <button onClick={() => onDelete(note.id)} className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg"><Trash2 size={14} /></button>
          {showColors && (
            <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-slate-800 p-2 rounded-lg shadow-xl grid grid-cols-4 gap-1 border dark:border-slate-700 z-[200]">
              {NOTE_COLORS.map(c => <button key={c.id} onClick={() => { setColor(c.bg); setShowColors(false); }} className="w-5 h-5 rounded-full border" style={{ backgroundColor: c.bg }} />)}
            </div>
          )}
        </div>
        <button onClick={() => onSave({ ...note, title, content, color })} className="bg-indigo-600 text-white text-[10px] font-black px-6 py-2 rounded-lg shadow-lg">Concluir</button>
      </div>
    </div>
  );
};

const RichTextEditor = ({ content, onChange, placeholder, autoFocus }: any) => {
  const editorRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (editorRef.current && content !== editorRef.current.innerHTML) editorRef.current.innerHTML = content; }, [content]);
  const exec = (cmd: string) => { document.execCommand(cmd, false); editorRef.current?.focus(); };
  return (
    <div>
      <div ref={editorRef} contentEditable onInput={() => onChange(editorRef.current?.innerHTML || '')} className={RICH_TEXT_STYLES} data-placeholder={placeholder} />
      <div className="flex gap-1 mt-2 opacity-60 hover:opacity-100 transition-opacity">
        {[ {icon: Bold, cmd: 'bold'}, {icon: Italic, cmd: 'italic'}, {icon: ListIcon, cmd: 'insertUnorderedList'} ].map(b => (
          <button key={b.cmd} onClick={() => exec(b.cmd)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><b.icon size={12} /></button>
        ))}
      </div>
    </div>
  );
};
