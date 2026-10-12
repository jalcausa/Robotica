---
title: "Primer parcial — Soluciones explicadas"
author: "Soluciones del banco de preguntas"
date: "5 de octubre de 2026"
lang: es-ES
---

# Primer parcial — Soluciones explicadas

Soluciones de [Preguntas_Parcial1.md](Preguntas_Parcial1.md), con la misma numeración.

- En la **Parte A**, la respuesta de las preguntas `E-n` es la que el Campus Virtual marcó como correcta. En las `T-n` y `P-n` reconstruidas, la respuesta sale de los apuntes del alumno y se comenta cuando hay matices.
- En la **Parte B**, todas las respuestas numéricas se han comprobado calculándolas.

## 0. Tabla rápida de respuestas

### 0.1. Parte A (exámenes anteriores)

| Pregunta | Resp. | Pregunta | Resp. | Pregunta | Resp. |
|---|---|---|---|---|---|
| E-1 | a, d | E-2 | A dep., B indep., C dep., D indep. | E-10 | b |
| T-1 | b | E-3 | a, b | E-19 | a |
| E-6 | c | E-4 | c | P-4 | b |
| E-9 | c | T-3 | b | E-18 | c |
| E-7 | a | T-4 | a, c, d | P-5 | (abierta) |
| E-11 | a, b | T-7 | b | T-11 | 1B, 2D, 3C, 4A |
| T-8 | a, c | E-5 | a | T-12 | 1B, 2C, 3A |
| T-9 | a, b, d | T-15 | c | T-13 | b |
| T-10 | a, b, c | T-22 | a | T-16 | 2×3 / 2m×3 |
| P-3 | (abierta) | E-8 | a | E-12 | b |
| T-2 | b | E-17 | a | E-13 | P, C, C, P, C |
| | | P-1 | (abierta) | E-14 | a |
| | | P-2 | `mu + sigma * np.random.randn(n)` | E-15 | a, b, d |
| | | | | E-20 | a, d |
| | | | | T-14 | b |
| | | | | T-17 | a |
| | | | | T-18 | c |
| | | | | T-19 | b |
| | | | | T-21 | 1B, 2C, 3A |
| | | | | T-23 | b, c |

### 0.2. Parte B (preguntas nuevas)

| Pregunta | Resp. | Pregunta | Resp. | Pregunta | Resp. | Pregunta | Resp. |
|---|---|---|---|---|---|---|---|
| N-1 | a, c | N-25 | b | N-49 | b | N-73 | b |
| N-2 | c | N-26 | b | N-50 | d | N-74 | b |
| N-3 | a | N-27 | b | N-51 | b | N-75 | a, b |
| N-4 | a, b, c | N-28 | b | N-52 | d | N-76 | a |
| N-5 | b | N-29 | b | N-53 | b | N-77 | b |
| N-6 | c | N-30 | a, b, c | N-54 | b | N-78 | d |
| N-7 | 1B, 2A, 3C | N-31 | b | N-55 | b | N-79 | b |
| N-8 | b | N-32 | a, b, d | N-56 | b | N-80 | a |
| N-9 | c | N-33 | b | N-57 | a, b | N-81 | a, b, d |
| N-10 | a, c | N-34 | b | N-58 | b | N-82 | a, b, c |
| N-11 | d | N-35 | a, b, d | N-59 | a, b, c | N-83 | b |
| N-12 | b | N-36 | b | N-60 | c | N-84 | b |
| N-13 | c | N-37 | b | N-61 | a, c | N-85 | a |
| N-14 | a | N-38 | b | N-62 | a, b | N-86 | 1B, 2A |
| N-15 | a, b | N-39 | a, b, d | N-63 | 1C, 2A, 3B, 4D | N-87 | b |
| N-16 | b | N-40 | a | N-64 | a, b, d | N-88 | b |
| N-17 | a | N-41 | b | N-65 | b | N-89 | a |
| N-18 | b | N-42 | b | N-66 | b | N-90 | a, b |
| N-19 | b | N-43 | a, b, c | N-67 | b | N-91 | a, b, c |
| N-20 | b | N-44 | b | N-68 | b | N-92 | a |
| N-21 | b | N-45 | S, A, S, A, A | N-69 | a | N-93 | b |
| N-22 | 1B, 2A | N-46 | b | N-70 | a, b, d | N-94 | b |
| N-23 | a | N-47 | b | N-71 | b | N-95 | a, b |
| N-24 | b | N-48 | b | N-72 | a, b, c | N-96 | a |
| | | | | | | N-97 | b |
| | | | | | | N-98 | a |
| | | | | | | N-99 | a |
| | | | | | | N-100 | a |
| | | | | | | N-101 | a |

---

# PARTE A — Soluciones de exámenes anteriores

## A.1. Introducción a la robótica autónoma

**E-1 → a, d.** Un robot autónomo toma decisiones a partir de datos sensoriales y puede operar en entornos no totalmente conocidos. b) y c) describen un **robot industrial** (brazo fijo, tareas repetitivas en un entorno estructurado).

**T-1 → b.** *Embodiment* significa que la inteligencia necesita un cuerpo que **perciba** el entorno y **actúe** sobre él (sistema sensoriomotor). La idea clave es «percibir y actuar».

## A.2. Cinemática de robots con ruedas

**E-6 → c.** El robot de ruedas **omnidireccionales** (tipo mecanum) puede desplazarse en cualquier dirección en cada instante, así que es holonómico. La bicicleta, el quad y el segway tienen velocidad lateral nula, por lo que son no holonómicos.

