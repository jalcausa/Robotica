# Resumen general del Parcial 2

> **Qué entra:** L4 (percepción) y L5 (localización), más las prácticas 4.1, 4.2, 4.3, 5.2, 5.3, 5.4 y 6.3. Este documento junta lo imprescindible de todo el parcial en un solo sitio. Al final hay un **anexo con un ejercicio tipo resuelto de cada clase de pregunta** que puede salir.

> **Cómo es el examen:** la teoría pide **cálculos cortos con las fórmulas** (una distancia, un jacobiano, un paso de un filtro). Las prácticas preguntan por **el código de los notebooks**: rellenar huecos, encontrar la línea con el error y qué devuelve cada función.

> **Cómo usarlo:** lee las secciones 1 a 7 de un tirón para tener el mapa completo. Después haz los ejercicios del anexo **tapando la solución**. Si alguno se te atasca, el detalle está en el [resumen de L4](../../web/parcial2/Resumen_L4_Percepcion_Robot.html), el [resumen de L5](../../web/parcial2/Resumen_L5_Localizacion_Robot.html) y las guías de cada práctica. Para practicar con corrección automática, usa el [test del Parcial 2](../../web/parcial2/index.html#filters).

## Índice

1. El parcial en una página
2. L4 · Sensores y modelos de observación
3. L5 · Localización por optimización: mínimos cuadrados y registro
4. L5 · Filtros de Bayes: rejilla, Kalman, EKF y partículas
5. Las prácticas: lo que te van a preguntar del código
6. Hoja de fórmulas
7. Los errores que más puntos quitan
8. Anexo A · Ejercicios tipo de L4
9. Anexo B · Ejercicios tipo de L5
10. Anexo C · Ejercicios tipo de las prácticas
11. Anexo D · Preguntas rápidas de concepto

## 1. El parcial en una página

Todo el parcial gira alrededor de una idea: el robot **mide** el entorno con sus sensores, un **modelo** dice qué debería medir desde cada pose, y comparando lo medido con lo esperado se **estima** lo que no se conoce.

| Bloque | Pregunta que responde | Herramienta central |
|---|---|---|
| **L4 · Percepción** | ¿Qué mide cada sensor y con qué error? | $\mathbf{z} = \mathbf{h}(\mathbf{x}, \mathbf{m}) + \mathbf{w}$ y la verosimilitud $p(\mathbf{z} \mid \mathbf{x}, \mathbf{m})$ |
| **L5 · Localización** | ¿Dónde está el robot, dado un mapa? | Mínimos cuadrados, registro y filtros de Bayes |
| **P6.3 · Mapeado** | ¿Cómo es el mapa, dadas las poses? | Rejilla de ocupación con log odds |

**Qué se conoce y qué se estima en cada problema:**

| Problema | Se conoce | Se estima | Dónde sale |
|---|---|---|---|
| **Localización** | Mapa $\mathbf{m}$, observaciones $\mathbf{z}_{1:t}$, comandos $\mathbf{u}_{1:t}$ | Pose $\mathbf{x}_t$ | L5, P5.2, P5.3, P5.4 |
| **Mapeado** | Poses $\mathbf{x}_{1:t}$ y observaciones $\mathbf{z}_{1:t}$ | Mapa $\mathbf{m}$ | P6.3 |
| **SLAM** | Solo $\mathbf{z}_{1:t}$ y $\mathbf{u}_{1:t}$ | Pose y mapa a la vez | Fuera de este parcial |

**Notación que se usa en todo el documento:**

| Símbolo | Significado | En el código |
|---|---|---|
| $\mathbf{x} = [x, y, \theta]^T$ | Pose del robot | `pose`, `xEst`, `true_pose` (columna `(3, 1)`) |
| $\mathbf{z}$ | Observación (rango $r$ o $d$, bearing $\alpha$) | `z`, de forma `(2, n)` |
| $\mathbf{m}$, $\mathbf{m}_i$ | Mapa, landmark $i$ | `Map`, `w_map` |
| $\mathbf{h}(\mathbf{x}, \mathbf{m})$ | Medida esperada (sin ruido) | `observe(..., noisy=False)`, `distance()` |
| $Q$ | Covarianza del **sensor** (se usa al **corregir**) | `sensor.cov`, `Q_t` |
| $R$ | Covarianza del **movimiento** (se usa al **predecir**) | `cov_move` girada con `j2` |
| $\Sigma$ | Covarianza de la pose | `PEst`, `PPred` |
| $\oplus$, $\ominus$ | Composición e inversa de poses | `tcomp`, `tinv` |

> **Regla de oro de las covarianzas:** llevan **varianzas** ($\sigma^2$), los ángulos en **radianes**, y toda propagación lineal es $J\Sigma J^T$, con una suma por cada fuente de error independiente.

## 2. L4 · Sensores y modelos de observación

### 2.1. Clasificación y medidas geométricas

| Clasificación | Qué significa | Ejemplos |
|---|---|---|
| **Propioceptivo** | Mide el estado interno o el movimiento del robot | Encoder, IMU, batería |
| **Exteroceptivo pasivo** | Mide el entorno usando energía que ya está ahí | Cámara, receptor GPS |
| **Exteroceptivo activo** | Emite su propia energía y mide lo que vuelve | LiDAR, sonar, infrarrojos, RGB-D |

- **Landmark:** elemento reconocible del entorno que se asocia a un elemento del mapa. **Baliza (beacon):** landmark instalado a propósito, con posición conocida (satélite GPS, QR, reflector, antena WiFi). Da posicionamiento absoluto.
- **Rango** (distancia: sonar, LiDAR, GPS), **bearing** (ángulo respecto a hacia donde mira el robot: cámara monocular) y **rango + bearing** (LiDAR 2D, estéreo, RGB-D).
- **Triangulación** usa ángulos; **trilateración**, distancias. Con dos circunferencias en 2D hay **dos** soluciones; hace falta una tercera baliza no alineada.

### 2.2. GPS

- **Trilateración** con **pseudorangos** a satélites de posición conocida. Hacen falta **4 satélites**: $x$, $y$, $z$ y el desfase del reloj del receptor ($\Delta r = c\,\delta t$; 1 µs son 300 m).
- Errores: relojes, atmósfera, **multitrayecto** (cañón urbano) y pocos satélites visibles.
- Precisión: **GPS solo 3–10 m**, **DGPS 0,5–3 m** (estación de referencia), **RTK 1–5 cm** (fase de la portadora).

### 2.3. Sensores de rango y cámaras

| Sensor | Principio | Datos clave | Problemas |
|---|---|---|---|
| **Sonar** | Tiempo de vuelo del sonido: $r = c_s\Delta t/2$, $c_s \approx 343$ m/s | Haz ≈ 30°, 2–4 m, barato | Mala resolución lateral ($2r\tan(\beta/2)$), reflexión especular, esquinas, rebotes |
| **Infrarrojos** | Triangulación de luz | ~2 m, buena resolución angular | Transparentes, brillantes, negros, luz solar |
| **LiDAR (ToF)** | $r = c\Delta t/2$, $c = 3\cdot10^8$ m/s | Haz 0,1°–1°, ~1–5 cm, hasta 200 m | Lluvia, niebla, cristal, espejos; 1 ns = 15 cm |
| **LiDAR (fase)** | $r = \dfrac{c\,\Delta\phi}{4\pi f_m}$ | Sin ambigüedad hasta $c/(2f_m)$ | Más allá, el rango se repite |
| **Cámara monocular** | Un píxel define una recta | **Solo bearing** | No da distancia |
| **Estéreo / RGB-D** | Triangulación / profundidad por píxel | Rango + bearing; RGB-D ~0,2–4 m | Alcance corto |

**Haces de un scan:** $n = \lfloor\mathrm{FOV}/\Delta\alpha\rfloor + 1$ (se cuentan los dos extremos), $\alpha_k = \alpha_{min} + k\,\Delta\alpha$, y la separación entre dos puntos contiguos a distancia $r$ es $s \approx r\,\Delta\alpha$ (en radianes).

### 2.4. El modelo probabilístico del sensor

- Medida = verdad + error: $Z \sim \mathcal{N}(v, \sigma^2)$, con $p(z \mid v) = \dfrac{1}{\sigma\sqrt{2\pi}}e^{-\frac{(z-v)^2}{2\sigma^2}}$. El pico vale $1/(\sigma\sqrt{2\pi})$; a $1\sigma$, el 60,7 % del pico. **Una densidad puede pasar de 1.**
- **Modelo gaussiano:** $\mathbf{z} = \mathbf{h}(\mathbf{x}, \mathbf{m}) + \mathbf{w}$, con $\mathbf{w} \sim \mathcal{N}(\mathbf{0}, Q)$, así que $p(\mathbf{z} \mid \mathbf{x}, \mathbf{m}) = \mathcal{N}(\mathbf{z};\ \mathbf{h}(\mathbf{x}, \mathbf{m}),\ Q)$.
- **Independencia condicional:** dadas $\mathbf{x}$ y $\mathbf{m}$, las medidas se multiplican: $p(\mathbf{z} \mid \mathbf{x}, \mathbf{m}) = \prod_k p(z_k \mid \mathbf{x}, \mathbf{m})$. No es lo mismo que «iid».
- **PDF frente a verosimilitud:** es la misma expresión. Como PDF varía $z$ con $\mathbf{x}$ fijo, y **integra 1 en $z$**; como verosimilitud $L(\mathbf{x})$ varía $\mathbf{x}$ con $z$ fijo, y **no tiene por qué integrar 1**.
- **Bayes:** $p(\mathbf{x} \mid \mathbf{z}) \propto p(\mathbf{z} \mid \mathbf{x})\,p(\mathbf{x})$: verosimilitud × prior, y normalizar.
- **Mapa:** de landmarks (posición + descriptor; cámaras, balizas) o de rejilla de ocupación (probabilidad por celda; LiDAR, sonar).

### 2.5. Modelos de observación de landmarks

**Predicción (directa): desde la pose, qué debería medir.**

$$
\boxed{\hat{d} = \sqrt{\Delta x^2 + \Delta y^2},\qquad \hat{\alpha} = \operatorname{atan2}(\Delta y, \Delta x) - \theta},\qquad \Delta x = x_i - x,\ \Delta y = y_i - y
$$

**Inversa: dónde está el landmark que he medido.** Se **suma** la orientación:

$$
\boxed{\mathbf{m} = \mathbf{x} \oplus \mathbf{z}_c = \begin{bmatrix} x + r\cos(\theta + \alpha) \\ y + r\sin(\theta + \alpha) \end{bmatrix}},\qquad \mathbf{z}_c = [r\cos\alpha,\ r\sin\alpha]^T
$$

**Incertidumbre del landmark:** dos fuentes independientes que se suman, con $\phi = \theta + \alpha$:

$$
\Sigma_m = J_x\Sigma_xJ_x^T + J_z\Sigma_zJ_z^T,\quad
J_x = \begin{bmatrix} 1 & 0 & -r\sin\phi \\ 0 & 1 & r\cos\phi \end{bmatrix}_{2\times3},\quad
J_z = \begin{bmatrix} \cos\phi & -r\sin\phi \\ \sin\phi & r\cos\phi \end{bmatrix}_{2\times2}
$$

- Los errores **angulares** (del robot y del sensor) se multiplican por $r^2$ y abren la elipse **perpendicular** a la línea de visión. El de rango la estira **a lo largo** de ella.
- **Asociación de datos:** antes de usar $h(\mathbf{x}, \mathbf{m}_i)$ hay que saber qué landmark generó cada medida. Se predice la medida de cada candidato y se elige el más parecido (distancia de Mahalanobis; compatible si $D^2 < 5{,}991$ con 2 grados de libertad, al 95 %).
- **Verosimilitud 2D** con $\mathbf{e} = \mathbf{z} - \mathbf{h}$ y $Q = \operatorname{diag}(\sigma_r^2, \sigma_\alpha^2)$: $\dfrac{1}{2\pi\sigma_r\sigma_\alpha}\exp\{-\tfrac12 D^2\}$, con $D^2 = (e_r/\sigma_r)^2 + (e_\alpha/\sigma_\alpha)^2$. **Normaliza la diferencia de ángulos** a $(-\pi, \pi]$.

### 2.6. Modelos de scan: beam model y likelihood field

| | **Beam model** | **Likelihood field** |
|---|---|---|
| Qué compara | La medida $z$ de cada haz con la esperada $z_{exp}$, obtenida por **ray casting** | El **extremo** $\mathbf{q}$ de cada haz con el **obstáculo más cercano** del mapa |
| Fórmula por haz | $\alpha_{hit}p_{hit} + \alpha_{unexp}p_{unexp} + \alpha_{rand}p_{rand} + \alpha_{max}p_{max}$ | $L(\mathbf{q}) = \alpha_{hit}\dfrac{1}{\sigma\sqrt{2\pi}}e^{-d(\mathbf{q})^2/2\sigma^2} + \dfrac{\alpha_{rand}}{z_{max}}$ |
| Coste | Ray casting por haz y por pose: caro | Campo precalculado una vez: barato y suave |
| Scan completo | Producto de los haces | Producto de los haces |

**Las cuatro componentes del beam model:**

| Componente | Qué modela | Valor | Rango de validez |
|---|---|---|---|
| $p_{hit}$ | Medida correcta con ruido | Gaussiana centrada en $z_{exp}$ | $[0, z_{max}]$ |
| $p_{unexp}$ | Obstáculo imprevisto (persona) | $\eta\,\lambda e^{-\lambda z}$, $\eta = 1/(1 - e^{-\lambda z_{exp}})$ | Solo $z < z_{exp}$ |
| $p_{rand}$ | Lecturas aleatorias | $1/z_{max}$ | $z < z_{max}$ |
| $p_{max}$ | Sin eco | 1 | Solo $z = z_{max}$ |

Los pesos $\alpha$ suman 1 y se ajustan por máxima verosimilitud a un histograma de medidas.

## 3. L5 · Localización por optimización: mínimos cuadrados y registro

### 3.1. Problemas de localización y estimación puntual

| Problema | Qué sabe el robot | Encaje natural |
|---|---|---|
| **Seguimiento de posición** (*tracking*) | Su pose, aproximadamente | EKF |
| **Localización global** | Nada: pose inicial desconocida | Rejilla o partículas |
| **Robot secuestrado** | Cree saberla, pero se equivoca | Partículas o rejilla con recuperación (p. ej. Augmented MCL) |

Para dar una sola pose: la **MAP** (el pico) o la **media**. Coinciden en una gaussiana. Con varios picos, la media puede caer donde no hay probabilidad.

### 3.2. Mínimos cuadrados lineales y ponderados

Con $\mathbf{z} = H\mathbf{x} + \mathbf{e}$ ($H$ de $m \times n$, una fila por medida y una columna por incógnita):

$$
\boxed{\hat{\mathbf{x}}_{LS} = (H^TH)^{-1}H^T\mathbf{z}} \qquad
\boxed{\hat{\mathbf{x}}_{WLS} = (H^TQ^{-1}H)^{-1}H^TQ^{-1}\mathbf{z},\quad \Sigma_{\hat{\mathbf{x}}} = (H^TQ^{-1}H)^{-1}}
$$

- Solo hay solución única si $\operatorname{rango}(H) = n$: hacen falta $n$ ecuaciones **independientes**. Si no, el estado es **no observable**.
- Cada medida pesa $1/\sigma_i^2$. Varias medidas de lo mismo: $\hat{x} = \dfrac{\sum z_i/\sigma_i^2}{\sum 1/\sigma_i^2}$, $\sigma_{\hat{x}}^2 = \dfrac{1}{\sum 1/\sigma_i^2}$.
- Con ruido gaussiano, **WLS = máxima verosimilitud**: maximizar $K\exp\{-\tfrac12\mathbf{e}^TQ^{-1}\mathbf{e}\}$ es minimizar $\mathbf{e}^TQ^{-1}\mathbf{e}$.
- LS es **estático**: no usa modelo de movimiento ni acumula lo observado antes. Eso lo hacen los filtros.

### 3.3. Mínimos cuadrados no lineales: Gauss-Newton

Si $\mathbf{h}(\mathbf{x})$ no es lineal (distancias a balizas), se linealiza en la estimación actual y se itera:

$$
\boxed{\boldsymbol{\delta} = (J^TQ^{-1}J)^{-1}J^TQ^{-1}[\mathbf{z} - \mathbf{h}(\hat{\mathbf{x}})],\qquad \hat{\mathbf{x}} \leftarrow \hat{\mathbf{x}} + \boldsymbol{\delta}}
$$

- Jacobiano de rango: filas $[-\Delta x/d,\ -\Delta y/d]$. De rango y bearing: $\begin{bmatrix} -\Delta x/d & -\Delta y/d & 0 \\ \Delta y/d^2 & -\Delta x/d^2 & -1 \end{bmatrix}$ por landmark. Se **recalcula en cada iteración**.
- Para hasta que $\lVert\boldsymbol{\delta}\rVert$ es despreciable. Depende de la estimación inicial (buena odometría → menos iteraciones) y puede acabar en un **mínimo local**.
- **Solo distancias en 2D:** una baliza da una circunferencia (la verosimilitud es una **rosquilla**, no una gaussiana en $\mathbf{x}$), dos dan dos puntos, **tres no alineadas** dan uno. La orientación **no es observable**: $\partial h/\partial\theta = 0$.
- El vector de error tiene **una fila por cada número medido**: 3 observaciones rango-bearing son 6 filas; 3 de solo bearing, 3.

### 3.4. Registro de conjuntos de puntos e ICP

- Registrar es hallar $(R, \mathbf{t})$ que minimiza $E = \sum_i\lVert\mathbf{m}_i - (R\mathbf{q}_i + \mathbf{t})\rVert^2$. Tiene que ser una norma al cuadrado sumada: el vector $\mathbf{m}_i - \mathbf{p} \oplus \mathbf{q}_i$ por sí solo no se puede minimizar.
- **Landmarks:** las correspondencias se conocen (descriptores), así que se registra directamente. **Puntos de scan:** no se conocen, así que se usa **ICP**.
- **ICP:** alterna (1) emparejar cada punto con el **más cercano** y (2) estimar $R, \mathbf{t}$ con esas parejas. Para cuando $R, \mathbf{t}$ son despreciables o las parejas no cambian. Solo garantiza un **mínimo local**; se acelera con KD-tree.
- Contra un **mapa** da **localización**; contra un **scan anterior**, **odometría**.

## 4. L5 · Filtros de Bayes: rejilla, Kalman, EKF y partículas

### 4.1. El filtro de Bayes y el filtro de rejilla

La creencia $bel(\mathbf{x}_t) = p(\mathbf{x}_t \mid \mathbf{z}_{1:t}, \mathbf{u}_{1:t})$ se actualiza en dos pasos:

| Paso | Regla | Fórmula (rejilla) | Efecto |
|---|---|---|---|
| **Predicción** | Probabilidad total | $\overline{bel}(x_t) = \sum_{x_{t-1}} P(x_t \mid x_{t-1}, u_t)\,bel(x_{t-1})$ | Extiende la incertidumbre. **No se normaliza** |
| **Corrección** | Bayes | $bel(x_t) = \eta\,P(z_t \mid x_t)\,\overline{bel}(x_t)$ | La concentra. $\eta = 1/\sum$ |

- La rejilla admite cualquier distribución, pero crece muy rápido: $20\times20$ m a 0,1 m y 5° son casi 3 millones de celdas.
- Repaso de probabilidad: marginal = suma por filas o columnas; $P(A \cup B) = P(A) + P(B) - P(A \cap B)$; condicional $P(A \mid B) = P(A, B)/P(B)$; si son independientes, la conjunta es el producto.

### 4.2. El filtro de Kalman

Exacto si los modelos son **lineales** y todo es **gaussiano**: $\mathbf{x}_t = A\mathbf{x}_{t-1} + B\mathbf{u}_t + \boldsymbol{\varepsilon}$ ($R$) y $\mathbf{z}_t = C\mathbf{x}_t + \boldsymbol{\delta}$ ($Q$).

$$
\begin{aligned}
&\textbf{Predicción:} && \bar{\boldsymbol{\mu}} = A\boldsymbol{\mu} + B\mathbf{u}, && \bar\Sigma = A\Sigma A^T + R \\
&\textbf{Corrección:} && K = \bar\Sigma C^T(C\bar\Sigma C^T + Q)^{-1}, && \boldsymbol{\mu} = \bar{\boldsymbol{\mu}} + K(\mathbf{z} - C\bar{\boldsymbol{\mu}}), \quad \Sigma = (I - KC)\bar\Sigma
\end{aligned}
$$

- En 1D con $C = 1$: $K = \bar\sigma^2/(\bar\sigma^2 + Q)$. Sensor malo ($Q$ grande) → $K \to 0$ (ignora la medida); predicción mala → $K \to 1$.
- Predecir **suma varianzas**: $\mathcal{N}(1, 1)$ que se mueve con $\mathcal{N}(1, 2)$ queda $\mathcal{N}(2, 3)$. Corregir nunca aumenta la incertidumbre.
- **Innovación:** $\mathbf{z} - C\bar{\boldsymbol{\mu}}$, con covarianza $S = C\bar\Sigma C^T + Q$.
- La corrección es una estimación **MAP**: un LS ponderado con la predicción como prior, $\Sigma^{-1} = \bar\Sigma^{-1} + C^TQ^{-1}C$.

### 4.3. El filtro de Kalman extendido (EKF)

Para modelos no lineales: la **media** se calcula con los modelos no lineales, y las **covarianzas y $K$**, con sus jacobianos.

$$
\begin{aligned}
&1.\ \bar{\boldsymbol{\mu}}_t = \mathbf{g}(\boldsymbol{\mu}_{t-1}, \mathbf{u}_t) = \boldsymbol{\mu}_{t-1} \oplus \mathbf{u}_t && \text{predicción de la pose} \\
&2.\ \bar\Sigma_t = G_t\Sigma_{t-1}G_t^T + R_t && \text{incertidumbre de la predicción} \\
&3.\ K_t = \bar\Sigma_tH_t^T(H_t\bar\Sigma_tH_t^T + Q_t)^{-1} && \text{ganancia de Kalman} \\
&4.\ \boldsymbol{\mu}_t = \bar{\boldsymbol{\mu}}_t + K_t(\mathbf{z}_t - \mathbf{h}(\bar{\boldsymbol{\mu}}_t)) && \text{estimación de la pose} \\
&5.\ \Sigma_t = (I - K_tH_t)\bar\Sigma_t && \text{incertidumbre de la estimación}
\end{aligned}
$$

- $G$ se evalúa en $\boldsymbol{\mu}_{t-1}$; $H$, en $\bar{\boldsymbol{\mu}}_t$. $R_t = J_2\Sigma_{\mathbf{u}}J_2^T$: el ruido del comando, girado al mundo.
- $G = \begin{bmatrix} 1 & 0 & -u_x\sin\theta - u_y\cos\theta \\ 0 & 1 & u_x\cos\theta - u_y\sin\theta \\ 0 & 0 & 1 \end{bmatrix}$, $J_2 = \begin{bmatrix} \cos\theta & -\sin\theta & 0 \\ \sin\theta & \cos\theta & 0 \\ 0 & 0 & 1 \end{bmatrix}$.
- Funciona bien si la incertidumbre es **pequeña**: la función es casi lineal donde hay probabilidad. Una sola gaussiana: **una sola hipótesis**.
- Dimensiones con $L$ landmarks observados (rango y bearing): $\mathbf{z}$ $2L\times1$, $H$ $2L\times3$, $Q_t$ y $S$ $2L\times2L$, $K$ $3\times2L$.

### 4.4. El filtro de partículas

Representa la creencia con $M$ muestras ponderadas $\{\mathbf{x}^{[i]}, w^{[i]}\}$. Ciclo «2 + 1»:

1. **Predicción:** mover cada partícula **muestreando** el modelo de movimiento, cada una con **su propio ruido**. Los pesos no cambian.
2. **Corrección:** $w^{[i]} \propto p(\mathbf{z} \mid \mathbf{x}^{[i]})$; con un rango, $w^{[i]} \propto \exp\!\big(-(\nu^{[i]})^2/2\sigma_z^2\big)$, $\nu^{[i]} = z - \hat{z}^{[i]}$. Después, **normalizar**.
3. **Remuestreo:** sortear $M$ partículas **con reemplazo** según los pesos (acumulada $C_k$; $r_j$ elige la partícula con $C_{k-1} \le r_j < C_k$). Todas pasan a pesar $1/M$. Evita la **degeneración**: que unas pocas partículas con mucho peso dominen.

- Ventajas: creencias **no gaussianas y multimodales**, modelos flexibles, algoritmo sencillo. Inconvenientes: muchas partículas en estados grandes, y el remuestreo puede perder diversidad.
- Estimar la pose: media ponderada en $x$, $y$ y **media circular** en $\theta$: $\bar\theta = \operatorname{atan2}(\sum w\sin\theta,\ \sum w\cos\theta)$, varianza circular $1 - R$.

### 4.5. Qué filtro para qué

| Filtro | Representación | Bueno para | Le cuesta |
|---|---|---|---|
| **Rejilla** | Probabilidad por celda | Cualquier forma, varias hipótesis | Memoria y cómputo con la resolución |
| **Kalman** | $(\boldsymbol{\mu}, \Sigma)$ | Modelos lineales y gaussianos (exacto) | No admite no linealidades |
| **EKF** | $(\boldsymbol{\mu}, \Sigma)$ | Tracking con incertidumbre pequeña | Una hipótesis; puede divergir |
| **Partículas** | Muestras con peso | Global, multimodal, secuestro | Muchas partículas en dimensiones altas |

## 5. Las prácticas: lo que te van a preguntar del código

### 5.1. Práctica 4.1 · Landmarks

- `to_world_frame(x1_w, Qx1_w, z1_p_r, W1)`: polares → cartesianas con `Jac_pol_car = [[c, -r*s], [s, r*c]]` y `Jac_pol_car@W1@Jac_pol_car.T`; amplía el punto con un 0 (`np.vstack([z1_car_rel[0], 0])`) para usar `J1`, `J2` y `tcomp`; recorta `J1(...)[0:2,:]` (2×3) y `J2(...)[0:2,0:2]` (2×2); `z1_w = tcomp(x1_w, z1_ext)[0:2,[0]]`; `Wz1 = Jac_ap@Qx1_w@Jac_ap.T + Jac_aa@z1_car_rel[1]@Jac_aa.T`.
- `combine_pdfs()`: $\Sigma = (\Sigma_1^{-1} + \Sigma_2^{-1})^{-1}$, $\mathbf{m} = \Sigma(\Sigma_1^{-1}\mathbf{m}_1 + \Sigma_2^{-1}\mathbf{m}_2)$: se suman las informaciones.
- El paso inverso, cartesianas → polares, usa `Jac_car_pol = [[c, s], [-s/r, c/r]]`: es de la parte opcional, pero ya cayó en un examen.
- Dimensiones: `Qx1_w` 3×3, `W1` 2×2, `Jac_ap` 2×3, `Jac_aa` y `Wz1` 2×2. Pose exacta: `Qx1_w = np.zeros((3, 3))`.

### 5.2. Práctica 4.2 · Escáner láser

- `Laser2D(FOV, resolution, max_distance, noise_cov, pose)`; `n_beams = floor(FOV/resolution) + 1`; `noise_cov` lleva **varianzas** (dentro se hace `np.sqrt`).
- `z` es `(2, K)`: fila 0 alcances, fila 1 ángulos relativos. Se recorre con `range(z.shape[1])`.
- Punto en el mapa: `tcomp(pose, np.vstack([d*np.cos(a), d*np.sin(a), 0]))`. O componer, o sumar $\theta$ a mano: **nunca las dos cosas**.
- Explorar: `current_pose = tcomp(current_pose, step)`. Los incrementos están en el marco del robot y **se componen, no se suman**. Antes de medir, `laser.set_pose(pose)`.
- Incertidumbre de un punto: $\sigma_\parallel = \sigma_r$ y $\sigma_\perp = r\sigma_\alpha$.

### 5.3. Práctica 4.3 · Sensores con ROS 2

- Comandos: `ros2 topic list -t` (con tipos), `ros2 topic echo /laser1 --once --no-arr` (un mensaje, sin arrays), `--field ranges`, `ros2 topic hz` (frecuencia), `ros2 topic info` (publicadores y suscriptores), `ros2 interface show sensor_msgs/msg/LaserScan` (definición de un tipo).
- `LaserScan` guarda solo los alcances: $\alpha_k = \texttt{angle\_min} + k\cdot\texttt{angle\_increment}$. TurtleBot3: 360°, **800 haces**, 0,4506°, frente en $k \approx 399{,}5$. Un haz que no choca vale **`range_max`**, que **no** es un obstáculo.
- tf: `map → odom → base_link → {laser1, imu1, base_footprint}`. `tf2_echo A B` da la **pose de B en A** (el orden importa). Pose del láser en `odom` = $\mathbf{x} \oplus \mathbf{x}_s$, con $\mathbf{x}_s = [-0{,}032,\ 0,\ 0{,}171]$.
- MVSim: se configura con los argumentos de los `<include>` del XML del mundo; hay que **relanzar** tras editar.

### 5.4. Práctica 5.2 · Localización con EKF

```python
xPred = tcomp(robot.xEst, u)                       # media predicha: estimación anterior ⊕ comando sin ruido
G = J1(robot.xEst, u)                              # jacobianos en mu_{t-1}
j2 = J2(robot.xEst, u)
PPred = G@robot.PEst@G.T + j2@robot.cov_move@j2.T  # dos sumandos, cada uno con su traspuesta
H = getObsJac(xPred, landmark, Map)                # H en la pose predicha
Q_t = np.kron(np.eye(landmark.shape[0]), sensor.cov)
K = PPred@H.T@linalg.inv(H@PPred@H.T + Q_t)
innovation = z - sensor.observe(xPred, Map[:, landmark], noisy=False)
innovation[1::2] = AngleWrapList(innovation[1::2]) # normalizar las marcaciones
xEst = xPred + K@innovation
PEst = (np.eye(3) - K@H)@PPred
```

- Tres poses: `pose` (ideal), `true_pose` (real: desde ella **mide** el sensor) y `xEst` (estimada: desde ella **predice** el filtro).
- `observe()`: `np.sqrt(dx**2 + dy**2)` y `np.arctan2(dy, dx) - pose[2, 0]`; ruido `np.sqrt(self.cov)@random.randn(2, n)`.
- `getObsJac()`: por landmark, `[[-dx/d, -dy/d, 0], [dy/d2, -dx/d2, -1]]`.
- FOV: `np.abs(z[1, :]) < fov/2` y `z[0, :] < max_range`, combinados con `&`; `flatten('F')` intercala $[d_1, \theta_1, d_2, \theta_2, \dots]$.
- Sin landmarks no hay corrección: `xEst = xPred` y la incertidumbre crece.

### 5.5. Práctica 5.3 · Filtro de partículas

- `sample_motion_model()`: `stats.multivariate_normal.rvs(movement.flatten(), movement_covariance)` y `tcomp(pose, noisy_movement)`.
- `evaluate_pose()`: scan a puntos globales con `express_as_global_point_cloud(z, pose)`; `evaluate_pointcloud()` **multiplica** (`total_prob *= map.sample_likelihood(...)`) desde 1. Fuera del mapa, `MIN_LIKELIHOOD`, no 0.
- `current_estimation()`: media ponderada; ángulo con `np.atan2(dir[1], dir[0])` (primero el seno); varianza angular `1 - np.linalg.norm(dir)`.
- `resample()`: `cumulative = np.cumsum(pesos)`, `cumulative[-1] = 1.`, `r = np.random.uniform(0, 1, M)`, `selected = np.searchsorted(cumulative, r)` y peso `1/M`.
- Orden: predicción → corrección → **estimación** → remuestreo (se estima antes de igualar los pesos).

### 5.6. Práctica 5.4 · AMCL en ROS 2

- AMCL = filtro de partículas sobre odometría, mapa y láser. Entradas: `/scanner1`, `/map`, `/initialpose`, tf. Salidas: `/amcl_pose`, `/particle_cloud` y la tf `map → noisy_odom`.
- Pose estimada = (`map → noisy_odom`) ⊕ (`noisy_odom → base_link`). AMCL no publica `map → base_link`, porque cada frame tiene **un solo padre**.
- **KLD-sampling** adapta el número de partículas; **Augmented MCL** inyecta poses aleatorias si cae la verosimilitud reciente. Actualiza solo tras moverse `update_min_d` o `update_min_a`.
- Covarianza de `/amcl_pose`: 36 valores (6×6 sobre $x, y, z$, roll, pitch, yaw). Índices **0, 7 y 35** son las varianzas de $x$, $y$ y yaw; **1 y 6**, la covarianza $xy$. Yaw $= 2\operatorname{atan2}(q_z, q_w)$.
- Comandos: `ros2 node info /amcl`, `ros2 topic echo --once /amcl_pose --field pose.pose.position`, `ros2 service call /reinitialize_global_localization std_srvs/srv/Empty`, `ros2 param set /amcl max_particles 20`.

### 5.7. Práctica 6.3 · Mapas de rejilla de ocupación

- Poses conocidas; se estima $P(m_i \mid \mathbf{z}_{1:t}, \mathbf{x}_{1:t})$ por celda, suponiendo **celdas independientes**.
- **Log odds:** $l_t = \tau_t + l_{t-1} + l_0$, con $\tau = \ln\frac{p}{1-p}$ y $l_0 = -\ln\frac{P(m)}{1 - P(m)}$ (0 con prior 0,5). Probabilidad: $P = 1 - \dfrac{1}{1 + e^{l}}$.
- **Modelo inverso** ($\rho$ = distancia a la celda, $d$ = medida, ambas **en celdas**, $\sigma = 0{,}4$): 0,2 antes del impacto si $f < 0{,}2$; 0,5 detrás si $f < 0{,}5$; si no, $\min(f, 0{,}8)$.
- Pipeline: extremos de los haces → celdas (Bresenham) → modelo inverso → log odds → probabilidades → umbrales (0,3 y 0,7).
- Índices: metros / resolución y `int()`; la celda es `(x, y)` pero la matriz es `[y][x]`. `OccupancyGridMap(14, 12, 0.1)` da `shape (120, 140)`.

## 6. Hoja de fórmulas

| Tema | Fórmula |
|---|---|
| Tiempo de vuelo | $r = c\,\Delta t/2$ (sonido 343 m/s; luz $3\cdot10^8$ m/s) |
| LiDAR por fase | $r = c\,\Delta\phi/(4\pi f_m)$; $r_{max} = c/(2f_m)$ |
| Trilateración 2D | Balizas en $(0,0)$ y $(d,0)$: $x = \dfrac{r_1^2 - r_2^2 + d^2}{2d}$, $y = \pm\sqrt{r_1^2 - x^2}$ |
| Haces | $n = \lfloor\mathrm{FOV}/\Delta\alpha\rfloor + 1$; $\alpha_k = \alpha_{min} + k\Delta\alpha$; $s \approx r\Delta\alpha$ |
| Gaussiana 1D | $\dfrac{1}{\sigma\sqrt{2\pi}}e^{-(z-\mu)^2/2\sigma^2}$ |
| Rango y bearing | $d = \sqrt{\Delta x^2 + \Delta y^2}$, $\alpha = \operatorname{atan2}(\Delta y, \Delta x) - \theta$ |
| Landmark en el mapa | $\mathbf{m} = [x + r\cos(\theta+\alpha),\ y + r\sin(\theta+\alpha)]$ |
| Covarianza del landmark | $J_x\Sigma_xJ_x^T + J_z\Sigma_zJ_z^T$ |
| Beam model | $\sum \alpha_i p_i$; producto de los haces |
| Likelihood field | $\alpha_{hit}\mathcal{N}(d(\mathbf{q}); 0, \sigma^2) + \alpha_{rand}/z_{max}$ |
| LS / WLS | $(H^TH)^{-1}H^T\mathbf{z}$ / $(H^TQ^{-1}H)^{-1}H^TQ^{-1}\mathbf{z}$ |
| Gauss-Newton | $\boldsymbol{\delta} = (J^TQ^{-1}J)^{-1}J^TQ^{-1}(\mathbf{z} - \mathbf{h}(\hat{\mathbf{x}}))$ |
| Inversa 2×2 | $\begin{bmatrix} a & b \\ c & d \end{bmatrix}^{-1} = \dfrac{1}{ad - bc}\begin{bmatrix} d & -b \\ -c & a \end{bmatrix}$ |
| ICP (traslación 1D) | $t = \frac{1}{n}\sum(m_j - q_i)$ con las parejas más cercanas |
| Rejilla | Predicción: $\sum P(x_t \mid x_{t-1}, u)\,bel$; corrección: $\eta\,P(z \mid x)\,\overline{bel}$ |
| Gaussiana transformada | $A\mathbf{x} + \mathbf{b} \sim \mathcal{N}(A\boldsymbol{\mu} + \mathbf{b},\ A\Sigma A^T)$ |
| Kalman 1D | $\bar\sigma^2 = \sigma^2 + R$; $K = \bar\sigma^2/(\bar\sigma^2 + Q)$; $\mu = \bar\mu + K(z - \bar\mu)$; $\sigma^2 = (1 - K)\bar\sigma^2$ |
| EKF | $\bar\Sigma = G\Sigma G^T + R$; $K = \bar\Sigma H^T(H\bar\Sigma H^T + Q)^{-1}$; $\boldsymbol{\mu} = \bar{\boldsymbol{\mu}} + K(\mathbf{z} - \mathbf{h}(\bar{\boldsymbol{\mu}}))$ |
| Partículas | $w \propto e^{-\nu^2/2\sigma^2}$, normalizar; acumulada y $1/M$ tras remuestrear |
| Media circular | $\operatorname{atan2}(\sum w\sin\theta,\ \sum w\cos\theta)$; varianza $1 - R$ |
| Log odds | $l_t = \tau_t + l_{t-1} + l_0$; $P = 1 - 1/(1+e^{l})$ |
| Cuaternión plano | $\text{yaw} = 2\operatorname{atan2}(q_z, q_w)$ |

## 7. Los errores que más puntos quitan

1. **Olvidar el 2** del tiempo de vuelo: $\Delta t$ es de ida y vuelta.
2. **Grados en vez de radianes** en varianzas angulares, en $s = r\Delta\alpha$ y en los jacobianos.
3. **$\sigma$ en vez de $\sigma^2$** en una covarianza ($Q$, $R$, `noise_cov`).
4. **Bearing:** usar `atan` en vez de `atan2`, no restar $\theta$ al predecir (o no sumarlo al pasar al mapa) y no normalizar la diferencia de ángulos.
5. **Jacobianos con las dimensiones al revés:** filas = salidas, columnas = entradas.
6. **Olvidar un sumando** de $\Sigma_m$ o de $\bar\Sigma$ (la pose **y** la medida; el estado anterior **y** el movimiento), o la traspuesta de $J\Sigma J^T$.
7. **Confundir $R$ y $Q$:** $R$ es del movimiento y va al predecir; $Q$ es del sensor y va al corregir.
8. **EKF:** $G$ en $\boldsymbol{\mu}_{t-1}$ y $H$ en $\bar{\boldsymbol{\mu}}_t$; medida esperada con $\mathbf{h}(\bar{\boldsymbol{\mu}})$ y **sin ruido**; en la corrección se usa $\bar\Sigma$, no $\Sigma_{t-1}$.
9. **Rejilla:** normalizar en la predicción (no hace falta) o no normalizar en la corrección.
10. **Partículas:** mover todas con el mismo ruido, sumar verosimilitudes en vez de multiplicarlas, no normalizar antes de la acumulada, mantener los pesos tras remuestrear o promediar ángulos como números.
11. **Creer que Kalman o el EKF admiten varias hipótesis**, o que ICP encuentra el óptimo global.
12. **Sacar la orientación de distancias** a balizas: no es observable.
13. **Sumar incrementos de pose** en vez de componerlos con `tcomp`, o componer en el orden equivocado: es `tcomp(pose, punto)`, con la pose primero.
14. **Leer `range_max` como un obstáculo**, o los índices 1 y 6 de la covarianza de ROS como varianzas.
15. **Rejilla de ocupación:** mezclar `(x, y)` con `[fila][columna]`, mezclar metros y celdas, o usar `1/(1+e^l)`, que es la probabilidad de **libre**.

## 8. Anexo A · Ejercicios tipo de L4

Cada ejercicio es un tipo de pregunta que puede caer. Intenta resolverlo antes de leer la solución. Todos los resultados están comprobados con Python.

### 8.1. Tiempo de vuelo del sonar

**Enunciado.** Un sonar recibe el eco 14 ms después de emitir el pulso. ¿A qué distancia está el obstáculo? ¿Cuánto tardaría el eco con un obstáculo a 3 m?

**Solución.**

1. El tiempo es de ida y vuelta: $r = \dfrac{c_s\,\Delta t}{2} = \dfrac{343 \cdot 0{,}014}{2} = \dfrac{4{,}802}{2}$.
2. Al revés: $\Delta t = \dfrac{2r}{c_s} = \dfrac{6}{343} = 0{,}01749$ s.

**Resultado.** $r = 2{,}401$ m y $\Delta t = 17{,}49$ ms. Sin dividir entre 2 saldría 4,80 m, el error típico.

### 8.2. LiDAR por desplazamiento de fase

**Enunciado.** Un LiDAR modula a $f_m = 10$ MHz y mide un desfase $\Delta\phi = \pi/3$ rad. (a) ¿Distancia? (b) ¿Hasta dónde mide sin ambigüedad? (c) ¿Qué leería con un objeto a 17,5 m?

**Solución.**

1. $r = \dfrac{c\,\Delta\phi}{4\pi f_m} = \dfrac{3\cdot10^8 \cdot \pi/3}{4\pi \cdot 10^7} = \dfrac{10^8}{4\cdot10^7}$. Los $\pi$ se simplifican.
2. $r_{max} = \dfrac{c}{2f_m} = \dfrac{3\cdot10^8}{2\cdot10^7} = 15$ m.
3. $17{,}5 = 2{,}5 + 15$: el desfase da una vuelta completa más ($\pi/3 + 2\pi$) y el sensor no lo distingue.

**Resultado.** (a) 2,5 m. (b) 15 m. (c) Leería 2,5 m.

### 8.3. Trilateración 2D

**Enunciado.** Dos balizas en $(0, 0)$ y $(10, 0)$. El robot mide $r_1 = 6$ m a la primera y $r_2 = 8$ m a la segunda. ¿Dónde puede estar?

**Solución.**

1. $x = \dfrac{r_1^2 - r_2^2 + d^2}{2d} = \dfrac{36 - 64 + 100}{20} = \dfrac{72}{20} = 3{,}6$.
2. $y = \pm\sqrt{r_1^2 - x^2} = \pm\sqrt{36 - 12{,}96} = \pm\sqrt{23{,}04} = \pm4{,}8$.
3. Comprobación con la segunda baliza: $\sqrt{6{,}4^2 + 4{,}8^2} = \sqrt{64} = 8$. ✓

**Resultado.** $(3{,}6;\ 4{,}8)$ o $(3{,}6;\ -4{,}8)$. Con dos balizas hay **dos** soluciones; una tercera no alineada decide.

### 8.4. Haces de un LiDAR y resolución

**Enunciado.** Un LiDAR barre 270° con un paso de 0,25°, empezando en $\alpha_{min} = -135°$. (a) ¿Cuántos haces da? (b) ¿Qué haz apunta a la izquierda (+90°)? (c) ¿Qué separación hay entre dos puntos contiguos a 10 m?

**Solución.**

1. $n = 270/0{,}25 + 1 = 1080 + 1$: se cuentan los dos extremos.
2. $k = \dfrac{\alpha - \alpha_{min}}{\Delta\alpha} = \dfrac{90 + 135}{0{,}25} = 900$.
3. $s \approx r\,\Delta\alpha = 10 \cdot 0{,}25 \cdot \dfrac{\pi}{180} = 10 \cdot 0{,}004363$ m.

**Resultado.** (a) 1081 haces. (b) El haz 900. (c) 4,4 cm. Un sonar de 30° a solo 2 m cubre $2 \cdot 2\tan15° = 1{,}07$ m.

### 8.5. Gaussiana y Bayes discreto

**Enunciado.** Un sensor mide la distancia a una pared en $x = 0$ con ruido $\sigma = 0{,}2$ m. (a) Si la distancia real es 3 m, ¿cuánto vale la densidad de medir 3,3 m? (b) El robot puede estar en $x \in \{2{,}0;\ 2{,}5;\ 3{,}0\}$ con prior $[0{,}5;\ 0{,}3;\ 0{,}2]$ y mide $z = 2{,}4$ m. ¿Posterior?

**Solución (a).** Pico $= \dfrac{1}{0{,}2\sqrt{2\pi}} = 1{,}9947$. Exponente $= -\dfrac{0{,}3^2}{2 \cdot 0{,}04} = -1{,}125$. $p = 1{,}9947 \cdot e^{-1{,}125} = 1{,}9947 \cdot 0{,}3247 = 0{,}648$ m⁻¹.

**Solución (b).** La constante $1/(\sigma\sqrt{2\pi})$ se va al normalizar, así que basta con $e^{-(z - x)^2/2\sigma^2}$:

| $x$ | $(z - x)^2/2\sigma^2$ | Verosimilitud | × prior | Posterior |
|---|---|---|---|---|
| 2,0 | $0{,}16/0{,}08 = 2$ | 0,1353 | 0,0677 | **0,202** |
| 2,5 | $0{,}01/0{,}08 = 0{,}125$ | 0,8825 | 0,2648 | **0,791** |
| 3,0 | $0{,}36/0{,}08 = 4{,}5$ | 0,0111 | 0,0022 | **0,007** |
| | | | Suma 0,3346 | 1 |

**Resultado.** La posterior es $[0{,}202;\ 0{,}791;\ 0{,}007]$. La medida le da la vuelta al prior: 2,0 era la más probable antes de medir.

### 8.6. Rango y bearing predichos

**Enunciado.** El robot está en $\mathbf{x} = [2\ \text{m},\ 1\ \text{m},\ 90°]^T$ y en el mapa hay un landmark en $(5, 5)$. ¿Qué debería medir? Aparte: si $\operatorname{atan2}$ da $-165°$ y $\theta = 160°$, ¿qué bearing es?

**Solución.**

1. $\Delta x = 3$, $\Delta y = 4$, $\hat{d} = \sqrt{9 + 16} = 5$ m.
2. $\operatorname{atan2}(4, 3) = 53{,}13°$, y se resta la orientación: $\hat{\alpha} = 53{,}13° - 90° = -36{,}87°$.
3. $-165° - 160° = -325°$, y se normaliza sumando 360°.

**Resultado.** $\hat{\mathbf{z}} = [5\ \text{m},\ -36{,}87°]$: está 36,87° a la **derecha** del robot. El segundo bearing es $+35°$.

### 8.7. Asociación de datos y verosimilitud de una observación

**Enunciado.** Mismo robot. Mide $\mathbf{z} = [5{,}2\ \text{m},\ -40°]$, con $\sigma_r = 0{,}1$ m y $\sigma_\alpha = 3°$. Hay dos candidatos: $\mathbf{m}_1 = (5, 5)$ y $\mathbf{m}_2 = (6, 3)$. ¿Con cuál se asocia? ¿Cuánto vale su verosimilitud?

**Solución.**

1. Predicciones: $\hat{\mathbf{z}}_1 = [5;\ -36{,}87°]$ (ejercicio anterior). Para $\mathbf{m}_2$: $\Delta = (4, 2)$, $\hat{d} = 4{,}472$ y $\hat{\alpha} = 26{,}57° - 90° = -63{,}43°$.
2. Innovaciones: $\mathbf{e}_1 = [0{,}2\ \text{m};\ -3{,}13°]$ y $\mathbf{e}_2 = [0{,}728\ \text{m};\ 23{,}43°]$.
3. Mahalanobis, con $\sigma_\alpha = 3° = 0{,}05236$ rad:
   - $D_1^2 = (0{,}2/0{,}1)^2 + (3{,}13/3)^2 = 4 + 1{,}089 = 5{,}089$.
   - $D_2^2 = (0{,}728/0{,}1)^2 + (23{,}43/3)^2 = 52{,}98 + 61{,}02 = 114{,}0$.
4. Compuerta $\chi^2$ al 95 % con 2 grados de libertad: 5,991. Solo $\mathbf{m}_1$ pasa.
5. Verosimilitud: $\dfrac{1}{2\pi\sigma_r\sigma_\alpha}e^{-D_1^2/2} = \dfrac{1}{2\pi \cdot 0{,}1 \cdot 0{,}05236} \cdot e^{-2{,}544} = 30{,}40 \cdot 0{,}0785$.

**Resultado.** Se asocia con $\mathbf{m}_1$, y $p(\mathbf{z} \mid \mathbf{x}, \mathbf{m}_1) = 2{,}39$. Recuerda dividir los ángulos por $\sigma_\alpha$ en las mismas unidades.

### 8.8. Posición de un landmark observado

**Enunciado.** El robot está en $[1\ \text{m},\ 2\ \text{m},\ 30°]^T$ y mide un landmark a $r = 4$ m con bearing $\alpha = 60°$. ¿Dónde está el landmark en el mapa?

**Solución.**

1. Dirección en el mapa: $\phi = \theta + \alpha = 30° + 60° = 90°$. Aquí se **suma**.
2. $\mathbf{m} = [1 + 4\cos90°,\ 2 + 4\sin90°] = [1 + 0,\ 2 + 4]$.

**Resultado.** $\mathbf{m} = (1, 6)$. Es lo mismo que `tcomp(x, [r cos α, r sin α, 0])`.

### 8.9. Covarianza del landmark

**Enunciado.** Con los datos del ejercicio anterior, la pose tiene $\Sigma_x = \operatorname{diag}(0{,}01;\ 0{,}01;\ (2°)^2)$ y el sensor, $\sigma_r = 5$ cm y $\sigma_\alpha = 1°$. ¿Cuánto vale $\Sigma_m$?

**Solución.**

1. A radianes al cuadrado: $(2°)^2 = 0{,}03491^2 = 0{,}001218$ y $(1°)^2 = 0{,}0003046$. $\sigma_r^2 = 0{,}0025$.
2. Jacobianos en $\phi = 90°$, $r = 4$: $J_x = \begin{bmatrix} 1 & 0 & -4 \\ 0 & 1 & 0 \end{bmatrix}$ y $J_z = \begin{bmatrix} 0 & -4 \\ 1 & 0 \end{bmatrix}$.
3. Término de la pose: $J_x\Sigma_xJ_x^T = \begin{bmatrix} 0{,}01 + 16 \cdot 0{,}001218 & 0 \\ 0 & 0{,}01 \end{bmatrix} = \begin{bmatrix} 0{,}02950 & 0 \\ 0 & 0{,}01 \end{bmatrix}$.
4. Término del sensor: $J_z\Sigma_zJ_z^T = \begin{bmatrix} 16 \cdot 0{,}0003046 & 0 \\ 0 & 0{,}0025 \end{bmatrix} = \begin{bmatrix} 0{,}00487 & 0 \\ 0 & 0{,}0025 \end{bmatrix}$.
5. Se suman.

**Resultado.** $\Sigma_m = \operatorname{diag}(0{,}0344;\ 0{,}0125)$, con $\sigma_x = 0{,}185$ m y $\sigma_y = 0{,}112$ m. La línea de visión va hacia $+y$, así que en $x$ (perpendicular) mandan los dos errores de ángulo multiplicados por $r^2 = 16$.

### 8.10. Beam model

**Enunciado.** $z_{max} = 10$ m, $z_{exp} = 4$ m, $\sigma = 0{,}2$ m, $\lambda = 0{,}5$ y pesos $\alpha = (0{,}7;\ 0{,}1;\ 0{,}15;\ 0{,}05)$ para hit, unexpected, random y max. Calcula la verosimilitud de un scan de dos haces que miden $z_1 = 3{,}9$ m y $z_2 = 10$ m (los dos con $z_{exp} = 4$ m).

**Solución.**

1. Haz 1 ($z = 3{,}9$):
   - $p_{hit} = 1{,}9947 \cdot e^{-0{,}01/0{,}08} = 1{,}9947 \cdot 0{,}8825 = 1{,}7603$.
   - $p_{unexp}$: $\eta = 1/(1 - e^{-2}) = 1{,}1565$, y como $z < z_{exp}$, $p = 1{,}1565 \cdot 0{,}5 \cdot e^{-1{,}95} = 0{,}0823$.
   - $p_{rand} = 1/10 = 0{,}1$ y $p_{max} = 0$.
   - $p_1 = 0{,}7 \cdot 1{,}7603 + 0{,}1 \cdot 0{,}0823 + 0{,}15 \cdot 0{,}1 = 1{,}2322 + 0{,}0082 + 0{,}015 = 1{,}2555$.
2. Haz 2 ($z = z_{max}$): $p_{hit} \approx 0$ (está a 30σ); $p_{unexp} = 0$ porque $z \ge z_{exp}$; $p_{rand} = 0$ porque en $z_{max}$ solo actúa $p_{max} = 1$. Así, $p_2 = 0{,}05 \cdot 1 = 0{,}05$.
3. Independencia condicional: se multiplican.

**Resultado.** $p(\mathbf{z} \mid \mathbf{x}, \mathbf{m}) = 1{,}2555 \cdot 0{,}05 = 0{,}0628$.

### 8.11. Likelihood field

**Enunciado.** Robot en $(1, 1, 0°)$. El haz 1 mide 2 m a 0° y el haz 2, 1,5 m a 90°. En el mapa, el obstáculo más cercano al extremo del haz 1 es una pared en $x = 3{,}05$, y el más cercano al del haz 2, una en $y = 2{,}8$. Con $\sigma = 0{,}2$, $\alpha_{hit} = 0{,}9$, $\alpha_{rand} = 0{,}1$ y $z_{max} = 10$, ¿verosimilitud del scan?

**Solución.**

1. Extremos: $\mathbf{q}_1 = (1 + 2,\ 1) = (3, 1)$ y $\mathbf{q}_2 = (1,\ 1 + 1{,}5) = (1;\ 2{,}5)$.
2. Distancias al obstáculo más cercano: $d_1 = 0{,}05$ y $d_2 = 0{,}3$. **No** es la longitud del haz.
3. $L(\mathbf{q}_1) = 0{,}9 \cdot 1{,}9947 \cdot e^{-0{,}0025/0{,}08} + 0{,}01 = 1{,}7400 + 0{,}01 = 1{,}7500$.
4. $L(\mathbf{q}_2) = 0{,}9 \cdot 1{,}9947 \cdot e^{-0{,}09/0{,}08} + 0{,}01 = 0{,}5828 + 0{,}01 = 0{,}5928$.

**Resultado.** $p \approx 1{,}7500 \cdot 0{,}5928 = 1{,}037$. No hace falta ray casting: el campo se precalcula una vez.

## 9. Anexo B · Ejercicios tipo de L5

### 9.1. Mínimos cuadrados lineales

**Enunciado.** Un sensor mide $x$ ($z_1 = 2{,}1$), otro mide $y$ ($z_2 = 0{,}9$) y otro, $x - y$ ($z_3 = 1{,}5$). Estima $(x, y)$ por mínimos cuadrados.

**Solución.**

1. $H = \begin{bmatrix} 1 & 0 \\ 0 & 1 \\ 1 & -1 \end{bmatrix}$, $H^TH = \begin{bmatrix} 2 & -1 \\ -1 & 2 \end{bmatrix}$ y $H^T\mathbf{z} = [2{,}1 + 1{,}5;\ 0{,}9 - 1{,}5] = [3{,}6;\ -0{,}6]$.
2. $(H^TH)^{-1} = \dfrac{1}{3}\begin{bmatrix} 2 & 1 \\ 1 & 2 \end{bmatrix}$ (determinante $4 - 1 = 3$).
3. $\hat{\mathbf{x}} = \dfrac{1}{3}[2 \cdot 3{,}6 - 0{,}6;\ 3{,}6 - 1{,}2] = \dfrac{1}{3}[6{,}6;\ 2{,}4]$.

**Resultado.** $\hat{\mathbf{x}} = (2{,}2;\ 0{,}8)$. Residuos: $\mathbf{z} - H\hat{\mathbf{x}} = [-0{,}1;\ 0{,}1;\ 0{,}1]$. Ninguna medida se cumple exacta: LS reparte el error.

### 9.2. Mínimos cuadrados ponderados (media pesada)

**Enunciado.** Dos sensores miden la misma distancia: $z_1 = 5{,}0$ m con $\sigma_1 = 0{,}1$ m y $z_2 = 5{,}3$ m con $\sigma_2 = 0{,}2$ m. ¿Estimación y desviación típica?

**Solución.**

1. Pesos $1/\sigma^2$: $1/0{,}01 = 100$ y $1/0{,}04 = 25$.
2. $\hat{x} = \dfrac{100 \cdot 5{,}0 + 25 \cdot 5{,}3}{125} = \dfrac{500 + 132{,}5}{125}$.
3. $\sigma_{\hat{x}}^2 = 1/125 = 0{,}008$.

**Resultado.** $\hat{x} = 5{,}06$ m y $\sigma_{\hat{x}} = 0{,}089$ m: queda cerca del sensor bueno y es mejor que los dos por separado. La media simple daría 5,15.

### 9.3. Un paso de Gauss-Newton

**Enunciado.** Balizas en $(0, 0)$, $(10, 0)$ y $(0, 10)$. Distancias medidas: $\mathbf{z} = [7{,}1;\ 7{,}0;\ 7{,}2]$. Partiendo de $\hat{\mathbf{x}}_0 = (4, 4)$, da un paso de Gauss-Newton sin ponderar.

**Solución.**

1. Distancias predichas: $d_1 = \sqrt{32} = 5{,}657$, $d_2 = \sqrt{36 + 16} = 7{,}211$, $d_3 = 7{,}211$.
2. Error: $\mathbf{e} = \mathbf{z} - \mathbf{h} = [1{,}443;\ -0{,}211;\ -0{,}011]$.
3. Jacobiano, filas $[-\Delta x/d,\ -\Delta y/d]$ con $\Delta = \mathbf{b}_i - \hat{\mathbf{x}}$: $J = \begin{bmatrix} 0{,}7071 & 0{,}7071 \\ -0{,}8321 & 0{,}5547 \\ 0{,}5547 & -0{,}8321 \end{bmatrix}$.
4. $J^TJ = \begin{bmatrix} 1{,}5 & -0{,}4231 \\ -0{,}4231 & 1{,}5 \end{bmatrix}$ y $J^T\mathbf{e} = [1{,}1899;\ 0{,}9126]$.
5. Determinante $2{,}25 - 0{,}179 = 2{,}071$, así que $\boldsymbol{\delta} = \dfrac{1}{2{,}071}[1{,}5 \cdot 1{,}1899 + 0{,}4231 \cdot 0{,}9126;\ 0{,}4231 \cdot 1{,}1899 + 1{,}5 \cdot 0{,}9126] = [1{,}048;\ 0{,}904]$.

**Resultado.** $\hat{\mathbf{x}}_1 = (5{,}048;\ 4{,}904)$. La siguiente iteración da $\boldsymbol{\delta} = (0{,}042;\ 0{,}045)$, ya pequeño: converge a unos $(5{,}09;\ 4{,}95)$. El jacobiano se recalcula en cada paso.

### 9.4. Dimensiones y observabilidad

**Enunciado.** (a) En el EKF de la práctica 5.2 el robot ve 4 landmarks con rango y bearing. ¿Dimensiones de $\mathbf{z}$, $H$, $Q_t$, $S$ y $K$? (b) Con solo distancias a 3 balizas y estado $(x, y)$, ¿dimensión de $J$? ¿Se puede estimar $\theta$? (c) Se estima una marca con LS desde 3 poses conocidas con un sensor de solo bearing. ¿Dimensión del error?

**Solución.**

1. Cada landmark aporta 2 filas: $\mathbf{z}$ es $8\times1$, $H$ es $8\times3$ (filas = medidas, columnas = estado), $Q_t$ = `np.kron(np.eye(4), cov)` es $8\times8$, $S = HPH^T + Q_t$ es $8\times8$ y $K = PH^TS^{-1}$ es $3\times8$.
2. $J$ es $3\times2$ y $J^TJ$, $2\times2$. La distancia no depende de $\theta$: **no es observable**.
3. Una fila por número medido: $3 \cdot 1 = 3$ (con rango y bearing serían 6).

**Resultado.** (a) $8\times1$, $8\times3$, $8\times8$, $8\times8$, $3\times8$. (b) $3\times2$, y no. (c) 3.

### 9.5. ICP en 1D

**Enunciado.** Puntos fijos $m = \{0;\ 4;\ 9\}$ y puntos del scan $q = \{1{,}2;\ 5{,}5;\ 9{,}8\}$. Haz ICP buscando solo una traslación $t$.

**Solución.**

1. Emparejar cada $q$ con el $m$ más cercano: $1{,}2 \to 0$, $5{,}5 \to 4$, $9{,}8 \to 9$.
2. Traslación óptima: la media de las diferencias, $t = \dfrac{(0 - 1{,}2) + (4 - 5{,}5) + (9 - 9{,}8)}{3} = \dfrac{-3{,}5}{3} = -1{,}167$.
3. $q' = \{0{,}033;\ 4{,}333;\ 8{,}633\}$. Al volver a emparejar, las parejas no cambian y $t = 0$: ha convergido.
4. Error: de $1{,}44 + 2{,}25 + 0{,}64 = 4{,}33$ pasa a $0{,}033^2 + 0{,}333^2 + 0{,}367^2 = 0{,}247$.

**Resultado.** $t = -1{,}167$ y $E = 0{,}247$. No llega a 0 porque los dos conjuntos no son idénticos, y solo está garantizado un mínimo local.

### 9.6. Probabilidad en una rejilla

**Enunciado.** En la rejilla de la diapositiva, la fila 5 vale $[0{,}02;\ 0{,}1;\ 0{,}15;\ 0{,}1;\ 0{,}05]$ en las columnas 3 a 7, $P(r = 5) = 0{,}42$ y $P(c = 5) = 0{,}38$. (a) $P(r = 5 \cup c = 5)$. (b) $P(r = 5 \mid c = 5)$. (c) Aparte: un robot está en la celda $(3, 2)$ con probabilidad 1/8, independiente de su orientación, y la probabilidad de mirar al sur o al este es 1/2. ¿Probabilidad de las dos cosas?

**Solución.**

1. Unión: $P(A) + P(B) - P(A \cap B) = 0{,}42 + 0{,}38 - 0{,}15$. La celda del cruce no se cuenta dos veces.
2. Condicional: $P(r = 5, c = 5)/P(c = 5) = 0{,}15/0{,}38$.
3. Independientes: se multiplican, $1/8 \cdot 1/2$.

**Resultado.** (a) 0,65. (b) 0,395. (c) 1/16 = 0,0625.

### 9.7. Filtro de rejilla: predicción y corrección

**Enunciado.** Pasillo de celdas 0 a 5 con $bel = [0;\ 0{,}5;\ 0{,}5;\ 0;\ 0;\ 0]$. Se ordena avanzar 1 celda: se queda con 0,1, avanza 1 con 0,8 y avanza 2 con 0,1. Hay puertas en las celdas 3 y 5. El sensor detecta «puerta» con probabilidad 0,6 si hay puerta y 0,2 si no la hay, y detecta una puerta. ¿Creencia final?

**Solución (predicción, sin normalizar).**

| Celda | Cuenta | $\overline{bel}$ |
|---|---|---|
| 1 | $0{,}1 \cdot 0{,}5$ | 0,05 |
| 2 | $0{,}1 \cdot 0{,}5 + 0{,}8 \cdot 0{,}5$ | 0,45 |
| 3 | $0{,}8 \cdot 0{,}5 + 0{,}1 \cdot 0{,}5$ | 0,45 |
| 4 | $0{,}1 \cdot 0{,}5$ | 0,05 |

**Solución (corrección).** Se multiplica por la verosimilitud y se normaliza:

| Celda | $\overline{bel}$ | $P(z \mid x)$ | Producto | $bel$ |
|---|---|---|---|---|
| 1 | 0,05 | 0,2 | 0,01 | **0,026** |
| 2 | 0,45 | 0,2 | 0,09 | **0,237** |
| 3 | 0,45 | 0,6 | 0,27 | **0,711** |
| 4 | 0,05 | 0,2 | 0,01 | **0,026** |
| | | | Suma 0,38 | 1 |

**Resultado.** $bel = [0;\ 0{,}026;\ 0{,}237;\ 0{,}711;\ 0{,}026;\ 0]$, con $\eta = 1/0{,}38 = 2{,}63$. La celda 5 tiene puerta, pero su predicción era 0: sigue en 0.

### 9.8. Filtro de Kalman en 1D

**Enunciado.** $\mu = 2$, $\sigma^2 = 0{,}5$. El robot avanza $u = 1$ con varianza $R = 0{,}3$ y luego mide su posición, $z = 3{,}4$, con $Q = 0{,}2$. ¿Creencia final?

**Solución.**

1. Predicción: $\bar\mu = 2 + 1 = 3$ y $\bar\sigma^2 = 0{,}5 + 0{,}3 = 0{,}8$.
2. Ganancia: $K = \dfrac{0{,}8}{0{,}8 + 0{,}2} = 0{,}8$.
3. Corrección: $\mu = 3 + 0{,}8(3{,}4 - 3) = 3{,}32$ y $\sigma^2 = (1 - 0{,}8) \cdot 0{,}8 = 0{,}16$.

**Resultado.** $\mathcal{N}(3{,}32;\ 0{,}16)$. La media queda más cerca de la medida porque la predicción era más incierta que el sensor ($0{,}8 > 0{,}2$).

### 9.9. EKF en 1D con un sensor no lineal

**Enunciado.** Un robot se mueve por un raíl (eje $x$) y mide la distancia a una baliza en $(0, 3)$: $h(x) = \sqrt{x^2 + 9}$. Tras predecir, $\bar\mu = 4$ y $\bar\sigma^2 = 0{,}25$. Mide $z = 5{,}3$ con $Q = 0{,}04$. ¿Corrección?

**Solución.**

1. Medida esperada con el modelo **no lineal**: $h(4) = \sqrt{25} = 5$.
2. Jacobiano en $\bar\mu$: $H = \dfrac{x}{\sqrt{x^2 + 9}} = 4/5 = 0{,}8$.
3. $S = H^2\bar\sigma^2 + Q = 0{,}64 \cdot 0{,}25 + 0{,}04 = 0{,}2$ y $K = \bar\sigma^2H/S = 0{,}25 \cdot 0{,}8/0{,}2 = 1{,}0$.
4. $\mu = 4 + 1{,}0 \cdot (5{,}3 - 5) = 4{,}3$ y $\sigma^2 = (1 - KH)\bar\sigma^2 = (1 - 0{,}8) \cdot 0{,}25$.

**Resultado.** $\mu = 4{,}3$ y $\sigma^2 = 0{,}05$. Ojo: $K$ no es una probabilidad, y en un EKF puede valer 1 o más.

### 9.10. Predicción del EKF en el plano

**Enunciado.** $\boldsymbol{\mu} = [1,\ 2,\ 90°]^T$, $\Sigma = \operatorname{diag}(0{,}04;\ 0{,}04;\ 0{,}01)$. Comando odométrico $\mathbf{u} = [1,\ 0,\ 0]^T$ con $\Sigma_u = \operatorname{diag}(0{,}01;\ 0{,}0025;\ 0{,}0004)$. ¿$\bar{\boldsymbol{\mu}}$ y $\bar\Sigma$?

**Solución.**

1. $\bar{\boldsymbol{\mu}} = \boldsymbol{\mu} \oplus \mathbf{u} = [1 + \cos90° \cdot 1,\ 2 + \sin90° \cdot 1,\ 90°] = [1,\ 3,\ 90°]$.
2. $G = \begin{bmatrix} 1 & 0 & -u_x\sin\theta \\ 0 & 1 & u_x\cos\theta \\ 0 & 0 & 1 \end{bmatrix} = \begin{bmatrix} 1 & 0 & -1 \\ 0 & 1 & 0 \\ 0 & 0 & 1 \end{bmatrix}$ y $J_2 = \begin{bmatrix} 0 & -1 & 0 \\ 1 & 0 & 0 \\ 0 & 0 & 1 \end{bmatrix}$.
3. $G\Sigma G^T = \begin{bmatrix} 0{,}05 & 0 & -0{,}01 \\ 0 & 0{,}04 & 0 \\ -0{,}01 & 0 & 0{,}01 \end{bmatrix}$: el error de $\theta$ pasa a $x$.
4. $R = J_2\Sigma_uJ_2^T = \operatorname{diag}(0{,}0025;\ 0{,}01;\ 0{,}0004)$: girado 90°, el ruido de avance va a $y$ y el lateral, a $x$.

**Resultado.** $\bar{\boldsymbol{\mu}} = [1,\ 3,\ 90°]^T$ y $\bar\Sigma = \begin{bmatrix} 0{,}0525 & 0 & -0{,}01 \\ 0 & 0{,}05 & 0 \\ -0{,}01 & 0 & 0{,}0104 \end{bmatrix}$. Todos los términos de la diagonal crecen.

### 9.11. Pesos de las partículas y estimación

**Enunciado.** Cuatro partículas en 1D, en $x = 1{,}0;\ 1{,}5;\ 2{,}0;\ 2{,}5$, con pesos iguales. Una baliza en $x = 0$ da un rango $z = 1{,}8$ con $\sigma_z = 0{,}3$. ¿Pesos normalizados y pose estimada?

**Solución.**

| $x$ | $\nu = z - x$ | $\nu^2/2\sigma_z^2$ | $w$ sin normalizar | $w$ |
|---|---|---|---|---|
| 1,0 | 0,8 | 3,556 | 0,0286 | **0,019** |
| 1,5 | 0,3 | 0,5 | 0,6065 | **0,404** |
| 2,0 | −0,2 | 0,222 | 0,8007 | **0,533** |
| 2,5 | −0,7 | 2,722 | 0,0657 | **0,044** |
| | | | Suma 1,5016 | 1 |

Media ponderada: $0{,}019 \cdot 1 + 0{,}404 \cdot 1{,}5 + 0{,}533 \cdot 2 + 0{,}044 \cdot 2{,}5$.

**Resultado.** $w = [0{,}019;\ 0{,}404;\ 0{,}533;\ 0{,}044]$ y $\hat{x} = 1{,}80$ (varianza 0,091). La división se hace por $\sigma_z^2$, no por $\sigma_z$.

### 9.12. Remuestreo con la acumulada

**Enunciado.** Con los pesos del ejercicio anterior y los números aleatorios $r = [0{,}10;\ 0{,}35;\ 0{,}60;\ 0{,}97]$, ¿qué partículas sobreviven?

**Solución.**

1. Acumulada: $C = [0{,}019;\ 0{,}423;\ 0{,}956;\ 1]$ (la última se fuerza a 1).
2. Cada $r$ elige la partícula cuyo intervalo lo contiene: $0{,}10$ y $0{,}35 \in (0{,}019;\ 0{,}423]$ → partícula 2; $0{,}60$ → partícula 3; $0{,}97$ → partícula 4. Es `np.searchsorted(C, r) = [1, 1, 2, 3]` (base cero).

**Resultado.** El nuevo conjunto es $\{2, 2, 3, 4\}$, todas con peso $1/4$. La 1 desaparece y la 2 sale dos veces: es con reemplazo.

## 10. Anexo C · Ejercicios tipo de las prácticas

### 10.1. Práctica 4.1 · Rellena `to_world_frame()`

**Enunciado.** Completa los huecos.

```python
r, a = z1_p_r[0,0], z1_p_r[1,0]
s, c = np.sin(a), np.cos(a)
Jac_pol_car = np.array([
    [c, __(1)__],
    [s, __(2)__]
])
z1_car_rel = (np.vstack([__(3)__, r*s]), Jac_pol_car@W1@__(4)__)
z1_ext = np.vstack([z1_car_rel[0], __(5)__])
Jac_ap = J1(x1_w ,z1_ext)[__(6)__]
Jac_aa = J2(x1_w ,z1_ext)[__(7)__]
z1_w = __(8)__(x1_w ,z1_ext)[0:2,[0]]
Wz1 = Jac_ap @ __(9)__ @ Jac_ap.T + Jac_aa @ __(10)__ @ Jac_aa.T
```

**Solución.** (1) `-r*s`, (2) `r*c`, (3) `r*c`, (4) `Jac_pol_car.T`, (5) `0`, (6) `0:2,:`, (7) `0:2,0:2`, (8) `tcomp`, (9) `Qx1_w`, (10) `z1_car_rel[1]`.

**Por qué.** El jacobiano de $[r\cos a, r\sin a]$ respecto a $[r, a]$ lleva el factor $r$ en la columna del ángulo. El punto se amplía con un 0 para tratarlo como pose. `Jac_ap` es 2×3 (va con la covarianza de la pose, 3×3) y `Jac_aa` es 2×2 (va con la de la medida en cartesianas, no con `W1`, que está en polares).

### 10.2. Práctica 4.2 · Láser: haces, puntos y el error del código

**Enunciado.** (a) ¿Cuántos haces da `Laser2D` con FOV = 180° y resolución 0,5°? ¿A qué ángulo apunta el primero? (b) El láser está en $[2,\ 1,\ \pi/2]$ y un haz mide $r = 3$ con $\alpha = -\pi/2$. ¿Dónde cae el punto? (c) ¿Qué línea está mal?

```python
1  for i in range(z.shape[1]):
2      distance = z[0, i]
3      angle = z[1, i]
4      x_local = distance*np.cos(angle)
5      y_local = distance*np.sin(angle)
6      pose_obs_global = tcomp(np.vstack([x_local, y_local, 0]), pose)
```

**Solución.**

1. $n = \lfloor 180/0{,}5\rfloor + 1 = 361$; el primero, a $-\mathrm{FOV}/2 = -90°$.
2. Dirección global $\theta + \alpha = 0$: el punto es $(2 + 3,\ 1 + 0) = (5, 1)$.
3. La línea 6 compone al revés: el punto quedaría como «pose base». Es `tcomp(pose, np.vstack([x_local, y_local, 0]))`, con la pose del sensor primero.

**Resultado.** (a) 361 haces, el primero a −90°. (b) $(5, 1)$. (c) La línea 6.

### 10.3. Práctica 4.3 · `LaserScan`, tf y comandos

**Enunciado.** El láser del TurtleBot3 tiene `angle_min = -π`, `angle_increment = 0.0078638` y 800 haces. (a) ¿Qué índice apunta a la izquierda (+90°)? (b) `ranges[599]` vale 16,0 = `range_max`. ¿Qué significa? (c) `tf2_echo base_link laser1` da $[-0{,}032;\ 0;\ 0{,}171]$ sin giro, y el robot está en `odom` en $(1, 2, 90°)$. ¿Dónde está el láser en `odom`? (d) ¿Qué comando mide la frecuencia del láser? ¿Y cuál muestra la definición del mensaje?

**Solución.**

1. $k = \dfrac{\pi/2 + \pi}{0{,}0078638} = 599{,}25$: el haz 599 (89,89°).
2. Que ese haz no ha chocado con nada en 16 m. **No** es un obstáculo a 16 m.
3. $\mathbf{x} \oplus \mathbf{x}_s$: $x = 1 + \cos90° \cdot (-0{,}032) = 1$, $y = 2 + \sin90° \cdot (-0{,}032) = 1{,}968$, altura 0,171 y yaw 90°.
4. `ros2 topic hz /laser1` y `ros2 interface show sensor_msgs/msg/LaserScan`.

**Resultado.** (a) 599. (b) Sin obstáculo dentro del alcance. (c) $(1;\ 1{,}968;\ 0{,}171)$ con yaw 90°. (d) `hz` e `interface show`.

### 10.4. Práctica 5.2 · Encuentra el error en `EKFLocalization()`

**Enunciado.** ¿Qué línea está mal?

```python
1   xPred = tcomp(robot.xEst, u)
2   G = J1(robot.xEst, u)
3   j2 = J2(robot.xEst, u)
4   PPred = G@robot.PEst@G.T + j2@robot.cov_move@j2.T
5   H = getObsJac(robot.xEst, landmark, Map)
6   Q_t = np.kron(np.eye(landmark.shape[0]), sensor.cov)
7   K = PPred@H.T@linalg.inv(H@PPred@H.T + Q_t)
8   innovation = z - sensor.observe(xPred, Map[:, landmark], noisy=False)
9   innovation[1::2] = AngleWrapList(innovation[1::2])
10  xEst = xPred + K@innovation
11  PEst = (np.eye(3) - K@H)@PPred
```

**Solución.** La línea 5. $H$ se evalúa en la **pose predicha**: `H = getObsJac(xPred, landmark, Map)`. `G` y `j2` sí se evalúan en `robot.xEst`, la estimación anterior.

**Variantes típicas del mismo ejercicio.** `noisy=True` en la línea 8 (la medida esperada no lleva ruido); `robot.PEst` en vez de `PPred` en la 7 o la 11; `+ robot.cov_move` sin `j2` en la 4; `xPred = tcomp(robot.true_pose, u)` en la 1 (el filtro no conoce la pose real); quitar la línea 9 (los bearings de la innovación pueden salir de $(-\pi, \pi]$).

### 10.5. Práctica 5.3 · Media circular y remuestreo

**Enunciado.** (a) Tres partículas con orientaciones 170°, −170° y 160° y pesos 0,5, 0,3 y 0,2. ¿Qué orientación estima `current_estimation()`? ¿Y la media aritmética? (b) Completa `resample()`.

```python
cumulative = np.__(1)__([particle.weight for particle in particles])
cumulative[-1] = __(2)__
r = np.random.uniform(0, 1, M)
selected = np.searchsorted(__(3)__, __(4)__)
return [Particle(particles[k].pose.copy(), __(5)__) for k in selected]
```

**Solución (a).**

1. $\bar c = 0{,}5\cos170° + 0{,}3\cos(-170°) + 0{,}2\cos160° = -0{,}9758$.
2. $\bar s = 0{,}5\sin170° + 0{,}3\sin(-170°) + 0{,}2\sin160° = 0{,}0868 - 0{,}0521 + 0{,}0684 = 0{,}1031$.
3. $\bar\theta = \operatorname{atan2}(\bar s, \bar c) = 173{,}97°$; $R = \sqrt{\bar c^2 + \bar s^2} = 0{,}981$, varianza circular $1 - R = 0{,}019$.
4. Media aritmética: $0{,}5 \cdot 170 - 0{,}3 \cdot 170 + 0{,}2 \cdot 160 = 66°$, que apunta a otro lado.

**Solución (b).** (1) `cumsum`, (2) `1.`, (3) `cumulative`, (4) `r`, (5) `1. / M`.

**Resultado.** 173,97° con la media circular, frente a un absurdo 66°. En el código es `np.atan2(dir[1], dir[0])`: primero el seno.

### 10.6. Práctica 5.4 · Covarianza, cuaternión y tf de AMCL

**Enunciado.** `/amcl_pose` publica `covariance[0] = 0.04`, `[1] = 0.012`, `[7] = 0.09` y `[35] = 0.0121`, y una orientación con $q_z = 0{,}3827$ y $q_w = 0{,}9239$. (a) Desviaciones típicas de $x$, $y$ y yaw, y correlación $xy$. (b) Yaw. (c) Si `map → noisy_odom` es $[1,\ 0,\ 90°]$ y `noisy_odom → base_link` es $[2,\ 1,\ 0°]$, ¿pose de AMCL?

**Solución.**

1. Varianzas en los índices 0, 7 y 35: $\sigma_x = \sqrt{0{,}04} = 0{,}2$ m, $\sigma_y = 0{,}3$ m y $\sigma_\theta = 0{,}11$ rad $= 6{,}3°$. El índice 1 es la covarianza: $\rho = 0{,}012/(0{,}2 \cdot 0{,}3) = 0{,}2$.
2. $\text{yaw} = 2\operatorname{atan2}(0{,}3827;\ 0{,}9239) = 2 \cdot 22{,}5°$.
3. Composición: $x = 1 + \cos90° \cdot 2 - \sin90° \cdot 1 = 0$, $y = 0 + \sin90° \cdot 2 + \cos90° \cdot 1 = 2$, $\theta = 90°$.

**Resultado.** (a) 0,2 m, 0,3 m, 6,3° y $\rho = 0{,}2$. (b) 45°. (c) $[0,\ 2,\ 90°]$.

### 10.7. Práctica 6.3 · Índices, modelo inverso y log odds

**Enunciado.** (a) `OccupancyGridMap(10, 6, 0.05)`: ¿`shape`? ¿Cómo se accede a la celda del punto $(3{,}27;\ 1{,}84)$ m? (b) Con $\sigma = 0{,}4$ celdas, ¿qué $P(m_i \mid z_t)$ da el modelo inverso a $\rho - d = -1{,}0$, $-0{,}2$, $+0{,}4$ y $+0{,}8$ celdas? (c) Con prior 0,5, una celda recibe 0,2, 0,6049 y 0,8 en tres scans. ¿Probabilidad final y valor tras umbralizar con 0,3 y 0,7?

**Solución (a).** Filas = alto/res = 120 y columnas = ancho/res = 200: `shape (120, 200)`. Celda `(int(3.27/0.05), int(1.84/0.05)) = (65, 36)`, que en la matriz es `log_odds[36][65]` (`[y][x]`).

**Solución (b).** Pico $1/\sqrt{2\pi \cdot 0{,}16} = 0{,}9974$ y $f = 0{,}9974\,e^{-(\rho - d)^2/(2 \cdot 0{,}16)}$:

| $\rho - d$ | $f$ | Caso | $P$ |
|---|---|---|---|
| −1,0 | 0,0438 | Antes del impacto y $f < 0{,}2$ | **0,2** |
| −0,2 | 0,8802 | Ninguno de los dos primeros; satura | **0,8** |
| +0,4 | 0,6049 | Detrás, pero $f \ge 0{,}5$ | **0,6049** |
| +0,8 | 0,1350 | Detrás y $f < 0{,}5$ | **0,5** |

**Solución (c).** $\tau = \ln\frac{p}{1-p}$: $-1{,}3863$, $+0{,}4260$ y $+1{,}3863$. Con $l_0 = 0$, $l = 0{,}4260$ y $P = 1 - \dfrac{1}{1 + e^{0{,}426}} = 0{,}6049$.

**Resultado.** (a) `(120, 200)` y `log_odds[36][65]`. (b) 0,2; 0,8; 0,6049; 0,5. (c) $P = 0{,}605$, entre 0,3 y 0,7: queda **desconocida** (0,5). Con tres impactos de 0,8 y uno libre, $l = 2{,}773$ y $P = 0{,}941$: ocupada.

## 11. Anexo D · Preguntas rápidas de concepto

Respuestas cortas, para repasar en cinco minutos.

1. **¿El GPS es activo o pasivo?** Pasivo: solo escucha a los satélites.
2. **¿Cuántos satélites necesita el GPS y por qué?** 4: tres coordenadas y el desfase del reloj del receptor.
3. **¿Qué mide una cámara monocular?** Solo bearing. Para la distancia hace falta estéreo, RGB-D o moverse y triangular.
4. **¿La verosimilitud integra 1 en $\mathbf{x}$?** No. La PDF integra 1 en $z$; la verosimilitud es función de $\mathbf{x}$ con $z$ fijo.
5. **¿Qué modelo de scan necesita ray casting?** El beam model. El likelihood field usa un campo precalculado.
6. **¿Qué es la asociación de datos?** Decidir qué landmark ha generado cada observación antes de aplicar $h(\mathbf{x}, \mathbf{m}_i)$.
7. **¿A qué equivale WLS con error gaussiano?** A la estimación de máxima verosimilitud.
8. **¿Cuántas balizas de solo rango hacen falta en 2D?** Tres no alineadas, y aun así la orientación no es observable.
9. **¿ICP necesita descriptores?** No: empareja por punto más cercano. Por eso solo garantiza un mínimo local.
10. **¿Qué regla se usa al predecir y cuál al corregir en el filtro de Bayes?** Probabilidad total al predecir; Bayes al corregir.
11. **Si $Q$ crece mucho, ¿qué pasa con $K$?** Baja: el filtro se fía más de la predicción.
12. **¿Qué filtro no puede representar dos pasillos idénticos a la vez?** Kalman/EKF: una gaussiana tiene un solo pico.
13. **¿Cuánto pesa cada partícula tras remuestrear?** $1/M$.
14. **¿Para qué sirve el remuestreo?** Para concentrar las partículas donde hay probabilidad y evitar la degeneración.
15. **¿Qué publica AMCL en tf y por qué no `map → base_link`?** `map → noisy_odom`; `base_link` ya tiene padre, y cada frame solo puede tener uno.
16. **¿Qué es KLD-sampling?** Adaptar el número de partículas a la dispersión de la creencia.
17. **¿Por qué el mapeado de la 6.3 no usa los comandos $\mathbf{u}$?** Porque las poses se conocen.
18. **¿Qué log odds tiene una celda con $P = 0{,}5$?** 0: una observación «no sé» no la cambia.
