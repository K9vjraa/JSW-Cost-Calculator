# Quality and Documentation Standards Blueprint

This document acts as the authoritative Single Source of Truth (SSOT) for the style, formatting, visual assets, code snippet implementation, and structural requirements of the **JSW Metal Cost Management System (MCMS) Internship Report**.

---

## 1. Report Writing Standards

*   **Writing Style:** The report must be written in formal, academic, and technical English suitable for university evaluation and senior corporate leadership reviews.
*   **Tone & Voice:** Use a professional, objective, and analytical tone.
    *   *Voice:* Prefer passive voice for documenting system behaviors (e.g., *"Calculations are processed on the backend..."*). Use active voice when detailing student actions (e.g., *"The author developed a centralized schema..."*).
    *   *Pronouns:* Avoid first-person singular pronouns (*"I," "me," "my"*). Refer to yourself as *"the author"* or *"the intern"*.
*   **Grammar & Clarity:** Keep sentence structures direct. Avoid overly complex sentence clauses. Maintain an average sentence length of 15–25 words. Paragraphs should start with a clear topic sentence, followed by 3–5 supporting sentences.
*   **Originality:** Avoid generic, AI-like filler words (e.g., *"delve," "revolutionize," "testament," "game-changer"*). Ground all descriptions in the actual codebase implementation rather than high-level technical abstractions.

---

## 2. Markdown Standards

To ensure smooth conversion to PDF and DOCX formats, follow these Markdown patterns:

*   **Heading Hierarchy:** Maintain a strict nested hierarchy. Never skip heading levels.
    *   `# Chapter X – Title` (H1 for Chapter Cover)
    *   `## X.Y Section Title` (H2 for Main Sections)
    *   `### X.Y.Z Subsection Title` (H3 for Details)
*   **Separators:** Use a clean horizontal rule `---` before and after major H1 chapter headings.
*   **Lists:** 
    *   Surround lists with blank lines to satisfy markdownlint formatting.
    *   Use hyphens `-` for unordered lists.
    *   Use numbered formats `1.` for sequential procedures.
*   **Callouts:** Emphasize safety, architectural limits, and code standards using GitHub-style blockquote alerts:
    *   `> [!IMPORTANT]` for architectural rules and critical domain logic.
    *   `> [!WARNING]` for security rules and database constraints.
    *   `> [!TIP]` for optimization and execution strategies.
*   **Tables:** Use standard Markdown table syntax. Include headers, alignment rows, and ensure no HTML wrapping blocks are used inside tables, unless required for line breaks in PDF export.

---

## 3. Figure Standards

*   **Format & Naming:** All figures must be referenced in the text before appearing. The caption must be placed directly below the image.
*   **Alignment & Size:** Center-align all figures. Limit the maximum width to `80%` of page width to prevent print truncation.
*   **Figure Captions:** Format as `Figure X.Y - Descriptive Title` (e.g., `Figure 1.1 - Industrial Metallurgical Costing Drivers`).
*   **Asset Schema:** Every figure must document:
    1.  *Figure Number* and *Title*.
    2.  *Description* outlining the visual contents.
    3.  *Purpose* justifying why this graphic is included.
    4.  *Chapter Reference* linking it to the text block.

---

## 4. Table Standards

*   **Format & Naming:** Tables must have column boundaries aligned and use a clean markdown structure.
*   **Table Captions:** Place table titles directly above the table. Format as `Table X.Y - Descriptive Title`.
*   **Alignment:** Left-align textual data, center-align codes or statuses, and right-align numerical/financial values.
*   **Metadata:** Every table must include a preceding descriptive paragraph explaining the variables shown.

---

## 5. Diagram Standards

All diagrams must use native **Mermaid** markdown notation.

*   **Supported UML Types:**
    *   *Flowcharts* (`graph TD` or `graph LR`) for workflows and pipelines.
    *   *ER Diagrams* (`erDiagram`) for database schemas.
    *   *Sequence Diagrams* (`sequenceDiagram`) for API request/response cycles.
    *   *State Diagrams* (`stateDiagram-v2`) for grade transitions.
*   **Naming Convention:** Diagram captions should be formatted as `Diagram X.Y - System Interaction Name`.
*   **Placement Rules:** Place diagrams immediately after the text section describing the corresponding logic. Do not pile multiple diagrams together.

---

## 6. Screenshot Standards

*   **Resolution:** Capture screen assets at a standard `1920x1080` resolution. Crop out unnecessary browser chrome, desktop taskbars, and user profile badges.
*   **Highlights:** Use red or primary blue boxes to highlight specific UI components being discussed (e.g., the Save Snapshot button).
*   **File Naming:** Store under `JSW Internship Report/REPORT/images/screenshot_chapter_module.png`.
*   **Metadata:** Each screenshot must be accompanied by:
    *   *Figure Number* and *Module name*.
    *   *Description* of the current UI state.
    *   *Expected Output* showing verification checks.

---

## 7. Code Snippet Standards

