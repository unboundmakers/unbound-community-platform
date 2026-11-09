function readCloudConfig(environment = process.env) {
  return {
    enabled: environment.ENABLE_GOOGLE_CLOUD === 'true',
    projectId: String(environment.GOOGLE_CLOUD_PROJECT || '').trim(),
    collection: String(environment.DOCUMENT_COLLECTION || '').trim(),
  };
}

module.exports = {readCloudConfig};
