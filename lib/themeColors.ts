const THEME_CHART_VARIABLES = [
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--chart-5",
  "--chart-6",
] as const;

export const THEME_CHART_FALLBACK_COLORS = [
  "#3b61c0",
  "#0ea5e9",
  "#8b5cf6",
  "#22c55e",
  "#f97316",
  "#e11d48",
];

export const getThemeChartColorTokens = () =>
  THEME_CHART_VARIABLES.map((token) => `var(${token})`);

export const getThemeChartColorsFromDOM = (
  fallback: string[] = THEME_CHART_FALLBACK_COLORS,
) => {
  if (typeof window === "undefined") return fallback;

  const styles = getComputedStyle(document.documentElement);
  const colors = THEME_CHART_VARIABLES.map((token, index) => {
    const value = styles.getPropertyValue(token).trim();
    return value || fallback[index] || fallback[0];
  });

  return colors.length ? colors : fallback;
};

export const resolveThemeColor = (color: string) => {
  if (typeof window === "undefined") return color;
  const trimmed = color.trim();
  const varMatch = trimmed.match(/^var\((--[^)]+)\)$/);
  if (!varMatch) return trimmed;

  const tokenValue = getComputedStyle(document.documentElement)
    .getPropertyValue(varMatch[1])
    .trim();

  return tokenValue || trimmed;
};
