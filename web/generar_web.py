import hashlib
import json
import os
import re
import subprocess
from html import escape, unescape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import quote, unquote

ROOT = Path(__file__).resolve().parent.parent
WEB = ROOT / "web"
PORTAL = ROOT / "index.html"
BASE_CSS = WEB / "assets/robotest.css"
STYLE = WEB / "assets/resumenes.css"
SCRIPT = WEB / "assets/resumenes.js"
INDEX_TITLES = {"Índice", "Contenidos de la lección"}  # Bloques que no cuentan como lectura en la ruta
TEORIA = ROOT / "Teoria"  # Teoria/Parcial-N/: lecciones, Guias_practicas/ y Examen/

# Cada parcial se publica en web/<key>/: su test es index.html y los resúmenes y guías van al lado.
PARCIALES = [
    {
        "key": "parcial1",
        "label": "Parcial 1",
        "lessons": [
            {
                "key": "L1",
                "source": TEORIA / "Parcial-1/L1-Introduction-to-Autonomous-Robotics/Resumen_L1_Introduccion_Robotica_Autonoma.md",
                "title": "Introducción a la robótica autónoma",
                "subtitle": "La idea de robot autónomo, las arquitecturas y las preguntas que guían la robótica móvil.",
            },
            {
                "key": "L2",
                "source": TEORIA / "Parcial-1/L2-Robot-Control-Architecture-and-ROS/Resumen_L2_Arquitecturas_Control_ROS2.md",
                "title": "Arquitecturas de control y ROS 2",
                "subtitle": "De los paradigmas y los árboles de comportamiento a los nodos, topics y herramientas ROS 2.",
            },
            {
                "key": "L3",
                "source": TEORIA / "Parcial-1/L3-Robot-motion/Resumen_L3_Movimiento_Robot.md",
                "title": "Movimiento del robot",
                "subtitle": "Cinemática, composición de poses, odometría y modelos probabilísticos explicados por bloques.",
            },
        ],
        "guides": [
            {
                "key": "P2.1",
                "lesson": "L2",
                "source": TEORIA / "Parcial-1/Guias_practicas/P2.1_ROS2_guia_rapida.md",
                "title": "ROS 2 y MVSim",
                "subtitle": "Guía de la práctica 2.1: mundo simulado, nodos, topics, TF y control por teclado.",
            },
            {
                "key": "P3.1",
                "lesson": "L3",
                "source": TEORIA / "Parcial-1/Guias_practicas/P3.1_Composicion_poses.md",
                "title": "Composición de poses",
                "subtitle": "Práctica 3.1: marcos locales, tcomp, transformaciones y el recorrido cuadrado.",
            },
            {
                "key": "P3.2",
                "lesson": "L3",
                "source": TEORIA / "Parcial-1/Guias_practicas/P3.2_Modelo_velocidad.md",
                "title": "Modelo basado en velocidad",
                "subtitle": "Práctica 3.2: arcos, caso recto, next_pose y límites del modelo.",
            },
            {
                "key": "P3.3",
                "lesson": "L3",
                "source": TEORIA / "Parcial-1/Guias_practicas/P3.3_Modelo_odometria.md",
                "title": "Modelo basado en odometría",
                "subtitle": "Práctica 3.3: encoders, jacobianos, propagación gaussiana y partículas.",
            },
        ],
    },
    {
        "key": "parcial2",
        "label": "Parcial 2",
        "quiz_by_page": True,  # El test del parcial 2 filtra por página (L5, P5.2…), no por lección y tipo
        "roadmap": True,
        "lessons": [
            {
                "key": "L4",
                "source": TEORIA / "Parcial-2/L4-Robot-sensing/Resumen_L4_Percepcion_Robot.md",
                "title": "Percepción del robot",
                "subtitle": "Sensores, modelos de observación de landmarks y láser, e incertidumbre, con ejemplos numéricos resueltos.",
            },
            {
                "key": "L5",
                "source": TEORIA / "Parcial-2/L5-Robot-Localization/Resumen_L5_Localizacion_Robot.md",
                "title": "Localización del robot",
                "subtitle": "Mínimos cuadrados, ICP y filtros de rejilla, Kalman, EKF y partículas, con todos los cálculos resueltos paso a paso.",
            },
        ],
        "guides": [
            {
                "key": "P4.1",
                "lesson": "L4",
                "source": TEORIA / "Parcial-2/Guias_practicas/P4.1_Landmarks.md",
                "title": "Modelos basados en landmarks",
                "subtitle": "Práctica 4.1: observaciones rango-bearing, cambio de coordenadas e incertidumbre, línea a línea.",
            },
            {
                "key": "P4.2",
                "lesson": "L4",
                "source": TEORIA / "Parcial-2/Guias_practicas/P4.2_Laser_scanner.md",
                "title": "Escáner láser",
                "subtitle": "Práctica 4.2: simulación de un láser 2D, del barrido polar a puntos en el mapa.",
            },
            {
                "key": "P4.3",
                "lesson": "L4",
                "source": TEORIA / "Parcial-2/Guias_practicas/P4.3_Playing_with_ROS2.md",
                "title": "Sensores con ROS 2",
                "subtitle": "Práctica 4.3: los sensores del TurtleBot3 en MVSim, el mensaje LaserScan y el árbol tf.",
            },
            {
                "key": "P5.2",
                "lesson": "L5",
                "source": TEORIA / "Parcial-2/Guias_practicas/P5.2_EKF_Localization.md",
                "title": "Localización con EKF",
                "subtitle": "Práctica 5.2: predicción y corrección del filtro de Kalman extendido, línea a línea.",
            },
            {
                "key": "P5.3",
                "lesson": "L5",
                "source": TEORIA / "Parcial-2/Guias_practicas/P5.3_Particle_Filter.md",
                "title": "Filtro de partículas",
                "subtitle": "Práctica 5.3: predicción, verosimilitudes, estimación y remuestreo SIR, línea a línea.",
            },
            {
                "key": "P5.4",
                "lesson": "L5",
                "source": TEORIA / "Parcial-2/Guias_practicas/P5.4_AMCL_ROS2.md",
                "title": "AMCL en ROS 2",
                "subtitle": "Práctica 5.4: comandos ROS 2, tópicos, tf, partículas y recuperación de AMCL.",
            },
            {
                "key": "P6.3",
                "lesson": "L6",
                "source": TEORIA / "Parcial-2/Guias_practicas/P6.3_Occupancy_grid_mapping.md",
                "title": "Mapas de rejilla de ocupación",
                "subtitle": "Práctica 6.3: extremos de los haces, Bresenham, modelo inverso del sensor y log odds, línea a línea.",
            },
        ],
        # Repaso de todo el parcial: va en el menú y como último paso de estudio de la ruta, antes de la pasada completa.
        "review": {
            "key": "Repaso",
            "source": TEORIA / "Parcial-2/Resumen_General_Parcial2.md",
            "title": "Resumen general del Parcial 2",
            "subtitle": "Lo imprescindible de L4, L5 y las siete prácticas en un solo sitio, con un ejercicio tipo resuelto de cada clase de pregunta.",
        },
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


def asset(output, path):
    # La versión cambia con el contenido para que el navegador no use una copia vieja.
    return f'{link(output, path)}?v={hashlib.md5(path.read_bytes()).hexdigest()[:8]}'


def study_minutes(page):
    words = len(page["source"].read_text(encoding="utf-8").split())
    speed = 110 if page in page["parcial"]["guides"] else 90
    return max(5, int(words / speed / 5 + 0.5) * 5)


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
        path, _, query = path.partition("?")
        url = link(output, source.parent / unquote(path))
        suffix = ("?" + escape(query, quote=True) if query else "") + ("#" + escape(fragment, quote=True) if fragment else "")
        return f'{attribute}="{url}{suffix}"'

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
    if page is parcial.get("review"):
        cards = "".join(
            f'<a class="related-card" href="{link(output, page_output(item))}">'
            f'<span>{escape(item["key"])} · {"TEORÍA" if item in parcial["lessons"] else "PRÁCTICA"}</span><strong>{escape(item["title"])}</strong>'
            '<small>Ver el detalle <span aria-hidden="true">↗</span></small></a>'
            for item in parcial["lessons"] + parcial["guides"]
        )
        return f'<section class="related"><span class="overline">EL DETALLE DE CADA TEMA</span><h2>Resúmenes y guías</h2><p>Si un ejercicio se te atasca, aquí está la explicación completa.</p><div class="related-grid">{cards}</div></section>'
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
    lesson = next((item for item in parcial["lessons"] if item["key"] == page["lesson"]), None)  # La lección puede no tener resumen todavía
    companions = [item for item in parcial["guides"] if item["lesson"] == page["lesson"] and item != page]
    cards = [f'<a class="related-card" href="{link(output, page_output(lesson))}"><span>{escape(lesson["key"])} · TEORÍA</span><strong>{escape(lesson["title"])}</strong><small>Volver al resumen ↗</small></a>'] if lesson else []
    cards.extend(
        f'<a class="related-card" href="{link(output, page_output(item))}">'
        f'<span>{escape(item["key"])} · PRÁCTICA</span><strong>{escape(item["title"])}</strong><small>Leer guía ↗</small></a>'
        for item in companions
    )
    if not cards:
        return ""
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
    if active not in {lesson["key"] for lesson in parcial["lessons"]}:
        active = page["key"]  # Guía de una lección que aún no tiene resumen
    roadmap = parcial.get("roadmap")
    blocks = [identifier for level, identifier, title in outline.headings if level == 2 and title not in INDEX_TITLES]
    review = parcial.get("review")
    is_review = page is review
    menu = f'<a href="{link(output, PORTAL)}">Inicio</a>' + (f'<a href="{link(output, quiz_page(parcial))}#ruta">Mi ruta</a>' if roadmap else "") + "".join(
        f'<a href="{link(output, page_output(item))}"'
        f'{" aria-current=page" if item["key"] == active else ""}>{item["key"]}</a>'
        for item in parcial["lessons"] + ([review] if review else [])
    )
    quiz_link = link(output, quiz_page(parcial))
    if is_review:
        quiz_url = practice_url = f'{quiz_link}#filters'
    elif parcial.get("quiz_by_page"):
        quiz_url = practice_url = f'{quiz_link}?lesson={page["key"]}#filters'
    else:
        quiz_url = f'{quiz_link}?lesson={active}#filters'
        practice_url = f'{quiz_link}?lesson={active}&amp;kind=Pr%C3%A1ctica#filters'
    label = "RESUMEN GENERAL" if is_review else "GUÍA DE PRÁCTICAS" if page in parcial["guides"] else "RESUMEN DE LA LECCIÓN"
    source_link = link(output, source)
    roadmap_key = f'robotica-ruta-{parcial["key"]}-v1'
    study_button = (
        f'<button type="button" class="button subtle study-check" data-roadmap-key="{roadmap_key}" '
        f'data-step="study:{escape(page["key"], quote=True)}" aria-pressed="false">Marcar como estudiado</button>'
        if roadmap else ""
    )
    if is_review:
        companions = parcial["lessons"] + parcial["guides"]
        companions_title = "Todo el parcial"
    elif page in parcial["lessons"]:
        companions = [item for item in parcial["guides"] if item["lesson"] == page["key"]]
        companions_title = f'Prácticas de {page["key"]}'
    else:
        companions = [item for item in parcial["lessons"] if item["key"] == page["lesson"]]
        companions += [item for item in parcial["guides"] if item["lesson"] == page["lesson"] and item != page]
        companions_title = f'Resto del tema {page["lesson"]}'
    companions_json = json.dumps([
        {"key": item["key"], "title": item["title"], "href": link(output, page_output(item)), "lesson": item in parcial["lessons"]}
        for item in companions
    ], ensure_ascii=False)
    tracker = (
        f'<section id="study-tracker" class="study-tracker" aria-label="Tu progreso" data-roadmap-key="{roadmap_key}" '
        f'data-page="{escape(page["key"], quote=True)}" data-minutes="{study_minutes(page)}" '
        f'data-route-url="{link(output, quiz_page(parcial))}#ruta" '
        f'data-companions-title="{escape(companions_title, quote=True)}" data-companions="{escape(companions_json, quote=True)}"></section>'
        if roadmap else ""
    )
    hero_actions = f'<div class="hero-actions"><a class="button primary" href="#apuntes">Empezar a leer <span aria-hidden="true">↘</span></a>{study_button}<a class="button subtle" href="{quiz_url}">Practicar el tema</a></div>'
    end_actions = (
        f'<div class="end-actions">{study_button}<a href="{quiz_url}">Ahora, ponte a prueba <span aria-hidden="true">→</span></a></div>'
        if roadmap else f'<a href="{quiz_url}">Ahora, ponte a prueba <span aria-hidden="true">→</span></a>'
    )
    toc = f'<nav class="toc-items" aria-label="Apartados de la página">{chapters}</nav>'
    page_html = f'''<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>{escape(page["key"])} · {escape(page["title"])} | RoboTest</title>
  <link rel="stylesheet" href="{asset(output, BASE_CSS)}">
  <link rel="stylesheet" href="{asset(output, STYLE)}">
  <script src="{asset(output, SCRIPT)}" defer></script>
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
        {hero_actions}
        <div class="lesson-facts"><span>{len(blocks) if roadmap else total} bloques de lectura</span><span>{content_feature}</span><span>Sin conexión</span></div>
      </div>
      <div class="hero-art" aria-hidden="true"><div class="grid-plane"></div><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="robot-icon"><span class="eye"></span><span class="eye"></span></div><div class="beacon beacon-a"></div><div class="beacon beacon-b"></div><span class="art-label label-a">SENSE</span><span class="art-label label-b">PLAN</span><span class="art-label label-c">ACT</span></div>
    </section>
    <div class="reading-wrap" id="apuntes">
      {tracker}
      <div class="reading-intro"><div><span class="overline">{escape(page["key"])} / LECTURA</span><h2>Todo el contenido, mejor organizado.</h2><p>Índice navegable, secciones cortas y fórmulas legibles. El contenido del apunte original se mantiene íntegro.</p></div><a class="original-link" href="{source_link}">Ver Markdown original ↗</a></div>
      <details class="mobile-toc"><summary>Índice de contenidos <span aria-hidden="true">⌄</span></summary>{toc}</details>
      <div class="reading-columns"><aside class="toc-sidebar"><div class="toc-box"><span class="overline">EN ESTA PÁGINA</span><p>{escape(active)} · {total} bloques</p>{toc}<a class="toc-practice" href="{practice_url}">Practicar preguntas ↗</a></div></aside><div class="reading-main"><article class="notes-body">{rendered}</article>{related_html(page, output)}<div class="end-link"><span>Fin de esta guía</span>{end_actions}</div></div></div>
    </div>
  </main>
  <footer><div class="wrap"><span>ROBO<span>TEST</span> / {escape(page["key"])}</span><span>Apuntes completos · Fórmulas en MathML · Funcionamiento sin conexión</span></div></footer>
  <a class="back-top" href="#hero-title" aria-label="Volver arriba">↑</a>
</body>
</html>
'''
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(page_html, encoding="utf-8")
    return output, total, rendered.count('<math display="'), blocks


if __name__ == "__main__":
    for parcial in PARCIALES:
        # Las páginas cuyo .md aún no existe se omiten (y no se enlazan) hasta que se escriba.
        for group in ("lessons", "guides"):
            for item in parcial[group]:
                if not item["source"].exists():
                    print(f"Omitida (falta {item['source'].relative_to(ROOT)})")
            parcial[group] = [item for item in parcial[group] if item["source"].exists()]
        if parcial.get("review") and not parcial["review"]["source"].exists():
            print(f"Omitida (falta {parcial['review']['source'].relative_to(ROOT)})")
            del parcial["review"]
        pages = parcial["lessons"] + parcial["guides"] + ([parcial["review"]] if parcial.get("review") else [])
        for item in pages:
            item["parcial"] = parcial
        page_stats = {}
        for item in pages:
            result, sections, formulas, blocks = build(item)
            page_stats[item["key"]] = blocks
            print(f"{result.relative_to(ROOT)}: {sections} bloques, {formulas} fórmulas")
        if parcial.get("roadmap"):
            ordered_pages = []
            added = set()
            for lesson in parcial["lessons"]:
                ordered_pages.append(lesson)
                added.add(lesson["key"])
                for guide in parcial["guides"]:
                    if guide["lesson"] == lesson["key"]:
                        ordered_pages.append(guide)
                        added.add(guide["key"])
            ordered_pages.extend(item for item in parcial["guides"] if item["key"] not in added)
            data_pages = []
            for item in ordered_pages:
                data_pages.append({
                    "key": item["key"],
                    "type": "lesson" if item in parcial["lessons"] else "guide",
                    "title": item["title"],
                    "href": page_output(item).name,
                    "minutes": study_minutes(item),
                    "blocks": len(page_stats[item["key"]]),
                    "sections": page_stats[item["key"]],
                })
            route_data = {
                "storageKey": f'robotica-ruta-{parcial["key"]}-v1',
                "quizKey": f'robotica-practica-{parcial["key"]}-v1',
                "pages": data_pages,
            }
            if parcial.get("review"):
                review = parcial["review"]
                route_data["review"] = {
                    "key": review["key"],
                    "type": "review",
                    "title": review["title"],
                    "href": page_output(review).name,
                    "minutes": study_minutes(review),
                    "blocks": len(page_stats[review["key"]]),
                    "sections": page_stats[review["key"]],
                }
            output = WEB / parcial["key"] / "ruta-data.js"
            output.write_text(
                "window.RUTA = " + json.dumps(route_data, ensure_ascii=False) + ";\n",
                encoding="utf-8",
            )
            print(f"{output.relative_to(ROOT)}: {len(data_pages)} páginas de ruta")
