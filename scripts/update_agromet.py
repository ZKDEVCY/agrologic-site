"""Convert the Cyprus Department of Meteorology's observation-per-row XML feed.
Run from GitHub Actions. Never manufacture measurements or timestamps.
"""
import json, re, sys, urllib.request, xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

URL = 'https://dom.org.cy/AWS/OpenData/CyDoM.xml'
DEST = Path(__file__).resolve().parents[1] / 'agromet' / 'stations.json'

def norm(value):
    return re.sub(r'[^a-z0-9]', '', str(value or '').lower().split('}')[-1])

def number(value):
    if value is None: return None
    s = str(value).strip().replace(',', '.')
    try: return float(s)
    except ValueError: return None

def parse(raw):
    root = ET.fromstring(raw)
    stations = {}
    # Official feed is a collection of individual <observation> entries, NOT station records.
    for node in root.iter():
        if norm(node.tag) != 'observation': continue
        d = {norm(c.tag): (c.text or '').strip() for c in node if len(c) == 0}
        code = d.get('stationcode') or d.get('stationid')
        obsname = d.get('observationname')
        if not code or not obsname: continue
        station = stations.setdefault(code, {'id':code, 'name': d.get('stationname') or code,
            'latitude':None, 'longitude':None, 'observed_at':None,
            'readings': {k:None for k in ('temperature','humidity','wind','rain','solar','pressure')}})
        if d.get('stationname'): station['name'] = d['stationname']
        for field, keys in [('latitude',('latitude','lat')),('longitude',('longitude','lon','long'))]:
            for key in keys:
                if number(d.get(key)) is not None: station[field] = number(d[key]); break
        if d.get('datetime'): station['observed_at'] = d['datetime']
        elif d.get('date_time'): station['observed_at'] = d['date_time']
        name = norm(obsname)
        field = None
        if name in ('airtemperature12m','temperature','airtemperature'): field='temperature'
        elif name in ('relativehumidity12m','relativehumidity','humidity'): field='humidity'
        elif name in ('windspeed10m','windspeed2m','windspeed'): field='wind'
        elif name in ('accumulatedrainfall10min','rainfall10min','rain','rainfall'): field='rain'
        elif name in ('globalradiation','globalsolarradiation'): field='solar'
        elif name in ('atmosphericpressurestationlevel','atmosphericpressure','pressure'): field='pressure'
        if field:
            value = number(d.get('observationvalue'))
            if value is not None:
                unit = (d.get('observationunit') or '').lower()
                if field == 'wind' and ('knot' in unit or unit.strip() in ('kt','kts')):
                    value = round(value * 1.852, 2) # km/h
                station['readings'][field] = value
    return sorted(stations.values(), key=lambda s:s['name'].casefold())

def main():
    req=urllib.request.Request(URL,headers={'User-Agent':'Mozilla/5.0 (compatible; AgrologicAgroMet/1.2; +https://agrologic.cy)'})
    with urllib.request.urlopen(req, timeout=45) as response: raw=response.read(5_000_000)
    stations=parse(raw)
    if not stations: raise RuntimeError('No valid station observations parsed; refusing to overwrite snapshot')
    payload={'source':'Cyprus Department of Meteorology','source_url':URL,
      'fetched_at':datetime.now(timezone.utc).isoformat(), 'station_count':len(stations), 'stations':stations}
    DEST.parent.mkdir(parents=True,exist_ok=True)
    DEST.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('Retrieved',len(stations),'stations,',sum(any(v is not None for v in s['readings'].values()) for s in stations),'with readings')

if __name__ == '__main__':
    try: main()
    except Exception as exc:
        print('Failed; previous valid snapshot retained:',exc,file=sys.stderr)
        sys.exit(1)
