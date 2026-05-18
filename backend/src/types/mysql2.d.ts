import { RowDataPacket, ResultSetHeader } from 'mysql2';

declare module 'mysql2' {
  interface RowDataPacket {
    [column: string]: unknown;
  }
}

export type { RowDataPacket, ResultSetHeader };
