---
title: ROS 2 — guía de estudio y prácticas
lang: es-ES
---

# ROS 2 — guía de estudio y prácticas

Referencia ampliable: conceptos de la lección, comandos útiles y prácticas realizadas. Los ejemplos de MVSim corresponden a la práctica **2.1 Getting started with ROS2 and MVSim**; sus rutas y comandos de instalación están pensados para Ubuntu 24.04 con ROS 2 Jazzy, no para ejecutarse directamente en macOS.

## 1. Modelo mental

**ROS 2** es un ecosistema de bibliotecas y herramientas para construir robots; no sustituye al sistema operativo. Divide el software en **nodos** que intercambian información y coordinan tareas. Un **paquete** agrupa el código y los recursos; al ejecutar sus programas aparece un **grafo** de nodos y comunicaciones.

```text
Paquete (código) → ejecutable → nodo en ejecución
Sensor → publica topic → nodo de control → envía órdenes → actuador
                          ↕ servicio / acción
                     otros nodos
```

ROS 2 usa **DDS** para transportar datos y descubrir nodos sin un maestro central. La **QoS** configura propiedades de comunicación como fiabilidad e historial: publicador y suscriptor necesitan políticas compatibles para intercambiar mensajes.

## 2. Elementos: qué son y cuándo usarlos

| Elemento | Definición y función |
|---|---|
| **Paquete** | Unidad de organización y distribución de software. Contiene nodos, configuración o interfaces; `package.xml` declara sus metadatos y dependencias. Puede construirse con `ament_cmake` (C++) o `ament_python` (Python). |
| **Workspace** | Directorio de trabajo con `src/` (fuentes), `build/` (intermedios), `install/` (resultado) y `log/` (registros). `colcon` construye los paquetes. |
| **Ejecutable y nodo** | El ejecutable es el programa que se inicia; un **nodo** es un componente ROS 2 en ejecución, normalmente con una responsabilidad concreta. Un ejecutable puede alojar varios nodos. |
| **Grafo ROS** | Conjunto de nodos activos y sus conexiones: topics, servicios y acciones. No es lo mismo que la estructura de archivos de los paquetes. |
| **Namespace** | Prefijo que separa recursos con el mismo nombre; por ejemplo, `/turtlesim1/turtle1/pose` distingue una simulación de otra. |
| **Interfaz** | Define la estructura de datos intercambiados. `.msg` define mensajes, `.srv` petición y respuesta, y `.action` objetivo, resultado y feedback. |
| **Topic** | Canal con nombre para datos publicados por uno o más nodos y recibidos por uno o más suscriptores. Útil para flujos como lecturas láser o velocidades; no espera una respuesta. |
| **Servicio** | Intercambio cliente–servidor de **petición → respuesta**. Útil para operaciones puntuales, como crear una tortuga o reiniciar un sensor. |
| **Parámetro** | Valor de configuración que pertenece a un nodo; puede consultarse o, si el nodo lo admite, modificarse en ejecución. Ejemplo: una velocidad o una frecuencia. |
| **Acción** | Operación cliente–servidor que puede durar tiempo: acepta un objetivo, ofrece feedback, termina con un resultado y permite cancelación. Útil para navegar hasta una posición. |
| **Launch file** | Archivo Python, XML o YAML que arranca y configura varios procesos/nodos, sus argumentos y namespaces de una vez. |

**Regla para elegir:** datos continuos → **topic**; consulta/orden breve con respuesta → **servicio**; tarea prolongada con progreso o cancelación → **acción**; ajuste de un nodo → **parámetro**.

### Conceptos que añade la práctica de MVSim

