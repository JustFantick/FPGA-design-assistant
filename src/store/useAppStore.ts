import { create } from 'zustand';
import { AIModel, AnalysisResult } from '@/types';

interface AppState {
  vhdlCode: string;
  selectedModel: AIModel;
  analysisResult: AnalysisResult | null;
  isAnalyzing: boolean;
  error: string | null;
  
  setVhdlCode: (code: string) => void;
  setSelectedModel: (model: AIModel) => void;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setError: (error: string | null) => void;
  resetStore: () => void;
}

const initialState = {
  vhdlCode: '',
  selectedModel: 'claude-sonnet-4.5' as AIModel,
  analysisResult: null,
  isAnalyzing: false,
  error: null,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,
  
  setVhdlCode: (code) => set({ vhdlCode: code }),
  
  setSelectedModel: (model) => set({ selectedModel: model }),
  
  setAnalysisResult: (result) => set({ analysisResult: result, error: null }),
  
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  
  setError: (error) => set({ error, analysisResult: null }),
  
  resetStore: () => set(initialState),
}));

