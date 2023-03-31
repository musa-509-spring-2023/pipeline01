import pathlib
from google.cloud import bigquery
import functions_framework

DIR = pathlib.Path(__file__).parent


@functions_framework.http
def load_data(request):
    client = bigquery.Client()

    with open(DIR / 'create_source_data_census_population_2020.sql') as f:
        sql = f.read()
    client.query(sql)

    return 'OK'
