# Requirements Document

## Introduction

This feature enables users to organize and retrieve transparency reports by their primary source. Users can view all articles that reference a specific primary source, making it easier to track reporting patterns, verify consistency across articles, and understand how different sources are being used throughout the publication.

## Glossary

- **Primary Source**: The main reference document, URL, or entity that an article is based on (stored in article.primary_source field)
- **Transparency Report**: A comprehensive verification document showing sources, bias analysis, claim mapping, and credibility assessments for an article
- **Source Index**: A database collection or aggregation that groups articles by their primary source
- **Report Retrieval System**: The backend and frontend components that enable searching and displaying articles by primary source

## Requirements

### Requirement 1

**User Story:** As a reader, I want to view all articles that reference a specific primary source, so that I can see how that source has been used across different articles.

#### Acceptance Criteria

1. WHEN a user views a transparency report, THE Report Retrieval System SHALL display a clickable link or button for the primary source
2. WHEN a user clicks on a primary source link, THE Report Retrieval System SHALL navigate to a page showing all articles that reference that primary source
3. THE Report Retrieval System SHALL display at least the article title, publication date, category, and excerpt for each article in the list
4. WHERE the primary source is a URL, THE Report Retrieval System SHALL normalize the URL to group variations of the same source together
5. THE Report Retrieval System SHALL display the total count of articles referencing the selected primary source

### Requirement 2

**User Story:** As an editor, I want to search for articles by primary source, so that I can quickly find all content related to a specific source document or reference.

#### Acceptance Criteria

1. THE Report Retrieval System SHALL provide a search interface that accepts primary source text or URL as input
2. WHEN a user enters a primary source query, THE Report Retrieval System SHALL return all articles with matching or similar primary sources within 2 seconds
3. THE Report Retrieval System SHALL support partial matching for primary source searches
4. THE Report Retrieval System SHALL display search results in a sortable list with options for date, category, and relevance
5. WHERE no articles match the search query, THE Report Retrieval System SHALL display a message indicating no results were found

### Requirement 3

**User Story:** As an editor, I want to see a list of all primary sources used across articles, so that I can understand which sources are most frequently referenced.

#### Acceptance Criteria

1. THE Report Retrieval System SHALL provide a primary sources index page listing all unique primary sources
2. THE Report Retrieval System SHALL display the article count for each primary source in the index
3. THE Report Retrieval System SHALL sort primary sources by article count in descending order by default
4. WHEN a user clicks on a primary source in the index, THE Report Retrieval System SHALL navigate to the detailed view showing all articles for that source
5. THE Report Retrieval System SHALL support filtering the primary sources index by category

### Requirement 4

**User Story:** As a developer, I want the system to automatically index articles by primary source, so that the feature works without manual intervention.

#### Acceptance Criteria

1. WHEN an article is created or updated, THE Source Index SHALL automatically extract and store the primary source reference
2. THE Source Index SHALL maintain a mapping between primary sources and article IDs
3. WHERE a primary source is modified in an article, THE Source Index SHALL update the mapping within 5 seconds
4. WHERE an article is deleted, THE Source Index SHALL remove the article from all primary source mappings within 5 seconds
5. THE Source Index SHALL handle null or empty primary source values without errors

### Requirement 5

**User Story:** As a reader, I want to see related articles from the same primary source on the transparency report page, so that I can explore connected content.

#### Acceptance Criteria

1. WHEN a transparency report is displayed, THE Report Retrieval System SHALL show a "Related by Primary Source" section
2. THE Report Retrieval System SHALL display up to 5 other articles that share the same primary source
3. THE Report Retrieval System SHALL exclude the current article from the related articles list
4. WHERE fewer than 2 related articles exist, THE Report Retrieval System SHALL hide the "Related by Primary Source" section
5. WHEN a user clicks on a related article, THE Report Retrieval System SHALL navigate to that article's transparency report
