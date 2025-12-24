
import React, { useState, useEffect } from 'react';
import { DataListItem, AnimationType } from '../types';
import { 
  List, Activity, ChevronRight, Image as ImageIcon, Check, Info, ToggleLeft, User as UserIcon,
  Star, MapPin, Play, Quote as QuoteIcon, Hash
} from 'lucide-react';

// --- Base Interface ---
interface BaseProps {
  className?: string;
  children?: React.ReactNode;
  id?: string;
  // Visuals
  tooltip?: string;
  animation?: AnimationType;
  // Editor Props
  isSelected?: boolean;
  onSelect?: (e: React.MouseEvent) => void;
  mode?: 'design' | 'preview';
  // Event Handlers for Logic
  onClick?: () => void;
  onHover?: () => void;
  onBlur?: () => void;
  onChange?: (value: any) => void;
  // Values for controlled components
  checked?: boolean;
  value?: string | number;
}

// Helper to handle styles, animations, and tooltips
const useEditorInteractions = (props: BaseProps) => {
  const { isSelected, onSelect, mode, className = '', onClick, onHover, animation, tooltip } = props;
  
  const handleClick = (e: React.MouseEvent) => {
    if (mode === 'design') {
      e.stopPropagation(); 
      onSelect?.(e);
    } else {
      // In preview, only trigger if we have an onClick handler from Renderer
      onClick?.();
    }
  };

  const handleMouseEnter = () => {
    if (mode === 'preview') onHover?.();
  };

  // Animation Classes
  let animClass = '';
  switch (animation) {
    case 'fade': animClass = 'animate-[fadeIn_0.5s_ease-out]'; break;
    case 'slideUp': animClass = 'animate-[slideUp_0.5s_ease-out]'; break;
    case 'slideDown': animClass = 'animate-[slideDown_0.5s_ease-out]'; break;
    case 'bounce': animClass = 'animate-bounce'; break;
    case 'pulse': animClass = 'animate-pulse'; break;
    case 'spin': animClass = 'animate-spin'; break;
  }

  // Selection Ring & Cursor Logic
  // Important: In preview, if onClick is present, show pointer cursor
  const cursorClass = mode === 'design' ? 'cursor-default' : (onClick ? 'cursor-pointer' : '');
  const selectionStyle = isSelected && mode === 'design' 
    ? 'ring-2 ring-indigo-500 ring-offset-2 relative z-10' 
    : mode === 'design' ? 'hover:ring-1 hover:ring-indigo-300' : '';

  // Tooltip Logic
  const tooltipProps = mode === 'preview' && tooltip ? { title: tooltip } : {};

  return {
    combinedClassName: `${className} ${selectionStyle} ${animClass} ${cursorClass}`.trim(),
    interactionProps: {
      onClick: handleClick,
      onMouseEnter: handleMouseEnter,
      ...tooltipProps
    }
  };
};

// 1. Container
export const Container: React.FC<BaseProps> = (props) => {
  const { combinedClassName, interactionProps } = useEditorInteractions(props);
  return <div id={props.id} className={combinedClassName} {...interactionProps}>{props.children}</div>;
};

// 2. Text
export const Text: React.FC<BaseProps & { content: string }> = (props) => {
  const { combinedClassName, interactionProps } = useEditorInteractions(props);
  return <div id={props.id} className={combinedClassName} {...interactionProps}>{props.content}</div>;
};

// 3. Button
interface ButtonProps extends BaseProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
}
export const Button: React.FC<ButtonProps> = (props) => {
  const { combinedClassName, interactionProps } = useEditorInteractions(props);
  
  const variants = {
    primary: "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 active:scale-95",
    secondary: "bg-slate-800 text-white shadow-sm hover:bg-slate-900 active:scale-95",
    outline: "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 active:scale-95",
    ghost: "text-slate-600 hover:bg-slate-100 active:scale-95",
    danger: "bg-red-500 text-white hover:bg-red-600 active:scale-95"
  };

  return (
    <button 
      id={props.id} 
      {...interactionProps}
      className={`px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${variants[props.variant || 'primary']} ${combinedClassName}`}
    >
      {props.label}
    </button>
  );
};

