#!/usr/bin/env bash
# Práctica 4.3 (Playing with ROS2): ejecuta en la VM los pasos del notebook y guarda
# cada comando con su salida en salidas/, y las capturas en capturas/.
#
# Uso:  ./practica_4.3.sh        -> todos los pasos, desde el 1
#       ./practica_4.3.sh 5      -> desde el paso 5 (si algo falló a mitad)

PASO_INICIAL=${1:-1}
DIR="$(cd "$(dirname "$0")" && pwd)"
OUT="$DIR/salidas"
CAPS="$DIR/capturas"
CONF="$OUT/config"
mkdir -p "$OUT" "$CAPS" "$CONF"

# Todo lo que se ve en pantalla queda también en el log.
exec > >(tee -a "$OUT/00_log_completo.txt") 2>&1

if [ ! -f /opt/ros/jazzy/setup.bash ]; then
  echo "No encuentro /opt/ros/jazzy/setup.bash: ¿estás en la VM con ROS 2 Jazzy?"; exit 1
fi
source /opt/ros/jazzy/setup.bash
export PYTHONUNBUFFERED=1 RCUTILS_COLORIZED_OUTPUT=0
# Control de trabajos: así la simulación y los procesos en segundo plano reciben Ctrl+C (SIGINT).
set -m

SIM_PID=""
LASER=/laser1
IMU=/imu1
ODOM=/odom
CMD_VEL=/cmd_vel

titulo() { echo; echo "=================================================================="; echo "  $*"; echo "=================================================================="; }
nota()   { echo ">> $*"; }
pausa()  { echo; read -rp ">> $* [pulsa Enter] " _; }

# run ARCHIVO "comando": muestra y guarda el comando (como «$ comando») y su salida.
run() {
  local file="$OUT/$1"; shift
  echo "\$ $*" | tee -a "$file"
  eval "$*" 2>&1 | tee -a "$file"
  echo | tee -a "$file"
}

# run_for SEGUNDOS ARCHIVO "comando": igual, pero lo corta con Ctrl+C a los N segundos.
run_for() {
  local secs="$1" file="$OUT/$2"; shift 2
  echo "\$ $*      # (cortado con Ctrl+C a los ${secs} s)" | tee -a "$file"
  timeout -s INT -k 3 "$secs" stdbuf -oL -eL bash -c "$*" 2>&1 | tee -a "$file"
  echo | tee -a "$file"
}

hay_topic() { timeout 5 ros2 topic list 2>/dev/null | grep -qx "$1"; }

sim_start() {
  titulo "Arrancando la simulación (MVSim + RViz2)"
  ros2 launch mvsim demo_turtlebot_world.launch.py > "$OUT/launch_$(date +%H%M%S).log" 2>&1 &
  SIM_PID=$!
  nota "Esperando a que aparezca $LASER (hasta 90 s)..."
  for _ in $(seq 1 45); do
    if hay_topic "$LASER"; then nota "Simulación lista."; sleep 3; return 0; fi
    sleep 2
  done
  nota "AVISO: no aparece $LASER. Mira la ventana de MVSim y el log launch_*.log en salidas/."
  pausa "Si la simulación sí está abierta y funcionando, continúa"
}

sim_stop() {
  nota "Cerrando la simulación..."
  if [ -n "$SIM_PID" ] && kill -0 "$SIM_PID" 2>/dev/null; then
    kill -INT -- -"$SIM_PID" 2>/dev/null
    for _ in $(seq 1 15); do kill -0 "$SIM_PID" 2>/dev/null || break; sleep 1; done
  fi
  pkill -INT -f "ros2 launch mvsim" 2>/dev/null; sleep 2
  pkill -f "mvsim_node|rviz2" 2>/dev/null
  SIM_PID=""; sleep 2
}

sim_asegurar() { hay_topic "$LASER" || sim_start; }

trap 'sim_stop; jobs -p | xargs -r kill 2>/dev/null' EXIT

