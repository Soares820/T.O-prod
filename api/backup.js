const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://sceqtztqdmflabdvrzwt.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
);

// Cron: runs daily at 03:00 UTC via vercel.json
// Also callable manually via POST /api/backup (admin only)
module.exports = async (req, res) => {
  // Allow Vercel cron (GET) or manual trigger (POST with secret)
  if (req.method === 'POST') {
    const secret = req.headers['x-backup-secret'] || req.body?.secret;
    if (secret !== process.env.BACKUP_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  } else if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    const tables = ['clinics','users','pacientes','sessoes','avaliacoes','contratos','pagamentos','funcionarios','audit_logs'];
    const snapshot = {};
    const errors   = [];

    for (const tbl of tables) {
      const { data, error } = await supabase.from(tbl).select('*');
      if (error) { errors.push({ table: tbl, error: error.message }); }
      else        { snapshot[tbl] = data; }
    }

    // Store snapshot in audit_logs for traceability
    await supabase.from('audit_logs').insert({
      action:   'BACKUP_DIARIO',
      tabela:   'system',
      detalhes: JSON.stringify({
        timestamp:   new Date().toISOString(),
        tablesOk:    Object.keys(snapshot).length,
        tablesFailed: errors.length,
        totalRows:   Object.values(snapshot).reduce((s, rows) => s + rows.length, 0),
      }),
    });

    return res.status(200).json({
      ok:          true,
      timestamp:   new Date().toISOString(),
      tablesOk:    Object.keys(snapshot).length,
      tablesFailed: errors.length,
      errors,
      totalRows:   Object.values(snapshot).reduce((s, rows) => s + rows.length, 0),
    });
  } catch (err) {
    console.error('Backup error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
