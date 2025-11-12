/**
 * Transparency Page - Displays comprehensive article verification and analysis
 */

class TransparencyReport {
  constructor() {
    this.articleSlug = this.getArticleSlugFromUrl();
    this.article = null;
    this.init();
  }

  init() {
    this.setupEventListeners();

    if (this.articleSlug) {
      this.loadArticle(this.articleSlug);
    } else {
      this.showNoArticle();
    }
  }

  setupEventListeners() {
    const loadBtn = document.getElementById('load-slug-btn');
    const slugInput = document.getElementById('slug-input');

    if (loadBtn) {
      loadBtn.addEventListener('click', () => this.loadFromInput());
    }

    if (slugInput) {
      slugInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.loadFromInput();
        }
      });
    }
  }

  loadFromInput() {
    const slugInput = document.getElementById('slug-input');
    const slug = slugInput.value.trim();

    if (slug) {
      // Update URL without reload
      const url = new URL(window.location);
      url.searchParams.set('article', slug);
      window.history.pushState({}, '', url);

      this.articleSlug = slug;
      this.loadArticle(slug);
    } else {
      alert('Please enter an article slug');
    }
  }

  showNoArticle() {
    document.getElementById('article-title').textContent = 'No article loaded';
    document.getElementById('article-meta').textContent =
      'Enter an article slug above to load transparency data';
  }

  getArticleSlugFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('article') || urlParams.get('slug');
  }

  async loadArticle(slug) {
    try {
      const response = await fetch(`/api/articles/${slug}`);

      if (!response.ok) {
        throw new Error('Article not found');
      }

      const result = await response.json();
      this.article = result.article;

      this.renderTransparencyReport();
    } catch (error) {
      console.error('Error loading article:', error);
      this.showError(
        'Failed to load article. Make sure the server is running and the article exists.'
      );
    }
  }

  renderTransparencyReport() {
    if (!this.article) return;

    // Update page header
    document.getElementById('article-title').textContent = this.article.title;
    document.getElementById('verification-date').textContent = new Date(
      this.article.createdAt
    ).toLocaleDateString();

    // Render each section
    this.renderSummary();
    this.renderPrimarySource();
    this.renderRatedSources();
    this.renderSpecialReports();
    this.renderBiasAnalysis();
    this.renderClaimMapping();
    this.renderSuggestedReading();
    this.renderRelatedByPrimarySource();
  }

  renderSummary() {
    const content = document.getElementById('summary-content');
    const summary =
      this.article.excerpt || this.article.summary || 'No summary available.';

    content.innerHTML = `
            <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p class="text-black leading-relaxed">${this.formatText(
                  summary
                )}</p>
            </div>
            <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div class="bg-gray-50 p-3 rounded">
                    <div class="font-semibold text-black">Category</div>
                    <div class="text-black">${this.article.category}</div>
                </div>
                <div class="bg-gray-50 p-3 rounded">
                    <div class="font-semibold text-black">Author</div>
                    <div class="text-black">${this.article.author}</div>
                </div>
                <div class="bg-gray-50 p-3 rounded">
                    <div class="font-semibold text-black">Published</div>
                    <div class="text-black">${new Date(
                      this.article.publishedAt || this.article.createdAt
                    ).toLocaleDateString()}</div>
                </div>
                <div class="bg-gray-50 p-3 rounded">
                    <div class="font-semibold text-black">Status</div>
                    <div class="text-black">${
                      this.article.published ? '✅ Published' : '📝 Draft'
                    }</div>
                </div>
            </div>
        `;
  }

  renderPrimarySource() {
    const content = document.getElementById('primary-source-content');
    const primarySource =
      this.article.primary_source || 'No primary source specified.';

    const encodedSource = encodeURIComponent(primarySource);
    const sourceDetailLink = `source-detail.html?source=${encodedSource}`;

    if (this.isUrl(primarySource)) {
      content.innerHTML = `
                <div class="flex items-start gap-3">
                    <div class="text-3xl">🔗</div>
                    <div class="flex-1">
                        <h3 class="font-bold text-lg text-black mb-2">Primary Source URL</h3>
                        <a href="${primarySource}" target="_blank" class="text-blue-600 hover:underline break-all">
                            ${primarySource}
                        </a>
                        <p class="text-sm text-black mt-2">
                            This is the main source document or reference for this article.
                        </p>
                        <a href="${sourceDetailLink}" class="inline-block mt-3 text-blue-600 hover:underline text-sm font-medium">
                            📎 View all articles from this source →
                        </a>
                    </div>
                </div>
            `;
    } else {
      content.innerHTML = `
                <div class="flex items-start gap-3">
                    <div class="text-3xl">📄</div>
                    <div class="flex-1">
                        <h3 class="font-bold text-lg text-black mb-2">Primary Source</h3>
                        <p class="text-black">${this.formatText(
                          primarySource
                        )}</p>
                        <a href="${sourceDetailLink}" class="inline-block mt-3 text-blue-600 hover:underline text-sm font-medium">
                            📎 View all articles from this source →
                        </a>
                    </div>
                </div>
            `;
    }
  }

  renderSourceList() {
    const content = document.getElementById('source-list-content');
    const sources = this.article.sources || 'No sources listed.';

    if (sources === 'No sources listed.') {
      content.innerHTML = `<p class="text-black italic">${sources}</p>`;
      return;
    }

    const sourceLines = sources.split('\n').filter((line) => line.trim());

    let html = '<div class="space-y-3">';
    sourceLines.forEach((source, index) => {
      const isUrl = this.isUrl(source);
      html += `
                <div class="source-card">
                    <div class="flex items-start gap-3">
                        <div class="font-bold text-blue-600 text-lg">${
                          index + 1
                        }.</div>
                        <div class="flex-1">
                            ${
                              isUrl
                                ? `<a href="${source}" target="_blank" class="text-blue-600 hover:underline break-all">${source}</a>`
                                : `<p class="text-black">${this.parseMarkdownLinks(
                                    source
                                  )}</p>`
                            }
                        </div>
                    </div>
                </div>
            `;
    });
    html += '</div>';

    content.innerHTML = html;
  }

  renderRatedSources() {
    const content = document.getElementById('rated-sources-content');
    const ratedSources = this.article.rated_sources;

    if (!ratedSources || ratedSources.trim() === '') {
      content.innerHTML = `
                <p class="text-black italic">No rated sources analysis available for this article.</p>
                <p class="text-sm text-black mt-2">Rated sources provide detailed credibility assessments of each source used in the article.</p>
            `;
      return;
    }

    content.innerHTML = `
            <div class="prose max-w-none">
                ${this.formatMarkdown(ratedSources)}
            </div>
        `;
  }

  renderSpecialReports() {
    const content = document.getElementById('special-reports-content');
    const specialReportTitle = this.article.special_report_title;
    const specialReportContent = this.article.special_report_content;
    const specialReportQuotes = this.article.special_report_quotes;

    if (!specialReportTitle && !specialReportContent) {
      content.innerHTML = `
                <p class="text-black italic">No special reports available for this article.</p>
            `;
      return;
    }

    let html = '';

    if (specialReportTitle || specialReportContent) {
      html += `
                <div class="special-report-card">
                    <h3 class="text-2xl font-bold mb-4">${
                      specialReportTitle || 'Special Report'
                    }</h3>
                    ${
                      specialReportContent
                        ? `<div class="opacity-90">${this.formatText(
                            specialReportContent
                          )}</div>`
                        : ''
                    }
                </div>
            `;
    }

    if (specialReportQuotes) {
      html += `
                <div class="mt-6">
                    <h4 class="text-xl font-bold text-black mb-4">📌 Key Quotes</h4>
                    <div class="space-y-4">
                        ${this.formatQuotes(specialReportQuotes)}
                    </div>
                </div>
            `;
    }

    content.innerHTML = html;
  }

  renderBiasAnalysis() {
    const content = document.getElementById('bias-analysis-content');
    const biasAnalysis = this.article.bias_analysis;

    if (!biasAnalysis || biasAnalysis.trim() === '') {
      content.innerHTML = `
                <p class="text-black italic">No bias analysis available for this article.</p>
                <p class="text-sm text-black mt-2">Bias analysis examines the article for potential bias in language, source selection, and framing.</p>
            `;
      return;
    }

    content.innerHTML = `
            <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-6">
                <h4 class="font-bold text-yellow-900 mb-2">⚠️ About Bias Analysis</h4>
                <p class="text-yellow-800 text-sm">
                    This analysis examines the article for potential bias in language, source selection, and framing to ensure balanced reporting.
                </p>
            </div>
            <div class="prose max-w-none">
                ${this.formatMarkdown(biasAnalysis)}
            </div>
        `;
  }

  renderClaimMapping() {
    const content = document.getElementById('claim-mapping-content');
    const claimMapping = this.article.claim_source_mapping;

    if (!claimMapping || claimMapping.trim() === '') {
      content.innerHTML = `
                <p class="text-black italic">No claim-to-source mapping available for this article.</p>
                <p class="text-sm text-black mt-2">Claim-to-source mapping shows how each factual claim in the article is supported by sources.</p>
            `;
      return;
    }

    content.innerHTML = `
            <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
                <h4 class="font-bold text-blue-900 mb-2">🔍 About Claim Mapping</h4>
                <p class="text-blue-800 text-sm">
                    This mapping provides transparency about how each significant claim in the article is supported by the referenced sources.
                </p>
            </div>
            <div class="prose max-w-none">
                ${this.formatMarkdown(claimMapping)}
            </div>
        `;
  }

  renderSuggestedReading() {
    const content = document.getElementById('suggested-reading-content');

    const suggestedReading = this.article.suggested_reading;

    if (!suggestedReading || suggestedReading.trim() === '') {
      content.innerHTML = `
        <p class="text-black italic">No suggested reading available for this article.</p>
      `;
      return;
    }

    // Parse suggested reading (could be JSON or Markdown)
    content.innerHTML = `
      <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
        <h4 class="font-bold text-black mb-2">📚 Recommended Books</h4>
        <p class="text-black text-sm">
          Deepen your understanding with these curated book recommendations related to this article's topics.
        </p>
      </div>
      <div class="prose max-w-none">
        ${this.formatMarkdown(suggestedReading)}
      </div>
    `;
  }

  async fetchRelatedByPrimarySource() {
    const primarySource = this.article.primary_source;

    if (!primarySource || primarySource.trim() === '') {
      return [];
    }

    try {
      const encodedSource = encodeURIComponent(primarySource);
      const response = await fetch(
        `/api/primary-sources/${encodedSource}/articles?limit=6`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch related articles');
      }

      const result = await response.json();

      // Filter out current article and limit to 5
      const relatedArticles = result.articles
        .filter((a) => a.slug !== this.article.slug)
        .slice(0, 5);

      return relatedArticles;
    } catch (error) {
      console.error(
        'Error fetching related articles by primary source:',
        error
      );
      return [];
    }
  }

  async renderRelatedByPrimarySource() {
    const content = document.getElementById('related-primary-source-content');

    if (!content) {
      return;
    }

    const primarySource = this.article.primary_source;

    if (!primarySource || primarySource.trim() === '') {
      content.parentElement.style.display = 'none';
      return;
    }

    try {
      const relatedArticles = await this.fetchRelatedByPrimarySource();

      // Hide section if fewer than 2 related articles
      if (relatedArticles.length < 2) {
        content.parentElement.style.display = 'none';
        return;
      }

      content.parentElement.style.display = 'block';

      const encodedSource = encodeURIComponent(primarySource);
      const sourceDetailLink = `source-detail.html?source=${encodedSource}`;

      let html = `
        <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6">
          <h4 class="font-bold text-black mb-2">📎 Related by Primary Source</h4>
          <p class="text-black text-sm">
            Other articles referencing: 
            <a href="${sourceDetailLink}" class="text-blue-600 hover:underline font-medium">
              ${
                this.isUrl(primarySource)
                  ? primarySource
                  : this.formatText(primarySource)
              }
            </a>
          </p>
        </div>
        <div class="space-y-4">
      `;

      relatedArticles.forEach((article) => {
        const publishDate = new Date(
          article.publishedAt || article.createdAt
        ).toLocaleDateString();
        html += `
          <div class="reading-suggestion-card">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <div class="mb-2">
                  <span class="suggestion-tag">${article.category}</span>
                  <span class="text-sm text-black">${publishDate}</span>
                </div>
                <h3 class="text-xl font-bold text-black mb-2 hover:text-blue-600">
                  <a href="article.html?slug=${article.slug}">${
          article.title
        }</a>
                </h3>
                <p class="text-black text-sm mb-3 line-clamp-2">
                  ${
                    article.excerpt ||
                    article.summary ||
                    'Read more about this topic...'
                  }
                </p>
                <div class="flex items-center gap-4 text-sm text-black">
                  <span>✍️ ${article.author}</span>
                  <a href="transparency.html?article=${
                    article.slug
                  }" class="text-blue-600 hover:underline">
                    View Transparency Report →
                  </a>
                </div>
              </div>
              <div class="text-4xl">📄</div>
            </div>
          </div>
        `;
      });

      html += `
        </div>
        <div class="mt-6 text-center">
          <a href="${sourceDetailLink}" class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            View all articles from this source →
          </a>
        </div>
      `;

      content.innerHTML = html;
    } catch (error) {
      console.error(
        'Error rendering related articles by primary source:',
        error
      );
      content.parentElement.style.display = 'none';
    }
  }

  // Utility functions
  isUrl(text) {
    try {
      new URL(text);
      return true;
    } catch {
      return text.startsWith('http://') || text.startsWith('https://');
    }
  }

  parseMarkdownLinks(text) {
    if (!text) return '';
    // Parse [text](url) format
    return text.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" class="text-blue-600 hover:underline">$1</a>'
    );
  }

  formatText(text) {
    if (!text) return '';
    return text.replace(/\n/g, '<br>');
  }

  formatMarkdown(text) {
    if (!text) return '';
    try {
      if (typeof marked !== 'undefined') {
        return marked.parse(text);
      } else {
        // Fallback: parse Markdown links manually
        let html = this.parseMarkdownLinks(text);
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        html = html.replace(/\n\n/g, '</p><p>');
        html = '<p>' + html + '</p>';
        return html;
      }
    } catch (error) {
      return this.parseMarkdownLinks(text).replace(/\n/g, '<br>');
    }
  }
  formatQuotes(quotes) {
    if (!quotes) return '';

    const quoteLines = quotes.split('\n\n').filter((q) => q.trim());

    return quoteLines
      .map(
        (quote) => `
            <div class="bg-gray-50 border-l-4 border-gray-400 p-4 rounded italic">
                <p class="text-black">${quote}</p>
            </div>
        `
      )
      .join('');
  }

  showError(message) {
    document.querySelector('.container').innerHTML = `
            <div class="transparency-section bg-red-50 border-l-4 border-red-500">
                <h2 class="text-2xl font-bold text-red-900 mb-4">❌ Error</h2>
                <p class="text-red-700">${message}</p>
                <div class="mt-4">
                    <a href="articles-manager.html" class="text-blue-600 hover:underline">← Back to Articles Manager</a>
                </div>
            </div>
        `;
  }
}

// Initialize transparency report when page loads
document.addEventListener('DOMContentLoaded', () => {
  new TransparencyReport();
});