- **MVSim** simula mundo, física, robot y sensores; **RViz2** visualiza *datos ROS 2* y transformaciones, no el mundo XML completo. La GUI de MVSim muestra el estado interno de la simulación; RViz2 solo muestra lo publicado y configurado para representar.
- **Archivo `.world.xml`**: describe escenario, vehículos, posición inicial, sensores y GUI. Una **clase** de vehículo (`jackal`) es una definición reutilizable; una **instancia** (`robot`) es el vehículo concreto colocado en ese mundo. `<include>` incorpora definiciones y admite argumentos como `default_sensors` o `sensor_period_sec`; `${sensor_yaw|0.0}` usa un valor recibido o el predeterminado `0.0`.
- **Sensores y frecuencia**: un **LiDAR** mide distancias mediante rayos (2D: barrido plano; 3D: espacio); una **cámara RGB** produce imágenes; una **IMU** mide movimiento inercial (aceleración y giro); **GNSS/GPS** proporciona posición global. `sensor_period_sec="0.10"` supone teóricamente $f=1/T=10\,\text{Hz}$. La frecuencia efectiva se comprueba con `ros2 topic hz` y puede variar por la carga de simulación.
- **Mapa de ocupación**: representación de celdas libres, ocupadas o desconocidas que RViz2 puede dibujar; no equivale a mostrar toda la geometría visual de MVSim.
- **Publicador, suscriptor y tipo**: MVSim publica `/scanner1` (`sensor_msgs/msg/LaserScan`) y RViz2 puede suscribirse; MVSim se suscribe a `/cmd_vel` (`geometry_msgs/msg/Twist`). Para conectarse importan **nombre, tipo y QoS compatible**. Un topic puede figurar aunque no haya publicadores o suscriptores: los extremos se descubren por separado.
- **QoS**: además de fiabilidad e historial/profundidad, incluye durabilidad (disponibilidad de mensajes para suscriptores nuevos) y plazo esperado entre mensajes. `ros2 topic info <topic> --verbose` enseña endpoints y políticas.
- **Odometría frente a verdad de simulación**: `/odom` representa una estimación del movimiento que puede acumular deriva; `/base_pose_ground_truth` es la pose que el simulador conoce exactamente, útil para evaluar estimadores pero no como entrada de uno que pretenda estimar la posición.
- **`Twist` y velocidades locales**: en `/cmd_vel`, `linear.x` indica avance/retroceso en m/s y `angular.z` giro en rad/s, respecto al robot; en un robot terrestre de tracción diferencial el resto suele quedar a cero. Publicar a la vez desde dos nodos en `/cmd_vel` **no** establece prioridades automáticamente.
- **Watchdog**: si dejan de llegar órdenes durante demasiado tiempo, MVSim puede detener el robot. `Ctrl+C` mata al publicador, pero no manda una velocidad cero: para parar inmediatamente se publica un `Twist` nulo; el watchdog queda como respaldo.
- **TF y marcos de referencia**: `map → odom → base_link → sensores` relaciona una referencia global, una referencia odométrica local continua, el cuerpo del robot y los sensores. `/tf` publica transformaciones dinámicas y `/tf_static` las estáticas; RViz2 las necesita para colocar los datos. Las órdenes `Twist` se entienden en el marco local del vehículo en esta práctica.
- **Tiempo simulado**: el simulador puede publicar un reloj para que los nodos usen tiempo de simulación; `disable_sim_time_clock` cambia ese comportamiento. Hay que distinguir este reloj del tiempo real del ordenador.
- **Overlay y entorno**: `source /opt/ros/jazzy/setup.bash` expone ROS 2 instalado; `source <workspace>/install/setup.bash` añade los paquetes propios. Cada terminal tiene su entorno; `colcon build` genera `build/`, `install/` y `log/`.
- **`rclpy`**: biblioteca Python para crear nodos ROS 2. `create_publisher(Twist, '/cmd_vel', 10)` crea un publicador (el `10` es profundidad de cola/QoS abreviada); `publish` envía mensajes. `rclpy.spin()` procesa callbacks bloqueando; `spin_once(..., timeout_sec=0.0)` permite atenderlos dentro de un bucle de teclado.

## 3. Comandos de consulta y ejecución

