// Web Worker for parsing JSON off the main thread
// Prevents UI freezes during large file imports (v1.9.5)

self.onmessage = (event) => {
  try {
    const message = event.data;
    let jsonText;

    if (message && message.type === "ARRAY_BUFFER") {
      const buf = message.payload;
      const decoder = new TextDecoder();
      jsonText = decoder.decode(buf);
    } else if (typeof message === "string") {
      jsonText = message;
    } else if (message && typeof message.text === "string") {
      jsonText = message.text;
    } else {
      throw new Error("Unsupported payload passed to import-worker");
    }

    const data = JSON.parse(jsonText);

    self.postMessage({ ok: true, data });
  } catch (error) {
    self.postMessage({ ok: false, error: String(error && error.message || error) });
  }
};
