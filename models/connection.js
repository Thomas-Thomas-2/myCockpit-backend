// Mongodb connection
//  const mongoose = require("mongoose");

// const connectionString = process.env.CONNECTION_STRING;

// mongoose
//   .connect(connectionString, { connectTimeoutMS: 2000 })
//   .then(() => console.log("Database connected"))
//   .catch((error) => console.error(error));

// PostgreSQL / Supabase connection
const { Pool } = require("pg");

const connectionString = process.env.POSTGRES_URL;

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

const testConnection = async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("Connection DB OK");
  } catch (error) {
    console.error("Connection error:", error);
  }
};

testConnection();

module.exports = pool;
