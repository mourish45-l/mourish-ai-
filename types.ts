export interface GeneratedCode {
  code: string;
  language: string;
  explanation: string;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export enum ViewMode {
  EDITOR = 'EDITOR',
  PREVIEW = 'PREVIEW',
  SPLIT = 'SPLIT'
}

export interface AppState {
  generated: GeneratedCode | null;
  history: Message[];
  isLoading: boolean;
  viewMode: ViewMode;
}