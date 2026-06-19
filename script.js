// ==========================================
// 1. CONTROL DE LA PANTALLA DE ENTRADA (INTRO)
// ==========================================
function quitarIntro() {
    const intro = document.getElementById('intro-screen');
    if (intro) {
        setTimeout(() => {
            intro.classList.add('fade-out');
        }, 2000);
    }
}

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', quitarIntro);
} else {
    quitarIntro();
}

// ==========================================
// 2. LÓGICA DEL RELOJ REGRESIVO
// ==========================================
function obtenerProximoCumpleanos() {
    const fechaActual = new Date();
    const anioActual = fechaActual.getFullYear();
    let fechaObjetivo = new Date(anioActual, 2, 27, 0, 0, 0); // 27 de Marzo
    
    if (fechaActual > fechaObjetivo) {
        fechaObjetivo.setFullYear(anioActual + 1);
    }
    return fechaObjetivo;
}

const fechaCumple = obtenerProximoCumpleanos();
const timerElemento = document.getElementById('timer');

function actualizarContador() {
    const ahora = new Date().getTime();
    const distancia = fechaCumple.getTime() - ahora;
    
    const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((distancia % (1000 * 60)) / 1000);
    
    const dDisplay = dias < 10 ? '0' + dias : dias;
    const hDisplay = horas < 10 ? '0' + horas : horas;
    const mDisplay = minutes < 10 ? '0' + minutes : minutes;
    const sDisplay = segundos < 10 ? '0' + segundos : segundos;
    
    if (timerElemento) {
        timerElemento.innerHTML = `${dDisplay}d ${hDisplay}h ${mDisplay}m ${sDisplay}s`;
    }
    
    if (distancia < 0) {
        clearInterval(intervalo);
        if (timerElemento) {
            timerElemento.innerHTML = "EL FUTURO HA LLEGADO // CÁPSULA ABIERTA";
        }
    }
}

actualizarContador();
const intervalo = setInterval(actualizarContador, 1000);

// ==========================================
// 3. ACCIÓN Y ALMACENAMIENTO DE CARTAS (LOCALSTORAGE + COHETE)
// ==========================================
const btnGuardar = document.getElementById('btn-guardar');
const listaMensajes = document.getElementById('lista-mensajes');

function mostrarCartas() {
    if (!listaMensajes) return;
    listaMensajes.innerHTML = "";
    
    let cartas = JSON.parse(localStorage.getItem('misCartasAlFuturo')) || [];
    
    const ahora = new Date();
    ahora.setHours(0,0,0,0);
    
    if (cartas.length === 0) {
        listaMensajes.innerHTML = `<p style="font-size: 0.85rem; color: #aa8416; font-style: italic;">No hay mensajes archivados aún...</p>`;
        return;
    }
    
    cartas.forEach((carta, indice) => {
        const item = document.createElement('div');
        item.style.background = 'rgba(20, 20, 20, 0.6)';
        item.style.border = '1px solid #aa8416';
        item.style.padding = '12px';
        item.style.borderRadius = '4px';
        item.style.position = 'relative';
        item.style.marginBottom = '15px';
        
        const partes = carta.fechaDesbloqueo.split('-');
        const fechaDesbloqueo = new Date(partes[0], partes[1] - 1, partes[2]);
        
        const fechaCreacionHumana = new Date(carta.fechaCreacion).toLocaleDateString();
        const fechaDesbloqueoHumana = fechaDesbloqueo.toLocaleDateString();
        
        const estaBloqueada = ahora.getTime() < fechaDesbloqueo.getTime();
        
        if (estaBloqueada) {
            item.innerHTML = `
                <p style="font-size: 0.8rem; color: #ff4d4d; margin-bottom: 5px; font-weight: bold;">🔒 ENCRIPTADO / BLOQUEADO</p>
                <p style="font-size: 0.85rem; color: #aa8416; margin-bottom: 8px;">Escrito el: ${fechaCreacionHumana}</p>
                <p style="font-size: 0.95rem; color: #888; font-style: italic; background: rgba(0,0,0,0.4); padding: 10px; border-radius: 4px; border: 1px dashed #333;">
                    Contenido protegido. Estará disponible el: <strong style="color: #d4af37;">${fechaDesbloqueoHumana}</strong>
                </p>
                <button onclick="borrarCarta(${indice})" style="position: absolute; top: 8px; right: 8px; padding: 2px 6px; font-size: 0.7rem; border-color: #ff4d4d; color: #ff4d4d; background: transparent;">Borrar</button>
            `;
        } else {
            // --- CÁPSULA ABIERTA ---
            let areaRespuestaHTML = "";
            
            // Si NO tiene respuesta guardada aún, muestra el cuadro para escribir
            if (!carta.respuesta || carta.respuesta.trim() === "") {
                areaRespuestaHTML = `
                    <div style="margin-top: 15px; border-top: 1px solid rgba(212,175,55,0.2); padding-top: 10px;">
                        <p style="font-size: 0.75rem; color: #d4af37; margin-bottom: 5px;">💬 Responder a tu "yo" del pasado:</p>
                        <textarea id="resp-${indice}" style="width: 100%; height: 70px; background: rgba(0,0,0,0.3); border: 1px solid #aa8416; color: #fff; padding: 8px; border-radius: 4px; font-size: 0.85rem;" placeholder="Escribe tu respuesta aquí..."></textarea>
                        <button onclick="guardarRespuesta(${indice})" style="margin-top: 5px; padding: 5px 10px; font-size: 0.75rem; background: #d4af37; color: #000; border: none; cursor: pointer; border-radius: 2px; font-weight: bold;">Guardar Respuesta</button>
                    </div>
                `;
            } else {
                // Si YA tiene una respuesta, la dibuja fijamente abajo del comentario original
                areaRespuestaHTML = `
                    <div style="margin-top: 15px; border-top: 1px dashed #2ecc71; padding-top: 10px; background: rgba(46,204,113,0.05); padding: 8px; border-radius: 4px;">
                        <p style="font-size: 0.75rem; color: #2ecc71; font-weight: bold; margin-bottom: 4px;">💬 Tu respuesta desde el futuro:</p>
                        <p style="font-size: 0.9rem; color: #ffffff; white-space: pre-wrap; line-height: 1.4;">${carta.respuesta}</p>
                    </div>
                `;
            }

            item.innerHTML = `
                <p style="font-size: 0.8rem; color: #2ecc71; margin-bottom: 5px; font-weight: bold;">🔓 CÁPSULA ABIERTA</p>
                <p style="font-size: 0.8rem; color: #aa8416; margin-bottom: 5px; font-style: italic;">📅 Escrito el ${fechaCreacionHumana} -> Liberado el ${fechaDesbloqueoHumana}</p>
                <p style="font-size: 0.95rem; color: #e5cb7b; white-space: pre-wrap; line-height: 1.5; background: rgba(212,175,55,0.05); padding: 10px; border-radius: 4px; border: 1px solid rgba(212,175,55,0.2);">${carta.texto}</p>
                
                ${areaRespuestaHTML}
                
                <button onclick="borrarCarta(${indice})" style="position: absolute; top: 8px; right: 8px; padding: 2px 6px; font-size: 0.7rem; border-color: #ff4d4d; color: #ff4d4d; background: transparent;">Borrar</button>
            `;
        }
        
        listaMensajes.appendChild(item);
    });
}

