function pickUsageItem(item) {
  const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  return {
    model: item?.model,
    pricePerUnit: toNumber(item?.pricePerUnit),
    grossQuantity: toNumber(item?.grossQuantity),
    grossAmount: toNumber(item?.grossAmount),
    discountQuantity: toNumber(item?.discountQuantity),
    discountAmount: toNumber(item?.discountAmount),
    netQuantity: toNumber(item?.netQuantity),
    netAmount: toNumber(item?.netAmount),
  };
}

function pickMonthUsage(monthUsage) {
  const usageItems = Array.isArray(monthUsage?.usageItems)
    ? monthUsage.usageItems
    : Array.isArray(monthUsage?.data?.usageItems)
      ? monthUsage.data.usageItems
      : [];

  const timePeriod = monthUsage?.timePeriod ?? monthUsage?.data?.timePeriod;

  const items = usageItems.map(pickUsageItem);
  items.sort((a, b) => {
    if (b.netAmount !== a.netAmount) return b.netAmount - a.netAmount;
    return b.grossAmount - a.grossAmount;
  });

  return {
    usageItems: items,
    timePeriod,
    // Keep API errors visible in variable inspector instead of silently dropping them.
    message: monthUsage?.message,
    documentation_url: monthUsage?.documentation_url,
  };
}

function transform(input) {
  const githubUser = input?.IDX_0 ?? {};
  const currentMonth = pickMonthUsage(input?.IDX_1 ?? {});
  const previousMonth = pickMonthUsage(input?.IDX_2 ?? {});

  return {
    IDX_0: {
      login: githubUser?.login,
    },
    IDX_1: currentMonth,
    IDX_2: previousMonth,
  };
}
