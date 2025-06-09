import React, { createContext, useContext, useReducer, useEffect } from 'react';
import azureServiceBusService from '../services/azureServiceBusElectron';

const AppContext = createContext();

const initialState = {
  connections: [],
  activeConnection: null,
  queues: [],
  topics: [],
  subscriptions: [],
  selectedQueue: null,
  selectedTopic: null,
  selectedSubscription: null,
  messages: [],
  deadLetterMessages: [],
  loading: false,
  error: null,
  sidebarSection: 'connections', // connections, queues, topics, subscriptions
  messagePreview: null,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'SET_CONNECTIONS':
      return { ...state, connections: action.payload };
    
    case 'ADD_CONNECTION':
      return { 
        ...state, 
        connections: [...state.connections, action.payload],
        activeConnection: action.payload,
      };
    
    case 'REMOVE_CONNECTION':
      const filteredConnections = state.connections.filter(conn => conn.id !== action.payload);
      return { 
        ...state, 
        connections: filteredConnections,
        activeConnection: state.activeConnection?.id === action.payload ? null : state.activeConnection,
      };
    
    case 'SET_ACTIVE_CONNECTION':
      return { 
        ...state, 
        activeConnection: action.payload,
        queues: [],
        topics: [],
        subscriptions: [],
        selectedQueue: null,
        selectedTopic: null,
        selectedSubscription: null,
        messages: [],
        deadLetterMessages: [],
      };
    
    case 'SET_QUEUES':
      return { ...state, queues: action.payload };
    
    case 'SET_TOPICS':
      return { ...state, topics: action.payload };
    
    case 'SET_SUBSCRIPTIONS':
      return { ...state, subscriptions: action.payload };
    
    case 'SET_SELECTED_QUEUE':
      return { 
        ...state, 
        selectedQueue: action.payload,
        selectedTopic: null,
        selectedSubscription: null,
        messages: [],
        deadLetterMessages: [],
      };
    
    case 'SET_SELECTED_TOPIC':
      return { 
        ...state, 
        selectedTopic: action.payload,
        selectedQueue: null,
        selectedSubscription: null,
        messages: [],
        deadLetterMessages: [],
      };
    
    case 'SET_SELECTED_SUBSCRIPTION':
      return { 
        ...state, 
        selectedSubscription: action.payload,
        selectedQueue: null,
        messages: [],
        deadLetterMessages: [],
      };
    
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    
    case 'SET_DEAD_LETTER_MESSAGES':
      return { ...state, deadLetterMessages: action.payload };
    
    case 'SET_SIDEBAR_SECTION':
      return { ...state, sidebarSection: action.payload };
    
    case 'SET_MESSAGE_PREVIEW':
      return { ...state, messagePreview: action.payload };
    
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // Load existing connections on startup
    const connections = azureServiceBusService.getAllConnections();
    dispatch({ type: 'SET_CONNECTIONS', payload: connections });
  }, []);

  const createConnection = async (connectionString, name) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const connection = await azureServiceBusService.createConnection(connectionString, name);
      dispatch({ type: 'ADD_CONNECTION', payload: connection });
      
      return connection;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const disconnectConnection = async (connectionId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await azureServiceBusService.disconnectConnection(connectionId);
      dispatch({ type: 'REMOVE_CONNECTION', payload: connectionId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setActiveConnection = (connection) => {
    dispatch({ type: 'SET_ACTIVE_CONNECTION', payload: connection });
  };

  const loadQueues = async () => {
    if (!state.activeConnection) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const queues = await azureServiceBusService.getQueues(state.activeConnection.id);
      dispatch({ type: 'SET_QUEUES', payload: queues });
      dispatch({ type: 'SET_SIDEBAR_SECTION', payload: 'queues' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadTopics = async () => {
    if (!state.activeConnection) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const topics = await azureServiceBusService.getTopics(state.activeConnection.id);
      dispatch({ type: 'SET_TOPICS', payload: topics });
      dispatch({ type: 'SET_SIDEBAR_SECTION', payload: 'topics' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadSubscriptions = async (topicName) => {
    if (!state.activeConnection) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const subscriptions = await azureServiceBusService.getSubscriptions(state.activeConnection.id, topicName);
      dispatch({ type: 'SET_SUBSCRIPTIONS', payload: subscriptions });
      dispatch({ type: 'SET_SIDEBAR_SECTION', payload: 'subscriptions' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const selectQueue = async (queue) => {
    dispatch({ type: 'SET_SELECTED_QUEUE', payload: queue });
    await loadQueueMessages(queue.name);
  };

  const selectTopic = (topic) => {
    dispatch({ type: 'SET_SELECTED_TOPIC', payload: topic });
    loadSubscriptions(topic.name);
  };

  const selectSubscription = async (subscription) => {
    dispatch({ type: 'SET_SELECTED_SUBSCRIPTION', payload: subscription });
    await loadSubscriptionMessages(subscription.topicName, subscription.name);
  };

  const loadQueueMessages = async (queueName, maxMessages = 10) => {
    if (!state.activeConnection) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const messages = await azureServiceBusService.peekMessages(
        state.activeConnection.id, 
        queueName, 
        maxMessages
      );
      dispatch({ type: 'SET_MESSAGES', payload: messages });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadSubscriptionMessages = async (topicName, subscriptionName, maxMessages = 10) => {
    if (!state.activeConnection) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const messages = await azureServiceBusService.peekSubscriptionMessages(
        state.activeConnection.id, 
        topicName, 
        subscriptionName, 
        maxMessages
      );
      dispatch({ type: 'SET_MESSAGES', payload: messages });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadDeadLetterMessages = async (queueName, maxMessages = 10) => {
    if (!state.activeConnection) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const messages = await azureServiceBusService.getDeadLetterMessages(
        state.activeConnection.id, 
        queueName, 
        maxMessages
      );
      dispatch({ type: 'SET_DEAD_LETTER_MESSAGES', payload: messages });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const receiveMessage = async (queueName) => {
    if (!state.activeConnection) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const message = await azureServiceBusService.receiveMessage(
        state.activeConnection.id, 
        queueName
      );
      
      if (message) {
        dispatch({ type: 'SET_MESSAGE_PREVIEW', payload: message });
        // Reload messages to update count
        await loadQueueMessages(queueName);
      }
      
      return message;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setSidebarSection = (section) => {
    dispatch({ type: 'SET_SIDEBAR_SECTION', payload: section });
  };

  const setMessagePreview = (message) => {
    dispatch({ type: 'SET_MESSAGE_PREVIEW', payload: message });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    createConnection,
    disconnectConnection,
    setActiveConnection,
    loadQueues,
    loadTopics,
    loadSubscriptions,
    selectQueue,
    selectTopic,
    selectSubscription,
    loadQueueMessages,
    loadSubscriptionMessages,
    loadDeadLetterMessages,
    receiveMessage,
    setSidebarSection,
    setMessagePreview,
    clearError,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 