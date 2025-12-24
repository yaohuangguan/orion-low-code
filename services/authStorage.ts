import { SchemaNode, User, SavedProject } from "../types";

// --- Mock Auth Service ---
// Simulates NextAuth.js behavior using localStorage

const USER_KEY = 'gemini_playground_user';
const PROJECTS_KEY = 'gemini_playground_projects';

export const authService = {
  login: (): User => {
    const mockUser: User = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      name: 'Demo Engineer',
      email: 'demo@example.com'
    };
    localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
    return mockUser;
  },

  logout: () => {
    localStorage.removeItem(USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }
};

// --- Mock Database Service ---
// Simulates saving/loading projects

export const storageService = {
  saveProject: (name: string, schema: SchemaNode): SavedProject => {
    const projects = storageService.getProjects();
    const newProject: SavedProject = {
      id: 'proj_' + Math.random().toString(36).substr(2, 9),
      name,
      schema,
      updatedAt: Date.now()
    };
    
    projects.push(newProject);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    return newProject;
  },

  getProjects: (): SavedProject[] => {
    const stored = localStorage.getItem(PROJECTS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  loadProject: (id: string): SavedProject | undefined => {
    const projects = storageService.getProjects();
    return projects.find(p => p.id === id);
  }
};
