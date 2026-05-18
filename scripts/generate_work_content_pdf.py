"""
Generate /work page content specification PDF.

Produces a section-by-section content map for the TGlobal /work page
redesign — usable as a single shareable artifact for boss approval
before any design or code work begins.

Output: docs/work-content-spec.pdf (relative to project root)

Brand alignment:
  - Brand purple #4B28FF for accents (mirrors --color-primary)
  - Accent violet #BD70F6 for secondary accents
  - Near-black ink #0E0A1E for body text
  - No emojis (brand rule)
  - No Unicode subscript/superscript (reportlab built-in fonts lack these glyphs)
"""

from __future__ import annotations

import os
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

# ─── Brand tokens ────────────────────────────────────────────────────
INK = colors.HexColor("#0E0A1E")
INK_SOFT = colors.HexColor("#1A1233")
MUTED = colors.HexColor("#595959")
TERTIARY = colors.HexColor("#6E6E6E")
BORDER = colors.HexColor("#E1E2E6")
SURFACE = colors.HexColor("#F6F6F6")
PAPER_ALT = colors.HexColor("#F4EEF9")
SOFT_LAVENDER = colors.HexColor("#E7DFFD")
PRIMARY = colors.HexColor("#4B28FF")
ACCENT_VIOLET = colors.HexColor("#BD70F6")
ACCENT_WARM = colors.HexColor("#FC5038")
ACCENT_GREEN = colors.HexColor("#00A656")
WHITE = colors.HexColor("#FFFFFF")

# ─── Styles ──────────────────────────────────────────────────────────
base_styles = getSampleStyleSheet()

title_xl = ParagraphStyle(
    "TitleXL",
    parent=base_styles["Title"],
    fontName="Helvetica-Bold",
    fontSize=36,
    leading=42,
    textColor=INK,
    spaceAfter=8,
    alignment=TA_LEFT,
)

title_sub = ParagraphStyle(
    "TitleSub",
    parent=base_styles["Normal"],
    fontName="Helvetica",
    fontSize=13,
    leading=18,
    textColor=MUTED,
    spaceAfter=24,
    alignment=TA_LEFT,
)

h1 = ParagraphStyle(
    "H1",
    parent=base_styles["Heading1"],
    fontName="Helvetica-Bold",
    fontSize=24,
    leading=30,
    textColor=INK,
    spaceBefore=18,
    spaceAfter=10,
)

h2 = ParagraphStyle(
    "H2",
    parent=base_styles["Heading2"],
    fontName="Helvetica-Bold",
    fontSize=16,
    leading=22,
    textColor=INK,
    spaceBefore=14,
    spaceAfter=6,
)

h3 = ParagraphStyle(
    "H3",
    parent=base_styles["Heading3"],
    fontName="Helvetica-Bold",
    fontSize=12,
    leading=16,
    textColor=PRIMARY,
    spaceBefore=10,
    spaceAfter=4,
)

eyebrow = ParagraphStyle(
    "Eyebrow",
    parent=base_styles["Normal"],
    fontName="Courier-Bold",
    fontSize=9,
    leading=12,
    textColor=PRIMARY,
    spaceBefore=4,
    spaceAfter=2,
)

body = ParagraphStyle(
    "Body",
    parent=base_styles["Normal"],
    fontName="Helvetica",
    fontSize=10.5,
    leading=15,
    textColor=INK,
    spaceAfter=6,
)

body_muted = ParagraphStyle(
    "BodyMuted",
    parent=body,
    textColor=MUTED,
    spaceAfter=4,
)

mono = ParagraphStyle(
    "Mono",
    parent=base_styles["Normal"],
    fontName="Courier",
    fontSize=9,
    leading=13,
    textColor=INK,
    spaceAfter=4,
)

callout = ParagraphStyle(
    "Callout",
    parent=body,
    backColor=PAPER_ALT,
    borderColor=ACCENT_VIOLET,
    borderWidth=0,
    borderPadding=10,
    leftIndent=0,
    rightIndent=0,
    spaceBefore=6,
    spaceAfter=10,
)

# ─── Content blocks ──────────────────────────────────────────────────


