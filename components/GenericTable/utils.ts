export const exportToCsv = <T extends Record<string, any>>(
  data: T[],
  headers: string[],
  fileName: string
): void => {
  const csvContent = `${headers.join(",")}\n${data
    .map((e) =>
      headers
        .map((header) => {
          const value = e[header.toLowerCase().replace(/ /g, "")];
          return `"${(value?.toString() || "").replace(/"/g, '""')}"`;
        })
        .join(",")
    )
    .join("\n")}`;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
