export default async function handler(req, res) {

  try {

    const formatDate = (d) => {
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const today = new Date();

    const endDate = formatDate(today);

    const start = new Date();
    start.setDate(start.getDate() - 14);

    const startDate = formatDate(start);

    const csvURL =
      `https://www.australiansuper.com/api/graphs/dailyrates/download/?start=${startDate}&end=${endDate}&cumulative=False&superType=super&truncateDecimalPlaces=True&outputFilename=temp.csv`;

    const response = await fetch(csvURL, {

      method: "GET",

      headers: {
        "accept": "text/csv,application/octet-stream,*/*",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "referer": "https://www.australiansuper.com/",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
      }

    });

    if (!response.ok) {
      throw new Error("Upstream status " + response.status);
    }

    const text = await response.text();

    if (!text.includes("International Shares")) {
      throw new Error("CSV blocked or invalid response");
    }

    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

    const headers = lines[0].split(",").map(h => h.trim());

    const intlIndex = headers.findIndex(h =>
      h.toLowerCase().includes("international shares")
    );

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
      value: latestValue,
      date: latestDate
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
}