def hr(width_mm: float = 170, color=BORDER) -> Table:
    """A thin horizontal divider line as a one-row table."""
    t = Table([[""]], colWidths=[width_mm * mm], rowHeights=[0.6])
    t.setStyle(
        TableStyle(
            [
                ("LINEABOVE", (0, 0), (-1, -1), 0.6, color),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    return t


def field_table(rows: list[tuple[str, str]]) -> Table:
    """Two-column key/value table for project fields."""
    data = [[Paragraph(k, body_muted), Paragraph(v, body)] for k, v in rows]
    t = Table(data, colWidths=[45 * mm, 125 * mm])
    t.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LINEBELOW", (0, 0), (-1, -2), 0.4, BORDER),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    return t


def comparison_table(rows: list[tuple[str, str]]) -> Table:
    """Two-column 'AI-generic vs Confident' comparison."""
    header = [
        Paragraph("<b>AI-generic (avoid)</b>", body),
        Paragraph("<b>Confident, restrained (use)</b>", body),
    ]
    data = [header] + [
        [Paragraph(bad, body_muted), Paragraph(good, body)] for bad, good in rows
    ]
    t = Table(data, colWidths=[85 * mm, 85 * mm])
    t.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("BACKGROUND", (0, 0), (-1, 0), SURFACE),
                ("LINEBELOW", (0, 0), (-1, 0), 0.6, BORDER),
                ("LINEBELOW", (0, 1), (-1, -2), 0.3, BORDER),
                ("LINEAFTER", (0, 0), (0, -1), 0.3, BORDER),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    return t


def project_card(
    index: str,
    name: str,
    fields: list[tuple[str, str]],
    *,
    is_featured: bool = False,
) -> list:
    """Render a project card section. Returns a list of flowables."""
    color_band = PRIMARY if is_featured else ACCENT_VIOLET
    badge = (
        f'<font face="Courier-Bold" color="#FFFFFF">{index}</font>'
        if is_featured
        else f'<font face="Courier-Bold" color="{color_band.hexval()[2:].rjust(6, "0")}">{index}</font>'
    )

    badge_cell = Table(
        [[Paragraph(f"&nbsp;{index}&nbsp;", ParagraphStyle(
            "Badge",
            parent=mono,
            fontName="Courier-Bold",
            textColor=WHITE if is_featured else PRIMARY,
            fontSize=8,
            alignment=TA_CENTER,
        ))]],
        colWidths=[18 * mm],
        rowHeights=[6 * mm],
    )
    badge_cell.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), PRIMARY if is_featured else SOFT_LAVENDER),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )

    header = Table(
        [[badge_cell, Paragraph(f"<b>{name}</b>", h2)]],
        colWidths=[22 * mm, 148 * mm],
    )
    header.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )

    return [
        header,
        Spacer(1, 4),
        field_table(fields),
        Spacer(1, 12),
    ]


def section_header(num: str, title: str) -> list:
    """Section header with mono number + bold title."""
    return [
        Spacer(1, 6),
        Paragraph(f"SECTION {num}", eyebrow),
        Paragraph(title, h1),
        hr(),
        Spacer(1, 6),
    ]


# ─── Document build ──────────────────────────────────────────────────


