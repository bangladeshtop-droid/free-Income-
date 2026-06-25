/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from './store/useAuthStore';
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Wallet from "./pages/Wallet";
import Earn from "./pages/Earn";
import Activity from "./pages/Activity";
import Profile from "./pages/Profile";
import AdminLayout from "./pages/Admin";
import Task from "./pages/Task";
import Ads from "./pages/Ads";
import AdDetail from "./pages/AdDetail";
import TaskDetail from "./pages/TaskDetail";
import Leaderboard from "./pages/Leaderboard";
import Spin from "./pages/Spin";
import CheckIn from "./pages/CheckIn";
import Language from "./pages/Language";
import PageViewer from "./pages/PageViewer";
import Auth from "./pages/Auth";
import Notifications from "./pages/Notifications";

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

export default function App() {
  const initAuth = useAuthStore((state) => state.initAuth);
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        try {
          new window.google.translate.TranslateElement({
            pageLanguage: 'en',
            autoDisplay: false,
          }, 'google_translate_element');
        } catch (e) {
          console.warn('Google Translate error:', e);
        }
      }
    };

    if (!document.querySelector('script[src*="translate.google.com"]')) {
      const addScript = document.createElement('script');
      addScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      addScript.async = true;
      document.body.appendChild(addScript);
    }
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-blue-600 font-bold">Loading...</div>;
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <>
      <style>{`
        @keyframes cycleColors {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        .color-cycle {
          animation: cycleColors 5s linear infinite;
        }
        .goog-te-banner-frame {
            display: none !important;
        }
        .goog-text-highlight {
            background-color: transparent !important;
            box-shadow: none !important;
        }
        #goog-gt-tt, .goog-te-balloon-frame {
            display: none !important;
        }
        body {
            top: 0px !important;
            position: static !important;
        }
        .goog-tooltip {
            display: none !important;
        }
        iframe.goog-te-banner-frame {
            display: none !important;
        }
      `}</style>
      <div id="google_translate_element" style={{ display: "none" }}></div>
      <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminLayout />} />
        
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/task" element={<Task />} />
          <Route path="/ads" element={<Ads />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/earn" element={<Earn />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/spin" element={<Spin />} />
          <Route path="/checkin" element={<CheckIn />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        {/* Without Bottom Nav */}
        <Route path="/ads/:id" element={<AdDetail />} />
        <Route path="/task/:id" element={<TaskDetail />} />
        <Route path="/language" element={<Language />} />
        <Route path="/vip" element={<PageViewer />} />
        <Route path="/refer" element={<PageViewer />} />
        <Route path="/settings" element={<PageViewer />} />
        <Route path="/support" element={<PageViewer />} />
        <Route path="/about" element={<PageViewer />} />
        <Route path="/developer" element={<PageViewer />} />
        <Route path="/fund-details" element={<PageViewer />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </>
  );
}
