# Práctica 4.3 en la VM: pasos, capturas y notas

Este documento es para usarlo **dentro de la VM** (Ubuntu 24.04 + ROS 2 Jazzy + MVSim). No hace falta copiar nada a mano:

- `practica_4.3.sh` ejecuta los comandos de cada ejercicio y guarda **cada comando con su salida** en `salidas/`.
- Las **capturas** las haces tú cuando el script te avise; él mismo las busca y las guarda con su nombre en `capturas/`.
- En este documento solo tienes que escribir lo que **ves** (en los huecos `✏️ Escribe aquí:`) y los problemas que surjan.

Al terminar, pasas al host la carpeta `4.3_VM` entera (o el `.tgz` que crea el script) y yo relleno el notebook.

---

## 0. Antes de empezar

1. **Meter esta carpeta en la VM.** Elige una opción:
   - Por la misma vía por la que la vas a devolver (carpeta compartida, USB…), o
   - Descargándola en la VM. Abre una terminal (Ctrl+Alt+T) y escribe:

     ```bash
     cd ~
     wget jalcausa.github.io/Robotica/web/vm/p43.tgz
     tar xzf p43.tgz
     cd 4.3_VM
     ```

2. **Cierra cualquier simulación o RViz2** que tengas abierto.
3. Ten a mano la **contraseña de sudo** de la VM: el script la pide para modificar el archivo del mundo, que es del sistema. Antes de tocarlo, el script guarda una copia de seguridad `.bak`.
4. Abre este documento con el editor de texto (por ejemplo, `gnome-text-editor LEEME_4.3.md &`) para ir anotando.
5. Lanza el script desde la carpeta `4.3_VM`:

   ```bash
   ./practica_4.3.sh
   ```

   El script **abre y cierra la simulación él solo**. Tú solo tienes que leer lo que pone, pulsar Enter y hacer las capturas cuando lo pida.

**Si algo falla a mitad:** apunta el paso y el error en la sección *Problemas* del final y vuelve a lanzarlo desde ese paso. Por ejemplo, desde el paso 5: `./practica_4.3.sh 5`. Todo lo que sale en pantalla queda guardado en `salidas/00_log_completo.txt`, así que el error también lo veré yo.

**Cómo se hace una captura en Ubuntu:** pulsa la tecla **Impr Pant** (Print Screen). En la barra que aparece, elige **Pantalla** (o **Ventana**, si solo te pide una) y pulsa el **botón redondo**. Ubuntu la guarda automáticamente en *Imágenes › Capturas de pantalla*. Vuelve a la terminal, pulsa Enter, y el script la copia a `capturas/` con el nombre correcto.
Si tu teclado no tiene esa tecla, usa el menú de Ubuntu o `gnome-screenshot`. Si el script no encuentra la captura, cópiala tú a `capturas/` con el nombre que te diga y escribe `s` + Enter.

---

## Paso 1 · Preparar el mundo (Assignment 1)

**Lo hace el script:**
- Localiza el mundo con `ros2 pkg prefix mvsim` y hace la copia de seguridad.
- Pone `default_sensors="false"` en la clase del TurtleBot3.
- Añade el láser `laser1` y la IMU `imu1` justo después de `<init_pose>`.
- Lanza `ros2 launch mvsim demo_turtlebot_world.launch.py`.

**📸 Capturas:**

| Archivo | Cuándo | De qué |
|---|---|---|
| `01_mvsim_y_rviz.png` | Cuando se abra la simulación | **Pantalla completa** con la ventana de MVSim y la de RViz2 **una al lado de la otra**, las dos visibles enteras: el robot en el mundo de columnas y los puntos del láser |
| `01b_rviz_laser_original.png` | Justo después | **Solo RViz2, grande** (maximízalo con doble clic en su barra de título), con el scan del láser bien visible. **Fíjate en la vista**: en el paso 5 tendrás que repetirla igual para poder comparar |

✏️ Escribe aquí:
- ¿Se abrieron MVSim y RViz2 sin errores?
- ¿El panel de la cámara de RViz2 se queda vacío o negro? (Es lo esperado.)
- ¿Sale en la terminal o en MVSim el aviso «Simulation slower than real time»?

> 

---

## Paso 2 · Inventario de sensores (Assignment 2)

**Lo hace el script:** ejecuta `ros2 topic list -t` y, para el láser, la IMU y la odometría, `topic echo --once --no-arr`, `topic info` y `topic hz` (10 s cada uno).

**📸 Capturas:** ninguna.

