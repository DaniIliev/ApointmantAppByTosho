const getFilteredData = () => {
  const now = new Date();
  let tempFilteredData = data;

  // Filter by date first
  if (dateFilter !== "all") {
    tempFilteredData = tempFilteredData.filter((item) => {
      const dateValue = item.date as string; // Assuming 'date' is the accessorKey
      if (!dateValue) return false;

      const itemDate = new Date(dateValue);
      itemDate.setHours(0, 0, 0, 0); // Normalize date to avoid time issues

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - today.getDay());

      const nextWeekStart = new Date(thisWeekStart);
      nextWeekStart.setDate(thisWeekStart.getDate() + 7);

      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      const nextMonthStart = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        1
      );

      switch (dateFilter) {
        case "today":
          return itemDate.getTime() === today.getTime();
        case "tomorrow":
          return itemDate.getTime() === tomorrow.getTime();
        case "this_week":
          return itemDate >= thisWeekStart && itemDate < nextWeekStart;
        case "next_week":
          return (
            itemDate >= nextWeekStart &&
            itemDate <
              new Date(
                nextWeekStart.getFullYear(),
                nextWeekStart.getMonth(),
                nextWeekStart.getDate() + 7
              )
          );
        case "this_month":
          return (
            itemDate.getMonth() === thisMonthStart.getMonth() &&
            itemDate.getFullYear() === thisMonthStart.getFullYear()
          );
        case "next_month":
          return (
            itemDate.getMonth() === nextMonthStart.getMonth() &&
            itemDate.getFullYear() === nextMonthStart.getFullYear()
          );
        case "future":
          return itemDate > nextMonthStart;
        default:
          return true;
      }
    });
  }

  // Apply global filter
  if (globalFilter) {
    tempFilteredData = tempFilteredData.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(globalFilter.toLowerCase())
      )
    );
  }
  return tempFilteredData;
};
