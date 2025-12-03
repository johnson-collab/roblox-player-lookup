 import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const { data, error } = await supabase
      .from('collected_players')
      .select('*')
      .eq('collector_id', userId)
      .order('date_caught', { ascending: false });

    if (error) throw error;

    return res.status(200).json({ success: true, players: data || [] });
  } catch (error) {
    console.error('Bloxydex fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch collection' });
  }
}
