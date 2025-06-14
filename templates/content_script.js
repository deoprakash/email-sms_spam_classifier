function checkSpam(text, callback) {
  fetch("http://localhost:5000/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message: text })
  })
    .then(res => res.json())
    .then(data => {
      callback(data.prediction);

      // ✅ Send notification if spam
      if (data.prediction === 1) {
        chrome.runtime.sendMessage({ spamDetected: true });
      }
    });
}

// Run on inbox load
const observer = new MutationObserver(() => {
  const emailItems = document.querySelectorAll("tr.zA"); // Gmail email rows
  emailItems.forEach(row => {
    const text = row.innerText;
    if (!row.classList.contains("checked-for-spam")) {
      checkSpam(text, (isSpam) => {
        if (isSpam === 1) {
          row.style.backgroundColor = "#ffcccc";
          row.style.borderLeft = "4px solid red";
        }
        row.classList.add("checked-for-spam");
      });
    }
  });
});

observer.observe(document.body, { childList: true, subtree: true });
