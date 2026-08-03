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
            # Minimal header/footer on title page
            self.saveState()
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748b"))
            self.drawString(54, 36, "Certificate Validator System — Architectural & Project Structure Documentation")
            self.drawRightString(558, 36, f"Page 1 of {page_count}")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(54, 48, 558, 48)
            self.restoreState()
            return

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#1e293b"))
        self.drawString(54, 750, "Certificate Validator — Project Structure Document")
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

def build_structure_pdf(filename="Certificate_Validator_Project_Structure.pdf"):
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
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#475569'),
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#1e293b'),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#334155'),
        spaceAfter=8
    )

    code_style = ParagraphStyle(
        'CodeBlock',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#0f172a')
    )

    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
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
    story.append(Paragraph("Complete Project Structure & Technical Architecture Specification Document", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#0f172a"), spaceAfter=15))

    # Executive Overview
    story.append(Paragraph("1. Executive Overview & System Architecture", h1_style))
    overview_text = (
        "The <b>Certificate Validator</b> system is a state-of-the-art, end-to-end cryptographic certificate "
        "issuance, management, verification, and decentralized privacy ecosystem. Built using Node.js/Express, SQLite/Better-SQLite3, "
        "and React (Vite, Framer Motion, HTML5 Canvas), it leverages RSA-2048 digital signatures, SHA-256 cryptographic hashing, "
        "Replay Attack Session Protection, Merkle-tree Blockchain Anchoring, Zero-Knowledge Selective Disclosure Predicates, "
        "and an offline Progressive Web Application (PWA) architecture."
    )
    story.append(Paragraph(overview_text, body_style))

    # Technology Stack Summary Table
    story.append(Paragraph("Core Technology Stack", h2_style))
    tech_data = [
        [Paragraph("Layer", table_cell_bold), Paragraph("Technologies & Libraries Used", table_cell_bold), Paragraph("Primary Architectural Role", table_cell_bold)],
        [Paragraph("Frontend Core", table_cell), Paragraph("React 18, Vite 8, React Router v7, Lucide Icons", table_cell), Paragraph("Responsive SPA client with dynamic route switching and PWA caching")],
        [Paragraph("UI & Styling", table_cell), Paragraph("Vanilla CSS, Glassmorphism Design Tokens, Framer Motion", table_cell), Paragraph("Ultra-premium aesthetic design system with micro-animations & layout fades")],
        [Paragraph("Backend Core", table_cell), Paragraph("Node.js, Express.js, Better-SQLite3, CORS, Multer", table_cell), Paragraph("RESTful API server, SQLite database access, file uploads, & auth middleware")],
        [Paragraph("Cryptography", table_cell), Paragraph("Node.js Crypto (RSA-2048, SHA-256), Web Crypto API", table_cell), Paragraph("Asymmetric signatures, tamper checking, and browser-side offline verification")],
        [Paragraph("Templating", table_cell), Paragraph("HTML5 Canvas, Lucide-React, ReportLab Python PDF Engine", table_cell), Paragraph("Resolution-independent certificate rendering, PNG export, and PDF generation")],
        [Paragraph("AI Subsystem", table_cell), Paragraph("Gemini API (Google AI), Custom Floating AI Assistant", table_cell), Paragraph("Interactive platform assistant, verification guidance, & natural language QA")],
        [Paragraph("Excel / Bulk", table_cell), Paragraph("XLSX (SheetJS), Custom Alias Mapper & Category Normalizer", table_cell), Paragraph("Mandatory column assertion, row validation, and multi-cert batch generation")]
    ]
    t_tech = Table(tech_data, colWidths=[110, 210, 184])
    t_tech.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_tech)
    story.append(Spacer(1, 14))

    # Visual Tree Diagram
    story.append(Paragraph("2. High-Level Project Directory Hierarchy", h1_style))
    tree_str = """d:\\Certificate_Validator\\
├── backend\\                       # Node.js Express REST Backend & Database Layer
│   ├── config\\                   # SQLite Database Connection & Table Schema Setup
│   ├── controllers\\              # API Controllers (Auth, Certificate, Verifier, Analytics, etc.)
│   ├── middleware\\               # JWT Auth Guard & User Role Verification Middlewares
│   ├── models\\                   # Data Access Models (User, Certificate, Verification, Wallet)
│   ├── routes\\                   # Express API Route Registrations
│   ├── services\\                 # Core Business Logic (Key Gen, QR Generator, PDF Export)
│   ├── tests\\                    # Automated Backend Test Suite (Crypto, Replay, Revocation)
│   ├── uploads\\                  # Server-side Generated QR Code Images & Cert Artifacts
│   ├── utils\\                    # Cryptographic Engine, Audit Logger, Blockchain Anchor
│   ├── database.sqlite           # SQLite Relational Database Storage
│   ├── package.json              # Backend Dependencies & Scripts Manifest
│   └── server.js                 # Express Application Server Entry Point & Middlewares
│
├── frontend\\                      # React Vite Single Page Application & PWA Client
│   ├── public\\                   # PWA Manifest, Web App Icons, SVG Graphics
│   ├── src\\                      # React Application Source Code
│   │   ├── api\\                  # Axios API Clients for Backend Communication
│   │   ├── components\\           # UI Components, Layouts, Visual Decor, Templates
│   │   │   ├── AIChat\\           # Floating AI Chatbot Assistant & Modal Components
│   │   │   ├── decorations\\      # Background Glassmorphism & Abstract Math Shapes
│   │   │   ├── motion\\           # Framer Motion Wrappers (CountUp, Skeleton, Scroll)
│   │   │   ├── templates\\        # 9 High-Res Certificate Templates & TemplateSelector
│   │   │   └── wallet\\           # Digital Skill Wallet Cards, Timeline, & Detail Panes
│   │   ├── hooks\\                # Custom React Hooks (Header Height, AI Provider, Scroll)
│   │   ├── pages\\                # 19 Page Components (Dashboard, Verifier, Wallet, Analytics)
│   │   ├── styles\\               # Wallet Specific CSS & Theme Extensions
│   │   ├── utils\\                # Excel Parser, PDF Generator, Offline Crypto, Key Cache
│   │   ├── App.jsx               # Application Navigation Router & Layout Provider
│   │   ├── index.css             # Global CSS Design Tokens, Glass Effects, Animations
│   │   └── main.jsx              # React DOM Mount & Service Worker Registration
│   ├── index.html                # Root HTML Document & Font Imports
│   ├── package.json              # Frontend Dependencies & Build Configuration
│   └── vite.config.js            # Vite Bundler & PWA Plugin Configuration
│
├── docs\\                          # Platform Documentation Assets & Template Previews
│   ├── screenshots\\              # UI Screenshots & Architectural Diagrams
│   └── templates\\                # Reference High-Res Template Image Assets (01 to 09)
│
├── package.json                  # Root Monorepo Management Manifest
└── README.md                     # Complete Project Documentation & Installation Guide"""

    tree_p = Paragraph(f"<font face='Courier' size='7'>{tree_str.replace(' ', '&nbsp;').replace('\\n', '<br/>')}</font>", ParagraphStyle('Tree', parent=styles['Normal'], spaceAfter=15, leading=9.5))
    
    # Wrap tree box
    t_tree = Table([[tree_p]], colWidths=[504])
    t_tree.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BORDER', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_tree)
    story.append(Spacer(1, 14))

    # Comprehensive Folder Breakdown
    story.append(Paragraph("3. Detailed Folder Breakdown & Component Architecture", h1_style))

    folder_descriptions = [
        ("backend/config/", "Database Configuration Layer", "Contains SQLite database initialization (`db.js`). Automates table creation for users, universities, certificates, revoked certificates, blockchain anchors, selective disclosure proofs, and verification events."),
        ("backend/controllers/", "API Request Controllers", "Houses request handlers for auth (`authController.js`), single & bulk certificate issuance (`certificateController.js`), online verification (`verificationController.js`), selective disclosure (`disclosureController.js`), skill passports (`passportController.js`), audit logs (`auditController.js`), analytics (`analyticsController.js`), and AI chat assistant (`chatController.js`)."),
        ("backend/middleware/", "Security & Authorization Guards", "Contains JWT authentication middleware (`authMiddleware.js`) that verifies authorization tokens, decodes user payload, and enforces role-based access control (UNIVERSITY, STUDENT, VERIFIER, ADMIN)."),
        ("backend/models/", "Data Access Layer", "Direct SQLite database interface models (`userModel.js`, `certificateModel.js`, `verificationModel.js`, `walletModel.js`) providing parameterized SQL queries for atomic transactions and data integrity."),
        ("backend/routes/", "Express API Routes", "Maps REST HTTP endpoints (`authRoutes.js`, `certificateRoutes.js`, `verificationRoutes.js`, `disclosureRoutes.js`, `passportRoutes.js`, `auditRoutes.js`, `analyticsRoutes.js`, `chatRoutes.js`) to controller handlers."),
        ("backend/services/", "Core Business Services", "Encapsulates cryptographic key generation (`keyService.js`), high-density QR code image synthesis (`qrService.js`), server-side PDF compilation (`pdfService.js`), and wallet data processing (`walletService.js`)."),
        ("backend/tests/", "Automated Backend Test Suite", "Node.js test suite (`crypto.test.js`) covering RSA-2048 keypair generation, SHA-256 hash checks, signature verification, replay protection nonces, revocation anchoring, and selective disclosure predicates."),
        ("backend/utils/", "Cryptographic & Audit Utilities", "Contains core crypto utilities (`crypto.js`) for RSA/SHA256, blockchain anchoring simulation (`blockchain.js`), and immutable audit trail logging (`auditLogger.js`)."),
        ("frontend/src/api/", "Axios Network API Clients", "Modular API modules (`client.js`, `analytics.js`, `audit.js`, `blockchain.js`, `chat.js`, `disclosure.js`, `passport.js`, `templateApi.js`, `wallet.js`) providing seamless backend REST communication with automatic bearer token injection."),
        ("frontend/src/components/templates/", "High-Resolution Certificate Templates", "9 individual visual certificate templates (`GraduationTemplate`, `CourseCompletionTemplate`, `InternshipTemplate`, `ProjectTemplate`, `MeritTemplate`, `DistinctionTemplate`, `AcademicExcellenceTemplate`, `BonafideTemplate`, `ParticipationTemplate`) and dynamic category router `TemplateSelector.jsx`."),
        ("frontend/src/components/wallet/", "Digital Skill Wallet Components", "Components for student wallet interface (`WalletCertCard`, `WalletDetailPane`, `WalletIndexList`, `CertDetailModal`, `AchievementTimeline`, `LearningGoalTracker`, `PortfolioLinksCard`)."),
        ("frontend/src/components/AIChat/", "Floating AI Assistant Components", "Interactive AI Chatbot assistant widget (`FloatingAIButton`, `ChatWindow`, `ChatBubble`, `SuggestedQuestions`, `TypingIndicator`) connecting to Gemini API."),
        ("frontend/src/pages/", "Application Page Views", "19 page components handling University Dashboard (`UniversityDashboard.jsx`), Certificate Verifier (`Verifier.jsx`), Student Wallet (`WalletDashboard.jsx`), Skill Passport (`DigitalSkillPassport.jsx`), Analytics, Audit Logs, and Auth."),
        ("frontend/src/utils/", "Client Utilities & Off-line Engines", "Client-side Excel parsing (`excelParser.js`), category normalization (`certificateCategory.js`), browser PDF generator (`certificatePdf.js`), QR decoder (`qrDecoder.js`), offline RSA crypto (`offlineCrypto.js`), and revocation caching (`revocationCache.js`).")
    ]

    folder_table_data = [
        [Paragraph("Folder Path", table_cell_bold), Paragraph("Module Name", table_cell_bold), Paragraph("Functional Description & Architectural Role", table_cell_bold)]
    ]
    for path, name, desc in folder_descriptions:
        folder_table_data.append([
            Paragraph(f"<code>{path}</code>", table_cell),
            Paragraph(f"<b>{name}</b>", table_cell),
            Paragraph(desc, table_cell)
        ])

    t_folders = Table(folder_table_data, colWidths=[120, 130, 254])
    t_folders.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_folders)
    story.append(Spacer(1, 14))

    # Summary Statistics
    story.append(Paragraph("4. Repository Summary Metrics", h1_style))
    summary_data = [
        [Paragraph("Metric Description", table_cell_bold), Paragraph("Value / Count", table_cell_bold)],
        [Paragraph("Total Backend Core Source Files", table_cell), Paragraph("28 Files", table_cell)],
        [Paragraph("Total Frontend Core Components & Pages", table_cell), Paragraph("54 Component & Page Files", table_cell)],
        [Paragraph("Certificate Visual Templates Supported", table_cell), Paragraph("9 Category Templates (Vertical & Horizontal)", table_cell)],
        [Paragraph("Automated Backend Unit Tests", table_cell), Paragraph("13 Test Suites (100% Pass Rate)", table_cell)],
        [Paragraph("Cryptographic Algorithms Enforced", table_cell), Paragraph("RSA-2048 PKCS#1 v1.5, SHA-256, Merkle Tree", table_cell)],
        [Paragraph("Database Schema Tables", table_cell), Paragraph("8 Relational Tables with Foreign Key Constraints", table_cell)]
    ]
    t_sum = Table(summary_data, colWidths=[250, 254])
    t_sum.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_sum)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated {pdf_path}")

if __name__ == '__main__':
    build_structure_pdf()
