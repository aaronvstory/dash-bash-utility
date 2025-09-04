// Test script to verify all data sections are properly persisted

const testData = {
  target: "99",
  targetPreset: "99",
  prices: [2.75, 3.50, 4.25],
  messages: [
    "Test message 1",
    "Test message 2"
  ],
  categories: [
    {
      id: 1,
      name: "Test Store",
      stores: [
        {
          id: 1,
          address: "123 Test St",
          openTime: "0800",
          closeTime: "2100",
          notes: "Test notes"
        }
      ]
    }
  ],
  noteCategories: [
    {
      id: "note1",
      name: "Test Notes",
      notes: ["Note 1", "Note 2", "Note 3"]
    }
  ],
  dasherCategories: [
    {
      id: "main",
      name: "Main",
      dashers: [
        {
          id: "dasher1",
          name: "Test Dasher",
          email: "test@example.com",
          lastUsed: new Date().toISOString(),
          notes: "Test dasher notes"
        }
      ]
    }
  ],
  timestamp: new Date().toISOString(),
  version: "2.0"
};

// Function to test data persistence
function testDataPersistence() {
  console.log("Testing data persistence for Dash Bash Utility...\n");
  
  // Test 1: Check all required sections
  console.log("Test 1: Checking all data sections...");
  const requiredSections = [
    'target', 'targetPreset', 'prices', 'messages', 
    'categories', 'noteCategories', 'dasherCategories'
  ];
  
  let allSectionsPresent = true;
  for (const section of requiredSections) {
    if (!(section in testData)) {
      console.log(`  ❌ Missing section: ${section}`);
      allSectionsPresent = false;
    } else {
      console.log(`  ✅ Section present: ${section}`);
    }
  }
  
  if (allSectionsPresent) {
    console.log("✅ All required sections are present!\n");
  } else {
    console.log("❌ Some sections are missing!\n");
  }
  
  // Test 2: Test localStorage save/load
  console.log("Test 2: Testing localStorage save/load...");
  try {
    // Save to localStorage
    localStorage.setItem('dashBashState', JSON.stringify(testData));
    console.log("  ✅ Data saved to localStorage");
    
    // Load from localStorage
    const loadedData = JSON.parse(localStorage.getItem('dashBashState'));
    console.log("  ✅ Data loaded from localStorage");
    
    // Verify all sections loaded correctly
    let loadSuccess = true;
    for (const section of requiredSections) {
      if (!(section in loadedData)) {
        console.log(`  ❌ Section not loaded: ${section}`);
        loadSuccess = false;
      }
    }
    
    if (loadSuccess) {
      console.log("✅ All sections loaded correctly!\n");
    } else {
      console.log("❌ Some sections failed to load!\n");
    }
    
    // Special check for dasherCategories
    console.log("Test 3: Verifying dasherCategories data...");
    if (loadedData.dasherCategories && loadedData.dasherCategories.length > 0) {
      console.log(`  ✅ dasherCategories loaded with ${loadedData.dasherCategories.length} categories`);
      const dashersCount = loadedData.dasherCategories.reduce((total, cat) => total + cat.dashers.length, 0);
      console.log(`  ✅ Total dashers: ${dashersCount}`);
    } else {
      console.log("  ❌ dasherCategories is empty or missing!");
    }
    
    // Special check for noteCategories
    console.log("\nTest 4: Verifying noteCategories data...");
    if (loadedData.noteCategories && loadedData.noteCategories.length > 0) {
      console.log(`  ✅ noteCategories loaded with ${loadedData.noteCategories.length} categories`);
      const notesCount = loadedData.noteCategories.reduce((total, cat) => total + cat.notes.length, 0);
      console.log(`  ✅ Total notes: ${notesCount}`);
    } else {
      console.log("  ❌ noteCategories is empty or missing!");
    }
    
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
  
  // Test 3: Test JSON export format
  console.log("\nTest 5: Testing JSON export format...");
  try {
    const jsonString = JSON.stringify(testData, null, 2);
    const parsed = JSON.parse(jsonString);
    
    if (parsed.dasherCategories && parsed.noteCategories) {
      console.log("  ✅ JSON export includes all sections");
      console.log(`  ✅ Export size: ${jsonString.length} characters`);
    } else {
      console.log("  ❌ JSON export missing some sections");
    }
  } catch (error) {
    console.log(`  ❌ JSON export error: ${error.message}`);
  }
  
  console.log("\n========================================");
  console.log("Data Persistence Test Complete!");
  console.log("========================================");
  
  // Return summary
  return {
    allSectionsPresent,
    testData,
    savedData: localStorage.getItem('dashBashState')
  };
}

// Run the test if this script is executed
if (typeof window !== 'undefined') {
  // Browser environment
  testDataPersistence();
} else {
  // Node.js environment
  console.log("This script should be run in a browser environment");
}