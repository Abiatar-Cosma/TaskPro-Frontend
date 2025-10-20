import { createSlice } from '@reduxjs/toolkit';
import {
  getAllBoards,
  createBoard,
  deleteBoard,
  getOneBoard,
  updateBoard,
} from './boardOperations';
import { filterCards } from '../cards/cardsOperations';
import { handlePending, handleRejected } from '../helpers';

const initialState = {
  boards: [],
  oneBoard: {},
  isLoading: false,
  error: null,
  stats: {},
};

// predicate helpers pentru matchers – doar acțiunile din 'boards/'
const isBoardsPending = action =>
  action.type.startsWith('boards/') && action.type.endsWith('/pending');

const isBoardsRejected = action =>
  action.type.startsWith('boards/') && action.type.endsWith('/rejected');

const boardsSlice = createSlice({
  name: 'board',
  initialState,
  extraReducers: builder => {
    builder
      // ✅ GET ALL
      .addCase(getAllBoards.fulfilled, (state, { payload }) => {
        state.boards = payload;
        state.isLoading = false;
        state.error = null;
      })

      // ✅ GET ONE
      .addCase(getOneBoard.fulfilled, (state, { payload }) => {
        const validColumns = (payload.data.columns || []).filter(
          col => col && col._id
        );
        state.oneBoard = { ...payload.data, columns: validColumns };
        state.isLoading = false;
        state.error = null;
      })

      // ✅ CREATE
      .addCase(createBoard.fulfilled, (state, { payload }) => {
        const board = payload.data || payload;
        const newBoard = { ...board, columns: [] };
        if (!Array.isArray(state.boards)) state.boards = [];
        state.boards.push(newBoard);
        state.oneBoard = newBoard;
        state.isLoading = false;
        state.error = null;
      })

      // ✅ UPDATE
      .addCase(updateBoard.fulfilled, (state, { payload }) => {
        const updated = payload.data;
        state.oneBoard = { ...state.oneBoard, ...updated };
        state.boards = state.boards.map(b =>
          b._id === updated._id ? { ...b, ...updated } : b
        );
        state.isLoading = false;
        state.error = null;
      })

      // ✅ DELETE
      .addCase(deleteBoard.fulfilled, state => {
        state.boards = state.boards.filter(b => b._id !== state.oneBoard._id);
        state.isLoading = false;
        state.error = null;
      })

      // ✅ FILTER CARDS
      .addCase(filterCards.pending, handlePending)
      .addCase(filterCards.fulfilled, (state, { payload }) => {
        state.oneBoard = { ...payload, columns: payload.columns || [] };
        state.isLoading = false;
        state.error = null;
      })
      .addCase(filterCards.rejected, handleRejected)

      // ⛑️ DOAR thunks din 'boards/' pornesc/opresc loading-ul aici
      .addMatcher(isBoardsPending, handlePending)
      .addMatcher(isBoardsRejected, handleRejected);
  },
});

export const boardsReducer = boardsSlice.reducer;
