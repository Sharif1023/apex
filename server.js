import express from "express";
import mysql from "mysql2";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// 1) Create Connection to XAMPP MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",     // Default XAMPP user
  password: "",     // Default XAMPP password is empty
  database: "apex_plus",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to XAMPP MySQL Database: apex_plus");
});

// 2) API Routes

// Get all categories
app.get("/api/categories", (req, res) => {
  db.query("SELECT * FROM categories", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add new category
app.post("/api/categories", (req, res) => {
  const { id, name } = req.body;

  if (!id || !name) {
    return res.status(400).json({ error: "id and name are required" });
  }

  db.query(
    "INSERT INTO categories (id, name) VALUES (?, ?)",
    [id, name],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Category added successfully" });
    }
  );
});

// Get all products (with their images)
app.get("/api/products", (req, res) => {
  const query = `
    SELECT p.*, GROUP_CONCAT(pi.image_url) as imageUrls
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id
    GROUP BY p.id
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const formatted = results.map((p) => ({
      ...p,
      // Normalize SQL column to JS-friendly key used by the frontend
      categoryId: p.category_id,
      images: p.imageUrls ? String(p.imageUrls).split(",") : [],
      // Mock variants for now as we transition
      variants: [
        { id: "v1", size: "40", color: "Default", stock: 10, sku: "SKU-" + p.id },
      ],
    }));

    res.json(formatted);
  });
});

// Add new product
app.post("/api/products", (req, res) => {
  const { id, name, price, brand, categoryId, description, images } = req.body;

  const normalizedCategory = categoryId ? String(categoryId).toLowerCase().trim() : null;

  if (!id || !name || price == null || !normalizedCategory) {
    return res.status(400).json({
      error: "id, name, price, categoryId are required",
    });
  }

  const safeImages = Array.isArray(images) ? images : [];

  // Verify category exists before attempting insert
  db.query("SELECT id FROM categories WHERE id = ?", [normalizedCategory], (err, catResults) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!catResults || (Array.isArray(catResults) && catResults.length === 0)) {
      return res.status(400).json({ error: "Category does not exist" });
    }

    db.beginTransaction((err) => {
      if (err) return res.status(500).json({ error: err.message });

      db.query(
        "INSERT INTO products (id, name, price, brand, category_id, description) VALUES (?, ?, ?, ?, ?, ?)",
        [id, name, price, brand || null, normalizedCategory, description || null],
        (err) => {
          if (err) {
            return db.rollback(() => res.status(500).json({ error: err.message }));
          }

          // Insert images
          if (safeImages.length > 0) {
            const imageValues = safeImages.map((url) => [id, url]);

            db.query(
              "INSERT INTO product_images (product_id, image_url) VALUES ?",
              [imageValues],
              (err) => {
                if (err) {
                  return db.rollback(() =>
                    res.status(500).json({ error: err.message })
                  );
                }

                db.commit((err) => {
                  if (err) {
                    return db.rollback(() =>
                      res.status(500).json({ error: err.message })
                    );
                  }
                  res.json({ message: "Product launched!" });
                });
              }
            );
          } else {
            db.commit((err) => {
              if (err) {
                return db.rollback(() =>
                  res.status(500).json({ error: err.message })
                );
              }
              res.json({ message: "Product launched!" });
            });
          }
        }
      );
    });
  });
});

// Orders API - list orders with items
app.get('/api/orders', (req, res) => {
  db.query('SELECT * FROM orders ORDER BY created_at DESC', (err, orders) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!orders || orders.length === 0) return res.json([]);
    const orderIds = orders.map(o => o.id);

    db.query(
      'SELECT oi.*, p.name as product_name, p.brand as product_brand FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id IN (?)',
      [orderIds],
      (err, items) => {
        if (err) return res.status(500).json({ error: err.message });

        const formatted = orders.map(o => {
          const its = (items || []).filter(i => i.order_id === o.id).map(i => ({
            id: i.id,
            productId: i.product_id,
            variantId: i.variant_id,
            quantity: i.quantity,
            priceAtPurchase: i.price_at_purchase,
            productName: i.product_name,
            productBrand: i.product_brand
          }));

          return {
            id: o.id,
            customerName: o.customer_name,
            email: o.email,
            phone: o.phone,
            address: o.address,
            city: o.city,
            totalAmount: o.total_amount,
            status: o.status,
            paymentMethod: o.payment_method,
            paymentStatus: o.payment_status,
            createdAt: o.created_at,
            items: its
          };
        });

        res.json(formatted);
      }
    );
  });
});

// Create new order (transactional)
app.post('/api/orders', (req, res) => {
  const { id, customerName, email, phone, address, city, items, totalAmount, paymentMethod } = req.body;
  if (!customerName || !phone || !address || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Missing required order fields' });
  }

  const orderId = id || `#APX-${Math.floor(1000 + Math.random() * 8999)}`;
  const payment_status = paymentMethod === 'COD' ? 'Unpaid' : 'Paid';

  db.beginTransaction(err => {
    if (err) return res.status(500).json({ error: err.message });

    db.query(
      'INSERT INTO orders (id, customer_name, email, phone, address, city, total_amount, payment_method, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [orderId, customerName, email || null, phone, address, city || null, totalAmount, paymentMethod || 'COD', payment_status],
      (err) => {
        if (err) return db.rollback(() => res.status(500).json({ error: err.message }));

        const values = items.map((it) => [orderId, it.productId, it.variantId || null, it.quantity, it.priceAtPurchase]);
        db.query('INSERT INTO order_items (order_id, product_id, variant_id, quantity, price_at_purchase) VALUES ?', [values], (err) => {
          if (err) return db.rollback(() => res.status(500).json({ error: err.message }));

          db.commit(err => {
            if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
            res.json({ message: 'Order placed', id: orderId });
          });
        });
      }
    );
  });
});

// Update order status
app.put('/api/orders/:id/status', (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'status is required' });

  db.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Order status updated' });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
