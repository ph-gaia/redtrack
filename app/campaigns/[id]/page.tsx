"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import axios from "axios";

interface Detail {
  date: string;
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
  [campaignId: string]: {
    [sub7: number]: 1 | 0;
  };
}

const DetailTable: React.FC = () => {
  const [detailData, setDetailData] = useState<Detail[]>([]);
  const [statusMap, setStatusMap] = useState<{ [sub7: number]: boolean }>({});

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const formatarData = (data: Date) => data.toISOString().split("T")[0];
  const params = useParams();
  const searchParams = useSearchParams();
  const campaignId = params.id as string;
  const dateFrom = searchParams.get('datefrom') || formatarData(yesterday);
  const dateTo = searchParams.get('dateto') || formatarData(today);

  useEffect(() => {
    const fetchDetails = async () => {
      const apiKey = process.env.NEXT_PUBLIC_REDTRACK_API_KEY;

      const detailUrl = `https://app.redtrack.io/api/report?api_key=${apiKey}&date_from=${dateFrom}&date_to=${dateTo}&timezone=America/New_York&direction=asc&group=sub7,sub4&sortby=profit&total=true&table_settings_name=table_campaigns_report&campaign_id=${campaignId}`;

      const response = await axios.get(detailUrl);
      const data = response.data.items;
      setDetailData(data);

      // Load localStorage
      const local: StatusRecord = JSON.parse(localStorage.getItem("siteStatus") || "{}");
      const currentCampaign = local[campaignId] || {};
      const map: { [sub7: number]: boolean } = {};

      data.forEach((d: Detail) => {
        map[d.sub7] = currentCampaign[d.sub7] !== 0;
      });

      setStatusMap(map);
    };

    fetchDetails();
  }, [campaignId, dateFrom, dateTo]);

  const toggleStatus = (sub7: number) => {
    const updated = { ...statusMap, [sub7]: !statusMap[sub7] };
    setStatusMap(updated);

    const local: StatusRecord = JSON.parse(localStorage.getItem("siteStatus") || "{}");
    if (!local[campaignId]) local[campaignId] = {};
    local[campaignId][sub7] = updated[sub7] ? 1 : 0;
    localStorage.setItem("siteStatus", JSON.stringify(local));
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Campaign Detail</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              {[
                "Date", "Sub7", "Sub4", "Pre-LP Click CTR", "Cost", "Total Revenue", "Profit",
                "InitiateCheckout", "Purchase", "Purchase CPA", "LP Clicks", "Upsell", "Clicks", "EPC", "Status"
              ].map((header) => (
                <th key={header} className="border p-2 text-sm text-left">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {detailData.map((detail) => (
              <tr key={detail.sub7} className="border-b">
                <td className="border p-2 text-sm">{detail.date}</td>
                <td className="border p-2 text-sm">{detail.sub7}</td>
                <td className="border p-2 text-sm">{detail.sub4}</td>
                <td className="border p-2 text-sm">{detail.prelp_clicks_ctr}</td>
                <td className="border p-2 text-sm">{detail.cost}</td>
                <td className="border p-2 text-sm">{detail.total_revenue}</td>
                <td className="border p-2 text-sm">{detail.profit}</td>
                <td className="border p-2 text-sm">{detail.convtype2}</td>
                <td className="border p-2 text-sm">{detail.convtype1}</td>
                <td className="border p-2 text-sm">{detail.type1_cpa}</td>
                <td className="border p-2 text-sm">{detail.lp_clicks}</td>
                <td className="border p-2 text-sm">{detail.convtype3}</td>
                <td className="border p-2 text-sm">{detail.clicks}</td>
                <td className="border p-2 text-sm">{detail.epc}</td>
                <td className="border p-2 text-sm">
                  <input
                    type="checkbox"
                    checked={statusMap[detail.sub7] ?? true}
                    onChange={() => toggleStatus(detail.sub7)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DetailTable;
