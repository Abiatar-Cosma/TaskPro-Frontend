import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from 'api/axiosInstance';
import ENDPOINTS from 'api/endpoints';
import {
  mapPriorityToBackend,
  normalizeCardFromApi,
  normalizeCardsArray,
} from 'helpers/cardHelpers';

/** Helper intern: extrage dueDate ISO fie din dueDate, fie din deadline */
const extractDueDateISO = obj => {
  const raw = obj?.dueDate ?? obj?.deadline ?? null;

  if (!raw) return null;
  const d = raw instanceof Date ? raw : new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

/** CREATE */
export const addCard = createAsyncThunk(
  'cards/addCard',
  async (cardInfo, thunkAPI) => {
    try {
      if (!cardInfo.title || !cardInfo.description || !cardInfo.column) {
        throw new Error('Missing required card fields');
      }

      const payload = {
        title: cardInfo.title.trim(),
        description: cardInfo.description.trim(),
        priority: mapPriorityToBackend(cardInfo.priority),
        dueDate: extractDueDateISO(cardInfo),
        column: cardInfo.column,
      };

      const { data } = await axiosInstance.post(
        ENDPOINTS.cards.allCards,
        payload
      );

      const raw = data.data || data.card || data;
      return normalizeCardFromApi(raw);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to add card'
      );
    }
  }
);

/** DELETE */
export const deleteCard = createAsyncThunk(
  'cards/deleteCard',
  async ({ cardId, columnId }, thunkAPI) => {
    try {
      await axiosInstance.delete(ENDPOINTS.cards.oneCard(cardId));
      return { cardId, columnId };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

/** UPDATE (PUT, fallback la PATCH dacă routerul nu are PUT) */
export const editCard = createAsyncThunk(
  'cards/editCard',
  async ({ cardId, editedCard }, thunkAPI) => {
    try {
      if (!cardId || !editedCard.title || !editedCard.description) {
        throw new Error('Missing required card fields for editing');
      }

      const payload = {
        title: editedCard.title.trim(),
        description: editedCard.description.trim(),
        priority: mapPriorityToBackend(editedCard.priority),
        dueDate: extractDueDateISO(editedCard), // ← API așteaptă dueDate
        // nu trimitem column aici (mutarea are endpoint separat)
      };

      try {
        const { data } = await axiosInstance.put(
          ENDPOINTS.cards.oneCard(cardId),
          payload
        );
        const raw = data.data || data.card || data;
        return { card: normalizeCardFromApi(raw), columnId: editedCard.column };
      } catch (err) {
        if (
          err.response &&
          (err.response.status === 404 || err.response.status === 405)
        ) {
          const { data } = await axiosInstance.patch(
            ENDPOINTS.cards.oneCard(cardId),
            payload
          );
          const raw = data.data || data.card || data;
          return {
            card: normalizeCardFromApi(raw),
            columnId: editedCard.column,
          };
        }
        throw err;
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to edit card'
      );
    }
  }
);

/** FILTER (nemodificat) */
export const filterCards = createAsyncThunk(
  'boards/filterCards',
  async ({ boardId, priority }, thunkAPI) => {
    try {
      const { data } = await axiosInstance.get(
        ENDPOINTS.boards.boardFilter(boardId) + `?priority=${priority}`
      );
      return data.board[0];
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

/** MOVE */
export const moveCard = createAsyncThunk(
  'cards/moveCard',
  async ({ cardId, newColumn, oldColumn }, thunkAPI) => {
    try {
      const { data } = await axiosInstance.patch(
        ENDPOINTS.cards.moveCard(cardId),
        { newColumnId: newColumn }
      );
      const raw = data.data || data.card || data;
      return { card: normalizeCardFromApi(raw), oldColumn };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

/** REORDER */
export const changeCardOrder = createAsyncThunk(
  'cards/changeCardOrder',
  async ({ cardId, columnId, order }, thunkAPI) => {
    try {
      const payload = {
        columnId,
        cardOrders: [{ id: cardId, order }],
      };
      const { data } = await axiosInstance.patch(
        ENDPOINTS.cards.reorderCards,
        payload
      );
      return data.data || data.card || data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

/** GET ALL (agregat peste coloane) */
export const getAllCards = createAsyncThunk(
  'cards/getAllCards',
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const columns = state.columns?.items || [];
      if (!columns.length) return [];

      let allCards = [];
      for (const column of columns) {
        if (!column?._id) continue;
        try {
          const { data } = await axiosInstance.get(
            ENDPOINTS.cards.allCardsByColumn(column._id)
          );
          const rawList = data.cards || data.data || data || [];
          const normalized = normalizeCardsArray(rawList).map(c => ({
            ...c,
            columnId: column._id,
          }));
          allCards = allCards.concat(normalized);
        } catch {
          // continuăm dacă o coloană dă eroare
        }
      }
      return allCards;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

/** GET BY COLUMN */
export const getCardsByColumn = createAsyncThunk(
  'cards/getCardsByColumn',
  async (columnId, thunkAPI) => {
    try {
      const { data } = await axiosInstance.get(
        ENDPOINTS.cards.allCardsByColumn(columnId)
      );
      const rawList = data.cards || data.data || data || [];
      return { cards: normalizeCardsArray(rawList), columnId };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

/** STATS – folosește dueDate pentru calcule */
export const getStatistics = createAsyncThunk(
  'cards/getStatistics',
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const cards = state.cards?.items || [];
      if (!cards.length) {
        return {
          all: {
            number: 0,
            without: 0,
            low: 0,
            medium: 0,
            high: 0,
            outdated: 0,
            today: 0,
            week: 0,
            month: 0,
            further: 0,
          },
        };
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dayEnd = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const weekEnd = new Date(today);
      weekEnd.setDate(today.getDate() + 7);
      const monthEnd = new Date(today);
      monthEnd.setMonth(today.getMonth() + 1);

      const toDate = d => (d ? new Date(d) : null);

      const allStats = {
        number: cards.length,
        without: cards.filter(c => !c.priority || c.priority === 'without')
          .length,
        low: cards.filter(c => c.priority === 'low').length,
        medium: cards.filter(c => c.priority === 'medium').length,
        high: cards.filter(c => c.priority === 'high').length,
        outdated: cards.filter(
          c => toDate(c.dueDate) && toDate(c.dueDate) < today
        ).length,
        today: cards.filter(c => {
          const d = toDate(c.dueDate);
          return d && d >= today && d < dayEnd;
        }).length,
        week: cards.filter(c => {
          const d = toDate(c.dueDate);
          return d && d >= dayEnd && d <= weekEnd;
        }).length,
        month: cards.filter(c => {
          const d = toDate(c.dueDate);
          return d && d > weekEnd && d <= monthEnd;
        }).length,
        further: cards.filter(c => {
          const d = toDate(c.dueDate);
          return d && d > monthEnd;
        }).length,
      };

      return { all: allStats };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
