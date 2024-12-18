"use client";
import { useEffect } from "react";
declare global {
    interface Window {
      dataLayer: any[];
    }
  }
export default function Ganalytics() {
  useEffect(() => {
    // Load the Google Analytics script asynchronously
    const Gcode = process.env.GANALYTICS
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${Gcode}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize Google Analytics
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(arguments);
    }
    gtag("js", new Date());
    gtag("config", Gcode);
  }, []);
  return <> </>;
}