**E-9 → c.** Un chasis rígido rueda sin deslizar solo si las prolongaciones de los ejes de **todas** sus ruedas se cortan en **un único ICR**. En (c) las rectas se cortan en puntos distintos: no hay un ICR común y las ruedas deslizan. En (a) (Ackermann) y en (b) (diferencial) existe un único ICR. En (d) los ejes son paralelos, así que el ICR está en el infinito y el vehículo solo puede ir recto sin deslizar.

## A.3. Poses y transformaciones

**E-7 → a.** Es la composición $\mathbf{x}_t = \mathbf{x}_{t-1} \oplus \Delta\mathbf{x}_t$: se rota el incremento local con $\theta_{t-1}$, se suma la posición anterior y los ángulos se suman.
- b) da solo el incremento rotado: le falta sumar $[x_{t-1}, y_{t-1}]$.
- c) no aplica la matriz de rotación completa.
- d) no tiene sentido.

**E-11 → a, b.** $p$ es una **pose** y $a$, $a'$ son **puntos**. $a'$ son las coordenadas del punto vistas desde $p$.
- a) ✔ Un punto local se pasa a global componiéndolo con la pose: $a = p \oplus a'$.
- b) ✔ Despejando: $a' = \ominus p \oplus a$, que también se escribe $a \ominus p$.
- c) ✘ $a$ y $a'$ son puntos, no poses, así que no se puede invertir $a'$ para obtener una pose.
- d) ✘ La suma ordinaria ignora la rotación de $p$.

**T-8 → a, c.**
- a) ✔ $\ominus p_{23} = p_{32}$ (pose de 2 vista desde 3). Para ir de 3 a 2: de 3 se vuelve a 1 ($\ominus p_{13}$) y de 1 se va a 2 ($p_{12}$). El truco de los apuntes es recorrer las flechas con el dedo: si se recorre una flecha al revés, se invierte (se pasa de la punta al origen).
- b) ✘ El orden importa: lo correcto es $p_{23} = \ominus p_{12} \oplus p_{13}$.
- c) ✔ $p_2 = p_{02} = p_{01} \oplus p_{12}$.
- d) ✘ Con poses no se usa $+$: se usa $\oplus$.

## A.4. Modelos de movimiento deterministas

**T-9 → a, b, d.** La entrada es la pose en $t-1$ más un comando, que puede ser de velocidad (dimensión 2) o un incremento odométrico (dimensión 3). La pose nueva **siempre** se obtiene por composición. Con velocidades, primero se convierte $[v, \omega]$ en el incremento $[\frac{v}{\omega}\sin\omega\Delta t,\; \frac{v}{\omega}(1-\cos\omega\Delta t),\; \omega\Delta t]$. c) es falsa.

**T-10 → a, b, c.** La odometría integra las vueltas de las ruedas, así que falla si las ruedas deslizan, si los encoders se muestrean con un periodo demasiado largo o si el diámetro de las ruedas no es exacto. El mapa **no interviene** en la odometría.

**P-3 (abierta).**
1. `cov` es $2\times2$: es la covarianza de $[v, \omega]$.
2. `random.randn(2, 1)` genera un vector $2\times1$ de muestras $N(0, 1)$. Al multiplicarlo por `np.sqrt(cov)` se escala con la desviación típica, y el ruido añadido tiene **media 0** (es no sesgado).
3. El segundo `if` comprueba si $\omega = 0$ (movimiento recto). Hace falta porque, si no, `R = u[0]/u[1]` dividiría entre cero.
4. `R` $= v/\omega$ es el radio de curvatura: la distancia del centro del robot al ICR.

> **Aclaración:** la fórmula del `else` es la composición $\mathbf{x} \oplus \Delta\mathbf{x}$ ya desarrollada: $x + R[\sin(\theta + \omega\Delta t) - \sin\theta] = x + \Delta x\cos\theta - \Delta y\sin\theta$, con $\Delta x = R\sin\omega\Delta t$ y $\Delta y = R(1-\cos\omega\Delta t)$.

## A.5. Probabilidad y modelos de movimiento probabilísticos (L3)

**T-2 → b.** Para una variable continua, $P(X = x) = 0$ aunque la pdf $p(x)$ no sea cero. Solo los intervalos tienen probabilidad: $P(x_0 < X < x_0 + \delta x) \approx p(x_0)\,\delta x$.

**E-2 → A dependiente, B independiente, C dependiente, D independiente.** $x$ e $y$ son independientes si $p(x, y) = p(x)\,p(y)$. En la práctica, eso significa que la forma de $p(x \mid y)$ (un corte horizontal de la imagen) es la misma para cualquier $y$, salvo un factor de escala.
- A: dos manchas en diagonal; los cortes cambian según $y$ → dependientes.
- B: densidad alineada con los ejes; los cortes marcados con líneas verdes tienen la misma forma → independientes.
- C: elipse **inclinada**, es decir, correlación (covarianza fuera de la diagonal distinta de cero) → dependientes.
- D: elipse **alineada con los ejes** (covarianza diagonal) → independientes.

**E-3 → a, b.**
- a) ✔ Marginalización (regla de la suma).
- b) Es la respuesta marcada como correcta en la autoevaluación. Ojo: por probabilidad total, lo exacto es $p(x \mid y) = \int p(x \mid y, z)\,p(z \mid y)\,dz$. Escribir $p(z)$ en lugar de $p(z \mid y)$ solo es válido si $z$ es independiente de $y$.
- c) ✘ Para obtener $p(y)$ hay que integrar respecto a $x$, no a $y$.
- d) ✘ Integrar $p(x \mid y)$ respecto a $y$ no da la conjunta.

**E-4 → c (1/16).** «No mira al Norte ni al Oeste» = mira al Sur o al Este: $P(S) + P(E) = 1/6 + 1/3 = 1/2$. Por independencia, $P(3,2) \cdot 1/2 = 1/8 \cdot 1/2 = 1/16$.

