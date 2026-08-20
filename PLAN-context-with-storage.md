# Plan: Add Context Support with Browser Storage Persistence

## Goal
Add a single React Context that persists all application state to localStorage, with selective hooks that expose specific parts of the state to components.

## Implementation Approach

### Single Context + Selective Hooks

**One context file:** `src/contexts/AppContext.jsx`
- Single `AppContext` with full application state
- Single localStorage key (`"appState"`) for persistence
- Custom selector hooks for different concerns:
  - `useReaderContext()` - activity state
  - `useConversationsContext()` - conversations state
  - `useNavigationContext()` - UI/navigation state

**State Structure:**
```javascript
{
  // Reader state
  activity: "Reader",
  
  // Conversations state
  conversations: [],
  selectedConversationId: null,
  
  // Navigation/UI state
  menuOpen: false,
  scrollPositions: {},
  ui: {}
}
```

**Selector Hooks:**
```javascript
function useReaderContext() {
  // Returns: { activity, setActivity }
}

function useConversationsContext() {
  // Returns: { conversations, selectedId, addConversation, updateConversation, ... }
}

function useNavigationContext() {
  // Returns: { menuOpen, toggleMenu, scrollPositions, setScrollPosition, ... }
}
```

## Implementation Plan

### 1. Create `src/contexts/AppContext.jsx`

**Structure:**
- React Context with `createContext`
- State management using `useReducer`
- localStorage persistence (single key: `"appState"`)
- `AppProvider` component
- Three selector hooks: `useReaderContext`, `useConversationsContext`, `useNavigationContext`

**Actions:**
- `SET_ACTIVITY` - Change active screen
- `SET_CONVERSATIONS` - Replace conversations list
- `ADD_CONVERSATION` - Add new conversation
- `UPDATE_CONVERSATION` - Update existing conversation
- `REMOVE_CONVERSATION` - Delete conversation
- `SELECT_CONVERSATION` - Set selected conversation ID
- `TOGGLE_MENU` / `SET_MENU` - Menu state
- `SET_SCROLL_POSITION` - Save scroll position
- `SET_UI_STATE` - Generic UI state setter
- `RESET_UI` - Reset UI state to defaults

### 2. Update `src/app/layout.jsx`
- Import `AppProvider`
- Wrap `{children}` with `<AppProvider>`

### 3. Update `src/app/page.jsx`
- Import `useReaderContext`
- Replace `useState` for activity with context
- Use `activity` and `setActivity` from hook

### 4. Update `src/components/navbar.jsx`
- Import `useNavigationContext`
- Replace local `menuOpen` state with context
- Use `menuOpen` and `toggleMenu` from hook

### 5. Update `src/components/questions/conversations.jsx`
- Import `useConversationsContext`
- Replace local state for conversations/selectedId with context
- Load conversations into context on mount
- Update handlers to use context actions

## File Changes Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/contexts/AppContext.jsx` | Create | Single context + reducer + persistence + selector hooks |
| `src/app/layout.jsx` | Edit | Wrap app with AppProvider |
| `src/app/page.jsx` | Edit | Use useReaderContext |
| `src/components/navbar.jsx` | Edit | Use useNavigationContext |
| `src/components/questions/conversations.jsx` | Edit | Use useConversationsContext |

## Benefits

1. **Simplicity** - Single context file, single localStorage key
2. **No provider nesting** - One provider wraps the app
3. **Selective access** - Components only get the state they need via hooks
4. **Centralized state** - All state in one place, easier to debug
5. **Flexible** - Hooks can be combined if a component needs multiple concerns
6. **Extensible** - Easy to add new state or actions

## Testing Considerations
- Verify state persists across page refreshes
- Test with localStorage disabled
- Test with corrupted localStorage data
- Verify components only re-render when their specific state changes (via React.memo on hooks)
- Test combining multiple hooks in a single component

## Notes
- Existing `conversation-service.js` remains unchanged
- The service can be refactored later to use the context
- All state management is centralized in AppContext