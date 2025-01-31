import json

def read_geojson_files(file):
  geojson_data = []

  with open(file, 'r', encoding='utf-8') as f:
    geojson_data = json.load(f)
  
  return geojson_data

res = []

def process_geojson_data(geojson_data):
  features = geojson_data['features']
  for station in features:
    properties = station['properties']
    geometry = station['geometry']
    processFlag = False
    for processedSta in res:
      if processedSta['properties']['name'] == properties['name']:
        processedSta['properties']['operator'].append(properties.get('operator', ''))
        processFlag = True
        break
    if processFlag == False:
      res.append({

        'type': 'Feature',
        'geometry': geometry,
        'properties': {
          "addr:province": "東京都",
          "name": properties['name'],
          "name_hira": properties.get('name:ja-Hira', ''),
          "operator": [properties.get('operator', ''),],
        },
      })
    

if __name__ == "__main__":
  directory = './geojson/tokyo_stations.geojson'
  geojson_data = read_geojson_files(directory)
  process_geojson_data(geojson_data)

  with open('./geojson/tokyo_stations_cleaned.geojson', 'w', encoding='utf-8') as f:
    json.dump({'features': res}, f, ensure_ascii=False)