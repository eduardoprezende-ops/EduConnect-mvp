# Overview

EduConnect is a Brazilian educational platform MVP designed to connect students, mentors, and knowledge in a collaborative environment. The platform enables users to create and join study groups, find mentors or become mentors themselves, and share educational materials within the community. The application is built as a client-side web application using pure HTML, CSS, and JavaScript with Portuguese language interface and localStorage persistence.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The application follows a traditional multi-page web application structure with three main HTML pages:
- **index.html**: Landing page showcasing platform features with EduConnect branding and navigation to Login/Register
- **login.html**: Authentication page with tabbed login/registration forms including name, email, and password fields
- **dashboard.html**: Complete user interface with three main sections: study groups (create/join), mentoring (find mentor/become mentor), and material sharing (upload simulation and link sharing)

## Client-Side State Management
The application uses browser localStorage as the primary data persistence mechanism:
- **Local Storage**: Complete data persistence for users, study groups, mentorings, mentors, and shared materials
- **Session Management**: User authentication state maintained through localStorage with currentUser key
- **Data Structure**: JSON-based storage with Storage helper object providing get, set, and add methods for CRUD operations
- **Authentication**: Auth module handles login, registration, session management, and access control

## Authentication System
Simple client-side authentication without server validation:
- **Registration**: Email uniqueness validation with password storage
- **Login**: Email/password matching against stored user data
- **Session**: Basic session management using localStorage flags

## User Interface Design
Responsive design with CSS Grid and Flexbox:
- **Responsive Layout**: Mobile-first approach with flexible container system and media queries
- **Theming**: Light color scheme with gradient-based branding (gray gradients), highlighted buttons, and intuitive navigation
- **Component Structure**: Modular CSS classes for reusable UI components including modals, forms, and list items
- **Interactive Elements**: Modal-driven workflows for creating groups, finding mentors, and sharing materials

## JavaScript Architecture
Vanilla JavaScript with modular utility patterns:
- **Utility Functions**: DOM manipulation helpers ($, $$) and localStorage abstraction (Storage object)
- **Auth Module**: Comprehensive authentication system with login, registration, session management, and access control
- **Event Handling**: Complete form submission, navigation, modal management, and interactive features
- **Data Management**: Functions for loading and displaying user groups, mentorings, and shared materials
- **Modal System**: Reusable modal framework for all interactive forms and data display

# External Dependencies

## Browser APIs
- **localStorage**: Primary data persistence mechanism for user data and application state
- **DOM API**: Standard web APIs for user interface manipulation and event handling

## No External Libraries
The application is built entirely with vanilla web technologies:
- No JavaScript frameworks or libraries
- No CSS frameworks or preprocessors
- No build tools or bundlers required
- No server-side dependencies

## Future Integration Considerations
The current architecture uses localStorage as a temporary solution, with the expectation that a proper database backend will be integrated later:
- Database schema design would need to accommodate users, study groups, and mentoring relationships
- Authentication system would require server-side validation and session management
- API endpoints would need to be created for data operations currently handled by localStorage