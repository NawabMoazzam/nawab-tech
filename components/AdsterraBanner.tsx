"use client";
import { useEffect, useRef } from "react";

export default function AdsterraBanner() {
  const bannerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Ensure code only executes on the client side and runs once
    if (bannerRef.current && !bannerRef.current.firstChild) {
      const atOptions = {
        key: "3cb2c8de3ed9777942fc30fbceaed4af",
        format: "iframe",
        height: 90,
        width: 728,
        params: {},
      };

      // Set the configuration globally on the window object
      window.atOptions = atOptions;

      // Create the Adsterra script tag element
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src =
        "https://recallscarce.com/3cb2c8de3ed9777942fc30fbceaed4af/invoke.js"; // Double check your script domain in Adsterra dashboard

      // Append script inside the specific container div
      bannerRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className="flex flex-1 items-center justify-center">
      <div
        ref={bannerRef}
        className="flex justify-center items-center grow border-border border-2 my-4 min-h-22.5 max-h-22.5 min-w-182 max-w-182"
        // Giving it a min-height reduces Cumulative Layout Shift (CLS)
      />
    </div>
  );
}
