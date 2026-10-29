---
title: "L2 — Arquitecturas de control robótico y ROS 2"
author: "Resumen completo de las diapositivas"
date: "21 de septiembre de 2026"
lang: es-ES
---

# L2 — Arquitecturas de control robótico y ROS 2

## 1. Contenidos de la lección

La lección se divide en cinco bloques:

1. **Concepto:** definición, contexto y propiedades deseables.
2. **Clasificación:** paradigmas deliberativo, reactivo e híbrido; árboles de comportamiento.
3. **ROS:** evolución, relevancia, difusión, instalación y ayuda; comparación entre ROS y ROS 2.
4. **Componentes y comandos de ROS 2:** paquetes, nodos, topics, servicios, parámetros y acciones.
5. **Desarrollo de software en ROS 2:** `colcon`, espacios de trabajo y creación de paquetes y nodos con CMake y Python.

## 2. Concepto de arquitectura de control robótico

Una **arquitectura de control robótico** es un marco de software que administra y coordina el comportamiento de un sistema robótico mediante la integración de:

- Sensores y percepción.
- Actuadores.
- Módulos de toma de decisiones.

En una arquitectura completa pueden integrarse funciones de localización, movimiento, mapping, percepción, interacción humana y monitorización.

### 2.1. Contexto dentro de la asignatura

L2 proporciona la estructura que conecta los demás temas: L1 —introducción—, L3 —movimiento—, L4 —sensores—, L5 —localización—, L6 —mapping—, L7 —SLAM— y L8 —planificación de movimiento—. La arquitectura de control permite que todas esas funciones trabajen como un sistema coordinado.

## 3. Propiedades deseables de una arquitectura

### 3.1. Paralelismo

Es la capacidad de ejecutar procesos o comportamientos simultáneamente. Un robot debe poder realizar a la vez lectura sensorial, localización, planificación de caminos, evitación de obstáculos y control.

**Importancia:** permite percibir, pensar y actuar al mismo tiempo, mejorando la capacidad de respuesta. Por ejemplo, un robot puede moverse y evitar obstáculos mientras recalcula su ruta.

### 3.2. Flexibilidad en tiempo de ejecución

La arquitectura debe permitir ajuste y reconfiguración durante la ejecución: cambiar comportamientos, añadir o eliminar módulos y actualizar parámetros sin detener el robot.

**Importancia:** facilita adaptarse a situaciones nuevas, actualizar comportamientos o aprender de la experiencia. Un ejemplo es cambiar de estrategia de navegación en un entorno dinámico.

### 3.3. Modularidad

Debe proporcionar encapsulación, abstracción y reutilización del software. La diapositiva presenta una estructura por capas:

1. **Aplicaciones:** exploración, mapping, reparto, etc.
2. **Comportamientos/tareas:** navegación, manipulación, etc.
3. **Abstracciones/interfaces:** API, mensajes y servicios.
4. **Drivers de hardware:** sensores y actuadores.

**Importancia:** los componentes son más fáciles de entender, probar y reutilizar. Por ejemplo, se puede reutilizar un módulo de localización en distintos robots.

### 3.4. Robustez

Mide cómo funciona la arquitectura cuando falla algún componente y si permite implementar controladores tolerantes a fallos. Debe detectar y aislar fallos, recuperarse o degradar sus prestaciones de forma controlada y mantener la operación cuando sea posible. Ejemplo: continuar navegando con sensores de respaldo si falla el principal.

### 3.5. Facilidad de uso

Debe ser accesible y disponer de:

- API bien documentadas.
- Bibliotecas y frameworks.
- Herramientas de visualización.
- Registro y depuración.
- Soporte de simulación.

Esto reduce el tiempo de desarrollo y los errores, disminuye la curva de aprendizaje y facilita pruebas y mantenimiento. Ejemplos: ROS, `rqt`, RViz y simuladores.

### 3.6. Rendimiento

La arquitectura debe ofrecer ejecución eficiente, fiable y, cuando sea necesario, en tiempo real:

- Cumplimiento de plazos temporales.
- Uso eficiente de CPU y memoria.
- Ejecución fiable.
- Baja latencia.

El ejemplo visual muestra sensores a **100 Hz**, procesamiento en menos de **50 ms** y actuación posterior. El objetivo es reaccionar dentro del plazo y terminar la tarea de forma fiable, por ejemplo evitando colisiones bajo límites temporales estrictos.

### 3.7. Servicios generales

Una arquitectura también debe proporcionar:

- Comunicación entre módulos.
- Monitorización de la ejecución.
- Secuenciación y gestión de prioridades.
- Lectura y procesamiento de sensores.
- Actuación sobre dispositivos físicos.
- Interfaces con humanos —HRI—, Internet y otros robots.
- Escalabilidad.
- Otras funciones dependientes de la aplicación final.

## 4. Clasificación de las arquitecturas

### 4.1. Paradigma deliberativo

Fue el paradigma de **Shakey (1967)**, el primer robot considerado “inteligente”. Supone un entorno estático, ejecución de tareas perfectamente fiable y ausencia de reacción ante perturbaciones externas.

```text
SENSE → PLAN → ACT
   ↖    ENTORNO    ↙
```

Primero se percibe, luego se planifica y finalmente se actúa. Entre los resultados tecnológicos asociados a Shakey destacan:

- Algoritmo de búsqueda A*.
- Transformada de Hough.
- Grafo de visibilidad.

### 4.2. Paradigma reactivo

Propuesto por **Michael Arbib en 1980**. Supone que no hay planificación de tareas, el entorno es muy dinámico y poco fiable, y el robot funciona mediante reacciones. La percepción se vincula directamente con la acción para responder rápidamente.

### 4.3. Paradigma híbrido

Combina los paradigmas anteriores desde comienzos de la década de 1990:

- Planifica tareas para alcanzar objetivos globales.
- Monitoriza la ejecución del plan.
- Reacciona ante estímulos externos.
- Es el paradigma más usado actualmente.

#### Organización típica por capas

**Capa deliberativa:** modelo del mundo, planificador o solucionador de tareas y agenda de tareas.

**Capa de ejecución:** secuenciador del plan, navegación reactiva, mapping, localización y manipulación.

**Capa física —sensores y actuadores—:** sensores exteroceptivos y propioceptivos, voz, control de motores, conexión a Internet y actuadores sobre el entorno.

Se muestra también un ejemplo moderno que integra interacción humano–robot e IA generativa mediante **Agent–Client Protocol**: *Human-Robot Interaction in GenAI Architectures via the Agent-Client Protocol*, arXiv:2607.14919.

## 5. Árboles de comportamiento (*Behavior Trees*)

### 5.1. Definición y papel

Un **árbol de comportamiento (BT)** es un árbol jerárquico de nodos que controla el flujo de ejecución de tareas en un agente autónomo, como un robot o una entidad virtual.

En robótica actúa como secuenciador y ejecutor moderno del plan:

- Recibe metas o planes del planificador de tareas.
- Selecciona y secuencia habilidades como navegación reactiva o manipulación.
- Comprueba precondiciones: localización válida, objeto detectado, batería suficiente, etc.
- Activa recuperaciones o interrupciones cuando es necesario.

### 5.2. Funcionamiento mediante *ticks*

1. La raíz recibe periódicamente una señal **tick**.
2. El tick se propaga hasta un nodo hoja.
3. El nodo ejecuta su función asociada.
4. Devuelve `SUCCESS`, `FAILURE` o `RUNNING`.
5. Las hojas contienen los comandos reales mediante los que el árbol interactúa con el sistema.

### 5.3. Familias de nodos

#### Nodos de control

- **Sequence:** activa hijos de izquierda a derecha; avanza solo con `SUCCESS`, devuelve inmediatamente `FAILURE` si falla alguno y solo devuelve `SUCCESS` si todos tienen éxito.
- **Fallback/Selector:** pasa al siguiente hijo ante `FAILURE`, termina en el primer `SUCCESS` y solo falla si fallan todos.
- **Parallel:** coordina ejecuciones simultáneas conforme a su política de éxito y fallo.