**T-3 → b (1/3).** $P(\text{col } 4) = 0{,}1 + 0{,}1 + 0{,}1 = 0{,}3$. Por la definición de probabilidad condicionada, $P((3,4) \mid \text{col } 4) = P(3,4)/P(\text{col } 4) = 0{,}1/0{,}3 = 1/3$.

**T-4 → a, c, d.** Las elipses están inclinadas, luego hay covarianza cruzada distinta de cero: las variables están correlacionadas (dependientes) y la covarianza **no** es diagonal (b falsa). La media es el vector $[\mu_1, \mu_2]^T$ (centro de las elipses). Las elipses son curvas de igual densidad.

**T-7 → b.** El producto $\prod_k p(z_k \mid x, m)$ solo es válido si las observaciones son **condicionalmente independientes** dadas la pose (y el mapa): $p(z_1, z_2 \mid x) = p(z_1 \mid x)\,p(z_2 \mid x)$. Los apuntes avisan de no confundirlo con «i.i.d.» (que además supone la misma distribución para todas las medidas).

**E-5 → a.** En una transformación lineal la media se transforma igual ($A\mu + B$) y la covarianza queda $A\Sigma A^T$. El vector $B$ solo desplaza, no añade incertidumbre. Es el caso exacto de la propagación de primer orden de L3 ($F_a = A$).

**T-15 → c (11).** Con dos variables independientes: $\Sigma_z = H\Sigma_xH^T + 1\cdot\Sigma_e\cdot1 = 3\cdot1\cdot3 + 2 = 11$.

**T-22 → a.** Con $x' = x + u$ y variables independientes, las medias y las varianzas se suman: $N(1+1,\; 1+2) = N(2, 3)$. La incertidumbre siempre **aumenta** al moverse.

**E-8 → a.** El modelo de movimiento probabilístico es $p(x_t \mid u_t, x_{t-1})$: distribución de la pose actual **dados** la pose anterior y el comando.

**E-17 → a.** Cada punto es una realización de la pose obtenida al componer una acción ruidosa con la pose **ruidosa** anterior. Por eso la incertidumbre (las elipses) crece con el recorrido. Si se compusiera con la pose ideal (b), la dispersión no se acumularía. Los triángulos representan las poses ideales.

**P-1 (abierta).**
- `mu = 2`: el máximo está en $x = 2$.
- `sigma = 1`: la altura del pico de una gaussiana es $1/(\sigma\sqrt{2\pi})$, y $0{,}40 \approx 1/\sqrt{2\pi} = 0{,}399$.
- `min_interval = -5`, `max_interval = 5`: rango del eje $x$.
- `n_samples = 100`: con 10 puntos la curva saldría a trozos rectos, no tan suave.
- `plt.plot(X, res, 'r')`: el tercer argumento es el color/estilo (rojo).

**P-2 → `samples = mu + sigma * np.random.randn(n)`.** `randn` genera muestras de $N(0, 1)$. Para obtener $N(\mu, \sigma^2)$ se multiplica por la **desviación típica** $\sigma$ y se suma la media.

## A.6. Sensores y modelos de observación

**E-10 → b.** Si $z = h(x, m) + w$ con $w \sim N(0, Q)$, para $x$ y $m$ dados $h(x, m)$ es una constante, así que $z$ es una gaussiana centrada en $h(x, m)$ con la misma covarianza que el ruido: $N(h(x, m), Q)$. El jacobiano (a) solo aparecería si se propagara incertidumbre de $x$.

**E-19 → a.** `np.sqrt(np.sum((m - pose[0:2])**2, axis=0))` es la distancia euclídea a cada landmark: solo **rango** (el propio docstring lo dice: *range only*).

**P-4 → b.** `m` es el mapa completo, así que `z` es un **vector** con una distancia por landmark.

**E-18 → c.** Cada jacobiano debe multiplicar a la covarianza de **su** variable:
- `Jac_ap` (derivada respecto a la **pose**) va con `Qp1_w`, la covarianza de la pose ($3\times3$).
- `Jac_aa` (derivada respecto a la **medida**) va con `z1_car_rel[1]`, la covarianza de la medida en cartesianas ($2\times2$).
- Se suman porque son contribuciones independientes: $\Sigma = F_a\Sigma_aF_a^T + F_b\Sigma_bF_b^T$.

a) y b) emparejan cada jacobiano con la covarianza equivocada. d) traspone en el orden incorrecto.

**P-5.**
1. `Wz1` es la incertidumbre (covarianza) de la posición del landmark en el sistema del mundo.
2. `W1` 2×2, `Jac_pol_car` 2×2, `z1_car_rel[1]` 2×2, `Qp1_w` 3×3, `Jac_ap` 2×3, `Jac_aa` 2×2, `Wz1` 2×2. Es lo que en los apuntes aparece como «2x2 todo, 3x3».
3. y 4. Hay que repasar los notebooks correspondientes de localización.

**T-11 → 1B, 2D, 3C, 4A.** Beam model y likelihood field son modelos de **láser**. El range model encaja con un sensor de profundidad como una cámara estéreo (triangula distancias). El bearing model encaja con una **cámara** monocular (solo da un ángulo).

**T-12 → 1B, 2C, 3A.** Stand Alone < 10 m (el de los móviles); DGPS < 5 m (usa una base de referencia para corregir); RTK < 10 cm (DGPS con procesado más complejo; se usa en topografía).

**T-13 → b.** El GPS se basa **solo en medidas de distancia** (pseudodistancias) a los satélites. Como suele haber más satélites que incógnitas, se resuelve por mínimos cuadrados.

