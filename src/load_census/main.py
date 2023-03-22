from google.cloud import bigquery
import functions_framework


@functions_framework.http
def load_data(request):
    client = bigquery.Client()

    sql = """
        CREATE OR REPLACE EXTERNAL TABLE \`source_data.census_population_2020\` (
            name STRING,
            geoid STRING,
            population INTEGER,
            state STRING,
            county STRING,
            tract STRING,
            block_group STRING
        )
        OPTIONS (
            sourceUris = ['gs://mjumbewu_musa_509_raw_data/census/census_population_2020.csv'],
            format = 'CSV'
        )
    """
    client.query(sql)

    return 'OK'
