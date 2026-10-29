from html import escape, unescape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import quote, unquote
import os
import re
import subprocess

ROOT = Path(__file__).resolve().parent.parent
WEB = ROOT / "web"
PORTAL = ROOT / "index.html"
BASE_CSS = WEB / "assets/robotest.css"
STYLE = WEB / "assets/resumenes.css"
SCRIPT = WEB / "assets/resumenes.js"
TEORIA = ROOT / "Teoria"
GUIAS = ROOT / "Guias_practicas"

# Cada parcial se publica en web/<key>/: su test es index.html y los resúmenes y guías van al lado.
PARCIALES = [
    {
        "key": "parcial1",
        "label": "Parcial 1",
        "lessons": [
            {
                "key": "L1",
                "source": TEORIA / "L1-Introduction-to-Autonomous-Robotics/Resumen_L1_Introduccion_Robotica_Autonoma.md",
                "title": "Introducción a la robótica autónoma",
                "subtitle": "La idea de robot autónomo, las arquitecturas y las preguntas que guían la robótica móvil.",
            },
            {
                "key": "L2",
                "source": TEORIA / "L2-Robot-Control-Architecture-and-ROS/Resumen_L2_Arquitecturas_Control_ROS2.md",
                "title": "Arquitecturas de control y ROS 2",
                "subtitle": "De los paradigmas y los árboles de comportamiento a los nodos, topics y herramientas ROS 2.",
            },
            {
                "key": "L3",
                "source": TEORIA / "L3-Robot-motion/Resumen_L3_Movimiento_Robot.md",
                "title": "Movimiento del robot",
                "subtitle": "Cinemática, composición de poses, odometría y modelos probabilísticos explicados por bloques.",
            },
        ],
        "guides": [
            {
                "key": "P2.1",
                "lesson": "L2",
                "source": GUIAS / "P2.1_ROS2_guia_rapida.md",
                "title": "ROS 2 y MVSim",
                "subtitle": "Guía de la práctica 2.1: mundo simulado, nodos, topics, TF y control por teclado.",
            },
            {
                "key": "P3.1",
                "lesson": "L3",
                "source": GUIAS / "P3.1_Composicion_poses.md",
                "title": "Composición de poses",
                "subtitle": "Práctica 3.1: marcos locales, tcomp, transformaciones y el recorrido cuadrado.",
            },
            {
                "key": "P3.2",
                "lesson": "L3",
                "source": GUIAS / "P3.2_Modelo_velocidad.md",
                "title": "Modelo basado en velocidad",
                "subtitle": "Práctica 3.2: arcos, caso recto, next_pose y límites del modelo.",
            },
            {
                "key": "P3.3",
                "lesson": "L3",
                "source": GUIAS / "P3.3_Modelo_odometria.md",
                "title": "Modelo basado en odometría",
                "subtitle": "Práctica 3.3: encoders, jacobianos, propagación gaussiana y partículas.",
            },
        ],
    },
    {
        "key": "parcial2",
        "label": "Parcial 2",
        "lessons": [],
        "guides": [],
    },
]


class Outline(HTMLParser):
    def __init__(self):
        super().__init__()
        self.sections = []
        self.headings = []
        self.current = None
        self.annotation = False

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if tag == "section":
            self.sections.append(attributes.get("id", ""))
        elif tag in {"h2", "h3"} and self.sections:
            self.current = [int(tag[1]), self.sections[-1], []]
        elif tag == "annotation":
            self.annotation = True

    def handle_endtag(self, tag):
        if tag in {"h2", "h3"} and self.current:
            level, identifier, words = self.current
            self.headings.append((level, identifier, " ".join("".join(words).split())))
            self.current = None
        elif tag == "section" and self.sections:
            self.sections.pop()
        elif tag == "annotation":
            self.annotation = False

    def handle_data(self, data):
        if self.current and not self.annotation:
            self.current[2].append(data)


def link(source, target):
    relative = os.path.relpath(target, source.parent).replace(os.sep, "/")
    return escape(quote(relative, safe="/"), quote=True)


def page_output(page):
    return WEB / page["parcial"]["key"] / (page["source"].stem + ".html")


def quiz_page(parcial):
    quiz = WEB / parcial["key"] / "index.html"
    return quiz if quiz.exists() else PORTAL


