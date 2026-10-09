const XLSX = require('xlsx');

for (const file of ['sample_files/UK Orders.xlsx', 'sample_files/US Orders.xlsx']) {
  console.log('=== FILE:', file, '===');
  const wb = XLSX.readFile(file);
  console.log('Sheets:', wb.SheetNames);
  for (const sheetName of wb.SheetNames) {
    if (sheetName.toLowerCase().includes('ledger')) {
      const sheet = wb.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: null });
      console.log(`\nSheet [${sheetName}]: ${json.length} rows`);
      if (json.length > 0) {
        console.log('Keys:', Object.keys(json[0]));
        console.log('Sample Row 0:', json[0]);
      }
    }
  }
}
