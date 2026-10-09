const XLSX = require('xlsx');

for (const file of ['sample_files/UK Orders.xlsx', 'sample_files/US Orders.xlsx']) {
  console.log('=== FILE:', file, '===');
  const wb = XLSX.readFile(file);
  const sheet = wb.Sheets['Ledger'];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
  
  const statuses = new Set();
  let zeroValueCount = 0;
  let missingEmailCount = 0;
  let missingCityCount = 0;
  let missingFragranceCount = 0;
  let highQtyCount = 0;
  let totalRevenue = 0;
  let refundCount = 0;
  let refundSum = 0;

  for (const r of rows) {
    statuses.add(r['Status']);
    const val = Number(r['Order Value']) || 0;
    const qty = Number(r['Order Quantity']) || 0;
    totalRevenue += val;
    if (val === 0) zeroValueCount++;
    if (!r['Email']) missingEmailCount++;
    if (!r['City']) missingCityCount++;
    if (!r['Fragrance(s) Ordered']) missingFragranceCount++;
    if (qty >= 10) highQtyCount++;
    if (String(r['Status']).toLowerCase().includes('refund')) {
      refundCount++;
      refundSum += val;
    }
  }

  console.log({
    totalRows: rows.length,
    statuses: Array.from(statuses),
    totalRevenue: totalRevenue.toFixed(2),
    refundCount,
    refundSum: refundSum.toFixed(2),
    zeroValueCount,
    missingEmailCount,
    missingCityCount,
    missingFragranceCount,
    highQtyCount
  });
}
