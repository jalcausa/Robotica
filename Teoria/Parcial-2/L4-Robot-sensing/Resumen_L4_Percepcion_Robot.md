---
title: "L4 — Percepción del robot (Robot sensing)"
author: "Resumen completo de las diapositivas (versión v13)"
date: "29 de octubre de 2026"
lang: es-ES
---

# L4 — Percepción del robot (Robot sensing)

**Bibliografía de referencia:**

- *Probabilistic Robotics*. S. Thrun, W. Burgard, D. Fox. MIT Press, 2005 (la diapositiva pone 2001).
- *Simultaneous Localization and Mapping for Mobile Robots: Introduction and Methods*. J. A. Fernández-Madrigal y J. L. Blanco Claraco. IGI-Global, 2013.

> **Notación usada en estos apuntes:** las negritas son vectores. $\mathbf{x} = [x, y, \theta]^T$ es la pose del robot (o del sensor); $\mathbf{m}$ es el mapa (o un landmark $\mathbf{m}_i = [x_i, y_i]^T$); $\mathbf{z}$ es una observación; $\hat{\ }$ indica valor **predicho**; $\oplus$ es la composición de poses (L3); $\mathcal{N}(\mu, \sigma^2)$ es una gaussiana. Las diapositivas usan para el ángulo medido (*bearing*) tanto $\theta_i$ como $\alpha$: aquí se usa **$\alpha$ para el bearing** y $\theta$ **solo para la orientación del robot**, para no confundirlos.

> **Cómo estudiar este tema para el examen:** el parcial pide **pequeños cálculos aplicando las fórmulas** (distancia por tiempo de vuelo, rango y bearing predichos, posición global de un landmark, propagar una covarianza con jacobianos, evaluar una gaussiana o una mezcla del *beam model*...). Cada fórmula importante va acompañada de un **ejemplo resuelto paso a paso**. Al final están la **chuleta de fórmulas** (sección 9) y los **errores típicos** (sección 10).

---

## Contenidos de la lección

1. **Tipos de sensores para robótica:**
   - Clasificación.
   - GPS.
   - Sonares.
   - Lidars (escáneres láser).
   - Cámaras.
2. **Modelos probabilísticos de sensores:**
   - Modelos de sensores de landmarks.
   - Modelos de sensores basados en *scans*.

---

## 1. Clasificación de los sensores

### 1.1. Propioceptivos frente a exteroceptivos

![Clasificación de sensores: propioceptivos y exteroceptivos](img/01_clasificacion_sensores.png)

| Tipo | Qué miden | Ejemplos |
|---|---|---|
| **Propioceptivos** | El **estado interno** del robot o su **movimiento**: batería, posición de las ruedas, aceleración, inclinación... | Encoder de eje (posición de rueda), **IMU** (acelerómetro + giróscopo), potenciómetro (ángulo de articulación), inclinómetro, sensor de batería |
| **Exteroceptivos** — **los que estudiaremos** | Propiedades del **entorno exterior**: distancia y/o ángulo a objetos, intensidad de luz reflejada... | Cámara (visión 2D/3D), escáner láser (LiDAR), cámara RGB-D (profundidad + color), sonar, infrarrojos |

> **Aclaración:** los encoders de L3 (odometría) son **propioceptivos**: miden cuánto han girado las ruedas, no nada del entorno. Por eso acumulan deriva y hace falta un sensor exteroceptivo para corregir la pose.

### 1.2. Sensores exteroceptivos pasivos frente a activos

| Tipo | Energía | Ejemplos | Ventajas / inconvenientes |
|---|---|---|---|
| **Pasivos** | Usan energía que **viene del entorno** (luz ambiente, señales de satélite) | Cámaras, receptor GNSS/GPS | No emiten nada; dependen de las condiciones del entorno (luz...) |
| **Activos** | **Emiten su propia energía** (luz, radio, sonido) y miden lo que vuelve | LiDAR (pulsos láser), sonar, cámara RGB-D | **Mejor rendimiento con luz cambiante**, pero **más consumo** |

> **Ojo:** el GPS es **pasivo**: el receptor solo escucha las señales de los satélites, no emite nada.

### 1.3. Landmarks y balizas

- **Landmark:** un **elemento o característica reconocible** del entorno cuya observación se puede **asociar a un elemento de un mapa**. Ejemplos: un edificio, una montaña (elemento natural), puntos clave 3D distintivos de una imagen.
  - **Ventajas:** **no requieren instalación** (se reutilizan elementos existentes) y son **flexibles y adaptables** a entornos cambiantes.
- **Baliza (*beacon*, landmark artificial):** un landmark **instalado o designado a propósito** para facilitar la detección, identificación y localización. Ejemplos: satélite GPS (posición conocida), patrón visual (QR, datamatrix), reflector, antena de radio/WiFi.
  - **Ventajas:** dan **posicionamiento absoluto** (respecto a las coordenadas conocidas de las balizas) y permiten **algoritmos sencillos y eficientes**.

### 1.4. Medidas geométricas en robótica

![Rango, bearing, rango + bearing, triangulación y trilateración](img/02_medidas_geometricas.png)

| Medida | Qué da | Fórmula | Ejemplos de sensor |
|---|---|---|---|
| **Rango** (*range*) | Distancia a un objeto/landmark | $z = r$ | Sonar, LiDAR, pseudorango GPS |
| **Bearing** (marcación, dirección) | Ángulo al landmark respecto a la orientación del robot | $z = \alpha$ | Cámara monocular |
| **Rango + bearing** | Ambas | $\mathbf{z} = [r, \alpha]^T$ | Observación de LiDAR 2D, landmark con estéreo/RGB-D |

Con varias balizas **conocidas** se puede calcular la posición de un punto desconocido:

- **Triangulación:** se miden **ángulos** al punto desde balizas conocidas; el punto está en el cruce de las rectas.
- **Trilateración:** se miden **distancias** a balizas conocidas; el punto está en la **intersección de circunferencias** (esferas en 3D). Con **dos** circunferencias en 2D hay en general **dos** soluciones posibles (las dos intersecciones).

> **Ejemplo resuelto (trilateración 2D).** Dos balizas en $\mathbf{b}_1 = (0, 0)$ y $\mathbf{b}_2 = (6, 0)$ m. El robot mide $r_1 = 5$ m y $r_2 = 5$ m. ¿Dónde está?
>
> 1. Ecuaciones de las circunferencias: $x^2 + y^2 = 25$ y $(x-6)^2 + y^2 = 25$.
> 2. Restando la segunda a la primera: $x^2 - (x-6)^2 = 0 \Rightarrow 12x - 36 = 0 \Rightarrow x = 3$.
>    En general, con $\mathbf{b}_2 = (d, 0)$: $x = \dfrac{r_1^2 - r_2^2 + d^2}{2d} = \dfrac{25 - 25 + 36}{12} = 3$.
> 3. Sustituyendo: $y^2 = 25 - 9 = 16 \Rightarrow y = \pm 4$.
>
> **Resultado:** $(3, 4)$ o $(3, -4)$. Con dos distancias quedan **dos candidatos**; hace falta una **tercera baliza** (o saber en qué semiplano está el robot) para elegir. Es la misma idea que el GPS en 3D (sección 2.1).

---

## 2. Sistema de posicionamiento global (GPS)

### 2.1. Principio de funcionamiento

Se usa mucho para **posicionar robots en exteriores**.

1. Los **satélites actúan como balizas artificiales móviles**: transmiten señales con marca de tiempo y su posición es conocida.
2. Orbitan a unos **20 200 km** de altitud, con un periodo orbital de unas **12 horas** (seis planos orbitales).
3. El posicionamiento se basa en **trilateración**: la posición se obtiene a partir de medidas de distancia (**pseudorangos**) a varios satélites.
4. Hacen falta **al menos cuatro satélites** para estimar la **posición 3D y el desfase del reloj del receptor**.

**Trilateración con satélites:** 1 satélite → la posición está en una **esfera**; 2 satélites → en la **circunferencia** intersección de dos esferas; 3 satélites → en un **punto** (caso ideal).

> **¿Por qué 4 y no 3?** Hay **4 incógnitas**: $x, y, z$ y el **error del reloj del receptor** $\delta t$. El receptor no lleva un reloj atómico, así que la distancia que mide está sesgada por $c\,\delta t$ (por eso se llama **pseudo**rango). Cuatro ecuaciones para cuatro incógnitas.

> **Ejemplo resuelto (por qué importa tanto el reloj).** La distancia se calcula como $r = c\,\Delta t$ con $c \approx 3 \times 10^8$ m/s.
>
> - Error de reloj de $1\ \mu\text{s} = 10^{-6}$ s: error en distancia $= 3 \times 10^8 \cdot 10^{-6} = 300$ m.
> - Error de reloj de $10$ ns $= 10^{-8}$ s: error en distancia $= 3 \times 10^8 \cdot 10^{-8} = 3$ m.
>
> Un error minúsculo de tiempo se convierte en cientos de metros: por eso el desfase del reloj se trata como una incógnita más.

### 2.2. Señal de los satélites y segmento de control

- Cada satélite **difunde ondas de radio codificadas** (en varias frecuencias) que contienen:
  - La **identidad y la posición** del satélite.
  - La **fecha y hora** de envío de la señal (reloj atómico preciso).
- **Segmento de control:** red mundial de **instalaciones en tierra** que vigilan los satélites y les envían correcciones y órdenes:
  1. **Estaciones de monitorización:** siguen los satélites y vigilan sus señales.
  2. **Estación de control maestra (MCS):** calcula correcciones y genera órdenes.
  3. **Subida a los satélites:** las antenas de tierra envían correcciones y órdenes a los satélites.

### 2.3. Fuentes de error y precisión típica

![Errores del GPS, efecto cañón urbano y precisión de GPS, DGPS y RTK](img/03_gps_errores.png)

**Principales fuentes de error:**

- **Sincronización de tiempos** (relojes).
- **Efectos atmosféricos** (ionosfera / troposfera).
- **Multitrayecto** (*multipath*): reflexiones en edificios, terreno...
- **Visibilidad limitada de satélites** (árboles, cañones urbanos).

**Efecto cañón urbano:** entre edificios altos llegan pocas señales directas y muchas **reflejadas** (multitrayecto), que recorren más distancia y falsean el pseudorango.

| Modalidad | Cómo funciona | Precisión típica |
|---|---|---|
| **GPS autónomo** (*stand-alone*, SPS) | Sin correcciones adicionales | **3–10 m** |
| **GPS diferencial (DGPS)** | Usa una **estación de referencia cercana** que envía correcciones (radio o internet) | **0,5–3 m** |
| **RTK GPS** | Medidas de **fase de la portadora** + correcciones **en tiempo real** de una estación de referencia | **1–5 cm** |

---

## 3. Sensores de rango

### 3.1. Sonar: principio de medida (tiempo de vuelo)

Los primeros sistemas de medida por ultrasonidos los usó **Polaroid** para el autoenfoque de sus cámaras (años 70, p. ej. la SX-70).

**Funcionamiento:**

1. El emisor envía un **pulso ultrasónico** corto (**> 20 kHz**).
2. El pulso se **refleja** en un obstáculo y lo detecta el receptor.
3. Se mide el **tiempo de ida y vuelta** $\Delta t$ para estimar la distancia (**tiempo de vuelo, ToF**).

$$
\boxed{\,r = \frac{c_s\,\Delta t}{2}\,}
$$

| Símbolo | Significado | Unidades |
|---|---|---|
| $r$ | Distancia al obstáculo | m |
| $c_s$ | Velocidad del sonido en el aire ($\approx 343$ m/s a 20 °C) | m/s |
| $\Delta t$ | Tiempo de **ida y vuelta** | s |

> **El 2 del denominador:** el sonido recorre la distancia **dos veces** (ida y vuelta). Olvidarlo duplica la distancia.

> **Ejemplo resuelto.** Un sonar recibe el eco $\Delta t = 10$ ms después de emitir. ¿A qué distancia está el obstáculo?
>
> $r = \dfrac{343 \cdot 0{,}010}{2} = \dfrac{3{,}43}{2} = 1{,}715$ m.
>
> **Al revés:** si el obstáculo está a $r = 2$ m, el eco tarda $\Delta t = \dfrac{2r}{c_s} = \dfrac{4}{343} \approx 11{,}66$ ms.

### 3.2. Sonar: haz, situaciones típicas, ventajas y limitaciones

- El **ancho de haz efectivo es de unos 30°** (lóbulo principal), pero hay **lóbulos secundarios**. En el **modelo simplificado** el haz es un cono de apertura $\beta \approx 30°$ y se ignoran los lóbulos secundarios.

![Situaciones típicas de medida del sonar y mapa construido con sonar](img/04_sonar_situaciones.png)

**Situaciones típicas de medida:**

