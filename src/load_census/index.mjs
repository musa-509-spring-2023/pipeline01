import fs from 'fs/promises';
import bigquery from '@google-cloud/bigquery';
import functions from '@google-cloud/functions-framework';

const DIR = new URL('.', import.meta.url).pathname;


functions.http('load_data', async (req, res) => {
  const client = new bigquery.BigQuery();

  const sql = await fs.readFile(DIR + 'create_source_data_census_population_2020.sql', 'utf8');
  const queryJob = await client.query(sql);
  await queryJob.getQueryResults();

  res.status(200).send('OK');
});
