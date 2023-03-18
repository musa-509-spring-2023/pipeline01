## Deploying pipelines

For a pipeline, you'll have to create a few types of recources in Google Cloud:
1.  The individual functions that will be run as part of the pipeline
2.  The workflow that will orchestrate the functions
3.  A scheduler job that will trigger the workflow

```bash
# Create the functions...
gcloud functions deploy extract-census \
  --source src/extract_census \
  --entry-point extract_data \
  --region us-central1 \
  --runtime nodejs18 \
  --trigger-http \
  --service-account data-pipeline-user@musa-344004.iam.gserviceaccount.com

gcloud functions deploy prepare-census \
  --source src/prepare_census \
  --entry-point prepare_data \
  --region us-central1 \
  --runtime nodejs18 \
  --trigger-http \
  --service-account data-pipeline-user@musa-344004.iam.gserviceaccount.com

# Create the workflow...
gcloud workflows deploy census-pipeline \
  --source src/census_pipeline.yml \
  --location us-central1 \
  --service-account data-pipeline-user@musa-344004.iam.gserviceaccount.com

# Create (or update) the scheduler job...
gcloud scheduler jobs [create | update] http census-pipeline-schedule \
  --location us-central1 \
  --schedule "0 9 * * 1-5" \
  --uri https://workflowexecutions.googleapis.com/v1/projects/musa-344004/locations/us-central1/workflows/census-pipeline/executions \
  --oauth-service-account-email data-pipeline-user@musa-344004.iam.gserviceaccount.com
```
