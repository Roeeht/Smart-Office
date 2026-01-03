import { useState, useRef, useCallback } from "react";

interface UseTitleClickHandlerOptions {
  onAdminAction: () => void;
  onNonAdminAction: () => void;
  isAdmin: boolean;
  clickThreshold?: number;
  timeoutMs?: number;
}

interface UseTitleClickHandlerReturn {
  handleClick: () => void;
  isActive: boolean;
}

/**
 * Custom hook for handling secret triple-click admin feature.
 * Tracks consecutive clicks within a time window and triggers different actions
 * based on whether the user is an admin or not.
 */
export const useTitleClickHandler = ({
  onAdminAction,
  onNonAdminAction,
  isAdmin,
  clickThreshold = 3,
  timeoutMs = 1000,
}: UseTitleClickHandlerOptions): UseTitleClickHandlerReturn => {
  const [clickCount, setClickCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = useCallback(() => {
    // Clear existing timer
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= clickThreshold) {
      // Threshold reached
      if (isAdmin) {
        // Admin: toggle active state
        setIsActive((prev) => !prev);
        onAdminAction();
      } else {
        // Non-admin: trigger non-admin action
        onNonAdminAction();
      }
      setClickCount(0);
    } else {
      // Reset click count after timeout
      clickTimerRef.current = setTimeout(() => {
        setClickCount(0);
      }, timeoutMs);
    }
  }, [clickCount, clickThreshold, isAdmin, onAdminAction, onNonAdminAction, timeoutMs]);

  return { handleClick, isActive };
};
