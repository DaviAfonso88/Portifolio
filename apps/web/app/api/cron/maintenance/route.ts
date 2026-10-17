import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { getAdminUseCases } from '../../../../lib/composition-root';


/**
 * Vercel Cron Maintenance Endpoint (T08.03)
 *
 * Implements policy P-003: Daily maintenance job purging contact messages older than 24 months.
 * Protected by Vercel CRON_SECRET header verification.
 */
export async function GET(request: Request) {
  return handleMaintenance(request);
}

export async function POST(request: Request) {
  return handleMaintenance(request);
}

async function handleMaintenance(request: Request) {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // Verify CRON_SECRET authorization header
  const expectedAuth = cronSecret ? `Bearer ${cronSecret}` : null;
  const isAuthorized =
    Boolean(expectedAuth) &&
    Boolean(authHeader) &&
    authHeader === expectedAuth;

  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'UNAUTHORIZED_CRON', message: 'Invalid or missing CRON_SECRET header' },
      { status: 401 }
    );
  }

  try {
    const { purgeOldContactMessages } = getAdminUseCases();
    const result = await purgeOldContactMessages.execute({ retentionMonths: 24 });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      action: 'purge_contact_messages',
      retentionMonths: 24,
      purgedMessages: result.purgedCount,
      cutoffDate: result.cutoffDate.toISOString(),
    });
  } catch (error) {
    console.error('[MaintenanceCron] Execution failed:', error);
    return NextResponse.json(
      { error: 'CRON_EXECUTION_FAILED', details: String(error) },
      { status: 500 }
    );
  }
}
