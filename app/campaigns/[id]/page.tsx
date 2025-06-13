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
      [key: string]: 1 | 0;
    };
  };
}

type GroupType = "SITE - REV" | "NAME + ID";

const DetailTable: React.FC = () => {
  const [detailData, setDetailData] = useState<Detail[]>([]);
  const [totalData, setTotalData] = useState<Detail>({} as Detail);
  const [statusMap, setStatusMap] = useState<{ [key: string]: boolean }>({});
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [sortBy, setSortBy] = useState<string>("profit");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [apiKey, setApiKey] = useState<string>("");
  const [groupType, setGroupType] = useState<GroupType>("NAME + ID");

  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  const dateFrom = startDate.toISOString().split('T')[0];
  const dateTo = endDate.toISOString().split('T')[0];
  const lightPinkRow = "#f0ced3";
  const pinkRow = "#f79cab";
  const redRow = "#ea5369";
  const greenRow = "#e0eae0";

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
    setTotalData({} as Detail);
    const groupParam = groupType === "SITE - REV" ? "sub1" : "sub4,sub7";
    const detailUrl = `https://app.redtrack.io/api/report?api_key=${apiKey}&date_from=${dateFrom}&date_to=${dateTo}&timezone=America/New_York&direction=${sortDirection}&group=${groupParam}&sortby=${sortBy}&total=true&table_settings_name=table_campaigns_report&campaign_id=${campaignId}`;

    try {
      const response = await axios.get(detailUrl);
      const data = response.data.items;
      setTotalData(response.data.total);
      setDetailData(data);

      // Load localStorage
      const local: StatusRecord = JSON.parse(localStorage.getItem("siteStatus") || "{}");
      const currentApiKey = local[apiKey] || {};
      const currentCampaign = currentApiKey[campaignId] || {};
      const map: { [key: string]: boolean } = {};

      data.forEach((d: Detail) => {
        const key = groupType === "SITE - REV" ? d.sub1 : d.sub7.toString();
        map[key] = currentCampaign[key] !== 0;
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

  const toggleStatus = (key: string) => {
    const updated = { ...statusMap };
    updated[key] = !statusMap[key];
    setStatusMap(updated);

    const local: StatusRecord = JSON.parse(localStorage.getItem("siteStatus") || "{}");
    if (!local[apiKey]) local[apiKey] = {};
    if (!local[apiKey][campaignId]) local[apiKey][campaignId] = {};
    local[apiKey][campaignId][key] = updated[key] ? 1 : 0;
    localStorage.setItem("siteStatus", JSON.stringify(local));
  };

  if (!apiKey) {
    return null;
  }

  const getTableHeaders = () => {
    const baseHeaders = [
      "Pre-LP Click CTR", "Cost", "Total Revenue", "Profit",
      "InitiateCheckout", "Purchase", "Purchase CPA", "LP Clicks", "Upsell", "Clicks", "EPC", "Status"
    ];

    if (groupType === "SITE - REV") {
      return ["Sub1", ...baseHeaders];
    } else {
      return ["Sub7", "Sub4", ...baseHeaders];
    }
  };

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
            <label className="block text-sm font-medium text-gray-700 mb-1">Template:</label>
            <select
              value={groupType}
              onChange={(e) => setGroupType(e.target.value as GroupType)}
              className="border rounded px-3 py-2"
            >
              <option value="NAME + ID">NAME + ID</option>
              <option value="SITE - REV">SITE - REV</option>
            </select>
          </div>
          <div>
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={fetchDetails}>
              Aplicar
            </button>
          </div>
          <div className="ml-auto">
            <button className="bg-yellow-500 text-white px-4 py-2" onClick={() => window.location.href = '/'}>
              Voltar
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-300">
            <thead className="bg-gray-100 top-0 z-10">
              <tr>
                {getTableHeaders().map((header) => (
                  <th key={header} className="border p-2 text-sm text-left">
                    {["Cost", "Total Revenue", "Profit", "Purchase", "Clicks"].includes(header) ? (
                      <button
                        onClick={() => handleSort(header.toLowerCase().replace(" ", "_"))}
                        className="flex items-center gap-1 hover:bg-gray-200 px-2 py-1 rounded"
                      >
                        {header}
                        {sortBy === header.toLowerCase().replace(" ", "_") && (
                          <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                    ) : (
                      header
                    )}
                  </th>
                ))}
              </tr>
              <tr>
                <th colSpan={groupType === "SITE - REV" ? 1 : 2} className="border p-2 text-sm text-left">Total</th>
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
                const rowColor = profit <= -60 ? redRow : profit <= -20 ? pinkRow : profit <= -5 ? lightPinkRow : greenRow;
                const statusKey = groupType === "SITE - REV" ? detail.sub1 : detail.sub7.toString();
                return (
                  <tr key={detail.sub7} className="border-b" style={{ backgroundColor: rowColor }}>
                    {groupType === "SITE - REV" ? (
                      <td className="border p-2 text-sm">{detail.sub1}</td>
                    ) : (
                      <>
                        <td className="border p-2 text-sm">{detail.sub7}</td>
                        <td className="border p-2 text-sm">{detail.sub4}</td>
                      </>
                    )}
                    <td className="border p-2 text-sm">{(detail?.prelp_clicks_ctr * 100)?.toFixed(2) || '0.00'}%</td>
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
                        <input 
                          type="checkbox" 
                          value="" 
                          className="sr-only peer" 
                          checked={statusMap[statusKey] ?? true} 
                          onChange={() => toggleStatus(statusKey)} 
                        />
                        <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                        <span className="ms-3 text-sm font-medium">{statusMap[statusKey]? 'Ativo' : 'Inativo'}</span>
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
