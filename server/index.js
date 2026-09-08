import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { exec } from 'child_process';
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

app.post('/api/webhook/deploy', (req, res) => {
  res.json({ status: 'Deployment triggered', timestamp: new Date().toISOString() });
  exec('/root/deploy.sh > /tmp/deploy.log 2>&1 &', (error) => {
    if (error) console.error('Deploy script error:', error);
  });
});

app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const rawPhone = req.body.phone || '';
    const phone = rawPhone.replace(/[\s\-]/g, '');
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
      message: 'OTP sent successfully. For demo, use OTP: 2026',
      otp: staticOtp,
    });
  } catch (err) {
    console.error('send-otp error:', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const rawPhone = req.body.phone || '';
    const phone = rawPhone.replace(/[\s\-]/g, '');
    const { otp, role, name } = req.body;
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

      if (assignedRole === 'FARMER') {
        await pool.query(
          'INSERT INTO farmer_profiles (user_id, cluster_name, latitude, longitude, rating, verified) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, defaultLocation, 27.1767, 78.0081, 4.9, true]
        );
      }

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

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    res.json({ success: true, user });
  });
});

app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.phone, u.name, u.role, u.location, u.created_at, 
              fp.cluster_name, fp.rating 
       FROM users u 
       LEFT JOIN farmer_profiles fp ON u.id = fp.user_id 
       ORDER BY u.created_at ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error('get users error:', err);
    res.status(500).json({ error: 'Failed to fetch users from database' });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    console.error('get categories error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         p.id,
         p.name,
         c.name AS category,
         p.quantity,
         p.initial_quantity AS initialQuantity,
         p.price_per_kg AS pricePerKg,
         COALESCE(fp.cluster_name, u.location) AS location,
         DATE_FORMAT(p.harvest_date, '%Y-%m-%d') AS harvestDate,
         p.quality,
         u.id AS farmerId,
         u.name AS farmerName,
         u.phone AS farmerPhone,
         COALESCE(fp.rating, 4.9) AS farmerRating,
         p.image_url AS imageUrl,
         p.status
       FROM products p
       JOIN users u ON p.farmer_id = u.id
       JOIN categories c ON p.category_id = c.id
       LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
       ORDER BY p.created_at DESC`
    );

    const products = rows.map((p) => ({
      ...p,
      pricePerKg: Number(p.pricePerKg),
      farmerRating: Number(p.farmerRating),
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
      farmerId,
      farmerName,
      farmerPhone,
      imageUrl,
    } = req.body;

    const id = `PROD-${Date.now().toString().slice(-4)}`;
    const initialQty = Number(quantity);
    const harvest = harvestDate || new Date().toISOString().split('T')[0];

    let [catRows] = await pool.query('SELECT id FROM categories WHERE name = ?', [category || 'Vegetables']);
    let categoryId = catRows[0]?.id || 1;

    let fId = farmerId || 'USER-001';
    const [userRows] = await pool.query('SELECT id FROM users WHERE id = ?', [fId]);
    if (userRows.length === 0) {
      fId = 'USER-001';
    }

    await pool.query(
      `INSERT INTO products 
       (id, farmer_id, category_id, name, quantity, initial_quantity, price_per_kg, location, harvest_date, quality, image_url, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
      [
        id,
        fId,
        categoryId,
        name,
        initialQty,
        initialQty,
        Number(pricePerKg),
        location || 'Agra',
        harvest,
        quality || 'Grade A (Premium)',
        imageUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
      ]
    );

    res.status(201).json({
      id,
      name,
      category: category || 'Vegetables',
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
      status: 'ACTIVE',
    });
  } catch (err) {
    console.error('create product error:', err);
    res.status(500).json({ error: 'Failed to create product listing in database' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         o.id,
         oi.product_id AS productId,
         p.name AS productName,
         c.name AS category,
         fu.id AS farmerId,
         fu.name AS farmerName,
         bu.id AS buyerId,
         bu.name AS buyerName,
         oi.quantity,
         oi.price_per_kg AS pricePerKg,
         oi.total_price AS totalPrice,
         o.logistics_fee AS logisticsFee,
         o.final_amount AS finalAmount,
         o.delivery_location AS deliveryLocation,
         o.status,
         DATE_FORMAT(o.order_date, '%Y-%m-%d') AS orderDate,
         COALESCE(s.estimated_delivery, 'Tomorrow · 10:00 AM') AS estimatedDelivery,
         s.vehicle_number AS vehicleNumber,
         s.driver_name AS driverName,
         s.driver_phone AS driverPhone,
         s.temperature_celsius AS temperatureCelsius
       FROM orders o
       JOIN users bu ON o.buyer_id = bu.id
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       JOIN categories c ON p.category_id = c.id
       JOIN users fu ON p.farmer_id = fu.id
       LEFT JOIN shipments s ON o.id = s.order_id
       ORDER BY o.created_at DESC`
    );

    const orders = rows.map((o) => ({
      ...o,
      pricePerKg: Number(o.pricePerKg),
      totalPrice: Number(o.totalPrice),
      logisticsFee: Number(o.logisticsFee),
      finalAmount: Number(o.finalAmount),
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

    const [prodRows] = await connection.query(
      `SELECT p.*, u.name AS farmer_name 
       FROM products p 
       JOIN users u ON p.farmer_id = u.id 
       WHERE p.id = ? FOR UPDATE`,
      [productId]
    );

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

    let [buyerRows] = await connection.query('SELECT id FROM users WHERE role = "BUYER" LIMIT 1');
    const buyerId = buyerRows[0]?.id || 'USER-002';

    await connection.query(
      `INSERT INTO orders 
       (id, buyer_id, status, total_product_amount, logistics_fee, final_amount, delivery_location, order_date) 
       VALUES (?, ?, 'Confirmed', ?, ?, ?, ?, ?)`,
      [orderId, buyerId, totalPrice, logisticsFee, finalAmount, deliveryLocation || 'Delhi Terminal Hub', orderDate]
    );

    const itemId = `ITEM-${orderId}-1`;
    await connection.query(
      `INSERT INTO order_items 
       (id, order_id, product_id, quantity, price_per_kg, total_price) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [itemId, orderId, prod.id, reqQty, pricePerKg, totalPrice]
    );

    const shipId = `SHIP-${orderId}`;
    await connection.query(
      `INSERT INTO shipments 
       (id, order_id, driver_name, driver_phone, vehicle_number, temperature_celsius, pickup_time, estimated_delivery, status) 
       VALUES (?, ?, 'Manpreet Singh', '+91 98112 34567', 'DL-1L-4482', 4.0, 'Today · 11:30 AM', 'Tomorrow · 10:00 AM', 'In Transit')`,
      [shipId, orderId]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      order: {
        id: orderId,
        productId: prod.id,
        productName: prod.name,
        category: 'Vegetables',
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
        estimatedDelivery: 'Tomorrow · 10:00 AM',
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
    await pool.query('UPDATE shipments SET status = ? WHERE order_id = ?', [status, id]);
    res.json({ success: true, id, status });
  } catch (err) {
    console.error('update order status error:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

app.get('/api/market/rates', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         mr.id,
         mr.crop_name,
         c.name AS category_name,
         mr.mandi_farmer_price,
         mr.mandi_consumer_price,
         mr.farmdirect_farmer_price,
         mr.farmdirect_consumer_price,
         mr.demand_growth
       FROM market_rates mr
       JOIN categories c ON mr.category_id = c.id
       ORDER BY mr.id ASC`
    );
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
    const [farmerCount] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "FARMER"');
    const [buyerCount] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "BUYER"');
    const [productCount] = await pool.query('SELECT COUNT(*) as count FROM products WHERE quantity > 0');

    res.json({
      gmv: Number(orderStats[0].gmv) || 0,
      totalOrders: Number(orderStats[0].order_count) || 0,
      totalFarmers: Number(farmerCount[0].count) || 0,
      totalBuyers: Number(buyerCount[0].count) || 0,
      totalProducts: Number(productCount[0].count) || 0,
      estimatedSavings: Math.round((Number(orderStats[0].gmv) || 0) * 0.18),
    });
  } catch (err) {
    console.error('get stats error:', err);
    res.status(500).json({ error: 'Failed to calculate database statistics' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`FarmDirect Normalized API server running on port ${PORT}`);
});
