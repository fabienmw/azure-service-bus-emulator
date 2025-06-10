# 🚀 Distribution Setup Guide

This guide explains how to set up automatic building and distribution of the Azure Service Bus Manager across macOS, Windows, and Linux with auto-updates.

## 📋 Prerequisites

### 1. GitHub Repository Setup
- Push your code to a GitHub repository
- Enable GitHub Actions in your repository settings

### 2. Update package.json
- Replace `YOUR_GITHUB_USERNAME` in the publish configuration with your actual GitHub username
- Update the repository name if different

## 🔐 Required GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

### **Required for all platforms:**
```
GH_TOKEN=your_github_personal_access_token_with_repo_access
```

### **For macOS Code Signing (Optional but Recommended):**
```
MACOS_CERTIFICATE=base64_encoded_p12_certificate
MACOS_CERTIFICATE_PWD=certificate_password
KEYCHAIN_PASSWORD=temporary_keychain_password
APPLE_ID=your_apple_developer_id
APPLE_APP_SPECIFIC_PASSWORD=app_specific_password
```

### **For Windows Code Signing (Optional but Recommended):**
```
WINDOWS_CERTIFICATE=base64_encoded_p12_certificate
WINDOWS_CERTIFICATE_PWD=certificate_password
```

## 🎯 How to Get Certificates

### **macOS Certificate:**
1. Join Apple Developer Program ($99/year)
2. Create a Developer ID Application certificate
3. Export as .p12 file
4. Convert to base64: `base64 -i certificate.p12 | pbcopy`

### **Windows Certificate:**
1. Purchase a code signing certificate from a CA (Sectigo, DigiCert, etc.)
2. Export as .p12 file
3. Convert to base64: `certutil -encode certificate.p12 certificate.txt`

## 🚀 Release Process

### **Automatic Releases (Recommended):**
1. Update version in `package.json`
2. Create and push a git tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. GitHub Actions automatically builds and creates a release

### **Manual Release:**
1. Go to GitHub Actions tab
2. Select "Build and Release" workflow
3. Click "Run workflow"
4. Enter version (e.g., v1.0.0)

## 📦 Generated Artifacts

The CI/CD pipeline creates these files for distribution:

### **macOS:**
- `.dmg` - Installer package
- `.zip` - Portable archive
- `latest-mac.yml` - Auto-updater metadata

### **Windows:**
- `.exe` - NSIS installer
- `-portable.exe` - Portable executable
- `latest.yml` - Auto-updater metadata

### **Linux:**
- `.AppImage` - Portable application
- `.deb` - Debian package
- `.rpm` - Red Hat package
- `latest-linux.yml` - Auto-updater metadata

## 🔄 Auto-Update Features

### **For Users:**
- App automatically checks for updates on startup
- Download progress shown in notification
- Users can choose when to install updates
- Manual update check available

### **For Developers:**
- Updates distributed through GitHub Releases
- Incremental downloads (delta updates)
- Rollback capability
- Analytics on update adoption

## 🌐 Distribution Strategy

### **Option 1: GitHub Releases (Free)**
- Users download from GitHub releases page
- Auto-updates work automatically
- Good for open source projects

### **Option 2: Website Distribution**
- Host download links on your website
- Point to latest GitHub release
- Better user experience

### **Option 3: App Stores (Advanced)**
- macOS App Store (requires additional setup)
- Microsoft Store (requires additional setup)
- Snap Store for Linux

## 🔧 Customization Options

### **App Icons:**
- Add `icon.icns` (macOS), `icon.ico` (Windows), `icon.png` (Linux) to `assets/` folder
- Icons should be high resolution (512x512 minimum)

### **App Metadata:**
- Update `productName`, `appId`, and `description` in `package.json`
- Add copyright and author information

### **Build Targets:**
- Modify `package.json` build configuration to add/remove platforms
- Configure different architectures (ARM64, x64, etc.)

## 🐛 Troubleshooting

### **Common Issues:**

1. **Build fails on macOS:**
   - Check certificate secrets are correctly base64 encoded
   - Verify Apple ID and app-specific password

2. **Windows build unsigned:**
   - Add Windows certificate secrets
   - Certificate must be from a trusted CA

3. **Auto-updater not working:**
   - Verify `publish` configuration in package.json
   - Check GitHub token has proper permissions

4. **Large bundle size:**
   - Add more exclusions to `files` array in package.json
   - Use `electron-builder` optimization options

## 📈 Monitoring

### **GitHub Actions:**
- Monitor build success/failure in Actions tab
- Download build logs for debugging

### **Release Analytics:**
- Track download counts in GitHub Releases
- Monitor update adoption rates

## 🔒 Security Considerations

- Keep signing certificates secure
- Rotate GitHub tokens periodically
- Use separate certificates for different environments
- Consider implementing update signature verification

## 🆕 Version Management

### **Semantic Versioning:**
- `v1.0.0` - Major release
- `v1.1.0` - Minor release (new features)
- `v1.0.1` - Patch release (bug fixes)

### **Release Channels:**
- `latest` - Stable releases
- `beta` - Pre-release versions
- `alpha` - Development versions

Configure in `package.json` under `build.publish.channel`. 