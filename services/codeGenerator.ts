
import { SchemaNode, DataListItem } from '../types';

/**
 * UTILITIES
 */
const indent = (level: number) => '  '.repeat(level);

const getPropsString = (props: Record<string, any>, exclude: string[] = []) => {
  return Object.entries(props)
    .filter(([key]) => !exclude.includes(key) && key !== 'children' && key !== 'items' && key !== 'content')
    .map(([key, value]) => {
      if (key === 'className') return `className="${value}"`; // React specific
      if (typeof value === 'string') return `${key}="${value}"`;
      return `${key}={${JSON.stringify(value)}}`;
    })
    .join(' ');
};

const getVuePropsString = (props: Record<string, any>, exclude: string[] = []) => {
  return Object.entries(props)
    .filter(([key]) => !exclude.includes(key) && key !== 'children' && key !== 'items' && key !== 'content')
    .map(([key, value]) => {
      if (key === 'className') return `class="${value}"`; // Vue uses class
      if (typeof value === 'string') return `${key}="${value}"`;
      return `:${key}="${JSON.stringify(value).replace(/"/g, "'")}"`;
    })
    .join(' ');
};

/**
 * REACT GENERATOR
 */
export const generateReactCode = (node: SchemaNode): string => {
  const generate = (n: SchemaNode, level: number): string => {
    const pad = indent(level);
    const { type, props, children } = n;

    // 1. Container -> div
    if (type === 'Container') {
      const propsStr = getPropsString(props);
      if (!children || children.length === 0) {
        return `${pad}<div ${propsStr} />`;
      }
      return `${pad}<div ${propsStr}>\n${children.map(c => generate(c, level + 1)).join('\n')}\n${pad}</div>`;
    }

    // 2. Button -> button
    if (type === 'Button') {
      // Map variant to simpler tailwind classes for export (mock logic)
      const variantClass = props.variant === 'primary' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-800';
      const finalClass = `${props.className || ''} px-4 py-2 rounded-lg ${variantClass}`.trim();
      return `${pad}<button className="${finalClass}">${props.label}</button>`;
    }

    // 3. Text -> p/h1
    if (type === 'Text') {
      return `${pad}<div className="${props.className || ''}">${props.content}</div>`;
    }

    // 4. DataList -> Custom Mapping
    if (type === 'DataList') {
      const items = props.items as DataListItem[] || [];
      const itemsJson = JSON.stringify(items);
      return `${pad}<div className="${props.className || ''} border rounded-xl overflow-hidden">
${pad}  <div className="bg-slate-50 p-3 font-bold border-b">${props.title}</div>
${pad}  {${itemsJson}.map((item) => (
${pad}    <div key={item.id} className="p-3 border-b last:border-0 flex justify-between">
${pad}      <span>{item.title}</span>
${pad}      <span className="font-mono">{item.value}</span>
${pad}    </div>
${pad}  ))}
${pad}</div>`;
    }

    // Fallback for others (Input, Badge, etc.)
    let tagName = 'div';
    let content = '';
    if (type === 'Input') tagName = 'input';
    if (type === 'Image') tagName = 'img';
    if (type === 'Badge') { tagName = 'span'; content = props.label; }

    const propsStr = getPropsString(props);
    
    if (tagName === 'input' || tagName === 'img') {
        return `${pad}<${tagName} ${propsStr} />`;
    }
    
    return `${pad}<${tagName} ${propsStr}>${content}</${tagName}>`;
  };

  return `import React from 'react';

export default function ExportedComponent() {
  return (
${generate(node, 2)}
  );
}`;
};

/**
 * VUE GENERATOR
 */
export const generateVueCode = (node: SchemaNode): string => {
  const generate = (n: SchemaNode, level: number): string => {
    const pad = indent(level);
    const { type, props, children } = n;

    if (type === 'Container') {
      const propsStr = getVuePropsString(props);
      if (!children || children.length === 0) return `${pad}<div ${propsStr}></div>`;
      return `${pad}<div ${propsStr}>\n${children.map(c => generate(c, level + 1)).join('\n')}\n${pad}</div>`;
    }

    if (type === 'Button') {
      const variantClass = props.variant === 'primary' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-800';
      const finalClass = `${props.className || ''} px-4 py-2 rounded-lg ${variantClass}`.trim();
      return `${pad}<button class="${finalClass}">${props.label}</button>`;
    }

    if (type === 'Text') {
      return `${pad}<div class="${props.className || ''}">${props.content}</div>`;
    }

    if (type === 'DataList') {
      const items = props.items as DataListItem[] || [];
      // In Vue, we usually put data in script, but for inline simplicity we iterate a static array or check script
      // For this export, let's assume we put the data in script and use it here.
      // But to keep it single-template compatible for copy-paste:
      const itemsJson = JSON.stringify(items).replace(/"/g, "'");
      return `${pad}<div class="${props.className || ''} border rounded-xl overflow-hidden">
${pad}  <div class="bg-slate-50 p-3 font-bold border-b">${props.title}</div>
${pad}  <div v-for="item in ${itemsJson}" :key="item.id" class="p-3 border-b last:border-0 flex justify-between">
${pad}    <span>{{ item.title }}</span>
${pad}    <span class="font-mono">{{ item.value }}</span>
${pad}  </div>
${pad}</div>`;
    }

    let tagName = 'div';
    let content = '';
    if (type === 'Input') tagName = 'input';
    if (type === 'Image') tagName = 'img';
    if (type === 'Badge') { tagName = 'span'; content = props.label; }

    const propsStr = getVuePropsString(props);
    if (tagName === 'input' || tagName === 'img') return `${pad}<${tagName} ${propsStr} />`;
    return `${pad}<${tagName} ${propsStr}>${content}</${tagName}>`;
  };

  return `<template>
${generate(node, 1)}
</template>

<script setup>
// No reactive state needed for static export
</script>`;
};