| Situación | Qué ocurre |
|---|---|
| **Distancia precisa** | Pared perpendicular al haz: se mide bien $r$ |
| **Baja resolución lateral** | Se detecta el **objeto más cercano dentro del haz**, sin saber en qué punto del cono está |
| **Reflexión especular / eco perdido** | Las superficies lisas pueden reflejar el sonido **lejos del sensor** → no hay eco |

En un **mapa construido con sonar** aparecen: medidas de **rango máximo** (no volvió el eco), **esquinas** mal medidas y **obstáculos inexistentes** por reflexiones.

| Características clave | Limitaciones |
|---|---|
| **Bajo coste**, muy disponible | **Mala resolución angular** (haz ≈ 30°): dos objetos a la misma distancia separados lateralmente no se distinguen |
| **Compacto**, fácil de integrar | **Sensible al tipo de superficie:** las superficies especulares desvían el sonido → eco débil o ninguno |
| **Bajo consumo** | **Las esquinas se pueden perder:** las esquinas abiertas no devuelven suficiente sonido |
| **Alcance corto/medio:** típicamente **2–4 m** | **Reflexiones múltiples:** el sonido rebota en varias superficies → ecos espurios y distancias erróneas |
| Útil para **detección de obstáculos** y evitar colisiones | |

> **Ejemplo resuelto (resolución lateral).** ¿Qué anchura cubre el haz de un sonar de $\beta = 30°$ a $r = 2$ m?
>
> Anchura $= 2\,r\tan(\beta/2) = 2 \cdot 2 \cdot \tan 15° = 4 \cdot 0{,}268 \approx 1{,}07$ m. Cualquier objeto dentro de esa franja de ≈ 1 m da la misma lectura: por eso la resolución lateral es mala. Compáralo con el LiDAR en el ejemplo de la sección 3.4.

### 3.3. Infrarrojos (triangulación de luz)

- Se basan en la **triangulación de luz**: un **emisor IR** ilumina el objeto y un **array de detectores IR** (tras una lente) recibe el rayo reflejado. La posición en el array da el **ángulo detectado** $\alpha$ y, conocida la separación entre emisor y detector (**línea base** $b$), **la distancia se calcula a partir del ángulo**.
- **Características:** pequeños, baratos y de bajo consumo; **alcance de unos 2 m**; **buena resolución angular** (haz más estrecho que el sonar).
- **Limitaciones:** sensibles a objetos **transparentes, brillantes y negros**, y a la **luz solar**.

> **Aclaración geométrica (no viene en las diapositivas):** si el emisor lanza el rayo perpendicular a la línea base y el rayo reflejado llega al detector formando un ángulo $\alpha$ con la línea base, el triángulo rectángulo da $r = b\tan\alpha$. Por ejemplo, con $b = 2$ cm y $\alpha = 80°$: $r = 0{,}02 \cdot \tan 80° \approx 0{,}113$ m; con $\alpha = 85°$: $r \approx 0{,}229$ m. Cuanto más lejos está el objeto, más se acerca $\alpha$ a 90° y un mismo error de ángulo produce más error de distancia: por eso su alcance es corto.

### 3.4. Escáner láser (LiDAR)

**Componentes:** fuente láser, **espejo giratorio** (escáner), receptor (**fotodiodo**). El espejo barre el haz por el entorno (p. ej. 360°) y el resultado es una **nube de puntos 2D/3D**.

**Medida de distancia (tiempo de vuelo):**

$$
\boxed{\,r = \frac{c\,\Delta t}{2}\,}
\qquad c \approx 3 \times 10^8\ \text{m/s (velocidad de la luz)}, \quad \Delta t:\ \text{tiempo de ida y vuelta}
$$

El pulso láser es **infrarrojo cercano** (no visible).

**Prestaciones:**

| Característica | Valor típico |
|---|---|
| **Alcance** | De unos pocos metros a **200 m o más**, según el sensor y la reflectividad del objetivo |
| **Precisión en distancia** | Centimétrica (**~1–5 cm**) |
| **Resolución angular** | Haz estrecho (**0,1°–1°**): medidas espaciales detalladas |
| **Coste** | Más caro que los ultrasonidos, pero bajando rápido (industria del automóvil, producción en masa) |

**Comparación con los ultrasonidos:**

| LiDAR (típico) | Ultrasonidos (típico) |
|---|---|
| Haz estrecho (0,1°–1°) | Haz ancho (≈ 30°) |
| Alta resolución angular | Mala resolución angular |
| Nubes de puntos 2D/3D detalladas | Solo distancia dentro del haz |
| Largo alcance (hasta 200 m o más) | Alcance corto/medio (≤ 4 m) |
| Precisión centimétrica | Menor coste |

**Limitaciones del LiDAR:**

- **Condiciones ambientales:** lluvia, niebla, polvo o humo degradan el rendimiento (dispersión y atenuación del haz).
- **Superficies poco reflectantes:** objetos oscuros o absorbentes (moqueta negra, cristal) devuelven señal débil o ninguna.
- **Reflexiones especulares:** superficies brillantes (espejos, metal pulido) desvían el haz.
- **Objetos en movimiento:** el movimiento durante el barrido distorsiona la nube de puntos.

> **Ejemplo resuelto (resolución angular del LiDAR).**
>
> - Un LiDAR con campo de visión de 270° y resolución de 0,25° da $\dfrac{270}{0{,}25} + 1 = 1081$ haces por barrido.
> - Separación entre puntos de haces contiguos a $r = 10$ m: $s \approx r\,\Delta\alpha = 10 \cdot 0{,}25 \cdot \dfrac{\pi}{180} \approx 0{,}044$ m $= 4{,}4$ cm.
>
> Frente al ≈ 1 m de «mancha» del sonar a solo 2 m (sección 3.2): esa es la diferencia de resolución angular. Recuerda pasar los grados a **radianes** al hacer $s = r\,\Delta\alpha$.

### 3.5. Técnicas de medida del LiDAR: ToF pulsado y desplazamiento de fase

![Técnicas de medida del LiDAR: tiempo de vuelo y desplazamiento de fase](img/05_lidar_tecnicas_medida.png)

| | **Tiempo de vuelo pulsado (ToF)** | **Desplazamiento de fase (modulación en amplitud)** |
|---|---|---|
| Qué se emite | **Pulsos** láser cortos | Luz láser **modulada de forma continua** |
| Qué se mide | El tiempo de ida y vuelta $\Delta t$ | El **desfase** $\Delta\phi$ de la señal recibida |
| Fórmula | $r = \dfrac{c\,\Delta t}{2}$ | $r = \dfrac{c\,\Delta\phi}{4\pi f_m}$ |
| Características | Medida **directa** del tiempo de propagación; apto para **largo alcance** (cientos de metros) | Medida **indirecta** del tiempo; **alta precisión** a corto/medio alcance; **el rango es ambiguo** más allá de $\dfrac{c}{2 f_m}$ |
| Uso típico | Muchos LiDAR de **conducción autónoma** | LiDAR de corto/medio alcance (interiores, robótica) |

Símbolos de la fórmula de fase: $c$ velocidad de la luz (m/s), $\Delta\phi$ desfase **en radianes**, $f_m$ frecuencia de modulación (Hz).

> **De dónde sale la fórmula de fase:** un desfase $\Delta\phi$ equivale a un retraso $\Delta t = \dfrac{\Delta\phi}{2\pi f_m}$. Sustituyendo en $r = c\,\Delta t / 2$: $r = \dfrac{c\,\Delta\phi}{4\pi f_m}$. Como la fase solo se mide entre $0$ y $2\pi$, el rango máximo sin ambigüedad es $r_{max} = \dfrac{c \cdot 2\pi}{4\pi f_m} = \dfrac{c}{2 f_m}$.

> **Ejemplo resuelto (ToF).** Un LiDAR mide $\Delta t = 66{,}7$ ns.
>
> $r = \dfrac{3 \times 10^8 \cdot 66{,}7 \times 10^{-9}}{2} = \dfrac{20{,}01}{2} \approx 10{,}0$ m.
>
> **Al revés:** un objeto a 15 m produce $\Delta t = \dfrac{2 \cdot 15}{3 \times 10^8} = 10^{-7}$ s $= 100$ ns. Hay que medir tiempos de nanosegundos: 1 ns de error son 15 cm.

> **Ejemplo resuelto (desplazamiento de fase).** $f_m = 10$ MHz y se mide $\Delta\phi = \pi/2$ rad.
>
> 1. Distancia: $r = \dfrac{3 \times 10^8 \cdot \pi/2}{4\pi \cdot 10^7} = \dfrac{3 \times 10^8}{8 \times 10^7} = 3{,}75$ m.
> 2. Rango sin ambigüedad: $r_{max} = \dfrac{c}{2 f_m} = \dfrac{3 \times 10^8}{2 \times 10^7} = 15$ m.
> 3. **Ambigüedad:** un objeto a $3{,}75 + 15 = 18{,}75$ m produce **el mismo** desfase ($\pi/2 + 2\pi$) y el sensor leería 3,75 m.

### 3.6. Ejemplos de LiDAR

**LiDAR 2D para robots móviles: Hokuyo UTM-30LX.** Un diodo láser IR emite el haz, un **espejo giratorio** lo barre en el **plano horizontal** y un fotodetector recibe el reflejo.

| Especificación | Valor |
|---|---|
| Alcance de detección | **30 m** (típico, máx.) |
| Campo de visión (FOV) | **270°** (quedan **90° de zona ciega** detrás) |
| Entorno | Apto para exteriores |
| Tamaño / peso | 60 × 60 × 87 mm / 370 g |

El resultado de un barrido es un conjunto de puntos $(r_k, \alpha_k)$ que, pasados a cartesianas (sección 6.6), dibujan las paredes y objetos que rodean al robot.

**LiDAR 3D:** cada vez más populares en coches autónomos (p. ej. el **Waymo**: LiDAR de 360° en el techo con alcance de más de 300 m y cuatro LiDAR perimetrales de corto alcance) y en robots (humanoides y cuadrúpedos de Unitree). Ejemplo: Ouster OS1. Cada vez más baratos.

**LiDAR 4D (p. ej. Unitree L1/L2):** cada medida da la **posición 3D** y un atributo adicional, la **reflectividad** (intensidad) de la señal devuelta:

$$
p_i = (x_i, y_i, z_i, g_i)
$$

- La cuarta dimensión **no es una coordenada espacial**: es la intensidad (escala de grises, 0–255).
- La reflectividad ayuda a distinguir superficies de geometría parecida.
- Ejemplo Unitree L2: FOV horizontal 360°, vertical 96°, alcance ~120 m, ~1,2 millones de puntos por segundo.

> **Ejemplo resuelto (ángulo de cada haz).** En un barrido de 270° que empieza en $\alpha_{min} = -135°$ con $\Delta\alpha = 0{,}25°$, el haz $k$ tiene ángulo $\alpha_k = \alpha_{min} + k\,\Delta\alpha$.
>
> - Haz $k = 540$: $\alpha = -135° + 540 \cdot 0{,}25° = 0°$ (justo de frente).
> - Haz $k = 180$: $\alpha = -135° + 45° = -90°$ (a la derecha del robot).

---

## 4. Cámaras

### 4.1. Cámara monocular y cámaras estéreo

![Cámara monocular (solo bearing) y cámaras estéreo (rango y bearing)](img/06_camaras_mono_estereo.png)

| | **Cámara monocular** | **Cámaras estéreo** |
|---|---|---|
| Qué da | **Solo bearing** a un landmark 3D | **Rango y bearing** |
| Por qué | Un píxel $(u, v)$ define una **recta en el espacio** (la línea de visión del píxel): el punto puede estar a cualquier profundidad sobre ella | Dos vistas separadas por una **línea base conocida**: el punto 3D se obtiene **triangulando** las líneas de visión de los dos píxeles $(u_L, v_L)$ y $(u_R, v_R)$ |

Uso en robótica móvil (investigación del grupo MAPIR, UMA): localización 3D de personas con una cámara orientable para la interacción persona-robot.

### 4.2. Cámaras RGB-D

- Dan una **imagen en color RGB** y una **imagen de profundidad** (un valor de distancia **por píxel**). Ejemplo: Intel RealSense D455.
- Frente a los escáneres láser 3D:
  - **Sin partes móviles** (sensor de estado sólido, sin espejos giratorios).
  - **Mapa de profundidad denso** (imagen completa).
  - Alcance **más corto** (típicamente **~0,2–4 m**, uso en interiores).
- Cada píxel aporta **apariencia (color) y distancia**: combinando ambas se obtiene una **nube de puntos 3D coloreada**.
- Uso: localización y mapeado (**SLAM**) en interiores (investigación MAPIR).

---

## 5. Modelos probabilísticos de sensores

### 5.1. Medida = verdad + error

Los **sensores reales no dan la verdad exacta** de lo que miden, sino una versión perturbada: **verdad + error**.

