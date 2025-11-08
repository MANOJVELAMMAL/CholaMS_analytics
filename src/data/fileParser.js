import Papa from "papaparse";
import * as XLSX from "xlsx";

/**
 * Parses CSV/XLS/XLSX files.
 * Returns both the sheet/table name and its data.
 * CSV → file name = table name
 * XLS/XLSX → each sheet name = table name
 */
export function parseFile(file) {
  return new Promise((resolve, reject) => {
    const name = file.name.toLowerCase();

    // 🟢 CSV Handling
    if (name.endsWith(".csv")) {
      const tableName = file.name.replace(/\.[^/.]+$/, ""); // remove .csv
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (res) =>
          resolve({
            tables: [tableName], // single table
            data: { [tableName]: res.data },
          }),
        error: reject,
      });
    }

    // 🟣 XLS/XLSX Handling
    else {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target.result, { type: "binary" });
          const tables = wb.SheetNames;
          const data = {};

          tables.forEach((sheet) => {
            const sheetData = XLSX.utils.sheet_to_json(wb.Sheets[sheet]);
            data[sheet] = sheetData;
          });

          resolve({ tables, data });
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsBinaryString(file);
    }
  });
}
