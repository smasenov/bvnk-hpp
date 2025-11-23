import React from "react";
import { FadeLoader } from "react-spinners";
import styles from "./LoadingSpinner.module.scss";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  color?: string;
  height?: number;
  width?: number;
  className?: string;
}

/**
 * Reusable loading spinner component
 * @param size - Size of the spinner (small, medium, large)
 * @param color - Color of the spinner
 * @param className - Additional CSS class
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  height,
  width,
  size = "medium",
  color = "#1976d2",
  className = "",
}) => {
  const sizeConfig = {
    small: { height: height || 2, width: width || 0.375, radius: 0.25, margin: 0 },
    medium: { height: height || 4, width: width || 1.5, radius: 1, margin: 1 },
    large: { height: height || 8, width: width || 2, radius: 2, margin: 2 },
  };

  const config = sizeConfig[size];

  return (
    <div className={`${styles.loaderWrapper} ${className}`}>
      <FadeLoader
        color={color}
        height={config.height}
        width={config.width}
        radius={config.radius}
        margin={config.margin}
      />
    </div>
  );
};

