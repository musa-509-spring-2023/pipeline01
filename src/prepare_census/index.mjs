import * as csv from 'csv/sync';
import storage from '@google-cloud/storage';
import functions from '@google-cloud/functions-framework';

functions.http('prepare_data', async (req, res) => {
  const client = new storage.Storage();
  const rawBucket = client.bucket('mjumbewu_musa_509_raw_data');
  const processedBucket = client.bucket('mjumbewu_musa_509_processed_data');

  console.log('Reading raw data from bucket: ' + rawBucket.name);
  const rawBlob = rawBucket.file('census/census_population_2020.json');
  const [content] = await rawBlob.download();
  const data = JSON.parse(content);
  data[0] = ['name', 'geoid', 'population', 'state', 'county', 'tract', 'block_group']

  console.log(`Writing processed data to bucket: ${processedBucket.name}`);
  const processedBlob = processedBucket.file('census_population_2020/data.csv');
  const outContent = csv.stringify(data);
  await processedBlob.save(outContent, { resumable: false });

  console.log('Done!');
  res.status(200).send('OK');
});
