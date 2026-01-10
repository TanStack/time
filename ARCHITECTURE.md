## Overview

`@tanstack/time` is a headless utility library designed to facilitate the creation of time and calendar components across various JavaScript frameworks, including TypeScript/JavaScript, React, Solid, Vue, Svelte, and Angular. This document provides an overview of the architecture and design principles of the library.


## Design Principles

### Headless utilities
The library provides core functionalities without imposing any UI constraints, allowing developers to build custom UI components tailored to their specific needs.

### Framework agnostic
Core logic is implemented in a framework-agnostic manner, ensuring compatibility across multiple frameworks.

### Modular and extensible
The library is designed to be modular, enabling developers to use only the parts they need and extend functionalities when required.

### Type safety
Leveraging TypeScript to provide a strongly typed API, ensuring better developer experience and reducing runtime errors.

### Standards-based
The library uses standards-based core logic, aligning with modern web standards and best practices.
Internationalization and localization
TanStack Time is designed to handle various locales, calendars, and timezones, addressing the complexities of global date and time representation.
Core Modules
### Time utilities
The library provides a set of utilities for working with time, including parsing, formatting, and manipulating time values.

### Calendar utilities
Calendar utilities enable developers to work with calendar-related functionalities, such as date range calculations, month view generation, and event scheduling.

### Date manipulation
Utilities for performing date math, comparisons, grouping, and range operations.
Formatting
Flexible date and time formatting options based on locale, calendar, and timezone.

## Project Structure

The project is structured as follows:
```lua
├── packages                # Contains individual packages for different frameworks
│   ├── time                # Core logic shared across all packages
│        ├── src            # Core logic implementation
│        ├── test           # Unit tests
│   ├── {framework}-time    # Adapters for specific frameworks (e.g., react-time, vue-time)
├── examples                # Example applications demonstrating library usage
├── docs                    # Documentation files
├── scripts                 # Build and test scripts
```

The core logic is implemented in the `time` package, which contains the shared functionality across all framework-specific packages. Each framework-specific package (e.g., `react-time`, `vue-time`) contains the necessary adapters to integrate the core logic with the respective framework.


## API Design

The API of @tanstack/time is designed to be intuitive and flexible. It provides a set of core functions that can be easily composed to build complex time and calendar functionalities. The API is consistent across different frameworks, ensuring a seamless developer experience when switching between frameworks.

### Key API features include:

Parsing of RFC 3339 date time strings, epoch time, and Date objects
Formatting based on Intl.DateTimeFormat standards
Date math operations
Comparison and sorting utilities
Grouping and range operations
Timezone and DST handling

## Extensibility
The library is designed to be extensible, allowing developers to add custom functionalities or modify existing ones to suit their requirements. Developers can extend the core logic by creating custom utilities or by composing existing utilities in new ways.

### Temporal API Integration
TanStack Time leverages the upcoming Temporal API, using a polyfill maintained by the TC39 champions until it's fully ratified and implemented by all major browsers. This ensures forward compatibility and access to advanced date and time manipulation features.

### Internationalization
The library is built with internationalization in mind, addressing the complexities of different calendar systems, date formats, and time representations across various cultures and regions.

### Performance Considerations

Memoization is used for formatters to improve performance when repeatedly formatting dates.
The library provides options for working with "simple" date representations (strings or numbers) to facilitate easier memoization in application code.

### Compatibility
While focusing on modern standards, TanStack Time also provides compatibility options for working with legacy date formats and parsing methods, ensuring broad applicability across different project requirements.
