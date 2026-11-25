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

  // ───────────── Wuolah · preguntas de otros años (L4, L5 y P5.2) ─────────────
  // Sacadas de Teoria/Parcial-{1,2}/Examen/examenes_anteriores/wuolah-*.pdf (el 1.er parcial de 2024-25 ya incluía sensores y
  // localización). Solo las que entran en L4 y L5; las de mapping, SLAM, navegación, ROS 1 y L1–L3 quedan fuera.
  // Campo wuolah = documento(s) de Wuolah donde aparece.
  { id: "L4-w01", lesson: "L4", topic: "Gaussianas", kind: "Teoría", format: "single", source: "Wuolah · Preguntas de examen recordadas", wuolah: "Preguntas de examen recordadas; Preguntas de prácticas 1.er parcial 2024-25",
    prompt: "En un notebook de otros años aparece `samples = sigma * np.random.randn(n) + mu`. ¿Qué es `sigma` en esa línea?",
    options: ["La varianza σ²", "La desviación típica σ", "La precisión 1/σ²", "El número de muestras"],
    answer: 1,
    explanation: "np.random.randn(n) da muestras de N(0, 1). Al multiplicar por σ se escala la desviación típica (la varianza pasa a σ²), y al sumar μ se desplaza la media: σ·N(0, 1) + μ ~ N(μ, σ²). Si sigma fuese la varianza, habría que usar np.sqrt(sigma). Por eso en las prácticas el ruido se genera con np.sqrt(cov) @ randn(...)." },
  { id: "L4-w02", lesson: "L4", topic: "Gaussianas", kind: "Teoría", format: "numeric", source: "Wuolah · Preguntas de examen recordadas", wuolah: "Preguntas de examen recordadas; Preguntas de prácticas 1.er parcial 2024-25",
    prompt: "En el examen había que sacar los datos de la gráfica de una gaussiana 1D. El pico está en x = 2 y vale 0,40. ¿Cuánto vale σ?",
    answer: 1, tol: 0.05, unit: "",
    explanation: "La media está donde está el pico: μ = 2. La altura del pico es 1/(σ√(2π)), así que σ = 1/(0,40 · 2,5066) = 1/1,003 ≈ 1,0. Comprobación: a 1σ (en x = 1 y en x = 3) la curva vale el 60,7 % del máximo, unos 0,24. Era la gaussiana con mu = 2 y sigma = 1 del notebook." },
  { id: "L4-w03", lesson: "L4", topic: "Independencia condicional", kind: "Teoría", format: "single", source: "Wuolah · Preguntas de examen recordadas", wuolah: "Preguntas de examen recordadas; Preguntas de teoría 1.er parcial 2024-25",
    prompt: "¿Qué hipótesis permite escribir p(z | x, m) = ∏ₖ p(zₖ | x, m)?",
    options: ["Que todas las medidas tienen la misma varianza", "Que el modelo de observación es lineal", "Que las medidas son condicionalmente independientes dadas la pose y el mapa", "Que el mapa es de rejilla de ocupación"],
    answer: 2,
    explanation: "Si z₁, …, z_K son condicionalmente independientes dados x y m, la verosimilitud conjunta es el producto de las individuales. Ojo: no es lo mismo que «iid» (idénticamente distribuidas), que se refiere a que todas sigan el mismo tipo de distribución. En la práctica se suman logaritmos para no trabajar con números minúsculos. No hace falta que las varianzas sean iguales ni que el modelo sea lineal." },
  { id: "L4-w04", lesson: "L4", topic: "Medidas geométricas", kind: "Teoría", format: "single", source: "Wuolah · Preguntas de examen recordadas", wuolah: "Preguntas de examen recordadas; Preguntas de teoría 1.er parcial 2024-25",
    prompt: "Asocia cada sensor con lo que mide de un landmark: cámara monocular, sonar y LiDAR 2D.",
    options: ["Cámara: rango · Sonar: bearing · LiDAR: rango + bearing", "Cámara: bearing · Sonar: rango · LiDAR: rango + bearing", "Cámara: rango + bearing · Sonar: rango · LiDAR: bearing", "Cámara: bearing · Sonar: rango + bearing · LiDAR: rango"],
    answer: 1,
    explanation: "Una cámara monocular solo da la dirección (el ángulo de observación) del punto: es un sensor de bearing. Para la distancia hace falta estéreo, RGB-D o moverse y triangular. El sonar da la distancia por tiempo de vuelo (rango). El LiDAR 2D da cada punto con su distancia y el ángulo del haz." },
  { id: "L4-w05", lesson: "L4", topic: "Asociación de datos", kind: "Teoría", format: "single", source: "Wuolah · Preguntas de examen recordadas", wuolah: "Preguntas de examen recordadas; Preguntas de teoría 1.er parcial 2024-25",
    prompt: "En el modelo de observación se escribe zᵢ = hᵢ(x, m) = h(x, mᵢ). ¿Qué se está suponiendo?",
    options: ["Que la observación es lineal", "Que el mapa tiene un único landmark", "Que la pose x se conoce sin error", "Que se sabe (o se ha estimado) que zᵢ procede del landmark mᵢ: la asociación de datos está resuelta"],
    answer: 3,
    explanation: "Para pasar de hᵢ(x, m), que depende de todo el mapa, a h(x, mᵢ), que solo usa un landmark, hay que saber qué landmark ha generado cada medida: la correspondencia zᵢ ↔ mᵢ. Si no se conoce, primero se resuelve la asociación de datos, por ejemplo comparando la medida con la que se predice para cada candidato." },
  { id: "L4-w06", lesson: "L4", topic: "Mapas y sensores", kind: "Teoría", format: "single", source: "Wuolah · Self-assessment 2.º parcial 2024-25", wuolah: "Self-assessment 2.º parcial 2024-25",
    prompt: "¿Con qué tipo de mapa (de landmarks o de rejilla) se suelen usar estos sensores: cámaras, medidor de intensidad de señal WiFi, sonars y escáner láser 2D?",
    options: ["Cámaras: landmarks · WiFi: landmarks · Sonar: rejilla · Láser 2D: rejilla", "Cámaras: rejilla · WiFi: landmarks · Sonar: landmarks · Láser 2D: rejilla", "Todos: rejilla", "Cámaras: landmarks · WiFi: rejilla · Sonar: rejilla · Láser 2D: landmarks"],
    answer: 0,
    explanation: "Las cámaras detectan landmarks con descriptor (características visuales) y las antenas WiFi son balizas: mapa de landmarks. El sonar y el láser miden distancias a lo largo de haces sin identificar qué objeto han tocado, así que encajan con la rejilla de ocupación y los modelos de scan (beam model y likelihood field)." },
  { id: "L4-w07", lesson: "L4", topic: "Modelo de observación", kind: "Teoría", format: "single", source: "Wuolah · Test de Mapping", wuolah: "Test de Mapping",
    prompt: "¿Qué define la función de observación h?",
    options: ["La posición relativa entre dos poses del robot", "Los puntos clave detectados en una imagen", "Las celdas ocupadas de una rejilla", "La relación entre la pose del robot, el mapa y las medidas: z = h(x, m) + ruido"],
    answer: 3,
    explanation: "h predice qué mediría el sensor desde la pose x viendo el mapa m. Con ella se compara la medida real con la esperada (la innovación) y se evalúa la verosimilitud p(z | x, m) = p(z | h(x, m))." },
  { id: "L4-w08", lesson: "L4", topic: "Modelo de observación", kind: "Teoría", format: "single", source: "Wuolah · Test de Mapping", wuolah: "Test de Mapping",
    prompt: "En los modelos de observación de L4 y L5, ¿qué representa la matriz Q?",
    options: ["La covarianza del ruido del sensor", "La covarianza de la pose del robot", "La covarianza del ruido de movimiento", "La matriz de información del mapa"],
    answer: 0,
    explanation: "z = h(x, m) + w, con w ~ N(0, Q). En rango y bearing, Q = diag(σ_r², σ_α²), con varianzas. La covarianza del movimiento es R (cov_move en el notebook) y la de la pose, Σ (PEst)." },
  { id: "L4-w09", lesson: "L4", topic: "Landmark en el mapa", kind: "Teoría", format: "single", source: "Wuolah · Test de Mapping", wuolah: "Test de Mapping",
    prompt: "¿Qué significa la expresión m = x ⊕ z_c?",
    options: ["La probabilidad de ocupación de una celda", "La distancia entre dos landmarks", "La posición del landmark en el mapa: su observación en cartesianas del robot, z_c, compuesta con la pose x", "La inversa de la pose del robot"],
    answer: 2,
    explanation: "z_c = [r·cos α, r·sin α] es el landmark en el marco del robot. Al componerlo con la pose (tcomp(x, z_c), con la pose primero) pasa al marco del mapa: m = [x + r·cos(θ + α), y + r·sin(θ + α)]. Es lo que hace to_world_frame() en la práctica 4.1." },

  { id: "L5-w01", lesson: "L5", topic: "LS: dimensiones", kind: "Teoría", format: "numeric", source: "Wuolah · Self-assessment 2.º parcial 2024-25", wuolah: "Self-assessment 2.º parcial 2024-25",
    prompt: "Un robot con un sensor rango-bearing, z = (r, θ), observa una marca m desde 3 poses conocidas y sin error. En la estimación de m por mínimos cuadrados, ¿qué dimensión tiene el vector de error total e?",
    answer: 6, tol: 0, unit: "",
    explanation: "e apila todos los residuos, con una fila por cada medida escalar. Cada observación da 2 números (rango y bearing) y hay 3 observaciones: 3 · 2 = 6. La incógnita m = (x, y) tiene 2 componentes, así que J es 6×2 y JᵀJ, 2×2. Aquí se estima la marca con poses conocidas, pero las filas se cuentan igual que en la localización por LS." },
  { id: "L5-w02", lesson: "L5", topic: "LS: dimensiones", kind: "Teoría", format: "numeric", source: "Wuolah · Preguntas de teoría 2.º parcial 2024-25", wuolah: "Preguntas de teoría 2.º parcial 2024-25",
    prompt: "Ahora el sensor solo da bearing, zₖ = (θ). Observa la marca m desde las mismas 3 poses conocidas. ¿Qué dimensión tiene el vector de error total e?",
    answer: 3, tol: 0, unit: "",
    explanation: "Un sensor de bearing da un solo número por observación: 3 · 1 = 3 filas. Son suficientes para estimar m = (x, y), porque 3 ≥ 2 incógnitas, siempre que las rectas de observación no sean paralelas." },
  { id: "L5-w03", lesson: "L5", topic: "LS y máxima verosimilitud", kind: "Teoría", format: "single", source: "Wuolah · Test de Mapping", wuolah: "Test de Mapping; Preguntas de teoría 1.er parcial 2024-25",
    prompt: "¿A qué equivale la estimación por mínimos cuadrados (ponderados) cuando el error es gaussiano?",
    options: ["Al filtro de partículas", "A la estimación de máxima verosimilitud (ML)", "A la transformada de Fourier", "A un filtro de rejilla"],
    answer: 1,
    explanation: "Con e ~ N(0, Q), p(z | x) = K·exp{−½ eᵀQ⁻¹e}. Maximizarla equivale a minimizar eᵀQ⁻¹e, que es el coste de WLS: x̂_ML = x̂_LS. El LS ordinario es el caso Q = σ²I." },
  { id: "L5-w04", lesson: "L5", topic: "LS y máxima verosimilitud", kind: "Teoría", format: "single", source: "Wuolah · Preguntas de examen recordadas", wuolah: "Preguntas de examen recordadas",
    prompt: "p(z | x, m) = K·exp{−½ [h(x, m) − z]ᵀ Q⁻¹ [h(x, m) − z]}. Si buscas la pose que maximiza esta expresión, ¿qué problema estás resolviendo?",
    options: ["Un ICP con correspondencias desconocidas", "La predicción del filtro de Bayes", "Un remuestreo de partículas", "Mínimos cuadrados ponderados: minimizar eᵀQ⁻¹e con e = z − h(x, m)"],
    answer: 3,
    explanation: "K no depende de x y la exponencial es creciente, así que maximizar p equivale a minimizar [h(x, m) − z]ᵀQ⁻¹[h(x, m) − z]: es WLS. Q es la covarianza del sensor, y las medidas con menos varianza pesan más. Si h no es lineal, se resuelve con Gauss-Newton." },
  { id: "L5-w05", lesson: "L5", topic: "Características de LS", kind: "Teoría", format: "single", source: "Wuolah · Test de Mapping", wuolah: "Test de Mapping; Preguntas de teoría 1.er parcial 2024-25",
    prompt: "¿Qué limitación tienen los mínimos cuadrados, tal como se ven en el tema, frente a los filtros de Bayes?",
    options: ["No consideran la secuencia de movimientos y observaciones: estiman con las medidas de un instante, sin propagar la creencia anterior", "Solo estiman distancias, no ángulos", "No admiten sensores de visión", "Necesitan un mapa topológico"],
    answer: 0,
    explanation: "LS resuelve un problema estático: con las medidas de un instante (y, como mucho, un prior) devuelve una pose. No incorpora el modelo de movimiento ni acumula lo observado antes. Eso lo hacen los filtros de Bayes (rejilla, Kalman/EKF, partículas) con su ciclo de predicción y corrección. De hecho, la corrección de Kalman es un LS ponderado con la predicción como prior." },
  { id: "L5-w06", lesson: "L5", topic: "Gauss-Newton", kind: "Teoría", format: "single", source: "Wuolah · Test de Mapping", wuolah: "Test de Mapping",
    prompt: "¿Para qué se usa el algoritmo de Gauss-Newton en mínimos cuadrados?",
    options: ["Para calcular la covarianza de un mapa de rejilla", "Para convertir coordenadas cartesianas en polares", "Para resolver iterativamente un LS con un modelo de observación no lineal (p. ej. distancias a balizas), linealizando en cada paso", "Para reducir el número de landmarks del mapa"],
    answer: 2,
    explanation: "Si h(x) no es lineal, no hay solución directa. Gauss-Newton linealiza h en la estimación actual, resuelve el LS lineal del incremento, δ = (JᵀQ⁻¹J)⁻¹JᵀQ⁻¹e, actualiza x y repite hasta que δ es despreciable. Depende de la estimación inicial y puede acabar en un mínimo local. En la pregunta original (de mapping) se usaba para la posición de las marcas; en L5, para la pose del robot." },
  { id: "L5-w07", lesson: "L5", topic: "Gauss-Newton", kind: "Teoría", format: "single", source: "Wuolah · Preguntas de examen recordadas", wuolah: "Preguntas de examen recordadas; Preguntas de prácticas 1.er parcial 2024-25",
    prompt: "En el bucle de LeastSquaresLocalization() (notebook 5.1), ¿en qué orden se hacen los cuatro TODO de cada iteración?",
    options: ["Jacobiano → error → incremento → observaciones predichas", "Observaciones predichas zEst = h(xEst) → error e = z − zEst → jacobiano jH en xEst → incremento δ", "Incremento → jacobiano → error → observaciones predichas", "Error → observaciones predichas → incremento → jacobiano"],
    answer: 1,
    explanation: "El error necesita la predicción, y el incremento necesita el error y el jacobiano, los dos evaluados en la estimación actual xEst. Después se actualiza xEst con δ y se repite hasta que ‖δ‖ < tolerance o se acaban las iteraciones." },
  { id: "L5-w08", lesson: "L5", topic: "Gauss-Newton", kind: "Teoría", format: "cloze", source: "Wuolah · Preguntas de examen recordadas", wuolah: "Preguntas de examen recordadas",
    prompt: "Completa los huecos de la iteración de Gauss-Newton de LeastSquaresLocalization() (notebook 5.1).",
    code: "while linalg.norm(incr) > tolerance and iteration < nIterations:\n    # 1) predicted observations h(x_hat), w/o noise\n    zEst = distance({{0}}, w_map)\n\n    # 2) error e = z - h(x_hat)\n    e = {{1}}\n    residual = np.sqrt(e.T@e)\n\n    # 3) Jacobian J_h evaluated at xEst\n    jH = ...\n    Q = np.diag(R1.var_d*np.sqrt(z))\n\n    # 4) increment delta\n    incr = np.linalg.inv(jH.T @ np.linalg.inv(Q) @ jH) @ jH.T @ np.linalg.inv(Q) @ {{2}}\n    xEst[0:2, 0] {{3}} incr",
    blanks: [["xEst"], ["z - zEst"], ["e"], ["+="]],
    explanation: "La predicción se hace desde la estimación actual, xEst, porque la pose real no se conoce. El error es la medida real menos la predicha. Con J = jH (filas [−Δx/d, −Δy/d]) y e = z − h(x̂), el paso ponderado es δ = (JᵀQ⁻¹J)⁻¹JᵀQ⁻¹e, y se suma: x̂ ← x̂ + δ. La versión de otros años usaba jE = −jH y por eso restaba (xEst −= incr). El resultado es el mismo." },
  { id: "L5-w09", lesson: "L5", topic: "EKF", kind: "Teoría", format: "single", source: "Wuolah · Preguntas de examen recordadas", wuolah: "Preguntas de examen recordadas; Self-assessment 1.er parcial 2024-25; Preguntas de teoría 1.er parcial 2024-25",
    prompt: "En el examen daban las expresiones del EKF sin la parte izquierda y había que nombrarlas: (1) G_tΣ_{t−1}G_tᵀ + R_t · (2) μ̄_t + K_t(z_t − h(μ̄_t)) · (3) (I − K_tH_t)Σ̄_t · (4) μ_{t−1} ⊕ u_t. ¿Qué asignación es correcta?",
    options: ["(1) incertidumbre de la estimación · (2) predicción de la pose · (3) incertidumbre de la predicción · (4) estimación de la pose", "(1) incertidumbre de la predicción · (2) estimación de la pose · (3) incertidumbre de la estimación · (4) predicción de la pose", "(1) incertidumbre de la predicción · (2) predicción de la pose · (3) incertidumbre de la estimación · (4) estimación de la pose", "(1) ganancia de Kalman · (2) estimación de la pose · (3) incertidumbre de la predicción · (4) predicción de la pose"],
    answer: 1,
    explanation: "Predicción: la pose μ̄_t = μ_{t−1} ⊕ u_t (4) y su incertidumbre Σ̄_t = GΣGᵀ + R (1). Corrección: la ganancia K_t, la pose estimada μ_t = μ̄_t + K(z − h(μ̄_t)) (2) y su incertidumbre Σ_t = (I − KH)Σ̄_t (3). Truco: si aparece R (ruido de movimiento), es predicción; si aparecen K o z, es corrección." },
  { id: "L5-w10", lesson: "L5", topic: "Probabilidad conjunta", kind: "Teoría", format: "numeric", source: "Wuolah · Preguntas de examen recordadas", wuolah: "Preguntas de examen recordadas",
    prompt: "En la rejilla de probabilidad conjunta de la diapositiva, la columna c = 5 tiene, de abajo arriba, 0,01; 0,1; 0,1; 0,15 y 0,02 (el resto de sus celdas, 0). ¿Cuánto vale P(c = 5)?",
    answer: 0.38, tol: 0.005, unit: "",
    explanation: "La marginal de una columna es la suma de la conjunta a lo largo de ella: P(c) = Σ_r P(r, c) = 0,01 + 0,1 + 0,1 + 0,15 + 0,02 = 0,38. La celda de 0,15 es P(r = 5, c = 5), la conjunta en el cruce." },
  { id: "L5-w11", lesson: "L5", topic: "Probabilidad conjunta", kind: "Teoría", format: "numeric", source: "Wuolah · Preguntas de examen recordadas", wuolah: "Preguntas de examen recordadas",
    prompt: "Las marginales por columnas de esa rejilla son P(c = 3) = 0,06, P(c = 4) = 0,18, P(c = 5) = 0,38, P(c = 6) = 0,27 y P(c = 7) = 0,11. ¿Cuánto vale P(3 ≤ c ≤ 5)?",
    answer: 0.62, tol: 0.005, unit: "",
    explanation: "Las columnas son sucesos disjuntos, así que se suman sus marginales: 0,06 + 0,18 + 0,38 = 0,62. Comprobación: las cinco marginales suman 1. Cuidado con contar bien los extremos: de 4 a 6 saldría 0,18 + 0,38 + 0,27 = 0,83." },
  { id: "L5-w12", lesson: "L5", topic: "Probabilidad conjunta", kind: "Teoría", format: "numeric", source: "Wuolah · Preguntas de examen recordadas", wuolah: "Preguntas de examen recordadas",
    prompt: "Versión del examen: en la rejilla conjunta, la columna x = 3 tiene tres celdas no nulas, todas de 0,1. ¿Cuál es la probabilidad de que el robot esté en x = 3?",
    answer: 0.3, tol: 0.005, unit: "",
    explanation: "Es la marginal de esa columna: P(x = 3) = Σ_y P(x = 3, y) = 0,1 + 0,1 + 0,1 = 0,3. No se multiplica ni se toma el máximo: los sucesos «estar en cada celda» son disjuntos y se suman." },
  { id: "L5-w13", lesson: "L5", topic: "Problemas de localización", kind: "Teoría", format: "single", source: "Wuolah · Preguntas de examen recordadas", wuolah: "Preguntas de examen recordadas; Preguntas de teoría 1.er parcial 2024-25",
    prompt: "Asocia cada problema con su significado: (1) position tracking, (2) global localization, (3) kidnapped robot.",
    options: ["(1) No tiene ni idea de dónde está · (2) Sabe aproximadamente dónde está · (3) Cree saber dónde está, pero se equivoca", "(1) Cree saber dónde está, pero se equivoca · (2) No tiene ni idea de dónde está · (3) Sabe aproximadamente dónde está", "(1) Sabe aproximadamente dónde está · (2) No tiene ni idea de dónde está · (3) Cree saber dónde está, pero se equivoca", "(1) Sabe aproximadamente dónde está · (2) Cree saber dónde está, pero se equivoca · (3) No tiene ni idea de dónde está"],
    answer: 2,
    explanation: "Position tracking: conoce su pose aproximadamente y la corrige mientras se mueve. Global localization: la pose inicial es desconocida. Kidnapped robot: está seguro de su pose, pero se equivoca, porque lo han movido sin que el estimador lo sepa; tiene que detectar el fallo y volver a localizarse." },
  { id: "L5-w14", lesson: "L5", topic: "Remuestreo", kind: "Teoría", format: "single", source: "Wuolah · Preguntas de examen recordadas", wuolah: "Preguntas de examen recordadas; Preguntas de teoría 1.er parcial 2024-25",
    prompt: "¿Para qué se usa el remuestreo (resampling) en el filtro de partículas?",
    options: ["Para convertir los pesos en densidad de partículas: se replican las de mucho peso, desaparecen las de poco y todas pasan a valer 1/M", "Para añadir ruido a las partículas y separarlas", "Para calcular los pesos con la verosimilitud", "Para aumentar el número de partículas en cada iteración"],
    answer: 0,
    explanation: "Tras la corrección, muchas partículas tienen un peso casi nulo y gastan cómputo. Al remuestrear con reemplazo según los pesos, las partículas se concentran donde hay probabilidad («supervivencia del más apto»). M no cambia y los pesos se igualan a 1/M. Así se evita la degeneración, en la que unas pocas partículas de mucho peso dominan la estimación. El ruido se añade en la predicción, no aquí." },

  { id: "P52-w01", lesson: "P5.2", topic: "Predicción EKF", kind: "Práctica", format: "cloze", source: "Wuolah · Preguntas de examen recordadas", wuolah: "Preguntas de examen recordadas; Preguntas de prácticas 1.er parcial 2024-25",
    prompt: "Versión del examen («rellenar escribiendo»): completa todos los argumentos de la predicción de EKFLocalization().",
    code: "# Prediction\nxPred = tcomp({{0}}, {{1}})\nG = J1({{2}}, {{3}})\nj2 = J2({{4}}, {{5}})\nPPred = {{6}}@robot.{{7}}@G.T + {{8}}@robot.{{9}}@j2.T",
    blanks: [["robot.xEst"], ["u"], ["robot.xEst"], ["u"], ["robot.xEst"], ["u"], ["G"], ["PEst"], ["j2"], ["cov_move"]],
    explanation: "Todo se evalúa en la estimación anterior, robot.xEst (μ_{t−1}), con el comando sin ruido u: xPred = xEst ⊕ u. G = ∂(x ⊕ u)/∂x y j2 = ∂(x ⊕ u)/∂u se evalúan en ese mismo punto. La covarianza propaga la anterior con G y suma la del movimiento girada al mundo con j2. Ojo: en la solución de otros años que circula por Wuolah aparece J1(xPred, u) y J2(xPred, u). En el notebook de este curso, y en la teoría (G en μ_{t−1}), es robot.xEst: J1 y J2 usan el ángulo del primer argumento, así que con xPred saldrían otros valores." },
  // Del 1.er parcial de 2024-25 (Wuolah): preguntas de sensores y localización que este curso entran en L4 y L5.
  { id: "L4-w10", lesson: "L4", topic: "Modelo de observación", kind: "Teoría", format: "single", source: "Wuolah · Self-assessment 1.er parcial 2024-25", wuolah: "Self-assessment 1.er parcial 2024-25",
    prompt: "Dado el modelo de observación z = h(x, m) + w, con w ~ N(0, Q), ¿qué expresión es correcta?",
    options: ["p(z | x, m) ~ N(h(x, m), J_h·Q·J_hᵀ)", "p(z | x, m) ~ N(h(x, m), Q)", "p(z | x, m) ~ N(0, Q)", "p(z | x, m) ~ N(h(x, m), Q⁻¹)"],
    answer: 1,
    explanation: "Con x y m dados, h(x, m) es una constante: sumarla al ruido solo desplaza la media. Así, z ~ N(h(x, m), Q). No hay jacobiano, porque no se propaga ninguna incertidumbre a través de h, y la covarianza es Q, no su inversa (Q⁻¹ aparece dentro de la exponencial)." },
  { id: "L4-w11", lesson: "L4", topic: "Verosimilitud", kind: "Teoría", format: "single", source: "Wuolah · Self-assessment 1.er parcial 2024-25", wuolah: "Self-assessment 1.er parcial 2024-25",
    prompt: "En Bel(x_t) = η·p(z_t | x_t, m)·∫ p(x_t | u_t, x_{t−1}) Bel(x_{t−1}) dx_{t−1}, ¿cuál es la variable de la función p(z_t | x_t, m)?",
    options: ["m", "x_t", "m, x_t y z_t", "z_t"],
    answer: 1,
    explanation: "La medida z_t ya se ha tomado y el mapa m se conoce: son datos fijos. Lo que varía es la pose candidata x_t, así que p(z_t | x_t, m) se usa como verosimilitud L(x_t): dice lo compatible que es cada pose con lo medido. Por eso no tiene por qué integrar 1 respecto a x_t." },
  { id: "L4-w12", lesson: "L4", topic: "Sensor de rango", kind: "Teoría", format: "single", source: "Wuolah · Self-assessment 1.er parcial 2024-25", wuolah: "Self-assessment 1.er parcial 2024-25; Preguntas de prácticas 1.er parcial 2024-25",
    prompt: "Un sensor se implementa con `z = np.sqrt(np.sum((m - pose[0:2, :])**2, axis=0))`, donde m es el mapa (2×N, una columna por landmark). ¿Qué mide?",
    options: ["Solo rango: z es un vector cuyo elemento i es la distancia del robot al landmark mᵢ", "Rango y orientación a cada landmark", "Solo orientación a cada landmark", "La distancia a un único landmark, porque m es una sola marca"],
    answer: 0,
    explanation: "pose[0:2, :] es la posición (x, y) del robot y se resta a cada columna de m. Al elevar al cuadrado, sumar por filas (axis=0) y hacer la raíz, sale la distancia euclídea a cada landmark: N valores. No hay arctan2 ni θ, así que no mide ángulos. En el notebook 5.1 la función equivalente es distance()." },
  { id: "L4-w13", lesson: "L4", topic: "Modelos de sensor", kind: "Teoría", format: "single", source: "Wuolah · Preguntas de teoría 1.er parcial 2024-25", wuolah: "Preguntas de teoría 1.er parcial 2024-25",
    prompt: "¿Qué sensor encaja mejor con el beam model y con el likelihood field?",
    options: ["Una cámara monocular", "Un escáner láser (LiDAR 2D) que da un scan de barrido", "Un receptor GPS", "Un encoder de rueda"],
    answer: 1,
    explanation: "Los dos son modelos de scan: evalúan muchos haces de distancia contra un mapa de rejilla, y es justo lo que da un láser de barrido. La cámara monocular encaja con el modelo de bearing; el estéreo o el RGB-D, con el de rango y bearing. El encoder es propioceptivo y no observa el entorno." },
  { id: "L4-w14", lesson: "L4", topic: "GPS", kind: "Teoría", format: "single", source: "Wuolah · Preguntas de teoría 1.er parcial 2024-25", wuolah: "Preguntas de teoría 1.er parcial 2024-25",
    prompt: "Ordena las técnicas GPS de más a menos precisa.",
    options: ["Stand Alone > DGPS > RTK", "RTK > DGPS > Stand Alone", "DGPS > RTK > Stand Alone", "RTK > Stand Alone > DGPS"],
    answer: 1,
    explanation: "Con las cifras de este curso: el GPS solo (stand alone, el de los móviles) da 3–10 m. El DGPS, con correcciones de una estación de referencia cercana, da 0,5–3 m. El RTK, que además usa la fase de la portadora, da 1–5 cm (topografía). Las diapositivas de otros años daban < 10 m, < 5 m y < 10 cm: el orden es el mismo." },
  { id: "L4-w15", lesson: "L4", topic: "GPS", kind: "Teoría", format: "single", source: "Wuolah · Preguntas de teoría 1.er parcial 2024-25", wuolah: "Preguntas de teoría 1.er parcial 2024-25",
    prompt: "Un sistema de localización con GPS está basado en...",
    options: ["Solo medidas de distancia (pseudorangos) a satélites de posición conocida; con más satélites de los necesarios se ajusta por mínimos cuadrados", "Medidas de ángulo a los satélites", "La odometría del receptor", "La correlación de imágenes de satélite"],
    answer: 0,
    explanation: "El receptor mide el tiempo de vuelo de la señal de cada satélite y lo convierte en un pseudorango: es trilateración. Hacen falta al menos 4 satélites (3 coordenadas y el desfase del reloj del receptor). Si hay más, el sistema está sobredeterminado y se resuelve por mínimos cuadrados." },

  { id: "L5-w15", lesson: "L5", topic: "Registro", kind: "Teoría", format: "single", source: "Wuolah · Self-assessment 1.er parcial 2024-25", wuolah: "Self-assessment 1.er parcial 2024-25",
    prompt: "Un robot de pose p = [p_x, p_y, θ] observa marcas xᵢ (en su marco) que empareja con las marcas mᵢ del mapa 2D. ¿Cuál es una definición INCORRECTA de la función a minimizar para localizarlo?",
    options: ["Eᵢ(R, t) = mᵢ − p ⊕ xᵢ", "Eᵢ(R, t) = ‖mᵢ − p ⊕ xᵢ‖²", "Eᵢ(R, t) = ‖mᵢ − R(θ)xᵢ − t‖², con t = [p_x, p_y]ᵀ", "Eᵢ(R, t) = ‖p ⊕ xᵢ − mᵢ‖²"],
    answer: 0,
    explanation: "mᵢ − p ⊕ xᵢ es un vector (el residuo), y un vector no se puede minimizar: hace falta un escalar, su norma al cuadrado, sumada para todas las parejas. Las otras tres son la misma función: p ⊕ xᵢ = R(θ)xᵢ + t, y el orden de la resta no cambia la norma." },
  { id: "L5-w16", lesson: "L5", topic: "Filtro de partículas", kind: "Teoría", format: "multi", source: "Wuolah · Self-assessment 1.er parcial 2024-25", wuolah: "Self-assessment 1.er parcial 2024-25",
    prompt: "Sobre un filtro de partículas para localización, marca las afirmaciones correctas.",
    options: ["Representa la distribución a posteriori de la pose con partículas, que son muestras de esa distribución", "La verosimilitud se aplica cambiando el peso de las partículas", "Las partículas se pesan con el modelo de movimiento", "Permite modelar varias hipótesis sobre la localización del robot"],
    answer: [0, 1, 3],
    explanation: "El modelo de movimiento mueve las partículas (muestreando con ruido) y no cambia sus pesos. Los pesos salen de la verosimilitud de la observación, w ∝ p(z | x). Como las muestras pueden estar en varias zonas, el filtro admite creencias multimodales." },
  { id: "L5-w17", lesson: "L5", topic: "Gauss-Newton", kind: "Teoría", format: "multi", source: "Wuolah · Self-assessment 1.er parcial 2024-25", wuolah: "Self-assessment 1.er parcial 2024-25",
    prompt: "Un robot con sensor de distancia a marcas se localiza globalmente por mínimos cuadrados con Gauss-Newton, inicializado en la pose odométrica. Marca las afirmaciones correctas.",
    options: ["La calidad de la odometría influye en el número de iteraciones hasta converger", "El jacobiano del modelo de observación es de dimensión (grados de libertad de la pose) × (número de landmarks)", "La orientación del robot se puede obtener con distancias a tres o más marcas", "La varianza de las distancias observadas afecta al mínimo obtenido"],
    answer: [0, 3],
    explanation: "Una estimación inicial cercana necesita menos iteraciones y reduce el riesgo de un mínimo local. El jacobiano tiene una fila por medida y una columna por incógnita: (n.º de landmarks) × (grados de libertad), no al revés. Las distancias desde un punto no dependen de θ, así que la orientación no es observable. Y en WLS las varianzas pesan cada residuo: si cambian, cambia el mínimo (en el notebook 5.1, Q crece con la distancia)." },
  { id: "L5-w18", lesson: "L5", topic: "Probabilidad conjunta", kind: "Teoría", format: "numeric", source: "Wuolah · Preguntas de teoría 1.er parcial 2024-25", wuolah: "Preguntas de teoría 1.er parcial 2024-25",
    prompt: "En una rejilla, la columna 4 tiene tres celdas no nulas, todas de 0,1 (filas 1, 3 y 4). ¿Cuál es la probabilidad de que el robot esté en (fila 3, columna 4) sabiendo que está en la columna 4?",
    answer: 0.3333, tol: 0.005, unit: "",
    explanation: "P(3, 4 | c = 4) = P(3, 4) / P(c = 4). La marginal de la columna es 0,1 + 0,1 + 0,1 = 0,3 y la conjunta en la celda, 0,1: 0,1 / 0,3 = 1/3 ≈ 0,333. Saber la columna descarta el resto de la rejilla y renormaliza lo que queda." },
  { id: "L5-w19", lesson: "L5", topic: "Probabilidad conjunta", kind: "Teoría", format: "numeric", source: "Wuolah · Self-assessment 1.er parcial 2024-25", wuolah: "Self-assessment 1.er parcial 2024-25",
    prompt: "Un robot está en una rejilla de 10×5 baldosas y puede mirar al N, S, E u O, con P(N) = P(S) = 1/6 y P(E) = P(O) = 1/3. P(baldosa (3, 2)) = 1/8, independiente de la orientación. ¿Qué probabilidad hay de que esté en (3, 2) y no mire ni al Norte ni al Oeste?",
    answer: 0.0625, tol: 0.001, unit: "",
    explanation: "No mirar ni al N ni al O es mirar al S o al E: 1/6 + 1/3 = 1/2. Como posición y orientación son independientes, la conjunta es el producto: 1/8 · 1/2 = 1/16 = 0,0625." },
  { id: "L5-w20", lesson: "L5", topic: "Gaussianas", kind: "Teoría", format: "numeric", source: "Wuolah · Preguntas de teoría 1.er parcial 2024-25", wuolah: "Preguntas de teoría 1.er parcial 2024-25",
    prompt: "z = Hx + e con z = 3x + e, e ~ N(0, 2) y x ~ N(2, 1), independientes (el segundo parámetro es la varianza). ¿Cuánto vale la varianza de z?",
    answer: 11, tol: 0.01, unit: "",
    explanation: "Para z = Ax + Be con x y e independientes, Σ_z = AΣ_xAᵀ + BΣ_eBᵀ = 3·1·3 + 1·2·1 = 9 + 2 = 11. La media es 3·2 + 0 = 6." },
  { id: "L5-w21", lesson: "L5", topic: "Jacobianos", kind: "Teoría", format: "single", source: "Wuolah · Preguntas de teoría 1.er parcial 2024-25", wuolah: "Preguntas de teoría 1.er parcial 2024-25",
    prompt: "h apila m observaciones de rango y bearing y la pose es x = (x, y, θ). ¿Qué dimensión tiene el jacobiano H = ∂h/∂x?",
    options: ["2×3", "2m × 3", "3 × 2m", "m × 3"],
    answer: 1,
    explanation: "Una fila por cada salida y una columna por cada componente de la pose. Cada observación da 2 salidas, así que son 2m filas y 3 columnas. Con una sola observación sería 2×3." },
  { id: "L5-w22", lesson: "L5", topic: "Registro", kind: "Teoría", format: "single", source: "Wuolah · Preguntas de teoría 1.er parcial 2024-25", wuolah: "Preguntas de teoría 1.er parcial 2024-25",
    prompt: "Tienes un mapa de puntos y un scan láser, pero ninguna información de movimiento. ¿Qué técnica encaja para localizar el robot?",
    options: ["Un filtro de Kalman, que solo necesita la observación", "Registrar el scan contra el mapa con ICP", "Un filtro de partículas sin pesos", "La odometría de ruedas"],
    answer: 1,
    explanation: "Sin comandos no hay predicción, y los filtros de Bayes (Kalman, partículas) la necesitan en cada ciclo. Registrar el scan contra el mapa da la pose directamente, y como los puntos de un scan no tienen descriptor, las correspondencias son desconocidas: es el caso de ICP. Necesita una estimación inicial razonable, porque solo garantiza un mínimo local." },
  { id: "L5-w23", lesson: "L5", topic: "Filtro de Kalman", kind: "Teoría", format: "numeric", source: "Wuolah · Preguntas de teoría 1.er parcial 2024-25", wuolah: "Preguntas de teoría 1.er parcial 2024-25",
    prompt: "Un robot en un pasillo tiene x ~ N(1, 1) y se mueve con u ~ N(1, 2), independiente (segundo parámetro = varianza). Tras predecir, ¿cuánto vale la varianza de la nueva gaussiana?",
    answer: 3, tol: 0.01, unit: "",
    explanation: "Es la predicción de Kalman en 1D: x_t = x_{t−1} + u. Las medias se suman (1 + 1 = 2) y, al ser independientes, también las varianzas (1 + 2 = 3): x ~ N(2, 3). Moverse siempre aumenta la incertidumbre." },

  { id: "P41-w01", lesson: "P4.1", topic: "to_world_frame()", kind: "Práctica", format: "single", source: "Wuolah · Self-assessment 1.er parcial 2024-25", wuolah: "Self-assessment 1.er parcial 2024-25; Preguntas de prácticas 1.er parcial 2024-25",
    prompt: "En to_world_frame(), ¿qué expresión calcula correctamente la incertidumbre del landmark en el mundo, Wz1?",
    options: ["Wz1 = Jac_ap @ z1_car_rel[1] @ Jac_ap.T + Jac_aa @ Qx1_w @ Jac_aa.T", "Wz1 = Jac_aa @ Qx1_w @ Jac_aa.T + Jac_ap @ z1_car_rel[1] @ Jac_ap.T", "Wz1 = Jac_ap @ Qx1_w @ Jac_ap.T + Jac_aa @ z1_car_rel[1] @ Jac_aa.T", "Wz1 = Jac_aa.T @ z1_car_rel[1] @ Jac_aa + Jac_ap.T @ Qx1_w @ Jac_ap"],
    answer: 2,
    explanation: "Cada jacobiano va con la covarianza de su variable. Jac_ap (2×3) es ∂m/∂pose y multiplica a Qx1_w (3×3); Jac_aa (2×2) es ∂m/∂z_c y multiplica a z1_car_rel[1], la covarianza de la medida ya en cartesianas. La forma es J Σ Jᵀ: con Jᵀ Σ J (opción D) ni siquiera cuadran las dimensiones. Las opciones A y B cruzan jacobiano y covarianza." },
  { id: "P41-w02", lesson: "P4.1", topic: "to_world_frame()", kind: "Práctica", format: "single", source: "Wuolah · Preguntas de prácticas 1.er parcial 2024-25", wuolah: "Preguntas de prácticas 1.er parcial 2024-25",
    prompt: "En to_world_frame(), ¿qué dimensiones tienen Qx1_w, W1, Jac_ap y Wz1, por este orden?",
    options: ["3×3, 2×2, 2×3, 2×2", "3×3, 2×2, 3×2, 3×3", "2×2, 2×2, 2×2, 2×2", "3×3, 3×3, 2×3, 2×2"],
    answer: 0,
    explanation: "Qx1_w es la covarianza de la pose (x, y, θ): 3×3. W1 es la del sensor en polares (r, α): 2×2. Jac_ap = ∂m/∂pose, recortado a las 2 filas del landmark: 2×3. Wz1, la del landmark (x, y) en el mundo: 2×2, igual que Jac_aa y z1_car_rel[1]." },

  // ───────────── P4.1 · Landmark-based models ─────────────
  // Código tomado de la solución del notebook 4.1 (to_world_frame, combine_pdfs, inverse_composition1, predicted_obs_from_pov).
  { id: "P41-z01", lesson: "P4.1", topic: "to_world_frame()", kind: "Práctica", format: "cloze", source: "Práctica 4.1", wuolah: "Preguntas de examen recordadas",
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
  { id: "P41-z06", lesson: "P4.1", topic: "predicted_obs_from_pov()", kind: "Práctica", format: "cloze", source: "Práctica 4.1 (opcional)", wuolah: "Preguntas de examen recordadas",
    prompt: "Completa el paso de cartesianas a polares en predicted_obs_from_pov().",
    code: "# Jacobian from cartesian to polar at z2p_r\ntheta = z2_pr[1, 0]\ns, c = np.sin(theta), np.cos(theta)\nr = z2_pr[0, 0]\n\nJac_car_pol = np.array([\n    [c, s],\n    [{{0}}, {{1}}]\n])\n\nW2_p = Jac_car_pol@{{2}}@Jac_car_pol.T",
    blanks: [["-s/r", "-np.sin(theta)/r", "-(s/r)"], ["c/r", "np.cos(theta)/r"], ["W2_c"]],
    explanation: "Para r = √(x²+y²) y α = atan2(y, x): ∂r/∂(x,y) = [cos α, sin α] y ∂α/∂(x,y) = [−sin α / r, cos α / r]. Es la inversa del jacobiano polar → cartesiano: allí se multiplica por r y aquí se divide. Se aplica a W2_c, la covarianza en cartesianas en el marco de R2." },
  { id: "P41-b01", lesson: "P4.1", topic: "to_world_frame()", kind: "Práctica", format: "bug", source: "Práctica 4.1",
    prompt: "Esta versión de to_world_frame() falla al ejecutarse. ¿En qué línea está el error?",
    code: ["r, a = z1_p_r[0,0], z1_p_r[1,0]", "s, c = np.sin(a), np.cos(a)", "Jac_pol_car = np.array([[c, -r*s], [s, r*c]])", "z1_car_rel = (np.vstack([r*c, r*s]), Jac_pol_car@W1@Jac_pol_car.T)", "z1_ext = np.vstack([z1_car_rel[0], 0])", "Jac_ap = J1(x1_w ,z1_ext)[0:2,:]", "Jac_aa = J2(x1_w ,z1_ext)[0:2,0:2]", "z1_w = tcomp(x1_w ,z1_ext)[0:2,[0]]", "Wz1 = Jac_ap @ Qx1_w @ Jac_ap + Jac_aa @ z1_car_rel[1] @ Jac_aa.T"],
    answer: 9, fix: "Wz1 = Jac_ap @ Qx1_w @ Jac_ap.T + Jac_aa @ z1_car_rel[1] @ Jac_aa.T",
    explanation: "Falta la traspuesta de Jac_ap. Jac_ap es 2×3 y Qx1_w es 3×3: (2×3)@(3×3) da 2×3, y multiplicarlo por otra 2×3 lanza un error de dimensiones. La propagación correcta es J Σ Jᵀ en los dos términos." },
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
  { id: "P41-c01", lesson: "P4.1", topic: "Thinking about it", kind: "Práctica", format: "single", source: "Práctica 4.1",
    prompt: "En el Assignment 2 se añade incertidumbre a la pose del robot (Σ_x ≠ 0). ¿Qué le pasa a Σ_m del landmark?",
    options: ["Aumenta: se suma el término J_x Σ_x J_xᵀ al del sensor, y el error de orientación se amplifica con la distancia", "No cambia: solo depende del sensor", "Disminuye, porque hay más información", "Pasa a ser igual a Σ_x"],
    answer: 0,
    explanation: "Σ_m = J_x Σ_x J_xᵀ + J_z Σ_z J_zᵀ. Con Σ_x = 0 solo queda el término del sensor; al añadirlo, la elipse crece (salida esperada: de diag ≈ 0,59/0,30 a ≈ 0,95/0,94). El error en θ se multiplica por la distancia al landmark, así que la elipse del landmark puede ser mayor que la del robot." },

  // Errores y huecos que antes estaban en la guía 4.1 (ahora solo en el test).
  { id: "P41-b12", lesson: "P4.1", topic: "to_world_frame()", kind: "Práctica", format: "bug", source: "Práctica 4.1 (Assignment 1)",
    prompt: "La covarianza de la observación en cartesianas sale no simétrica. ¿En qué línea está el error?",
    code: ["r, a = z1_p_r[0,0], z1_p_r[1,0]", "s, c = np.sin(a), np.cos(a)", "Jac_pol_car = np.array([[c, -r*s], [s, r*c]])", "z1_car_rel = (np.vstack([r*c, r*s]), Jac_pol_car@W1@Jac_pol_car)"],
    answer: 4, fix: "z1_car_rel = (np.vstack([r*c, r*s]), Jac_pol_car@W1@Jac_pol_car.T)",
    explanation: "La propagación lineal es J Σ Jᵀ. Sin la traspuesta, el producto no es una covarianza: ni siquiera sale simétrico." },
  { id: "P41-b13", lesson: "P4.1", topic: "to_world_frame()", kind: "Práctica", format: "bug", source: "Práctica 4.1 (Assignment 2)",
    prompt: "Esta versión lanza «ValueError: operands could not be broadcast together». ¿Qué línea lo provoca?",
    code: ["z1_ext = np.vstack([z1_car_rel[0], 0])", "Jac_ap = J1(x1_w ,z1_ext)[0:2,:]", "Jac_aa = J2(x1_w ,z1_ext)[0:2,0:2]", "z1_w = tcomp(x1_w ,z1_ext)[0:2,[0]]", "Wz1 = Jac_ap * Qx1_w * Jac_ap.T + Jac_aa * z1_car_rel[1] * Jac_aa.T"],
    answer: 5, fix: "Wz1 = Jac_ap @ Qx1_w @ Jac_ap.T + Jac_aa @ z1_car_rel[1] @ Jac_aa.T",
    explanation: "`*` multiplica elemento a elemento, y con formas (2,3), (3,3) y (3,2) NumPy no puede emparejarlas. El producto matricial es `@`." },
  { id: "P41-b14", lesson: "P4.1", topic: "to_world_frame()", kind: "Práctica", format: "bug", source: "Práctica 4.1 (Assignment 1)",
    prompt: "Esta versión falla al calcular `Jac_aa @ z1_car_rel[1]`: (2×3)·(2×2) no se puede multiplicar. ¿Qué línea es la causa?",
    code: ["z1_ext = np.vstack([z1_car_rel[0], 0])", "Jac_ap = J1(x1_w ,z1_ext)[0:2,:]", "Jac_aa = J2(x1_w ,z1_ext)[0:2,:]", "z1_w = tcomp(x1_w ,z1_ext)[0:2,[0]]", "Wz1 = Jac_ap @ Qx1_w @ Jac_ap.T + Jac_aa @ z1_car_rel[1] @ Jac_aa.T"],
    answer: 3, fix: "Jac_aa = J2(x1_w ,z1_ext)[0:2,0:2]",
    explanation: "∂m/∂z_c es 2×2: el landmark tiene 2 coordenadas y la observación cartesiana también. Hay que descartar la fila y la columna de la orientación ficticia: `[0:2,0:2]`. `Jac_ap` sí se queda con las 3 columnas, porque la pose tiene 3 componentes." },
  { id: "P41-b17", lesson: "P4.1", topic: "to_world_frame()", kind: "Práctica", format: "bug", source: "Práctica 4.1 (Assignment 1)",
    prompt: "La demo falla en `ax.plot(z1_w[0, 0], ...)` con «too many indices for array». ¿En qué línea está el error?",
    code: ["z1_w = tcomp(x1_w ,z1_ext)[0:2,0]", "Wz1 = Jac_ap @ Qx1_w @ Jac_ap.T + Jac_aa @ z1_car_rel[1] @ Jac_aa.T", "return z1_w, Wz1", "# demo", "ax.plot(z1_w[0, 0], z1_w[1, 0], 'o', label='Z1', color='green')"],
    answer: 1, fix: "z1_w = tcomp(x1_w ,z1_ext)[0:2,[0]]",
    explanation: "`[0:2,0]` devuelve un vector 1D de forma (2,), que no admite dos índices. Con `[0:2,[0]]` se conserva la columna (2,1), como el resto de vectores del notebook." },
  { id: "P41-z09", lesson: "P4.1", topic: "Assignment 1", kind: "Práctica", format: "cloze", source: "Práctica 4.1 (Assignment 1)",
    prompt: "Completa los datos de la demo del Assignment 1, en el que la pose del robot se conoce sin error.",
    code: "x1_w = np.vstack([1, 2, 0.5])\nQx1_w = {{0}}  # pose perfectly known\nz1_p_r = np.vstack([4., .7])\nW1 = np.{{1}}([0.25, 0.04])",
    blanks: [["np.zeros((3, 3))", "np.zeros((3,3))", "np.zeros([3, 3])", "np.zeros([3,3])"], ["diag"]],
    explanation: "Sin incertidumbre en la pose, Σ_x es la matriz nula 3×3, y el término J_x Σ_x J_xᵀ desaparece. El ruido del sensor es diagonal con las varianzas de r y α (0,25 m² y 0,04 rad²)." },

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
  // Errores y huecos que antes estaban en la guía 4.2 (ahora solo en el test).
  { id: "P42-b12", lesson: "P4.2", topic: "plot_observations()", kind: "Práctica", format: "bug", source: "Práctica 4.2 (Assignment 1)",
    prompt: "Con el robot mirando a +y (θ = π/2), todo el scan sale girado 90° de más. ¿Qué línea tiene el error?",
    code: ["for i in range (z.shape[1]):", "    distance = z[0, i]", "    angle = z[1, i] + pose[2]", "    x_local = distance*np.cos(angle)", "    y_local = distance*np.sin(angle)", "    pose_obs_global = tcomp(pose, np.vstack([x_local, y_local, 0]))"],
    answer: 3, fix: "    angle = z[1, i]",
    explanation: "Se gira dos veces: una al sumar θ al ángulo y otra dentro de tcomp. O se usa la fórmula directa x + r·cos(α + θ), o se compone el punto local con la pose, pero no las dos cosas." },
  { id: "P42-b13", lesson: "P4.2", topic: "explore_environment()", kind: "Práctica", format: "bug", source: "Práctica 4.2 (Assignment 2)",
    prompt: "La pose se actualiza bien, pero los scans se toman desde puntos fuera de la habitación, como [2, 0, 0]. ¿Qué línea tiene el error?",
    code: ["current_pose = np.vstack([4,4,0]) # starting pose", "for step, color in pose_increments_list:", "    current_pose = tcomp(current_pose, step)", "    run_laser_and_plot(laser, step, fig, ax, False, color)"],
    answer: 4, fix: "    run_laser_and_plot(laser, current_pose, fig, ax, False, color)",
    explanation: "`step` es el incremento local, no una pose del mapa. Hay que medir desde la pose acumulada, `current_pose`." },
  { id: "P42-b14", lesson: "P4.2", topic: "Laser2D", kind: "Práctica", format: "bug", source: "Práctica 4.2 (utils/laser/laser2D.py)",
    prompt: "Con FOV = π y resolución π/2 salen 2 haces (−90° y 0°) en lugar de 3. ¿Qué línea tiene el error?",
    code: ["n_beams = math.floor(self.FOV / self.resolution)", "z = np.zeros((2, n_beams))", "for i_beam in range(n_beams):", "    phi = i_beam*self.resolution - (self.FOV/2) + self.pose[2]"],
    answer: 1, fix: "n_beams = math.floor(self.FOV / self.resolution) + 1",
    explanation: "Se miden los dos extremos del FOV, así que hay un haz más que intervalos: ⌊π / (π/2)⌋ + 1 = 3 haces, a −90°, 0° y +90°." },
  { id: "P42-b15", lesson: "P4.2", topic: "plot_observations()", kind: "Práctica", format: "bug", source: "Práctica 4.2 (Assignment 1)",
    prompt: "El scan se dibuja como si el robot estuviera en el origen mirando hacia +x, aunque está en [6, 4, π/2]. ¿Qué línea tiene el error?",
    code: ["    x_local = distance*np.cos(angle)", "    y_local = distance*np.sin(angle)", "    pose_obs_global = tcomp(pose, np.vstack([x_local, y_local, 0]))", "    x = pose_obs_global[0]", "    y = pose_obs_global[1]", "    ax.plot(x_local, y_local, 'o', markersize=4, color=point_color)"],
    answer: 6, fix: "    ax.plot(x, y, 'o', markersize=4, color=point_color)",
    explanation: "x_local e y_local están en el marco del sensor. Lo que hay que dibujar en el mapa es el punto ya compuesto con la pose, x e y." },
  { id: "P42-z06", lesson: "P4.2", topic: "Incertidumbre de un punto", kind: "Práctica", format: "cloze", source: "Práctica 4.2 (Thinking about it)",
    prompt: "Completa la propagación de la covarianza del sensor (polares) a cartesianas en el marco del sensor.",
    code: "J = np.array([[np.cos(alpha), -r*np.{{0}}(alpha)],\n              [np.sin(alpha),  {{1}}*np.cos(alpha)]])\nSigma_c = J @ Q @ J.{{2}}",
    blanks: [["sin"], ["r"], ["T"]],
    explanation: "Es el mismo jacobiano polar → cartesiano de la práctica 4.1: la columna del ángulo lleva el factor r. La covarianza se propaga con J Q Jᵀ." },
  { id: "P42-z07", lesson: "P4.2", topic: "plot_virtual_map()", kind: "Práctica", format: "cloze", source: "Práctica 4.2",
    prompt: "Completa los límites del dibujo del mapa. Las columnas de virtual_map incluyen NaN para separar polígonos.",
    code: "plt.xlim([np.{{0}}(virtual_map[0])-2, np.{{1}}(virtual_map[0])+2])",
    blanks: [["nanmin"], ["nanmax"]],
    explanation: "np.min y np.max devuelven NaN si hay algún NaN en el array. np.nanmin y np.nanmax los ignoran, y así el dibujo queda con 2 m de margen alrededor del mapa." },

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
  // Errores y huecos que antes estaban en la guía 4.3 (ahora solo en el test).
  { id: "P43-b05", lesson: "P4.3", topic: "Comandos de topics", kind: "Práctica", format: "bug", source: "Práctica 4.3 (Assignment 2)",
    prompt: "Se quiere el tipo de cada topic, el frame_id de la IMU y la frecuencia con la que publica. ¿Qué línea está mal?",
    code: ["ros2 topic list -t", "ros2 topic echo /imu1 --once --no-arr", "ros2 topic echo /imu1          # to measure the rate"],
    answer: 3, fix: "ros2 topic hz /imu1",
    explanation: "`ros2 topic echo` imprime los mensajes, no su ritmo. La frecuencia de publicación se mide con `ros2 topic hz`." },
  { id: "P43-b06", lesson: "P4.3", topic: "Mundo XML", kind: "Práctica", format: "bug", source: "Práctica 4.3 (Assignment 5)",
    prompt: "Se quiere un láser con σ_r = 0,10 m y alcance 3 m, pero tras relanzar range_max sigue en 16.0. ¿Qué línea está mal?",
    code: ["<include file=\"../definitions/turtlebot3_burger.vehicle.xml\"", "    default_sensors=\"false\"", "    sensor_std_noise=\"0.10\" max_range=\"3.0\"", "/>", "<vehicle name=\"r1\" class=\"turtlebot3_burger\">", "    <include file=\"../definitions/rplidar-a2.sensor.xml\" sensor_name=\"laser1\" />", "</vehicle>"],
    answer: 3, fix: "(quitarla de ahí) <include file=\"../definitions/rplidar-a2.sensor.xml\" sensor_std_noise=\"0.10\" max_range=\"3.0\" sensor_name=\"laser1\" />",
    explanation: "El ruido y el alcance son argumentos del archivo del sensor, rplidar-a2.sensor.xml. Pasados al <include> de la clase del vehículo no los usa nadie: van en el <include> del láser, dentro de <vehicle name=\"r1\">." },
  { id: "P43-b07", lesson: "P4.3", topic: "Mundo XML", kind: "Práctica", format: "bug", source: "Práctica 4.3 (Assignment 5)",
    prompt: "Tras editar el mundo, el láser sigue con range_max = 16.0. ¿Qué paso falta (en qué línea habría que hacerlo)?",
    code: ["sudo nano demo_turtlebot_world.world.xml     # add max_range=\"3.0\" and save", "ros2 topic echo /laser1 --once --no-arr      # range_max: 16.0 ?"],
    answer: 2, fix: "Cerrar la simulación y relanzarla con ros2 launch mvsim demo_turtlebot_world.launch.py antes de leer /laser1",
    explanation: "MVSim solo lee el archivo del mundo al arrancar. Si no se relanza, el simulador sigue con la configuración anterior." },
  { id: "P43-b08", lesson: "P4.3", topic: "Mundo XML", kind: "Práctica", format: "bug", source: "Práctica 4.3 (Assignment 1)",
    prompt: "Al guardar el mundo, nano responde «Permission denied». ¿Qué línea está mal?",
    code: ["cd $(ros2 pkg prefix mvsim)/share/mvsim/mvsim_tutorial", "sudo cp demo_turtlebot_world.world.xml demo_turtlebot_world.world.xml.bak", "nano demo_turtlebot_world.world.xml"],
    answer: 3, fix: "sudo nano demo_turtlebot_world.world.xml",
    explanation: "El archivo está bajo /opt/ros/jazzy, que es del sistema: para guardarlo hace falta sudo." },
  { id: "P43-b09", lesson: "P4.3", topic: "tf2", kind: "Práctica", format: "bug", source: "Práctica 4.3 (Assignment 6)",
    prompt: "Se quiere el PDF del árbol tf y la pose del láser sobre el robot. ¿Qué línea falla?",
    code: ["cd /tmp", "ros2 run tf2_ros view_frames", "ros2 run tf2_ros tf2_echo base_link laser1"],
    answer: 2, fix: "ros2 run tf2_tools view_frames",
    explanation: "view_frames está en el paquete tf2_tools. En tf2_ros están tf2_echo y static_transform_publisher." },
  { id: "P43-c06", lesson: "P4.3", topic: "tf2", kind: "Práctica", format: "single", source: "Práctica 4.3 (Assignment 6)",
    prompt: "tf2_echo odom base_link da «Rotation: in Quaternion (xyzw) [0.000, 0.000, 0.788, 0.615]» y «Rotation: in RPY (radian) [0.000, -0.000, 1.816]». ¿Qué θ hay que usar para componer x ⊕ xₛ?",
    options: ["0,788 rad, la z del cuaternión", "0,615 rad, la w del cuaternión", "1,816 rad, el último valor de RPY", "0,788 + 0,615 rad"],
    answer: 2,
    explanation: "El yaw es el último valor de RPY en radianes. El cuaternión de un giro en Z es [0, 0, sin(θ/2), cos(θ/2)]: sin(0,908) = 0,788 y cos(0,908) = 0,615, y 2·atan2(0,788; 0,615) = 1,816." },
  { id: "P43-z05", lesson: "P4.3", topic: "Comandos de topics", kind: "Práctica", format: "cloze", source: "Práctica 4.3 (Assignment 6)",
    prompt: "Completa el comando que mueve el robot publicando 10 veces por segundo una velocidad lineal de 0,1 m/s y angular de 0,3 rad/s.",
    code: "ros2 topic pub -r 10 {{0}} geometry_msgs/msg/{{1}} \"{linear: {x: 0.1}, angular: {z: 0.3}}\"",
    blanks: [["/cmd_vel"], ["Twist"]],
    explanation: "Las órdenes de velocidad van por /cmd_vel con mensajes geometry_msgs/msg/Twist (linear y angular). -r 10 publica a 10 Hz." },
  { id: "P43-z06", lesson: "P4.3", topic: "Comandos de topics", kind: "Práctica", format: "cloze", source: "Práctica 4.3 (Assignment 2)",
    prompt: "Completa: medir la frecuencia de la IMU y ver cuántos publicadores tiene el topic de la cámara, que se quitó del mundo.",
    code: "ros2 topic {{0}} /imu1\nros2 topic {{1}} /camera1/image_raw     # Publisher count: 0",
    blanks: [["hz"], ["info"]],
    explanation: "hz mide la frecuencia de publicación; info da el tipo y el número de publicadores y suscriptores. El topic de la cámara sigue apareciendo porque RViz2 está suscrito, aunque nadie publique." },
  { id: "P43-z07", lesson: "P4.3", topic: "LaserScan", kind: "Práctica", format: "cloze", source: "Práctica 4.3 (Assignment 3)",
    prompt: "Completa el ángulo del haz k de un mensaje LaserScan, que solo guarda los alcances.",
    code: "alpha_k = scan.{{0}} + k * scan.{{1}}",
    blanks: [["angle_min"], ["angle_increment"]],
    explanation: "Los haces salen a ángulos equiespaciados: el primero en angle_min y cada uno angle_increment después del anterior, contando k desde 0." },

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

  // Errores y huecos que antes estaban en la guía 5.2 (ahora solo en el test).
  { id: "P52-b10", lesson: "P5.2", topic: "Sensor.observe()", kind: "Práctica", format: "bug", source: "Práctica 5.2 (Assignment 1)",
    prompt: "Con el robot mirando a +y, un landmark justo delante sale con marcación +90° en lugar de 0°. ¿Qué línea tiene el error?",
    code: ["delta = world - from_pose[0:2]", "z = np.empty_like(delta)", "z[0, :] = np.sqrt(delta[0, :]**2 + delta[1, :]**2)", "z[1, :] = np.arctan2(delta[1, :], delta[0, :])", "z[1, :] = AngleWrapList(z[1, :])"],
    answer: 4, fix: "z[1, :] = np.arctan2(delta[1, :], delta[0, :]) - from_pose[2, 0]",
    explanation: "atan2(Δy, Δx) da la dirección en el marco del mundo. La marcación se mide desde el frente del robot: hay que restar su orientación." },
  { id: "P52-b11", lesson: "P5.2", topic: "Sensor.observe()", kind: "Práctica", format: "bug", source: "Práctica 5.2 (Assignment 1)",
    prompt: "Con cov = diag(1, 0,49) (σ_d = 1 m, σ_θ = 0,7 rad), el ruido de la distancia sale bien, pero el de la marcación es demasiado pequeño. ¿Qué línea está mal?",
    code: ["z[1, :] = AngleWrapList(z[1, :])", "if noisy:", "    z += self.cov@random.randn(2, world.shape[1])", "if flatten:", "    return np.vstack(z.flatten('F'))"],
    answer: 3, fix: "    z += np.sqrt(self.cov)@random.randn(2, world.shape[1])",
    explanation: "randn da muestras de N(0, 1), y para escalarlas hay que multiplicar por la desviación típica, no por la varianza: con cov sin raíz, σ_θ sería 0,49 en vez de 0,7 (con σ_d = 1 no se nota). Como cov es diagonal, np.sqrt elemento a elemento es su raíz." },
  { id: "P52-b12", lesson: "P5.2", topic: "getObsJac()", kind: "Práctica", format: "bug", source: "Práctica 5.2 (Assignment 3)",
    prompt: "El jacobiano no coincide con el numérico en la fila de la marcación. ¿Qué línea tiene el error?",
    code: ["dx = Map[0, lm[i]] - xPred[0, 0]", "dy = Map[1, lm[i]] - xPred[1, 0]", "d = np.sqrt(dx**2 + dy**2)", "ii = 2*i", "jH[ii:ii+2,:] = [[-dx/d, -dy/d, 0], [dy/d, -dx/d, -1]]"],
    answer: 5, fix: "jH[ii:ii+2,:] = [[-dx/d, -dy/d, 0], [dy/d**2, -dx/d**2, -1]]",
    explanation: "La derivada de atan2(Δy, Δx) respecto a x e y lleva d² en el denominador: [Δy/d², −Δx/d²]. La fila de la distancia sí se divide entre d." },
  { id: "P52-b13", lesson: "P5.2", topic: "Predicción EKF", kind: "Práctica", format: "bug", source: "Práctica 5.2 (Assignment 4)",
    prompt: "Predicción del EKF. Los jacobianos del movimiento se evalúan en el punto equivocado. ¿Qué línea está mal?",
    code: ["xPred = tcomp(robot.xEst, u)", "G = J1(xPred, u)", "j2 = J2(robot.xEst, u)", "PPred = G@robot.PEst@G.T + j2@robot.cov_move@j2.T"],
    answer: 2, fix: "G = J1(robot.xEst, u)",
    explanation: "G linealiza el movimiento en el punto de partida, μ_{t−1} = robot.xEst. J1 usa el ángulo de su primer argumento, así que con xPred saldría otra matriz. La pose predicha se usa para H, no para G." },
  { id: "P52-b14", lesson: "P5.2", topic: "Corrección EKF", kind: "Práctica", format: "bug", source: "Práctica 5.2 (Assignment 4)",
    prompt: "La corrección falla porque la innovación no tiene las mismas dimensiones que z. ¿Qué línea tiene el error?",
    code: ["H = getObsJac(xPred, landmark, Map)", "Q_t = np.kron(np.eye(landmark.shape[0]), sensor.cov)", "K = PPred@H.T@linalg.inv(H@PPred@H.T + Q_t)", "innovation = z - sensor.observe(xPred, Map, noisy=False)", "innovation[1::2] = AngleWrapList(innovation[1::2])"],
    answer: 4, fix: "innovation = z - sensor.observe(xPred, Map[:, landmark], noisy=False)",
    explanation: "z solo contiene los landmarks observados. La medida esperada tiene que calcularse para esos mismos landmarks y en el mismo orden: Map[:, landmark]." },
  { id: "P52-b15", lesson: "P5.2", topic: "Corrección EKF", kind: "Práctica", format: "bug", source: "Práctica 5.2 (Assignment 5)",
    prompt: "Con el sensor FOV, la corrección funciona cuando se ve un landmark pero falla al ver dos. ¿Qué línea está mal?",
    code: ["H = getObsJac(xPred, landmark, Map)", "K = PPred@H.T@linalg.inv(H@PPred@H.T + sensor.cov)", "innovation = z - sensor.observe(xPred, Map[:, landmark], noisy=False)", "xEst = xPred + K@innovation"],
    answer: 2, fix: "K = PPred@H.T@linalg.inv(H@PPred@H.T + np.kron(np.eye(landmark.shape[0]), sensor.cov))",
    explanation: "Con n landmarks, H Σ̄ Hᵀ es 2n×2n y el ruido tiene que ser Q_t = kron(eye(n), Q), con un bloque 2×2 por landmark. sensor.cov solo encaja cuando n = 1." },
  { id: "P52-b16", lesson: "P5.2", topic: "FOVSensor", kind: "Práctica", format: "bug", source: "Práctica 5.2 (Assignment 5)",
    prompt: "El sensor de FOV = 90° ve también landmarks que están detrás del robot, a su derecha. ¿Qué línea tiene el error?",
    code: ["z = self.observe(from_pose, world, False, False)", "angle_limit = self.fov/2", "feats_idx = np.nonzero(np.asarray((z[0, :] < self.max_range) & (z[1, :] < angle_limit)))[0]"],
    answer: 3, fix: "feats_idx = np.nonzero(np.asarray((z[0, :] < self.max_range) & (np.abs(z[1, :]) < angle_limit)))[0]",
    explanation: "Las marcaciones a la derecha son negativas y siempre cumplen θ < 45°, aunque sean −170°. La condición es |θ| < α: falta np.abs." },
  { id: "P52-b17", lesson: "P5.2", topic: "FOVSensor", kind: "Práctica", format: "bug", source: "Práctica 5.2 (Assignment 5)",
    prompt: "Esta versión lanza «ValueError: The truth value of an array with more than one element is ambiguous». ¿Qué línea lo provoca?",
    code: ["z = self.observe(from_pose, world, False, False)", "angle_limit = self.fov/2", "feats_idx = np.nonzero((z[0, :] < self.max_range) and (np.abs(z[1, :]) < angle_limit))[0]"],
    answer: 3, fix: "feats_idx = np.nonzero((z[0, :] < self.max_range) & (np.abs(z[1, :]) < angle_limit))[0]",
    explanation: "`and` necesita un único booleano. Con arrays se combinan las condiciones elemento a elemento con `&`, y cada una entre paréntesis." },
  { id: "P52-b18", lesson: "P5.2", topic: "FOVSensor", kind: "Práctica", format: "bug", source: "Práctica 5.2 (Assignment 5)",
    prompt: "Con dos landmarks visibles, z sale como [d₁, d₂, θ₁, θ₂] y la innovación no encaja con H. ¿Qué línea tiene el error?",
    code: ["z = z[:, feats_idx]", "if z.size>0:", "    z = np.vstack(z.flatten('C'))", "return z, feats_idx"],
    answer: 3, fix: "    z = np.vstack(z.flatten('F'))",
    explanation: "flatten('C') recorre por filas. 'F' recorre por columnas y da [d₁, θ₁, d₂, θ₂, …], que es el orden de las filas de H y de los bloques de Q_t." },
  { id: "P52-z08", lesson: "P5.2", topic: "random_observation()", kind: "Práctica", format: "cloze", source: "Práctica 5.2 (Assignment 1)",
    prompt: "Completa random_observation(): elegir un landmark al azar y observarlo.",
    code: "n_landmarks = world.shape[{{0}}]\nrand_idx = random.{{1}}(0, n_landmarks)\nworld = world[:, {{2}}]\nz = self.observe(from_pose, world, noisy)\nreturn z, np.array([rand_idx])",
    blanks: [["1"], ["randint"], ["[rand_idx]"]],
    explanation: "Los landmarks están en columnas (shape[1]). randint(0, n) no incluye n, así que da de 0 a n−1. Con [rand_idx] entre corchetes se conserva la forma (2, 1)." },

  // ───────────── P5.3 · Filtro de partículas ─────────────
  { id: "P53-c01", lesson: "P5.3", topic: "Partículas", kind: "Práctica", format: "single", source: "Práctica 5.3",
    prompt: "¿Qué representa una partícula del filtro?",
    options: ["Una hipótesis concreta de pose con un peso relativo", "La media y covarianza de una única gaussiana", "Una celda ocupada del mapa", "Un haz del sensor láser sin pose asociada"],
    answer: 0,
    explanation: "Cada partícula guarda una pose candidata y un peso. El conjunto ponderado aproxima la creencia del robot y puede mantener varias hipótesis." },
  { id: "P53-c02", lesson: "P5.3", topic: "Campo de likelihood", kind: "Práctica", format: "single", source: "Práctica 5.3 (celda 7)",
    prompt: "¿Cómo consulta sample_likelihood() el campo para un punto que está dentro del mapa?",
    options: ["Redondea las coordenadas en píxeles y lee esa celda", "Interpola linealmente entre las cuatro celdas vecinas", "Calcula una distancia euclídea al centro del mapa", "Devuelve siempre la probabilidad de ocupación binaria"],
    answer: 0,
    explanation: "Divide por la resolución, invierte el orden de los ejes de la matriz y usa np.rint para elegir el píxel más cercano." },
  { id: "P53-c03", lesson: "P5.3", topic: "Campo de likelihood", kind: "Práctica", format: "single", source: "Práctica 5.3 (celda 7)",
    prompt: "¿Qué devuelve Map.sample_likelihood(point) si el punto queda fuera de los límites del mapa?",
    options: ["0", "MIN_LIKELIHOOD", "1", "Una excepción por índice fuera de rango"],
    answer: 1,
    explanation: "Devuelve MIN_LIKELIHOOD = 0.1. El valor positivo evita que un solo extremo anule por completo el producto." },
  { id: "P53-c04", lesson: "P5.3", topic: "Campo de likelihood", kind: "Práctica", format: "single", source: "Práctica 5.3 (celda 7)",
    prompt: "Con SIGMA_HIT_M = 0,5 m y resolution = 0,01 m/píxel, ¿qué desviación típica usa la gaussiana en píxeles?",
    options: ["0,005 px", "0,5 px", "5 px", "50 px"],
    answer: 3,
    explanation: "sigma_hit_px = SIGMA_HIT_M / resolution = 0,5 / 0,01 = 50 píxeles." },
  { id: "P53-c05", lesson: "P5.3", topic: "Predicción", kind: "Práctica", format: "single", source: "Práctica 5.3 (celda 19)",
    prompt: "¿Qué hace sample_motion_model(pose, movement, movement_covariance)?",
    options: ["Muestrea un movimiento gaussiano y lo compone con la pose mediante tcomp", "Suma el movimiento a la pose en coordenadas globales", "Calcula la media ponderada de las partículas", "Transforma los puntos del láser al mapa"],
    answer: 0,
    explanation: "Primero toma una muestra con media movement y covarianza movement_covariance; después aplica tcomp(pose, noisy_movement), porque el comando está en el marco local." },
  { id: "P53-c06", lesson: "P5.3", topic: "Corrección", kind: "Práctica", format: "single", source: "Práctica 5.3 (celda 24)",
    prompt: "¿Qué operación combina los likelihoods de los extremos dentro de evaluate_pointcloud()?",
    options: ["Se suman", "Se multiplican, iniciando total_prob en 1", "Se promedian antes de consultar el mapa", "Se ordenan y se conserva el mayor"],
    answer: 1,
    explanation: "El modelo del ejercicio toma el producto de los likelihoods de todos los puntos. 1 es el elemento neutro de la multiplicación." },
  { id: "P53-c07", lesson: "P5.3", topic: "Corrección", kind: "Práctica", format: "single", source: "Práctica 5.3 (celda 24)",
    prompt: "¿Por qué evaluate_pose() llama a express_as_global_point_cloud(z, pose)?",
    options: ["Para transformar rangos y ángulos del scan a puntos globales antes de consultar el mapa", "Para normalizar los pesos de las partículas", "Para convertir el mapa global al marco del sensor", "Para remuestrear una pose por cada haz"],
    answer: 0,
    explanation: "z contiene medidas polares locales. El campo de likelihood está expresado en coordenadas del mapa, así que hay que proyectar cada extremo usando la pose candidata." },
  { id: "P53-c08", lesson: "P5.3", topic: "Evaluación de partículas", kind: "Práctica", format: "single", source: "Práctica 5.3 (celda 29)",
    prompt: "¿Por qué la partícula verde obtiene mayor likelihood que las poses azul y magenta?",
    options: ["Está más cerca de la pose real y proyecta muchos extremos sobre las paredes", "Tiene el peso inicial más alto", "Su orientación se elimina al llamar a evaluate_pose()", "El mapa ignora los extremos que caen fuera de las paredes"],
    answer: 0,
    explanation: "La pose verde está casi alineada con la real. Sus extremos caen en el campo alto junto a las paredes; los scans azul y magenta se desplazan respecto al mapa." },
  { id: "P53-c09", lesson: "P5.3", topic: "Estimación", kind: "Práctica", format: "single", source: "Práctica 5.3 (celda 34)",
    prompt: "¿Cómo calcula current_estimation() una orientación media sin fallar en el salto entre −π y π?",
    options: ["Promedia directamente los ángulos", "Promedia cosenos y senos ponderados y aplica atan2(s, c)", "Ordena los ángulos y elige la mediana", "Resta el ángulo máximo del mínimo"],
    answer: 1,
    explanation: "Las orientaciones se representan como vectores unitarios. La media circular se recupera con atan2 de la componente seno y después la componente coseno." },
  { id: "P53-c10", lesson: "P5.3", topic: "Comparación de filtros", kind: "Práctica", format: "single", source: "Práctica 5.3 y 5.2",
    prompt: "¿Qué ventaja principal tienen las partículas frente al EKF cuando la creencia tiene dos modos separados?",
    options: ["Pueden mantener dos grupos de poses candidatas; el EKF representa una sola gaussiana", "No necesitan un modelo de movimiento", "Calculan la covarianza sin muestras", "Garantizan que el remuestreo conserve todas las hipótesis"],
    answer: 0,
    explanation: "Una nube ponderada puede conservar varios grupos. El EKF mantiene una sola aproximación gaussiana y podría promediar dos modos en una pose poco probable." },

  { id: "P53-n01", lesson: "P5.3", topic: "Normalización", kind: "Práctica", format: "numeric", source: "Práctica 5.3",
    prompt: "Tres pesos sin normalizar son [2, 5, 3]. ¿Cuál es el peso normalizado de la partícula 2?",
    answer: 0.5, tol: 0.001,
    explanation: "La suma es 2+5+3=10. El segundo peso normalizado es 5/10=0,5." },
  { id: "P53-n02", lesson: "P5.3", topic: "Remuestreo SIR", kind: "Práctica", format: "numeric", source: "Práctica 5.3",
    prompt: "Con pesos normalizados [0.2, 0.5, 0.3], ¿cuál es el segundo valor de la suma acumulada C?",
    answer: 0.7, tol: 0.001,
    explanation: "C₂ = 0,2 + 0,5 = 0,7." },
  { id: "P53-n03", lesson: "P5.3", topic: "Remuestreo SIR", kind: "Práctica", format: "numeric", source: "Práctica 5.3",
    prompt: "Con C = [0.2, 0.7, 1] y r = 0.69, ¿qué partícula se elige? Cuenta desde 1.",
    answer: 2, tol: 0,
    explanation: "0,2 < 0,69 ≤ 0,7, así que el primer acumulado que contiene r es C₂. searchsorted devuelve el índice base cero 1, que corresponde a la partícula 2." },
  { id: "P53-n04", lesson: "P5.3", topic: "Remuestreo SIR", kind: "Práctica", format: "numeric", source: "Práctica 5.3",
    prompt: "Con pesos [0.2, 0.5, 0.3] y r=[0.05, 0.21, 0.65, 0.71, 0.99], ¿cuántas veces aparece la partícula 2 tras el remuestreo?",
    answer: 2, tol: 0,
    explanation: "La acumulada es [0,2, 0,7, 1]. searchsorted selecciona los índices [0,1,1,2,2]; la partícula 2 aparece dos veces." },
  { id: "P53-n05", lesson: "P5.3", topic: "Estimación", kind: "Práctica", format: "numeric", source: "Práctica 5.3",
    prompt: "Las coordenadas x son [1, 4, 7] con pesos [0.2, 0.5, 0.3]. ¿Cuál es la media ponderada x̄?",
    answer: 4.3, tol: 0.001, unit: "m",
    explanation: "x̄ = 0,2·1 + 0,5·4 + 0,3·7 = 0,2 + 2 + 2,1 = 4,3 m." },
  { id: "P53-n06", lesson: "P5.3", topic: "Estimación", kind: "Práctica", format: "numeric", source: "Práctica 5.3",
    prompt: "Las coordenadas y son [2, 1, 5] con pesos [0.2, 0.5, 0.3]. ¿Cuál es la media ponderada ȳ?",
    answer: 2.4, tol: 0.001, unit: "m",
    explanation: "ȳ = 0,2·2 + 0,5·1 + 0,3·5 = 0,4 + 0,5 + 1,5 = 2,4 m." },
  { id: "P53-n07", lesson: "P5.3", topic: "Estimación", kind: "Práctica", format: "numeric", source: "Práctica 5.3",
    prompt: "Para x=[1,4,7], pesos [0.2,0.5,0.3] y x̄=4.3, ¿cuál es la varianza ponderada σ²x?",
    answer: 4.41, tol: 0.001, unit: "m²",
    explanation: "σ²x = 0,2(1−4,3)² + 0,5(4−4,3)² + 0,3(7−4,3)² = 2,178 + 0,045 + 2,187 = 4,41 m²." },
  { id: "P53-n08", lesson: "P5.3", topic: "Estimación", kind: "Práctica", format: "numeric", source: "Práctica 5.3",
    prompt: "Para y=[2,1,5], pesos [0.2,0.5,0.3] y ȳ=2.4, ¿cuál es la varianza ponderada σ²y?",
    answer: 3.04, tol: 0.001, unit: "m²",
    explanation: "σ²y = 0,2(2−2,4)² + 0,5(1−2,4)² + 0,3(5−2,4)² = 0,032 + 0,98 + 2,028 = 3,04 m²." },
  { id: "P53-n09", lesson: "P5.3", topic: "Estimación circular", kind: "Práctica", format: "numeric", source: "Práctica 5.3",
    prompt: "Dos ángulos de igual peso son 179° y −179°. ¿Qué media circular devuelve atan2(s̄,c̄), en radianes?",
    answer: 3.141592653589793, tol: 0.001, unit: "rad",
    explanation: "Los senos se cancelan y los cosenos dan una componente negativa: atan2(0,−0,99985)=π rad, equivalente a 180°." },
  { id: "P53-n10", lesson: "P5.3", topic: "Corrección", kind: "Práctica", format: "numeric", source: "Práctica 5.3",
    prompt: "Una pose da likelihoods 0,8, 0,25 y 0,5 para tres extremos. ¿Cuál es su producto?",
    answer: 0.1, tol: 0.001,
    explanation: "0,8·0,25·0,5 = 0,1. evaluate_pointcloud multiplica un factor por extremo." },

  { id: "P53-z01", lesson: "P5.3", topic: "Predicción", kind: "Práctica", format: "cloze", source: "Práctica 5.3 (celda 19)",
    prompt: "Completa el muestreo del comando y la composición con la pose anterior.",
    code: "noisy_movement = np.vstack(stats.multivariate_normal.rvs(movement.{{0}}(), movement_covariance))\nreturn {{1}}(pose, noisy_movement)",
    blanks: [["flatten"], ["tcomp"]],
    explanation: "SciPy recibe la media como vector 1D; la muestra se compone en el marco local con tcomp." },
  { id: "P53-z02", lesson: "P5.3", topic: "Corrección", kind: "Práctica", format: "cloze", source: "Práctica 5.3 (celda 24)",
    prompt: "Completa la actualización del likelihood del point cloud.",
    code: "total_prob = 1\nfor i in range(pointcloud.shape[1]):\n    total_prob {{0}} map.sample_likelihood(pointcloud[0:2, i])",
    blanks: [["*="]],
    explanation: "Se multiplica cada factor desde el elemento neutro 1; sumarlos no da la verosimilitud conjunta." },
  { id: "P53-z03", lesson: "P5.3", topic: "Corrección", kind: "Práctica", format: "cloze", source: "Práctica 5.3 (celda 24)",
    prompt: "Completa la transformación del scan antes de evaluar los puntos en el mapa.",
    code: "world_pointcloud = LaserUtils.{{0}}(z, pose)\nreturn evaluate_pointcloud({{1}}, world_pointcloud)",
    blanks: [["express_as_global_point_cloud"], ["map"]],
    explanation: "La observación polar local se convierte a extremos globales y estos se consultan en map." },
  { id: "P53-z04", lesson: "P5.3", topic: "Estimación circular", kind: "Práctica", format: "cloze", source: "Práctica 5.3 (celda 34)",
    prompt: "Completa la media circular: el primer hueco es el índice del seno y el segundo el del coseno.",
    code: "expected_angle = np.atan2(expected_value_direction[{{0}}], expected_value_direction[{{1}}])",
    blanks: [["1"], ["0"]],
    explanation: "atan2 recibe primero ȳ=Σw·sin(θ) y luego x̄=Σw·cos(θ)." },
  { id: "P53-z05", lesson: "P5.3", topic: "Remuestreo SIR", kind: "Práctica", format: "cloze", source: "Práctica 5.3 (celda 40)",
    prompt: "Completa la CDF y la búsqueda de los índices seleccionados.",
    code: "cumulative = np.{{0}}([particle.weight for particle in particles])\nselected = np.{{1}}(cumulative, r)",
    blanks: [["cumsum"], ["searchsorted"]],
    explanation: "cumsum crea los extremos acumulados; searchsorted devuelve el primer extremo que contiene cada r." },

  { id: "P53-b01", lesson: "P5.3", topic: "Predicción", kind: "Práctica", format: "bug", source: "Práctica 5.3 (celda 19)",
    prompt: "La llamada a rvs no coincide con la firma de SciPy. ¿Qué línea tiene el error?",
    code: ["noisy_movement = np.vstack(stats.multivariate_normal.rvs(movement_covariance, movement.flatten()))", "return tcomp(pose, noisy_movement)"],
    answer: 1, fix: "noisy_movement = np.vstack(stats.multivariate_normal.rvs(movement.flatten(), movement_covariance))",
    explanation: "rvs recibe primero la media y después la covarianza. La muestra resultante se compone con tcomp." },
  { id: "P53-b02", lesson: "P5.3", topic: "Corrección", kind: "Práctica", format: "bug", source: "Práctica 5.3 (celda 24)",
    prompt: "La función suma factores en vez de formar el likelihood conjunto. ¿Qué línea está mal?",
    code: ["total_prob = 1", "for i in range(pointcloud.shape[1]):", "    total_prob += map.sample_likelihood(pointcloud[0:2, i])", "return total_prob"],
    answer: 3, fix: "    total_prob *= map.sample_likelihood(pointcloud[0:2, i])",
    explanation: "La independencia condicional de los extremos se representa con el producto de sus likelihoods, no con la suma." },
  { id: "P53-b03", lesson: "P5.3", topic: "Corrección", kind: "Práctica", format: "bug", source: "Práctica 5.3 (celda 24)",
    prompt: "Se evalúa el scan polar como si ya estuviera en el mapa. ¿Qué línea falla?",
    code: ["world_pointcloud = LaserUtils.express_as_global_point_cloud(z, pose)", "return evaluate_pointcloud(map, z)"],
    answer: 2, fix: "return evaluate_pointcloud(map, world_pointcloud)",
    explanation: "La segunda línea debe pasar los puntos globales calculados en la primera, no los rangos y ángulos originales." },
  { id: "P53-b04", lesson: "P5.3", topic: "Estimación circular", kind: "Práctica", format: "bug", source: "Práctica 5.3 (celda 34)",
    prompt: "Los argumentos de atan2 están invertidos. ¿Qué línea tiene el error?",
    code: ["expected_value_direction += np.vstack([np.cos(angle), np.sin(angle)]) * particle.weight", "expected_angle = np.atan2(expected_value_direction[0], expected_value_direction[1])"],
    answer: 2, fix: "expected_angle = np.atan2(expected_value_direction[1], expected_value_direction[0])",
    explanation: "La convención de NumPy es atan2(y, x): seno primero y coseno después." },
  { id: "P53-b05", lesson: "P5.3", topic: "Remuestreo SIR", kind: "Práctica", format: "bug", source: "Práctica 5.3 (celda 40)",
    prompt: "La búsqueda recibe primero los números aleatorios y después la CDF. ¿Qué línea está mal?",
    code: ["cumulative = np.cumsum([particle.weight for particle in particles])", "r = np.random.uniform(0, 1, M)", "selected = np.searchsorted(r, cumulative)"],
    answer: 3, fix: "selected = np.searchsorted(cumulative, r)",
    explanation: "searchsorted recibe primero la secuencia ordenada de límites y después los valores que se buscan." },

  // Errores y huecos que antes estaban en la guía 5.3 (ahora solo en el test).
  { id: "P53-b06", lesson: "P5.3", topic: "sample_motion_model()", kind: "Práctica", format: "bug", source: "Práctica 5.3 (Assignment 1)",
    prompt: "Con el robot mirando a +y, un comando de avance [1, 0, 0] mueve las partículas hacia +x. ¿Qué línea tiene el error?",
    code: ["noisy_movement = np.vstack(", "    stats.multivariate_normal.rvs(movement.flatten(), movement_covariance)", ")", "return pose + noisy_movement"],
    answer: 4, fix: "return tcomp(pose, noisy_movement)",
    explanation: "El comando es un incremento en el marco del robot. Hay que girarlo con la orientación de la partícula, que es lo que hace tcomp. Sumarlo lo aplica en el marco del mundo." },
  { id: "P53-b07", lesson: "P5.3", topic: "current_estimation()", kind: "Práctica", format: "bug", source: "Práctica 5.3 (Assignment 3)",
    prompt: "La varianza en x sale siempre 0, aunque las partículas estén dispersas. ¿Qué línea tiene el error?",
    code: ["var_x = 0.", "var_y = 0.", "for particle in particles:", "    var_x += particle.weight * (particle.pose[0, 0] - particle.pose[0, 0])**2", "    var_y += particle.weight * (particle.pose[1, 0] - expected_pose[1, 0])**2"],
    answer: 4, fix: "    var_x += particle.weight * (particle.pose[0, 0] - expected_pose[0, 0])**2",
    explanation: "La varianza mide la dispersión respecto a la media, no respecto a cada partícula: hay que restar la estimación, expected_pose." },
  { id: "P53-b08", lesson: "P5.3", topic: "Bucle del filtro", kind: "Práctica", format: "bug", source: "Práctica 5.3 (Assignment 5)",
    prompt: "La pose estimada pierde la información de los pesos: es la media simple de las copias. ¿Qué línea está fuera de su sitio?",
    code: ["sample(pf.particles, move, cov)", "pf.update_weights(occupancy_map, z)", "pf.particles = resample(pf.particles)", "estimated_pose, estimated_covariance = current_estimation(pf.particles)"],
    answer: 3, fix: "(mover al final) pf.particles = resample(pf.particles), después de current_estimation()",
    explanation: "El orden es predicción → corrección → estimación → remuestreo. Tras remuestrear todos los pesos valen 1/M, así que la estimación debe hacerse antes." },
  { id: "P53-z06", lesson: "P5.3", topic: "resample()", kind: "Práctica", format: "cloze", source: "Práctica 5.3 (Assignment 4)",
    prompt: "Completa resample(): el último acumulado, los números aleatorios y el peso de las copias.",
    code: "cumulative = np.cumsum([particle.weight for particle in particles])\ncumulative[-1] = {{0}}\nr = np.random.uniform(0, 1, {{1}})\nselected = np.searchsorted(cumulative, r)\nreturn [Particle(particles[k].pose.copy(), {{2}}) for k in selected]",
    blanks: [["1.", "1", "1.0"], ["M", "len(particles)"], ["1. / M", "1/M", "1./M", "1.0/M"]],
    explanation: "Se fuerza el último acumulado a 1 para que el redondeo no deje un hueco al final. Se sortean M números, uno por partícula nueva, y todas las copias quedan con peso 1/M." },

  // ───────────── P5.4 · AMCL en ROS 2 ─────────────
  { id: "P54-s01", lesson: "P5.4", topic: "AMCL y partículas", kind: "Práctica", format: "single", source: "Práctica 5.4",
    prompt: "¿Qué describe mejor a AMCL de Nav2 frente al filtro de partículas básico de la práctica 5.3?",
    options: ["Un filtro de partículas adaptativo con mecanismos de KLD-sampling y recuperación", "Un EKF que mantiene una sola gaussiana", "Un filtro que solo integra la odometría", "Un mapa que convierte cada scan directamente en una pose"],
    answer: 0,
    explanation: "AMCL conserva hipótesis de pose mediante partículas y añade tamaño adaptativo de la nube y recuperación cuando las observaciones recientes indican que podría estar perdido." },
  { id: "P54-s02", lesson: "P5.4", topic: "KLD-sampling", kind: "Práctica", format: "single", source: "Práctica 5.4",
    prompt: "¿De qué depende principalmente el número de partículas que pide KLD-sampling?",
    options: ["De cuántos bins del espacio de pose ocupa la creencia y de los límites configurados", "Solo del número de beams del láser", "De la longitud del mensaje `/amcl_pose`", "De la velocidad máxima del robot"],
    answer: 0,
    explanation: "Una creencia extendida o con varios modos ocupa más bins y necesita más muestras que una nube concentrada. `min_particles` y `max_particles` acotan el número." },
  { id: "P54-s03", lesson: "P5.4", topic: "Augmented MCL", kind: "Práctica", format: "single", source: "Práctica 5.4",
    prompt: "¿Qué indica `max(0, 1 − w_fast/w_slow)` en Augmented MCL?",
    options: ["La fracción de poses aleatorias que puede inyectarse si cae la verosimilitud reciente", "El número máximo de beams que se procesan", "La probabilidad de publicar `/amcl_pose`", "La desviación típica de yaw"],
    answer: 0,
    explanation: "`w_fast` reacciona deprisa y `w_slow` cambia lentamente. Si la media rápida baja respecto a la lenta, aumenta la inyección de partículas aleatorias para intentar recuperarse." },
  { id: "P54-s04", lesson: "P5.4", topic: "Likelihood field", kind: "Práctica", format: "single", source: "Práctica 5.4",
    prompt: "¿Qué compara el modelo `likelihood_field` al ponderar una pose?",
    options: ["La distancia de los extremos del scan a las celdas ocupadas del mapa", "El texto del mensaje `LaserScan` con el nombre del mapa", "La pose AMCL con la pose real publicada por el simulador", "La velocidad angular con el número de partículas"],
    answer: 0,
    explanation: "Los extremos del scan se proyectan al mapa y se puntúan según su cercanía a las zonas ocupadas; los extremos alineados con paredes suelen ser más compatibles." },
  { id: "P54-s05", lesson: "P5.4", topic: "Actualización del filtro", kind: "Práctica", format: "single", source: "Práctica 5.4",
    prompt: "Con `update_min_d = 0.05` y `update_min_a = 0.05`, ¿cuándo habilita AMCL una nueva actualización con el scan?",
    options: ["Cuando supera el umbral de distancia o el de ángulo desde la última actualización", "Solo al completar exactamente 0.05 m y 0.05 rad a la vez", "En cada mensaje de `/tf`, sin importar el movimiento", "Solo cuando RViz2 publica `/initialpose`"],
    answer: 0,
    explanation: "AMCL evita procesar cada scan si el robot casi no se ha movido; basta superar el umbral lineal o angular configurado." },
  { id: "P54-s06", lesson: "P5.4", topic: "Árbol tf", kind: "Práctica", format: "single", source: "Práctica 5.4",
    prompt: "¿Por qué AMCL publica `map → noisy_odom` en lugar de `map → base_link`?",
    options: ["Porque `base_link` ya tiene como padre a `noisy_odom`, y en tf cada frame tiene un solo padre", "Porque AMCL no conoce el mapa", "Porque `/tf` solo permite una transformación por mensaje", "Porque `base_link` es un topic, no un frame"],
    answer: 0,
    explanation: "AMCL corrige el marco odométrico; al componer `map → noisy_odom` con `noisy_odom → base_link` se obtiene la pose del robot en el mapa sin crear un segundo padre." },
  { id: "P54-s07", lesson: "P5.4", topic: "Topics", kind: "Práctica", format: "single", source: "Práctica 5.4 (celda 7)",
    prompt: "¿Qué tipo de mensaje publica `/amcl_pose`?",
    options: ["`geometry_msgs/msg/PoseWithCovarianceStamped`", "`nav_msgs/msg/OccupancyGrid`", "`nav2_msgs/msg/ParticleCloud`", "`sensor_msgs/msg/LaserScan`"],
    answer: 0,
    explanation: "Incluye la pose estimada en el mapa, un sello temporal y una covarianza 6×6 aplanada." },
  { id: "P54-s08", lesson: "P5.4", topic: "Localización global", kind: "Práctica", format: "single", source: "Práctica 5.4 (celda 35)",
    prompt: "Tras `reinitialize_global_localization`, AMCL terminó a 21.4 m de la pose real. ¿Cómo se interpreta ese resultado en este almacén?",
    options: ["Es una convergencia posible a un pasillo visualmente similar; el enunciado advierte de esta ambigüedad", "Demuestra que `std_srvs/srv/Empty` recibió una petición incorrecta", "Significa que `/map` estaba vacío", "Es el error esperado de convertir el cuaternión a yaw"],
    answer: 0,
    explanation: "Pasillos repetidos pueden generar scans muy parecidos. Con un conjunto finito de partículas, las hipótesis correctas pueden desaparecer durante el remuestreo." },
  { id: "P54-s09", lesson: "P5.4", topic: "Robot secuestrado", kind: "Práctica", format: "single", source: "Práctica 5.4 (celda 37)",
    prompt: "¿Qué limitación tuvo la prueba de secuestro documentada?",
    options: ["Empezó con AMCL ya perdido, no se cronometró y no se recuperó durante la prueba", "AMCL empezó bien localizado y se recuperó en exactamente 23.6 s", "No se publicó `/initialpose`", "La nube se quedó uniformemente repartida en el mapa"],
    answer: 0,
    explanation: "La prueba partió de la localización global equivocada; el error final fue 23.6 m. Por eso no mide cuánto tardaría en recuperarse desde una pose inicialmente correcta." },
  { id: "P54-s10", lesson: "P5.4", topic: "Número de partículas", kind: "Práctica", format: "single", source: "Práctica 5.4 (celda 41)",
    prompt: "¿Qué mostró la prueba con un máximo de 20 partículas?",
    options: ["Un error de unos 0.80 m y una covarianza demasiado optimista, compatible con pérdida de diversidad", "Un error de 0.12 m y una nube más diversa que con 500 partículas", "Una localización global correcta en todos los pasillos", "Que KLD-sampling no cambia la incertidumbre"],
    answer: 0,
    explanation: "Con tan pocas partículas puede desaparecer la pose correcta; muchas partículas repetidas hacen que la covarianza parezca pequeña aunque la estimación esté equivocada." },
  { id: "P54-s11", lesson: "P5.4", topic: "Pose inicial", kind: "Práctica", format: "single", source: "Práctica 5.4",
    prompt: "¿Qué topic publica la herramienta 2D Pose Estimate de RViz2 para inicializar AMCL?",
    options: ["`/initialpose`", "`/amcl_pose`", "`/particle_cloud`", "`/scanner1`"],
    answer: 0,
    explanation: "La pose inicial y su incertidumbre se envían como `geometry_msgs/msg/PoseWithCovarianceStamped` en `/initialpose`." },

  { id: "P54-n01", lesson: "P5.4", topic: "Error de posición", kind: "Práctica", format: "numeric", source: "Práctica 5.4 (celda 18)",
    prompt: "Con ground truth (2.944, −0.175) m y odometría (1.633, −3.545) m, ¿cuál es el error euclídeo? Redondea a 3 decimales.",
    answer: 3.616, tol: 0.002, unit: "m",
    explanation: "e = √[(1.633−2.944)² + (−3.545+0.175)²] = 3.616 m." },
  { id: "P54-n02", lesson: "P5.4", topic: "Error de posición", kind: "Práctica", format: "numeric", source: "Práctica 5.4 (celda 18)",
    prompt: "Con ground truth (2.944, −0.175) m y AMCL (2.988, −0.064) m, ¿cuál es el error euclídeo? Redondea a 3 decimales.",
    answer: 0.119, tol: 0.002, unit: "m",
    explanation: "e = √[(2.988−2.944)² + (−0.064+0.175)²] ≈ 0.1194 m, que redondeado a 3 decimales es 0.119 m." },
  { id: "P54-n03", lesson: "P5.4", topic: "Pesos de partículas", kind: "Práctica", format: "numeric", source: "Práctica 5.4 (celda 27)",
    prompt: "Tras el remuestreo hay 501 partículas equiponderadas. ¿Cuál es el peso de cada una?",
    answer: 0.001996007984031936, tol: 0.000000001,
    explanation: "Cada peso es 1/M = 1/501 = 0.001996007984…; los 501 pesos suman 1." },
  { id: "P54-n04", lesson: "P5.4", topic: "Covarianza", kind: "Práctica", format: "numeric", source: "Práctica 5.4 (celda 30)",
    prompt: "La covarianza tiene var(x)=0.00553823284647151 m² en el índice 0. ¿Cuál es σx en metros? Redondea a 4 decimales.",
    answer: 0.0744, tol: 0.0002, unit: "m",
    explanation: "σx = √var(x) = √0.00553823284647151 ≈ 0.074419 m, es decir, 0.0744 m." },
  { id: "P54-n05", lesson: "P5.4", topic: "Orientación", kind: "Práctica", format: "numeric", source: "Práctica 5.4 (celda 17)",
    prompt: "Para el cuaternión plano z=−0.7394309553, w=0.6732323985, calcula yaw = 2 atan2(z,w) en grados. Redondea a 1 decimal.",
    answer: -95.4, tol: 0.15, unit: "°",
    explanation: "2 atan2(−0.7394309553, 0.6732323985) = −1.66445 rad = −95.3659°, aproximadamente −95.4°." },
  { id: "P54-n06", lesson: "P5.4", topic: "Covarianza", kind: "Práctica", format: "numeric", source: "Práctica 5.4 (celda 40)",
    prompt: "Con cov(x,y)=0.0212656698, var(x)=0.0490816873 y var(y)=0.0110596239, ¿cuál es ρxy? Redondea a 2 decimales.",
    answer: 0.91, tol: 0.01,
    explanation: "ρxy = cov(x,y)/√[var(x)var(y)] = 0.0212656698/√(0.0490816873·0.0110596239) ≈ 0.9127, es decir, 0.91." },

  { id: "P54-z01", lesson: "P5.4", topic: "Comandos ROS 2", kind: "Práctica", format: "cloze", source: "Práctica 5.4",
    prompt: "Completa el comando para inspeccionar las suscripciones y publicadores de AMCL.",
    code: "ros2 node {{0}} /amcl",
    blanks: [["info"]],
    explanation: "`node info` resume la interfaz del nodo: topics, servicios y acciones." },
  { id: "P54-z02", lesson: "P5.4", topic: "Comandos ROS 2", kind: "Práctica", format: "cloze", source: "Práctica 5.4",
    prompt: "Completa el comando para leer la nube sin desplegar todos los elementos del array.",
    code: "ros2 topic echo --once {{0}} {{1}}",
    blanks: [["/particle_cloud"], ["--no-arr"]],
    explanation: "`--once` termina tras un mensaje y `--no-arr` resume los arrays largos." },
  { id: "P54-z03", lesson: "P5.4", topic: "Comandos ROS 2", kind: "Práctica", format: "cloze", source: "Práctica 5.4",
    prompt: "Completa el campo anidado para imprimir solo la posición estimada.",
    code: "ros2 topic echo --once /amcl_pose --field {{0}}",
    blanks: [["pose.pose.position"]],
    explanation: "`--field` selecciona el campo dentro del mensaje `PoseWithCovarianceStamped`." },
  { id: "P54-z04", lesson: "P5.4", topic: "Servicios ROS 2", kind: "Práctica", format: "cloze", source: "Práctica 5.4",
    prompt: "Completa las órdenes para averiguar el tipo de servicio y reinicializar la localización global.",
    code: "ros2 service {{0}} /reinitialize_global_localization\nros2 service call /reinitialize_global_localization {{1}}",
    blanks: [["type"], ["std_srvs/srv/Empty"]],
    explanation: "Primero se consulta el tipo. Como `Empty` no lleva datos, la llamada no necesita una petición entre llaves." },
  { id: "P54-z05", lesson: "P5.4", topic: "Parámetros y tf", kind: "Práctica", format: "cloze", source: "Práctica 5.4",
    prompt: "Completa el cambio del máximo de partículas y la orden que genera el diagrama tf.",
    code: "ros2 param set /amcl {{0}} 20\nros2 run tf2_tools {{1}}",
    blanks: [["max_particles"], ["view_frames"]],
    explanation: "`param set` cambia el parámetro del nodo activo; `view_frames` genera el diagrama del árbol." },

  { id: "P54-b01", lesson: "P5.4", topic: "Comandos ROS 2", kind: "Práctica", format: "bug", source: "Práctica 5.4",
    prompt: "Una línea no selecciona correctamente el campo del mensaje. ¿Cuál hay que corregir?",
    code: ["ros2 topic echo --once --field /amcl_pose pose.pose.position", "ros2 node info /amcl"],
    answer: 1, fix: "ros2 topic echo --once /amcl_pose --field pose.pose.position",
    explanation: "El topic se pasa después de `--once`; `--field` va como una opción con la ruta del campo." },
  { id: "P54-b02", lesson: "P5.4", topic: "Árbol tf", kind: "Práctica", format: "bug", source: "Práctica 5.4",
    prompt: "En estas afirmaciones se asignan padres tf. ¿Qué línea crearía dos padres para `base_link`?",
    code: ["AMCL publica map → base_link.", "odom_simulator publica noisy_odom → base_link.", "Cada frame debe tener un solo padre."],
    answer: 1, fix: "AMCL publica map → noisy_odom.",
    explanation: "`base_link` ya es hijo de `noisy_odom`; AMCL debe publicar `map → noisy_odom` y la composición da la pose en el mapa." },
  { id: "P54-b03", lesson: "P5.4", topic: "Servicios ROS 2", kind: "Práctica", format: "bug", source: "Práctica 5.4",
    prompt: "La llamada no usa el tipo Empty correcto. ¿Qué línea está mal?",
    code: ["ros2 service type /reinitialize_global_localization", "ros2 service call /reinitialize_global_localization nav2_msgs/srv/Empty"],
    answer: 2, fix: "ros2 service call /reinitialize_global_localization std_srvs/srv/Empty",
    explanation: "El servicio de reinicialización global usa `std_srvs/srv/Empty`, no `nav2_msgs/srv/Empty`." },

  // Huecos que antes estaban en la guía 5.4 (ahora solo en el test).
  { id: "P54-z06", lesson: "P5.4", topic: "Árbol tf", kind: "Práctica", format: "cloze", source: "Práctica 5.4 (Assignment 1)",
    prompt: "Completa la composición que da la pose estimada por AMCL en el mapa.",
    code: "x_AMCL = (map → {{0}}) ⊕ ({{1}} → base_link)",
    blanks: [["noisy_odom"], ["noisy_odom"]],
    explanation: "AMCL publica la corrección map → noisy_odom, y odom_simulator publica noisy_odom → base_link. Componer los dos tramos da la pose del robot en el mapa." },
  { id: "P54-z07", lesson: "P5.4", topic: "Pose y cuaternión", kind: "Práctica", format: "cloze", source: "Práctica 5.4 (Assignment 4)",
    prompt: "Completa el yaw de una pose plana a partir de su cuaternión (roll y pitch nulos).",
    code: "yaw = 2 * np.arctan2(q.{{0}}, q.{{1}})",
    blanks: [["z"], ["w"]],
    explanation: "El cuaternión de un giro θ en Z es [0, 0, sin(θ/2), cos(θ/2)], así que θ = 2·atan2(z, w). Sin el 2 se obtiene la mitad del ángulo." },

  // ───────────── P6.3 · Mapas de rejilla de ocupación ─────────────
  { id: "P63-c01", lesson: "P6.3", topic: "Planteamiento", kind: "Práctica", format: "single", source: "Práctica 6.3",
    prompt: "En el mapeado del notebook 6.3, ¿qué se conoce y qué se estima?",
    options: ["Se conoce el mapa; se estima la pose del robot", "Se conocen los comandos u₁:ₜ; se estiman las poses y el mapa a la vez", "Se conocen las poses y las observaciones; se estima P(mᵢ | z₁:ₜ, x₁:ₜ) de cada celda", "Se conocen las celdas ocupadas; se estiman las observaciones"],
    answer: 2,
    explanation: "Es el problema inverso a la localización: con poses conocidas no hacen falta los comandos y solo se estima la ocupación de cada celda, suponiendo que las celdas son independientes." },
  { id: "P63-c02", lesson: "P6.3", topic: "Rejilla", kind: "Práctica", format: "single", source: "Práctica 6.3 (celda 20)",
    prompt: "OccupancyGridMap(14, 12, 0.1) crea un mapa de 14 m de ancho y 12 m de alto. ¿Qué devuelve grid_map.map.shape?",
    options: ["(140, 120)", "(120, 140)", "(12, 14)", "(1200, 1400)"],
    answer: 1,
    explanation: "El alto da las filas (12/0,1 = 120) y el ancho, las columnas (14/0,1 = 140). NumPy devuelve (filas, columnas)." },
  { id: "P63-c03", lesson: "P6.3", topic: "Log odds", kind: "Práctica", format: "single", source: "Práctica 6.3 (celda 46)",
    prompt: "¿Por qué l_0 = −ln(p_occupied/p_free) vale 0 en el notebook y qué implica?",
    options: ["Porque las celdas empiezan libres", "Porque el sensor no tiene ruido", "Porque log odds solo se usa al final para umbralizar", "Porque el prior es 0,5 y ln(1) = 0: la rejilla arranca en P = 0,5 y l_0 no altera las sumas"],
    answer: 3,
    explanation: "Con P(mᵢ) = 0,5 los odds valen 1 y su logaritmo, 0. Por eso log_odds se inicializa a ceros y probabilities a 0,5." },
  { id: "P63-c04", lesson: "P6.3", topic: "Índices", kind: "Práctica", format: "single", source: "Práctica 6.3 (celda 46)",
    prompt: "Cada celda de cells_to_update es una tupla (x, y). ¿Cómo se accede a su log odds?",
    options: ["grid_map.log_odds[cell[1]][cell[0]]", "grid_map.log_odds[cell[0]][cell[1]]", "grid_map.log_odds[cell]", "grid_map.log_odds[cell[0] * cell[1]]"],
    answer: 0,
    explanation: "La matriz se indexa [fila][columna] y la fila corresponde a y. Mezclar (x, y) con (fila, columna) traspone el mapa." },
  { id: "P63-c05", lesson: "P6.3", topic: "Modelo inverso", kind: "Práctica", format: "single", source: "Práctica 6.3 (celda 40)",
    prompt: "Las celdas detrás del impacto (ρ > d y f < 0,5) reciben 0,5. ¿Qué efecto tienen en el mapa?",
    options: ["Se marcan como libres", "Se marcan como ocupadas", "Ninguno: τ = ln(0,5/0,5) = 0 y la celda conserva su valor", "Se reinician a 0,5 aunque ya tuvieran información"],
    answer: 2,
    explanation: "El láser no ve detrás del obstáculo. Sumar 0 en log odds no cambia la celda, así que el interior de los objetos sigue gris." },
  { id: "P63-c06", lesson: "P6.3", topic: "Ray tracing", kind: "Práctica", format: "single", source: "Práctica 6.3 (celda 32)",
    prompt: "¿Por qué se pasan a ray_tracing() índices truncados con int() en lugar de x/resolution como flotante?",
    options: ["Porque ray_tracing no acepta números negativos", "Porque ray_tracing redondea con round(): el extremo 66,52 acabaría en la celda 67 en vez de 66", "Porque int() convierte metros en celdas sin dividir", "Porque así la recta tiene siempre 10 celdas"],
    answer: 1,
    explanation: "La celda que contiene un punto es la parte entera de x/res. Con flotantes, ray_tracing aplica round() y las celdas finales no coinciden con las esperadas." },
  { id: "P63-c07", lesson: "P6.3", topic: "Extremos de los haces", kind: "Práctica", format: "single", source: "Práctica 6.3 (celda 24)",
    prompt: "En beams_endpoints(), ¿cuándo se ejecuta el else del bucle for _ in range(max_attempts+1)?",
    options: ["En cada iteración en la que el extremo cae fuera", "Siempre después del primer intento", "Nunca: es código muerto", "Solo si el bucle termina sin break: ningún extremo cayó dentro del mapa y se usa la posición del robot"],
    answer: 3,
    explanation: "En Python, el else de un for se ejecuta cuando el bucle acaba sin break. Es el caso extremo en que reducir Δd no basta." },
  { id: "P63-c08", lesson: "P6.3", topic: "Pipeline", kind: "Práctica", format: "single", source: "Práctica 6.3 (celda 57)",
    prompt: "¿En qué orden procesa process_new_observation() una observación?",
    options: ["Modelo inverso → extremos → probabilidades → log odds", "Log odds → celdas → extremos → umbrales", "Extremos → celdas (Bresenham) → modelo inverso → log odds → probabilidades", "Celdas → extremos → log odds → modelo inverso"],
    answer: 2,
    explanation: "Primero se calculan los extremos de los haces, después las celdas que recorren y su probabilidad según el modelo inverso. Con eso se suman los log odds y se convierten en probabilidades." },
  { id: "P63-c09", lesson: "P6.3", topic: "move_robot()", kind: "Práctica", format: "single", source: "Práctica 6.3 (celda 57)",
    prompt: "¿Por qué move_robot() declara global robot_pose?",
    options: ["Para que tcomp sea más rápido", "Porque reasigna robot_pose; sin global sería local y fallaría al leerla en tcomp(robot_pose, u)", "Porque las variables NumPy no pueden ser locales", "Para que el láser cambie de pose automáticamente"],
    answer: 1,
    explanation: "Al asignar una variable dentro de una función, Python la trata como local. Leerla antes de asignarla da UnboundLocalError." },
  { id: "P63-c10", lesson: "P6.3", topic: "Resultados", kind: "Práctica", format: "single", source: "Práctica 6.3 (celda 61)",
    prompt: "En el mapa final aparecen rayas blancas dentro de la mesa. ¿Cuál es la causa?",
    options: ["Laser2D falla con el haz de ángulo absoluto exactamente π y atraviesa el obstáculo", "El modelo inverso asigna 0,2 a las celdas detrás del impacto", "log_odds está indexado al revés", "El umbral inferior 0,3 es demasiado alto"],
    answer: 0,
    explanation: "Desde (11,5, 4,5, π/2), el haz 179 mide 0,50 m y el 180 mide 2,0 m: la comprobación sign(phi) == sign(phi_m) falla entre π y −π, y las celdas del interior se marcan libres." },
  { id: "P63-c11", lesson: "P6.3", topic: "Log odds", kind: "Práctica", format: "single", source: "Práctica 6.3",
    prompt: "¿Cuál es la principal ventaja de actualizar en log odds?",
    options: ["Evita tener que hacer ray tracing", "Hace innecesario el modelo inverso del sensor", "Permite que las celdas dependan unas de otras", "La actualización recursiva es una suma y no hay problemas numéricos cerca de 0 o 1"],
    answer: 3,
    explanation: "lₜ = τₜ + lₜ₋₁ + l₀ es una suma, y l va de −∞ a +∞. La probabilidad se recupera solo cuando hace falta, con la sigmoide." },

  { id: "P63-n01", lesson: "P6.3", topic: "Rejilla", kind: "Práctica", format: "numeric", source: "Práctica 6.3",
    prompt: "¿Cuántas celdas tiene una rejilla de 14 m × 12 m con resolución 0,1 m?",
    answer: 16800, tol: 0,
    explanation: "120 filas × 140 columnas = 16 800 celdas." },
  { id: "P63-n02", lesson: "P6.3", topic: "Índices", kind: "Práctica", format: "numeric", source: "Práctica 6.3 (celda 32)",
    prompt: "Con resolución 0,1 m, ¿qué índice x de celda calcula get_cells_to_update() para un robot en x = 3,27 m?",
    answer: 32, tol: 0,
    explanation: "int(3,27/0,1) = int(32,7) = 32. Se trunca, no se redondea." },
  { id: "P63-n03", lesson: "P6.3", topic: "Extremos de los haces", kind: "Práctica", format: "numeric", source: "Práctica 6.3 (celda 26)",
    prompt: "Robot (5, 4, π/4); haz con d = 1,35469679 m y α = −1,57868806 rad; Δd = 1 m. ¿Cuál es x_end? Redondea a 4 decimales.",
    answer: 6.6518, tol: 0.0005, unit: "m",
    explanation: "θᵢ = π/4 − 1,57868806 = −0,79329 rad; x = 5 + 2,354697·cos(−0,79329) = 6,6518 m." },
  { id: "P63-n04", lesson: "P6.3", topic: "Extremos de los haces", kind: "Práctica", format: "numeric", source: "Práctica 6.3 (celda 24)",
    prompt: "Mapa de 14 m de ancho (x_max = 13,9). Robot en x = 12,5 con θ = 0, haz con d = 1,05 m y α = 0. Si Δd empieza en 1 y baja de 0,1 en 0,1, ¿con qué Δd se acepta el extremo?",
    answer: 0.3, tol: 0.001, unit: "m",
    explanation: "Hace falta 12,5 + 1,05 + Δd ≤ 13,9, o sea Δd ≤ 0,35. El primer valor de la serie 1; 0,9; …; 0,4; 0,3 que lo cumple es 0,3 (x = 13,85)." },
  { id: "P63-n05", lesson: "P6.3", topic: "Ray tracing", kind: "Práctica", format: "numeric", source: "Práctica 6.3 (celda 34)",
    prompt: "¿Cuántas celdas devuelve el algoritmo de Bresenham del notebook entre las celdas (50, 40) y (79, 25)?",
    answer: 30, tol: 0,
    explanation: "Se avanza por el eje dominante: max(|79−50|, |25−40|) + 1 = max(29, 15) + 1 = 30, como el segundo haz de prueba." },
  { id: "P63-n06", lesson: "P6.3", topic: "Modelo inverso", kind: "Práctica", format: "numeric", source: "Práctica 6.3 (celda 40)",
    prompt: "Con σ = 0,4 (en celdas), ¿cuánto vale f(ρ) en una celda con ρ − d = −0,3 celdas? Redondea a 4 decimales.",
    answer: 0.7528, tol: 0.0005,
    explanation: "f = 0,9974·exp(−0,5·0,09/0,16) = 0,9974·exp(−0,28125) = 0,7528. No se cumple ninguna de las dos primeras condiciones y no supera 0,8, así que P = 0,7528." },
  { id: "P63-n07", lesson: "P6.3", topic: "Modelo inverso", kind: "Práctica", format: "numeric", source: "Práctica 6.3 (celda 40)",
    prompt: "σ = 0,4, l_th = 0,2. Una celda está 1 celda antes del impacto (ρ − d = −1). ¿Qué probabilidad le asigna el modelo inverso?",
    answer: 0.2, tol: 0.0001,
    explanation: "f = 0,9974·exp(−0,5/0,16) = 0,0438 < 0,2 y ρ < d, así que se asigna l_th = 0,2 (libre)." },
  { id: "P63-n08", lesson: "P6.3", topic: "Log odds", kind: "Práctica", format: "numeric", source: "Práctica 6.3 (celda 48)",
    prompt: "¿Qué log odds τ suma una celda a la que el modelo inverso asigna P = 0,2? Redondea a 4 decimales.",
    answer: -1.3863, tol: 0.0005,
    explanation: "τ = ln(0,2/0,8) = ln(0,25) = −1,3863. Es el −1,38629436 de la salida esperada de la celda 48." },
  { id: "P63-n09", lesson: "P6.3", topic: "Log odds", kind: "Práctica", format: "numeric", source: "Práctica 6.3",
    prompt: "Prior 0,5. Una celda se observa 3 veces como libre (P = 0,2). ¿Cuál es su probabilidad de ocupación? Redondea a 4 decimales.",
    answer: 0.0154, tol: 0.0005,
    explanation: "l = 3·(−1,3863) = −4,1589; P = 1 − 1/(1 + e^(−4,1589)) = 0,0154." },
  { id: "P63-n10", lesson: "P6.3", topic: "Log odds", kind: "Práctica", format: "numeric", source: "Práctica 6.3",
    prompt: "Prior 0,5. Una celda recibe dos impactos con P = 0,8 y una observación libre con P = 0,2. ¿Cuál es su probabilidad final?",
    answer: 0.8, tol: 0.0005,
    explanation: "l = 1,3863 + 1,3863 − 1,3863 = 1,3863, y P = 1 − 1/(1 + e^1,3863) = 0,8." },
  { id: "P63-n11", lesson: "P6.3", topic: "Probabilidades", kind: "Práctica", format: "numeric", source: "Práctica 6.3 (celda 52)",
    prompt: "Una celda tiene log odds l = 2. ¿Qué probabilidad calcula update_probabilities()? Redondea a 4 decimales.",
    answer: 0.8808, tol: 0.0005,
    explanation: "P = 1 − 1/(1 + e²) = 1 − 1/8,389 = 0,8808." },
  { id: "P63-n12", lesson: "P6.3", topic: "Log odds", kind: "Práctica", format: "numeric", source: "Práctica 6.3 (celda 46)",
    prompt: "Si el prior de ocupación fuera P(mᵢ) = 0,3, ¿cuánto valdría l_0 = −ln(p_occupied/p_free)? Redondea a 4 decimales.",
    answer: 0.8473, tol: 0.0005,
    explanation: "l_0 = −ln(0,3/0,7) = −(−0,8473) = 0,8473. Con la convención del notebook se suma en cada actualización." },

  { id: "P63-z01", lesson: "P6.3", topic: "Rejilla", kind: "Práctica", format: "cloze", source: "Práctica 6.3 (celda 18)",
    prompt: "Completa el constructor de OccupancyGridMap.",
    code: "rows, cols = int(round({{0}} / resolution)), int(round({{1}} / resolution))\nself.map = np.ones((rows, cols))\nself.log_odds = np.{{2}}((rows, cols))\nself.probabilities = np.full((rows, cols), {{3}})",
    blanks: [["height"], ["width"], ["zeros"], ["0.5", ".5"]],
    explanation: "El alto da las filas y el ancho, las columnas. Log odds 0 equivale a P = 0,5." },
  { id: "P63-z02", lesson: "P6.3", topic: "Extremos de los haces", kind: "Práctica", format: "cloze", source: "Práctica 6.3 (celda 24)",
    prompt: "Completa el cálculo del extremo de cada haz.",
    code: "theta_i = {{0}} + beam_angle\nx = x_robot + (beam_distance + adjusted_d) * np.{{1}}(theta_i)\ny = y_robot + (beam_distance + adjusted_d) * np.{{2}}(theta_i)",
    blanks: [["theta_robot"], ["cos"], ["sin"]],
    explanation: "El ángulo del haz es relativo al robot. Se proyecta la distancia prolongada con coseno en x y seno en y." },
  { id: "P63-z03", lesson: "P6.3", topic: "Modelo inverso", kind: "Práctica", format: "cloze", source: "Práctica 6.3 (celda 40)",
    prompt: "Completa la distancia medida en celdas y la condición de celda libre.",
    code: "d_i = z[{{0}}, beam_index] {{1}} resolution\n...\nif rho {{2}} d_i and f < l_th:\n    p_cell_occupied[beam_index].append(l_th)",
    blanks: [["0"], ["/"], ["<"]],
    explanation: "La fila 0 de z son las distancias; se dividen por la resolución para pasarlas a celdas. Las celdas libres están antes del impacto." },
  { id: "P63-z04", lesson: "P6.3", topic: "Log odds", kind: "Práctica", format: "cloze", source: "Práctica 6.3 (celda 46)",
    prompt: "Completa la actualización de log odds de una celda (x, y).",
    code: "tau_t = np.log(p_occupied / ({{0}} - p_occupied))\ngrid_map.log_odds[traversed_cell[{{1}}]][traversed_cell[{{2}}]] {{3}} tau_t + l_0",
    blanks: [["1"], ["1"], ["0"], ["+="]],
    explanation: "τ es el logaritmo de los odds p/(1−p). Se indexa [y][x] y se acumula con += sobre lₜ₋₁." },
  { id: "P63-z05", lesson: "P6.3", topic: "Probabilidades", kind: "Práctica", format: "cloze", source: "Práctica 6.3 (celda 52)",
    prompt: "Completa la conversión de log odds a probabilidades.",
    code: "grid_map.probabilities = 1 - 1 / (1 + np.{{0}}(grid_map.{{1}}))",
    blanks: [["exp"], ["log_odds"]],
    explanation: "P = 1 − 1/(1 + e^l), aplicada a toda la matriz de una vez." },
  { id: "P63-z06", lesson: "P6.3", topic: "move_robot()", kind: "Práctica", format: "cloze", source: "Práctica 6.3 (celda 57)",
    prompt: "Completa el movimiento del robot y la nueva medida.",
    code: "u = np.vstack([dx, dy, dtheta])\nrobot_pose = {{0}}(robot_pose, u)\nlaser.{{1}}(robot_pose)\nz = laser.take_observation({{2}})",
    blanks: [["tcomp"], ["set_pose"], ["virtual_map"]],
    explanation: "El incremento es local y se compone con tcomp. Después se mueve el láser y se mide sobre el mapa virtual." },

  { id: "P63-b01", lesson: "P6.3", topic: "Rejilla", kind: "Práctica", format: "bug", source: "Práctica 6.3 (celda 18)",
    prompt: "El mapa sale traspuesto respecto a log_odds. ¿Qué línea tiene el error?",
    code: ["rows, cols = int(round(height / resolution)), int(round(width / resolution))", "self.map = np.ones((cols, rows))", "self.log_odds = np.zeros((rows, cols))"],
    answer: 2, fix: "self.map = np.ones((rows, cols))",
    explanation: "Las tres matrices deben tener forma (filas, columnas) = (alto/res, ancho/res)." },
  { id: "P63-b02", lesson: "P6.3", topic: "Índices", kind: "Práctica", format: "bug", source: "Práctica 6.3 (celda 32)",
    prompt: "El robot aparece en una celda absurda. ¿Qué línea convierte mal metros en celdas?",
    code: ["robot_cell_indices = [int(robot_pose[0, 0] * resolution), int(robot_pose[1, 0] * resolution)]", "for beam_endpoint in z_endpoints.T:", "    beam_endpoint_cell_indices = [int(beam_endpoint[0] / resolution), int(beam_endpoint[1] / resolution)]"],
    answer: 1, fix: "robot_cell_indices = [int(robot_pose[0, 0] / resolution), int(robot_pose[1, 0] / resolution)]",
    explanation: "Para pasar de metros a celdas se divide por la resolución: 5 m / 0,1 = celda 50, no 0,5." },
  { id: "P63-b03", lesson: "P6.3", topic: "Modelo inverso", kind: "Práctica", format: "bug", source: "Práctica 6.3 (celda 40)",
    prompt: "Las probabilidades no tienen sentido. ¿Qué línea toma un dato equivocado de z?",
    code: ["d_i = z[1, beam_index] / resolution", "rho = np.sqrt((cell[0] - x)**2 + (cell[1] - y)**2)", "f = 1 / np.sqrt(2 * np.pi * sigma**2) * np.exp(-0.5 * (rho - d_i)**2 / sigma**2)"],
    answer: 1, fix: "d_i = z[0, beam_index] / resolution",
    explanation: "La fila 0 de z son las distancias y la fila 1, los ángulos." },
  { id: "P63-b04", lesson: "P6.3", topic: "Modelo inverso", kind: "Práctica", format: "bug", source: "Práctica 6.3 (celda 40)",
    prompt: "Las celdas libres nunca reciben 0,2. ¿Qué línea está mal?",
    code: ["if rho > d_i and f < l_th:", "    p_cell_occupied[beam_index].append(l_th)", "elif rho > d_i and f < 0.5:", "    p_cell_occupied[beam_index].append(0.5)"],
    answer: 1, fix: "if rho < d_i and f < l_th:",
    explanation: "Las celdas libres son las que el haz atraviesa antes del impacto: ρ < d." },
  { id: "P63-b05", lesson: "P6.3", topic: "Índices", kind: "Práctica", format: "bug", source: "Práctica 6.3 (celda 46)",
    prompt: "El mapa construido sale traspuesto. ¿Qué línea tiene el error?",
    code: ["tau_t = np.log(p_occupied / (1 - p_occupied))", "grid_map.log_odds[traversed_cell[0]][traversed_cell[1]] += tau_t + l_0"],
    answer: 2, fix: "grid_map.log_odds[traversed_cell[1]][traversed_cell[0]] += tau_t + l_0",
    explanation: "La celda es (x, y) y la matriz se indexa [fila][columna] = [y][x]." },
  { id: "P63-b06", lesson: "P6.3", topic: "Log odds", kind: "Práctica", format: "bug", source: "Práctica 6.3 (celda 46)",
    prompt: "El mapa solo recuerda la última observación. ¿Qué línea falla?",
    code: ["for traversed_cell, p_occupied in zip(cells_to_update[beam_index], p_cells_occupied[beam_index]):", "    tau_t = np.log(p_occupied / (1 - p_occupied))", "    grid_map.log_odds[traversed_cell[1]][traversed_cell[0]] = tau_t + l_0"],
    answer: 3, fix: "    grid_map.log_odds[traversed_cell[1]][traversed_cell[0]] += tau_t + l_0",
    explanation: "lₜ = τₜ + lₜ₋₁ + l₀: hay que acumular con += sobre el valor anterior." },
  { id: "P63-b07", lesson: "P6.3", topic: "Probabilidades", kind: "Práctica", format: "bug", source: "Práctica 6.3 (celda 52)",
    prompt: "Las paredes salen blancas y el suelo, negro. ¿Qué línea está mal?",
    code: ["def update_probabilities(grid_map):", "    grid_map.probabilities = 1 / (1 + np.exp(grid_map.log_odds))"],
    answer: 2, fix: "    grid_map.probabilities = 1 - 1 / (1 + np.exp(grid_map.log_odds))",
    explanation: "1/(1 + e^l) es la probabilidad de libre. La de ocupado es 1 − 1/(1 + e^l) = e^l/(1 + e^l)." },
  { id: "P63-b08", lesson: "P6.3", topic: "move_robot()", kind: "Práctica", format: "bug", source: "Práctica 6.3 (celda 57)",
    prompt: "Al girar y avanzar, el robot no va en la dirección en la que mira. ¿Qué línea tiene el error?",
    code: ["u = np.vstack([dx, dy, dtheta])", "robot_pose = robot_pose + u", "laser.set_pose(robot_pose)", "z = laser.take_observation(virtual_map)"],
    answer: 2, fix: "robot_pose = tcomp(robot_pose, u)",
    explanation: "u es un incremento en el marco del robot; hay que rotarlo con θ, que es lo que hace tcomp." },
  // Errores que antes estaban en la guía 6.3 (ahora solo en el test).
  { id: "P63-b09", lesson: "P6.3", topic: "OccupancyGridMap", kind: "Práctica", format: "bug", source: "Práctica 6.3 (Assignment 1)",
    prompt: "Con un mapa de 0,7 m de alto y resolución 0,1 m, la rejilla sale con 6 filas en lugar de 7. ¿Qué línea tiene el error?",
    code: ["self.width = width", "self.height = height", "self.resolution = resolution", "rows, cols = int(height / resolution), int(width / resolution)", "self.map = np.ones((rows, cols))"],
    answer: 4, fix: "rows, cols = int(round(height / resolution)), int(round(width / resolution))",
    explanation: "En coma flotante 0,7/0,1 = 6,999…, e int() trunca a 6. Redondeando antes se obtienen las 7 filas correctas." },
  { id: "P63-b10", lesson: "P6.3", topic: "beams_endpoints()", kind: "Práctica", format: "bug", source: "Práctica 6.3 (Assignment 2)",
    prompt: "Con el robot mirando a +y, los extremos de los haces salen girados 90°, como si mirara a +x. ¿Qué línea tiene el error?",
    code: ["theta_robot = robot_pose[2, 0]", "x_robot, y_robot = robot_pose[0, 0], robot_pose[1, 0]", "theta_i = beam_angle", "x = x_robot + (beam_distance + adjusted_d) * np.cos(theta_i)", "y = y_robot + (beam_distance + adjusted_d) * np.sin(theta_i)"],
    answer: 3, fix: "theta_i = theta_robot + beam_angle",
    explanation: "El ángulo del haz que da el láser es relativo al robot. En el mundo, la dirección del haz es la orientación del robot más ese ángulo." },
  { id: "P63-b11", lesson: "P6.3", topic: "beams_endpoints()", kind: "Práctica", format: "bug", source: "Práctica 6.3 (Assignment 2)",
    prompt: "Los extremos de los haces salen reflejados respecto a la diagonal. ¿Qué línea tiene el error?",
    code: ["theta_i = theta_robot + beam_angle", "x = x_robot + (beam_distance + adjusted_d) * np.sin(theta_i)", "y = y_robot + (beam_distance + adjusted_d) * np.cos(theta_i)"],
    answer: 2, fix: "x = x_robot + (beam_distance + adjusted_d) * np.cos(theta_i)  (y con np.sin en la línea 3)",
    explanation: "Pasar de polares a cartesianas es x = d·cos θ, y = d·sin θ. Con seno y coseno cambiados, el punto se refleja respecto a la recta y = x." },
  { id: "P63-b12", lesson: "P6.3", topic: "get_cells_to_update()", kind: "Práctica", format: "bug", source: "Práctica 6.3 (Assignment 3)",
    prompt: "inverse_beam_sensor_model() falla porque cells_to_update ya no tiene una lista por haz. ¿Qué línea tiene el error?",
    code: ["for beam_endpoint in z_endpoints.T:", "    beam_endpoint_cell_indices = [int(beam_endpoint[0] / resolution), int(beam_endpoint[1] / resolution)]", "    cells_indices = list(ray_tracing(robot_cell_indices[0], robot_cell_indices[1], beam_endpoint_cell_indices[0], beam_endpoint_cell_indices[1]))", "    valid_cells_indices = [(int(x), int(y)) for x, y in cells_indices if 0 <= int(x) < grid_shape[1] and 0 <= int(y) < grid_shape[0]]", "    cells_to_update.extend(valid_cells_indices)"],
    answer: 5, fix: "    cells_to_update.append(valid_cells_indices)",
    explanation: "extend mete las celdas sueltas en una sola lista y se pierde a qué haz pertenece cada una. Con append se guarda una lista por haz, que después se empareja con su distancia z[0, beam_index]." },
  { id: "P63-b13", lesson: "P6.3", topic: "inverse_beam_sensor_model()", kind: "Práctica", format: "bug", source: "Práctica 6.3 (Assignment 4)",
    prompt: "Casi todas las celdas de cada haz reciben 0,5 («detrás del obstáculo»), aunque estén delante. ¿Qué línea tiene el error?",
    code: ["x = robot_pose[0, 0] / resolution", "y = robot_pose[1, 0] / resolution", "d_i = z[0, beam_index]", "for cell in cells_to_update[beam_index]:", "    rho = np.sqrt((cell[0] - x)**2 + (cell[1] - y)**2)"],
    answer: 3, fix: "d_i = z[0, beam_index] / resolution",
    explanation: "rho está en celdas, así que d_i también tiene que estarlo. En metros, con celdas de 0,1 m, d_i queda 10 veces más corta y casi todas las celdas parecen estar detrás del impacto." },
  { id: "P63-b14", lesson: "P6.3", topic: "update_log_odds()", kind: "Práctica", format: "bug", source: "Práctica 6.3 (Assignment 5)",
    prompt: "Una celda vista una vez como ocupada (p = 0,8) acaba con log odds −0,223 en lugar de +1,386. ¿Qué línea tiene el error?",
    code: ["p_occupied = p_cells_occupied[beam_index][cell_index]", "tau_t = np.log(p_occupied)", "grid_map.log_odds[traversed_cell[1]][traversed_cell[0]] += tau_t + l_0"],
    answer: 2, fix: "tau_t = np.log(p_occupied / (1 - p_occupied))",
    explanation: "El término del modelo inverso es en log odds, ln(p / (1 − p)): ln(0,8/0,2) = 1,386. ln(0,8) = −0,223 es el logaritmo de la probabilidad, que además es negativo para cualquier p < 1." },
  { id: "P63-b15", lesson: "P6.3", topic: "move_robot()", kind: "Práctica", format: "bug", source: "Práctica 6.3 (Assignment 6)",
    prompt: "La pose del robot avanza bien, pero el mapa se rellena siempre con scans tomados desde la pose inicial. ¿Qué línea falta? (Pulsa la línea antes de la cual debería ir).",
    code: ["global robot_pose", "u = np.vstack([dx, dy, dtheta])", "robot_pose = tcomp(robot_pose, u)", "z = laser.take_observation(virtual_map)", "process_new_observation(grid_map, robot_pose, z)"],
    answer: 4, fix: "laser.set_pose(robot_pose)   (antes de take_observation)",
    explanation: "El láser guarda su propia pose. Si no se actualiza con set_pose(), sigue midiendo desde la anterior aunque robot_pose haya cambiado." },
];

