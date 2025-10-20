import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from 'api/axiosInstance';
import ENDPOINTS from 'api/endpoints';

// GET: coloanele unui board
export const getColumnsByBoard = createAsyncThunk(
  'columns/getByBoard',
  async (boardId, thunkAPI) => {
    try {
      const { data } = await axiosInstance.get(
        ENDPOINTS.columns.columnsByBoard(boardId)
      );
      const items = data?.data || data?.columns || data || [];
      return Array.isArray(items) ? items.filter(Boolean) : [];
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// POST: creează coloană (title + board)
export const addColumn = createAsyncThunk(
  'columns/add',
  async ({ boardId, title }, thunkAPI) => {
    try {
      const { data } = await axiosInstance.post(
        ENDPOINTS.columns.allColumns,
        { title, board: boardId }
      );
      const col = data?.data || data?.column || data;
      if (!col || !col._id) throw new Error('Column missing _id in response');
      return col;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// PUT: editează coloană
export const editColumn = createAsyncThunk(
  'columns/edit',
  async ({ id, editedColumn }, thunkAPI) => {
    try {
      const { data } = await axiosInstance.put(
        ENDPOINTS.columns.oneColumn(id),
        editedColumn
      );
      const col = data?.data || data?.column || data;
      if (!col || !col._id) throw new Error('Column missing _id in response');
      return col;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// DELETE: șterge coloană → întoarcem doar id-ul
export const deleteColumn = createAsyncThunk(
  'columns/delete',
  async (columnId, thunkAPI) => {
    try {
      await axiosInstance.delete(ENDPOINTS.columns.oneColumn(columnId));
      return columnId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// PATCH: reordonare coloane (server: PATCH /api/columns/reorder)
export const reorderColumns = createAsyncThunk(
  'columns/reorder',
  async ({ boardId, columns }, thunkAPI) => {
    try {
      const columnOrders = columns.map((c, i) => ({ id: c._id, order: i }));
      await axiosInstance.patch(ENDPOINTS.columns.reorderColumns, {
        boardId,
        columnOrders,
      });
      // sortăm local în slice folosind columnOrders
      return columnOrders;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