#### Decoradores

Modifican el flujo o resultado de otro nodo. Ejemplos: `Inverter`, `Repeat` y `Delay`.

#### Hojas

- **Actions:** ejecutan trabajo.
- **Conditions:** comprueban condiciones.

Las acciones pueden ser síncronas —bloquean hasta `SUCCESS` o `FAILURE`— o asíncronas —pueden devolver `RUNNING`—.

### 5.4. Nodos personalizados y Nav2

Pueden definirse e importarse nodos personalizados. `PipelineSequence`, por ejemplo, puede mantener varios hijos `RUNNING`, permitiendo seguir un camino mientras se replantea.

La rama de navegación predeterminada de **ROS Nav2** incluye:

- `PipelineSequence` como raíz de `NavigateWithReplanning`.
- `ControllerSelector`, topic `controller_selector` y controlador por defecto `FollowPath`.
- `PlannerSelector`, topic `planner_selector` y planificador por defecto `GridBased`.
- `RateController` a **1,0 Hz**.
- Secuencia con `GoalUpdater`, `ComputePathToPose` y `TruncatePath` a distancia **1,0**.
- `FollowPath`, usando el controlador seleccionado y el camino truncado.
- `KeepRunningUntilFailure`.

Nodos personalizados del BT completo:

- **`RecoveryNode`:** intenta la operación principal; ante `FAILURE`, ejecuta recuperación y reintenta hasta `number_of_retries`.
- **`PipelineSequence`:** activa todos sus hijos en cada tick; permite replanificar mientras se sigue el camino.
- **`ReactiveFallback`:** selector prioritario que reevalúa hijos de mayor prioridad y puede interrumpir.
- **`SequenceStar`:** secuencia con memoria; continúa desde el último hijo `RUNNING` sin repetir hijos ya exitosos.
- **`RateController`:** decorador que limita ticks a una frecuencia y conserva el último estado del hijo.

El ejemplo completo de recuperación usa:

- `NavigateRecovery` con hasta **6 reintentos**.
- `ComputePathToPose` con un reintento y planificador `GridBased`.
- `FollowPath` con un reintento y controlador `FollowPath`.
- Limpieza de *costmaps* local y global.
- `Spin` de aproximadamente **1,57 rad** y `Wait` de **5 s**.

También se muestran un gran BT para **SANCHO**, robot social, y un ejemplo audiovisual de aplicación práctica.

## 6. ROS: Robot Operating System

### 6.1. Definición

**ROS** es un metasistema operativo de código abierto para robots. Proporciona:

- Abstracción del hardware.
- Control de dispositivos de bajo nivel.
- Funcionalidad común ya implementada.
- Paso de mensajes entre procesos.
- Gestión de paquetes.
- Infraestructura para desarrollo colaborativo.

No es un sistema operativo completo convencional, sino un ecosistema de herramientas, bibliotecas y comunicaciones.

### 6.2. Evolución

- Comenzó en **2007** en la Universidad de Stanford.
- Willow Garage lo desarrolló entre **2007 y 2013**.
- Pasó a la **Open Source Robotics Foundation**, renombrada **Open Robotics** en 2017.
- Ha tenido numerosas versiones o distribuciones.

### 6.3. Relevancia

- *ROS: An Open-Source Robot Operating System* se presentó en 2009 en un workshop de IEEE ICRA.
- En septiembre de 2026, la diapositiva indica **15.205 citas**.
- Tiene una conferencia propia: **ROSCon**.
- El **ROS-Industrial Consortium** desarrolla bibliotecas ROS-I para robots industriales.
- Lo han adoptado BMW, ABB, 3M, Siemens, Boeing y más de **910** organizaciones según la presentación.
- ROS 2 es la nueva versión del ecosistema.
- *Robot Operating System 2: Design, Architecture, and Uses in the Wild* se publicó en *Science Robotics* en 2022 y alcanzaba **2.788 citas**.

