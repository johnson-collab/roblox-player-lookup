import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, username, displayName, description, created, avatarUrl } = req.body;

  if (!userId || !username) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        username: username,
        display_name: displayName,
        description: description,
        created: created,
        avatar_url: avatarUrl,
        last_login: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ success: true, user: data });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Failed to authenticate user' });
  }
} 
