import { create } from 'zustand';
import { AIModel, AnalysisResult, TestbenchResult } from '@/types';

interface AppState {
  vhdlCode: string;
  selectedModel: AIModel;
  analysisResult: AnalysisResult | null;
  isAnalyzing: boolean;
  testbenchResult: TestbenchResult | null;
  isGeneratingTestbench: boolean;
  error: string | null;

  setVhdlCode: (code: string) => void;
  setSelectedModel: (model: AIModel) => void;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setTestbenchResult: (result: TestbenchResult | null) => void;
  setIsGeneratingTestbench: (isGenerating: boolean) => void;
  setError: (error: string | null) => void;
  resetStore: () => void;
}

const initialState = {
  vhdlCode: '',
  selectedModel: 'claude-sonnet-4.5' as AIModel,
  analysisResult: null,
  isAnalyzing: false,
  testbenchResult: null,
  isGeneratingTestbench: false,
  error: null,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setVhdlCode: (code) => set({ vhdlCode: code, analysisResult: null, testbenchResult: null }),

  setSelectedModel: (model) => set({ selectedModel: model }),

  setAnalysisResult: (result) => set({ analysisResult: result, error: null }),

  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),

  setTestbenchResult: (result) => set({ testbenchResult: result, error: null }),

  setIsGeneratingTestbench: (isGenerating) => set({ isGeneratingTestbench: isGenerating }),

  setError: (error) => set({ error, analysisResult: null }),

  resetStore: () => set(initialState),
}));