**T-16 → 2×3; con m observaciones, 2m×3.** El jacobiano tiene tantas filas como componentes de la medida y tantas columnas como componentes de la pose.

## A.7. Localización

**E-12 → b.** En $p(z_t \mid x_t, m)$, la medida $z_t$ y el mapa $m$ son **conocidos**. Durante el filtrado se evalúa como función de $x_t$ (es la *likelihood*).

**E-13 / T-20 → 1 Predicción, 2 Corrección, 3 Corrección, 4 Predicción, 5 Corrección.** La predicción usa el modelo de movimiento $g$ (media y covarianza predichas $\bar{\mu}_t$, $\bar{\Sigma}_t$). La corrección usa la observación: ganancia $K_t$, actualización de la media con la innovación $z_t - h(\bar{\mu}_t)$ y actualización de la covarianza.

**E-14 → a.** La función a minimizar debe ser un **escalar** (por ejemplo, una norma al cuadrado). $m_i - p \oplus x_i$ es un vector. b), c) y d) son equivalentes entre sí: c) desarrolla $p \oplus x_i = R(\theta)x_i + t$, y d) solo cambia el signo dentro de la norma.

**E-15 → a, b, d.** Las partículas son muestras de la distribución a posteriori; la *likelihood* (modelo de observación) cambia sus pesos; y pueden representar varias hipótesis a la vez. c) es falsa: el modelo de movimiento **mueve** las partículas, no las pesa.

**E-20 → a, d.**
- a) ✔ Cuanto mejor es la inicialización (odometría), menos iteraciones necesita Gauss-Newton.
- b) ✘ El jacobiano es (número de landmarks) × (grados de libertad), no al revés.
- c) ✘ Las distancias no dependen de la orientación, así que con un sensor de solo rango no se puede obtener $\theta$.
- d) ✔ La varianza de las medidas pondera los residuos y por tanto afecta a la solución (respuesta marcada como correcta en la autoevaluación).

**T-14 → b.** Es el problema de **asociación de datos** (correspondencia).

**T-17 → a.** Minimizar la suma de errores al cuadrado equivale a maximizar la verosimilitud cuando los errores son **gaussianos**.

**T-18 → c.** Según los apuntes, sin movimiento no se puede aplicar Kalman (necesita predicción) ni el filtro de partículas. Con un escaneo láser y un mapa de puntos se alinea el escaneo con el mapa (ICP / mínimos cuadrados).

**T-19 → b.** Tras aplicar la observación, las partículas tienen pesos muy distintos. El remuestreo replica las partículas de mayor peso y elimina las de menor peso, de modo que todas vuelven a pesar lo mismo y se evita la **degeneración**.

**T-21 → 1B, 2C, 3A.** Sabe aproximadamente dónde está → *tracking*. No lo sabe y lo sabe → localización global. No lo sabe y cree que sí (lo han movido) → robot secuestrado.

**T-23 → b, c.** La localización por mínimos cuadrados **no tiene modelo de movimiento**: usa observaciones y mapa, y puede ponderar las medidas con su covarianza (en los apuntes aparece una matriz de covarianza de las medidas). a) y d) corresponden al EKF y al filtro de partículas.

---

# PARTE B — Soluciones de las preguntas nuevas

## B.1. Introducción a la robótica autónoma (L1)

**N-1 → a, c.** El deliberativo percibe, construye un modelo del mundo, planifica y actúa. Es **lento** en entornos dinámicos (b falsa), y conectar sensores con actuadores directamente (d) es el paradigma **reactivo**.

**N-2 → c.** El híbrido combina una capa deliberativa con otra reactiva. Es el más usado y el foco del curso.

**N-3 → a.** «¿Dónde estoy?» = localización + mapping/SLAM. b) corresponde a «¿cómo llego de forma segura?» y c) a «¿cómo resuelvo mi misión?».

**N-4 → a, b, c.** d) es falsa: el **alto coste computacional** es precisamente una limitación de la robótica probabilística.

**N-5 → b.** Hipótesis de la encarnación (Linda Smith, 2005).

## B.2. Arquitecturas de control y ROS 2 (L2)

**N-6 → c.** La robustez es detectar y aislar fallos y degradar las prestaciones de forma controlada, por ejemplo usando sensores de respaldo.

**N-7 → 1B, 2A, 3C.** Shakey es el ejemplo del paradigma deliberativo (*sense–plan–act*). Arbib (1980) propuso el reactivo. Desde los años 90 se usa el híbrido.

**N-8 → b.** El Sequence avanza solo mientras los hijos devuelven `SUCCESS`. Al primer `FAILURE` devuelve `FAILURE` inmediatamente y no ejecuta los hijos siguientes.

**N-9 → c.** El Fallback pasa al siguiente hijo ante un `FAILURE`. B está `RUNNING`, así que el Fallback devuelve `RUNNING`.

**N-10 → a, c.** ROS 2 usa DDS, no tiene maestro central (descubrimiento distribuido) y cada nodo guarda sus parámetros (en ROS 1 había un servidor global). Python 2.7 era de ROS 1; ROS 2 usa Python 3.

**N-11 → d.** Las acciones están pensadas para tareas largas, con feedback periódico, resultado final y posibilidad de cancelación. Un servicio da una única respuesta y no es apropiado cancelarlo.

**N-12 → b.** `ros2 topic echo`. `list` enumera los topics; `interface show` muestra la definición del tipo de mensaje.

**N-13 → c.** `colcon build --packages-select package_1`, ejecutado desde la raíz del workspace.

**N-14 → a.** `geometry_msgs/msg/Twist`, con los campos `linear` y `angular` (`Vector3`).

## B.3. Cinemática de robots con ruedas (L3)

