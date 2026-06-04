"""PDF export using reportlab. Themed deep slate + emerald green."""
from __future__ import annotations

import io
from typing import Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

SLATE = colors.HexColor("#0B1219")
EMERALD = colors.HexColor("#10B981")
TEXT = colors.HexColor("#F0FDF4")
MUTED = colors.HexColor("#1E3A2A")
BORDER = colors.HexColor("#1A3022")


def _styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name="PSTitle", fontName="Helvetica-Bold", fontSize=28,
        leading=32, textColor=TEXT,
    ))
    styles.add(ParagraphStyle(
        name="PSSubtitle", fontName="Helvetica", fontSize=11,
        leading=14, textColor=EMERALD,
    ))
    styles.add(ParagraphStyle(
        name="PSBody", fontName="Helvetica", fontSize=10,
        leading=14, textColor=TEXT,
    ))
    styles.add(ParagraphStyle(
        name="PSSection", fontName="Helvetica-Bold", fontSize=13,
        leading=18, textColor=EMERALD, spaceBefore=12, spaceAfter=4,
    ))
    return styles


def render_scan_pdf(scan: Any) -> io.BytesIO:
    """Return an in-memory PDF for the given scan-like object."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        leftMargin=20 * mm, rightMargin=20 * mm,
        topMargin=20 * mm, bottomMargin=20 * mm,
        title=f"PostureScan report — {scan.domain.hostname}",
    )
    s = _styles()
    story = []

    hostname = scan.domain.hostname
    story.append(Paragraph("PostureScan", s["PSTitle"]))
    story.append(Paragraph(f"Security posture report — {hostname}", s["PSSubtitle"]))
    story.append(Spacer(1, 6 * mm))

    # Score block
    score_table = Table(
        [[
            Paragraph(f"<b>{scan.grade}</b>", ParagraphStyle(
                "g", fontName="Helvetica-Bold", fontSize=42, textColor=EMERALD, alignment=1,
            )),
            Paragraph(
                f"<b>Score</b>  {scan.score}/100<br/>"
                f"<b>Scanned</b>  {scan.created_at.strftime('%Y-%m-%d %H:%M UTC')}<br/>"
                f"<b>Status</b>  {scan.status}",
                s["PSBody"],
            ),
        ]],
        colWidths=[40 * mm, None],
    )
    score_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), SLATE),
        ("BOX", (0, 0), (-1, -1), 0.5, BORDER),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(score_table)

    # Results grouped by category
    rows = list(scan.results.all())
    by_cat: dict[str, list] = {}
    for r in rows:
        by_cat.setdefault(r.category, []).append(r)

    for category, checks in by_cat.items():
        story.append(Paragraph(category.upper(), s["PSSection"]))
        data = [["Check", "Status", "Observed", "Impact"]]
        for c in checks:
            data.append([
                Paragraph(c.check_key, s["PSBody"]),
                Paragraph(c.status, s["PSBody"]),
                Paragraph(c.observed_value or "—", s["PSBody"]),
                Paragraph(str(c.score_impact), s["PSBody"]),
            ])
        table = Table(data, colWidths=[55 * mm, 22 * mm, None, 18 * mm])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), MUTED),
            ("TEXTCOLOR", (0, 0), (-1, 0), TEXT),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("GRID", (0, 0), (-1, -1), 0.25, BORDER),
            ("BACKGROUND", (0, 1), (-1, -1), SLATE),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(table)
        story.append(Spacer(1, 4 * mm))

    doc.build(story)
    buffer.seek(0)
    return buffer
