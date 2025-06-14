chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.spamDetected) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Spam Alert",
      message: "⚠️ This email appears to be spam.",
      priority: 2
    });
  }
});