**N-15 → a, b.** El diferencial y el Ackermann son **no holonómicos**: su velocidad lateral es nula, tienen 3 componentes de pose y solo 2 controles.

**N-16 → b.** Intersección de las prolongaciones de los ejes de las ruedas.

**N-17 → a.**

$$
\omega = \frac{v_r - v_l}{l} = \frac{0{,}2}{0{,}4} = 0{,}5 \text{ rad/s}, \quad
v_P = \frac{v_l + v_r}{2} = 0{,}4 \text{ m/s}, \quad
R = \frac{v_P}{\omega} = 0{,}8 \text{ m}
$$

Comprobación: $R = \frac{l}{2}\frac{v_l + v_r}{v_r - v_l} = 0{,}2 \cdot \frac{0{,}8}{0{,}2} = 0{,}8$ m.

**N-18 → b.** $v_P = (v_l + v_r)/2 = 0$ y $\omega = 2v_r/l \neq 0$, luego $R = v_P/\omega = 0$: el robot gira sobre su punto $P$.

**N-19 → b.** Para girar a la derecha, la rueda izquierda (exterior a la curva) debe ir más rápido. Entonces $\omega < 0$ y $R < 0$ (el ICR queda a la derecha).

**N-20 → b.** $R = v_P/\omega = 2/\pi \approx 0{,}637$ m y $\Delta\theta = \omega\Delta t = \pi/2$:

$$
\Delta x = R\sin(\pi/2) = 0{,}637, \qquad \Delta y = R(1 - \cos(\pi/2)) = 0{,}637
$$

$\Delta y$ es positivo porque gira a la izquierda ($\omega > 0$). a) supondría movimiento recto.

**N-21 → b.** Un chasis rígido tiene un único $\omega$: la velocidad de guiñada alrededor del ICR. No hay que confundirla con $\omega_l$, $\omega_r$, que son las velocidades de giro de las ruedas sobre su eje.

**N-22 → 1B, 2A.**

**N-23 → a.** Es el caso límite $\omega \to 0$. No se calcula $R$, se usan directamente las fórmulas del movimiento recto.

## B.4. Poses planas y transformaciones (L3)

**N-24 → b.** Con $\theta_1 = 90^\circ$ ($\cos = 0$, $\sin = 1$):

$$
x = 1 + 3\cdot0 - 0\cdot1 = 1, \quad y = 2 + 3\cdot1 + 0\cdot0 = 5, \quad \theta = 90^\circ - 90^\circ = 0^\circ
$$

El robot mira al norte, avanza 3 m hacia el norte y luego gira 90° a la derecha. a) es la suma ordinaria, un error típico.

**N-25 → b.** $\ominus\mathbf{x} = [-x\cos\theta - y\sin\theta,\; x\sin\theta - y\cos\theta,\; -\theta] = [0,\; 2,\; -90^\circ]$.

**N-26 → b.** $\Delta x = (x_2 - x_1)\cos\theta_1 + (y_2 - y_1)\sin\theta_1 = 0 + 2 = 2$; $\Delta y = -(x_2 - x_1)\sin\theta_1 + (y_2 - y_1)\cos\theta_1 = 0$; $\Delta\theta = 90^\circ$. Desde $\mathbf{x}_1$, que mira al norte, $\mathbf{x}_2$ está 2 m **hacia delante**. a) es $\mathbf{x}_2 - \mathbf{x}_1$ en coordenadas globales, sin rotar.

**N-27 → b.** $\mathbf{r} = \mathbf{r}_1 + R_{90^\circ}\mathbf{r}_{12} = [3, 4] + [0, 1] = [3, 5]$. El eje $x$ local apunta hacia el $+y$ global.

**N-28 → b.**
- $\mathbf{x}_A \oplus \mathbf{x}_B$: se está en $(1, 0)$ mirando al norte y se avanza 1 m → $(1, 1)$, $90^\circ$.
- $\mathbf{x}_B \oplus \mathbf{x}_A$: se está en $(1, 0)$ mirando al este, se avanza 1 m y se gira → $(2, 0)$, $90^\circ$.

La composición **no es conmutativa**.

**N-29 → b.** $R^{-1} = R^T$ y la traslación inversa es $-R^T\mathbf{r}_1$.

**N-30 → a, b, c.**
- a) ✔ $p_{03} = p_{01} \oplus p_{13}$.
- b) ✔ $p_{12} = p_{10} \oplus p_{02}$.
- c) ✔ $p_{23} = p_{21} \oplus p_{13}$.
- d) ✘ Debería ser $p_{12} \oplus p_{23}$.
- e) ✘ Debería ser $p_3 \oplus (\ominus p_{23})$.

**N-31 → b.** Los índices interiores se cancelan en cadena: ${}^{0}T_{1}\,{}^{1}T_{2}\,{}^{2}T_{3} = {}^{0}T_{3}$.

**N-32 → a, b, d.** SE(2) **no** es conmutativo.

**N-33 → b.** Al añadir un 1 al vector, la traslación pasa a formar parte del producto matricial, y encadenar transformaciones se reduce a multiplicar matrices.

**N-34 → b.** Con $\theta = 180^\circ$ ($\cos = -1$, $\sin = 0$): $\ominus\mathbf{x}_{AB} = [-0\cdot(-1) - 2\cdot0,\; 0\cdot0 - 2\cdot(-1),\; -180^\circ] = [0,\; 2,\; -180^\circ]$, y $-180^\circ \equiv 180^\circ$.

> **Intuición:** B mira en sentido contrario a A, así que el eje $y$ de B apunta hacia el $-y$ de A. A queda 2 m «a la izquierda» de B.

## B.5. Modelos de movimiento deterministas y odometría (L3)