1. **Distancia verdadera:** la distancia real (desconocida) a un obstáculo es $v$.
2. **Medidas repetidas:** si repetimos la medida obtenemos valores distintos: $z_1, z_2, z_3, \ldots$
3. **Modelo probabilístico:** esas medidas son **realizaciones de una variable aleatoria**:

$$
Z \sim p(z \mid v)
$$

**Modelo de medida gaussiano** (el error del sensor se suele modelar como gaussiano):

$$
\boxed{\,p(z \mid v) = \mathcal{N}(z;\, v,\, \sigma^2) = \frac{1}{\sigma\sqrt{2\pi}}\exp\!\left(-\frac{(z - v)^2}{2\sigma^2}\right)\,}
$$

| Símbolo | Significado |
|---|---|
| $Z$ | Variable aleatoria (la medida) |
| $z$ | Una medida concreta (realización) |
| $v$ | Valor verdadero (desconocido) |
| $\sigma^2$ | Varianza de la medida ($\sigma$ en las unidades de la medida) |

> **Ejemplo resuelto (evaluar una gaussiana).** Un sensor mide distancias con $\sigma = 0{,}3$ m y la distancia verdadera es $v = 5$ m. ¿Cuánto vale la densidad para la medida $z = 5{,}3$ m?
>
> 1. Valor máximo (en $z = v$): $\dfrac{1}{0{,}3\sqrt{2\pi}} = \dfrac{1}{0{,}752} \approx 1{,}330$.
> 2. Exponente: $-\dfrac{(5{,}3 - 5)^2}{2 \cdot 0{,}3^2} = -\dfrac{0{,}09}{0{,}18} = -0{,}5$.
> 3. $p(5{,}3 \mid 5) = 1{,}330 \cdot e^{-0{,}5} = 1{,}330 \cdot 0{,}607 \approx 0{,}807$ m$^{-1}$.
>
> **Truco:** a una distancia de $1\sigma$ de la media la densidad vale siempre el **60,7 %** del máximo ($e^{-1/2}$); a $2\sigma$, el 13,5 % ($e^{-2}$); a $3\sigma$, el 1,1 % ($e^{-4{,}5}$). Recuerda que es una **densidad**: puede ser mayor que 1 si $\sigma$ es pequeña.

### 5.2. Ejemplos de sensores con error gaussiano en 1D

![Tres modelos de error gaussiano en 1D](img/07_sensores_gaussianos_1d.png)

| Caso | Modelo | Qué significa |
|---|---|---|
| **1. Incertidumbre constante** | $Z \mid v \sim \mathcal{N}(v, \sigma^2)$, $\sigma$ constante | Mismo ancho de campana a cualquier distancia |
| **2. La incertidumbre crece con la distancia** | $Z \mid v \sim \mathcal{N}(v, \sigma^2(v))$, $\sigma(v)$ creciente con $v$ | Lejos se mide peor: campanas cada vez más anchas y bajas |
| **3. Sesgo sistemático (error de escala)** | $Z \mid v \sim \mathcal{N}(\alpha v, \sigma^2(v))$, p. ej. $\alpha = 1{,}5$ | La media **no** es la verdad: el sensor mide de más, y el error crece con $v$ |

> **Ejemplo resuelto (sesgo de escala).** Con $\alpha = 1{,}5$ y distancia verdadera $v = 4$ m, la medida media es $\alpha v = 6$ m: un **error sistemático de 2 m** que no desaparece promediando muchas medidas. (En la diapositiva: $v = 2 \to 3$ m, $v = 6 \to 9$ m, $v = 7 \to 10{,}5$ m.) Si se conoce $\alpha$, se corrige dividiendo: $\hat{v} = z/\alpha$.

### 5.3. Modelo ideal, modelo probabilístico y modelo gaussiano

**1. Modelo de medida ideal** (sin ruido): el vector de medida ideal $\mathbf{v}$ depende de la **pose del sensor** $\mathbf{x}$ y del **entorno (mapa)** $\mathbf{m}$:

$$
\mathbf{v} = \mathbf{h}(\mathbf{x}, \mathbf{m})
$$

Ejemplo: rango a un landmark $\mathbf{m} = (m_x, m_y)$ desde el robot $\mathbf{x} = (x, y, \theta)$:

$$
v = h(\mathbf{x}, \mathbf{m}) = r = \sqrt{(m_x - x)^2 + (m_y - y)^2}
$$

**2. Modelo probabilístico del sensor:** el sensor no da el valor ideal $v$, sino una medida aleatoria $\mathbf{Z}$ por el ruido:

$$
p(\mathbf{z} \mid \mathbf{x}, \mathbf{m}) = p(\mathbf{z} \mid \mathbf{v} = \mathbf{h}(\mathbf{x}, \mathbf{m}))
$$

donde $\mathbf{z}$ es la observación real (realización de $\mathbf{Z}$), $\mathbf{x}$ la pose del sensor y $\mathbf{m}$ el mapa.

**3. Modelo de medida gaussiano:** la medida es el valor ideal más ruido gaussiano:

$$
\boxed{\,\mathbf{Z} = \mathbf{h}(\mathbf{x}, \mathbf{m}) + \mathbf{W}, \quad \mathbf{W} \sim \mathcal{N}(\mathbf{0}, Q) \;\Longrightarrow\; p(\mathbf{z} \mid \mathbf{x}, \mathbf{m}) = \mathcal{N}(\mathbf{z};\, \mathbf{h}(\mathbf{x}, \mathbf{m}),\, Q)\,}
$$

Ejemplo (rango): $Z = r + W$, $W \sim \mathcal{N}(0, \sigma_r^2)$: la campana está centrada en el rango ideal $r$ con anchura $\sigma_r$.

> **Idea clave:** $\mathbf{h}$ es la **predicción** («qué debería medir si el robot estuviera en $\mathbf{x}$»); el modelo probabilístico dice **cuánto se puede separar la medida real de esa predicción**.

### 5.4. Una observación = muchas medidas: independencia condicional

- Una observación $\mathbf{z}$ suele contener **varias medidas**: $\mathbf{z} = [z_1, z_2, \ldots, z_K]^T$ ($K$ medidas), de un mismo dispositivo o de varios sensores.
- **Ejemplo: un scan láser** da muchas medidas de rango $z_k$ en un solo barrido.
- **Hipótesis de independencia condicional:** dadas la pose $\mathbf{x}$ y el mapa $\mathbf{m}$, las medidas individuales se suponen **condicionalmente independientes**:

$$
\boxed{\,p(\mathbf{z} \mid \mathbf{x}, \mathbf{m}) = \prod_{k=1}^{K} p(z_k \mid \mathbf{x}, \mathbf{m})\,}
$$

Recuerda (L3): $z_1$ y $z_2$ son condicionalmente independientes dados $\mathbf{x}, \mathbf{m}$ si $p(z_1, z_2 \mid \mathbf{x}, \mathbf{m}) = p(z_1 \mid \mathbf{x}, \mathbf{m})\,p(z_2 \mid \mathbf{x}, \mathbf{m})$. La verosimilitud conjunta se aproxima como el **producto** de las verosimilitudes individuales.

> **Ejemplo resuelto.** Tres haces de un scan tienen verosimilitudes $p(z_1 \mid \mathbf{x}, \mathbf{m}) = 1{,}2$, $p(z_2 \mid \mathbf{x}, \mathbf{m}) = 0{,}8$ y $p(z_3 \mid \mathbf{x}, \mathbf{m}) = 0{,}05$.
>
> $p(\mathbf{z} \mid \mathbf{x}, \mathbf{m}) = 1{,}2 \cdot 0{,}8 \cdot 0{,}05 = 0{,}048$.
>
> Un solo haz poco compatible (0,05) hunde el producto entero. Con cientos de haces el producto se vuelve diminuto, así que en la práctica se suman **logaritmos**: $\log p = \sum_k \log p(z_k \mid \mathbf{x}, \mathbf{m})$.

### 5.5. Para un modelo de sensor hace falta un mapa

- Un **mapa geométrico** $\mathcal{M}$ es una representación de la **estructura espacial del entorno**. Para usar $p(\mathbf{z} \mid \mathbf{x}, \mathbf{m})$ se toma $\mathbf{m} = \mathcal{M}$.
- **Usos del mapa:**
  - **Localización:** estimar la pose con las observaciones y el mapa. El mapa permite **predecir la medida** en una pose candidata, $\hat{\mathbf{z}} = h(\mathbf{x}, \mathcal{M})$, y evaluar su **verosimilitud** $p(\mathbf{z} \mid \mathbf{x}, \mathcal{M}) = p(\mathbf{z} \mid h(\mathbf{x}, \mathcal{M}))$.
  - **Navegación y planificación:** usar el mapa para planificar caminos sin colisiones hacia un objetivo: $\pi = \text{plan}(\mathbf{x}_{start}, \mathcal{M})$ (evitar obstáculos, llegar a la meta, optimizar un criterio como longitud o seguridad).

**Dos representaciones de mapa habituales:**

| | **Mapa de landmarks** | **Mapa de rejilla de ocupación** (*occupancy grid*) |
|---|---|---|
| Representación | $\mathcal{M} = \{\mathbf{m}_1, \mathbf{m}_2, \ldots, \mathbf{m}_N\}$ | $\mathcal{M} = \{m_{ij}\}$ |
| Contenido | Cada landmark $\mathbf{m}_i$ tiene una **posición** $(x, y)$ y un **descriptor** (p. ej. características visuales) | Cada celda $m_{ij}$ guarda una **probabilidad de ocupación** $p(m_{ij}) = P(\text{ocupada})$ (0 = libre, 1 = ocupada) |
| Sensores típicos | Detecciones de landmarks con cámaras, balizas... | Escáneres LiDAR y sensores de profundidad |
| Modelos de sensor | Bearing, rango, rango y bearing (sección 6) | **Beam model** y **likelihood field** (sección 7) |

### 5.6. Verosimilitud frente a probabilidad condicionada

![Probabilidad condicionada (función de z) frente a verosimilitud (función de x)](img/08_likelihood_vs_probabilidad.png)

**Teorema de Bayes (localización):**

$$
\underbrace{p(\mathbf{x} \mid \mathbf{z}, \mathbf{m})}_{\text{posterior}} \;\propto\; \underbrace{p(\mathbf{z} \mid \mathbf{x}, \mathbf{m})}_{\text{verosimilitud (modelo de medida)}}\;\underbrace{p(\mathbf{x} \mid \mathbf{m})}_{\text{prior (creencia previa)}}
$$

La **misma expresión** $p(z \mid x, m)$ se lee de dos formas:

| | **Probabilidad condicionada (PDF)** | **Verosimilitud** (*likelihood*, como función de $x$) |
|---|---|---|
| Notación | $p(z \mid x, m)$ | $p(z \mid x, m) = \mathcal{L}(x; m, z)$ |
| Qué está fijo | La pose $x$ y el mapa $m$ | La medida $z$ y el mapa $m$ |
| Qué varía | $z$ (es la **variable aleatoria**) | $x$ (es la **variable**) |
| Qué describe | La distribución de las medidas **posibles** que puede dar el sensor | Lo **compatible** que es cada pose candidata $x$ con la medida observada $z$ |
| ¿Integra 1? | **Sí**: $\int p(z \mid x, m)\,dz = 1$ | **No**: $\int \mathcal{L}(x; m, z)\,dx \neq 1$; **no es una distribución sobre $x$** |

> **Ejemplo de la diapositiva (PDF):** robot fijo en $x = 3$ m y pared en $x = 8$ m: la medida esperada es $h(x, m) = 5$ m y $p(z \mid x, m)$ es una campana en $z$ centrada en $\mu = 5$ m.

> **Ejemplo resuelto (verosimilitud 1D: pared en $x = 0$).** El robot mira hacia la pared, así que el rango esperado desde la posición $x$ es $h(x;\, m) = x$. Se observa $z = 5{,}6$ m con $\sigma = 0{,}5$ m. Evalúa la compatibilidad de tres poses candidatas: $x_b = 3{,}0$, $x^* = 5{,}6$ y $x_a = 7{,}2$ m.
>
> $\mathcal{L}(x) \propto \exp\!\left(-\dfrac{(z - x)^2}{2\sigma^2}\right)$, con $2\sigma^2 = 0{,}5$:
>
> | Pose $x$ | $z - h(x)$ | Exponente | $\mathcal{L}$ (sin normalizar) |
> |---|---|---|---|
> | $3{,}0$ | $2{,}6$ | $-6{,}76/0{,}5 = -13{,}52$ | $1{,}3 \times 10^{-6}$ |
> | $5{,}6$ | $0$ | $0$ | $1$ (**máximo**) |
> | $7{,}2$ | $-1{,}6$ | $-2{,}56/0{,}5 = -5{,}12$ | $0{,}006$ |
>
> La verosimilitud es **máxima donde el rango predicho coincide con la medida** ($x \approx z$). Las tres cifras **no** suman 1: no es una distribución sobre $x$.

