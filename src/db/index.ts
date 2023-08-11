import { Pool } from 'pg';

export const pool = new Pool({
    user: process.env.DATABASE_USER,
    host: process.env.HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.PASSWORD,
    port: parseInt(String(process.env.DATABASE_PORT), 10),
})

export async function connectToDatabase(){
    pool.connect(function(err) {
        if (err) throw new Error(`Connection to the database failed!: ${err}`);
        else console.log("Connected to the database successfully!");
    });
}