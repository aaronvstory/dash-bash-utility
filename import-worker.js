// Web Worker for parsing JSON off the main thread
// Prevents UI freezes during large file imports (v1.9.5)

self.onmessage = (event) => {
  try {
    const { text } = event.data;

    // Parse JSON in worker thread (off main thread)
    const data = JSON.parse(text);

    // Post success result back to main thread
    self.postMessage({
      ok: true,
      data: data
    });
  } catch (error) {
    // Post error back to main thread
    self.postMessage({
      ok: false,
      error: String(error)
    });
  }
};