**N-35 → a, b, d.** c) es falsa: $\Delta\mathbf{x}_t^{odo}$ está en el sistema **local** de odometría en $t-1$.

**N-36 → b.** $\omega = 0$, luego $\Delta\mathbf{x} = [v\Delta t, 0, 0] = [1, 0, 0]$ en local. Como el robot mira al norte, avanza en $+y$: $\mathbf{x}_t = [1, 2, 90^\circ]$.

**N-37 → b.**
1. Incremento: con $\theta_{t-1}^{odo} = 0$, $\Delta\mathbf{x}^{odo} = [3-2,\; 2-1,\; 90^\circ] = [1,\; 1,\; 90^\circ]$.
2. Composición con $\mathbf{x}_{t-1} = [0, 0, 90^\circ]$: $x = 0 + 1\cdot0 - 1\cdot1 = -1$; $y = 0 + 1\cdot1 + 1\cdot0 = 1$; $\theta = 180^\circ$.

a) es el error de sumar el incremento como si fuera global.

**N-38 → b.** La pose odométrica está en su propio sistema y va acumulando deriva, así que se usa solo el incremento relativo entre dos lecturas.

**N-39 → a, b, d.** El encoder mide **incrementos de ángulo de la rueda**, no la posición absoluta del robot (c falsa).

**N-40 → a.** $\Delta s = (0{,}30 + 0{,}10)/2 = 0{,}2$ m; $\Delta\theta = (0{,}30 - 0{,}10)/0{,}4 = 0{,}5$ rad; $R = \Delta s/\Delta\theta = 0{,}4$ m.

**N-41 → b.** $\Delta x = R\sin\Delta\theta = 0{,}4 \cdot 0{,}4794 = 0{,}192$; $\Delta y = R(1 - \cos\Delta\theta) = 0{,}4 \cdot 0{,}1224 = 0{,}049$. $\Delta y > 0$ porque gira a la izquierda ($\Delta s_R > \Delta s_L$).

**N-42 → b.** $\delta t = 10$ ms y $\Delta t = 100$ ms, luego $N_t = 10$ incrementos por publicación.

**N-43 → a, b, c.** Medir distancias es tarea de un modelo de observación (sensor), no del modelo de movimiento.

**N-44 → b.** Con $v$ y $\omega$ constantes, cada tramo es un arco (o una recta si $\omega = 0$). La trayectoria es la composición de esos incrementos.

**N-45 → 1 S, 2 A, 3 S, 4 A, 5 A.** Los errores sistemáticos producen un sesgo repetible que se corrige calibrando (radios, distancia entre ruedas). Los aleatorios varían en cada ejecución (deslizamiento, cuantización, terreno).

## B.6. Código de prácticas (L3)

**N-46 → b.** `R = 1/(π/2) = 0,637`:
- `x = 0 - R·sin 0 + R·sin(π/2) = 0,637`
- `y = 0 + R·cos 0 - R·cos(π/2) = 0,637`
- `θ = π/2 ≈ 1,571`

Coincide con N-20.

**N-47 → b.** Con $\omega = 0$, `R = v/0` divide entre cero (en NumPy daría `inf`/`nan`).

**N-48 → b.** Incremento local: 2 m hacia delante ($x$ local) y giro a la derecha (ángulo **negativo**). a) giraría a la izquierda, c) se movería hacia la izquierda local y d) suma sin rotar.

**N-49 → b.** Rota `tob - toa` con $R(\theta_a)^T = \begin{bmatrix} c & s \\ -s & c \end{bmatrix}$: es exactamente $(\ominus\mathbf{x}_a) \oplus \mathbf{x}_b$ (sección 2.6 del resumen de L3).

**N-50 → d.** 8 m / 2 m = 4 pasos por lado × 4 lados = 16. Con 15 pasos el robot acaba en $(0, 2)$.

**N-51 → b.** `Jac_ap = J1(...)[0:2, :]` es 2×3 (2 coordenadas del landmark respecto a 3 de la pose); `Jac_aa = J2(...)[0:2, 0:2]` es 2×2; `Wz1` es la covarianza de una posición 2D, 2×2.

## B.7. Probabilidad y modelos de movimiento probabilísticos (L3)

**N-64 → a, b, d.** c) es falsa: la pdf es una **densidad**, no una probabilidad, y puede valer más de 1 (por ejemplo, una gaussiana con $\sigma = 0{,}1$ tiene un pico de $\approx 4$). Solo su integral tiene que valer 1.

**N-65 → b.** Para una variable continua, la probabilidad de un valor exacto es 0. $0{,}352$ es el valor de la densidad, no una probabilidad.

**N-66 → b.** $F_X(x) = P(X \leq x)$.

**N-67 → b.** $p(x \mid y) = p(x, y)/p(y) = 0{,}12/0{,}4 = 0{,}3$.

**N-68 → b.** Por probabilidad total: $p(x) = p(x \mid y_1)p(y_1) + p(x \mid y_2)p(y_2) = 0{,}2\cdot0{,}75 + 0{,}6\cdot0{,}25 = 0{,}15 + 0{,}15 = 0{,}30$.

**N-69 → a.** $p(x)\,p(y) = 0{,}5 \cdot 0{,}4 = 0{,}2 = p(x, y)$, así que se cumple la definición de independencia.

**N-70 → a, b, d.** La independencia condicional **no** implica independencia marginal (c falsa): dos variables pueden estar relacionadas a través de $Z$.