// 4. Badge
interface BadgeProps extends BaseProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}
export const Badge: React.FC<BadgeProps> = (props) => {
  const { combinedClassName, interactionProps } = useEditorInteractions(props);
  const styles = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    error: "bg-rose-100 text-rose-700"
  };

  return (
    <span id={props.id} {...interactionProps} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[props.variant || 'default']} ${combinedClassName}`}>
      {props.label}
    </span>
  );
};

// 5. DataList
interface DataListProps extends BaseProps {
  title: string;
  description?: string;
  items: DataListItem[];
  filterQuery?: string;
  sortKey?: 'title' | 'value';
  sortOrder?: 'asc' | 'desc' | 'none';
}

export const DataList: React.FC<DataListProps> = (props) => {
  const { combinedClassName, interactionProps } = useEditorInteractions(props);
  const { title, description, items = [], filterQuery = '', sortKey = 'title', sortOrder = 'none' } = props;

  const processedItems = React.useMemo(() => {
    let result = [...items];
    if (filterQuery) {
      const q = filterQuery.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(q) || 
        item.subtitle?.toLowerCase().includes(q) ||
        item.value?.toLowerCase().includes(q)
      );
    }
    if (sortOrder !== 'none') {
      result.sort((a, b) => {
        const valA = (a[sortKey] || '').toString().toLowerCase();
        const valB = (b[sortKey] || '').toString().toLowerCase();
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [items, filterQuery, sortKey, sortOrder]);

  return (
    <div id={props.id} {...interactionProps} className={`bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm ${combinedClassName}`}>
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <List className="w-4 h-4 text-indigo-500" />
          {title}
        </h3>
        {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
      </div>
      <div className="divide-y divide-slate-100 min-h-[50px]">
        {processedItems.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs italic">
            {items.length === 0 ? "List is empty. Use Orion AI to fill data." : "No items match your filter."}
          </div>
        ) : (
          processedItems.map((item) => (
            <div key={item.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                   <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.title}</p>
                  {item.subtitle && <p className="text-xs text-slate-500">{item.subtitle}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {item.value && <span className="text-sm font-mono font-semibold text-slate-700">{item.value}</span>}
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.badge.includes('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {item.badge}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// 6. Input (Auto-State Enabled)
interface InputProps extends BaseProps {
  placeholder?: string;
  type?: string;
  defaultValue?: string;
}
export const Input: React.FC<InputProps> = (props) => {
  const { combinedClassName, interactionProps } = useEditorInteractions(props);
  const [localValue, setLocalValue] = useState(props.defaultValue || '');
  const displayValue = props.value !== undefined ? props.value : localValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (props.mode === 'design') return;
    setLocalValue(e.target.value);
    props.onChange?.(e.target.value);
  };

  return (
    <input
      id={props.id}
      {...interactionProps}
      type={props.type || "text"}
      readOnly={props.mode === 'design'}
      placeholder={props.placeholder}
      value={displayValue} 
      onChange={handleChange}
      onBlur={() => props.mode === 'preview' && props.onBlur?.()}
      className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 ${combinedClassName}`}
    />
  );
};

