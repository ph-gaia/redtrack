import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get('api_key');
  const dateFrom = searchParams.get('date_from');
  const dateTo = searchParams.get('date_to');

  if (!apiKey) {
    return NextResponse.json({ error: 'API key is required' }, { status: 400 });
  }

  try {
    const url = `https://app.redtrack.io/api/campaigns?api_key=${apiKey}&date_from=${dateFrom}&date_to=${dateTo}&status=1&with_clicks=false&page=1&per=100&sortby=clicks&direction=desc&timezone=America%2FNew_York&total=true`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
