import { t } from "i18next";

export interface Props {
  time: number;
  size?: "xs" | "sm" | "lg";
  className?: string;
}

export default function CardReadingTime({
  time,
  size = "xs",
  className,
}: Props) {
  const iconScale =
    size === "xs" ? "scale-50" : size === "sm" ? "scale-75" : "scale-100";
  const textSize =
    size === "xs"
      ? "text-[11px]"
      : size === "sm"
      ? "text-[12px]"
      : "text-[14px]";

  return (
    <div className={`flex items-center space-x-2 opacity-80 ${className}`}>
      <svg
        viewBox="0 0 24 24"
        astro-icon="heroicons-outline:clock"
        className={iconScale}
      >
        <path
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
        ></path>
      </svg>
      <span className={textSize}>
        {Math.ceil(time).toFixed(0)} {t("post.minutes")}
      </span>
    </div>
  );
}
