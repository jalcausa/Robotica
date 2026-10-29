---
title: "L1 — Introducción a la robótica autónoma"
author: "Resumen completo de las diapositivas"
date: "21 de septiembre de 2026"
lang: es-ES
---

# L1 — Introducción a la robótica autónoma

## 1. Concepto de robot y alcance de la asignatura

El **Robot Institute of America** define un robot como:

> Un manipulador reprogramable y multifuncional, diseñado para mover materiales, piezas, herramientas o dispositivos especializados mediante movimientos programados para realizar una variedad de tareas.

Esta definición se ajusta sobre todo a los **robots industriales**, que suelen presentar estas características:

- Están fijados al suelo, por lo que no pueden cambiar su ubicación y su posición es conocida.
- Ejecutan movimientos muy precisos y rápidos.
- Repiten principalmente las mismas tareas.
- Trabajan en un espacio sencillo, estructurado y perfectamente conocido.

La asignatura **no se centra en este tipo de robot**, sino en una perspectiva de la robótica más relacionada con la **Inteligencia Artificial**, concretamente en los **robots móviles autónomos**.

Un robot móvil autónomo debería ser capaz de:

- Cambiar de posición dentro de un entorno del que no se conoce todo *a priori*.
- Tomar decisiones inteligentes a partir de datos sensoriales.

## 2. Tipos de robots autónomos según su locomoción

Los robots autónomos pueden clasificarse de acuerdo con su sistema de locomoción. Las diapositivas muestran distintas familias y configuraciones mecánicas —robots terrestres con ruedas o patas, robots aéreos, acuáticos y otras plataformas móviles—, aunque el curso se concentra principalmente en la **locomoción terrestre mediante ruedas**.

La elección de la locomoción condiciona:

- El modelo de movimiento del robot.
- Los actuadores necesarios.
- El tipo de terreno accesible.
- La estabilidad, velocidad y maniobrabilidad.
- Los sensores y estrategias de control apropiados.

## 3. Paradigmas de la robótica

### 3.1. Paradigma deliberativo: Sense–Plan–Act

El paradigma deliberativo sigue el ciclo **percibir–planificar–actuar**:

1. El robot usa sus sensores para construir un modelo explícito del mundo.
2. Emplea algoritmos de planificación para calcular acciones, idealmente óptimas.
3. Ejecuta el plan resultante.

**Ventaja principal:** permite razonar globalmente y buscar soluciones planificadas.

**Limitaciones:**

- Requiere mucha computación.
- Puede responder lentamente.
- Su desempeño se degrada en entornos dinámicos, porque el mundo puede cambiar mientras se calcula el plan.

### 3.2. Paradigma reactivo

En el paradigma reactivo se conectan directamente las entradas de los sensores con acciones, reglas o comportamientos. Tiene inspiración biológica y evita depender de una planificación global compleja.

**Ventajas:**

- Respuesta rápida.
- Robustez ante entornos dinámicos e inciertos.

**Limitaciones:**

- Capacidad reducida de planificación a largo plazo.
- Dificultad para resolver tareas complejas que exigen coordinación global o anticipación.

### 3.3. Paradigma híbrido

El paradigma híbrido combina los dos enfoques anteriores:

- Una capa deliberativa fija objetivos, planifica y toma decisiones a largo plazo.
- Una capa reactiva se ocupa de respuestas rápidas y en tiempo real.

Así se busca equilibrar **eficiencia, capacidad de planificación y adaptabilidad**. Es el enfoque más utilizado en la robótica moderna y el principal foco del curso.

## 4. Robótica probabilística

El curso adopta el enfoque híbrido, pero incorpora explícitamente la **incertidumbre** en los modelos, la percepción y el movimiento. Esta perspectiva recibe el nombre de **robótica probabilística**.

La idea fundamental es tratar matemáticamente la incertidumbre inevitable de:

- La percepción mediante sensores.
- La ejecución de movimientos.
- Los modelos del robot y del entorno.

Dicha incertidumbre se propaga hacia:

- El **estado del robot**, por ejemplo, su localización.
- La **representación del mundo**, por ejemplo, los mapas.
- La **planificación y la toma de decisiones**.

### 4.1. Razones para usar métodos probabilísticos

- Los modelos del mundo y de las acciones del robot son inexactos.
- Los sensores cometen errores y producen medidas ruidosas.
- El mundo real cambia: aparecen objetos móviles, perturbaciones y sucesos no previstos.
- Una representación probabilística permite obtener sistemas más robustos ante esas variaciones.

