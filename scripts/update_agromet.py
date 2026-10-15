"""Convert Cyprus Department of Meteorology observations to AgroMet snapshot.
No synthetic measurements or observation timestamps are generated.
"""
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

URL = 'https://dom.org.cy/AWS/OpenData/CyDoM.xml'
DEST = Path(__file__).resolve().parents[1] / 'agromet' / 'stations.json'


def norm(value):
    return re.sub(r'[^a-z0-9]', '', str(value or '').lower().split('}')[-1])


def number(value):
    try:
        return float(str(value).strip().replace(',', '.')) if value is not None else None
    except (ValueError, TypeError):
        return None


def parse(raw):
    root = ET.fromstring(raw)
    stations = {}
    for node in root.findall('./stations/station'):
        code = (node.findtext('station_code') or '').strip()
        if not code:
            continue
        stations[code] = {
            'id': code, 'name': code.replace('_', ' ').title(),
            'latitude': number(node.findtext('station_latitude')),
            'longitude': number(node.findtext('station_longitude')),
            'observed_at': None,
            'readings': {k: None for k in ('temperature', 'humidity', 'wind', 'rain', 'solar', 'pressure')}
        }

    mapping = {
        'airtemperature12m': 'temperature',
        'relativehumidity12m': 'humidity',
        'windspeed10m': 'wind',
        'windspeed2m': 'wind',
        'accumulatedrainfall10min': 'rain',
        'globalradiation': 'solar',
        'atmosphericpressurestationlevel': 'pressure',
    }
    # Prefer wind at 10 m where available; fallback to 2 m.
    wind_rank = {}
    for block in root.findall('./observations'):
        code = (block.findtext('station_code') or '').strip()
        if code not in stations:
            continue
        station = stations[code]
        station['observed_at'] = (block.findtext('date_time') or '').strip() or None
        for obs in block.findall('./observation'):
            name = norm(obs.findtext('observation_name'))
            field = mapping.get(name)
            value = number(obs.findtext('observation_value'))
            if field is None or value is None:
                continue
            if field == 'wind':
                rank = 2 if name == 'windspeed10m' else 1
                if rank < wind_rank.get(code, 0):
                    continue
                wind_rank[code] = rank
                unit = (obs.findtext('observation_unit') or '').strip().lower()
                if unit in ('knots', 'knot', 'kt', 'kts'):
                    value *= 1.852
                elif unit in ('m/s', 'mps'):
                    value *= 3.6
                elif unit not in ('km/h', 'kmh'):
                    continue
                value = round(value, 2)
            station['readings'][field] = value
    return sorted(stations.values(), key=lambda s: s['name'].casefold())


def main():
    req = urllib.request.Request(URL, headers={'User-Agent': 'Mozilla/5.0 (compatible; AgrologicAgroMet/1.3; +https://agrologic.cy)'})
    with urllib.request.urlopen(req, timeout=45) as response:
        raw = response.read(5_000_000)
    stations = parse(raw)
    valid = sum(any(v is not None for v in s['readings'].values()) for s in stations)
    if not stations or valid == 0:
        raise RuntimeError('No valid station readings parsed; refusing to overwrite snapshot')
    payload = {
        'source': 'Cyprus Department of Meteorology', 'source_url': URL,
        'fetched_at': datetime.now(timezone.utc).isoformat(),
        'station_count': len(stations), 'stations': stations
    }
    DEST.parent.mkdir(parents=True, exist_ok=True)
    DEST.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Retrieved {len(stations)} stations, {valid} with readings')


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print('Failed; previous valid snapshot retained:', exc, file=sys.stderr)
        sys.exit(1)
