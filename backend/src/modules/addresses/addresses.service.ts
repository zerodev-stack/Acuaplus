import { query, transaction } from '../../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { CreateAddressInput } from './addresses.schema';

interface AddressRow extends RowDataPacket {
  id: number;
  user_id: number;
  recipient_name: string;
  address_line: string;
  city: string;
  department: string;
  zip_code: string | null;
  is_default: number;
  created_at: Date;
}

export const getAddresses = async (userId: number) => {
  const rows = await query<AddressRow>(
    `SELECT id, user_id, recipient_name, address_line, city,
            department, zip_code, is_default, created_at
     FROM addresses WHERE user_id = ?
     ORDER BY is_default DESC, created_at DESC`,
    [userId]
  );
  return rows;
};

export const createAddress = async (userId: number, input: CreateAddressInput) => {
  const recipientName = input.recipient_name;
  const addressLine   = input.address_line;
  const city          = input.city;
  const department    = input.department;
  const zipCode       = input.zip_code ?? null;
  const isDefault     = input.is_default === true ? 1 : 0;

  return transaction(async (conn) => {
    if (isDefault) {
      await conn.execute(
        `UPDATE addresses SET is_default = 0 WHERE user_id = ?`,
        [userId]
      );
    }

    const [result] = await conn.execute<ResultSetHeader>(
      `INSERT INTO addresses (user_id, recipient_name, address_line, city, department, zip_code, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, recipientName, addressLine, city, department, zipCode, isDefault]
    );

    return {
      id:             result.insertId,
      user_id:        userId,
      recipient_name: recipientName,
      address_line:   addressLine,
      city,
      department,
      zip_code:       zipCode,
      is_default:     isDefault,
    };
  });
};