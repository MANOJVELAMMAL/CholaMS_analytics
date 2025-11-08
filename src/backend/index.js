import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
app.use(cors());
app.use(express.json());

const connections = {}; // store per-session in memory keyed by id (for demo). In prod, use secure store.

app.post('/api/connect', async (req,res) => {
  try {
    const { host, user, password, database } = req.body;
    const conn = await mysql.createConnection({ host, user, password, database });
    // create a simple token (not secure) for demo
    const token = Math.random().toString(36).slice(2,9);
    connections[token] = { conn, config: { host, user, database } };
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tables', async (req,res) => {
  try {
    // For demo assume default connection is the last one
    const last = Object.values(connections).slice(-1)[0];
    if(!last) return res.status(400).json({ error: 'no connection' });
    const [rows] = await last.conn.query('SHOW TABLES');
    res.json(rows.map(r=>Object.values(r)[0]));
  } catch(e){ res.status(500).json({ error: e.message }); }
});

app.post('/api/table', async (req, res) => {
  try {
    const { table } = req.body;
    const last = Object.values(connections).slice(-1)[0];
    if (!last) return res.status(400).json({ error: 'no connection' });

    //FIXED: removed extra backslashes
    const [rows] = await last.conn.query(`SELECT * FROM \`${table}\` LIMIT 5000`);
    res.json({ rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.post("/api/query", async (req, res) => {
  try {
    const { table, search = [], filters = [], sort = null } = req.body;
    const last = Object.values(connections).slice(-1)[0];
    if (!last) return res.status(400).json({ error: "no connection" });

    // Base query
    let sql = `SELECT * FROM \`${table}\``;
    const whereParts = [];
    const params = [];
   // Exact Match Search (equals instead of LIKE)
if (search.length) {
  const parts = search.map((s) => `\`${s.column}\` = ?`);
  params.push(...search.map((s) => s.value));
  whereParts.push(parts.join(" AND "));
}


    // Filters (supports aggregations)
    if (filters.length) {
      const conds = [];
      filters.forEach((f, idx) => {
        const logic = idx === 0 ? "" : f.logic || "AND";

        // Left side expression
        const leftExpr = f.leftAgg
          ? `${f.leftAgg.toUpperCase()}(\`${f.leftCol}\`)`
          : `\`${f.leftCol}\``;

        // Right side expression
        let rightExpr = "?";
        if (f.rightAgg)
          rightExpr = `${f.rightAgg.toUpperCase()}(\`${f.rightCol}\`)`;
        else if (f.rightCol)
          rightExpr = `\`${f.rightCol}\``;
        else params.push(f.rightValue);

        conds.push(`${logic} (${leftExpr} ${f.op} ${rightExpr})`);
      });

      whereParts.push(conds.join(" "));
    }

    //WHERE Clause (filters & search combined)
    if (whereParts.length) {
      sql += " WHERE " + whereParts.join(" ");
    }

    //  ORDER BY (after WHERE)
    if (sort && sort.column) {
      // detect aggregate in sort
      const sortCol = sort.column.trim();
      const isAggSort = /\b(MAX|MIN|AVG|SUM)\b/i.test(sortCol);

      // prevent SQL injection
      const order = String(sort.order || "ASC").toUpperCase() === "DESC" ? "DESC" : "ASC";

      if (isAggSort) {
        // Wrap aggregation in subquery to allow ORDER BY on aggregate
        sql = `SELECT * FROM (${sql}) AS subquery ORDER BY ${sortCol} ${order}`;
      } else {
        // normal column sort
        sql += ` ORDER BY \`${sort.column}\` ${order}`;
      }
    }

    //  Execute safely
    const [rows] = await last.conn.query(sql, params);
    res.json({ rows, query: sql });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});


app.post("/api/run-sql", async (req, res) => {
  try {
    const { query } = req.body;
    const last = Object.values(connections).slice(-1)[0];
    if (!last) return res.status(400).json({ error: "No active MySQL connection" });

    // Prevent destructive statements
    if (!query.trim().toLowerCase().startsWith("select"))
      return res.status(400).json({ error: "Only SELECT queries are allowed" });

    // Execute directly on active connection
    const [rows] = await last.conn.query(query);
    res.json({ rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});



app.listen(5000, ()=> console.log('Server listening on 5000'));
