import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Plus, Copy, ChevronDown, ChevronUp, Edit2, Save, X, GripVertical, Clock, MapPin, Calculator, MessageSquare, Building2, Settings, Download, Upload, RefreshCw, FolderOpen, Timer, Users, FileText, TimerOff } from 'lucide-react';

const EnhancedCalculator = () => {
  const [target, setTarget] = useState('99');
  const [targetPreset, setTargetPreset] = useState('99'); // '99', '120', or 'custom'
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [customTarget, setCustomTarget] = useState('');
  const [prices, setPrices] = useState([]);
  const [currentPrice, setCurrentPrice] = useState('');
  const priceInputRef = useRef(null);
  
  // Collapsible sections state
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(true);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isAddressBookOpen, setIsAddressBookOpen] = useState(false);
  const [isStateManagementOpen, setIsStateManagementOpen] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [collapsedStores, setCollapsedStores] = useState({});
  const [collapsedDashers, setCollapsedDashers] = useState({});
  const [draggedStore, setDraggedStore] = useState({ categoryId: -1, storeIndex: -1 });
  
  // State management
  const [availableExports, setAvailableExports] = useState([]);
  const [importNotification, setImportNotification] = useState('');
  
  // Quick messages state
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editText, setEditText] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(-1);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newMessageText, setNewMessageText] = useState('');
  const [copyNotification, setCopyNotification] = useState('');
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
    "Hello 👋 the stores oven is broken"
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
          notes: ""
        }
      ]
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
          notes: "Farm supplies and equipment"
        }
      ]
    }
  ]);
  const [editingCategory, setEditingCategory] = useState(-1);
  const [editingStore, setEditingStore] = useState({ categoryId: -1, storeId: -1 });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [draggedCategory, setDraggedCategory] = useState(-1);
  const [draggedStore, setDraggedStore] = useState({ categoryId: -1, storeId: -1 });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [saveNotification, setSaveNotification] = useState('');

  // Notes state
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [noteCategories, setNoteCategories] = useState(() => {
    // Try to load from localStorage first
    const savedState = localStorage.getItem('dashBashState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state.noteCategories) {
          return state.noteCategories;
        }
      } catch (e) {
        console.error('Error loading noteCategories from localStorage:', e);
      }
    }
    
    // Only use defaults if no saved state exists
    return [
      { 
        id: Date.now().toString(), 
        name: 'General', 
        notes: ['Welcome to Dash Bash! This is a sample note. You can edit, copy, or delete it. Try adding your own notes!'] 
      }
    ];
  });
  const [editingNote, setEditingNote] = useState({ categoryId: '', noteIndex: -1 });
  const [draggedNote, setDraggedNote] = useState({ categoryId: '', noteIndex: -1 });
  const [collapsedNoteCategories, setCollapsedNoteCategories] = useState({});
  const [editingNoteCategory, setEditingNoteCategory] = useState(-1);

  // Dashers state
  const [isDashersOpen, setIsDashersOpen] = useState(false);
  const [dasherCategories, setDasherCategories] = useState(() => {
    // Try to load from localStorage first
    const savedState = localStorage.getItem('dashBashState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state.dasherCategories) {
          return state.dasherCategories;
        }
      } catch (e) {
        console.error('Error loading dasherCategories from localStorage:', e);
      }
    }
    
    // Only use defaults if no saved state exists
    return [
      { 
        id: 'main', 
        name: 'Main', 
        dashers: [{
          id: 'test-dasher-' + Date.now(),
          name: 'Test Dasher',
          email: 'test@example.com',
          emailPw: 'password123',
          dasherPw: 'dasher456',
          phone: '555-0123',
          balance: '$50.00',
          crimson: false,
          lastUsed: null,
          notes: 'This is a sample dasher for testing. Feel free to edit or delete!'
        }] 
      },
      { id: 'currently-using', name: 'Currently using', dashers: [] },
      { id: 'deactivated', name: 'Deactivated', dashers: [] },
      { id: 'locked', name: 'Locked', dashers: [] },
      { id: 'reverif', name: 'Reverif', dashers: [] },
      { id: 'ready', name: 'Ready', dashers: [{
        id: 'version-test-dasher',
        name: 'Version Test Dasher',
        email: 'test@version.check',
        crimson: false,
        lastUsed: null,
        notes: 'TEST DASHER - Added to verify GitHub Pages deployment'
      }] }
    ];
  });
  const [editingDasher, setEditingDasher] = useState({ categoryId: '', dasherId: '' });
  const [draggedDasher, setDraggedDasher] = useState({ categoryId: '', dasherIndex: -1 });
  const [collapsedDasherCategories, setCollapsedDasherCategories] = useState({});
  const [dasherUpdateInterval, setDasherUpdateInterval] = useState(null);
  const [editingDasherCategory, setEditingDasherCategory] = useState(-1);

  // Load from localStorage on component mount
  useEffect(() => {
    // Try to load the new unified state first
    const savedState = localStorage.getItem('dashBashState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        
        // Load target configuration
        const savedTarget = state.target || '99';
        const savedPreset = state.targetPreset || (savedTarget === '99' || savedTarget === '120' ? savedTarget : 'custom');
        
        setTarget(savedTarget);
        setTargetPreset(savedPreset);
        if (savedPreset === 'custom') {
          setCustomTarget(savedTarget);
        }
        
        // Load other state
        setPrices(state.prices || []);
        setMessages(state.messages || messages);
        setCategories(state.categories || []);
        // Note: noteCategories and dasherCategories are now loaded via lazy initialization
      } catch (e) {
        console.error('Error loading saved state:', e);
      }
    } else {
      // Fallback to old addressBookCategories for backward compatibility
      const savedCategories = localStorage.getItem('addressBookCategories');
      if (savedCategories) {
        try {
          setCategories(JSON.parse(savedCategories));
        } catch (e) {
          console.error('Error loading saved categories:', e);
        }
      }
    }
  }, []);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Calculator functions
  const addPrice = () => {
    if (currentPrice && !isNaN(parseFloat(currentPrice))) {
      setPrices([...prices, parseFloat(currentPrice)]);
      setCurrentPrice('');
      setTimeout(() => priceInputRef.current?.focus(), 0);
    }
  };

  const removePrice = (index) => {
    setPrices(prices.filter((_, i) => i !== index));
    setTimeout(() => priceInputRef.current?.focus(), 0);
  };

  const clearAll = () => {
    setPrices([]);
    setTimeout(() => priceInputRef.current?.focus(), 0);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addPrice();
    }
  };

  const handleTargetKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (isEditingTarget) {
        handleCustomTargetSave();
      } else {
        priceInputRef.current?.focus();
      }
    }
  };

  const handleTargetPresetChange = (preset) => {
    setTargetPreset(preset);
    setIsEditingTarget(false);
    
    if (preset === '99' || preset === '120') {
      setTarget(preset);
      setCustomTarget('');
    } else if (preset === 'custom') {
      setIsEditingTarget(true);
      setCustomTarget(target !== '99' && target !== '120' ? target : '');
    }
    
    // Auto-save the change
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
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
    priceInputRef.current?.focus();
  }, []);

  // Message management functions
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      const preview = text.length > 40 ? text.substring(0, 40) + '...' : text;
      setCopyNotification(`✅ Copied: "${preview}"`);
      setTimeout(() => setCopyNotification(''), 3000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setCopyNotification('❌ Failed to copy');
      setTimeout(() => setCopyNotification(''), 3000);
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
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingIndex(-1);
    setEditText('');
  };

  const deleteMessage = (index) => {
    const newMessages = messages.filter((_, i) => i !== index);
    setMessages(newMessages);
    if (editingIndex === index) {
      setEditingIndex(-1);
      setEditText('');
    }
    
    // Auto-save after deletion
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
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
      setNewMessageText('');
      setIsAddingNew(false);
      
      // Auto-save after adding
      setTimeout(() => {
        saveAllToLocalStorage();
      }, 100);
    }
  };

  const cancelAddNew = () => {
    setNewMessageText('');
    setIsAddingNew(false);
  };

  // Address Book functions
  const extractCityState = (address) => {
    if (!address) return '';
    
    // Split by comma and trim spaces
    const parts = address.split(',').map(part => part.trim());
    
    if (parts.length >= 3) {
      // Format: "Street, City, State ZIP"
      const city = parts[1];
      const stateZip = parts[2];
      // Extract state (first word before ZIP)
      const state = stateZip.split(' ')[0];
      return `${city}, ${state}`;
    } else if (parts.length === 2) {
      // Format: "Street, City State"
      const cityState = parts[1];
      return cityState;
    }
    
    return '';
  };

  // State Management Functions
  const saveAllToLocalStorage = () => {
    try {
      const state = {
        target,
        targetPreset,
        prices,
        messages,
        categories,
        noteCategories,
        dasherCategories,
        collapsedCategories,
        collapsedStores,
        collapsedDashers,
        collapsedDasherCategories,
        collapsedNoteCategories,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('dashBashState', JSON.stringify(state));
      setSaveNotification('✅ All data saved successfully!');
      setTimeout(() => setSaveNotification(''), 3000);
    } catch (e) {
      console.error('Error saving to localStorage:', e);
      setSaveNotification('❌ Failed to save data');
      setTimeout(() => setSaveNotification(''), 3000);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const savedState = localStorage.getItem('dashBashState');
      if (savedState) {
        const state = JSON.parse(savedState);
        
        // Load target configuration
        const savedTarget = state.target || '99';
        const savedPreset = state.targetPreset || (savedTarget === '99' || savedTarget === '120' ? savedTarget : 'custom');
        
        setTarget(savedTarget);
        setTargetPreset(savedPreset);
        if (savedPreset === 'custom') {
          setCustomTarget(savedTarget);
        }
        
        setPrices(state.prices || []);
        setMessages(state.messages || []);
        setCategories(state.categories || []);
        // Don't use defaults if we have saved state
        if (state.noteCategories) setNoteCategories(state.noteCategories);
        if (state.dasherCategories) setDasherCategories(state.dasherCategories);
        
        // Load collapsed states if they exist
        if (state.collapsedCategories) setCollapsedCategories(state.collapsedCategories);
        if (state.collapsedStores) setCollapsedStores(state.collapsedStores);
        if (state.collapsedDashers) setCollapsedDashers(state.collapsedDashers);
        if (state.collapsedDasherCategories) setCollapsedDasherCategories(state.collapsedDasherCategories);
        if (state.collapsedNoteCategories) setCollapsedNoteCategories(state.collapsedNoteCategories);
        
        setSaveNotification('✅ Data loaded successfully!');
        setTimeout(() => setSaveNotification(''), 3000);
      } else {
        setSaveNotification('⚠️ No saved data found');
        setTimeout(() => setSaveNotification(''), 3000);
      }
    } catch (e) {
      setSaveNotification('❌ Failed to load data');
      setTimeout(() => setSaveNotification(''), 3000);
    }
  };

  const exportToJSON = () => {
    try {
      const state = {
        target,
        targetPreset,
        prices,
        messages,
        categories,
        noteCategories,
        dasherCategories,
        exportDate: new Date().toISOString(),
        version: '2.0'
      };
      
      const dataStr = JSON.stringify(state, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const fileName = `dashbash-export-${timestamp}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', fileName);
      linkElement.click();
      
      setSaveNotification(`✅ Exported to ${fileName}`);
      setTimeout(() => setSaveNotification(''), 3000);
    } catch (e) {
      setSaveNotification('❌ Failed to export data');
      setTimeout(() => setSaveNotification(''), 3000);
    }
  };

  const importFromJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const state = JSON.parse(e.target.result);
        
        // Load target configuration
        const savedTarget = state.target || '99';
        const savedPreset = state.targetPreset || (savedTarget === '99' || savedTarget === '120' ? savedTarget : 'custom');
        
        setTarget(savedTarget);
        setTargetPreset(savedPreset);
        if (savedPreset === 'custom') {
          setCustomTarget(savedTarget);
        }
        
        setPrices(state.prices || []);
        setMessages(state.messages || []);
        setCategories(state.categories || []);
        // Don't use defaults if we have saved state
        if (state.noteCategories) setNoteCategories(state.noteCategories);
        if (state.dasherCategories) setDasherCategories(state.dasherCategories);
        setImportNotification(`✅ Imported data from ${file.name}`);
        setTimeout(() => setImportNotification(''), 3000);
      } catch (err) {
        setImportNotification('❌ Failed to import - invalid file format');
        setTimeout(() => setImportNotification(''), 3000);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      setTarget('99');
      setTargetPreset('99');
      setCustomTarget('');
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
        "customer asked for refund if out of stock"
      ]);
      setCategories([]);
      setNoteCategories([
        { id: Date.now().toString(), name: 'General', notes: [] }
      ]);
      setDasherCategories([
        { id: 'main', name: 'Main', dashers: [] },
        { id: 'currently-using', name: 'Currently using', dashers: [] },
        { id: 'deactivated', name: 'Deactivated', dashers: [] },
        { id: 'locked', name: 'Locked', dashers: [] },
        { id: 'reverif', name: 'Reverif', dashers: [] },
        { id: 'ready', name: 'Ready', dashers: [] }
      ]);
      localStorage.removeItem('dashBashState');
      localStorage.removeItem('addressBookCategories');
      setSaveNotification('✅ All data cleared');
      setTimeout(() => setSaveNotification(''), 3000);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr || timeStr.length !== 4) return '';
    const hours = timeStr.substring(0, 2);
    const minutes = timeStr.substring(2, 4);
    return `${hours}:${minutes}`;
  };

  const calculateTimeStatus = (closeTimeStr) => {
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
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const remainingMinutes = diffMinutes % 60;
    
    // Check if store is closed (assuming 6am opening time)
    const todayOpen = new Date(now);
    todayOpen.setHours(6, 0, 0, 0);
    
    if (now < todayOpen || (diffMs < 0 && Math.abs(diffMinutes) > 12 * 60)) {
      return { status: 'closed', text: 'Closed', color: 'text-red-400' };
    }
    
    if (diffMinutes < 0) {
      return { status: 'closed', text: 'Closed', color: 'text-red-400' };
    }
    
    let color = 'text-green-400'; // More than 2 hours
    if (diffMinutes < 120) color = 'text-yellow-400'; // Less than 2 hours
    if (diffMinutes < 60) color = 'text-red-400'; // Less than 1 hour
    
    const timeText = diffHours > 0 
      ? `${diffHours}h ${remainingMinutes}m left`
      : `${diffMinutes}m left`;
    
    return { 
      status: 'open', 
      text: timeText, 
      color,
      formatted: formatTime(closeTimeStr)
    };
  };

  const addCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory = {
        id: Date.now(),
        name: newCategoryName.trim(),
        stores: []
      };
      setCategories([...categories, newCategory]);
      setNewCategoryName('');
      setIsAddingCategory(false);
      
      // Auto-save
      setTimeout(() => {
        saveAllToLocalStorage();
      }, 100);
    }
  };

  const updateCategory = (categoryId, newName) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId ? { ...cat, name: newName } : cat
    ));
    
    // Auto-save
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const deleteCategory = (categoryId) => {
    setCategories(categories.filter(cat => cat.id !== categoryId));
    
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
      notes: ""
    };
    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, stores: [...cat.stores, newStore] }
        : cat
    ));
    
    // Auto-save
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const updateStore = (categoryId, storeId, field, value) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? {
            ...cat,
            stores: cat.stores.map(store => 
              store.id === storeId ? { ...store, [field]: value } : store
            )
          }
        : cat
    ));
    
    // Auto-save
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const deleteStore = (categoryId, storeId) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, stores: cat.stores.filter(store => store.id !== storeId) }
        : cat
    ));
    
    // Auto-save
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const toggleEditStore = (categoryId, storeId) => {
    if (editingStore.categoryId === categoryId && editingStore.storeId === storeId) {
      setEditingStore({ categoryId: -1, storeId: -1 });
    } else {
      setEditingStore({ categoryId, storeId });
    }
  };

  const isStoreEditing = (categoryId, storeId) => {
    return editingStore.categoryId === categoryId && editingStore.storeId === storeId;
  };

  const toggleCategoryCollapse = (categoryId) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const toggleStoreCollapse = (categoryId, storeId) => {
    const key = `${categoryId}-${storeId}`;
    setCollapsedStores(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isStoreCollapsed = (categoryId, storeId) => {
    const key = `${categoryId}-${storeId}`;
    return collapsedStores[key] || false;
  };

  const getStoresStatusCount = (stores) => {
    let openCount = 0;
    let closedCount = 0;
    
    stores.forEach(store => {
      const status = calculateTimeStatus(store.closeTime);
      if (status && status.status === 'open') {
        openCount++;
      } else if (status && status.status === 'closed') {
        closedCount++;
      }
    });
    
    return { openCount, closedCount };
  };

  const handleStoreDragStart = (e, categoryId, storeIndex) => {
    setDraggedStore({ categoryId, storeIndex });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleStoreDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleStoreDrop = (e, categoryId, storeIndex) => {
    e.preventDefault();
    if (draggedStore.categoryId === categoryId && draggedStore.storeIndex !== storeIndex) {
      const updatedCategories = [...categories];
      const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
      const category = updatedCategories[categoryIndex];
      const draggedStoreItem = category.stores[draggedStore.storeIndex];
      
      const newStores = [...category.stores];
      newStores.splice(draggedStore.storeIndex, 1);
      newStores.splice(storeIndex, 0, draggedStoreItem);
      
      updatedCategories[categoryIndex] = { ...category, stores: newStores };
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
          difference: targetAmount - total
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
      name: 'New Category',
      notes: []
    };
    setNoteCategories([...noteCategories, newCategory]);
    
    // Auto-save
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const updateNoteCategory = (categoryId, newName) => {
    setNoteCategories(noteCategories.map(cat => 
      cat.id === categoryId ? { ...cat, name: newName } : cat
    ));
    
    // Auto-save
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const deleteNoteCategory = (categoryId) => {
    if (noteCategories.length === 1) {
      setSaveNotification('❌ Cannot delete the last category');
      setTimeout(() => setSaveNotification(''), 3000);
      return;
    }
    
    setNoteCategories(noteCategories.filter(cat => cat.id !== categoryId));
    
    // Auto-save
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const addNote = (categoryId) => {
    const newNote = '';
    setNoteCategories(noteCategories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, notes: [...cat.notes, newNote] }
        : cat
    ));
    
    // Start editing the new note immediately
    const categoryIndex = noteCategories.findIndex(cat => cat.id === categoryId);
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
    setNoteCategories(noteCategories.map(cat => 
      cat.id === categoryId 
        ? {
            ...cat,
            notes: cat.notes.map((note, idx) => 
              idx === noteIndex ? newText : note
            )
          }
        : cat
    ));
    
    // Auto-save
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const deleteNote = (categoryId, noteIndex) => {
    setNoteCategories(noteCategories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, notes: cat.notes.filter((_, idx) => idx !== noteIndex) }
        : cat
    ));
    
    // Auto-save
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const toggleNoteEdit = (categoryId, noteIndex) => {
    if (editingNote.categoryId === categoryId && editingNote.noteIndex === noteIndex) {
      setEditingNote({ categoryId: '', noteIndex: -1 });
    } else {
      setEditingNote({ categoryId, noteIndex });
    }
  };

  const isNoteEditing = (categoryId, noteIndex) => {
    return editingNote.categoryId === categoryId && editingNote.noteIndex === noteIndex;
  };

  const toggleNoteCategoryCollapse = (categoryId) => {
    setCollapsedNoteCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleNoteDragStart = (e, categoryId, noteIndex) => {
    setDraggedNote({ categoryId, noteIndex });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleNoteDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleNoteDrop = (e, targetCategoryId) => {
    e.preventDefault();
    if (!draggedNote.categoryId || draggedNote.noteIndex === -1) return;
    
    if (draggedNote.categoryId !== targetCategoryId) {
      // Move note between categories
      const sourceCategory = noteCategories.find(cat => cat.id === draggedNote.categoryId);
      const noteToMove = sourceCategory.notes[draggedNote.noteIndex];
      
      setNoteCategories(noteCategories.map(cat => {
        if (cat.id === draggedNote.categoryId) {
          // Remove from source
          return { ...cat, notes: cat.notes.filter((_, idx) => idx !== draggedNote.noteIndex) };
        } else if (cat.id === targetCategoryId) {
          // Add to target
          return { ...cat, notes: [...cat.notes, noteToMove] };
        }
        return cat;
      }));
      
      // Auto-save
      setTimeout(() => {
        saveAllToLocalStorage();
      }, 100);
    }
    
    setDraggedNote({ categoryId: '', noteIndex: -1 });
  };

  // Dasher Management Functions
  const addDasher = (categoryId) => {
    const newDasher = {
      id: Date.now().toString(),
      name: '',
      email: '',
      emailPw: '',
      dasherPw: '',
      phone: '',
      balance: '',
      crimson: false,
      lastUsed: null,
      notes: ''
    };
    setDasherCategories(dasherCategories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, dashers: [...cat.dashers, newDasher] }
        : cat
    ));
    
    // Auto-save
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const updateDasher = (categoryId, dasherId, field, value) => {
    // Validate email if updating email field
    if (field === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value) && value.includes('@')) {
        // Only validate if it looks like they're trying to enter an email
        return; // Don't update if invalid email format
      }
      
      // Check for duplicate email across all categories
      const isDuplicate = dasherCategories.some(cat => 
        cat.dashers.some(dasher => 
          dasher.id !== dasherId && dasher.email && dasher.email.toLowerCase() === value.toLowerCase()
        )
      );
      
      if (isDuplicate) {
        // Show a toast or alert for duplicate email
        setSaveNotification('A dasher with this email already exists');
        setTimeout(() => setSaveNotification(''), 3000);
        return; // Don't update if duplicate email
      }
    }
    
    setDasherCategories(dasherCategories.map(cat => 
      cat.id === categoryId 
        ? {
            ...cat,
            dashers: cat.dashers.map(dasher => 
              dasher.id === dasherId ? { ...dasher, [field]: value } : dasher
            )
          }
        : cat
    ));
    
    // Auto-save
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const deleteDasher = (categoryId, dasherId) => {
    setDasherCategories(dasherCategories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, dashers: cat.dashers.filter(dasher => dasher.id !== dasherId) }
        : cat
    ));
    
    // Auto-save
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const toggleEditDasher = (categoryId, dasherId) => {
    if (editingDasher.categoryId === categoryId && editingDasher.dasherId === dasherId) {
      setEditingDasher({ categoryId: '', dasherId: '' });
    } else {
      setEditingDasher({ categoryId, dasherId });
    }
  };

  const isDasherEditing = (categoryId, dasherId) => {
    return editingDasher.categoryId === categoryId && editingDasher.dasherId === dasherId;
  };

  const toggleDasherCategoryCollapse = (categoryId) => {
    setCollapsedDasherCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const startDasherTimer = (categoryId, dasherId) => {
    const now = new Date().toISOString();
    updateDasher(categoryId, dasherId, 'lastUsed', now);
    // Auto-save after timer start
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const resetDasherTimer = (categoryId, dasherId) => {
    updateDasher(categoryId, dasherId, 'lastUsed', null);
    // Auto-save after timer reset
    setTimeout(() => {
      saveAllToLocalStorage();
    }, 100);
  };

  const toggleDasherCollapse = (categoryId, dasherId) => {
    const key = `${categoryId}-${dasherId}`;
    setCollapsedDashers(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isDasherCollapsed = (categoryId, dasherId) => {
    const key = `${categoryId}-${dasherId}`;
    // Default to collapsed (true) if no saved state exists
    return collapsedDashers[key] !== undefined ? collapsedDashers[key] : true;
  };

  const calculateDasherTimeStatus = (lastUsedTime) => {
    if (!lastUsedTime) return null;
    
    const lastUsed = new Date(lastUsedTime);
    const now = new Date();
    const diffMs = now - lastUsed;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);
    const remainingHours = 24 - diffHours;
    
    if (diffHours < 24) {
      // Still within 24 hours
      const hoursLeft = Math.floor(remainingHours);
      const minutesLeft = Math.floor((remainingHours - hoursLeft) * 60);
      
      let color = 'text-red-400'; // Default red for < 24 hours
      if (remainingHours <= 1) {
        color = 'text-orange-400'; // Orange for last hour
      }
      
      return {
        status: 'countdown',
        text: hoursLeft > 0 
          ? `${hoursLeft}h ${minutesLeft}m left`
          : `${minutesLeft}m left`,
        color,
        hoursRemaining: remainingHours
      };
    } else {
      // More than 24 hours
      const daysElapsed = Math.floor(diffHours / 24);
      const hoursElapsed = Math.floor(diffHours % 24);
      
      return {
        status: 'elapsed',
        text: daysElapsed > 0
          ? `${daysElapsed}d ${hoursElapsed}h ago`
          : `${Math.floor(diffHours)}h ${diffMinutes}m ago`,
        color: 'text-green-400',
        hoursElapsed: diffHours
      };
    }
  };

  const getDasherTitle = (dasher) => {
    let title = '';
    if (dasher.name && dasher.email) {
      title = `${dasher.name} - ${dasher.email}`;
    } else if (dasher.name) {
      title = dasher.name;
    } else if (dasher.email) {
      title = dasher.email;
    } else {
      title = 'New Dasher';
    }
    
    // Add last used time if available
    if (dasher.lastUsed) {
      const timeStatus = calculateDasherTimeStatus(dasher.lastUsed);
      if (timeStatus) {
        title += ` (${timeStatus.text})`;
      }
    }
    
    return title;
  };

  const handleDasherDragStart = (e, categoryId, dasherIndex) => {
    setDraggedDasher({ categoryId, dasherIndex });
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDasherDragEnd = () => {
    setDraggedDasher({ categoryId: '', dasherIndex: -1 });
  };

  const handleDasherDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDasherDrop = (e, targetCategoryId, targetDasherIndex) => {
    e.preventDefault();
    
    if (!draggedDasher.categoryId || draggedDasher.dasherIndex === -1) return;
    
    const sourceCategoryId = draggedDasher.categoryId;
    const sourceDasherIndex = draggedDasher.dasherIndex;
    
    // Move dasher between or within categories
    const sourceCategory = dasherCategories.find(cat => cat.id === sourceCategoryId);
    const targetCategory = dasherCategories.find(cat => cat.id === targetCategoryId);
    
    if (!sourceCategory || !targetCategory) return;
    
    const dasherToMove = sourceCategory.dashers[sourceDasherIndex];
    if (!dasherToMove) return;
    
    if (sourceCategoryId === targetCategoryId) {
      // Reordering within the same category
      if (sourceDasherIndex !== targetDasherIndex) {
        const newDashers = [...sourceCategory.dashers];
        newDashers.splice(sourceDasherIndex, 1);
        newDashers.splice(targetDasherIndex, 0, dasherToMove);
        
        setDasherCategories(dasherCategories.map(cat => 
          cat.id === targetCategoryId ? { ...cat, dashers: newDashers } : cat
        ));
        
        // Auto-save
        setTimeout(() => {
          saveAllToLocalStorage();
        }, 100);
      }
    } else {
      // Moving between categories
      setDasherCategories(dasherCategories.map(cat => {
        if (cat.id === sourceCategoryId) {
          // Remove from source
          return { ...cat, dashers: cat.dashers.filter((_, idx) => idx !== sourceDasherIndex) };
        } else if (cat.id === targetCategoryId) {
          // Add to target at specific position
          const newDashers = [...cat.dashers];
          newDashers.splice(targetDasherIndex, 0, dasherToMove);
          return { ...cat, dashers: newDashers };
        }
        return cat;
      }));
      
      // Auto-save
      setTimeout(() => {
        saveAllToLocalStorage();
      }, 100);
    }
    
    setDraggedDasher({ categoryId: '', dasherIndex: -1 });
  };

  // Update timer display with a tick counter instead of forcing re-renders
  const [timerTick, setTimerTick] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      // Increment tick to trigger re-render only for timer displays
      setTimerTick(prev => prev + 1);
    }, 1000); // Update every second for real-time countdown
    
    return () => clearInterval(interval);
  }, []);

  const targetAmount = parseFloat(target) || 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Copy Notification */}
      {copyNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-900/90 border border-green-600/50 text-green-100 px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm animate-pulse">
          {copyNotification}
        </div>
      )}
      
      {/* Save Notification */}
      {saveNotification && (
        <div className="fixed top-16 right-4 z-50 bg-blue-900/90 border border-blue-600/50 text-blue-100 px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm animate-pulse">
          {saveNotification}
        </div>
      )}
      
      {/* Import Notification */}
      {importNotification && (
        <div className="fixed top-28 right-4 z-50 bg-purple-900/90 border border-purple-600/50 text-purple-100 px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm animate-pulse">
          {importNotification}
        </div>
      )}
      
      <div className="max-w-5xl mx-auto">
        {/* Header with time */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Dash Bash Utility</h1>
          <div className="flex items-center justify-center gap-2 mt-2 text-gray-400">
            <Clock size={16} />
            <span className="text-sm">
              {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} • {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Target Calculator Section */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Calculator size={20} className="text-blue-400" />
                <span className="text-lg font-medium">Target Calculator</span>
              </div>
              {isCalculatorOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {isCalculatorOpen && (
              <div className="border-t border-gray-700 p-4">
                {/* Target Amount Selector */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Target Amount ($)</label>
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => handleTargetPresetChange('99')}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        targetPreset === '99' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      $99
                    </button>
                    <button
                      onClick={() => handleTargetPresetChange('120')}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        targetPreset === '120' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      $120
                    </button>
                    <button
                      onClick={() => handleTargetPresetChange('custom')}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                        targetPreset === 'custom' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-base font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter custom amount"
                        autoFocus
                      />
                      <button
                        onClick={handleCustomTargetSave}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Save size={16} />
                        Set
                      </button>
                    </div>
                  )}
                  
                  {/* Current Target Display */}
                  {!isEditingTarget && targetPreset === 'custom' && (
                    <div className="text-sm text-gray-400 mt-1">
                      Current: ${target}
                    </div>
                  )}
                </div>

                {/* Price Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Add Product Price ($) <span className="text-gray-400 text-xs">(Enter to add quickly)</span></label>
                  <div className="flex gap-2">
                    <input
                      ref={priceInputRef}
                      type="number"
                      step="0.01"
                      value={currentPrice}
                      onChange={(e) => setCurrentPrice(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-base font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            {prices.length > 0 && (() => {
              const allOptions = prices.map((price, index) => {
                const calc = calculateQuantities(price, targetAmount);
                const bestOption = findBestOption(calc.validOptions);
                return { index, price, bestOption, validOptions: calc.validOptions };
              }).filter(item => item.bestOption);
              
              const globalBest = allOptions.reduce((best, current) => 
                current.bestOption.difference < best.bestOption.difference ? current : best
              , allOptions[0]);
              
              return (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-medium text-gray-400">Results ({prices.length} item{prices.length !== 1 ? 's' : ''})</h3>
                    <button
                      onClick={clearAll}
                      className="text-red-400 hover:text-red-300 text-xs px-3 py-1 rounded border border-red-600/30 hover:border-red-500/50 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {allOptions.map(({ index, price, bestOption }) => {
                      const isGlobalBest = globalBest && bestOption.difference === globalBest.bestOption.difference;
                      const diffRatio = targetAmount > 0 ? Math.min(bestOption.difference / targetAmount, 0.8) : 0;
                      
                      let bgColor = 'bg-gray-800';
                      let borderColor = 'border-transparent';
                      let underColor = 'text-gray-400';
                      
                      if (isGlobalBest) {
                        bgColor = 'bg-green-900/40';
                        borderColor = 'border-green-500/50';
                        underColor = 'text-green-400';
                      } else if (diffRatio < 0.05) {
                        bgColor = 'bg-lime-900/30';
                        borderColor = 'border-lime-600/40';
                        underColor = 'text-lime-400';
                      } else if (diffRatio < 0.15) {
                        bgColor = 'bg-yellow-900/30';
                        borderColor = 'border-yellow-600/40';
                        underColor = 'text-yellow-400';
                      } else if (diffRatio < 0.3) {
                        bgColor = 'bg-amber-900/30';
                        borderColor = 'border-amber-600/40';
                        underColor = 'text-amber-400';
                      } else if (diffRatio < 0.5) {
                        bgColor = 'bg-orange-900/30';
                        borderColor = 'border-orange-600/40';
                        underColor = 'text-orange-400';
                      } else {
                        bgColor = 'bg-red-900/30';
                        borderColor = 'border-red-600/40';
                        underColor = 'text-red-400';
                      }
                      
                      return (
                        <div key={index} className={`${bgColor} border ${borderColor} rounded-lg p-3 flex justify-between items-center transition-colors`}>
                          <div className="flex-1">
                            <span className="font-medium text-base tracking-tight">${price.toFixed(2)} per item</span>
                          </div>
                          <div className="flex-1 text-right mr-3">
                            <div className="font-semibold text-base leading-tight">{bestOption.quantity} items</div>
                            <div className="text-xs text-gray-300 leading-tight">
                              ${bestOption.total.toFixed(2)} • <span className={`font-medium ${underColor}`}>-${bestOption.difference.toFixed(2)}</span>
                              {isGlobalBest && <span className="text-green-400 ml-1">✓</span>}
                            </div>
                          </div>
                          <div>
                            <button
                              onClick={() => removePrice(index)}
                              className="text-gray-500 hover:text-red-400 p-1 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    
                    {prices.map((price, index) => {
                      const calc = calculateQuantities(price, targetAmount);
                      if (calc.validOptions.length > 0) return null;
                      
                      return (
                        <div key={`expensive-${index}`} className="bg-red-900/20 border border-red-600/30 rounded-lg p-3 flex justify-between items-center">
                          <span className="font-medium text-base">${price.toFixed(2)} per item</span>
                          <div className="flex items-center gap-3">
                            <span className="text-red-400 text-xs">Too expensive</span>
                            <button
                              onClick={() => removePrice(index)}
                              className="text-red-400 hover:text-red-300 p-1"
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
                    <div className="text-sm">Add product prices to see calculations</div>
                    <div className="text-xs mt-1">Focus is on the price input - just start typing!</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Messages Section */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setIsMessagesOpen(!isMessagesOpen)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <MessageSquare size={20} className="text-green-400" />
                <span className="text-lg font-medium">Quick Copy Messages ({messages.length})</span>
              </div>
              {isMessagesOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {isMessagesOpen && (
              <div className="border-t border-gray-700 p-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`bg-gray-700/60 hover:bg-gray-700 rounded-lg p-2 transition-colors border border-gray-600/30 ${
                        draggedIndex === index ? 'opacity-50 bg-gray-600' : ''
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      <div className="flex items-center gap-2">
                        <button className="text-gray-500 hover:text-gray-400 cursor-move p-1">
                          <GripVertical size={18} />
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          {editingIndex === index ? (
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-base text-white resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                              rows={Math.max(1, editText.split('\n').length)}
                              autoFocus
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
                            <>
                              <button onClick={saveEdit} className="text-green-400 hover:text-green-300 p-1" title="Save">
                                <Save size={12} />
                              </button>
                              <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-300 p-1" title="Cancel">
                                <X size={12} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(index)} className="text-yellow-400 hover:text-yellow-300 p-1" title="Edit">
                                <Edit2 size={12} />
                              </button>
                              <button onClick={() => deleteMessage(index)} className="text-red-400 hover:text-red-300 p-1" title="Delete">
                                <Trash2 size={12} />
                              </button>
                            </>
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
                          onChange={(e) => setNewMessageText(e.target.value)}
                          className="flex-1 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-base text-white resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                          rows={2}
                          autoFocus
                          placeholder="Enter your new message..."
                        />
                        <div className="flex gap-0.5">
                          <button onClick={addNewMessage} className="text-green-400 hover:text-green-300 p-1" title="Add">
                            <Save size={12} />
                          </button>
                          <button onClick={cancelAddNew} className="text-gray-400 hover:text-gray-300 p-1" title="Cancel">
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
            </div>

          {/* Address Book Section */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setIsAddressBookOpen(!isAddressBookOpen)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Building2 size={20} className="text-orange-400" />
                <span className="text-lg font-medium">Store Address Book ({categories.reduce((total, cat) => total + cat.stores.length, 0)} locations)</span>
              </div>
              {isAddressBookOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
              
            {isAddressBookOpen && (
              <div className="border-t border-gray-700 p-4 space-y-3">
                {categories.map((category) => {
                  const { openCount, closedCount } = getStoresStatusCount(category.stores);
                  const isCategoryCollapsed = collapsedCategories[category.id];
                  
                  return (
                    <div key={category.id} className="bg-gray-700/40 rounded-lg overflow-hidden border border-gray-600/30">
                      {/* Category Header */}
                      <div className="flex items-center justify-between p-3 hover:bg-gray-700/60 transition-colors">
                        <button
                          onClick={() => toggleCategoryCollapse(category.id)}
                          className="flex items-center gap-2 flex-1 text-left"
                        >
                          {isCategoryCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                          {editingCategory === category.id ? (
                            <input
                              type="text"
                              value={category.name}
                              onChange={(e) => updateCategory(category.id, e.target.value)}
                              className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                              onBlur={() => setEditingCategory(-1)}
                              onKeyPress={(e) => e.key === 'Enter' && setEditingCategory(-1)}
                              onClick={(e) => e.stopPropagation()}
                              autoFocus
                            />
                          ) : (
                            <h4 className="font-medium text-blue-300 flex items-center gap-2">
                              <MapPin size={14} />
                              {category.name} ({category.stores.length})
                              {category.stores.length > 0 && (
                                <span className="text-xs text-gray-400 ml-2">
                                  {openCount > 0 && <span className="text-green-400">{openCount} open</span>}
                                  {openCount > 0 && closedCount > 0 && <span className="text-gray-500"> • </span>}
                                  {closedCount > 0 && <span className="text-red-400">{closedCount} closed</span>}
                                </span>
                              )}
                            </h4>
                          )}
                        </button>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => addStore(category.id)}
                            className="text-green-400 hover:text-green-300 p-1"
                            title="Add store"
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            onClick={() => setEditingCategory(category.id)}
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
                            const cityState = extractCityState(store.address);
                            const timeStatus = calculateTimeStatus(store.closeTime);
                            const isEditing = isStoreEditing(category.id, store.id);
                            const isCollapsed = isStoreCollapsed(category.id, store.id);
                            
                            return (
                              <div 
                                key={store.id} 
                                className={`bg-gray-600/50 rounded-lg overflow-hidden border border-gray-500/30 transition-opacity ${
                                  draggedStore.categoryId === category.id && draggedStore.storeIndex === storeIndex ? 'opacity-50' : ''
                                }`}
                                draggable={!isEditing}
                                onDragStart={(e) => { if (!isEditing) handleStoreDragStart(e, category.id, storeIndex); }}
                                onDragOver={handleStoreDragOver}
                                onDrop={(e) => handleStoreDrop(e, category.id, storeIndex)}
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
                                      onClick={() => toggleStoreCollapse(category.id, store.id)}
                                      className="flex items-center gap-2 flex-1 text-left"
                                    >
                                      {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                      <div className="flex-1">
                                      {cityState ? (
                                        <h5 className="font-medium text-green-300 text-sm flex items-center gap-2">
                                          {cityState}
                                          {timeStatus && (
                                            <span className={`text-xs ${timeStatus.color}`}>
                                              ({timeStatus.status === 'open' ? 'Open' : 'Closed'})
                                            </span>
                                          )}
                                        </h5>
                                      ) : (
                                        <h5 className="font-medium text-gray-400 text-sm italic">New Store</h5>
                                      )}
                                      </div>
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => toggleEditStore(category.id, store.id)}
                                      className={`p-1 transition-colors ${
                                        isEditing 
                                          ? 'text-green-400 hover:text-green-300' 
                                          : 'text-yellow-400 hover:text-yellow-300'
                                      }`}
                                      title={isEditing ? 'Save changes' : 'Edit store'}
                                    >
                                      {isEditing ? <Save size={14} /> : <Edit2 size={14} />}
                                    </button>
                                    <button
                                      onClick={() => deleteStore(category.id, store.id)}
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
                                  <label className="text-xs text-gray-400 w-16 mt-1 flex-shrink-0">Address:</label>
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={store.address}
                                      onChange={(e) => updateStore(category.id, store.id, 'address', e.target.value)}
                                      className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      placeholder="Enter address..."
                                    />
                                  ) : (
                                    <div className="flex-1 text-xs text-gray-200 mt-1">
                                      {store.address || <span className="italic text-gray-500">No address entered</span>}
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
                                    <label className="text-xs text-gray-400 w-12">Open:</label>
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        value={store.openTime}
                                        onChange={(e) => updateStore(category.id, store.id, 'openTime', e.target.value)}
                                        className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="0800"
                                        maxLength={4}
                                      />
                                    ) : (
                                      <div className="flex-1 text-xs text-gray-200 font-mono">
                                        {formatTime(store.openTime) || <span className="italic text-gray-500">Not set</span>}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <label className="text-xs text-gray-400 w-12">Close:</label>
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        value={store.closeTime}
                                        onChange={(e) => updateStore(category.id, store.id, 'closeTime', e.target.value)}
                                        className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="2100"
                                        maxLength={4}
                                      />
                                    ) : (
                                      <div className="flex-1 text-xs text-gray-200 font-mono">
                                        {formatTime(store.closeTime) || <span className="italic text-gray-500">Not set</span>}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Notes */}
                                <div className="flex items-start gap-2">
                                  <label className="text-xs text-gray-400 w-16 mt-1 flex-shrink-0">Notes:</label>
                                  {isEditing ? (
                                    <textarea
                                      value={store.notes}
                                      onChange={(e) => updateStore(category.id, store.id, 'notes', e.target.value)}
                                      className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      rows={1}
                                      placeholder="Any notes..."
                                    />
                                  ) : (
                                    <div className="flex-1 text-xs text-gray-200 mt-1">
                                      {store.notes || <span className="italic text-gray-500">No notes</span>}
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
                  ))}

                  {/* Add New Category */}
                  {isAddingCategory ? (
                    <div className="bg-gray-700/40 rounded-lg p-3 border border-gray-600/30 border-dashed">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          className="flex-1 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Category name (e.g., Walgreens)"
                          autoFocus
                        />
                        <button onClick={addCategory} className="text-green-400 hover:text-green-300 p-1" title="Add">
                          <Save size={14} />
                        </button>
                        <button onClick={() => { setIsAddingCategory(false); setNewCategoryName(''); }} className="text-gray-400 hover:text-gray-300 p-1" title="Cancel">
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
            </div>

          {/* Notes Section */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setIsNotesOpen(!isNotesOpen)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-purple-400" />
                <span className="text-lg font-medium">
                  Notes ({noteCategories.reduce((total, cat) => total + cat.notes.length, 0)} items)
                </span>
              </div>
              {isNotesOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {isNotesOpen && (
              <div className="border-t border-gray-700 p-4">
                <div className="mb-3 text-center">
                  <p className="text-xs text-gray-400">Organize your notes by category</p>
                </div>
                
                <div className="space-y-3">
                  {noteCategories.map((category) => {
                    const isCategoryCollapsed = collapsedNoteCategories[category.id];
                    
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
                            onClick={() => toggleNoteCategoryCollapse(category.id)}
                            className="flex items-center gap-2 flex-1 text-left"
                          >
                            {isCategoryCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                            {editingNoteCategory === category.id ? (
                              <input
                                type="text"
                                value={category.name}
                                onChange={(e) => updateNoteCategory(category.id, e.target.value)}
                                className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                onBlur={() => setEditingNoteCategory(-1)}
                                onKeyPress={(e) => e.key === 'Enter' && setEditingNoteCategory(-1)}
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
                              onClick={() => deleteNoteCategory(category.id)}
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
                              const isEditing = isNoteEditing(category.id, noteIndex);
                              
                              return (
                                <div 
                                  key={noteIndex} 
                                  className={`bg-gray-600/50 rounded-lg p-2 transition-opacity ${
                                    draggedNote.categoryId === category.id && draggedNote.noteIndex === noteIndex ? 'opacity-50' : ''
                                  }`}
                                  draggable={!isEditing}
                                  onDragStart={(e) => { if (!isEditing) handleNoteDragStart(e, category.id, noteIndex); }}
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
                                          onChange={(e) => updateNote(category.id, noteIndex, e.target.value)}
                                          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                                          rows={3}
                                          autoFocus
                                          placeholder="Enter your note..."
                                        />
                                      ) : (
                                        <div className="text-sm text-gray-100 whitespace-pre-wrap">
                                          {note || <span className="italic text-gray-500">Empty note - click edit to add content</span>}
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
                                        onClick={() => toggleNoteEdit(category.id, noteIndex)}
                                        className={`p-1 transition-colors ${
                                          isEditing 
                                            ? 'text-green-400 hover:text-green-300' 
                                            : 'text-yellow-400 hover:text-yellow-300'
                                        }`}
                                        title={isEditing ? 'Save' : 'Edit'}
                                      >
                                        {isEditing ? <Save size={14} /> : <Edit2 size={14} />}
                                      </button>
                                      <button
                                        onClick={() => deleteNote(category.id, noteIndex)}
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
                
                {/* Save Button */}
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <button
                    onClick={saveAllToLocalStorage}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Save size={16} />
                    Save Notes
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Dashers Section */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setIsDashersOpen(!isDashersOpen)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users size={20} className="text-indigo-400" />
                <span className="text-lg font-medium">
                  Dashers ({dasherCategories.reduce((total, cat) => total + cat.dashers.length, 0)} total)
                </span>
              </div>
              {isDashersOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {isDashersOpen && (
              <div className="border-t border-gray-700 p-4 space-y-3">
                {dasherCategories.map((category) => {
                  const isCategoryCollapsed = collapsedDasherCategories[category.id];
                  
                  return (
                    <div 
                      key={category.id} 
                      className="bg-gray-700/40 rounded-lg overflow-hidden border border-gray-600/30"
                    >
                      {/* Category Header */}
                      <div className="flex items-center justify-between p-3 hover:bg-gray-700/60 transition-colors">
                        <button
                          onClick={() => toggleDasherCategoryCollapse(category.id)}
                          className="flex items-center gap-2 flex-1 text-left"
                        >
                          {isCategoryCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                          <h4 className="font-medium text-indigo-300 flex items-center gap-2">
                            <Users size={14} />
                            {category.name} ({category.dashers.length})
                          </h4>
                        </button>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => addDasher(category.id)}
                            className="text-green-400 hover:text-green-300 p-1"
                            title="Add dasher"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Dashers */}
                      {!isCategoryCollapsed && (
                        <div 
                          className="border-t border-gray-600/30 p-3 space-y-2 min-h-[50px]"
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (category.dashers.length === 0) {
                              handleDasherDrop(e, category.id, 0);
                            }
                          }}
                        >
                          {category.dashers.map((dasher, dasherIndex) => {
                            const isEditing = isDasherEditing(category.id, dasher.id);
                            const isCollapsed = isDasherCollapsed(category.id, dasher.id);
                            // Re-calculate on timerTick changes
                            const timeStatus = calculateDasherTimeStatus(dasher.lastUsed);
                            const dasherTitle = getDasherTitle(dasher);
                            
                            return (
                              <div 
                                key={dasher.id} 
                                className={`bg-gray-600/50 rounded-lg overflow-hidden border border-gray-500/30 transition-opacity ${
                                  draggedDasher.categoryId === category.id && draggedDasher.dasherIndex === dasherIndex ? 'opacity-50' : ''
                                }`}
                                draggable={!isEditing}
                                onDragStart={(e) => { if (!isEditing) handleDasherDragStart(e, category.id, dasherIndex); }}
                                onDragEnd={handleDasherDragEnd}
                                onDragOver={handleDasherDragOver}
                                onDrop={(e) => handleDasherDrop(e, category.id, dasherIndex)}
                              >
                                {/* Dasher Header */}
                                <div className="flex items-center justify-between p-3">
                                  <div className="flex items-center gap-2 flex-1">
                                    {!isEditing && (
                                      <div className="text-gray-400 hover:text-gray-300 cursor-move" 
                                           aria-label="Drag to reorder">
                                        <GripVertical size={14} />
                                      </div>
                                    )}
                                    <button
                                      onClick={() => toggleDasherCollapse(category.id, dasher.id)}
                                      className="flex items-center gap-2 flex-1 text-left"
                                    >
                                      {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                      <div className="flex-1">
                                        <h5 className="font-medium text-purple-300 text-sm flex items-center gap-2">
                                          {dasherTitle}
                                          {dasher.lastUsed && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                resetDasherTimer(category.id, dasher.id);
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
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => startDasherTimer(category.id, dasher.id)}
                                      className="text-purple-400 hover:text-purple-300 p-1"
                                      title="Start 24hr timer"
                                    >
                                      <Timer size={14} />
                                    </button>
                                    <button
                                      onClick={() => toggleEditDasher(category.id, dasher.id)}
                                      className={`p-1 transition-colors ${
                                        isEditing 
                                          ? 'text-green-400 hover:text-green-300' 
                                          : 'text-yellow-400 hover:text-yellow-300'
                                      }`}
                                      title={isEditing ? 'Save changes' : 'Edit dasher'}
                                    >
                                      {isEditing ? <Save size={14} /> : <Edit2 size={14} />}
                                    </button>
                                    <button
                                      onClick={() => deleteDasher(category.id, dasher.id)}
                                      className="text-red-400 hover:text-red-300 p-1"
                                      title="Delete dasher"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>

                                {/* Dasher Details */}
                                {!isCollapsed && (
                                  <div className="space-y-2 p-3 pt-0 border-t border-gray-600/30">
                                    {/* Name */}
                                    <div className="flex items-center gap-2">
                                      <label className="text-xs text-gray-400 w-20">Name:</label>
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        value={dasher.name}
                                        onChange={(e) => updateDasher(category.id, dasher.id, 'name', e.target.value)}
                                        className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="Enter name..."
                                      />
                                    ) : (
                                      <>
                                        <div className="flex-1 text-xs text-gray-200">
                                          {dasher.name || <span className="italic text-gray-500">No name</span>}
                                        </div>
                                        {dasher.name && (
                                          <button
                                            onClick={() => copyToClipboard(dasher.name)}
                                            className="text-blue-400 hover:text-blue-300 p-1"
                                            title="Copy name"
                                          >
                                            <Copy size={12} />
                                          </button>
                                        )}
                                      </>
                                    )}
                                  </div>

                                  {/* Email */}
                                  <div className="flex items-center gap-2">
                                    <label className="text-xs text-gray-400 w-20">Email:</label>
                                    {isEditing ? (
                                      <input
                                        type="email"
                                        value={dasher.email}
                                        onChange={(e) => updateDasher(category.id, dasher.id, 'email', e.target.value)}
                                        className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="Enter email..."
                                      />
                                    ) : (
                                      <>
                                        <div className="flex-1 text-xs text-gray-200">
                                          {dasher.email || <span className="italic text-gray-500">No email</span>}
                                        </div>
                                        {dasher.email && (
                                          <button
                                            onClick={() => copyToClipboard(dasher.email)}
                                            className="text-blue-400 hover:text-blue-300 p-1"
                                            title="Copy email"
                                          >
                                            <Copy size={12} />
                                          </button>
                                        )}
                                      </>
                                    )}
                                  </div>

                                  {/* Email Password */}
                                  <div className="flex items-center gap-2">
                                    <label className="text-xs text-gray-400 w-20">Email pw:</label>
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        value={dasher.emailPw || ''}
                                        onChange={(e) => updateDasher(category.id, dasher.id, 'emailPw', e.target.value)}
                                        className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="Enter email password..."
                                      />
                                    ) : (
                                      <>
                                        <div className="flex-1 text-xs text-gray-200">
                                          {dasher.emailPw ? '••••••••' : <span className="italic text-gray-500">No password</span>}
                                        </div>
                                        {dasher.emailPw && (
                                          <button
                                            onClick={() => copyToClipboard(dasher.emailPw)}
                                            className="text-blue-400 hover:text-blue-300 p-1"
                                            title="Copy email password"
                                          >
                                            <Copy size={12} />
                                          </button>
                                        )}
                                      </>
                                    )}
                                  </div>

                                  {/* Dasher Password */}
                                  <div className="flex items-center gap-2">
                                    <label className="text-xs text-gray-400 w-20">Dasher pw:</label>
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        value={dasher.dasherPw || ''}
                                        onChange={(e) => updateDasher(category.id, dasher.id, 'dasherPw', e.target.value)}
                                        className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="Enter dasher password..."
                                      />
                                    ) : (
                                      <>
                                        <div className="flex-1 text-xs text-gray-200">
                                          {dasher.dasherPw ? '••••••••' : <span className="italic text-gray-500">No password</span>}
                                        </div>
                                        {dasher.dasherPw && (
                                          <button
                                            onClick={() => copyToClipboard(dasher.dasherPw)}
                                            className="text-blue-400 hover:text-blue-300 p-1"
                                            title="Copy dasher password"
                                          >
                                            <Copy size={12} />
                                          </button>
                                        )}
                                      </>
                                    )}
                                  </div>

                                  {/* Phone */}
                                  <div className="flex items-center gap-2">
                                    <label className="text-xs text-gray-400 w-20">Phone:</label>
                                    {isEditing ? (
                                      <input
                                        type="tel"
                                        value={dasher.phone || ''}
                                        onChange={(e) => updateDasher(category.id, dasher.id, 'phone', e.target.value)}
                                        className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="Enter phone number..."
                                      />
                                    ) : (
                                      <>
                                        <div className="flex-1 text-xs text-gray-200">
                                          {dasher.phone || <span className="italic text-gray-500">No phone</span>}
                                        </div>
                                        {dasher.phone && (
                                          <button
                                            onClick={() => copyToClipboard(dasher.phone)}
                                            className="text-blue-400 hover:text-blue-300 p-1"
                                            title="Copy phone"
                                          >
                                            <Copy size={12} />
                                          </button>
                                        )}
                                      </>
                                    )}
                                  </div>

                                  {/* Balance */}
                                  <div className="flex items-center gap-2">
                                    <label className="text-xs text-gray-400 w-20">Balance:</label>
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        value={dasher.balance || ''}
                                        onChange={(e) => updateDasher(category.id, dasher.id, 'balance', e.target.value)}
                                        className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="Enter balance..."
                                      />
                                    ) : (
                                      <>
                                        <div className="flex-1 text-xs text-gray-200">
                                          {dasher.balance || <span className="italic text-gray-500">No balance</span>}
                                        </div>
                                        {dasher.balance && (
                                          <button
                                            onClick={() => copyToClipboard(dasher.balance)}
                                            className="text-blue-400 hover:text-blue-300 p-1"
                                            title="Copy balance"
                                          >
                                            <Copy size={12} />
                                          </button>
                                        )}
                                      </>
                                    )}
                                  </div>

                                  {/* Crimson Checkbox */}
                                  <div className="flex items-center gap-2">
                                    <label className="text-xs text-gray-400 w-20">Crimson:</label>
                                    <input
                                      type="checkbox"
                                      checked={dasher.crimson || false}
                                      onChange={(e) => updateDasher(category.id, dasher.id, 'crimson', e.target.checked)}
                                      disabled={!isEditing}
                                      className="h-3 w-3 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-1 disabled:opacity-50"
                                    />
                                    <span className="text-xs text-gray-400">{dasher.crimson ? 'Yes' : 'No'}</span>
                                  </div>

                                  {/* Last Used Timer */}
                                  <div className="flex items-center gap-2">
                                    <label className="text-xs text-gray-400 w-20">Last used:</label>
                                    <div className="flex-1 text-xs">
                                      {timeStatus ? (
                                        <span className={`font-mono ${timeStatus.color}`}>
                                          {timeStatus.text}
                                        </span>
                                      ) : (
                                        <span className="italic text-gray-500">Timer not started</span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Notes - Expandable */}
                                  <div className="flex items-start gap-2">
                                    <label className="text-xs text-gray-400 w-20 mt-1">Notes:</label>
                                    {isEditing ? (
                                      <textarea
                                        value={dasher.notes || ''}
                                        onChange={(e) => updateDasher(category.id, dasher.id, 'notes', e.target.value)}
                                        className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white resize-y min-h-[2.5rem] focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        rows={2}
                                        placeholder="Any notes..."
                                        style={{ minHeight: '2.5rem' }}
                                      />
                                    ) : (
                                      <>
                                        <div className="flex-1 text-xs text-gray-200 whitespace-pre-wrap">
                                          {dasher.notes || <span className="italic text-gray-500">No notes</span>}
                                        </div>
                                        {dasher.notes && (
                                          <button
                                            onClick={() => copyToClipboard(dasher.notes)}
                                            className="text-blue-400 hover:text-blue-300 p-1 self-start"
                                            title="Copy notes"
                                          >
                                            <Copy size={12} />
                                          </button>
                                        )}
                                      </>
                                    )}
                                  </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {category.dashers.length === 0 && (
                            <div className="text-center text-gray-500 py-2 text-xs">
                              No dashers in this category. Click + to add one.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* State Management Section */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setIsStateManagementOpen(!isStateManagementOpen)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings size={20} className="text-purple-400" />
                <span className="text-lg font-medium">State Management <span className="text-sm text-gray-400 ml-2">v1.0.9</span></span>
              </div>
              {isStateManagementOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {isStateManagementOpen && (
              <div className="border-t border-gray-700 p-4">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Save to LocalStorage */}
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
                    <span className="text-sm font-medium">Load Saved</span>
                  </button>
                  
                  {/* Export to JSON */}
                  <button
                    onClick={exportToJSON}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    <span className="text-sm font-medium">Export JSON</span>
                  </button>
                  
                  {/* Import from JSON */}
                  <label className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer">
                    <Upload size={18} />
                    <span className="text-sm font-medium">Import JSON</span>
                    <input
                      type="file"
                      accept="application/json"
                      onChange={importFromJSON}
                      className="hidden"
                    />
                  </label>
                  
                  {/* Clear All Data */}
                  <button
                    onClick={clearAllData}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 col-span-2 lg:col-span-1"
                  >
                    <Trash2 size={18} />
                    <span className="text-sm font-medium">Clear All</span>
                  </button>
                </div>
                
                {/* Instructions */}
                <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Instructions:</h4>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• <strong>Save All:</strong> Saves all current data to browser storage</li>
                    <li>• <strong>Load Saved:</strong> Restores previously saved data from browser storage</li>
                    <li>• <strong>Export JSON:</strong> Downloads all data as a JSON file for backup</li>
                    <li>• <strong>Import JSON:</strong> Loads data from a previously exported JSON file</li>
                    <li>• <strong>Clear All:</strong> Resets everything to default values</li>
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

export default EnhancedCalculator;