# captura NOMBRE "qué capturar": espera a que hagas la captura y la copia a capturas/NOMBRE.png
captura() {
  local nombre="$1" que="$2" marca; marca=$(mktemp)
  echo
  echo "------------------------------ CAPTURA ------------------------------"
  echo "  Archivo: capturas/$nombre.png"
  echo "  Qué:     $que"
  echo "  Cómo:    pulsa la tecla Impr Pant (Print Screen), elige «Pantalla»"
  echo "           (o «Ventana») y pulsa el botón redondo. Ubuntu la guarda sola."
  echo "---------------------------------------------------------------------"
  while true; do
    read -rp ">> Cuando la hayas hecho, pulsa Enter (o escribe s + Enter para saltarla) " resp
    [ "$resp" = "s" ] && { nota "Captura $nombre saltada."; break; }
    local pics nueva
    pics=$(xdg-user-dir PICTURES 2>/dev/null || echo "$HOME/Pictures")
    nueva=$(find "$pics" "$HOME/Pictures" "$HOME/Imágenes" "$HOME" -maxdepth 2 -newer "$marca" \
              -iname '*.png' ! -path "$CAPS/*" -print0 2>/dev/null | xargs -0 -r ls -t 2>/dev/null | head -1)
    if [ -n "$nueva" ]; then
      cp "$nueva" "$CAPS/$nombre.png" && nota "Guardada como capturas/$nombre.png (desde $nueva)"; break
    fi
    nota "No encuentro ninguna captura nueva. Repítela, o cópiala tú a capturas/$nombre.png y escribe s."
  done
  rm -f "$marca"
}

# ---------------------------------------------------------------- preparación
titulo "Preparación"
ros2 daemon stop >/dev/null 2>&1; ros2 daemon start >/dev/null 2>&1
FALTA=""
for pkg in mvsim tf2_ros tf2_tools rosbag2; do
  ros2 pkg prefix "$pkg" >/dev/null 2>&1 || FALTA="$FALTA ros-jazzy-${pkg//_/-}"
done
if [ -n "$FALTA" ]; then
  nota "Faltan paquetes:$FALTA"
  read -rp ">> ¿Los instalo ahora con sudo apt install? (s/n) " r
  [ "$r" = "s" ] && sudo apt install -y $FALTA
fi
PREFIX=$(ros2 pkg prefix mvsim)
WORLD="$PREFIX/share/mvsim/mvsim_tutorial/demo_turtlebot_world.world.xml"
[ -f "$WORLD" ] || WORLD=$(find "$PREFIX" -name demo_turtlebot_world.world.xml 2>/dev/null | head -1)
[ -f "$WORLD" ] || { nota "No encuentro demo_turtlebot_world.world.xml dentro de $PREFIX"; exit 1; }
DEFS="$(dirname "$WORLD")/../definitions"
nota "Archivo de mundo: $WORLD"

# ---------------------------------------------------------------- paso 1
if (( PASO_INICIAL <= 1 )); then
  titulo "PASO 1 · ASSIGNMENT 1: preparar el mundo"
  run 01_ubicacion_mundo.txt "ros2 pkg prefix mvsim"
  run 01_ubicacion_mundo.txt "ls \"$(dirname "$WORLD")\" | grep turtlebot"
  if [ ! -f "$WORLD.bak" ]; then
    nota "Copia de seguridad del mundo (te pedirá la contraseña de sudo):"
    run 01_ubicacion_mundo.txt "sudo cp \"$WORLD\" \"$WORLD.bak\""
  fi
  cp "$WORLD.bak" "$CONF/world_original.xml"
  cp "$DEFS"/rplidar-a2.sensor.xml "$DEFS"/imu.sensor.xml "$DEFS"/turtlebot3_burger.vehicle.xml "$CONF/" 2>/dev/null

  # Cambios del Assignment 1 sobre la copia original: default_sensors=false y sensores propios tras <init_pose>.
  python3 - "$CONF/world_original.xml" "$CONF/world_A1.xml" <<'EOF' || { nota "No he podido editar el XML automáticamente: hazlo a mano con «sudo nano» siguiendo el LEEME."; exit 1; }
import re, sys
src, dst = sys.argv[1], sys.argv[2]
t = open(src, encoding="utf-8").read()
inc = re.search(r'<include[^>]*turtlebot3_burger\.vehicle\.xml"[^>]*>', t)
if not inc:
    sys.exit("No encuentro el <include> de turtlebot3_burger.vehicle.xml")
tag = inc.group(0)
if "default_sensors=" in tag:
    new = re.sub(r'default_sensors="[^"]*"', 'default_sensors="false"', tag)
