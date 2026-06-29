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

function mixHexColors(color1: string, color2: string, weight1: number = 0.5): string {
  const parseColor = (col: string): [number, number, number] => {
    let val = col.trim();
    if (val.startsWith("var(")) {
      val = resolveThemeColor(val);
    }
    if (val.startsWith("#")) {
      if (val.length === 4) {
        return [
          parseInt(val[1] + val[1], 16),
          parseInt(val[2] + val[2], 16),
          parseInt(val[3] + val[3], 16)
        ];
      }
      return [
        parseInt(val.slice(1, 3), 16),
        parseInt(val.slice(3, 5), 16),
        parseInt(val.slice(5, 7), 16)
      ];
    }
    const rgbMatch = val.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (rgbMatch) {
      return [Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3])];
    }
    return [128, 128, 128];
  };

  const c1 = parseColor(color1);
  const c2 = parseColor(color2);
  const r = Math.round(c1[0] * weight1 + c2[0] * (1 - weight1));
  const g = Math.round(c1[1] * weight1 + c2[1] * (1 - weight1));
  const b = Math.round(c1[2] * weight1 + c2[2] * (1 - weight1));

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export const resolveThemeColor = (color: string): string => {
  if (typeof window === "undefined") return color;
  const trimmed = color.trim();

  // Handle CSS color-mix values which Canvas does not natively parse
  const mixMatch = trimmed.match(/color-mix\(\s*in\s+\w+\s*,\s*([^,]+?)(?:\s+(\d+)%)?\s*,\s*([^,]+?)(?:\s+(\d+)%)?\s*\)/i);
  if (mixMatch) {
    const col1 = resolveThemeColor(mixMatch[1]);
    const col2 = resolveThemeColor(mixMatch[3]);
    const weight1 = mixMatch[2] ? Number(mixMatch[2]) / 100 : 0.5;
    return mixHexColors(col1, col2, weight1);
  }

  const varMatch = trimmed.match(/^var\((--[^)]+)\)$/);
  if (!varMatch) return trimmed;

  const tokenValue = getComputedStyle(document.documentElement)
    .getPropertyValue(varMatch[1])
    .trim();

  return tokenValue ? resolveThemeColor(tokenValue) : trimmed;
};
