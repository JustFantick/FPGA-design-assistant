import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AIServiceFactory } from '@/services/ai/AIServiceFactory';
import { GenerateTestbenchRequest, GenerateTestbenchResponse } from '@/types';
import { getModelConfig } from '@/config/models';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateTestbenchRequest = await request.json();
    const { code, scenario, model, keyType, userKey } = body;

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

    const modelConfig = getModelConfig(model);

    if (!modelConfig) {
      return NextResponse.json<GenerateTestbenchResponse>(
        { success: false, error: 'Unsupported model selected' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session && (keyType === 'user' || userKey)) {
      return NextResponse.json<GenerateTestbenchResponse>(
        { success: false, error: 'Authentication is required to use personal API keys' },
        { status: 401 }
      );
    }

    if (!session && !modelConfig.enabledForGuests) {
      return NextResponse.json<GenerateTestbenchResponse>(
        { success: false, error: 'Selected model is not available for guest users' },
        { status: 403 }
      );
    }

    const effectiveKeyType = keyType === 'user' && userKey?.apiKey ? 'user' : 'app';

    if (effectiveKeyType === 'app' && !modelConfig.enabledForGuests) {
      return NextResponse.json<GenerateTestbenchResponse>(
        { success: false, error: 'Selected model requires a personal API key' },
        { status: 403 }
      );
    }

    const aiService = AIServiceFactory.createService(model, {
      keyType: effectiveKeyType,
      userKey: effectiveKeyType === 'user' ? (userKey ?? null) : null,
    });
    const testbenchCode = await aiService.generateTestbench(code, scenario, request.signal);

    if (session?.user && (session.user as any).id) {
      prisma.history
        .create({
          data: {
            userId: (session.user as any).id,
            type: 'testbench',
            model,
            input: code,
            result: testbenchCode,
            scenario: scenario.description,
            clockPeriod: scenario.clockPeriod || null,
            simulationTime: scenario.simulationTime || null,
          },
        })
        .catch(() => {});
    }

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
