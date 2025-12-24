
import React from 'react';
import { SchemaNode, LogicAction } from '../types';
import { 
  Container, Button, Badge, DataList, Text, Input, Textarea, Image,
  Divider, Avatar, Toggle, Checkbox, Slider, Progress, Alert, Select, Card, Spacer,
  Rating, RadioGroup, Breadcrumb, Tag, Statistic, Quote, Video, Map, Table, CodeBlock
} from './ui-library';

const ComponentMap: Record<string, React.FC<any>> = {
  Container,
  Button,
  Badge,
  DataList,
  Text,
  Input,
  Textarea,
  Image,
  Divider,
  Avatar,
  Toggle,
  Checkbox,
  Slider,
  Progress,
  Alert,
  Select,
  Card,
  Spacer,
  Rating,
  RadioGroup,
  Breadcrumb,
  Tag,
  Statistic,
  Quote,
  Video,
  Map,
  Table,
  CodeBlock
};

interface RendererProps {
  node: SchemaNode;
  selectedId: string | null;
  onSelect: (id: string) => void;
  mode: 'design' | 'preview';
  
  // Logic Engine Props
  runtimeState?: Record<string, any>;
  onAction?: (action: LogicAction) => void;
  onVariableChange?: (key: string, value: any) => void;
}

export const Renderer: React.FC<RendererProps> = ({ 
  node, 
  selectedId, 
  onSelect, 
  mode, 
  runtimeState = {}, 
  onAction,
  onVariableChange 
}) => {
  const Component = ComponentMap[node.type];

  if (!Component) {
    return <div className="p-2 border border-red-300 text-red-500 text-xs">Unknown: {node.type}</div>;
  }

  // 1. VISIBILITY CHECK (Preview Mode)
  if (mode === 'preview' && node.visibleIf) {
    if (!runtimeState[node.visibleIf]) {
      return null;
    }
  }

  // 2. PROPS RESOLUTION (Data Binding)
  const resolvedProps = { ...node.props };
  resolvedProps.tooltip = node.tooltip;
  resolvedProps.animation = node.animation;

  if (mode === 'preview' && node.bind) {
    const boundValue = runtimeState[node.bind];
    if (node.type === 'Toggle' || node.type === 'Checkbox') {
      resolvedProps.checked = !!boundValue;
    } else {
      resolvedProps.value = boundValue !== undefined ? boundValue : '';
    }
  }

  // 3. EVENT HANDLERS
  const handleSelect = (e: React.MouseEvent) => {
    onSelect(node.id);
  };

  const handleChange = (newValue: any) => {
    if (mode === 'design') return;
    if (node.bind && onVariableChange) {
      onVariableChange(node.bind, newValue);
    }
  };

  const handleClick = () => {
    if (mode === 'design') return;
    if (node.onClick && onAction) onAction(node.onClick);
  };

  const handleHover = () => {
    if (mode === 'design') return;
    if (node.onHover && onAction) onAction(node.onHover);
  };

  const handleBlur = () => {
    if (mode === 'design') return;
    if (node.onBlur && onAction) onAction(node.onBlur);
  };

  // 4. RECURSIVE RENDER
  const renderedChildren = node.children?.map((child) => (
    <Renderer 
      key={child.id} 
      node={child} 
      selectedId={selectedId}
      onSelect={onSelect}
      mode={mode}
      runtimeState={runtimeState}
      onAction={onAction}
      onVariableChange={onVariableChange}
    />
  ));

  return (
    <Component 
      {...resolvedProps} 
      id={node.id} 
      isSelected={selectedId === node.id}
      onSelect={handleSelect}
      mode={mode}
      onChange={handleChange}
      onClick={handleClick}
      onHover={handleHover}
      onBlur={handleBlur}
    >
      {renderedChildren}
    </Component>
  );
};
