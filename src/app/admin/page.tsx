"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BrandCollabLogo } from "@/components/ui/BrandCollabLogo";
import { Download, RefreshCw, Search, Users, MapPin, Calendar, Lock, KeyRound, LogOut, ArrowLeft } from "lucide-react";

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
  cityCounts: Record<string, number>;
  submissions: Submission[];
  downloadCsvUrl: string;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterCity, setFilterCity] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

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
              Enter founder passphrase to view, track, and export live offline Bandhunt registrations.
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

  const filteredSubmissions = (data?.submissions || []).filter((sub) => {
    const city = (sub.suggestedCity || "").toUpperCase();
    if (filterCity !== "ALL" && !city.includes(filterCity)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const contact = (sub.contact || sub.experienceDescription || "").toLowerCase();
      const c = city.toLowerCase();
      return contact.includes(q) || c.includes(q);
    }
    return true;
  });

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
                BANDHUNT RSVP &amp; SIGNUP TRACKER
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-3.5 py-2.5 rounded-xl border-2 border-[#1C1C1C] bg-white hover:bg-gray-50 shadow-[2px_2px_0px_#1C1C1C] text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-gray-500" : ""}`} />
              <span>Refresh</span>
            </button>

            <a
              href={data?.downloadCsvUrl || "/api/admin/rsvps?format=csv"}
              download="taest_bandhunt_rsvps.csv"
              className="px-4 py-2.5 rounded-xl border-2 border-[#1C1C1C] bg-[#CFFF04] hover:bg-[#bcf000] shadow-[3px_3px_0px_#1C1C1C] text-xs font-black uppercase flex items-center gap-2 cursor-pointer active:scale-95 transition-all whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
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

        {/* Overview Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border-2 border-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] flex flex-col gap-1">
            <span className="text-[11px] font-mono font-black text-gray-500 uppercase flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#5D00FF]" /> Total RSVPs
            </span>
            <span className="text-3xl font-black text-[#1C1C1C]">
              {data?.totalCount ?? 0}
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-600">
              Live registrations
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border-2 border-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] flex flex-col gap-1">
            <span className="text-[11px] font-mono font-black text-gray-500 uppercase flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#FF2E9A]" /> Mumbai
            </span>
            <span className="text-3xl font-black text-[#1C1C1C]">
              {data?.cityCounts["Mumbai"] || data?.cityCounts["mumbai"] || 0}
            </span>
            <span className="text-[10px] font-mono text-gray-500">
              Drop Ground Zero
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border-2 border-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] flex flex-col gap-1">
            <span className="text-[11px] font-mono font-black text-gray-500 uppercase flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#00F0FF]" /> Delhi
            </span>
            <span className="text-3xl font-black text-[#1C1C1C]">
              {data?.cityCounts["Delhi"] || data?.cityCounts["delhi"] || 0}
            </span>
            <span className="text-[10px] font-mono text-gray-500">
              Upcoming Pitstop
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border-2 border-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] flex flex-col gap-1">
            <span className="text-[11px] font-mono font-black text-gray-500 uppercase flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#FFE600]" /> Bengaluru
            </span>
            <span className="text-3xl font-black text-[#1C1C1C]">
              {data?.cityCounts["Bengaluru"] || data?.cityCounts["Bangalore"] || 0}
            </span>
            <span className="text-[10px] font-mono text-gray-500">
              Upcoming Pitstop
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border-2 border-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {["ALL", "MUMBAI", "DELHI", "BENGALURU"].map((city) => (
              <button
                key={city}
                onClick={() => setFilterCity(city)}
                className={`px-3 py-1.5 rounded-xl border border-[#1C1C1C] text-xs font-black uppercase transition-all cursor-pointer whitespace-nowrap ${
                  filterCity === city
                    ? "bg-[#1C1C1C] text-white shadow-[1.5px_1.5px_0px_#FFE600]"
                    : "bg-gray-100 text-[#1C1C1C] hover:bg-gray-200"
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search phone, email, city..."
              className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold rounded-xl border border-[#1C1C1C] bg-gray-50 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-3xl border-[3px] border-[#1C1C1C] shadow-[5px_5px_0px_#1C1C1C] overflow-hidden">
          <div className="p-4 border-b-2 border-[#1C1C1C] bg-gray-50 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-gray-700">
              Registrations List ({filteredSubmissions.length} records)
            </span>
            <span className="text-[10px] font-mono text-gray-500">
              Auto-refreshed from database
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100/70 border-b border-[#1C1C1C] text-[11px] font-mono font-black uppercase text-gray-600">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Contact (Phone / Email)</th>
                  <th className="py-3 px-4">Selected City</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Date &amp; Time (UTC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-xs font-mono">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 font-sans font-bold">
                      {loading ? "Loading registrations..." : "No registrations found matching filter."}
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((sub, idx) => (
                    <tr key={idx} className="hover:bg-yellow-50/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-500">{idx + 1}</td>
                      <td className="py-3 px-4 font-black text-[#1C1C1C]">
                        {sub.contact || sub.experienceDescription || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full border border-[#1C1C1C] text-[10px] font-black uppercase bg-[#CFFF04]/50">
                          {sub.suggestedCity || "Mumbai"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-700">
                        {sub.levelUnlocked ? `Level ${sub.levelUnlocked}` : "Spot #6"}
                      </td>
                      <td className="py-3 px-4 text-gray-500 uppercase text-[10px]">
                        {sub.source || "rsvp_modal"}
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-[11px]">
                        {sub.createdAt ? new Date(sub.createdAt).toLocaleString() : "Just now"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Integration Note for Founders */}
        <div className="bg-[#FFE600]/20 border-2 border-[#1C1C1C] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-black uppercase text-[#1C1C1C]">
              💡 Want real-time sync straight to your Google Sheet?
            </span>
            <p className="text-xs text-gray-700 font-medium">
              You can set the <code className="bg-white px-1.5 py-0.5 rounded border border-[#1C1C1C] font-mono text-[11px]">RSVP_WEBHOOK_URL</code> environment variable to your Google Sheets Apps Script, Zapier, or Make.com webhook. Every registration will immediately appear as a new row in your Google Sheet!
            </p>
          </div>
          <a
            href={data?.downloadCsvUrl || "/api/admin/rsvps?format=csv"}
            className="shrink-0 px-4 py-2 bg-white hover:bg-gray-50 border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] text-xs font-black uppercase rounded-xl flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>
    </main>
  );
}