def relink(rendered, source, output):
    # Los enlaces relativos del Markdown (imágenes, otros .md, notebooks) apuntan desde la carpeta
    # del .md; en la web se recalculan desde la carpeta de salida.
    def fix(match):
        attribute, value = match.groups()
        target = unescape(value)
        if target.startswith(("#", "/", "data:", "mailto:")) or "://" in target:
            return match.group(0)
        path, _, fragment = target.partition("#")
        url = link(output, source.parent / unquote(path))
        return f'{attribute}="{url}{"#" + escape(fragment, quote=True) if fragment else ""}"'

    return re.sub(r'\b(src|href)="([^"]*)"', fix, rendered)


def toc_html(headings):
    groups = []
    for level, identifier, title in headings:
        if level == 2:
            groups.append((identifier, title, []))
        elif level == 3 and groups:
            groups[-1][2].append((identifier, title))
    sections = []
    for index, (identifier, title, children) in enumerate(groups):
        number = re.match(r"^(\d+)\.\s*", title)
        marker = number.group(1).zfill(2) if number else "·"
        label = title[number.end():] if number else title
        url = escape("#" + identifier, quote=True)
        sublinks = "".join(f'<a href="#{escape(child_id, quote=True)}">{escape(child_title)}</a>' for child_id, child_title in children)
        sections.append(
            f'<details class="toc-chapter" {"open" if index == 0 else ""}>'
            f'<summary><span class="toc-number">{marker}</span><span>{escape(label)}</span></summary>'
            f'<div class="toc-links"><a href="{url}">Ir al bloque</a>{sublinks}</div></details>'
        )
    return "".join(sections), len(groups)


def related_html(page, output):
    parcial = page["parcial"]
    if page in parcial["lessons"]:
        guides = [item for item in parcial["guides"] if item["lesson"] == page["key"]]
        if not guides:
            return ""
        cards = "".join(
            f'<a class="related-card" href="{link(output, page_output(item))}">'
            f'<span>{escape(item["key"])} · PRÁCTICA</span><strong>{escape(item["title"])}</strong>'
            '<small>Leer guía web <span aria-hidden="true">↗</span></small></a>'
            for item in guides
        )
        return f'<section class="related"><span class="overline">APLICA LO APRENDIDO</span><h2>Guías de prácticas</h2><p>El test incluye preguntas de estas prácticas. Aquí puedes estudiar el procedimiento completo.</p><div class="related-grid">{cards}</div></section>'
    lesson = next(item for item in parcial["lessons"] if item["key"] == page["lesson"])
    companions = [item for item in parcial["guides"] if item["lesson"] == page["lesson"] and item != page]
    cards = [f'<a class="related-card" href="{link(output, page_output(lesson))}"><span>{escape(lesson["key"])} · TEORÍA</span><strong>{escape(lesson["title"])}</strong><small>Volver al resumen ↗</small></a>']
    cards.extend(
        f'<a class="related-card" href="{link(output, page_output(item))}">'
        f'<span>{escape(item["key"])} · PRÁCTICA</span><strong>{escape(item["title"])}</strong><small>Leer guía ↗</small></a>'
        for item in companions
    )
    return f'<section class="related"><span class="overline">SIGUE ESTUDIANDO</span><h2>Más material del bloque</h2><div class="related-grid">{"".join(cards)}</div></section>'


