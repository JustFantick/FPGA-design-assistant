import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AIServiceFactory } from '@/services/ai/AIServiceFactory';
import { AnalyzeRequest, AnalyzeResponse } from '@/types';
import { getModelConfig } from '@/config/models';

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    const { code, model, keyType, userKey } = body;

    if (!code || !code.trim()) {
      return NextResponse.json<AnalyzeResponse>({ success: false, error: 'VHDL code is required' }, { status: 400 });
    }

    if (!model) {
      return NextResponse.json<AnalyzeResponse>(
        { success: false, error: 'Model selection is required' },
        { status: 400 }
      );
    }

    const modelConfig = getModelConfig(model);

    if (!modelConfig) {
      return NextResponse.json<AnalyzeResponse>(
        { success: false, error: 'Unsupported model selected' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session && (keyType === 'user' || userKey)) {
      return NextResponse.json<AnalyzeResponse>(
        { success: false, error: 'Authentication is required to use personal API keys' },
        { status: 401 }
      );
    }

    if (!session && !modelConfig.enabledForGuests) {
      return NextResponse.json<AnalyzeResponse>(
        { success: false, error: 'Selected model is not available for guest users' },
        { status: 403 }
      );
    }

    const effectiveKeyType = keyType === 'user' && userKey?.apiKey ? 'user' : 'app';

    if (effectiveKeyType === 'app' && !modelConfig.enabledForGuests) {
      return NextResponse.json<AnalyzeResponse>(
        { success: false, error: 'Selected model requires a personal API key' },
        { status: 403 }
      );
    }

    const aiService = AIServiceFactory.createService(model, {
      keyType: effectiveKeyType,
      userKey: effectiveKeyType === 'user' ? (userKey ?? null) : null,
    });
    const result = await aiService.analyzeVHDL(code, request.signal);

    if (session?.user && (session.user as any).id) {
      prisma.history
        .create({
          data: {
            userId: (session.user as any).id,
            type: 'analyze',
            model,
            input: code,
            result: JSON.stringify(result),
          },
        })
        .catch(() => {});
    }

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
