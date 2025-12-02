export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const response = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`
    );

    const text = await response.text();

    if (!response.ok) {
      return res.status(404).json({ error: "Avatar not found" });
    }

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({ error: "Invalid response from Roblox API" });
    }

    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message || "Failed to fetch avatar" });
  }
}
