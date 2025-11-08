// src/data/dataManager.js

/**
 * Local data engine for CSV / XLSX data
 * Supports multiple filters, search, and sort
 */
export function applyQuery(data = [], model = {}) {
  let result = Array.isArray(data) ? [...data] : [];
  const { search = [], sort = null, filters = [] } = model || {};

  // 🔍 1️⃣ Search (case-insensitive)
  if (search.length) {
    result = result.filter((row) =>
      search.every((s) => {
        const cell = String(row[s.column] ?? "").toLowerCase().trim();
        const target = String(s.value ?? "").toLowerCase().trim();
        return cell.includes(target); // partial match for usability
      })
    );
  }

  // ⚙️ 2️⃣ Filters (supports AND/OR)
  if (filters.length) {
    result = result.filter((row) => {
      return filters.reduce((acc, f, idx) => {
        const leftVal = getAggOrValue(f.leftAgg, f.leftCol, row, result);
        const rightVal =
          f.rightAgg || f.rightCol
            ? getAggOrValue(f.rightAgg, f.rightCol, row, result)
            : tryParse(f.rightValue);

        const ok = compareValues(leftVal, rightVal, f.op);
        if (idx === 0) return ok;

        const logic = (f.logic || "AND").toUpperCase();
        return logic === "OR" ? acc || ok : acc && ok;
      }, true);
    });
  }

  // ↕️ 3️⃣ Sort (after filtering)
  if (sort && sort.column) {
    const order = (sort.order || "asc").toLowerCase();
    result.sort((a, b) => {
      const av = tryParse(a[sort.column]);
      const bv = tryParse(b[sort.column]);
      if (order === "asc") return av > bv ? 1 : av < bv ? -1 : 0;
      if (order === "desc") return av < bv ? 1 : av > bv ? -1 : 0;
      return 0;
    });
  }

  return { result };
}

/* 🧩 Helpers */
function tryParse(val) {
  const num = parseFloat(val);
  return isNaN(num) ? val : num;
}

function getAggOrValue(agg, col, row, dataset) {
  if (!col) return null;
  if (!agg) return row[col];
  return getAggExpression(`${agg}(${col})`, dataset);
}

function getAggExpression(expr, dataset) {
  const match = expr.match(/(MAX|MIN|SUM|AVG)\(([^)]+)\)/i);
  if (!match) return null;
  const func = match[1].toUpperCase();
  const col = match[2].trim();
  const values = dataset.map((r) => parseFloat(r[col])).filter((v) => !isNaN(v));
  if (!values.length) return null;

  switch (func) {
    case "MAX": return Math.max(...values);
    case "MIN": return Math.min(...values);
    case "SUM": return values.reduce((a, b) => a + b, 0);
    case "AVG": return values.reduce((a, b) => a + b, 0) / values.length;
    default: return null;
  }
}

function compareValues(a, b, op) {
  const na = parseFloat(a);
  const nb = parseFloat(b);
  switch (op) {
    case "=": return a == b;
    case "!=": return a != b;
    case ">": return na > nb;
    case "<": return na < nb;
    case ">=": return na >= nb;
    case "<=": return na <= nb;
    default: return false;
  }
}