else:
    new = tag.replace('turtlebot3_burger.vehicle.xml"', 'turtlebot3_burger.vehicle.xml"\n\t\tdefault_sensors="false"', 1)
t = t.replace(tag, new, 1)
block = '''
		<!-- 2D laser scanner (RPLIDAR A2), as in the TurtleBot3 class -->
		<include file="../definitions/rplidar-a2.sensor.xml"
		  raytrace_3d="true"
		  sensor_x="-0.032" sensor_z="0.171" sensor_yaw="0"
		  sensor_hz="10.0"
		  sensor_name="laser1"
		/>

		<!-- IMU, as in the TurtleBot3 class -->
		<include file="../definitions/imu.sensor.xml"
		  sensor_x="0.0" sensor_y="0.05" sensor_z="0.145"
		  sensor_period_sec="$f{1/200.0}"
		  sensor_name="imu1"
		/>
'''
veh = re.search(r'<vehicle\s+name="r1".*?</init_pose>[^\n]*\n', t, re.S)
if not veh:
    sys.exit('No encuentro <vehicle name="r1"> con su <init_pose>')
t = t[:veh.end()] + block + t[veh.end():]
open(dst, "w", encoding="utf-8").write(t)
EOF
  run 01_xml_cambiado.txt "diff -u \"$CONF/world_original.xml\" \"$CONF/world_A1.xml\""
  run 01_xml_cambiado.txt "sed -n '/<include file=\"..\/definitions\/turtlebot3_burger/,/\/>/p;/<vehicle name=\"r1\"/,/<\/vehicle>/p' \"$CONF/world_A1.xml\""
  run 01_xml_cambiado.txt "sudo cp \"$CONF/world_A1.xml\" \"$WORLD\""

  sim_start
  nota "Coloca la ventana de MVSim y la de RViz2 una al lado de la otra, que se vean las dos enteras."
  captura 01_mvsim_y_rviz "MVSim y RViz2 a la vez (pantalla completa), con el robot y el láser visibles."
  nota "Ahora agranda RViz2 (doble clic en su barra de título) para ver bien los puntos rojos/blancos del láser."
  captura 01b_rviz_laser_original "Solo RViz2, grande, con el scan del láser original. Recuerda esta vista: la repetirás en el paso 5."
fi

# ---------------------------------------------------------------- paso 2
if (( PASO_INICIAL <= 2 )); then
  titulo "PASO 2 · ASSIGNMENT 2: inventario de sensores"
  sim_asegurar
  run 02_topics.txt "ros2 topic list -t"
  LISTA=$(ros2 topic list -t 2>/dev/null)
  IMU=$(echo "$LISTA" | awk '/sensor_msgs\/msg\/Imu/{print $1; exit}'); IMU=${IMU:-/imu1}
  echo "$LISTA" | grep -q "^/odom " || ODOM=$(echo "$LISTA" | awk '/nav_msgs\/msg\/Odometry/{print $1; exit}')
  ODOM=${ODOM:-/odom}
  nota "Topics detectados: láser=$LASER  IMU=$IMU  odometría=$ODOM"
  for t in "$LASER" "$IMU" "$ODOM"; do
    run 02_mensajes.txt "ros2 topic echo $t --once --no-arr"
    run 02_mensajes.txt "ros2 topic info $t"
  done
  for t in "$LASER" "$IMU" "$ODOM"; do
    run_for 10 02_frecuencias.txt "ros2 topic hz $t"
  done
  nota "Si MVSim ha mostrado «Simulation slower than real time», apúntalo en el LEEME."
fi

# ---------------------------------------------------------------- paso 3
if (( PASO_INICIAL <= 3 )); then
  titulo "PASO 3 · ASSIGNMENT 3: anatomía de un LaserScan"
  sim_asegurar
  run 03_laserscan.txt "ros2 interface show sensor_msgs/msg/LaserScan"
  run 03_laserscan.txt "ros2 topic echo $LASER --once --no-arr"
fi

# ---------------------------------------------------------------- paso 4
if (( PASO_INICIAL <= 4 )); then
  titulo "PASO 4 · ASSIGNMENT 4: medir el ruido del láser"
  sim_asegurar
  nota "NO muevas el robot. Se guardan 10 scans seguidos del mismo sitio."
  for i in $(seq 1 10); do
    run 04_ranges_robot_parado.txt "ros2 topic echo $LASER --once --field ranges"
  done