**N-71 → b.** Si se conocen $\mathbf{x}_{t-1}$ y $\mathbf{u}_t$, el resto del pasado no aporta información: $\mathbf{X}_t \perp \mathbf{X}_{1:t-2} \mid \mathbf{x}_{t-1}, \mathbf{u}_t$ y $\mathbf{X}_t \perp \mathbf{U}_{1:t-1} \mid \mathbf{x}_{t-1}, \mathbf{u}_t$.

**N-72 → a, b, c.** La diagonal contiene **varianzas**, que no pueden ser negativas (d falsa). $\Sigma = E[(\mathbf{x}-\boldsymbol{\mu})(\mathbf{x}-\boldsymbol{\mu})^T]$ es simétrica por construcción.

**N-73 → b.** La covarianza es diagonal (sin correlación), así que las elipses están alineadas con los ejes. La varianza en $x$ (4) es mayor que en $y$ (1), así que son más anchas en $x$ (desviación típica 2 frente a 1).

**N-74 → b.** La covarianza cruzada es negativa: si $x$ aumenta, $y$ tiende a disminuir. Las elipses quedan inclinadas «hacia abajo».

**N-75 → a, b.** Una covarianza tiene que ser **simétrica** y tener **varianzas no negativas** en la diagonal. c) tiene una varianza negativa y d) no es simétrica ($0{,}5 \neq 0{,}3$). b) es válida: además, $|\sigma_{xy}| = 1 \leq \sigma_x\sigma_y = 2$.

**N-76 → a.** Variables independientes que se suman: medias $5 + 2 = 7$, varianzas $0{,}5 + 0{,}3 = 0{,}8$.

**N-77 → b.** Media: $2\cdot3 + 1 = 7$. Varianza: $F\Sigma F^T = 2\cdot4\cdot2 = 16$. La constante $+1$ no aporta varianza.

**N-78 → d.** $\Sigma_z = F_a\Sigma_aF_a^T + F_b\Sigma_bF_b^T = 3^2\cdot1 + (-2)^2\cdot2 = 9 + 8 = 17$. El signo no importa porque aparece al cuadrado.

**N-79 → b.** $\bar z \approx f(\bar a) = 4$. Jacobiano: $F = 2\bar a = 4$, luego $\sigma_z^2 \approx 4\cdot0{,}1\cdot4 = 1{,}6$.

**N-80 → a.** $G_t = \partial\mathbf{g}_v/\partial\mathbf{x}_{t-1}$ es $3\times3$ (pose → pose). $V_t = \partial\mathbf{g}_v/\partial\tilde{\mathbf{u}}_t$ es $3\times2$ (velocidad → pose). $M_t = \mathrm{Cov}(\tilde{\mathbf{u}}_t)$ es $2\times2$.

**N-81 → a, b, d.** $M_t$ es la covarianza de $[v, \omega]$, así que es $2\times2$ (c falsa).

**N-82 → a, b, c.** Los dos términos se suman precisamente porque se supone que $\mathbf{x}_{t-1}$ y $\tilde{\mathbf{u}}_t$ son **independientes** (d falsa).

**N-83 → b.** Sin incertidumbre previa, el término $G_t\Sigma_{x_{t-1}}G_t^T$ desaparece y solo queda la incertidumbre del movimiento.

**N-84 → b.** $\Sigma_{x_t} = J\,\Sigma_{\Delta x^{odo}}\,J^T$ con $J = \partial\mathbf{g}_o/\partial\Delta\mathbf{x}^{odo} = \begin{bmatrix} 0 & -1 & 0 \\ 1 & 0 & 0 \\ 0 & 0 & 1 \end{bmatrix}$ (la rotación de $90^\circ$). Al rotar, se intercambian las varianzas de $x$ e $y$: $\mathrm{diag}(0{,}01;\; 0{,}04;\; 0{,}02)$.

> **Intuición:** el robot mira al norte, así que su incertidumbre «hacia delante» (local $x$, 0,04) queda en el eje $y$ global.

**N-85 → a.**
- $\bar\theta_1 = \mathrm{atan2}(1 - 0,\; 1 - 0) - 0 = 45^\circ$.
- $\bar d = \sqrt{1^2 + 1^2} = \sqrt{2}$.
- $\bar\theta_2 = 90^\circ - 0^\circ - 45^\circ = 45^\circ$.

**N-86 → 1B, 2A.** El ruido en la distancia dispersa las muestras a lo largo de la dirección de avance. El ruido en el giro inicial las reparte en un arco alrededor del punto de partida.

**N-87 → b.** $\Delta\theta = 0{,}5 \cdot 2 = 1$ rad $= 57{,}3^\circ$ y $R = 1/0{,}5 = 2$ m:

$$
\Delta x = 2\sin 1 = 1{,}683, \qquad \Delta y = 2(1 - \cos 1) = 0{,}919
$$

Como $\mathbf{x}_{t-1} = \mathbf{0}$, la pose final coincide con el incremento.

**N-88 → b.** Se multiplica por la **desviación típica**, $\sqrt{4} = 2$, no por la varianza (error de la opción a).

**N-89 → a.** El pico está en la media, así que `mu = 1`. Su altura es $1/(\sigma\sqrt{2\pi}) = 0{,}2$, luego $\sigma = 1/(0{,}2\sqrt{2\pi}) \approx 1{,}99 \approx 2$.

**N-90 → a, b.**
- c) ✘ Se aplica a los dos modelos, velocidad y odometría.
- d) ✘ Los errores sistemáticos se reducen con **calibración**; lo que se modela con una distribución de probabilidad es el error **aleatorio**.

**N-91 → a, b, c.** En la representación por muestras, cada muestra usa un comando **distinto**, extraído de la distribución del ruido (d falsa).

**N-92 → a.** La media se propaga evaluando la función no lineal en las medias: $\bar{\mathbf{x}}_t \approx \mathbf{g}_v(\bar{\mathbf{x}}_{t-1}, \mathbf{u}_t)$.

