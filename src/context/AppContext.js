import React, { createContext, useContext, useReducer, useEffect } from 'react';
import azureServiceBusService from '../services/azureServiceBusElectron';

const AppContext = createContext();

const initialState = {
  connections: [],
  activeConnection: null,
  queues: [],
  topics: [],
  subscriptions: [], // Keeping for backward compatibility
  subscriptionsByTopic: {}, // { topicName: [subscriptions] }
  selectedQueue: null,
  selectedTopic: null,
  selectedSubscription: null,
  messages: [],
  deadLetterMessages: [],
  allMessages: [], // Combined active + dead letter messages
  messageFilter: 'active', // 'active', 'deadletter', 'all'
  loading: false,
  error: null,

  messagePreview: null,
  messageCount: 50, // Selected message count for loading
  // Tree expand/collapse states
  expandedStates: {
    connections: true, // Start expanded by default
    connectionChildren: {}, // { connectionId: boolean } - tracks if connection's children are expanded
    queues: false,
    topics: false,
    topicSubscriptions: {}, // { topicName: boolean } - tracks if topic's subscriptions section is expanded
    topicDetails: {} // { topicName: boolean } - tracks if topic itself is expanded to show subscriptions tab
  },
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
    
    case 'SET_SUBSCRIPTIONS_BY_TOPIC':
      return { 
        ...state, 
        subscriptionsByTopic: {
          ...state.subscriptionsByTopic,
          [action.payload.topicName]: action.payload.subscriptions
        }
      };
    
    case 'SET_SELECTED_QUEUE':
      return { 
        ...state, 
        selectedQueue: action.payload,
        selectedTopic: null,
        selectedSubscription: null,
        messages: [],
        deadLetterMessages: [],
        allMessages: [],
        messageFilter: 'active',
        pagination: {
          hasMoreActive: true,
          hasMoreDeadLetter: true,
          batchSize: 50,
        },
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
        allMessages: [],
        messageFilter: 'all',
      };
    
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    
    case 'SET_DEAD_LETTER_MESSAGES':
      return { ...state, deadLetterMessages: action.payload };
    
    case 'SET_ALL_MESSAGES':
      return { ...state, allMessages: action.payload };
    
    case 'SET_MESSAGE_FILTER':
      return { ...state, messageFilter: action.payload };
    
    case 'SET_MESSAGE_COUNT':
      return { ...state, messageCount: action.payload };
    

    
    case 'TOGGLE_CONNECTIONS_EXPANDED':
      return { 
        ...state, 
        expandedStates: { 
          ...state.expandedStates, 
          connections: !state.expandedStates.connections 
        } 
      };
    
    case 'TOGGLE_CONNECTION_CHILDREN':
      return { 
        ...state, 
        expandedStates: { 
          ...state.expandedStates, 
          connectionChildren: {
            ...state.expandedStates.connectionChildren,
            [action.payload]: !state.expandedStates.connectionChildren[action.payload]
          }
        } 
      };
    
    case 'TOGGLE_QUEUES_EXPANDED':
      return { 
        ...state, 
        expandedStates: { 
          ...state.expandedStates, 
          queues: !state.expandedStates.queues 
        } 
      };
    
    case 'TOGGLE_TOPICS_EXPANDED':
      return { 
        ...state, 
        expandedStates: { 
          ...state.expandedStates, 
          topics: !state.expandedStates.topics 
        } 
      };
    
    case 'TOGGLE_TOPIC_DETAILS_EXPANDED':
      return { 
        ...state, 
        expandedStates: { 
          ...state.expandedStates, 
          topicDetails: {
            ...state.expandedStates.topicDetails,
            [action.payload]: !state.expandedStates.topicDetails[action.payload]
          }
        } 
      };
    
    case 'TOGGLE_TOPIC_SUBSCRIPTIONS_EXPANDED':
      return { 
        ...state, 
        expandedStates: { 
          ...state.expandedStates, 
          topicSubscriptions: {
            ...state.expandedStates.topicSubscriptions,
            [action.payload]: !state.expandedStates.topicSubscriptions[action.payload]
          }
        } 
      };
    
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
      
      // If the disconnected connection was the active one, clear related data
      if (state.activeConnection?.id === connectionId) {
        dispatch({ type: 'SET_ACTIVE_CONNECTION', payload: null });
        dispatch({ type: 'SET_QUEUES', payload: [] });
        dispatch({ type: 'SET_TOPICS', payload: [] });
        dispatch({ type: 'SET_SELECTED_QUEUE', payload: null });
        dispatch({ type: 'SET_SELECTED_TOPIC', payload: null });
        dispatch({ type: 'SET_SELECTED_SUBSCRIPTION', payload: null });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setActiveConnection = async (connection) => {
    dispatch({ type: 'SET_ACTIVE_CONNECTION', payload: connection });
    
    // Load queues and topics counts immediately when connection is established
    if (connection) {
      try {
        // Load both queues and topics in parallel to get their counts
        await Promise.all([
          loadQueues(),
          loadTopics()
        ]);
      } catch (error) {
        console.error('Error loading queues and topics for connection:', error);
      }
    }
  };

  const toggleConnectionChildren = (connectionId) => {
    dispatch({ type: 'TOGGLE_CONNECTION_CHILDREN', payload: connectionId });
  };

  const loadQueues = async () => {
    if (!state.activeConnection) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const queues = await azureServiceBusService.getQueues(state.activeConnection.id);
      dispatch({ type: 'SET_QUEUES', payload: queues });
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
      dispatch({ type: 'SET_SUBSCRIPTIONS_BY_TOPIC', payload: { topicName, subscriptions } });
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
    // Don't automatically load subscriptions - let user expand to see them
  };

  const selectSubscription = async (subscription) => {
    dispatch({ type: 'SET_SELECTED_SUBSCRIPTION', payload: subscription });
    await loadAllSubscriptionMessages(subscription.topicName, subscription.name);
    setMessageFilter('all');
  };

  const loadQueueMessages = async (queueName, count = null) => {
    if (!state.activeConnection) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const actualCount = count || state.messageCount;
      const maxMessages = actualCount === 'all' ? 1000 : actualCount;
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

  const loadSubscriptionMessages = async (topicName, subscriptionName, count = null) => {
    if (!state.activeConnection) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const actualCount = count || state.messageCount;
      const maxMessages = actualCount === 'all' ? 1000 : actualCount;
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

  const loadSubscriptionDeadLetterMessages = async (topicName, subscriptionName, count = null) => {
    if (!state.activeConnection) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const actualCount = count || state.messageCount;
      const maxMessages = actualCount === 'all' ? 1000 : actualCount;
      const messages = await azureServiceBusService.getSubscriptionDeadLetterMessages(
        state.activeConnection.id, 
        topicName, 
        subscriptionName, 
        maxMessages
      );
      dispatch({ type: 'SET_DEAD_LETTER_MESSAGES', payload: messages });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadAllSubscriptionMessages = async (topicName, subscriptionName, count = null) => {
    if (!state.activeConnection) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const actualCount = count || state.messageCount;
      const maxMessages = actualCount === 'all' ? 1000 : actualCount;
      
      // Load both active and dead letter messages
      const [activeMessages, deadLetterMessages] = await Promise.all([
        azureServiceBusService.peekSubscriptionMessages(state.activeConnection.id, topicName, subscriptionName, maxMessages),
        azureServiceBusService.getSubscriptionDeadLetterMessages(state.activeConnection.id, topicName, subscriptionName, maxMessages)
      ]);
      
      dispatch({ type: 'SET_MESSAGES', payload: activeMessages });
      dispatch({ type: 'SET_DEAD_LETTER_MESSAGES', payload: deadLetterMessages });
      
      // Combine messages with type indicator
      const combinedMessages = [
        ...activeMessages.map(msg => ({ ...msg, messageType: 'active' })),
        ...deadLetterMessages.map(msg => ({ ...msg, messageType: 'deadletter' }))
      ];
      
      dispatch({ type: 'SET_ALL_MESSAGES', payload: combinedMessages });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadDeadLetterMessages = async (queueName, count = null) => {
    if (!state.activeConnection) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const actualCount = count || state.messageCount;
      const maxMessages = actualCount === 'all' ? 1000 : actualCount;
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



  const loadAllMessageTypes = async (queueName, count = null) => {
    if (!state.activeConnection) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const actualCount = count || state.messageCount;
      const maxMessages = actualCount === 'all' ? 1000 : actualCount;
      
      // Load both active and dead letter messages
      const [activeMessages, deadLetterMessages] = await Promise.all([
        azureServiceBusService.peekMessages(state.activeConnection.id, queueName, maxMessages),
        azureServiceBusService.getDeadLetterMessages(state.activeConnection.id, queueName, maxMessages)
      ]);
      
      dispatch({ type: 'SET_MESSAGES', payload: activeMessages });
      dispatch({ type: 'SET_DEAD_LETTER_MESSAGES', payload: deadLetterMessages });
      
      // Combine messages with type indicator
      const combinedMessages = [
        ...activeMessages.map(msg => ({ ...msg, messageType: 'active' })),
        ...deadLetterMessages.map(msg => ({ ...msg, messageType: 'deadletter' }))
      ];
      
      dispatch({ type: 'SET_ALL_MESSAGES', payload: combinedMessages });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setMessageFilter = (filter) => {
    dispatch({ type: 'SET_MESSAGE_FILTER', payload: filter });
  };

  const setMessageCount = (count) => {
    dispatch({ type: 'SET_MESSAGE_COUNT', payload: count });
  };

  const toggleConnectionsExpanded = () => {
    dispatch({ type: 'TOGGLE_CONNECTIONS_EXPANDED' });
  };

  const toggleQueuesExpanded = () => {
    dispatch({ type: 'TOGGLE_QUEUES_EXPANDED' });
    // Data should already be loaded when connection was established
    // No need to reload unless queues array is empty
    if (!state.expandedStates.queues && state.queues.length === 0) {
      loadQueues();
    }
  };

  const toggleTopicsExpanded = () => {
    dispatch({ type: 'TOGGLE_TOPICS_EXPANDED' });
    // Data should already be loaded when connection was established
    // No need to reload unless topics array is empty
    if (!state.expandedStates.topics && state.topics.length === 0) {
      loadTopics();
    }
  };

  const toggleTopicDetailsExpanded = (topicName) => {
    dispatch({ type: 'TOGGLE_TOPIC_DETAILS_EXPANDED', payload: topicName });
  };

  const toggleTopicSubscriptionsExpanded = (topicName) => {
    dispatch({ type: 'TOGGLE_TOPIC_SUBSCRIPTIONS_EXPANDED', payload: topicName });
    if (!state.expandedStates.topicSubscriptions[topicName]) {
      loadSubscriptions(topicName);
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
    toggleConnectionChildren,
    loadQueues,
    loadTopics,
    loadSubscriptions,
    selectQueue,
    selectTopic,
    selectSubscription,
    loadQueueMessages,
    loadSubscriptionMessages,
    loadSubscriptionDeadLetterMessages,
    loadAllSubscriptionMessages,
    loadDeadLetterMessages,
    loadAllMessageTypes,
    setMessageFilter,
    setMessageCount,
    toggleConnectionsExpanded,
    toggleQueuesExpanded,
    toggleTopicsExpanded,
    toggleTopicDetailsExpanded,
    toggleTopicSubscriptionsExpanded,
    receiveMessage,
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