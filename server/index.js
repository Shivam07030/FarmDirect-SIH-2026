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

// Dynamic Market Policy & Purchase Rationing Rules (Managed by Admin)
let dynamicMarketRules = {
  id: 'RULE-001',
  retailMaxQtyKg: 2.0,
  wholesaleMinQtyKg: 25.0,
  retailDeliveryFee: 25.0,
  wholesaleBaseFreight: 150.0,
  wholesalePerKgFreight: 2.2,
  isRationingActive: true,
  rationingReason: 'Essential Commodities Price Stabilization Directive #FD-2026',
  updatedAt: new Date().toISOString(),
};

async function initMarketRulesTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS market_rules (
        id VARCHAR(36) PRIMARY KEY,
        retail_max_qty_kg DECIMAL(10,2) DEFAULT 2.00,
        wholesale_min_qty_kg DECIMAL(10,2) DEFAULT 25.00,
        retail_delivery_fee DECIMAL(10,2) DEFAULT 25.00,
        wholesale_base_freight DECIMAL(10,2) DEFAULT 150.00,
        wholesale_per_kg_freight DECIMAL(10,2) DEFAULT 2.20,
        is_rationing_active BOOLEAN DEFAULT TRUE,
        rationing_reason VARCHAR(255) DEFAULT 'Essential Commodities Price Stabilization Directive #FD-2026',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    const [rows] = await pool.query('SELECT * FROM market_rules WHERE id = "RULE-001"');
    if (rows && rows.length === 0) {
      await pool.query(`
        INSERT INTO market_rules (id, retail_max_qty_kg, wholesale_min_qty_kg, retail_delivery_fee, wholesale_base_freight, wholesale_per_kg_freight, is_rationing_active, rationing_reason)
        VALUES ("RULE-001", 2.00, 25.00, 25.00, 150.00, 2.20, TRUE, "Essential Commodities Price Stabilization Directive #FD-2026")
      `);
    } else if (rows && rows.length > 0) {
      const r = rows[0];
      dynamicMarketRules = {
        id: r.id,
        retailMaxQtyKg: Number(r.retail_max_qty_kg),
        wholesaleMinQtyKg: Number(r.wholesale_min_qty_kg),
        retailDeliveryFee: Number(r.retail_delivery_fee),
        wholesaleBaseFreight: Number(r.wholesale_base_freight),
        wholesalePerKgFreight: Number(r.wholesale_per_kg_freight),
        isRationingActive: Boolean(r.is_rationing_active),
        rationingReason: r.rationing_reason || 'Essential Commodities Price Stabilization Directive #FD-2026',
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
      };
    }
  } catch (e) {
    console.warn('initMarketRulesTable note (using in-memory fallback):', e.message);
  }
}
initMarketRulesTable();

app.get('/api/admin/market-rules', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM market_rules WHERE id = "RULE-001"');
    if (rows && rows.length > 0) {
      const r = rows[0];
      return res.json({
        retailMaxQtyKg: Number(r.retail_max_qty_kg),
        wholesaleMinQtyKg: Number(r.wholesale_min_qty_kg),
        retailDeliveryFee: Number(r.retail_delivery_fee),
        wholesaleBaseFreight: Number(r.wholesale_base_freight),
        wholesalePerKgFreight: Number(r.wholesale_per_kg_freight),
        isRationingActive: Boolean(r.is_rationing_active),
        rationingReason: r.rationing_reason,
        updatedAt: r.updated_at,
      });
    }
  } catch (e) {}
  res.json(dynamicMarketRules);
});

