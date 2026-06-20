import { ResultSetHeader } from 'mysql2';
import { query, transaction } from '../../config/db';
import { AppError } from '../../utils/AppError';
import { logger } from '../../utils/logger';
import { getPaginationParams, paginate } from '../../utils/pagination';
import { ProductRow, ProductImageRow, ProductSpecRow } from '../../types';
import { CreateProductInput, UpdateProductInput } from './products.schema';

export const createProduct = async (sellerId: number, input: CreateProductInput) => {
  const profiles = await query<{ id: number }[]>(
    'SELECT id FROM seller_profiles WHERE user_id = ?',
    [sellerId]
  );

  if (profiles.length === 0) {
    throw new AppError(403, 'Perfil de vendedor no encontrado', 'SELLER_PROFILE_REQUIRED');
  }

  const sellerProfileId = profiles[0].id;

  const productId = await transaction<number>(async (conn) => {
    const [result] = await conn.execute<ResultSetHeader>(
      `INSERT INTO products
       (seller_id, category_id, name, description, sku, price, stock, min_order_qty, unit, weight_kg, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sellerProfileId,
        input.categoryid,
        input.name,
        input.description ?? null,
        input.sku ?? null,
        input.price,
        input.stock,
        input.min_order_qty ?? 1,
        input.unit ?? null,
        input.weight_kg ?? null,
        input.status ?? 'draft',
      ]
    );

    const newProductId = result.insertId;

    if (input.specs?.length) {
      for (let i = 0; i < input.specs.length; i++) {
        const spec = input.specs[i];
        await conn.execute(
          `INSERT INTO product_specs
           (product_id, spec_key, spec_value, spec_type, display_order)
           VALUES (?, ?, ?, ?, ?)`,
          [newProductId, spec.spec_key, spec.spec_value, spec.spec_type ?? 'text', i]
        );
      }
    }

   if (input.images?.length) {
  const hasPrimary = input.images.some((img) => !!img.is_primary);

  for (let i = 0; i < input.images.length; i++) {
    const img = input.images[i];
    const isPrimary = hasPrimary ? (img.is_primary ? 1 : 0) : i === 0 ? 1 : 0;

    await conn.execute(
      `INSERT INTO product_images
       (product_id, image_url, alt_text, source, is_primary, display_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        newProductId,
        img.image_url ?? null,
        img.alt_text ?? null,
        img.source,
        isPrimary,
        i,
      ]
    );
  }
}

    logger.info('Products', 'Producto creado', { productId: newProductId, sellerId });
    return newProductId;
  });

  return getProductById(productId);
};

