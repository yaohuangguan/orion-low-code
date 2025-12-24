
import { SchemaNode, Template } from './types';
import { Layout, CreditCard, User, AlignJustify } from 'lucide-react';

// Initial JSON Schema to populate the playground on load
export const INITIAL_SCHEMA: SchemaNode = {
  id: 'root-container',
  type: 'Container',
  props: {
    className: 'max-w-4xl mx-auto p-8 space-y-6 bg-white shadow-2xl rounded-2xl min-h-[600px] border border-slate-100',
  },
  children: [
    {
      id: 'header-container',
      type: 'Container',
      props: { className: 'flex justify-between items-center border-b pb-4 mb-4' },
      children: [
        {
          id: 'title-text',
          type: 'Text',
          props: {
            content: 'Orion Dashboard',
            className: 'text-2xl font-bold text-slate-800 tracking-tight'
          }
        },
        {
          id: 'status-badge',
          type: 'Badge',
          props: { label: 'Orion Connected', variant: 'success' }
        }
      ]
    },
    {
      id: 'content-row',
      type: 'Container',
      props: { className: 'grid grid-cols-1 md:grid-cols-3 gap-6' },
      children: [
        {
          id: 'left-col',
          type: 'Container',
          props: { className: 'md:col-span-1 space-y-4' },
          children: [
             {
              id: 'profile-card',
              type: 'Card',
              props: { className: 'p-4 text-center space-y-3' },
              children: [
                {
                  id: 'profile-img',
                  type: 'Avatar',
                  props: {
                    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
                    alt: 'User Avatar',
                    className: 'w-24 h-24 mx-auto'
                  }
                },
                {
                  id: 'profile-name-input',
                  type: 'Input',
                  props: {
                    placeholder: 'Edit User Name',
                    defaultValue: 'Orion User',
                    className: 'text-center font-semibold'
                  }
                }
              ]
             }
          ]
        },
        {
          id: 'right-col',
          type: 'Container',
          props: { className: 'md:col-span-2 space-y-4' },
          children: [
            {
              id: 'market-list',
              type: 'DataList',
              props: {
                title: 'Analytics Data',
                description: 'Configure items manually',
                items: [
                  { id: '1', title: 'Phase 1', subtitle: 'Initial setup', value: '100%', badge: 'Done' },
                  { id: '2', title: 'Phase 2', subtitle: 'Implementation', value: '45%', badge: 'In Progress' }
                ]
              }
            },
            {
               id: 'action-bar',
               type: 'Container',
               props: { className: 'flex justify-end gap-2 pt-4 border-t border-slate-100' },
               children: [
                 { id: 'cancel-btn', type: 'Button', props: { label: 'Cancel', variant: 'ghost' } },
                 { id: 'save-btn', type: 'Button', props: { label: 'Save Changes', variant: 'primary' } }
               ]
            }
          ]
        }
      ]
    }
  ]
};

// --- Templates ---
export const TEMPLATES: Template[] = [
  {
    id: 'tpl_hero',
    name: 'Hero Section',
    icon: Layout,
    schema: {
      id: 'hero-root',
      type: 'Container',
      props: { className: 'text-center py-16 px-4 bg-slate-900 rounded-3xl text-white space-y-6' },
      children: [
        { id: 'h-title', type: 'Text', props: { content: 'Build with Orion', className: 'text-4xl font-extrabold tracking-tight' } },
        { id: 'h-sub', type: 'Text', props: { content: 'Drag, drop, and build rapidly.', className: 'text-slate-400 max-w-lg mx-auto' } },
        { id: 'h-actions', type: 'Container', props: { className: 'flex justify-center gap-4 pt-4' }, children: [
          { id: 'h-btn1', type: 'Button', props: { label: 'Get Started', variant: 'primary' } },
          { id: 'h-btn2', type: 'Button', props: { label: 'View Demo', variant: 'outline', className: 'bg-transparent text-white border-slate-700' } }
        ]}
      ]
    }
  },
  {
    id: 'tpl_pricing',
    name: 'Pricing Cards',
    icon: CreditCard,
    schema: {
      id: 'price-root',
      type: 'Container',
      props: { className: 'grid grid-cols-1 md:grid-cols-3 gap-4' },
      children: [
        { id: 'p-c1', type: 'Card', props: { className: 'p-6 space-y-4' }, children: [
          { id: 'p-t1', type: 'Text', props: { content: 'Basic', className: 'font-bold text-lg' } },
          { id: 'p-pr1', type: 'Text', props: { content: '$0/mo', className: 'text-3xl font-bold' } },
          { id: 'p-btn1', type: 'Button', props: { label: 'Select', variant: 'outline' } }
        ]},
        { id: 'p-c2', type: 'Card', props: { className: 'p-6 bg-slate-900 text-white space-y-4 scale-105' }, children: [
          { id: 'p-t2', type: 'Text', props: { content: 'Pro', className: 'font-bold text-lg text-indigo-400' } },
          { id: 'p-pr2', type: 'Text', props: { content: '$29/mo', className: 'text-3xl font-bold' } },
          { id: 'p-btn2', type: 'Button', props: { label: 'Select', variant: 'primary' } }
        ]},
        { id: 'p-c3', type: 'Card', props: { className: 'p-6 space-y-4' }, children: [
          { id: 'p-t3', type: 'Text', props: { content: 'Enterprise', className: 'font-bold text-lg' } },
          { id: 'p-pr3', type: 'Text', props: { content: 'Custom', className: 'text-3xl font-bold' } },
          { id: 'p-btn3', type: 'Button', props: { label: 'Contact', variant: 'outline' } }
        ]}
      ]
    }
  },
  {
    id: 'tpl_form',
    name: 'Contact Form',
    icon: User,
    schema: {
      id: 'form-root',
      type: 'Card',
      props: { className: 'max-w-md mx-auto p-6 space-y-4' },
      children: [
        { id: 'f-title', type: 'Text', props: { content: 'Contact Us', className: 'text-xl font-bold mb-2' } },
        { id: 'f-in1', type: 'Input', props: { placeholder: 'Your Name' } },
        { id: 'f-in2', type: 'Input', props: { placeholder: 'Email Address' } },
        { id: 'f-chk', type: 'Checkbox', props: { label: 'Subscribe to newsletter' } },
        { id: 'f-btn', type: 'Button', props: { label: 'Send Message', variant: 'primary', className: 'w-full' } }
      ]
    }
  }
];
