require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();

app.use(cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:5500"]
}));

app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(function (error) {
    if (error) {
        console.error("MySQL connection failed:");
        console.error(error);
        return;
    }

    console.log("Connected to MySQL!");
});

app.get("/api/services", function (req, res) {
    res.json([
        {
            name: "Lawn Maintenance",
            price: 50
        },
        {
            name: "Garden Care",
            price: 60
        }
    ]);
});

app.get("/api/quotes", function (req, res) {

    const sql = "SELECT * FROM quotes ORDER BY created_at DESC";

    db.query(sql, function (error, results) {

        if (error) {
            console.error(error);

            res.status(500).json({
                message: "Database error"
            });

            return;
        }

        res.json(results);
    });

});

app.post("/api/quotes", function (req, res) {

    const quote = req.body;

    const sql = `
        INSERT INTO quotes
        (name, email, phone, service)
        VALUES (?, ?, ?, ?)
    `;

    const values = [
        quote.name,
        quote.email,
        quote.phone,
        quote.service
    ];

    db.query(sql, values, function (error, result) {

        if (error) {
            console.error(error);

            res.status(500).json({
                message: "Database error"
            });

            return;
        }

        console.log("Quote saved!");
        console.log(result);

        res.json({
            message: "Quote saved successfully!",
            id: result.insertId
        });

    });

});

// Phone lookup only returns the fields customers need.
app.get("/api/quotes/lookup", function (req, res) {
    const phone = String(req.query.phone || "").replace(/[^0-9]/g, "");
    if (phone.length < 7 || phone.length > 15) {
        return res.status(400).json({ message: "Enter a valid phone number." });
    }
    const sql = `SELECT id, service, status, amount, created_at FROM quotes
        WHERE REGEXP_REPLACE(phone, '[^0-9]', '') = ? ORDER BY created_at DESC, id DESC`;
    db.query(sql, [phone], function (error, results) {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: "Database error" });
        }
        res.json(results);
    });
});

app.patch("/api/quotes/:id", function (req, res) {
    const { service, amount } = req.body;
    const services = ["lawn-maintenance", "hedge-trimming", "seasonal-cleanup", "garden-care"];
    if (!services.includes(service)) {
        return res.status(400).json({ message: "Choose a valid service." });
    }
    const hasAmount = amount !== undefined;
    if (hasAmount && (typeof amount !== "string" && typeof amount !== "number" ||
        !/^(0|[1-9]\d{0,7})(\.\d{1,2})?$/.test(String(amount)))) {
        return res.status(400).json({ message: "Enter a non-negative amount with at most two decimal places." });
    }
    // Amount and completed status are saved together in one database update.
    const sql = hasAmount
        ? "UPDATE quotes SET service = ?, amount = ?, status = 'completed' WHERE id = ?"
        : "UPDATE quotes SET status = IF(service = ?, status, 'pending'), amount = IF(service = ?, amount, NULL), service = ? WHERE id = ?";
    const values = hasAmount ? [service, amount, req.params.id] : [service, service, service, req.params.id];
    db.query(sql, values, function (error) {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: "Database error" });
        }
        db.query("SELECT * FROM quotes WHERE id = ?", [req.params.id], function (error, rows) {
            if (error) return res.status(500).json({ message: "Database error" });
            if (!rows.length) return res.status(404).json({ message: "Quote not found" });
            res.json(rows[0]);
        });
    });
});
app.delete("/api/quotes/:id", function (req, res) {
    const id = req.params.id;
    const sql = "DELETE FROM quotes WHERE id = ?";

    db.query(sql, [id], function (error, result) {
        if (error) {
            console.error(error);
            return res.status(500).json({
                message: "Database error"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Quote not found"
            });
        }

        res.json({
            message: "Quote deleted successfully!"
        });
    });
});
// Add missing quote fields before accepting requests; existing rows become pending.
db.query("SHOW COLUMNS FROM quotes", function (error, columns) {
    if (error) { console.error(error); process.exitCode = 1; db.end(); return; }
    const names = columns.map(column => column.Field);
    const changes = [];
    if (!names.includes("amount")) changes.push("ADD COLUMN amount DECIMAL(10,2) NULL");
    if (!names.includes("status")) changes.push("ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending'");
    function start(error) {
        if (error) { console.error(error); process.exitCode = 1; db.end(); return; }
        app.listen(3000, function () {
            console.log("Server running on http://localhost:3000");
        });
    }
    if (changes.length) db.query("ALTER TABLE quotes " + changes.join(", "), start);
    else start();
});
