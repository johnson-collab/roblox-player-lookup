import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { 
    collectorId, 
    playerId, 
    playerUsername, 
    playerDisplayName, 
    playerDescription,
    playerCreated,
    playerAvatarUrl,
    collectionCode 
  } = req.body;

  if (!collectorId || !playerId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { data, error } = await supabase
      .from('collected_players')
      .insert({
        collector_id: collectorId,
        player_id: playerId,
        player_username: playerUsername,
        player_display_name: playerDisplayName,
        player_description: playerDescription,
        player_created: playerCreated,
        player_avatar_url: playerAvatarUrl,
        collection_code: collectionCode
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Player already collected' });
      }
      throw error;
    }

    return res.status(200).json({ success: true, player: data });
  } catch (error) {
    console.error('Collect error:', error);
    return res.status(500).json({ error: 'Failed to collect player' });
  }
} 