Los argumentos entre `< >` son marcadores que debes sustituir. Los comandos de inspección del grafo requieren nodos en marcha.

| Comando | Para qué sirve |
|---|---|
| `ros2 pkg list` | Lista paquetes disponibles. |
| `ros2 pkg executables <paquete>` | Lista ejecutables de un paquete. |
| `ros2 pkg prefix <paquete>` | Muestra su ubicación de instalación. |
| `ros2 pkg prefix --share mvsim` | Encuentra el directorio de recursos instalados de MVSim sin suponer una ruta fija. |
| `ros2 run <paquete> <ejecutable>` | Inicia un ejecutable del paquete. |
| `ros2 launch <paquete> <archivo_launch>` | Arranca el conjunto configurado en un archivo launch. |
| `ros2 node list` | Lista nodos activos. |
| `ros2 node info <nodo>` | Muestra sus publicadores, suscriptores, servicios y acciones. |
| `ros2 interface show <tipo>` | Muestra campos de una interfaz de mensaje, servicio o acción. |

### Topics

| Comando | Para qué sirve |
|---|---|
| `ros2 topic list` | Lista topics activos. |
| `ros2 topic info <topic>` | Muestra tipo y número de publicadores/suscriptores de un topic. |
| `ros2 topic info <topic> --verbose` | Añade nombres de nodos, extremos y perfiles QoS; útil para detectar publicadores duplicados. |
| `ros2 topic echo <topic>` | Imprime los mensajes recibidos continuamente; `--once` lee uno y sale. |
| `ros2 topic hz <topic>` | Mide la frecuencia de publicación. |
| `ros2 topic pub -r <Hz> <topic> <tipo> '<datos>'` | Publica mensajes periódicos del tipo indicado. |

Un caso del tema es `/turtle1/cmd_vel`: recibe mensajes `geometry_msgs/msg/Twist` con componentes `linear` y `angular`. La tortuga interpreta esos mensajes como órdenes de movimiento. Con `turtlesim_node` abierto en otra terminal, se puede probar así:

```bash
ros2 topic pub --once /turtle1/cmd_vel geometry_msgs/msg/Twist '{linear: {x: 1.0}, angular: {z: 0.5}}'
```

`--once` envía un único mensaje; `-r <Hz>` lo repetiría periódicamente.

### Servicios, parámetros y acciones

| Comando | Para qué sirve |
|---|---|
| `ros2 service list` | Lista servicios disponibles. |
| `ros2 service type <servicio>` | Obtiene el tipo de interfaz de un servicio. |
| `ros2 service find <tipo>` | Busca servicios con ese tipo. |
| `ros2 service call <servicio> <tipo> '<petición>'` | Envía una petición y espera respuesta. |
| `ros2 param list` | Lista parámetros de los nodos activos. |
| `ros2 param get <nodo> <parámetro>` | Lee un valor. |
| `ros2 param set <nodo> <parámetro> <valor>` | Solicita cambiarlo. |
| `ros2 param describe <nodo> <parámetro>` | Muestra su descripción y restricciones. |
| `ros2 param dump <nodo>` | Exporta sus parámetros a YAML. |
| `ros2 param load <nodo> <archivo.yaml>` | Carga valores desde YAML. |
| `ros2 action` | Familia de herramientas para inspeccionar y usar acciones; en el material no se detalla un subcomando concreto. |

**No confundir:** `ros2 topic/service/action` son herramientas de terminal; `.msg/.srv/.action` son definiciones de los datos que usan los nodos.

## 4. Aplicaciones y ejemplos que aparecen

