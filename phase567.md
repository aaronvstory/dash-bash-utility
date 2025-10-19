Totally fine to skip traces for speed. Here’s a fast-track to land **Phases 4–6** with minimal pauses. Paste this straight into Claude Code and let it run through in order.

---

# Fast-track Phases 4–6

**Tools:** Serena for code edits, Desktop Commander for shell/build.
**Sanity checks only:** build, reload, quick UI poke. No perf traces.

---

## Phase 4 — Move shared “draft” state into each card

**Goal:** typing in one card should not re-render the list or other cards.

### 4.1 Find any shared draft state

```
# Serena
search_for_pattern(
  relative_path="dash-bash-component.jsx",
  substring_pattern="dashersDraft|setDashersDraft|drafts|setDrafts|editDraft|setEditDraft|draftMap|setDraftMap",
  context_lines_before=2,
  context_lines_after=2
)
```

If found, we’ll keep parent persistence only on commit and move the live edit state into `DasherCard`.

### 4.2 Add local draft state to DasherCard

Open around the inline `DasherCard` definition (near line ~302 in your file).

```
# Serena
apply_patch(
  relative_path="dash-bash-component.jsx",
  patch="""
@@
-      const DasherCard = React.memo(
+      const DasherCard = React.memo(
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
+          onDraftCommit, // parent persists on blur/save
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
         }) => {
+          // [PERF-STAGE4] Localize draft state so edits do not ripple to siblings
+          const [draft, setDraft] = useState(() => {
+            // seed from dasher fields used by inputs
+            return {
+              notes: dasher?.notes ?? "",
+              nickname: dasher?.nickname ?? "",
+              // add more fields as needed
+            };
+          });
+
+          const onDraftChange = useCallback((field, value) => {
+            setDraft(prev => (prev[field] === value ? prev : { ...prev, [field]: value }));
+          }, []);
+
+          const commitDraft = useCallback(() => {
+            onDraftCommit?.(dasher?.id, draft);
+          }, [onDraftCommit, dasher?.id, draft]);
"""
)
```

### 4.3 Wire inputs in the card to local draft

Find inputs inside `DasherCard` that currently read from parent state, e.g. `value={dasher.notes}` or `value={dashersDraft[dasher.id]?.notes}`. Replace with local draft and commit on blur.

Examples:

```
# Serena
apply_patch(
  relative_path="dash-bash-component.jsx",
  patch="""
@@
-  <input
-    value={dasher.notes ?? ""}
-    onChange={(e) => setDashersDraft(prev => ({ ...prev, [dasher.id]: { ...(prev[dasher.id]||{}), notes: e.target.value } }))}
-  />
+  <input
+    value={draft.notes}
+    onChange={(e) => onDraftChange("notes", e.target.value)}
+    onBlur={commitDraft}
+  />
"""
)
```

Repeat for other editable fields in the card such as nickname, tags, etc., pointing each to `draft.<field>` with `onBlur={commitDraft}`.

### 4.4 Remove hot-path updates to global draft during typing

If you matched any “shared draft” state earlier, reduce those updates to only happen in `onDraftCommit` in the parent. If `onDraftCommit` does not exist yet, add it:

```
# Serena
apply_patch(
  relative_path="dash-bash-component.jsx",
  patch="""
@@
-  // onDraftCommit defined?
+  // [PERF-STAGE4] Persist only on commit to keep typing cheap
+  const onDraftCommit = useCallback((id, draft) => {
+    setDashers(prev => {
+      const next = prev.map(d => (d.id === id ? { ...d, ...draft } : d));
+      // Optional: persist here, but we’ll route through idle save in Stage 5
+      return next;
+    });
+  }, []);
"""
)
```

**Build + sanity**

```
# Desktop Commander
npm run build
```

Reload page. Type in one card. Other cards should not flicker.

---

## Phase 5 — Non-blocking persistence

**Goal:** large saves should not jank the UI.

### 5.1 Add idle save helper

Place near other utilities in the main component:

```
# Serena
apply_patch(
  relative_path="dash-bash-component.jsx",
  patch="""
@@
+      // [PERF-STAGE5] Non-blocking persistence
+      const saveStateIdle = useCallback((key, value) => {
+        const run = () => {
+          try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
+        };
+        if ('requestIdleCallback' in window) {
+          requestIdleCallback(run);
+        } else {
+          setTimeout(run, 0);
+        }
+      }, []);
"""
)
```

### 5.2 Replace direct localStorage writes

Find any `localStorage.setItem(` calls.

