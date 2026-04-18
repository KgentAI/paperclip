## ADDED Requirements

### Requirement: Language switcher in settings
The system SHALL provide a language selector dropdown in the ProfileSettings page allowing users to choose between "English" and "中文".

#### Scenario: User selects Chinese in settings
- **WHEN** the user opens ProfileSettings and selects "中文" from the language dropdown
- **THEN** the UI immediately switches all visible text to Chinese without page reload, and the choice is persisted to localStorage

#### Scenario: User selects English in settings
- **WHEN** the user opens ProfileSettings and selects "English" from the language dropdown
- **THEN** the UI immediately switches all visible text to English, and the choice is persisted to localStorage

### Requirement: Default language detection
The system SHALL default to the user's browser language setting. If the browser language starts with `zh`, the UI SHALL display Chinese. Otherwise it SHALL display English.

#### Scenario: Chinese browser user sees Chinese UI
- **WHEN** a user with browser language set to `zh-CN` or `zh` accesses Paperclip for the first time (no localStorage preference)
- **THEN** the UI displays in Chinese

#### Scenario: English browser user sees English UI
- **WHEN** a user with browser language set to `en` or `en-US` accesses Paperclip for the first time
- **THEN** the UI displays in English

#### Scenario: Unsupported browser language falls back to English
- **WHEN** a user with browser language set to `fr` or `ja` (not yet supported) accesses Paperclip for the first time
- **THEN** the UI displays in English

### Requirement: Language preference persistence
The system SHALL persist the user's language choice to localStorage under the key `paperclip-ui-language`. On subsequent visits, the stored preference takes precedence over browser language detection.

#### Scenario: Returning user sees their chosen language
- **WHEN** a user who previously selected Chinese returns to Paperclip with a browser language of English
- **THEN** the UI displays in Chinese (localStorage preference overrides browser detection)

### Requirement: Language switcher shows current language
The language selector SHALL visually indicate the currently active language.

#### Scenario: Current language is highlighted
- **WHEN** the user opens the language selector with Chinese currently active
- **THEN** "中文" is shown as the selected/highlighted option
