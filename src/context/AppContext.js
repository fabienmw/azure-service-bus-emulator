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
  queueMessageCounts: {}, // { queueName: messageCount }
  subscriptionMessageCounts: {}, // { topicName_subscriptionName: messageCount }
  selectedQueue: null,
  selectedTopic: null,
  selectedSubscription: null,
  
  // Separate message state for queues
  queueMessages: [],
  queueDeadLetterMessages: [],
  queueAllMessages: [],
  
  // Separate message state for subscriptions  
  subscriptionMessages: [],
  subscriptionDeadLetterMessages: [],
  subscriptionAllMessages: [],
  
  // Pagination state
  pagination: {
    currentPage: 1,
    pageSize: 20,
    totalItems: 0
  },
  
  // Shared UI state
  messageFilter: 'active',
  messageCount: 20,
  loading: false,
  error: null,
  messagePreview: null,
  expandedStates: {
    connections: true,
    connectionChildren: {},
    queues: false,
    topics: false,
    topicDetails: {},
    topicSubscriptions: {}
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
    
    case 'UPDATE_CONNECTION_STATUS':
      return {
        ...state,
        connections: state.connections.map(conn => 
          conn.id === action.payload.id 
            ? { ...conn, connected: action.payload.connected }
            : conn
        ),
        activeConnection: state.activeConnection?.id === action.payload.id 
          ? { ...state.activeConnection, connected: action.payload.connected }
          : state.activeConnection,
      };
    
    case 'ADD_SAVED_CONNECTION':
      return { 
        ...state, 
        connections: [...state.connections, action.payload],
      };
    
    case 'SET_ACTIVE_CONNECTION':
      return { 
        ...state, 
        activeConnection: action.payload,
        queues: [],
        topics: [],
        subscriptions: [],
        queueMessageCounts: {},
        subscriptionMessageCounts: {},
        selectedQueue: null,
        selectedTopic: null,
        selectedSubscription: null,
        queueMessages: [],
        queueDeadLetterMessages: [],
        queueAllMessages: [],
        subscriptionMessages: [],
        subscriptionDeadLetterMessages: [],
        subscriptionAllMessages: [],
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
    
    case 'SET_QUEUE_MESSAGE_COUNTS':
      return { 
        ...state, 
        queueMessageCounts: {
          ...state.queueMessageCounts,
          ...action.payload
        }
      };
    
    case 'SET_SUBSCRIPTION_MESSAGE_COUNTS':
      return { 
        ...state, 
        subscriptionMessageCounts: {
          ...state.subscriptionMessageCounts,
          ...action.payload
        }
      };
    
    case 'SET_SELECTED_QUEUE':
      return { 
        ...state, 
        selectedQueue: action.payload,
        selectedTopic: null,
        selectedSubscription: null,
        subscriptionMessages: [],
        subscriptionDeadLetterMessages: [],
        subscriptionAllMessages: [],
        messageFilter: 'all',
      };
    
    case 'SET_SELECTED_TOPIC':
      return { 
        ...state, 
        selectedTopic: action.payload,
        selectedQueue: null,
        selectedSubscription: null,
        queueMessages: [],
        queueDeadLetterMessages: [],
      };
    
    case 'SET_SELECTED_SUBSCRIPTION':
      return { 
        ...state, 
        selectedSubscription: action.payload,
        selectedQueue: null,
        queueMessages: [],
        queueDeadLetterMessages: [],
        queueAllMessages: [],
        subscriptionMessages: [],
        subscriptionDeadLetterMessages: [],
        subscriptionAllMessages: [],
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
    
    // Queue message actions
    case 'SET_QUEUE_MESSAGES':
      return { ...state, queueMessages: action.payload };
    
    case 'SET_QUEUE_DEAD_LETTER_MESSAGES':
      return { ...state, queueDeadLetterMessages: action.payload };
    
    case 'SET_QUEUE_ALL_MESSAGES':
      return { ...state, queueAllMessages: action.payload };
    
    // Subscription message actions
    case 'SET_SUBSCRIPTION_MESSAGES':
      return { ...state, subscriptionMessages: action.payload };
    
    case 'SET_SUBSCRIPTION_DEAD_LETTER_MESSAGES':
      return { ...state, subscriptionDeadLetterMessages: action.payload };
    
    case 'SET_SUBSCRIPTION_ALL_MESSAGES':
      return { ...state, subscriptionAllMessages: action.payload };
    
    // Pagination actions
    case 'SET_PAGINATION':
      return { 
        ...state, 
        pagination: { 
          ...state.pagination, 
          ...action.payload 
        } 
      };
    
    case 'SET_PAGE':
      return { 
        ...state, 
        pagination: { 
          ...state.pagination, 
          currentPage: action.payload 
        } 
      };
    
    case 'SET_PAGE_SIZE':
      return { 
        ...state, 
        pagination: { 
          ...state.pagination, 
          currentPage: 1, // Reset to first page when changing page size
          pageSize: action.payload 
        } 
      };
    
    default:
      return state;
  }
}

// Helper functions for localStorage
const SAVED_CONNECTIONS_KEY = 'azure-service-bus-saved-connections';

const loadSavedConnections = () => {
  try {
    const saved = localStorage.getItem(SAVED_CONNECTIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading saved connections:', error);
    return [];
  }
};

const saveSavedConnections = (connections) => {
  try {
    localStorage.setItem(SAVED_CONNECTIONS_KEY, JSON.stringify(connections));
  } catch (error) {
    console.error('Error saving connections:', error);
  }
};

const addSavedConnection = (connection) => {
  const savedConnections = loadSavedConnections();
  const updatedConnections = savedConnections.filter(conn => conn.id !== connection.id);
  updatedConnections.push(connection);
  saveSavedConnections(updatedConnections);
};

const removeSavedConnection = (connectionId) => {
  const savedConnections = loadSavedConnections();
  const updatedConnections = savedConnections.filter(conn => conn.id !== connectionId);
  saveSavedConnections(updatedConnections);
};

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // Load existing connections on startup
    const connections = azureServiceBusService.getAllConnections();
    
    // Load saved connections from localStorage
    const savedConnections = loadSavedConnections();
    
    // Merge active connections with saved ones, prioritizing saved connection data
    const mergedConnections = [];
    
    // Add all active connections first
    connections.forEach(activeConn => {
      const savedConn = savedConnections.find(saved => saved.id === activeConn.id);
      if (savedConn) {
        // If connection exists in both, merge them with saved connection taking priority for connection string
        mergedConnections.push({
          ...activeConn,
          connectionString: savedConn.connectionString,
          saved: true
        });
      } else {
        // Just active connection
        mergedConnections.push(activeConn);
      }
    });
    
    // Add saved connections that are not in active connections (disconnected saved connections)
    savedConnections.forEach(savedConn => {
      if (!connections.find(activeConn => activeConn.id === savedConn.id)) {
        mergedConnections.push({
          ...savedConn,
          connected: false // Mark as disconnected since not in active connections
        });
      }
    });
    
    dispatch({ type: 'SET_CONNECTIONS', payload: mergedConnections });
  }, []);

  const createConnection = async (connectionString, name, saveConnection = false) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const connection = await azureServiceBusService.createConnection(connectionString, name);
      dispatch({ type: 'ADD_CONNECTION', payload: connection });
      
      // If saving, add to localStorage
      if (saveConnection) {
        const savedConnection = {
          ...connection,
          connectionString, // Store the connection string for saved connections
          saved: true
        };
        addSavedConnection(savedConnection);
      }
      
      // Set as active connection and immediately load counts
      dispatch({ type: 'SET_ACTIVE_CONNECTION', payload: connection });
      
      try {
        // Load queues and topics in parallel to get their counts immediately
        const [queues, topics] = await Promise.all([
          azureServiceBusService.getQueues(connection.id),
          azureServiceBusService.getTopics(connection.id)
        ]);
        
        dispatch({ type: 'SET_QUEUES', payload: queues });
        dispatch({ type: 'SET_TOPICS', payload: topics });
        
        // Load queue message counts
        const queueMessageCounts = queues.reduce((acc, queue) => {
          acc[queue.name] = queue.messageCount || 0;
          return acc;
        }, {});
        dispatch({ type: 'SET_QUEUE_MESSAGE_COUNTS', payload: queueMessageCounts });
        
        // Load subscriptions for all topics
        if (topics.length > 0) {
          const subscriptionPromises = topics.map(async (topic) => {
            try {
              const subscriptions = await azureServiceBusService.getSubscriptions(connection.id, topic.name);
              return { topicName: topic.name, subscriptions };
            } catch (error) {
              console.error(`Error loading subscriptions for topic ${topic.name}:`, error);
              return { topicName: topic.name, subscriptions: [] };
            }
          });
          
          const subscriptionResults = await Promise.all(subscriptionPromises);
          
          // Update subscriptionsByTopic for each topic
          subscriptionResults.forEach(result => {
            dispatch({ type: 'SET_SUBSCRIPTIONS_BY_TOPIC', payload: result });
          });
        }
        
      } catch (loadError) {
        console.error('Error loading queues and topics for new connection:', loadError);
        // Don't fail the connection creation if loading counts fails
      }
      
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
      
      // Update connection status to disconnected instead of removing
      dispatch({ type: 'UPDATE_CONNECTION_STATUS', payload: { id: connectionId, connected: false } });
      
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

  const removeConnection = async (connectionId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Disconnect if connected
      const connection = state.connections.find(conn => conn.id === connectionId);
      if (connection?.connected) {
        await azureServiceBusService.disconnectConnection(connectionId);
      }
      
      // Remove from saved connections
      removeSavedConnection(connectionId);
      
      // Remove from state
      dispatch({ type: 'REMOVE_CONNECTION', payload: connectionId });
      
      // If the removed connection was the active one, clear related data
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

  const reconnectConnection = async (connection) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      // Get connection string from localStorage if not in connection object
      let connectionString = connection.connectionString;
      if (!connectionString) {
        const savedConnections = loadSavedConnections();
        const savedConnection = savedConnections.find(saved => saved.id === connection.id);
        connectionString = savedConnection?.connectionString;
      }
      
      // Check if connection string exists
      if (!connectionString) {
        throw new Error('Connection string not found for saved connection. Please check if the connection was saved properly.');
      }
      
      // Use the connection string to reconnect
      const reconnectedConnection = await azureServiceBusService.createConnection(
        connectionString, 
        connection.name
      );
      
      // Update the connection status in the connections array
      dispatch({ type: 'UPDATE_CONNECTION_STATUS', payload: { id: connection.id, connected: true } });
      
      // Set as active connection first
      dispatch({ type: 'SET_ACTIVE_CONNECTION', payload: reconnectedConnection });
      
      try {
        // Load queues and topics immediately
        const [queues, topics] = await Promise.all([
          azureServiceBusService.getQueues(reconnectedConnection.id),
          azureServiceBusService.getTopics(reconnectedConnection.id)
        ]);
        
        dispatch({ type: 'SET_QUEUES', payload: queues });
        dispatch({ type: 'SET_TOPICS', payload: topics });
        
        // Load queue message counts
        const queueMessageCounts = queues.reduce((acc, queue) => {
          acc[queue.name] = queue.messageCount || 0;
          return acc;
        }, {});
        dispatch({ type: 'SET_QUEUE_MESSAGE_COUNTS', payload: queueMessageCounts });
        
        // Load subscriptions for all topics
        if (topics.length > 0) {
          const subscriptionPromises = topics.map(async (topic) => {
            try {
              const subscriptions = await azureServiceBusService.getSubscriptions(reconnectedConnection.id, topic.name);
              return { topicName: topic.name, subscriptions };
            } catch (error) {
              console.error(`Error loading subscriptions for topic ${topic.name}:`, error);
              return { topicName: topic.name, subscriptions: [] };
            }
          });
          
          const subscriptionResults = await Promise.all(subscriptionPromises);
          
          // Update subscriptionsByTopic for each topic
          subscriptionResults.forEach(result => {
            dispatch({ type: 'SET_SUBSCRIPTIONS_BY_TOPIC', payload: result });
          });
          
          // Load subscription message counts for all topics
          subscriptionResults.forEach(result => {
            if (result.subscriptions.length > 0) {
              const subscriptionMessageCounts = result.subscriptions.reduce((acc, subscription) => {
                const key = `${result.topicName}_${subscription.name}`;
                acc[key] = subscription.messageCount || 0;
                return acc;
              }, {});
              dispatch({ type: 'SET_SUBSCRIPTION_MESSAGE_COUNTS', payload: subscriptionMessageCounts });
            }
          });
        }
        
      } catch (loadError) {
        console.error('Error loading data for reconnected connection:', loadError);
        // Don't fail the reconnection if loading counts fails
      }
      
      return reconnectedConnection;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setActiveConnection = async (connection) => {
    dispatch({ type: 'SET_ACTIVE_CONNECTION', payload: connection });
    
    // If switching to a connection that doesn't have loaded data yet, load it
    if (connection && (state.queues.length === 0 || state.topics.length === 0)) {
      try {
        // Load both queues and topics in parallel to get their counts
        await Promise.all([
          loadQueues(),
          loadTopics()
        ]);
        
        // Also load all subscriptions for all topics immediately
        await loadAllTopicsSubscriptions();
        
        // Load message counts immediately after loading entities
        await loadQueueMessageCounts();
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

  const loadQueueMessageCounts = async () => {
    if (!state.activeConnection || state.queues.length === 0) return;
    
    try {
      // Use the message counts that should already be available from queue metadata
      const queueMessageCounts = state.queues.reduce((acc, queue) => {
        acc[queue.name] = queue.messageCount || 0;
        return acc;
      }, {});
      
      dispatch({ type: 'SET_QUEUE_MESSAGE_COUNTS', payload: queueMessageCounts });
    } catch (error) {
      console.error('Error loading queue message counts:', error);
    }
  };

  const loadSubscriptionMessageCounts = async (topicName) => {
    if (!state.activeConnection || !state.subscriptionsByTopic[topicName]) return;
    
    try {
      const subscriptions = state.subscriptionsByTopic[topicName];
      
      // Use the message counts that should already be available from subscription metadata
      const subscriptionMessageCounts = subscriptions.reduce((acc, subscription) => {
        const key = `${topicName}_${subscription.name}`;
        acc[key] = subscription.messageCount || 0;
        return acc;
      }, {});
      
      dispatch({ type: 'SET_SUBSCRIPTION_MESSAGE_COUNTS', payload: subscriptionMessageCounts });
    } catch (error) {
      console.error(`Error loading subscription message counts for topic ${topicName}:`, error);
    }
  };

  const loadAllTopicsSubscriptions = async () => {
    if (!state.activeConnection || state.topics.length === 0) return;
    
    try {
      // Load subscriptions for all topics in parallel
      const subscriptionPromises = state.topics.map(async (topic) => {
        try {
          const subscriptions = await azureServiceBusService.getSubscriptions(state.activeConnection.id, topic.name);
          return { topicName: topic.name, subscriptions };
        } catch (error) {
          console.error(`Error loading subscriptions for topic ${topic.name}:`, error);
          return { topicName: topic.name, subscriptions: [] };
        }
      });
      
      const subscriptionResults = await Promise.all(subscriptionPromises);
      
      // Update subscriptionsByTopic for each topic
      subscriptionResults.forEach(result => {
        dispatch({ type: 'SET_SUBSCRIPTIONS_BY_TOPIC', payload: result });
      });
    } catch (error) {
      console.error('Error loading subscriptions for all topics:', error);
    }
  };

  const selectQueue = async (queue) => {
    dispatch({ type: 'SET_SELECTED_QUEUE', payload: queue });
    // Load all message types when selecting queue (for consistency with subscriptions)
    await loadAllMessageTypes(queue.name);
  };

  const selectTopic = (topic) => {
    dispatch({ type: 'SET_SELECTED_TOPIC', payload: topic });
  };

  const selectSubscription = async (subscription) => {
    console.log(`🎯 === SUBSCRIPTION SELECTION STARTED ===`);
    console.log(`📋 Subscription:`, subscription);
    console.log(`📊 Current state before selection:`, {
      subscriptionMessages: state.subscriptionMessages.length,
      messageFilter: state.messageFilter,
      loading: state.loading
    });
    
    console.log(`🔄 Dispatching SET_SELECTED_SUBSCRIPTION...`);
    dispatch({ type: 'SET_SELECTED_SUBSCRIPTION', payload: subscription });
    
    console.log(`📱 Starting to load all subscription messages...`);
    try {
      await loadAllSubscriptionMessages(subscription.topicName, subscription.name);
      console.log(`✅ === SUBSCRIPTION SELECTION COMPLETED ===`);
    } catch (error) {
      console.error(`❌ Error during subscription selection:`, error);
    }
  };

  const loadQueueMessages = async (queueName) => {
    if (!state.activeConnection) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Clear existing queue messages first
      console.log(`🔄 Loading all queue messages: ${queueName}`);
      dispatch({ type: 'SET_QUEUE_MESSAGES', payload: [] });
      
      // Fetch all messages (limit to 10,000 for memory management)
      const maxMessages = 10000;
      console.log(`📥 Fetching up to ${maxMessages} queue messages from Azure Service Bus...`);
      
      const messages = await azureServiceBusService.peekMessages(
        state.activeConnection.id, 
        queueName, 
        maxMessages
      );
      
      console.log(`✅ Received ${messages.length} queue messages from Azure Service Bus`);
      dispatch({ type: 'SET_QUEUE_MESSAGES', payload: messages });
      
      // Set up pagination
      dispatch({ type: 'SET_PAGINATION', payload: { 
        currentPage: 1, 
        totalItems: messages.length 
      }});
      
      if (messages.length >= maxMessages) {
        console.warn(`⚠️  Reached maximum limit of ${maxMessages} messages. There may be more messages available.`);
      }
      
    } catch (error) {
      console.error('❌ Error loading queue messages:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadSubscriptionMessages = async (topicName, subscriptionName) => {
    if (!state.activeConnection) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Clear existing subscription messages first
      console.log(`🔄 Loading all subscription messages: ${topicName}/${subscriptionName}`);
      dispatch({ type: 'SET_SUBSCRIPTION_MESSAGES', payload: [] });
      
      // Fetch all messages (limit to 10,000 for memory management)
      const maxMessages = 10000;
      console.log(`📥 Fetching up to ${maxMessages} subscription messages from Azure Service Bus...`);
      
      const messages = await azureServiceBusService.peekSubscriptionMessages(
        state.activeConnection.id, 
        topicName, 
        subscriptionName, 
        maxMessages
      );
      
      console.log(`✅ Received ${messages.length} subscription messages from Azure Service Bus`);
      dispatch({ type: 'SET_SUBSCRIPTION_MESSAGES', payload: messages });
      
      // Set up pagination
      dispatch({ type: 'SET_PAGINATION', payload: { 
        currentPage: 1, 
        totalItems: messages.length 
      }});
      
      if (messages.length >= maxMessages) {
        console.warn(`⚠️  Reached maximum limit of ${maxMessages} subscription messages. There may be more messages available.`);
      }
      
    } catch (error) {
      console.error('❌ Error loading subscription messages:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadSubscriptionDeadLetterMessages = async (topicName, subscriptionName) => {
    if (!state.activeConnection) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Clear existing subscription dead letter messages first
      console.log(`🔄 Loading all subscription dead letter messages: ${topicName}/${subscriptionName}`);
      dispatch({ type: 'SET_SUBSCRIPTION_DEAD_LETTER_MESSAGES', payload: [] });
      
      // Fetch all dead letter messages (limit to 10,000 for memory management)
      const maxMessages = 10000;
      console.log(`📥 Fetching up to ${maxMessages} subscription dead letter messages from Azure Service Bus...`);
      
      const messages = await azureServiceBusService.getSubscriptionDeadLetterMessages(
        state.activeConnection.id, 
        topicName, 
        subscriptionName, 
        maxMessages
      );
      
      console.log(`✅ Received ${messages.length} subscription dead letter messages from Azure Service Bus`);
      dispatch({ type: 'SET_SUBSCRIPTION_DEAD_LETTER_MESSAGES', payload: messages });
      
      // Set up pagination
      dispatch({ type: 'SET_PAGINATION', payload: { 
        currentPage: 1, 
        totalItems: messages.length 
      }});
      
      if (messages.length >= maxMessages) {
        console.warn(`⚠️  Reached maximum limit of ${maxMessages} subscription dead letter messages. There may be more messages available.`);
      }
      
    } catch (error) {
      console.error('❌ Error loading subscription dead letter messages:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadAllSubscriptionMessages = async (topicName, subscriptionName) => {
    if (!state.activeConnection) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Clear existing subscription messages first
      console.log(`🔄 Loading ALL subscription messages: ${topicName}/${subscriptionName}`);
      dispatch({ type: 'SET_SUBSCRIPTION_MESSAGES', payload: [] });
      dispatch({ type: 'SET_SUBSCRIPTION_DEAD_LETTER_MESSAGES', payload: [] });
      dispatch({ type: 'SET_SUBSCRIPTION_ALL_MESSAGES', payload: [] });
      
      // Fetch all messages (limit to 10,000 each for memory management)
      const maxMessages = 10000;
      console.log(`📥 Fetching up to ${maxMessages} messages of each type from Azure Service Bus...`);
      
      // Load both active and dead letter messages
      const [activeMessages, deadLetterMessages] = await Promise.all([
        azureServiceBusService.peekSubscriptionMessages(state.activeConnection.id, topicName, subscriptionName, maxMessages),
        azureServiceBusService.getSubscriptionDeadLetterMessages(state.activeConnection.id, topicName, subscriptionName, maxMessages)
      ]);
      
      console.log(`✅ Received ${activeMessages.length} active + ${deadLetterMessages.length} dead letter subscription messages`);
      
      dispatch({ type: 'SET_SUBSCRIPTION_MESSAGES', payload: activeMessages });
      dispatch({ type: 'SET_SUBSCRIPTION_DEAD_LETTER_MESSAGES', payload: deadLetterMessages });
      
      // Combine messages with type indicator
      const combinedMessages = [
        ...activeMessages.map(msg => ({ ...msg, messageType: 'active' })),
        ...deadLetterMessages.map(msg => ({ ...msg, messageType: 'deadletter' }))
      ];
      
      dispatch({ type: 'SET_SUBSCRIPTION_ALL_MESSAGES', payload: combinedMessages });
      
      // Set up pagination for combined view
      dispatch({ type: 'SET_PAGINATION', payload: { 
        currentPage: 1, 
        totalItems: combinedMessages.length 
      }});
      
      const totalMessages = activeMessages.length + deadLetterMessages.length;
      if (totalMessages >= maxMessages * 2) {
        console.warn(`⚠️  Reached maximum limit of ${maxMessages * 2} total subscription messages. There may be more messages available.`);
      }
      
    } catch (error) {
      console.error('❌ Error loading all subscription messages:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadDeadLetterMessages = async (queueName) => {
    if (!state.activeConnection) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Clear existing queue dead letter messages first
      console.log(`🔄 Loading all queue dead letter messages: ${queueName}`);
      dispatch({ type: 'SET_QUEUE_DEAD_LETTER_MESSAGES', payload: [] });
      
      // Fetch all dead letter messages (limit to 10,000 for memory management)
      const maxMessages = 10000;
      console.log(`📥 Fetching up to ${maxMessages} queue dead letter messages from Azure Service Bus...`);
      
      const messages = await azureServiceBusService.getDeadLetterMessages(
        state.activeConnection.id, 
        queueName, 
        maxMessages
      );
      
      console.log(`✅ Received ${messages.length} queue dead letter messages from Azure Service Bus`);
      dispatch({ type: 'SET_QUEUE_DEAD_LETTER_MESSAGES', payload: messages });
      
      // Set up pagination
      dispatch({ type: 'SET_PAGINATION', payload: { 
        currentPage: 1, 
        totalItems: messages.length 
      }});
      
      if (messages.length >= maxMessages) {
        console.warn(`⚠️  Reached maximum limit of ${maxMessages} dead letter messages. There may be more messages available.`);
      }
      
    } catch (error) {
      console.error('❌ Error loading queue dead letter messages:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadAllMessageTypes = async (queueName) => {
    if (!state.activeConnection) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Clear existing queue messages first
      console.log(`🔄 Loading ALL queue message types: ${queueName}`);
      dispatch({ type: 'SET_QUEUE_MESSAGES', payload: [] });
      dispatch({ type: 'SET_QUEUE_DEAD_LETTER_MESSAGES', payload: [] });
      dispatch({ type: 'SET_QUEUE_ALL_MESSAGES', payload: [] });
      
      // Fetch all messages (limit to 10,000 each for memory management)
      const maxMessages = 10000;
      console.log(`📥 Fetching up to ${maxMessages} messages of each type from Azure Service Bus...`);
      
      // Load both active and dead letter messages
      const [activeMessages, deadLetterMessages] = await Promise.all([
        azureServiceBusService.peekMessages(state.activeConnection.id, queueName, maxMessages),
        azureServiceBusService.getDeadLetterMessages(state.activeConnection.id, queueName, maxMessages)
      ]);
      
      console.log(`✅ Received ${activeMessages.length} active + ${deadLetterMessages.length} dead letter queue messages`);
      
      dispatch({ type: 'SET_QUEUE_MESSAGES', payload: activeMessages });
      dispatch({ type: 'SET_QUEUE_DEAD_LETTER_MESSAGES', payload: deadLetterMessages });
      
      // Combine messages with type indicator
      const combinedMessages = [
        ...activeMessages.map(msg => ({ ...msg, messageType: 'active' })),
        ...deadLetterMessages.map(msg => ({ ...msg, messageType: 'deadletter' }))
      ];
      
      dispatch({ type: 'SET_QUEUE_ALL_MESSAGES', payload: combinedMessages });
      
      // Set up pagination for combined view
      dispatch({ type: 'SET_PAGINATION', payload: { 
        currentPage: 1, 
        totalItems: combinedMessages.length 
      }});
      
      const totalMessages = activeMessages.length + deadLetterMessages.length;
      if (totalMessages >= maxMessages * 2) {
        console.warn(`⚠️  Reached maximum limit of ${maxMessages * 2} total messages. There may be more messages available.`);
      }
      
    } catch (error) {
      console.error('❌ Error loading all queue message types:', error);
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
    // When expanding queues, immediately load message counts for all queues
    if (!state.expandedStates.queues) {
      // Data should already be loaded when connection was established
      // No need to reload unless queues array is empty
      if (state.queues.length === 0) {
        loadQueues();
      } else {
        // Load message counts for all queues
        loadQueueMessageCounts();
      }
    }
  };

  const toggleTopicsExpanded = () => {
    dispatch({ type: 'TOGGLE_TOPICS_EXPANDED' });
    // When expanding topics, immediately load subscriptions for all topics
    if (!state.expandedStates.topics) {
      // Data should already be loaded when connection was established
      // No need to reload unless topics array is empty
      if (state.topics.length === 0) {
        loadTopics();
      } else {
        // Load subscriptions for all topics
        loadAllTopicsSubscriptions();
      }
    }
  };

  const toggleTopicDetailsExpanded = (topicName) => {
    dispatch({ type: 'TOGGLE_TOPIC_DETAILS_EXPANDED', payload: topicName });
  };

  const toggleTopicSubscriptionsExpanded = (topicName) => {
    dispatch({ type: 'TOGGLE_TOPIC_SUBSCRIPTIONS_EXPANDED', payload: topicName });
    // When expanding subscriptions for a topic, immediately load message counts
    if (!state.expandedStates.topicSubscriptions[topicName]) {
      // Load subscriptions if not already loaded
      if (!state.subscriptionsByTopic[topicName]) {
        loadSubscriptions(topicName);
      } else {
        // Load message counts for all subscriptions in this topic
        loadSubscriptionMessageCounts(topicName);
      }
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

  // Pagination helper functions
  const setPage = (page) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  };

  const setPageSize = (pageSize) => {
    dispatch({ type: 'SET_PAGE_SIZE', payload: pageSize });
  };

  const getPaginatedMessages = (messages) => {
    const { currentPage, pageSize } = state.pagination;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return messages.slice(startIndex, endIndex);
  };

  const getTotalPages = (totalItems = null) => {
    const items = totalItems || state.pagination.totalItems;
    return Math.ceil(items / state.pagination.pageSize);
  };

  const value = {
    ...state,
    createConnection,
    disconnectConnection,
    removeConnection,
    reconnectConnection,
    setActiveConnection,
    toggleConnectionChildren,
    loadQueues,
    loadTopics,
    loadSubscriptions,
    loadQueueMessageCounts,
    loadSubscriptionMessageCounts,
    loadAllTopicsSubscriptions,
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
    // Pagination functions
    setPage,
    setPageSize,
    getPaginatedMessages,
    getTotalPages,
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