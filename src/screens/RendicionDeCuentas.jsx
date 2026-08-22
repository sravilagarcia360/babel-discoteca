import React, { useState, useEffect, useMemo } from 'react';
import { Download, Camera, Trash2, Image as ImageIcon, X, Check, Edit2, RotateCcw, StickyNote } from 'lucide-react';

export default function RendicionDeCuentas() {
  const [activeTab, setActiveTab] = useState('entradas');
  const [toastMessage, setToastMessage] = useState(null);

  const STORAGE_KEY = 'babel_rendicion_draft';

  const estadoInicial = {
    entradas: {
      montoInicial: 0,
      fisico: { lineas: [] },
      qr: { lineas: [] },
      talonarios: [],
      fotoRendicion: null,
      notas: ''
    },
    guardarropia: {
      montoInicial: 0,
      fisico: { lineas: [] },
      qr: { lineas: [] },
      talonarios: [],
      fotoRendicion: null,
      notas: ''
    }
  };

  // Inicializar desde localStorage si existe un borrador guardado
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.entradas && parsed.guardarropia) {
          parsed.entradas.notas = parsed.entradas.notas || '';
          parsed.guardarropia.notas = parsed.guardarropia.notas || '';
          return parsed;
        }
      }
    } catch (e) {}
    return estadoInicial;
  });

  // Auto-guardar en localStorage cada vez que cambia el estado
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }, [state]);

  useEffect(() => {
    // Cargar librerías externas
    if (!window.jspdf) {
      const script1 = document.createElement('script');
      script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      document.head.appendChild(script1);
      
      const script2 = document.createElement('script');
      script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js';
      document.head.appendChild(script2);
    }
    if (!window.XLSX) {
      const script3 = document.createElement('script');
      script3.src = 'https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js';
      script3.async = true;
      document.body.appendChild(script3);
    }
  }, []);

  const limpiarTodo = () => {
    if (!window.confirm('¿Limpiar todo el formulario de Rendición? Se perderán todos los datos ingresados.')) return;
    setState(estadoInicial);
    localStorage.removeItem(STORAGE_KEY);
    toast('Formulario limpiado', 'ok');
  };

  const toast = (msg, type = 'ok') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const updateState = (section, path, value) => {
    setState(prev => {
      const newState = { ...prev };
      const parts = path.split('.');
      let current = newState[section];
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return newState;
    });
  };

  const calcLineas = (lineas) => lineas.reduce((s, l) => s + l.cant * l.precio, 0);
  const calcPersonas = (lineas) => lineas.reduce((s, l) => s + l.cant, 0);

  const calc = {
    ef: () => calcLineas(state.entradas.fisico.lineas),
    eq: () => calcLineas(state.entradas.qr.lineas),
    gf: () => calcLineas(state.guardarropia.fisico.lineas),
    gq: () => calcLineas(state.guardarropia.qr.lineas)
  };

  const totalEnt = calc.ef() + calc.eq();
  const totalGrd = calc.gf() + calc.gq();
  const granTotal = totalEnt + totalGrd;

  const [editItem, setEditItem] = useState(null); // { cat, subcat, index }

  const [inputs, setInputs] = useState({
    entradas: {
      ef: { cant: '', precio: '' },
      eq: { cant: '', precio: '' },
      talonario: { num: '', color: '', foto: null }
    },
    guardarropia: {
      gf: { cant: '', precio: '' },
      gq: { cant: '', precio: '' },
      talonario: { num: '', color: '', foto: null }
    }
  });
  const handleAddLinea = (cat, subcat) => {
    const key = cat === 'entradas' ? (subcat === 'fisico' ? 'ef' : 'eq') : (subcat === 'fisico' ? 'gf' : 'gq');
    const cant = parseFloat(inputs[cat][key].cant);
    const precio = parseFloat(inputs[cat][key].precio);

    if (!cant || cant <= 0) return toast('Ingresa una cantidad válida', 'err');
    if (isNaN(precio) || precio < 0) return toast('Ingresa un precio válido', 'err');

    const newLineas = [...state[cat][subcat].lineas];
    
    if (editItem && editItem.cat === cat && editItem.subcat === subcat) {
      newLineas[editItem.index] = { cant, precio };
      setEditItem(null);
      toast('Registro actualizado', 'ok');
    } else {
      newLineas.push({ cant, precio });
      toast('Registro agregado', 'ok');
    }
    
    updateState(cat, `${subcat}.lineas`, newLineas);
    setInputs(prev => ({ ...prev, [cat]: { ...prev[cat], [key]: { cant: '', precio: '' } } }));
  };

  const handleEditLinea = (cat, subcat, index) => {
    const key = cat === 'entradas' ? (subcat === 'fisico' ? 'ef' : 'eq') : (subcat === 'fisico' ? 'gf' : 'gq');
    const linea = state[cat][subcat].lineas[index];
    setInputs(prev => ({ ...prev, [cat]: { ...prev[cat], [key]: { cant: linea.cant, precio: linea.precio } } }));
    setEditItem({ cat, subcat, index });
  };

  const handleRemoveLinea = (cat, subcat, index) => {
    const newLineas = [...state[cat][subcat].lineas];
    newLineas.splice(index, 1);
    updateState(cat, `${subcat}.lineas`, newLineas);
    if (editItem && editItem.index === index) setEditItem(null);
  };

  const handlePhotoInput = (e, cat) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast('Debe ser imagen', 'err');
    const reader = new FileReader();
    reader.onload = (ev) => {
      setInputs(prev => ({...prev, [cat]: {...prev[cat], talonario: {...prev[cat].talonario, foto: ev.target.result}}}));
      toast('Foto lista', 'ok');
    };
    reader.readAsDataURL(file);
  };

  const handleAddTalonario = (cat) => {
    const { num, color, foto } = inputs[cat].talonario;
    if (!num && !color && !foto) return toast('Agrega datos o foto', 'err');
    const newTals = [...state[cat].talonarios, { num, color, foto }];
    updateState(cat, 'talonarios', newTals);
    setInputs(prev => ({...prev, [cat]: {...prev[cat], talonario: { num: '', color: '', foto: null }}}));
    toast('Talonario agregado', 'ok');
  };

  const handleRemoveTalonario = (cat, index) => {
    const newTals = [...state[cat].talonarios];
    newTals.splice(index, 1);
    updateState(cat, 'talonarios', newTals);
  };

  const handlePhoto = (e, cat, field) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast('Debe ser imagen', 'err');
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateState(cat, field, ev.target.result);
      toast('Foto cargada', 'ok');
    };
    reader.readAsDataURL(file);
  };

  const NOW = new Date();
  const DATE_STR = NOW.toLocaleDateString('es-BO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const exportPDF = async (type) => {
    if (!window.jspdf || !window.jspdf.jsPDF.API.autoTable) {
      toast('Cargando librería PDF, intenta de nuevo en unos segundos…', 'ok');
      if (!document.getElementById('jspdf-script')) {
        const s1 = document.createElement('script'); 
        s1.id = 'jspdf-script';
        s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'; 
        s1.onload = () => {
          const s2 = document.createElement('script'); 
          s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'; 
          document.head.appendChild(s2);
        };
        document.head.appendChild(s1);
      }
      return;
    }
    toast('Generando PDF corporativo con fotos. Por favor espera unos segundos...', 'ok');

    setTimeout(() => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W = doc.internal.pageSize.getWidth();
      const M = 14;
      let y = 0;

      const isEntradas = type === 'entradas';
      const mainTitle = isEntradas ? 'RENDICIÓN DE ENTRADAS' : 'RENDICIÓN DE GUARDARROPÍA';
      const totalVal = isEntradas ? totalEnt : totalGrd;
      const catState = state[type];
      const ef = isEntradas ? calc.ef() : calc.gf();
      const eq = isEntradas ? calc.eq() : calc.gq();

      doc.setFillColor(9, 9, 15);
      doc.rect(0, 0, W, 40, 'F');
      doc.setFillColor(isEntradas ? 16 : 139, isEntradas ? 185 : 92, isEntradas ? 129 : 246);
      doc.rect(0, 0, 6, 40, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24); doc.setTextColor(255, 255, 255);
      doc.text('BABEL DISCOTECA', M + 4, 16);
      doc.setFontSize(14); doc.setTextColor(isEntradas ? 16 : 139, isEntradas ? 185 : 92, isEntradas ? 129 : 246);
      doc.text(mainTitle, M + 4, 24);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10); doc.setTextColor(148, 163, 184);
      doc.text('Fecha: ' + DATE_STR + ' · Generado: ' + NOW.toLocaleTimeString('es-BO'), M + 4, 32);
      y = 48;

      doc.setFillColor(245, 158, 11);
      doc.roundedRect(M, y, W - M * 2, 28, 3, 3, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(9, 9, 15);
      doc.text('TOTAL RECAUDADO', M + 5, y + 8.5);
      doc.setFontSize(18);
      doc.text(`Bs ${totalVal.toFixed(2)}`, W - M - 4, y + 8.5, { align: 'right' });

      doc.setFontSize(11); doc.setFont('helvetica', 'normal');
      doc.text(`Físico: Bs ${ef.toFixed(2)}     QR: Bs ${eq.toFixed(2)}`, M + 5, y + 16);
      doc.setFont('helvetica', 'bold'); doc.setTextColor(9, 9, 15);
      doc.text(`Caja Chica: Bs ${catState.montoInicial.toFixed(2)}   |   Total Físico Esperado: Bs ${(catState.montoInicial + ef).toFixed(2)}`, M + 5, y + 24);
      y += 38;

      const buildSection = (title, colorRGB, lineasFis, lineasQR, talonarios, fRendicion) => {
        if (y > 200) { doc.addPage(); y = 18; }
        doc.setFillColor(...colorRGB);
        doc.rect(M, y, W - M * 2, 10, 'F');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(255, 255, 255);
        doc.text('  ' + title, M, y + 7);
        y += 14;

        const allRows = [
          ...lineasFis.map(l => ['Físico', l.cant, `Bs ${l.precio.toFixed(2)}`, `Bs ${(l.cant * l.precio).toFixed(2)}`]),
          ...lineasQR.map(l => ['QR', l.cant, `Bs ${l.precio.toFixed(2)}`, `Bs ${(l.cant * l.precio).toFixed(2)}`])
        ];

        doc.autoTable({
          startY: y, margin: { left: M, right: M },
          head: [['Tipo', 'Personas', 'Precio Unit.', 'Subtotal']],
          body: allRows.length > 0 ? allRows : [['Sin datos', '—', '—', '—']],
          foot: [
            ['Total Físico', calcPersonas(lineasFis), '', `Bs ${calcLineas(lineasFis).toFixed(2)}`],
            ['Total QR', calcPersonas(lineasQR), '', `Bs ${calcLineas(lineasQR).toFixed(2)}`],
            ['SUBTOTAL', calcPersonas(lineasFis) + calcPersonas(lineasQR), '', `Bs ${(calcLineas(lineasFis) + calcLineas(lineasQR)).toFixed(2)}`]
          ],
          styles: { font: 'helvetica', fontSize: 11, textColor: [28, 28, 42], cellPadding: 4 },
          headStyles: { fillColor: colorRGB, textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          footStyles: { fillColor: [226, 232, 240], textColor: [15, 23, 42], fontStyle: 'bold' }
        });
        y = doc.lastAutoTable.finalY + 8;

        if (talonarios.length > 0) {
          if (y > 240) { doc.addPage(); y = 18; }
          doc.setFont('helvetica', 'bold'); doc.setTextColor(...colorRGB);
          doc.text(`Talonarios Utilizados:`, M, y);
          doc.setFont('helvetica', 'normal');
          talonarios.forEach(t => {
            y += 6;
            doc.text(`- Nº ${t.num || 'S/N'}   Color: ${t.color || 'S/C'}`, M + 4, y);
          });
          y += 10;
        }

        const validFotos = [];
        talonarios.forEach((t) => { if (t.foto) validFotos.push({ img: t.foto, label: `Talonario Nº ${t.num || 'S/N'}` }); });
        if (fRendicion) validFotos.push({ img: fRendicion, label: 'Rendición' });

        if (validFotos.length > 0) {
          if (y + 70 > 275) { doc.addPage(); y = 18; }
          const imgW = (W - M * 2 - 8) / 2;
          doc.setFont('helvetica', 'bold'); doc.setTextColor(9, 9, 15);
          doc.text('EVIDENCIAS', M, y); y += 6;
          let x = M;
          validFotos.forEach(p => {
            if (x + imgW > W - M) { y += 75; x = M; }
            if (y + 70 > 275) { doc.addPage(); y = 18; x = M; }
            try {
              doc.addImage(p.img, p.img.includes('png') ? 'PNG' : 'JPEG', x, y, imgW, 60, undefined, 'FAST');
              doc.setFontSize(9); doc.setTextColor(90);
              doc.text(p.label, x + imgW / 2, y + 65, { align: 'center' });
              x += imgW + 8;
            } catch (e) {}
          });
        }
      };

      buildSection('DETALLE DE COBROS', isEntradas ? [16, 185, 129] : [139, 92, 246],
        catState.fisico.lineas, catState.qr.lineas, catState.talonarios, catState.fotoRendicion
      );

      doc.save(`rendicion_${type}_${NOW.toISOString().split('T')[0]}.pdf`);
    }, 100);
  };

  const exportExcel = (type) => {
    if (!window.XLSX) return toast('Cargando librería Excel, intenta de nuevo en unos segundos.', 'info');
    toast('Generando Excel corporativo...', 'ok');

    const isEntradas = type === 'entradas';
    const catState = state[type];
    const ef = isEntradas ? calc.ef() : calc.gf();
    const eq = isEntradas ? calc.eq() : calc.gq();
    const fisRows = catState.fisico.lineas;
    const qrRows = catState.qr.lineas;

    const rows = [
      [isEntradas ? 'BABEL DISCOTECA - RENDICIÓN DE ENTRADAS' : 'BABEL DISCOTECA - RENDICIÓN DE GUARDARROPÍA', '', '', '', ''],
      ['Fecha de Generación:', DATE_STR, '', '', ''],
      ['', '', '', '', ''],
      ['RESUMEN DE CAJA', '', '', '', ''],
      ['Monto Inicial (Caja Chica)', '', '', '', catState.montoInicial],
      ['Recaudado en Físico', '', '', '', ef],
      ['Recaudado en QR', '', '', '', eq],
      ['TOTAL FÍSICO ESPERADO', '', '', '', catState.montoInicial + ef],
      ['TOTAL RECAUDADO', '', '', '', ef + eq],
      ['', '', '', '', ''],
      ['Talonarios Utilizados:', catState.talonarios.length > 0 ? catState.talonarios.map(t => `Nº ${t.num||'S/N'} (${t.color||'S/C'})`).join(' | ') : 'Ninguno', '', '', ''],
      ['', '', '', '', ''],
      ['DETALLE DE COBROS', '', '', '', ''],
      ['Categoría', 'Tipo', 'Personas', 'Precio Unit. (Bs)', 'Subtotal (Bs)']
    ];

    const addL = (cat, t, lns) => lns.length ? lns.forEach(l => rows.push([cat, t, l.cant, l.precio, l.cant * l.precio])) : rows.push([cat, t, 0, 0, 0]);
    addL(type, 'Físico', fisRows);
    addL(type, 'QR', qrRows);

    rows.push(['']);
    const subtotalIndex = rows.length; // 0-indexed position for the next push
    rows.push(['SUBTOTAL COBROS', '', calcPersonas(fisRows) + calcPersonas(qrRows), '', ef + eq]);

    const ws = window.XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 28 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 20 }];
    
    ws['!merges'] = [
      { s: {r:0, c:0}, e: {r:0, c:4} },
      { s: {r:3, c:0}, e: {r:3, c:4} },
      { s: {r:12, c:0}, e: {r:12, c:4} },
      { s: {r:subtotalIndex, c:0}, e: {r:subtotalIndex, c:1} }
    ];

    const applyStyle = (cell, style) => { if (ws[cell]) ws[cell].s = { ...ws[cell].s, ...style }; };
    
    applyStyle('A1', { font: { bold: true, color: { rgb: "FFFFFF" }, sz: 16 }, fill: { fgColor: { rgb: "020617" } }, alignment: { horizontal: "center", vertical: "center" } });
    
    const cyanHeader = { font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 }, fill: { fgColor: { rgb: "06B6D4" } } };
    applyStyle('A4', cyanHeader); applyStyle('A13', cyanHeader);

    const boldValues = ['A5','A6','A7','A8','A9','E5','E6','E7','E8','E9'];
    boldValues.forEach(c => applyStyle(c, { font: { bold: true } }));
    
    applyStyle('A6', { font: { color: { rgb: "10B981" }, bold: true } }); applyStyle('E6', { font: { color: { rgb: "10B981" }, bold: true } });
    applyStyle('A7', { font: { color: { rgb: "8B5CF6" }, bold: true } }); applyStyle('E7', { font: { color: { rgb: "8B5CF6" }, bold: true } });
    applyStyle('A8', { font: { color: { rgb: "0284C7" }, bold: true, sz: 12 } }); applyStyle('E8', { font: { color: { rgb: "0284C7" }, bold: true, sz: 12 } });
    applyStyle('A9', { font: { color: { rgb: "F97316" }, bold: true, sz: 12 } }); applyStyle('E9', { font: { color: { rgb: "F97316" }, bold: true, sz: 12 } });

    applyStyle('A11', { font: { bold: true } }); applyStyle('C11', { font: { bold: true } });

    const tableHead = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "1E293B" } }, alignment: { horizontal: "center" } };
    ['A','B','C','D','E'].forEach(c => applyStyle(`${c}14`, tableHead));

    const BORDER = {
      top: { style: "thin", color: { rgb: "E2E8F0" } }, bottom: { style: "thin", color: { rgb: "E2E8F0" } },
      left: { style: "thin", color: { rgb: "E2E8F0" } }, right: { style: "thin", color: { rgb: "E2E8F0" } }
    };

    for(let i = 15; i <= rows.length - 2; i++) {
      ['A','B','C','D','E'].forEach(c => {
        if(ws[`${c}${i}`]) {
          ws[`${c}${i}`].s = { 
            border: BORDER, 
            alignment: { horizontal: c === 'A' ? "left" : "center" },
            fill: i % 2 !== 0 ? { fgColor: { rgb: "F1F5F9" } } : { fgColor: { rgb: "FFFFFF" } }
          };
        }
      });
    }

    const subTotalRowId = rows.length;
    ['A','C','D','E'].forEach(c => applyStyle(`${c}${subTotalRowId}`, { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "020617" } }, alignment: { horizontal: "center" } }));
    applyStyle(`A${subTotalRowId}`, { alignment: { horizontal: "left" } });

    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, type);
    window.XLSX.writeFile(wb, `rendicion_${type}_${NOW.toISOString().split('T')[0]}.xlsx`);
  };

  const renderSection = (cat) => {
    const s = state[cat];
    const isEnt = cat === 'entradas';
    const colorTheme = isEnt ? 'text-green-500' : 'text-purple-500';
    const bgTheme = isEnt ? 'bg-green-500/10 border-green-500/30' : 'bg-purple-500/10 border-purple-500/30';
    
    return (
      <div className="space-y-6">
        {/* SUBTOTALES EN VIVO */}
        <div className="bg-slate-950 dark:bg-slate-950 border border-slate-800 rounded-2xl p-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Efectivo</p>
            <p className={`text-xl font-black ${isEnt ? 'text-green-400' : 'text-purple-400'}`}>Bs {calcLineas(s.fisico.lineas).toFixed(0)}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">QR</p>
            <p className={`text-xl font-black ${isEnt ? 'text-green-400' : 'text-purple-400'}`}>Bs {calcLineas(s.qr.lineas).toFixed(0)}</p>
          </div>
          <div className="border-l border-slate-800">
            <p className="text-[10px] text-cyan-500 uppercase font-bold mb-1">Subtotal</p>
            <p className="text-xl font-black text-cyan-400">Bs {(calcLineas(s.fisico.lineas) + calcLineas(s.qr.lineas)).toFixed(0)}</p>
          </div>
        </div>

        {/* Caja Chica */}
        <div className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 rounded-2xl shadow-md transition-colors">
          <h3 className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">Caja Chica (Base)</h3>
          <input 
            type="number" 
            value={s.montoInicial || ''} 
            onChange={e => updateState(cat, 'montoInicial', parseFloat(e.target.value) || 0)} 
            placeholder="Monto en Bs" 
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 p-3 rounded-xl text-slate-800 dark:text-white"
          />
        </div>

        {/* Físico */}
        <div className={`border ${bgTheme} p-6 rounded-2xl shadow-md transition-colors`}>
          <h3 className={`${colorTheme} font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2`}><span className="w-2 h-2 rounded-full bg-current"></span> Físico</h3>
          <div className="flex gap-2 mb-4">
            <input 
              type="number" placeholder="Cant" 
              value={inputs[cat][isEnt?'ef':'gf'].cant} 
              onChange={e => setInputs(prev => ({...prev, [cat]: {...prev[cat], [isEnt?'ef':'gf']: {...prev[cat][isEnt?'ef':'gf'], cant: e.target.value}}}))}
              className="w-1/3 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 p-3 rounded-xl text-slate-800 dark:text-white"
            />
            <input 
              type="number" placeholder="Precio (Bs)" 
              value={inputs[cat][isEnt?'ef':'gf'].precio} 
              onChange={e => setInputs(prev => ({...prev, [cat]: {...prev[cat], [isEnt?'ef':'gf']: {...prev[cat][isEnt?'ef':'gf'], precio: e.target.value}}}))}
              className="w-1/3 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 p-3 rounded-xl text-slate-800 dark:text-white"
            />
            <button onClick={() => handleAddLinea(cat, 'fisico')} className={`w-1/3 text-white rounded-xl font-bold uppercase text-xs ${editItem && editItem.cat === cat && editItem.subcat === 'fisico' ? 'bg-orange-500' : 'bg-cyan-600 dark:bg-cyan-500'}`}>
              {editItem && editItem.cat === cat && editItem.subcat === 'fisico' ? 'Guardar' : 'Agregar'}
            </button>
          </div>
          <div className="space-y-2">
            {s.fisico.lineas.map((l, i) => (
              <div key={i} className={`flex justify-between items-center bg-white/50 dark:bg-slate-950/50 p-3 rounded-lg border transition-colors text-slate-700 dark:text-slate-300 ${editItem && editItem.cat === cat && editItem.subcat === 'fisico' && editItem.index === i ? 'border-orange-500 bg-orange-500/10' : 'border-slate-200 dark:border-slate-800'}`}>
                <span>{l.cant} pers × Bs {l.precio.toFixed(2)}</span>
                <div className="flex items-center gap-4">
                  <strong>Bs {(l.cant * l.precio).toFixed(2)}</strong>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditLinea(cat, 'fisico', i)} className="text-orange-500 hover:text-orange-600" title="Editar"><Edit2 size={16}/></button>
                    <button onClick={() => handleRemoveLinea(cat, 'fisico', i)} className="text-red-500 hover:text-red-600" title="Eliminar"><X size={16}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QR */}
        <div className={`border ${bgTheme} p-6 rounded-2xl shadow-md transition-colors`}>
          <h3 className={`${colorTheme} font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2`}><span className="w-2 h-2 rounded-full bg-current"></span> QR</h3>
          <div className="flex gap-2 mb-4">
            <input 
              type="number" placeholder="Cant" 
              value={inputs[cat][isEnt?'eq':'gq'].cant} 
              onChange={e => setInputs(prev => ({...prev, [cat]: {...prev[cat], [isEnt?'eq':'gq']: {...prev[cat][isEnt?'eq':'gq'], cant: e.target.value}}}))}
              className="w-1/3 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 p-3 rounded-xl text-slate-800 dark:text-white"
            />
            <input 
              type="number" placeholder="Precio (Bs)" 
              value={inputs[cat][isEnt?'eq':'gq'].precio} 
              onChange={e => setInputs(prev => ({...prev, [cat]: {...prev[cat], [isEnt?'eq':'gq']: {...prev[cat][isEnt?'eq':'gq'], precio: e.target.value}}}))}
              className="w-1/3 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 p-3 rounded-xl text-slate-800 dark:text-white"
            />
            <button onClick={() => handleAddLinea(cat, 'qr')} className={`w-1/3 text-white rounded-xl font-bold uppercase text-xs ${editItem && editItem.cat === cat && editItem.subcat === 'qr' ? 'bg-orange-500' : 'bg-cyan-600 dark:bg-cyan-500'}`}>
              {editItem && editItem.cat === cat && editItem.subcat === 'qr' ? 'Guardar' : 'Agregar'}
            </button>
          </div>
          <div className="space-y-2">
            {s.qr.lineas.map((l, i) => (
              <div key={i} className={`flex justify-between items-center bg-white/50 dark:bg-slate-950/50 p-3 rounded-lg border transition-colors text-slate-700 dark:text-slate-300 ${editItem && editItem.cat === cat && editItem.subcat === 'qr' && editItem.index === i ? 'border-orange-500 bg-orange-500/10' : 'border-slate-200 dark:border-slate-800'}`}>
                <span>{l.cant} pers × Bs {l.precio.toFixed(2)}</span>
                <div className="flex items-center gap-4">
                  <strong>Bs {(l.cant * l.precio).toFixed(2)}</strong>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditLinea(cat, 'qr', i)} className="text-orange-500 hover:text-orange-600" title="Editar"><Edit2 size={16}/></button>
                    <button onClick={() => handleRemoveLinea(cat, 'qr', i)} className="text-red-500 hover:text-red-600" title="Eliminar"><X size={16}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Talonarios y Fotos */}
        <div className="bg-orange-500/10 border border-orange-500/30 p-6 rounded-2xl shadow-md transition-colors">
          <h3 className="text-orange-600 dark:text-orange-500 font-bold uppercase tracking-widest text-xs mb-4">Talonarios y Evidencias</h3>
          
          <div className="flex gap-2 mb-2">
            <input type="text" placeholder="Nº Talonario" value={inputs[cat].talonario.num} onChange={e => setInputs(prev => ({...prev, [cat]: {...prev[cat], talonario: {...prev[cat].talonario, num: e.target.value}}}))} className="w-1/3 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 p-3 rounded-xl text-slate-800 dark:text-white" />
            <input type="text" placeholder="Color" value={inputs[cat].talonario.color} onChange={e => setInputs(prev => ({...prev, [cat]: {...prev[cat], talonario: {...prev[cat].talonario, color: e.target.value}}}))} className="w-1/3 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 p-3 rounded-xl text-slate-800 dark:text-white" />
            <label className={`w-1/3 text-center cursor-pointer p-3 rounded-xl border transition-colors flex items-center justify-center gap-2 ${inputs[cat].talonario.foto ? 'bg-green-500/20 border-green-500 text-green-600' : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
              <Camera size={18} />
              <span className="text-xs font-bold uppercase">{inputs[cat].talonario.foto ? 'Foto Lista' : 'Tomar Foto'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={e => handlePhotoInput(e, cat)} />
            </label>
          </div>
          <button onClick={() => handleAddTalonario(cat)} className="w-full bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-xl font-bold uppercase text-xs mb-6 shadow-md transition-colors">
            Agregar Talonario a la Lista
          </button>

          {s.talonarios.length > 0 && (
            <div className="space-y-2 mb-6">
              {s.talonarios.map((t, i) => (
                <div key={i} className="flex justify-between items-center bg-white/50 dark:bg-slate-950/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">Nº {t.num || 'S/N'}</span>
                    <span className="text-sm">({t.color || 'Sin color'})</span>
                    {t.foto && <span className="text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full flex items-center gap-1"><Check size={10}/>Foto adjunta</span>}
                  </div>
                  <button onClick={() => handleRemoveTalonario(cat, i)} className="text-red-500 hover:text-red-600" title="Eliminar"><X size={16}/></button>
                </div>
              ))}
            </div>
          )}

          <h3 className="text-orange-600 dark:text-orange-500 font-bold uppercase tracking-widest text-xs mb-4 mt-6 border-t border-orange-500/30 pt-6">Foto de Rendición General</h3>
          <label className={`flex w-full justify-center cursor-pointer p-4 rounded-xl border transition-colors ${s.fotoRendicion ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700'}`}>
            <div className="text-center relative">
              <ImageIcon className={`mx-auto mb-2 ${s.fotoRendicion ? 'text-green-500' : 'text-slate-500'}`} size={24} />
              <span className={`text-xs font-bold uppercase ${s.fotoRendicion ? 'text-green-600 dark:text-green-500' : 'text-slate-600 dark:text-slate-400'}`}>Foto General de Rendición</span>
              {s.fotoRendicion && <span className="absolute -top-2 -right-4 text-xs font-bold text-green-500 bg-green-500/20 px-2 py-0.5 rounded-full flex items-center gap-1"><Check size={12}/></span>}
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={e => handlePhoto(e, cat, 'fotoRendicion')} />
          </label>
        </div>

        {/* Notas / Observaciones */}
        <div className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-5 rounded-2xl">
          <h3 className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
            <StickyNote size={14} /> Notas u Observaciones (opcional)
          </h3>
          <textarea
            rows={3}
            value={s.notas || ''}
            onChange={e => updateState(cat, 'notas', e.target.value)}
            placeholder="Ej: Talonario azul terminado, 5 fichas de cortesia, problema con QR a las 23:30..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 p-3 rounded-xl text-slate-800 dark:text-white text-sm resize-none focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Exportar */}
        <div className="flex gap-4">
          <button onClick={() => exportPDF(cat)} className="flex-1 py-3 bg-red-600 text-white font-bold uppercase text-sm rounded-xl shadow-md hover:bg-red-700 transition-colors flex justify-center items-center gap-2">
            Exportar PDF
          </button>
          <button onClick={() => exportExcel(cat)} className="flex-1 py-3 bg-green-600 text-white font-bold uppercase text-sm rounded-xl shadow-md hover:bg-green-700 transition-colors flex justify-center items-center gap-2">
            Exportar Excel
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white pb-24 transition-colors">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-300 dark:border-slate-800 p-4 flex justify-between items-center shadow-md transition-colors">
        <div>
          <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-cyan-400 dark:to-blue-500 uppercase tracking-widest">
            RENDICIÓN
          </h1>
          <p className="text-xs text-slate-500 font-bold uppercase">{DATE_STR}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('entradas')} className={`px-4 py-2 rounded-lg font-bold uppercase text-xs transition-colors border ${activeTab === 'entradas' ? 'bg-cyan-600 dark:bg-cyan-500 text-white border-transparent' : 'bg-transparent text-slate-500 border-slate-300 dark:border-slate-800 hover:text-slate-800 dark:hover:text-white'}`}>
            Entradas
          </button>
          <button onClick={() => setActiveTab('guardarropia')} className={`px-4 py-2 rounded-lg font-bold uppercase text-xs transition-colors border ${activeTab === 'guardarropia' ? 'bg-cyan-600 dark:bg-cyan-500 text-white border-transparent' : 'bg-transparent text-slate-500 border-slate-300 dark:border-slate-800 hover:text-slate-800 dark:hover:text-white'}`}>
            Guardarropía
          </button>
          <button onClick={limpiarTodo} title="Limpiar todo el formulario" className="px-3 py-2 rounded-lg font-bold text-xs transition-colors border border-red-500/40 text-red-500 hover:bg-red-600 hover:text-white flex items-center gap-1">
            <RotateCcw size={13} /> Limpiar
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6 mt-4">
        {activeTab === 'entradas' ? renderSection('entradas') : renderSection('guardarropia')}
      </main>

      {/* Resumen Flotante */}
      <div className="fixed bottom-20 right-4 bg-slate-800 dark:bg-slate-900 border border-slate-700 text-white p-4 rounded-2xl shadow-xl flex gap-6 items-center">
        <div>
          <p className="text-[10px] text-slate-400 uppercase font-bold">Total Entradas</p>
          <p className="font-black">Bs {totalEnt.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 uppercase font-bold">Total Guarda</p>
          <p className="font-black">Bs {totalGrd.toFixed(2)}</p>
        </div>
        <div className="border-l border-slate-700 pl-6">
          <p className="text-[10px] text-cyan-400 uppercase font-bold">Gran Total</p>
          <p className="font-black text-xl text-cyan-400">Bs {granTotal.toFixed(2)}</p>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed top-20 right-4 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-bounce">
          {toastMessage.type === 'ok' ? <Check className="text-green-400" size={16} /> : <X className="text-red-400" size={16} />}
          <span className="text-sm font-bold">{toastMessage.msg}</span>
        </div>
      )}
    </div>
  );
}
