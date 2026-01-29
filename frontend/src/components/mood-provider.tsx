"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type MoodType = "Happy" | "Neutral" | "Sad" | "Angry" | "Anxious" | "Stressed" | string;

// We define distinct color palettes for each mood.
// These will correspond to standard Tailwind/shadcn variables:
// --primary, --secondary, --accent, --background (gradient)
const MOOD_THEMES: Record<string, {
    primary: string;   // For buttons, strong accents
    secondary: string; // For user bubbles, highlights
    accent: string;    // For backgrounds, subtle elements
    gradient: string;  // Main background
}> = {
    Happy: {
        primary: "#ca8a04",    // Yellow-600
        secondary: "#16a34a",  // Green-600
        accent: "#fefce8",     // Yellow-50
        gradient: "linear-gradient(135deg, #fefce8 0%, #f0fdf4 100%)",
    },
    Neutral: {
        primary: "#0284c7",    // Sky-600
        secondary: "#0ea5e9",  // Sky-500
        accent: "#f0f9ff",     // Sky-50
        gradient: "linear-gradient(135deg, #f0f9ff 0%, #eff6ff 100%)",
    },
    Sad: {
        primary: "#475569",    // Slate-600
        secondary: "#64748b",  // Slate-500
        accent: "#f8fafc",     // Slate-50
        gradient: "linear-gradient(135deg, #eef2ff 0%, #f8fafc 100%)",
    },
    Angry: {
        primary: "#dc2626",    // Red-600
        secondary: "#ea580c",  // Orange-600
        accent: "#fef2f2",     // Red-50
        gradient: "linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%)",
    },
    Anxious: {
        primary: "#7c3aed",    // Violet-600
        secondary: "#9333ea",  // Purple-600
        accent: "#faf5ff",     // Purple-50
        gradient: "linear-gradient(135deg, #f5f3ff 0%, #f9fafb 100%)",
    },
};

const ThemeContext = createContext<{
    mood: MoodType;
    setMood: (mood: MoodType) => void;
} | null>(null);

const getTheme = (mood: string) => {
    const m = mood.charAt(0).toUpperCase() + mood.slice(1).toLowerCase();
    if (MOOD_THEMES[m]) return MOOD_THEMES[m];
    if (m.includes("Happy") || m.includes("Positive") || m.includes("Excited")) return MOOD_THEMES["Happy"];
    if (m.includes("Sad") || m.includes("Depressed") || m.includes("Low")) return MOOD_THEMES["Sad"];
    if (m.includes("Angry") || m.includes("Stressed") || m.includes("Annoyed")) return MOOD_THEMES["Angry"];
    if (m.includes("Anxious") || m.includes("Fear") || m.includes("Scared")) return MOOD_THEMES["Anxious"];
    return MOOD_THEMES["Neutral"];
};

export function MoodProvider({ children }: { children: React.ReactNode }) {
    const [mood, setMood] = useState<MoodType>("Neutral");

    useEffect(() => {
        const theme = getTheme(mood);
        const root = document.documentElement;

        // We simply update the CSS variables.
        // Since we're using Tailwind v4 or v3 with variable mapping, 
        // classes like 'bg-primary' will automatically reflect these new values.

        root.style.setProperty("--primary", theme.primary);
        root.style.setProperty("--secondary", theme.secondary);
        // Also update a special background variable for the gradient
        root.style.setProperty("--theme-bg-gradient", theme.gradient);

        // Optional: Update accent color
        root.style.setProperty("--accent", theme.accent);

    }, [mood]);

    return (
        <ThemeContext.Provider value={{ mood, setMood }}>
            {/* We apply the gradient using a style tag because gradients are complex in pure tailwind classes dynamically */}
            <div
                className="min-h-screen transition-[background] duration-700 ease-in-out"
                style={{ background: "var(--theme-bg-gradient)" }}
            >
                {children}
            </div>
        </ThemeContext.Provider>
    );
}

export const useMood = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useMood must be used within a MoodProvider");
    return context;
};
