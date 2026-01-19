// Scripts for Firebase and Firebase Messaging
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js");

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD3KD3NN__eMvpXbBu0c6-E2_7S2aptDZg",
    authDomain: "tplus-cf7d9.firebaseapp.com",
    projectId: "tplus-cf7d9",
    storageBucket: "tplus-cf7d9.appspot.com",
    messagingSenderId: "532894246194",
    appId: "1:532894246194:web:2f2f93ab2e15df0adf232b",
    measurementId: "G-3PDLM5MLK8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification.title || 'Default Title';
    const notificationOptions = {
        body: payload.notification.body || 'Default Body',
        icon: payload.notification.image || 'default-icon.png', // Provide a default icon
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