def build_pdf(output_path: Path) -> None:
    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=18 * mm,
        title="/work — Content Specification",
        author="TGlobal",
        subject="Section-by-section content map for the /work page redesign",
    )

    story: list = []

    # ─── Cover ──────────────────────────────────────────────────────
    story.append(Paragraph("TGLOBAL", eyebrow))
    story.append(Spacer(1, 8))
    story.append(Paragraph("/work", title_xl))
    story.append(Paragraph(
        "Content specification &mdash; section by section",
        title_sub,
    ))
    story.append(hr())
    story.append(Spacer(1, 14))

    story.append(Paragraph(
        "<b>What this is.</b> A locked content map for the new /work page. "
        "Every line of copy on the page is in this document. Each section "
        "below covers what appears on screen, in what order, with the "
        "exact words. Design and code work follow this artifact &mdash; "
        "this is the single source of truth boss can approve before any "
        "pixel moves.",
        body,
    ))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "<b>Scope.</b> 8 client projects across 6 industries and 3 continents. "
        "One featured marquee card, seven grid cards, plus the hero, industry "
        "spread, metrics, all-clients strip, and closing CTA.",
        body,
    ))
    story.append(Spacer(1, 14))

    # TOC
    toc_rows = [
        ("01", "Page structure &amp; visual rhythm"),
        ("02", "Hero"),
        ("03", "Industry spread strip"),
        ("04", "Featured project &mdash; MedCollect"),
        ("05", "Project grid &mdash; 7 cards"),
        ("06", "Metrics strip"),
        ("07", "All clients"),
        ("08", "Closing CTA"),
        ("09", "Copy rules &mdash; anti-generic"),
        ("10", "Design tokens reference"),
    ]
    toc_data = [
        [Paragraph(f"<font face='Courier-Bold' color='#4B28FF'>{n}</font>", body),
         Paragraph(label, body)]
        for n, label in toc_rows
    ]
    toc_table = Table(toc_data, colWidths=[18 * mm, 150 * mm])
    toc_table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LINEBELOW", (0, 0), (-1, -2), 0.3, BORDER),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(Paragraph("CONTENTS", eyebrow))
    story.append(Spacer(1, 6))
    story.append(toc_table)
    story.append(PageBreak())

    # ─── Section 01 — Page Structure ───────────────────────────────
    story.extend(section_header("01", "Page structure &amp; visual rhythm"))

    story.append(Paragraph(
        "The page reads top to bottom as a magazine spread &mdash; dark hero, "
        "light editorial middle, soft lavender beat, light listing, dark closing CTA. "
        "Same rhythm as /about: dark beats bracket the page, light beats carry "
        "the story.",
        body,
    ))
    story.append(Spacer(1, 8))

    rhythm = [
        ("01", "HERO", "Ink black with spotlight", "Cinematic open"),
        ("02", "INDUSTRY STRIP", "White, hairline border", "Connector"),
        ("03", "FEATURED PROJECT", "White, border-beam tile", "Marquee"),
        ("04", "PROJECT GRID", "White, asymmetric 7-tile grid", "Workhorse"),
        ("05", "METRICS STRIP", "Lavender wash", "Tally"),
        ("06", "ALL CLIENTS", "White, pill grid", "Trust signal"),
        ("07", "CLOSING CTA", "Ink black with lavender blob", "Conversion"),
    ]
    rhythm_data = [
        [
            Paragraph(f"<font face='Courier-Bold' color='#4B28FF'>{n}</font>", body),
            Paragraph(f"<b>{name}</b>", body),
            Paragraph(bg, body_muted),
            Paragraph(role, body_muted),
        ]
        for n, name, bg, role in rhythm
    ]
    rhythm_table = Table(rhythm_data, colWidths=[12 * mm, 45 * mm, 75 * mm, 38 * mm])
    rhythm_table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LINEBELOW", (0, 0), (-1, -2), 0.3, BORDER),
                ("BACKGROUND", (0, 0), (-1, 0), SURFACE),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(rhythm_table)
    story.append(PageBreak())

    # ─── Section 02 — Hero ────────────────────────────────────────
    story.extend(section_header("02", "Hero"))

    story.append(Paragraph(
        "Dark cinematic slab. Ink-black background, spotlight cursor light "
        "in brand violet, oversized headline with one italic accent word in "
        "Instrument Serif.",
        body_muted,
    ))
    story.append(Spacer(1, 10))

    story.append(Paragraph("EYEBROW", eyebrow))
    story.append(Paragraph(
        "<font face='Courier'>N&deg; 01 &mdash; SELECTED WORK</font>",
        body,
    ))
    story.append(Spacer(1, 8))

    story.append(Paragraph("HEADLINE", eyebrow))
    story.append(Paragraph(
        "<font size='20'><b>Work that <i>ships.</i></b></font>",
        body,
    ))
    story.append(Paragraph(
        "The italic word uses Instrument Serif &mdash; the page's one accent serif. "
        "Same treatment as the homepage 'Friction' word, so the brand "
        "language is continuous.",
        body_muted,
    ))
    story.append(Spacer(1, 8))

    story.append(Paragraph("SUBHEAD", eyebrow))
    story.append(Paragraph(
        '"Eight clients. Six industries. Three continents. Each one shipped '
        'to production."',
        body,
    ))
    story.append(Paragraph(
        "Reveal word-by-word at 80ms stagger. Three short claims, then a "
        "final clause as the payoff. Tricolon structure &mdash; same "
        "rhetorical shape as 'we came, we saw, we conquered'.",
        body_muted,
    ))
    story.append(Spacer(1, 8))

    story.append(Paragraph("MICRO-COPY", eyebrow))
    story.append(Paragraph(
        "(none &mdash; the hero stays clean. No scroll cue, no CTA, no "
        "stat preview. Just eyebrow, headline, subhead. The next section "
        "carries the connector.)",
        body_muted,
    ))
    story.append(PageBreak())

    # ─── Section 03 — Industry Spread ─────────────────────────────
    story.extend(section_header("03", "Industry spread strip"))

    story.append(Paragraph(
        "Thin connector strip between hero and grid. Pure typography, no "
        "icons, no links. Sells range before the first card appears.",
        body_muted,
    ))
    story.append(Spacer(1, 10))

    story.append(Paragraph("EYEBROW", eyebrow))
    story.append(Paragraph(
        "<font face='Courier'>WHAT WE'VE SHIPPED</font>",
        body,
    ))
    story.append(Spacer(1, 8))

    story.append(Paragraph("CHIPS (in order)", eyebrow))
    chips = [
        ("Healthcare", "1 project &mdash; MedCollect"),
        ("CleanTech", "1 project &mdash; SunZero"),
        ("PropTech", "1 project &mdash; Aliste"),
        ("EdTech", "1 project &mdash; Jumbl"),
        ("E-commerce x3", "3 projects &mdash; DellStore, Tamimi, Ackermans"),
        ("Industrial", "1 project &mdash; Skyline"),
    ]
    chips_data = [
        [Paragraph(f"<b>{label}</b>", body), Paragraph(meta, body_muted)]
        for label, meta in chips
    ]
    chips_table = Table(chips_data, colWidths=[55 * mm, 115 * mm])
    chips_table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LINEBELOW", (0, 0), (-1, -2), 0.3, BORDER),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(chips_table)
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "<b>Note on the 'x3' marker.</b> The E-commerce chip carries a small "
        "superscript 'x3' in mono, brand purple, 70% size of the chip text. "
        "It signals 'we shipped e-commerce on three different stacks for "
        "three different markets' &mdash; restraint, not bragging.",
        callout,
    ))
    story.append(PageBreak())

    # ─── Section 04 — Featured Project ─────────────────────────────
    story.extend(section_header("04", "Featured project &mdash; MedCollect"))

    story.append(Paragraph(
        "The marquee tile. Wrapped in BorderBeam (violet to purple orbit, "
        "9s rotation). Real screenshot of the dashboard. 16:10 image left, "
        "copy block right.",
        body_muted,
    ))
    story.append(Spacer(1, 10))

    story.extend(project_card(
        "01",
        "MedCollect &mdash; Featured",
        [
            ("Slug", "medcollect"),
            ("Tag row", "<font face='Courier'>HEALTHCARE &middot; USA &middot; 2025</font>"),
            ("Client name", "MedCollect"),
            ("Outcome line", "Optum-integrated medical billing that closes claims in under 12 seconds."),
            ("Stack", "React &middot; Node.js &middot; MongoDB &middot; Optum REST &middot; HIPAA cloud"),
            ("Stat A", "&lt;12s &mdash; claim submission"),
            ("Stat B", "837P &mdash; auto-validation"),
            ("Status", "Live"),
            ("Accent color", "#BD70F6 (Accent Violet)"),
            ("Image", "/work/medcollect.webp &mdash; dashboard hero, 1600x1000, WebP"),
            ("Link", "/work/medcollect (case-study detail page)"),
            ("Card CTA", "See the build"),
        ],
        is_featured=True,
    ))

    story.append(Paragraph(
        "<b>Why MedCollect for featured.</b> Optum-integrated medical "
        "billing with ANSI X12 EDI is the most technically impressive thing "
        "in the portfolio. Anyone can ship a Shopify site &mdash; very few "
        "teams can ship to Optum's clearinghouse. Lead with the moat.",
        callout,
    ))
    story.append(PageBreak())

    # ─── Section 05 — Project Grid ─────────────────────────────────
    story.extend(section_header("05", "Project grid &mdash; 7 cards"))

    story.append(Paragraph(
        "Seven remaining projects, arranged in an asymmetric 12-col grid "
        "(rows of 5+7, 7+5, then a 3-tile row of 4+4+4). Order is "
        "interleaved so the three E-commerce cards never sit adjacent.",
        body_muted,
    ))
    story.append(Spacer(1, 8))

    story.append(Paragraph(
        "<b>Card anatomy.</b> Cover image (16:10) &raquo; tag row (industry &middot; "
        "region &middot; year) &raquo; client name &raquo; one-line outcome &raquo; "
        "stack row (mono, dot-separated) &raquo; footer with status and "
        "'See case' link.",
        body,
    ))
    story.append(Spacer(1, 10))

    # 7 cards
    grid_projects = [
        ("02", "SunZero", [
            ("Slug", "sunzero"),
            ("Tag row", "<font face='Courier'>CLEANTECH &middot; INDIA &middot; 2025</font>"),
            ("Outcome line", "Real-time energy intelligence portal for India's first integrated clean-infrastructure platform."),
            ("Stack", "Next.js &middot; Python &middot; FastAPI &middot; TimescaleDB &middot; MQTT"),
            ("Stat A", "100+ &mdash; C&amp;I installations"),
            ("Stat B", "3 &mdash; role-based portals"),
            ("Accent color", "#FC5038 (Accent Warm)"),
        ]),
        ("03", "Aliste Technologies", [
            ("Slug", "aliste"),
            ("Tag row", "<font face='Courier'>PROPTECH &middot; INDIA &middot; 2024</font>"),
            ("Outcome line", "Smart sub-metering for residential property. Zero upfront cost. Sub-30-second QR recharge."),
            ("Stack", "React Native &middot; Node.js &middot; Apollo GraphQL &middot; MongoDB &middot; MQTT"),
            ("Stat A", "150K+ &mdash; lives impacted"),
            ("Stat B", "~100% &mdash; bill recovery"),
            ("Accent color", "#00A656 (Accent Green)"),
        ]),
        ("04", "DellStore", [
            ("Slug", "dellstore"),
            ("Tag row", "<font face='Courier'>E-COMMERCE &middot; INDIA &middot; 2024</font>"),
            ("Outcome line", "India's Dell store rebuilt on Magento 2 + Laravel microservices. Handles peak load without flinching."),
            ("Stack", "Magento 2 &middot; Laravel &middot; MySQL + Redis &middot; AWS EC2 &middot; Braintree"),
            ("Stat A", "12-mo &mdash; No-Cost EMI engine"),
            ("Stat B", "B2C+SMB &mdash; role-based catalog"),
            ("Accent color", "#4B28FF (Primary)"),
        ]),
        ("05", "Skyline Elevators", [
            ("Slug", "skyline"),
            ("Tag row", "<font face='Courier'>INDUSTRIAL &middot; USA &middot; 2025</font>"),
            ("Outcome line", "Proposal-to-contract platform for an NYC elevator firm. 12 modules, 4 elevator types, one source of truth."),
            ("Stack", "React 18 &middot; Vite &middot; Redux Toolkit &middot; React Query &middot; Radix &middot; Google Maps"),
            ("Stat A", "12 &mdash; modules shipped"),
            ("Stat B", "4 &mdash; elevator types supported"),
            ("Accent color", "#4B28FF (Primary)"),
        ]),
        ("06", "Tamimi Markets", [
            ("Slug", "tamimi-markets"),
            ("Tag row", "<font face='Courier'>E-COMMERCE &middot; KSA &middot; 2024</font>"),
            ("Outcome line", "Saudi Arabia's modern online supermarket. Bilingual checkout, same-day delivery, click and collect."),
            ("Stack", "Next.js &middot; Node.js &middot; Azure &middot; Apple Pay &middot; Google Maps"),
            ("Stat A", "AR-EN &mdash; bilingual hreflang"),
            ("Stat B", "Same-day &mdash; delivery + click and collect"),
            ("Accent color", "#BD70F6 (Accent Violet)"),
        ]),
        ("07", "Jumbl", [
            ("Slug", "jumbl"),
            ("Tag row", "<font face='Courier'>EDTECH &middot; INDIA &middot; 2025</font>"),
            ("Outcome line", "AI mock-interview platform pairing students with paid internships at 100+ startups."),
            ("Stack", "Framer &middot; React.js &middot; React Native &middot; Node.js &middot; OpenAI"),
            ("Stat A", "100+ &mdash; Indian startups"),
            ("Stat B", "JD-paste &mdash; AI interview engine"),
            ("Accent color", "#BD70F6 (Accent Violet)"),
        ]),
        ("08", "Ackermans", [
            ("Slug", "ackermans"),
            ("Tag row", "<font face='Courier'>E-COMMERCE &middot; ZA &middot; 2024</font>"),
            ("Outcome line", "South Africa's #1 value-fashion retailer online. Shopify Plus, custom theme, 1000+ stores omnichannel."),
            ("Stack", "Shopify Plus &middot; Liquid &middot; React/AngularJS &middot; Klaviyo &middot; Cloudflare CDN"),
            ("Stat A", "1000+ &mdash; stores omnichannel"),
            ("Stat B", "BNPL &mdash; plus free-delivery threshold"),
            ("Accent color", "#00A656 (Accent Green)"),
        ]),
    ]

    for idx, name, fields in grid_projects:
        story.extend(project_card(idx, name, fields))

    story.append(Paragraph(
        "<b>Grid order rationale.</b> Three E-commerce cards (DellStore, "
        "Tamimi, Ackermans) are interleaved with non-commerce projects so "
        "they never appear adjacent. Each row has at most one e-com card. "
        "Variety on every scroll-stop.",
        callout,
    ))
    story.append(PageBreak())

    # ─── Section 06 — Metrics Strip ────────────────────────────────
    story.extend(section_header("06", "Metrics strip"))

    story.append(Paragraph(
        "Typography-only strip on lavender wash background. Sits between "
        "the project grid and the all-clients section. Four count-up "
        "numbers that mirror the hero claim.",
        body_muted,
    ))
    story.append(Spacer(1, 10))

    story.append(Paragraph("EYEBROW", eyebrow))
    story.append(Paragraph(
        "<font face='Courier'>THE TALLY</font>",
        body,
    ))
    story.append(Spacer(1, 10))

    metrics = [
        ("8", "clients"),
        ("6", "industries"),
        ("3", "continents"),
        ("100%", "launched"),
    ]
    metric_data = [[
        Paragraph(
            f"<font size='32' color='#0E0A1E'><b>{num}</b></font>",
            ParagraphStyle("MetricNum", parent=body, alignment=TA_CENTER, leading=40),
        )
        for num, _ in metrics
    ], [
        Paragraph(
            f"<font face='Courier' size='8' color='#595959'>{label.upper()}</font>",
            ParagraphStyle("MetricLabel", parent=body, alignment=TA_CENTER),
        )
        for _, label in metrics
    ]]
    metric_table = Table(metric_data, colWidths=[42.5 * mm] * 4)
    metric_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), PAPER_ALT),
                ("LINEAFTER", (0, 0), (-2, -1), 0.4, ACCENT_VIOLET),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 14),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
            ]
        )
    )
    story.append(metric_table)
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "Each number animates via NumberTicker on viewport enter. Labels "
        "are mono uppercase. Same visual language as the /about page's "
        "stat-as-hero cards &mdash; continuity across the site.",
        body_muted,
    ))
    story.append(PageBreak())

    # ─── Section 07 — All Clients ──────────────────────────────────
    story.extend(section_header("07", "All clients"))

    story.append(Paragraph(
        "Pill grid below the metrics strip. Builds 'trust through volume'. "
        "Linked pills (have a case-study page) scramble to industry on hover. "
        "Non-linked pills are static.",
        body_muted,
    ))
    story.append(Spacer(1, 10))

    story.append(Paragraph("EYEBROW", eyebrow))
    story.append(Paragraph(
        "<font face='Courier'>N&deg; 03 &mdash; CLIENTS</font>",
        body,
    ))
    story.append(Spacer(1, 6))

    story.append(Paragraph("HEADLINE", eyebrow))
    story.append(Paragraph(
        "<font size='16'><b>Teams who let us touch the <i>codebase.</i></b></font>",
        body,
    ))
    story.append(Paragraph(
        "Second italic Instrument Serif moment of the page (first was "
        "'ships.' in the hero). Two italics is the right number &mdash; "
        "three becomes decorative.",
        body_muted,
    ))
    story.append(Spacer(1, 10))

    story.append(Paragraph("PILL GRID (10 entries, 5 col desktop)", eyebrow))
    clients = [
        ("MedCollect", "linked", "Healthcare IT"),
        ("DellStore", "linked", "E-commerce"),
        ("SunZero", "linked", "CleanTech"),
        ("Aliste Tech", "linked", "PropTech"),
        ("Skyline", "linked", "Industrial"),
        ("Tamimi Markets", "linked", "E-commerce"),
        ("Jumbl", "linked", "EdTech"),
        ("Ackermans", "linked", "E-commerce"),
        ("Odd Pieces", "static", "&mdash;"),
        ("Radhe Fashion", "static", "&mdash;"),
    ]
    client_data = [
        [
            Paragraph(f"<b>{name}</b>", body),
            Paragraph(state, body_muted),
            Paragraph(industry, body_muted),
        ]
        for name, state, industry in clients
    ]
    client_table = Table(
        [[Paragraph("<b>Pill</b>", body), Paragraph("<b>State</b>", body), Paragraph("<b>Hover swap</b>", body)]] + client_data,
        colWidths=[60 * mm, 40 * mm, 70 * mm],
    )
    client_table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("BACKGROUND", (0, 0), (-1, 0), SURFACE),
                ("LINEBELOW", (0, 0), (-1, 0), 0.6, BORDER),
                ("LINEBELOW", (0, 1), (-1, -2), 0.3, BORDER),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(client_table)
    story.append(PageBreak())

    # ─── Section 08 — Closing CTA ──────────────────────────────────
    story.extend(section_header("08", "Closing CTA"))

    story.append(Paragraph(
        "Final beat before the footer. Mirror of the hero &mdash; ink "
        "black background, lavender blob in the top-right corner, "
        "italic accent word in Instrument Serif.",
        body_muted,
    ))
    story.append(Spacer(1, 10))

    story.append(Paragraph("EYEBROW", eyebrow))
    story.append(Paragraph(
        "<font face='Courier'>WHAT'S NEXT</font>",
        body,
    ))
    story.append(Spacer(1, 6))

    story.append(Paragraph("HEADLINE", eyebrow))
    story.append(Paragraph(
        "<font size='18'><b>Want to be the <i>next</i> case study?</b></font>",
        body,
    ))
    story.append(Paragraph(
        "The italic 'next' uses AccentTypewriter to cycle through "
        "[next / first / biggest / weirdest / fastest], stopping when "
        "the user hovers anywhere in the section.",
        body_muted,
    ))
    story.append(Spacer(1, 8))

    story.append(Paragraph("BODY", eyebrow))
    story.append(Paragraph(
        '"We work in fixed-cost sprints. Tell us what you\'re trying to '
        'ship and we\'ll come back within 48 hours with a plan."',
        body,
    ))
    story.append(Spacer(1, 8))

    story.append(Paragraph("BUTTON", eyebrow))
    story.append(Paragraph(
        "Label: <b>Start a project</b> &raquo; /contact",
        body,
    ))
    story.append(Paragraph(
        "Wrapped in MagneticPill so the button follows the cursor within "
        "a 60px radius. Single moment of delight at the page's last beat.",
        body_muted,
    ))
    story.append(PageBreak())

    # ─── Section 09 — Copy Rules ──────────────────────────────────
    story.extend(section_header("09", "Copy rules &mdash; anti-generic"))

    story.append(Paragraph(
        "Five rules every line of /work copy follows. Tested against the "
        "actual project data above &mdash; the right column is what the "
        "page actually uses.",
        body_muted,
    ))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Rule 1 &mdash; Diagnose, do not pitch", h3))
    story.append(comparison_table([
        (
            "We built a powerful e-commerce platform with cutting-edge technology.",
            "Dell India's old store collapsed at 2K concurrent users. We rebuilt it on Magento 2 + Laravel microservices. Now it handles 50K+.",
        ),
    ]))
    story.append(Spacer(1, 6))

    story.append(Paragraph("Rule 2 &mdash; Verbs beat adjectives", h3))
    story.append(comparison_table([
        (
            "Comprehensive, scalable, enterprise-grade healthcare solution.",
            "Ingests patient records. Validates against 837P rules. Submits to Optum in under 12 seconds.",
        ),
    ]))
    story.append(Spacer(1, 6))

    story.append(Paragraph("Rule 3 &mdash; Specific numbers beat round numbers", h3))
    story.append(comparison_table([
        (
            "Improved performance significantly.",
            "Bill recovery jumped from 73% to ~100%. Aliste, 8 months.",
        ),
    ]))
    story.append(Spacer(1, 6))

    story.append(Paragraph("Rule 4 &mdash; Drop the 'we'", h3))
    story.append(comparison_table([
        (
            "We are a digital agency that creates innovative solutions for our valued clients.",
            "Work that ships.",
        ),
    ]))
    story.append(Spacer(1, 6))

    story.append(Paragraph("Rule 5 &mdash; Confidence without bragging = restraint", h3))
    story.append(comparison_table([
        (
            "Award-winning agency trusted by global leaders.",
            "Eight clients. Six industries. Three continents. Each one shipped to production.",
        ),
    ]))
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "<b>The fastest tell that copy is AI-generated:</b> "
        "words ending in -ive, -ing, -ly that aren't verbs. "
        "Innovative, leading, scalable, seamlessly, comprehensively, "
        "robust, dynamic, holistic. Strip them all.",
        callout,
    ))
    story.append(PageBreak())

    # ─── Section 10 — Design tokens ────────────────────────────────
    story.extend(section_header("10", "Design tokens reference"))

    story.append(Paragraph(
        "Read-only reference. The /work page MUST use these tokens &mdash; "
        "they are sourced from globals.css and the existing design system. "
        "No new fonts, no new colors, no new spacing scales.",
        body_muted,
    ))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Typography", h2))
    typo = [
        ("Sans (everything)", "Albert Sans &mdash; 400 / 500 / 600 / 700"),
        ("Italic accent", "Instrument Serif italic 400 (use once or twice per page max)"),
        ("Mono micro-copy", "JetBrains Mono 400 / 500 &mdash; eyebrows, indices, stat labels"),
        ("Display XL", "clamp(48px, 8.4vw, 120px), weight 500, tracking -0.06em"),
        ("Display LG", "clamp(38px, 5.6vw, 80px), weight 500, tracking -0.05em"),
        ("Display MD", "clamp(28px, 3.2vw, 44px), weight 500, tracking -0.04em"),
        ("Eyebrow", "clamp(20px, 2.22vw, 32px), weight 400, color foreground-mid"),
        ("Editorial label", "Mono, 11-13px, 0.16em tracking, uppercase, tabular nums"),
        ("Body LG", "clamp(16px, 1.4vw, 20px), color muted"),
        ("Body MD", "16px, color muted"),
    ]
    story.append(field_table(typo))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Colors", h2))
    color_tokens = [
        ("--color-primary", "#4B28FF &mdash; brand purple, CTAs, focus rings"),
        ("--color-accent-violet", "#BD70F6 &mdash; spotlight, glow blobs"),
        ("--color-accent-warm", "#FC5038 &mdash; SunZero accent"),
        ("--color-accent-green", "#00A656 &mdash; Aliste, Ackermans accents"),
        ("--color-foreground", "#03020B &mdash; near-black ink for body text"),
        ("--color-muted", "#595959 &mdash; secondary text, AAA on white"),
        ("--color-paper-alt", "#F4EEF9 &mdash; lavender wash for metrics strip"),
        ("--color-soft-lavender", "#E7DFFD &mdash; even softer lavender"),
        ("--color-surface", "#F6F6F6 &mdash; card alt background"),
        ("--color-border", "#E1E2E6 &mdash; hairline dividers"),
    ]
    story.append(field_table(color_tokens))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Spacing &amp; layout", h2))
    spacing = [
        ("Container max-width", "1440px (.site-shell), centered"),
        ("Container gutter", "px-6 / sm:px-8 / lg:px-14 / xl:px-20"),
        ("Section block padding", "clamp(4rem, 9vw, 9rem) &mdash; .section-pad"),
        ("Card radius", "24px (.card-base), 32px on big CTA blocks"),
        ("Pill radius", "999px, 44px height, 20px horizontal padding"),
        ("Grid gap", "gap-5 sm:gap-6 lg:gap-8"),
        ("Card padding", "p-6 sm:p-8"),
    ]
    story.append(field_table(spacing))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Primitives to use", h2))
    primitives = [
        ("Hero", "Spotlight (cursor light), CharSplit (headline entrance), WordReveal (subhead)"),
        ("Featured tile", "BorderBeam (orbit), MagicCard (cursor glow), ScrubScale (image)"),
        ("Grid cards", "MagicCard, AnimateIn, ScrubScale on cover image"),
        ("Metrics strip", "NumberTicker on each stat"),
        ("All clients", "ScrambleText on hover (linked pills only)"),
        ("CTA", "AccentTypewriter on italic word, MagneticPill on button"),
        ("Scroll progress", "ScrollProgress at top of page"),
    ]
    story.append(field_table(primitives))
    story.append(Spacer(1, 12))

    # ─── Footer note ───────────────────────────────────────────────
    story.append(Spacer(1, 14))
    story.append(hr())
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "<b>End of specification.</b> Sign off the 8 outcome lines, the "
        "featured pick, and the cover image plan, then we move to design "
        "and code.",
        body_muted,
    ))

    doc.build(story)


def main() -> None:
    project_root = Path(__file__).resolve().parent.parent
    output_dir = project_root / "docs"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "work-content-spec.pdf"

    build_pdf(output_path)

    size_kb = output_path.stat().st_size / 1024
    print(f"Wrote {output_path} ({size_kb:.1f} KB)")


if __name__ == "__main__":
    main()
