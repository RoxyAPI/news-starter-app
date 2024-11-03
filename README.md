# News Starter App

The **News Starter App** is an open-source react native application built with Expo, designed as a quick-start solution for creating a modern News App in React Native. It includes pre-built, swipeable, and grid-based news layouts, providing a seamless foundation for integrating news content.

### Key Features

- **Infinite Scrolling**: Fetches additional pages of news data as the user scrolls.
- **Pull-to-Refresh**: Reload the latest news by pulling down on the feed.
- **Dark and Light Mode**: Automatic theme adjustments based on the device’s appearance setting.

## Tech Stack

- **Expo**: React Native framework for building cross-platform applications.
- **React Navigation**: Navigation library for seamless screen transitions.
- **TailwindCSS**: Utility-first CSS framework for styling.
- **TypeScript**: Statically typed JavaScript for better code quality.
- **Nativewind**: A utility class library that brings Tailwind-style class names to React Native.

## Getting Started

To set up and run the News Starter App locally, follow these steps.

### Prerequisites

- **Node.js** and **npm**: Ensure you have the latest versions installed. [Install Node.js](https://nodejs.org/).

### Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/RoxyAPI/news-starter-app
   cd news-starter-app
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:

   - Duplicate the `.env.sample` file and rename it to `.env`.
   - Update `.env` with your **RoxyAPI News API Token**. You can obtain a free token by signing up at [RoxyAPI](https://roxyapi.com).
   - Your `.env` file should look as follows:
     ```plaintext
     EXPO_PUBLIC_API_URL=https://roxyapi.com/api/v1
     EXPO_PUBLIC_API_TOKEN=your_api_token_here
     ```

   > **Note**: For enhanced security, it is recommended to handle API requests server-side. Instead of exposing your API token directly within the app, set up a secure API proxy on your server. Your app would then make requests to this proxy, which forwards them to RoxyAPI. This approach helps protect your API token from unauthorized access.

---

### Running the App

Once the environment variables are set up, you can start the app on various platforms.

- **Start the Expo server**:

  ```bash
  npm start
  ```

  This command launches the Expo development server, allowing you to run the app on Android, iOS, or web.

- **Platform-specific Commands**:
  - **Android**: `npm run android`
  - **iOS**: `npm run ios`
  - **Web**: `npm run web`

### Testing

To run tests:

```bash
npm test
```

Tests are configured with `jest-expo` for a seamless Expo and Jest integration.

### Contributing

Contributions are welcome! Please fork the repository, make your changes, and submit a pull request.

---

For any issues, please refer to the [RoxyAPI Documentation](https://roxyapi.com/docs) or contact our support team.

Happy coding!
