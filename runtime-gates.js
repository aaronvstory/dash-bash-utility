// Runtime gate controls to pause side-effects during data imports.
(() => {
  const ImportGate = {
    active: false,
    set(value) {
      this.active = Boolean(value);
    },
  };

  const isImporting = () => ImportGate.active;

  let muteMessages = false;
  let muteLogs = false;

  const setMessageMute = (value) => {
    muteMessages = Boolean(value);
  };

  const shouldBlockMessages = () => muteMessages || isImporting();

  const setLogMute = (value) => {
    muteLogs = Boolean(value);
  };

  const log = (...args) => {
    if (muteLogs || isImporting()) return;
    console.log(...args);
  };

  const safeSetItem = (key, value) => {
    if (isImporting()) return;
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      console.warn("[safeSetItem] failed", err);
    }
  };

  Object.assign(window, {
    ImportGate,
    isImporting,
    setMessageMute,
    shouldBlockMessages,
    setLogMute,
    log,
    safeSetItem,
  });
})();
