"use client";
import { JSX, useEffect, useRef } from "react";

interface bannerVariants {
  varient: "728x90" | "320x50";
}

export default function AdsterraBanner({
  varient,
}: bannerVariants): JSX.Element {
  if (varient === "728x90") {
    return <Banner728x90 />;
  } else {
    return <Banner320x50 />;
  }
}

function Banner320x50() {
  const bannerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Ensure code only executes on the client side and runs once
    if (bannerRef.current && !bannerRef.current.firstChild) {
      const atOptions = {
        key: "3e908e7430b24d70c2fbd03f4e65d4b4",
        format: "iframe",
        height: 50,
        width: 320,
        params: {},
      };

      // Set the configuration globally on the window object
      window.atOptions = atOptions;

      // Create the Adsterra script tag element
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src =
        "https://recallscarce.com/3e908e7430b24d70c2fbd03f4e65d4b4/invoke.js";

      // Append script inside the specific container div
      bannerRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className="flex flex-1 items-center justify-center max-w-screen">
      <div
        ref={bannerRef}
        className="flex justify-center items-center border-border border-2 my-4 min-h-12.5 w-full max-w-80"
        // Giving it a min-height reduces Cumulative Layout Shift (CLS)
      />
    </div>
  );
}

function Banner728x90() {
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
    <div className="flex flex-1 items-center justify-center max-w-screen">
      <div
        ref={bannerRef}
        className="flex justify-center items-center border-border border-2 my-4 min-h-22.5 w-full max-w-182"
        // Giving it a min-height reduces Cumulative Layout Shift (CLS)
      />
    </div>
  );
}
