import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { ticker } = await request.json();

    if (!ticker) {
      return NextResponse.json({ error: 'Ticker symbol required' }, { status: 400 });
    }

    const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

    if (!POLYGON_API_KEY) {
      console.error('POLYGON_API_KEY not configured');
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Calculate date range (last 365 days)
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 365);

    const fromStr = from.toISOString().split('T')[0]; // YYYY-MM-DD
    const toStr = to.toISOString().split('T')[0];

    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${fromStr}/${toStr}?adjusted=true&sort=asc&apiKey=${POLYGON_API_KEY}`;

    console.log(`Fetching stock data for ${ticker} from ${fromStr} to ${toStr}`);

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Polygon API error: ${response.status} ${response.statusText}`);
      return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: response.status });
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      console.log(`No stock data found for ticker: ${ticker}`);
      return NextResponse.json({ error: 'No stock data found', ticker }, { status: 404 });
    }

    // Transform data for Recharts
    const chartData = data.results.map((item: any) => ({
      date: new Date(item.t).toISOString().split('T')[0],
      timestamp: item.t,
      close: item.c,
      open: item.o,
      high: item.h,
      low: item.l,
      volume: item.v,
    }));

    console.log(`✓ Fetched ${chartData.length} days of stock data for ${ticker}`);

    return NextResponse.json({
      ticker,
      data: chartData,
      count: chartData.length,
    });
  } catch (error) {
    console.error('Stock price API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
