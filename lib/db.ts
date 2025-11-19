import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);
export { sql };

export async function initializeDatabase() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        avatar TEXT,
        github_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create games table
    await sql`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        slug VARCHAR(255) UNIQUE NOT NULL,
        blob_url TEXT NOT NULL,
        thumbnail_url TEXT,
        views INTEGER DEFAULT 0,
        plays INTEGER DEFAULT 0,
        is_published BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create index on slug for faster lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_games_slug ON games(slug)
    `;

    // Create index on user_id for faster user game queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_games_user_id ON games(user_id)
    `;

    console.log("Database initialized successfully");
    return { success: true };
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

export async function getUser(email: string) {
  const result = await sql`
    SELECT * FROM users WHERE email = ${email}
  `;
  return result.rows[0];
}

export async function getUserGames(userId: number) {
  const result = await sql`
    SELECT * FROM games
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
  return result.rows;
}

export async function getGame(slug: string) {
  const result = await sql`
    SELECT g.*, u.name as author_name, u.avatar as author_avatar
    FROM games g
    JOIN users u ON g.user_id = u.id
    WHERE g.slug = ${slug} AND g.is_published = true
  `;
  return result.rows[0];
}

export async function getAllGames(limit = 50) {
  const result = await sql`
    SELECT g.*, u.name as author_name, u.avatar as author_avatar
    FROM games g
    JOIN users u ON g.user_id = u.id
    WHERE g.is_published = true
    ORDER BY g.created_at DESC
    LIMIT ${limit}
  `;
  return result.rows;
}

export async function incrementGameViews(slug: string) {
  await sql`
    UPDATE games
    SET views = views + 1
    WHERE slug = ${slug}
  `;
}

export async function incrementGamePlays(slug: string) {
  await sql`
    UPDATE games
    SET plays = plays + 1
    WHERE slug = ${slug}
  `;
}
