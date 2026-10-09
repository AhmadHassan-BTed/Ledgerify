import XLSX from 'xlsx';
const wb = XLSX.readFile('sample_files/UK Orders.xlsx');

for (const s of ['Returning Cust.', 'Refunds']) {
  const ws = wb.Sheets[s];
  const matrix = XLSX.utils.sheet_to_json(ws, { header: 1 });
  console.log('=== Sheet:', s);
  for (let i = 0; i < Math.min(10, matrix.length); i++) {
    console.log(`  Row ${i}:`, matrix[i]);
  }
}
