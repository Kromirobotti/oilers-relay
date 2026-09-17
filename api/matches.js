const API_BASE = "https://salibandy-api.torneopal.net/taso/rest";
const API_KEY = "zsn3anknxzcfzc23k53jqdcd4pymutsf";

const UPSTREAM_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept-Language": "fi-FI,fi;q=0.9",
  Referer: "https://tulospalvelu.salibandy.fi/",
  Origin: "https://tulospalvelu.salibandy.fi",
  accept: "json/" + API_KEY,
};

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { category_id, competition_id, team_id } = req.query || {};
  if (!category_id || !competition_id || !team_id) {
    res.status(400).json({ error: "missing category_id/competition_id/team_id" });
    return;
  }

  const params = new URLSearchParams({ category_id, competition_id, team_id });
  const upstreamUrl = `${API_BASE}/getMatches?${params.toString()}`;

  try {
    const upstreamResp = await fetch(upstreamUrl, { headers: UPSTREAM_HEADERS });
    const text = await upstreamResp.text();
    res.status(upstreamResp.status);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.send(text);
  } catch (err) {
    res.status(502).json({ error: String(err && err.message ? err.message : err) });
  }
};
