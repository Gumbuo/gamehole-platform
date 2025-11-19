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
        is_admin BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Add is_admin column if it doesn't exist
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_admin') THEN
          ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT false;
        END IF;
      END $$;
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
        category VARCHAR(50) DEFAULT 'Other',
        tags TEXT[] DEFAULT '{}',
        views INTEGER DEFAULT 0,
        plays INTEGER DEFAULT 0,
        rating_sum INTEGER DEFAULT 0,
        rating_count INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT false,
        is_published BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Add columns if they don't exist (migration for existing databases)
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='games' AND column_name='category') THEN
          ALTER TABLE games ADD COLUMN category VARCHAR(50) DEFAULT 'Other';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='games' AND column_name='tags') THEN
          ALTER TABLE games ADD COLUMN tags TEXT[] DEFAULT '{}';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='games' AND column_name='rating_sum') THEN
          ALTER TABLE games ADD COLUMN rating_sum INTEGER DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='games' AND column_name='rating_count') THEN
          ALTER TABLE games ADD COLUMN rating_count INTEGER DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='games' AND column_name='is_featured') THEN
          ALTER TABLE games ADD COLUMN is_featured BOOLEAN DEFAULT false;
        END IF;
      END $$;
    `;

    // Create index on slug for faster lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_games_slug ON games(slug)
    `;

    // Create index on user_id for faster user game queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_games_user_id ON games(user_id)
    `;


    // Create comments table
    await sql`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create index on game_id for faster comment lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_comments_game_id ON comments(game_id)
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
  return result[0];
}

export async function getUserGames(userId: number) {
  const result = await sql`
    SELECT * FROM games
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
  return result;
}

export async function getGame(slug: string) {
  const result = await sql`
    SELECT g.*, u.name as author_name, u.avatar as author_avatar
    FROM games g
    JOIN users u ON g.user_id = u.id
    WHERE g.slug = ${slug} AND g.is_published = true
  `;
  return result[0];
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
  return result;
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

export async function getGamesByCategory(category: string, limit = 50) {
  const result = await sql`
    SELECT g.*, u.name as author_name, u.avatar as author_avatar,
           CASE WHEN g.rating_count > 0 THEN ROUND(g.rating_sum::decimal / g.rating_count, 1) ELSE 0 END as average_rating
    FROM games g
    JOIN users u ON g.user_id = u.id
    WHERE g.is_published = true AND g.category = ${category}
    ORDER BY g.created_at DESC
    LIMIT ${limit}
  `;
  return result;
}

export async function searchGames(query: string, limit = 50) {
  const result = await sql`
    SELECT g.*, u.name as author_name, u.avatar as author_avatar,
           CASE WHEN g.rating_count > 0 THEN ROUND(g.rating_sum::decimal / g.rating_count, 1) ELSE 0 END as average_rating
    FROM games g
    JOIN users u ON g.user_id = u.id
    WHERE g.is_published = true 
    AND (g.title ILIKE ${'%' + query + '%'} OR g.description ILIKE ${'%' + query + '%'})
    ORDER BY g.created_at DESC
    LIMIT ${limit}
  `;
  return result;
}

export async function getFeaturedGames(limit = 6) {
  const result = await sql`
    SELECT g.*, u.name as author_name, u.avatar as author_avatar,
           CASE WHEN g.rating_count > 0 THEN ROUND(g.rating_sum::decimal / g.rating_count, 1) ELSE 0 END as average_rating
    FROM games g
    JOIN users u ON g.user_id = u.id
    WHERE g.is_published = true AND g.is_featured = true
    ORDER BY g.created_at DESC
    LIMIT ${limit}
  `;
  return result;
}

export async function rateGame(slug: string, rating: number) {
  // Rating should be 1-5
  if (rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5');
  
  await sql`
    UPDATE games
    SET rating_sum = rating_sum + ${rating},
        rating_count = rating_count + 1
    WHERE slug = ${slug}
  `;
}

export async function getCategories() {
  return [
    'Action',
    'Adventure',
    'Puzzle',
    'RPG',
    'Strategy',
    'Platformer',
    'Shooter',
    'Racing',
    'Sports',
    'Simulation',
    'Horror',
    'Casual',
    'Other'
  ];
}

export async function getGameComments(gameId: number) {
  const result = await sql`
    SELECT c.*, u.name as user_name, u.avatar as user_avatar
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.game_id = ${gameId}
    ORDER BY c.created_at DESC
  `;
  return result;
}

export async function addComment(gameId: number, userId: number, content: string) {
  const result = await sql`
    INSERT INTO comments (game_id, user_id, content)
    VALUES (${gameId}, ${userId}, ${content})
    RETURNING *
  `;
  return result[0];
}

export async function deleteComment(commentId: number, userId: number) {
  await sql`
    DELETE FROM comments
    WHERE id = ${commentId} AND user_id = ${userId}
  `;
}

export async function isAdmin(email: string): Promise<boolean> {
  const result = await sql`
    SELECT is_admin FROM users WHERE email = ${email}
  `;
  return result.length > 0 && result[0].is_admin;
}

export async function toggleGameFeatured(slug: string) {
  await sql`
    UPDATE games
    SET is_featured = NOT is_featured
    WHERE slug = ${slug}
    RETURNING is_featured
  `;
}

export async function getAllGamesForAdmin() {
  const result = await sql`
    SELECT g.*, u.name as author_name, u.email as author_email,
           CASE WHEN g.rating_count > 0 THEN ROUND(g.rating_sum::decimal / g.rating_count, 1) ELSE 0 END as average_rating
    FROM games g
    JOIN users u ON g.user_id = u.id
    ORDER BY g.created_at DESC
  `;
  return result;
}
