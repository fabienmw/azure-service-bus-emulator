const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { ServiceBusAdministrationClient, ServiceBusClient } = require('@azure/service-bus');

let mainWindow;

// Azure Service Bus connection management
const connections = new Map();

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// IPC Handlers for Azure Service Bus operations
ipcMain.handle('azure-sb-connect', async (event, { connectionString, name }) => {
  try {
    const adminClient = new ServiceBusAdministrationClient(connectionString);
    const client = new ServiceBusClient(connectionString);
    
    // Test connection by getting namespace info
    await adminClient.getNamespaceProperties();
    
    const connectionId = generateId();
    const connection = {
      id: connectionId,
      name,
      connectionString,
      adminClient,
      client,
      connected: true,
      createdAt: new Date(),
    };
    
    connections.set(connectionId, connection);
    return { success: true, data: { id: connectionId } };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('azure-sb-disconnect', async (event, { connectionId }) => {
  const connection = connections.get(connectionId);
  if (connection) {
    try {
      await connection.client.close();
      connections.delete(connectionId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  return { success: false, error: 'Connection not found' };
});

ipcMain.handle('azure-sb-get-queues', async (event, { connectionId }) => {
  const connection = connections.get(connectionId);
  if (!connection) {
    return { success: false, error: 'Connection not found' };
  }

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
    
    return { success: true, data: queues };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('azure-sb-get-queue-details', async (event, { connectionId, queueName }) => {
  const connection = connections.get(connectionId);
  if (!connection) {
    return { success: false, error: 'Connection not found' };
  }

  try {
    const queueProperties = await connection.adminClient.getQueue(queueName);
    const runtimeInfo = await connection.adminClient.getQueueRuntimeProperties(queueName);
    
    const queueDetails = {
      ...queueProperties,
      messageCount: runtimeInfo.totalMessageCount,
      activeMessageCount: runtimeInfo.activeMessageCount,
      deadLetterMessageCount: runtimeInfo.deadLetterMessageCount,
      sizeInBytes: runtimeInfo.sizeInBytes,
    };
    
    return { success: true, data: queueDetails };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('azure-sb-peek-messages', async (event, { connectionId, queueName, maxMessages = 10 }) => {
  const connection = connections.get(connectionId);
  if (!connection) {
    return { success: false, error: 'Connection not found' };
  }

  try {
    const receiver = connection.client.createReceiver(queueName);
    const messages = await receiver.peekMessages(maxMessages);
    await receiver.close();
    
    const mappedMessages = messages.map(msg => ({
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
    
    return { success: true, data: mappedMessages };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('azure-sb-receive-message', async (event, { connectionId, queueName }) => {
  const connection = connections.get(connectionId);
  if (!connection) {
    return { success: false, error: 'Connection not found' };
  }

  try {
    const receiver = connection.client.createReceiver(queueName);
    const messages = await receiver.receiveMessages(1, { maxWaitTimeInMs: 5000 });
    
    if (messages.length > 0) {
      const message = messages[0];
      await receiver.completeMessage(message);
      await receiver.close();
      
      const messageData = {
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
      
      return { success: true, data: messageData };
    }
    
    await receiver.close();
    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('azure-sb-get-dead-letter-messages', async (event, { connectionId, queueName, maxMessages = 10 }) => {
  const connection = connections.get(connectionId);
  if (!connection) {
    return { success: false, error: 'Connection not found' };
  }

  try {
    const receiver = connection.client.createReceiver(queueName, {
      subQueueType: 'deadLetter'
    });
    const messages = await receiver.peekMessages(maxMessages);
    await receiver.close();
    
    const mappedMessages = messages.map(msg => ({
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
    
    return { success: true, data: mappedMessages };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('azure-sb-get-topics', async (event, { connectionId }) => {
  const connection = connections.get(connectionId);
  if (!connection) {
    return { success: false, error: 'Connection not found' };
  }

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
        subscriptionCount: 0, // Will be populated separately if needed
      });
    }
    
    return { success: true, data: topics };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('azure-sb-get-subscriptions', async (event, { connectionId, topicName }) => {
  const connection = connections.get(connectionId);
  if (!connection) {
    return { success: false, error: 'Connection not found' };
  }

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
    
    return { success: true, data: subscriptions };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('azure-sb-peek-subscription-messages', async (event, { connectionId, topicName, subscriptionName, maxMessages = 10 }) => {
  const connection = connections.get(connectionId);
  if (!connection) {
    return { success: false, error: 'Connection not found' };
  }

  try {
    const receiver = connection.client.createReceiver(topicName, subscriptionName);
    const messages = await receiver.peekMessages(maxMessages);
    await receiver.close();
    
    const mappedMessages = messages.map(msg => ({
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
    
    return { success: true, data: mappedMessages };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('azure-sb-get-subscription-dead-letter-messages', async (event, { connectionId, topicName, subscriptionName, maxMessages = 10 }) => {
  const connection = connections.get(connectionId);
  if (!connection) {
    return { success: false, error: 'Connection not found' };
  }

  try {
    const receiver = connection.client.createReceiver(topicName, subscriptionName, {
      subQueueType: 'deadLetter'
    });
    const messages = await receiver.peekMessages(maxMessages);
    await receiver.close();
    
    const mappedMessages = messages.map(msg => ({
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
    
    return { success: true, data: mappedMessages };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('azure-sb-send-message', async (event, { connectionId, queueName, messageBody, label, applicationProperties }) => {
  const connection = connections.get(connectionId);
  if (!connection) {
    return { success: false, error: 'Connection not found' };
  }

  try {
    const sender = connection.client.createSender(queueName);
    const message = {
      body: messageBody,
      label: label,
      applicationProperties: applicationProperties || {},
    };
    
    await sender.sendMessages(message);
    await sender.close();
    
    return { success: true, data: { messageId: message.messageId } };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('azure-sb-send-topic-message', async (event, { connectionId, topicName, messageBody, label, applicationProperties }) => {
  const connection = connections.get(connectionId);
  if (!connection) {
    return { success: false, error: 'Connection not found' };
  }

  try {
    const sender = connection.client.createSender(topicName);
    const message = {
      body: messageBody,
      label: label,
      applicationProperties: applicationProperties || {},
    };
    
    await sender.sendMessages(message);
    await sender.close();
    
    return { success: true, data: { messageId: message.messageId } };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    icon: path.join(__dirname, '../assets/icon.png'), // Optional: add app icon
    titleBarStyle: 'default',
    show: false, // Don't show until ready
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:3001' 
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // Close all Azure Service Bus connections before quitting
  for (const connection of connections.values()) {
    try {
      connection.client.close();
    } catch (error) {
      console.error('Error closing connection:', error);
    }
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Create application menu
const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New Connection',
        accelerator: 'CmdOrCtrl+N',
        click: () => {
          if (mainWindow) {
            mainWindow.webContents.send('menu-new-connection');
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Exit',
        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
        click: () => {
          app.quit();
        }
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'About',
        click: () => {
          // Show about dialog
        }
      }
    ]
  }
];

if (process.platform === 'darwin') {
  template.unshift({
    label: app.getName(),
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  });
}

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu); 