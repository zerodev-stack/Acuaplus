import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno del archivo .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const createTables = async () => {
  console.log('Conectando a la base de datos...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log('Conectado a la base de datos:', process.env.DB_NAME);

  // Lista de queries para crear todas las tablas necesarias
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('buyer', 'seller', 'admin') DEFAULT 'buyer',
      status ENUM('pending', 'active', 'suspended') DEFAULT 'active',
      phone VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS seller_profiles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      business_name VARCHAR(255) NOT NULL,
      nit VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token_hash VARCHAR(255) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      parent_id INT,
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      seller_id INT NOT NULL,
      category_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      sku VARCHAR(100),
      price DECIMAL(10,2) NOT NULL,
      stock INT DEFAULT 0,
      min_order_qty INT DEFAULT 1,
      unit VARCHAR(50),
      weight_kg DECIMAL(10,3),
      status ENUM('active', 'inactive', 'draft') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
    )`,
    `CREATE TABLE IF NOT EXISTS product_specs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      spec_key VARCHAR(255) NOT NULL,
      spec_value TEXT NOT NULL,
      spec_type VARCHAR(50),
      display_order INT DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS product_images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      file_path VARCHAR(500),
      image_url VARCHAR(500) NOT NULL,
      source VARCHAR(50),
      alt_text VARCHAR(255),
      is_primary BOOLEAN DEFAULT FALSE,
      display_order INT DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS cart (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS cart_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cart_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      unit_price_snapshot DECIMAL(10,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS addresses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      address_line1 VARCHAR(255) NOT NULL,
      address_line2 VARCHAR(255),
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      zip_code VARCHAR(50),
      country VARCHAR(100) NOT NULL,
      is_default BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      buyer_id INT NOT NULL,
      address_id INT,
      shipping_address TEXT,
      payment_method ENUM('card', 'transfer', 'cash', 'pse') NOT NULL,
      subtotal_amount DECIMAL(10,2) NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      status ENUM('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS seller_orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      seller_id INT NOT NULL,
      subtotal DECIMAL(10,2) NOT NULL,
      status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      seller_order_id INT NOT NULL,
      product_id INT NOT NULL,
      seller_id INT NOT NULL,
      quantity INT NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      subtotal DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (seller_order_id) REFERENCES seller_orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
      FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE RESTRICT
    )`,
    `CREATE TABLE IF NOT EXISTS order_shipments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      seller_order_id INT NOT NULL,
      status VARCHAR(100) NOT NULL,
      tracking_number VARCHAR(100),
      carrier VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (seller_order_id) REFERENCES seller_orders(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS saved_cards (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      sim_token VARCHAR(255) NOT NULL,
      last_four VARCHAR(4) NOT NULL,
      brand VARCHAR(50) NOT NULL,
      cardholder_name VARCHAR(255) NOT NULL,
      exp_month VARCHAR(2) NOT NULL,
      exp_year VARCHAR(4) NOT NULL,
      is_default BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS card_sim_vault (
      id INT AUTO_INCREMENT PRIMARY KEY,
      saved_card_id INT NOT NULL,
      pan_encrypted VARCHAR(500) NOT NULL,
      cvv_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (saved_card_id) REFERENCES saved_cards(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS payment_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      card_id INT,
      gateway VARCHAR(100) NOT NULL,
      gateway_tx_id VARCHAR(255),
      amount DECIMAL(10,2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'COP',
      status ENUM('pending', 'approved', 'declined', 'refunded', 'failed') DEFAULT 'pending',
      is_simulation BOOLEAN DEFAULT FALSE,
      gateway_response TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (card_id) REFERENCES saved_cards(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      buyer_id INT NOT NULL,
      order_id INT,
      rating INT NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      is_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      type VARCHAR(100) NOT NULL,
      title VARCHAR(255) NOT NULL,
      body TEXT NOT NULL,
      reference_id INT,
      reference_type VARCHAR(100),
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  ];

  for (const q of queries) {
    try {
      await connection.query(q);
      console.log('Query ejecutada con éxito (tabla creada o ya existía).');
    } catch (e: any) {
      console.error('Error ejecutando query:', e.message);
    }
  }

  // Insertar categorías por defecto si están vacías
  try {
    const [rows]: any = await connection.query('SELECT COUNT(*) as count FROM categories');
    if (rows[0].count === 0) {
      await connection.query(`
        INSERT INTO categories (name, description) VALUES
        ('Peces de Agua Dulce', 'Peces tropicales y de agua fría para acuarios de agua dulce.'),
        ('Peces Marinos', 'Peces de arrecife y marinos para acuarios de agua salada.'),
        ('Acuarios y Peceras', 'Tanques de diferentes tamaños y formas.'),
        ('Filtros y Bombas', 'Sistemas de filtración y bombas de agua/aire.'),
        ('Alimentos', 'Comida en hojuelas, pellets y alimento vivo.')
      `);
      console.log('Categorías iniciales creadas.');
    }
  } catch (e: any) {
    console.error('Error insertando categorías:', e.message);
  }

  console.log('Proceso de inicialización de BD terminado.');
  await connection.end();
  process.exit(0);
};

createTables();
