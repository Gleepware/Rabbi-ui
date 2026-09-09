"use client";

import { createContext, useContext, useReducer, useEffect, useCallback, useRef, useState } from "react";

const STORAGE_KEY = "appState";

const initialState = {
  activity: "Reader",
  conversations: [],
  selectedConversationId: null,
  bookmarks: [],
  menuOpen: false,
  scrollPositions: {},
  ui: {},
};

function readStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return { ...initialState, ...JSON.parse(stored) };
  } catch {
    return null;
  }
}

function writeStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable or full
  }
}

function appReducer(state, action) {
  switch (action.type) {
    case "HYDRATE":
      return action.payload;

    case "SET_ACTIVITY":
      return { ...state, activity: action.payload };

    case "SET_CONVERSATIONS":
      return { ...state, conversations: action.payload };
    case "ADD_CONVERSATION":
      return { ...state, conversations: [...state.conversations, action.payload] };
    case "UPDATE_CONVERSATION":
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
    case "REMOVE_CONVERSATION":
      return {
        ...state,
        conversations: state.conversations.filter((c) => c.id !== action.payload),
        selectedConversationId:
          state.selectedConversationId === action.payload
            ? null
            : state.selectedConversationId,
      };
    case "SELECT_CONVERSATION":
      return { ...state, selectedConversationId: action.payload };

    case "SET_BOOKMARKS":
      return { ...state, bookmarks: action.payload };
    case "ADD_BOOKMARK":
      return { ...state, bookmarks: [...state.bookmarks, action.payload] };
    case "UPDATE_BOOKMARK":
      return {
        ...state,
        bookmarks: state.bookmarks.map((b) =>
          b.id === action.payload.id ? action.payload : b
        ),
      };
    case "REMOVE_BOOKMARK":
      return {
        ...state,
        bookmarks: state.bookmarks.filter((b) => b.id !== action.payload),
      };

    case "TOGGLE_MENU":
      return { ...state, menuOpen: !state.menuOpen };
    case "SET_MENU":
      return { ...state, menuOpen: action.payload };
    case "SET_SCROLL_POSITION":
      return {
        ...state,
        scrollPositions: { ...state.scrollPositions, [action.payload.key]: action.payload.value },
      };
    case "SET_UI_STATE":
      return { ...state, ui: { ...state.ui, [action.payload.key]: action.payload.value } };
    case "RESET_UI":
      return { ...state, menuOpen: false, scrollPositions: {}, ui: {} };

    default:
      return state;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [hydrated, setHydrated] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!hydratedRef.current) {
      hydratedRef.current = true;
      const stored = readStorage();
      if (stored) {
        dispatch({ type: "HYDRATE", payload: stored });
      }
      setHydrated(true);
    } else {
      writeStorage(state);
    }
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch, hydrated }}>
      {children}
    </AppContext.Provider>
  );
}

export function useReaderContext() {
  const { state, dispatch, hydrated } = useContext(AppContext);
  return {
    activity: state.activity,
    hydrated,
    setActivity: useCallback((v) => dispatch({ type: "SET_ACTIVITY", payload: v }), [dispatch]),
  };
}

export function useConversationsContext() {
  const { state, dispatch } = useContext(AppContext);
  return {
    conversations: state.conversations,
    selectedId: state.selectedConversationId,
    setConversations: useCallback((v) => dispatch({ type: "SET_CONVERSATIONS", payload: v }), [dispatch]),
    addConversation: useCallback((v) => dispatch({ type: "ADD_CONVERSATION", payload: v }), [dispatch]),
    updateConversation: useCallback((v) => dispatch({ type: "UPDATE_CONVERSATION", payload: v }), [dispatch]),
    removeConversation: useCallback((v) => dispatch({ type: "REMOVE_CONVERSATION", payload: v }), [dispatch]),
    selectConversation: useCallback((v) => dispatch({ type: "SELECT_CONVERSATION", payload: v }), [dispatch]),
  };
}

export function useBookmarksContext() {
  const { state, dispatch } = useContext(AppContext);
  return {
    bookmarks: state.bookmarks,
    setBookmarks: useCallback((v) => dispatch({ type: "SET_BOOKMARKS", payload: v }), [dispatch]),
    addBookmark: useCallback((v) => dispatch({ type: "ADD_BOOKMARK", payload: v }), [dispatch]),
    updateBookmark: useCallback((v) => dispatch({ type: "UPDATE_BOOKMARK", payload: v }), [dispatch]),
    removeBookmark: useCallback((v) => dispatch({ type: "REMOVE_BOOKMARK", payload: v }), [dispatch]),
  };
}

export function useNavigationContext() {
  const { state, dispatch } = useContext(AppContext);
  return {
    menuOpen: state.menuOpen,
    scrollPositions: state.scrollPositions,
    ui: state.ui,
    toggleMenu: useCallback(() => dispatch({ type: "TOGGLE_MENU" }), [dispatch]),
    setMenu: useCallback((v) => dispatch({ type: "SET_MENU", payload: v }), [dispatch]),
    setScrollPosition: useCallback((key, value) => dispatch({ type: "SET_SCROLL_POSITION", payload: { key, value } }), [dispatch]),
    setUiState: useCallback((key, value) => dispatch({ type: "SET_UI_STATE", payload: { key, value } }), [dispatch]),
    resetUi: useCallback(() => dispatch({ type: "RESET_UI" }), [dispatch]),
  };
}
