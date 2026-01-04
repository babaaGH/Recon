import { NextRequest, NextResponse } from 'next/server';

interface JobOpening {
  title: string;
  department?: string;
  location?: string;
  posted_date?: string;
}

interface PredictLeadsResponse {
  jobs: JobOpening[];
  total: number;
}

export async function POST(request: NextRequest) {
  try {
    const { companyName } = await request.json();

    if (!companyName) {
      return NextResponse.json({ error: 'Company name required' }, { status: 400 });
    }

    const PREDICTLEADS_API_KEY = process.env.PREDICTLEADS_API_KEY;

    if (!PREDICTLEADS_API_KEY) {
      console.error('PREDICTLEADS_API_KEY not configured');
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    console.log(`Fetching job openings for: ${companyName}`);

    // PredictLeads API endpoint for job openings
    const url = `https://api.predictleads.com/job-openings?company=${encodeURIComponent(companyName)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PREDICTLEADS_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`PredictLeads API error: ${response.status} ${response.statusText}`);

      // Return mock data as fallback for testing
      return NextResponse.json({
        engineering: 0,
        sales: 0,
        marketing: 0,
        total: 0,
      });
    }

    const data: PredictLeadsResponse = await response.json();

    // Categorize jobs by department
    let engineering = 0;
    let sales = 0;
    let marketing = 0;

    if (data.jobs && Array.isArray(data.jobs)) {
      data.jobs.forEach((job: JobOpening) => {
        const title = (job.title || '').toLowerCase();
        const dept = (job.department || '').toLowerCase();

        // Engineering keywords
        if (
          title.includes('engineer') ||
          title.includes('developer') ||
          title.includes('software') ||
          title.includes('devops') ||
          title.includes('architect') ||
          title.includes('technical') ||
          dept.includes('engineering') ||
          dept.includes('technology') ||
          dept.includes('it')
        ) {
          engineering++;
        }
        // Sales keywords
        else if (
          title.includes('sales') ||
          title.includes('account executive') ||
          title.includes('business development') ||
          title.includes('account manager') ||
          dept.includes('sales') ||
          dept.includes('business development')
        ) {
          sales++;
        }
        // Marketing keywords
        else if (
          title.includes('marketing') ||
          title.includes('growth') ||
          title.includes('brand') ||
          title.includes('content') ||
          title.includes('digital') ||
          dept.includes('marketing')
        ) {
          marketing++;
        }
      });
    }

    console.log(`✓ Categorized ${data.jobs?.length || 0} job openings: Engineering=${engineering}, Sales=${sales}, Marketing=${marketing}`);

    return NextResponse.json({
      engineering,
      sales,
      marketing,
      total: engineering + sales + marketing,
    });
  } catch (error) {
    console.error('Error fetching hiring intelligence:', error);

    // Return mock data on error
    return NextResponse.json({
      engineering: 0,
      sales: 0,
      marketing: 0,
      total: 0,
    });
  }
}
