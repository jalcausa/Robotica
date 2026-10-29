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
];

const lessonNames = { L4: "L4 · Percepción", "P4.1": "Práctica 4.1 · Landmarks", "P4.2": "Práctica 4.2 · Láser" };
const lessonOrder = ["L4", "P4.1", "P4.2"];
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