> **Ejemplo resuelto (Bayes discreto con esas tres poses).** Si el robot solo puede estar en esas tres poses y el prior es uniforme ($1/3$ cada una):
>
> 1. Producto prior × verosimilitud: $\tfrac13 \cdot (1{,}3 \times 10^{-6},\ 1,\ 0{,}006)$.
> 2. Normalizar (dividir por la suma $\approx \tfrac13 \cdot 1{,}006$): posterior $\approx (0{,}000;\ 0{,}994;\ 0{,}006)$.
>
> Con prior $(0{,}2;\ 0{,}3;\ 0{,}5)$: productos $(2{,}7 \times 10^{-7};\ 0{,}3;\ 0{,}003)$ → posterior $\approx (0{,}000;\ 0{,}990;\ 0{,}010)$. Una medida precisa domina sobre el prior.

### 5.7. Ejemplo: sensor de rango a un landmark en 2D

![Ejemplo de la diapositiva: PDF de r y anillo de verosimilitud en 2D](img/09_ejemplo_likelihood_2d.png)

Modelo:

$$
r = \lVert \mathbf{x} - \mathbf{m} \rVert + w, \quad w \sim \mathcal{N}(0, \sigma^2) \;\Longrightarrow\; p(r \mid \mathbf{x}, \mathbf{m}) = K \exp\!\left\{-\frac{1}{2}\frac{(\lVert \mathbf{x} - \mathbf{m} \rVert - r)^2}{\sigma^2}\right\}
$$

- **Como probabilidad condicionada** (fijos $\mathbf{x} = [3, 0]^T$ y $\mathbf{m} = [0, 0]^T$): $p(r \mid \mathbf{x}, \mathbf{m}) = \mathcal{N}(3,\, 0{,}3^2)$, campana en $r$ centrada en 3 m con $\sigma = 0{,}3$ m.
- **Como verosimilitud en 2D** (fijos $r = 3{,}1$ m y $\mathbf{m} = [0, 0]^T$):

$$
\mathcal{L}(\mathbf{x}; \mathbf{m}, 3{,}1) = K \exp\!\left\{-\frac{1}{2}\frac{\left([x^2 + y^2]^{1/2} - 3{,}1\right)^2}{\sigma^2}\right\}
$$

  Es un **anillo** de radio 3,1 m alrededor del landmark: todas las posiciones a esa distancia son igual de compatibles. **Un solo rango no fija la posición** (ni la orientación).

> **Ejemplo resuelto (puntos A, B y C).** Con $\sigma = 0{,}3$ m, evalúa $\mathcal{L}$ (sin la constante $K$) en $A = (3, 0)$, $B = (0, 3{,}1)$ y $C = (-1, -0{,}5)$:
>
> | Punto | Distancia al landmark | Diferencia con 3,1 | $\exp\{-\frac12(\text{dif}/0{,}3)^2\}$ |
> |---|---|---|---|
> | $A$ | $3$ | $-0{,}1$ | $e^{-0{,}056} \approx 0{,}946$ |
> | $B$ | $3{,}1$ | $0$ | $1$ |
> | $C$ | $\sqrt{1 + 0{,}25} \approx 1{,}118$ | $-1{,}98$ | $\approx 3 \times 10^{-10}$ |
>
> **B encaja mejor que A y que C** (como dice la diapositiva); A está muy cerca del anillo, C prácticamente descartado.

---

## 6. Modelos de observación de landmarks

### 6.1. Rango, bearing, rango y bearing

- **Mapa:** colección de landmarks $\mathcal{M} = \{\mathbf{m}_i\}_{i = 1, \ldots, N}$. El sensor da medidas a los landmarks.
- Cada modelo **predice la medida esperada** a partir de la pose $\mathbf{x}$ y el landmark $\mathbf{m}$, **más el ruido** $\mathbf{w}_i$:

| Tipo | Modelo | Ejemplos |
|---|---|---|
| **Rango** (distancia) | $z_i = d_i = h_i(\mathbf{x}, \mathbf{m}) + w_i$ | WiFi, GPS, balizas de rango |
| **Bearing** (dirección; en mundo plano) | $z_i = \alpha_i = h_i(\mathbf{x}, \mathbf{m}) + w_i$ | Cámara monocular |
| **Rango + bearing** | $\mathbf{z}_i = [d_i, \alpha_i]^T = \mathbf{h}_i(\mathbf{x}, \mathbf{m}) + \mathbf{w}_i$ (vectores 2D) | Visión estéreo, características de nubes de puntos |

### 6.2. El problema de la asociación de datos

- **Problema:** decidir **qué landmark** $\mathbf{m}_j$ ha generado una observación $\mathbf{z}_i$. Se necesita la **correspondencia** $\mathbf{z}_i \leftrightarrow \mathbf{m}_j$ **antes** de aplicar el modelo de observación $\mathbf{z}_i = \mathbf{h}(\mathbf{x}, \mathbf{m}_j) + \mathbf{w}_i$.
- **Cómo se resuelve:**
  1. **Descriptor:** comparar la apariencia o el identificador (ID) de lo observado con el de los landmarks del mapa.
  2. **Geometría:** comparar la medida observada con la predicha: $\mathbf{z}_i = [d_i, \alpha_i]^T$ frente a $\hat{\mathbf{z}}_j = \mathbf{h}(\mathbf{x}, \mathbf{m}_j)$.
  3. Elegir el **landmark más compatible** con la observación.
- **Las asociaciones erróneas** pueden llevar a una localización o un mapeado incorrectos. Ayudas típicas: **descriptores de landmarks + tests de compatibilidad geométrica**.

> **Ejemplo resuelto (asociación geométrica).** El robot está en $\mathbf{x} = (0, 0, 0°)$ y observa $\mathbf{z} = [5{,}1\ \text{m},\ 36°]$. Candidatos: $\mathbf{m}_1 = (4, 3)$ y $\mathbf{m}_2 = (3, 4)$.
>
> - $\hat{\mathbf{z}}_1 = [\sqrt{16 + 9},\ \text{atan2}(3, 4)] = [5,\ 36{,}87°]$.
> - $\hat{\mathbf{z}}_2 = [5,\ \text{atan2}(4, 3)] = [5,\ 53{,}13°]$.
>
> Los dos están a 5 m: **el rango no discrimina**. El bearing sí: $|36° - 36{,}87°| = 0{,}87°$ frente a $|36° - 53{,}13°| = 17{,}13°$. Se asocia $\mathbf{z} \leftrightarrow \mathbf{m}_1$.

### 6.3. Modelo de distancia y bearing en 2D

![Modelo de observación de distancia y bearing: función de medida y verosimilitud](img/10_modelo_rango_marcacion.png)

La observación de un landmark $\mathbf{m}_i = [x_i, y_i]^T$ (conocido en el mapa) desde la pose $\mathbf{x} = [x, y, \theta]^T$ consiste en una distancia $d_i$ y un bearing $\alpha_i$ (**medido desde la orientación del robot $\theta$**).

**Función de medida (predicción):**

$$
\boxed{\,\mathbf{h}(\mathbf{x}, \mathbf{m}_i) = \begin{bmatrix} \hat{d}_i \\ \hat{\alpha}_i \end{bmatrix} = \begin{bmatrix} \sqrt{(x_i - x)^2 + (y_i - y)^2} \\ \operatorname{atan2}(y_i - y,\ x_i - x) - \theta \end{bmatrix}\,}
$$

**Modelo de observación** (ruido gaussiano aditivo):

$$
\mathbf{z}_i = \begin{bmatrix} d_i \\ \alpha_i \end{bmatrix} = \mathbf{h}(\mathbf{x}, \mathbf{m}_i) + \mathbf{w}_i, \qquad \mathbf{w}_i \sim \mathcal{N}(\mathbf{0}, Q_i)
$$

$Q_i$ es la **matriz de covarianza 2×2** del ruido de rango y bearing (normalmente $Q_i = \operatorname{diag}(\sigma_d^2, \sigma_\alpha^2)$).

**Verosimilitud** (gaussiana 2D):

$$
\boxed{\,p(\mathbf{z}_i \mid \mathbf{x}, \mathbf{m}_i) = \frac{1}{2\pi\,|Q_i|^{1/2}}\exp\!\left\{-\frac{1}{2}\big[\mathbf{z}_i - \mathbf{h}(\mathbf{x}, \mathbf{m}_i)\big]^T Q_i^{-1}\big[\mathbf{z}_i - \mathbf{h}(\mathbf{x}, \mathbf{m}_i)\big]\right\}\,}
$$

> **Aclaraciones:**
>
> - Usa **atan2** (no atan): tiene en cuenta el cuadrante. Y **resta $\theta$**: el bearing es relativo a hacia dónde mira el robot.
> - Normaliza el ángulo resultante a $(-180°, 180°]$ y, al restar $\alpha_i - \hat{\alpha}_i$, normaliza también la diferencia (no es lo mismo una diferencia de 358° que de −2°).
> - El 2 de $2\pi$ es la dimensión de la medida (en general $(2\pi)^{n/2}$; con $n = 2$ queda $2\pi$).

> **Ejemplo resuelto (predicción de rango y bearing).** Robot en $\mathbf{x} = [1\ \text{m},\ 2\ \text{m},\ 30°]^T$ y landmark en $\mathbf{m} = [4, 6]^T$ m.
>
> 1. Diferencias: $\Delta x = 4 - 1 = 3$, $\Delta y = 6 - 2 = 4$.
> 2. Rango: $\hat{d} = \sqrt{3^2 + 4^2} = 5$ m.
> 3. Ángulo global hacia el landmark: $\operatorname{atan2}(4, 3) = 53{,}13°$.
> 4. Bearing: $\hat{\alpha} = 53{,}13° - 30° = 23{,}13°$.
>
> **Resultado:** $\hat{\mathbf{z}} = [5\ \text{m},\ 23{,}13°]^T$.

> **Ejemplo resuelto (verosimilitud de una observación).** En la situación anterior se mide $\mathbf{z} = [5{,}2\ \text{m},\ 26{,}13°]^T$, con $\sigma_d = 0{,}2$ m y $\sigma_\alpha = 3° = 0{,}05236$ rad, es decir, $Q = \operatorname{diag}(0{,}04,\ 0{,}002742)$.
>
> 1. Error (innovación): $\mathbf{e} = \mathbf{z} - \hat{\mathbf{z}} = [0{,}2\ \text{m},\ 3° = 0{,}05236\ \text{rad}]^T$.
> 2. Como $Q$ es diagonal: $\mathbf{e}^T Q^{-1} \mathbf{e} = \left(\dfrac{0{,}2}{0{,}2}\right)^2 + \left(\dfrac{0{,}05236}{0{,}05236}\right)^2 = 1 + 1 = 2$ (cada componente está a $1\sigma$).
> 3. $|Q| = 0{,}04 \cdot 0{,}002742 = 1{,}097 \times 10^{-4}$, $|Q|^{1/2} = 0{,}01047$; constante $= \dfrac{1}{2\pi \cdot 0{,}01047} \approx 15{,}20$.
> 4. $p(\mathbf{z} \mid \mathbf{x}, \mathbf{m}) = 15{,}20 \cdot e^{-2/2} = 15{,}20 \cdot 0{,}368 \approx 5{,}59$.
>
> **Ojo con las unidades:** el ángulo del error y $\sigma_\alpha$ tienen que estar **en las mismas unidades** (mejor radianes).

### 6.4. Posición de un landmark observado (modelo inverso)

Si se conoce la pose del robot y se mide $\mathbf{z} = [r, \alpha]^T$, el landmark está en coordenadas globales en:

$$
\boxed{\,\mathbf{m} = f(\mathbf{x}, \mathbf{z}) = \begin{bmatrix} x + r\cos(\theta + \alpha) \\ y + r\sin(\theta + \alpha) \end{bmatrix}\,}
\qquad \phi = \theta + \alpha \ \text{(dirección global hacia el landmark)}
$$

Es la composición $\mathbf{m} = \mathbf{x} \oplus \mathbf{z}_c$ de L3, con la observación pasada a cartesianas en el marco del robot: $\mathbf{z}_c = [r\cos\alpha,\ r\sin\alpha]^T$ (sección 6.6).

> **Ejemplo resuelto I (diapositiva).** Robot en $\mathbf{x} = [2\ \text{m},\ 1\ \text{m},\ 45°]^T$; observación $\mathbf{z} = [3\ \text{m},\ 45°]^T$.
>
> 1. Dirección global: $\phi = \theta + \alpha = 45° + 45° = 90°$.
> 2. $\mathbf{m} = [2 + 3\cos 90°,\ 1 + 3\sin 90°]^T = [2 + 0,\ 1 + 3]^T = [2,\ 4]^T$ m.

