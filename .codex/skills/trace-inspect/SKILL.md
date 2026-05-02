---
name: trace-inspect
description: Use when debugging or inspecting a spot trade's audit trail — retrieving per-bar strategy state, entry params, filter verdicts, fractal levels, or exit events from the trade_trace table via the API endpoint or direct DB queries.
---

# Trace Inspect

Reference skill for inspecting the `trade_trace` audit trail on the trading dashboard.

## API Endpoint

```
GET /api/spot/history/<trade_id>/trace
```

Returns `{ "trade_id": <int>, "rows": [ ... ] }` sorted by `seq`.
Returns `404` when the trade doesn't exist; `200` with `rows: []` when the trade exists but has no trace rows (pre-feature trades).

## Quick Commands

### Fetch trace for a trade id
```bash
curl -s -u "$USER:$PASS" \
  -H "X-Agent-Api-Key: $KEY" \
  "http://18.153.49.135/api/spot/history/<id>/trace" | python3 -m json.tool
```

### Find recent spot trade ids
```bash
curl -s -u "$USER:$PASS" \
  -H "X-Agent-Api-Key: $KEY" \
  "http://18.153.49.135/api/spot/history?mode=spot_demo&limit=5" \
  | python3 -c "import sys,json; [print(t['id'], t['symbol'], t['exit_reason']) for t in json.load(sys.stdin)['trades']]"
```

### Direct DB — all rows for a trade
```bash
sqlite3 instance/trading.db \
  "SELECT seq, kind, ts, price, fractal_stop, atr_bucket FROM trade_trace WHERE trade_id=<id> ORDER BY seq;"
```

### Direct DB — rows still unlinked (orphan check)
```bash
sqlite3 instance/trading.db \
  "SELECT open_trade_key, COUNT(*) FROM trade_trace WHERE trade_id IS NULL GROUP BY open_trade_key;"
```

### Direct DB — params_snapshot for a trade
```bash
sqlite3 instance/trading.db \
  "SELECT params_snapshot FROM trade_history_spot WHERE id=<id>;"
```

## `trade_trace` Schema

| Column | Type | Notes |
|---|---|---|
| `id` | INT PK | autoincrement |
| `open_trade_key` | TEXT | `"{stock_id}:{entry_time_iso}"` — synthetic key during open trade |
| `trade_id` | INT nullable FK | → `trade_history_spot.id`; `NULL` while trade is open, backfilled by `finalize_trace()` |
| `seq` | INT | Monotonic per `open_trade_key`, derived from `MAX(seq)+1` inside DB session |
| `ts` | TEXT | UTC ISO timestamp of the row |
| `kind` | TEXT | See kind table below |
| `bar_open_time` | TEXT | Bar boundary (bar_snapshot/sl_trail/filter_flip rows) |
| `bar_close_time` | TEXT | Bar boundary |
| `timeframe` | TEXT | e.g. `1h` |
| `price` | REAL | Entry/exit/current price at emission time |
| `fractal_stop` | REAL | Active fractal stop level |
| `next_up_fractal` | REAL | |
| `next_down_fractal` | REAL | |
| `ema_relative_value` | REAL | Relative EMA value |
| `ema_relative_bias` | TEXT | `bullish` / `bearish` / `null` |
| `ema_weekly_bias` | TEXT | `bullish` / `bearish` / `null` |
| `atr_value` | REAL | ATR value |
| `atr_close_ratio` | REAL | ATR / close |
| `atr_bucket` | TEXT | `low` / `medium` / `high` |
| `tp_price` | REAL | Active TP at emission time |
| `sl_price` | REAL | Active SL at emission time |
| `filter_verdicts` | JSON | Full confirmation snapshot (EMA + ATR bucket) |
| `extra` | JSON | Per-kind payload (e.g. `{side, qty}` for fill) |

**Indexes:** `(open_trade_key, seq)`, `(trade_id, seq)`, `(open_trade_key, kind)`

## Kind Values

| `kind` | Emitted by | When |
|---|---|---|
| `entry` | `spot_broker` (STOP) / `realtime_checker` (MARKET) | Position opens |
| `fill` | `spot_broker` | STOP order confirmed filled (before entry trace) |
| `bar_snapshot` | `scheduler` | Every timeframe bar while in position |
| `sl_trail` | `scheduler` | Fractal stop moves to a new level |
| `filter_flip` | `scheduler` | EMA or ATR bias changes direction |
| `tp_hit` | `realtime_checker` | Exit via take-profit |
| `sl_hit` | `realtime_checker` | Exit via stop-loss or fractal stop |
| `exit` | `realtime_checker` | Any other exit reason |
| `manual_exit` | `spot_api` | Position closed via DELETE /api/spot/stocks/<id> |

## `params_snapshot` JSON Shape

Stored on `trade_history_spot.params_snapshot` and echoed in trace `entry` rows:

```json
{
  "entry_config": { "timeframe": "1h", "tp_long": 0.1, ... },
  "filter_enable": {
    "relative_ema_enabled": true,
    "weekly_ema_enabled": true,
    "atr_bucket_enabled": true
  },
  "thresholds": {
    "tp_long": 0.1, "sl_long": 0.05,
    "tp_short": 0.1, "sl_short": 0.05
  },
  "periods": {
    "ema_relative": 20, "ema_weekly": 20,
    "atr": 14, "fractal_lookback": 10
  },
  "broker_mode": "spot_demo",
  "captured_at": "2024-01-01T10:00:00+00:00"
}
```

`NULL` for trades opened before this feature was deployed.

## Pretty-Print Tips

Filter to just entry/exit events:
```bash
sqlite3 -json instance/trading.db \
  "SELECT seq,kind,ts,price,fractal_stop FROM trade_trace WHERE trade_id=<id> AND kind IN ('entry','fill','tp_hit','sl_hit','manual_exit','exit') ORDER BY seq;" \
  | python3 -m json.tool
```

Count rows by kind for a trade:
```bash
sqlite3 instance/trading.db \
  "SELECT kind, COUNT(*) n FROM trade_trace WHERE trade_id=<id> GROUP BY kind ORDER BY n DESC;"
```
