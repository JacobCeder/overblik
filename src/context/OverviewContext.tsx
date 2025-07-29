'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Article, NewsOverview, OverviewState } from '@/types';
import { saveOverview, saveArticle, deleteArticle as deleteArticleFromDB, reorderArticles as reorderArticlesInDB } from '@/utils/storage';

type OverviewAction =
  | { type: 'SET_OVERVIEW'; payload: NewsOverview }
  | { type: 'SELECT_ARTICLE'; payload: string }
  | { type: 'ADD_ARTICLE'; payload: Article }
  | { type: 'UPDATE_ARTICLE'; payload: Article }
  | { type: 'DELETE_ARTICLE'; payload: string }
  | { type: 'REORDER_ARTICLES'; payload: Article[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_OVERVIEW' };

const initialState: OverviewState = {
  currentOverview: null,
  selectedArticleId: null,
  isLoading: false,
  error: null,
};

function overviewReducer(state: OverviewState, action: OverviewAction): OverviewState {
  switch (action.type) {
    case 'SET_OVERVIEW':
      return {
        ...state,
        currentOverview: action.payload,
        selectedArticleId: action.payload.articles[0]?.id || null,
        error: null,
      };
    case 'SELECT_ARTICLE':
      return {
        ...state,
        selectedArticleId: action.payload,
      };
    case 'ADD_ARTICLE':
      if (!state.currentOverview) return state;
      return {
        ...state,
        currentOverview: {
          ...state.currentOverview,
          articles: [...state.currentOverview.articles, action.payload],
          updatedAt: new Date(),
        },
      };
    case 'UPDATE_ARTICLE':
      if (!state.currentOverview) return state;
      return {
        ...state,
        currentOverview: {
          ...state.currentOverview,
          articles: state.currentOverview.articles.map(article =>
            article.id === action.payload.id ? action.payload : article
          ),
          updatedAt: new Date(),
        },
      };
    case 'DELETE_ARTICLE':
      if (!state.currentOverview) return state;
      const filteredArticles = state.currentOverview.articles.filter(
        article => article.id !== action.payload
      );
      return {
        ...state,
        currentOverview: {
          ...state.currentOverview,
          articles: filteredArticles,
          updatedAt: new Date(),
        },
        selectedArticleId: state.selectedArticleId === action.payload 
          ? filteredArticles[0]?.id || null 
          : state.selectedArticleId,
      };
    case 'REORDER_ARTICLES':
      if (!state.currentOverview) return state;
      return {
        ...state,
        currentOverview: {
          ...state.currentOverview,
          articles: action.payload,
          updatedAt: new Date(),
        },
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'CLEAR_OVERVIEW':
      return initialState;
    default:
      return state;
  }
}

const OverviewContext = createContext<{
  state: OverviewState;
  dispatch: React.Dispatch<OverviewAction>;
} | null>(null);

export function OverviewProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(overviewReducer, initialState);

  useEffect(() => {
    if (state.currentOverview) {
      // Save to database asynchronously without blocking UI
      saveOverview(state.currentOverview).catch(error => {
        console.error('Failed to save overview:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to save overview' });
      });
    }
  }, [state.currentOverview]);

  return (
    <OverviewContext.Provider value={{ state, dispatch }}>
      {children}
    </OverviewContext.Provider>
  );
}

export function useOverview() {
  const context = useContext(OverviewContext);
  if (!context) {
    throw new Error('useOverview must be used within an OverviewProvider');
  }
  return context;
}

export function useOverviewActions() {
  const { state, dispatch } = useOverview();

  const createNewOverview = (title: string, description?: string) => {
    const newOverview: NewsOverview = {
      id: crypto.randomUUID(),
      title,
      description,
      articles: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dispatch({ type: 'SET_OVERVIEW', payload: newOverview });
  };

  const addArticle = async (articleData: Omit<Article, 'id' | 'order'>) => {
    if (!state.currentOverview) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const newArticle: Article = {
        ...articleData,
        id: crypto.randomUUID(),
        order: state.currentOverview.articles.length,
      };

      // Add to local state first for immediate UI update
      dispatch({ type: 'ADD_ARTICLE', payload: newArticle });

      // Save to database
      await saveArticle(state.currentOverview.id, newArticle);
    } catch (error) {
      console.error('Failed to add article:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add article' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateArticle = async (article: Article) => {
    if (!state.currentOverview) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Update local state first for immediate UI update
      dispatch({ type: 'UPDATE_ARTICLE', payload: article });

      // Save to database
      await saveArticle(state.currentOverview.id, article);
    } catch (error) {
      console.error('Failed to update article:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update article' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteArticle = async (articleId: string) => {
    if (!state.currentOverview) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Update local state first for immediate UI update
      dispatch({ type: 'DELETE_ARTICLE', payload: articleId });

      // Delete from database
      await deleteArticleFromDB(articleId, state.currentOverview.id);
    } catch (error) {
      console.error('Failed to delete article:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete article' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const reorderArticles = async (articles: Article[]) => {
    if (!state.currentOverview) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Update local state first for immediate UI update
      dispatch({ type: 'REORDER_ARTICLES', payload: articles });

      // Save to database
      await reorderArticlesInDB(state.currentOverview.id, articles);
    } catch (error) {
      console.error('Failed to reorder articles:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to reorder articles' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const selectArticle = (articleId: string) => {
    dispatch({ type: 'SELECT_ARTICLE', payload: articleId });
  };

  return {
    createNewOverview,
    addArticle,
    updateArticle,
    deleteArticle,
    reorderArticles,
    selectArticle,
  };
}