> **Ejemplo resuelto II (diapositiva).** Robot en $\mathbf{x} = [2\ \text{m},\ 1\ \text{m},\ 30°]^T$; observación $\mathbf{z} = [3\ \text{m},\ 15°]^T$.
>
> 1. $\phi = 30° + 15° = 45°$.
> 2. $\mathbf{m} = [2 + 3\cos 45°,\ 1 + 3\sin 45°]^T = [2 + 2{,}1213,\ 1 + 2{,}1213]^T \approx [4{,}1213,\ 3{,}1213]^T$ m.

> **Ejemplo resuelto (punto de un scan en el marco global).** Robot en $\mathbf{x} = [2, 1, 30°]^T$; un haz del LiDAR mide $r = 2{,}5$ m a $\alpha = -30°$.
>
> 1. En el marco del sensor: $\mathbf{z}_c = [2{,}5\cos(-30°),\ 2{,}5\sin(-30°)] = [2{,}165,\ -1{,}25]$ m.
> 2. En el global: $\phi = 30° - 30° = 0°$ → $\mathbf{m} = [2 + 2{,}5,\ 1 + 0] = [4{,}5,\ 1]$ m.
>
> Comprobación con la fórmula de composición: $x + z_x\cos\theta - z_y\sin\theta = 2 + 2{,}165 \cdot 0{,}866 - (-1{,}25) \cdot 0{,}5 = 2 + 1{,}875 + 0{,}625 = 4{,}5$ ✓.

### 6.5. De la incertidumbre de la medida a la del landmark (coordenadas cartesianas)

![Covarianza de un landmark observado: suma de dos contribuciones](img/11_covarianza_landmark.png)

Ahora la pose y la observación son **inciertas** (gaussianas independientes):

$$
\mathbf{x}_i \sim \mathcal{N}(\bar{\mathbf{x}}_i, \Sigma_i), \qquad \mathbf{z}^i \sim \mathcal{N}(\bar{\mathbf{z}}^i, Q_i), \qquad \mathbf{m}^i = \mathbf{x}_i \oplus \mathbf{z}^i = \mathbf{f}(\mathbf{x}_i, \mathbf{z}^i)
$$

($Q_i$ es la covarianza de $\mathbf{z}^i$ **en el marco del robot**; las diapositivas pasan aquí de subíndice $\mathbf{z}_i$ a superíndice $\mathbf{z}^i$ por coherencia con la notación posterior.)

- **Media:** $\bar{\mathbf{m}}^i = \bar{\mathbf{x}}_i \oplus \bar{\mathbf{z}}^i$ (se aplica $\mathbf{f}$ a las medias).
- **Covarianza** (propagación de primer orden, recuerda L3: si $Z = f(X, Y)$ con $X$, $Y$ independientes, $\Sigma_Z = \frac{\partial f}{\partial X}\Sigma_X\frac{\partial f}{\partial X}^T + \frac{\partial f}{\partial Y}\Sigma_Y\frac{\partial f}{\partial Y}^T$):

$$
\boxed{\,\Sigma_{\mathbf{m}^i} = \underbrace{\frac{\partial \mathbf{m}^i}{\partial \mathbf{x}_i}\,\Sigma_i\,\left(\frac{\partial \mathbf{m}^i}{\partial \mathbf{x}_i}\right)^T}_{\text{por la incertidumbre de la pose}} + \underbrace{\frac{\partial \mathbf{m}^i}{\partial \mathbf{z}^i}\,Q_i\,\left(\frac{\partial \mathbf{m}^i}{\partial \mathbf{z}^i}\right)^T}_{\text{por la incertidumbre de la medida}}\,}
$$

| Matriz | Tamaño |
|---|---|
| $\Sigma_{\mathbf{m}^i}$ | 2×2 |
| $\partial \mathbf{m}^i / \partial \mathbf{x}_i$ | **2×3** (2 salidas $m_x, m_y$; 3 entradas $x, y, \theta$) |
| $\Sigma_i$ | 3×3 |
| $\partial \mathbf{m}^i / \partial \mathbf{z}^i$ | 2×2 |
| $Q_i$ | 2×2 |

> **$\Sigma_{\mathbf{m}^i}$ es la suma de dos matrices de covarianza:** aunque el sensor fuera perfecto ($Q_i = 0$), el landmark seguiría siendo incierto por la incertidumbre de la pose, y al revés.

### 6.6. Observación en coordenadas polares: regla de la cadena

El sensor mide en **polares**, $\mathbf{z}_p = [r, \alpha]^T$, pero la composición usa **cartesianas** en el marco del sensor:

$$
\mathbf{z}_c = \begin{bmatrix} z_x \\ z_y \end{bmatrix} = \begin{bmatrix} r\cos\alpha \\ r\sin\alpha \end{bmatrix} = \mathbf{f}(\mathbf{z}_p),
\qquad
\mathbf{m} = \mathbf{x} \oplus \mathbf{z}_c = \begin{bmatrix} x + z_x\cos\theta - z_y\sin\theta \\ y + z_x\sin\theta + z_y\cos\theta \end{bmatrix}
$$

$$
\Sigma_{\mathbf{m}} = \frac{\partial \mathbf{m}}{\partial \mathbf{x}}\Sigma_{\mathbf{x}}\frac{\partial \mathbf{m}}{\partial \mathbf{x}}^T + \frac{\partial \mathbf{m}}{\partial \mathbf{z}_c}\Sigma_{\mathbf{z}_c}\frac{\partial \mathbf{m}}{\partial \mathbf{z}_c}^T
$$

**Covarianza de la observación en cartesianas** (polares → cartesianas):

$$
\boxed{\,\Sigma_{\mathbf{z}_c} = \frac{\partial \mathbf{z}_c}{\partial \mathbf{z}_p}\,\Sigma_{\mathbf{z}_p}\,\frac{\partial \mathbf{z}_c}{\partial \mathbf{z}_p}^T, \qquad \frac{\partial \mathbf{z}_c}{\partial \mathbf{z}_p} = \begin{bmatrix} \cos\alpha & -r\sin\alpha \\ \sin\alpha & r\cos\alpha \end{bmatrix}\,}
$$

Por la **regla de la cadena**, el segundo término se puede escribir de dos formas equivalentes:

$$
\frac{\partial \mathbf{m}}{\partial \mathbf{z}_c}\left[\frac{\partial \mathbf{z}_c}{\partial \mathbf{z}_p}\Sigma_{\mathbf{z}_p}\frac{\partial \mathbf{z}_c}{\partial \mathbf{z}_p}^T\right]\frac{\partial \mathbf{m}}{\partial \mathbf{z}_c}^T = \frac{\partial \mathbf{m}}{\partial \mathbf{z}_p}\Sigma_{\mathbf{z}_p}\frac{\partial \mathbf{m}}{\partial \mathbf{z}_p}^T
$$

O bien se pasa primero la covarianza a cartesianas y luego se rota, o bien se deriva directamente $\mathbf{m}$ respecto a $(r, \alpha)$.

