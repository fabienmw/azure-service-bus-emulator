// This service will communicate with the Electron main process for Azure Service Bus operations
const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };

class AzureServiceBusElectronService {
  constructor() {
    this.connections = new Map();
    this.isElectron = !!ipcRenderer;
  }

  async createConnection(connectionString, name) {
    if (!this.isElectron) {
      // Mock connection for web development
      const connection = {
        id: this.generateId(),
        name,
        connectionString: '***hidden***',
        connected: true,
        createdAt: new Date(),
      };
      this.connections.set(connection.id, connection);
      return connection;
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
      // Mock data for development
      return [
        {
          name: 'sample-queue-1',
          messageCount: 5,
          activeMessageCount: 3,
          deadLetterMessageCount: 2,
          sizeInBytes: 1024,
          status: 'Active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'sample-queue-2',
          messageCount: 0,
          activeMessageCount: 0,
          deadLetterMessageCount: 0,
          sizeInBytes: 0,
          status: 'Active',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];
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
      return {
        name: queueName,
        messageCount: 5,
        activeMessageCount: 3,
        deadLetterMessageCount: 2,
        sizeInBytes: 1024,
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
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
      // Mock messages
      return [
        {
          messageId: 'msg-001',
          body: { text: 'Hello, World!', timestamp: new Date().toISOString() },
          label: 'sample-message',
          correlationId: 'corr-001',
          enqueuedTimeUtc: new Date(),
          deliveryCount: 1,
          applicationProperties: { source: 'test-app' }
        },
        {
          messageId: 'msg-002',
          body: 'Simple text message',
          label: 'text-message',
          correlationId: 'corr-002',
          enqueuedTimeUtc: new Date(),
          deliveryCount: 0,
          applicationProperties: { priority: 'high' }
        }
      ];
    }

    try {
      const result = await ipcRenderer.invoke('azure-sb-peek-messages', { connectionId, queueName, maxMessages });
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
      // Mock received message
      return {
        messageId: 'msg-received-001',
        body: { action: 'process', data: 'sample data' },
        label: 'received-message',
        enqueuedTimeUtc: new Date(),
        deliveryCount: 1,
        applicationProperties: { processed: true }
      };
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
      return [
        {
          messageId: 'dlq-001',
          body: 'Failed message content',
          label: 'failed-message',
          enqueuedTimeUtc: new Date(),
          deliveryCount: 5,
          deadLetterReason: 'TTLExpired',
          deadLetterErrorDescription: 'Message exceeded time to live'
        }
      ];
    }

    try {
      const result = await ipcRenderer.invoke('azure-sb-get-dead-letter-messages', { connectionId, queueName, maxMessages });
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
      return [
        {
          name: 'sample-topic-1',
          sizeInBytes: 2048,
          status: 'Active',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];
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
      return [
        {
          name: 'subscription-1',
          topicName: topicName,
          messageCount: 3,
          activeMessageCount: 2,
          deadLetterMessageCount: 1,
          status: 'Active',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];
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
      return [
        {
          messageId: 'sub-msg-001',
          body: { event: 'user-registered', userId: '12345' },
          label: 'user-event',
          enqueuedTimeUtc: new Date(),
          deliveryCount: 0,
          applicationProperties: { eventType: 'registration' }
        }
      ];
    }

    try {
      const result = await ipcRenderer.invoke('azure-sb-peek-subscription-messages', { 
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

  async sendMessage(connectionId, queueName, messageBody, label = '', applicationProperties = {}) {
    if (!this.isElectron) {
      // Mock sending message
      return {
        messageId: 'sent-' + this.generateId(),
        success: true
      };
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
      // Mock sending topic message
      return {
        messageId: 'topic-sent-' + this.generateId(),
        success: true
      };
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

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export default new AzureServiceBusElectronService(); 