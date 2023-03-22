## Deploying pipelines

For a pipeline, you'll have to create a few types of resources in Google Cloud:
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

# Grant the appropriate roles to the service account...
gcloud projects add-iam-policy-binding musa-344004 \
  --member serviceAccount:data-pipeline-user@musa-344004.iam.gserviceaccount.com \
  --role roles/cloudfunctions.invoker

gcloud projects add-iam-policy-binding musa-344004 \
  --member serviceAccount:data-pipeline-user@musa-344004.iam.gserviceaccount.com \
  --role roles/workflows.invoker

gcloud projects add-iam-policy-binding musa-344004 \
  --member serviceAccount:data-pipeline-user@musa-344004.iam.gserviceaccount.com \
  --role roles/bigquery.jobUser
```

CLI References:
- [gcloud functions deploy](https://cloud.google.com/sdk/gcloud/reference/functions/deploy)
- [gcloud workflows deploy](https://cloud.google.com/sdk/gcloud/reference/workflows/deploy)
- [gcloud scheduler jobs create http](https://cloud.google.com/sdk/gcloud/reference/scheduler/jobs/create/http)
- [gcloud scheduler jobs update http](https://cloud.google.com/sdk/gcloud/reference/scheduler/jobs/update/http)

Some things to note:
- The scheduler job uses [OAuth](https://en.wikipedia.org/wiki/OAuth) to authenticate in order to run the workflow, whereas the workflow steps use [OIDC (OpenID Connect)](https://en.wikipedia.org/wiki/OpenID#OpenID_Connect_(OIDC)) to authenticate in order to call the functions. The documentation specifies in several places (such as [here](https://cloud.google.com/sdk/gcloud/reference/scheduler/jobs/create/http#--oauth-service-account-email) in the `gcloud scheduler jobs create http` documentation) that OAuth should be used "if the target is a Google APIs service with URL `*.googleapis.com`", whereas OIDC is "generally used *except* for Google APIs hosted on `*.googleapis.com`".
- The service account should have the appropriate roles to be able to:
  - Invoke functions (`roles/cloudfunctions.invoker` for gen 1 functions, `roles/run.invoker` for gen 2 functions)
  - Invoke workflows (`roles/workflows.invoker`)
  - Read and write data in storage buckets (`roles/storage.objectViewer` and `roles/storage.objectCreator`, or `roles.storage.ObjectAdmin` if you want to overwrite storage objects)

You can find a list of all roles available for the following services at:
- [Cloud Functions](https://cloud.google.com/functions/docs/reference/iam/roles#standard-roles)
- [Workflows](https://cloud.google.com/workflows/docs/access-control#roles)
- [Cloud Storage](https://cloud.google.com/storage/docs/access-control/iam-roles#standard-roles)
