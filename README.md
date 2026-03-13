# Smarty

**Smarty** is an experimental smart-kitchen platform that combines
**computer vision, ingredient inventory, and recipe assistance** to help
users make better use of the food they already have.

The project explores the idea of a **digital fridge companion** that can
recognize ingredients, track inventory, and eventually recommend meals.

The repository currently contains two main applications:

-   **ImageAI** -- an AI-powered fridge scanner that detects ingredients
-   **Fridge Space Arcade** -- a frontend interface for managing fridge
    contents

This project is an early prototype exploring the intersection of **AI,
food inventory management, and smart cooking assistants**.

------------------------------------------------------------------------

# Project Structure

    smarty/
    │
    ├── ImageAI/                     # AI fridge scanning application
    │   ├── src/
    │   ├── components/
    │   └── configuration files
    │
    ├── fridge-space-arcade-main/    # React frontend interface
    │   ├── src/
    │   ├── public/
    │   └── configuration files
    │
    └── README.md

------------------------------------------------------------------------

# Applications

## 1. ImageAI

An experimental **AI-powered ingredient recognition application**.

The goal of this module is to allow users to **scan their fridge using a
camera** and automatically detect food items.

### Possible capabilities

-   Capture fridge images
-   Detect ingredients using computer vision
-   Send ingredient data to the frontend inventory system

### Technology stack

-   **Next.js**
-   **React**
-   **Firebase**
-   **TypeScript**

------------------------------------------------------------------------

## 2. Fridge Space Arcade

A **React-based user interface** for interacting with fridge inventory.

This application provides the user-facing experience where ingredients
can be viewed and managed.

### Technology stack

-   **React**
-   **TypeScript**
-   **Vite**
-   **CSS**

The project was scaffolded using **Lovable.dev**.

------------------------------------------------------------------------

# Vision

The long-term goal of Smarty is to evolve into a **complete smart
kitchen assistant**, including:

-   AI fridge scanning
-   Ingredient inventory tracking
-   Recipe suggestions based on available ingredients
-   Nutrition and calorie tracking
-   Meal history and daily macro reports

------------------------------------------------------------------------

# Running the Projects

Each application currently runs independently.

## Run Fridge Space Arcade

    cd fridge-space-arcade-main
    npm install
    npm run dev

------------------------------------------------------------------------

## Run ImageAI

    cd ImageAI
    npm install
    npm run dev

------------------------------------------------------------------------

# Current Status

This repository represents an **early prototype / exploration project**.

Some features are incomplete or experimental. The architecture may
evolve as the project develops.

------------------------------------------------------------------------

# Future Improvements

Planned directions include:

-   Unified backend
-   Ingredient database
-   AI recipe generation
-   Nutrition tracking
-   Mobile support
-   Integration between scanning and inventory systems

------------------------------------------------------------------------

# Contributing

This project is currently experimental and under development.

Contributions, ideas, and feedback are welcome.

------------------------------------------------------------------------

# License

This project is provided for experimental and educational purposes.
