import { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, claimsAPI } from '../services/api.js';

// Create contexts
const AuthContext = createContext();
const ClaimsContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { ...state, loading: false, user: action.payload, isAuthenticated: true };
    case 'LOGIN_ERROR':
      return { ...state, loading: false, error: action.payload, isAuthenticated: false };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, error: null };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

// Claims reducer
const claimsReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_CLAIMS_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_CLAIMS_SUCCESS':
      // Handle both direct array and object with claims property
      const claimsData = action.payload?.claims || action.payload;
      return { 
        ...state, 
        loading: false, 
        claims: Array.isArray(claimsData) ? claimsData : [], 
        pagination: action.payload?.pagination || null,
        error: null 
      };
    case 'FETCH_CLAIMS_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_CLAIM':
      const currentClaims = Array.isArray(state.claims) ? state.claims : [];
      return { ...state, claims: [action.payload, ...currentClaims] };
    case 'UPDATE_CLAIM':
      const claimsForUpdate = Array.isArray(state.claims) ? state.claims : [];
      return {
        ...state,
        claims: claimsForUpdate.map(claim =>
          claim.id === action.payload.id ? action.payload : claim
        )
      };
    case 'DELETE_CLAIM':
      const claimsForDelete = Array.isArray(state.claims) ? state.claims : [];
      return {
        ...state,
        claims: claimsForDelete.filter(claim => claim.id !== action.payload)
      };
    case 'UPDATE_CLAIM_STATUS':
      const claimsForStatusUpdate = Array.isArray(state.claims) ? state.claims : [];
      return {
        ...state,
        claims: claimsForStatusUpdate.map(claim =>
          claim.id === action.payload.id
            ? { ...claim, status: action.payload.status }
            : claim
        )
      };
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

// Auth Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    try {
      const token = localStorage.getItem('authToken');
      const user = authAPI.getCurrentUser();
      
      if (token && user) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      }
    } catch (error) {
      console.error('Error initializing auth state:', error);
      // Clear any corrupted data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const data = await authAPI.login(email, password);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
      return data;
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message });
      throw error;
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const data = await authAPI.register(userData);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
      return data;
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message });
      throw error;
    }
  };

  const logout = () => {
    authAPI.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Claims Provider
export const ClaimsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(claimsReducer, {
    claims: [],
    loading: false,
    error: null,
    pagination: null,
    filter: 'all' // all, pending, approved, rejected
  });

  const fetchClaims = async (params = {}) => {
    dispatch({ type: 'FETCH_CLAIMS_START' });
    try {
      console.log('Fetching claims with params:', params);
      const response = await claimsAPI.getClaims(params);
      console.log('Claims API response:', response);
      dispatch({ type: 'FETCH_CLAIMS_SUCCESS', payload: response });
    } catch (error) {
      console.error('Error fetching claims:', error);
      dispatch({ type: 'FETCH_CLAIMS_ERROR', payload: error.message });
    }
  };

  const createClaim = async (claimData) => {
    try {
      const response = await claimsAPI.createClaim(claimData);
      console.log('Create claim response:', response);
      // Extract the claim from the response
      const newClaim = response.claim || response;
      dispatch({ type: 'ADD_CLAIM', payload: newClaim });
      return response; // Return full response for success message
    } catch (error) {
      dispatch({ type: 'FETCH_CLAIMS_ERROR', payload: error.message });
      throw error;
    }
  };

  const updateClaim = async (id, updates) => {
    try {
      const updatedClaim = await claimsAPI.updateClaim(id, updates);
      dispatch({ type: 'UPDATE_CLAIM', payload: updatedClaim });
      return updatedClaim;
    } catch (error) {
      dispatch({ type: 'FETCH_CLAIMS_ERROR', payload: error.message });
      throw error;
    }
  };

  const updateClaimStatus = async (id, status, comments = '') => {
    try {
      const updatedClaim = await claimsAPI.updateClaimStatus(id, status, comments);
      dispatch({ type: 'UPDATE_CLAIM_STATUS', payload: { id, status } });
      return updatedClaim;
    } catch (error) {
      dispatch({ type: 'FETCH_CLAIMS_ERROR', payload: error.message });
      throw error;
    }
  };

  const deleteClaim = async (id) => {
    try {
      await claimsAPI.deleteClaim(id);
      dispatch({ type: 'DELETE_CLAIM', payload: id });
    } catch (error) {
      dispatch({ type: 'FETCH_CLAIMS_ERROR', payload: error.message });
      throw error;
    }
  };

  const setFilter = (filter) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Computed values - ensure claims is always an array
  const claimsArray = Array.isArray(state.claims) ? state.claims : [];
  
  const filteredClaims = claimsArray.filter(claim => {
    if (state.filter === 'all') return true;
    return claim.status === state.filter;
  });

  const claimStats = {
    total: claimsArray.length,
    pending: claimsArray.filter(c => c.status === 'pending').length,
    approved: claimsArray.filter(c => c.status === 'approved').length,
    rejected: claimsArray.filter(c => c.status === 'rejected').length,
  };

  const value = {
    ...state,
    filteredClaims,
    claimStats,
    fetchClaims,
    createClaim,
    updateClaim,
    updateClaimStatus,
    deleteClaim,
    setFilter,
    clearError
  };

  return (
    <ClaimsContext.Provider value={value}>
      {children}
    </ClaimsContext.Provider>
  );
};

// Custom hooks
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useClaims = () => {
  const context = useContext(ClaimsContext);
  if (!context) {
    throw new Error('useClaims must be used within a ClaimsProvider');
  }
  return context;
};

// Combined provider for convenience
export const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <ClaimsProvider>
        {children}
      </ClaimsProvider>
    </AuthProvider>
  );
};