> **Aclaración:** $\dfrac{\partial \mathbf{m}}{\partial \mathbf{z}_c} = R_\theta = \begin{bmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{bmatrix}$ (solo rota). Por eso $\dfrac{\partial \mathbf{m}}{\partial \mathbf{z}_p} = R_\theta\dfrac{\partial \mathbf{z}_c}{\partial \mathbf{z}_p}$ es la misma matriz con $\alpha$ sustituido por $\phi = \theta + \alpha$: es la $\mathbf{J}_z$ de la sección 6.7.

> **Ejemplo resuelto (polares → cartesianas, caso $\alpha = 0$).** $r = 2$ m, $\alpha = 0$, $\sigma_r = 0{,}1$ m, $\sigma_\alpha = 0{,}05$ rad.
>
> $\dfrac{\partial \mathbf{z}_c}{\partial \mathbf{z}_p} = \begin{bmatrix} 1 & 0 \\ 0 & 2 \end{bmatrix}$ → $\Sigma_{\mathbf{z}_c} = \begin{bmatrix} 1 & 0 \\ 0 & 2 \end{bmatrix}\begin{bmatrix} 0{,}01 & 0 \\ 0 & 0{,}0025 \end{bmatrix}\begin{bmatrix} 1 & 0 \\ 0 & 2 \end{bmatrix} = \begin{bmatrix} 0{,}01 & 0 \\ 0 & 0{,}01 \end{bmatrix}$ m².
>
> **Interpretación:** en la dirección del haz la incertidumbre es $\sigma_r = 0{,}1$ m; en la **lateral** es $r\,\sigma_\alpha = 2 \cdot 0{,}05 = 0{,}1$ m. **El error lateral crece con la distancia**: a 20 m sería 1 m.

> **Ejemplo resuelto (polares → cartesianas y regla de la cadena).** Medida del ejemplo II: $r = 3$ m, $\alpha = 15°$, $\Sigma_{\mathbf{z}_p} = \operatorname{diag}(0{,}04,\ 0{,}002742)$.
>
> 1. $\mathbf{z}_c = [3\cos 15°,\ 3\sin 15°] = [2{,}898,\ 0{,}776]$ m.
> 2. $\dfrac{\partial \mathbf{z}_c}{\partial \mathbf{z}_p} = \begin{bmatrix} 0{,}9659 & -0{,}7765 \\ 0{,}2588 & 2{,}8978 \end{bmatrix}$.
> 3. $\Sigma_{\mathbf{z}_c} = \begin{bmatrix} 0{,}03897 & 0{,}00383 \\ 0{,}00383 & 0{,}02570 \end{bmatrix}$ m² (en el marco del robot).
> 4. Rotando con $R_{30°}$: $R_{30°}\Sigma_{\mathbf{z}_c}R_{30°}^T = \begin{bmatrix} 0{,}03234 & 0{,}00766 \\ 0{,}00766 & 0{,}03234 \end{bmatrix}$, que coincide con $\mathbf{J}_z\Sigma_z\mathbf{J}_z^T$ calculado directamente en el ejemplo II de la sección 6.7. Las dos expresiones dan lo mismo.

### 6.7. Ejemplos resueltos: incertidumbre de la posición estimada del landmark

**Planteamiento general:** $\mathbf{x} \sim \mathcal{N}(\bar{\mathbf{x}}, \Sigma_x)$ y $\mathbf{z} \sim \mathcal{N}(\bar{\mathbf{z}}, \Sigma_z)$ independientes, $\mathbf{m} = f(\mathbf{x}, \mathbf{z})$ (sección 6.4), y la aproximación de primer orden:

$$
\boxed{\,\Sigma_m \approx \mathbf{J}_x\Sigma_x\mathbf{J}_x^T + \mathbf{J}_z\Sigma_z\mathbf{J}_z^T\,}
$$

$$
\boxed{\,\mathbf{J}_x = \frac{\partial f}{\partial \mathbf{x}} = \begin{bmatrix} 1 & 0 & -r\sin\phi \\ 0 & 1 & r\cos\phi \end{bmatrix}, \qquad
\mathbf{J}_z = \frac{\partial f}{\partial \mathbf{z}} = \begin{bmatrix} \cos\phi & -r\sin\phi \\ \sin\phi & r\cos\phi \end{bmatrix}, \qquad \phi = \theta + \alpha\,}
$$

> **Cómo reconstruir los jacobianos sin memorizarlos:** deriva $x + r\cos\phi$ y $y + r\sin\phi$.
>
> - Respecto a $x$ e $y$: identidad (columnas 1 y 2 de $\mathbf{J}_x$).
> - Respecto a $\theta$ y a $\alpha$: la derivada es la misma, $[-r\sin\phi,\ r\cos\phi]^T$ (porque los dos entran como $\theta + \alpha$).
> - Respecto a $r$: $[\cos\phi,\ \sin\phi]^T$.

**Parámetros de incertidumbre comunes a los dos ejemplos** (desviaciones típicas): $\sigma_x = \sigma_y = 0{,}10$ m; $\sigma_\theta = 5° = 0{,}0873$ rad; $\sigma_r = 0{,}20$ m; $\sigma_\alpha = 3° = 0{,}0524$ rad.

$$
\Sigma_x = \begin{bmatrix} 0{,}01 & 0 & 0 \\ 0 & 0{,}01 & 0 \\ 0 & 0 & 0{,}007615 \end{bmatrix}, \qquad
\Sigma_z = \begin{bmatrix} 0{,}04 & 0 \\ 0 & 0{,}002742 \end{bmatrix}
$$

> **Recuerda:** la covarianza lleva **varianzas** ($\sigma^2$), y los ángulos **en radianes**: $(5° \cdot \pi/180)^2 = 0{,}0873^2 = 0{,}007615$ rad².

> **Ejemplo resuelto I** ($\mathbf{x} = [2, 1, 45°]^T$, $\mathbf{z} = [3\ \text{m}, 45°]^T$ → $\mathbf{m} = [2, 4]^T$, $\phi = 90°$).
>
> 1. Jacobianos con $r = 3$, $\sin 90° = 1$, $\cos 90° = 0$:
>    $\mathbf{J}_x = \begin{bmatrix} 1 & 0 & -3 \\ 0 & 1 & 0 \end{bmatrix}$, $\quad \mathbf{J}_z = \begin{bmatrix} 0 & -3 \\ 1 & 0 \end{bmatrix}$.
> 2. Término de la pose: $\mathbf{J}_x\Sigma_x\mathbf{J}_x^T = \begin{bmatrix} 0{,}01 + 9 \cdot 0{,}007615 & 0 \\ 0 & 0{,}01 \end{bmatrix} = \begin{bmatrix} 0{,}0785 & 0 \\ 0 & 0{,}01 \end{bmatrix}$.
> 3. Término de la medida: $\mathbf{J}_z\Sigma_z\mathbf{J}_z^T = \begin{bmatrix} 9 \cdot 0{,}002742 & 0 \\ 0 & 0{,}04 \end{bmatrix} = \begin{bmatrix} 0{,}0247 & 0 \\ 0 & 0{,}04 \end{bmatrix}$.
> 4. Suma: $\Sigma_m \approx \begin{bmatrix} 0{,}1032 & 0 \\ 0 & 0{,}0500 \end{bmatrix}$ m².
>
> **Interpretación:** el landmark está justo «delante» ($\phi = 90°$, eje $y$). El rango ($\sigma_r$) afecta a $y$ (0,04), y los ángulos ($\theta$ y $\alpha$, multiplicados por $r^2 = 9$) afectan a $x$: la elipse es **más ancha en $x$**, perpendicular a la línea de visión. Elipse $2\sigma$: semiejes $2\sqrt{0{,}1032} \approx 0{,}64$ m en $x$ y $2\sqrt{0{,}05} \approx 0{,}45$ m en $y$.
>
> (Con los valores redondeados de la diapositiva, $0{,}0076$ y $0{,}0027$, sale $0{,}1027$; el $0{,}1032$ sale con $0{,}007615$ y $0{,}002742$.)

![Ejemplo II de la diapositiva: posición y covarianza del landmark](img/12_ejemplo_landmark_incertidumbre.png)

> **Ejemplo resuelto II** ($\mathbf{x} = [2, 1, 30°]^T$, $\mathbf{z} = [3\ \text{m}, 15°]^T$ → $\mathbf{m} \approx [4{,}1213,\ 3{,}1213]^T$, $\phi = 45°$).
>
> 1. Con $r\sin 45° = r\cos 45° = 2{,}1213$ y $\cos 45° = \sin 45° = 0{,}7071$:
>    $\mathbf{J}_x = \begin{bmatrix} 1 & 0 & -2{,}1213 \\ 0 & 1 & 2{,}1213 \end{bmatrix}$, $\quad \mathbf{J}_z = \begin{bmatrix} 0{,}7071 & -2{,}1213 \\ 0{,}7071 & 2{,}1213 \end{bmatrix}$.
> 2. Término de la pose: $\mathbf{J}_x\Sigma_x\mathbf{J}_x^T = \begin{bmatrix} 0{,}01 + 4{,}5 \cdot 0{,}007615 & -4{,}5 \cdot 0{,}007615 \\ -4{,}5 \cdot 0{,}007615 & 0{,}01 + 4{,}5 \cdot 0{,}007615 \end{bmatrix} = \begin{bmatrix} 0{,}0443 & -0{,}0343 \\ -0{,}0343 & 0{,}0443 \end{bmatrix}$.
> 3. Término de la medida: $\mathbf{J}_z\Sigma_z\mathbf{J}_z^T = \begin{bmatrix} 0{,}5 \cdot 0{,}04 + 4{,}5 \cdot 0{,}002742 & 0{,}5 \cdot 0{,}04 - 4{,}5 \cdot 0{,}002742 \\ \cdot & \cdot \end{bmatrix} = \begin{bmatrix} 0{,}0323 & 0{,}0077 \\ 0{,}0077 & 0{,}0323 \end{bmatrix}$.
> 4. Suma: $\Sigma_m \approx \begin{bmatrix} 0{,}0766 & -0{,}0266 \\ -0{,}0266 & 0{,}0766 \end{bmatrix}$ m².
>
> **Interpretación:** ahora la línea de visión va a 45°, así que aparece **covarianza cruzada negativa**: la elipse se alarga en la dirección perpendicular a la línea de visión (−45°). Sus valores propios son 0,1032 y 0,05, **los mismos que en el ejemplo I**: es la misma elipse, solo girada. Tiene sentido: la geometría relativa ($r = 3$ m) y las incertidumbres son iguales.

> **Ejemplo resuelto III (para practicar, con términos cruzados).** $\mathbf{x} = [1, 2, 90°]^T$; $\mathbf{z} = [2\ \text{m},\ -30°]^T$; $\sigma_x = \sigma_y = 0{,}05$ m, $\sigma_\theta = 2°$, $\sigma_r = 0{,}1$ m, $\sigma_\alpha = 2°$.
>
> 1. $\phi = 90° - 30° = 60°$; $\mathbf{m} = [1 + 2\cos 60°,\ 2 + 2\sin 60°] = [2,\ 3{,}732]$ m.
> 2. $\Sigma_x = \operatorname{diag}(0{,}0025,\ 0{,}0025,\ 0{,}001218)$; $\Sigma_z = \operatorname{diag}(0{,}01,\ 0{,}001218)$ (porque $(2° \to 0{,}0349\ \text{rad})^2 = 0{,}001218$).
> 3. $\mathbf{J}_x = \begin{bmatrix} 1 & 0 & -1{,}732 \\ 0 & 1 & 1 \end{bmatrix}$, $\mathbf{J}_z = \begin{bmatrix} 0{,}5 & -1{,}732 \\ 0{,}866 & 1 \end{bmatrix}$.
> 4. $\mathbf{J}_x\Sigma_x\mathbf{J}_x^T = \begin{bmatrix} 0{,}00616 & -0{,}00211 \\ -0{,}00211 & 0{,}00372 \end{bmatrix}$; $\mathbf{J}_z\Sigma_z\mathbf{J}_z^T = \begin{bmatrix} 0{,}00616 & 0{,}00222 \\ 0{,}00222 & 0{,}00872 \end{bmatrix}$.
> 5. $\Sigma_m \approx \begin{bmatrix} 0{,}01231 & 0{,}00011 \\ 0{,}00011 & 0{,}01244 \end{bmatrix}$ m² (casi circular: $\sigma \approx 0{,}11$ m en cada eje).
>
> Detalle del primer término: $(1,1) = 0{,}0025 + 1{,}732^2 \cdot 0{,}001218 = 0{,}0025 + 3 \cdot 0{,}001218 = 0{,}00616$; $(1,2) = -1{,}732 \cdot 1 \cdot 0{,}001218 = -0{,}00211$; $(2,2) = 0{,}0025 + 1 \cdot 0{,}001218 = 0{,}00372$.

---

## 7. Modelos de observación de scans

### 7.1. Representación del mapa y aplicaciones

- **Representaciones de mapa** para scans: **mapa de segmentos** (paredes como segmentos) y **mapa de rejilla** (cada celda con $P(\text{ocupada})$ entre 0 y 1).
- **Modelo de sensor $p(\mathbf{z} \mid \mathbf{x}, \mathbf{m})$:** ¿cómo de probable es un **scan** $\mathbf{z} = [z_1, \ldots, z_K]^T$ ($K$ haces) dada la pose $\mathbf{x}$ y el mapa $\mathbf{m}$?
- **Dos modelos de observación habituales:**
  - **Beam model** (modelo de haz): compara cada rango medido $z_k$ con el rango **esperado** $\hat{r}$ a lo largo del haz.
  - **Likelihood field** (campo de verosimilitud): mira la **distancia del extremo del haz al obstáculo más cercano**.
- **Aplicaciones:** se usan sobre todo para **localización con filtros de partículas**. Por ejemplo, **AMCL en ROS 2** admite los dos modelos: cada partícula (hipótesis de pose) se **repondera** con $p(\mathbf{z} \mid \mathbf{x}, \mathbf{m})$.

### 7.2. Beam model: idea

**Ejemplo con 3 sensores de rango (scan láser)** a −90°, 0° y 90°: para una pose candidata $\mathbf{x}$ y el mapa $\mathbf{m}$, cada haz tiene un **rango predicho** $\hat{d}_i = h_i(\mathbf{x}, \mathbf{m})$. La verosimilitud $p(d_i \mid \mathbf{x}, \mathbf{m})$ es el valor de la gaussiana (centrada en $\hat{d}_i$) **en la medida observada** $d_i$:

$$
p(d_1, d_2, d_3 \mid \mathbf{x}, \mathbf{m}) = \prod_{k=1}^{3} p(d_k \mid \mathbf{x}, \mathbf{m})
$$

### 7.3. Las cuatro componentes del beam model

![Las cuatro componentes del beam model](img/13_beam_componentes.png)

$z_{exp}$ (el rango esperado) se obtiene por **ray casting** (trazado de rayos) sobre el mapa conocido $\mathbf{m}$ desde la pose $\mathbf{x}$. $z_{max}$ es el rango máximo del sensor.

**1. Hit: medida alrededor del rango esperado** (ruido de medida)

$$
p_{hit}(z \mid \mathbf{x}, \mathbf{m}) = \eta_{hit}\,\frac{1}{\sigma\sqrt{2\pi}}\exp\!\left(-\frac{(z - z_{exp})^2}{2\sigma^2}\right), \qquad 0 \le z \le z_{max}
$$

$\eta_{hit}$ normaliza la gaussiana **truncada** a $[0, z_{max}]$ (si $z_{exp}$ está lejos de 0 y de $z_{max}$, $\eta_{hit} \approx 1$).

**2. Unexpected: obstáculo antes del rango esperado** (personas, objetos que no están en el mapa)

$$
p_{unexp}(z \mid \mathbf{x}, \mathbf{m}) = \begin{cases} \eta_{unexp}\,\lambda e^{-\lambda z} & 0 \le z < z_{exp} \\ 0 & \text{en otro caso} \end{cases}
\qquad \eta_{unexp} = \frac{1}{1 - e^{-\lambda z_{exp}}}
$$

Es una exponencial **decreciente**: un obstáculo inesperado es **más probable cerca del sensor** (si hay varios, el haz se queda con el primero). $\eta_{unexp}$ normaliza la exponencial truncada a $[0, z_{exp}]$.

**3. Random: medida aleatoria** (espurias: interferencias, multitrayecto, errores del sensor)

$$
p_{rand}(z \mid \mathbf{x}, \mathbf{m}) = \begin{cases} \dfrac{1}{z_{max}} & 0 \le z < z_{max} \\ 0 & \text{en otro caso} \end{cases}
$$

Cualquier distancia es igual de probable (uniforme).

**4. Max range: no se recibe eco**

$$
p_{max}(z \mid \mathbf{x}, \mathbf{m}) = \begin{cases} 1 & z = z_{max} \\ 0 & \text{en otro caso} \end{cases}
$$

No se detecta ningún obstáculo dentro del alcance (superficies especulares, negras, cristal...) y el sensor devuelve $z_{max}$.

> **Aclaración:** $p_{max}$ no es una densidad «normal», sino un pico concentrado en $z_{max}$ (una masa de probabilidad puntual). En la práctica se implementa como un intervalo muy estrecho alrededor de $z_{max}$.

### 7.4. Beam model combinado: modelo de mezcla

![Modelo de mezcla del beam model](img/14_beam_mezcla.png)

$$
\boxed{\,p(z \mid \mathbf{x}, \mathbf{m}) = \alpha_{hit}\,p_{hit}(z \mid \mathbf{x}, \mathbf{m}) + \alpha_{unexp}\,p_{unexp}(z \mid \mathbf{x}, \mathbf{m}) + \alpha_{rand}\,p_{rand}(z \mid \mathbf{x}, \mathbf{m}) + \alpha_{max}\,p_{max}(z \mid \mathbf{x}, \mathbf{m}), \qquad \sum_i \alpha_i = 1\,}
$$

- Como los pesos suman 1 y cada componente integra 1, la mezcla es una densidad válida: $\int_0^\infty p(z \mid \mathbf{x}, \mathbf{m})\,dz = 1$.
- Forma: decreciente cerca de 0 (unexpected) + campana en $z_{exp}$ (hit) + fondo plano (random) + pico en $z_{max}$ (max).
- **Calcular $p(z \mid \mathbf{x}, \mathbf{m})$ para un haz:** (1) ray casting desde $\mathbf{x}$ en el mapa $\mathbf{m}$; (2) obtener $z_{exp}$; (3) evaluar la mezcla. Esto es **costoso para escáneres láser** (muchos rayos).
- **El beam model es un modelo de sensor multimodal y no gaussiano.**

> **Ejemplo resuelto (evaluar la mezcla de un haz).** Parámetros: $z_{max} = 10$ m, $z_{exp} = 4$ m (por ray casting), $\sigma = 0{,}2$ m, $\lambda = 0{,}5$ m$^{-1}$, $\alpha_{hit} = 0{,}7$, $\alpha_{unexp} = \alpha_{rand} = \alpha_{max} = 0{,}1$.
>
> **Constantes:** $\eta_{hit} \approx 1$ ($z_{exp} = 4$ está a $20\sigma$ de los extremos); $\eta_{unexp} = \dfrac{1}{1 - e^{-0{,}5 \cdot 4}} = \dfrac{1}{1 - 0{,}1353} = 1{,}1565$; $p_{rand} = 1/10 = 0{,}1$.
>
> **Caso a) $z = 4{,}1$ m** (cerca de lo esperado):
>
> - $p_{hit} = \dfrac{1}{0{,}2\sqrt{2\pi}}e^{-\frac{0{,}1^2}{2 \cdot 0{,}04}} = 1{,}995 \cdot e^{-0{,}125} = 1{,}995 \cdot 0{,}8825 = 1{,}760$.
> - $p_{unexp} = 0$ (porque $z \ge z_{exp}$); $p_{rand} = 0{,}1$; $p_{max} = 0$.
> - $p = 0{,}7 \cdot 1{,}760 + 0{,}1 \cdot 0{,}1 = 1{,}232 + 0{,}010 = 1{,}242$.
>
> **Caso b) $z = 2$ m** (algo se cruzó antes de la pared):
>
> - $p_{hit} \approx 0$ (está a $10\sigma$); $p_{unexp} = 1{,}1565 \cdot 0{,}5 \cdot e^{-1} = 1{,}1565 \cdot 0{,}5 \cdot 0{,}3679 = 0{,}2127$; $p_{rand} = 0{,}1$.
> - $p = 0{,}1 \cdot 0{,}2127 + 0{,}1 \cdot 0{,}1 = 0{,}0213 + 0{,}0100 = 0{,}0313$.
>
> **Caso c) $z = 6$ m** (más lejos que la pared: imposible salvo error):
>
> - $p_{hit} \approx 0$; $p_{unexp} = 0$ ($z > z_{exp}$); $p = 0{,}1 \cdot 0{,}1 = 0{,}01$. Solo la componente aleatoria lo «explica».
>
> **Caso d) $z = z_{max} = 10$ m** (sin eco): $p = \alpha_{max} \cdot 1 = 0{,}1$ ($p_{rand} = 0$ porque la uniforme es para $z < z_{max}$).
>
> **Conclusión:** gracias a las componentes no gaussianas, ninguna medida da verosimilitud cero; si solo hubiera $p_{hit}$, un único haz bloqueado por una persona anularía la verosimilitud de la pose correcta.

