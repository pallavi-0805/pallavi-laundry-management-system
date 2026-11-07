const express = require('express');
const path = require('path');
const db = require('./db');
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const resources = {
  customers: { table:'customers', id:'customer_id', fields:['name','phone','email','address'] },
  services: { table:'services', id:'service_id', fields:['service_name','price_per_kg','description'] },
  orders: { table:'orders', id:'order_id', fields:['customer_id','service_id','clothes_weight','order_date','delivery_date','total_amount','status'] },
  payments: { table:'payments', id:'payment_id', fields:['order_id','amount','payment_date','payment_method','status'] }
};
for (const [key, cfg] of Object.entries(resources)) {
  app.get(`/api/${key}`, async (req,res) => {
    try {
      const [rows] = await db.query(`SELECT * FROM ${cfg.table} ORDER BY ${cfg.id} DESC`);
      res.json(rows);
    } catch(e) { res.status(500).json({error:e.message}); }
  });
  app.post(`/api/${key}`, async (req,res) => {
    try {
      const fields = cfg.fields.filter(f => req.body[f] !== undefined);
      if (!fields.length) return res.status(400).json({error:'Enter the required details'});
      const values = fields.map(f => req.body[f] === '' ? null : req.body[f]);
      const [result] = await db.query(
        `INSERT INTO ${cfg.table} (${fields.join(',')}) VALUES (${fields.map(()=>'?').join(',')})`, values);
      res.status(201).json({message:'Created successfully', id:result.insertId});
    } catch(e) { res.status(400).json({error:e.message}); }
  });
  app.put(`/api/${key}/:id`, async (req,res) => {
    try {
      const fields = cfg.fields.filter(f => req.body[f] !== undefined);
      if (!fields.length) return res.status(400).json({error:'No fields to update'});
      const values = fields.map(f => req.body[f] === '' ? null : req.body[f]);
      const [result] = await db.query(
        `UPDATE ${cfg.table} SET ${fields.map(f=>`${f}=?`).join(',')} WHERE ${cfg.id}=?`,
        [...values, req.params.id]);
      res.json({message:result.affectedRows ? 'Updated successfully' : 'Record not found'});
    } catch(e) { res.status(400).json({error:e.message}); }
  });
  app.delete(`/api/${key}/:id`, async (req,res) => {
    try {
      const [result] = await db.query(`DELETE FROM ${cfg.table} WHERE ${cfg.id}=?`, [req.params.id]);
      res.json({message:result.affectedRows ? 'Deleted successfully' : 'Record not found'});
    } catch(e) { res.status(400).json({error:'Cannot delete: this record may be linked to another record.'}); }
  });
}
app.get('/api/dashboard', async (req,res) => {
  try {
    const counts = {};
    for (const [k,v] of Object.entries(resources)) {
      const [[row]] = await db.query(`SELECT COUNT(*) AS total FROM ${v.table}`);
      counts[k] = row.total;
    }
    const [[sales]] = await db.query('SELECT COALESCE(SUM(amount),0) AS total FROM payments WHERE status = "Paid"');
    counts.revenue = sales.total;
    res.json(counts);
  } catch(e) { res.status(500).json({error:e.message}); }
});
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Pallavi Laundry app running at http://localhost:${port}`));