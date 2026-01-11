
// Build stamp for version tracking
window.__DBU_BUILD__ = "2025-10-19T17:22:00Z-centralized-updateDasherEverywhere";

const { useState, useEffect, useRef, useCallback, useMemo, useTransition } = React;
// [PERF-STAGE2] Phase 2 memo helper
const memo = React.memo;
// [PERF-STAGE6] react-window for virtualization
// Use getter function instead of destructuring to avoid timing issues with adapter
const getVirtualList = () => window.ReactWindow?.FixedSizeList || window.ReactWindow?.List;

// Simple icon component wrapper for Lucide
const Icon = ({ name, size = 20, className = "" }) => {
  const iconRef = useRef(null);

  useEffect(() => {
    if (iconRef.current && window.lucide) {
      // Clear previous content
      iconRef.current.innerHTML = "";
      // Add the icon
      const iconElement = document.createElement("i");
      iconElement.setAttribute("data-lucide", name);
      iconElement.className = className;
      if (size) {
        iconElement.setAttribute("width", size);
        iconElement.setAttribute("height", size);
      }
      iconRef.current.appendChild(iconElement);
      // [PERF-FIX4] Only process THIS icon, not all 930+ icons in document
      window.lucide.createIcons({ root: iconRef.current });
    }
  }, [name, size, className]);

  return React.createElement("span", { ref: iconRef });
};

// Helper functions for commonly used icons
const Trash2 = (props) =>
  React.createElement(Icon, { ...props, name: "trash-2" });
const Plus = (props) =>
  React.createElement(Icon, { ...props, name: "plus" });
const Copy = (props) =>
  React.createElement(Icon, { ...props, name: "copy" });
const ChevronDown = (props) =>
  React.createElement(Icon, { ...props, name: "chevron-down" });
const ChevronUp = (props) =>
  React.createElement(Icon, { ...props, name: "chevron-up" });
const ChevronsDown = (props) =>
  React.createElement(Icon, { ...props, name: "chevrons-down" });
const ChevronsUp = (props) =>
  React.createElement(Icon, { ...props, name: "chevrons-up" });
const Edit2 = (props) =>
  React.createElement(Icon, { ...props, name: "edit-2" });
const Check = (props) =>
  React.createElement(Icon, { ...props, name: "check" });
const Save = (props) =>
  React.createElement(Icon, { ...props, name: "save" });
const X = (props) => React.createElement(Icon, { ...props, name: "x" });
const GripVertical = (props) =>
  React.createElement(Icon, { ...props, name: "grip-vertical" });
const Clock = (props) =>
  React.createElement(Icon, { ...props, name: "clock" });
const MapPin = (props) =>
  React.createElement(Icon, { ...props, name: "map-pin" });
const Calculator = (props) =>
  React.createElement(Icon, { ...props, name: "calculator" });
const MessageSquare = (props) =>
  React.createElement(Icon, { ...props, name: "message-square" });
const Building2 = (props) =>
  React.createElement(Icon, { ...props, name: "building-2" });
const Settings = (props) =>
  React.createElement(Icon, { ...props, name: "settings" });
const Download = (props) =>
  React.createElement(Icon, { ...props, name: "download" });
const Upload = (props) =>
  React.createElement(Icon, { ...props, name: "upload" });
const RefreshCw = (props) =>
  React.createElement(Icon, { ...props, name: "refresh-cw" });
const CheckSquare = (props) =>
  React.createElement(Icon, { ...props, name: "check-square" });
const FolderOpen = (props) =>
  React.createElement(Icon, { ...props, name: "folder-open" });
const FileText = (props) =>
  React.createElement(Icon, { ...props, name: "file-text" });
const Timer = (props) =>
  React.createElement(Icon, { ...props, name: "timer" });
const Users = (props) =>
  React.createElement(Icon, { ...props, name: "users" });
const TimerOff = (props) =>
  React.createElement(Icon, { ...props, name: "timer-off" });
const BarChart3 = (props) =>
  React.createElement(Icon, { ...props, name: "bar-chart-3" });
const Archive = (props) =>
  React.createElement(Icon, { ...props, name: "archive" });
const ArchiveRestore = (props) =>
  React.createElement(Icon, { ...props, name: "archive-restore" });
const UserX = (props) =>
  React.createElement(Icon, { ...props, name: "user-x" });
const UserCheck = (props) =>
  React.createElement(Icon, { ...props, name: "user-check" });
const CircleCheck = (props) =>
  React.createElement(Icon, { ...props, name: "circle-check" });
const Activity = (props) =>
  React.createElement(Icon, { ...props, name: "activity" });
const Banknote = (props) =>
  React.createElement(Icon, { ...props, name: "banknote" });
const Lock = (props) =>
  React.createElement(Icon, { ...props, name: "lock" });
const RotateCcw = (props) =>
  React.createElement(Icon, { ...props, name: "rotate-ccw" });
const ShieldCheck = (props) =>
  React.createElement(Icon, { ...props, name: "shield-check" });

// =========================================================================
// Constants
// =========================================================================
// Balance validation limits (prevents extreme values)
const MAX_BALANCE = 1_000_000;
const MIN_BALANCE = -1_000_000;

// Floating-point comparison threshold for earnings delta
const POSITIVE_DELTA_THRESHOLD = 1e-6;

// =========================================================================
// Error Boundary - Prevents white screen crashes
// =========================================================================
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ERROR BOUNDARY] Caught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  handleClearDataAndReload = () => {
    if (window.confirm("This will clear all app data and reload. Are you sure?")) {
      try {
        localStorage.removeItem("dashBashState");
        // Also clear IndexedDB
        const request = indexedDB.deleteDatabase("DashBashDB");
        request.onsuccess = () => window.location.reload();
        request.onerror = () => window.location.reload();
      } catch (e) {
        console.error("[ERROR BOUNDARY] Clear data failed:", e);
        window.location.reload();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return React.createElement(
        "div",
        {
          className: "min-h-screen bg-gray-900 flex items-center justify-center p-4",
        },
        React.createElement(
          "div",
          { className: "bg-gray-800 rounded-lg p-6 max-w-lg w-full text-center" },
          React.createElement("h1", { className: "text-2xl font-bold text-red-400 mb-4" }, "Something went wrong"),
          React.createElement(
            "p",
            { className: "text-gray-300 mb-4" },
            "The app encountered an error. Your data is likely still saved."
          ),
          React.createElement(
            "div",
            { className: "flex flex-col gap-3" },
            React.createElement(
              "button",
              {
                onClick: this.handleReset,
                className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors",
              },
              "Try Again"
            ),
            React.createElement(
              "button",
              {
                onClick: () => window.location.reload(),
                className: "px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors",
              },
              "Reload Page"
            ),
            React.createElement(
              "button",
              {
                onClick: this.handleClearDataAndReload,
                className: "px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm",
              },
              "Clear Data & Reload (Last Resort)"
            )
          ),
          this.state.error && React.createElement(
            "details",
            { className: "mt-4 text-left" },
            React.createElement("summary", { className: "text-gray-400 cursor-pointer" }, "Error Details"),
            React.createElement(
              "pre",
              { className: "mt-2 p-2 bg-gray-900 rounded text-xs text-red-300 overflow-auto max-h-40" },
              String(this.state.error)
            )
          )
        )
      );
    }
    return this.props.children;
  }
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}
// Shared announcers
function ensureLiveRegion(id, mode = "polite") {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("div");
    el.id = id;
    el.setAttribute("role", mode === "assertive" ? "alert" : "status");
    el.setAttribute("aria-live", mode);
    el.style.position = "fixed";
    el.style.left = "-9999px";
    el.style.top = "auto";
    el.style.width = "1px";
    el.style.height = "1px";
    document.body.appendChild(el);
  }
  return el;
}
function announceSuccess(msg) {
  try {
    const el = ensureLiveRegion("live-success", "polite");
    el.textContent = msg || "";
    // Clear after short delay to allow subsequent announcements
    setTimeout(() => {
      if (el) el.textContent = "";
    }, 1500);
  } catch { }
}
function announceFailure(msg) {
  try {
    const el = ensureLiveRegion("live-error", "assertive");
    el.textContent = msg || "";
    setTimeout(() => {
      if (el) el.textContent = "";
    }, 2000);
  } catch { }
}
function methodLabel(s) {
  const t = String(s ?? "unspecified")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ");
  return t.replace(/\b\w/g, (c) => c.toUpperCase());
}

function deriveNumericAmount(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const normalized = value.replace(/,/g, "").trim();
    if (!normalized) return NaN;
    return parseFloat(normalized);
  }
  return NaN;
}

const deriveDasherIdentity = (dasher, fallbackKey) => {
  if (
    dasher &&
    dasher.id !== undefined &&
    dasher.id !== null &&
    String(dasher.id).trim() !== ""
  ) {
    return String(dasher.id).toLowerCase();
  }
  if (
    dasher &&
    typeof dasher.email === "string" &&
    dasher.email.trim() !== ""
  ) {
    return dasher.email.trim().toLowerCase();
  }
  if (
    dasher &&
    typeof dasher.phone === "string" &&
    dasher.phone.trim() !== ""
  ) {
    return dasher.phone.trim().toLowerCase();
  }
  return String(fallbackKey);
};

const collectDasherEvents = (metaList, historyKey, groupSelector) => {
  const entryMap = new Map();

  metaList.forEach((meta) => {
    const history = ensureArray(meta?.dasher?.[historyKey]);
    history.forEach((rawEntry, entryIndex) => {
      if (!rawEntry) return;
      const amount = deriveNumericAmount(rawEntry.amount);
      if (!Number.isFinite(amount) || amount <= 0) return;
      const timestamp = rawEntry.at ? Date.parse(rawEntry.at) : NaN;
      if (!Number.isFinite(timestamp)) return;

      const group = groupSelector(rawEntry) || "unspecified";
      const identity = deriveDasherIdentity(
        meta?.dasher,
        `${meta?.uniqueFallback ?? "dash"}-${entryIndex}`,
      );
      const entryKey = `${identity}|${timestamp}|${amount}|${group}`;

      let bucket = entryMap.get(entryKey);
      if (!bucket) {
        bucket = {
          amount,
          at: timestamp,
          group,
          buckets: new Set(),
          dasherIds: new Set(),
          dasherNames: new Set(),
        };
        entryMap.set(entryKey, bucket);
      }

      if (meta?.bucketId) {
        bucket.buckets.add(String(meta.bucketId));
      }
      if (meta?.dasher?.id !== undefined && meta?.dasher?.id !== null) {
        bucket.dasherIds.add(String(meta.dasher.id).toLowerCase());
      }
      if (meta?.dasher?.name) {
        bucket.dasherNames.add(String(meta.dasher.name).toLowerCase());
      }
    });
  });

  return Array.from(entryMap.values());
};

const computeRollingWindowSummaries = (entries, options = {}) => {
  const {
    groupAccessor = (entry) => entry.group || "unspecified",
    now = Date.now(),
  } = options;
  const windows = [
    { key: "24h", ms: 24 * 60 * 60 * 1000 },
    { key: "7d", ms: 7 * 24 * 60 * 60 * 1000 },
    { key: "30d", ms: 30 * 24 * 60 * 60 * 1000 },
  ];

  const result = {};
  windows.forEach(({ key, ms }) => {
    const cutoff = now - ms;
    const summary = {
      count: 0,
      total: 0,
      byGroup: {},
    };

    entries.forEach((entry) => {
      if (entry.at < cutoff) return;
      summary.count += 1;
      summary.total += entry.amount;
      const groupKey = groupAccessor(entry) || "unspecified";
      summary.byGroup[groupKey] =
        (summary.byGroup[groupKey] || 0) + entry.amount;
    });

    result[key] = summary;
  });

  return result;
};

// Tiny inline spinner (no extra libs) for perceived responsiveness
const Spinner = ({ text = "Loading…" }) => (
  <div className="flex items-center justify-center py-8 text-gray-300 text-sm">
    <svg
      className="animate-spin h-5 w-5 text-indigo-400 mr-2"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M12 2a10 10 0 0 1 10 10h-4a6 6 0 1 0-6-6V2z"
      ></path>
    </svg>
    {text}
    <span className="sr-only" aria-live="polite">
      {text}
    </span>
  </div>
);

// [PERF-STAGE2] Inline memoized section shells to prevent ripple re-renders.
// Keep them lightweight; pass only stable props.
const CalculatorSection = memo(function CalculatorSection({ children }) { return children; });
const MessagesSection = memo(function MessagesSection({ children }) { return children; });
const AddressBookSection = memo(function AddressBookSection({ children }) { return children; });
const NotesSection = memo(function NotesSection({ children }) { return children; });
const StatisticsSection = memo(function StatisticsSection({ children }) { return children; });

// [PERF-STAGE7] runtime render counter
let dasherCardRenderCounter = 0;

// Memoized DasherCard component to prevent unnecessary re-renders (v1.9.2 Performance Optimization)
// [PERF-STAGE1] Added local timer to eliminate global re-renders
const DasherCard = React.memo(
  ({
    dasher,
    bucketType,
    index,
    isSelected,
    isCollapsed,
    isEditing,
    isEditMode,
    cardRecentlyMoved,
    movedNote,
    identityFallback,
    // Handlers
    onToggleSelect,
    onToggleCollapse,
    onStartTimer,
    onResetTimer,
    onToggleEdit,
    onCashOut,
    onDelete,
    onDraftCommit,   // [PERF-STAGE4] parent commit hook
    // Render functions
    getDasherTitle,
    renderMoveButtons,
    renderDasherDetails,
    // Data arrays for renderDasherDetails
    dashersArray,
    setDashersArray,
    saveAllToLocalStorage,
    copyToClipboard,
    deriveDasherIdentity,
    getDasherAnchorId,
    parseBalanceValue,
    // Balance editing props
    editingBalanceValue,
    setEditingBalanceValue,
    // [PERF-FIX2] Tab visibility for pausing timers in background
    isTabVisible = true,
  }) => {
    // [PERF-STAGE7] Log render count for profiling
    useEffect(() => {
      dasherCardRenderCounter++;
      if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
        console.debug(`[Render ${dasherCardRenderCounter}] DasherCard ${dasher?.id}`);
      }
    });

    // [PERF-STAGE1] Local timer - tick only when card is expanded and tab is visible
    const [localTick, setLocalTick] = useState(0);

    // [PERF-STAGE4] local draft copy of dasher fields that are editable
    const [draft, setDraft] = useState(() => ({
      name: dasher?.name ?? "",
      email: dasher?.email ?? "",
      balance: dasher?.balance ?? "",
      notes: Array.isArray(dasher?.notes) ? dasher.notes.join("\n") : (dasher?.notes ?? ""),
    }));

    // keep draft in sync when the card switches to a different dasher id
    useEffect(() => {
      setDraft({
        name: dasher?.name ?? "",
        email: dasher?.email ?? "",
        balance: dasher?.balance ?? "",
        notes: Array.isArray(dasher?.notes) ? dasher.notes.join("\n") : (dasher?.notes ?? ""),
      });
    }, [dasher?.id]); // only when identity changes

    // [PERF-FIX2] Timer ticks only when card is expanded and tab is visible
    // Elapsed time remains accurate because it is derived from lastUsed timestamp
    useEffect(() => {
      if (isCollapsed || !isTabVisible) return; // Skip ticks when collapsed or tab hidden
      const id = setInterval(() => setLocalTick(t => t + 1), 1000);
      return () => clearInterval(id);
    }, [isCollapsed, isTabVisible]);

    const dasherTitle = getDasherTitle(dasher, localTick);
    const anchorIdentity = deriveDasherIdentity(dasher, identityFallback);
    const anchorId = getDasherAnchorId(anchorIdentity);

    // [PERF-STAGE4] local edit helpers
    const setField = useCallback((k, v) => {
      setDraft(prev => (prev[k] === v ? prev : { ...prev, [k]: v }));
    }, []);

    const commit = useCallback(() => {
      onDraftCommit?.(dasher?.id, {
        ...draft,
        // normalize notes back to array if parent expects it
        notes: typeof draft.notes === "string" ? draft.notes.split("\n").filter(Boolean) : draft.notes,
      });
    }, [onDraftCommit, dasher?.id, draft]);

    const cancel = useCallback(() => {
      setDraft({
        name: dasher?.name ?? "",
        email: dasher?.email ?? "",
        balance: dasher?.balance ?? "",
        notes: Array.isArray(dasher?.notes) ? dasher.notes.join("\n") : (dasher?.notes ?? ""),
      });
    }, [dasher?.id, dasher?.name, dasher?.email, dasher?.balance, dasher?.notes]);

    return (
      <div
        key={dasher.id}
        className={`bg-gray-600/50 rounded-lg overflow-hidden border border-gray-500/30 transition-opacity ${cardRecentlyMoved ? "ring-2 ring-amber-400/80 animate-pulse" : ""}`}
        id={anchorId || undefined}
        data-dasher-anchor={anchorIdentity || undefined}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-3">
          <div className="flex items-center gap-2 flex-1">
            {isEditMode && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onToggleSelect}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 text-gray-300 bg-gray-700 border-gray-500 rounded focus:ring-gray-400 focus:ring-2"
                aria-label={`Select ${dasher?.name || 'dasher'} for batch operations`}
              />
            )}
            <div
              className={`${isEditing ? "text-gray-700 cursor-not-allowed" : "text-gray-400 hover:text-gray-300 cursor-move"}`}
              aria-label="Drag to reorder"
              style={{
                pointerEvents: isEditing ? "none" : "auto",
              }}
            >
              <GripVertical size={14} />
            </div>
            <button
              onClick={onToggleCollapse}
              className="flex items-center gap-2 flex-1 text-left"
            >
              {isCollapsed ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronUp size={14} />
              )}
              <div className="flex-1 min-w-0">
                <h5 className="font-medium text-sm flex items-center gap-2 truncate">
                  {dasherTitle}
                  <span
                    className="flag-badges"
                    aria-label="Dasher status flags (Crimson, Red Card, Appealed, FastPay)"
                  >
                    <span
                      className="flag-badge"
                      data-flag="C"
                      data-active={dasher.crimson ? "true" : "false"}
                      data-selected={
                        (dasher.selectedCashout || "").toLowerCase() ===
                          "crimson"
                          ? "true"
                          : "false"
                      }
                    >
                      CRIMSON
                    </span>
                    <span
                      className="flag-badge"
                      data-flag="FP"
                      data-active={dasher.fastPay ? "true" : "false"}
                      data-selected={
                        (dasher.selectedCashout || "").toLowerCase() ===
                          "fastpay"
                          ? "true"
                          : "false"
                      }
                      title={
                        dasher.fastPay
                          ? dasher.fastPayInfo
                            ? `FastPay: ${dasher.fastPayInfo}`
                            : "FastPay active"
                          : "FastPay inactive"
                      }
                    >
                      FastPay
                    </span>
                    <span
                      className="flag-badge"
                      data-flag="RC"
                      data-active={dasher.redCard ? "true" : "false"}
                    >
                      RED CARD
                    </span>
                    <span
                      className="flag-badge"
                      data-flag="AP"
                      data-active={dasher.appealed ? "true" : "false"}
                    >
                      APPEALED
                    </span>
                  </span>
                </h5>
                {movedNote && (
                  <div className="text-[11px] text-amber-300/80 mt-0.5">
                    {movedNote}
                  </div>
                )}
              </div>
            </button>
          </div>
          <div className="flex items-center gap-2">
            {renderMoveButtons(bucketType, dasher.id)}
            <div className="flex items-center gap-1">
              <button
                onClick={onStartTimer}
                className="icon-btn text-purple-400 hover:text-purple-300"
                title="Start 24hr timer"
                aria-label="Start 24 hour timer"
              >
                <Timer size={14} />
              </button>
              <button
                onClick={onResetTimer}
                className="icon-btn text-orange-400 hover:text-orange-300"
                title="Reset timer"
                aria-label="Reset timer"
              >
                <TimerOff size={14} />
              </button>
              <button
                onClick={onToggleEdit}
                className={`icon-btn ${isEditing ? "text-green-400 hover:text-green-300" : "text-yellow-400 hover:text-yellow-300"}`}
                title={isEditing ? "Save" : "Edit"}
                aria-label={isEditing ? "Save dasher" : "Edit dasher"}
              >
                {isEditing ? <Check size={14} /> : <Edit2 size={14} />}
              </button>
              {parseBalanceValue(dasher.balance) > 0 && (
                <button
                  onClick={onCashOut}
                  className="icon-btn text-green-300 hover:text-green-200"
                  title="Cash Out"
                  aria-label="Cash out balance"
                >
                  <Banknote size={16} />
                </button>
              )}
              <button
                onClick={onDelete}
                className="icon-btn text-red-400 hover:text-red-300"
                title="Delete"
                aria-label="Delete dasher"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
        {/* Details */}
        {!isCollapsed && (
          <div className="space-y-2 p-3 pt-0 border-t border-gray-600/30">
            {renderDasherDetails(
              dasher,
              dashersArray,
              setDashersArray,
              saveAllToLocalStorage,
              copyToClipboard,
              null,
              isEditing,
              bucketType,
              editingBalanceValue,
              setEditingBalanceValue,
            )}
          </div>
        )}
      </div>
    );
  },
  // v1.10.0: Simplified memo - uses object reference check for dasher instead of
  // individual property comparison. UI-state props checked explicitly.
  // Previous approach had brittle hardcoded property list that could miss new dasher fields.
  // v1.11.2: Added editingBalanceValue check to fix balance input field UX bug
  (prevProps, nextProps) => {
    if (!prevProps || !nextProps) return false;
    // Same dasher object reference = no re-render needed
    if (prevProps.dasher === nextProps.dasher &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.isCollapsed === nextProps.isCollapsed &&
      prevProps.isEditing === nextProps.isEditing &&
      prevProps.isEditMode === nextProps.isEditMode &&
      prevProps.cardRecentlyMoved === nextProps.cardRecentlyMoved &&
      prevProps.editingBalanceValue === nextProps.editingBalanceValue) {
      return true;
    }
    return false; // Different props = re-render
  },
);

// =========================================================================
// [PERSISTENCE-FIX] IndexedDB Singleton for Backup Storage
// =========================================================================
const IDB_NAME = 'DashBashDB';
const IDB_STORE = 'appState';
const IDB_VERSION = 1;
const CURRENT_SCHEMA_VERSION = 5;

// Singleton connection - persists across re-renders
let idbInstance = null;
let idbPromise = null;

function getIDB() {
  if (idbInstance) return Promise.resolve(idbInstance);
  if (idbPromise) return idbPromise;

  idbPromise = new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(IDB_NAME, IDB_VERSION);
      request.onerror = () => {
        idbPromise = null;
        console.warn('[IDB] Failed to open database:', request.error);
        reject(request.error);
      };
      request.onsuccess = () => {
        idbInstance = request.result;
        // Handle connection closing unexpectedly
        idbInstance.onclose = () => {
          idbInstance = null;
          idbPromise = null;
        };
        resolve(idbInstance);
      };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
    } catch (err) {
      idbPromise = null;
      console.warn('[IDB] IndexedDB not available:', err);
      reject(err);
    }
  });

  return idbPromise;
}

async function saveToIDB(key, value) {
  try {
    const db = await getIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(value, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[IDB] Save failed:', err);
    return false;
  }
}

async function loadFromIDB(key) {
  try {
    const db = await getIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const request = tx.objectStore(IDB_STORE).get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('[IDB] Load failed:', err);
    return null;
  }
}
// =========================================================================

const EnhancedCalculator = () => {
  // ======================== UNDO SYSTEM CONSTANTS ========================
  const UNDO_TYPES = {
    // Dasher actions
    DASHER_MOVE: 'DASHER_MOVE',
    DASHER_DELETE: 'DASHER_DELETE',
    DASHER_EDIT_FIELD: 'DASHER_EDIT_FIELD',
    DASHER_EDIT_BALANCE: 'DASHER_EDIT_BALANCE',
    DASHER_CASH_OUT: 'DASHER_CASH_OUT',
    DASHER_TOGGLE_FLAG: 'DASHER_TOGGLE_FLAG',
    DASHER_BULK_MOVE: 'DASHER_BULK_MOVE',

    // Category actions (Dasher categories)
    DASHER_CATEGORY_ADD: 'DASHER_CATEGORY_ADD',
    DASHER_CATEGORY_DELETE: 'DASHER_CATEGORY_DELETE',
    DASHER_CATEGORY_RENAME: 'DASHER_CATEGORY_RENAME',
    DASHER_CATEGORY_REORDER: 'DASHER_CATEGORY_REORDER',

    // Message actions
    MESSAGE_ADD: 'MESSAGE_ADD',
    MESSAGE_DELETE: 'MESSAGE_DELETE',
    MESSAGE_EDIT: 'MESSAGE_EDIT',
    MESSAGE_REORDER: 'MESSAGE_REORDER',

    // Store Category actions
    STORE_CATEGORY_ADD: 'STORE_CATEGORY_ADD',
    STORE_CATEGORY_DELETE: 'STORE_CATEGORY_DELETE',
    STORE_CATEGORY_RENAME: 'STORE_CATEGORY_RENAME',

    // Store actions
    STORE_ADD: 'STORE_ADD',
    STORE_DELETE: 'STORE_DELETE',
    STORE_EDIT_FIELD: 'STORE_EDIT_FIELD',
    STORE_REORDER: 'STORE_REORDER',

    // Note Category actions
    NOTE_CATEGORY_ADD: 'NOTE_CATEGORY_ADD',
    NOTE_CATEGORY_DELETE: 'NOTE_CATEGORY_DELETE',
    NOTE_CATEGORY_RENAME: 'NOTE_CATEGORY_RENAME',

    // Note actions
    NOTE_ADD: 'NOTE_ADD',
    NOTE_DELETE: 'NOTE_DELETE',
    NOTE_EDIT: 'NOTE_EDIT',
    NOTE_REORDER: 'NOTE_REORDER',
  };

  // Import gate (v1.9.5): Prevents re-renders, localStorage writes, and timer updates during import
  const [isImporting, setIsImporting] = useState(false);

  // [PERSISTENCE-FIX] Track save state for emergency handlers and visual feedback
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [localStorageDisabled, setLocalStorageDisabled] = useState(false);

  const [target, setTarget] = useState("99");
  const [targetPreset, setTargetPreset] = useState("99"); // '99', '120', or 'custom'
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [customTarget, setCustomTarget] = useState("");
  const [prices, setPrices] = useState([]);
  const [currentPrice, setCurrentPrice] = useState("");
  const priceInputRef = useRef(null);

  // [PERF-FIX2] Tab visibility state - pause timers in background tabs
  const [isTabVisible, setIsTabVisible] = useState(!document.hidden);

  // [FIX-B] Confirm Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: "",
    title: "Confirm",
    onConfirm: null,
    onCancel: null,
    confirmText: "Confirm",
    cancelText: "Cancel",
  });

  // [FIX-B] Show confirm dialog with custom callback
  const showConfirm = useCallback((message, onConfirm, options = {}) => {
    setConfirmModal({
      isOpen: true,
      message,
      title: options.title || "Confirm",
      onConfirm,
      onCancel: options.onCancel || null,
      confirmText: options.confirmText || "Confirm",
      cancelText: options.cancelText || "Cancel",
    });
  }, []);

  // [FIX-B] Handle confirm action - use functional update to avoid stale closure
  const handleConfirmAction = useCallback(() => {
    setConfirmModal((prev) => {
      if (prev.onConfirm) {
        try {
          prev.onConfirm();
        } catch (error) {
          console.error('[MODAL] Confirm callback error:', error);
          // Modal still closes to prevent UI lock
        }
      }
      return { ...prev, isOpen: false };
    });
  }, []); // Empty deps - never recreates

  // [FIX-B] Handle cancel action - use functional update to avoid stale closure
  const handleCancelAction = useCallback(() => {
    setConfirmModal((prev) => {
      if (prev.onCancel) {
        try {
          prev.onCancel();
        } catch (error) {
          console.error('[MODAL] Cancel callback error:', error);
          // Modal still closes to prevent UI lock
        }
      }
      return { ...prev, isOpen: false };
    });
  }, []); // Empty deps - never recreates

  // [FIX-B] Escape key handler for modal accessibility (WCAG compliance)
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && confirmModal.isOpen) {
        handleCancelAction();
      }
    };
    if (confirmModal.isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [confirmModal.isOpen, handleCancelAction]);

  // Collapsible sections state
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false); // Collapsed by default
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isAddressBookOpen, setIsAddressBookOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isStatisticsOpen, setIsStatisticsOpen] = useState(false);
  // Cash-outs quick filters (Statistics)
  const [cashFilterMethod, setCashFilterMethod] = useState(""); // '' => All (session-scoped; avoid persisting stale filters)
  const [cashFilterCategory, setCashFilterCategory] = useState(""); // '' => All (session scoped)
  const [cashFilterDasher, setCashFilterDasher] = useState(""); // substring (session scoped)
  const [isStateManagementOpen, setIsStateManagementOpen] =
    useState(false);
  // Earnings quick-add (Statistics)
  const [statEarningTargetKey, setStatEarningTargetKey] = useState("");
  const [statEarningAmount, setStatEarningAmount] = useState("");
  const [statEarningSource, setStatEarningSource] = useState("");
  const [statEarningNotes, setStatEarningNotes] = useState("");
  const [statEarningApply, setStatEarningApply] = useState(true);
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [collapsedStores, setCollapsedStores] = useState({});
  const [collapsedDashers, setCollapsedDashers] = useState({});
  const [collapsedArchivedDashers, setCollapsedArchivedDashers] =
    useState({});

  // Edit Mode and Selection state
  const [isEditMode, setIsEditMode] = useState(false);
  const [showNonZeroOnly, setShowNonZeroOnly] = useState(false); // Balance filter toggle
  const [dasherSort, setDasherSort] = useState({
    key: "none",
    dir: "desc",
  }); // key: none|balance|lastUsed|alphabetical
  // Global Dashers Management controls
  const [globalQuery, setGlobalQuery] = useState("");
  const globalQueryDebouncedRef = useRef("");
  useEffect(() => {
    const h = setTimeout(() => {
      globalQueryDebouncedRef.current = globalQuery;
    }, 150);
    return () => clearTimeout(h);
  }, [globalQuery]);
  const [storeQuery, setStoreQuery] = useState("");
  const [storeQueryDebounced, setStoreQueryDebounced] = useState("");
  useEffect(() => {
    const handle = setTimeout(() => {
      setStoreQueryDebounced(storeQuery.trim().toLowerCase());
    }, 150);
    return () => clearTimeout(handle);
  }, [storeQuery]);
  const [selectedItems, setSelectedItems] = useState({
    dashers: new Set(), // dasher IDs
    dasherCategories: new Set(), // dasher category IDs
    notes: new Set(), // note IDs (categoryId-noteIndex)
    noteCategories: new Set(), // note category IDs
    stores: new Set(), // store IDs
    storeCategories: new Set(), // store category IDs (address book)
    messages: new Set(), // message indices
    archivedDashers: new Set(), // archived dasher IDs
    readyDashers: new Set(), // ready dasher IDs
    currentlyUsingDashers: new Set(), // currently using dasher IDs
    appealedDashers: new Set(), // appealed dasher IDs
    deactivatedDashers: new Set(), // deactivated dasher IDs
    lockedDashers: new Set(), // locked dasher IDs
    appliedPendingDashers: new Set(), // applied pending dasher IDs
    reverifDashers: new Set(), // reverif dasher IDs
  });

  // Global keyboard: Enter exits Edit Mode when not typing in an input/textarea/contenteditable
  useEffect(() => {
    const onKeyDown = (e) => {
      const tag =
        e.target && e.target.tagName
          ? e.target.tagName.toLowerCase()
          : "";
      const isTyping =
        tag === "input" ||
        tag === "textarea" ||
        (e.target && e.target.isContentEditable);
      if (isTyping) return;
      if (e.key === "Enter" && isEditMode) {
        setIsEditMode(false);
        requestPersist();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isEditMode]);

  // State management
  const [availableExports, setAvailableExports] = useState([]);
  const [importNotification, setImportNotification] = useState("");

  // Quick messages state
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editText, setEditText] = useState("");
  const [draggedIndex, setDraggedIndex] = useState(-1);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newMessageText, setNewMessageText] = useState("");
  const [copyNotification, setCopyNotification] = useState("");
  // Undo notification state: { message: string, undoId: string } | null
  const [undoNotification, setUndoNotification] = useState(null);
  const [messages, setMessages] = useState([
    "hi can u pls see if u can help get a dasher assigned quicker!? I'm in a rush to get to work asap! Thank you",
    "Ok someone got it! darn it i just noticed i put the tip so high by accident :( can u help change the tip to $0 pls?",
    "Thanks, have a great day! <3",
    "Yes",
    "unassign this driver, we have had issues in the past, restraining order, stole my order last time, ASAP PLEASE, Thank you!",
    "Adjust dasher tip to $0 for the current order",
    "customer asked for refund if out of stock",
    "Got 1⚡",
    "canceled ❌❌❌",
    "looking for offer 👀",
    "Got 2nd⚡⚡",
    "Got 2nd⚡⚡  Arrived, pls lmk when removed. 🦆🦆🦆",
    "AGENT",
    "It applies to the other order as well! Cancel the other order I am on as well, please.  🤗",
    "Got 1, waiting on 2nd 🤗🤗🤗",
    "Yes I see the 3 dots but when i click it it says as everything is unavailable I need to contact support for it to be cancelled",
    "Hello 👋 the stores oven is broken",
  ]);

  // Address Book state
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: "Dollar General",
      stores: [
        {
          id: 1,
          address: "840 North Main St., Beaver, UT 84713",
          openTime: "",
          closeTime: "",
          notes: "",
        },
      ],
    },
    {
      id: 2,
      name: "Tractor Supply Co.",
      stores: [
        {
          id: 201,
          address: "456 Farm Road, Rural Town, TX 75001",
          openTime: "07:00",
          closeTime: "21:00",
          notes: "Farm supplies and equipment",
        },
      ],
    },
  ]);
  const [editingCategory, setEditingCategory] = useState(-1);
  const [editingDasherCategory, setEditingDasherCategory] = useState(-1);
  const [editingNoteCategory, setEditingNoteCategory] = useState(-1);
  const [editingStore, setEditingStore] = useState({
    categoryId: -1,
    storeId: -1,
  });
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [draggedCategory, setDraggedCategory] = useState(-1);
  const [draggedStore, setDraggedStore] = useState({
    categoryId: -1,
    storeId: -1,
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [saveNotification, setSaveNotification] = useState("");
  const storeSearchActive = storeQueryDebounced.length > 0;
  const totalStoresCount = useMemo(
    () =>
      categories.reduce(
        (sum, cat) => sum + ensureArray(cat?.stores).length,
        0,
      ),
    [categories],
  );

  // Address Book helper function - extract city and state from address
  const extractCityState = (address) => {
    if (!address) return "";

    // Split by comma and trim spaces
    const parts = address.split(",").map((part) => part.trim());

    if (parts.length >= 3) {
      // Format: "Street, City, State ZIP"
      const city = parts[1];
      const stateZip = parts[2];
      // Extract state (first word before ZIP)
      const state = stateZip.split(" ")[0];
      return `${city}, ${state}`;
    } else if (parts.length === 2) {
      // Format: "Street, City State"
      const cityState = parts[1];
      return cityState;
    }

    return "";
  };

  const buildStoreSearchText = useCallback((category, store) => {
    const segments = [];
    const visit = (value) => {
      if (value === null || value === undefined) return;
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed) segments.push(trimmed);
        return;
      }
      if (typeof value === "number" || typeof value === "bigint") {
        segments.push(String(value));
        return;
      }
      if (Array.isArray(value)) {
        value.forEach(visit);
        return;
      }
      if (typeof value === "object") {
        Object.values(value).forEach(visit);
      }
    };

    visit(category?.name ?? "");
    visit(store);
    const cityState = extractCityState(store?.address);
    if (cityState) segments.push(cityState);

    return segments.join(" ").toLowerCase();
  }, []);

  // [FIX-A] Pre-compute search text for all stores when categories change
  const categoriesWithSearchText = useMemo(() => {
    return categories.map((category) => ({
      ...category,
      stores: ensureArray(category?.stores).map((store) => ({
        ...store,
        _searchText: buildStoreSearchText(category, store),
      })),
    }));
  }, [categories, buildStoreSearchText]);

  // [FIX-A] Filter using pre-computed search text (faster than rebuilding on each keystroke)
  const filteredStoreCategories = useMemo(() => {
    if (!storeSearchActive) return categoriesWithSearchText;
    return categoriesWithSearchText
      .map((category) => {
        const stores = category.stores.filter((store) =>
          store._searchText.includes(storeQueryDebounced),
        );
        if (stores.length === 0) return null;
        return { ...category, stores };
      })
      .filter(Boolean);
  }, [
    categoriesWithSearchText,
    storeSearchActive,
    storeQueryDebounced,
  ]);
  const visibleStoreCategories = storeSearchActive
    ? filteredStoreCategories
    : categories;
  const visibleStoresCount = useMemo(
    () =>
      storeSearchActive
        ? filteredStoreCategories.reduce(
          (sum, cat) => sum + ensureArray(cat?.stores).length,
          0,
        )
        : totalStoresCount,
    [storeSearchActive, filteredStoreCategories, totalStoresCount],
  );

  // Notes state
  const [noteCategories, setNoteCategories] = useState(() => {
    // Try to load from localStorage first
    const savedState = localStorage.getItem("dashBashState");
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state.noteCategories) {
          return state.noteCategories;
        }
      } catch (e) {
        console.error(
          "Error loading noteCategories from localStorage:",
          e,
        );
      }
    }

    // Only use defaults if no saved state exists
    return [
      {
        id: Date.now().toString(),
        name: "General",
        notes: [
          "Welcome to Dash Bash! This is a sample note. You can edit, copy, or delete it. Try adding your own notes!",
        ],
      },
    ];
  });
  const [editingNote, setEditingNote] = useState({
    categoryId: "",
    noteIndex: -1,
  });
  const [draggedNote, setDraggedNote] = useState({
    categoryId: "",
    noteIndex: -1,
  });
  const [collapsedNoteCategories, setCollapsedNoteCategories] = useState(
    {},
  );

  // Dashers state
  const [isDashersOpen, setIsDashersOpen] = useState(false);
  const [isDeactivatedDashersOpen, setIsDeactivatedDashersOpen] =
    useState(false);
  const [isReadyDashersOpen, setIsReadyDashersOpen] = useState(false);
  const [isCurrentlyUsingDashersOpen, setIsCurrentlyUsingDashersOpen] =
    useState(false);
  const [isAppealedDashersOpen, setIsAppealedDashersOpen] =
    useState(false);
  const [isArchivedDashersOpen, setIsArchivedDashersOpen] =
    useState(false);
  const [archivedDashers, setArchivedDashers] = useState(() => {
    // Try to load from localStorage first
    const savedState = localStorage.getItem("dashBashState");
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state.archivedDashers) {
          return state.archivedDashers;
        }
      } catch (e) {
        console.error(
          "Error loading archivedDashers from localStorage:",
          e,
        );
      }
    }
    return [];
  });
  const [deactivatedDashers, setDeactivatedDashers] = useState(() => {
    const savedState = localStorage.getItem("dashBashState");
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state.deactivatedDashers) {
          return state.deactivatedDashers;
        }
      } catch (e) {
        console.error(
          "Error loading deactivatedDashers from localStorage:",
          e,
        );
      }
    }
    return [];
  });
  const [readyDashers, setReadyDashers] = useState(() => {
    const savedState = localStorage.getItem("dashBashState");
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state.readyDashers) {
          return state.readyDashers;
        }
      } catch (e) {
        console.error("Error loading readyDashers from localStorage:", e);
      }
    }
    return [];
  });
  const [currentlyUsingDashers, setCurrentlyUsingDashers] = useState(
    () => {
      const savedState = localStorage.getItem("dashBashState");
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          if (state.currentlyUsingDashers) {
            return state.currentlyUsingDashers;
          }
        } catch (e) {
          console.error(
            "Error loading currentlyUsingDashers from localStorage:",
            e,
          );
        }
      }
      return [];
    },
  );
  const [appealedDashers, setAppealedDashers] = useState(() => {
    const savedState = localStorage.getItem("dashBashState");
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state.appealedDashers) {
          return state.appealedDashers;
        }
      } catch (e) {
        console.error(
          "Error loading appealedDashers from localStorage:",
          e,
        );
      }
    }
    return [];
  });
  const [lockedDashers, setLockedDashers] = useState(() => {
    const savedState = localStorage.getItem("dashBashState");
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state.lockedDashers) {
          return state.lockedDashers;
        }
      } catch (e) {
        console.error(
          "Error loading lockedDashers from localStorage:",
          e,
        );
      }
    }
    return [];
  });
  const [appliedPendingDashers, setAppliedPendingDashers] = useState(
    () => {
      const savedState = localStorage.getItem("dashBashState");
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          if (state.appliedPendingDashers) {
            return state.appliedPendingDashers;
          }
        } catch (e) {
          console.error(
            "Error loading appliedPendingDashers from localStorage:",
            e,
          );
        }
      }
      return [];
    },
  );
  const [reverifDashers, setReverifDashers] = useState(() => {
    const savedState = localStorage.getItem("dashBashState");
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (Array.isArray(state.reverifDashers)) {
          return state.reverifDashers;
        }
        const legacyReverif = state?.dasherCategories?.find?.(
          (cat) => cat && cat.id === "reverif",
        );
        if (legacyReverif && Array.isArray(legacyReverif.dashers)) {
          return legacyReverif.dashers;
        }
      } catch (e) {
        console.error(
          "Error loading reverifDashers from localStorage:",
          e,
        );
      }
    }
    return [];
  });
  const [isReverifDashersOpen, setIsReverifDashersOpen] = useState(false);
  const [collapsedReverifDashers, setCollapsedReverifDashers] = useState(
    {},
  );
  const [isLockedDashersOpen, setIsLockedDashersOpen] = useState(false);
  const [isAppliedPendingDashersOpen, setIsAppliedPendingDashersOpen] =
    useState(false);
  const [collapsedLockedDashers, setCollapsedLockedDashers] = useState(
    {},
  );
  const [
    collapsedAppliedPendingDashers,
    setCollapsedAppliedPendingDashers,
  ] = useState({});
  // Collapsed note views (per item)
  const [collapsedDasherNotes, setCollapsedDasherNotes] = useState({}); // { [dasherId]: boolean }
  const [collapsedStoreNotes, setCollapsedStoreNotes] = useState({}); // { [`${categoryId}-${storeId}`]: boolean }
  const [collapsedCashOutNotes, setCollapsedCashOutNotes] = useState({}); // { [dasherId]: boolean }
  const [collapsedCategoryNotes, setCollapsedCategoryNotes] = useState(
    {},
  ); // { [`${categoryId}-${noteIndex}`]: boolean }
  const [collapsedDeactivatedDashers, setCollapsedDeactivatedDashers] =
    useState({});
  // NEW: Add parity maps for buckets that were missing them
  const [collapsedReadyDashers, setCollapsedReadyDashers] = useState({});
  const [
    collapsedCurrentlyUsingDashers,
    setCollapsedCurrentlyUsingDashers,
  ] = useState({});
  const [collapsedAppealedDashers, setCollapsedAppealedDashers] =
    useState({});
  // Lightweight render-ready flags to show a spinner right away on open
  const [dashersRenderReady, setDashersRenderReady] = useState(false);
  const [readyRenderReady, setReadyRenderReady] = useState(false);
  const [usingRenderReady, setUsingRenderReady] = useState(false);
  const [appealedRenderReady, setAppealedRenderReady] = useState(false);
  const [appliedRenderReady, setAppliedRenderReady] = useState(false);
  const [reverifRenderReady, setReverifRenderReady] = useState(false);
  const [lockedRenderReady, setLockedRenderReady] = useState(false);
  const [deactivatedRenderReady, setDeactivatedRenderReady] =
    useState(false);
  const [archivedRenderReady, setArchivedRenderReady] = useState(false);
  // Draft state for inline editors (e.g., cash-out add row)
  // Per-dasher draft state (keyed by a stable scope key per card)
  const [dashersDraft, setDashersDraft] = useState({});
  const getDraftForKey = (key) => dashersDraft[key] || {};
  const setDraftForKey = (key, updater) => {
    setDashersDraft((prev) => {
      const current = prev[key] || {};
      const next =
        typeof updater === "function" ? updater(current) : updater;
      return { ...prev, [key]: next };
    });
  };
  const [dasherCategories, setDasherCategories] = useState(() => {
    // Try to load from localStorage first
    const savedState = localStorage.getItem("dashBashState");
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state.dasherCategories) {
          return state.dasherCategories;
        }
      } catch (e) {
        console.error(
          "Error loading dasherCategories from localStorage:",
          e,
        );
      }
    }

    // Only use defaults if no saved state exists
    return [
      {
        id: "main",
        name: "Main",
        dashers: [
          {
            id: "test-dasher-" + Date.now(),
            name: "Test Dasher",
            email: "test@example.com",
            emailPw: "password123",
            dasherPw: "dasher456",
            phone: "555-0123",
            balance: "$50.00",
            crimson: false,
            redCard: false,
            appealed: false,
            appealedAt: null,
            crimsonAt: null,
            redCardAt: null,
            fastPay: false,
            fastPayInfo: "",
            crimsonInfo: "",
            selectedCashout: "",
            deactivated: false,
            lastUsed: null,
            notes:
              "This is a sample dasher for testing. Feel free to edit or delete!",
          },
        ],
      },
      { id: "currently-using", name: "Currently using", dashers: [] },
      // Removed inline 'deactivated' category; handled as separate top-level list now
      { id: "locked", name: "Locked", dashers: [] },
      { id: "reverif", name: "Reverif", dashers: [] },
      {
        id: "ready",
        name: "Ready",
        dashers: [
          {
            id: "version-test-dasher",
            name: "Version Test Dasher",
            email: "test@version.check",
            crimson: false,
            redCard: false,
            crimsonAt: null,
            redCardAt: null,
            fastPay: false,
            fastPayInfo: "",
            crimsonInfo: "",
            selectedCashout: "",
            lastUsed: null,
            notes:
              "TEST DASHER - Added to verify GitHub Pages deployment",
          },
        ],
      },
    ];
  });
  const [editingDasher, setEditingDasher] = useState({
    categoryId: null,
    dasherId: null,
    name: "",
    email: "",
    balance: 0,
    notes: "",
  });

  // Track the balance value during editing separately to prevent formatting during typing
  const [editingBalanceValue, setEditingBalanceValue] = useState("");
  const [draggedDasher, setDraggedDasher] = useState({
    categoryId: "",
    dasherIndex: -1,
  });
  const [draggedDasherCategory, setDraggedDasherCategory] =
    useState(null);
  const [collapsedDasherCategories, setCollapsedDasherCategories] =
    useState({});
  // [PERF-STAGE1] Global timers disabled - moved to local DasherCard state
  // const [timerTick, setTimerTick] = useState(0);
  // Dual-speed timer system (Phase 3): fast updates for critical dashers, slow for others
  // const [slowTimerTick, setSlowTimerTick] = useState(0);

  // Track visible dashers for performance optimization (Phase 2.1)
  const [visibleDasherIds, setVisibleDasherIds] = useState(new Set());

  // Import transition for non-blocking state updates (v1.9.4)
  const [isImportPending, startImportTransition] = useTransition();

  // Web Worker for async JSON parsing (v1.9.5)
  const importWorkerRef = useRef(null);

  // Universal undo stack (max 10 entries, FIFO)
  const undoStack = React.useRef([]);
  const saveDebouncedRef = React.useRef(null);
  const saveNotificationTimeoutRef = React.useRef(null);
  const moveToastActiveRef = React.useRef(false);

  // [PERSISTENCE-FIX] Save coordination refs - prevents race conditions
  const saveInFlightRef = React.useRef(false);
  const pendingSaveRef = React.useRef(false);
  const saveVersionRef = React.useRef(0);

  const DEV =
    typeof window !== "undefined" &&
    window?.location &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "" ||
      window.location.protocol === "file:");

  const [recentlyMoved, setRecentlyMoved] = useState(() => new Set());
  const recentlyMovedTimersRef = useRef(new Map());
  const [moveDebug, setMoveDebug] = useState(null);

  // ======================== UNDO SYSTEM FUNCTIONS ========================

  /**
   * Helper: Find dasher by ID across all buckets and categories (undo system)
   * @param {string} dasherId - The dasher ID to find
   * @param {string} categoryKey - Optional bucket/category key to search in
   * @returns {object|null} - The dasher object if found, null otherwise
   */
  const findDasherAcrossBuckets = (dasherId, categoryKey = null) => {
    if (categoryKey === 'main') {
      // Search in Main categories
      for (const cat of dasherCategories) {
        const dasher = cat.dashers?.find(d => d.id === dasherId);
        if (dasher) return { dasher, categoryId: cat.id, categoryKey: 'main' };
      }
    } else if (categoryKey) {
      // Search in specific bucket
      const bucketMap = {
        'ready': readyDashers,
        'currently-using': currentlyUsingDashers,
        'appealed': appealedDashers,
        'applied-pending': appliedPendingDashers,
        'reverif': reverifDashers,
        'locked': lockedDashers,
        'deactivated': deactivatedDashers,
        'archived': archivedDashers,
      };
      const dashers = bucketMap[categoryKey] || [];
      const dasher = dashers.find(d => d.id === dasherId);
      if (dasher) return { dasher, categoryKey };
    } else {
      // Search everywhere
      const result = findDasherAcrossBuckets(dasherId, 'main');
      if (result) return result;
      
      const buckets = ['ready', 'currently-using', 'appealed', 'applied-pending', 
                       'reverif', 'locked', 'deactivated', 'archived'];
      for (const bucket of buckets) {
        const result = findDasherAcrossBuckets(dasherId, bucket);
        if (result) return result;
      }
    }
    return null;
  };

  /**
   * Record an undo action
   * @param {string} type - Action type from UNDO_TYPES
   * @param {object} beforeState - State needed to restore
   * @param {string} description - Human-readable description
   */
  const recordUndo = (type, beforeState, description) => {
    // Skip during imports
    if (isImporting) return;

    // Create undo entry
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: Date.now(),
      description,
      beforeState: JSON.parse(JSON.stringify(beforeState)), // Deep clone
    };

    // Add to stack (max 10, FIFO)
    undoStack.current = [entry, ...undoStack.current].slice(0, 10);

    // Show undo toast
    setUndoNotification({
      message: description,
      undoId: entry.id,
    });
  };

  /**
   * Perform undo operation
   * @param {string} undoId - ID of the undo entry to execute
   */
  const performUndo = (undoId) => {
    // Find entry by ID
    const entryIndex = undoStack.current.findIndex(e => e.id === undoId);
    if (entryIndex === -1) {
      console.warn('[UNDO] Entry not found:', undoId);
      return;
    }

    const entry = undoStack.current[entryIndex];

    // Execute restoration based on type
    try {
      switch (entry.type) {
        case UNDO_TYPES.DASHER_MOVE:
          restoreDasherMove(entry.beforeState);
          break;
        case UNDO_TYPES.DASHER_DELETE:
          restoreDasherDelete(entry.beforeState);
          break;
        case UNDO_TYPES.DASHER_EDIT_BALANCE:
          restoreDasherBalance(entry.beforeState);
          break;
        case UNDO_TYPES.DASHER_EDIT_FIELD:
          restoreDasherField(entry.beforeState);
          break;
        case UNDO_TYPES.DASHER_CASH_OUT:
          restoreDasherCashOut(entry.beforeState);
          break;
        case UNDO_TYPES.DASHER_TOGGLE_FLAG:
          restoreDasherFlag(entry.beforeState);
          break;
        case UNDO_TYPES.MESSAGE_DELETE:
          restoreMessageDelete(entry.beforeState);
          break;
        case UNDO_TYPES.MESSAGE_EDIT:
          restoreMessageEdit(entry.beforeState);
          break;
        case UNDO_TYPES.MESSAGE_REORDER:
          restoreMessageReorder(entry.beforeState);
          break;
        case UNDO_TYPES.STORE_DELETE:
          restoreStoreDelete(entry.beforeState);
          break;
        case UNDO_TYPES.STORE_EDIT_FIELD:
          restoreStoreField(entry.beforeState);
          break;
        case UNDO_TYPES.NOTE_DELETE:
          restoreNoteDelete(entry.beforeState);
          break;
        case UNDO_TYPES.NOTE_EDIT:
          restoreNoteEdit(entry.beforeState);
          break;
        case UNDO_TYPES.DASHER_CATEGORY_DELETE:
          restoreDasherCategoryDelete(entry.beforeState);
          break;
        case UNDO_TYPES.DASHER_CATEGORY_RENAME:
          restoreDasherCategoryRename(entry.beforeState);
          break;
        case UNDO_TYPES.STORE_CATEGORY_DELETE:
          restoreStoreCategoryDelete(entry.beforeState);
          break;
        case UNDO_TYPES.STORE_CATEGORY_RENAME:
          restoreStoreCategoryRename(entry.beforeState);
          break;
        case UNDO_TYPES.NOTE_CATEGORY_DELETE:
          restoreNoteCategoryDelete(entry.beforeState);
          break;
        case UNDO_TYPES.NOTE_CATEGORY_RENAME:
          restoreNoteCategoryRename(entry.beforeState);
          break;
        default:
          console.warn('[UNDO] Unknown action type:', entry.type);
          return;
      }

      // Remove from stack
      undoStack.current.splice(entryIndex, 1);

      // Hide toast and show confirmation
      setUndoNotification(null);
      setCopyNotification(`✓ Undone: ${entry.description}`);
      setTimeout(() => setCopyNotification(''), 2000);
    } catch (error) {
      console.error('[UNDO] Error performing undo:', error);
      setCopyNotification(`❌ Undo failed: ${error.message}`);
      setTimeout(() => setCopyNotification(''), 3000);
    }
  };

  /**
   * Dismiss undo notification without performing undo
   * @param {string} undoId - ID of the undo entry to dismiss
   */
  const dismissUndo = (undoId) => {
    // Remove from stack
    const entryIndex = undoStack.current.findIndex(e => e.id === undoId);
    if (entryIndex !== -1) {
      undoStack.current.splice(entryIndex, 1);
    }

    // Hide toast
    setUndoNotification(null);
  };

  // ======================== UNDO RESTORATION FUNCTIONS ========================

  const restoreDasherMove = (beforeState) => {
    const { dasherId, fromKey, toKey } = beforeState;
    // Move back to original location
    moveDasher(toKey, fromKey, dasherId);
  };

  const restoreDasherDelete = (beforeState) => {
    const { dasher, categoryKey, categoryId } = beforeState;

    // Check for ID collision
    const exists = findDasherAcrossBuckets(dasher.id, categoryKey);
    if (exists) {
      console.warn('[UNDO] Cannot restore deleted dasher: ID collision');
      return;
    }

    // Restore to original location
    if (categoryKey === 'main') {
      setDasherCategories(cats =>
        cats.map(cat =>
          cat.id === categoryId
            ? { ...cat, dashers: [...(cat.dashers || []), dasher] }
            : cat
        )
      );
    } else {
      // Handle bucket restoration
      const setterMap = {
        'ready': setReadyDashers,
        'currently-using': setCurrentlyUsingDashers,
        'appealed': setAppealedDashers,
        'applied-pending': setAppliedPendingDashers,
        'reverif': setReverifDashers,
        'locked': setLockedDashers,
        'deactivated': setDeactivatedDashers,
        'archived': setArchivedDashers,
      };
      const setter = setterMap[categoryKey];
      if (setter) {
        setter(dashers => [...dashers, dasher]);
      }
    }

    requestPersist();
  };

  const restoreDasherBalance = (beforeState) => {
    const { dasherId, oldBalance } = beforeState;
    updateDasherEverywhere(dasherId, { balance: oldBalance });
  };

  const restoreDasherField = (beforeState) => {
    const { dasherId, field, oldValue } = beforeState;
    updateDasherEverywhere(dasherId, { [field]: oldValue });
  };

  const restoreDasherCashOut = (beforeState) => {
    const { dasherId, sourceKey, amount } = beforeState;
    
    const found = findDasherAcrossBuckets(dasherId, sourceKey);
    if (!found) {
      console.warn('[UNDO] Dasher not found for cash out undo');
      return;
    }

    // Restore balance and remove cash out entry
    updateDasherEverywhere(dasherId, {
      balance: parseFloat(found.dasher.balance || 0) + amount,
      cashOutHistory: (found.dasher.cashOutHistory || []).slice(1), // Remove first entry
    });
  };

  const restoreDasherFlag = (beforeState) => {
    const { dasherId, flag, oldValue } = beforeState;
    updateDasherEverywhere(dasherId, { [flag]: oldValue });
  };

  const restoreMessageDelete = (beforeState) => {
    const { index, message } = beforeState;
    setMessages(msgs => {
      const newMsgs = [...msgs];
      newMsgs.splice(index, 0, message);
      return newMsgs;
    });
    requestPersist();
  };

  const restoreMessageEdit = (beforeState) => {
    const { index, oldText } = beforeState;
    setMessages(msgs => {
      const newMsgs = [...msgs];
      newMsgs[index] = oldText;
      return newMsgs;
    });
    requestPersist();
  };

  const restoreMessageReorder = (beforeState) => {
    const { oldOrder } = beforeState;
    setMessages(oldOrder);
    requestPersist();
  };

  const restoreStoreDelete = (beforeState) => {
    const { categoryId, store } = beforeState;
    setCategories(cats =>
      cats.map(cat =>
        cat.id === categoryId
          ? { ...cat, stores: [...(cat.stores || []), store] }
          : cat
      )
    );
    requestPersist();
  };

  const restoreStoreField = (beforeState) => {
    const { categoryId, storeId, field, oldValue } = beforeState;
    setCategories(cats =>
      cats.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              stores: cat.stores.map(store =>
                store.id === storeId
                  ? { ...store, [field]: oldValue }
                  : store
              ),
            }
          : cat
      )
    );
    requestPersist();
  };

  const restoreNoteDelete = (beforeState) => {
    const { categoryId, noteIndex, noteText } = beforeState;
    setNoteCategories(cats =>
      cats.map(cat => {
        if (cat.id === categoryId) {
          const newNotes = [...(cat.notes || [])];
          newNotes.splice(noteIndex, 0, noteText);
          return { ...cat, notes: newNotes };
        }
        return cat;
      })
    );
    requestPersist();
  };

  const restoreNoteEdit = (beforeState) => {
    const { categoryId, noteIndex, oldText } = beforeState;
    setNoteCategories(cats =>
      cats.map(cat => {
        if (cat.id === categoryId) {
          const newNotes = [...(cat.notes || [])];
          newNotes[noteIndex] = oldText;
          return { ...cat, notes: newNotes };
        }
        return cat;
      })
    );
    requestPersist();
  };

  const restoreDasherCategoryDelete = (beforeState) => {
    const { category } = beforeState;
    setDasherCategories(cats => [...cats, category]);
    requestPersist();
  };

  const restoreDasherCategoryRename = (beforeState) => {
    const { categoryId, oldName } = beforeState;
    setDasherCategories(cats =>
      cats.map(cat =>
        cat.id === categoryId
          ? { ...cat, name: oldName }
          : cat
      )
    );
    requestPersist();
  };

  const restoreStoreCategoryDelete = (beforeState) => {
    const { category } = beforeState;
    setCategories(cats => [...cats, category]);
    requestPersist();
  };

  const restoreStoreCategoryRename = (beforeState) => {
    const { categoryId, oldName } = beforeState;
    setCategories(cats =>
      cats.map(cat =>
        cat.id === categoryId
          ? { ...cat, name: oldName }
          : cat
      )
    );
    requestPersist();
  };

  const restoreNoteCategoryDelete = (beforeState) => {
    const { category } = beforeState;
    setNoteCategories(cats => [...cats, category]);
    requestPersist();
  };

  const restoreNoteCategoryRename = (beforeState) => {
    const { categoryId, oldName } = beforeState;
    setNoteCategories(cats =>
      cats.map(cat =>
        cat.id === categoryId
          ? { ...cat, name: oldName }
          : cat
      )
    );
    requestPersist();
  };

  // Load from localStorage on component mount
  useEffect(() => {
    // Try to load the new unified state first
    const savedState = localStorage.getItem("dashBashState");
    if (savedState) {
      try {
        const state = JSON.parse(savedState);

        // Load target configuration
        const savedTarget = state.target || "99";
        const savedPreset =
          state.targetPreset ||
          (savedTarget === "99" || savedTarget === "120"
            ? savedTarget
            : "custom");

        setTarget(savedTarget);
        setTargetPreset(savedPreset);
        if (savedPreset === "custom") {
          setCustomTarget(savedTarget);
        }

        // Load other state
        setPrices(state.prices || []);
        setMessages(state.messages || messages);
        setCategories(state.categories || []);
        // Load archived dashers
        if (state.archivedDashers) {
          setArchivedDashers(state.archivedDashers);
        }
        if (state.collapsedArchivedDashers) {
          setCollapsedArchivedDashers(state.collapsedArchivedDashers);
        }

        // [PERSISTENCE-FIX v1.9.8] Load ALL collapsed states on mount
        // Previously only collapsedArchivedDashers was loaded here
        if (state.collapsedCategories)
          setCollapsedCategories(state.collapsedCategories);
        if (state.collapsedStores)
          setCollapsedStores(state.collapsedStores);
        if (state.collapsedDashers)
          setCollapsedDashers(state.collapsedDashers);
        if (state.collapsedDasherCategories)
          setCollapsedDasherCategories(state.collapsedDasherCategories);
        if (state.collapsedReadyDashers)
          setCollapsedReadyDashers(state.collapsedReadyDashers);
        if (state.collapsedCurrentlyUsingDashers)
          setCollapsedCurrentlyUsingDashers(state.collapsedCurrentlyUsingDashers);
        if (state.collapsedAppealedDashers)
          setCollapsedAppealedDashers(state.collapsedAppealedDashers);
        if (state.collapsedDeactivatedDashers)
          setCollapsedDeactivatedDashers(state.collapsedDeactivatedDashers);
        if (state.collapsedReverifDashers)
          setCollapsedReverifDashers(state.collapsedReverifDashers);
        if (state.collapsedLockedDashers)
          setCollapsedLockedDashers(state.collapsedLockedDashers);
        if (state.collapsedAppliedPendingDashers)
          setCollapsedAppliedPendingDashers(state.collapsedAppliedPendingDashers);
        if (state.collapsedNoteCategories)
          setCollapsedNoteCategories(state.collapsedNoteCategories);

        // [PERSISTENCE-FIX v1.9.8] Load section open/closed states
        // [FIX v1.10.1] Also set renderReady=true for open buckets to prevent infinite spinner
        if (state.isReadyDashersOpen !== undefined) {
          setIsReadyDashersOpen(state.isReadyDashersOpen);
          if (state.isReadyDashersOpen) setReadyRenderReady(true);
        }
        if (state.isCurrentlyUsingDashersOpen !== undefined) {
          setIsCurrentlyUsingDashersOpen(state.isCurrentlyUsingDashersOpen);
          if (state.isCurrentlyUsingDashersOpen) setUsingRenderReady(true);
        }
        if (state.isAppealedDashersOpen !== undefined) {
          setIsAppealedDashersOpen(state.isAppealedDashersOpen);
          if (state.isAppealedDashersOpen) setAppealedRenderReady(true);
        }
        if (state.isDeactivatedDashersOpen !== undefined) {
          setIsDeactivatedDashersOpen(state.isDeactivatedDashersOpen);
          if (state.isDeactivatedDashersOpen) setDeactivatedRenderReady(true);
        }
        if (state.isReverifDashersOpen !== undefined) {
          setIsReverifDashersOpen(state.isReverifDashersOpen);
          if (state.isReverifDashersOpen) setReverifRenderReady(true);
        }
        if (state.isLockedDashersOpen !== undefined) {
          setIsLockedDashersOpen(state.isLockedDashersOpen);
          if (state.isLockedDashersOpen) setLockedRenderReady(true);
        }
        if (state.isAppliedPendingDashersOpen !== undefined) {
          setIsAppliedPendingDashersOpen(state.isAppliedPendingDashersOpen);
          if (state.isAppliedPendingDashersOpen) setAppliedRenderReady(true);
        }
        if (state.isDashersOpen !== undefined) {
          setIsDashersOpen(state.isDashersOpen);
          if (state.isDashersOpen) setDashersRenderReady(true);
        }
        if (state.isArchivedDashersOpen !== undefined) {
          setIsArchivedDashersOpen(state.isArchivedDashersOpen);
          if (state.isArchivedDashersOpen) setArchivedRenderReady(true);
        }

        // Note: noteCategories and dasherCategories are now loaded via lazy initialization
      } catch (e) {
        console.error("Error loading saved state:", e);
      }
    } else {
      // Fallback to old addressBookCategories for backward compatibility
      const savedCategories = localStorage.getItem(
        "addressBookCategories",
      );
      if (savedCategories) {
        try {
          setCategories(JSON.parse(savedCategories));
        } catch (e) {
          console.error("Error loading saved categories:", e);
        }
      }
    }
  }, []);

  // [PERSISTENCE-FIX] Enhanced initialization - check IndexedDB for recovery
  useEffect(() => {
    const checkIDBBackup = async () => {
      try {
        const idbData = await loadFromIDB("dashBashState");
        if (!idbData) return; // No backup available

        // Compare with localStorage timestamp
        const localRaw = localStorage.getItem("dashBashState");
        let localTime = new Date(0);
        if (localRaw) {
          try {
            const localState = JSON.parse(localRaw);
            localTime = new Date(localState.timestamp || 0);
          } catch (e) {
            console.warn("[PERSISTENCE] localStorage corrupted:", e);
            // localStorage is corrupted, IDB backup is critical
            localTime = new Date(0);
          }
        }

        const idbTime = new Date(idbData.timestamp || 0);

        if (idbTime > localTime) {
          // IndexedDB has newer data - apply it
          if (idbData.target) setTarget(idbData.target);
          if (idbData.targetPreset) setTargetPreset(idbData.targetPreset);
          if (idbData.prices) setPrices(idbData.prices);
          if (idbData.messages) setMessages(idbData.messages);
          if (idbData.categories) setCategories(idbData.categories);
          if (idbData.noteCategories) setNoteCategories(idbData.noteCategories);
          if (idbData.dasherCategories) setDasherCategories(idbData.dasherCategories);
          if (idbData.archivedDashers) setArchivedDashers(idbData.archivedDashers);
          if (idbData.deactivatedDashers) setDeactivatedDashers(idbData.deactivatedDashers);
          if (idbData.readyDashers) setReadyDashers(idbData.readyDashers);
          if (idbData.currentlyUsingDashers) setCurrentlyUsingDashers(idbData.currentlyUsingDashers);
          if (idbData.appealedDashers) setAppealedDashers(idbData.appealedDashers);
          if (idbData.reverifDashers) setReverifDashers(idbData.reverifDashers);
          if (idbData.lockedDashers) setLockedDashers(idbData.lockedDashers);
          if (idbData.appliedPendingDashers) setAppliedPendingDashers(idbData.appliedPendingDashers);

          // Sync IDB data back to localStorage
          try {
            localStorage.setItem("dashBashState", JSON.stringify(idbData));
          } catch (e) {
            console.warn("[PERSISTENCE] Failed to sync IDB to localStorage:", e);
          }

          setSaveNotification("Restored from backup");
          setTimeout(() => setSaveNotification(""), 3000);
        }
      } catch (err) {
        console.warn("[PERSISTENCE] IndexedDB check failed:", err);
      }
    };

    // Delay IDB check slightly to allow localStorage init to complete
    const timeoutId = setTimeout(checkIDBBackup, 500);
    return () => clearTimeout(timeoutId);
  }, []);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // [PERF-STAGE1] Global timer useEffect disabled - each DasherCard now has its own local timer
  // Smart timer batching (v1.9.4 Performance): Only update when visible dashers need it
  // Use refs to track time without triggering re-renders, then batch updates
  /* COMMENTED OUT - PERF STAGE 1
  const lastFastUpdate = useRef(Date.now());
  const lastSlowUpdate = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      // Timer gate (v1.9.5): Don't tick during import to prevent console floods
      if (isImporting) return;

      const now = Date.now();
      const hasVisibleDashers = visibleDasherIds && visibleDasherIds.size > 0;

      // Only update if there are visible dashers (prevents global re-renders when all collapsed)
      if (hasVisibleDashers) {
        // Fast tick (1s) for critical dashers
        if (now - lastFastUpdate.current >= 1000) {
          lastFastUpdate.current = now;
          setTimerTick((prev) => prev + 1);
        }

        // Slow tick (5s) for non-critical dashers
        if (now - lastSlowUpdate.current >= 5000) {
          lastSlowUpdate.current = now;
          setSlowTimerTick((prev) => prev + 1);
        }
      }
    }, 1000); // Check every second but only update state when needed
    return () => clearInterval(interval);
  }, [visibleDasherIds, isImporting]);
  */

  // MOVED UP: Filtered dasher useMemo hooks (must appear before useEffect that uses them)
  const filteredReadyDashers = useMemo(
    () => filterAndSortDashers(readyDashers),
    [readyDashers, showNonZeroOnly, dasherSort, globalQuery],
  );

  const filteredCurrentlyUsingDashers = useMemo(
    () => filterAndSortDashers(currentlyUsingDashers),
    [currentlyUsingDashers, showNonZeroOnly, dasherSort, globalQuery],
  );

  const filteredAppealedDashers = useMemo(
    () => filterAndSortDashers(appealedDashers),
    [appealedDashers, showNonZeroOnly, dasherSort, globalQuery],
  );

  const filteredAppliedPendingDashers = useMemo(
    () => filterAndSortDashers(appliedPendingDashers),
    [appliedPendingDashers, showNonZeroOnly, dasherSort, globalQuery],
  );

  const filteredReverifDashers = useMemo(
    () => filterAndSortDashers(reverifDashers),
    [reverifDashers, showNonZeroOnly, dasherSort, globalQuery],
  );

  const filteredLockedDashers = useMemo(
    () => filterAndSortDashers(lockedDashers),
    [lockedDashers, showNonZeroOnly, dasherSort, globalQuery],
  );

  const filteredDeactivatedDashers = useMemo(
    () => filterAndSortDashers(deactivatedDashers),
    [deactivatedDashers, showNonZeroOnly, dasherSort, globalQuery],
  );

  // Track visible dashers for performance optimization (Phase 2.1)
  useEffect(() => {
    const visible = new Set();

    // Helper to add visible dashers from a bucket
    const addVisibleDashers = (isOpen, isReady, dashers) => {
      if (isOpen && isReady && Array.isArray(dashers)) {
        dashers.forEach(dasher => {
          if (dasher && dasher.id && !collapsedDashers[dasher.id]) {
            visible.add(dasher.id);
          }
        });
      }
    };

    // Check each bucket and add visible dashers
    if (isDashersOpen && dashersRenderReady) {
      dasherCategories.forEach(cat => {
        if (cat && cat.dashers) {
          addVisibleDashers(true, true, cat.dashers);
        }
      });
    }

    // Add from other buckets (these are flat arrays, not categorized)
    addVisibleDashers(isReadyDashersOpen, readyRenderReady, filteredReadyDashers);
    addVisibleDashers(isCurrentlyUsingDashersOpen, usingRenderReady, filteredCurrentlyUsingDashers);
    addVisibleDashers(isAppealedDashersOpen, appealedRenderReady, filteredAppealedDashers);
    addVisibleDashers(isAppliedPendingDashersOpen, appliedRenderReady, filteredAppliedPendingDashers);
    addVisibleDashers(isReverifDashersOpen, reverifRenderReady, filteredReverifDashers);
    addVisibleDashers(isLockedDashersOpen, lockedRenderReady, filteredLockedDashers);
    addVisibleDashers(isDeactivatedDashersOpen, true, filteredDeactivatedDashers);

    setVisibleDasherIds(visible);
  }, [
    isDashersOpen, dashersRenderReady,
    isReadyDashersOpen, readyRenderReady,
    isCurrentlyUsingDashersOpen, usingRenderReady,
    isAppealedDashersOpen, appealedRenderReady,
    isAppliedPendingDashersOpen, appliedRenderReady,
    isReverifDashersOpen, reverifRenderReady,
    isLockedDashersOpen, lockedRenderReady,
    isDeactivatedDashersOpen,
    collapsedDashers,
    dasherCategories,
    filteredReadyDashers,
    filteredCurrentlyUsingDashers,
    filteredAppealedDashers,
    filteredAppliedPendingDashers,
    filteredReverifDashers,
    filteredLockedDashers,
    filteredDeactivatedDashers
  ]);

  // Toggle helpers that expose a spinner frame before heavy render
  const toggleOpenWithSpinner = (isOpen, setOpen, setReady) => {
    if (isOpen) {
      setOpen(false);
      setReady(false);
      requestPersist();
    } else {
      setOpen(true);
      setReady(false);
      // Give the browser a frame to paint the spinner
      setTimeout(() => {
        setReady(true);
      }, 60);
      requestPersist();
    }
  };
  const toggleDashersOpen = () =>
    toggleOpenWithSpinner(
      isDashersOpen,
      setIsDashersOpen,
      setDashersRenderReady,
    );
  const toggleReadyOpen = () =>
    toggleOpenWithSpinner(
      isReadyDashersOpen,
      setIsReadyDashersOpen,
      setReadyRenderReady,
    );
  const toggleUsingOpen = () =>
    toggleOpenWithSpinner(
      isCurrentlyUsingDashersOpen,
      setIsCurrentlyUsingDashersOpen,
      setUsingRenderReady,
    );
  const toggleAppealedOpen = () =>
    toggleOpenWithSpinner(
      isAppealedDashersOpen,
      setIsAppealedDashersOpen,
      setAppealedRenderReady,
    );
  const toggleAppliedOpen = () =>
    toggleOpenWithSpinner(
      isAppliedPendingDashersOpen,
      setIsAppliedPendingDashersOpen,
      setAppliedRenderReady,
    );
  const toggleReverifOpen = () =>
    toggleOpenWithSpinner(
      isReverifDashersOpen,
      setIsReverifDashersOpen,
      setReverifRenderReady,
    );
  const toggleLockedOpen = () =>
    toggleOpenWithSpinner(
      isLockedDashersOpen,
      setIsLockedDashersOpen,
      setLockedRenderReady,
    );
  const toggleDeactivatedOpen = () =>
    toggleOpenWithSpinner(
      isDeactivatedDashersOpen,
      setIsDeactivatedDashersOpen,
      setDeactivatedRenderReady,
    );
  const toggleArchivedOpen = () =>
    toggleOpenWithSpinner(
      isArchivedDashersOpen,
      setIsArchivedDashersOpen,
      setArchivedRenderReady,
    );

  // Collapsed notes helpers
  const isDasherNotesCollapsed = (dasherId) =>
    !!collapsedDasherNotes[dasherId];
  const toggleDasherNotesCollapsed = (dasherId) =>
    setCollapsedDasherNotes((prev) => ({
      ...prev,
      [dasherId]: !prev[dasherId],
    }));
  const storeKey = (categoryId, storeId) => `${categoryId}-${storeId}`;
  const isStoreNotesCollapsed = (categoryId, storeId) =>
    !!collapsedStoreNotes[storeKey(categoryId, storeId)];
  const toggleStoreNotesCollapsed = (categoryId, storeId) =>
    setCollapsedStoreNotes((prev) => ({
      ...prev,
      [storeKey(categoryId, storeId)]:
        !prev[storeKey(categoryId, storeId)],
    }));
  const isCashOutNotesCollapsed = (dasherId) =>
    !!collapsedCashOutNotes[dasherId];
  const setCashOutNotesCollapsed = (dasherId, val) =>
    setCollapsedCashOutNotes((prev) => ({ ...prev, [dasherId]: !!val }));
  const noteKey = (categoryId, noteIndex) => `${categoryId}-${noteIndex}`;
  const isCategoryNoteCollapsed = (categoryId, noteIndex) =>
    !!collapsedCategoryNotes[noteKey(categoryId, noteIndex)];
  const toggleCategoryNoteCollapsed = (categoryId, noteIndex) =>
    setCollapsedCategoryNotes((prev) => ({
      ...prev,
      [noteKey(categoryId, noteIndex)]:
        !prev[noteKey(categoryId, noteIndex)],
    }));

  const expandKeySections = () => {
    // Open all buckets and stage spinners for consistent feedback
    setIsDashersOpen(true);
    setDashersRenderReady(false);
    setIsReadyDashersOpen(true);
    setReadyRenderReady(false);
    setIsCurrentlyUsingDashersOpen(true);
    setUsingRenderReady(false);
    setIsAppealedDashersOpen(true);
    setAppealedRenderReady(false);
    setIsAppliedPendingDashersOpen(true);
    setAppliedRenderReady(false);
    setIsLockedDashersOpen(true);
    setLockedRenderReady(false);
    setIsDeactivatedDashersOpen(true);
    setDeactivatedRenderReady(false);
    setIsArchivedDashersOpen(true);
    setArchivedRenderReady(false);
    setTimeout(() => {
      setDashersRenderReady(true);
      setReadyRenderReady(true);
      setUsingRenderReady(true);
      setAppealedRenderReady(true);
      setAppliedRenderReady(true);
      setLockedRenderReady(true);
      setDeactivatedRenderReady(true);
      setArchivedRenderReady(true);
    }, 60);
    requestPersist();
  };
  const collapseKeySections = () => {
    setIsDashersOpen(false);
    setDashersRenderReady(false);
    setIsReadyDashersOpen(false);
    setReadyRenderReady(false);
    setIsCurrentlyUsingDashersOpen(false);
    setUsingRenderReady(false);
    setIsAppealedDashersOpen(false);
    setAppealedRenderReady(false);
    setIsAppliedPendingDashersOpen(false);
    setAppliedRenderReady(false);
    setIsLockedDashersOpen(false);
    setLockedRenderReady(false);
    setIsDeactivatedDashersOpen(false);
    setDeactivatedRenderReady(false);
    setIsArchivedDashersOpen(false);
    setArchivedRenderReady(false);
    requestPersist();
  };

  useEffect(() => {
    return () => {
      const timers = recentlyMovedTimersRef.current;
      if (timers && timers.size) {
        for (const timeoutId of timers.values()) {
          clearTimeout(timeoutId);
        }
        timers.clear();
      }
    };
  }, []);

  // Calculator functions
  const addPrice = () => {
    if (currentPrice && !isNaN(parseFloat(currentPrice))) {
      setPrices([...prices, parseFloat(currentPrice)]);
      setCurrentPrice("");
      setTimeout(
        () => priceInputRef.current && priceInputRef.current.focus(),
        0,
      );
    }
  };

  const removePrice = (index) => {
    setPrices(prices.filter((_, i) => i !== index));
    setTimeout(
      () => priceInputRef.current && priceInputRef.current.focus(),
      0,
    );
  };

  const clearAll = () => {
    setPrices([]);
    setTimeout(
      () => priceInputRef.current && priceInputRef.current.focus(),
      0,
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addPrice();
    }
  };

  const handleTargetKeyPress = (e) => {
    if (e.key === "Enter") {
      if (isEditingTarget) {
        handleCustomTargetSave();
      } else {
        priceInputRef.current && priceInputRef.current.focus();
      }
    }
  };

  const handleTargetPresetChange = (preset) => {
    setTargetPreset(preset);
    setIsEditingTarget(false);

    if (preset === "99" || preset === "120") {
      setTarget(preset);
      setCustomTarget("");
    } else if (preset === "custom") {
      setIsEditingTarget(true);
      setCustomTarget(target !== "99" && target !== "120" ? target : "");
    }

    // Auto-save the change
    requestPersist();
  };

  const handleCustomTargetSave = () => {
    if (customTarget && !isNaN(parseFloat(customTarget))) {
      setTarget(customTarget);
      setIsEditingTarget(false);

      // Auto-save the change
      setTimeout(() => {
        saveAllToLocalStorage();
      }, 100);
    }
  };

  useEffect(() => {
    priceInputRef.current && priceInputRef.current.focus();
  }, []);

  // Message management functions
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      const preview =
        text.length > 40 ? text.substring(0, 40) + "..." : text;
      setCopyNotification(`✅ Copied: "${preview}"`);
      setTimeout(() => setCopyNotification(""), 3000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      setCopyNotification("❌ Failed to copy");
      announceFailure("Failed to copy to clipboard");
      setTimeout(() => setCopyNotification(""), 3000);
    }
  };

  const startEdit = (index) => {
    setEditingIndex(index);
    setEditText(messages[index]);
  };

  const saveEdit = () => {
    if (editText.trim()) {
      const newMessages = [...messages];
      newMessages[editingIndex] = editText.trim();
      setMessages(newMessages);

      // Auto-save messages
      setTimeout(() => {
        saveAllToLocalStorage();
      }, 100);
    }
    setEditingIndex(-1);
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingIndex(-1);
    setEditText("");
  };

  const deleteMessage = (index) => {
    const newMessages = messages.filter((_, i) => i !== index);
    setMessages(newMessages);
    if (editingIndex === index) {
      setEditingIndex(-1);
      setEditText("");
    }

    // Auto-save after deletion
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === -1 || draggedIndex === dropIndex) return;

    const newMessages = [...messages];
    const draggedMessage = newMessages[draggedIndex];
    newMessages.splice(draggedIndex, 1);
    newMessages.splice(dropIndex, 0, draggedMessage);
    setMessages(newMessages);
    setDraggedIndex(-1);

    // Auto-save after reordering
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const addNewMessage = () => {
    if (newMessageText.trim()) {
      const newMessages = [...messages, newMessageText.trim()];
      setMessages(newMessages);
      setNewMessageText("");
      setIsAddingNew(false);

      // Auto-save after adding
      setTimeout(() => {
        saveAllToLocalStorage();
      }, 100);
    }
  };

  const cancelAddNew = () => {
    setNewMessageText("");
    setIsAddingNew(false);
  };

  // Address Book functions
  // (extractCityState moved earlier to avoid hoisting issues)

  // Utility: simple debounce keyed by string to allow per-entry coalescing
  const debounceMap = new Map();
  const debounceKeyed = (key, fn, delay = 200) => {
    if (debounceMap.has(key)) {
      clearTimeout(debounceMap.get(key));
    }
    const t = setTimeout(fn, delay);
    debounceMap.set(key, t);
  };
  const cancelDebounceForKey = (key) => {
    if (debounceMap.has(key)) {
      clearTimeout(debounceMap.get(key));
      debounceMap.delete(key);
    }
  };

  // Cash-out history helpers
  const updateHistoryEntry = (dasherId, idx, patch) => {
    setDasherCategories((cats) =>
      cats.map((cat) => ({
        ...cat,
        dashers: cat.dashers.map((d) => {
          if (d.id !== dasherId) return d;
          if (!Array.isArray(d.cashOutHistory)) return d;
          const next = [...d.cashOutHistory];
          next[idx] = { ...next[idx], ...patch };
          return { ...d, cashOutHistory: next };
        }),
      })),
    );
    // Top-level buckets
    const topSetters = [
      [readyDashers, setReadyDashers],
      [currentlyUsingDashers, setCurrentlyUsingDashers],
      [appealedDashers, setAppealedDashers],
      [appliedPendingDashers, setAppliedPendingDashers],
      [lockedDashers, setLockedDashers],
      [deactivatedDashers, setDeactivatedDashers],
      [archivedDashers, setArchivedDashers],
    ];
    topSetters.forEach(([list, setter]) => {
      setter((prev) =>
        prev.map((d) => {
          if (d.id !== dasherId) return d;
          if (!Array.isArray(d.cashOutHistory)) return d;
          const next = [...d.cashOutHistory];
          if (idx >= 0 && idx < next.length) {
            next[idx] = { ...next[idx], ...patch };
          }
          return { ...d, cashOutHistory: next };
        }),
      );
    });
    requestPersist();
  };

  // Debounced updater for inline edits: batches rapid keystrokes per entry
  const debouncedUpdateHistoryEntry = (
    dasherId,
    idx,
    patch,
    delay = 200,
  ) => {
    const key = `${dasherId}:${idx}`;
    debounceKeyed(
      key,
      () => updateHistoryEntry(dasherId, idx, patch),
      delay,
    );
  };

  const deleteHistoryEntry = (dasherId, idx) => {
    const adjust = (d) => {
      if (d.id !== dasherId || !Array.isArray(d.cashOutHistory)) return d;
      const next = d.cashOutHistory.filter((_, i) => i !== idx);
      if (d.lastCashOutRef && d.lastCashOutRef.index === idx) {
        return { ...d, cashOutHistory: next, lastCashOutRef: null };
      }
      return { ...d, cashOutHistory: next };
    };
    setDasherCategories((cats) =>
      cats.map((cat) => ({ ...cat, dashers: cat.dashers.map(adjust) })),
    );
    [
      setReadyDashers,
      setCurrentlyUsingDashers,
      setAppealedDashers,
      setAppliedPendingDashers,
      setLockedDashers,
      setDeactivatedDashers,
      setArchivedDashers,
    ].forEach((setter) => setter((prev) => prev.map(adjust)));
    requestPersist();
  };

  const addCustomCashOut = (dasherId, entry, adjustBalance) => {
    const base = {
      id: crypto.randomUUID(),
      amount: entry.amount,
      method: entry.method || "custom",
      notes: entry.notes || "",
      at: entry.at || new Date().toISOString(),
    };
    const apply = (d) => {
      if (d.id !== dasherId) return d;
      const history = Array.isArray(d.cashOutHistory)
        ? [...d.cashOutHistory, base]
        : [base];
      let balance = d.balance;
      if (adjustBalance) {
        const numeric = parseFloat(entry.amount);
        if (!isNaN(numeric) && numeric > 0) {
          const cur = parseBalanceValue(balance || "0");
          const updated = Math.max(0, cur - numeric);
          balance = updated.toString();
        }
      }
      return {
        ...d,
        balance,
        cashOutHistory: history,
        lastCashOutRef: adjustBalance
          ? { id: base.id, index: history.length - 1 }
          : d.lastCashOutRef || null,
      };
    };
    setDasherCategories((cats) =>
      cats.map((cat) => ({ ...cat, dashers: cat.dashers.map(apply) })),
    );
    [
      setReadyDashers,
      setCurrentlyUsingDashers,
      setAppealedDashers,
      setAppliedPendingDashers,
      setLockedDashers,
      setDeactivatedDashers,
      setArchivedDashers,
    ].forEach((setter) => setter((prev) => prev.map(apply)));
    requestPersist();
  };

  // Enter-to-save
  const commitDasherEdit = () => {
    if (!editingDasher || !editingDasher.dasherId) return;
    requestPersist();
  };

  const handleEditableKeyDown = (e, isTextarea = false) => {
    if (isTextarea) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        commitDasherEdit();
      }
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      commitDasherEdit();
      e.target.blur();
    }
  };

  // State Management Functions

  // [PERSISTENCE-FIX] Memoized state builder - stable reference for emergency saves
  const buildStateObject = useCallback(() => {
    return {
      target,
      targetPreset,
      prices,
      messages,
      categories,
      noteCategories,
      dasherCategories,
      archivedDashers,
      deactivatedDashers,
      readyDashers,
      currentlyUsingDashers,
      appealedDashers,
      reverifDashers,
      lockedDashers,
      appliedPendingDashers,
      collapsedCategories,
      collapsedStores,
      collapsedDashers,
      collapsedReadyDashers,
      collapsedCurrentlyUsingDashers,
      collapsedAppealedDashers,
      collapsedArchivedDashers,
      collapsedDeactivatedDashers,
      collapsedReverifDashers,
      collapsedLockedDashers,
      collapsedAppliedPendingDashers,
      collapsedDasherCategories,
      collapsedNoteCategories,
      // Persist collapsed notes preferences
      collapsedDasherNotes,
      collapsedStoreNotes,
      collapsedCashOutNotes,
      collapsedCategoryNotes,
      isArchivedDashersOpen,
      isDeactivatedDashersOpen,
      isReadyDashersOpen,
      isCurrentlyUsingDashersOpen,
      isAppealedDashersOpen,
      isReverifDashersOpen,
      isLockedDashersOpen,
      isAppliedPendingDashersOpen,
      // Cash analytics filters intentionally remain session-scoped so they refresh on new loads
      showNonZeroOnly,
      dasherSort,
      timestamp: new Date().toISOString(),
      schemaVersion: CURRENT_SCHEMA_VERSION,
    };
  }, [
    target, targetPreset, prices, messages, categories, noteCategories,
    dasherCategories, archivedDashers, deactivatedDashers, readyDashers,
    currentlyUsingDashers, appealedDashers, reverifDashers, lockedDashers,
    appliedPendingDashers, collapsedCategories, collapsedStores, collapsedDashers,
    collapsedReadyDashers, collapsedCurrentlyUsingDashers, collapsedAppealedDashers,
    collapsedArchivedDashers, collapsedDeactivatedDashers, collapsedReverifDashers,
    collapsedLockedDashers, collapsedAppliedPendingDashers, collapsedDasherCategories,
    collapsedNoteCategories, collapsedDasherNotes, collapsedStoreNotes,
    collapsedCashOutNotes, collapsedCategoryNotes, isArchivedDashersOpen,
    isDeactivatedDashersOpen, isReadyDashersOpen, isCurrentlyUsingDashersOpen,
    isAppealedDashersOpen, isReverifDashersOpen, isLockedDashersOpen,
    isAppliedPendingDashersOpen, showNonZeroOnly, dasherSort
  ]);

  // [PERSISTENCE-FIX] Enhanced save with dual-write (localStorage + IndexedDB) and quota handling
  const saveAllToLocalStorage = useCallback(async () => {
    // localStorage gate (v1.9.5): Block writes during import to prevent thrashing
    if (isImporting) return;

    try {
      const state = buildStateObject();

      // [QUALITY-FIX] Pre-save validation - ensure critical fields are valid
      if (!state || typeof state !== 'object') {
        console.error("[PERSISTENCE] Invalid state object, skipping save");
        return;
      }
      // Validate array fields - track corruption for user notification
      let corruptedFields = [];
      const arrayFields = ['prices', 'messages', 'categories', 'noteCategories', 'dasherCategories',
        'archivedDashers', 'deactivatedDashers', 'readyDashers', 'currentlyUsingDashers',
        'appealedDashers', 'reverifDashers', 'lockedDashers', 'appliedPendingDashers'];
      for (const field of arrayFields) {
        if (state[field] && !Array.isArray(state[field])) {
          console.error(`[PERSISTENCE] Invalid ${field} - expected array, got ${typeof state[field]}`);
          corruptedFields.push(field);
          state[field] = [];
        }
      }
      // Validate object fields (collapsed maps)
      const objectFields = ['collapsedCategories', 'collapsedStores', 'collapsedDashers'];
      for (const field of objectFields) {
        if (state[field] && typeof state[field] !== 'object') {
          console.error(`[PERSISTENCE] Invalid ${field} - expected object, got ${typeof state[field]}`);
          corruptedFields.push(field);
          state[field] = {};
        }
      }
      // Notify user if data corruption was detected and recovered
      if (corruptedFields.length > 0) {
        setSaveNotification(`⚠️ Data issue detected in ${corruptedFields.length} field(s) - recovered`);
        setTimeout(() => setSaveNotification(""), 5000);
      }

      const stateJson = JSON.stringify(state);

      // Primary: localStorage (synchronous, fast) - unless disabled due to quota
      if (!localStorageDisabled) {
        try {
          localStorage.setItem("dashBashState", stateJson);
        } catch (e) {
          if (e.name === 'QuotaExceededError') {
            console.warn("[PERSISTENCE] localStorage quota exceeded, switching to IndexedDB-only mode");
            setLocalStorageDisabled(true);
            setSaveNotification("Storage full - using backup storage");
          } else {
            throw e;
          }
        }
      }

      // Secondary: IndexedDB (async, reliable backup) - with timeout
      try {
        await Promise.race([
          saveToIDB("dashBashState", state),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('IDB timeout')), 5000)
          )
        ]);
      } catch (err) {
        console.warn("[PERSISTENCE] IndexedDB backup failed:", err);
      }

      // Update tracking state
      setLastSavedAt(new Date());
      setHasUnsavedChanges(false);

      // Show notification (if not during move toast)
      if (!moveToastActiveRef.current) {
        if (saveNotificationTimeoutRef.current) {
          clearTimeout(saveNotificationTimeoutRef.current);
          saveNotificationTimeoutRef.current = null;
        }
        setSaveNotification("Saved automatically");
        saveNotificationTimeoutRef.current = setTimeout(() => {
          setSaveNotification("");
          saveNotificationTimeoutRef.current = null;
        }, 3000);
      }
    } catch (e) {
      console.error("[PERSISTENCE] Save failed:", e);
      setSaveNotification("Failed to save data");
      announceFailure("Failed to save data");
      setTimeout(() => setSaveNotification(""), 3000);
    }
  }, [buildStateObject, isImporting, localStorageDisabled]);

  // [PERSISTENCE-FIX] Coordinated save - prevents race conditions from multiple triggers
  const coordinatedSave = useCallback(async () => {
    // If save is in flight, mark as pending and return
    if (saveInFlightRef.current) {
      pendingSaveRef.current = true;
      return;
    }

    saveInFlightRef.current = true;
    const currentVersion = ++saveVersionRef.current;

    try {
      await saveAllToLocalStorage();
    } finally {
      saveInFlightRef.current = false;

      // If another save was requested while we were saving, do it now
      if (pendingSaveRef.current) {
        pendingSaveRef.current = false;
        // Only proceed if no newer version was requested
        if (currentVersion === saveVersionRef.current) {
          coordinatedSave();
        }
      }
    }
  }, [saveAllToLocalStorage]);

  // [PERF-STAGE5] Non-blocking persistence via idle callback
  // [PERSISTENCE-FIX] Now uses coordinatedSave and tracks unsaved changes
  const requestPersist = useCallback(() => {
    // Mark that we have unsaved changes
    setHasUnsavedChanges(true);

    if (saveDebouncedRef.current) {
      if (typeof cancelIdleCallback !== 'undefined') {
        cancelIdleCallback(saveDebouncedRef.current);
      }
      clearTimeout(saveDebouncedRef.current);
    }

    const performSave = () => {
      try {
        coordinatedSave();
      } finally {
        saveDebouncedRef.current = null;
      }
    };

    // prefer idle callback when supported, with 500ms debounce
    if (typeof requestIdleCallback !== 'undefined') {
      saveDebouncedRef.current = requestIdleCallback(performSave, { timeout: 500 });
    } else {
      saveDebouncedRef.current = setTimeout(performSave, 500);
    }
  }, [coordinatedSave]);

  // =========================================================================
  // [PERSISTENCE-FIX] Emergency Save Handlers
  // =========================================================================

  // PRIMARY: visibilitychange - most reliable for tab switches and closes
  const handleVisibilityChange = useCallback(() => {
    setIsTabVisible(!document.hidden);
    if (document.visibilityState === "hidden") {
      // CRITICAL: Skip save during import to prevent data corruption
      if (isImporting) {
        return;
      }
      // Synchronous save - must complete before tab is suspended
      try {
        const state = buildStateObject();
        localStorage.setItem("dashBashState", JSON.stringify(state));
        // Fire-and-forget IndexedDB backup (may not complete, but better than skipping)
        saveToIDB("dashBashState", state).catch(() => { });
        setHasUnsavedChanges(false);
      } catch (err) {
        console.error("[PERSISTENCE] Emergency save on visibility change failed:", err);
      }
    }
  }, [buildStateObject, isImporting, setIsTabVisible]);

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [handleVisibilityChange]);

  // BACKUP: beforeunload - less reliable but provides user warning
  const handleBeforeUnload = useCallback((e) => {
    // CRITICAL: Skip save during import to prevent data corruption
    if (isImporting) {
      // Still show warning during import
      e.preventDefault();
      e.returnValue = "Import in progress. Changes may be lost.";
      return;
    }
    // Synchronous save - must complete before page closes
    try {
      const state = buildStateObject();
      localStorage.setItem("dashBashState", JSON.stringify(state));
      // Fire-and-forget IndexedDB backup (may not complete, but better than skipping)
      saveToIDB("dashBashState", state).catch(() => { });
    } catch (err) {
      console.error("[PERSISTENCE] Emergency save on beforeunload failed:", err);
    }

    // Show warning if unsaved changes (increases save likelihood)
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = "You have unsaved changes.";
    }
  }, [buildStateObject, hasUnsavedChanges, isImporting]);

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [handleBeforeUnload]);

  // MOBILE: pagehide - for mobile Safari and bfcache
  const handlePageHide = useCallback((e) => {
    if (e.persisted) return; // Page is being cached, not closed
    // CRITICAL: Skip save during import to prevent data corruption
    if (isImporting) {
      return;
    }
    try {
      const state = buildStateObject();
      localStorage.setItem("dashBashState", JSON.stringify(state));
      // Fire-and-forget IndexedDB backup (may not complete, but better than skipping)
      saveToIDB("dashBashState", state).catch(() => { });
    } catch (err) {
      console.error("[PERSISTENCE] Emergency save on pagehide failed:", err);
    }
  }, [buildStateObject, isImporting]);

  useEffect(() => {
    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, [handlePageHide]);

  // =========================================================================
  // [PERSISTENCE-FIX] Comprehensive Auto-Save
  // =========================================================================

  // Track when any state changes that needs saving
  useEffect(() => {
    if (isImporting) return; // Skip during imports
    setHasUnsavedChanges(true);
  }, [
    target, targetPreset, prices, messages, categories, noteCategories,
    dasherCategories, archivedDashers, deactivatedDashers, readyDashers,
    currentlyUsingDashers, appealedDashers, reverifDashers, lockedDashers,
    appliedPendingDashers, isImporting
  ]);

  // Auto-save when state changes (500ms debounce for main thread)
  useEffect(() => {
    if (isImporting) return; // Skip during imports
    if (!hasUnsavedChanges) return; // Nothing to save

    const timeoutId = setTimeout(() => {
      coordinatedSave();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [hasUnsavedChanges, isImporting, coordinatedSave]);

  // =========================================================================
  // [PERSISTENCE-FIX] Multi-Tab Awareness
  // =========================================================================

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "dashBashState" && e.newValue) {
        try {
          const newState = JSON.parse(e.newValue);
          const newTime = new Date(newState.timestamp);
          const currentTime = lastSavedAt || new Date(0);

          if (newTime > currentTime) {
            // Another tab has newer data
            setSaveNotification("Data updated from another tab");
            setTimeout(() => setSaveNotification(""), 5000);
            // Note: Auto-reload is too disruptive; user can manually reload
          }
        } catch (err) {
          console.warn("[PERSISTENCE] Failed to parse storage event:", err);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [lastSavedAt]);

  // Legacy auto-save (kept for backward compatibility during transition)
  // Auto-save when collapsedDashers changes
  useEffect(() => {
    requestPersist();
  }, [collapsedDashers, requestPersist]);

  const openDasherBucket = useCallback(
    (bucketKey, meta = {}) => {
      let shouldPersist = false;

      const ensureOpen = (setter) => {
        setter((prev) => {
          if (prev) return prev;
          shouldPersist = true;
          return true;
        });
      };

      const ensureRenderReady = (setter) => {
        setter((prev) => (prev ? prev : true));
      };

      switch (bucketKey) {
        case "main":
          ensureOpen(setIsDashersOpen);
          ensureRenderReady(setDashersRenderReady);
          if (meta?.categoryId) {
            setCollapsedDasherCategories((prev) => {
              if (prev && prev[meta.categoryId] === false) return prev;
              shouldPersist = true;
              return { ...prev, [meta.categoryId]: false };
            });
          }
          break;
        case "ready":
          ensureOpen(setIsReadyDashersOpen);
          ensureRenderReady(setReadyRenderReady);
          break;
        case "currently-using":
          ensureOpen(setIsCurrentlyUsingDashersOpen);
          ensureRenderReady(setUsingRenderReady);
          break;
        case "appealed":
          ensureOpen(setIsAppealedDashersOpen);
          ensureRenderReady(setAppealedRenderReady);
          break;
        case "applied-pending":
          ensureOpen(setIsAppliedPendingDashersOpen);
          ensureRenderReady(setAppliedRenderReady);
          break;
        case "reverif":
          ensureOpen(setIsReverifDashersOpen);
          ensureRenderReady(setReverifRenderReady);
          break;
        case "locked":
          ensureOpen(setIsLockedDashersOpen);
          ensureRenderReady(setLockedRenderReady);
          break;
        case "deactivated":
          ensureOpen(setIsDeactivatedDashersOpen);
          ensureRenderReady(setDeactivatedRenderReady);
          break;
        case "archived":
          ensureOpen(setIsArchivedDashersOpen);
          ensureRenderReady(setArchivedRenderReady);
          break;
        default:
          break;
      }

      if (shouldPersist) {
        requestPersist();
      }
    },
    [
      requestPersist,
      setIsDashersOpen,
      setDashersRenderReady,
      setCollapsedDasherCategories,
      setIsReadyDashersOpen,
      setReadyRenderReady,
      setIsCurrentlyUsingDashersOpen,
      setUsingRenderReady,
      setIsAppealedDashersOpen,
      setAppealedRenderReady,
      setIsAppliedPendingDashersOpen,
      setAppliedRenderReady,
      setIsReverifDashersOpen,
      setReverifRenderReady,
      setIsLockedDashersOpen,
      setLockedRenderReady,
      setIsDeactivatedDashersOpen,
      setDeactivatedRenderReady,
      setIsArchivedDashersOpen,
      setArchivedRenderReady,
    ],
  );

  const loadFromLocalStorage = () => {
    try {
      const savedState = localStorage.getItem("dashBashState");
      if (savedState) {
        const state = JSON.parse(savedState);

        // Schema migration - handle version upgrades
        const currentVersion = state.schemaVersion || 1;
        if (currentVersion < 3) {
          // Migrate from v1/v2 to v3
          // Add any new required fields with defaults
          if (!state.schemaVersion) {
          }
        }

        // v4 migration: lift reserved bucket categories into top-level arrays
        if (currentVersion < 4) {
          try {
            const reservedIds = new Set([
              "ready",
              "currently-using",
              "appealed",
              "applied-pending",
              "reverif",
              "locked",
              "deactivated",
              "archived",
            ]);
            if (Array.isArray(state.dasherCategories)) {
              const remaining = [];
              state.dasherCategories.forEach((cat) => {
                if (reservedIds.has(cat.id)) {
                  const dashers = Array.isArray(cat.dashers)
                    ? cat.dashers
                    : [];
                  if (cat.id === "ready")
                    state.readyDashers = (
                      state.readyDashers || []
                    ).concat(dashers);
                  else if (cat.id === "currently-using")
                    state.currentlyUsingDashers = (
                      state.currentlyUsingDashers || []
                    ).concat(dashers);
                  else if (cat.id === "appealed")
                    state.appealedDashers = (
                      state.appealedDashers || []
                    ).concat(dashers);
                  else if (cat.id === "applied-pending")
                    state.appliedPendingDashers = (
                      state.appliedPendingDashers || []
                    ).concat(dashers);
                  else if (cat.id === "reverif")
                    state.reverifDashers = (
                      state.reverifDashers || []
                    ).concat(dashers);
                  else if (cat.id === "locked")
                    state.lockedDashers = (
                      state.lockedDashers || []
                    ).concat(dashers);
                  else if (cat.id === "deactivated")
                    state.deactivatedDashers = (
                      state.deactivatedDashers || []
                    ).concat(dashers);
                  else if (cat.id === "archived")
                    state.archivedDashers = (
                      state.archivedDashers || []
                    ).concat(dashers);
                } else {
                  remaining.push(cat);
                }
              });
              state.dasherCategories = remaining;
            }
            state.schemaVersion = 4;
            localStorage.setItem("dashBashState", JSON.stringify(state));
          } catch (err) {
            console.warn("Schema v4 migration failed", err);
          }
        }

        // v5 migration: ensure earningsHistory arrays present on all dashers
        if ((state.schemaVersion || currentVersion) < 5) {
          try {
            const ensureEarnings = (list) => {
              if (!Array.isArray(list)) return;
              list.forEach((d) => {
                if (!Array.isArray(d.earningsHistory))
                  d.earningsHistory = [];
              });
            };
            ensureEarnings(
              state.dasherCategories?.flatMap((c) =>
                Array.isArray(c.dashers) ? c.dashers : [],
              ) || [],
            );
            ensureEarnings(state.readyDashers);
            ensureEarnings(state.currentlyUsingDashers);
            ensureEarnings(state.appealedDashers);
            ensureEarnings(state.appliedPendingDashers);
            ensureEarnings(state.reverifDashers);
            ensureEarnings(state.lockedDashers);
            ensureEarnings(state.deactivatedDashers);
            ensureEarnings(state.archivedDashers);

            state.schemaVersion = 5;
            localStorage.setItem("dashBashState", JSON.stringify(state));
          } catch (err) {
            console.warn("Schema v5 migration failed", err);
          }
        }

        migrateLegacyDashers(state);

        // Load target configuration
        const savedTarget = state.target || "99";
        const savedPreset =
          state.targetPreset ||
          (savedTarget === "99" || savedTarget === "120"
            ? savedTarget
            : "custom");

        setTarget(savedTarget);
        setTargetPreset(savedPreset);
        if (savedPreset === "custom") {
          setCustomTarget(savedTarget);
        }

        setPrices(state.prices || []);
        setMessages(state.messages || []);
        setCategories(state.categories || []);
        // Don't use defaults if we have saved state
        if (state.noteCategories) setNoteCategories(state.noteCategories);
        if (state.dasherCategories)
          setDasherCategories(state.dasherCategories);
        if (state.archivedDashers)
          setArchivedDashers(state.archivedDashers);
        if (state.deactivatedDashers)
          setDeactivatedDashers(state.deactivatedDashers);
        if (state.readyDashers) setReadyDashers(state.readyDashers);
        if (state.currentlyUsingDashers)
          setCurrentlyUsingDashers(state.currentlyUsingDashers);
        if (state.appealedDashers)
          setAppealedDashers(state.appealedDashers);
        if (Array.isArray(state.reverifDashers)) {
          setReverifDashers(state.reverifDashers);
        } else if (Array.isArray(state.dasherCategories)) {
          const legacyReverif = state.dasherCategories.find(
            (cat) => cat && cat.id === "reverif",
          );
          if (legacyReverif && Array.isArray(legacyReverif.dashers)) {
            setReverifDashers(legacyReverif.dashers);
            requestPersist();
          } else {
            setReverifDashers([]);
          }
        }

        // Load collapsed states if they exist
        if (state.collapsedCategories)
          setCollapsedCategories(state.collapsedCategories);
        if (state.collapsedStores)
          setCollapsedStores(state.collapsedStores);
        if (state.collapsedDashers)
          setCollapsedDashers(state.collapsedDashers);
        if (state.collapsedReadyDashers)
          setCollapsedReadyDashers(state.collapsedReadyDashers);
        if (state.collapsedCurrentlyUsingDashers)
          setCollapsedCurrentlyUsingDashers(
            state.collapsedCurrentlyUsingDashers,
          );
        if (state.collapsedAppealedDashers)
          setCollapsedAppealedDashers(state.collapsedAppealedDashers);
        if (state.collapsedArchivedDashers)
          setCollapsedArchivedDashers(state.collapsedArchivedDashers);
        if (state.collapsedDeactivatedDashers)
          setCollapsedDeactivatedDashers(
            state.collapsedDeactivatedDashers,
          );
        if (state.collapsedDasherCategories)
          setCollapsedDasherCategories(state.collapsedDasherCategories);
        if (state.collapsedNoteCategories)
          setCollapsedNoteCategories(state.collapsedNoteCategories);
        if (state.collapsedDasherNotes)
          setCollapsedDasherNotes(state.collapsedDasherNotes);
        if (state.collapsedStoreNotes)
          setCollapsedStoreNotes(state.collapsedStoreNotes);
        if (state.collapsedCashOutNotes)
          setCollapsedCashOutNotes(state.collapsedCashOutNotes);
        if (state.collapsedCategoryNotes)
          setCollapsedCategoryNotes(state.collapsedCategoryNotes);
        // [FIX v1.10.1] Also set renderReady=true for open buckets to prevent infinite spinner
        if (state.isArchivedDashersOpen !== undefined) {
          setIsArchivedDashersOpen(state.isArchivedDashersOpen);
          if (state.isArchivedDashersOpen) setArchivedRenderReady(true);
        }
        if (state.isDeactivatedDashersOpen !== undefined) {
          setIsDeactivatedDashersOpen(state.isDeactivatedDashersOpen);
          if (state.isDeactivatedDashersOpen) setDeactivatedRenderReady(true);
        }
        if (state.isReadyDashersOpen !== undefined) {
          setIsReadyDashersOpen(state.isReadyDashersOpen);
          if (state.isReadyDashersOpen) setReadyRenderReady(true);
        }
        if (state.isCurrentlyUsingDashersOpen !== undefined) {
          setIsCurrentlyUsingDashersOpen(state.isCurrentlyUsingDashersOpen);
          if (state.isCurrentlyUsingDashersOpen) setUsingRenderReady(true);
        }
        if (state.isAppealedDashersOpen !== undefined) {
          setIsAppealedDashersOpen(state.isAppealedDashersOpen);
          if (state.isAppealedDashersOpen) setAppealedRenderReady(true);
        }
        if (state.isReverifDashersOpen !== undefined) {
          setIsReverifDashersOpen(state.isReverifDashersOpen);
          if (state.isReverifDashersOpen) setReverifRenderReady(true);
        }
        if (state.showNonZeroOnly !== undefined)
          setShowNonZeroOnly(state.showNonZeroOnly);
        if (state.dasherSort) setDasherSort(state.dasherSort);

        setSaveNotification("✅ Data loaded successfully!");
        setTimeout(() => setSaveNotification(""), 3000);
      } else {
        setSaveNotification("⚠️ No saved data found");
        announceFailure("No saved data found in storage");
        setTimeout(() => setSaveNotification(""), 3000);
      }
    } catch (e) {
      setSaveNotification("❌ Failed to load data");
      announceFailure("Failed to load saved data");
      setTimeout(() => setSaveNotification(""), 3000);
    }
  };

  // CSV Export Helper Functions
  const escapeCsvField = (value) => {
    if (value === null || value === undefined) return "N/A";
    const str = String(value);
    // Escape quotes and wrap field if contains comma, quote, or newline
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const formatTimestampForCsv = (isoString) => {
    if (!isoString) return "N/A";
    try {
      const date = new Date(isoString);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${month}/${day}/${year} ${hours}:${minutes}`;
    } catch {
      return "N/A";
    }
  };

  const extractDasherForCsv = (dasher, bucketName = "", categoryName = "") => {
    // Exclude cashout fields: cashOutHistory, lastCashOutRef, selectedCashout
    return {
      bucket: bucketName,
      category: categoryName,
      id: dasher.id || "N/A",
      name: dasher.name || "N/A",
      email: dasher.email || "N/A",
      emailPw: dasher.emailPw || "N/A",
      dasherPw: dasher.dasherPw || "N/A",
      phone: dasher.phone || "N/A",
      balance: dasher.balance ?? "N/A",
      crimson: dasher.crimson ? "true" : "false",
      redCard: dasher.redCard ? "true" : "false",
      appealed: dasher.appealed ? "true" : "false",
      fastPay: dasher.fastPay ? "true" : "false",
      deactivated: dasher.deactivated ? "true" : "false",
      ready: dasher.ready ? "true" : "false",
      fastPayInfo: dasher.fastPayInfo || "N/A",
      crimsonInfo: dasher.crimsonInfo || "N/A",
      appealedAt: formatTimestampForCsv(dasher.appealedAt),
      crimsonAt: formatTimestampForCsv(dasher.crimsonAt),
      redCardAt: formatTimestampForCsv(dasher.redCardAt),
      deactivatedAt: formatTimestampForCsv(dasher.deactivatedAt),
      readyAt: formatTimestampForCsv(dasher.readyAt),
      lastUsed: formatTimestampForCsv(dasher.lastUsed),
      notes: Array.isArray(dasher.notes) ? dasher.notes.join('\n') : (dasher.notes || "N/A"),
    };
  };

  const exportDashersGroupedCsv = () => {
    try {
      // Collect all dashers from all buckets
      const allBuckets = [];

      // Main categories
      if (Array.isArray(dasherCategories)) {
        dasherCategories.forEach(cat => {
          if (cat.dashers && cat.dashers.length > 0) {
            allBuckets.push({
              name: cat.name || "Unnamed Category",
              dashers: cat.dashers.map(d => ({ ...d, _category: cat.name }))
            });
          }
        });
      }

      // Other buckets
      const otherBuckets = [
        { name: "Ready", dashers: readyDashers },
        { name: "Currently Using", dashers: currentlyUsingDashers },
        { name: "Appealed", dashers: appealedDashers },
        { name: "Deactivated", dashers: deactivatedDashers },
        { name: "Archived", dashers: archivedDashers },
        { name: "Locked", dashers: lockedDashers },
        { name: "Applied Pending", dashers: appliedPendingDashers },
        { name: "Reverif", dashers: reverifDashers },
      ];

      otherBuckets.forEach(bucket => {
        if (bucket.dashers && bucket.dashers.length > 0) {
          allBuckets.push(bucket);
        }
      });

      if (allBuckets.length === 0) {
        setSaveNotification("⚠️ No dashers to export");
        setTimeout(() => setSaveNotification(""), 3000);
        return;
      }

      // CSV header
      const headers = [
        "Bucket", "Category", "ID", "Name", "Email", "Email Password",
        "Dasher Password", "Phone", "Balance", "Crimson", "Red Card",
        "Appealed", "FastPay", "Deactivated", "Ready", "FastPay Info",
        "Crimson Info", "Appealed At", "Crimson At", "Red Card At",
        "Deactivated At", "Ready At", "Last Used", "Notes"
      ];

      let csvContent = headers.map(escapeCsvField).join(',') + '\n';

      // Add dashers grouped by bucket
      allBuckets.forEach(bucket => {
        // Section header with blank row before
        csvContent += '\n';
        // Section header as valid CSV row (24 columns to match header)
        csvContent += `"=== ${bucket.name} ===","","","","","","","","","","","","","","","","","","","","","","",""\n`;

        bucket.dashers.forEach(dasher => {
          const extracted = extractDasherForCsv(dasher, bucket.name, dasher._category || "N/A");
          const row = [
            extracted.bucket,
            extracted.category,
            extracted.id,
            extracted.name,
            extracted.email,
            extracted.emailPw,
            extracted.dasherPw,
            extracted.phone,
            extracted.balance,
            extracted.crimson,
            extracted.redCard,
            extracted.appealed,
            extracted.fastPay,
            extracted.deactivated,
            extracted.ready,
            extracted.fastPayInfo,
            extracted.crimsonInfo,
            extracted.appealedAt,
            extracted.crimsonAt,
            extracted.redCardAt,
            extracted.deactivatedAt,
            extracted.readyAt,
            extracted.lastUsed,
            extracted.notes,
          ];
          csvContent += row.map(escapeCsvField).join(',') + '\n';
        });
      });

      // Download
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, -5);
      const fileName = `dashbash-dashers-grouped-${timestamp}.csv`;

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);

      setSaveNotification(`✅ Exported grouped CSV: ${fileName}`);
      announceSuccess(`Exported grouped CSV: ${fileName}`);
      setTimeout(() => setSaveNotification(""), 3000);
    } catch (error) {
      console.error("CSV export error:", error);
      setSaveNotification("❌ Failed to export CSV");
      announceFailure("Failed to export CSV");
      setTimeout(() => setSaveNotification(""), 3000);
    }
  };

  const exportDashersUngroupedCsv = () => {
    try {
      // Collect all dashers from all buckets
      const allDashers = [];

      // Main categories
      if (Array.isArray(dasherCategories)) {
        dasherCategories.forEach(cat => {
          (cat.dashers || []).forEach(d => {
            allDashers.push(extractDasherForCsv(d, "Main Category", cat.name || "Unnamed"));
          });
        });
      }

      // Other buckets
      (readyDashers || []).forEach(d => allDashers.push(extractDasherForCsv(d, "Ready", "N/A")));
      (currentlyUsingDashers || []).forEach(d => allDashers.push(extractDasherForCsv(d, "Currently Using", "N/A")));
      (appealedDashers || []).forEach(d => allDashers.push(extractDasherForCsv(d, "Appealed", "N/A")));
      (deactivatedDashers || []).forEach(d => allDashers.push(extractDasherForCsv(d, "Deactivated", "N/A")));
      (archivedDashers || []).forEach(d => allDashers.push(extractDasherForCsv(d, "Archived", "N/A")));
      (lockedDashers || []).forEach(d => allDashers.push(extractDasherForCsv(d, "Locked", "N/A")));
      (appliedPendingDashers || []).forEach(d => allDashers.push(extractDasherForCsv(d, "Applied Pending", "N/A")));
      (reverifDashers || []).forEach(d => allDashers.push(extractDasherForCsv(d, "Reverif", "N/A")));

      if (allDashers.length === 0) {
        setSaveNotification("⚠️ No dashers to export");
        setTimeout(() => setSaveNotification(""), 3000);
        return;
      }

      // CSV header
      const headers = [
        "Bucket", "Category", "ID", "Name", "Email", "Email Password",
        "Dasher Password", "Phone", "Balance", "Crimson", "Red Card",
        "Appealed", "FastPay", "Deactivated", "Ready", "FastPay Info",
        "Crimson Info", "Appealed At", "Crimson At", "Red Card At",
        "Deactivated At", "Ready At", "Last Used", "Notes"
      ];

      let csvContent = headers.map(escapeCsvField).join(',') + '\n';

      // Add all dashers
      allDashers.forEach(dasher => {
        const row = [
          dasher.bucket,
          dasher.category,
          dasher.id,
          dasher.name,
          dasher.email,
          dasher.emailPw,
          dasher.dasherPw,
          dasher.phone,
          dasher.balance,
          dasher.crimson,
          dasher.redCard,
          dasher.appealed,
          dasher.fastPay,
          dasher.deactivated,
          dasher.ready,
          dasher.fastPayInfo,
          dasher.crimsonInfo,
          dasher.appealedAt,
          dasher.crimsonAt,
          dasher.redCardAt,
          dasher.deactivatedAt,
          dasher.readyAt,
          dasher.lastUsed,
          dasher.notes,
        ];
        csvContent += row.map(escapeCsvField).join(',') + '\n';
      });

      // Download
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, -5);
      const fileName = `dashbash-dashers-export-${timestamp}.csv`;

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);

      setSaveNotification(`✅ Exported ungrouped CSV: ${fileName}`);
      announceSuccess(`Exported ungrouped CSV: ${fileName}`);
      setTimeout(() => setSaveNotification(""), 3000);
    } catch (error) {
      console.error("CSV export error:", error);
      setSaveNotification("❌ Failed to export CSV");
      announceFailure("Failed to export CSV");
      setTimeout(() => setSaveNotification(""), 3000);
    }
  };

  const exportToJSON = () => {
    try {
      const state = {
        appVersion: "1.7.0",
        schemaVersion: 5,
        target,
        targetPreset,
        prices,
        messages,
        categories,
        noteCategories,
        dasherCategories,
        readyDashers,
        currentlyUsingDashers,
        appealedDashers,
        deactivatedDashers,
        archivedDashers,
        lockedDashers,
        appliedPendingDashers,
        reverifDashers,
        collapsedCategories,
        collapsedStores,
        collapsedDashers,
        collapsedReadyDashers,
        collapsedCurrentlyUsingDashers,
        collapsedAppealedDashers,
        collapsedArchivedDashers,
        collapsedDeactivatedDashers,
        collapsedLockedDashers,
        collapsedAppliedPendingDashers,
        collapsedReverifDashers,
        collapsedDasherCategories,
        collapsedNoteCategories,
        isArchivedDashersOpen,
        isDeactivatedDashersOpen,
        isReadyDashersOpen,
        isCurrentlyUsingDashersOpen,
        isAppealedDashersOpen,
        isLockedDashersOpen,
        isAppliedPendingDashersOpen,
        isReverifDashersOpen,
        showNonZeroOnly,
        dasherSort,
        exportDate: new Date().toISOString(),
        version: "2.1",
      };

      const dataStr = JSON.stringify(state, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," +
        encodeURIComponent(dataStr);

      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);
      const fileName = `dashbash-export-${timestamp}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", fileName);
      linkElement.click();

      setSaveNotification(`✅ Exported to ${fileName}`);
      setTimeout(() => setSaveNotification(""), 3000);
    } catch (e) {
      setSaveNotification("❌ Failed to export data");
      announceFailure("Failed to export data");
      setTimeout(() => setSaveNotification(""), 3000);
    }
  };

  const exportSelected = () => {
    try {
      const exportData = {
        version: "3.0",
        exportType: "selective",
        exportDate: new Date().toISOString(),

        // Include metadata for import handling
        metadata: {
          sourceCategoryStructure: {
            dasherCategories: dasherCategories.map((c) => ({
              id: c.id,
              name: c.name,
            })),
            noteCategories: noteCategories.map((c) => ({
              id: c.id,
              name: c.name,
            })),
            storeCategories: categories.map((c) => ({
              id: c.id,
              name: c.name,
            })),
          },
        },

        // Only include selected data
        dashers: [],
        archivedDashers: [],
        deactivatedDashers: [],
        readyDashers: [],
        currentlyUsingDashers: [],
        appealedDashers: [],
        lockedDashers: [],
        appliedPendingDashers: [],
        reverifDashers: [],
        notes: [],
        stores: [],
        messages: [],

        // Include full categories if all items selected
        fullCategories: {
          dasher: [],
          note: [],
          store: [],
        },
      };

      // Collect selected dashers
      dasherCategories.forEach((cat) => {
        const categoryDashers = cat.dashers.filter((d) =>
          selectedItems.dashers.has(d.id),
        );
        if (categoryDashers.length > 0) {
          if (
            categoryDashers.length === cat.dashers.length &&
            selectedItems.dasherCategories.has(cat.id)
          ) {
            // Full category selected
            exportData.fullCategories.dasher.push({
              ...cat,
              dashers: categoryDashers,
            });
          } else {
            // Individual dashers selected
            exportData.dashers.push(
              ...categoryDashers.map((d) => ({
                ...d,
                sourceCategoryId: cat.id,
                sourceCategoryName: cat.name,
              })),
            );
          }
        }
      });

      // Collect selected archived dashers
      const selectedArchived = archivedDashers.filter((d) =>
        selectedItems.archivedDashers.has(d.id),
      );
      exportData.archivedDashers.push(...selectedArchived);

      // Collect selected deactivated dashers
      const selectedDeactivated = deactivatedDashers.filter((d) =>
        selectedItems.deactivatedDashers?.has(d.id),
      );
      exportData.deactivatedDashers.push(...selectedDeactivated);

      // Collect selected ready dashers
      const selectedReady = readyDashers.filter((d) =>
        selectedItems.readyDashers?.has(d.id),
      );
      exportData.readyDashers.push(...selectedReady);

      // Collect selected currently using dashers
      const selectedCurrentlyUsing = currentlyUsingDashers.filter((d) =>
        selectedItems.currentlyUsingDashers?.has(d.id),
      );
      exportData.currentlyUsingDashers.push(...selectedCurrentlyUsing);

      // Collect selected appealed dashers
      const selectedAppealed = appealedDashers.filter((d) =>
        selectedItems.appealedDashers?.has(d.id),
      );
      exportData.appealedDashers.push(...selectedAppealed);

      // Collect selected locked dashers
      const selectedLocked = lockedDashers.filter((d) =>
        selectedItems.lockedDashers?.has(d.id),
      );
      exportData.lockedDashers.push(...selectedLocked);

      // Collect selected applied pending dashers
      const selectedAppliedPending = appliedPendingDashers.filter((d) =>
        selectedItems.appliedPendingDashers?.has(d.id),
      );
      exportData.appliedPendingDashers.push(...selectedAppliedPending);

      // Collect selected reverif dashers
      const selectedReverif = reverifDashers.filter((d) =>
        selectedItems.reverifDashers?.has(d.id),
      );
      exportData.reverifDashers.push(...selectedReverif);

      // Collect selected notes
      noteCategories.forEach((cat) => {
        const selectedNotes = [];
        cat.notes.forEach((note, index) => {
          const noteId = `${cat.id}-${index}`;
          if (selectedItems.notes.has(noteId)) {
            selectedNotes.push(note);
          }
        });

        if (selectedNotes.length > 0) {
          if (
            selectedNotes.length === cat.notes.length &&
            selectedItems.noteCategories.has(cat.id)
          ) {
            // Full category selected
            exportData.fullCategories.note.push({
              ...cat,
              notes: selectedNotes,
            });
          } else {
            // Individual notes selected
            exportData.notes.push(
              ...selectedNotes.map((n) => ({
                text: n,
                sourceCategoryId: cat.id,
                sourceCategoryName: cat.name,
              })),
            );
          }
        }
      });

      // Collect selected stores
      categories.forEach((cat) => {
        const categoryStores = cat.stores.filter((s) =>
          selectedItems.stores.has(s.id),
        );
        if (categoryStores.length > 0) {
          if (
            categoryStores.length === cat.stores.length &&
            selectedItems.storeCategories.has(cat.id)
          ) {
            // Full category selected
            exportData.fullCategories.store.push({
              ...cat,
              stores: categoryStores,
            });
          } else {
            // Individual stores selected
            exportData.stores.push(
              ...categoryStores.map((s) => ({
                ...s,
                sourceCategoryId: cat.id,
                sourceCategoryName: cat.name,
              })),
            );
          }
        }
      });

      // Collect selected messages
      const selectedMessages = messages.filter((msg, index) =>
        selectedItems.messages.has(index),
      );
      exportData.messages.push(...selectedMessages);

      // Download the file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(dataBlob);
      link.download = `dashbash-selected-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSaveNotification("✓ Selected items exported successfully!");
      setTimeout(() => setSaveNotification(""), 3000);

      // Clear selections after export
      clearAllSelections();
      setIsEditMode(false);
    } catch (error) {
      console.error("Export error:", error);
      setSaveNotification("⚠️ Export failed!");
      announceFailure("Export failed");
      setTimeout(() => setSaveNotification(""), 3000);
    }
  };

  // Normalize imported data to prevent issues (v1.9.4 Performance)
  const normalizeImportedData = (state) => {
    if (!state || typeof state !== "object") return state;

    const normalized = state;

    const normalizeDasherInPlace = (dasher) => {
      if (!dasher || typeof dasher !== "object") return;
      dasher.balance = parseBalanceValue(dasher.balance || 0);
      dasher.phone = String(dasher.phone || "").replace(/\D/g, "");
      dasher.notes = String(dasher.notes || "").slice(0, 3000);
    };

    const normalizeDasherArray = (dashers) => {
      if (!Array.isArray(dashers)) return [];
      for (let i = 0; i < dashers.length; i += 1) {
        normalizeDasherInPlace(dashers[i]);
      }
      return dashers;
    };

    if (Array.isArray(normalized.dasherCategories)) {
      for (let i = 0; i < normalized.dasherCategories.length; i += 1) {
        const cat = normalized.dasherCategories[i];
        if (!cat || typeof cat !== "object") continue;
        cat.dashers = normalizeDasherArray(cat.dashers || []);
      }
    }

    const dasherBuckets = [
      "readyDashers",
      "currentlyUsingDashers",
      "appealedDashers",
      "lockedDashers",
      "appliedPendingDashers",
      "reverifDashers",
      "archivedDashers",
      "deactivatedDashers",
    ];

    dasherBuckets.forEach((bucket) => {
      if (Array.isArray(normalized[bucket])) {
        normalizeDasherArray(normalized[bucket]);
      }
    });

    const collapsedMaps = [
      "collapsedCategories",
      "collapsedStores",
      "collapsedDashers",
      "collapsedDasherCategories",
      "collapsedNoteCategories",
      "collapsedArchivedDashers",
      "collapsedDeactivatedDashers",
      "collapsedReadyDashers",
      "collapsedCurrentlyUsingDashers",
      "collapsedAppealedDashers",
      "collapsedLockedDashers",
      "collapsedAppliedPendingDashers",
      "collapsedReverifDashers",
    ];

    collapsedMaps.forEach((map) => {
      if (!normalized[map] || typeof normalized[map] !== "object") {
        normalized[map] = {};
      }
    });

    return normalized;
  };

  const ensureImportWorker = () => {
    if (typeof Worker === "undefined") return null;
    if (!importWorkerRef.current) {
      try {
        importWorkerRef.current = new Worker("import-worker.js");
      } catch (err) {
        // Worker file not found or failed to load, fallback to main thread parsing
        console.warn("Import worker unavailable, using fallback JSON parsing:", err.message);
        return null;
      }
    }
    return importWorkerRef.current;
  };

  // Parse JSON using Web Worker to avoid main thread blocking (v1.9.5)
  const parseJSONInWorker = (payload, isArrayBuffer = false) => {
    const worker = ensureImportWorker();
    if (!worker) {
      try {
        if (isArrayBuffer && payload instanceof ArrayBuffer) {
          const decoder = new TextDecoder();
          const text = decoder.decode(payload);
          return Promise.resolve(JSON.parse(text));
        }
        if (typeof payload === "string") {
          return Promise.resolve(JSON.parse(payload));
        }
        return Promise.reject(new Error("Unsupported payload without worker"));
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return new Promise((resolve, reject) => {
      const WORKER_TIMEOUT_MS = 10000; // 10 second timeout for large files
      let timeoutId = null;
      let settled = false;

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        worker.removeEventListener("message", handleMessage);
        worker.removeEventListener("error", handleError);
        worker.removeEventListener("messageerror", handleError);
        try {
          worker.terminate();
        } catch { }
        importWorkerRef.current = null;
      };

      const handleMessage = (e) => {
        if (settled) return;
        settled = true;
        const { ok, data, error } = e.data || {};
        cleanup();
        if (ok) {
          resolve(data);
        } else {
          reject(new Error(error || "Worker failed to parse import payload"));
        }
      };

      const handleError = (e) => {
        if (settled) return;
        settled = true;
        cleanup();
        const errorMsg = e?.message || (e?.error?.message) || "Worker script failed to load";
        console.warn("Import worker error:", errorMsg);
        reject(new Error(errorMsg));
      };

      // Timeout guard - prevents infinite hang if worker silently fails
      timeoutId = setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        console.warn("Import worker timeout - falling back to main thread");
        reject(new Error("Worker timeout"));
      }, WORKER_TIMEOUT_MS);

      worker.addEventListener("message", handleMessage);
      worker.addEventListener("error", handleError);
      worker.addEventListener("messageerror", handleError);

      try {
        if (isArrayBuffer && payload instanceof ArrayBuffer) {
          worker.postMessage({ type: "ARRAY_BUFFER", payload }, [payload]);
        } else {
          worker.postMessage(payload);
        }
      } catch (postErr) {
        if (settled) return;
        settled = true;
        cleanup();
        reject(postErr);
      }
    });
  };

  useEffect(() => {
    return () => {
      if (importWorkerRef.current) {
        try {
          importWorkerRef.current.terminate();
        } catch (e) {
          console.warn("[IMPORT] Worker termination failed:", e);
        }
        importWorkerRef.current = null;
      }
    };
  }, []);

  const importFromJSON = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);

    let state;

    try {
      try {
        const buffer = await file.arrayBuffer();
        state = await parseJSONInWorker(buffer, true);
      } catch (workerErr) {
        const fallbackText = await file.text();
        state = JSON.parse(fallbackText);
      }

      migrateLegacyDashers(state);

      const normalizeEmail = (v) => (v || "").trim().toLowerCase();
      const normalizePhone = (v) => String(v || "").replace(/\D/g, "");
      const normalizeName = (v) => (v || "").trim().toLowerCase();
      const dasherIdentityKey = (d) => {
        const em = normalizeEmail(d.email);
        if (em) return `e:${em}`;
        const ph = normalizePhone(d.phone);
        if (ph) return `p:${ph}`;
        const nm = normalizeName(d.name);
        if (nm) return `n:${nm}`;
        return `id:${String(d.id || "")}`;
      };
      const buildExistingDasherKeySet = () => {
        const set = new Set();
        (dasherCategories || []).forEach((c) =>
          (c.dashers || []).forEach((d) => set.add(dasherIdentityKey(d))),
        );
        [
          archivedDashers,
          deactivatedDashers,
          readyDashers,
          currentlyUsingDashers,
          appealedDashers,
          lockedDashers,
          appliedPendingDashers,
          reverifDashers,
        ].forEach((list) =>
          (list || []).forEach((d) => set.add(dasherIdentityKey(d))),
        );
        return set;
      };
      const existingDasherKeys = buildExistingDasherKeySet();
      const filterNewDashers = (arr) =>
        (arr || []).filter((d) => {
          const key = dasherIdentityKey(d);
          if (existingDasherKeys.has(key)) return false;
          existingDasherKeys.add(key);
          return true;
        });

      const runSelectiveImport = () => {
        const timestamp = new Date().toLocaleDateString();

        let importedDasherCategory = null;
        let importedNoteCategory = null;
        let importedStoreCategory = null;

        if (state.dashers && state.dashers.length > 0) {
          const uniqueDashers = filterNewDashers(state.dashers);
          if (uniqueDashers.length > 0) {
            importedDasherCategory = {
              id: "imported-" + Date.now(),
              name: "Imported " + timestamp,
              dashers: uniqueDashers.map((dasher) => ({
                ...dasher,
                id:
                  dasher.id +
                  "-imp-" +
                  Date.now() +
                  "-" +
                  Math.random().toString(36).substr(2, 9),
                imported: true,
                importDate: new Date().toISOString(),
              })),
            };
          }
        }

        if (
          state.fullCategories &&
          state.fullCategories.dasher &&
          state.fullCategories.dasher.length > 0
        ) {
          const importedCategories = state.fullCategories.dasher
            .map((cat) => {
              const uniqueDashers = filterNewDashers(cat.dashers || []);
              if (uniqueDashers.length === 0) return null;
              return {
                ...cat,
                id: cat.id + "-imp-" + Date.now(),
                name: cat.name + " (Imported)",
                dashers: uniqueDashers.map((dasher) => ({
                  ...dasher,
                  id:
                    dasher.id +
                    "-imp-" +
                    Date.now() +
                    "-" +
                    Math.random().toString(36).substr(2, 9),
                  imported: true,
                  importDate: new Date().toISOString(),
                })),
              };
            })
            .filter(Boolean);
          if (importedCategories.length > 0)
            setDasherCategories([
              ...dasherCategories,
              ...importedCategories,
            ]);
        } else if (importedDasherCategory) {
          setDasherCategories([
            ...dasherCategories,
            importedDasherCategory,
          ]);
        }

        if (state.archivedDashers && state.archivedDashers.length > 0) {
          const filtered = filterNewDashers(state.archivedDashers);
          const importedArchived = filtered.map((dasher) => ({
            ...dasher,
            id:
              dasher.id +
              "-imp-" +
              Date.now() +
              "-" +
              Math.random().toString(36).substr(2, 9),
            imported: true,
            importDate: new Date().toISOString(),
          }));
          if (importedArchived.length > 0)
            setArchivedDashers([
              ...archivedDashers,
              ...importedArchived,
            ]);
        }

        if (
          state.deactivatedDashers &&
          state.deactivatedDashers.length > 0
        ) {
          const filtered = filterNewDashers(state.deactivatedDashers);
          const importedDeactivated = filtered.map((dasher) => ({
            ...dasher,
            id:
              dasher.id +
              "-imp-" +
              Date.now() +
              "-" +
              Math.random().toString(36).substr(2, 9),
            imported: true,
            importDate: new Date().toISOString(),
          }));
          if (importedDeactivated.length > 0)
            setDeactivatedDashers([
              ...deactivatedDashers,
              ...importedDeactivated,
            ]);
        }

        if (state.readyDashers && state.readyDashers.length > 0) {
          const filtered = filterNewDashers(state.readyDashers);
          const importedReady = filtered.map((dasher) => ({
            ...dasher,
            id:
              dasher.id +
              "-imp-" +
              Date.now() +
              "-" +
              Math.random().toString(36).substr(2, 9),
            imported: true,
            importDate: new Date().toISOString(),
          }));
          if (importedReady.length > 0)
            setReadyDashers([...readyDashers, ...importedReady]);
        }

        if (
          state.currentlyUsingDashers &&
          state.currentlyUsingDashers.length > 0
        ) {
          const filtered = filterNewDashers(
            state.currentlyUsingDashers,
          );
          const importedCurrentlyUsing = filtered.map((dasher) => ({
            ...dasher,
            id:
              dasher.id +
              "-imp-" +
              Date.now() +
              "-" +
              Math.random().toString(36).substr(2, 9),
            imported: true,
            importDate: new Date().toISOString(),
          }));
          if (importedCurrentlyUsing.length > 0)
            setCurrentlyUsingDashers([
              ...currentlyUsingDashers,
              ...importedCurrentlyUsing,
            ]);
        }

        if (state.appealedDashers && state.appealedDashers.length > 0) {
          const filtered = filterNewDashers(state.appealedDashers);
          const importedAppealed = filtered.map((dasher) => ({
            ...dasher,
            id:
              dasher.id +
              "-imp-" +
              Date.now() +
              "-" +
              Math.random().toString(36).substr(2, 9),
            imported: true,
            importDate: new Date().toISOString(),
          }));
          if (importedAppealed.length > 0)
            setAppealedDashers([
              ...appealedDashers,
              ...importedAppealed,
            ]);
        }

        if (state.lockedDashers && state.lockedDashers.length > 0) {
          const filtered = filterNewDashers(state.lockedDashers);
          const importedLocked = filtered.map((dasher) => ({
            ...dasher,
            id:
              dasher.id +
              "-imp-" +
              Date.now() +
              "-" +
              Math.random().toString(36).substr(2, 9),
            imported: true,
            importDate: new Date().toISOString(),
          }));
          if (importedLocked.length > 0)
            setLockedDashers([...lockedDashers, ...importedLocked]);
        }

        if (
          state.appliedPendingDashers &&
          state.appliedPendingDashers.length > 0
        ) {
          const filtered = filterNewDashers(
            state.appliedPendingDashers,
          );
          const importedAppliedPending = filtered.map((dasher) => ({
            ...dasher,
            id:
              dasher.id +
              "-imp-" +
              Date.now() +
              "-" +
              Math.random().toString(36).substr(2, 9),
            imported: true,
            importDate: new Date().toISOString(),
          }));
          if (importedAppliedPending.length > 0)
            setAppliedPendingDashers([
              ...appliedPendingDashers,
              ...importedAppliedPending,
            ]);
        }

        if (state.reverifDashers && state.reverifDashers.length > 0) {
          const filtered = filterNewDashers(state.reverifDashers);
          const importedReverif = filtered.map((dasher) => ({
            ...dasher,
            id:
              dasher.id +
              "-imp-" +
              Date.now() +
              "-" +
              Math.random().toString(36).substr(2, 9),
            imported: true,
            importDate: new Date().toISOString(),
          }));
          if (importedReverif.length > 0) {
            setReverifDashers([...reverifDashers, ...importedReverif]);
          }
        }

        if (state.notes && state.notes.length > 0) {
          importedNoteCategory = {
            id: "imported-notes-" + Date.now(),
            name: "Imported Notes " + timestamp,
            notes: state.notes.map((n) => n.text || n),
          };
        }

        if (
          state.fullCategories &&
          state.fullCategories.note &&
          state.fullCategories.note.length > 0
        ) {
          const importedCategories = state.fullCategories.note.map(
            (cat) => ({
              ...cat,
              id: cat.id + "-imp-" + Date.now(),
              name: cat.name + " (Imported)",
            }),
          );
          setNoteCategories([...noteCategories, ...importedCategories]);
        } else if (importedNoteCategory) {
          setNoteCategories([...noteCategories, importedNoteCategory]);
        }

        if (state.stores && state.stores.length > 0) {
          importedStoreCategory = {
            id: "imported-stores-" + Date.now(),
            name: "Imported Stores " + timestamp,
            stores: state.stores.map((store) => ({
              ...store,
              id: store.id + "-imp-" + Date.now(),
            })),
          };
        }

        if (
          state.fullCategories &&
          state.fullCategories.store &&
          state.fullCategories.store.length > 0
        ) {
          const importedCategories = state.fullCategories.store.map(
            (cat) => ({
              ...cat,
              id: cat.id + "-imp-" + Date.now(),
              name: cat.name + " (Imported)",
              stores: cat.stores.map((store) => ({
                ...store,
                id: store.id + "-imp-" + Date.now(),
              })),
            }),
          );
          setCategories([...categories, ...importedCategories]);
        } else if (importedStoreCategory) {
          setCategories([...categories, importedStoreCategory]);
        }

        if (state.messages && state.messages.length > 0) {
          const existing = new Set((messages || []).map((m) => String(m)));
          const toAdd = (state.messages || []).filter(
            (m) => !existing.has(String(m)),
          );
          if (toAdd.length > 0)
            setMessages([...(messages || []), ...toAdd]);
        }

        setImportNotification(
          `✅ Imported selected items into new categories from ${file.name}`,
        );
        setTimeout(() => setImportNotification(""), 3000);
        requestPersist();
      };

      const runFullImport = () => {
        const normalized = normalizeImportedData(state);

        const applyBatchedImport = () => {
          const savedTarget = normalized.target || "99";
          const savedPreset =
            normalized.targetPreset ||
            (savedTarget === "99" || savedTarget === "120"
              ? savedTarget
              : "custom");

          setTarget(savedTarget);
          setTargetPreset(savedPreset);
          if (savedPreset === "custom") {
            setCustomTarget(savedTarget);
          }

          setPrices(normalized.prices || []);
          setMessages(normalized.messages || []);
          setCategories(normalized.categories || []);

          if (normalized.noteCategories) setNoteCategories(normalized.noteCategories);
          if (normalized.dasherCategories) setDasherCategories(normalized.dasherCategories);
          if (normalized.archivedDashers) setArchivedDashers(normalized.archivedDashers);
          if (normalized.deactivatedDashers) setDeactivatedDashers(normalized.deactivatedDashers);
          if (normalized.readyDashers) setReadyDashers(normalized.readyDashers);
          if (normalized.currentlyUsingDashers) setCurrentlyUsingDashers(normalized.currentlyUsingDashers);
          if (normalized.appealedDashers) setAppealedDashers(normalized.appealedDashers);
          if (normalized.lockedDashers) setLockedDashers(normalized.lockedDashers);
          if (normalized.appliedPendingDashers) setAppliedPendingDashers(normalized.appliedPendingDashers);
          if (normalized.reverifDashers) setReverifDashers(normalized.reverifDashers);

          if (normalized.collapsedCategories) setCollapsedCategories(normalized.collapsedCategories);
          if (normalized.collapsedStores) setCollapsedStores(normalized.collapsedStores);
          if (normalized.collapsedDashers) setCollapsedDashers(normalized.collapsedDashers);
          if (normalized.collapsedArchivedDashers) setCollapsedArchivedDashers(normalized.collapsedArchivedDashers);
          if (normalized.collapsedDasherCategories) setCollapsedDasherCategories(normalized.collapsedDasherCategories);
          if (normalized.collapsedNoteCategories) setCollapsedNoteCategories(normalized.collapsedNoteCategories);
          if (normalized.collapsedDeactivatedDashers) setCollapsedDeactivatedDashers(normalized.collapsedDeactivatedDashers);
          if (normalized.collapsedLockedDashers) setCollapsedLockedDashers(normalized.collapsedLockedDashers);
          if (normalized.collapsedAppliedPendingDashers) setCollapsedAppliedPendingDashers(normalized.collapsedAppliedPendingDashers);
          if (normalized.collapsedReverifDashers) setCollapsedReverifDashers(normalized.collapsedReverifDashers);

          if (normalized.isArchivedDashersOpen !== undefined) setIsArchivedDashersOpen(normalized.isArchivedDashersOpen);
          if (normalized.isDeactivatedDashersOpen !== undefined) setIsDeactivatedDashersOpen(normalized.isDeactivatedDashersOpen);
          if (normalized.isReadyDashersOpen !== undefined) setIsReadyDashersOpen(normalized.isReadyDashersOpen);
          if (normalized.isCurrentlyUsingDashersOpen !== undefined) setIsCurrentlyUsingDashersOpen(normalized.isCurrentlyUsingDashersOpen);
          if (normalized.isAppealedDashersOpen !== undefined) setIsAppealedDashersOpen(normalized.isAppealedDashersOpen);
          if (normalized.isLockedDashersOpen !== undefined) setIsLockedDashersOpen(normalized.isLockedDashersOpen);
          if (normalized.isAppliedPendingDashersOpen !== undefined) setIsAppliedPendingDashersOpen(normalized.isAppliedPendingDashersOpen);
          if (normalized.isReverifDashersOpen !== undefined) setIsReverifDashersOpen(normalized.isReverifDashersOpen);

          if (normalized.showNonZeroOnly !== undefined) setShowNonZeroOnly(normalized.showNonZeroOnly);
          if (normalized.dasherSort) setDasherSort(normalized.dasherSort);

          if (normalized.results) setResults(normalized.results);
          if (normalized.resultsSort) setResultsSort(normalized.resultsSort);
          if (normalized.resultsBucketFilter) setResultsBucketFilter(normalized.resultsBucketFilter);
          if (normalized.resultsFlagFilters) setResultsFlagFilters(normalized.resultsFlagFilters);

          if (normalized.selectedItems) setSelectedItems(normalized.selectedItems);

          if (normalized.dashboardFilters) setDashboardFilters(normalized.dashboardFilters);
          if (normalized.dashboardSort) setDashboardSort(normalized.dashboardSort);

          if (normalized.notesView) setNotesView(normalized.notesView);
          if (normalized.selectionMode) setSelectionMode(normalized.selectionMode);
        };

        startImportTransition(() => {
          applyBatchedImport();
        });

        setImportNotification(`✅ Imported data from ${file.name}`);
        setTimeout(() => setImportNotification(""), 3000);
      };

      const runAllUpdates = () => {
        if (state.version === "3.0" && state.exportType === "selective") {
          runSelectiveImport();
        } else {
          runFullImport();
        }
      };

      if (ReactDOM?.unstable_batchedUpdates) {
        ReactDOM.unstable_batchedUpdates(runAllUpdates);
      } else {
        runAllUpdates();
      }
    } catch (err) {
      console.error("Import error:", err);
      setImportNotification(
        "❌ Failed to import - invalid file format",
      );
      announceFailure("Failed to import data. Invalid file format");
      setTimeout(() => setImportNotification(""), 3000);
    } finally {
      state = null;
      setIsImporting(false);
      if (event?.target) {
        try {
          event.target.value = "";
        } catch (e) {
          console.warn("[IMPORT] Could not reset file input:", e);
        }
      }
    }
  };


  const clearAllData = () => {
    showConfirm(
      "Are you sure you want to clear all data? This cannot be undone.",
      () => {
        setTarget("99");
        setTargetPreset("99");
        setCustomTarget("");
        setIsEditingTarget(false);
        setPrices([]);
        setMessages([
          "Ok someone got it! darn it i just noticed i put the tip so high by accident :( can u help change the tip to $0 pls?",
          "Thanks, have a great day! <3",
          "Yes",
          "AGENT",
          "hi can u pls see if u can help get a dasher assigned quicker!? I'm in a rush to get to work asap! Thank you",
          "unassign this driver, we have had issues in the past, restraining order, stole my order last time, ASAP PLEASE, Thank you!",
          "Adjust dasher tip to $0 for the current order",
          "customer asked for refund if out of stock",
        ]);
        setCategories([]);
        setNoteCategories([
          { id: Date.now().toString(), name: "General", notes: [] },
        ]);
        setDasherCategories([
          { id: "main", name: "Main", dashers: [] },
          { id: "currently-using", name: "Currently using", dashers: [] },
          { id: "deactivated", name: "Deactivated", dashers: [] },
          { id: "locked", name: "Locked", dashers: [] },
          { id: "reverif", name: "Reverif", dashers: [] },
          { id: "ready", name: "Ready", dashers: [] },
        ]);
        localStorage.removeItem("dashBashState");
        localStorage.removeItem("addressBookCategories");
        // Also clear IndexedDB to prevent rehydration on reload
        try {
          const deleteRequest = indexedDB.deleteDatabase("DashBashDB");
          deleteRequest.onerror = () => console.warn('[CLEAR] IndexedDB delete failed/blocked - data may persist');
          deleteRequest.onblocked = () => console.warn('[CLEAR] IndexedDB delete blocked - close other tabs');
        } catch (error) {
          console.error('[CLEAR] IndexedDB delete error:', error);
        }
        setSaveNotification("✅ All data cleared");
        setTimeout(() => setSaveNotification(""), 3000);
      },
      { title: "Clear All Data", confirmText: "Clear All", cancelText: "Cancel" },
    );
  };

  // Balance parsing helper with validation and clamping
  function parseBalanceValue(raw) {
    if (raw === null || raw === undefined) return 0;
    if (typeof raw === "number") {
      // Clamp to reasonable range using defined constants
      return Math.max(MIN_BALANCE, Math.min(MAX_BALANCE, raw));
    }
    const n = parseFloat(String(raw).replace(/[^0-9.\-]/g, ""));
    if (isNaN(n)) return 0;
    // Clamp parsed value to prevent extreme balances
    return Math.max(MIN_BALANCE, Math.min(MAX_BALANCE, n));
  }

  function safeFieldSegment(value) {
    return String(value ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
  }

  // Global filter/sort helper (replaces useFilteredSortedDashers)
  function filterAndSortDashers(list) {
    const q = (globalQueryDebouncedRef.current || "")
      .trim()
      .toLowerCase();
    let filtered = list;
    if (q) {
      filtered = filtered.filter(
        (d) =>
          (d.name || "").toLowerCase().includes(q) ||
          (d.email || "").toLowerCase().includes(q) ||
          (d.phone || "").toLowerCase().includes(q),
      );
    }
    if (showNonZeroOnly) {
      filtered = filtered.filter(
        (d) => parseBalanceValue(d.balance) !== 0,
      );
    }
    if (dasherSort.key !== "none") {
      const dir = dasherSort.dir === "asc" ? 1 : -1;
      filtered = [...filtered].sort((a, b) => {
        if (dasherSort.key === "balance") {
          const av = parseBalanceValue(a.balance),
            bv = parseBalanceValue(b.balance);
          return av === bv ? 0 : av > bv ? dir : -dir;
        }
        if (dasherSort.key === "lastUsed") {
          const av = a.lastUsed ? new Date(a.lastUsed).getTime() : 0;
          const bv = b.lastUsed ? new Date(b.lastUsed).getTime() : 0;
          return av === bv ? 0 : av > bv ? dir : -dir;
        }
        if (dasherSort.key === "alphabetical") {
          const av = (a.name || "").toLowerCase();
          const bv = (b.name || "").toLowerCase();
          return av === bv ? 0 : av > bv ? dir : -dir;
        }
        return 0;
      });
    }
    return filtered;
  }

  // Date/time formatting helper
  function formatDateTime(iso) {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  }

  const renderCashOutHistory = (dasher, isEditing) => {
    if (!dasher) return null;

    const historyEntries = ensureArray(dasher.cashOutHistory);

    // Always allow editing/adding: use a stable scope key regardless of isEditing
    const cashScopeKey = `card-${safeFieldSegment("cashout")}-${safeFieldSegment(dasher?.id ?? dasher?.email ?? dasher?.phone ?? "dash")}`;

    const draft = getDraftForKey(cashScopeKey) || {};

    const setDraft = (updater) => setDraftForKey(cashScopeKey, updater);

    const amtStr = draft._addCashOutAmount || "";

    const amtNum = deriveNumericAmount(amtStr);

    const hasAmt = String(amtStr).trim() !== "";

    const validAmt = Number.isFinite(amtNum) && amtNum > 0;

    const err = draft._addCashOutError || "";

    const cashOutAmountInputId = `inline-cashout-${cashScopeKey}`;

    const cashOutErrorId = `${cashOutAmountInputId}-error`;

    const handleDeleteEntry = isEditing
      ? (index) => {
        deleteHistoryEntry(dasher.id, index);

        announceSuccess("Cash-out entry removed");
      }
      : () => { };

    // Extracted handler to avoid deeply nested braces in inline prop
    const handleAddCashOut = () => {
      const amt = deriveNumericAmount(draft._addCashOutAmount);
      if (!Number.isFinite(amt) || amt <= 0) {
        const errMsg = "Enter a valid positive amount.";
        setDraft((d) => ({ ...d, _addCashOutError: errMsg }));
        setTimeout(() => {
          const inputNode = document.getElementById(cashOutAmountInputId);
          if (inputNode) {
            inputNode.focus();
            if (typeof inputNode.select === "function")
              inputNode.select();
          }
        }, 0);
        announceFailure(errMsg);
        return;
      }

      const nowIso = new Date().toISOString();
      const method =
        (draft._addCashOutMethod || "custom").trim() || "custom";
      const notes = (draft._addCashOutNotes || "").trim();
      const adjustBalance = !!draft._addCashOutAdjust;

      const targets = getDescriptorsForDasher(dasher, {
        fallbackHint: `cashout-${dasher?.id ?? dasher?.email ?? dasher?.phone ?? "dash"}`,
      });

      const applyCashOut = (existing) => {
        const base = {
          id:
            typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : `co-${Date.now()}`,
          amount: amt.toFixed(2),
          method,
          notes,
          at: nowIso,
        };
        const history = ensureArray(existing.cashOutHistory);
        const nextHistory = [...history, base];
        let nextBalance = existing.balance;
        if (adjustBalance) {
          const cur = parseBalanceValue(existing.balance || "0");
          const updated = Math.max(0, cur - amt);
          nextBalance = updated.toString();
        }
        return {
          ...existing,
          balance: nextBalance,
          cashOutHistory: nextHistory,
          lastCashOutRef: adjustBalance
            ? { id: base.id, index: nextHistory.length - 1 }
            : existing.lastCashOutRef || null,
        };
      };

      if (!targets || targets.length === 0) {
        const errMsg = "Couldn't locate matching dasher record.";
        setDraft((d) => ({ ...d, _addCashOutError: errMsg }));
        setTimeout(() => {
          const inputNode = document.getElementById(cashOutAmountInputId);
          if (inputNode) {
            inputNode.focus();
            if (typeof inputNode.select === "function")
              inputNode.select();
          }
        }, 0);
        announceFailure(errMsg);
        return;
      }

      targets.forEach((descriptor) => {
        mutateDasherByMeta(descriptor, applyCashOut);
      });

      requestPersist();
      setDraft((d) => ({
        _addCashOutAmount: "",
        _addCashOutMethod: "",
        _addCashOutNotes: "",
        _addCashOutAdjust: false,
        _addCashOutError: "",
      }));
      announceSuccess("Cash-out added");
      setTimeout(() => {
        const inputNode = document.getElementById(cashOutAmountInputId);
        if (inputNode) {
          inputNode.focus();
          if (typeof inputNode.select === "function") inputNode.select();
        }
      }, 50);
    };

    const addForm = React.createElement(
      "div",
      {
        key: "addFormWrapper",
        className: "pt-3 border-t border-gray-700/80 mt-2",
      },
      [
        React.createElement(
          "div",
          {
            key: "addRow",
            className: "db-field-row db-align-center gap-3",
          },
          [
            React.createElement(
              "div",
              { key: "a1", className: "db-col-amount" },
              React.createElement("input", {
                id: cashOutAmountInputId,

                type: "number",

                min: 0,

                step: "0.01",

                value: amtStr,
                onChange: (e) =>
                  setDraft((d) => ({
                    ...d,
                    _addCashOutAmount: e.target.value,
                    _addCashOutError: "",
                  })),
                placeholder: "Amount",
                className: "db-input-sm w-28 placeholder-gray-400",
                "aria-label": "Add cash-out amount",

                "aria-invalid": err
                  ? "true"
                  : hasAmt && !validAmt
                    ? "true"
                    : "false",

                "aria-describedby": err ? cashOutErrorId : undefined,
              }),
            ),

            React.createElement(
              "div",
              { key: "a2", className: "db-col-source" },
              React.createElement("input", {
                type: "text",
                value: draft._addCashOutMethod || "",
                onChange: (e) =>
                  setDraft((d) => ({
                    ...d,
                    _addCashOutMethod: e.target.value,
                  })),
                placeholder: "Method",
                className: "db-input-sm w-32 placeholder-gray-400",
                "aria-label": "Add cash-out method",
              }),
            ),

            React.createElement(
              "div",
              { key: "a3", className: "db-col-notes" },
              React.createElement("input", {
                type: "text",
                value: draft._addCashOutNotes || "",
                onChange: (e) =>
                  setDraft((d) => ({
                    ...d,
                    _addCashOutNotes: e.target.value,
                  })),
                placeholder: "Notes",
                className: "db-input-sm w-full placeholder-gray-400",
                "aria-label": "Add cash-out notes",
              }),
            ),

            React.createElement(
              "label",
              {
                key: "adj",
                className:
                  "flex items-center gap-2 text-[11px] text-gray-300",
              },
              [
                React.createElement("input", {
                  type: "checkbox",

                  checked: !!draft._addCashOutAdjust,

                  onChange: (e) =>
                    setDraft((d) => ({
                      ...d,
                      _addCashOutAdjust: e.target.checked,
                    })),
                }),

                React.createElement("span", null, "Adjust balance"),
              ],
            ),

            React.createElement(
              "button",
              {
                key: "addBtn",
                disabled: !hasAmt,
                onClick: handleAddCashOut,
                className:
                  "px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-xs text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors",
              },
              "Add",
            ),
          ],
        ),
        err &&
        React.createElement(
          "div",
          {
            key: "err",
            id: cashOutErrorId,
            className: "text-[11px] text-red-400 mt-1",
            role: "status",
            "aria-live": "polite",
          },
          err,
        ),
      ],
    );

    if (isEditing) {
      return React.createElement("div", { className: "space-y-3 mt-2" }, [
        React.createElement(
          "div",
          {
            key: "histLabel",
            className: "text-xs uppercase tracking-wide text-gray-400",
          },
          "Cash‑Out History",
        ),
        historyEntries.length > 0
          ? React.createElement(
            "div",
            { key: "histList", className: "space-y-1" },
            [
              React.createElement(
                "div",
                { key: "tableWrap", className: "overflow-x-auto" },
                React.createElement(
                  "table",
                  {
                    className:
                      "w-full text-[11px] border-separate border-spacing-y-1",
                  },
                  [
                    React.createElement(
                      "thead",
                      { key: "thead", className: "text-gray-400" },
                      React.createElement("tr", null, [
                        React.createElement(
                          "th",
                          {
                            className:
                              "text-left font-medium px-2 py-1",
                          },
                          "Amount",
                        ),
                        React.createElement(
                          "th",
                          {
                            className:
                              "text-left font-medium px-2 py-1",
                          },
                          "Method",
                        ),
                        React.createElement(
                          "th",
                          {
                            className:
                              "text-left font-medium px-2 py-1",
                          },
                          "Notes",
                        ),
                        React.createElement(
                          "th",
                          {
                            className:
                              "text-left font-medium px-2 py-1",
                          },
                          "Time",
                        ),
                        React.createElement(
                          "th",
                          {
                            className:
                              "text-left font-medium px-2 py-1 w-20",
                          },
                          "Actions",
                        ),
                      ]),
                    ),
                    React.createElement(
                      "tbody",
                      { key: "tbody" },
                      historyEntries.map((h, i) =>
                        React.createElement(
                          "tr",
                          {
                            key: h.id || i,
                            className:
                              "bg-gray-800/60 border border-gray-700 rounded",
                          },
                          [
                            React.createElement(
                              "td",
                              {
                                className:
                                  "px-2 py-1 align-top whitespace-nowrap min-w-[96px]",
                              },
                              React.createElement("input", {
                                type: "number",
                                step: "0.01",
                                min: 0,
                                className:
                                  "db-input-sm w-24 text-green-200 font-mono",
                                value:
                                  typeof h.amount === "string" ||
                                    typeof h.amount === "number"
                                    ? String(h.amount)
                                    : "",
                                onChange: (e) =>
                                  debouncedUpdateHistoryEntry(
                                    dasher.id,
                                    i,
                                    { amount: e.target.value },
                                  ),
                                onBlur: (e) => {
                                  const v = parseFloat(e.target.value);
                                  const key = `${dasher.id}:${i}`;
                                  if (!isNaN(v) && v >= 0)
                                    updateHistoryEntry(dasher.id, i, {
                                      amount: v.toFixed(2),
                                    });
                                  // Cancel any pending debounce after immediate commit
                                  cancelDebounceForKey(key);
                                },
                              }),
                            ),
                            React.createElement(
                              "td",
                              {
                                className:
                                  "px-2 py-1 align-top whitespace-nowrap min-w-[120px]",
                              },
                              React.createElement("input", {
                                type: "text",
                                className: "db-input-sm w-32",
                                value: h.method || "",
                                onChange: (e) =>
                                  debouncedUpdateHistoryEntry(
                                    dasher.id,
                                    i,
                                    { method: e.target.value },
                                  ),
                                onBlur: (e) => {
                                  const key = `${dasher.id}:${i}`;
                                  updateHistoryEntry(dasher.id, i, {
                                    method: e.target.value,
                                  });
                                  cancelDebounceForKey(key);
                                },
                              }),
                            ),
                            React.createElement(
                              "td",
                              {
                                className:
                                  "px-2 py-1 align-top min-w-[200px]",
                              },
                              React.createElement("input", {
                                type: "text",
                                className: "db-input-sm w-full",
                                value: h.notes || "",
                                onChange: (e) =>
                                  debouncedUpdateHistoryEntry(
                                    dasher.id,
                                    i,
                                    { notes: e.target.value },
                                  ),
                                onBlur: (e) => {
                                  const key = `${dasher.id}:${i}`;
                                  updateHistoryEntry(dasher.id, i, {
                                    notes: e.target.value,
                                  });
                                  cancelDebounceForKey(key);
                                },
                              }),
                            ),
                            React.createElement(
                              "td",
                              {
                                className:
                                  "px-2 py-1 align-top text-gray-400 whitespace-nowrap",
                              },
                              h.at ? formatDateTime(h.at) : "",
                            ),
                            React.createElement(
                              "td",
                              { className: "px-2 py-1 align-top" },
                              React.createElement(
                                "button",
                                {
                                  onClick: () => handleDeleteEntry(i),
                                  className:
                                    "text-red-300 hover:text-red-200 px-2 py-1 rounded bg-gray-900/70 border border-transparent hover:border-red-300/40 transition-colors",
                                  title: "Delete entry",
                                },
                                React.createElement(Trash2, {
                                  size: 12,
                                }),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          )
          : React.createElement(
            "div",
            {
              key: "emptyHist",
              className: "text-xs text-gray-500 italic",
            },
            "No history",
          ),
        addForm,
      ]);
    }

    // READ-ONLY MODE
    if (!historyEntries.length) {
      return React.createElement("div", { className: "mt-2" }, [
        React.createElement(
          "div",
          { className: "text-[11px] text-gray-500 italic" },
          "No cash‑outs",
        ),
        addForm,
      ]);
    }

    const collapsed = isCashOutNotesCollapsed(dasher.id);
    return React.createElement("div", { className: "mt-2" }, [
      React.createElement(
        "div",
        { key: "label", className: "text-[11px] text-gray-400 mb-1" },
        `${historyEntries.length} cash‑out${historyEntries.length > 1 ? "s" : ""}`,
      ),
      React.createElement(
        "div",
        {
          key: "controls",
          className: "flex items-center justify-end mb-1",
        },
        [
          React.createElement(
            "button",
            {
              key: "toggleNotes",
              onClick: () =>
                setCashOutNotesCollapsed(dasher.id, !collapsed),
              className: "text-[11px] text-blue-300 hover:text-blue-200",
              title: collapsed ? "Show full notes" : "Show single line",
            },
            collapsed ? "Show full notes" : "Collapse notes",
          ),
        ],
      ),
      React.createElement(
        "div",
        { key: "tablewrap", className: "overflow-x-auto" },
        React.createElement(
          "table",
          {
            className:
              "w-full text-[11px] border-separate border-spacing-y-1",
          },
          [
            React.createElement(
              "thead",
              { key: "thead", className: "text-gray-400" },
              React.createElement("tr", null, [
                React.createElement(
                  "th",
                  { className: "text-left font-medium px-2 py-1" },
                  "Amount",
                ),
                React.createElement(
                  "th",
                  { className: "text-left font-medium px-2 py-1" },
                  "Method",
                ),
                React.createElement(
                  "th",
                  { className: "text-left font-medium px-2 py-1" },
                  "Notes",
                ),
                React.createElement(
                  "th",
                  { className: "text-left font-medium px-2 py-1" },
                  "Time",
                ),
              ]),
            ),
            React.createElement(
              "tbody",
              { key: "tbody" },
              historyEntries.map((h, i) =>
                React.createElement(
                  "tr",
                  {
                    key: h.id || i,
                    className:
                      "bg-gray-800/60 border border-gray-700 rounded",
                  },
                  [
                    React.createElement(
                      "td",
                      {
                        className:
                          "px-2 py-1 align-top font-mono text-green-300 whitespace-nowrap",
                      },
                      `$${Number(h.amount || 0).toFixed(2)}`,
                    ),
                    React.createElement(
                      "td",
                      {
                        className:
                          "px-2 py-1 align-top text-gray-300 whitespace-nowrap",
                      },
                      h.method || "auto",
                    ),
                    React.createElement(
                      "td",
                      {
                        className: `px-2 py-1 align-top text-gray-200 ${collapsed ? "truncate max-w-[28ch]" : "break-words"} `,
                      },
                      h.notes || "",
                    ),
                    React.createElement(
                      "td",
                      {
                        className:
                          "px-2 py-1 align-top text-gray-400 whitespace-nowrap",
                      },
                      h.at ? formatDateTime(h.at) : "",
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      addForm,
    ]);
  };

  const migrateLegacyDashers = (stateObj) => {
    if (!stateObj || typeof stateObj !== "object") return;

    const ensureHistoryArray = (list) => {
      if (!Array.isArray(list)) return;
      list.forEach((dasher) => {
        if (!Array.isArray(dasher.cashOutHistory)) {
          dasher.cashOutHistory = [];
        }
        if (!Array.isArray(dasher.earningsHistory)) {
          dasher.earningsHistory = [];
        }
      });
    };

    // Ensure new cash-out related fields exist on every dasher
    const ensureNewCashoutFields = (list) => {
      if (!Array.isArray(list)) return;
      list.forEach((dasher) => {
        if (dasher.fastPay === undefined) dasher.fastPay = false;
        if (typeof dasher.fastPayInfo !== "string")
          dasher.fastPayInfo = "";
        if (typeof dasher.crimsonInfo !== "string")
          dasher.crimsonInfo = "";
        if (typeof dasher.selectedCashout !== "string")
          dasher.selectedCashout = "";
        // Normalize selectedCashout values
        const sc = String(dasher.selectedCashout || "").toLowerCase();
        if (sc !== "crimson" && sc !== "fastpay")
          dasher.selectedCashout = "";
        // Backfill timestamp fields to explicit nulls if missing (optional, stable)
        if (dasher.crimson && !("crimsonAt" in dasher))
          dasher.crimsonAt = null;
        if (dasher.redCard && !("redCardAt" in dasher))
          dasher.redCardAt = null;
      });
    };

    if (
      !stateObj.deactivatedDashers &&
      Array.isArray(stateObj.dasherCategories)
    ) {
      const legacyDeactivated = stateObj.dasherCategories.find(
        (cat) => cat.id === "deactivated",
      );
      if (legacyDeactivated && Array.isArray(legacyDeactivated.dashers)) {
        stateObj.deactivatedDashers = legacyDeactivated.dashers;
      }
    }

    if (
      !stateObj.archivedDashers &&
      Array.isArray(stateObj.dasherCategories)
    ) {
      const legacyArchived = stateObj.dasherCategories.find(
        (cat) => cat.id === "archived",
      );
      if (legacyArchived && Array.isArray(legacyArchived.dashers)) {
        stateObj.archivedDashers = legacyArchived.dashers;
      }
    }

    if (
      !stateObj.lockedDashers &&
      Array.isArray(stateObj.dasherCategories)
    ) {
      const legacyLocked = stateObj.dasherCategories.find(
        (cat) => cat.id === "locked",
      );
      if (legacyLocked && Array.isArray(legacyLocked.dashers)) {
        stateObj.lockedDashers = legacyLocked.dashers;
      } else {
        stateObj.lockedDashers = [];
      }
    } else if (!stateObj.lockedDashers) {
      stateObj.lockedDashers = [];
    }

    if (
      !stateObj.appliedPendingDashers &&
      Array.isArray(stateObj.dasherCategories)
    ) {
      const legacyAppliedPending = stateObj.dasherCategories.find(
        (cat) => cat.id === "applied-pending",
      );
      if (
        legacyAppliedPending &&
        Array.isArray(legacyAppliedPending.dashers)
      ) {
        stateObj.appliedPendingDashers = legacyAppliedPending.dashers;
      } else {
        stateObj.appliedPendingDashers = [];
      }
    } else if (!stateObj.appliedPendingDashers) {
      stateObj.appliedPendingDashers = [];
    }

    if (
      !stateObj.reverifDashers &&
      Array.isArray(stateObj.dasherCategories)
    ) {
      const legacyReverif = stateObj.dasherCategories.find(
        (cat) => cat.id === "reverif",
      );
      if (legacyReverif && Array.isArray(legacyReverif.dashers)) {
        stateObj.reverifDashers = legacyReverif.dashers;
      } else {
        stateObj.reverifDashers = [];
      }
    } else if (!stateObj.reverifDashers) {
      stateObj.reverifDashers = [];
    }

    if (Array.isArray(stateObj.dasherCategories)) {
      const collected = stateObj.dasherCategories.reduce((acc, cat) => {
        if (cat && Array.isArray(cat.dashers)) {
          return acc.concat(cat.dashers);
        }
        return acc;
      }, []);
      ensureHistoryArray(collected);
      ensureNewCashoutFields(collected);
    }
    ensureHistoryArray(stateObj.deactivatedDashers);
    ensureNewCashoutFields(stateObj.deactivatedDashers);
    ensureHistoryArray(stateObj.archivedDashers);
    ensureNewCashoutFields(stateObj.archivedDashers);
    ensureHistoryArray(stateObj.readyDashers);
    ensureNewCashoutFields(stateObj.readyDashers);
    ensureHistoryArray(stateObj.currentlyUsingDashers);
    ensureNewCashoutFields(stateObj.currentlyUsingDashers);
    ensureHistoryArray(stateObj.appealedDashers);
    ensureNewCashoutFields(stateObj.appealedDashers);
    ensureHistoryArray(stateObj.lockedDashers);
    ensureNewCashoutFields(stateObj.lockedDashers);
    ensureHistoryArray(stateObj.appliedPendingDashers);
    ensureNewCashoutFields(stateObj.appliedPendingDashers);
    ensureHistoryArray(stateObj.reverifDashers);
    ensureNewCashoutFields(stateObj.reverifDashers);
  };

  // Cash out helper - records cash out entry, zeros balance, and saves
  // Local ID comparator to handle string/number mismatches safely
  const idsEq = (a, b) => String(a) === String(b);
  // [PERF-STAGE3] Wrap in useCallback for stable identity
  // [PERF-STAGE7] measure cash-out performance
  const addCashOutEntry = useCallback((
    sourceKey,
    dasherOrId,
    method = "auto",
  ) => {
    performance.mark('cashOut-start');
    const normalizedMethod = (method && method.trim()) || "auto";
    const candidateDasher =
      dasherOrId && typeof dasherOrId === "object"
        ? dasherOrId
        : null;
    const targetIdRaw =
      candidateDasher && candidateDasher.id !== undefined && candidateDasher.id !== null
        ? candidateDasher.id
        : dasherOrId;
    if (targetIdRaw === undefined || targetIdRaw === null) {
      return;
    }
    const targetId = String(targetIdRaw);
    let dasherFound = null;
    let categoryKey = null;
    const normalizedSourceKey =
      typeof sourceKey === "string" && sourceKey.length > 0
        ? sourceKey
        : null;
    const showSuccessToast = (amountVal) => {
      const msg = `Cashed out $${Number(amountVal).toFixed(2)}`;
      const run = () => {
        if (saveNotificationTimeoutRef.current) {
          clearTimeout(saveNotificationTimeoutRef.current);
          saveNotificationTimeoutRef.current = null;
        }
        setSaveNotification(msg);
        saveNotificationTimeoutRef.current = setTimeout(() => {
          setSaveNotification("");
          saveNotificationTimeoutRef.current = null;
        }, 2000);
      };
      if (moveToastActiveRef.current) setTimeout(run, 2600);
      else run();
    };

    const assignFromList = (list, bucketId) => {
      if (!Array.isArray(list)) return false;
      const match = list.find((d) => idsEq(d.id, targetId));
      if (match) {
        dasherFound = match;
        categoryKey = bucketId;
        return true;
      }
      return false;
    };

    const locateInCategories = (targetCategoryId) => {
      if (!Array.isArray(dasherCategories)) return null;
      for (const cat of dasherCategories) {
        if (
          targetCategoryId &&
          !idsEq(cat.id, targetCategoryId)
        )
          continue;
        const match = cat.dashers?.find((d) => idsEq(d.id, targetId));
        if (match) {
          categoryKey = cat.id;
          return match;
        }
      }
      return null;
    };

    if (normalizedSourceKey === "ready") {
      assignFromList(readyDashers, "ready");
    } else if (normalizedSourceKey === "currently-using") {
      assignFromList(currentlyUsingDashers, "currently-using");
    } else if (normalizedSourceKey === "appealed") {
      assignFromList(appealedDashers, "appealed");
    } else if (normalizedSourceKey === "applied-pending") {
      assignFromList(appliedPendingDashers, "applied-pending");
    } else if (normalizedSourceKey === "reverif") {
      assignFromList(reverifDashers, "reverif");
    } else if (normalizedSourceKey === "locked") {
      assignFromList(lockedDashers, "locked");
    } else if (normalizedSourceKey === "deactivated") {
      assignFromList(deactivatedDashers, "deactivated");
    } else if (normalizedSourceKey === "archived") {
      assignFromList(archivedDashers, "archived");
    } else if (normalizedSourceKey) {
      dasherFound =
        locateInCategories(normalizedSourceKey) ||
        locateInCategories(null);
    }

    if (!dasherFound) {
      const topBuckets = [
        ["ready", readyDashers],
        ["currently-using", currentlyUsingDashers],
        ["appealed", appealedDashers],
        ["applied-pending", appliedPendingDashers],
        ["reverif", reverifDashers],
        ["locked", lockedDashers],
        ["deactivated", deactivatedDashers],
        ["archived", archivedDashers],
      ];
      for (const [key, list] of topBuckets) {
        if (assignFromList(list, key)) break;
      }
    }

    if (!dasherFound) {
      const located = locateInCategories(null);
      if (located) dasherFound = located;
    }

    if (!dasherFound && candidateDasher) {
      dasherFound = candidateDasher;
    }

    const balanceSource = dasherFound || candidateDasher;
    const preferredBucketId =
      typeof (categoryKey || normalizedSourceKey) === "string"
        ? categoryKey || normalizedSourceKey
        : null;

    const descriptors =
      balanceSource
        ? getDescriptorsForDasher(balanceSource, {
          preferredBucketId,
          fallbackHint: `${preferredBucketId ?? "bucket"}-${targetId}`,
        })
        : [];

    const descriptorBalances = descriptors
      .map((descriptor) =>
        parseBalanceValue(descriptor?.meta?.dasher?.balance),
      )
      .filter((val) => Number.isFinite(val));

    const balanceCandidates = [
      parseBalanceValue(dasherFound?.balance),
      parseBalanceValue(candidateDasher?.balance),
      ...descriptorBalances,
    ].filter((val) => Number.isFinite(val));

    const maxBalance =
      balanceCandidates.length > 0 ? Math.max(...balanceCandidates) : 0;
    const currentBalance =
      Math.abs(maxBalance) < 0.005 ? 0 : maxBalance;

    if (currentBalance === 0) {
      // Modern toast, consistent with other notifications; don't clobber move toast
      const showErrorToast = () => {
        if (saveNotificationTimeoutRef.current) {
          clearTimeout(saveNotificationTimeoutRef.current);
          saveNotificationTimeoutRef.current = null;
        }
        setSaveNotification("!warn! Balance already $0.00");
        saveNotificationTimeoutRef.current = setTimeout(() => {
          setSaveNotification("");
          saveNotificationTimeoutRef.current = null;
        }, 2000);
      };
      if (moveToastActiveRef.current) {
        setTimeout(showErrorToast, 2600);
      } else {
        showErrorToast();
      }
      return;
    }

    const effectiveSourceKey =
      categoryKey ||
      normalizedSourceKey ||
      descriptors.find((descriptor) => descriptor?.meta?.bucketId)?.meta
        ?.bucketId ||
      null;
    // Build contextual notes: selected cash-out + related info + source bucket
    const sel = String(balanceSource?.selectedCashout || "").toLowerCase();
    let selLabel = "";
    if (sel === "crimson") selLabel = "Crimson";
    else if (sel === "fastpay") selLabel = "FastPay";
    const extraInfo =
      sel === "crimson"
        ? balanceSource?.crimsonInfo
          ? ` (${balanceSource.crimsonInfo})`
          : ""
        : sel === "fastpay"
          ? balanceSource?.fastPayInfo
            ? ` (${balanceSource.fastPayInfo})`
            : ""
          : "";
    const bucketMap = {
      ready: "Ready",
      "currently-using": "Currently Using",
      appealed: "Appealed",
      "applied-pending": "Applied Pending",
      reverif: "Reverif",
      locked: "Locked",
      deactivated: "Deactivated",
      archived: "Archived",
    };
    const bucketLabel = categoryKey
      ? bucketMap[categoryKey] || categoryKey
      : "";
    const bucketNote = bucketLabel ? ` from ${bucketLabel}` : "";
    const autoNotes = selLabel
      ? `${selLabel}${extraInfo}${bucketNote}`.trim()
      : bucketNote.trim() || undefined;

    const nowIso = new Date().toISOString();

    // Record undo for cash out
    recordUndo(
      UNDO_TYPES.DASHER_CASH_OUT,
      {
        dasherId: targetId,
        sourceKey: effectiveSourceKey,
        amount: currentBalance,
      },
      `Cashed out $${currentBalance.toFixed(2)}`
    );

    if (descriptors.length > 0) {
      descriptors.forEach((descriptor) => {
        mutateDasherByMeta(descriptor, (existing) => {
          if (!existing) return existing;
          const existingBalance = parseBalanceValue(existing.balance);
          const entryAmount = Number(
            (
              Number.isFinite(existingBalance)
                ? existingBalance
                : currentBalance
            ).toFixed(2),
          );
          const history = ensureArray(existing.cashOutHistory);
          const historyEntry = {
            amount: entryAmount,
            method: selLabel || normalizedMethod,
            at: nowIso,
            ...(autoNotes ? { notes: autoNotes } : {}),
          };
          return {
            ...existing,
            balance: 0,
            cashOutHistory: [historyEntry, ...history],
          };
        });
      });
      requestPersist();
      showSuccessToast(currentBalance);
      return;
    }

    const commit = (mutator) => {
      mutator();
      requestPersist();
    };

    const mutateList = (list, setter) =>
      commit(() => {
        setter(
          list.map((d) =>
            idsEq(d.id, targetId)
              ? {
                ...d,
                balance: 0,
                cashOutHistory: d.cashOutHistory
                  ? [
                    {
                      amount: currentBalance,
                      method: selLabel || normalizedMethod,
                      at: nowIso,
                      ...(autoNotes ? { notes: autoNotes } : {}),
                    },
                    ...d.cashOutHistory,
                  ]
                  : [
                    {
                      amount: currentBalance,
                      method: selLabel || normalizedMethod,
                      at: nowIso,
                      ...(autoNotes ? { notes: autoNotes } : {}),
                    },
                  ],
              }
              : d,
          ),
        );
      });

    if (effectiveSourceKey === "ready") {
      mutateList(readyDashers, setReadyDashers);
      showSuccessToast(currentBalance);
      return;
    }
    if (effectiveSourceKey === "currently-using") {
      mutateList(currentlyUsingDashers, setCurrentlyUsingDashers);
      showSuccessToast(currentBalance);
      return;
    }
    if (effectiveSourceKey === "appealed") {
      mutateList(appealedDashers, setAppealedDashers);
      showSuccessToast(currentBalance);
      return;
    }
    if (effectiveSourceKey === "reverif") {
      mutateList(reverifDashers, setReverifDashers);
      showSuccessToast(currentBalance);
      return;
    }
    if (effectiveSourceKey === "locked") {
      mutateList(lockedDashers, setLockedDashers);
      showSuccessToast(currentBalance);
      return;
    }
    if (effectiveSourceKey === "applied-pending") {
      mutateList(appliedPendingDashers, setAppliedPendingDashers);
      showSuccessToast(currentBalance);
      return;
    }
    if (effectiveSourceKey === "archived") {
      mutateList(archivedDashers, setArchivedDashers);
      showSuccessToast(currentBalance);
      return;
    }

    commit(() => {
      setDasherCategories((prev) =>
        prev.map((cat) => {
          if (!idsEq(cat.id, effectiveSourceKey)) return cat;
          return {
            ...cat,
            dashers: cat.dashers.map((d) =>
              idsEq(d.id, targetId)
                ? {
                  ...d,
                  balance: 0,
                  cashOutHistory: d.cashOutHistory
                    ? [
                      {
                        amount: currentBalance,
                        method: selLabel || normalizedMethod,
                        at: nowIso,
                        ...(autoNotes ? { notes: autoNotes } : {}),
                      },
                      ...d.cashOutHistory,
                    ]
                    : [
                      {
                        amount: currentBalance,
                        method: selLabel || normalizedMethod,
                        at: nowIso,
                        ...(autoNotes ? { notes: autoNotes } : {}),
                      },
                    ],
                }
                : d,
            ),
          };
        }),
      );
    });
    showSuccessToast(currentBalance);

    performance.mark('cashOut-end');
    performance.measure('cashOut', 'cashOut-start', 'cashOut-end');
  }, [
    dasherCategories, readyDashers, currentlyUsingDashers, appealedDashers,
    reverifDashers, lockedDashers, appliedPendingDashers, archivedDashers,
    setDasherCategories, setReadyDashers, setCurrentlyUsingDashers, setAppealedDashers,
    setReverifDashers, setLockedDashers, setAppliedPendingDashers, setArchivedDashers,
    deriveDasherIdentity, parseBalanceValue, requestPersist, setSaveNotification,
    saveNotificationTimeoutRef, moveToastActiveRef
  ]); // [PERF-STAGE3]

  // Old undoLastCashOut function removed - replaced by universal undo system

  // Sorting helper
  const sortDashers = (arr, sortCfg) => {
    if (!sortCfg || sortCfg.key === "none") return arr;
    const dir = sortCfg.dir === "asc" ? 1 : -1;
    return [...arr].sort((a, b) => {
      let av = 0,
        bv = 0;
      if (sortCfg.key === "balance") {
        av = parseBalanceValue(a.balance);
        bv = parseBalanceValue(b.balance);
      } else if (sortCfg.key === "lastUsed") {
        av = a.lastUsed ? new Date(a.lastUsed).getTime() : 0;
        bv = b.lastUsed ? new Date(b.lastUsed).getTime() : 0;
      } else if (sortCfg.key === "alphabetical") {
        const aName = (a.name || "").toLowerCase();
        const bName = (b.name || "").toLowerCase();
        if (aName === bName) return 0;
        return aName > bName ? dir : -dir;
      }
      if (av === bv) return 0;
      return av > bv ? dir : -dir;
    });
  };

  // useFilteredSortedDashers removed in v1.7.0 - replaced by filterAndSortDashers

  // Stable count display helper (fixed width to prevent header jumping)
  const renderStableCount = (visible, total) =>
    React.createElement(
      "span",
      {
        className:
          "inline-flex items-center font-mono tabular-nums text-xs w-20 justify-end",
      },
      `${visible} / ${total}`,
    );

  // Helper to add aria-label to buttons with title
  // Aggregate all dashers into a flat list for global filtering counters
  const allDashersFlat = useMemo(
    () => [
      ...dasherCategories.flatMap((c) => ensureArray(c.dashers)),
      ...ensureArray(readyDashers),
      ...ensureArray(currentlyUsingDashers),
      ...ensureArray(appealedDashers),
      ...ensureArray(appliedPendingDashers),
      ...ensureArray(reverifDashers),
      ...ensureArray(lockedDashers),
      ...ensureArray(deactivatedDashers),
      ...ensureArray(archivedDashers),
    ],
    [
      dasherCategories,
      readyDashers,
      currentlyUsingDashers,
      appealedDashers,
      appliedPendingDashers,
      reverifDashers,
      lockedDashers,
      deactivatedDashers,
      archivedDashers,
    ],
  );

  // REMOVED: Moved filtered dasher useMemo hooks earlier in code (before useEffect that uses them)
  // See line ~985 for new location

  const filteredArchivedDashers = useMemo(
    () => filterAndSortDashers(archivedDashers),
    [archivedDashers, showNonZeroOnly, dasherSort, globalQuery],
  );

  const filteredAllDashers = useMemo(
    () => filterAndSortDashers(allDashersFlat),
    [allDashersFlat, showNonZeroOnly, dasherSort, globalQuery],
  );

  const categoryDashersFlat = useMemo(
    () => dasherCategories.flatMap((c) => c.dashers || []),
    [dasherCategories],
  );

  const filteredCategoryDashers = useMemo(
    () => filterAndSortDashers(categoryDashersFlat),
    [categoryDashersFlat, showNonZeroOnly, dasherSort, globalQuery],
  );

  // [PERF-FIX3] Only compute stats metadata when Statistics section is open
  const dashersMeta = useMemo(() => {
    if (!isStatisticsOpen) return []; // Early return when stats closed

    const meta = [];

    dasherCategories.forEach((category, catIndex) => {
      const dashers = ensureArray(category?.dashers);
      const bucketId = category?.id
        ? String(category.id)
        : `category-${catIndex}`;
      const bucketLabel = category?.name || bucketId;
      dashers.forEach((dasher, dasherIndex) => {
        const fallback = category?.id
          ? `${category.id}-${dasherIndex}`
          : `category-${catIndex}-${dasherIndex}`;
        const identity = deriveDasherIdentity(dasher, fallback);
        meta.push({
          bucketId,
          bucketLabel,
          bucketType: "category",
          categoryId: category?.id ?? null,
          categoryName: category?.name || bucketLabel,
          categoryIndex: catIndex,
          dasherIndex,
          uniqueFallback: fallback,
          identity,
          dasher,
        });
      });
    });

    const reservedBuckets = [
      { id: "ready", label: "Ready", list: readyDashers },
      {
        id: "currently-using",
        label: "Currently using",
        list: currentlyUsingDashers,
      },
      { id: "appealed", label: "Appealed", list: appealedDashers },
      {
        id: "applied-pending",
        label: "Applied Pending",
        list: appliedPendingDashers,
      },
      { id: "reverif", label: "Reverif", list: reverifDashers },
      { id: "locked", label: "Locked", list: lockedDashers },
      {
        id: "deactivated",
        label: "Deactivated",
        list: deactivatedDashers,
      },
      { id: "archived", label: "Archived", list: archivedDashers },
    ];

    reservedBuckets.forEach(({ id, label, list }) => {
      ensureArray(list).forEach((dasher, index) => {
        const fallback = `${id}-${index}`;
        const identity = deriveDasherIdentity(dasher, fallback);
        meta.push({
          bucketId: id,
          bucketLabel: label,
          bucketType: "reserved",
          categoryIndex: null,
          dasherIndex: index,
          uniqueFallback: fallback,
          identity,
          dasher,
        });
      });
    });

    return meta;
  }, [
    isStatisticsOpen, // [PERF-FIX3] Gate computation
    dasherCategories,
    readyDashers,
    currentlyUsingDashers,
    appealedDashers,
    appliedPendingDashers,
    reverifDashers,
    lockedDashers,
    deactivatedDashers,
    archivedDashers,
  ]);

  const earningEntries = useMemo(
    () =>
      collectDasherEvents(dashersMeta, "earningsHistory", (entry) => {
        const normalized = String(entry?.source ?? "unspecified")
          .trim()
          .toLowerCase();
        return normalized || "unspecified";
      }),
    [dashersMeta],
  );

  const cashOutEntries = useMemo(
    () =>
      collectDasherEvents(dashersMeta, "cashOutHistory", (entry) => {
        const normalized = String(entry?.method ?? "unspecified")
          .trim()
          .toLowerCase();
        return normalized || "unspecified";
      }),
    [dashersMeta],
  );

  const availableCashMethods = useMemo(() => {
    const set = new Set();
    cashOutEntries.forEach((entry) => {
      set.add(entry.group || "unspecified");
    });
    return Array.from(set).sort();
  }, [cashOutEntries]);

  const dashersMetaKeyMap = useMemo(() => {
    const map = new Map();
    dashersMeta.forEach((meta, index) => {
      const key = `${meta.bucketId ?? "bucket"}::${index}`;
      map.set(key, { meta, index });
    });
    return map;
  }, [dashersMeta]);

  const dasherSelectOptions = useMemo(
    () =>
      dashersMeta.map((meta, index) => ({
        key: `${meta.bucketId ?? "bucket"}::${index}`,
        meta,
      })),
    [dashersMeta],
  );

  const getDasherAnchorId = useCallback((identity) => {
    if (!identity) return "";
    const sanitized = String(identity)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-+/g, "-");
    return sanitized ? `dasher-card-${sanitized}` : "";
  }, []);

  const scrollDasherIntoView = useCallback((anchorId, attempt = 0) => {
    if (!anchorId || attempt > 10) return;
    const target = document.getElementById(anchorId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      requestAnimationFrame(() =>
        scrollDasherIntoView(anchorId, attempt + 1),
      );
    }
  }, []);

  const revealDasherCard = useCallback(
    (identity, bucketKey, meta = {}) => {
      if (!identity) return;
      const anchorId = getDasherAnchorId(identity);
      openDasherBucket(bucketKey, meta);
      const tryFocusAndFlash = (attempt = 0) => {
        if (attempt > 12) return;
        const el = document.getElementById(anchorId);
        if (!el) {
          requestAnimationFrame(() => tryFocusAndFlash(attempt + 1));
          return;
        }
        // Ensure it's scrolled into view first
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Make focusable and focus for a11y
        if (!el.hasAttribute("tabindex"))
          el.setAttribute("tabindex", "-1");
        try {
          el.focus({ preventScroll: true });
        } catch { }
        // Briefly highlight
        el.classList.add("ring-2", "ring-indigo-400/80");
        setTimeout(() => {
          el.classList.remove("ring-2", "ring-indigo-400/80");
        }, 1600);
      };
      requestAnimationFrame(() => tryFocusAndFlash());
    },
    [getDasherAnchorId, openDasherBucket],
  );

  const identityForMeta = useCallback(
    (meta) =>
      deriveDasherIdentity(meta?.dasher, meta?.uniqueFallback ?? "dash"),
    [],
  );

  const dashersIdentityMap = useMemo(() => {
    const map = new Map();
    dashersMeta.forEach((meta, index) => {
      const identity = identityForMeta(meta);
      if (!identity) return;
      const descriptor = { meta, index };
      const bucket = map.get(identity);
      if (bucket) {
        bucket.push(descriptor);
      } else {
        map.set(identity, [descriptor]);
      }
    });
    return map;
  }, [dashersMeta, identityForMeta]);

  const dashersReferenceMap = useMemo(() => {
    const map = new Map();
    dashersMeta.forEach((meta, index) => {
      if (!meta?.dasher) return;
      const descriptor = { meta, index };
      const existing = map.get(meta.dasher);
      if (existing) {
        existing.push(descriptor);
      } else {
        map.set(meta.dasher, [descriptor]);
      }
    });
    return map;
  }, [dashersMeta]);

  const globalQueryActive =
    (globalQueryDebouncedRef.current || "").trim().length > 0;
  const showResultsBucket = globalQueryActive || showNonZeroOnly;

  const dasherLocationIndex = useMemo(() => {
    const map = new Map();
    dashersMeta.forEach((meta) => {
      const identity = meta?.identity;
      if (!identity) return;
      const bucketKey =
        meta.bucketType === "category" ? "main" : meta.bucketId;
      const bucketLabel =
        meta.bucketType === "category"
          ? meta.categoryName || "Dashers"
          : meta.bucketLabel || meta.bucketId || "Dashers";
      const descriptorMeta =
        meta.bucketType === "category"
          ? {
            categoryId: meta.categoryId ?? meta.bucketId,
            categoryName: meta.categoryName || bucketLabel,
          }
          : {};
      if (!map.has(identity)) {
        map.set(identity, []);
      }
      map
        .get(identity)
        .push({ bucketKey, bucketLabel, meta: descriptorMeta });
    });
    return map;
  }, [dashersMeta]);

  const resultsDashers = useMemo(() => {
    if (!showResultsBucket) return [];
    const seen = new Set();
    const items = [];

    ensureArray(filteredAllDashers).forEach((candidate, index) => {
      const identity = deriveDasherIdentity(candidate, `result-${index}`);
      if (!identity || seen.has(identity)) return;
      const descriptors = dashersIdentityMap.get(identity) || [];
      if (descriptors.length === 0) return; // no known placement
      seen.add(identity);

      const firstDescriptor = descriptors[0];
      const representativeDasher =
        firstDescriptor?.meta?.dasher || candidate;

      const locations = dasherLocationIndex.get(identity) || [];
      let primaryLocation = locations[0];
      const alternateLocations = locations.slice(1);

      if (!primaryLocation) {
        const inferredBucketKey =
          firstDescriptor?.meta?.bucketType === "category"
            ? "main"
            : firstDescriptor?.meta?.bucketId || "main";
        const inferredLabel =
          firstDescriptor?.meta?.bucketType === "category"
            ? firstDescriptor?.meta?.categoryName || "Dashers"
            : firstDescriptor?.meta?.bucketLabel || "Dashers";
        const inferredMeta =
          firstDescriptor?.meta?.bucketType === "category"
            ? {
              categoryId: firstDescriptor?.meta?.categoryId ?? null,
              categoryName: inferredLabel,
            }
            : {};
        primaryLocation = {
          bucketKey: inferredBucketKey,
          bucketLabel: inferredLabel,
          meta: inferredMeta,
        };
      }

      items.push({
        identity,
        dasher: representativeDasher,
        primaryLocation,
        alternateLocations,
      });
    });

    return items;
  }, [
    showResultsBucket,
    filteredAllDashers,
    dashersIdentityMap,
    dasherLocationIndex,
  ]);

  // Results-only sort and filters (independent of bucket sort)
  const RESULTS_CONTROLS_STORAGE_KEY = "dashBashResultsControls";

  const readStoredResultsControls = () => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(
        RESULTS_CONTROLS_STORAGE_KEY,
      );
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
      return null;
    }
  };

  const sanitizeResultsSort = (value) => {
    const validKeys = new Set(["balance", "name", "bucket", "none"]);
    const key = validKeys.has(value?.key) ? value.key : "balance";
    const dir = value?.dir === "asc" ? "asc" : "desc";
    return { key, dir };
  };

  const sanitizeFlagFilters = (value) => ({
    appealed: !!value?.appealed,
    crimson: !!value?.crimson,
    fastPay: !!value?.fastPay,
    redCard: !!value?.redCard,
  });

  const sanitizeBucketFilter = (value) => {
    const allowed = new Set([
      "any",
      "main",
      "ready",
      "currently-using",
      "appealed",
      "applied-pending",
      "reverif",
      "locked",
      "deactivated",
      "archived",
    ]);
    return allowed.has(value) ? value : "any";
  };

  const storedResultsControls = readStoredResultsControls();

  const [resultsSort, setResultsSort] = useState(() =>
    sanitizeResultsSort(storedResultsControls?.sort),
  );
  // keys: 'balance' | 'name' | 'bucket' | 'none'
  const [resultsBucketFilter, setResultsBucketFilter] = useState(() =>
    sanitizeBucketFilter(storedResultsControls?.bucketFilter),
  );
  // 'any' | 'main' | 'ready' | 'currently-using' | 'appealed' | 'applied-pending' | 'reverif' | 'locked' | 'deactivated' | 'archived'
  const [resultsFlagFilters, setResultsFlagFilters] = useState(() =>
    sanitizeFlagFilters(storedResultsControls?.flags),
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload = {
      sort: resultsSort,
      bucketFilter: resultsBucketFilter,
      flags: resultsFlagFilters,
    };
    try {
      window.localStorage.setItem(
        RESULTS_CONTROLS_STORAGE_KEY,
        JSON.stringify(payload),
      );
    } catch { }
  }, [resultsSort, resultsBucketFilter, resultsFlagFilters]);

  const getResultsAriaSort = (key) =>
    resultsSort.key === key
      ? resultsSort.dir === "asc"
        ? "ascending"
        : "descending"
      : "none";

  const toggleResultsFlag = (key) =>
    setResultsFlagFilters((prev) => ({ ...prev, [key]: !prev[key] }));

  const matchesFlagFilters = (dasher) => {
    if (resultsFlagFilters.appealed && !dasher?.appealed) return false;
    if (resultsFlagFilters.crimson && !dasher?.crimson) return false;
    if (resultsFlagFilters.fastPay && !dasher?.fastPay) return false;
    if (resultsFlagFilters.redCard && !dasher?.redCard) return false;
    return true;
  };

  const matchesBucketFilter = (primary, alternates) => {
    if (resultsBucketFilter === "any") return true;
    const all = [primary, ...(alternates || [])].filter(Boolean);
    return all.some((loc) => loc.bucketKey === resultsBucketFilter);
  };

  const filteredResultsDashers = useMemo(() => {
    return (resultsDashers || []).filter(
      ({ dasher, primaryLocation, alternateLocations }) =>
        matchesFlagFilters(dasher) &&
        matchesBucketFilter(primaryLocation, alternateLocations),
    );
  }, [resultsDashers, resultsFlagFilters, resultsBucketFilter]);

  const sortedResultsDashers = useMemo(() => {
    const list = [...filteredResultsDashers];
    const dir = resultsSort.dir === "asc" ? 1 : -1;
    const safeStr = (v) =>
      String(v || "")
        .trim()
        .toLowerCase();
    const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

    list.sort((A, B) => {
      const a = A.dasher || {};
      const b = B.dasher || {};
      if (resultsSort.key === "balance") {
        const av = parseBalanceValue(a.balance);
        const bv = parseBalanceValue(b.balance);
        return dir * cmp(av, bv);
      }
      if (resultsSort.key === "name") {
        return dir * cmp(safeStr(a.name), safeStr(b.name));
      }
      if (resultsSort.key === "bucket") {
        const al = A.primaryLocation?.bucketLabel || "";
        const bl = B.primaryLocation?.bucketLabel || "";
        return dir * cmp(safeStr(al), safeStr(bl));
      }
      return 0;
    });

    return list;
  }, [filteredResultsDashers, resultsSort]);

  const setResultsSortKey = (key) => {
    setResultsSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "desc" },
    );
  };

  const resetResultsControls = () => {
    setResultsSort({ key: "balance", dir: "desc" });
    setResultsBucketFilter("any");
    setResultsFlagFilters({
      appealed: false,
      crimson: false,
      fastPay: false,
      redCard: false,
    });
  };

  const getDescriptorsForDasher = useCallback(
    (candidate, options = {}) => {
      if (!candidate) return [];
      const { preferredBucketId = null, fallbackHint } = options;
      const keyTag = (descriptor) =>
        `${descriptor?.meta?.bucketId ?? "bucket"}::${descriptor?.index ?? 0}`;
      const ranked = new Map();
      const track = (descriptor, baseRank) => {
        if (!descriptor || !descriptor.meta) return;
        const key = keyTag(descriptor);
        const scoreAdjust =
          descriptor.meta.bucketId === preferredBucketId ? -2 : 0;
        const rank = baseRank + scoreAdjust;
        if (!ranked.has(key) || rank < ranked.get(key).rank) {
          ranked.set(key, { descriptor, rank });
        }
      };

      const fallbackKey =
        fallbackHint ??
        `${preferredBucketId ?? "bucket"}-${candidate?.id ?? candidate?.email ?? candidate?.phone ?? "dash"}`;

      const identityKey = deriveDasherIdentity(candidate, fallbackKey);
      if (identityKey) {
        const identityMatches = dashersIdentityMap.get(identityKey);
        if (Array.isArray(identityMatches)) {
          identityMatches.forEach((desc) => track(desc, 2));
        }
      }

      const referenceMatches = dashersReferenceMap.get(candidate);
      if (Array.isArray(referenceMatches)) {
        referenceMatches.forEach((desc) => track(desc, 4));
      }

      if (ranked.size === 0) {
        dashersMeta.forEach((meta, index) => {
          if (meta?.dasher === candidate) {
            track({ meta, index }, 6);
          }
        });
      }

      return Array.from(ranked.values())
        .sort((a, b) => a.rank - b.rank)
        .map((entry) => entry.descriptor);
    },
    [dashersIdentityMap, dashersReferenceMap, dashersMeta],
  );

  const mutateDasherByMeta = useCallback(
    (descriptor, mutator) => {
      if (!descriptor || typeof mutator !== "function") return;
      const { meta } = descriptor;
      if (!meta) return;

      if (meta.bucketType === "category") {
        const targetIndex = meta.categoryIndex;
        const dasherIndex = meta.dasherIndex;
        if (
          typeof targetIndex !== "number" ||
          typeof dasherIndex !== "number"
        )
          return;
        setDasherCategories((prev) => {
          return prev.map((category, idx) => {
            if (idx !== targetIndex) return category;
            const dashers = ensureArray(category?.dashers);
            if (dasherIndex < 0 || dasherIndex >= dashers.length)
              return category;
            const nextDashers = [...dashers];
            nextDashers[dasherIndex] = mutator(nextDashers[dasherIndex]);
            return { ...category, dashers: nextDashers };
          });
        });
        return;
      }

      const updateList = (list, mutatorFn) => {
        const dashers = ensureArray(list);
        if (meta.dasherIndex < 0 || meta.dasherIndex >= dashers.length)
          return dashers;
        const next = [...dashers];
        next[meta.dasherIndex] = mutatorFn(next[meta.dasherIndex]);
        return next;
      };

      switch (meta.bucketId) {
        case "ready":
          setReadyDashers((prev) => updateList(prev, mutator));
          break;
        case "currently-using":
          setCurrentlyUsingDashers((prev) => updateList(prev, mutator));
          break;
        case "appealed":
          setAppealedDashers((prev) => updateList(prev, mutator));
          break;
        case "applied-pending":
          setAppliedPendingDashers((prev) => updateList(prev, mutator));
          break;
        case "reverif":
          setReverifDashers((prev) => updateList(prev, mutator));
          break;
        case "locked":
          setLockedDashers((prev) => updateList(prev, mutator));
          break;
        case "deactivated":
          setDeactivatedDashers((prev) => updateList(prev, mutator));
          break;
        case "archived":
          setArchivedDashers((prev) => updateList(prev, mutator));
          break;
        default:
          break;
      }
    },
    [
      setDasherCategories,
      setReadyDashers,
      setCurrentlyUsingDashers,
      setAppealedDashers,
      setAppliedPendingDashers,
      setReverifDashers,
      setLockedDashers,
      setDeactivatedDashers,
      setArchivedDashers,
    ],
  );

  const withAria = (title) => ({ "aria-label": title, title });

  // Unified DasherFilterBar component for consistent filtering across all sections
  // DasherFilterBar removed in v1.7.0 - replaced by global control bar

  function formatTime(timeStr) {
    if (!timeStr || timeStr.length !== 4) return "";
    const hours = timeStr.substring(0, 2);
    const minutes = timeStr.substring(2, 4);
    return `${hours}:${minutes}`;
  }

  function calculateTimeStatus(closeTimeStr) {
    if (!closeTimeStr || closeTimeStr.length !== 4) return null;

    const closeHours = parseInt(closeTimeStr.substring(0, 2));
    const closeMinutes = parseInt(closeTimeStr.substring(2, 4));

    const now = new Date();
    const todayClose = new Date(now);
    todayClose.setHours(closeHours, closeMinutes, 0, 0);

    // If closing time has passed today, assume it's tomorrow's closing time
    if (todayClose < now) {
      todayClose.setDate(todayClose.getDate() + 1);
    }

    const diffMs = todayClose - now;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const remainingMinutes = diffMinutes % 60;

    let color = "text-green-400";
    if (diffHours < 1) color = "text-yellow-400";
    if (diffMinutes < 30) color = "text-red-400";

    const timeText =
      diffHours > 0
        ? `${diffHours}h ${remainingMinutes}m left`
        : `${remainingMinutes}m left`;

    return {
      status: diffMs > 0 ? "open" : "closed",
      text: timeText,
      color,
      formatted: `${closeHours.toString().padStart(2, "0")}:${closeMinutes.toString().padStart(2, "0")}`,
    };
  }

  const addCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory = {
        id: Date.now(),
        name: newCategoryName.trim(),
        stores: [],
      };
      setCategories([...categories, newCategory]);
      setNewCategoryName("");
      setIsAddingCategory(false);

      // Auto-save
      setTimeout(() => {
        saveAllToLocalStorage();
      }, 100);
    }
  };

  const updateCategory = (categoryId, newName) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId ? { ...cat, name: newName } : cat,
      ),
    );

    // Auto-save
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const deleteCategory = (categoryId) => {
    setCategories(categories.filter((cat) => cat.id !== categoryId));

    // Auto-save
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const addStore = (categoryId) => {
    const newStore = {
      id: Date.now(),
      address: "",
      openTime: "",
      closeTime: "",
      notes: "",
    };
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId
          ? { ...cat, stores: [...cat.stores, newStore] }
          : cat,
      ),
    );

    // Auto-save
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const updateStore = (categoryId, storeId, field, value) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId
          ? {
            ...cat,
            stores: cat.stores.map((store) =>
              store.id === storeId
                ? { ...store, [field]: value }
                : store,
            ),
          }
          : cat,
      ),
    );

    // Auto-save
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const deleteStore = (categoryId, storeId) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId
          ? {
            ...cat,
            stores: cat.stores.filter((store) => store.id !== storeId),
          }
          : cat,
      ),
    );

    // Auto-save
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const toggleEditStore = (categoryId, storeId) => {
    if (
      editingStore.categoryId === categoryId &&
      editingStore.storeId === storeId
    ) {
      setEditingStore({ categoryId: -1, storeId: -1 });
    } else {
      setEditingStore({ categoryId, storeId });
    }
  };

  const isStoreEditing = (categoryId, storeId) => {
    return (
      editingStore.categoryId === categoryId &&
      editingStore.storeId === storeId
    );
  };

  const toggleCategoryCollapse = (categoryId) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const toggleStoreCollapse = (categoryId, storeId) => {
    const key = `${categoryId}-${storeId}`;
    setCollapsedStores((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isStoreCollapsed = (categoryId, storeId) => {
    const key = `${categoryId}-${storeId}`;
    return collapsedStores[key] ?? true;
  };

  const getStoresStatusCount = (stores) => {
    let openCount = 0;
    let closedCount = 0;

    stores.forEach((store) => {
      const status = calculateTimeStatus(store.closeTime);
      if (status && status.status === "open") {
        openCount++;
      } else if (status && status.status === "closed") {
        closedCount++;
      }
    });

    return { openCount, closedCount };
  };

  const handleStoreDragStart = (e, categoryId, storeIndex) => {
    setDraggedStore({ categoryId, storeIndex });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleStoreDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleStoreDrop = (e, categoryId, storeIndex) => {
    e.preventDefault();
    if (
      draggedStore.categoryId === categoryId &&
      draggedStore.storeIndex !== storeIndex
    ) {
      const updatedCategories = [...categories];
      const categoryIndex = categories.findIndex(
        (cat) => cat.id === categoryId,
      );
      const category = updatedCategories[categoryIndex];
      const draggedStoreItem = category.stores[draggedStore.storeIndex];

      const newStores = [...category.stores];
      newStores.splice(draggedStore.storeIndex, 1);
      newStores.splice(storeIndex, 0, draggedStoreItem);

      updatedCategories[categoryIndex] = {
        ...category,
        stores: newStores,
      };
      setCategories(updatedCategories);
    }
    setDraggedStore({ categoryId: -1, storeIndex: -1 });
  };

  const calculateQuantities = (price, targetAmount) => {
    if (price === 0) return { validOptions: [] };

    const maxQuantity = Math.floor(targetAmount / price);
    const validOptions = [];

    for (let qty = maxQuantity; qty >= 1; qty--) {
      const total = qty * price;
      if (total <= targetAmount) {
        validOptions.push({
          quantity: qty,
          total: total,
          difference: targetAmount - total,
        });
      }
    }

    return { validOptions };
  };

  const findBestOption = (validOptions) => {
    if (validOptions.length === 0) return null;

    return validOptions.sort((a, b) => {
      if (Math.abs(a.difference - b.difference) < 0.01) {
        return a.quantity - b.quantity;
      }
      return a.difference - b.difference;
    })[0];
  };

  // Notes Management Functions
  const addNoteCategory = () => {
    const newCategory = {
      id: Date.now().toString(),
      name: "New Category",
      notes: [],
    };
    setNoteCategories([...noteCategories, newCategory]);

    // Auto-save
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const updateNoteCategory = (categoryId, newName) => {
    setNoteCategories(
      noteCategories.map((cat) =>
        cat.id === categoryId ? { ...cat, name: newName } : cat,
      ),
    );

    // Auto-save
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const deleteNoteCategory = (categoryId) => {
    if (noteCategories.length === 1) {
      setSaveNotification("❌ Cannot delete the last category");
      announceFailure("Cannot delete the last note category");
      setTimeout(() => setSaveNotification(""), 3000);
      return;
    }

    setNoteCategories(
      noteCategories.filter((cat) => cat.id !== categoryId),
    );

    // Auto-save
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const addNote = (categoryId) => {
    const newNote = "";
    setNoteCategories(
      noteCategories.map((cat) =>
        cat.id === categoryId
          ? { ...cat, notes: [...cat.notes, newNote] }
          : cat,
      ),
    );

    // Start editing the new note immediately
    const categoryIndex = noteCategories.findIndex(
      (cat) => cat.id === categoryId,
    );
    if (categoryIndex !== -1) {
      const newNoteIndex = noteCategories[categoryIndex].notes.length;
      setEditingNote({ categoryId, noteIndex: newNoteIndex });
    }

    // Auto-save
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const updateNote = (categoryId, noteIndex, newText) => {
    setNoteCategories(
      noteCategories.map((cat) =>
        cat.id === categoryId
          ? {
            ...cat,
            notes: cat.notes.map((note, idx) =>
              idx === noteIndex ? newText : note,
            ),
          }
          : cat,
      ),
    );

    // Auto-save
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const deleteNote = (categoryId, noteIndex) => {
    setNoteCategories(
      noteCategories.map((cat) =>
        cat.id === categoryId
          ? {
            ...cat,
            notes: cat.notes.filter((_, idx) => idx !== noteIndex),
          }
          : cat,
      ),
    );

    // Auto-save
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const toggleNoteEdit = (categoryId, noteIndex) => {
    if (
      editingNote.categoryId === categoryId &&
      editingNote.noteIndex === noteIndex
    ) {
      setEditingNote({ categoryId: "", noteIndex: -1 });
    } else {
      setEditingNote({ categoryId, noteIndex });
    }
  };

  const isNoteEditing = (categoryId, noteIndex) => {
    return (
      editingNote.categoryId === categoryId &&
      editingNote.noteIndex === noteIndex
    );
  };

  const toggleNoteCategoryCollapse = (categoryId) => {
    setCollapsedNoteCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Expand/Collapse all note categories
  // [PR-FIX] Must set explicit false (not {}) since ?? true is default
  // [PR-FIX] Guard against undefined to prevent runtime crash
  const expandAllNoteCategories = () => {
    const allExpanded = {};
    (noteCategories || []).forEach((cat) => {
      allExpanded[cat.id] = false;
    });
    setCollapsedNoteCategories(allExpanded);
    // Auto-save after expanding all
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const collapseAllNoteCategories = () => {
    const allCollapsed = {};
    (noteCategories || []).forEach((cat) => {
      allCollapsed[cat.id] = true;
    });
    setCollapsedNoteCategories(allCollapsed);
    // Auto-save after collapsing all
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const handleNoteDragStart = (e, categoryId, noteIndex) => {
    setDraggedNote({ categoryId, noteIndex });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleNoteDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleNoteDrop = (e, targetCategoryId) => {
    e.preventDefault();
    if (!draggedNote.categoryId || draggedNote.noteIndex === -1) return;

    if (draggedNote.categoryId !== targetCategoryId) {
      // Move note between categories
      const sourceCategory = noteCategories.find(
        (cat) => cat.id === draggedNote.categoryId,
      );
      const noteToMove = sourceCategory.notes[draggedNote.noteIndex];

      setNoteCategories(
        noteCategories.map((cat) => {
          if (cat.id === draggedNote.categoryId) {
            // Remove from source
            return {
              ...cat,
              notes: cat.notes.filter(
                (_, idx) => idx !== draggedNote.noteIndex,
              ),
            };
          } else if (cat.id === targetCategoryId) {
            // Add to target
            return { ...cat, notes: [...cat.notes, noteToMove] };
          }
          return cat;
        }),
      );

      // Auto-save
      setTimeout(() => {
        saveAllToLocalStorage();
      }, 100);
    }

    setDraggedNote({ categoryId: "", noteIndex: -1 });
  };

  // Dasher Category Management Functions
  const addDasherCategory = () => {
    const categoryName = prompt("Enter category name:");
    if (categoryName && categoryName.trim()) {
      const newCategory = {
        id: Date.now().toString(),
        name: categoryName.trim(),
        dashers: [],
      };
      setDasherCategories([...dasherCategories, newCategory]);
    }
  };

  const updateDasherCategory = (categoryId, newName) => {
    setDasherCategories(
      dasherCategories.map((cat) =>
        cat.id === categoryId ? { ...cat, name: newName } : cat,
      ),
    );
  };

  const deleteDasherCategory = (categoryId) => {
    // Don't delete if it's the last category
    if (dasherCategories.length === 1) {
      alert("You must have at least one dasher category.");
      return;
    }

    showConfirm(
      `Delete this category and all its dashers?`,
      () => {
        // Use functional update to avoid stale state capture
        setDasherCategories((prev) =>
          prev.filter((cat) => cat.id !== categoryId),
        );
        requestPersist();
      },
      { title: "Delete Category", confirmText: "Delete", cancelText: "Cancel" },
    );
  };

  // Dasher Category Drag and Drop
  const handleDasherCategoryDragStart = (e, categoryId) => {
    setDraggedDasherCategory(categoryId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDasherCategoryDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDasherCategoryDrop = (e, targetCategoryId) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      !draggedDasherCategory ||
      draggedDasherCategory === targetCategoryId
    ) {
      return;
    }

    const sourceIndex = dasherCategories.findIndex(
      (cat) => cat.id === draggedDasherCategory,
    );
    const targetIndex = dasherCategories.findIndex(
      (cat) => cat.id === targetCategoryId,
    );

    if (sourceIndex === -1 || targetIndex === -1) return;

    const newCategories = [...dasherCategories];
    const [removed] = newCategories.splice(sourceIndex, 1);
    newCategories.splice(targetIndex, 0, removed);

    setDasherCategories(newCategories);
    setDraggedDasherCategory(null);
  };

  // Dasher Management Functions
  const addDasher = (categoryId) => {
    const newDasher = {
      id: Date.now().toString(),
      name: "",
      email: "",
      emailPw: "",
      dasherPw: "",
      phone: "",
      balance: "",
      crimson: false,
      redCard: false,
      appealed: false,
      appealedAt: null,
      crimsonAt: null,
      redCardAt: null,
      fastPay: false,
      fastPayInfo: "",
      crimsonInfo: "",
      selectedCashout: "",
      deactivated: false,
      deactivatedAt: null,
      ready: false,
      readyAt: null,
      lastUsed: null,
      notes: "",
    };
    setDasherCategories(
      dasherCategories.map((cat) =>
        cat.id === categoryId
          ? { ...cat, dashers: [...cat.dashers, newDasher] }
          : cat,
      ),
    );

    // Auto-save
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const updateDasher = (
    categoryId,
    dasherId,
    field,
    value,
    options = {},
  ) => {
    // Validate email if updating email field
    if (field === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value) && value.includes("@")) {
        // Only validate if it looks like they're trying to enter an email
        return; // Don't update if invalid email format
      }

      // Check for duplicate email across all categories
      const isDuplicate = dasherCategories.some((cat) =>
        cat.dashers.some(
          (dasher) =>
            dasher.id !== dasherId &&
            dasher.email &&
            dasher.email.toLowerCase() === value.toLowerCase(),
        ),
      );

      if (isDuplicate) {
        // Show a toast or alert for duplicate email
        setSaveNotification("⚠️ A dasher with this email already exists");
        announceFailure("A dasher with this email already exists");
        setTimeout(() => setSaveNotification(""), 3000);
        return; // Don't update if duplicate email
      }
    }

    // Special handling for appealed / ready / crimson / redCard fields to set/clear timestamps
    const timestampMap = {
      appealed: "appealedAt",
      ready: "readyAt",
      crimson: "crimsonAt",
      redCard: "redCardAt",
    };
    if (timestampMap[field]) {
      setDasherCategories(
        dasherCategories.map((cat) =>
          cat.id === categoryId
            ? {
              ...cat,
              dashers: cat.dashers.map((dasher) => {
                if (dasher.id === dasherId) {
                  const tsField = timestampMap[field];
                  if (value === true) {
                    return {
                      ...dasher,
                      [field]: value,
                      [tsField]: new Date().toISOString(),
                    };
                  } else {
                    // Clear timestamp when turning off
                    return {
                      ...dasher,
                      [field]: value,
                      [tsField]: null,
                    };
                  }
                }
                return dasher;
              }),
            }
            : cat,
        ),
      );
    } else {
      const isBalance = field === "balance";
      const nowIso = new Date().toISOString();
      setDasherCategories(
        dasherCategories.map((cat) =>
          cat.id === categoryId
            ? {
              ...cat,
              dashers: cat.dashers.map((d) => {
                if (d.id !== dasherId) return d;
                if (!isBalance) return { ...d, [field]: value };
                const prevNum = parseBalanceValue(d.balance);
                const nextNum = parseBalanceValue(value);
                const delta = nextNum - prevNum;
                if (delta > 0.000001) {
                  const eh = Array.isArray(d.earningsHistory)
                    ? d.earningsHistory
                    : [];
                  return {
                    ...d,
                    balance: value,
                    earningsHistory: [
                      ...eh,
                      {
                        amount: delta,
                        at: nowIso,
                        source: "balance-edit",
                      },
                    ],
                  };
                }
                return { ...d, balance: value };
              }),
            }
            : cat,
        ),
      );
    }

    // Auto-save
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const deleteDasher = (categoryId, dasherId) => {
    // Find the dasher before deleting (for undo)
    const category = dasherCategories.find(cat => cat.id === categoryId);
    const dasher = category?.dashers?.find(d => d.id === dasherId);
    
    if (dasher) {
      const dasherName = dasher.name || dasher.phone || dasher.id;
      recordUndo(
        UNDO_TYPES.DASHER_DELETE,
        {
          dasher: JSON.parse(JSON.stringify(dasher)), // Deep clone
          categoryKey: 'main',
          categoryId: categoryId,
        },
        `Deleted dasher "${dasherName}"`
      );
    }

    setDasherCategories(
      dasherCategories.map((cat) =>
        cat.id === categoryId
          ? {
            ...cat,
            dashers: cat.dashers.filter(
              (dasher) => dasher.id !== dasherId,
            ),
          }
          : cat,
      ),
    );

    // Auto-save
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  // Helper to find a dasher by categoryId and dasherId
  const findDasherById = (categoryId, dasherId) => {
    // Check in dasher categories
    const category = dasherCategories.find(cat => cat.id === categoryId);
    if (category && category.dashers) {
      const dasher = category.dashers.find(d => d.id === dasherId);
      if (dasher) return dasher;
    }

    // Check in ready dashers
    if (categoryId === "ready") {
      const dasher = readyDashers.find(d => d.id === dasherId);
      if (dasher) return dasher;
    }

    // Check in currently using dashers
    if (categoryId === "currently-using") {
      const dasher = currentlyUsingDashers.find(d => d.id === dasherId);
      if (dasher) return dasher;
    }

    // Check in other buckets
    if (categoryId === "appealed") {
      const dasher = appealedDashers.find(d => d.id === dasherId);
      if (dasher) return dasher;
    }

    if (categoryId === "applied-pending") {
      const dasher = appliedPendingDashers.find(d => d.id === dasherId);
      if (dasher) return dasher;
    }

    if (categoryId === "reverif") {
      const dasher = reverifDashers.find(d => d.id === dasherId);
      if (dasher) return dasher;
    }

    if (categoryId === "locked") {
      const dasher = lockedDashers.find(d => d.id === dasherId);
      if (dasher) return dasher;
    }

    if (categoryId === "deactivated") {
      const dasher = deactivatedDashers.find(d => d.id === dasherId);
      if (dasher) return dasher;
    }

    if (categoryId === "archived") {
      const dasher = archivedDashers.find(d => d.id === dasherId);
      if (dasher) return dasher;
    }

    return null;
  };

  /**
   * Shared helper: Update a dasher's balance across all state arrays
   * @param {string} categoryId - The bucket/category ID
   * @param {string} dasherId - The dasher's unique ID
   * @param {string|number} newBalance - The new balance value (raw input, can include formatting)
   * @returns {boolean} - Success status
   */
  /**
   * Shared helper for identity-aware dasher balance updates.
   * Uses the component-level getDescriptorsForDasher and mutateDasherByMeta
   * to properly update dashers across ALL state arrays (preset + custom categories).
   *
   * @param {string} categoryId - The category ID where dasher is located
   * @param {string} dasherId - The dasher's unique ID
   * @param {string|number} newBalance - The new balance value
   * @returns {boolean} - Success status
   */
  // REMOVED: updateDasherBalance (replaced with updateDasher)
  const updateDasherBalance_REMOVED = (categoryId, dasherId, newBalance) => {

    // Find the dasher first
    const dasher = findDasherById(categoryId, dasherId);

    if (!dasher) {
      console.warn('[updateDasherBalance] Dasher not found', { categoryId, dasherId });
      return false;
    }

    // Convert to string for consistency (same as original updateListField)
    const rawInput =
      typeof newBalance === "string"
        ? newBalance
        : newBalance === null || newBalance === undefined
          ? ""
          : String(newBalance);
    const trimmedInput = rawInput.trim();

    // Validate interim values (allow "-", ".", etc. during typing)
    const isInterimValue =
      trimmedInput === "" ||
      trimmedInput === "-" ||
      trimmedInput === "." ||
      trimmedInput === "-." ||
      trimmedInput === "+";

    const hasFiniteValue = Number.isFinite(
      parseFloat(
        trimmedInput === "" || trimmedInput === "+" ? "NaN" : trimmedInput,
      ),
    );

    // Get descriptors for identity-aware updates
    const primaryDescriptors = getDescriptorsForDasher(dasher, {
      preferredBucketId: categoryId ?? null,
      fallbackHint: `${categoryId ?? "bucket"}-${dasher?.id ?? dasher?.email ?? dasher?.phone ?? "dash"}`,
    });


    if (!primaryDescriptors || primaryDescriptors.length === 0) {
      console.warn('[updateDasherBalance] No descriptors found - cannot update');
      return false;
    }

    // Calculate delta for balance changes
    const prevNum = parseBalanceValue(dasher.balance);
    const nextNum = hasFiniteValue ? parseBalanceValue(rawInput) : prevNum;
    const delta = hasFiniteValue ? nextNum - prevNum : 0;

    // Don't sync peers during active typing - only update the current dasher
    const shouldSyncPeers = false;
    const nowIso = new Date().toISOString();
    const historyUpdatesByIdentity = shouldSyncPeers ? new Map() : null;

    // Update all descriptors using mutateDasherByMeta

    primaryDescriptors.forEach((descriptor) => {
      const descriptorIdentity =
        identityForMeta(descriptor.meta) || `ref::${descriptor.index}`;


      mutateDasherByMeta(descriptor, (existing) => {

        if (!existing) return existing;

        const existingPrev = parseBalanceValue(existing.balance);
        const history = ensureArray(existing.earningsHistory);

        // Skip updating other dashers when not syncing peers
        if (!shouldSyncPeers && existing.id !== dasher.id) {

          return existing;
        }

        let nextBalanceValue;
        // Check if this is the dasher being edited
        const isCurrentDasher = existing.id === dasher.id;

        if (isCurrentDasher) {
          // Keep raw input for the dasher being edited - no formatting
          nextBalanceValue = rawInput;
        } else {
          const updatedValue = shouldSyncPeers
            ? existingPrev + delta
            : existingPrev;
          const clampedBalance = Math.max(
            -1000000,
            Math.min(1000000, Number.isFinite(updatedValue) ? updatedValue : existingPrev),
          );
          nextBalanceValue = Number.isFinite(clampedBalance)
            ? clampedBalance.toFixed(2)
            : existingPrev.toFixed(2);
        }

        let nextHistory = history;
        if (shouldSyncPeers && delta > 0.000001) {
          if (
            descriptorIdentity &&
            historyUpdatesByIdentity &&
            historyUpdatesByIdentity.has(descriptorIdentity)
          ) {
            nextHistory =
              historyUpdatesByIdentity.get(descriptorIdentity);
          } else {
            const historyEntry = {
              amount: Number(delta.toFixed(2)),
              at: nowIso,
              source: "balance-edit",
            };
            const updatedHistory = [...history, historyEntry];
            if (descriptorIdentity && historyUpdatesByIdentity) {
              historyUpdatesByIdentity.set(
                descriptorIdentity,
                updatedHistory,
              );
            }
            nextHistory = updatedHistory;
          }
        } else if (
          shouldSyncPeers &&
          descriptorIdentity &&
          historyUpdatesByIdentity &&
          historyUpdatesByIdentity.has(descriptorIdentity)
        ) {
          nextHistory =
            historyUpdatesByIdentity.get(descriptorIdentity);
        }


        return {
          ...existing,
          balance: nextBalanceValue,
          earningsHistory: nextHistory,
        };
      });
    });

    // Trigger save only for valid finite values (not during typing)
    if (hasFiniteValue && !isInterimValue) {

      requestPersist();
    } else {

    }


    return true;
  };

  // [PERF-STAGE7] measure edit toggle
  // [PERF-STAGE7] measure edit toggle
  const toggleEditDasher = (categoryId, dasherId) => {
    performance.mark('toggleEdit-start');

    if (
      editingDasher.categoryId === categoryId &&
      editingDasher.dasherId === dasherId
    ) {
      // Exiting edit mode - save the balance value
      if (editingBalanceValue.trim() !== "") {
        // Record undo for balance edit (find current balance first)
        const dasher = findDasherById(categoryId, dasherId);
        if (dasher) {
          const oldBalance = dasher.balance || 0;
          const newBalance = editingBalanceValue;
          if (oldBalance !== newBalance) {
            const dasherName = dasher.name || dasher.phone || dasher.id;
            recordUndo(
              UNDO_TYPES.DASHER_EDIT_BALANCE,
              {
                dasherId,
                oldBalance,
              },
              `Changed "${dasherName}" balance from $${oldBalance} to $${newBalance}`
            );
          }
        }
        
        updateDasherEverywhere(dasherId, { balance: editingBalanceValue });
      }
      setEditingDasher({ categoryId: "", dasherId: "" });
      setEditingBalanceValue(""); // Clear when exiting edit mode
    } else {
      // Entering edit mode
      setEditingDasher({ categoryId, dasherId });
      // Find the dasher and initialize the balance value for editing
      const dasher = findDasherById(categoryId, dasherId);
      if (dasher) {
        // Store the raw balance value without formatting
        const balanceStr = dasher.balance ? String(dasher.balance) : "";
        setEditingBalanceValue(balanceStr);
      }
    }

    performance.mark('toggleEdit-end');
    performance.measure('toggleEdit', 'toggleEdit-start', 'toggleEdit-end');
  };

  const isDasherEditing = (categoryId, dasherId) => {
    return (
      editingDasher.categoryId === categoryId &&
      editingDasher.dasherId === dasherId
    );
  };

  // [PR-FIX] useCallback for stable identity (reduces re-renders of memoized children)
  const toggleDasherCategoryCollapse = useCallback((categoryId) => {
    setCollapsedDasherCategories((prev) => {
      // Default is true (collapsed), so we need to handle undefined properly
      const currentState = prev[categoryId] ?? true;
      return {
        ...prev,
        [categoryId]: !currentState,
      };
    });
  }, []);

  const startDasherTimer = (categoryId, dasherId) => {
    const now = new Date().toISOString();
    updateDasherEverywhere(dasherId, { lastUsed: now });
    // Auto-save after timer start
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const resetDasherTimer = (categoryId, dasherId) => {
    updateDasherEverywhere(dasherId, { lastUsed: null });
    // Auto-save after timer reset
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const resetAppealedTimer = (categoryId, dasherId) => {
    // Reset appealedAt without changing appealed status
    setDasherCategories(
      dasherCategories.map((cat) =>
        cat.id === categoryId
          ? {
            ...cat,
            dashers: cat.dashers.map((dasher) =>
              dasher.id === dasherId
                ? { ...dasher, appealedAt: null }
                : dasher,
            ),
          }
          : cat,
      ),
    );
    // Auto-save after timer reset
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  // [CENTRALIZED UPDATE] Update a dasher everywhere (dasherCategories + all bucket arrays)
  const updateDasherEverywhere = useCallback((dasherId, updates) => {
    if (dasherId == null) return;

    // Helper to apply updates to a single dasher object
    const applyUpdates = (dasher) => {
      // Handle balance specially with delta calculation and history tracking
      let finalBalance = dasher.balance;
      let finalHistory = dasher.earningsHistory || [];
      
      if (updates.balance !== undefined) {
        const rawInput = updates.balance;

        // Use shared parseBalanceValue function
        const prevNum = parseBalanceValue(dasher.balance);
        const nextNum = parseBalanceValue(rawInput);
        const delta = nextNum - prevNum;

        finalBalance = rawInput; // Keep raw input for typing experience

        // Add to earningsHistory if positive delta
        if (delta > POSITIVE_DELTA_THRESHOLD) {
          const historyEntry = {
            amount: Number(delta.toFixed(2)),
            at: new Date().toISOString(),
            source: "balance-edit"
          };
          finalHistory = [...finalHistory, historyEntry];
        }
      }
      
      return {
        ...dasher,
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.email !== undefined && { email: updates.email }),
        ...(updates.phone !== undefined && { phone: updates.phone }),
        ...(updates.emailPw !== undefined && { emailPw: updates.emailPw }),
        ...(updates.dasherPw !== undefined && { dasherPw: updates.dasherPw }),
        ...(updates.balance !== undefined && { 
          balance: finalBalance,
          earningsHistory: finalHistory
        }),
        ...(updates.notes !== undefined && {
          notes: Array.isArray(updates.notes)
            ? updates.notes
            : (typeof updates.notes === "string" ? updates.notes.split("\n").filter(Boolean) : dasher.notes)
        }),
        ...(updates.crimson !== undefined && { crimson: updates.crimson }),
        ...(updates.crimsonInfo !== undefined && { crimsonInfo: updates.crimsonInfo }),
        ...(updates.fastPay !== undefined && { fastPay: updates.fastPay }),
        ...(updates.fastPayInfo !== undefined && { fastPayInfo: updates.fastPayInfo }),
        ...(updates.redCard !== undefined && { redCard: updates.redCard }),
        ...(updates.appealed !== undefined && { appealed: updates.appealed }),
        ...(updates.lastUsed !== undefined && { lastUsed: updates.lastUsed }),
        lastEditedAt: new Date().toISOString(),
      };
    };

    // Generic update function for bucket arrays
    const updateBucketArray = (list, setList) => {
      setList(prev => {
        const next = prev.map(d => {
          if (String(d.id) !== String(dasherId)) return d;
          return applyUpdates(d);
        });
        return next;
      });
    };

    // Update dasherCategories (SINGLE SOURCE OF TRUTH for persistence)
    setDasherCategories(prev => {
      return prev.map(category => {
        if (!category.dashers) return category;

        const updatedDashers = category.dashers.map(d => {
          if (String(d.id) !== String(dasherId)) return d;
          return applyUpdates(d);
        });

        return { ...category, dashers: updatedDashers };
      });
    });

    // Update all bucket arrays to keep UI in sync
    updateBucketArray(readyDashers, setReadyDashers);
    updateBucketArray(currentlyUsingDashers, setCurrentlyUsingDashers);
    updateBucketArray(appealedDashers, setAppealedDashers);
    updateBucketArray(reverifDashers, setReverifDashers);
    updateBucketArray(lockedDashers, setLockedDashers);
    updateBucketArray(appliedPendingDashers, setAppliedPendingDashers);
    updateBucketArray(deactivatedDashers, setDeactivatedDashers);
    updateBucketArray(archivedDashers, setArchivedDashers);

    // Queue persistence
    requestPersist();
  }, [
    setDasherCategories,
    readyDashers, setReadyDashers,
    currentlyUsingDashers, setCurrentlyUsingDashers,
    appealedDashers, setAppealedDashers,
    reverifDashers, setReverifDashers,
    lockedDashers, setLockedDashers,
    appliedPendingDashers, setAppliedPendingDashers,
    deactivatedDashers, setDeactivatedDashers,
    archivedDashers, setArchivedDashers,
    requestPersist
  ]);

  // [PERF-STAGE4] commit edited fields from a card
  const onDraftCommit = useCallback((dasherId, draft) => {
    if (!dasherId) return;

    // Use centralized update helper
    updateDasherEverywhere(dasherId, {
      name: draft.name,
      email: draft.email,
      balance: draft.balance,
      notes: draft.notes
    });
  }, [updateDasherEverywhere]);

  // [PERSISTENCE-FIX v1.9.8] Toggle must handle ?? true default
  // undefined/null → collapsed by default, so toggle to false (expand)
  const toggleDasherCollapse = (categoryId, dasherId) => {
    const key = categoryId + "-" + dasherId;
    setCollapsedDashers((prev) => ({
      ...prev,
      [key]: !(prev[key] ?? true),
    }));
  };

  // [PERSISTENCE-FIX v1.9.8] Default to collapsed (was || false = expanded)
  // Now matches store behavior: ?? true means collapsed by default
  const isDasherCollapsed = (categoryId, dasherId) => {
    const key = categoryId + "-" + dasherId;
    return collapsedDashers[key] ?? true;
  };

  const calculateAppealedTimeStatus = (appealedAtTime) => {
    if (!appealedAtTime) return null;

    const appealedAt = new Date(appealedAtTime);
    const now = new Date();
    const diffMs = now - appealedAt;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);
    const diffSeconds = Math.floor((diffMs / 1000) % 60);
    const diffDays = Math.floor(diffHours / 24);

    // Format the date/time details
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = days[appealedAt.getDay()];
    const month = (appealedAt.getMonth() + 1).toString().padStart(2, "0");
    const date = appealedAt.getDate().toString().padStart(2, "0");
    const hours = appealedAt.getHours().toString().padStart(2, "0");
    const minutes = appealedAt.getMinutes().toString().padStart(2, "0");
    const seconds = appealedAt.getSeconds().toString().padStart(2, "0");

    if (diffDays > 0) {
      // Show days and hours if more than 24 hours
      const remainingHours = Math.floor(diffHours % 24);
      return {
        text: `${diffDays}d ${remainingHours}h ago`,
        fullDate: `${dayName} ${month}/${date} ${hours}:${minutes}:${seconds}`,
        color: "text-purple-400", // Purple for appealed timer
      };
    } else if (diffHours >= 1) {
      // Show hours and minutes
      const wholeHours = Math.floor(diffHours);
      return {
        text: `${wholeHours}h ${diffMinutes}m ago`,
        fullDate: `${dayName} ${month}/${date} ${hours}:${minutes}:${seconds}`,
        color: "text-purple-400",
      };
    } else if (diffMinutes >= 1) {
      // Show minutes and seconds
      return {
        text: `${diffMinutes}m ${diffSeconds}s ago`,
        fullDate: `${dayName} ${month}/${date} ${hours}:${minutes}:${seconds}`,
        color: "text-purple-400",
      };
    } else {
      // Show seconds only
      return {
        text: `${diffSeconds}s ago`,
        fullDate: `${dayName} ${month}/${date} ${hours}:${minutes}:${seconds}`,
        color: "text-purple-400",
      };
    }
  };

  // Cache for expensive date formatting operations (Performance Optimization Phase 1.1)
  const dateFormatCache = useRef(new Map());

  const calculateDasherTimeStatus = (lastUsedTime, dasherId = null) => {
    if (!lastUsedTime) return null;

    // Performance optimization (Phase 2.2): Skip expensive calculations for invisible dashers
    if (dasherId && !visibleDasherIds.has(dasherId)) {
      return {
        status: "hidden",
        text: "...",
        color: "text-gray-400",
        hoursRemaining: 0,
        fullDateTime: "..."
      };
    }

    const lastUsed = new Date(lastUsedTime);
    const now = new Date();
    const diffMs = now - lastUsed;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);
    const diffSeconds = Math.floor((diffMs / 1000) % 60);
    const remainingHours = 24 - diffHours;

    // Format the date/time details (with caching for performance)
    // Cache key: round to nearest minute to avoid cache explosion
    const cacheKey = Math.floor(lastUsed.getTime() / 60000) * 60000;

    let dayOfWeek, date, time, fullDateTime;
    if (dateFormatCache.current.has(cacheKey)) {
      const cached = dateFormatCache.current.get(cacheKey);
      dayOfWeek = cached.dayOfWeek;
      date = cached.date;
      time = cached.time;
      fullDateTime = cached.fullDateTime;
    } else {
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      dayOfWeek = days[lastUsed.getDay()];
      date = lastUsed.toLocaleDateString();
      time = lastUsed.toLocaleTimeString();
      fullDateTime = `${dayOfWeek}, ${date} at ${time}`;

      // Cache the formatted values
      dateFormatCache.current.set(cacheKey, { dayOfWeek, date, time, fullDateTime });

      // Prevent cache from growing indefinitely (keep last 100 entries)
      if (dateFormatCache.current.size > 100) {
        const firstKey = dateFormatCache.current.keys().next().value;
        dateFormatCache.current.delete(firstKey);
      }
    }

    if (diffHours < 24) {
      // Still within 24 hours
      const hoursLeft = Math.floor(remainingHours);
      const minutesLeft = Math.floor((remainingHours - hoursLeft) * 60);
      const secondsLeft = Math.floor(
        ((remainingHours - hoursLeft) * 60 - minutesLeft) * 60,
      );

      let color = "text-red-400"; // Default red for < 24 hours
      if (remainingHours <= 1) {
        color = "text-orange-400"; // Orange for last hour
      }

      let timeText = "";
      if (hoursLeft > 0) {
        timeText = `${hoursLeft}h ${minutesLeft}m ${secondsLeft}s left`;
      } else if (minutesLeft > 0) {
        timeText = `${minutesLeft}m ${secondsLeft}s left`;
      } else {
        timeText = `${secondsLeft}s left`;
      }

      return {
        status: "countdown",
        text: timeText,
        color,
        hoursRemaining: remainingHours,
        fullDateTime: fullDateTime,
      };
    } else {
      // More than 24 hours
      const daysElapsed = Math.floor(diffHours / 24);
      const hoursElapsed = Math.floor(diffHours % 24);
      const minutesElapsed = Math.floor((diffMs / (1000 * 60)) % 60);

      return {
        status: "elapsed",
        text:
          daysElapsed > 0
            ? `${daysElapsed}d ${hoursElapsed}h ${minutesElapsed}m ago`
            : `${Math.floor(diffHours)}h ${diffMinutes}m ago`,
        color: "text-green-400",
        hoursElapsed: diffHours,
        fullDateTime: fullDateTime,
      };
    }
  };

  // Cache for getDasherTitle results (Performance Optimization Phase 1.2)
  const dasherTitleCache = useRef(new Map());

  // [PERF-STAGE1] getDasherTitle now accepts localTick from DasherCard
  const getDasherTitle = useCallback((dasher, localTick = 0) => {
    try {
      // [PERF-STAGE1] Use localTick passed from DasherCard instead of global timer
      // This allows each card to update independently without re-rendering the entire tree

      // Generate cache key from dasher properties that affect display
      const cacheKey = `${dasher?.id || 'null'}-${dasher?.name || ''}-${dasher?.email || ''}-${dasher?.balance || ''}-${dasher?.lastUsed || ''}-${localTick}`;

      // Check cache first
      if (dasherTitleCache.current.has(cacheKey)) {
        return dasherTitleCache.current.get(cacheKey);
      }

      // Calculate title (existing logic)
      let titleResult;
      if (!dasher) {
        return React.createElement(
          "span",
          { key: "error" },
          "Invalid Dasher",
        );
      }

      const parts = [];

      // Name (bright purple)
      if (dasher.name) {
        parts.push(
          React.createElement(
            "span",
            { key: "name", className: "text-purple-200" },
            dasher.name,
          ),
        );
      }

      // Email (bright blue)
      if (dasher.email) {
        if (parts.length > 0)
          parts.push(React.createElement("span", { key: "sep1" }, " - "));
        parts.push(
          React.createElement(
            "span",
            { key: "email", className: "text-blue-200" },
            dasher.email,
          ),
        );
      }

      // If no name or email
      if (parts.length === 0) {
        parts.push(
          React.createElement("span", { key: "new" }, "New Dasher"),
        );
      }

      // (Legacy inline status indicators removed; unified flag badge row now handles status display.)

      // Balance (green if $0, red otherwise)
      const hasBalanceField =
        dasher.balance !== undefined &&
        dasher.balance !== null &&
        String(dasher.balance).trim() !== "";
      const numericBalance = parseBalanceValue(dasher.balance);
      if (hasBalanceField || numericBalance !== 0) {
        const displayBalance = hasBalanceField
          ? String(dasher.balance).trim().startsWith("$")
            ? String(dasher.balance).trim()
            : `$${numericBalance.toFixed(2)}`
          : `$${numericBalance.toFixed(2)}`;

        const isZero = numericBalance === 0;

        parts.push(React.createElement("span", { key: "sep2" }, " - "));
        parts.push(
          React.createElement(
            "span",
            {
              key: "balance",
              className: isZero ? "text-green-300" : "text-red-400",
            },
            displayBalance,
          ),
        );
      }

      // Add last used time if available
      if (dasher.lastUsed) {
        const timeStatus = calculateDasherTimeStatus(dasher.lastUsed, dasher.id);
        if (timeStatus && timeStatus.text) {
          parts.push(
            React.createElement(
              "span",
              { key: "time" },
              ` (${timeStatus.text})`,
            ),
          );
        }
      }

      titleResult = React.createElement(React.Fragment, {}, parts);

      // Cache the result with size limit
      dasherTitleCache.current.set(cacheKey, titleResult);
      if (dasherTitleCache.current.size > 100) {
        const firstKey = dasherTitleCache.current.keys().next().value;
        dasherTitleCache.current.delete(firstKey);
      }

      return titleResult;
    } catch (error) {
      console.error("Error in getDasherTitle:", error, dasher);
      const errorResult = React.createElement(
        "span",
        { key: "error" },
        "Error displaying dasher",
      );
      return errorResult;
    }
  }, [parseBalanceValue, calculateDasherTimeStatus]); // [PERF-STAGE1] Removed timerTick/slowTimerTick deps

  // Reusable full dasher details block (editing-aware)
  const renderDasherDetails = (
    dasher,
    list,
    setList,
    saveAllToLocalStorage,
    copyToClipboard,
    timeStatus,
    isEditing = false,
    categoryId = null,
    editingBalanceValue = "",
    setEditingBalanceValue = null,
  ) => {
    if (!dasher || !Array.isArray(list) || typeof setList !== "function")
      return null;

    const updateListField = (field, value) => {
      const isBalance = field === "balance";
      const nowIso = new Date().toISOString();
      if (!isBalance) {
        // Use updateDasherEverywhere to sync across all state representations
        updateDasherEverywhere(dasher.id, { [field]: value });
        return;
      }

      // Identity-aware balance update across duplicates.
      const primaryDescriptors = gatherDescriptorsForDasher();
      const rawInput =
        typeof value === "string"
          ? value
          : value === null || value === undefined
            ? ""
            : String(value);
      const trimmedInput = rawInput.trim();
      const isInterimValue =
        trimmedInput === "" ||
        trimmedInput === "-" ||
        trimmedInput === "." ||
        trimmedInput === "-." ||
        trimmedInput === "+";

      const hasFiniteValue = Number.isFinite(
        parseFloat(
          trimmedInput === "" || trimmedInput === "+" ? "NaN" : trimmedInput,
        ),
      );

      if (!primaryDescriptors || primaryDescriptors.length === 0) {
        // Fallback: local-only update
        setList((prev) =>
          prev.map((d) =>
            d.id === dasher.id ? { ...d, balance: rawInput } : d,
          ),
        );
        if (hasFiniteValue && !isInterimValue) {
          requestPersist();
        }
        return;
      }

      const prevNum = parseBalanceValue(dasher.balance);
      const nextNum = hasFiniteValue ? parseBalanceValue(rawInput) : prevNum;
      const delta = hasFiniteValue ? nextNum - prevNum : 0;
      // Don't sync peers during active typing - only update the current dasher
      const shouldSyncPeers = false; // Changed: Never sync during typing
      const historyUpdatesByIdentity = shouldSyncPeers ? new Map() : null;

      primaryDescriptors.forEach((descriptor) => {
        const descriptorIdentity =
          identityForMeta(descriptor.meta) || `ref::${descriptor.index}`;
        mutateDasherByMeta(descriptor, (existing) => {
          if (!existing) return existing;

          const existingPrev = parseBalanceValue(existing.balance);
          const history = ensureArray(existing.earningsHistory);

          // Skip updating other dashers when not syncing peers
          if (!shouldSyncPeers && existing.id !== dasher.id) {
            return existing;
          }

          let nextBalanceValue;
          // Check if this is the dasher being edited
          const isCurrentDasher = existing.id === dasher.id;
          if (isCurrentDasher) {
            // Keep raw input for the dasher being edited - no formatting
            nextBalanceValue = rawInput;
          } else {
            const updatedValue = shouldSyncPeers
              ? existingPrev + delta
              : existingPrev;
            const clampedBalance = Math.max(
              -1000000,
              Math.min(1000000, Number.isFinite(updatedValue) ? updatedValue : existingPrev),
            );
            nextBalanceValue = Number.isFinite(clampedBalance)
              ? clampedBalance.toFixed(2)
              : existingPrev.toFixed(2);
          }

          let nextHistory = history;
          if (shouldSyncPeers && delta > 0.000001) {
            if (
              descriptorIdentity &&
              historyUpdatesByIdentity &&
              historyUpdatesByIdentity.has(descriptorIdentity)
            ) {
              nextHistory =
                historyUpdatesByIdentity.get(descriptorIdentity);
            } else {
              const historyEntry = {
                amount: Number(delta.toFixed(2)),
                at: nowIso,
                source: "balance-edit",
              };
              const updatedHistory = [...history, historyEntry];
              if (descriptorIdentity && historyUpdatesByIdentity) {
                historyUpdatesByIdentity.set(
                  descriptorIdentity,
                  updatedHistory,
                );
              }
              nextHistory = updatedHistory;
            }
          } else if (
            shouldSyncPeers &&
            descriptorIdentity &&
            historyUpdatesByIdentity &&
            historyUpdatesByIdentity.has(descriptorIdentity)
          ) {
            nextHistory =
              historyUpdatesByIdentity.get(descriptorIdentity);
          }

          return {
            ...existing,
            balance: nextBalanceValue,
            earningsHistory: nextHistory,
          };
        });
      });

      if (shouldSyncPeers) {
        requestPersist();
      }
    };

    const updateFlag = (flag, checked) => {
      const timestamp = checked ? new Date().toISOString() : null;
      const patch = { [flag]: checked };
      if (flag === "crimson") patch.crimsonAt = timestamp;
      if (flag === "redCard") patch.redCardAt = timestamp;
      if (flag === "appealed") patch.appealedAt = timestamp;

      setList((prev) =>
        prev.map((d) => (d.id === dasher.id ? { ...d, ...patch } : d)),
      );

      const descriptors = gatherDescriptorsForDasher();
      if (Array.isArray(descriptors) && descriptors.length > 0) {
        descriptors.forEach((descriptor) => {
          mutateDasherByMeta(descriptor, (existing) => {
            if (!existing) return existing;
            return { ...existing, ...patch };
          });
        });
      } else {
        patchDasherEverywhere(patch);
      }

      requestPersist();
    };

    const resetAppealedLocal = () => {
      const patch = { appealedAt: null };
      setList((prev) =>
        prev.map((d) =>
          d.id === dasher.id ? { ...d, ...patch } : d,
        ),
      );

      const descriptors = gatherDescriptorsForDasher();
      if (Array.isArray(descriptors) && descriptors.length > 0) {
        descriptors.forEach((descriptor) => {
          mutateDasherByMeta(descriptor, (existing) => {
            if (!existing) return existing;
            return { ...existing, ...patch };
          });
        });
      } else {
        patchDasherEverywhere(patch);
      }

      requestPersist();
    };

    const appealedStatus =
      dasher.appealed && dasher.appealedAt
        ? calculateAppealedTimeStatus(dasher.appealedAt)
        : null;

    // Local helpers for cash-out selection & info fields
    const updateSelectedCashout = (value) => {
      const normalized = (value || "").toLowerCase();
      const allowed = ["", "crimson", "fastpay"];
      const next = allowed.includes(normalized) ? normalized : "";
      setList((prev) =>
        prev.map((d) =>
          d.id === dasher.id ? { ...d, selectedCashout: next } : d,
        ),
      );
      requestPersist();
    };
    const updateTextField = (field, value) => {
      setList((prev) =>
        prev.map((d) =>
          d.id === dasher.id ? { ...d, [field]: value } : d,
        ),
      );
      requestPersist();
    };

    const scopeKey = `card-${safeFieldSegment(categoryId ?? "bucket")}-${safeFieldSegment(dasher?.id ?? dasher?.email ?? dasher?.phone ?? "dash")}`;
    const draftDasher = getDraftForKey(scopeKey);
    const setDraftDasher = (updater) => setDraftForKey(scopeKey, updater);
    const inlineAmountInputId = `inline-earning-${scopeKey}`;
    const inlineAmountValue = draftDasher._addEarningAmount ?? "";
    const inlineParsedAmount = deriveNumericAmount(inlineAmountValue);
    const inlineHasAmount = String(inlineAmountValue).trim() !== "";
    const inlineAmountIsValid =
      Number.isFinite(inlineParsedAmount) && inlineParsedAmount > 0;
    const inlineApplyBalance =
      draftDasher._addEarningApply !== undefined
        ? !!draftDasher._addEarningApply
        : true;
    const inlineErrorMessage = draftDasher._addEarningError || "";

    const gatherDescriptorsForDasher = () =>
      getDescriptorsForDasher(dasher, {
        preferredBucketId: categoryId ?? null,
        fallbackHint: `${categoryId ?? "bucket"}-${dasher?.id ?? dasher?.email ?? dasher?.phone ?? "dash"}`,
      });

    const patchDasherEverywhere = (patch) => {
      const applyToArray = (arr) => {
        if (!Array.isArray(arr)) return arr;
        return arr.map((d) =>
          d && d.id === dasher.id ? { ...d, ...patch } : d,
        );
      };

      setReadyDashers((prev) => applyToArray(prev));
      setCurrentlyUsingDashers((prev) => applyToArray(prev));
      setAppealedDashers((prev) => applyToArray(prev));
      setAppliedPendingDashers((prev) => applyToArray(prev));
      setReverifDashers((prev) => applyToArray(prev));
      setLockedDashers((prev) => applyToArray(prev));
      setDeactivatedDashers((prev) => applyToArray(prev));
      setArchivedDashers((prev) => applyToArray(prev));
      setDasherCategories((prev) =>
        prev.map((cat) => {
          if (!cat || !Array.isArray(cat.dashers)) return cat;
          const nextDashers = cat.dashers.map((d) =>
            d && d.id === dasher.id ? { ...d, ...patch } : d,
          );
          return {
            ...cat,
            dashers: nextDashers,
          };
        }),
      );
    };

    return React.createElement(
      "div",
      { className: "space-y-2 text-xs" },
      [
        // Name
        React.createElement(
          "div",
          { key: "name", className: "flex items-center gap-2" },
          [
            React.createElement(
              "label",
              { className: "text-xs text-gray-400 w-20" },
              "Name:",
            ),
            isEditing
              ? React.createElement("input", {
                type: "text",
                value: dasher.name || "",
                onChange: (e) =>
                  updateListField("name", e.target.value),
                className:
                  "flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gray-400",
              })
              : React.createElement(
                "div",
                { className: "flex-1 text-xs text-gray-200" },
                dasher.name ||
                React.createElement(
                  "span",
                  { className: "italic text-gray-500" },
                  "No name",
                ),
              ),
            dasher.name &&
            !isEditing &&
            React.createElement(
              "button",
              {
                onClick: () => copyToClipboard(dasher.name),
                className: "text-blue-400 hover:text-blue-300 p-1",
                title: "Copy name",
              },
              React.createElement(Copy, { size: 12 }),
            ),
          ],
        ),

        // Email
        React.createElement(
          "div",
          { key: "email", className: "flex items-center gap-2" },
          [
            React.createElement(
              "label",
              { className: "text-xs text-gray-400 w-20" },
              "Email:",
            ),
            isEditing
              ? React.createElement("input", {
                type: "email",
                value: dasher.email || "",
                onChange: (e) =>
                  updateListField("email", e.target.value),
                className:
                  "flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gray-400",
              })
              : React.createElement(
                "div",
                { className: "flex-1 text-xs text-gray-200" },
                dasher.email ||
                React.createElement(
                  "span",
                  { className: "italic text-gray-500" },
                  "No email",
                ),
              ),
            dasher.email &&
            !isEditing &&
            React.createElement(
              "button",
              {
                onClick: () => copyToClipboard(dasher.email),
                className: "text-blue-400 hover:text-blue-300 p-1",
                title: "Copy email",
                "aria-label": "Copy email address",
              },
              React.createElement(Copy, { size: 12 }),
            ),
          ],
        ),

        // Email Password
        React.createElement(
          "div",
          { key: "emailPw", className: "flex items-center gap-2" },
          [
            React.createElement(
              "label",
              { className: "text-xs text-gray-400 w-20" },
              "Email pw:",
            ),
            isEditing
              ? React.createElement("input", {
                type: "text",
                value: dasher.emailPw || "",
                onChange: (e) =>
                  updateListField("emailPw", e.target.value),
                className:
                  "flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gray-400",
              })
              : React.createElement(
                "div",
                { className: "flex-1 text-xs text-gray-200" },
                dasher.emailPw
                  ? "••••••••"
                  : React.createElement(
                    "span",
                    { className: "italic text-gray-500" },
                    "No password",
                  ),
              ),
            dasher.emailPw &&
            !isEditing &&
            React.createElement(
              "button",
              {
                onClick: () => copyToClipboard(dasher.emailPw),
                className: "text-blue-400 hover:text-blue-300 p-1",
                title: "Copy email password",
                "aria-label": "Copy email password",
              },
              React.createElement(Copy, { size: 12 }),
            ),
          ],
        ),

        // Dasher Password
        React.createElement(
          "div",
          { key: "dasherPw", className: "flex items-center gap-2" },
          [
            React.createElement(
              "label",
              { className: "text-xs text-gray-400 w-20" },
              "Dasher pw:",
            ),
            isEditing
              ? React.createElement("input", {
                type: "text",
                value: dasher.dasherPw || "",
                onChange: (e) =>
                  updateListField("dasherPw", e.target.value),
                className:
                  "flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gray-400",
              })
              : React.createElement(
                "div",
                { className: "flex-1 text-xs text-gray-200" },
                dasher.dasherPw
                  ? "••••••••"
                  : React.createElement(
                    "span",
                    { className: "italic text-gray-500" },
                    "No password",
                  ),
              ),
            dasher.dasherPw &&
            !isEditing &&
            React.createElement(
              "button",
              {
                onClick: () => copyToClipboard(dasher.dasherPw),
                className: "text-blue-400 hover:text-blue-300 p-1",
                title: "Copy dasher password",
                "aria-label": "Copy dasher password",
              },
              React.createElement(Copy, { size: 12 }),
            ),
          ],
        ),

        // Phone
        React.createElement(
          "div",
          { key: "phone", className: "flex items-center gap-2" },
          [
            React.createElement(
              "label",
              { className: "text-xs text-gray-400 w-20" },
              "Phone:",
            ),
            isEditing
              ? React.createElement("input", {
                type: "tel",
                value: dasher.phone || "",
                onChange: (e) =>
                  updateListField("phone", e.target.value),
                className:
                  "flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gray-400",
              })
              : React.createElement(
                "div",
                { className: "flex-1 text-xs text-gray-200" },
                dasher.phone ||
                React.createElement(
                  "span",
                  { className: "italic text-gray-500" },
                  "No phone",
                ),
              ),
            dasher.phone &&
            !isEditing &&
            React.createElement(
              "button",
              {
                onClick: () => copyToClipboard(dasher.phone),
                className: "text-blue-400 hover:text-blue-300 p-1",
                title: "Copy phone",
                "aria-label": "Copy phone number",
              },
              React.createElement(Copy, { size: 12 }),
            ),
          ],
        ),

        // Balance
        React.createElement(
          "div",
          { key: "balance", className: "flex items-center gap-2" },
          [
            React.createElement(
              "label",
              { className: "text-xs text-gray-400 w-20" },
              "Balance:",
            ),
            isEditing
              ? React.createElement("input", {
                type: "text",
                value: editingBalanceValue,
                onChange: (e) => {
                  // Just update the local editing value, no formatting
                  setEditingBalanceValue(e.target.value);
                },
                // Removed onBlur to prevent formatting during edit
                className:
                  "flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gray-400",
              })
              : React.createElement(
                "div",
                { className: "flex-1 text-xs text-gray-200" },
                `$${parseBalanceValue(dasher.balance).toFixed(2)}`,
              ),
          ],
        ),

        // Add Earning (inline)
        React.createElement(
          "div",
          { key: "addEarningWrapper", className: "pt-1" },
          [
            React.createElement(
              "div",
              {
                key: "addEarning",
                className: "db-field-row db-align-center gap-2",
              },
              [
                React.createElement(
                  "div",
                  { key: "e1", className: "db-col-amount" },
                  React.createElement("input", {
                    id: inlineAmountInputId,
                    type: "number",
                    inputMode: "decimal",
                    min: 0,
                    step: "0.01",
                    value: inlineAmountValue,
                    onChange: (e) =>
                      setDraftDasher((d) => ({
                        ...d,
                        _addEarningAmount: e.target.value,
                        _addEarningError: "",
                      })),
                    placeholder: "Amount",
                    className: "db-input-sm w-24 placeholder-gray-400",
                    "aria-label": "Add earning amount",
                    "aria-invalid":
                      inlineErrorMessage ||
                        (inlineHasAmount && !inlineAmountIsValid)
                        ? "true"
                        : "false",
                    "aria-describedby": inlineErrorMessage
                      ? `${inlineAmountInputId}-error`
                      : undefined,
                  }),
                ),
                React.createElement(
                  "div",
                  { key: "e2", className: "db-col-source" },
                  React.createElement("input", {
                    type: "text",
                    value: draftDasher._addEarningSource || "",
                    onChange: (e) =>
                      setDraftDasher((d) => ({
                        ...d,
                        _addEarningSource: e.target.value,
                      })),
                    placeholder: "Source",
                    className: "db-input-sm w-28 placeholder-gray-400",
                    "aria-label": "Add earning source",
                  }),
                ),
                React.createElement(
                  "div",
                  { key: "e3", className: "db-col-notes" },
                  React.createElement("input", {
                    type: "text",
                    value: draftDasher._addEarningNotes || "",
                    onChange: (e) =>
                      setDraftDasher((d) => ({
                        ...d,
                        _addEarningNotes: e.target.value,
                      })),
                    placeholder: "Notes",
                    className: "db-input-sm w-full placeholder-gray-400",
                    "aria-label": "Add earning notes",
                  }),
                ),
                React.createElement(
                  "label",
                  {
                    key: "e4",
                    className:
                      "flex items-center gap-1 text-[11px] text-gray-300",
                  },
                  [
                    React.createElement("input", {
                      type: "checkbox",
                      checked: inlineApplyBalance,
                      onChange: (e) =>
                        setDraftDasher((d) => ({
                          ...d,
                          _addEarningApply: e.target.checked,
                        })),
                    }),
                    "Also increase balance",
                  ],
                ),
                React.createElement(
                  "button",
                  {
                    key: "eAdd",
                    disabled: !inlineHasAmount,
                    onClick: () => {
                      const amt = deriveNumericAmount(
                        draftDasher._addEarningAmount,
                      );
                      if (!Number.isFinite(amt) || amt <= 0) {
                        const errMsg = "Enter a valid positive amount.";
                        setDraftDasher((prev) => ({
                          ...prev,
                          _addEarningError: errMsg,
                        }));
                        setTimeout(() => {
                          const inputNode =
                            document.getElementById(inlineAmountInputId);
                          if (inputNode) {
                            inputNode.focus();
                            if (typeof inputNode.select === "function")
                              inputNode.select();
                          }
                        }, 0);
                        announceFailure(errMsg);
                        return;
                      }

                      const source =
                        (
                          draftDasher._addEarningSource || "manual"
                        ).trim() || "manual";
                      const notes = (
                        draftDasher._addEarningNotes || ""
                      ).trim();
                      const applyBalance = inlineApplyBalance;
                      const nowIso = new Date().toISOString();
                      const targets = gatherDescriptorsForDasher();

                      if (!targets || targets.length === 0) {
                        const errMsg =
                          "Couldn't locate matching dasher record.";
                        setDraftDasher((prev) => ({
                          ...prev,
                          _addEarningError: errMsg,
                        }));
                        announceFailure(errMsg);
                        return;
                      }

                      targets.forEach((descriptor) => {
                        mutateDasherByMeta(descriptor, (existing) => {
                          if (!existing) return existing;
                          const history = ensureArray(
                            existing.earningsHistory,
                          );
                          const nextHistory = [
                            ...history,
                            { amount: amt, at: nowIso, source },
                          ];

                          let nextBalance = existing.balance;
                          if (applyBalance) {
                            const currentBalance = parseBalanceValue(
                              existing.balance,
                            );
                            nextBalance = (
                              currentBalance + amt
                            ).toString();
                          }

                          let nextNotes = existing.notes;
                          if (notes) {
                            const stamped = `[earning ${amt.toFixed(2)}] ${notes}`;
                            nextNotes = nextNotes
                              ? `${nextNotes}\n${stamped}`
                              : stamped;
                          }

                          return {
                            ...existing,
                            earningsHistory: nextHistory,
                            balance: nextBalance,
                            notes: nextNotes,
                          };
                        });
                      });

                      requestPersist();
                      setDraftDasher((prev) => ({
                        ...prev,
                        _addEarningAmount: "",
                        _addEarningSource: "",
                        _addEarningNotes: "",
                        _addEarningApply: true,
                        _addEarningError: "",
                      }));
                      announceSuccess("Earning added");

                      setTimeout(() => {
                        const inputNode =
                          document.getElementById(inlineAmountInputId);
                        if (inputNode) {
                          inputNode.focus();
                          if (typeof inputNode.select === "function")
                            inputNode.select();
                        }
                      }, 50);
                    },
                    className:
                      "px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-xs text-white disabled:opacity-40 disabled:cursor-not-allowed",
                  },
                  "Add",
                ),
              ],
            ),
            inlineErrorMessage &&
            React.createElement(
              "div",
              {
                key: "eError",
                id: `${inlineAmountInputId}-error`,
                className: "text-[11px] text-red-400 mt-1",
                role: "status",
                "aria-live": "polite",
              },
              inlineErrorMessage,
            ),
          ],
        ),

        // Appealed Timer (if appealed)
        dasher.appealed &&
        appealedStatus &&
        React.createElement(
          "div",
          {
            key: "appealedTimer",
            className: "flex items-center gap-2",
          },
          [
            React.createElement(
              "label",
              { className: "text-xs text-gray-400 w-20" },
              "Appealed at:",
            ),
            React.createElement(
              "div",
              { className: "flex-1 text-xs" },
              React.createElement(
                "span",
                {
                  className: appealedStatus.color,
                  title: appealedStatus.fullDate,
                },
                appealedStatus.text,
              ),
            ),
            isEditing &&
            React.createElement(
              "button",
              {
                onClick: resetAppealedLocal,
                className:
                  "text-purple-400 hover:text-purple-300 p-0.5",
                title: "Reset appealed timer",
              },
              React.createElement(TimerOff, { size: 12 }),
            ),
          ],
        ),

        // Last Used Timer (if provided)
        dasher.lastUsed &&
        timeStatus &&
        React.createElement(
          "div",
          {
            key: "timer",
            className: "flex items-center justify-between",
          },
          [
            React.createElement(
              "span",
              { className: "text-gray-400" },
              "Timer:",
            ),
            React.createElement(
              "span",
              { className: `font-mono ${timeStatus.color}` },
              timeStatus.display,
            ),
          ],
        ),

        // Notes
        React.createElement(
          "div",
          { key: "notes", className: "flex items-start gap-2" },
          [
            React.createElement(
              "label",
              { className: "text-xs text-gray-400 w-20 mt-1" },
              "Notes:",
            ),
            isEditing
              ? React.createElement("textarea", {
                value: dasher.notes || "",
                onChange: (e) =>
                  updateListField("notes", e.target.value),
                className:
                  "flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-0.5 text-xs text-white resize-y min-h-[2.5rem] focus:outline-none focus:ring-1 focus:ring-gray-400",
                rows: 2,
                placeholder: "Any notes...",
                style: { minHeight: "2.5rem" },
              })
              : React.createElement(React.Fragment, {}, [
                React.createElement(
                  "div",
                  {
                    key: "n1",
                    className: `flex-1 text-xs text-gray-200 ${isDasherNotesCollapsed(dasher.id) ? "truncate max-w-[48ch]" : "whitespace-pre-wrap"}`,
                  },
                  dasher.notes ||
                  React.createElement(
                    "span",
                    { className: "italic text-gray-500" },
                    "No notes",
                  ),
                ),
                dasher.notes &&
                React.createElement(
                  "button",
                  {
                    key: "n2",
                    onClick: () => copyToClipboard(dasher.notes),
                    className:
                      "text-blue-400 hover:text-blue-300 p-1 self-start",
                    title: "Copy notes",
                  },
                  React.createElement(Copy, { size: 12 }),
                ),
                React.createElement(
                  "button",
                  {
                    key: "n3",
                    onClick: () =>
                      toggleDasherNotesCollapsed(dasher.id),
                    className:
                      "text-blue-300 hover:text-blue-200 p-1 self-start",
                    title: isDasherNotesCollapsed(dasher.id)
                      ? "Show full notes"
                      : "Collapse notes",
                  },
                  isDasherNotesCollapsed(dasher.id)
                    ? React.createElement(ChevronDown, { size: 14 })
                    : React.createElement(ChevronUp, { size: 14 }),
                ),
              ]),
          ],
        ),

        // Flags
        React.createElement(
          "div",
          { key: "flagsC", className: "flex items-center gap-2" },
          [
            React.createElement(
              "label",
              { className: "text-xs text-gray-400 w-20" },
              "Crimson:",
            ),
            React.createElement("input", {
              type: "checkbox",
              checked: !!dasher.crimson,
              onChange: (e) => updateFlag("crimson", e.target.checked),
              disabled: !isEditing,
              className:
                "h-3 w-3 bg-gray-700 border-gray-600 rounded disabled:opacity-50",
            }),
            React.createElement(
              "span",
              { className: "text-xs text-gray-400" },
              dasher.crimson ? "Yes" : "No",
            ),
          ],
        ),
        // Crimson Info
        React.createElement(
          "div",
          { key: "crimsonInfo", className: "flex items-center gap-2" },
          [
            React.createElement(
              "label",
              { className: "text-xs text-gray-400 w-20" },
              "Crimson info:",
            ),
            isEditing
              ? React.createElement("input", {
                type: "text",
                value: dasher.crimsonInfo || "",
                onChange: (e) =>
                  updateTextField("crimsonInfo", e.target.value),
                className:
                  "flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white",
                placeholder: "Optional details about Crimson…",
              })
              : React.createElement(
                "div",
                { className: "flex-1 text-xs text-gray-300" },
                dasher.crimsonInfo ||
                React.createElement(
                  "span",
                  { className: "italic text-gray-500" },
                  "No info",
                ),
              ),
          ],
        ),
        React.createElement(
          "div",
          { key: "flagsR", className: "flex items-center gap-2" },
          [
            React.createElement(
              "label",
              { className: "text-xs text-gray-400 w-20" },
              "Red Card:",
            ),
            React.createElement("input", {
              type: "checkbox",
              checked: !!dasher.redCard,
              onChange: (e) => updateFlag("redCard", e.target.checked),
              disabled: !isEditing,
              className:
                "h-3 w-3 bg-gray-700 border-gray-600 rounded disabled:opacity-50",
            }),
            React.createElement(
              "span",
              { className: "text-xs text-gray-400" },
              dasher.redCard ? "Yes" : "No",
            ),
          ],
        ),
        React.createElement(
          "div",
          { key: "flagsA", className: "flex items-center gap-2" },
          [
            React.createElement(
              "label",
              { className: "text-xs text-gray-400 w-20" },
              "Appealed:",
            ),
            React.createElement("input", {
              type: "checkbox",
              checked: !!dasher.appealed,
              onChange: (e) => updateFlag("appealed", e.target.checked),
              disabled: !isEditing,
              className:
                "h-3 w-3 bg-gray-700 border-gray-600 rounded disabled:opacity-50",
            }),
            React.createElement(
              "span",
              { className: "text-xs text-gray-400" },
              dasher.appealed ? "Yes" : "No",
            ),
          ],
        ),

        // FastPay
        React.createElement(
          "div",
          { key: "fastpayRow", className: "flex items-center gap-2" },
          [
            React.createElement(
              "label",
              { className: "text-xs text-gray-400 w-20" },
              "FastPay:",
            ),
            React.createElement("input", {
              type: "checkbox",
              checked: !!dasher.fastPay,
              onChange: (e) =>
                updateListField("fastPay", e.target.checked),
              disabled: !isEditing,
              className:
                "h-3 w-3 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-gray-400 focus:ring-1 disabled:opacity-50",
            }),
            React.createElement(
              "span",
              { className: "text-xs text-gray-400" },
              dasher.fastPay ? "Yes" : "No",
            ),
          ],
        ),
        React.createElement(
          "div",
          { key: "fastpayInfo", className: "flex items-center gap-2" },
          [
            React.createElement(
              "label",
              { className: "text-xs text-gray-400 w-20" },
              "FastPay info:",
            ),
            isEditing
              ? React.createElement("input", {
                type: "text",
                value: dasher.fastPayInfo || "",
                onChange: (e) =>
                  updateTextField("fastPayInfo", e.target.value),
                className:
                  "flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gray-400",
                placeholder: "Optional details about FastPay…",
              })
              : React.createElement(
                "div",
                { className: "flex-1 text-xs text-gray-300" },
                dasher.fastPayInfo ||
                React.createElement(
                  "span",
                  { className: "italic text-gray-500" },
                  "No info",
                ),
              ),
          ],
        ),

        // Selected cash-out method
        React.createElement(
          "div",
          {
            key: "selectedCashout",
            className: "flex items-center gap-2",
          },
          [
            React.createElement(
              "label",
              { className: "text-xs text-gray-400 w-20" },
              "Selected cash-out:",
            ),
            isEditing
              ? React.createElement(
                "select",
                {
                  value: (dasher.selectedCashout || "").toLowerCase(),
                  onChange: (e) =>
                    updateSelectedCashout(e.target.value),
                  className:
                    "bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white",
                },
                [
                  React.createElement(
                    "option",
                    { key: "none", value: "" },
                    "None",
                  ),
                  React.createElement(
                    "option",
                    { key: "crimson", value: "crimson" },
                    "Crimson",
                  ),
                  React.createElement(
                    "option",
                    { key: "fastpay", value: "fastpay" },
                    "FastPay",
                  ),
                ],
              )
              : React.createElement(
                "div",
                { className: "text-xs text-gray-300" },
                dasher.selectedCashout
                  ? dasher.selectedCashout === "crimson"
                    ? "Crimson"
                    : "FastPay"
                  : "None",
              ),
          ],
        ),

        // Cash-out history (edit-aware)
        React.createElement(
          "div",
          { key: "cashouts" },
          renderCashOutHistory(dasher, isEditing),
        ),
      ].filter(Boolean),
    );
  };

  /* ========= CATEGORY & TIME HELPERS ========= */
  const categoryLabelMap = {
    main: "Main",
    ready: "Ready",
    "currently-using": "Using",
    appealed: "Appealed",
    deactivated: "Deactivated",
    archived: "Archived",
    locked: "Locked",
    "applied-pending": "Applied Pending",
    reverif: "Reverif",
  };

  const getCategoryName = (id) => {
    if (!id) return "Main";
    const match = dasherCategories.find((cat) => cat.id === id);
    if (match) return match.name || "Main";
    if (id === "main") return "Main";
    return "Main";
  };

  const getMainDestinationCategoryName = (dasher, fromCategoryId) => {
    let targetId =
      (dasher && dasher.originalCategory) || fromCategoryId || "main";
    if (!dasherCategories.some((cat) => cat.id === targetId)) {
      if (dasherCategories.some((cat) => cat.id === "main")) {
        targetId = "main";
      } else if (dasherCategories.length > 0) {
        targetId = dasherCategories[0].id;
      }
    }
    return getCategoryName(targetId);
  };

  const markRecentlyMoved = (dasherId) => {
    if (!dasherId) return;
    setRecentlyMoved((prev) => {
      const next = new Set(prev);
      next.add(dasherId);
      return next;
    });
    const timers = recentlyMovedTimersRef.current;
    if (timers.has(dasherId)) {
      clearTimeout(timers.get(dasherId));
    }
    const timeoutId = setTimeout(() => {
      setRecentlyMoved((prev) => {
        const next = new Set(prev);
        next.delete(dasherId);
        return next;
      });
      timers.delete(dasherId);
    }, 2000);
    timers.set(dasherId, timeoutId);
  };

  const showMoveToast = (toKey, destCategoryName = null) => {
    const message =
      toKey === "main"
        ? `✅ Moved to Main: ${destCategoryName || "Main"}`
        : `✅ Moved to ${categoryLabelMap[toKey] || toKey}`;

    moveToastActiveRef.current = true;
    if (saveNotificationTimeoutRef.current) {
      clearTimeout(saveNotificationTimeoutRef.current);
    }

    setSaveNotification(message);
    saveNotificationTimeoutRef.current = setTimeout(() => {
      moveToastActiveRef.current = false;
      setSaveNotification("");
      saveNotificationTimeoutRef.current = null;
    }, 2500);
  };

  const showMoveDebug = (fromKey, toKey) => {
    if (!DEV) return;
    setMoveDebug({ from: fromKey, to: toKey, at: Date.now() });
    setTimeout(() => setMoveDebug(null), 2000);
  };

  const formatRelativeTime = (iso) => {
    if (!iso) return "";
    const diffMs = Date.now() - new Date(iso).getTime();
    const s = Math.floor(diffMs / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ${h % 24}h ago`;
    if (h > 0) return `${h}h ${m % 60}m ago`;
    if (m > 0) return `${m}m ${s % 60}s ago`;
    return `${s}s ago`;
  };

  /* ========= UNIFIED DASHER MOVE LOGIC (main / ready / using / appealed / deactivated / archived) ========= */
  const dasherFlowKeys = [
    "main",
    "ready",
    "currently-using",
    "appealed",
    "applied-pending",
    "reverif",
    "locked",
    "deactivated",
    "archived",
  ];

  const sanitizeDasherFlags = (d) => {
    const clone = { ...d };
    delete clone.ready;
    delete clone.readyAt;
    delete clone.currentlyUsing;
    delete clone.currentlyUsingAt;
    delete clone.appealed;
    delete clone.appealedAt;
    delete clone.appliedPending;
    delete clone.appliedPendingAt;
    delete clone.reverif;
    delete clone.reverifAt;
    delete clone.locked;
    delete clone.lockedAt;
    delete clone.deactivated;
    delete clone.deactivatedAt;
    delete clone.archived;
    delete clone.archivedAt;
    return clone;
  };

  const idsMatch = (a, b) => String(a) === String(b);

  // DEV-only helper to inspect counts across all buckets
  const getBucketCounts = () => ({
    main: Array.isArray(dasherCategories)
      ? dasherCategories.reduce(
        (sum, c) =>
          sum + (Array.isArray(c?.dashers) ? c.dashers.length : 0),
        0,
      )
      : 0,
    ready: Array.isArray(readyDashers) ? readyDashers.length : 0,
    currentlyUsing: Array.isArray(currentlyUsingDashers)
      ? currentlyUsingDashers.length
      : 0,
    appealed: Array.isArray(appealedDashers) ? appealedDashers.length : 0,
    appliedPending: Array.isArray(appliedPendingDashers)
      ? appliedPendingDashers.length
      : 0,
    reverif: Array.isArray(reverifDashers) ? reverifDashers.length : 0,
    locked: Array.isArray(lockedDashers) ? lockedDashers.length : 0,
    deactivated: Array.isArray(deactivatedDashers)
      ? deactivatedDashers.length
      : 0,
    archived: Array.isArray(archivedDashers) ? archivedDashers.length : 0,
  });

  const locateDasher = (dasherId) => {
    const topBuckets = [
      ["ready", readyDashers],
      ["currently-using", currentlyUsingDashers],
      ["appealed", appealedDashers],
      ["applied-pending", appliedPendingDashers],
      ["reverif", reverifDashers],
      ["locked", lockedDashers],
      ["deactivated", deactivatedDashers],
      ["archived", archivedDashers],
    ];

    for (const [key, list] of topBuckets) {
      if (!Array.isArray(list)) continue;
      const idx = list.findIndex((d) => idsMatch(d.id, dasherId));
      if (idx !== -1) {
        return { sourceKey: key, index: idx, dasher: list[idx] };
      }
    }

    if (Array.isArray(dasherCategories)) {
      for (const cat of dasherCategories) {
        if (!cat || !Array.isArray(cat.dashers)) continue;
        const idx = cat.dashers.findIndex((d) =>
          idsMatch(d.id, dasherId),
        );
        if (idx !== -1) {
          return {
            sourceKey: "main",
            categoryId: cat.id,
            index: idx,
            dasher: cat.dashers[idx],
          };
        }
      }
    }

    return null;
  };

  const removeDasherFromState = (location) => {
    if (!location) return;
    const { sourceKey, index, categoryId } = location;

    const removeFromList = (setter) => {
      setter((prev) => {
        if (!Array.isArray(prev)) return prev;
        if (index < 0 || index >= prev.length) return prev;
        if (DEV) {
          try {
            const removed = prev[index]?.id;
          } catch { }
        }
        return prev.filter((_, i) => i !== index);
      });
    };

    if (sourceKey === "ready") removeFromList(setReadyDashers);
    else if (sourceKey === "currently-using")
      removeFromList(setCurrentlyUsingDashers);
    else if (sourceKey === "appealed") removeFromList(setAppealedDashers);
    else if (sourceKey === "applied-pending")
      removeFromList(setAppliedPendingDashers);
    else if (sourceKey === "reverif") removeFromList(setReverifDashers);
    else if (sourceKey === "locked") removeFromList(setLockedDashers);
    else if (sourceKey === "deactivated")
      removeFromList(setDeactivatedDashers);
    else if (sourceKey === "archived") removeFromList(setArchivedDashers);
    else if (sourceKey === "main" && categoryId != null) {
      setDasherCategories((prev) => {
        if (!Array.isArray(prev)) return prev;
        const next = prev.map((cat) => {
          if (
            !cat ||
            cat.id !== categoryId ||
            !Array.isArray(cat.dashers)
          )
            return cat;
          if (index < 0 || index >= cat.dashers.length) return cat;
          if (DEV) {
            try {
              const removed = cat.dashers[index]?.id;
            } catch { }
          }
          const nextDashers = cat.dashers.filter((_, i) => i !== index);
          return { ...cat, dashers: nextDashers };
        });
        return next;
      });
    }
  };

  const insertDasherIntoBucket = (dasher, destKey, fromCategoryId) => {
    if (!dasher) return;
    let working = sanitizeDasherFlags({ ...dasher });

    if (
      !working.originalCategory &&
      fromCategoryId &&
      fromCategoryId !== "main"
    ) {
      working.originalCategory = fromCategoryId;
    }

    const stamp = (flag, atField) => ({
      ...working,
      [flag]: true,
      [atField]: new Date().toISOString(),
    });

    if (destKey === "main") {
      setDasherCategories((prev) => {
        let inserted = false;
        const targetId =
          working.originalCategory || fromCategoryId || "main";
        let next = prev.map((c) => {
          if (c.id === targetId) {
            inserted = true;
            const dashers = Array.isArray(c.dashers) ? c.dashers : [];
            if (DEV) {
              try {
                console.debug(
                  "[DashBash] insertDasherIntoBucket → main",
                  {
                    into: targetId,
                    dasherId: working.id,
                    position: "append",
                  },
                );
              } catch { }
            }
            return { ...c, dashers: [...dashers, working] };
          }
          return c;
        });

        if (!inserted) {
          next = next.map((c) => {
            if (c.id === "main") {
              const dashers = Array.isArray(c.dashers) ? c.dashers : [];
              inserted = true;
              if (DEV) {
                try {
                  console.debug(
                    "[DashBash] insertDasherIntoBucket → main (fallback main id)",
                    {
                      into: "main",
                      dasherId: working.id,
                      position: "append",
                    },
                  );
                } catch { }
              }
              return { ...c, dashers: [...dashers, working] };
            }
            return c;
          });
        }

        if (!inserted && next.length > 0) {
          const [first, ...rest] = next;
          const dashers = Array.isArray(first.dashers)
            ? first.dashers
            : [];
          if (DEV) {
            try {
              console.debug(
                "[DashBash] insertDasherIntoBucket → main (fallback first category)",
                {
                  into: first?.id,
                  dasherId: working.id,
                  position: "append",
                },
              );
            } catch { }
          }
          const updatedFirst = {
            ...first,
            dashers: [...dashers, working],
          };
          return [updatedFirst, ...rest];
        }

        return next;
      });
    } else if (destKey === "ready") {
      setReadyDashers((prev) => {
        const item = stamp("ready", "readyAt");
        if (DEV) {
          try {
            console.debug("[DashBash] insertDasherIntoBucket", {
              destKey,
              dasherId: item.id,
              newLength: (prev?.length || 0) + 1,
            });
          } catch { }
        }
        return [item, ...prev];
      });
    } else if (destKey === "currently-using") {
      setCurrentlyUsingDashers((prev) => {
        const item = stamp("currentlyUsing", "currentlyUsingAt");
        if (DEV) {
          try {
            console.debug("[DashBash] insertDasherIntoBucket", {
              destKey,
              dasherId: item.id,
              newLength: (prev?.length || 0) + 1,
            });
          } catch { }
        }
        return [item, ...prev];
      });
    } else if (destKey === "appealed") {
      setAppealedDashers((prev) => {
        const item = stamp("appealed", "appealedAt");
        if (DEV) {
          try {
            console.debug("[DashBash] insertDasherIntoBucket", {
              destKey,
              dasherId: item.id,
              newLength: (prev?.length || 0) + 1,
            });
          } catch { }
        }
        return [item, ...prev];
      });
    } else if (destKey === "applied-pending") {
      setAppliedPendingDashers((prev) => {
        const item = stamp("appliedPending", "appliedPendingAt");
        if (DEV) {
          try {
            console.debug("[DashBash] insertDasherIntoBucket", {
              destKey,
              dasherId: item.id,
              newLength: (prev?.length || 0) + 1,
            });
          } catch { }
        }
        return [item, ...prev];
      });
    } else if (destKey === "reverif") {
      setReverifDashers((prev) => {
        const item = stamp("reverif", "reverifAt");
        if (DEV) {
          try {
            console.debug("[DashBash] insertDasherIntoBucket", {
              destKey,
              dasherId: item.id,
              newLength: (prev?.length || 0) + 1,
            });
          } catch { }
        }
        return [item, ...prev];
      });
    } else if (destKey === "locked") {
      setLockedDashers((prev) => {
        const item = stamp("locked", "lockedAt");
        if (DEV) {
          try {
            console.debug("[DashBash] insertDasherIntoBucket", {
              destKey,
              dasherId: item.id,
              newLength: (prev?.length || 0) + 1,
            });
          } catch { }
        }
        return [item, ...prev];
      });
    } else if (destKey === "deactivated") {
      setDeactivatedDashers((prev) => {
        const item = stamp("deactivated", "deactivatedAt");
        if (DEV) {
          try {
            console.debug("[DashBash] insertDasherIntoBucket", {
              destKey,
              dasherId: item.id,
              newLength: (prev?.length || 0) + 1,
            });
          } catch { }
        }
        return [item, ...prev];
      });
    } else if (destKey === "archived") {
      setArchivedDashers((prev) => {
        const item = {
          ...working,
          archived: true,
          archivedAt: new Date().toISOString(),
        };
        if (DEV) {
          try {
            console.debug("[DashBash] insertDasherIntoBucket", {
              destKey,
              dasherId: item.id,
              newLength: (prev?.length || 0) + 1,
            });
          } catch { }
        }
        return [item, ...prev];
      });
    } else if (DEV) {
      try {
        console.warn(
          "[DashBash] insertDasherIntoBucket: unknown destKey",
          { destKey, dasherId: working?.id },
        );
      } catch { }
    }
  };

  // Defensive: remove a dasher ID from ALL buckets and main categories
  const forceRemoveDasherEverywhere = (dasherId) => {
    try {
      setReadyDashers((prev) =>
        Array.isArray(prev)
          ? prev.filter((d) => !idsMatch(d.id, dasherId))
          : prev,
      );
      setCurrentlyUsingDashers((prev) =>
        Array.isArray(prev)
          ? prev.filter((d) => !idsMatch(d.id, dasherId))
          : prev,
      );
      setAppealedDashers((prev) =>
        Array.isArray(prev)
          ? prev.filter((d) => !idsMatch(d.id, dasherId))
          : prev,
      );
      setAppliedPendingDashers((prev) =>
        Array.isArray(prev)
          ? prev.filter((d) => !idsMatch(d.id, dasherId))
          : prev,
      );
      setReverifDashers((prev) =>
        Array.isArray(prev)
          ? prev.filter((d) => !idsMatch(d.id, dasherId))
          : prev,
      );
      setLockedDashers((prev) =>
        Array.isArray(prev)
          ? prev.filter((d) => !idsMatch(d.id, dasherId))
          : prev,
      );
      setDeactivatedDashers((prev) =>
        Array.isArray(prev)
          ? prev.filter((d) => !idsMatch(d.id, dasherId))
          : prev,
      );
      setArchivedDashers((prev) =>
        Array.isArray(prev)
          ? prev.filter((d) => !idsMatch(d.id, dasherId))
          : prev,
      );
      setDasherCategories((prev) =>
        Array.isArray(prev)
          ? prev.map((cat) => ({
            ...cat,
            dashers: Array.isArray(cat.dashers)
              ? cat.dashers.filter((d) => !idsMatch(d.id, dasherId))
              : cat.dashers,
          }))
          : prev,
      );
    } catch (e) {
      try {
        console.warn("[DashBash] forceRemoveDasherEverywhere failed", e);
      } catch { }
    }
  };

  const moveDasher = (fromKey, toKey, dasherId) => {
    if (!dasherId || !toKey || fromKey === toKey) return;

    const beforeCounts = DEV ? getBucketCounts() : null;
    const location = locateDasher(dasherId);
    if (!location || !location.dasher) {
      console.warn("[DashBash] moveDasher: dasher not found for move", {
        dasherId,
        toKey,
      });
      return;
    }

    const { sourceKey, categoryId, dasher } = location;
    const fromCategoryId =
      sourceKey === "main" ? categoryId : dasher.originalCategory || null;

    // Record undo before move
    const dasherName = dasher.name || dasher.phone || dasher.id;
    const fromLabel = sourceKey === 'main' ? 'Main' : (sourceKey || 'Unknown');
    const toLabel = toKey === 'main' ? 'Main' : (toKey || 'Unknown');
    recordUndo(
      UNDO_TYPES.DASHER_MOVE,
      {
        dasherId,
        fromKey: sourceKey,
        toKey,
      },
      `Moved "${dasherName}" from ${fromLabel} to ${toLabel}`
    );

    removeDasherFromState(location);
    insertDasherIntoBucket(dasher, toKey, fromCategoryId);

    markRecentlyMoved(dasherId);
    const destCategoryName =
      toKey === "main"
        ? getMainDestinationCategoryName(dasher, fromCategoryId)
        : null;
    showMoveToast(toKey, destCategoryName);
    showMoveDebug(sourceKey, toKey);

    if (DEV) {
      console.debug("[DashBash] moveDasher complete", {
        dasherId,
        from: sourceKey,
        categoryId,
        to: toKey,
        insertedInto: destCategoryName,
        counts: { before: beforeCounts, after: getBucketCounts() },
      });
    }

    // Fallback verification disabled (v1.9.4) - was causing console spam and loops
    // The primary move logic above is reliable; fallback retry creates more issues than it solves

    requestPersist();
  };

  const bulkMoveSelectedDashers = (destinationKey) => {
    if (!destinationKey) return;
    const jobs = [];

    // Main (category) dashers
    dasherCategories.forEach((cat) => {
      cat.dashers.forEach((d) => {
        if (selectedItems.dashers.has(d.id)) {
          jobs.push({ from: "main", id: d.id });
        }
      });
    });

    readyDashers.forEach(
      (d) =>
        selectedItems.readyDashers.has(d.id) &&
        jobs.push({ from: "ready", id: d.id }),
    );
    currentlyUsingDashers.forEach(
      (d) =>
        selectedItems.currentlyUsingDashers.has(d.id) &&
        jobs.push({ from: "currently-using", id: d.id }),
    );
    appealedDashers.forEach(
      (d) =>
        selectedItems.appealedDashers.has(d.id) &&
        jobs.push({ from: "appealed", id: d.id }),
    );
    deactivatedDashers.forEach(
      (d) =>
        selectedItems.deactivatedDashers.has(d.id) &&
        jobs.push({ from: "deactivated", id: d.id }),
    );
    lockedDashers.forEach(
      (d) =>
        selectedItems.lockedDashers.has(d.id) &&
        jobs.push({ from: "locked", id: d.id }),
    );
    appliedPendingDashers.forEach(
      (d) =>
        selectedItems.appliedPendingDashers.has(d.id) &&
        jobs.push({ from: "applied-pending", id: d.id }),
    );
    reverifDashers.forEach(
      (d) =>
        selectedItems.reverifDashers?.has(d.id) &&
        jobs.push({ from: "reverif", id: d.id }),
    );
    archivedDashers.forEach(
      (d) =>
        selectedItems.archivedDashers.has(d.id) &&
        jobs.push({ from: "archived", id: d.id }),
    );

    if (jobs.length === 0) return;

    jobs.forEach((job) => {
      if (job.from !== destinationKey) {
        moveDasher(job.from, destinationKey, job.id);
      }
    });

    setTimeout(() => {
      clearAllSelections();
      setIsEditMode(false);
    }, 150);
  };

  const renderMoveButtons = useCallback((currentKey, dasherId) => {
    const order = [
      {
        key: "main",
        icon: Users,
        color: "text-indigo-400",
        title: "Move to Main",
      },
      {
        key: "ready",
        icon: CircleCheck,
        color: "text-green-400",
        title: "Move to Ready",
      },
      {
        key: "currently-using",
        icon: Activity,
        color: "text-blue-400",
        title: "Move to Using",
      },
      {
        key: "appealed",
        icon: CircleCheck,
        color: "text-amber-400",
        title: "Move to Appealed",
      },
      {
        key: "applied-pending",
        icon: Clock,
        color: "text-purple-300",
        title: "Move to Applied Pending",
      },
      {
        key: "reverif",
        icon: ShieldCheck,
        color: "text-emerald-300",
        title: "Move to Reverif",
      },
      {
        key: "locked",
        icon: Lock,
        color: "text-gray-400",
        title: "Move to Locked",
      },
      {
        key: "deactivated",
        icon: UserX,
        color: "text-red-400",
        title: "Move to Deactivated",
      },
      {
        key: "archived",
        icon: Archive,
        color: "text-yellow-400",
        title: "Move to Archived",
      },
    ];
    return React.createElement(
      "div",
      {
        className:
          "flex items-center gap-1 pr-2 border-r border-gray-600",
      },
      order
        .filter((o) => o.key !== currentKey)
        .map((o) =>
          React.createElement(
            "button",
            {
              key: o.key,
              onClick: () => moveDasher(currentKey, o.key, dasherId),
              className: `icon-btn ${o.color} hover:opacity-80`,
              title: o.title,
              "aria-label": o.title,
            },
            React.createElement(o.icon, { size: 14 }),
          ),
        ),
    );
  }, [moveDasher]);

  // Toggle dasher flags (CRIMSON, RED CARD, APPEALED) across all buckets
  function toggleDasherFlag(dasherId, flag) {
    // Top-level buckets first
    const topSetters = [
      ["ready", setReadyDashers],
      ["currently-using", setCurrentlyUsingDashers],
      ["appealed", setAppealedDashers],
      ["applied-pending", setAppliedPendingDashers],
      ["reverif", setReverifDashers],
      ["locked", setLockedDashers],
      ["deactivated", setDeactivatedDashers],
      ["archived", setArchivedDashers],
    ];
    let updated = false;

    topSetters.forEach(([key, setter]) => {
      setter((prev) => {
        let changed = false;
        const next = prev.map((d) => {
          if (d.id === dasherId) {
            changed = true;
            updated = true;
            const val = !d[flag];
            const patch = { [flag]: val };
            // Timestamp semantics (only for specific flags)
            if (flag === "appealed") {
              patch.appealedAt = val ? new Date().toISOString() : null;
            }
            if (flag === "crimson") {
              patch.crimsonAt = val ? new Date().toISOString() : null;
            }
            if (flag === "redCard") {
              patch.redCardAt = val ? new Date().toISOString() : null;
            }
            return { ...d, ...patch };
          }
          return d;
        });
        return changed ? next : prev;
      });
    });

    if (!updated) {
      // Fall back to category (main/custom)
      setDasherCategories((cats) =>
        cats.map((cat) => ({
          ...cat,
          dashers: cat.dashers.map((d) => {
            if (d.id === dasherId) {
              const val = !d[flag];
              const patch = { [flag]: val };
              if (flag === "appealed") {
                patch.appealedAt = val ? new Date().toISOString() : null;
              }
              if (flag === "crimson") {
                patch.crimsonAt = val ? new Date().toISOString() : null;
              }
              if (flag === "redCard") {
                patch.redCardAt = val ? new Date().toISOString() : null;
              }
              return { ...d, ...patch };
            }
            return d;
          }),
        })),
      );
    }
    requestPersist();
  }

  // Bucket timer handlers for consistent timer management
  // [PERF-STAGE3] Wrap in useMemo to stabilize object identity
  const bucketTimerHandlers = useMemo(() => ({
    ready: {
      start: (id) => {
        setReadyDashers((prev) =>
          prev.map((d) =>
            d.id === id
              ? { ...d, lastUsed: new Date().toISOString() }
              : d,
          ),
        );
        requestPersist();
      },
      reset: (id) => {
        setReadyDashers((prev) =>
          prev.map((d) => (d.id === id ? { ...d, lastUsed: null } : d)),
        );
        requestPersist();
      },
    },
    "currently-using": {
      start: (id) => {
        setCurrentlyUsingDashers((prev) =>
          prev.map((d) =>
            d.id === id
              ? { ...d, lastUsed: new Date().toISOString() }
              : d,
          ),
        );
        requestPersist();
      },
      reset: (id) => {
        setCurrentlyUsingDashers((prev) =>
          prev.map((d) => (d.id === id ? { ...d, lastUsed: null } : d)),
        );
        requestPersist();
      },
    },
    appealed: {
      start: (id) => {
        setAppealedDashers((prev) =>
          prev.map((d) =>
            d.id === id
              ? {
                ...d,
                appealedAt: new Date().toISOString(),
                appealed: true,
              }
              : d,
          ),
        );
        requestPersist();
      },
      reset: (id) => {
        setAppealedDashers((prev) =>
          prev.map((d) => (d.id === id ? { ...d, appealedAt: null } : d)),
        );
        requestPersist();
      },
    },
  }), [setReadyDashers, setCurrentlyUsingDashers, setAppealedDashers, requestPersist]); // [PERF-STAGE3]

  // [PERF-STAGE3] Stable handler factories to avoid inline arrow functions
  const handleToggleSelectReady = useCallback((dasherId) => {
    setSelectedItems(prev => {
      const next = new Set(prev.readyDashers);
      next.has(dasherId) ? next.delete(dasherId) : next.add(dasherId);
      return { ...prev, readyDashers: next };
    });
  }, []);

  const handleDeleteReady = useCallback((dasherId) => {
    showConfirm(
      "Delete this dasher?",
      () => {
        setReadyDashers((prev) => prev.filter((d) => d.id !== dasherId));
        requestPersist();
      },
      { title: "Delete Dasher", confirmText: "Delete", cancelText: "Cancel" },
    );
  }, [setReadyDashers, requestPersist, showConfirm]);

  // Expand/Collapse all for Address Book
  // [PR-FIX] Must set explicit false (not {}) since ?? true is default
  // [PR-FIX] Guard against undefined to prevent runtime crash
  const expandAllCategories = () => {
    const allExpanded = {};
    (categories || []).forEach((cat) => {
      allExpanded[cat.id] = false;
    });
    setCollapsedCategories(allExpanded);
    // Auto-save after expanding all
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const collapseAllCategories = () => {
    const allCollapsed = {};
    (categories || []).forEach((cat) => {
      allCollapsed[cat.id] = true;
    });
    setCollapsedCategories(allCollapsed);
    // Auto-save after collapsing all
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  // Expand/Collapse all dashers (keep categories visible, like Store Address Book)
  // [PR-FIX] Must set explicit false (not {}) since ?? true is default
  // [PR-FIX] Guard against undefined to prevent runtime crash
  const expandAllDasherCategories = () => {
    // Expand all categories (make them visible) - explicit false
    const allCategoriesExpanded = {};
    (dasherCategories || []).forEach((cat) => {
      allCategoriesExpanded[cat.id] = false;
    });
    setCollapsedDasherCategories(allCategoriesExpanded);

    // Expand all individual dashers within categories
    // Must explicitly set to false since default is true
    const allDashersExpanded = {};
    (dasherCategories || []).forEach((cat) => {
      if (cat.dashers) {
        cat.dashers.forEach((dasher) => {
          const key = `${cat.id}-${dasher.id}`;
          allDashersExpanded[key] = false;
        });
      }
    });
    setCollapsedDashers(allDashersExpanded);

    // Auto-save after expanding all
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const collapseAllDasherCategories = () => {
    // Keep categories expanded/visible - explicit false (not {})
    const allCategoriesExpanded = {};
    (dasherCategories || []).forEach((cat) => {
      allCategoriesExpanded[cat.id] = false;
    });
    setCollapsedDasherCategories(allCategoriesExpanded);

    // Collapse all individual dashers only
    const allDashersCollapsed = {};
    (dasherCategories || []).forEach((cat) => {
      (cat.dashers || []).forEach((dasher) => {
        const key = `${cat.id}-${dasher.id}`;
        allDashersCollapsed[key] = true;
      });
    });
    setCollapsedDashers(allDashersCollapsed);

    // Auto-save after collapsing all
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  // MAIN bucket: Stage 1/2/3 helpers
  // Stage 1: Fully collapse categories (only top-level headings visible)
  const collapseMainToCategoriesOnly = () => {
    // Collapse every category
    const allCollapsed = {};
    dasherCategories.forEach((cat) => {
      allCollapsed[cat.id] = true;
    });
    setCollapsedDasherCategories(allCollapsed);
    // Also collapse any open dasher rows to ensure compact state
    const allDashersCollapsed = {};
    dasherCategories.forEach((cat) => {
      cat.dashers.forEach((d) => {
        allDashersCollapsed[`${cat.id}-${d.id}`] = true;
      });
    });
    setCollapsedDashers(allDashersCollapsed);
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  // Stage 2 (already provided by collapseAllDasherCategories): categories expanded, all dashers collapsed
  // Stage 3 (already provided by expandAllDasherCategories): categories expanded, all dashers expanded

  // Compute current main stage from state
  const getMainStage = () => {
    // If any category is collapsed -> Stage 1
    const anyCategoryCollapsed = Object.values(
      collapsedDasherCategories || {},
    ).some(Boolean);
    if (anyCategoryCollapsed) return 1;

    // Categories expanded. If any dasher is collapsed -> Stage 2 (unless none exist)
    const anyDasherCollapsed = Object.values(collapsedDashers || {}).some(
      Boolean,
    );
    return anyDasherCollapsed ? 2 : 3;
  };

  // Selection Helper Functions for Edit Mode
  const toggleItemSelection = (type, id) => {
    setSelectedItems((prev) => {
      const newSelected = { ...prev };
      const set = new Set(newSelected[type]);

      if (set.has(id)) {
        set.delete(id);
      } else {
        set.add(id);
      }

      newSelected[type] = set;
      return newSelected;
    });
  };

  const toggleCategorySelection = (type, categoryId, items) => {
    setSelectedItems((prev) => {
      const newSelected = { ...prev };
      const itemSet = new Set(newSelected[type]);
      const categorySet = new Set(newSelected[type + "Categories"]);

      // Check if all items in category are selected
      const allSelected = items.every((item) => itemSet.has(item));

      if (allSelected) {
        // Deselect all items in category
        items.forEach((item) => itemSet.delete(item));
        categorySet.delete(categoryId);
      } else {
        // Select all items in category
        items.forEach((item) => itemSet.add(item));
        categorySet.add(categoryId);
      }

      newSelected[type] = itemSet;
      newSelected[type + "Categories"] = categorySet;
      return newSelected;
    });
  };

  const clearAllSelections = () => {
    setSelectedItems({
      dashers: new Set(),
      dasherCategories: new Set(),
      notes: new Set(),
      noteCategories: new Set(),
      stores: new Set(),
      storeCategories: new Set(),
      messages: new Set(),
      archivedDashers: new Set(),
      readyDashers: new Set(),
      currentlyUsingDashers: new Set(),
      appealedDashers: new Set(),
      deactivatedDashers: new Set(),
      lockedDashers: new Set(),
      appliedPendingDashers: new Set(),
      reverifDashers: new Set(),
    });
  };

  const getSelectionCount = () => {
    let count = 0;
    Object.values(selectedItems).forEach((set) => {
      count += set.size;
    });
    return count;
  };

  // Archived Dasher Collapse Functions
  // [PERSISTENCE-FIX v1.9.8] Toggle must handle ?? true default
  // [PR-FIX] Compute from prev inside setState to avoid stale closure
  const toggleArchivedDasherCollapse = (dasherId) => {
    setCollapsedArchivedDashers((prev) => {
      const isCurrentlyCollapsed = prev[dasherId] ?? true;
      return {
        ...prev,
        [dasherId]: !isCurrentlyCollapsed,
      };
    });

    // Auto-save
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  // [PERSISTENCE-FIX v1.9.8] Must set explicit false, not {} (since ?? true is default)
  // [PR-FIX] Guard against undefined to prevent runtime crash
  const expandAllArchivedDashers = () => {
    const allExpanded = {};
    (archivedDashers || []).forEach((dasher) => {
      allExpanded[dasher.id] = false;
    });
    setCollapsedArchivedDashers(allExpanded);
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const collapseAllArchivedDashers = () => {
    const allCollapsed = {};
    (archivedDashers || []).forEach((dasher) => {
      allCollapsed[dasher.id] = true;
    });
    setCollapsedArchivedDashers(allCollapsed);
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  // [PERSISTENCE-FIX v1.9.8] Default collapsed
  const isArchivedDasherCollapsed = (dasherId) => {
    return collapsedArchivedDashers[dasherId] ?? true;
  };

  // Expand/Collapse all for Dashers
  const expandAllDashers = () => {
    const allExpanded = {};
    dasherCategories.forEach((cat) => {
      cat.dashers.forEach((dasher) => {
        const key = `${cat.id}-${dasher.id}`;
        allExpanded[key] = false;
      });
    });
    const topLevelBuckets = [
      ensureArray(readyDashers),
      ensureArray(currentlyUsingDashers),
      ensureArray(appealedDashers),
      ensureArray(appliedPendingDashers),
      ensureArray(reverifDashers),
      ensureArray(lockedDashers),
      ensureArray(deactivatedDashers),
      ensureArray(archivedDashers),
    ];
    topLevelBuckets.forEach((list) => {
      list.forEach((dasher) => {
        allExpanded[dasher.id] = false;
      });
    });
    setCollapsedDashers(allExpanded);
    // Auto-save after expanding all
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const collapseAllDashers = () => {
    const allCollapsed = {};
    dasherCategories.forEach((cat) => {
      cat.dashers.forEach((dasher) => {
        const key = `${cat.id}-${dasher.id}`;
        allCollapsed[key] = true;
      });
    });
    const topLevelBuckets = [
      ensureArray(readyDashers),
      ensureArray(currentlyUsingDashers),
      ensureArray(appealedDashers),
      ensureArray(appliedPendingDashers),
      ensureArray(reverifDashers),
      ensureArray(lockedDashers),
      ensureArray(deactivatedDashers),
      ensureArray(archivedDashers),
    ];
    topLevelBuckets.forEach((list) => {
      list.forEach((dasher) => {
        allCollapsed[dasher.id] = true;
      });
    });
    setCollapsedDashers(allCollapsed);
    // Auto-save after collapsing all
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  // Expand/Collapse all dashers in a specific category
  const expandAllDashersInCategory = (categoryId) => {
    const category = dasherCategories.find((c) => c.id === categoryId);
    if (category) {
      const updatedCollapsed = { ...collapsedDashers };
      category.dashers.forEach((dasher) => {
        const key = `${categoryId}-${dasher.id}`;
        updatedCollapsed[key] = false;
      });
      setCollapsedDashers(updatedCollapsed);
      // Auto-save handled by useEffect
    }
  };

  const collapseAllDashersInCategory = (categoryId) => {
    const category = dasherCategories.find((c) => c.id === categoryId);
    if (category) {
      const updatedCollapsed = { ...collapsedDashers };
      category.dashers.forEach((dasher) => {
        const key = `${categoryId}-${dasher.id}`;
        updatedCollapsed[key] = true;
      });
      setCollapsedDashers(updatedCollapsed);
      // Auto-save handled by useEffect
    }
  };

  // NEW: Generic bucket expand/collapse helpers
  // Normalize a list into a collapsed map { [id]: true }
  const toCollapsedMap = (list = []) =>
    list.reduce((m, d) => {
      if (d && d.id !== undefined && d.id !== null) m[d.id] = true;
      return m;
    }, {});

  // [PR-FIX] Normalize a list into an expanded map { [id]: false }
  // With ?? true default, {} means collapsed, so we need explicit false
  const toExpandedMap = (list = []) =>
    list.reduce((m, d) => {
      if (d && d.id !== undefined && d.id !== null) m[d.id] = false;
      return m;
    }, {});

  // Expand/collapse an entire bucket in one click
  // [PR-FIX] Must set explicit false values (not {}) since ?? true is default
  const expandBucket = (key) => {
    switch (key) {
      case "main": // Main "Dashers" (categories)
        // Stage 3 for main: fully expand categories and dashers
        expandAllDasherCategories();
        break;
      case "ready":
        setCollapsedReadyDashers(toExpandedMap(readyDashers));
        break;
      case "currently-using":
        setCollapsedCurrentlyUsingDashers(toExpandedMap(currentlyUsingDashers));
        break;
      case "appealed":
        setCollapsedAppealedDashers(toExpandedMap(appealedDashers));
        break;
      case "applied-pending":
        setCollapsedAppliedPendingDashers(toExpandedMap(appliedPendingDashers));
        break;
      case "reverif":
        setCollapsedReverifDashers(toExpandedMap(reverifDashers));
        break;
      case "locked":
        setCollapsedLockedDashers(toExpandedMap(lockedDashers));
        break;
      case "deactivated":
        setCollapsedDeactivatedDashers(toExpandedMap(deactivatedDashers));
        break;
      case "archived":
        setCollapsedArchivedDashers(toExpandedMap(archivedDashers));
        break;
    }
    requestPersist();
  };

  const collapseBucket = (key) => {
    switch (key) {
      case "main":
        // Stage 2 for main: collapse all dashers but keep categories expanded
        collapseAllDasherCategories();
        break;
      case "ready":
        setCollapsedReadyDashers(toCollapsedMap(readyDashers));
        break;
      case "currently-using":
        setCollapsedCurrentlyUsingDashers(
          toCollapsedMap(currentlyUsingDashers),
        );
        break;
      case "appealed":
        setCollapsedAppealedDashers(toCollapsedMap(appealedDashers));
        break;
      case "applied-pending":
        setCollapsedAppliedPendingDashers(
          toCollapsedMap(appliedPendingDashers),
        );
        break;
      case "reverif":
        setCollapsedReverifDashers(toCollapsedMap(reverifDashers));
        break;
      case "locked":
        setCollapsedLockedDashers(toCollapsedMap(lockedDashers));
        break;
      case "deactivated":
        setCollapsedDeactivatedDashers(
          toCollapsedMap(deactivatedDashers),
        );
        break;
      case "archived":
        setCollapsedArchivedDashers(toCollapsedMap(archivedDashers));
        break;
    }
    requestPersist();
  };

  // Row-level toggle that updates the right map for the active bucket
  // [PERF-STAGE3] Wrap in useCallback for stable identity
  // [PERSISTENCE-FIX v1.9.8] Toggle must handle ?? true default
  const toggleBucketRowCollapsed = useCallback((bucketKey, dasherId, next) => {
    const updater = (prev) => {
      // Use ?? true default since collapsed is now the default state
      const v = next !== undefined ? !!next : !(prev[dasherId] ?? true);
      return { ...prev, [dasherId]: v };
    };
    switch (bucketKey) {
      case "main": // main categories use per-category map; leave as-is
        setCollapsedDashers(updater); // if you use per-category+id keys, adapt here
        break;
      case "ready":
        setCollapsedReadyDashers(updater);
        break;
      case "currently-using":
        setCollapsedCurrentlyUsingDashers(updater);
        break;
      case "appealed":
        setCollapsedAppealedDashers(updater);
        break;
      case "applied-pending":
        setCollapsedAppliedPendingDashers(updater);
        break;
      case "reverif":
        setCollapsedReverifDashers(updater);
        break;
      case "locked":
        setCollapsedLockedDashers(updater);
        break;
      case "deactivated":
        setCollapsedDeactivatedDashers(updater);
        break;
      case "archived":
        setCollapsedArchivedDashers(updater);
        break;
    }
    requestPersist();
  }, [
    setCollapsedDashers, setCollapsedReadyDashers, setCollapsedCurrentlyUsingDashers,
    setCollapsedAppealedDashers, setCollapsedAppliedPendingDashers, setCollapsedReverifDashers,
    setCollapsedLockedDashers, setCollapsedDeactivatedDashers, setCollapsedArchivedDashers,
    requestPersist
  ]); // [PERF-STAGE3]

  // Reusable chevrons component for bucket headers
  const BucketChevrons = ({
    bucketKey,
    bucketLabel,
    isVisible = true,
  }) => {
    const label = bucketLabel || bucketKey;
    const hidden = !isVisible;
    const isMain = bucketKey === "main";
    const mainStage = isMain ? getMainStage() : null;
    // For main three-stage: Up button steps 3->2->1, Down button steps 1->2->3
    const onMainCollapse = () => {
      const stage = getMainStage();
      if (stage === 3) {
        // to stage 2
        collapseAllDasherCategories();
      } else if (stage === 2) {
        // to stage 1
        collapseMainToCategoriesOnly();
      } else {
        // already at stage 1, keep it
        collapseMainToCategoriesOnly();
      }
    };
    const onMainExpand = () => {
      const stage = getMainStage();
      if (stage === 1) {
        // to stage 2
        collapseAllDasherCategories();
      } else if (stage === 2) {
        // to stage 3
        expandAllDasherCategories();
      } else {
        // already at stage 3
        expandAllDasherCategories();
      }
    };
    return (
      <div
        className="flex items-center gap-1 ml-2"
        onClick={(event) => event.stopPropagation()}
        aria-hidden={hidden ? "true" : "false"}
        style={{ opacity: hidden ? 0.4 : 1 }}
      >
        <button
          type="button"
          className="text-indigo-400 hover:text-indigo-300 p-1 hover:bg-gray-600/50 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 disabled:opacity-30 disabled:cursor-default"
          title={
            isMain
              ? `Step collapse: ${mainStage === 3 ? "to headers" : mainStage === 2 ? "to categories only" : "stay at categories only"}`
              : `Collapse all ${label || "dashers"}`
          }
          aria-label={
            isMain
              ? `Collapse ${label || "dashers"} stage`
              : `Collapse all ${label || "dashers"}`
          }
          onClick={() =>
            isMain ? onMainCollapse() : collapseBucket(bucketKey)
          }
          disabled={hidden}
        >
          <ChevronUp size={16} />
        </button>
        <button
          type="button"
          className="text-indigo-400 hover:text-indigo-300 p-1 hover:bg-gray-600/50 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 disabled:opacity-30 disabled:cursor-default"
          title={
            isMain
              ? `Step expand: ${mainStage === 1 ? "to headers+cards (collapsed)" : mainStage === 2 ? "to full cards" : "stay at full cards"}`
              : `Expand all ${label || "dashers"}`
          }
          aria-label={
            isMain
              ? `Expand ${label || "dashers"} stage`
              : `Expand all ${label || "dashers"}`
          }
          onClick={() =>
            isMain ? onMainExpand() : expandBucket(bucketKey)
          }
          disabled={hidden}
        >
          <ChevronDown size={16} />
        </button>
      </div>
    );
  };

  // PHASE 6: Helper function to resolve time status based on bucket type
  function resolveDasherTimeStatus(dasher, sourceKey) {
    // Appealed bucket uses appealedAt timestamp
    if (sourceKey === "appealed" && dasher.appealedAt) {
      const diffMs = Date.now() - new Date(dasher.appealedAt).getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      const label =
        days > 0 ? `Appealed ${days}d ago` : `Appealed ${hours}h ago`;
      return {
        label,
        active: diffMs < 24 * 3600 * 1000,
        canReset: false,
      };
    }

    // Other buckets use lastUsed timestamp
    if (dasher.lastUsed) {
      const diffMs = Date.now() - new Date(dasher.lastUsed).getTime();
      const active = diffMs < 24 * 3600 * 1000;
      return {
        label: active ? "ACTIVE<24h" : "Idle",
        active,
        canReset: true,
      };
    }

    return { label: "Idle", active: false, canReset: false };
  }

  // PHASE 6: Unified grid row renderer (JSX version with corrected pill toggles)
  function renderDasherGridRow({
    dasher,
    sourceKey,
    isCollapsed,
    isEditMode,
    isSelected,
    onToggleSelection,
    onToggleCollapse,
    moveButtons,
    actionButtons,
    parseBalanceValue,
    onStartTimer,
    onResetTimer,
    showPills = true,
  }) {
    if (!dasher) return null;
    const timeStatus = resolveDasherTimeStatus(dasher, sourceKey);
    const balanceNum = parseBalanceValue(dasher.balance);

    const isRecentlyMoved =
      recentlyMoved instanceof Set && recentlyMoved.has(dasher.id);
    const rowClassName = [
      "dasher-row",
      isRecentlyMoved
        ? "ring-2 ring-amber-400/80 rounded-md animate-pulse"
        : "",
    ]
      .join(" ")
      .trim();

    return (
      <div className={rowClassName} role="group" data-dasher-id={dasher.id}>
        {/* Column 1: Expand/Collapse */}
        <div className="dasher-cell dasher-cell-chevron">
          <button
            className="icon-btn"
            aria-label={
              isCollapsed
                ? "Expand dasher details"
                : "Collapse dasher details"
            }
            type="button"
            onClick={onToggleCollapse}
          >
            {isCollapsed ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronUp size={16} />
            )}
          </button>
        </div>

        {/* Column 2: Selection / Drag */}
        <div className="dasher-cell dasher-cell-select" role="cell">
          {isEditMode ? (
            <input
              type="checkbox"
              checked={!!isSelected}
              onChange={onToggleSelection}
              aria-label="Select dasher for bulk operations"
              className="cursor-pointer"
            />
          ) : (
            <GripVertical size={16} className="text-gray-500" />
          )}
        </div>

        {/* Column 3: Identity */}
        <div className="dasher-cell dasher-cell-identity" role="cell">
          <div className="text-sm font-medium">
            {dasher.name || "No name"}
          </div>
          <div className="text-xs text-gray-400">
            {dasher.email || "No email"}
          </div>
        </div>

        {/* Column 4: Pills - CORRECTED: removed sourceKey parameter */}
        {showPills && (
          <div className="dasher-cell dasher-cell-pills" role="cell">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => toggleDasherFlag(dasher.id, "crimson")}
                className={`pill ${dasher.crimson ? "active" : ""}`}
                aria-label={
                  dasher.crimson
                    ? "Remove CRIMSON flag"
                    : "Add CRIMSON flag"
                }
              >
                C
              </button>
              <button
                type="button"
                onClick={() => toggleDasherFlag(dasher.id, "redCard")}
                className={`pill ${dasher.redCard ? "active" : ""}`}
                aria-label={
                  dasher.redCard
                    ? "Remove RED CARD flag"
                    : "Add RED CARD flag"
                }
              >
                RC
              </button>
              <button
                type="button"
                onClick={() => toggleDasherFlag(dasher.id, "appealed")}
                className={`pill ${dasher.appealed ? "active" : ""}`}
                aria-label={
                  dasher.appealed
                    ? "Remove APPEALED flag"
                    : "Add APPEALED flag"
                }
              >
                AP
              </button>
            </div>
          </div>
        )}

        {/* Column 5: Balance */}
        <div className="dasher-cell dasher-cell-balance" role="cell">
          <span
            className={
              balanceNum === 0 ? "text-green-300" : "text-red-400"
            }
          >
            ${balanceNum.toFixed(2)}
          </span>
        </div>

        {/* Column 6: Timer */}
        <div
          className="dasher-cell dasher-cell-timer flex items-center gap-2"
          role="cell"
        >
          <span
            className={
              timeStatus.active ? "text-green-300" : "text-gray-400"
            }
          >
            {timeStatus.label}
          </span>
          {timeStatus.canReset && timeStatus.active && onResetTimer && (
            <button
              type="button"
              onClick={onResetTimer}
              className="icon-btn text-orange-400 hover:text-orange-300"
              aria-label="Reset last used timer"
              title="Reset timer"
            >
              <TimerOff size={14} />
            </button>
          )}
          {!timeStatus.active && onStartTimer && (
            <button
              type="button"
              onClick={onStartTimer}
              className="icon-btn text-purple-400 hover:text-purple-300"
              aria-label="Start 24 hour timer"
              title="Start 24h timer"
            >
              <Timer size={14} />
            </button>
          )}
        </div>

        {/* Column 7: Movement */}
        <div className="dasher-cell dasher-cell-movement" role="cell">
          {moveButtons}
        </div>

        {/* Column 8: Actions */}
        <div className="dasher-cell dasher-cell-actions" role="cell">
          {actionButtons}
        </div>
      </div>
    );
  }

  // Expand/Collapse all stores in a specific category
  const expandAllStoresInCategory = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    if (category) {
      const updatedCollapsed = { ...collapsedStores };
      category.stores.forEach((store) => {
        const key = `${categoryId}-${store.id}`;
        updatedCollapsed[key] = false;
      });
      setCollapsedStores(updatedCollapsed);
      requestPersist();
    }
  };

  const collapseAllStoresInCategory = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    if (category) {
      const updatedCollapsed = { ...collapsedStores };
      category.stores.forEach((store) => {
        const key = `${categoryId}-${store.id}`;
        updatedCollapsed[key] = true;
      });
      setCollapsedStores(updatedCollapsed);
      requestPersist();
    }
  };

  const handleDasherDragStart = (e, categoryId, dasherIndex) => {
    setDraggedDasher({ categoryId, dasherIndex });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDasherDragEnd = () => {
    setDraggedDasher({ categoryId: "", dasherIndex: -1 });
    // Force a small delay to ensure state is fully reset
    setTimeout(() => {
      setDraggedDasher({ categoryId: "", dasherIndex: -1 });
    }, 50);
  };

  const handleDasherDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDasherDrop = (e, targetCategoryId, targetDasherIndex) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedDasher.categoryId || draggedDasher.dasherIndex === -1) {
      setDraggedDasher({ categoryId: "", dasherIndex: -1 });
      return;
    }

    const sourceCategoryId = draggedDasher.categoryId;
    const sourceDasherIndex = draggedDasher.dasherIndex;

    // Move dasher between or within categories
    const sourceCategory = dasherCategories.find(
      (cat) => cat.id === sourceCategoryId,
    );
    const targetCategory = dasherCategories.find(
      (cat) => cat.id === targetCategoryId,
    );

    if (!sourceCategory || !targetCategory) {
      setDraggedDasher({ categoryId: "", dasherIndex: -1 });
      return;
    }

    // Safety check: ensure dashers array exists
    if (
      !Array.isArray(sourceCategory.dashers) ||
      !Array.isArray(targetCategory.dashers)
    ) {
      setDraggedDasher({ categoryId: "", dasherIndex: -1 });
      return;
    }

    const dasherToMove = sourceCategory.dashers[sourceDasherIndex];
    if (!dasherToMove) {
      setDraggedDasher({ categoryId: "", dasherIndex: -1 });
      return;
    }

    if (sourceCategoryId === targetCategoryId) {
      // Reordering within the same category
      if (sourceDasherIndex !== targetDasherIndex) {
        const newDashers = [...sourceCategory.dashers];
        newDashers.splice(sourceDasherIndex, 1);
        newDashers.splice(targetDasherIndex, 0, dasherToMove);

        setDasherCategories(
          dasherCategories.map((cat) =>
            cat.id === targetCategoryId
              ? { ...cat, dashers: newDashers }
              : cat,
          ),
        );

        // Auto-save
        setTimeout(() => {
          saveAllToLocalStorage();
        }, 100);
      }
    } else {
      // Moving between categories
      setDasherCategories(
        dasherCategories.map((cat) => {
          if (cat.id === sourceCategoryId) {
            // Remove from source
            return {
              ...cat,
              dashers: cat.dashers.filter(
                (_, idx) => idx !== sourceDasherIndex,
              ),
            };
          } else if (cat.id === targetCategoryId) {
            // Add to target at specific position
            const newDashers = [...cat.dashers];
            newDashers.splice(targetDasherIndex, 0, dasherToMove);
            return { ...cat, dashers: newDashers };
          }
          return cat;
        }),
      );

      // Auto-save
      setTimeout(() => {
        saveAllToLocalStorage();
      }, 100);
    }

    setDraggedDasher({ categoryId: "", dasherIndex: -1 });
  };

  const targetAmount = parseFloat(target) || 0;

  // [PERF-STAGE7] periodic performance summary logger
  // IMPORTANT: This hook must be BEFORE any conditional returns to avoid React Hooks violations
  useEffect(() => {
    const interval = setInterval(() => {
      const measures = performance.getEntriesByType('measure');
      const recent = measures.slice(-5);
      if (recent.length > 0) {
        console.table(recent.map(m => ({
          name: m.name,
          duration: m.duration.toFixed(1) + ' ms'
        })));
      }
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // [FIX] Set all renderReady flags to true after import completes
  const wasImportingRef = useRef(false);
  useEffect(() => {
    // Only set renderReady flags when transitioning from importing (true) to not importing (false)
    if (wasImportingRef.current && !isImporting) {
      // Small delay to ensure state updates have propagated
      const timer = setTimeout(() => {
        setDashersRenderReady(true);
        setReadyRenderReady(true);
        setUsingRenderReady(true);
        setAppealedRenderReady(true);
        setAppliedRenderReady(true);
        setReverifRenderReady(true);
        setLockedRenderReady(true);
        setDeactivatedRenderReady(true);
        setArchivedRenderReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }
    // Track previous isImporting state
    wasImportingRef.current = isImporting;
  }, [isImporting]);

  // Render gate (v1.9.5): Show loading overlay during import to prevent DOM reconciliation
  if (isImporting) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm z-[9999]">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            <span className="text-xl text-gray-200">Importing data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {/* Copy Notification */}
      {copyNotification && (
        <div
          className="fixed top-4 right-4 z-50 bg-green-900/90 border border-green-600/50 text-green-100 px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm animate-pulse"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {copyNotification}
        </div>
      )}

      {/* Undo Notification Toast */}
      {undoNotification && (
        <div className="fixed top-4 right-4 z-50 bg-yellow-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-md">
          <RotateCcw size={18} />
          <span className="flex-1 text-sm font-medium">
            {undoNotification.message}
          </span>
          <button
            onClick={() => performUndo(undoNotification.undoId)}
            className="bg-yellow-700 hover:bg-yellow-800 px-3 py-1 rounded text-sm font-semibold transition-colors"
            title="Undo this action"
          >
            Undo
          </button>
          <button
            onClick={() => dismissUndo(undoNotification.undoId)}
            className="text-yellow-200 hover:text-white transition-colors"
            title="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* [FIX-B] Custom Confirm Modal */}
      {confirmModal.isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && handleCancelAction()}
        >
          <div
            className="bg-gray-800 border border-gray-600 rounded-xl p-6 shadow-2xl max-w-md w-full mx-4"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
          >
            <h3 id="confirm-title" className="text-lg font-semibold text-white mb-3">
              {confirmModal.title}
            </h3>
            <p id="confirm-message" className="text-gray-300 mb-6">
              {confirmModal.message}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelAction}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors"
              >
                {confirmModal.cancelText}
              </button>
              <button
                onClick={handleConfirmAction}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium transition-colors"
                autoFocus
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Notification - Beautiful Toast (supports subtle warning variant) */}
      {saveNotification && (
        <div
          className="fixed top-20 right-6 z-50 w-max max-w-[340px] transform transition-all duration-300 ease-out drop-shadow-xl"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {(() => {
            const isWarning = /^\s*!warn!\s*/i.test(saveNotification);
            const message = saveNotification
              .replace(/^\s*!warn!\s*/i, "")
              .replace(/^[^A-Za-z]+\s*/, "");
            return (
              <div
                className={`${isWarning ? "bg-amber-900/95 border-amber-700/80 text-amber-100" : "bg-gray-900/95 border-gray-700/80 text-gray-100"} border rounded-xl px-4 py-3 text-sm flex items-center gap-3 backdrop-blur-sm`}
              >
                {isWarning ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-amber-300"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-emerald-400"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
                <p className="leading-snug">{message}</p>
              </div>
            );
          })()}
        </div>
      )}

      {/* Import Notification */}
      {importNotification && (
        <div
          className="fixed top-28 right-4 z-50 bg-purple-900/90 border border-purple-600/50 text-purple-100 px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm animate-pulse"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {importNotification}
        </div>
      )}

      {DEV && moveDebug && (
        <div className="fixed bottom-3 left-3 z-50 px-3 py-1.5 rounded-md bg-slate-900/85 border border-slate-700 text-xs text-amber-300 shadow-lg">
          <span className="font-mono whitespace-nowrap">
            move: {moveDebug.from} → {moveDebug.to}
          </span>
        </div>
      )}

      <div className="max-w-[1600px] xl:max-w-[1720px] mx-auto">
        {/* Gradient Hero Header - v2 */}
        <header
          className="app-hero header-container"
          role="banner"
          aria-label="Dash Bash Utility header"
        >
          <div className="hero-inner">
            <h1 className="hero-title animated-gradient-text">
              Dash Bash Utility
            </h1>
            <div className="hero-meta">
              <span className="badge metadata-badge">
                {currentTime.toLocaleDateString([], {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
                &nbsp;•&nbsp;
                {currentTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span
                className="badge metadata-badge"
                aria-label="Application version"
              >
                v{APP_VERSION}
              </span>
              <span
                className="badge metadata-badge"
                aria-label="Schema version"
              >
                schema 4
              </span>
            </div>
          </div>
        </header>

        <div className="space-y-4">
          {/* Target Calculator Section */}
          <CalculatorSection><div className="bg-gray-800 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700/50 transition-colors"
              aria-expanded={isCalculatorOpen ? "true" : "false"}
              aria-label="Toggle target calculator section"
            >
              <div className="flex items-center gap-3">
                <Calculator size={20} className="text-blue-400" />
                <span className="text-lg font-medium">
                  Target Calculator
                </span>
              </div>
              {isCalculatorOpen ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>

            {isCalculatorOpen && (
              <div className="border-t border-gray-700 p-4">
                {/* Target Amount Selector */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Target Amount ($)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => handleTargetPresetChange("99")}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${targetPreset === "99"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                    >
                      $99
                    </button>
                    <button
                      onClick={() => handleTargetPresetChange("120")}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${targetPreset === "120"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                    >
                      $120
                    </button>
                    <button
                      onClick={() => handleTargetPresetChange("custom")}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${targetPreset === "custom"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                    >
                      <Edit2 size={14} />
                      Custom
                    </button>
                  </div>

                  {/* Custom Target Input */}
                  {isEditingTarget && (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        value={customTarget}
                        onChange={(e) => setCustomTarget(e.target.value)}
                        onKeyPress={handleTargetKeyPress}
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-base font-mono focus:outline-none focus:ring-2 focus:ring-gray-400"
                        placeholder="Enter custom amount"
                        autoFocus
                      />
                      <button
                        onClick={handleCustomTargetSave}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-1"
                      >
                        Set
                      </button>
                    </div>
                  )}

                  {/* Current Target Display */}
                  {!isEditingTarget && targetPreset === "custom" && (
                    <div className="text-sm text-gray-400 mt-1">
                      Current: ${target}
                    </div>
                  )}
                </div>

                {/* Price Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Add Product Price ($){" "}
                    <span className="text-gray-400 text-xs">
                      (Enter to add quickly)
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      ref={priceInputRef}
                      type="number"
                      step="0.01"
                      value={currentPrice}
                      onChange={(e) => setCurrentPrice(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-base font-mono focus:outline-none focus:ring-2 focus:ring-gray-400"
                      placeholder="2.75"
                    />
                    <button
                      onClick={addPrice}
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Add
                    </button>
                  </div>
                </div>

                {/* Results */}
                {prices.length > 0 &&
                  (() => {
                    const allOptions = prices
                      .map((price, index) => {
                        const calc = calculateQuantities(
                          price,
                          targetAmount,
                        );
                        const bestOption = findBestOption(
                          calc.validOptions,
                        );
                        return {
                          index,
                          price,
                          bestOption,
                          validOptions: calc.validOptions,
                        };
                      })
                      .filter((item) => item.bestOption);

                    const globalBest = allOptions.reduce(
                      (best, current) =>
                        current.bestOption.difference <
                          best.bestOption.difference
                          ? current
                          : best,
                      allOptions[0],
                    );

                    return (
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-sm font-medium text-gray-400">
                            Results ({prices.length} item
                            {prices.length !== 1 ? "s" : ""})
                          </h3>
                          <button
                            onClick={clearAll}
                            className="text-red-400 hover:text-red-300 text-xs px-3 py-1 rounded border border-red-600/30 hover:border-red-500/50 transition-colors"
                          >
                            Clear All
                          </button>
                        </div>

                        <div className="space-y-2">
                          {allOptions.map(
                            ({ index, price, bestOption }) => {
                              const isGlobalBest =
                                globalBest &&
                                bestOption.difference ===
                                globalBest.bestOption.difference;
                              const diffRatio =
                                targetAmount > 0
                                  ? Math.min(
                                    bestOption.difference /
                                    targetAmount,
                                    0.8,
                                  )
                                  : 0;

                              let bgColor = "bg-gray-800";
                              let borderColor = "border-transparent";
                              let underColor = "text-gray-400";

                              if (isGlobalBest) {
                                bgColor = "bg-green-900/40";
                                borderColor = "border-green-500/50";
                                underColor = "text-green-400";
                              } else if (diffRatio < 0.05) {
                                bgColor = "bg-lime-900/30";
                                borderColor = "border-lime-600/40";
                                underColor = "text-lime-400";
                              } else if (diffRatio < 0.15) {
                                bgColor = "bg-yellow-900/30";
                                borderColor = "border-yellow-600/40";
                                underColor = "text-yellow-400";
                              } else if (diffRatio < 0.3) {
                                bgColor = "bg-amber-900/30";
                                borderColor = "border-amber-600/40";
                                underColor = "text-amber-400";
                              } else if (diffRatio < 0.5) {
                                bgColor = "bg-orange-900/30";
                                borderColor = "border-orange-600/40";
                                underColor = "text-orange-400";
                              } else {
                                bgColor = "bg-red-900/30";
                                borderColor = "border-red-600/40";
                                underColor = "text-red-400";
                              }

                              return (
                                <div
                                  key={index}
                                  className={`${bgColor} border ${borderColor} rounded-lg p-3 flex justify-between items-center transition-colors`}
                                >
                                  <div className="flex-1">
                                    <span className="font-medium text-base tracking-tight">
                                      ${price.toFixed(2)} per item
                                    </span>
                                  </div>
                                  <div className="flex-1 text-right mr-3">
                                    <div className="font-semibold text-base leading-tight">
                                      {bestOption.quantity} items
                                    </div>
                                    <div className="text-xs text-gray-300 leading-tight">
                                      ${bestOption.total.toFixed(2)} •{" "}
                                      <span
                                        className={`font-medium ${underColor}`}
                                      >
                                        -$
                                        {bestOption.difference.toFixed(2)}
                                      </span>
                                      {isGlobalBest && (
                                        <span className="text-green-400 ml-1">
                                          ✓
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <button
                                      onClick={() => removePrice(index)}
                                      className="text-gray-500 hover:text-red-400 p-1 transition-colors"
                                      aria-label={`Remove price $${price}`}
                                      title={`Remove price $${price}`}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              );
                            },
                          )}

                          {prices.map((price, index) => {
                            const calc = calculateQuantities(
                              price,
                              targetAmount,
                            );
                            if (calc.validOptions.length > 0) return null;

                            return (
                              <div
                                key={`expensive-${index}`}
                                className="bg-red-900/20 border border-red-600/30 rounded-lg p-3 flex justify-between items-center"
                              >
                                <span className="font-medium text-base">
                                  ${price.toFixed(2)} per item
                                </span>
                                <div className="flex items-center gap-3">
                                  <span className="text-red-400 text-xs">
                                    Too expensive
                                  </span>
                                  <button
                                    onClick={() => removePrice(index)}
                                    className="text-red-400 hover:text-red-300 p-1"
                                    aria-label={`Remove expensive price $${price}`}
                                    title={`Remove price $${price}`}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                {prices.length === 0 && (
                  <div className="text-center text-gray-400 py-6">
                    <div className="text-sm">
                      Add product prices to see calculations
                    </div>
                    <div className="text-xs mt-1">
                      Focus is on the price input - just start typing!
                    </div>
                  </div>
                )}
              </div>
            )}
          </div></CalculatorSection>

          {/* Quick Messages Section */}
          <MessagesSection><div className="bg-gray-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setIsMessagesOpen(!isMessagesOpen)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700/50 transition-colors"
              aria-expanded={isMessagesOpen ? "true" : "false"}
              aria-label="Toggle quick messages section"
            >
              <div className="flex items-center gap-3">
                <MessageSquare size={20} className="text-green-400" />
                <span className="text-lg font-medium">
                  Quick Copy Messages ({messages.length})
                </span>
              </div>
              {isMessagesOpen ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>

            {isMessagesOpen && (
              <div className="border-t border-gray-700 p-4 space-y-2">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`bg-gray-700/60 hover:bg-gray-700 rounded-lg p-2 transition-colors border border-gray-600/30 ${draggedIndex === index
                      ? "opacity-50 bg-gray-600"
                      : ""
                      }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    <div className="flex items-center gap-2">
                      <button className="text-gray-500 hover:text-gray-400 cursor-move p-1" aria-label="Drag to reorder message" type="button">
                        <GripVertical size={18} />
                      </button>

                      <div className="flex-1 min-w-0">
                        {editingIndex === index ? (
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-base text-white resize-y min-h-[3rem] focus:outline-none focus:ring-1 focus:ring-gray-400"
                            rows={Math.max(
                              1,
                              editText.split("\n").length,
                            )}
                            autoFocus
                            aria-label="Edit message text"
                          />
                        ) : (
                          <div
                            className="text-base text-gray-100 leading-relaxed whitespace-pre-wrap break-words cursor-pointer hover:text-blue-300 transition-colors"
                            onClick={() => copyToClipboard(message)}
                            title="Click to copy"
                          >
                            {message}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        {editingIndex === index ? (
                          <React.Fragment>
                            <button
                              onClick={saveEdit}
                              className="text-green-400 hover:text-green-300 p-1"
                              title="Done"
                            >
                              ✓
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="text-gray-400 hover:text-gray-300 p-1"
                              title="Cancel"
                            >
                              <X size={12} />
                            </button>
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            <button
                              onClick={() => startEdit(index)}
                              className="text-yellow-400 hover:text-yellow-300 p-1"
                              title="Edit"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => deleteMessage(index)}
                              className="text-red-400 hover:text-red-300 p-1"
                              title="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          </React.Fragment>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isAddingNew ? (
                  <div className="bg-gray-700/60 rounded-lg p-2 border border-gray-600/30 border-dashed">
                    <div className="flex items-start gap-2">
                      <div className="w-4" />
                      <textarea
                        value={newMessageText}
                        onChange={(e) =>
                          setNewMessageText(e.target.value)
                        }
                        className="flex-1 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-base text-white resize-y min-h-[3rem] focus:outline-none focus:ring-1 focus:ring-gray-400"
                        rows={2}
                        autoFocus
                        placeholder="Enter your new message..."
                      />
                      <div className="flex gap-0.5">
                        <button
                          onClick={addNewMessage}
                          className="text-green-400 hover:text-green-300 p-1"
                          title="Add"
                        >
                          ✓
                        </button>
                        <button
                          onClick={cancelAddNew}
                          className="text-gray-400 hover:text-gray-300 p-1"
                          title="Cancel"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingNew(true)}
                    className="w-full bg-gray-700/40 hover:bg-gray-700/60 border border-dashed border-gray-600 rounded-lg p-2 text-xs text-gray-300 hover:text-white transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus size={12} />
                    Add New Message
                  </button>
                )}
              </div>
            )}
          </div></MessagesSection>

          {/* Address Book Section */}
          <AddressBookSection><div className="bg-gray-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setIsAddressBookOpen(!isAddressBookOpen)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700/50 transition-colors"
              aria-expanded={isAddressBookOpen ? "true" : "false"}
              aria-label="Toggle store address book section"
            >
              <div className="flex items-center gap-3">
                <Building2 size={20} className="text-orange-400" />
                <span className="text-lg font-medium">
                  Store Address Book ({totalStoresCount} locations)
                </span>
                {/* Category Expand/Collapse Chevrons */}
                <div
                  className="flex items-center gap-1 ml-2"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    opacity:
                      isAddressBookOpen && categories.length > 0 ? 1 : 0,
                    pointerEvents:
                      isAddressBookOpen && categories.length > 0
                        ? "auto"
                        : "none",
                    transition: "opacity 200ms",
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      collapseAllCategories();
                    }}
                    className="text-orange-400 hover:text-orange-300 p-1 hover:bg-gray-600/50 rounded transition-colors"
                    title="Collapse all categories"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      expandAllCategories();
                    }}
                    className="text-orange-400 hover:text-orange-300 p-1 hover:bg-gray-600/50 rounded transition-colors"
                    title="Expand all categories"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>
              {isAddressBookOpen ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>

            {isAddressBookOpen && (
              <div className="border-t border-gray-700 p-4 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[220px]">
                    <label
                      className="sr-only"
                      htmlFor="store-address-search"
                    >
                      Search stores
                    </label>
                    <input
                      id="store-address-search"
                      type="search"
                      value={storeQuery}
                      onChange={(e) => setStoreQuery(e.target.value)}
                      placeholder="Search stores, cities, chains…"
                      className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                    />
                    {storeSearchActive && (
                      <button
                        type="button"
                        className="absolute inset-y-0 right-1 px-2 text-xs text-gray-300 hover:text-gray-100"
                        onClick={() => setStoreQuery("")}
                        aria-label="Clear store search"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {visibleStoresCount} of {totalStoresCount} store
                    {totalStoresCount === 1 ? "" : "s"}
                  </span>
                </div>
                {storeSearchActive &&
                  visibleStoreCategories.length === 0 ? (
                  <p className="text-xs text-gray-400 mt-1">
                    No stores matched “{storeQuery.trim()}”.
                  </p>
                ) : null}

                {visibleStoreCategories.map((category) => {
                  const { openCount, closedCount } = getStoresStatusCount(
                    category.stores,
                  );
                  const isCategoryCollapsed =
                    collapsedCategories[category.id] ?? true;

                  return (
                    <div
                      key={category.id}
                      className="bg-gray-700/40 rounded-lg overflow-hidden border border-gray-600/30"
                    >
                      {/* Category Header */}
                      <div className="flex items-center justify-between p-3 hover:bg-gray-700/60 transition-colors">
                        <button
                          onClick={() =>
                            toggleCategoryCollapse(category.id)
                          }
                          className="flex items-center gap-2 flex-1 text-left"
                        >
                          {isCategoryCollapsed ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronUp size={16} />
                          )}
                          {editingCategory === category.id ? (
                            <input
                              type="text"
                              value={category.name}
                              onChange={(e) =>
                                updateCategory(
                                  category.id,
                                  e.target.value,
                                )
                              }
                              className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-gray-400"
                              onBlur={() => setEditingCategory(-1)}
                              onKeyPress={(e) =>
                                e.key === "Enter" &&
                                setEditingCategory(-1)
                              }
                              onClick={(e) => e.stopPropagation()}
                              autoFocus
                            />
                          ) : (
                            <h4 className="font-medium text-blue-300 flex items-center gap-2">
                              <MapPin size={14} />
                              {category.name} ({category.stores.length})
                              {category.stores.length > 0 && (
                                <span className="text-xs text-gray-400 ml-2">
                                  {openCount > 0 && (
                                    <span className="text-green-400">
                                      {openCount} open
                                    </span>
                                  )}
                                  {openCount > 0 && closedCount > 0 && (
                                    <span className="text-gray-500">
                                      {" "}
                                      •{" "}
                                    </span>
                                  )}
                                  {closedCount > 0 && (
                                    <span className="text-red-400">
                                      {closedCount} closed
                                    </span>
                                  )}
                                </span>
                              )}
                            </h4>
                          )}
                        </button>

                        <div className="flex items-center gap-1">
                          {/* Always-reserved chevron group to prevent layout shift */}
                          <div className="flex items-center gap-1 w-[66px] justify-end">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                collapseAllStoresInCategory(category.id);
                              }}
                              className="p-1 transition-colors text-amber-400 hover:text-amber-300 disabled:opacity-30 disabled:cursor-default"
                              title="Collapse all stores in this category"
                              disabled={category.stores.length === 0}
                            >
                              <ChevronsUp size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                expandAllStoresInCategory(category.id);
                              }}
                              className="p-1 transition-colors text-amber-400 hover:text-amber-300 disabled:opacity-30 disabled:cursor-default"
                              title="Expand all stores in this category"
                              disabled={category.stores.length === 0}
                            >
                              <ChevronsDown size={14} />
                            </button>
                          </div>
                          <div className="w-px h-4 bg-gray-600 mx-1" />
                          <button
                            onClick={() => addStore(category.id)}
                            className="text-green-400 hover:text-green-300 p-1"
                            title="Add store"
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            onClick={() =>
                              setEditingCategory(category.id)
                            }
                            className="text-yellow-400 hover:text-yellow-300 p-1"
                            title="Edit category"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => deleteCategory(category.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Delete category"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Stores */}
                      {!isCategoryCollapsed && (
                        <div className="border-t border-gray-600/30 p-3 space-y-2">
                          {category.stores.map((store, storeIndex) => {
                            const cityState = extractCityState(
                              store.address,
                            );
                            const timeStatus = calculateTimeStatus(
                              store.closeTime,
                            );
                            const isEditing = isStoreEditing(
                              category.id,
                              store.id,
                            );
                            const isCollapsed = isStoreCollapsed(
                              category.id,
                              store.id,
                            );

                            return (
                              <div
                                key={store.id}
                                className={`bg-gray-600/50 rounded-lg overflow-visible border border-gray-500/30 transition-opacity ${draggedStore.categoryId ===
                                  category.id &&
                                  draggedStore.storeIndex === storeIndex
                                  ? "opacity-50"
                                  : ""
                                  }`}
                                draggable={!isEditing}
                                onDragStart={(e) => {
                                  if (!isEditing)
                                    handleStoreDragStart(
                                      e,
                                      category.id,
                                      storeIndex,
                                    );
                                }}
                                onDragOver={handleStoreDragOver}
                                onDrop={(e) =>
                                  handleStoreDrop(
                                    e,
                                    category.id,
                                    storeIndex,
                                  )
                                }
                              >
                                {/* Store Header */}
                                <div className="flex items-center justify-between p-3 hover:bg-gray-600/70 transition-colors">
                                  <div className="flex items-center gap-2 flex-1">
                                    {!isEditing && (
                                      <button
                                        className="text-gray-400 hover:text-gray-300 cursor-move"
                                        aria-label="Drag to reorder"
                                      >
                                        <GripVertical size={14} />
                                      </button>
                                    )}
                                    <button
                                      onClick={() =>
                                        toggleStoreCollapse(
                                          category.id,
                                          store.id,
                                        )
                                      }
                                      className="flex items-center gap-2 flex-1 text-left"
                                    >
                                      {isCollapsed ? (
                                        <ChevronDown size={14} />
                                      ) : (
                                        <ChevronUp size={14} />
                                      )}
                                      <div className="flex-1">
                                        {cityState ? (
                                          <h5 className="font-medium text-green-300 text-sm flex items-center gap-2">
                                            {cityState}
                                            {timeStatus && (
                                              <span
                                                className={`text-xs ${timeStatus.color}`}
                                              >
                                                (
                                                {timeStatus.status ===
                                                  "open"
                                                  ? "Open"
                                                  : "Closed"}
                                                )
                                              </span>
                                            )}
                                          </h5>
                                        ) : (
                                          <h5 className="font-medium text-gray-400 text-sm italic">
                                            New Store
                                          </h5>
                                        )}
                                      </div>
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() =>
                                        toggleEditStore(
                                          category.id,
                                          store.id,
                                        )
                                      }
                                      className={`p-1 transition-colors ${isEditing
                                        ? "text-green-400 hover:text-green-300"
                                        : "text-yellow-400 hover:text-yellow-300"
                                        }`}
                                      title={
                                        isEditing
                                          ? "Save changes"
                                          : "Edit store"
                                      }
                                    >
                                      {isEditing ? (
                                        <Check size={14} />
                                      ) : (
                                        <Edit2 size={14} />
                                      )}
                                    </button>
                                    <button
                                      onClick={() =>
                                        deleteStore(category.id, store.id)
                                      }
                                      className="text-red-400 hover:text-red-300 p-1"
                                      title="Delete store"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>

                                {/* Store Details */}
                                {!isCollapsed && (
                                  <div className="border-t border-gray-500/30 p-3 space-y-2">
                                    {/* Address */}
                                    <div className="flex items-start gap-2">
                                      <label className="text-xs text-gray-400 w-16 mt-1 flex-shrink-0">
                                        Address:
                                      </label>
                                      {isEditing ? (
                                        <input
                                          type="text"
                                          value={store.address}
                                          onChange={(e) =>
                                            updateStore(
                                              category.id,
                                              store.id,
                                              "address",
                                              e.target.value,
                                            )
                                          }
                                          className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gray-400"
                                          placeholder="Enter address..."
                                        />
                                      ) : (
                                        <div className="flex-1 text-xs text-gray-200 mt-1">
                                          {store.address || (
                                            <span className="italic text-gray-500">
                                              No address entered
                                            </span>
                                          )}
                                        </div>
                                      )}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          copyToClipboard(store.address);
                                        }}
                                        className="text-blue-400 hover:text-blue-300 p-1"
                                        title="Copy address"
                                        disabled={!store.address}
                                      >
                                        <Copy size={12} />
                                      </button>
                                    </div>

                                    {/* Times */}
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="flex items-center gap-2">
                                        <label className="text-xs text-gray-400 w-12">
                                          Open:
                                        </label>
                                        {isEditing ? (
                                          <input
                                            type="text"
                                            value={store.openTime}
                                            onChange={(e) =>
                                              updateStore(
                                                category.id,
                                                store.id,
                                                "openTime",
                                                e.target.value,
                                              )
                                            }
                                            className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-0.5 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-gray-400"
                                            placeholder="0800"
                                            maxLength={4}
                                          />
                                        ) : (
                                          <div className="flex-1 text-xs text-gray-200 font-mono">
                                            {formatTime(
                                              store.openTime,
                                            ) || (
                                                <span className="italic text-gray-500">
                                                  Not set
                                                </span>
                                              )}
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <label className="text-xs text-gray-400 w-12">
                                          Close:
                                        </label>
                                        {isEditing ? (
                                          <input
                                            type="text"
                                            value={store.closeTime}
                                            onChange={(e) =>
                                              updateStore(
                                                category.id,
                                                store.id,
                                                "closeTime",
                                                e.target.value,
                                              )
                                            }
                                            className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-0.5 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-gray-400"
                                            placeholder="2100"
                                            maxLength={4}
                                          />
                                        ) : (
                                          <div className="flex-1 text-xs text-gray-200 font-mono">
                                            {formatTime(
                                              store.closeTime,
                                            ) || (
                                                <span className="italic text-gray-500">
                                                  Not set
                                                </span>
                                              )}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Notes */}
                                    <div className="flex items-start gap-2">
                                      <label className="text-xs text-gray-400 w-16 mt-1 flex-shrink-0">
                                        Notes:
                                      </label>
                                      {isEditing ? (
                                        <textarea
                                          value={store.notes}
                                          onChange={(e) =>
                                            updateStore(
                                              category.id,
                                              store.id,
                                              "notes",
                                              e.target.value,
                                            )
                                          }
                                          className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-0.5 text-xs text-white resize-y min-h-[2rem] focus:outline-none focus:ring-1 focus:ring-gray-400"
                                          rows={1}
                                          placeholder="Any notes..."
                                        />
                                      ) : (
                                        <div className="flex items-start gap-2 flex-1 mt-1">
                                          <div
                                            className={`flex-1 text-xs text-gray-200 ${isStoreNotesCollapsed(category.id, store.id) ? "truncate max-w-[48ch]" : "whitespace-pre-wrap"}`}
                                          >
                                            {store.notes || (
                                              <span className="italic text-gray-500">
                                                No notes
                                              </span>
                                            )}
                                          </div>
                                          <button
                                            onClick={() =>
                                              toggleStoreNotesCollapsed(
                                                category.id,
                                                store.id,
                                              )
                                            }
                                            className="text-blue-300 hover:text-blue-200 p-1 self-start"
                                            title={
                                              isStoreNotesCollapsed(
                                                category.id,
                                                store.id,
                                              )
                                                ? "Show full notes"
                                                : "Collapse notes"
                                            }
                                          >
                                            {isStoreNotesCollapsed(
                                              category.id,
                                              store.id,
                                            )
                                              ? React.createElement(ChevronDown, { size: 14 })
                                              : React.createElement(ChevronUp, { size: 14 })}
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {category.stores.length === 0 && (
                            <div className="text-center text-gray-500 py-2 text-xs">
                              No stores yet. Click + to add one.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add New Category */}
                {isAddingCategory ? (
                  <div className="bg-gray-700/40 rounded-lg p-3 border border-gray-600/30 border-dashed">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) =>
                          setNewCategoryName(e.target.value)
                        }
                        className="flex-1 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-gray-400"
                        placeholder="Category name (e.g., Walgreens)"
                        autoFocus
                      />
                      <button
                        onClick={addCategory}
                        className="text-green-400 hover:text-green-300 p-1"
                        title="Add"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingCategory(false);
                          setNewCategoryName("");
                        }}
                        className="text-gray-400 hover:text-gray-300 p-1"
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingCategory(true)}
                    className="w-full bg-gray-700/40 hover:bg-gray-700/60 border border-dashed border-gray-600 rounded-lg p-3 text-sm text-gray-300 hover:text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={14} />
                    Add New Store Category
                  </button>
                )}

                {categories.length === 0 && !isAddingCategory && (
                  <div className="text-center text-gray-500 py-6 text-sm">
                    No store categories yet
                  </div>
                )}
              </div>
            )}
          </div></AddressBookSection>

          {/* Notes Section */}
          <NotesSection><div className="bg-gray-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setIsNotesOpen(!isNotesOpen)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700/50 transition-colors"
              aria-expanded={isNotesOpen ? "true" : "false"}
              aria-label="Toggle notes section"
            >
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-purple-400" />
                <span className="text-lg font-medium">
                  Notes (
                  {noteCategories.reduce(
                    (total, cat) => total + cat.notes.length,
                    0,
                  )}{" "}
                  items)
                </span>
                {/* Category Expand/Collapse Chevrons */}
                <div
                  className="flex items-center gap-1 ml-2"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    opacity:
                      isNotesOpen && noteCategories.length > 0 ? 1 : 0,
                    pointerEvents:
                      isNotesOpen && noteCategories.length > 0
                        ? "auto"
                        : "none",
                    transition: "opacity 200ms",
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      collapseAllNoteCategories();
                    }}
                    className="text-purple-400 hover:text-purple-300 p-1 hover:bg-gray-600/50 rounded transition-colors"
                    title="Collapse all categories"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      expandAllNoteCategories();
                    }}
                    className="text-purple-400 hover:text-purple-300 p-1 hover:bg-gray-600/50 rounded transition-colors"
                    title="Expand all categories"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>
              {isNotesOpen ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>

            {isNotesOpen && (
              <div className="border-t border-gray-700 p-4">
                <div className="mb-3 text-center">
                  <p className="text-xs text-gray-400">
                    Organize your notes by category
                  </p>
                </div>

                <div className="space-y-3">
                  {noteCategories.map((category) => {
                    const isCategoryCollapsed =
                      collapsedNoteCategories[category.id] ?? true;

                    return (
                      <div
                        key={category.id}
                        className="bg-gray-700/40 rounded-lg overflow-hidden border border-gray-600/30"
                        onDragOver={handleNoteDragOver}
                        onDrop={(e) => handleNoteDrop(e, category.id)}
                      >
                        {/* Category Header */}
                        <div className="flex items-center justify-between p-3 hover:bg-gray-700/60 transition-colors">
                          <button
                            onClick={() =>
                              toggleNoteCategoryCollapse(category.id)
                            }
                            className="flex items-center gap-2 flex-1 text-left"
                          >
                            {isCategoryCollapsed ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronUp size={16} />
                            )}
                            {editingNoteCategory === category.id ? (
                              <input
                                type="text"
                                value={category.name}
                                onChange={(e) =>
                                  updateNoteCategory(
                                    category.id,
                                    e.target.value,
                                  )
                                }
                                className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-white focus:outline-none"
                                onBlur={() => setEditingNoteCategory(-1)}
                                onKeyPress={(e) =>
                                  e.key === "Enter" &&
                                  setEditingNoteCategory(-1)
                                }
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                              />
                            ) : (
                              <h4 className="font-medium text-purple-300 flex items-center gap-2">
                                <FileText size={14} />
                                {category.name} ({category.notes.length})
                              </h4>
                            )}
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => addNote(category.id)}
                              className="text-green-400 hover:text-green-300 p-1"
                              title="Add note"
                            >
                              <Plus size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingNoteCategory(category.id);
                              }}
                              className="text-yellow-400 hover:text-yellow-300 p-1"
                              title="Rename category"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() =>
                                deleteNoteCategory(category.id)
                              }
                              className="text-red-400 hover:text-red-300 p-1"
                              title="Delete category"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Notes */}
                        {!isCategoryCollapsed && (
                          <div className="border-t border-gray-600/30 p-3 space-y-2">
                            {category.notes.map((note, noteIndex) => {
                              const isEditing = isNoteEditing(
                                category.id,
                                noteIndex,
                              );

                              return (
                                <div
                                  key={noteIndex}
                                  className={`bg-gray-600/50 rounded-lg p-2 transition-opacity ${draggedNote.categoryId ===
                                    category.id &&
                                    draggedNote.noteIndex === noteIndex
                                    ? "opacity-50"
                                    : ""
                                    }`}
                                  draggable={!isEditing}
                                  onDragStart={(e) => {
                                    if (!isEditing)
                                      handleNoteDragStart(
                                        e,
                                        category.id,
                                        noteIndex,
                                      );
                                  }}
                                >
                                  <div className="flex items-start gap-2">
                                    {!isEditing && (
                                      <button
                                        className="text-gray-400 hover:text-gray-300 cursor-move mt-1"
                                        aria-label="Drag to reorder"
                                      >
                                        <GripVertical size={14} />
                                      </button>
                                    )}

                                    <div className="flex-1">
                                      {isEditing ? (
                                        <textarea
                                          value={note}
                                          onChange={(e) =>
                                            updateNote(
                                              category.id,
                                              noteIndex,
                                              e.target.value,
                                            )
                                          }
                                          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-0.5 text-sm text-white resize-y min-h-[4rem] focus:outline-none focus:ring-1 focus:ring-gray-400"
                                          rows={3}
                                          autoFocus
                                          placeholder="Enter your note..."
                                        />
                                      ) : (
                                        <div
                                          className={`text-sm text-gray-100 ${isCategoryNoteCollapsed(category.id, noteIndex) ? "truncate max-w-[64ch]" : "whitespace-pre-wrap"}`}
                                        >
                                          {note || (
                                            <span className="italic text-gray-500">
                                              Empty note - click edit to
                                              add content
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex items-start gap-1 mt-1">
                                      {!isEditing && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            copyToClipboard(note);
                                          }}
                                          className="text-blue-400 hover:text-blue-300 p-1"
                                          title="Copy note"
                                          disabled={!note}
                                        >
                                          <Copy size={14} />
                                        </button>
                                      )}
                                      <button
                                        onClick={() =>
                                          toggleNoteEdit(
                                            category.id,
                                            noteIndex,
                                          )
                                        }
                                        className={`p-1 transition-colors ${isEditing
                                          ? "text-green-400 hover:text-green-300"
                                          : "text-yellow-400 hover:text-yellow-300"
                                          }`}
                                        title={
                                          isEditing ? "Save" : "Edit"
                                        }
                                      >
                                        {isEditing ? (
                                          <Check size={14} />
                                        ) : (
                                          <Edit2 size={14} />
                                        )}
                                      </button>
                                      {!isEditing && (
                                        <button
                                          onClick={() =>
                                            toggleCategoryNoteCollapsed(
                                              category.id,
                                              noteIndex,
                                            )
                                          }
                                          className="text-blue-300 hover:text-blue-200 p-1"
                                          title={
                                            isCategoryNoteCollapsed(
                                              category.id,
                                              noteIndex,
                                            )
                                              ? "Show full note"
                                              : "Collapse note"
                                          }
                                        >
                                          {isCategoryNoteCollapsed(
                                            category.id,
                                            noteIndex,
                                          )
                                            ? React.createElement(ChevronDown, { size: 14 })
                                            : React.createElement(ChevronUp, { size: 14 })}
                                        </button>
                                      )}
                                      <button
                                        onClick={() =>
                                          deleteNote(
                                            category.id,
                                            noteIndex,
                                          )
                                        }
                                        className="text-red-400 hover:text-red-300 p-1"
                                        title="Delete"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                            {category.notes.length === 0 && (
                              <div className="text-center text-gray-500 py-2 text-xs">
                                No notes yet. Click + to add one.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Add Category Button */}
                <button
                  onClick={addNoteCategory}
                  className="w-full mt-3 bg-gray-700/40 hover:bg-gray-700/60 border border-dashed border-gray-600 rounded-lg p-3 text-sm text-gray-300 hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={14} />
                  Add New Category
                </button>
              </div>
            )}
          </div></NotesSection>

          {/* ========== DASHERS MANAGEMENT (GLOBAL CONTROLS) ========== */}
          <div className="flex items-center gap-3 my-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent opacity-50"></div>
            <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">
              Dashers Management
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent opacity-50"></div>
          </div>

          {/* Global Controls Bar */}
          <div className="mt-2 bg-gray-900/40 border border-gray-700 rounded-lg p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div
                className="flex items-center gap-1 border border-gray-600 rounded overflow-hidden text-[11px]"
                aria-label="Balance filter"
              >
                <button
                  onClick={() => {
                    if (showNonZeroOnly) {
                      setShowNonZeroOnly(false);
                      requestPersist();
                    }
                  }}
                  className={`px-2 py-1 ${!showNonZeroOnly ? "bg-gray-700 text-gray-100" : "text-gray-400 hover:text-gray-200"}`}
                >
                  All
                </button>
                <button
                  onClick={() => {
                    if (!showNonZeroOnly) {
                      setShowNonZeroOnly(true);
                      requestPersist();
                    }
                  }}
                  className={`px-2 py-1 ${showNonZeroOnly ? "bg-gray-700 text-gray-100" : "text-gray-400 hover:text-gray-200"}`}
                >
                  Non‑Zero
                </button>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={dasherSort.key}
                  onChange={(e) => {
                    setDasherSort((prev) => ({
                      ...prev,
                      key: e.target.value,
                    }));
                    requestPersist();
                  }}
                  className="db-input-sm text-[11px]"
                  aria-label="Sort dashers"
                >
                  <option value="none">Sort: None</option>
                  <option value="alphabetical">Alphabetical</option>
                  <option value="balance">Balance</option>
                  <option value="lastUsed">Last Used</option>
                </select>
                <button
                  onClick={() => {
                    if (dasherSort.key !== "none") {
                      setDasherSort((prev) => ({
                        ...prev,
                        dir: prev.dir === "asc" ? "desc" : "asc",
                      }));
                      requestPersist();
                    }
                  }}
                  disabled={dasherSort.key === "none"}
                  className={`px-2 py-1 rounded border border-gray-600 text-[11px] ${dasherSort.key === "none" ? "text-gray-500 bg-gray-700/40" : "text-gray-200 bg-gray-700 hover:bg-gray-600"}`}
                  aria-label="Toggle sort direction"
                >
                  {dasherSort.dir === "asc" ? "↑" : "↓"}
                </button>
                {(showNonZeroOnly ||
                  dasherSort.key !== "none" ||
                  (globalQuery && globalQuery.trim())) && (
                    <button
                      onClick={() => {
                        setShowNonZeroOnly(false);
                        setDasherSort({ key: "none", dir: "desc" });
                        setGlobalQuery("");
                        globalQueryDebouncedRef.current = "";
                        requestPersist();
                      }}
                      className="px-2 py-1 rounded text-[11px] bg-gray-600/60 hover:bg-gray-500 text-gray-100 border border-gray-500/60"
                    >
                      Clear
                    </button>
                  )}
              </div>

              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <input
                  type="text"
                  value={globalQuery}
                  onChange={(e) => setGlobalQuery(e.target.value)}
                  placeholder="Search name / email / phone"
                  className="db-input-sm flex-1 text-xs"
                  aria-label="Search dashers"
                />
                <div
                  className="text-[11px] text-gray-400 font-mono"
                  aria-label="Matches count"
                >
                  {filteredAllDashers.length} / {allDashersFlat.length}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    expandAllDasherCategories();
                    expandKeySections();
                    setIsAppealedDashersOpen(true);
                    setIsAppliedPendingDashersOpen(true);
                    setIsReverifDashersOpen(true);
                    setReverifRenderReady(true);
                    setIsLockedDashersOpen(true);
                    setIsDeactivatedDashersOpen(true);
                    setIsArchivedDashersOpen(true);
                  }}
                  className="px-3 py-1.5 text-[11px] rounded bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200"
                  aria-label="Expand all dasher sections"
                >
                  Expand All
                </button>
                <button
                  onClick={() => {
                    collapseAllDasherCategories();
                    collapseKeySections();
                    setIsAppealedDashersOpen(false);
                    setIsAppliedPendingDashersOpen(false);
                    setIsReverifDashersOpen(false);
                    setReverifRenderReady(false);
                    setIsLockedDashersOpen(false);
                    setIsDeactivatedDashersOpen(false);
                    setIsArchivedDashersOpen(false);
                  }}
                  className="px-3 py-1.5 text-[11px] rounded bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200"
                  aria-label="Collapse all dasher sections"
                >
                  Collapse All
                </button>
              </div>

              <span className="sr-only" aria-live="polite">
                {globalQuery && globalQuery.trim()
                  ? "Filtering dashers"
                  : "Showing all dashers"}
              </span>
            </div>
          </div>

          {/* Dashers Section */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div
              className="flex items-center justify-between p-4 hover:bg-gray-700/50 transition-colors"
              onKeyDown={(e) => {
                if (
                  e.target !== e.currentTarget &&
                  e.target.tagName !== "BUTTON"
                )
                  return;
                if (e.key === "ArrowLeft") {
                  ((bucketKey) =>
                    bucketKey === "main"
                      ? getMainStage() === 3
                        ? collapseAllDasherCategories()
                        : collapseMainToCategoriesOnly()
                      : collapseBucket(bucketKey))("main");
                  e.preventDefault();
                }
                if (e.key === "ArrowRight") {
                  ((bucketKey) =>
                    bucketKey === "main"
                      ? getMainStage() === 1
                        ? collapseAllDasherCategories()
                        : expandAllDasherCategories()
                      : expandBucket(bucketKey))("main");
                  e.preventDefault();
                }
              }}
            >
              <button
                onClick={toggleDashersOpen}
                className="flex items-center gap-3 flex-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                aria-expanded={isDashersOpen ? "true" : "false"}
                aria-controls="bucket-main"
                type="button"
              >
                <Users size={20} className="text-indigo-400" />
                <span className="text-lg font-medium flex items-center gap-2">
                  Dashers
                  {renderStableCount(
                    filteredCategoryDashers.length,
                    categoryDashersFlat.length,
                  )}
                </span>
              </button>
              <div className="flex items-center gap-2 pl-2">
                {/* Enable chevrons even when closed; disable only when no categories */}
                <BucketChevrons
                  bucketKey="main"
                  bucketLabel="Dashers"
                  isVisible={dasherCategories.length > 0}
                />
                {/* Stage indicator: 1/2/3 for main */}
                <span
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-700/60 text-gray-300 border border-gray-600"
                  title={`Dashers view stage: ${getMainStage()}`}
                  aria-label={`Dashers view stage ${getMainStage()}`}
                >
                  {getMainStage()}
                </span>
                <span className="text-gray-300" aria-hidden="true">
                  {isDashersOpen ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </span>
              </div>
            </div>

            {isDashersOpen &&
              (dashersRenderReady ? (
                <div
                  id="bucket-main"
                  className="border-t border-gray-700 p-4 space-y-3"
                >
                  {showResultsBucket && (
                    <div
                      className="bg-gray-700/40 border border-indigo-500/20 rounded-lg p-3 space-y-3"
                      data-testid="dashers-search-results"
                    >
                      {/* Header + controls */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <h3 className="text-base font-semibold text-gray-100">
                            Results
                          </h3>
                          <div className="text-xs text-gray-400">
                            {sortedResultsDashers.length} match
                            {sortedResultsDashers.length === 1
                              ? ""
                              : "es"}
                            {globalQueryActive && globalQuery.trim() && (
                              <> • Query: “{globalQuery.trim()}”</>
                            )}
                            {showNonZeroOnly && <> • Non-zero only</>}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                          <button
                            type="button"
                            className={`px-2 py-1 rounded border ${resultsFlagFilters.appealed ? "bg-amber-500/20 text-amber-300 border-amber-400/40" : "border-gray-600 text-gray-300 hover:text-gray-100"}`}
                            onClick={() => toggleResultsFlag("appealed")}
                            title="Filter: Appealed flag"
                            aria-pressed={resultsFlagFilters.appealed ? "true" : "false"}
                          >
                            Appealed
                          </button>
                          <button
                            type="button"
                            className={`px-2 py-1 rounded border ${resultsFlagFilters.crimson ? "bg-red-500/20 text-red-300 border-red-400/40" : "border-gray-600 text-gray-300 hover:text-gray-100"}`}
                            onClick={() => toggleResultsFlag("crimson")}
                            title="Filter: Crimson flag"
                            aria-pressed={resultsFlagFilters.crimson ? "true" : "false"}
                          >
                            Crimson
                          </button>
                          <button
                            type="button"
                            className={`px-2 py-1 rounded border ${resultsFlagFilters.fastPay ? "bg-blue-500/20 text-blue-300 border-blue-400/40" : "border-gray-600 text-gray-300 hover:text-gray-100"}`}
                            onClick={() => toggleResultsFlag("fastPay")}
                            title="Filter: FastPay flag"
                            aria-pressed={resultsFlagFilters.fastPay ? "true" : "false"}
                          >
                            FastPay
                          </button>
                          <button
                            type="button"
                            className={`px-2 py-1 rounded border ${resultsFlagFilters.redCard ? "bg-purple-500/20 text-purple-300 border-purple-400/40" : "border-gray-600 text-gray-300 hover:text-gray-100"}`}
                            onClick={() => toggleResultsFlag("redCard")}
                            title="Filter: Red Card flag"
                            aria-pressed={resultsFlagFilters.redCard ? "true" : "false"}
                          >
                            Red Card
                          </button>
                          <select
                            value={resultsBucketFilter}
                            onChange={(e) =>
                              setResultsBucketFilter(e.target.value)
                            }
                            className="ml-2 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-[11px] text-gray-100"
                            title="Filter by source bucket"
                          >
                            <option value="any">Any bucket</option>
                            <option value="main">Dashers</option>
                            <option value="ready">Ready</option>
                            <option value="currently-using">
                              Currently Using
                            </option>
                            <option value="appealed">Appealed</option>
                            <option value="applied-pending">
                              Applied Pending
                            </option>
                            <option value="reverif">Reverif</option>
                            <option value="locked">Locked</option>
                            <option value="deactivated">
                              Deactivated
                            </option>
                            <option value="archived">Archived</option>
                          </select>
                          {(resultsBucketFilter !== "any" ||
                            resultsFlagFilters.appealed ||
                            resultsFlagFilters.crimson ||
                            resultsFlagFilters.fastPay ||
                            resultsFlagFilters.redCard) && (
                              <button
                                className="px-2 py-1 rounded border border-gray-600 text-gray-300 hover:text-gray-100"
                                onClick={resetResultsControls}
                                title="Clear Results filters"
                              >
                                Clear
                              </button>
                            )}
                        </div>
                      </div>

                      {/* Table header */}
                      <div
                        className="bg-gray-800/60 border border-gray-700/70 rounded-md overflow-hidden"
                        role="table"
                        aria-label="Dasher search results"
                      >
                        <div
                          className="grid grid-cols-12 gap-2 px-3 py-2 text-[11px] uppercase tracking-wide text-gray-400 border-b border-gray-700/70 bg-gray-800/80"
                          role="row"
                        >
                          <button
                            type="button"
                            className="col-span-12 sm:col-span-4 text-left flex items-center gap-1 hover:text-gray-100 transition-colors"
                            onClick={() => setResultsSortKey("name")}
                            title="Sort by name"
                            role="columnheader"
                            aria-sort={resultsSort.key === "name" ? (resultsSort.dir === "asc" ? "ascending" : "descending") : "none"}
                          >
                            <span className="truncate">Name</span>
                            {resultsSort.key === "name" && (
                              <span aria-hidden="true">
                                {resultsSort.dir === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </button>
                          <div
                            className="col-span-12 sm:col-span-5 text-left"
                            role="columnheader"
                            aria-sort="none"
                          >
                            <span className="hidden sm:inline">Email / Phone</span>
                            <span className="sm:hidden">Contact</span>
                          </div>
                          <button
                            type="button"
                            className="col-span-6 sm:col-span-2 text-left flex items-center gap-1 hover:text-gray-100 transition-colors"
                            onClick={() => setResultsSortKey("bucket")}
                            title="Sort by bucket"
                            role="columnheader"
                            aria-sort={resultsSort.key === "bucket" ? (resultsSort.dir === "asc" ? "ascending" : "descending") : "none"}
                          >
                            <span className="truncate">Source</span>
                            {resultsSort.key === "bucket" && (
                              <span aria-hidden="true">
                                {resultsSort.dir === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </button>
                          <button
                            type="button"
                            className="col-span-6 sm:col-span-1 text-right flex items-center justify-end gap-1 hover:text-gray-100 transition-colors"
                            onClick={() => setResultsSortKey("balance")}
                            title="Sort by balance"
                            role="columnheader"
                            aria-sort={resultsSort.key === "balance" ? (resultsSort.dir === "asc" ? "ascending" : "descending") : "none"}
                          >
                            <span className="truncate">Balance</span>
                            {resultsSort.key === "balance" && (
                              <span aria-hidden="true">
                                {resultsSort.dir === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </button>
                        </div>

                        {/* Rows */}
                        {sortedResultsDashers.length === 0 ? (
                          <div
                            className="px-3 py-3 text-xs text-gray-400"
                          >
                            No dashers matched these Results filters.
                          </div>
                        ) : (
                          <div
                            className="divide-y divide-gray-700/60"
                          >
                            {sortedResultsDashers.map(
                              ({
                                identity,
                                dasher,
                                primaryLocation,
                                alternateLocations,
                              }) => {
                                const balanceValue = parseBalanceValue(
                                  dasher?.balance,
                                );
                                const email = (
                                  dasher?.email || ""
                                ).trim();
                                const phone = (
                                  dasher?.phone || ""
                                ).trim();
                                const balanceBadgeClasses =
                                  balanceValue === 0
                                    ? "inline-flex items-center justify-end px-2 py-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                                    : "inline-flex items-center justify-end px-2 py-1 rounded-full border border-amber-400/40 bg-amber-500/10 text-amber-200 drop-shadow-[0_0_6px_rgba(251,191,36,0.35)]";
                                return (
                                  <div
                                    key={identity}
                                    className="px-3 py-3 sm:py-2"
                                  >
                                    <div className="grid grid-cols-12 gap-2 sm:items-center">
                                      <div
                                        className="col-span-12 sm:col-span-4 min-w-0 space-y-1"
                                      >
                                        <div className="truncate text-sm font-semibold text-gray-100">
                                          {dasher?.name ||
                                            "Unnamed dasher"}
                                        </div>
                                        {identity && (
                                          <div className="text-[10px] uppercase tracking-wide text-gray-500">
                                            {identity}
                                          </div>
                                        )}
                                      </div>
                                      <div
                                        className="col-span-12 sm:col-span-5 min-w-0 space-y-1"
                                        role="cell"
                                      >
                                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-300">
                                          <span className="truncate max-w-full sm:max-w-[18rem]">
                                            {email ? (
                                              email
                                            ) : (
                                              <span className="italic text-gray-500">
                                                No email
                                              </span>
                                            )}
                                          </span>
                                          {phone && (
                                            <span className="tabular-nums text-gray-400">
                                              {phone}
                                            </span>
                                          )}
                                        </div>
                                        <span
                                          className="flag-badges block"
                                          aria-label="Dasher status flags (Crimson, Red Card, Appealed, FastPay)"
                                        >
                                          <span
                                            className="flag-badge"
                                            data-flag="C"
                                            data-active={
                                              dasher?.crimson
                                                ? "true"
                                                : "false"
                                            }
                                            data-selected={
                                              (
                                                dasher?.selectedCashout ||
                                                ""
                                              ).toLowerCase() ===
                                                "crimson"
                                                ? "true"
                                                : "false"
                                            }
                                            title={
                                              dasher?.crimson
                                                ? dasher?.crimsonAt
                                                  ? `Crimson since ${new Date(dasher.crimsonAt).toLocaleString()}`
                                                  : "Crimson active"
                                                : "Crimson inactive"
                                            }
                                          >
                                            CRIMSON
                                          </span>
                                          <span
                                            className="flag-badge"
                                            data-flag="FP"
                                            data-active={
                                              dasher?.fastPay
                                                ? "true"
                                                : "false"
                                            }
                                            data-selected={
                                              (
                                                dasher?.selectedCashout ||
                                                ""
                                              ).toLowerCase() ===
                                                "fastpay"
                                                ? "true"
                                                : "false"
                                            }
                                            title={
                                              dasher?.fastPay
                                                ? dasher?.fastPayInfo
                                                  ? `FastPay: ${dasher.fastPayInfo}`
                                                  : "FastPay active"
                                                : "FastPay inactive"
                                            }
                                          >
                                            FastPay
                                          </span>
                                          <span
                                            className="flag-badge"
                                            data-flag="RC"
                                            data-active={
                                              dasher?.redCard
                                                ? "true"
                                                : "false"
                                            }
                                            title={
                                              dasher?.redCard
                                                ? dasher?.redCardAt
                                                  ? `Red Card since ${new Date(dasher.redCardAt).toLocaleString()}`
                                                  : "Red Card active"
                                                : "Red Card inactive"
                                            }
                                          >
                                            RED CARD
                                          </span>
                                          <span
                                            className="flag-badge"
                                            data-flag="AP"
                                            data-active={
                                              dasher?.appealed
                                                ? "true"
                                                : "false"
                                            }
                                            title={
                                              dasher?.appealed
                                                ? dasher?.appealedAt
                                                  ? `Appealed since ${new Date(dasher.appealedAt).toLocaleString()}`
                                                  : "Appealed active"
                                                : "Appealed inactive"
                                            }
                                          >
                                            APPEALED
                                          </span>
                                        </span>
                                      </div>
                                      <div
                                        className="col-span-12 sm:col-span-2 min-w-0 space-y-1"
                                        role="cell"
                                      >
                                        <div className="text-xs font-medium text-blue-200 truncate">
                                          {primaryLocation.bucketLabel}
                                        </div>
                                        {primaryLocation.meta?.categoryName && (
                                          <div className="text-[11px] text-blue-300/80 truncate">
                                            {primaryLocation.meta.categoryName}
                                          </div>
                                        )}
                                      </div>
                                      <div
                                        className="col-span-12 sm:col-span-1 flex justify-between sm:justify-end items-center gap-3 sm:gap-1"
                                        role="cell"
                                      >
                                        <span
                                          className={`${balanceBadgeClasses} text-sm tabular-nums font-semibold`}
                                          aria-label="Balance"
                                        >
                                          ${balanceValue.toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                    <div
                                      className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-gray-300"
                                      role="group"
                                      aria-label="Result actions"
                                    >
                                      <button
                                        type="button"
                                        className="text-blue-300 hover:text-blue-200"
                                        onClick={() =>
                                          revealDasherCard(
                                            identity,
                                            primaryLocation.bucketKey,
                                            primaryLocation.meta,
                                          )
                                        }
                                      >
                                        Reveal in{" "}
                                        {primaryLocation.bucketLabel}
                                      </button>
                                      {alternateLocations.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-1 text-gray-400">
                                          <span className="uppercase tracking-wide text-[10px] text-gray-500">
                                            Also
                                          </span>
                                          {alternateLocations.map((loc) => {
                                            const altKey = `${loc?.bucketKey ?? "bucket"}-${loc?.meta?.categoryName ?? "none"}`;
                                            return (
                                              <span
                                                key={altKey}
                                                className="px-2 py-0.5 rounded-full border border-gray-600/60 text-[10px] text-gray-300"
                                              >
                                                {loc?.bucketLabel}
                                              </span>
                                            );
                                          })}
                                        </div>
                                      )}
                                      {(globalQueryActive ||
                                        showNonZeroOnly) && (
                                          <button
                                            type="button"
                                            className="text-gray-300 hover:text-gray-200"
                                            onClick={() => {
                                              setGlobalQuery("");
                                              globalQueryDebouncedRef.current = "";
                                              setShowNonZeroOnly(false);
                                              resetResultsControls();
                                              requestPersist();
                                            }}
                                          >
                                            Clear global filters
                                          </button>
                                        )}
                                    </div>
                                  </div>
                                );
                              },
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {dasherCategories &&
                    dasherCategories.length > 0 &&
                    dasherCategories.map((category) => {
                      if (!category || !category.dashers) return null;
                      // Use saved collapse state (default true)
                      const isCategoryCollapsed =
                        collapsedDasherCategories[category.id] ?? true;
                      const categoryDashersFiltered =
                        filterAndSortDashers(category.dashers || []);

                      return (
                        <div
                          key={category.id}
                          className="bg-gray-700/40 rounded-lg overflow-hidden border border-gray-600/30"
                        >
                          {/* Category Header */}
                          <div className="flex items-center justify-between p-3 hover:bg-gray-700/60 transition-colors">
                            <div className="flex items-center gap-2">
                              {/* Category selection checkbox (only visible in edit mode) */}
                              {isEditMode && (
                                <input
                                  type="checkbox"
                                  checked={
                                    selectedItems.dasherCategories.has(
                                      category.id,
                                    ) ||
                                    (category.dashers &&
                                      category.dashers.length > 0 &&
                                      category.dashers.every((d) =>
                                        selectedItems.dashers.has(d.id),
                                      ))
                                  }
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    toggleCategorySelection(
                                      "dashers",
                                      category.id,
                                      category.dashers.map((d) => d.id),
                                    );
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-4 h-4 text-gray-300 bg-gray-700 border-gray-500 rounded focus:ring-gray-400 focus:ring-2"
                                  aria-label={`Select all dashers in ${category.name} category`}
                                />
                              )}
                              <button
                                onClick={() =>
                                  toggleDasherCategoryCollapse(
                                    category.id,
                                  )
                                }
                                className="flex items-center gap-2 text-left flex-1"
                              >
                                {isCategoryCollapsed ? (
                                  <ChevronDown size={16} />
                                ) : (
                                  <ChevronUp size={16} />
                                )}
                                {editingDasherCategory === category.id ? (
                                  <input
                                    type="text"
                                    value={category.name}
                                    onChange={(e) =>
                                      updateDasherCategory(
                                        category.id,
                                        e.target.value,
                                      )
                                    }
                                    className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-white focus:outline-none"
                                    onBlur={() =>
                                      setEditingDasherCategory(-1)
                                    }
                                    onKeyPress={(e) =>
                                      e.key === "Enter" &&
                                      setEditingDasherCategory(-1)
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                    autoFocus
                                  />
                                ) : (
                                  <h4 className="font-medium text-indigo-300 flex items-center gap-2">
                                    <Users size={14} />
                                    {category.name} (
                                    {category.dashers.length})
                                  </h4>
                                )}
                              </button>
                            </div>

                            <div className="flex items-center gap-1">
                              {/* Always-reserved chevron group to prevent layout shift */}
                              <div className="flex items-center gap-1 w-[66px] justify-end">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    collapseAllDashersInCategory(
                                      category.id,
                                    );
                                  }}
                                  className="p-1 transition-colors text-indigo-400 hover:text-indigo-300"
                                  title="Collapse all dashers in this category"
                                >
                                  <ChevronsUp size={14} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    expandAllDashersInCategory(
                                      category.id,
                                    );
                                  }}
                                  className="p-1 transition-colors text-indigo-400 hover:text-indigo-300"
                                  title="Expand all dashers in this category"
                                >
                                  <ChevronsDown size={14} />
                                </button>
                              </div>
                              <div className="w-px h-4 bg-gray-600 mx-1" />
                              <button
                                onClick={() => addDasher(category.id)}
                                className="text-green-400 hover:text-green-300 p-1"
                                title="Add dasher"
                              >
                                <Plus size={14} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingDasherCategory(category.id);
                                }}
                                className="text-yellow-400 hover:text-yellow-300 p-1"
                                title="Rename category"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() =>
                                  deleteDasherCategory(category.id)
                                }
                                className="text-red-400 hover:text-red-300 p-1"
                                title="Delete category"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Dashers */}
                          {!isCategoryCollapsed && (
                            <div
                              className="border-t border-gray-600/30 p-3 space-y-2 min-h-[50px]"
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = "move";
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                if (category.dashers.length === 0) {
                                  handleDasherDrop(e, category.id, 0);
                                }
                              }}
                            >
                              {categoryDashersFiltered.length === 0 ? (
                                <div className="text-sm text-gray-400 text-center py-4 border-2 border-dashed border-gray-600 rounded-lg bg-gray-700/30">
                                  <div className="mb-1">📋 No dashers yet</div>
                                  <div className="text-xs text-gray-500">Drag dashers here or click + to add</div>
                                </div>
                              ) : (
                                categoryDashersFiltered.map(
                                  (dasher, index) => {
                                    const isEditing = isDasherEditing(
                                      category.id,
                                      dasher.id,
                                    );
                                    const isCollapsed = isDasherCollapsed(
                                      category.id,
                                      dasher.id,
                                    );
                                    // Re-calculate on timerTick changes
                                    const timeStatus =
                                      calculateDasherTimeStatus(
                                        dasher.lastUsed,
                                        dasher.id
                                      );
                                    const dasherTitle =
                                      getDasherTitle(dasher);
                                    const cardRecentlyMoved =
                                      recentlyMoved instanceof Set &&
                                      recentlyMoved.has(dasher.id);
                                    const identityFallback = `${category?.id ?? "category"}-${index}`;
                                    const anchorIdentity =
                                      deriveDasherIdentity(
                                        dasher,
                                        identityFallback,
                                      );
                                    const anchorId =
                                      getDasherAnchorId(anchorIdentity);

                                    return (
                                      <div
                                        key={dasher.id}
                                        className={`bg-gray-600/50 rounded-lg overflow-hidden border border-gray-500/30 transition-opacity ${dasher.deactivated
                                          ? "dasher-card--deactivated"
                                          : ""
                                          } ${dasher.ready
                                            ? "dasher-card--ready"
                                            : ""
                                          } ${dasher.appealed
                                            ? "dasher-card--appealed"
                                            : ""
                                          } ${draggedDasher.categoryId ===
                                            category.id &&
                                            draggedDasher.dasherIndex ===
                                            index
                                            ? "opacity-50"
                                            : ""
                                          } ${cardRecentlyMoved ? "ring-2 ring-amber-400/80 animate-pulse" : ""}`}
                                        id={anchorId || undefined}
                                        data-dasher-anchor={
                                          anchorIdentity || undefined
                                        }
                                        draggable={
                                          !isEditing &&
                                          dasherSort.key === "none"
                                        }
                                        onDragStart={(e) => {
                                          if (
                                            !isEditing &&
                                            dasherSort.key === "none"
                                          )
                                            handleDasherDragStart(
                                              e,
                                              category.id,
                                              index,
                                            );
                                        }}
                                        onDragEnd={handleDasherDragEnd}
                                        onDragOver={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                        }}
                                        onDrop={(e) => {
                                          e.stopPropagation();
                                          handleDasherDrop(
                                            e,
                                            category.id,
                                            index,
                                          );
                                        }}
                                      >
                                        {/* Dasher Header */}
                                        <div className="flex items-start justify-between p-3">
                                          <div className="flex items-center gap-2 flex-1">
                                            {/* Checkbox for selection (only visible in edit mode) */}
                                            {isEditMode && (
                                              <input
                                                type="checkbox"
                                                checked={selectedItems.dashers.has(
                                                  dasher.id,
                                                )}
                                                onChange={(e) => {
                                                  e.stopPropagation();
                                                  toggleItemSelection(
                                                    "dashers",
                                                    dasher.id,
                                                  );
                                                }}
                                                onClick={(e) =>
                                                  e.stopPropagation()
                                                }
                                                className="w-4 h-4 text-gray-300 bg-gray-700 border-gray-500 rounded focus:ring-gray-400 focus:ring-2"
                                              />
                                            )}
                                            <div
                                              className={`${isEditing ? "text-gray-700 cursor-not-allowed" : "text-gray-400 hover:text-gray-300 cursor-move"}`}
                                              aria-label="Drag to reorder"
                                              style={{
                                                pointerEvents: isEditing
                                                  ? "none"
                                                  : "auto",
                                              }}
                                            >
                                              <GripVertical size={14} />
                                            </div>
                                            <button
                                              onClick={() =>
                                                toggleDasherCollapse(
                                                  category.id,
                                                  dasher.id,
                                                )
                                              }
                                              className="flex items-center gap-2 flex-1 text-left"
                                            >
                                              {isCollapsed ? (
                                                <ChevronDown size={14} />
                                              ) : (
                                                <ChevronUp size={14} />
                                              )}
                                              <div className="flex-1 min-w-0">
                                                <h5 className="font-medium text-sm flex items-center gap-2 truncate">
                                                  {dasherTitle}
                                                  {/* Status Badges */}
                                                  <span
                                                    className="flag-badges"
                                                    aria-label="Dasher status flags (Crimson, Red Card, Appealed, FastPay)"
                                                  >
                                                    <span
                                                      className="flag-badge"
                                                      data-flag="C"
                                                      data-active={
                                                        dasher.crimson
                                                          ? "true"
                                                          : "false"
                                                      }
                                                      data-selected={
                                                        (
                                                          dasher.selectedCashout ||
                                                          ""
                                                        ).toLowerCase() ===
                                                          "crimson"
                                                          ? "true"
                                                          : "false"
                                                      }
                                                      title={
                                                        dasher.crimson
                                                          ? dasher.crimsonAt
                                                            ? `Crimson since ${new Date(dasher.crimsonAt).toLocaleString()}`
                                                            : "Crimson active"
                                                          : "Crimson inactive"
                                                      }
                                                    >
                                                      CRIMSON
                                                    </span>
                                                    <span
                                                      className="flag-badge"
                                                      data-flag="FP"
                                                      data-active={
                                                        dasher.fastPay
                                                          ? "true"
                                                          : "false"
                                                      }
                                                      data-selected={
                                                        (
                                                          dasher.selectedCashout ||
                                                          ""
                                                        ).toLowerCase() ===
                                                          "fastpay"
                                                          ? "true"
                                                          : "false"
                                                      }
                                                      title={
                                                        dasher.fastPay
                                                          ? dasher.fastPayInfo
                                                            ? `FastPay: ${dasher.fastPayInfo}`
                                                            : "FastPay active"
                                                          : "FastPay inactive"
                                                      }
                                                    >
                                                      FastPay
                                                    </span>
                                                    <span
                                                      className="flag-badge"
                                                      data-flag="RC"
                                                      data-active={
                                                        dasher.redCard
                                                          ? "true"
                                                          : "false"
                                                      }
                                                      title={
                                                        dasher.redCard
                                                          ? dasher.redCardAt
                                                            ? `Red Card since ${new Date(dasher.redCardAt).toLocaleString()}`
                                                            : "Red Card active"
                                                          : "Red Card inactive"
                                                      }
                                                    >
                                                      RED CARD
                                                    </span>
                                                    <span
                                                      className="flag-badge"
                                                      data-flag="AP"
                                                      data-active={
                                                        dasher.appealed
                                                          ? "true"
                                                          : "false"
                                                      }
                                                      title={
                                                        dasher.appealed
                                                          ? dasher.appealedAt
                                                            ? `Appealed since ${new Date(dasher.appealedAt).toLocaleString()}`
                                                            : "Appealed active"
                                                          : "Appealed inactive"
                                                      }
                                                    >
                                                      APPEALED
                                                    </span>
                                                  </span>
                                                  {dasher.lastUsed && (
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        resetDasherTimer(
                                                          category.id,
                                                          dasher.id,
                                                        );
                                                      }}
                                                      className="text-orange-400 hover:text-orange-300 p-0.5"
                                                      title="Reset timer"
                                                    >
                                                      <TimerOff
                                                        size={12}
                                                      />
                                                    </button>
                                                  )}
                                                </h5>
                                              </div>
                                            </button>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {/* Unified Category Movement Buttons */}
                                            {renderMoveButtons(
                                              "main",
                                              dasher.id,
                                            )}

                                            {/* Control Buttons Group */}
                                            <div className="flex items-center gap-1">
                                              <button
                                                onClick={() =>
                                                  startDasherTimer(
                                                    category.id,
                                                    dasher.id,
                                                  )
                                                }
                                                className="icon-btn text-purple-400 hover:text-purple-300"
                                                title="Start 24hr timer"
                                                aria-label="Start 24 hour timer"
                                              >
                                                <Timer size={14} />
                                              </button>
                                              <button
                                                onClick={() =>
                                                  toggleEditDasher(
                                                    category.id,
                                                    dasher.id,
                                                  )
                                                }
                                                className={`icon-btn transition-colors ${isEditing
                                                  ? "text-green-400 hover:text-green-300"
                                                  : "text-yellow-400 hover:text-yellow-300"
                                                  }`}
                                                title={
                                                  isEditing
                                                    ? "Save"
                                                    : "Edit"
                                                }
                                                aria-label={
                                                  isEditing
                                                    ? "Save dasher"
                                                    : "Edit dasher"
                                                }
                                              >
                                                {isEditing ? (
                                                  <Check size={14} />
                                                ) : (
                                                  <Edit2 size={14} />
                                                )}
                                              </button>
                                              {parseBalanceValue(
                                                dasher.balance,
                                              ) > 0 && (
                                                  <button
                                                    onClick={() =>
                                                      addCashOutEntry(
                                                        category.id,
                                                        dasher,
                                                        "auto",
                                                      )
                                                    }
                                                    className="icon-btn text-green-300 hover:text-green-200"
                                                    title="Cash Out (zero balance & log entry)"
                                                    aria-label="Cash out balance"
                                                  >
                                                    <Banknote size={16} />
                                                  </button>
                                                )}
                                              <button
                                                onClick={() =>
                                                  deleteDasher(
                                                    category.id,
                                                    dasher.id,
                                                  )
                                                }
                                                className="icon-btn text-red-400 hover:text-red-300"
                                                title="Delete"
                                                aria-label="Delete dasher"
                                              >
                                                <Trash2 size={14} />
                                              </button>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Dasher Details */}
                                        {!isCollapsed && (
                                          <div className="space-y-2 p-3 pt-0 border-t border-gray-600/30">
                                            {renderDasherDetails(
                                              dasher,
                                              category.dashers,
                                              (updater) =>
                                                setDasherCategories(
                                                  (prev) =>
                                                    prev.map((cat) => {
                                                      if (
                                                        cat.id !==
                                                        category.id
                                                      )
                                                        return cat;
                                                      const nextDashers =
                                                        typeof updater ===
                                                          "function"
                                                          ? updater(
                                                            cat.dashers,
                                                          )
                                                          : updater;
                                                      return {
                                                        ...cat,
                                                        dashers:
                                                          nextDashers,
                                                      };
                                                    }),
                                                ),
                                              saveAllToLocalStorage,
                                              copyToClipboard,
                                              timeStatus,
                                              isEditing,
                                              category.id,
                                              editingBalanceValue,
                                              setEditingBalanceValue,
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  },
                                )
                              )}

                              {category.dashers.length === 0 && (
                                <div className="text-center text-gray-500 py-2 text-xs">
                                  No dashers in this category. Click + to
                                  add one.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                  {/* Add New Category Button */}
                  <button
                    onClick={addDasherCategory}
                    className="w-full bg-gray-700/40 hover:bg-gray-700/60 border border-dashed border-gray-600 rounded-lg p-3 text-sm text-gray-300 hover:text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={14} />
                    Add New Category
                  </button>
                </div>
              ) : (
                <Spinner text="Loading dashers…" />
              ))}
          </div>

          {/* Dashers - Ready Section */}
          <div className="bg-gray-800 rounded-lg overflow-hidden mt-3">
            <div
              className="flex items-center justify-between p-4 hover:bg-gray-700/50 transition-colors"
              onKeyDown={(e) => {
                if (
                  e.target !== e.currentTarget &&
                  e.target.tagName !== "BUTTON"
                )
                  return;
                if (e.key === "ArrowLeft") {
                  collapseBucket("ready");
                  e.preventDefault();
                }
                if (e.key === "ArrowRight") {
                  expandBucket("ready");
                  e.preventDefault();
                }
              }}
            >
              <button
                onClick={toggleReadyOpen}
                className="flex items-center gap-3 flex-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                aria-expanded={isReadyDashersOpen ? "true" : "false"}
                aria-controls="bucket-ready"
                type="button"
              >
                <CircleCheck size={20} className="text-green-400" />
                <span className="text-lg font-medium flex items-center gap-2">
                  Ready
                  {renderStableCount(
                    filteredReadyDashers.length,
                    readyDashers.length,
                  )}
                </span>
              </button>
              <div className="flex items-center gap-2 pl-2">
                <BucketChevrons
                  bucketKey="ready"
                  bucketLabel="Ready"
                  isVisible={filteredReadyDashers.length > 0}
                />
                <span className="text-gray-300" aria-hidden="true">
                  {isReadyDashersOpen ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </span>
              </div>
            </div>
            {isReadyDashersOpen &&
              (readyRenderReady ? (

                <div id="bucket-ready" className="mt-2">
                  <div
                    className="dasher-grid"
                    role="table"
                    aria-label="Ready Dashers"
                  >
                    {filteredReadyDashers.length === 0 ? (
                      <div
                        className="text-center text-gray-500 py-8 text-sm italic col-span-full"
                      >
                        No ready dashers
                      </div>
                    ) : (
                      /* Direct rendering without virtualization (bucket sections typically have few items) */
                      filteredReadyDashers.map((dasher, index) => {
                        const isSelected = selectedItems.readyDashers.has(dasher.id);
                        // [PERSISTENCE-FIX v1.9.8] Default collapsed
                        const isCollapsed = collapsedReadyDashers[dasher.id] ?? true;
                        const isEditing = isDasherEditing("ready", dasher.id);
                        const cardRecentlyMoved = recentlyMoved instanceof Set && recentlyMoved.has(dasher.id);
                        const movedNote = dasher.readyAt ? `Ready: ${formatRelativeTime(dasher.readyAt)}` : null;
                        const identityFallback = `ready-${index}`;

                        return React.createElement(DasherCard, {
                          key: dasher.id,
                          dasher: dasher,
                          bucketType: "ready",
                          index: index,
                          isSelected: isSelected,
                          isCollapsed: isCollapsed,
                          isEditing: isEditing,
                          isEditMode: isEditMode,
                          cardRecentlyMoved: cardRecentlyMoved,
                          movedNote: movedNote,
                          identityFallback: identityFallback,
                          onToggleSelect: () => handleToggleSelectReady(dasher.id),
                          onToggleCollapse: () => toggleBucketRowCollapsed("ready", dasher.id),
                          onStartTimer: () => bucketTimerHandlers["ready"].start(dasher.id),
                          onResetTimer: () => bucketTimerHandlers["ready"].reset(dasher.id),
                          onToggleEdit: () => toggleEditDasher("ready", dasher.id),
                          onCashOut: () => addCashOutEntry("ready", dasher, "auto"),
                          onDelete: () => handleDeleteReady(dasher.id),
                          onDraftCommit: onDraftCommit,
                          getDasherTitle: getDasherTitle,
                          renderMoveButtons: renderMoveButtons,
                          renderDasherDetails: renderDasherDetails,
                          dashersArray: readyDashers,
                          setDashersArray: setReadyDashers,
                          saveAllToLocalStorage: saveAllToLocalStorage,
                          copyToClipboard: copyToClipboard,
                          deriveDasherIdentity: deriveDasherIdentity,
                          getDasherAnchorId: getDasherAnchorId,
                          parseBalanceValue: parseBalanceValue,
                          editingBalanceValue: editingBalanceValue,
                          setEditingBalanceValue: setEditingBalanceValue,
                          // [PERF-FIX2] Tab visibility for pausing timers
                          isTabVisible
                        });
                      })
                    )}
                  </div>
                </div>
              ) : (
                <Spinner text="Loading ready dashers…" />
              ))}
          </div>

          {/* Dashers - Currently Using Section */}
          <div className="bg-gray-800 rounded-lg overflow-hidden mt-3">
            <div
              className="flex items-center justify-between p-4 hover:bg-gray-700/50 transition-colors"
              onKeyDown={(e) => {
                if (
                  e.target !== e.currentTarget &&
                  e.target.tagName !== "BUTTON"
                )
                  return;
                if (e.key === "ArrowLeft") {
                  collapseBucket("currently-using");
                  e.preventDefault();
                }
                if (e.key === "ArrowRight") {
                  expandBucket("currently-using");
                  e.preventDefault();
                }
              }}
            >
              <button
                onClick={toggleUsingOpen}
                className="flex items-center gap-3 flex-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                aria-expanded={isCurrentlyUsingDashersOpen ? "true" : "false"}
                aria-controls="bucket-currently-using"
                type="button"
              >
                <Activity size={20} className="text-blue-400" />
                <span className="text-lg font-medium flex items-center gap-2">
                  Using
                  {renderStableCount(
                    filteredCurrentlyUsingDashers.length,
                    currentlyUsingDashers.length,
                  )}
                </span>
              </button>
              <div className="flex items-center gap-2 pl-2">
                <BucketChevrons
                  bucketKey="currently-using"
                  bucketLabel="Currently Using"
                  isVisible={filteredCurrentlyUsingDashers.length > 0}
                />
                <span className="text-gray-300" aria-hidden="true">
                  {isCurrentlyUsingDashersOpen ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </span>
              </div>
            </div>
            {isCurrentlyUsingDashersOpen &&
              (usingRenderReady ? (
                <div
                  id="bucket-currently-using"
                  className="mt-2 px-2 pb-2"
                >
                  <div
                    className="dasher-grid"
                    role="table"
                    aria-label="Currently Using Dashers"
                  >
                    {filteredCurrentlyUsingDashers.length === 0 ? (
                      <div
                        className="text-center text-gray-500 py-8 text-sm italic col-span-full"
                      >
                        No dashers currently in use
                      </div>
                    ) : (
                      filteredCurrentlyUsingDashers.map(
                        (dasher, index) => {
                          const isSelected =
                            selectedItems.currentlyUsingDashers.has(
                              dasher.id,
                            );
                          const isCollapsed =
                            // [PERSISTENCE-FIX v1.9.8] Default collapsed
                            collapsedCurrentlyUsingDashers[dasher.id] ?? true;
                          const isEditing = isDasherEditing(
                            "currently-using",
                            dasher.id,
                          );
                          const dasherTitle = getDasherTitle(dasher);
                          const cardRecentlyMoved =
                            recentlyMoved instanceof Set &&
                            recentlyMoved.has(dasher.id);
                          const movedNote = dasher.currentlyUsingAt
                            ? `Using: ${formatRelativeTime(dasher.currentlyUsingAt)}`
                            : null;
                          const identityFallback = `currently-using-${index}`;
                          const anchorIdentity = deriveDasherIdentity(
                            dasher,
                            identityFallback,
                          );
                          const anchorId =
                            getDasherAnchorId(anchorIdentity);

                          return (
                            <div
                              key={dasher.id}
                              className={`bg-gray-600/50 rounded-lg overflow-visible border border-gray-500/30 transition-opacity ${cardRecentlyMoved ? "ring-2 ring-amber-400/80 animate-pulse" : ""}`}
                              id={anchorId || undefined}
                              data-dasher-anchor={
                                anchorIdentity || undefined
                              }
                            >
                              <div className="flex items-start justify-between p-3">
                                <div className="flex items-center gap-2 flex-1">
                                  {isEditMode && (
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => {
                                        const set = new Set(
                                          selectedItems.currentlyUsingDashers,
                                        );
                                        isSelected
                                          ? set.delete(dasher.id)
                                          : set.add(dasher.id);
                                        setSelectedItems({
                                          ...selectedItems,
                                          currentlyUsingDashers: set,
                                        });
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-4 h-4 text-gray-300 bg-gray-700 border-gray-500 rounded focus:ring-gray-400"
                                    />
                                  )}
                                  <div
                                    className={`${isEditing ? "text-gray-700 cursor-not-allowed" : "text-gray-400 hover:text-gray-300 cursor-move"}`}
                                    aria-label="Drag to reorder"
                                    style={{
                                      pointerEvents: isEditing
                                        ? "none"
                                        : "auto",
                                    }}
                                  >
                                    <GripVertical size={14} />
                                  </div>
                                  <button
                                    onClick={() =>
                                      toggleBucketRowCollapsed(
                                        "currently-using",
                                        dasher.id,
                                      )
                                    }
                                    className="flex items-center gap-2 flex-1 text-left"
                                  >
                                    {isCollapsed ? (
                                      <ChevronDown size={14} />
                                    ) : (
                                      <ChevronUp size={14} />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-medium text-sm flex items-center gap-2 truncate">
                                        {dasherTitle}
                                        <span
                                          className="flag-badges"
                                          aria-label="Dasher status flags (Crimson, Red Card, Appealed, FastPay)"
                                        >
                                          <span
                                            className="flag-badge"
                                            data-flag="C"
                                            data-active={
                                              dasher.crimson
                                                ? "true"
                                                : "false"
                                            }
                                            data-selected={
                                              (
                                                dasher.selectedCashout ||
                                                ""
                                              ).toLowerCase() ===
                                                "crimson"
                                                ? "true"
                                                : "false"
                                            }
                                          >
                                            CRIMSON
                                          </span>
                                          <span
                                            className="flag-badge"
                                            data-flag="FP"
                                            data-active={
                                              dasher.fastPay
                                                ? "true"
                                                : "false"
                                            }
                                            data-selected={
                                              (
                                                dasher.selectedCashout ||
                                                ""
                                              ).toLowerCase() ===
                                                "fastpay"
                                                ? "true"
                                                : "false"
                                            }
                                            title={
                                              dasher.fastPay
                                                ? dasher.fastPayInfo
                                                  ? `FastPay: ${dasher.fastPayInfo}`
                                                  : "FastPay active"
                                                : "FastPay inactive"
                                            }
                                          >
                                            FastPay
                                          </span>
                                          <span
                                            className="flag-badge"
                                            data-flag="RC"
                                            data-active={
                                              dasher.redCard
                                                ? "true"
                                                : "false"
                                            }
                                          >
                                            RED CARD
                                          </span>
                                          <span
                                            className="flag-badge"
                                            data-flag="AP"
                                            data-active={
                                              dasher.appealed
                                                ? "true"
                                                : "false"
                                            }
                                          >
                                            APPEALED
                                          </span>
                                        </span>
                                      </h5>
                                      {movedNote && (
                                        <div className="text-[11px] text-amber-300/80 mt-0.5">
                                          {movedNote}
                                        </div>
                                      )}
                                    </div>
                                  </button>
                                </div>
                                <div className="flex items-center gap-2">
                                  {renderMoveButtons(
                                    "currently-using",
                                    dasher.id,
                                  )}
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() =>
                                        bucketTimerHandlers[
                                          "currently-using"
                                        ].start(dasher.id)
                                      }
                                      className="icon-btn text-purple-400 hover:text-purple-300"
                                      title="Start 24hr timer"
                                      aria-label="Start 24 hour timer"
                                    >
                                      <Timer size={14} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        bucketTimerHandlers[
                                          "currently-using"
                                        ].reset(dasher.id)
                                      }
                                      className="icon-btn text-orange-400 hover:text-orange-300"
                                      title="Reset timer"
                                      aria-label="Reset timer"
                                    >
                                      <TimerOff size={14} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        toggleEditDasher(
                                          "currently-using",
                                          dasher.id,
                                        )
                                      }
                                      className={`icon-btn ${isEditing ? "text-green-400 hover:text-green-300" : "text-yellow-400 hover:text-yellow-300"}`}
                                      title={isEditing ? "Save" : "Edit"}
                                      aria-label={
                                        isEditing
                                          ? "Save dasher"
                                          : "Edit dasher"
                                      }
                                    >
                                      {isEditing ? (
                                        <Check size={14} />
                                      ) : (
                                        <Edit2 size={14} />
                                      )}
                                    </button>
                                    {parseBalanceValue(dasher.balance) >
                                      0 && (
                                        <button
                                          onClick={() =>
                                            addCashOutEntry(
                                              "currently-using",
                                              dasher,
                                              "auto",
                                            )
                                          }
                                          className="icon-btn text-green-300 hover:text-green-200"
                                          title="Cash Out"
                                          aria-label="Cash out balance"
                                        >
                                          <Banknote size={16} />
                                        </button>
                                      )}
                                    <button
                                      onClick={() => {
                                        showConfirm(
                                          "Delete this dasher?",
                                          () => {
                                            setCurrentlyUsingDashers(
                                              (prev) =>
                                                prev.filter(
                                                  (d) => d.id !== dasher.id,
                                                ),
                                            );
                                            requestPersist();
                                          },
                                          { title: "Delete Dasher", confirmText: "Delete", cancelText: "Cancel" },
                                        );
                                      }}
                                      className="icon-btn text-red-400 hover:text-red-300"
                                      title="Delete"
                                      aria-label="Delete dasher"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                              {!isCollapsed && (
                                <div className="border-b border-gray-800 px-4 py-2 bg-gray-900/30">
                                  {renderDasherDetails(
                                    dasher,
                                    currentlyUsingDashers,
                                    setCurrentlyUsingDashers,
                                    saveAllToLocalStorage,
                                    copyToClipboard,
                                    null,
                                    isEditing,
                                    "currently-using",
                                    editingBalanceValue,
                                    setEditingBalanceValue,
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        },
                      )
                    )}
                  </div>
                </div>
              ) : (
                <Spinner text="Loading using dashers…" />
              ))}
          </div>

          {/* Dashers - Appealed Section */}
          <div className="bg-gray-800 rounded-lg overflow-hidden mt-3">
            <div
              className="flex items-center justify-between p-4 hover:bg-gray-700/50 transition-colors"
              onKeyDown={(e) => {
                if (
                  e.target !== e.currentTarget &&
                  e.target.tagName !== "BUTTON"
                )
                  return;
                if (e.key === "ArrowLeft") {
                  collapseBucket("appealed");
                  e.preventDefault();
                }
                if (e.key === "ArrowRight") {
                  expandBucket("appealed");
                  e.preventDefault();
                }
              }}
            >
              <button
                onClick={toggleAppealedOpen}
                className="flex items-center gap-3 flex-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                aria-expanded={isAppealedDashersOpen ? "true" : "false"}
                aria-controls="bucket-appealed"
                type="button"
              >
                <CircleCheck size={20} className="text-amber-400" />
                <span className="text-lg font-medium flex items-center gap-2">
                  Appealed
                  {renderStableCount(
                    filteredAppealedDashers.length,
                    appealedDashers.length,
                  )}
                </span>
              </button>
              <div className="flex items-center gap-2 pl-2">
                <BucketChevrons
                  bucketKey="appealed"
                  bucketLabel="Appealed"
                  isVisible={filteredAppealedDashers.length > 0}
                />
                <span className="text-gray-300" aria-hidden="true">
                  {isAppealedDashersOpen ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </span>
              </div>
            </div>
            {isAppealedDashersOpen &&
              (appealedRenderReady ? (
                <div id="bucket-appealed" className="mt-2 px-2 pb-2">
                  <div
                    className="dasher-grid"
                    role="table"
                    aria-label="Appealed Dashers"
                  >
                    {filteredAppealedDashers.length === 0 ? (
                      <div
                        className="text-center text-gray-500 py-8 text-sm italic col-span-full"
                      >
                        No appealed dashers
                      </div>
                    ) : (
                      filteredAppealedDashers.map((dasher, index) => {
                        const isSelected =
                          selectedItems.appealedDashers.has(dasher.id);
                        const isCollapsed =
                          // [PERSISTENCE-FIX v1.9.8] Default collapsed
                          collapsedAppealedDashers[dasher.id] ?? true;
                        const isEditing = isDasherEditing(
                          "appealed",
                          dasher.id,
                        );
                        const dasherTitle = getDasherTitle(dasher);
                        const cardRecentlyMoved =
                          recentlyMoved instanceof Set &&
                          recentlyMoved.has(dasher.id);
                        const movedNote = dasher.appealedAt
                          ? `Appealed: ${formatRelativeTime(dasher.appealedAt)}`
                          : null;
                        const identityFallback = `appealed-${index}`;
                        const anchorIdentity = deriveDasherIdentity(
                          dasher,
                          identityFallback,
                        );
                        const anchorId =
                          getDasherAnchorId(anchorIdentity);

                        return (
                          <div
                            key={dasher.id}
                            className={`bg-gray-600/50 rounded-lg overflow-visible border border-gray-500/30 transition-opacity ${cardRecentlyMoved ? "ring-2 ring-amber-400/80 animate-pulse" : ""}`}
                            id={anchorId || undefined}
                            data-dasher-anchor={
                              anchorIdentity || undefined
                            }
                          >
                            <div className="flex items-start justify-between p-3">
                              <div className="flex items-center gap-2 flex-1">
                                {isEditMode && (
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {
                                      const set = new Set(
                                        selectedItems.appealedDashers,
                                      );
                                      isSelected
                                        ? set.delete(dasher.id)
                                        : set.add(dasher.id);
                                      setSelectedItems({
                                        ...selectedItems,
                                        appealedDashers: set,
                                      });
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-4 h-4 text-gray-300 bg-gray-700 border-gray-500 rounded focus:ring-gray-400"
                                  />
                                )}
                                <div
                                  className={`${isEditing ? "text-gray-700 cursor-not-allowed" : "text-gray-400 hover:text-gray-300 cursor-move"}`}
                                  aria-label="Drag to reorder"
                                  style={{
                                    pointerEvents: isEditing
                                      ? "none"
                                      : "auto",
                                  }}
                                >
                                  <GripVertical size={14} />
                                </div>
                                <button
                                  onClick={() =>
                                    toggleBucketRowCollapsed(
                                      "appealed",
                                      dasher.id,
                                    )
                                  }
                                  className="flex items-center gap-2 flex-1 text-left"
                                >
                                  {isCollapsed ? (
                                    <ChevronDown size={14} />
                                  ) : (
                                    <ChevronUp size={14} />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-medium text-sm flex items-center gap-2 truncate">
                                      {dasherTitle}
                                      <span
                                        className="flag-badges"
                                        aria-label="Dasher status flags (Crimson, Red Card, Appealed, FastPay)"
                                      >
                                        <span
                                          className="flag-badge"
                                          data-flag="C"
                                          data-active={
                                            dasher.crimson
                                              ? "true"
                                              : "false"
                                          }
                                          data-selected={
                                            (
                                              dasher.selectedCashout || ""
                                            ).toLowerCase() === "crimson"
                                              ? "true"
                                              : "false"
                                          }
                                        >
                                          CRIMSON
                                        </span>
                                        <span
                                          className="flag-badge"
                                          data-flag="FP"
                                          data-active={
                                            dasher.fastPay
                                              ? "true"
                                              : "false"
                                          }
                                          data-selected={
                                            (
                                              dasher.selectedCashout || ""
                                            ).toLowerCase() === "fastpay"
                                              ? "true"
                                              : "false"
                                          }
                                          title={
                                            dasher.fastPay
                                              ? dasher.fastPayInfo
                                                ? `FastPay: ${dasher.fastPayInfo}`
                                                : "FastPay active"
                                              : "FastPay inactive"
                                          }
                                        >
                                          FastPay
                                        </span>
                                        <span
                                          className="flag-badge"
                                          data-flag="RC"
                                          data-active={
                                            dasher.redCard
                                              ? "true"
                                              : "false"
                                          }
                                        >
                                          RED CARD
                                        </span>
                                        <span
                                          className="flag-badge"
                                          data-flag="AP"
                                          data-active={
                                            dasher.appealed
                                              ? "true"
                                              : "false"
                                          }
                                        >
                                          APPEALED
                                        </span>
                                      </span>
                                    </h5>
                                    {movedNote && (
                                      <div className="text-[11px] text-amber-300/80 mt-0.5">
                                        {movedNote}
                                      </div>
                                    )}
                                  </div>
                                </button>
                              </div>
                              <div className="flex items-center gap-2">
                                {renderMoveButtons("appealed", dasher.id)}
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() =>
                                      bucketTimerHandlers[
                                        "appealed"
                                      ].start(dasher.id)
                                    }
                                    className="icon-btn text-purple-400 hover:text-purple-300"
                                    title="Start 24hr timer"
                                    aria-label="Start 24 hour timer"
                                  >
                                    <Timer size={14} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      bucketTimerHandlers[
                                        "appealed"
                                      ].reset(dasher.id)
                                    }
                                    className="icon-btn text-orange-400 hover:text-orange-300"
                                    title="Reset timer"
                                    aria-label="Reset timer"
                                  >
                                    <TimerOff size={14} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      toggleEditDasher(
                                        "appealed",
                                        dasher.id,
                                      )
                                    }
                                    className={`icon-btn ${isEditing ? "text-green-400 hover:text-green-300" : "text-yellow-400 hover:text-yellow-300"}`}
                                    title={isEditing ? "Save" : "Edit"}
                                    aria-label={
                                      isEditing
                                        ? "Save dasher"
                                        : "Edit dasher"
                                    }
                                  >
                                    {isEditing ? (
                                      <Check size={14} />
                                    ) : (
                                      <Edit2 size={14} />
                                    )}
                                  </button>
                                  {parseBalanceValue(dasher.balance) >
                                    0 && (
                                      <button
                                        onClick={() =>
                                          addCashOutEntry(
                                            "appealed",
                                            dasher,
                                            "auto",
                                          )
                                        }
                                        className="icon-btn text-green-300 hover:text-green-200"
                                        title="Cash Out"
                                        aria-label="Cash out balance"
                                      >
                                        <Banknote size={16} />
                                      </button>
                                    )}
                                  <button
                                    onClick={() => {
                                      showConfirm(
                                        "Delete this dasher?",
                                        () => {
                                          setAppealedDashers((prev) =>
                                            prev.filter(
                                              (d) => d.id !== dasher.id,
                                            ),
                                          );
                                          requestPersist();
                                        },
                                        { title: "Delete Dasher", confirmText: "Delete", cancelText: "Cancel" },
                                      );
                                    }}
                                    className="icon-btn text-red-400 hover:text-red-300"
                                    title="Delete"
                                    aria-label="Delete dasher"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                            {!isCollapsed && (
                              <div className="border-b border-gray-800 px-4 py-2 bg-gray-900/30">
                                {renderDasherDetails(
                                  dasher,
                                  appealedDashers,
                                  setAppealedDashers,
                                  saveAllToLocalStorage,
                                  copyToClipboard,
                                  null,
                                  isEditing,
                                  "appealed",
                                  editingBalanceValue,
                                  setEditingBalanceValue,
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                <Spinner text="Loading appealed dashers…" />
              ))}
          </div>

          {/* Dashers - Applied Pending Section */}
          <div className="bg-gray-800 rounded-lg overflow-hidden mt-3">
            <div
              className="flex items-center justify-between p-4 hover:bg-gray-700/50 transition-colors"
              onKeyDown={(e) => {
                if (
                  e.target !== e.currentTarget &&
                  e.target.tagName !== "BUTTON"
                )
                  return;
                if (e.key === "ArrowLeft") {
                  collapseBucket("applied-pending");
                  e.preventDefault();
                }
                if (e.key === "ArrowRight") {
                  expandBucket("applied-pending");
                  e.preventDefault();
                }
              }}
            >
              <button
                onClick={toggleAppliedOpen}
                className="flex items-center gap-3 flex-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                aria-expanded={isAppliedPendingDashersOpen ? "true" : "false"}
                aria-controls="bucket-applied-pending"
                type="button"
              >
                <Clock size={20} className="text-purple-300" />
                <span className="text-lg font-medium flex items-center gap-2">
                  Applied Pending
                  {renderStableCount(
                    filteredAppliedPendingDashers.length,
                    appliedPendingDashers.length,
                  )}
                </span>
              </button>
              <div className="flex items-center gap-2 pl-2">
                <BucketChevrons
                  bucketKey="applied-pending"
                  bucketLabel="Applied Pending"
                  isVisible={filteredAppliedPendingDashers.length > 0}
                />
                <span className="text-gray-300" aria-hidden="true">
                  {isAppliedPendingDashersOpen ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </span>
              </div>
            </div>
            {isAppliedPendingDashersOpen &&
              (appliedRenderReady ? (
                <div
                  id="bucket-applied-pending"
                  className="mt-2 px-2 pb-2"
                >
                  <div
                    className="dasher-grid"
                    role="table"
                    aria-label="Applied Pending Dashers"
                  >
                    {filteredAppliedPendingDashers.length === 0 ? (
                      <div
                        className="text-center text-gray-500 py-8 text-sm italic col-span-full"
                      >
                        No applied pending dashers
                      </div>
                    ) : (
                      filteredAppliedPendingDashers.map(
                        (dasher, index) => {
                          const isSelected =
                            selectedItems.appliedPendingDashers.has(
                              dasher.id,
                            );
                          const isCollapsed =
                            // [PERSISTENCE-FIX v1.9.8] Default collapsed
                            collapsedAppliedPendingDashers[dasher.id] ?? true;
                          const isEditing = isDasherEditing(
                            "applied-pending",
                            dasher.id,
                          );
                          const dasherTitle = getDasherTitle(dasher);
                          const cardRecentlyMoved =
                            recentlyMoved instanceof Set &&
                            recentlyMoved.has(dasher.id);
                          const movedNote = dasher.appliedPendingAt
                            ? `Applied Pending: ${formatRelativeTime(dasher.appliedPendingAt)}`
                            : null;
                          const identityFallback = `applied-pending-${index}`;
                          const anchorIdentity = deriveDasherIdentity(
                            dasher,
                            identityFallback,
                          );
                          const anchorId =
                            getDasherAnchorId(anchorIdentity);

                          return (
                            <div
                              key={dasher.id}
                              className={`bg-gray-600/50 rounded-lg overflow-visible border border-gray-500/30 transition-opacity ${cardRecentlyMoved ? "ring-2 ring-amber-400/80 animate-pulse" : ""}`}
                              id={anchorId || undefined}
                              data-dasher-anchor={
                                anchorIdentity || undefined
                              }
                            >
                              <div className="flex items-center justify-between p-3">
                                <div className="flex items-center gap-2 flex-1">
                                  {isEditMode && (
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => {
                                        const set = new Set(
                                          selectedItems.appliedPendingDashers,
                                        );
                                        isSelected
                                          ? set.delete(dasher.id)
                                          : set.add(dasher.id);
                                        setSelectedItems({
                                          ...selectedItems,
                                          appliedPendingDashers: set,
                                        });
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-4 h-4 text-gray-300 bg-gray-700 border-gray-500 rounded focus:ring-gray-400"
                                    />
                                  )}
                                  <div
                                    className={`${isEditing ? "text-gray-700 cursor-not-allowed" : "text-gray-400 hover:text-gray-300 cursor-move"}`}
                                    aria-label="Drag to reorder"
                                    style={{
                                      pointerEvents: isEditing
                                        ? "none"
                                        : "auto",
                                    }}
                                  >
                                    <GripVertical size={14} />
                                  </div>
                                  <button
                                    onClick={() =>
                                      toggleBucketRowCollapsed(
                                        "applied-pending",
                                        dasher.id,
                                      )
                                    }
                                    className="flex items-center gap-2 flex-1 text-left"
                                  >
                                    {isCollapsed ? (
                                      <ChevronDown size={14} />
                                    ) : (
                                      <ChevronUp size={14} />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-medium text-sm flex items-center gap-2 truncate">
                                        {dasherTitle}
                                        <span
                                          className="flag-badges"
                                          aria-label="Dasher status flags (Crimson, Red Card, Appealed, FastPay)"
                                        >
                                          <span
                                            className="flag-badge"
                                            data-flag="C"
                                            data-active={
                                              dasher.crimson
                                                ? "true"
                                                : "false"
                                            }
                                            data-selected={
                                              (
                                                dasher.selectedCashout ||
                                                ""
                                              ).toLowerCase() ===
                                                "crimson"
                                                ? "true"
                                                : "false"
                                            }
                                          >
                                            CRIMSON
                                          </span>
                                          <span
                                            className="flag-badge"
                                            data-flag="FP"
                                            data-active={
                                              dasher.fastPay
                                                ? "true"
                                                : "false"
                                            }
                                            data-selected={
                                              (
                                                dasher.selectedCashout ||
                                                ""
                                              ).toLowerCase() ===
                                                "fastpay"
                                                ? "true"
                                                : "false"
                                            }
                                            title={
                                              dasher.fastPay
                                                ? dasher.fastPayInfo
                                                  ? `FastPay: ${dasher.fastPayInfo}`
                                                  : "FastPay active"
                                                : "FastPay inactive"
                                            }
                                          >
                                            FastPay
                                          </span>
                                          <span
                                            className="flag-badge"
                                            data-flag="RC"
                                            data-active={
                                              dasher.redCard
                                                ? "true"
                                                : "false"
                                            }
                                          >
                                            RED CARD
                                          </span>
                                          <span
                                            className="flag-badge"
                                            data-flag="AP"
                                            data-active={
                                              dasher.appealed
                                                ? "true"
                                                : "false"
                                            }
                                          >
                                            APPEALED
                                          </span>
                                        </span>
                                      </h5>
                                      {movedNote && (
                                        <div className="text-[11px] text-amber-300/80 mt-0.5">
                                          {movedNote}
                                        </div>
                                      )}
                                    </div>
                                  </button>
                                </div>
                                <div className="flex items-center gap-2">
                                  {renderMoveButtons(
                                    "applied-pending",
                                    dasher.id,
                                  )}
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() =>
                                        toggleEditDasher(
                                          "applied-pending",
                                          dasher.id,
                                        )
                                      }
                                      className={`icon-btn ${isEditing ? "text-green-400 hover:text-green-300" : "text-yellow-400 hover:text-yellow-300"}`}
                                      title={isEditing ? "Save" : "Edit"}
                                      aria-label={
                                        isEditing
                                          ? "Save dasher"
                                          : "Edit dasher"
                                      }
                                    >
                                      {isEditing ? (
                                        <Check size={14} />
                                      ) : (
                                        <Edit2 size={14} />
                                      )}
                                    </button>
                                    {parseBalanceValue(dasher.balance) >
                                      0 && (
                                        <button
                                          onClick={() =>
                                            addCashOutEntry(
                                              "applied-pending",
                                              dasher,
                                              "auto",
                                            )
                                          }
                                          className="icon-btn text-green-300 hover:text-green-200"
                                          title="Cash Out"
                                          aria-label="Cash out balance"
                                        >
                                          <Banknote size={16} />
                                        </button>
                                      )}
                                    <button
                                      onClick={() => {
                                        showConfirm(
                                          "Delete this dasher?",
                                          () => {
                                            setAppliedPendingDashers(
                                              (prev) =>
                                                prev.filter(
                                                  (d) => d.id !== dasher.id,
                                                ),
                                            );
                                            requestPersist();
                                          },
                                          { title: "Delete Dasher", confirmText: "Delete", cancelText: "Cancel" },
                                        );
                                      }}
                                      className="icon-btn text-red-400 hover:text-red-300"
                                      title="Delete"
                                      aria-label="Delete dasher"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                              {!isCollapsed && (
                                <div className="border-b border-gray-800 px-4 py-2 bg-gray-900/30">
                                  {renderDasherDetails(
                                    dasher,
                                    appliedPendingDashers,
                                    setAppliedPendingDashers,
                                    saveAllToLocalStorage,
                                    copyToClipboard,
                                    null,
                                    isEditing,
                                    "applied-pending",
                                    editingBalanceValue,
                                    setEditingBalanceValue,
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        },
                      )
                    )}
                  </div>
                </div>
              ) : (
                <Spinner text="Loading applied pending dashers…" />
              ))}
          </div>

          {/* Dashers - Reverif Section */}
          <div className="bg-gray-800 rounded-lg overflow-hidden mt-3">
            <div
              className="flex items-center justify-between p-4 hover:bg-gray-700/50 transition-colors"
              onKeyDown={(e) => {
                if (
                  e.target !== e.currentTarget &&
                  e.target.tagName !== "BUTTON"
                )
                  return;
                if (e.key === "ArrowLeft") {
                  collapseBucket("reverif");
                  e.preventDefault();
                }
                if (e.key === "ArrowRight") {
                  expandBucket("reverif");
                  e.preventDefault();
                }
              }}
            >
              <button
                onClick={toggleReverifOpen}
                className="flex items-center gap-3 flex-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                aria-expanded={isReverifDashersOpen ? "true" : "false"}
                aria-controls="bucket-reverif"
                type="button"
              >
                <ShieldCheck size={20} className="text-emerald-300" />
                <span className="text-lg font-medium flex items-center gap-2">
                  Reverif
                  {renderStableCount(
                    filteredReverifDashers.length,
                    reverifDashers.length,
                  )}
                </span>
              </button>
              <div className="flex items-center gap-2 pl-2">
                <BucketChevrons
                  bucketKey="reverif"
                  bucketLabel="Reverif"
                  isVisible={filteredReverifDashers.length > 0}
                />
                <span className="text-gray-300" aria-hidden="true">
                  {isReverifDashersOpen ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </span>
              </div>
            </div>
            {isReverifDashersOpen &&
              (reverifRenderReady ? (
                <div id="bucket-reverif" className="mt-2 px-2 pb-2">
                  <div
                    className="dasher-grid"
                    role="table"
                    aria-label="Reverif Dashers"
                  >
                    {filteredReverifDashers.length === 0 ? (
                      <div
                        className="text-center text-gray-500 py-8 text-sm italic col-span-full"
                      >
                        No reverif dashers
                      </div>
                    ) : (
                      filteredReverifDashers.map((dasher, index) => {
                        const isSelected =
                          selectedItems.reverifDashers &&
                            selectedItems.reverifDashers.has
                            ? selectedItems.reverifDashers.has(dasher.id)
                            : false;
                        const isCollapsed =
                          // [PERSISTENCE-FIX v1.9.8] Default collapsed
                          collapsedReverifDashers[dasher.id] ?? true;
                        const isEditing = isDasherEditing(
                          "reverif",
                          dasher.id,
                        );
                        const dasherTitle = getDasherTitle(dasher);
                        const cardRecentlyMoved =
                          recentlyMoved instanceof Set &&
                          recentlyMoved.has(dasher.id);
                        const movedNote = dasher.reverifAt
                          ? `Reverif: ${formatRelativeTime(dasher.reverifAt)}`
                          : null;
                        const identityFallback = `reverif-${index}`;
                        const anchorIdentity = deriveDasherIdentity(
                          dasher,
                          identityFallback,
                        );
                        const anchorId =
                          getDasherAnchorId(anchorIdentity);

                        return (
                          <div
                            key={dasher.id}
                            className={`bg-gray-600/50 rounded-lg overflow-visible border border-gray-500/30 transition-opacity ${cardRecentlyMoved ? "ring-2 ring-amber-400/80 animate-pulse" : ""}`}
                            id={anchorId || undefined}
                            data-dasher-anchor={
                              anchorIdentity || undefined
                            }
                          >
                            <div className="flex items-center justify-between p-3">
                              <div className="flex items-center gap-2 flex-1">
                                {isEditMode && (
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {
                                      const set = new Set(
                                        selectedItems.reverifDashers ||
                                        [],
                                      );
                                      isSelected
                                        ? set.delete(dasher.id)
                                        : set.add(dasher.id);
                                      setSelectedItems({
                                        ...selectedItems,
                                        reverifDashers: set,
                                      });
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-4 h-4 text-gray-300 bg-gray-700 border-gray-500 rounded focus:ring-gray-400"
                                  />
                                )}
                                <div
                                  className={`${isEditing ? "text-gray-700 cursor-not-allowed" : "text-gray-400 hover:text-gray-300 cursor-move"}`}
                                  aria-label="Drag to reorder"
                                  style={{
                                    pointerEvents: isEditing
                                      ? "none"
                                      : "auto",
                                  }}
                                >
                                  <GripVertical size={14} />
                                </div>
                                <button
                                  onClick={() =>
                                    toggleBucketRowCollapsed(
                                      "reverif",
                                      dasher.id,
                                    )
                                  }
                                  className="flex items-center gap-2 flex-1 text-left"
                                >
                                  {isCollapsed ? (
                                    <ChevronDown size={14} />
                                  ) : (
                                    <ChevronUp size={14} />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-medium text-sm flex items-center gap-2 truncate">
                                      {dasherTitle}
                                      <span
                                        className="flag-badges"
                                        aria-label="Dasher status flags (Crimson, Red Card, Appealed, FastPay)"
                                      >
                                        <span
                                          className="flag-badge"
                                          data-flag="C"
                                          data-active={
                                            dasher.crimson
                                              ? "true"
                                              : "false"
                                          }
                                          data-selected={
                                            (
                                              dasher.selectedCashout || ""
                                            ).toLowerCase() === "crimson"
                                              ? "true"
                                              : "false"
                                          }
                                        >
                                          CRIMSON
                                        </span>
                                        <span
                                          className="flag-badge"
                                          data-flag="FP"
                                          data-active={
                                            dasher.fastPay
                                              ? "true"
                                              : "false"
                                          }
                                          data-selected={
                                            (
                                              dasher.selectedCashout || ""
                                            ).toLowerCase() === "fastpay"
                                              ? "true"
                                              : "false"
                                          }
                                          title={
                                            dasher.fastPay
                                              ? dasher.fastPayInfo
                                                ? `FastPay: ${dasher.fastPayInfo}`
                                                : "FastPay active"
                                              : "FastPay inactive"
                                          }
                                        >
                                          FastPay
                                        </span>
                                        <span
                                          className="flag-badge"
                                          data-flag="RC"
                                          data-active={
                                            dasher.redCard
                                              ? "true"
                                              : "false"
                                          }
                                        >
                                          RED CARD
                                        </span>
                                        <span
                                          className="flag-badge"
                                          data-flag="AP"
                                          data-active={
                                            dasher.appealed
                                              ? "true"
                                              : "false"
                                          }
                                        >
                                          APPEALED
                                        </span>
                                      </span>
                                    </h5>
                                    {movedNote && (
                                      <div className="text-[11px] text-amber-300/80 mt-0.5">
                                        {movedNote}
                                      </div>
                                    )}
                                  </div>
                                </button>
                              </div>
                              <div className="flex items-center gap-2">
                                {renderMoveButtons("reverif", dasher.id)}
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() =>
                                      toggleEditDasher(
                                        "reverif",
                                        dasher.id,
                                      )
                                    }
                                    className={`icon-btn ${isEditing ? "text-green-400 hover:text-green-300" : "text-yellow-400 hover:text-yellow-300"}`}
                                    title={isEditing ? "Save" : "Edit"}
                                    aria-label={
                                      isEditing
                                        ? "Save dasher"
                                        : "Edit dasher"
                                    }
                                  >
                                    {isEditing ? (
                                      <Check size={14} />
                                    ) : (
                                      <Edit2 size={14} />
                                    )}
                                  </button>
                                  {parseBalanceValue(dasher.balance) >
                                    0 && (
                                      <button
                                        onClick={() =>
                                          addCashOutEntry(
                                            "reverif",
                                            dasher,
                                            "auto",
                                          )
                                        }
                                        className="icon-btn text-green-300 hover:text-green-200"
                                        title="Cash Out"
                                        aria-label="Cash out balance"
                                      >
                                        <Banknote size={16} />
                                      </button>
                                    )}
                                  <button
                                    onClick={() => {
                                      showConfirm(
                                        "Delete this dasher?",
                                        () => {
                                          setReverifDashers((prev) =>
                                            prev.filter(
                                              (d) => d.id !== dasher.id,
                                            ),
                                          );
                                          requestPersist();
                                        },
                                        { title: "Delete Dasher", confirmText: "Delete", cancelText: "Cancel" },
                                      );
                                    }}
                                    className="icon-btn text-red-400 hover:text-red-300"
                                    title="Delete"
                                    aria-label="Delete dasher"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                            {!isCollapsed && (
                              <div className="border-b border-gray-800 px-4 py-2 bg-gray-900/30">
                                {renderDasherDetails(
                                  dasher,
                                  reverifDashers,
                                  setReverifDashers,
                                  saveAllToLocalStorage,
                                  copyToClipboard,
                                  null,
                                  isEditing,
                                  "reverif",
                                  editingBalanceValue,
                                  setEditingBalanceValue,
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                <Spinner text="Loading reverif dashers…" />
              ))}
          </div>

          {/* Dashers - Locked Section */}
          <div className="bg-gray-800 rounded-lg overflow-hidden mt-3">
            <div
              className="flex items-center justify-between p-4 hover:bg-gray-700/50 transition-colors"
              onKeyDown={(e) => {
                if (
                  e.target !== e.currentTarget &&
                  e.target.tagName !== "BUTTON"
                )
                  return;
                if (e.key === "ArrowLeft") {
                  collapseBucket("locked");
                  e.preventDefault();
                }
                if (e.key === "ArrowRight") {
                  expandBucket("locked");
                  e.preventDefault();
                }
              }}
            >
              <button
                onClick={toggleLockedOpen}
                className="flex items-center gap-3 flex-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                aria-expanded={isLockedDashersOpen ? "true" : "false"}
                aria-controls="bucket-locked"
                type="button"
              >
                <Lock size={20} className="text-gray-400" />
                <span className="text-lg font-medium flex items-center gap-2">
                  Locked
                  {renderStableCount(
                    filteredLockedDashers.length,
                    lockedDashers.length,
                  )}
                </span>
              </button>
              <div className="flex items-center gap-2 pl-2">
                <BucketChevrons
                  bucketKey="locked"
                  bucketLabel="Locked"
                  isVisible={filteredLockedDashers.length > 0}
                />
                <span className="text-gray-300" aria-hidden="true">
                  {isLockedDashersOpen ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </span>
              </div>
            </div>
            {isLockedDashersOpen &&
              (lockedRenderReady ? (
                <div id="bucket-locked" className="mt-2 px-2 pb-2">
                  <div
                    className="dasher-grid"
                    role="table"
                    aria-label="Locked Dashers"
                  >
                    {filteredLockedDashers.length === 0 ? (
                      <div
                        className="text-center text-gray-500 py-8 text-sm italic col-span-full"
                      >
                        No locked dashers
                      </div>
                    ) : (
                      filteredLockedDashers.map((dasher, index) => {
                        const isSelected =
                          selectedItems.lockedDashers.has(dasher.id);
                        const isCollapsed =
                          // [PERSISTENCE-FIX v1.9.8] Default collapsed
                          collapsedLockedDashers[dasher.id] ?? true;
                        const isEditing = isDasherEditing(
                          "locked",
                          dasher.id,
                        );
                        const dasherTitle = getDasherTitle(dasher);
                        const cardRecentlyMoved =
                          recentlyMoved instanceof Set &&
                          recentlyMoved.has(dasher.id);
                        const movedNote = dasher.lockedAt
                          ? `Locked: ${formatRelativeTime(dasher.lockedAt)}`
                          : null;
                        const identityFallback = `locked-${index}`;
                        const anchorIdentity = deriveDasherIdentity(
                          dasher,
                          identityFallback,
                        );
                        const anchorId =
                          getDasherAnchorId(anchorIdentity);

                        return (
                          <div
                            key={dasher.id}
                            className={`bg-gray-600/50 rounded-lg overflow-visible border border-gray-500/30 transition-opacity ${cardRecentlyMoved ? "ring-2 ring-amber-400/80 animate-pulse" : ""}`}
                            id={anchorId || undefined}
                            data-dasher-anchor={
                              anchorIdentity || undefined
                            }
                          >
                            <div className="flex items-center justify-between p-3">
                              <div className="flex items-center gap-2 flex-1">
                                {isEditMode && (
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {
                                      const set = new Set(
                                        selectedItems.lockedDashers,
                                      );
                                      isSelected
                                        ? set.delete(dasher.id)
                                        : set.add(dasher.id);
                                      setSelectedItems({
                                        ...selectedItems,
                                        lockedDashers: set,
                                      });
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-4 h-4 text-gray-300 bg-gray-700 border-gray-500 rounded focus:ring-gray-400"
                                  />
                                )}
                                <div
                                  className={`${isEditing ? "text-gray-700 cursor-not-allowed" : "text-gray-400 hover:text-gray-300 cursor-move"}`}
                                  aria-label="Drag to reorder"
                                  style={{
                                    pointerEvents: isEditing
                                      ? "none"
                                      : "auto",
                                  }}
                                >
                                  <GripVertical size={14} />
                                </div>
                                <button
                                  onClick={() =>
                                    toggleBucketRowCollapsed(
                                      "locked",
                                      dasher.id,
                                    )
                                  }
                                  className="flex items-center gap-2 flex-1 text-left"
                                >
                                  {isCollapsed ? (
                                    <ChevronDown size={14} />
                                  ) : (
                                    <ChevronUp size={14} />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-medium text-sm flex items-center gap-2 truncate">
                                      {dasherTitle}
                                      <span
                                        className="flag-badges"
                                        aria-label="Dasher status flags (Crimson, Red Card, Appealed, FastPay)"
                                      >
                                        <span
                                          className="flag-badge"
                                          data-flag="C"
                                          data-active={
                                            dasher.crimson
                                              ? "true"
                                              : "false"
                                          }
                                          data-selected={
                                            (
                                              dasher.selectedCashout || ""
                                            ).toLowerCase() === "crimson"
                                              ? "true"
                                              : "false"
                                          }
                                        >
                                          CRIMSON
                                        </span>
                                        <span
                                          className="flag-badge"
                                          data-flag="FP"
                                          data-active={
                                            dasher.fastPay
                                              ? "true"
                                              : "false"
                                          }
                                          data-selected={
                                            (
                                              dasher.selectedCashout || ""
                                            ).toLowerCase() === "fastpay"
                                              ? "true"
                                              : "false"
                                          }
                                          title={
                                            dasher.fastPay
                                              ? dasher.fastPayInfo
                                                ? `FastPay: ${dasher.fastPayInfo}`
                                                : "FastPay active"
                                              : "FastPay inactive"
                                          }
                                        >
                                          FastPay
                                        </span>
                                        <span
                                          className="flag-badge"
                                          data-flag="RC"
                                          data-active={
                                            dasher.redCard
                                              ? "true"
                                              : "false"
                                          }
                                        >
                                          RED CARD
                                        </span>
                                        <span
                                          className="flag-badge"
                                          data-flag="AP"
                                          data-active={
                                            dasher.appealed
                                              ? "true"
                                              : "false"
                                          }
                                        >
                                          APPEALED
                                        </span>
                                      </span>
                                    </h5>
                                    {movedNote && (
                                      <div className="text-[11px] text-amber-300/80 mt-0.5">
                                        {movedNote}
                                      </div>
                                    )}
                                  </div>
                                </button>
                              </div>
                              <div className="flex items-center gap-2">
                                {renderMoveButtons("locked", dasher.id)}
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() =>
                                      toggleEditDasher(
                                        "locked",
                                        dasher.id,
                                      )
                                    }
                                    className={`icon-btn ${isEditing ? "text-green-400 hover:text-green-300" : "text-yellow-400 hover:text-yellow-300"}`}
                                    title={isEditing ? "Save" : "Edit"}
                                    aria-label={
                                      isEditing
                                        ? "Save dasher"
                                        : "Edit dasher"
                                    }
                                  >
                                    {isEditing ? (
                                      <Check size={14} />
                                    ) : (
                                      <Edit2 size={14} />
                                    )}
                                  </button>
                                  {parseBalanceValue(dasher.balance) >
                                    0 && (
                                      <button
                                        onClick={() =>
                                          addCashOutEntry(
                                            "locked",
                                            dasher,
                                            "auto",
                                          )
                                        }
                                        className="icon-btn text-green-300 hover:text-green-200"
                                        title="Cash Out"
                                        aria-label="Cash out balance"
                                      >
                                        <Banknote size={16} />
                                      </button>
                                    )}
                                  <button
                                    onClick={() => {
                                      showConfirm(
                                        "Delete this dasher?",
                                        () => {
                                          setLockedDashers((prev) =>
                                            prev.filter(
                                              (d) => d.id !== dasher.id,
                                            ),
                                          );
                                          requestPersist();
                                        },
                                        { title: "Delete Dasher", confirmText: "Delete", cancelText: "Cancel" },
                                      );
                                    }}
                                    className="icon-btn text-red-400 hover:text-red-300"
                                    title="Delete"
                                    aria-label="Delete dasher"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                            {!isCollapsed && (
                              <div className="border-b border-gray-800 px-4 py-2 bg-gray-900/30">
                                {renderDasherDetails(
                                  dasher,
                                  lockedDashers,
                                  setLockedDashers,
                                  saveAllToLocalStorage,
                                  copyToClipboard,
                                  null,
                                  isEditing,
                                  "locked",
                                  editingBalanceValue,
                                  setEditingBalanceValue,
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                <Spinner text="Loading locked dashers…" />
              ))}
          </div>

          {/* Dashers - Deactivated Section */}
          <div className="bg-gray-800 rounded-lg overflow-hidden mt-3">
            <div
              className="flex items-center justify-between p-4 hover:bg-gray-700/50 transition-colors"
              onKeyDown={(e) => {
                if (
                  e.target !== e.currentTarget &&
                  e.target.tagName !== "BUTTON"
                )
                  return;
                if (e.key === "ArrowLeft") {
                  collapseBucket("deactivated");
                  e.preventDefault();
                }
                if (e.key === "ArrowRight") {
                  expandBucket("deactivated");
                  e.preventDefault();
                }
              }}
            >
              <button
                onClick={toggleDeactivatedOpen}
                className="flex items-center gap-3 flex-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                aria-expanded={isDeactivatedDashersOpen ? "true" : "false"}
                aria-controls="bucket-deactivated"
                type="button"
              >
                <UserX size={20} className="text-red-400" />
                <span className="text-lg font-medium flex items-center gap-2">
                  Deactivated
                  {renderStableCount(
                    filteredDeactivatedDashers.length,
                    deactivatedDashers.length,
                  )}
                </span>
              </button>
              <div className="flex items-center gap-2 pl-2">
                <BucketChevrons
                  bucketKey="deactivated"
                  bucketLabel="Deactivated"
                  isVisible={filteredDeactivatedDashers.length > 0}
                />
                <span className="text-gray-300" aria-hidden="true">
                  {isDeactivatedDashersOpen ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </span>
              </div>
            </div>
            {isDeactivatedDashersOpen &&
              (deactivatedRenderReady ? (
                <div
                  id="bucket-deactivated"
                  className="p-4 pt-2 space-y-2"
                >
                  {deactivatedDashers.length === 0 ? (
                    <div className="text-center text-gray-500 py-8 text-sm italic">
                      No deactivated dashers
                    </div>
                  ) : (
                    filteredDeactivatedDashers.map((dasher, index) => {
                      const isEditing = isDasherEditing(
                        "deactivated",
                        dasher.id,
                      );
                      const isCollapsed =
                        // [PERSISTENCE-FIX v1.9.8] Default collapsed
                        collapsedDeactivatedDashers[dasher.id] ?? true;
                      const timeStatus = calculateDasherTimeStatus(
                        dasher.lastUsed,
                        dasher.id
                      );
                      const dasherTitle = getDasherTitle(dasher);
                      const identityFallback = `deactivated-${index}`;
                      const anchorIdentity = deriveDasherIdentity(
                        dasher,
                        identityFallback,
                      );
                      const anchorId = getDasherAnchorId(anchorIdentity);

                      return (
                        <div
                          key={dasher.id}
                          className={`bg-gray-600/50 rounded-lg overflow-visible border border-gray-500/30 transition-opacity dasher-card--deactivated ${dasher.ready ? "dasher-card--ready" : ""
                            } ${dasher.appealed ? "dasher-card--appealed" : ""
                            }`}
                          id={anchorId || undefined}
                          data-dasher-anchor={anchorIdentity || undefined}
                        >
                          {/* Dasher Header */}
                          <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-2 flex-1">
                              {/* Checkbox for selection (only visible in edit mode) */}
                              {isEditMode && (
                                <input
                                  type="checkbox"
                                  checked={
                                    selectedItems.deactivatedDashers &&
                                      selectedItems.deactivatedDashers.has
                                      ? selectedItems.deactivatedDashers.has(
                                        dasher.id,
                                      )
                                      : false
                                  }
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    toggleItemSelection(
                                      "deactivatedDashers",
                                      dasher.id,
                                    );
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-4 h-4 text-gray-300 bg-gray-700 border-gray-500 rounded focus:ring-gray-400 focus:ring-2"
                                />
                              )}
                              <div
                                className={`${isEditing ? "text-gray-700 cursor-not-allowed" : "text-gray-400 hover:text-gray-300 cursor-move"}`}
                                aria-label="Drag to reorder"
                                style={{
                                  pointerEvents: isEditing
                                    ? "none"
                                    : "auto",
                                }}
                              >
                                <GripVertical size={14} />
                              </div>
                              <button
                                onClick={() =>
                                  toggleBucketRowCollapsed(
                                    "deactivated",
                                    dasher.id,
                                  )
                                }
                                className="flex items-center gap-2 flex-1 text-left"
                              >
                                {isCollapsed ? (
                                  <ChevronDown size={14} />
                                ) : (
                                  <ChevronUp size={14} />
                                )}
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-medium text-sm flex items-center gap-2 truncate">
                                    {dasherTitle}
                                    {/* Status Badges */}
                                    <span
                                      className="flag-badges"
                                      aria-label="Dasher status flags (Crimson, Red Card, Appealed, FastPay)"
                                    >
                                      <span
                                        className="flag-badge"
                                        data-flag="C"
                                        data-active={
                                          dasher.crimson
                                            ? "true"
                                            : "false"
                                        }
                                        data-selected={
                                          (
                                            dasher.selectedCashout || ""
                                          ).toLowerCase() === "crimson"
                                            ? "true"
                                            : "false"
                                        }
                                        title={
                                          dasher.crimson
                                            ? dasher.crimsonAt
                                              ? `Crimson since ${new Date(dasher.crimsonAt).toLocaleString()}`
                                              : "Crimson active"
                                            : "Crimson inactive"
                                        }
                                      >
                                        CRIMSON
                                      </span>
                                      <span
                                        className="flag-badge"
                                        data-flag="FP"
                                        data-active={
                                          dasher.fastPay
                                            ? "true"
                                            : "false"
                                        }
                                        data-selected={
                                          (
                                            dasher.selectedCashout || ""
                                          ).toLowerCase() === "fastpay"
                                            ? "true"
                                            : "false"
                                        }
                                        title={
                                          dasher.fastPay
                                            ? dasher.fastPayInfo
                                              ? `FastPay: ${dasher.fastPayInfo}`
                                              : "FastPay active"
                                            : "FastPay inactive"
                                        }
                                      >
                                        FastPay
                                      </span>
                                      <span
                                        className="flag-badge"
                                        data-flag="RC"
                                        data-active={
                                          dasher.redCard
                                            ? "true"
                                            : "false"
                                        }
                                        title={
                                          dasher.redCard
                                            ? dasher.redCardAt
                                              ? `Red Card since ${new Date(dasher.redCardAt).toLocaleString()}`
                                              : "Red Card active"
                                            : "Red Card inactive"
                                        }
                                      >
                                        RED CARD
                                      </span>
                                      <span
                                        className="flag-badge"
                                        data-flag="AP"
                                        data-active={
                                          dasher.appealed
                                            ? "true"
                                            : "false"
                                        }
                                        title={
                                          dasher.appealed
                                            ? dasher.appealedAt
                                              ? `Appealed since ${new Date(dasher.appealedAt).toLocaleString()}`
                                              : "Appealed active"
                                            : "Appealed inactive"
                                        }
                                      >
                                        APPEALED
                                      </span>
                                    </span>
                                    {dasher.lastUsed && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          resetDasherTimer(
                                            "deactivated",
                                            dasher.id,
                                          );
                                        }}
                                        className="text-orange-400 hover:text-orange-300 p-0.5"
                                        title="Reset timer"
                                      >
                                        <TimerOff size={12} />
                                      </button>
                                    )}
                                  </h5>
                                </div>
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Category Movement Group */}
                              {renderMoveButtons(
                                "deactivated",
                                dasher.id,
                              )}

                              {/* Control Buttons Group */}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    startDasherTimer(
                                      "deactivated",
                                      dasher.id,
                                    )
                                  }
                                  className="icon-btn text-purple-400 hover:text-purple-300"
                                  title="Start Timer"
                                >
                                  <Timer size={14} />
                                </button>
                                {parseBalanceValue(dasher.balance) >
                                  0 && (
                                    <button
                                      onClick={() =>
                                        addCashOutEntry(
                                          "deactivated",
                                          dasher,
                                          "auto",
                                        )
                                      }
                                      className="icon-btn text-green-300 hover:text-green-200"
                                      title="Cash Out"
                                    >
                                      <Banknote size={16} />
                                    </button>
                                  )}
                                <button
                                  onClick={() =>
                                    toggleEditDasher(
                                      "deactivated",
                                      dasher.id,
                                    )
                                  }
                                  className={`icon-btn ${isEditing ? "text-green-400 hover:text-green-300" : "text-yellow-400 hover:text-yellow-300"}`}
                                  title={isEditing ? "Save" : "Edit"}
                                  aria-label={
                                    isEditing
                                      ? "Save dasher"
                                      : "Edit dasher"
                                  }
                                >
                                  {isEditing ? (
                                    <Check size={14} />
                                  ) : (
                                    <Edit2 size={14} />
                                  )}
                                </button>
                                <button
                                  onClick={() =>
                                    deleteDasher("deactivated", dasher.id)
                                  }
                                  className="icon-btn text-red-400 hover:text-red-300"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Dasher Details (shared renderer) */}
                          {!isCollapsed && (
                            <div className="space-y-2 p-3 pt-0 border-t border-gray-600/30">
                              {renderDasherDetails(
                                dasher,
                                deactivatedDashers,
                                setDeactivatedDashers,
                                saveAllToLocalStorage,
                                copyToClipboard,
                                timeStatus,
                                isEditing,
                                "deactivated",
                                editingBalanceValue,
                                setEditingBalanceValue,
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                <Spinner text="Loading deactivated dashers…" />
              ))}
          </div>
          <div className="bg-gray-800 rounded-lg overflow-hidden mt-3">
            <div
              className="flex items-center justify-between p-4 hover:bg-gray-700/50 transition-colors"
              onKeyDown={(e) => {
                if (
                  e.target !== e.currentTarget &&
                  e.target.tagName !== "BUTTON"
                )
                  return;
                if (e.key === "ArrowLeft") {
                  collapseBucket("archived");
                  e.preventDefault();
                }
                if (e.key === "ArrowRight") {
                  expandBucket("archived");
                  e.preventDefault();
                }
              }}
            >
              <button
                onClick={toggleArchivedOpen}
                className="flex items-center gap-3 flex-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                aria-expanded={isArchivedDashersOpen ? "true" : "false"}
                aria-controls="bucket-archived"
                type="button"
              >
                <Archive size={20} className="text-amber-400" />
                <span className="text-lg font-medium flex items-center gap-2">
                  Archived
                  {renderStableCount(
                    filteredArchivedDashers.length,
                    archivedDashers.length,
                  )}
                </span>
              </button>
              <div className="flex items-center gap-2 pl-2">
                <BucketChevrons
                  bucketKey="archived"
                  bucketLabel="Archived"
                  isVisible={filteredArchivedDashers.length > 0}
                />
                <span className="text-gray-300" aria-hidden="true">
                  {isArchivedDashersOpen ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </span>
              </div>
            </div>

            {isArchivedDashersOpen &&
              (archivedRenderReady ? (
                <div
                  id="bucket-archived"
                  className="border-t border-gray-700 p-4 space-y-3"
                >
                  {archivedDashers.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">
                      No archived dashers
                    </p>
                  ) : (
                    filteredArchivedDashers.map((dasher, index) => {
                      const isEditing = isDasherEditing(
                        "archived",
                        dasher.id,
                      );
                      const timeStatus = calculateDasherTimeStatus(
                        dasher.lastUsed,
                        dasher.id
                      );
                      const dasherTitle = getDasherTitle(dasher);
                      const isCollapsed = isArchivedDasherCollapsed(
                        dasher.id,
                      );
                      const identityFallback = `archived-${index}`;
                      const anchorIdentity = deriveDasherIdentity(
                        dasher,
                        identityFallback,
                      );
                      const anchorId = getDasherAnchorId(anchorIdentity);
                      const archivedDate = new Date(dasher.archivedAt);
                      const formattedArchiveDate =
                        archivedDate.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        });

                      return (
                        <div
                          key={dasher.id}
                          className="bg-gray-600/50 rounded-lg overflow-visible border border-gray-500/30"
                          id={anchorId || undefined}
                          data-dasher-anchor={anchorIdentity || undefined}
                        >
                          {/* Archived Dasher Header */}
                          <div className="flex items-center justify-between p-3">
                            <div className="flex items-center gap-2 flex-1">
                              {/* Checkbox for selection (only visible in edit mode) */}
                              {isEditMode && (
                                <input
                                  type="checkbox"
                                  checked={selectedItems.archivedDashers.has(
                                    dasher.id,
                                  )}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    toggleItemSelection(
                                      "archivedDashers",
                                      dasher.id,
                                    );
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-4 h-4 text-gray-300 bg-gray-700 border-gray-500 rounded focus:ring-gray-400 focus:ring-2"
                                />
                              )}
                              <button
                                onClick={() =>
                                  toggleArchivedDasherCollapse(dasher.id)
                                }
                                className="flex items-center gap-2 flex-1 text-left"
                              >
                                {isCollapsed ? (
                                  <ChevronDown size={14} />
                                ) : (
                                  <ChevronUp size={14} />
                                )}
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-medium text-sm flex items-center gap-2 truncate">
                                    {dasherTitle}
                                    <span
                                      className="flag-badges"
                                      aria-label="Dasher status flags (Crimson, Red Card, Appealed, FastPay)"
                                    >
                                      <span
                                        className="flag-badge"
                                        data-flag="C"
                                        data-active={
                                          dasher.crimson
                                            ? "true"
                                            : "false"
                                        }
                                        data-selected={
                                          (
                                            dasher.selectedCashout || ""
                                          ).toLowerCase() === "crimson"
                                            ? "true"
                                            : "false"
                                        }
                                      >
                                        CRIMSON
                                      </span>
                                      <span
                                        className="flag-badge"
                                        data-flag="FP"
                                        data-active={
                                          dasher.fastPay
                                            ? "true"
                                            : "false"
                                        }
                                        data-selected={
                                          (
                                            dasher.selectedCashout || ""
                                          ).toLowerCase() === "fastpay"
                                            ? "true"
                                            : "false"
                                        }
                                        title={
                                          dasher.fastPay
                                            ? dasher.fastPayInfo
                                              ? `FastPay: ${dasher.fastPayInfo}`
                                              : "FastPay active"
                                            : "FastPay inactive"
                                        }
                                      >
                                        FastPay
                                      </span>
                                      <span
                                        className="flag-badge"
                                        data-flag="RC"
                                        data-active={
                                          dasher.redCard
                                            ? "true"
                                            : "false"
                                        }
                                      >
                                        RED CARD
                                      </span>
                                      <span
                                        className="flag-badge"
                                        data-flag="AP"
                                        data-active={
                                          dasher.appealed
                                            ? "true"
                                            : "false"
                                        }
                                      >
                                        APPEALED
                                      </span>
                                    </span>
                                    {dasher.lastUsed && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setArchivedDashers((prev) =>
                                            prev.map((d) =>
                                              d.id === dasher.id
                                                ? { ...d, lastUsed: null }
                                                : d,
                                            ),
                                          );
                                        }}
                                        className="text-orange-400 hover:text-orange-300 p-0.5"
                                        title="Reset timer"
                                      >
                                        <TimerOff size={12} />
                                      </button>
                                    )}
                                  </h5>
                                  <p className="text-xs text-amber-400/70 mt-1">
                                    Archived: {formattedArchiveDate}
                                  </p>
                                </div>
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Category Movement Group */}
                              {renderMoveButtons("archived", dasher.id)}

                              {/* Control Buttons Group */}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    const updated = archivedDashers.map(
                                      (d) =>
                                        d.id === dasher.id
                                          ? {
                                            ...d,
                                            lastUsed:
                                              new Date().toISOString(),
                                          }
                                          : d,
                                    );
                                    setArchivedDashers(updated);
                                    requestPersist();
                                  }}
                                  className="icon-btn text-purple-400 hover:text-purple-300"
                                  title="Start Timer"
                                >
                                  <Timer size={14} />
                                </button>
                                {parseBalanceValue(dasher.balance) >
                                  0 && (
                                    <button
                                      onClick={() =>
                                        addCashOutEntry(
                                          "archived",
                                          dasher,
                                          "auto",
                                        )
                                      }
                                      className="icon-btn text-green-300 hover:text-green-200"
                                      title="Cash Out"
                                    >
                                      <Banknote size={16} />
                                    </button>
                                  )}
                                <button
                                  onClick={() =>
                                    toggleEditDasher(
                                      "archived",
                                      dasher.id,
                                    )
                                  }
                                  className={`icon-btn ${isEditing ? "text-green-400 hover:text-green-300" : "text-yellow-400 hover:text-yellow-300"}`}
                                  title={isEditing ? "Save" : "Edit"}
                                  aria-label={
                                    isEditing
                                      ? "Save dasher"
                                      : "Edit dasher"
                                  }
                                >
                                  {isEditing ? (
                                    <Check size={14} />
                                  ) : (
                                    <Edit2 size={14} />
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    setArchivedDashers(
                                      archivedDashers.filter(
                                        (d) => d.id !== dasher.id,
                                      ),
                                    );
                                    requestPersist();
                                  }}
                                  className="icon-btn text-red-400 hover:text-red-300"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Dasher Details (shared renderer) */}
                          {!isCollapsed && (
                            <div className="space-y-2 p-3 pt-0 border-t border-gray-600/30">
                              {renderDasherDetails(
                                dasher,
                                archivedDashers,
                                setArchivedDashers,
                                saveAllToLocalStorage,
                                copyToClipboard,
                                timeStatus,
                                isEditing,
                                "archived",
                                editingBalanceValue,
                                setEditingBalanceValue,
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                <Spinner text="Loading archived dashers…" />
              ))}
          </div>

          {/* ========== ANALYTICS & DATA SECTION ========== */}
          <div className="flex items-center gap-3 my-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent opacity-50"></div>
            <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">
              Analytics & Data
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent opacity-50"></div>
          </div>

          {/* Statistics Section */}
          <StatisticsSection><div className="bg-gray-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setIsStatisticsOpen(!isStatisticsOpen)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700/50 transition-colors"
              aria-expanded={isStatisticsOpen ? "true" : "false"}
              aria-label="Toggle statistics section"
            >
              <div className="flex items-center gap-3">
                <BarChart3 size={20} className="text-cyan-400" />
                <span className="text-lg font-medium">Statistics</span>
              </div>
              {isStatisticsOpen ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>

            {isStatisticsOpen && (
              <div className="border-t border-gray-700 p-4 space-y-4">
                {/* Quick Add Earning */}
                <div className="bg-gray-700/30 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-amber-200">
                      Add Earning
                    </h4>
                  </div>
                  {(() => {
                    const parsedQuickAmount =
                      deriveNumericAmount(statEarningAmount);

                    const onAdd = () => {
                      const targetKey = statEarningTargetKey;
                      const descriptor = targetKey
                        ? dashersMetaKeyMap.get(targetKey)
                        : null;
                      const amt = deriveNumericAmount(statEarningAmount);
                      if (
                        !descriptor ||
                        !Number.isFinite(amt) ||
                        amt <= 0
                      )
                        return;

                      const source =
                        (statEarningSource || "manual").trim() ||
                        "manual";
                      const notes = (statEarningNotes || "").trim();
                      const nowIso = new Date().toISOString();
                      const applyBump = !!statEarningApply;

                      const produceUpdatedDasher = (dasher) => {
                        const history = ensureArray(
                          dasher?.earningsHistory,
                        );
                        const next = {
                          ...dasher,
                          earningsHistory: [
                            ...history,
                            { amount: amt, at: nowIso, source },
                          ],
                        };
                        if (applyBump) {
                          const currentBalance = parseBalanceValue(
                            dasher?.balance,
                          );
                          next.balance = (
                            currentBalance + amt
                          ).toString();
                        }
                        if (notes) {
                          const stamped = `[earning ${amt.toFixed(2)}] ${notes}`;
                          next.notes = dasher?.notes
                            ? `${dasher.notes}\n${stamped}`
                            : stamped;
                        }
                        return next;
                      };

                      const identity = identityForMeta(descriptor.meta);
                      const targets = dasherSelectOptions
                        .map((option) =>
                          dashersMetaKeyMap.get(option.key),
                        )
                        .filter(
                          (entry) =>
                            entry &&
                            identityForMeta(entry.meta) === identity,
                        );

                      const mutationTargets =
                        targets.length > 0 ? targets : [descriptor];
                      mutationTargets.forEach((targetMeta) => {
                        mutateDasherByMeta(
                          targetMeta,
                          produceUpdatedDasher,
                        );
                      });

                      requestPersist();
                      setStatEarningTargetKey("");
                      setStatEarningAmount("");
                      setStatEarningSource("");
                      setStatEarningNotes("");
                      setStatEarningApply(true);
                    };

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
                        <label className="text-[11px] text-gray-400 flex flex-col">
                          <span>Dasher</span>
                          <select
                            className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-gray-200"
                            value={statEarningTargetKey}
                            onChange={(e) =>
                              setStatEarningTargetKey(e.target.value)
                            }
                            aria-label="Select dasher for earning"
                          >
                            <option value="">Select…</option>
                            {dasherSelectOptions.map(({ key, meta }) => {
                              const displayName =
                                meta.dasher?.name ||
                                meta.dasher?.id ||
                                "Unnamed";
                              return (
                                <option key={key} value={key}>
                                  {displayName} • {meta.bucketLabel}
                                </option>
                              );
                            })}
                          </select>
                        </label>
                        <label className="text-[11px] text-gray-400 flex flex-col">
                          <span>Amount</span>
                          <input
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            min="0"
                            className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-gray-200"
                            value={statEarningAmount}
                            onChange={(e) =>
                              setStatEarningAmount(e.target.value)
                            }
                            placeholder="0.00"
                          />
                        </label>
                        <label className="text-[11px] text-gray-400 flex flex-col">
                          <span>Source</span>
                          <input
                            type="text"
                            className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-gray-200"
                            value={statEarningSource}
                            onChange={(e) =>
                              setStatEarningSource(e.target.value)
                            }
                            placeholder="manual / tips / etc"
                          />
                        </label>
                        <label className="text-[11px] text-gray-400 flex flex-col md:col-span-2">
                          <span>Notes</span>
                          <input
                            type="text"
                            className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-gray-200"
                            value={statEarningNotes}
                            onChange={(e) =>
                              setStatEarningNotes(e.target.value)
                            }
                            placeholder="optional note"
                          />
                        </label>
                        <div className="flex items-center gap-3 md:col-span-5">
                          <label className="text-[11px] text-gray-300 inline-flex items-center gap-1">
                            <input
                              type="checkbox"
                              className="accent-emerald-500"
                              checked={!!statEarningApply}
                              onChange={(e) =>
                                setStatEarningApply(e.target.checked)
                              }
                            />
                            <span>Also increase balance</span>
                          </label>
                          <button
                            className="ml-auto px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-xs"
                            onClick={onAdd}
                            disabled={
                              !statEarningTargetKey ||
                              !Number.isFinite(parsedQuickAmount) ||
                              parsedQuickAmount <= 0
                            }
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                {/* Earnings (Last 24h / 7d / 30d) */}
                <div className="bg-gray-700/40 rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-medium text-amber-300">
                      Earnings
                    </h4>
                  </div>
                  {(() => {
                    const now = Date.now();
                    const summaries = computeRollingWindowSummaries(
                      earningEntries,
                      {
                        now,
                        groupAccessor: (entry) =>
                          entry.group || "unspecified",
                      },
                    );

                    const windowConfig = [
                      {
                        key: "24h",
                        label: "Last 24 hours",
                        accent: "text-amber-300",
                      },
                      {
                        key: "7d",
                        label: "Last 7 days",
                        accent: "text-yellow-300",
                      },
                      {
                        key: "30d",
                        label: "Last 30 days",
                        accent: "text-orange-300",
                      },
                    ];

                    const formatSourceLabel = (src) =>
                      methodLabel(src || "unspecified");

                    const Row = ({ config }) => {
                      const summary = summaries[config.key] || {
                        total: 0,
                        count: 0,
                        byGroup: {},
                      };
                      const breakdown = Object.entries(
                        summary.byGroup || {},
                      ).sort(([, a], [, b]) => b - a);

                      return (
                        <div className="border border-gray-600/60 rounded-md p-2 bg-gray-800/40">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400">
                              {config.label}
                            </span>
                            <span
                              className={`font-medium ${config.accent}`}
                            >
                              ${summary.total.toFixed(2)}{" "}
                              <span className="text-gray-400 ml-1">
                                ({summary.count})
                              </span>
                            </span>
                          </div>
                          {breakdown.length > 0 && (
                            <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-gray-300">
                              {breakdown.map(([src, amt]) => (
                                <div
                                  key={`${config.key}-${src}`}
                                  className="flex justify-between items-center"
                                >
                                  <span className="text-gray-500">
                                    {formatSourceLabel(src)}:
                                  </span>
                                  <span>${amt.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    };

                    return (
                      <div className="space-y-2">
                        {windowConfig.map((cfg) => (
                          <Row key={cfg.key} config={cfg} />
                        ))}
                      </div>
                    );
                  })()}
                </div>
                {/* Cash‑outs (Last 24h / 7d / 30d) */}
                <div className="bg-gray-700/40 rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-medium text-green-300">
                      Cash‑outs
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {/* Method Filter */}
                      <label className="flex items-center gap-1 text-gray-400">
                        <span>Method</span>
                        <select
                          className="db-input-sm"
                          value={cashFilterMethod}
                          onChange={(e) =>
                            setCashFilterMethod(e.target.value)
                          }
                          aria-label="Filter cash-outs by method"
                        >
                          <option value="">All</option>
                          {availableCashMethods.map((m) => (
                            <option key={m || "unspecified"} value={m}>
                              {methodLabel(m)}
                            </option>
                          ))}
                        </select>
                      </label>

                      {/* Category Filter */}
                      <label className="flex items-center gap-1 text-gray-400">
                        <span>Category</span>
                        <select
                          className="db-input-sm"
                          value={cashFilterCategory}
                          onChange={(e) =>
                            setCashFilterCategory(e.target.value)
                          }
                          aria-label="Filter cash-outs by category"
                        >
                          <option value="">All</option>
                          {dasherCategories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                          <option value="ready">Ready</option>
                          <option value="currently-using">
                            Currently using
                          </option>
                          <option value="appealed">Appealed</option>
                          <option value="applied-pending">
                            Applied Pending
                          </option>
                          <option value="reverif">Reverif</option>
                          <option value="locked">Locked</option>
                          <option value="deactivated">Deactivated</option>
                          <option value="archived">Archived</option>
                        </select>
                      </label>

                      {/* Dasher Filter */}
                      <label className="flex items-center gap-1 text-gray-400">
                        <span>Dasher</span>
                        <input
                          type="text"
                          className="db-input-sm placeholder-gray-500"
                          placeholder="name or id"
                          value={cashFilterDasher}
                          onChange={(e) =>
                            setCashFilterDasher(e.target.value)
                          }
                          aria-label="Filter cash-outs by dasher name or ID"
                        />
                      </label>
                    </div>
                  </div>
                  {(() => {
                    const now = Date.now();
                    const normalizedMethod = cashFilterMethod
                      ? cashFilterMethod.trim().toLowerCase()
                      : "";
                    const dasherQuery = (cashFilterDasher || "")
                      .trim()
                      .toLowerCase();

                    const filteredEntries = cashOutEntries.filter(
                      (entry) => {
                        if (
                          normalizedMethod &&
                          entry.group !== normalizedMethod
                        )
                          return false;
                        if (cashFilterCategory) {
                          if (
                            !entry.buckets ||
                            !entry.buckets.has(String(cashFilterCategory))
                          )
                            return false;
                        }
                        if (dasherQuery) {
                          const ids = Array.from(entry.dasherIds || []);
                          const names = Array.from(
                            entry.dasherNames || [],
                          );
                          const matchesId = ids.some((id) =>
                            id.includes(dasherQuery),
                          );
                          const matchesName = names.some((name) =>
                            name.includes(dasherQuery),
                          );
                          if (!matchesId && !matchesName) return false;
                        }
                        return true;
                      },
                    );

                    const summaries = computeRollingWindowSummaries(
                      filteredEntries,
                      {
                        now,
                        groupAccessor: (entry) =>
                          entry.group || "unspecified",
                      },
                    );

                    const windowConfig = [
                      {
                        key: "24h",
                        label: "Last 24 hours",
                        accent: "text-green-400",
                      },
                      {
                        key: "7d",
                        label: "Last 7 days",
                        accent: "text-emerald-400",
                      },
                      {
                        key: "30d",
                        label: "Last 30 days",
                        accent: "text-teal-400",
                      },
                    ];

                    const Row = ({ config }) => {
                      const summary = summaries[config.key] || {
                        total: 0,
                        count: 0,
                        byGroup: {},
                      };
                      const breakdown = Object.entries(
                        summary.byGroup || {},
                      ).sort(([, a], [, b]) => b - a);

                      return (
                        <div className="border border-gray-600/60 rounded-md p-2 bg-gray-800/40">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400">
                              {config.label}
                            </span>
                            <span
                              className={`font-medium ${config.accent}`}
                            >
                              ${summary.total.toFixed(2)}{" "}
                              <span className="text-gray-400 ml-1">
                                ({summary.count})
                              </span>
                            </span>
                          </div>
                          {breakdown.length > 0 && (
                            <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-gray-300">
                              {breakdown.map(([method, amount]) => (
                                <div
                                  key={`${config.key}-${method}`}
                                  className="flex justify-between items-center"
                                >
                                  <span className="text-gray-500">
                                    {methodLabel(method)}:
                                  </span>
                                  <span>${amount.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    };

                    return (
                      <div className="space-y-2">
                        {windowConfig.map((cfg) => (
                          <Row key={cfg.key} config={cfg} />
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Dasher Count Statistics */}
                <div className="bg-gray-700/40 rounded-lg p-3 space-y-2">
                  <h4 className="text-sm font-medium text-cyan-300 mb-2">
                    Dashers per Store Category
                  </h4>
                  {dasherCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex justify-between items-center text-xs"
                    >
                      <span className="text-gray-400">
                        {category.name}:
                      </span>
                      <span className="text-gray-200 font-medium">
                        {ensureArray(category.dashers).length} dashers
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-gray-600 pt-2 mt-2">
                    {(() => {
                      // Aggregate all dashers from all sources
                      const allDashers = [
                        ...dasherCategories.flatMap((c) =>
                          ensureArray(c.dashers),
                        ),
                        ...ensureArray(readyDashers),
                        ...ensureArray(currentlyUsingDashers),
                        ...ensureArray(appealedDashers),
                        ...ensureArray(appliedPendingDashers),
                        ...ensureArray(reverifDashers),
                        ...ensureArray(lockedDashers),
                        ...ensureArray(deactivatedDashers),
                        ...ensureArray(archivedDashers),
                      ];
                      return (
                        <React.Fragment>
                          <div className="flex justify-between items-center text-sm font-medium">
                            <span className="text-cyan-300">
                              Total Dashers:
                            </span>
                            <span className="text-cyan-200">
                              {allDashers.length}
                            </span>
                          </div>
                          {allDashers.length > 0 && (
                            <div className="mt-2 grid grid-cols-2 gap-y-1 gap-x-4 text-[11px] text-gray-300">
                              <div>
                                <span className="text-gray-500">
                                  Ready:
                                </span>{" "}
                                {ensureArray(readyDashers).length}
                              </div>
                              <div>
                                <span className="text-gray-500">
                                  Using:
                                </span>{" "}
                                {
                                  ensureArray(currentlyUsingDashers)
                                    .length
                                }
                              </div>
                              <div>
                                <span className="text-gray-500">
                                  Appealed:
                                </span>{" "}
                                {ensureArray(appealedDashers).length}
                              </div>
                              <div>
                                <span className="text-gray-500">
                                  Applied Pending:
                                </span>{" "}
                                {
                                  ensureArray(appliedPendingDashers)
                                    .length
                                }
                              </div>
                              <div>
                                <span className="text-gray-500">
                                  Reverif:
                                </span>{" "}
                                {ensureArray(reverifDashers).length}
                              </div>
                              <div>
                                <span className="text-gray-500">
                                  Locked:
                                </span>{" "}
                                {ensureArray(lockedDashers).length}
                              </div>
                              <div>
                                <span className="text-gray-500">
                                  Deactivated:
                                </span>{" "}
                                {ensureArray(deactivatedDashers).length}
                              </div>
                              <div>
                                <span className="text-gray-500">
                                  Archived:
                                </span>{" "}
                                {ensureArray(archivedDashers).length}
                              </div>
                              <div>
                                <span className="text-gray-500">
                                  Crimson:
                                </span>{" "}
                                {
                                  allDashers.filter((d) => d.crimson)
                                    .length
                                }
                              </div>
                              <div>
                                <span className="text-gray-500">
                                  Red Card:
                                </span>{" "}
                                {
                                  allDashers.filter((d) => d.redCard)
                                    .length
                                }
                              </div>
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })()}
                  </div>
                </div>

                {/* Balance Statistics */}
                <div className="bg-gray-700/40 rounded-lg p-3 space-y-2">
                  <h4 className="text-sm font-medium text-cyan-300 mb-2">
                    Balance Breakdown
                  </h4>
                  {(() => {
                    let totalWithCrimson = 0;
                    let totalWithoutCrimson = 0;
                    let totalWithRedCard = 0;
                    let countWithCrimson = 0;
                    let countWithoutCrimson = 0;
                    let countWithRedCard = 0;

                    // Aggregate all dashers from all sources
                    const allDashers = [
                      ...dasherCategories.flatMap((c) =>
                        ensureArray(c.dashers),
                      ),
                      ...ensureArray(readyDashers),
                      ...ensureArray(currentlyUsingDashers),
                      ...ensureArray(appealedDashers),
                      ...ensureArray(appliedPendingDashers),
                      ...ensureArray(reverifDashers),
                      ...ensureArray(lockedDashers),
                      ...ensureArray(deactivatedDashers),
                      ...ensureArray(archivedDashers),
                    ];

                    allDashers.forEach((dasher) => {
                      const balanceNum = parseBalanceValue(
                        dasher.balance,
                      );

                      if (dasher.crimson) {
                        totalWithCrimson += balanceNum;
                        countWithCrimson++;
                      } else {
                        totalWithoutCrimson += balanceNum;
                        countWithoutCrimson++;
                      }

                      if (dasher.redCard) {
                        totalWithRedCard += balanceNum;
                        countWithRedCard++;
                      }
                    });

                    const totalBalance =
                      totalWithCrimson + totalWithoutCrimson;

                    return (
                      <React.Fragment>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-400">
                            With Crimson ({countWithCrimson}):
                          </span>
                          <span
                            className={`font-medium ${totalWithCrimson > 0 ? "text-red-400" : "text-green-400"}`}
                          >
                            ${totalWithCrimson.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-400">
                            Without Crimson ({countWithoutCrimson}):
                          </span>
                          <span
                            className={`font-medium ${totalWithoutCrimson > 0 ? "text-red-400" : "text-green-400"}`}
                          >
                            ${totalWithoutCrimson.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-400">
                            With Red Card ({countWithRedCard}):
                          </span>
                          <span
                            className={`font-medium ${totalWithRedCard > 0 ? "text-red-400" : "text-green-400"}`}
                          >
                            ${totalWithRedCard.toFixed(2)}
                          </span>
                        </div>
                        <div className="border-t border-gray-600 pt-2 mt-2">
                          <div className="flex justify-between items-center text-sm font-medium">
                            <span className="text-cyan-300">
                              Total Balance:
                            </span>
                            <span
                              className={
                                totalBalance > 0
                                  ? "text-red-400"
                                  : "text-green-400"
                              }
                            >
                              ${totalBalance.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })()}
                </div>

                {/* Cash Out Totals */}
                <div className="bg-gray-700/40 rounded-lg p-3 space-y-2">
                  <h4 className="text-sm font-medium text-green-300 mb-2">
                    Cash Out Totals (All Time)
                  </h4>
                  {(() => {
                    let totalCashOut = 0;
                    let cashOutCount = 0;
                    const methodTotals = {};

                    // Aggregate from all dasher sources
                    const allDashersCash = [
                      ...dasherCategories.flatMap((cat) =>
                        ensureArray(cat.dashers),
                      ),
                      ...ensureArray(readyDashers),
                      ...ensureArray(currentlyUsingDashers),
                      ...ensureArray(appealedDashers),
                      ...ensureArray(appliedPendingDashers),
                      ...ensureArray(reverifDashers),
                      ...ensureArray(lockedDashers),
                      ...ensureArray(deactivatedDashers),
                      ...ensureArray(archivedDashers),
                    ];

                    allDashersCash.forEach((dasher) => {
                      ensureArray(dasher.cashOutHistory).forEach(
                        (entry) => {
                          const amount =
                            typeof entry.amount === "number"
                              ? entry.amount
                              : parseFloat(entry.amount);
                          if (!Number.isFinite(amount) || amount <= 0)
                            return;
                          totalCashOut += amount;
                          cashOutCount++;
                          const method = String(
                            entry.method ?? "unspecified",
                          )
                            .trim()
                            .toLowerCase();
                          methodTotals[method] =
                            (methodTotals[method] || 0) + amount;
                        },
                      );
                    });

                    return (
                      <React.Fragment>
                        {cashOutCount === 0 ? (
                          <div className="text-xs text-gray-500 italic">
                            No cash outs recorded yet
                          </div>
                        ) : (
                          <React.Fragment>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-400">
                                Total Cash Outs:
                              </span>
                              <span className="font-medium text-green-400">
                                {cashOutCount}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-400">
                                Total Amount:
                              </span>
                              <span className="font-medium text-green-400">
                                ${totalCashOut.toFixed(2)}
                              </span>
                            </div>
                            {Object.keys(methodTotals).length > 0 && (
                              <div className="border-t border-gray-600 pt-2 mt-2">
                                <div className="text-xs text-gray-400 mb-1">
                                  By Method:
                                </div>
                                {Object.entries(methodTotals).map(
                                  ([method, amount]) => (
                                    <div
                                      key={method}
                                      className="flex justify-between items-center text-xs pl-2"
                                    >
                                      <span className="text-gray-500">
                                        {methodLabel(method)}:
                                      </span>
                                      <span className="text-gray-300">
                                        ${amount.toFixed(2)}
                                      </span>
                                    </div>
                                  ),
                                )}
                              </div>
                            )}
                          </React.Fragment>
                        )}
                      </React.Fragment>
                    );
                  })()}
                </div>

                {/* Category Balance Details */}
                <div className="bg-gray-700/40 rounded-lg p-3 space-y-2">
                  <h4 className="text-sm font-medium text-cyan-300 mb-2">
                    Balance by Category
                  </h4>
                  {dasherCategories.map((category) => {
                    const categoryDashers = ensureArray(category.dashers);
                    const categoryBalance = categoryDashers.reduce(
                      (sum, dasher) => {
                        return sum + parseBalanceValue(dasher.balance);
                      },
                      0,
                    );

                    const crimsonCount = categoryDashers.filter(
                      (d) => d.crimson,
                    ).length;
                    const redCardCount = categoryDashers.filter(
                      (d) => d.redCard,
                    ).length;
                    const nonCrimsonCount =
                      categoryDashers.length - crimsonCount;

                    return (
                      <div key={category.id} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-400">
                            {category.name}:
                          </span>
                          <span
                            className={`font-medium ${categoryBalance > 0 ? "text-red-400" : "text-green-400"}`}
                          >
                            ${categoryBalance.toFixed(2)}
                          </span>
                        </div>
                        {categoryDashers.length > 0 && (
                          <div className="text-xs text-gray-500 pl-4">
                            {crimsonCount > 0 && (
                              <span className="text-red-500">
                                {crimsonCount} crimson
                              </span>
                            )}
                            {crimsonCount > 0 && redCardCount > 0 && (
                              <span className="text-gray-600"> / </span>
                            )}
                            {redCardCount > 0 && (
                              <span className="text-red-600">
                                {redCardCount} red card
                              </span>
                            )}
                            {(crimsonCount > 0 || redCardCount > 0) &&
                              nonCrimsonCount > 0 && (
                                <span className="text-gray-600"> / </span>
                              )}
                            {nonCrimsonCount > 0 && (
                              <span className="text-gray-400">
                                {nonCrimsonCount} regular
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div></StatisticsSection>

          {/* State Management Section */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <button
              onClick={() =>
                setIsStateManagementOpen(!isStateManagementOpen)
              }
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700/50 transition-colors"
              aria-expanded={isStateManagementOpen ? "true" : "false"}
              aria-label="Toggle state management section"
            >
              <div className="flex items-center gap-3">
                <Settings size={20} className="text-purple-400" />
                <span className="text-lg font-medium">
                  State Management{" "}
                  <span className="text-sm text-gray-400 ml-2">
                    v{window.APP_VERSION || "1.11.6"}
                  </span>
                  {/* [PERSISTENCE-FIX] Last saved indicator */}
                  {lastSavedAt && (
                    <span className="text-xs text-gray-500 ml-3" title={lastSavedAt.toLocaleString()}>
                      • Saved {(() => {
                        const seconds = Math.floor((Date.now() - lastSavedAt.getTime()) / 1000);
                        if (seconds < 5) return "just now";
                        if (seconds < 60) return `${seconds}s ago`;
                        const minutes = Math.floor(seconds / 60);
                        if (minutes < 60) return `${minutes}m ago`;
                        return lastSavedAt.toLocaleTimeString();
                      })()}
                    </span>
                  )}
                  {hasUnsavedChanges && (
                    <span className="text-xs text-amber-400 ml-2">• Unsaved</span>
                  )}
                </span>
              </div>
              {isStateManagementOpen ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>

            {isStateManagementOpen && (
              <div className="border-t border-gray-700 p-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Save All Button */}
                  <button
                    onClick={saveAllToLocalStorage}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    <span className="text-sm font-medium">Save All</span>
                  </button>

                  {/* Load from LocalStorage */}
                  <button
                    onClick={loadFromLocalStorage}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={18} />
                    <span className="text-sm font-medium">
                      Load Saved
                    </span>
                  </button>

                  {/* Export to JSON */}
                  <button
                    onClick={exportToJSON}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    <span className="text-sm font-medium">
                      Export JSON
                    </span>
                  </button>

                  {/* Import from JSON */}
                  <label className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer">
                    <Upload size={18} />
                    <span className="text-sm font-medium">
                      Import JSON
                    </span>
                    <input
                      type="file"
                      accept="application/json"
                      onChange={importFromJSON}
                      className="hidden"
                    />
                  </label>

                  {/* Export Ungrouped CSV */}
                  <button
                    onClick={exportDashersUngroupedCsv}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    title="Export all dashers as flat CSV with bucket column"
                    aria-label="Export all dashers as ungrouped CSV file"
                  >
                    <Download size={18} />
                    <span className="text-sm font-medium">
                      Export CSV
                    </span>
                  </button>

                  {/* Export Grouped CSV */}
                  <button
                    onClick={exportDashersGroupedCsv}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    title="Export all dashers as CSV with section headers"
                    aria-label="Export all dashers as grouped CSV file"
                  >
                    <Download size={18} />
                    <span className="text-sm font-medium">
                      Export Grouped CSV
                    </span>
                  </button>

                  {/* Clear All Data */}
                  <button
                    onClick={clearAllData}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={18} />
                    <span className="text-sm font-medium">Clear All</span>
                  </button>

                  {/* Old Undo Cash Out button removed - replaced by universal undo toast */}

                  {/* Edit Mode Toggle */}
                  <button
                    onClick={() => {
                      setIsEditMode(!isEditMode);
                      if (isEditMode) {
                        clearAllSelections();
                      }
                    }}
                    className={`${isEditMode ? "bg-orange-600 hover:bg-orange-700" : "bg-gray-600 hover:bg-gray-700"} text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 col-span-2 lg:col-span-1`}
                  >
                    <CheckSquare size={18} />
                    <span className="text-sm font-medium">
                      {isEditMode ? "Exit Edit Mode" : "Edit Mode"}
                    </span>
                  </button>
                </div>

                {/* Selection Toolbar - appears when in edit mode */}
                {isEditMode && (
                  <div className="mt-4 p-3 bg-orange-600/20 border border-orange-600/30 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm text-gray-300">
                        <strong>{getSelectionCount()}</strong> items
                        selected
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={clearAllSelections}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Clear Selection
                        </button>
                        <button
                          onClick={exportSelected}
                          disabled={getSelectionCount() === 0}
                          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:opacity-50 text-white px-3 py-1 rounded text-sm transition-colors flex items-center gap-1"
                        >
                          <Download size={14} />
                          Export Selected
                        </button>
                      </div>
                    </div>

                    {/* Bulk Move Section - appears when dashers are selected */}
                    {(() => {
                      const selectedDasherCount =
                        selectedItems.dashers.size +
                        selectedItems.readyDashers.size +
                        selectedItems.currentlyUsingDashers.size +
                        selectedItems.appealedDashers.size +
                        selectedItems.appliedPendingDashers.size +
                        (selectedItems.reverifDashers
                          ? selectedItems.reverifDashers.size
                          : 0) +
                        selectedItems.lockedDashers.size +
                        selectedItems.deactivatedDashers.size +
                        selectedItems.archivedDashers.size;

                      if (selectedDasherCount === 0) return null;

                      return (
                        <div className="mt-3 p-3 bg-indigo-600/20 border border-indigo-600/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm text-gray-300">
                              <strong>Bulk Move</strong>:{" "}
                              {selectedDasherCount} dasher(s)
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() =>
                                bulkMoveSelectedDashers("main")
                              }
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1"
                            >
                              <Users size={12} />→ Main
                            </button>
                            <button
                              onClick={() =>
                                bulkMoveSelectedDashers("ready")
                              }
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1"
                            >
                              <CircleCheck size={12} />→ Ready
                            </button>
                            <button
                              onClick={() =>
                                bulkMoveSelectedDashers("currently-using")
                              }
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1"
                            >
                              <Activity size={12} />→ Using
                            </button>
                            <button
                              onClick={() =>
                                bulkMoveSelectedDashers("appealed")
                              }
                              className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1"
                            >
                              <CircleCheck size={12} />→ Appealed
                            </button>
                            <button
                              onClick={() =>
                                bulkMoveSelectedDashers("applied-pending")
                              }
                              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1"
                            >
                              <Clock size={12} />→ Applied Pending
                            </button>
                            <button
                              onClick={() =>
                                bulkMoveSelectedDashers("reverif")
                              }
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1"
                            >
                              <ShieldCheck size={12} />→ Reverif
                            </button>
                            <button
                              onClick={() =>
                                bulkMoveSelectedDashers("locked")
                              }
                              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1"
                            >
                              <Lock size={12} />→ Locked
                            </button>
                            <button
                              onClick={() =>
                                bulkMoveSelectedDashers("deactivated")
                              }
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1"
                            >
                              <UserX size={12} />→ Deactivated
                            </button>
                            <button
                              onClick={() =>
                                bulkMoveSelectedDashers("archived")
                              }
                              className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1"
                            >
                              <Archive size={12} />→ Archived
                            </button>
                          </div>
                          <div className="text-xs text-gray-400 mt-2">
                            Click a destination to move all selected
                            dashers. Selections will be cleared and Edit
                            Mode will exit after moving.
                          </div>
                        </div>
                      );
                    })()}

                    <div className="text-xs text-gray-400 mt-3">
                      Select individual items or entire categories to
                      export. Check the boxes next to items you want to
                      include.
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">
                    Instructions:
                  </h4>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>
                      • <strong>Auto-Save:</strong> All changes are saved
                      automatically
                    </li>
                    <li>
                      • <strong>Load Saved:</strong> Restores previously
                      saved data from browser storage
                    </li>
                    <li>
                      • <strong>Export JSON:</strong> Downloads all data
                      as a JSON file for backup
                    </li>
                    <li>
                      • <strong>Import JSON:</strong> Loads data from a
                      previously exported JSON file
                    </li>
                    <li>
                      • <strong>Clear All:</strong> Resets everything to
                      default values
                    </li>
                    <li>
                      • <strong>Edit Mode:</strong> Select specific items
                      to export and share with others
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Expose components globally ONLY in development (prevents window pollution in production)
if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
  window.EnhancedCalculator = EnhancedCalculator;
  window.DasherCard = DasherCard;
}

// Render the React component
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  React.createElement(
    ErrorBoundary,
    null,
    React.createElement(EnhancedCalculator)
  )
);