export const getProductById = async (productId: number) => {
  const products = await query<(ProductRow & { category_name: string; category_slug: string; seller_name: string })[]>(
    `SELECT
       p.*,
       c.name AS category_name,
       c.slug AS category_slug,
       sp.business_name AS seller_name
     FROM products p
     JOIN categories c ON c.id = p.category_id
     JOIN seller_profiles sp ON sp.id = p.seller_id
     WHERE p.id = ? AND p.deleted_at IS NULL`,
    [productId]
  );

  if (products.length === 0) {
    throw new AppError(404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND');
  }

  const product = products[0];

  const images = await query<ProductImageRow[]>(
    `SELECT *
     FROM product_images
     WHERE product_id = ?
     ORDER BY display_order ASC`,
    [productId]
  );

  const specs = await query<ProductSpecRow[]>(
    `SELECT *
     FROM product_specs
     WHERE product_id = ?
     ORDER BY display_order ASC`,
    [productId]
  );

  return { ...product, images, specs };
};

export const listProducts = async (filters: {
  page?: string;
  limit?: string;
  categoryid?: string;
  seller_id?: string;
  search?: string;
  min_price?: string;
  max_price?: string;
  status?: string;
  sort?: string;
}) => {
  const { page, limit, offset } = getPaginationParams(filters);
  const conditions: string[] = ['p.deleted_at IS NULL'];
  const params: unknown[] = [];

  if (filters.categoryid) {
    conditions.push('p.category_id = ?');
    params.push(parseInt(filters.categoryid, 10));
  }

  if (filters.seller_id) {
    conditions.push('p.seller_id = ?');
    params.push(parseInt(filters.seller_id, 10));
  }

  if (filters.search) {
    conditions.push('(p.name LIKE ? OR p.description LIKE ?)');
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  if (filters.min_price) {
    conditions.push('p.price >= ?');
    params.push(parseFloat(filters.min_price));
  }

  if (filters.max_price) {
    conditions.push('p.price <= ?');
    params.push(parseFloat(filters.max_price));
  }

  // if (filters.status) {
  //   conditions.push('p.status = ?');
  //   params.push(filters.status);
  // } else {
  //   conditions.push("p.status IN ('active')");
  // }

  const where = `WHERE ${conditions.join(' AND ')}`;

  let orderBy = 'p.created_at DESC';
  if (filters.sort === 'price_asc') orderBy = 'p.price ASC';
  else if (filters.sort === 'price_desc') orderBy = 'p.price DESC';
  else if (filters.sort === 'name_asc') orderBy = 'p.name ASC';
  else if (filters.sort === 'rating') orderBy = 'p.rating_avg DESC';
  else if (filters.sort === 'newest') orderBy = 'p.created_at DESC';

  const countResult = await query<{ total: number }[]>(
    `SELECT COUNT(*) AS total
     FROM products p
     ${where}`,
    params
  );

  const total = countResult[0].total;

  const products = await query<(ProductRow & { category_name: string; seller_name: string })[]>(
    `SELECT
       p.*,
       c.name AS category_name,
       sp.business_name AS seller_name
     FROM products p
     JOIN categories c ON c.id = p.category_id
     JOIN seller_profiles sp ON sp.id = p.seller_id
     ${where}
     ORDER BY ${orderBy}
     LIMIT ${limit} OFFSET ${offset}`,
    params
  );

  const productIds = products.map((p) => p.id);

  let primaryImages: ProductImageRow[] = [];
  if (productIds.length > 0) {
    primaryImages = await query<ProductImageRow[]>(
      `SELECT *
       FROM product_images
       WHERE product_id IN (${productIds.map(() => '?').join(',')})
         AND is_primary = 1`,
      productIds
    );
  }

  const imageMap = new Map<number, ProductImageRow>();
  for (const img of primaryImages) {
    if (!imageMap.has(img.product_id)) {
      imageMap.set(img.product_id, img);
    }
  }

  const data = products.map((p) => ({
    ...p,
    primary_image: imageMap.get(p.id) ?? null,
  }));

  return paginate(data, total, page, limit);
};

export const listMyProducts = async (
  userId: number,
  filters: {
    page?: string;
    limit?: string;
    status?: string;
    search?: string;
  }
) => {
  const { page, limit, offset } = getPaginationParams(filters);
  const conditions: string[] = [
    'p.deleted_at IS NULL',
    'sp.user_id = ?',   // ← filtra por el vendedor autenticado
  ];
  const params: unknown[] = [userId];

  if (filters.status) {
    conditions.push('p.status = ?');
    params.push(filters.status);
  }

  if (filters.search) {
    conditions.push('(p.name LIKE ? OR p.description LIKE ?)');
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const countResult = await query<{ total: number }[]>(
    `SELECT COUNT(*) AS total
     FROM products p
     JOIN seller_profiles sp ON sp.id = p.seller_id
     ${where}`,
    params
  );

  const products = await query<(ProductRow & { category_name: string; seller_name: string })[]>(
    `SELECT p.*, c.name AS category_name, sp.business_name AS seller_name
     FROM products p
     JOIN categories c ON c.id = p.category_id
     JOIN seller_profiles sp ON sp.id = p.seller_id
     ${where}
     ORDER BY p.created_at DESC
     LIMIT ${limit} OFFSET ${offset}`,
    params
  );

  const productIds = products.map((p) => p.id);
  let primaryImages: ProductImageRow[] = [];

  if (productIds.length > 0) {
    primaryImages = await query<ProductImageRow[]>(
      `SELECT * FROM product_images
       WHERE product_id IN (${productIds.map(() => '?').join(',')}) AND is_primary = 1`,
      productIds
    );
  }

  const imageMap = new Map<number, ProductImageRow>();
  for (const img of primaryImages) {
    if (!imageMap.has(img.product_id)) imageMap.set(img.product_id, img);
  }

  const data = products.map((p) => ({
    ...p,
    primary_image: imageMap.get(p.id) ?? null,
  }));

  return paginate(data, countResult[0].total, page, limit);
};

export const updateProduct = async (productId: number, userId: number, input: UpdateProductInput) => {
  await verifyProductOwner(productId, userId);

  const allowedFields = [
    'categoryid',
    'name',
    'description',
    'sku',
    'price',
    'stock',
    'min_order_qty',
    'unit',
    'weight_kg',
    'status',
  ];

  const sets: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(input)) {
    if (allowedFields.includes(key) && value !== undefined) {
      const dbKey = key === 'categoryid' ? 'category_id' : key;
      sets.push(`${dbKey} = ?`);
      values.push(value);
    }
  }

  if (sets.length > 0) {
    await query(
      `UPDATE products
       SET ${sets.join(', ')}
       WHERE id = ?`,
      [...values, productId]
    );
  }

  if (input.specs) {
    await query('DELETE FROM product_specs WHERE product_id = ?', [productId]);

    for (let i = 0; i < input.specs.length; i++) {
      const spec = input.specs[i];
      await query(
        `INSERT INTO product_specs
         (product_id, spec_key, spec_value, spec_type, display_order)
         VALUES (?, ?, ?, ?, ?)`,
        [productId, spec.spec_key, spec.spec_value, spec.spec_type ?? 'text', i]
      );
    }
  }

  logger.info('Products', 'Producto actualizado', { productId });
  return getProductById(productId);
};

export const deleteProduct = async (productId: number, userId: number) => {
  await verifyProductOwner(productId, userId);

  await query(
    `UPDATE products
     SET status = 'deleted', deleted_at = NOW()
     WHERE id = ?`,
    [productId]
  );

  logger.info('Products', 'Producto eliminado', { productId });
  return { message: 'Producto eliminado exitosamente' };
};

export const addProductImage = async (
  productId: number,
  userId: number,
  file?: Express.Multer.File,
  imageUrl?: string
) => {
  await verifyProductOwner(productId, userId);

  const existingImages = await query<{ total: number }[]>(
    `SELECT COUNT(*) AS total
     FROM product_images
     WHERE product_id = ? AND image_url IS NOT NULL AND image_url <> ''`,
    [productId]
  );

  const isPrimary = existingImages[0].total === 0 ? 1 : 0;
  const displayOrder = existingImages[0].total;

  if (file) {
    await query(
      `INSERT INTO product_images
       (product_id, file_path, image_url, source, alt_text, is_primary, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [productId, file.filename, `/uploads/${file.filename}`, 'upload', file.originalname, isPrimary, displayOrder]
    );
  } else if (imageUrl && imageUrl.trim() !== '') {
    await query(
      `INSERT INTO product_images
       (product_id, image_url, source, is_primary, display_order)
       VALUES (?, ?, ?, ?, ?)`,
      [productId, imageUrl.trim(), 'url', isPrimary, displayOrder]
    );
  } else {
    throw new AppError(400, 'Debe proporcionar un archivo o una URL', 'IMAGE_REQUIRED');
  }

  return getProductById(productId);
};

const verifyProductOwner = async (productId: number, userId: number) => {
  const products = await query<(ProductRow & { sp_user_id: number })[]>(
    `SELECT
       p.*,
       sp.user_id AS sp_user_id
     FROM products p
     JOIN seller_profiles sp ON sp.id = p.seller_id
     WHERE p.id = ? AND p.deleted_at IS NULL`,
    [productId]
  );

  if (products.length === 0) {
    throw new AppError(404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND');
  }

  if (products[0].sp_user_id !== userId) {
    throw new AppError(403, 'No eres el dueño de este producto', 'NOT_PRODUCT_OWNER');
  }

  return products[0];
};