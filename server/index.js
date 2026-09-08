import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { pool, testConnection } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'farmdirect_sih_secret_key_2026';

app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  const dbOk = await testConnection();
  res.json({
    status: 'ok',
    database: dbOk ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const staticOtp = '2026';
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      `INSERT INTO otp_codes (phone, otp, expires_at) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE otp = VALUES(otp), expires_at = VALUES(expires_at)`,
      [phone, staticOtp, expiresAt]
    );

    res.json({
      success: true,
      message: 'OTP sent successfully. For hackathon demo, use OTP: 2026',
      otp: staticOtp,
    });
  } catch (err) {
    console.error('send-otp error:', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, otp, role, name } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required' });
    }

    if (otp !== '2026') {
      const [rows] = await pool.query(
        'SELECT * FROM otp_codes WHERE phone = ? AND otp = ? AND expires_at > NOW()',
        [phone, otp]
      );
      if (!rows || rows.length === 0) {
        return res.status(401).json({ error: 'Invalid or expired OTP. Please use 2026' });
      }
    }

    let [userRows] = await pool.query('SELECT * FROM users WHERE phone = ?', [phone]);
    let user = userRows[0];

    if (!user) {
      const userId = `USER-${Date.now().toString().slice(-6)}`;
      const assignedRole = role || 'FARMER';
      const defaultName = name || (assignedRole === 'FARMER' ? 'Rajesh Kumar' : assignedRole === 'BUYER' ? 'FreshBasket Buyer' : 'Admin User');
      const defaultLocation = assignedRole === 'FARMER' ? 'Agra Farm Cluster' : 'Delhi NCR';

      await pool.query(
        'INSERT INTO users (id, phone, name, role, location) VALUES (?, ?, ?, ?, ?)',
        [userId, phone, defaultName, assignedRole, defaultLocation]
      );

      user = {
        id: userId,
        phone,
        name: defaultName,
        role: assignedRole,
        location: defaultLocation,
      };
    }

    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user,
    });
  } catch (err) {
    console.error('verify-otp error:', err);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    const products = rows.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      quantity: p.quantity,
      initialQuantity: p.initial_quantity,
      pricePerKg: Number(p.price_per_kg),
      location: p.location,
      harvestDate: p.harvest_date ? p.harvest_date.toISOString().split('T')[0] : '',
      quality: p.quality,
      farmerId: p.farmer_id,
      farmerName: p.farmer_name,
      farmerPhone: p.farmer_phone,
      farmerRating: Number(p.farmer_rating) || 4.9,
      imageUrl: p.image_url,
      status: p.status,
    }));
    res.json(products);
  } catch (err) {
    console.error('get products error:', err);
    res.status(500).json({ error: 'Failed to fetch products from database' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const {
      name,
      category,
      quantity,
      pricePerKg,
      location,
      harvestDate,
      quality,
      farmerName,
      farmerPhone,
      imageUrl,
    } = req.body;

    const id = `PROD-${Date.now().toString().slice(-4)}`;
    const initialQty = Number(quantity);
    const harvest = harvestDate || new Date().toISOString().split('T')[0];

    await pool.query(
      `INSERT INTO products 
       (id, name, category, quantity, initial_quantity, price_per_kg, location, harvest_date, quality, farmer_id, farmer_name, farmer_phone, farmer_rating, image_url, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 4.9, ?, 'Active')`,
      [
        id,
        name,
        category,
        initialQty,
        initialQty,
        Number(pricePerKg),
        location || 'Agra',
        harvest,
        quality || 'Grade A (Premium)',
        'USER-001',
        farmerName || 'Rajesh Kumar',
        farmerPhone || '+91 98765 43210',
        imageUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
      ]
    );

    res.status(201).json({
      id,
      name,
      category,
      quantity: initialQty,
      initialQuantity: initialQty,
      pricePerKg: Number(pricePerKg),
      location: location || 'Agra',
      harvestDate: harvest,
      quality: quality || 'Grade A (Premium)',
      farmerName: farmerName || 'Rajesh Kumar',
      farmerPhone: farmerPhone || '+91 98765 43210',
      farmerRating: 4.9,
      imageUrl,
      status: 'Active',
    });
  } catch (err) {
    console.error('create product error:', err);
    res.status(500).json({ error: 'Failed to create product listing in database' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    const orders = rows.map((o) => ({
      id: o.id,
      productId: o.product_id,
      productName: o.product_name,
      category: o.category,
      farmerId: o.farmer_id,
      farmerName: o.farmer_name,
      buyerId: o.buyer_id,
      buyerName: o.buyer_name,
      quantity: o.quantity,
      pricePerKg: Number(o.price_per_kg),
      totalPrice: Number(o.total_price),
      logisticsFee: Number(o.logistics_fee),
      finalAmount: Number(o.final_amount),
      deliveryLocation: o.delivery_location,
      status: o.status,
      orderDate: o.order_date ? o.order_date.toISOString().split('T')[0] : '',
      estimatedDelivery: o.estimated_delivery,
    }));
    res.json(orders);
  } catch (err) {
    console.error('get orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders from database' });
  }
});

app.post('/api/orders', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { productId, quantity, deliveryLocation, buyerName } = req.body;
    const reqQty = Number(quantity);

    const [prodRows] = await connection.query('SELECT * FROM products WHERE id = ? FOR UPDATE', [productId]);
    if (!prodRows || prodRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Product not found' });
    }

    const prod = prodRows[0];
    if (prod.quantity < reqQty) {
      await connection.rollback();
      return res.status(400).json({ error: `Insufficient stock. Only ${prod.quantity} kg available.` });
    }

    const newQty = prod.quantity - reqQty;
    await connection.query('UPDATE products SET quantity = ? WHERE id = ?', [newQty, productId]);

    const orderId = `ORD-${Date.now().toString().slice(-4)}`;
    const pricePerKg = Number(prod.price_per_kg);
    const totalPrice = reqQty * pricePerKg;
    const logisticsFee = Math.max(150, Math.round(reqQty * 2.2));
    const finalAmount = totalPrice + logisticsFee;
    const orderDate = new Date().toISOString().split('T')[0];
    const estDelivery = 'Tomorrow · 10:00 AM';

    await connection.query(
      `INSERT INTO orders 
       (id, product_id, product_name, category, farmer_id, farmer_name, buyer_id, buyer_name, quantity, price_per_kg, total_price, logistics_fee, final_amount, delivery_location, status, order_date, estimated_delivery) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', ?, ?)`,
      [
        orderId,
        prod.id,
        prod.name,
        prod.category,
        prod.farmer_id,
        prod.farmer_name,
        'USER-002',
        buyerName || 'FreshBasket Supermarket',
        reqQty,
        pricePerKg,
        totalPrice,
        logisticsFee,
        finalAmount,
        deliveryLocation || 'Delhi Hub',
        orderDate,
        estDelivery,
      ]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      order: {
        id: orderId,
        productId: prod.id,
        productName: prod.name,
        category: prod.category,
        farmerName: prod.farmer_name,
        buyerName: buyerName || 'FreshBasket Supermarket',
        quantity: reqQty,
        pricePerKg,
        totalPrice,
        logisticsFee,
        finalAmount,
        deliveryLocation,
        status: 'Confirmed',
        orderDate,
        estimatedDelivery: estDelivery,
      },
    });
  } catch (err) {
    await connection.rollback();
    console.error('place order error:', err);
    res.status(500).json({ error: 'Failed to place order in database' });
  } finally {
    connection.release();
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, id, status });
  } catch (err) {
    console.error('update order status error:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

app.get('/api/market/rates', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM market_rates');
    res.json(rows);
  } catch (err) {
    console.error('get market rates error:', err);
    res.status(500).json({ error: 'Failed to fetch market rates' });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const [orderStats] = await pool.query(
      'SELECT COALESCE(SUM(final_amount), 0) as gmv, COUNT(*) as order_count FROM orders'
    );
    const [farmerCount] = await pool.query('SELECT COUNT(DISTINCT farmer_id) as count FROM products');
    const [buyerCount] = await pool.query('SELECT COUNT(DISTINCT buyer_id) as count FROM orders');
    const [productCount] = await pool.query('SELECT COUNT(*) as count FROM products WHERE quantity > 0');

    res.json({
      gmv: Number(orderStats[0].gmv) || 0,
      totalOrders: Number(orderStats[0].order_count) || 0,
      totalFarmers: Math.max(12, Number(farmerCount[0].count) || 0),
      totalBuyers: Math.max(8, Number(buyerCount[0].count) || 0),
      totalProducts: Number(productCount[0].count) || 0,
      estimatedSavings: Math.round((Number(orderStats[0].gmv) || 0) * 0.18),
    });
  } catch (err) {
    console.error('get stats error:', err);
    res.status(500).json({ error: 'Failed to calculate database statistics' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`FarmDirect API server running on port ${PORT}`);
});