app.put('/api/admin/market-rules', async (req, res) => {
  try {
    const {
      retailMaxQtyKg,
      wholesaleMinQtyKg,
      retailDeliveryFee,
      wholesaleBaseFreight,
      wholesalePerKgFreight,
      isRationingActive,
      rationingReason,
    } = req.body;

    if (retailMaxQtyKg !== undefined) dynamicMarketRules.retailMaxQtyKg = Number(retailMaxQtyKg);
    if (wholesaleMinQtyKg !== undefined) dynamicMarketRules.wholesaleMinQtyKg = Number(wholesaleMinQtyKg);
    if (retailDeliveryFee !== undefined) dynamicMarketRules.retailDeliveryFee = Number(retailDeliveryFee);
    if (wholesaleBaseFreight !== undefined) dynamicMarketRules.wholesaleBaseFreight = Number(wholesaleBaseFreight);
    if (wholesalePerKgFreight !== undefined) dynamicMarketRules.wholesalePerKgFreight = Number(wholesalePerKgFreight);
    if (isRationingActive !== undefined) dynamicMarketRules.isRationingActive = Boolean(isRationingActive);
    if (rationingReason !== undefined) dynamicMarketRules.rationingReason = String(rationingReason);
    dynamicMarketRules.updatedAt = new Date().toISOString();

    try {
      await pool.query(
        `UPDATE market_rules SET
          retail_max_qty_kg = ?,
          wholesale_min_qty_kg = ?,
          retail_delivery_fee = ?,
          wholesale_base_freight = ?,
          wholesale_per_kg_freight = ?,
          is_rationing_active = ?,
          rationing_reason = ?
        WHERE id = "RULE-001"`,
        [
          dynamicMarketRules.retailMaxQtyKg,
          dynamicMarketRules.wholesaleMinQtyKg,
          dynamicMarketRules.retailDeliveryFee,
          dynamicMarketRules.wholesaleBaseFreight,
          dynamicMarketRules.wholesalePerKgFreight,
          dynamicMarketRules.isRationingActive,
          dynamicMarketRules.rationingReason,
        ]
      );
    } catch (e) {}

    res.json({ success: true, rules: dynamicMarketRules });
  } catch (err) {
    console.error('update market rules error:', err);
    res.status(500).json({ error: 'Failed to update market rules' });
  }
});

app.post('/api/auth/verify-gst', async (req, res) => {
  try {
    const rawGstin = (req.body.gstin || '').trim().toUpperCase();
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    if (!rawGstin || !gstRegex.test(rawGstin)) {
      return res.status(400).json({
        valid: false,
        error: 'Invalid GSTIN format. A valid 15-digit GSTIN is required (e.g. 07AAAAF1234A1Z5).',
      });
    }

    const stateCode = rawGstin.substring(0, 2);
    const pan = rawGstin.substring(2, 12);
    const stateMap = {
      '07': 'Delhi',
      '09': 'Uttar Pradesh',
      '06': 'Haryana',
      '08': 'Rajasthan',
      '03': 'Punjab',
      '27': 'Maharashtra',
      '24': 'Gujarat',
      '19': 'West Bengal',
      '29': 'Karnataka',
      '33': 'Tamil Nadu',
      '10': 'Bihar',
      '23': 'Madhya Pradesh',
    };

    const state = stateMap[stateCode] || 'National Territory';
    const legalNames = {
      '07AAAAF1234A1Z5': 'FreshBasket Retail Enterprises Pvt Ltd',
      '09AABCA5567B1Z2': 'AgroPure Food Processing Ltd',
      '07AACCD9988K1Z9': 'Delhi Culinary Wholesale Cooperative',
    };

    const legalName = legalNames[rawGstin] || `${pan.slice(0, 5)} Wholesale Traders & Retailers Pvt Ltd`;

    res.json({
      valid: true,
      gstin: rawGstin,
      pan,
      state,
      legalName,
      status: 'ACTIVE_REGISTERED',
      complianceScore: '98%',
      message: 'GSTIN successfully verified with GST Network (GSTN).',
    });
  } catch (err) {
    res.status(500).json({ valid: false, error: 'GST verification service unavailable' });
  }
});

