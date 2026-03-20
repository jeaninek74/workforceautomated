/**
 * useHaptic — lightweight haptic feedback for mobile devices.
 * Uses the Vibration API where available; silently no-ops on desktop.
 */

type HapticPattern = "light" | "medium" | "heavy" | "success" | "error" | "selection";

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 40,
  success: [10, 50, 10],
  error: [40, 30, 40],
  selection: 8,
};

export function haptic(pattern: HapticPattern = "light") {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(PATTERNS[pattern]);
    } catch {
      // silently ignore — vibration not permitted
    }
  }
}

export function useHaptic() {
  return haptic;
}
