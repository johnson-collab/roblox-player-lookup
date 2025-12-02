export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    // Fetch detailed user info by ID
    const response = await fetch(
      `https://users.roblox.com/v1/users/${userId}`
    );

    if (!response.ok) {
      return res.status(404).json({ error: "User not found" });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch user details" });
  }
}