```
# Serena
search_for_pattern(
  relative_path="dash-bash-component.jsx",
  substring_pattern="localStorage.setItem(",
  context_lines_before=1,
  context_lines_after=1
)
```

Patch them to call `saveStateIdle(key, valueObject)` instead of writing synchronously. If they pass a string, wrap into an object first or leave as-is if already JSON.

Example:

```
# Serena
apply_patch(
  relative_path="dash-bash-component.jsx",
  patch="""
@@
-  localStorage.setItem('dashBashState', JSON.stringify(state));
+  saveStateIdle('dashBashState', state); // [PERF-STAGE5]
"""
)
```

**Build + sanity**

```
# Desktop Commander
npm run build
```

Reload. Do a bulk edit or import. UI should stay responsive.

---

## Phase 6 — Virtualize the dasher list with react-window

**Goal:** keep only visible rows mounted. Big win for 100+ dashers.

### 6.1 Install and import

```
# Desktop Commander
npm i react-window
```

At top-level of the component file:

```
# Serena
apply_patch(
  relative_path="dash-bash-component.jsx",
  patch="""
@@
-      // imports are CDN, keep using window.React, etc.
+      // Virtual list
+      const { FixedSizeList } = window['react-window'] || {};
"""
)
```

If you import via bundling instead of CDN, use `import { FixedSizeList } from 'react-window'` near your other imports instead.

### 6.2 Create a small virtual list wrapper in the same file

Find where you currently do `.map(d => <DasherCard .../>)` for the main list. We’ll replace it. First, add a wrapper component nearby:

```
# Serena
apply_patch(
  relative_path="dash-bash-component.jsx",
  patch="""
@@
+      // [PERF-STAGE6] Virtualized list for dashers
+      const DashersVirtualList = ({ items, itemHeight = 120, height = 800, collapsedIds, handlers }) => {
+        if (!FixedSizeList) {
+          // fallback if react-window not available
+          return items.map((d, i) => (
+            <DasherCard key={d.id} dasher={d} isCollapsed={collapsedIds?.has?.(d.id)} {...handlers} />
+          ));
+        }
+        return (
+          <FixedSizeList
+            height={height}
+            itemCount={items.length}
+            itemSize={itemHeight}
+            width="100%"
+          >
+            {({ index, style }) => {
+              const d = items[index];
+              return (
+                <div style={style}>
+                  <DasherCard key={d.id} dasher={d} isCollapsed={collapsedIds?.has?.(d.id)} {...handlers} />
+                </div>
+              );
+            }}
+          </FixedSizeList>
+        );
+      };
"""
)
```

### 6.3 Replace the old map with the virtual list

Locate the main render block:

```
# Serena
search_for_pattern(
  relative_path="dash-bash-component.jsx",
  substring_pattern=".map((d) => ( <DasherCard",
  context_lines_before=5,
  context_lines_after=5
)
```

Replace that entire map expression with:

```
# Serena
apply_patch(
  relative_path="dash-bash-component.jsx",
  patch="""
@@
-  {filteredDashers.map((d) => (
-    <DasherCard
-      key={d.id}
-      dasher={d}
-      isCollapsed={collapsedIds.has(d.id)}
-      onToggleSelect={onToggleSelect}
-      onToggleCollapse={onToggleCollapse}
-      onStartTimer={onStartTimer}
-      onResetTimer={onResetTimer}
-      onToggleEdit={onToggleEdit}
-      onCashOut={onCashOut}
-      onDelete={onDelete}
-      onDraftCommit={onDraftCommit}
-    />
-  ))}
+  <DashersVirtualList
+    items={filteredDashers}
+    itemHeight={120}   /* adjust after a quick eyeball */
+    height={800}      /* match container visible height */
+    collapsedIds={collapsedIds}
+    handlers={{
+      onToggleSelect,
+      onToggleCollapse,
+      onStartTimer,
+      onResetTimer,
+      onToggleEdit,
+      onCashOut,
+      onDelete,
+      onDraftCommit
+    }}
+  />
"""
)
```

**Build + sanity**

```
# Desktop Commander
npm run build
```

Reload. With 100+ dashers, scroll should stay smooth. If you see too much whitespace or clipping, tweak `itemHeight` to match a typical card height.

---

## Quick checks only

* Expand and collapse a few cards.
* Type in one card. Others should not flicker.
* Scroll a long list. It should feel smooth.
* No console errors.

---

## Send me

1. A short diff summary for Phases 4–6.
2. Any warnings you hit.
3. One line on the feel: typing smooth, scroll smooth, clicks snappy?

When that’s in, I’ll give you the tiny cleanup pass and we’ll call Stage 1 complete.