// 7. Textarea (Auto-State Enabled)
interface TextareaProps extends BaseProps {
  placeholder?: string;
  rows?: number;
  defaultValue?: string;
}
export const Textarea: React.FC<TextareaProps> = (props) => {
  const { combinedClassName, interactionProps } = useEditorInteractions(props);
  const [localValue, setLocalValue] = useState(props.defaultValue || '');
  const displayValue = props.value !== undefined ? props.value : localValue;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (props.mode === 'design') return;
    setLocalValue(e.target.value);
    props.onChange?.(e.target.value);
  };

  return (
    <textarea
      id={props.id}
      {...interactionProps}
      rows={props.rows || 3}
      readOnly={props.mode === 'design'}
      placeholder={props.placeholder}
      value={displayValue}
      onChange={handleChange}
      onBlur={() => props.mode === 'preview' && props.onBlur?.()}
      className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 resize-y ${combinedClassName}`}
    />
  );
};

// 8. Image
export const Image: React.FC<BaseProps & { src?: string; alt?: string }> = (props) => {
  const { combinedClassName, interactionProps } = useEditorInteractions(props);
  const [error, setError] = React.useState(false);

  if (!props.src || error) {
    return (
      <div id={props.id} {...interactionProps} className={`flex flex-col items-center justify-center bg-slate-50 text-slate-400 rounded-lg border-2 border-dashed border-slate-200 p-8 min-h-[100px] ${combinedClassName}`}>
        <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
        <span className="text-xs font-medium">Image Component</span>
      </div>
    );
  }

  return (
    <img
      id={props.id}
      {...interactionProps}
      src={props.src}
      alt={props.alt || "Image"}
      onError={() => setError(true)}
      className={`object-cover rounded-lg block max-w-full ${combinedClassName}`}
    />
  );
};

// 9. Card
export const Card: React.FC<BaseProps> = (props) => {
  const { combinedClassName, interactionProps } = useEditorInteractions(props);
  const defaultClasses = "bg-white border border-slate-200 shadow-sm rounded-xl";
  const finalClass = props.className ? combinedClassName : `${defaultClasses} ${combinedClassName}`;
  return <div id={props.id} className={finalClass} {...interactionProps}>{props.children}</div>;
};

// 10. Divider
export const Divider: React.FC<BaseProps> = (props) => {
  const { combinedClassName, interactionProps } = useEditorInteractions(props);
  return <hr id={props.id} className={`border-t border-slate-200 my-4 w-full ${combinedClassName}`} {...interactionProps} />;
};

// 11. Avatar
interface AvatarProps extends BaseProps { src?: string; initials?: string; }
export const Avatar: React.FC<AvatarProps> = (props) => {
  const { combinedClassName, interactionProps } = useEditorInteractions(props);
  return (
    <div id={props.id} className={`w-12 h-12 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center border-2 border-white shadow-sm ${combinedClassName}`} {...interactionProps}>
      {props.src ? (
        <img src={props.src} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        <span className="font-bold text-slate-500">{props.initials || <UserIcon className="w-6 h-6"/>}</span>
      )}
    </div>
  );
};

// 12. Toggle (Auto-State Enabled)
interface ToggleProps extends BaseProps { label?: string; }
export const Toggle: React.FC<ToggleProps> = (props) => {
  const { combinedClassName, interactionProps } = useEditorInteractions(props);
  const [localChecked, setLocalChecked] = useState(false);
  const isChecked = props.checked !== undefined ? props.checked : localChecked;

  const handleToggle = () => {
    if (props.mode === 'design') return;
    setLocalChecked(!isChecked);
    props.onChange?.(!isChecked);
  };

  return (
    <div 
      id={props.id} 
      className={`flex items-center gap-3 ${combinedClassName}`} 
      {...interactionProps}
      onClick={(e) => { 
        interactionProps.onClick(e); 
        handleToggle();
      }}
    >
      <div className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${isChecked ? 'bg-indigo-600' : 'bg-slate-200'}`}>
        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isChecked ? 'translate-x-5' : ''}`}></div>
      </div>
      {props.label && <span className="text-sm font-medium text-slate-700">{props.label}</span>}
    </div>
  );
};

// 13. Checkbox (Auto-State Enabled)
interface CheckboxProps extends BaseProps { label?: string; }
export const Checkbox: React.FC<CheckboxProps> = (props) => {
  const { combinedClassName, interactionProps } = useEditorInteractions(props);
  const [localChecked, setLocalChecked] = useState(false);
  const isChecked = props.checked !== undefined ? props.checked : localChecked;

  const handleCheck = (e: React.MouseEvent) => {
     if (props.mode === 'design') {
         e.preventDefault();
         return;
     }
     setLocalChecked(!isChecked);
     props.onChange?.(!isChecked);
  };

  return (
    <label 
        id={props.id} 
        className={`flex items-center gap-2 cursor-pointer ${combinedClassName}`} 
        {...interactionProps} 
        onClick={(e) => {
            interactionProps.onClick(e);
            handleCheck(e);
        }}
    >
      <input 
        type="checkbox" 
        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 pointer-events-none" 
        checked={!!isChecked} 
        readOnly
      />
      {props.label && <span className="text-sm text-slate-700">{props.label}</span>}
    </label>
  );
};

// 14. Slider (Auto-State Enabled)
interface SliderProps extends BaseProps { min?: number; max?: number; defaultValue?: number; }
export const Slider: React.FC<SliderProps> = (props) => {
  const { combinedClassName, interactionProps } = useEditorInteractions(props);
  const [localValue, setLocalValue] = useState(props.defaultValue || 50);
  const displayValue = props.value !== undefined ? props.value : localValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (props.mode === 'design') return;
    const v = Number(e.target.value);
    setLocalValue(v);
    props.onChange?.(v);
  };

  return (
    <input 
      id={props.id}
      type="range" 
      min={props.min || 0} max={props.max || 100} 
      value={displayValue}
      onChange={handleChange}
      className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 ${combinedClassName}`}
      disabled={props.mode === 'design'}
      {...interactionProps}
    />
  );
};