| Aplicación o ejemplo | Qué se inicia / qué enseña |
|---|---|
| `ros2 run turtlesim turtlesim_node` | Abre **turtlesim**, simulador sencillo de una tortuga: permite observar movimiento, topics y servicios. |
| `mimic` de `turtlesim` | Nodo que escucha los movimientos de una tortuga y envía órdenes para que otra los reproduzca; ilustra la conexión entre nodos y el uso de namespaces. En el material se presenta dentro de un lanzamiento con varias tortugas. |
| `ros2 run rqt_graph rqt_graph` | Abre **rqt_graph** para visualizar gráficamente nodos y conexiones por topics. También se muestra la invocación `rqt_graph`. |
| `ros2 launch mvsim demo_indoor_outdoor.launch.py` | Lanza la simulación MVSim del mundo interior/exterior y, por defecto, RViz2. `--show-args` enseña sus opciones; `headless:=true` oculta la GUI de MVSim, no necesariamente RViz2. |
| **MVSim GUI / RViz2** | La primera muestra la simulación y su verdad interna; RViz2 muestra los mensajes y transformaciones ROS 2 publicados. |
| **RViz** | Herramienta de visualización mencionada entre las utilidades del ecosistema; en la práctica 2.1 se abre **RViz2** desde el launch de MVSim. |
| `ros2 run robot_teleop keyboard_control` | Ejecuta el nodo Python de teleoperación que crea el estudiante y publica velocidades en `/cmd_vel`. |
| **Nav2** | Sistema de navegación de ROS 2. El ejemplo de su árbol de comportamiento combina calcular ruta, seguirla, replanificar y recuperar fallos; no es un comando concreto de lanzamiento. |
| `ros2 run my_package_cmake my_node` / `ros2 run my_package_python my_node` | Ejecutan los nodos de ejemplo construidos en C++ o Python, respectivamente. |

## 5. Flujo mínimo de desarrollo

1. **Cargar el entorno de ROS 2** en la terminal donde se trabajará (ejemplo de la lección, ROS 2 Jazzy en Linux): `source /opt/ros/jazzy/setup.bash`.
2. **Crear el workspace:** `mkdir -p ~/dev_ws/src`; entrar en `~/dev_ws`.
3. **Crear un paquete** desde `src/`: `ros2 pkg create --build-type ament_cmake --node-name my_node my_package_cmake` para C++, o `ros2 pkg create --build-type ament_python --node-name my_node my_package_python` para Python.
4. **Implementar y registrar el nodo:** en C++, editar el código y `CMakeLists.txt`; en Python, el módulo y `setup.py` (`console_scripts`). El manifiesto común es `package.xml`.
5. **Construir** desde la raíz del workspace: `colcon build` (todo) o `colcon build --packages-select <paquete>` (solo uno).
6. **Cargar lo construido y ejecutar:** `source install/setup.bash` y después `ros2 run <paquete> <ejecutable>`. Repetir `source` en terminales nuevas, salvo que el entorno ya se cargue automáticamente.

**Secuencia para entender un sistema en marcha:** `ros2 node list` → `ros2 node info <nodo>` → `ros2 topic list` → `ros2 topic echo <topic>` → `rqt_graph`. Así se pasa de identificar componentes a ver qué datos fluyen entre ellos.

## 6. Práctica 2.1 — Primeros pasos con ROS 2 y MVSim

**Qué se hace:** explorar un mundo simulado, modificar los sensores para una máquina virtual, lanzar MVSim y RViz2, descubrir qué datos circulan, conducir el robot publicando `Twist` y crear un nodo Python que lo controle con el teclado. El notebook es **guía e informe**, no algo que deba ejecutarse entero: los comandos van en varias terminales y las respuestas, capturas y código se incorporan al notebook.

### 6.1. Entender y preparar el mundo

```bash
ros2 pkg prefix --share mvsim
```

Busca el directorio `share` del paquete, normalmente `/opt/ros/jazzy/share/mvsim`. Allí están `mvsim_tutorial/demo_indoor_outdoor.world.xml`, los archivos de lanzamiento y configuraciones de RViz2; en `definitions/` hay clases y sensores reutilizables. No conviene fijar la ruta a mano si el paquete puede estar instalado en otro sitio.