### 4.2. Limitaciones

- Elevado coste computacional.
- Posibilidad de asumir distribuciones de probabilidad que no representan bien la realidad.
- Frecuentemente se deben emplear soluciones aproximadas.

## 5. Preguntas fundamentales de la robótica móvil

### 5.1. ¿Dónde estoy?

Esta pregunta reúne dos problemas relacionados:

- **Localización:** determinar la posición del robot dentro de lugares ya conocidos.
- **Mapping/SLAM:** identificar qué hay en el espacio de trabajo —objetos, puntos de referencia y espacio libre— y construir un mapa. En SLAM se localiza el robot mientras se crea el mapa.

### 5.2. ¿Cómo llego de forma segura?

Incluye:

- **Evitación de obstáculos:** decidir cómo conducir sin colisionar.
- **Planificación de caminos:** calcular la mejor ruta para alcanzar un objetivo.

### 5.3. ¿Cómo resuelvo mi misión?

Corresponde a la **planificación de tareas**, es decir, descomponer la misión en objetivos y acciones coordinadas, establecer su orden y gestionar condiciones o dependencias.

## 6. Inteligencia Artificial y robótica

Un sistema inteligente necesita **encarnación física (*embodiment*)**: el software por sí solo no basta para alcanzar una inteligencia verdaderamente conectada con el mundo.

La **hipótesis de la encarnación**, atribuida en las diapositivas a Linda Smith (2005), sostiene que:

> La inteligencia emerge de la interacción de un agente con un entorno y como resultado de la actividad sensoriomotora.

El *embodiment* implica dos capacidades complementarias:

- **Modificar el mundo:** moverse, manipular objetos, hablar, etc.
- **Percibir el mundo.**

Por tanto, la robótica conecta un sistema de IA con el mundo mediante un **sistema sensoriomotor**.

### 6.1. Núcleo cognitivo, percepción y acción

En el esquema de un robot inteligente, el **núcleo cognitivo** incluye:

- Representación del conocimiento.
- Estimación del estado.
- Planificación.
- Deducción y razonamiento.
- Aprendizaje.
- Creatividad y lenguaje natural, entre otras capacidades.

En esta asignatura se presta especial atención a:

- Comprensión de escenas y autolocalización.
- Planificación de caminos.

El núcleo cognitivo se conecta con el mundo por dos vías:

- **Sense / percibir:** ver, oír, oler y tocar.
- **Act / actuar:** movimiento del robot, manipulación y comunicación.

Los **sensores y actuadores** establecen la interacción entre la inteligencia computacional y el mundo real.

## 7. Disciplinas relacionadas

La robótica es un campo interdisciplinar que integra:

- Aprendizaje automático.
- Ciencia cognitiva.
- Visión por computador.
- Ingeniería del software.
- Ingeniería mecánica.
- Teoría de control.

Las diapositivas enfatizan especialmente la creciente importancia de la **ingeniería mecánica**, el **aprendizaje automático** y la **teoría de control**.

## 8. Aplicaciones de los robots móviles

Los robots móviles se aplican en numerosos ámbitos: transporte, logística, exploración, inspección, asistencia, servicios, entornos domésticos, industria, medicina, agricultura, rescate y otros contextos donde una plataforma debe percibir, decidir y desplazarse autónomamente.

La presentación enlaza como ejemplo audiovisual: <https://www.youtube.com/watch?v=QwAYJPjW2gI>.

## 9. Programa de la asignatura

1. Introducción a la robótica autónoma.
2. Arquitectura de control del robot.
3. Modelos de movimiento del robot.
4. Sensores robóticos.
5. Localización de robots móviles.
6. Mapping.
7. SLAM.
8. Planificación de movimiento.

## 10. Evaluación

Existen dos modalidades.

### 10.1. Evaluación continua: primera convocatoria ordinaria

- **Pruebas: 8 puntos.**
  - Tres exámenes parciales tipo test sobre teoría y prácticas.
  - En cada examen parcial se exige al menos **3,5/10**.
  - La nota de esta parte es la media de los tres parciales y debe ser al menos **5/10**.
- **Prácticas: 2 puntos.**
  - La asistencia y la entrega puntual de las sesiones prácticas son obligatorias.

### 10.2. Evaluación no continua: segunda convocatoria ordinaria

- Un único examen tipo test que cubre teoría y prácticas.
- Entrega de las sesiones prácticas antes del examen.
