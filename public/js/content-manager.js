/**
 * Content Manager - Handles image assets, dimensions, and organization
 */

class ContentManager {
  constructor() {
    this.assets = [];
    this.filteredAssets = [];
    this.currentFilter = { ratio: '', search: '' };
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadAssets();
  }

  setupEventListeners() {
    // Upload functionality
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');

    uploadZone.addEventListener('click', () => fileInput.click());
    uploadZone.addEventListener('dragover', this.handleDragOver.bind(this));
    uploadZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
    uploadZone.addEventListener('drop', this.handleDrop.bind(this));
    fileInput.addEventListener('change', this.handleFileSelect.bind(this));

    // Filter controls
    document
      .getElementById('ratio-filter')
      .addEventListener('change', this.handleRatioFilter.bind(this));
    document
      .getElementById('search-filter')
      .addEventListener('input', this.handleSearchFilter.bind(this));
    document
      .getElementById('refresh-btn')
      .addEventListener('click', this.loadAssets.bind(this));

    // Modal controls
    document
      .getElementById('close-modal')
      .addEventListener('click', this.closeModal.bind(this));
    document
      .getElementById('copy-url-btn')
      .addEventListener('click', this.copyImageUrl.bind(this));
    document
      .getElementById('delete-btn')
      .addEventListener('click', this.deleteImage.bind(this));

    // Close modal on background click
    document.getElementById('image-modal').addEventListener('click', (e) => {
      if (e.target.id === 'image-modal') {
        this.closeModal();
      }
    });
  }

  async loadAssets() {
    try {
      document.getElementById('loading-state').style.display = 'block';
      document.getElementById('assets-grid').innerHTML = '';

      // Get list of assets from the server
      const response = await fetch('/api/assets');
      if (!response.ok) {
        throw new Error('Failed to load assets');
      }

      const data = await response.json();
      this.assets = data.assets || [];

      // Process each asset to get dimensions and calculate ratios
      await this.processAssets();

      this.filteredAssets = [...this.assets];
      this.renderAssets();
    } catch (error) {
      console.error('Error loading assets:', error);
      this.showError('Failed to load assets. Using local asset list.');
      await this.loadLocalAssets();
    } finally {
      document.getElementById('loading-state').style.display = 'none';
    }
  }

  async loadLocalAssets() {
    // Fallback: Load known assets from the directory listing
    const knownAssets = [
      'Antfia.png',
      'antifa.png',
      'asd-medical.png',
      'autism-1000x1250.png',
      'autism-1200X675.png',
      'autism-800x600 (800 x 600 px).png',
      'autism-800x600.png',
      'carbon.png',
      'CO2.png',
      'compact-logo.svg',
      'Corporations Media.png',
      'courts-injustice.png',
      'Farmers.png',
      'fractured-400 x 250.png',
      'fractured-800x600.png',
      'ICE-400x225.png',
      'injustice-800x500.png',
      'injustice-correct-800x500.png',
      'Lady-liberty-1600x1000.png',
      'logo-v3.svg',
      'logo.png',
      'Lynching.jpg',
      'Nation of Contrast.png',
      'navbar-logo.svg',
      'news-owl.png',
      'owl-stack-books.png',
      'owl-standing.png',
      'owl-teacup.png',
      'pain-killers.png',
      'recession_uncle-sam.png',
      'screen-shot.png',
      'The News Curator.png',
      'The News Curator.webp',
      'Trump_August.png',
      'Truth Crisis.png',
      'Tylenol.png',
      'US Crisis.png',
    ];

    this.assets = knownAssets.map((filename) => ({
      filename,
      path: `/assets/${filename}`,
      url: `/assets/${filename}`,
      size: 'Unknown',
      dimensions: this.extractDimensionsFromFilename(filename),
      ratio: 'Unknown',
      type: this.getFileType(filename),
    }));

    await this.processAssets();
    this.filteredAssets = [...this.assets];
    this.renderAssets();
  }

  async processAssets() {
    for (let asset of this.assets) {
      if (!asset.dimensions || asset.dimensions === 'Unknown') {
        try {
          const dimensions = await this.getImageDimensions(asset.url);
          asset.dimensions = dimensions;
          asset.ratio = this.calculateRatio(
            dimensions.width,
            dimensions.height
          );
          asset.ratioCategory = this.categorizeRatio(asset.ratio);
        } catch (error) {
          console.warn(
            `Could not get dimensions for ${asset.filename}:`,
            error
          );
          asset.dimensions = { width: 0, height: 0 };
          asset.ratio = 'Unknown';
          asset.ratioCategory = 'other';
        }
      }
    }
  }

  extractDimensionsFromFilename(filename) {
    // Try to extract dimensions from filename patterns like "image-800x600.png"
    const dimensionPattern = /(\d+)[x×](\d+)/i;
    const match = filename.match(dimensionPattern);

    if (match) {
      return {
        width: parseInt(match[1]),
        height: parseInt(match[2]),
      };
    }

    return 'Unknown';
  }

  getImageDimensions(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  calculateRatio(width, height) {
    if (!width || !height) return 'Unknown';

    const gcd = this.getGCD(width, height);
    const ratioW = width / gcd;
    const ratioH = height / gcd;

    return `${ratioW}:${ratioH}`;
  }

  getGCD(a, b) {
    return b === 0 ? a : this.getGCD(b, a % b);
  }

  categorizeRatio(ratio) {
    if (ratio === '4:3') return '4:3';
    if (ratio === '16:9') return '16:9';
    return 'other';
  }

  getFileType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const imageTypes = {
      jpg: 'JPEG',
      jpeg: 'JPEG',
      png: 'PNG',
      gif: 'GIF',
      svg: 'SVG',
      webp: 'WebP',
    };
    return imageTypes[ext] || 'Unknown';
  }

