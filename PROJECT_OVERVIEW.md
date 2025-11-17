# FPGA Design Assistant

## Project Overview

This project is a web-based educational tool designed for the automated analysis, verification, and optimization of VHDL code using Large Language Models. Its primary purpose is to function as an intelligent mentor that not only detects syntax, logic, and synthesis errors but also explains the root cause of these issues and suggests architectural improvements. The system is built around **Claude Sonnet 4.5** as the core analytical engine due to its superior performance in detecting hardware synthesis problems, while also offering **Gemini 2.5 Pro** as an alternative model option.

## Functional Scope

The application is developed using a modern technology stack comprising **Next.js, TypeScript, Material UI, and Zustand**. Functionally, the system integrates two core workflows:

- **Intelligent Code Analysis:** This module provides a VHDL code editor and a model selection interface. It processes user input to identify specific error categories—ranging from basic syntax to critical synthesis issues—and presents them through an interactive report containing error severity levels, educational explanations, and refactoring suggestions.
- **Testbench Generation:** This module utilizes the verified code to automatically generate VHDL test environments. It parses the code structure and translates natural language testing scenarios provided by the user into ready-to-use testbench files.

## Operational Workflow

In its final operational state, the user flow creates a seamless iteration cycle:

1. **Model Selection & Input:** The user selects their preferred AI model and inputs VHDL code into the editor.
2. **Analysis:** The system processes the code and provides immediate, highlighted feedback on errors.
3. **Optimization:** The user interactively applies the recommended fixes to optimize the design.
4. **Scenario Definition:** Specific testing requirements are defined by the user in plain text.
5. **Generation:** The system generates a complete VHDL testbench file corresponding to the optimized design.
6. **Export:** Finally, the user exports the result for validation in external hardware simulators.
