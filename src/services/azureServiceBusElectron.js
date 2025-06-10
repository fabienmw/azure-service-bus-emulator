// This service will communicate with the Electron main process for Azure Service Bus operations
const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };

class AzureServiceBusElectronService {
  constructor() {
    this.connections = new Map();
    this.isElectron = !!ipcRenderer;
  }

  async createConnection(connectionString, name) {
    if (!this.isElectron) {
      throw new Error('Azure Service Bus connections are only supported in Electron mode. Please run the application using "npm run electron-dev".');
    }

    try {
      const result = await ipcRenderer.invoke('azure-sb-connect', { connectionString, name });
      if (result.success) {
        const connection = {
          id: result.data.id,
          name,
          connectionString: '***hidden***',
          connected: true,
          createdAt: new Date(),
        };
        this.connections.set(connection.id, connection);
        return connection;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw new Error(`Failed to connect: ${error.message}`);
    }
  }

  getConnection(connectionId) {
    return this.connections.get(connectionId);
  }

  getAllConnections() {
    return Array.from(this.connections.values()).map(conn => ({
      id: conn.id,
      name: conn.name,
      connected: conn.connected,
      createdAt: conn.createdAt,
    }));
  }

  async disconnectConnection(connectionId) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      if (this.isElectron) {
        try {
          await ipcRenderer.invoke('azure-sb-disconnect', { connectionId });
        } catch (error) {
          console.error('Error disconnecting:', error);
        }
      }
      this.connections.delete(connectionId);
      return true;
    }
    return false;
  }

  // Queue operations
  async getQueues(connectionId) {
    if (!this.isElectron) {
      throw new Error('Azure Service Bus operations are only supported in Electron mode. Please run the application using "npm run electron-dev".');
    }

    try {
      const result = await ipcRenderer.invoke('azure-sb-get-queues', { connectionId });
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw new Error(`Failed to get queues: ${error.message}`);
    }
  }

  async getQueueDetails(connectionId, queueName) {
    if (!this.isElectron) {
      throw new Error('Azure Service Bus operations are only supported in Electron mode. Please run the application using "npm run electron-dev".');
    }

    try {
      const result = await ipcRenderer.invoke('azure-sb-get-queue-details', { connectionId, queueName });
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw new Error(`Failed to get queue details: ${error.message}`);
    }
  }

  async peekMessages(connectionId, queueName, maxMessages = 10) {
    if (!this.isElectron) {
      throw new Error('Azure Service Bus operations are only supported in Electron mode. Please run the application using "npm run electron-dev".');
    }

    try {
      const result = await ipcRenderer.invoke('azure-sb-get-queue-messages', { connectionId, queueName, maxMessages });
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw new Error(`Failed to peek messages: ${error.message}`);
    }
  }

  async receiveMessage(connectionId, queueName) {
    if (!this.isElectron) {
      throw new Error('Azure Service Bus operations are only supported in Electron mode. Please run the application using "npm run electron-dev".');
    }

    try {
      const result = await ipcRenderer.invoke('azure-sb-receive-message', { connectionId, queueName });
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw new Error(`Failed to receive message: ${error.message}`);
    }
  }

  async getDeadLetterMessages(connectionId, queueName, maxMessages = 10) {
    if (!this.isElectron) {
      throw new Error('Azure Service Bus operations are only supported in Electron mode. Please run the application using "npm run electron-dev".');
    }

    try {
      const result = await ipcRenderer.invoke('azure-sb-get-queue-dead-letter-messages', { connectionId, queueName, maxMessages });
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw new Error(`Failed to get dead letter messages: ${error.message}`);
    }
  }

  // Topic operations
  async getTopics(connectionId) {
    if (!this.isElectron) {
      throw new Error('Azure Service Bus operations are only supported in Electron mode. Please run the application using "npm run electron-dev".');
    }

    try {
      const result = await ipcRenderer.invoke('azure-sb-get-topics', { connectionId });
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw new Error(`Failed to get topics: ${error.message}`);
    }
  }

  async getSubscriptions(connectionId, topicName) {
    if (!this.isElectron) {
      throw new Error('Azure Service Bus operations are only supported in Electron mode. Please run the application using "npm run electron-dev".');
    }

    try {
      const result = await ipcRenderer.invoke('azure-sb-get-subscriptions', { connectionId, topicName });
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw new Error(`Failed to get subscriptions: ${error.message}`);
    }
  }

  async peekSubscriptionMessages(connectionId, topicName, subscriptionName, maxMessages = 10) {
    if (!this.isElectron) {
      throw new Error('Azure Service Bus operations are only supported in Electron mode. Please run the application using "npm run electron-dev".');
    }

    try {
      const result = await ipcRenderer.invoke('azure-sb-get-subscription-messages', { 
        connectionId, 
        topicName, 
        subscriptionName, 
        maxMessages 
      });
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw new Error(`Failed to peek subscription messages: ${error.message}`);
    }
  }

  async getSubscriptionDeadLetterMessages(connectionId, topicName, subscriptionName, maxMessages = 10) {
    if (!this.isElectron) {
      throw new Error('Azure Service Bus operations are only supported in Electron mode. Please run the application using "npm run electron-dev".');
    }

    try {
      const result = await ipcRenderer.invoke('azure-sb-get-subscription-dead-letter-messages', { 
        connectionId, 
        topicName, 
        subscriptionName, 
        maxMessages 
      });
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw new Error(`Failed to get subscription dead letter messages: ${error.message}`);
    }
  }

  async sendMessage(connectionId, queueName, messageBody, label = '', applicationProperties = {}) {
    if (!this.isElectron) {
      throw new Error('Azure Service Bus operations are only supported in Electron mode. Please run the application using "npm run electron-dev".');
    }

    try {
      const result = await ipcRenderer.invoke('azure-sb-send-message', {
        connectionId,
        queueName,
        messageBody,
        label,
        applicationProperties
      });
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  async sendTopicMessage(connectionId, topicName, messageBody, label = '', applicationProperties = {}) {
    if (!this.isElectron) {
      throw new Error('Azure Service Bus operations are only supported in Electron mode. Please run the application using "npm run electron-dev".');
    }

    try {
      const result = await ipcRenderer.invoke('azure-sb-send-topic-message', {
        connectionId,
        topicName,
        messageBody,
        label,
        applicationProperties
      });
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw new Error(`Failed to send topic message: ${error.message}`);
    }
  }

  async getAllSubscriptionMessages(connectionId, topicName, subscriptionName, maxMessages = 10) {
    if (!this.isElectron) {
      throw new Error('Azure Service Bus operations are only supported in Electron mode. Please run the application using "npm run electron-dev".');
    }

    try {
      const result = await ipcRenderer.invoke('azure-sb-get-all-subscription-messages', { 
        connectionId, 
        topicName, 
        subscriptionName, 
        maxMessages 
      });
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw new Error(`Failed to get all subscription messages: ${error.message}`);
    }
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export default new AzureServiceBusElectronService(); 