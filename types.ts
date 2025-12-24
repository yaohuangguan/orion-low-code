
// Supported Component Types in our Low-Code Engine
export type ComponentType = 
  | 'Container' 
  | 'Button' 
  | 'DataList' 
  | 'Badge' 
  | 'Text'
  | 'Input'
  | 'Textarea'
  | 'Image'
  | 'Divider'
  | 'Avatar'
  | 'Toggle'
  | 'Checkbox'
  | 'Slider'
  | 'Progress'
  | 'Alert'
  | 'Select'
  | 'Card'
  | 'Spacer'
  // New Components (10)
  | 'Rating'
  | 'RadioGroup'
  | 'Breadcrumb'
  | 'Tag'
  | 'Statistic'
  | 'Quote'
  | 'Video'
  | 'Map'
  | 'Table'
  | 'CodeBlock';

// Logic Actions
export interface LogicAction {
  type: 'toggle' | 'set' | 'alert' | 'apiRequest'; 
  target?: string; // Variable name to modify
  value?: string; // Value to set or message to show
  url?: string; // API URL
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; // API Method
}

// Animation Presets
export type AnimationType = 'none' | 'fade' | 'slideUp' | 'slideDown' | 'bounce' | 'pulse' | 'spin';

// The Core JSON Schema Node
export interface SchemaNode {
  id: string; // Unique ID for targeting updates
  type: ComponentType;
  props: Record<string, any>; // Flexible props object
  children?: SchemaNode[]; // Recursive children
  
  // Visuals
  tooltip?: string; // Hover text
  animation?: AnimationType; // Entry animation
  
  // Logic & Interactivity
  bind?: string; // Variable name for two-way data binding
  visibleIf?: string; // Variable name: if truthy, show this component
  
  // Events
  onClick?: LogicAction; 
  onHover?: LogicAction; // New
  onBlur?: LogicAction; // New (for inputs)
}

// Structure for items inside the DataList component
export interface DataListItem {
  id: string;
  title: string;
  subtitle?: string;
  value?: string;
  badge?: string;
}

// AI Response structure expectation
export interface AIResponseData {
  items: DataListItem[];
}

// Mock User Type for Auth
export interface User {
  id: string;
  name: string;
  email: string;
}

// Project Structure
export interface SavedProject {
  id: string;
  name: string;
  schema: SchemaNode;
  updatedAt: number;
}

// Pre-built Templates
export interface Template {
  id: string;
  name: string;
  icon?: any;
  schema: SchemaNode;
}

// Editor Context State
export interface EditorState {
  selectedId: string | null;
  mode: 'design' | 'preview';
}
