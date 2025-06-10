# Azure Service Bus Manager

A powerful desktop application built with React and Electron for managing Azure Service Bus instances. This application provides a modern, intuitive interface for monitoring and managing queues, topics, subscriptions, and messages.

![Azure Service Bus Manager](https://img.shields.io/badge/Azure-Service%20Bus%20Manager-blue)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Electron](https://img.shields.io/badge/Electron-25.3.1-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.2-blue)

## Features

### 🔗 Connection Management
- Connect to multiple Azure Service Bus namespaces
- Secure connection string management
- Real-time connection status monitoring
- Easy connection switching

### 📊 Queue Management
- List all queues in a namespace
- View queue details and statistics
- Monitor message counts (total, active, dead letter)
- Peek messages without removing them
- Pop messages (receive and delete)
- View dead letter queue messages

### 📡 Topic & Subscription Management
- Browse all topics in a namespace
- View topic properties and statistics
- List subscriptions for each topic
- Monitor subscription message counts
- Peek subscription messages

### 💬 Message Operations
- **Peek Messages**: View message content without removing from queue
- **Pop Messages**: Receive and delete messages from queue
- **JSON Viewer**: Beautiful JSON formatting for message content
- **Message Properties**: View all message metadata and properties
- **Dead Letter Analysis**: Inspect dead letter reasons and descriptions
- **Export Messages**: Download messages as JSON files

### 🎨 Modern UI/UX
- Clean, modern dashboard design
- Responsive layout with sidebar navigation
- Real-time updates and loading states
- Error handling with user-friendly notifications
- Dark/light theme support via TailwindCSS
- Smooth animations and transitions

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager
- Azure Service Bus namespace with appropriate access policies

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd azure-service-bus-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run electron-dev
   ```

## Building for Production

### Web Application
```bash
npm run build
```

### Desktop Application
```bash
# Build for current platform
npm run dist

# Build for specific platforms
npm run build-electron
```

The built application will be available in the `dist` folder.

## Usage

### Getting Started

1. **Launch the application**
   - In development: `npm run electron-dev`
   - Production: Run the built executable

2. **Add a connection**
   - Click the "+" button in the sidebar
   - Enter your connection name and Azure Service Bus connection string
   - Click "Connect"

3. **Explore your Service Bus**
   - Select a connection from the sidebar
   - Browse queues, topics, and subscriptions
   - Click on any item to view details and messages

### Connection String Format

Your Azure Service Bus connection string should look like:
```
Endpoint=sb://your-namespace.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=your-key
```

### Finding Your Connection String

1. Go to the Azure Portal
2. Navigate to your Service Bus namespace
3. Go to "Shared access policies"
4. Select a policy with appropriate permissions (Manage, Send, Listen)
5. Copy the "Primary Connection String"

### Testing with Real Azure Service Bus

The application now uses the real Azure Service Bus SDK instead of mock implementations. To test:

1. **Create an Azure Service Bus namespace** (if you don't have one):
   - Go to Azure Portal
   - Create a new Service Bus namespace
   - Note the connection string from Shared access policies

2. **Create test queues and topics**:
   - In the Azure Portal, go to your Service Bus namespace
   - Create a few test queues (e.g., "test-queue", "orders-queue")
   - Create a test topic with subscriptions (e.g., "test-topic" with "sub1", "sub2")

3. **Run the application**:
   ```bash
   npm run electron-dev
   ```

4. **Connect to your Service Bus**:
   - Click the "+" button to add a new connection
   - Enter your connection name and connection string
   - Click "Connect"

5. **Verify functionality**:
   - Browse queues and topics in the sidebar
   - View queue/topic details and message counts
   - Peek at messages (if any exist)
   - Send test messages using the Azure Portal or other tools
   - View messages in the application

### Sending Test Messages

You can send test messages to your queues/topics using:

1. **Azure Portal** (Service Bus Explorer)
2. **Azure CLI**:
   ```bash
   az servicebus message send --resource-group <rg> --namespace-name <namespace> --queue-name <queue> --body "Test message"
   ```
3. **PowerShell** with Azure PowerShell module
4. **The application itself** (send functionality is built-in)

## Development

### Project Structure
```
src/
├── components/          # React components
│   ├── Dashboard.js     # Main dashboard layout
│   ├── Sidebar.js       # Navigation sidebar
│   ├── MainContent.js   # Main content area
│   ├── QueueDetails.js  # Queue management
│   ├── TopicDetails.js  # Topic management
│   └── ...
├── context/             # React context for state management
├── services/            # Azure Service Bus integration
└── index.js            # Application entry point

electron/
└── main.js             # Electron main process

public/
└── index.html          # HTML template
```

### Available Scripts

- `npm start` - Start React development server
- `npm run build` - Build React app for production
- `npm run electron` - Start Electron app
- `npm run electron-dev` - Start both React and Electron in development
- `npm run dist` - Build desktop application for distribution

### Technologies Used

- **React 18** - UI framework
- **Electron 25** - Desktop application framework
- **TailwindCSS 3** - Utility-first CSS framework
- **Azure Service Bus SDK** - Azure integration
- **Lucide React** - Icon library
- **React JSON View** - JSON viewer component

## Configuration

### Electron Configuration

The Electron configuration is in `electron/main.js`. You can customize:
- Window size and properties
- Menu structure
- Security settings

### TailwindCSS Configuration

Customize the design system in `tailwind.config.js`:
- Color palette
- Typography
- Spacing
- Animations

## Security Considerations

- Connection strings are stored in memory only
- No persistent storage of sensitive data
- Secure communication with Azure Service Bus
- Input validation and sanitization

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Verify your connection string is correct
   - Check network connectivity
   - Ensure the Service Bus namespace is accessible

2. **Permission Errors**
   - Verify your access policy has the required permissions
   - Check if the policy includes Manage, Send, and Listen rights

3. **Build Issues**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

### Debug Mode

Enable debug logging by setting the environment variable:
```bash
DEBUG=azure-service-bus-manager npm run electron-dev
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests if applicable
5. Commit your changes: `git commit -am 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review Azure Service Bus documentation

## Roadmap

- [ ] Message sending capabilities
- [ ] Batch operations
- [ ] Message filtering and search
- [ ] Export/import configurations
- [ ] Performance metrics and monitoring
- [ ] Custom message templates
- [ ] Scheduled message management

---

Built with ❤️ for Azure Service Bus management 