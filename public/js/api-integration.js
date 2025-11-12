// API Integration for Verification Tool
// Add this to your verifier.html or use as a separate module

class VerifierAPI {
  constructor() {
    this.baseUrl = 'http://localhost:3000/api';
  }

  // Method 1: URL Parameters - Auto-fill from URL
  loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    const article = params.get('article');
    const sources = params.get('sources');
    const apiKey = params.get('apiKey');

    if (article) {
      document.getElementById('article-input').value =
        decodeURIComponent(article);
    }
    if (sources) {
      document.getElementById('sources-input').value =
        decodeURIComponent(sources);
    }
    if (apiKey) {
      document.getElementById('api-key-input').value =
        decodeURIComponent(apiKey);
    }
  }

  // Method 2: PostMessage - Communication between windows
  setupPostMessageListener() {
    window.addEventListener('message', (event) => {
      if (event.data.type === 'FILL_VERIFIER_FIELDS') {
        this.fillFields(event.data);
      }
    });
  }

  // Method 3: Local Storage - Shared browser storage
  loadFromStorage() {
    const data = localStorage.getItem('verifier_auto_fill');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        this.fillFields(parsed);
        // Clear after use to avoid stale data
        localStorage.removeItem('verifier_auto_fill');
      } catch (e) {
        console.error('Error parsing stored data:', e);
      }
    }
  }

  // Method 4: REST API - Server-based communication
  async loadFromAPI(sessionId) {
    try {
      const response = await fetch(`${this.baseUrl}/data/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        this.fillFields(data);
      }
    } catch (error) {
      console.error('Error loading from API:', error);
    }
  }

  // Method 5: WebSocket - Real-time communication
  setupWebSocket() {
    const ws = new WebSocket('ws://localhost:3001');

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'AUTO_FILL') {
          this.fillFields(data.payload);
        }
      } catch (e) {
        console.error('WebSocket message error:', e);
      }
    };

    return ws;
  }

  // Helper method to fill form fields
  fillFields(data) {
    if (data.article) {
      const articleInput = document.getElementById('article-input');
      if (articleInput) articleInput.value = data.article;
    }

    if (data.sources) {
      const sourcesInput = document.getElementById('sources-input');
      if (sourcesInput) {
        // Handle both string and array formats
        const sourcesText = Array.isArray(data.sources)
          ? data.sources.join('\n')
          : data.sources;
        sourcesInput.value = sourcesText;
      }
    }

    if (data.apiKey) {
      const apiKeyInput = document.getElementById('api-key-input');
      if (apiKeyInput) apiKeyInput.value = data.apiKey;
    }

    // Trigger auto-analysis if requested
    if (data.autoStart) {
      setTimeout(() => {
        const verifyButton = document.getElementById('verify-button');
        if (verifyButton) verifyButton.click();
      }, 500);
    }
  }

  // Export results back to calling program
  exportResults() {
    const reportContent = document.getElementById('report-content');
    if (reportContent) {
      return {
        html: reportContent.innerHTML,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      };
    }
    return null;
  }

  // Send results via PostMessage
  sendResults(targetWindow) {
    const results = this.exportResults();
    if (results && targetWindow) {
      targetWindow.postMessage(
        {
          type: 'VERIFICATION_RESULTS',
          data: results,
        },
        '*'
      );
    }
  }

  // Save results to storage for pickup
  saveResultsToStorage() {
    const results = this.exportResults();
    if (results) {
      localStorage.setItem('verifier_results', JSON.stringify(results));
    }
  }
}

// Initialize API integration
const verifierAPI = new VerifierAPI();

// Auto-load data when page loads
window.addEventListener('load', () => {
  console.log('🔧 API Integration loaded - checking URL parameters');
  verifierAPI.loadFromURL();
  verifierAPI.loadFromStorage();
  verifierAPI.setupPostMessageListener();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VerifierAPI;
}
