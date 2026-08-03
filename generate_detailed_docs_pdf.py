import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            self.saveState()
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748b"))
            self.drawString(54, 36, "Certificate Validator — Comprehensive File-by-File Technical Documentation")
            self.drawRightString(558, 36, f"Page 1 of {page_count}")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(54, 48, 558, 48)
            self.restoreState()
            return

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#1e293b"))
        self.drawString(54, 750, "Certificate Validator — Detailed File Documentation")
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, 742, 558, 742)
        
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 36, page_str)
        self.drawString(54, 36, "CONFIDENTIAL — SECURE BLOCKCHAIN-ANCHORED CERTIFICATE VALIDATOR")
        self.line(54, 48, 558, 48)
        self.restoreState()

def build_detailed_docs_pdf(filename="Certificate_Validator_Detailed_File_Documentation.pdf"):
    pdf_path = os.path.join(os.getcwd(), filename)
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10.5,
        leading=14.5,
        textColor=colors.HexColor('#475569'),
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor('#1e293b'),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155'),
        spaceAfter=6
    )

    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#1e293b')
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=table_cell,
        fontName='Helvetica-Bold',
        textColor=colors.HexColor('#0f172a')
    )

    story = []

    # Title & Header Banner
    story.append(Paragraph("Certificate Validator", title_style))
    story.append(Paragraph("Exhaustive File-by-File Technical Reference & API Contract Specification", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#0f172a"), spaceAfter=12))

    # Comprehensive File Registry Data
    files_data = [
        # --- ROOT & BACKEND CORE ---
        ("Root / System Configuration", [
            ("package.json", "Root Monorepo Manifest", "Defines workspaces (`backend`, `frontend`), root utility scripts, and dependency synchronization."),
            ("README.md", "System Documentation", "Comprehensive installation guide, system architecture breakdown, API endpoints list, and security specification.")
        ]),
        ("Backend Entry & Configuration (backend/ & backend/config/)", [
            ("backend/server.js", "Express Server Entry", "Initializes Express app, configures CORS, JSON body parsers, static file serving for `/uploads`, and registers API route modules."),
            ("backend/config/db.js", "SQLite Database Setup", "Initializes SQLite connection using `better-sqlite3`. Executes table creation DDL statements for `users`, `universities`, `certificates`, `revoked_certificates`, `blockchain_anchors`, `disclosure_proofs`, and `verification_events`.")
        ]),
        ("Backend Controllers (backend/controllers/)", [
            ("authController.js", "Authentication Handler", "Manages user/university registration, password hashing (bcrypt), login JWT generation, profile fetching, and role authorization."),
            ("certificateController.js", "Issuance & Revocation", "Handles single certificate issuance, Excel bulk issuance (`bulkUploadCertificates`), category normalization, 3-way credential verification, RSA signing, and cryptographic revocation (`revokeCertificate`)."),
            ("verificationController.js", "Verification Engine", "Processes online verification requests (`verifyCertificate`), checks replay protection nonces/timestamps, verifies RSA-2048 signatures, checks revocation status, anchors blockchain proofs, and logs verification events."),
            ("disclosureController.js", "Selective Disclosure", "Generates and verifies zero-knowledge predicate proofs (`createPredicateProof`, `verifyPredicateProof`) allowing students to prove criteria (e.g. CGPA >= 8.0) without revealing underlying data."),
            ("passportController.js", "Skill Passport Engine", "Generates shareable public skill passport URLs (`getPublicSkillPassport`), aggregates student credential portfolios, and constructs verified skill badges."),
            ("auditController.js", "Immutable Audit Feed", "Queries system audit logs (`getAuditLogs`), filtered by module, user ID, status, or date range for regulatory compliance."),
            ("analyticsController.js", "Analytics Aggregator", "Computes metrics (`getUniversityAnalytics`, `getStudentAnalytics`, `getVerificationAnalytics`) including issuance volume, monthly trends, and verification pass/fail rates."),
            ("chatController.js", "AI Chatbot Assistant", "Connects to Google Gemini API (`askAIChatbot`) to answer user queries about certificate verification, validation rules, and platform usage.")
        ]),
        ("Backend Middleware & Models (backend/middleware/ & backend/models/)", [
            ("authMiddleware.js", "JWT Auth Guard", "Intercepts HTTP requests, validates `Authorization: Bearer <token>`, decodes user identity, and enforces role authorization."),
            ("userModel.js", "User Data Model", "Parameterized SQL model for querying, creating, and updating user credentials in SQLite `users` table."),
            ("certificateModel.js", "Certificate Data Model", "Data access methods for inserting certificates, querying by ID/regNo, fetching university certificate lists, and marking revocation status."),
            ("verificationModel.js", "Verification Event Model", "Data access methods for inserting verification activity events and calculating monthly verification counts per university."),
            ("walletModel.js", "Skill Wallet Data Model", "Model for querying student certificate collections, portfolio links, learning goals, and achievement milestones.")
        ]),
        ("Backend Routes (backend/routes/)", [
            ("authRoutes.js", "Auth API Routes", "Express routes for `/api/auth/register`, `/api/auth/login`, and `/api/auth/me`."),
            ("certificateRoutes.js", "Certificate API Routes", "Routes for `/api/certificates/upload`, `/api/certificates/bulk`, `/api/certificates/revoke`, and university/student certificate fetching."),
            ("verificationRoutes.js", "Verifier API Routes", "Routes for `/api/verify`, `/api/verifications`, and `/api/public-key/:issuer_id`."),
            ("disclosureRoutes.js", "Selective Disclosure Routes", "Routes for `/api/disclosure/proof` and `/api/disclosure/verify`."),
            ("passportRoutes.js", "Skill Passport Routes", "Routes for `/api/passport/me` and `/api/passport/public/:passport_id`."),
            ("auditRoutes.js", "Audit Log Routes", "Route for `/api/audit/logs` with security filtering."),
            ("analyticsRoutes.js", "Analytics API Routes", "Routes for `/api/analytics/university`, `/api/analytics/student`, and `/api/analytics/verification`."),
            ("chatRoutes.js", "AI Assistant Routes", "Route for `/api/chat` connecting to Gemini service.")
        ]),
        ("Backend Services & Utils (backend/services/ & backend/utils/)", [
            ("keyService.js", "RSA Key Management", "Generates and retrieves 2048-bit RSA key pairs (`generateKeyPair`) for university issuers."),
            ("qrService.js", "QR Synthesis Service", "Generates high-density PNG QR code images containing JSON payload, hash, signature, and replay session tokens."),
            ("pdfService.js", "Server PDF Generator", "Compiles server-side downloadable PDF certificates using PDFKit or HTML layout."),
            ("walletService.js", "Wallet Aggregator", "Aggregates student certificates into structured digital skill badges and timeline events."),
            ("crypto.js", "Cryptographic Utility Core", "Provides SHA-256 hash generation (`generateHash`), RSA-2048 signature verification (`verifySignature`), and replay attack session token validation (`validateReplayProtection`)."),
            ("blockchain.js", "Blockchain Anchor Mock", "Simulates Merkle-tree blockchain anchoring (`anchorOnBlockchain`, `verifyOnBlockchain`) with transaction hashes and block numbers."),
            ("auditLogger.js", "Audit Logger", "Writes structured security event records to SQLite audit table for all sensitive actions.")
        ]),
        ("Backend Tests (backend/tests/)", [
            ("crypto.test.js", "Backend Test Suite", "13 unit tests covering RSA keygen, SHA-256 hashing, RSA signatures, tampered data detection, replay protection nonces, revocation anchoring, and selective disclosure.")
        ]),

        # --- FRONTEND CORE ---
        ("Frontend Application Core (frontend/src/)", [
            ("main.jsx", "React DOM Mount", "Mounts `App.jsx` into HTML container and registers PWA service worker."),
            ("App.jsx", "Router & Transition Provider", "Configures React Router v7 routes, opacity page transition animations, and header state."),
            ("index.css", "Global Design System", "Defines CSS design tokens, typography, glassmorphism card styles, button variants, and `.error-msg` banners."),
            ("vite.config.js", "Vite Bundler Config", "Vite build settings, React plugin, and Vite PWA plugin configuration for offline caching.")
        ]),
        ("Frontend API Layer (frontend/src/api/)", [
            ("client.js", "Axios Base Client", "Configures Axios instance with `baseURL`, authorization header interceptor, and methods for cert issuance, verification, public keys, and revocation."),
            ("analytics.js", "Analytics API Client", "API client methods for fetching university, student, and verification analytics data."),
            ("audit.js", "Audit API Client", "API client methods for fetching audit logs with search parameters."),
            ("blockchain.js", "Blockchain API Client", "API client methods for inspecting blockchain transaction details."),
            ("chat.js", "AI Chat API Client", "API client for sending prompts to backend Gemini AI chatbot endpoint."),
            ("disclosure.js", "Disclosure API Client", "API client for requesting and verifying selective disclosure predicate proofs."),
            ("passport.js", "Passport API Client", "API client for fetching digital skill passport data."),
            ("templateApi.js", "Template API Client", "API client for fetching template customization settings."),
            ("wallet.js", "Wallet API Client", "API client for fetching student wallet certificate items and portfolio links.")
        ]),
        ("Frontend Pages (frontend/src/pages/)", [
            ("Home.jsx", "Landing Page", "Public hero landing page showcasing system features, live stats, and portal links."),
            ("UniversityDashboard.jsx", "University Portal", "University dashboard for single issuance, Excel bulk issuance with Drag & Drop, issued cert list with real-time search, and PDF download modal."),
            ("UniversityLogin.jsx / UniversityRegister.jsx", "University Auth Pages", "Login and registration forms for university issuer accounts with issuer code configuration."),
            ("UniversityAnalytics.jsx", "University Analytics", "Visual charts and metrics for university issuance performance."),
            ("Verifier.jsx", "Certificate Verifier Portal", "Multi-mode verifier supporting QR camera scan, drag & drop file upload, cert ID search, offline mode, and batch verification."),
            ("VerificationAnalytics.jsx", "Verifier Analytics", "Analytics on verification trends, pass/fail ratios, and geographic verifications."),
            ("StudentDashboard.jsx", "Student Dashboard", "Student portal displaying issued credentials, QR download, and wallet access."),
            ("StudentLogin.jsx / StudentRegister.jsx", "Student Auth Pages", "Login and registration forms for student accounts."),
            ("StudentAnalytics.jsx", "Student Skill Analytics", "Analytics visualization of student skills, course distribution, and verification counts."),
            ("WalletDashboard.jsx", "Digital Skill Wallet", "Interactive student wallet featuring list/grid views, search filter, cert detail pane, PDF export, and selective disclosure modal."),
            ("DigitalSkillPassport.jsx / PublicSkillPassport.jsx", "Skill Passport Pages", "Shareable digital skill passport views displaying verified credentials and QR share link."),
            ("PublicDisclosureView.jsx", "Public Disclosure View", "Public zero-knowledge verification view for verifying specific predicate proofs."),
            ("BlockchainExplorer.jsx", "Blockchain Explorer", "Interactive blockchain transaction explorer for inspecting certificate Merkle proofs and block details."),
            ("AuditLog.jsx", "Audit Log Viewer", "System audit log viewer with search, filtering, and timestamp inspection."),
            ("TemplateManager.jsx", "Template Manager", "Preview page displaying all 9 certificate category templates."),
            ("Register.jsx", "Role Selection Register", "Hub page directing users to University or Student registration.")
        ]),
        ("Frontend Certificate Templates (frontend/src/components/templates/)", [
            ("TemplateSelector.jsx", "Template Category Router", "Dynamic component router that normalizes category strings and renders the corresponding template with precise dimensions."),
            ("CategoryCertificateTemplate.jsx", "Template Wrapper", "High-resolution container wrapping template rendering for Canvas export and PDF generation."),
            ("GraduationTemplate.jsx", "Degree / Graduation Template", "Portrait parchment layout featuring gold seals, traditional borders, and academic typography."),
            ("CourseCompletionTemplate.jsx", "Course Completion Template", "Landscape navy/teal layout designed for online and academic courses."),
            ("InternshipTemplate.jsx", "Internship Certificate Template", "Modern professional landscape layout for corporate internship completion."),
            ("ProjectTemplate.jsx", "Project Completion Template", "Clean technical layout for project and capstone completion."),
            ("MeritTemplate.jsx", "Merit Certificate Template", "Elegant gold/crimson layout for academic merit recognition."),
            ("DistinctionTemplate.jsx", "Distinction Certificate Template", "High-contrast luxury layout for graduating with Distinction."),
            ("AcademicExcellenceTemplate.jsx", "Academic Excellence Template", "Formal royal blue layout for top academic standing."),
            ("BonafideTemplate.jsx", "Bonafide Certificate Template", "Official institutional layout for student bonafide certification."),
            ("ParticipationTemplate.jsx", "Participation Certificate Template", "Modern clean layout for hackathons, workshops, and event participation.")
        ]),
        ("Frontend Wallet & AI Components (frontend/src/components/)", [
            ("WalletCertCard.jsx", "Wallet Item Card", "Visual certificate card component in student wallet with status badges and quick actions."),
            ("WalletDetailPane.jsx", "Wallet Detail Pane", "Expanded detail pane showing certificate metadata, verification status, and disclosure controls."),
            ("WalletIndexList.jsx", "Wallet Index List", "Compact tabular view of wallet certificates for quick browsing."),
            ("CertDetailModal.jsx", "Cert Detail Modal", "Modal view showing high-resolution certificate rendering and PDF download button."),
            ("AchievementTimeline.jsx", "Achievement Timeline", "Chronological timeline visualization of student academic milestones."),
            ("LearningGoalTracker.jsx", "Goal Tracker", "Interactive goal tracking widget for ongoing student courses and certifications."),
            ("PortfolioLinksCard.jsx", "Portfolio Links Card", "Widget for managing student GitHub, LinkedIn, and portfolio links."),
            ("FloatingAIButton.jsx", "Floating AI Trigger", "Floating AI button trigger rendered across application pages."),
            ("ChatWindow.jsx", "AI Chat Window", "Interactive chat interface connecting to backend Gemini AI model."),
            ("ChatBubble.jsx", "Chat Message Bubble", "Formatted chat message bubble supporting markdown and code snippets."),
            ("SuggestedQuestions.jsx", "AI Suggested Prompts", "Clickable sample questions for quick AI assistant queries."),
            ("TypingIndicator.jsx", "AI Typing Indicator", "Animated typing indicator shown while awaiting AI response.")
        ]),
        ("Frontend Utilities & Hooks (frontend/src/utils/ & frontend/src/hooks/)", [
            ("certificateCategory.js", "Category Source of Truth", "Master category definitions, detail requirement sets, restricted categories, and `normalizeCategoryName()` helper."),
            ("certificatePdf.js", "Browser PDF Generator", "Client-side PDF generator compiling high-resolution certificate PDFs using HTML5 Canvas rendering."),
            ("excelParser.js", "Excel Bulk Parser", "Parses uploaded Excel files using SheetJS, enforces mandatory columns, maps aliases, and normalizes categories."),
            ("keyCache.js", "Public Key Local Cache", "IndexedDB / localStorage cache for university public keys enabling offline verification."),
            ("offlineCrypto.js", "Offline Verification Engine", "Browser-side RSA-2048 signature verification and SHA-256 hash checking for offline mode."),
            ("qrDecoder.js", "QR Image Decoder", "Extracts and parses embedded QR code JSON payload from uploaded PDF/Image files."),
            ("revocationCache.js", "Revocation Local Sync", "Caches synced revocation lists in browser storage for offline revocation checks."),
            ("walletStore.js", "Wallet Local State", "Local state manager for student wallet items and preferences."),
            ("useAIProvider.js", "AI State Hook", "Custom hook managing AI chat conversation history and loading state."),
            ("useHeaderHeight.js", "Header Offset Hook", "Custom hook dynamically measuring navigation bar height for layout spacing."),
            ("useReveal.js", "Scroll Reveal Hook", "Custom hook triggering element entrance animations upon scroll.")
        ])
    ]

    for section_title, files in files_data:
        story.append(Paragraph(section_title, h1_style))
        t_data = [
            [Paragraph("File Name & Path", table_cell_bold), Paragraph("Role / Title", table_cell_bold), Paragraph("Detailed Description & Key Logic", table_cell_bold)]
        ]
        for f_path, f_role, f_desc in files:
            t_data.append([
                Paragraph(f"<code>{f_path}</code>", table_cell),
                Paragraph(f"<b>{f_role}</b>", table_cell),
                Paragraph(f_desc, table_cell)
            ])
        
        t_sec = Table(t_data, colWidths=[130, 120, 254])
        t_sec.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(t_sec)
        story.append(Spacer(1, 10))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated {pdf_path}")

if __name__ == '__main__':
    build_detailed_docs_pdf()
