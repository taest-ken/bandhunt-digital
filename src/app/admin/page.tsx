"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { BrandCollabLogo } from "@/components/ui/BrandCollabLogo";
import {
  Download,
  RefreshCw,
  Search,
  Users,
  MapPin,
  Calendar,
  Lock,
  KeyRound,
  LogOut,
  ArrowLeft,
  Ticket,
  Sparkles,
  Layers,
  CheckCircle2,
} from "lucide-react";

interface Submission {
  createdAt?: string;
  suggestedCity?: string;
  contact?: string;
  experienceDescription?: string;
  levelUnlocked?: number;
  source?: string;
  submittedBy?: string;
}

interface AdminData {
  totalCount: number;
  list1Count: number;
  list2Count: number;
  cityCounts: Record<string, number>;
  cityInviteRequests: Submission[];
  mumbaiOfflineRegistrations: Submission[];
  submissions: Submission[];
  downloadList1CsvUrl: string;
  downloadList2CsvUrl: string;
  downloadAllCsvUrl: string;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);

  // Active view tab: 'LIST_1' | 'LIST_2' | 'BOTH'
  const [activeTab, setActiveTab] = useState<"BOTH" | "LIST_1" | "LIST_2">("BOTH");

  // Filters for List 1
  const [list1CityFilter, setList1CityFilter] = useState<string>("ALL");
  const [list1Search, setList1Search] = useState<string>("");

  // Filter for List 2
  const [list2Search, setList2Search] = useState<string>("");

  // Password barrier states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const checkStoredAuth = () => {
    try {
      const stored = sessionStorage.getItem("taest_founder_auth");
      if (stored) {
        verifyAndLoad(stored);
      }
    } catch {}
  };

  useEffect(() => {
    checkStoredAuth();
  }, []);

  const verifyAndLoad = async (pwd: string) => {
    setIsVerifying(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/admin/rsvps", {
        headers: { "x-admin-password": pwd },
      });

      if (res.ok) {
        const json = await res.json();
        setData(json);
        setIsAuthenticated(true);
        try {
          sessionStorage.setItem("taest_founder_auth", pwd);
        } catch {}
      } else {
        setAuthError("INCORRECT PASSPHRASE // ACCESS DENIED");
        setIsAuthenticated(false);
        try {
          sessionStorage.removeItem("taest_founder_auth");
        } catch {}
      }
    } catch (e) {
      console.error("Auth verification error:", e);
      setAuthError("Network error verifying passphrase");
    } finally {
      setIsVerifying(false);
      setLoading(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;
    verifyAndLoad(passwordInput.trim());
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasswordInput("");
    setData(null);
    try {
      sessionStorage.removeItem("taest_founder_auth");
    } catch {}
  };

  const handleRefresh = () => {
    const pwd = sessionStorage.getItem("taest_founder_auth") || passwordInput;
    if (pwd) {
      setLoading(true);
      verifyAndLoad(pwd);
    }
  };

  // Filtered List 1: City Specific Invite Requests
  const filteredList1 = useMemo(() => {
    const list = data?.cityInviteRequests || [];
    return list.filter((sub) => {
      const city = (sub.suggestedCity || "").toUpperCase();
      if (list1CityFilter !== "ALL" && !city.includes(list1CityFilter)) {
        return false;
      }
      if (list1Search.trim()) {
        const q = list1Search.toLowerCase();
        const contact = (sub.contact || sub.experienceDescription || "").toLowerCase();
        const c = city.toLowerCase();
        return contact.includes(q) || c.includes(q);
      }
      return true;
    });
  }, [data?.cityInviteRequests, list1CityFilter, list1Search]);

  // Filtered List 2: Mumbai Offline Bandhunt Registrations
  const filteredList2 = useMemo(() => {
    const list = data?.mumbaiOfflineRegistrations || [];
    return list.filter((sub) => {
      if (list2Search.trim()) {
        const q = list2Search.toLowerCase();
        const contact = (sub.contact || sub.experienceDescription || "").toLowerCase();
        const source = (sub.source || "").toLowerCase();
        return contact.includes(q) || source.includes(q);
      }
      return true;
    });
  }, [data?.mumbaiOfflineRegistrations, list2Search]);

  // If not authenticated, render login barrier
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] text-[#1C1C1C] flex items-center justify-center p-4 font-sans select-none">
        <div className="w-full max-w-md bg-white border-[3.5px] border-[#1C1C1C] rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_#1C1C1C] flex flex-col items-center gap-5 text-center">
          <BrandCollabLogo size="md" />

          <div className="flex flex-col items-center gap-1.5 mt-1">
            <div className="w-12 h-12 rounded-2xl bg-[#FFE600] border-2 border-[#1C1C1C] flex items-center justify-center shadow-[3px_3px_0px_#1C1C1C] mb-1">
              <Lock className="w-6 h-6 text-[#1C1C1C]" />
            </div>
            <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded bg-[#CFFF04] border border-[#1C1C1C]">
              FOUNDER ACCESS ONLY
            </span>
            <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-[#1C1C1C]">
              TAEST CARTEL PORTAL
            </h1>
            <p className="text-xs font-bold text-gray-600 max-w-xs">
              Enter founder passphrase to view and export the two separate registration lists:
              <br />
              <span className="text-[#5D00FF]">List 1: City Specific Invite Requests</span> &amp;
              <br />
              <span className="text-[#FF2E9A]">List 2: Mumbai Offline Bandhunt Registrations</span>.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="w-full flex flex-col gap-3">
            <div className="relative w-full">
              <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setAuthError(null);
                }}
                placeholder="Enter founder password..."
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[#1C1C1C] bg-gray-50 focus:bg-white text-xs font-mono font-bold text-[#1C1C1C] placeholder-gray-400 focus:outline-none"
              />
            </div>

            {authError && (
              <span className="text-[11px] font-mono font-black text-[#FF0040] animate-pulse">
                {authError}
              </span>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 px-4 rounded-xl bg-[#CFFF04] hover:bg-[#bcf000] text-[#1C1C1C] font-black text-xs uppercase border-2 border-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] cursor-pointer transition-all active:scale-95 disabled:opacity-60"
            >
              {isVerifying ? "VERIFYING CREDENTIALS..." : "UNLOCK FOUNDER PORTAL 🚀"}
            </button>
          </form>

          <Link
            href="/"
            className="text-xs font-bold text-gray-500 hover:text-black flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Hitmap</span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#1C1C1C] p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border-[3.5px] border-[#1C1C1C] shadow-[5px_5px_0px_#1C1C1C]">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2.5 rounded-xl border-2 border-[#1C1C1C] bg-white hover:bg-gray-100 shadow-[2px_2px_0px_#1C1C1C] transition-all cursor-pointer"
              title="Return to Hitmap"
            >
              <ArrowLeft className="w-5 h-5 text-[#1C1C1C]" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <BrandCollabLogo size="sm" />
                <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-[#CFFF04] border border-[#1C1C1C]">
                  AUTHENTICATED PORTAL
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight mt-1">
                BANDHUNT REGISTRATIONS DASHBOARD
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-3.5 py-2.5 rounded-xl border-2 border-[#1C1C1C] bg-white hover:bg-gray-50 shadow-[2px_2px_0px_#1C1C1C] text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-gray-500" : ""}`} />
              <span>Refresh</span>
            </button>

            <a
              href={data?.downloadAllCsvUrl || "/api/admin/rsvps?format=csv"}
              className="px-3.5 py-2.5 rounded-xl border-2 border-[#1C1C1C] bg-white hover:bg-gray-100 shadow-[2px_2px_0px_#1C1C1C] text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-gray-700" />
              <span>Export All CSV</span>
            </a>

            <button
              onClick={handleLogout}
              title="Lock dashboard"
              className="p-2.5 rounded-xl border-2 border-[#1C1C1C] bg-white hover:bg-[#FF0040] hover:text-white shadow-[2px_2px_0px_#1C1C1C] transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Overview Stat Cards - Highlighting the 2 Segregated Lists */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Total Overview */}
          <div className="bg-white p-5 rounded-2xl border-2 border-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-mono font-black text-gray-500 uppercase flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-gray-700" /> Total Database Submissions
              </span>
              <div className="text-3xl font-black text-[#1C1C1C] mt-1">
                {data?.totalCount ?? 0}
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-gray-500 mt-2">
              Combined live registrations across both lists
            </span>
          </div>

          {/* Card 2: List 1 - City Specific Invites */}
          <div className="bg-[#F5F8FF] p-5 rounded-2xl border-2 border-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-black text-[#5D00FF] uppercase flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#5D00FF]" /> List 1: City Specific Invites
                </span>
                <span className="text-[9px] font-black uppercase bg-[#5D00FF] text-white px-2 py-0.5 rounded-full">
                  General Invites
                </span>
              </div>
              <div className="text-3xl font-black text-[#1C1C1C] mt-1">
                {data?.list1Count ?? 0}
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#1C1C1C]/10 text-[10px] font-mono font-bold text-gray-600">
              <span>Mumbai: {data?.cityCounts["Mumbai"] || 0}</span>
              <span>Delhi: {data?.cityCounts["Delhi"] || 0}</span>
              <span>Blr: {data?.cityCounts["Bengaluru"] || 0}</span>
            </div>
          </div>

          {/* Card 3: List 2 - Mumbai Offline Registrations */}
          <div className="bg-[#FFF8F0] p-5 rounded-2xl border-2 border-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-black text-[#FF0040] uppercase flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5 text-[#FF2E9A]" /> List 2: Mumbai Offline Bandhunt
                </span>
                <span className="text-[9px] font-black uppercase bg-[#FFE600] text-[#1C1C1C] px-2 py-0.5 rounded-full border border-[#1C1C1C]">
                  Early Access Spots
                </span>
              </div>
              <div className="text-3xl font-black text-[#1C1C1C] mt-1">
                {data?.list2Count ?? 0}
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#FF0040] mt-2">
              Exclusive claimants for Mumbai Asiatic Library event
            </span>
          </div>
        </div>

        {/* View Selection Tabs */}
        <div className="flex items-center justify-between bg-white p-2 sm:p-2.5 rounded-2xl border-2 border-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] flex-wrap gap-2">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("BOTH")}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black uppercase border-2 border-[#1C1C1C] transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "BOTH"
                  ? "bg-[#1C1C1C] text-white shadow-[2px_2px_0px_#CFFF04]"
                  : "bg-gray-100 text-[#1C1C1C] hover:bg-gray-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>View Both Lists (Stacked)</span>
            </button>

            <button
              onClick={() => setActiveTab("LIST_1")}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black uppercase border-2 border-[#1C1C1C] transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "LIST_1"
                  ? "bg-[#5D00FF] text-white shadow-[2px_2px_0px_#1C1C1C]"
                  : "bg-gray-100 text-[#1C1C1C] hover:bg-gray-200"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>List 1: City Specific Invites ({data?.list1Count ?? 0})</span>
            </button>

            <button
              onClick={() => setActiveTab("LIST_2")}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black uppercase border-2 border-[#1C1C1C] transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "LIST_2"
                  ? "bg-[#FF2E9A] text-white shadow-[2px_2px_0px_#1C1C1C]"
                  : "bg-gray-100 text-[#1C1C1C] hover:bg-gray-200"
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>List 2: Mumbai Offline ({data?.list2Count ?? 0})</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LIST 1: CITY SPECIFIC INVITE REQUESTS TABLE                              */}
        {/* ========================================================================= */}
        {(activeTab === "BOTH" || activeTab === "LIST_1") && (
          <div className="bg-white rounded-3xl border-[3.5px] border-[#1C1C1C] shadow-[6px_6px_0px_#1C1C1C] overflow-hidden flex flex-col">
            {/* Table Header Bar */}
            <div className="p-4 sm:p-5 border-b-2 border-[#1C1C1C] bg-[#F5F8FF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-[#5D00FF] text-white border border-[#1C1C1C]">
                    LIST 1
                  </span>
                  <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-[#1C1C1C]">
                    City Specific Invite Requests
                  </h2>
                  <span className="text-xs font-mono font-bold text-gray-500">
                    ({filteredList1.length} records)
                  </span>
                </div>
                <p className="text-xs text-gray-600 font-medium mt-0.5">
                  General interest signups from level reward screens across cities (Mumbai, Delhi, Bengaluru).
                </p>
              </div>

              <a
                href={data?.downloadList1CsvUrl || "/api/admin/rsvps?format=csv&list=city_invites"}
                className="px-3.5 py-2 rounded-xl border-2 border-[#1C1C1C] bg-[#CFFF04] hover:bg-[#bcf000] shadow-[2px_2px_0px_#1C1C1C] text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all whitespace-nowrap self-stretch sm:self-auto justify-center"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export List 1 CSV</span>
              </a>
            </div>

            {/* List 1 Filter & Search Bar */}
            <div className="p-3 sm:p-4 border-b border-[#1C1C1C]/15 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                <span className="text-[10px] font-mono font-black uppercase text-gray-500 mr-1">City:</span>
                {["ALL", "MUMBAI", "DELHI", "BENGALURU"].map((city) => (
                  <button
                    key={city}
                    onClick={() => setList1CityFilter(city)}
                    className={`px-2.5 py-1 rounded-lg border border-[#1C1C1C] text-[11px] font-black uppercase transition-all cursor-pointer whitespace-nowrap ${
                      list1CityFilter === city
                        ? "bg-[#5D00FF] text-white shadow-[1px_1px_0px_#1C1C1C]"
                        : "bg-gray-100 text-[#1C1C1C] hover:bg-gray-200"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={list1Search}
                  onChange={(e) => setList1Search(e.target.value)}
                  placeholder="Search contact or city..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs font-mono font-bold rounded-xl border border-[#1C1C1C] bg-gray-50 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* List 1 Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100/80 border-b border-[#1C1C1C] text-[10px] font-mono font-black uppercase text-gray-600">
                    <th className="py-2.5 px-4 w-12">#</th>
                    <th className="py-2.5 px-4">Contact (Phone / Email)</th>
                    <th className="py-2.5 px-4">Requested City</th>
                    <th className="py-2.5 px-4">Level Unlocked</th>
                    <th className="py-2.5 px-4">Source</th>
                    <th className="py-2.5 px-4">Timestamp (UTC)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-xs font-mono">
                  {filteredList1.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500 font-sans font-bold">
                        {loading ? "Loading records..." : "No city invite requests matching filter."}
                      </td>
                    </tr>
                  ) : (
                    filteredList1.map((sub, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                        <td className="py-2.5 px-4 font-bold text-gray-500">{idx + 1}</td>
                        <td className="py-2.5 px-4 font-black text-[#1C1C1C]">
                          {sub.contact || sub.experienceDescription || "—"}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="inline-block px-2.5 py-0.5 rounded-full border border-[#1C1C1C] text-[10px] font-black uppercase bg-[#CFFF04]/50">
                            {sub.suggestedCity || "Mumbai"}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-bold text-gray-700">
                          {sub.levelUnlocked ? `Level ${sub.levelUnlocked}` : "All"}
                        </td>
                        <td className="py-2.5 px-4 text-gray-500 uppercase text-[10px]">
                          {sub.source || "city_invite_request"}
                        </td>
                        <td className="py-2.5 px-4 text-gray-500 text-[11px]">
                          {sub.createdAt ? new Date(sub.createdAt).toLocaleString() : "Just now"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* LIST 2: MUMBAI OFFLINE BANDHUNT REGISTRATIONS TABLE                      */}
        {/* ========================================================================= */}
        {(activeTab === "BOTH" || activeTab === "LIST_2") && (
          <div className="bg-white rounded-3xl border-[3.5px] border-[#1C1C1C] shadow-[6px_6px_0px_#1C1C1C] overflow-hidden flex flex-col">
            {/* Table Header Bar */}
            <div className="p-4 sm:p-5 border-b-2 border-[#1C1C1C] bg-[#FFF8F0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-[#FF0040] text-white border border-[#1C1C1C]">
                    LIST 2
                  </span>
                  <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-[#1C1C1C]">
                    Mumbai Offline Bandhunt Registrations
                  </h2>
                  <span className="text-xs font-mono font-bold text-[#FF0040]">
                    ({filteredList2.length} Early Access Spot Claimants)
                  </span>
                </div>
                <p className="text-xs text-gray-700 font-medium mt-0.5">
                  Exclusive list of attendees who unlocked Level 6 and claimed spot early access for the Asiatic Society Library offline event.
                </p>
              </div>

              <a
                href={data?.downloadList2CsvUrl || "/api/admin/rsvps?format=csv&list=mumbai_registrations"}
                className="px-3.5 py-2 rounded-xl border-2 border-[#1C1C1C] bg-[#FFE600] hover:bg-[#fed900] shadow-[2px_2px_0px_#1C1C1C] text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all whitespace-nowrap self-stretch sm:self-auto justify-center text-[#1C1C1C]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export List 2 CSV</span>
              </a>
            </div>

            {/* List 2 Search Bar */}
            <div className="p-3 sm:p-4 border-b border-[#1C1C1C]/15 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black uppercase bg-[#FFE600] border border-[#1C1C1C] px-2 py-0.5 rounded">
                  📍 LOCATION: ASIATIC SOCIETY LIBRARY, FORT, MUMBAI
                </span>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={list2Search}
                  onChange={(e) => setList2Search(e.target.value)}
                  placeholder="Search Mumbai contact..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs font-mono font-bold rounded-xl border border-[#1C1C1C] bg-gray-50 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* List 2 Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-yellow-50/70 border-b border-[#1C1C1C] text-[10px] font-mono font-black uppercase text-gray-600">
                    <th className="py-2.5 px-4 w-12">#</th>
                    <th className="py-2.5 px-4">Contact (Phone / Email)</th>
                    <th className="py-2.5 px-4">Event Tier</th>
                    <th className="py-2.5 px-4">Location</th>
                    <th className="py-2.5 px-4">Source</th>
                    <th className="py-2.5 px-4">Timestamp (UTC)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-xs font-mono">
                  {filteredList2.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500 font-sans font-bold">
                        {loading ? "Loading records..." : "No Mumbai offline registrations recorded yet."}
                      </td>
                    </tr>
                  ) : (
                    filteredList2.map((sub, idx) => (
                      <tr key={idx} className="hover:bg-yellow-50/60 transition-colors">
                        <td className="py-2.5 px-4 font-bold text-gray-500">{idx + 1}</td>
                        <td className="py-2.5 px-4 font-black text-[#1C1C1C]">
                          {sub.contact || sub.experienceDescription || "—"}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-[#1C1C1C] text-[10px] font-black uppercase bg-[#FFE600] text-[#1C1C1C]">
                            <Sparkles className="w-3 h-3 text-[#FF0040]" /> Early Access Pass
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-bold text-gray-700">
                          Asiatic Library, Mumbai
                        </td>
                        <td className="py-2.5 px-4 text-gray-500 uppercase text-[10px]">
                          {sub.source || "mumbai_offline_registration"}
                        </td>
                        <td className="py-2.5 px-4 text-gray-500 text-[11px]">
                          {sub.createdAt ? new Date(sub.createdAt).toLocaleString() : "Just now"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Integration Footer Note */}
        <div className="bg-[#FFE600]/20 border-2 border-[#1C1C1C] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-black uppercase text-[#1C1C1C]">
              💡 Real-Time Data Pipeline Notice
            </span>
            <p className="text-xs text-gray-700 font-medium">
              List 1 (City Specific Invites) and List 2 (Mumbai Offline Bandhunt Registrations) are saved in real-time. If you have set <code className="bg-white px-1.5 py-0.5 rounded border border-[#1C1C1C] font-mono text-[11px]">RSVP_WEBHOOK_URL</code>, each submission is also forwarded simultaneously to your Google Sheets / Zapier webhook.
            </p>
          </div>
          <a
            href={data?.downloadAllCsvUrl || "/api/admin/rsvps?format=csv"}
            className="shrink-0 px-4 py-2 bg-white hover:bg-gray-50 border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] text-xs font-black uppercase rounded-xl flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Master CSV</span>
          </a>
        </div>
      </div>
    </main>
  );
}