En el mundo original hay **un vehículo `robot` de clase `jackal`**, cuya definición está en `definitions/jackal.vehicle.xml`. Con `default_sensors="true"`, la clase incorpora el LiDAR 2D `scanner1`, LiDAR 3D `lidar1` y cámara RGB `cam1`; el mundo agrega un GNSS `gps1` y una IMU. Son distintas cosas: el *mundo* coloca la instancia y configura el entorno, la *clase* define el vehículo reutilizable y cada *sensor* aporta observaciones. `init_pose` indica posición y orientación inicial (`x y yaw`, con el yaw del XML en grados).

Para aligerar la simulación en una máquina virtual, la práctica desactiva los sensores predeterminados con `default_sensors="false"` en el **archivo de mundo**, y añade solo `definitions/lidar2d.sensor.xml` al vehículo. Así se evita renderizar la cámara y el LiDAR 3D sin modificar la clase compartida por otros mundos. En el LiDAR conservado: `sensor_x/y/z` sitúan el sensor respecto al robot, `sensor_yaw` lo orienta, `sensor_name="scanner1"` lo identifica, `fov_degrees="270"` determina su campo de visión, `raytrace_3d` controla la intersección de rayos con geometría 3D y `sensor_period_sec="0.10"` define una muestra teórica cada 0,1 s (10 Hz). Si se ven aproximadamente 9,7 Hz, no implica necesariamente un fallo.

### 6.2. Lanzar y distinguir las dos vistas

```bash
ros2 launch mvsim demo_indoor_outdoor.launch.py --show-args
ros2 launch mvsim demo_indoor_outdoor.launch.py
```

Un *launch* prepara los parámetros y archivos del mundo e inicia `mvsim_node` y, si `use_rviz` es verdadero, RViz2. Entre los argumentos mostrados están `world_file`, `headless`, `use_rviz`, `do_fake_localization` (transformación ficticia `map → odom`), `publish_tf_odom2baselink`, `force_publish_vehicle_namespace` y `disable_sim_time_clock`. Se pasan como `nombre:=valor`; por ejemplo:

```bash
ros2 launch mvsim demo_indoor_outdoor.launch.py headless:=true
```

`headless` oculta la ventana de MVSim, **no necesariamente RViz2**. MVSim muestra la geometría y pose real del simulador (*ground truth*); RViz2 muestra los datos ROS recibidos (láser, mapa, poses, transformaciones) y puede mostrar menos detalles que la GUI sin que falten elementos en la simulación. `Ctrl+C` en la terminal del launch detiene los procesos iniciados.

### 6.3. Explorar qué produce y consume el robot

```bash
ros2 topic list
ros2 topic info /scanner1 --verbose
ros2 topic echo /scanner1
ros2 topic hz /scanner1
rqt_graph
```

`list` da nombres; `info --verbose` permite identificar tipo, publicadores, suscriptores y QoS; `echo` enseña datos; `hz` mide la frecuencia; `rqt_graph` muestra flechas entre nodos a través de topics. **MVSim publica sensores y estado, pero consume órdenes**; RViz2 suele consumir datos. Resumen de canales centrales (dependen de la configuración efectiva del mundo):

| Topic | Tipo / significado | Sentido principal |
|---|---|---|
| `/scanner1` | `sensor_msgs/msg/LaserScan`: distancias del LiDAR 2D | MVSim → RViz2/otros nodos |
| `/odom` | `nav_msgs/msg/Odometry`: estimación de pose y velocidad, susceptible de deriva | MVSim → localización/navegación |
| `/base_pose_ground_truth` | `nav_msgs/msg/Odometry`: pose real conocida por la simulación | MVSim → evaluación |
| `/cmd_vel` | `geometry_msgs/msg/Twist`: velocidad deseada | controlador → MVSim |
| `/imu`, `/gps1` | lecturas de la IMU y GNSS simulados | MVSim → localización |
| `/tf`, `/tf_static` | transformaciones entre marcos, dinámicas y estáticas | publicadores TF → RViz2/otros |

