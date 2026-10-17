# Normas para los apuntes de Robótica

## Numeración de secciones en los resúmenes (`Resumen_L*.md`)

- La sección **«Contenidos de la lección»** (índice/temario) **NUNCA lleva número**: `## Contenidos de la lección`.
- La numeración empieza en **1** con la primera sección de contenido real (p. ej. `## 1. Cinemática de robots con ruedas`, `### 1.1. ...`).
- Las referencias cruzadas dentro del texto («sección X.Y», «(X.Y)») y las de otros archivos que apunten al resumen (p. ej. `Soluciones_Parcial1.md`) deben coincidir con esa numeración.

## Versiones web de los apuntes

- Los `.md` son la fuente; tras editarlos, regenera las páginas con `python3 "L3-Robot motion/Generar_Resumenes_Web.py"` desde la raíz del proyecto. Se necesita Pandoc instalado para regenerar, no para abrir los HTML.
- El generador crea los `Resumen_L*.html`, la guía web de ROS 2 y las guías `*_Guia_web.html` de las prácticas 3.1–3.3. No debe sobrescribir los HTML del notebook que ya existen con los nombres originales de las prácticas.