// 15. Progress
export const Progress: React.FC<BaseProps & { value: number }> = (props) => {
  const { combinedClassName, interactionProps } = useEditorInteractions(props);
  return (
    <div id={props.id} className={`w-full bg-slate-100 rounded-full h-2.5 overflow-hidden ${combinedClassName}`} {...interactionProps}>
      <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, props.value || 0))}%` }}></div>
    </div>
  );
};

// 16. Alert
export const Alert: React.FC<BaseProps & { title: string; type?: string }> = (props) => {
  const { combinedClassName, interactionProps } = useEditorInteractions(props);
  const colors: any = {
    info: "bg-blue-50 text-blue-800 border-blue-200",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    error: "bg-rose-50 text-rose-800 border-rose-200"
  };
  return (
    <div id={props.id} className={`p-4 mb-4 text-sm rounded-lg border flex items-start gap-3 ${colors[props.type || 'info']} ${combinedClassName}`} {...interactionProps}>
      <Info className="w-5 h-5 shrink-0" />
      <div>
        <span className="font-bold block mb-1">{props.title}</span>
        {props.children}
      </div>
    </div>
  );
};

// 17. Select (Auto-State)
export const Select: React.FC<BaseProps & { options?: string[] }> = (props) => {
  const { combinedClassName, interactionProps } = useEditorInteractions(props);
  const [localValue, setLocalValue] = useState(props.options?.[0] || '');
  const displayValue = props.value !== undefined ? props.value : localValue;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if(props.mode === 'design') return;
      setLocalValue(e.target.value);
      props.onChange?.(e.target.value);
  }

  return (
    <select 
      id={props.id} 
      className={`bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 ${combinedClassName}`} 
      disabled={props.mode === 'design'} 
      value={displayValue}
      onChange={handleChange}
      {...interactionProps}
    >
      {(props.options || ['Option 1', 'Option 2']).map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  );
};

// 18. Spacer
export const Spacer: React.FC<BaseProps & { height?: number }> = (props) => {
  const { combinedClassName, interactionProps } = useEditorInteractions(props);
  const h = props.height || 4; 
  return <div id={props.id} className={`w-full ${combinedClassName}`} style={{ height: `${h * 0.25}rem` }} {...interactionProps}></div>;
};

// --- NEW COMPONENTS (10) ---

// 19. Rating
export const Rating: React.FC<BaseProps & { max?: number }> = (props) => {
  const { combinedClassName, interactionProps } = useEditorInteractions(props);
  const [localVal, setLocalVal] = useState(3);
  const val = props.value ? Number(props.value) : localVal;
  const max = props.max || 5;

  return (
    <div id={props.id} className={`flex gap-1 ${combinedClassName}`} {...interactionProps}>
      {Array.from({ length: max }).map((_, i) => (
        <Star 
          key={i} 
          className={`w-5 h-5 cursor-pointer ${i < val ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
          onClick={(e) => {
            if (props.mode === 'design') return;
            e.stopPropagation(); // prevent parent click
            setLocalVal(i + 1);
            props.onChange?.(i + 1);
          }}
        />
      ))}
    </div>
  );
};

