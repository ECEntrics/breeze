const defaultOptions = {
  // OrbitDB uses Pubsub which is an experimental feature and needs to be turned on manually.
  EXPERIMENTAL: {
    pubsub: true,
  },
  orbit: {
    databases: []
  }
}

export default defaultOptions