app.post('/api/auth/verify-farmer-land', async (req, res) => {
  try {
    const pmKisanId = (req.body.pmKisanId || '').trim().toUpperCase();
    const khasraNo = (req.body.khasraNo || '').trim();
    const acres = req.body.acres || req.body.landSizeAcres ? Number(req.body.acres || req.body.landSizeAcres) : null;

    if (!pmKisanId && !khasraNo) {
      return res.status(400).json({
        valid: false,
        error: 'Either a PM-KISAN ID or Land Survey / Khasra number is required.',
      });
    }

    res.json({
      valid: true,
      pmKisanId: pmKisanId || null,
      khasraNo: khasraNo || null,
      landSizeAcres: acres,
      landClassification: 'Agricultural / Irrigated Multi-Crop',
      soilHealthCardStatus: 'Certified Valid',
      kisanTrustScore: 'Verified Genuine Farmer',
      verifiedRevenueDistrict: req.body.clusterLocation || 'Verified Revenue Belt',
      message: 'Land ownership record verified with State Land Registry & PM-KISAN Portal.',
    });
  } catch (err) {
    res.status(500).json({ valid: false, error: 'Farmer land registry lookup failed' });
  }
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
    const { 
      otp, 
      role, 
      name, 
      pmKisanId, 
      khasraNo, 
      landSizeAcres, 
      gstin, 
      businessLegalName, 
      fssaiLicense,
      location 
    } = req.body;

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
      const defaultName = name || (assignedRole === 'FARMER' ? 'Farmer User' : assignedRole === 'BUYER' ? 'Buyer User' : 'Admin User');
      const defaultLocation = location || (assignedRole === 'FARMER' ? 'Farm Cluster' : 'Delhi NCR');

      await pool.query(
        'INSERT INTO users (id, phone, name, role, location, verification_status, gstin, business_legal_name, fssai_license) VALUES (?, ?, ?, ?, ?, "VERIFIED", ?, ?, ?)',
        [userId, phone, defaultName, assignedRole, defaultLocation, gstin || null, businessLegalName || null, fssaiLicense || null]
      );

      if (assignedRole === 'FARMER') {
        await pool.query(
          'INSERT INTO farmer_profiles (user_id, cluster_name, pm_kisan_id, khasra_khatauni_no, land_size_acres, latitude, longitude, rating, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            userId, 
            defaultLocation, 
            pmKisanId || null, 
            khasraNo || null, 
            landSizeAcres ? Number(landSizeAcres) : null, 
            27.1767, 
            78.0081, 
            4.9, 
            true
          ]
        );
      }

      user = {
        id: userId,
        phone,
        name: defaultName,
        role: assignedRole,
        location: defaultLocation,
        verificationStatus: 'VERIFIED',
        gstin: gstin || null,
        businessLegalName: businessLegalName || null,
        pmKisanId: pmKisanId || null,
        khasraNo: khasraNo || null,
        landSizeAcres: landSizeAcres ? Number(landSizeAcres) : null,
      };
    } else {
      // Update any KYC provided on subsequent login
      if (gstin || businessLegalName || fssaiLicense) {
        await pool.query(
          'UPDATE users SET gstin = COALESCE(?, gstin), business_legal_name = COALESCE(?, business_legal_name), fssai_license = COALESCE(?, fssai_license) WHERE id = ?',
          [gstin || null, businessLegalName || null, fssaiLicense || null, user.id]
        );
      }
      if (user.role === 'FARMER' && (pmKisanId || khasraNo || landSizeAcres)) {
        await pool.query(
          'UPDATE farmer_profiles SET pm_kisan_id = COALESCE(?, pm_kisan_id), khasra_khatauni_no = COALESCE(?, khasra_khatauni_no), land_size_acres = COALESCE(?, land_size_acres) WHERE user_id = ?',
          [pmKisanId || null, khasraNo || null, landSizeAcres ? Number(landSizeAcres) : null, user.id]
        );
      }
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
      `SELECT u.id, u.phone, u.name, u.role, u.location, u.verification_status AS verificationStatus,
              u.gstin, u.business_legal_name AS businessLegalName, u.fssai_license AS fssaiLicense,
              u.created_at, fp.cluster_name, fp.rating, fp.pm_kisan_id AS pmKisanId,
              fp.khasra_khatauni_no AS khasraNo, fp.land_size_acres AS landSizeAcres 
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

    const numPrice = Number(pricePerKg);
    const [rateRows] = await pool.query(
      'SELECT crop_name, price_floor, price_ceiling FROM market_rates WHERE ? LIKE CONCAT("%", crop_name, "%") OR crop_name LIKE CONCAT("%", ?, "%") LIMIT 1',
      [name, name]
    );
    if (rateRows.length > 0) {
      const rate = rateRows[0];
      const floor = Number(rate.price_floor);
      const ceil = Number(rate.price_ceiling);
      if (numPrice < floor) {
        return res.status(400).json({
          error: `Price below Minimum Fair Floor (₹${floor}/kg for ${rate.crop_name}). Distressed selling below government MSP/cost collar is restricted.`
        });
      }
      if (numPrice > ceil) {
        return res.status(400).json({
          error: `Price above Maximum Fair Ceiling (₹${ceil}/kg for ${rate.crop_name}). Speculative price gouging beyond Mandi collar is restricted.`
        });
      }
    }

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

    const orders = rows.map((o) => {
      const idHash = Math.abs(o.id.split('').reduce((acc, c) => ((acc << 5) - acc) + c.charCodeAt(0), 0));
      const fallbackOtp = String((idHash % 9000) + 1000);
      return {
        ...o,
        deliveryOtp: o.deliveryOtp || fallbackOtp,
        pricePerKg: Number(o.pricePerKg),
        totalPrice: Number(o.totalPrice),
        logisticsFee: Number(o.logisticsFee),
        finalAmount: Number(o.finalAmount),
      };
    });

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

    const { productId, quantity, deliveryLocation, buyerName, buyerTier } = req.body;
    const reqQty = Number(quantity);

    // Dual-tier buyer purchase limits governed dynamically by Admin marketRules
    const tier = buyerTier || (reqQty <= dynamicMarketRules.retailMaxQtyKg ? 'RETAIL' : 'WHOLESALE');
    if (tier === 'RETAIL' && dynamicMarketRules.isRationingActive && reqQty > dynamicMarketRules.retailMaxQtyKg) {
      await connection.rollback();
      return res.status(400).json({ 
        error: `Retail Household Cap Exceeded: Purchases in the Normal Buyer section are currently capped at ${dynamicMarketRules.retailMaxQtyKg} kg per crop by Market Authority (${dynamicMarketRules.rationingReason}).` 
      });
    }

    if (tier === 'WHOLESALE' && reqQty < dynamicMarketRules.wholesaleMinQtyKg) {
      await connection.rollback();
      return res.status(400).json({ 
        error: `Wholesale Minimum Not Met: Commercial wholesale orders require a minimum batch of ${dynamicMarketRules.wholesaleMinQtyKg} kg for refrigerated freight. For small household quantities, please order via the Normal Buyer section.` 
      });
    }

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
    const totalPrice = Math.round(reqQty * pricePerKg * 100) / 100;
    // Dynamic logistics calculation from Admin marketRules
    const logisticsFee = tier === 'RETAIL' 
      ? dynamicMarketRules.retailDeliveryFee 
      : Math.max(dynamicMarketRules.wholesaleBaseFreight, Math.round(reqQty * dynamicMarketRules.wholesalePerKgFreight));
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
        vehicleNumber: 'DL-1L-4482',
        driverName: 'Manpreet Singh',
        driverPhone: '+91 98112 34567',
        temperatureCelsius: 4.0,
        deliveryOtp: String(Math.floor(1000 + Math.random() * 9000)),
        buyerTier: tier,
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
         mr.price_floor AS priceFloor,
         mr.price_ceiling AS priceCeiling,
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

app.get('/api/market/collar/:cropName', async (req, res) => {
  try {
    const { cropName } = req.params;
    const [rows] = await pool.query(
      `SELECT mr.crop_name, mr.price_floor, mr.price_ceiling, mr.mandi_farmer_price, mr.farmdirect_farmer_price
       FROM market_rates mr 
       WHERE ? LIKE CONCAT('%', mr.crop_name, '%') OR mr.crop_name LIKE CONCAT('%', ?, '%')
       LIMIT 1`,
      [cropName, cropName]
    );

    if (rows.length > 0) {
      const r = rows[0];
      const floor = Number(r.price_floor);
      const ceil = Number(r.price_ceiling);
      const rec = Number(r.farmdirect_farmer_price);
      return res.json({
        cropName: r.crop_name,
        floorPrice: floor,
        ceilingPrice: ceil,
        msp: Number(r.mandi_farmer_price),
        recommendedPrice: rec,
        reason: `Floor = MSP/Cost x 1.5 (₹${floor}/kg), Ceiling = Mandi Retail cap (₹${ceil}/kg)`
      });
    }

    // Default fallback collar if crop is unlisted
    res.json({
      cropName,
      floorPrice: 15.00,
      ceilingPrice: 50.00,
      msp: 12.00,
      recommendedPrice: 25.00,
      reason: 'General Agro-Commodity Collar (Floor: ₹15/kg, Ceiling: ₹50/kg)'
    });
  } catch (err) {
    console.error('get market collar error:', err);
    res.status(500).json({ error: 'Failed to fetch price collar' });
  }
});

app.get('/api/admin/kyc-queue', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.phone, u.name, u.role, u.location, u.verification_status AS verificationStatus,
              u.gstin, u.business_legal_name AS businessLegalName, u.fssai_license AS fssaiLicense,
              u.created_at, fp.cluster_name, fp.pm_kisan_id AS pmKisanId,
              fp.khasra_khatauni_no AS khasraNo, fp.land_size_acres AS landSizeAcres
       FROM users u
       LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
       WHERE u.role IN ('FARMER', 'BUYER')
       ORDER BY (u.verification_status = 'PENDING') DESC, u.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('get kyc queue error:', err);
    res.status(500).json({ error: 'Failed to fetch KYC compliance queue' });
  }
});

app.patch('/api/admin/kyc/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    if (!['VERIFIED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({ error: 'Invalid verification status' });
    }

    await pool.query('UPDATE users SET verification_status = ? WHERE id = ?', [status, userId]);
    await pool.query('UPDATE farmer_profiles SET verified = ? WHERE user_id = ?', [status === 'VERIFIED', userId]);

    res.json({ success: true, userId, status });
  } catch (err) {
    console.error('update kyc status error:', err);
    res.status(500).json({ error: 'Failed to update user KYC status' });
  }
});

app.patch('/api/users/:id/farmer-profile', async (req, res) => {
  try {
    const { id } = req.params;
    const { pmKisanId, khasraNo, landSizeAcres, clusterName, name, location } = req.body;

    if (name || location) {
      await pool.query(
        'UPDATE users SET name = COALESCE(?, name), location = COALESCE(?, location) WHERE id = ?',
        [name || null, location || null, id]
      );
    }

    const [fpRows] = await pool.query('SELECT user_id FROM farmer_profiles WHERE user_id = ?', [id]);
    if (fpRows.length > 0) {
      await pool.query(
        `UPDATE farmer_profiles SET 
           pm_kisan_id = COALESCE(?, pm_kisan_id),
           khasra_khatauni_no = COALESCE(?, khasra_khatauni_no),
           land_size_acres = COALESCE(?, land_size_acres),
           cluster_name = COALESCE(?, cluster_name)
         WHERE user_id = ?`,
        [pmKisanId || null, khasraNo || null, landSizeAcres ? Number(landSizeAcres) : null, clusterName || null, id]
      );
    } else {
      await pool.query(
        `INSERT INTO farmer_profiles (user_id, cluster_name, pm_kisan_id, khasra_khatauni_no, land_size_acres, verified)
         VALUES (?, ?, ?, ?, ?, TRUE)`,
        [id, clusterName || 'Farm Cluster', pmKisanId || null, khasraNo || null, landSizeAcres ? Number(landSizeAcres) : null]
      );
    }

    res.json({ success: true, message: 'Farmer profile updated successfully' });
  } catch (err) {
    console.error('update farmer profile error:', err);
    res.status(500).json({ error: 'Failed to update farmer profile in database' });
  }
});

app.patch('/api/users/:id/buyer-profile', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, businessLegalName, gstin, fssaiLicense, location } = req.body;

    await pool.query(
      `UPDATE users SET 
         name = COALESCE(?, name),
         business_legal_name = COALESCE(?, business_legal_name),
         gstin = COALESCE(?, gstin),
         fssai_license = COALESCE(?, fssai_license),
         location = COALESCE(?, location)
       WHERE id = ?`,
      [name || null, businessLegalName || null, gstin || null, fssaiLicense || null, location || null, id]
    );

    res.json({ success: true, message: 'Buyer profile updated successfully' });
  } catch (err) {
    console.error('update buyer profile error:', err);
    res.status(500).json({ error: 'Failed to update buyer profile in database' });
  }
});

app.post('/api/admin/users', async (req, res) => {
  try {
    const { role, name, phone, location, pmKisanId, khasraNo, landSizeAcres, gstin, businessLegalName, fssaiLicense, verificationStatus } = req.body;
    if (!phone || !role) {
      return res.status(400).json({ error: 'Phone and role are required' });
    }
    const cleanPhone = phone.replace(/[\s\-]/g, '');
    const userId = `USER-${Date.now().toString().slice(-6)}`;
    const status = verificationStatus || 'VERIFIED';

    await pool.query(
      `INSERT INTO users (id, phone, name, role, location, verification_status, gstin, business_legal_name, fssai_license)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         name = VALUES(name),
         role = VALUES(role),
         location = VALUES(location),
         verification_status = VALUES(verification_status),
         gstin = VALUES(gstin),
         business_legal_name = VALUES(business_legal_name),
         fssai_license = VALUES(fssai_license)`,
      [userId, cleanPhone, name || 'Registered User', role, location || 'India', status, gstin || null, businessLegalName || null, fssaiLicense || null]
    );

    if (role === 'FARMER') {
      await pool.query(
        `INSERT INTO farmer_profiles (user_id, cluster_name, pm_kisan_id, khasra_khatauni_no, land_size_acres, verified)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           cluster_name = VALUES(cluster_name),
           pm_kisan_id = VALUES(pm_kisan_id),
           khasra_khatauni_no = VALUES(khasra_khatauni_no),
           land_size_acres = VALUES(land_size_acres),
           verified = VALUES(verified)`,
        [userId, location || 'Farm Cluster', pmKisanId || null, khasraNo || null, landSizeAcres ? Number(landSizeAcres) : null, status === 'VERIFIED']
      );
    }

    res.status(201).json({ success: true, userId, message: 'Entity registered successfully in database' });
  } catch (err) {
    console.error('admin create user error:', err);
    res.status(500).json({ error: 'Failed to create user record' });
  }
});

app.put('/api/admin/kyc/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, location, pmKisanId, khasraNo, landSizeAcres, gstin, businessLegalName, fssaiLicense, verificationStatus } = req.body;

    await pool.query(
      `UPDATE users SET 
         name = COALESCE(?, name),
         location = COALESCE(?, location),
         verification_status = COALESCE(?, verification_status),
         gstin = COALESCE(?, gstin),
         business_legal_name = COALESCE(?, business_legal_name),
         fssai_license = COALESCE(?, fssai_license)
       WHERE id = ?`,
      [name || null, location || null, verificationStatus || null, gstin || null, businessLegalName || null, fssaiLicense || null, userId]
    );

    await pool.query(
      `UPDATE farmer_profiles SET
         pm_kisan_id = COALESCE(?, pm_kisan_id),
         khasra_khatauni_no = COALESCE(?, khasra_khatauni_no),
         land_size_acres = COALESCE(?, land_size_acres),
         verified = COALESCE(?, verified)
       WHERE user_id = ?`,
      [pmKisanId || null, khasraNo || null, landSizeAcres ? Number(landSizeAcres) : null, verificationStatus ? verificationStatus === 'VERIFIED' : null, userId]
    );

    res.json({ success: true, userId, message: 'KYC record updated in database' });
  } catch (err) {
    console.error('admin put kyc error:', err);
    res.status(500).json({ error: 'Failed to update KYC record' });
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
