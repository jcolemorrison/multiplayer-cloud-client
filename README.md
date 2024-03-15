# Multiplayer Cloud Client

```
npm install
npm start
```

The client should be accessible at [`http://localhost:1234`](`http://localhost:1234`) by default.  Otherwise it will look for an environment variable and host `SERVER_HOST` (sans any protocol) and `SERVER_PORT`.

Requires 6 Repository Secrets to use the Github Action Workflow

1. `GCP_PROJECT_ID` - ID of your GCP project
2. `GCP_SA_KEY` - Full JSON key of the service account used to manage the client site bucket
3. `GCP_URL_MAP_NAME` - Client Site Load Balancer's URL Map name
4. `GCS_BUCKET_NAME` - name of Bucket
5. `SERVER_HOST` - IP of Server Load Balancer or CNAME sans protocol
6. `SERVER_PORT` - Port the Server Load Balancer listens on