/**
 * React Window Adapter
 * Maps the CommonJS exports to the expected UMD global structure
 */
(function() {
  'use strict';

  if (typeof window !== 'undefined' && window.ReactWindow) {
    // ReactWindow already loaded, create compatibility layer
    const originalExports = window.ReactWindow;

    // Map List to FixedSizeList and Grid to FixedSizeGrid for compatibility
    window.ReactWindow = {
      ...originalExports,
      FixedSizeList: originalExports.List,
      VariableSizeList: originalExports.List, // Fallback to List if needed
      FixedSizeGrid: originalExports.Grid,
      VariableSizeGrid: originalExports.Grid // Fallback to Grid if needed
    };

    console.log('[ReactWindow Adapter] Compatibility layer loaded. FixedSizeList mapped to List.');
  } else {
    console.warn('[ReactWindow Adapter] window.ReactWindow not found. Make sure react-window.js loads first.');
  }
})();
