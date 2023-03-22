import bigquery from '@google-cloud/bigquery';
import functions from '@google-cloud/functions-framework';

functions.http('load_data', async (req, res) => {
  const client = new bigquery.BigQuery();

  const sql = `
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
  `;
  await client.query(sql);

  res.status(200).send('OK');
});
