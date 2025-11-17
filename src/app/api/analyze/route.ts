import { NextRequest, NextResponse } from 'next/server';
import { AIServiceFactory } from '@/services/ai/AIServiceFactory';
import { AnalyzeRequest, AnalyzeResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    const { code, model } = body;

    if (!code || !code.trim()) {
      return NextResponse.json<AnalyzeResponse>(
        { success: false, error: 'VHDL code is required' },
        { status: 400 }
      );
    }

    if (!model) {
      return NextResponse.json<AnalyzeResponse>(
        { success: false, error: 'Model selection is required' },
        { status: 400 }
      );
    }

    const aiService = AIServiceFactory.createService(model);
    const result = await aiService.analyzeVHDL(code);

    return NextResponse.json<AnalyzeResponse>({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json<AnalyzeResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed',
      },
      { status: 500 }
    );
  }
}