✏️ Escribe aquí: si algún `topic hz` no mostró nada o dio un error, apúntalo.

> 

---

## Paso 3 · Anatomía de un LaserScan (Assignment 3)

**Lo hace el script:** ejecuta `ros2 interface show sensor_msgs/msg/LaserScan` y `ros2 topic echo /laser1 --once --no-arr`.

**📸 Capturas:** ninguna.

---

## Paso 4 · Ruido del láser (Assignment 4)

**Lo hace el script:** guarda 10 scans seguidos con `--field ranges`. **No toques el robot.** La variación entre scans la calculo yo.

**📸 Capturas:** ninguna.

---

## Paso 5 · Reconfigurar el láser (Assignment 5)

**Lo hace el script:**
- Cierra la simulación.
- Añade `sensor_std_noise="0.10"` y `max_range="3.0"` al láser.
- La vuelve a lanzar y guarda un mensaje sin arrays y otro con solo los `ranges`.
- Al acabar, **restaura** el láser original.

**📸 Capturas:**

| Archivo | Cuándo | De qué |
|---|---|---|
| `02_rviz_laser_ruido_y_alcance.png` | Cuando se vuelva a abrir la simulación | **Solo RViz2, grande, con la MISMA vista que `01b`**. El scan debería verse más «tembloroso» y llegar solo hasta 3 m |

✏️ Escribe aquí: ¿qué diferencias ves en RViz2 respecto a la captura `01b`? Por ejemplo, paredes que ya no salen, puntos más dispersos…

> 

---

## Paso 6 · El árbol tf (Assignment 6)

**Lo hace el script:**
- **6.1** Ejecuta `ros2 run tf2_tools view_frames` y guarda el árbol en `salidas/06_tf_tree.pdf`. **No hace falta captura**: el PDF lo convierto yo en imagen.
- **6.2** Ejecuta `tf2_echo base_link laser1`.
- **6.3** **El robot se mueve solo** unos 8 s en un círculo pequeño (publica en `/cmd_vel`) mientras lee `tf2_echo odom base_link`. Después lo para.
- **6.4** Con el robot parado, ejecuta `tf2_echo odom base_link`, `base_link laser1` y `odom laser1`. La composición x ⊕ xₛ a mano la hago yo.

**📸 Capturas:** ninguna (opcionalmente, si quieres, `03_rviz_robot_moviendose.png` mientras gira).

✏️ Escribe aquí: ¿se movió el robot en círculo y se paró después? ¿Chocó con algo?

> 

---

## Paso 7 · OPCIONAL: observar un landmark con tf

El script pregunta si lo haces (Enter = sí).

**Lo hace el script:**
- Reinicia la simulación, para que el robot vuelva a su pose inicial.
- Publica el frame estático `landmark` en (0.9, 0.5), en `odom`.
- Ejecuta `tf2_echo laser1 landmark` y guarda un scan. Range, bearing e índice k los calculo yo.

**📸 Capturas:** ninguna.

---

## Paso 8 · OPCIONAL: grabar y reproducir con rosbag

El script pregunta si lo haces (Enter = sí).

**Lo hace el script:**
- Graba con `ros2 bag record` el láser, la IMU, la odometría, `/tf` y `/tf_static` mientras el robot se mueve, y guarda `ros2 bag info`.
- Cierra la simulación y reproduce la grabación con `ros2 bag play`.
- Comprueba con `topic list` y `topic hz` que los topics vuelven a publicarse sin simulador.

**📸 Capturas:** ninguna.

---

## Al terminar

Al final, el script se para, enseña la lista de capturas y espera a que guardes este documento. Cuando pulses Enter, crea **`~/4.3_VM_resultados.tgz`** con toda la carpeta: salidas, capturas y este LEEME.

- [ ] Rellena los ✏️ de este documento y **guárdalo antes de pulsar ese último Enter**. Si lo cambias después, vuelve a crear el comprimido con `tar czf ~/4.3_VM_resultados.tgz -C ~ 4.3_VM`.
- [ ] Comprueba que en `capturas/` están `01_mvsim_y_rviz.png`, `01b_rviz_laser_original.png` y `02_rviz_laser_ruido_y_alcance.png`.
- [ ] Pasa `4.3_VM_resultados.tgz` (o la carpeta `4.3_VM`) al host y déjala en
      `Practicas/uma_robotics_2027/Chapter 04.Robot sensing/4.3_VM/`. Después avísame.

---

## Problemas

✏️ Apunta aquí cualquier error: en qué paso, qué ponía y qué hiciste.

> 
