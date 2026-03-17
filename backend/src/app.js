const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express(); // 🔥 MUST be before any routes

app.use(cors());
app.use(express.json());

app.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await pool.query(
      "SELECT * FROM accounts WHERE email = $1",
      [email],
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO accounts (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, passwordHash],
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      message: "Signup successful",
      token,
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error signing up" });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM accounts WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error logging in" });
  }
});

// TEST ROUTE
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

// CREATE USER
app.post("/users", async (req, res) => {
  try {
    const { name, email } = req.body;

    const newUser = await pool.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
      [name, email],
    );

    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating user");
  }
});

// GET ALL USERS
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching users");
  }
});

// GET ONE USER
app.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).send("User not found");
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching user");
  }
});

// UPDATE USER
app.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const result = await pool.query(
      "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *",
      [name, email, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).send("User not found");
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating user");
  }
});

// DELETE USER
app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).send("User not found");
    }

    res.json({ message: "User deleted", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting user");
  }
});

app.post("/workouts", async (req, res) => {
  try {
    const { user_id, workout_type, duration, notes, workout_date } = req.body;

    const result = await pool.query(
      `INSERT INTO workouts (user_id, workout_type, duration, notes, workout_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user_id, workout_type, duration, notes, workout_date],
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating workout");
  }
});

app.get("/workouts/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      "SELECT * FROM workouts WHERE user_id = $1 ORDER BY workout_date DESC",
      [userId],
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching workouts");
  }
});

app.put("/workouts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { workout_type, duration, notes, workout_date } = req.body;

    const result = await pool.query(
      `UPDATE workouts
       SET workout_type = $1, duration = $2, notes = $3, workout_date = $4
       WHERE id = $5
       RETURNING *`,
      [workout_type, duration, notes, workout_date, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Workout not found");
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating workout");
  }
});

app.delete("/workouts/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM workouts WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Workout not found");
    }

    res.json({ message: "Workout deleted", workout: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting workout");
  }
});

// CREATE WEIGHT ENTRY
app.post("/weights", async (req, res) => {
  try {
    const { user_id, weight, entry_date } = req.body;

    const result = await pool.query(
      `INSERT INTO weight_entries (user_id, weight, entry_date)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [user_id, weight, entry_date],
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating weight entry");
  }
});

// GET ALL WEIGHT ENTRIES FOR A USER
app.get("/weights/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      "SELECT * FROM weight_entries WHERE user_id = $1 ORDER BY entry_date DESC",
      [userId],
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching weight entries");
  }
});

// UPDATE WEIGHT ENTRY
app.put("/weights/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { weight, entry_date } = req.body;

    const result = await pool.query(
      `UPDATE weight_entries
       SET weight = $1, entry_date = $2
       WHERE id = $3
       RETURNING *`,
      [weight, entry_date, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Weight entry not found");
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating weight entry");
  }
});

// DELETE WEIGHT ENTRY
app.delete("/weights/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM weight_entries WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Weight entry not found");
    }

    res.json({ message: "Weight entry deleted", entry: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting weight entry");
  }
});

module.exports = app;
