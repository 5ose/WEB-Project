const getBasicHealth = () => {
  console.log("Performing basic health check"); // TEST
  return {
    ok: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  };
};

const getDetailedHealth = () => {
  console.log("Performing detailed health check"); // TEST
  const mem = process.memoryUsage();
  return {
    ok: true,
    uptimeSeconds: process.uptime(),
    memory: {
      rss: mem.rss,
      heapTotal: mem.heapTotal,
      heapUsed: mem.heapUsed,
      external: mem.external,
    },
    timestamp: new Date().toISOString(),
  };
};

export { getBasicHealth, getDetailedHealth };