### 7.5. Aprendizaje de los parámetros de la mezcla

¿Cómo se estiman $\alpha_{hit}$, $\alpha_{unexp}$, $\alpha_{rand}$ y $\alpha_{max}$ con datos reales?

1. **Recoger datos de calibración:** colocar el robot/sensor a una **distancia conocida** en un mapa conocido (p. ej. frente a una pared), obtener por ray casting el rango esperado (p. ej. $z_{exp} = 300$ cm) y tomar **muchas medidas** $z$.
2. **Ajustar el modelo de mezcla** al histograma de las medidas: unexpected (exponencial), hit (gaussiana), random (uniforme), max (pico en $z_{max}$).
3. **Estimar los parámetros por máxima verosimilitud:**

$$
\Theta^* = \arg\max_{\Theta} \sum_i \log p\big(z^{(i)} \mid \mathbf{x}^{(i)}, \mathbf{m};\, \Theta\big), \qquad \Theta = \{\alpha_{hit}, \alpha_{unexp}, \alpha_{rand}, \alpha_{max}, \sigma_{hit}, \lambda_{unexp}\}
$$

**Solución típica: Expectation–Maximization (EM):** **inicializar** $\Theta$ → **paso E:** asignar a cada medida su «responsabilidad» en cada componente de la mezcla → **paso M:** actualizar los $\alpha$ y los parámetros de forma → repetir.

> **Conclusión de la diapositiva:** los pesos aprendidos indican **con qué frecuencia ocurre cada causa física**. En la práctica, con el **láser** la componente **hit** sale **más fuerte que con el sonar** (el sonar tiene más ecos perdidos y rebotes).

### 7.6. Verosimilitud de un scan completo con el beam model

**Para cada haz $k$ (con $\mathbf{x}$ y $\mathbf{m}$ conocidos):**

1. Trazar el rayo desde la pose del sensor $\mathbf{x}$ sobre el mapa $\mathbf{m}$ (**ray casting**).
2. El **primer impacto** da el **rango esperado** $z_k^{exp}$.

**Algoritmo `beam_range_finder_model(x, m)`:**

```text
1  q = 1
2  for k = 1 to K do
3      calcular z_k^exp con ray casting (primer impacto)
4      p = α_hit·p_hit(d_k | z_k^exp) + α_unexp·p_unexp(d_k) + α_rand·p_rand(d_k) + α_max·p_max(d_k)
5      q = q · p
6  end for
7  return q
```

$$
\boxed{\,p(\{d_1, \ldots, d_K\} \mid \mathbf{x}, \mathbf{m}) = \prod_{k=1}^{K} p(d_k \mid \mathbf{x}, \mathbf{m})\,}
$$

![Verosimilitud de un scan sobre todas las poses posibles](img/15_beam_verosimilitud_scan.png)

**Mapa de verosimilitud del scan sobre todas las poses:** para cada pose candidata se hace ray casting del scan esperado, se compara cada haz medido con el esperado y se multiplican las verosimilitudes. Las **zonas brillantes** son poses cuyo scan predicho coincide con el observado. Puede haber **varias zonas** compatibles (pasillos parecidos): la verosimilitud es **multimodal**.

> **Ejemplo resuelto (scan de 3 haces).** Con los parámetros del ejemplo de la sección 7.4 y suponiendo $z_{exp} = 4$ m para los tres haces, se miden $d_1 = 4{,}1$, $d_2 = 2$ y $d_3 = 6$ m:
>
> 1. Verosimilitudes individuales (ya calculadas): $1{,}242$; $0{,}0313$; $0{,}0100$.
> 2. Producto: $p(\mathbf{z} \mid \mathbf{x}, \mathbf{m}) = 1{,}242 \cdot 0{,}0313 \cdot 0{,}01 \approx 3{,}9 \times 10^{-4}$.
> 3. En logaritmos: $\ln 1{,}242 + \ln 0{,}0313 + \ln 0{,}01 = 0{,}217 - 3{,}465 - 4{,}605 = -7{,}853$.
>
> Para comparar poses candidatas basta comparar estas sumas de logaritmos: la de mayor valor es la más compatible.

**Inconvenientes del beam model:**

- **No es suave respecto a $\mathbf{x}$**: pequeños obstáculos y bordes del mapa hacen que un pequeño cambio de pose cambie mucho $z_{exp}$ (y la verosimilitud).
- **Computacionalmente costoso:** requiere ray casting para cada haz.

### 7.7. Likelihood field (modelo de campo de verosimilitud)

- **Idea:** en lugar de seguir el haz entero, **solo se comprueban los extremos (*end points*) del haz láser**. También se llama **modelo de extremo de haz** (*endpoint model*).
- Dado un mapa de rejilla $\mathbf{m}$, el campo de verosimilitud se calcula **sin ninguna suposición sobre dónde está el sensor**.
- Si el mapa es **estático**, el campo se calcula **una sola vez**.
- **Los extremos de un scan $\mathbf{z}$ sobre el mapa $\mathbf{m}$ deben caer en regiones de alta verosimilitud** (cerca de obstáculos).

![Likelihood field: mapa, campo precalculado y evaluación de los extremos](img/16_likelihood_field.png)

**1. Mapa de rejilla $\mathbf{m}$** (ocupación, entorno estático): celdas libres y celdas de obstáculo.

**2. Campo de verosimilitud precalculado $L(\mathbf{q})$:** para cada celda $\mathbf{q}$ se calcula la distancia al obstáculo más cercano y se convierte en un valor de verosimilitud:

$$
\boxed{\,d(\mathbf{q}) = \min_{\mathbf{o} \in O}\lVert \mathbf{q} - \mathbf{o} \rVert, \qquad
L(\mathbf{q}) = \alpha_{hit}\,\frac{1}{\sqrt{2\pi}\,\sigma}\exp\!\left(-\frac{d(\mathbf{q})^2}{2\sigma^2}\right) + \alpha_{rand}\,\frac{1}{z_{max}}\,}
\qquad (\alpha_{hit} + \alpha_{rand} = 1)
$$

Componente **gaussiana** (cercanía a un obstáculo) + componente **uniforme** (medidas aleatorias). $O$ es el conjunto de celdas ocupadas.

**3. Evaluar el extremo de un haz:** dada la pose $\mathbf{x} = [x, y, \theta]^T$ y la medida $\mathbf{z}_k = [r_k, \alpha_k]^T$:

$$
\boxed{\,\mathbf{q}_k = \begin{bmatrix} x + r_k\cos(\theta + \alpha_k) \\ y + r_k\sin(\theta + \alpha_k) \end{bmatrix}, \qquad p(\mathbf{z}_k \mid \mathbf{x}, \mathbf{m}) \approx L(\mathbf{q}_k)\,}
$$

La verosimilitud de ese haz es el valor del campo precalculado en el extremo $\mathbf{q}_k$ (¡la misma fórmula que la posición de un landmark, sección 6.4!).

**4. Verosimilitud frente a distancia al obstáculo:** $L$ es máxima a distancia 0 y cae como una gaussiana hasta quedarse en el **suelo** que pone la componente uniforme.

**5. Verosimilitud del scan completo** (independencia condicional entre haces):

$$
p(\mathbf{z} \mid \mathbf{x}, \mathbf{m}) \approx \prod_{k=1}^{K} p(\mathbf{z}_k \mid \mathbf{x}, \mathbf{m}) \approx \prod_{k=1}^{K} L(\mathbf{q}_k)
$$

> **Ejemplo resuelto (likelihood field).** Robot en $\mathbf{x} = [1, 1, 0°]^T$; un haz mide $r_k = 3$ m a $\alpha_k = 90°$. Parámetros: $\sigma = 0{,}2$ m, $\alpha_{hit} = 0{,}9$, $\alpha_{rand} = 0{,}1$, $z_{max} = 10$ m.
>
> 1. Extremo: $\mathbf{q}_k = [1 + 3\cos 90°,\ 1 + 3\sin 90°] = [1,\ 4]$ m.
> 2. Consultar en el campo precalculado la distancia al obstáculo más cercano. Según el valor:
>
> | $d(\mathbf{q}_k)$ | Gaussiana: $0{,}9 \cdot \frac{1}{0{,}2\sqrt{2\pi}}e^{-d^2/0{,}08}$ | $+\ 0{,}1/10$ | $L(\mathbf{q}_k)$ |
> |---|---|---|---|
> | $0$ m (cae en la pared) | $0{,}9 \cdot 1{,}995 = 1{,}795$ | $0{,}01$ | $1{,}805$ |
> | $0{,}1$ m | $1{,}795 \cdot e^{-0{,}125} = 1{,}584$ | $0{,}01$ | $1{,}594$ |
> | $0{,}3$ m | $1{,}795 \cdot e^{-1{,}125} = 0{,}583$ | $0{,}01$ | $0{,}593$ |
> | $1{,}0$ m | $1{,}795 \cdot e^{-12{,}5} \approx 0{,}000007$ | $0{,}01$ | $0{,}010$ |
>
> Lejos de cualquier obstáculo, solo queda el «suelo» uniforme $\alpha_{rand}/z_{max} = 0{,}01$: nunca vale 0.
>
> **Otro extremo:** robot en $[2, 1, 30°]^T$, haz con $r = 4$ m y $\alpha = 60°$ → $\theta + \alpha = 90°$ → $\mathbf{q} = [2,\ 1 + 4] = [2,\ 5]$ m.

> **Nota sobre la diapositiva:** la gráfica de $L$ frente a $d$ está dibujada con máximo 1 (normalizada), pero con la fórmula, si $\sigma$ es pequeña, el valor en $d = 0$ puede ser mayor que 1 (como en el ejemplo: 1,805). Lo que importa es la **forma**: máximo sobre los obstáculos, caída gaussiana y suelo uniforme.

### 7.8. Propiedades y usos del likelihood field

1. **Muy eficiente:** solo usa **tablas de consulta 2D** (el campo precalculado).
2. **Suave respecto a pequeños cambios de la pose:** la verosimilitud varía poco con movimientos pequeños (p. ej. $L(\mathbf{x}) = 0{,}72$ y $L(\mathbf{x} + \delta\mathbf{x}) = 0{,}68$).
3. **Ignora las propiedades físicas del haz:** no modela el camino completo del haz; en el modelo el haz puede **«atravesar» objetos** (solo importa dónde acaba), pero en la práctica funciona bastante bien.
4. **Usos principales:**
   - **Scan matching:** un scan define un campo de verosimilitud y se optimiza la verosimilitud del siguiente scan con un método basado en gradiente (p. ej. **Gauss–Newton**) para alinearlos.
   - **Localización con filtro de partículas:** se usa el campo para **ponderar las partículas** según la verosimilitud del scan observado.

