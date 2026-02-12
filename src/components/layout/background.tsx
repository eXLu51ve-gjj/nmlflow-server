"use client";

import { useStore } from "@/store";

export function Background() {
  const { backgroundPreset, customBackgroundUrl, backgroundDarkness } = useStore();
  
  const backgroundUrl = customBackgroundUrl || 
    (backgroundPreset !== "none" 
      ? useStore.getState().getBackgroundUrl() 
      : "");

  if (!backgroundUrl) {
    return (
      <div className="fixed inset-0 -z-10 bg-slate-950" />
    );
  }

  return (
    <>
      {/* Background Image */}
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundUrl})` }}
      />
      {/* Dark Overlay - динамическое затемнение */}
      <div 
        className="fixed inset-0 -z-10 transition-opacity duration-300" 
        style={{ backgroundColor: `rgba(0, 0, 0, ${backgroundDarkness / 100})` }}
      />
    </>
  );
}
