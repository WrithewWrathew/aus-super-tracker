export default async function handler(req, res) {
  try {
    const csvUrl = "https://www.australiansuper.com//api/graphs/dailyrates/download/?start=12/02/2026&end=31/12/2076&cumulative=False&superType=super&truncateDecimalPlaces=True&outputFilename=auSuper.csv";

    const response = await fetch(csvUrl, {
      method: "GET",
      headers: {
        "Accept": "text/csv,application/octet-stream,*/*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    if (!response.ok) {
      throw new Error("Upstream response failed: " + response.status);
    }

    const text = await response.text();

    // return CSV as plain text
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Cache-Control", "no-cache");
    res.status(200).send(text);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
