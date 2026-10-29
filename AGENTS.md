# Normas para los apuntes de Robótica

## Numeración de secciones en los resúmenes (`Resumen_L*.md`)

- La sección **«Contenidos de la lección»** (índice/temario) **NUNCA lleva número**: `## Contenidos de la lección`.
- La numeración empieza en **1** con la primera sección de contenido real (p. ej. `## 1. Cinemática de robots con ruedas`, `### 1.1. ...`).
- Las referencias cruzadas dentro del texto («sección X.Y», «(X.Y)») y las de otros archivos que apunten al resumen (p. ej. `Soluciones_Parcial1.md`) deben coincidir con esa numeración.

## Organización de la carpeta

En la raíz solo están `Teoria/`, `Practicas/`, `web/` e `index.html`.

- `Teoria/Parcial-N/`: todo el material de estudio de ese parcial. El usuario suelta aquí los archivos y se colocan así:
  - `Lx-…/`: PDF de clase, `Resumen_Lx_….md` e `img/` de cada lección (Parcial-1 = L1–L3, Parcial-2 = L4 en adelante).
  - `Guias_practicas/`: guías de estudio de cada práctica (`P<n.m>_<tema>.md`).
  - `Examen/`: banco de preguntas, soluciones, `examenes_anteriores/` e `img/` de las preguntas.
- `Practicas/uma_robotics_2027/`: repositorio del profesor con los notebooks **sin resolver**; el usuario los va subiendo y se resuelven aquí, en el propio notebook. **No cambiar su estructura**: los notebooks importan `utils` con `sys.path.append("..")` / `("../..")`. Junto al notebook van solo la `Resolución y guía de entrega.md` y sus capturas en `img/`.
- `web/`: todo lo publicado en GitHub Pages. `web/assets/` (CSS/JS comunes), `web/parcialN/` (test en `index.html` + resúmenes y guías generados). `index.html` de la raíz es la portada que enlaza a cada parcial.

## Versiones web de los apuntes

- Los `.md` son la fuente; tras editarlos, regenera las páginas con `python3 web/generar_web.py` desde la raíz del proyecto. Se necesita Pandoc instalado para regenerar, no para abrir los HTML.
- Las lecciones y guías de cada parcial se declaran en `PARCIALES` dentro de `web/generar_web.py`; el HTML se escribe en `web/<parcial>/<nombre del .md>.html` y los enlaces relativos del Markdown (imágenes, notebooks, otros `.md`) se recalculan solos. No escribir HTML generado fuera de `web/` ni sobrescribir los HTML exportados de los notebooks.
- Al añadir una página nueva, enlázala también desde la portada (`index.html`) y desde el test del parcial.

## Enfoque para el Parcial 2 en adelante

- Cada lección lleva su **resumen completo** de teoría además de preguntas.
- Teoría: el examen pide **pequeños cálculos aplicando las fórmulas** → fórmulas destacadas y ejemplos numéricos resueltos paso a paso.
- Prácticas: el examen pregunta sobre **el código del notebook** (detectar la línea con el error, rellenar huecos) → las guías recorren el código línea a línea y el test incluye preguntas numéricas, de huecos en código y de localizar errores.
