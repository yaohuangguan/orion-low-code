import { SchemaNode } from "../types";

/**
 * CollaborationService
 * 
 * Uses the BroadcastChannel API to simulate WebSocket-like behavior across browser tabs.
 * In a real Next.js deployment, this would use Socket.IO or Pusher connecting to a backend.
 * 
 * This allows "Simulated" real-time collaboration where if you open the app in two tabs,
 * updates in one tab are instantly reflected in the other.
 */

type Listener = (schema: SchemaNode) => void;

export class CollaborationService {
  private channel: BroadcastChannel;
  private listeners: Listener[] = [];

  constructor() {
    this.channel = new BroadcastChannel('gemini_playground_sync');
    
    this.channel.onmessage = (event) => {
      if (event.data && event.data.type === 'SCHEMA_UPDATE') {
        this.notifyListeners(event.data.payload);
      }
    };
    
    console.log("[Collaboration] Service started. Open a second tab to test sync.");
  }

  public subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(schema: SchemaNode) {
    this.listeners.forEach(listener => listener(schema));
  }

  public broadcastUpdate(schema: SchemaNode) {
    this.channel.postMessage({
      type: 'SCHEMA_UPDATE',
      payload: schema
    });
  }

  public close() {
    this.channel.close();
  }
}

// Singleton instance
export const collabService = new CollaborationService();