*   **Language Labels:** Explicitly declare the programming language at the start of code fences (e.g., ````typescript`).
*   **Snippet Limitations:** Keep snippets under 35 lines. Show only the core logic block (e.g., a specific validation checker or decimal evaluation function) rather than the entire file. Use `// ...` to represent omitted sections.
*   **Standard Framework Patterns:**
    *   **React:** Demonstrate component declarations, Zustand store hooks, and TanStack query parameters.
    *   **TypeScript:** Show interfaces, type assertions, and API response typing.
    *   **Express:** Document route handling, auth validation middleware, and RBAC checks.
    *   **Prisma & SQL:** Highlight models, migration rules, and raw SQL transitions where required.
    *   **Docker:** Outline Dockerfile structures and service bindings in docker-compose.

---

## 8. API Documentation Standards

Every API route documented in the report must follow this template:

*   **Route:** `[METHOD] /api/v1/resource` (e.g., `POST /api/v1/calculations`)
*   **Purpose:** Detailed explanation of the endpoint's business logic.
*   **Authentication:** Specify role restrictions (e.g., `COSTING_DEPARTMENT` only) and JWT requirements.
*   **Request payload:** Markdown code block showing JSON schema.
*   **Response payload:** Sample of successful HTTP `200 OK` or `201 Created` responses.
*   **HTTP Error Handling:** List potential status codes (`400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `500 Internal Server Error`) and detail validation error messages.

---

## 9. Database Documentation Standards

*   **Schema Layout:** Every model description must define:
    *   Columns, data types (e.g., `Decimal`, `VarChar`), constraints (e.g., `NOT NULL`, `UNIQUE`), and relations.
*   **Relationships:** Clearly mark `1:1`, `1:N`, and `N:M` relations.
*   **Prisma Mapping:** Show how Prisma models relate to SQL schemas using `@relation` and `@@map` constructs.
*   **Migration Logging:** Document how migration changes were handled safely without data loss.

---

## 10. Chapter Standards

Each chapter must be self-contained and structure its content consistently:

1.  **Chapter Heading:** `# Chapter X – Title` surrounded by horizontal lines.
2.  **Chapter Introduction:** A brief introductory paragraph explaining what the chapter covers.
3.  **Core Content:** Detailed subsections containing tables, figures, diagrams, and code snippets.
4.  **Chapter Summary:** A paragraph summarizing the technical outcomes of the chapter.
5.  **Key Takeaways:** Bulleted list of critical learnings and implementation successes.
6.  **References:** Academic or technical citations specific to the chapter's subject matter.
7.  **Transition:** A concluding sentence pointing to the next chapter's topic.

---

## 11. IEEE Citation Standards

Follow the standard IEEE citation format for all report references:

*   **In-Text Citation:** Use square brackets (e.g., `[1]`, `[2]`).
*   **Reference List Format:**
    *   *Books:* Author, *Title*, Edition. Place of publication: Publisher, Year.
    *   *Official Documentation:* Developer/Organization, "Document Title," Version, Date. [Online]. Available: URL.
    *   *Web References:* Author/Website, "Article Title," Date. [Online]. Available: URL. [Accessed: Date].

---

## 12. Consistency Standards

Always use the official project nomenclature. Never use synonyms or shortened versions:

| Official Term | Prohibited Synonyms |
| :--- | :--- |
| **Metal Cost Management System (MCMS)** | Cost app, costing system, JSW Calculator |
| **Calculation Workspace** | Calc sheet, input page, cost workspace |
| **Grade Builder** | Grade page, composition screen, recipe manager |
| **Comparison Engine** | Compare tool, side-by-side table, comparison matrix |
| **Audit Logs** | Change history, tracking table, mutation logs |
| **Role-Based Access Control (RBAC)** | User permissions, system access layers |
| **Prisma ORM** | Prisma database framework, database helper |
| **PostgreSQL** | Postgres database, relational database engine |

---

## 13. Quality Checklist

Before finalizing any report updates, check for:

*   [ ] **Grammar and Syntax:** No spelling mistakes, formal technical English utilized throughout.
*   [ ] **Structure Hierarchy:** H1 -> H2 -> H3 increments are consistent; no heading levels are skipped.
*   [ ] **Technical Accuracy:** Code snippets and schemas exactly match the files in the repository.
*   [ ] **Callout Formatting:** All tips, warnings, and notes use proper Markdown alert syntax.
*   [ ] **Table and Figures:** All tables and figures are numbered correctly, contain clear titles, and have placeholders matching their indices.
*   [ ] **References:** All citations match their entries in the References section.

---

## 14. Final Acceptance Criteria

*   **Academic Quality:** Suitable for both corporate IT evaluation at JSW Steel and academic evaluation for Mumbai University.
*   **Format Integrity:** Clean Markdown syntax, converting cleanly to PDF and DOCX formats without rendering artifacts.
*   **Target Length:** The total report length should compile to approximately 90–120 pages including appendices.
