export default async function handler(req, res) {

  try {

    // Dynamic date range (last 14 days)

    const today = new Date();

    const endDate = today.toLocaleDateString("en-GB");

    const start = new Date();
    start.setDate(start.getDate() - 14);

    const startDate = start.toLocaleDateString("en-GB");

    const csvURL =
      `https://www.australiansuper.com/api/graphs/dailyrates/download/?start=${startDate}&end=${endDate}&cumulative=False&superType=super&truncateDecimalPlaces=True&outputFilename=temp.csv`;

    const response = await fetch(csvURL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch CSV");
    }

    const csv = await response.text();

    const lines = csv
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean);

    const headers = lines[0].split(",").map(h => h.trim());

    const intlIndex = headers.findIndex(h =>
      h.toLowerCase().includes("international shares")
    );

    if (intlIndex === -1) {
      throw new Error("International Shares column not found");
    }

    let latestValue = null;
    let latestDate = null;

    for (let i = lines.length - 1; i > 0; i--) {

      const cols = lines[i].split(",").map(c => c.trim());

      const val = parseFloat(cols[intlIndex]);

      if (!isNaN(val) && Math.abs(val) > 0.00001) {
        latestValue = val;
        latestDate = cols[0];
        break;
      }
    }

    res.status(200).json({
      value: latestValue !== null ? latestValue.toFixed(4) : null,
      date: latestDate,
      fetchedAt: new Date().toISOString()
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
}
