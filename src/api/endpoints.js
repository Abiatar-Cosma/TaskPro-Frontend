const ENDPOINTS = Object.freeze({
  auth: {
    register: '/api/auth/register',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    refreshToken: '/api/auth/refresh',
    me: '/api/auth/me',
    google: '/api/auth/google',
    callback: '/api/auth/google/callback',
  },

  users: {
    theme: '/api/users/theme',
    avatar: '/api/users/avatar',
    profile: '/api/users/profile',
    account: '/api/users/account',
  },

  boards: {
    allBoards: '/api/boards',
    oneBoard: id => `/api/boards/${id}`,
    uploadBackground: id => `/api/boards/${id}/background`,
    boardFilter: id => `/api/boards/${id}/filter`,
  },

  columns: {
    allColumns: '/api/columns', // POST
    allColumnsByBoard: boardId => `/api/columns/board/${boardId}`, // GET
    // alias ca să nu mai existe confuzii în imports mai vechi
    columnsByBoard: boardId => `/api/columns/board/${boardId}`, // GET
    oneColumn: id => `/api/columns/${id}`, // GET/PUT/DELETE
    reorderColumns: '/api/columns/reorder', // PATCH (body: { boardId, columnOrders })
  },

  cards: {
    allCards: '/api/cards',
    allCardsByColumn: columnId => `/api/cards/column/${columnId}`,
    oneCard: id => `/api/cards/${id}`,
    reorderCards: '/api/cards/reorder',
    moveCard: id => `/api/cards/${id}/move`,
  },

  email: {
    support: '/api/need-help',
  },
});

export default ENDPOINTS;