### 6.4. Difusión

- Las descargas crecieron desde cifras pequeñas en 2011 hasta unos **63,5 millones en 2024**, con una bajada visible en 2020 y fuerte crecimiento posterior.
- En 2025, **China** y **Estados Unidos** aparecen como principales países usuarios según descargas de `packages.ros.org`, seguidos por Alemania, Japón, Reino Unido y otros.
- Existe un amplio catálogo de robots documentados, comerciales y de investigación.

### 6.5. Instalación y ayuda

- ROS 1: <http://wiki.ros.org>
- ROS 2 Jazzy: <https://docs.ros.org/en/jazzy/Installation.html>
- Ayuda: <https://robotics.stackexchange.com>

## 7. ROS 1 frente a ROS 2

ROS 2 responde especialmente a necesidades empresariales de mayor seguridad y capacidad de tiempo real.

### 7.1. Comunicaciones

- ROS 1 usa un protocolo propio.
- ROS 2 usa un protocolo estándar basado en **DDS —Data Distribution Service—**, con distintas implementaciones.

DDS mejora eficiencia, seguridad, escalabilidad y **QoS —Quality of Service—**.

### 7.2. Descubrimiento sin maestro

ROS 2 no requiere un maestro central:

- Cada nodo anuncia su presencia a la red.
- Informa de sus publicaciones y suscripciones.
- Repite periódicamente el proceso para descubrir nuevos nodos.
- Informa al apagarse.

### 7.3. Lenguajes

- ROS 1: C++11 y Python 2.7.
- ROS 2: C++14/C++17 y Python 3.5 en adelante, según distribución.

## 8. Ecosistema y componentes de ROS 2

- **Diseño/implementación:** paquetes que contienen nodos.
- **Ejecución:** nodos conectados mediante topics, servicios, parámetros y acciones.

Ejemplo:

- Paquete de navegación: campos potenciales.
- Paquete de mapas: EKF SLAM y Graph SLAM.
- Paquete de percepción: detección y asociación de *landmarks* y lecturas láser.
- El láser publica `laser_scan`; el navegador se suscribe y puede ofrecer servicio `setVel`, parámetro `vel` y acción `goTo`. El láser puede ofrecer servicio `reset`, parámetros y acciones.

## 9. Paquetes

Todo el software ROS 2 se organiza en **paquetes**, colecciones coherentes de archivos y ejecutables con un propósito concreto. Pueden construirse con CMake o Python. Ambos comparten `package.xml` como manifiesto.

### 9.1. Comandos

```bash
ros2 pkg list
ros2 pkg create
ros2 pkg executables
ros2 pkg prefix
```

- `list`: paquetes instalados.
- `create`: crea un paquete.
- `executables`: ejecutables del paquete.
- `prefix`: ruta prefijo del paquete.

### 9.2. Ejemplo de `package.xml`

El ejemplo define `fake_battery`, versión `0.0.1`, descripción de batería simulada, mantenedor, licencia `GPLv3`, herramienta `ament_cmake`, dependencias `rclcpp` y `std_msgs`, y tipo de construcción `ament_cmake`.

```xml
<package format="3">
  <name>fake_battery</name>
  <version>0.0.1</version>
  <description>A fake battery package for simulation purposes</description>
  <maintainer email="...">...</maintainer>
  <license>GPLv3</license>
  <buildtool_depend>ament_cmake</buildtool_depend>
  <depend>rclcpp</depend>
  <depend>std_msgs</depend>
  <export><build_type>ament_cmake</build_type></export>
</package>
```

## 10. Nodos

- Un nodo es una **instancia en ejecución de un programa ROS**.
- Un ejecutable puede contener uno o varios nodos.
- Calcula y proporciona o consume datos mediante topics, servicios, acciones o parámetros.
- Debe tener una responsabilidad concreta: publicar láser, controlar motores, localizar, etc.
- Los nodos se organizan en paquetes.
- El **grafo ROS 2** representa elementos y conexiones que procesan datos simultáneamente.