const lessonNames = { L4: "L4 · Percepción", L5: "L5 · Localización", "P4.1": "Práctica 4.1 · Landmarks", "P4.2": "Práctica 4.2 · Láser", "P4.3": "Práctica 4.3 · ROS 2", "P5.2": "Práctica 5.2 · EKF", "P5.3": "Práctica 5.3 · Filtro de partículas", "P5.4": "Práctica 5.4 · AMCL en ROS 2", "P6.3": "Práctica 6.3 · Rejilla de ocupación" };
const lessonOrder = ["L4", "L5", "P4.1", "P4.2", "P4.3", "P5.2", "P5.3", "P5.4", "P6.3"];
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
  let sessionTag = null;
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
      if (kind === "wuolah" && !q.wuolah) return false;
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
    sessionTag = null;
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

  window.RoboTest = {
    questions,
    getProgress: () => progress,
    start(list, tag) {
      if (!Array.isArray(list) || !list.length) return;
      session = [...list];
      sessionTag = tag ?? null;
      responses = {};
      current = 0;
      $("#filter-error").textContent = "";
      $("#quiz").hidden = false;
      $("#result").hidden = true;
      showQuestion();
      $("#quiz").scrollIntoView({ behavior: "smooth", block: "start" });
    },
  };

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
    const wuolahNote = q.wuolah && !q.source.startsWith("Wuolah") ? ` · También en Wuolah (${q.wuolah})` : "";
    $("#question-meta").textContent = `${lessonNames[q.lesson]} · ${q.topic} · ${formatNames[q.format]} · ${q.source}${wuolahNote}`;
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
    document.dispatchEvent(new CustomEvent("robotest:answer", {
      detail: { id: q.id, correct, tag: sessionTag },
    }));
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
    document.dispatchEvent(new CustomEvent("robotest:finish", {
      detail: { tag: sessionTag, right, total: session.length },
    }));
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
