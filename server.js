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

  if (!id || !name || price == null || !categoryId) {
    return res.status(400).json({
      error: "id, name, price, categoryId are required",
    });
  }

  const safeImages = Array.isArray(images) ? images : [];

  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query(
      "INSERT INTO products (id, name, price, brand, category_id, description) VALUES (?, ?, ?, ?, ?, ?)",
      [id, name, price, brand || null, categoryId, description || null],
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
