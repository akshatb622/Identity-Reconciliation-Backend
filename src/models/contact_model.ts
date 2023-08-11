import { pool } from '../db/index';

export async function createContactModel() {
    try {
        const client = await pool.connect();
        // Create tables and schema using SQL queries
        const createTableQuery = `
        CREATE TABLE IF NOT EXISTS Contact (
          id SERIAL PRIMARY KEY,
          phoneNumber VARCHAR(20),
          email VARCHAR(100),
          linkedId INTEGER,
          linkPrecedence VARCHAR(10) NOT NULL,
          createdAt TIMESTAMP NOT NULL,
          updatedAt TIMESTAMP NOT NULL,
          deletedAt TIMESTAMP
        );`;

        await client.query(createTableQuery);
        client.release();
        console.log('Contact model creation successful');
    } catch (error) {
        console.error('Error creating contact model:', error);
    }
};