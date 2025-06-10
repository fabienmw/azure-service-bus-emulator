import { ServiceBusAdministrationClient, ServiceBusClient } from '@azure/service-bus';

class AzureServiceBusService {
  constructor() {
    this.connections = new Map();
  }

  async createConnection(connectionString, name) {
    try {
      const adminClient = new ServiceBusAdministrationClient(connectionString);
      const client = new ServiceBusClient(connectionString);
      
      // Test connection by getting namespace info
      await adminClient.getNamespaceProperties();
      
      const connection = {
        id: this.generateId(),
        name,
        connectionString,
        adminClient,
        client,
        connected: true,
        createdAt: new Date(),
      };
      
      this.connections.set(connection.id, connection);
      return connection;
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
      try {
        await connection.client.close();
        connection.connected = false;
        this.connections.delete(connectionId);
        return true;
      } catch (error) {
        console.error('Error disconnecting:', error);
        return false;
      }
    }
    return false;
  }

  // Queue operations
  async getQueues(connectionId) {
    const connection = this.getConnection(connectionId);
    if (!connection) throw new Error('Connection not found');

    try {
      const queues = [];
      const queueIterator = connection.adminClient.listQueues();
      
      for await (const queue of queueIterator) {
        queues.push({
          name: queue.name,
          messageCount: queue.messageCount,
          activeMessageCount: queue.activeMessageCount,
          deadLetterMessageCount: queue.deadLetterMessageCount,
          sizeInBytes: queue.sizeInBytes,
          status: queue.status,
          createdAt: queue.createdAt,
          updatedAt: queue.updatedAt,
        });
      }
      
      return queues;
    } catch (error) {
      throw new Error(`Failed to get queues: ${error.message}`);
    }
  }

  async getQueueDetails(connectionId, queueName) {
    const connection = this.getConnection(connectionId);
    if (!connection) throw new Error('Connection not found');

    try {
      const queueProperties = await connection.adminClient.getQueue(queueName);
      const runtimeInfo = await connection.adminClient.getQueueRuntimeProperties(queueName);
      
      return {
        ...queueProperties,
        messageCount: runtimeInfo.totalMessageCount,
        activeMessageCount: runtimeInfo.activeMessageCount,
        deadLetterMessageCount: runtimeInfo.deadLetterMessageCount,
        sizeInBytes: runtimeInfo.sizeInBytes,
      };
    } catch (error) {
      throw new Error(`Failed to get queue details: ${error.message}`);
    }
  }

  async peekMessages(connectionId, queueName, maxMessages = 10) {
    const connection = this.getConnection(connectionId);
    if (!connection) throw new Error('Connection not found');

    try {
      const receiver = connection.client.createReceiver(queueName);
      const messages = await receiver.peekMessages(maxMessages);
      await receiver.close();
      
      return messages.map(msg => ({
        messageId: msg.messageId,
        body: msg.body,
        label: msg.label,
        correlationId: msg.correlationId,
        sessionId: msg.sessionId,
        partitionKey: msg.partitionKey,
        enqueuedTimeUtc: msg.enqueuedTimeUtc,
        expiresAtUtc: msg.expiresAtUtc,
        deliveryCount: msg.deliveryCount,
        applicationProperties: msg.applicationProperties,
      }));
    } catch (error) {
      throw new Error(`Failed to peek messages: ${error.message}`);
    }
  }

  async receiveMessage(connectionId, queueName) {
    const connection = this.getConnection(connectionId);
    if (!connection) throw new Error('Connection not found');

    try {
      const receiver = connection.client.createReceiver(queueName);
      const messages = await receiver.receiveMessages(1, { maxWaitTimeInMs: 5000 });
      
      if (messages.length > 0) {
        const message = messages[0];
        await receiver.completeMessage(message);
        await receiver.close();
        
        return {
          messageId: message.messageId,
          body: message.body,
          label: message.label,
          correlationId: message.correlationId,
          sessionId: message.sessionId,
          partitionKey: message.partitionKey,
          enqueuedTimeUtc: message.enqueuedTimeUtc,
          expiresAtUtc: message.expiresAtUtc,
          deliveryCount: message.deliveryCount,
          applicationProperties: message.applicationProperties,
        };
      }
      
      await receiver.close();
      return null;
    } catch (error) {
      throw new Error(`Failed to receive message: ${error.message}`);
    }
  }

  async getDeadLetterMessages(connectionId, queueName, maxMessages = 10) {
    const connection = this.getConnection(connectionId);
    if (!connection) throw new Error('Connection not found');

    try {
      const receiver = connection.client.createReceiver(queueName, {
        subQueueType: 'deadLetter'
      });
      const messages = await receiver.peekMessages(maxMessages);
      await receiver.close();
      
      return messages.map(msg => ({
        messageId: msg.messageId,
        body: msg.body,
        label: msg.label,
        correlationId: msg.correlationId,
        sessionId: msg.sessionId,
        partitionKey: msg.partitionKey,
        enqueuedTimeUtc: msg.enqueuedTimeUtc,
        expiresAtUtc: msg.expiresAtUtc,
        deliveryCount: msg.deliveryCount,
        applicationProperties: msg.applicationProperties,
        deadLetterReason: msg.deadLetterReason,
        deadLetterErrorDescription: msg.deadLetterErrorDescription,
      }));
    } catch (error) {
      throw new Error(`Failed to get dead letter messages: ${error.message}`);
    }
  }