  renderAssets() {
    const grid = document.getElementById('assets-grid');
    grid.innerHTML = '';

    if (this.filteredAssets.length === 0) {
      grid.innerHTML = `
                <div class="col-span-full text-center py-8 text-pr-secondary">
                    <p class="text-lg mb-2">No assets found</p>
                    <p class="text-sm">Try adjusting your filters or upload new images</p>
                </div>
            `;
      return;
    }

    this.filteredAssets.forEach((asset) => {
      const card = this.createAssetCard(asset);
      grid.appendChild(card);
    });
  }

  createAssetCard(asset) {
    const card = document.createElement('div');
    card.className =
      'bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer';

    const ratioClass =
      asset.ratioCategory === '4:3'
        ? 'ratio-4-3'
        : asset.ratioCategory === '16:9'
        ? 'ratio-16-9'
        : 'ratio-other';

    const recommendedFor =
      asset.ratioCategory === '4:3'
        ? 'Featured (Pos 1-4)'
        : asset.ratioCategory === '16:9'
        ? 'Regular (Pos 5+)'
        : 'Custom Use';

    card.innerHTML = `
            <div class="relative mb-3">
                <img src="${asset.url}" alt="${asset.filename}" class="image-preview w-full">
                <div class="absolute top-2 right-2">
                    <span class="dimension-badge ${ratioClass}">${asset.ratio}</span>
                </div>
            </div>
            <div class="space-y-2">
                <h3 class="font-semibold text-sm truncate" title="${asset.filename}">${asset.filename}</h3>
                <div class="text-xs text-gray-600 space-y-1">
                    <div class="flex justify-between">
                        <span>Dimensions:</span>
                        <span class="font-mono">${asset.dimensions.width}×${asset.dimensions.height}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Best for:</span>
                        <span class="font-medium">${recommendedFor}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Type:</span>
                        <span>${asset.type}</span>
                    </div>
                </div>
                <div class="pt-2 border-t">
                    <button class="copy-url-btn w-full bg-blue-50 text-blue-700 text-xs py-1 px-2 rounded hover:bg-blue-100 transition-colors">
                        📋 Copy URL
                    </button>
                </div>
            </div>
        `;

    // Add click handlers
    card.addEventListener('click', (e) => {
      if (!e.target.classList.contains('copy-url-btn')) {
        this.openModal(asset);
      }
    });

    card.querySelector('.copy-url-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.copyToClipboard(asset.url);
    });

    return card;
  }

  handleRatioFilter(e) {
    this.currentFilter.ratio = e.target.value;
    this.applyFilters();
  }

  handleSearchFilter(e) {
    this.currentFilter.search = e.target.value.toLowerCase();
    this.applyFilters();
  }

  applyFilters() {
    this.filteredAssets = this.assets.filter((asset) => {
      const matchesRatio =
        !this.currentFilter.ratio ||
        asset.ratioCategory === this.currentFilter.ratio;
      const matchesSearch =
        !this.currentFilter.search ||
        asset.filename.toLowerCase().includes(this.currentFilter.search);

      return matchesRatio && matchesSearch;
    });

    this.renderAssets();
  }

  openModal(asset) {
    const modal = document.getElementById('image-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalImage = document.getElementById('modal-image');
    const modalDetails = document.getElementById('modal-details');

    modalTitle.textContent = asset.filename;
    modalImage.src = asset.url;
    modalImage.alt = asset.filename;

    const recommendedFor =
      asset.ratioCategory === '4:3'
        ? 'Featured Articles (Positions 1-4)'
        : asset.ratioCategory === '16:9'
        ? 'Regular Articles (Positions 5+)'
        : 'Custom Use';

    modalDetails.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <strong>Dimensions:</strong> ${asset.dimensions.width} × ${asset.dimensions.height}px
                </div>
                <div>
                    <strong>Aspect Ratio:</strong> ${asset.ratio}
                </div>
                <div>
                    <strong>File Type:</strong> ${asset.type}
                </div>
                <div>
                    <strong>Best Used For:</strong> ${recommendedFor}
                </div>
                <div class="col-span-2">
                    <strong>URL:</strong> 
                    <code class="bg-gray-100 px-2 py-1 rounded text-sm break-all">${asset.url}</code>
                </div>
            </div>
        `;

    // Store current asset for modal actions
    modal.dataset.currentAsset = JSON.stringify(asset);
    modal.classList.remove('hidden');
  }

  closeModal() {
    document.getElementById('image-modal').classList.add('hidden');
  }

  copyImageUrl() {
    const modal = document.getElementById('image-modal');
    const asset = JSON.parse(modal.dataset.currentAsset);
    this.copyToClipboard(asset.url);
  }

  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showSuccess('URL copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      this.showError('Failed to copy URL');
    }
  }

  deleteImage() {
    const modal = document.getElementById('image-modal');
    const asset = JSON.parse(modal.dataset.currentAsset);

    if (confirm(`Are you sure you want to delete "${asset.filename}"?`)) {
      // TODO: Implement delete functionality
      this.showError('Delete functionality not yet implemented');
    }
  }

  // File upload handlers
  handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
  }

  handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
  }

  handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files);
    this.handleFiles(files);
  }

  handleFileSelect(e) {
    const files = Array.from(e.target.files);
    this.handleFiles(files);
  }

  handleFiles(files) {
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      this.showError('Please select image files only');
      return;
    }

    // TODO: Implement file upload
    this.showError('File upload functionality not yet implemented');
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type) {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Initialize the content manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new ContentManager();
});