def build(page):
    source = page["source"]
    output = page_output(page)
    rendered = subprocess.run(
        ["pandoc", "--from=markdown+gfm_auto_identifiers+pipe_tables+tex_math_dollars+yaml_metadata_block-raw_html", "--to=html5", "--mathml", "--section-divs", "--wrap=none", str(source)],
        capture_output=True, text=True, check=True,
    ).stdout
    rendered = relink(rendered, source, output)
    outline = Outline()
    outline.feed(rendered)
    chapters, total = toc_html(outline.headings)
    formulas = rendered.count('<math display="')
    content_feature = f"{formulas} fórmulas renderizadas" if formulas else "Apartados navegables"
    parcial = page["parcial"]
    active = page.get("lesson", page["key"])
    menu = f'<a href="{link(output, PORTAL)}">Inicio</a>' + "".join(
        f'<a href="{link(output, page_output(lesson))}"'
        f'{" aria-current=page" if lesson["key"] == active else ""}>{lesson["key"]}</a>'
        for lesson in parcial["lessons"]
    )
    quiz_link = link(output, quiz_page(parcial))
    quiz_url = f'{quiz_link}?lesson={active}#filters'
    practice_url = f'{quiz_link}?lesson={active}&amp;kind=Pr%C3%A1ctica#filters'
    label = "GUÍA DE PRÁCTICAS" if page in parcial["guides"] else "RESUMEN DE LA LECCIÓN"
    summary_label = next(item for item in parcial["lessons"] if item["key"] == active)
    source_link = link(output, source)
    toc = f'<nav class="toc-items" aria-label="Apartados de la página">{chapters}</nav>'
    page_html = f'''<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>{escape(page["key"])} · {escape(page["title"])} | RoboTest</title>
  <link rel="stylesheet" href="{link(output, BASE_CSS)}">
  <link rel="stylesheet" href="{link(output, STYLE)}">
  <script src="{link(output, SCRIPT)}" defer></script>
</head>
<body>
  <div id="reading-progress" aria-hidden="true"></div>
  <header class="topbar">
    <a class="brand" href="{quiz_link}" aria-label="RoboTest, volver al inicio"><span class="brand-mark">R<span></span></span> ROBO<span>TEST</span></a>
    <nav aria-label="Navegación principal">{menu}<a href="{quiz_link}">Test <span aria-hidden="true">↗</span></a></nav>
  </header>
  <main>
    <section class="hero lesson-hero" aria-labelledby="hero-title">
      <div class="hero-inner">
        <div class="eyebrow"><span class="status-dot"></span> {escape(parcial["label"].upper())} · {escape(active)} · {label}</div>
        <h1 id="hero-title">{escape(page["title"])}<span class="hero-period">.</span></h1>
        <p>{escape(page["subtitle"])}</p>
        <div class="hero-actions"><a class="button primary" href="#apuntes">Empezar a leer <span aria-hidden="true">↘</span></a><a class="button subtle" href="{quiz_url}">Practicar el tema</a></div>
        <div class="lesson-facts"><span>{total} bloques de lectura</span><span>{content_feature}</span><span>Sin conexión</span></div>
      </div>
      <div class="hero-art" aria-hidden="true"><div class="grid-plane"></div><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="robot-icon"><span class="eye"></span><span class="eye"></span></div><div class="beacon beacon-a"></div><div class="beacon beacon-b"></div><span class="art-label label-a">SENSE</span><span class="art-label label-b">PLAN</span><span class="art-label label-c">ACT</span></div>
    </section>
    <div class="reading-wrap" id="apuntes">
      <div class="reading-intro"><div><span class="overline">{escape(page["key"])} / LECTURA</span><h2>Todo el contenido, mejor organizado.</h2><p>Índice navegable, secciones cortas y fórmulas legibles. El contenido del apunte original se mantiene íntegro.</p></div><a class="original-link" href="{source_link}">Ver Markdown original ↗</a></div>
      <details class="mobile-toc"><summary>Índice de contenidos <span aria-hidden="true">⌄</span></summary>{toc}</details>
      <div class="reading-columns"><aside class="toc-sidebar"><div class="toc-box"><span class="overline">EN ESTA PÁGINA</span><p>{escape(summary_label["key"])} · {total} bloques</p>{toc}<a class="toc-practice" href="{practice_url}">Practicar preguntas ↗</a></div></aside><div class="reading-main"><article class="notes-body">{rendered}</article>{related_html(page, output)}<div class="end-link"><span>Fin de esta guía</span><a href="{quiz_url}">Ahora, ponte a prueba <span aria-hidden="true">→</span></a></div></div></div>
    </div>
  </main>
  <footer><div class="wrap"><span>ROBO<span>TEST</span> / {escape(page["key"])}</span><span>Apuntes completos · Fórmulas en MathML · Funcionamiento sin conexión</span></div></footer>
  <a class="back-top" href="#hero-title" aria-label="Volver arriba">↑</a>
</body>
</html>
'''
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(page_html, encoding="utf-8")
    return output, total, rendered.count('<math display="')


if __name__ == "__main__":
    for parcial in PARCIALES:
        pages = parcial["lessons"] + parcial["guides"]
        for item in pages:
            item["parcial"] = parcial
        for item in pages:
            result, sections, formulas = build(item)
            print(f"{result.relative_to(ROOT)}: {sections} bloques, {formulas} fórmulas")
