function pickUsageItem(item) {
  const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  return {
    model: item?.model ?? item?.sku,
    sku: item?.sku,
    unitType: item?.unitType,
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
    message: monthUsage?.message,
    documentation_url: monthUsage?.documentation_url,
  };
}

function friendlyUnitType(raw) {
  const map = { AICredits: 'AI Credits', Requests: 'Requests' };
  return map[raw] ?? raw;
}

function pickHistory(usageData) {
  const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const items = Array.isArray(usageData?.usageItems)
    ? usageData.usageItems
    : Array.isArray(usageData?.data?.usageItems)
      ? usageData.data.usageItems
      : [];

  const byMonth = {};
  for (const item of items) {
    if (item?.product?.toLowerCase() !== 'copilot') continue;
    const date = item.date ?? '';
    const monthKey = date.substring(0, 7);
    if (!monthKey) continue;
    if (!byMonth[monthKey]) {
      byMonth[monthKey] = {
        date: item.date,
        quantity: 0,
        unitType: friendlyUnitType(item.unitType ?? ''),
        grossAmount: 0,
        discountAmount: 0,
        netAmount: 0,
      };
    }
    byMonth[monthKey].quantity += toNumber(item.quantity);
    byMonth[monthKey].grossAmount += toNumber(item.grossAmount);
    byMonth[monthKey].discountAmount += toNumber(item.discountAmount);
    byMonth[monthKey].netAmount += toNumber(item.netAmount);
  }

  return Object.values(byMonth).sort((a, b) => b.date.localeCompare(a.date));
}

function transform(input) {
  const githubUser = input?.IDX_0 ?? {};
  const currentMonth = pickMonthUsage(input?.IDX_1 ?? {});
  const previousMonth = pickMonthUsage(input?.IDX_2 ?? {});
  const history = pickHistory(input?.IDX_3 ?? {});

  return {
    IDX_0: {
      login: githubUser?.login,
    },
    IDX_1: currentMonth,
    IDX_2: previousMonth,
    IDX_3: history,
  };
}
