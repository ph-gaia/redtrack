"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ApiKeyModal from "./components/ApiKeyModal";
import TopBar from "./components/TopBar";
import { FirebaseService } from "./lib/firebaseService";

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
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const lightPinkRow = "#f0ced3";
  const pinkRow = "#f79cab";
  const redRow = "#ea5369";
  const greenRow = "#c8e6c9";

  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const storedApiKey = await FirebaseService.getApiKey();
        if (!storedApiKey) {
          setShowApiKeyModal(true);
        } else {
          setApiKey(storedApiKey);
        }
      } catch (error) {
        console.error('Error checking API key:', error);
        setShowApiKeyModal(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkApiKey();
  }, []);

  const handleApiKeySave = async (key: string) => {
    try {
      await FirebaseService.saveApiKey(key);
      setApiKey(key);
      setShowApiKeyModal(false);
    } catch (error) {
      console.error('Error saving API key:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error saving API key. Please try again.';
      alert(errorMessage);
    }
  };

  const fetchData = async (from: Date, to: Date) => {
    if (!apiKey) return;

    const dateFrom = from.toISOString().split('T')[0];
    const dateTo = to.toISOString().split('T')[0];
    const url = `/api/campaigns?api_key=${apiKey}&date_from=${dateFrom}&date_to=${dateTo}`;

    try {
      const res = await axios.get(url);
      setData(res.data.items || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 500)) {
        // await FirebaseService.deleteApiKey();
        // setShowApiKeyModal(true);
      }
    }
  };

  useEffect(() => {
    if (apiKey) {
      fetchData(startDate, endDate);
    }
  }, [startDate, endDate, apiKey]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (showApiKeyModal) {
    return <ApiKeyModal onSave={handleApiKeySave} />;
  }

  return (
    <>
      <TopBar />
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
                const rowColor = profit <= -60 ? redRow : profit <= -20 ? pinkRow : profit <= -5 ? lightPinkRow : greenRow;
                return (
                  <tr key={item.id} className="bg-white border-b" style={{ backgroundColor: rowColor }}>
                    <td className="px-4 py-2">{item.title}</td>
                    <td className="px-4 py-2">{item.stat.cost?.toFixed(2) || '0.00'}</td>
                    <td className="px-4 py-2">{item.stat.total_revenue?.toFixed(2) || '0.00'}</td>
                    <td className="px-4 py-2">{profit?.toFixed(2) || '0.00'}</td>
                    <td className="px-4 py-2">{item.stat.convtype2}</td>
                    <td className="px-4 py-2">{item.stat.convtype1}</td>
                    <td className="px-4 py-2">{item.stat.type1_cpa?.toFixed(2) || '0.00'}</td>
                    <td className="px-4 py-2">{item.stat.type1_cr?.toFixed(2) || '0.00'}</td>
                    <td className="px-4 py-2">{item.stat.type1_roi?.toFixed(2) || '0.00'}</td>
                    <td className="px-4 py-2">{item.stat.convtype3}</td>
                    <td className="px-4 py-2">{item.stat.clicks}</td>
                    <td className="px-4 py-2">{item.stat.epc?.toFixed(2) || '0.00'}</td>
                    <td className="px-4 py-2">{item.stat.prelp_clicks}</td>
                    <td className="px-4 py-2">{(item.stat.prelp_clicks_ctr ? item.stat.prelp_clicks_ctr * 100 : 0)?.toFixed(2) || '0.00'}</td>
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
    </>
  );
}
