# **English Healer Frontend Codebase Template Documentation**

## **Project Overview**

This repository serves as the frontend template for the English Healer project. It is designed using React and a modular, scalable architecture. The structure is aimed at facilitating the addition of new features, easy collaboration, and reusability across different parts of the project.

---

## **Folder Structure**

### **1. `src`**

The root folder for all source code of the project. Contains the core application logic, reusable components, and assets.

---

### **2. `components`**

Houses reusable React components that can be shared across different pages.

- **`global/`**

  - Components that are globally available throughout the application.
  - Example: Header, Footer, Sidebar, Navbar, etc.
  - **Purpose:**
    - Reduce code duplication.
    - Centralize global UI elements for consistency.
  - **Example Files:**
    - `Header.jsx`
    - `Footer.jsx`
    - `Sidebar.jsx`

- **`ui/`**
  - Smaller, reusable UI elements used as building blocks for larger components.
  - Example: Buttons, Modals, Dropdowns, Tabs, etc.
  - **Purpose:**
    - Serve as a design system or component library for consistent styling.
  - **Example Files:**
    - `Button.jsx`
    - `Card.jsx`
    - `Modal.jsx`

---

### **3. `contexts`**

Contains all React context providers for global state management.

- **Purpose:**
  - Manage global states like authentication, theming, or user preferences.
  - Example: `AuthContext`, `ThemeContext`.
- **Structure:**
  - Each context typically includes:
    - A provider component.
    - Relevant hooks for accessing context values.
    - Logic for managing state updates.

---

### **4. `hooks`**

Custom React hooks for abstracting reusable logic.

- **Purpose:**
  - Encapsulate reusable logic and separate concerns from components.
  - Example: `useAuth`, `useFetch`, `useTheme`.
- **Structure:**
  - Hooks are written in files prefixed with `use`.
- **Example Files:**
  - `useAuth.js`
  - `useFetch.js`
  - `useLocalStorage.js`

---

### **5. `routes`**

Defines the application's routing configuration.

- **Purpose:**
  - Organize and manage all application routes.
  - Centralize route definitions for easier updates and navigation structure.
- **Example Files:**
  - `Route.jsx` - Configures the main routes using `react-router-dom`.
  - **Dynamic Routing:** Supports modular routes for different pages like Home, Dashboard, etc.

---

### **6. `pages`**

Contains the primary views of the application, divided into subfolders for each feature or section.

#### **Structure:**

- **`components/`**
  - Subfolder for reusable components specific to a page.
  - Example: Page-specific cards, modals, or forms.
- **`Layout.jsx`**
  - Defines the layout structure (e.g., Navbar, Sidebar, Footer) for a specific section.
  - Example: Dashboard layout, Public page layout.
- **`home/`**

  - Subfolder for the home page.
  - Contains the main file (`Home.jsx`) and components specific to the home page.
  - Example:
    - `Home.jsx` - Main component for the home page.
    - `components/` - Subfolder for home-specific reusable components.

- **`dashboard/`**
  - Subfolder for the dashboard section.
  - Follows a similar structure to the `home/` folder.
  - Example:
    - `Layout.jsx` - Defines the dashboard layout (e.g., Sidebar, Topbar).
    - `home/` - Contains dashboard home logic and components.

---

## **Code Style and Standards**

- **Component Naming:**
  - Use **PascalCase** for components and folders (e.g., `Header.jsx`, `Home/`).
- **File Naming:**
  - Use **camelCase** for utility functions or non-component files (e.g., `useAuth.js`).
- **CSS/Styling:**
  - If using CSS modules or libraries like Tailwind, keep styles scoped and avoid global conflicts.

---

## **Development Principles**

### **1. Reusability**

- Create components that are generic and configurable for various use cases.
- Example:
  - A `Button` component that accepts props like `type`, `onClick`, and `variant`.

### **2. Modularity**

- Structure the codebase so each feature or section is self-contained.
- Example:
  - The `pages/home` folder contains everything related to the home page, making it easy to locate and update.

### **3. Scalability**

- Ensure new features can be added with minimal impact on the existing structure.
- Example:
  - Adding a new section like `admin/` will follow the same modular structure as `dashboard/`.

### **4. Performance**

- Optimize the use of React Query for caching and minimizing network requests.
- Lazy load routes and components to improve initial load times.

---

## **Best Practices**

- **Component Organization:**

  - Reusable components go under `components/global` or `components/ui`.
  - Page-specific components go inside their respective `pages` subfolders.

- **Global State:**

  - Use context providers from `contexts/` for cross-cutting concerns like authentication and theming.

- **Custom Hooks:**

  - Encapsulate logic in `hooks/` to reduce complexity in components.

- **Routing:**
  - Centralize route definitions in `routes/` for maintainability and dynamic routing.

---

## **Future Scalability**

This template is designed for scalability and flexibility:

- **Adding New Features:**
  - Create a new folder under `pages` for the feature.
  - Define reusable components under `components/`.
  - Configure routes in `routes/Route.jsx`.
- **Adding New Contexts:**
  - Define the context in `contexts/`.
  - Wrap the `App` component or relevant sections with the provider.

---

## **Key Technologies**

- **React**: Core library for building the UI.
- **React Query**: For server-state management and caching.
- **React Router**: For handling navigation and routing.
- **Context API**: For global state management.
- **Sonner**: For toast notifications.
- **Helmet**: For managing the document head.

---

## **Example Workflow**

**Adding a New Feature (e.g., `profile` page):**

- Create a folder `pages/profile`.
- Add a main file `Profile.jsx`.
- Define `components/` subfolder for page-specific components.
- Add a route for the profile page in `routes/Route.jsx`.
