import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Zap, Camera, Upload, Trash2, Download, LogOut, Image as ImageIcon, Clock, Plus, X, Eye, Check, EyeOff, Moon, Sun, Settings, Bell, BellOff, ArrowRight } from 'lucide-react';
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, setDoc, query, orderBy, getDocs, writeBatch } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import NeonButton from '../components/ui/NeonButton';
import StatsGrid from '../components/ui/StatsGrid';
import { useTheme } from '../context/ThemeContext';

// --- COMPONENTE: DASHBOARD PRINCIPAL ---
export default function Dashboard({ user }) {
  const [activeTab, setActiveTab] = useState('efectivo'); // 'efectivo' o 'qr'
  const [fichas, setFichas] = useState([]);
  const [settings, setSettings] = useState({ qrs: [], numeroTalonarioActual: 1, limiteTalonario: 100, talonarioSerie: '', preciosEntrada: [30, 40] });
  const [isUploading, setIsUploading] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState({ file: null, base64: null, targetIds: [] });
  const [viewingImage, setViewingImage] = useState(null);
  const [fichaToDelete, setFichaToDelete] = useState(null);
  const [fichaToReturn, setFichaToReturn] = useState(null);
  const [modalMessage, setModalMessage] = useState({ show: false, title: '', message: '', type: 'info' });
  const [toastMessage, setToastMessage] = useState({ show: false, title: '', message: '', type: 'success' });
  const [isCensored, setIsCensored] = useState(false);

  // Estado del Carrito / Acumulador
  const [carrito, setCarrito] = useState([]); // [{ numero: 1, monto: 30 }, ...]
  const [selectedPendientes, setSelectedPendientes] = useState(new Set());

  // Nuevo talonario (para configurarlo manualmente)
  const [showConfigTalonario, setShowConfigTalonario] = useState(false);
  const [formTalonario, setFormTalonario] = useState({ serie: '', inicial: 1, capacidad: 100 });

  // Configuración de la App (Ajustes Estáticos)
  const [showAppSettings, setShowAppSettings] = useState(false);
  const [formAppSettings, setFormAppSettings] = useState({ precios: '30, 40' });

  const cameraInputRef = useRef(null);
  const qrUploadRef = useRef(null);
  const [activeFichaIdForReceipt, setActiveFichaIdForReceipt] = useState(null);

  // Alertas QR
  const [isAlertsEnabled, setIsAlertsEnabled] = useState(() => localStorage.getItem('babel_qr_alerts') === 'true');
  const alertsEnabledRef = useRef(isAlertsEnabled);
  useEffect(() => { alertsEnabledRef.current = isAlertsEnabled; }, [isAlertsEnabled]);
  const isFirstLoad = useRef(true);

  // PWA Install Prompt
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const playAlertSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch(e) {}
  };

  const basePath = `users/${user.uid}`;
  const fichasRef = collection(db, `${basePath}/fichas`);
  const settingsDocRef = doc(db, `${basePath}/settings`, 'appSettings');

  useEffect(() => {
    if (!window.XLSX) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js';
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(fichasRef, orderBy('createdAt', 'desc'));
    const unsubFichas = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFichas(data);

      if (!isFirstLoad.current) {
        let hasNewQR = false;
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            const f = change.doc.data();
            if (f.metodo === 'QR' && f.estado === 'Pendiente') hasNewQR = true;
          }
        });
        if (hasNewQR && alertsEnabledRef.current) {
          playAlertSound();
          if (Notification.permission === 'granted') {
            new Notification('Babel: Nuevo Pago QR', { body: 'Ha ingresado una ficha por QR Pendiente.', icon: '/favicon.ico' });
          }
        }
      } else {
        isFirstLoad.current = false;
      }
    }, (error) => console.error("Error fetching fichas:", error));

    const unsubSettings = onSnapshot(settingsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
    }, (error) => console.error("Error fetching settings:", error));

    return () => { unsubFichas(); unsubSettings(); };
  }, [user, basePath]);

  const showMessage = (title, message, type = 'info') => setModalMessage({ show: true, title, message, type });

  const showToast = (title, message, type = 'success') => {
    setToastMessage({ show: true, title, message, type });
    setTimeout(() => setToastMessage(prev => ({ ...prev, show: false })), 4000);
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400; // REDUCIDO PARA MAYOR VELOCIDAD
          let scaleSize = 1;
          if (img.width > MAX_WIDTH) scaleSize = MAX_WIDTH / img.width;

          canvas.width = img.width * scaleSize;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const base64Data = canvas.toDataURL('image/jpeg', 0.6);
          resolve(base64Data);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const guardarTalonario = async () => {
    const numActual = parseInt(formTalonario.inicial);
    const capacidad = parseInt(formTalonario.capacidad);

    if (isNaN(numActual) || numActual < 1 || isNaN(capacidad) || capacidad < 1) {
      showMessage("Error", "Ingresa números válidos mayores a 0", "warning");
      return;
    }

    const limite = numActual + capacidad - 1;

    try {
      await setDoc(settingsDocRef, {
        numeroTalonarioActual: numActual,
        limiteTalonario: limite,
        talonarioSerie: (formTalonario.serie || '').trim()
      }, { merge: true });
      showMessage("Éxito", "Talonario nuevo configurado correctamente.", "success");
      setShowConfigTalonario(false);
    } catch (error) {
      showMessage("Error", "Fallo al guardar el talonario.", "error");
    }
  };
  const guardarAppSettings = async () => {
    const preciosArr = formAppSettings.precios.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p) && p > 0);
    if (preciosArr.length === 0) { showMessage("Error", "Debes ingresar al menos un precio válido.", "warning"); return; }
    try {
      await setDoc(settingsDocRef, { preciosEntrada: preciosArr }, { merge: true });
      showMessage("Éxito", "Configuración de precios actualizada.", "success");
      setShowAppSettings(false);
    } catch (error) { showMessage("Error", "Fallo al guardar configuración.", "error"); }
  };

  const toggleAlerts = async () => {
    if (!isAlertsEnabled) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        const p = await Notification.requestPermission();
        if (p !== 'granted') {
          showToast('Permiso Denegado', 'No se activaron las alertas push.', 'error');
          return;
        }
      }
      localStorage.setItem('babel_qr_alerts', 'true');
      setIsAlertsEnabled(true);
      showToast('Alertas Activadas', 'Recibirás sonido y notificaciones Push.', 'success');
    } else {
      localStorage.setItem('babel_qr_alerts', 'false');
      setIsAlertsEnabled(false);
      showToast('Alertas Desactivadas', 'Ya no recibirás alertas de nuevos QRs.', 'info');
    }
  };

  const agregarAlCarrito = (monto) => {
    const numFicha = settings.numeroTalonarioActual + carrito.length;

    if (numFicha > settings.limiteTalonario) {
      showMessage("Talonario Agotado", `Has alcanzado el límite (${settings.limiteTalonario}) de este talonario. Por favor configura uno nuevo.`, "warning");
      return;
    }

    setCarrito([...carrito, { numero: numFicha, monto, serie: settings.talonarioSerie || '' }]);
  };

  const quitarDelCarrito = (index) => {
    const newCarrito = [...carrito];
    newCarrito.splice(index, 1);
    setCarrito(newCarrito);
  };

  const toggleSelection = useCallback((id) => {
    setSelectedPendientes(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(id)) newSelection.delete(id);
      else newSelection.add(id);
      return newSelection;
    });
  }, []);

  const handleBulkReceipt = () => {
    if (selectedPendientes.size === 0) return;
    setActiveFichaIdForReceipt(null); // No es una sola ficha
    const targetIds = Array.from(selectedPendientes);
    // Necesitamos que el selector de archivos sepa que son varias
    // Usamos una variable temporal o pasamos los IDs directamente si fuera posible, 
    // pero el flujo actual usa activeFichaIdForReceipt. Vamos a ajustarlo.
    cameraInputRef.current?.click();
  };

  const procesarCarrito = async (metodo) => { // metodo: 'Efectivo' o 'QR'
    if (carrito.length === 0) return;
    
    // Optimizacion: Si es Efectivo o QR, el batch en firestore es tan rapido que
    // no bloquearemos la pantalla entera para que se sienta verdaderamente EN VIVO.
    // Solo bloquearemos para Subida de imagenes (Comprobantes).
    try {
      const estado = metodo === 'Efectivo' ? 'Pagado' : 'Pendiente';
      const batch = writeBatch(db);

      carrito.forEach(item => {
        const newFichaRef = doc(fichasRef); // Genera un ID automático para el nuevo doc
        batch.set(newFichaRef, {
          numero: item.numero,
          serie: item.serie,
          monto: item.monto,
          estado: estado,
          metodo: metodo,
          comprobanteUrl: null,
          createdAt: Date.now()
        });
      });

      // Actualizar talonario actual
      const nuevoNumero = settings.numeroTalonarioActual + carrito.length;
      batch.set(settingsDocRef, { numeroTalonarioActual: nuevoNumero }, { merge: true });

      await batch.commit();
      
      let msg = metodo === 'Efectivo' ? "Cobro registrado en Efectivo." : "Enviado a Caja QR como pendiente.";
      let tipoMsg = metodo === 'Efectivo' ? "success" : "info";

      if (nuevoNumero > settings.limiteTalonario) {
        msg += " ¡Atención! El talonario se ha agotado. Crea uno nuevo para seguir operando.";
        tipoMsg = "warning";
      }

      showToast("Operación Exitosa", msg, tipoMsg);
      setCarrito([]);
    } catch (error) {
      console.error("Error al procesar:", error);
      showMessage("Error", "Fallo al registrar.", "error");
    }
  };

  const ponerEnEspera = async (id) => {
    try {
      await updateDoc(doc(db, `${basePath}/fichas`, id), { enEspera: true });
    } catch (error) {
      showMessage("Error", "No se pudo actualizar.", "error");
    }
  };

  const quitarDeEspera = async (id) => {
    try {
      await updateDoc(doc(db, `${basePath}/fichas`, id), { enEspera: false });
    } catch (error) {
      showMessage("Error", "No se pudo actualizar.", "error");
    }
  };

  const confirmarEliminarFicha = async () => {
    if (!fichaToDelete) return;
    try {
      const batch = writeBatch(db);
      const fichaRef = doc(db, `${basePath}/fichas`, fichaToDelete);
      batch.delete(fichaRef);

      const nuevoNumero = Math.max(1, settings.numeroTalonarioActual - 1);
      batch.set(settingsDocRef, { numeroTalonarioActual: nuevoNumero }, { merge: true });

      await batch.commit();
      showToast("Éxito", "Ficha eliminada y número retornado.", "success");
    } catch (error) {
      showToast("Error", "No se pudo eliminar.", "error");
    } finally { setFichaToDelete(null); }
  };

  const confirmarDevolverFicha = async () => {
    if (!fichaToReturn) return;
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, `${basePath}/fichas`, fichaToReturn), { estado: 'Devuelta' });
      const nuevoNumero = Math.max(1, settings.numeroTalonarioActual - 1);
      batch.set(settingsDocRef, { numeroTalonarioActual: nuevoNumero }, { merge: true });
      await batch.commit();
      showToast("Éxito", "Ficha devuelta y número retornado.", "success");
    } catch (error) {
      showToast("Error", "No se pudo devolver.", "error");
    } finally { setFichaToReturn(null); }
  };

  const limpiarHistorial = async () => {
    const confirm = window.confirm("¿ESTÁS TOTALMENTE SEGURO? Esta acción eliminará TODAS las fichas del historial de forma permanente. No se puede deshacer.");
    if (!confirm) return;

    setIsUploading(true);
    try {
      const querySnapshot = await getDocs(fichasRef);
      if (querySnapshot.empty) {
        showMessage("Información", "El historial ya está vacío.", "info");
        setIsUploading(false);
        return;
      }

      // Crear un array de promesas de borrado para cada documento.
      const deletePromises = querySnapshot.docs.map(document => deleteDoc(document.ref));

      // Esperar a que todas las promesas de borrado se completen.
      await Promise.all(deletePromises);

      showMessage("Éxito", "Todo el historial ha sido borrado.", "success");
    } catch (error) {
      console.error("Error al limpiar historial:", error);
      showMessage("Error", "Hubo un problema al intentar borrar el historial.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleReceiptSelection = async (e) => {
    const file = e.target.files?.[0];
    let targetIds = [];
    if (activeFichaIdForReceipt) {
      targetIds = [activeFichaIdForReceipt];
    } else if (selectedPendientes.size > 0) {
      targetIds = Array.from(selectedPendientes);
    }

    if (!file || targetIds.length === 0) return;

    setIsUploading(true);
    try {
      const base64Image = await compressImage(file);
      setReceiptPreview({ file, base64: base64Image, targetIds });
    } catch (error) {
      showMessage("Error", "No se pudo procesar la imagen.", "error");
    } finally {
      setIsUploading(false);
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const confirmReceiptUpload = async () => {
    if (!receiptPreview.base64 || receiptPreview.targetIds.length === 0) return;
    setIsUploading(true);
    try {
      const batch = writeBatch(db);
      receiptPreview.targetIds.forEach(id => {
        const fichaRef = doc(db, `${basePath}/fichas`, id);
        batch.update(fichaRef, { comprobanteUrl: receiptPreview.base64, estado: 'Pagado' });
      });
      await batch.commit();

      showToast("Éxito", "Imagen descargada y monto sumado.", "success");
      // Intentar forzar descarga
      try {
        const link = document.createElement("a");
        link.href = receiptPreview.base64;
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
        link.download = `${dateStr}_${timeStr}-Babel.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("No se pudo descargar automáticamente: ", err);
      }

    } catch (error) {
      showToast("Error", "Error al guardar el comprobante.", "error");
    } finally {
      setIsUploading(false);
      setReceiptPreview({ file: null, base64: null, targetIds: [] });
      setActiveFichaIdForReceipt(null);
      setSelectedPendientes(new Set());
    }
  };

  const handleQRUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (settings.qrs?.length >= 3) { showMessage("Límite", "Máximo 3 QRs permitidos.", "warning"); return; }

    setIsUploading(true);
    try {
      const base64QR = await compressImage(file);
      const newQRs = [...(settings.qrs || []), base64QR];
      await setDoc(settingsDocRef, { qrs: newQRs }, { merge: true });
    } catch (error) {
      console.error("Error subiendo QR:", error);
    } finally {
      setIsUploading(false);
      if (qrUploadRef.current) qrUploadRef.current.value = '';
    }
  };

  const eliminarQR = async (index) => {
    const confirm = window.confirm("¿Seguro que deseas eliminar este QR?");
    if (!confirm) return;
    try {
      const newQRs = settings.qrs.filter((_, i) => i !== index);
      await updateDoc(settingsDocRef, { qrs: newQRs });
    } catch (error) {
      console.error("Error al borrar QR", error);
    }
  };

  const marcarComoPagado = async (id) => {
    try {
      await updateDoc(doc(db, `${basePath}/fichas`, id), { estado: 'Pagado' });
    } catch (error) {
      showMessage("Error", "No se pudo actualizar el estado.", "error");
    }
  };

  const handleQuitarEspera = useCallback((id) => quitarDeEspera(id), []);
  const handlePonerEspera = useCallback((id) => ponerEnEspera(id), []);
  const handleReturnFicha = useCallback((id) => setFichaToReturn(id), []);
  const handlePhotoFicha = useCallback((id) => { setActiveFichaIdForReceipt(id); cameraInputRef.current?.click(); }, []);
  const handleMarcarPagado = useCallback((id) => marcarComoPagado(id), []);
  const handleViewImage = useCallback((url) => setViewingImage(url), []);
  const handleDeleteFicha = useCallback((id) => setFichaToDelete(id), []);

  const stats = useMemo(() => {
    let breakdown = {};
    let totalPendientes = 0;
    let montoTotal = 0;
    fichas.forEach(f => {
      if (activeTab === 'efectivo' && f.metodo !== 'Efectivo') return;
      if (activeTab === 'qr' && f.metodo !== 'QR') return;

      if (f.estado === 'Pagado') {
        breakdown[f.monto] = (breakdown[f.monto] || 0) + 1;
        montoTotal += f.monto;
      } else if (f.estado === 'Pendiente') {
        totalPendientes++;
      }
    });
    return { breakdown, montoTotal, totalPendientes };
  }, [fichas, activeTab]);

  // Listas divididas y memoizadas para optimizar rendimiento
  const fichasHistorial = useMemo(() =>
    fichas.filter(f => f.metodo === (activeTab === 'efectivo' ? 'Efectivo' : 'QR'))
          .sort((a, b) => b.createdAt - a.createdAt),
    [fichas, activeTab]
  );
  const pendientesQR = useMemo(() =>
    fichas.filter(f => f.metodo === 'QR' && f.estado === 'Pendiente'),
    [fichas]
  );

  const exportarExcel = () => {
    if (!window.XLSX) { showMessage("Aviso", "Cargando librería Excel, intenta de nuevo en unos segundos.", "info"); return; }
    
    const fichasEfectivo = fichas.filter(f => f.metodo === 'Efectivo');
    const fichasQR = fichas.filter(f => f.metodo === 'QR');
    const totalEfectivo = fichasEfectivo.filter(f => f.estado === 'Pagado').reduce((acc, f) => acc + f.monto, 0);
    const totalQR = fichasQR.filter(f => f.estado === 'Pagado').reduce((acc, f) => acc + f.monto, 0);

    const rows = [
      ['BABEL DISCOTECA - REPORTE DE CAJAS', '', '', '', ''],
      ['Fecha de Generación:', new Date().toLocaleString(), '', '', ''],
      ['', '', '', '', ''],
      ['RESUMEN DE OPERACIONES', '', '', '', ''],
      ['Total Fichas Emitidas', fichas.length, '', '', ''],
      ['Total Fichas Pagadas', fichas.filter(f => f.estado === 'Pagado').length, '', '', ''],
      ['Recaudado en EFECTIVO', totalEfectivo, '', '', ''],
      ['Recaudado en QR', totalQR, '', '', ''],
      ['MONTO TOTAL RECAUDADO', stats.montoTotal, '', '', ''],
      ['Fichas en Espera / Pendientes', stats.totalPendientes, '', '', ''],
      ['', '', '', '', ''],
      ['DETALLE DE TRANSACCIONES', '', '', '', ''],
      ['Nº Ficha', 'Monto (Bs)', 'Estado', 'Método de Pago', 'Hora de Registro']
    ];

    const sortedFichas = [...fichas].sort((a, b) => {
      const isAEf = a.metodo === 'Efectivo';
      const isBEf = b.metodo === 'Efectivo';
      if (activeTab === 'efectivo') return isAEf && !isBEf ? -1 : (!isAEf && isBEf ? 1 : 0);
      return !isAEf && isBEf ? -1 : (isAEf && !isBEf ? 1 : 0);
    });

    sortedFichas.forEach(f => {
      rows.push([
        f.serie ? `${f.serie}-${f.numero}` : f.numero,
        f.monto,
        f.estado,
        f.metodo,
        new Date(f.createdAt).toLocaleTimeString()
      ]);
    });

    const ws = window.XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 28 }, { wch: 15 }, { wch: 18 }, { wch: 22 }, { wch: 22 }];
    
    ws['!merges'] = [
      { s: {r:0, c:0}, e: {r:0, c:4} },
      { s: {r:3, c:0}, e: {r:3, c:4} },
      { s: {r:11, c:0}, e: {r:11, c:4} },
    ];

    const applyStyle = (cell, style) => { if (ws[cell]) ws[cell].s = { ...ws[cell].s, ...style }; };
    
    applyStyle('A1', { font: { bold: true, color: { rgb: "FFFFFF" }, sz: 16 }, fill: { fgColor: { rgb: "020617" } }, alignment: { horizontal: "center", vertical: "center" } });
    
    const cyanHeader = { font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 }, fill: { fgColor: { rgb: "06B6D4" } } };
    applyStyle('A4', cyanHeader); applyStyle('A12', cyanHeader);
    
    const boldValues = ['A5','A6','A7','A8','A9','A10', 'B5','B6','B7','B8','B9','B10'];
    boldValues.forEach(c => applyStyle(c, { font: { bold: true } }));
    
    applyStyle('A7', { font: { color: { rgb: "10B981" }, bold: true } }); applyStyle('B7', { font: { color: { rgb: "10B981" }, bold: true } });
    applyStyle('A8', { font: { color: { rgb: "8B5CF6" }, bold: true } }); applyStyle('B8', { font: { color: { rgb: "8B5CF6" }, bold: true } });
    applyStyle('A9', { font: { color: { rgb: "0284C7" }, bold: true, sz: 12 } }); applyStyle('B9', { font: { color: { rgb: "0284C7" }, bold: true, sz: 12 } });
    applyStyle('A10', { font: { color: { rgb: "F97316" }, bold: true } }); applyStyle('B10', { font: { color: { rgb: "F97316" }, bold: true } });

    const tableHead = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "1E293B" } }, alignment: { horizontal: "center" } };
    ['A','B','C','D','E'].forEach(c => applyStyle(`${c}13`, tableHead));
    
    const BORDER = {
      top: { style: "thin", color: { rgb: "E2E8F0" } },
      bottom: { style: "thin", color: { rgb: "E2E8F0" } },
      left: { style: "thin", color: { rgb: "E2E8F0" } },
      right: { style: "thin", color: { rgb: "E2E8F0" } }
    };

    // Zebra striping y bordes
    for(let i = 14; i <= rows.length; i++) {
      ['A','B','C','D','E'].forEach(c => {
        if(ws[`${c}${i}`]) {
          ws[`${c}${i}`].s = { 
            border: BORDER, 
            alignment: { horizontal: (c === 'A' || c === 'E') ? "left" : "center" },
            fill: i % 2 !== 0 ? { fgColor: { rgb: "F1F5F9" } } : { fgColor: { rgb: "FFFFFF" } }
          };
        }
      });
    }

    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Transacciones");
    window.XLSX.writeFile(wb, `Cajas_Babel_${new Date().toLocaleDateString()}.xlsx`);
  };

  const exportarPDF = () => {
    if (!window.jspdf || !window.jspdf.jsPDF.API.autoTable) {
      showMessage("Aviso", "Cargando librería PDF, intenta de nuevo en unos segundos.", "info");
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

    showMessage("Exportación", "Generando PDF corporativo con fotos. Por favor espera unos segundos...", "info");

    setTimeout(() => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W = doc.internal.pageSize.getWidth();
      const M = 14;
      
      // Header Dark
      doc.setFillColor(2, 6, 23);
      doc.rect(0, 0, W, 40, 'F');
      // Accent Cyan
      doc.setFillColor(6, 182, 212);
      doc.rect(0, 0, 6, 40, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22); doc.setTextColor(255, 255, 255);
      doc.text('BABEL - REPORTE DE CAJAS', M + 4, 16);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11); doc.setTextColor(148, 163, 184);
      doc.text('Fecha de emisión: ' + new Date().toLocaleString(), M + 4, 25);
      
      let y = 48;
      
      // Resumen Ejecutivo
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(M, y, W - M * 2, 36, 3, 3, 'FD');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(15, 23, 42);
      doc.text('RESUMEN EJECUTIVO', M + 5, y + 8);
      
      const fichasEf = fichas.filter(f => f.metodo === 'Efectivo' && f.estado === 'Pagado');
      const fichasQr = fichas.filter(f => f.metodo === 'QR' && f.estado === 'Pagado');
      const sumEf = fichasEf.reduce((a, b) => a + b.monto, 0);
      const sumQr = fichasQr.reduce((a, b) => a + b.monto, 0);

      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(71, 85, 105);
      doc.text(`Total Fichas Emitidas: ${fichas.length}`, M + 5, y + 16);
      doc.text(`Fichas Pendientes: ${stats.totalPendientes}`, M + 70, y + 16);
      
      doc.text(`Efectivo: Bs. ${sumEf}`, M + 5, y + 24);
      doc.text(`QR: Bs. ${sumQr}`, M + 70, y + 24);

      doc.setFont('helvetica', 'bold'); doc.setTextColor(6, 182, 212);
      doc.text(`MONTO TOTAL RECAUDADO: Bs. ${stats.montoTotal}`, M + 5, y + 32);
      
      y += 46;
      
      // Tabla
      doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(15, 23, 42);
      doc.text('DETALLE DE TRANSACCIONES', M, y);
      y += 4;

      const sortedFichas = [...fichas].sort((a, b) => {
        const isAEf = a.metodo === 'Efectivo';
        const isBEf = b.metodo === 'Efectivo';
        if (activeTab === 'efectivo') return isAEf && !isBEf ? -1 : (!isAEf && isBEf ? 1 : 0);
        return !isAEf && isBEf ? -1 : (isAEf && !isBEf ? 1 : 0);
      });

      const allRows = sortedFichas.map(f => [
        f.serie ? `${f.serie}-${f.numero}` : f.numero,
        `Bs. ${f.monto}`, f.estado, f.metodo,
        new Date(f.createdAt).toLocaleTimeString(),
        f.comprobanteUrl ? 'Sí' : 'No'
      ]);

      doc.autoTable({
        startY: y, margin: { left: M, right: M },
        head: [['Ficha', 'Monto', 'Estado', 'Método', 'Hora', 'Comprobante']],
        body: allRows.length > 0 ? allRows : [['Sin datos', '—', '—', '—', '—', '—']],
        styles: { font: 'helvetica', fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [2, 6, 23], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      });
      
      y = doc.lastAutoTable.finalY + 15;
      const comprobantes = sortedFichas.filter(f => f.comprobanteUrl);
      if (comprobantes.length > 0) {
        doc.addPage();
        y = 18;
        doc.setFont('helvetica', 'bold'); doc.setTextColor(2, 6, 23);
        doc.text('EVIDENCIAS Y COMPROBANTES', M, y);
        y += 10;
        
        const imgW = (W - M * 2 - 10) / 2;
        let x = M;
        
        comprobantes.forEach((f, i) => {
          if (y + 80 > 280) { doc.addPage(); y = 18; x = M; }
          try {
            doc.addImage(f.comprobanteUrl, 'JPEG', x, y, imgW, 70, undefined, 'FAST');
            doc.setFontSize(9);
            doc.text(`Ficha: ${f.serie ? f.serie + '-' : ''}${f.numero}`, x + imgW / 2, y + 75, { align: 'center' });
          } catch (e) {}
          
          if (i % 2 === 0) { x += imgW + 10; } 
          else { x = M; y += 85; }
        });
      }
      doc.save(`cajas_babel_${new Date().toLocaleDateString()}.pdf`);
    }, 100);
  };

  const { theme, toggleTheme } = useTheme();

  const panelFichasPendientes = (
    <section className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-6 shadow-md shadow-slate-300/50 dark:shadow-black/20 transition-colors flex flex-col h-[350px] w-full">
      <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 shrink-0">
        <Clock size={16} className="text-cyan-600 dark:text-cyan-400" /> Fichas Pendientes (Enviadas a QR)
      </h2>

      <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1 min-h-0">
        {pendientesQR.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-2 px-1">
              <button
                onClick={() => setSelectedPendientes(selectedPendientes.size === pendientesQR.length ? new Set() : new Set(pendientesQR.map(f => f.id)))}
                className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors"
              >
                {selectedPendientes.size === pendientesQR.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
              </button>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {selectedPendientes.size} seleccionados
              </span>
            </div>
            {pendientesQR.map(ficha => (
              <FichaQRMZ 
                key={ficha.id} 
                ficha={ficha} 
                isSelected={selectedPendientes.has(ficha.id)} 
                onToggle={toggleSelection} 
                onQuitarEspera={quitarDeEspera} 
                onPonerEspera={ponerEnEspera} 
                onReturn={handleReturnFicha} 
                onPhoto={handlePhotoFicha} 
              />
            ))}
          </>
        ) : <p className="text-slate-600 text-center py-10 font-bold tracking-widest uppercase">No hay fichas pendientes</p>}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white font-sans pb-24 overflow-x-hidden selection:bg-cyan-500/30 transition-colors duration-300">
      
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-300 dark:border-slate-800 p-4 flex flex-row flex-wrap sm:flex-nowrap justify-between items-center gap-4 shadow-md shadow-slate-300/50 dark:shadow-black/20 transition-colors">
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-slate-800 dark:text-white shrink-0">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-cyan-400 dark:to-blue-500">BABEL</span>
        </h1>

        {/* TAB SELECTOR */}
        <div className="flex bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-1 w-full sm:w-auto order-last sm:order-none justify-center transition-colors">
          <button onClick={() => setActiveTab('efectivo')} className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg font-bold uppercase tracking-wider text-xs sm:text-sm transition-all ${activeTab === 'efectivo' ? 'bg-blue-600 dark:bg-cyan-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}>
            Caja Efectivo
          </button>
          <button onClick={() => setActiveTab('qr')} className={`relative flex items-center justify-center gap-2 flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg font-bold uppercase tracking-wider text-xs sm:text-sm transition-all ${activeTab === 'qr' ? 'bg-cyan-500 text-white dark:text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}>
            Caja QR
            {pendientesQR.length > 0 && (
              <span className="flex items-center justify-center bg-red-500 text-white text-[10px] sm:text-xs px-2 py-0.5 rounded-full shadow-lg shadow-red-500/30 animate-pulse border border-red-400/50 absolute -top-2 -right-2 sm:static">
                {pendientesQR.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-2 shrink-0">
          <button onClick={() => {
            setFormAppSettings({ precios: (settings.preciosEntrada || [30, 40]).join(', ') });
            setShowAppSettings(true);
          }} className="text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors p-2 bg-slate-200 dark:bg-slate-900 rounded-full border border-slate-300 dark:border-slate-800 shadow-sm" title="Ajustes de Sistema">
            <Settings size={20} />
          </button>
          <button onClick={toggleTheme} className="text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors p-2 bg-slate-200 dark:bg-slate-900 rounded-full border border-slate-300 dark:border-slate-800 shadow-sm" title="Cambiar Tema">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => signOut(auth)} className="text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors p-2 bg-slate-200 dark:bg-slate-900 rounded-full border border-slate-300 dark:border-slate-800 hover:border-red-500/50 dark:hover:border-red-500/50 shadow-sm" title="Cerrar Sesión">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-8 mt-2 sm:mt-4">
        {/* COLUMNA IZQUIERDA (Controles) */}
        <div className="md:col-span-6 lg:col-span-7 space-y-4 sm:space-y-8">

          {activeTab === 'efectivo' && (
            <section className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-6 shadow-md shadow-slate-300/50 dark:shadow-black/20 relative overflow-hidden transition-colors">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2"><Plus size={16} className="text-cyan-600 dark:text-cyan-500" /> Nuevo Cobro</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 uppercase font-bold">Límite: {settings.limiteTalonario || 100}</span>
                  <button onClick={() => setShowConfigTalonario(true)} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs text-slate-800 dark:text-white uppercase font-bold rounded-xl transition-colors border border-slate-300 dark:border-slate-700">
                    Nuevo Talonario
                  </button>
                </div>
              </div>

              {pendientesQR.length > 0 && (
                <div className="bg-purple-600/10 border border-purple-500/30 rounded-xl p-3 mb-6 flex items-center justify-between shadow-inner shadow-purple-500/10">
                  <div className="flex flex-col">
                    <span className="text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                      QRs Pendientes: {pendientesQR.length}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-[10px] mt-1 font-medium leading-tight">
                      Fichas: {pendientesQR.map(f => f.serie ? `${f.serie}-${f.numero}` : `#${f.numero}`).join(', ')}
                    </span>
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mb-2">Ficha Actual a Emitir</p>
                <span className="text-5xl md:text-6xl font-black text-slate-800 dark:text-white">
                  {settings.talonarioSerie && <span className="text-2xl md:text-3xl text-slate-400 dark:text-slate-500 mr-2">{settings.talonarioSerie}-</span>}
                  {settings.numeroTalonarioActual > (settings.limiteTalonario || 100) ? 'Agotado' : settings.numeroTalonarioActual + carrito.length}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 mb-6 w-full">
                {(settings.preciosEntrada || [30]).map((precio, idx) => (
                  <NeonButton key={idx} color={idx % 2 === 0 ? 'blue' : 'cyan'} onClick={() => agregarAlCarrito(precio)} disabled={settings.numeroTalonarioActual > (settings.limiteTalonario || 100)} className="flex-1 min-w-[120px] h-16 sm:h-20 flex-col text-lg sm:text-xl transition-all shadow-md active:scale-95">
                    + {precio} Bs
                  </NeonButton>
                ))}
              </div>

              {carrito.length > 0 && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mt-6">
                  <div className="flex justify-between items-center mb-4 px-2">
                    <span className="text-slate-500 text-xs uppercase font-bold">Total a cobrar:</span>
                    <span className="text-3xl font-black text-white">{carrito.reduce((acc, curr) => acc + curr.monto, 0)} Bs</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button onClick={() => procesarCarrito('Efectivo')} className="bg-lime-500 hover:bg-lime-600 text-slate-900 font-bold uppercase tracking-wider py-3 rounded-xl transition-all shadow-lg shadow-lime-500/20">
                      Cobrar Efectivo
                    </button>
                    <button onClick={() => procesarCarrito('QR')} className="bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-wider py-3 rounded-xl transition-all shadow-lg shadow-purple-600/20">
                      Enviar a QR
                    </button>
                  </div>

                  <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">Detalle de Fichas</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {carrito.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-900 px-3 py-2 rounded-xl text-sm border border-slate-800/50">
                        <span className="font-bold text-slate-300">Ficha {item.serie ? `${item.serie}-` : '#'}{item.numero}</span>
                        <div className="flex items-center gap-3">
                          <span className={item.monto === 30 ? 'text-pink-500 font-black' : 'text-cyan-400 font-black'}>{item.monto} Bs</span>
                          <button onClick={() => quitarDelCarrito(idx)} className="text-slate-500 hover:text-red-400 transition-colors p-1 bg-slate-950 rounded-md"><X size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === 'qr' && panelFichasPendientes}

          <StatsGrid stats={stats} activeTab={activeTab} isCensored={isCensored} setIsCensored={setIsCensored} />

          {activeTab === 'qr' && (
            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">QRs de Pago</h2>
                <button onClick={() => qrUploadRef.current?.click()} className="text-purple-400 bg-purple-500/20 p-2 rounded-full"><Upload size={20} /></button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
                {settings.qrs?.length > 0 ? (
                  settings.qrs.map((qr, idx) => (
                    <div key={idx} className="min-w-[150px] aspect-square bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center p-2 snap-center relative overflow-hidden group">
                      <img src={qr} alt={`QR ${idx}`} onClick={() => setViewingImage(qr)} className="w-full h-full object-contain rounded-xl cursor-pointer" />
                      <button onClick={() => eliminarQR(idx)} className="absolute top-2 right-2 bg-red-600/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                    </div>
                  ))
                ) : (
                  <div className="w-full h-32 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-600">
                    <ImageIcon size={32} className="mb-2" /><span className="text-sm">Sin QRs</span>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* COLUMNA DERECHA (Historial) */}
        <div className="md:col-span-6 lg:col-span-5 flex flex-col gap-6">
          <div className="bg-slate-100/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-800 rounded-3xl p-4 sm:p-6 flex flex-col transition-colors h-[350px] lg:h-[80vh]">
            <div className="flex flex-col gap-4 mb-6 shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Historial de {activeTab}</h2>
                <div className="flex gap-2">
                  <button onClick={exportarPDF} className="flex items-center gap-1 text-xs font-bold bg-red-500/20 text-red-500 px-3 py-1.5 rounded-lg border border-red-500/30 uppercase hover:bg-red-600 hover:text-white transition-all"><Download size={14} /> PDF</button>
                  <button onClick={exportarExcel} className="flex items-center gap-1 text-xs font-bold bg-lime-500/20 text-lime-400 px-3 py-1.5 rounded-lg border border-lime-500/30 uppercase hover:bg-lime-500 hover:text-slate-900 transition-all"><Download size={14} /> Excel</button>
                  <button onClick={limpiarHistorial} className="flex items-center gap-1 text-xs font-bold bg-slate-500/20 text-slate-500 px-3 py-1.5 rounded-lg border border-slate-500/30 uppercase hover:bg-red-600 hover:text-white transition-all"><Trash2 size={14} /> Limpiar</button>
                </div>
              </div>
            </div>
            <div className="space-y-3 overflow-y-auto pr-2 flex-1 custom-scrollbar min-h-0">
              {fichasHistorial.map((ficha) => (
                <FichaHistorialMZ 
                  key={ficha.id} 
                  ficha={ficha} 
                  activeTab={activeTab} 
                  onMarcarPagado={handleMarcarPagado} 
                  onViewImage={handleViewImage} 
                  onReturn={handleReturnFicha} 
                  onDelete={handleDeleteFicha} 
                  onPonerEspera={ponerEnEspera}
                  onQuitarEspera={quitarDeEspera}
                />
              ))}
            </div>
          </div>
          
          <div className="flex flex-col h-[350px] lg:hidden">
            {activeTab === 'efectivo' && panelFichasPendientes}
          </div>
        </div>
      </main>

      {/* MODALES */}

      {/* MODALES TIPO ALERTA */}
      {showAppSettings && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[90] flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 relative">
            <button onClick={() => setShowAppSettings(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>
            <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider text-center flex justify-center items-center gap-2">
              <Settings size={24} className="text-cyan-500" />
              Configuración
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Precios de Entradas (separados por coma)</label>
                <input type="text" value={formAppSettings.precios} onChange={e => setFormAppSettings({ ...formAppSettings, precios: e.target.value })} placeholder="Ej: 30, 40, 50" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors" />
                <p className="text-[10px] text-slate-500 mt-2 uppercase">Define los montos de cobro rápido disponibles en la caja.</p>
              </div>
              <div className="border-t border-slate-800 pt-4 mt-4">
                <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-md">
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      {isAlertsEnabled ? <Bell size={16} className="text-cyan-400"/> : <BellOff size={16} className="text-slate-500"/>}
                      Alertas de Caja QR
                    </h4>
                    <p className="text-[10px] text-slate-400 uppercase mt-1">Sonido y notificaciones al recibir QRs.</p>
                  </div>
                  <button onClick={toggleAlerts} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${isAlertsEnabled ? 'bg-cyan-500' : 'bg-slate-700'}`}>
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isAlertsEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
              {deferredPrompt && (
                <div className="border-t border-slate-800 pt-4 mt-4">
                  <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-md">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Download size={16} className="text-cyan-400"/>
                        Instalar App Nativa
                      </h4>
                      <p className="text-[10px] text-slate-400 uppercase mt-1">Descarga Babel en tu menú de inicio.</p>
                    </div>
                    <button onClick={handleInstallClick} className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-lg shadow-cyan-500/20 text-[10px]">
                      Instalar
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => setShowAppSettings(false)} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-bold uppercase text-sm">Cancelar</button>
              <button onClick={guardarAppSettings} className="flex-1 py-3 rounded-xl bg-cyan-600 text-white hover:bg-cyan-500 transition-colors font-bold uppercase text-sm shadow-lg shadow-cyan-500/20">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {showConfigTalonario && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[90] flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 relative">
            <button onClick={() => setShowConfigTalonario(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>
            <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider text-center">Nuevo Talonario</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Código / Serie (Opcional)</label>
                <input type="text" value={formTalonario.serie} onChange={e => setFormTalonario({ ...formTalonario, serie: e.target.value.toUpperCase() })} placeholder="Ej: A" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors uppercase" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Comienza en (*)</label>
                  <input type="number" value={formTalonario.inicial} onChange={e => setFormTalonario({ ...formTalonario, inicial: e.target.value })} min="1" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Cantidad Fichas</label>
                  <input type="number" value={formTalonario.capacidad} onChange={e => setFormTalonario({ ...formTalonario, capacidad: e.target.value })} min="1" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors" required />
                </div>
              </div>

              <div className="bg-slate-800 p-3 rounded-lg text-center mt-2">
                <p className="text-xs text-slate-400">Rango generado:</p>
                <p className="text-lime-400 font-black">{formTalonario.serie ? `${formTalonario.serie}-` : ''}{formTalonario.inicial || 1} al {formTalonario.serie ? `${formTalonario.serie}-` : ''}{(parseInt(formTalonario.inicial) || 1) + (parseInt(formTalonario.capacidad) || 100) - 1}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowConfigTalonario(false)} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-bold uppercase text-sm">Cancelar</button>
              <button onClick={guardarTalonario} className="flex-1 py-3 rounded-xl bg-pink-600 text-white hover:bg-pink-500 transition-colors font-bold uppercase text-sm">Crear</button>
            </div>
          </div>
        </div>
      )}

      {fichaToDelete && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[80] flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-red-500/50 rounded-3xl p-6 text-center">
            <Trash2 className="text-red-500 mx-auto mb-4" size={40} />
            <h3 className="text-xl font-bold text-white mb-2 uppercase">¿Eliminar Ficha?</h3>
            <p className="text-slate-400 text-sm mb-6">Esto regresará un número al conteo de fichas disponibles.</p>
            <div className="flex gap-3">
              <button onClick={() => setFichaToDelete(null)} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300">Cancelar</button>
              <button onClick={confirmarEliminarFicha} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold uppercase">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {fichaToReturn && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[80] flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-500/50 rounded-3xl p-6 text-center">
            <LogOut className="text-slate-400 mx-auto mb-4 rotate-180" size={40} />
            <h3 className="text-xl font-bold text-white mb-2 uppercase">¿Devolver Ficha?</h3>
            <p className="text-slate-400 text-sm mb-6">La ficha quedará marcada como Devuelta y su número retornará al conteo disponible.</p>
            <div className="flex gap-3">
              <button onClick={() => setFichaToReturn(null)} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300">Cancelar</button>
              <button onClick={confirmarDevolverFicha} className="flex-1 py-3 rounded-xl bg-slate-600 text-white font-bold uppercase">Devolver</button>
            </div>
          </div>
        </div>
      )}

      {receiptPreview.base64 && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[95] flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-purple-500/50 rounded-3xl p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-4 uppercase">Confirmar Foto</h3>
            <img src={receiptPreview.base64} alt="Preview" className="w-full h-64 object-contain mb-6 rounded-xl border border-slate-800" />
            <div className="flex gap-3 w-full">
              <button onClick={() => setReceiptPreview({ file: null, base64: null, targetIds: [] })} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300">Descartar</button>
              <button onClick={confirmReceiptUpload} className="flex-1 py-3 rounded-xl bg-purple-500 text-white">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {viewingImage && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setViewingImage(null)}>
          <button className="absolute top-4 right-4 text-white bg-slate-900/50 p-2 rounded-full"><X size={32} /></button>
          <img src={viewingImage} alt="Comprobante Guardado" className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {modalMessage.show && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 text-center">
            <h3 className="text-xl font-bold mb-2 uppercase text-white">{modalMessage.title}</h3>
            <p className="text-slate-300 mb-6">{modalMessage.message}</p>
            <NeonButton color="cyan" onClick={() => setModalMessage({ show: false, title: '', message: '', type: 'info' })} className="w-full">Entendido</NeonButton>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage.show && (
        <div className={`fixed top-4 right-4 z-[110] max-w-sm w-[90%] p-4 rounded-2xl shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300 border backdrop-blur-xl ${
          toastMessage.type === 'success' ? 'bg-lime-500/20 border-lime-500/50 text-lime-400' :
          toastMessage.type === 'warning' ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' :
          toastMessage.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-400' :
          'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="font-bold uppercase tracking-wider text-sm mb-1">{toastMessage.title}</h4>
              <p className="text-xs font-medium text-slate-200">{toastMessage.message}</p>
            </div>
            <button onClick={() => setToastMessage({ ...toastMessage, show: false })} className="text-white/50 hover:text-white transition-colors shrink-0">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} className="hidden" onChange={handleReceiptSelection} />
      <input type="file" accept="image/*" ref={qrUploadRef} className="hidden" onChange={handleQRUpload} />

      {isUploading && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-transparent border-t-yellow-400 border-r-pink-500 rounded-full animate-spin mb-4"></div>
          <p className="text-white font-bold uppercase tracking-widest animate-pulse">Procesando...</p>
        </div>
      )}

      {/* BARRA FLOTANTE MULTI-SELECCIÓN */}
      {selectedPendientes.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] w-[90%] max-w-lg bg-slate-900/90 backdrop-blur-xl border border-cyan-500/50 rounded-2xl p-4 shadow-2xl shadow-black/50 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div>
            <p className="text-white font-black text-lg">{selectedPendientes.size} <span className="text-slate-400 text-sm font-bold uppercase tracking-tighter">Fichas seleccionadas</span></p>
            <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest">Monto a cobrar: {pendientesQR.filter(f => selectedPendientes.has(f.id)).reduce((sum, f) => sum + f.monto, 0)} Bs</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSelectedPendientes(new Set())} className="p-3 text-slate-400 hover:text-white transition-colors" title="Cancelar selección">
              <X size={24} />
            </button>
            <button onClick={handleBulkReceipt} className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-black uppercase tracking-wider px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20">
              <Camera size={20} />
              <span>Foto Grupal</span>
            </button>
          </div>
        </div>
      )}
      {/* FOOTER FIRMA */}
      <footer className="w-full text-center py-10 mt-8 opacity-70">
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm italic mb-2">
          "El buen diseño es obvio. El gran diseño es transparente." — Joe Sparano
        </p>
        <p className="text-slate-600 dark:text-slate-300 font-black uppercase tracking-[0.3em] text-xs">
          @Sr.Avila
        </p>
      </footer>
    </div>
  );
}

// --- COMPONENTES MEMORIZADOS PARA RENDIMIENTO FLUIDO ---
const FichaQRMZ = React.memo(({ ficha, isSelected, onToggle, onQuitarEspera, onPonerEspera, onReturn, onPhoto }) => {
  return (
    <div onClick={() => onToggle(ficha.id)} className={`bg-slate-950 border cursor-pointer transition-all shadow-lg ${isSelected ? 'border-cyan-500 shadow-cyan-500/10 scale-[1.01]' : ficha.enEspera ? 'border-orange-500/50 shadow-orange-500/10' : 'border-slate-800 shadow-black/20'} p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}>
      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
        <div className={`shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-cyan-500 border-cyan-500' : 'border-slate-700'}`}>
          {isSelected && <Check size={14} className="text-slate-900" strokeWidth={4} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{ficha.serie ? `${ficha.serie}-` : '#'}{ficha.numero}</span>
            <span className="bg-purple-600/20 text-purple-400 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border border-purple-600/30 whitespace-nowrap">QR Pendiente</span>
            {ficha.enEspera && <span className="bg-orange-500/20 text-orange-500 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border border-orange-500/30 whitespace-nowrap">En Espera</span>}
          </div>
          <p className={`text-lg sm:text-xl font-black mt-0.5 sm:mt-1 ${ficha.monto === 30 ? 'text-pink-500' : 'text-cyan-400'}`}>{ficha.monto} Bs</p>
        </div>
      </div>
      <div className="flex items-stretch sm:items-center gap-2 w-full sm:w-auto pl-9 sm:pl-0 mt-1 sm:mt-0" onClick={(e) => e.stopPropagation()}>
        {ficha.enEspera ? (
          <button onClick={() => onQuitarEspera(ficha.id)} className="flex-1 sm:flex-none flex justify-center items-center p-2 sm:p-3 bg-red-600/20 text-red-500 rounded-xl hover:bg-red-600 hover:text-white border border-red-600/30" title="Quitar de Espera"><X size={20} /></button>
        ) : (
          <button onClick={() => onPonerEspera(ficha.id)} className="flex-1 sm:flex-none flex justify-center items-center p-2 sm:p-3 bg-orange-500/20 text-orange-500 rounded-xl hover:bg-orange-500 hover:text-white border border-orange-500/30" title="Poner en Espera"><Clock size={20} /></button>
        )}
        <button onClick={() => onReturn(ficha.id)} className="flex-1 sm:flex-none flex justify-center items-center p-2 sm:p-3 bg-slate-600/20 text-slate-400 rounded-xl hover:bg-slate-500 hover:text-white border border-slate-600/30" title="Devolver Ficha"><LogOut size={18} className="rotate-180" /></button>
        <button onClick={() => onPhoto(ficha.id)} className="flex-[2] sm:flex-none flex justify-center items-center px-3 sm:px-4 py-2 sm:py-3 bg-lime-500 hover:bg-lime-600 text-slate-900 font-bold uppercase tracking-wider rounded-xl transition-all gap-1 sm:gap-2 text-[10px] sm:text-sm shadow-lg shadow-lime-500/20 whitespace-nowrap"><Camera size={16} /> Foto</button>
      </div>
    </div>
  );
});

const FichaHistorialMZ = React.memo(({ ficha, activeTab, onMarcarPagado, onViewImage, onReturn, onDelete, onPonerEspera, onQuitarEspera }) => {
  return (
    <div className={`bg-slate-950 border ${ficha.enEspera ? 'border-orange-500/30' : 'border-slate-800'} p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-black/30 hover:border-slate-700 transition-colors`}>
      <div className="flex-1 w-full sm:w-auto">
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <span className="text-2xl sm:text-3xl font-black text-white">{ficha.serie ? `${ficha.serie}-` : '#'}{ficha.numero}</span>
          {ficha.estado === 'Pendiente' ? <span className="bg-orange-500/10 text-orange-400 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border border-orange-500/20">Pendiente</span> :
            ficha.estado === 'Anulada' ? <span className="bg-red-500/10 text-red-500 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border border-red-500/20">Anulada</span> :
              ficha.estado === 'Devuelta' ? <span className="bg-slate-600/20 text-slate-400 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border border-slate-600/30">Devuelta</span> :
                <span className="bg-lime-400/10 text-lime-400 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border border-lime-400/20">Pagado</span>}
          {ficha.enEspera && <span className="bg-orange-500/20 text-orange-500 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border border-orange-500/30">Espera</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-0.5 sm:mt-1">
          {ficha.monto > 0 ? <span className={`text-lg sm:text-xl font-black ${ficha.monto === 30 ? 'text-pink-500' : 'text-cyan-400'}`}>{ficha.monto} Bs</span> : <span className="text-lg sm:text-xl font-black text-slate-500">Sin Monto</span>}
          <span className="text-slate-500 text-xs font-bold tracking-widest ml-1 sm:ml-2">{new Date(ficha.createdAt).toLocaleTimeString()} <span className="uppercase mx-1">· {ficha.metodo}</span></span>
        </div>
      </div>
      <div className="flex items-stretch sm:items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0">
        {ficha.estado !== 'Devuelta' && ficha.estado !== 'Anulada' && (
          ficha.enEspera ? (
            <button onClick={() => onQuitarEspera(ficha.id)} className="flex-1 sm:flex-none flex justify-center items-center p-2 sm:p-3 bg-red-600/20 text-red-500 rounded-xl hover:bg-red-600 hover:text-white border border-red-600/30 transition-colors" title="Quitar de Espera"><X size={20} /></button>
          ) : (
            <button onClick={() => onPonerEspera(ficha.id)} className="flex-1 sm:flex-none flex justify-center items-center p-2 sm:p-3 bg-orange-500/20 text-orange-500 rounded-xl hover:bg-orange-500 hover:text-white border border-orange-500/30 transition-colors" title="Poner en Espera"><Clock size={20} /></button>
          )
        )}
        {ficha.estado === 'Pendiente' && activeTab === 'efectivo' && (
          <button onClick={() => onMarcarPagado(ficha.id)} className="flex-1 sm:flex-none flex justify-center items-center p-2 sm:p-3 bg-lime-500/20 text-lime-500 rounded-xl hover:bg-lime-500 hover:text-white border border-lime-500/30 transition-colors" title="Marcar como Pagado"><Check size={20} /></button>
        )}
        {ficha.comprobanteUrl && (
          <button onClick={() => onViewImage(ficha.comprobanteUrl)} className="flex-1 sm:flex-none flex justify-center items-center p-2 sm:p-3 bg-purple-500/20 text-purple-400 rounded-xl hover:bg-purple-500 hover:text-white border border-purple-500/30 transition-colors" title="Ver Comprobante"><Eye size={20} /></button>
        )}
        {ficha.estado !== 'Devuelta' && ficha.estado !== 'Anulada' && (
          <button onClick={() => onReturn(ficha.id)} className="flex-1 sm:flex-none flex justify-center items-center p-2 sm:p-3 bg-slate-600/20 text-slate-400 rounded-xl hover:bg-slate-500 hover:text-white border border-slate-600/30 transition-colors" title="Devolver Ficha"><LogOut size={20} className="rotate-180" /></button>
        )}
        <button onClick={() => onDelete(ficha.id)} className="flex-1 sm:flex-none flex justify-center items-center p-2 sm:p-3 bg-red-600/20 text-red-500 rounded-xl hover:bg-red-600 hover:text-white border border-red-600/30 transition-colors" title="Eliminar"><Trash2 size={20} /></button>
      </div>
    </div>
  );
});
