// "use client";

// import Grainient from "@/components/grainient";
// import { ThemeProvider } from "@/providers/theme-provider";
// import { useTheme } from "next-themes";
// import React, { ReactNode } from "react";

// interface LayoutProps {
//   children: ReactNode;
// }

// export default function Layout({ children }: LayoutProps) {
//   //   const { resolvedTheme } = useTheme(); // "light" or "dark"

//   // https://reactbits.dev/tools/background-studio?bg=grainient&color1=68759c&color2=0c003d&color3=594c85&timeSpeed=0&noiseScale=0&grainAmount=0&grainScale=0.2
//   const darkGrainient = (
//     <Grainient
//       color1="#68759c"
//       color2="#0c003d"
//       color3="#594c85"
//       timeSpeed={0.25}
//       colorBalance={0}
//       warpStrength={1}
//       warpFrequency={5}
//       warpSpeed={2}
//       warpAmplitude={50}
//       blendAngle={0}
//       blendSoftness={0.05}
//       rotationAmount={500}
//       noiseScale={0}
//       grainAmount={0}
//       grainScale={2}
//       grainAnimated={false}
//       contrast={1.5}
//       gamma={1}
//       saturation={1}
//       centerX={0}
//       centerY={0}
//       zoom={0.9}
//     />
//   );

//   const lightGrainient = (
//     <Grainient
//       color1="#d0d7ec"
//       color2="#bdbbc3"
//       color3="#c6b8f4"
//       timeSpeed={0.25}
//       colorBalance={0}
//       warpStrength={1}
//       warpFrequency={5}
//       warpSpeed={2}
//       warpAmplitude={50}
//       blendAngle={0}
//       blendSoftness={0.05}
//       rotationAmount={500}
//       noiseScale={0}
//       grainAmount={0}
//       grainScale={2}
//       grainAnimated={false}
//       contrast={1.5}
//       gamma={1}
//       saturation={1}
//       centerX={0}
//       centerY={0}
//       zoom={0.9}
//     />
//   );

//   //   const currentGrainient =
//   //     resolvedTheme === "dark" ? darkGrainient : lightGrainient;

//   return (
//     <div className="relative h-screen w-screen overflow-hidden">
//       {/* Fullscreen Grainient background behind everything */}
//       <div className="absolute inset-0 z-0">{darkGrainient}</div>

//       {/* All children go above the background */}
//       <div className="dark relative z-10 h-full w-full">{children}</div>
//     </div>
//   );
// }

"use client";

import granientBackground from "@/images/grainient.png";
import React, { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${granientBackground.src})`,
        }}
      />

      {/* Optional dark overlay for better contrast */}
      {/* <div className="absolute inset-0 -z-10 bg-black/30" /> */}

      {/* Page Content */}
      <div className="relative z-10 flex h-full w-full items-center justify-center">
        {children}
      </div>
    </div>
  );
}
