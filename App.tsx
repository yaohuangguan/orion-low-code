
import React, { useState, useEffect } from 'react';
import { 
  LayoutTemplate, Wifi, User as UserIcon, LogIn, Save, FolderOpen, LogOut,
  MousePointer2, Play, Plus, Trash2, Layers, Settings, Sparkles, Loader2,
  Box, Type, Image as ImageIcon, List, CreditCard, Square, Code, Copy, Check,
  Grid, AlignLeft, AlignCenter, AlignRight, ArrowDown, ArrowRight, Layout,
  ToggleLeft, CheckSquare, Minus, Circle, AlertCircle, ListOrdered, Sidebar, Percent,
  Activity, PlayCircle, Zap, Globe, Database, Network, Eye, MousePointer,
  Star, Disc, ChevronRight, Hash, TrendingUp, Quote, Video, Map, Table, Binary
} from 'lucide-react';

import { INITIAL_SCHEMA, TEMPLATES } from './constants';
import { Renderer } from './components/Renderer';
import { SchemaNode, DataListItem, User, SavedProject, ComponentType, Template, LogicAction } from './types';
import { generateMockData } from './services/geminiService';
import { generateReactCode, generateVueCode } from './services/codeGenerator';
import { collabService } from './services/collaboration';
import { authService, storageService } from './services/authStorage';
import { translations, Language } from './services/translations';

// --- Utils ---
const generateId = (prefix: string) => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

// Default props for new components
const DEFAULT_PROPS: Record<ComponentType, any> = {
  Container: { className: 'p-4 border border-dashed border-slate-300 rounded min-h-[100px] bg-slate-50/50' },
  Card: { className: 'p-6 bg-white border border-slate-200 shadow-sm rounded-xl' },
  Button: { label: 'Button', variant: 'primary' },
  Text: { content: 'Double click to edit text...', className: 'text-slate-800' },
  Badge: { label: 'Badge', variant: 'default' },
  Input: { placeholder: 'Enter text...' },
  Textarea: { placeholder: 'Enter long text...', rows: 3 },
  Image: { className: 'w-full h-48 bg-slate-200 object-cover rounded-lg' },
  DataList: { title: 'Dynamic List', description: 'Configure source', items: [], filterQuery: '', sortKey: 'title', sortOrder: 'none' },
  Divider: { className: 'my-4' },
  Avatar: { className: 'w-12 h-12', initials: 'OR' },
  Toggle: { label: 'Toggle me' },
  Checkbox: { label: 'Check me' },
  Slider: { defaultValue: 50 },
  Progress: { value: 60 },
  Alert: { title: 'Notification', children: 'Something happened', type: 'info' },
  Select: { options: ['Option A', 'Option B'] },
  Spacer: { height: 4 },
  // New Components
  Rating: { max: 5 },
  RadioGroup: { options: ['Option A', 'Option B', 'Option C'] },
  Breadcrumb: { items: ['Home', 'Section', 'Page'] },
  Tag: { label: 'Tag' },
  Statistic: { label: 'Revenue', value: '$12,450', trend: '+12%' },
  Quote: { content: 'Innovation distinguishes between a leader and a follower.', author: 'Steve Jobs' },
  Video: { src: '' },
  Map: { },
  Table: { headers: ['Name', 'Role', 'Status'], rows: [['Alice', 'Admin', 'Active'],['Bob', 'User', 'Offline']] },
  CodeBlock: { code: 'console.log("Hello World");' }
};

// --- Helpers for Style Editing ---
const updateClass = (current: string, prefixRegex: RegExp, newVal: string): string => {
  const classes = current.split(' ').filter(c => !prefixRegex.test(c));
  if (newVal) classes.push(newVal);
  return classes.join(' ').trim();
};