### 10.1. Ejecutar e inspeccionar

```bash
ros2 run <package> <executable>
ros2 node list
ros2 node info <node_name>
```

`ros2 run` ejecuta un nodo; `turtlesim` contiene `turtlesim_node`. `node list` enumera nodos activos y `node info` muestra publicadores, suscriptores, servicios y acciones.

### 10.2. Archivos *launch*

Inician varios nodos y especifican programas, ubicación, argumentos y espacios de nombres. Pueden escribirse en Python, XML o YAML y suelen estar en `launch`.

```bash
ros2 launch <package_name> <launch_file_name>
ros2 launch <launch_file_name>
```

En `turtlesim`, el namespace prefija topics y servicios, por ejemplo `/turtlesim1/turtle1/pose`. Un nodo `mimic` escucha la primera tortuga y replica sus movimientos enviando velocidad a la segunda.

## 11. Topics y mensajes

Los nodos se comunican principalmente enviando **mensajes** por **topics** nombrados. Los publicadores envían y los suscriptores reciben. La comunicación puede ser uno-a-uno, uno-a-muchos, muchos-a-uno o muchos-a-muchos.

### 11.1. Comandos

```bash
ros2 topic list
ros2 topic info <topic_name>
ros2 topic echo <topic_name>
ros2 topic pub -r <rate_hz> <topic_name> <message_type> <message_content>
ros2 interface show <topic_type>
```

El ejemplo usa `geometry_msgs/msg/Twist`, con campos `linear` y `angular`, ambos `Vector3`. Se publica en `/turtle1/cmd_vel` un mensaje único o mensajes periódicos a 1 Hz. `ros2 topic hz` mide frecuencia y `ros2 topic echo` muestra valores.

### 11.2. Grafo

```bash
ros2 run rqt_graph rqt_graph
# o
rqt_graph
```

`rqt_graph` muestra gráficamente nodos y conexiones por topics.

## 12. Servicios

Un **servicio** permite que un cliente solicite una operación a un servidor, que contesta con una respuesta estructurada. Es petición–respuesta, frente al publicador–suscriptor de topics. Ejemplo: el navegador solicita al láser cambiar frecuencia con `setFrec`.

```bash
ros2 service list
ros2 service type <service>
ros2 service find <service_type>
ros2 service call <service> <service_type> <request>
ros2 interface show <service_type>
```

La interfaz `.srv` tiene `Request` y `Response`. El ejemplo de `turtlesim` crea una tortuga y devuelve su nombre.

## 13. Parámetros

Un **parámetro** configura un nodo al arrancar o durante la ejecución. Puede ser entero, flotante, booleano, cadena o lista, y se asocia con tipo, valor y descripción. En ROS 2 cada nodo mantiene sus parámetros; ROS 1 usaba un servidor global.

```bash
ros2 param list
ros2 param get <node_name> <parameter>
ros2 param set <node_name> <parameter> <new_value>
ros2 param describe <node_name> <parameter>
ros2 param dump <node_name> --output-dir <file_or_directory>
ros2 param load <node_name> <file>
```

Permiten listar, leer, cambiar, describir, guardar y cargar parámetros.

## 14. Acciones

Las **acciones** se destinan a tareas largas:

- Esquema cliente–servidor.
- Pueden cancelarse durante la ejecución.
- Proporcionan feedback periódico.
- Entregan un resultado final.

Una acción contiene objetivo/petición, resultado y feedback. Se define en `.action` —la diapositiva lo abrevia `.act`— y se inspecciona con `ros2 interface show`.

## 15. Comparación de mecanismos

