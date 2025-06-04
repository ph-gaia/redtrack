"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import TopBar from "../../components/TopBar";

interface Detail {
  date: string;
  sub1: string;
  sub7: number;
  sub4: string;
  prelp_clicks_ctr: number;
  cost: number;
  total_revenue: number;
  profit: number;
  convtype2: number;
  convtype1: number;
  type1_cpa: number;
  lp_clicks: number;
  convtype3: number;
  clicks: number;
  epc: number;
}

interface StatusRecord {
  [apiKey: string]: {
    [campaignId: string]: {
      [sub7: number]: 1 | 0;
    };
  };
}

const DetailTable: React.FC = () => {
  const [detailData, setDetailData] = useState<Detail[]>([]);
  const [totalData, setTotalData] = useState<Detail>({} as Detail);
  const [statusMap, setStatusMap] = useState<{ [sub7: number]: boolean }>({});
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [sortBy, setSortBy] = useState<string>("profit");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [apiKey, setApiKey] = useState<string>("");

  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  const dateFrom = startDate.toISOString().split('T')[0];
  const dateTo = endDate.toISOString().split('T')[0];
  const redRow = "#ffebee";
  const greenRow = "#c8e6c9";

  useEffect(() => {
    const storedApiKey = localStorage.getItem('redtrack_api_key');
    if (!storedApiKey) {
      router.push('/');
    } else {
      setApiKey(storedApiKey);
    }
  }, [router]);

  const fetchDetails = async () => {
    if (!apiKey) return;

    setDetailData([]);
    const detailUrl = `https://app.redtrack.io/api/report?api_key=${apiKey}&date_from=${dateFrom}&date_to=${dateTo}&timezone=America/New_York&direction=${sortDirection}&group=sub1,sub7,sub4&sortby=${sortBy}&total=true&table_settings_name=table_campaigns_report&campaign_id=${campaignId}`;

    try {
      const response = await axios.get(detailUrl);
      const data = response.data.items;
      setTotalData(response.data.total);
      setDetailData(data);

      // Load localStorage
      const local: StatusRecord = JSON.parse(localStorage.getItem("siteStatus") || "{}");
      const currentApiKey = local[apiKey] || {};
      const currentCampaign = currentApiKey[campaignId] || {};
      const map: { [sub7: number]: boolean } = {};

      data.forEach((d: Detail) => {
        map[d.sub7] = currentCampaign[d.sub7] !== 0;
      });

      setStatusMap(map);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem('redtrack_api_key');
        router.push('/');
      }
    }
  };

  useEffect(() => {
    if (apiKey) {
      fetchDetails();
    }
  }, [campaignId, sortBy, sortDirection, apiKey]);

  const handleSort = (field: string) => {
    setDetailData([]);
    if (field === sortBy) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  const toggleStatus = (sub7: number) => {
    const updated = { ...statusMap };
    updated[sub7] = !statusMap[sub7];
    setStatusMap(updated);

    const local: StatusRecord = JSON.parse(localStorage.getItem("siteStatus") || "{}");
    if (!local[apiKey]) local[apiKey] = {};
    if (!local[apiKey][campaignId]) local[apiKey][campaignId] = {};
    local[apiKey][campaignId][sub7] = updated[sub7] ? 1 : 0;
    localStorage.setItem("siteStatus", JSON.stringify(local));
  };

  if (!apiKey) {
    return null;
  }

  return (
    <>
      <TopBar />
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Campaign Detail</h1>
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
          <div>
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => fetchDetails()}>
              Aplicar
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                {[
                  "Sub1", "Sub7", "Sub4", "Pre-LP Click CTR", "Cost", "Total Revenue", "Profit",
                  "InitiateCheckout", "Purchase", "Purchase CPA", "LP Clicks", "Upsell", "Clicks", "EPC", "Status"
                ].map((header) => (
                  <th key={header} className="border p-2 text-sm text-left">
                    {["Cost", "Total Revenue", "Profit", "Purchase", "Clicks"].includes(header) ? (
                      <button
                        onClick={() => handleSort(header.toLowerCase().replace(" ", "_"))}
                        className="flex items-center gap-1 hover:bg-gray-200 px-2 py-1 rounded"
                      >
                        {header}
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      </button>
                    ) : (
                      header
                    )}
                  </th>
                ))}
              </tr>
              <tr>
                <th colSpan={3} className="border p-2 text-sm text-left">Total</th>
                <th className="border p-2 text-sm text-left">{(totalData?.prelp_clicks_ctr * 100)?.toFixed(2)}%</th>
                <th className="border p-2 text-sm text-left">$ {totalData?.cost?.toFixed(2) || '0.00'}</th>
                <th className="border p-2 text-sm text-left">$ {totalData?.total_revenue?.toFixed(2) || '0.00'}</th>
                <th className="border p-2 text-sm text-left">$ {totalData?.profit?.toFixed(2) || '0.00'}</th>
                <th className="border p-2 text-sm text-left">{totalData.convtype2}</th>
                <th className="border p-2 text-sm text-left">{totalData.convtype1}</th>
                <th className="border p-2 text-sm text-left">$ {totalData?.type1_cpa?.toFixed(2) || '0.00'}</th>
                <th className="border p-2 text-sm text-left">{totalData.lp_clicks}</th>
                <th className="border p-2 text-sm text-left">{totalData.convtype3}</th>
                <th className="border p-2 text-sm text-left">{totalData.clicks}</th>
                <th colSpan={2} className="border p-2 text-sm text-left">$ {totalData?.epc?.toFixed(2) || '0.00'}</th>
              </tr>
            </thead>
            <tbody>
              {detailData.map((detail) => {
                const profit = detail.profit;
                const rowColor = profit < -1 ? redRow : profit > 60 ? greenRow : "";
                return (
                  <tr key={detail.sub7} className="border-b" style={{ backgroundColor: rowColor }}>
                    <td className="border p-2 text-sm">{detail.sub1}</td>
                    <td className="border p-2 text-sm">{detail.sub7}</td>
                    <td className="border p-2 text-sm">{detail.sub4}</td>
                    <td className="border p-2 text-sm">{detail?.prelp_clicks_ctr?.toFixed(2) || '0.00'}%</td>
                    <td className="border p-2 text-sm">$ {detail?.cost?.toFixed(2) || '0.00'}</td>
                    <td className="border p-2 text-sm">$ {detail?.total_revenue?.toFixed(2) || '0.00'}</td>
                    <td className="border p-2 text-sm">$ {detail?.profit?.toFixed(2) || '0.00'}</td>
                    <td className="border p-2 text-sm">{detail.convtype2}</td>
                    <td className="border p-2 text-sm">{detail.convtype1}</td>
                    <td className="border p-2 text-sm">$ {detail?.type1_cpa?.toFixed(2) || '0.00'}</td>
                    <td className="border p-2 text-sm">{detail.lp_clicks}</td>
                    <td className="border p-2 text-sm">{detail.convtype3}</td>
                    <td className="border p-2 text-sm">{detail.clicks}</td>
                    <td className="border p-2 text-sm">{detail?.epc?.toFixed(2) || '0.00'}</td>
                    <td className="border p-2 text-sm">
                      <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" checked={statusMap[detail.sub7] ?? true} onChange={() => toggleStatus(detail.sub7)} />
                        <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                        <span className="ms-3 text-sm font-medium">{statusMap[detail.sub7]? 'Ativo' : 'Inativo'}</span>
                      </label>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default DetailTable;
