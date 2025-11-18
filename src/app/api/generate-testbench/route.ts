import { NextRequest, NextResponse } from 'next/server';
import { AIServiceFactory } from '@/services/ai/AIServiceFactory';
import { GenerateTestbenchRequest, GenerateTestbenchResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateTestbenchRequest = await request.json();
    const { code, scenario, model } = body;

    if (!code || !code.trim()) {
      return NextResponse.json<GenerateTestbenchResponse>(
        { success: false, error: 'VHDL code is required' },
        { status: 400 }
      );
    }

    if (!scenario || !scenario.description || !scenario.description.trim()) {
      return NextResponse.json<GenerateTestbenchResponse>(
        { success: false, error: 'Test scenario description is required' },
        { status: 400 }
      );
    }

    if (!model) {
      return NextResponse.json<GenerateTestbenchResponse>(
        { success: false, error: 'Model selection is required' },
        { status: 400 }
      );
    }

    const aiService = AIServiceFactory.createService(model);
    const testbenchCode = await aiService.generateTestbench(code, scenario);

    return NextResponse.json<GenerateTestbenchResponse>({
      success: true,
      result: {
        code: testbenchCode,
        scenario,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Testbench generation error:', error);
    return NextResponse.json<GenerateTestbenchResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Testbench generation failed',
      },
      { status: 500 }
    );
  }
}

