import json
import requests
from google.cloud import storage
import functions_framework

@functions_framework.http
def extract_data(request):
    client = storage.Client()
    bucket = client.bucket('mjumbewu_musa_509_raw_data')

    url = 'https://api.census.gov/data/2020/dec/pl?get=NAME,GEO_ID,P1_001N&for=block%20group:*&in=state:42%20county:*'
    resp = requests.get(url)
    data = resp.json()

    json_data = json.dumps(data)
    blob = bucket.blob('census/census_population_2020.json')
    blob.upload_from_string(json_data, content_type='application/json')

    return 'OK'