  // Topic operations
  async getTopics(connectionId) {
    const connection = this.getConnection(connectionId);
    if (!connection) throw new Error('Connection not found');

    try {
      const topics = [];
      const topicIterator = connection.adminClient.listTopics();
      
      for await (const topic of topicIterator) {
        topics.push({
          name: topic.name,
          sizeInBytes: topic.sizeInBytes,
          status: topic.status,
          createdAt: topic.createdAt,
          updatedAt: topic.updatedAt,
          subscriptionCount: 0, // Will be populated separately
        });
      }
      
      return topics;
    } catch (error) {
      throw new Error(`Failed to get topics: ${error.message}`);
    }
  }

  async getSubscriptions(connectionId, topicName) {
    const connection = this.getConnection(connectionId);
    if (!connection) throw new Error('Connection not found');

    try {
      const subscriptions = [];
      const subscriptionIterator = connection.adminClient.listSubscriptions(topicName);
      
      for await (const subscription of subscriptionIterator) {
        const runtimeInfo = await connection.adminClient.getSubscriptionRuntimeProperties(
          topicName, 
          subscription.subscriptionName
        );
        
        subscriptions.push({
          name: subscription.subscriptionName,
          topicName: topicName,
          messageCount: runtimeInfo.totalMessageCount,
          activeMessageCount: runtimeInfo.activeMessageCount,
          deadLetterMessageCount: runtimeInfo.deadLetterMessageCount,
          status: subscription.status,
          createdAt: subscription.createdAt,
          updatedAt: subscription.updatedAt,
        });
      }
      
      return subscriptions;
    } catch (error) {
      throw new Error(`Failed to get subscriptions: ${error.message}`);
    }
  }

  async peekSubscriptionMessages(connectionId, topicName, subscriptionName, maxMessages = 10) {
    const connection = this.getConnection(connectionId);
    if (!connection) throw new Error('Connection not found');

    try {
      const receiver = connection.client.createReceiver(topicName, subscriptionName);
      const messages = await receiver.peekMessages(maxMessages);
      await receiver.close();
      
      return messages.map(msg => ({
        messageId: msg.messageId,
        body: msg.body,
        label: msg.label,
        correlationId: msg.correlationId,
        sessionId: msg.sessionId,
        partitionKey: msg.partitionKey,
        enqueuedTimeUtc: msg.enqueuedTimeUtc,
        expiresAtUtc: msg.expiresAtUtc,
        deliveryCount: msg.deliveryCount,
        applicationProperties: msg.applicationProperties,
      }));
    } catch (error) {
      throw new Error(`Failed to peek subscription messages: ${error.message}`);
    }
  }

  async getSubscriptionDeadLetterMessages(connectionId, topicName, subscriptionName, maxMessages = 10) {
    const connection = this.getConnection(connectionId);
    if (!connection) throw new Error('Connection not found');

    try {
      const receiver = connection.client.createReceiver(topicName, subscriptionName, {
        subQueueType: 'deadLetter'
      });
      const messages = await receiver.peekMessages(maxMessages);
      await receiver.close();
      
      return messages.map(msg => ({
        messageId: msg.messageId,
        body: msg.body,
        label: msg.label,
        correlationId: msg.correlationId,
        sessionId: msg.sessionId,
        partitionKey: msg.partitionKey,
        enqueuedTimeUtc: msg.enqueuedTimeUtc,
        expiresAtUtc: msg.expiresAtUtc,
        deliveryCount: msg.deliveryCount,
        applicationProperties: msg.applicationProperties,
        deadLetterSource: msg.deadLetterSource,
        deadLetterReason: msg.deadLetterReason,
        deadLetterErrorDescription: msg.deadLetterErrorDescription,
      }));
    } catch (error) {
      throw new Error(`Failed to get subscription dead letter messages: ${error.message}`);
    }
  }

  async sendMessage(connectionId, queueName, messageBody, label = '', applicationProperties = {}) {
    const connection = this.getConnection(connectionId);
    if (!connection) throw new Error('Connection not found');

    try {
      const sender = connection.client.createSender(queueName);
      const message = {
        body: messageBody,
        label: label,
        applicationProperties: applicationProperties,
      };
      
      await sender.sendMessages(message);
      await sender.close();
      
      return { messageId: message.messageId, success: true };
    } catch (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  async sendTopicMessage(connectionId, topicName, messageBody, label = '', applicationProperties = {}) {
    const connection = this.getConnection(connectionId);
    if (!connection) throw new Error('Connection not found');

    try {
      const sender = connection.client.createSender(topicName);
      const message = {
        body: messageBody,
        label: label,
        applicationProperties: applicationProperties,
      };
      
      await sender.sendMessages(message);
      await sender.close();
      
      return { messageId: message.messageId, success: true };
    } catch (error) {
      throw new Error(`Failed to send topic message: ${error.message}`);
    }
  }

  async getAllSubscriptionMessages(connectionId, topicName, subscriptionName, maxMessages = 10) {
    if (!this.client) {
      throw new Error('Not connected to Azure Service Bus');
    }

    try {
      // Get both active and dead letter messages in parallel
      const [activeMessages, deadLetterMessages] = await Promise.all([
        this.getSubscriptionMessages(connectionId, topicName, subscriptionName, maxMessages),
        this.getSubscriptionDeadLetterMessages(connectionId, topicName, subscriptionName, maxMessages)
      ]);

      const mappedActiveMessages = activeMessages.map(msg => ({
        ...msg,
        messageType: 'active'
      }));

      const mappedDeadLetterMessages = deadLetterMessages.map(msg => ({
        ...msg,
        messageType: 'deadletter'
      }));

      return {
        activeMessages: mappedActiveMessages,
        deadLetterMessages: mappedDeadLetterMessages,
        allMessages: [...mappedActiveMessages, ...mappedDeadLetterMessages],
        totalCount: mappedActiveMessages.length + mappedDeadLetterMessages.length
      };
    } catch (error) {
      throw new Error(`Failed to get all subscription messages: ${error.message}`);
    }
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export default new AzureServiceBusService(); 