fi

# ---------------------------------------------------------------- paso 5
if (( PASO_INICIAL <= 5 )); then
  titulo "PASO 5 · ASSIGNMENT 5: reconfigurar el láser (ruido 0.10 m, alcance 3 m)"
  sim_stop
  [ -f "$CONF/world_A1.xml" ] || cp "$WORLD" "$CONF/world_A1.xml"
  python3 - "$CONF/world_A1.xml" "$CONF/world_A5.xml" <<'EOF' || exit 1
import sys
src, dst = sys.argv[1], sys.argv[2]
t = open(src, encoding="utf-8").read()
key = '<include file="../definitions/rplidar-a2.sensor.xml"'
if t.count(key) != 1:
    sys.exit("No encuentro (una sola vez) el <include> del rplidar-a2 en el mundo")
t = t.replace(key, key + '\n\t\t  sensor_std_noise="0.10"\n\t\t  max_range="3.0"', 1)
open(dst, "w", encoding="utf-8").write(t)
EOF
  run 05_xml_laser.txt "diff -u \"$CONF/world_A1.xml\" \"$CONF/world_A5.xml\""
  run 05_xml_laser.txt "sed -n '/rplidar-a2.sensor.xml/,/\/>/p' \"$CONF/world_A5.xml\""
  run 05_xml_laser.txt "sudo cp \"$CONF/world_A5.xml\" \"$WORLD\""
  sim_start
  nota "Pon RViz2 grande y con la MISMA vista que en la captura 01b."
  captura 02_rviz_laser_ruido_y_alcance "Solo RViz2, grande, con el scan nuevo (más ruidoso y que solo llega a 3 m)."
  run 05_laserscan_nuevo.txt "ros2 topic echo $LASER --once --no-arr"
  run 05_laserscan_nuevo.txt "ros2 topic echo $LASER --once --field ranges"
  sim_stop
  nota "Restaurando la configuración original del láser (la del paso 1)..."
  run 05_xml_laser.txt "sudo cp \"$CONF/world_A1.xml\" \"$WORLD\""
fi

# ---------------------------------------------------------------- paso 6
if (( PASO_INICIAL <= 6 )); then
  titulo "PASO 6 · ASSIGNMENT 6: el árbol tf"
  sim_asegurar
  nota "6.1 Generando el diagrama del árbol tf (tarda unos 5 s)..."
  ( cd "$OUT" && run 06_tf_tree.txt "ros2 run tf2_tools view_frames" )
  ultimo=$(ls -t "$OUT"/frames_*.pdf 2>/dev/null | head -1)
  [ -n "$ultimo" ] && cp "$ultimo" "$OUT/06_tf_tree.pdf" && nota "Árbol guardado en salidas/06_tf_tree.pdf"
  nota "6.2 Transformación base_link -> laser1"
  run_for 4 06_tf_base_link_laser1.txt "ros2 run tf2_ros tf2_echo base_link laser1"
  nota "6.3 El robot va a moverse solo unos segundos (círculo pequeño) mientras se lee odom -> base_link."
  timeout -s INT 8 ros2 topic pub -r 10 $CMD_VEL geometry_msgs/msg/Twist "{linear: {x: 0.1}, angular: {z: 0.3}}" >/dev/null 2>&1 &
  DRV=$!
  echo "\$ ros2 topic pub -r 10 $CMD_VEL geometry_msgs/msg/Twist \"{linear: {x: 0.1}, angular: {z: 0.3}}\"   # en otra terminal, 8 s" >> "$OUT/06_tf_odom_base_link_moviendo.txt"
  run_for 8 06_tf_odom_base_link_moviendo.txt "ros2 run tf2_ros tf2_echo odom base_link"
  wait "$DRV"
  run_for 3 06_tf_odom_base_link_moviendo.txt "ros2 topic pub -r 10 $CMD_VEL geometry_msgs/msg/Twist \"{}\""
  nota "6.4 Robot parado: odom -> base_link, base_link -> laser1 y odom -> laser1"
  sleep 2
  run_for 3 06_tf_composicion.txt "ros2 run tf2_ros tf2_echo odom base_link"
  run_for 3 06_tf_composicion.txt "ros2 run tf2_ros tf2_echo base_link laser1"
  run_for 3 06_tf_composicion.txt "ros2 run tf2_ros tf2_echo odom laser1"