if (btnGuardar) {
    btnGuardar.addEventListener('click', function() {
        const cajaTexto = document.getElementById('capsula-texto');
        const inputFecha = document.getElementById('fecha-desbloqueo');
        
        const texto = cajaTexto.value;
        const fechaMeta = inputFecha.value;
        
        if (texto.trim() === "") {
            alert("Por favor, escribe algo antes de guardar tu pensamiento.");
            return;
        }
        
        if (!fechaMeta) {
            alert("Por favor, selecciona una fecha en el futuro para abrir esta carta.");
            return;
        }
        
        const hoySoloFecha = new Date();
        hoySoloFecha.setHours(0,0,0,0);
        
        const partes = fechaMeta.split('-');
        const fechaElegida = new Date(partes[0], partes[1] - 1, partes[2]);
        
        if (fechaElegida < hoySoloFecha) {
            alert("La fecha de apertura no puede ser un día que ya pasó.");
            return;
        }
        
        const nuevaCarta = {
            texto: texto,
            fechaCreacion: new Date().toISOString(),
            fechaDesbloqueo: fechaMeta,
            respuesta: ""
        };
        
        let cartas = JSON.parse(localStorage.getItem('misCartasAlFuturo')) || [];
        cartas.unshift(nuevaCarta);
        localStorage.setItem('misCartasAlFuturo', JSON.stringify(cartas));
        
        const overlay = document.getElementById('contenedor-cohete');
        const cohete = overlay.querySelector('.rocket-loader');
        
        cohete.classList.remove('despegar');
        overlay.classList.add('activado');
        
        setTimeout(() => {
            cohete.classList.add('despegar');
        }, 400);
        
        setTimeout(() => {
            overlay.classList.remove('activado');
            cohete.classList.remove('despegar');
            
            cajaTexto.value = "";
            inputFecha.value = "";
            
            mostrarCartas();
        }, 2900);
    });
}

window.guardarRespuesta = function(indice) {
    const textarea = document.getElementById(`resp-${indice}`);
    if (!textarea) return;
    
    const respuesta = textarea.value;
    
    if (respuesta.trim() === "") {
        alert("Por favor, escribe una respuesta válida.");
        return;
    }
    
    let cartas = JSON.parse(localStorage.getItem('misCartasAlFuturo')) || [];
    cartas[indice].respuesta = respuesta;
    
    localStorage.setItem('misCartasAlFuturo', JSON.stringify(cartas));
    alert("Tu respuesta ha sido fijada con éxito en la línea de tiempo.");
    mostrarCartas();
}

window.borrarCarta = function(indice) {
    if (confirm("¿Estás seguro de que deseas eliminar este registro de la cápsula?")) {
        let cartas = JSON.parse(localStorage.getItem('misCartasAlFuturo')) || [];
        cartas.splice(indice, 1);
        localStorage.setItem('misCartasAlFuturo', JSON.stringify(cartas));
        mostrarCartas();
    }
}

document.addEventListener('DOMContentLoaded', mostrarCartas);
mostrarCartas();