// 20. RadioGroup
export const RadioGroup: React.FC<BaseProps & { options?: string[] }> = (props) => {
  const { combinedClassName, interactionProps } = useEditorInteractions(props);
  const [localVal, setLocalVal] = useState(props.options?.[0] || '');
  const val = props.value !== undefined ? props.value : localVal;
  const opts = props.options || ['Option A', 'Option B', 'Option C'];

  return (
    <div id={props.id} className={`space-y-2 ${combinedClassName}`} {...interactionProps}>
      {opts.map(opt => (
        <div 
          key={opt} 
          className="flex items-center gap-2 cursor-pointer"
          onClick={(e) => {
             if (props.mode === 'design') return;
             e.stopPropagation();
             setLocalVal(opt);
             props.onChange?.(opt);
          }}
        >
          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${val === opt ? 'border-indigo-600' : 'border-slate-300'}`}>
            {val === opt && <div className="w-2 h-2 rounded-full bg-indigo-600"></div>}
          </div>
          <span className="text-sm text-slate-700">{opt}</span>
        </div>
      ))}
    </div>
  );
};

// 21. Breadcrumb
export const Breadcrumb: React.FC<BaseProps & { items?: string[] }> = (props) => {
  const { combinedClassName, interactionProps } = useEditorInteractions(props);
  const items = props.items || ['Home', 'Section', 'Page'];
  
  return (
    <div id={props.id} className={`flex items-center text-sm text-slate-500 ${combinedClassName}`} {...interactionProps}>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          <span className={i === items.length - 1 ? 'font-semibold text-slate-900' : 'hover:text-indigo-600 cursor-pointer'}>{item}</span>
          {i < items.length - 1 && <ChevronRight className="w-4 h-4 mx-1" />}
        </React.Fragment>
      ))}
    </div>
  );
};

// 22. Tag
export const Tag: React.FC<BaseProps & { label: string }> = (props) => {
  const { combinedClassName, interactionProps } = useEditorInteractions(props);
  return (
    <span id={props.id} className={`inline-flex items-center px-3 py-1 rounded bg-slate-100 text-slate-700 text-xs border border-slate-200 ${combinedClassName}`} {...interactionProps}>
      <Hash className="w-3 h-3 mr-1 opacity-50"/>
      {props.label || 'Tag'}
    </span>
  );
};

// 23. Statistic
export const Statistic: React.FC<BaseProps & { label: string, value: string, trend?: string }> = (props) => {
  const { combinedClassName, interactionProps } = useEditorInteractions(props);
  return (
    <div id={props.id} className={`flex flex-col ${combinedClassName}`} {...interactionProps}>
      <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">{props.label || 'Metric'}</span>
      <span className="text-2xl font-bold text-slate-900 mt-1">{props.value || '0'}</span>
      {props.trend && <span className="text-xs text-emerald-600 font-medium mt-1">{props.trend}</span>}
    </div>
  );
};

// 24. Quote
export const Quote: React.FC<BaseProps & { content: string, author?: string }> = (props) => {
  const { combinedClassName, interactionProps } = useEditorInteractions(props);
  return (
    <div id={props.id} className={`border-l-4 border-indigo-500 pl-4 py-2 italic text-slate-700 bg-slate-50 rounded-r-lg ${combinedClassName}`} {...interactionProps}>
      <QuoteIcon className="w-4 h-4 text-indigo-300 mb-1" />
      <p>{props.content || 'Quote goes here.'}</p>
      {props.author && <span className="text-xs text-slate-500 not-italic block mt-2">- {props.author}</span>}
    </div>
  );
};

// 25. Video
export const Video: React.FC<BaseProps & { src?: string }> = (props) => {
  const { combinedClassName, interactionProps } = useEditorInteractions(props);
  // Placeholder video logic
  return (
    <div id={props.id} className={`w-full aspect-video bg-black rounded-lg overflow-hidden relative group ${combinedClassName}`} {...interactionProps}>
      <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80" className="w-full h-full object-cover opacity-60" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform cursor-pointer">
          <Play className="w-8 h-8 text-white fill-current ml-1" />
        </div>
      </div>
      <span className="absolute bottom-4 left-4 text-white text-sm font-medium">Video Component (Placeholder)</span>
    </div>
  );
};

// 26. Map
export const Map: React.FC<BaseProps> = (props) => {
  const { combinedClassName, interactionProps } = useEditorInteractions(props);
  return (
    <div id={props.id} className={`w-full h-48 bg-slate-100 rounded-xl overflow-hidden relative ${combinedClassName}`} {...interactionProps}>
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80')] bg-cover bg-center opacity-50 grayscale"></div>
      <div className="absolute inset-0 flex items-center justify-center">
         <MapPin className="w-8 h-8 text-rose-500 animate-bounce" />
      </div>
    </div>
  );
};

// 27. Table
export const Table: React.FC<BaseProps & { headers?: string[], rows?: string[][] }> = (props) => {
  const { combinedClassName, interactionProps } = useEditorInteractions(props);
  const headers = props.headers || ['Name', 'Role', 'Status'];
  const rows = props.rows || [['Alice', 'Dev', 'Active'], ['Bob', 'Designer', 'Offline']];

  return (
    <div id={props.id} className={`overflow-x-auto border border-slate-200 rounded-lg ${combinedClassName}`} {...interactionProps}>
      <table className="w-full text-sm text-left text-slate-500">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
          <tr>
            {headers.map(h => <th key={h} className="px-6 py-3">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="bg-white border-b hover:bg-slate-50">
              {row.map((cell, j) => <td key={j} className="px-6 py-4">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// 28. CodeBlock
export const CodeBlock: React.FC<BaseProps & { code?: string }> = (props) => {
  const { combinedClassName, interactionProps } = useEditorInteractions(props);
  const code = props.code || `const hello = "world";\nconsole.log(hello);`;

  return (
    <pre id={props.id} className={`bg-slate-900 text-indigo-300 p-4 rounded-lg text-xs font-mono overflow-x-auto ${combinedClassName}`} {...interactionProps}>
      <code>{code}</code>
    </pre>
  );
};
