"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const apiKey = process.env.NEXT_PUBLIC_REDTRACK_API_KEY;

interface Campaign {
  id: number;
  title: string;
  stat: {
    profit: number;
    cost: number;
    total_revenue: number;
    convtype2: number;
    convtype1: number;
    type1_cpa: number;
    type1_cr: number;
    type1_roi: number;
    convtype3: number;
    clicks: number;
    epc: number;
    prelp_clicks: number;
    prelp_clicks_ctr: number;
    lp_views: number;
    lp_clicks: number;
  };
}

export default function HomePage() {
  const [data, setData] = useState<Campaign[]>([]);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const redRow = "#d59e91";
  const greenRow = "#d5ecc5";

  const fetchData = async (from: Date, to: Date) => {
    const dateFrom = from.toISOString().split('T')[0];
    const dateTo = to.toISOString().split('T')[0];
    const url = `https://app.redtrack.io/api/campaigns?api_key=${apiKey}&date_from=${dateFrom}&date_to=${dateTo}&status=1&with_clicks=false&page=1&per=100&sortby=clicks&direction=desc&timezone=America%2FNew_York&total=true`;

    try {
      const res = await axios.get(url);
      setData(res.data.items || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData(startDate, endDate);
  }, [startDate, endDate]);

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Campaigns</h1>
      
      <div className="mb-4 flex gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">From:</label>
          <DatePicker
            selected={startDate}
            onChange={(date: Date | null) => date && setStartDate(date)}
            className="border rounded px-3 py-2"
            dateFormat="yyyy-MM-dd"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To:</label>
          <DatePicker
            selected={endDate}
            onChange={(date: Date | null) => date && setEndDate(date)}
            className="border rounded px-3 py-2"
            dateFormat="yyyy-MM-dd"
            minDate={startDate}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Cost</th>
              <th className="px-4 py-2">Total Revenue</th>
              <th className="px-4 py-2">Profit</th>
              <th className="px-4 py-2">InitiateCheckout</th>
              <th className="px-4 py-2">Purchase</th>
              <th className="px-4 py-2">Purchase CPA</th>
              <th className="px-4 py-2">Purchase CR</th>
              <th className="px-4 py-2">Purchase ROI</th>
              <th className="px-4 py-2">Upsell</th>
              <th className="px-4 py-2">Clicks</th>
              <th className="px-4 py-2">EPC</th>
              <th className="px-4 py-2">Pre-LP Clicks</th>
              <th className="px-4 py-2">Pre-LP Click CTR</th>
              <th className="px-4 py-2">LP Views</th>
              <th className="px-4 py-2">LP Clicks</th>
              <th className="px-4 py-2">Report</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => {
              const profit = item.stat.profit;
              const rowColor = profit < -60 ? redRow : greenRow;
              return (
                <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600" style={{ backgroundColor: rowColor }}>
                  <td className="px-4 py-2">{item.title}</td>
                  <td className="px-4 py-2">{item.stat.cost}</td>
                  <td className="px-4 py-2">{item.stat.total_revenue}</td>
                  <td className="px-4 py-2">{profit}</td>
                  <td className="px-4 py-2">{item.stat.convtype2}</td>
                  <td className="px-4 py-2">{item.stat.convtype1}</td>
                  <td className="px-4 py-2">{item.stat.type1_cpa}</td>
                  <td className="px-4 py-2">{item.stat.type1_cr}</td>
                  <td className="px-4 py-2">{item.stat.type1_roi}</td>
                  <td className="px-4 py-2">{item.stat.convtype3}</td>
                  <td className="px-4 py-2">{item.stat.clicks}</td>
                  <td className="px-4 py-2">{item.stat.epc}</td>
                  <td className="px-4 py-2">{item.stat.prelp_clicks}</td>
                  <td className="px-4 py-2">{item.stat.prelp_clicks_ctr}</td>
                  <td className="px-4 py-2">{item.stat.lp_views}</td>
                  <td className="px-4 py-2">{item.stat.lp_clicks}</td>
                  <td className="px-4 py-2">
                    <Link href={`/campaigns/${item.id}`} className="text-blue-600 underline">
                      Report
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