**Matiz importante:** `/odom` y `/base_pose_ground_truth` pueden tener el mismo tipo sin significar lo mismo; el primero estima, el segundo permite comprobar el error. Si RViz2 conserva un display para una cámara desactivada, puede aparecer su topic con **0 publicadores y 1 suscriptor**: su nombre por sí solo no prueba que la cámara siga funcionando. Consultar `ros2 topic info <topic> --verbose`.

### 6.4. Moverlo manualmente y pararlo

Con el launch activo, en otra terminal:

```bash
ros2 topic pub --rate 10 /cmd_vel geometry_msgs/msg/Twist \
  '{linear: {x: 0.5}, angular: {z: 0.2}}'
```

`linear.x=0.5` hace avanzar (m/s) y `angular.z=0.2` lo hace girar (rad/s): juntos describen una curva. Para girar sobre sí mismo, `linear.x=0`; para retroceder, `linear.x<0`. `--rate 10` envía 10 órdenes por segundo; sin `--once`, el publicador sigue activo. Después de `Ctrl+C`, enviar una parada explícita:

```bash
ros2 topic pub --once /cmd_vel geometry_msgs/msg/Twist \
  '{linear: {x: 0.0}, angular: {z: 0.0}}'
```

Una interrupción **no equivale a mandar ceros**; el watchdog solo detendrá el robot tras un tiempo sin órdenes. Si se mueve inesperadamente, `ros2 topic info /cmd_vel --verbose` revela si otro publicador sigue activo. Para distinguir robot de cámara, comparar `position.x/y` en dos lecturas de `ros2 topic echo /base_pose_ground_truth --once`.

### 6.5. Crear el teleoperador por teclado

```bash
mkdir -p ~/robotics_ws/src
cd ~/robotics_ws/src
ros2 pkg create --build-type ament_python --dependencies rclpy geometry_msgs --node-name keyboard_control robot_teleop
```

`robot_teleop` es el **paquete**; `keyboard_control` es el **ejecutable/nodo**. `package.xml` declara dependencias; `setup.py` instala el programa mediante `console_scripts`. El nodo crea un publicador `Twist` en `/cmd_vel` y asigna **`w` avanzar, `s` retroceder, `a` girar izquierda, `d` girar derecha y espacio parar**. Cada tecla produce un mensaje: `linear.x` y `angular.z` determinan el movimiento. En Python la lectura inmediata de teclas necesita `termios`/`tty` (modo de terminal) y `select` (espera con tiempo límite); se debe restaurar el terminal en `finally`. Si el bucle de teclado comparte hilo con ROS 2, `rclpy.spin_once(node, timeout_sec=0.0)` atiende callbacks sin bloquearlo. Al cerrar: publicar cero, restaurar terminal, destruir nodo y llamar a `rclpy.shutdown()`.

```bash
cd ~/robotics_ws
colcon build --packages-select robot_teleop
source install/setup.bash
ros2 run robot_teleop keyboard_control
```

El `source` se hace en **cada terminal** donde se usen paquetes propios; si cambian las entradas instaladas en `setup.py`, recompilar y volver a cargar el entorno. En `rqt_graph` debe verse `keyboard_control → /cmd_vel → mvsim`. Si el paquete no aparece, revisar compilación, instalación y entorno; si falta el ejecutable, comprobar `console_scripts` y `ros2 pkg executables robot_teleop`. Nunca usar simultáneamente la publicación manual de velocidad y el teclado sin coordinar sus órdenes.

**Cadena completa de la práctica:** XML del mundo → MVSim simula y publica sensores → ROS 2 distribuye mensajes y TF → RViz2 representa lo recibido → terminal o nodo `keyboard_control` publica `/cmd_vel` → MVSim mueve el robot. Esa separación permite cambiar simulador, visualizador o controlador sin rediseñar todo el sistema.
