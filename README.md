# Marmolería Benjamín - Sistema Web de Planos Técnicos (CAD 2D)

Aplicación web interactiva para el diseño, medición y trazado técnico de planos de marmolería (mesadas de cocina, islas, barras, zócalos, traforos y cortes a medida).

Diseñada para funcionar tanto en PC de escritorio como en tablets y iPads para mediciones directas en obra.

---

## 🚀 Funcionalidades

### 1. Herramientas de Dibujo y Trazado
- **✋ Seleccionar**: Mueve piezas completas por el plano y activa puntos de control interactivos para modificar vértices y dimensiones.
- **✏️ Líneas**: Trazado de líneas simples y líneas continuas (polilíneas).
- **📐 Formas Geométricas**:
  - **▭ Rectángulo**: Para mesadas, paños y regruesos.
  - **🟩 Cuadrado**: Proporción cuadrada 1:1 fija.
  - **⭕ Círculo**: Para perforaciones de grifería, desagües o bachas redondas.
  - **🔺 Triángulo**: Para chaflanes de esquinas y cortes a inglete.
  - *Cada forma cuenta con controles para **agrandar, achicar y desplazar** con precisión.*
- **〰️ Lápiz**: Dibujo a mano alzada para bosquejos y marcas rápidas.
- **↔️ Medir**: Cotas técnicas automáticas y manuales con visualización en centímetros o metros.
- **T Anotar**: Inserción de textos y notas de obra.
- **⌫ Borrar**: Pincel interactivo de borrado continuo.

### 2. Precisión e Imán (Snapping)
- Imán a cuadrícula de fondo (`Grid Snap`).
- Imán a vértices, centros y extremos de figuras existentes (`Point Snap`).
- Asistencia angular a 45° y 90° para cortes ortogonales precisos.

### 3. Historial y Persistencia
- Deshacer (`Undo`) y Rehacer (`Redo`) completo.
- Autoguardado continuo en el navegador (`LocalStorage`).

### 4. Opciones de Exportación
- **📄 Exportar a PDF**: Genera una lámina vectorial técnica **A4 apaisada** calibrada para taller con membrete oficial (empresa, proyecto, fecha y responsable).
- **📝 Exportar a Word (.doc)**: Documento editable con carátula técnica, imagen nítida del plano incrustada y tabla detallada de cotas y medidas.
- **💬 Enviar por WhatsApp**: Envía un resumen con formato técnico al chat y descarga el archivo PDF en simultáneo para adjuntarlo fácilmente.
- **💾 Respaldo JSON**: Guarda la información del proyecto para respaldar o continuar más adelante.

---

## 🌐 Cómo usar

Abrí el archivo `index.html` en cualquier navegador moderno (Chrome, Safari, Edge, Firefox) o publicalo directamente con **GitHub Pages**.
