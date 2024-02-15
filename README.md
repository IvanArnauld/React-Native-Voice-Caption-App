# React-Native-Voice-Caption-App
This is a simple React Native application that allows users to add a picture, record a voice caption, and save them to a local Project Overview
This mobile application is a React Native project built with Expo. It serves as a multimedia note-taking app, allowing users to capture images, record audio, and save associated captions. The app provides functionalities for selecting images from the device's library, recording audio captions, playing back audio recordings, and persisting data using an SQLite database.

Features
Image Selection: Users can select images from their device's library to associate with notes.
Audio Recording: The app allows users to record audio captions to accompany their notes.
Audio Playback: Users can play back the recorded audio captions.
Caption Input: A text input field is available for users to provide captions for their notes.
Data Persistence: Captured data, including images, audio files, and captions, are stored locally using SQLite.

Image Selection:
Click to add a picture from the device's gallery.
Allows editing and provides cropping functionality.

Voice Caption:
Record a voice caption for the selected image.
Start, stop, and playback recording functionalities.
Voice recording uses Expo's Audio module.

File Operations:
Save the image and audio URI to separate text files locally.
Read saved files and display their contents.

SQLite Database:
Utilizes an SQLite database to store contact information.
Provides methods for saving, retrieving, and displaying data from the database.

Permissions Handling:
Requests camera, media library, and audio recording permissions.


Technologies Used:
React Native
Expo
SQLite
Expo's ImagePicker for image selection
Expo's Audio for voice recording and playback
Expo's FileSystem for file read and write operations


Project Structure:
App.js: Main component that orchestrates the application's functionality.
styles.js: Stylesheet for styling the components.
database.js: SQLite database setup.
util.js: Utility functions for handling file operations.

Setup and Configuration:
Clone the repository.
Install Expo CLI and dependencies.
Run the app using expo start.

Usage:
Click to add a picture.
Enter a caption in the text input.
Record a voice caption using the "Record Caption" button.
Stop recording and play back the voice caption.
Save the recorded data to local files and the SQLite database

Dependencies
Expo: A framework for building React Native applications.
Expo AV: Provides audio and video handling capabilities.
Expo File System: Allows access to the device's file system.
Expo Image Picker: Enables image and video selection from the device's library.
Expo SQLite: A local SQLite database for data persistence.
Setup
Clone this repository to your local machine.

Navigate to the project directory.

Install project dependencies:
npm install
Note: Due to the size of the node_modules folder, it is not included in the repository. Users are required to download the necessary dependencies themselves.

Start the Expo development server:
npm start
Choose the desired platform (iOS, Android, or web) to run the app.

Usage
Open the Expo Go app on your mobile device or an emulator.
Scan the QR code displayed in the terminal to launch the app.
Explore the app's features for capturing and managing multimedia notes.

Additional Information
This project was developed using React Native and Expo.
For detailed documentation on Expo and its modules, refer to the Expo Documentation.
Feel free to explore and customize the app based on your preferences and use cases.
For any issues or improvements, please submit them through the project's repository on GitHub.
Happy coding!