| Aspecto | Topics | Servicios | Acciones |
|---|---|---|---|
| Modelo | Publicador–suscriptor | Petición–respuesta | Tarea larga con progreso |
| Herramienta | `ros2 topic` | `ros2 service` | `ros2 action` |
| Datos | Mensajes | Servicios | Acciones |
| Archivo | `.msg` | `.srv` | `.action` |
| Respuesta | Flujo asíncrono | Única | Feedback y resultado |
| Cancelación | No aplica | No apropiada | Sí |

`ros2 node info <node>` muestra subscribers, publishers, service servers, service clients y action servers/clients.

Debe distinguirse entre herramientas activas (`ros2 topic`, `ros2 service`, `ros2 action`), tipos de datos —mensajes, servicios, acciones— y archivos `.msg`, `.srv`, `.action`.

## 16. Desarrollo con `colcon`

Los nuevos nodos se organizan en paquetes. `colcon` es la herramienta oficial de construcción de ROS 2 basada en CMake y Python. Gestiona dependencias, organiza y hace accesibles paquetes, y genera ejecutables.

```text
Crear workspace → Crear paquete → Crear nodo → Construir paquete → Ejecutar nodo
```

## 17. Workspace de `colcon`

Contiene:

- `src/`: fuentes.
- `build/`: intermedios.
- `install/`: instalación de paquetes.
- `log/`: registros.

### 17.1. Creación

```bash
mkdir -p ~/dev_ws/src
cd ~/dev_ws
colcon build
ls
source /opt/ros/jazzy/setup.bash
echo "source ~/dev_ws/install/setup.bash" >> ~/.bashrc
```

Las líneas que configuran ROS 2 y el workspace en la shell deben añadirse **una sola vez**; incorporan rutas para localizar ejecutables.

## 18. Estructura y creación de paquetes

```text
workspace_folder/
└── src/
    ├── package_1/
    │   ├── CMakeLists.txt
    │   └── package.xml
    ├── package_2/
    │   ├── setup.py
    │   ├── package.xml
    │   └── resource/package_2
    └── package_n/
        ├── CMakeLists.txt
        └── package.xml
```

- Un workspace puede contener muchos paquetes.
- Pueden coexistir CMake y Python.
- No se permiten paquetes anidados.
- `colcon build` construye todo desde la raíz.
- Para uno solo:

```bash
colcon build --packages-select package_1
```

### 18.1. Paquete CMake/C++

Dentro de `src`:

```bash
ros2 pkg create --build-type ament_cmake \
  --node-name my_node my_package_cmake
```

Es apropiado para C++. Con `--node-name` crea `my_node` como “Hello World”.

### 18.2. Paquete Python

```bash
ros2 pkg create --build-type ament_python \
  --node-name my_node my_package_python
```

Es la opción conveniente para Python y crea la estructura inicial correspondiente.

## 19. Implementar un nodo CMake/C++

1. Crear `my_node.cpp` en `src` del paquete.
2. Modificar `CMakeLists.txt` para registrar el ejecutable.
3. Implementar el nodo, por ejemplo con Visual Studio Code.
4. Compilar desde la raíz:

```bash
cd ~/ros2_ws
colcon build
source install/setup.bash
ros2 run my_package_cmake my_node
```

## 20. Implementar un nodo Python

1. Crear `my_node.py` dentro del módulo Python.
2. Modificar `setup.py`: mantenedor, correo, descripción, licencia igual a `package.xml` y entrada `console_scripts`.
3. Implementar el nodo.
4. Construir, cargar entorno y ejecutar:

```bash
cd ~/ros2_ws
colcon build
source install/setup.bash
ros2 run my_package_python my_node
```

## 21. Referencias

1. ROS 2 Documentation, Jazzy: <https://docs.ros.org/en/jazzy/>
2. Quigley, M. et al. (2009). “ROS: an open-source Robot Operating System”. *ICRA Workshop on Open Source Software*, vol. 3, n.º 3.2.
3. Macenski, S.; Foote, T.; Gerkey, B.; Lalancette, C.; Woodall, W. (2022). “Robot Operating System 2: Design, Architecture, and Uses in the Wild”. *Science Robotics*, vol. 7.
