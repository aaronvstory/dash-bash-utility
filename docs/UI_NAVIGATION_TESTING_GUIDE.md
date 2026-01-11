# UI Navigation & Testing Guide

**Purpose**: Comprehensive guide for navigating and testing the Dash Bash PWA UI. This documents the exact interaction patterns for categories, dashers, and editing flows.

**Last Updated**: 2026-01-11

---

## Table of Contents
1. [Category Navigation](#category-navigation)
2. [Dasher Card Navigation](#dasher-card-navigation)
3. [Editing Flow](#editing-flow)
4. [Testing Balance Edits](#testing-balance-edits)
5. [Known Issues](#known-issues)

---

## Category Navigation

### Top-Level Categories

Top-level categories include: DASHERS, APPEALED, USING, APPLIED PENDING, REVERIF, LOCKED, DEACTIVATED, ARCHIVED, Ready, and custom categories. "DASHERS" behaves DIFFERENTLY from the others. DASHERS HAS SUBCATEGORIES WHICH ARE DRAGGABLE FROM ONE SUB-CATEGORY TO ANOTHER (the actual dashers within each subcategory can be dragged from one subcategory to another by drag and dropping - NOT possible in other categories). Also, DASHERS, is the only category where we can add custom new  subcategories.  AND CURRENTLY , EDITING DASHER INFO LIKE "BALANCE" ONLY WORKS WHEN THE DASHER IS IN "DASHERS"... WHEN WE EDIT THE DASHER IN ANY OTHER MAIN CATEGORY, IT IS BROKEN.

**To Expand/Collapse a Top-Level Category:**

1. **Locate the category header** - Example: "Dashers 10 / 10" with icon
2. **Click anywhere on the header row** to toggle expansion
3. **Visual feedback**:
   - Collapsed: Down chevron icon (▼)
   - Expanded: Up chevron icon (▲), subcategories visible

**CSS Selector Pattern:**
```css
#root > div > div > div > div:nth-child(N) > div.flex.items-center.justify-between.p-4.hover\:bg-gray-700\/50.transition-colors > button
```
Where N is the category position (e.g., 7 for DASHERS)

**Example (DASHERS Category):**
```
Click: The button in the header row with text "Dashers 10 / 10"
Result: Category expands/collapses, showing/hiding subcategories
```

**Example (APPEALED Category):**
```
Click: The button in the header row with text "Appealed 3 / 3"
Result: Category expands/collapses, showing/hiding dashers in that category
```

---

### Subcategories (Within DASHERS)

Within the DASHERS category, there are subcategories like:
- No crimson (0)
- Currently using (0)
- **Deactivated (4)** ← Most commonly used for testing
- Locked (0)
- Reverif (0)
- Ready (1)
- Pending crimson (0)
- Bagz (1)

**To Expand/Collapse a Subcategory:**

1. **Ensure the parent DASHERS category is expanded**
2. **Click the subcategory header** (e.g., "Deactivated (4)")
3. **Visual feedback**: Subcategory expands to show individual dasher cards

**CSS Selector Pattern:**
```css
#bucket-main > div:nth-child(N) > div.flex.items-center.justify-between.p-3.hover\:bg-gray-700\/60.transition-colors > div.flex.items-center.gap-2 > button > h4
```

**Example (Deactivated Subcategory):**
```
Prerequisites: DASHERS category must be expanded
Click: The "Deactivated (4)" header text
Result: Shows all 4 deactivated dashers (e.g., Julia Blazinic, etc.)
```

---

## Dasher Card Navigation

### Expanding Individual Dasher Cards

Once a category/subcategory is expanded and you can see dasher names, you can expand individual cards to view all attributes.

**To Expand/Collapse a Dasher Card:**

1. **Locate the dasher card** (shows name, email, balance in collapsed state)
2. **Click the dasher's name** (not the icons, not the email, just the name)
3. **Result**: Card expands to show all attributes

**Collapsed Dasher Card Shows:**
- Drag handle (⋮⋮)
- Dasher name (e.g., "Julia Blazinic")
- Email (e.g., "2511sapphire@powerscrews.com")
- **Balance** (e.g., "$10.00" in red/green)
- Time since action (e.g., "121d 21h 1m ago")
- Tags (CRIMSON, FASTPAY, RED CARD, APPEALED, etc.)
- Action icons (refresh, timer, lock, etc.)

**Expanded Dasher Card Shows:**
- All of the above, PLUS:
- Name field
- Email field
- Email password field
- Dasher password field
- Phone field
- **Balance field**
- Earnings history tabs (Amount, Source, Notes)
- Timer field
- Notes section
- Crimson checkbox & info
- Red Card checkbox
- Appealed checkbox
- FastPay checkbox
- Selected cash-out dropdown
- Adjust balance section

**Example:**
```
Prerequisites: DASHERS → Deactivated subcategory expanded
Click: "Julia Blazinic" (the name text itself)
Result: Card expands, showing all fields including editable balance
Click again: Card collapses back to summary view
```

---

## Editing Flow

### Entering Edit Mode

**To Enter Edit Mode on a Dasher Card:**

1. **Prerequisites**:
   - Dasher card must be **expanded** (all attributes visible)
   - Card must NOT already be in edit mode

2. **Click the pencil/edit icon** (yellow when not editing)
   - Icon location: Right side of dasher card header, in the icon row
   - Visual: Yellow pencil icon (🖊️)

3. **Result**: Edit mode activates
   - All fields become editable input boxes
   - Passwords unmask (show actual values instead of bullets)
   - **Pencil icon changes to green checkmark** (✓)

**CSS Selector Pattern (Edit/Pencil Icon):**
```css
#dasher-card-{ID} > div > div:nth-child(2) > div:nth-child(2) > button.icon-btn.transition-colors.text-yellow-400.hover\:text-yellow-300
```

**Example (Julia Blazinic in DASHERS/Deactivated):**
```
Prerequisites: Julia's card is expanded
Click: Yellow pencil icon in the icon row
Result:
  - All fields become editable
  - Balance shows "10" (numeric, editable)
  - Email pw shows "(d)N$-{>G" (unmasked)
  - Pencil icon → Green checkmark
```

---

### Editing the Balance Field

**To Edit the Balance:**

1. **Prerequisites**: Dasher card must be in **edit mode** (green checkmark visible)

2. **Locate the Balance field**
   - Label: "Balance:"
   - Shows current balance as number (e.g., "10" not "$10.00")

3. **Click the balance input field**

4. **Select all text** (triple-click or Ctrl+A)

5. **Type new balance value** (numeric only, e.g., "25" or "30")

**CSS Selector Pattern (Balance Input Field):**
```css
#dasher-card-{ID} > div.space-y-2.p-3.pt-0.border-t.border-gray-600\/30 > div > div:nth-child(6) > input
```

**Example:**
```
Prerequisites: Julia's card in edit mode
Click: Balance input field (shows "10")
Action: Triple-click to select, type "25"
Result: Field now shows "25" (not saved yet)
```

---

### Saving Changes

**To Save Edits:**

1. **Prerequisites**:
   - Dasher card is in edit mode
   - Changes have been made
   - Green checkmark icon is visible

2. **Click the green checkmark icon** (same location as pencil was)
   - Icon location: Right side of dasher card header
   - Visual: Green checkmark (✓)

3. **Expected Result (DASHERS category):**
   - Edit mode exits
   - Fields become read-only again
   - Passwords mask back to bullets (••••••)
   - **Balance updates in the card title** (e.g., "$25.00" in red)
   - Green checkmark → Yellow pencil
   - Changes persist to localStorage

4. **Actual Result (All categories - FIXED in v1.11.1):**
   - Edit mode exits
   - Fields become read-only
   - Balance updates in title ✅
   - Changes persist to localStorage ✅

**CSS Selector Pattern (Save/Checkmark Icon):**
```css
#dasher-card-{ID} > div.flex.items-start.justify-between.p-3 > div:nth-child(2) > div:nth-child(2) > button.icon-btn.transition-colors.text-green-400.hover\:text-green-300
```

**Example (Working - DASHERS category):**
```
Prerequisites: Julia's card in edit mode, balance changed to 25
Click: Green checkmark icon
Result:
  - Title updates: "Julia Blazinic - ... - $25.00"
  - Balance field shows: "$25.00"
  - Edit mode exits
  - ✅ SUCCESS
```

**Example (Broken - APPEALED category):**
```
Prerequisites: erica's card in edit mode, balance changed to 30
Click: Green checkmark icon
Result:
  - Title shows: "erica prucksakorn - ... - $0.00" ⚠️ WRONG
  - Balance field shows: "$0.00" ⚠️ REVERTED
  - Edit mode exits
  - ❌ BUG CONFIRMED
```

---

## Testing Balance Edits

### Complete Test Flow (Step-by-Step)

**Test 1: DASHERS Category (Should Work)**

```
1. Navigate to DASHERS category
   - Scroll to DASHERS section
   - Click "Dashers 10 / 10" header to expand

2. Expand Deactivated subcategory
   - Click "Deactivated (4)" header
   - Verify: 4 dasher cards appear

3. Expand a dasher card
   - Click "Julia Blazinic" name
   - Verify: Card expands showing all fields

4. Enter edit mode
   - Click yellow pencil icon
   - Verify: Fields become editable, icon turns green

5. Edit balance
   - Click balance field
   - Triple-click to select all
   - Type "25"
   - Verify: Field shows "25"

6. Save changes
   - Click green checkmark icon
   - Verify:
     ✅ Title updates to "$25.00"
     ✅ Balance field shows "$25.00"
     ✅ Edit mode exits
     ✅ SUCCESS

7. Refresh page
   - Reload browser
   - Verify: Balance persists at "$25.00"
```

**Test 2: APPEALED Category (Currently Broken)**

```
1. Navigate to APPEALED category
   - Scroll to Appealed section
   - Verify: "Appealed 3 / 3" visible
   - Card may already be expanded

2. Expand a dasher card (if not already)
   - Click "erica prucksakorn" name
   - Verify: Card expands showing all fields
   - Note current balance (e.g., "$0.00")

3. Enter edit mode
   - Click yellow pencil icon
   - Verify: Fields become editable, icon turns green

4. Edit balance
   - Click balance field
   - Type "30"
   - Verify: Field shows "30"

5. Save changes
   - Click green checkmark icon
   - Verify:
     ❌ Title STAYS at "$0.00" (BUG)
     ❌ Balance field shows "$0.00" (REVERTED)
     ❌ Edit mode exits
     ❌ FAILURE - Balance not saved

6. Console check
   - Open DevTools → Console
   - Look for errors related to balance update
   - Check localStorage for state changes
```

---

## Resolved Issues

### ✅ Balance Editing Bug (Non-DASHERS Categories) - FIXED in v1.11.1

**Issue**: Balance edits did NOT save in categories other than DASHERS (e.g., APPEALED, USING, Ready, custom categories)

**Root Cause**: `toggleEditDasher` called `updateDasher()` which only updated `dasherCategories` state. Non-DASHERS categories render from separate bucket arrays (`appealedDashers`, `readyDashers`, etc.) which were never updated.

**Fix**: Changed `toggleEditDasher` (line 7219) to use `updateDasherEverywhere()` which updates both `dasherCategories` AND all bucket arrays.

**Status**: ✅ **FIXED** (v1.11.1, 2026-01-11)

**All Categories Now Working**:
- ✅ DASHERS (was working)
- ✅ APPEALED (now fixed)
- ✅ USING (now fixed)
- ✅ Ready (now fixed)
- ✅ All other categories (now fixed)

---

## Quick Reference

### Expand/Collapse Hierarchy

```
1. Top-Level Category (e.g., DASHERS, APPEALED)
   └─ Click header button

2. Subcategory (e.g., Deactivated, Ready)
   └─ Click subcategory header text

3. Individual Dasher Card
   └─ Click dasher name
```

### Edit Flow

```
1. Expand dasher card (click name)
   ↓
2. Click yellow pencil icon
   ↓
3. Edit fields (balance, etc.)
   ↓
4. Click green checkmark
   ↓
5. Verify changes saved
```

### Common Selectors

```css
/* Top-level category toggle */
div.p-4.hover\:bg-gray-700\/50 > button

/* Subcategory toggle */
div.p-3.hover\:bg-gray-700\/60 > button > h4

/* Dasher card expand (click name) */
.dasher-card-header > .dasher-name

/* Edit mode button (pencil → checkmark) */
button.text-yellow-400  /* Not in edit mode */
button.text-green-400   /* In edit mode */

/* Balance input field */
div:nth-child(6) > input  /* In edit mode */
```

### Testing Checklist

- [ ] Category expands/collapses correctly
- [ ] Subcategory expands/collapses correctly
- [ ] Dasher card expands/collapses correctly
- [ ] Edit mode activates (pencil → checkmark)
- [ ] Balance field accepts numeric input
- [ ] Save button (checkmark) clickable
- [ ] **Title updates with new balance** (DASHERS only)
- [ ] **Balance persists in field** (DASHERS only)
- [ ] Edit mode exits properly
- [ ] Changes persist after page reload

---

## Browser Automation Examples

### Using Claude in Chrome MCP

**Expand DASHERS Category:**
```javascript
mcp__claude-in-chrome__computer({
  action: "left_click",
  coordinate: [640, 407],  // Approximate, adjust per viewport
  tabId: YOUR_TAB_ID
})
```

**Expand Deactivated Subcategory:**
```javascript
mcp__claude-in-chrome__computer({
  action: "left_click",
  coordinate: [149, 585],  // "Deactivated (4)" text
  tabId: YOUR_TAB_ID
})
```

**Enter Edit Mode:**
```javascript
mcp__claude-in-chrome__computer({
  action: "left_click",
  coordinate: [1144, 648],  // Yellow pencil icon
  tabId: YOUR_TAB_ID
})
```

**Edit Balance:**
```javascript
// Triple-click to select all
mcp__claude-in-chrome__computer({
  action: "triple_click",
  coordinate: [670, 830],  // Balance field
  tabId: YOUR_TAB_ID
})

// Type new value
mcp__claude-in-chrome__computer({
  action: "type",
  text: "25",
  tabId: YOUR_TAB_ID
})
```

**Save Changes:**
```javascript
mcp__claude-in-chrome__computer({
  action: "left_click",
  coordinate: [1144, 648],  // Green checkmark (same position as pencil)
  tabId: YOUR_TAB_ID
})
```

---

## Debugging Tips

### If Balance Doesn't Save:

1. **Check Console for Errors**
   ```
   DevTools → Console → Look for:
   - "updateDasherEverywhere"
   - "balance"
   - setState errors
   ```

2. **Check localStorage**
   ```
   DevTools → Application → Local Storage → http://localhost:8443
   - Key: "dashBashState"
   - Value: JSON object with dasherCategories
   - Verify balance value in JSON
   ```

3. **Check Network Tab**
   ```
   DevTools → Network
   - No network calls should occur (all local)
   - If seeing unexpected requests, investigate
   ```

4. **Check Category Logic**
   ```javascript
   // In code, verify which category the dasher belongs to
   console.log('Category:', categoryName);
   console.log('Is DASHERS?', categoryName === 'DASHERS');
   ```

### If Edit Mode Doesn't Exit:

1. Refresh page (F5)
2. Check if green checkmark is actually clickable (not disabled)
3. Try clicking dasher name to collapse/re-expand
4. Check console for JavaScript errors

### If Fields Don't Become Editable:

1. Verify dasher card is fully expanded (click name if not)
2. Check if pencil icon is visible (yellow color)
3. Try collapsing and re-expanding the card
4. Refresh page if stuck

---

## Version History

- **2026-01-11 (v1.11.1)**: Balance editing bug FIXED
  - Changed `toggleEditDasher` to use `updateDasherEverywhere()`
  - All categories now properly persist balance edits
  - Updated documentation to reflect fix

- **2026-01-11**: Initial creation after discovering balance editing bug
  - Documented full navigation hierarchy
  - Documented edit flow step-by-step
  - Confirmed bug in APPEALED/non-DASHERS categories
  - Added testing procedures and expected vs actual results

---

## See Also

- `CLAUDE.md` - Project overview and commands
- `dash-bash-component.jsx` - Main React component source
- `STYLE_GUIDE.md` - CSS patterns and theming
