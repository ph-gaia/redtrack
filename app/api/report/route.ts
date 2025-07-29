import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get('api_key');
  const dateFrom = searchParams.get('date_from');
  const dateTo = searchParams.get('date_to');
  const direction = searchParams.get('direction');
  const group = searchParams.get('group');
  const sortby = searchParams.get('sortby');
  const campaignId = searchParams.get('campaign_id');

  if (!apiKey) {
    return NextResponse.json({ error: 'API key is required' }, { status: 400 });
  }

  try {
    const url = `https://api.redtrack.io/report?api_key=${apiKey}&date_from=${dateFrom}&date_to=${dateTo}&timezone=America/New_York&direction=${direction}&group=${group}&sortby=${sortby}&total=true&page=1&per=1000&table_settings_name=table_campaigns_report&campaign_id=${campaignId}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
