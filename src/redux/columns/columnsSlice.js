import { createSlice } from '@reduxjs/toolkit';
import {
  addColumn,
  deleteColumn,
  editColumn,
  getColumnsByBoard,
  reorderColumns,
} from './columnsOperations';

const initialState = {
  items: [],
  isLoading: false,
  error: null,
};

const columnsSlice = createSlice({
  name: 'columns',
  initialState,
  reducers: {
    setColumns: (state, { payload }) => {
      state.items = payload || [];
    },
    clearColumns: state => {
      state.items = [];
    },
  },
  extraReducers: builder => {
    // GET
    builder
      .addCase(getColumnsByBoard.pending, s => {
        s.isLoading = true;
        s.error = null;
      })
      .addCase(getColumnsByBoard.fulfilled, (s, { payload }) => {
        s.items = Array.isArray(payload) ? payload : [];
        s.isLoading = false;
      })
      .addCase(getColumnsByBoard.rejected, (s, a) => {
        s.isLoading = false;
        s.error = a.payload;
      });

    // ADD
    builder
      .addCase(addColumn.pending, s => {
        s.isLoading = true;
        s.error = null;
      })
      .addCase(addColumn.fulfilled, (s, { payload }) => {
        s.items.push(payload);
        s.isLoading = false;
      })
      .addCase(addColumn.rejected, (s, a) => {
        s.isLoading = false;
        s.error = a.payload;
      });

    // EDIT
    builder
      .addCase(editColumn.pending, s => {
        s.isLoading = true;
        s.error = null;
      })
      .addCase(editColumn.fulfilled, (s, { payload }) => {
        const i = s.items.findIndex(c => c._id === payload._id);
        if (i !== -1) s.items[i] = payload;
        s.isLoading = false;
      })
      .addCase(editColumn.rejected, (s, a) => {
        s.isLoading = false;
        s.error = a.payload;
      });

    // DELETE
    builder
      .addCase(deleteColumn.pending, s => {
        s.isLoading = true;
        s.error = null;
      })
      .addCase(deleteColumn.fulfilled, (s, { payload: id }) => {
        s.items = s.items.filter(c => c._id !== id);
        s.isLoading = false;
      })
      .addCase(deleteColumn.rejected, (s, a) => {
        s.isLoading = false;
        s.error = a.payload;
      });

    // REORDER → sortăm local după payload
    builder
      .addCase(reorderColumns.pending, s => {
        s.isLoading = true;
        s.error = null;
      })
      .addCase(reorderColumns.fulfilled, (s, { payload: orders }) => {
        const map = new Map(orders.map(o => [o.id, o.order]));
        s.items = [...s.items].sort(
          (a, b) => (map.get(a._id) ?? 0) - (map.get(b._id) ?? 0)
        );
        s.isLoading = false;
      })
      .addCase(reorderColumns.rejected, (s, a) => {
        s.isLoading = false;
        s.error = a.payload;
      });
  },
});

export const { setColumns, clearColumns } = columnsSlice.actions;
export const columnsReducer = columnsSlice.reducer;