**N-93 → b.** Es la conclusión del ejemplo de las diapositivas: un mismo comando nominal produce poses finales distintas, porque el comando realmente ejecutado $\tilde{\mathbf{u}}$ es aleatorio.

### B.7.1. Preguntas añadidas con las diapositivas v6

**N-94 → b.** Según v6, un sentido de giro recorre los estados $00 \to 10 \to 11 \to 01 \to 00$ y el otro los recorre al revés, $00 \to 01 \to 11 \to 10 \to 00$. Si cambia el orden temporal, ha cambiado el sentido. La velocidad se vería en la frecuencia de las transiciones, no en su orden (a falsa). El índice es un canal aparte (c falsa).

**N-95 → a, b.** El número de transiciones da el ángulo girado y su orden temporal da el signo. c) es falsa porque la amplitud de los pulsos es siempre la misma (0/+5 V). d) es falsa porque el canal I da **un pulso por revolución**.

**N-96 → a.** Cada vuelta avanza $2\pi r = 2\pi\cdot0{,}05 = 0{,}314$ m. Repartido entre 2000 cuentas: $0{,}314/2000 \approx 1{,}57\cdot10^{-4}$ m $= 0{,}157$ mm.

**N-97 → b.** Para un $\tilde u_t$ fijo, la posición final es determinista, $x_t = x_{t-1} + \tilde u_t$, así que su densidad es una delta de Dirac. La a) es el resultado **después** de integrar sobre todos los $\tilde u_t$ posibles (probabilidad total).

**N-98 → a.** $p(x_t \mid x_{t-1}, u_t) = \int \delta\big(x_t - (x_{t-1} + \tilde u_t)\big)\,N(\tilde u_t; u_t, M_t)\,d\tilde u_t = N(x_t;\; x_{t-1} + u_t,\; M_t) = N(x_t;\; 5;\; 0{,}25)$. Como $x_{t-1}$ es exacta, toda la incertidumbre viene del movimiento ejecutado, y en 1-D el modelo es lineal, así que la varianza no cambia. La d) sería el caso sin ruido (modelo determinista).

**N-99 → a.** Es el ejemplo resuelto de v6:
- $x = 2 + 1\cdot\cos30^\circ - 0{,}2\sin30^\circ = 2 + 0{,}866 - 0{,}1 = 2{,}766$
- $y = 1 + 1\cdot\sin30^\circ + 0{,}2\cos30^\circ = 1 + 0{,}5 + 0{,}173 = 1{,}673$
- $\theta = 30^\circ + 10^\circ = 40^\circ$

b) suma el incremento como si estuviera en coordenadas globales. c) se equivoca con los signos de $\Delta y$ y d) intercambia senos y cosenos.

**N-100 → a.** $-\Delta x\sin\theta_{t-1} - \Delta y\cos\theta_{t-1} = -0{,}5 - 0{,}173 = -0{,}673$ y $\Delta x\cos\theta_{t-1} - \Delta y\sin\theta_{t-1} = 0{,}866 - 0{,}1 = 0{,}766$.

**N-101 → a.** Sin incertidumbre previa solo queda $F_u\Sigma_{\Delta x^{odo}}F_u^T$, con $F_u$ la rotación de $30^\circ$:
- $\sigma_x^2 = 0{,}09\cos^2 30^\circ + 0{,}01\sin^2 30^\circ = 0{,}0675 + 0{,}0025 = 0{,}070$
- $\sigma_y^2 = 0{,}09\sin^2 30^\circ + 0{,}01\cos^2 30^\circ = 0{,}0225 + 0{,}0075 = 0{,}030$
- $\sigma_{xy} = (0{,}09 - 0{,}01)\sin30^\circ\cos30^\circ = 0{,}08\cdot0{,}433 \approx 0{,}035$
- $\sigma_\theta^2 = 0{,}0027$

Al rotar una covarianza diagonal con varianzas distintas **aparece correlación**, así que b) y c) son falsas. El signo es positivo porque la mayor incertidumbre (la del avance local) queda orientada a $30^\circ$, en el primer cuadrante: si $x$ aumenta, $y$ también tiende a aumentar.

## B.8. Sensores y modelos de observación

**N-52 → d.** Solo ángulo → bearing model.

**N-53 → b.** RTK (< 10 cm) > DGPS (< 5 m) > Stand Alone (< 10 m).

**N-54 → b.** Una fila por medida (una distancia por landmark) y una columna por componente de la pose: $n \times 3$. Coincide con E-20 b, que era falsa por estar invertida.

**N-55 → b.** `arctan2(dy, dx) - θ` es el ángulo con el que se ve cada landmark respecto a la orientación del robot.

**N-56 → b.**

## B.9. Localización

**N-57 → a, b.** c) y d) pertenecen a la corrección.

**N-58 → b.** $R_t$ aparece sumado en la predicción de la covarianza (ruido de **movimiento**) y $Q_t$ en la ganancia, junto a la observación (ruido de **observación**). Fíjate en que el símbolo $R$ aquí **no** es una matriz de rotación.

**N-59 → a, b, c.** El filtro de partículas es **multimodal**: puede mantener varias hipótesis (d falsa).

**N-60 → c.** El robot no sabe dónde está, pero cree que sí: es el robot secuestrado.

**N-61 → a, c.**
- b) ✘ La localización por mínimos cuadrados no usa modelo de movimiento.
- d) ✘ Una sola distancia solo restringe el robot a una circunferencia, y además no da la orientación.

**N-62 → a, b.** c) ignora la pose del robot y d) no es un escalar.

**N-63 → 1C, 2A, 3B, 4D.**