**Comparación de los dos modelos de scan:**

| | **Beam model** | **Likelihood field** |
|---|---|---|
| Qué compara | Rango medido $z_k$ frente al rango esperado $z_k^{exp}$ a lo largo del haz | Distancia del **extremo** del haz al obstáculo más cercano |
| Necesita ray casting | **Sí**, para cada haz y cada pose | **No**; el campo se precalcula una vez (mapa estático) |
| Coste | Alto | Bajo (tablas 2D) |
| Suavidad respecto a $\mathbf{x}$ | No es suave (bordes, obstáculos pequeños) | Suave |
| Física del haz | La modela (obstáculos inesperados, max range...) | La ignora (el haz puede «atravesar» objetos) |
| Componentes | hit + unexpected + random + max | Gaussiana (hit) + uniforme (random) |

---

## 8. Resumen del tema

![Resumen: de las medidas físicas a los modelos probabilísticos de sensores](img/17_resumen_tema.png)

1. **Sensores y medidas:** rango, bearing; GPS, sonar, LiDAR; cámaras (monocular, estéreo, RGB-D).
2. **Incertidumbre de la medida:** las medidas repetidas no son idénticas; se modelan como una variable aleatoria $Z$ con realización $z$, normalmente con ruido gaussiano. Hay muchas medidas y se supone independencia condicional.
3. **Modelo probabilístico del sensor:** predicción ideal $\mathbf{z} = \mathbf{h}(\mathbf{x}, \mathbf{m})$; modelo $p(\mathbf{z} \mid \mathbf{x}, \mathbf{m})$; PDF sobre $z$ ⇔ verosimilitud sobre $x$; el teorema de Bayes explica cómo se usa la verosimilitud.
4. **Modelos estudiados:** modelos de landmarks (rango y bearing) y modelos de scan (**beam model** y **likelihood field**).

**Idea central:** $p(\mathbf{z} \mid \mathbf{x}, \mathbf{m})$ describe **cómo dependen las observaciones del sensor de la pose del robot $\mathbf{x}$ y del mapa $\mathbf{m}$**.

---

## 9. Fórmulas para el examen

| Concepto | Fórmula | Cuándo se usa / notas |
|---|---|---|
| Sonar (ToF) | $r = \dfrac{c_s\,\Delta t}{2}$, $c_s \approx 343$ m/s | $\Delta t$ de **ida y vuelta** |
| LiDAR ToF pulsado | $r = \dfrac{c\,\Delta t}{2}$, $c \approx 3 \times 10^8$ m/s | 1 ns ↔ 15 cm |
| LiDAR por fase | $r = \dfrac{c\,\Delta\phi}{4\pi f_m}$; ambigüedad $r_{max} = \dfrac{c}{2 f_m}$ | $\Delta\phi$ en **radianes** |
| Error de reloj (GPS) | $\Delta r = c\,\delta t$ | 4 satélites: $x, y, z, \delta t$ |
| Trilateración 2D | $x = \dfrac{r_1^2 - r_2^2 + d^2}{2d}$, $y = \pm\sqrt{r_1^2 - x^2}$ | Balizas en $(0,0)$ y $(d,0)$; 2 soluciones |
| Separación lateral | $s \approx r\,\Delta\alpha$ (rad); anchura de cono $2r\tan(\beta/2)$ | Resolución LiDAR / sonar |
| Ángulo del haz $k$ | $\alpha_k = \alpha_{min} + k\,\Delta\alpha$ | Scans láser |
| Gaussiana 1D | $\mathcal{N}(z; \mu, \sigma^2) = \dfrac{1}{\sigma\sqrt{2\pi}}e^{-\frac{(z-\mu)^2}{2\sigma^2}}$ | A $1\sigma$: 60,7 % del pico |
| Sesgo de escala | $Z \mid v \sim \mathcal{N}(\alpha v, \sigma^2(v))$ | Media $\neq$ verdad |
| Modelo gaussiano | $\mathbf{z} = \mathbf{h}(\mathbf{x}, \mathbf{m}) + \mathbf{w}$, $\mathbf{w} \sim \mathcal{N}(\mathbf{0}, Q)$ | $p(\mathbf{z} \mid \mathbf{x}, \mathbf{m}) = \mathcal{N}(\mathbf{z}; \mathbf{h}, Q)$ |
| Independencia condicional | $p(\mathbf{z} \mid \mathbf{x}, \mathbf{m}) = \prod_k p(z_k \mid \mathbf{x}, \mathbf{m})$ | Producto (o suma de logaritmos) |
| Bayes | $p(\mathbf{x} \mid \mathbf{z}, \mathbf{m}) \propto p(\mathbf{z} \mid \mathbf{x}, \mathbf{m})\,p(\mathbf{x} \mid \mathbf{m})$ | Posterior ∝ verosimilitud × prior; normalizar |
| Rango y bearing predichos | $\hat{d} = \sqrt{(x_i - x)^2 + (y_i - y)^2}$; $\hat{\alpha} = \operatorname{atan2}(y_i - y, x_i - x) - \theta$ | **atan2** y **restar $\theta$** |
| Verosimilitud 2D | $\dfrac{1}{2\pi\lvert Q\rvert^{1/2}}\exp\{-\tfrac12\mathbf{e}^TQ^{-1}\mathbf{e}\}$, $\mathbf{e} = \mathbf{z} - \mathbf{h}$ | $Q$ diagonal: $\mathbf{e}^TQ^{-1}\mathbf{e} = \sum (e_j/\sigma_j)^2$ |
| Posición del landmark | $\mathbf{m} = [x + r\cos\phi,\ y + r\sin\phi]^T$, $\phi = \theta + \alpha$ | También el extremo $\mathbf{q}_k$ de un haz |
| Polares → cartesianas | $\mathbf{z}_c = [r\cos\alpha,\ r\sin\alpha]^T$; $\dfrac{\partial \mathbf{z}_c}{\partial \mathbf{z}_p} = \begin{bmatrix} \cos\alpha & -r\sin\alpha \\ \sin\alpha & r\cos\alpha \end{bmatrix}$ | $\Sigma_{\mathbf{z}_c} = J\Sigma_{\mathbf{z}_p}J^T$ |
| Covarianza del landmark | $\Sigma_m \approx \mathbf{J}_x\Sigma_x\mathbf{J}_x^T + \mathbf{J}_z\Sigma_z\mathbf{J}_z^T$ | Suma de dos covarianzas |
| Jacobianos | $\mathbf{J}_x = \begin{bmatrix} 1 & 0 & -r\sin\phi \\ 0 & 1 & r\cos\phi \end{bmatrix}$; $\mathbf{J}_z = \begin{bmatrix} \cos\phi & -r\sin\phi \\ \sin\phi & r\cos\phi \end{bmatrix}$ | 2×3 y 2×2 |
| Beam: hit | $\eta_{hit}\dfrac{1}{\sigma\sqrt{2\pi}}e^{-\frac{(z - z_{exp})^2}{2\sigma^2}}$ en $[0, z_{max}]$ | $z_{exp}$ por **ray casting** |
| Beam: unexpected | $\eta_{unexp}\lambda e^{-\lambda z}$ en $[0, z_{exp})$; $\eta_{unexp} = \dfrac{1}{1 - e^{-\lambda z_{exp}}}$ | 0 si $z \ge z_{exp}$ |
| Beam: random | $1/z_{max}$ en $[0, z_{max})$ | Uniforme |
| Beam: max | $1$ si $z = z_{max}$ | Sin eco |
| Mezcla | $p = \alpha_{hit}p_{hit} + \alpha_{unexp}p_{unexp} + \alpha_{rand}p_{rand} + \alpha_{max}p_{max}$, $\sum\alpha_i = 1$ | Parámetros por máxima verosimilitud (EM) |
| Likelihood field | $L(\mathbf{q}) = \alpha_{hit}\dfrac{1}{\sqrt{2\pi}\sigma}e^{-\frac{d(\mathbf{q})^2}{2\sigma^2}} + \dfrac{\alpha_{rand}}{z_{max}}$; $p(\mathbf{z}_k \mid \mathbf{x}, \mathbf{m}) \approx L(\mathbf{q}_k)$ | $d(\mathbf{q})$ = distancia al obstáculo más cercano |

**Datos que conviene recordar:**

| Sensor | Dato |
|---|---|
| GPS | Satélites a ~20 200 km, órbita de ~12 h, 6 planos; ≥ 4 satélites; GPS 3–10 m, DGPS 0,5–3 m, RTK 1–5 cm |
| Sonar | > 20 kHz; haz ≈ 30°; alcance 2–4 m; barato y de bajo consumo |
| Infrarrojos | Triangulación; ~2 m; buena resolución angular; problemas con transparentes, brillantes, negros y luz solar |
| LiDAR | Haz 0,1°–1°; precisión ~1–5 cm; hasta 200 m o más; Hokuyo UTM-30LX: 30 m, FOV 270° |
| RGB-D | Color + profundidad por píxel; sin partes móviles; ~0,2–4 m (interiores) |
| Cámara | Monocular: solo bearing; estéreo: rango + bearing (triangulación) |

---

## 10. Errores típicos

1. **Olvidar el 2 en el tiempo de vuelo:** $\Delta t$ es de **ida y vuelta**, $r = c\,\Delta t/2$.
2. **Mezclar grados y radianes:** las varianzas angulares van en rad² ($\sigma_\theta = 5° \to 0{,}0873$ rad $\to 0{,}007615$ rad²), y $\Delta\phi$ en la fórmula de fase va en radianes. Los senos y cosenos dan igual, pero $s = r\,\Delta\alpha$ y los jacobianos multiplican por $r$ un ángulo en radianes.
3. **Poner $\sigma$ en lugar de $\sigma^2$ en la covarianza:** $\Sigma = \operatorname{diag}(\sigma_x^2, \ldots)$, no $\operatorname{diag}(\sigma_x, \ldots)$.
4. **Bearing sin restar la orientación del robot:** $\hat{\alpha} = \operatorname{atan2}(\Delta y, \Delta x) - \theta$. Y al pasar al global, **sumar**: $\phi = \theta + \alpha$.
5. **Usar atan en lugar de atan2:** atan pierde el cuadrante (p. ej. $\Delta x < 0$).
6. **No normalizar ángulos:** un error de bearing de 358° es en realidad −2°.
7. **Jacobiano con dimensiones mal:** $\partial \mathbf{m}/\partial \mathbf{x}$ es **2×3** (filas = salidas, columnas = entradas); $\partial \mathbf{m}/\partial \mathbf{z}$ es **2×2**.
8. **Olvidar uno de los dos términos de $\Sigma_m$:** la incertidumbre del landmark viene **de la pose y de la medida** (suma de dos covarianzas).
9. **Pensar que la verosimilitud es una distribución sobre $x$:** no integra 1 en $x$; para obtener la posterior hay que multiplicar por el prior y **normalizar**.
10. **Confundir PDF y verosimilitud:** misma expresión $p(z \mid x, m)$; en la PDF varía $z$ (con $x$ fijo), en la verosimilitud varía $x$ (con $z$ fijo).
11. **Creer que una densidad no puede pasar de 1:** $p(z)$ puede valer 1,76 o 5,59 si $\sigma$ es pequeña; lo que vale 1 es la **integral**.
12. **Beam model: aplicar $p_{unexp}$ más allá de $z_{exp}$** (vale 0 para $z \ge z_{exp}$) o **$p_{rand}$ en $z_{max}$** (vale 0 en $z = z_{max}$; ahí solo actúa $p_{max}$).
13. **Pesos de la mezcla que no suman 1:** $\alpha_{hit} + \alpha_{unexp} + \alpha_{rand} + \alpha_{max} = 1$ (en el likelihood field, $\alpha_{hit} + \alpha_{rand} = 1$).
14. **Likelihood field: medir la distancia desde el robot.** $d(\mathbf{q})$ es la distancia del **extremo del haz** al **obstáculo más cercano**, no la longitud del haz.
15. **Confundir qué modelo necesita ray casting:** el **beam model** sí (por haz y por pose); el **likelihood field** no (campo precalculado una vez).
16. **Pensar que el GPS necesita 3 satélites:** son **4** (posición 3D + desfase del reloj del receptor).
17. **Clasificar mal sensores:** encoder e IMU son **propioceptivos**; cámara y GPS son exteroceptivos **pasivos**; LiDAR, sonar y RGB-D son exteroceptivos **activos**.
18. **Monocular ≠ distancia:** una cámara monocular solo da **bearing**; para el rango hace falta estéreo, RGB-D o moverse y triangular.
