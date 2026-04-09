(async () => {
  try {
    await import("./src/server.js");
  } catch (error) {
    console.error("Failed to start NBGSTRAVEL API:", error);
    process.exit(1);
  }
})();