fi

# ---------------------------------------------------------------- paso 7 (opcional)
if (( PASO_INICIAL <= 7 )); then
  titulo "PASO 7 · OPCIONAL: observar un landmark con tf"
  read -rp ">> ¿Hacemos este opcional? (Enter = sí, n = no) " r
  if [ "$r" != "n" ]; then
    sim_stop; sim_start   # el robot vuelve a su pose inicial
    echo "\$ ros2 run tf2_ros static_transform_publisher --x 0.9 --y 0.5 --frame-id odom --child-frame-id landmark   # en otra terminal" >> "$OUT/07_landmark.txt"
    ros2 run tf2_ros static_transform_publisher --x 0.9 --y 0.5 --frame-id odom --child-frame-id landmark > "$OUT/07_static_publisher.log" 2>&1 &
    PUB=$!; sleep 3
    run_for 4 07_landmark.txt "ros2 run tf2_ros tf2_echo laser1 landmark"
    run 07_landmark.txt "ros2 topic echo $LASER --once --no-arr"
    run 07_landmark.txt "ros2 topic echo $LASER --once --field ranges"
    kill -INT -- -"$PUB" 2>/dev/null
  fi
fi

# ---------------------------------------------------------------- paso 8 (opcional)
if (( PASO_INICIAL <= 8 )); then
  titulo "PASO 8 · OPCIONAL: grabar y reproducir datos (rosbag)"
  read -rp ">> ¿Hacemos este opcional? (Enter = sí, n = no) " r
  if [ "$r" != "n" ]; then
    sim_asegurar
    rm -rf "$OUT/bag_4.3"
    echo "\$ ros2 bag record -o bag_4.3 $LASER $IMU $ODOM /tf /tf_static   # en otra terminal, mientras el robot se mueve" >> "$OUT/08_rosbag.txt"
    ( cd "$OUT" && ros2 bag record -o bag_4.3 $LASER $IMU $ODOM /tf /tf_static > "$OUT/08_record.log" 2>&1 ) &
    REC=$!; sleep 3
    nota "Grabando mientras el robot se mueve 8 s..."
    timeout -s INT 8 ros2 topic pub -r 10 $CMD_VEL geometry_msgs/msg/Twist "{linear: {x: 0.1}, angular: {z: 0.3}}" >/dev/null 2>&1
    timeout -s INT 2 ros2 topic pub -r 10 $CMD_VEL geometry_msgs/msg/Twist "{}" >/dev/null 2>&1
    kill -INT -- -"$REC" 2>/dev/null; sleep 4
    run 08_rosbag.txt "ros2 bag info \"$OUT/bag_4.3\""
    sim_stop
    nota "Reproduciendo la grabación con la simulación cerrada..."
    echo "\$ ros2 bag play bag_4.3   # en otra terminal" >> "$OUT/08_rosbag.txt"
    ros2 bag play "$OUT/bag_4.3" > "$OUT/08_play.log" 2>&1 &
    PLAY=$!; sleep 3
    run 08_rosbag.txt "ros2 topic list"
    run_for 4 08_rosbag.txt "ros2 topic hz $LASER"
    kill -INT -- -"$PLAY" 2>/dev/null; sleep 2
  fi
fi

# ---------------------------------------------------------------- fin
titulo "FIN"
sim_stop
nota "Comprobando que el mundo ha quedado con la configuración del paso 1..."
cmp -s "$WORLD" "$CONF/world_A1.xml" && nota "OK" || nota "AVISO: el mundo instalado no coincide con world_A1.xml"
ls -1 "$CAPS"
pausa "Termina de rellenar LEEME_4.3.md y GUÁRDALO; después"
tar czf "$HOME/4.3_VM_resultados.tgz" -C "$(dirname "$DIR")" "$(basename "$DIR")" 2>/dev/null
echo
nota "Hecho. Tienes TODO en la carpeta: $DIR"
nota "y también comprimido en:          $HOME/4.3_VM_resultados.tgz"
nota "Rellena lo que falte en LEEME_4.3.md y pasa la carpeta (o el .tgz) al host."
trap - EXIT
