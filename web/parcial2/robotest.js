"use strict";

// Banco del Parcial 2. Formatos:
//   single / multi : options + answer (índice o lista de índices)
//   numeric        : answer (número) + tol (absoluta) o tolRel (relativa) + unit
//   cloze          : code con huecos {{0}}, {{1}}… + blanks (lista de respuestas válidas por hueco)
//   bug            : code (líneas) + answer (nº de línea, empezando en 1) + fix (línea corregida)
const questions = [
  // ───────────── L4 · Sensores ─────────────
  { id: "L4-c01", lesson: "L4", topic: "Clasificación", kind: "Teoría", format: "multi", source: "Nueva",
    prompt: "¿Cuáles de estos sensores son exteroceptivos? (Marca todos los correctos)",
    options: ["Encoder de rueda", "IMU (acelerómetro + giróscopo)", "LiDAR", "Cámara RGB", "Sonar", "Sensor de batería"],
    answer: [2, 3, 4],
    explanation: "Exteroceptivo = mide propiedades del entorno (distancias, ángulos, luz reflejada). LiDAR, cámara y sonar lo son. Encoder, IMU y batería miden el estado interno o el movimiento del propio robot: son propioceptivos." },
  { id: "L4-c02", lesson: "L4", topic: "Clasificación", kind: "Teoría", format: "single", source: "Nueva",
    prompt: "¿Qué pareja contiene solo sensores pasivos?",
    options: ["LiDAR y sonar", "Cámara RGB y receptor GNSS/GPS", "Cámara RGB-D y sonar", "Infrarrojo y LiDAR"],
    answer: 1,
    explanation: "Un sensor pasivo usa energía que ya está en el entorno (luz ambiente, señales de satélite). La cámara RGB y el receptor GPS no emiten nada. LiDAR, sonar, infrarrojo y RGB-D emiten su propia energía (luz o sonido): son activos, funcionan mejor con luz cambiante pero consumen más." },
  { id: "L4-c03", lesson: "L4", topic: "Landmarks y beacons", kind: "Teoría", format: "single", source: "Nueva",
    prompt: "¿Qué distingue a un beacon de un landmark natural?",
    options: ["El beacon se instala o designa a propósito para detectarlo y localizarse, y da posicionamiento absoluto", "El beacon es cualquier elemento reconocible del entorno, como un edificio o una montaña", "El beacon no necesita conocerse su posición en el mapa", "El beacon solo puede observarse con una cámara"],
    answer: 0,
    explanation: "Landmark: elemento reconocible del entorno (edificio, montaña, puntos clave 3D) que no requiere instalación. Beacon: landmark artificial instalado o designado a propósito (satélite GPS, código QR, reflector, antena WiFi); como su posición es conocida, permite posicionamiento absoluto con algoritmos simples." },
  { id: "L4-c04", lesson: "L4", topic: "GPS", kind: "Teoría", format: "single", source: "Nueva",
    prompt: "¿En qué principio geométrico se basa el posicionamiento GPS?",
    options: ["Triangulación: medir ángulos a balizas conocidas", "Trilateración: medir distancias (pseudorangos) a satélites de posición conocida", "Odometría: integrar la velocidad de las ruedas", "Correlación de imágenes de satélite"],
    answer: 1,
    explanation: "GPS mide distancias (pseudorangos) a satélites con posición conocida: es trilateración. Con 1 satélite estás en una esfera, con 2 en un círculo y con 3 en un punto (caso ideal). Hace falta un 4.º satélite para estimar también el desfase del reloj del receptor. Triangulación sería medir ángulos." },
  { id: "L4-c05", lesson: "L4", topic: "GPS", kind: "Teoría", format: "single", source: "Nueva",
    prompt: "Un robot agrícola trabaja al aire libre y necesita precisión de pocos centímetros. ¿Qué solución GPS encaja?",
    options: ["GPS estándar (sin correcciones)", "DGPS", "RTK GPS", "Ninguna: el GPS nunca baja de 3 m"],
    answer: 2,
    explanation: "Valores típicos de las diapositivas: GPS estándar 3–10 m; DGPS (correcciones de una estación de referencia cercana) 0,5–3 m; RTK (medidas de fase de la portadora y correcciones en tiempo real) 1–5 cm." },
  { id: "L4-c06", lesson: "L4", topic: "GPS", kind: "Teoría", format: "single", source: "Nueva",
    prompt: "En una calle estrecha con edificios altos («urban canyon»), ¿qué fuente de error GPS predomina?",
    options: ["Multitrayecto (multipath): señales reflejadas en los edificios y poca visibilidad de satélites", "Error de sincronización del reloj atómico del satélite", "Efecto de la ionosfera exclusivamente", "Ruido térmico del receptor"],
    answer: 0,
    explanation: "En el «urban canyon» las señales llegan reflejadas en los edificios (multipath) y hay pocos satélites visibles. Las otras fuentes de error (sincronización, atmósfera) existen siempre, pero no son las propias de esa situación." },
  { id: "L4-c07", lesson: "L4", topic: "Sonar", kind: "Teoría", format: "multi", source: "Nueva",
    prompt: "¿Cuáles son limitaciones típicas del sonar? (Marca todas las correctas)",
    options: ["Mala resolución angular por su haz ancho (≈30°)", "Las superficies lisas (especulares) pueden desviar el eco y no se detecta nada", "Las esquinas abiertas pueden no devolver suficiente sonido", "Necesita una precisión angular de 0,1° para funcionar", "Las reflexiones múltiples producen distancias erróneas"],
    answer: [0, 1, 2, 4],
    explanation: "El sonar tiene un haz de ≈30°: dos objetos a la misma distancia y separados lateralmente no se distinguen, y se detecta el más cercano dentro del haz. Además es sensible al tipo de superficie (reflexión especular, sin eco), puede no ver las esquinas y sufre reflexiones múltiples. 0,1° es la resolución típica de un LiDAR, no del sonar." },
  { id: "L4-c08", lesson: "L4", topic: "Infrarrojo", kind: "Teoría", format: "single", source: "Nueva",
    prompt: "¿Cómo mide la distancia un sensor de rango infrarrojo (tipo Sharp)?",
    options: ["Por tiempo de vuelo de un pulso ultrasónico", "Por triangulación: a partir del ángulo con que el haz reflejado incide en un array de detectores", "Por desfase de una señal modulada en amplitud", "Midiendo la intensidad de la luz ambiente"],
    answer: 1,
    explanation: "El infrarrojo se basa en la triangulación de la luz: emisor y array de detectores separados una base b; la distancia se obtiene del ángulo detectado. Tiene un alcance de ≈2 m y buena resolución angular, pero es sensible a objetos transparentes, brillantes o negros y a la luz solar." },
  { id: "L4-c09", lesson: "L4", topic: "LiDAR", kind: "Teoría", format: "single", source: "Nueva",
    prompt: "En un LiDAR por desfase (phase shift), ¿por qué la distancia es ambigua a partir de cierto valor?",
    options: ["Porque el desfase solo se mide entre 0 y 2π: más allá de c/(2·f_m) la medida se repite", "Porque la luz se atenúa y no vuelve el eco", "Porque el espejo rotatorio introduce un retardo", "Porque solo mide el tiempo de ida, no el de vuelta"],
    answer: 0,
    explanation: "r = c·Δφ/(4π·f_m). Como Δφ solo se conoce módulo 2π, el rango sin ambigüedad es c/(2·f_m); más allá hacen falta técnicas adicionales (por ejemplo, varias frecuencias). El ToF pulsado mide Δt directamente y no tiene ese problema." },
  { id: "L4-c10", lesson: "L4", topic: "Cámaras", kind: "Teoría", format: "single", source: "Nueva",
    prompt: "¿Qué información da un píxel de una cámara monocular sobre un punto 3D?",
    options: ["Su posición 3D completa", "Solo la dirección (bearing): el punto está en una línea en el espacio", "Solo la distancia (range)", "La distancia y la reflectividad"],
    answer: 1,
    explanation: "Una cámara monocular solo da bearing: el píxel define la línea de visión. Con una cámara estéreo (dos vistas con línea base conocida) se triangulan las dos líneas y se obtienen range y bearing." },
  { id: "L4-c11", lesson: "L4", topic: "Cámaras RGB-D", kind: "Teoría", format: "multi", source: "Nueva",
    prompt: "Frente a un LiDAR 3D, ¿qué es cierto de una cámara RGB-D? (Marca todas las correctas)",
    options: ["No tiene partes móviles", "Da un mapa de profundidad denso (un valor por píxel)", "Su alcance típico es corto (≈0,2–4 m, interiores)", "Alcanza más de 100 m en exteriores", "Cada píxel aporta color y distancia"],
    answer: [0, 1, 2, 4],
    explanation: "La RGB-D (por ejemplo, la RealSense D455) es de estado sólido, da profundidad densa y combina color y distancia en cada píxel, pero tiene un alcance corto (< 4 m). Los >100 m son propios de los LiDAR 3D de automoción." },
  { id: "L4-c12", lesson: "L4", topic: "LiDAR 4D", kind: "Teoría", format: "single", source: "Nueva",
    prompt: "En un LiDAR «4D», ¿qué es la cuarta componente de cada punto pᵢ = (xᵢ, yᵢ, zᵢ, gᵢ)?",
    options: ["El tiempo de captura", "La velocidad radial del objeto", "La reflectividad (intensidad) de la señal devuelta", "Una cuarta coordenada espacial"],
    answer: 2,
    explanation: "La cuarta componente no es otra coordenada: es la intensidad o reflectividad de la señal devuelta (0–255 en escala de grises). Ayuda a distinguir superficies con geometría parecida." },
  // ───────────── L4 · Modelos probabilísticos ─────────────
  { id: "L4-c13", lesson: "L4", topic: "Likelihood", kind: "Teoría", format: "single", source: "Nueva",
    prompt: "Sobre p(z | x, m), ¿qué afirmación es correcta?",
    options: ["Como función de z (x y m fijos) es una pdf, y como función de x (z fijo) es una verosimilitud que no tiene por qué integrar 1", "Como función de x siempre integra 1", "La verosimilitud es la probabilidad de que el robot esté en x", "La pdf condicionada y la verosimilitud son funciones distintas que no comparten fórmula"],
    answer: 0,
    explanation: "Se usa la misma expresión de dos formas. Con x y m fijos, z es la variable aleatoria y ∫p(z|x,m)dz = 1. Con z y m fijos, L(x; m, z) mide lo compatible que es cada pose x con la medida, y ∫L dx ≠ 1. En Bayes: posterior ∝ likelihood · prior." },
  { id: "L4-c14", lesson: "L4", topic: "Independencia condicional", kind: "Teoría", format: "single", source: "Nueva",
    prompt: "Un scan tiene K medidas z₁…z_K. ¿Qué hipótesis permite escribir p(z|x,m) = ∏ p(z_k|x,m)?",
    options: ["Que las medidas son independientes entre sí sin condiciones", "Que las medidas son condicionalmente independientes dada la pose x y el mapa m", "Que todas las medidas tienen la misma varianza", "Que el ruido es uniforme"],
    answer: 1,
    explanation: "Dados x y m, cada medida depende solo de su propio ruido, y la verosimilitud conjunta se aproxima por el producto. Sin condicionar no serían independientes, porque todas dependen de la misma pose." },
  { id: "L4-c15", lesson: "L4", topic: "Asociación de datos", kind: "Teoría", format: "single", source: "Nueva",
    prompt: "¿Qué es el problema de asociación de datos con landmarks?",
    options: ["Decidir qué landmark m_j del mapa generó cada observación z_i antes de aplicar el modelo", "Sincronizar los relojes de varios sensores", "Fusionar dos gaussianas del mismo landmark", "Elegir la resolución angular del láser"],
    answer: 0,
    explanation: "Hay que establecer la correspondencia z_i ↔ m_j. Una asociación errónea lleva a una localización o un mapa erróneos. Se ayuda con descriptores (apariencia o ID) y con pruebas de compatibilidad geométrica entre ẑ_j = h(x, m_j) y z_i." },
  { id: "L4-c16", lesson: "L4", topic: "Covarianza de un landmark", kind: "Teoría", format: "single", source: "Nueva",
    prompt: "Para m = x ⊕ z_c con x = [x, y, θ]ᵀ y z_c = [z_x, z_y]ᵀ, ¿cómo es Σ_m?",
    options: ["Σ_m = J_x Σ_x J_xᵀ + J_z Σ_z J_zᵀ, con J_x de 2×3 y J_z de 2×2", "Σ_m = Σ_x + Σ_z directamente", "Σ_m = J_x Σ_x J_xᵀ · J_z Σ_z J_zᵀ", "Σ_m = J_x Σ_x J_xᵀ, con J_x de 3×3"],
    answer: 0,
    explanation: "Si Z = f(X, Y) con X e Y independientes, Σ_Z = (∂f/∂X)Σ_X(∂f/∂X)ᵀ + (∂f/∂Y)Σ_Y(∂f/∂Y)ᵀ. m tiene 2 componentes, x tiene 3 y z tiene 2, así que J_x es 2×3 y J_z es 2×2. Σ_m es la suma de dos matrices 2×2: no es Σ_x + Σ_z, porque cada término debe pasar por su jacobiano." },
  { id: "L4-c17", lesson: "L4", topic: "Beam model", kind: "Teoría", format: "single", source: "Nueva",
    prompt: "En el beam model, ¿qué componente modela un obstáculo inesperado (por ejemplo, una persona) más cerca que el obstáculo del mapa?",
    options: ["p_hit: gaussiana centrada en z_exp", "p_unexp: exponencial truncada en [0, z_exp]", "p_rand: uniforme en [0, z_max]", "p_max: pico en z_max"],
    answer: 1,
    explanation: "p_unexp = η·λ·e^(−λz) para 0 ≤ z < z_exp, y 0 en otro caso: es más probable cerca del sensor. p_hit es el ruido alrededor de la distancia esperada, p_rand las lecturas espurias y p_max el «no hay eco». El modelo es la mezcla α_hit·p_hit + α_unexp·p_unexp + α_rand·p_rand + α_max·p_max, con Σα = 1." },
  { id: "L4-c18", lesson: "L4", topic: "Likelihood field", kind: "Teoría", format: "multi", source: "Nueva",
    prompt: "¿Qué ventajas tiene el likelihood field frente al beam model? (Marca todas las correctas)",
    options: ["Solo evalúa el punto final de cada haz en una tabla precalculada", "Es suave frente a pequeños cambios de la pose", "Si el mapa es estático, el campo se calcula una sola vez", "Modela exactamente el camino completo del haz, incluidas las oclusiones", "No necesita trazar rayos (ray casting) en cada evaluación"],
    answer: [0, 1, 2, 4],
    explanation: "El likelihood field (endpoint model) precalcula L(q) a partir de la distancia de cada celda al obstáculo más cercano. Evaluar es una consulta en una tabla 2D: es eficiente y suave. Ignora el camino del haz (puede «atravesar» objetos), que es justo lo que sí modela el beam model, a costa de ray casting por haz y de no ser suave." },
  { id: "L4-c19", lesson: "L4", topic: "Mapas", kind: "Teoría", format: "single", source: "Nueva",
    prompt: "¿Qué modelo de observación se usa con cada tipo de mapa?",
    options: ["Mapa de landmarks → modelos de range/bearing; mapa de ocupación → beam model o likelihood field", "Mapa de landmarks → beam model; mapa de ocupación → bearing", "Ambos mapas solo admiten el likelihood field", "El tipo de mapa no influye en el modelo de observación"],
    answer: 0,
    explanation: "Un mapa de landmarks M = {m₁…m_N} se usa con modelos de range, bearing o range+bearing (cámaras, beacons). Un mapa de ocupación M = {m_ij} (P(ocupada) por celda) se usa con escáneres láser y sensores de profundidad mediante el beam model o el likelihood field." },
  // ───────────── L4 · Cálculos ─────────────
  { id: "L4-n01", lesson: "L4", topic: "Sonar", kind: "Teoría", format: "numeric", source: "Nueva",
    prompt: "Un sonar mide un tiempo de ida y vuelta Δt = 12 ms. Con c_s = 343 m/s, ¿a qué distancia está el obstáculo?",
    answer: 2.058, tol: 0.01, unit: "m",
    explanation: "r = c_s·Δt / 2 = 343 · 0,012 / 2 = 2,058 m. Se divide entre 2 porque Δt es el tiempo de ida y vuelta." },
  { id: "L4-n02", lesson: "L4", topic: "LiDAR", kind: "Teoría", format: "numeric", source: "Nueva",
    prompt: "Un LiDAR de tiempo de vuelo mide Δt = 40 ns (ida y vuelta). Con c = 3·10⁸ m/s, ¿qué distancia mide?",
    answer: 6, tol: 0.01, unit: "m",
    explanation: "r = c·Δt / 2 = 3·10⁸ · 40·10⁻⁹ / 2 = 6 m." },
  { id: "L4-n03", lesson: "L4", topic: "LiDAR", kind: "Teoría", format: "numeric", source: "Nueva",
    prompt: "Un LiDAR por desfase usa una frecuencia de modulación f_m = 10 MHz y mide Δφ = π/2 rad. ¿Qué distancia mide? (c = 3·10⁸ m/s)",
    answer: 3.75, tol: 0.01, unit: "m",
    explanation: "r = c·Δφ / (4π·f_m) = 3·10⁸ · (π/2) / (4π · 10⁷) = 3·10⁸ / (8·10⁷) = 3,75 m." },
  { id: "L4-n04", lesson: "L4", topic: "LiDAR", kind: "Teoría", format: "numeric", source: "Nueva",
    prompt: "Para el mismo LiDAR por desfase (f_m = 10 MHz), ¿hasta qué distancia es la medida sin ambigüedad?",
    answer: 15, tol: 0.05, unit: "m",
    explanation: "Rango sin ambigüedad = c / (2·f_m) = 3·10⁸ / (2·10⁷) = 15 m. Es el r que corresponde a Δφ = 2π." },
  { id: "L4-n05", lesson: "L4", topic: "Sonar", kind: "Teoría", format: "numeric", source: "Nueva",
    prompt: "Un sonar tiene un haz efectivo de 30°. ¿Qué anchura lateral cubre el haz a 3 m del sensor?",
    answer: 1.608, tol: 0.02, unit: "m",
    explanation: "Anchura = 2·r·tan(β/2) = 2 · 3 · tan(15°) = 6 · 0,2679 = 1,61 m. Cualquier objeto dentro de esa anchura puede dar la misma lectura: por eso el sonar tiene mala resolución angular." },
  { id: "L4-n06", lesson: "L4", topic: "Range", kind: "Teoría", format: "numeric", source: "Nueva",
    prompt: "Un robot en (1, 2) m mide la distancia a un landmark en (4, 6) m. ¿Qué range ideal (sin ruido) predice h(x, m)?",
    answer: 5, tol: 0.01, unit: "m",
    explanation: "d = √((m_x − x)² + (m_y − y)²) = √(3² + 4²) = 5 m." },
  { id: "L4-n07", lesson: "L4", topic: "Bearing", kind: "Teoría", format: "numeric", source: "Nueva",
    prompt: "Un robot en x = [1 m, 1 m, 30°]ᵀ observa un landmark en (4, 4) m. ¿Qué bearing θ̂ predice el modelo? (en grados)",
    answer: 15, tol: 0.5, unit: "°",
    explanation: "θ̂ = atan2(m_y − y, m_x − x) − θ = atan2(3, 3) − 30° = 45° − 30° = 15°. El bearing se mide desde la orientación del robot: hay que restarle θ." },
  { id: "L4-n08", lesson: "L4", topic: "Range-bearing", kind: "Teoría", format: "numeric", source: "Diapositiva 41 (ej. II)",
    prompt: "Un robot en x = [2 m, 1 m, 30°]ᵀ mide un landmark con z = [r, α]ᵀ = [3 m, 15°]ᵀ. ¿Cuál es la coordenada m_x del landmark en el marco global?",
    answer: 4.121, tol: 0.01, unit: "m",
    explanation: "Dirección global: φ = θ + α = 45°. m_x = x + r·cos(θ+α) = 2 + 3·cos 45° = 2 + 2,1213 = 4,121 m (y m_y = 1 + 3·sin 45° = 3,121 m)." },
  { id: "L4-n09", lesson: "L4", topic: "Range-bearing", kind: "Teoría", format: "numeric", source: "Nueva",
    prompt: "Un robot con orientación θ = 170° observa un landmark cuya dirección en el marco global es −170°. ¿Qué bearing mide, normalizado a (−180°, 180°]?",
    answer: 20, tol: 0.5, unit: "°",
    explanation: "α = φ − θ = −170° − 170° = −340°. Normalizando (+360°) queda 20°: el landmark está 20° a la izquierda del robot. Por eso en código se usa atan2 y se normaliza el ángulo (AngleWrap)." },
  { id: "L4-n10", lesson: "L4", topic: "Modelo gaussiano", kind: "Teoría", format: "numeric", source: "Nueva",
    prompt: "Un sensor de rango tiene ruido gaussiano con σ = 0,3 m. La distancia esperada es h(x, m) = 3 m y se mide z = 3,3 m. ¿Cuánto vale p(z | x, m)?",
    answer: 0.807, tol: 0.005, unit: "m⁻¹",
    explanation: "p = 1/(σ√(2π)) · exp(−(z − h)²/(2σ²)) = 1/(0,3·2,5066) · exp(−0,09/0,18) = 1,3298 · e^(−0,5) = 1,3298 · 0,6065 ≈ 0,807. Ojo: es una densidad, puede valer más que 1 y no es una probabilidad." },
  { id: "L4-n11", lesson: "L4", topic: "Beam model", kind: "Teoría", format: "numeric", source: "Nueva",
    prompt: "En un beam model con α_hit = 0,7, α_rand = 0,3 y α_unexp = α_max = 0, para cierta medida p_hit = 0,8 y z_max = 10 m. ¿Cuánto vale p(z_k | x, m)?",
    answer: 0.59, tol: 0.002,
    explanation: "p_rand = 1/z_max = 0,1 (uniforme en [0, z_max]). p = α_hit·p_hit + α_rand·p_rand = 0,7·0,8 + 0,3·0,1 = 0,56 + 0,03 = 0,59." },
  { id: "L4-n12", lesson: "L4", topic: "Beam model", kind: "Teoría", format: "numeric", source: "Nueva",
    prompt: "En el beam model, si z_max = 4 m, ¿cuánto vale p_rand(z | x, m) para z = 1,5 m?",
    answer: 0.25, tol: 0.001, unit: "m⁻¹",
    explanation: "p_rand es uniforme en [0, z_max): 1/z_max = 1/4 = 0,25 para cualquier z del intervalo, también para 1,5 m." },
  { id: "L4-n13", lesson: "L4", topic: "Beam model", kind: "Teoría", format: "numeric", source: "Nueva",
    prompt: "Componente de obstáculos inesperados del beam model con η = 1 y λ = 0,5 m⁻¹. Si z_exp = 5 m, ¿cuánto vale p_unexp para z = 2 m?",
    answer: 0.184, tol: 0.002, unit: "m⁻¹",
    explanation: "Como 0 ≤ z < z_exp: p_unexp = η·λ·e^(−λz) = 1 · 0,5 · e^(−1) = 0,5 · 0,3679 = 0,184. Para z ≥ z_exp valdría 0." },
  { id: "L4-n14", lesson: "L4", topic: "Scan completo", kind: "Teoría", format: "numeric", source: "Nueva",
    prompt: "Un scan tiene 3 haces con verosimilitudes p(d₁|x,m) = 0,5, p(d₂|x,m) = 0,8 y p(d₃|x,m) = 0,2. Suponiendo independencia condicional, ¿cuánto vale p(d₁, d₂, d₃ | x, m)?",
    answer: 0.08, tol: 0.001,
    explanation: "p(z|x,m) = ∏ p(d_k|x,m) = 0,5 · 0,8 · 0,2 = 0,08. En la práctica se suman logaritmos para evitar underflow con cientos de haces." },
  { id: "L4-n15", lesson: "L4", topic: "Likelihood field", kind: "Teoría", format: "numeric", source: "Nueva",
    prompt: "Likelihood field: un robot en x = [2 m, 1 m, 90°]ᵀ mide un haz con r = 3 m y α = −90°. ¿Cuál es la coordenada x del punto final q_k?",
    answer: 5, tol: 0.01, unit: "m",
    explanation: "q_k = [x + r·cos(θ+α), y + r·sin(θ+α)] = [2 + 3·cos 0°, 1 + 3·sin 0°] = (5, 1). Se evalúa L(q_k) en esa celda del campo precalculado." },
  { id: "L4-n16", lesson: "L4", topic: "Likelihood field", kind: "Teoría", format: "numeric", source: "Nueva",
    prompt: "Likelihood field con α_hit = 0,9, α_rand = 0,1, σ = 0,2 m y z_max = 5 m. El punto final de un haz está a d(q) = 0,2 m del obstáculo más cercano. ¿Cuánto vale L(q)?",
    answer: 1.109, tol: 0.005,
    explanation: "L(q) = α_hit · 1/(σ√(2π)) · exp(−d²/(2σ²)) + α_rand/z_max = 0,9 · 1,9947 · e^(−0,5) + 0,1/5 = 0,9 · 1,9947 · 0,6065 + 0,02 = 1,089 + 0,02 ≈ 1,109." },
  { id: "L4-n17", lesson: "L4", topic: "Covarianza de un landmark", kind: "Teoría", format: "numeric", source: "Diapositiva 41",
    prompt: "Un robot ve un landmark con r = 3 m y θ + α = 90°. Σ_x = diag(0,01, 0,01, (5°)²) y Σ_z = diag(0,2², (3°)²), con los ángulos en rad. Usando Σ_m = J_x Σ_x J_xᵀ + J_z Σ_z J_zᵀ, ¿cuánto vale el elemento Σ_m[0,0] (varianza en x)?",
    answer: 0.1032, tol: 0.002, unit: "m²",
    explanation: "Con φ = 90°: J_x = [[1, 0, −r·sin φ], [0, 1, r·cos φ]] = [[1, 0, −3], [0, 1, 0]] y J_z = [[cos φ, −r·sin φ], [sin φ, r·cos φ]] = [[0, −3], [1, 0]]. Σ_m[0,0] = σ_x² + 9·σ_θ² + 9·σ_α² = 0,01 + 9·0,007615 + 9·0,002742 = 0,01 + 0,0685 + 0,0247 ≈ 0,1032 m². El error angular, multiplicado por r², domina la componente x." },
  { id: "L4-n18", lesson: "L4", topic: "Covarianza de un landmark", kind: "Teoría", format: "numeric", source: "Diapositiva 41",
    prompt: "Mismo caso (r = 3 m, θ + α = 90°, σ_y² = 0,01, σ_r = 0,2 m). ¿Cuánto vale Σ_m[1,1] (varianza en y)?",
    answer: 0.05, tol: 0.001, unit: "m²",
    explanation: "Fila 2 de J_x = [0, 1, 0] → aporta σ_y² = 0,01. Fila 2 de J_z = [1, 0] → aporta σ_r² = 0,04. Σ_m[1,1] = 0,01 + 0,04 = 0,05 m². En la dirección del haz (y) solo influyen el error en y y el error de rango." },
  { id: "L4-n19", lesson: "L4", topic: "Polar → cartesiano", kind: "Teoría", format: "numeric", source: "Nueva",
    prompt: "Una observación polar z_p = [r, α] = [2 m, 0 rad] tiene Σ_zp = diag(0,04, 0,01). Con J = ∂z_c/∂z_p = [[cos α, −r·sin α], [sin α, r·cos α]], ¿cuánto vale la varianza en y de Σ_zc = J Σ_zp Jᵀ?",
    answer: 0.04, tol: 0.001, unit: "m²",
    explanation: "Con α = 0: J = [[1, 0], [0, 2]]. Σ_zc = diag(0,04, 2²·0,01) = diag(0,04, 0,04). La varianza lateral crece con r²·σ_α²." },
  { id: "L4-n20", lesson: "L4", topic: "LiDAR", kind: "Teoría", format: "numeric", source: "Nueva",
    prompt: "Un LiDAR 2D (tipo Hokuyo UTM-30LX) tiene FOV = 270° y resolución angular 0,25°. ¿Cuántos haces (medidas) da cada scan?",
    answer: 1081, tol: 1,
    explanation: "Número de haces = FOV/resolución + 1 = 270/0,25 + 1 = 1080 + 1 = 1081, porque se mide en los dos extremos del intervalo. (Se acepta 1080 ± 1.)" },
  { id: "L4-n21", lesson: "L4", topic: "GPS", kind: "Teoría", format: "numeric", source: "Nueva",
    prompt: "¿Cuántos satélites como mínimo necesita un receptor GPS para estimar su posición 3D y el desfase de su reloj?",
    answer: 4, tol: 0,
    explanation: "Hay 4 incógnitas (x, y, z y el desfase del reloj del receptor), así que hacen falta al menos 4 pseudorangos. Con 3 satélites solo se tendría el punto del caso ideal, con el reloj perfecto." },

  // ───────────── L5 · Localización ─────────────
  {"id": "L5-c01", "lesson": "L5", "topic": "Problemas de localización", "kind": "Teoría", "format": "single", "source": "Diapositivas L5 (v3)", "prompt": "Alguien coge un robot en marcha y lo deja en otra habitación. El robot sigue convencido de estar donde estaba. ¿Qué problema de localización es?", "options": ["Robot secuestrado (kidnapped robot)", "Localización global", "Odometría visual", "Seguimiento de posición"], "answer": 0, "explanation": "En el robot secuestrado, el robot está seguro de su pose pero se equivoca, porque lo han movido sin que el estimador lo sepa. Tiene que detectar el fallo y volver a localizarse. En la localización global, en cambio, el robot sabe que no sabe dónde está."},
  {"id": "L5-c02", "lesson": "L5", "topic": "Problemas de localización", "kind": "Teoría", "format": "single", "source": "Diapositivas L5 (v3)", "prompt": "Un robot se enciende en un punto desconocido de un mapa conocido. ¿Cuál es su reto principal?", "options": ["Corregir una deriva pequeña desde una pose conocida", "Resolver varias ubicaciones plausibles", "Calibrar los encoders", "Construir el mapa desde cero"], "answer": 1, "explanation": "Es localización global: la pose inicial es desconocida y puede haber varias ubicaciones compatibles con lo que ve. Corregir la deriva es propio del seguimiento de posición."},
  {"id": "L5-c03", "lesson": "L5", "topic": "Estimación puntual", "kind": "Teoría", "format": "single", "source": "Diapositivas L5 (v3)", "prompt": "Tienes una creencia gaussiana sobre la pose. ¿Qué relación hay entre MAP y media?", "options": ["MAP no existe en una gaussiana", "Coinciden, porque en una gaussiana media, moda y mediana son iguales", "La media siempre es mayor que MAP", "Solo coinciden si la varianza es 1"], "answer": 1, "explanation": "En una gaussiana, media = moda = mediana, así que x̂_MAP = x̂_media. En distribuciones con varios picos o asimétricas pueden ser muy distintas."},
  {"id": "L5-c04", "lesson": "L5", "topic": "Estimación puntual", "kind": "Teoría", "format": "single", "source": "Diapositivas L5 (v3)", "prompt": "Una creencia tiene dos picos separados, de altura parecida. ¿Qué problema tiene usar su media como pose?", "options": ["Ninguno: la media siempre es la mejor estimación", "Coincide siempre con el pico más bajo", "Puede caer entre los picos, en una zona donde casi seguro no está el robot", "No se puede calcular si hay dos picos"], "answer": 2, "explanation": "La media promedia las dos hipótesis y puede quedar en medio, donde la probabilidad es casi nula. Por eso una creencia multimodal no se resume bien con la media."},
  {"id": "L5-c05", "lesson": "L5", "topic": "Observabilidad", "kind": "Teoría", "format": "single", "source": "Diapositivas L5 (v3)", "prompt": "Estado de dimensión n = 3 y solo m = 2 ecuaciones. ¿Qué ocurre en z = Hx + e?", "options": ["Se resuelve con ponderación", "HᵀH no es invertible: la pose es no observable y hay infinitas soluciones", "Hay solución directa con H⁻¹", "Hay exactamente dos soluciones"], "answer": 1, "explanation": "Si m < n, rango(H) < n, así que HᵀH (3×3) no se puede invertir. La pose no queda determinada de forma única: es no observable."},
  {"id": "L5-c06", "lesson": "L5", "topic": "Observabilidad", "kind": "Teoría", "format": "single", "source": "Diapositivas L5 (v3)", "prompt": "H tiene 10 filas y 3 columnas, pero solo 2 filas son independientes. ¿Se puede estimar la pose con (HᵀH)⁻¹Hᵀz?", "options": ["Sí, porque hay más ecuaciones que incógnitas", "No, porque el rango es 2 < 3 y HᵀH no es invertible", "Sí, pero hay que ponderar", "Solo si las medidas no tienen ruido"], "answer": 1, "explanation": "Lo que cuenta no es el número de filas, sino el rango. Con rango 2 y estado de dimensión 3, HᵀH es singular y la pose no es observable."},
  {"id": "L5-c07", "lesson": "L5", "topic": "Mínimos cuadrados ponderados", "kind": "Teoría", "format": "single", "source": "Diapositivas L5 (v3)", "prompt": "En LS ponderado con errores independientes, ¿con qué se pesa cada error al cuadrado e_i²?", "options": ["Con σ_i", "Con σ_i²", "Con 1/σ_i²", "Con 1/m"], "answer": 2, "explanation": "El coste es Σ e_i²/σ_i². Cuanto mayor es la varianza de una medida, menos cuenta su error. Por eso aparece Q⁻¹, no Q."},
  {"id": "L5-c08", "lesson": "L5", "topic": "Máxima verosimilitud", "kind": "Teoría", "format": "single", "source": "Diapositivas L5 (v3)", "prompt": "¿Cuándo coincide la solución de LS ponderado con la de máxima verosimilitud?", "options": ["Siempre, sea cual sea el ruido", "Solo si el prior es gaussiano", "Cuando el error de medida es gaussiano de media cero", "Solo cuando H es cuadrada"], "answer": 2, "explanation": "Con e ~ N(0, Q), maximizar p(z|x) equivale a minimizar eᵀQ⁻¹e, que es el coste de LS ponderado. Así, x̂_ML = x̂_LS."},
  {"id": "L5-c09", "lesson": "L5", "topic": "Características de LS", "kind": "Teoría", "format": "multi", "source": "Diapositivas L5 (v3)", "prompt": "¿Qué afirmaciones son correctas? (Marca todas las correctas)", "options": ["LS lineal tiene solución directa y mínimo global", "LS no lineal se resuelve iterativamente", "LS no lineal siempre alcanza el mínimo global", "Un prior también puede restringir la estimación", "LS ordinario supone varianzas iguales e independientes"], "answer": [0, 1, 3, 4], "explanation": "El LS no lineal parte de una estimación inicial y puede quedarse en un mínimo local. El resto aparece en la diapositiva de características."},
  {"id": "L5-c10", "lesson": "L5", "topic": "Gauss-Newton", "kind": "Teoría", "format": "single", "source": "Diapositivas L5 (v3)", "prompt": "En Gauss-Newton, ¿qué hay que recalcular en cada iteración?", "options": ["h(x̂) y el jacobiano, evaluados en la x̂ actual", "Solo el jacobiano, porque h no cambia", "Solo x̂", "Nada: el jacobiano se calcula una vez"], "answer": 0, "explanation": "La linealización es local: al mover x̂, hay que volver a evaluar tanto las medidas predichas como el jacobiano."},
  {"id": "L5-c11", "lesson": "L5", "topic": "Multilateración", "kind": "Teoría", "format": "single", "source": "Diapositivas L5 (v3)", "prompt": "¿Por qué no se puede estimar la orientación θ con medidas solo de distancia?", "options": ["Porque las distancias no dependen de θ: ∂h_i/∂θ = 0", "Porque θ es siempre cero", "Porque atan2 no está definida", "Porque haría falta un cuarto satélite"], "answer": 0, "explanation": "La distancia entre el robot y una baliza es la misma mire hacia donde mire. La columna de θ del jacobiano vale cero, así que θ es no observable."},
  {"id": "L5-c12", "lesson": "L5", "topic": "Multilateración", "kind": "Teoría", "format": "single", "source": "Diapositivas L5 (v3)", "prompt": "En 2D y solo con distancias, ¿cuántas soluciones da en general medir 2 balizas?", "options": ["1", "2", "Infinitas", "Ninguna"], "answer": 1, "explanation": "Una baliza da una circunferencia. Dos circunferencias se cortan en general en 2 puntos. Con una tercera baliza no alineada queda una solución."},
  {"id": "L5-c13", "lesson": "L5", "topic": "Verosimilitud", "kind": "Teoría", "format": "single", "source": "Diapositivas L5 (v3)", "prompt": "Con una baliza y ruido gaussiano en la distancia, ¿qué forma tiene L(x) = p(z₁|x, m₁) como función de la posición?", "options": ["Una recta", "Una rosquilla alrededor de la baliza, que no es gaussiana", "Una distribución uniforme", "Una gaussiana centrada en la baliza"], "answer": 1, "explanation": "p(z₁|x) es gaussiana en z₁, pero, con z₁ fijo y variando x, la probabilidad se reparte a lo largo de una circunferencia: una «rosquilla». Un EKF no puede representar esa forma."},
  {"id": "L5-c14", "lesson": "L5", "topic": "Registro", "kind": "Teoría", "format": "single", "source": "Diapositivas L5 (v3)", "prompt": "Registras los puntos que observa el robot contra un scan que él mismo tomó antes. ¿Qué obtienes?", "options": ["La covarianza del sensor", "Su pose relativa entre ambos instantes: odometría", "Un mapa global de landmarks", "Su pose global en el mapa"], "answer": 1, "explanation": "Contra un mapa global, se obtiene localización. Contra un conjunto de puntos anterior, la pose relativa: odometría (visual, si los puntos vienen de cámara)."},
  {"id": "L5-c15", "lesson": "L5", "topic": "Registro", "kind": "Teoría", "format": "single", "source": "Diapositivas L5 (v3)", "prompt": "¿Qué diferencia a los puntos landmark de los puntos de scan?", "options": ["Los landmark no tienen posición", "No hay diferencia", "Los de scan solo existen en 3D", "En los landmark las correspondencias suelen conocerse por sus descriptores; en los de scan son desconocidas"], "answer": 3, "explanation": "Un landmark se reconoce por su descriptor, de modo que se sabe con qué punto del mapa emparejarlo. Un punto de láser no lleva descriptor: por eso hace falta ICP."},
  {"id": "L5-c16", "lesson": "L5", "topic": "ICP", "kind": "Teoría", "format": "multi", "source": "Diapositivas L5 (v3)", "prompt": "¿Qué afirmaciones sobre ICP son correctas? (Marca todas las correctas)", "options": ["Empareja cada punto con el más cercano del otro conjunto", "Está garantizado que alcanza el mínimo global", "Alterna emparejar y estimar R, t", "Es lento, y se acelera con un KD-tree", "Necesita descriptores en cada punto"], "answer": [0, 2, 3], "explanation": "ICP solo garantiza converger a un mínimo local. No necesita descriptores: su razón de ser es trabajar sin correspondencias conocidas."},
  {"id": "L5-c17", "lesson": "L5", "topic": "ICP", "kind": "Teoría", "format": "single", "source": "Diapositivas L5 (v3)", "prompt": "¿Cuál es un criterio de convergencia de ICP?", "options": ["Que el error sea exactamente cero", "Que el número de puntos se reduzca a la mitad", "Que todas las parejas sean distintas", "Que R y t calculados sean despreciables o que las parejas dejen de cambiar"], "answer": 3, "explanation": "Las diapositivas dan dos condiciones: R y t del paso 2 despreciables, o parejas del paso 1 sin cambios. El error no suele llegar a cero, porque los conjuntos no coinciden exactamente."},
  {"id": "L5-c18", "lesson": "L5", "topic": "Filtro de Bayes", "kind": "Teoría", "format": "single", "source": "Diapositivas L5 (v3)", "prompt": "¿Qué regla se aplica en cada paso del filtro de Bayes?", "options": ["Predicción: Bayes. Corrección: probabilidad total", "Predicción: probabilidad total. Corrección: Bayes", "Las dos: probabilidad total", "Las dos: Bayes"], "answer": 1, "explanation": "La predicción suma sobre todas las poses anteriores (probabilidad total). La corrección multiplica por la verosimilitud y normaliza (Bayes)."},
  {"id": "L5-c19", "lesson": "L5", "topic": "Filtro de Bayes", "kind": "Teoría", "format": "single", "source": "Diapositivas L5 (v3)", "prompt": "¿Qué suele pasar con la incertidumbre en cada paso del filtro?", "options": ["El movimiento la reduce y la observación la aumenta", "El movimiento la extiende y la observación la reduce", "Las dos la reducen", "Ninguna la cambia"], "answer": 1, "explanation": "Moverse añade error, así que extiende la creencia. Medir aporta información, así que la concentra."},
  {"id": "L5-c20", "lesson": "L5", "topic": "Filtro de rejilla", "kind": "Teoría", "format": "single", "source": "Diapositivas L5 (v3)", "prompt": "¿Cómo representa la creencia un filtro de rejilla?", "options": ["Con una media y una covarianza", "Con muestras con peso", "Con una probabilidad por celda, que suman 1", "Con una sola pose"], "answer": 2, "explanation": "p_i = P(X = celda_i), con Σp_i = 1. Es un histograma: admite cualquier forma de distribución, pero crece rápido con la resolución."},
  {"id": "L5-c21", "lesson": "L5", "topic": "Filtro de Kalman", "kind": "Teoría", "format": "multi", "source": "Diapositivas L5 (v3)", "prompt": "¿Qué supuestos necesita el filtro de Kalman para ser exacto? (Marca todos los correctos)", "options": ["Modelo de movimiento lineal", "Modelo de medida lineal", "Creencia inicial gaussiana", "Ruidos gaussianos de media cero", "Conocer las correspondencias con ICP"], "answer": [0, 1, 2, 3], "explanation": "Modelos lineales y PDF gaussianas (movimiento, medida y bel(x₀)). ICP no tiene nada que ver con el filtro."},
  {"id": "L5-c22", "lesson": "L5", "topic": "Filtro de Kalman", "kind": "Teoría", "format": "single", "source": "Diapositivas L5 (v3)", "prompt": "En un filtro de Kalman, si el sensor empeora mucho (Q crece), ¿qué ocurre?", "options": ["K no cambia", "K baja y el filtro se queda más con la predicción", "La predicción deja de usarse", "K crece y el filtro se fía más de la medida"], "answer": 1, "explanation": "K = Σ̄Cᵀ(CΣ̄Cᵀ + Q)⁻¹. Si Q → ∞, K → 0: la medida se ignora. Si Q → 0, en 1D con C = 1, K → 1."},
  {"id": "L5-c23", "lesson": "L5", "topic": "Filtro de Kalman", "kind": "Teoría", "format": "single", "source": "Diapositivas L5 (v3)", "prompt": "¿Qué es la innovación?", "options": ["La ganancia de Kalman", "La diferencia entre lo observado y lo predicho: z − Cμ̄", "La covarianza de la medida", "La nueva media"], "answer": 1, "explanation": "Es la discrepancia entre la observación y la medida predicha. Su covarianza es CΣ̄Cᵀ + Q."},
  {"id": "L5-c24", "lesson": "L5", "topic": "Filtro de Kalman", "kind": "Teoría", "format": "single", "source": "Diapositivas L5 (v3)", "prompt": "¿Qué garantiza la corrección sobre la covarianza?", "options": ["det(Σ) ≤ det(Σ̄)", "Σ siempre es diagonal", "det(Σ) ≥ det(Σ̄)", "Σ = Σ̄"], "answer": 0, "explanation": "La corrección no aumenta la covarianza predicha. Medir nunca hace que se sepa menos."},
  {"id": "L5-c25", "lesson": "L5", "topic": "Kalman y MAP", "kind": "Teoría", "format": "single", "source": "Diapositivas L5 (v3)", "prompt": "Según la diapositiva «Kalman correction = MAP estimation», ¿qué es la corrección de Kalman vista como optimización?", "options": ["Un remuestreo de partículas", "Un ICP con un solo punto", "Una búsqueda en rejilla", "Un LS ponderado con un prior: ajustarse a la medida y fiarse de la predicción"], "answer": 3, "explanation": "J(x) = ½(x − μ̄)ᵀΣ̄⁻¹(x − μ̄) + ½(z − Cx)ᵀQ⁻¹(z − Cx). El mínimo es la media corregida μ_t, y la covarianza es Σ_t = [Σ̄⁻¹ + CᵀQ⁻¹C]⁻¹."},
  {"id": "L5-c26", "lesson": "L5", "topic": "EKF", "kind": "Teoría", "format": "single", "source": "Diapositivas L5 (v3)", "prompt": "¿Cuándo funciona bien el EKF?", "options": ["Cuando la incertidumbre es muy grande", "Cuando la creencia tiene varios picos", "Cuando la incertidumbre es tan pequeña que la función es casi lineal en la zona con probabilidad", "Solo si los modelos ya son lineales"], "answer": 2, "explanation": "El EKF sustituye la función por su tangente en la media. Si la gaussiana es estrecha, la tangente aproxima bien la función en toda la zona relevante."},
  {"id": "L5-c27", "lesson": "L5", "topic": "EKF", "kind": "Teoría", "format": "single", "source": "Diapositivas L5 (v3)", "prompt": "¿Dónde se evalúa cada jacobiano del EKF?", "options": ["G y H en μ_{t−1}", "G y H en la pose real x_t", "G en μ_{t−1} y H en μ̄_t", "G en μ̄_t y H en μ_{t−1}"], "answer": 2, "explanation": "G linealiza el movimiento desde la pose de partida, μ_{t−1}. H linealiza la medida en la pose predicha, μ̄_t. La pose real no se conoce."},
  {"id": "L5-c28", "lesson": "L5", "topic": "EKF", "kind": "Teoría", "format": "single", "source": "Diapositivas L5 (v3)", "prompt": "En el EKF, ¿qué medida esperada se usa en la innovación?", "options": ["h(μ_{t−1})", "h(μ̄_t), con el modelo no lineal", "H·μ̄_t, con el jacobiano", "z_t"], "answer": 1, "explanation": "La media se calcula con los modelos no lineales: g para predecir y h para la medida esperada. Los jacobianos solo se usan para las covarianzas y la ganancia."},
  {"id": "L5-c29", "lesson": "L5", "topic": "EKF", "kind": "Teoría", "format": "single", "source": "Diapositivas L5 (v3)", "prompt": "¿Por qué una transformación no lineal es un problema para el filtro de Kalman básico?", "options": ["Porque una gaussiana transformada en general deja de ser gaussiana, y media y covarianza no bastan", "Porque la media deja de existir", "Porque Q deja de ser invertible", "Porque no se puede usar atan2"], "answer": 0, "explanation": "Una transformación lineal conserva la gaussiana de forma exacta; una no lineal, en general, no. El EKF aproxima el resultado con una gaussiana linealizando en la media."},
  {"id": "L5-c30", "lesson": "L5", "topic": "Filtro de partículas", "kind": "Teoría", "format": "multi", "source": "Diapositivas L5 (v3)", "prompt": "¿Cuáles son ventajas del filtro de partículas? (Marca todas las correctas)", "options": ["Representa creencias no gaussianas y multimodales", "Admite modelos de movimiento y de sensor flexibles", "Su algoritmo básico es sencillo", "Siempre necesita pocas partículas", "El remuestreo nunca pierde hipótesis"], "answer": [0, 1, 2], "explanation": "Necesita suficientes partículas, sobre todo en estados de más dimensión, y el remuestreo puede reducir la diversidad y descartar hipótesis plausibles."},
  {"id": "L5-c31", "lesson": "L5", "topic": "Filtro de partículas", "kind": "Teoría", "format": "single", "source": "Diapositivas L5 (v3)", "prompt": "¿En qué orden se aplican los pasos de SIR?", "options": ["Remuestreo → pesos → movimiento", "Pesos → movimiento → remuestreo", "Solo pesos y movimiento", "Movimiento (muestrear) → pesos (corrección) → remuestreo"], "answer": 3, "explanation": "Se mueve cada partícula muestreando el modelo de movimiento, se pesa con la verosimilitud y se remuestrea con esos pesos. Son los «2 + 1» pasos."},
  {"id": "L5-c32", "lesson": "L5", "topic": "Remuestreo", "kind": "Teoría", "format": "single", "source": "Diapositivas L5 (v3)", "prompt": "¿Cuánto pesa cada partícula justo después de remuestrear?", "options": ["Lo mismo que antes", "El doble que antes", "1/M", "1"], "answer": 2, "explanation": "Tras remuestrear, la información de los pesos ha pasado a la densidad de partículas, así que todas valen 1/M."},
  {"id": "L5-c33", "lesson": "L5", "topic": "Remuestreo", "kind": "Teoría", "format": "single", "source": "Diapositivas L5 (v3)", "prompt": "¿Por qué el remuestreo se hace con reemplazo?", "options": ["Para que una partícula de mucho peso pueda salir varias veces", "Para que ninguna partícula se repita", "Para que aumente el número de partículas", "Para reducir el ruido del sensor"], "answer": 0, "explanation": "Con reemplazo, las partículas de mucho peso se replican y las de poco peso pueden desaparecer. Es la «supervivencia del más apto»."},
  {"id": "L5-c34", "lesson": "L5", "topic": "Comparación", "kind": "Teoría", "format": "single", "source": "Diapositivas L5 (v3)", "prompt": "Un robot duda entre dos pasillos idénticos. ¿Qué filtro no puede representar esa creencia?", "options": ["Filtro de partículas", "Filtro de rejilla", "EKF", "Todos pueden"], "answer": 2, "explanation": "El EKF usa una sola gaussiana, con un único pico. El filtro de rejilla y el de partículas admiten varias hipótesis a la vez."},
  {"id": "L5-c35", "lesson": "L5", "topic": "Filtro de partículas", "kind": "Teoría", "format": "single", "source": "Diapositivas L5 (v3)", "prompt": "¿Qué pasaría si se moviesen las partículas sin añadirles ruido?", "options": ["Aumentarían los pesos", "Las copias creadas al remuestrear seguirían juntas, y el conjunto colapsaría en pocas poses", "Nada: el ruido no se usa", "El filtro se convertiría en un EKF"], "answer": 1, "explanation": "El ruido del movimiento separa las copias de una misma partícula y mantiene la diversidad. Cada partícula debe llevar su propia muestra de ruido."},
  {"id": "L5-n01", "lesson": "L5", "topic": "LS lineal", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Un sensor mide x (z₁ = 1,0), otro mide y (z₂ = 2,0) y otro x + y (z₃ = 3,6). Con H = [[1,0],[0,1],[1,1]], ¿cuánto vale x̂ en mínimos cuadrados?", "answer": 1.2, "tol": 0.006, "unit": "", "explanation": "HᵀH = [[2,1],[1,2]], su inversa es (1/3)·[[2,−1],[−1,2]] y Hᵀz = [4,6; 5,6]. x̂ = (1/3)·[2·4,6 − 5,6; −4,6 + 2·5,6] = [1,2; 2,2]."},
  {"id": "L5-n02", "lesson": "L5", "topic": "LS lineal", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Un sensor mide x (z₁ = 1,0), otro mide y (z₂ = 2,0) y otro x + y (z₃ = 3,6). Con H = [[1,0],[0,1],[1,1]], ¿cuánto vale ŷ en mínimos cuadrados?", "answer": 2.2, "tol": 0.006, "unit": "", "explanation": "HᵀH = [[2,1],[1,2]], su inversa es (1/3)·[[2,−1],[−1,2]] y Hᵀz = [4,6; 5,6]. x̂ = (1/3)·[2·4,6 − 5,6; −4,6 + 2·5,6] = [1,2; 2,2]."},
  {"id": "L5-n03", "lesson": "L5", "topic": "LS lineal", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Un sensor mide x (z₁ = 1,0), otro mide y (z₂ = 2,0) y otro x + y (z₃ = 3,6). Con H = [[1,0],[0,1],[1,1]], ¿cuánto vale el coste eᵀe en la solución de mínimos cuadrados?", "answer": 0.12, "tol": 0.0031, "unit": "", "explanation": "La solución es [1,2; 2,2]. Los residuos son z − Hx̂ = [−0,2; −0,2; 0,2]. Coste: 0,04 + 0,04 + 0,04 = 0,12."},
  {"id": "L5-n04", "lesson": "L5", "topic": "LS lineal", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Un robot mide cuatro veces su distancia a una puerta: 4,2; 3,8; 4,3 y 4,1 m. ¿Cuál es la estimación de mínimos cuadrados?", "answer": 4.1, "tol": 0.006, "unit": "m", "explanation": "H = [1,1,1,1]ᵀ, así que HᵀH = 4 y Hᵀz = 16,4. x̂ = 16,4/4 = 4,1: la media aritmética."},
  {"id": "L5-n05", "lesson": "L5", "topic": "Observabilidad", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Con H = [[1,2],[2,4]], ¿cuánto vale det(HᵀH)?", "answer": 0.0, "tol": 0.001, "unit": "", "explanation": "HᵀH = [[5,10],[10,20]]. det = 5·20 − 10·10 = 0: no es invertible, porque la segunda fila es el doble de la primera. Rango 1."},
  {"id": "L5-n06", "lesson": "L5", "topic": "LS ponderado", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Dos sensores miden lo mismo: z₁ = 20 con σ₁² = 1 y z₂ = 23 con σ₂² = 2. ¿Cuál es la estimación ponderada?", "answer": 21.0, "tol": 0.011, "unit": "", "explanation": "x̂ = (20/1 + 23/2)/(1/1 + 1/2) = 31,5/1,5 = 21. Queda más cerca del sensor más preciso que el 21,5 del promedio simple."},
  {"id": "L5-n07", "lesson": "L5", "topic": "LS ponderado", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Dos sensores miden lo mismo con σ₁² = 1 y σ₂² = 2. ¿Cuánto vale la varianza de la estimación ponderada?", "answer": 0.66667, "tol": 0.0031, "unit": "", "explanation": "σ² = 1/(1/1 + 1/2) = 1/1,5 = 0,667. Es menor que la de cualquiera de los dos sensores."},
  {"id": "L5-n08", "lesson": "L5", "topic": "LS ponderado", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Una medida tiene una desviación típica σ = 0,5 m. ¿Con qué peso entra su error al cuadrado en el coste de LS ponderado?", "answer": 4.0, "tol": 0.006, "unit": "", "explanation": "El peso es 1/σ² = 1/0,5² = 1/0,25 = 4. Ojo: se usa la varianza, no la desviación típica."},
  {"id": "L5-n09", "lesson": "L5", "topic": "LS ponderado", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Sensores: x (z₁ = 1,0), y (z₂ = 2,0) y x + y (z₃ = 3,6), con H = [[1,0],[0,1],[1,1]] y Q = diag(1, 1, 2). ¿Cuánto vale x̂?", "answer": 1.15, "tol": 0.006, "unit": "", "explanation": "HᵀQ⁻¹H = [[1,5; 0,5],[0,5; 1,5]], con determinante 2. HᵀQ⁻¹z = [2,8; 3,8]. x̂ = (1/2)·[1,5·2,8 − 0,5·3,8; −0,5·2,8 + 1,5·3,8] = [1,15; 2,15]."},
  {"id": "L5-n10", "lesson": "L5", "topic": "LS ponderado", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Sensores: x (z₁ = 1,0), y (z₂ = 2,0) y x + y (z₃ = 3,6), con H = [[1,0],[0,1],[1,1]] y Q = diag(1, 1, 2). ¿Cuánto vale el elemento (1,1) de la covarianza de la estimación?", "answer": 0.75, "tol": 0.0031, "unit": "", "explanation": "Σ = (HᵀQ⁻¹H)⁻¹ = (1/2)·[[1,5; −0,5],[−0,5; 1,5]]. El elemento (1,1) vale 0,75."},
  {"id": "L5-n11", "lesson": "L5", "topic": "Modelo de observación", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Robot en (2, 1) y landmark en (8, 9). ¿Qué distancia predice el modelo?", "answer": 10.0, "tol": 0.011, "unit": "m", "explanation": "Δx = 6 y Δy = 8. d = √(36 + 64) = 10 m."},
  {"id": "L5-n12", "lesson": "L5", "topic": "Modelo de observación", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Robot en (2, 1, θ = 0,3 rad) y landmark en (8, 9). ¿Qué marcación predice el modelo?", "answer": 0.6273, "tol": 0.0031, "unit": "rad", "explanation": "α = atan2(8, 6) − 0,3 = 0,9273 − 0,3 = 0,6273 rad."},
  {"id": "L5-n13", "lesson": "L5", "topic": "Jacobiano", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Robot en (2, 1, θ) y landmark en (8, 9). ¿Cuánto vale ∂d/∂x, el elemento (1,1) del jacobiano?", "answer": -0.6, "tol": 0.0031, "unit": "", "explanation": "∂d/∂x = −Δx/d = −6/10 = −0,6. Negativo: si el robot aumenta x, se acerca al landmark."},
  {"id": "L5-n14", "lesson": "L5", "topic": "Jacobiano", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Robot en (2, 1, θ) y landmark en (8, 9). ¿Cuánto vale ∂α/∂x, el elemento (2,1) del jacobiano?", "answer": 0.08, "tol": 0.0031, "unit": "", "explanation": "∂α/∂x = Δy/d² = 8/100 = 0,08."},
  {"id": "L5-n15", "lesson": "L5", "topic": "Jacobiano", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Robot en (2, 1, θ) y landmark en (8, 9). ¿Cuánto vale ∂α/∂y, el elemento (2,2) del jacobiano?", "answer": -0.06, "tol": 0.0031, "unit": "", "explanation": "∂α/∂y = −Δx/d² = −6/100 = −0,06."},
  {"id": "L5-n16", "lesson": "L5", "topic": "Gauss-Newton", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Una sola medida no lineal, con h(x) = √(x² + 9). Partes de x̂ = 4 y mides z = 5,5. ¿Cuánto vale x̂ tras un paso de Gauss-Newton?", "answer": 4.625, "tol": 0.006, "unit": "", "explanation": "h(4) = 5, e = 0,5 y J = x/√(x² + 9) = 4/5 = 0,8. δ = (J²)⁻¹Je = e/J = 0,5/0,8 = 0,625. x̂ = 4,625."},
  {"id": "L5-n17", "lesson": "L5", "topic": "Gauss-Newton", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Balizas en (10, 0) y (0, 10). Estimación x̂ = (0, 0). Se miden distancias z = [9, 11]. ¿Cuánto vale la componente x de δ en un paso de Gauss-Newton?", "answer": 1.0, "tol": 0.006, "unit": "", "explanation": "h = [10, 10], e = [−1, 1]. J = [[−1, 0],[0, −1]], así que JᵀJ = I y δ = Jᵀe = [1, −1]. Tiene sentido: la primera baliza se ve más cerca, y hay que acercarse a ella."},
  {"id": "L5-n18", "lesson": "L5", "topic": "Gauss-Newton", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Balizas en (10, 0) y (0, 10). Estimación x̂ = (0, 0). Se miden distancias z = [9, 11]. ¿Cuánto vale la componente y de x̂ tras un paso de Gauss-Newton?", "answer": -1.0, "tol": 0.006, "unit": "", "explanation": "δ = Jᵀe = [1, −1], así que x̂ = (1, −1). Comprobación: desde (1, −1), las distancias son √(81 + 1) = 9,06 y √(1 + 121) = 11,05, muy cerca de lo medido."},
  {"id": "L5-n19", "lesson": "L5", "topic": "Verosimilitud", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Baliza en (0, 0), medida z = 5 m y σ = 1 m. Sin normalizar, L = exp(−e²/(2σ²)). ¿Cuánto vale L en el punto (6, 8)?", "answer": 0.0, "tol": 0.001, "unit": "", "explanation": "d = 10 y e = 5 − 10 = −5. L = exp(−25/2) ≈ 3,7·10⁻⁶, prácticamente cero: el punto queda lejos de la rosquilla."},
  {"id": "L5-n20", "lesson": "L5", "topic": "Verosimilitud", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Baliza en (0, 0), medida z = 5 m y σ = 1 m. Sin normalizar, L = exp(−e²/(2σ²)). ¿Cuánto vale L en el punto (0, 4)?", "answer": 0.60653, "tol": 0.0031, "unit": "", "explanation": "d = 4 y e = 5 − 4 = 1. L = exp(−1/2) = 0,607."},
  {"id": "L5-n21", "lesson": "L5", "topic": "Registro", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Pose x = (2, 0, 90°) y punto en el marco del robot q = (1, 1). ¿Cuánto vale la coordenada x de x ⊕ q?", "answer": 1.0, "tol": 0.006, "unit": "", "explanation": "x + q_x·cos θ − q_y·sin θ = 2 + 1·0 − 1·1 = 1."},
  {"id": "L5-n22", "lesson": "L5", "topic": "Registro", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Pose x = (2, 0, 90°), punto observado q = (1, 1) y su pareja en el mapa m = (3, 1). ¿Cuánto vale el error E_i = ‖m − (Rq + t)‖²?", "answer": 4.0, "tol": 0.006, "unit": "", "explanation": "Rq + t = (−1, 1) + (2, 0) = (1, 1). Diferencia con m: (2, 0). E_i = 4 + 0 = 4."},
  {"id": "L5-n23", "lesson": "L5", "topic": "ICP", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "ICP en 1D, solo con traslación. Puntos móviles {2, 5, 9} y fijos {1, 4, 7}. Con las parejas por punto más cercano, ¿cuánto vale t en la primera iteración?", "answer": -1.33333, "tol": 0.006, "unit": "", "explanation": "Parejas: 2→1, 5→4 y 9→7. t = media de m − q = (−1 − 1 − 2)/3 = −1,3333."},
  {"id": "L5-n24", "lesson": "L5", "topic": "ICP", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "ICP en 1D. Puntos móviles {2, 5, 9} y fijos {1, 4, 7}. ¿Cuánto vale el error E = Σ(m − q)² con las parejas por punto más cercano, antes de mover nada?", "answer": 6.0, "tol": 0.006, "unit": "", "explanation": "Parejas: 2→1, 5→4 y 9→7. Diferencias: −1, −1, −2. E = 1 + 1 + 4 = 6."},
  {"id": "L5-n25", "lesson": "L5", "topic": "Probabilidad", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "En una rejilla: P(fila 4) = 0,24, P(columna 6) = 0,27 y P(fila 4, columna 6) = 0,05. ¿Cuánto vale P(fila 4 o columna 6)?", "answer": 0.46, "tol": 0.0031, "unit": "", "explanation": "P(A ∪ B) = P(A) + P(B) − P(A ∩ B) = 0,24 + 0,27 − 0,05 = 0,46."},
  {"id": "L5-n26", "lesson": "L5", "topic": "Probabilidad", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "En una rejilla: P(fila 4) = 0,24 y P(fila 4, columna 6) = 0,05. ¿Cuánto vale P(columna 6 | fila 4)?", "answer": 0.20833, "tol": 0.0031, "unit": "", "explanation": "P(c | r) = P(r, c)/P(r) = 0,05/0,24 = 0,208."},
  {"id": "L5-n27", "lesson": "L5", "topic": "Estimación puntual", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Creencia sobre 4 celdas (x = 0, 1, 2, 3): p = [0,1; 0,5; 0,1; 0,3]. ¿Cuánto vale la media?", "answer": 1.6, "tol": 0.006, "unit": "", "explanation": "E[x] = 0·0,1 + 1·0,5 + 2·0,1 + 3·0,3 = 1,6. El MAP es x = 1: no coinciden."},
  {"id": "L5-n28", "lesson": "L5", "topic": "Filtro de rejilla", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "bel = [0,2; 0,5; 0,2; 0,1] en las celdas 0 a 3. Movimiento u = 1 con P(0 celdas) = 0,2, P(1) = 0,6 y P(2) = 0,2. ¿Cuánto vale la predicción en la celda 2?", "answer": 0.38, "tol": 0.0031, "unit": "", "explanation": "Se llega a la celda 2 desde la 2 sin moverse (0,2·0,2), desde la 1 avanzando una (0,6·0,5) o desde la 0 avanzando dos (0,2·0,2). Total: 0,04 + 0,30 + 0,04 = 0,38."},
  {"id": "L5-n29", "lesson": "L5", "topic": "Filtro de rejilla", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "bel = [0,1; 0,6; 0,3] en las celdas 0 a 2. El robot se queda quieto con probabilidad 0,25 y avanza una celda con probabilidad 0,75. ¿Cuánto vale la predicción en la celda 1?", "answer": 0.225, "tol": 0.0031, "unit": "", "explanation": "Se llega a la celda 1 desde la 1 sin moverse (0,25·0,6) o desde la 0 avanzando (0,75·0,1). Total: 0,15 + 0,075 = 0,225."},
  {"id": "L5-n30", "lesson": "L5", "topic": "Filtro de rejilla", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "bel = [0,1; 0,6; 0,3] en las celdas 0 a 2. El robot se queda quieto con probabilidad 0,25 y avanza una celda con probabilidad 0,75. ¿Cuánto vale la predicción en la celda 3?", "answer": 0.225, "tol": 0.0031, "unit": "", "explanation": "A la celda 3 solo se llega desde la 2 avanzando: 0,75·0,3 = 0,225. La suma de toda la predicción sigue siendo 1."},
  {"id": "L5-n31", "lesson": "L5", "topic": "Filtro de rejilla", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Predicción [0,2; 0,5; 0,3] y verosimilitud de la medida [0,1; 0,8; 0,1]. ¿Cuánto vale la constante de normalización η?", "answer": 2.22222, "tol": 0.006, "unit": "", "explanation": "Productos: 0,02; 0,40; 0,03. Suman 0,45. η = 1/0,45 = 2,222."},
  {"id": "L5-n32", "lesson": "L5", "topic": "Filtro de rejilla", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Predicción [0,2; 0,5; 0,3] y verosimilitud de la medida [0,1; 0,8; 0,1]. ¿Cuánto vale la posterior de la celda central?", "answer": 0.88889, "tol": 0.0031, "unit": "", "explanation": "Productos: 0,02; 0,40; 0,03, con suma 0,45. Posterior central: 0,40/0,45 = 0,889."},
  {"id": "L5-n33", "lesson": "L5", "topic": "Filtro de rejilla", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Predicción del pasillo: [0,04; 0,22; 0,38; 0,24; 0,10; 0,02], en las celdas 0 a 5. El sensor mide z = 1, con P(z | x = z) = 0,6 y P(z | x = z ± 1) = 0,2. ¿Cuánto vale la posterior de la celda 1?", "answer": 0.61111, "tol": 0.0031, "unit": "", "explanation": "Productos: celda 0: 0,2·0,04 = 0,008; celda 1: 0,6·0,22 = 0,132; celda 2: 0,2·0,38 = 0,076. Suma: 0,216. Posterior: 0,132/0,216 = 0,611."},
  {"id": "L5-n34", "lesson": "L5", "topic": "Filtro de rejilla", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Mapa de 10 × 10 m, celdas de 5 cm y orientación discretizada cada 10°. ¿Cuántas celdas tiene la rejilla?", "answer": 1440000.0, "tol": 0, "unit": "celdas", "explanation": "10/0,05 = 200 por eje, y 360/10 = 36 orientaciones. 200·200·36 = 1 440 000."},
  {"id": "L5-n35", "lesson": "L5", "topic": "Gaussianas", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "X ~ N(3; 1,5) e Y = −2X + 1. ¿Cuánto vale la varianza de Y?", "answer": 6.0, "tol": 0.006, "unit": "", "explanation": "Var(Y) = a²σ² = (−2)²·1,5 = 6. El signo y la constante no influyen."},
  {"id": "L5-n36", "lesson": "L5", "topic": "Gaussianas", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "X ~ N(3; 1,5) e Y = −2X + 1. ¿Cuánto vale la media de Y?", "answer": -5.0, "tol": 0.006, "unit": "", "explanation": "E[Y] = aμ + b = −2·3 + 1 = −5."},
  {"id": "L5-n37", "lesson": "L5", "topic": "Gaussianas", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "X con Σ = I (2×2) e Y = AX, con A = [[1,2],[0,1]]. ¿Cuánto vale el elemento (1,1) de la covarianza de Y?", "answer": 5.0, "tol": 0.006, "unit": "", "explanation": "AΣAᵀ = AAᵀ = [[5,2],[2,1]]. El elemento (1,1) vale 1² + 2² = 5."},
  {"id": "L5-n38", "lesson": "L5", "topic": "Filtro de Kalman", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "En 1D: μ = 5 m, A = 1, B = 1 y u = 2 m. ¿Cuánto vale la media predicha?", "answer": 7.0, "tol": 0.006, "unit": "m", "explanation": "μ̄ = Aμ + Bu = 5 + 2 = 7 m."},
  {"id": "L5-n39", "lesson": "L5", "topic": "Filtro de Kalman", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "En 1D: Σ = 0,5, A = 2 y R = 0,3. ¿Cuánto vale la varianza predicha?", "answer": 2.3, "tol": 0.006, "unit": "", "explanation": "Σ̄ = AΣA + R = 2·0,5·2 + 0,3 = 2 + 0,3 = 2,3."},
  {"id": "L5-n40", "lesson": "L5", "topic": "Filtro de Kalman", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "En 1D, con C = 1: Σ̄ = 1 y Q = 0,25. ¿Cuánto vale K?", "answer": 0.8, "tol": 0.0031, "unit": "", "explanation": "K = Σ̄/(Σ̄ + Q) = 1/1,25 = 0,8."},
  {"id": "L5-n41", "lesson": "L5", "topic": "Filtro de Kalman", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "En 1D, con C = 2: Σ̄ = 1 y Q = 1. ¿Cuánto vale K?", "answer": 0.4, "tol": 0.0031, "unit": "", "explanation": "K = Σ̄C/(C²Σ̄ + Q) = 2/(4 + 1) = 0,4."},
  {"id": "L5-n42", "lesson": "L5", "topic": "Filtro de Kalman", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "En 1D, con C = 1: μ̄ = 7 m, K = 0,8 y z = 7,5 m. ¿Cuánto vale la media corregida?", "answer": 7.4, "tol": 0.006, "unit": "m", "explanation": "μ = μ̄ + K(z − μ̄) = 7 + 0,8·0,5 = 7,4 m."},
  {"id": "L5-n43", "lesson": "L5", "topic": "Filtro de Kalman", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "En 1D, con C = 2: Σ̄ = 1 y K = 0,4. ¿Cuánto vale la varianza corregida?", "answer": 0.2, "tol": 0.0031, "unit": "", "explanation": "Σ = (1 − KC)Σ̄ = (1 − 0,4·2)·1 = 0,2."},
  {"id": "L5-n44", "lesson": "L5", "topic": "Kalman y MAP", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "En 1D, con C = 1: Σ̄ = 2 y Q = 2. Con la forma Σ = [Σ̄⁻¹ + CᵀQ⁻¹C]⁻¹, ¿cuánto vale Σ?", "answer": 1.0, "tol": 0.006, "unit": "", "explanation": "Σ = [1/2 + 1/2]⁻¹ = 1. Con dos fuentes iguales, la varianza se reduce a la mitad."},
  {"id": "L5-n45", "lesson": "L5", "topic": "Filtro de Kalman", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Estado [x, y], Σ̄ = [[0,8; 0,2],[0,2; 0,4]], C = [1 0] y Q = 0,2. ¿Cuánto vale la segunda componente de K?", "answer": 0.2, "tol": 0.0031, "unit": "", "explanation": "S = CΣ̄Cᵀ + Q = 0,8 + 0,2 = 1. Σ̄Cᵀ = [0,8; 0,2]. K = [0,8; 0,2]."},
  {"id": "L5-n46", "lesson": "L5", "topic": "Filtro de Kalman", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Estado [x, y], Σ̄ = [[0,8; 0,2],[0,2; 0,4]], C = [1 0] y Q = 0,2. Si la innovación vale 0,5, ¿cuánto se corrige y?", "answer": 0.1, "tol": 0.0031, "unit": "", "explanation": "K₂·ν = 0,2·0,5 = 0,1. y se corrige aunque no se mide, porque x e y están correlacionadas."},
  {"id": "L5-n47", "lesson": "L5", "topic": "Filtro de Kalman", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Estado [x, y], Σ̄ = [[0,8; 0,2],[0,2; 0,4]], C = [1 0] y Q = 0,2. ¿Cuánto vale el elemento (2,2) de la covarianza corregida?", "answer": 0.36, "tol": 0.0031, "unit": "", "explanation": "I − KC = [[0,2; 0],[−0,2; 1]]. (I − KC)Σ̄ tiene en (2,2): −0,2·0,2 + 1·0,4 = 0,36."},
  {"id": "L5-n48", "lesson": "L5", "topic": "EKF", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Dimensiones del EKF: el robot observa 5 landmarks con rango y marcación. ¿Cuántas filas tiene H?", "answer": 10.0, "tol": 0, "unit": "filas", "explanation": "2 filas por landmark: 2·5 = 10. H es 10×3 y K, 3×10."},
  {"id": "L5-n49", "lesson": "L5", "topic": "EKF", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Comando u = (2, 0, 0) y pose con θ = π/2. ¿Cuánto vale G(1,3) = −u_x·sin θ − u_y·cos θ?", "answer": -2.0, "tol": 0.006, "unit": "", "explanation": "−2·1 − 0·0 = −2."},
  {"id": "L5-n50", "lesson": "L5", "topic": "EKF", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "h(x) = √(x² + 16). μ̄ = 3, Σ̄ = 2 y Q = 0,28. ¿Cuánto vale el jacobiano H en μ̄?", "answer": 0.6, "tol": 0.0031, "unit": "", "explanation": "H = x/√(x² + 16) evaluado en 3: 3/5 = 0,6."},
  {"id": "L5-n51", "lesson": "L5", "topic": "EKF", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "h(x) = √(x² + 16). μ̄ = 3, Σ̄ = 2 y Q = 0,28. ¿Cuánto vale K?", "answer": 1.2, "tol": 0.006, "unit": "", "explanation": "H = 0,6. S = 0,36·2 + 0,28 = 1. K = Σ̄H/S = 2·0,6/1 = 1,2."},
  {"id": "L5-n52", "lesson": "L5", "topic": "EKF", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "h(x) = √(x² + 16). μ̄ = 3, Σ̄ = 2 y Q = 0,28. Si z = 5,5, ¿cuánto vale la media corregida?", "answer": 3.6, "tol": 0.006, "unit": "", "explanation": "h(3) = 5, así que ν = 0,5. K = 1,2. μ = 3 + 1,2·0,5 = 3,6."},
  {"id": "L5-n53", "lesson": "L5", "topic": "EKF", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "h(x) = √(x² + 16). μ̄ = 3, Σ̄ = 2 y Q = 0,28. ¿Cuánto vale la varianza corregida?", "answer": 0.56, "tol": 0.0031, "unit": "", "explanation": "Σ = (1 − KH)Σ̄ = (1 − 1,2·0,6)·2 = 0,56."},
  {"id": "L5-n54", "lesson": "L5", "topic": "EKF", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "La marcación esperada es 170° y la medida es −170°. ¿Cuánto vale la innovación, normalizada a [−180°, 180°]?", "answer": 20.0, "tol": 0.01, "unit": "°", "explanation": "−170 − 170 = −340°. Sumando 360° queda +20°."},
  {"id": "L5-n55", "lesson": "L5", "topic": "EKF", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "X ~ N(3; 0,01) e Y = X². ¿Qué varianza da la linealización en la media?", "answer": 0.36, "tol": 0.0031, "unit": "", "explanation": "g'(μ) = 2μ = 6. Var ≈ g'(μ)²σ² = 36·0,01 = 0,36."},
  {"id": "L5-n56", "lesson": "L5", "topic": "Filtro de partículas", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Partícula en (1, 2, θ = 0), comando u = (2, 0, 0) y ruido muestreado (0,1; −0,2; 0). ¿Cuánto vale la coordenada y de la nueva pose?", "answer": 1.8, "tol": 0.006, "unit": "", "explanation": "compose(x, u + ruido), con u + ruido = (2,1; −0,2; 0). Con θ = 0: y' = 2 + 2,1·0 + (−0,2)·1 = 1,8."},
  {"id": "L5-n57", "lesson": "L5", "topic": "Filtro de partículas", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Sensor de rango con σ_z = 1 m, z = 12 m y distancia predicha desde la partícula: 11 m. ¿Cuánto vale su peso sin normalizar, w = exp(−ν²/(2σ²))?", "answer": 0.60653, "tol": 0.0031, "unit": "", "explanation": "ν = 12 − 11 = 1. w = exp(−1/2) = 0,607."},
  {"id": "L5-n58", "lesson": "L5", "topic": "Filtro de partículas", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Tres partículas tienen innovaciones ν = 1, 0 y 2, con σ_z = 1. ¿Cuánto vale el peso normalizado de la segunda?", "answer": 0.5741, "tol": 0.0031, "unit": "", "explanation": "w = [0,607; 1; 0,135], con suma 1,742. Normalizado: 1/1,742 = 0,574."},
  {"id": "L5-n59", "lesson": "L5", "topic": "Filtro de partículas", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Pasillo con un landmark en m = 40 m. El sensor mide z = 26 m. ¿Cerca de qué posición quedan las partículas con más peso?", "answer": 14.0, "tol": 0.011, "unit": "m", "explanation": "x = m − z = 40 − 26 = 14 m."},
  {"id": "L5-n60", "lesson": "L5", "topic": "Filtro de partículas", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Dos landmarks posibles: m₁ = 40 y m₂ = 50. z = 28,5 m, σ_z = 1 m y partícula en x = 12. ¿Cuánto vale su peso, sumando las dos correspondencias?", "answer": 0.8825, "tol": 0.0031, "unit": "", "explanation": "Con m₁: predicción 28, ν = 0,5, peso 0,882. Con m₂: predicción 38, ν = −9,5, peso ≈ 0. Suma: 0,882."},
  {"id": "L5-n61", "lesson": "L5", "topic": "Remuestreo", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Pesos normalizados [0,2; 0,1; 0,4; 0,3]. ¿Cuánto vale la acumulada C₃?", "answer": 0.7, "tol": 0.0031, "unit": "", "explanation": "C₃ = 0,2 + 0,1 + 0,4 = 0,7."},
  {"id": "L5-n62", "lesson": "L5", "topic": "Remuestreo", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Pesos normalizados [0,2; 0,1; 0,4; 0,3]. Sale r = 0,25. ¿Qué número de partícula se elige (de 1 a 4)?", "answer": 2.0, "tol": 0, "unit": "", "explanation": "Acumulada: 0,2; 0,3; 0,7; 1. El valor 0,25 cae en [0,2; 0,3), que es el intervalo de la partícula 2."},
  {"id": "L5-n63", "lesson": "L5", "topic": "Remuestreo", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Pesos normalizados [0,2; 0,1; 0,4; 0,3]. Sale r = 0,75. ¿Qué número de partícula se elige (de 1 a 4)?", "answer": 4.0, "tol": 0, "unit": "", "explanation": "Acumulada: 0,2; 0,3; 0,7; 1. El valor 0,75 cae en [0,7; 1), que es el intervalo de la partícula 4: se elige la k con C_{k−1} ≤ r < C_k."},
  {"id": "L5-n64", "lesson": "L5", "topic": "Remuestreo", "kind": "Teoría", "format": "numeric", "source": "Diapositivas L5 (v3)", "prompt": "Hay 50 partículas. ¿Cuánto pesa cada una justo después de remuestrear?", "answer": 0.02, "tol": 0.0005, "unit": "", "explanation": "Todas valen 1/N = 1/50 = 0,02."},
  {"id": "L5-z01", "lesson": "L5", "topic": "LS lineal", "kind": "Teoría", "format": "cloze", "source": "Diapositivas L5 (v3)", "prompt": "Completa la solución de mínimos cuadrados, sin ponderar y ponderada.", "code": "x_ls = inv(H.T @ {{0}}) @ H.T @ z\nQi = inv(Q)\nx_wls = inv(H.T @ {{1}} @ H) @ H.T @ {{2}} @ z\nP_wls = inv(H.T @ Qi @ {{3}})", "blanks": [["H"], ["Qi"], ["Qi"], ["H"]], "explanation": "x̂ = (HᵀH)⁻¹Hᵀz y x̂ = (HᵀQ⁻¹H)⁻¹HᵀQ⁻¹z. La covarianza de la estimación es (HᵀQ⁻¹H)⁻¹."},
  {"id": "L5-z02", "lesson": "L5", "topic": "Gauss-Newton", "kind": "Teoría", "format": "cloze", "source": "Diapositivas L5 (v3)", "prompt": "Completa una iteración de Gauss-Newton sin ponderar.", "code": "e = z - {{0}}(x_hat)\nJ = jacobian(x_hat)\ndelta = inv(J.T @ {{1}}) @ J.T @ {{2}}\nx_hat = x_hat + {{3}}", "blanks": [["h"], ["J"], ["e"], ["delta"]], "explanation": "Se calcula el residuo con el modelo no lineal, se resuelve el problema lineal δ = (JᵀJ)⁻¹Jᵀe y se actualiza la estimación."},
  {"id": "L5-z03", "lesson": "L5", "topic": "Filtro de rejilla", "kind": "Teoría", "format": "cloze", "source": "Diapositivas L5 (v3)", "prompt": "Completa el filtro de rejilla: predicción por probabilidad total y corrección de Bayes.", "code": "for xt in cells:\n    pred[xt] = sum(P_move(xt, x0, u) * {{0}}[x0] for x0 in cells)\nfor xt in cells:\n    post[xt] = P_z(z, xt) * {{1}}[xt]\npost = post / np.{{2}}(post)", "blanks": [["bel"], ["pred"], ["sum"]], "explanation": "La predicción suma desde todas las celdas de origen de la creencia anterior. La corrección multiplica la predicción por la verosimilitud y normaliza dividiendo entre la suma."},
  {"id": "L5-z04", "lesson": "L5", "topic": "Filtro de Kalman", "kind": "Teoría", "format": "cloze", "source": "Diapositivas L5 (v3)", "prompt": "Completa el algoritmo de Kalman.", "code": "mu_bar = A @ mu + {{0}} @ u\nP_bar = A @ P @ {{1}} + {{2}}\nK = P_bar @ C.T @ inv(C @ P_bar @ C.T + {{3}})\nmu_new = mu_bar + K @ (z - {{4}} @ mu_bar)\nP_new = (I - K @ C) @ {{5}}", "blanks": [["B"], ["A.T"], ["R"], ["Q"], ["C"], ["P_bar"]], "explanation": "R es el ruido del movimiento y entra al predecir. Q es el del sensor y entra en la ganancia. La corrección parte siempre de los valores predichos."},
  {"id": "L5-z05", "lesson": "L5", "topic": "EKF", "kind": "Teoría", "format": "cloze", "source": "Diapositivas L5 (v3)", "prompt": "Completa el EKF: la media usa los modelos no lineales y las covarianzas, los jacobianos.", "code": "mu_bar = {{0}}(mu, u)\nP_bar = G @ P @ G.T + R\nK = P_bar @ H.T @ inv(H @ P_bar @ H.T + Q)\nmu_new = mu_bar + K @ (z - {{1}}(mu_bar))\nP_new = (I - K @ {{2}}) @ P_bar", "blanks": [["g"], ["h"], ["H"]], "explanation": "μ̄ = g(μ, u); la innovación usa h(μ̄), no H·μ̄; la covarianza usa el jacobiano H."},
  {"id": "L5-z06", "lesson": "L5", "topic": "Filtro de partículas", "kind": "Teoría", "format": "cloze", "source": "Diapositivas L5 (v3)", "prompt": "Completa la predicción de las diapositivas: cada partícula se mueve con su propia muestra de ruido.", "code": "def sample_motion_model(x, u, R):\n    noise = np.random.multivariate_normal(np.zeros({{0}}), {{1}})\n    return compose(x, u + {{2}})\n\nfor i in range(N):\n    particles[i] = sample_motion_model(particles[{{3}}], u_t, R_t)", "blanks": [["3"], ["R"], ["noise"], ["i"]], "explanation": "El ruido tiene dimensión 3 ([dx, dy, dθ]), media cero y covarianza R, y se suma al comando antes de componer."},
  {"id": "L5-z07", "lesson": "L5", "topic": "Filtro de partículas", "kind": "Teoría", "format": "cloze", "source": "Diapositivas L5 (v3)", "prompt": "Completa la corrección de las diapositivas, para un sensor de rango.", "code": "for i in range(N):\n    z_pred = range_sensor_model(particles[i], {{0}})\n    innov = z_t - {{1}}\n    weights[i] = np.exp(-0.5 * innov**2 / sigma_z**{{2}})\nweights /= np.{{3}}(weights)", "blanks": [["landmark"], ["z_pred"], ["2"], ["sum"]], "explanation": "Observación predicha, innovación y verosimilitud gaussiana con la varianza σ². Al final se normaliza dividiendo entre la suma."},
  {"id": "L5-z08", "lesson": "L5", "topic": "Remuestreo", "kind": "Teoría", "format": "cloze", "source": "Diapositivas L5 (v3)", "prompt": "Completa el remuestreo con la distribución acumulada.", "code": "C = np.{{0}}(weights)\nfor j in range(N):\n    r = np.random.rand()\n    k = np.searchsorted(C, {{1}})\n    new_particles[j] = particles[{{2}}]\nweights = np.ones(N) / {{3}}", "blanks": [["cumsum"], ["r"], ["k"], ["N"]], "explanation": "Se acumulan los pesos, cada número aleatorio elige la partícula en cuyo intervalo cae, y después todos los pesos pasan a valer 1/N."},
  {"id": "L5-b01", "lesson": "L5", "topic": "LS lineal", "kind": "Teoría", "format": "bug", "source": "Diapositivas L5 (v3)", "prompt": "Este código debe calcular la solución de mínimos cuadrados, con H de 5×3. ¿Qué línea está mal?", "code": ["A = H @ H.T", "b = H.T @ z", "x_hat = inv(A) @ b"], "answer": 1, "fix": "A = H.T @ H", "explanation": "La matriz que se invierte es HᵀH, de n×n (3×3). H·Hᵀ sería de 5×5, no sería invertible y las dimensiones no cuadrarían con b."},
  {"id": "L5-b02", "lesson": "L5", "topic": "LS ponderado", "kind": "Teoría", "format": "bug", "source": "Diapositivas L5 (v3)", "prompt": "Mínimos cuadrados ponderados con covarianza de medida Q. ¿Qué línea está mal?", "code": ["W = Q", "A = H.T @ W @ H", "b = H.T @ W @ z", "x_hat = inv(A) @ b"], "answer": 1, "fix": "W = inv(Q)", "explanation": "El peso es Q⁻¹. Con Q, las medidas más ruidosas pesarían más, justo al revés de lo que se busca."},
  {"id": "L5-b03", "lesson": "L5", "topic": "Gauss-Newton", "kind": "Teoría", "format": "bug", "source": "Diapositivas L5 (v3)", "prompt": "Una iteración de Gauss-Newton. ¿Qué línea está mal?", "code": ["e = z - h(x_hat)", "J = jacobian(x_hat)", "delta = inv(J.T @ J) @ J.T @ e", "x_hat = x_hat - delta"], "answer": 4, "fix": "x_hat = x_hat + delta", "explanation": "El incremento se suma: x̂ = x̂ + δ. El signo correcto ya está incluido en e = z − h(x̂)."},
  {"id": "L5-b04", "lesson": "L5", "topic": "Multilateración", "kind": "Teoría", "format": "bug", "source": "Diapositivas L5 (v3)", "prompt": "Una fila del jacobiano para una baliza m = (xi, yi) y una estimación (x, y). ¿Qué línea está mal?", "code": ["dx = xi - x", "dy = yi - y", "d = np.sqrt(dx**2 + dy**2)", "J_row = [dx / d, dy / d]"], "answer": 4, "fix": "J_row = [-dx / d, -dy / d]", "explanation": "∂d/∂x = −(x_i − x)/d. La posición del robot resta dentro de la raíz, y por eso aparece el signo negativo."},
  {"id": "L5-b05", "lesson": "L5", "topic": "Filtro de rejilla", "kind": "Teoría", "format": "bug", "source": "Diapositivas L5 (v3)", "prompt": "Corrección de un filtro de rejilla. ¿Qué línea está mal?", "code": ["post = lik * pred", "eta = 1 / np.max(post)", "post = eta * post"], "answer": 2, "fix": "eta = 1 / np.sum(post)", "explanation": "η tiene que hacer que la distribución sume 1, así que se divide entre la suma, no entre el máximo."},
  {"id": "L5-b06", "lesson": "L5", "topic": "Filtro de Kalman", "kind": "Teoría", "format": "bug", "source": "Diapositivas L5 (v3)", "prompt": "Predicción del filtro de Kalman. ¿Qué línea está mal?", "code": ["mu_bar = A @ mu + B @ u", "P_bar = A @ P @ A.T"], "answer": 2, "fix": "P_bar = A @ P @ A.T + R", "explanation": "Falta el ruido del movimiento, R. Sin él, el filtro no añade incertidumbre al moverse y se vuelve demasiado confiado."},
  {"id": "L5-b07", "lesson": "L5", "topic": "Filtro de Kalman", "kind": "Teoría", "format": "bug", "source": "Diapositivas L5 (v3)", "prompt": "Corrección del filtro de Kalman. ¿Qué línea está mal?", "code": ["S = C @ P_bar @ C.T + Q", "K = P @ C.T @ inv(S)", "mu_new = mu_bar + K @ (z - C @ mu_bar)", "P_new = (I - K @ C) @ P_bar"], "answer": 2, "fix": "K = P_bar @ C.T @ inv(S)", "explanation": "La ganancia usa la covarianza predicha, Σ̄, no la del instante anterior."},
  {"id": "L5-b08", "lesson": "L5", "topic": "EKF", "kind": "Teoría", "format": "bug", "source": "Diapositivas L5 (v3)", "prompt": "Corrección del EKF, con modelo de medida no lineal h y jacobiano H. ¿Qué línea está mal?", "code": ["S = H @ P_bar @ H.T + Q", "K = P_bar @ H.T @ inv(S)", "innov = z - H @ mu_bar", "mu_new = mu_bar + K @ innov"], "answer": 3, "fix": "innov = z - h(mu_bar)", "explanation": "La medida esperada se calcula con el modelo no lineal, h(μ̄). El jacobiano solo interviene en las covarianzas y en K."},
  {"id": "L5-b09", "lesson": "L5", "topic": "EKF", "kind": "Teoría", "format": "bug", "source": "Diapositivas L5 (v3)", "prompt": "Predicción del EKF, para una pose compuesta. ¿Qué línea está mal?", "code": ["mu_bar = compose(mu, u)", "G = J1(mu_bar, u)", "P_bar = G @ P @ G.T + R"], "answer": 2, "fix": "G = J1(mu, u)", "explanation": "G se evalúa en el punto de partida, μ_{t−1}. La que se evalúa en la pose predicha es H."},
  {"id": "L5-b10", "lesson": "L5", "topic": "Filtro de partículas", "kind": "Teoría", "format": "bug", "source": "Diapositivas L5 (v3)", "prompt": "Pesos de las partículas. ¿Qué línea está mal?", "code": ["z_pred = range_sensor_model(particles[i], landmark)", "innov = z_t - z_pred", "weights[i] = np.exp(-0.5 * innov**2 / sigma_z)"], "answer": 3, "fix": "weights[i] = np.exp(-0.5 * innov**2 / sigma_z**2)", "explanation": "La gaussiana divide entre la varianza, σ², no entre la desviación típica. Ojo también a normalizar los pesos al terminar."},
  {"id": "L5-b11", "lesson": "L5", "topic": "Filtro de partículas", "kind": "Teoría", "format": "bug", "source": "Diapositivas L5 (v3)", "prompt": "Predicción del filtro de partículas. ¿Qué línea está mal?", "code": ["noise = np.random.multivariate_normal(np.zeros(3), R)", "for i in range(N):", "    particles[i] = compose(particles[i], u + noise)"], "answer": 1, "fix": "(dentro del bucle) noise = np.random.multivariate_normal(np.zeros(3), R)", "explanation": "El ruido se muestrea una sola vez, fuera del bucle, así que todas las partículas reciben el mismo y la nube no se extiende. Cada partícula necesita su propia muestra."},
  {"id": "L5-b12", "lesson": "L5", "topic": "Remuestreo", "kind": "Teoría", "format": "bug", "source": "Diapositivas L5 (v3)", "prompt": "Remuestreo. ¿Qué línea está mal?", "code": ["C = np.cumsum(weights)", "r = np.random.rand(N)", "idx = np.searchsorted(C, r)", "particles = particles[idx]", "weights = weights[idx]"], "answer": 5, "fix": "weights = np.ones(N) / N", "explanation": "Tras remuestrear, todas las partículas pesan 1/N. Conservar los pesos contaría dos veces la misma observación."},

  // ───────────── P4.1 · Landmark-based models ─────────────
  // Código tomado de la solución del notebook 4.1 (to_world_frame, combine_pdfs, inverse_composition1, predicted_obs_from_pov).
  { id: "P41-z01", lesson: "P4.1", topic: "to_world_frame()", kind: "Práctica", format: "cloze", source: "Práctica 4.1",
    prompt: "Completa to_world_frame(): el jacobiano polar → cartesiano y la observación en cartesianas en el marco del robot.",
    code: "r, a = z1_p_r[0,0], z1_p_r[1,0]\ns, c = np.sin(a), np.cos(a)\n\nJac_pol_car = np.array([\n    [c, {{0}}],\n    [{{1}},  r*c]\n])\n\nz1_car_rel = (\n        np.vstack([{{2}}, r*s]), # position\n        Jac_pol_car@W1@{{3}} # uncertainty\n        )",
    blanks: [["-r*s", "-s*r", "-r*np.sin(a)", "-np.sin(a)*r"], ["s", "np.sin(a)"], ["r*c", "c*r", "r*np.cos(a)", "np.cos(a)*r"], ["Jac_pol_car.T", "Jac_pol_car.transpose()", "np.transpose(Jac_pol_car)"]],
    explanation: "z_c = [r·cos α, r·sin α]. Su jacobiano respecto a [r, α] es [[cos α, −r·sin α], [sin α, r·cos α]]. La covarianza se propaga con J Σ Jᵀ: falta la traspuesta al final." },
  { id: "P41-z02", lesson: "P4.1", topic: "combine_pdfs()", kind: "Práctica", format: "cloze", source: "Práctica 4.1",
    prompt: "Completa combine_pdfs(): fusión de dos observaciones gaussianas independientes del mismo landmark.",
    code: "inv_Wz1 = np.linalg.{{0}}(Wz1_w)\ninv_Wz2 = np.linalg.inv(Wz2_w)\n\nW_z = np.linalg.inv({{1}})\nz = W_z @ ({{2}})\n\nreturn z, W_z",
    blanks: [["inv"], ["inv_Wz1 + inv_Wz2", "inv_Wz2 + inv_Wz1"], ["inv_Wz1 @ z1_w + inv_Wz2 @ z2_w", "inv_Wz2 @ z2_w + inv_Wz1 @ z1_w", "inv_Wz1.dot(z1_w) + inv_Wz2.dot(z2_w)"]],
    explanation: "El producto de dos gaussianas da otra gaussiana con Σ = (Σ₁⁻¹ + Σ₂⁻¹)⁻¹ y m = Σ·(Σ₁⁻¹ m₁ + Σ₂⁻¹ m₂). Las matrices de información (las inversas) se suman, y la media es la media ponderada por información." },
  { id: "P41-z03", lesson: "P4.1", topic: "to_world_frame()", kind: "Práctica", format: "cloze", source: "Práctica 4.1",
    prompt: "Completa la preparación de los jacobianos en to_world_frame(). J1 y J2 devuelven matrices 3×3 de la composición de poses.",
    code: "z1_ext = np.vstack([z1_car_rel[0], {{0}}]) # Extends z1 for its usage in J1 and J2\n\n# Build the Jacobians\nJac_ap = J1(x1_w ,z1_ext)[{{1}}] # dm^1/dx_1   (2x3)\nJac_aa = J2(x1_w ,z1_ext)[{{2}}] # dm^1/dz^1_c (2x2)",
    blanks: [["0"], ["0:2,:", ":2,:", "0:2", ":2"], ["0:2,0:2", ":2,:2", "0:2,:2", ":2,0:2"]],
    explanation: "El landmark es un punto 2D, pero J1, J2 y tcomp trabajan con poses 3×1: se amplía z_c con un 0 como «ángulo». Después se recorta: m tiene 2 filas, así que ∂m/∂x₁ son las 2 primeras filas y las 3 columnas (2×3), y ∂m/∂z_c, las 2 primeras filas y columnas (2×2)." },
  { id: "P41-z04", lesson: "P4.1", topic: "to_world_frame()", kind: "Práctica", format: "cloze", source: "Práctica 4.1",
    prompt: "Completa el final de to_world_frame(): media y covarianza del landmark en el mundo.",
    code: "z1_w = {{0}}(x1_w ,z1_ext)[0:2,[0]] # Compute coordinates of the landmark in the world\nWz1 = (Jac_ap @ {{1}} @ Jac_ap.T\n      + Jac_aa @ {{2}} @ Jac_aa.T) # Finally, propagate the covariance!\n\nreturn z1_w, Wz1",
    blanks: [["tcomp"], ["Qx1_w"], ["z1_car_rel[1]"]],
    explanation: "m¹ = x₁ ⊕ z¹_c (tcomp con la pose primero). Σ_m = J_x Σ_x J_xᵀ + J_z Σ_zc J_zᵀ: la covarianza de la pose (Qx1_w, 3×3) va con Jac_ap y la de la observación ya pasada a cartesianas (z1_car_rel[1], 2×2) va con Jac_aa. Ojo: no es W1, que está en polares." },
  { id: "P41-z05", lesson: "P4.1", topic: "inverse_composition1()", kind: "Práctica", format: "cloze", source: "Práctica 4.1 (opcional)",
    prompt: "Completa inverse_composition1(): pose relativa x₁₂ = ⊖x₁ ⊕ x₂ y su covarianza.",
    code: "jac_inv_x = jac_tinv(x1_w)\n\ninv_r1 = (\n    {{0}}(x1_w),\n    jac_inv_x @ Qx1_w @ jac_inv_x.T\n)\n\njac_x12_inv = J1(inv_r1[0], x2_w)\njac_x12_x2 = J2(inv_r1[0], x2_w)\n\nx12_w = tcomp({{1}}, x2_w)\n\nQx12_w = (\n        jac_x12_inv@{{2}}@jac_x12_inv.T\n        + jac_x12_x2@Qx2_w@jac_x12_x2.T\n    )",
    blanks: [["tinv"], ["inv_r1[0]", "tinv(x1_w)"], ["inv_r1[1]"]],
    explanation: "Primero se calcula ⊖x₁ = tinv(x1_w) y su covarianza J_⊖ Σ_x₁ J_⊖ᵀ (inv_r1[1]). Después x₁₂ = ⊖x₁ ⊕ x₂. Como jac_x12_inv es la derivada respecto a ⊖x₁, multiplica a la covarianza de ⊖x₁ (inv_r1[1]), no a Qx1_w. Resultado esperado: x12_w = [5.347, −0.642, 1.6]." },
  { id: "P41-z06", lesson: "P4.1", topic: "predicted_obs_from_pov()", kind: "Práctica", format: "cloze", source: "Práctica 4.1 (opcional)",
    prompt: "Completa el paso de cartesianas a polares en predicted_obs_from_pov().",
    code: "# Jacobian from cartesian to polar at z2p_r\ntheta = z2_pr[1, 0]\ns, c = np.sin(theta), np.cos(theta)\nr = z2_pr[0, 0]\n\nJac_car_pol = np.array([\n    [c, s],\n    [{{0}}, {{1}}]\n])\n\nW2_p = Jac_car_pol@{{2}}@Jac_car_pol.T",
    blanks: [["-s/r", "-np.sin(theta)/r", "-(s/r)"], ["c/r", "np.cos(theta)/r"], ["W2_c"]],
    explanation: "Para r = √(x²+y²) y α = atan2(y, x): ∂r/∂(x,y) = [cos α, sin α] y ∂α/∂(x,y) = [−sin α / r, cos α / r]. Es la inversa del jacobiano polar → cartesiano: allí se multiplica por r y aquí se divide. Se aplica a W2_c, la covarianza en cartesianas en el marco de R2." },
  { id: "P41-b01", lesson: "P4.1", topic: "to_world_frame()", kind: "Práctica", format: "bug", source: "Práctica 4.1",
    prompt: "Esta versión de to_world_frame() falla al ejecutarse. ¿En qué línea está el error?",
    code: ["r, a = z1_p_r[0,0], z1_p_r[1,0]", "s, c = np.sin(a), np.cos(a)", "Jac_pol_car = np.array([[c, -r*s], [s, r*c]])", "z1_car_rel = (np.vstack([r*c, r*s]), Jac_pol_car@W1@Jac_pol_car.T)", "z1_ext = np.vstack([z1_car_rel[0], 0])", "Jac_ap = J1(x1_w ,z1_ext)[0:2,:]", "Jac_aa = J2(x1_w ,z1_ext)[0:2,0:2]", "z1_w = tcomp(x1_w ,z1_ext)[0:2,[0]]", "Wz1 = Jac_ap @ Qx1_w @ Jac_ap + Jac_aa @ z1_car_rel[1] @ Jac_aa.T"],
    answer: 9, fix: "Wz1 = Jac_ap @ Qx1_w @ Jac_ap.T + Jac_aa @ z1_car_rel[1] @ Jac_aa.T",
    explanation: "Falta la traspuesta de Jac_ap. Jac_ap es 2×3 y Qx1_w es 3×3: (2×3)@(3×3) da 2×3, y multiplicarlo por otra 2×3 lanza un error de dimensiones. La propagación correcta es J Σ Jᵀ en los dos términos." },
  { id: "P41-b02", lesson: "P4.1", topic: "predicted_obs_from_pov()", kind: "Práctica", format: "bug", source: "Práctica 4.1 (opcional)",
    prompt: "Predicción range-bearing del landmark desde R2. El ángulo sale mal. ¿Qué línea tiene el error?",
    code: ["# Take a measurement using the range-bearing model", "z2_pr = np.vstack([", "        np.sqrt((z1_w[0, 0]-x1_w[0, 0])**2 + (z1_w[1, 0]-x1_w[1, 0])**2), # distance", "        np.arctan2(z1_w[0, 0]-x1_w[0, 0], z1_w[1, 0]-x1_w[1, 0]) - x1_w[2, 0] # angle", "    ])"],
    answer: 4, fix: "        np.arctan2(z1_w[1, 0]-x1_w[1, 0], z1_w[0, 0]-x1_w[0, 0]) - x1_w[2, 0] # angle",
    explanation: "np.arctan2 recibe primero la componente y (Δy) y luego la x (Δx). Con los argumentos cambiados se mide el ángulo desde el eje y. Restar θ₂ (x1_w[2, 0], que aquí es la pose de R2) sí es correcto: el bearing es relativo a la orientación del robot." },
  { id: "P41-b03", lesson: "P4.1", topic: "combine_pdfs()", kind: "Práctica", format: "bug", source: "Práctica 4.1",
    prompt: "Esta fusión de dos observaciones da una elipse enorme en lugar de una más pequeña. ¿En qué línea está el error?",
    code: ["inv_Wz1 = np.linalg.inv(Wz1_w)", "inv_Wz2 = np.linalg.inv(Wz2_w)", "W_z = inv_Wz1 + inv_Wz2", "z = W_z @ (inv_Wz1 @ z1_w + inv_Wz2 @ z2_w)", "return z, W_z"],
    answer: 3, fix: "W_z = np.linalg.inv(inv_Wz1 + inv_Wz2)",
    explanation: "inv_Wz1 + inv_Wz2 es la matriz de información fusionada, no la covarianza: hay que invertirla. Así Σ = (Σ₁⁻¹ + Σ₂⁻¹)⁻¹, que siempre es menor que cada Σ por separado. Fusionar información independiente reduce la incertidumbre." },
  { id: "P41-b04", lesson: "P4.1", topic: "to_world_frame()", kind: "Práctica", format: "bug", source: "Práctica 4.1",
    prompt: "Con esta versión, la elipse del landmark no crece al aumentar la distancia medida r. ¿Qué línea está mal?",
    code: ["r, a = z1_p_r[0,0], z1_p_r[1,0]", "s, c = np.sin(a), np.cos(a)", "Jac_pol_car = np.array([[c, -s], [s, c]])", "z1_car_rel = (np.vstack([r*c, r*s]), Jac_pol_car@W1@Jac_pol_car.T)"],
    answer: 3, fix: "Jac_pol_car = np.array([[c, -r*s], [s, r*c]])",
    explanation: "Esa matriz es una rotación, no el jacobiano. La columna de α es ∂(r cos α)/∂α = −r·sin α y ∂(r sin α)/∂α = r·cos α: falta el factor r. Sin él, la incertidumbre tangencial sería σ_α y no r·σ_α (con r = 4 y σ_α = 0,2, sería 0,2 m en vez de 0,8 m)." },
  { id: "P41-b05", lesson: "P4.1", topic: "to_world_frame()", kind: "Práctica", format: "bug", source: "Práctica 4.1",
    prompt: "La media del landmark sale en un sitio que no tiene sentido. ¿Qué línea tiene el error?",
    code: ["z1_ext = np.vstack([z1_car_rel[0], 0])", "Jac_ap = J1(x1_w ,z1_ext)[0:2,:]", "Jac_aa = J2(x1_w ,z1_ext)[0:2,0:2]", "z1_w = tcomp(z1_ext, x1_w)[0:2,[0]]", "Wz1 = (Jac_ap @ Qx1_w @ Jac_ap.T", "      + Jac_aa @ z1_car_rel[1] @ Jac_aa.T)"],
    answer: 4, fix: "z1_w = tcomp(x1_w, z1_ext)[0:2,[0]]",
    explanation: "m = x ⊕ z_c, no z_c ⊕ x: la composición no es conmutativa. El primer argumento de tcomp es el marco de referencia (la pose del robot en el mundo) y el segundo, lo expresado en ese marco." },
  { id: "P41-b06", lesson: "P4.1", topic: "to_world_frame()", kind: "Práctica", format: "bug", source: "Práctica 4.1",
    prompt: "Esta versión lanza un error de dimensiones al propagar la covarianza. ¿Qué línea lo provoca?",
    code: ["z1_ext = np.vstack([z1_car_rel[0], 0])", "Jac_ap = J1(x1_w ,z1_ext)[0:2,0:2]", "Jac_aa = J2(x1_w ,z1_ext)[0:2,0:2]", "z1_w = tcomp(x1_w ,z1_ext)[0:2,[0]]", "Wz1 = (Jac_ap @ Qx1_w @ Jac_ap.T", "      + Jac_aa @ z1_car_rel[1] @ Jac_aa.T)"],
    answer: 2, fix: "Jac_ap = J1(x1_w ,z1_ext)[0:2,:]",
    explanation: "∂m/∂x₁ debe ser 2×3: el landmark depende de x, y y θ. Con [0:2,0:2] se pierde la columna de θ, que es la que hace crecer la elipse con la distancia, y además Jac_ap (2×2) @ Qx1_w (3×3) falla. El error salta en la línea 5, pero el fallo está en la 2." },
  { id: "P41-b07", lesson: "P4.1", topic: "to_world_frame()", kind: "Práctica", format: "bug", source: "Práctica 4.1",
    prompt: "Esta versión de to_world_frame() lanza «TCOMP: tbc is not a valid transformation!». ¿En qué línea está el error?",
    code: ["z1_car_rel = (np.vstack([r*c, r*s]), Jac_pol_car@W1@Jac_pol_car.T)", "z1_ext = np.vstack([z1_car_rel[0], 0])", "Jac_ap = J1(x1_w ,z1_ext)[0:2,:]", "Jac_aa = J2(x1_w ,z1_ext)[0:2,0:2]", "z1_w = tcomp(x1_w, z1_car_rel[0])[0:2,[0]]"],
    answer: 5, fix: "z1_w = tcomp(x1_w, z1_ext)[0:2,[0]]",
    explanation: "z1_car_rel[0] tiene 2 filas y tcomp exige 3. Precisamente para eso se construye z1_ext = np.vstack([z1_car_rel[0], 0]): hay que usarlo también aquí." },
  { id: "P41-b08", lesson: "P4.1", topic: "combine_pdfs()", kind: "Práctica", format: "bug", source: "Práctica 4.1",
    prompt: "La elipse fusionada sale bien, pero el punto fusionado queda justo en medio de los dos aunque una observación sea mucho más precisa. ¿Qué línea falla?",
    code: ["inv_Wz1 = np.linalg.inv(Wz1_w)", "inv_Wz2 = np.linalg.inv(Wz2_w)", "W_z = np.linalg.inv(inv_Wz1 + inv_Wz2)", "z = (z1_w + z2_w) / 2", "return z, W_z"],
    answer: 4, fix: "z = W_z @ (inv_Wz1 @ z1_w + inv_Wz2 @ z2_w)",
    explanation: "La media simple ignora qué observación es más fiable. En el producto de gaussianas, la media es la media ponderada por información: m = Σ·(Σ₁⁻¹ m₁ + Σ₂⁻¹ m₂). Así el resultado queda más cerca de la observación con menor covarianza." },
  { id: "P41-b09", lesson: "P4.1", topic: "predicted_obs_from_pov()", kind: "Práctica", format: "bug", source: "Práctica 4.1 (opcional)",
    prompt: "Desde R2 = [6, 4, 2.1] el bearing predicho sale −2,553 rad en lugar de 0,589 rad. ¿Qué línea tiene el error?",
    code: ["z2_pr = np.vstack([", "        np.sqrt((z1_w[0, 0]-x1_w[0, 0])**2 + (z1_w[1, 0]-x1_w[1, 0])**2), # distance", "        np.arctan((z1_w[1, 0]-x1_w[1, 0]) / (z1_w[0, 0]-x1_w[0, 0])) - x1_w[2, 0] # angle", "    ])"],
    answer: 3, fix: "        np.arctan2(z1_w[1, 0]-x1_w[1, 0], z1_w[0, 0]-x1_w[0, 0]) - x1_w[2, 0] # angle",
    explanation: "arctan(Δy/Δx) solo devuelve ángulos en (−π/2, π/2) y falla si Δx = 0. Aquí Δx = −3,551 < 0 (segundo cuadrante): arctan da −0,453 en vez de 2,689 rad. Hay que usar np.arctan2(Δy, Δx), que tiene en cuenta los signos." },
  { id: "P41-b10", lesson: "P4.1", topic: "predicted_obs_from_pov()", kind: "Práctica", format: "bug", source: "Práctica 4.1 (opcional)",
    prompt: "La covarianza predicha en polares sale con una varianza angular absurda (del orden de r⁴ veces mayor). ¿Qué línea está mal?",
    code: ["theta = z2_pr[1, 0]", "s, c = np.sin(theta), np.cos(theta)", "r = z2_pr[0, 0]", "Jac_car_pol = np.array([[c, s], [-r*s, r*c]])", "W2_p = Jac_car_pol@W2_c@Jac_car_pol.T"],
    answer: 4, fix: "Jac_car_pol = np.array([[c, s], [-s/r, c/r]])",
    explanation: "La segunda fila es la derivada de α = atan2(y, x), que divide por r: [−sin α / r, cos α / r]. Multiplicar por r corresponde al sentido contrario (polares → cartesianas)." },
  { id: "P41-b11", lesson: "P4.1", topic: "inverse_composition1()", kind: "Práctica", format: "bug", source: "Práctica 4.1 (opcional)",
    prompt: "inverse_composition1() da una x12_w correcta pero una Qx12_w que no coincide con la de inverse_composition2(). ¿Qué línea tiene el error?",
    code: ["jac_inv_x = jac_tinv(x1_w)", "inv_r1 = (tinv(x1_w), jac_inv_x @ Qx1_w @ jac_inv_x.T)", "jac_x12_inv = J1(inv_r1[0], x2_w)", "jac_x12_x2 = J2(inv_r1[0], x2_w)", "x12_w = tcomp(inv_r1[0], x2_w)", "Qx12_w = jac_x12_inv@Qx1_w@jac_x12_inv.T + jac_x12_x2@Qx2_w@jac_x12_x2.T"],
    answer: 6, fix: "Qx12_w = jac_x12_inv@inv_r1[1]@jac_x12_inv.T + jac_x12_x2@Qx2_w@jac_x12_x2.T",
    explanation: "jac_x12_inv es ∂x₁₂/∂(⊖x₁), así que debe ir con la covarianza de ⊖x₁ (inv_r1[1] = J_⊖ Σ_x₁ J_⊖ᵀ), no con la de x₁. Es la regla de la cadena: ∂x₁₂/∂x₁ = ∂x₁₂/∂(⊖x₁) · ∂(⊖x₁)/∂x₁." },
  { id: "P41-n01", lesson: "P4.1", topic: "Assignment 1", kind: "Práctica", format: "numeric", source: "Práctica 4.1",
    prompt: "Assignment 1: el robot está en x₁ = [1, 2, 0,5]ᵀ y mide z = [4 m, 0,7 rad]. ¿Cuál es la coordenada x del landmark en el mundo (z1_w[0])?",
    answer: 2.449, tol: 0.01, unit: "m",
    explanation: "m_x = x + r·cos(θ + α) = 1 + 4·cos(1,2) = 1 + 4·0,3624 = 2,449 m (y m_y = 2 + 4·sin(1,2) = 5,728 m). Coincide con la salida esperada [2.449, 5.728]." },
  { id: "P41-n02", lesson: "P4.1", topic: "Fusión de gaussianas", kind: "Práctica", format: "numeric", source: "Práctica 4.1",
    prompt: "Fusión en 1D: dos observaciones independientes de la coordenada x de un landmark dan m₁ = 2,0 m con σ₁² = 0,04 y m₂ = 2,3 m con σ₂² = 0,12. ¿Cuál es la media fusionada?",
    answer: 2.075, tol: 0.005, unit: "m",
    explanation: "σ² = 1/(1/0,04 + 1/0,12) = 1/(25 + 8,333) = 0,03. m = σ²·(m₁/σ₁² + m₂/σ₂²) = 0,03·(50 + 19,167) = 2,075 m. Queda más cerca de m₁, que es la medida más precisa, y la varianza (0,03) es menor que las dos." },
  { id: "P41-n03", lesson: "P4.1", topic: "Assignment 1", kind: "Práctica", format: "numeric", source: "Práctica 4.1",
    prompt: "Assignment 1 (pose exacta): W1 = diag(0,25, 0,04) y r = 4 m. ¿Cuánto mide el semieje mayor (1σ) de la elipse del landmark?",
    answer: 0.8, tol: 0.01, unit: "m",
    explanation: "Con la pose exacta, la elipse solo refleja el ruido del sensor: semieje radial = σ_r = √0,25 = 0,5 m; semieje tangencial = r·σ_α = 4·√0,04 = 4·0,2 = 0,8 m. El mayor es el tangencial: el error angular se amplifica con la distancia. (Comprobado: √eig(Wz1) = [0,8, 0,5].)" },
  { id: "P41-n04", lesson: "P4.1", topic: "Assignment 2", kind: "Práctica", format: "numeric", source: "Práctica 4.1",
    prompt: "Assignment 2: con Σ_x₁ = diag(0,08, 0,6, 0,02) y r = 4 m, ¿cuánto vale la traza del término que añade la pose del robot, J_x Σ_x J_xᵀ?",
    answer: 1.0, tol: 0.01, unit: "m²",
    explanation: "J_x = [[1, 0, −(m_y − y)], [0, 1, m_x − x]]. Su traza es σ_x² + σ_y² + σ_θ²·((m_x − x)² + (m_y − y)²) = σ_x² + σ_y² + σ_θ²·r² = 0,08 + 0,6 + 0,02·16 = 1,0 m². Es exactamente lo que crece la traza de Wz1 de A1 a A2." },
  { id: "P41-n05", lesson: "P4.1", topic: "predicted_obs_from_pov()", kind: "Práctica", format: "numeric", source: "Práctica 4.1 (opcional)",
    prompt: "R2 está en [6, 4, 2,1]ᵀ y el landmark estimado en [2,449, 5,728]ᵀ. ¿Qué bearing α̂ predice (en rad)?",
    answer: 0.589, tol: 0.005, unit: "rad",
    explanation: "Δx = 2,449 − 6 = −3,551 y Δy = 5,728 − 4 = 1,728. atan2(1,728, −3,551) = 2,689 rad (segundo cuadrante); α̂ = 2,689 − 2,1 = 0,589 rad. El range es r̂ = √(3,551² + 1,728²) = 3,949 m. Coincide con la salida esperada [3.949, 0.589]." },
  { id: "P41-c01", lesson: "P4.1", topic: "Thinking about it", kind: "Práctica", format: "single", source: "Práctica 4.1",
    prompt: "En el Assignment 2 se añade incertidumbre a la pose del robot (Σ_x ≠ 0). ¿Qué le pasa a Σ_m del landmark?",
    options: ["Aumenta: se suma el término J_x Σ_x J_xᵀ al del sensor, y el error de orientación se amplifica con la distancia", "No cambia: solo depende del sensor", "Disminuye, porque hay más información", "Pasa a ser igual a Σ_x"],
    answer: 0,
    explanation: "Σ_m = J_x Σ_x J_xᵀ + J_z Σ_z J_zᵀ. Con Σ_x = 0 solo queda el término del sensor; al añadirlo, la elipse crece (salida esperada: de diag ≈ 0,59/0,30 a ≈ 0,95/0,94). El error en θ se multiplica por la distancia al landmark, así que la elipse del landmark puede ser mayor que la del robot." },

  // ───────────── P4.2 · Laser scanner ─────────────
  // Código tomado de la solución del notebook 4.2 (plot_observations, run_laser_and_plot, explore_environment) y de utils/laser/laser2D.py.
  { id: "P42-z01", lesson: "P4.2", topic: "plot_observations()", kind: "Práctica", format: "cloze", source: "Práctica 4.2",
    prompt: "Completa plot_observations(): pasar cada medida del láser (polar, marco del sensor) a un punto global.",
    code: "for i in range (z.shape[1]):\n    distance = z[{{0}}, i]\n    angle = z[1, i]\n\n    # calculate the cartesian coordinates of the observed point in local space\n    x_local = distance*np.{{1}}(angle)\n    y_local = distance*np.sin(angle)\n\n    # compose with the robot pose to express the point in global space\n    pose_obs_global = tcomp({{2}}, np.vstack([x_local, y_local, 0]))\n    x = pose_obs_global[0]\n    y = pose_obs_global[1]",
    blanks: [["0"], ["cos"], ["pose"]],
    explanation: "take_observation() devuelve z de 2×K: fila 0 = distancias, fila 1 = ángulos. En local, x = d·cos α e y = d·sin α. Después se compone la pose del robot con el punto: tcomp(pose, punto_local) (primero el marco «padre»)." },
  { id: "P42-z02", lesson: "P4.2", topic: "run_laser_and_plot()", kind: "Práctica", format: "cloze", source: "Práctica 4.2",
    prompt: "Completa run_laser_and_plot(): colocar el láser, medir y dibujar.",
    code: "def run_laser_and_plot(laser, pose, fig, ax, draw_lines = True, color='r'):\n    laser.{{0}}(pose)\n\n    # take the measurement\n    measurement = laser.{{1}}(virtual_map)\n\n    # Plot!\n    DrawRobot(fig, ax, pose, axis_percent=0.015, color=color, linewidth=1.5);\n    plot_observations({{2}}, pose, fig, ax, draw_lines, color)\n    return fig, ax",
    blanks: [["set_pose"], ["take_observation"], ["measurement"]],
    explanation: "Laser2D tiene dos métodos clave: set_pose() le dice desde dónde mide y take_observation(map) devuelve la observación z (2×K) contra el mapa de polilíneas. Primero se coloca y después se mide. Lo que se dibuja es esa medida, desde la misma pose." },
  { id: "P42-z03", lesson: "P4.2", topic: "Laser2D por dentro", kind: "Práctica", format: "cloze", source: "Práctica 4.2 (utils/laser/laser2D.py)",
    prompt: "Completa estas líneas de Laser2D.take_observation(): número de haces y ruido de cada medida.",
    code: "n_beams = math.{{0}}(self.FOV / self.resolution) + {{1}}\nz = np.zeros([2,n_beams])\n# ... ray casting of every beam against every map segment ...\nz[0,i_beam] = d + np.random.normal(0, np.{{2}}(self.noise_cov[0][0]))\nz[1,i_beam] = i_beam*self.resolution-(self.FOV/2) + np.random.normal(0, np.sqrt(self.noise_cov[1][1]))",
    blanks: [["floor"], ["1"], ["sqrt"]],
    explanation: "Se mide en ambos extremos del FOV, así que n = ⌊FOV/res⌋ + 1 (con FOV = π y res = π/2 salen 3 haces: −90°, 0° y +90°). np.random.normal recibe la desviación típica, y la diagonal de noise_cov son varianzas: hay que hacer la raíz." },
  { id: "P42-z04", lesson: "P4.2", topic: "explore_environment()", kind: "Práctica", format: "cloze", source: "Práctica 4.2",
    prompt: "Completa explore_environment(). Movimientos pedidos: [0,0,0], [2,0,0], [2,0,0], [0,2,π/2] y [2,0,0].",
    code: "pose_increments_list = [\n    (np.vstack([0, 0, 0]), 'orangered'),\n    (np.vstack([2, 0, 0]), 'olive'),\n    (np.vstack([2, 0, 0]), 'teal'),\n    (np.vstack([0, 2, {{0}}]), 'magenta'),\n    (np.vstack([2, 0, 0]), 'indigo'),\n]\n\ncurrent_pose = np.vstack([4,4,0]) # starting pose\n\nfor step, color in pose_increments_list:\n    current_pose = {{1}}(current_pose, step)\n    run_laser_and_plot({{2}}, current_pose, fig, ax, False, color)",
    blanks: [["np.pi/2", "np.pi / 2", "math.pi/2", "0.5*np.pi", "np.pi*0.5"], ["tcomp"], ["laser"]],
    explanation: "Los incrementos son columnas 3×1 (np.vstack) en el marco del robot, y se encadenan con tcomp(current_pose, step). Las poses van de (4,4,0) a (8,8,π/2). Se mide con el láser creado al principio de la función, desde la pose acumulada." },
  { id: "P42-z05", lesson: "P4.2", topic: "Crear el láser", kind: "Práctica", format: "cloze", source: "Práctica 4.2",
    prompt: "Completa la creación del láser (el orden de los argumentos del constructor importa).",
    code: "def create_laser_at_origin(FOV, resolution, max_distance, noise_cov):\n    origin_pose = np.vstack([0, 0, 0])\n    laser = Laser2D(FOV, resolution, {{0}}, noise_cov, {{1}})\n    return laser\n\n# in test_laser(): the sliders give the two variances\nlaser = create_laser_at_origin(FOV, resolution, max_distance, np.{{2}}([distance_noise, angle_noise]))",
    blanks: [["max_distance"], ["origin_pose"], ["diag"]],
    explanation: "Constructor: Laser2D(FOV, resolution, max_distance, noise_cov, pose). noise_cov es la matriz Q 2×2 del sensor; con ruidos independientes de rango y ángulo es diagonal: np.diag([σ_r², σ_α²])." },
  { id: "P42-b01", lesson: "P4.2", topic: "plot_observations()", kind: "Práctica", format: "bug", source: "Práctica 4.2",
    prompt: "Los puntos del scan aparecen en un sitio absurdo del mapa. ¿Qué línea tiene el error?",
    code: ["for i in range (z.shape[1]):", "    distance = z[0, i]", "    angle = z[1, i]", "    x_local = distance*np.cos(angle)", "    y_local = distance*np.sin(angle)", "    pose_obs_global = tcomp(np.vstack([x_local, y_local, 0]), pose)", "    x = pose_obs_global[0]", "    y = pose_obs_global[1]", "    ax.plot(x, y, 'o', markersize=4, color=point_color)"],
    answer: 6, fix: "    pose_obs_global = tcomp(pose, np.vstack([x_local, y_local, 0]))",
    explanation: "La composición no es conmutativa: x_global = pose ⊕ z_local. El primer argumento de tcomp es el marco de referencia (la pose del robot en el mundo) y el segundo, lo que se expresa en ese marco." },
  { id: "P42-b02", lesson: "P4.2", topic: "explore_environment()", kind: "Práctica", format: "bug", source: "Práctica 4.2",
    prompt: "El robot debería avanzar por la habitación, pero todos los scans se toman cerca del origen. ¿Qué línea falla?",
    code: ["current_pose = np.vstack([4,4,0]) # starting pose", "for step, color in pose_increments_list:", "    current_pose = step", "    run_laser_and_plot(laser, current_pose, fig, ax, False, color)"],
    answer: 3, fix: "    current_pose = tcomp(current_pose, step)",
    explanation: "Cada elemento de la lista es un incremento de pose expresado en el marco del robot, no una pose absoluta. La nueva pose es la composición current_pose ⊕ step (tcomp), igual que en el modelo de movimiento del tema 3." },
  { id: "P42-b03", lesson: "P4.2", topic: "plot_observations()", kind: "Práctica", format: "bug", source: "Práctica 4.2",
    prompt: "Todos los puntos del scan aparecen alineados sobre una misma diagonal que pasa por el robot. ¿Qué línea está mal?",
    code: ["for i in range (z.shape[1]):", "    distance = z[0, i]", "    angle = z[1, i]", "    x_local = distance*np.sin(angle)", "    y_local = distance*np.sin(angle)", "    pose_obs_global = tcomp(pose, np.vstack([x_local, y_local, 0]))"],
    answer: 4, fix: "    x_local = distance*np.cos(angle)",
    explanation: "Polares → cartesianas: x = r·cos α, y = r·sin α. Con sin en las dos, todos los puntos caen sobre la diagonal y = x del sensor (x = y). Un haz recto (α = 0) daría (0, 0) en vez de (r, 0)." },
  { id: "P42-b04", lesson: "P4.2", topic: "plot_observations()", kind: "Práctica", format: "bug", source: "Práctica 4.2",
    prompt: "Esta versión de plot_observations() lanza «TCOMP: tbc is not a valid transformation!». ¿En qué línea está el error?",
    code: ["for i in range (z.shape[1]):", "    distance = z[0, i]", "    angle = z[1, i]", "    x_local = distance*np.cos(angle)", "    y_local = distance*np.sin(angle)", "    pose_obs_global = tcomp(pose, np.vstack([x_local, y_local]))", "    x = pose_obs_global[0]", "    y = pose_obs_global[1]"],
    answer: 6, fix: "    pose_obs_global = tcomp(pose, np.vstack([x_local, y_local, 0]))",
    explanation: "tcomp compone poses 3×1 y comprueba que tbc tenga 3 filas. El punto se amplía con un 0 como «ángulo», que luego se ignora: solo se usan pose_obs_global[0] y [1]." },
  { id: "P42-b05", lesson: "P4.2", topic: "plot_observations()", kind: "Práctica", format: "bug", source: "Práctica 4.2",
    prompt: "Con el robot en [6, 4, π/2]ᵀ, un haz recto de 2 m (α = 0) aparece en (4, 4) en lugar de en (6, 6). ¿Qué línea tiene el error?",
    code: ["for i in range (z.shape[1]):", "    distance = z[0, i]", "    angle = z[1, i] + pose[2]", "    x_local = distance*np.cos(angle)", "    y_local = distance*np.sin(angle)", "    pose_obs_global = tcomp(pose, np.vstack([x_local, y_local, 0]))"],
    answer: 3, fix: "    angle = z[1, i]",
    explanation: "Se gira dos veces: al sumar θ al ángulo y otra vez dentro de tcomp. O se usa la fórmula directa [x + r·cos(α+θ), y + r·sin(α+θ)] sin tcomp, o se compone con el ángulo local, pero no las dos cosas. El scan entero sale girado θ de más." },
  { id: "P42-b06", lesson: "P4.2", topic: "plot_observations()", kind: "Práctica", format: "bug", source: "Práctica 4.2",
    prompt: "Solo se dibujan 2 puntos de cada scan, aunque el láser tiene 95 haces. ¿Qué línea está mal?",
    code: ["for i in range (z.shape[0]):", "    distance = z[0, i]", "    angle = z[1, i]", "    x_local = distance*np.cos(angle)", "    y_local = distance*np.sin(angle)", "    pose_obs_global = tcomp(pose, np.vstack([x_local, y_local, 0]))"],
    answer: 1, fix: "for i in range (z.shape[1]):",
    explanation: "z es 2×K: z.shape[0] = 2 (filas: distancia y ángulo) y z.shape[1] = K (número de haces). Hay que recorrer las columnas." },
  { id: "P42-b07", lesson: "P4.2", topic: "explore_environment()", kind: "Práctica", format: "bug", source: "Práctica 4.2",
    prompt: "La exploración acaba en [10, 6, π/2]ᵀ en lugar de en [8, 8, π/2]ᵀ. ¿Qué línea tiene el error?",
    code: ["current_pose = np.vstack([4,4,0]) # starting pose", "for step, color in pose_increments_list:", "    current_pose = current_pose + step", "    run_laser_and_plot(laser, current_pose, fig, ax, False, color)"],
    answer: 3, fix: "    current_pose = tcomp(current_pose, step)",
    explanation: "Los incrementos son locales: hay que componer. Sumando, los primeros pasos salen bien por casualidad (θ = 0), pero el último [2, 0, 0] se aplica en +x del mundo en lugar de en la dirección del robot (+y tras girar π/2). Sumar: (8, 6) + (2, 0) = (10, 6); componer: (8, 6 + 2) = (8, 8)." },
  { id: "P42-b08", lesson: "P4.2", topic: "explore_environment()", kind: "Práctica", format: "bug", source: "Práctica 4.2",
    prompt: "La exploración lanza «IndexError: too many indices for array» en el segundo paso. ¿Qué línea lo provoca?",
    code: ["pose_increments_list = [", "    (np.vstack([0, 0, 0]), 'orangered'),", "    (np.array([2, 0, 0]), 'olive'),", "    (np.vstack([2, 0, 0]), 'teal'),", "    (np.vstack([0, 2, np.pi/2]), 'magenta'),", "    (np.vstack([2, 0, 0]), 'indigo'),", "]"],
    answer: 3, fix: "    (np.vstack([2, 0, 0]), 'olive'),",
    explanation: "tcomp accede a tbc[2, 0], así que necesita una columna 3×1. np.array([2, 0, 0]) tiene forma (3,), es 1D, y el doble índice falla. np.vstack([2, 0, 0]) da (3, 1)." },
  { id: "P42-b09", lesson: "P4.2", topic: "run_laser_and_plot()", kind: "Práctica", format: "bug", source: "Práctica 4.2",
    prompt: "En la exploración, todos los scans tienen la misma forma (la vista desde el origen) aunque el robot se dibuja en sitios distintos. ¿Qué línea tiene el error?",
    code: ["def run_laser_and_plot(laser, pose, fig, ax, draw_lines = True, color='r'):", "    measurement = laser.take_observation(virtual_map)", "    DrawRobot(fig, ax, pose, axis_percent=0.015, color=color, linewidth=1.5);", "    plot_observations(measurement, pose, fig, ax, draw_lines, color)", "    return fig, ax"],
    answer: 2, fix: "    laser.set_pose(pose); measurement = laser.take_observation(virtual_map)",
    explanation: "Falta laser.set_pose(pose) antes de medir. El láser se creó en el origen y sigue midiendo desde allí; después cada scan se dibuja como si se hubiera tomado desde la pose nueva. Lo mismo pasa si set_pose() va después de take_observation()." },
  { id: "P42-b10", lesson: "P4.2", topic: "Ruido del sensor", kind: "Práctica", format: "bug", source: "Práctica 4.2",
    prompt: "Se quiere un láser con σ_r = 0,1 m y σ_α = 0,01 rad, pero el scan sale mucho más ruidoso de lo esperado. ¿Qué línea está mal?",
    code: ["# we want sigma_r = 0.1 m and sigma_alpha = 0.01 rad", "laser = create_laser_at_origin(FOV = 3 * np.pi/2,", "    resolution = 0.05,", "    max_distance = 10,", "    noise_cov = np.diag([0.1, 0.01]))"],
    answer: 5, fix: "    noise_cov = np.diag([0.1**2, 0.01**2]))",
    explanation: "noise_cov es una matriz de covarianza: su diagonal son varianzas. Laser2D hace np.sqrt(noise_cov[0][0]), así que con diag([0.1, 0.01]) resulta σ_r = 0,316 m y σ_α = 0,1 rad. Lo correcto es diag([0.01, 0.0001])." },
  { id: "P42-b11", lesson: "P4.2", topic: "Imports", kind: "Práctica", format: "bug", source: "Práctica 4.2",
    prompt: "El notebook está en «Chapter 04.Robot sensing/» y la primera celda da «ModuleNotFoundError: No module named 'utils'». ¿Qué línea falla?",
    code: ["import numpy as np", "import matplotlib.pyplot as plt", "import sys", "sys.path.append(\"../..\")", "from utils.laser.laser2D import Laser2D", "from utils.DrawRobot import DrawRobot", "from utils.tcomp import tcomp"],
    answer: 4, fix: "sys.path.append(\"..\")",
    explanation: "utils está en la raíz del repositorio, un nivel por encima de la carpeta del capítulo, así que hay que añadir \"..\". \"../..\" lo usan los notebooks del tema 3, que están en una subcarpeta más (Chapter 03/3.x …/)." },
  { id: "P42-n01", lesson: "P4.2", topic: "Laser2D", kind: "Práctica", format: "numeric", source: "Práctica 4.2",
    prompt: "Laser2D calcula n_beams = floor(FOV/resolution) + 1. En explore_environment() se usa FOV = 3π/2 y resolution = 0,05 rad. ¿Cuántos haces tiene cada observación?",
    answer: 95, tol: 0,
    explanation: "3π/2 = 4,712 rad. 4,712/0,05 = 94,25 → floor = 94 → 94 + 1 = 95 haces. La forma de z es (2, 95)." },
  { id: "P42-n02", lesson: "P4.2", topic: "Medida a global", kind: "Práctica", format: "numeric", source: "Práctica 4.2",
    prompt: "El láser está en pose = [6, 4, π/2]ᵀ y un haz mide distance = 2 m con angle = π/4 rad. ¿Cuál es la coordenada x global del punto observado?",
    answer: 4.586, tol: 0.01, unit: "m",
    explanation: "Local: (2·cos 45°, 2·sin 45°) = (1,414; 1,414). Al componer con θ = 90°: x = 6 + 1,414·cos 90° − 1,414·sin 90° = 6 − 1,414 = 4,586 m (y = 4 + 1,414 + 0 = 5,414 m). Equivale a x + r·cos(θ + α) = 6 + 2·cos 135°." },
  { id: "P42-n03", lesson: "P4.2", topic: "explore_environment()", kind: "Práctica", format: "numeric", source: "Práctica 4.2",
    prompt: "Partiendo de [4, 4, 0]ᵀ, el robot aplica (componiendo) los incrementos [0,0,0], [2,0,0], [2,0,0], [0,2,π/2] y [2,0,0]. ¿Cuál es la coordenada y de la pose final?",
    answer: 8, tol: 0.01, unit: "m",
    explanation: "Poses: (4,4,0) → (4,4,0) → (6,4,0) → (8,4,0) → (8,6,π/2) → el último [2,0,0] avanza 2 m en la dirección del robot (90°), es decir +2 en y → (8, 8, π/2)." },
  { id: "P42-n04", lesson: "P4.2", topic: "Assignment 1", kind: "Práctica", format: "numeric", source: "Práctica 4.2",
    prompt: "En el Assignment 1 el deslizador arranca con FOV = 3π/2 y resolution = 0,2 rad. ¿Cuántos haces mide el láser?",
    answer: 24, tol: 0,
    explanation: "n = ⌊(3π/2)/0,2⌋ + 1 = ⌊23,56⌋ + 1 = 23 + 1 = 24. Como 3π/2 no es múltiplo de 0,2, el último haz no llega a +135°: está en 23·0,2 − 3π/4 ≈ 2,244 rad (≈ 128,6°)." },
  { id: "P42-n05", lesson: "P4.2", topic: "Ángulo de un haz", kind: "Práctica", format: "numeric", source: "Práctica 4.2",
    prompt: "Con FOV = 3π/2 y resolution = 0,2 rad, Laser2D asigna al haz i el ángulo i·resolution − FOV/2 (sin ruido). ¿Qué ángulo, relativo al sensor, tiene el haz i = 10? (rad)",
    answer: -0.356, tol: 0.003, unit: "rad",
    explanation: "α₁₀ = 10·0,2 − 3π/4 = 2 − 2,356 = −0,356 rad (≈ −20,4°). Es relativo al sensor: con θ = π/2, su dirección en el mapa sería −0,356 + 1,571 = 1,215 rad." },
  { id: "P42-n06", lesson: "P4.2", topic: "Medida a global", kind: "Práctica", format: "numeric", source: "Práctica 4.2",
    prompt: "El sensor está en [2, 1, π/6]ᵀ y un punto medido tiene coordenadas locales (x_local, y_local) = (3, 1). ¿Cuál es su x global, tcomp(pose, [3, 1, 0])[0]?",
    answer: 4.098, tol: 0.01, unit: "m",
    explanation: "x = x_s + x_l·cos θ − y_l·sin θ = 2 + 3·0,866 − 1·0,5 = 4,098 m; y = 1 + 3·0,5 + 1·0,866 = 3,366 m. Es la rotación del punto local seguida de la traslación de la pose." },
  { id: "P42-n07", lesson: "P4.2", topic: "Incertidumbre de un punto", kind: "Práctica", format: "numeric", source: "Práctica 4.2",
    prompt: "Un láser tiene σ_r = 0,1 m y σ_α² = 0,001 rad². ¿Cuál es la desviación típica perpendicular al haz (σ⊥) de un punto medido a 5 m?",
    answer: 0.158, tol: 0.003, unit: "m",
    explanation: "σ⊥ = r·σ_α = 5·√0,001 = 5·0,0316 = 0,158 m. A lo largo del haz, σ = σ_r = 0,1 m, sin importar la distancia. Los dos se igualan en r* = σ_r/σ_α = 0,1/0,0316 = 3,16 m; más lejos domina el error angular." },
  { id: "P42-c01", lesson: "P4.2", topic: "Thinking about it", kind: "Práctica", format: "single", source: "Práctica 4.2",
    prompt: "En el láser, ¿por qué el ruido angular suele afectar más que el de distancia a la posición de los puntos lejanos?",
    options: ["Porque el error lateral es ≈ r·σ_α: crece con la distancia, mientras que el error de rango no depende de r", "Porque el ruido de distancia siempre es cero", "Porque el ángulo se mide en grados", "No es cierto: el ruido angular nunca afecta a la posición"],
    answer: 0,
    explanation: "Con el jacobiano polar → cartesiano, la varianza lateral es r²·σ_α². A 10 m, un error de 0,01 rad son ≈ 10 cm, mientras que σ_r es igual a cualquier distancia. Para obtener la incertidumbre de cada punto se propaga J Σ_zp Jᵀ y, si la pose es incierta, se suma J_x Σ_x J_xᵀ, como con los landmarks." },
  // ───────────── P4.3 · Playing with ROS2 ─────────────
  // Comandos, XML y salidas reales de la práctica 4.3 (TurtleBot3 en MVSim, ROS 2 Jazzy).
  { id: "P43-z01", lesson: "P4.3", topic: "Inspeccionar topics", kind: "Práctica", format: "cloze", source: "Práctica 4.3 (Assignment 2)",
    prompt: "Completa los comandos: listar los topics con su tipo, ver un mensaje del láser sin sus arrays largos y medir la frecuencia de la IMU.",
    code: "ros2 topic list {{0}}\nros2 topic echo /laser1 --once {{1}}\nros2 topic {{2}} /imu1",
    blanks: [["-t", "--show-types"], ["--no-arr"], ["hz"]],
    explanation: "-t añade el tipo de mensaje a cada topic. --no-arr oculta los arrays (sale «<sequence type: float, length: 800>») para leer de un vistazo el frame_id y los parámetros. ros2 topic hz mide la frecuencia de publicación; echo solo imprime mensajes." },
  { id: "P43-z02", lesson: "P4.3", topic: "Definición del mensaje", kind: "Práctica", format: "cloze", source: "Práctica 4.3 (Assignment 3)",
    prompt: "Completa: ver la definición del tipo LaserScan con sus comentarios, imprimir solo los alcances de un scan y volcar los parámetros del nodo del simulador.",
    code: "ros2 {{0}} show sensor_msgs/msg/LaserScan\nros2 topic echo /laser1 --once --field {{1}}\nros2 param {{2}} /mvsim",
    blanks: [["interface"], ["ranges"], ["dump"]],
    explanation: "Los tipos de mensaje son interfaces: ros2 interface show. --field ranges imprime solo ese campo (array('f', [...])). ros2 param dump muestra todos los parámetros del nodo, como period_ms_publish_tf o simul_rate." },
  { id: "P43-z03", lesson: "P4.3", topic: "Mundo XML", kind: "Práctica", format: "cloze", source: "Práctica 4.3 (Assignments 1 y 5)",
    prompt: "Completa el mundo: el robot debe llegar sin los sensores de su clase, y el láser propio debe tener σ = 0,10 m y alcance 3 m.",
    code: "<include file=\"../definitions/turtlebot3_burger.vehicle.xml\"\n    {{0}}=\"false\"\n/>\n\n<vehicle name=\"r1\" class=\"turtlebot3_burger\">\n    <init_pose>-2 -0.5 0</init_pose>\n    <include file=\"../definitions/rplidar-a2.sensor.xml\"\n      {{1}}=\"0.10\"\n      {{2}}=\"3.0\"\n      sensor_x=\"-0.032\" sensor_z=\"0.171\" sensor_yaw=\"0\"\n      sensor_name=\"laser1\"\n    />\n</vehicle>",
    blanks: [["default_sensors"], ["sensor_std_noise"], ["max_range"]],
    explanation: "Los atributos de un <include> son argumentos del archivo incluido, que los usa como ${nombre|defecto}. default_sensors va en el de la clase; sensor_std_noise (→ range_std_noise, por defecto 0,01) y max_range (por defecto 16) van en el del sensor. Después hay que relanzar la simulación." },
  { id: "P43-z04", lesson: "P4.3", topic: "tf2", kind: "Práctica", format: "cloze", source: "Práctica 4.3 (Assignment 6)",
    prompt: "Completa: generar el PDF del árbol tf e imprimir la pose del láser expresada en el marco del robot.",
    code: "ros2 run {{0}} view_frames\nros2 run tf2_ros {{1}} {{2}} laser1",
    blanks: [["tf2_tools"], ["tf2_echo"], ["base_link"]],
    explanation: "view_frames está en tf2_tools; tf2_echo, en tf2_ros. tf2_echo A B imprime la pose de B en el marco A: con base_link laser1 sale [-0.032, 0, 0.171], que es el <include> del láser." },
  { id: "P43-b01", lesson: "P4.3", topic: "Comandos de ROS 2", kind: "Práctica", format: "bug", source: "Práctica 4.3 (Assignments 2 y 3)",
    prompt: "Esta secuencia quiere obtener: tipos de los topics, el frame_id de la IMU, la definición de LaserScan y la frecuencia del láser. ¿Qué línea está mal?",
    code: ["ros2 topic list -t", "ros2 topic echo /imu1 --once --no-arr", "ros2 topic show sensor_msgs/msg/LaserScan", "ros2 topic hz /laser1"],
    answer: 3, fix: "ros2 interface show sensor_msgs/msg/LaserScan",
    explanation: "ros2 topic no tiene subcomando show: la definición de un tipo de mensaje se pide con ros2 interface show. topic trabaja con topics en vivo (list, echo, hz, info, pub)." },
  { id: "P43-b02", lesson: "P4.3", topic: "Mundo XML", kind: "Práctica", format: "bug", source: "Práctica 4.3 (Assignment 1)",
    prompt: "Se quiere que el TurtleBot3 llegue sin los sensores de su clase y montarle un láser propio. ¿Qué línea está mal?",
    code: ["<include file=\"../definitions/turtlebot3_burger.vehicle.xml\" />", "<vehicle name=\"r1\" class=\"turtlebot3_burger\" default_sensors=\"false\">", "    <init_pose>-2 -0.5 0</init_pose>", "    <include file=\"../definitions/rplidar-a2.sensor.xml\" sensor_name=\"laser1\" />", "</vehicle>"],
    answer: 2, fix: "<vehicle name=\"r1\" class=\"turtlebot3_burger\">  (y default_sensors=\"false\" en el <include> de la línea 1)",
    explanation: "default_sensors es un argumento de la clase de vehículo, así que va en el <include> de turtlebot3_burger.vehicle.xml. En <vehicle> no tiene efecto y el robot seguiría trayendo láser, cámara e IMU." },
  { id: "P43-b03", lesson: "P4.3", topic: "tf2_echo", kind: "Práctica", format: "bug", source: "Práctica 4.3 (Assignment 6)",
    prompt: "Para comprobar x ⊕ xₛ se necesitan la pose del robot en odom, la del láser sobre el robot y la del láser en odom. ¿Qué línea no da lo que se quiere?",
    code: ["ros2 run tf2_ros tf2_echo odom base_link", "ros2 run tf2_ros tf2_echo laser1 base_link", "ros2 run tf2_ros tf2_echo odom laser1"],
    answer: 2, fix: "ros2 run tf2_ros tf2_echo base_link laser1",
    explanation: "tf2_echo A B da la pose de B en el marco A. Para la pose del láser sobre el robot hay que pedir base_link laser1 → [-0.032, 0, 0.171]. Al revés da la inversa, [0.032, 0, -0.171]: la pose del robot vista desde el láser." },
  { id: "P43-b04", lesson: "P4.3", topic: "Ruido del láser", kind: "Práctica", format: "bug", source: "Práctica 4.3 (Assignment 4)",
    prompt: "Se quiere medir el ruido del láser comparando el mismo haz en varios scans. ¿Qué línea estropea la medida?",
    code: ["ros2 topic pub -r 10 /cmd_vel geometry_msgs/msg/Twist \"{linear: {x: 0.1}}\" &", "ros2 topic echo /laser1 --once --field ranges", "ros2 topic echo /laser1 --once --field ranges", "ros2 topic echo /laser1 --once --field ranges"],
    answer: 1, fix: "No publicar en /cmd_vel: el robot debe estar quieto",
    explanation: "Si el robot se mueve, la distancia real de cada haz cambia entre scans y la variación ya no es solo ruido. Con el robot quieto, el mismo haz varió ±1–2 cm (σ ≈ 0,013 m), coherente con range_std_noise = 0,01 m." },
  { id: "P43-n01", lesson: "P4.3", topic: "LaserScan", kind: "Práctica", format: "numeric", source: "Práctica 4.3 (Assignment 3)",
    prompt: "El láser da angle_min = −π y angle_increment = 0,0078638 rad. ¿Qué índice k de ranges (sin redondear) apunta justo al frente del robot (α = 0)?",
    answer: 399.5, tol: 0.1, unit: "",
    explanation: "α_k = angle_min + k·angle_increment = 0 → k = −angle_min/angle_increment = 3,14159/0,0078638 = 399,5. Ningún haz cae justo en 0°: el 399 apunta a −0,225° y el 400 a +0,225°." },
  { id: "P43-n02", lesson: "P4.3", topic: "LaserScan", kind: "Práctica", format: "numeric", source: "Práctica 4.3 (Assignment 3)",
    prompt: "Con angle_min = −π y angle_increment = 0,0078638 rad, ¿a qué ángulo (en grados) apunta el haz k = 100?",
    answer: -134.94, tol: 0.1, unit: "°",
    explanation: "α₁₀₀ = −3,14159 + 100·0,0078638 = −3,14159 + 0,78638 = −2,35521 rad = −134,94°: detrás y a la derecha. Comprobación: 100 haces de 0,45° son 45°, y −180° + 45° = −135°." },
  { id: "P43-n03", lesson: "P4.3", topic: "LaserScan", kind: "Práctica", format: "numeric", source: "Práctica 4.3 (Assignment 3)",
    prompt: "El RPLIDAR A2 simulado dispara cada 125 µs y su número de haces es nrays = (1/sensor_hz)/125·10⁻⁶. ¿Cuántos haces da por vuelta si sensor_hz = 5?",
    answer: 1600, tol: 0.5, unit: "haces",
    explanation: "Una vuelta dura 1/5 = 0,2 s; 0,2/0,000125 = 1600 haces. A 10 Hz son 800 (los de la práctica). Más haces por vuelta implican girar más despacio: menos scans por segundo." },
  { id: "P43-n04", lesson: "P4.3", topic: "LaserScan", kind: "Práctica", format: "numeric", source: "Práctica 4.3 (Assignment 3)",
    prompt: "Un láser cubre de −π a +π con 800 haces, incluidos los dos extremos. ¿Cuánto vale angle_increment en grados?",
    answer: 0.4506, tol: 0.001, unit: "°",
    explanation: "800 haces son 799 intervalos: 360°/799 = 0,4506° (0,0078638 rad). Dividir entre 800 daría 0,45°, que no coincide con lo que publica el láser. El primer haz (−180°) y el último (+180°) apuntan a la misma dirección." },
  { id: "P43-n05", lesson: "P4.3", topic: "Composición con tf", kind: "Práctica", format: "numeric", source: "Práctica 4.3 (Assignment 6)",
    prompt: "tf2_echo da odom→base_link = [0,350, 0,448] con yaw 1,816 rad, y base_link→laser1 = [−0,032, 0] con yaw 0. ¿Cuál es la y del láser en odom (x ⊕ xₛ)?",
    answer: 0.417, tol: 0.002, unit: "m",
    explanation: "y' = y + x_s·sin θ + y_s·cos θ = 0,448 + (−0,032)·sin(1,816) + 0 = 0,448 − 0,032·0,9701 = 0,448 − 0,031 = 0,417 m. La x es 0,350 + (−0,032)·(−0,2428) = 0,358 y el yaw, 1,816. Coincide con tf2_echo odom laser1." },
  { id: "P43-n06", lesson: "P4.3", topic: "Frecuencias", kind: "Práctica", format: "numeric", source: "Práctica 4.3 (Assignment 2)",
    prompt: "El nodo de MVSim tiene period_ms_publish_tf = 20. ¿A qué frecuencia (Hz) debería publicarse /odom?",
    answer: 50, tol: 0.5, unit: "Hz",
    explanation: "f = 1/T = 1/0,020 s = 50 Hz. Se midieron ~36 Hz porque esa publicación se comprueba en cada vuelta del bucle del simulador (simul_rate = 100 Hz, cada 10 ms), y a veces cae a los 30 ms en vez de a los 20." },
  { id: "P43-n07", lesson: "P4.3", topic: "Landmark con tf", kind: "Práctica", format: "numeric", source: "Práctica 4.3 (opcional)",
    prompt: "Visto desde el láser, un landmark está en (x, y) = (0,932, 0,5) m. ¿Qué índice k de ranges apunta a él (angle_min = −π, angle_increment = 0,0078638 rad)? Redondea al entero.",
    answer: 462, tol: 0.5, unit: "",
    explanation: "α = atan2(0,5, 0,932) = 0,4924 rad (28,2°) y r = √(0,932² + 0,5²) = 1,058 m. k = (0,4924 + 3,14159)/0,0078638 = 462,1 → 462. La lectura de ese haz es algo menor que r, porque el láser choca con la superficie de la columna, no con su centro." },
  { id: "P43-c01", lesson: "P4.3", topic: "range_max", kind: "Práctica", format: "single", source: "Práctica 4.3 (Assignment 5)",
    prompt: "Con max_range = 3 m, 144 de los 800 haces valen exactamente 3.0. ¿Qué significan esas lecturas?",
    options: ["Que no hay nada en esa dirección hasta 3 m: no son obstáculos y hay que descartarlas", "Que hay un obstáculo justo a 3 m", "Que el sensor ha fallado y devuelve inf", "Que son lecturas por debajo de range_min"],
    answer: 0,
    explanation: "Un haz sin obstáculo dentro del alcance devuelve range_max (en MVSim, no inf). Si un algoritmo de mapeo las tomara como impactos, pintaría paredes fantasma en un arco de 3 m alrededor del robot. RViz2 no las dibuja." },
  { id: "P43-c02", lesson: "P4.3", topic: "LaserScan", kind: "Práctica", format: "single", source: "Práctica 4.3 (Thinking about it)",
    prompt: "La clase Laser2D de la 4.2 devolvía pares [r_k, α_k]. ¿Qué gana LaserScan guardando solo los alcances?",
    options: ["La mitad de datos: los ángulos son fijos y equiespaciados, y se deducen de k con angle_min y angle_increment", "Más precisión en los ángulos", "Poder tener haces con ángulos irregulares", "Nada: también guarda los ángulos en intensities"],
    answer: 0,
    explanation: "α_k = angle_min + k·angle_increment. Se envían 800 float32 (3,2 kB) por scan en lugar de 1600 (6,4 kB): a 10 Hz, 32 kB/s en vez de 64. intensities son intensidades de retorno (vacío en este láser)." },
  { id: "P43-c03", lesson: "P4.3", topic: "Árbol tf", kind: "Práctica", format: "single", source: "Práctica 4.3 (Assignment 6)",
    prompt: "En el árbol tf del TurtleBot3, view_frames muestra base_footprint con «Average rate: 10000» y «Most recent transform: 0». ¿Por qué?",
    options: ["Es una transformación estática (/tf_static), válida para cualquier instante", "Se publica 10 000 veces por segundo", "Es un error: el frame no existe", "Es la transformación map → odom"],
    answer: 0,
    explanation: "Las transformaciones fijas se publican una vez en /tf_static y valen para cualquier instante: view_frames las muestra con rate 10000 y stamp 0. El árbol completo es map → odom → base_link → {base_footprint, laser1, imu1}." },
  { id: "P43-c04", lesson: "P4.3", topic: "Frames estándar", kind: "Práctica", format: "single", source: "Práctica 4.3 (Assignment 6)",
    prompt: "¿Qué representa la transformación odom → base_link?",
    options: ["La pose del robot estimada por la odometría: continua, pero con deriva", "La pose del láser sobre el robot", "La corrección de la deriva que publica la localización", "La proyección del robot sobre el suelo"],
    answer: 0,
    explanation: "Es x = [x, y, θ] según las ruedas, en el marco odom, cuyo origen es la pose inicial (por eso empieza en (0, 0, 0) aunque el robot esté en (−2, −0,5) del mundo). La corrección de la deriva es map → odom; base_footprint es la proyección en el suelo." },
  { id: "P43-c05", lesson: "P4.3", topic: "Topics", kind: "Práctica", format: "single", source: "Práctica 4.3 (Assignment 2)",
    prompt: "Tras quitar la cámara, /camera1/image_raw sigue en ros2 topic list. ros2 topic info da Publisher count: 0, Subscription count: 1. ¿Por qué aparece?",
    options: ["Porque RViz2 está suscrito: topic list muestra topics con publicadores o con suscriptores", "Porque la cámara sigue publicando", "Porque MVSim la publica vacía", "Porque topic list muestra todos los topics de la instalación"],
    answer: 0,
    explanation: "Basta un suscriptor para que el topic exista. RViz2 tiene un panel Image suscrito a la cámara, que muestra «No Image» porque nadie publica." },
  // ───────────── P5.2 · EKF Localization ─────────────
  // Código de la solución del notebook 5.2. Valores comprobados con Python.
  { id: "P52-z01", lesson: "P5.2", topic: "Modelo de observación", kind: "Práctica", format: "cloze", source: "Práctica 5.2 (Assignment 1)",
    prompt: "Completa Sensor.observe(): distancia y marcación a cada landmark, en la matriz 2×n.",
    code: "delta = world - from_pose[0:2]\nz = np.empty_like(delta)\nz[0, :] = np.{{0}}(delta[0, :]**2 + delta[1, :]**2)\nz[1, :] = np.{{1}}(delta[1, :], delta[0, :]) - from_pose[{{2}}]",
    blanks: [["sqrt"], ["arctan2"], ["2,0"]],
    explanation: "La distancia es la raíz de la suma de cuadrados. La marcación es arctan2(dy, dx) menos la orientación del robot, from_pose[2, 0], porque se mide desde su frente." },
  { id: "P52-z02", lesson: "P5.2", topic: "Ruido y formato", kind: "Práctica", format: "cloze", source: "Práctica 5.2 (Assignment 1)",
    prompt: "Completa el ruido de la observación y la salida como vector [d_1, θ_1, d_2, θ_2, …]ᵀ.",
    code: "if noisy:\n    z += np.{{0}}(self.cov)@random.{{1}}(2, world.shape[{{2}}])\n\nif flatten:\n    return np.vstack(z.flatten({{3}}))",
    blanks: [["sqrt"], ["randn"], ["1"], ["'F'"]],
    explanation: "randn da gaussianas de σ = 1; se escalan con la raíz de la covarianza. Los landmarks están en columnas, así que su número es shape[1]. flatten('F') recorre por columnas e intercala distancia y marcación." },
  { id: "P52-z03", lesson: "P5.2", topic: "Movimiento", kind: "Práctica", format: "cloze", source: "Práctica 5.2 (Assignment 2)",
    prompt: "Completa Robot.step(): la pose real debe acumular el ruido del movimiento.",
    code: "self.pose = tcomp(self.pose, u)\nnoise = np.sqrt(self.cov_move)@random.randn(3, 1)\nnoisy_u = {{0}}\nself.true_pose = tcomp({{1}}, noisy_u)",
    blanks: [["u+noise", "noise+u"], ["self.true_pose"]],
    explanation: "El ruido se suma al comando, porque está en el marco del robot, y se compone sobre la pose real anterior. Sobre self.pose el error no se acumularía." },
  { id: "P52-z04", lesson: "P5.2", topic: "Jacobiano de observación", kind: "Práctica", format: "cloze", source: "Práctica 5.2 (Assignment 3)",
    prompt: "Completa el bloque de getObsJac() para una observación.",
    code: "jH[ii:ii+2,:] = [\n    [-dx/d, {{0}}, 0],\n    [{{1}}, -dx/d2, {{2}}]\n]",
    blanks: [["-dy/d"], ["dy/d2"], ["-1"]],
    explanation: "Fila de la distancia: −dx/d, −dy/d, 0. Fila de la marcación: dy/d², −dx/d², −1. Girar +1 rad hace que el landmark se vea 1 rad más a la derecha, de ahí el −1." },
  { id: "P52-z05", lesson: "P5.2", topic: "Predicción EKF", kind: "Práctica", format: "cloze", source: "Práctica 5.2 (Assignment 4)",
    prompt: "Completa la predicción del EKF.",
    code: "xPred = tcomp({{0}}, {{1}})\nG = J1(robot.xEst, u)\nj2 = J2(robot.xEst, u)\nPPred = G@robot.PEst@{{2}} + j2@{{3}}@j2.T",
    blanks: [["robot.xEst"], ["u"], ["G.T"], ["robot.cov_move"]],
    explanation: "Se parte de la estimación anterior y del comando sin ruido. La covarianza propaga la anterior con G y añade la del comando, girada al mundo con j2." },
  { id: "P52-z06", lesson: "P5.2", topic: "Corrección EKF", kind: "Práctica", format: "cloze", source: "Práctica 5.2 (Assignment 4)",
    prompt: "Completa la corrección del EKF.",
    code: "H = getObsJac(xPred, landmark, Map)\nQ_t = np.kron(np.eye(landmark.shape[0]), sensor.cov)\nK = PPred@H.T@linalg.{{0}}(H@PPred@H.T + Q_t)\ninnovation = z - sensor.observe({{1}}, Map[:, landmark], noisy={{2}})\ninnovation[1::2] = AngleWrapList(innovation[1::2])\nxEst = xPred + K@innovation\nPEst = (np.eye(3) - {{3}})@PPred",
    blanks: [["inv"], ["xPred"], ["False"], ["K@H"]],
    explanation: "Ganancia con la inversa de la covarianza de la innovación. La medida esperada se calcula desde la pose predicha y sin ruido. La covarianza se reduce con (I − KH)." },
  { id: "P52-z07", lesson: "P5.2", topic: "Sensor FOV", kind: "Práctica", format: "cloze", source: "Práctica 5.2 (Assignment 5)",
    prompt: "Completa el filtrado de landmarks por alcance y campo de visión.",
    code: "z = self.observe(from_pose, world, False, False)\nangle_limit = self.fov/{{0}}\nfeats_idx = np.{{1}}(np.asarray((z[0, :] < self.max_range) {{2}} (np.{{3}}(z[1, :]) < angle_limit)))[{{4}}]",
    blanks: [["2"], ["nonzero"], ["&"], ["abs"], ["0"]],
    explanation: "El FOV es el ángulo total, así que el límite es fov/2. & combina arrays elemento a elemento. abs admite landmarks a ambos lados. nonzero devuelve una tupla: [0] extrae los índices." },
  { id: "P52-b01", lesson: "P5.2", topic: "Modelo de observación", kind: "Práctica", format: "bug", source: "Práctica 5.2 (Assignment 1)",
    prompt: "Esta función calcula distancia y marcación desde el robot. ¿Qué línea está mal?",
    code: ["delta = world - from_pose[0:2]", "z = np.empty_like(delta)", "z[0, :] = np.sqrt(delta[0, :]**2 + delta[1, :]**2)", "z[1, :] = np.arctan2(delta[0, :], delta[1, :]) - from_pose[2, 0]", "z[1, :] = AngleWrapList(z[1, :])"],
    answer: 4, fix: "z[1, :] = np.arctan2(delta[1, :], delta[0, :]) - from_pose[2, 0]",
    explanation: "arctan2 recibe primero dy y después dx. Con los argumentos cambiados, el ángulo se mediría desde el eje y." },
  { id: "P52-b02", lesson: "P5.2", topic: "Landmark aleatorio", kind: "Práctica", format: "bug", source: "Práctica 5.2 (Assignment 1)",
    prompt: "random_observation() elige un landmark al azar y lo observa. ¿Qué línea está mal?",
    code: ["n_landmarks = world.shape[1]", "rand_idx = random.randint(0, n_landmarks)", "world = world[:, rand_idx]", "z = self.observe(from_pose, world, noisy)", "return z, np.array([rand_idx])"],
    answer: 3, fix: "world = world[:, [rand_idx]]",
    explanation: "Sin los corchetes interiores, world pasa a tener forma (2,) y observe() no puede tratarlo: espera una matriz 2×n, con n = 1." },
  { id: "P52-b03", lesson: "P5.2", topic: "Movimiento", kind: "Práctica", format: "bug", source: "Práctica 5.2 (Assignment 2)",
    prompt: "Robot.step() debe hacer que la pose real acumule ruido. ¿Qué línea está mal?",
    code: ["self.pose = tcomp(self.pose, u)", "noise = np.sqrt(self.cov_move)@random.randn(3, 1)", "noisy_u = u + noise", "self.true_pose = tcomp(self.pose, noisy_u)"],
    answer: 4, fix: "self.true_pose = tcomp(self.true_pose, noisy_u)",
    explanation: "Al componer sobre la pose ideal, la real volvería cada vez a la ideal más un solo ruido, y el error nunca se acumularía." },
  { id: "P52-b04", lesson: "P5.2", topic: "Jacobiano de observación", kind: "Práctica", format: "bug", source: "Práctica 5.2 (Assignment 3)",
    prompt: "En getObsJac() se han observado los landmarks 0 y 2 (lm = [0, 2]). ¿Qué línea está mal?",
    code: ["for i in range(n_land):", "    dx = Map[0, i] - xPred[0, 0]", "    dy = Map[1, lm[i]] - xPred[1, 0]", "    d = np.sqrt(dx**2 + dy**2)", "    d2 = d**2"],
    answer: 2, fix: "dx = Map[0, lm[i]] - xPred[0, 0]",
    explanation: "i es el número de observación; lm[i], el índice del landmark en el mapa. En la segunda vuelta i = 1, pero el landmark observado es el 2." },
  { id: "P52-b05", lesson: "P5.2", topic: "Predicción EKF", kind: "Práctica", format: "bug", source: "Práctica 5.2 (Assignment 4)",
    prompt: "Predicción del EKF. ¿Qué línea está mal?",
    code: ["xPred = tcomp(robot.true_pose, u)", "G = J1(robot.xEst, u)", "j2 = J2(robot.xEst, u)", "PPred = G@robot.PEst@G.T + j2@robot.cov_move@j2.T"],
    answer: 1, fix: "xPred = tcomp(robot.xEst, u)",
    explanation: "El filtro no conoce la pose real: si la usara, no habría nada que estimar. Predice desde su estimación anterior, robot.xEst." },
  { id: "P52-b06", lesson: "P5.2", topic: "Predicción EKF", kind: "Práctica", format: "bug", source: "Práctica 5.2 (Assignment 4)",
    prompt: "El ruido del comando está en el marco del robot. ¿Qué línea está mal?",
    code: ["xPred = tcomp(robot.xEst, u)", "G = J1(robot.xEst, u)", "j2 = J2(robot.xEst, u)", "PPred = G@robot.PEst@G.T + robot.cov_move"],
    answer: 4, fix: "PPred = G@robot.PEst@G.T + j2@robot.cov_move@j2.T",
    explanation: "R_t = J2 Σu J2ᵀ: hay que llevar la covarianza del comando del marco del robot al del mundo. j2 se calculaba y no se usaba, lo que ya es una pista." },
  { id: "P52-b07", lesson: "P5.2", topic: "Corrección EKF", kind: "Práctica", format: "bug", source: "Práctica 5.2 (Assignment 4)",
    prompt: "Corrección del EKF. ¿Qué línea está mal?",
    code: ["H = getObsJac(xPred, landmark, Map)", "Q_t = np.kron(np.eye(landmark.shape[0]), sensor.cov)", "K = PPred@H.T@linalg.inv(H@PPred@H.T + Q_t)", "innovation = z - sensor.observe(xPred, Map[:, landmark])", "xEst = xPred + K@innovation", "PEst = (np.eye(3) - K@H)@PPred"],
    answer: 4, fix: "innovation = z - sensor.observe(xPred, Map[:, landmark], noisy=False)",
    explanation: "noisy vale True por defecto, y la medida esperada h(μ̄) no lleva ruido. La línea no da error, por eso es fácil pasarla por alto: el filtro corregiría con una innovación con ruido inventado." },
  { id: "P52-b08", lesson: "P5.2", topic: "Corrección EKF", kind: "Práctica", format: "bug", source: "Práctica 5.2 (Assignment 4)",
    prompt: "Corrección del EKF. ¿Qué línea está mal?",
    code: ["H = getObsJac(xPred, landmark, Map)", "K = PPred@H.T@linalg.inv(H@PPred@H.T + Q_t)", "xEst = xPred + K@innovation", "PEst = (np.eye(3) - K@H)@robot.PEst"],
    answer: 4, fix: "PEst = (np.eye(3) - K@H)@PPred",
    explanation: "Se corrige la covarianza predicha, Σ̄. Con robot.PEst se perdería lo ganado o añadido en la predicción." },
  { id: "P52-b09", lesson: "P5.2", topic: "Sensor FOV", kind: "Práctica", format: "bug", source: "Práctica 5.2 (Assignment 5)",
    prompt: "fov = π/2 y el sensor debe ver solo los landmarks a ±45°. ¿Qué línea está mal?",
    code: ["z = self.observe(from_pose, world, False, False)", "angle_limit = self.fov", "feats_idx = np.nonzero(np.asarray((z[0, :] < self.max_range) & (np.abs(z[1, :]) < angle_limit)))[0]", "z = z[:, feats_idx]"],
    answer: 2, fix: "angle_limit = self.fov/2",
    explanation: "fov es el ángulo total, 2α. El límite a cada lado es la mitad." },
  { id: "P52-n01", lesson: "P5.2", topic: "Ganancia de Kalman", kind: "Práctica", format: "numeric", source: "Práctica 5.2 (teoría del notebook)",
    prompt: "En 1D, con H = 1, la predicción tiene varianza 4 m² y el sensor, Q = 1 m². ¿Cuánto vale K?",
    answer: 0.8, tol: 0.001, unit: "",
    explanation: "K = σ̄²/(σ̄² + Q) = 4/(4 + 1) = 0,8. El sensor es 4 veces más preciso que la predicción, así que se le hace mucho caso." },
  { id: "P52-n02", lesson: "P5.2", topic: "Corrección", kind: "Práctica", format: "numeric", source: "Práctica 5.2 (teoría del notebook)",
    prompt: "En 1D, con H = 1: μ̄ = 10 m, K = 0,8 y el sensor mide z = 12 m. ¿Cuánto vale la media corregida?",
    answer: 11.6, tol: 0.01, unit: "m",
    explanation: "μ = μ̄ + K(z − μ̄) = 10 + 0,8·(12 − 10) = 10 + 1,6 = 11,6 m." },
  { id: "P52-n03", lesson: "P5.2", topic: "Corrección", kind: "Práctica", format: "numeric", source: "Práctica 5.2 (teoría del notebook)",
    prompt: "En 1D, con H = 1: σ̄² = 4 m² y K = 0,8. ¿Cuánto vale la varianza corregida?",
    answer: 0.8, tol: 0.001, unit: "m²",
    explanation: "σ² = (1 − K)·σ̄² = 0,2·4 = 0,8 m². Queda por debajo de la varianza de la predicción (4) y de la del sensor (1)." },
  { id: "P52-n04", lesson: "P5.2", topic: "Dimensiones", kind: "Práctica", format: "numeric", source: "Práctica 5.2 (Thinking about it)",
    prompt: "El robot observa 4 landmarks a la vez. ¿Cuántas filas tiene H_t?",
    answer: 8, tol: 0, unit: "filas",
    explanation: "2 filas por landmark (distancia y marcación): 2·4 = 8. H_t es de 8×3 y K_t, de 3×8." },
  { id: "P52-n05", lesson: "P5.2", topic: "Innovación", kind: "Práctica", format: "numeric", source: "Práctica 5.2 (Assignment 4)",
    prompt: "La marcación esperada es 3,10 rad y la medida, −3,10 rad. ¿Cuánto vale la innovación de la marcación tras normalizarla a [−π, π]?",
    answer: 0.0832, tol: 0.001, unit: "rad",
    explanation: "−3,10 − 3,10 = −6,20 rad, que está fuera del intervalo. Sumando 2π: −6,20 + 6,2832 = 0,0832 rad. Sin normalizar, el filtro creería que hay casi una vuelta de error." },
  { id: "P52-n06", lesson: "P5.2", topic: "Modelo de observación", kind: "Práctica", format: "numeric", source: "Práctica 5.2 (Assignment 1)",
    prompt: "Robot en [1, 2, π/2]ᵀ y landmark en (4, 6). ¿Qué marcación se espera medir, en radianes?",
    answer: -0.6435, tol: 0.001, unit: "rad",
    explanation: "atan2(6 − 2, 4 − 1) − π/2 = atan2(4, 3) − π/2 = 0,9273 − 1,5708 = −0,6435 rad: el landmark queda a la derecha del robot." },
  { id: "P52-n07", lesson: "P5.2", topic: "Jacobiano de observación", kind: "Práctica", format: "numeric", source: "Práctica 5.2 (Assignment 3)",
    prompt: "Con dx = 3 y dy = 4, ¿cuánto vale el elemento de H en la fila 2, columna 1 (∂θ/∂x)?",
    answer: 0.16, tol: 0.001, unit: "",
    explanation: "d² = 3² + 4² = 25, y el elemento es dy/d² = 4/25 = 0,16." },
  { id: "P52-n08", lesson: "P5.2", topic: "Predicción", kind: "Práctica", format: "numeric", source: "Práctica 5.2 (Assignment 4)",
    prompt: "Robot en [0, 0, 0]ᵀ, u = [1, 0, 0]ᵀ, Σ = diag(0,01; 0,01; 0,04) y Σu = diag(0,02; 0,02; 0,01). ¿Cuánto vale la varianza predicha en y, Σ̄(2,2)?",
    answer: 0.07, tol: 0.001, unit: "m²",
    explanation: "G tiene un 1 en la fila 2, columna 3, porque u_x·cos θ = 1. Entonces, (GΣGᵀ)(2,2) = 0,01 + 1²·0,04 = 0,05. Con J2 = I se suma 0,02: total 0,07. Es el efecto palanca: el error de orientación se convierte en error lateral." },
  { id: "P52-n09", lesson: "P5.2", topic: "Corrección", kind: "Práctica", format: "numeric", source: "Práctica 5.2 (Assignment 4)",
    prompt: "Pose predicha [0, 0, 0]ᵀ, σ̄ₓ² = 0,25, landmark en (10, 0) y σ_d² = 0,04. El sensor mide d = 10,5 m. Las variables no están correladas. ¿Cuánto se corrige x (con signo)?",
    answer: -0.431, tol: 0.002, unit: "m",
    explanation: "H(1,1) = −dx/d = −1. S = 0,25 + 0,04 = 0,29, y K = 0,25·(−1)/0,29 = −0,862. Innovación: 10,5 − 10 = 0,5 m. Corrección: −0,862·0,5 = −0,431 m. Se ve el landmark más lejos de lo esperado, así que el robot debe de estar más atrás." },
  { id: "P52-n10", lesson: "P5.2", topic: "Incertidumbre", kind: "Práctica", format: "numeric", source: "Práctica 5.2 (Playing with EKF)",
    prompt: "Marcación con σ_θ = 0,7 rad y landmark a 30 m. ¿Qué error lateral produce, de forma aproximada?",
    answer: 21, tol: 0.1, unit: "m",
    explanation: "Error lateral ≈ d·σ_θ = 30·0,7 = 21 m. Por eso una sola observación corrige sobre todo a lo largo del rayo, y las elipses se alargan en perpendicular." },
  { id: "P52-c01", lesson: "P5.2", topic: "Quién es quién", kind: "Práctica", format: "single", source: "Práctica 5.2 (main)",
    prompt: "En main(), ¿desde qué pose mide el sensor?",
    options: ["robot.pose, la pose ideal", "robot.xEst, la pose estimada", "robot.true_pose, la pose real", "xPred, la pose predicha"],
    answer: 2,
    explanation: "Un sensor real mide desde donde está el robot de verdad: sensor.random_observation(robot.true_pose, Map). El filtro nunca recibe esa pose, solo la medida z." },
  { id: "P52-c02", lesson: "P5.2", topic: "Quién es quién", kind: "Práctica", format: "single", source: "Práctica 5.2 (Assignment 4)",
    prompt: "¿En qué pose se evalúa el jacobiano H_t?",
    options: ["En robot.xEst, igual que G", "En xPred, la pose predicha", "En robot.true_pose", "En robot.pose"],
    answer: 1,
    explanation: "H_t se evalúa en μ̄_t (xPred), porque es desde ahí desde donde se predice la medida. G y J2 se evalúan en el punto de partida, μ_{t-1} (robot.xEst)." },
  { id: "P52-c03", lesson: "P5.2", topic: "Ganancia de Kalman", kind: "Práctica", format: "single", source: "Práctica 5.2 (teoría del notebook)",
    prompt: "Si aumenta la varianza del sensor, Q_t, ¿qué le pasa a la ganancia y a la corrección?",
    options: ["K baja: el filtro se fía menos de la medida y corrige menos", "K sube: hace falta corregir más", "K no cambia, solo depende de la predicción", "K baja, pero la incertidumbre se reduce más"],
    answer: 0,
    explanation: "K = Σ̄Hᵀ(HΣ̄Hᵀ + Q)⁻¹: Q está en la parte que se invierte, así que al crecer reduce K. Con menos ganancia, la corrección de la pose y la reducción de la incertidumbre son menores." },
  { id: "P52-c04", lesson: "P5.2", topic: "Sin observaciones", kind: "Práctica", format: "single", source: "Práctica 5.2 (Thinking about it)",
    prompt: "¿Qué hace EKFLocalization() cuando ningún landmark entra en el FOV?",
    options: ["Da error, porque H queda vacía", "Mantiene la pose y la incertidumbre del paso anterior", "Solo predice: xEst = xPred y PEst = PPred, y la incertidumbre crece", "Vuelve a la pose ideal y reinicia la covarianza"],
    answer: 2,
    explanation: "Sin landmarks se salta la corrección. El robot se mueve, así que sí hay predicción: la pose avanza con el comando y la incertidumbre crece. Sigue funcionando, a diferencia de mínimos cuadrados, que no tendría ecuaciones." },
  { id: "P52-c05", lesson: "P5.2", topic: "Normalización", kind: "Práctica", format: "single", source: "Práctica 5.2 (Assignment 4)",
    prompt: "¿Por qué se aplica AngleWrapList a innovation[1::2]?",
    options: ["Porque la resta de dos marcaciones puede salirse de [−π, π] y parecer un error enorme", "Porque las distancias pueden salir negativas", "Porque K solo admite valores entre 0 y 1", "Porque convierte los grados en radianes"],
    answer: 0,
    explanation: "Las posiciones 1, 3, 5… de z son marcaciones. Dos direcciones casi iguales a cada lado de ±π (3,10 y −3,10 rad) restan −6,20 rad, cuando la diferencia real es de 0,083 rad." },
  { id: "P52-c06", lesson: "P5.2", topic: "Sensor FOV", kind: "Práctica", format: "single", source: "Práctica 5.2 (Assignment 5)",
    prompt: "¿Por qué observe_in_fov() decide qué landmarks se ven con la medida SIN ruido?",
    options: ["Porque es más rápido", "Porque estar o no en el FOV depende de la geometría, y el ruido no debe cambiar qué se ve", "Porque el ruido solo afecta a la distancia", "Porque observe() no admite ruido con flatten=False"],
    answer: 1,
    explanation: "Si se filtrara con la medida ruidosa, con σ_θ = 0,7 rad un landmark muy fuera del FOV podría pasar el filtro. Primero se decide con la geometría y después se devuelve la medida con ruido." },
  { id: "P52-c07", lesson: "P5.2", topic: "Incertidumbre", kind: "Práctica", format: "single", source: "Práctica 5.2 (Playing with EKF)",
    prompt: "Con σ_d = 1 m y σ_θ = 0,7 rad, ¿cómo salen las elipses tras observar un único landmark lejano?",
    options: ["Circulares", "Alargadas a lo largo del rayo hacia el landmark", "Alargadas en perpendicular al rayo hacia el landmark", "Sin tamaño: la observación elimina la incertidumbre"],
    answer: 2,
    explanation: "La distancia es precisa y fija la pose a lo largo del rayo. La marcación es mala: a 30 m son unos 21 m de error lateral, así que queda mucha libertad en perpendicular." },
  { id: "P52-c08", lesson: "P5.2", topic: "Nombres del notebook", kind: "Práctica", format: "single", source: "Práctica 5.2 (celda de ejecución)",
    prompt: "En las celdas de ejecución, R = np.diag([SigmaX**2, SigmaY**2, SigmaTheta**2]). ¿Qué es en la teoría?",
    options: ["R_t, ya en el marco del mundo", "Σ_u, la covarianza del comando en el marco del robot", "Q_t, la covarianza del sensor", "Σ_t, la covarianza de la pose"],
    answer: 1,
    explanation: "Se guarda en robot.cov_move y es Σ_u. La R_t de la teoría es esa matriz girada al mundo: R_t = J2 Σ_u J2ᵀ." },
  { id: "P52-c09", lesson: "P5.2", topic: "Tipos de localización", kind: "Práctica", format: "single", source: "Notebook 5.0",
    prompt: "Un robot cree saber dónde está, pero alguien lo ha movido sin que lo detecte. ¿Qué problema es?",
    options: ["Position tracking", "Global localization", "Kidnapped robot", "Mapping"],
    answer: 2,
    explanation: "Kidnapped robot: hay que detectar el error y volver a localizarse. En position tracking la pose inicial se conoce de forma aproximada; en global localization, no se conoce y el robot lo sabe." },
  { id: "P52-c10", lesson: "P5.2", topic: "Tipos de localización", kind: "Práctica", format: "single", source: "Notebooks 5.0 y 5.2",
    prompt: "¿Qué problema de localización resuelve el EKF de la práctica 5.2?",
    options: ["Global localization, porque usa un mapa de landmarks", "Position tracking, porque arranca con la pose inicial conocida", "Kidnapped robot, porque corrige con el sensor", "Los tres por igual"],
    answer: 1,
    explanation: "El robot arranca con xEst = true_pose y PEst = 0. Una sola gaussiana representa una hipótesis de pose, que es adecuada para seguirla, no para buscarla desde cero." },
];

const lessonNames = { L4: "L4 · Percepción", L5: "L5 · Localización", "P4.1": "Práctica 4.1 · Landmarks", "P4.2": "Práctica 4.2 · Láser", "P4.3": "Práctica 4.3 · ROS 2", "P5.2": "Práctica 5.2 · EKF" };
const lessonOrder = ["L4", "L5", "P4.1", "P4.2", "P4.3", "P5.2"];
const formatNames = { single: "Test", multi: "Test múltiple", numeric: "Cálculo", cloze: "Rellenar código", bug: "Encontrar el error" };

// ───────────── Corrección (funciones puras, probadas con Node) ─────────────
function parseNumber(text) {
  const clean = String(text ?? "").trim().replace(/[−–]/g, "-").replace(/\s+/g, "").replace(",", ".");
  const match = clean.match(/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?/i);
  return match ? Number(match[0]) : NaN;
}

function numericTolerance(q) {
  if (typeof q.tol === "number") return q.tol;
  return Math.abs(q.answer) * (typeof q.tolRel === "number" ? q.tolRel : 0.01);
}

function checkNumeric(q, text) {
  const value = parseNumber(text);
  return Number.isFinite(value) && Math.abs(value - q.answer) <= numericTolerance(q) + 1e-12;
}

const normalizeCode = (text) => String(text ?? "").replace(/\s+/g, "").replace(/"/g, "'");

function checkCloze(q, values) {
  return q.blanks.map((accepted, i) => accepted.some((option) => normalizeCode(option) === normalizeCode(values[i])));
}

function checkChoice(q, selected) {
  const answer = Array.isArray(q.answer) ? q.answer : [q.answer];
  return selected.length === answer.length && selected.every((index) => answer.includes(index));
}

function checkBug(q, line) {
  return line === q.answer;
}

function grade(q, response) {
  switch (q.format) {
    case "numeric": return checkNumeric(q, response.value);
    case "cloze": return checkCloze(q, response.values).every(Boolean);
    case "bug": return checkBug(q, response.line);
    default: return checkChoice(q, response.selected);
  }
}

if (typeof document === "undefined") {
  module.exports = { questions, parseNumber, checkNumeric, checkCloze, checkChoice, checkBug, grade, normalizeCode };
} else {
  initQuiz();
}

// ───────────── Interfaz ─────────────
function initQuiz() {
  const storageKey = "robotica-practica-parcial2-v1";
  let progress = {};
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
    progress = saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
  } catch { progress = {}; }
  let session = [];
  let responses = {};
  let current = 0;

  const $ = (selector) => document.querySelector(selector);
  const filters = { lesson: $("#lesson-filter"), kind: $("#kind-filter"), mode: $("#mode-filter") };
  const query = new URLSearchParams(window.location.search);
  for (const name of ["lesson", "kind"]) {
    const value = query.get(name);
    if (value && [...filters[name].options].some((option) => option.value === value)) filters[name].value = value;
  }
  const shuffle = (items) => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };
  const addText = (tag, text, className) => {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  const answerList = (q) => (Array.isArray(q.answer) ? q.answer : [q.answer]);
  const formatNumber = (value) => String(value).replace(".", ",");

  function updateStats() {
    const seen = questions.filter((q) => progress[q.id]?.tries).length;
    const mastered = questions.filter((q) => progress[q.id]?.lastCorrect).length;
    $("#bank-size").textContent = String(questions.length);
    $("#done-count").textContent = `${seen} / ${questions.length}`;
    $("#mastered-count").textContent = `${mastered} / ${questions.length}`;
    $("#progress-fill").style.width = `${(mastered / questions.length) * 100}%`;
    for (const lesson of lessonOrder) {
      const el = $(`#count-${lesson.replace(".", "-")}`);
      if (!el) continue;
      const items = questions.filter((q) => q.lesson === lesson);
      el.textContent = `${items.filter((q) => progress[q.id]?.lastCorrect).length}/${items.length} dominadas`;
    }
    updateAvailable();
  }

  function availableQuestions() {
    return questions.filter((q) => {
      if (filters.lesson.value !== "all" && q.lesson !== filters.lesson.value) return false;
      const kind = filters.kind.value;
      if (kind === "Teoría" && q.kind !== "Teoría") return false;
      if (kind === "Práctica" && q.kind !== "Práctica") return false;
      if (kind === "calc" && q.format !== "numeric") return false;
      if (kind === "code" && q.format !== "cloze" && q.format !== "bug") return false;
      if (kind === "concept" && q.format !== "single" && q.format !== "multi") return false;
      if (filters.mode.value === "wrong" && (!progress[q.id]?.tries || progress[q.id]?.lastCorrect)) return false;
      if (filters.mode.value === "unseen" && progress[q.id]?.tries) return false;
      return true;
    });
  }

  function updateAvailable() {
    $("#available").textContent = `${availableQuestions().length} preguntas disponibles con estos filtros`;
  }

  function buildSession() {
    const pool = availableQuestions();
    if (!pool.length) {
      $("#filter-error").textContent = "No hay preguntas con esos filtros. Prueba a cambiar la lección, el tipo o el modo.";
      return;
    }
    $("#filter-error").textContent = "";
    if ($("#session-size").value === "all" || pool.length <= 20) {
      session = shuffle(pool);
    } else {
      // Simulacro: 12 de teoría (mitad cálculos) y 8 de prácticas, completando con lo que haya.
      const theory = pool.filter((q) => q.kind === "Teoría");
      const taken = new Set([
        ...shuffle(theory.filter((q) => q.format === "numeric")).slice(0, 6),
        ...shuffle(theory.filter((q) => q.format !== "numeric")).slice(0, 6),
        ...shuffle(pool.filter((q) => q.kind === "Práctica")).slice(0, 8),
      ]);
      session = shuffle([...taken, ...shuffle(pool.filter((q) => !taken.has(q))).slice(0, Math.max(0, 20 - taken.size))]);
    }
    responses = {};
    current = 0;
    $("#quiz").hidden = false;
    $("#result").hidden = true;
    showQuestion();
    $("#quiz").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderChoice(q, saved, container) {
    const answer = answerList(q);
    q.options.forEach((option, index) => {
      const label = document.createElement("label");
      label.className = "option";
      const input = document.createElement("input");
      input.type = answer.length > 1 ? "checkbox" : "radio";
      input.name = "choice";
      input.value = String(index);
      input.checked = !!saved?.selected.includes(index);
      input.disabled = !!saved;
      label.append(input, addText("span", `${String.fromCharCode(65 + index)}.`, "option-letter"), addText("span", option));
      if (saved) {
        if (answer.includes(index)) label.classList.add("correct-option");
        else if (saved.selected.includes(index)) label.classList.add("wrong-option");
      }
      container.append(label);
    });
  }

  function renderNumeric(q, saved, container) {
    const wrap = document.createElement("div");
    wrap.className = "numeric-wrap";
    const input = document.createElement("input");
    input.type = "text";
    input.inputMode = "decimal";
    input.autocomplete = "off";
    input.id = "numeric-answer";
    input.className = "numeric-input";
    input.placeholder = "Tu resultado";
    input.setAttribute("aria-label", "Resultado numérico");
    if (saved) {
      input.value = saved.value;
      input.disabled = true;
      input.classList.add(saved.correct ? "is-right" : "is-wrong");
    }
    input.addEventListener("keydown", (event) => { if (event.key === "Enter") checkAnswer(); });
    wrap.append(input);
    if (q.unit) wrap.append(addText("span", q.unit, "unit"));
    container.append(wrap);
  }

  function renderCloze(q, saved, container) {
    const pre = document.createElement("pre");
    pre.className = "code-block cloze";
    const results = saved ? checkCloze(q, saved.values) : [];
    q.code.split(/(\{\{\d+\}\})/).forEach((part) => {
      const blank = part.match(/^\{\{(\d+)\}\}$/);
      if (!blank) { pre.append(document.createTextNode(part)); return; }
      const i = Number(blank[1]);
      const input = document.createElement("input");
      input.type = "text";
      input.className = "cloze-input";
      input.dataset.blank = String(i);
      input.autocomplete = "off";
      input.spellcheck = false;
      input.setAttribute("autocapitalize", "off");
      input.setAttribute("aria-label", `Hueco ${i + 1}`);
      input.style.width = `${Math.max(4, ...q.blanks[i].map((option) => option.length)) + 2}ch`;
      if (saved) {
        input.value = saved.values[i] ?? "";
        input.disabled = true;
        input.classList.add(results[i] ? "is-right" : "is-wrong");
      }
      pre.append(input);
    });
    container.append(pre);
  }

  function renderBug(q, saved, container) {
    const list = document.createElement("ol");
    list.className = "code-block bug-lines";
    q.code.forEach((line, index) => {
      const number = index + 1;
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "bug-line";
      button.dataset.line = String(number);
      button.append(addText("span", String(number), "line-number"), addText("code", line || " "));
      button.setAttribute("aria-pressed", String(saved?.line === number));
      if (saved) {
        button.disabled = true;
        if (number === q.answer) button.classList.add("correct-line");
        else if (number === saved.line) button.classList.add("wrong-line");
      } else {
        button.addEventListener("click", () => {
          list.querySelectorAll(".bug-line").forEach((other) => other.setAttribute("aria-pressed", "false"));
          button.setAttribute("aria-pressed", "true");
          $("#choice-error").textContent = "";
        });
      }
      item.append(button);
      list.append(item);
    });
    container.append(list);
  }

  function hintFor(q) {
    switch (q.format) {
      case "numeric": return `Escribe el resultado (coma o punto decimal)${q.unit ? ` en ${q.unit}` : ""}. Se acepta ±${formatNumber(numericTolerance(q))}.`;
      case "cloze": return "Rellena los huecos con el código que falta. Los espacios no cuentan.";
      case "bug": return "Pulsa la línea que contiene el error.";
      case "multi": return "Marca todas las respuestas correctas.";
      default: return "Elige una respuesta.";
    }
  }

  function correctAnswerText(q) {
    switch (q.format) {
      case "numeric": return `Respuesta correcta: ${formatNumber(q.answer)}${q.unit ? ` ${q.unit}` : ""}.`;
      case "cloze": return `Huecos: ${q.blanks.map((accepted, i) => `(${i + 1}) ${accepted[0]}`).join(" · ")}`;
      case "bug": return `El error está en la línea ${q.answer}.`;
      default: return `Respuesta correcta: ${answerList(q).map((i) => String.fromCharCode(65 + i)).join(", ")}.`;
    }
  }

  function showQuestion() {
    if (current >= session.length) {
      showResult();
      return;
    }
    const q = session[current];
    const saved = responses[q.id];
    $("#choice-error").textContent = "";
    $("#question-number").textContent = `Pregunta ${current + 1} de ${session.length}`;
    $("#quiz-progress").style.width = `${((current + 1) / session.length) * 100}%`;
    $("#question-meta").textContent = `${lessonNames[q.lesson]} · ${q.topic} · ${formatNames[q.format]} · ${q.source}`;
    $("#question-title").textContent = q.prompt;
    $("#answer-hint").textContent = hintFor(q);
    const options = $("#options");
    options.replaceChildren();
    options.className = `options format-${q.format}`;
    if (q.format === "numeric") renderNumeric(q, saved, options);
    else if (q.format === "cloze") renderCloze(q, saved, options);
    else if (q.format === "bug") renderBug(q, saved, options);
    else renderChoice(q, saved, options);

    const feedback = $("#feedback");
    feedback.hidden = !saved;
    feedback.replaceChildren();
    if (saved) {
      feedback.className = saved.correct ? "feedback is-correct" : "feedback is-wrong";
      feedback.append(addText("h3", saved.correct ? "Correcto. Así se razona:" : "Todavía no. Vamos paso a paso:"));
      if (!saved.correct) feedback.append(addText("p", correctAnswerText(q), "right-answer"));
      if (q.format === "bug") {
        feedback.append(addText("p", "Línea corregida:", "fix-label"));
        feedback.append(addText("pre", q.fix, "code-block fix-block"));
      }
      feedback.append(addText("p", q.explanation, "explanation"));
    }
    $("#check-button").hidden = !!saved;
    $("#next-button").hidden = !saved;
    $("#next-button").textContent = current === session.length - 1 ? "Ver resultados" : "Siguiente →";
    $("#prev-button").disabled = current === 0;
    $("#score-line").textContent = `${Object.keys(responses).length}/${session.length} respondidas · ${Object.values(responses).filter((r) => r.correct).length} correctas`;
    if (!saved) {
      const first = options.querySelector("input:not([type=radio]):not([type=checkbox])");
      if (first && window.matchMedia("(pointer: fine)").matches) first.focus({ preventScroll: true });
    }
  }

  function readResponse(q) {
    if (q.format === "numeric") {
      const value = $("#numeric-answer").value;
      if (!value.trim()) return { error: "Escribe un número antes de corregir." };
      if (!Number.isFinite(parseNumber(value))) return { error: "No reconozco ese número. Usa dígitos y coma o punto decimal (p. ej. 2,45)." };
      return { value };
    }
    if (q.format === "cloze") {
      const values = [...document.querySelectorAll("#options .cloze-input")]
        .sort((a, b) => Number(a.dataset.blank) - Number(b.dataset.blank))
        .map((input) => input.value);
      if (values.some((value) => !value.trim())) return { error: "Rellena todos los huecos antes de corregir." };
      return { values };
    }
    if (q.format === "bug") {
      const chosen = document.querySelector("#options .bug-line[aria-pressed=true]");
      if (!chosen) return { error: "Pulsa una línea antes de corregir." };
      return { line: Number(chosen.dataset.line) };
    }
    const selected = [...document.querySelectorAll("#options input:checked")].map((input) => Number(input.value));
    if (!selected.length) return { error: "Selecciona al menos una opción antes de corregir." };
    return { selected };
  }

  function checkAnswer() {
    const q = session[current];
    if (!q || responses[q.id]) return;
    const response = readResponse(q);
    if (response.error) {
      $("#choice-error").textContent = response.error;
      return;
    }
    $("#choice-error").textContent = "";
    const correct = grade(q, response);
    responses[q.id] = { ...response, correct };
    const previous = progress[q.id] || { tries: 0 };
    progress[q.id] = { tries: previous.tries + 1, lastCorrect: correct };
    try { localStorage.setItem(storageKey, JSON.stringify(progress)); } catch {}
    updateStats();
    showQuestion();
    $("#feedback").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function showResult() {
    $("#quiz").hidden = true;
    $("#result").hidden = false;
    const right = Object.values(responses).filter((r) => r.correct).length;
    const wrong = session.length - right;
    $("#result-title").textContent = `Has acertado ${right} de ${session.length}`;
    $("#result-text").textContent = wrong
      ? `Has fallado ${wrong}. Puedes repetir solo los fallos de esta sesión o elegir «Falladas» en los filtros para repasar tus errores acumulados.`
      : "¡Todas correctas! Cambia los filtros para practicar otro bloque o haz un simulacro nuevo.";
    $("#repeat-button").hidden = !wrong;
    $("#result").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  $("#start-button").addEventListener("click", buildSession);
  $("#check-button").addEventListener("click", checkAnswer);
  $("#next-button").addEventListener("click", () => {
    current++;
    showQuestion();
    if (current < session.length) $("#quiz").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  $("#prev-button").addEventListener("click", () => { current--; showQuestion(); });
  $("#exit-button").addEventListener("click", () => { $("#quiz").hidden = true; $("#filters").scrollIntoView({ behavior: "smooth" }); });
  $("#repeat-button").addEventListener("click", () => {
    session = shuffle(session.filter((q) => !responses[q.id]?.correct));
    responses = {};
    current = 0;
    $("#result").hidden = true;
    $("#quiz").hidden = false;
    showQuestion();
    $("#quiz").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  $("#new-button").addEventListener("click", buildSession);
  Object.values(filters).forEach((element) => element.addEventListener("change", updateAvailable));
  updateStats();
}
