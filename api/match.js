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

  const { match_id } = req.query || {};
  if (!match_id) {
    res.status(400).json({ error: "missing match_id" });
    return;
  }

  const upstreamUrl = `${API_BASE}/getMatch?match_id=${encodeURIComponent(match_id)}`;

  try {
    const upstreamResp = await fetch(upstreamUrl, { headers: UPSTREAM_HEADERS });
    if (!upstreamResp.ok) {
      const bodySnippet = (await upstreamResp.text()).slice(0, 300);
      res.status(upstreamResp.status).json({ error: `upstream ${upstreamResp.status}`, bodySnippet });
      return;
    }
    const data = await upstreamResp.json();
    const m = (data && data.match) || {};
    const goals = Array.isArray(m.goals)
      ? m.goals.map((g) => ({
          team_id: g.team_id,
          player_name: g.player_name,
          shirt_number: g.player_shirt_number,
          time: g.time,
          score_A: g.score_A,
          score_B: g.score_B,
          note: (g.description || "").trim() || null,
        }))
      : [];
    res.status(200).json({
      team_A_id: m.team_A_id,
      team_B_id: m.team_B_id,
      period_lengths_sec: m.period_lengths_sec || null,
      goals,
    });
  } catch (err) {
    res.status(502).json({ error: String(err && err.message ? err.message : err) });
  }
};
