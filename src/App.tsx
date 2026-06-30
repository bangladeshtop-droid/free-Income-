/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./lib/firebase";
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
import Developer from "./pages/Developer";
import Support from "./pages/Support";
import VIP from "./pages/VIP";
import AccountSettings from "./pages/AccountSettings";
import Refer from "./pages/Refer";
import Achievements from "./pages/Achievements";

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

export default function App() {
  const initAuth = useAuthStore((state) => state.initAuth);
  const { user, isLoading } = useAuthStore();
  const prevBalanceRef = useRef<number | null>(null);
  const initialTaskLoadRef = useRef(true);

  // Ask for notification permission
  useEffect(() => {
    initAuth();
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [initAuth]);

  // Listen for balance changes for rewards
  useEffect(() => {
    if (
      user &&
      user.pushEnabled !== false &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      const currentBalance = user.vaBalance || 0;
      if (
        prevBalanceRef.current !== null &&
        currentBalance > prevBalanceRef.current
      ) {
        const diff = currentBalance - prevBalanceRef.current;
        new Notification("Reward Granted! 🎁", {
          body: `You just received ${diff.toLocaleString()} VA!`,
          icon: "/favicon.ico", // Or any app icon
        });
      }
      prevBalanceRef.current = currentBalance;
    }
  }, [user?.vaBalance, user?.pushEnabled]);

  // Listen for new tasks
  useEffect(() => {
    if (
      !user ||
      user.pushEnabled === false ||
      !("Notification" in window) ||
      Notification.permission !== "granted"
    )
      return;

    const tasksRef = collection(db, "tasks");
    const q = query(tasksRef, orderBy("createdAt", "desc"), limit(1));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (initialTaskLoadRef.current) {
        initialTaskLoadRef.current = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const taskData = change.doc.data();
          new Notification("New Task Available! 📋", {
            body: `Earn ${taskData.reward || 0} VA: ${taskData.title || "Complete this task"}`,
            icon: "/favicon.ico",
          });
        }
      });
    });

    return () => unsubscribe();
  }, [user, user?.pushEnabled]);

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        try {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              autoDisplay: false,
            },
            "google_translate_element",
          );
        } catch (e) {
          console.warn("Google Translate error:", e);
        }
      }
    };

    if (!document.querySelector('script[src*="translate.google.com"]')) {
      const addScript = document.createElement("script");
      addScript.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      addScript.async = true;
      document.body.appendChild(addScript);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-blue-600 font-bold">
        Loading...
      </div>
    );
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
          <Route path="/vip" element={<VIP />} />
          <Route path="/refer" element={<Refer />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/settings" element={<AccountSettings />} />
          <Route path="/support" element={<Support />} />
          <Route path="/about" element={<PageViewer />} />
          <Route path="/developer" element={<Developer />} />
          <Route path="/fund-details" element={<PageViewer />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