export default function App() {
  // --- Global State ---
  const [user, setUser] = useState<User | null>(null);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [showProjects, setShowProjects] = useState(false);
  const [lang, setLang] = useState<Language>('en'); // I18n
  
  // --- Export State ---
  const [showExport, setShowExport] = useState(false);
  const [exportTab, setExportTab] = useState<'react' | 'vue'>('react');
  const [copied, setCopied] = useState(false);

  // --- Editor State ---
  const [schema, setSchema] = useState<SchemaNode>(INITIAL_SCHEMA);
  const [selectedId, setSelectedId] = useState<string | null>('root-container');
  const [mode, setMode] = useState<'design' | 'preview'>('design');
  const [sidebarTab, setSidebarTab] = useState<'components' | 'templates'>('components');
  const [inspectorTab, setInspectorTab] = useState<'style' | 'logic'>('style');

  // --- Runtime Logic State (with Persistence) ---
  const [runtimeState, setRuntimeState] = useState<Record<string, any>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('orion_runtime_state');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem('orion_runtime_state', JSON.stringify(runtimeState));
  }, [runtimeState]);
  
  // --- AI State ---
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  // --- Helpers ---
  const t = (key: keyof typeof translations['en']) => translations[lang][key];

  // --- Initialization ---
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) setUser(currentUser);

    const unsubscribe = collabService.subscribe((newSchema) => {
      setSchema(newSchema);
    });
    return () => unsubscribe();
  }, []);

  // --- Schema Helpers ---
  const findNode = (root: SchemaNode, id: string): SchemaNode | null => {
    if (root.id === id) return root;
    if (root.children) {
      for (const child of root.children) {
        const found = findNode(child, id);
        if (found) return found;
      }
    }
    return null;
  };

  const addNodeToSchema = (root: SchemaNode, targetId: string, newNode: SchemaNode): SchemaNode => {
    if (root.id === targetId) {
      if (root.type === 'Container' || root.type === 'Card') {
        return { ...root, children: [...(root.children || []), newNode] };
      }
      return root; 
    }
    if (root.children) {
      return { ...root, children: root.children.map(child => addNodeToSchema(child, targetId, newNode)) };
    }
    return root;
  };

  const updateNodeProps = (root: SchemaNode, id: string, newProps: any): SchemaNode => {
    if (root.id === id) {
      return { ...root, props: { ...root.props, ...newProps } };
    }
    if (root.children) {
      return { ...root, children: root.children.map(child => updateNodeProps(child, id, newProps)) };
    }
    return root;
  };

  const updateNodeLogic = (root: SchemaNode, id: string, logicUpdate: Partial<SchemaNode>): SchemaNode => {
    if (root.id === id) {
      return { ...root, ...logicUpdate };
    }
    if (root.children) {
      return { ...root, children: root.children.map(child => updateNodeLogic(child, id, logicUpdate)) };
    }
    return root;
  };

  const deleteNode = (root: SchemaNode, id: string): SchemaNode | null => {
    if (root.id === id) return null;
    if (root.children) {
      const newChildren = root.children
        .map(child => deleteNode(child, id))
        .filter(Boolean) as SchemaNode[];
      return { ...root, children: newChildren };
    }
    return root;
  };

  // --- Actions ---
  const handleAddComponent = (type: ComponentType) => {
    if (!selectedId) return alert("Select a container to add components to.");
    const targetNode = findNode(schema, selectedId);
    if (!targetNode || (targetNode.type !== 'Container' && targetNode.type !== 'Card')) {
      alert("Please select a 'Container' or 'Card' to add items inside it.");
      return;
    }
    const newNode: SchemaNode = {
      id: generateId(type.toLowerCase()),
      type,
      props: { ...DEFAULT_PROPS[type] },
      children: (type === 'Container' || type === 'Card') ? [] : undefined
    };
    const newSchema = addNodeToSchema(schema, selectedId, newNode);
    updateSchema(newSchema);
  };

  const handleAddTemplate = (tpl: Template) => {
    if (!selectedId) return alert("Select a container.");
    const targetNode = findNode(schema, selectedId);
    if (!targetNode || (targetNode.type !== 'Container' && targetNode.type !== 'Card')) return alert("Select a container.");

    const cloneWithNewIds = (node: SchemaNode): SchemaNode => ({
      ...node,
      id: generateId(node.type.toLowerCase()),
      children: node.children ? node.children.map(cloneWithNewIds) : undefined
    });

    const newSchemaNode = cloneWithNewIds(tpl.schema);
    const newSchema = addNodeToSchema(schema, selectedId, newSchemaNode);
    updateSchema(newSchema);
  };

  const handleDeleteComponent = () => {
    if (!selectedId || selectedId === 'root-container') return;
    const newSchema = deleteNode(schema, selectedId);
    if (newSchema) {
      updateSchema(newSchema);
      setSelectedId('root-container');
    }
  };

  const updateSchema = (newSchema: SchemaNode) => {
    setSchema(newSchema);
    collabService.broadcastUpdate(newSchema);
  };

  const handlePropChange = (key: string, value: any) => {
    if (!selectedId) return;
    const newSchema = updateNodeProps(schema, selectedId, { [key]: value });
    updateSchema(newSchema);
  };

  const handleLogicChange = (key: keyof SchemaNode, value: any) => {
    if (!selectedId) return;
    const newSchema = updateNodeLogic(schema, selectedId, { [key]: value });
    updateSchema(newSchema);
  };

  // --- Style Helpers for Inspector ---
  const handleStyleToggle = (prop: string, value: string, regex: RegExp) => {
    if (!selectedNode) return;
    const currentClass = selectedNode.props.className || '';
    const newClass = updateClass(currentClass, regex, value);
    handlePropChange('className', newClass);
  };

  // --- Logic Engine (Runtime) ---
  const handleRuntimeVariableChange = (key: string, value: any) => {
    setRuntimeState(prev => ({ ...prev, [key]: value }));
  };

  const executeAction = async (action: LogicAction) => {
    if (action.type === 'toggle' && action.target) {
      setRuntimeState(prev => ({ ...prev, [action.target!]: !prev[action.target!] }));
    } 
    else if (action.type === 'set' && action.target && action.value) {
      setRuntimeState(prev => ({ ...prev, [action.target!]: action.value }));
    }
    else if (action.type === 'alert') {
      alert(action.value || 'Alert!');
    }
    else if (action.type === 'apiRequest') {
       if (!action.url) return alert("API URL is missing");
       try {
         const method = action.method || 'GET';
         // Simulate real network delay
         await new Promise(r => setTimeout(r, 800));
         const response = await fetch(action.url, { method });
         const data = await response.json().catch(() => ({ status: 'ok', data: 'Mock Data' }));
         if (action.target) {
            setRuntimeState(prev => ({ ...prev, [action.target!]: JSON.stringify(data, null, 2) }));
         }
       } catch (e) {
         console.error(e);
       }
    }
  };

  // --- Quick Variable Create Helper ---
  const handleCreateVariable = (name: string) => {
    if (!name || runtimeState[name] !== undefined) return;
    setRuntimeState(prev => ({ ...prev, [name]: '' }));
  };

  // --- AI ---
  const handleAiGenerate = async () => {
    if (!selectedId || !aiPrompt) return;
    setIsAiThinking(true);
    try {
      const data = await generateMockData(aiPrompt);
      handlePropChange('items', data);
      setAiPrompt('');
    } catch (e) {
      alert(t('aiFailed'));
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleCopyCode = () => {
    const code = exportTab === 'react' ? generateReactCode(schema) : generateVueCode(schema);
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Auth Handlers ---
  const handleLogin = () => setUser(authService.login());
  const handleLogout = () => { authService.logout(); setUser(null); };
  const handleSave = () => {
    if (!user) return alert(t('loginRequired'));
    const name = prompt("Project Name:", "New App");
    if (name) {
      storageService.saveProject(name, schema);
      alert(t('projectSaved'));
    }
  };
  const handleLoad = (p: SavedProject) => {
    updateSchema(p.schema);
    setShowProjects(false);
  };

  // --- Render ---
  const selectedNode = selectedId ? findNode(schema, selectedId) : null;
  const variableNames = Object.keys(runtimeState);

  // Reusable Dropdown for Variables
  const VariableSelector = ({ 
    value, 
    onChange, 
    placeholder = t('selectVar') 
  }: { value: string, onChange: (val: string) => void, placeholder?: string }) => (
    <div className="flex gap-1">
      <select 
        className="flex-1 text-xs p-2 bg-white text-slate-900 border border-slate-200 rounded outline-none"
        value={value || ''}
        onChange={(e) => {
          if (e.target.value === '__NEW__') {
             const name = prompt("Enter new variable name:");
             if (name) {
               handleCreateVariable(name);
               onChange(name);
             }
          } else {
             onChange(e.target.value);
          }
        }}
      >
        <option value="">{placeholder}</option>
        {variableNames.map(v => <option key={v} value={v}>{v}</option>)}
        <option value="__NEW__" className="font-bold text-indigo-600">{t('createVar')}</option>
      </select>
    </div>
  );

  // Component Definition with Icons
  const COMPONENT_LIST = [
    { type: 'Container', icon: Box, label: 'Box' },
    { type: 'Card', icon: Sidebar, label: 'Card' },
    { type: 'Text', icon: Type, label: 'Text' },
    { type: 'Button', icon: Square, label: 'Button' },
    { type: 'Input', icon: LayoutTemplate, label: 'Input' },
    { type: 'Textarea', icon: Type, label: 'Memo' },
    { type: 'Image', icon: ImageIcon, label: 'Image' },
    { type: 'DataList', icon: List, label: 'List' },
    { type: 'Badge', icon: CreditCard, label: 'Badge' },
    { type: 'Divider', icon: Minus, label: 'Divider' },
    { type: 'Avatar', icon: Circle, label: 'Avatar' },
    { type: 'Toggle', icon: ToggleLeft, label: 'Toggle' },
    { type: 'Checkbox', icon: CheckSquare, label: 'Check' },
    { type: 'Slider', icon: AlignCenter, label: 'Slider' },
    { type: 'Progress', icon: Percent, label: 'Progress' },
    { type: 'Alert', icon: AlertCircle, label: 'Alert' },
    { type: 'Select', icon: ListOrdered, label: 'Select' },
    { type: 'Spacer', icon: ArrowDown, label: 'Spacer' },
    // New
    { type: 'Rating', icon: Star, label: 'Rating' },
    { type: 'RadioGroup', icon: Disc, label: 'Radio' },
    { type: 'Breadcrumb', icon: ChevronRight, label: 'Bread' },
    { type: 'Tag', icon: Hash, label: 'Tag' },
    { type: 'Statistic', icon: TrendingUp, label: 'Stat' },
    { type: 'Quote', icon: Quote, label: 'Quote' },
    { type: 'Video', icon: Video, label: 'Video' },
    { type: 'Map', icon: Map, label: 'Map' },
    { type: 'Table', icon: Table, label: 'Table' },
    { type: 'CodeBlock', icon: Binary, label: 'Code' },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden flex-col font-sans">
      
      {/* HEADER */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-30">
        <div className="flex items-center gap-3">
           <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
              <LayoutTemplate className="w-4 h-4" />
           </div>
           <h1 className="font-bold text-slate-800 hidden sm:block">{t('appTitle')}</h1>
           
           <div className="flex bg-slate-100 p-1 rounded-lg ml-4 border border-slate-200">
              <button 
                onClick={() => setMode('design')}
                className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium transition-all ${mode === 'design' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <MousePointer2 className="w-3 h-3" /> {t('design')}
              </button>
              <button 
                onClick={() => setMode('preview')}
                className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium transition-all ${mode === 'preview' ? 'bg-white shadow-sm text-green-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Play className="w-3 h-3" /> {t('preview')}
              </button>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <button onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200">
             <Globe className="w-3 h-3" /> {lang.toUpperCase()}
           </button>
           <button onClick={() => setShowExport(true)} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200">
             <Code className="w-3 h-3" /> {t('exportCode')}
           </button>
           <div className="h-6 w-px bg-slate-200 mx-1"></div>
           {!user ? (
             <button onClick={handleLogin} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200">
               <LogIn className="w-3 h-3" /> {t('login')}
             </button>
           ) : (
             <div className="flex items-center gap-2">
               <button onClick={() => setShowProjects(!showProjects)} className="relative flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200">
                 <FolderOpen className="w-3 h-3" /> {t('open')}
                 {showProjects && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden">
                      {savedProjects.length > 0 ? savedProjects.map(p => (
                        <div key={p.id} onClick={() => handleLoad(p)} className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-left truncate">{p.name}</div>
                      )) : <div className="px-4 py-2 text-slate-400">No projects</div>}
                    </div>
                 )}
               </button>
               <button onClick={handleSave} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg">
                 <Save className="w-3 h-3" /> {t('save')}
               </button>
               <button onClick={handleLogout} className="p-1.5 text-slate-400 hover:text-red-500"><LogOut className="w-4 h-4"/></button>
             </div>
           )}
        </div>
      </header>

      {/* MAIN BODY */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT SIDEBAR */}
        {mode === 'design' && (
          <aside className="w-64 bg-white border-r border-slate-200 flex flex-col z-20 shadow-sm">
            {/* Tabs */}
            <div className="flex border-b border-slate-200">
              <button onClick={() => setSidebarTab('components')} className={`flex-1 py-3 text-xs font-medium text-center border-b-2 ${sidebarTab === 'components' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'}`}>{t('components')}</button>
              <button onClick={() => setSidebarTab('templates')} className={`flex-1 py-3 text-xs font-medium text-center border-b-2 ${sidebarTab === 'templates' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'}`}>{t('templates')}</button>
            </div>
            
            {/* Palette */}
            <div className="flex-1 p-4 overflow-y-auto">
              {sidebarTab === 'components' ? (
                <div className="grid grid-cols-2 gap-2">
                  {COMPONENT_LIST.map(item => (
                    <button key={item.type} onClick={() => handleAddComponent(item.type as ComponentType)} className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all group">
                       <item.icon className="w-5 h-5 mb-1.5 text-slate-500 group-hover:text-indigo-600" />
                       <span className="text-[10px] font-medium text-slate-600 group-hover:text-indigo-700">{item.label}</span>
                    </button>
                  ))}
                </div>
              ) : (
                 <div className="space-y-3">
                   {TEMPLATES.map(tpl => (
                      <button key={tpl.id} onClick={() => handleAddTemplate(tpl)} className="w-full text-left p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all">
                        <div className="text-xs font-bold text-slate-700">{tpl.name}</div>
                        <div className="text-[10px] text-slate-400">{t('dragToInsert')}</div>
                      </button>
                   ))}
                 </div>
              )}
            </div>
          </aside>
        )}

        {/* CANVAS */}
        <main className={`flex-1 bg-slate-100/50 relative overflow-hidden flex flex-col ${mode === 'preview' ? 'items-center justify-center bg-white' : ''}`}>
           {mode === 'design' && (
             <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full border border-slate-200 shadow-sm text-[10px] text-slate-500 z-10 pointer-events-none">
               {selectedId ? `Editing: ${selectedNode?.type || 'Unknown'}` : 'Select an element to edit'}
             </div>
           )}
           <div className={`flex-1 overflow-auto p-8 w-full flex items-start justify-center transition-all`}>
              <div className={`w-full max-w-5xl transition-all duration-300 ${mode === 'design' ? 'min-h-[600px] border-2 border-dashed border-slate-200 bg-white shadow-sm p-8 rounded-xl' : ''}`}>
                <Renderer 
                  node={schema} 
                  selectedId={mode === 'design' ? selectedId : null}
                  onSelect={setSelectedId}
                  mode={mode}
                  runtimeState={runtimeState}
                  onVariableChange={handleRuntimeVariableChange}
                  onAction={executeAction}
                />
              </div>
           </div>
        </main>

        {/* RIGHT SIDEBAR (INSPECTOR) */}
        {mode === 'design' && selectedNode && (
          <aside className="w-80 bg-white border-l border-slate-200 flex flex-col z-20 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-2">
                 <Settings className="w-4 h-4 text-slate-400" />
                 <span className="text-sm font-semibold text-slate-700">{t('properties')}</span>
               </div>
               {selectedId !== 'root-container' && (
                 <button onClick={handleDeleteComponent} className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-slate-100">
                   <Trash2 className="w-4 h-4" />
                 </button>
               )}
            </div>
            
            <div className="flex border-b border-slate-100 bg-slate-50">
               <button onClick={() => setInspectorTab('style')} className={`flex-1 py-2 text-[10px] font-bold uppercase ${inspectorTab === 'style' ? 'text-indigo-600 bg-white border-t-2 border-indigo-600' : 'text-slate-500'}`}>{t('design')}</button>
               <button onClick={() => setInspectorTab('logic')} className={`flex-1 py-2 text-[10px] font-bold uppercase ${inspectorTab === 'logic' ? 'text-indigo-600 bg-white border-t-2 border-indigo-600' : 'text-slate-500'}`}>{t('logicState')}</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
               {inspectorTab === 'style' ? (
                 <>
                   {/* 1. VISUAL SETTINGS */}
                   <div className="space-y-4">
                      {/* Variant Switcher */}
                      {(selectedNode.type === 'Button' || selectedNode.type === 'Badge') && (
                         <div className="space-y-2">
                            <label className="text-[10px] font-medium text-slate-500">{t('variant')}</label>
                            <div className="flex flex-wrap gap-2">
                               {['primary','secondary','outline','ghost','danger','success','warning'].map(v => (
                                  <button 
                                    key={v}
                                    onClick={() => handlePropChange('variant', v)}
                                    className={`px-3 py-1 text-[10px] rounded-full border transition-all ${selectedNode.props.variant === v ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-bold' : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'}`}
                                  >
                                    {v}
                                  </button>
                               ))}
                            </div>
                         </div>
                      )}

                      {/* Tooltip & Animation */}
                      <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="text-[10px] font-medium text-slate-500 block mb-1">{t('animation')}</label>
                            <select 
                              className="w-full text-xs p-1.5 bg-white text-slate-900 border border-slate-200 rounded"
                              value={selectedNode.animation || 'none'}
                              onChange={(e) => handleLogicChange('animation', e.target.value)}
                            >
                               <option value="none">{t('none')}</option>
                               <option value="fade">{t('fade')}</option>
                               <option value="slideUp">{t('slideUp')}</option>
                               <option value="slideDown">{t('slideDown')}</option>
                               <option value="bounce">{t('bounce')}</option>
                               <option value="pulse">{t('pulse')}</option>
                               <option value="spin">{t('spin')}</option>
                            </select>
                         </div>
                         <div>
                            <label className="text-[10px] font-medium text-slate-500 block mb-1">{t('tooltip')}</label>
                            <input 
                              className="w-full text-xs p-1.5 bg-white text-slate-900 border border-slate-200 rounded"
                              value={selectedNode.tooltip || ''}
                              onChange={(e) => handleLogicChange('tooltip', e.target.value)}
                              placeholder="Hover text..."
                            />
                         </div>
                      </div>

                      {/* Dimensions (Simplified for brevity) */}
                      <div>
                        <label className="text-[10px] font-medium text-slate-500 mb-1 block">{t('width')}</label>
                        <div className="flex gap-1">
                          {['w-auto','w-full','w-1/2'].map(w => (
                             <button key={w} onClick={() => handleStyleToggle('className', w, /w-(\d+|full|auto|screen)/)} className={`flex-1 text-[10px] py-1 border rounded ${selectedNode.props.className?.includes(w) ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'bg-white text-slate-500'}`}>
                               {w.replace('w-', '')}
                             </button>
                          ))}
                        </div>
                      </div>

                      {/* Standard Props (Label, Placeholder, etc) */}
                      {selectedNode.type === 'Button' && (
                         <div>
                            <label className="text-[10px] font-medium text-slate-500 mb-1 block">{t('label')}</label>
                            <input className="w-full text-xs p-2 border rounded" value={selectedNode.props.label || ''} onChange={(e) => handlePropChange('label', e.target.value)} />
                         </div>
                      )}
                      {selectedNode.type === 'Text' && (
                         <div>
                            <label className="text-[10px] font-medium text-slate-500 mb-1 block">{t('content')}</label>
                            <textarea className="w-full text-xs p-2 border rounded" rows={3} value={selectedNode.props.content || ''} onChange={(e) => handlePropChange('content', e.target.value)} />
                         </div>
                      )}
                      
                      {/* AI Data Filler (DataList) */}
                      {selectedNode.type === 'DataList' && (
                        <div className="mt-4 p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                           <div className="flex items-center gap-2 mb-2">
                             <Sparkles className="w-3 h-3 text-indigo-600" />
                             <span className="text-xs font-bold text-indigo-900">{t('aiDataFiller')}</span>
                           </div>
                           <textarea className="w-full text-xs p-2 border border-indigo-200 rounded bg-white text-slate-900 focus:bg-white outline-none resize-none mb-2" rows={2} placeholder="e.g. 5 Tech Stocks..." value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} />
                           <button onClick={handleAiGenerate} disabled={isAiThinking || !aiPrompt} className="w-full py-1.5 bg-indigo-600 text-white text-xs rounded font-medium hover:bg-indigo-700 flex items-center justify-center gap-1">
                             {isAiThinking ? <Loader2 className="w-3 h-3 animate-spin"/> : t('generateData')}
                           </button>
                        </div>
                      )}
                   </div>
                 </>
               ) : (
                  // UNIFIED LOGIC TAB
                  <div className="space-y-6">
                     
                     {/* 1. VISIBILITY */}
                     <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                           <Eye className="w-3 h-3 text-slate-500" />
                           <span className="text-xs font-bold text-slate-800">{t('visibility')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] text-slate-400">Show if</span>
                           <div className="flex-1">
                             <VariableSelector 
                               value={selectedNode.visibleIf || ''} 
                               onChange={(v) => handleLogicChange('visibleIf', v)} 
                             />
                           </div>
                           <span className="text-[10px] text-slate-400">is true</span>
                        </div>
                     </div>

                     {/* 2. DATA BINDING */}
                     {['Input', 'Toggle', 'Checkbox', 'Slider', 'Select', 'Textarea'].includes(selectedNode.type) && (
                        <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                           <div className="flex items-center gap-2 mb-2">
                              <Database className="w-3 h-3 text-slate-500" />
                              <span className="text-xs font-bold text-slate-800">{t('dataBinding')}</span>
                           </div>
                           <VariableSelector 
                             value={selectedNode.bind || ''} 
                             onChange={(v) => handleLogicChange('bind', v)} 
                             placeholder="Bind to Variable..."
                           />
                           <div className="mt-2 text-[9px] text-slate-400">
                              Current Value: <span className="font-mono bg-slate-100 px-1 rounded">{runtimeState[selectedNode.bind || ''] || 'undefined'}</span>
                           </div>
                        </div>
                     )}

                     {/* 3. INTERACTION BUILDER */}
                     <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-1">{t('actions')}</h4>
                        
                        {/* HELPER FOR ACTIONS */}
                        {([
                           { label: t('clickAction'), prop: 'onClick', icon: MousePointer, hidden: false },
                           { label: t('hoverAction'), prop: 'onHover', icon: MousePointer2, hidden: false },
                           { label: t('blurAction'), prop: 'onBlur', icon: Activity, hidden: !['Input','Textarea'].includes(selectedNode.type) }
                        ] as const).filter(x => !x.hidden).map(evt => (
                           <div key={evt.prop} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                 <evt.icon className="w-3 h-3 text-indigo-600" />
                                 <span className="text-xs font-bold text-indigo-900">{evt.label}</span>
                              </div>
                              
                              <select 
                                 className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded mb-2"
                                 value={selectedNode[evt.prop]?.type || ''}
                                 onChange={(e) => handleLogicChange(evt.prop, e.target.value ? { type: e.target.value } : undefined)}
                              >
                                 <option value="">{t('noAction')}</option>
                                 <option value="toggle">{t('toggleVar')}</option>
                                 <option value="set">{t('setVar')}</option>
                                 <option value="alert">{t('showAlert')}</option>
                                 <option value="apiRequest">{t('apiReq')}</option>
                              </select>

                              {selectedNode[evt.prop]?.type && (
                                 <div className="pl-2 border-l-2 border-indigo-200 space-y-2">
                                    {(selectedNode[evt.prop]!.type === 'toggle' || selectedNode[evt.prop]!.type === 'set' || selectedNode[evt.prop]!.type === 'apiRequest') && (
                                       <VariableSelector 
                                          value={selectedNode[evt.prop]!.target || ''}
                                          onChange={(v) => handleLogicChange(evt.prop, { ...selectedNode[evt.prop], target: v })}
                                          placeholder="Target Variable..."
                                       />
                                    )}
                                    {(selectedNode[evt.prop]!.type === 'set' || selectedNode[evt.prop]!.type === 'alert') && (
                                       <input 
                                          className="w-full text-xs p-1.5 border rounded"
                                          placeholder={t('valMsg')}
                                          value={selectedNode[evt.prop]!.value || ''}
                                          onChange={(e) => handleLogicChange(evt.prop, { ...selectedNode[evt.prop], value: e.target.value })}
                                       />
                                    )}
                                    {selectedNode[evt.prop]!.type === 'apiRequest' && (
                                       <>
                                         <input 
                                            className="w-full text-xs p-1.5 border rounded"
                                            placeholder="https://api..."
                                            value={selectedNode[evt.prop]!.url || ''}
                                            onChange={(e) => handleLogicChange(evt.prop, { ...selectedNode[evt.prop], url: e.target.value })}
                                         />
                                         <select 
                                            className="w-full text-xs p-1.5 border rounded"
                                            value={selectedNode[evt.prop]!.method || 'GET'}
                                            onChange={(e) => handleLogicChange(evt.prop, { ...selectedNode[evt.prop], method: e.target.value })}
                                         >
                                            <option>GET</option><option>POST</option>
                                         </select>
                                       </>
                                    )}
                                 </div>
                              )}
                           </div>
                        ))}
                     </div>
                     
                     {/* 4. VARIABLES LIST (Managed here now) */}
                     <div className="pt-4 border-t border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-xs font-bold text-slate-700">{t('variables')}</span>
                           <span className="text-[10px] text-slate-400">{variableNames.length} defined</span>
                        </div>
                        <div className="space-y-1">
                           {variableNames.map(v => (
                              <div key={v} className="flex justify-between items-center text-[10px] bg-white p-1.5 border rounded">
                                 <span className="font-mono text-indigo-600">{v}</span>
                                 <span className="text-slate-400 truncate max-w-[80px]">{String(runtimeState[v])}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               )}
            </div>
          </aside>
        )}
      </div>

      {/* EXPORT MODAL */}
      {showExport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                 <h2 className="font-bold text-lg text-slate-800">{t('exportCode')}</h2>
                 <button onClick={() => setShowExport(false)} className="text-slate-400 hover:text-slate-600">
                    <LogOut className="w-5 h-5 rotate-180" />
                 </button>
              </div>
              <div className="flex border-b border-slate-100">
                 <button onClick={() => setExportTab('react')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${exportTab === 'react' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'}`}>React</button>
                 <button onClick={() => setExportTab('vue')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${exportTab === 'vue' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'}`}>Vue</button>
              </div>
              <div className="flex-1 overflow-auto bg-slate-900 p-4">
                 <pre className="font-mono text-xs text-indigo-100 leading-relaxed">{exportTab === 'react' ? generateReactCode(schema) : generateVueCode(schema)}</pre>
              </div>
              <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-xl">
                 <button onClick={() => setShowExport(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Close</button>
                 <button onClick={handleCopyCode} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-all">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? 'Copied!' : 'Copy to Clipboard'}</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
